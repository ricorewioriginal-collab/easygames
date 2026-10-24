/* Pestwacht · Grundlagen: Zufall mit Startwert, Hilfsfunktionen, Ressourcen-Buchhaltung, Modifikatoren, Ereignisprotokoll. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};

  // ---------- Zufall (mulberry32, Zustand liegt im Spielstand → reproduzierbar) ----------
  PW.hash = function (str) {
    let h = 2166136261 >>> 0;
    str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  PW.makeRng = function (seed) {
    let s = (typeof seed === 'number' ? seed : PW.hash(seed)) >>> 0;
    const f = function () {
      s = (s + 0x6D2B79F5) >>> 0; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.state = () => s; f.set = v => { s = v >>> 0; };
    return f;
  };
  // Zufall aus dem Spielstand: S.rng wird fortgeschrieben
  PW.rand = function (S) {
    let s = (S.rng = (S.rng + 0x6D2B79F5) >>> 0); let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  PW.randInt = (S, n) => Math.floor(PW.rand(S) * n);
  PW.pick = (S, arr) => arr[Math.floor(PW.rand(S) * arr.length)];

  PW.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  PW.lerp = (a, b, t) => a + (b - a) * t;
  PW.fmt = function (v) {
    v = Math.floor(v);
    if (Math.abs(v) >= 100000) return Math.round(v / 1000) + 'k';
    if (Math.abs(v) >= 10000) return (v / 1000).toFixed(1).replace('.', ',') + 'k';
    return String(v);
  };
  PW.fmtTime = function (s) {
    s = Math.max(0, Math.ceil(s));
    const m = Math.floor(s / 60), r = s % 60;
    if (m >= 60) return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
    return m ? m + ':' + String(r).padStart(2, '0') + ' min' : r + ' s';
  };
  PW.costText = function (cost) {
    return Object.keys(cost).filter(k => cost[k] > 0).map(k => PW.RES_INFO[k].icon + ' ' + PW.fmt(cost[k])).join('  ');
  };

  // ---------- Ressourcen ----------
  PW.emptyRes = function () { const o = {}; PW.RES.forEach(k => { o[k] = 0; }); return o; };
  PW.canPay = function (res, cost, mult) {
    mult = mult || 1;
    for (const k in cost) if ((res[k] || 0) + 1e-9 < cost[k] * mult) return false;
    return true;
  };
  PW.missing = function (res, cost) {
    const o = {}; for (const k in cost) { const d = cost[k] - (res[k] || 0); if (d > 0.5) o[k] = Math.ceil(d); } return o;
  };
  // Bezahlen: nur wenn alles reicht. ledger zählt Ausgaben (Nachweis: Bots wachsen nur mit echten Ressourcen)
  PW.pay = function (res, cost, ledger, mult) {
    mult = mult || 1;
    if (!PW.canPay(res, cost, mult)) return false;
    for (const k in cost) { const v = cost[k] * mult; res[k] -= v; if (res[k] < 0) res[k] = 0; if (ledger) ledger[k] = (ledger[k] || 0) + v; }
    return true;
  };
  PW.addRes = function (res, add, caps, mult) {
    mult = mult || 1; let got = 0;
    for (const k in add) {
      const cap = caps && !PW.UNCAPPED[k] ? caps[k] : Infinity, before = res[k] || 0;
      const v = add[k] * mult;
      if (!(v > 0)) continue;
      if (before < cap) res[k] = Math.min(cap, before + v);   // über der Grenze: nichts vernichten, nur nicht weiter füllen
      got += res[k] - before;
    }
    return got;
  };
  PW.scaleCost = function (cost, m) { const o = {}; for (const k in cost) o[k] = Math.ceil(cost[k] * m); return o; };

  // ---------- Modifikatoren (Forschung, Heldenpassiven, Ereignisse, Jahreszeit) ----------
  PW.addMods = function (into, mods, f) { f = f == null ? 1 : f; for (const k in mods) into[k] = (into[k] || 0) + mods[k] * f; return into; };
  PW.playerMods = function (S) {
    const m = {};
    Object.keys(S.research.done).forEach(id => { if (PW.TECH[id]) PW.addMods(m, PW.TECH[id].mods); });
    Object.keys(S.heroes).forEach(id => { const h = PW.HERO[id]; if (h && h.passive) PW.addMods(m, h.passive.mods); });
    (S.events.active || []).forEach(e => {
      if (e.id === 'ader') PW.addMods(m, { 'prod.iron': 0.6 });
      if (e.id === 'winter') PW.addMods(m, { eat: 0.4 });
      if (e.id === 'epidemie') PW.addMods(m, { spread: 1 });
    });
    if (S.cfg.seasons !== false && S.season) { const se = PW.SEASONS.find(x => x.id === S.season); if (se) PW.addMods(m, se.mods); }
    return m;
  };
  PW.seasonOf = function (date) {
    const md = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const s = PW.SEASONS.find(x => md >= x.from && md <= x.to);
    return s ? s.id : null;
  };

  // ---------- Protokoll (Chronik/Ratshalle) ----------
  PW.log = function (S, txt, kind, extra) {
    const e = { t: Math.floor(S.time), txt, k: kind || 'info' };
    if (extra) Object.assign(e, extra);
    S.log.push(e);
    if (S.log.length > 220) S.log.splice(0, S.log.length - 200);
    if (S._listeners) S._listeners.forEach(fn => { try { fn(e); } catch (x) {} });
    return e;
  };
  PW.stat = function (S, key, n) { S.stats[key] = (S.stats[key] || 0) + (n == null ? 1 : n); };
  PW.dayTime = S => (S.time % PW.DAY) / PW.DAY;   // 0 = Morgen
  PW.dayNo = S => Math.floor(S.time / PW.DAY) + 1;

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
