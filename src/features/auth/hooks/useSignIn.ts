import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { z } from 'zod'
import { signIn } from '../api'
import { useAuthStore } from '../stores/auth'
import { SignInSchema } from '../schemas'

type SignInInput = z.infer<typeof SignInSchema>

export function useSignIn() {
  const { register, handleSubmit, formState } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  })
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      await login(data.token, data.user.email)
      navigate('/', { replace: true })
    },
    onError(err) {
      toast.error(err.message ?? 'An unexpected error occurred.')
    },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data))

  return { register, formState, onSubmit, isPending: mutation.isPending }
}
