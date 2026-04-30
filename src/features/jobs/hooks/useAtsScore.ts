import { useQuery } from '@tanstack/react-query'
import * as atsApi from '@/features/jobs/api/ats'
import type { AtsResult } from '@/features/jobs/api/ats'
import { POLLING_INTERVAL_MS, QUERY_KEYS } from '@/features/jobs/constants'

function isDone(data: AtsResult | undefined): boolean {
  if (!data) return false
  return (
    (data.generated.status === 'done' || data.generated.status === 'failed') &&
    (data.uploaded.status === 'done' || data.uploaded.status === 'failed')
  )
}

export function useAtsScore(jobId: string, enabled: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ATS_SCORE, jobId],
    queryFn: () => atsApi.getAtsScore(jobId),
    enabled,
    refetchInterval: (query) => (isDone(query.state.data) ? false : POLLING_INTERVAL_MS),
  })
}
