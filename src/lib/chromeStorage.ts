export interface StorageGetResult {
  [key: string]: unknown
}

export async function get(keys: string | string[] | null): Promise<StorageGetResult> {
  return chrome.storage.local.get(keys) as Promise<StorageGetResult>;
}

export async function set(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve)
  })
}

export async function remove(keys: string | string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve)
  })
}

export async function clear(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve)
  })
}

export default {
  get,
  set,
  remove,
  clear,
}
