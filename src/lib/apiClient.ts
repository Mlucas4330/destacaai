import axios from 'axios'
import { BASE_URL, API_TIMEOUT } from '@/lib/config'

let _token: string | null = null

export function setToken(token: string | null) {
  _token = token
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})
