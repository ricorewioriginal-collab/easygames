/* Royal Radio Match 3D – Spielstand: Schema v2, Migration aus 'anmacha-radio-match-v1', sichere Zusammenführung.
 * Schlüssel 'royal-radio-match-v2' wird (wie der alte) über cloud/anmacha-cloud.js gesichert.
 * Lokaler Hochwasser-Stand 'rrm-local-hw' (nicht in der Cloud): Fortschritt (freigeschaltet, Sterne, Bestwerte) kann
 * dadurch auf diesem Gerät nie durch einen älteren Cloud-Stand zurückfallen. Der alte Schlüssel bleibt als Sicherung unverändert. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var KEY = 'royal-radio-match-v2', OLD = 'anmacha-radio-match-v1', HW = 'rrm-local-hw';

  function defaults() {
    return {
      v: 2, from: 0, unlocked: 1, cur: 1, stars: {}, best: {}, bonus: {},
      coins: 500,
      inv: { hammer: 3, laser: 2, blitz: 2, shuffle: 2, bass: 1, scan: 1, boost: 1, rescue: 1, preRocket: 2, preBomb: 1, preOrb: 1, preSuper: 0 },
      tower: [], seen: [], tut: {}, duel: { w: 0, l: 0, d: 0 }, daily: '', cos: { frame: 'classic' },
      set: { music: true, sfx: true, quality: 'auto', reduced: false, cb: false, lang: 'de' },
      t: 0
    };
  }
  function parse(raw) {
    if (raw == null || raw === '') return null;
    try { var o = JSON.parse(raw); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch (e) { return null; }
  }
  var int = function (v, lo, hi, d) { v = Math.floor(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  function cleanMap(m, max, hi) {
    var o = {};
    if (!m || typeof m !== 'object') return o;
    Object.keys(m).forEach(function (k) { var n = +k; if (n >= 1 && n <= max && n === Math.floor(n)) { var v = int(m[k], 0, hi, 0); if (v > 0) o[n] = v; } });
    return o;
  }
  function maxMap(a, b) { var o = Object.assign({}, a); Object.keys(b || {}).forEach(function (k) { o[k] = Math.max(o[k] || 0, b[k]); }); return o; }
  function union(a, b) { var o = (a || []).slice(); (b || []).forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o.sort(function (x, y) { return x - y; }); }

  // Bringt beliebige (auch kaputte/fremde) Daten in ein gültiges v2-Objekt
  function normalize(o) {
    var d = defaults(), s = Object.assign(d, o && typeof o === 'object' ? o : {});
    s.v = 2;
    s.unlocked = int(s.unlocked, 1, RRM.MAX_LEVEL || 200, 1);
    s.cur = int(s.cur, 1, s.unlocked, s.unlocked);
    s.stars = cleanMap(s.stars, 200, 3); s.best = cleanMap(s.best, 200, 1e9); s.bonus = cleanMap(s.bonus, 10, 3);
    s.coins = int(s.coins, 0, 1e7, 0);
    var inv = defaults().inv, src = o && o.inv && typeof o.inv === 'object' ? o.inv : {};
    Object.keys(inv).forEach(function (k) { inv[k] = src[k] != null ? int(src[k], 0, 999, 0) : inv[k]; });
    s.inv = inv;
    s.tower = Array.isArray(s.tower) ? s.tower.filter(function (x) { return x >= 0 && x < 10 && x === Math.floor(x); }) : [];
    s.seen = Array.isArray(s.seen) ? s.seen.filter(function (x) { return typeof x === 'string' && x.length < 40; }).slice(0, 100) : [];
    s.tut = s.tut && typeof s.tut === 'object' ? s.tut : {};
    s.duel = { w: int(s.duel && s.duel.w, 0, 1e6, 0), l: int(s.duel && s.duel.l, 0, 1e6, 0), d: int(s.duel && s.duel.d, 0, 1e6, 0) };
    s.set = Object.assign(defaults().set, s.set && typeof s.set === 'object' ? s.set : {});
    s.t = +s.t || 0;
    return s;
  }

  // Altstand v1 { unlocked, stars, mute } -> v2 (Level 1–100 unverändert übernommen)
  function fromV1(old) {
    if (!old) return null;
    var s = {
      from: 1,
      unlocked: int(old.unlocked, 1, 100, 1),
      stars: cleanMap(old.stars, 100, 3)
    };
    if (old.mute === true) s.set = { sfx: false, music: false };
    return s;
  }

  // Fortschritt wird immer zusammengeführt (nie kleiner); Verbrauchswerte (Münzen, Inventar, Einstellungen) vom neueren Stand
  function merge(a, b) {
    a = normalize(a); b = normalize(b);
    var newer = (b.t || 0) > (a.t || 0) ? b : a;
    var s = normalize(newer);
    s.unlocked = Math.max(a.unlocked, b.unlocked);
    s.stars = maxMap(a.stars, b.stars); s.best = maxMap(a.best, b.best); s.bonus = maxMap(a.bonus, b.bonus);
    s.tower = union(a.tower, b.tower); s.seen = union(a.seen, b.seen);
    s.tut = Object.assign({}, a.tut, b.tut);
    s.duel = { w: Math.max(a.duel.w, b.duel.w), l: Math.max(a.duel.l, b.duel.l), d: Math.max(a.duel.d, b.duel.d) };
    s.from = Math.max(a.from || 0, b.from || 0);
    s.t = Math.max(a.t, b.t);
    return s;
  }

  // Liest alle Quellen und liefert den zusammengeführten Stand (idempotent: mehrfaches Laden ändert nichts)
  function load(ls) {
    var get = function (k) { try { return ls.getItem(k); } catch (e) { return null; } };
    var cur = parse(get(KEY)), old = fromV1(parse(get(OLD))), hw = parse(get(HW));
    var s = normalize(cur || {});
    if (!cur) s.t = 0;
    if (old) { var m = merge(s, Object.assign(normalize(old), { t: 0 })); m.from = 1; s = m; if (!cur) { s.coins = defaults().coins; s.inv = defaults().inv; if (old.set) Object.assign(s.set, old.set); } }
    if (hw) { s.unlocked = Math.max(s.unlocked, int(hw.unlocked, 1, 200, 1)); s.stars = maxMap(s.stars, cleanMap(hw.stars, 200, 3)); s.best = maxMap(s.best, cleanMap(hw.best, 200, 1e9)); }
    s.cur = int(s.cur, 1, s.unlocked, s.unlocked);
    return s;
  }

  function store(ls, s, now) {
    s.t = now || Date.now();
    try {
      ls.setItem(KEY, JSON.stringify(s));
      ls.setItem(HW, JSON.stringify({ unlocked: s.unlocked, stars: s.stars, best: s.best }));
      return true;
    } catch (e) { return false; }
  }

  function totalStars(s) { var n = 0; Object.keys(s.stars).forEach(function (k) { n += s.stars[k]; }); return n; }

  RRM.Save = { KEY: KEY, OLD: OLD, HW: HW, defaults: defaults, normalize: normalize, fromV1: fromV1, merge: merge, load: load, store: store, parse: parse, totalStars: totalStars };
  if (typeof module !== 'undefined' && module.exports) module.exports = RRM.Save;
})(typeof window !== 'undefined' ? window : globalThis);
