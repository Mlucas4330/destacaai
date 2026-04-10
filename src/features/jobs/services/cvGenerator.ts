import { generateText, APICallError, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CVTemplate from '../components/CVTemplate'
import type { Config } from '@shared/types'
import { CVDataSchema, JobMetadataSchema } from '@shared/schemas'
import { z } from 'zod'

export class LLMError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'LLMError'
    this.status = status
  }
}

function createModel(config: Config) {
  if (config.provider === 'openai')
    return createOpenAI({ apiKey: config.apiKey })('gpt-4o')
  if (config.provider === 'anthropic')
    return createAnthropic({ apiKey: config.apiKey })('claude-sonnet-4-6')
  return createGoogleGenerativeAI({ apiKey: config.apiKey })('gemini-2.0-flash')
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString()

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}



export async function extractJobMetadata(
  description: string,
  config: Config,
): Promise<{ title: string; company: string }> {
  try {
    const extractorPrompt = await import('@/assets/extractorPrompt.md?raw')

    const { output } = await generateText({
      model: createModel(config),
      output: Output.object({
        schema: JobMetadataSchema,
      }),
      system: extractorPrompt.default,
      prompt: description,
    })
    return output
  } catch {
    return { title: '', company: '' }
  }
}

export async function generateCV(
  cvBuffer: ArrayBuffer,
  jobDescription: string,
  config: Config,
): Promise<{ html: string; candidateName: string }> {
  const cvText = await extractTextFromPDF(cvBuffer)

  let output: z.infer<typeof CVDataSchema>
  try {
    const cvPrompt = await import('@/assets/cvPrompt.md?raw')

    const result = await generateText({
      model: createModel(config),
      output: Output.object({
        schema: CVDataSchema,
      }),
      temperature: 0.5,
      system: cvPrompt.default,
      prompt: `[Original CV]:\n${cvText}\n\n[Job Description]:\n${jobDescription}`,
    })
    output = result.output
  } catch (err: unknown) {
    const status = APICallError.isInstance(err) ? (err.statusCode ?? 500) : 500
    const message = err instanceof Error ? err.message : String(err)
    throw new LLMError(status, message)
  }

  const candidateName = output.name.replaceAll(' ', '_').toLocaleLowerCase()
  const html = renderToStaticMarkup(createElement(CVTemplate, { data: output }))
  return { html, candidateName }
}

export async function downloadCV(html: string, filename: string): Promise<void> {
  try {
    const { default: html2pdf } = await import('html2pdf.js')
    await html2pdf()
      .set({
        filename,
        html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(html)
      .save()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(message)
  }
}