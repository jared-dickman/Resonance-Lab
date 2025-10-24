import { FINGER_COLORS } from '@/lib/constants/canvas.constants';

export interface DrawKeyConfig {
  x: number;
  width: number;
  height: number;
  isPressed: boolean;
  finger?: number;
  showFingerNumbers: boolean;
  isBlackKey: boolean;
}

export function drawWhiteKey(
  ctx: CanvasRenderingContext2D,
  config: DrawKeyConfig
): void {
  const { x, width, height, isPressed } = config;

  const gradient = ctx.createLinearGradient(x, 0, x, height);
  if (isPressed) {
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
  } else {
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(1, '#e0e0e0');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(x, 0, width - 1, height);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, 0, width - 1, height);

  const shadowGradient = ctx.createLinearGradient(x, height - 20, x, height);
  shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(x, height - 20, width - 1, 20);
}

export function drawBlackKey(
  ctx: CanvasRenderingContext2D,
  config: DrawKeyConfig
): void {
  const { x, width, height, isPressed } = config;

  const gradient = ctx.createLinearGradient(x, 0, x, height);
  if (isPressed) {
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
  } else {
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#000');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(x, 0, width, height);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x + 2, 2, width - 4, 8);
}

export function drawFingerNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  finger: number,
  size: 'small' | 'large'
): void {
  const radius = size === 'large' ? 12 : 10;
  const fontSize = size === 'large' ? 14 : 12;
  const color = FINGER_COLORS[finger] ?? '#666';

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(finger.toString(), x, y);
}
