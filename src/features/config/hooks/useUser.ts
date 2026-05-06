import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/stores/auth'
import toast from 'react-hot-toast'
import { getUserProfile, uploadCV, deleteCV, startCheckout } from '../api'
import { QUERY_KEYS, MAX_SIZE_BYTES, MAX_SIZE_MB } from '../constants'
import type { UserProfile } from '@/shared/types'
const { setCvFileName } = useAuthStore.getState()

export function useUser() {
  const { isLoaded } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => getUserProfile(),
    enabled: isLoaded,
    staleTime: 60_000,
  })
}

export function useHasCv() {
  const { data: user, isFetching, isError } = useUser()
  const isSignedIn = useAuthStore((state) => state.isSignedIn)
  const cvFileName = useAuthStore((state) => state.cvFileName)

  return isSignedIn
    ? isFetching || isError || !!user?.cvFileName
    : !!cvFileName
}

export function useUploadCV() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      if (file.type !== 'application/pdf') throw new Error('Only PDF files are supported.')
      if (file.size > MAX_SIZE_BYTES) throw new Error(`File size must be ${MAX_SIZE_MB} MB or less.`)
      return uploadCV(file)
    },
    onSuccess: (data) => {
      setCvFileName(data.cvFileName)
      qc.setQueryData<UserProfile>([QUERY_KEYS.USER], (old) =>
        old ? { ...old, cvFileName: data.cvFileName, hasCv: true } : old
      )
    },
    onError: (err) => toast.error(err.message ?? 'Upload failed.'),
  })
}

export function useDeleteCV() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => deleteCV(),
    onSuccess: () => {
      setCvFileName(null)
      qc.setQueryData<UserProfile>([QUERY_KEYS.USER], (old) =>
        old ? { ...old, cvFileName: null, hasCv: false } : old
      )
    },
    onError: (err) => toast.error(err.message ?? 'Failed to remove CV. Please try again.'),
  })
}

export function useCheckout() {
  return useMutation({
    mutationFn: () => startCheckout(),
    onSuccess: ({ checkoutUrl }) => {
      chrome.tabs.create({ url: checkoutUrl })
    },
    onError: () => toast.error('Failed to start checkout. Please try again.'),
  })
}
