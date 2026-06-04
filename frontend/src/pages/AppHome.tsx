import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export function AppHome() {
  useEffect(() => { document.title = 'SaaS Home' }, [])
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">SaaS Home</h1>
      </div>
    </AppLayout>
  )
}
