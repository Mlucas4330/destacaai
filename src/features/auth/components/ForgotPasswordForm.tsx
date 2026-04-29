import Button from "@/shared/components/Button"
import Input from "@/shared/components/Input"
import { STORAGE_KEYS } from "@/shared/constants"
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()


  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
      <Input
        id='email'
        label='Email'
        type='email'
        value={email}
        onChange={setEmail}
        autoComplete='email'
        required
      />
      <Button type='submit' variant='primary' className='w-full' disabled={loading}>
        {loading ? 'Sending...' : 'Send code'}
      </Button>
    </form>
  )
}

export default ForgotPasswordForm