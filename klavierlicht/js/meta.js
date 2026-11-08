/* Klavierlicht – Fortschritt rund ums Spielen (auch in Node testbar): Diamanten 💎, Shop (Kachel-Designs, Hintergründe, Klangfarben),
 * tägliche Aufgaben, Erfolge, Lieblingslieder, Spielzähler, Turnier der Woche, Lernpfad-Fortschritt.
 * Speicher: localStorage 'klavierlicht-meta' (wird mit dem Cloud-Spielstand der Angemeldeten gesichert, Präfix klavierlicht-).
 * Erfolge zusätzlich im easygames-Standardformat 'anmacha-gameach.klavierlicht' (Erfolge-Seite liest sie).
 * Ranglisten (nur Angemeldete mit Freigabe, cloud/anmacha-board.js) lesen die Felder stars, crowns, endlessBest und weekBoard. */
(function (root) {
  'use strict';
  const KEY = 'klavierlicht-meta', ACH_KEY = 'anmacha-gameach.klavierlicht';
  const store = root.localStorage || { getItem() { return null; }, setItem() {} };
  const SHOP = {
    design: {
      klassik: { n: 'Klassik', ic: '🟦', price: 0, base: '#081430', head: '#1d6fd6', mid: '#13357a', mark: '#7ff3ff' },
      schwarz: { n: 'Schwarz', ic: '⬛', price: 0, base: '#050505', head: '#262626', mid: '#121212', mark: '#ffffff' },
      neon: { n: 'Neon', ic: '💜', price: 30, base: '#1a0033', head: '#ff2fd0', mid: '#5a00a0', mark: '#00f7ff' },
      eis: { n: 'Eis', ic: '🧊', price: 60, base: '#06283d', head: '#7fe7ff', mid: '#1b6a8c', mark: '#ffffff' },
      glitzer: { n: 'Glitzer', ic: '✨', price: 90, base: '#2b0a3d', head: '#c86bff', mid: '#6a2a99', mark: '#ffd6ff', sparkle: true },
      gold: { n: 'Gold', ic: '🥇', price: 150, base: '#3b2600', head: '#ffcc33', mid: '#8a5a00', mark: '#fff3b0', sparkle: true },
      regenbogen: { n: 'Regenbogen', ic: '🌈', price: 80, base: '#1a1030', head: '#ff5f7e', mid: '#3a2a60', mark: '#ffffff', rainbow: true },
      holz: { n: 'Holz', ic: '🪵', price: 50, base: '#4a2e14', head: '#c58b4c', mid: '#7d5228', mark: '#ffe2b0' },
      kristall: { n: 'Kristall', ic: '💠', price: 110, base: '#0b2a4a', head: '#bfefff', mid: '#4f9fd6', mark: '#ffffff', sparkle: true },
      nachtneon: { n: 'Nacht-Neon', ic: '🟩', price: 70, base: '#000000', head: '#00ffa6', mid: '#00563a', mark: '#ff3df5' },
      weihnacht: { n: 'Weihnachten', ic: '🎄', price: 90, base: '#0b4a1e', head: '#d81e2c', mid: '#7a0f18', mark: '#ffffff', sparkle: true }
    },
    bg: {
      bonbon: { n: 'Bonbon', ic: '🍬', price: 0, c: ['#ff7ad9', '#a77bff', '#4fc8ff'] },
      nacht: { n: 'Sternennacht', ic: '🌌', price: 40, c: ['#0b0630', '#2a1470', '#0d3b7a'] },
      sonne: { n: 'Sonnenuntergang', ic: '🌅', price: 40, c: ['#ff9a3c', '#ff4f8b', '#7a3cff'] },
      ozean: { n: 'Ozean', ic: '🌊', price: 70, c: ['#00c9a7', '#0089ba', '#2c3e9e'] },
      wald: { n: 'Zauberwald', ic: '🌲', price: 70, c: ['#1f7a4d', '#2fb38a', '#a8e063'] },
      winter: { n: 'Winterzauber', ic: '❄️', price: 60, c: ['#0b3d5c', '#3f87c4', '#d6f0ff'] },
      regenbogen: { n: 'Regenbogen', ic: '🌈', price: 90, c: ['#ff6b6b', '#ffd93d', '#6bcBff'] }
    },
    // Treffer-Effekte: g = Zeichen statt Funken (null = farbige Funken)
    fx: {
      funken: { n: 'Funken', ic: '💥', price: 0, g: null },
      sterne: { n: 'Sterne', ic: '⭐', price: 30, g: '★' },
      herzen: { n: 'Herzen', ic: '💖', price: 30, g: '♥' },
      noten: { n: 'Noten', ic: '🎵', price: 40, g: '♪' },
      schnee: { n: 'Schnee', ic: '❄️', price: 40, g: '❄' },
      feuerwerk: { n: 'Feuerwerk', ic: '🎆', price: 60, g: null, big: true }
    },
    // Hilfsmittel: werden pro Runde verbraucht
    item: {
      heart: { n: 'Extra-Herz', ic: '❤️', price: 15, d: 'Ein viertes Herz für eine Runde.' },
      shield: { n: 'Schutzschild', ic: '🛡️', price: 15, d: 'Fängt einen Fehler ab.' },
      slow: { n: 'Zeitlupe', ic: '🐢', price: 20, d: '8 Sekunden lang 40 % langsamer – im Spiel antippen.' }
    },
    sound: {
      klavier: { n: 'Flügel', ic: '🎹', price: 0 },
      epiano: { n: 'E-Piano', ic: '🎛️', price: 0 },
      spieluhr: { n: 'Spieluhr', ic: '🎠', price: 40 },
      orgel: { n: 'Orgel', ic: '⛪', price: 50 },
      harfe: { n: 'Harfe', ic: '🪕', price: 60 },
      synth: { n: 'Synthesizer', ic: '🌈', price: 80 }
    }
  };
  const ACH = [
    { id: 'first', icon: '🎵', title: 'Erstes Lied', desc: 'Ein Lied zu Ende gespielt.', gems: 5 },
    { id: 'songs10', icon: '🎶', title: 'Liederfreund', desc: '10 Lieder gespielt.', gems: 10 },
    { id: 'songs50', icon: '📚', title: 'Liederbuch-Kenner', desc: '50 Lieder gespielt.', gems: 25 },
    { id: 'songs100', icon: '🏛️', title: 'Konzertpianist', desc: '100 Lieder gespielt.', gems: 50 },
    { id: 'crown', icon: '👑', title: 'Erste Krone', desc: 'Eine Tempo-Runde geschafft.', gems: 10 },
    { id: 'crown3', icon: '👑', title: 'Dreifach gekrönt', desc: 'Drei Kronen in einem Lied.', gems: 30 },
    { id: 'stars100', icon: '⭐', title: 'Sternensammler', desc: '100 Sterne gesammelt.', gems: 30 },
    { id: 'combo100', icon: '🔥', title: 'Combo 100', desc: '100 Treffer in Folge.', gems: 15 },
    { id: 'combo300', icon: '☄️', title: 'Combo 300', desc: '300 Treffer in Folge.', gems: 40 },
    { id: 'flawless', icon: '💯', title: 'Fehlerfrei', desc: 'Ein Lied nur mit perfekten Treffern.', gems: 20 },
    { id: 'modes', icon: '🧭', title: 'Alleskönner', desc: 'Jeden Spielmodus einmal gespielt.', gems: 20 },
    { id: 'lesson', icon: '🎓', title: 'Erste Lektion', desc: 'Eine Lektion im Lernpfad bestanden.', gems: 5 },
    { id: 'path', icon: '🎓', title: 'Lernpfad gemeistert', desc: 'Alle Lektionen bestanden.', gems: 50 },
    { id: 'record', icon: '⏺️', title: 'Komponist', desc: 'Eine eigene Melodie aufgenommen.', gems: 10 },
    { id: 'midi', icon: '📂', title: 'Eigene Noten', desc: 'Eine eigene MIDI-Datei gespielt.', gems: 10 },
    { id: 'duet', icon: '🤝', title: 'Duett', desc: 'Mit einem zweiten Gerät im Duett gespielt.', gems: 15 },
    { id: 'battle', icon: '⚔️', title: 'Battle-Sieger', desc: 'Ein Battle gegen ein anderes Gerät gewonnen.', gems: 20 },
    { id: 'week', icon: '🏆', title: 'Turnierspieler', desc: 'Das Turnier der Woche gespielt.', gems: 15 },
    { id: 'gems500', icon: '💎', title: 'Schatzkiste', desc: 'Insgesamt 500 Diamanten gesammelt.', gems: 0 },
    { id: 'blind', icon: '🙈', title: 'Blind gespielt', desc: 'Ein Lied mit der Herausforderung Blind geschafft.', gems: 15 }
  ];
  const QUESTS = [
    { id: 'play3', t: 'Spiele 3 Lieder', goal: 3, ev: 'song', gems: 10 },
    { id: 'play5', t: 'Spiele 5 Lieder', goal: 5, ev: 'song', gems: 15 },
    { id: 'stars6', t: 'Sammle 6 Sterne', goal: 6, ev: 'stars', gems: 15 },
    { id: 'combo50', t: 'Schaffe eine Combo von 50', goal: 50, ev: 'combo', max: true, gems: 15 },
    { id: 'perfect150', t: '150 perfekte Treffer', goal: 150, ev: 'perfect', gems: 15 },
    { id: 'crown1', t: 'Hol dir eine Krone 👑', goal: 1, ev: 'crowns', gems: 20 },
    { id: 'gold3', t: 'Triff 3 goldene Kacheln', goal: 3, ev: 'gold', gems: 10 },
    { id: 'magie', t: 'Spiele ein Lied in ✨ Magie', goal: 1, ev: 'mode:magie', gems: 10 },
    { id: 'lernen', t: 'Spiele ein Lied in 🎓 Klavier lernen', goal: 1, ev: 'mode:lernen', gems: 10 },
    { id: 'endlos', t: 'Erreiche Runde 3 in ♾️ Endlos', goal: 3, ev: 'endless', max: true, gems: 20 },
    { id: 'schwer', t: 'Schaffe ein Lied auf Schwer mit 2 Sternen', goal: 1, ev: 'hard2', gems: 20 },
    { id: 'frei', t: 'Spiele 30 Töne im 🎼 Freien Klavier', goal: 30, ev: 'freenotes', gems: 10 }
  ];
  const MODES_ALL = ['klassisch', 'magie', 'lernen', 'frei', 'endlos', 'ueben', 'tag', 'hoeren', 'turnier'];
  function dayKey(d) { d = d || new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  // Wochennummer seit 1970 (Woche beginnt Montag), für Turnier und Wochen-Rangliste
  function weekNo(d) { d = d || new Date(); const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); return Math.floor((day + 3) / 7); }
  function rng(seed) { let x = (seed * 2654435761) >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function pickN(n, k, seed) { const r = rng(seed), a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, Math.min(k, n)); }
  let M = null;
  function fresh() { return { v: 1, gems: 0, gemsTotal: 0, own: { design: ['klassik', 'schwarz'], bg: ['bonbon'], sound: ['klavier', 'epiano'], fx: ['funken'], song: [] }, use: { design: 'klassik', bg: 'bonbon', sound: 'klavier', fx: 'funken' }, items: { heart: 0, shield: 0, slow: 0 }, plays: {}, fav: [], modes: [], stars: 0, crowns: 0, endlessBest: 0, songs: 0, quests: null, ach: {}, lessons: {}, week: { id: 0, best: 0 }, weekBoard: 0 }; }
  function load() { if (M) return M; let d = null; try { d = JSON.parse(store.getItem(KEY)); } catch (e) { /* kaputt */ } M = Object.assign(fresh(), d || {}); const f = fresh(); M.items = Object.assign(f.items, M.items || {}); M.own.song = M.own.song || []; for (const k of ['design', 'bg', 'sound', 'fx']) { M.own[k] = Array.from(new Set((M.own[k] || []).concat(f.own[k]))); if (!M.use[k] || !SHOP[k][M.use[k]]) M.use[k] = f.use[k]; } return M; }
  function save() { try { store.setItem(KEY, JSON.stringify(M)); } catch (e) { /* voll */ } writeAch(); }
  function writeAch() { try { store.setItem(ACH_KEY, JSON.stringify({ t: 'Klavierlicht', d: ACH.map(a => ({ id: a.id, icon: a.icon, title: a.title, desc: a.desc })), u: M.ach })); } catch (e) { /* voll */ } }
  function addGems(n) { load(); n = Math.max(0, Math.round(n)); M.gems += n; M.gemsTotal += n; return n; }
  function spend(n) { load(); if (M.gems < n) return false; M.gems -= n; save(); return true; }
  function buy(kind, id) { load(); const it = SHOP[kind] && SHOP[kind][id]; if (!it) return false; if (M.own[kind].includes(id)) { M.use[kind] = id; save(); return true; } if (!spend(it.price)) return false; M.own[kind].push(id); M.use[kind] = id; save(); return true; }
  // neue Lieder (Online-Archiv mit Preis) freischalten
  const ownsSong = id => load().own.song.includes(id);
  function buySong(id, price) { load(); if (M.own.song.includes(id)) return true; if (!(price > 0) || !spend(price)) return false; M.own.song.push(id); save(); return true; }
  function buyItem(k) { load(); const it = SHOP.item[k]; if (!it || !spend(it.price)) return false; M.items[k]++; save(); return true; }
  function useItem(k) { load(); if (!(M.items[k] > 0)) return false; M.items[k]--; save(); return true; }
  function quests() {
    load(); const dk = dayKey();
    if (!M.quests || M.quests.day !== dk) M.quests = { day: dk, list: pickN(QUESTS.length, 3, dk).map(i => ({ id: QUESTS[i].id, p: 0, done: false })) };
    return M.quests.list.map(q => Object.assign({}, QUESTS.find(x => x.id === q.id), q));
  }
  function unlock(id, out) { if (M.ach[id]) return; const a = ACH.find(x => x.id === id); if (!a) return; M.ach[id] = Date.now(); if (a.gems) addGems(a.gems); out.push({ type: 'ach', icon: a.icon, title: a.title, gems: a.gems }); }
  // Ereignis melden → Aufgaben- und Erfolgsfortschritt; liefert neue Meldungen [{type:'ach'|'quest', title, gems}]
  function report(ev, d) {
    load(); d = d || {}; const out = [], inc = {};
    if (ev === 'song') {
      M.songs++; inc.song = 1; inc.stars = d.stars || 0; inc.perfect = d.perfect || 0; inc.crowns = d.crowns || 0; inc.combo = d.combo || 0;
      if (d.mode) { inc['mode:' + d.mode] = 1; if (!M.modes.includes(d.mode)) M.modes.push(d.mode); }
      if (d.mode === 'endlos') { inc.endless = d.round || 1; M.endlessBest = Math.max(M.endlessBest, d.round || 1); }
      if (d.level === 'profi' && d.stars >= 2) inc.hard2 = 1;
      if (d.key) M.plays[d.key] = (M.plays[d.key] || 0) + 1;
      if (!d.lost) unlock('first', out);
      if (M.songs >= 10) unlock('songs10', out); if (M.songs >= 50) unlock('songs50', out); if (M.songs >= 100) unlock('songs100', out);
      if (d.crowns >= 1) unlock('crown', out); if (d.crowns >= 3) unlock('crown3', out);
      if (d.combo >= 100) unlock('combo100', out); if (d.combo >= 300) unlock('combo300', out);
      if (d.flawless) unlock('flawless', out); if (d.blind && !d.lost) unlock('blind', out);
      if (MODES_ALL.every(m => M.modes.includes(m))) unlock('modes', out);
      if (d.midi) unlock('midi', out); if (d.duet) unlock('duet', out); if (d.win) unlock('battle', out);
    } else if (ev === 'gold') inc.gold = d.n || 1;
    else if (ev === 'freenotes') { inc.freenotes = d.n || 1; if (!M.modes.includes('frei')) M.modes.push('frei'); }
    else if (ev === 'lesson') { M.lessons[d.id] = Math.max(M.lessons[d.id] || 0, d.stars || 1); unlock('lesson', out); if (d.all) unlock('path', out); }
    else if (ev === 'record') unlock('record', out);
    else if (ev === 'week') { unlock('week', out); if (M.week.id !== d.week) M.week = { id: d.week, best: 0 }; if (d.score > M.week.best) M.week.best = d.score; M.weekBoard = d.week * 1e7 + Math.min(9999999, M.week.best); }
    if (d.stars) M.stars += d.stars; if (d.crowns) M.crowns += d.crowns;
    if (M.stars >= 100) unlock('stars100', out);
    for (const q of quests()) {
      const st = M.quests.list.find(x => x.id === q.id); if (st.done) continue; const v = inc[q.ev]; if (!v) continue;
      st.p = q.max ? Math.max(st.p, v) : st.p + v;
      if (st.p >= q.goal) { st.p = q.goal; st.done = true; addGems(q.gems); out.push({ type: 'quest', icon: '📋', title: q.t, gems: q.gems }); }
    }
    if (M.gemsTotal >= 500) unlock('gems500', out);
    save(); return out;
  }
  function fav(id, on) { load(); const i = M.fav.indexOf(id); if (on == null) on = i < 0; if (on && i < 0) M.fav.push(id); if (!on && i >= 0) M.fav.splice(i, 1); save(); return on; }
  // Turnier der Woche: 5 Lieder, für alle gleich (aus der Gesamtliste, Sortierung muss überall gleich sein)
  function weekSongs(n, w) { return pickN(n, 5, (w || weekNo()) * 7919 + 13); }
  const API = { SHOP, ACH, QUESTS, load, save, addGems, spend, buy, buySong, ownsSong, buyItem, useItem, quests, report, fav, weekNo, weekSongs, dayKey, get data() { return load(); }, _reset() { M = null; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.KLMeta = API;
})(typeof window !== 'undefined' ? window : globalThis);
