import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Database, Zap, Layers, Box, Rocket } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Authentication',
    description: 'JWT access tokens with refresh token rotation. Register, login, and logout out of the box.',
  },
  {
    icon: Database,
    title: 'Database',
    description: 'PostgreSQL with async SQLAlchemy and Alembic migrations. Schema changes are versioned and reproducible.',
  },
  {
    icon: Zap,
    title: 'Fast API',
    description: 'FastAPI with auto-generated Swagger docs. Async by default, built-in validation via Pydantic.',
  },
  {
    icon: Layers,
    title: 'Modern Frontend',
    description: 'React + TypeScript + Tailwind CSS v4 + shadcn/ui. Opinionated but flexible component system.',
  },
  {
    icon: Box,
    title: 'Docker Ready',
    description: 'All services containerised with Docker Compose. One command to spin up the full stack locally.',
  },
  {
    icon: Rocket,
    title: 'Deploy Anywhere',
    description: 'Optimised for Railway, Render, or any container platform. Production config separate from local dev.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to ship
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Skip the boilerplate. Focus on building your product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border bg-card">
              <CardHeader className="pb-3">
                <feature.icon className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
