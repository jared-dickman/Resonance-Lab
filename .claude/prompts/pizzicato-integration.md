# 🎸 THE GREATEST GUITAR PEDALBOARD EVER BUILT 🎸

## Vision: What We're Building

You're about to build something that will make guitarists around the world say "Holy sh*t, this is better than my $3000 physical pedalboard."

This is **THE ULTIMATE virtual guitar pedalboard** - a perfect fusion of:
- 🎛️ **Studio-grade DSP** that sounds indistinguishable from legendary hardware
- 🎨 **Museum-quality UI** with interactive 3D controls that feel buttery smooth
- 🎸 **Rock History** encoded in presets from Gilmour, The Edge, Frusciante, Cobain, Van Halen
- ⚡ **Zero-compromise performance** - no latency, no dropouts, just pure tone

**The Standard**: When a professional guitarist sees this, they should immediately want to use it for actual recordings. If they don't, we're not done yet.

## Current State → Legendary State

**RIGHT NOW**: One distortion pedal (it's great, but it's lonely)

**AFTER YOU'RE DONE**: A complete pedalboard ecosystem where users can:
1. Drag-and-drop pedals to build their dream rig
2. Load "David Gilmour - Comfortably Numb" preset with ONE CLICK
3. Tweak every knob with realistic 3D interactions
4. See animated signal flow with glowing cables
5. Export their tone and share it with the world

This isn't just "adding some effects" - this is building the **Strymon BigSky** of web audio.

## What You're Building: 6 Legendary Pedals

Each pedal must be a **perfect digital twin** of the most iconic hardware in rock history. Not close - PERFECT.

### Technical Foundation
- Install Pizzicato.js and bridge it seamlessly with existing Tone.js
- Full TypeScript support (music nerds are also code nerds)
- Match the existing `DistortionPedal` architecture exactly

### The 6 Legendary Pedals:

#### **DelayPedal** (Priority: HIGH - This is CRITICAL!)
Based on: **MXR Carbon Copy** (most popular delay ever), **Boss DD-3**, **Strymon Timeline**

Controls:
- Time control (5ms-2000ms)
- Feedback/Repeats control (0-1)
- Mix/Blend control (0-1)
- Modulation depth (analog warmth)
- Ping-Pong mode toggle

**LEGENDARY PRESETS** (use these exact settings):
1. **"Carbon Copy"** - MXR Carbon Copy default
   - Time: 380ms, Feedback: 0.45, Mix: 0.35, Modulation: 0.3
2. **"Slapback Rockabilly"** - Classic 50s Elvis/Scotty Moore
   - Time: 120ms, Feedback: 0.1, Mix: 0.25, Modulation: 0
3. **"The Edge"** - U2's signature dotted eighth delay
   - Time: 380ms (dotted 8th), Feedback: 0.6, Mix: 0.5, Modulation: 0.2
4. **"Gilmour Ambient"** - Pink Floyd ethereal delay
   - Time: 460ms, Feedback: 0.65, Mix: 0.45, Modulation: 0.25
5. **"Dub Echo"** - Reggae/Dub massive feedback
   - Time: 750ms, Feedback: 0.85, Mix: 0.6, Modulation: 0.15

#### **ReverbPedal** (Priority: HIGH - Essential!)
Based on: **Strymon BlueSky** (studio-grade), **Eventide Space** (warm & natural), **Boss RV-6** (best value)

Controls:
- Room Size (small to massive)
- Decay Time (0.1s-10s)
- Pre-Delay (0-100ms)
- Mix/Blend control (0-1)
- Damping/Tone control

**LEGENDARY PRESETS**:
1. **"BlueSky Studio"** - Strymon's pristine plate reverb
   - Size: 0.7, Decay: 2.5s, PreDelay: 15ms, Mix: 0.3, Damping: 0.6
2. **"Spring '65"** - Fender Spring Reverb Tank
   - Size: 0.4, Decay: 1.2s, PreDelay: 0ms, Mix: 0.25, Damping: 0.8
3. **"Abbey Road Chamber"** - Beatles' echo chamber
   - Size: 0.85, Decay: 3.2s, PreDelay: 25ms, Mix: 0.4, Damping: 0.5
4. **"Cathedral"** - Massive church reverb
   - Size: 1.0, Decay: 8.5s, PreDelay: 40ms, Mix: 0.5, Damping: 0.3
5. **"Shimmer"** - Ambient octave-up reverb
   - Size: 0.9, Decay: 6.0s, PreDelay: 30ms, Mix: 0.6, Damping: 0.2

#### **ChorusPedal** (Priority: MEDIUM)
Based on: **Boss CE-2** (80s classic), **EHX Small Clone** (Nirvana/Kurt Cobain), **MXR Analog Chorus**

Controls:
- Rate control (0.1Hz-10Hz)
- Depth control (0-1)
- Mix control (0-1)
- Tone/EQ control

**LEGENDARY PRESETS**:
1. **"CE-2 Classic"** - Boss CE-2 default setting
   - Rate: 1.2Hz, Depth: 0.6, Mix: 0.5, Tone: 0.65
2. **"Small Clone"** - Kurt Cobain's Come As You Are
   - Rate: 0.8Hz, Depth: 0.75, Mix: 0.65, Tone: 0.5
3. **"80s Shimmer"** - The Police/Andy Summers
   - Rate: 2.5Hz, Depth: 0.5, Mix: 0.7, Tone: 0.8
4. **"Frusciante CE-1"** - John Frusciante's always-on tone
   - Rate: 1.0Hz, Depth: 0.4, Mix: 0.45, Tone: 0.7
5. **"Vibrato"** - Full wet rotary speaker sim
   - Rate: 6.0Hz, Depth: 1.0, Mix: 1.0, Tone: 0.6

#### **FlangerPedal** (Priority: MEDIUM)
Based on: **EHX Electric Mistress** (Gilmour's secret weapon), **Boss BF-3**, **MXR Flanger**

Controls:
- Rate control (0.1Hz-10Hz)
- Depth control (0-1)
- Feedback/Regeneration (0-1)
- Mix control (0-1)
- Manual/Sweep control

**LEGENDARY PRESETS**:
1. **"Electric Mistress"** - David Gilmour's classic
   - Rate: 0.3Hz, Depth: 0.7, Feedback: 0.6, Mix: 0.5, Manual: 0.5
2. **"Jet Plane"** - Van Halen "Unchained"
   - Rate: 0.5Hz, Depth: 0.9, Feedback: 0.8, Mix: 0.7, Manual: 0.6
3. **"Through The Never"** - Metallica flange
   - Rate: 1.8Hz, Depth: 0.6, Feedback: 0.5, Mix: 0.6, Manual: 0.4
4. **"Barracuda"** - Heart intro riff
   - Rate: 2.5Hz, Depth: 0.8, Feedback: 0.7, Mix: 0.75, Manual: 0.55
5. **"Gilmour Animals"** - Pink Floyd dreamy liquid motion
   - Rate: 0.2Hz, Depth: 0.65, Feedback: 0.55, Mix: 0.4, Manual: 0.5

#### **TremoloPedal** (Priority: MEDIUM)
Based on: **Boss TR-2**, **Fender '65 Amp Tremolo**, **Strymon Flint**

Controls:
- Rate/Speed control (0.1Hz-20Hz)
- Depth/Intensity control (0-1)
- Waveform selection (sine, square, triangle, random)
- Mode: Bias (tube-style) vs Harmonic

**LEGENDARY PRESETS**:
1. **"'65 Fender"** - Classic blackface amp tremolo
   - Rate: 4.0Hz, Depth: 0.5, Waveform: sine, Mode: bias
2. **"Gimme Shelter"** - Rolling Stones intro
   - Rate: 5.5Hz, Depth: 0.7, Waveform: sine, Mode: harmonic
3. **"How Soon Is Now"** - The Smiths iconic tremolo
   - Rate: 3.2Hz, Depth: 0.85, Waveform: square, Mode: harmonic
4. **"Helicopter"** - Fast stutter effect
   - Rate: 12Hz, Depth: 1.0, Waveform: square, Mode: bias
5. **"Slow Swell"** - Ambient volume waves
   - Rate: 0.3Hz, Depth: 0.6, Waveform: triangle, Mode: bias

#### **CompressorPedal** (Priority: MEDIUM - More important than you think!)
Based on: **MXR Dyna Comp** (classic squish), **Boss CS-2** (Gilmour's choice), **Keeley Compressor Plus**

Controls:
- Threshold (-60dB to 0dB)
- Ratio (1:1 to 20:1)
- Attack (0.1ms-100ms)
- Release (10ms-1000ms)
- Makeup Gain/Level (0-1)
- Blend/Mix (parallel compression)

**LEGENDARY PRESETS**:
1. **"Dyna Comp Classic"** - MXR default sustain
   - Threshold: -25dB, Ratio: 4:1, Attack: 5ms, Release: 50ms, Gain: 0.6, Mix: 1.0
2. **"Country Chicken Pickin'"** - Nashville snap
   - Threshold: -30dB, Ratio: 8:1, Attack: 0.5ms, Release: 30ms, Gain: 0.7, Mix: 1.0
3. **"Gilmour Sustain"** - David Gilmour's Boss CS-2
   - Threshold: -20dB, Ratio: 3:1, Attack: 3ms, Release: 100ms, Gain: 0.5, Mix: 1.0
4. **"Funk Slap"** - Bass/guitar pop and punch
   - Threshold: -35dB, Ratio: 6:1, Attack: 0.1ms, Release: 40ms, Gain: 0.65, Mix: 1.0
5. **"Parallel New York"** - Studio-style blend
   - Threshold: -15dB, Ratio: 10:1, Attack: 1ms, Release: 60ms, Gain: 0.8, Mix: 0.5

## Why This Matters: The Vision

### For the User
When someone opens this pedalboard, they're not just getting effects - they're getting:
- **The exact tone** from their favorite song, one click away
- **Instant experimentation** - drag pedals around, hear the difference immediately
- **Professional results** - sounds good enough to record with
- **Pure joy** - because beautiful, responsive interfaces make music creation FUN

### For the Product
This transforms Resonance Lab from "a music app" to **THE music app**:
- **Viral potential** - guitarists will screenshot and share their rigs
- **Retention** - users will spend HOURS tweaking and exploring
- **Differentiation** - no other web app has this level of pedal emulation
- **Credibility** - proves we understand musicians at a deep level

### The Experience We're Creating

**Opening the Pedalboard**:
- Smooth fade-in animation
- Empty board with a pulsing "+" button
- Tooltip: "Start building your legendary rig"

**Adding First Pedal**:
- Click "+" → Beautiful modal with pedal categories
- Select "Delay" → Smooth slide-in animation of MXR Carbon Copy
- LED pulses to life, knobs gleam
- Preset dropdown shows "Slapback Rockabilly", "The Edge", etc.

**Loading "Gilmour - Comfortably Numb"**:
- Legendary Rigs menu → Click preset
- Watch pedals appear one by one (compressor, overdrive, delay, reverb)
- Cables animate connecting them
- All knobs smoothly rotate to exact positions
- User presses play → **THAT TONE**

**Drag-and-Drop Magic**:
- Grab a pedal → It lifts with shadow, glows
- Drag between others → They smoothly make space
- Drop → Satisfying "click", cables re-route
- Hear the difference INSTANTLY

This isn't about implementing features - it's about **crafting an experience that feels magical**.

## Key Architectural Decisions (What, Not How)

### Pedal Architecture
Each pedal needs the same interface as `DistortionPedal`:
- **What**: Consistent API across all pedals for seamless chaining
- **Why**: Users can mix Tone.js and Pizzicato pedals without thinking

### UI Philosophy
Match the existing `DistortionPedalUI` aesthetic:
- **What**: 3D rotary knobs, glowing LEDs, realistic footswitches
- **Why**: Familiarity + beauty = trust. Guitarists know these interfaces.

### Drag-and-Drop
This is CRITICAL to the experience:
- **What**: Smooth, physics-based reordering with visual feedback
- **Why**: Experimentation should be instant and joyful, not a form with dropdowns

### Preset System
Two-tier preset architecture:
- **What**: Individual pedal presets + full pedalboard chains
- **Why**: Let users load "The Edge" rig OR just tweak one delay preset

### Performance
Zero compromise on audio quality:
- **What**: No dropouts, no latency, smooth at 60fps with 10+ pedals
- **Why**: Professional musicians will abandon ANY tool that glitches

### Code Organization
Follow existing patterns religiously:
- **What**: Same structure as `DistortionPedal.ts` and `DistortionPedalUI.tsx`
- **Why**: Maintainability. Future devs should feel at home immediately.

## 🏆 SUCCESS CRITERIA - THE ULTIMATE CHECKLIST 🏆

### Core Functionality (MUST HAVE):
- ✅ All 6 Pizzicato pedals implemented and fully functional
- ✅ Every pedal has 5 legendary presets with exact settings documented
- ✅ UI components with beautiful 3D interactive controls
- ✅ Full integration with existing Pedalboard (Tone.js + Pizzicato)
- ✅ Zero conflicts, zero audio dropouts, zero glitches
- ✅ Type-safe TypeScript with full IntelliSense support
- ✅ All pedals can be chained in ANY order
- ✅ Performance: Smooth at 60fps with 10+ active pedals

### Legendary Features (CRITICAL):
- ✅ Drag-and-drop reordering that feels AMAZING
- ✅ 5 pre-built "Legendary Guitarist" pedalboard chains
- ✅ One-click preset loading with smooth animation
- ✅ Visual cable routing with color-coded signal flow
- ✅ Pedal stomp animations (LED blink, footswitch press)
- ✅ Signal metering on each pedal (prevent clipping)

### Bonus Features (EPIC POINTS):
- ✅ Tap tempo support
- ✅ A/B comparison mode
- ✅ Preset export/import (JSON)
- ✅ Keyboard shortcuts for bypass (1-9)
- ✅ Easter eggs ("Spinal Tap", "Hendrix" mode)
- ✅ Mobile responsive (works on tablets)

### The "Music Nerd Weeps With Joy" Test:
When a guitarist sees this, they should immediately:
1. Say "Holy sh*t" out loud
2. Want to play with it for hours
3. Share it with their band mates
4. Ask if they can use it for real recordings

If these don't happen, **IT'S NOT DONE YET!**

## 🎸 LEGENDARY GUITARIST PRESET CHAINS 🎸

### Pre-Built Pedalboard Configurations
Implement these EXACT signal chains from the greatest guitarists ever:

#### **"David Gilmour - Comfortably Numb Solo"**
```
Guitar → Compressor ("Gilmour Sustain")
      → Overdrive (Tube Driver emulation)
      → Delay ("Gilmour Ambient")
      → Reverb ("Abbey Road Chamber")
```

#### **"The Edge - Where The Streets Have No Name"**
```
Guitar → Compressor ("Dyna Comp Classic")
      → Delay ("The Edge" - dotted 8th)
      → Delay #2 (Ping-Pong, 500ms)
      → Reverb ("BlueSky Studio")
```

#### **"John Frusciante - Under The Bridge"**
```
Guitar → Chorus ("Frusciante CE-1" - always on!)
      → Compressor ("Parallel New York")
      → Distortion ("Clean Boost")
      → Delay ("Carbon Copy")
```

#### **"Kurt Cobain - Come As You Are"**
```
Guitar → Chorus ("Small Clone")
      → Distortion ("DS-1")
      → Reverb ("Spring '65")
```

#### **"Van Halen - Unchained"**
```
Guitar → Compressor ("Dyna Comp Classic")
      → Flanger ("Jet Plane")
      → Distortion ("Tube" algorithm)
      → Delay ("Slapback Rockabilly")
```

These preset chains should be ONE-CLICK loadable from a "Legendary Rigs" menu!

## Example Usage (Target API)
```typescript
import { Pedalboard } from '@/lib/audio/effects';
import { DistortionPedal } from '@/lib/audio/effects';
import { DelayPedal, ReverbPedal } from '@/lib/audio/effects/pizzicato';

const board = new Pedalboard();

// Add pedals in desired order
board.addPedal('distortion', 'Tube Screamer', new DistortionPedal({ preset: 'ts9' }));
board.addPedal('delay', 'Analog Delay', new DelayPedal({ preset: 'slapback' }));
board.addPedal('reverb', 'Spring Reverb', new ReverbPedal({ preset: 'spring' }));

// Connect to destination
board.toDestination();
```

## 🔥 CRAZY COOL ADDITIONAL FEATURES 🔥

### Must-Have Enhancements:

1. **Visual Cable Routing**
   - Show animated "cables" connecting pedals
   - Color-coded signal flow (green = clean, red = hot, blue = wet)
   - Glow effect on active signal path

2. **Pedal Stomp Animation**
   - Footswitch "stomps" down when clicked
   - LED blink animation on engage/bypass
   - Subtle shake/wobble effect on activation

3. **Preset Morphing**
   - Smoothly animate knob positions when loading presets
   - Cross-fade between effect settings
   - Visual "gear shift" animation

4. **Performance Mode**
   - Full-screen pedal view
   - Larger hit targets for live use
   - MIDI learn for hardware controllers
   - Keyboard shortcuts (1-9 for pedal bypass)

5. **Audio Routing Matrix**
   - Split signals to parallel chains
   - Wet/Dry/Wet routing options
   - Stereo field visualization

6. **Pedal Skins/Themes**
   - Classic "Boss" blue/silver aesthetic
   - Vintage green "Tube Screamer" look
   - Custom color schemes per pedal
   - Dark mode (current) + Light mode + Vintage mode

7. **Tap Tempo**
   - Global tap tempo for delay/modulation sync
   - Visual metronome pulse
   - BPM detection from input audio

8. **A/B Comparison**
   - Save two different chains
   - Instant A/B switching
   - Visual diff highlighting

9. **Signal Metering**
   - Input/Output level meters on each pedal
   - Clipping warnings (red flash)
   - Headroom visualization

10. **Preset Sharing**
    - Export pedalboard as JSON
    - QR code generation for mobile sharing
    - "Copy to clipboard" shareable link
    - Community preset library

11. **3D Skeuomorphic Mode**
    - Optional hyper-realistic 3D pedal models
    - Shadows, reflections, wear-and-tear textures
    - Dust particles and scratch effects for vintage feel

12. **Easter Eggs**
    - Secret "Spinal Tap" preset (everything to 11)
    - "Hendrix" mode - randomly flips pedal order for happy accidents
    - "Brown Sound" hidden preset (Eddie Van Halen's tone)

## Additional Technical Considerations
- Ensure library is actively maintained or create fallback plan
- Bundle size impact (<100KB for Pizzicato)
- Web Audio API browser compatibility (Chrome, Firefox, Safari, Edge)
- Audio routing visualization with Canvas/WebGL
- MIDI controller support (Web MIDI API)
- Service Worker for offline functionality
- IndexedDB for local preset storage
- WebRTC for collaborative jamming (future)

## Your North Star: The Music Nerd Test

When you're done, show this to ANY guitarist. If they don't:

1. **Immediately say "Holy sh*t"** out loud
2. **Spend the next hour** tweaking knobs and loading presets
3. **Screenshot their rig** and share it with friends
4. **Ask if they can use this for real recordings**

...then it's not done yet.

**This is your standard. Don't compromise.**

---

## Starting Points (Reference, Not Requirements)

**Study these files** to understand our existing patterns:
- `/app/pedalboard/page.tsx` - Current pedalboard UI
- `/lib/audio/effects/DistortionPedal.ts` - DSP architecture
- `/components/effects/DistortionPedalUI.tsx` - Interactive UI patterns

**Pizzicato.js Resources**:
- Docs: http://alemangui.github.io/pizzicato/
- GitHub: https://github.com/alemangui/pizzicato
- npm: https://www.npmjs.com/package/pizzicato

**Your Mission**: Take what exists, multiply it by 6, make it legendary.

---

## Remember

You're not building "a delay effect." You're building **The Edge's Where The Streets Have No Name tone**.

You're not building "a reverb plugin." You're building **Abbey Road's echo chamber**.

You're not building "some UI components." You're building **the interface that makes guitarists forget they're using a computer**.

**Go make the best work the world has ever seen.** 🎸🔥
