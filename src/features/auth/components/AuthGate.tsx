import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthContext } from '@features/auth/context/AuthContext'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoaded, isSignedIn } = useAuthContext()
  const qc = useQueryClient()

  useEffect(() => {
    if (!isSignedIn) qc.clear()
  }, [isSignedIn, qc])

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-5 h-5 border-2 border-accent rounded-full border-t-transparent animate-spin' />
      </div>
    )
  }

  return <>{children}</>
}
