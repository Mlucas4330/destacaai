import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as chromeStorage from '@/lib/chromeStorage'
import { STORAGE_KEYS } from '@/features/config/constants'
import type { GuestJob } from '@/shared/types'
import type { GuestContextValue } from '../types'
import * as localStorage from '@/lib/localStorage'

const GuestContext = createContext<GuestContextValue | null>(null)

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestId, setGuestId] = useState('')
  const [guestJobs, setGuestJobs] = useState<GuestJob[]>([])
  const [guestGenerationsUsed, setGuestGenerationsUsed] = useState(0)
  const [guestCvR2Key, setGuestCvR2KeyState] = useState<string | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    (async () => {
      const result = await localStorage.get([
        STORAGE_KEYS.GUEST_ID,
        STORAGE_KEYS.GUEST_JOBS,
        STORAGE_KEYS.GUEST_GENERATIONS_USED,
        STORAGE_KEYS.GUEST_CV_R2_KEY,
      ])
      let id = result[STORAGE_KEYS.GUEST_ID] as string | undefined
      if (!id) {
        id = crypto.randomUUID()
        await chromeStorage.set({ [STORAGE_KEYS.GUEST_ID]: id })
      }
      setGuestId(id)
      setGuestJobs((result[STORAGE_KEYS.GUEST_JOBS] as GuestJob[] | undefined) ?? [])
      setGuestGenerationsUsed((result[STORAGE_KEYS.GUEST_GENERATIONS_USED] as number | undefined) ?? 0)
      setGuestCvR2KeyState((result[STORAGE_KEYS.GUEST_CV_R2_KEY] as string | undefined) ?? null)
    })()
  }, [])

  const addGuestJob = useCallback(async (job: GuestJob) => {
    setGuestJobs((prev) => {
      const next = [job, ...prev]
      localStorage.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const deleteGuestJob = useCallback(async (id: string) => {
    setGuestJobs((prev) => {
      const next = prev.filter((j) => j.id !== id)
      localStorage.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const clearGuestJobs = useCallback(async () => {
    setGuestJobs([])
    await localStorage.remove(STORAGE_KEYS.GUEST_JOBS)
  }, [])

  const updateGuestJob = useCallback(async (id: string, patch: Partial<GuestJob>) => {
    setGuestJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
      localStorage.set({ [STORAGE_KEYS.GUEST_JOBS]: next })
      return next
    })
  }, [])

  const incrementGuestGenerations = useCallback(async () => {
    setGuestGenerationsUsed((prev) => {
      const next = prev + 1
      localStorage.set({ [STORAGE_KEYS.GUEST_GENERATIONS_USED]: next })
      return next
    })
  }, [])

  const setGuestCvR2Key = useCallback(async (key: string | null) => {
    setGuestCvR2KeyState(key)
    if (key === null) {
      await localStorage.remove(STORAGE_KEYS.GUEST_CV_R2_KEY)
    } else {
      await localStorage.set({ [STORAGE_KEYS.GUEST_CV_R2_KEY]: key })
    }
  }, [])

  const triggerLimitModal = useCallback(() => setShowLimitModal(true), [])
  const dismissLimitModal = useCallback(() => setShowLimitModal(false), [])

  const clearGuestData = useCallback(async () => {
    await localStorage.remove([
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

export function useGuestContext() {
  const ctx = useContext(GuestContext)
  if (!ctx) throw new Error('useGuestContext must be used inside GuestProvider')
  return ctx
}
