import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { chromeStorageClient } from '@/lib/storageClient'
import { setToken } from '@/lib/tokenStore'
import { initGuestId } from '@/lib/guestIdStore'
import { queryClient } from '@/lib/queryClient'
import { STORAGE_KEYS } from '../constants'
import type { UserProps, PendingVerification } from '../types'

interface AuthState {
  isLoaded: boolean
  isSignedIn: boolean
  loggedUser: UserProps | null
  pendingVerification: PendingVerification | null
  showLimitModal: boolean
  cvFileName: string | null
}

interface AuthActions {
  login: (token: string, email: string) => Promise<void>
  signOut: () => Promise<void>
  clearPendingVerification: () => Promise<void>
  triggerLimitModal: () => void
  dismissLimitModal: () => void
  setCvFileName: (name: string | null) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isLoaded: false,
      isSignedIn: false,
      loggedUser: null,
      pendingVerification: null,
      showLimitModal: false,
      cvFileName: null,

      setCvFileName: (name) => set({ cvFileName: name }),

      login: async (token, email) => {
        setToken(token)
        set({ loggedUser: { token, email }, isSignedIn: true })
      },

      signOut: async () => {
        await chromeStorageClient.remove(STORAGE_KEYS.PENDING_VERIFICATION)
        setToken(null)
        queryClient.clear()
        set({ loggedUser: null, isSignedIn: false, pendingVerification: null, cvFileName: null })
      },

      clearPendingVerification: async () => {
        await chromeStorageClient.remove(STORAGE_KEYS.PENDING_VERIFICATION)
        set({ pendingVerification: null })
      },

      triggerLimitModal: () => set({ showLimitModal: true }),
      dismissLimitModal: () => set({ showLimitModal: false }),
    }),
    {
      name: 'destacai-auth',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const result = await chrome.storage.local.get(key)
          return (result[key] as string | undefined) ?? null
        },
        setItem: (key, value) => chrome.storage.local.set({ [key]: value }),
        removeItem: (key) => chrome.storage.local.remove(key),
      })),
      partialize: (state) => ({ loggedUser: state.loggedUser, cvFileName: state.cvFileName }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.loggedUser?.token) setToken(state.loggedUser.token)
        initGuestId()
        useAuthStore.setState({
          isLoaded: true,
          isSignedIn: !error && !!state?.loggedUser?.token,
        })
      },
    },
  ),
)
