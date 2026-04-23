import ConfigForm from '@features/config/components/ConfigForm'
import { useClearJobs } from '@features/jobs/hooks/useJobs'
import { useDeleteCV } from '@features/config/hooks/useUser'
import Button from '@shared/components/Button'

const Config = () => {
  const clearJobs = useClearJobs()
  const deleteCV = useDeleteCV()

  const handleClearAll = () => {
    clearJobs.mutate()
    deleteCV.mutate()
    chrome.storage.local.clear()
  }

  return (
    <div className='flex flex-col gap-6 p-4'>
      <div>
        <h2 className='text-sm font-semibold text-navy'>Settings</h2>
        <p className='text-xs text-navy-muted mt-0.5'>Changes are saved automatically.</p>
      </div>

      <ConfigForm />

      <div className='border-t border-border pt-4'>
        <Button variant='danger' onClick={handleClearAll} className='w-full'>
          Clear all data
        </Button>
      </div>
    </div>
  )
}

export default Config
