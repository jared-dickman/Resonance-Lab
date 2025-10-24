const STRING_COUNT = 6;
const STRING_WIDTH_BASE = 1;
const STRING_WIDTH_INCREMENT = 0.4;

export function drawStrings(
  ctx: CanvasRenderingContext2D,
  dimensions: {
    width: number;
    padding: number;
    stringSpacing: number;
  }
): void {
  const { width, padding, stringSpacing } = dimensions;

  ctx.strokeStyle = '#e0e0e0';

  for (let i = 0; i < STRING_COUNT; i++) {
    const y = padding + i * stringSpacing;
    const stringWidth = STRING_WIDTH_BASE + (STRING_COUNT - 1 - i) * STRING_WIDTH_INCREMENT;
    ctx.lineWidth = stringWidth;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
}
