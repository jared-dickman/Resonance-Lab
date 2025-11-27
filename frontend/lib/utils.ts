import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const DEFAULT_API_URL = 'http://localhost:8080';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_API_URL;
}

export { transposeChord } from '@/lib/utils/formatting/chord';
export { capitalize } from '@/lib/utils/string/capitalize';
export { pluralize, formatCount } from '@/lib/utils/array/pluralize';
export { clickElement } from '@/lib/utils/dom/selector';
