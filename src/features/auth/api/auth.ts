import { createApiClient, BASE_URL } from '@/lib/api'
import type { LoginResponse, ResetPasswordResponse, SignUpResponse, VerifyCodeResponse } from '../types'

export async function signIn(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Sign in failed')
  }
  return res.json()
}

export async function signUp(email: string, password: string): Promise<SignUpResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Registration failed')
  }
  return res.json()
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Failed to request password reset')
  }
}

export async function verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
  const res = await fetch(`${BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Invalid or expired code')
  }
  return res.json()
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<ResetPasswordResponse> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Failed to reset password')
  }
  return res.json()
}

export async function migrateGuest(
  getToken: () => Promise<string | null>,
  guestId: string,
  guestJobs: unknown,
  guestCvR2Key: string | null,
): Promise<void> {
  const api = createApiClient(getToken)
  try {
    await api.post('/auth/migrate-guest', { guestId, guestJobs, guestCvR2Key })
  } catch {
  }
}

export const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault()
  setLoading(true)
  try {
    await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    await chrome.storage.local.set({ [STORAGE_KEYS.PENDING_VERIFICATION]: { email, purpose: 'password-reset' } })
    navigate('/verify-code', { state: { email, purpose: 'password-reset' } })
  } catch {
    toast.error('Could not reach server. Please try again.')
  } finally {
    setLoading(false)
  }
}
