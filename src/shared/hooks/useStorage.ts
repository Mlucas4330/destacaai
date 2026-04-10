import { useState, useEffect, useCallback } from 'react'

function useStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    chrome.storage.local.get(key, (result) => {
      if (result[key] !== undefined) {
        setState(result[key] as T)
      }
    })
  }, [key])

  const setValue = useCallback((value: T) => {
    setState(value)
    chrome.storage.local.set({ [key]: value })
  }, [key])

  return [state, setValue]
}

export default useStorage
