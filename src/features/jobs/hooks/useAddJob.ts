import { useState, useEffect, useCallback } from 'react'
import { useCreateJob } from './useJobs'
import { chromeStorageClient } from '@/lib/chromeStorageClient'
import { extractMetadata } from '@/features/jobs/api/jobs'
import type { Job } from '@/shared/types'
import { STORAGE_KEYS } from '@/shared/constants'

const useAddJob = (onSave: (job: Job) => void) => {
  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)

  const createJob = useCreateJob()

  useEffect(() => {
    Promise.all([
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_DESCRIPTION),
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_TITLE),
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_COMPANY),
    ]).then(async ([desc, pendingTitle, pendingCompany]) => {
      if (desc) setDescription(desc)
      if (pendingTitle) setTitle(pendingTitle)
      if (pendingCompany) setCompany(pendingCompany)

      if (desc && (!pendingTitle || !pendingCompany)) {
        setIsExtracting(true)
        try {
          const extracted = await extractMetadata(desc)
          if (!pendingTitle && extracted.title) setTitle(extracted.title)
          if (!pendingCompany && extracted.company) setCompany(extracted.company)
        } catch {
          // extraction failure is non-fatal, user can fill in manually
        } finally {
          setIsExtracting(false)
        }
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const persistField = useCallback((field: string, value: string) => {
    chromeStorageClient.set(field, value)
  }, [])

  const updateTitle = useCallback((value: string) => {
    setTitle(value)
    persistField(STORAGE_KEYS.PENDING_TITLE, value)
  }, [persistField])

  const updateCompany = useCallback((value: string) => {
    setCompany(value)
    persistField(STORAGE_KEYS.PENDING_COMPANY, value)
  }, [persistField])

  const updateDescription = useCallback((value: string) => {
    setDescription(value)
    persistField(STORAGE_KEYS.PENDING_DESCRIPTION, value)
  }, [persistField])

  const extractFromDescription = useCallback(async () => {
    if (!description.trim() || isExtracting) return
    setIsExtracting(true)
    try {
      const extracted = await extractMetadata(description.trim())
      if (extracted.title) { setTitle(extracted.title); persistField(STORAGE_KEYS.PENDING_TITLE, extracted.title) }
      if (extracted.company) { setCompany(extracted.company); persistField(STORAGE_KEYS.PENDING_COMPANY, extracted.company) }
    } catch {
      // extraction failure is non-fatal
    } finally {
      setIsExtracting(false)
    }
  }, [description, isExtracting, persistField])

  const saveJob = useCallback(() => {
    createJob.mutate(
      { title: title.trim(), company: company.trim(), description: description.trim() },
      {
        onSuccess: (job) => {
          chromeStorageClient.remove([STORAGE_KEYS.PENDING_DESCRIPTION, STORAGE_KEYS.PENDING_TITLE, STORAGE_KEYS.PENDING_COMPANY])
          onSave(job as Job)
        },
      },
    )
  }, [title, company, description, createJob, onSave])

  const isValid = title.trim().length > 0 && company.trim().length > 0 && description.trim().length > 0
  const isPending = createJob.isPending

  return { title, company, description, updateTitle, updateCompany, updateDescription, saveJob, extractFromDescription, isValid, isPending, isExtracting }
}

export default useAddJob
