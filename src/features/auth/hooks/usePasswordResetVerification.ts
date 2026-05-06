import type React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import type { z } from 'zod'
import { useAuthStore } from '../stores/auth'
import { VerifyCodeSchema } from '../schemas'

type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>

export function usePasswordResetVerification({ email }: { email: string }) {
  const { register, handleSubmit, formState, setValue, control } = useForm<VerifyCodeInput>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues: { code: '' },
  })
  const { clearPendingVerification } = useAuthStore()
  const navigate = useNavigate()
  const code = useWatch({ control, name: 'code' })

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.replace(/\D/g, '').slice(0, 6)
    setValue('code', formatted, { shouldValidate: !!formState.errors.code })
  }

  const onSubmit = handleSubmit(async (data) => {
    await clearPendingVerification()
    navigate('/reset-password', { state: { email, code: data.code } })
  })

  return {
    codeField: register('code'),
    handleCodeChange,
    code,
    formState,
    onSubmit,
    isPending: false,
  }
}
