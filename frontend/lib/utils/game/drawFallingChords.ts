import type { HitQuality } from '@/lib/enums/hitQuality.enum';

interface FallingChord {
  chord: string;
  color: string;
  y: number;
  timestamp: number;
  hit: boolean;
  hitQuality?: HitQuality;
}

export function drawFallingChords(
  ctx: CanvasRenderingContext2D,
  fallingChords: FallingChord[],
  chordTypes: string[],
  config: { width: number; now: number; getChordColor: (chord: string) => string }
): void {
  const { width, now } = config;
  const chordWidth = width / chordTypes.length;

  fallingChords.forEach(fc => {
    const index = chordTypes.indexOf(fc.chord);
    if (index === -1) return;

    const x = index * chordWidth + chordWidth / 2;

    if (!fc.hit) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = fc.color;
    }

    const gradient = ctx.createLinearGradient(x - 30, fc.y - 20, x - 30, fc.y + 20);
    gradient.addColorStop(0, fc.color);
    gradient.addColorStop(1, fc.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x - 30, fc.y - 20, 60, 40, 8);
    ctx.fill();

    ctx.shadowBlur = 0;

    if (fc.hit && fc.hitQuality) {
      drawHitEffect(ctx, fc, x, now);
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fc.chord, x, fc.y);
  });
}

function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  fc: FallingChord,
  x: number,
  now: number
): void {
  const opacity = Math.max(0, 1 - (now - fc.timestamp + 200) / 500);
  const burstParticles = 8;
  const burstRadius = 40;

  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(fc.hitQuality!.toUpperCase(), x, fc.y - 40);

  for (let i = 0; i < burstParticles; i++) {
    const angle = (i / burstParticles) * Math.PI * 2;
    const dist = burstRadius * (1 - opacity);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * dist, fc.y + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
