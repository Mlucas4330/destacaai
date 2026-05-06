import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import useAddJob from '../hooks/useAddJob'
import { useHasCv } from '@/features/config/hooks/useUser'
import { useAuthStore } from '@/features/auth/stores/auth'
import { chromeStorageClient } from '@/lib/storageClient'
import { STORAGE_KEYS } from '../constants'

const AddJob = () => {
  const navigate = useNavigate()
  const hasCv = useHasCv()
  const { isSignedIn } = useAuthStore()

  const {
    register,
    formState,
    onSubmit,
    extractFromDescription,
    description,
    isExtracting,
    isPending,
  } = useAddJob()

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

      <form onSubmit={onSubmit} className='flex flex-col gap-3'>
        <Input
          id='job-title'
          label='Job Title'
          placeholder='e.g. Senior Frontend Engineer'
          autoComplete='organization-title'
          error={formState.errors.title?.message}
          {...register('title')}
        />
        <Input
          id='job-company'
          label='Company'
          placeholder='e.g. Acme Corp'
          autoComplete='organization'
          error={formState.errors.company?.message}
          {...register('company')}
        />
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <label htmlFor='job-description' className='text-xs font-medium text-navy-muted'>Job Description</label>
            {isSignedIn && (
              <button
                type='button'
                onClick={extractFromDescription}
                disabled={!description?.trim() || isExtracting}
                className='flex items-center gap-1 text-xs text-accent-text hover:opacity-75 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'
              >
                <Sparkles size={11} />
                {isExtracting ? 'Extracting...' : 'Extract with AI'}
              </button>
            )}
          </div>
          <textarea
            id='job-description'
            placeholder='Paste the job description here...'
            rows={6}
            className='px-3 py-2 rounded-xl border border-border focus:border-navy-muted bg-bg text-sm outline-none transition-colors resize-none'
            {...register('description')}
          />
          {formState.errors.description && (
            <span className='text-xs text-danger'>{formState.errors.description.message}</span>
          )}
        </div>

        {!hasCv && (
          <p className='text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
            You need to upload your CV in Settings before saving jobs.
          </p>
        )}

        <div className='flex gap-2'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => {
              chromeStorageClient.remove([STORAGE_KEYS.PENDING_DESCRIPTION, STORAGE_KEYS.PENDING_TITLE, STORAGE_KEYS.PENDING_COMPANY])
              navigate('/')
            }}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isPending || isExtracting || !hasCv}
            className='flex-1'
          >
            {isPending ? 'Saving...' : isExtracting ? 'Extracting...' : 'Save Job'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default AddJob
