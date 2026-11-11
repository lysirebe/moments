import type { WaveformBar } from '../components/Waveform';

/**
 * Deterministic pseudo-random generator so waveform bars are stable across
 * renders and platforms.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WaveformOptions {
  /** Accent bar colour (bars that peak above the envelope). */
  accentColor?: string;
  /** Envelope frequency (lobes across the width). */
  frequency?: number;
  /** Envelope phase offset. */
  phase?: number;
  /** Envelope power (higher = sharper peak). */
  power?: number;
  /** Vertical wave amplitude in px. */
  wave?: number;
  /** Wave frequency for the vertical offset. */
  waveFrequency?: number;
  /** Wave phase for the vertical offset. */
  wavePhase?: number;
  /** Minimum bar height in px. */
  minHeight?: number;
  /** Opacity for bars before the playhead (0..1). */
  playedOpacity?: number;
  /** Opacity for bars after the playhead (0..1). */
  unplayedOpacity?: number;
  /** Playhead position 0..1; bars before it use playedOpacity. */
  playhead?: number;
}

/**
 * Builds a wavy waveform silhouette of `count` bars matching the design's
 * "wavy overall silhouette": a single-lobe envelope with a deterministic jitter
 * and a vertical offset that makes the centre line wave. Bars taper toward the
 * edges instead of filling the full height.
 */
export function makeWaveformBars(
  count: number,
  maxHeight: number,
  color = '#3156B8',
  options: WaveformOptions = {},
): WaveformBar[] {
  const {
    accentColor,
    frequency = 1.5,
    phase = -1.15,
    power = 1.5,
    wave = 16,
    waveFrequency = 1.1,
    wavePhase = 0.4,
    minHeight = 7,
    playedOpacity,
    unplayedOpacity,
    playhead,
  } = options;

  const bars: WaveformBar[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1);
    const lobe = Math.pow(
      0.5 + 0.5 * Math.sin(2 * Math.PI * frequency * x + phase),
      power,
    );
    const env = 0.07 + 0.93 * lobe;
    const jitter = 0.72 + 0.28 * Math.sin(i * 2.31) * Math.cos(i * 0.87 + 1);
    const h = Math.max(minHeight, maxHeight * env * jitter);
    const dy = wave * Math.sin(2 * Math.PI * waveFrequency * x + wavePhase);

    let o: number | undefined;
    if (playhead !== undefined) {
      o = x <= playhead ? (playedOpacity ?? 1) : (unplayedOpacity ?? 0.28);
    }

    bars.push({ h: Math.round(h), dy: Math.round(dy), c: color, o });
  }

  // Accent bars: a few bars peak above the envelope in the accent colour.
  if (accentColor) {
    for (let i = 0; i < count; i++) {
      if (Math.sin(i * 1.7) > 0.55) {
        const bar = bars[i];
        if (bar) {
          bars[i] = { ...bar, c: accentColor, o: bar.o ?? 0.95 };
        }
      }
    }
  }

  return bars;
}

/**
 * Builds a flat, mostly-uniform mini waveform for compact player cards. Uses a
 * gentle single-lobe envelope so bars taper at the edges rather than filling the
 * full height.
 */
export function makeMiniBars(
  count: number,
  maxHeight: number,
  seed = 1,
  color = '#3156B8',
  options: WaveformOptions = {},
): WaveformBar[] {
  const {
    accentColor,
    frequency = 1.5,
    phase = -1.15,
    power = 1.5,
    wave = 6,
    waveFrequency = 1.1,
    wavePhase = 0.4,
    minHeight = 4,
    playedOpacity,
    unplayedOpacity,
    playhead,
  } = options;

  const rand = mulberry32(seed);
  const bars: WaveformBar[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1);
    const lobe = Math.pow(
      0.5 + 0.5 * Math.sin(2 * Math.PI * frequency * x + phase),
      power,
    );
    const env = 0.25 + 0.75 * lobe;
    const jitter = 0.6 + 0.4 * rand();
    const h = Math.max(minHeight, maxHeight * env * jitter);
    const dy = wave * Math.sin(2 * Math.PI * waveFrequency * x + wavePhase);

    let o: number | undefined;
    if (playhead !== undefined) {
      o = x <= playhead ? (playedOpacity ?? 1) : (unplayedOpacity ?? 0.28);
    }

    bars.push({ h: Math.round(h), dy: Math.round(dy), c: color, o });
  }

  if (accentColor) {
    for (let i = 0; i < count; i++) {
      if (Math.sin(i * 1.7) > 0.55) {
        const bar = bars[i];
        if (bar) {
          bars[i] = { ...bar, c: accentColor, o: bar.o ?? 0.95 };
        }
      }
    }
  }

  return bars;
}
