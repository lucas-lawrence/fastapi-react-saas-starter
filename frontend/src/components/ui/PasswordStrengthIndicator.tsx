import zxcvbn from 'zxcvbn'
import { STRENGTH_CONFIG } from '@/lib/validation'

interface Props {
  password: string
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null
  const score = zxcvbn(password).score
  const config = STRENGTH_CONFIG[score]
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {STRENGTH_CONFIG.map((s, i) => (
          <div
            key={s.label}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? config.color : 'bg-muted'}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{config.label}</p>
    </div>
  )
}
