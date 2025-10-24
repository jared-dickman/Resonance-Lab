import { GAME_VISUAL } from '@/lib/constants/game.constants';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number }
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i < size.width; i += GAME_VISUAL.GRID_SPACING_PX) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size.height);
    ctx.stroke();
  }
}
