import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signIn } from '../services/auth'
import { useAuthStore } from '../stores/auth'
import { SignInSchema } from '../schemas'

export function useSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      await login(data.token, data.user.email)
      navigate('/', { replace: true })
    },
    onError() {
      toast.error('An unexpected error occurred.')
    },
  })

  const submit = (email: string, password: string) => {
    const result = SignInSchema.safeParse({ email, password })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    mutation.mutate(result.data)
  }

  return { submit, email, setEmail, password, setPassword, isPending: mutation.isPending }
}
