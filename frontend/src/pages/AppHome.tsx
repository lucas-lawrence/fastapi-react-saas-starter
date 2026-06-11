import { useMemo, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, Settings, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { CreateOrgDialog } from '@/components/CreateOrgDialog'
import { gql } from '@/lib/api'

const MY_ORGS_QUERY = `
  query MyOrganizations {
    myOrganizations {
      id
      name
      slug
    }
  }
`

type Org = { id: string; name: string; slug: string }

const GREETINGS = {
  morning: {
    headings: ['Good morning', 'Morning', 'Rise and shine'],
    subtexts: ['Ready to make today count?', 'Hope you slept well.', "Let's get things done."],
  },
  afternoon: {
    headings: ['Good afternoon', 'Hey', 'Good to see you'],
    subtexts: ['Hope your day is going well.', 'What are we tackling today?', 'Keep the momentum going.'],
  },
  evening: {
    headings: ['Good evening', 'Evening', 'Hey there'],
    subtexts: ['Wrapping up for the day?', 'Hope it was a productive one.', 'Almost there.'],
  },
  night: {
    headings: ['Burning the midnight oil', 'Still up', 'Late night energy'],
    subtexts: ["Don't forget to get some rest.", 'The best ideas come at night.', "You're dedicated — we'll give you that."],
  },
}

function getGreeting(name: string) {
  const now = new Date()
  const hour = now.getHours()
  const seed = now.getFullYear() * 100000 + now.getMonth() * 3200 + now.getDate() * 100 + hour

  let slot: keyof typeof GREETINGS
  if (hour >= 5 && hour < 12) slot = 'morning'
  else if (hour >= 12 && hour < 18) slot = 'afternoon'
  else if (hour >= 18 && hour < 22) slot = 'evening'
  else slot = 'night'

  const g = GREETINGS[slot]
  return {
    heading: `${g.headings[seed % g.headings.length]}, ${name}`,
    subtext: g.subtexts[(seed + 1) % g.subtexts.length],
  }
}

export function AppHome() {
  useEffect(() => { document.title = 'SaaS · Home' }, [])
  const { user } = useAuth()
  const name = user?.firstName || user?.email?.split('@')[0] || 'there'
  const { heading, subtext } = useMemo(() => getGreeting(name), [name])

  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchOrgs = useCallback(async () => {
    try {
      const data = await gql<{ myOrganizations: Org[] }>(MY_ORGS_QUERY)
      setOrgs(data.myOrganizations ?? [])
    } finally {
      setOrgsLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrgs() }, [fetchOrgs])

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Organizations</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/5 backdrop-blur-sm hover:bg-black/4 dark:hover:bg-white/8 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New organization
            </button>
          </div>

          {orgsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : orgs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-10 flex flex-col items-center gap-3 text-center">
              <Building2 className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No organizations yet.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-sm px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Create your first organization
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orgs.map(org => (
                <div
                  key={org.id}
                  className="rounded-2xl border border-black/6 dark:border-white/6 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/8 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/settings/profile"
              className="group rounded-2xl border border-black/6 dark:border-white/6 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 hover:border-black/12 dark:hover:border-white/12 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/8 flex items-center justify-center mb-3 group-hover:bg-black/8 dark:group-hover:bg-white/12 transition-colors">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">Update your name, email and country</p>
            </Link>

            <Link
              to="/settings/password"
              className="group rounded-2xl border border-black/6 dark:border-white/6 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 hover:border-black/12 dark:hover:border-white/12 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/8 flex items-center justify-center mb-3 group-hover:bg-black/8 dark:group-hover:bg-white/12 transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Security</p>
              <p className="text-xs text-muted-foreground mt-0.5">Change your password</p>
            </Link>
          </div>
        </div>
      </div>

      <CreateOrgDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchOrgs}
      />
    </AppLayout>
  )
}
