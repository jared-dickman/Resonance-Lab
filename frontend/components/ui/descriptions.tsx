import { cn } from '@/lib/utils';
import * as React from 'react';

interface DescriptionsItemProps {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
  className?: string;
}

interface DescriptionsProps {
  children: React.ReactNode;
  column?: 1 | 2 | 3;
  className?: string;
  bordered?: boolean;
}

function DescriptionsItem({}: DescriptionsItemProps) {
  return null;
}

function Descriptions({ children, column = 2, className, bordered = false }: DescriptionsProps) {
  const items = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<DescriptionsItemProps> =>
      React.isValidElement(child) && child.type === DescriptionsItem
  );

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid gap-4',
          column === 1 && 'grid-cols-1',
          column === 2 && 'grid-cols-1 md:grid-cols-2',
          column === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {items.map((item, index) => {
          const { label, children, span = 1, className: itemClassName } = item.props;
          return (
            <div
              key={index}
              className={cn(
                'flex flex-col gap-1',
                bordered && 'p-3 rounded-lg border border-border bg-muted/30',
                span === 2 && 'md:col-span-2',
                span === 3 && 'md:col-span-2 lg:col-span-3',
                itemClassName
              )}
            >
              <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
              <dd className="text-sm text-foreground">{children}</dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Descriptions.Item = DescriptionsItem;

export { Descriptions, DescriptionsItem };
