/* Spinwelten 3D – Spielstand: Anfangszustand, Prüfung/Reparatur, Migration, Speichern in Slots, Import/Export.
 * localStorage-Schlüssel (alle mit Präfix "spinwelten", damit ../cloud/anmacha-cloud.js sie mitsichern kann):
 *   spinweltenSave        aktiver Spielstand (Autosave)
 *   spinweltenSave.bak    vorheriger Autosave (Sicherung bei Fehlern)
 *   spinweltenSlot1/2     manuelle Speicherplätze
 *   spinweltenSettings    Einstellungen (Sprache, Grafik, Tasten …) – getrennt vom Spielstand */
(function (SW) {
  'use strict';
  const VERSION = 2;
  const KEY = 'spinweltenSave', BAK = 'spinweltenSave.bak', SLOT = 'spinweltenSlot';
  const LS = (() => { try { const s = globalThis.localStorage; s.getItem('x'); return s; } catch (e) { return null; } })();

  function fresh(opts) {
    opts = opts || {};
    const now = opts.now || Date.now();
    return {
      v: VERSION, created: now, saved: now, id: (SW.rng ? SW.rng.uid(10) : String(now)),
      name: opts.name || '',
      profile: opts.profile || 'classic',     // relaxed | classic | challenge
      coins: 0, energy: 50, energyT: now, material: 0, relics: 0, shields: 0, xp: 0, snacks: 0, tickets: 1,
      island: 1, ngp: 0, stages: [0, 0, 0, 0, 0], damaged: [false, false, false, false, false],
      islandsDone: 0, worldsDone: [], visited: [1], ended: false,
      cards: {}, albumsDone: {}, chests: { holz: 0, silber: 0, gold: 0, stern: 0 },
      comps: { kivi: { lvl: 1, xp: 0, care: '' } }, active: 'kivi', helper: '',
      pending: null,
      history: [], log: [],
      stats: {}, ach: {}, quests: { done: {}, base: {} },
      daily: { day: '', bonus: false, prog: {} }, weekly: { wk: '', prog: {}, claimed: {} },
      ev: { id: '', start: 0, pts: 0, claimed: [] },
      bots: {}, botT: now, botLog: 0,
      tutorial: { step: 0, done: false },
      peaceful: false, botLevel: 'normal',
      onlineDone: {}, shopDay: {}, tradeDone: {},
      clockWarn: false, lastSeen: now
    };
  }
  const num = (x, d) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
  const int0 = (x, max) => Math.max(0, Math.min(max || 9e14, Math.round(num(x, 0))));
  // Prüft und repariert einen geladenen Stand (falsche Typen, NaN, negative Werte) – nie still auf Null setzen, sondern Feld für Feld.
  function sanitize(s) {
    const f = fresh({ now: num(s && s.created, Date.now()) });
    if (!s || typeof s !== 'object') return f;
    const o = Object.assign({}, f, s);
    ['coins', 'material', 'relics', 'xp', 'snacks', 'tickets', 'islandsDone', 'ngp'].forEach(k => { o[k] = int0(o[k]); });
    o.energy = int0(o.energy, 100000);
    o.shields = int0(o.shields, 9);
    o.island = Math.max(1, Math.min(30, Math.round(num(o.island, 1))));
    o.stages = (Array.isArray(o.stages) && o.stages.length === 5 ? o.stages : f.stages).map(x => Math.max(0, Math.min(5, Math.round(num(x, 0)))));
    o.damaged = (Array.isArray(o.damaged) && o.damaged.length === 5 ? o.damaged : f.damaged).map(x => !!x);
    ['cards', 'albumsDone', 'stats', 'ach', 'bots', 'onlineDone', 'shopDay', 'tradeDone'].forEach(k => { if (!o[k] || typeof o[k] !== 'object' || Array.isArray(o[k])) o[k] = {}; });
    for (const k in o.cards) o.cards[k] = int0(o.cards[k], 99999);
    for (const k in o.stats) o.stats[k] = int0(o.stats[k], 9e14);
    o.chests = Object.assign({ holz: 0, silber: 0, gold: 0, stern: 0 }, o.chests || {});
    for (const k in o.chests) o.chests[k] = int0(o.chests[k], 9999);
    if (!o.comps || typeof o.comps !== 'object') o.comps = f.comps;
    if (!o.comps.kivi) o.comps.kivi = { lvl: 1, xp: 0, care: '' };
    for (const k in o.comps) { const c = o.comps[k]; c.lvl = Math.max(1, Math.min(10, Math.round(num(c.lvl, 1)))); c.xp = int0(c.xp, 1e6); }
    if (!o.comps[o.active]) o.active = 'kivi';
    if (o.helper && (!o.comps[o.helper] || o.helper === o.active)) o.helper = '';
    if (!Array.isArray(o.history)) o.history = []; o.history = o.history.slice(0, 50);
    if (!Array.isArray(o.log)) o.log = []; o.log = o.log.slice(0, 100);
    if (!Array.isArray(o.worldsDone)) o.worldsDone = [];
    if (!Array.isArray(o.visited)) o.visited = [1];
    if (!o.quests || typeof o.quests !== 'object') o.quests = f.quests;
    o.quests.done = o.quests.done || {}; o.quests.base = o.quests.base || {};
    o.daily = Object.assign({}, f.daily, o.daily || {}); o.weekly = Object.assign({}, f.weekly, o.weekly || {});
    o.ev = Object.assign({}, f.ev, o.ev || {}); if (!Array.isArray(o.ev.claimed)) o.ev.claimed = [];
    o.tutorial = Object.assign({}, f.tutorial, o.tutorial || {});
    if (!SW.ECON || !SW.ECON.PROFILES[o.profile]) o.profile = 'classic';
    if (!['easy', 'normal', 'hard'].includes(o.botLevel)) o.botLevel = 'normal';
    if (o.pending && (typeof o.pending !== 'object' || !['attack', 'raid'].includes(o.pending.kind))) o.pending = null;
    o.energyT = num(o.energyT, Date.now()); o.botT = num(o.botT, Date.now());
    return o;
  }
  // Migrationen: jede Version hebt den Stand um eins an
  const MIG = {
    1: s => { s.helper = s.helper || ''; s.snacks = s.snacks || 0; s.v = 2; return s; }
  };
  function migrate(s) {
    if (!s || typeof s !== 'object') return null;
    let v = Math.round(num(s.v, 1));
    if (v > VERSION) throw Object.assign(new Error('newer'), { code: 'newer' });
    while (v < VERSION) { s = (MIG[v] || (x => x))(s); v++; s.v = v; }
    return sanitize(s);
  }
  function read(key) {
    if (!LS) return null;
    try { const raw = LS.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return { __corrupt: true }; }
  }
  function write(key, obj) {
    if (!LS) return false;
    try { LS.setItem(key, JSON.stringify(obj)); return true; } catch (e) { return false; }
  }
  function load() {
    let s = read(KEY);
    if (s && s.__corrupt) s = read(BAK);
    if (!s || s.__corrupt) return null;
    try { return migrate(s); } catch (e) { if (e.code === 'newer') throw e; return null; }
  }
  let lastWrite = 0;
  function save(state, force) {
    if (!state) return false;
    state.saved = Date.now();
    const now = state.saved;
    // Sicherung des vorherigen Stands höchstens einmal pro Minute
    if (LS && (force || now - lastWrite > 60000)) { try { const prev = LS.getItem(KEY); if (prev) LS.setItem(BAK, prev); } catch (e) { /* voll */ } lastWrite = now; }
    return write(KEY, state);
  }
  function slotInfo(i) {
    const s = read(SLOT + i);
    if (!s || s.__corrupt) return null;
    return { saved: s.saved, island: s.island, ngp: s.ngp, islandsDone: s.islandsDone, coins: s.coins, profile: s.profile };
  }
  function saveSlot(i, state) { const c = JSON.parse(JSON.stringify(state)); c.saved = Date.now(); return write(SLOT + i, c); }
  function loadSlot(i) { const s = read(SLOT + i); if (!s || s.__corrupt) return null; return migrate(s); }
  function exportJSON(state) { return JSON.stringify({ game: 'spinwelten', schema: VERSION, exported: Date.now(), state }, null, 0); }
  function importJSON(text) {
    let o; try { o = JSON.parse(text); } catch (e) { throw Object.assign(new Error('json'), { code: 'json' }); }
    if (!o || o.game !== 'spinwelten' || !o.state) throw Object.assign(new Error('format'), { code: 'format' });
    return migrate(o.state);
  }
  function wipe() { if (LS) { try { LS.removeItem(KEY); } catch (e) { /* */ } } }
  // Einstellungen
  const SKEY = 'spinweltenSettings';
  const DEF_SET = { lang: '', quality: 'auto', speed: 1, skip: false, sfx: 0.8, music: 0.4, haptics: true, reducedMotion: false, keymap: null, padmap: null, apiBase: '', autoSpinMax: 0, deadzone: 0.25, invertY: false };
  function loadSettings() { const s = read(SKEY); return Object.assign({}, DEF_SET, s && !s.__corrupt ? s : {}); }
  function saveSettings(s) { return write(SKEY, s); }
  SW.Save = { VERSION, KEY, fresh, sanitize, migrate, load, save, slotInfo, saveSlot, loadSlot, exportJSON, importJSON, wipe, loadSettings, saveSettings, DEF_SET, available: !!LS };
})(globalThis.SW = globalThis.SW || {});
