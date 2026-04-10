import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { Job } from '@shared/types'

const useSelectedJob = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    chrome.storage.local.get('jobs', (result: { jobs?: Job[] }) => {
      const found = (result.jobs ?? []).find((j) => j.id === jobId) ?? null
      setJob(found)
    })
  }, [jobId])

  return job
}

export default useSelectedJob
