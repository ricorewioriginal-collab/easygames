/* AnMaCha Podcast Tycoon 3D – Grundbausteine: Namensraum, deterministischer Zufall, Helfer, Ereignisbus.
   Läuft im Browser (window.PT) und in Node (globalThis.PT) für die Tests. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  PT.VERSION = '1.0.0';
  PT.GAME_ID = 'anmacha-podcast-tycoon';

  // mulberry32 – kleiner, schneller, deterministischer Zufall. Zustand liegt als Zahl im Objekt (speicherbar).
  function next(seed) {
    let t = (seed + 0x6D2B79F5) >>> 0;
    const s = t;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return [s, ((t ^ (t >>> 14)) >>> 0) / 4294967296];
  }
  /** Zufallszahl 0..1 aus st.seed (wird fortgeschrieben). */
  PT.rand = function (st) { const r = next(st.seed >>> 0); st.seed = r[0]; return r[1]; };
  PT.randInt = function (st, a, b) { return a + Math.floor(PT.rand(st) * (b - a + 1)); };
  PT.pick = function (st, arr) { return arr[Math.floor(PT.rand(st) * arr.length)]; };
  PT.shuffle = function (st, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(PT.rand(st) * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  /** Unabhängiger Zufallsgenerator als Funktion (für Darstellung, nicht für Spielregeln). */
  PT.rng = function (seed) { const st = { seed: seed >>> 0 }; return function () { return PT.rand(st); }; };
  PT.hash = function (str) { let h = 2166136261; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  PT.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  PT.lerp = (a, b, t) => a + (b - a) * t;
  PT.round = (v, d) => { const f = Math.pow(10, d || 0); return Math.round(v * f) / f; };
  PT.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PT.fmt = n => { n = Math.round(n || 0); const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (n < 0 ? '−' : '') + s; };
  PT.money = n => PT.fmt(n) + ' SC';
  PT.deepClone = o => JSON.parse(JSON.stringify(o));
  PT.uid = function (st, prefix) { st.nextId = (st.nextId || 1) + 1; return (prefix || 'id') + (st.nextId).toString(36); };
  PT.timeStr = function (minutes) { const m = Math.floor(minutes) % 1440, h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; };

  // Einfacher Ereignisbus (UI <-> Simulation <-> Welt)
  PT.Bus = (function () {
    const map = {};
    return {
      on(ev, fn) { (map[ev] = map[ev] || []).push(fn); return () => { map[ev] = (map[ev] || []).filter(f => f !== fn); }; },
      emit(ev, data) { (map[ev] || []).slice().forEach(fn => { try { fn(data); } catch (e) { if (root.console) console.error('[PT.Bus]', ev, e); } }); },
      clear() { Object.keys(map).forEach(k => delete map[k]); }
    };
  })();

  if (typeof module !== 'undefined' && module.exports) module.exports = PT;
})(typeof window !== 'undefined' ? window : globalThis);
