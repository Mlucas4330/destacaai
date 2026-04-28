import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, FREE_TIER_LIMIT } from '@shared/constants'
import { useAuthContext } from '@features/auth/context/AuthContext'
import { useGuestContext } from '@features/auth/context/GuestContext'
import toast from 'react-hot-toast'
import { createApiClient } from '@lib/api'
import { CACHE_KEYS } from '@lib/cache'
import type { UserProfile } from '@shared/types'

const BASE_URL = import.meta.env.VITE_API_URL as string

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
  const { isSignedIn } = useAuthContext()
  const { guestGenerationsUsed, guestCvR2Key } = useGuestContext()
  const api = useApi()

  const result = useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => api.get<UserProfile>('/users/me'),
    enabled: isSignedIn,
    staleTime: 60_000,
    initialData: readUserCache,
    initialDataUpdatedAt: () => Number(localStorage.getItem(CACHE_KEYS.USER_TS) ?? 0),
  })

  useEffect(() => {
    if (isSignedIn && result.data) {
      localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(result.data))
      localStorage.setItem(CACHE_KEYS.USER_TS, String(Date.now()))
    }
  }, [isSignedIn, result.data])

  if (!isSignedIn) {
    const guestCvFileName = guestCvR2Key ? guestCvR2Key.split('/').pop() ?? null : null
    return {
      data: {
        id: 'guest',
        email: '',
        tier: 'free' as const,
        generationsUsed: guestGenerationsUsed,
        generationsLimit: FREE_TIER_LIMIT,
        cvFileName: guestCvFileName,
        hasCv: guestCvR2Key !== null,
        firstName: null,
        lastName: null,
      } satisfies UserProfile,
      isLoading: false,
      isFetching: false,
    } as ReturnType<typeof useQuery<UserProfile>>
  }

  return result
}

export function useUploadCV() {
  const { isSignedIn } = useAuthContext()
  const { guestId, setGuestCvR2Key } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.uploadFile<{ cvFileName: string; cvR2Key: string }>('/cv/upload', formData)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  })

  if (!isSignedIn) {
    return {
      ...apiMutation,
      mutate: (file: File, opts?: { onError?: (err: Error) => void; onSuccess?: (data: { cvFileName: string; cvR2Key: string }) => void }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('guestId', guestId)
        fetch(`${BASE_URL}/guest/cv/upload`, { method: 'POST', body: formData })
          .then(async (res) => {
            if (!res.ok) {
              const body = await res.json().catch(() => null)
              opts?.onError?.(new Error(body?.error ?? 'Upload failed.'))
              return
            }
            const data = (await res.json()) as { cvFileName: string; cvR2Key: string }
            await setGuestCvR2Key(data.cvR2Key)
            opts?.onSuccess?.(data)
          })
          .catch((err) => opts?.onError?.(err as Error))
      },
    }
  }

  return apiMutation
}

export function useDeleteCV() {
  const { isSignedIn } = useAuthContext()
  const { guestId, guestCvR2Key, setGuestCvR2Key } = useGuestContext()
  const api = useApi()
  const qc = useQueryClient()

  const apiMutation = useMutation({
    mutationFn: () => api.delete('/cv'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
    onError: (err) => toast.error(err.message ?? 'Failed to remove CV. Please try again.'),
  })

  if (!isSignedIn) {
    return {
      ...apiMutation,
      mutate: () => {
        if (!guestCvR2Key) return
        fetch(`${BASE_URL}/guest/cv`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId, cvR2Key: guestCvR2Key }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const body = await res.json().catch(() => null)
              toast.error(body?.error ?? 'Failed to remove CV.')
              return
            }
            await setGuestCvR2Key(null)
          })
          .catch(() => toast.error('Could not reach server. Please try again.'))
      },
    }
  }

  return apiMutation
}
