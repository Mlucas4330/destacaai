import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Job } from '@shared/types'
import Input from '@shared/components/Input'
import Button from '@shared/components/Button'
import useAddJob from '../hooks/useAddJob'

interface AddJobProps {
  onSave: (job: Job) => void
}

const AddJob = ({ onSave }: AddJobProps) => {
  const navigate = useNavigate()

  const handleSave = (job: Job) => {
    onSave(job)
    navigate(`/generate/${job.id}`)
  }

  const {
    title,
    company,
    description,
    updateTitle,
    updateCompany,
    updateDescription,
    saveJob,
    isValid,
  } = useAddJob(handleSave)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className='flex flex-col gap-4 p-4'
    >
      <div>
        <h2 className='text-sm font-semibold text-navy'>Add Job</h2>
        <p className='text-xs text-navy-muted mt-0.5'>Fill in the details for this position.</p>
      </div>

      <div className='flex flex-col gap-3'>
        <Input
          label='Job Title'
          value={title}
          onChange={updateTitle}
          placeholder='e.g. Senior Frontend Engineer'
        />
        <Input
          label='Company'
          value={company}
          onChange={updateCompany}
          placeholder='e.g. Acme Corp'
        />
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-navy-muted'>Job Description</label>
          <textarea
            value={description}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder='Paste the job description here...'
            rows={6}
            className='px-3 py-2 rounded-xl border border-border focus:border-navy-muted bg-bg text-sm outline-none transition-colors resize-none'
          />
        </div>
      </div>

      <div className='flex gap-2'>
        <Button variant='secondary' onClick={() => navigate('/')} className='flex-1'>
          Cancel
        </Button>
        <Button type='submit' onClick={saveJob} disabled={!isValid} className='flex-1'>
          Save Job
        </Button>
      </div>
    </motion.div>
  )
}

export default AddJob
