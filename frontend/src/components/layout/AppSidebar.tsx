import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-60 z-50 bg-background/95 backdrop-blur-xl border-r border-black/6 dark:border-white/6 flex flex-col transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-black/6 dark:border-white/6 shrink-0">
          <span className="text-base font-bold tracking-tight">SaaS</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                location.pathname.startsWith(item.href)
                  ? 'bg-black/6 dark:bg-white/8 font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/4 dark:hover:bg-white/4'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
