/* ColorPop Universe – Spielstand. Eigene Schlüssel mit Präfix „colorpop-universe-v1“ (nur diese werden gelesen/geschrieben; die
 * Google-Sicherung über ../cloud/anmacha-cloud.js nutzt dasselbe Präfix). JSON-Version v: 1, defensive Prüfung, Migration, Sicherung
 * kaputter Stände, Speicherplatz-Fehler werden gemeldet statt das Spiel anzuhalten. Bis zu 3 Profile pro Gerät. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var PREFIX = 'colorpop-universe-v1', VERSION = 1;
  var META = PREFIX + '.meta', SETTINGS = PREFIX + '.settings';
  var PROFILE_IDS = ['p1', 'p2', 'p3'];
  var BOOSTER_PRICE = { hammer: 3, mini: 4, color: 2, shuffle: 3 };
  CPU.SAVE_PREFIX = PREFIX; CPU.BOOSTER_PRICE = BOOSTER_PRICE;

  var DEFAULT_KEYS = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', confirm: 'Space', hint: 'KeyH', undo: 'KeyU', restart: 'KeyR', full: 'KeyF', pause: 'KeyP', mute: 'KeyM' };
  CPU.DEFAULT_KEYS = DEFAULT_KEYS;
  function defSettings() {
    return { music: 0.5, sfx: 0.8, musicOn: true, sfxOn: true, quality: 'auto', motion: 'auto', contrast: false, confirmTap: false, holdPreview: true, vibrate: true, speed: 1, showPoints: true, keys: Object.assign({}, DEFAULT_KEYS), tutorials: true };
  }
  function defProfile(name) {
    return { v: VERSION, name: name || 'Spieler 1', created: Date.now(), levels: {}, unlocked: 1, funken: 5, boosters: { hammer: 2, mini: 2, color: 2, shuffle: 2 },
      records: { classic: {}, time: {}, moves: {}, daily: {} }, puzzles: {}, stats: {}, ach: {}, modesPlayed: {}, seen: {}, cosmetic: { stone: 'jelly', pop: 'spark', bg: 'world' },
      dailyStreak: 0, dailyLast: '', weekly: { week: '', tasks: {} }, tower: { floor: 1, best: 0 }, day: null, weekGoals: null, milestones: {}, resume: null };
  }
  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  // Migration: ältere/fehlende Felder ergänzen, falsche Typen verwerfen (nie den ganzen Stand löschen)
  function migrate(p) {
    var d = defProfile(p && p.name);
    if (!isObj(p)) return d;
    if (!p.v) p.v = 1;   // v0 (ohne Versionsfeld) = Aufbau wie v1
    Object.keys(d).forEach(function (k) {
      if (p[k] === undefined || (isObj(d[k]) && !isObj(p[k])) || (typeof d[k] === 'number' && typeof p[k] !== 'number') || (typeof d[k] === 'string' && typeof p[k] !== 'string')) p[k] = d[k];
    });
    ['records', 'boosters', 'cosmetic', 'tower', 'weekly'].forEach(function (k) { Object.keys(d[k]).forEach(function (j) { if (p[k][j] === undefined) p[k][j] = d[k][j]; }); });
    Object.keys(p.levels).forEach(function (k) { var l = p.levels[k]; if (!isObj(l) || !(+k >= 1 && +k <= 300)) delete p.levels[k]; else { l.stars = Math.max(0, Math.min(3, l.stars | 0)); l.best = Math.max(0, l.best | 0); } });
    p.unlocked = Math.max(1, Math.min(300, p.unlocked | 0));
    p.funken = Math.max(0, p.funken | 0);
    p.v = VERSION;
    return p;
  }
  // Prüfschema für Import (streng): nur echte ColorPop-Stände
  function validImport(o) {
    if (!isObj(o) || o.format !== 'colorpop-universe-save' || o.v !== VERSION || !isObj(o.profile)) return 'Keine ColorPop-Universe-Datei (Format/Version passt nicht).';
    var p = o.profile;
    if (!isObj(p.levels) || !isObj(p.stats) || !isObj(p.records)) return 'Die Datei ist unvollständig.';
    for (var k in p.levels) if (!(+k >= 1 && +k <= 300) || !isObj(p.levels[k])) return 'Ungültiger Leveleintrag ' + k + '.';
    for (var s in p.stats) if (typeof p.stats[s] !== 'number' || !isFinite(p.stats[s])) return 'Ungültige Statistik ' + s + '.';
    return '';
  }

  function Store(ls) {
    if (!(this instanceof Store)) return new Store(ls);
    this.ls = ls; this.lastError = ''; this.load();
  }
  var P = Store.prototype;
  P.read = function (k) { try { return this.ls ? this.ls.getItem(k) : null; } catch (e) { return null; } };
  P.write = function (k, v) {
    try { if (this.ls) this.ls.setItem(k, v); this.lastError = ''; return true; }
    catch (e) { this.lastError = /quota/i.test(String(e && (e.name || e.message))) ? 'quota' : 'write'; return false; }
  };
  P.parse = function (k, fallback) {
    var raw = this.read(k); if (raw == null) return fallback();
    try { var o = JSON.parse(raw); if (o == null) throw new Error('leer'); return o; }
    catch (e) { this.write(k + '.broken', raw); this.broken = (this.broken || 0) + 1; return fallback(); }   // kaputten Stand sichern, nicht wegwerfen
  };
  P.load = function () {
    this.meta = this.parse(META, function () { return { v: VERSION, active: 'p1', names: { p1: 'Spieler 1' } }; });
    if (!isObj(this.meta) || PROFILE_IDS.indexOf(this.meta.active) < 0) this.meta = { v: VERSION, active: 'p1', names: { p1: 'Spieler 1' } };
    if (!isObj(this.meta.names)) this.meta.names = { p1: 'Spieler 1' };
    var s = this.parse(SETTINGS, defSettings); this.settings = Object.assign(defSettings(), isObj(s) ? s : {});
    this.settings.keys = Object.assign({}, DEFAULT_KEYS, isObj(this.settings.keys) ? this.settings.keys : {});
    this.p = migrate(this.parse(this.key(this.meta.active), function () { return defProfile(); }));
    if (!this.meta.names[this.meta.active]) this.meta.names[this.meta.active] = this.p.name;
    return this;
  };
  P.key = function (id) { return PREFIX + '.' + id; };
  P.save = function () {
    var ok = this.write(this.key(this.meta.active), JSON.stringify(this.p));
    ok = this.write(META, JSON.stringify(this.meta)) && ok;
    return this.write(SETTINGS, JSON.stringify(this.settings)) && ok;
  };
  P.saveSettings = function () { return this.write(SETTINGS, JSON.stringify(this.settings)); };
  P.profiles = function () { var m = this.meta; return PROFILE_IDS.map(function (id) { return { id: id, name: m.names[id] || '', exists: !!m.names[id], active: id === m.active }; }); };
  P.switchTo = function (id) {
    if (PROFILE_IDS.indexOf(id) < 0) return false;
    this.save(); this.meta.active = id;
    if (!this.meta.names[id]) this.meta.names[id] = 'Spieler ' + id.slice(1);
    this.p = migrate(this.parse(this.key(id), function () { return defProfile('Spieler ' + id.slice(1)); }));
    this.p.name = this.meta.names[id];
    this.save(); return true;
  };
  P.rename = function (name) { name = String(name || '').trim().slice(0, 20) || 'Spieler'; this.p.name = name; this.meta.names[this.meta.active] = name; this.save(); };
  P.resetProfile = function () { var n = this.p.name; this.write(this.key(this.meta.active) + '.backup', JSON.stringify(this.p)); this.p = defProfile(n); this.save(); };
  P.exportJSON = function () { return JSON.stringify({ format: 'colorpop-universe-save', v: VERSION, exported: new Date().toISOString(), profile: this.p }, null, 1); };
  P.importJSON = function (text) {
    var o; try { o = JSON.parse(text); } catch (e) { return { ok: false, error: 'Die Datei ist kein gültiges JSON.' }; }
    var e2 = validImport(o); if (e2) return { ok: false, error: e2 };
    this.write(this.key(this.meta.active) + '.backup', JSON.stringify(this.p));   // alter Stand bleibt als Sicherung
    this.p = migrate(o.profile); this.p.name = this.p.name || this.meta.names[this.meta.active]; this.meta.names[this.meta.active] = this.p.name;
    this.save(); return { ok: true };
  };
  P.restoreBackup = function () {
    var raw = this.read(this.key(this.meta.active) + '.backup'); if (!raw) return false;
    try { this.p = migrate(JSON.parse(raw)); this.save(); return true; } catch (e) { return false; }
  };

  // ---------- Fortschritt ----------
  function add(p, k, n) { p.stats[k] = (p.stats[k] || 0) + (n || 0); }
  P.ensureDay = function (day, week) {
    var p = this.p;
    if (!p.day || p.day.date !== day) p.day = { date: day, snap: Object.assign({}, p.stats), maxGroup: 0, modes: {}, done: {}, newStars: 0, levelWins: 0 };
    if (!p.weekGoals || p.weekGoals.week !== week) p.weekGoals = { week: week, snap: Object.assign({}, p.stats), done: {}, newStars: 0, levelWins: 0, modes: {} };
  };
  // Ergebnis einer Runde verbuchen. ctx: {mode, res (Session-Ergebnis), level (Def), limit, preset, puzzle, floor, week, k, bot, day}
  P.recordRound = function (ctx) {
    var p = this.p, r = ctx.res, st = r.stats || {}, out = { funken: 0, newRecord: false, newStars: 0, ach: [], tasks: [] };
    p.modesPlayed[ctx.mode] = 1;
    if (p.day) { p.day.modes[ctx.mode] = 1; p.day.maxGroup = Math.max(p.day.maxGroup, st.maxGroup || 0); }
    if (p.weekGoals) p.weekGoals.modes[ctx.mode] = 1;
    add(p, 'rounds', 1); add(p, 'removed', st.removed); add(p, 'items', (st.items || []).reduce(function (a, b) { return a + b; }, 0));
    add(p, 'ice', st.ice); add(p, 'blocks', st.blocks); add(p, 'specials', st.specials); add(p, 'boosters', st.boosters);
    var groups = 0; Object.keys(st.sizes || {}).forEach(function (s) { groups += st.sizes[s]; }); add(p, 'groups', groups);
    p.stats.maxGroup = Math.max(p.stats.maxGroup || 0, st.maxGroup || 0);
    if (r.cleared) add(p, 'clears', 1);
    var best = function (obj, key, v) { if (!(obj[key] >= v)) { var had = obj[key] > 0; obj[key] = v; if (had) out.newRecord = true; return true; } return false; };
    switch (ctx.mode) {
      case 'adventure': {
        var id = ctx.level.id, L = p.levels[id] || (p.levels[id] = { stars: 0, best: 0 });
        if (r.won) {
          var gained = Math.max(0, r.stars - L.stars);
          if (!L.stars) { add(p, 'levelWinsTotal', 1); if (p.day) p.day.levelWins++; if (p.weekGoals) p.weekGoals.levelWins++; }
          if (r.score > L.best && L.best > 0) out.newRecord = true;
          L.stars = Math.max(L.stars, r.stars); L.best = Math.max(L.best, r.score);
          out.newStars = gained; out.funken += gained;   // Funken nur für NEUE Sterne – Wiederholen dupliziert nichts
          if (p.day) p.day.newStars += gained; if (p.weekGoals) p.weekGoals.newStars += gained;
          if (!st.boosters) add(p, 'pureWins', 1);
          if (id >= p.unlocked && id < 300) p.unlocked = id + 1;
          var won = CPU.profileWon(p), mile = Math.floor(won / 10) * 10;   // Meilenstein alle 10 geschafften Level: +5 Funken
          if (mile >= 10 && !p.milestones[mile]) { p.milestones[mile] = 1; out.funken += 5; out.milestone = mile; }
        }
        break;
      }
      case 'classic': var key = ctx.preset || 'custom'; best(p.records.classic, key, r.score); p.records.classicMax = Math.max(p.records.classicMax || 0, r.score); break;
      case 'zen': add(p, 'zenBoards', r.boards || 1); best(p.records, 'zen', r.score); break;
      case 'sprint': best(p.records, 'sprint', r.score); break;
      case 'time': best(p.records.time, String(ctx.limit), r.score); break;
      case 'moves': best(p.records.moves, String(ctx.limit), r.score); break;
      case 'chaos': best(p.records, 'chaos', r.score); break;
      case 'gravity': best(p.records, 'gravity', r.score); break;
      case 'puzzle': { var pz = p.puzzles[ctx.puzzle.id] || (p.puzzles[ctx.puzzle.id] = { stars: 0, moves: 0 }); if (r.won) { pz.stars = Math.max(pz.stars, r.stars); pz.moves = pz.moves ? Math.min(pz.moves, r.moves) : r.moves; } break; }
      case 'daily': {
        add(p, 'daily', 1); best(p.records.daily, ctx.day, r.score);
        if (p.dailyLast !== ctx.day) { var y = new Date(Date.parse(ctx.day + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10); p.dailyStreak = p.dailyLast === y ? p.dailyStreak + 1 : 1; p.dailyLast = ctx.day; }
        var keys = Object.keys(p.records.daily).sort(); while (keys.length > 60) delete p.records.daily[keys.shift()];
        break;
      }
      case 'weekly': {
        if (p.weekly.week !== ctx.week) p.weekly = { week: ctx.week, tasks: {}, full: false };
        if (r.won) { p.weekly.tasks[ctx.k] = Math.max(p.weekly.tasks[ctx.k] || 0, r.score); }
        if (!p.weekly.full && Object.keys(p.weekly.tasks).length >= 7) { p.weekly.full = true; add(p, 'weekFull', 1); out.funken += 10; }
        break;
      }
      case 'tower': {
        if (r.won) { p.tower.floor = ctx.floor + 1; p.tower.best = Math.max(p.tower.best, ctx.floor); }
        p.records.tower = Math.max(p.records.tower || 0, p.tower.best);
        break;
      }
      case 'duel': if (r.winner === 0) { add(p, 'duelWins', 1); if (ctx.bot === 'hard') add(p, 'duelHard', 1); } break;
      case 'local': add(p, 'local', 1); break;
    }
    out.tasks = this.claimTasks(); out.tasks.forEach(function (t) { out.funken += t.reward; });
    out.ach = this.checkAch(); out.funken += out.ach.length * 2;
    p.funken += out.funken;
    this.save();
    return out;
  };
  P.checkAch = function () {
    var p = this.p, now = Date.now(), fresh = [];
    (CPU.ACHIEVEMENTS || []).forEach(function (a) { if (!p.ach[a.id]) { var ok = false; try { ok = a.check(p); } catch (e) {} if (ok) { p.ach[a.id] = now; fresh.push(a); } } });
    return fresh;
  };
  // ---------- Tägliche Aufgaben / Wochenziele ----------
  var TASKS = [
    { id: 'remove', text: 'Entferne {n} Steine', n: [150, 300, 500], stat: 'removed' },
    { id: 'groups', text: 'Entferne {n} Gruppen', n: [30, 60, 100], stat: 'groups' },
    { id: 'big', text: 'Bilde eine Gruppe mit mindestens {n} Steinen', n: [8, 10, 12], f: function (p) { return p.day ? p.day.maxGroup : 0; } },
    { id: 'levels', text: 'Schaffe {n} neue Abenteuer-Level', n: [1, 2, 3], f: function (p, w) { var o = w ? p.weekGoals : p.day; return o ? o.levelWins : 0; } },
    { id: 'stars', text: 'Sammle {n} neue Sterne', n: [3, 5, 8], f: function (p, w) { var o = w ? p.weekGoals : p.day; return o ? o.newStars : 0; } },
    { id: 'clear', text: 'Räume {n}× ein Brett komplett leer', n: [1, 2, 3], stat: 'clears' },
    { id: 'modes', text: 'Spiele {n} verschiedene Modi', n: [2, 3, 4], f: function (p, w) { var o = w ? p.weekGoals : p.day; return o ? Object.keys(o.modes).length : 0; } },
    { id: 'items', text: 'Bringe {n} Sammelobjekte nach unten', n: [4, 8, 12], stat: 'items' }
  ];
  function pickTasks(seedText, count, scale) {
    var r = CPU.rng(CPU.hash(seedText)), pool = TASKS.slice(), out = [];
    for (var i = 0; i < count; i++) { var t = pool.splice(r.int(pool.length), 1)[0], lv = r.int(3); out.push({ id: t.id, n: Math.round(t.n[lv] * scale), text: t.text.replace('{n}', Math.round(t.n[lv] * scale)), def: t }); }
    return out;
  }
  P.tasks = function () {
    var p = this.p; if (!p.day || !p.weekGoals) return { day: [], week: [] };
    var mk = function (list, o, weekly) {
      return list.map(function (t) {
        var cur = t.def.f ? t.def.f(p, weekly) : (p.stats[t.def.stat] || 0) - (o.snap[t.def.stat] || 0);
        if (weekly && t.id === 'big') cur = p.stats.maxGroup || 0;
        return { id: t.id, text: t.text, n: t.n, cur: Math.min(t.n, cur), done: !!o.done[t.id], reward: weekly ? 10 : 3 };
      });
    };
    return { day: mk(pickTasks('cpu-day-' + p.day.date, 3, 1), p.day, false), week: mk(pickTasks('cpu-wk-' + p.weekGoals.week, 3, 4), p.weekGoals, true) };
  };
  P.claimTasks = function () {
    var p = this.p, t = this.tasks(), out = [];
    t.day.forEach(function (x) { if (!x.done && x.cur >= x.n) { p.day.done[x.id] = 1; out.push(x); } });
    t.week.forEach(function (x) { if (!x.done && x.cur >= x.n) { p.weekGoals.done[x.id] = 1; out.push(x); } });
    return out;
  };
  // ---------- Booster ----------
  P.buyBooster = function (type) {
    var c = BOOSTER_PRICE[type]; if (!c || this.p.funken < c) return false;
    this.p.funken -= c; this.p.boosters[type] = (this.p.boosters[type] || 0) + 1; this.save(); return true;
  };
  P.useBooster = function (type) { if (!(this.p.boosters[type] > 0)) return false; this.p.boosters[type]--; this.save(); return true; };

  CPU.Store = Store; CPU.migrate = migrate; CPU.validImport = validImport; CPU.defProfile = defProfile; CPU.defSettings = defSettings;
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
