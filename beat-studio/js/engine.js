/* Beat-Studio – Klangmaschine (Web Audio, keine Sample-Dateien): Drum-Kits, Bässe, Akkord- und Melodie-Instrumente,
 * Mischpult (Lautstärke, Panorama, Hall), Gesangs-Effekte, Echtzeit-Wiedergabe (taktweise vorausgeplant) und
 * Export über OfflineAudioContext (dieselben Klänge, 44,1 kHz Stereo). */
(function () {
  'use strict';
  const C = BSCore, AC = window.AudioContext || window.webkitAudioContext, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const noiseOf = new WeakMap(), irOf = new WeakMap();
  function noise(ctx) { let b = noiseOf.get(ctx); if (!b) { b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noiseOf.set(ctx, b); } return b; }
  function ir(ctx) { let b = irOf.get(ctx); if (!b) { const len = Math.floor(ctx.sampleRate * 2.2); b = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); } irOf.set(ctx, b); } return b; }
  const SEND = { drums: .08, bass: 0, chords: .45, lead: .3, vox: .3 };
  const VOXFX = { clean: 'Trocken', hall: 'Hall', echo: 'Echo', radio: 'Radio', robot: 'Roboter' };

  // ---------- Mischpult ----------
  function build(ctx, song, dest) {
    const m = song.mix, g = { ctx, tr: {} };
    g.master = ctx.createGain(); g.master.gain.value = m.master.vol;
    g.comp = ctx.createDynamicsCompressor(); g.comp.threshold.value = -12; g.comp.ratio.value = 4; g.comp.attack.value = .005; g.comp.release.value = .2;
    g.master.connect(g.comp); g.comp.connect(dest || ctx.destination);
    g.rev = ctx.createConvolver(); g.rev.buffer = ir(ctx); g.revGain = ctx.createGain(); g.revGain.gain.value = m.master.reverb; g.rev.connect(g.revGain); g.revGain.connect(g.master);
    C.TRACKS.forEach(k => { const t = { in: ctx.createGain(), gain: ctx.createGain(), send: ctx.createGain() };
      t.pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      t.in.connect(t.gain); if (t.pan) { t.gain.connect(t.pan); t.pan.connect(g.master); } else t.gain.connect(g.master);
      t.in.connect(t.send); t.send.connect(g.rev); g.tr[k] = t; });
    // Gesangs-Kette: Effekt vor dem Spur-Eingang
    const v = g.tr.vox; g.voxIn = ctx.createGain(); voxFx(ctx, g, m.vox.fx); void v;
    apply(g, song); return g;
  }
  function voxFx(ctx, g, fx) {
    const out = g.tr.vox.in; try { g.voxIn.disconnect(); } catch (e) { /* neu */ }
    if (fx === 'echo') { const d = ctx.createDelay(1), fb = ctx.createGain(); d.delayTime.value = .32; fb.gain.value = .35; g.voxIn.connect(out); g.voxIn.connect(d); d.connect(fb); fb.connect(d); d.connect(out); }
    else if (fx === 'radio') { const bp = ctx.createBiquadFilter(), sh = ctx.createWaveShaper(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = .9; const c = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 2.5); } sh.curve = c; g.voxIn.connect(bp); bp.connect(sh); sh.connect(out); }
    else if (fx === 'robot') { const rm = ctx.createGain(), lfo = ctx.createOscillator(); rm.gain.value = 0; lfo.frequency.value = 55; lfo.connect(rm.gain); lfo.start(); g.voxIn.connect(rm); rm.connect(out); const dry = ctx.createGain(); dry.gain.value = .35; g.voxIn.connect(dry); dry.connect(out); }
    else g.voxIn.connect(out);
    g.voxFxName = fx;
  }
  function apply(g, song) {   // Lautstärke/Panorama/Mute/Solo/Hall – auch während der Wiedergabe
    const m = song.mix, now = g.ctx.currentTime;
    C.TRACKS.forEach(k => { const t = g.tr[k]; t.gain.gain.setTargetAtTime(C.audible(song, k) ? m[k].vol : 0, now, .02); if (t.pan) t.pan.pan.setTargetAtTime(m[k].pan, now, .02);
      t.send.gain.setTargetAtTime(C.audible(song, k) ? (k === 'vox' ? (m.vox.fx === 'hall' ? .6 : m.vox.fx === 'clean' ? .05 : .2) : SEND[k]) : 0, now, .02); });
    g.master.gain.setTargetAtTime(m.master.vol, now, .02); g.revGain.gain.setTargetAtTime(m.master.reverb, now, .02);
    if (g.voxFxName !== m.vox.fx) voxFx(g.ctx, g, m.vox.fx);
  }

  // ---------- Klangerzeuger ----------
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function env(p, t, a, peak, d, sus, rel) { p.cancelScheduledValues(t); p.setValueAtTime(.0001, t); p.linearRampToValueAtTime(peak, t + a); if (sus != null) { p.setTargetAtTime(peak * sus, t + a, d / 3); p.setTargetAtTime(.0001, t + a + d, rel || .08); } else p.exponentialRampToValueAtTime(.0001, t + a + d); }
  function osc(ctx, type, f, t, dur) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur + .05); return o; }
  function nz(ctx, t, dur) { const s = ctx.createBufferSource(); s.buffer = noise(ctx); s.start(t, Math.random() * .5); s.stop(t + dur + .05); return s; }
  function filt(ctx, type, f, q) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; }
  const KIT = { pop: { kf: 140, kd: .32, sn: 1900, hh: 8000, dec: 1 }, '808': { kf: 110, kd: .85, sn: 2400, hh: 9000, dec: 1.2 }, house: { kf: 130, kd: .4, sn: 1600, hh: 9500, dec: .9 },
    rock: { kf: 120, kd: .3, sn: 1400, hh: 7000, dec: 1.3 }, lofi: { kf: 105, kd: .38, sn: 1200, hh: 5500, dec: .8 } };
  function drum(ctx, out, k, t, v, kit) {
    const K = KIT[kit] || KIT.pop, g = ctx.createGain(); g.connect(out);
    if (k === 'kick') { const o = osc(ctx, 'sine', K.kf, t, K.kd); o.frequency.exponentialRampToValueAtTime(42, t + .12); env(g.gain, t, .002, v, K.kd); o.connect(g);
      const c = nz(ctx, t, .02), hp = filt(ctx, 'highpass', 3000), cg = ctx.createGain(); env(cg.gain, t, .001, v * .25, .02); c.connect(hp); hp.connect(cg); cg.connect(out); }
    else if (k === 'snare') { const n = nz(ctx, t, .2), bp = filt(ctx, 'bandpass', K.sn, .7); n.connect(bp); bp.connect(g); env(g.gain, t, .002, v * .7, .18 * K.dec); const o = osc(ctx, 'triangle', 190, t, .1), og = ctx.createGain(); env(og.gain, t, .002, v * .5, .09); o.connect(og); og.connect(out); }
    else if (k === 'clap') { const n = nz(ctx, t, .25), bp = filt(ctx, 'bandpass', 1200, 1.2); n.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); [0, .012, .024].forEach(d => { g.gain.setValueAtTime(v * .8, t + d); g.gain.exponentialRampToValueAtTime(.05, t + d + .01); }); g.gain.setValueAtTime(v * .6, t + .036); g.gain.exponentialRampToValueAtTime(.0001, t + .22); }
    else if (k === 'hat' || k === 'open') { const d = k === 'hat' ? .05 : .32, n = nz(ctx, t, d), hp = filt(ctx, 'highpass', K.hh); n.connect(hp); hp.connect(g); env(g.gain, t, .001, v * (k === 'hat' ? .35 : .3), d); }
    else if (k === 'tom') { const o = osc(ctx, 'sine', 190, t, .3); o.frequency.exponentialRampToValueAtTime(85, t + .25); o.connect(g); env(g.gain, t, .002, v * .8, .3); }
    else if (k === 'perc') { const o = osc(ctx, 'square', 820, t, .04), bp = filt(ctx, 'bandpass', 1700, 2); o.connect(bp); bp.connect(g); env(g.gain, t, .001, v * .35, .035); }
    else if (k === 'crash') { const n = nz(ctx, t, 1.8), hp = filt(ctx, 'highpass', 5200); n.connect(hp); hp.connect(g); env(g.gain, t, .002, v * .3, 1.7); }
  }
  function tone(ctx, out, tr, preset, m, t, d, v) {
    const f = mtof(m), g = ctx.createGain(); g.connect(out); const end = d + .4;
    if (tr === 'bass') {
      if (preset === 'sub') { const o = osc(ctx, 'sine', f, t, end), o2 = osc(ctx, 'triangle', f, t, end), g2 = ctx.createGain(); g2.gain.value = .25; o2.connect(g2); g2.connect(g); o.connect(g); env(g.gain, t, .008, v * .9, d, .85, .08); }
      else if (preset === 'pluck') { const o = osc(ctx, 'square', f, t, end), lp = filt(ctx, 'lowpass', 1800, 4); lp.frequency.setValueAtTime(2200, t); lp.frequency.exponentialRampToValueAtTime(220, t + .18); o.connect(lp); lp.connect(g); env(g.gain, t, .003, v * .5, Math.min(d, .3)); }
      else if (preset === 'e') { const o = osc(ctx, 'triangle', f, t, end), o2 = osc(ctx, 'sawtooth', f, t, end), lp = filt(ctx, 'lowpass', 900), g2 = ctx.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(lp); o.connect(lp); lp.connect(g); env(g.gain, t, .004, v * .75, d, .6, .06); }
      else { const o = osc(ctx, 'sawtooth', f, t, end), lp = filt(ctx, 'lowpass', 600, 6); lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(380, t + .15); o.connect(lp); lp.connect(g); env(g.gain, t, .004, v * .55, d, .7, .06); }
    } else if (tr === 'chords') {
      if (preset === 'pad') { [-6, 6].forEach(dt => { const o = osc(ctx, 'sawtooth', f, t, end + .3); o.detune.value = dt; const lp = filt(ctx, 'lowpass', 1300); o.connect(lp); lp.connect(g); }); env(g.gain, t, .18, v * .12, d, .9, .35); }
      else if (preset === 'organ') { [1, 2, 3].forEach((h, i) => { const o = osc(ctx, 'sine', f * h, t, end); const gg = ctx.createGain(); gg.gain.value = [1, .5, .25][i]; o.connect(gg); gg.connect(g); }); env(g.gain, t, .01, v * .14, d, .95, .05); }
      else if (preset === 'guitar') { const o = osc(ctx, 'sawtooth', f, t, end), lp = filt(ctx, 'lowpass', 2600, 1); lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + .4); const sh = ctx.createWaveShaper(), c = new Float32Array(256); for (let i = 0; i < 256; i++) c[i] = Math.tanh((i / 128 - 1) * 3); sh.curve = c; o.connect(sh); sh.connect(lp); lp.connect(g); env(g.gain, t, .004, v * .1, Math.max(.2, d)); }
      else if (preset === 'stab') { const o = osc(ctx, 'sawtooth', f, t, .4), o2 = osc(ctx, 'square', f * 1.005, t, .4), lp = filt(ctx, 'lowpass', 2400, 3); o.connect(lp); o2.connect(lp); lp.connect(g); env(g.gain, t, .003, v * .09, Math.min(.22, d)); }
      else { const o = osc(ctx, 'triangle', f, t, end + .8), o2 = osc(ctx, 'sine', f * 2, t, end + .8), g2 = ctx.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(g); o.connect(g); env(g.gain, t, .003, v * .22, Math.max(.5, d * 1.4)); }
    } else {   // Melodie
      if (preset === 'flute' || preset === 'whistle') { const ff = preset === 'whistle' ? f * 2 : f, o = osc(ctx, 'sine', ff, t, end), lfo = osc(ctx, 'sine', 5.5, t, end), lg = ctx.createGain(); lg.gain.value = ff * .012; lfo.connect(lg); lg.connect(o.frequency); o.connect(g);
        const n = nz(ctx, t, d), bp = filt(ctx, 'bandpass', ff * 2, 2), ng = ctx.createGain(); ng.gain.value = .04; n.connect(bp); bp.connect(ng); ng.connect(g); env(g.gain, t, .04, v * .3, d, .85, .08); }
      else if (preset === 'bell') { const o = osc(ctx, 'sine', f * 2, t, end + 1), mod = osc(ctx, 'sine', f * 7, t, end + 1), mg = ctx.createGain(); mg.gain.setValueAtTime(f * 3, t); mg.gain.exponentialRampToValueAtTime(1, t + 1); mod.connect(mg); mg.connect(o.frequency); o.connect(g); env(g.gain, t, .002, v * .22, Math.max(.6, d * 1.5)); }
      else if (preset === 'brass') { const o = osc(ctx, 'sawtooth', f, t, end), o2 = osc(ctx, 'sawtooth', f * 1.004, t, end), lp = filt(ctx, 'lowpass', 900, 2); lp.frequency.setValueAtTime(600, t); lp.frequency.linearRampToValueAtTime(2600, t + .07); lp.frequency.setTargetAtTime(1500, t + .08, .2); o.connect(lp); o2.connect(lp); lp.connect(g); env(g.gain, t, .04, v * .16, d, .8, .08); }
      else { const o = osc(ctx, 'sawtooth', f, t, end), o2 = osc(ctx, 'square', f / 2, t, end), lp = filt(ctx, 'lowpass', 2800, 3), g2 = ctx.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(lp); o.connect(lp); lp.connect(g); env(g.gain, t, .006, v * .18, d, .75, .06); }
    }
  }
  // ---------- Klänge vorab „einbacken“ (Sampler): jeder Klang wird einmal synthetisiert und danach nur noch abgespielt ----------
  // Das macht Wiedergabe und Export viel schneller (eine Puffer-Quelle je Note statt vieler Oszillatoren/Filter).
  const SR = 44100, BAKED = new Map(), BAKING = new Map();
  const DECAY = { pluck: 1, piano: 1, guitar: 1, stab: 1, bell: 1 };   // klingen von selbst aus
  const RANGE = { bass: [30, 60], chords: [42, 78], lead: [54, 90] };
  async function bakeOne(len, f) { const ctx = new OAC(1, Math.ceil(SR * len), SR); f(ctx, ctx.destination); const b = await ctx.startRendering(), d = b.getChannelData(0);
    let n = d.length; while (n > 64 && Math.abs(d[n - 1]) < 2e-4) n--;   // Stille am Ende abschneiden: weniger gleichzeitige Stimmen
    if (n >= d.length - 64) return b; const out = ctx.createBuffer(1, n, SR); out.copyToChannel(d.subarray(0, n), 0); return out; }
  function bake(kind, preset) {   // kind: drums | bass | chords | lead
    const key = kind + ':' + preset; if (BAKED.has(key)) return Promise.resolve(BAKED.get(key)); if (BAKING.has(key)) return BAKING.get(key);
    const pr = (async () => { let set;
      if (!OAC) return null;
      if (kind === 'drums') { set = {}; for (const [k] of C.DRUMS) set[k] = await bakeOne(k === 'crash' ? 2 : k === 'kick' ? 1 : .6, (ctx, out) => drum(ctx, out, k, .005, 1, preset)); }
      else { set = []; const [a, b] = RANGE[kind], hold = DECAY[preset] ? 2.6 : 6;
        for (let m = a; m <= b; m += 6) set.push({ m, buf: await bakeOne(hold + .6, (ctx, out) => tone(ctx, out, kind, preset, m, .005, hold, 1)) }); }
      BAKED.set(key, set); BAKING.delete(key); return set; })();
    BAKING.set(key, pr); return pr;
  }
  const ready = song => Promise.all([bake('drums', song.mix.drums.preset), bake('bass', song.mix.bass.preset), bake('chords', song.mix.chords.preset), bake('lead', song.mix.lead.preset)]).catch(() => null);
  function play(g, song, e, t) {
    const out = g.tr[e.tr].in, ctx = g.ctx, kind = e.tr, preset = song.mix[kind].preset, set = BAKED.get(kind + ':' + preset);
    if (!set) { if (kind === 'drums') drum(ctx, out, e.drum, t, e.v, preset); else tone(ctx, out, kind, preset, e.m, t, e.d, e.v); return; }   // noch nicht gebacken: direkt synthetisieren
    const src = ctx.createBufferSource(), gn = ctx.createGain(); src.connect(gn); gn.connect(out);
    if (kind === 'drums') { src.buffer = set[e.drum]; gn.gain.value = e.v; src.start(t); return; }
    let z = set[0]; for (const x of set) if (Math.abs(x.m - e.m) < Math.abs(z.m - e.m)) z = x;
    src.buffer = z.buf; src.playbackRate.value = Math.pow(2, (e.m - z.m) / 12);
    const rel = kind === 'chords' && preset === 'pad' ? .3 : .07, end = t + e.d;
    gn.gain.setValueAtTime(e.v, t); if (!DECAY[preset] || kind === 'bass') gn.gain.setTargetAtTime(0, end, rel); else gn.gain.setTargetAtTime(0, Math.max(end, t + .25), .25);
    src.start(t); src.stop(end + rel * 6 + .3);
  }

  // ---------- Echtzeit-Wiedergabe ----------
  // mode: 'song' (Arrangement ab Block from) oder 'pat' (Abschnitt sec in Schleife). Wird taktweise mit Vorlauf geplant, Änderungen sind ab dem nächsten Takt hörbar.
  const P = { ctx: null, g: null, on: false, onTick: null, onEnd: null };
  function ctxGet() { if (!AC) return null; if (!P.ctx) P.ctx = new AC({ latencyHint: 'interactive' }); if (P.ctx.state === 'suspended') P.ctx.resume().catch(() => { }); return P.ctx; }
  P.start = function (song, opt) {
    P.stop(); ready(song); const ctx = ctxGet(); if (!ctx) return false; opt = opt || {};
    P.song = song; P.mode = opt.mode || 'song'; P.sec = opt.sec; P.from = opt.from || 0; P.voxBufs = opt.vox || {};
    P.g = build(ctx, song); P.t0 = ctx.currentTime + .08; P.on = true; P.cursor = { block: P.from, rep: 0, bar: 0, t: P.t0 }; P.click = !!opt.click;
    P.timer = setInterval(sched, 25); sched(); return true;
  };
  function sched() {
    if (!P.on) return; const ctx = P.ctx, song = P.song, bar = C.barSec(song), ahead = ctx.currentTime + .25;
    while (P.cursor.t < ahead) {
      const c = P.cursor; let sec, blockIdx = c.block;
      if (P.mode === 'pat') sec = P.sec; else { const b = song.arr[c.block]; if (!b) { const endAt = c.t; setTimeout(() => { if (P.on && P.ctx.currentTime >= endAt - .05) { P.stop(); if (P.onEnd) P.onEnd(); } }, Math.max(0, (endAt - ctx.currentTime) * 1000 + 60)); P.cursor.t = 1e12; return; } sec = b.sec; }
      if (c.bar === 0 && c.rep === 0 && P.mode === 'song') { const buf = P.voxBufs[blockIdx]; if (buf && C.audible(song, 'vox')) { const s = ctx.createBufferSource(); s.buffer = buf; s.connect(P.g.voxIn); s.start(Math.max(c.t, ctx.currentTime)); } }
      if (P.click) { for (let i = 0; i < 4; i++) { const o = osc(ctx, 'square', i ? 1000 : 1500, c.t + i * bar / 4, .03), gg = ctx.createGain(); env(gg.gain, c.t + i * bar / 4, .001, .12, .03); o.connect(gg); gg.connect(P.g.master); } }
      C.patEvents(song, sec).forEach(e => { const st = e.t - c.bar * bar; if (st >= -1e-6 && st < bar - 1e-6 && C.audible(song, e.tr)) play(P.g, song, e, c.t + st); });
      c.t += bar; c.bar++;
      if (c.bar >= C.BARS) { c.bar = 0; c.rep++; const reps = P.mode === 'pat' ? 1 : ((song.arr[c.block] || {}).rep || 1); if (c.rep >= reps) { c.rep = 0; if (P.mode !== 'pat') c.block++; } }
    }
  }
  P.stop = function () { if (!P.on && !P.g) return; P.on = false; clearInterval(P.timer); const g = P.g; P.g = null; if (g) { const now = g.ctx.currentTime; g.master.gain.cancelScheduledValues(now); g.master.gain.setTargetAtTime(0, now, .015); setTimeout(() => { try { g.comp.disconnect(); } catch (e) { /* weg */ } }, 120); } };
  // Spielposition: Sekunden seit Start (Song-Zeit ab Block from) bzw. Position im Abschnitt
  P.pos = function () { if (!P.on) return 0; const t = P.ctx.currentTime - P.t0; return P.mode === 'pat' ? ((t % C.patSec(P.song)) + C.patSec(P.song)) % C.patSec(P.song) : C.blockStart(P.song, P.from) + t; };
  P.update = function (song) { if (P.g) apply(P.g, song); };
  // einzelner Klang zum Vorhören (Klick ins Raster)
  P.preview = function (song, e) { const ctx = ctxGet(); if (!ctx) return; if (!P.pg || P.pg.song !== song) { P.pg = build(ctx, song); P.pg.song = song; } apply(P.pg, song); play(P.pg, song, Object.assign({ v: .9, d: .3 }, e), ctx.currentTime + .01); };

  // ---------- Export: ganzer Song oder einzelne Spur, offline gerechnet ----------
  async function render(song, opt) {
    opt = opt || {}; if (!OAC) throw new Error('Kein Offline-Audio');
    await ready(song); const sr = 44100, dur = C.songSec(song) + 2.5, ctx = new OAC(2, Math.ceil(sr * dur), sr);
    let s = song; if (opt.only) { s = JSON.parse(JSON.stringify(song)); C.TRACKS.forEach(k => { s.mix[k].solo = k === opt.only ? 1 : 0; s.mix[k].mute = 0; }); }
    const g = build(ctx, s); const t0 = .05;
    // Noten abschnittsweise anlegen (suspend/resume): sonst existieren alle Tausende Knoten über die ganze Rechenzeit und bremsen
    const evs = C.events(s).filter(e => C.audible(s, e.tr)); let idx = 0; const CH = 1.5, q = 128 / sr;
    const upTo = tEnd => { while (idx < evs.length && t0 + evs[idx].t < tEnd) { play(g, s, evs[idx], t0 + evs[idx].t); idx++; } };
    upTo(CH + .2); if (ctx.suspend) for (let k = 1; k * CH < dur - .2; k++) { const at = Math.round(k * CH / q) * q; ctx.suspend(at).then(() => { upTo(at + CH + .2); if (opt.onProgress) opt.onProgress(at / dur); ctx.resume(); }); } else upTo(1e9);
    if (C.audible(s, 'vox') && opt.vox) for (const k of Object.keys(opt.vox)) { const ab = opt.vox[k]; if (!ab || +k >= s.arr.length) continue; try { const buf = await ctx.decodeAudioData(ab.slice(0)); const src = ctx.createBufferSource(); src.buffer = buf; src.connect(g.voxIn); src.start(t0 + C.blockStart(s, +k)); } catch (e) { /* defekte Aufnahme überspringen */ } }
    const out = await ctx.startRendering(); const ch = [out.getChannelData(0), out.getChannelData(1)];
    let peak = 0; for (const c of ch) for (let i = 0; i < c.length; i += 3) { const a = Math.abs(c[i]); if (a > peak) peak = a; }
    if (peak > .97) { const k = .97 / peak; ch.forEach(c => { for (let i = 0; i < c.length; i++) c[i] *= k; }); }
    // Ende: Stille kürzen (max. 2,5 s Ausklang)
    return { ch, sr, peak, wav: () => C.wav(ch, sr) };
  }

  // ---------- Gesang aufnehmen (Mikrofon, nur auf diesem Gerät) ----------
  const Rec = { stream: null, rec: null, chunks: [] };
  Rec.open = async function (hp) { if (Rec.stream) return Rec.stream; Rec.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !hp, noiseSuppression: !hp, autoGainControl: true } }); return Rec.stream; };
  Rec.start = function () { const T = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)); Rec.chunks = []; Rec.rec = new MediaRecorder(Rec.stream, T ? { mimeType: T } : undefined); Rec.rec.ondataavailable = e => { if (e.data && e.data.size) Rec.chunks.push(e.data); }; Rec.rec.start(200); Rec.t0 = performance.now(); };
  Rec.stop = function () { return new Promise(res => { if (!Rec.rec || Rec.rec.state === 'inactive') return res(null); Rec.rec.onstop = () => res(new Blob(Rec.chunks, { type: Rec.rec.mimeType || 'audio/webm' })); Rec.rec.stop(); }); };
  Rec.close = function () { if (Rec.stream) Rec.stream.getTracks().forEach(t => t.stop()); Rec.stream = null; };
  // Aufnahme → WAV-Puffer (für Speicher und Export), Anfang um die Latenz gekürzt
  async function toBuffer(blob, skip) { const ctx = ctxGet(); const ab = await blob.arrayBuffer(); const buf = await ctx.decodeAudioData(ab); const from = Math.min(buf.length - 1, Math.floor(Math.max(0, skip || 0) * buf.sampleRate)); const n = buf.length - from;
    const ch = [buf.getChannelData(0).slice(from, from + n)]; return { buf: (() => { const b = ctx.createBuffer(1, n, buf.sampleRate); b.copyToChannel(ch[0], 0); return b; })(), wav: C.wav(ch, buf.sampleRate) }; }
  async function decode(ab) { const ctx = ctxGet(); return ctx.decodeAudioData(ab.slice(0)); }

  // ---------- Speicher für Gesangsaufnahmen (IndexedDB) ----------
  const DB = { db: null };
  DB.open = () => DB.db ? Promise.resolve(DB.db) : new Promise((res, rej) => { try { const r = indexedDB.open('beat-studio', 1); r.onupgradeneeded = () => r.result.createObjectStore('vox'); r.onsuccess = () => { DB.db = r.result; res(DB.db); }; r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
  DB.put = (k, v) => DB.open().then(db => new Promise((res, rej) => { const t = db.transaction('vox', 'readwrite'); t.objectStore('vox').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }));
  DB.get = k => DB.open().then(db => new Promise(res => { const r = db.transaction('vox').objectStore('vox').get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); })).catch(() => null);
  DB.del = k => DB.open().then(db => new Promise(res => { const t = db.transaction('vox', 'readwrite'); t.objectStore('vox').delete(k); t.oncomplete = () => res(); t.onerror = () => res(); })).catch(() => { });

  window.BSEngine = { P, render, ready, Rec, toBuffer, decode, DB, VOXFX, ctx: ctxGet, ok: !!AC };
})();
