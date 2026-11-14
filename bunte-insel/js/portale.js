'use strict';
/* Bunte Insel – Portale zu anderen easygames-Spielen 🌀
   Gemeinsame Rückfrage im Konsolen-Stil (BI.portalAsk), Reise-Übergang (BI.portalGo) und ein Portal-Baustein (BI.makePortal).
   Portale stehen in der Regenbogenwelt (Gay Life!), der Drachenwelt (AERU), der Radiowelt (AnMaCha – Der Podcast) und der Stadt (Marktrausch).
   Taschi-Land nutzt dieselbe Rückfrage. Links bleiben lokal (gleiches Gerät, ../<spiel>/), damit die App auch offline reist.
   Sparsam: je Portal 4 Zeichenaufrufe, nur in der Nähe sichtbar und animiert. */
(function () {
  const TAU = Math.PI * 2;
  let cssDone = false;
  function css() {
    if (cssDone || typeof document === 'undefined') return; cssDone = true; const s = document.createElement('style');
    s.textContent = '.biAsk{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,10,50,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:biAskIn .22s ease-out}'
      + '.biAskCard{width:min(92vw,420px);background:linear-gradient(180deg,#fffaf0,#fff);border-radius:26px;padding:22px 20px 18px;text-align:center;box-shadow:0 18px 50px rgba(30,10,80,.35),inset 0 -4px 0 rgba(0,0,0,.06);border:4px solid var(--pc,#a06bff);font:600 16px/1.4 system-ui,sans-serif;color:#3a2a55;animation:biAskPop .32s cubic-bezier(.2,1.4,.4,1)}'
      + '.biAskIc{font-size:54px;line-height:1;margin:-58px auto 8px;width:84px;height:84px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#fff;border:4px solid var(--pc,#a06bff);box-shadow:0 6px 18px rgba(0,0,0,.18);animation:biAskBob 2s ease-in-out infinite}'
      + '.biAskCard b{display:block;font-size:21px;margin-bottom:6px}.biAskCard p{margin:0 0 14px;font-weight:500;font-size:15px;opacity:.85}'
      + '.biAskRow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.biAskRow button{min-width:140px;min-height:48px;border:0;border-radius:999px;padding:10px 18px;font:700 17px system-ui,sans-serif;cursor:pointer;background:#eee6ff;color:#3a2a55;box-shadow:0 4px 0 rgba(0,0,0,.12)}'
      + '.biAskRow button.go{background:var(--pc,#a06bff);color:#fff}.biAskRow button:focus-visible,.biAskRow button.gpFocus{outline:4px solid #ffd23f;outline-offset:3px}.biAskRow button:active{transform:translateY(2px);box-shadow:none}'
      + '#biWarp{position:fixed;inset:0;z-index:9600;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;color:#fff;font:800 22px system-ui,sans-serif;text-shadow:0 2px 8px rgba(0,0,0,.4);background:radial-gradient(circle,rgba(255,255,255,.9) 0,var(--pc,#a06bff) 35%,#140a32 75%);animation:biWarpIn .7s ease-in both}'
      + '#biWarp i{font-style:normal;font-size:76px;animation:biWarpSpin 1.2s linear infinite}#biWarp small{font:600 14px system-ui;opacity:.85}'
      + '@keyframes biAskIn{from{opacity:0}}@keyframes biAskPop{from{transform:scale(.7);opacity:0}}@keyframes biAskBob{50%{transform:translateY(-5px) rotate(-4deg)}}'
      + '@keyframes biWarpIn{from{opacity:0;transform:scale(1.4)}}@keyframes biWarpSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
  /* Rückfrage: { icon, title, text, color, go, stay, onGo, onClose } → gibt close() zurück */
  BI.portalAsk = function (o) {
    css(); const box = document.createElement('div'); box.className = 'biAsk'; if (o.id) box.id = o.id; box.style.setProperty('--pc', o.color || '#a06bff');
    box.innerHTML = '<div class="biAskCard"><div class="biAskIc">' + (o.icon || '🌀') + '</div><b></b><p></p><div class="biAskRow"><button class="go" data-a="go"></button><button data-a="stay"></button></div></div>';
    box.querySelector('b').textContent = o.title || ''; box.querySelector('p').textContent = o.text || '';
    const go = box.querySelector('[data-a=go]'), st = box.querySelector('[data-a=stay]'); go.textContent = o.go || '🚀 Los geht’s!'; st.textContent = o.stay || '🏝️ Hierbleiben';
    if (o.goId) go.id = o.goId; if (o.stayId) st.id = o.stayId;
    let done = false; const close = () => { if (done) return; done = true; box.remove(); if (BI.portalAskClose === close) BI.portalAskClose = null; o.onClose && o.onClose(); };
    BI.portalAskClose = close; /* Escape / Gamepad-B: main.js schließt damit die Rückfrage, bevor die Pause aufgeht */
    go.onclick = () => { close(); o.onGo && o.onGo(); }; st.onclick = close; box.onclick = e => { if (e.target === box) close(); };
    document.body.appendChild(box); setTimeout(() => { try { go.focus(); } catch (e) { } }, 30);
    return close;
  };
  /* Reise: kurzer Wirbel-Übergang, dann das Spiel öffnen. Klappt die Seite nicht (z. B. blockiert), geht es nach 6 s weiter auf der Insel. */
  BI.portalNav = u => { location.href = u; };
  BI.portalGo = function (o) {
    css(); try { o.persist && o.persist(); } catch (e) { }
    const w = document.createElement('div'); w.id = 'biWarp'; w.style.setProperty('--pc', o.color || '#a06bff'); w.innerHTML = '<i>🌀</i><span></span><small>Dein Inselspiel ist gespeichert</small>';
    w.querySelector('span').textContent = 'Reise zu ' + (o.name || 'easygames') + ' …'; document.body.appendChild(w);
    const url = new URL(o.url, location.href).href; setTimeout(() => { try { BI.portalNav(url); } catch (e) { } }, o.delay == null ? 650 : o.delay);
    setTimeout(() => { if (w.isConnected) { w.remove(); o.onFail && o.onFail(); } }, 6000);
  };
  /* Portal-Baustein: Ring aus Steinen in Themenfarben, wirbelnde Scheibe, Lichtsäule, kreisende Funken und ein Schild */
  BI.makePortal = function (o) {
    const g = new THREE.Group(), b = new BI.Batch(), H = 4.6, R = 3.6, cols = o.cols || [0x8a7ad8, 0xb8a8f0];
    b.cyl(0, 0, 0, 4.6, 5, .5, o.base || 0xe8e0f0, 24); b.cyl(0, .5, 0, 4.1, 4.4, .25, o.base2 || 0xc8b8f0, 24);
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; b.box(Math.cos(a) * R, H + Math.sin(a) * R - .62, 0, 1.25, 1.25, 1.1, cols[i % cols.length], 0, 0, a); }
    for (const s of [-1, 1]) b.box(s * R, 0, 0, 1.3, 1.4, 1.3, cols[0]);
    g.add(b.mesh(BI.mat()));
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), gr = c.createRadialGradient(128, 128, 8, 128, 128, 128), sw = o.swirl || ['#ffffff', '#ffd6f4', '#a06bff', '#3a7bff'];
    gr.addColorStop(0, sw[0]); gr.addColorStop(.25, sw[1]); gr.addColorStop(.55, sw[2]); gr.addColorStop(.85, sw[3]); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 7; for (let k = 0; k < 5; k++) { c.beginPath(); for (let t = 0; t < 1; t += .02) { const a = k / 5 * TAU + t * 5.5, r = 16 + t * 104; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.stroke(); }
    const swirl = new THREE.Mesh(new THREE.CircleGeometry(R - .55, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, side: THREE.DoubleSide, depthWrite: false })); swirl.position.y = H; g.add(swirl);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.6, 26, 16, 1, true), new THREE.MeshBasicMaterial({ color: o.glow || 0xc08aff, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); glow.position.y = 13; g.add(glow);
    /* Funken: 28 Punkte kreisen um den Ring (eine Zeichnung) */
    const N = 28, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seed = [], pc = new THREE.Color();
    for (let i = 0; i < N; i++) { seed.push([Math.random() * TAU, .6 + Math.random() * .8, R + .4 + Math.random() * 1.6]); pc.setHex(cols[i % cols.length]).lerp(new THREE.Color(0xffffff), .35); col.set([pc.r, pc.g, pc.b], i * 3); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .38, vertexColors: true, transparent: true, opacity: .95, depthWrite: false })); pts.frustumCulled = false; g.add(pts);
    /* Schild mit Bild und Namen */
    if (o.label) { const sc = document.createElement('canvas'); sc.width = 512; sc.height = 128; const x = sc.getContext('2d'); x.fillStyle = o.sign || '#a06bff'; x.beginPath(); x.roundRect ? x.roundRect(6, 6, 500, 116, 50) : x.rect(6, 6, 500, 116); x.fill();
      x.lineWidth = 8; x.strokeStyle = '#fff'; x.stroke(); x.fillStyle = '#fff'; x.font = 'bold 54px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.label, 256, 68, 470);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), depthWrite: false })); sp.scale.set(7, 1.75, 1); sp.position.y = H + R + 2; g.add(sp); }
    const P = { group: g, swirl, glow, pts };
    P.update = function (dt, t) {
      swirl.rotation.z -= dt * 1.6; glow.material.opacity = .12 + Math.sin(t * 2.2) * .05;
      for (let i = 0; i < N; i++) { const s = seed[i], a = s[0] + t * s[1]; pos[i * 3] = Math.cos(a) * s[2]; pos[i * 3 + 1] = H + Math.sin(a) * s[2]; pos[i * 3 + 2] = Math.sin(t * 2 + i) * .5; }
      pg.attributes.position.needsUpdate = true;
    };
    return P;
  };
})();

/* Die vier Spiel-Portale in den Welten */
BI.GAME_PORTALS = [
  { key: 'RAINBOW', game: 'gay-life', name: 'Gay Life!', icon: '🏳️‍🌈', color: '#ff4fa3', text: 'Das Regenbogen-Portal öffnet die bunte Spielesammlung „Gay Life!“ auf easygames.',
    cols: [0xe8453c, 0xff9a2a, 0xffd23f, 0x3ec46d, 0x3a7bff, 0x9a5bff], swirl: ['#ffffff', '#ffd6f4', '#ff4fa3', '#7a3bff'], glow: 0xff7ad0, sign: '#ff4fa3', who: ['Regenbogen-Romy', '🌈'] },
  { key: 'DRACHEN', game: 'aeru', name: 'AERU', icon: '🪽', color: '#ff8a2a', text: 'Durch das Drachen-Portal fliegst du zu „AERU – Die Sterneninseln“, einem Flug-Abenteuer über den Wolken.',
    cols: [0x8a3a2a, 0xd8662a, 0xffb43a], swirl: ['#ffffff', '#ffe6a0', '#ff8a2a', '#6a2aa0'], glow: 0xffa040, sign: '#d8662a', base: 0x9a8a80, base2: 0x6a5a50, who: ['Drachenwächterin Brisa', '🐉'] },
  { key: 'RADIO', game: 'anmacha-podcast-tycoon', name: 'AnMaCha – Der Podcast', icon: '🎙️', color: '#e8253c', text: 'Das Funk-Portal bringt dich ins Studio: „AnMaCha – Der Podcast“, das Abenteuer mit Andrew und Marco!',
    cols: [0x222230, 0xe8253c, 0xffffff], swirl: ['#ffffff', '#ffd0d6', '#e8253c', '#20202c'], glow: 0xff5060, sign: '#e8253c', base: 0x40404c, base2: 0x2a2a34, who: ['Funkmeisterin Frida', '📻'] },
  { key: 'CITY', game: 'anmacha-markthalle', name: 'Marktrausch', icon: '🛒', color: '#2aa858', text: 'Hinter dem Stadt-Portal wartet „Marktrausch“, der Supermarkt-Simulator: Regale füllen, kassieren, wachsen!',
    cols: [0x2aa858, 0xff9a2a, 0xffffff], swirl: ['#ffffff', '#dfffe6', '#2aa858', '#1a5a8a'], glow: 0x60e090, sign: '#2aa858', base: 0xd8d8d0, base2: 0xb0b0a8, who: ['Stadtführerin Luna', '🏙️'] }
];
BI.createPortale = function (G) {
  const { scene, W, P, say, save, persist } = G, K = { ready: false, list: [], open: false }, TAU = Math.PI * 2;
  const flags = () => save.flags || (save.flags = {}), flag = f => { flags()[f] = 1; }, has = f => !!flags()[f];
  /* freien Platz im Inselring suchen (nach dem Bau aller Häuser/Wege), Portal schaut zur Inselmitte */
  function spot(O) {
    const ok = (x, z) => W.groundY(x, z) < .3 && !W.onRoad(x, z) && W.free(x, z, 5.2) && W.free(x + 3, z, 2) && W.free(x - 3, z, 2) && W.free(x, z + 3, 2) && W.free(x, z - 3, 2);
    for (const f of [.62, .5, .72, .4, .8]) for (let i = 0; i < 32; i++) { const a = i / 32 * TAU + .3, x = O.x + Math.sin(a) * O.R * f, z = O.z + Math.cos(a) * O.R * f; if (ok(x, z)) return { x, z }; }
    return { x: O.x + O.R * .55, z: O.z };
  }
  K.build = function () {
    if (K.ready) return; K.ready = true;
    for (const D of BI.GAME_PORTALS) {
      const O = BI[D.key]; if (!O || !Number.isFinite(O.x)) continue; const p = spot(O), face = Math.atan2(O.x - p.x, O.z - p.z);
      const M = BI.makePortal({ cols: D.cols, swirl: D.swirl, glow: D.glow, sign: D.sign, base: D.base, base2: D.base2, label: D.icon + ' ' + D.name });
      M.group.position.set(p.x, W.groundY(p.x, p.z), p.z); M.group.rotation.y = face; scene.add(M.group);
      for (const s of [-1, 1]) W.addCircle(p.x + Math.cos(face) * 3.6 * s, p.z - Math.sin(face) * 3.6 * s, .8, false, 9);
      const front = { x: p.x + Math.sin(face) * 6, z: p.z + Math.cos(face) * 6 };
      W.spots['portal_' + D.game] = front; K.list.push({ D, M, x: p.x, z: p.z, front, O });
    }
  };
  K.at = id => { const q = K.list.find(q => q.D.game === id); return q ? q.front : null; };
  K.near = function () {
    if (!K.ready || K.open || P.veh || P.y > 1.5) return null;
    for (const q of K.list) if (Math.hypot(P.x - q.x, P.z - q.z) < 6.5) return { k: 'portal', id: q.D.game, label: ['🌀', 'Durchs Portal: ' + q.D.icon + ' ' + q.D.name] };
    return null;
  };
  K.travel = function (id) {
    const q = K.list.find(q => q.D.game === id); if (!q || K.open) return; const D = q.D; K.open = true; G.setStick && G.setStick(0, 0); flag('po_' + id);
    BI.portalAsk({ id: 'poAsk', goId: 'poGo', stayId: 'poStay', icon: D.icon, color: D.color, title: 'Zu „' + D.name + '“ reisen?', text: D.text + ' Dein Inselspiel wird vorher gespeichert.',
      onClose: () => { K.open = false; },
      onGo: () => { flag('po_' + id + '_reise'); G.fanfare && G.fanfare(); G.earn && G.earn('weltreise'); if (K.noNav) { K.lastUrl = D.game; return; }
        BI.portalGo({ url: '../' + D.game + '/?from=bunteinsel', name: D.name, color: D.color, persist, onFail: () => say('🌀 Das Portal flackert … versuch es gleich noch einmal!', 3600) }); } });
  };
  K.act = n => { if (n && n.k === 'portal') K.travel(n.id); };
  K.busy = () => K.open;
  let seenT = 0;
  K.update = function (dt, t) {
    if (!K.ready) return;
    for (const q of K.list) { const d = Math.hypot(P.x - q.x, P.z - q.z), vis = d < 170; q.M.group.visible = vis; if (vis && d < 110) q.M.update(dt, t); }
    seenT -= dt; if (seenT > 0) return; seenT = .5;
    for (const q of K.list) if (!has('po_seen_' + q.D.game) && Math.hypot(P.x - q.x, P.z - q.z) < 18) { flag('po_seen_' + q.D.game); say('🌀 ' + q.D.who[1] + ' ' + q.D.who[0] + ': „Siehst du das Portal? Es führt zu ' + q.D.icon + ' ' + q.D.name + '!“', 5200); }
  };
  /* Rückkehr aus einem Spiel (?from=<ordner>, Knopf aus rueckweg.js oder AERUs Portal): direkt vor dem passenden Portal ankommen */
  const FROM = (typeof location !== 'undefined' && (location.search.match(/[?&]from=([a-z0-9-]+)/) || [])[1]) || '';
  K.arrive = FROM === 'taschi' || BI.GAME_PORTALS.some(D => D.game === FROM) ? FROM : null;
  if (K.arrive) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }
  const upd = K.update; K.update = function (dt, t) {
    if (K.arrive && K.ready && (!G.playing || G.playing())) {
      const id = K.arrive, q = id === 'taschi' ? W.spots.taschiportal : K.at(id), D = BI.GAME_PORTALS.find(D => D.game === id); K.arrive = null;
      if (q) { P.veh = null; P.x = q.x; P.z = q.z; P.y = W.groundY(q.x, q.z); P.vy = 0; }
      setTimeout(() => say('🌀 Willkommen zurück auf der Bunten Insel' + (D ? ' – frisch aus ' + D.icon + ' ' + D.name : id === 'taschi' ? ' – frisch aus dem Taschi-Abenteuer' : '') + '!', 3600), 500);
    }
    upd(dt, t);
  };
  K.dbg = { list: K.list };
  return K;
};
