import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className='flex flex-col items-center justify-center gap-3 py-12 px-6 text-center'
    >
      <div className='p-3 rounded-full bg-surface'>
        <Briefcase size={24} className='text-navy-muted' />
      </div>
      <div>
        <p className='text-sm font-medium text-navy'>No saved jobs yet</p>
        <p className='text-xs text-navy-muted mt-1'>
          Right-click a job description on LinkedIn to get started.
        </p>
      </div>
    </motion.div>
  )
}

export default EmptyState
