/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createMemoryRouter, redirect } from 'react-router-dom'
import { STORAGE_KEYS as AUTH_STORAGE_KEYS } from '@/features/auth/constants'
import { STORAGE_KEYS as JOB_STORAGE_KEYS } from '@/features/jobs/constants'
import { chromeStorageClient } from '@/lib/storageClient'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
import RootLayout from '@/shared/components/RootLayout'

const Jobs = lazy(() => import('@/pages/Jobs'))
const Config = lazy(() => import('@/pages/Config'))
const AddJob = lazy(() => import('@/features/jobs/components/AddJob'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const VerifyCode = lazy(() => import('@/pages/VerifyCode'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

const fallback = <Spinner />

export const router = createMemoryRouter([
  {
    element: <RootLayout />,
    HydrateFallback: Spinner,
    children: [
      {
        path: '/',
        loader: async () => {
          const pendingVerif = await chromeStorageClient.get(AUTH_STORAGE_KEYS.PENDING_VERIFICATION)
          const pendingJob = await chromeStorageClient.get(JOB_STORAGE_KEYS.PENDING_DESCRIPTION)
          if (pendingVerif) return redirect('/verify-code')
          if (pendingJob) return redirect('/add-job')
          return redirect('/jobs')
        },
        element: <Spinner />,
      },
      {
        element: <NavBar />,
        children: [
          { path: '/add-job', element: <Suspense fallback={fallback}><AddJob /></Suspense> },
          { path: '/config', element: <Suspense fallback={fallback}><Config /></Suspense> },
          { path: '/jobs', element: <Suspense fallback={fallback}><Jobs /></Suspense> },
        ],
      },
      {
        children: [
          { path: '/sign-in', element: <Suspense fallback={fallback}><SignIn /></Suspense> },
          { path: '/sign-up', element: <Suspense fallback={fallback}><SignUp /></Suspense> },
          { path: '/verify-code', element: <Suspense fallback={fallback}><VerifyCode /></Suspense> },
          { path: '/forgot-password', element: <Suspense fallback={fallback}><ForgotPassword /></Suspense> },
          { path: '/reset-password', element: <Suspense fallback={fallback}><ResetPassword /></Suspense> },
        ],
      },
    ],
  },
])
