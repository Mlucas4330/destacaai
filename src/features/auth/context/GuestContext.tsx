import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '@shared/constants'
import type { GuestJob } from '@shared/types'

interface GuestContextValue {
  guestId: string
  guestJobs: GuestJob[]
  guestGenerationsUsed: number
  guestCvR2Key: string | null
  showLimitModal: boolean
  addGuestJob: (job: GuestJob) => Promise<void>
  deleteGuestJob: (id: string) => Promise<void>
  clearGuestJobs: () => Promise<void>
  updateGuestJob: (id: string, patch: Partial<GuestJob>) => Promise<void>
  incrementGuestGenerations: () => Promise<void>
  setGuestCvR2Key: (key: string | null) => Promise<void>
  triggerLimitModal: () => void
  dismissLimitModal: () => void
  clearGuestData: () => Promise<void>
}

const GuestContext = createContext<GuestContextValue | null>(null)

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestId, setGuestId] = useState('')
  const [guestJobs, setGuestJobs] = useState<GuestJob[]>([])
  const [guestGenerationsUsed, setGuestGenerationsUsed] = useState(0)
  const [guestCvR2Key, setGuestCvR2KeyState] = useState<string | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(
      [
        STORAGE_KEYS.GUEST_ID,
        STORAGE_KEYS.GUEST_JOBS,
        STORAGE_KEYS.GUEST_GENERATIONS_USED,
        STORAGE_KEYS.GUEST_CV_R2_KEY,
      ],
      (result) => {
        let id = result[STORAGE_KEYS.GUEST_ID] as string | undefined
        if (!id) {
          id = crypto.randomUUID()
          chrome.storage.local.set({ [STORAGE_KEYS.GUEST_ID]: id })
        }
        setGuestId(id)
        setGuestJobs((result[STORAGE_KEYS.GUEST_JOBS] as GuestJob[] | undefined) ?? [])
        setGuestGenerationsUsed((result[STORAGE_KEYS.GUEST_GENERATIONS_USED] as number | undefined) ?? 0)
        setGuestCvR2KeyState((result[STORAGE_KEYS.GUEST_CV_R2_KEY] as string | undefined) ?? null)
      },
    )
  }, [])

  const addGuestJob = useCallback(async (job: GuestJob) => {
    setGuestJobs((prev) => {
      const next = [job, ...prev]
      chrome.storage.local.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const deleteGuestJob = useCallback(async (id: string) => {
    setGuestJobs((prev) => {
      const next = prev.filter((j) => j.id !== id)
      chrome.storage.local.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const clearGuestJobs = useCallback(async () => {
    setGuestJobs([])
    chrome.storage.local.remove(STORAGE_KEYS.GUEST_JOBS)
  }, [])

  const updateGuestJob = useCallback(async (id: string, patch: Partial<GuestJob>) => {
    setGuestJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
      chrome.storage.local.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const incrementGuestGenerations = useCallback(async () => {
    setGuestGenerationsUsed((prev) => {
      const next = prev + 1
      chrome.storage.local.set({ [STORAGE_KEYS.GUEST_GENERATIONS_USED]: next })
      return next
    })
  }, [])

  const setGuestCvR2Key = useCallback(async (key: string | null) => {
    setGuestCvR2KeyState(key)
    if (key === null) {
      chrome.storage.local.remove(STORAGE_KEYS.GUEST_CV_R2_KEY)
    } else {
      chrome.storage.local.set({ [STORAGE_KEYS.GUEST_CV_R2_KEY]: key })
    }
  }, [])

  const triggerLimitModal = useCallback(() => setShowLimitModal(true), [])
  const dismissLimitModal = useCallback(() => setShowLimitModal(false), [])

  const clearGuestData = useCallback(async () => {
    await chrome.storage.local.remove([
      STORAGE_KEYS.GUEST_JOBS,
      STORAGE_KEYS.GUEST_GENERATIONS_USED,
      STORAGE_KEYS.GUEST_CV_R2_KEY,
    ])
    setGuestJobs([])
    setGuestGenerationsUsed(0)
    setGuestCvR2KeyState(null)
    setShowLimitModal(false)
  }, [])

  return (
    <GuestContext.Provider
      value={{
        guestId,
        guestJobs,
        guestGenerationsUsed,
        guestCvR2Key,
        showLimitModal,
        addGuestJob,
        deleteGuestJob,
        clearGuestJobs,
        updateGuestJob,
        incrementGuestGenerations,
        setGuestCvR2Key,
        triggerLimitModal,
        dismissLimitModal,
        clearGuestData,
      }}
    >
      {children}
    </GuestContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuestContext() {
  const ctx = useContext(GuestContext)
  if (!ctx) throw new Error('useGuestContext must be used inside GuestProvider')
  return ctx
}
