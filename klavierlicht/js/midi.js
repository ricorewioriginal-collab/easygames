/* Klavierlicht – MIDI und Aufnahmen (auch in Node testbar).
 * parse(ArrayBuffer) liest eine Standard-MIDI-Datei (Typ 0/1, Tempowechsel, laufender Status) → Noten in Sekunden.
 * toChart(notes, name) macht daraus ein Chart: Melodie = oberste Stimme der höchsten Spur, Rest = Begleitung (wie das Online-Archiv).
 * encode/decode packen eine Aufnahme aus dem Freien Klavier kompakt in einen Link (#rec=…), toChartRec macht sie spielbar. */
(function (root) {
  'use strict';
  function parse(buf) {
    const b = new Uint8Array(buf); let i = 0;
    const u32 = () => (b[i++] << 24 | b[i++] << 16 | b[i++] << 8 | b[i++]) >>> 0, u16 = () => (b[i++] << 8 | b[i++]), str = n => { let s = ''; for (let k = 0; k < n; k++) s += String.fromCharCode(b[i++]); return s; };
    const vlq = () => { let v = 0, c; do { c = b[i++]; v = (v << 7) | (c & 127); } while (c & 128 && i < b.length); return v; };
    if (str(4) !== 'MThd') throw new Error('Keine MIDI-Datei');
    const hl = u32(), fmt = u16(), nt = u16(), div = u16(); i = 8 + hl;
    if (div & 0x8000) throw new Error('SMPTE-Zeit wird nicht unterstützt');
    const tempos = [[0, 500000]], raw = [];
    for (let tr = 0; tr < nt && i < b.length; tr++) {
      if (str(4) !== 'MTrk') break; const len = u32(), end = i + len; let tick = 0, rs = 0; const on = {};
      while (i < end) {
        tick += vlq(); let st = b[i];
        if (st & 0x80) i++; else st = rs;
        if (st === 0xff) { const ty = b[i++], l = vlq(); if (ty === 0x51 && l === 3) tempos.push([tick, b[i] << 16 | b[i + 1] << 8 | b[i + 2]]); i += l; continue; }
        if (st === 0xf0 || st === 0xf7) { i += vlq(); continue; }
        rs = st; const ty = st & 0xf0, ch = st & 15;
        if (ty === 0xc0 || ty === 0xd0) { i++; continue; }
        const a = b[i++], v = b[i++];
        if (ty === 0x90 && v > 0) { (on[ch * 128 + a] = on[ch * 128 + a] || []).push([tick, v]); }
        else if (ty === 0x80 || ty === 0x90) { const q = on[ch * 128 + a]; if (q && q.length) { const [t0, vv] = q.shift(); raw.push({ tr: fmt === 0 ? ch : tr, ch, p: a, t0, t1: Math.max(tick, t0 + 1), v: vv }); } }
      }
      i = end;
    }
    tempos.sort((x, y) => x[0] - y[0]);
    const sec = tk => { let s = 0, lt = 0, us = 500000; for (const [t, u] of tempos) { if (t >= tk) break; s += (t - lt) * us / div / 1e6; lt = t; us = u; } return s + (tk - lt) * us / div / 1e6; };
    const notes = raw.filter(n => n.ch !== 9).map(n => ({ tr: n.tr, p: n.p, t: sec(n.t0), d: sec(n.t1) - sec(n.t0), v: n.v / 127 })).sort((x, y) => x.t - y.t);
    const z = tempos.filter(x => x[0] === 0);
    return { notes, bpm: Math.round(60e6 / z[z.length - 1][1]) || 100 };
  }
  function toChart(m, name, maxSec) {
    const bpm = Math.max(40, Math.min(220, m.bpm || 100)), st = 60 / bpm / 4, lim = maxSec || 240, ns = m.notes.filter(n => n.t < lim);
    if (!ns.length) throw new Error('Keine Noten gefunden');
    const tr = {}; for (const n of ns) (tr[n.tr] = tr[n.tr] || []).push(n);
    // Melodiespur: viele Noten und hohe Lage
    let mt = null, ms = -1; for (const k in tr) { const a = tr[k]; if (a.length < 8 && Object.keys(tr).length > 1) continue; const avg = a.reduce((s, n) => s + n.p, 0) / a.length, sc = avg + Math.min(20, a.length / 10); if (sc > ms) { ms = sc; mt = k; } }
    const t0 = ns[0].t, q = t => Math.round((t - t0) / st), by = {};
    for (const n of tr[mt]) { const s = q(n.t); if (!by[s] || n.p > by[s].p) by[s] = n; }
    const melS = new Set(Object.values(by)), mel = Object.keys(by).map(Number).sort((a, b) => a - b).map(s => [s, by[s].p, Math.max(1, Math.round(by[s].d / st))]);
    for (let k = 1; k < mel.length; k++) mel[k - 1][2] = Math.min(mel[k - 1][2], mel[k][0] - mel[k - 1][0]) || 1;
    const accBy = {}; for (const n of ns) { if (melS.has(n)) continue; const s = q(n.t); (accBy[s] = accBy[s] || []).push([n.p, Math.max(1, Math.round(n.d / st))]); }
    const acc = []; for (const s of Object.keys(accBy).map(Number).sort((a, b) => a - b)) { const l = accBy[s].sort((a, b) => a[0] - b[0]), keep = l.length > 3 ? [l[0]].concat(l.slice(-2)) : l; for (const [p, d] of keep) acc.push([s, p, d]); }
    // in gut spielbare Lage schieben
    const med = mel.map(x => x[1]).sort((a, b) => a - b)[mel.length >> 1]; let sh = 0; while (med + sh < 62) sh += 12; while (med + sh > 79) sh -= 12;
    mel.forEach(x => { x[1] += sh; }); acc.forEach(x => { x[1] += sh; while (x[1] > 76) x[1] -= 12; while (x[1] < 33) x[1] += 12; });
    return { v: 1, id: 'eigen-' + Date.now().toString(36), title: name || 'Eigenes Lied', artist: 'Eigene MIDI-Datei', cat: 'eigen', bpm, step: st * 1000, off: 0, mel, acc, chords: [], bass: [], lic: 'Eigene Datei – nur auf diesem Gerät', src: 'Aus deiner MIDI-Datei umgewandelt' };
  }
  // Aufnahme: [[t (s), Tonhöhe, Dauer (s), Stärke 0..1]] ↔ Text für Links (je Ton: Abstand in 10 ms, Tonhöhe, Dauer in 10 ms, Stärke)
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function encode(ev) {
    const out = []; let last = 0; const put = v => { v = Math.max(0, Math.round(v)); do { let c = v & 31; v >>= 5; if (v) c |= 32; out.push(B64[c]); } while (v); };
    for (const [t, p, d, v] of ev.slice(0, 3000)) { put((t - last) * 100); last = t; put(p); put(Math.min(d, 20) * 100); put((v || 0.7) * 31); }
    return out.join('');
  }
  function decode(s) {
    const ev = []; let i = 0, t = 0; const get = () => { let v = 0, sh = 0, c; do { c = B64.indexOf(s[i++]); if (c < 0) throw new Error('Link beschädigt'); v |= (c & 31) << sh; sh += 5; } while (c & 32); return v; };
    while (i < s.length && ev.length < 3000) { t += get() / 100; const p = get(), d = get() / 100, v = get() / 31; if (p < 12 || p > 120) throw new Error('Link beschädigt'); ev.push([t, p, d, v]); }
    return ev;
  }
  // Aufnahmen im feinen Raster (Zweiunddreißigstel), damit schnelle Töne erhalten bleiben
  function toChartRec(ev, name, bpm) { bpm = bpm || 100; const c = toChart({ notes: ev.map(([t, p, d, v]) => ({ tr: 0, p, t, d, v })), bpm: bpm * 2 }, name || 'Meine Aufnahme', 300); c.bpm = bpm; return c; }
  const API = { parse, toChart, encode, decode, toChartRec };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLMidi = API;
})(typeof window !== 'undefined' ? window : globalThis);
