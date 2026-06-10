import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PasswordSettings } from './PasswordSettings'

vi.mock('@/lib/api', () => ({
  gql: vi.fn(),
}))

import { gql } from '@/lib/api'
const mockGql = vi.mocked(gql)

const STRONG_PASSWORD = 'CorrectHorseBatteryStaple1!'

describe('PasswordSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function fillForm(overrides: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  } = {}) {
    const vals = {
      currentPassword: 'OldPassword1!',
      newPassword: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
      ...overrides,
    }
    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: vals.currentPassword } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: vals.newPassword } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: vals.confirmPassword } })
  }

  it('shows error when new passwords do not match', () => {
    render(<PasswordSettings />)
    fillForm({ confirmPassword: 'different' })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(mockGql).not.toHaveBeenCalled()
  })

  it('shows error for weak new password', () => {
    render(<PasswordSettings />)
    fillForm({ newPassword: 'abc', confirmPassword: 'abc' })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    expect(screen.getByText('Please choose a stronger password.')).toBeInTheDocument()
    expect(mockGql).not.toHaveBeenCalled()
  })

  it('calls gql on valid submission', async () => {
    mockGql.mockResolvedValue({ updateUser: { id: '1' } })
    render(<PasswordSettings />)
    fillForm({})
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => expect(mockGql).toHaveBeenCalledOnce())
    expect(screen.getByText('Password updated.')).toBeInTheDocument()
  })

  it('shows API error on failure', async () => {
    mockGql.mockRejectedValue(new Error('Current password is incorrect'))
    render(<PasswordSettings />)
    fillForm({})
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument()
  })
})
