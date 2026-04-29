export interface StorageGetResult {
  [key: string]: unknown
}

export async function get(keys?: string | string[]): Promise<StorageGetResult> {
  const keysArray = typeof keys === 'string' ? [keys] : (keys || [])
  const result: StorageGetResult = {}

  if (keysArray.length === 0) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            result[key] = JSON.parse(value)
          } catch {
            result[key] = value
          }
        }
      }
    }
  } else {
    for (const key of keysArray) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      }
    }
  }

  return result
}

export async function set(items: Record<string, unknown>): Promise<void> {
  for (const [key, value] of Object.entries(items)) {
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
}

export async function remove(keys: string | string[]): Promise<void> {
  const keysArray = typeof keys === 'string' ? [keys] : keys

  for (const key of keysArray) {
    localStorage.removeItem(key)
  }
}

export async function clear(): Promise<void> {
  localStorage.clear()
}

export default {
  get,
  set,
  remove,
  clear,
}
