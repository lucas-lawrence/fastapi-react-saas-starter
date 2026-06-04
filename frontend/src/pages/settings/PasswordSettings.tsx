import { useEffect, useState } from 'react'
import zxcvbn from 'zxcvbn'
import { gql } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const UPDATE_PASSWORD_MUTATION = `
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updateUser(currentPassword: $currentPassword, newPassword: $newPassword) {
      id
    }
  }
`

const STRENGTH_CONFIG = [
  { label: 'Very weak',   color: 'bg-red-500' },
  { label: 'Weak',        color: 'bg-orange-500' },
  { label: 'Fair',        color: 'bg-yellow-500' },
  { label: 'Strong',      color: 'bg-blue-500' },
  { label: 'Very strong', color: 'bg-green-500' },
]

export function PasswordSettings() {
  useEffect(() => { document.title = 'SaaS · Settings · Password' }, [])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = newPassword ? zxcvbn(newPassword) : null
  const strengthScore = strength?.score ?? -1
  const strengthConfig = strengthScore >= 0 ? STRENGTH_CONFIG[strengthScore] : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (strengthScore < 2) {
      setError('Please choose a stronger password.')
      return
    }
    setLoading(true)
    try {
      await gql(UPDATE_PASSWORD_MUTATION, { currentPassword, newPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Password</h2>
        <p className="text-sm text-muted-foreground">Change your account password.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        {strengthConfig && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {STRENGTH_CONFIG.map((s, i) => (
                <div
                  key={s.label}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= strengthScore ? strengthConfig.color : 'bg-muted'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strengthConfig.label}</p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-500">Password updated.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Update password'}
      </Button>
    </form>
  )
}
