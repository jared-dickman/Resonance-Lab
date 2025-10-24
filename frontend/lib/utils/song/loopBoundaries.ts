export interface LoopBoundaries {
  startTop: number;
  endBottom: number;
}

export interface LoopRange {
  startSection: number;
  startLine: number;
  endSection: number;
  endLine: number;
}

export function calculateLoopBoundaries(
  container: HTMLDivElement,
  loopRange: LoopRange
): LoopBoundaries | null {
  const sections = container.querySelectorAll('[class*="section"]');
  if (sections.length === 0) return null;

  const startSection = sections[loopRange.startSection] as HTMLElement | undefined;
  const endSection = sections[loopRange.endSection] as HTMLElement | undefined;

  if (!startSection || !endSection) return null;

  const startTop = startSection.offsetTop - container.offsetTop;
  const endBottom = endSection.offsetTop - container.offsetTop + endSection.offsetHeight;

  return { startTop, endBottom };
}

export function shouldLoopRestart(
  scrollBottom: number,
  endBottom: number,
  bufferPixels: number = 50
): boolean {
  return scrollBottom >= endBottom + bufferPixels;
}
