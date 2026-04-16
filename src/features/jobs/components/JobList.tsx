import { AnimatePresence, motion } from 'framer-motion'
import type { Job } from '@shared/types'
import JobItem from './JobItem'

interface JobListProps {
  jobs: Job[]
  onDelete: (id: string) => void
  onGenerate: (id: string) => void
  onClearAll: () => void
  generatedCVs: Record<string, string>
}

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const JobList = ({ jobs, onDelete, onGenerate, onClearAll, generatedCVs }: JobListProps) => {
  return (
    <div className='flex flex-col gap-2 p-3'>
      <div className='flex items-center justify-between mb-1'>
        <p className='text-xs text-navy-muted'>{jobs.length}/5 jobs saved</p>
        <motion.button
          type='button'
          onClick={onClearAll}
          whileTap={{ scale: 0.95 }}
          className='text-xs text-navy-muted hover:text-danger transition-colors cursor-pointer'
        >
          Clear all
        </motion.button>
      </div>
      <motion.div
        className='flex flex-col gap-2'
        variants={listVariants}
        initial='hidden'
        animate='visible'
      >
        <AnimatePresence initial={false}>
          {jobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              onDelete={onDelete}
              onGenerate={onGenerate}
              generatedData={generatedCVs[job.id] ?? null}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default JobList
