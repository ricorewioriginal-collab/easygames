/**
 * Audioverwaltung: Web-Audio-Kontext, Busse, Synthesizer und ein Lookahead-
 * Scheduler. Die Audiouhr (AudioContext.currentTime) ist die einzige Zeitquelle
 * für das Gameplay, damit Hindernisse, Treffer und Musik synchron bleiben.
 */
import { midiToFreq } from './theory';
import { stepToSeconds, secondsToStep, type NoteEvent } from './music';

export interface MusicSource {
  readonly bpm: number;
  notesInRange(fromStep: number, toStep: number): NoteEvent[];
}

export type SfxName =
  | 'perfect'
  | 'great'
  | 'good'
  | 'miss'
  | 'orb'
  | 'wall'
  | 'ui'
  | 'overdrive'
  | 'milestone'
  | 'click';

const LOOKAHEAD = 0.2;
const TICK_MS = 25;

type AudioCtor = typeof AudioContext;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private delay!: DelayNode;
  private runBus: GainNode | null = null;
  private runSend: GainNode | null = null;
  private noise!: AudioBuffer;
  private source: MusicSource | null = null;
  private startTime = 0;
  private nextStep = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private fallbackOffset = 0;
  private fallbackPausedAt: number | null = null;
  private paused = false;
  private volumes = { master: 0.8, music: 0.8, sfx: 0.7 };
  /** Benutzerkalibrierung in Millisekunden (positiv = Ton kommt später an). */
  latencyOffsetMs = 0;
  /** Aktuelle Tonart für melodische Effekte. */
  sfxRoot = 60;

  /** Muss aus einer Benutzergeste aufgerufen werden (Autoplay-Richtlinien). */
  unlock(): boolean {
    if (!this.ctx) {
      const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return false;
      try {
        this.ctx = new Ctor({ latencyHint: 'interactive' });
      } catch {
        this.ctx = null;
        return false;
      }
      this.buildGraph(this.ctx);
    }
    if (this.ctx.state === 'suspended' && !this.paused) void this.ctx.resume();
    return true;
  }

  get available(): boolean {
    return this.ctx !== null;
  }

  private buildGraph(ctx: AudioContext): void {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 10;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    this.master = ctx.createGain();
    this.musicGain = ctx.createGain();
    this.sfxGain = ctx.createGain();
    this.musicGain.connect(comp);
    this.sfxGain.connect(comp);
    comp.connect(this.master);
    this.master.connect(ctx.destination);

    this.delay = ctx.createDelay(1.5);
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    this.delay.connect(tone);
    tone.connect(fb);
    fb.connect(this.delay);
    tone.connect(this.musicGain);

    const len = Math.floor(ctx.sampleRate * 1);
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.applyVolumes();
  }

  setVolumes(master: number, music: number, sfx: number): void {
    this.volumes = { master, music, sfx };
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.volumes.master, t, 0.02);
    this.musicGain.gain.setTargetAtTime(this.volumes.music * 0.75, t, 0.02);
    this.sfxGain.gain.setTargetAtTime(this.volumes.sfx * 0.8, t, 0.02);
  }

  private now(): number {
    if (this.ctx) return this.ctx.currentTime;
    if (this.fallbackPausedAt !== null) return this.fallbackPausedAt;
    return performance.now() / 1000 - this.fallbackOffset;
  }

  /** Startet die Wiedergabe; offsetSec erlaubt einen Einstieg mitten im Stück. */
  play(source: MusicSource, offsetSec = 0, leadIn = 0.12): void {
    this.stop();
    this.source = source;
    this.paused = false;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      this.runBus = this.ctx.createGain();
      this.runBus.connect(this.musicGain);
      this.runSend = this.ctx.createGain();
      this.runSend.gain.value = 0.35;
      this.runSend.connect(this.delay);
      this.delay.delayTime.value = stepToSeconds(3, source.bpm);
    } else {
      this.fallbackPausedAt = null;
      this.fallbackOffset = 0;
    }
    this.startTime = this.now() + leadIn - offsetSec;
    this.nextStep = Math.max(0, Math.ceil(secondsToStep(offsetSec, source.bpm)));
    this.tick();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.source = null;
    if (this.runBus && this.ctx) {
      const bus = this.runBus;
      const send = this.runSend;
      const t = this.ctx.currentTime;
      bus.gain.setTargetAtTime(0, t, 0.03);
      setTimeout(() => {
        bus.disconnect();
        send?.disconnect();
      }, 200);
    }
    this.runBus = null;
    this.runSend = null;
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    if (this.ctx) void this.ctx.suspend();
    else this.fallbackPausedAt = this.now();
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    if (this.ctx) void this.ctx.resume();
    else if (this.fallbackPausedAt !== null) {
      this.fallbackOffset = performance.now() / 1000 - this.fallbackPausedAt;
      this.fallbackPausedAt = null;
    }
  }

  get isPaused(): boolean {
    return this.paused;
  }

  /** Gesamte Ausgabelatenz in Sekunden (Hardware + Kalibrierung). */
  latency(): number {
    const hw = this.ctx ? this.ctx.outputLatency || this.ctx.baseLatency || 0 : 0;
    return hw + this.latencyOffsetMs / 1000;
  }

  /** Aktuelle Position im Stück in Sekunden, wie sie der Spieler hört. */
  songTime(): number {
    return this.now() - this.startTime - this.latency();
  }

  /** Songzeit zu einem vergangenen performance.now()-Zeitstempel (Eingaben). */
  songTimeAt(perfMs: number): number {
    const ageSec = Math.max(0, Math.min(0.25, (performance.now() - perfMs) / 1000));
    return this.songTime() - (this.paused ? 0 : ageSec);
  }

  private tick(): void {
    const src = this.source;
    if (!src || this.paused) return;
    const horizon = this.now() + LOOKAHEAD - this.startTime;
    const endStep = Math.floor(secondsToStep(horizon, src.bpm)) + 1;
    if (endStep <= this.nextStep) return;
    if (this.ctx && this.runBus) {
      for (const n of src.notesInRange(this.nextStep, endStep)) {
        const t = this.startTime + stepToSeconds(n.step, src.bpm);
        if (t < this.ctx.currentTime - 0.05) continue;
        this.voice(n, Math.max(t, this.ctx.currentTime), src.bpm);
      }
    }
    this.nextStep = endStep;
  }

  // ---------------------------------------------------------------- Synthese

  private env(g: GainNode, t: number, peak: number, attack: number, decay: number): void {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  private osc(
    type: OscillatorType,
    freq: number,
    t: number,
    stop: number,
    out: AudioNode,
    detune = 0,
  ): OscillatorNode {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = detune;
    o.connect(out);
    o.start(t);
    o.stop(stop);
    return o;
  }

  private noiseBurst(
    t: number,
    dur: number,
    filter: BiquadFilterType,
    freq: number,
    q: number,
    peak: number,
    out: AudioNode,
  ): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, peak, 0.002, dur);
    src.connect(f);
    f.connect(g);
    g.connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  private voice(n: NoteEvent, t: number, bpm: number): void {
    const ctx = this.ctx!;
    const out = this.runBus!;
    const durSec = stepToSeconds(n.dur, bpm);
    switch (n.inst) {
      case 'kick': {
        const g = ctx.createGain();
        this.env(g, t, n.vel, 0.002, 0.38);
        g.connect(out);
        const o = this.osc('sine', 150, t, t + 0.45, g);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
        break;
      }
      case 'snare': {
        this.noiseBurst(t, 0.16, 'bandpass', 1900, 0.8, n.vel * 0.55, out);
        const g = ctx.createGain();
        this.env(g, t, n.vel * 0.35, 0.002, 0.09);
        g.connect(out);
        this.osc('triangle', 190, t, t + 0.12, g);
        break;
      }
      case 'clap': {
        for (let i = 0; i < 3; i++)
          this.noiseBurst(t + i * 0.011, 0.08 + i * 0.03, 'bandpass', 1300, 1.2, n.vel * 0.45, out);
        break;
      }
      case 'hat':
        this.noiseBurst(t, 0.045, 'highpass', 7500, 0.7, n.vel * 0.22, out);
        break;
      case 'openhat':
        this.noiseBurst(t, 0.22, 'highpass', 6800, 0.7, n.vel * 0.2, out);
        break;
      case 'perc': {
        const g = ctx.createGain();
        this.env(g, t, n.vel * 0.5, 0.002, 0.18);
        g.connect(out);
        const o = this.osc('sine', 260, t, t + 0.22, g);
        o.frequency.exponentialRampToValueAtTime(120, t + 0.18);
        break;
      }
      case 'bass': {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.Q.value = 6;
        f.frequency.setValueAtTime(180, t);
        f.frequency.exponentialRampToValueAtTime(1100, t + 0.03);
        f.frequency.exponentialRampToValueAtTime(260, t + Math.max(0.08, durSec));
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(n.vel * 0.42, t + 0.008);
        g.gain.setTargetAtTime(0.0001, t + durSec * 0.85, 0.03);
        f.connect(g);
        g.connect(out);
        const freq = midiToFreq(n.midi);
        this.osc('sawtooth', freq, t, t + durSec + 0.2, f);
        this.osc('square', freq / 2, t, t + durSec + 0.2, f);
        break;
      }
      case 'lead': {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 2800;
        f.Q.value = 2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(n.vel * 0.16, t + 0.012);
        g.gain.setTargetAtTime(0.0001, t + durSec * 0.9, 0.06);
        f.connect(g);
        g.connect(out);
        if (this.runSend) g.connect(this.runSend);
        const freq = midiToFreq(n.midi);
        this.osc('sawtooth', freq, t, t + durSec + 0.4, f, -7);
        this.osc('sawtooth', freq, t, t + durSec + 0.4, f, 7);
        break;
      }
      case 'arp': {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(3200, t);
        f.frequency.exponentialRampToValueAtTime(500, t + 0.15);
        const g = ctx.createGain();
        this.env(g, t, n.vel * 0.2, 0.004, 0.16);
        f.connect(g);
        g.connect(out);
        if (this.runSend) g.connect(this.runSend);
        this.osc('square', midiToFreq(n.midi), t, t + 0.25, f);
        break;
      }
      case 'pad': {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 1100;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(n.vel * 0.06, t + Math.min(0.5, durSec * 0.3));
        g.gain.setValueAtTime(n.vel * 0.06, t + durSec * 0.8);
        g.gain.linearRampToValueAtTime(0.0001, t + durSec + 0.3);
        f.connect(g);
        g.connect(out);
        const freq = midiToFreq(n.midi);
        this.osc('sawtooth', freq, t, t + durSec + 0.35, f, -10);
        this.osc('sawtooth', freq, t, t + durSec + 0.35, f, 10);
        break;
      }
    }
  }

  /** Kurze Effektklänge für Treffer, Fehler, Menü usw. */
  sfx(name: SfxName, pitchOffset = 0): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005;
    const out = this.sfxGain;
    const bell = (midi: number, peak: number, decay: number, delay = 0) => {
      const g = ctx.createGain();
      this.env(g, t + delay, peak, 0.003, decay);
      g.connect(out);
      const f = midiToFreq(midi);
      this.osc('sine', f, t + delay, t + delay + decay + 0.05, g);
      this.osc('triangle', f * 2, t + delay, t + delay + decay + 0.05, g);
    };
    const root = this.sfxRoot + pitchOffset;
    switch (name) {
      case 'perfect':
        bell(root + 24, 0.22, 0.25);
        bell(root + 31, 0.12, 0.2, 0.02);
        break;
      case 'great':
        bell(root + 24, 0.18, 0.2);
        break;
      case 'good':
        bell(root + 19, 0.14, 0.16);
        break;
      case 'miss':
        this.noiseBurst(t, 0.12, 'lowpass', 500, 1, 0.25, out);
        break;
      case 'orb':
        bell(root + 31, 0.1, 0.12);
        bell(root + 36, 0.08, 0.14, 0.04);
        break;
      case 'wall': {
        this.noiseBurst(t, 0.35, 'lowpass', 900, 0.8, 0.5, out);
        const g = ctx.createGain();
        this.env(g, t, 0.4, 0.002, 0.3);
        g.connect(out);
        const o = this.osc('square', 110, t, t + 0.35, g);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        break;
      }
      case 'ui':
        bell(root + 19, 0.08, 0.08);
        break;
      case 'click':
        bell(96, 0.25, 0.05);
        break;
      case 'milestone':
        [0, 4, 7, 12].forEach((iv, i) => bell(root + 24 + iv, 0.1, 0.25, i * 0.06));
        break;
      case 'overdrive': {
        const g = ctx.createGain();
        this.env(g, t, 0.18, 0.05, 0.7);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(4000, t + 0.6);
        f.connect(g);
        g.connect(out);
        this.osc('sawtooth', midiToFreq(root), t, t + 0.8, f);
        this.osc('sawtooth', midiToFreq(root + 7), t, t + 0.8, f);
        break;
      }
    }
  }

  /** Metronom-Klick zu einem Zeitpunkt in Kontextzeit (Kalibrierung). */
  scheduleClick(atCtxTime: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const g = ctx.createGain();
    this.env(g, atCtxTime, 0.35, 0.002, 0.06);
    g.connect(this.sfxGain);
    this.osc('square', 1760, atCtxTime, atCtxTime + 0.08, g);
  }

  contextTime(): number {
    return this.now();
  }

  /** Kontextzeit, die einem performance.now()-Zeitstempel entspricht. */
  contextTimeAt(perfMs: number): number {
    return this.now() - Math.max(0, (performance.now() - perfMs) / 1000);
  }
}
