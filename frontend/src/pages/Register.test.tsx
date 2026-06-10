import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Register } from './Register'
import { useAuth } from '@/context/AuthContext'

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/ui/CountrySelect', () => ({
  CountrySelect: ({ onChange }: { onChange: (v: string) => void }) => (
    <input data-testid="country-select" aria-label="Country" onChange={e => onChange(e.target.value)} />
  ),
}))

const mockUseAuth = vi.mocked(useAuth)

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

const STRONG_PASSWORD = 'CorrectHorseBatteryStaple1!'

describe('Register', () => {
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      userLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: mockRegister,
      refreshUser: vi.fn(),
    })
  })

  function fillForm(overrides: {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
  } = {}) {
    const vals = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
      ...overrides,
    }
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: vals.firstName } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: vals.lastName } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: vals.email } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: vals.password } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: vals.confirmPassword } })
  }

  // Use fireEvent.submit on the form element directly to bypass HTML5 constraint
  // validation (type="email") and exercise our own handleSubmit logic.
  function submit(container: HTMLElement) {
    fireEvent.submit(container.querySelector('form')!)
  }

  it('shows error for invalid email', () => {
    const { container } = renderRegister()
    fillForm({ email: 'not-an-email' })
    submit(container)
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', () => {
    const { container } = renderRegister()
    fillForm({ confirmPassword: 'different' })
    submit(container)
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error for weak password', () => {
    const { container } = renderRegister()
    fillForm({ password: 'abc', confirmPassword: 'abc' })
    submit(container)
    expect(screen.getByText('Please choose a stronger password.')).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('calls register with correct args on valid submission', async () => {
    mockRegister.mockResolvedValue(undefined)
    const { container } = renderRegister()
    fillForm({})
    submit(container)
    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(
        'jane@example.com',
        STRONG_PASSWORD,
        'Jane',
        'Doe',
        '',
      )
    )
  })

  it('shows API error on register failure', async () => {
    mockRegister.mockRejectedValue(new Error('Email already in use'))
    const { container } = renderRegister()
    fillForm({})
    submit(container)
    expect(await screen.findByText('Email already in use')).toBeInTheDocument()
  })
})
