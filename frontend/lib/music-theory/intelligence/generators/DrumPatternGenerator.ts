/**
 * DrumPatternGenerator - Intelligent drum pattern creation
 * Generates genre-appropriate drum patterns
 */

export interface DrumEvent {
  /** Drum type */
  drum: 'kick' | 'snare' | 'hihat';
  /** Time in beats */
  time: number;
  /** Velocity (0-1) */
  velocity: number;
}

export interface DrumPatternOptions {
  /** Pattern style */
  style: 'rock' | 'pop' | 'jazz' | 'electronic';
  /** Number of measures */
  measures: number;
  /** Beats per measure */
  beatsPerMeasure: number;
  /** Complexity (0-1) */
  complexity: number;
}

export class DrumPatternGenerator {
  /**
   * Generate drum pattern
   */
  generate(options: Partial<DrumPatternOptions> = {}): DrumEvent[] {
    const {
      style = 'rock',
      measures = 1,
      beatsPerMeasure = 4,
      complexity = 0.5,
    } = options;

    switch (style) {
      case 'rock':
        return this.generateRock(measures, beatsPerMeasure);
      case 'pop':
        return this.generatePop(measures, beatsPerMeasure);
      case 'jazz':
        return this.generateJazz(measures, beatsPerMeasure);
      case 'electronic':
        return this.generateElectronic(measures, beatsPerMeasure);
      default:
        return this.generateRock(measures, beatsPerMeasure);
    }
  }

  /**
   * Rock: 4/4 backbeat
   */
  private generateRock(measures: number, bpm: number): DrumEvent[] {
    const events: DrumEvent[] = [];

    for (let m = 0; m < measures; m++) {
      const offset = m * bpm;

      // Kick on 1 and 3
      events.push(
        { drum: 'kick', time: offset, velocity: 0.9 },
        { drum: 'kick', time: offset + 2, velocity: 0.85 }
      );

      // Snare on 2 and 4
      events.push(
        { drum: 'snare', time: offset + 1, velocity: 0.9 },
        { drum: 'snare', time: offset + 3, velocity: 0.9 }
      );

      // Hi-hat on every beat
      for (let beat = 0; beat < bpm; beat++) {
        events.push({
          drum: 'hihat',
          time: offset + beat,
          velocity: beat % 2 === 0 ? 0.7 : 0.5,
        });
      }
    }

    return events;
  }

  /**
   * Pop: Similar to rock but lighter
   */
  private generatePop(measures: number, bpm: number): DrumEvent[] {
    const events: DrumEvent[] = [];

    for (let m = 0; m < measures; m++) {
      const offset = m * bpm;

      // Kick on 1 and 3
      events.push(
        { drum: 'kick', time: offset, velocity: 0.8 },
        { drum: 'kick', time: offset + 2, velocity: 0.75 }
      );

      // Snare on 2 and 4
      events.push(
        { drum: 'snare', time: offset + 1, velocity: 0.85 },
        { drum: 'snare', time: offset + 3, velocity: 0.85 }
      );

      // Hi-hat eighth notes
      for (let beat = 0; beat < bpm * 2; beat++) {
        events.push({
          drum: 'hihat',
          time: offset + beat * 0.5,
          velocity: 0.6,
        });
      }
    }

    return events;
  }

  /**
   * Jazz: Swing feel
   */
  private generateJazz(measures: number, bpm: number): DrumEvent[] {
    const events: DrumEvent[] = [];

    for (let m = 0; m < measures; m++) {
      const offset = m * bpm;

      // Light kick on 1 and 3
      events.push(
        { drum: 'kick', time: offset, velocity: 0.6 },
        { drum: 'kick', time: offset + 2, velocity: 0.5 }
      );

      // Light snare backbeat
      events.push({ drum: 'snare', time: offset + 1, velocity: 0.4 });

      // Ride pattern (simulated with hihat)
      for (let beat = 0; beat < bpm; beat++) {
        events.push({
          drum: 'hihat',
          time: offset + beat,
          velocity: beat % 2 === 0 ? 0.5 : 0.3,
        });
      }
    }

    return events;
  }

  /**
   * Electronic: 4-on-floor
   */
  private generateElectronic(measures: number, bpm: number): DrumEvent[] {
    const events: DrumEvent[] = [];

    for (let m = 0; m < measures; m++) {
      const offset = m * bpm;

      // Kick on every beat (4-on-floor)
      for (let beat = 0; beat < bpm; beat++) {
        events.push({
          drum: 'kick',
          time: offset + beat,
          velocity: 0.9,
        });
      }

      // Hi-hat on offbeats
      for (let beat = 0; beat < bpm; beat++) {
        events.push({
          drum: 'hihat',
          time: offset + beat + 0.5,
          velocity: 0.7,
        });
      }

      // Snare on 2 and 4
      events.push(
        { drum: 'snare', time: offset + 1, velocity: 0.85 },
        { drum: 'snare', time: offset + 3, velocity: 0.85 }
      );
    }

    return events;
  }
}
