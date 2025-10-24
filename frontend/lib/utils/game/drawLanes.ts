export function drawLanes(
  ctx: CanvasRenderingContext2D,
  chordTypes: string[],
  config: {
    width: number;
    height: number;
    currentActiveChords: string[];
    getChordColor: (chord: string) => string;
  }
): void {
  const { width, height, currentActiveChords, getChordColor } = config;
  const chordWidth = width / chordTypes.length;
  const keys = ['A', 'S', 'D', 'F', 'J', 'K', 'L'];
  const indicatorY = height - 40;
  const keyBindingY = height - 15;
  const baseRadius = 25;
  const activeRadiusBonus = 3;

  chordTypes.forEach((chord, index) => {
    const x = index * chordWidth + chordWidth / 2;
    const isActive = currentActiveChords.includes(chord);

    if (isActive) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(index * chordWidth, 0, chordWidth, height);
    }

    const gradient = ctx.createRadialGradient(x, indicatorY, 0, x, indicatorY, baseRadius);
    gradient.addColorStop(0, getChordColor(chord));
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, indicatorY, isActive ? baseRadius + activeRadiusBonus : baseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chord, x, indicatorY);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(keys[index], x, keyBindingY);
  });
}
