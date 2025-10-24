const MARKER_FRETS = [3, 5, 7, 9, 12];
const MARKER_RADIUS = 6;
const DOUBLE_MARKER_FRET = 12;

export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  config: {
    padding: number;
    height: number;
    fretWidth: number;
    stringSpacing: number;
    startFret: number;
    endFret: number;
  }
): void {
  const { padding, height, fretWidth, stringSpacing, startFret, endFret } = config;

  ctx.fillStyle = '#8b7355';

  MARKER_FRETS.forEach(fret => {
    if (fret > startFret && fret <= endFret) {
      const fretIndex = fret - startFret;
      const x = padding + (fretIndex - 0.5) * fretWidth;

      if (fret === DOUBLE_MARKER_FRET) {
        ctx.beginPath();
        ctx.arc(x, height / 2 - stringSpacing, MARKER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, height / 2 + stringSpacing, MARKER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x, height / 2, MARKER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}
