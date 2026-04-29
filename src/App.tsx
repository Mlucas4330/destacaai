import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { MemoryRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Briefcase, Settings } from 'lucide-react'
import Jobs from '@/pages/Jobs'
import Config from '@/pages/Config'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import VerifyCode from '@/pages/VerifyCode'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import AddJob from '@/features/jobs/components/AddJob'
import GenerateCV from '@/features/jobs/components/GenerateCV'
import GuestLimitModal from '@/features/auth/components/GuestLimitModal'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { GuestProvider } from '@/features/auth/context/GuestContext'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { useGuestContext } from '@/features/auth/context/GuestContext'
import { queryClient } from '@/lib/queryClient'

const App = (): React.ReactNode => {
  const navigate = useNavigate()
  const { isSignedIn, pendingVerification } = useAuthContext()
  const { showLimitModal } = useGuestContext()

  useEffect(() => {
    if (pendingVerification && !isSignedIn) {
      navigate('/verify-code', { replace: true })
    }
  }, [pendingVerification, isSignedIn, navigate])

  return (
    <MemoryRouter>
      <AuthProvider>
        <GuestProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path='/' element={<Jobs />} />
              <Route path='/sign-in' element={<SignIn />} />
              <Route path='/sign-up' element={<SignUp />} />
              <Route path='/verify-code' element={<VerifyCode />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
              <Route path='/add-job' element={<AddJob />} />
              <Route path='/generate/:jobId' element={<GenerateCV />} />
              <Route path='/config' element={<Config />} />
            </Routes>

            {showLimitModal && <GuestLimitModal />}

            <nav className='flex border-t border-border bg-bg'>
              <NavLink to='/' className='flex flex-col items-center gap-0.5 py-2 px-6 text-xs transition-colors text-accent-text font-semibold'>
                <Briefcase size={18} />
                Jobs
              </NavLink>
              <NavLink to='/config' className='flex flex-col items-center gap-0.5 py-2 px-6 text-xs transition-colors text-accent-text font-semibold'>
                <Settings size={18} />
                Settings
              </NavLink>
            </nav>

            <Toaster
              position='bottom-center'
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#1e2333',
                  color: '#f7f6f3',
                  fontSize: '13px',
                  borderRadius: '12px',
                  maxWidth: '320px',
                },
              }}
            />
          </QueryClientProvider>
        </GuestProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

export default App
