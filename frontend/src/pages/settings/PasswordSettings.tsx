import { useEffect, useState } from 'react'
import { gql } from '@/lib/api'
import { validatePassword } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

const UPDATE_PASSWORD_MUTATION = `
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updateUser(currentPassword: $currentPassword, newPassword: $newPassword) {
      id
    }
  }
`

export function PasswordSettings() {
  useEffect(() => { document.title = 'SaaS · Settings · Password' }, [])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const pwError = validatePassword(newPassword, confirmPassword)
    if (pwError) {
      setError(pwError)
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
        <PasswordStrengthIndicator password={newPassword} />
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
