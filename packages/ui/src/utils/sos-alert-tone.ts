/**
 * Ultra-powerful emergency SOS alarm for life-threatening hold-to-send activation.
 * Plays a broadcast-quality 40-second seamless loop (see scripts/generate-sos-alarm.mjs).
 * Falls back to real-time synthesis if the asset cannot be decoded.
 */

const SOS_ALARM_URL = new URL('../assets/sos-emergency-alarm.wav', import.meta.url).href;
const FADE_SEC = 0.035;

type PlaybackSession = {
  ctx: AudioContext;
  output: GainNode;
  source: AudioBufferSourceNode | null;
  nodes: AudioNode[];
  stopTimer: ReturnType<typeof setTimeout> | null;
  fallbackStop: (() => void) | null;
};

let audioContext: AudioContext | null = null;
let cachedBuffer: AudioBuffer | null = null;
let bufferPromise: Promise<AudioBuffer | null> | null = null;
let session: PlaybackSession | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  void audioContext.resume();
  return audioContext;
}

function preloadBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (cachedBuffer) {
    return Promise.resolve(cachedBuffer);
  }
  if (!bufferPromise) {
    bufferPromise = fetch(SOS_ALARM_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`SOS alarm asset unavailable (${String(response.status)})`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((decoded) => {
        cachedBuffer = decoded;
        return decoded;
      })
      .catch(() => null);
  }
  return bufferPromise;
}

function createOutputChain(ctx: AudioContext) {
  const nodes: AudioNode[] = [];

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -4;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.025;
  nodes.push(limiter);

  const output = ctx.createGain();
  output.gain.value = 0.0001;
  nodes.push(output);

  output.connect(limiter);
  limiter.connect(ctx.destination);

  return { output, nodes };
}

function startFallbackSynthesis(ctx: AudioContext, output: GainNode): () => void {
  const nodes: AudioNode[] = [];
  const oscillators: OscillatorNode[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const mixer = ctx.createGain();
  mixer.gain.value = 1.45;
  nodes.push(mixer);
  mixer.connect(output);

  const toneDefs: Array<{ type: OscillatorType; gain: number }> = [
    { type: 'square', gain: 0.4 },
    { type: 'square', gain: 0.36 },
    { type: 'sawtooth', gain: 0.16 },
  ];

  const now = ctx.currentTime;
  for (const def of toneDefs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = def.type;
    osc.frequency.value = 720;
    gain.gain.value = def.gain;
    osc.connect(gain);
    gain.connect(mixer);
    osc.start(now);
    oscillators.push(osc);
    nodes.push(gain);
  }

  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.value = 52;
  subGain.gain.value = 0.38;
  sub.connect(subGain);
  subGain.connect(mixer);
  sub.start(now);
  oscillators.push(sub);
  nodes.push(subGain);

  let high = false;
  const swap = () => {
    high = !high;
    const t = ctx.currentTime;
    const a = high ? 1380 : 720;
    const b = high ? 1980 : 980;
    oscillators[0]?.frequency.setValueAtTime(a, t);
    oscillators[1]?.frequency.setValueAtTime(b, t);
    oscillators[2]?.frequency.setValueAtTime(a * 2, t);
    timers.push(setTimeout(swap, 320));
  };
  swap();

  return () => {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    for (const osc of oscillators) {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
      try {
        osc.disconnect();
      } catch {
        // already disconnected
      }
    }
    for (const node of nodes) {
      try {
        node.disconnect();
      } catch {
        // already disconnected
      }
    }
  };
}

function playLoopBuffer(ctx: AudioContext, output: GainNode, buffer: AudioBuffer) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(output);
  source.start(ctx.currentTime);
  return source;
}

function teardownSession(activeSession: PlaybackSession) {
  if (activeSession.stopTimer !== null) {
    clearTimeout(activeSession.stopTimer);
  }

  if (activeSession.source) {
    try {
      activeSession.source.stop();
    } catch {
      // already stopped
    }
    try {
      activeSession.source.disconnect();
    } catch {
      // already disconnected
    }
  }

  activeSession.fallbackStop?.();

  for (const node of activeSession.nodes) {
    try {
      node.disconnect();
    } catch {
      // already disconnected
    }
  }
}

function rampOutputUp(output: GainNode, ctx: AudioContext) {
  const now = ctx.currentTime;
  output.gain.cancelScheduledValues(now);
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(1, now + 0.018);
}

/** Ultra-powerful emergency SOS alarm — only while SOS hold is actively engaged. */
export function startSosAlertTone() {
  stopSosAlertTone();

  const ctx = getAudioContext();
  const { output, nodes } = createOutputChain(ctx);
  rampOutputUp(output, ctx);

  const activeSession: PlaybackSession = {
    ctx,
    output,
    source: null,
    nodes,
    stopTimer: null,
    fallbackStop: null,
  };
  session = activeSession;

  if (cachedBuffer) {
    activeSession.source = playLoopBuffer(ctx, output, cachedBuffer);
    return;
  }

  activeSession.fallbackStop = startFallbackSynthesis(ctx, output);

  void preloadBuffer(ctx).then((buffer) => {
    if (!session || session !== activeSession || !buffer) {
      return;
    }

    session.fallbackStop?.();
    session.fallbackStop = null;
    session.source = playLoopBuffer(ctx, output, buffer);
  });
}

export function stopSosAlertTone() {
  const activeSession = session;
  if (!activeSession) {
    return;
  }

  session = null;

  const ctx = activeSession.ctx;
  const now = ctx.currentTime;

  try {
    activeSession.output.gain.cancelScheduledValues(now);
    activeSession.output.gain.setValueAtTime(activeSession.output.gain.value, now);
    activeSession.output.gain.exponentialRampToValueAtTime(0.0001, now + FADE_SEC);
  } catch {
    activeSession.output.gain.value = 0;
  }

  activeSession.stopTimer = setTimeout(
    () => {
      teardownSession(activeSession);
    },
    (FADE_SEC + 0.02) * 1000,
  );
}

/** Warm the alarm buffer after first user gesture for instant SOS playback. */
export function preloadSosAlertTone() {
  void preloadBuffer(getAudioContext());
}
