import { useState, useEffect, useCallback } from 'react'
import useIndexedDB from '@shared/hooks/useIndexedDB'
import { MAX_SIZE_BYTES } from '@shared/constants'

const useCV = () => {
  const { readCV, writeCV, deleteCV } = useIndexedDB()
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    chrome.storage.local.get('cvFileName', (result: { cvFileName?: string }) => {
      if (result.cvFileName) setFileName(result.cvFileName)
    })
  }, [])

  const uploadCV = useCallback(async (file: File) => {
    setError(null)
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File size must be 10 MB or less.')
      return
    }
    const buffer = await file.arrayBuffer()
    await writeCV(buffer)
    setFileName(file.name)
    chrome.storage.local.set({ cvFileName: file.name })
  }, [writeCV])

  const removeCV = useCallback(async () => {
    await deleteCV()
    setFileName(null)
    chrome.storage.local.remove('cvFileName')
  }, [deleteCV])

  return { fileName, error, uploadCV, removeCV, readCV }
}

export default useCV
