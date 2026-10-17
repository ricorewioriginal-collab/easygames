import { describe, it, expect } from 'vitest';
import { AudioEngine, type AudioState, type Sfx } from '../src/audio/audio';

const state: AudioState = {
  traction: 'steam', speed: 12, throttle: 0.6, power: 0.5, dyn: 0, brake: 0.3, engineRpm: 0.4, compressor: true,
  slip: true, slide: false, sand: true, wheelAngle: 3.2, cutoff: 0.4, rail: 'wet', curve: 0.5, jointRate: 2,
  tunnel: true, inCab: true, rain: 0.5, wind: 0.5, thunder: true, crossingBell: 1, ambience: 1, birds: 1,
  pantoArc: true, doorsMoving: true,
};
const ALL: Sfx[] = ['horn_start', 'horn_stop', 'whistle_start', 'whistle_stop', 'door_open', 'door_close', 'door_beep', 'switch', 'couple', 'uncouple', 'brake_release', 'emergency', 'pzb', 'pzb_brake', 'sifa', 'ui_click', 'ui_ok', 'ui_err', 'ui_notify', 'panto_up', 'main_switch', 'engine_start', 'engine_stop', 'buffer_hit', 'crash', 'chime', 'load', 'injector'];

describe('AudioEngine ohne WebAudio', () => {
  it('ist ein sicherer No-Op', async () => {
    const a = new AudioEngine();
    expect(await a.unlock()).toBe(false);
    expect(a.ready).toBe(false);
    a.setVolumes({ master: 1, train: 1, env: 1, ui: 1, voice: 1 });
    for (const t of ['electric', 'diesel', 'steam', 'none'] as const) a.update(1 / 60, { ...state, traction: t });
    for (const s of ALL) a.play(s);
    a.announce('Nächster Halt: Hauptbahnhof');
    a.suspend(); a.resume(); a.dispose();
    expect(await a.unlock()).toBe(false);
  });
});

// Minimaler WebAudio-Stub, um alle Codepfade des Graphen auszuführen (zählt aktive Quellen).
class FParam { value = 0; setValueAtTime() { return this; } linearRampToValueAtTime() { return this; } exponentialRampToValueAtTime(v: number) { if (!(v > 0)) throw new Error('exp<=0'); return this; } setTargetAtTime(v: number) { if (!Number.isFinite(v)) throw new Error('NaN'); return this; } cancelScheduledValues() { return this; } }
class FNode {
  static live = 0;
  gain = new FParam(); frequency = new FParam(); Q = new FParam(); delayTime = new FParam(); detune = new FParam();
  threshold = new FParam(); knee = new FParam(); ratio = new FParam(); attack = new FParam(); release = new FParam();
  type = ''; buffer: unknown = null; loop = false; onended: null | (() => void) = null; private started = false;
  connect() { return this; } disconnect() {}
  start() { this.started = true; FNode.live++; }
  stop() { if (this.started) { this.started = false; FNode.live--; this.onended?.(); } }
}
class FCtx {
  state = 'running'; currentTime = 0; sampleRate = 8000; destination = new FNode();
  createBuffer(_c: number, n: number) { const d = new Float32Array(n); return { getChannelData: () => d }; }
  createGain() { return new FNode(); } createBiquadFilter() { return new FNode(); } createOscillator() { return new FNode(); }
  createBufferSource() { return new FNode(); } createDelay() { return new FNode(); } createDynamicsCompressor() { return new FNode(); }
  async resume() { this.state = 'running'; } async suspend() { this.state = 'suspended'; } async close() { this.state = 'closed'; }
}

describe('AudioEngine mit WebAudio-Stub', () => {
  it('baut den Graphen, aktualisiert alle Traktionen und spielt alle Sfx', async () => {
    const g = globalThis as any;
    g.AudioContext = FCtx; g.AudioNode = FNode; g.AudioParam = FParam;
    try {
      const a = new AudioEngine();
      expect(await a.unlock()).toBe(true);
      expect(a.ready).toBe(true);
      const persistent = FNode.live;
      expect(persistent).toBeLessThanOrEqual(24);
      let ang = 0;
      for (const t of ['electric', 'diesel', 'steam', 'none'] as const) {
        for (let i = 0; i < 300; i++) {
          ang += 0.4;
          a.update(1 / 60, { ...state, traction: t, wheelAngle: ang, speed: (i % 40), thunder: i % 50 === 0, tunnel: i % 2 === 0 });
        }
      }
      for (const s of ALL) a.play(s);
      a.play('horn_stop'); a.play('whistle_stop');
      a.suspend(); a.resume(); a.dispose();
      console.log('persistente Quellen:', persistent);
    } finally { delete g.AudioContext; delete g.AudioNode; delete g.AudioParam; }
  });
});
