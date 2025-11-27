import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function apiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) {
    throw new Error('API_BASE_URL environment variable is not set');
  }
  return url;
}

export { transposeChord } from '@/lib/utils/formatting/chord';
export { capitalize } from '@/lib/utils/string/capitalize';
export { pluralize, formatCount } from '@/lib/utils/array/pluralize';
export { clickElement } from '@/lib/utils/dom/selector';
