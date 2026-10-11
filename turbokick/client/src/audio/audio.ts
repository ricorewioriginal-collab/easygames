// TURBOKICK: selbstgemachte Audio-Engine (Web Audio API, keine Audiodateien).
// Musik entsteht prozedural (music.ts), Soundeffekte aus Klangrezepten (sfx.ts),
// Motoren/Boost als Dauerklänge (engine.ts), dazu Stadion-Publikum.
// Ohne AudioContext (Node, Tests, alte Browser) tut alles nichts und wirft nie.
import { Rng } from '@shared/rng';
import {
  MUSIC_THEMES,
  THEMES,
  generateBar,
  mtof,
  type MusicTheme,
  type MusicVoice,
  type NoteEvent,
} from './music';
import { MAX_CARS, createCarEngines, type CarEngines, type CarSound } from './engine';
import { SFX_RECIPES, drumLayers, instrumentLayers, resolveSfx, type SfxLayer, type SfxName } from './sfx';

export type { MusicTheme, SfxName, CarSound };
export { MAX_CARS };
export { MUSIC_THEMES };

export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
  muted: boolean;
}

export interface AudioEngine {
  /** Muss nach einer Nutzergeste aufgerufen werden (Autoplay-Regeln); mehrfach aufrufbar, idempotent; erzeugt/resumed den AudioContext */
  unlock(): void;
  setSettings(s: Partial<AudioSettings>): void;
  getSettings(): AudioSettings;
  /** Startet eine Musik (weicher Übergang ~0,8 s); null = still */
  music(theme: MusicTheme | null): void;
  sfx(name: SfxName | string, opts?: { pitch?: number; volume?: number; pan?: number }): void;
  /** Dauerklänge: pro Auto (id) Motor + Boost, jedes Bild aufrufen; fehlende ids werden ausgeblendet und entfernt */
  updateCars(cars: ReadonlyMap<number, CarSound>): void;
  /** Publikum-Stimmung 0..1 (Grundrauschen, steigt bei Chancen) */
  crowd(level01: number): void;
  /** Kurzer Jubel-Stoß */
  crowdCheer(strength01?: number): void;
  /** Pausiert/setzt fort (Tab unsichtbar → automatisch pausieren über visibilitychange) */
  suspend(): void;
  resume(): void;
  dispose(): void;
}

export interface AudioDebugStats {
  hasContext: boolean;
  /** Gleichzeitig belegte Stimmen (Musik + Effekte) */
  voices: number;
  musicVoices: number;
  sfxVoices: number;
  cars: number;
  crowdLevel: number;
  theme: MusicTheme | null;
  retiring: number;
  timerActive: boolean;
}

/** Erweiterte Schnittstelle für Tests. */
export interface AudioEngineInternal extends AudioEngine {
  /** Ein Scheduler-Durchlauf (sonst über setInterval) */
  tick(): void;
  debugStats(): AudioDebugStats;
}

export interface AudioEngineOptions {
  /** Fabrik für den AudioContext; null = nicht verfügbar. Standard: AudioContext des Browsers. */
  createContext?: () => AudioContext | null;
}

// ---- Konstanten ----
const TICK_MS = 100;
const LOOKAHEAD = 0.3;
const FADE = 0.8;
export const MAX_MUSIC_VOICES = 24;
export const MAX_SFX_VOICES = 20;
const SFX_MIN_GAP = 0.03;
const MUSIC_LEVEL = 0.55;
const SFX_LEVEL = 0.9;
const MOTOR_LEVEL = 0.7;
const CHEER_GAP = 0.25;

const DEFAULT_SETTINGS: AudioSettings = { master: 0.8, music: 0.5, sfx: 0.8, muted: false };

/** Mischverhältnis der Musikstimmen */
const MIX: Record<MusicVoice, number> = {
  bass: 0.9,
  lead: 0.75,
  arp: 0.65,
  pad: 0.55,
  kick: 1,
  snare: 0.8,
  hat: 0.7,
  perc: 0.8,
};

/** Auf 0..1 klemmen; NaN → Rückfallwert. */
export function clamp01(v: unknown, fallback: number): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return fallback;
  return Math.min(1, Math.max(0, v));
}

function defaultContext(): AudioContext | null {
  const g = globalThis as {
    AudioContext?: new (o?: object) => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor({ latencyHint: 'interactive' });
  } catch {
    try {
      return new Ctor();
    } catch {
      return null;
    }
  }
}

interface Voice {
  kind: 'music' | 'sfx';
  /** Zeitpunkt (ctx-Zeit), nach dem alle Quellen verstummt sind */
  end: number;
  out: GainNode;
  nodes: AudioNode[];
  sources: AudioScheduledSourceNode[];
  /** Wird gerade ausgeblendet (zählt nicht mehr zum Limit) */
  dying?: boolean;
}

interface MusicRun {
  theme: MusicTheme;
  bus: GainNode;
  t0: number;
  bar: number;
  events: NoteEvent[];
  idx: number;
  barStart: number;
  done: boolean;
}

const safeFreq = (x: number): number => Math.min(20000, Math.max(1, Number.isFinite(x) ? x : 440));

export function createAudioEngine(options: AudioEngineOptions = {}): AudioEngineInternal {
  const makeContext = options.createContext ?? defaultContext;

  let settings: AudioSettings = { ...DEFAULT_SETTINGS };
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let motorGain: GainNode | null = null;
  let crowdGain: GainNode | null = null;
  let crowdFilter: BiquadFilterNode | null = null;
  let crowdNodes: AudioNode[] = [];
  let crowdSources: AudioScheduledSourceNode[] = [];
  let crowdLevel = 0;
  let lastCheer = -1;
  let cars: CarEngines | null = null;
  let noiseBuf: AudioBuffer | null = null;
  let noiseOffset = 0;

  let wanted: MusicTheme | null = null;
  let run: MusicRun | null = null;
  let retiring: { bus: GainNode; until: number }[] = [];
  let voices: Voice[] = [];
  const lastSfx = new Map<string, number>();

  let timer: ReturnType<typeof setInterval> | null = null;
  let userSuspended = false;
  let hiddenSuspended = false;
  let visListening = false;

  // ---- Hilfen ----
  const quiet = (fn: () => void): void => {
    try {
      fn();
    } catch {
      /* Audio darf nie werfen */
    }
  };

  const setParam = (p: AudioParam, v: number): void => {
    if (!ctx) return;
    const now = ctx.currentTime;
    quiet(() => {
      p.cancelScheduledValues(now);
      p.setTargetAtTime(v, now, 0.012);
    });
  };

  function applyGains(): void {
    if (!ctx || !master || !musicGain || !sfxGain) return;
    setParam(master.gain, settings.muted ? 0 : settings.master);
    setParam(musicGain.gain, settings.music * MUSIC_LEVEL);
    setParam(sfxGain.gain, settings.sfx * SFX_LEVEL);
    if (motorGain) setParam(motorGain.gain, settings.sfx * MOTOR_LEVEL);
  }

  function buildGraph(c: AudioContext): void {
    master = c.createGain();
    const comp = c.createDynamicsCompressor();
    quiet(() => {
      comp.threshold.value = -14;
      comp.knee.value = 24;
      comp.ratio.value = 6;
      comp.attack.value = 0.005;
      comp.release.value = 0.2;
    });
    musicGain = c.createGain();
    sfxGain = c.createGain();
    motorGain = c.createGain();
    musicGain.connect(master);
    sfxGain.connect(master);
    motorGain.connect(master);
    master.connect(comp);
    comp.connect(c.destination);
    // Rauschpuffer (1 s, deterministisch)
    const len = Math.max(1, Math.floor(c.sampleRate || 44100));
    noiseBuf = c.createBuffer(1, len, c.sampleRate || 44100);
    const data = noiseBuf.getChannelData(0);
    const rng = new Rng(0x5eed);
    for (let i = 0; i < data.length; i++) data[i] = rng.next() * 2 - 1;
    cars = createCarEngines(c, motorGain, noiseBuf);
    buildCrowd(c);
  }

  /** Dauerhaftes Publikum-Rauschen (gefiltert, mit langsamem Schwellen). */
  function buildCrowd(c: AudioContext): void {
    if (!noiseBuf || !sfxGain) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.start(0, 0.37);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700;
    bp.Q.value = 0.5;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    const swell = c.createGain();
    swell.gain.value = 0.85;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.21;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(swell.gain);
    lfo.start();
    const level = c.createGain();
    level.gain.value = 0;
    src.connect(bp);
    bp.connect(lp);
    lp.connect(swell);
    swell.connect(level);
    level.connect(sfxGain);
    crowdGain = level;
    crowdFilter = bp;
    crowdSources = [src, lfo];
    crowdNodes = [src, lfo, lfoGain, bp, lp, swell, level];
    applyCrowd();
  }

  function applyCrowd(): void {
    if (!crowdGain || !crowdFilter) return;
    setParam(crowdGain.gain, 0.012 + 0.11 * Math.pow(crowdLevel, 1.3));
    if (ctx)
      quiet(() => crowdFilter?.frequency.setTargetAtTime(500 + 600 * crowdLevel, ctx?.currentTime ?? 0, 0.1));
  }

  // ---- Stimmen ----
  function releaseVoice(v: Voice): void {
    quiet(() => v.out.disconnect());
    for (const n of v.nodes) quiet(() => n.disconnect());
  }

  function prune(now: number): void {
    if (voices.length === 0) return;
    const keep: Voice[] = [];
    for (const v of voices) {
      if (v.end < now - 0.02) releaseVoice(v);
      else keep.push(v);
    }
    voices = keep;
  }

  function count(kind: Voice['kind']): number {
    let n = 0;
    for (const v of voices) if (v.kind === kind && !v.dying) n++;
    return n;
  }

  function killVoice(v: Voice, now: number): void {
    quiet(() => {
      v.out.gain.cancelScheduledValues(now);
      v.out.gain.setTargetAtTime(0, now, 0.01);
    });
    for (const s of v.sources) quiet(() => s.stop(now + 0.06));
    v.dying = true;
    v.end = Math.min(v.end, now + 0.08);
  }

  /** Baut aus Schichten eine Stimme, die ab `t` (ctx-Zeit) erklingt. */
  function playLayers(
    layers: readonly SfxLayer[],
    t: number,
    kind: Voice['kind'],
    dest: AudioNode,
    pitch: number,
    vol: number,
    pan = 0,
  ): Voice | null {
    if (!ctx) return null;
    const c = ctx;
    const out = c.createGain();
    out.gain.value = vol;
    const voice: Voice = { kind, end: t, out, nodes: [], sources: [] };
    if (pan !== 0 && typeof c.createStereoPanner === 'function') {
      const p = c.createStereoPanner();
      p.pan.value = pan;
      out.connect(p);
      p.connect(dest);
      voice.nodes.push(p);
    } else {
      out.connect(dest);
    }
    const onEnd = (): void => {
      if (ctx) prune(ctx.currentTime);
    };

    for (const L of layers) {
      const s = t + (L.at ?? 0);
      const dur = Math.max(0.01, L.dur);
      const stopAt = s + dur + 0.02;
      let src: AudioScheduledSourceNode;
      if (L.wave === 'noise') {
        if (!noiseBuf) continue;
        const bs = c.createBufferSource();
        bs.buffer = noiseBuf;
        bs.loop = true;
        noiseOffset = (noiseOffset + 0.173) % 0.9;
        bs.start(s, noiseOffset);
        src = bs;
      } else {
        const osc = c.createOscillator();
        osc.type = L.wave;
        osc.frequency.setValueAtTime(safeFreq(L.f0 * pitch), s);
        if (L.f1 !== undefined) osc.frequency.exponentialRampToValueAtTime(safeFreq(L.f1 * pitch), s + dur);
        if (L.detune) osc.detune.value = L.detune;
        if (L.vibrato) {
          const lfo = c.createOscillator();
          const lg = c.createGain();
          lfo.frequency.value = L.vibrato.rate;
          lg.gain.value = L.vibrato.cents;
          lfo.connect(lg);
          lg.connect(osc.detune);
          lfo.start(s);
          lfo.stop(stopAt);
          voice.sources.push(lfo);
          voice.nodes.push(lfo, lg);
        }
        osc.start(s);
        src = osc;
      }
      src.stop(stopAt);
      voice.sources.push(src);
      voice.nodes.push(src);

      let tail: AudioNode = src;
      if (L.filter) {
        const f = c.createBiquadFilter();
        f.type = L.filter.type;
        f.frequency.setValueAtTime(safeFreq(L.filter.f0), s);
        if (L.filter.f1 !== undefined)
          f.frequency.exponentialRampToValueAtTime(safeFreq(L.filter.f1), s + dur);
        if (L.filter.q !== undefined) f.Q.value = L.filter.q;
        tail.connect(f);
        voice.nodes.push(f);
        tail = f;
      }
      // Hüllkurve
      const env = c.createGain();
      const peak = Math.max(0.0002, L.gain);
      const a = Math.min(L.attack ?? 0.005, dur * 0.5);
      env.gain.setValueAtTime(0.0001, s);
      env.gain.linearRampToValueAtTime(peak, s + a);
      if (L.sustain === undefined) {
        env.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      } else {
        const rel = Math.min(L.release ?? 0.08, dur * 0.5);
        const dEnd = Math.min(s + a + (L.decay ?? 0.05), s + dur - rel);
        env.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, peak * L.sustain),
          Math.max(dEnd, s + a + 0.001),
        );
        env.gain.setValueAtTime(Math.max(0.0001, peak * L.sustain), Math.max(s + dur - rel, s + a + 0.001));
        env.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      }
      tail.connect(env);
      env.connect(out);
      voice.nodes.push(env);
      voice.end = Math.max(voice.end, stopAt);
    }
    const first = voice.sources[0];
    if (first) first.onended = onEnd;
    voices.push(voice);
    ensureTimer();
    return voice;
  }

  // ---- Musik ----
  function playNote(r: MusicRun, ev: NoteEvent, t: number): void {
    if (!ctx) return;
    if (count('music') >= MAX_MUSIC_VOICES) return; // Stimmenlimit: Note auslassen
    const spec = THEMES[r.theme];
    const beatSec = 60 / spec.bpm;
    const dur = ev.dur * beatSec;
    let layers: SfxLayer[];
    switch (ev.voice) {
      case 'kick':
      case 'snare':
      case 'hat':
      case 'perc':
        layers = drumLayers(ev.voice, ev.midi, ev.vel);
        break;
      default:
        layers = instrumentLayers(spec.timbre[ev.voice], mtof(ev.midi), dur, ev.vel);
    }
    playLayers(layers, t, 'music', r.bus, 1, MIX[ev.voice]);
  }

  function schedule(r: MusicRun, now: number): void {
    const spec = THEMES[r.theme];
    const beatSec = 60 / spec.bpm;
    const barSec = spec.beats * beatSec;
    const horizon = now + LOOKAHEAD;
    for (let guard = 0; guard < 3000; guard++) {
      if (r.idx >= r.events.length) {
        let nb = r.bar + 1;
        if (spec.loop) {
          // Nach langer Pause nicht alles Verpasste nachspielen
          const lag = Math.floor((now - 0.5 - r.t0) / barSec);
          if (lag > nb) nb = lag;
        } else if (nb >= spec.bars) {
          r.done = true;
          return;
        }
        r.bar = nb;
        r.events = generateBar(r.theme, nb);
        r.idx = 0;
        r.barStart = r.t0 + nb * barSec;
        if (r.barStart > horizon) return; // erst im nächsten Durchlauf
        continue;
      }
      const ev = r.events[r.idx] as NoteEvent;
      const t = r.barStart + ev.time * beatSec;
      if (t > horizon) return;
      r.idx++;
      if (t < now - 0.05) continue;
      playNote(r, ev, t);
    }
  }

  function stopRun(): void {
    if (!run || !ctx) {
      run = null;
      return;
    }
    const now = ctx.currentTime;
    const bus = run.bus;
    quiet(() => {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(0, now + FADE);
    });
    retiring.push({ bus, until: now + FADE + LOOKAHEAD + 0.3 });
    run = null;
  }

  function startRun(theme: MusicTheme): void {
    if (!ctx || !musicGain) return;
    const now = ctx.currentTime;
    const bus = ctx.createGain();
    quiet(() => {
      bus.gain.setValueAtTime(0.0001, now);
      bus.gain.linearRampToValueAtTime(1, now + FADE);
    });
    bus.connect(musicGain);
    run = { theme, bus, t0: now + 0.08, bar: -1, events: [], idx: 0, barStart: 0, done: false };
    ensureTimer();
    schedule(run, now);
  }

  function tick(): void {
    if (!ctx) return;
    const now = ctx.currentTime;
    prune(now);
    if (retiring.length > 0) {
      const keep: typeof retiring = [];
      for (const r of retiring) {
        if (r.until < now) quiet(() => r.bus.disconnect());
        else keep.push(r);
      }
      retiring = keep;
    }
    if (cars) cars.prune(now);
    if (run && !run.done && !userSuspended && !hiddenSuspended) schedule(run, now);
    const musicActive = run !== null && !run.done;
    if (!musicActive && retiring.length === 0 && voices.length === 0 && (!cars || cars.count() === 0))
      stopTimer();
  }

  function ensureTimer(): void {
    if (timer !== null || !ctx) return;
    timer = setInterval(() => quiet(tick), TICK_MS);
  }

  function stopTimer(): void {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  // ---- Sichtbarkeit ----
  const onVisibility = (): void => {
    if (!ctx) return;
    const c = ctx;
    if (document.visibilityState === 'hidden') {
      hiddenSuspended = true;
      quiet(() => void c.suspend()?.catch?.(() => undefined));
    } else {
      hiddenSuspended = false;
      if (!userSuspended) quiet(() => void c.resume()?.catch?.(() => undefined));
    }
  };

  function listenVisibility(): void {
    if (visListening) return;
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', onVisibility);
      visListening = true;
    }
  }

  function unlisten(): void {
    if (visListening && typeof document !== 'undefined') {
      quiet(() => document.removeEventListener('visibilitychange', onVisibility));
    }
    visListening = false;
  }

  // ---- Öffentliche API ----
  const engine: AudioEngineInternal = {
    unlock(): void {
      quiet(() => {
        if (ctx && ctx.state === 'closed') {
          ctx = null;
          voices = [];
          retiring = [];
          run = null;
          cars = null;
          crowdGain = crowdFilter = null;
          crowdNodes = [];
          crowdSources = [];
        }
        if (!ctx) {
          const c = makeContext();
          if (!c) return;
          ctx = c;
          buildGraph(c);
          applyGains();
        }
        listenVisibility();
        const c = ctx;
        if (!userSuspended && !hiddenSuspended && c.state !== 'running') {
          quiet(() => void c.resume()?.catch?.(() => undefined));
        }
        if (wanted && !run) startRun(wanted);
      });
    },

    setSettings(s: Partial<AudioSettings>): void {
      if (!s || typeof s !== 'object') return;
      settings = {
        master: clamp01(s.master, settings.master),
        music: clamp01(s.music, settings.music),
        sfx: clamp01(s.sfx, settings.sfx),
        muted: typeof s.muted === 'boolean' ? s.muted : settings.muted,
      };
      quiet(applyGains);
    },

    getSettings(): AudioSettings {
      return { ...settings };
    },

    music(theme: MusicTheme | null): void {
      quiet(() => {
        const valid = theme !== null && Object.prototype.hasOwnProperty.call(THEMES, theme);
        const t = valid ? theme : null;
        wanted = t;
        if (!ctx) return; // wird beim unlock() gestartet
        if (run && run.theme === t && !run.done) return;
        stopRun();
        if (t) startRun(t);
      });
    },

    sfx(name: SfxName | string, opts?: { pitch?: number; volume?: number; pan?: number }): void {
      quiet(() => {
        if (!ctx || !sfxGain || userSuspended || hiddenSuspended) return;
        if (settings.muted || settings.sfx <= 0 || settings.master <= 0) return;
        const key = resolveSfx(String(name));
        if (!key) return;
        const now = ctx.currentTime;
        const last = lastSfx.get(key);
        if (last !== undefined && now - last < SFX_MIN_GAP) return;
        lastSfx.set(key, now);
        prune(now);
        if (count('sfx') >= MAX_SFX_VOICES) {
          const oldest = voices.find((v) => v.kind === 'sfx' && !v.dying);
          if (oldest) killVoice(oldest, now);
        }
        const pitch =
          typeof opts?.pitch === 'number' && Number.isFinite(opts.pitch)
            ? Math.min(4, Math.max(0.25, opts.pitch))
            : 1;
        const vol = clamp01(opts?.volume, 1);
        const pan =
          typeof opts?.pan === 'number' && Number.isFinite(opts.pan)
            ? Math.min(1, Math.max(-1, opts.pan))
            : 0;
        playLayers(SFX_RECIPES[key], now + 0.005, 'sfx', sfxGain, pitch, vol, pan);
      });
    },

    updateCars(map: ReadonlyMap<number, CarSound>): void {
      quiet(() => {
        if (!ctx || !cars) return;
        const silent =
          settings.muted || settings.sfx <= 0 || settings.master <= 0 || userSuspended || hiddenSuspended;
        cars.update(silent || !map ? new Map() : map, ctx.currentTime);
        if (cars.count() > 0) ensureTimer();
      });
    },

    crowd(level01: number): void {
      crowdLevel = clamp01(level01, crowdLevel);
      quiet(applyCrowd);
    },

    crowdCheer(strength01 = 0.7): void {
      quiet(() => {
        if (!ctx || !sfxGain || userSuspended || hiddenSuspended) return;
        if (settings.muted || settings.sfx <= 0 || settings.master <= 0) return;
        const now = ctx.currentTime;
        if (lastCheer >= 0 && now - lastCheer < CHEER_GAP) return;
        lastCheer = now;
        prune(now);
        if (count('sfx') >= MAX_SFX_VOICES) {
          const oldest = voices.find((v) => v.kind === 'sfx' && !v.dying);
          if (oldest) killVoice(oldest, now);
        }
        const k = clamp01(strength01, 0.7);
        const layers: SfxLayer[] = [
          {
            wave: 'noise',
            f0: 0,
            dur: 0.7 + 1.1 * k,
            gain: 0.1 + 0.3 * k,
            attack: 0.12,
            filter: { type: 'bandpass', f0: 700, f1: 1500 + 800 * k, q: 0.7 },
          },
          {
            wave: 'noise',
            f0: 0,
            at: 0.05,
            dur: 0.5 + 0.8 * k,
            gain: 0.04 + 0.12 * k,
            attack: 0.15,
            filter: { type: 'highpass', f0: 2500, q: 0.5 },
          },
        ];
        playLayers(layers, now + 0.005, 'sfx', sfxGain, 1, 1, 0);
      });
    },

    suspend(): void {
      userSuspended = true;
      const c = ctx;
      if (c) quiet(() => void c.suspend()?.catch?.(() => undefined));
    },

    resume(): void {
      userSuspended = false;
      const c = ctx;
      if (c && !hiddenSuspended) quiet(() => void c.resume()?.catch?.(() => undefined));
    },

    dispose(): void {
      quiet(() => {
        stopTimer();
        unlisten();
        for (const v of voices) releaseVoice(v);
        voices = [];
        for (const r of retiring) quiet(() => r.bus.disconnect());
        retiring = [];
        if (run) quiet(() => run?.bus.disconnect());
        run = null;
        wanted = null;
        lastSfx.clear();
        cars?.dispose();
        cars = null;
        for (const s of crowdSources) quiet(() => s.stop());
        for (const n of crowdNodes) quiet(() => n.disconnect());
        crowdNodes = [];
        crowdSources = [];
        crowdGain = crowdFilter = null;
        lastCheer = -1;
        for (const n of [musicGain, sfxGain, motorGain, master]) if (n) quiet(() => n.disconnect());
        const c = ctx;
        if (c && c.state !== 'closed') quiet(() => void c.close()?.catch?.(() => undefined));
        ctx = null;
        master = musicGain = sfxGain = motorGain = null;
        noiseBuf = null;
        userSuspended = false;
        hiddenSuspended = false;
      });
    },

    tick(): void {
      quiet(tick);
    },

    debugStats(): AudioDebugStats {
      return {
        hasContext: ctx !== null,
        voices: voices.length,
        musicVoices: count('music'),
        sfxVoices: count('sfx'),
        cars: cars ? cars.count() : 0,
        crowdLevel,
        theme: run ? run.theme : null,
        retiring: retiring.length,
        timerActive: timer !== null,
      };
    },
  };
  return engine;
}

/** Singleton für das ganze Spiel. */
export const audio: AudioEngine = createAudioEngine();
