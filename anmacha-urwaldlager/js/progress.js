/* Urwaldlager – Fortschritt: Erfolge, freischaltbare Outfits und Bestwerte pro Prüfung (alles lokal in ul_*, mit Google-Sicherung) */
(function () {
  'use strict';
  const UL = window.UL, st = UL.store;
  const P = UL.Prog = {};
  // Erfolge: id, Symbol, Name, Bedingung, Belohnung (Outfit-Teil)
  P.ACH = [
    { id: 'erste', icon: '🎬', name: 'Erste Prüfung', txt: 'Beende deine erste Urwaldprüfung.' },
    { id: 'perfekt', icon: '⭐', name: 'Perfekt!', txt: 'Hol in einer Prüfung alle Sterne.', reward: 'Camp-Hemd „Gold“' },
    { id: 'tapfer', icon: '💪', name: 'Durchgehalten', txt: 'Beende 10 Prüfungen ohne Abbruch.' },
    { id: 'abenteurer', icon: '🧭', name: 'Abenteurer:in', txt: 'Spiel jede Prüfung mindestens einmal.', reward: 'Tropenhelm' },
    { id: 'sammler', icon: '💯', name: 'Sternesammler:in', txt: 'Sammle insgesamt 100 Sterne.', reward: 'Hutfarbe „Gold“' },
    { id: 'sturm', icon: '⛈️', name: 'Sturmerprobt', txt: 'Hol im Gewitter mindestens die Hälfte der Sterne.', reward: 'Camp-Hemd „Tarngrün“' },
    { id: 'koch', icon: '🧑‍🍳', name: 'Sternekoch', txt: 'Koch am Lagerfeuer ein Festessen (drei gute Zutaten).' },
    { id: 'plane', icon: '⛺', name: 'Trockene Füße', txt: 'Spann bei Regen die Plane über die Betten.' },
    { id: 'freund', icon: '💚', name: 'Beste Freunde', txt: 'Schließ im Camp eine echte Freundschaft.', reward: 'Blumenkranz' },
    { id: 'staffel', icon: '📺', name: 'Durchgezogen', txt: 'Spiel eine Staffel bis zum Ende.' },
    { id: 'finale', icon: '🏅', name: 'Finalist:in', txt: 'Erreiche das Finale (Platz 1 bis 3).' },
    { id: 'koenig', icon: '👑', name: 'Urwaldkönig:in', txt: 'Gewinn eine Staffel.', reward: 'Krone' },
    { id: 'studio', icon: '🎬', name: 'Studio-Star', txt: 'Gewinn eine Staffel im TV-Studio.' },
    { id: 'profi', icon: '🔥', name: 'Knallhart', txt: 'Gewinn eine Staffel auf „Knallhart“.' }
  ];
  // Freischaltbare Outfit-Teile (Schlüssel = Erfolg)
  P.HATS = [['tropen', 'Tropenhelm', 'abenteurer'], ['blumen', 'Blumenkranz', 'freund'], ['krone', 'Krone', 'koenig']];
  P.SHIRTS = [[0xd4a017, 'Gold', 'perfekt'], [0x55602f, 'Tarngrün', 'sturm']];
  P.HATCOL = [[0xffcc33, 'Gold', 'sammler']];
  P.has = id => !!(st.get('ach', {})[id]);
  P.count = () => Object.keys(st.get('ach', {})).filter(k => P.ACH.some(a => a.id === k)).length;
  P.achOf = id => P.ACH.find(a => a.id === id);
  // freischalten (einmalig) – mit Toast und Fanfare
  P.unlock = (id) => {
    const a = P.achOf(id); if (!a) return false;
    const all = st.get('ach', {}); if (all[id]) return false;
    all[id] = Date.now(); st.set('ach', all);
    const show = () => { UL.UI.toast(`Erfolg: ${a.name}${a.reward ? ' · neu: ' + a.reward : ''}`, a.icon, 3600); UL.Audio.sfx && UL.Audio.sfx('star'); };
    if (UL.UI && UL.UI.toast) show();
    return true;
  };
  P.stats = () => Object.assign({ plays: {}, stars: 0, done: 0 }, st.get('stats', {}));
  // nach jeder eigenen Prüfung: Bestwert, Zähler, Erfolge; Rückgabe: neuer Bestwert?
  P.trial = (id, stars, max, quit, o = {}) => {
    const s = P.stats(); s.plays[id] = (s.plays[id] || 0) + 1; s.stars += stars; if (!quit) s.done++; st.set('stats', s);
    const best = st.get('best', {}), rec = !quit && stars > 0 && !(best[id] >= stars);
    if (rec) { best[id] = stars; st.set('best', best); }
    if (!quit) P.unlock('erste');
    if (!quit && max && stars >= max) P.unlock('perfekt');
    if (s.done >= 10) P.unlock('tapfer');
    if (s.stars >= 100) P.unlock('sammler');
    if (o.wx && o.wx.name === 'Gewitter' && !quit && stars >= max / 2) P.unlock('sturm');
    const ids = UL.D.TRIALS.map(t => t.id).concat(['fanquiz', 'marsch']);
    if (ids.every(k => s.plays[k])) P.unlock('abenteurer');
    return rec;
  };
  // Ende einer Staffel
  P.season = (S, place, won) => {
    P.unlock('staffel');
    if (place <= 3) P.unlock('finale');
    if (won) { P.unlock('koenig'); if (S.theme === 'studio') P.unlock('studio'); if (S.diff === 'schwer') P.unlock('profi'); }
  };
  // Freundschaft: jemand mag mich sehr (wie 💚 am Namensschild)
  P.checkFriends = (S) => { if (S && S.campers.some(c => c.id !== 'me' && c.rel && c.rel.me >= 72)) P.unlock('freund'); };
  P.locked = (key) => key && !P.has(key);
})();
