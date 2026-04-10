import { useState, useEffect, useCallback } from 'react'
import type { Job, Config } from '@shared/types'
import { extractJobMetadata } from '@features/jobs/services/cvGenerator'

interface PendingStorage {
  pendingDescription?: string
  pendingTitle?: string
  pendingCompany?: string
  config?: Config
}

const useAddJob = (onSave: (job: Job) => void) => {
  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')

  useEffect(() => {
    chrome.storage.local.get(
      ['pendingDescription', 'pendingTitle', 'pendingCompany', 'config'],
      (result: PendingStorage) => {
        if (result.pendingDescription) setDescription(result.pendingDescription)
        if (result.pendingTitle) setTitle(result.pendingTitle)
        if (result.pendingCompany) setCompany(result.pendingCompany)

        if (
          result.pendingDescription &&
          !result.pendingTitle &&
          !result.pendingCompany &&
          result.config?.apiKey
        ) {
          extractJobMetadata(result.pendingDescription, result.config).then(({ title, company }) => {
            if (title) {
              setTitle(title)
              chrome.storage.local.set({ pendingTitle: title })
            }
            if (company) {
              setCompany(company)
              chrome.storage.local.set({ pendingCompany: company })
            }
          })
        }
      },
    )
  }, [])

  const persistField = useCallback((field: string, value: string) => {
    chrome.storage.local.set({ [field]: value })
  }, [])

  const updateTitle = useCallback((value: string) => {
    setTitle(value)
    persistField('pendingTitle', value)
  }, [persistField])

  const updateCompany = useCallback((value: string) => {
    setCompany(value)
    persistField('pendingCompany', value)
  }, [persistField])

  const updateDescription = useCallback((value: string) => {
    setDescription(value)
    persistField('pendingDescription', value)
  }, [persistField])

  const saveJob = useCallback(() => {
    const job: Job = {
      id: crypto.randomUUID(),
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      createdAt: Date.now(),
    }
    onSave(job)
    chrome.storage.local.remove(['pendingDescription', 'pendingTitle', 'pendingCompany'])
  }, [title, company, description, onSave])

  const isValid = title.trim().length > 0 && company.trim().length > 0 && description.trim().length > 0

  return { title, company, description, updateTitle, updateCompany, updateDescription, saveJob, isValid }
}

export default useAddJob
