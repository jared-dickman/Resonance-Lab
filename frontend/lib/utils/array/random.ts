/**
 * Select a random element from an array
 * @returns Random element or undefined if array is empty
 */
export function selectRandom<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Select a random element from an array with fallback
 * @returns Random element or fallback if array is empty
 */
export function selectRandomWithFallback<T>(array: readonly T[], fallback: T): T {
  return selectRandom(array) ?? fallback
}
