'use client';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  maxItems,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(value: string) {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onChange(selected.filter(item => item !== value));
    } else {
      if (maxItems && selected.length >= maxItems) {
        return;
      }
      onChange([...selected, value]);
    }
  }

  function handleRemove(value: string, e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  }

  const selectedLabels = selected
    .map(value => options.find(opt => opt.value === value)?.label)
    .filter(Boolean) as string[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex w-full items-start rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
            'min-h-[44px]',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 items-center min-h-[28px]">
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            ) : (
              selectedLabels.map((label, index) => (
                <span
                  key={selected[index]}
                  className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-2.5 py-1 text-xs font-medium"
                >
                  {label}
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center rounded-sm hover:bg-background/20 transition-colors cursor-pointer"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={e => {
                      const val = selected[index];
                      if (val) handleRemove(val, e);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const val = selected[index];
                        if (val) handleRemove(val, e);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 mt-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup className="p-1">
              {options.map(option => {
                const isSelected = selected.includes(option.value);
                const isDisabled =
                  !isSelected && maxItems !== undefined && selected.length >= maxItems;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      if (!isDisabled) {
                        handleSelect(option.value);
                      }
                    }}
                    disabled={isDisabled}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-sm border border-border',
                        isSelected && 'bg-foreground text-background border-foreground'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
