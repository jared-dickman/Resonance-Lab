import { cn } from '@/lib/utils';
import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="relative inline-block w-full">
      <div
        className={cn(
          'absolute inset-0 p-[1px] gradient-border-subtle pointer-events-none -z-0 transition-all duration-150',
          isFocused ? 'opacity-60 rounded-t-none rounded-b-md' : 'opacity-0 rounded-md'
        )}
      />
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-accent selection:text-accent-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border bg-background px-3 py-1 text-base shadow-sm transition-[border-color,box-shadow,border-radius] duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative z-10',
          'hover:border-accent/30',
          'focus-visible:border-transparent focus-visible:ring-0',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          isFocused ? 'rounded-t-none rounded-b-md' : 'rounded-md',
          className
        )}
        onFocus={e => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
}

export { Input };
