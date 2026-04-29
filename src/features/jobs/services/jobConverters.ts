import type { Job, GuestJob } from '@/shared/types'

export function guestJobToJob(g: GuestJob): Job {
  return {
    id: g.id,
    userId: 'guest',
    title: g.title,
    company: g.company,
    description: g.description,
    status: g.status,
    atsStatus: g.atsStatus ?? 'idle',
    atsScore: g.atsScore ?? null,
    atsExplanation: g.atsExplanation ?? null,
    cvGenerationStatus: g.cvGenerationStatus,
    cvGenerationError: null,
    cvR2Key: g.cvR2Key,
    createdAt: g.createdAt,
    generatedCvAtsStatus: g.generatedCvAtsStatus ?? 'idle',
    generatedCvAtsScore: g.generatedCvAtsScore ?? null,
    generatedCvAtsExplanation: g.generatedCvAtsExplanation ?? null,
  }
}
