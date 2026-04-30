import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/stores/auth'
import * as generationApi from '@/features/jobs/api/generation'
import { POLLING_INTERVAL_MS, QUERY_KEYS } from '@/features/jobs/constants'
import toast from 'react-hot-toast'
import axios from 'axios'

export function useGenerateCV() {
  const { triggerLimitModal } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => generationApi.generateCV(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId] })
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        triggerLimitModal()
      } else {
        toast.error('Failed to start generation. Please try again.')
      }
    },
  })
}

export function useGenerationStatus(jobId: string, enabled: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.GENERATION_STATUS, jobId],
    queryFn: () => generationApi.getGenerationStatus(jobId),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return POLLING_INTERVAL_MS
    },
  })
}
