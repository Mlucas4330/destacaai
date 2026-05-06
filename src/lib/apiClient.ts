import axios, { type AxiosError } from 'axios'
import { getToken } from '@/lib/tokenStore'
import { getGuestId } from '@/lib/guestIdStore'

const BASE_URL = import.meta.env.VITE_API_URL as string
const API_TIMEOUT = 5_000

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    const guestId = getGuestId()
    if (guestId) config.headers['X-Guest-Id'] = guestId
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error ?? error.message
    return Promise.reject(new Error(message))
  },
)
