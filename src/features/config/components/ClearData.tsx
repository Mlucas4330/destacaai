import { useClearJobs } from "@/features/jobs/hooks/useJobs"
import Button from "@/shared/components/Button"
import { useDeleteCV } from "../hooks/useUser"
import { localStorageClient } from "@/lib/localStorageClient"
import { chromeStorageClient } from "@/lib/chromeStorageClient"
import { CACHE_KEYS as JOB_CACHE_KEYS } from "@/features/jobs/constants"
import { CACHE_KEYS as USER_CACHE_KEYS } from "@/features/config/constants"
import { STORAGE_KEYS } from "@/shared/constants"

const ClearData = () => {
  const clearJobs = useClearJobs()
  const deleteCV = useDeleteCV()

  const handleClearAll = () => {
    clearJobs.mutate()
    deleteCV.mutate()
    localStorageClient.remove([
      JOB_CACHE_KEYS.JOBS,
      JOB_CACHE_KEYS.JOBS_TS,
      USER_CACHE_KEYS.USER,
      USER_CACHE_KEYS.USER_TS,
    ])
    chromeStorageClient.remove([
      STORAGE_KEYS.PENDING_DESCRIPTION,
      STORAGE_KEYS.PENDING_TITLE,
      STORAGE_KEYS.PENDING_COMPANY,
    ])
  }

  return (
    <Button variant='danger' onClick={handleClearAll} className='w-full'>
      Clear all data
    </Button>
  )
}

export default ClearData
