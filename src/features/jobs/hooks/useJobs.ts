import { useState, useCallback, useEffect } from 'react'
import type { Job } from '@shared/types'
import { MAX_JOBS } from '@shared/constants'

const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    chrome.storage.local.get('jobs', (result: { jobs?: Job[] }) => {
      setJobs(result.jobs ?? [])
    })
  }, [])

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => {
      if (prev.length >= MAX_JOBS) {
        throw new Error(`You can save up to ${MAX_JOBS} jobs.`)
      }
      if (prev.some((j) => j.id === job.id)) {
        throw new Error('This job is already saved.')
      }
      const updated = [job, ...prev]
      chrome.storage.local.set({ jobs: updated })
      return updated
    })
  }, [])

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => {
      const updated = prev.filter((j) => j.id !== id)
      chrome.storage.local.set({ jobs: updated })
      return updated
    })
  }, [])

  const clearJobs = useCallback(() => {
    setJobs([])
    chrome.storage.local.set({ jobs: [] })
  }, [])

  return { jobs, addJob, deleteJob, clearJobs }
}

export default useJobs
