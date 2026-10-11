// Dauerklänge der Autos: Motorsummen (2 Oszillatoren + gefiltertes Rauschen) und Boost-Zischen.
// Pro Auto-Id gibt es eine Stimme, die jedes Bild mit dem aktuellen Zustand aktualisiert wird.
// Ids, die nicht mehr vorkommen, werden ausgeblendet und danach vollständig getrennt.

export interface CarSound {
  /** 0..1 Auslastung, 0 = Leerlauf */
  speed01: number;
  boosting: boolean;
  onGround: boolean;
  /** 0..1 Lautstärke (Entfernung zur Kamera) */
  gain: number;
  /** −1..1 Stereo-Position */
  pan: number;
}

/** Höchstzahl gleichzeitig hörbarer Motoren */
export const MAX_CARS = 6;
const FADE_OUT = 0.25;
const SMOOTH = 0.06;

const finite = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const clampRange = (v: unknown, lo: number, hi: number, fallback: number): number =>
  Math.min(hi, Math.max(lo, finite(v, fallback)));

/** Grundfrequenz des Motors (Hz): Leerlauf ~52 Hz, Volllast ~190 Hz; in der Luft dreht er etwas höher. */
export function engineFreq(speed01: number, onGround: boolean, boosting = false): number {
  const s = clampRange(speed01, 0, 1, 0);
  const base = 52 + 120 * Math.pow(s, 0.85);
  return base * (onGround ? 1 : 1.12) * (boosting ? 1.08 : 1);
}

/** Lautstärke eines Autos aus Entfernungsfaktor und Auslastung (ferne Autos deutlich leiser). */
export function engineLevel(gain: number, speed01: number): number {
  const g = clampRange(gain, 0, 1, 0);
  const s = clampRange(speed01, 0, 1, 0);
  return 0.5 * g * g * (0.55 + 0.45 * s);
}

/** Sanfte Verzerrungskennlinie (tanh) für das Boost-Zischen/Brummen. */
export function distortionCurve(drive: number, size = 256): Float32Array {
  const curve = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const x = (i / (size - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return curve;
}

interface CarVoice {
  id: number;
  out: GainNode;
  nodes: AudioNode[];
  sources: AudioScheduledSourceNode[];
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  tone: BiquadFilterNode;
  noiseLp: BiquadFilterNode;
  boostGain: GainNode;
  wet: GainNode;
  panner: StereoPannerNode | null;
  fadeUntil: number | null;
}

export interface CarEngines {
  /** Aktualisiert alle Autos (jedes Bild); `now` = ctx.currentTime */
  update(cars: ReadonlyMap<number, CarSound>, now: number): void;
  /** Entfernt ausgeblendete Stimmen */
  prune(now: number): void;
  /** Alle Stimmen (auch ausblendende) */
  count(): number;
  /** Nur aktive (nicht ausblendende) Stimmen */
  active(): number;
  dispose(): void;
}

/** Erzeugt die Motorverwaltung. `noise` ist ein geteilter Rauschpuffer. */
export function createCarEngines(c: AudioContext, dest: AudioNode, noise: AudioBuffer): CarEngines {
  const voices = new Map<number, CarVoice>();
  const curve = distortionCurve(3);
  let offset = 0;

  const quiet = (fn: () => void): void => {
    try {
      fn();
    } catch {
      /* Audio darf nie werfen */
    }
  };
  const target = (p: AudioParam, v: number, now: number, tc = SMOOTH): void =>
    quiet(() => p.setTargetAtTime(finite(v, 0), now, tc));

  function noiseSource(): AudioBufferSourceNode {
    const bs = c.createBufferSource();
    bs.buffer = noise;
    bs.loop = true;
    offset = (offset + 0.211) % 0.9;
    bs.start(0, offset);
    return bs;
  }

  function create(id: number, now: number): CarVoice | null {
    let v: CarVoice | null = null;
    quiet(() => {
      const nodes: AudioNode[] = [];
      const sources: AudioScheduledSourceNode[] = [];
      const f0 = engineFreq(0, true);

      const osc1 = c.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = f0;
      const osc2 = c.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = f0 * 0.5;
      osc2.detune.value = 9;
      osc1.start();
      osc2.start();
      // Brummen: langsames Schwanken der Tonhöhe
      const lfo = c.createOscillator();
      lfo.frequency.value = 6.5;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 1.4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start();

      const g1 = c.createGain();
      g1.gain.value = 0.22;
      const g2 = c.createGain();
      g2.gain.value = 0.16;
      osc1.connect(g1);
      osc2.connect(g2);

      const nSrc = noiseSource();
      const noiseLp = c.createBiquadFilter();
      noiseLp.type = 'lowpass';
      noiseLp.frequency.value = 300;
      const gn = c.createGain();
      gn.gain.value = 0.09;
      nSrc.connect(noiseLp);
      noiseLp.connect(gn);

      const body = c.createGain();
      g1.connect(body);
      g2.connect(body);
      gn.connect(body);
      const toneF = c.createBiquadFilter();
      toneF.type = 'lowpass';
      toneF.frequency.value = 600;
      body.connect(toneF);

      const out = c.createGain();
      out.gain.value = 0;
      toneF.connect(out);
      // leichte Verzerrung, nur bei Boost hörbar
      const wet = c.createGain();
      wet.gain.value = 0;
      if (typeof c.createWaveShaper === 'function') {
        const shaper = c.createWaveShaper();
        shaper.curve = curve;
        toneF.connect(shaper);
        shaper.connect(wet);
        nodes.push(shaper);
      }
      wet.connect(out);
      // Boost-Zischen: Rauschband
      const bSrc = noiseSource();
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3200;
      bp.Q.value = 0.8;
      const boostGain = c.createGain();
      boostGain.gain.value = 0;
      bSrc.connect(bp);
      bp.connect(boostGain);
      boostGain.connect(out);

      let last: AudioNode = out;
      let panner: StereoPannerNode | null = null;
      if (typeof c.createStereoPanner === 'function') {
        const p = c.createStereoPanner();
        out.connect(p);
        last = p;
        panner = p;
        nodes.push(p);
      }
      last.connect(dest);

      sources.push(osc1, osc2, lfo, nSrc, bSrc);
      nodes.push(
        osc1,
        osc2,
        lfo,
        lfoGain,
        g1,
        g2,
        nSrc,
        noiseLp,
        gn,
        body,
        toneF,
        out,
        wet,
        bSrc,
        bp,
        boostGain,
      );
      v = {
        id,
        out,
        nodes,
        sources,
        osc1,
        osc2,
        tone: toneF,
        noiseLp,
        boostGain,
        wet,
        panner,
        fadeUntil: null,
      };
      target(out.gain, 0, now);
    });
    return v;
  }

  function destroy(v: CarVoice): void {
    for (const s of v.sources) quiet(() => s.stop());
    for (const n of v.nodes) quiet(() => n.disconnect());
  }

  function fade(v: CarVoice, now: number): void {
    if (v.fadeUntil !== null) return;
    target(v.out.gain, 0, now, FADE_OUT / 4);
    target(v.boostGain.gain, 0, now, FADE_OUT / 4);
    v.fadeUntil = now + FADE_OUT;
  }

  return {
    update(cars, now): void {
      // die lautesten (nächsten) Autos auswählen
      const picked: [number, CarSound][] = [];
      for (const [id, s] of cars) if (s && Number.isFinite(id)) picked.push([id, s]);
      picked.sort((a, b) => finite(b[1].gain, 0) - finite(a[1].gain, 0) || a[0] - b[0]);
      const keep = new Set<number>();
      for (const [id, s] of picked) {
        if (keep.size >= MAX_CARS) break;
        const level = engineLevel(s.gain, s.speed01);
        if (level <= 0.0005 && !voices.has(id)) continue; // unhörbar: keine Stimme anlegen
        keep.add(id);
        let v = voices.get(id);
        if (!v) {
          const created = create(id, now);
          if (!created) continue;
          v = created;
          voices.set(id, v);
        }
        v.fadeUntil = null;
        const speed = clampRange(s.speed01, 0, 1, 0);
        const boost = s.boosting === true;
        const f = engineFreq(speed, s.onGround !== false, boost);
        target(v.osc1.frequency, f, now);
        target(v.osc2.frequency, f * 0.5, now);
        target(v.tone.frequency, 450 + speed * 1500 + (boost ? 900 : 0) + level * 600, now);
        target(v.noiseLp.frequency, f * 3, now);
        const air = s.onGround !== false ? 1 : 0.65;
        target(v.out.gain, level * air, now);
        target(v.boostGain.gain, boost ? 0.35 : 0, now, boost ? 0.04 : 0.12);
        target(v.wet.gain, boost ? 0.45 : 0, now, 0.08);
        const pan = clampRange(s.pan, -1, 1, 0);
        if (v.panner) target(v.panner.pan, pan, now, 0.03);
      }
      for (const [id, v] of voices) if (!keep.has(id)) fade(v, now);
      this.prune(now);
    },

    prune(now): void {
      for (const [id, v] of voices) {
        if (v.fadeUntil !== null && v.fadeUntil <= now) {
          destroy(v);
          voices.delete(id);
        }
      }
    },

    count: () => voices.size,
    active(): number {
      let n = 0;
      for (const v of voices.values()) if (v.fadeUntil === null) n++;
      return n;
    },

    dispose(): void {
      for (const v of voices.values()) destroy(v);
      voices.clear();
    },
  };
}
