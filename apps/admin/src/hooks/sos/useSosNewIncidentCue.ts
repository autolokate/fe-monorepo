import type { AdminSosSummary } from '@autolokate/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { detectSosAlerts } from '@/features/sos/sos-model';

const SOUND_PREF_KEY = 'al-admin-sos-sound';
const HIGHLIGHT_MS = 60_000;

export type SosSoundState = 'off' | 'on' | 'blocked';

function readSoundPref(): boolean {
  try {
    return window.localStorage.getItem(SOUND_PREF_KEY) === 'on';
  } catch {
    return false;
  }
}

function writeSoundPref(on: boolean): void {
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, on ? 'on' : 'off');
  } catch {
    // Storage blocked — the toggle still works for this tab.
  }
}

type AudioContextCtor = typeof AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  const g = globalThis as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

/** Two short alert tones via WebAudio (no media asset, no network). */
function playAlertTone(ctx: AudioContext): void {
  const start = ctx.currentTime;
  [0, 0.28].forEach((offset, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = index === 0 ? 880 : 660;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.24);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.26);
  });
}

/**
 * New-incident cue for the live list: highlights rows that are new (or just turned urgent), flashes
 * the tab title, and — only after the operator turned sound on with a click (browser autoplay rules)
 * — plays a short tone. Sound preference is per-browser (localStorage, best effort).
 */
export function useSosNewIncidentCue(rows: readonly AdminSosSummary[], ready: boolean) {
  const previous = useRef<readonly AdminSosSummary[] | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const [soundWanted, setSoundWanted] = useState<boolean>(readSoundPref);
  const [soundState, setSoundState] = useState<SosSoundState>('off');
  const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(() => new Set());
  const [unseen, setUnseen] = useState(0);

  const ensureAudio = useCallback(async (): Promise<boolean> => {
    const Ctor = audioContextCtor();
    if (!Ctor) return false;
    try {
      audio.current ??= new Ctor();
      if (audio.current.state === 'suspended') await audio.current.resume();
      return audio.current.state === 'running';
    } catch {
      return false;
    }
  }, []);

  // Restore a saved "sound on": usable only once the browser allows audio (after any click).
  useEffect(() => {
    if (!soundWanted) {
      setSoundState('off');
      return;
    }
    let cancelled = false;
    void ensureAudio().then((ok) => {
      if (!cancelled) setSoundState(ok ? 'on' : 'blocked');
    });
    return () => {
      cancelled = true;
    };
  }, [soundWanted, ensureAudio]);

  const toggleSound = useCallback(() => {
    if (soundWanted && soundState === 'blocked') {
      // Saved "on" but the browser held audio until a gesture — this click is that gesture.
      void ensureAudio().then((ok) => {
        setSoundState(ok ? 'on' : 'blocked');
      });
      return;
    }
    const next = !soundWanted;
    writeSoundPref(next);
    setSoundWanted(next);
    if (next) {
      // Called from the click handler → a user gesture, so the context may start now.
      void ensureAudio().then((ok) => {
        setSoundState(ok ? 'on' : 'blocked');
        if (ok && audio.current) playAlertTone(audio.current);
      });
    }
  }, [soundWanted, soundState, ensureAudio]);

  useEffect(() => {
    if (!ready) return;
    const fresh = detectSosAlerts(previous.current, rows);
    previous.current = rows;
    if (fresh.length === 0) return;
    setHighlighted((current) => new Set([...current, ...fresh]));
    setUnseen((count) => count + fresh.length);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setHighlighted((current) => {
        const next = new Set(current);
        for (const id of fresh) next.delete(id);
        return next;
      });
    }, HIGHLIGHT_MS);
    timers.current.add(timer);
    if (soundWanted && audio.current) {
      const ctx = audio.current;
      void (ctx.state === 'running' ? Promise.resolve() : ctx.resume())
        .then(() => {
          if (ctx.state === 'running') {
            playAlertTone(ctx);
            setSoundState('on');
          } else {
            setSoundState('blocked');
          }
        })
        .catch(() => {
          setSoundState('blocked');
        });
    }
  }, [rows, ready, soundWanted]);

  // Tab title flash while new incidents are unseen; cleared when the operator acknowledges.
  useEffect(() => {
    if (unseen === 0 || typeof document === 'undefined') return;
    const base = document.title.replace(/^\(\d+\) SOS · /, '');
    document.title = `(${String(unseen)}) SOS · ${base}`;
    return () => {
      document.title = base;
    };
  }, [unseen]);

  const acknowledge = useCallback(() => {
    setUnseen(0);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
      pending.clear();
      void audio.current?.close().catch(() => undefined);
      audio.current = null;
    };
  }, []);

  return { highlighted, unseen, acknowledge, soundState, soundWanted, toggleSound };
}
