export function clickElement(selector: string): void {
  const element = document.querySelector(selector) as HTMLElement | null;
  element?.click();
}
