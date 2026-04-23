import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { generateText, Output } from 'ai'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { db } from '../db/client.js'
import { jobs, users } from '../db/schema.js'
import { atsQueue } from '../lib/queue.js'
import { getLightweightModel } from '../lib/llm.js'
import { authMiddleware } from '../middleware/auth.js'
import { JobMetadataSchema } from '../shared/schemas.js'
import type { ATSScoringJobData } from '../lib/queue.js'

type Variables = { userId: string }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/', async (c) => {
  const userId = c.get('userId')
  const userJobs = await db.query.jobs.findMany({
    where: eq(jobs.userId, userId),
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
  })
  return c.json({ jobs: userJobs })
})

app.post('/extract', async (c) => {
  const { description } = await c.req.json<{ description: string }>()
  if (!description?.trim()) return c.json({ error: 'description is required' }, 400)
  const result = await extractMetadata(description)
  return c.json(result)
})

app.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ title: string; company: string; description: string }>()

  let { title, company } = body
  const { description } = body

  if (!description?.trim()) {
    return c.json({ error: 'description is required' }, 400)
  }

  const existing = await db.query.jobs.findFirst({
    where: and(eq(jobs.userId, userId), eq(jobs.description, description.trim())),
  })
  if (existing) return c.json({ error: 'Job already exists', jobId: existing.id }, 409)

  if (!title?.trim() || !company?.trim()) {
    const extracted = await extractMetadata(description)
    if (!title?.trim()) title = extracted.title
    if (!company?.trim()) company = extracted.company
  }

  const [job] = await db
    .insert(jobs)
    .values({ userId, title: title.trim(), company: company.trim(), description: description.trim() })
    .returning()

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (user?.cvR2Key) {
    await atsQueue.add('score-ats', {
      jobId: job.id,
      userId,
      jobDescription: description,
      cvR2Key: user.cvR2Key,
    } satisfies ATSScoringJobData)

    await db.update(jobs).set({ atsStatus: 'queued' }).where(eq(jobs.id, job.id))
  }

  return c.json({ ...job, atsStatus: user?.cvR2Key ? 'queued' : 'idle' }, 201)
})

app.delete('/', async (c) => {
  const userId = c.get('userId')
  await db.delete(jobs).where(eq(jobs.userId, userId))
  return c.json({ success: true })
})

app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const jobId = c.req.param('id')
  await db.delete(jobs).where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
  return c.json({ success: true })
})

app.patch('/:id/status', async (c) => {
  const userId = c.get('userId')
  const jobId = c.req.param('id')
  const { status } = await c.req.json<{
    status: 'saved' | 'applied' | 'interview' | 'rejected' | 'offer'
  }>()

  const [updated] = await db
    .update(jobs)
    .set({ status })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning({ id: jobs.id, status: jobs.status })

  if (!updated) return c.json({ error: 'Job not found' }, 404)
  return c.json(updated)
})

async function extractMetadata(description: string): Promise<{ title: string; company: string }> {
  try {
    const promptPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../assets/extractorPrompt.md',
    )
    const systemPrompt = await readFile(promptPath, 'utf-8')

    const { output } = await generateText({
      model: getLightweightModel(),
      output: Output.object({ schema: JobMetadataSchema }),
      temperature: 0.5,
      system: systemPrompt,
      prompt: description,
    })
    return output
  } catch {
    return { title: '', company: '' }
  }
}

export default app
