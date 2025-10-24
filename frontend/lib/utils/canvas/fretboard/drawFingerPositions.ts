import { FINGER_COLORS } from '@/lib/constants/canvas.constants';

const MUTED_STRING = -1;
const OPEN_STRING = 0;
const MUTED_SYMBOL_SIZE = 8;
const OPEN_SYMBOL_RADIUS = 8;
const FINGER_DOT_RADIUS = 12;
const BARRE_LINE_WIDTH = 20;
const BARRE_OPACITY = 0.7;
const STRING_COUNT = 6;

interface Barre {
  fret: number;
  fromString: number;
  toString: number;
}

export function drawMutedString(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - MUTED_SYMBOL_SIZE, y - MUTED_SYMBOL_SIZE);
  ctx.lineTo(x + MUTED_SYMBOL_SIZE, y + MUTED_SYMBOL_SIZE);
  ctx.moveTo(x + MUTED_SYMBOL_SIZE, y - MUTED_SYMBOL_SIZE);
  ctx.lineTo(x - MUTED_SYMBOL_SIZE, y + MUTED_SYMBOL_SIZE);
  ctx.stroke();
}

export function drawOpenString(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, OPEN_SYMBOL_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawFrettedNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  finger: number,
  showFingerNumbers: boolean
): void {
  const color = finger > 0 && finger <= 4 ? (FINGER_COLORS[finger] ?? FINGER_COLORS[0]) : FINGER_COLORS[0];
  ctx.fillStyle = color ?? '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, y, FINGER_DOT_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  if (showFingerNumbers && finger > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(finger.toString(), x, y);
  }
}

export function drawFingerPositions(
  ctx: CanvasRenderingContext2D,
  frets: number[],
  fingers: number[],
  config: {
    padding: number;
    stringSpacing: number;
    fretWidth: number;
    startFret: number;
    endFret: number;
    showFingerNumbers: boolean;
  }
): void {
  const { padding, stringSpacing, fretWidth, startFret, endFret, showFingerNumbers } = config;

  frets.forEach((fret, stringIndex) => {
    const y = padding + stringIndex * stringSpacing;
    const finger = fingers[stringIndex] ?? 0;

    if (fret === MUTED_STRING) {
      drawMutedString(ctx, padding, y);
    } else if (fret === OPEN_STRING) {
      drawOpenString(ctx, padding, y);
    } else if (fret >= startFret && fret <= endFret) {
      const fretIndex = fret - startFret;
      const x = padding + (fretIndex - 0.5) * fretWidth;
      drawFrettedNote(ctx, x, y, finger, showFingerNumbers);
    }
  });
}

export function drawBarres(
  ctx: CanvasRenderingContext2D,
  barres: Barre[],
  config: {
    padding: number;
    stringSpacing: number;
    fretWidth: number;
    startFret: number;
  }
): void {
  const { padding, stringSpacing, fretWidth, startFret } = config;

  barres.forEach(barre => {
    const fretIndex = barre.fret - startFret;
    const x = padding + (fretIndex - 0.5) * fretWidth;
    const y1 = padding + (STRING_COUNT - barre.fromString) * stringSpacing;
    const y2 = padding + (STRING_COUNT - barre.toString) * stringSpacing;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = BARRE_LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.globalAlpha = BARRE_OPACITY;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}
