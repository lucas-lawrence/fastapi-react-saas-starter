import zxcvbn from 'zxcvbn'

export const PASSWORD_MIN_SCORE = 2

export const STRENGTH_CONFIG = [
  { label: 'Very weak',   color: 'bg-red-500' },
  { label: 'Weak',        color: 'bg-orange-500' },
  { label: 'Fair',        color: 'bg-yellow-500' },
  { label: 'Strong',      color: 'bg-blue-500' },
  { label: 'Very strong', color: 'bg-green-500' },
] as const

export function validatePassword(password: string, confirm: string): string | null {
  if (password !== confirm) return 'Passwords do not match.'
  if (zxcvbn(password).score < PASSWORD_MIN_SCORE) return 'Please choose a stronger password.'
  return null
}
