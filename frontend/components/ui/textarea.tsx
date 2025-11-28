import { cn } from '@/lib/utils'
import * as React from 'react'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div className="relative inline-block w-full">
      <div
        className={cn(
          "absolute inset-0 rounded-md p-[1px] gradient-border-subtle pointer-events-none -z-0 transition-opacity duration-150",
          isFocused ? "opacity-60" : "opacity-0"
        )}
      />
      <textarea
        data-slot="textarea"
        className={cn(
          'border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-background px-3 py-2 text-base shadow-sm transition-[border-color,box-shadow] duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative z-10',
          'hover:border-accent/30',
          'focus-visible:border-transparent focus-visible:ring-0',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
    </div>
  )
}

export {Textarea}
