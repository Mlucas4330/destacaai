import { apiClient } from '@/lib/apiClient'
import type { SignInRequest, SignInResponse, SignUpResponse, VerifyCodeResponse, ResetPasswordResponse } from './types'

export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const res = await apiClient.post<SignInResponse>('/auth/login', data)
  return res.data
}

export const signUp = async (email: string, password: string): Promise<SignUpResponse> => {
  const res = await apiClient.post<SignUpResponse>('/auth/register', { email, password })
  return res.data
}

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email })
}

export const verifyCode = async (email: string, code: string): Promise<VerifyCodeResponse> => {
  const res = await apiClient.post<VerifyCodeResponse>('/auth/verify-code', { email, code })
  return res.data
}

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<ResetPasswordResponse> => {
  const res = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', { email, code, newPassword })
  return res.data
}
