import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import EmptyState from '@features/jobs/components/EmptyState'
import JobList from '@features/jobs/components/JobList'
import useJobs from '@features/jobs/hooks/useJobs'
import useGeneratedCVs from '@features/jobs/hooks/useGeneratedCVs'

const Jobs = () => {
  const navigate = useNavigate()
  const { jobs, deleteJob, clearJobs } = useJobs()
  const { cvs, deleteCV, clearCVs } = useGeneratedCVs()

  useEffect(() => {
    chrome.storage.local.get('pendingDescription', (result: { pendingDescription?: string }) => {
      if (result.pendingDescription) {
        navigate('/add-job')
      }
    })
  }, [navigate])

  const handleDelete = (id: string) => {
    deleteJob(id)
    deleteCV(id)
  }

  const handleClearAll = () => {
    clearJobs()
    clearCVs()
  }

  return (
    <AnimatePresence mode='wait'>
      {jobs.length > 0 ? (
        <JobList
          key='list'
          jobs={jobs}
          onDelete={handleDelete}
          onGenerate={(id) => navigate(`/generate/${id}`)}
          onClearAll={handleClearAll}
          generatedCVs={cvs}
        />
      ) : (
        <EmptyState key='empty' />
      )}
    </AnimatePresence>
  )
}

export default Jobs
