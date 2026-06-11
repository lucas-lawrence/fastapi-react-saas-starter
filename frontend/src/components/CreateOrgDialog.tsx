import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { gql } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CREATE_ORG_MUTATION = `
  mutation CreateOrganization($name: String!, $slug: String!) {
    createOrganization(name: $name, slug: $slug) {
      id
      name
      slug
    }
  }
`

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateOrgDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slugTouched) setSlug(toSlug(name))
  }, [name, slugTouched])

  const reset = () => {
    setName('')
    setSlug('')
    setSlugTouched(false)
    setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await gql(CREATE_ORG_MUTATION, { name: name.trim(), slug })
      reset()
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-black/8 dark:border-white/8 bg-white/90 dark:bg-background backdrop-blur-xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">New organization</h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/6 dark:hover:bg-white/8 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Acme Inc."
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="acme"
              required
            />
            <p className="text-xs text-muted-foreground">Used as your subdomain — cannot be changed later.</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" className="rounded-full" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={loading || !name.trim() || !slug}>
              {loading ? 'Creating...' : 'Create organization'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
