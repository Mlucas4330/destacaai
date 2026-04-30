import { apiClient } from '@/lib/apiClient'
import type { ProcessingStatus } from '@/shared/types'

export interface AtsSideResult {
  status: ProcessingStatus
  score: number | null
  explanation: string | null
}

export interface AtsResult {
  uploaded: AtsSideResult
  generated: AtsSideResult
}

export const getAtsScore = (jobId: string) =>
  apiClient.get<AtsResult>(`/ats/${jobId}`).then((r) => r.data)
