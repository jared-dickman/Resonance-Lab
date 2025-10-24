const NUT_WIDTH = 6;
const FRET_WIDTH = 2;

export function drawFrets(
  ctx: CanvasRenderingContext2D,
  config: {
    padding: number;
    height: number;
    fretWidth: number;
    visibleFrets: number;
    startFret: number;
  }
): void {
  const { padding, height, fretWidth, visibleFrets, startFret } = config;

  ctx.strokeStyle = '#c0c0c0';

  for (let i = 0; i <= visibleFrets; i++) {
    const x = padding + i * fretWidth;
    const isNut = i === 0 && startFret === 0;
    ctx.lineWidth = isNut ? NUT_WIDTH : FRET_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }
}
