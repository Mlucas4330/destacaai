import { apiClient } from '@/lib/apiClient'

export interface GenerationStatus {
  status: 'idle' | 'queued' | 'processing' | 'done' | 'failed'
  downloadUrl?: string
  error?: string
}

export const generateCV = (jobId: string) =>
  apiClient.post<{ status: string }>(`/generate/${jobId}`).then((r) => r.data)

export const getGenerationStatus = (jobId: string) =>
  apiClient.get<GenerationStatus>(`/generate/${jobId}/status`).then((r) => r.data)

export const downloadGeneratedCV = (jobId: string) =>
  apiClient.get<Blob>(`/generate/${jobId}/download`, { responseType: 'blob' }).then((r) => r.data)
