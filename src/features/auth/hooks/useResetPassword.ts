import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { z } from 'zod'
import { resetPassword } from '../api'
import { ResetPasswordSchema } from '../schemas'
import type { ResetPasswordFormProps } from '../types'

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export function useResetPassword({ email, code }: ResetPasswordFormProps) {
  const { register, handleSubmit, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  })
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: ({ newPassword }: ResetPasswordInput) => resetPassword(email, code, newPassword),
    onSuccess: () => {
      toast.success('Password updated.')
      navigate('/sign-in', { replace: true })
    },
    onError(err: Error & { response?: { data?: { error?: string } } }) {
      toast.error(err.response?.data?.error ?? err.message ?? 'Could not reach server. Please try again.')
    },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data))

  return { register, formState, onSubmit, isPending: mutation.isPending }
}
