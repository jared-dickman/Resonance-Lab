'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-all duration-150 hover:bg-accent-subtle/30 hover:border-accent/30 data-[state=selected]:bg-accent-subtle/50 data-[state=selected]:border-accent/40',
        className
      )}
      {...props}
    />
  );
}

interface TableHeadProps extends React.ComponentProps<'th'> {
  sortDirection?: 'ascending' | 'descending' | 'none';
  sortable?: boolean;
}

function TableHead({ className, sortDirection, sortable, children, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        sortable && 'cursor-pointer select-none hover:text-accent transition-colors duration-150',
        className
      )}
      aria-sort={sortDirection}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && sortDirection !== 'none' && (
          <span
            className="inline-block transition-transform duration-200"
            style={{
              transform: sortDirection === 'ascending' ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            ▲
          </span>
        )}
      </div>
    </th>
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
