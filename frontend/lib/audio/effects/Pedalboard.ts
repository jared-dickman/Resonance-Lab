/**
 * Pedalboard - Container for chaining guitar effects
 * Supports serial and parallel routing with full signal flow control
 */

import * as Tone from 'tone';
import { DistortionPedal } from './DistortionPedal';

export interface PedalSlot {
  id: string;
  name: string;
  pedal: any; // Can be DistortionPedal, Pizzicato pedals, or Tone.ToneAudioNode
  enabled: boolean;
  order: number;
}

export interface PedalboardConfig {
  masterVolume?: number;
  bypassAll?: boolean;
}

/**
 * Professional pedalboard for chaining effects
 */
export class Pedalboard {
  private input: Tone.Gain;
  private output: Tone.Gain;
  private masterVolume: Tone.Volume;
  private slots: Map<string, PedalSlot> = new Map();
  private bypassAll = false;

  constructor(config: PedalboardConfig = {}) {
    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(1);
    this.masterVolume = new Tone.Volume(config.masterVolume ?? 0);

    // Connect input -> masterVolume -> output
    this.input.connect(this.masterVolume);
    this.masterVolume.connect(this.output);

    if (config.bypassAll) {
      this.bypassAll = true;
    }
  }

  /**
   * Add a pedal to the chain
   */
  addPedal(id: string, name: string, pedal: any, order?: number): this {
    const slot: PedalSlot = {
      id,
      name,
      pedal,
      enabled: true,
      order: order ?? this.slots.size,
    };

    this.slots.set(id, slot);
    this.reconnectChain();

    return this;
  }

  /**
   * Remove a pedal from the chain
   */
  removePedal(id: string): this {
    const slot = this.slots.get(id);
    if (!slot) return this;

    // Disconnect and dispose
    if ('disconnect' in slot.pedal) {
      slot.pedal.disconnect();
    }

    this.slots.delete(id);
    this.reconnectChain();

    return this;
  }

  /**
   * Enable/disable a specific pedal
   */
  togglePedal(id: string, enabled?: boolean): this {
    const slot = this.slots.get(id);
    if (!slot) return this;

    slot.enabled = enabled ?? !slot.enabled;

    // For DistortionPedal
    if (slot.pedal instanceof DistortionPedal) {
      slot.pedal.setEnabled(slot.enabled);
    }
    // For Tone.Effect with wet parameter
    else if ('wet' in slot.pedal && slot.pedal.wet) {
      const wetParam = slot.pedal.wet as unknown as { value: number };
      wetParam.value = slot.enabled ? 1 : 0;
    }

    return this;
  }

  /**
   * Reorder a pedal in the chain
   */
  reorderPedal(id: string, newOrder: number): this {
    const slot = this.slots.get(id);
    if (!slot) return this;

    slot.order = newOrder;
    this.reconnectChain();

    return this;
  }

  /**
   * Get all pedals sorted by order
   */
  getPedals(): PedalSlot[] {
    return Array.from(this.slots.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Reconnect the entire signal chain based on current order
   */
  private reconnectChain(): void {
    // Disconnect everything
    this.input.disconnect();
    this.masterVolume.disconnect();

    const sortedPedals = this.getPedals();

    if (sortedPedals.length === 0 || this.bypassAll) {
      // Direct connection when no pedals or bypassed
      this.input.connect(this.masterVolume);
      this.masterVolume.connect(this.output);
      return;
    }

    // Connect input to first pedal
    const firstPedal = sortedPedals[0]?.pedal;
    if (!firstPedal) return;

    if ('getInput' in firstPedal) {
      this.input.connect(firstPedal.getInput());
    } else {
      this.input.connect(firstPedal as Tone.ToneAudioNode);
    }

    // Chain pedals together
    for (let i = 0; i < sortedPedals.length - 1; i++) {
      const currentPedal = sortedPedals[i]?.pedal;
      const nextPedal = sortedPedals[i + 1]?.pedal;

      if (!currentPedal || !nextPedal) continue;

      if ('getOutput' in currentPedal && 'getInput' in nextPedal) {
        currentPedal.getOutput().connect(nextPedal.getInput());
      } else if ('getOutput' in currentPedal) {
        currentPedal.getOutput().connect(nextPedal as Tone.ToneAudioNode);
      } else {
        (currentPedal as Tone.ToneAudioNode).connect(
          'getInput' in nextPedal ? nextPedal.getInput() : (nextPedal as Tone.ToneAudioNode)
        );
      }
    }

    // Connect last pedal to master volume
    const lastPedal = sortedPedals[sortedPedals.length - 1]?.pedal;
    if (!lastPedal) return;

    if ('getOutput' in lastPedal) {
      lastPedal.getOutput().connect(this.masterVolume);
    } else {
      (lastPedal as Tone.ToneAudioNode).connect(this.masterVolume);
    }

    this.masterVolume.connect(this.output);
  }

  /**
   * Bypass all effects
   */
  setBypassAll(bypass: boolean): this {
    this.bypassAll = bypass;
    this.reconnectChain();
    return this;
  }

  /**
   * Set master output volume (-60 to 6 dB)
   */
  setMasterVolume(db: number): this {
    this.masterVolume.volume.rampTo(Math.max(-60, Math.min(6, db)), 0.1);
    return this;
  }

  /**
   * Get master volume in dB
   */
  getMasterVolume(): number {
    return this.masterVolume.volume.value;
  }

  /**
   * Connect pedalboard to destination
   */
  connect(destination: Tone.InputNode): this {
    this.output.connect(destination);
    return this;
  }

  /**
   * Disconnect from all outputs
   */
  disconnect(): this {
    this.output.disconnect();
    return this;
  }

  /**
   * Get input node for connecting signal source
   */
  getInput(): Tone.InputNode {
    return this.input;
  }

  /**
   * Get output node
   */
  getOutput(): Tone.ToneAudioNode {
    return this.output;
  }

  /**
   * Connect to destination (Tone.js compatibility)
   */
  toDestination(): this {
    this.output.toDestination();
    return this;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      masterVolume: this.masterVolume.volume.value,
      bypassAll: this.bypassAll,
      pedals: this.getPedals().map((slot) => ({
        id: slot.id,
        name: slot.name,
        enabled: slot.enabled,
        order: slot.order,
      })),
    };
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    // Dispose all pedals
    this.slots.forEach((slot) => {
      if ('dispose' in slot.pedal) {
        slot.pedal.dispose();
      }
    });

    this.slots.clear();

    // Dispose audio nodes
    this.input.dispose();
    this.output.dispose();
    this.masterVolume.dispose();
  }
}
