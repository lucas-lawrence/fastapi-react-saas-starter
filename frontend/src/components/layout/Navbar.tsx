import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold tracking-tight">
          SaaS
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Log in</Button>
          <Button size="sm">Get started</Button>
        </div>
      </div>
    </header>
  )
}
