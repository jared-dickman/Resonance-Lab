export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number }
): void {
  ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
  ctx.fillRect(0, 0, size.width, size.height);
}
