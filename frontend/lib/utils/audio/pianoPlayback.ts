import { midiToFrequency } from '@/lib/pianoChords';

export function playPianoChord(
  audioContext: AudioContext,
  midiNotes: number[]
): void {
  const now = audioContext.currentTime;

  midiNotes.forEach((midi, index) => {
    const freq = midiToFrequency(midi);

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    const startTime = now + index * 0.01;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 2);
  });
}
