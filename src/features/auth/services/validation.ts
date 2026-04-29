export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  return { valid: true }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' }
  }
  return { valid: true }
}

export function validateVerificationCode(code: string): { valid: boolean; error?: string } {
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return { valid: false, error: 'Code must be 6 digits' }
  }
  return { valid: true }
}
