import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@features/auth/context/AuthContext'
import { useGuestContext } from '@features/auth/context/GuestContext'
import toast from 'react-hot-toast'
import { createApiClient } from '@lib/api'
import { CACHE_KEYS } from '@lib/cache'
import type { Job, JobStatus, GuestJob } from '@shared/types'
import { POLLING_INTERVAL_MS, QUERY_KEYS } from '@shared/constants'

function readJobsCache(): Job[] | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.JOBS)
    return raw ? (JSON.parse(raw) as Job[]) : undefined
  } catch {
    return undefined
  }
}

function useApi() {
  const { getToken } = useAuthContext()
  return createApiClient(getToken)
}

export function guestJobToJob(g: GuestJob): Job {
  return {
    id: g.id,
    userId: 'guest',
    title: g.title,
    company: g.company,
    description: g.description,
    status: g.status,
    atsStatus: 'idle',
    atsScore: null,
    atsExplanation: null,
    cvGenerationStatus: g.cvGenerationStatus,
    cvGenerationError: null,
    cvR2Key: g.cvR2Key,
    createdAt: g.createdAt,
    generatedCvAtsStatus: 'idle',
    generatedCvAtsScore: null,
    generatedCvAtsExplanation: null,
  }
}

export function useJobs() {
  const { isSignedIn } = useAuthContext()
  const { guestJobs } = useGuestContext()
  const api = useApi()

  const result = useQuery({
    queryKey: [QUERY_KEYS.JOBS],
    queryFn: () => api.get<{ jobs: Job[] }>('/jobs').then((r) => r.jobs),
    enabled: isSignedIn,
    staleTime: 60_000,
    initialData: readJobsCache,
    initialDataUpdatedAt: () => Number(localStorage.getItem(CACHE_KEYS.JOBS_TS) ?? 0),
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
    if (isSignedIn && result.data) {
      localStorage.setItem(CACHE_KEYS.JOBS, JSON.stringify(result.data))
      localStorage.setItem(CACHE_KEYS.JOBS_TS, String(Date.now()))
    }
  }, [isSignedIn, result.data])

  if (!isSignedIn) {
    return {
      data: guestJobs.map(guestJobToJob),
      isLoading: false,
      isFetching: false,
    } as ReturnType<typeof useQuery<Job[]>>
  }

  return result
}

export function useCreateJob() {
  const { isSignedIn } = useAuthContext()
  const { addGuestJob } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: (data: { title: string; company: string; description: string }) => api.post<Job>('/jobs', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to save job. Please try again.'),
  })

  if (!isSignedIn) {
    return {
      mutate: (
        data: { title: string; company: string; description: string },
        opts?: { onSuccess?: (job: Job) => void },
      ) => {
        const guestJob: GuestJob = {
          id: crypto.randomUUID(),
          title: data.title,
          company: data.company,
          description: data.description,
          status: 'saved',
          createdAt: new Date().toISOString(),
          cvGenerationStatus: 'idle',
          cvR2Key: null,
        }
        addGuestJob(guestJob).then(() => opts?.onSuccess?.(guestJobToJob(guestJob)))
      },
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>
  }

  return apiMutation
}

export function useDeleteJob() {
  const { isSignedIn } = useAuthContext()
  const { deleteGuestJob } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: (jobId: string) => api.delete(`/jobs/${jobId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to delete job. Please try again.'),
  })

  if (!isSignedIn) {
    return {
      mutate: (jobId: string) => { deleteGuestJob(jobId) },
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>
  }

  return apiMutation
}

export function useClearJobs() {
  const { isSignedIn } = useAuthContext()
  const { clearGuestJobs } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: () => api.delete('/jobs'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to clear jobs. Please try again.'),
  })

  if (!isSignedIn) {
    return {
      mutate: () => { clearGuestJobs() },
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>
  }

  return apiMutation
}

export function useUpdateJobStatus() {
  const { isSignedIn } = useAuthContext()
  const { updateGuestJob } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      api.patch<{ id: string; status: JobStatus }>(`/jobs/${jobId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    onError: (err) => toast.error(err.message ?? 'Failed to update status. Please try again.'),
  })

  if (!isSignedIn) {
    return {
      mutate: ({ jobId, status }: { jobId: string; status: JobStatus }) => {
        updateGuestJob(jobId, { status })
      },
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>
  }

  return apiMutation
}
