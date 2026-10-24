/* Mahjong 3D – Spielstand (localStorage 'easygames.mahjong.v1', mitgesichert über cloud/anmacha-cloud.js) und Erfolge.
 * Laden prüft und repariert alles; kaputte Werte werden durch Standardwerte ersetzt. */
(function (root) {
  'use strict';
  const KEY = 'easygames.mahjong.v1', ACH_KEY = 'anmacha-gameach.mahjong';

  const DEF_OPT = { sfx: 0.8, music: 0.4, style: 'classic', index: true, dim: true, showMatch: false, theme: 'auto', back: 'jade',
    quality: 'auto', pitch: 24, solvable: true, left: false, autoHint: true };
  const OPT_CHECK = {
    sfx: v => typeof v === 'number' && v >= 0 && v <= 1, music: v => typeof v === 'number' && v >= 0 && v <= 1,
    style: v => v === 'classic' || v === 'clear', index: v => typeof v === 'boolean', dim: v => typeof v === 'boolean',
    showMatch: v => typeof v === 'boolean', theme: v => typeof v === 'string' && v.length < 20, back: v => typeof v === 'string' && v.length < 20,
    quality: v => ['auto', 'hoch', 'mittel', 'sparsam'].indexOf(v) >= 0, pitch: v => typeof v === 'number' && v >= 0 && v <= 55,
    solvable: v => typeof v === 'boolean', left: v => typeof v === 'boolean', autoHint: v => typeof v === 'boolean'
  };
  const STAT_KEYS = ['games', 'wins', 'pairs', 'hints', 'shuffles', 'undos', 'time', 'bestCombo', 'perfect', 'fast144', 'daily', 'blitzBoards', 'zen'];

  const ACH = [
    { id: 'paar1', icon: '🀄', title: 'Erstes Paar', desc: 'Räume dein erstes Steinpaar ab.' },
    { id: 'paar500', icon: '🧺', title: 'Fleißige Hände', desc: 'Räume insgesamt 500 Paare ab.' },
    { id: 'paar3000', icon: '🏯', title: 'Steinmeister', desc: 'Räume insgesamt 3.000 Paare ab.' },
    { id: 'sieg1', icon: '🎉', title: 'Erster Sieg', desc: 'Räume ein Brett komplett ab.' },
    { id: 'sieg25', icon: '🏅', title: 'Routiniert', desc: 'Gewinne 25 Partien.' },
    { id: 'sieg100', icon: '🏆', title: 'Großmeister', desc: 'Gewinne 100 Partien.' },
    { id: 'combo5', icon: '🔥', title: 'Im Fluss', desc: 'Schaffe eine 5er-Kombo (5 Paare kurz hintereinander).' },
    { id: 'combo12', icon: '🌊', title: 'Unaufhaltsam', desc: 'Schaffe eine 12er-Kombo.' },
    { id: 'perfekt', icon: '🧘', title: 'Ohne Netz', desc: 'Gewinne ohne Tipp, Mischen und Rückgängig.' },
    { id: 'turtle', icon: '🐢', title: 'Die Schildkröte', desc: 'Räume das klassische Schildkröten-Layout ab.' },
    { id: 'schnell', icon: '⚡', title: 'Blitzhand', desc: 'Räume ein Brett mit 144 Steinen in unter 4 Minuten ab.' },
    { id: 'tag1', icon: '📅', title: 'Tagesrätsel', desc: 'Löse ein Tagesrätsel.' },
    { id: 'tag7', icon: '🗓️', title: 'Sieben Tage', desc: 'Löse das Tagesrätsel 7 Tage in Folge.' },
    { id: 'blitz3', icon: '⏱️', title: 'Zeitjäger', desc: 'Räume in der Zeitjagd 3 Bretter in einer Runde ab.' },
    { id: 'zen30', icon: '🍵', title: 'Innere Ruhe', desc: 'Spiele insgesamt 30 Minuten im Zen-Modus.' },
    { id: 'sterne50', icon: '⭐', title: 'Sternensammler', desc: 'Sammle 50 Sterne auf der Reise.' },
    { id: 'sterne144', icon: '🌟', title: 'Sternenhimmel', desc: 'Hole alle 144 Sterne der Reise.' },
    { id: 'welt1', icon: '🍵', title: 'Teegarten', desc: 'Schließe Welt 1 der Reise ab.' },
    { id: 'welt2', icon: '🎋', title: 'Bambuswald', desc: 'Schließe Welt 2 der Reise ab.' },
    { id: 'welt3', icon: '🪷', title: 'Lotusteich', desc: 'Schließe Welt 3 der Reise ab.' },
    { id: 'welt4', icon: '🌸', title: 'Kirschblütenfest', desc: 'Schließe Welt 4 der Reise ab.' },
    { id: 'welt5', icon: '🐉', title: 'Drachenberg', desc: 'Schließe Welt 5 der Reise ab.' },
    { id: 'welt6', icon: '🌙', title: 'Mondpalast', desc: 'Schließe Welt 6 der Reise ab.' },
    { id: 'welt7', icon: '⛩️', title: 'Jadetempel', desc: 'Schließe Welt 7 der Reise ab.' },
    { id: 'welt8', icon: '👑', title: 'Kaiserstadt', desc: 'Schließe Welt 8 der Reise ab – die ganze Reise!' },
    { id: 'alle', icon: '🗺️', title: 'Weltenbummler', desc: 'Räume jedes der 29 Layouts mindestens einmal ab.' }
  ];

  function blank() {
    const stats = {}; STAT_KEYS.forEach(k => { stats[k] = 0; });
    return { v: 1, lv: {}, best: {}, blitz: { best: 0, boards: 0 }, daily: { last: '', streak: 0, bestStreak: 0, done: {} }, stats, ach: {}, opt: Object.assign({}, DEF_OPT), cur: null, last: { layout: 'schildkroete' }, seen: {} };
  }
  const num = (v, d) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : d);
  function repair(o) {
    const b = blank();
    if (!o || typeof o !== 'object') return b;
    if (o.lv && typeof o.lv === 'object') Object.keys(o.lv).forEach(k => {
      const e = o.lv[k]; if (!/^w\d-\d$/.test(k) || !e || typeof e !== 'object') return;
      b.lv[k] = { s: Math.min(3, Math.max(0, num(e.s, 0) | 0)), t: num(e.t, 0), p: num(e.p, 0) };
    });
    if (o.best && typeof o.best === 'object') Object.keys(o.best).forEach(k => { if (/^[a-z0-9-]{1,30}$/.test(k)) b.best[k] = num(o.best[k], 0); });
    if (o.blitz) { b.blitz.best = num(o.blitz.best, 0); b.blitz.boards = num(o.blitz.boards, 0); }
    if (o.daily) {
      b.daily.last = typeof o.daily.last === 'string' ? o.daily.last.slice(0, 8) : '';
      b.daily.streak = num(o.daily.streak, 0); b.daily.bestStreak = num(o.daily.bestStreak, 0);
      if (o.daily.done && typeof o.daily.done === 'object') Object.keys(o.daily.done).sort().slice(-90).forEach(k => { if (/^\d{8}$/.test(k)) b.daily.done[k] = num(o.daily.done[k], 1); });
    }
    if (o.stats) STAT_KEYS.forEach(k => { b.stats[k] = num(o.stats[k], 0); });
    if (o.ach && typeof o.ach === 'object') ACH.forEach(a => { if (num(o.ach[a.id], 0) > 0) b.ach[a.id] = o.ach[a.id]; });
    if (o.opt && typeof o.opt === 'object') Object.keys(DEF_OPT).forEach(k => { if (OPT_CHECK[k](o.opt[k])) b.opt[k] = o.opt[k]; });
    if (o.cur && typeof o.cur === 'object' && o.cur.game && typeof o.cur.mode === 'string') b.cur = o.cur;
    if (o.last && typeof o.last.layout === 'string') b.last.layout = o.last.layout;
    if (o.seen && typeof o.seen === 'object') Object.keys(o.seen).forEach(k => { if (/^[a-z0-9-]{1,30}$/.test(k)) b.seen[k] = 1; });
    return b;
  }

  function Save() {
    let raw = null;
    try { raw = root.localStorage.getItem(KEY); } catch (e) {}
    let o = null; try { o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
    this.d = repair(o);
    this._t = 0;
    this.writeAch();
  }
  Save.prototype = {
    get opt() { return this.d.opt; },
    write(now) {
      clearTimeout(this._t);
      const go = () => { try { root.localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) {} };
      if (now) go(); else this._t = setTimeout(go, 400);
    },
    setOpt(k, v) { if (OPT_CHECK[k] && OPT_CHECK[k](v)) { this.d.opt[k] = v; this.write(); } },
    stars() { let s = 0; Object.keys(this.d.lv).forEach(k => { s += this.d.lv[k].s; }); return s; },
    levelDone(id) { return !!(this.d.lv[id] && this.d.lv[id].s > 0); },
    // Ergebnis eines Levels eintragen; gibt { newBest, firstClear } zurück
    recordLevel(id, stars, sec, score) {
      const e = this.d.lv[id] || { s: 0, t: 0, p: 0 }, first = !e.s;
      const nb = !e.p || score > e.p;
      e.s = Math.max(e.s, stars); e.t = e.t ? Math.min(e.t, sec) : sec; e.p = Math.max(e.p, score);
      this.d.lv[id] = e; this.write();
      return { newBest: nb, firstClear: first };
    },
    recordBest(layoutId, score) { const old = this.d.best[layoutId] || 0; if (score > old) { this.d.best[layoutId] = score; this.write(); return true; } return false; },
    unlock(id) {
      if (this.d.ach[id] || !ACH.some(a => a.id === id)) return null;
      this.d.ach[id] = Date.now(); this.write(); this.writeAch();
      return ACH.find(a => a.id === id);
    },
    // easygames-Standardschlüssel für die Erfolge-Seite
    writeAch() {
      try { root.localStorage.setItem(ACH_KEY, JSON.stringify({ t: 'Mahjong 3D – Jadepalast', d: ACH.map(a => ({ id: a.id, icon: a.icon, title: a.title, desc: a.desc })), u: this.d.ach })); } catch (e) {}
    },
    reset() { const opt = this.d.opt; this.d = blank(); this.d.opt = opt; this.write(true); this.writeAch(); }
  };

  const api = { Save, ACH, KEY, DEF_OPT, repair, blank };
  root.MJSave = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
