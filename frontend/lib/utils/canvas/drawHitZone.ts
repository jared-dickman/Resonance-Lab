export function drawHitZone(
  ctx: CanvasRenderingContext2D,
  config: { width: number; hitZoneY: number }
): void {
  const { width, hitZoneY } = config;
  const hitZoneHeight = 60;
  const hitZoneOffset = 30;
  const perfectZoneHeight = 20;
  const perfectZoneOffset = 10;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, hitZoneY - hitZoneOffset, width, hitZoneHeight);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, hitZoneY - hitZoneOffset, width, hitZoneHeight);

  ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
  ctx.fillRect(0, hitZoneY - perfectZoneOffset, width, perfectZoneHeight);
}
