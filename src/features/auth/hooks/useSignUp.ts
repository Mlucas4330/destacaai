import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signUp } from '../services/auth'
import { chromeStorageClient } from '@/lib/chromeStorageClient'
import { STORAGE_KEYS } from '../constants'
import { SignUpSchema } from '../schemas'

export function useSignUp() {
  const [email, setEmailState] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    chromeStorageClient.get<{ email?: string }>(STORAGE_KEYS.PENDING_SIGNUP).then((draft) => {
      if (draft?.email) setEmailState(draft.email)
    })
  }, [])

  const handleEmailChange = async (v: string) => {
    setEmailState(v)
    const current = (await chromeStorageClient.get<{ email?: string }>(STORAGE_KEYS.PENDING_SIGNUP)) ?? {}
    chromeStorageClient.set(STORAGE_KEYS.PENDING_SIGNUP, { ...current, email: v })
  }

  const mutation = useMutation({
    mutationFn: ({ password }: { password: string }) => signUp(email, password),
    onSuccess: async () => {
      await chromeStorageClient.remove(STORAGE_KEYS.PENDING_SIGNUP)
      await chromeStorageClient.set(STORAGE_KEYS.PENDING_VERIFICATION, { email, purpose: 'email-verification' })
      navigate('/verify-code', { state: { email, purpose: 'email-verification' } })
    },
    onError(err: Error & { response?: { data?: { error?: string } } }) {
      toast.error(err.response?.data?.error ?? err.message ?? 'Could not reach server. Please try again.')
    },
  })

  const submit = (password: string) => {
    const result = SignUpSchema.safeParse({ email, password })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    mutation.mutate({ password })
  }

  return { email, handleEmailChange, submit, isPending: mutation.isPending }
}
