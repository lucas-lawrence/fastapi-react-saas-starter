import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'

const NAV = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Password', href: '/settings/password' },
]

export function Settings() {
  useEffect(() => { document.title = 'SaaS · Settings' }, [])
  const location = useLocation()

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="flex gap-8">
          <nav className="w-40 shrink-0 space-y-0.5">
            {NAV.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'block px-3 py-2 rounded-xl text-sm transition-colors',
                  location.pathname === item.href
                    ? 'bg-black/6 dark:bg-white/8 font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/4 dark:hover:bg-white/4'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
