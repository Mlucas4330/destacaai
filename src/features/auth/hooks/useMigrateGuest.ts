import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@features/auth/context/AuthContext'
import { useGuestContext } from '@features/auth/context/GuestContext'
import { QUERY_KEYS } from '@shared/constants'

const BASE_URL = import.meta.env.VITE_API_URL as string

export function useMigrateGuest() {
  const { getToken } = useAuthContext()
  const { guestId, guestJobs, guestCvR2Key, clearGuestData } = useGuestContext()
  const qc = useQueryClient()

  return async () => {
    if (!guestJobs.length && !guestCvR2Key) return

    try {
      const token = await getToken()
      await fetch(`${BASE_URL}/auth/migrate-guest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestId, guestJobs, guestCvR2Key }),
      })
    } catch {
      // migration is best-effort — do not block login on failure
    }

    await clearGuestData()
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] })
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] })
  }
}
