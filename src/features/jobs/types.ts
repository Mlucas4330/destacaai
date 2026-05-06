export type JobStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'offer'
export type ProcessingStatus = 'idle' | 'queued' | 'processing' | 'done' | 'failed'

export interface Job {
  id: string
  userId: string
  title: string
  company: string
  description: string
  status: JobStatus
  atsStatus: ProcessingStatus
  atsScore: number | null
  atsExplanation: string | null
  cvGenerationStatus: ProcessingStatus
  cvGenerationError: string | null
  cvR2Key: string | null
  createdAt: string
  generatedCvAtsStatus: ProcessingStatus
  generatedCvAtsScore: number | null
  generatedCvAtsExplanation: string | null
}

export interface JobListProps {
  jobs: Job[]
}
