#!/usr/bin/env node
/**
 * Generates a 40-second seamless ultra-powerful emergency SOS alarm WAV.
 * Run: node packages/ui/scripts/generate-sos-alarm.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/assets/sos-emergency-alarm.wav');

const SAMPLE_RATE = 44100;
const DURATION_SEC = 40;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;

const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function softClip(value) {
  return Math.tanh(value * 2.4) / Math.tanh(2.4);
}

/** Band-limited square via odd harmonics. */
function squareWave(phase, harmonics = 7) {
  let sum = 0;
  for (let h = 1; h <= harmonics; h += 2) {
    sum += Math.sin(phase * h) / h;
  }
  return sum * (4 / Math.PI);
}

/** Sharp attack pulse envelope — civil-defense / digital alert. */
function pulseBurst(t, rate, attackSec, holdSec, decaySec) {
  const period = 1 / rate;
  const local = t % period;
  const holdEnd = attackSec + holdSec;
  const total = holdEnd + decaySec;
  if (local >= total) {
    return 0;
  }
  if (local < attackSec) {
    return local / attackSec;
  }
  if (local < holdEnd) {
    return 1;
  }
  return 1 - (local - holdEnd) / decaySec;
}

/** Seamless triangle 0→1→0 over `period` seconds. */
function triangle01(t, period) {
  const p = (t % period) / period;
  return p < 0.5 ? p * 2 : 2 - p * 2;
}

/** Cosine wail 0→1→0 (seamless at period boundaries). */
function wail01(t, period) {
  return 0.5 - 0.5 * Math.cos(TAU * ((t % period) / period));
}

function generateSamples() {
  const samples = new Float32Array(NUM_SAMPLES);

  // All periods divide 40s for seamless looping.
  const HI_LO_HALF = 0.32;
  const WAIL_PERIOD = 0.8;
  const HARMONIC_SWEEP_PERIOD = 1.6;
  const STUTTER_PERIOD = 3.2;
  const BEACON_PERIOD = 1.0;

  let wailPhase = 0;
  let harmonicPhase = 0;

  for (let i = 0; i < NUM_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;

    // --- Layer 1: Fast hi-lo dual-tone (700–2200 Hz range) ---
    const hiLoHigh = Math.floor(t / HI_LO_HALF) % 2 === 1;
    const toneA = hiLoHigh ? 1380 : 720;
    const toneB = hiLoHigh ? 1980 : 980;
    const hiLo = squareWave(TAU * toneA * t, 5) * 0.26 + squareWave(TAU * toneB * t, 5) * 0.22;

    // --- Layer 2: Aggressive frequency wail (700–2180 Hz) ---
    const wailFreq = 720 + 1460 * wail01(t, WAIL_PERIOD);
    wailPhase += (TAU * wailFreq) / SAMPLE_RATE;
    const wail =
      squareWave(wailPhase, 3) * 0.24 + Math.sin(wailPhase) * 0.16 + Math.sin(wailPhase * 2) * 0.08;

    // --- Layer 3: Emergency pulse bursts (4.5 Hz, sharp attack) ---
    const burstEnv = pulseBurst(t, 4.5, 0.006, 0.04, 0.08);
    const burstTone = squareWave(TAU * 1840 * t, 3) * burstEnv * 0.34;

    // --- Layer 4: Digital notification stutter (triple accent) ---
    const stutterPos = t % STUTTER_PERIOD;
    const stutterGate =
      (stutterPos >= 0 && stutterPos < 0.045) ||
      (stutterPos >= 0.06 && stutterPos < 0.105) ||
      (stutterPos >= 0.12 && stutterPos < 0.165)
        ? 1
        : stutterPos >= 0.165 && stutterPos < 0.2
          ? 1 - (stutterPos - 0.165) / 0.035
          : 0;
    const stutter = squareWave(TAU * 2100 * t, 3) * stutterGate * 0.28;

    // --- Layer 5: Search-and-rescue beacon pulse ---
    const beaconOn = t % BEACON_PERIOD < 0.78;
    const beacon = beaconOn ? squareWave(TAU * 960 * t, 5) * 0.14 : 0;

    // --- Layer 6: Deep sub rumble (physical impact) ---
    const subAmp = 0.55 + 0.45 * Math.sin(TAU * 1.25 * t);
    const sub =
      (Math.sin(TAU * 52 * t) * 0.42 +
        Math.sin(TAU * 78 * t) * 0.28 +
        Math.sin(TAU * 104 * t) * 0.12) *
      subAmp;

    // --- Layer 7: Harmonic sweep (military / civil-defense upper edge) ---
    const harmFreq = 1180 + 1020 * triangle01(t, HARMONIC_SWEEP_PERIOD);
    harmonicPhase += (TAU * harmFreq) / SAMPLE_RATE;
    const harmonicSweep =
      Math.sin(harmonicPhase) * 0.12 +
      Math.sin(harmonicPhase * 2) * 0.08 +
      Math.sin(harmonicPhase * 3) * 0.05;

    // --- Master urgency envelope (slow swell, still seamless) ---
    const masterEnv = 0.78 + 0.22 * Math.sin(TAU * 0.125 * t);

    let sample = (hiLo + wail + burstTone + stutter + beacon + sub + harmonicSweep) * masterEnv;

    // Hard limiter pre-clip
    sample = softClip(sample * 1.15);
    samples[i] = sample;
  }

  // Seam polish: 12ms crossfade at loop boundary.
  const crossfade = Math.floor(0.012 * SAMPLE_RATE);
  for (let i = 0; i < crossfade; i += 1) {
    const blend = i / crossfade;
    const tail = NUM_SAMPLES - crossfade + i;
    const merged = samples[tail] * (1 - blend) + samples[i] * blend;
    samples[tail] = merged;
  }

  // Normalize to -0.5 dBFS
  let peak = 0;
  for (let i = 0; i < NUM_SAMPLES; i += 1) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  const gain = 0.944 / (peak || 1);
  for (let i = 0; i < NUM_SAMPLES; i += 1) {
    samples[i] *= gain;
  }

  return samples;
}

function writeWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const int16 = clamp(Math.round(samples[i] * 32767), -32768, 32767);
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, buffer);
  const mb = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${OUT_PATH} (${DURATION_SEC}s, ${mb} MB)`);
}

writeWav(generateSamples());
