import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadCV, generateCV, LLMError } from '../services/cvGenerator'
import useSelectedJob from '../hooks/useSelectedJob'
import useCV from '@features/config/hooks/useCV'
import useConfig from '@features/config/hooks/useConfig'

interface GenerateCVProps {
  onSaveCV: (jobId: string, data: string) => void
}

const errorMessage = (err: unknown): string => {
  if (err instanceof LLMError) {
    if (err.status === 401) return 'Invalid API key. Please check your settings.'
    if (err.status === 429) return 'API quota exceeded. Please try again later.'
    return `API error (${err.status}). Please try again.`
  }
  if (err instanceof Error) return err.message
  return 'An unexpected error occurred.'
}

const GenerateCV = ({ onSaveCV }: GenerateCVProps) => {
  const navigate = useNavigate()
  const job = useSelectedJob()
  const { readCV } = useCV()
  const { config } = useConfig()
  const [generating, setGenerating] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (!job || ran.current) return
    ran.current = true
    setGenerating(true)

    const run = async () => {
      try {
        const buffer = await readCV()
        if (!buffer) throw new Error('No CV uploaded. Please upload your CV in Settings.')
        if (!config.apiKey) throw new Error('No API key configured. Please add one in Settings.')

        const { cvData, candidateName } = await generateCV(buffer, job.description, config)
        onSaveCV(job.id, JSON.stringify({ cvData, candidateName }))
        await downloadCV(cvData, `${candidateName}_cv.pdf`)
        navigate('/')
      } catch (err) {
        toast.error(errorMessage(err))
        navigate('/')
      }
    }

    run()
  }, [job])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className='flex flex-col items-center justify-center gap-3 py-12 px-6 text-center h-full'
    >
      {generating && (
        <>
          <RefreshCw size={20} className='text-accent-text animate-spin' />
          <p className='text-sm text-navy'>Generating your custom CV...</p>
          <p className='text-xs text-navy-muted'>This may take up to 2 minutes.</p>
        </>
      )}
    </motion.div>
  )
}

export default GenerateCV
