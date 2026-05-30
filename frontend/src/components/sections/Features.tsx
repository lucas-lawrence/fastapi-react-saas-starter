import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { ShieldCheck, Database, Zap, Layers, Box, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authentication',
    description: 'JWT access tokens with refresh token rotation. Register, login, and logout out of the box.',
    className: 'md:col-span-2',
  },
  {
    icon: Database,
    title: 'Database',
    description: 'PostgreSQL with async SQLAlchemy and Alembic migrations. Schema changes are versioned and reproducible.',
    className: '',
  },
  {
    icon: Zap,
    title: 'Fast API',
    description: 'FastAPI with auto-generated Swagger docs. Async by default, built-in validation via Pydantic.',
    className: '',
  },
  {
    icon: Layers,
    title: 'Modern Frontend',
    description: 'React + TypeScript + Tailwind CSS v4 + shadcn/ui. Opinionated but flexible component system.',
    className: 'md:col-span-2',
  },
  {
    icon: Box,
    title: 'Docker Ready',
    description: 'All services containerised with Docker Compose. One command to spin up the full stack locally.',
    className: '',
  },
  {
    icon: Rocket,
    title: 'Deploy Anywhere',
    description: 'Optimised for Railway, Render, or any container platform. Production config separate from local dev.',
    className: '',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <MaxWidthWrapper>
        <AnimationContainer className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to ship
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Skip the boilerplate. Focus on building your product.
          </p>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <AnimationContainer key={feature.title} delay={i * 0.1} className={cn('group', feature.className)}>
              <div className="h-full rounded-2xl border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
