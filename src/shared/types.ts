export interface UserProfile {
  id: string
  email: string | null
  tier: 'free' | 'paid'
  generationsUsed: number
  generationsLimit: number
  cvFileName: string | null
  hasCv: boolean
  firstName: string | null
  lastName: string | null
}
