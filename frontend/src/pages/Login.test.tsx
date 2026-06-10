import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Login } from './Login'
import { useAuth } from '@/context/AuthContext'

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      userLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      refreshUser: vi.fn(),
    })
  })

  it('calls login with provided credentials', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password1!')
    )
  })

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('server error'))
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
  })

  it('disables button while loading', async () => {
    let resolve: () => void
    mockLogin.mockReturnValue(new Promise<void>(r => { resolve = r }))
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled()
    resolve!()
  })
})
