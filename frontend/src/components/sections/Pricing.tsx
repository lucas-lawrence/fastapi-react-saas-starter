import { useState } from 'react'
import { CircleCheck, CreditCard } from 'lucide-react'
import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    name: 'Free',
    description: 'For most individuals',
    monthly: 0,
    yearly: 0,
    features: [
      'Up to 3 projects',
      '1GB storage',
      'Community support',
      'Basic analytics',
      'API access',
    ],
    cta: 'Start for free',
    href: '/register',
    featured: false,
  },
  {
    name: 'Pro',
    description: 'For small businesses',
    monthly: 29,
    yearly: 19,
    features: [
      'Unlimited projects',
      '50GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom domains',
      'AI powered suggestions',
    ],
    cta: 'Get started',
    href: '/register',
    featured: true,
  },
  {
    name: 'Business',
    description: 'For large organisations',
    monthly: 99,
    yearly: 79,
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated manager',
      'SLA guarantee',
      'SSO / SAML',
      'AI powered suggestions',
    ],
    cta: 'Contact team',
    href: '#',
    featured: false,
  },
]

export function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-24">
      <MaxWidthWrapper>
        <AnimationContainer className="text-center space-y-4 mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose a plan that works for you
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get started today and enjoy more features with our pro plans.
          </p>
        </AnimationContainer>

        <AnimationContainer delay={0.1} className="flex justify-center mb-12">
          <div className="flex items-center rounded-lg border p-1 gap-1 bg-muted/30">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-5 py-1.5 text-sm rounded-md transition-all',
                billing === 'monthly' ? 'bg-background shadow text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-5 py-1.5 text-sm rounded-md transition-all flex items-center gap-2',
                billing === 'yearly' ? 'bg-background shadow text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="text-xs font-medium text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                Save 30%
              </span>
            </button>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier, i) => (
            <AnimationContainer key={tier.name} delay={i * 0.1}>
              <div
                className={cn(
                  'flex flex-col h-full rounded-2xl border overflow-hidden',
                  tier.featured ? 'border-violet-500 shadow-[0_0_0_1px] shadow-violet-500/50' : 'border-border'
                )}
              >
                <div className={cn('px-5 py-4', tier.featured ? 'bg-violet-500/5' : 'bg-muted/20')}>
                  <p className="text-base font-semibold">{tier.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{tier.description}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-bold">
                      ${billing === 'monthly' ? tier.monthly : tier.yearly}
                    </span>
                    {tier.monthly > 0 && (
                      <span className="text-sm text-muted-foreground mb-1">/month</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col flex-1 px-5 py-4 border-t gap-5">
                  <ul className="space-y-2.5 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm">
                        <CircleCheck className="w-4 h-4 text-violet-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tier.href}
                    className={cn(
                      buttonVariants({ variant: tier.featured ? 'default' : 'outline' }),
                      'w-full justify-center',
                      tier.featured && 'bg-violet-600 hover:bg-violet-700 border-violet-600'
                    )}
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>

        <AnimationContainer delay={0.3} className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
          <CreditCard className="w-4 h-4" />
          No credit card required
        </AnimationContainer>
      </MaxWidthWrapper>
    </section>
  )
}
