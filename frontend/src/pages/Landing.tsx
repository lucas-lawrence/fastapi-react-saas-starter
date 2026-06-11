import { useEffect } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Features } from '@/components/sections/Features'
import { Hero } from '@/components/sections/Hero'
import { Pricing } from '@/components/sections/Pricing'

export function Landing() {
  useEffect(() => { document.title = 'SaaS' }, [])
  return (
    <div className="bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-background dark:via-background dark:to-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
