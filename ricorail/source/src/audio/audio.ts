/**
 * RicoRail – prozedurale Sound-Engine (WebAudio).
 * Alle Klänge werden synthetisiert (Oszillatoren, gefiltertes Rauschen, Hüllkurven) – keine Samples, kein Netzwerk.
 * Ansagen nutzen optional die eingebaute speechSynthesis des Browsers.
 * Ohne WebAudio (Node/Tests) ist jede Methode ein sicherer No-Op.
 */

export type Traction = 'electric' | 'diesel' | 'steam' | 'none';
export interface AudioVolumes { master: number; train: number; env: number; ui: number; voice: number } // 0..1
export interface AudioState {
  traction: Traction;
  speed: number;
  throttle: number;
  power: number;
  dyn: number;
  brake: number;
  engineRpm: number;
  compressor: boolean;
  slip: boolean; slide: boolean; sand: boolean;
  wheelAngle: number;
  cutoff: number;
  rail: 'dry' | 'wet' | 'snow' | 'leaves' | 'ice';
  curve: number;
  jointRate: number;
  tunnel: boolean;
  inCab: boolean;
  rain: number; wind: number; thunder: boolean;
  crossingBell: number;
  ambience: number;
  birds: number;
  pantoArc: boolean;
  doorsMoving: boolean;
}
export type Sfx = 'horn_start' | 'horn_stop' | 'whistle_start' | 'whistle_stop' | 'door_open' | 'door_close' | 'door_beep' | 'switch' | 'couple' | 'uncouple' | 'brake_release' | 'emergency' | 'pzb' | 'pzb_brake' | 'sifa' | 'ui_click' | 'ui_ok' | 'ui_err' | 'ui_notify' | 'panto_up' | 'main_switch' | 'engine_start' | 'engine_stop' | 'buffer_hit' | 'crash' | 'chime' | 'load' | 'injector';

const clamp = (x: number, a = 0, b = 1): number => (x < a ? a : x > b ? b : x);
const num = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
const sstep = (a: number, b: number, x: number): number => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

const RAIL_LEVEL: Record<string, number> = { dry: 1, wet: 0.75, snow: 0.6, leaves: 0.85, ice: 0.8 };
const RAIL_BRIGHT: Record<string, number> = { dry: 1, wet: 0.7, snow: 0.45, leaves: 0.8, ice: 0.9 };
/** Stufen des „singenden“ Umrichters (Halbtöne). */
const INV_STEPS = [0, 2, 4, 5, 7, 9, 11, 12, 14];
const MAX_ONESHOTS = 10;

interface ToneOpts { f: number; f2?: number; type?: OscillatorType; dur: number; vol: number; at?: number; a?: number; hold?: boolean; lp?: number; bus?: AudioNode; gate?: [number, number, number] }
interface NoiseOpts { type: BiquadFilterType; f: number; f2?: number; q?: number; dur: number; vol: number; at?: number; a?: number; hold?: boolean; bus?: AudioNode; flicker?: number; gate?: [number, number, number] }
interface Held { stop(t: number): void }

/** Der komplette Audio-Graph; existiert erst nach unlock(). */
class Graph {
  readonly ctx: AudioContext;
  private noiseBuf: AudioBuffer;
  private sources: AudioScheduledSourceNode[] = [];
  private last = new Map<AudioParam, number>();
  private oneShots = 0;

  // Busse
  readonly master: GainNode; readonly trainBus: GainNode; readonly envBus: GainNode; readonly uiBus: GainNode; readonly voiceBus: GainNode;
  readonly mix: GainNode; private ext: GainNode; private trainLP: BiquadFilterNode; private echoSend: GainNode;
  readonly envIn: GainNode; private envLP: BiquadFilterNode; private envMul: GainNode;
  // Allgemein
  private rollLP: BiquadFilterNode; private rollLvl: GainNode; private rumbleLvl: GainNode;
  private windBP: BiquadFilterNode; private windLvl: GainNode;
  private squealOsc: OscillatorNode; private squealLvl: GainNode;
  private flangeOsc: OscillatorNode; private flangeLvl: GainNode;
  private slipOsc: OscillatorNode; private slipBP: BiquadFilterNode; private slipLvl: GainNode;
  private sandLvl: GainNode; private compLvl: GainNode; private doorLvl: GainNode; private arcEnv: GainNode;
  private clackEnv: GainNode;
  // Elektro
  private m1: OscillatorNode; private m2: OscillatorNode; private m3: OscillatorNode; private motorLP: BiquadFilterNode; private motorLvl: GainNode;
  private inv: OscillatorNode; private invLP: BiquadFilterNode; private invLvl: GainNode;
  private humLvl: GainNode; private blowBP: BiquadFilterNode; private blowLvl: GainNode;
  // Diesel
  private fire: OscillatorNode; private mod: OscillatorNode; private engLP: BiquadFilterNode; private engLvl: GainNode;
  private exhLP: BiquadFilterNode; private exhLvl: GainNode; private turbo: OscillatorNode; private turboLvl: GainNode;
  // Dampf
  private chuffBP: BiquadFilterNode; private chuffEnv: GainNode; private hissLvl: GainNode; private valveLvl: GainNode;
  // Umwelt
  private rainLvl: GainNode; private ewLP: BiquadFilterNode; private ewLvl: GainNode;
  private bellEnv: GainNode; private cBP1: BiquadFilterNode; private cBP2: BiquadFilterNode; private crowdLvl: GainNode;
  private birdOsc: OscillatorNode; private birdEnv: GainNode;

  // Zustand
  private prevAngle = NaN; private chuffN = 0;
  private jointPhase = 0; private bellPhase = 0.999; private prevThunder = false;
  private squealing = false; private slowTimer = 0; private birdNext = 0;
  private valveUntil = 0; private humHold = 0;
  dieselRunning = true; dieselStartAt = 0; private spin = 1;
  horn: Held | null = null; whistle: Held | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 3);
    this.noiseBuf = ctx.createBuffer(1, len, sr);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // ---- Busse ----
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 6; limiter.ratio.value = 12; limiter.attack.value = 0.003; limiter.release.value = 0.2;
    limiter.connect(ctx.destination);
    this.master = this.gain(0.8, limiter);
    this.trainBus = this.gain(0.8, this.master);
    this.envBus = this.gain(0.7, this.master);
    this.uiBus = this.gain(0.7, this.master);
    this.voiceBus = this.gain(0.8, this.master);
    this.trainLP = this.filt('lowpass', 16000, 0.5, this.trainBus);
    this.mix = this.gain(1, this.trainLP);
    this.ext = this.gain(1, this.mix);
    // Tunnel-Echo: einfache Rückkopplungsverzögerung
    this.echoSend = this.gain(0, null);
    this.mix.connect(this.echoSend);
    const delay = ctx.createDelay(0.5); delay.delayTime.value = 0.085;
    const fbLP = this.filt('lowpass', 1800, 0.5, null);
    const fb = this.gain(0.42, delay);
    this.echoSend.connect(delay); delay.connect(fbLP); fbLP.connect(fb); fbLP.connect(this.trainLP);
    this.envMul = this.gain(1, this.envBus);
    this.envLP = this.filt('lowpass', 12000, 0.5, this.envMul);
    this.envIn = this.gain(1, this.envLP);

    // ---- Quellen (persistent) ----
    const nA = this.noiseSrc(0);
    const nB = this.noiseSrc(1.37);
    const lfoV = this.osc('sine', 5.5, null);   // Vibrato (Quietschen)
    const lfoS = this.osc('sine', 0.23, null);  // langsamer Wind-Modulator
    const lfoC = this.osc('square', 4.5, null); // Kompressor-Takt

    // Rollgeräusch
    this.rollLvl = this.gain(0, this.ext);
    this.rollLP = this.filt('lowpass', 400, 0.7, this.rollLvl); nA.connect(this.rollLP);
    this.rumbleLvl = this.gain(0, this.ext);
    nA.connect(this.filt('lowpass', 90, 0.8, this.rumbleLvl));
    // Fahrtwind
    this.windLvl = this.gain(0, this.ext);
    this.windBP = this.filt('bandpass', 600, 0.6, this.windLvl);
    const windAM = this.gain(0.7, this.windBP); nA.connect(windAM);
    lfoS.connect(this.gain(0.3, windAM.gain));
    // Bremsquietschen
    this.squealLvl = this.gain(0, this.ext);
    this.squealOsc = this.osc('sine', 2800, this.squealLvl);
    lfoV.connect(this.gain(25, this.squealOsc.frequency));
    // Spurkranzquietschen
    this.flangeLvl = this.gain(0, this.ext);
    this.flangeOsc = this.osc('sine', 3900, this.flangeLvl);
    lfoV.connect(this.gain(70, this.flangeOsc.frequency));
    // Schleudern / Gleiten
    this.slipLvl = this.gain(0, this.mix);
    this.slipBP = this.filt('bandpass', 600, 2, this.slipLvl);
    this.slipOsc = this.osc('sawtooth', 200, this.slipBP);
    // Sand
    this.sandLvl = this.gain(0, this.ext);
    nA.connect(this.filt('highpass', 3500, 0.7, this.sandLvl));
    // Kompressor (Takt vor dem Filter → keine Klicks)
    this.compLvl = this.gain(0, this.mix);
    const compAM = this.gain(0.5, null); nA.connect(compAM);
    lfoC.connect(this.gain(0.5, compAM.gain));
    compAM.connect(this.filt('lowpass', 150, 1, this.compLvl));
    compAM.connect(this.filt('bandpass', 380, 1.5, this.compLvl));
    // Türbewegung
    this.doorLvl = this.gain(0, this.mix);
    nA.connect(this.filt('bandpass', 900, 0.7, this.doorLvl));
    // Stromabnehmer-Funken
    this.arcEnv = this.gain(0, this.ext);
    nA.connect(this.filt('highpass', 2500, 0.7, this.arcEnv));
    // Schienenstöße
    this.clackEnv = this.gain(0, this.ext);
    nA.connect(this.filt('bandpass', 1500, 0.9, this.clackEnv));
    nA.connect(this.filt('lowpass', 180, 1, this.gain(4, this.clackEnv)));

    // Elektro: Fahrmotor
    this.motorLvl = this.gain(0, this.mix);
    this.motorLP = this.filt('lowpass', 800, 0.8, this.motorLvl);
    this.m1 = this.osc('triangle', 100, this.motorLP);
    this.m2 = this.osc('triangle', 100.6, this.motorLP);
    this.m3 = this.osc('sine', 300, this.gain(0.3, this.motorLP));
    this.invLvl = this.gain(0, this.mix);
    this.invLP = this.filt('lowpass', 1200, 1, this.invLvl);
    this.inv = this.osc('square', 330, this.invLP);
    this.humLvl = this.gain(0, this.mix);
    this.osc('sawtooth', 100, this.filt('lowpass', 380, 1, this.humLvl));
    this.blowLvl = this.gain(0, this.mix);
    this.blowBP = this.filt('bandpass', 800, 0.8, this.blowLvl); nA.connect(this.blowBP);

    // Diesel
    this.engLvl = this.gain(0, this.mix);
    this.engLP = this.filt('lowpass', 300, 1.2, this.engLvl);
    const engAM = this.gain(0.6, this.engLP);
    this.fire = this.osc('sawtooth', 60, engAM);
    this.exhLvl = this.gain(0, this.mix);
    this.exhLP = this.filt('lowpass', 500, 0.7, this.exhLvl);
    const exhAM = this.gain(0.6, this.exhLP); nA.connect(exhAM);
    this.mod = this.osc('square', 10, null);
    const modDepth = this.gain(0.4, null); this.mod.connect(modDepth);
    modDepth.connect(engAM.gain); modDepth.connect(exhAM.gain);
    this.turboLvl = this.gain(0, this.mix);
    this.turbo = this.osc('sine', 2000, this.turboLvl);

    // Dampf
    this.chuffEnv = this.gain(0, this.mix);
    this.chuffBP = this.filt('bandpass', 650, 0.8, this.chuffEnv); nA.connect(this.chuffBP);
    this.hissLvl = this.gain(0, this.mix);
    nA.connect(this.filt('highpass', 3500, 0.7, this.hissLvl));
    this.valveLvl = this.gain(0, this.mix);
    nA.connect(this.filt('bandpass', 2300, 2, this.valveLvl));

    // Umwelt
    this.rainLvl = this.gain(0, this.envIn);
    nB.connect(this.filt('highpass', 1200, 0.7, this.filt('lowpass', 7000, 0.7, this.rainLvl)));
    this.ewLvl = this.gain(0, this.envIn);
    this.ewLP = this.filt('lowpass', 500, 0.8, this.ewLvl);
    const ewAM = this.gain(0.6, this.ewLP); nB.connect(ewAM);
    lfoS.connect(this.gain(0.4, ewAM.gain));
    this.bellEnv = this.gain(0, this.envIn);
    this.osc('sine', 1450, this.bellEnv);
    this.osc('sine', 3480, this.gain(0.4, this.bellEnv));
    this.crowdLvl = this.gain(0, this.envIn);
    this.cBP1 = this.filt('bandpass', 500, 4, this.crowdLvl); nB.connect(this.cBP1);
    this.cBP2 = this.filt('bandpass', 1400, 4, this.crowdLvl); nB.connect(this.cBP2);
    this.birdEnv = this.gain(0, this.envIn);
    this.birdOsc = this.osc('sine', 3000, this.birdEnv);
  }

  // ---------- Bausteine ----------
  private gain(v: number, dest: AudioNode | AudioParam | null): GainNode {
    const g = this.ctx.createGain(); g.gain.value = v;
    if (dest) { if (dest instanceof AudioNode) g.connect(dest); else g.connect(dest); }
    return g;
  }
  private filt(type: BiquadFilterType, f: number, q: number, dest: AudioNode | null): BiquadFilterNode {
    const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
    if (dest) b.connect(dest);
    return b;
  }
  private osc(type: OscillatorType, f: number, dest: AudioNode | null): OscillatorNode {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f;
    if (dest) o.connect(dest);
    o.start(); this.sources.push(o);
    return o;
  }
  private noiseSrc(offset: number): AudioBufferSourceNode {
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    s.start(0, offset); this.sources.push(s);
    return s;
  }
  /** glatter Parameterwechsel ohne Zipper-Rauschen; überspringt unveränderte Werte */
  private set(p: AudioParam, v: number, tau = 0.06): void {
    const l = this.last.get(p);
    if (l !== undefined && Math.abs(l - v) <= 1e-4 * Math.max(1, Math.abs(v))) return;
    this.last.set(p, v);
    p.setTargetAtTime(v, this.ctx.currentTime, tau);
  }
  private oneShotEnd(nodes: AudioNode[]): void {
    this.oneShots--;
    for (const n of nodes) { try { n.disconnect(); } catch { /* bereits getrennt */ } }
  }
  /** Hüllkurve auf gain anwenden; liefert Ende */
  private env(g: AudioParam, t: number, o: { dur: number; vol: number; a?: number; hold?: boolean; gate?: [number, number, number] }): number {
    const a = o.a ?? 0.005;
    g.setValueAtTime(0, t);
    if (o.gate) {
      const [on, off, n] = o.gate;
      for (let i = 0; i < n; i++) {
        const ts = t + i * (on + off);
        g.setValueAtTime(0, ts); g.linearRampToValueAtTime(o.vol, ts + 0.005);
        g.setValueAtTime(o.vol, ts + on - 0.008); g.linearRampToValueAtTime(0, ts + on);
      }
      return t + n * (on + off);
    }
    g.linearRampToValueAtTime(o.vol, t + a);
    if (o.hold) {
      const r = Math.min(0.08, o.dur * 0.3);
      g.setValueAtTime(o.vol, t + Math.max(a, o.dur - r));
      g.linearRampToValueAtTime(0, t + o.dur);
      return t + o.dur;
    }
    g.setTargetAtTime(0, t + a, Math.max(0.005, (o.dur - a) / 4));
    return t + o.dur;
  }
  tone(o: ToneOpts): void {
    if (this.oneShots >= MAX_ONESHOTS) return;
    const c = this.ctx, t = c.currentTime + (o.at ?? 0);
    const os = c.createOscillator(); os.type = o.type ?? 'sine';
    os.frequency.setValueAtTime(o.f, t);
    if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    const g = c.createGain(); g.gain.value = 0;
    const nodes: AudioNode[] = [os, g];
    if (o.lp) { const f = this.filt('lowpass', o.lp, 0.7, g); os.connect(f); nodes.push(f); } else os.connect(g);
    g.connect(o.bus ?? this.mix);
    const end = this.env(g.gain, t, o);
    this.oneShots++;
    os.onended = () => this.oneShotEnd(nodes);
    os.start(t); os.stop(end + 0.05);
  }
  noise(o: NoiseOpts): void {
    if (this.oneShots >= MAX_ONESHOTS) return;
    const c = this.ctx, t = c.currentTime + (o.at ?? 0);
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = this.filt(o.type, o.f, o.q ?? 0.8, null);
    if (o.f2) { f.frequency.setValueAtTime(o.f, t); f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur); }
    const g = c.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(o.bus ?? this.mix);
    const end = this.env(g.gain, t, o);
    if (o.flicker) {
      const fg = c.createGain(); g.disconnect(); g.connect(fg); fg.connect(o.bus ?? this.mix);
      for (let ts = t; ts < end; ts += 0.03) fg.gain.setValueAtTime(1 - o.flicker * Math.random(), ts);
      s.onended = () => this.oneShotEnd([s, f, g, fg]);
    } else s.onended = () => this.oneShotEnd([s, f, g]);
    this.oneShots++;
    s.start(t, Math.random() * 2.5); s.stop(end + 0.05);
  }
  /** gehaltener Klang (Horn/Pfeife) */
  held(freqs: number[], type: OscillatorType, lp: number, vol: number, breath: number): Held {
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain(); g.gain.value = 0; g.connect(this.mix);
    const f = this.filt('lowpass', lp, 0.9, g);
    const srcs: AudioScheduledSourceNode[] = [];
    const nodes: AudioNode[] = [g, f];
    const per = vol / freqs.length;
    for (const fr of freqs) {
      const o = c.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(fr * 0.95, t); o.frequency.setTargetAtTime(fr, t, 0.06);
      o.connect(f); o.start(t); srcs.push(o); nodes.push(o);
    }
    if (breath > 0) {
      const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const bp = this.filt('bandpass', freqs[0] * 2, 1.5, null);
      const bg = this.gain(breath, g);
      s.connect(bp); bp.connect(bg); s.start(t, Math.random() * 2); srcs.push(s); nodes.push(s, bp, bg);
    }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(per, t + 0.06);
    let stopped = false;
    srcs[0].onended = () => { for (const n of nodes) { try { n.disconnect(); } catch { /* */ } } };
    return {
      stop: (ts: number) => {
        if (stopped) return; stopped = true;
        const gp = g.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => AudioParam };
        if (gp.cancelAndHoldAtTime) gp.cancelAndHoldAtTime(ts); else gp.cancelScheduledValues(ts);
        gp.setTargetAtTime(0, ts, 0.06);
        for (const s of srcs) s.stop(ts + 0.5);
      },
    };
  }

  // ---------- Pro Frame ----------
  update(dt: number, s: AudioState): void {
    const t = this.ctx.currentTime;
    const v = Math.abs(num(s.speed));
    const cab = !!s.inCab, tun = !!s.tunnel;
    const tr = s.traction;
    const rl = RAIL_LEVEL[s.rail] ?? 1, rb = RAIL_BRIGHT[s.rail] ?? 1;
    const throttle = clamp(num(s.throttle)), power = clamp(num(s.power)), dyn = clamp(num(s.dyn)), brake = clamp(num(s.brake));

    // Perspektive / Tunnel
    this.set(this.trainLP.frequency, cab ? (tun ? 1800 : 3200) : (tun ? 6000 : 16000), 0.15);
    this.set(this.ext.gain, (cab ? 0.5 : 1) * (tun ? 1.5 : 1), 0.2);
    this.set(this.echoSend.gain, tun ? 0.45 : 0, 0.3);
    this.set(this.envLP.frequency, tun ? 400 : cab ? 2000 : 12000, 0.3);
    this.set(this.envMul.gain, tun ? 0.25 : cab ? 0.6 : 1, 0.3);

    // Rollen, Wind
    const vr = clamp(v / 40);
    this.set(this.rollLvl.gain, Math.pow(vr, 0.8) * 0.32 * rl);
    this.set(this.rollLP.frequency, (250 + 3200 * vr) * rb, 0.15);
    this.set(this.rumbleLvl.gain, sstep(0.3, 25, v) * 0.5 * rl);
    this.set(this.windLvl.gain, Math.pow(clamp(v / 60), 2) * 0.35 * (cab ? 0.4 : 1), 0.15);
    this.set(this.windBP.frequency, 400 + v * 18, 0.2);

    // Bremsquietschen bei niedriger Geschwindigkeit
    const sq = brake > 0.2 && v > 0.2 && v < 9 ? ((brake - 0.2) / 0.8) * (1 - v / 9) * (s.rail === 'dry' ? 1 : 0.4) : 0;
    if (sq > 0 && !this.squealing) { this.squealing = true; this.set(this.squealOsc.frequency, rnd(2100, 3500), 0.01); }
    else if (sq === 0) this.squealing = false;
    this.set(this.squealLvl.gain, sq * 0.035, 0.12);
    // Spurkranz
    this.set(this.flangeLvl.gain, clamp(num(s.curve)) * sstep(0.5, 3, v) * 0.03, 0.15);
    // Schleudern/Gleiten
    const slipF = s.slip ? 270 + v * 25 : 60 + v * 8;
    this.set(this.slipOsc.frequency, slipF, 0.1);
    this.set(this.slipBP.frequency, slipF * 3, 0.1);
    this.set(this.slipLvl.gain, s.slip ? 0.06 : s.slide && v > 0.3 ? 0.05 : 0, 0.08);
    this.set(this.sandLvl.gain, s.sand ? 0.05 : 0, 0.1);
    this.set(this.compLvl.gain, s.compressor ? 0.28 : 0, 0.2);
    this.set(this.doorLvl.gain, s.doorsMoving ? 0.07 : 0, 0.1);

    // Funken am Stromabnehmer
    if (s.pantoArc && tr === 'electric' && v > 3 && Math.random() < dt * 2.5) {
      const p = this.arcEnv.gain, n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const ts = t + rnd(0, 0.06);
        p.setTargetAtTime(rnd(0.08, 0.2), ts, 0.001); p.setTargetAtTime(0, ts + 0.004, 0.02);
      }
    }

    // Schienenstöße: pro Stoß zwei Achsen je Drehgestell
    const jr = clamp(num(s.jointRate), 0, 15);
    if (jr > 0 && v > 0.3) {
      this.jointPhase += jr * dt;
      let guard = 0;
      while (this.jointPhase >= 1 && guard++ < 3) {
        this.jointPhase -= 1;
        const off = clamp(1 - this.jointPhase / Math.max(1e-3, jr * dt)) * dt;
        const ts = t + off, pk = 0.35 * sstep(0.5, 10, v) * rl;
        const axle = clamp(2.6 / v, 0.03, 0.25), bogie = 17 / v;
        this.click(ts, pk); this.click(ts + axle, pk * 0.85);
        if (bogie < Math.min(0.6, 0.8 / jr)) { this.click(ts + bogie, pk * 0.7); this.click(ts + bogie + axle, pk * 0.6); }
      }
    } else this.jointPhase = 0;

    // ---- Elektro ----
    const isE = tr === 'electric';
    const pw = Math.max(power, dyn);
    const fm = 12 + v * 20;
    this.set(this.m1.frequency, fm, 0.05); this.set(this.m2.frequency, fm * 1.006, 0.05); this.set(this.m3.frequency, fm * 3, 0.05);
    this.set(this.motorLP.frequency, fm * 4 + 200, 0.1);
    this.set(this.motorLvl.gain, isE ? sstep(0.2, 4, v) * (0.05 + 0.13 * pw) * (1 - 0.3 * sstep(30, 60, v)) : 0, 0.1);
    const step = Math.min(INV_STEPS.length - 1, Math.floor(v / 1.25));
    const frac = v / 1.25 - Math.floor(v / 1.25);
    const invF = 330 * Math.pow(2, INV_STEPS[step] / 12) * (1 + 0.03 * frac);
    this.set(this.inv.frequency, invF, 0.008);
    this.set(this.invLP.frequency, invF * 3, 0.05);
    this.set(this.invLvl.gain, isE && pw > 0.02 ? 0.03 * Math.min(1, pw * 3) * (1 - sstep(10, 14, v)) : 0, 0.08);
    const live = pw > 0.01 || v > 0.1 || t < this.humHold;
    this.set(this.humLvl.gain, isE && live ? 0.02 + 0.05 * pw : 0, 0.2);
    this.set(this.blowLvl.gain, isE ? (0.02 + 0.1 * pw) * (live ? 1 : 0.3) : 0, 0.3);
    this.set(this.blowBP.frequency, 700 + 700 * pw, 0.4);

    // ---- Diesel ----
    const isD = tr === 'diesel';
    const target = this.dieselRunning && t >= this.dieselStartAt ? 1 : 0;
    this.spin += (target - this.spin) * (1 - Math.exp(-dt / (target > this.spin ? 0.5 : 1.2)));
    const rpm = clamp(num(s.engineRpm)), sp = this.spin;
    const fireF = (55 + 125 * rpm) * (0.3 + 0.7 * sp);
    this.set(this.fire.frequency, fireF, 0.1); this.set(this.mod.frequency, fireF / 6, 0.1);
    this.set(this.engLP.frequency, 180 + 700 * rpm + 500 * power, 0.15);
    this.set(this.engLvl.gain, isD ? sp * (0.12 + 0.12 * rpm + 0.1 * power) : 0, 0.12);
    this.set(this.exhLP.frequency, 300 + 1800 * rpm, 0.15);
    this.set(this.exhLvl.gain, isD ? sp * (0.04 + 0.15 * rpm * (0.4 + 0.6 * power)) : 0, 0.12);
    this.set(this.turbo.frequency, 1800 + 4200 * rpm * rpm, 0.3);
    this.set(this.turboLvl.gain, isD ? sp * sstep(0.4, 1, rpm) * 0.02 * (0.5 + power) : 0, 0.3);

    // ---- Dampf ----
    const isS = tr === 'steam';
    this.set(this.hissLvl.gain, isS ? 0.02 + 0.02 * throttle : 0, 0.3);
    if (isS && v < 5 && t > this.valveUntil + 20 && Math.random() < dt / 60) this.valveUntil = t + rnd(3, 6);
    this.set(this.valveLvl.gain, isS && t < this.valveUntil ? 0.1 : 0, 0.25);
    const ang = num(s.wheelAngle);
    const q = Math.PI / 2;
    if (!Number.isFinite(this.prevAngle) || Math.abs(ang - this.prevAngle) > 4 * Math.PI) this.prevAngle = ang;
    const k0 = Math.floor(this.prevAngle / q), k1 = Math.floor(ang / q);
    if (isS && k1 !== k0) {
      const n = Math.min(4, Math.abs(k1 - k0)), dir = k1 > k0 ? 1 : -1;
      const da = ang - this.prevAngle;
      const intens = 0.06 + 0.5 * throttle * clamp(Math.abs(num(s.cutoff)) / 0.6);
      const revPerS = v > 0.05 ? Math.abs(da) / (2 * Math.PI) / Math.max(dt, 1e-3) : 1;
      const decay = Math.min(0.08, 0.35 / Math.max(1, revPerS * 4));
      for (let i = 1; i <= n; i++) {
        const edge = (dir > 0 ? k0 + i : k0 - i + 1) * q;
        const off = clamp((edge - this.prevAngle) / (da || 1)) * dt;
        const ts = t + off;
        const pk = intens * (this.chuffN++ % 4 === 0 ? 1.15 : rnd(0.85, 1));
        this.chuffBP.frequency.setValueAtTime(rnd(500, 800), ts);
        this.chuffEnv.gain.setTargetAtTime(pk, ts, 0.004);
        this.chuffEnv.gain.setTargetAtTime(0, ts + 0.025, decay);
      }
    }
    this.prevAngle = ang;

    // ---- Umwelt ----
    this.set(this.rainLvl.gain, clamp(num(s.rain)) * 0.22, 0.4);
    const wi = clamp(num(s.wind));
    this.set(this.ewLvl.gain, wi * 0.25, 0.4);
    this.set(this.ewLP.frequency, 300 + 500 * wi, 0.5);
    if (s.thunder && !this.prevThunder) this.thunder();
    this.prevThunder = !!s.thunder;
    const bell = clamp(num(s.crossingBell));
    if (bell > 0.01) {
      this.bellPhase += 1.2 * dt;
      if (this.bellPhase >= 1) {
        this.bellPhase -= Math.floor(this.bellPhase);
        const p = this.bellEnv.gain;
        p.setTargetAtTime(bell * 0.2, t, 0.002); p.setTargetAtTime(0, t + 0.01, 0.22);
      }
    } else this.bellPhase = 0.999;
    this.set(this.crowdLvl.gain, clamp(num(s.ambience)) * 0.1, 0.5);
    this.slowTimer -= dt;
    if (this.slowTimer <= 0) {
      this.slowTimer = rnd(0.2, 0.45);
      this.cBP1.frequency.setTargetAtTime(rnd(300, 700), t, 0.08);
      this.cBP2.frequency.setTargetAtTime(rnd(900, 2200), t, 0.08);
      this.flangeOsc.frequency.setTargetAtTime(rnd(3500, 4300), t, 0.3);
    }
    const birds = clamp(num(s.birds));
    if (birds > 0.01 && !tun && t >= this.birdNext) this.birdNext = this.chirp(t + 0.02, birds) + rnd(0.6, 4.5) / (0.3 + birds);
  }

  private click(ts: number, pk: number): void {
    const p = this.clackEnv.gain;
    p.setTargetAtTime(pk, ts, 0.001); p.setTargetAtTime(0, ts + 0.004, 0.015);
  }
  private chirp(t0: number, lvl: number): number {
    const n = 2 + Math.floor(Math.random() * 4), f = rnd(2200, 4200), up = Math.random() < 0.5;
    const fp = this.birdOsc.frequency, gp = this.birdEnv.gain;
    let tb = t0;
    for (let i = 0; i < n; i++) {
      const fi = f * rnd(0.92, 1.08);
      fp.setValueAtTime(up ? fi : fi * 1.35, tb); fp.linearRampToValueAtTime(up ? fi * 1.35 : fi, tb + 0.05);
      gp.setValueAtTime(0, tb); gp.linearRampToValueAtTime(lvl * 0.05, tb + 0.01); gp.linearRampToValueAtTime(0, tb + 0.06);
      tb += rnd(0.08, 0.13);
    }
    return tb;
  }
  private thunder(): void {
    const at = rnd(0, 1.5), bus = this.envIn;
    this.noise({ type: 'lowpass', f: 900, f2: 120, q: 0.7, dur: 5, vol: 0.5, a: 0.05, at, bus });
    this.noise({ type: 'lowpass', f: 160, q: 1, dur: 6, vol: 0.6, a: 0.4, at: at + 0.2, bus, flicker: 0.5 });
  }
  setHumHold(sec: number): void { this.humHold = this.ctx.currentTime + sec; }

  dispose(): void {
    this.horn?.stop(this.ctx.currentTime); this.whistle?.stop(this.ctx.currentTime);
    for (const s of this.sources) { try { s.stop(); s.disconnect(); } catch { /* */ } }
    this.sources = [];
  }
}

export class AudioEngine {
  private g: Graph | null = null;
  private vol: AudioVolumes = { master: 0.8, train: 0.8, env: 0.7, ui: 0.7, voice: 0.8 };
  private paused = false;
  private disposed = false;
  private speechPending = 0;
  private deVoice: SpeechSynthesisVoice | null | undefined;

  constructor() { /* nichts starten vor unlock() (Autoplay-Regeln) */ }

  /** Muss aus einer Nutzergeste aufgerufen werden; erstellt/startet den AudioContext. Mehrfach aufrufbar. */
  async unlock(): Promise<boolean> {
    if (this.disposed) return false;
    try {
      if (!this.g) {
        const gl = globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
        const AC = gl.AudioContext ?? gl.webkitAudioContext;
        if (!AC) return false;
        this.g = new Graph(new AC());
        this.applyVolumes();
      }
      const ctx = this.g.ctx;
      if (ctx.state !== 'running' && !this.paused) {
        await Promise.race([ctx.resume().catch(() => undefined), new Promise((r) => setTimeout(r, 300))]);
      }
      return true;
    } catch {
      return false;
    }
  }

  get ready(): boolean { return !!this.g && this.g.ctx.state === 'running'; }

  setVolumes(v: AudioVolumes): void {
    this.vol = {
      master: clamp(num(v?.master)), train: clamp(num(v?.train)), env: clamp(num(v?.env)),
      ui: clamp(num(v?.ui)), voice: clamp(num(v?.voice)),
    };
    this.applyVolumes();
  }
  private applyVolumes(): void {
    const g = this.g; if (!g) return;
    const t = g.ctx.currentTime;
    g.master.gain.setTargetAtTime(this.vol.master, t, 0.05);
    g.trainBus.gain.setTargetAtTime(this.vol.train, t, 0.05);
    g.envBus.gain.setTargetAtTime(this.vol.env, t, 0.05);
    g.uiBus.gain.setTargetAtTime(this.vol.ui, t, 0.05);
    g.voiceBus.gain.setTargetAtTime(this.vol.voice, t, 0.05);
  }

  /** pro Frame (~30–60 Hz) */
  update(dt: number, s: AudioState): void {
    const g = this.g;
    if (!g || this.paused || !s || g.ctx.state !== 'running') return;
    try { g.update(clamp(num(dt), 0, 0.1), s); } catch { /* Audio darf das Spiel nie stoppen */ }
  }

  play(sfx: Sfx): void {
    const g = this.g;
    if (!g || this.paused || g.ctx.state !== 'running') return;
    try { this.sfx(g, sfx); } catch { /* */ }
  }

  private sfx(g: Graph, sfx: Sfx): void {
    const t = g.ctx.currentTime, ui = g.uiBus, voice = g.voiceBus;
    switch (sfx) {
      case 'horn_start': if (!g.horn) g.horn = g.held([311, 370], 'sawtooth', 1800, 0.22, 0); break;
      case 'horn_stop': g.horn?.stop(t); g.horn = null; break;
      case 'whistle_start': if (!g.whistle) g.whistle = g.held([349, 440, 523], 'triangle', 3000, 0.22, 0.04); break;
      case 'whistle_stop': g.whistle?.stop(t); g.whistle = null; break;
      case 'door_open':
        g.noise({ type: 'bandpass', f: 800, f2: 1600, dur: 1.8, vol: 0.12, a: 0.15, hold: true });
        g.noise({ type: 'highpass', f: 3000, dur: 0.5, vol: 0.08 });
        g.tone({ f: 120, f2: 70, dur: 0.15, vol: 0.3, at: 1.8 });
        break;
      case 'door_close':
        g.noise({ type: 'bandpass', f: 1600, f2: 800, dur: 1.6, vol: 0.12, a: 0.15, hold: true });
        g.tone({ f: 90, f2: 50, dur: 0.25, vol: 0.45, at: 1.6 });
        g.noise({ type: 'lowpass', f: 400, dur: 0.15, vol: 0.3, at: 1.6 });
        break;
      case 'door_beep': g.tone({ f: 1250, dur: 1.1, vol: 0.12, gate: [0.14, 0.14, 4] }); break;
      case 'switch':
        g.noise({ type: 'bandpass', f: 2200, q: 3, dur: 0.06, vol: 0.4 });
        g.noise({ type: 'bandpass', f: 2000, q: 3, dur: 0.06, vol: 0.3, at: 0.09 });
        g.tone({ f: 140, f2: 60, dur: 0.12, vol: 0.3 });
        break;
      case 'couple':
        g.tone({ f: 180, f2: 80, dur: 0.25, vol: 0.6 });
        g.noise({ type: 'bandpass', f: 900, q: 1.5, dur: 0.3, vol: 0.5 });
        g.tone({ f: 1250, dur: 0.6, vol: 0.06 }); g.tone({ f: 1873, dur: 0.4, vol: 0.04 });
        break;
      case 'uncouple':
        g.noise({ type: 'highpass', f: 2500, dur: 1.0, vol: 0.15, a: 0.02 });
        g.noise({ type: 'bandpass', f: 1100, dur: 0.12, vol: 0.3, at: 0.1 });
        g.tone({ f: 160, f2: 90, dur: 0.15, vol: 0.3, at: 0.1 });
        break;
      case 'brake_release':
        g.noise({ type: 'highpass', f: 2000, dur: 1.4, vol: 0.18, a: 0.02 });
        g.noise({ type: 'bandpass', f: 600, dur: 0.8, vol: 0.05 });
        break;
      case 'emergency':
        g.noise({ type: 'bandpass', f: 1200, q: 0.7, dur: 3, vol: 0.35, a: 0.03 });
        g.noise({ type: 'lowpass', f: 300, dur: 2, vol: 0.3 });
        break;
      case 'pzb': g.tone({ f: 1000, type: 'triangle', dur: 0.9, vol: 0.18, hold: true, bus: ui }); break;
      case 'pzb_brake': g.tone({ f: 440, type: 'square', lp: 1800, dur: 2, vol: 0.12, gate: [0.12, 0.08, 10], bus: ui }); break;
      case 'sifa': g.tone({ f: 1600, type: 'triangle', dur: 1.2, vol: 0.14, gate: [0.3, 0.1, 3], bus: ui }); break;
      case 'ui_click': g.tone({ f: 1800, dur: 0.03, vol: 0.12, a: 0.002, bus: ui }); break;
      case 'ui_ok':
        g.tone({ f: 660, dur: 0.09, vol: 0.12, hold: true, bus: ui });
        g.tone({ f: 990, dur: 0.14, vol: 0.12, hold: true, at: 0.09, bus: ui });
        break;
      case 'ui_err':
        g.tone({ f: 200, type: 'square', lp: 1200, dur: 0.12, vol: 0.1, hold: true, bus: ui });
        g.tone({ f: 180, type: 'square', lp: 1200, dur: 0.14, vol: 0.1, hold: true, at: 0.16, bus: ui });
        break;
      case 'ui_notify':
        g.tone({ f: 880, dur: 0.5, vol: 0.12, bus: ui });
        g.tone({ f: 1320, dur: 0.6, vol: 0.1, at: 0.12, bus: ui });
        break;
      case 'panto_up':
        g.noise({ type: 'bandpass', f: 400, f2: 1300, dur: 1.3, vol: 0.08, a: 0.2, hold: true });
        g.tone({ f: 100, f2: 60, dur: 0.15, vol: 0.3, at: 1.3 });
        g.noise({ type: 'highpass', f: 4000, dur: 0.08, vol: 0.25, at: 1.3 });
        break;
      case 'main_switch':
        g.tone({ f: 85, f2: 45, dur: 0.35, vol: 0.7 });
        g.noise({ type: 'bandpass', f: 500, dur: 0.08, vol: 0.4 });
        g.setHumHold(4);
        break;
      case 'engine_start':
        g.tone({ f: 70, f2: 110, type: 'sawtooth', lp: 600, dur: 1.6, vol: 0.15, hold: true });
        g.noise({ type: 'lowpass', f: 300, dur: 1.6, vol: 0.25, gate: [0.07, 0.06, 12] });
        g.noise({ type: 'lowpass', f: 500, dur: 0.6, vol: 0.3, at: 1.4 });
        g.dieselRunning = true; g.dieselStartAt = t + 1.4;
        break;
      case 'engine_stop':
        g.dieselRunning = false;
        g.noise({ type: 'lowpass', f: 200, dur: 1.5, vol: 0.1, at: 0.8, flicker: 0.6 });
        break;
      case 'buffer_hit':
        g.tone({ f: 70, f2: 40, dur: 0.4, vol: 0.8 });
        g.noise({ type: 'lowpass', f: 700, dur: 0.35, vol: 0.5 });
        g.tone({ f: 900, dur: 0.5, vol: 0.05 });
        break;
      case 'crash':
        g.noise({ type: 'lowpass', f: 2500, f2: 600, dur: 3, vol: 0.9, a: 0.01 });
        g.noise({ type: 'lowpass', f: 200, dur: 4, vol: 0.8, flicker: 0.4 });
        g.tone({ f: 55, f2: 30, dur: 1.5, vol: 0.8 });
        for (const [f, at] of [[1130, 0], [1730, 0.05], [2430, 0.12]]) g.tone({ f, dur: 2, vol: 0.07, at });
        for (let i = 0; i < 4; i++) g.noise({ type: 'bandpass', f: 3000, q: 2, dur: 0.1, vol: 0.3, at: rnd(0.2, 1.8) });
        break;
      case 'chime':
        [784, 659, 523].forEach((f, i) => {
          g.tone({ f, dur: 1.6, vol: 0.15, at: i * 0.45, bus: voice });
          g.tone({ f: f * 2, dur: 0.8, vol: 0.04, at: i * 0.45, bus: voice });
        });
        break;
      case 'load':
        g.noise({ type: 'bandpass', f: 1400, q: 0.6, dur: 2.8, vol: 0.15, a: 0.2, hold: true, flicker: 0.8 });
        g.noise({ type: 'lowpass', f: 250, dur: 3, vol: 0.25, a: 0.3, hold: true });
        break;
      case 'injector':
        g.tone({ f: 300, f2: 150, dur: 0.05, vol: 0.2 });
        g.noise({ type: 'highpass', f: 3500, dur: 3, vol: 0.1, a: 0.2, hold: true });
        g.noise({ type: 'bandpass', f: 2600, q: 6, dur: 3, vol: 0.06, a: 0.4, hold: true });
        break;
    }
  }

  /** kurze deutsche Ansage via speechSynthesis (optional) */
  announce(text: string): void {
    if (this.disposed || this.paused || !text || this.vol.voice <= 0 || this.vol.master <= 0) return;
    try {
      const gl = globalThis as unknown as { speechSynthesis?: SpeechSynthesis; SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance };
      const ss = gl.speechSynthesis, U = gl.SpeechSynthesisUtterance;
      if (!ss || !U) return;
      if (this.speechPending > 0 && !ss.speaking && !ss.pending) this.speechPending = 0; // hängende Zählung zurücksetzen
      if (this.speechPending >= 2) return; // eine spricht + eine wartet
      if (this.deVoice === undefined || this.deVoice === null) {
        const vs = ss.getVoices();
        if (vs.length) this.deVoice = vs.find((x) => /^de[-_]?DE/i.test(x.lang)) ?? vs.find((x) => /^de/i.test(x.lang)) ?? null;
      }
      const u = new U(String(text).slice(0, 400));
      u.lang = 'de-DE'; u.rate = 0.95; u.pitch = 1;
      u.volume = clamp(this.vol.voice * this.vol.master);
      if (this.deVoice) u.voice = this.deVoice;
      const done = (): void => { this.speechPending = Math.max(0, this.speechPending - 1); };
      u.onend = done; u.onerror = done;
      this.speechPending++;
      ss.speak(u);
    } catch { /* optional */ }
  }

  suspend(): void {
    this.paused = true;
    this.cancelSpeech();
    const g = this.g; if (!g) return;
    g.horn?.stop(g.ctx.currentTime); g.horn = null;
    g.whistle?.stop(g.ctx.currentTime); g.whistle = null;
    g.ctx.suspend().catch(() => undefined);
  }
  resume(): void {
    if (this.disposed) return;
    this.paused = false;
    this.g?.ctx.resume().catch(() => undefined);
  }
  dispose(): void {
    this.disposed = true;
    this.cancelSpeech();
    const g = this.g; this.g = null;
    if (!g) return;
    try { g.dispose(); } catch { /* */ }
    g.ctx.close().catch(() => undefined);
  }
  private cancelSpeech(): void {
    this.speechPending = 0;
    try { (globalThis as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis?.cancel(); } catch { /* */ }
  }
}
