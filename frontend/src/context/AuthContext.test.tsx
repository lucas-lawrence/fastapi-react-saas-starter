import type { ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthProvider, useAuth, type AuthUser } from './AuthContext'

vi.mock('@/lib/api', () => ({
  gql: vi.fn(),
}))

import { gql } from '@/lib/api'
const mockGql = vi.mocked(gql)

function makeMockStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
  }
}

let mockSession: ReturnType<typeof makeMockStorage>
let mockLocal: ReturnType<typeof makeMockStorage>

beforeEach(() => {
  vi.clearAllMocks()
  mockSession = makeMockStorage()
  mockLocal = makeMockStorage()
  vi.stubGlobal('sessionStorage', mockSession)
  vi.stubGlobal('localStorage', mockLocal)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

const mockUser: AuthUser = {
  id: '1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  country: 'SG',
}

describe('AuthContext', () => {
  it('starts unauthenticated when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('login stores tokens and sets user', async () => {
    mockGql
      .mockResolvedValueOnce({ login: { accessToken: 'acc', refreshToken: 'ref' } })
      .mockResolvedValueOnce({ me: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('jane@example.com', 'Password1!')
    })

    expect(mockSession.getItem('access_token')).toBe('acc')
    expect(mockLocal.getItem('refresh_token')).toBe('ref')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('login throws when gql rejects', async () => {
    mockGql.mockRejectedValueOnce(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.login('jane@example.com', 'wrong')
      })
    ).rejects.toThrow('Invalid credentials')

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logout clears tokens and resets state', async () => {
    mockSession.setItem('access_token', 'acc')
    mockLocal.setItem('refresh_token', 'ref')
    mockGql
      .mockResolvedValueOnce({ me: mockUser }) // useEffect on mount
      .mockResolvedValueOnce({ logout: true })  // logout mutation

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.userLoading).toBe(false))

    await act(async () => {
      await result.current.logout()
    })

    expect(mockSession.getItem('access_token')).toBeNull()
    expect(mockLocal.getItem('refresh_token')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('register calls register mutation then auto-logs in', async () => {
    mockGql
      .mockResolvedValueOnce({ register: { id: '1' } })
      .mockResolvedValueOnce({ login: { accessToken: 'acc', refreshToken: 'ref' } })
      .mockResolvedValueOnce({ me: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register('jane@example.com', 'Password1!', 'Jane', 'Doe', 'SG')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })
})
