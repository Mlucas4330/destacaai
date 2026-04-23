import { Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { generateText, Output } from 'ai'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { db } from '../db/client.js'
import { jobs } from '../db/schema.js'
import { connection } from '../lib/queue.js'
import { getLightweightModel } from '../lib/llm.js'
import { getR2Object } from '../lib/r2.js'
import { ATSResultSchema } from '../shared/schemas.js'
import type { ATSScoringJobData } from '../lib/queue.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
GlobalWorkerOptions.workerSrc = pathToFileURL(path.join(__dirname, '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')).href

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const doc = await getDocument({ data: new Uint8Array(buffer) }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}

export const atsWorker = new Worker<ATSScoringJobData>(
  'ats-scoring',
  async (job) => {
    const { jobId, jobDescription, cvR2Key } = job.data

    await db.update(jobs).set({ atsStatus: 'processing' }).where(eq(jobs.id, jobId))

    const cvBuffer = await getR2Object(cvR2Key)
    const cvText = await extractTextFromPDF(cvBuffer)

    const promptPath = path.join(__dirname, '../assets/atsPrompt.md')
    const systemPrompt = await readFile(promptPath, 'utf-8')

    const { output } = await generateText({
      model: getLightweightModel(),
      output: Output.object({ schema: ATSResultSchema }),
      temperature: 0,
      system: systemPrompt,
      prompt: `[CV]:\n${cvText}\n\n[Job Description]:\n${jobDescription}`,
    })

    await db.update(jobs).set({
      atsScore: output.score,
      atsExplanation: output.explanation,
      atsStatus: 'done',
    }).where(eq(jobs.id, jobId))
  },
  {
    connection,
    concurrency: 10,
  },
)

atsWorker.on('failed', async (job, err) => {
  if (job) {
    await db.update(jobs).set({ atsStatus: 'failed' }).where(eq(jobs.id, job.data.jobId))
  }
  console.error('ATS job failed', job?.id, err.message)
})
