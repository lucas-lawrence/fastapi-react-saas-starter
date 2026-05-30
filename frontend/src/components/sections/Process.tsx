import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { FolderOpen, Link2, BarChart3 } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: FolderOpen,
    title: 'Set up your project',
    description: 'Clone the repo, run docker compose up, and your full stack is running locally in minutes.',
  },
  {
    step: '02',
    icon: Link2,
    title: 'Build your product',
    description: 'Auth, database, and frontend are ready. Add your features on top of a solid foundation.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Ship and scale',
    description: 'Deploy to Railway or any cloud platform. Environment variables keep production config separate.',
  },
]

export function Process() {
  return (
    <section id="process" className="py-24 bg-muted/20">
      <MaxWidthWrapper>
        <AnimationContainer className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From zero to production in 3 steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No week-long setup. Get your stack running and start building.
          </p>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <AnimationContainer key={step.step} delay={i * 0.15}>
              <div className="relative flex flex-col gap-4 p-6 rounded-2xl border bg-card">
                <span className="text-5xl font-bold text-muted-foreground/10 absolute top-4 right-6 select-none">
                  {step.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
