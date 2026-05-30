import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  {
    label: 'Features',
    href: '#features',
    children: [
      { label: 'Authentication', href: '#features', description: 'JWT auth with refresh tokens' },
      { label: 'Database', href: '#features', description: 'PostgreSQL with migrations' },
      { label: 'API', href: '#features', description: 'FastAPI with auto docs' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#' },
  {
    label: 'Resources',
    href: '#',
    children: [
      { label: 'Documentation', href: '#', description: 'Guides and API reference' },
      { label: 'Blog', href: '#', description: 'Tips and updates' },
    ],
  },
  { label: 'Changelog', href: '#' },
]

function DropdownMenu({ items }: { items: { label: string; href: string; description: string }[] }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border bg-popover shadow-lg p-1.5 z-50">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="block rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
        >
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </a>
      ))}
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled ? 'border-b bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-12 lg:px-20 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          SaaS
        </Link>

        <nav ref={navRef} className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative">
              {link.children ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  {link.label}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', openDropdown === link.label && 'rotate-180')} />
                </button>
              ) : (
                <a
                  href={link.href}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 block"
                >
                  {link.label}
                </a>
              )}
              {link.children && openDropdown === link.label && (
                <DropdownMenu items={link.children} />
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign In
          </Link>
          <Link
            to="/register"
            className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
          >
            <Zap className="w-3.5 h-3.5" />
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
