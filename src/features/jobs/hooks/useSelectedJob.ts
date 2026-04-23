import { useParams } from 'react-router-dom'
import { useJobs } from './useJobs'
import type { Job } from '@shared/types'

const useSelectedJob = (): Job | null => {
  const { jobId } = useParams<{ jobId: string }>()
  const { data: jobs } = useJobs()
  return jobs?.find((j) => j.id === jobId) ?? null
}

export default useSelectedJob
