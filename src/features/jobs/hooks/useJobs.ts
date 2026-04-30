import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { localStorageClient } from '@/lib/localStorageClient'
import toast from 'react-hot-toast'
import * as jobsApi from '@/features/jobs/api/jobs'
import { CACHE_KEYS, QUERY_KEYS, POLLING_INTERVAL_MS } from '@/features/jobs/constants'
import type { Job, JobStatus } from '@/shared/types'

export function useJobs() {
  const result = useQuery({
    queryKey: [QUERY_KEYS.JOBS],
    queryFn: () => jobsApi.getJobs(),
    staleTime: 60_000,
    initialData: () => localStorageClient.get<Job[]>(CACHE_KEYS.JOBS),
    initialDataUpdatedAt: () => Number(localStorageClient.get<number>(CACHE_KEYS.JOBS_TS) ?? 0),
    refetchInterval: (query) => {
      const jobs = query.state.data
      if (!jobs) return false
      const hasPending = jobs.some(
        (j) =>
          j.atsStatus === 'queued' ||
          j.atsStatus === 'processing' ||
          j.cvGenerationStatus === 'queued' ||
          j.cvGenerationStatus === 'processing' ||
          j.generatedCvAtsStatus === 'queued' ||
          j.generatedCvAtsStatus === 'processing',
      )
      return hasPending ? POLLING_INTERVAL_MS : false
    },
  })

  useEffect(() => {
    if (result.data) {
      localStorageClient.set(CACHE_KEYS.JOBS, result.data)
      localStorageClient.set(CACHE_KEYS.JOBS_TS, Date.now())
    }
  }, [result.data])

  return result
}

export function useCreateJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; company: string; description: string }) =>
      jobsApi.createJob(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to save job. Please try again.'),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => jobsApi.deleteJob(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to delete job. Please try again.'),
  })
}

export function useClearJobs() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => jobsApi.clearJobs(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to clear jobs. Please try again.'),
  })
}

export function useUpdateJobStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      jobsApi.updateJobStatus(jobId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to update status. Please try again.'),
  })
}
