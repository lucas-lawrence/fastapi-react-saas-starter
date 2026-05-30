import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function MaxWidthWrapper({ children, className }: Props) {
  return (
    <section className={cn('mx-auto w-full max-w-screen-xl px-4 md:px-12 lg:px-20', className)}>
      {children}
    </section>
  )
}
