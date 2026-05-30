import { Link } from 'react-router-dom'
import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <MaxWidthWrapper className="flex flex-col items-center gap-6">
        <AnimationContainer delay={0.1}>
          <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm rounded-full">
            Now in beta
            <ArrowRight className="w-3.5 h-3.5" />
          </Badge>
        </AnimationContainer>

        <AnimationContainer delay={0.2}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            The modern platform{' '}
            <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              for your SaaS
            </span>
          </h1>
        </AnimationContainer>

        <AnimationContainer delay={0.3}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Ship faster with a production-ready stack. Authentication, database,
            and deployment — all set up for you. No boilerplate, just your product.
          </p>
        </AnimationContainer>

        <AnimationContainer delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link to="/register" className={buttonVariants({ size: 'lg' })}>
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              See how it works
            </a>
          </div>
        </AnimationContainer>

        <AnimationContainer delay={0.5}>
          <p className="text-sm text-muted-foreground">
            No credit card required · Free tier available
          </p>
        </AnimationContainer>
      </MaxWidthWrapper>
    </section>
  )
}
