export function drawFretboardBackground(
  ctx: CanvasRenderingContext2D,
  dimensions: {
    width: number;
    height: number;
    padding: number;
    fretboardWidth: number;
    fretboardHeight: number;
  }
): void {
  const { width, height, padding, fretboardWidth, fretboardHeight } = dimensions;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, '#4a3520');
  gradient.addColorStop(0.5, '#5a4530');
  gradient.addColorStop(1, '#4a3520');
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, padding, fretboardWidth, fretboardHeight);
}
