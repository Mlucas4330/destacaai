export const chromeStorageClient = {
  get: async <T>(key: string): Promise<T | undefined> => {
    try {
      const result = await chrome.storage.local.get(key)
      return result[key] as T | undefined
    } catch {
      return undefined
    }
  },

  set: async (key: string, value: unknown): Promise<void> => {
    await chrome.storage.local.set({ [key]: value })
  },

  remove: async (key: string | string[]): Promise<void> => {
    await chrome.storage.local.remove(Array.isArray(key) ? key : [key])
  },
}
