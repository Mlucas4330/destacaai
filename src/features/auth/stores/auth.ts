import { create } from 'zustand'
import { chromeStorageClient } from '@/lib/chromeStorageClient'
import { localStorageClient } from '@/lib/localStorageClient'
import { setToken } from '@/lib/apiClient'
import { STORAGE_KEYS } from '../constants'
import { CACHE_KEYS as JOB_CACHE_KEYS } from '@/features/jobs/constants'
import { CACHE_KEYS as USER_CACHE_KEYS } from '@/features/config/constants'
import type { UserProps, PendingVerification } from '../types'

interface AuthState {
  isLoaded: boolean
  isSignedIn: boolean
  loggedUser: UserProps | null
  pendingVerification: PendingVerification | null
  showLimitModal: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  login: (token: string, email: string) => Promise<void>
  signOut: () => Promise<void>
  clearPendingVerification: () => Promise<void>
  triggerLimitModal: () => void
  dismissLimitModal: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isLoaded: false,
  isSignedIn: false,
  loggedUser: null,
  pendingVerification: null,
  showLimitModal: false,

  initialize: async () => {
    const auth = await chromeStorageClient.get<UserProps>(STORAGE_KEYS.AUTH)
    const pending = await chromeStorageClient.get<PendingVerification>(STORAGE_KEYS.PENDING_VERIFICATION)
    if (auth?.token) setToken(auth.token)
    set({
      loggedUser: auth ?? null,
      pendingVerification: pending ?? null,
      isLoaded: true,
      isSignedIn: !!auth?.token,
    })
  },

  login: async (token: string, email: string) => {
    await chromeStorageClient.set(STORAGE_KEYS.AUTH, { token, email })
    setToken(token)
    set({ loggedUser: { token, email }, isSignedIn: true })
  },

  signOut: async () => {
    await chromeStorageClient.remove([STORAGE_KEYS.AUTH, STORAGE_KEYS.PENDING_VERIFICATION])
    localStorageClient.remove([
      JOB_CACHE_KEYS.JOBS,
      JOB_CACHE_KEYS.JOBS_TS,
      USER_CACHE_KEYS.USER,
      USER_CACHE_KEYS.USER_TS,
    ])
    setToken(null)
    set({ loggedUser: null, pendingVerification: null, isSignedIn: false })
  },

  clearPendingVerification: async () => {
    await chromeStorageClient.remove(STORAGE_KEYS.PENDING_VERIFICATION)
    set({ pendingVerification: null })
  },

  triggerLimitModal: () => set({ showLimitModal: true }),
  dismissLimitModal: () => set({ showLimitModal: false }),
}))
