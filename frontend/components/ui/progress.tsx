'use client'

import { cn } from '@/lib/utils'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import {motion} from 'framer-motion'
import {useReducedMotion} from '@/components/ui/ai/hooks/useReducedMotion'

function Progress({
                    className,
                    value,
                    ...props
                  }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-zinc-200 dark:bg-zinc-700 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        asChild
        data-slot="progress-indicator"
      >
        <motion.div
          className={cn(
            'h-full w-full flex-1'
          )}
          initial={{x: '-100%'}}
          animate={{
            x: `-${100 - (value || 0)}%`,
          }}
          transition={
            prefersReducedMotion
              ? {duration: 0}
              : {
                  type: 'spring',
                  stiffness: 80,
                  damping: 20,
                  mass: 1,
                }
          }
          style={{
            background: 'var(--wizard-progress-bar)',
            willChange: 'transform',
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export {Progress}
