import { createContext, useContext, useEffect, useState } from 'react'

interface AuthState {
  token: string | null
  email: string | null
}

interface AuthContextValue {
  isLoaded: boolean
  isSignedIn: boolean
  getToken: () => Promise<string | null>
  signOut: () => Promise<void>
  login: (token: string, email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'destacai_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [auth, setAuth] = useState<AuthState>({ token: null, email: null })

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const stored = result[STORAGE_KEY] as AuthState | undefined
      if (stored?.token) setAuth(stored)
      setIsLoaded(true)
    })
  }, [])

  const login = async (token: string, email: string) => {
    const next = { token, email }
    await chrome.storage.local.set({ [STORAGE_KEY]: next })
    setAuth(next)
  }

  const signOut = async () => {
    await chrome.storage.local.remove(STORAGE_KEY)
    setAuth({ token: null, email: null })
  }

  const getToken = async () => auth.token

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn: !!auth.token, getToken, signOut, login }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
