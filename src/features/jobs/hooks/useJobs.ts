import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as jobsApi from '../api'
import { QUERY_KEYS, POLLING_INTERVAL_MS } from '../constants'
import { QUERY_KEYS as CONFIG_QUERY_KEYS } from '@/features/config/constants'
import type { Job, JobStatus } from '../types'

export function useJobs() {
  const qc = useQueryClient()
  const prevStatusByIdRef = useRef<Map<string, Job['cvGenerationStatus']>>(new Map())

  const query = useQuery({
    queryKey: [QUERY_KEYS.JOBS],
    queryFn: () => jobsApi.getJobs(),
    staleTime: 60_000,
    refetchInterval: (q) => {
      const jobs = q.state.data
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
    const jobs = query.data
    if (!jobs) return
    const prev = prevStatusByIdRef.current
    const isFirstRun = prev.size === 0
    const completed = !isFirstRun && jobs.some((j) => prev.get(j.id) !== 'done' && j.cvGenerationStatus === 'done')
    const next = new Map<string, Job['cvGenerationStatus']>()
    for (const j of jobs) next.set(j.id, j.cvGenerationStatus)
    prevStatusByIdRef.current = next
    if (completed) qc.refetchQueries({ queryKey: [CONFIG_QUERY_KEYS.USER] })
  }, [query.data, qc])

  return query
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
    onMutate: async (jobId) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.JOBS] })
      const prev = qc.getQueryData<Job[]>([QUERY_KEYS.JOBS])
      qc.setQueryData<Job[]>([QUERY_KEYS.JOBS], (old) => old?.filter((j) => j.id !== jobId) ?? [])
      return { prev }
    },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData([QUERY_KEYS.JOBS], ctx.prev)
      toast.error(err.message ?? 'Failed to delete job. Please try again.')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
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
    onMutate: async ({ jobId, status }) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.JOBS] })
      const prev = qc.getQueryData<Job[]>([QUERY_KEYS.JOBS])
      qc.setQueryData<Job[]>([QUERY_KEYS.JOBS], (old) =>
        old?.map((j) => (j.id === jobId ? { ...j, status } : j)) ?? []
      )
      return { prev }
    },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData([QUERY_KEYS.JOBS], ctx.prev)
      toast.error(err.message ?? 'Failed to update status. Please try again.')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
  })
}

export function useDownloadCV(jobId: string) {
  return useMutation({
    mutationFn: () => jobsApi.downloadGeneratedCV(jobId),
    onSuccess: ({ blob, fileName }) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      a.click()
      URL.revokeObjectURL(blobUrl)
    },
    onError: () => toast.error('Failed to download CV. Please try again.'),
  })
}
