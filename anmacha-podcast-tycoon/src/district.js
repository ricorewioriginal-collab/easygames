/* AnMaCha – Der Podcast · Medienstadt: Viertel mit Namen und neue, nutzbare Orte (Kiosk, Café, Kino, TV-Sender, Elektromarkt,
   Selfie-Wall, Karaoke-Bar, Bäckerei, Podcast-Café). Jeder Ort bringt etwas für den Tagesablauf: Ideen, Energie, Themen-Funken, Abos. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const DI = AMC.District = {};
  let C = null, T = null, V = null;
  // Viertel je Block (Blockmitte x, z)
  const NAMES = { '-67.5,-67.5': '📡 Sendemast-Hügel', '-22.5,-67.5': '📰 Zeitungsviertel', '22.5,-67.5': '🎬 Kino-Quartier', '67.5,-67.5': '📺 TV-Hof',
    '-67.5,-22.5': '🎸 Westend', '-22.5,-22.5': '☕ Café-Kiez', '22.5,-22.5': '🎙️ Funkhaus-Viertel', '67.5,-22.5': '📻 Senderviertel Ost',
    '-67.5,22.5': '🍟 Imbiss-Ring', '-22.5,22.5': '🌳 Stadtpark', '22.5,22.5': '🎤 Musikmeile', '67.5,22.5': '⛺ Campingplatz',
    '-67.5,67.5': '🏘️ Altstadt', '-22.5,67.5': '🛍️ Einkaufsstraße', '22.5,67.5': '🏠 Südstadt', '67.5,67.5': '🎪 Festivalwiese' };
  const BL = [-67.5, -22.5, 22.5, 67.5];
  const blockOf = (x, z) => { const near = v => BL.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); return near(x) + ',' + near(z); };
  DI.name = (x, z) => NAMES[blockOf(x, z)] || '🏙️ Medienstadt';

  // Orte: wo (Block), wie sie aussehen, was man tun kann
  const PLACES = [
    { id: 'kiosk', icon: '📰', name: 'Zeitungskiosk', col: '#ffd23f', blk: '-22.5,-67.5', desc: 'Schlagzeilen bringen Ideen für die nächste Folge.' },
    { id: 'kino', icon: '🎬', name: 'Kino Lichtspiel', col: '#ff3a6a', blk: '22.5,-67.5', desc: 'Trailer gucken: Spaß und TV-Themen.' },
    { id: 'tv', icon: '📺', name: 'Kanal 9 (TV-Sender)', col: '#3dd6ff', blk: '67.5,-67.5', desc: 'Einmal am Tag Talkshow-Gast: Quizfrage, Abos und Ernst-Themen.' },
    { id: 'cafe', icon: '☕', name: 'Café Funkpause', col: '#b07a4a', blk: '-22.5,-22.5', desc: 'Kaffee und Kuchen für Andrew und Marco.' },
    { id: 'karaoke', icon: '🎤', name: 'Karaoke-Bar Echo', col: '#a46bff', blk: '22.5,22.5', desc: 'Klavierlicht-Song singen: Musik-Themen und Spaß.' },
    { id: 'elektro', icon: '🔌', name: 'Elektromarkt Volt', col: '#6cff8a', blk: '-22.5,67.5', desc: 'Gadgets testen: Technik-Themen und eine Idee.' },
    { id: 'baecker', icon: '🥨', name: 'Bäckerei Brezel', col: '#ff8a1e', blk: '-67.5,67.5', desc: 'Frische Brezeln gegen den Hunger.' },
    { id: 'hoersaal', icon: '🎧', name: 'Podcast-Café Hörsaal', col: '#2fd3a0', blk: '22.5,67.5', desc: 'Stammhörer treffen: neue Abos und Feelgood-Themen.' },
    { id: 'selfie', icon: '📸', name: 'Selfie-Wall', col: '#ff3da8', blk: '67.5,67.5', desc: 'Selfies mit Fans: Fan-Punkte und Stadt-Vibe.' }
  ];
  DI.PLACES = PLACES;

  DI.build = function (ctx) {
    C = ctx; T = root.THREE; const S = C.S; if (!S || S.mode !== 'free' || S.net) return;
    const g = S.group; S.places = [];
    PLACES.forEach(pl => {
      const [bx, bz] = pl.blk.split(',').map(Number);
      // freie Ecke im Block suchen (zur Stadtmitte hin zuerst)
      const cs = [[-Math.sign(bx), -Math.sign(bz)], [-Math.sign(bx), Math.sign(bz)], [Math.sign(bx), -Math.sign(bz)], [Math.sign(bx), Math.sign(bz)]];
      let spot = null;
      for (const [cx, cz] of cs) for (const k of [14.5, 13, 15.5]) {
        const x = bx + cx * k, z = bz + cz * k;
        if ([[0, 0], [1.8, 0], [-1.8, 0], [0, 1.8], [0, -1.8], [1.8, 1.8], [-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8]].every(([a, b]) => !C.solidAt(x + a, 0.6, z + b))) { spot = { x, z, cx, cz }; break; }
        if (spot) break;
      }
      if (!spot) return;
      const ry = spot.cx > 0 ? Math.PI / 2 : -Math.PI / 2, fx = spot.cx;
      booth(g, pl, spot.x, spot.z, ry);
      C.addBox(spot.x - 1.6, spot.x + 1.6, spot.z - 1.6, spot.z + 1.6, 1.1);
      C.addStation('place:' + pl.id, pl.icon + ' ' + pl.name, spot.x + fx * 2.7, spot.z, 2.0);
      S.places.push({ pl, x: spot.x, z: spot.z });
    });
    V = { S, cur: '' };
  };
  function booth(g, pl, x, z, ry) {
    const b = new T.Group(); b.position.set(x, 0.16, z); b.rotation.y = ry; g.add(b);
    const col = new T.Color(pl.col).getHex(), M = (c, o) => W.mat(c, o || { r: 0.6 });
    W.box(3.0, 1.1, 1.2, M(0xf2efe6), 0, 0.55, 0.6, b, true);           // Theke
    W.box(3.1, 0.08, 1.3, M(col), 0, 1.12, 0.6, b, false);
    W.box(3.0, 2.8, 0.2, M(0x2a2c36), 0, 1.4, -0.7, b, true);           // Rückwand
    [-1.45, 1.45].forEach(o => W.box(0.12, 2.8, 1.5, M(0x2a2c36), o, 1.4, -0.05, b, true));
    const aw = W.box(3.4, 0.08, 1.8, M(col, { r: 0.7 }), 0, 2.85, 0.6, b, true); aw.rotation.x = 0.2;  // Markise
    for (let i = 0; i < 5; i++) W.box(0.34, 0.12, 0.04, M(i % 2 ? 0xffffff : col), -1.4 + i * 0.7, 2.62, 1.48, b, false);
    const t = W.textTex([pl.icon + ' ' + pl.name], { w: 512, h: 112, size: 50, accent: pl.col });
    const s = new T.Mesh(new T.PlaneGeometry(3.0, 0.66), new T.MeshBasicMaterial({ map: t, toneMapped: false })); s.position.set(0, 3.4, -0.55); b.add(s);
    // kleine Requisiten je Ort
    const P = { kiosk: () => { for (let i = 0; i < 6; i++) W.box(0.32, 0.4, 0.04, M([0xffffff, 0xffd23f, 0xff3a6a][i % 3]), -1 + i * 0.4, 1.5, -0.58, b, false); },
      kino: () => { W.box(0.9, 1.3, 0.05, M(0x111111), -0.7, 1.7, -0.58, b, false); W.box(0.8, 1.2, 0.02, M(0xff3a6a, { e: 0xff3a6a, ei: 0.5 }), -0.7, 1.7, -0.55, b, false); const pc = W.cyl(0.2, 0.15, 0.4, M(0xff3a3a), 0.9, 1.35, 0.6, b, 10); pc.castShadow = false; },
      tv: () => { W.box(1.4, 0.85, 0.06, M(0x111111), 0, 1.75, -0.58, b, false); W.box(1.3, 0.75, 0.02, M(0x3dd6ff, { e: 0x3dd6ff, ei: 0.8 }), 0, 1.75, -0.55, b, false); },
      cafe: () => { [[-0.8, 2.2], [0.8, 2.4]].forEach(([ox, oz]) => { W.cyl(0.4, 0.4, 0.05, M(0xffffff), ox, 0.75, oz, b, 14); W.cyl(0.05, 0.05, 0.75, M(0x888888), ox, 0.37, oz, b, 6); }); W.cyl(0.08, 0.07, 0.12, M(0xffffff), 0.5, 1.22, 0.6, b, 10); },
      karaoke: () => { W.cyl(0.02, 0.02, 1.4, M(0x222222), 0, 0.7, 1.9, b, 6); const m = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), M(0x9aa0ad, { m: 0.8, r: 0.3 })); m.position.set(0, 1.45, 1.9); b.add(m); W.box(1.0, 0.6, 0.05, M(0xa46bff, { e: 0xa46bff, ei: 0.7 }), 0, 1.8, -0.58, b, false); },
      elektro: () => { for (let i = 0; i < 3; i++) { W.box(0.6, 0.4, 0.05, M(0x111111), -0.9 + i * 0.9, 1.7, -0.58, b, false); W.box(0.55, 0.35, 0.02, M(0x6cff8a, { e: 0x6cff8a, ei: 0.6 }), -0.9 + i * 0.9, 1.7, -0.55, b, false); } },
      baecker: () => { for (let i = 0; i < 5; i++) { const r = new T.Mesh(new T.TorusGeometry(0.12, 0.05, 6, 12), M(0xa0602a)); r.position.set(-0.8 + i * 0.4, 1.24, 0.6); r.rotation.x = Math.PI / 2; b.add(r); } },
      hoersaal: () => { const t2 = new T.TextureLoader().load(AMC.UI.podLogo); t2.encoding = T.sRGBEncoding; const m = new T.Mesh(new T.PlaneGeometry(1.0, 1.0), new T.MeshBasicMaterial({ map: t2 })); m.position.set(0, 1.85, -0.58); b.add(m); },
      selfie: () => { const t2 = new T.TextureLoader().load(AMC.UI.podLogo); t2.encoding = T.sRGBEncoding; const m = new T.Mesh(new T.PlaneGeometry(1.3, 1.3), new T.MeshBasicMaterial({ map: t2 })); m.position.set(0, 1.8, -0.58); b.add(m); const r = new T.Mesh(new T.TorusGeometry(0.35, 0.04, 8, 24), M(0xffffff, { e: 0xffffff, ei: 1.2 })); r.position.set(1.0, 1.6, 1.9); b.add(r); W.cyl(0.02, 0.02, 1.4, M(0x333333), 1.0, 0.7, 1.9, b, 6); } };
    (P[pl.id] || (() => {}))();
  }

  // Viertel-Anzeige: Titel oben links wechselt, beim ersten Betreten eine kurze Meldung
  DI.update = function (dt) {
    const S = C && C.S; if (!V || V.S !== S) return;
    const n = DI.name(S.pl.x, S.pl.z);
    if (n !== V.cur) {
      V.cur = n; const t = U.$('hTitle'); if (t) t.textContent = n;
      const seen = Save.data.districts = Save.data.districts || {};
      if (!seen[n]) { seen[n] = 1; Save.earn(10); Save.save(); C.msg('📍 Neues Viertel entdeckt: ' + n + ' · +10 🎟️ (' + Object.keys(seen).length + '/16)', 2.6); }
    }
  };

  // ------------------------------------------------------------------ Orte benutzen
  const today = () => { const c = AMC.Career ? AMC.Career.state() : { today: {} }; c.today.places = c.today.places || {}; return c.today.places; };
  const pay = n => { if (Save.data.fan < n) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte (' + n + ' 🎟️ nötig).'); return false; } Save.data.fan -= n; Save.save(); return true; };
  const need = (id, k, v) => { const n = AMC.Home.needs(id); n[k] = Math.max(0, Math.min(100, n[k] + v)); };
  const both = (k, v) => ['andrew', 'marco'].forEach(id => need(id, k, v));
  const funken = (rub, n) => { const S = C.S; if (S && S.got) { S.got[rub] = (S.got[rub] || 0) + n; } };
  const idea = (txt) => { const id = C.S.pl.H.id, n = AMC.Home.needs(id); if ((n.ideas || []).length >= 3) return false; n.ideas.push(txt); return true; };
  const HEAD = ['Stadtrat streitet über Parkplätze für Camper', 'Neuer Rekord: Längste Warteschlange vor dem Bäcker', 'Funkloch im Rathaus – Bürgermeister telefoniert vom Dach', 'Studie: Podcasts machen glücklicher als Werbung',
    'Elektromarkt verkauft Kabel, die niemand braucht', 'Kino zeigt 90er-Klassiker – Leckmuscheln ausverkauft', 'Taube klaut Pommes vom Imbiss am Ring', 'Radio-Flohmarkt: Röhrenradio für 1 Euro'];
  const ACT = {
    kiosk: [['📰 Tageszeitung kaufen', 10, () => { const h = U.pick(HEAD); return idea('Schlagzeile: ' + h.slice(0, 34)) ? '💡 Schlagzeile: „' + h + '“ – das wird ein Thema!' : '📰 „' + h + '“ – aber der Kopf ist schon voll mit Ideen.'; }, 'day']],
    kino: [['🎬 Trailer gucken', 20, () => { both('fun', 30); funken('tv', 3); return '🍿 Popcorn und Trailer! +3 TV-Funken, beide haben Spaß.'; }, 'day']],
    tv: [['📺 Talkshow-Gast (Quizfrage)', 0, null, 'day']],
    cafe: [['☕ Kaffee für beide', 15, () => { both('energy', 30); return '☕ Doppelter Espresso. Andrew vibriert leicht.'; }], ['🍰 Kuchen für beide', 12, () => { both('hunger', 30); both('fun', 5); return '🍰 Käsekuchen! Marco will das Rezept für Gisela.'; }]],
    karaoke: [['🎤 Klavierlicht-Song singen', 0, () => { const w = U.pick(D.WISHES.concat(AMC.Home.ownedSongs())); AMC.Audio.song(w.id).then(s => { if (s) AMC.Audio.playSong(s, { from: s.mel[0][0], sec: 6, vel: 0.6 }); }).catch(() => {}); both('fun', 20); funken('musik', 3); dance(); return '🎤 „' + w.t + '“ – die Bar singt mit! +3 Musik-Funken'; }, 'day']],
    elektro: [['🔌 Gadget testen', 40, () => { funken('tech', 4); const ok = idea('Gadget-Test aus dem Elektromarkt'); return '🔌 Ein Toaster mit App! +4 Technik-Funken' + (ok ? ' · 💡 Idee: Gadget-Test' : ''); }, 'day']],
    baecker: [['🥨 Brezeln für beide', 8, () => { both('hunger', 40); return '🥨 Frisch aus dem Ofen. Andrew isst drei.'; }]],
    hoersaal: [['🎧 Stammhörer treffen', 0, () => { const c = AMC.Career && AMC.Career.state(); const a = 10 + Math.round((c ? c.abos : 100) * 0.01); if (c) c.abos += a; funken('feel', 2); if (AMC.Career) AMC.Career.mark('dance'); return '🎧 Die Stammhörer erzählen ihre Lieblingsfolge. +' + a + ' Abos, +2 Feelgood-Funken'; }, 'day']],
    selfie: [['📸 Selfie mit Fans', 0, () => { Save.earn(8); const fl = U.el('div', 'hm-selfie'); document.body.appendChild(fl); setTimeout(() => fl.remove(), 600); if (AMC.CityVibe) AMC.CityVibe.emote('yes'); return '📸 Klick! Das Bild geht viral. +8 🎟️'; }, 3]]
  };
  function dance() { const p = C.S.pl; if (p.fig) { p.fig.play('dance', { restart: true }); p.anim = 'dance'; p.busy = 3; } }
  DI.open = function (id) {
    const pl = PLACES.find(x => x.id === id); if (!pl) return;
    const used = today(), first = !(Save.data.placesSeen || {})[id];
    if (first) { Save.data.placesSeen = Object.assign(Save.data.placesSeen || {}, { [id]: 1 }); Save.earn(15); Save.save(); }
    const acts = ACT[id] || [];
    const rows = acts.map((a, i) => { const lim = a[3] === 'day' ? 1 : a[3] || 99, n = used[id + i] || 0, off = n >= lim; return '<button type="button" class="st-item" data-nav data-a="' + i + '"' + (off ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + a[0].split(' ')[0] + '</span><span><b>' + a[0].split(' ').slice(1).join(' ') + (a[1] ? ' · ' + a[1] + ' 🎟️' : ' · gratis') + '</b><small>' + (off ? 'Heute schon gemacht – morgen wieder!' : lim < 99 ? (lim === 1 ? 'Einmal am Tag' : 'Noch ' + (lim - n) + '× heute') : 'Beliebig oft') + '</small></span></button>'; }).join('');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>' + pl.icon + ' ' + U.esc(pl.name) + '</h2><button class="btn small" data-nav id="diB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + U.esc(pl.desc) + (first ? ' · Neu entdeckt: +15 🎟️' : '') + ' · 🎟️ ' + U.fmt(Save.data.fan) + ' · Stadtführer ' + Object.keys(Save.data.placesSeen || {}).length + '/' + PLACES.length + '</p><div class="st-list" id="diL">' + rows + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#diB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#diL').addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b || b.getAttribute('aria-disabled')) return; const i = +b.dataset.a, a = acts[i];
      if (a[1] && !pay(a[1])) return;
      used[id + i] = (used[id + i] || 0) + 1; if (AMC.Career) AMC.Career.mark('tour');
      AMC.UI.close(s);
      if (id === 'tv') return talkshow();
      const txt = a[2](); AMC.Audio.sfx('buy'); Save.save(); if (C.S && C.S.hud) { const dr = C.drawRub; if (dr) dr(); }
      AMC.UI.toast(txt, 4200);
    });
  };
  // TV-Talkshow: eine Quizfrage, richtige Antwort bringt Abos
  function talkshow() {
    const q = U.pick(D.QUIZ), ans = U.shuffle ? U.shuffle(q.slice(1, 5)) : q.slice(1, 5).sort(() => Math.random() - 0.5);
    const s = AMC.UI.open('<div class="panel glass"><header><h2>📺 Kanal 9 · Talkshow</h2></header><p class="lead">Moderatorin: „' + U.esc(q[0]) + '“</p><div class="st-list" id="tvL">' + ans.map(a => '<button type="button" class="st-item" data-nav data-t="' + U.esc(a) + '"><span><b>' + U.esc(a) + '</b></span></button>').join('') + '</div></div>', { back: () => {} });
    s.el.querySelector('#tvL').addEventListener('click', e => {
      const b = e.target.closest('[data-t]'); if (!b) return; const ok = b.dataset.t === q[1]; AMC.UI.close(s);
      const c = AMC.Career && AMC.Career.state(), a = ok ? 25 + Math.round((c ? c.abos : 100) * 0.03) : 5;
      if (c) c.abos += a; funken('serious', ok ? 3 : 1); Save.save(); if (C.drawRub) C.drawRub();
      AMC.Audio.sfx(ok ? 'applause' : 'miss');
      AMC.UI.toast(ok ? '📺 Richtig! Das Studiopublikum jubelt. +' + a + ' Abos, +3 Ernst-Funken' : '📺 Knapp daneben („' + q[1] + '“). Trotzdem sympathisch: +' + a + ' Abos', 4600);
    });
  }
  DI.stop = () => { V = null; };
})(typeof window !== 'undefined' ? window : globalThis);
