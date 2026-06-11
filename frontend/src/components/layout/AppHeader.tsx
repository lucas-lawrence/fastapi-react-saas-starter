import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react'
import { useAuth, type AuthUser } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

function getInitials(user: AuthUser): string {
  if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  if (user.firstName) return user.firstName[0].toUpperCase()
  return user.email[0].toUpperCase()
}

interface AppHeaderProps {
  onMenuToggle: () => void
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user, userLoading, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-black/6 dark:border-white/6 bg-background/85 backdrop-blur-xl flex items-center px-4 gap-3">

      {/* Left: hamburger + logo */}
      <button
        onClick={onMenuToggle}
        className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      <Link to="/home" className="text-base font-bold tracking-tight">SaaS</Link>

      {/* Centre: search */}
      <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-8 pl-8 pr-3 rounded-full border border-black/8 dark:border-white/8 bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Right: icon pill group + avatar */}
      <div className="ml-auto flex items-center gap-2">

        {/* Grouped icon buttons */}
        <div className="flex items-center gap-0.5 rounded-full border border-black/8 dark:border-white/8 bg-muted/30 px-1 py-1">
          <button
            onClick={toggle}
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
          <Link
            to="/settings"
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {userLoading
              ? <span className="w-4 h-4 rounded-full bg-primary-foreground/30 animate-pulse" />
              : user ? getInitials(user) : '?'}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-black/8 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden z-50">
              {userLoading ? (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded-full animate-pulse w-2/3" />
                    <div className="h-3 bg-muted rounded-full animate-pulse w-full" />
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center shrink-0">
                    {getInitials(user)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-black/6 dark:border-white/6 mx-2" />

              <div className="p-1.5">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                  Account settings
                </Link>
              </div>

              <div className="border-t border-black/6 dark:border-white/6 mx-2" />

              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
