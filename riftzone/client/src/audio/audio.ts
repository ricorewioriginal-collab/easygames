// Klang-Engine mit Web Audio: alle Geräusche und die Musik werden im Browser erzeugt (keine Audiodateien).
// Räumliche Effekte über PannerNode, Busse für Effekte/Musik/Oberfläche, Begrenzung gleichzeitiger Stimmen.
import { settings } from '../core/settings';

export type SoundName =
  | 'pistol'
  | 'smg'
  | 'rifle'
  | 'burst'
  | 'shotgun'
  | 'sniper'
  | 'rocket'
  | 'explosion'
  | 'pickaxe'
  | 'swing'
  | 'hit'
  | 'headshot'
  | 'shieldBreak'
  | 'step'
  | 'jump'
  | 'land'
  | 'glide'
  | 'build'
  | 'harvestWood'
  | 'harvestStone'
  | 'harvestMetal'
  | 'chest'
  | 'pickup'
  | 'reload'
  | 'heal'
  | 'shield'
  | 'door'
  | 'click'
  | 'hover'
  | 'elim'
  | 'knock'
  | 'victory'
  | 'defeat'
  | 'zoneWarn'
  | 'splash'
  | 'pad'
  | 'slide'
  | 'climb'
  | 'empty'
  | 'crash'
  | 'enter'
  | 'hurt'
  | 'levelUp'
  | 'busJump'
  | 'throw';

interface Voice {
  end: number;
  prio: number;
  stop: () => void;
}

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private music!: GainNode;
  private ui!: GainNode;
  private noise!: AudioBuffer;
  private voices: Voice[] = [];
  private loops = new Map<string, { gain: GainNode; src: AudioScheduledSourceNode[]; filter?: BiquadFilterNode; panner?: PannerNode }>();
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private musicNext = 0;
  musicMode: 'menu' | 'game' | 'off' = 'off';
  onViz: ((kind: string, x: number, z: number) => void) | null = null;
  private lx = 0;
  private lz = 0;

  /** Muss nach einer Nutzerinteraktion aufgerufen werden (Autoplay-Regeln). */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC({ latencyHint: 'interactive' });
      const c = this.ctx;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master = c.createGain();
      this.master.connect(comp);
      comp.connect(c.destination);
      this.sfx = c.createGain();
      this.music = c.createGain();
      this.ui = c.createGain();
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.ui.connect(this.master);
      const len = c.sampleRate * 2;
      this.noise = c.createBuffer(1, len, c.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.applyVolumes();
      settings.onChange(() => this.applyVolumes());
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) void this.ctx.suspend();
        else void this.ctx.resume();
      });
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  applyVolumes(): void {
    if (!this.ctx) return;
    const s = settings.data;
    this.master.gain.value = s.master;
    this.sfx.gain.value = s.sfx;
    this.music.gain.value = s.music * 0.6;
    this.ui.gain.value = s.ui;
  }

  setListener(x: number, y: number, z: number, fx: number, fy: number, fz: number): void {
    const c = this.ctx;
    if (!c) return;
    this.lx = x;
    this.lz = z;
    const L = c.listener;
    if (L.positionX) {
      const t = c.currentTime;
      L.positionX.setTargetAtTime(x, t, 0.02);
      L.positionY.setTargetAtTime(y, t, 0.02);
      L.positionZ.setTargetAtTime(z, t, 0.02);
      L.forwardX.setTargetAtTime(fx, t, 0.02);
      L.forwardY.setTargetAtTime(fy, t, 0.02);
      L.forwardZ.setTargetAtTime(fz, t, 0.02);
      L.upX.value = 0;
      L.upY.value = 1;
      L.upZ.value = 0;
    } else {
      (L as unknown as { setPosition: (a: number, b: number, c: number) => void }).setPosition(x, y, z);
      (L as unknown as { setOrientation: (a: number, b: number, c: number, d: number, e: number, f: number) => void }).setOrientation(fx, fy, fz, 0, 1, 0);
    }
  }

  private out(pos: [number, number, number] | null, bus: 'sfx' | 'ui' = 'sfx', refDist = 6, maxDist = 400): AudioNode {
    const c = this.ctx!;
    if (!pos) return bus === 'ui' ? this.ui : this.sfx;
    const p = c.createPanner();
    p.panningModel = 'equalpower';
    p.distanceModel = 'inverse';
    p.refDistance = refDist;
    p.maxDistance = maxDist;
    p.rolloffFactor = 1.1;
    if (p.positionX) {
      p.positionX.value = pos[0];
      p.positionY.value = pos[1];
      p.positionZ.value = pos[2];
    } else (p as unknown as { setPosition: (a: number, b: number, c: number) => void }).setPosition(pos[0], pos[1], pos[2]);
    p.connect(bus === 'ui' ? this.ui : this.sfx);
    return p;
  }

  private voice(prio: number, dur: number, stop: () => void): boolean {
    const c = this.ctx!;
    const now = c.currentTime;
    this.voices = this.voices.filter((v) => v.end > now);
    if (this.voices.length >= 28) {
      const low = this.voices.reduce((a, b) => (a.prio < b.prio ? a : b));
      if (low.prio > prio) return false;
      low.stop();
      this.voices.splice(this.voices.indexOf(low), 1);
    }
    this.voices.push({ end: now + dur, prio, stop });
    return true;
  }

  private noiseBurst(dst: AudioNode, t: number, dur: number, gain: number, type: BiquadFilterType, freq: number, q = 1, freqEnd?: number): AudioBufferSourceNode {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(dst);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
    return s;
  }

  private tone(dst: AudioNode, t: number, type: OscillatorType, f0: number, f1: number, dur: number, gain: number, attack = 0.005): OscillatorNode {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g);
    g.connect(dst);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  /** Geräusch abspielen; pos = Weltposition (null = ohne Raumklang). */
  play(name: SoundName, pos: [number, number, number] | null = null, vol = 1): void {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const t = c.currentTime + 0.005;
    const isUi = name === 'click' || name === 'hover' || name === 'levelUp' || name === 'victory' || name === 'defeat';
    const ref = name === 'step' ? 3 : name === 'explosion' || name === 'sniper' ? 25 : 8;
    const dst = this.out(pos, isUi ? 'ui' : 'sfx', ref);
    const g = c.createGain();
    g.gain.value = vol;
    g.connect(dst);
    const prio = name === 'step' ? 0 : isUi ? 5 : name === 'hit' || name === 'headshot' ? 4 : 2;
    const ok = this.voice(prio, 1.2, () => g.disconnect());
    if (!ok) return;
    if (pos && this.onViz && settings.data.soundViz) {
      const viz: Partial<Record<SoundName, string>> = { pistol: 'shot', smg: 'shot', rifle: 'shot', burst: 'shot', shotgun: 'shot', sniper: 'shot', rocket: 'shot', explosion: 'boom', step: 'step', chest: 'chest', build: 'build', glide: 'glide', crash: 'boom' };
      const k = viz[name];
      if (k) this.onViz(k, pos[0], pos[2]);
    }
    switch (name) {
      case 'pistol':
        this.noiseBurst(g, t, 0.18, 0.9, 'bandpass', 2200, 0.8, 600);
        this.tone(g, t, 'square', 320, 90, 0.08, 0.35);
        break;
      case 'smg':
        this.noiseBurst(g, t, 0.12, 0.7, 'bandpass', 2800, 0.9, 900);
        this.tone(g, t, 'square', 260, 110, 0.05, 0.25);
        break;
      case 'rifle':
      case 'burst':
        this.noiseBurst(g, t, 0.26, 1.0, 'lowpass', 3800, 0.7, 500);
        this.tone(g, t, 'sawtooth', 180, 55, 0.12, 0.45);
        break;
      case 'shotgun':
        this.noiseBurst(g, t, 0.45, 1.3, 'lowpass', 2600, 0.6, 250);
        this.tone(g, t, 'sine', 120, 40, 0.25, 0.9);
        this.noiseBurst(g, t + 0.32, 0.08, 0.25, 'highpass', 2000);
        this.noiseBurst(g, t + 0.45, 0.06, 0.2, 'highpass', 2500);
        break;
      case 'sniper':
        this.noiseBurst(g, t, 0.7, 1.4, 'lowpass', 5000, 0.6, 180);
        this.tone(g, t, 'sine', 90, 30, 0.6, 1.0);
        this.noiseBurst(g, t + 0.05, 1.2, 0.18, 'bandpass', 600, 0.4, 200);
        break;
      case 'rocket':
        this.noiseBurst(g, t, 0.5, 0.8, 'bandpass', 900, 0.5, 300);
        this.tone(g, t, 'sawtooth', 200, 600, 0.4, 0.25);
        break;
      case 'explosion':
        this.noiseBurst(g, t, 1.4, 1.6, 'lowpass', 1600, 0.5, 60);
        this.tone(g, t, 'sine', 70, 25, 1.0, 1.2, 0.01);
        break;
      case 'pickaxe':
        this.noiseBurst(g, t, 0.1, 0.6, 'bandpass', 1800, 2);
        this.tone(g, t, 'triangle', 700, 300, 0.1, 0.25);
        break;
      case 'swing':
        this.noiseBurst(g, t, 0.18, 0.25, 'bandpass', 900, 1, 2400);
        break;
      case 'harvestWood':
        this.tone(g, t, 'triangle', 220, 140, 0.12, 0.5);
        this.noiseBurst(g, t, 0.1, 0.4, 'bandpass', 700, 1.5);
        break;
      case 'harvestStone':
        this.tone(g, t, 'square', 520, 300, 0.08, 0.2);
        this.noiseBurst(g, t, 0.14, 0.5, 'highpass', 1800);
        break;
      case 'harvestMetal':
        this.tone(g, t, 'sine', 1240, 1180, 0.4, 0.3);
        this.tone(g, t, 'sine', 1870, 1800, 0.3, 0.15);
        break;
      case 'hit':
        this.tone(g, t, 'square', 1500, 1400, 0.05, 0.22);
        break;
      case 'headshot':
        this.tone(g, t, 'square', 2100, 2100, 0.05, 0.25);
        this.tone(g, t + 0.05, 'square', 2800, 2800, 0.07, 0.22);
        break;
      case 'shieldBreak':
        this.noiseBurst(g, t, 0.4, 0.5, 'highpass', 3000);
        this.tone(g, t, 'triangle', 1600, 400, 0.35, 0.3);
        break;
      case 'step':
        this.noiseBurst(g, t, 0.07, 0.3 * vol, 'bandpass', 500 + Math.random() * 300, 1.2);
        break;
      case 'jump':
        this.noiseBurst(g, t, 0.1, 0.2, 'bandpass', 600, 1);
        break;
      case 'land':
        this.noiseBurst(g, t, 0.16, 0.45, 'lowpass', 500, 0.8);
        break;
      case 'glide':
        this.noiseBurst(g, t, 0.6, 0.5, 'bandpass', 400, 0.6, 1600);
        break;
      case 'build':
        this.tone(g, t, 'square', 180, 120, 0.09, 0.3);
        this.noiseBurst(g, t, 0.12, 0.4, 'lowpass', 900);
        break;
      case 'chest':
        [880, 1109, 1319, 1760].forEach((f, i) => this.tone(g, t + i * 0.07, 'triangle', f, f, 0.3, 0.18));
        break;
      case 'pickup':
        this.tone(g, t, 'triangle', 660, 990, 0.1, 0.22);
        break;
      case 'reload':
        this.noiseBurst(g, t, 0.05, 0.35, 'highpass', 3000);
        this.noiseBurst(g, t + 0.35, 0.06, 0.4, 'highpass', 2500);
        this.tone(g, t + 0.36, 'square', 900, 700, 0.04, 0.12);
        break;
      case 'heal':
        this.tone(g, t, 'sine', 440, 880, 0.5, 0.2, 0.05);
        break;
      case 'shield':
        this.tone(g, t, 'sine', 620, 1240, 0.45, 0.2, 0.05);
        this.tone(g, t + 0.1, 'sine', 930, 1860, 0.35, 0.12, 0.05);
        break;
      case 'door':
        this.tone(g, t, 'sawtooth', 160, 120, 0.25, 0.12);
        this.noiseBurst(g, t, 0.2, 0.25, 'lowpass', 700);
        break;
      case 'click':
        this.tone(g, t, 'triangle', 900, 700, 0.05, 0.2);
        break;
      case 'hover':
        this.tone(g, t, 'sine', 1300, 1300, 0.03, 0.06);
        break;
      case 'elim':
        this.tone(g, t, 'sawtooth', 300, 900, 0.18, 0.25);
        this.tone(g, t + 0.15, 'triangle', 1200, 1200, 0.25, 0.25);
        break;
      case 'knock':
        this.tone(g, t, 'square', 600, 300, 0.2, 0.2);
        break;
      case 'victory':
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(g, t + i * 0.14, 'triangle', f, f, 0.4, 0.25));
        break;
      case 'defeat':
        [392, 349, 311, 262].forEach((f, i) => this.tone(g, t + i * 0.2, 'triangle', f, f * 0.98, 0.45, 0.22));
        break;
      case 'zoneWarn':
        this.tone(g, t, 'sawtooth', 220, 330, 0.5, 0.15);
        this.tone(g, t + 0.5, 'sawtooth', 220, 330, 0.5, 0.15);
        break;
      case 'splash':
        this.noiseBurst(g, t, 0.5, 0.6, 'lowpass', 1400, 0.5, 300);
        break;
      case 'pad':
        this.tone(g, t, 'sine', 200, 1200, 0.45, 0.3);
        break;
      case 'slide':
        this.noiseBurst(g, t, 0.5, 0.3, 'bandpass', 900, 0.7, 400);
        break;
      case 'climb':
        this.noiseBurst(g, t, 0.15, 0.25, 'bandpass', 800, 1);
        break;
      case 'empty':
        this.tone(g, t, 'square', 1200, 1100, 0.03, 0.12);
        break;
      case 'crash':
        this.noiseBurst(g, t, 0.5, 1.0, 'lowpass', 1200, 0.6, 200);
        this.tone(g, t, 'square', 140, 60, 0.3, 0.3);
        break;
      case 'enter':
        this.tone(g, t, 'square', 300, 240, 0.08, 0.15);
        break;
      case 'hurt':
        this.noiseBurst(g, t, 0.15, 0.4, 'lowpass', 600);
        this.tone(g, t, 'sine', 160, 90, 0.15, 0.4);
        break;
      case 'levelUp':
        [523, 784, 1047, 1568].forEach((f, i) => this.tone(g, t + i * 0.09, 'triangle', f, f, 0.5, 0.2));
        break;
      case 'busJump':
        this.noiseBurst(g, t, 0.8, 0.4, 'bandpass', 500, 0.5, 1500);
        break;
      case 'throw':
        this.noiseBurst(g, t, 0.2, 0.3, 'bandpass', 700, 1, 1800);
        break;
    }
  }

  /** Dauergeräusch (Wind, Sturm, Motor, Luftschiff). level 0 = aus. */
  loop(name: 'wind' | 'storm' | 'engine' | 'airship' | 'rain', level: number, pitch = 1): void {
    const c = this.ctx;
    if (!c) return;
    let L = this.loops.get(name);
    if (!L && level > 0.001) {
      const g = c.createGain();
      g.gain.value = 0;
      g.connect(this.sfx);
      const srcs: AudioScheduledSourceNode[] = [];
      let filter: BiquadFilterNode | undefined;
      if (name === 'wind' || name === 'storm' || name === 'rain') {
        const s = c.createBufferSource();
        s.buffer = this.noise;
        s.loop = true;
        filter = c.createBiquadFilter();
        filter.type = name === 'rain' ? 'highpass' : 'bandpass';
        filter.frequency.value = name === 'storm' ? 280 : name === 'rain' ? 2500 : 700;
        filter.Q.value = name === 'storm' ? 0.8 : 0.5;
        s.connect(filter);
        filter.connect(g);
        s.start();
        srcs.push(s);
        if (name === 'storm') {
          const o = c.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = 55;
          const og = c.createGain();
          og.gain.value = 0.06;
          o.connect(og);
          og.connect(g);
          o.start();
          srcs.push(o);
        }
      } else {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = name === 'engine' ? 70 : 48;
        filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = name === 'engine' ? 500 : 260;
        o.connect(filter);
        filter.connect(g);
        o.start();
        srcs.push(o);
      }
      L = { gain: g, src: srcs, filter };
      this.loops.set(name, L);
    }
    if (!L) return;
    const t = c.currentTime;
    L.gain.gain.setTargetAtTime(Math.max(0, level), t, 0.15);
    if (name === 'engine') (L.src[0] as OscillatorNode).frequency.setTargetAtTime(60 + pitch * 90, t, 0.08);
    if (name === 'wind' && L.filter) L.filter.frequency.setTargetAtTime(500 + pitch * 900, t, 0.2);
    if (level <= 0.001) {
      // nach dem Ausblenden stoppen
      const ref = L;
      setTimeout(() => {
        if (ref.gain.gain.value < 0.002 && this.loops.get(name) === ref) {
          for (const s of ref.src) s.stop();
          ref.gain.disconnect();
          this.loops.delete(name);
        }
      }, 800);
    }
  }

  stopLoops(): void {
    for (const k of [...this.loops.keys()]) this.loop(k as 'wind', 0);
  }

  // ---------- Musik (eigene, prozedurale Komposition) ----------

  setMusic(mode: 'menu' | 'game' | 'off'): void {
    this.musicMode = mode;
    if (!this.ctx) return;
    if (mode === 'off') {
      if (this.musicTimer) clearInterval(this.musicTimer);
      this.musicTimer = null;
      return;
    }
    if (!this.musicTimer) {
      this.musicNext = this.ctx.currentTime + 0.1;
      this.musicTimer = setInterval(() => this.schedule(), 100);
    }
  }

  private schedule(): void {
    const c = this.ctx;
    if (!c || this.musicMode === 'off') return;
    const bpm = this.musicMode === 'menu' ? 104 : 86;
    const step = 60 / bpm / 4;
    // Akkordfolge (eigene Progression): Am – F – C – G, in Sechzehnteln
    const chords = [
      [57, 60, 64],
      [53, 57, 60],
      [48, 52, 55],
      [55, 59, 62],
    ];
    const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
    while (this.musicNext < c.currentTime + 0.3) {
      const t = this.musicNext;
      const s = this.musicStep;
      const bar = Math.floor(s / 16) % 4;
      const ch = chords[bar]!;
      const pos = s % 16;
      const dst = this.music;
      if (this.musicMode === 'menu') {
        // Bass
        if (pos % 4 === 0) this.tone(dst, t, 'sawtooth', mtof(ch[0]! - 12), mtof(ch[0]! - 12), step * 3.5, 0.12, 0.01);
        // Arpeggio
        const arp = ch[[0, 1, 2, 1, 0, 2, 1, 2][pos % 8]!]! + (pos >= 8 ? 12 : 0);
        this.tone(dst, t, 'triangle', mtof(arp + 12), mtof(arp + 12), step * 1.6, 0.05);
        // Schlagzeug
        if (pos % 4 === 0) this.tone(dst, t, 'sine', 120, 45, 0.18, 0.35, 0.002);
        if (pos % 8 === 4) this.noiseBurst(dst, t, 0.12, 0.12, 'highpass', 1800);
        if (pos % 2 === 1) this.noiseBurst(dst, t, 0.03, 0.04, 'highpass', 7000);
        // Flächen
        if (pos === 0) for (const n of ch) this.tone(dst, t, 'sine', mtof(n), mtof(n), step * 15, 0.03, 0.3);
      } else {
        if (pos === 0) for (const n of ch) this.tone(dst, t, 'sine', mtof(n - 12), mtof(n - 12), step * 16, 0.025, 0.8);
        if (pos % 8 === 0) this.tone(dst, t, 'triangle', mtof(ch[(s / 8) % 3]! + 12), mtof(ch[(s / 8) % 3]! + 12), step * 6, 0.015, 0.2);
      }
      this.musicNext += step;
      this.musicStep++;
    }
  }

  get listenerXZ(): [number, number] {
    return [this.lx, this.lz];
  }
}

export const audio = new AudioEngine();
