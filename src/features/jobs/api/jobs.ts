import { apiClient } from '@/lib/apiClient'
import type { Job, JobStatus } from '@/shared/types'

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
