import { useEffect, useState } from 'react'
import { gql } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($firstName: String, $lastName: String, $email: String, $country: String) {
    updateUser(firstName: $firstName, lastName: $lastName, email: $email, country: $country) {
      id
      email
      firstName
      lastName
      country
    }
  }
`

export function ProfileSettings() {
  useEffect(() => { document.title = 'SaaS · Settings · Profile' }, [])
  const { user, refreshUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [country, setCountry] = useState(user?.country ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await gql(UPDATE_PROFILE_MUTATION, {
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        country: country || null,
      })
      await refreshUser()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Update your personal information.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="country">Country</Label>
        <CountrySelect value={country} onChange={setCountry} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-500">Profile updated.</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
