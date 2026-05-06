import { apiClient } from '@/lib/apiClient'
import type { Job, JobStatus } from './types'

export const getJobs = () =>
  apiClient.get<{ jobs: Job[] }>('/jobs').then((r) => r.data.jobs)

export const createJob = (data: { title: string; company: string; description: string }) =>
  apiClient.post<Job>('/jobs', data).then((r) => r.data)

export const deleteJob = (jobId: string) =>
  apiClient.delete(`/jobs/${jobId}`)

export const clearJobs = () =>
  apiClient.delete('/jobs')

export const updateJobStatus = (jobId: string, status: JobStatus) =>
  apiClient.patch<{ id: string; status: JobStatus }>(`/jobs/${jobId}/status`, { status }).then((r) => r.data)

export const extractMetadata = (description: string) =>
  apiClient.post<{ title: string; company: string }>('/jobs/extract', { description }).then((r) => r.data)

export const downloadGeneratedCV = async (jobId: string): Promise<{ blob: Blob; fileName: string }> => {
  const res = await apiClient.get<Blob>(`/jobs/${jobId}/download`, { responseType: 'blob' })
  const disposition = res.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="([^"]+)"/)
  const fileName = match?.[1] ?? 'cv.pdf'
  return { blob: res.data, fileName }
}
