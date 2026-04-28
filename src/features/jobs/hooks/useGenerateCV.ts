import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@features/auth/context/AuthContext'
import { useGuestContext } from '@features/auth/context/GuestContext'
import { createApiClient } from '@lib/api'
import { POLLING_INTERVAL_MS, QUERY_KEYS, FREE_TIER_LIMIT } from '@shared/constants'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL as string

interface GenerationStatus {
  status: 'idle' | 'queued' | 'processing' | 'done' | 'failed'
  downloadUrl?: string
  error?: string
}

type MutateOptions = {
  onSuccess?: (data: unknown) => void
  onError?: (err: Error) => void
}

function useApi() {
  const { getToken } = useAuthContext()
  return createApiClient(getToken)
}

export function useGenerateCV() {
  const { isSignedIn } = useAuthContext()
  const { guestId, guestJobs, guestGenerationsUsed, guestCvR2Key, incrementGuestGenerations, triggerLimitModal, updateGuestJob } =
    useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: (jobId: string) => api.post<{ status: string }>(`/generate/${jobId}`),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId] })
    },
  })

  if (!isSignedIn) {
    return {
      ...apiMutation,
      mutate: (jobId: string, opts?: MutateOptions) => {
        if (guestGenerationsUsed >= FREE_TIER_LIMIT) {
          triggerLimitModal()
          opts?.onError?.(new Error('limit_reached'))
          return
        }
        if (!guestCvR2Key) {
          toast.error('Upload your CV first in Settings.')
          opts?.onError?.(new Error('no_cv'))
          return
        }

        const guestJob = guestJobs.find((j) => j.id === jobId)
        if (!guestJob) {
          opts?.onError?.(new Error('Job not found.'))
          return
        }

        updateGuestJob(jobId, { cvGenerationStatus: 'queued' })

        fetch(`${BASE_URL}/guest/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId, jobId, cvR2Key: guestCvR2Key, jobDescription: guestJob.description }),
        })
          .then(async (res) => {
            if (res.status === 429) {
              triggerLimitModal()
              updateGuestJob(jobId, { cvGenerationStatus: 'idle' })
              opts?.onError?.(new Error('limit_reached'))
              return
            }
            if (!res.ok) {
              const body = await res.json().catch(() => null)
              updateGuestJob(jobId, { cvGenerationStatus: 'idle' })
              opts?.onError?.(new Error(body?.error ?? 'Failed to start generation.'))
              return
            }
            await incrementGuestGenerations()
            qc.invalidateQueries({ queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId] })
            opts?.onSuccess?.({ status: 'queued' })
          })
          .catch(() => {
            updateGuestJob(jobId, { cvGenerationStatus: 'idle' })
            opts?.onError?.(new Error('Could not reach server.'))
          })
      },
    }
  }

  return apiMutation
}

export function useGenerationStatus(jobId: string, enabled: boolean) {
  const { isSignedIn } = useAuthContext()
  const { guestId, updateGuestJob } = useGuestContext()
  const api = useApi()

  const guestQuery = useQuery({
    queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId],
    queryFn: async (): Promise<GenerationStatus> => {
      const res = await fetch(`${BASE_URL}/guest/generate/${jobId}/status?guestId=${encodeURIComponent(guestId)}`)
      if (!res.ok) throw new Error('Failed to fetch status')
      return res.json() as Promise<GenerationStatus>
    },
    enabled: !isSignedIn && enabled && !!guestId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return POLLING_INTERVAL_MS
    },
  })

  const authQuery = useQuery({
    queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId],
    queryFn: () => api.get<GenerationStatus>(`/generate/${jobId}/status`),
    enabled: isSignedIn && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return POLLING_INTERVAL_MS
    },
  })

  const guestStatus = guestQuery.data?.status
  const guestDownloadUrl = guestQuery.data?.downloadUrl

  useEffect(() => {
    if (isSignedIn || !guestStatus) return
    if (guestStatus === 'done') {
      updateGuestJob(jobId, {
        cvGenerationStatus: 'done',
        cvR2Key: `generated-cvs/guest/${guestId}/${jobId}.pdf`,
        downloadUrl: guestDownloadUrl,
      })
    } else if (guestStatus === 'failed') {
      updateGuestJob(jobId, { cvGenerationStatus: 'failed' })
    }
  }, [guestStatus, guestDownloadUrl, isSignedIn, jobId, guestId, updateGuestJob])

  return isSignedIn ? authQuery : guestQuery
}
