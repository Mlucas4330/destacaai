let _guestId: string | null = null

export const getGuestId = () => _guestId

export const initGuestId = async () => {
  const result = await chrome.storage.local.get('destacai-guest-id')
  const existing = result['destacai-guest-id'] as string | undefined
  if (existing) {
    _guestId = existing
  } else {
    _guestId = crypto.randomUUID()
    await chrome.storage.local.set({ 'destacai-guest-id': _guestId })
  }
}
