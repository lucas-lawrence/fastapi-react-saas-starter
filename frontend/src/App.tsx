import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AppHome } from '@/pages/AppHome'
import { Dashboard } from '@/pages/Dashboard'
import { Settings } from '@/pages/Settings'
import { ProfileSettings } from '@/pages/settings/ProfileSettings'
import { PasswordSettings } from '@/pages/settings/PasswordSettings'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<AppHome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="password" element={<PasswordSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
