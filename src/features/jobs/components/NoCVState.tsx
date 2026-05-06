import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/shared/components/Button'

const NoCVState = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className='flex flex-col items-center justify-center gap-3 py-12 px-6 text-center'
    >
      <div className='p-3 rounded-full bg-surface'>
        <FileText size={24} className='text-navy-muted' />
      </div>
      <div>
        <p className='text-sm font-medium text-navy'>No CV uploaded yet</p>
        <p className='text-xs text-navy-muted mt-1'>Upload your CV to start generating tailored applications.</p>
      </div>
      <Button variant='primary' className='text-xs px-4' onClick={() => navigate('/config')}>
        Upload CV
      </Button>
    </motion.div>
  )
}

export default NoCVState
