import { createContext, useContext, useState } from 'react'
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

interface AuthContextValue {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string, country?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem('access_token')
  )

  const login = async (email: string, password: string) => {
    const data = await gql<{ login: { accessToken: string; refreshToken: string } }>(
      LOGIN_MUTATION,
      { email, password }
    )
    sessionStorage.setItem('access_token', data.login.accessToken)
    localStorage.setItem('refresh_token', data.login.refreshToken)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await gql(LOGOUT_MUTATION, { refreshToken }).catch(() => {})
    }
    sessionStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
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
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
