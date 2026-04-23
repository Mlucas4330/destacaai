import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthContext } from '@features/auth/context/AuthContext'
import Button from '@shared/components/Button'

const API_URL = import.meta.env.VITE_API_URL as string

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed')
        return
      }
      await login(data.token, data.user.email)
      navigate('/', { replace: true })
    } catch {
      toast.error('Could not reach server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-5 p-5 h-full justify-center'>
      <div>
        <h1 className='text-lg font-semibold text-navy'>Create account</h1>
        <p className='text-xs text-navy-muted mt-0.5'>Start using DestacAI for free</p>
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-navy-muted'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='rounded-xl border border-border bg-surface px-3 py-2 text-sm text-navy outline-none focus:border-navy-muted'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-navy-muted'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className='rounded-xl border border-border bg-surface px-3 py-2 text-sm text-navy outline-none focus:border-navy-muted'
          />
          <p className='text-xs text-navy-muted'>Minimum 8 characters</p>
        </div>
        <Button type='submit' variant='primary' className='w-full' disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className='text-xs text-center text-navy-muted'>
        Already have an account?{' '}
        <Link to='/sign-in' className='text-navy underline underline-offset-2'>
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default SignUp
