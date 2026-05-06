import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { z } from 'zod'
import { forgotPassword } from '../api'
import { chromeStorageClient } from '@/lib/storageClient'
import { STORAGE_KEYS } from '../constants'
import { ForgotPasswordSchema } from '../schemas'

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export function useForgotPassword() {
  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => forgotPassword(email),
    onSuccess: async (_, { email }) => {
      await chromeStorageClient.set(STORAGE_KEYS.PENDING_VERIFICATION, { email, purpose: 'password-reset' })
      navigate('/verify-code', { state: { email, purpose: 'password-reset' } })
    },
    onError(err: Error & { response?: { data?: { error?: string } } }) {
      toast.error(err.response?.data?.error ?? err.message ?? 'Could not reach server. Please try again.')
    },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data))

  return { register, formState, onSubmit, isPending: mutation.isPending }
}
