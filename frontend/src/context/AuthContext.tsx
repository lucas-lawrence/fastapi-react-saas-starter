import { createContext, useContext, useEffect, useState } from 'react'
import { gql } from '@/lib/api'

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!, $firstName: String, $lastName: String, $country: String) {
    register(email: $email, password: $password, firstName: $firstName, lastName: $lastName, country: $country) {
      id
    }
  }
`

const ME_QUERY = `
  query Me {
    me {
      id
      email
      firstName
      lastName
    }
  }
`

export interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  userLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string, country?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function clearTokens() {
  sessionStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem('access_token')
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userLoading, setUserLoading] = useState(() => !!sessionStorage.getItem('access_token'))

  useEffect(() => {
    if (!isAuthenticated) return
    setUserLoading(true)
    gql<{ me: AuthUser | null }>(ME_QUERY)
      .then(data => {
        if (data.me) {
          setUser(data.me)
        } else {
          // Token exists but server rejected it — clear session
          clearTokens()
          setIsAuthenticated(false)
        }
      })
      .catch(() => {
        // Network error — leave session intact, user can retry
      })
      .finally(() => setUserLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const data = await gql<{ login: { accessToken: string; refreshToken: string } }>(
      LOGIN_MUTATION,
      { email, password }
    )
    sessionStorage.setItem('access_token', data.login.accessToken)
    localStorage.setItem('refresh_token', data.login.refreshToken)
    const meData = await gql<{ me: AuthUser }>(ME_QUERY)
    setUser(meData.me)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await gql(LOGOUT_MUTATION, { refreshToken }).catch(() => {})
    }
    clearTokens()
    setUser(null)
    setIsAuthenticated(false)
  }

  const register = async (email: string, password: string, firstName?: string, lastName?: string, country?: string) => {
    await gql(REGISTER_MUTATION, {
      email,
      password,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      country: country ?? null,
    })
    await login(email, password)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
