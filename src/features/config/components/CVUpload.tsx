import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import IconButton from '@shared/components/IconButton'

interface CVUploadProps {
  fileName: string | null
  error: string | null
  onUpload: (file: File) => void
  onRemove: () => void
}

const CVUpload = ({ fileName, error, onUpload, onRemove }: CVUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (error) {
    toast.error(error)
  }

  return (
    <div className='flex flex-col gap-1'>
      <label className='text-xs font-medium text-navy-muted'>CV (PDF)</label>

      <AnimatePresence mode='wait'>
        {fileName ? (
          <motion.div
            key='uploaded'
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className='flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-surface'
          >
            <div className='flex items-center gap-2 min-w-0'>
              <FileText size={14} className='text-accent-text shrink-0' />
              <span className='text-xs text-navy truncate'>{fileName}</span>
            </div>
            <IconButton icon={Trash2} label='Remove CV' variant='danger' onClick={onRemove} size={14} />
          </motion.div>
        ) : (
          <motion.button
            key='upload'
            type='button'
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.98 }}
            className='flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-border hover:border-navy-muted hover:bg-surface transition-colors cursor-pointer'
          >
            <Upload size={14} className='text-navy-muted' />
            <span className='text-xs text-navy-muted'>Upload PDF (max 10 MB)</span>
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type='file'
        accept='application/pdf'
        onChange={handleChange}
        className='hidden'
      />
    </div>
  )
}

export default CVUpload
