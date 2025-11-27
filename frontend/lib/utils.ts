import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { transposeChord } from '@/lib/utils/formatting/chord';
export { capitalize } from '@/lib/utils/string/capitalize';
export { pluralize, formatCount } from '@/lib/utils/array/pluralize';
export { clickElement } from '@/lib/utils/dom/selector';
