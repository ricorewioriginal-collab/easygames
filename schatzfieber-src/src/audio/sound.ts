/** Klang ohne Audiodateien: Meeresrauschen, Vögel/Grillen, ruhige Insel-Musik (Generativ), Romantik-Thema und Effekte */
type Theme = 'island' | 'night' | 'love' | 'dungeon' | 'off';

export class Sound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicG!: GainNode;
  private sfxG!: GainNode;
  private ambG!: GainNode;
  private sea!: GainNode;
  private noise!: AudioBuffer;
  private theme: Theme = 'off';
  private nextNote = 0;
  private step = 0;
  private lastBird = 0;
  music = 0.6;
  sfx = 0.8;

  /** Muss nach einer Nutzeraktion aufgerufen werden */
  start() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.musicG = c.createGain();
    this.sfxG = c.createGain();
    this.ambG = c.createGain();
    for (const g of [this.musicG, this.sfxG, this.ambG]) g.connect(this.master);
    this.setVolumes(this.music, this.sfx);
    // Rauschen
    const len = c.sampleRate * 2;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const d = this.noise.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) {
      b = 0.97 * b + 0.03 * (Math.random() * 2 - 1);
      d[i] = b * 6;
    }
    // Meer: gefiltertes Rauschen mit langsamer Wellen-Hüllkurve
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 650;
    this.sea = c.createGain();
    this.sea.gain.value = 0.0;
    src.connect(lp).connect(this.sea).connect(this.ambG);
    src.start();
    const lfo = c.createOscillator(),
      lg = c.createGain();
    lfo.frequency.value = 0.11;
    lg.gain.value = 250;
    lfo.connect(lg).connect(lp.frequency);
    lfo.start();
  }
  setVolumes(music: number, sfx: number) {
    this.music = music;
    this.sfx = sfx;
    if (!this.ctx) return;
    this.musicG.gain.value = music * 0.35;
    this.sfxG.gain.value = sfx * 0.6;
    this.ambG.gain.value = sfx * 0.5;
  }
  setTheme(t: Theme) {
    this.theme = t;
  }

  private tone(f: number, at: number, dur: number, type: OscillatorType, vol: number, out: AudioNode, attack = 0.01, detune = 0) {
    const c = this.ctx!;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + dur + 0.05);
  }
  private noiseHit(at: number, dur: number, freq: number, vol: number, q = 1, out?: AudioNode) {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(f).connect(g).connect(out || this.sfxG);
    s.start(at, Math.random());
    s.stop(at + dur + 0.05);
  }

  /** Pro Frame: Meerlautstärke (Nähe zur Küste), Vögel/Grillen, Musik-Sequenzer */
  update(seaNear: number, night: number) {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const now = c.currentTime;
    this.sea.gain.setTargetAtTime(0.05 + seaNear * 0.35, now, 0.5);
    // Vögel am Tag, Grillen in der Nacht
    if (this.theme !== 'dungeon' && now - this.lastBird > 1.5 + Math.random() * 4) {
      this.lastBird = now;
      if (night < 0.5) {
        const f = 2200 + Math.random() * 1800;
        for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) this.tone(f * (1 + (i % 2) * 0.12), now + i * 0.09, 0.08, 'sine', 0.05, this.ambG, 0.005);
      } else for (let i = 0; i < 6; i++) this.noiseHit(now + i * 0.05, 0.03, 4800, 0.05, 8, this.ambG);
    }
    // Musik
    if (this.theme === 'off') return;
    if (this.nextNote < now) this.nextNote = now + 0.05;
    const bpm = this.theme === 'love' ? 66 : this.theme === 'dungeon' ? 58 : this.theme === 'night' ? 72 : 92;
    const sixteenth = 60 / bpm / 4;
    // Akkorde (I–vi–IV–V in D-Dur bzw. Moll im Rätselort)
    const prog = this.theme === 'dungeon' ? [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]] : this.theme === 'love' ? [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 49, 52, 57]] : [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]];
    const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
    while (this.nextNote < now + 0.25) {
      const at = this.nextNote,
        bar = Math.floor(this.step / 16) % 4,
        s = this.step % 16,
        ch = prog[bar];
      if (s === 0) {
        // Pad
        for (const n of ch) this.tone(mtof(n), at, sixteenth * 16, 'triangle', this.theme === 'love' ? 0.05 : 0.035, this.musicG, 0.5, (Math.random() - 0.5) * 8);
        this.tone(mtof(ch[0] - 12), at, sixteenth * 14, 'sine', 0.09, this.musicG, 0.05);
      }
      if (this.theme === 'island' && [0, 3, 6, 8, 11, 14].includes(s)) {
        // Marimba-artige Arpeggien
        const n = ch[(s * 7 + bar) % ch.length] + 12 + (s > 8 ? 12 : 0);
        this.tone(mtof(n), at, 0.35, 'sine', 0.07, this.musicG, 0.004);
        this.tone(mtof(n) * 4, at, 0.08, 'sine', 0.012, this.musicG, 0.002);
      }
      if (this.theme === 'island' && (s === 4 || s === 12)) this.noiseHit(at, 0.06, 6000, 0.05, 2, this.musicG);
      if (this.theme === 'night' && s % 4 === 0) this.tone(mtof(ch[(s / 4) % ch.length] + 24), at, 0.9, 'sine', 0.03, this.musicG, 0.02);
      if (this.theme === 'love' && s % 4 === 2) this.tone(mtof(ch[(s >> 2) % ch.length] + 12), at, 1.2, 'sine', 0.05, this.musicG, 0.03);
      if (this.theme === 'dungeon' && s === 8 && bar % 2) this.tone(mtof(ch[0] + 24 + 1), at, 1.6, 'sine', 0.025, this.musicG, 0.3);
      this.nextNote += sixteenth;
      this.step++;
    }
  }

  play(name: 'pick' | 'dig' | 'splash' | 'door' | 'lever' | 'chest' | 'heart' | 'coin' | 'error' | 'step' | 'click' | 'amulet' | 'push' | 'jump') {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    const o = this.sfxG;
    switch (name) {
      case 'pick':
        this.tone(880, t, 0.12, 'sine', 0.2, o);
        this.tone(1320, t + 0.07, 0.18, 'sine', 0.18, o);
        break;
      case 'dig':
        for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.28, 0.18, 380, 0.6, 1.2);
        break;
      case 'splash':
        this.noiseHit(t, 0.5, 1200, 0.5, 0.6);
        break;
      case 'door':
        this.noiseHit(t, 1.2, 140, 0.8, 2);
        this.tone(55, t, 1.2, 'sawtooth', 0.06, o, 0.1);
        break;
      case 'lever':
        this.noiseHit(t, 0.12, 900, 0.6, 4);
        this.tone(160, t + 0.05, 0.2, 'square', 0.06, o);
        break;
      case 'push':
        this.noiseHit(t, 0.45, 220, 0.5, 1.5);
        break;
      case 'chest':
        this.noiseHit(t, 0.3, 300, 0.4, 2);
        [72, 76, 79, 84].forEach((m, i) => this.tone(440 * Math.pow(2, (m - 69) / 12), t + 0.25 + i * 0.09, 0.4, 'triangle', 0.12, o));
        break;
      case 'amulet':
        [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => this.tone(440 * Math.pow(2, (m - 69) / 12), t + i * 0.11, 1.1, 'sine', 0.12, o));
        break;
      case 'heart':
        [74, 78, 81].forEach((m, i) => this.tone(440 * Math.pow(2, (m - 69) / 12), t + i * 0.1, 0.5, 'sine', 0.15, o));
        break;
      case 'coin':
        this.tone(1568, t, 0.08, 'square', 0.06, o);
        this.tone(2093, t + 0.06, 0.25, 'square', 0.06, o);
        break;
      case 'error':
        this.tone(160, t, 0.25, 'sawtooth', 0.1, o);
        break;
      case 'step':
        this.noiseHit(t, 0.06, 600 + Math.random() * 300, 0.12, 1);
        break;
      case 'click':
        this.tone(1200, t, 0.04, 'sine', 0.08, o);
        break;
      case 'jump':
        this.noiseHit(t, 0.1, 500, 0.15, 1);
        break;
    }
  }
}
