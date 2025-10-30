const STRING_COUNT = 6;
const STRING_WIDTH_BASE = 1;
const STRING_WIDTH_INCREMENT = 0.4;

export function drawStrings(
  ctx: CanvasRenderingContext2D,
  dimensions: {
    width: number;
    padding: number;
    stringSpacing: number;
    isInverted?: boolean;
  }
): void {
  const { width, padding, stringSpacing, isInverted = false } = dimensions;

  ctx.strokeStyle = '#e0e0e0';

  for (let i = 0; i < STRING_COUNT; i++) {
    const stringPosition = isInverted ? STRING_COUNT - 1 - i : i;
    const y = padding + stringPosition * stringSpacing;
    const stringWidth = STRING_WIDTH_BASE + (STRING_COUNT - 1 - i) * STRING_WIDTH_INCREMENT;
    ctx.lineWidth = stringWidth;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
}
