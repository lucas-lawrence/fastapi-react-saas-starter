const links = {
  Product: ['Features', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog', 'Careers'],
  Legal: ['Privacy', 'Terms', 'Cookies'],
}

export function Footer() {
  return (
    <footer className="border-t py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="text-lg font-semibold">SaaS</p>
            <p className="text-sm text-muted-foreground">
              The modern platform for your next SaaS product.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <p className="text-sm font-medium">{group}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaaS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
