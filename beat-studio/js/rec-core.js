/* Beat-Studio · Recording-Suite – Kern ohne Browser (auch in Node testbar, window.BSRec):
 * Spuren/Takes-Modell und Bereinigung, Comping (oberster Take klingt), Tonhöhe (YIN) und Treffsicherheit, Autotune, Rausch-Gate,
 * Latenz aus einer Messaufnahme, Wellenform-Spitzen, Lautheit (LUFS nach BS.1770) und Limiter für die Summe,
 * MIDI-Datei schreiben/lesen, Quantisieren, Songtext-Zeilen und Effekt-Voreinstellungen.
 * Audio-Takes liegen in Sekunden auf der Song-Zeitleiste, Instrument-Noten in Schlägen (folgen dem Tempo). */
(function (root) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v, d, a, b) => { v = +v; return Number.isFinite(v) ? clamp(v, a, b) : d; };
  const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  const noteName = m => NOTE[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
  const MAX_TRACKS = 8, MAX_TAKES = 40;

  /* ---------- Effekte je Spur (0 = aus) ---------- */
  // low: Trittschallfilter (Hz) · eq*: 4-Band-EQ in dB · hicut: Höhenfilter (Hz, 20000 = aus) · deess/comp/sat/dbl/gate/tune: Stärke 0–1 · rev/echo: Effektwege 0–1
  const FX0 = { low: 0, eqL: 0, eqLM: 0, eqHM: 0, eqH: 0, hicut: 20000, deess: 0, comp: 0, sat: 0, dbl: 0, gate: 0, tune: 0, rev: 0, echo: 0 };
  const FX_LIM = { low: [0, 300], eqL: [-12, 12], eqLM: [-12, 12], eqHM: [-12, 12], eqH: [-12, 12], hicut: [2000, 20000] };
  const FX_PRESETS = {
    pop: { n: '🎤 Pop-Gesang', fx: { low: 90, eqLM: -2, eqHM: 2, eqH: 3, deess: .5, comp: .55, sat: .1, rev: .35, echo: .15, gate: .2, tune: .3 } },
    rap: { n: '🧢 Rap', fx: { low: 100, eqLM: -1, eqHM: 3, eqH: 2, deess: .4, comp: .75, sat: .25, dbl: .25, rev: .1, gate: .3 } },
    ballade: { n: '🌙 Ballade', fx: { low: 80, eqL: 1, eqH: 2, deess: .4, comp: .4, rev: .6, echo: .25, tune: .2 } },
    radio: { n: '📻 Sprecher', fx: { low: 110, eqL: 2, eqLM: -2, eqHM: 2, deess: .5, comp: .8, gate: .4 } },
    auto: { n: '🤖 Autotune-Effekt', fx: { low: 90, eqHM: 2, comp: .6, tune: 1, rev: .25, echo: .2 } },
    gitarre: { n: '🎸 Gitarre/Instrument', fx: { low: 60, eqLM: -2, eqHM: 1, comp: .35, sat: .2, rev: .25 } },
    trocken: { n: '🧽 Trocken', fx: {} }
  };
  function cleanFx(f) { const o = Object.assign({}, FX0); if (f && typeof f === 'object') Object.keys(FX0).forEach(k => { const L = FX_LIM[k] || [0, 1]; o[k] = num(f[k], FX0[k], L[0], L[1]); }); return o; }
  const INST = [['lead:synth', '🎹 Synth-Lead'], ['lead:flute', '🪈 Flöte'], ['lead:bell', '🔔 Glocken'], ['lead:brass', '🎺 Bläser'], ['chords:piano', '🎹 Piano'], ['chords:pad', '🌫️ Flächen-Pad'],
    ['chords:organ', '⛪ Orgel'], ['chords:guitar', '🎸 Gitarre'], ['bass:e', '🎸 E-Bass'], ['bass:sub', '🔊 Sub-Bass'], ['bass:saw', '🎛️ Synth-Bass']];

  /* ---------- Projekt (S.rec) ---------- */
  let idn = 0; const uid = p => (p || 'r') + Date.now().toString(36) + (idn++).toString(36) + Math.floor(Math.random() * 1e3).toString(36);
  function newTrack(kind, i) { return { id: uid('t'), name: kind === 'inst' ? 'Instrument ' + (i || 1) : 'Gesang ' + (i || 1), kind: kind === 'inst' ? 'inst' : 'audio', vol: .9, pan: 0, mute: 0, solo: 0, arm: 0,
    fx: cleanFx(kind === 'inst' ? { rev: .25 } : FX_PRESETS.pop.fx), takes: [], notes: [], preset: 'lead:synth' }; }
  function newRec() { return { v: 1, tracks: [], beat: 1, beatMute: 0, metro: 1, count: 1, snap: 1, punch: 0, loop: 0, a: 0, b: 0, lyrics: '', lyrT: [], lim: 1, target: -14, echoNote: '1/8d', echoFb: .35 }; }
  function cleanTake(t, i) {
    if (!t || typeof t !== 'object' || typeof t.id !== 'string' || !/^[\w-]{1,40}$/.test(t.id)) return null;
    return { id: t.id, src: typeof t.src === 'string' && /^[\w-]{1,40}$/.test(t.src) ? t.src : t.id, start: num(t.start, 0, 0, 3600), len: num(t.len, 0, 0, 3600), trimA: num(t.trimA, 0, 0, 3600), full: num(t.full, num(t.len, 0, 0, 3600) + num(t.trimA, 0, 0, 3600), 0, 3600),
      enabled: t.enabled === 0 || t.enabled === false ? 0 : 1, order: Math.round(num(t.order, i || 0, 0, 1e6)), gain: num(t.gain, 1, 0, 4), name: String(t.name || 'Take ' + ((i || 0) + 1)).slice(0, 30) };
  }
  const cleanNotes = a => (Array.isArray(a) ? a : []).filter(n => Array.isArray(n) && n.length >= 3 && n.slice(0, 3).every(x => Number.isFinite(+x))).slice(0, 4000)
    .map(n => [Math.round(num(n[0], 0, 0, 4000) * 1000) / 1000, Math.round(num(n[1], 60, 21, 108)), Math.round(num(n[2], .25, .02, 64) * 1000) / 1000, Math.round(num(n[3], .8, .05, 1) * 100) / 100]).sort((x, y) => x[0] - y[0]);
  function cleanTrack(t, i) {
    if (!t || typeof t !== 'object') return null; const k = t.kind === 'inst' ? 'inst' : 'audio', o = newTrack(k, i + 1);
    o.id = typeof t.id === 'string' && /^[\w-]{1,40}$/.test(t.id) ? t.id : o.id; o.name = String(t.name || o.name).slice(0, 30);
    o.vol = num(t.vol, .9, 0, 1.5); o.pan = num(t.pan, 0, -1, 1); ['mute', 'solo', 'arm'].forEach(f => { o[f] = t[f] ? 1 : 0; });
    o.fx = cleanFx(t.fx); o.takes = (Array.isArray(t.takes) ? t.takes : []).map(cleanTake).filter(Boolean).slice(0, MAX_TAKES);
    o.notes = cleanNotes(t.notes); o.preset = INST.some(x => x[0] === t.preset) ? t.preset : 'lead:synth'; return o;
  }
  function clean(r) {
    const o = newRec(); if (!r || typeof r !== 'object') return o;
    o.tracks = (Array.isArray(r.tracks) ? r.tracks : []).map(cleanTrack).filter(Boolean).slice(0, MAX_TRACKS);
    o.beat = num(r.beat, 1, 0, 1.5); ['beatMute', 'punch', 'loop'].forEach(f => { o[f] = r[f] ? 1 : 0; }); ['metro', 'snap', 'lim'].forEach(f => { o[f] = r[f] === 0 || r[f] === false ? 0 : 1; });
    o.count = Math.round(num(r.count, 1, 0, 2)); o.a = num(r.a, 0, 0, 3600); o.b = num(r.b, 0, 0, 3600); if (o.b < o.a) { const x = o.a; o.a = o.b; o.b = x; }
    o.lyrics = String(r.lyrics || '').slice(0, 6000); o.lyrT = (Array.isArray(r.lyrT) ? r.lyrT : []).slice(0, 300).map(x => x == null || !Number.isFinite(+x) ? null : num(x, 0, 0, 3600));
    o.target = [0, -9, -11, -14, -16, -23].includes(+r.target) ? +r.target : -14; o.echoNote = ['1/4', '1/8', '1/8d', '1/16', '1/4d', '1/2'].includes(r.echoNote) ? r.echoNote : '1/8d'; o.echoFb = num(r.echoFb, .35, 0, .8);
    return o;
  }
  const audibleTrack = (rec, t) => !t.mute && (!rec.tracks.some(x => x.solo) || t.solo);
  function takeIds(rec) { const s = new Set(); (rec && rec.tracks || []).forEach(t => t.takes.forEach(k => s.add(k.src || k.id))); return [...s]; }   // Audio-Schlüssel (geteilte Takes teilen eine Aufnahme)

  /* ---------- Comping: aus übereinanderliegenden Takes die hörbaren Stücke ----------
     → [{ id, a, b, off }]: von a bis b (Song-Zeit) klingt Take id ab Stelle off seiner Aufnahme. Oben liegt der Take mit der höchsten order. */
  function compSegments(takes) {
    const on = (takes || []).filter(t => t && t.enabled !== 0 && t.len > 0); if (!on.length) return [];
    const xs = [...new Set(on.flatMap(t => [t.start, t.start + t.len]))].sort((x, y) => x - y), out = [];
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1], m = (a + b) / 2; if (b - a < 1e-6) continue; let top = null;
      for (const t of on) if (t.start <= m && t.start + t.len > m && (!top || t.order > top.order)) top = t;
      if (!top) continue; const last = out[out.length - 1];
      if (last && last.id === top.id && Math.abs(last.b - a) < 1e-6) last.b = b; else out.push({ id: top.id, a, b, off: top.trimA + (a - top.start) });
    }
    return out;
  }
  const projectEnd = rec => (rec && rec.tracks || []).reduce((e, t) => Math.max(e, ...t.takes.filter(k => k.enabled).map(k => k.start + k.len), 0), 0);
  function loopPasses(len, loopLen) { const out = []; if (!(loopLen > .25)) return out; for (let a = 0; a < len - .25; a += loopLen) out.push({ a, b: Math.min(len, a + loopLen) }); return out; }

  /* ---------- Tonhöhe ---------- */
  function yin(x, sr, o) {
    o = o || {}; const minT = Math.max(2, Math.floor(sr / (o.max || 1000))), maxT = Math.min(Math.floor(sr / (o.min || 70)), (x.length >> 1) - 1); if (maxT <= minT + 2) return 0;
    let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i]; if (e / x.length < (o.floor || 2e-5)) return 0;
    const W = x.length - maxT, d = new Float32Array(maxT + 2);
    for (let t = 1; t <= maxT + 1 && t < x.length - W; t++) { let s = 0; for (let i = 0; i < W; i++) { const v = x[i] - x[i + t]; s += v * v; } d[t] = s; }
    let run = 0; d[0] = 1; for (let t = 1; t <= maxT; t++) { run += d[t]; d[t] = run ? d[t] * t / run : 1; }
    let tau = -1; for (let t = minT; t <= maxT; t++) if (d[t] < (o.thr || .15)) { while (t + 1 <= maxT && d[t + 1] < d[t]) t++; tau = t; break; }
    if (tau < 1) return 0; const a = d[tau - 1], b = d[tau], c = tau + 1 <= maxT ? d[tau + 1] : b, den = a + c - 2 * b;
    return sr / (tau + (den ? clamp((a - c) / (2 * den), -1, 1) : 0));
  }
  // Tonhöhenverlauf: auf ~12 kHz verkleinert (schnell genug für ganze Songs), alle hop Sekunden ein Wert (0 = keine Tonhöhe)
  function pitchTrack(mono, sr, o) {
    o = o || {}; const f = Math.max(1, Math.round(sr / 12000)), dsr = sr / f, n = Math.floor(mono.length / f), ds = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < f; k++) s += mono[i * f + k]; ds[i] = s / f; }
    const N = 512, hop = Math.max(16, Math.round((o.hop || .02) * dsr)), cnt = Math.max(0, Math.floor((n - N) / hop) + 1), out = new Float32Array(cnt);
    for (let k = 0; k < cnt; k++) out[k] = yin(ds.subarray(k * hop, k * hop + N), dsr, o);
    return { f0: out, hop: hop / dsr, t0: N / 2 / dsr };
  }
  const SC = { dur: [0, 2, 4, 5, 7, 9, 11], moll: [0, 2, 3, 5, 7, 8, 10] };
  const scalePcs = (key, scale) => (SC[scale] || SC.dur).map(x => (x + (key || 0)) % 12);
  const midiOf = f => 69 + 12 * Math.log2(f / 440);
  function nearest(m, pcs) { let best = Math.round(m), bd = 99; for (let k = Math.floor(m) - 2; k <= Math.ceil(m) + 2; k++) if (pcs.includes(((k % 12) + 12) % 12) && Math.abs(k - m) < bd) { bd = Math.abs(k - m); best = k; } return best; }
  // Treffsicherheit: Anteil der gesungenen Stellen, die höchstens tol Cent neben einem Ton der Tonart liegen
  function pitchScore(f0, pcs, tol) {
    tol = tol || 45; let v = 0, hit = 0, dev = 0; const total = f0.length || 1;
    for (const f of f0) { if (!(f > 0)) continue; v++; const m = midiOf(f), c = Math.abs(m - nearest(m, pcs)) * 100; dev += c; if (c <= tol) hit++; }
    return { score: v ? Math.round(hit / v * 100) : 0, voiced: v / total, cents: v ? Math.round(dev / v) : 0, n: v };
  }
  // Autotune: Tonhöhe Rahmen für Rahmen zum nächsten Ton der Tonart ziehen (Stärke 0–1), Tonhöhen-Verschieber mit zwei überblendeten Lese-Köpfen
  function autotune(x, sr, pcs, strength) {
    strength = clamp(strength || 0, 0, 1); if (!strength || !x.length) return x.slice();
    const pt = pitchTrack(x, sr, { hop: .01 }), R = new Float32Array(pt.f0.length + 1); let r = 1;
    const k = .15 + .75 * strength;   // stärker = schneller einrasten (der bekannte Effekt bei 1)
    for (let i = 0; i < pt.f0.length; i++) { const f = pt.f0[i]; let want = 1; if (f > 0) { const m = midiOf(f), sh = (nearest(m, pcs) - m) * strength; want = Math.pow(2, sh / 12); } r += (want - r) * (f > 0 ? k : .2); R[i] = r; }
    R[pt.f0.length] = 1;
    const W = Math.round(sr * .03), half = W >> 1, n = x.length, y = new Float32Array(n + half), hs = pt.hop * sr; let ph = 0;
    const rd = p => { if (p < 0) return 0; const i = Math.floor(p), a = p - i; return i + 1 < n ? x[i] * (1 - a) + x[i + 1] * a : i < n ? x[i] : 0; };
    for (let i = 0; i < n + half; i++) {
      const fi = clamp((i - pt.t0 * sr) / hs, 0, R.length - 1), j = Math.floor(fi), rr = j + 1 < R.length ? R[j] + (R[j + 1] - R[j]) * (fi - j) : R[j];
      ph += (1 - rr) / W; ph -= Math.floor(ph); const p2 = (ph + .5) % 1, g1 = Math.sin(Math.PI * ph) ** 2;
      y[i] = rd(i - ph * W) * g1 + rd(i - p2 * W) * (1 - g1);
    }
    return y.subarray(half, half + n).slice();   // ohne die halbe Fensterlänge Verzögerung
  }

  /* ---------- Rausch-Gate (Atmen, Rauschen zwischen den Zeilen leiser) ---------- */
  function gate(x, sr, amt) {
    amt = clamp(amt || 0, 0, 1); if (!amt) return x.slice();
    const thr = Math.pow(10, (-62 + amt * 34) / 20), floor = Math.pow(10, -36 / 20), w = Math.max(1, Math.round(sr * .01)), hold = Math.round(sr * .06), att = 1 / (sr * .002), rel = 1 / (sr * .09);
    const out = new Float32Array(x.length); let acc = 0, g = 1, open = 0;
    for (let i = 0; i < x.length; i++) { acc += x[i] * x[i]; if (i >= w) acc -= x[i - w] * x[i - w]; const rms = Math.sqrt(Math.max(0, acc) / w);
      if (rms > thr) open = hold; else if (open > 0) open--; const want = open > 0 ? 1 : floor; g = want > g ? Math.min(want, g + att) : Math.max(want, g - rel); out[i] = x[i] * g; }
    return out;
  }

  /* ---------- Latenz: Messaufnahme mit Klicks zu bekannten Zeiten → Verzögerung in ms ---------- */
  function detectLatency(rec, sr, clicks) {
    let mx = 0; for (let i = 0; i < rec.length; i++) mx = Math.max(mx, Math.abs(rec[i])); if (mx < .02) return null;
    const thr = mx * .35, found = [];
    for (const c of clicks) { const a = Math.floor(c * sr), b = Math.min(rec.length, a + Math.floor(sr * .6)); for (let i = Math.max(0, a); i < b; i++) if (Math.abs(rec[i]) > thr) { found.push((i - a) / sr * 1000); break; } }
    if (found.length < Math.ceil(clicks.length / 2)) return null; found.sort((x, y) => x - y); return Math.round(found[found.length >> 1]);
  }

  /* ---------- Wellenform ---------- */
  function peaks(d, cols) { cols = Math.max(1, cols | 0); const o = new Float32Array(cols * 2), per = d.length / cols;
    for (let c = 0; c < cols; c++) { let mn = 0, mx = 0; const a = Math.floor(c * per), b = Math.min(d.length, Math.max(a + 1, Math.floor((c + 1) * per))), st = Math.max(1, Math.floor((b - a) / 64)); for (let i = a; i < b; i += st) { const v = d[i]; if (v < mn) mn = v; if (v > mx) mx = v; } o[c * 2] = mn; o[c * 2 + 1] = mx; } return o; }

  /* ---------- Summe: Lautheit (LUFS, BS.1770 mit K-Filter und Gating) und Limiter ---------- */
  function biq(type, f0, sr, q, gDb) {
    const w = 2 * Math.PI * f0 / sr, cs = Math.cos(w), al = Math.sin(w) / (2 * q); let b0, b1, b2, a0, a1, a2;
    if (type === 'shelf') { const A = Math.pow(10, gDb / 40), sA = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * cs + sA); b1 = -2 * A * ((A - 1) + (A + 1) * cs); b2 = A * ((A + 1) + (A - 1) * cs - sA); a0 = (A + 1) - (A - 1) * cs + sA; a1 = 2 * ((A - 1) - (A + 1) * cs); a2 = (A + 1) - (A - 1) * cs - sA; }
    else { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; a0 = 1 + al; a1 = -2 * cs; a2 = 1 - al; }
    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  }
  function filt(x, c) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
  function lufs(chs, sr) {
    const s1 = biq('shelf', 1681.974, sr, .7072, 3.99984), s2 = biq('hp', 38.1355, sr, .5003), K = chs.map(c => filt(filt(c, s1), s2));
    const blk = Math.round(sr * .4), hop = Math.round(sr * .1), z = []; if (K[0].length < blk) return -Infinity;
    for (let a = 0; a + blk <= K[0].length; a += hop) { let s = 0; for (const c of K) for (let i = a; i < a + blk; i++) s += c[i] * c[i]; z.push(s / blk); }
    const L = v => -.691 + 10 * Math.log10(v), g1 = z.filter(v => v > 0 && L(v) > -70); if (!g1.length) return -Infinity;
    const rel = L(g1.reduce((a, b) => a + b, 0) / g1.length) - 10, g2 = g1.filter(v => L(v) > rel); return g2.length ? L(g2.reduce((a, b) => a + b, 0) / g2.length) : -Infinity;
  }
  // Limiter mit 5 ms Vorausschau: nichts geht über ceil dBFS, Ausklang 90 ms
  function limit(chs, sr, ceilDb) {
    const ceil = Math.pow(10, (ceilDb == null ? -1 : ceilDb) / 20), n = chs[0].length, la = Math.max(1, Math.round(sr * .005)), e = new Float32Array(n + 1); e[n] = 1;
    for (let i = n - 1; i >= 0; i--) { let p = 0; for (const c of chs) { const a = Math.abs(c[i]); if (a > p) p = a; } e[i] = Math.min(p > ceil ? ceil / p : 1, e[i + 1] + 1 / la); }
    const k = 1 - Math.exp(-1 / (sr * .09)); let g = 1, red = 0;
    for (let i = 0; i < n; i++) { g = Math.min(e[i], g + (1 - g) * k); if (1 - g > red) red = 1 - g; for (const c of chs) { const v = c[i] * g; c[i] = v > ceil ? ceil : v < -ceil ? -ceil : v; } }
    return red > 0 ? Math.round(20 * Math.log10(1 - red) * 10) / 10 : 0;   // stärkste Absenkung in dB
  }
  function master(chs, sr, o) {
    o = o || {}; const before = lufs(chs, sr); let gain = 0;
    if (o.target && Number.isFinite(before)) { gain = clamp(o.target - before, -20, 12); const f = Math.pow(10, gain / 20); chs.forEach(c => { for (let i = 0; i < c.length; i++) c[i] *= f; }); }
    const red = o.lim || o.target ? limit(chs, sr, -1) : 0; return { before, gain, red, after: o.target ? lufs(chs, sr) : before };
  }

  /* ---------- Noten: MIDI-Datei, Quantisieren ---------- */
  const vlq = n => { const b = [n & 127]; while ((n >>= 7)) b.unshift((n & 127) | 128); return b; }, str = t => Array.from(unescape(encodeURIComponent(t))).map(c => c.charCodeAt(0));
  function midiWrite(notes, bpm, name, prog) {
    const tpq = 480, tempo = Math.round(60000000 / (bpm || 120)), ev = [];
    (notes || []).forEach(([b, m, d, v]) => { const on = Math.round(b * tpq), off = Math.round((b + Math.max(.02, d)) * tpq); ev.push([on, 0x90, m, clamp(Math.round((v || .8) * 120), 1, 127)], [off, 0x80, m, 0]); });
    ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const t = [0, 0xFF, 0x03, ...vlq(str(name || 'Spur').length), ...str(name || 'Spur'), 0, 0xFF, 0x51, 3, (tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255, 0, 0xC0, prog || 0];
    let last = 0; ev.forEach(e => { t.push(...vlq(e[0] - last), e[1], e[2], e[3]); last = e[0]; }); t.push(0, 0xFF, 0x2F, 0);
    return new Uint8Array([0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (tpq >> 8) & 255, tpq & 255, 0x4D, 0x54, 0x72, 0x6B, (t.length >>> 24) & 255, (t.length >>> 16) & 255, (t.length >>> 8) & 255, t.length & 255, ...t]);
  }
  function midiRead(buf) {
    const d = buf instanceof Uint8Array ? buf : new Uint8Array(buf), u32 = i => ((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3]) >>> 0;
    if (d.length < 14 || u32(0) !== 0x4D546864) throw new Error('Keine MIDI-Datei'); const ntr = (d[10] << 8) | d[11], tpq = ((d[12] << 8) | d[13]) & 0x7FFF || 480;
    let p = 8 + u32(4), bpm = 0; const notes = [];
    for (let k = 0; k < ntr && p + 8 <= d.length; k++) {
      if (u32(p) !== 0x4D54726B) break; const len = u32(p + 4), end = Math.min(d.length, p + 8 + len); let i = p + 8, tick = 0, rs = 0; const open = new Map();
      const rv = () => { let v = 0, b; do { b = d[i++]; v = (v << 7) | (b & 127); } while (b & 128 && i < end); return v; };
      while (i < end) {
        tick += rv(); let st = d[i]; if (st & 128) i++; else st = rs; if (!st) break;
        if (st === 0xFF) { const ty = d[i++], l = rv(); if (ty === 0x51 && l === 3 && !bpm) bpm = Math.round(60000000 / ((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])); i += l; continue; }
        if (st === 0xF0 || st === 0xF7) { i += rv(); continue; }
        rs = st; const hi = st & 0xF0, ch = st & 15, a = d[i++], b = hi === 0xC0 || hi === 0xD0 ? 0 : d[i++];
        if (ch === 9) continue; const key = a;
        if (hi === 0x90 && b > 0) { if (!open.has(key)) open.set(key, [tick, b]); }
        else if (hi === 0x80 || (hi === 0x90 && b === 0)) { const o = open.get(key); if (o) { open.delete(key); notes.push([o[0] / tpq, key, Math.max(.02, (tick - o[0]) / tpq), o[1] / 127]); } }
      }
      p = end;
    }
    return { notes: cleanNotes(notes), bpm: bpm || 120 };
  }
  // Quantisieren auf div Teile je Schlag (4 = 16tel), Stärke 0–1
  const r3 = x => Math.round(x * 1000) / 1000;
  function quantize(notes, div, s) {
    s = s == null ? 1 : clamp(s, 0, 1); const g = 1 / (div || 4);
    return (notes || []).map(([t, m, d, v]) => { const qt = Math.round(t / g) * g, qd = Math.max(g, Math.round(d / g) * g); return [Math.max(0, r3(t + (qt - t) * s)), m, r3(Math.max(.02, d + (qd - d) * s)), v]; });
  }

  /* ---------- Songtext ---------- */
  const parseLyrics = t => String(t || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 300).map(l => l.slice(0, 120));
  function lineAt(times, t) { let k = -1; for (let i = 0; i < (times || []).length; i++) if (times[i] != null && times[i] <= t + 1e-6) k = i; return k; }
  const delayTime = (bpm, note) => clamp(60 / (bpm > 0 ? bpm : 120) * ({ '1/2': 2, '1/4': 1, '1/8': .5, '1/8d': .75, '1/16': .25, '1/4d': 1.5 }[note] || .75), .03, 2.5);

  const API = { MAX_TRACKS, MAX_TAKES, FX0, FX_LIM, FX_PRESETS, INST, NOTE, noteName, uid, newTrack, newRec, clean, cleanFx, cleanTake, cleanNotes, audibleTrack, takeIds, compSegments, projectEnd, loopPasses,
    yin, pitchTrack, scalePcs, midiOf, nearest, pitchScore, autotune, gate, detectLatency, peaks, lufs, limit, master, midiWrite, midiRead, quantize, parseLyrics, lineAt, delayTime, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else { root.BSRec = API; if (root.BSCore) root.BSCore.cleanRec = clean; }
})(typeof window !== 'undefined' ? window : globalThis);
