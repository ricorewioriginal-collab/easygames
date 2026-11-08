/* Beat-Studio · Recording-Suite (Studio-Bereich „🎙️ Recording“, Logik ohne Oberfläche in rec-core.js = BSRec):
 * Mehrspur-Aufnahme über den Song: Gesangs-/Audiospuren mit Takes und Comping (oberster Take klingt), Punch-In, Schleifen-Aufnahme
 * (jeder Durchlauf ein Take), Vorzähler, Metronom, Audio-Import; Zeitleiste mit Wellenform, Verschieben, Trimmen, Teilen, Raster, Zoom.
 * Instrumentspuren (Bildschirm-Klavier, Computertastatur, MIDI-Keyboard, MIDI-Datei rein/raus, Quantisieren).
 * Effekte je Spur (Trittschall, 4-Band-EQ, Höhenfilter, De-Esser, Kompressor, Sättigung, Doppler, Rausch-Gate, Autotune, Hall, Echo),
 * Summe (Beat-Lautstärke, Lautheitsziel, Limiter), Songtext-Teleprompter mit Antipp-Synchronisierung, Gesangs-Coach, Stimmgerät,
 * Latenz-Messung, Mikrofon-/Ausgabewahl, Mithören. Aufnahmen liegen im Gerätespeicher (IndexedDB, wie der Gesang-Reiter).
 * Wiedergabe und Export bauen denselben Audio-Weg (E.P.hook live, extra() im OfflineAudioContext). */
(function () {
  'use strict';
  const C = BSCore, R = BSRec, E = BSEngine, P = E.P, X = () => window.BSApp.rec, Sg = () => window.BSApp.S;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => { s = Math.max(0, s || 0); const m = Math.floor(s / 60), x = s - m * 60; return m + ':' + (x < 10 ? '0' : '') + x.toFixed(1); };
  const clamp = R.clamp, SL = .012;   // Laufzeit der Kanalzug-Kompressoren (Vorausschau) – Aufnahmespuren starten so viel früher
  const DEVK = 'beat-studio-recdev', DEV = Object.assign({ mic: '', out: '', stereo: 0, gain: 1, mon: 0 }, (() => { try { return JSON.parse(localStorage.getItem(DEVK)) || {}; } catch (e) { return {}; } })());
  const saveDev = () => { try { localStorage.setItem(DEVK, JSON.stringify(DEV)); } catch (e) { /* privat */ } };
  const st = { song: '', sel: '', selTake: '', cursor: 0, zoom: 24, sx: 0, panel: 'spur', bufs: new Map(), proc: new Map(), busy: new Set(), live: null, recing: null, mic: null, mon: null,
    kb: false, oct: 4, held: new Map(), midi: null, sync: -1, el: null, coach: null, pbuf: null, phRaf: 0 };
  const rec = () => { const S = Sg(); if (!S.rec) S.rec = R.newRec(); return S.rec; };
  const trk = id => rec().tracks.find(t => t.id === id), selTrack = () => trk(st.sel) || null;
  const edit = (fn, opt) => window.BSApp.edit(fn, opt), toast = (m, ms) => X().toast(m, ms), rr = () => { if (st.el && st.el.isConnected) render(st.el); };
  const step16 = S => 15 / S.bpm, snap = t => { const S = Sg(), q = step16(S); return rec().snap ? Math.round(t / q) * q : t; };
  const on = c => c ? ' on' : '';
  const maxOrder = t => t.takes.reduce((m, k) => Math.max(m, k.order), -1);

  /* ---------- Aufnahmen laden, Gate/Autotune vorab rechnen ---------- */
  async function loadBuf(S, src) { const k = S.id + ':' + src; if (st.bufs.has(k)) return st.bufs.get(k); const ab = await E.DB.get(k); if (!ab) return null; try { const b = await E.decode(ab); st.bufs.set(k, b); return b; } catch (e) { return null; } }
  function reset(S) { if (st.song !== S.id) { st.bufs.clear(); st.proc.clear(); st.song = S.id; st.cursor = 0; st.sel = ''; st.selTake = ''; st.coach = null; st.sx = 0; } }
  async function loadAll(S) { if (!S || !S.rec || !E.ok) return; reset(S); for (const src of R.takeIds(S.rec)) await loadBuf(S, src); await procAll(S);
    S.rec.tracks.forEach(t => { if (t.kind === 'inst') { const [k, p] = t.preset.split(':'); E.bake(k, p); } }); }
  const pkey = (S, t, k) => S.id + ':' + k.src + ':' + t.fx.gate + ':' + t.fx.tune + ':' + S.key + S.scale;
  function bufFor(S, t, k) { const raw = st.bufs.get(S.id + ':' + k.src); if (!raw || !(t.fx.gate || t.fx.tune)) return raw || null; return st.proc.get(pkey(S, t, k)) || raw; }
  async function procAll(S) {
    for (const t of S.rec.tracks) { if (t.kind !== 'audio' || !(t.fx.gate || t.fx.tune)) continue;
      for (const k of t.takes) { const key = pkey(S, t, k), raw = st.bufs.get(S.id + ':' + k.src); if (!raw || st.proc.has(key) || st.busy.has(key)) continue;
        st.busy.add(key); await new Promise(r => setTimeout(r, 0));
        try { const pcs = R.scalePcs(S.key, S.scale), out = E.ctx().createBuffer(raw.numberOfChannels, raw.length, raw.sampleRate);
          for (let c = 0; c < raw.numberOfChannels; c++) { let d = raw.getChannelData(c); if (t.fx.gate) d = R.gate(d, raw.sampleRate, t.fx.gate); if (t.fx.tune) d = R.autotune(d, raw.sampleRate, pcs, t.fx.tune); out.copyToChannel(d, c); }
          for (const x of [...st.proc.keys()]) if (x.startsWith(S.id + ':' + k.src + ':')) st.proc.delete(x); st.proc.set(key, out); } catch (e) { /* unbearbeitet abspielen */ }
        st.busy.delete(key); } }
  }
  let procT = 0; const procLater = () => { clearTimeout(procT); procT = setTimeout(() => procAll(Sg()), 500); };

  /* ---------- Kanalzug je Spur + Effektwege (Hall, Echo) ---------- */
  function mkBus(ctx, dest, S) {
    const r = S.rec, rev = ctx.createConvolver(), rg = ctx.createGain(); rev.buffer = E.ir(ctx); rg.gain.value = .8; rev.connect(rg); rg.connect(dest);
    const dl = ctx.createDelay(3), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), eg = ctx.createGain(); dl.delayTime.value = R.delayTime(S.bpm, r.echoNote); fb.gain.value = r.echoFb; lp.type = 'lowpass'; lp.frequency.value = 4500; eg.gain.value = .7;
    dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(eg); eg.connect(dest);
    return { rev, echo: dl, set(S2) { const n = ctx.currentTime; dl.delayTime.setTargetAtTime(R.delayTime(S2.bpm, S2.rec.echoNote), n, .05); fb.gain.setTargetAtTime(S2.rec.echoFb, n, .05); }, kill() { try { rg.disconnect(); eg.disconnect(); } catch (e) { /* weg */ } } };
  }
  function mkStrip(ctx, bus, dest) {
    const G = v => { const n = ctx.createGain(); n.gain.value = v; return n; }, F = (type, f, q) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; };
    const s = { in: G(1), hp: F('highpass', 10, .7), ls: F('lowshelf', 120), p1: F('peaking', 400, .9), p2: F('peaking', 3000, .9), hs: F('highshelf', 8000), lp: F('lowpass', 20000, .7),
      xl1: F('lowpass', 6500, .7071), xl2: F('lowpass', 6500, .7071), xh1: F('highpass', 6500, .7071), xh2: F('highpass', 6500, .7071), dl: ctx.createDynamicsCompressor(), ds: ctx.createDynamicsCompressor(), xs: G(1),
      comp: ctx.createDynamicsCompressor(), mk: G(1), dry: G(1), wet: G(0), sh: ctx.createWaveShaper(), post: G(1), d1: ctx.createDelay(.1), d2: ctx.createDelay(.1), dg: G(0), vol: G(1),
      pan: ctx.createStereoPanner ? ctx.createStereoPanner() : G(1), pl: ctx.createStereoPanner ? ctx.createStereoPanner() : G(1), pr: ctx.createStereoPanner ? ctx.createStereoPanner() : G(1), rs: G(0), es: G(0), oscs: [], satK: -1 };
    const c = (a, b) => a.connect(b);
    c(s.in, s.hp); c(s.hp, s.ls); c(s.ls, s.p1); c(s.p1, s.p2); c(s.p2, s.hs); c(s.hs, s.lp);
    // De-Esser: Linkwitz-Riley-Weiche bei 6,5 kHz, nur das obere Band wird komprimiert (beide Bänder gleich verzögert → kein Kammfilter)
    c(s.lp, s.xl1); c(s.xl1, s.xl2); c(s.xl2, s.dl); c(s.dl, s.xs); c(s.lp, s.xh1); c(s.xh1, s.xh2); c(s.xh2, s.ds); c(s.ds, s.xs);
    s.dl.threshold.value = 0; s.dl.ratio.value = 1; s.dl.knee.value = 0;
    c(s.xs, s.comp); c(s.comp, s.mk); c(s.mk, s.dry); c(s.mk, s.sh); c(s.sh, s.wet); c(s.dry, s.post); c(s.wet, s.post);
    c(s.post, s.vol); c(s.vol, s.pan); c(s.pan, dest); c(s.vol, s.rs); c(s.rs, bus.rev); c(s.vol, s.es); c(s.es, bus.echo);
    // Doppler: zwei kurz verzögerte, leicht schwankende Kopien links und rechts
    c(s.post, s.d1); c(s.post, s.d2); c(s.d1, s.pl); c(s.d2, s.pr); c(s.pl, s.dg); c(s.pr, s.dg); c(s.dg, dest); if (s.pl.pan) { s.pl.pan.value = -.7; s.pr.pan.value = .7; }
    s.d1.delayTime.value = .017; s.d2.delayTime.value = .026;
    [[s.d1, .37], [s.d2, .53]].forEach(([d, f]) => { const o = ctx.createOscillator(), og = G(.0016); o.frequency.value = f; c(o, og); c(og, d.delayTime); o.start(); s.oscs.push(o); });
    s.set = (t, aud) => {
      const f = t.fx, n = ctx.currentTime, T = (p, v) => p.setTargetAtTime(v, n, .02);
      T(s.hp.frequency, f.low > 0 ? f.low : 10); T(s.ls.gain, f.eqL); T(s.p1.gain, f.eqLM); T(s.p2.gain, f.eqHM); T(s.hs.gain, f.eqH); T(s.lp.frequency, Math.min(f.hicut, ctx.sampleRate / 2 - 200));
      s.ds.threshold.value = -12 - f.deess * 30; s.ds.ratio.value = 1 + f.deess * 11; s.ds.attack.value = .002; s.ds.release.value = .08; s.ds.knee.value = 3;
      s.comp.threshold.value = f.comp ? -8 - f.comp * 26 : 0; s.comp.ratio.value = 1 + f.comp * 5; s.comp.knee.value = 6; s.comp.attack.value = .006; s.comp.release.value = .16; T(s.mk.gain, Math.pow(10, f.comp * 8 / 20));
      if (s.satK !== f.sat) { s.satK = f.sat; const k = 1 + f.sat * 10, cv = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; cv[i] = Math.tanh(k * x) / Math.tanh(k); } s.sh.curve = cv; }
      T(s.wet.gain, f.sat * .8); T(s.dry.gain, 1 - f.sat * .5);
      const v = aud ? t.vol : 0; T(s.vol.gain, v); if (s.pan.pan) T(s.pan.pan, t.pan); T(s.dg.gain, f.dbl * .55 * v); T(s.rs.gain, f.rev); T(s.es.gain, f.echo * .8);
    };
    s.kill = () => { s.oscs.forEach(o => { try { o.stop(); } catch (e) { /* weg */ } }); try { s.pan.disconnect(); s.dg.disconnect(); s.rs.disconnect(); s.es.disconnect(); } catch (e) { /* weg */ } };
    return s;
  }

  /* ---------- Abspielen: live (mit dem Song) und offline (Export) ---------- */
  function build(ctx, dest, S, base, t0, offline, only) {
    const r = S.rec, L = { ctx, S, base, t0, bus: mkBus(ctx, dest, S), strips: new Map(), srcs: [], notes: [], timer: 0 };
    for (const t of r.tracks) {
      if (only && t.id !== only) continue; const s = mkStrip(ctx, L.bus, dest); s.set(t, only ? true : R.audibleTrack(r, t)); L.strips.set(t.id, s);
      if (t.kind === 'audio') { const tk = new Map(t.takes.map(k => [k.id, k])); for (const seg of R.compSegments(t.takes)) { const k = tk.get(seg.id), b = bufFor(S, t, k); if (b) schedSeg(L, s, b, k, seg); } }
      else L.notes.push({ t, s, i: -1 });
    }
    schedNotes(L, offline ? 1e9 : 1.2); if (!offline) L.timer = setInterval(() => schedNotes(L, 1.2), 60);
    return L;
  }
  function schedSeg(L, s, buf, k, seg) {
    const p0 = Math.max(seg.a, L.base); let off = seg.off + (p0 - seg.a), when = L.t0 + (p0 - L.base) - SL, dur = Math.min(seg.b - p0, buf.duration - off);
    const now = L.ctx.currentTime; if (when < now) { const late = now - when + .005; when += late; off += late; dur -= late; } if (!(dur > .012) || off >= buf.duration) return;
    const g = L.ctx.createGain(), src = L.ctx.createBufferSource(), f = Math.min(.004, dur / 3); src.buffer = buf; src.connect(g); g.connect(s.in);
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(k.gain, when + f); g.gain.setValueAtTime(k.gain, when + dur - f); g.gain.linearRampToValueAtTime(0, when + dur);
    src.start(when, off, dur + .01); L.srcs.push(src);
  }
  function schedNotes(L, ahead) {
    const spb = 60 / L.S.bpm, pos = L.base + (L.ctx.currentTime - L.t0);
    for (const n of L.notes) { const ns = n.t.notes, [kind, preset] = n.t.preset.split(':');
      if (n.i < 0) { n.i = 0; while (n.i < ns.length && ns[n.i][0] * spb < L.base - 1e-6) n.i++; }
      while (n.i < ns.length && ns[n.i][0] * spb < pos + ahead) { const [b, m, d, v] = ns[n.i++], when = L.t0 + (b * spb - L.base) - SL; if (when >= L.ctx.currentTime) E.note(L.ctx, n.s.in, kind, preset, m, when, d * spb, v); } }
  }
  function live(Pp) { stopLive(); const S = Sg(); if (!S || Pp.song !== S || !S.rec || !S.rec.tracks.length) return; st.live = build(Pp.ctx, Pp.g.master, S, Pp.base, Pp.t0, false); }
  function stopLive() { const L = st.live; if (!L) return; st.live = null; clearInterval(L.timer); L.srcs.forEach(s => { try { s.stop(); } catch (e) { /* weg */ } }); L.strips.forEach(s => s.kill()); L.bus.kill(); }
  function updLive() { const L = st.live, S = Sg(); if (!L || !S || L.S !== S) return; L.bus.set(S); S.rec.tracks.forEach(t => { const s = L.strips.get(t.id); if (s) s.set(t, R.audibleTrack(S.rec, t)); }); if (P.g) P.update(S); if (st.mon) st.mon.s.set(st.mon.t, true); }
  P.hook = live; const stop0 = P.stop; P.stop = function () { stopLive(); return stop0.apply(P, arguments); };
  // Export: Aufnahmespuren in den OfflineAudioContext (Einzelspur mit only = 'rec:<id>')
  async function extra(ctx, g, t0, s, opt) {
    if (!s.rec || !s.rec.tracks.length || (opt.only && !/^rec:/.test(opt.only))) return;
    await loadAll(s); for (const t of s.rec.tracks) if (t.kind === 'inst') { const [k, p] = t.preset.split(':'); await E.bake(k, p); }
    build(ctx, g.master, s, 0, t0, true, opt.only ? opt.only.slice(4) : null);
  }
  async function renderMix(S, opt) {
    opt = Object.assign({}, opt, { extra, dur: S.rec ? R.projectEnd(S.rec) : 0 }); const r = await E.render(S, opt);
    if (S.rec && S.rec.tracks.length && !opt.only && (S.rec.target || S.rec.lim)) r.master = R.master(r.ch, r.sr, { target: S.rec.target, lim: S.rec.lim });
    return r;
  }

  /* ---------- Mikrofon, Mithören, Aufnahme-Abgriff ---------- */
  async function openMic() {
    if (st.mic) return st.mic; const ctx = E.ctx(), SET = X().SET, c = { echoCancellation: !SET.hp, noiseSuppression: !SET.hp, autoGainControl: false, channelCount: DEV.stereo ? 2 : 1 };
    if (DEV.mic) c.deviceId = { exact: DEV.mic }; let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: c }); } catch (e) { if (!DEV.mic) throw e; DEV.mic = ''; saveDev(); delete c.deviceId; stream = await navigator.mediaDevices.getUserMedia({ audio: c }); }
    const src = ctx.createMediaStreamSource(stream), g = ctx.createGain(), an = ctx.createAnalyser(); g.gain.value = DEV.gain; an.fftSize = 2048; src.connect(g); g.connect(an);
    st.mic = { stream, src, g, an, ctx }; return st.mic;
  }
  function closeMic() { const m = st.mic; if (!m || st.recing) return; st.mic = null; monOff(); m.stream.getTracks().forEach(t => t.stop()); try { m.src.disconnect(); } catch (e) { /* weg */ } }
  function micErr() { X().overlay(`<h3>🎙️ Mikrofon gesperrt</h3><p>${/wv\)|RicoReWiApp|EasyGamesApp/i.test(navigator.userAgent) ? 'Erlaube das Mikrofon in den App-Berechtigungen und öffne das Spiel neu.' : 'Erlaube das Mikrofon im Browser (Schloss-Symbol neben der Adresse). Ist das Spiel eingebunden, öffne es direkt.'}</p><button class="btn nav" data-act="x">OK</button>`, { x: X().closeOv }); }
  function monOn(t) { monOff(); if (!st.mic || !t || t.kind !== 'audio') return; const ctx = st.mic.ctx, bus = mkBus(ctx, ctx.destination, Sg()), s = mkStrip(ctx, bus, ctx.destination); s.set(t, true); st.mic.g.connect(s.in); st.mon = { bus, s, t }; }
  function monOff() { const m = st.mon; if (!m) return; st.mon = null; try { st.mic && st.mic.g.disconnect(m.s.in); } catch (e) { /* weg */ } m.s.kill(); m.bus.kill(); }
  const wl = new WeakSet();
  async function capStart(ctx, input, stereo) {
    const cap = { chunks: [], ch: stereo ? 2 : 1, sr: ctx.sampleRate };
    if (ctx.audioWorklet && window.AudioWorkletNode) {
      try { if (!wl.has(ctx)) { await ctx.audioWorklet.addModule('js/rec-worklet.js'); wl.add(ctx); }
        const n = new AudioWorkletNode(ctx, 'bs-tap', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: cap.ch, channelCountMode: 'explicit' }), z = ctx.createGain(); z.gain.value = 0;
        n.port.onmessage = e => { if (e.data === 'end') { if (cap.done) cap.done(); return; } cap.chunks.push(e.data); };
        input.connect(n); n.connect(z); z.connect(ctx.destination);
        cap.stop = () => new Promise(res => { cap.done = res; n.port.postMessage('stop'); setTimeout(res, 600); }).then(() => { try { input.disconnect(n); n.disconnect(); z.disconnect(); } catch (e) { /* weg */ } });
        return cap; } catch (e) { /* ältere Browser: ScriptProcessor */ }
    }
    const sp = ctx.createScriptProcessor(4096, cap.ch, 1);
    sp.onaudioprocess = e => { const b = e.inputBuffer, d = []; for (let c = 0; c < cap.ch; c++) d.push(b.getChannelData(Math.min(c, b.numberOfChannels - 1)).slice()); cap.chunks.push({ f: Math.round((e.playbackTime - b.duration) * cap.sr), d }); };
    input.connect(sp); sp.connect(ctx.destination); cap.stop = async () => { try { input.disconnect(sp); sp.disconnect(); } catch (e) { /* weg */ } };
    return cap;
  }
  async function capCollect(cap) {
    await cap.stop(); if (!cap.chunks.length) return null; const f0 = cap.chunks[0].f, last = cap.chunks[cap.chunks.length - 1], n = last.f + last.d[0].length - f0, ch = last.d.length;
    if (!(n > 0) || n > cap.sr * 1800) return null; const chs = Array.from({ length: ch }, () => new Float32Array(n));
    for (const k of cap.chunks) { const o = k.f - f0; if (o < 0 || o >= n) continue; for (let c = 0; c < ch; c++) chs[c].set(k.d[Math.min(c, k.d.length - 1)].subarray(0, Math.min(k.d[0].length, n - o)), o); }
    return { chs, sr: cap.sr, f0 };
  }
  function pitchNow(an, sr) {
    const b = st.pbuf && st.pbuf.length === an.fftSize ? st.pbuf : (st.pbuf = new Float32Array(an.fftSize)); an.getFloatTimeDomainData(b);
    let pk = 0; for (let i = 0; i < b.length; i++) pk = Math.max(pk, Math.abs(b[i]));
    const f = 4, ds = new Float32Array(b.length / f); for (let i = 0; i < ds.length; i++) ds[i] = (b[i * f] + b[i * f + 1] + b[i * f + 2] + b[i * f + 3]) / 4;
    return { f: R.yin(ds, sr / f, { floor: 1e-4 }), pk };
  }
  function clicks(ctx, t0, n, beat) { for (let i = 0; i < n; i++) { const t = t0 + i * beat; if (t < ctx.currentTime) continue; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = i % 4 ? 1000 : 1500; g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.14, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + .04); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .05); } }

  /* ---------- Aufnehmen (Audio oder Noten) ---------- */
  async function startRec() {
    const S = Sg(); if (S.demo) return toast('Demo-Songs nehmen nicht auf – leg einen neuen Song an.'); if (!E.ok) return toast('Dieser Browser kann kein Web Audio.');
    const r = rec(); let t = r.tracks.find(x => x.arm) || selTrack();
    if (!t) { if (r.tracks.length >= R.MAX_TRACKS) return toast('Maximal ' + R.MAX_TRACKS + ' Spuren'); edit(() => { const n = R.newTrack('audio', r.tracks.length + 1); n.arm = 1; r.tracks.push(n); st.sel = n.id; }); t = trk(st.sel); }
    if (t.kind === 'audio' && t.takes.length >= R.MAX_TAKES) return toast('Diese Spur hat schon ' + R.MAX_TAKES + ' Takes – lösch alte oder nimm eine neue Spur.');
    X().stopAll(); const bar = C.barSec(S), cnt = r.count, range = r.b - r.a > .3; let at = st.cursor, delay = cnt * bar, mode = 'norm';
    if (r.loop && range) { mode = 'loop'; at = r.a; } else if (r.punch && range) { mode = 'punch'; at = Math.max(0, r.a - Math.max(1, cnt) * bar); delay = 0; }
    let mic = null; if (t.kind === 'audio') { try { mic = await openMic(); } catch (e) { micErr(); return; } }
    await loadAll(S); const ctx = E.ctx(), cap = mic ? await capStart(ctx, mic.g, DEV.stereo) : null; if (mic && DEV.mon) monOn(t);
    const vox = await X().voxBufs(0), go = (a, d) => { P.start(S, { mode: 'song', at: a, delay: d, click: !!r.metro, vox }); P.onEnd = null; };
    go(at, delay); if (delay) clicks(ctx, P.t0 - delay, cnt * 4, 60 / S.bpm);
    st.recing = { t, mode, cap, mic, go, passes: [{ t0: P.t0, base: P.base }], notes: [], lines: R.parseLyrics(r.lyrics), n: 0 };
    hud(t.kind === 'audio' ? '● REC' : '● Noten'); if (!mic) { const l = document.querySelector('#rcHud .lvl'); if (l) l.hidden = true; } tickRec();
  }
  function tickRec() {
    const Q = st.recing; if (!Q || Q.stopping) return; if (!P.on) { stopRec(); return; }
    const S = Sg(), r = S.rec, ctx = E.ctx(), now = ctx.currentTime, pos = P.pos();
    if (Q.mode === 'loop' && now > P.t0 && pos >= r.b - .12) { Q.go(r.a, Math.max(0, r.b - pos - .08)); Q.passes.push({ t0: P.t0, base: P.base }); }
    if (Q.mode === 'punch' && pos >= r.b + .25) { stopRec(); return; }
    const T = document.getElementById('hudT'); if (T) T.textContent = now < P.t0 ? '⏱️ ' + Math.ceil((P.t0 - now) / (60 / S.bpm)) : fmt(pos) + (Q.mode === 'loop' ? ' · Durchlauf ' + Q.passes.length : Q.mode === 'punch' ? (pos >= r.a && pos <= r.b ? ' · 🔴 Punch' : ' · Vorlauf') : '');
    if (Q.mic && (Q.n++ & 1) === 0) hudPitch(Q.mic, S); tele(Q.lines, pos); playhead(pos);
    requestAnimationFrame(tickRec);
  }
  async function stopRec() {
    const Q = st.recing; if (!Q || Q.stopping) return; Q.stopping = 1; st.held.forEach((h, m) => noteOff(m)); P.stop(); X().stopAll(); hudClose(); monOff();
    try {
      if (Q.cap) { const raw = await capCollect(Q.cap); st.recing = null; closeMic(); if (raw) await makeTakes(Q, raw); else toast('Nichts aufgenommen.'); }
      else { st.recing = null; if (Q.notes.length) { edit(() => { Q.t.notes = R.cleanNotes(Q.t.notes.concat(Q.notes)); }); toast('🎹 ' + Q.notes.length + ' Noten eingespielt'); } else rr(); }
    } catch (e) { st.recing = null; toast('Die Aufnahme konnte nicht gespeichert werden.'); }
  }
  async function makeTakes(Q, raw) {
    const S = Sg(), r = S.rec, t = Q.t, lat = (X().SET.lat || 0) / 1000, sr = raw.sr, n = raw.chs[0].length, idx = (ps, p) => Math.round((ps.t0 + (p - ps.base) + lat) * sr) - raw.f0, out = [];
    if (Q.mode === 'loop') { const L = r.b - r.a; Q.passes.forEach((ps, k) => { const i0 = idx(ps, r.a), i1 = Math.min(n, i0 + Math.round(L * sr)); if (i0 >= 0 && (i1 - i0) / sr >= .5) out.push({ start: r.a, trimA: 0, i0, i1, name: 'Durchlauf ' + (k + 1) }); }); }
    else { const ps = Q.passes[0]; let p0 = ps.base, i0 = idx(ps, p0); if (i0 < 0) { p0 -= i0 / sr; i0 = 0; } const full = (n - i0) / sr;
      if (Q.mode === 'punch') { const tr = Math.max(0, r.a - p0), len = Math.min(r.b - r.a, full - tr); if (len > .2) out.push({ start: r.a, trimA: tr, len, i0, i1: n, name: 'Punch' }); }
      else if (full > .3) out.push({ start: p0, trimA: 0, i0, i1: n, name: 'Take' }); }
    if (!out.length) return toast('Zu kurz – nichts aufgenommen.');
    const ctx = E.ctx(), made = [];
    for (const o of out.slice(0, R.MAX_TAKES - t.takes.length)) {
      const chs = raw.chs.map(c => c.slice(o.i0, o.i1)), src = R.uid('a'), b = ctx.createBuffer(chs.length, chs[0].length, sr); chs.forEach((c, i) => b.copyToChannel(c, i));
      await E.DB.put(S.id + ':' + src, C.wav(chs, sr).buffer); st.bufs.set(S.id + ':' + src, b); made.push(Object.assign(o, { src, full: chs[0].length / sr }));
    }
    edit(() => { let ord = maxOrder(t) + 1; made.forEach(o => { const k = R.cleanTake({ id: R.uid('k'), src: o.src, start: o.start, trimA: o.trimA, len: o.len != null ? o.len : o.full, full: o.full, enabled: 1, order: ord++, gain: 1, name: Q.mode === 'loop' ? o.name : o.name + ' ' + (t.takes.length + 1) }); t.takes.push(k); st.selTake = k.id; }); st.sel = t.id; });
    procLater(); toast(made.length > 1 ? '🎙️ ' + made.length + ' Takes aufgenommen – der letzte liegt oben.' : '🎙️ Aufgenommen! ▶ zum Anhören, Take ziehen zum Verschieben.', 3200);
  }

  /* ---------- Aufnahme-Leiste (Zeit, Pegel, Tonhöhe, Teleprompter) ---------- */
  function hud(label) { hudClose(); const d = document.createElement('div'); d.className = 'rcHud'; d.id = 'rcHud';
    d.innerHTML = `<b class="dot">${label}</b><span id="hudT">…</span><i class="lvl"><b id="hudL"></b></i><span id="hudP"></span><div class="tele" id="hudTele"></div><button class="btn red nav" id="hudStop">■ Stopp</button>`;
    document.body.appendChild(d); document.getElementById('hudStop').onclick = () => st.sync >= 0 ? syncEnd() : stopRec(); }
  function hudClose() { const d = document.getElementById('rcHud'); if (d) d.remove(); }
  function hudPitch(mic, S) { const { f, pk } = pitchNow(mic.an, mic.ctx.sampleRate), L = document.getElementById('hudL'), Pp = document.getElementById('hudP'); if (L) { L.style.width = Math.min(100, pk * 100) + '%'; L.classList.toggle('clip', pk > .97); }
    if (!Pp) return; if (!(f > 0)) { Pp.textContent = ''; return; } const m = R.midiOf(f), near = R.nearest(m, R.scalePcs(S.key, S.scale)), c = Math.round((m - near) * 100); Pp.textContent = R.noteName(near) + ' ' + (c > 0 ? '+' : '') + c + ' ¢'; Pp.className = Math.abs(c) <= 45 ? 'in' : 'out'; }
  function tele(lines, pos) { const el = document.getElementById('hudTele'); if (!el || !lines.length) return; const k = R.lineAt(rec().lyrT, pos), a = lines[Math.max(0, k)] || '', b = lines[k + 1] || '';
    const h = `<b>${esc(k < 0 ? '' : a)}</b><small>${esc(k < 0 ? a : b)}</small>`; if (el.dataset.h !== h) { el.dataset.h = h; el.innerHTML = h; } }
  function playhead(pos) { const ph = document.getElementById('rcPh'), sc = document.getElementById('rcScroll'); if (!ph) return; const x = pos * st.zoom; ph.style.left = x + 'px'; ph.hidden = false;
    if (sc && (x < sc.scrollLeft || x > sc.scrollLeft + sc.clientWidth - 40)) sc.scrollLeft = Math.max(0, x - 60); const pe = document.getElementById('rcPos'); if (pe) pe.textContent = fmt(pos); }
  function follow() { cancelAnimationFrame(st.phRaf); const f = () => { if (!P.on || !document.getElementById('rcPh')) { const ph = document.getElementById('rcPh'); if (ph) ph.hidden = true; setPlayBtn(); return; } if (!st.recing) playhead(P.pos()); if (st.sync >= 0) tele(R.parseLyrics(rec().lyrics), P.pos()); st.phRaf = requestAnimationFrame(f); }; f(); }
  const setPlayBtn = () => { const b = st.el && st.el.querySelector('[data-rc="play"]'); if (b) { b.textContent = P.on ? '■' : '▶'; b.classList.toggle('on', !!P.on); } };
  async function playAt(at) { const S = Sg(); await loadAll(S); await X().startAt(at); setPlayBtn(); follow(); }
  function togglePlay() { if (st.recing) return stopRec(); if (P.on) { X().stopAll(); if (st.sync >= 0) syncEnd(); setPlayBtn(); } else playAt(st.cursor); }

  /* ---------- Instrumente: Bildschirm-Klavier, Computertastatur, MIDI ---------- */
  const KEYS = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyZ: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16 };
  const instTrack = () => { const r = rec(), a = r.tracks.find(t => t.arm && t.kind === 'inst'); const s = selTrack(); return a || (s && s.kind === 'inst' ? s : null); };
  function noteOn(m, v) {
    const t = instTrack(); if (!t || !E.ok || st.held.has(m)) return; const ctx = E.ctx(), [kind, preset] = t.preset.split(':');
    const s = st.live && st.live.strips.get(t.id), out = s ? s.in : ctx.destination, h = E.note(ctx, out, kind, preset, m, ctx.currentTime, 0, v == null ? .85 : v);
    const Q = st.recing, b = Q && !Q.cap && P.on && ctx.currentTime >= P.t0 ? (P.pos() * Sg().bpm / 60) : null; st.held.set(m, { h, b, v: v == null ? .85 : v });
    const k = st.el && st.el.querySelector(`.pk[data-m="${m}"]`); if (k) k.classList.add('on');
  }
  function noteOff(m) {
    const x = st.held.get(m); if (!x) return; st.held.delete(m); const ctx = E.ctx(); x.h.stop(ctx.currentTime);
    const Q = st.recing; if (Q && !Q.cap && x.b != null && P.on) Q.notes.push([x.b, m, Math.max(.05, P.pos() * Sg().bpm / 60 - x.b), x.v]);
    const k = st.el && st.el.querySelector(`.pk[data-m="${m}"]`); if (k) k.classList.remove('on');
  }
  async function midiConnect() {
    if (!navigator.requestMIDIAccess) return toast('Dieser Browser kann kein MIDI (Chrome oder Edge nehmen).');
    try { const acc = st.midi || (st.midi = await navigator.requestMIDIAccess()); let n = 0;
      acc.inputs.forEach(i => { n++; i.onmidimessage = e => { const [s, a, b] = e.data, hi = s & 0xF0; if (hi === 0x90 && b > 0) noteOn(a, b / 127); else if (hi === 0x80 || (hi === 0x90 && b === 0)) noteOff(a); }; });
      acc.onstatechange = () => midiConnect(); toast(n ? '🎹 ' + n + ' MIDI-Gerät' + (n > 1 ? 'e' : '') + ' verbunden' : 'Kein MIDI-Keyboard gefunden – anstecken und nochmal tippen.');
    } catch (e) { toast('MIDI wurde nicht erlaubt.'); }
  }
  const active = () => { const A = window.BSApp; return A && A.rec && A.rec.scr() === 'sStudio' && A.rec.tab() === 'rec' && Sg(); };
  addEventListener('keydown', e => {
    if (!active()) return; const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type !== 'range' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); if (typing || X().ovOpen()) return;
    const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (e.code === 'Escape' && (st.recing || st.sync >= 0)) { stop(); st.recing ? stopRec() : syncEnd(); return; }
    if (e.code === 'Space') { stop(); togglePlay(); return; }
    if (st.sync >= 0 && e.code === 'Enter') { stop(); syncTap(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (st.kb && instTrack()) { if (e.code in KEYS) { stop(); if (!e.repeat) noteOn(12 * (st.oct + 1) + KEYS[e.code]); return; } if (e.code === 'KeyX' || e.code === 'KeyC') { stop(); st.oct = clamp(st.oct + (e.code === 'KeyX' ? 1 : -1), 1, 7); rr(); return; } }
    if (e.code === 'KeyR') { stop(); st.recing ? stopRec() : startRec(); return; }
    if ((e.code === 'Delete' || e.code === 'Backspace') && st.selTake) { stop(); delTake(); }
  }, true);
  addEventListener('keyup', e => { if (st.kb && e.code in KEYS) { noteOff(12 * (st.oct + 1) + KEYS[e.code]); } }, true);

  /* ---------- Takes ---------- */
  function selTakeObj() { const t = selTrack(); return t && t.takes.find(k => k.id === st.selTake); }
  function delTake() { const t = selTrack(), k = selTakeObj(); if (!k) return; edit(() => { t.takes = t.takes.filter(x => x !== k); }); st.selTake = ''; toast('🗑 Take gelöscht (↶ holt ihn zurück)'); }
  function splitTake() { const t = selTrack(), k = selTakeObj(), c = st.cursor; if (!k || !(c > k.start + .05 && c < k.start + k.len - .05)) return toast('Stell den Cursor (Lineal antippen) in den Take, dann teilen.');
    edit(() => { const b = R.cleanTake(Object.assign({}, k, { id: R.uid('k'), start: c, trimA: k.trimA + (c - k.start), len: k.start + k.len - c, name: k.name + ' b' })); k.len = c - k.start; t.takes.push(b); }); }
  async function importAudio(f) {
    const S = Sg(); if (S.demo) return toast('Demo-Songs nehmen nichts auf – leg einen neuen Song an.'); if (!E.ok) return; if (f.size > 150e6) return toast('Die Datei ist zu groß (max. 150 MB).');
    toast('⏳ „' + f.name + '“ wird geladen …', 6000); let buf; try { buf = await E.ctx().decodeAudioData(await f.arrayBuffer()); } catch (e) { return toast('Diese Audiodatei kann der Browser nicht lesen.'); }
    if (buf.duration > 900) return toast('Maximal 15 Minuten je Datei.'); const chs = []; for (let c = 0; c < Math.min(2, buf.numberOfChannels); c++) chs.push(buf.getChannelData(c));
    const src = R.uid('a'); await E.DB.put(S.id + ':' + src, C.wav(chs, buf.sampleRate).buffer); st.bufs.set(S.id + ':' + src, buf); const name = f.name.replace(/\.[^.]+$/, '').slice(0, 30) || 'Import';
    edit(() => { const r = rec(); let t = selTrack(); if (!t || t.kind !== 'audio') { if (r.tracks.length >= R.MAX_TRACKS) return; t = R.newTrack('audio', r.tracks.length + 1); t.name = name; t.fx = R.cleanFx({}); r.tracks.push(t); }
      if (t.takes.length >= R.MAX_TAKES) return; const k = R.cleanTake({ id: R.uid('k'), src, start: st.cursor, len: buf.duration, full: buf.duration, trimA: 0, order: maxOrder(t) + 1, name }); t.takes.push(k); st.sel = t.id; st.selTake = k.id; });
    toast('📥 „' + name + '“ liegt ab ' + fmt(st.cursor) + ' auf der Spur.');
  }

  /* ---------- Darstellung ---------- */
  const FXS = [['low', 'Trittschall', 0, 300, 5, 'Hz'], ['eqL', 'Bass 120 Hz', -12, 12, .5, 'dB'], ['eqLM', 'Tiefmitten 400 Hz', -12, 12, .5, 'dB'], ['eqHM', 'Präsenz 3 kHz', -12, 12, .5, 'dB'], ['eqH', 'Höhen 8 kHz', -12, 12, .5, 'dB'],
    ['hicut', 'Höhenfilter', 2000, 20000, 100, 'Hz'], ['deess', 'De-Esser', 0, 1, .01, '%'], ['comp', 'Kompressor', 0, 1, .01, '%'], ['sat', 'Sättigung', 0, 1, .01, '%'], ['dbl', 'Doppler (breiter)', 0, 1, .01, '%'],
    ['gate', 'Rausch-Gate', 0, 1, .01, '%'], ['tune', 'Autotune (zur Tonart)', 0, 1, .01, '%'], ['rev', 'Hall', 0, 1, .01, '%'], ['echo', 'Echo', 0, 1, .01, '%']];
  const fxVal = (k, v, u) => u === '%' ? Math.round(v * 100) + ' %' : k === 'low' && !v ? 'aus' : k === 'hicut' && v >= 20000 ? 'aus' : (u === 'dB' && v > 0 ? '+' : '') + v + ' ' + u;
  const TARGETS = [[0, 'Aus'], [-9, 'Laut (Club) −9'], [-11, '−11'], [-14, 'Streaming −14'], [-16, 'Apple Music −16'], [-23, 'Rundfunk −23']];
  function render(el) {
    const S = Sg(); if (!S) return; st.el = el; reset(S); const r = rec(); if (!trk(st.sel)) st.sel = r.tracks[0] ? r.tracks[0].id : '';
    const end = Math.max(C.songSec(S), R.projectEnd(r), st.cursor) + 8; st.zoom = clamp(st.zoom, 6, Math.min(140, 30000 / end));
    const Z = st.zoom, W = Math.ceil(end * Z), bs = C.barSec(S), range = r.b - r.a > .05, every = bs * Z < 26 ? 4 : 1;
    const ruler = Array.from({ length: Math.ceil(end / bs) }, (_, k) => k % every ? '' : `<span style="left:${k * bs * Z}px">${k + 1}</span>`).join('');
    let t0 = 0; const songLane = S.arr.map(b => { const d = C.blockSec(S, b), h = `<i style="left:${t0 * Z}px;width:${d * Z - 2}px;--c:${C.SECS[b.sec].c}">${C.SECS[b.sec].n}</i>`; t0 += d; return h; }).join('');
    const lanes = r.tracks.map(t => `<div class="rcLane${on(t.id === st.sel)}${t.kind === 'inst' ? ' inst' : ''}" data-lane="${t.id}">${t.kind === 'audio'
      ? t.takes.map(k => `<button class="tk nav${k.id === st.selTake ? ' sel' : ''}${k.enabled ? '' : ' off'}" data-tk="${k.id}" style="left:${k.start * Z}px;width:${Math.max(6, k.len * Z)}px;z-index:${2 + k.order}" title="${esc(k.name)} · ${fmt(k.start)}–${fmt(k.start + k.len)}"><canvas width="${Math.min(4000, Math.max(8, Math.round(k.len * Z)))}" height="44"></canvas><span>${esc(k.name)}</span><i class="hl"></i><i class="hr"></i></button>`).join('')
      : `<canvas class="nl" data-nl="${t.id}" width="${Math.min(30000, W)}" height="52"></canvas>`}</div>`).join('') || `<div class="rcLane empty"><span>Noch keine Spur – tippe ＋🎤 Spur oder gleich ● Aufnahme.</span></div>`;
    const heads = r.tracks.map(t => `<div class="rcHead${on(t.id === st.sel)}"><button class="hn nav" data-sel="${t.id}" title="Spur wählen">${t.kind === 'inst' ? '🎹' : '🎤'} ${esc(t.name)}</button>
      <div class="ms"><button class="btn sm nav${t.arm ? ' red' : ''}" data-arm="${t.id}" title="Aufnahmebereit">●</button><button class="btn sm nav${t.mute ? ' red' : ''}" data-mute="${t.id}" title="Stumm">M</button><button class="btn sm nav${t.solo ? ' gold' : ''}" data-solo="${t.id}" title="Solo">S</button></div>
      <input type="range" class="nav" min="0" max="1.5" step="0.01" value="${t.vol}" data-tvol="${t.id}" aria-label="Lautstärke ${esc(t.name)}"></div>`).join('') || '<div class="rcHead"></div>';
    el.innerHTML = `<div class="rc">
      <div class="rcBar"><button class="btn sm red nav" data-rc="rec" title="Aufnehmen (R)">● Aufnahme</button><button class="btn sm play nav${on(P.on)}" data-rc="play" title="Ab Cursor abspielen (Leertaste)">${P.on ? '■' : '▶'}</button><button class="btn sm nav" data-rc="home" title="Cursor zum Anfang">⏮</button><span class="pos" id="rcPos">${fmt(st.cursor)}</span>
        <button class="chip nav${on(r.metro)}" data-rc="metro">🥁 Metronom</button><button class="chip nav" data-rc="count">⏱️ Vorzähler: ${r.count ? r.count + ' Takt' : 'aus'}</button>
        <button class="chip nav${on(r.punch)}" data-rc="punch" title="Nimmt nur im markierten Bereich auf, davor läuft der Song als Vorlauf">⤵️ Punch-In</button><button class="chip nav${on(r.loop)}" data-rc="loop" title="Bereich in Schleife – jeder Durchlauf wird ein eigener Take">🔁 Schleife</button>
        <button class="chip nav" data-rc="range" title="Den Abschnitt unter dem Cursor als Bereich markieren">📍 ${range ? 'Bereich ' + fmt(r.a) + '–' + fmt(r.b) : 'Bereich = Abschnitt'}</button>${range ? '<button class="chip nav" data-rc="rclr" title="Bereich aufheben">✕</button>' : ''}
        <button class="chip nav${on(r.snap)}" data-rc="snap" title="Takes rasten auf 16tel ein">🧲 Raster</button><button class="btn sm nav" data-rc="zo" aria-label="Kleiner zoomen">🔍−</button><button class="btn sm nav" data-rc="zi" aria-label="Größer zoomen">🔍＋</button></div>
      <div class="rcBar"><button class="btn sm nav" data-rc="addA">＋🎤 Spur</button><button class="btn sm nav" data-rc="addI">＋🎹 Spur</button><label class="btn sm nav" tabindex="0">📥 Audio laden<input type="file" id="rcImp" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" hidden></label>
        <button class="chip nav${on(DEV.mon)}" data-rc="mon" title="Mikrofon beim Aufnehmen mit Effekten hören – nur mit Kopfhörern">🎧 Mithören</button><button class="btn sm nav" data-rc="dev">🎚️ Geräte</button><button class="btn sm nav" data-rc="tuner">🎵 Stimmgerät</button><button class="btn sm nav" data-rc="lat">⏱️ Latenz messen</button></div>
      <div class="rcMain"><div class="rcHeads"><div class="rcHead ruler">Takt</div><div class="rcHead song"><b>🎼 Beat</b><div class="ms"><button class="btn sm nav${r.beatMute ? ' red' : ''}" data-rc="bmute" title="Beat stumm">M</button></div><input type="range" class="nav" min="0" max="1.5" step="0.01" value="${r.beat}" data-bvol="1" aria-label="Lautstärke Beat"></div>${heads}</div>
        <div class="rcScroll" id="rcScroll"><div class="rcCan" style="width:${W}px;--beat:${bs / 4 * Z}px;--bar:${bs * Z}px"><div class="rcRuler" id="rcRuler">${ruler}${range ? `<b class="rng" style="left:${r.a * Z}px;width:${(r.b - r.a) * Z}px"></b>` : ''}</div>
          <div class="rcLane song">${songLane}</div>${lanes}<i class="rcCur" style="left:${st.cursor * Z}px"></i><i class="rcPh" id="rcPh" hidden></i></div></div></div>
      <div class="chips rcTabs">${[['spur', '🎛️ Spur & Effekte'], ['takes', '🎞️ Takes'], ['text', '📝 Songtext'], ['sum', '🔊 Summe'], ['coach', '🎯 Coach']].map(([k, n]) => `<button class="chip nav${on(st.panel === k)}" data-pn="${k}">${n}</button>`).join('')}</div>
      <div class="rcPanel">${panel(S, r)}</div></div>`;
    bind(el, S, r); const sc = el.querySelector('#rcScroll'); sc.scrollLeft = st.sx; sc.onscroll = () => { st.sx = sc.scrollLeft; };
    draw(el, S); if (st.live) updLive(); if (P.on) follow();
    loadAll(S).then(() => { if (st.el === el && el.isConnected) draw(el, S); });
  }
  function panel(S, r) {
    const t = selTrack();
    if (st.panel === 'takes') { if (!t || t.kind !== 'audio') return '<p class="hint">Wähle links eine Gesangs- oder Audiospur.</p>'; const ks = t.takes.slice().sort((a, b) => b.order - a.order);
      return `<p class="hint">Liegen Takes übereinander, klingt der <b>oberste</b> (Comping) – „⬆ Oben“ holt einen Take nach oben. Am Rand ziehen = kürzen, in der Mitte ziehen = verschieben, Entf = löschen.</p>
        ${ks.length ? `<div class="tkList">${ks.map(k => `<div class="tkRow${k.id === st.selTake ? ' sel' : ''}"><button class="hn nav" data-pick="${k.id}">${k.enabled ? '🔊' : '🔇'} ${esc(k.name)}<small>${fmt(k.start)} · ${fmt(k.len)}</small></button>
          <button class="btn sm nav" data-kon="${k.id}">${k.enabled ? 'Aus' : 'An'}</button><button class="btn sm nav" data-ktop="${k.id}" title="Oben (hörbar)">⬆ Oben</button><button class="btn sm nav" data-kplay="${k.id}" aria-label="Anhören">▶</button>
          <label class="kg">Pegel<input type="range" class="nav" min="0" max="2" step="0.01" value="${k.gain}" data-kgain="${k.id}"></label><button class="btn sm nav" data-kwav="${k.id}" title="Als WAV speichern">⬇</button><button class="btn sm nav" data-kdel="${k.id}" aria-label="Löschen">🗑</button></div>`).join('')}</div>` : '<p class="hint">Noch keine Takes – ● Aufnahme oder 📥 Audio laden.</p>'}
        <div class="row"><button class="btn sm nav" data-rc="split">✂️ Am Cursor teilen</button><button class="btn sm nav" data-rc="kdup">⧉ Take duplizieren</button></div>`; }
    if (st.panel === 'text') { const L = R.parseLyrics(r.lyrics);
      return `<textarea class="field nav lyr" id="rcLyr" rows="6" maxlength="6000" placeholder="Songtext – eine Zeile pro Gesangszeile">${esc(r.lyrics)}</textarea>
        <div class="row"><button class="btn sm gold nav" data-rc="sync"${L.length ? '' : ' disabled'}>⏱️ Zeiten antippen (ab Cursor)</button><button class="btn sm nav" data-rc="syncClr">Zeiten löschen</button></div>
        <p class="hint">Antippen: Der Song läuft – tippe „Zeile ✓“ (oder Enter), genau wenn eine Zeile beginnt. Beim Aufnehmen läuft der Text dann als Teleprompter mit.</p>
        <ol class="lyrL">${L.map((l, i) => `<li><b>${r.lyrT[i] != null ? fmt(r.lyrT[i]) : '–'}</b> ${esc(l)}</li>`).join('')}</ol>`; }
    if (st.panel === 'sum') return `<div class="fxg">
        <label>🎼 Beat-Lautstärke <b>${Math.round(r.beat * 100)} %</b><input type="range" class="nav" min="0" max="1.5" step="0.01" value="${r.beat}" data-bvol="1"></label>
        <label>🔊 Master <b>${Math.round(S.mix.master.vol * 100)} %</b><input type="range" class="nav" min="0.2" max="1.2" step="0.01" value="${S.mix.master.vol}" data-mvol="1"></label>
        <label>🔁 Echo-Rückkopplung <b>${Math.round(r.echoFb * 100)} %</b><input type="range" class="nav" min="0" max="0.8" step="0.01" value="${r.echoFb}" data-efb="1"></label></div>
      <h4>Echo-Takt</h4><div class="chips">${['1/4', '1/8', '1/8d', '1/16', '1/4d', '1/2'].map(n => `<button class="chip nav${on(r.echoNote === n)}" data-enote="${n}">${n.replace('d', ' punktiert')}</button>`).join('')}</div>
      <h4>Lautheit beim Export (Mastering)</h4><div class="chips">${TARGETS.map(([v, n]) => `<button class="chip nav${on(r.target === v)}" data-tgt="${v}">${n}${v ? ' LUFS' : ''}</button>`).join('')}</div>
      <div class="chips"><button class="chip nav${on(r.lim)}" data-rc="lim">🧱 Limiter (Spitzen max. −1 dBFS)</button><button class="btn sm nav" data-rc="meas">📊 Lautheit messen</button><button class="btn sm gold nav" data-rc="exp">📤 Exportieren</button></div>
      <p class="hint" id="rcMeas">Gilt für den fertigen Song mit Aufnahmespuren (WAV-Export). Streaming-Dienste regeln auf etwa −14 LUFS.</p>`;
    if (st.panel === 'coach') { const k = selTakeObj(), c = st.coach && st.coach.id === (k && k.id) ? st.coach : null;
      return `<p class="hint">Der Gesangs-Coach prüft, wie genau ein Take die Töne der Tonart (${C.NOTE[S.key]}-${S.scale === 'moll' ? 'Moll' : 'Dur'}) trifft. Beim Aufnehmen zeigt die REC-Leiste den Ton live.</p>
        ${k ? `<div class="row"><button class="btn sm gold nav" data-rc="anal">🎯 „${esc(k.name)}“ prüfen</button><button class="btn sm nav" data-rc="tuner">🎵 Stimmgerät</button></div>` : '<p class="hint">Wähle einen Take (antippen) auf einer Gesangsspur.</p>'}
        ${c ? `<div class="coach"><b class="big">${c.score} %</b><span>getroffen · im Schnitt ${c.cents} Cent daneben · ${Math.round(c.voiced * 100)} % gesungen</span><p>${c.score >= 85 ? '🌟 Sehr sauber gesungen!' : c.score >= 65 ? '👍 Gut – an den roten Stellen noch üben oder Autotune leicht aufdrehen.' : '🎯 Noch wackelig – Stimmgerät nutzen, langsamer üben oder Autotune in den Effekten.'}</p><canvas id="rcCoach" width="900" height="160"></canvas></div>` : ''}`; }
    // Spur & Effekte
    if (!t) return '<p class="hint">Leg zuerst eine Spur an: ＋🎤 für Gesang/Audio, ＋🎹 für ein Instrument.</p>';
    const fx = FXS.filter(([k]) => t.kind === 'audio' || !['gate', 'tune', 'deess'].includes(k));
    return `<div class="row"><input class="field nav" id="rcName" maxlength="30" value="${esc(t.name)}" aria-label="Spurname"><button class="btn sm nav" data-rc="tup" aria-label="Spur nach oben">▲</button><button class="btn sm nav" data-rc="tdn" aria-label="Spur nach unten">▼</button><button class="btn sm nav" data-rc="tdel">🗑 Spur löschen</button></div>
      ${t.kind === 'inst' ? instPanel(S, t) : `<h4>Voreinstellungen</h4><div class="chips">${Object.keys(R.FX_PRESETS).map(k => `<button class="chip nav" data-fxp="${k}">${R.FX_PRESETS[k].n}</button>`).join('')}</div>`}
      <div class="fxg"><label>Lautstärke <b>${Math.round(t.vol * 100)} %</b><input type="range" class="nav" min="0" max="1.5" step="0.01" value="${t.vol}" data-tvol="${t.id}"></label><label>Panorama <b>${t.pan > 0 ? 'R ' : t.pan < 0 ? 'L ' : ''}${Math.round(Math.abs(t.pan) * 100)}</b><input type="range" class="nav" min="-1" max="1" step="0.05" value="${t.pan}" data-tpan="1"></label>
      ${fx.map(([k, n, a, b, s, u]) => `<label>${n} <b id="fxv-${k}">${fxVal(k, t.fx[k], u)}</b><input type="range" class="nav" min="${a}" max="${b}" step="${s}" value="${t.fx[k]}" data-fx="${k}"></label>`).join('')}</div>
      <p class="hint">Alle Effekte hörst du sofort, auch während der Song läuft. Rausch-Gate und Autotune werden kurz vorgerechnet.</p>`;
  }
  function instPanel(S, t) {
    const lo = 12 * (st.oct + 1), keys = []; for (let m = lo; m < lo + 25; m++) keys.push(m);
    const white = keys.filter(m => ![1, 3, 6, 8, 10].includes(m % 12)), wi = m => white.indexOf(m);
    return `<div class="row"><select class="nav" data-ipre="1" aria-label="Instrument">${R.INST.map(([v, n]) => `<option value="${v}"${t.preset === v ? ' selected' : ''}>${n}</option>`).join('')}</select>
        <button class="chip nav${st.kb ? ' on' : ''}" data-rc="kb" title="A W S E D F T G Z H U J K O L P – X/C = Oktave">⌨️ Computertastatur</button><button class="btn sm nav" data-rc="midi">🎹 MIDI-Keyboard</button>
        <button class="btn sm nav" data-rc="om" aria-label="Oktave tiefer">−</button><span class="lab">Oktave ${st.oct}</span><button class="btn sm nav" data-rc="op" aria-label="Oktave höher">＋</button></div>
      <div class="piano" style="--w:${white.length}">${white.map(m => `<button class="pk nav" data-m="${m}" aria-label="${R.noteName(m)}">${m % 12 === 0 ? R.noteName(m) : ''}</button>`).join('')}${keys.filter(m => [1, 3, 6, 8, 10].includes(m % 12)).map(m => `<button class="pk bk" data-m="${m}" style="--i:${wi(m - 1) + 1}" aria-label="${R.noteName(m)}"></button>`).join('')}</div>
      <div class="row"><span class="lab">${t.notes.length} Noten</span><button class="btn sm nav" data-q="2">Quantisieren 1/8</button><button class="btn sm nav" data-q="4">Quantisieren 1/16</button>
        <label class="btn sm nav" tabindex="0">📥 MIDI laden<input type="file" id="rcMidi" accept=".mid,.midi,audio/midi" hidden></label><button class="btn sm nav" data-rc="mexp"${t.notes.length ? '' : ' disabled'}>💾 MIDI speichern</button><button class="btn sm nav" data-rc="nclr"${t.notes.length ? '' : ' disabled'}>🧹 Noten löschen</button></div>
      <p class="hint">Spur mit ● scharf schalten, ● Aufnahme drücken und mitspielen – deine Noten landen auf der Spur (folgen dem Tempo). MIDI-Dateien kommen ab dem Cursor dazu.</p>`;
  }
  function draw(el, S) {
    const r = S.rec, Z = st.zoom;
    el.querySelectorAll('.rcLane[data-lane]').forEach(ln => { const t = trk(ln.dataset.lane); if (!t) return;
      if (t.kind === 'audio') ln.querySelectorAll('.tk').forEach(b => { const k = t.takes.find(x => x.id === b.dataset.tk), cv = b.querySelector('canvas'), buf = k && st.bufs.get(S.id + ':' + k.src); if (!buf) return;
        const sr = buf.sampleRate, d = buf.getChannelData(0).subarray(Math.floor(k.trimA * sr), Math.floor((k.trimA + k.len) * sr)), pk = R.peaks(d, cv.width), x = cv.getContext('2d'), h = cv.height, g = Math.max(1, k.gain);
        x.clearRect(0, 0, cv.width, h); x.fillStyle = k.enabled ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)'; for (let i = 0; i < cv.width; i++) { const a = clamp(pk[i * 2] * g, -1, 1), b2 = clamp(pk[i * 2 + 1] * g, -1, 1); x.fillRect(i, h / 2 - b2 * h / 2, 1, Math.max(1, (b2 - a) * h / 2)); } });
      else { const cv = ln.querySelector('canvas'), x = cv.getContext('2d'), ns = t.notes, spb = 60 / S.bpm; x.clearRect(0, 0, cv.width, cv.height); if (!ns.length) return;
        const lo = Math.min(...ns.map(n => n[1])) - 1, hi = Math.max(...ns.map(n => n[1])) + 1, hh = cv.height / Math.max(8, hi - lo + 1); x.fillStyle = '#ffcc3a';
        ns.forEach(([b, m, d]) => x.fillRect(b * spb * Z, cv.height - (m - lo + 1) * hh, Math.max(2, d * spb * Z - 1), Math.max(2, hh - 1))); } });
    const cc = el.querySelector('#rcCoach'); if (cc && st.coach) drawCoach(cc, S, st.coach); void r;
  }
  function drawCoach(cv, S, c) {
    const x = cv.getContext('2d'), w = cv.width, h = cv.height, f0 = c.f0, ms = Array.from(f0).filter(f => f > 0).map(R.midiOf); if (!ms.length) return;
    const lo = Math.floor(Math.min(...ms)) - 2, hi = Math.ceil(Math.max(...ms)) + 2, y = m => h - (m - lo) / (hi - lo) * h, pcs = R.scalePcs(S.key, S.scale);
    x.clearRect(0, 0, w, h); for (let m = lo; m <= hi; m++) if (pcs.includes(((m % 12) + 12) % 12)) { x.fillStyle = m % 12 === S.key ? 'rgba(255,204,58,.35)' : 'rgba(255,255,255,.12)'; x.fillRect(0, y(m), w, 1); if (m % 12 === S.key) { x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '11px sans-serif'; x.fillText(R.noteName(m), 2, y(m) - 2); } }
    for (let i = 0; i < f0.length; i++) { if (!(f0[i] > 0)) continue; const m = R.midiOf(f0[i]), off = Math.abs(m - R.nearest(m, pcs)) * 100; x.fillStyle = off <= 45 ? '#3ae07a' : off <= 80 ? '#ffcc3a' : '#ff4a5a'; x.fillRect(i / f0.length * w, y(m) - 1.5, Math.max(2, w / f0.length), 3); }
  }

  /* ---------- Bedienung ---------- */
  function bind(el, S, r) {
    const q = { quiet: true, noUndo: true }, A = sel => el.querySelectorAll(sel), one = (sel, f) => { const n = el.querySelector(sel); if (n) n.onclick = f; };
    const act = {
      rec: () => st.recing ? stopRec() : startRec(), play: togglePlay, home: () => { st.cursor = 0; st.sx = 0; if (P.on) playAt(0); rr(); },
      metro: () => edit(() => { r.metro = r.metro ? 0 : 1; }, { keep: true, noUndo: true }), count: () => edit(() => { r.count = (r.count + 1) % 3; }, { keep: true, noUndo: true }),
      punch: () => edit(() => { r.punch = r.punch ? 0 : 1; if (r.punch) r.loop = 0; }, { keep: true, noUndo: true }), loop: () => edit(() => { r.loop = r.loop ? 0 : 1; if (r.loop) r.punch = 0; }, { keep: true, noUndo: true }),
      range: () => { let t = 0; for (const b of S.arr) { const d = C.blockSec(S, b); if (st.cursor < t + d || b === S.arr[S.arr.length - 1]) { edit(() => { r.a = t; r.b = t + d; }, { keep: true, noUndo: true }); toast('📍 Bereich: ' + C.SECS[b.sec].n + ' (' + fmt(t) + '–' + fmt(t + d) + ')'); return; } t += d; } },
      rclr: () => edit(() => { r.a = 0; r.b = 0; r.punch = 0; r.loop = 0; }, { keep: true, noUndo: true }), snap: () => edit(() => { r.snap = r.snap ? 0 : 1; }, { keep: true, noUndo: true }),
      zo: () => zoom(1 / 1.5), zi: () => zoom(1.5),
      addA: () => addTrack('audio'), addI: () => addTrack('inst'), mon: () => { DEV.mon = DEV.mon ? 0 : 1; saveDev(); if (!DEV.mon) monOff(); toast(DEV.mon ? '🎧 Mithören an – bitte nur mit Kopfhörern (sonst pfeift es).' : '🎧 Mithören aus'); rr(); },
      dev: devices, tuner, lat: latency, bmute: () => edit(() => { r.beatMute = r.beatMute ? 0 : 1; }, { keep: true, noUndo: true }),
      split: splitTake, kdup: () => { const t = selTrack(), k = selTakeObj(); if (!k) return toast('Erst einen Take wählen.'); if (t.takes.length >= R.MAX_TAKES) return; edit(() => { const n = R.cleanTake(Object.assign({}, k, { id: R.uid('k'), start: k.start + k.len, order: maxOrder(t) + 1, name: k.name + ' Kopie' })); t.takes.push(n); st.selTake = n.id; }); },
      sync: syncStart, syncClr: () => edit(() => { r.lyrT = []; }), lim: () => edit(() => { r.lim = r.lim ? 0 : 1; }, { keep: true, noUndo: true }), exp: () => X().exportOv(), meas: measure, anal: analyze,
      tup: () => moveTrack(-1), tdn: () => moveTrack(1), tdel: delTrack, kb: () => { st.kb = !st.kb; if (st.kb) toast('⌨️ Tastatur spielt: A W S E D F T G Z H U J K O L P · X/C = Oktave'); rr(); },
      midi: midiConnect, om: () => { st.oct = clamp(st.oct - 1, 1, 7); rr(); }, op: () => { st.oct = clamp(st.oct + 1, 1, 7); rr(); },
      mexp: () => { const t = selTrack(); if (!t) return; X().download(X().fileName(S, '_' + t.name + '.mid'), R.midiWrite(t.notes, S.bpm, t.name), 'audio/midi'); toast('💾 MIDI-Datei gespeichert'); },
      nclr: () => { const t = selTrack(); edit(() => { t.notes = []; }); }
    };
    A('[data-rc]').forEach(b => { if (b.tagName === 'BUTTON') b.onclick = () => { const f = act[b.dataset.rc]; if (f) f(); }; });
    A('[data-pn]').forEach(b => b.onclick = () => { st.panel = b.dataset.pn; rr(); });
    A('[data-sel]').forEach(b => b.onclick = () => { if (st.sel !== b.dataset.sel) st.selTake = ''; st.sel = b.dataset.sel; rr(); });
    A('[data-arm]').forEach(b => b.onclick = () => edit(() => { const id = b.dataset.arm, was = trk(id).arm; r.tracks.forEach(t => { t.arm = 0; }); trk(id).arm = was ? 0 : 1; st.sel = id; }, { keep: true, noUndo: true }));
    A('[data-mute]').forEach(b => b.onclick = () => edit(() => { const t = trk(b.dataset.mute); t.mute = t.mute ? 0 : 1; }, { keep: true }));
    A('[data-solo]').forEach(b => b.onclick = () => edit(() => { const t = trk(b.dataset.solo); t.solo = t.solo ? 0 : 1; }, { keep: true }));
    const live1 = () => { edit(() => { }, q); updLive(); };
    A('[data-tvol]').forEach(i => i.oninput = () => { trk(i.dataset.tvol).vol = +i.value; A(`[data-tvol="${i.dataset.tvol}"]`).forEach(x => { if (x !== i) x.value = i.value; }); live1(); });
    A('[data-bvol]').forEach(i => i.oninput = () => { r.beat = +i.value; A('[data-bvol]').forEach(x => { if (x !== i) x.value = i.value; }); live1(); });
    A('[data-mvol]').forEach(i => i.oninput = () => { S.mix.master.vol = +i.value; live1(); });
    A('[data-efb]').forEach(i => i.oninput = () => { r.echoFb = +i.value; live1(); });
    A('[data-enote]').forEach(b => b.onclick = () => edit(() => { r.echoNote = b.dataset.enote; }, { keep: true, noUndo: true }));
    A('[data-tgt]').forEach(b => b.onclick = () => edit(() => { r.target = +b.dataset.tgt; }, { keep: true, noUndo: true }));
    const t = selTrack();
    A('[data-fx]').forEach(i => i.oninput = () => { const k = i.dataset.fx, d = FXS.find(x => x[0] === k); t.fx[k] = +i.value; const v = el.querySelector('#fxv-' + k); if (v) v.textContent = fxVal(k, t.fx[k], d[5]); live1(); if (k === 'gate' || k === 'tune') procLater(); });
    A('[data-tpan]').forEach(i => i.oninput = () => { t.pan = +i.value; live1(); });
    A('[data-fxp]').forEach(b => b.onclick = () => { edit(() => { t.fx = R.cleanFx(R.FX_PRESETS[b.dataset.fxp].fx); }, { keep: true }); procLater(); toast(R.FX_PRESETS[b.dataset.fxp].n + ' eingestellt'); });
    A('[data-ipre]').forEach(s => s.onchange = () => { edit(() => { t.preset = s.value; }, { keep: true }); const [k, p] = s.value.split(':'); E.bake(k, p); });
    A('[data-q]').forEach(b => b.onclick = () => edit(() => { t.notes = R.cleanNotes(R.quantize(t.notes, +b.dataset.q, 1)); }));
    const nm = el.querySelector('#rcName'); if (nm) { nm.oninput = () => { t.name = nm.value.slice(0, 30) || 'Spur'; edit(() => { }, q); }; nm.onchange = () => rr(); nm.onkeydown = e => { if (e.key === 'Enter') nm.blur(); }; }
    const ly = el.querySelector('#rcLyr'); if (ly) { ly.oninput = () => { r.lyrics = ly.value.slice(0, 6000); edit(() => { }, q); }; ly.onchange = () => rr(); }
    A('.pk').forEach(k => { k.onpointerdown = e => { e.preventDefault(); if (!instTrack()) return toast('Wähle oder schalte eine 🎹-Spur scharf.'); noteOn(+k.dataset.m); }; k.onpointerup = k.onpointerleave = k.onpointercancel = () => noteOff(+k.dataset.m); });
    // Takes-Liste
    A('[data-pick]').forEach(b => b.onclick = () => { st.selTake = b.dataset.pick; rr(); });
    A('[data-kon]').forEach(b => b.onclick = () => edit(() => { const k = t.takes.find(x => x.id === b.dataset.kon); k.enabled = k.enabled ? 0 : 1; }, { keep: true }));
    A('[data-ktop]').forEach(b => b.onclick = () => edit(() => { const k = t.takes.find(x => x.id === b.dataset.ktop); k.order = maxOrder(t) + 1; k.enabled = 1; st.selTake = k.id; }, { keep: true }));
    A('[data-kplay]').forEach(b => b.onclick = () => { const k = t.takes.find(x => x.id === b.dataset.kplay); st.cursor = k.start; st.selTake = k.id; X().stopAll(); playAt(k.start); rr(); });
    A('[data-kgain]').forEach(i => i.oninput = () => { t.takes.find(x => x.id === i.dataset.kgain).gain = +i.value; edit(() => { }, q); });
    A('[data-kgain]').forEach(i => i.onchange = () => rr());
    A('[data-kdel]').forEach(b => b.onclick = () => { st.selTake = b.dataset.kdel; delTake(); });
    A('[data-kwav]').forEach(b => b.onclick = async () => { const k = t.takes.find(x => x.id === b.dataset.kwav), ab = await E.DB.get(S.id + ':' + k.src); if (!ab) return toast('Aufnahme nicht gefunden.'); X().download(X().fileName(S, '_' + k.name + '.wav'), new Uint8Array(ab), 'audio/wav'); });
    // Dateien
    const imp = el.querySelector('#rcImp'); if (imp) imp.onchange = () => { const f = imp.files[0]; imp.value = ''; if (f) importAudio(f); };
    const mi = el.querySelector('#rcMidi'); if (mi) mi.onchange = async () => { const f = mi.files[0]; mi.value = ''; if (!f) return; try { const m = R.midiRead(await f.arrayBuffer()), off = st.cursor * S.bpm / 60;
      edit(() => { t.notes = R.cleanNotes(t.notes.concat(m.notes.map(n => [n[0] + off, n[1], n[2], n[3]]))); }); toast('📥 ' + m.notes.length + ' Noten geladen' + (m.bpm !== S.bpm ? ' (Datei: ' + m.bpm + ' BPM, passt sich deinem Tempo an)' : '')); } catch (e) { toast('Das ist keine lesbare MIDI-Datei.'); } };
    // Zeitleiste: Lineal = Cursor setzen (ziehen = Bereich), Spur antippen = Cursor + Spur wählen, Takes ziehen/kürzen
    const can = el.querySelector('.rcCan'), tAt = e => Math.max(0, (e.clientX - can.getBoundingClientRect().left) / st.zoom);
    const ru = el.querySelector('#rcRuler'); ru.onpointerdown = e => { e.preventDefault(); const a = tAt(e); let b = a, moved = false; ru.setPointerCapture(e.pointerId);
      ru.onpointermove = ev => { b = tAt(ev); if (Math.abs(b - a) * st.zoom > 5) moved = true; };
      ru.onpointerup = () => { ru.onpointermove = ru.onpointerup = null; if (moved) edit(() => { r.a = snap(Math.min(a, b)); r.b = snap(Math.max(a, b)); }, { keep: true, noUndo: true }); else setCursor(snap(a)); }; };
    A('.rcLane[data-lane]').forEach(ln => ln.onpointerdown = e => { if (e.target.closest('.tk')) return; st.sel = ln.dataset.lane; st.selTake = ''; setCursor(snap(tAt(e))); });
    A('.tk').forEach(b => b.onpointerdown = e => {
      if (e.button) return; e.preventDefault(); const tid = b.closest('[data-lane]').dataset.lane, tr = trk(tid), k = tr.takes.find(x => x.id === b.dataset.tk), rc = b.getBoundingClientRect(), x0 = e.clientX;
      const edge = Math.min(12, rc.width / 4), mode = x0 - rc.left < edge ? 'L' : rc.right - x0 < edge ? 'R' : 'M', o = { start: k.start, len: k.len, trimA: k.trimA }; let cur = o, moved = false;
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* alt */ }
      b.onpointermove = ev => { if (!moved && Math.abs(ev.clientX - x0) < 4) return; moved = true; const d = (ev.clientX - x0) / st.zoom, n = Object.assign({}, o);
        if (mode === 'M') n.start = Math.max(0, snap(o.start + d));
        else if (mode === 'L') { n.start = clamp(snap(o.start + d), Math.max(0, o.start - o.trimA), o.start + o.len - .05); n.trimA = o.trimA + (n.start - o.start); n.len = o.len - (n.start - o.start); }
        else n.len = clamp(snap(o.start + o.len + d) - o.start, .05, k.full - o.trimA);
        cur = n; b.style.left = n.start * st.zoom + 'px'; b.style.width = Math.max(6, n.len * st.zoom) + 'px'; };
      b.onpointerup = () => { b.onpointermove = b.onpointerup = null; st.sel = tid; st.selTake = k.id; if (moved) edit(() => { Object.assign(k, cur); }); else rr(); };
    });
    void one;
  }
  function setCursor(t) { st.cursor = t; if (P.on && !st.recing && st.sync < 0) playAt(t); rr(); }
  function zoom(f) { const sc = st.el && st.el.querySelector('#rcScroll'), mid = sc ? (sc.scrollLeft + sc.clientWidth / 2) / st.zoom : st.cursor; st.zoom *= f; render(st.el); const s2 = st.el.querySelector('#rcScroll'); if (s2) { s2.scrollLeft = Math.max(0, mid * st.zoom - s2.clientWidth / 2); st.sx = s2.scrollLeft; } }
  function addTrack(kind) { const r = rec(); if (r.tracks.length >= R.MAX_TRACKS) return toast('Maximal ' + R.MAX_TRACKS + ' Spuren'); edit(() => { const n = R.newTrack(kind, r.tracks.filter(t => t.kind === kind).length + 1); r.tracks.forEach(t => { t.arm = 0; }); n.arm = 1; r.tracks.push(n); st.sel = n.id; st.selTake = ''; st.panel = 'spur'; }); if (kind === 'inst') E.bake('lead', 'synth'); }
  function moveTrack(d) { const r = rec(), i = r.tracks.findIndex(t => t.id === st.sel), j = i + d; if (i < 0 || j < 0 || j >= r.tracks.length) return; edit(() => { const [t] = r.tracks.splice(i, 1); r.tracks.splice(j, 0, t); }); }
  function delTrack() { const t = selTrack(); if (!t) return; X().overlay(`<h3>🗑 Spur „${esc(t.name)}“ löschen?</h3><p class="hint">${t.kind === 'audio' ? t.takes.length + ' Takes' : t.notes.length + ' Noten'} – mit ↶ holst du sie zurück.</p><div class="row"><button class="btn nav" data-act="n">Abbrechen</button><button class="btn red nav" data-act="y">Löschen</button></div>`,
    { n: X().closeOv, y: () => { X().closeOv(); edit(() => { rec().tracks = rec().tracks.filter(x => x !== t); st.sel = ''; st.selTake = ''; }); } }); }

  /* ---------- Songtext antippen ---------- */
  function syncStart() { const L = R.parseLyrics(rec().lyrics); if (!L.length) return; st.sync = 0; st.syncT = rec().lyrT.slice(0, L.length); hud('⏱️ Zeile 1'); const s = document.getElementById('hudStop'); s.textContent = 'Fertig';
    const b = document.createElement('button'); b.className = 'btn gold nav'; b.id = 'hudTap'; b.textContent = 'Zeile ✓'; b.onclick = syncTap; s.before(b); tele(L, -1); const el = document.getElementById('hudTele'); if (el) el.innerHTML = `<b>${esc(L[0])}</b>`; playAt(st.cursor); }
  function syncTap() { const L = R.parseLyrics(rec().lyrics); if (st.sync < 0 || !P.on) return; st.syncT[st.sync] = Math.round(P.pos() * 100) / 100; st.sync++; const d = document.querySelector('#rcHud .dot'); if (d) d.textContent = '⏱️ Zeile ' + Math.min(L.length, st.sync + 1);
    const el = document.getElementById('hudTele'); if (el) el.innerHTML = `<b>${esc(L[st.sync] || '✅ Alle Zeilen')}</b><small>${esc(L[st.sync + 1] || '')}</small>`; if (st.sync >= L.length) syncEnd(); }
  function syncEnd() { if (st.sync < 0) return; const T = st.syncT; st.sync = -1; hudClose(); X().stopAll(); edit(() => { rec().lyrT = T; }); toast('📝 Zeiten gespeichert – der Teleprompter läuft beim Aufnehmen mit.'); }

  /* ---------- Werkzeuge: Geräte, Stimmgerät, Latenz, Coach, Lautheit ---------- */
  async function devices() {
    let list = []; try { if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) { list = await navigator.mediaDevices.enumerateDevices(); if (!list.some(d => d.label) && !st.mic) { try { await openMic(); closeMic(); list = await navigator.mediaDevices.enumerateDevices(); } catch (e) { /* ohne Namen */ } } } } catch (e) { /* keine Liste */ }
    const ins = list.filter(d => d.kind === 'audioinput'), outs = list.filter(d => d.kind === 'audiooutput'), ctx = E.ctx(), sink = ctx && ctx.setSinkId, SET = X().SET;
    X().overlay(`<h3>🎚️ Geräte & Aufnahme</h3>
      <p class="lbl">🎙️ Mikrofon / Eingang</p><select class="nav" id="dMic"><option value="">Standard</option>${ins.map((d, i) => `<option value="${esc(d.deviceId)}"${d.deviceId === DEV.mic ? ' selected' : ''}>${esc(d.label || 'Mikrofon ' + (i + 1))}</option>`).join('')}</select>
      <div class="chips"><button class="chip nav${DEV.stereo ? '' : ' on'}" data-act="mono">Mono (Gesang)</button><button class="chip nav${DEV.stereo ? ' on' : ''}" data-act="st">Stereo (Instrument/Interface)</button><button class="chip nav${SET.hp ? ' on' : ''}" data-act="hp">🎧 Mit Kopfhörern (unbearbeitet)</button></div>
      <p class="lbl">Eingangspegel: <b id="dGv">${Math.round(DEV.gain * 100)} %</b></p><input type="range" class="nav" id="dGain" min="0.2" max="4" step="0.05" value="${DEV.gain}">
      ${sink ? `<p class="lbl">🔈 Ausgabe (Kopfhörer/Lautsprecher)</p><select class="nav" id="dOut"><option value="">Standard</option>${outs.map((d, i) => `<option value="${esc(d.deviceId)}"${d.deviceId === DEV.out ? ' selected' : ''}>${esc(d.label || 'Ausgabe ' + (i + 1))}</option>`).join('')}</select>` : '<p class="hint">Die Ausgabe wählst du in den Systemeinstellungen deines Geräts.</p>'}
      <p class="lbl">Aufnahme-Verzögerung ausgleichen: <b id="dLv">${SET.lat} ms</b></p><input type="range" class="nav" id="dLat" min="0" max="400" step="5" value="${SET.lat}">
      <p class="hint">Ohne Kopfhörer filtert der Browser Echo und Rauschen heraus (gut gegen die Musik im Mikro). Mit Kopfhörern nimmt er unbearbeitet auf – klingt besser.</p>
      <div class="row"><button class="btn nav" data-act="lat">⏱️ Latenz messen</button><button class="btn gold nav" data-act="x" data-focus>Fertig</button></div>`,
    { x: X().closeOv, lat: () => { X().closeOv(); latency(); }, mono: b => { DEV.stereo = 0; saveDev(); closeMic(); b.classList.add('on'); b.nextElementSibling.classList.remove('on'); }, st: b => { DEV.stereo = 1; saveDev(); closeMic(); b.classList.add('on'); b.previousElementSibling.classList.remove('on'); },
      hp: b => { SET.hp = !SET.hp; X().saveSet(); closeMic(); b.classList.toggle('on', SET.hp); } });
    const g = document.getElementById('dMic'); if (g) g.onchange = () => { DEV.mic = g.value; saveDev(); closeMic(); };
    const o = document.getElementById('dOut'); if (o) o.onchange = () => { DEV.out = o.value; saveDev(); ctx.setSinkId(o.value).catch(() => toast('Diese Ausgabe lässt sich nicht wählen.')); };
    const gi = document.getElementById('dGain'); gi.oninput = () => { DEV.gain = +gi.value; saveDev(); document.getElementById('dGv').textContent = Math.round(DEV.gain * 100) + ' %'; if (st.mic) st.mic.g.gain.value = DEV.gain; };
    const li = document.getElementById('dLat'); li.oninput = () => { SET.lat = +li.value; X().saveSet(); document.getElementById('dLv').textContent = SET.lat + ' ms'; };
  }
  async function tuner() {
    if (!E.ok) return; let mic; try { mic = await openMic(); } catch (e) { micErr(); return; } let raf = 0;
    const close = () => { cancelAnimationFrame(raf); X().closeOv(); closeMic(); };
    X().overlay(`<h3>🎵 Stimmgerät</h3><div class="tuner"><b id="tuN">–</b><div class="needle"><i id="tuI"></i></div><span id="tuC">Sing oder spiel einen Ton …</span></div><p class="hint">Grün = genau getroffen. Für Gitarre, Bass, Ukulele oder deine Stimme.</p><button class="btn gold nav" data-act="x" data-focus>Fertig</button>`, { x: close, esc: close });
    let sm = 0; const f = () => { const N = document.getElementById('tuN'); if (!N) return; const { f: hz } = pitchNow(mic.an, mic.ctx.sampleRate);
      if (hz > 0) { const m = R.midiOf(hz), n = Math.round(m), c = (m - n) * 100; sm = sm * .7 + c * .3; N.textContent = R.noteName(n); document.getElementById('tuC').textContent = hz.toFixed(1) + ' Hz · ' + (sm > 0 ? '+' : '') + Math.round(sm) + ' Cent';
        const I = document.getElementById('tuI'); I.style.left = (50 + clamp(sm, -50, 50)) + '%'; I.classList.toggle('ok', Math.abs(sm) < 6); }
      raf = requestAnimationFrame(f); }; f();
  }
  async function latency() {
    if (!E.ok) return; X().stopAll(); const SET = X().SET, hp = SET.hp; closeMic(); SET.hp = true; let mic; try { mic = await openMic(); } catch (e) { SET.hp = hp; micErr(); return; } SET.hp = hp;
    X().overlay(`<h3>⏱️ Latenz messen</h3><p>Kopfhörer ab, Lautsprecher auf mittlere Lautstärke. Gleich kommen 5 Klicks – sei kurz still.</p><p class="hint" id="latM">⏳ Messe …</p><button class="btn nav" data-act="x">Schließen</button>`, { x: () => { X().closeOv(); } });
    const ctx = mic.ctx, cap = await capStart(ctx, mic.g, false), t0 = ctx.currentTime + .4, ts = [0, 1, 2, 3, 4].map(i => t0 + i * .55);
    ts.forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 1200; g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.9, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + .03); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .04); });
    await new Promise(r => setTimeout(r, 3500)); const raw = await capCollect(cap); closeMic(); const el = document.getElementById('latM');
    const ms = raw ? R.detectLatency(raw.chs[0], raw.sr, ts.map(t => t - raw.f0 / raw.sr)) : null;
    if (ms == null || ms > 600) { if (el) el.textContent = '❌ Die Klicks waren nicht zu hören – Lautsprecher lauter stellen und nochmal messen.'; return; }
    SET.lat = clamp(ms, 0, 400); X().saveSet(); if (el) el.innerHTML = `✅ Gemessen: <b>${ms} ms</b> – Aufnahmen werden ab jetzt um diesen Wert ausgeglichen.`;
  }
  async function analyze() {
    const S = Sg(), t = selTrack(), k = selTakeObj(); if (!k) return; await loadAll(S); const buf = st.bufs.get(S.id + ':' + k.src); if (!buf) return toast('Aufnahme nicht gefunden.');
    toast('🎯 Analysiere …', 1200); await new Promise(r => setTimeout(r, 30)); const sr = buf.sampleRate, d = buf.getChannelData(0).subarray(Math.floor(k.trimA * sr), Math.floor((k.trimA + k.len) * sr));
    const pt = R.pitchTrack(d, sr, { hop: .02 }), sc = R.pitchScore(pt.f0, R.scalePcs(S.key, S.scale)); st.coach = Object.assign({ id: k.id, f0: pt.f0 }, sc); void t;
    if (!sc.n) toast('Kein Gesang erkannt – ist das ein Gesangs-Take?'); st.panel = 'coach'; rr();
  }
  async function measure() {
    const S = Sg(), el = () => document.getElementById('rcMeas'); if (el()) el().textContent = '⏳ Song wird gerechnet …';
    try { const r = await renderMix(S, { vox: await X().voxBytes(), onProgress: f => { if (el()) el().textContent = '⏳ Song wird gerechnet … ' + Math.round(f * 100) + ' %'; } }), m = r.master || { before: R.lufs(r.ch, r.sr), after: R.lufs(r.ch, r.sr), red: 0 };
      if (el()) el().innerHTML = `📊 Vorher <b>${Number.isFinite(m.before) ? m.before.toFixed(1) : '–'} LUFS</b> → nach dem Mastering <b>${Number.isFinite(m.after) ? m.after.toFixed(1) : '–'} LUFS</b>${m.red ? ' · Limiter bis ' + m.red + ' dB' : ''}`; }
    catch (e) { if (el()) el().textContent = '⚠️ Messen nicht möglich: ' + (e.message || e); }
  }

  window.BSRecUI = { render, extra, renderMix, preload: S => loadAll(S), stopRec, get st() { return st; }, noteOn, noteOff, startRec, togglePlay };
})();
