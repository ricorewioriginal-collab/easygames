/* AnMaCha – Der Podcast · easygames-Portalplatz und Gastfiguren aus anderen easygames-Spielen.
   - Portale im RicoReWi-Universum zu Zotik, Bunte Insel, TASCHI und AERU (lokale Links auf demselben Gerät, Rückweg über rueckweg.js).
   - Originalfiguren (models/gaeste/*.glb, aus dem Figurencode der Spiele gebacken: tools/bake-podcast-gaeste.cjs) stehen am Portalplatz
     als NPCs mit Medienberufen. Sie deuten ihre eigene Rolle aus ihrem Spiel nur an.
   - Angesprochen werden sie buchbare Studiogäste (AMC.Guests) und sitzen bei der Aufnahme sichtbar im Studio.
   - Requisiten: Sammelfiguren aller getroffenen Gäste auf dem Studiotisch, Pappnase schwebt über dem Platz und im Studio.
   Alles hängt sich an bestehende Funktionen (Worlds.build/update/open, Studio.enter/leave/update, Guests.ROSTER), ohne sie zu verändern. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, Save = AMC.Save, W = AMC.World;
  if (!AMC.Worlds || !AMC.Studio) return;
  const XO = AMC.Crossover = {};
  const SELF = 'anmacha-podcast-tycoon';

  // Modelle: Datei, Höhe in m, Drehung (AERU schaut nach −z)
  const MODELS = { zotik: [1.7, 0], jannis: [1.45, 0], blitz: [0.85, 0], pappnase: [1.1, 0], aeru: [1.9, Math.PI], 'taschi-glutzahn': [1.05, 0], 'taschi-blitzi': [0.9, 0] };
  // Portale: Spiel-Ordner, Name, Icon, Farbe, Vorschaubild aus dem Spiel
  const PORTALS = [
    { id: 'zotik', name: 'Zotik', icon: '🦊', col: 0xff8a22, card: '../zotik/card.png', text: 'Das Fuchs-Abenteuer durch die zehn Welten.' },
    { id: 'bunte-insel', name: 'Bunte Insel', icon: '🏝️', col: 0x3fb8ff, card: '../bunte-insel/card.png', text: 'Die offene Kinder-Insel mit Fahrzeugen, Tieren und Freunden.' },
    { id: 'taschi', name: 'TASCHI', icon: '✨', col: 0xffd23e, card: '../taschi/card.svg', text: 'Das Sammelabenteuer um die 16 Lichter.' },
    { id: 'aeru', name: 'AERU', icon: '🐉', col: 0x46b6ad, card: '../aeru/card.png', text: 'Das Drachenabenteuer über die Sterneninseln.' }
  ];
  // Gäste: Medienberuf im Podcast, Andeutung ihrer Rolle im eigenen Spiel
  const FIGS = [
    { id: 'xo-zotik', portal: 'zotik', models: ['zotik'], icon: '🦊', name: 'Zotik', job: 'Außenreporter', rub: 'serious', bonus: 0.11, cost: 35,
      hi: 'Zotik, live vom Portalplatz! Ich bin für euch überall vor Ort – mit Mikro statt Reiseklinge.',
      origin: 'Psst: In meinem eigenen Spiel suche ich die Splitter der Welten. Hier jage ich nur Schlagzeilen.',
      show: ['Ich war heute schon in drei Vierteln unterwegs – und überall reden sie über euch!', 'Mein Tipp für die Recherche: immer dem Funkeln folgen. Hat bei mir noch nie getäuscht.'] },
    { id: 'xo-jannis', portal: 'bunte-insel', models: ['jannis', 'blitz'], icon: '🧒', name: 'Jannis & Blitz', job: 'Kinderreporter mit Spürnase', rub: 'feel', bonus: 0.1, cost: 30,
      hi: 'Hallo! Ich mache die Kindernachrichten, und Blitz hilft bei der Recherche. Wuff!',
      origin: 'Auf der Bunten Insel fahre ich mein rotes RC-Auto mit der 38. Heute ist es mein Kamerawagen!',
      show: ['Darf ich auch mal den großen Regler schieben? Nur ein bisschen?', 'Blitz hat die Story schon gerochen, bevor wir angefangen haben. Wuff!'] },
    { id: 'xo-aeru', portal: 'aeru', models: ['aeru'], icon: '🐉', name: 'Aeru', job: 'Luftkamera-Drache', rub: 'tv', bonus: 0.12, cost: 40,
      hi: 'Ich fliege die Kamera für Live-Bilder von ganz oben. Bitte lächeln!',
      origin: 'Eigentlich hole ich auf den Sterneninseln den Wind zurück. Für gute Luftaufnahmen mache ich gern eine Pause.',
      show: ['Von oben sieht man, wie viele Leute gerade euren Stream hören. Es sind sehr viele!', 'Nächstes Mal filme ich das Intro im Sturzflug.'] },
    { id: 'xo-taschi', portal: 'taschi', models: ['taschi-blitzi', 'taschi-glutzahn'], icon: '⚡', name: 'Zuckli & Glutzahn', job: 'Taschi-Technikteam: Strom und Scheinwerfer', rub: 'tech', bonus: 0.1, cost: 30,
      hi: 'Zzzt! Zuckli lädt die Sendetechnik, Glutzahn hält die Scheinwerfer warm. Fff!',
      origin: 'Im Taschi-Land sammeln die beiden mit ihrem Team die 16 Lichter. Hier reicht ihnen ein Scheinwerfer.',
      show: ['Zzzt! (Zuckli hat gerade den Sender auf volle Leistung gebracht.)', 'Fff! (Glutzahn dimmt das Licht für den gemütlichen Teil.)'] }
  ];
  XO.FIGS = FIGS; XO.PORTALS = PORTALS;
  // Portalplatz im RicoReWi-Universum (freie Fläche zwischen Radioportal und Hauptweg)
  const PZ = -14, PX = [-164, -155, -146, -137];
  const portalPos = id => { const i = PORTALS.findIndex(p => p.id === id); return i < 0 ? null : { x: PX[i], z: PZ }; };

  const met = id => !!((Save.data.guests || {}).met || {})[id];
  const meet = id => { const g = Save.data.guests = Save.data.guests || {}; g.met = g.met || {}; if (g.met[id]) return false; g.met[id] = 1; Save.save(); return true; };
  // Gäste in die Studiogäste-Liste eintragen (gleiches Format wie guests.js)
  if (AMC.Guests && AMC.Guests.ROSTER) FIGS.forEach(f => { if (!AMC.Guests.ROSTER.some(r => r[0] === f.id)) AMC.Guests.ROSTER.push([f.id, f.icon, f.name, f.job + ' (aus ' + PORTALS.find(p => p.id === f.portal).name + ')', f.rub, f.bonus, f.cost, f.name + ' am easygames-Portalplatz ansprechen', () => met(f.id)]); });

  // ------------------------------------------------------------------ Modelle laden (einmal, dann klonen)
  const proto = {}, wait = {};
  function load(name) {
    if (proto[name]) return Promise.resolve(proto[name]);
    if (wait[name]) return wait[name];
    const T = root.THREE;
    return (wait[name] = new Promise(res => {
      if (!T.GLTFLoader) return res(null);
      new T.GLTFLoader().load('models/gaeste/' + name + '.glb', g => {
        const o = g.scene, [h, ry] = MODELS[name] || [1, 0], b = new T.Box3().setFromObject(o), k = h / Math.max(0.01, b.max.y - b.min.y);
        o.scale.multiplyScalar(k); o.position.y -= b.min.y * k; o.rotation.y = ry;
        o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; } });
        const w = new T.Group(); w.add(o); w.userData.dyn = true; proto[name] = w; res(w);
      }, null, () => res(null));
    }));
  }
  XO.load = load;
  function figure(name, scale) { return load(name).then(p => { if (!p) return null; const c = p.clone(); c.userData.dyn = true; if (scale) c.scale.setScalar(scale); return c; }); }

  // Portal: Ring in Spielfarbe, wirbelnde Scheibe, Lichtsäule, Schild mit Vorschaubild des Spiels
  let swirlTex = null;
  function swirl() {
    if (swirlTex) return swirlTex;
    const T = root.THREE, c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(255,255,255,' + (0.9 - i * 0.12) + ')'; g.lineWidth = 10 - i; g.beginPath(); for (let a = 0; a < 7; a += 0.05) { const r = 8 + a * 16; g.lineTo(128 + Math.cos(a + i) * r, 128 + Math.sin(a + i) * r); } g.stroke(); }
    swirlTex = new T.CanvasTexture(c); return swirlTex;
  }
  function makePortal(p, g, x, z) {
    const T = root.THREE, grp = new T.Group(); grp.position.set(x, 0, z); grp.userData.dyn = true; g.add(grp);
    const col = new T.Color(p.col), ring = new T.Mesh(new T.TorusGeometry(1.55, 0.2, 12, 40), new T.MeshStandardMaterial({ color: W.lin(p.col), emissive: col, emissiveIntensity: 0.9, roughness: 0.4 }));
    ring.position.y = 1.9; grp.add(ring);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = new T.Mesh(new T.DodecahedronGeometry(0.22), W.mat(i % 2 ? 0xffffff : p.col, { r: 0.6 })); s.position.set(Math.cos(a) * 1.55, 1.9 + Math.sin(a) * 1.55, 0.12); grp.add(s); }
    const disc = new T.Mesh(new T.CircleGeometry(1.4, 40), new T.MeshBasicMaterial({ map: swirl(), color: col, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
    disc.position.y = 1.9; grp.add(disc);
    const base = W.cyl(1.7, 1.9, 0.25, W.mat(0x2a2440, { r: 0.6 }), 0, 0.12, 0, grp, 24); base.castShadow = false;
    const beam = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 9, 20, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    beam.position.y = 4.5; grp.add(beam);
    W.glow(p.col, 4.2, grp, 0, 1.9, 0.3);
    // Schild: Vorschaubild + Name (Bild aus dem Originalspiel)
    const tx = W.textTex([p.icon + ' ' + p.name], { w: 512, h: 128, size: 64, accent: '#' + p.col.toString(16).padStart(6, '0') });
    const sign = new T.Mesh(new T.PlaneGeometry(2.6, 0.65), new T.MeshBasicMaterial({ map: tx, toneMapped: false })); sign.position.set(0, 4.15, 0); grp.add(sign);
    const card = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); card.position.set(0, 5.35, 0); grp.add(card);
    new T.TextureLoader().load(p.card, t => { t.encoding = T.sRGBEncoding; card.material.map = t; card.material.needsUpdate = true; }, null, () => { card.visible = false; });
    return { grp, ring, disc, beam };
  }

  // ------------------------------------------------------------------ Aufbau in der Stadt (nach Worlds.build)
  let V = null;
  const build0 = AMC.Worlds.build;
  AMC.Worlds.build = function (ctx) {
    const r = build0.apply(this, arguments);
    try { buildPlaza(ctx); } catch (e) { console.warn('Portalplatz', e); }
    return r;
  };
  function buildPlaza(C) {
    const S = C.S; if (!S || S.mode !== 'free' || S.net || !S.areas) return;
    const T = root.THREE, g = S.group;
    V = { S, C, portals: [], figs: [], pap: null, t: 0, back: null };
    // Platz: Boden, Schild
    const floor = new T.Mesh(new T.CircleGeometry(20, 48), W.mat(0x3a3160, { r: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.scale.set(1.25, 0.55, 1); floor.position.set(-150.5, 0.15, PZ + 1.5); floor.receiveShadow = true; g.add(floor);
    const st = W.textTex(['🌀 easygames-Portalplatz', 'Reisen in andere Spiele · Gäste fürs Studio'], { w: 1024, h: 256, size: 70, accent: '#a46bff' });
    const sg = new T.Mesh(new T.PlaneGeometry(8, 2), new T.MeshBasicMaterial({ map: st, toneMapped: false, side: T.DoubleSide })); sg.position.set(-150.5, 7.3, PZ - 1.2); g.add(sg);
    PORTALS.forEach((p, i) => {
      const x = PX[i]; V.portals.push(Object.assign(makePortal(p, g, x, PZ), { p }));
      C.addBox(x - 1.9, x + 1.9, PZ - 0.35, PZ + 0.35, 4);
      C.addStation('world:xo-portal-' + p.id, '🌀 Portal zu ' + p.name, x, PZ + 1.6, 1.8);
    });
    // Gastfiguren vor ihren Portalen
    FIGS.forEach(f => {
      const pp = portalPos(f.portal), x = pp.x + 2.6, z = PZ + 3.2, rec = { f, x, z, objs: [] }; V.figs.push(rec);
      C.addStation('world:' + f.id, '🎙️ ' + f.name + ' (' + f.job.split(':')[0] + ')', x, z + 0.4, 1.7);
      f.models.forEach((m, k) => figure(m).then(o => { if (!o || !V || V.S !== S) return; o.position.set(x + k * 0.95, 0.15, z - k * 0.25); o.rotation.y = 0.2; g.add(o); rec.objs.push(o); }));
    });
    // Pappnase schwebt über dem Platz
    figure('pappnase').then(o => { if (!o || !V || V.S !== S) return; o.position.set(-141.5, 8.6, PZ + 2); g.add(o); V.pap = o; });
    // Rückkehr aus einem Spiel: vor dem Portal absetzen
    if (FROM && portalPos(FROM)) V.back = FROM;
  }
  const FROM = (location.search.match(/[?&]from=([a-z0-9-]+)/) || [])[1] || '';
  if (FROM) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }

  const upd0 = AMC.Worlds.update;
  AMC.Worlds.update = function (dt) {
    const r = upd0.apply(this, arguments);
    if (V && V.S === (V.C && V.C.S)) {
      V.t += dt; const t = V.t, pl = V.S.pl;
      if (V.back && pl) { const pp = portalPos(V.back); pl.x = pp.x; pl.z = PZ + 3; if (pl.vx != null) pl.vx = pl.vz = 0; const nm = (PORTALS.find(p => p.id === V.back) || {}).name; V.back = null; AMC.UI.toast('🎙️ Willkommen zurück aus ' + nm + '!', 3200); }
      const near = pl && Math.hypot(pl.x + 150.5, pl.z - PZ) < 60;
      if (near) {
        V.portals.forEach((o, i) => { o.disc.rotation.z -= dt * (1.4 + i * 0.2); o.ring.rotation.z += dt * 0.3; o.beam.material.opacity = 0.1 + Math.sin(t * 2 + i) * 0.04; });
        V.figs.forEach((rec, i) => rec.objs.forEach((o, k) => {
          o.position.y = 0.15 + Math.abs(Math.sin(t * 2.2 + i + k)) * (rec.f.id === 'xo-aeru' ? 0.25 : 0.05);
          const want = Math.hypot(pl.x - o.position.x, pl.z - o.position.z) < 7 ? Math.atan2(pl.x - o.position.x, pl.z - o.position.z) : 0.2 + Math.sin(t * 0.5 + i) * 0.3;
          let d = want - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.y += d * Math.min(1, dt * 4);
        }));
        if (V.pap) { V.pap.position.y = 8.6 + Math.sin(t * 1.3) * 0.4; V.pap.rotation.y = Math.sin(t * 0.6) * 0.5; }
      }
    }
    return r;
  };

  // ------------------------------------------------------------------ Gespräche und Portal-Rückfrage (Stationen 'world:xo-…')
  const open0 = AMC.Worlds.open;
  AMC.Worlds.open = function (id) {
    if (typeof id === 'string' && id.startsWith('xo-portal-')) return XO.portal(id.slice(10));
    if (typeof id === 'string' && id.startsWith('xo-')) return XO.talk(id);
    return open0.apply(this, arguments);
  };
  const today = () => { const c = AMC.Career ? AMC.Career.state() : { today: {} }; c.today.places = c.today.places || {}; return c.today.places; };
  function panel(title, hint, rows, onPick) {
    const s = AMC.UI.open('<div class="panel glass"><header><h2>' + U.esc(title) + '</h2><button class="btn small" data-nav id="xoB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + U.esc(hint) + '</p><div class="st-list" id="xoL">' +
      rows.map((r, i) => '<button type="button" class="st-item" data-nav data-x="' + i + '"' + (r.off ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + r.icon + '</span><span><b>' + U.esc(r.title) + '</b><small>' + U.esc(r.sub) + '</small></span></button>').join('') + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#xoB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#xoL').addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (!b || b.getAttribute('aria-disabled')) return; AMC.UI.close(s); onPick(+b.dataset.x); });
    return s;
  }
  XO.talk = function (id) {
    const f = FIGS.find(x => x.id === id); if (!f) return;
    const used = today(), key = 'xo:' + id, game = PORTALS.find(p => p.id === f.portal).name;
    AMC.Audio.sfx('talk');
    const rows = [
      { icon: '🎙️', title: 'Kurzinterview fürs Thema', sub: used[key] ? 'Heute schon gemacht – morgen wieder!' : '+3 Themen-Funken · einmal am Tag', off: !!used[key] },
      { icon: '🌀', title: 'Woher kommst du?', sub: 'Aus dem easygames-Spiel ' + game },
      { icon: '⭐', title: met(id) ? 'Studiogast buchen' : 'Als Studiogast gewinnen', sub: met(id) ? 'Menü → Studiogäste · +' + Math.round(f.bonus * 100) + ' % Hörer' : 'Danach im Menü → Studiogäste buchbar' }
    ];
    return panel(f.icon + ' ' + f.name + ' · ' + f.job, '„' + f.hi + '“', rows, i => {
      if (i === 0) { used[key] = 1; const S = V && V.C && V.C.S; if (S && S.got) S.got[f.rub] = (S.got[f.rub] || 0) + 3; if (V && V.C.drawRub) V.C.drawRub(); Save.earn(15); AMC.Audio.sfx('ok'); AMC.UI.bubble(f.name, f.show[0], '+3 Themen-Funken · +15 🎟️'); if (AMC.Career) AMC.Career.mark('tour'); }
      else if (i === 1) AMC.UI.bubble(f.name, f.origin, '🌀 Portal zu ' + game + ' gleich nebenan');
      else { const n = meet(id); if (n) { AMC.Audio.sfx('ok'); AMC.UI.toast('🎙️ Neuer möglicher Studiogast: ' + f.name + ' (Menü → Studiogäste)', 4200); if (AMC.Feed) AMC.Feed.post(f.icon, f.name + ' (' + game + ') kommt bald zu AnMaCha ins Studio! 🌀', 'gast'); }
        if (AMC.Guests && AMC.Guests.panel) AMC.Guests.panel(); }
    });
  };
  XO.nav = u => { location.href = u; };
  XO.portal = function (gid) {
    const p = PORTALS.find(x => x.id === gid); if (!p) return;
    return panel('🌀 Portal zu ' + p.name, p.text + ' Dein Podcast ist gespeichert. Oben in der Mitte bringt dich „Zurück zum Podcast“ wieder hierher.', [
      { icon: '🚀', title: 'Reisen', sub: 'Öffnet ' + p.name + ' auf diesem Gerät' },
      { icon: '🏙️', title: 'Hierbleiben', sub: 'Weiter im Podcast' }
    ], i => {
      if (i !== 0) return;
      Save.save(); AMC.Audio.sfx('door');
      const w = U.el('div', 'xo-warp'); w.style.cssText = 'position:fixed;inset:0;z-index:9600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#fff;font:800 22px system-ui,sans-serif;text-shadow:0 2px 8px rgba(0,0,0,.5);background:radial-gradient(circle,#fff 0,#' + p.col.toString(16).padStart(6, '0') + ' 40%,#14161f 100%)';
      w.innerHTML = '<i style="font-style:normal;font-size:72px">🌀</i><span></span>'; w.querySelector('span').textContent = 'Reise zu ' + p.name + ' …'; document.body.appendChild(w);
      const url = new URL('../' + p.id + '/?from=' + SELF, location.href).href;
      setTimeout(() => { try { XO.nav(url); } catch (e) { } }, 650);
      setTimeout(() => w.remove(), 6000);
    });
  };

  // ------------------------------------------------------------------ Studio: gebuchter Gast sitzt mit am Tisch, Sammelfiguren als Requisiten
  const ST = AMC.Studio, ST_ = { guest: [], props: null, pap: null, line: 0, id: null };
  function clearGuest() { ST_.guest.forEach(o => o.parent && o.parent.remove(o)); ST_.guest = []; ST_.id = null; }
  function placeGuest(mode) {
    clearGuest(); clearTimeout(ST_.to1); clearTimeout(ST_.to2);
    const g = AMC.Guests && AMC.Guests.today(), f = g && FIGS.find(x => x.id === g.id); if (!f || mode === 'quiz' || mode === 'menu') return;
    ST_.id = f.id; const pos = [[1.75, -1.75], [2.75, -1.95]];
    // Kleine Gäste (Kind, Hund, Taschis) stehen auf einem Gästepodest, damit sie über das Pult schauen
    f.models.forEach((m, k) => figure(m).then(o => {
      if (!o || ST_.id !== f.id || !ST.group) return; const T = root.THREE, lift = Math.max(0, 1.6 - (MODELS[m] || [1.6])[0]);
      const grp = new T.Group(); grp.position.set(pos[k][0], 0, pos[k][1]); grp.rotation.y = -0.45; o.position.y = lift; grp.add(o);
      if (lift > 0.05) { W.cyl(0.42, 0.48, lift, W.mat(0x2a2440, { r: 0.5 }), 0, lift / 2, 0, grp, 20); W.cyl(0.43, 0.43, 0.03, W.mat(0xff8a1e, { e: 0xff6a00, ei: 1.2 }), 0, lift, 0, grp, 20); }
      grp.userData.lift = lift; ST.group.add(grp); ST_.guest.push(grp);
    }));
    if (mode === 'show') {
      ST_.to1 = setTimeout(() => ST.mode === 'show' && AMC.UI.bubble(f.name, f.hi, '🎙️ Studiogast'), 1800);
      ST_.to2 = setTimeout(() => ST.mode === 'show' && AMC.UI.bubble(f.name, f.show[1], '🎙️ Studiogast'), 26000);
    }
  }
  function placeProps() {
    if (!ST.desk) return;
    if (!ST_.props) { const T = root.THREE; ST_.props = new T.Group(); ST_.props.position.set(0, 1.1, 0.02); ST.desk.add(ST_.props); }
    const want = FIGS.filter(f => met(f.id)).flatMap(f => f.models), key = want.join(',');
    if (ST_.props.userData.key !== key) {
      ST_.props.userData.key = key; while (ST_.props.children.length) ST_.props.remove(ST_.props.children[0]);
      want.forEach((m, i) => figure(m, 0.16).then(o => { if (!o) return; const side = i % 2 ? 1 : -1, n = Math.floor(i / 2); o.position.set(side * (1.95 - n * 0.22), 0, 0.05); o.rotation.y = -side * 0.35; ST_.props.add(o); }));
    }
    if (!ST_.pap && want.length && ST.group) figure('pappnase', 0.55).then(o => { if (!o || ST_.pap) return; o.position.set(-3.1, 2.6, -2.2); ST.group.add(o); ST_.pap = o; });
  }
  const enter0 = ST.enter;
  ST.enter = function (mode) { const r = enter0.apply(this, arguments); try { placeProps(); placeGuest(mode); } catch (e) { console.warn('Studiogast', e); } return r; };
  const leave0 = ST.leave;
  ST.leave = function () { clearGuest(); return leave0.apply(this, arguments); };
  const stUpd0 = ST.update;
  ST.update = function (dt, o) {
    const r = stUpd0.apply(this, arguments);
    const t = ST.t || 0; ST_.guest.forEach((g, k) => { const o = g.children[0]; if (o) o.position.y = (g.userData.lift || 0) + Math.abs(Math.sin(t * 1.8 + k)) * 0.04; g.rotation.y = -0.45 + Math.sin(t * 0.7 + k) * 0.12; });
    if (ST_.pap) { ST_.pap.position.y = 2.6 + Math.sin(t * 1.2) * 0.15; ST_.pap.rotation.y = Math.sin(t * 0.5) * 0.4; }
    return r;
  };
  XO.state = () => ({ plaza: !!V, portals: V ? V.portals.length : 0, figs: V ? V.figs.reduce((n, r) => n + r.objs.length, 0) : 0, guest: ST_.guest.length, props: ST_.props ? ST_.props.children.length : 0 });
})(window);
