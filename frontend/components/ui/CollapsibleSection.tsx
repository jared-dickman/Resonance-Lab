'use client'

import type { ReactNode} from 'react';
import {useState} from 'react'
import {ChevronDown, ChevronUp} from 'lucide-react'
import { cn } from '@/lib/utils'
import {Button} from '@/components/ui/button'

interface CollapsibleSectionProps {
  title: string
  defaultExpanded?: boolean
  sticky?: boolean
  children: ReactNode
  className?: string
  badge?: ReactNode
  actions?: ReactNode
}

export function CollapsibleSection({
  title,
  defaultExpanded = true,
  sticky = false,
  children,
  className,
  badge,
  actions,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section className={cn('space-y-6', className)}>
      <div
        className={cn(
          'flex items-center justify-between py-4 lg:py-5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
          sticky && 'sticky top-0 z-10'
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
          {badge}
        </div>
        {actions}
      </div>

      <div
        className={cn(
          'transition-all duration-200 ease-in-out overflow-hidden',
          isExpanded ? 'opacity-100' : 'opacity-0 h-0'
        )}
      >
        {isExpanded && children}
      </div>
    </section>
  )
}
