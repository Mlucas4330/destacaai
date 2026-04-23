import { Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { generateText, Output } from 'ai'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createElement, type ReactElement } from 'react'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import { db } from '../db/client.js'
import { jobs, users } from '../db/schema.js'
import { connection } from '../lib/queue.js'
import { getModelForTier } from '../lib/llm.js'
import { getR2Object, uploadToR2 } from '../lib/r2.js'
import { CVDataSchema } from '../shared/schemas.js'
import { extractTextFromPDF } from './atsProcessor.js'
import CVTemplatePDF from './cvTemplate.js'
import type { CVGenerationJobData } from '../lib/queue.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const cvWorker = new Worker<CVGenerationJobData>(
  'cv-generation',
  async (job) => {
    const { jobId, userId, userTier, jobDescription, cvR2Key } = job.data

    await db.update(jobs).set({ cvGenerationStatus: 'processing' }).where(eq(jobs.id, jobId))

    const cvBuffer = await getR2Object(cvR2Key)
    const cvText = await extractTextFromPDF(cvBuffer)

    const promptPath = path.join(__dirname, '../assets/cvPrompt.md')
    const systemPrompt = await readFile(promptPath, 'utf-8')

    const { output } = await generateText({
      model: getModelForTier(userTier),
      output: Output.object({ schema: CVDataSchema }),
      temperature: 0,
      system: systemPrompt,
      prompt: `[Original CV]:\n${cvText}\n\n[Job Description]:\n${jobDescription}`,
    })

    const pdfBlob = await pdf(
      createElement(CVTemplatePDF, { data: output }) as unknown as ReactElement<DocumentProps>,
    ).toBlob()
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    const r2Key = `generated-cvs/${userId}/${jobId}.pdf`
    await uploadToR2(r2Key, pdfBuffer, 'application/pdf')

    await db.update(jobs).set({ cvGenerationStatus: 'done', cvR2Key: r2Key }).where(eq(jobs.id, jobId))
    await db.update(users).set({
      generationsUsedThisMonth: (await db.query.users.findFirst({ where: eq(users.id, userId) }))!
        .generationsUsedThisMonth + 1,
    }).where(eq(users.id, userId))
  },
  {
    connection,
    concurrency: 3,
    limiter: { max: 25, duration: 60_000 },
  },
)

cvWorker.on('failed', async (job, err) => {
  if (job) {
    await db.update(jobs).set({
      cvGenerationStatus: 'failed',
      cvGenerationError: err.message,
    }).where(eq(jobs.id, job.data.jobId))
  }
  console.error('CV generation job failed', job?.id, err.message)
})
