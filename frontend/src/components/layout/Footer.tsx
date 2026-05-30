import { Link } from 'react-router-dom'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Support', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}


export function Footer() {
  return (
    <footer className="border-t py-16">
      <MaxWidthWrapper>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <Link to="/" className="text-lg font-bold">SaaS</Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The modern platform for your next SaaS product. Ship faster with a production-ready stack.
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <p className="text-sm font-semibold">{group}</p>
              <ul className="space-y-2.5">
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

        <div className="border-t pt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SaaS. All rights reserved.</p>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
