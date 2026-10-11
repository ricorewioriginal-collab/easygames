import { describe, expect, it } from 'vitest';
import { MAX_MUSIC_VOICES, MAX_SFX_VOICES, audio, clamp01, createAudioEngine } from './audio';
import {
  MIDI_MAX,
  MIDI_MIN,
  MUSIC_THEMES,
  THEMES,
  foldMidi,
  generateBar,
  scaleMidi,
  type MusicTheme,
} from './music';
import { SFX_NAMES, SFX_RECIPES, drumLayers, instrumentLayers, recipeDuration, resolveSfx } from './sfx';

// ---- Attrappe eines AudioContext ----
class FakeParam {
  value = 0;
  setValueAtTime(v: number): this {
    this.value = v;
    return this;
  }
  linearRampToValueAtTime(): this {
    return this;
  }
  exponentialRampToValueAtTime(): this {
    return this;
  }
  setTargetAtTime(v: number): this {
    this.value = v;
    return this;
  }
  cancelScheduledValues(): this {
    return this;
  }
}

class FakeNode {
  connected = new Set<FakeNode>();
  disconnected = false;
  started = false;
  onended: (() => void) | null = null;
  gain = new FakeParam();
  frequency = new FakeParam();
  detune = new FakeParam();
  Q = new FakeParam();
  threshold = new FakeParam();
  knee = new FakeParam();
  ratio = new FakeParam();
  attack = new FakeParam();
  release = new FakeParam();
  type = '';
  buffer: unknown = null;
  loop = false;
  connect(n: FakeNode): FakeNode {
    this.connected.add(n);
    return n;
  }
  disconnect(): void {
    this.disconnected = true;
    this.connected.clear();
  }
  start(): void {
    this.started = true;
  }
  stop(): void {}
}

class FakeContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'suspended';
  destination = new FakeNode();
  nodes: FakeNode[] = [];
  resumed = 0;
  suspended = 0;
  closed = false;
  private mk(): FakeNode {
    const n = new FakeNode();
    this.nodes.push(n);
    return n;
  }
  createGain = (): FakeNode => this.mk();
  createOscillator = (): FakeNode => this.mk();
  createBufferSource = (): FakeNode => this.mk();
  createBiquadFilter = (): FakeNode => this.mk();
  createDynamicsCompressor = (): FakeNode => this.mk();
  createBuffer(_c: number, len: number): { getChannelData: () => Float32Array } {
    const d = new Float32Array(len);
    return { getChannelData: () => d };
  }
  resume(): Promise<void> {
    this.resumed++;
    this.state = 'running';
    return Promise.resolve();
  }
  suspend(): Promise<void> {
    this.suspended++;
    this.state = 'suspended';
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.closed = true;
    this.state = 'closed';
    return Promise.resolve();
  }
}

function makeEngine(): { eng: ReturnType<typeof createAudioEngine>; ctx: FakeContext } {
  const ctx = new FakeContext();
  const eng = createAudioEngine({ createContext: () => ctx as unknown as AudioContext });
  return { eng, ctx };
}

describe('music.ts – reine Notenerzeugung', () => {
  it('kennt alle Themen mit konsistenten Patterns', () => {
    expect(MUSIC_THEMES.length).toBe(9);
    for (const t of MUSIC_THEMES) {
      const s = THEMES[t];
      for (const p of [s.bass, s.arp, s.chordHits, s.kick, s.snare, s.hat, s.perc, s.lead?.pattern ?? '']) {
        if (p) expect(p.length, `${t}: ${p}`).toBe(s.steps);
      }
      expect(s.bpm).toBeGreaterThan(40);
      expect(s.bpm).toBeLessThan(220);
      expect(s.prog.length).toBeGreaterThan(0);
      expect(s.loop ? s.bars % s.prog.length : 0).toBe(0);
    }
  });

  it('liefert für 64 Takte nur endliche Werte im erlaubten Bereich', () => {
    for (const t of MUSIC_THEMES) {
      const spec = THEMES[t];
      for (let bar = 0; bar < 64; bar++) {
        const events = generateBar(t, bar);
        if (!spec.loop && bar >= spec.bars) {
          expect(events).toEqual([]);
          continue;
        }
        expect(events.length, `${t} Takt ${bar}`).toBeGreaterThan(0);
        let prev = -1;
        const bad: string[] = [];
        for (const e of events) {
          const ok =
            Number.isFinite(e.time) &&
            Number.isFinite(e.dur) &&
            Number.isFinite(e.midi) &&
            Number.isFinite(e.vel) &&
            e.time >= 0 &&
            e.time < spec.beats &&
            e.dur > 0 &&
            e.dur <= spec.beats * 2 &&
            e.midi >= MIDI_MIN &&
            e.midi <= MIDI_MAX &&
            Number.isInteger(e.midi) &&
            e.vel > 0 &&
            e.vel <= 1 &&
            e.time >= prev; // sortiert
          if (!ok) bad.push(JSON.stringify(e));
          prev = e.time;
        }
        expect(bad, `${t} Takt ${bar}`).toEqual([]);
      }
    }
  });

  it('ist deterministisch und wiederholt sich im Loop', () => {
    for (const t of MUSIC_THEMES) {
      expect(generateBar(t, 5)).toEqual(generateBar(t, 5));
      const spec = THEMES[t];
      if (spec.loop) expect(generateBar(t, 3)).toEqual(generateBar(t, 3 + spec.bars));
    }
  });

  it('Themen klingen unterschiedlich', () => {
    const sig = (t: MusicTheme): string => JSON.stringify(generateBar(t, 1));
    const all = new Set(MUSIC_THEMES.map(sig));
    expect(all.size).toBe(MUSIC_THEMES.length);
  });

  it('Takt- und Notenhilfen sind robust', () => {
    expect(generateBar('menu', -1)).toEqual([]);
    expect(generateBar('menu', Number.NaN)).toEqual([]);
    expect(foldMidi(Number.NaN)).toBe(60);
    expect(foldMidi(-100)).toBeGreaterThanOrEqual(MIDI_MIN);
    expect(foldMidi(500)).toBeLessThanOrEqual(MIDI_MAX);
    expect(scaleMidi(60, [0, 2, 4, 5, 7, 9, 11], 7)).toBe(72);
    expect(scaleMidi(60, [0, 2, 4, 5, 7, 9, 11], -1)).toBe(59);
  });

  it('results ist kurz und endet', () => {
    expect(THEMES.results.loop).toBe(false);
    expect(THEMES.results.bars).toBeLessThanOrEqual(8);
  });
});

describe('sfx.ts – Klangrezepte', () => {
  it('jeder Name hat ein sinnvolles Rezept', () => {
    expect(Object.keys(SFX_RECIPES).sort()).toEqual([...SFX_NAMES].sort());
    for (const n of SFX_NAMES) {
      const r = SFX_RECIPES[n];
      expect(r.length).toBeGreaterThan(0);
      for (const l of r) {
        expect(Number.isFinite(l.f0)).toBe(true);
        if (l.wave !== 'noise') expect(l.f0).toBeGreaterThan(0);
        if (l.f1 !== undefined) expect(l.f1).toBeGreaterThan(0);
        expect(l.dur).toBeGreaterThan(0);
        expect(l.gain).toBeGreaterThan(0);
        expect(l.gain).toBeLessThanOrEqual(1);
        expect(l.at ?? 0).toBeGreaterThanOrEqual(0);
      }
      expect(recipeDuration(r)).toBeLessThan(2.5);
    }
  });

  it('Rezepte sind alle verschieden', () => {
    const set = new Set(SFX_NAMES.map((n) => JSON.stringify(SFX_RECIPES[n])));
    expect(set.size).toBe(SFX_NAMES.length);
  });

  it('löst Aliase auf und ignoriert Unbekanntes', () => {
    expect(resolveSfx('coin')).toBe('coin');
    expect(resolveSfx('Collect')).toBe('coin');
    expect(resolveSfx('xyz-unbekannt')).toBeNull();
    expect(resolveSfx('constructor')).toBeNull();
    expect(resolveSfx('__proto__')).toBeNull();
  });

  it('Instrumente und Schlagwerk liefern Schichten', () => {
    for (const tb of [
      'sine',
      'triangle',
      'square',
      'saw',
      'pulse',
      'bell',
      'marimba',
      'organ',
      'brass',
      'pluck',
    ] as const) {
      const l = instrumentLayers(tb, 440, 0.4, 0.7);
      expect(l.length).toBeGreaterThan(0);
      for (const x of l) expect(x.gain).toBeGreaterThan(0);
    }
    for (const v of ['kick', 'snare', 'hat', 'perc'] as const)
      expect(drumLayers(v, 60, 1).length).toBeGreaterThan(0);
  });
});

describe('Einstellungen', () => {
  it('klemmt Werte auf 0..1 und ist NaN-sicher', () => {
    expect(clamp01(2, 0.5)).toBe(1);
    expect(clamp01(-3, 0.5)).toBe(0);
    expect(clamp01(Number.NaN, 0.5)).toBe(0.5);
    expect(clamp01('x', 0.5)).toBe(0.5);
    expect(clamp01(Infinity, 0.5)).toBe(1);
    const { eng } = makeEngine();
    eng.setSettings({ master: 5, music: -1, sfx: Number.NaN, muted: true });
    const s = eng.getSettings();
    expect(s.master).toBe(1);
    expect(s.music).toBe(0);
    expect(s.sfx).toBe(0.8); // NaN → alter Wert bleibt
    expect(s.muted).toBe(true);
    eng.setSettings({ muted: false });
    expect(eng.getSettings().muted).toBe(false);
    // getSettings liefert eine Kopie
    const c = eng.getSettings();
    c.master = 0;
    expect(eng.getSettings().master).toBe(1);
  });
});

describe('Singleton ohne AudioContext', () => {
  it('wirft nie', () => {
    expect(() => {
      audio.unlock();
      audio.unlock();
      audio.setSettings({ master: 0.3, muted: false });
      audio.music('menu');
      audio.music(null);
      audio.sfx('click');
      audio.sfx('gibt-es-nicht', { pitch: Number.NaN, volume: -2 });
      audio.suspend();
      audio.resume();
      audio.dispose();
    }).not.toThrow();
    expect(audio.getSettings().master).toBe(0.3);
  });

  it('Engine ohne Kontext-Fabrik und mit werfender Fabrik bleibt still', () => {
    const none = createAudioEngine({ createContext: () => null });
    const boom = createAudioEngine({
      createContext: () => {
        throw new Error('kein Audio');
      },
    });
    for (const e of [none, boom]) {
      expect(() => {
        e.music('finale');
        e.unlock();
        e.sfx('coin');
        e.dispose();
      }).not.toThrow();
      expect(e.debugStats().hasContext).toBe(false);
    }
  });
});

describe('Scheduler mit Attrappe', () => {
  it('startet erst nach unlock und plant Musik taktgenau voraus', () => {
    const { eng, ctx } = makeEngine();
    eng.music('minigame'); // vor unlock: nur merken
    expect(eng.debugStats().hasContext).toBe(false);
    eng.unlock();
    eng.unlock(); // idempotent
    expect(ctx.resumed).toBeGreaterThan(0);
    const st = eng.debugStats();
    expect(st.hasContext).toBe(true);
    expect(st.theme).toBe('minigame');
    expect(st.timerActive).toBe(true);
    eng.dispose();
  });

  it('begrenzt Stimmen über viele Takte und räumt auf', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    for (const theme of MUSIC_THEMES) {
      eng.music(theme);
      let maxMusic = 0;
      for (let i = 0; i < 400; i++) {
        ctx.currentTime += 0.1;
        eng.tick();
        maxMusic = Math.max(maxMusic, eng.debugStats().musicVoices);
      }
      expect(maxMusic).toBeLessThanOrEqual(MAX_MUSIC_VOICES);
      expect(maxMusic).toBeGreaterThan(0);
    }
    // nach dem Wechsel auf Stille laufen alle Stimmen aus und werden getrennt
    eng.music(null);
    for (let i = 0; i < 100; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    const st = eng.debugStats();
    expect(st.voices).toBe(0);
    expect(st.retiring).toBe(0);
    expect(st.timerActive).toBe(false);
    eng.dispose();
  });

  it('Speicher wächst nicht: Voice-Liste bleibt über lange Laufzeit klein', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('paradox-city');
    let max = 0;
    for (let i = 0; i < 3000; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
      max = Math.max(max, eng.debugStats().voices);
    }
    expect(max).toBeLessThanOrEqual(MAX_MUSIC_VOICES);
    eng.dispose();
  });

  it('results endet von selbst (kein Loop)', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('results');
    for (let i = 0; i < 400; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    expect(eng.debugStats().voices).toBe(0);
    expect(eng.debugStats().timerActive).toBe(false);
    eng.dispose();
  });

  it('sfx: Rate-Limit, Stimmenlimit, Stummschaltung, unbekannte Namen', () => {
    const { eng, ctx } = makeEngine();
    eng.sfx('click'); // vor unlock: ignoriert
    expect(ctx.nodes.length).toBe(0);
    eng.unlock();
    const base = ctx.nodes.length;
    eng.sfx('click');
    const afterOne = ctx.nodes.length;
    expect(afterOne).toBeGreaterThan(base);
    eng.sfx('click'); // innerhalb 30 ms → verworfen
    expect(ctx.nodes.length).toBe(afterOne);
    ctx.currentTime += 0.05;
    eng.sfx('click');
    expect(ctx.nodes.length).toBeGreaterThan(afterOne);

    eng.sfx('nicht-vorhanden');
    const n = ctx.nodes.length;
    eng.sfx('nicht-vorhanden');
    expect(ctx.nodes.length).toBe(n);

    // Flut an Effekten bleibt unter dem Limit
    let maxSfx = 0;
    for (let i = 0; i < 200; i++) {
      ctx.currentTime += 0.031;
      eng.sfx(SFX_NAMES[i % SFX_NAMES.length] as string, { pitch: 1 + (i % 5) * 0.1 });
      maxSfx = Math.max(maxSfx, eng.debugStats().sfxVoices);
    }
    expect(maxSfx).toBeLessThanOrEqual(MAX_SFX_VOICES);

    // stumm → keine neuen Knoten
    eng.setSettings({ muted: true });
    ctx.currentTime += 1;
    const before = ctx.nodes.length;
    eng.sfx('coin');
    expect(ctx.nodes.length).toBe(before);
    eng.dispose();
  });

  it('suspend/resume und dispose', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('menu');
    eng.suspend();
    expect(ctx.state).toBe('suspended');
    const before = ctx.nodes.length;
    eng.sfx('coin');
    expect(ctx.nodes.length).toBe(before); // pausiert → kein Effekt
    eng.resume();
    expect(ctx.state).toBe('running');
    eng.dispose();
    expect(ctx.closed).toBe(true);
    const st = eng.debugStats();
    expect(st.hasContext).toBe(false);
    expect(st.voices).toBe(0);
    expect(st.timerActive).toBe(false);
    expect(() => {
      eng.sfx('coin');
      eng.music('menu');
      eng.tick();
    }).not.toThrow();
  });

  it('Themenwechsel blendet die alte Musik aus und trennt sie später', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('menu');
    ctx.currentTime += 0.2;
    eng.tick();
    eng.music('finale');
    expect(eng.debugStats().retiring).toBe(1);
    expect(eng.debugStats().theme).toBe('finale');
    eng.music('finale'); // gleiches Thema: keine Neustart
    expect(eng.debugStats().retiring).toBe(1);
    for (let i = 0; i < 30; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    expect(eng.debugStats().retiring).toBe(0);
    eng.dispose();
  });
});
