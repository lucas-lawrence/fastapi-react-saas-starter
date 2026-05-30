import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'

const COMPANIES = ['Asana', 'Linear', 'Raycast', 'Vercel', 'Loom', 'Notion']

export function Companies() {
  return (
    <section className="py-16 border-y bg-muted/20">
      <MaxWidthWrapper>
        <AnimationContainer>
          <p className="text-sm text-center text-muted-foreground mb-10">
            Trusted by teams at world-class companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {COMPANIES.map((company) => (
              <span
                key={company}
                className="text-xl font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors tracking-tight"
              >
                {company}
              </span>
            ))}
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </section>
  )
}
