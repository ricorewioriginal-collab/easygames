/*! RicoPoly 3D – Profil, Einstellungen, Statistiken, Erfolge und Spielstände (localStorage, Präfix "ricopoly.v1.").
 * Alle Schlüssel mit diesem Präfix gleicht cloud/anmacha-cloud.js nach Google-Anmeldung mit Firestore ab (geräteübergreifend). */
(function (root) {
  'use strict';
  var P = 'ricopoly.v1.', LS = null;
  try { LS = root.localStorage; LS.setItem(P + 'probe', '1'); LS.removeItem(P + 'probe'); } catch (e) { LS = null; }
  var mem = {};
  function get(k, def) { try { var v = LS ? LS.getItem(P + k) : mem[k]; return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  function set(k, v) { var j = JSON.stringify(v); try { if (LS) LS.setItem(P + k, j); else mem[k] = j; return true; } catch (e) { mem[k] = j; return false; } }
  function del(k) { try { if (LS) LS.removeItem(P + k); } catch (e) {} delete mem[k]; }

  var ACH = [
    { id: 'first_game', icon: '🎲' }, { id: 'first_win', icon: '🏆' }, { id: 'ten_wins', icon: '👑' }, { id: 'first_group', icon: '🧩' },
    { id: 'trade_ok', icon: '🤝' }, { id: 'big_auction', icon: '🔨' }, { id: 'rich', icon: '💰' }, { id: 'low_start_win', icon: '🪙' },
    { id: 'streak3', icon: '🔥' }, { id: 'beat_hard', icon: '🧠' }, { id: 'tutorial_done', icon: '🎓' }, { id: 'all_worlds', icon: '🌍' },
    { id: 'online_game', icon: '🌐' }, { id: 'hotel', icon: '🏨' }
  ];
  var DEFAULT_SETTINGS = { lang: (navigator.language || 'de').slice(0, 2) === 'en' ? 'en' : 'de', quality: 'auto', shadows: true, particles: true, reduced: false, saver: false, speed: 1, think: true, tips: true, autoCam: true, master: 0.8, music: 0.45, sfx: 0.8, mute: false };

  function rid() { var a = new Uint8Array(9); (root.crypto || {}).getRandomValues ? root.crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; }); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function load() {
    var p = get('profile', null);
    if (!p || !p.id) p = { id: rid(), name: '', avatar: '🙂', char: 'businessman', look: {}, created: Date.now() };
    p.stats = Object.assign({ games: 0, wins: 0, losses: 0, playMs: 0, highestMoney: 0, streak: 0, bestStreak: 0, byWorld: {}, byChar: {}, hardWins: 0, trades: 0 }, p.stats || {});
    p.achievements = p.achievements || {}; p.history = p.history || []; p.friends = p.friends || [];
    p.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings || {});
    p.world = p.world || 'metropolis';
    return p;
  }
  function save(p) { p.updated = Date.now(); return set('profile', p); }

  function unlock(p, id) { if (p.achievements[id]) return false; p.achievements[id] = Date.now(); return true; }
  function isUnlocked(p, charId) { var need = root.RicoChars && root.RicoChars.LOCKED[charId]; return !need || !!p.achievements[need]; }

  // Partie auswerten: Statistik, Verlauf, Erfolge. me = Spielerindex des Profilbesitzers (-1 = nur Zuschauer)
  function recordGame(p, s, me, info) {
    var R = root.RicoRules, gained = [];
    if (me < 0 || !s.players[me]) return gained;
    var st = p.stats, won = s.winner === me, pl = s.players[me];
    st.games++; if (won) { st.wins++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak); } else { st.losses++; st.streak = 0; }
    st.playMs += Math.max(0, info.ms || 0);
    var mm = s.stats[me] ? s.stats[me].maxMoney : pl.money; st.highestMoney = Math.max(st.highestMoney, mm);
    st.byWorld[s.world] = (st.byWorld[s.world] || 0) + 1; st.byChar[pl.char] = (st.byChar[pl.char] || 0) + 1;
    st.trades += s.stats[me] ? s.stats[me].trades : 0;
    var order = R.ranking(s);
    var place = order.map(function (o) { return o.i; }).indexOf(me) + 1;
    p.history.unshift({ d: Date.now(), mode: s.mode, world: s.world, won: won, place: place, n: s.players.length, worth: R.worth(s, me), rounds: s.round, online: !!s.online, ms: info.ms || 0,
      names: s.players.map(function (x) { return x.name; }).slice(0, 6) });
    p.history = p.history.slice(0, 30);
    function g(id) { if (unlock(p, id)) gained.push(id); }
    g('first_game');
    if (won) g('first_win');
    if (st.wins >= 10) g('ten_wins');
    if (st.streak >= 3) g('streak3');
    if (won && s.cfg.startMoney <= 800) g('low_start_win');
    if (won && s.players.some(function (x, i) { return i !== me && x.bot === 'hard'; })) { g('beat_hard'); st.hardWins++; }
    if (s.online) g('online_game');
    if (info.tutorial) g('tutorial_done');
    if (['metropolis', 'fantasy', 'future'].every(function (w) { return st.byWorld[w]; })) g('all_worlds');
    save(p);
    return gained;
  }
  // Laufende Erfolge (während der Partie)
  function checkLive(p, s, me) {
    var R = root.RicoRules, gained = [];
    if (me < 0 || !s.players[me]) return gained;
    function g(id) { if (unlock(p, id)) gained.push(id); }
    for (var gr = 0; gr < 8; gr++) if (R.groupOwned(s, gr, me)) { g('first_group'); break; }
    if (s.stats[me] && s.stats[me].trades > 0) g('trade_ok');
    if (s.stats[me] && s.stats[me].maxAuction >= 300) g('big_auction');
    if (R.worth(s, me) >= 5000) g('rich');
    if (s.own.some(function (o) { return o && o.o === me && o.h === 5; })) g('hotel');
    if (gained.length) save(p);
    return gained;
  }

  // Spielstände: "auto" (automatisch nach jeder Aktion), "slot1".."slot3" (manuell), "host" (Online-Gastgeber)
  function saveGame(slot, s, meta) { return set('save.' + slot, { t: Date.now(), meta: meta || {}, s: s }); }
  function loadGame(slot) {
    var d = get('save.' + slot, null);
    if (!d || !d.s) return null;
    var err; try { err = root.RicoRules.validate(d.s); } catch (e) { err = 'schema'; }
    if (err) return { error: err, t: d.t };
    return d;
  }
  function listSaves() { return ['auto', 'slot1', 'slot2', 'slot3', 'host'].map(function (k) { var d = get('save.' + k, null); return d && d.s ? { slot: k, t: d.t, meta: d.meta, s: d.s } : null; }).filter(Boolean); }
  function deleteSave(slot) { del('save.' + slot); }

  function exportData(p) { return JSON.stringify({ app: 'RicoPoly 3D', exported: new Date().toISOString(), profile: p, saves: listSaves().map(function (x) { return { slot: x.slot, t: x.t, meta: x.meta }; }) }, null, 2); }
  function wipe() {
    var keys = [];
    try { for (var i = 0; LS && i < LS.length; i++) { var k = LS.key(i); if (k && k.indexOf(P) === 0) keys.push(k); } } catch (e) {}
    keys.forEach(function (k) { try { LS.removeItem(k); } catch (e) {} });
    mem = {};
  }

  root.RicoProfile = { load: load, save: save, get: get, set: set, del: del, ACH: ACH, unlock: unlock, isUnlocked: isUnlocked, recordGame: recordGame, checkLive: checkLive,
    saveGame: saveGame, loadGame: loadGame, listSaves: listSaves, deleteSave: deleteSave, exportData: exportData, wipe: wipe, PREFIX: P, rid: rid, storageOk: !!LS };
})(typeof self !== 'undefined' ? self : this);
