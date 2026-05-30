import { AnimationContainer } from '@/components/global/AnimationContainer'
import { MaxWidthWrapper } from '@/components/global/MaxWidthWrapper'
import { Star } from 'lucide-react'

const REVIEWS = [
  { name: 'Alex Chen', role: 'CTO at Finflow', review: 'The best SaaS starter I have used. Auth, database, and Docker all pre-configured — saved us weeks of setup.', rating: 5 },
  { name: 'Sarah Kim', role: 'Founder at Loopkit', review: 'Clean architecture and great defaults. FastAPI with async SQLAlchemy is exactly what we needed for our backend.', rating: 5 },
  { name: 'Marcus Webb', role: 'Lead Engineer at Draftly', review: 'The refresh token rotation is implemented properly out of the box. Rarely see that in starters.', rating: 5 },
  { name: 'Priya Nair', role: 'Solo founder', review: 'Went from idea to deployed MVP in a weekend. The Docker setup is surprisingly smooth.', rating: 4 },
  { name: 'Tom Bauer', role: 'Backend Engineer at Stackr', review: 'Alembic migrations + async SQLAlchemy is a great combo. The codebase is clean and easy to extend.', rating: 5 },
  { name: 'Lena Müller', role: 'Full-stack dev', review: 'Tailwind v4 + shadcn/ui is a great pairing. The component structure is exactly how I want to start a project.', rating: 5 },
  { name: 'James Okafor', role: 'Product Engineer at Tenzil', review: 'Having JWT + refresh tokens already wired up is a huge time saver. Production-ready from day one.', rating: 4 },
  { name: 'Yuki Tanaka', role: 'Indie hacker', review: 'Clear separation between frontend and backend, good Docker defaults, and the ADRs are a nice touch.', rating: 5 },
  { name: 'Camille Dupont', role: 'Engineer at Labelbox', review: 'The Railway deployment ADR saved me from guessing. Thoughtful decisions baked in throughout the project.', rating: 5 },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="py-24">
      <MaxWidthWrapper>
        <AnimationContainer className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary">Reviews</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Loved by developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            See what engineers and founders are saying about this starter.
          </p>
        </AnimationContainer>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {REVIEWS.map((review, i) => (
            <AnimationContainer key={review.name} delay={i * 0.07} className="break-inside-avoid">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <Stars count={review.rating} />
                <p className="text-sm text-muted-foreground">"{review.review}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${review.name}`}
                    alt={review.name}
                    className="w-9 h-9 rounded-full bg-muted"
                  />
                  <div>
                    <p className="text-sm font-medium">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
