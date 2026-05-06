import { useClearJobs } from '@/features/jobs/hooks/useJobs'
import Button from '@/shared/components/Button'
import { useDeleteCV } from '../hooks/useUser'
import { chromeStorageClient } from '@/lib/storageClient'
import { STORAGE_KEYS as JOB_STORAGE_KEYS } from '@/features/jobs/constants'

const ClearData = () => {
  const clearJobs = useClearJobs()
  const deleteCV = useDeleteCV()

  const handleClearAll = () => {
    clearJobs.mutate()
    deleteCV.mutate()
    chromeStorageClient.remove([
      JOB_STORAGE_KEYS.PENDING_DESCRIPTION,
      JOB_STORAGE_KEYS.PENDING_TITLE,
      JOB_STORAGE_KEYS.PENDING_COMPANY,
    ])
  }

  return (
    <Button variant='danger' onClick={handleClearAll} className='w-full'>
      Clear all data
    </Button>
  )
}

export default ClearData
