import { useClearJobs } from "@/features/jobs/hooks/useJobs"
import Button from "@/shared/components/Button"
import { useDeleteCV } from "../hooks/useUser"
import * as localStorage from "@/lib/localStorage"
import * as chromeStorage from "@/lib/chromeStorage"

const ClearData = () => {
  const clearJobs = useClearJobs()
  const deleteCV = useDeleteCV()

  const handleClearAll = () => {
    clearJobs.mutate()
    deleteCV.mutate()
    localStorage.clear()
    chromeStorage.clear()
  }

  return (
    <Button variant='danger' onClick={handleClearAll} className='w-full'>
      Clear all data
    </Button>
  )
}

export default ClearData