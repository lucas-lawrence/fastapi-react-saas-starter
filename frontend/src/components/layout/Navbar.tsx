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
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-2xl border border-white/20 bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-xl p-1.5 z-50">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="block rounded-xl px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
    const handler = () => setScrolled(window.scrollY > 20)
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
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div
        className={cn(
          'w-full max-w-4xl rounded-full border transition-all duration-300',
          scrolled
            ? 'bg-white/85 dark:bg-black/85 backdrop-blur-xl shadow-lg border-black/10 dark:border-white/10'
            : 'bg-white/60 dark:bg-black/60 backdrop-blur-md shadow-sm border-black/8 dark:border-white/8'
        )}
      >
        <div className="flex items-center justify-between h-12 px-5">
          <Link to="/" className="text-base font-bold tracking-tight shrink-0">
            SaaS
          </Link>

          <nav ref={navRef} className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative">
                {link.children ? (
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    {link.label}
                    <ChevronDown className={cn('w-3 h-3 transition-transform', openDropdown === link.label && 'rotate-180')} />
                  </button>
                ) : (
                  <a
                    href={link.href}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 block"
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

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Sign In
            </Link>
            <Link
              to="/register"
              className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 rounded-full')}
            >
              <Zap className="w-3.5 h-3.5" />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
