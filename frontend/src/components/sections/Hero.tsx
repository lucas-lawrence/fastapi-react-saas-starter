import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
          Now in beta
        </span>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          The modern platform <br className="hidden md:block" /> for your SaaS
        </h1>

        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Ship faster with a production-ready stack. Authentication, database,
          and deployment — all set up for you.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Button size="lg">Get started for free</Button>
          <Button size="lg" variant="outline">See how it works</Button>
        </div>
      </div>
    </section>
  )
}
