import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export function Dashboard() {
  useEffect(() => { document.title = 'SaaS · Dashboard' }, [])
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
    </AppLayout>
  )
}
