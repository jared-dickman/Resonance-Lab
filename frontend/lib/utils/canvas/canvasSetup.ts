import { DEVICE_PIXEL_RATIO } from '@/lib/constants/canvas.constants';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dpr: number;
}

export function setupCanvas(canvas: HTMLCanvasElement, size: CanvasSize): CanvasContext | null {
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const dpr = DEVICE_PIXEL_RATIO.CURRENT;

  canvas.width = size.width * dpr;
  canvas.height = size.height * dpr;

  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;

  context.scale(dpr, dpr);

  return {
    canvas,
    context,
    dpr,
  };
}

export function clearCanvas(context: CanvasRenderingContext2D, size: CanvasSize): void {
  context.clearRect(0, 0, size.width, size.height);
}

export function fillCanvas(
  context: CanvasRenderingContext2D,
  size: CanvasSize,
  color: string
): void {
  context.fillStyle = color;
  context.fillRect(0, 0, size.width, size.height);
}
