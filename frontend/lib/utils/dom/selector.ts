export function clickElement(selector: string): void {
  const element = document.querySelector(selector) as HTMLElement | null;
  element?.click();
}

export function findElement<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}
