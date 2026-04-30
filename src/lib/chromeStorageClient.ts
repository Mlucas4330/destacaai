export const chromeStorageClient = {
  get: async <T>(key: string): Promise<T | undefined> => {
    try {
      const result = await chrome.storage.local.get(key)
      return result[key] as T | undefined
    } catch {
      return undefined
    }
  },

  set: (key: string, value: unknown) => chrome.storage.local.set({ [key]: value }),

  remove: (key: string | string[]) => chrome.storage.local.remove(Array.isArray(key) ? key : [key]),
}
