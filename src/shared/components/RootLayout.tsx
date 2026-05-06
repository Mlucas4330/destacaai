import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { STORAGE_KEYS as JOB_STORAGE_KEYS } from '@/features/jobs/constants'
import { router } from '@/router'
import GuestLimitModal from '@/features/auth/components/GuestLimitModal'

const RootLayout = () => {
  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[JOB_STORAGE_KEYS.PENDING_DESCRIPTION]?.newValue) {
        router.navigate('/add-job')
      }
    }
    chrome.storage.local.onChanged.addListener(listener)
    return () => chrome.storage.local.onChanged.removeListener(listener)
  }, [])

  return <><Outlet /><GuestLimitModal /></>
}

export default RootLayout
