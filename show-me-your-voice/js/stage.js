/* SHOW ME YOUR VOICE – Auftritts-Engine: Rhythmus (4 Spuren), Gesang (Tonhöhenlinie), Publikums-Signale, Rivalen-Abschnitt.
   Zeichnet auf ein Canvas, läuft nur während eines Auftritts (requestAnimationFrame wird danach beendet). */
(function (root) {
  'use strict';
  const A = root.SMYVAudio, S = root.SMYV;
  const KEYMAP = { ArrowLeft: 0, KeyD: 0, KeyA: 0, ArrowDown: 1, KeyF: 1, KeyS: 1, ArrowUp: 2, KeyJ: 2, KeyW: 2, ArrowRight: 3, KeyK: 3, KeyL: 3 };
  const COL = ['#3a86ff', '#22c55e', '#f4b400', '#ff4d8d'], COL_CB = ['#0072b2', '#009e73', '#e69f00', '#cc79a7'];
  const SYM = ['◀', '▼', '▲', '▶'];
  const CUES = [['👏', 'Klatschen'], ['🙌', 'Hände hoch'], ['💃', 'Tanzen'], ['🎤', 'Mikro ins Publikum']];
  const SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
  const BASE = { tief: 48, mittel: 55, hoch: 60 };
  const TRAVEL = { langsam: 1.9, normal: 1.5, schnell: 1.15 };
  const W_PERF = 0.05, W_GOOD = 0.1, W_OK = 0.15;

  function levelToSemi(lv) { lv = Math.max(0, Math.min(7, lv)); const i = Math.min(6, Math.floor(lv)); return SCALE[i] + (SCALE[i + 1] - SCALE[i]) * (lv - i); }
  function semiToLevel(s) { if (s <= 0) return s / 2; if (s >= 12) return 7 + (s - 12) / 2; for (let i = 0; i < 7; i++) if (s <= SCALE[i + 1]) return i + (s - SCALE[i]) / (SCALE[i + 1] - SCALE[i]); return 7; }

  // ---------- Inhalte erzeugen ----------
  function genRhythm(p) {
    const R = S.rng(p.seed), beat = 60 / p.bpm, notes = [], lead = Math.ceil(2.0 / beat - 1e-9) * beat, end = p.len - 0.8;   // Einsatz auf dem Beat der Begleitmusik
    const shows = [];
    for (let k = 0; k < (p.shows || 0); k++) shows.push({ t: lead + (end - lead) * (k + 1) / ((p.shows || 0) + 1), lane: Math.floor(R() * 4), win: p.fastShows ? 0.95 : 1.35, st: 0 });
    const minGap = Math.max(0.2, beat / 2 * 0.95);
    let lane = Math.floor(R() * 4), last = -9;
    for (let i = 0; ; i++) {
      const t = lead + i * beat / 2; if (t > end) break;
      if (shows.some(s => t > s.t - 0.6 && t < s.t + s.win + 0.4)) continue;
      if (t - last < minGap - 1e-6) continue;
      let pr = (i % 2 === 0 ? 0.8 : 0.3) * p.density; if (i % 8 === 0) pr = Math.max(pr, 0.92);
      if (R() < pr) {
        lane = (lane + [1, -1, 1, 2, -1, 0, 1][Math.floor(R() * 7)] + 4) % 4;
        notes.push({ t, lane, st: 0 }); last = t;
        if (p.density >= 0.95 && i % 2 === 0 && R() < 0.12) notes.push({ t, lane: (lane + 2) % 4, st: 0 });
      }
    }
    return { notes, shows };
  }
  function genPitch(p) {
    const R = S.rng(p.seed ^ 0x777), beat = 60 / p.bpm, segs = [];
    let t = 1.8, lv = 2 + Math.floor(R() * 3);
    while (t < p.len - 1.0) {
      const dur = Math.min(p.len - 0.8 - t, beat * [2, 2, 3, 4][Math.floor(R() * 4)]);
      if (dur < 0.4) break;
      segs.push({ t, d: dur, lv, got: 0 });
      lv = Math.max(0, Math.min(7, lv + [-2, -1, -1, 1, 1, 2, 3, -3][Math.floor(R() * 8)]));
      t += dur + beat * (R() < 0.5 ? 0.5 : 1);
    }
    return segs;
  }
  function genCues(p) {
    const R = S.rng(p.seed ^ 0x3c3c), cues = []; let t = 1.6;
    while (t < p.len - 1.2) {
      const prog = t / p.len, win = (p.win || 1.15) - 0.4 * prog;
      cues.push({ t, lane: Math.floor(R() * 4), win, st: 0, rt: 0 });
      t += win + 0.35 + R() * 0.7;
    }
    return cues;
  }

  // ---------- Engine ----------
  function Stage(o) {
    this.o = o; this.cv = o.canvas; this.cx = this.cv.getContext('2d');
    this.parts = o.parts; this.pi = -1; this.res = []; this.done = false; this.paused = false;
    this.fx = []; this.held = [false, false, false, false]; this.up = 0; this.dn = 0; this.touchLv = null;
    this.energy = 0.5; this.stars = 0; this.sg = null;
    this.colors = o.settings.cb ? COL_CB : COL; this.travel = TRAVEL[o.settings.speed] || 1.5;
    this.offset = (+o.settings.offset || 0) / 1000; this.reduced = !!o.settings.reduced;
    this.mic = !!o.mic;   // Mikrofon läuft nur in Noten- und Gesangsteilen (App startet/stoppt es)
    this.base = BASE[o.settings.range] || 55; this.vFloor = 0.01; this.vArm = true; this.vLast = -9;
    this._key = this.key.bind(this); this._keyup = this.keyup.bind(this); this._frame = this.frame.bind(this);
    this._vis = () => { if (document.hidden) this.pause(true); };
    this._resize = () => this.resize();
    addEventListener('keydown', this._key); addEventListener('keyup', this._keyup);
    document.addEventListener('visibilitychange', this._vis); addEventListener('resize', this._resize);
    this.bindTouch();
    this.resize(); this.next();
    this.raf = requestAnimationFrame(this._frame);
  }
  const P = Stage.prototype;
  P.resize = function () {
    const r = this.cv.getBoundingClientRect(), dpr = Math.min(2, root.devicePixelRatio || 1);
    this.w = Math.max(200, r.width); this.h = Math.max(200, r.height); this.dpr = dpr;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
  };
  P.clock = function (ts) { return ((ts == null ? performance.now() : ts) - this.t0) / 1000; };
  P.next = function () {
    if (this.part) this.res.push(this.summary());
    this.pi++;
    A.voiceOff();
    if (this.pi >= this.parts.length) return this.finish();
    const p = this.part = Object.assign({}, this.parts[this.pi]);
    this.t0 = performance.now(); this.pauseAt = 0; this.combo = 0; this.maxCombo = 0; this.streak = 0;
    this.cnt = { n: 0, p: 0, g: 0, o: 0, m: 0 }; this.pitchT = 0; this.pitchGot = 0; this.trail = []; this.lv = 3.5;
    this.showHit = 0; this.cueSum = 0; this.cuePts = 0; this.missRow = 0; this.partStars = 0; this.curSeg = null; this.voiced = false; this.now = 0; this.vArm = true; this.vLast = -9;
    if (p.type === 'rhythm') { const g = genRhythm(p); this.notes = p.live ? [] : g.notes; this.shows = g.shows; this.lastSpawn = -9; this.minGap = Math.max(0.2, 0.62 - 0.4 * (p.density || 0.75)); }
    if (p.type === 'pitch') this.segs = genPitch(p);
    if (p.type === 'cues') this.cues = genCues(p);
    this.sg = p.type === 'rival' || p.live || p.plain || p.acappella ? null : A.song(p.style || 'pop', p.bpm || 100);
    A.radioMute(!(p.live || p.plain)); this.lowT = 0;
    if (p.type === 'pitch' && !this.mic) A.voiceOn();
    if (this.o.onPart) this.o.onPart(this.pi, p);
  };
  P.summary = function () {
    const p = this.part, base = { type: p.type, len: p.len, stars: this.partStars || 0 };
    this.partStars = 0;
    if (p.type === 'rhythm') return Object.assign(base, this.cnt, { n: this.notes.length + (this.extraN || 0), maxCombo: this.maxCombo, showHit: this.showHit, showTotal: this.shows.length });
    if (p.type === 'pitch') return Object.assign(base, { q: this.pitchT > 0 ? this.pitchGot / this.pitchT : 0, t: this.pitchT });
    if (p.type === 'cues') return Object.assign(base, { q: this.cues.length ? this.cueSum / this.cues.length : 0, points: this.cuePts, n: this.cues.length });
    return base;
  };
  P.finish = function () {
    if (this.done) return; this.done = true; this.stop();
    const rh = { n: 0, p: 0, g: 0, o: 0, m: 0, maxCombo: 0 }, show = { hit: 0, total: 0 };
    let pt = 0, pg = 0, rDur = 0, pDur = 0, cq = 0, cn = 0;
    this.res.forEach(r => {
      if (r.type === 'rhythm') { ['n', 'p', 'g', 'o', 'm', 'maxCombo'].forEach(k => { rh[k] += r[k]; }); show.hit += r.showHit; show.total += r.showTotal; rDur += r.len; }
      if (r.type === 'pitch') { pt += r.t; pg += r.q * r.t; pDur += r.len; }
      if (r.type === 'cues') { cq += r.q * r.n; cn += r.n; }
    });
    const out = { parts: this.res, rhythm: rh.n ? rh : null, pitch: pt > 0 ? { q: pg / pt } : null, show: show.total ? show : null,
      cues: cn ? { q: cq / cn } : null, rhythmShare: rDur + pDur ? rDur / (rDur + pDur) : 1, stars: this.stars };
    if (this.o.onDone) this.o.onDone(out);
  };
  P.stop = function () {
    cancelAnimationFrame(this.raf); this.raf = 0; A.voiceOff();
    removeEventListener('keydown', this._key); removeEventListener('keyup', this._keyup);
    document.removeEventListener('visibilitychange', this._vis); removeEventListener('resize', this._resize);
    this.unbindTouch();
  };
  P.abort = function () { // Auftritt beenden: Rest zählt als verpasst
    if (this.done) return;
    if (this.part && this.part.type === 'rhythm') {
      this.notes.forEach(n => { if (!n.st) { n.st = 4; this.cnt.m++; } });
      if (this.part.live) { const rest = genRhythm(this.part).notes.filter(n => n.t > this.now + this.travel).length; this.cnt.m += rest; this.extraN = rest; }   // noch nicht erzeugte Live-Noten
    }
    if (this.part && this.part.type === 'pitch') this.segs.forEach(s => { if (s.t + s.d > this.now) this.pitchT += Math.min(s.d, s.t + s.d - Math.max(this.now, s.t)); });
    if (this.part && this.part.type === 'cues') this.cues.forEach(c => { if (!c.st) c.st = 2; });
    this.res.push(this.summary()); this.part = null;
    for (let i = this.pi + 1; i < this.parts.length; i++) { const p = this.parts[i], g = p.type === 'rhythm' ? genRhythm(p) : null; this.res.push(g ? { type: 'rhythm', len: p.len, n: g.notes.length, p: 0, g: 0, o: 0, m: g.notes.length, maxCombo: 0, showHit: 0, showTotal: g.shows.length } : { type: p.type, len: p.len, q: 0, t: p.type === 'pitch' ? p.len : 0, n: 0, points: 0 }); }
    this.pi = this.parts.length; this.finish();
  };
  P.pause = function (auto) {
    if (this.done || this.paused) return; this.paused = true; this.pauseAt = performance.now(); A.voiceSet(60, false);
    this.held = [false, false, false, false]; this.up = this.dn = 0;
    if (this.o.onPause) this.o.onPause(auto);
  };
  P.resume = function () {
    if (!this.paused || this.done) return; this.paused = false; this.t0 += performance.now() - this.pauseAt;
    if (this.sg) this.sg.step = Math.ceil(this.clock() / this.sg.spb);
  };

  // ---------- Eingaben ----------
  P.key = function (e) {
    if (this.done || e.defaultPrevented) return;   // z. B. Esc hat gerade die Pause beendet
    if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (!this.paused) this.pause(false); return; }
    if (this.paused) return;
    const lane = KEYMAP[e.code]; if (lane == null) return;
    e.preventDefault(); if (e.repeat) return;
    if (this.part.type === 'pitch') { if (lane === 2 || lane === 3) this.up = 1; else this.dn = 1; this.touchLv = null; return; }
    this.press(lane, e.timeStamp);
  };
  P.keyup = function (e) {
    const lane = KEYMAP[e.code]; if (lane == null) return;
    if (lane === 2 || lane === 3) this.up = 0; else this.dn = 0;
  };
  P.bindTouch = function () {
    const pads = this.o.pads; this._pd = []; if (!pads) return;
    pads.querySelectorAll('[data-lane]').forEach(b => {
      const lane = +b.dataset.lane;
      const down = e => { e.preventDefault(); if (this.paused || this.done) return; b.classList.add('on');
        if (this.part && this.part.type === 'pitch') { if (lane >= 2) this.up = 1; else this.dn = 1; this.touchLv = null; } else this.press(lane, e.timeStamp); };
      const up = () => { b.classList.remove('on'); if (lane >= 2) this.up = 0; else this.dn = 0; };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
      this._pd.push([b, down, up]);
    });
    // Gesang: auf dem Canvas ziehen setzt die Tonhöhe direkt; Rhythmus: Tippen in eine Spur
    this._cvd = e => { if (this.paused || this.done || !this.part) return; e.preventDefault();
      if (this.part.type === 'pitch') { this.drag = true; this.dragTo(e); try { this.cv.setPointerCapture(e.pointerId); } catch (x) {} }
      else if (this.part.type !== 'rival') { const lane = this.laneAt(e.clientX); if (lane >= 0) this.press(lane, e.timeStamp); } };
    this._cvm = e => { if (this.drag) this.dragTo(e); };
    this._cvu = () => { this.drag = false; this.touchLv = null; };
    this.cv.addEventListener('pointerdown', this._cvd); this.cv.addEventListener('pointermove', this._cvm);
    this.cv.addEventListener('pointerup', this._cvu); this.cv.addEventListener('pointercancel', this._cvu);
  };
  P.unbindTouch = function () {
    (this._pd || []).forEach(([b, d, u]) => { b.removeEventListener('pointerdown', d); b.removeEventListener('pointerup', u); b.removeEventListener('pointercancel', u); b.removeEventListener('pointerleave', u); b.classList.remove('on'); });
    this.cv.removeEventListener('pointerdown', this._cvd); this.cv.removeEventListener('pointermove', this._cvm);
    this.cv.removeEventListener('pointerup', this._cvu); this.cv.removeEventListener('pointercancel', this._cvu);
  };
  P.dragTo = function (e) { const r = this.cv.getBoundingClientRect(), y = e.clientY - r.top; this.touchLv = Math.max(0, Math.min(7, (this.h * 0.82 - y) / (this.h * 0.64) * 7)); };
  P.laneGeo = function () { const W = Math.min(this.w * 0.94, 520), x0 = (this.w - W) / 2; return { W, x0, lw: W / 4, hitY: this.h * 0.84 }; };
  P.laneAt = function (clientX) { const r = this.cv.getBoundingClientRect(), g = this.laneGeo(), x = clientX - r.left - g.x0; return x < 0 || x >= g.W ? -1 : Math.floor(x / g.lw); };

  P.press = function (lane, ts) {
    const p = this.part; if (!p) return;
    const t = this.clock(ts && ts > this.t0 ? ts : null) - this.offset;
    this.held[lane] = true; setTimeout(() => { this.held[lane] = false; }, 110);
    if (p.type === 'rhythm') {
      const sh = this.shows.find(s => s.st === 0 && t >= s.t && t <= s.t + s.win);
      if (sh) { this.showResult(sh, sh.lane === lane); return; }
      let best = null, bd = 9;
      for (const n of this.notes) { if (n.st || n.lane !== lane) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } if (n.t > t + W_OK) break; }
      if (best && bd <= W_OK) return this.judge(best, bd);
      this.combo = 0; this.streak = 0; this.energy = Math.max(0, this.energy - 0.02); // Fehlgriff
    } else if (p.type === 'cues') {
      const c = this.cues.find(x => x.st === 0 && t >= x.t && t <= x.t + x.win);
      if (!c) return;
      if (c.lane === lane) {
        c.st = 1; c.rt = t - c.t; const q = 0.5 + 0.5 * (1 - c.rt / c.win); this.cueSum += q; this.cuePts += Math.round(150 * q);
        this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.energy = Math.min(1, this.energy + 0.06);
        if (c.rt < c.win * 0.4 && ++this.streak % 4 === 0) this.addStar();
        this.pop(q > 0.8 ? 'BLITZSCHNELL!' : 'GUT!', q > 0.8 ? '#ffd23f' : '#7cf29a', lane); A.sfx('hit', 72 + lane * 2);
      } else { c.st = 2; this.combo = 0; this.streak = 0; this.energy = Math.max(0, this.energy - 0.08); this.pop('FALSCH', '#ff5470', lane); A.sfx('miss'); }
    }
  };
  P.judge = function (n, d) {
    const g = d <= W_PERF ? 1 : d <= W_GOOD ? 2 : 3; n.st = g;
    this.cnt[['', 'p', 'g', 'o'][g]]++;
    this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.missRow = 0;
    this.energy = Math.min(1, this.energy + [0, 0.035, 0.025, 0.012][g]);
    if (g === 1) { if (++this.streak % 8 === 0) this.addStar(); } else this.streak = 0;
    this.pop(['', 'PERFECT!', 'GUT', 'OK'][g], ['', '#ffd23f', '#7cf29a', '#9ec5ff'][g], n.lane);
    if (this.part.live) A.sfx('tick');
    else { const ch = A.chordTones(this.part.style, n.t, this.part.bpm); A.sfx('hit', ch[n.lane % 3] + (n.lane === 3 ? 24 : 12)); }
    if (this.o.onEvent && (this.combo === 10 || this.combo === 25 || this.combo === 50)) this.o.onEvent('combo', this.combo);
  };
  P.showResult = function (sh, ok) {
    sh.st = ok ? 1 : 2;
    if (ok) { this.showHit++; this.energy = Math.min(1, this.energy + 0.15); A.sfx('applause', 1.2); this.pop('SHOW-MOMENT! ' + CUES[sh.lane][0], '#ff8ad8', sh.lane, 1.4); if (this.o.onEvent) this.o.onEvent('show', 1); }
    else { this.energy = Math.max(0, this.energy - 0.1); A.sfx('miss'); this.pop('Moment verpasst', '#ff5470', sh.lane); }
    if (this.o.captions && ok) this.o.captions('👏 Applaus');
  };
  P.addStar = function () { if (!this.o.bonus) return; this.stars++; this.partStars = (this.partStars || 0) + 1; A.sfx('star'); this.pop('⭐ STERN!', '#ffe680', 1.5, 1.2); };
  P.pop = function (txt, col, lane, size) {
    const g = this.laneGeo();
    this.fx.push({ txt, col, x: g.x0 + g.lw * (lane + 0.5), y: g.hitY - 40, t: 0, s: size || 1 });
    if (this.fx.length > 14) this.fx.shift();
  };

  // ---------- Hauptschleife ----------
  P.frame = function (ts) {
    if (this.done) return;
    this.raf = requestAnimationFrame(this._frame);
    if (this.paused) return;
    const now = this.clock(ts), dt = Math.min(0.05, Math.max(0, now - (this.last == null ? now : this.last))); this.last = now; this.now = now;
    const p = this.part; if (!p) return;
    if (this.sg) A.tick(this.sg, now);
    if (p.type === 'rhythm') {
      if (p.live) this.spawnLive(now);
      this.updRhythm(now);
      // Jury-Stopp (Casting): Publikum lange auf dem Tiefpunkt → die Jury bricht ab
      if (this.o.juryStop && now > 8) { this.lowT = this.energy < 0.18 ? this.lowT + dt : 0; if (this.lowT > 3) { if (this.o.onEvent) this.o.onEvent('stop'); this.abort(); return; } }
    }
    else if (p.type === 'pitch') this.updPitch(now, dt);
    else if (p.type === 'cues') this.updCues(now);
    this.fx.forEach(f => { f.t += dt; }); this.fx = this.fx.filter(f => f.t < 0.8);
    this.draw(now);
    if (now >= p.len) { this.last = null; this.next(); }
  };
  // Live-Noten aus dem Radio: erkannter Beat jetzt → Note erreicht die Trefferlinie, wenn der verzögerte Ton erklingt
  P.spawnLive = function (now) {
    const on = A.radioOnsets(now); if (!on.length || now > this.part.len - this.travel - 0.4) return;
    const o = on.sort((a, b) => b.s - a.s)[0], t = now + this.travel;
    if (t - this.lastSpawn < this.minGap || this.shows.some(s => t > s.t - 0.6 && t < s.t + s.win + 0.4)) return;
    this.notes.push({ t, lane: o.lane, st: 0 }); this.lastSpawn = t;
  };
  // Radio bricht mitten im Auftritt ab: ab jetzt eigene Beats und vorbereitete Noten
  P.radioLost = function () {
    this.parts.forEach(q => { q.live = false; q.plain = false; });
    const p = this.part; if (!p || this.done) return;
    p.live = false; p.plain = false;
    if (p.type === 'rhythm') {
      const from = Math.max(this.now + this.travel, this.notes.length ? this.notes[this.notes.length - 1].t + this.minGap : 0);
      genRhythm(p).notes.forEach(n => { if (n.t >= from) this.notes.push(n); });
      this.sg = A.song(p.style || 'pop', p.bpm || 100); this.sg.step = Math.ceil(this.now / this.sg.spb);
    } else if (p.type === 'pitch' && !p.acappella && !this.sg) {   // Gesangsteil bekommt wieder Begleitung
      this.sg = A.song(p.style || 'pop', p.bpm || 100); this.sg.step = Math.ceil(this.now / this.sg.spb);
    }
  };
  P.updRhythm = function (now) {
    const t = now - this.offset;
    if (this.mic) this.voiceHit(t);
    for (const n of this.notes) {
      if (n.t > t) break;
      if (!n.st && t - n.t > W_OK) { n.st = 4; this.cnt.m++; this.combo = 0; this.streak = 0; this.energy = Math.max(0, this.energy - 0.05); this.missRow++; this.pop('VERPASST', '#ff5470', n.lane); if (this.missRow === 4 && this.o.onEvent) this.o.onEvent('miss', 4); }
    }
    for (const s of this.shows) {
      if (s.st === 0 && t >= s.t && !s.cued) { s.cued = true; A.sfx('cue'); if (this.o.captions) this.o.captions('🔔 Show-Moment: ' + CUES[s.lane][1]); }
      if (s.st === 0 && t > s.t + s.win) this.showResult(s, false);
    }
  };
  // Mikrofon in Notenteilen: Jeder neu angesungene Ton trifft die nächste Note (Spur egal). Grundrauschen wird mitgelernt.
  P.voiceHit = function (t) {
    const lv = A.micLevel(); if (lv == null) return;
    this.vFloor += (lv - this.vFloor) * (lv < this.vFloor ? 0.1 : 0.01);   // passt sich leiser Musik im Raum an
    if (lv < this.vFloor * 1.4 + 0.008) { this.vArm = true; return; }
    if (!this.vArm || lv < this.vFloor * 2.2 + 0.03 || t - this.vLast < 0.12) return;
    this.vArm = false; this.vLast = t;
    let best = null, bd = 9;
    for (const n of this.notes) { if (n.st) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } if (n.t > t + W_OK) break; }
    if (best && bd <= W_OK) { this.held[best.lane] = true; setTimeout(() => { this.held[best.lane] = false; }, 110); this.judge(best, bd); }
  };
  P.updPitch = function (now, dt) {
    if (this.mic) {
      const m = A.micPitch();
      if (m != null) {
        const tgt = this.curSeg ? levelToSemi(this.curSeg.lv) : levelToSemi(this.lv);
        let s = m - this.base; while (s - tgt > 6) s -= 12; while (tgt - s > 6) s += 12;   // Oktave egal
        this.lv += (semiToLevel(s) - this.lv) * Math.min(1, dt * 14); this.voiced = true;
      } else this.voiced = false;
    } else if (this.touchLv != null) { this.lv += (this.touchLv - this.lv) * Math.min(1, dt * 16); this.voiced = true; }
    else { this.lv += (this.up - this.dn) * dt * 6.5; this.voiced = true; }
    this.lv = Math.max(0, Math.min(7, this.lv));
    const seg = this.segs.find(s => now >= s.t && now < s.t + s.d) || null;
    if (seg && seg !== this.curSeg) { A.guide((this.mic ? this.base : 48) + levelToSemi(seg.lv), Math.min(seg.d, 0.6)); }
    if (this.curSeg && seg !== this.curSeg) {
      const s = this.curSeg, q = s.got / s.d;
      if (q >= 0.85) { this.pop('PERFECT!', '#ffd23f', 1.5); if (++this.streak % 3 === 0) this.addStar(); } else if (q >= 0.55) { this.pop('GUT', '#7cf29a', 1.5); this.streak = 0; } else { this.pop('Daneben', '#ff5470', 1.5); this.streak = 0; }
    }
    this.curSeg = seg;
    if (seg) {
      const d = Math.abs(this.lv - seg.lv), c = !this.voiced ? 0 : d <= 0.45 ? 1 : d <= 0.9 ? 0.5 : 0;
      this.pitchT += dt; this.pitchGot += c * dt; seg.got += c * dt;
      this.energy = Math.max(0, Math.min(1, this.energy + (c - 0.5) * dt * 0.4));
    }
    if (!this.mic) A.voiceSet(60 + levelToSemi(this.lv) - 12, !!seg);
    this.trail.push(this.lv); if (this.trail.length > 50) this.trail.shift();
  };
  P.updCues = function (now) {
    for (const c of this.cues) {
      if (c.st === 0 && now >= c.t && !c.cued) { c.cued = true; A.sfx('cue'); }
      if (c.st === 0 && now > c.t + c.win) { c.st = 2; this.combo = 0; this.streak = 0; this.energy = Math.max(0, this.energy - 0.06); this.pop('ZU LANGSAM', '#ff5470', c.lane); }
    }
  };

  // ---------- Zeichnen ----------
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  P.draw = function (now) {
    const c = this.cx, w = this.w, h = this.h, p = this.part;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, w, h);
    if (!this.reduced) { // weiche Lichtkegel im Takt
      const beat = p.bpm ? (now * p.bpm / 60) % 1 : 0, a = 0.06 + 0.06 * (1 - beat) * this.energy;
      for (let i = 0; i < 3; i++) {
        const x = w * (0.2 + 0.3 * i) + Math.sin(now * 0.6 + i * 2) * w * 0.08, gr = c.createLinearGradient(x, 0, x, h);
        gr.addColorStop(0, `rgba(${i === 1 ? '255,90,220' : '120,140,255'},${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.beginPath(); c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 140, h); c.lineTo(x - 140, h); c.fill();
      }
    }
    if (p.type === 'rhythm') this.drawRhythm(now - this.offset);
    else if (p.type === 'pitch') this.drawPitch(now);
    else if (p.type === 'cues') this.drawCues(now);
    else if (p.type === 'rival') this.drawRival(now);
    // Rückmeldungen
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const f of this.fx) {
      const k = f.t / 0.8; c.globalAlpha = 1 - k; c.fillStyle = f.col;
      c.font = `900 ${Math.round(22 * f.s * (1 + 0.2 * (1 - k)))}px system-ui,sans-serif`;
      c.fillText(f.txt, f.x, f.y - k * 40);
    }
    c.globalAlpha = 1;
    this.drawHud(now);
    if (now < 1.6 && p.title) { // Teil-Titel
      c.globalAlpha = Math.min(1, (1.6 - now) * 2); c.fillStyle = 'rgba(8,6,30,.72)'; rr(c, w / 2 - 170, h * 0.3 - 40, 340, 80, 18); c.fill();
      c.fillStyle = '#fff'; c.font = '800 22px system-ui,sans-serif'; c.fillText(p.title, w / 2, h * 0.3 - 10);
      c.fillStyle = '#ffd23f'; c.font = '600 15px system-ui,sans-serif'; c.fillText(p.sub || '', w / 2, h * 0.3 + 18); c.globalAlpha = 1;
    }
    const hl = this.o.hints && this.o.hints[this.pi];
    if (hl) { const hn = hl.filter(x => now >= x.t && now < x.t + x.d).pop(); if (hn) { c.fillStyle = 'rgba(0,0,0,.7)'; rr(c, 16, h * 0.48, w - 32, 54, 14); c.fill(); c.fillStyle = '#fff'; c.font = '700 16px system-ui,sans-serif'; c.fillText(hn.text, w / 2, h * 0.48 + 27, w - 48); } }
  };
  P.drawHud = function (now) {
    const c = this.cx, w = this.w, p = this.part;
    c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(0, 0, w, 5);
    c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w * Math.min(1, now / p.len), 5);
    // Publikums-Energie
    c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, 10, 14, 120, 12, 6); c.fill();
    const eg = c.createLinearGradient(10, 0, 130, 0); eg.addColorStop(0, '#ff4d8d'); eg.addColorStop(1, '#ffd23f');
    c.fillStyle = eg; rr(c, 10, 14, Math.max(12, 120 * this.energy), 12, 6); c.fill();
    c.fillStyle = '#fff'; c.font = '700 11px system-ui,sans-serif'; c.textAlign = 'left'; c.fillText('Publikum', 12, 36);
    c.textAlign = 'right'; c.font = '900 20px system-ui,sans-serif';
    if (p.type === 'rhythm' || p.type === 'cues') { c.fillText(this.combo > 1 ? this.combo + 'x Combo' : '', w - 12, 24); }
    if (p.type === 'pitch') { c.fillText(Math.round(this.pitchT ? 100 * this.pitchGot / this.pitchT : 0) + ' % auf der Linie', w - 12, 24); }
    if (this.o.bonus) { c.fillStyle = '#ffe680'; c.font = '800 16px system-ui,sans-serif'; c.fillText('⭐ ' + this.stars, w - 12, 48); }
    c.textAlign = 'center';
  };
  P.drawRhythm = function (t) {
    const c = this.cx, g = this.laneGeo(), col = this.colors, top = 50;
    for (let i = 0; i < 4; i++) {
      const x = g.x0 + i * g.lw;
      c.fillStyle = this.held[i] ? 'rgba(255,255,255,.14)' : 'rgba(10,8,40,.38)'; c.fillRect(x + 2, top, g.lw - 4, this.h - top);
      c.strokeStyle = col[i]; c.lineWidth = 3; c.globalAlpha = this.held[i] ? 1 : 0.55;
      c.beginPath(); c.arc(x + g.lw / 2, g.hitY, Math.min(30, g.lw * 0.36), 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '700 16px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(SYM[i], x + g.lw / 2, g.hitY);
    }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(g.x0, g.hitY - 1, g.W, 2);
    const rad = Math.min(26, g.lw * 0.32), span = g.hitY - top;
    for (const n of this.notes) {
      const dt = n.t - t; if (dt > this.travel) break;
      if (n.st && n.st !== 4) continue; if (n.st === 4 && dt < -0.3) continue;
      const y = g.hitY - dt / this.travel * span, x = g.x0 + (n.lane + 0.5) * g.lw;
      c.globalAlpha = n.st === 4 ? 0.3 : 1; c.fillStyle = col[n.lane];
      c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.font = `900 ${Math.round(rad * 0.9)}px system-ui,sans-serif`; c.fillText(SYM[n.lane], x, y + 1);
    }
    c.globalAlpha = 1;
    const s = this.shows.find(x => x.st === 0 && t >= x.t - 0.6 && t <= x.t + x.win);
    if (s) {
      const k = Math.max(0, Math.min(1, (t - s.t) / s.win)), cx = this.w / 2, cy = this.h * 0.38;
      c.fillStyle = 'rgba(20,6,40,.85)'; rr(c, cx - 160, cy - 70, 320, 140, 22); c.fill();
      c.strokeStyle = '#ff8ad8'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#ff8ad8'; c.font = '900 18px system-ui,sans-serif'; c.fillText(t < s.t ? 'GLEICH: SHOW-MOMENT!' : 'SHOW-MOMENT – JETZT!', cx, cy - 46);
      c.font = '44px system-ui,sans-serif'; c.fillText(CUES[s.lane][0], cx - 60, cy + 6);
      c.fillStyle = col[s.lane]; c.beginPath(); c.arc(cx + 50, cy + 6, 30, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.font = '900 26px system-ui,sans-serif'; c.fillText(SYM[s.lane], cx + 50, cy + 7);
      c.font = '600 14px system-ui,sans-serif'; c.fillText(CUES[s.lane][1], cx, cy + 52);
      if (t >= s.t) { c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.beginPath(); c.arc(cx + 50, cy + 6, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); c.stroke(); }
    }    if (this.mic) { c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '600 13px system-ui,sans-serif'; c.fillText('🎙️ Sing jede Note an, wenn sie den Ring erreicht – Tasten gehen auch', this.w / 2, top - 14, this.w - 20); }
  };
  P.drawPitch = function (now) {
    const c = this.cx, w = this.w, h = this.h, px = w * 0.25, pps = Math.max(110, w * 0.2), y0 = h * 0.82, yr = h * 0.64;
    const Y = lv => y0 - lv / 7 * yr;
    c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1;
    for (let i = 0; i <= 7; i++) { c.beginPath(); c.moveTo(0, Y(i)); c.lineTo(w, Y(i)); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(px - 1, h * 0.12, 2, h * 0.76);
    for (const s of this.segs) {
      const x1 = px + (s.t - now) * pps, x2 = px + (s.t + s.d - now) * pps; if (x2 < -10) continue; if (x1 > w + 10) break;
      const q = s.got / s.d, done = now > s.t + s.d;
      c.fillStyle = done ? (q >= 0.85 ? '#ffd23f' : q >= 0.55 ? '#7cf29a' : 'rgba(255,84,112,.6)') : '#4cc9ff';
      rr(c, x1, Y(s.lv) - 9, Math.max(8, x2 - x1), 18, 9); c.fill();
    }
    c.strokeStyle = 'rgba(255,138,216,.5)'; c.lineWidth = 3; c.beginPath();
    this.trail.forEach((lv, i) => { const x = px - (this.trail.length - i) * 3; if (i) c.lineTo(x, Y(lv)); else c.moveTo(x, Y(lv)); }); c.stroke();
    const on = this.curSeg && Math.abs(this.lv - this.curSeg.lv) <= 0.45 && this.voiced;
    c.fillStyle = on ? '#ffd23f' : '#ff8ad8'; c.beginPath(); c.arc(px, Y(this.lv), 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1a0b2e'; c.font = '16px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🎤', px, Y(this.lv) + 1);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 13px system-ui,sans-serif';
    c.fillText(this.mic ? (this.voiced ? 'Mikrofon hört dich' : 'Sing einfach los …') : 'Halte den Mikro-Punkt auf der blauen Linie: ▲ ▼ halten oder ziehen', w / 2, h * 0.93, w - 20);
  };
  P.drawCues = function (now) {
    const c = this.cx, g = this.laneGeo(), w = this.w, h = this.h;
    const cu = this.cues.find(x => x.st === 0 && now >= x.t && now <= x.t + x.win);
    for (let i = 0; i < 4; i++) {
      const x = g.x0 + (i + 0.5) * g.lw;
      c.globalAlpha = 0.5; c.fillStyle = this.colors[i]; c.beginPath(); c.arc(x, g.hitY, Math.min(30, g.lw * 0.36), 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      c.font = '24px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CUES[i][0], x, g.hitY);
    }
    if (cu) {
      const k = (now - cu.t) / cu.win, cx = w / 2, cy = h * 0.4;
      c.fillStyle = 'rgba(20,6,40,.85)'; c.beginPath(); c.arc(cx, cy, 80, 0, Math.PI * 2); c.fill();
      c.strokeStyle = this.colors[cu.lane]; c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, 70 + 50 * (1 - k), 0, Math.PI * 2); c.stroke();
      c.font = '64px system-ui,sans-serif'; c.fillText(CUES[cu.lane][0], cx, cy + 2);
      c.fillStyle = '#fff'; c.font = '700 16px system-ui,sans-serif'; c.fillText(CUES[cu.lane][1] + '  ' + SYM[cu.lane], cx, cy + 108);
    } else { c.fillStyle = 'rgba(255,255,255,.6)'; c.font = '600 15px system-ui,sans-serif'; c.fillText('Achte auf das Publikum …', w / 2, h * 0.4); }
  };
  P.drawRival = function (now) {
    const p = this.part, k = Math.min(1, now / (p.len * 0.85));
    if (this.o.onRival) this.o.onRival(k);
  };

  root.SMYVStage = { Stage, genRhythm, genPitch, genCues, CUES, SYM, TRAVEL };
})(window);
