import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Job } from '@shared/types'
import Button from '@shared/components/Button'
import IconButton from '@shared/components/IconButton'
import { downloadCV } from '../services/cvGenerator'

interface JobItemProps {
  job: Job
  onDelete: (id: string) => void
  onGenerate: (id: string) => void
  generatedHTML: string | null
}

const formatDate = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const JobItem = ({ job, onDelete, onGenerate, generatedHTML }: JobItemProps) => {
  const handleDownload = async () => {
    if (!generatedHTML) return
    const { html, candidateName } = JSON.parse(generatedHTML)
    await downloadCV(html, `${candidateName}_cv.pdf`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className='flex items-start justify-between gap-2 p-3 rounded-xl border border-border bg-bg hover:border-navy-muted transition-colors'
    >
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-navy truncate'>{job.title}</p>
        <p className='text-xs text-navy-muted truncate'>{job.company}</p>
        <p className='text-xs text-navy-muted mt-0.5 opacity-60'>{formatDate(job.createdAt)}</p>
      </div>
      <div className='flex items-center gap-1 shrink-0'>
        {generatedHTML
          ? (
            <Button variant='primary' onClick={handleDownload} className='text-xs px-3 py-1.5'>
              Download CV
            </Button>
          ) : (
            <Button variant='primary' onClick={() => onGenerate(job.id)} className='text-xs px-3 py-1.5'>
              Generate CV
            </Button>
          )
        }
        <IconButton
          icon={Trash2}
          label='Delete job'
          variant='danger'
          onClick={() => onDelete(job.id)}
        />
      </div>
    </motion.div>
  )
}

export default JobItem
