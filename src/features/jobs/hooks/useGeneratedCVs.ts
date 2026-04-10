import { useCallback } from 'react'
import useStorage from '@shared/hooks/useStorage'

const useGeneratedCVs = () => {
  const [cvs, setCvs] = useStorage<Record<string, string>>('generatedCVs', {})

  const saveCV = useCallback((jobId: string, html: string) => {
    setCvs({ ...cvs, [jobId]: html })
  }, [cvs, setCvs])

  const deleteCV = useCallback((jobId: string) => {
    const updated = { ...cvs }
    delete updated[jobId]
    setCvs(updated)
  }, [cvs, setCvs])

  const clearCVs = useCallback(() => setCvs({}), [setCvs])

  return { cvs, saveCV, deleteCV, clearCVs }
}

export default useGeneratedCVs
