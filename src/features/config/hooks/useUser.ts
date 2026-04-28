import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@shared/constants'
import { useAuthContext } from '@features/auth/context/AuthContext'
import toast from 'react-hot-toast'
import { createApiClient } from '@lib/api'
import { CACHE_KEYS } from '@lib/cache'
import type { UserProfile } from '@shared/types'

function readUserCache(): UserProfile | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.USER)
    return raw ? (JSON.parse(raw) as UserProfile) : undefined
  } catch {
    return undefined
  }
}

function useApi() {
  const { getToken } = useAuthContext()
  return createApiClient(getToken)
}

export function useUser() {
  const api = useApi()

  const result = useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => api.get<UserProfile>('/users/me'),
    staleTime: 60_000,
    initialData: readUserCache,
    initialDataUpdatedAt: () => Number(localStorage.getItem(CACHE_KEYS.USER_TS) ?? 0),
  })

  useEffect(() => {
    if (result.data) {
      localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(result.data))
      localStorage.setItem(CACHE_KEYS.USER_TS, String(Date.now()))
    }
  }, [result.data])

  return result
}

export function useUploadCV() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.uploadFile<{ cvFileName: string; cvR2Key: string }>('/cv/upload', formData)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  })
}

export function useDeleteCV() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/cv'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
    onError: (err) => toast.error(err.message ?? 'Failed to remove CV. Please try again.'),
  })
}
