/* Pestwacht · Spielstände: 3 Plätze + Autosave in localStorage (Präfix easygames.pestwacht → wird von cloud/anmacha-cloud.js
 * optional mit Google gesichert), versioniertes Schema mit Migration, Export/Import als Datei, Einstellungen, Erfolge. Ohne DOM-Zwang. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const SV = PW.Save = {};
  const PRE = 'easygames.pestwacht.', ACH_KEY = 'anmacha-gameach.pestwacht';
  SV.SLOTS = ['auto', 'slot1', 'slot2', 'slot3'];
  SV.store = null;           // für Tests austauschbar (getItem/setItem/removeItem)
  const ls = () => SV.store || (root.localStorage ? root.localStorage : null);
  const get = k => { try { const s = ls(); return s ? s.getItem(PRE + k) : null; } catch (e) { return null; } };
  const set = (k, v) => { try { const s = ls(); if (!s) return false; s.setItem(PRE + k, v); return true; } catch (e) { return false; } };

  SV.serialize = function (S) {
    return JSON.stringify(S, function (k, v) {
      if (k && k.charCodeAt(0) === 95) return undefined;      // _abgeleitete Werte nicht speichern
      if (k === 'proj' || k === 'fx') return [];
      return v;
    });
  };
  SV.migrate = function (o) {
    if (!o || typeof o !== 'object' || !o.world || !o.city || !Array.isArray(o.factions)) throw new Error('Kein gültiger Pestwacht-Spielstand');
    let v = o.v || 1;
    if (v < 2) { o.stationed = o.stationed || []; o.offers = o.offers || []; v = 2; }
    if (v < 3) { o.storyFlags = o.storyFlags || {}; o.blocs = o.blocs || []; o.items = o.items || []; v = 3; }
    if (v > PW.SCHEMA) throw new Error('Spielstand stammt aus einer neueren Version');
    o.v = PW.SCHEMA;
    // fehlende Felder ergänzen, Werte absichern
    const def = { stats: {}, spent: {}, wounded: {}, recruit: [], marches: [], reports: [], log: [], ach: {}, quests: { day: '', list: [], week: '', wlist: [] }, events: { next: o.time + 200, active: [], pending: null } };
    Object.keys(def).forEach(k => { if (o[k] == null) o[k] = def[k]; });
    PW.RES.forEach(k => { o.res[k] = Math.max(0, +o.res[k] || 0); });
    ['h', 'r', 'i', 'q', 't', 'rec', 'dead', 'fled'].forEach(k => { o.pop[k] = Math.max(0, Math.floor(+o.pop[k] || 0)); });
    o.pop.acc = o.pop.acc || {};
    o.time = Math.max(0, +o.time || 0);
    o.marches = o.marches.filter(a => a && Array.isArray(a.path) && a.path.length);
    o.factions.forEach(f => { f._rate = {}; });   // abgeleitete Bot-Werte neu aufbauen
    o.marches.forEach(a => { if (a.state === 'kampf') { a.state = 'go'; a.work = 0; } });   // beim Speichern laufende Schlacht wird neu ausgetragen
    if (o.waves && o.waves.active) { o.waves.active.proj = []; o.waves.active.fx = []; }
    return o;
  };
  SV.save = function (S, slot) {
    S.savedAt = Date.now();
    const txt = SV.serialize(S);
    const ok = set('save.' + slot, txt);
    if (ok) {
      const meta = SV.index(); meta[slot] = SV.summary(S); set('index', JSON.stringify(meta));
      SV.writeAch(S); SV.writeBest(S);
    }
    return ok ? txt.length : 0;
  };
  SV.load = function (slot) {
    const raw = get('save.' + slot); if (!raw) return null;
    return SV.migrate(JSON.parse(raw));
  };
  SV.remove = function (slot) { try { const s = ls(); if (s) s.removeItem(PRE + 'save.' + slot); } catch (e) {} const m = SV.index(); delete m[slot]; set('index', JSON.stringify(m)); };
  SV.index = function () { try { return JSON.parse(get('index') || '{}') || {}; } catch (e) { return {}; } };
  SV.summary = S => ({ mode: S.mode, name: S.cfg.playerName, time: Math.floor(S.time), day: PW.dayNo(S), pop: PW.Econ.popTotal(S.pop), hq: PW.City.hqLv(S), saved: S.savedAt,
    ch: S.campaign ? (PW.Campaign.mission(S) ? PW.Campaign.mission(S).ch : 5) : null, diff: S.cfg.diff, tiles: PW.World.tilesOf(S, 'P').length });
  SV.exportText = S => SV.serialize(S);
  SV.importText = function (txt) { return SV.migrate(JSON.parse(txt)); };

  // Einstellungen (geräteübergreifend über den Präfix ebenfalls gesichert)
  SV.DEF_OPT = { music: 0.5, sfx: 0.8, uiScale: 1, contrast: false, reduceFx: false, quality: 'auto', camSens: 1, subtitles: true, invertZoom: false, keys: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', rotL: 'KeyQ', rotR: 'KeyE', pause: 'Space', world: 'KeyM', build: 'KeyB' } };
  SV.loadOpt = function () {
    let o = {}; try { o = JSON.parse(get('opt') || '{}') || {}; } catch (e) { o = {}; }
    const out = JSON.parse(JSON.stringify(SV.DEF_OPT));
    Object.keys(out).forEach(k => { if (k === 'keys') { if (o.keys) Object.keys(out.keys).forEach(x => { if (typeof o.keys[x] === 'string') out.keys[x] = o.keys[x]; }); } else if (typeof o[k] === typeof out[k]) out[k] = o[k]; });
    out.music = PW.clamp(out.music, 0, 1); out.sfx = PW.clamp(out.sfx, 0, 1); out.uiScale = PW.clamp(out.uiScale, 0.8, 1.4); out.camSens = PW.clamp(out.camSens, 0.4, 2);
    return out;
  };
  SV.saveOpt = o => set('opt', JSON.stringify(o));

  // Erfolge für die easygames-Erfolgsseite (Vereinigung über alle Spielstände)
  SV.writeAch = function (S) {
    try {
      const s = ls(); if (!s) return;
      let cur = {}; try { cur = JSON.parse(s.getItem(ACH_KEY) || '{}').u || {}; } catch (e) { cur = {}; }
      Object.keys(S.ach || {}).forEach(k => { if (!cur[k]) cur[k] = S.ach[k]; });
      s.setItem(ACH_KEY, JSON.stringify({ t: PW.TITLE + ' – ' + PW.SUBTITLE, d: PW.ACH.map(a => ({ id: a.id, icon: a.icon, title: a.title, desc: a.desc })), u: cur }));
    } catch (e) {}
  };
  // Bestwerte für Ranglisten (best.*): höchste Tagzahl, Wellen, Bewohner
  SV.writeBest = function (S) {
    try {
      const b = JSON.parse(get('best') || '{}') || {};
      b.waves = Math.max(b.waves || 0, S.stats.waves || 0); b.pop = Math.max(b.pop || 0, S.stats.maxPop || 0); b.cured = Math.max(b.cured || 0, S.stats.cured || 0);
      set('best', JSON.stringify(b));
    } catch (e) {}
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
