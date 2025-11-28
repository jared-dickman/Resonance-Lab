import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative inline-block w-full">
        <div
          className={cn(
            'absolute inset-0 p-[1px] bg-gradient-to-r from-sapphire-500 via-sapphire-400 to-sapphire-500 pointer-events-none -z-0 transition-all duration-150',
            isFocused ? 'opacity-60 rounded-t-none rounded-b-md' : 'opacity-0 rounded-md'
          )}
        />
        <input
          type={type}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-sapphire-500/20 selection:text-foreground dark:bg-input/30 border-input h-11 md:h-10 w-full min-w-0 border bg-background px-3 py-2 text-base shadow-sm transition-[border-color,box-shadow,border-radius] duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative z-10',
            'hover:border-sapphire-500/30',
            'focus-visible:border-transparent focus-visible:ring-0',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            isFocused ? 'rounded-t-none rounded-b-md' : 'rounded-md',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
