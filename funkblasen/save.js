/* FUNKBLASEN – Spielstand (localStorage, versioniert, mit Prüfung) und Erfolge.
 * Schlüssel: easygames.funkblasen.v1 (wird von cloud/anmacha-cloud.js mit data-prefix="easygames.funkblasen" mitgesichert).
 * Kaputtes JSON oder fehlender Speicher machen das Spiel nie unspielbar: dann gilt ein frischer Stand im Arbeitsspeicher. */
(function (root, factory) {
  const S = factory();
  if (typeof module === 'object' && module.exports) module.exports = S; else root.FBSave = S;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KEY = 'easygames.funkblasen.v1', BACKUP = 'funkblasen-defekt-sicherung', SCHEMA = 1, LEVELS = 150;

  const int = (v, lo, hi, d) => (typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d);
  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  const STAT_KEYS = ['shots', 'pops', 'drops', 'banks', 'bigBank', 'bombs', 'rainbows', 'bolts', 'ice', 'crystals', 'stars', 'chains', 'switches', 'wins', 'losses', 'bestCombo', 'bestDrop', 'dailyWins', 'endlessRows', 'bought', 'jokers', 'perfect'];

  function defaults() {
    return {
      v: SCHEMA, unlocked: 1, stars: {}, best: {}, coins: 0, ach: {}, stats: STAT_KEYS.reduce((o, k) => (o[k] = 0, o), {}),
      daily: {}, endless: { best: 0, rows: 0, run: null },
      opts: { music: 0.55, sfx: 0.8, muted: false, patterns: true, preview: true, line: 'lang', motion: 'auto', quality: 'auto', tutorials: true },
      cos: { owned: ['std', 'glas', 'orange'], cannon: 'std', finish: 'glas', phones: 'orange' },
      last: { level: 1 }, tut: {}, ts: 0
    };
  }

  // Prüft und repariert einen geladenen Stand (fremde/kaputte Felder werden verworfen, gültige bleiben erhalten)
  function validate(raw) {
    const d = defaults();
    if (!obj(raw)) return d;
    d.unlocked = int(raw.unlocked, 1, LEVELS, 1);
    for (const src of ['stars', 'best']) if (obj(raw[src])) for (const k of Object.keys(raw[src])) {
      const n = +k; if (!(n >= 1 && n <= LEVELS && n === Math.floor(n))) continue;
      const v = src === 'stars' ? int(raw[src][k], 0, 3, 0) : int(raw[src][k], 0, 1e9, 0);
      if (v > 0) d[src][n] = v;
    }
    // Ein Level mit Sternen ist gewonnen: das nächste muss freigeschaltet sein (repariert Widersprüche)
    for (const k of Object.keys(d.stars)) d.unlocked = Math.max(d.unlocked, Math.min(LEVELS, +k + 1));
    d.coins = int(raw.coins, 0, 1e7, 0);
    if (obj(raw.ach)) for (const k of Object.keys(raw.ach)) if (ACH_BY_ID[k]) d.ach[k] = int(raw.ach[k], 1, 9e15, 1);
    if (obj(raw.stats)) for (const k of STAT_KEYS) d.stats[k] = int(raw.stats[k], 0, 1e9, 0);
    if (obj(raw.daily)) {
      const days = Object.keys(raw.daily).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-40);
      for (const k of days) { const e = raw.daily[k]; if (obj(e)) d.daily[k] = { best: int(e.best, 0, 1e9, 0), won: !!e.won, coins: !!e.coins }; }
    }
    if (obj(raw.endless)) {
      d.endless.best = int(raw.endless.best, 0, 1e9, 0); d.endless.rows = int(raw.endless.rows, 0, 1e6, 0);
      const run = raw.endless.run;
      d.endless.run = obj(run) && obj(run.st) && Array.isArray(run.st.grid) && run.st.grid.length === 16 ? run : null;
    }
    if (obj(raw.opts)) {
      const o = raw.opts;
      d.opts.music = typeof o.music === 'number' ? Math.max(0, Math.min(1, o.music)) : d.opts.music;
      d.opts.sfx = typeof o.sfx === 'number' ? Math.max(0, Math.min(1, o.sfx)) : d.opts.sfx;
      for (const k of ['muted', 'patterns', 'preview', 'tutorials']) if (typeof o[k] === 'boolean') d.opts[k] = o[k];
      if (['lang', 'kurz'].indexOf(o.line) >= 0) d.opts.line = o.line;
      if (['auto', 'an', 'aus'].indexOf(o.motion) >= 0) d.opts.motion = o.motion;
      if (['auto', 'hoch', 'niedrig'].indexOf(o.quality) >= 0) d.opts.quality = o.quality;
    }
    if (obj(raw.cos)) {
      const c = raw.cos, ok = id => typeof id === 'string' && /^[a-z0-9]{1,16}$/.test(id);
      if (Array.isArray(c.owned)) for (const id of c.owned) if (ok(id) && d.cos.owned.indexOf(id) < 0) d.cos.owned.push(id);
      for (const k of ['cannon', 'finish', 'phones']) if (ok(c[k]) && d.cos.owned.indexOf(c[k]) >= 0) d.cos[k] = c[k];
    }
    if (obj(raw.last)) d.last.level = Math.min(d.unlocked, int(raw.last.level, 1, LEVELS, 1));
    if (obj(raw.tut)) for (const k of Object.keys(raw.tut)) if (/^[a-z0-9]{1,12}$/.test(k)) d.tut[k] = 1;
    d.ts = int(raw.ts, 0, 9e15, 0);
    return d;
  }

  // ---------- Erfolge (alle erreichbar; Fortschritt aus echten Spielwerten) ----------
  const worldDone = w => d => { for (let n = (w - 1) * 15 + 1; n <= w * 15; n++) if (!d.stars[n]) return false; return true; };
  const worldProg = w => d => { let k = 0; for (let n = (w - 1) * 15 + 1; n <= w * 15; n++) if (d.stars[n]) k++; return [k, 15]; };
  function totalStars(d) { let s = 0; for (const k in d.stars) s += d.stars[k]; return s; }
  const threeStars = d => Object.keys(d.stars).filter(k => d.stars[k] === 3).length;
  const stat = (k, n) => ({ test: d => d.stats[k] >= n, prog: d => [Math.min(d.stats[k], n), n] });
  const WORLD_NAMES = ['Funkis Garten', 'Neon-Funkstadt', 'Wolkenstudio', 'Kristallhöhlen', 'Unterwasser-Frequenz', 'Zauberwald', 'Sternensender', 'Regenbogen-Tempel', 'Gewitterkanal', 'Großer Radioturm'];
  const ACH = [
    Object.assign({ id: 'dreier', name: 'Erster Dreier', desc: 'Lass deine ersten drei Blasen platzen.', icon: '🫧' }, stat('pops', 3)),
    Object.assign({ id: 'regen', name: 'Blasenregen', desc: 'Lass mit einem Schuss 10 Blasen fallen.', icon: '🌧️' }, stat('bestDrop', 10)),
    Object.assign({ id: 'combo', name: 'Combo-Funk', desc: 'Schaffe eine 5er-Combo (5 Treffer in Folge).', icon: '🔥' }, stat('bestCombo', 5)),
    Object.assign({ id: 'bande', name: 'Bandenprofi', desc: 'Triff 5-mal mit einem Bandenschuss.', icon: '↩️' }, stat('banks', 5)),
    Object.assign({ id: 'bande2', name: 'Doppelbande', desc: 'Triff nach zwei Wandabprallern.', icon: '🎱' }, stat('bigBank', 1)),
    Object.assign({ id: 'bombe', name: 'Bombenstimmung', desc: 'Setze 10 Bomben ein (geschossen oder im Feld).', icon: '💣' }, stat('bombs', 10)),
    Object.assign({ id: 'bogen', name: 'Regenbogenjäger', desc: 'Schieße 5 Regenbogenblasen.', icon: '🌈' }, stat('rainbows', 5)),
    Object.assign({ id: 'blitz', name: 'Blitzableiter', desc: 'Löse 5 Blitze aus.', icon: '⚡' }, stat('bolts', 5)),
    Object.assign({ id: 'eis', name: 'Eisbrecher', desc: 'Taue 25 Eisblasen auf.', icon: '🧊' }, stat('ice', 25)),
    Object.assign({ id: 'kristall', name: 'Kristallretter', desc: 'Rette 30 Kristalle.', icon: '💎' }, stat('crystals', 30)),
    Object.assign({ id: 'sterne', name: 'Sternenfänger', desc: 'Sammle 10 Sternenblasen ein.', icon: '🌟' }, stat('stars', 10)),
    Object.assign({ id: 'kette', name: 'Kettenreaktion', desc: 'Löse 3 Kettenblasen-Gruppen aus.', icon: '⛓️' }, stat('chains', 3)),
    Object.assign({ id: 'perfekt', name: 'Perfektionist', desc: 'Gewinne ein Level mit mindestens der Hälfte der Schüsse übrig.', icon: '🎯' }, stat('perfect', 1)),
    ...WORLD_NAMES.map((n, i) => ({ id: 'welt' + (i + 1), name: n, desc: 'Schließe alle 15 Level von Welt ' + (i + 1) + ' ab.', icon: '🏁', test: worldDone(i + 1), prog: worldProg(i + 1) })),
    { id: 'drei30', name: 'Sternensammler', desc: 'Hole in 30 Leveln drei Sterne.', icon: '⭐', test: d => threeStars(d) >= 30, prog: d => [Math.min(threeStars(d), 30), 30] },
    { id: 'stern300', name: 'Sternenhimmel', desc: 'Sammle insgesamt 300 Sterne.', icon: '✨', test: d => totalStars(d) >= 300, prog: d => [Math.min(totalStars(d), 300), 300] },
    { id: 'endlos5k', name: 'Dauerfunk', desc: 'Erreiche im Endlosmodus 5.000 Punkte.', icon: '♾️', test: d => d.endless.best >= 5000, prog: d => [Math.min(d.endless.best, 5000), 5000] },
    { id: 'endlos10', name: 'Standhaft', desc: 'Überstehe im Endlosmodus 10 neue Reihen in einer Runde.', icon: '🧱', test: d => d.endless.rows >= 10, prog: d => [Math.min(d.endless.rows, 10), 10] },
    Object.assign({ id: 'tag1', name: 'Tagesfunker', desc: 'Schaffe eine Tagesaufgabe.', icon: '📅' }, stat('dailyWins', 1)),
    Object.assign({ id: 'tag5', name: 'Stammhörer', desc: 'Schaffe 5 Tagesaufgaben.', icon: '📻' }, stat('dailyWins', 5)),
    Object.assign({ id: 'shop', name: 'Stilbewusst', desc: 'Kaufe dein erstes Design in der Sammlung.', icon: '🎨' }, stat('bought', 1))
  ];
  const ACH_BY_ID = {}; ACH.forEach(a => { ACH_BY_ID[a.id] = a; });

  // ---------- Speicher-Objekt ----------
  function memoryStorage() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
  function create(storage) {
    let ok = true, store = storage;
    if (!store) { try { store = root().localStorage; store.getItem(KEY); } catch (e) { store = memoryStorage(); ok = false; } }
    const api = { KEY, ACH, ACH_BY_ID, available: ok, data: null, broken: false };
    function root() { return typeof window !== 'undefined' ? window : {}; }
    api.load = function () {
      let raw = null;
      try { raw = store.getItem(KEY); } catch (e) { api.available = false; }
      if (raw == null) { api.data = defaults(); return api.data; }
      try { api.data = validate(JSON.parse(raw)); }
      catch (e) {   // kaputtes JSON: sichern und neu anfangen
        api.broken = true; try { store.setItem(BACKUP, String(raw).slice(0, 200000)); } catch (e2) {}
        api.data = defaults();
      }
      return api.data;
    };
    api.persist = function () {
      api.data.ts = Date.now();
      try { store.setItem(KEY, JSON.stringify(api.data)); api.available = true; return true; } catch (e) { api.available = false; return false; }
    };
    api.reset = function () { api.data = defaults(); api.persist(); };
    api.totalStars = () => totalStars(api.data);
    api.worldStars = w => { let s = 0; for (let n = (w - 1) * 15 + 1; n <= w * 15; n++) s += api.data.stars[n] || 0; return s; };
    api.worldUnlocked = w => api.data.unlocked >= (w - 1) * 15 + 1;
    api.isUnlocked = n => n >= 1 && n <= api.data.unlocked;
    api.hasProgress = () => api.data.unlocked > 1 || Object.keys(api.data.stars).length > 0 || api.data.stats.shots > 0;
    // Sieg eintragen. Münzen gibt es nur für Verbesserungen -> mehrfaches Laden/Neustarten bringt nichts doppelt.
    api.recordWin = function (n, score, stars) {
      const d = api.data, oldStars = d.stars[n] || 0, first = !oldStars, out = { first, newStars: Math.max(0, stars - oldStars), coins: 0, unlocked: false, newBest: false, world: false };
      if (stars > oldStars) d.stars[n] = stars;
      if (score > (d.best[n] || 0)) { d.best[n] = score; out.newBest = true; }
      out.coins = (first ? 20 : 0) + out.newStars * 10;
      d.coins += out.coins;
      if (n < LEVELS && d.unlocked < n + 1) { d.unlocked = n + 1; out.unlocked = true; }
      if (first && n % 15 === 0) out.world = true;
      d.last.level = Math.min(LEVELS, n < LEVELS ? n + 1 : n);
      d.stats.wins++;
      return out;
    };
    api.recordDaily = function (date, score, won) {
      const d = api.data, e = d.daily[date] || { best: 0, won: false, coins: false }, out = { coins: 0, newBest: score > e.best, firstWin: won && !e.won };
      e.best = Math.max(e.best, score); if (won && !e.won) { e.won = true; d.stats.dailyWins++; }
      if (won && !e.coins) { e.coins = true; out.coins = 40; d.coins += 40; }
      d.daily[date] = e;
      const keys = Object.keys(d.daily).sort(); while (keys.length > 40) delete d.daily[keys.shift()];
      return out;
    };
    api.recordEndless = function (score, rows) {
      const d = api.data, out = { newBest: score > d.endless.best, coins: Math.min(100, Math.floor(score / 500)) };
      d.endless.best = Math.max(d.endless.best, score); d.endless.rows = Math.max(d.endless.rows, rows); d.endless.run = null;
      d.coins += out.coins; return out;
    };
    api.addStat = function (k, n) { if (k in api.data.stats) api.data.stats[k] += n || 0; };
    api.maxStat = function (k, v) { if (k in api.data.stats && v > api.data.stats[k]) api.data.stats[k] = v; };
    api.checkAch = function () {
      const fresh = [];
      for (const a of ACH) if (!api.data.ach[a.id] && a.test(api.data)) { api.data.ach[a.id] = Date.now(); api.data.coins += 25; fresh.push(a); }
      return fresh;
    };
    api.owns = id => api.data.cos.owned.indexOf(id) >= 0;
    api.grant = id => { if (!api.owns(id)) api.data.cos.owned.push(id); };
    api.buy = function (id, cost) {
      if (api.owns(id)) return true;
      if (!(cost >= 0) || api.data.coins < cost) return false;
      api.data.coins -= cost; api.grant(id); api.data.stats.bought++; return true;
    };
    api.equip = function (slot, id) { if (!api.owns(id) || ['cannon', 'finish', 'phones'].indexOf(slot) < 0) return false; api.data.cos[slot] = id; return true; };
    api.load();
    return api;
  }

  return { KEY, SCHEMA, ACH, ACH_BY_ID, defaults, validate, create, memoryStorage };
});
