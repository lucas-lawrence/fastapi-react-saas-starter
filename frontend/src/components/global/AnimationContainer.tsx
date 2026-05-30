import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  delay?: number
  reverse?: boolean
  className?: string
}

export function AnimationContainer({ children, delay = 0, reverse = false, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reverse ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  )
}
