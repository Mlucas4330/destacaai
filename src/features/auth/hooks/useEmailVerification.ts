import type React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { z } from 'zod'
import { verifyCode } from '../api'
import { useAuthStore } from '../stores/auth'
import { VerifyCodeSchema } from '../schemas'

type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>

export function useEmailVerification({ email }: { email: string }) {
  const { register, handleSubmit, formState, setValue, control } = useForm<VerifyCodeInput>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues: { code: '' },
  })
  const { login, clearPendingVerification } = useAuthStore()
  const navigate = useNavigate()
  const code = useWatch({ control, name: 'code' })

  const mutation = useMutation({
    mutationFn: (data: VerifyCodeInput) => verifyCode(email, data.code),
    onSuccess: async (data) => {
      await clearPendingVerification()
      await login(data.token, data.user.email ?? '')
      navigate('/', { replace: true })
    },
    onError(err: Error) {
      toast.error(err.message ?? 'Could not reach server. Please try again.')
    },
  })

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.replace(/\D/g, '').slice(0, 6)
    setValue('code', formatted, { shouldValidate: !!formState.errors.code })
  }

  return {
    codeField: register('code'),
    handleCodeChange,
    code,
    formState,
    onSubmit: handleSubmit((data) => mutation.mutate(data)),
    isPending: mutation.isPending,
  }
}
