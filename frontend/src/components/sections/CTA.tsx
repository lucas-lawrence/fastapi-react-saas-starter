import { Link } from 'react-router-dom'
import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24">
      <MaxWidthWrapper>
        <AnimationContainer>
          <div className="relative rounded-3xl border bg-gradient-to-br from-primary/5 via-background to-primary/5 px-8 py-20 text-center overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

            <p className="text-sm font-medium text-primary mb-4">Get started today</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 max-w-2xl mx-auto">
              Start building your{' '}
              <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                SaaS product
              </span>{' '}
              today
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Everything is set up. Just clone, run, and start building. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className={buttonVariants({ size: 'lg' })}>
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                Learn more
              </a>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </section>
  )
}
