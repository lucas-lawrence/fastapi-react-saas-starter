import { describe, it, expect } from 'vitest'
import { validatePassword, PASSWORD_MIN_SCORE } from './validation'

describe('validatePassword', () => {
  const STRONG = 'CorrectHorseBatteryStaple1!'

  it('returns null for valid matching passwords above minimum strength', () => {
    expect(validatePassword(STRONG, STRONG)).toBeNull()
  })

  it('returns mismatch error when passwords differ', () => {
    expect(validatePassword(STRONG, 'different')).toBe('Passwords do not match.')
  })

  it('returns strength error when score is below minimum', () => {
    expect(validatePassword('abc', 'abc')).toBe('Please choose a stronger password.')
  })

  it('checks mismatch before strength', () => {
    // Both errors apply — mismatch is reported first
    expect(validatePassword('abc', 'xyz')).toBe('Passwords do not match.')
  })

  it('PASSWORD_MIN_SCORE is 2', () => {
    expect(PASSWORD_MIN_SCORE).toBe(2)
  })
})
