import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire-500/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-all [&_svg]:duration-200 hover:[&_svg]:scale-110 active:[&_svg]:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-sapphire-600 text-white shadow-sm shadow-black/5 dark:shadow-sapphire/20 hover:bg-sapphire-700 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-sapphire/30 active:bg-sapphire-800 active:shadow-sm',
        primary: 'bg-sapphire-600 text-white shadow-sm shadow-black/5 dark:shadow-sapphire/20 hover:bg-sapphire-700 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-sapphire/30 active:bg-sapphire-800 active:shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90 hover:shadow-md active:bg-destructive/80 active:shadow-sm',
        outline:
          'border border-sapphire-500 bg-transparent text-foreground shadow-sm shadow-black/5 dark:shadow-white/5 hover:bg-sapphire-500/10 hover:border-sapphire-400 hover:shadow hover:shadow-black/10 dark:hover:shadow-sapphire/20 active:bg-sapphire-500/20 active:border-sapphire-600 hover:[&_svg]:rotate-3 active:[&_svg]:rotate-0',
        secondary:
          'border border-sapphire-500/50 bg-transparent text-foreground shadow-sm shadow-black/5 dark:shadow-white/5 hover:bg-sapphire-500/10 hover:border-sapphire-500 hover:shadow active:bg-sapphire-500/20 active:border-sapphire-600 hover:[&_svg]:rotate-3 active:[&_svg]:rotate-0',
        ghost: 'hover:bg-sapphire-500/10 hover:text-sapphire-400 active:bg-sapphire-500/20',
        link: 'text-sapphire-500 underline-offset-4 hover:underline hover:text-sapphire-400',
        sapphire: 'bg-gradient-to-r from-sapphire-700 to-sapphire-500 text-white shadow-md shadow-sapphire-500/20 hover:shadow-lg hover:shadow-sapphire-500/30 hover:from-sapphire-600 hover:to-sapphire-400 active:from-sapphire-800 active:to-sapphire-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-10 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
