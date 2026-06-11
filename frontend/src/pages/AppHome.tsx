import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'

export function AppHome() {
  useEffect(() => { document.title = 'SaaS · Home' }, [])
  const { user } = useAuth()
  const name = user?.firstName || user?.email?.split('@')[0] || 'there'

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Good to see you, {name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's where your dashboard will live.</p>
        </div>

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
    </AppLayout>
  )
}
