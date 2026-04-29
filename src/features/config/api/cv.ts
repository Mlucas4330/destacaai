import { createApiClient, BASE_URL } from '@lib/api'
import type { UserProfile } from '@shared/types'

export interface UploadCVResponse {
  cvFileName: string
  cvR2Key: string
}

export async function getUserProfile(getToken: () => Promise<string | null>): Promise<UserProfile> {
  const api = createApiClient(getToken)
  return api.get<UserProfile>('/users/me')
}

export async function uploadCV(getToken: () => Promise<string | null>, file: File): Promise<UploadCVResponse> {
  const api = createApiClient(getToken)
  const formData = new FormData()
  formData.append('file', file)
  return api.uploadFile<UploadCVResponse>('/cv/upload', formData)
}

export async function uploadCVGuest(guestId: string, file: File): Promise<UploadCVResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('guestId', guestId)
  const res = await fetch(`${BASE_URL}/guest/cv/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? 'Upload failed')
  }
  return res.json()
}

export async function deleteCV(getToken: () => Promise<string | null>): Promise<void> {
  const api = createApiClient(getToken)
  await api.delete('/cv')
}

export async function deleteCVGuest(guestId: string, cvR2Key: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/guest/cv`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId, cvR2Key }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? 'Failed to remove CV')
  }
}
