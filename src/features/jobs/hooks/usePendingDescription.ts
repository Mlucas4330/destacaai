import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chromeStorageClient } from '@/lib/chromeStorageClient'
import { STORAGE_KEYS } from '@/shared/constants'

export function usePendingDescription(enabled: boolean) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled) return

    chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_DESCRIPTION).then((value) => {
      if (value) navigate('/add-job')
    })

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.PENDING_DESCRIPTION]?.newValue) navigate('/add-job')
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [enabled, navigate])
}
