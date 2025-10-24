const SINGULAR_THRESHOLD = 1;

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === SINGULAR_THRESHOLD) {
    return singular;
  }
  return plural ?? `${singular}s`;
}

export function formatCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
