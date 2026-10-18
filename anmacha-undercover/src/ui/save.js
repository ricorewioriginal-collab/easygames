/* AnMaCha UNDERCOVER 3D – lokaler Speicher (localStorage, Präfix 'anmachaUndercover', versioniert).
   Die Cloud-Sicherung übernimmt ../cloud/anmacha-cloud.js (data-prefix="anmachaUndercover"). Alles fehlertolerant:
   kaputte oder fremde Werte werden durch Vorgaben ersetzt. Node-tauglich (ohne localStorage: nur im Speicher). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const P = 'anmachaUndercover.', VER = 1;
  const mem = {};
  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }
  function rawGet(k) { const s = ls(); try { return s ? s.getItem(P + k) : (k in mem ? mem[k] : null); } catch (e) { return null; } }
  function rawSet(k, v) { const s = ls(); try { if (s) s.setItem(P + k, v); else mem[k] = v; return true; } catch (e) { return false; } }
  function get(k, def) {
    const r = rawGet(k); if (r == null) return clone(def);
    try { const o = JSON.parse(r); if (!o || o.v !== VER || !('d' in o)) return clone(def); return o.d; } catch (e) { return clone(def); }
  }
  function set(k, d) { return rawSet(k, JSON.stringify({ v: VER, d })); }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);

  const DEF_PROFILE = { name: '', look: null, lang: 'de', tut: {} };
  const DEF_SETTINGS = { master: 0.8, sfx: 0.9, music: 0.5, quality: 'auto', zoom: 1, keys: null, names: true, reduceMotion: false, textSize: 1, colorAid: false, last: null };
  const MODE_IDS = ['jagd', 'wort', 'detektiv', 'chaos', 'jagen', 'rollen'];

  function profile() {
    const p = get('profile', DEF_PROFILE); const o = Object.assign(clone(DEF_PROFILE), isObj(p) ? p : {});
    o.name = AMU.U ? AMU.U.cleanName(o.name, 16) : String(o.name || '').slice(0, 16);
    if (AMU.COSMETICS && o.look) o.look = AMU.COSMETICS.validLook(o.look);
    if (!isObj(o.tut)) o.tut = {};
    return o;
  }
  function saveProfile(p) { return set('profile', p); }
  function settings() {
    const s = get('settings', DEF_SETTINGS); const o = Object.assign(clone(DEF_SETTINGS), isObj(s) ? s : {});
    ['master', 'sfx', 'music'].forEach(k => { o[k] = Math.max(0, Math.min(1, +o[k] || 0)); });
    if (!['auto', 'low', 'mid', 'high'].includes(o.quality)) o.quality = 'auto';
    o.zoom = Math.max(0.7, Math.min(1.6, +o.zoom || 1));
    o.textSize = Math.max(0.85, Math.min(1.4, +o.textSize || 1));
    if (!isObj(o.keys)) o.keys = null;
    if (o.last && !isObj(o.last)) o.last = null;
    return o;
  }
  function saveSettings(s) { return set('settings', s); }
  /** Statistik je Modus, getrennt nach Solo und Online */
  function emptyStats() {
    const m = {}; MODE_IDS.forEach(id => { m[id] = { solo: { g: 0, w: 0 }, online: { g: 0, w: 0 } }; });
    return { modes: m, tasks: 0, traitorsCaught: 0, wordHits: 0, guesses: 0, survivedStreak: 0, bestStreak: 0, kills: 0, repairs: 0, clues: 0, escapes: 0, rescues: 0, beacons: 0, games: 0 };
  }
  function stats() {
    const s = get('stats', null), e = emptyStats();
    if (!isObj(s)) return e;
    Object.keys(e).forEach(k => { if (k !== 'modes' && typeof s[k] === 'number' && isFinite(s[k]) && s[k] >= 0) e[k] = Math.floor(s[k]); });
    if (isObj(s.modes)) MODE_IDS.forEach(id => { const x = s.modes[id]; if (!isObj(x)) return; ['solo', 'online'].forEach(w => { if (isObj(x[w])) { e.modes[id][w].g = Math.max(0, x[w].g | 0); e.modes[id][w].w = Math.max(0, Math.min(e.modes[id][w].g, x[w].w | 0)); } }); });
    return e;
  }
  function saveStats(s) { return set('stats', s); }
  function recentWords() { const r = get('recent', []); return Array.isArray(r) ? r.filter(x => typeof x === 'string').slice(-40) : []; }
  function pushRecent(w) { const r = recentWords(); r.push(String(w).slice(0, 40)); set('recent', r.slice(-40)); }

  AMU.Save = { P, VER, get, set, profile, saveProfile, settings, saveSettings, stats, saveStats, emptyStats, recentWords, pushRecent, DEF_SETTINGS };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Save;
})(typeof window !== 'undefined' ? window : globalThis);
