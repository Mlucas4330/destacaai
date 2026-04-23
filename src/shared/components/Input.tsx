import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

interface InputProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password' | 'email'
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  error?: string
  className?: string
}

const Input = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required,
  minLength,
  error,
  className = '',
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const resolvedType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className='text-xs font-medium text-navy-muted'>{label}</label>
      )}
      <div className='relative'>
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-bg
            ${type === 'password' ? 'pr-9' : ''}
            ${error
      ? 'border-danger focus:border-danger'
      : 'border-border focus:border-navy-muted'
    }`}
        />
        {type === 'password' && (
          <motion.button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className='absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-navy-muted hover:text-navy transition-colors'
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </motion.button>
        )}
      </div>
      {error && <span className='text-xs text-danger'>{error}</span>}
    </div>
  )
}

export default Input
