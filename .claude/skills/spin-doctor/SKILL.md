---
name: spin-doctor
description: Prescribes branded loaders. Use when creating loading animations, spinners, or progress indicators.
auto_trigger: true
keywords: [loader, loading, spinner, animation]
---

# Spin Doctor

Prescribing on-brand loaders since 2077.

## Diagnosis

- Read existing loaders or brand guidelines
- Extract color palette, motion style, aesthetic
- Identify `loader.constants.ts` or create one

## DNA

- **Constants** - Centralized sizing + colors
- **Centered** - `flex items-center justify-center` + `overflow-hidden`
- **Contained** - SVG uses `dim * 0.8` to fit with padding
- **A11y** - `role="status"` `aria-label="Loading"`

## Motion Secrets

- **Rotation** - Use `-360` for clockwise, `360` for counter-clockwise
- **Gears** - Meshed gears need opposite rotation directions
- **Pendulum** - Only END elements move (Newton's cradle)
- **Flicker** - Fast = 0.3-0.5s, Subtle = 1.5-4s
- **Randomness** - Vary delays, durations, positions for organic feel
- **Centered explosions** - Static center + radiating elements

## Patterns

**Orbit** - Wrap in rotating container, particles at fixed positions
**Wave** - Multiple paths with staggered `delay` values
**Pulse** - `scale: [1, 1.2, 1]` with `easeInOut`
**Flow** - `strokeDashoffset` animation on paths
**Glow** - `boxShadow` or SVG `filter` with `feGaussianBlur`

## Template

```tsx
'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { COLORS, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function {Name}Loader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  return (
    <div role="status" aria-label="Loading"
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ width: dim, height: dim }}>
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        <motion.circle /* animation */ />
      </svg>
    </div>
  );
}
```
