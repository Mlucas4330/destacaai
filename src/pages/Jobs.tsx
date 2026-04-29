import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import EmptyState from '@/features/jobs/components/EmptyState'
import NoCvState from '@/features/jobs/components/NoCvState'
import JobList from '@/features/jobs/components/JobList'
import { useJobs, useDeleteJob, useClearJobs } from '@/features/jobs/hooks/useJobs'
import { useUser } from '@/features/config/hooks/useUser'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { useGuestContext } from '@/features/auth/context/GuestContext'
import { STORAGE_KEYS } from '@/shared/constants'
import Loading from '@/shared/components/Loading'

const Jobs = () => {
  const navigate = useNavigate()
  const { isSignedIn } = useAuthContext()
  const { guestCvR2Key } = useGuestContext()
  const { data: jobs = [], isLoading: isJobsLoading } = useJobs()
  const { data: user, isLoading: isUserLoading } = useUser()
  const deleteJob = useDeleteJob()
  const clearJobs = useClearJobs()

  const hasCv = isSignedIn ? (user?.hasCv ?? false) : (guestCvR2Key !== null)
  const isLoading = isSignedIn ? (isJobsLoading || isUserLoading) : isJobsLoading

  useEffect(() => {
    if (isLoading || !hasCv) return

    chrome.storage.local.get(STORAGE_KEYS.PENDING_DESCRIPTION, (result: { pendingDescription?: string }) => {
      if (result.pendingDescription) navigate('/add-job')
    })

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.PENDING_DESCRIPTION]?.newValue) navigate('/add-job')
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [navigate, hasCv, isLoading])

  useEffect(() => {
    if (isSignedIn || isLoading) return

    chrome.storage.local.get(STORAGE_KEYS.PENDING_DESCRIPTION, (result: { pendingDescription?: string }) => {
      if (result.pendingDescription) navigate('/add-job')
    })

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.PENDING_DESCRIPTION]?.newValue) navigate('/add-job')
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [isSignedIn, isLoading, navigate])

  if (isLoading) {
    return <Loading />
  }

  if (!hasCv) {
    return <NoCvState />
  }

  if (jobs.length === 0) {
    return <EmptyState />
  }

  return (
    <AnimatePresence mode='wait'>
      <JobList
        key='list'
        jobs={jobs}
        onDelete={(id) => deleteJob.mutate(id)}
        onGenerate={(id) => navigate(`/generate/${id}`)}
        onClearAll={() => clearJobs.mutate()}
      />
    </AnimatePresence>
  )
}

export default Jobs
