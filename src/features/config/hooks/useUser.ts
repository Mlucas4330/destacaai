import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { localStorageClient } from '@/lib/localStorageClient'
import { useAuthStore } from '@/features/auth/stores/auth'
import toast from 'react-hot-toast'
import type { UserProfile } from '@/shared/types'
import { getUserProfile, uploadCV, deleteCV } from '../api/cv'
import { CACHE_KEYS, QUERY_KEYS } from '../constants'

export function useUser() {
  const { isSignedIn } = useAuthStore()

  const result = useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => getUserProfile(),
    enabled: isSignedIn,
    staleTime: 60_000,
    initialData: () => (isSignedIn ? localStorageClient.get<UserProfile>(CACHE_KEYS.USER) : undefined),
    initialDataUpdatedAt: () => Number(localStorageClient.get<number>(CACHE_KEYS.USER_TS) ?? 0),
  })

  useEffect(() => {
    if (result.data) {
      localStorageClient.set(CACHE_KEYS.USER, result.data)
      localStorageClient.set(CACHE_KEYS.USER_TS, Date.now())
    }
  }, [result.data])

  return result
}

export function useUploadCV() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadCV(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
    onError: (err) => toast.error(err.message ?? 'Failed to upload CV. Please try again.'),
  })
}

export function useDeleteCV() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => deleteCV(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
    onError: (err) => toast.error(err.message ?? 'Failed to remove CV. Please try again.'),
  })
}
