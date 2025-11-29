import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('relative overflow-hidden bg-muted rounded-md', className)}
      {...props}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

export { Skeleton };
