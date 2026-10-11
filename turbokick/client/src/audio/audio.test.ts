import { describe, expect, it } from 'vitest';
import { MAX_MUSIC_VOICES, MAX_SFX_VOICES, audio, clamp01, createAudioEngine, type CarSound } from './audio';
import { MAX_CARS, distortionCurve, engineFreq, engineLevel } from './engine';
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
  pan = new FakeParam();
  curve: unknown = null;
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
  oscs: FakeNode[] = [];
  createOscillator = (): FakeNode => {
    const n = this.mk();
    this.oscs.push(n);
    return n;
  };
  createStereoPanner = (): FakeNode => this.mk();
  createWaveShaper = (): FakeNode => this.mk();
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
  it('kennt alle fünf Themen mit konsistenten Patterns', () => {
    expect([...MUSIC_THEMES]).toEqual(['menu', 'match', 'overtime', 'victory', 'defeat']);
    for (const t of MUSIC_THEMES) {
      const s = THEMES[t];
      for (const p of [s.bass, s.arp, s.chordHits, s.kick, s.snare, s.hat, s.perc, s.lead?.pattern ?? '']) {
        if (p) expect(p.length, `${t}: ${p}`).toBe(s.steps);
      }
      expect(s.bpm).toBeGreaterThan(40);
      expect(s.bpm).toBeLessThan(220);
      expect(s.loop ? s.bars % s.prog.length : 0).toBe(0);
    }
    expect(THEMES.menu.bpm).toBe(100);
    expect(THEMES.match.bpm).toBe(124);
    expect(THEMES.overtime.bpm).toBeGreaterThan(THEMES.match.bpm);
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
            e.time >= prev;
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

  it('Themen klingen unterschiedlich; Siegel/Niederlage loopen nicht', () => {
    const sig = (t: MusicTheme): string => JSON.stringify(generateBar(t, 1));
    expect(new Set(MUSIC_THEMES.map(sig)).size).toBe(MUSIC_THEMES.length);
    for (const t of ['victory', 'defeat'] as const) {
      expect(THEMES[t].loop).toBe(false);
      expect(THEMES[t].bars).toBeLessThanOrEqual(8);
    }
  });

  it('Match hat Schlagwerk, Bass und Arpeggio', () => {
    const voices = new Set(generateBar('match', 0).map((e) => e.voice));
    for (const v of ['bass', 'arp', 'kick', 'snare', 'hat'] as const) expect(voices.has(v)).toBe(true);
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
});

describe('sfx.ts – Klangrezepte', () => {
  it('alle geforderten Namen haben ein sinnvolles Rezept', () => {
    expect(SFX_NAMES.length).toBe(20);
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
      expect(recipeDuration(r)).toBeLessThan(2.6);
    }
  });

  it('Rezepte sind alle verschieden', () => {
    expect(new Set(SFX_NAMES.map((n) => JSON.stringify(SFX_RECIPES[n]))).size).toBe(SFX_NAMES.length);
  });

  it('löst Aliase auf und ignoriert Unbekanntes', () => {
    expect(resolveSfx('goal')).toBe('goal');
    expect(resolveSfx('Tor')).toBe('goal');
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
      'super',
    ] as const) {
      const l = instrumentLayers(tb, 440, 0.4, 0.7);
      expect(l.length).toBeGreaterThan(0);
      for (const x of l) expect(x.gain).toBeGreaterThan(0);
    }
    for (const v of ['kick', 'snare', 'hat', 'perc'] as const)
      expect(drumLayers(v, 60, 1).length).toBeGreaterThan(0);
  });
});

describe('engine.ts – reine Motorfunktionen', () => {
  it('Frequenz steigt mit der Auslastung, Pegel sinkt mit der Entfernung', () => {
    expect(engineFreq(1, true)).toBeGreaterThan(engineFreq(0.5, true));
    expect(engineFreq(0.5, true)).toBeGreaterThan(engineFreq(0, true));
    expect(engineFreq(Number.NaN, true)).toBe(engineFreq(0, true));
    expect(Number.isFinite(engineFreq(Infinity, false, true))).toBe(true);
    expect(engineLevel(1, 0.5)).toBeGreaterThan(engineLevel(0.3, 0.5));
    expect(engineLevel(Number.NaN, 1)).toBe(0);
    expect(engineLevel(1, 1)).toBeLessThanOrEqual(0.5);
    const c = distortionCurve(3, 64);
    expect(c.length).toBe(64);
    for (const v of c) expect(Math.abs(v)).toBeLessThanOrEqual(1.0001);
  });
});

describe('Einstellungen', () => {
  it('klemmt Werte auf 0..1 und ist NaN-sicher', () => {
    expect(clamp01(2, 0.5)).toBe(1);
    expect(clamp01(-3, 0.5)).toBe(0);
    expect(clamp01(Number.NaN, 0.5)).toBe(0.5);
    expect(clamp01('x', 0.5)).toBe(0.5);
    const { eng } = makeEngine();
    eng.setSettings({ master: 5, music: -1, sfx: Number.NaN, muted: true });
    const s = eng.getSettings();
    expect(s.master).toBe(1);
    expect(s.music).toBe(0);
    expect(s.sfx).toBe(0.8);
    expect(s.muted).toBe(true);
    eng.setSettings({ muted: false });
    expect(eng.getSettings().muted).toBe(false);
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
      audio.sfx('goal');
      audio.sfx('gibt-es-nicht', { pitch: Number.NaN, volume: -2, pan: Number.NaN });
      audio.updateCars(new Map([[1, { speed01: 1, boosting: true, onGround: true, gain: 1, pan: 0 }]]));
      audio.crowd(0.5);
      audio.crowdCheer();
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
        e.music('match');
        e.unlock();
        e.sfx('hit');
        e.updateCars(new Map());
        e.crowdCheer(2);
        e.dispose();
      }).not.toThrow();
      expect(e.debugStats().hasContext).toBe(false);
    }
  });
});

function car(over: Partial<CarSound> = {}): CarSound {
  return { speed01: 0, boosting: false, onGround: true, gain: 1, pan: 0, ...over };
}

describe('Scheduler mit Attrappe', () => {
  it('startet erst nach unlock und plant Musik voraus', () => {
    const { eng, ctx } = makeEngine();
    eng.music('match');
    expect(eng.debugStats().hasContext).toBe(false);
    eng.unlock();
    eng.unlock();
    expect(ctx.resumed).toBeGreaterThan(0);
    const st = eng.debugStats();
    expect(st.theme).toBe('match');
    expect(st.timerActive).toBe(true);
    expect(st.musicVoices).toBeGreaterThan(0);
    eng.dispose();
  });

  it('begrenzt Stimmen über viele Takte; music(null) räumt alles auf', () => {
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
    eng.music(null);
    for (let i = 0; i < 100; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    const st = eng.debugStats();
    expect(st.voices).toBe(0);
    expect(st.retiring).toBe(0);
    expect(st.theme).toBeNull();
    expect(st.timerActive).toBe(false);
    eng.dispose();
  });

  it('Jingles (victory, defeat) enden von selbst', () => {
    for (const theme of ['victory', 'defeat'] as const) {
      const { eng, ctx } = makeEngine();
      eng.unlock();
      eng.music(theme);
      for (let i = 0; i < 400; i++) {
        ctx.currentTime += 0.1;
        eng.tick();
      }
      expect(eng.debugStats().voices).toBe(0);
      expect(eng.debugStats().timerActive).toBe(false);
      eng.dispose();
    }
  });

  it('Themenwechsel blendet die alte Musik aus und trennt sie später', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('menu');
    ctx.currentTime += 0.2;
    eng.tick();
    eng.music('overtime');
    expect(eng.debugStats().retiring).toBe(1);
    expect(eng.debugStats().theme).toBe('overtime');
    eng.music('overtime');
    expect(eng.debugStats().retiring).toBe(1);
    for (let i = 0; i < 30; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    expect(eng.debugStats().retiring).toBe(0);
    eng.dispose();
  });

  it('sfx: Rate-Limit, Stimmenlimit, Stummschaltung, unbekannte Namen, Pan', () => {
    const { eng, ctx } = makeEngine();
    eng.sfx('click');
    const none = ctx.nodes.length;
    expect(none).toBe(0);
    eng.unlock();
    const base = ctx.nodes.length;
    eng.sfx('click');
    const afterOne = ctx.nodes.length;
    expect(afterOne).toBeGreaterThan(base);
    eng.sfx('click'); // innerhalb 30 ms
    expect(ctx.nodes.length).toBe(afterOne);
    ctx.currentTime += 0.05;
    eng.sfx('click');
    expect(ctx.nodes.length).toBeGreaterThan(afterOne);

    eng.sfx('nicht-vorhanden');
    const n = ctx.nodes.length;
    eng.sfx('nicht-vorhanden');
    expect(ctx.nodes.length).toBe(n);

    // Pan legt einen Stereo-Panner an
    ctx.currentTime += 0.05;
    const before = ctx.nodes.length;
    eng.sfx('hover', { pan: -0.5 });
    expect(ctx.nodes.length).toBeGreaterThan(before + 2);

    let maxSfx = 0;
    for (let i = 0; i < 200; i++) {
      ctx.currentTime += 0.031;
      eng.sfx(SFX_NAMES[i % SFX_NAMES.length] as string, { pitch: 1 + (i % 5) * 0.1 });
      maxSfx = Math.max(maxSfx, eng.debugStats().sfxVoices);
    }
    expect(maxSfx).toBeLessThanOrEqual(MAX_SFX_VOICES);

    eng.setSettings({ muted: true });
    ctx.currentTime += 1;
    const b2 = ctx.nodes.length;
    eng.sfx('goal');
    expect(ctx.nodes.length).toBe(b2);
    eng.dispose();
  });

  it('Publikum: Pegel wird geklemmt, Jubel hat ein Rate-Limit', () => {
    const { eng, ctx } = makeEngine();
    eng.crowd(0.4); // vor unlock: nur merken
    eng.unlock();
    expect(eng.debugStats().crowdLevel).toBe(0.4);
    eng.crowd(7);
    expect(eng.debugStats().crowdLevel).toBe(1);
    eng.crowd(Number.NaN);
    expect(eng.debugStats().crowdLevel).toBe(1);
    const base = ctx.nodes.length;
    eng.crowdCheer(0.9);
    const after = ctx.nodes.length;
    expect(after).toBeGreaterThan(base);
    eng.crowdCheer(0.9);
    expect(ctx.nodes.length).toBe(after);
    ctx.currentTime += 0.5;
    eng.crowdCheer();
    expect(ctx.nodes.length).toBeGreaterThan(after);
    eng.dispose();
  });

  it('suspend/resume und dispose', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    eng.music('menu');
    eng.suspend();
    expect(ctx.state).toBe('suspended');
    const before = ctx.nodes.length;
    eng.sfx('goal');
    expect(ctx.nodes.length).toBe(before);
    eng.resume();
    expect(ctx.state).toBe('running');
    eng.dispose();
    expect(ctx.closed).toBe(true);
    const st = eng.debugStats();
    expect(st.hasContext).toBe(false);
    expect(st.voices).toBe(0);
    expect(st.timerActive).toBe(false);
    expect(() => {
      eng.sfx('goal');
      eng.music('menu');
      eng.updateCars(new Map([[1, car()]]));
      eng.tick();
    }).not.toThrow();
  });
});

describe('Motoren (updateCars)', () => {
  it('legt Motoren an, reagiert auf speed01 und entfernt verschwundene Autos', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    const first = ctx.oscs.length;
    eng.updateCars(new Map([[7, car({ speed01: 0 })]]));
    expect(eng.debugStats().cars).toBe(1);
    const osc1 = ctx.oscs[first] as FakeNode;
    expect(osc1.type).toBe('sawtooth');
    const idle = osc1.frequency.value;
    ctx.currentTime += 0.016;
    eng.updateCars(new Map([[7, car({ speed01: 1 })]]));
    expect(osc1.frequency.value).toBeGreaterThan(idle);
    expect(eng.debugStats().cars).toBe(1);
    expect(eng.debugStats().timerActive).toBe(true);

    // Auto verschwindet → ausblenden, dann getrennt
    eng.updateCars(new Map());
    expect(eng.debugStats().cars).toBe(1);
    expect(osc1.disconnected).toBe(false);
    for (let i = 0; i < 10; i++) {
      ctx.currentTime += 0.1;
      eng.tick();
    }
    expect(eng.debugStats().cars).toBe(0);
    expect(osc1.disconnected).toBe(true);
    expect(eng.debugStats().timerActive).toBe(false);
    eng.dispose();
  });

  it('begrenzt auf 6 Autos (die lautesten gewinnen), ferne sind leiser', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    const m = new Map<number, CarSound>();
    for (let i = 0; i < 10; i++) m.set(i, car({ gain: 1 - i * 0.08, speed01: 0.5 }));
    eng.updateCars(m);
    expect(eng.debugStats().cars).toBe(MAX_CARS);
    // unhörbare Autos bekommen keine Stimme
    const { eng: e2 } = makeEngine();
    e2.unlock();
    e2.updateCars(new Map([[1, car({ gain: 0 })]]));
    expect(e2.debugStats().cars).toBe(0);
    e2.dispose();
    ctx.currentTime += 0;
    eng.dispose();
  });

  it('Boost öffnet das Zischband; kaputte Werte werfen nicht', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    const gains = (): number[] => ctx.nodes.map((n) => n.gain.value);
    eng.updateCars(new Map([[1, car({ speed01: 0.8 })]]));
    const calm = Math.max(...gains());
    ctx.currentTime += 0.1;
    eng.updateCars(new Map([[1, car({ speed01: 0.8, boosting: true })]]));
    expect(gains().some((g) => g >= 0.3 && g <= 0.5)).toBe(true);
    expect(calm).toBeGreaterThan(0);
    expect(() =>
      eng.updateCars(
        new Map([[2, car({ speed01: Number.NaN, gain: Number.NaN, pan: Number.POSITIVE_INFINITY })]]),
      ),
    ).not.toThrow();
    for (const n of ctx.nodes)
      for (const p of [n.gain, n.frequency, n.pan]) expect(Number.isNaN(p.value)).toBe(false);
    eng.dispose();
  });

  it('stumm → Autos werden ausgeblendet; dispose trennt alle Motoren', () => {
    const { eng, ctx } = makeEngine();
    eng.unlock();
    const first = ctx.nodes.length;
    eng.updateCars(
      new Map([
        [1, car({ speed01: 0.4 })],
        [2, car({ speed01: 0.9, boosting: true })],
      ]),
    );
    expect(eng.debugStats().cars).toBe(2);
    const carNodes = ctx.nodes.slice(first);
    expect(carNodes.length).toBeGreaterThan(20);
    eng.setSettings({ muted: true });
    eng.updateCars(new Map([[1, car()]]));
    ctx.currentTime += 1;
    eng.tick();
    expect(eng.debugStats().cars).toBe(0);
    eng.updateCars(new Map([[3, car()]]));
    expect(eng.debugStats().cars).toBe(0);
    eng.setSettings({ muted: false });
    eng.updateCars(new Map([[3, car()]]));
    expect(eng.debugStats().cars).toBe(1);
    const more = ctx.nodes.slice(first);
    eng.dispose();
    expect(ctx.closed).toBe(true);
    expect(more.filter((n) => n.disconnected).length).toBeGreaterThanOrEqual(more.length - 1);
    expect(eng.debugStats().cars).toBe(0);
  });
});
