import { createApiClient } from '@lib/api'
import type { Job, JobStatus } from '@shared/types'

export async function getJobs(getToken: () => Promise<string | null>): Promise<Job[]> {
  const api = createApiClient(getToken)
  const response = await api.get<{ jobs: Job[] }>('/jobs')
  return response.jobs
}

export async function createJob(
  getToken: () => Promise<string | null>,
  data: { title: string; company: string; description: string },
): Promise<Job> {
  const api = createApiClient(getToken)
  return api.post<Job>('/jobs', data)
}

export async function deleteJob(getToken: () => Promise<string | null>, jobId: string): Promise<void> {
  const api = createApiClient(getToken)
  await api.delete(`/jobs/${jobId}`)
}

export async function clearJobs(getToken: () => Promise<string | null>): Promise<void> {
  const api = createApiClient(getToken)
  await api.delete('/jobs')
}

export async function updateJobStatus(
  getToken: () => Promise<string | null>,
  jobId: string,
  status: JobStatus,
): Promise<{ id: string; status: JobStatus }> {
  const api = createApiClient(getToken)
  return api.patch<{ id: string; status: JobStatus }>(`/jobs/${jobId}/status`, { status })
}
