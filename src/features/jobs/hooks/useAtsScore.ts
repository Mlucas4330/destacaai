import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@features/auth/context/AuthContext'
import { createApiClient } from '@lib/api'
import type { ProcessingStatus } from '@shared/types'

interface AtsResult {
  jobId: string
  atsStatus: ProcessingStatus
  score: number | null
  explanation: string | null
}

function useApi() {
  const { getToken } = useAuthContext()
  return createApiClient(getToken)
}

export function useAtsScore(jobId: string, enabled: boolean) {
  const api = useApi()
  return useQuery({
    queryKey: ['ats-score', jobId],
    queryFn: () => api.get<AtsResult>(`/ats/${jobId}`),
    enabled,
  })
}
