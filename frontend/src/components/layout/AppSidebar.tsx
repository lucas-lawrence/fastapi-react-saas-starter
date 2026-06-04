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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-60 z-50 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
          <span className="text-base font-bold tracking-tight">SaaS</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname.startsWith(item.href)
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
