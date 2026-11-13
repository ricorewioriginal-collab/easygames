/* AnMaCha – Der Podcast · Wochen-Events, Sammelstücke und Karriere-Rückschläge.
   Jede Spielwoche (7 Tage) hat ein Motto mit Wochenziel und Bonus. In der Stadt liegen 20 goldene Kassetten versteckt.
   Bei der Auswertung kann eine Panne passieren (Shitstorm, Technik, Sponsor, Krankheit) – gute Vorbereitung verhindert sie. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, Save = AMC.Save;
  const EV = AMC.Events = {};
  // [id, Icon, Name, Ziel-Text, Zähler, Ziel, Belohnung 🎟️, Hörer-Bonus in dieser Woche]
  const WEEKS = [
    ['festival', '🎪', 'Festival-Woche', 'Mit Fans tanzen oder treffen', 'dance', 10, 150, 0.05],
    ['award', '🏆', 'Award-Woche', 'Folgen aufnehmen', 'eps', 3, 200, 0.08],
    ['tour', '🗺️', 'Stadt-Tour-Woche', 'Orte, Senderhäuser oder Bus besuchen', 'tour', 8, 140, 0.04],
    ['retro', '📼', 'Retro-Woche', 'Goldene Kassetten finden', 'tape', 3, 160, 0.05],
    ['charity', '💛', 'Charity-Woche', 'Hörer-Wünsche und Gespräche', 'talk', 8, 150, 0.06]
  ];
  EV.WEEKS = WEEKS;
  const TAPES = 20;
  const career = () => AMC.Career ? AMC.Career.state() : { day: 1 };
  const wk = () => { const c = career(), n = Math.floor(((c.day || 1) - 1) / 7), w = Save.data.week = Save.data.week || {}; if (w.n !== n) { Save.data.week = { n, c: {}, done: false }; } return Save.data.week; };
  EV.week = () => { const w = wk(), d = WEEKS[w.n % WEEKS.length]; return { n: w.n + 1, id: d[0], icon: d[1], name: d[2], goal: d[3], key: d[4], need: d[5], reward: d[6], bonus: d[7], have: Math.min(d[5], w.c[d[4]] || 0), done: w.done, dayOf: ((career().day || 1) - 1) % 7 + 1 }; };
  // Fortschritt melden (aus Career.mark, Episode, Kassetten, Gesprächen)
  EV.mark = function (k, n) {
    const w = wk(), e = EV.week(); w.c[k] = (w.c[k] || 0) + (n || 1);
    if (!w.done && k === e.key && w.c[k] >= e.need) { w.done = true; Save.earn(e.reward); Save.save(); AMC.Audio.sfx('applause'); AMC.UI.toast(e.icon + ' Wochenziel geschafft: ' + e.name + '! +' + e.reward + ' 🎟️', 4200); }
  };

  // ------------------------------------------------------------------ Goldene Kassetten in der Stadt
  let C = null, T = null;
  EV.tapes = () => Object.keys(Save.data.tapes || {}).length;
  EV.build = function (ctx) {
    C = ctx; T = root.THREE; const S = C.S; if (!S || S.mode !== 'free' || S.net) return;
    // feste Verstecke (gleicher Zufall bei jedem Besuch)
    let seed = 4242; const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const got = Save.data.tapes || {}, gold = W.mat(0xffc93a, { m: 0.8, r: 0.25, e: 0xffa000, ei: 0.35 }), dark = W.mat(0x2a2a2e, { r: 0.6 });
    S.goldTapes = [];
    for (let i = 0; i < TAPES; i++) {
      const [x, y, z] = C.freeSpot(rng, 10);
      if (got[i]) continue;
      const g = new T.Group(); g.position.set(x, y + 1.0, z); g.scale.setScalar(1.6);
      W.box(0.7, 0.44, 0.1, gold, 0, 0, 0, g, false); [-0.17, 0.17].forEach(o => W.cyl(0.08, 0.08, 0.12, dark, o, 0.02, 0, g, 10).rotation.x = Math.PI / 2);
      S.group.add(g); S.goldTapes.push({ i, x, y: y + 1.0, z, g });
    }
  };
  EV.update = function (dt) {
    const S = C && C.S; if (!S || !S.goldTapes || !S.goldTapes.length) return;
    const p = S.pl, t = performance.now() / 1000;
    for (let k = S.goldTapes.length - 1; k >= 0; k--) {
      const c = S.goldTapes[k]; c.g.rotation.y += dt * 2; c.g.position.y = c.y + Math.sin(t * 2 + c.i) * 0.15;
      if (Math.hypot(p.x - c.x, p.z - c.z) < 1.4 && Math.abs(p.y + 1 - c.y) < 2) {
        S.group.remove(c.g); S.goldTapes.splice(k, 1);
        Save.data.tapes = Object.assign(Save.data.tapes || {}, { [c.i]: 1 });
        const n = EV.tapes(), big = n % 5 === 0, fp = Save.earn(big ? 80 : 15); Save.save();
        W.particles.burst(c.x, c.y, c.z, 0xffd23f, 26, { speed: 4 }); AMC.Audio.sfx(big ? 'star' : 'collect');
        C.msg('📼 Goldene Kassette ' + n + '/' + TAPES + ' · +' + fp + ' 🎟️' + (n === TAPES ? ' · Alle gefunden! 🏆' : big ? ' · Meilenstein!' : ''), 2.6);
        EV.mark('tape');
      }
    }
  };
  EV.mapDots = () => [];

  // ------------------------------------------------------------------ Rückschläge bei der Auswertung
  // [id, Text, Wirkung auf Hörer, Abo-Verlust, Schutz (Text), Schutz-Prüfung]
  const SET = [
    ['storm', '🌪️ Shitstorm wegen eines Versprechers', -0.15, 0.02, 'Superfans verteidigen euch', () => AMC.Social && AMC.Social.superfans() >= 2],
    ['tech', '🔌 Technikpanne: das Mikro rauscht', -0.2, 0, 'Gutes Studio fängt es ab', () => AMC.StudioEdit && AMC.StudioEdit.bonus().lis >= 0.1],
    ['sponsor', '💸 Ein Sponsor springt ab', -0.05, 0.01, 'Der Wochenbonus rettet euch', () => EV.week().done],
    ['krank', '🤧 Andrew ist erkältet', -0.12, 0, 'Fitte Hosts halten durch', () => AMC.Home && (AMC.Home.mood('andrew') + AMC.Home.mood('marco')) / 2 >= 0.7]
  ];
  EV.SETBACKS = SET;
  // Wird von Career.episode vor der Berechnung gefragt: gibt Anteil (Hörer) und Zeilen zurück
  EV.episode = function (force) {
    const c = career(), w = EV.week(), out = { parts: [['📆 ' + w.name, w.bonus]], lines: [], lost: 0 };
    // ab Tag 3, etwa jede vierte Folge, nie zwei Tage hintereinander
    const st = Save.data.setback = Save.data.setback || {};
    if (force || (c.day >= 3 && c.day - (st.last || -9) > 1 && Math.random() < 0.25)) {
      const s = force ? SET.find(x => x[0] === force) || SET[0] : U.pick(SET); st.last = c.day;
      if (s[5]()) out.lines.push(['🛡️ Panne abgewendet', s[1].replace(/^\S+ /, '') + ' – ' + s[4] + '!']);
      else { out.parts.push([s[1].split(' ')[0] + ' Panne', s[2]]); out.lost = s[3]; out.lines.push(['⚠️ Rückschlag', s[1] + (s[3] ? ' · −' + Math.round(s[3] * 100) + ' % Abos' : '') + ' · Tipp: ' + s[4].toLowerCase()]); st.n = (st.n || 0) + 1; }
    }
    out.lines.push([w.icon + ' Woche ' + w.n + ' · Tag ' + w.dayOf + '/7', w.name + ': ' + w.goal + ' ' + w.have + '/' + w.need + (w.done ? ' ✓' : ' · +' + w.reward + ' 🎟️')]);
    return out;
  };

  // Übersicht (Gesamtmenü): Wochen-Event, Sammelstücke, Pannen
  EV.panel = function () {
    const w = EV.week(), st = Save.data.setback || {};
    const s = AMC.UI.open('<div class="panel glass"><header><h2>' + w.icon + ' Woche ' + w.n + '</h2><button class="btn small" data-nav id="evB">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<div class="st-list"><div class="st-item"><span class="st-ic">' + w.icon + '</span><span><b>' + w.name + ' · Tag ' + w.dayOf + '/7</b><small>' + w.goal + ': ' + w.have + '/' + w.need + (w.done ? ' ✓ geschafft' : ' · Belohnung ' + w.reward + ' 🎟️') + ' · +' + Math.round(w.bonus * 100) + ' % Hörer diese Woche</small></span></div>' +
      '<div class="st-item"><span class="st-ic">📼</span><span><b>Goldene Kassetten ' + EV.tapes() + '/' + TAPES + '</b><small>Überall in der Stadt versteckt · jede 5. bringt 80 🎟️</small></span></div>' +
      '<div class="st-item"><span class="st-ic">🛡️</span><span><b>Pannen ' + (st.n || 0) + '</b><small>Schutz: 2 Superfans, gutes Studio, fitte Hosts, Wochenziel geschafft</small></span></div>' +
      '<div class="st-item"><span class="st-ic">📅</span><span><b>Nächste Wochen</b><small>' + [1, 2, 3].map(k => { const d = WEEKS[(w.n - 1 + k) % WEEKS.length]; return d[1] + ' ' + d[2]; }).join(' · ') + '</small></span></div></div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#evB').onclick = () => AMC.UI.close(s);
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
