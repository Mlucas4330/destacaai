import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X } from 'lucide-react'
import { useAuthContext } from '@features/auth/context/AuthContext'
import type { Job, JobStatus } from '@shared/types'
import Button from '@shared/components/Button'
import IconButton from '@shared/components/IconButton'
import toast from 'react-hot-toast'
import { useUpdateJobStatus } from '../hooks/useJobs'
import { useGenerationStatus } from '../hooks/useGenerateCV'
import { useUser } from '@features/config/hooks/useUser'

const STATUS_LABELS: Record<JobStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer',
}

const STATUS_COLORS: Record<JobStatus, string> = {
  saved: 'bg-border text-navy-muted',
  applied: 'bg-accent text-navy',
  interview: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-700',
  offer: 'bg-green-100 text-green-700',
}

const STATUS_BORDER: Record<JobStatus, string> = {
  saved: 'border-l-gray-300',
  applied: 'border-l-accent',
  interview: 'border-l-blue-400',
  rejected: 'border-l-red-400',
  offer: 'border-l-green-400',
}

const formatDate = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const scoreColor = (score: number) =>
  score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'

interface JobItemProps {
  job: Job
  onDelete: (id: string) => void
  onGenerate: (id: string) => void
}

const JobItem = ({ job, onDelete, onGenerate }: JobItemProps) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [expandedUploaded, setExpandedUploaded] = useState(false)
  const [expandedGenerated, setExpandedGenerated] = useState(false)
  const updateStatus = useUpdateJobStatus()
  const { getToken } = useAuthContext()

  const isGenerating = job.cvGenerationStatus === 'queued' || job.cvGenerationStatus === 'processing'
  const { data: genStatus } = useGenerationStatus(job.id, isGenerating)
  const { data: user } = useUser()

  const handleDownload = async () => {
    try {
      const token = await getToken()
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/generate/${job.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const firstName = user?.firstName?.toLocaleLowerCase()
      const lastName = user?.lastName?.toLocaleLowerCase()
      const userName = firstName && lastName ? `${firstName}_${lastName}` : (user?.email.split('@')[0] ?? 'cv')
      a.href = blobUrl
      a.download = `${userName}_cv.pdf`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error('Failed to download CV. Please try again.')
    }
  }

  const cvDone = job.cvGenerationStatus === 'done' || genStatus?.status === 'done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      onClick={() => setShowStatusMenu((v) => !v)}
      className={`relative cursor-pointer flex flex-col gap-2 p-3 rounded-xl border border-border border-l-4 ${STATUS_BORDER[job.status]} bg-bg transition-colors`}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-navy truncate' title={job.title}>
            {job.title}
          </p>
          <p className='text-xs text-navy-muted opacity-70 mt-0.5'>
            {job.company} · {formatDate(job.createdAt)}
          </p>

          <div className='flex items-center gap-3 mt-1.5'>
            {job.atsStatus === 'queued' || job.atsStatus === 'processing' ? (
              <p className='text-xs text-navy-muted opacity-60'>Base scoring...</p>
            ) : job.atsStatus === 'done' && job.atsScore !== null ? (
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedUploaded((v) => !v) }}
                className='text-xs font-medium text-navy-muted hover:opacity-80 transition-opacity'
              >
                Base: <span className={scoreColor(job.atsScore)}>{job.atsScore}/100</span>
              </button>
            ) : job.atsStatus === 'failed' ? (
              <p className='text-xs text-red-400 opacity-80'>Base score failed</p>
            ) : null}

            {job.generatedCvAtsStatus === 'queued' || job.generatedCvAtsStatus === 'processing' ? (
              <p className='text-xs text-navy-muted opacity-60'>Tailored scoring...</p>
            ) : job.generatedCvAtsStatus === 'done' && job.generatedCvAtsScore !== null ? (
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedGenerated((v) => !v) }}
                className='text-xs font-medium text-navy-muted hover:opacity-80 transition-opacity'
              >
                Tailored: <span className={scoreColor(job.generatedCvAtsScore)}>{job.generatedCvAtsScore}/100</span>
              </button>
            ) : job.generatedCvAtsStatus === 'failed' ? (
              <p className='text-xs text-red-400 opacity-80'>Tailored failed</p>
            ) : null}
          </div>

          <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
            {STATUS_LABELS[job.status]}
          </span>
        </div>

        <div className='flex items-center gap-1 shrink-0' onClick={(e) => e.stopPropagation()}>
          {cvDone ? (
            <Button variant='primary' onClick={handleDownload} className='text-xs px-3 py-1.5'>
              Download CV
            </Button>
          ) : isGenerating ? (
            <Button variant='secondary' disabled className='text-xs px-3 py-1.5 opacity-60'>
              Generating...
            </Button>
          ) : (
            <Button variant='primary' onClick={() => onGenerate(job.id)} className='text-xs px-3 py-1.5'>
              Generate CV
            </Button>
          )}
          <IconButton
            icon={Trash2}
            label='Delete job'
            variant='danger'
            onClick={() => onDelete(job.id)}
          />
        </div>
      </div>

      <AnimatePresence>
        {expandedUploaded && job.atsExplanation && (
          <motion.div
            key='uploaded'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className='overflow-hidden'
          >
            <div className='relative text-xs text-navy-muted bg-surface border border-border rounded-lg p-2 pr-6 leading-relaxed'>
              <span className='font-medium text-navy'>Base: </span>{job.atsExplanation}
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedUploaded(false) }}
                className='absolute top-1.5 right-1.5 text-navy-muted hover:text-navy transition-colors'
                aria-label='Close explanation'
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
        {expandedGenerated && job.generatedCvAtsExplanation && (
          <motion.div
            key='generated'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className='overflow-hidden'
          >
            <div className='relative text-xs text-navy-muted bg-surface border border-border rounded-lg p-2 pr-6 leading-relaxed'>
              <span className='font-medium text-navy'>Tailored: </span>{job.generatedCvAtsExplanation}
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedGenerated(false) }}
                className='absolute top-1.5 right-1.5 text-navy-muted hover:text-navy transition-colors'
                aria-label='Close explanation'
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatusMenu && (
          <motion.div
            key='status'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className='overflow-hidden'
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className='flex flex-wrap gap-1.5 bg-surface border border-border rounded-lg p-2'
            >
              {(Object.keys(STATUS_LABELS) as JobStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    updateStatus.mutate({ jobId: job.id, status: s })
                    setShowStatusMenu(false)
                  }}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-opacity hover:opacity-80 ${STATUS_COLORS[s]} ${job.status === s ? 'ring-1 ring-offset-1 ring-current' : ''}`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default JobItem
