import { createContext, useContext, useEffect, useState } from 'react'
import * as chromeStorage from '@/lib/chromeStorage'
import { STORAGE_KEYS } from '@/features/auth/constants'
import type { AuthContextValue, AuthState, PendingVerification } from '../types'
import { clear } from '@/lib/localStorage'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [auth, setAuth] = useState<AuthState>({ token: null, email: null })
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null)

  useEffect(() => {
    (async () => {
      const result = await chromeStorage.get([STORAGE_KEYS.AUTH, STORAGE_KEYS.PENDING_VERIFICATION])
      const stored = result[STORAGE_KEYS.AUTH] as AuthState | undefined
      if (stored?.token) setAuth(stored)
      const pending = result[STORAGE_KEYS.PENDING_VERIFICATION] as PendingVerification | undefined
      if (pending?.email) setPendingVerification(pending)
      setIsLoaded(true)
    })()
  }, [])

  const login = async (token: string, email: string) => {
    const next = { token, email }
    await chromeStorage.set({ [STORAGE_KEYS.AUTH]: next })
    setAuth(next)
  }

  const signOut = async () => {
    await chromeStorage.remove([STORAGE_KEYS.AUTH, STORAGE_KEYS.PENDING_VERIFICATION])
    clear()
    setAuth({ token: null, email: null })
    setPendingVerification(null)
  }

  const clearPendingVerification = async () => {
    await chromeStorage.remove(STORAGE_KEYS.PENDING_VERIFICATION)
    setPendingVerification(null)
  }

  const getToken = async () => auth.token

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn: !!auth.token, pendingVerification, getToken, signOut, login, clearPendingVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
