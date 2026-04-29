import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@shared/components/Button'
import Input from '@shared/components/Input'
import { STORAGE_KEYS } from '@shared/constants'


const ForgotPassword = () => {
  return (
    <div className='flex flex-col gap-5 p-5 h-full justify-center'>
      <div>
        <h1 className='text-lg font-semibold text-navy'>Forgot password</h1>
        <p className='text-xs text-navy-muted mt-0.5'>Enter your email and we'll send you a code.</p>
      </div>
      <ForgotPasswordForm />
      <p className='text-xs text-center text-navy-muted'>
        Remembered it?{' '}
        <Link to='/sign-in' className='text-navy underline underline-offset-2'>
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default ForgotPassword
