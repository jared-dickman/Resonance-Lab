import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-sapphire-500/30 focus-visible:ring-[3px] transition-all duration-150 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-sapphire-600 text-white [a&]:hover:bg-sapphire-700 [a&]:hover:scale-105',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 [a&]:hover:scale-105',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 [a&]:hover:scale-105',
        outline:
          'text-foreground border-sapphire-500/30 [a&]:hover:bg-sapphire-500/10 [a&]:hover:text-sapphire-400 [a&]:hover:scale-105',
        success:
          'border-transparent bg-green-600 text-white [a&]:hover:bg-green-700 [a&]:hover:scale-105',
        warning:
          'border-transparent bg-amber-500 text-black [a&]:hover:bg-amber-600 [a&]:hover:scale-105',
        sapphire:
          'relative border-sapphire-500/40 bg-gradient-to-r from-sapphire-500/20 via-sapphire-500/10 to-sapphire-500/20 text-sapphire-400 [a&]:hover:from-sapphire-500/30 [a&]:hover:via-sapphire-500/20 [a&]:hover:to-sapphire-500/30 [a&]:hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
