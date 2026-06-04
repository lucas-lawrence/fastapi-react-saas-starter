import { useEffect } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Features } from '@/components/sections/Features'
import { Hero } from '@/components/sections/Hero'
import { Pricing } from '@/components/sections/Pricing'

export function Landing() {
  useEffect(() => { document.title = 'SaaS' }, [])
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
