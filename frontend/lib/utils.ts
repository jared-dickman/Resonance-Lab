import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const DEFAULT_API_URL = 'http://localhost:8080';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_URL;
}

export { transposeChord } from './utils/formatting/chord';
export { capitalize, capitalizeWords } from './utils/string/capitalize';
export { pluralize, formatCount } from './utils/array/pluralize';
export { clickElement, findElement } from './utils/dom/selector';
