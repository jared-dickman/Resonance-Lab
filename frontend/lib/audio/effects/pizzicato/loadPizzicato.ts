/**
 * Helper to load Pizzicato only in browser environments.
 * Prevents Next.js from importing the library during SSR where Web Audio APIs are unavailable.
 */

type PizzicatoModule = typeof import('pizzicato');

let cachedPizzicato: PizzicatoModule | null = null;

export function loadPizzicato(): PizzicatoModule {
  if (cachedPizzicato) {
    return cachedPizzicato;
  }

  if (typeof window === 'undefined') {
    throw new Error('Pizzicato is only available in browser environments.');
  }

  const module = require('pizzicato') as PizzicatoModule & { default?: PizzicatoModule };
  const resolved = module.default ?? module;

  cachedPizzicato = resolved;
  return resolved;
}
