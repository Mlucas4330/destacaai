import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useCreateJob } from './useJobs'
import { chromeStorageClient } from '@/lib/storageClient'
import { STORAGE_KEYS } from '../constants'
import { AddJobSchema } from '../schemas'
import { extractMetadata } from '../api'

type AddJobInput = z.infer<typeof AddJobSchema>

const PENDING_KEYS = [STORAGE_KEYS.PENDING_DESCRIPTION, STORAGE_KEYS.PENDING_TITLE, STORAGE_KEYS.PENDING_COMPANY]

const useAddJob = () => {
  const { register, handleSubmit, formState, setValue, watch } = useForm<AddJobInput>({
    resolver: zodResolver(AddJobSchema),
    defaultValues: { title: '', company: '', description: '' },
  })
  const [isExtracting, setIsExtracting] = useState(false)
  const createJob = useCreateJob()
  const navigate = useNavigate()

  const description = watch('description')
  const title = watch('title')
  const company = watch('company')

  useEffect(() => {
    Promise.all([
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_DESCRIPTION),
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_TITLE),
      chromeStorageClient.get<string>(STORAGE_KEYS.PENDING_COMPANY),
    ]).then(async ([desc, pendingTitle, pendingCompany]) => {
      if (desc) setValue('description', desc)
      if (pendingTitle) setValue('title', pendingTitle)
      if (pendingCompany) setValue('company', pendingCompany)

      if (desc && (!pendingTitle || !pendingCompany)) {
        setIsExtracting(true)
        try {
          const extracted = await extractMetadata(desc)
          if (!pendingTitle && extracted.title) setValue('title', extracted.title)
          if (!pendingCompany && extracted.company) setValue('company', extracted.company)
        } catch {
          // extraction failure is non-fatal
        } finally {
          setIsExtracting(false)
        }
      }
    })
  }, [setValue])

  useEffect(() => { if (title) chromeStorageClient.set(STORAGE_KEYS.PENDING_TITLE, title) }, [title])
  useEffect(() => { if (company) chromeStorageClient.set(STORAGE_KEYS.PENDING_COMPANY, company) }, [company])
  useEffect(() => { if (description) chromeStorageClient.set(STORAGE_KEYS.PENDING_DESCRIPTION, description) }, [description])

  const extractFromDescription = async () => {
    if (!description?.trim() || isExtracting) return
    setIsExtracting(true)
    try {
      const extracted = await extractMetadata(description.trim())
      if (extracted.title && !title.trim()) setValue('title', extracted.title)
      if (extracted.company && !company.trim()) setValue('company', extracted.company)
    } catch {
      // extraction failure is non-fatal
    } finally {
      setIsExtracting(false)
    }
  }

  const onSubmit = handleSubmit((data) => {
    createJob.mutate(
      { title: data.title.trim(), company: data.company.trim(), description: data.description.trim() },
      {
        onSuccess: () => {
          chromeStorageClient.remove(PENDING_KEYS)
          navigate('/')
        },
      },
    )
  })

  return {
    register,
    formState,
    onSubmit,
    extractFromDescription,
    description,
    isExtracting,
    isPending: createJob.isPending,
  }
}

export default useAddJob
