import { useCallback } from 'react'
import { DB_NAME, STORE_NAME, DB_VERSION } from '@shared/constants'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function useIndexedDB() {
  const readCV = useCallback(async (): Promise<ArrayBuffer | null> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get('file')
      request.onsuccess = () => resolve((request.result as ArrayBuffer) ?? null)
      request.onerror = () => reject(request.error)
    })
  }, [])

  const writeCV = useCallback(async (buffer: ArrayBuffer): Promise<void> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const request = tx.objectStore(STORE_NAME).put(buffer, 'file')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [])

  const deleteCV = useCallback(async (): Promise<void> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const request = tx.objectStore(STORE_NAME).delete('file')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [])

  return { readCV, writeCV, deleteCV }
}

export default useIndexedDB
