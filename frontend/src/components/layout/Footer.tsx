import { Link } from 'react-router-dom'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t py-16">
      <MaxWidthWrapper>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="text-lg font-bold">SaaS</Link>
            <p className="text-sm text-muted-foreground">
              The modern platform for your next SaaS product.
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <p className="text-sm font-medium">{group}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SaaS. All rights reserved.</p>
          <p>Built with FastAPI + React</p>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
