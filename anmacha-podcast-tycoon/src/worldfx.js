/* AnMaCha – Der Podcast · Welt-Upgrade: echte CC0-Modelle (Kenney City-, Car-, Nature- und Space-Kit),
   Menschenmengen (easygames-Figuren), Verkehr, Frachtschiffe, Video-Wände mit wechselndem Programm, Neon, Scheinwerfer, Feuerwerk und Umgebungsgeräusche.
   Nur in der freien Stadt (nicht online). Alles rein optisch – am Gameplay ändert sich nichts. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const FX = AMC.WorldFX = {};
  const CARS = ['sedan', 'taxi', 'van', 'police_car', 'delivery_van'];
  let C = null, T = null, V = null;

  // ------------------------------------------------------------------ Video-Wände: ein Programm aus Live-Show, Nachrichten, Werbung, Visualizer, Wetter
  const ADS = [['🚐', 'Gisela Camping', 'Urlaub auf vier Rädern', '#3aa7a0'], ['📺', 'Kanal 9', 'Heute 20:15 · Talk am Hafen', '#3dd6ff'], ['✳️', 'RicoReWi.de', 'Musik · Bücher · Games · Apps', '#ffd45a'],
    ['📻', 'ricorewi-radio.de', 'Alle AnMaCha-Streams an einem Ort', '#ff8a1e'], ['🎪', 'Radio-Festival', 'Tickets auf der Festival-Insel', '#ff3da8'], ['☕', 'Studio-Kaffee', 'Macht 45 Minuten Einleitung möglich', '#c58a4a'],
    ['🎧', 'AnMaCha – Der Podcast', 'Jede Woche eine neue Folge', '#ff8a1e'], ['🗞️', 'Morgenpost', 'Druckfrisch aus dem Medienhafen', '#ffd23f']];
  const NEWS = ['Andrew und Marco knacken die Hörer-Charts', 'Festival-Insel: Hauptbühne heute ausverkauft', 'Fernsehturm sendet wieder in HD', 'Gisela fährt Rekord-Kilometer',
    'Störsender im Hafen gesichtet', 'RicoReWi-Universum öffnet die Music Arena', 'Goldene Kassetten in der Stadt versteckt', 'Kanal 9 sucht neue Talkgäste'];
  const LOGOS = {};
  const PROGS = ['live', 'ad', 'news', 'viz', 'ad', 'info'];
  function tv(seed) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288;
    const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
    return { cv, g: cv.getContext('2d'), tex, seed, t: seed * 2.3 };
  }
  function font(g, px, w) { g.font = (w || 700) + ' ' + px + 'px Fredoka, "Segoe UI", system-ui, sans-serif'; }
  function drawTv(s) {
    const g = s.g, w = 512, h = 288, t = s.t, slot = Math.floor(t / 7), p = PROGS[(slot + s.seed) % PROGS.length], k = (t % 7) / 7;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (p === 'live') {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a0f2e'); gr.addColorStop(1, '#3a1430'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 32; i++) { const v = 0.25 + 0.75 * Math.abs(Math.sin(t * (3 + i % 5) + i * 1.7)) * (0.6 + 0.4 * Math.sin(t * 1.3 + i)); g.fillStyle = 'hsl(' + (20 + i * 4) + ',95%,58%)'; g.fillRect(16 + i * 15.2, h - 30 - v * 110, 11, v * 110); }
      font(g, 74); g.fillStyle = '#fff'; g.fillText('AnMa', w / 2 - 58, 88); g.fillStyle = '#ff8a1e'; g.fillText('Cha', w / 2 + 92, 88);
      font(g, 26, 600); g.fillStyle = '#ffd7ae'; g.fillText('Andrew & Marco · Der Podcast', w / 2, 140);
      if (Math.floor(t * 2) % 2) { g.fillStyle = '#ff2a3a'; g.beginPath(); g.arc(40, 34, 11, 0, 7); g.fill(); }
      font(g, 24); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText('LIVE', 58, 35);
    } else if (p === 'ad' && (slot + s.seed) % 2) {   // Sender-Werbung mit echtem Logo
      const sts = AMC.Data.STATIONS, st = sts[(slot * 5 + s.seed) % sts.length];
      if (!LOGOS[st.slug]) { const im = new Image(); im.src = AMC.UI.senderLogo(st.slug); LOGOS[st.slug] = im; }
      const im = LOGOS[st.slug], gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, st.color); gr.addColorStop(1, '#0b0b14'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const z = 1 + 0.04 * Math.sin(t * 3), L = 220 * z;
      if (im.complete && im.naturalWidth) g.drawImage(im, 34 + (220 - L) / 2, (h - L) / 2, L, L);
      g.textAlign = 'left'; font(g, 38); g.fillStyle = '#fff'; g.fillText(st.name, 276, 110);
      font(g, 20, 600); g.fillStyle = 'rgba(255,255,255,.9)'; const ds = st.desc.split(' '), hf = Math.ceil(ds.length / 2); g.fillText(ds.slice(0, hf).join(' '), 276, 156); g.fillText(ds.slice(hf).join(' '), 276, 184);
      font(g, 22); g.fillStyle = '#ffd23f'; g.fillText('▶ Jetzt einschalten', 276, 232); g.textAlign = 'center';
    } else if (p === 'ad') {
      const a = ADS[(slot * 3 + s.seed) % ADS.length], gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
      gr.addColorStop(0, a[3]); gr.addColorStop(1, '#0b0b14'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 10; i++) { g.strokeStyle = 'rgba(255,255,255,' + (0.06 + 0.05 * Math.sin(t * 2 + i)) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, 30 + ((i * 40 + t * 60) % 400), 0, 7); g.stroke(); }
      const z = 1 + 0.08 * Math.sin(t * 3); font(g, Math.round(96 * z)); g.fillStyle = '#fff'; g.fillText(a[0], w / 2, 92);
      font(g, 46); g.fillText(a[1], w / 2, 178); font(g, 24, 600); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(a[2], w / 2, 222);
    } else if (p === 'news') {
      g.fillStyle = '#0d1a33'; g.fillRect(0, 0, w, h); g.fillStyle = '#c4122f'; g.fillRect(0, 0, w, 56);
      font(g, 30); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText('⚡ EIL · Medienstadt', 18, 30);
      const n = NEWS[(slot + s.seed) % NEWS.length]; font(g, 34); g.textAlign = 'center'; g.fillStyle = '#fff';
      const words = n.split(' '), half = Math.ceil(words.length / 2); g.fillText(words.slice(0, half).join(' '), w / 2, 118); g.fillText(words.slice(half).join(' '), w / 2, 162);
      g.fillStyle = '#ffd23f'; g.fillRect(0, h - 52, w, 52); font(g, 26, 600); g.fillStyle = '#111'; g.textAlign = 'left';
      const tick = NEWS.join('   +++   '), x = w - ((t * 90) % (tick.length * 13 + w)); g.fillText(tick, x, h - 25);
    } else if (p === 'viz') {
      g.fillStyle = 'rgba(8,6,20,1)'; g.fillRect(0, 0, w, h);
      for (let r = 0; r < 6; r++) { g.strokeStyle = 'hsl(' + ((t * 60 + r * 50) % 360) + ',95%,60%)'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= w; x += 8) { const y = h / 2 + Math.sin(x * 0.02 + t * (2 + r * 0.4) + r) * (30 + r * 14) * Math.sin(t + r); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      font(g, 30); g.fillStyle = '#fff'; g.fillText('♪ ' + ((D.HOSTS && 'AnMaCha Radio') || 'Radio') + ' ♪', w / 2, 40);
    } else {
      const wt = AMC.Atmos ? AMC.Atmos.weather() : { icon: '☀️', name: 'Sonnig' }, cs = AMC.Career ? AMC.Career.state() : { day: 1, min: 720 }, ev = AMC.Events ? AMC.Events.week() : null;
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1f6fb8'); gr.addColorStop(1, '#0c2a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const m = Math.floor(cs.min || 0) % 1440; font(g, 90); g.fillStyle = '#fff'; g.fillText(wt.icon, 110, 118); font(g, 64); g.fillText(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'), 330, 100);
      font(g, 28, 600); g.fillText(wt.name + ' · Tag ' + (cs.day || 1), 330, 152); if (ev) { font(g, 26, 600); g.fillStyle = '#ffd23f'; g.fillText(ev.icon + ' ' + ev.name + ' · ' + ev.have + '/' + ev.need, w / 2, 222); }
    }
    // Scanlines und Übergang
    g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    if (k > 0.95 || k < 0.03) { g.fillStyle = 'rgba(255,255,255,' + (k < 0.03 ? 0.5 - k * 16 : (k - 0.95) * 10) + ')'; g.fillRect(0, 0, w, h); }
    s.tex.needsUpdate = true;
  }
  // Bildschirm mit Rahmen (optional auf Mast)
  function screen(ch, w, x, y, z, ry, pole) {
    const g = new T.Group(), h = w * 9 / 16, frame = W.mat(0x15161c, { r: 0.4, m: 0.5 });
    W.box(w + 0.6, h + 0.6, 0.5, frame, 0, 0, -0.3, g, true);
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: V.tvs[ch].tex, toneMapped: false })); m.position.z = -0.04; g.add(m);
    if (pole) { W.cyl(0.35, 0.45, y - h / 2, W.mat(0x2a2c34, { r: 0.5, m: 0.6 }), 0, -(y - h / 2) / 2 - h / 2, -0.3, g, 10); C.addBox(x - 0.6, x + 0.6, z - 0.6, z + 0.6, y - h / 2); }
    g.position.set(x, y, z); g.rotation.y = ry || 0; V.S.group.add(g); V.screens.push({ g, x, z, ch }); return g;
  }

  // ------------------------------------------------------------------ Menschen (easygames-Figuren, Quaternius CC0): Publikum, Spaziergänger, Lagerfeuer
  // Figuren entstehen nacheinander im Hintergrund – die nächsten zuerst, damit nichts ruckelt
  async function spawnPeople(list) {
    const myV = V, pl = V.S.pl;
    list.sort((a, b) => Math.hypot(a.x - pl.x, a.z - pl.z) - Math.hypot(b.x - pl.x, b.z - pl.z));
    for (const o of list) {
      if (V !== myV) return;
      const fig = await W.makeFan(o.seed).catch(() => null);
      if (V !== myV) { if (fig) fig.dispose(); return; }
      if (!fig) continue;
      const p = Object.assign({ fig, wrap: fig.root, cur: null, t: Math.random() * 3, tx: o.x, tz: o.z, hx: o.x, hz: o.z, sp: 1.1 + Math.random() * 0.5, yaw: Math.random() * 6 }, o);
      fig.root.traverse(m => { if (m.isMesh) m.castShadow = W.quality > 1; });
      fig.root.position.set(o.x, 0.12, o.z); fig.root.rotation.y = o.face != null ? o.face : p.yaw; V.S.group.add(fig.root);
      anim(p, o.beh === 'walk' ? 'walk' : o.beh === 'sit' ? 'crouch' : 'idle'); if (o.beh === 'walk') pickTarget(p);
      V.people.push(p);
    }
  }
  function anim(p, n) { if (p.cur !== n) { p.fig.play(n, { fade: 0.25 }); p.cur = n; } }
  function freeAt(x, z) { return !C.solidAt(x, 0.6, z) && (!AMC.Worlds || AMC.Worlds.inside(x, z, 1)); }
  function pickTarget(p) {
    for (let k = 0; k < 8; k++) { const a = Math.random() * 6.28, r = 4 + Math.random() * (p.r || 18), x = p.hx + Math.cos(a) * r, z = p.hz + Math.sin(a) * r; if (freeAt(x, z)) { p.tx = x; p.tz = z; return; } }
    p.tx = p.hx; p.tz = p.hz;
  }
  function updPeople(dt, pl) {
    const near = [];
    for (const p of V.people) {
      const d = Math.hypot(p.x - pl.x, p.z - pl.z); p.wrap.visible = d < (W.quality > 1 ? 120 : 70); if (d > 80) continue;
      p.t -= dt;
      if (p.talking) { p.wrap.rotation.y = p.yaw; near.push(p); continue; }
      if (p.beh === 'walk') {
        const dx = p.tx - p.x, dz = p.tz - p.z, L = Math.hypot(dx, dz);
        if (p.wait > 0) { p.wait -= dt; anim(p, 'idle'); if (p.wait <= 0) pickTarget(p); }
        else if (L < 0.6) { p.wait = 1 + Math.random() * 3; }
        else {
          // Spieler im Weg? kurz stehen bleiben und grüßen
          if (Math.hypot(pl.x - p.x, pl.z - p.z) < 1.6) { p.wait = 1.4; anim(p, 'yes'); }
          else {
            const nx = p.x + dx / L * p.sp * dt, nz = p.z + dz / L * p.sp * dt;
            if (freeAt(nx, nz)) { p.x = nx; p.z = nz; anim(p, 'walk'); p.yaw = Math.atan2(dx, dz); } else pickTarget(p);
          }
        }
        p.wrap.position.set(p.x, 0.12 + (p.y || 0), p.z); { const d = p.yaw - p.wrap.rotation.y; p.wrap.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(1, dt * 8); }
      } else if (p.beh === 'cheer' && p.t <= 0) {
        // Publikum: jubeln, springen, klatschen – je lauter die Bühne, desto mehr
        const hot = V.hype > 0, r = Math.random();
        anim(p, hot ? (r < 0.4 ? 'dance' : r < 0.7 ? 'arms' : 'yes') : r < 0.3 ? 'dance' : r < 0.5 ? 'arms' : r < 0.65 ? 'yes' : 'idle'); p.t = 2 + Math.random() * 3;
      }
      near.push(p);
    }
    // Animationen nur in der Nähe rechnen (fern: halbe Rate)
    for (const p of near) { p.k = (p.k || 0) + 1; const far = Math.hypot(p.x - pl.x, p.z - pl.z) > 40; if (!far) p.fig.update(dt); else if (p.k % 2) p.fig.update(dt * 2); }
  }

  // ------------------------------------------------------------------ Fahrzeuge auf festen Runden (bremsen vor dem Spieler)
  function loopPath(pts) { let L = 0; const seg = pts.map((a, i) => { const b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); const s = { a, b, l, s0: L }; L += l; return s; }); return { seg, L }; }
  function onPath(P, s) { s = ((s % P.L) + P.L) % P.L; for (const g of P.seg) if (s <= g.s0 + g.l) { const k = (s - g.s0) / g.l; return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k, Math.atan2(g.b[0] - g.a[0], g.b[1] - g.a[1])]; } return [P.seg[0].a[0], P.seg[0].a[1], 0]; }
  function vehicle(model, len, P, s, v, y) {
    const g = W.prop(model, len); if (!g) return null; V.S.group.add(g);
    const c = { g, P, s, v, base: v, y: y || 0.12, model }; V.cars.push(c); return c;
  }
  function updCars(dt, pl) {
    for (const c of V.cars) {
      const [x, z, h] = onPath(c.P, c.s), fx = Math.sin(h), fz = Math.cos(h), dx = pl.x - x, dz = pl.z - z, along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
      const block = !c.ship && along > 0 && along < 8 && side < 2.4 || V.cars.some(o => o !== c && o.P === c.P && ((o.s - c.s + c.P.L) % c.P.L) < 9 && ((o.s - c.s + c.P.L) % c.P.L) > 0.1);
      c.v = U.damp(c.v, block ? 0 : c.base, block ? 6 : 1.2, dt); c.s += c.v * dt;
      c.g.position.set(x, c.y + (c.ship ? Math.sin(V.time * 0.8 + c.s) * 0.15 : 0), z);
      const d = h - c.g.rotation.y; c.g.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(1, dt * (c.ship ? 1.2 : 6));
      if (!c.ship && block && c.v < 1 && Math.hypot(dx, dz) < 7 && !(c.honk > V.time)) { c.honk = V.time + 5; AMC.Audio.sfx('horn'); }
    }
  }

  // ------------------------------------------------------------------ KayKit-Stadtmöbel: Ampeln, Bänke, Hydranten, Büsche, Container
  function kitCity(S, g, solid) {
    if (!W.models.kk_bench) return;
    const R = C.ROADS, L = { light: [], bench: [], hyd: [], bush: [], dump: [], box: [] };
    const nearSt = (x, z, r) => (S.stations || []).some(s => Math.hypot(s.x - x, s.z - z) < r);
    const free = (x, z, r) => !nearSt(x, z, r + 3) && ![[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].some(([a, b]) => C.solidAt(x + a, 1, z + b));
    R.forEach(a => R.forEach(b => [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { const x = a + sx * 5.8, z = b + sz * 5.8; L.light.push({ x, z, rot: Math.atan2(-sx, -sz), s: 4.4, y: 0.16 }); solid(x, z, 0.35, 0.35, 4); })));
    let k = 0;
    R.forEach(r => [-1, 1].forEach(sd => [0, 1].forEach(ax => { for (let s = -84; s <= 84; s += 7) {
      if (R.some(q => Math.abs(q - s) < 9)) continue; k++;
      const kind = (k * 7 + (r + 50) * 3 + sd * 5 + ax * 11) % 9, off = sd * 6.4, x = ax ? s : r + off, z = ax ? r + off : s, rot = ax ? (sd > 0 ? Math.PI : 0) : (sd > 0 ? -Math.PI / 2 : Math.PI / 2);
      if (kind === 0 || kind === 5) { if (free(x, z, 1.4)) { L.bench.push({ x, z, rot, s: 2.1, y: 0.16 }); solid(x, z, ax ? 2.1 : 0.6, ax ? 0.6 : 2.1, 0.5); } }
      else if (kind === 1 || kind === 6) { if (free(x, z, 0.8)) L.bush.push({ x, z, rot: k, s: 1.2, y: 0.16 }); }
      else if (kind === 2) { if (free(x, z, 0.5)) { L.hyd.push({ x, z, rot, s: 0.8, y: 0.16 }); solid(x, z, 0.4, 0.4, 0.8); } }
      else if (kind === 3) { const x2 = ax ? s : r + sd * 8.6, z2 = ax ? r + sd * 8.6 : s; if (free(x2, z2, 1.6)) { L.dump.push({ x: x2, z: z2, rot, s: 2.2, y: 0.16 }); solid(x2, z2, 2.2, 2.2, 1.3); } }
      else if (kind === 7) { const x2 = ax ? s : r + sd * 8, z2 = ax ? r + sd * 8 : s; if (free(x2, z2, 0.8)) L.box.push({ x: x2, z: z2, rot: k, s: 0.9, y: 0.16 }); }
    } })));
    W.instances(g, 'kk_trafficlight_a', L.light, { byHeight: true }); W.instances(g, 'kk_bench', L.bench); W.instances(g, 'kk_bush', L.bush, { byHeight: true });
    W.instances(g, 'kk_firehydrant', L.hyd, { byHeight: true }); W.instances(g, 'kk_dumpster', L.dump); W.instances(g, k % 2 ? 'kk_box_a' : 'kk_box_b', L.box);
    V.kit = L;
  }

  // KayKit in den Welten: Laternen, Bänke, Büsche, Mülleimer; Wellenburg mit KayKit-Häusern, Wasserturm auf dem Berg
  function kitWorlds(S, g, solid) {
    const WO = AMC.Worlds; if (!WO || !W.models.kk_streetlight) return;
    const nearSt = (x, z, r) => (S.stations || []).some(s => Math.hypot(s.x - x, s.z - z) < r);
    const nearLink = (x, z, m) => WO.LINKS.some(l => x > l.x0 - m && x < l.x1 + m && z > l.z0 - m && z < l.z1 + m);
    const free = (x, z, r) => !nearSt(x, z, r + 4) && !nearLink(x, z, r + 6) && WO.inside(x, z, r + 1) && ![[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r]].some(([a, b]) => C.solidAt(x + a, 1, z + b));
    const L = { lamp: [], bench: [], bush: [], trash: [], bld: {}, tower: [] };
    WO.WORLDS.forEach((w, wi) => {
      const r = U.seeded(4200 + wi * 71), area = (w.x1 - w.x0) * (w.z1 - w.z0), n = Math.round(area / 260);
      for (let i = 0; i < n; i++) {
        const x = U.lerp(w.x0 + 4, w.x1 - 4, r()), z = U.lerp(w.z0 + 4, w.z1 - 4, r()), k = i % 5, rot = Math.floor(r() * 4) * Math.PI / 2;
        if (k === 0) { if (free(x, z, 0.6)) { L.lamp.push({ x, z, rot, s: 4.6, y: 0.12 }); solid(x, z, 0.4, 0.4, 4.4); } }
        else if (k === 1) { if (free(x, z, 1.3)) { L.bench.push({ x, z, rot, s: 2.1, y: 0.12 }); solid(x, z, rot % Math.PI ? 0.6 : 2.1, rot % Math.PI ? 2.1 : 0.6, 0.5); } }
        else if (k === 4) { if (free(x, z, 0.5)) { L.trash.push({ x, z, rot, s: 1, y: 0.12 }); solid(x, z, 0.5, 0.5, 1); } }
        else if (free(x, z, 0.7)) L.bush.push({ x, z, rot: r() * 6, s: 1 + r() * 0.6, y: 0.12 });
      }
      if (w.id === 'wellen') {
        const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < 40 && Object.values(L.bld).reduce((a, b) => a + b.length, 0) < 12; i++) {
          const side = i % 4, t = r(), x = side < 2 ? U.lerp(w.x0 + 10, w.x1 - 10, t) : side === 2 ? w.x0 + 7 : w.x1 - 7, z = side < 2 ? (side ? w.z1 - 7 : w.z0 + 7) : U.lerp(w.z0 + 10, w.z1 - 10, t);
          if (!free(x, z, 5)) continue;
          const nm = 'kk_building_' + names[Math.floor(r() * 8)], rot = side === 0 ? 0 : side === 1 ? Math.PI : side === 2 ? Math.PI / 2 : -Math.PI / 2;
          (L.bld[nm] = L.bld[nm] || []).push({ x, z, rot, s: 8 + r() * 5, y: 0.12 }); solid(x, z, 9, 9, 12);
        }
      }
      if (w.id === 'berg') for (let i = 0; i < 20 && !L.tower.length; i++) { const x = U.lerp(w.x0 + 12, w.x1 - 12, r()), z = U.lerp(w.z0 + 12, w.z1 - 12, r()); if (free(x, z, 4)) { L.tower.push({ x, z, rot: 0, s: 14, y: 0.12 }); solid(x, z, 6, 6, 14); } }
    });
    W.instances(g, 'kk_streetlight', L.lamp, { byHeight: true }); W.instances(g, 'kk_bench', L.bench); W.instances(g, 'kk_bush', L.bush, { byHeight: true });
    W.instances(g, 'kk_trash_a', L.trash, { byHeight: true }); W.instances(g, 'kk_watertower', L.tower, { byHeight: true });
    for (const nm in L.bld) W.instances(g, nm, L.bld[nm], { byHeight: true });
    V.kitW = L;
  }

  // ------------------------------------------------------------------ Aufbau
  FX.build = function (ctx) {
    FX.stop(); C = ctx; T = root.THREE; const S = C.S; if (!S || S.mode !== 'free' || S.net || !W.models || !W.models.sedan) return;
    const q = W.quality, g = S.group;
    V = { S, tvs: [tv(0), tv(2), tv(4)], screens: [], people: [], cars: [], neon: [], spots: [], time: 0, tvT: 0, fwT: 2, ambT: 4, hype: 0 };
    const solid = (x, z, w, d, h) => C.addBox(x - w / 2, x + w / 2, z - d / 2, z + d / 2, h);
    const prop = (name, s, x, z, ry, o) => { const m = W.prop(name, s, o); if (!m) return null; m.position.set(x, (o && o.y) || 0.12, z); m.rotation.y = ry || 0; g.add(m); return m; };
    const tower = (name, wdt, x, z, ry) => { const m = prop(name, wdt, x, z, ry); if (m) solid(x, z, wdt, wdt, m.userData.size.y); return m; };
    const neonMat = c => { const m = new T.MeshBasicMaterial({ color: c, toneMapped: false }); V.neon.push({ m, c: new T.Color(c), ph: V.neon.length }); return m; };
    const road = (x0, x1, z0, z1, col, line) => { const r = W.box(x1 - x0, 0.03, z1 - z0, W.mat(col, { r: 0.85 }), (x0 + x1) / 2, 0.135, (z0 + z1) / 2, g, false); r.receiveShadow = true;
      const lx = x1 - x0 > z1 - z0, n = Math.floor((lx ? x1 - x0 : z1 - z0) / 6); const lm = line ? neonMat(line) : W.mat(0xffffff, { r: 0.6 });
      for (let i = 0; i < n; i++) W.box(lx ? 2.6 : 0.22, 0.02, lx ? 0.22 : 2.6, lm, lx ? x0 + 3 + i * 6 : (x0 + x1) / 2, 0.16, lx ? (z0 + z1) / 2 : z0 + 3 + i * 6, g, false); };

    kitCity(S, g, solid);
    // --- 🚢 Medienhafen: Skyline, Straße mit Verkehr, Lieferwagen, Kisten, Frachtschiffe, Video-Wand
    [[134, -40, 'skyscraper_b'], [176.5, -40, 'skyscraper_a'], [208, -40, 'skyscraper_c'], [209, -24, 'skyscraper_a'], [209, -12, 'skyscraper_c'], [209, 12, 'skyscraper_b'], [209, 24, 'skyscraper_a']].forEach(([x, z, n], i) => tower(n, 8, x, z, i % 2 ? Math.PI : 0));
    [[135, 38, 'building_a'], [149, 38, 'building_e'], [163, 38, 'building_b'], [177, 38, 'building_d']].forEach(([x, z, n]) => tower(n, 9, x, z, Math.PI));
    road(128, 206, -4.5, 4.5, 0x3a3d44);
    [[184, -13.5, 0.2], [199.5, -13.5, -0.1]].forEach(([x, z, r]) => { prop('delivery_van', 4.6, x, z, r); solid(x, z, 2.4, 4.6, 2.4); });
    const crates = [], barrels = []; for (let i = 0; i < 12; i++) crates.push({ x: 140 + i * 4.2, z: 31.5 + (i % 2) * 1.4, rot: i * 0.7, s: 1.6 }); for (let i = 0; i < 6; i++) barrels.push({ x: 190 + i * 2.2, z: 6.5 + (i % 2) * 1.6, rot: i, s: 1.4 });
    W.instances(g, 'crate', crates); W.instances(g, 'barrels', barrels);
    screen(0, 14, 158, 20, -15.6, 0, false);
    screen(1, 9, 192, 13, -19.6, 0, false);
    const hafenP = loopPath([[94, -2.2], [200, -2.2], [203, 0], [200, 2.2], [94, 2.2], [91, 0]]);
    for (let i = 0; i < [2, 3, 4][q]; i++) vehicle(CARS[i % CARS.length], 4.2, hafenP, i * hafenP.L / [2, 3, 4][q], 8 + i);
    const ship1 = loopPath([[234, -70], [234, 70], [244, 78], [254, 70], [254, -70], [244, -78]]), ship2 = loopPath([[-220, -116], [-40, -116], [-30, -122], [-40, -128], [-220, -128], [-230, -122]]);
    [[ship1, 0], [ship2, 120]].forEach(([P, s]) => { const c = vehicle('cargo_ship', 22, P, s, 3, 0); if (c) { c.ship = true; c.g.traverse(o => { if (o.isMesh) o.castShadow = false; }); } });

    // --- ✳️ RicoReWi-Universum: Neon-Skyline, Neon-Straße, Video-Wände, Scheinwerfer
    const NEON = [0xff3da8, 0x3dd6ff, 0xffd45a, 0xa46bff];
    [-208, -196, -184, -172, -160, -148, -136].forEach((x, i) => [-40, 40].forEach((z, j) => {
      const n = ['skyscraper_a', 'skyscraper_b', 'skyscraper_c'][(i + j) % 3], m = tower(n, 8, x, z, j ? Math.PI : 0); if (!m) return;
      const h = m.userData.size.y, mat = neonMat(NEON[(i + j) % 4]), fz = z + (j ? -4.05 : 4.05);
      W.box(0.25, h * 0.92, 0.12, mat, x - 3.8, h * 0.46, fz, g, false); W.box(0.25, h * 0.92, 0.12, mat, x + 3.8, h * 0.46, fz, g, false); W.box(7.8, 0.3, 0.12, mat, x, h * 0.95, fz, g, false);
    }));
    road(-206, -128, -4.5, 4.5, 0x25222f, 0xff3da8);
    screen(1, 16, -185, 15, -18.6, 0, false);
    screen(2, 10, -150, 14, -26.6, 0, false);
    screen(0, 9, -128.5, 10, 12, -Math.PI / 2, true);
    const ricoP = loopPath([[-92, 2.2], [-194, 2.2], [-197, 0], [-194, -2.2], [-92, -2.2], [-89, 0]]);
    for (let i = 0; i < [2, 3, 3][q]; i++) vehicle(['taxi', 'sedan', 'van'][i], 4.2, ricoP, i * ricoP.L / 3, 7 + i);
    [-200, -192, -178, -170].forEach((x, i) => spot(x, 0.5, -12, NEON[i], 18, i));

    // --- 🎪 Festival-Insel: Palmen, Zelt-Camp mit Lagerfeuer, Seiten-Bildschirme, Bühnen-Scheinwerfer, Publikum
    const palms = []; for (let z = 142; z <= 208; z += 11) [-58, 58].forEach(x => palms.push({ x: x + (z % 2) * 0.6, z, rot: z, s: 7 + (z % 3) }));
    for (let x = -54; x <= 54; x += 12) if (Math.abs(x) > 18) palms.push({ x, z: 211, rot: x, s: 7.5 });
    [[-9, 141], [9, 141]].forEach(([x, z]) => palms.push({ x, z, rot: x, s: 7 }));
    W.instances(g, 'tree_palm', palms, { byHeight: true });
    [[-52, 201, 0.4], [-45, 207, -0.3], [-56, 208, 1.2], [-40, 202, 2.2]].forEach(([x, z, r]) => { prop('tent', 3.6, x, z, r); solid(x, z, 3, 3, 2); });
    prop('campfire', 1.6, -48, 204, 0); V.fire = W.glow(0xff9a30, 3.2, g, -48, 0.9, 204);
    [-21.5, 21.5].forEach((x, i) => screen(i ? 2 : 0, 9, x, 8.5, 197, Math.PI, true));
    [-12, -4, 4, 12].forEach((x, i) => spot(x, 11.6, 190.5, [0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a][i], 13, i));
    const bushes = []; for (let i = 0; i < 26; i++) { const x = U.rand(-56, 56), z = U.rand(140, 210); if (Math.abs(x) < 20 && z > 168) continue; if (C.solidAt(x, 0.6, z)) continue; bushes.push({ x, z, rot: i, s: 1.6 + (i % 3) * 0.5 }); }
    W.instances(g, 'bush', bushes, { shadow: false });

    // --- 📡 Funkturm-Berg: Satellitenschüsseln, Wald, Straße zum Turm
    [[62, -190], [74, -190], [86, -190], [68, -202], [80, -202]].forEach(([x, z], i) => { const m = prop('satellite_dish', 8, x, z, -0.6 + i * 0.25); if (m) { solid(x, z, 5, 5, 5); V.dishes = (V.dishes || []).concat(m); } });
    road(42.5, 47.5, -160, -133, 0x4a4d55);
    const bergP = loopPath([[47, -92], [47, -156], [45, -159], [43, -156], [43, -92], [45, -89]]);
    vehicle('van', 4, bergP, 0, 7); if (q) vehicle('police_car', 4.2, bergP, bergP.L / 2, 8);
    const trees = []; for (let i = 0; i < 40; i++) { const x = U.rand(-8, 98), z = U.rand(-210, -132); if (Math.abs(x - 45) < 7 || C.solidAt(x, 0.6, z) || C.solidAt(x, 4, z)) continue; trees.push({ x, z, rot: i, s: 4 + (i % 4) * 1.4 }); }
    W.instances(g, 'tree-high-round', trees.filter((t, i) => i % 2), { byHeight: true }); W.instances(g, 'tree', trees.filter((t, i) => !(i % 2)), { byHeight: true });
    prop('campfire', 1.4, 66, -161, 0); W.glow(0xff9a30, 2.6, g, 66, 0.8, -161);
    screen(2, 8, 45, 9, -165.5, 0, true);

    // --- 📻 Wellenburg (Gisela-Roadtrip): Hauptstraße, Skyline, Verkehr, Camping, Video-Wände
    road(302, 428, -4.5, 4.5, 0x3a3d44); road(360.5, 369.5, -66, 66, 0x3a3d44);
    [312, 326, 340, 354, 378, 392, 406, 420].forEach((x, i) => { tower(['skyscraper_a', 'building_b', 'skyscraper_c', 'building_d', 'skyscraper_b', 'building_a', 'skyscraper_a', 'building_e'][i], 9, x, -62, 0); if (x > 360) tower(['building_c', 'skyscraper_b', 'building_a', 'skyscraper_c'][i % 4], 9, x, 62, Math.PI); });
    [-22, 12].forEach(z => tower('skyscraper_b', 8, 424, z, -Math.PI / 2));
    [[328, 36, 0.3], [336, 42, -0.5], [344, 35, 1.1]].forEach(([x, z, r]) => { prop('tent', 3.4, x, z, r); solid(x, z, 2.8, 2.8, 2); });
    prop('campfire', 1.5, 336, 34.5, 0); W.glow(0xff9a30, 2.8, g, 336, 0.8, 34.5);
    prop('van', 4.4, 352, 42, Math.PI / 2); solid(352, 42, 4.4, 2.2, 2);
    screen(0, 14, 395, 15, -29.6, 0, false); screen(1, 8, 374, 10, 10, Math.PI, true); screen(2, 7, 304, 9, 14, Math.PI / 2, true);
    const wbP = loopPath([[306, -2.2], [420, -2.2], [423, 0], [420, 2.2], [306, 2.2], [303, 0]]), wbQ = loopPath([[367.2, -62], [367.2, 62], [365, 65], [362.8, 62], [362.8, -62], [365, -65]]);
    for (let i = 0; i < [2, 3, 4][q]; i++) vehicle(CARS[(i + 2) % CARS.length], 4.2, i % 2 ? wbQ : wbP, i * 40, 7 + i);
    
    [[52, 52, -Math.PI * 0.75], [-52, 52, Math.PI * 0.75], [52, -52, -Math.PI * 0.25], [-52, -52, Math.PI * 0.25], [83, 9, -Math.PI / 2], [-83, -9, Math.PI / 2]].forEach(([x, z, r], i) => { if (!C.solidAt(x, 9, z) && !C.solidAt(x, 0.6, z)) screen(i % 3, 7, x, 9, z, r, true); });

    // --- Menschen: Publikum vor Bühne und Arena, Spaziergänger in Stadt und Welten, Leute am Lagerfeuer
    const k = [0.4, 0.7, 1][q], N = n => Math.max(1, Math.round(n * k)), list = []; let seed = 7100;
    const P = (x, z, beh, o) => list.push(Object.assign({ x, z, beh, seed: seed++ }, o || {}));
    for (let i = 0, n = N(14); i < n; i++) { const x = -10 + (i % 6) * 4 + U.rand(-0.8, 0.8), z = 172 + Math.floor(i / 6) * 3.4 + U.rand(-0.6, 0.6); P(x, Math.min(z, 181), 'cheer', { face: 0 }); }
    for (let i = 0, n = N(8); i < n; i++) { const x = -197 + (i % 4) * 7 + U.rand(-1, 1), z = -10 + Math.floor(i / 4) * 3; P(x, z, 'cheer', { face: Math.PI }); }
    [[0, 160, 5, 30], [-170, 8, 4, 26], [165, 4, 4, 30], [40, -150, 3, 24], [380, 12, 5, 34]].forEach(([x, z, n, r]) => { for (let i = 0; i < N(n); i++) { const a = i / n * 6.28, px = x + Math.cos(a) * r * 0.5, pz = z + Math.sin(a) * r * 0.5; if (freeAt(px, pz)) P(px, pz, 'walk', { r }); } });
    [[64, -159], [68, -159.5]].forEach(([x, z]) => P(x, z, 'sit', { face: Math.atan2(66 - x, -161 - z) }));
    if (q) P(-50, 205.8, 'sit', { face: Math.atan2(2, -1.8) });
    for (let i = 0, n = N(12); i < n; i++) { const r = C.ROADS[i % 3], s = U.rand(-80, 80), side = i % 2 ? 7.2 : -7.2, x = i % 4 < 2 ? r + side : s, z = i % 4 < 2 ? s : r + side; if (freeAt(x, z)) P(x, z, 'walk', { r: 22 }); }
    kitWorlds(S, g, solid);
    spawnPeople(list);
  };
  // Scheinwerfer: Lichtkegel, der hin und her schwenkt
  function spot(x, y, z, col, len, i) {
    const g = new T.Group(), geo = new T.ConeGeometry(len * 0.22, len, 18, 1, true); geo.translate(0, -len / 2, 0);
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    g.add(m); W.glow(col, 1.6, g, 0, 0, 0); g.position.set(x, y, z); V.S.group.add(g); V.spots.push({ g, i, up: y < 2 });
  }

  // ------------------------------------------------------------------ Laufzeit
  FX.update = function (dt) {
    if (!V) return; const S = V.S, pl = S.pl; if (!pl) return;
    V.time += dt;
    // Bildschirme: ~12 Bilder pro Sekunde, nur Kanäle in Sichtweite
    V.tvT -= dt; if (V.tvT <= 0) { V.tvT = 0.08; const used = {}; V.screens.forEach(s => { if (Math.hypot(s.x - pl.x, s.z - pl.z) < 110) used[s.ch] = 1; }); V.tvs.forEach((t, i) => { t.t += 0.08; if (used[i]) drawTv(t); }); }
    // Neon pulsiert, Scheinwerfer schwenken
    const night = AMC.Atmos && AMC.Atmos.night();
    V.neon.forEach(n => { const k = 0.65 + 0.35 * Math.sin(V.time * 2.2 + n.ph * 0.9); n.m.color.copy(n.c).multiplyScalar(k * (night ? 1.3 : 1)); });
    V.spots.forEach(s => { const a = V.time * 0.7 + s.i * 1.3; if (s.up) { s.g.rotation.set(Math.PI + Math.sin(a) * 0.45, 0, Math.cos(a * 0.8) * 0.4); } else { s.g.rotation.set(Math.sin(a) * 0.5 - 0.35, 0, Math.cos(a * 1.1) * 0.45); } });
    if (V.fire) V.fire.scale.setScalar(3 + Math.sin(V.time * 13) * 0.3 + Math.sin(V.time * 7) * 0.2);
    (V.dishes || []).forEach((d, i) => { d.rotation.y += dt * 0.08 * (i % 2 ? 1 : -1); });
    updCars(dt, pl); updPeople(dt, pl);
    // Festival: Feuerwerk (abends öfter), Konfetti und Jubel, wenn man vor der Bühne steht
    const wName = AMC.Worlds ? AMC.Worlds.name(pl.x, pl.z) : null, atStage = Math.hypot(pl.x, pl.z - 184) < 30, atArena = Math.hypot(pl.x + 185, pl.z + 12) < 26;
    V.hype = Math.max(0, V.hype - dt);
    if (wName && /Festival/.test(wName)) {
      V.fwT -= dt; if (V.fwT <= 0) { V.fwT = night ? 1.4 + Math.random() * 1.2 : 4 + Math.random() * 3; const c = [0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a, 0xffffff][Math.floor(Math.random() * 5)]; W.particles.burst(U.rand(-30, 30), U.rand(32, 46), U.rand(200, 215), c, 40, { speed: 9, grav: 3, life: 1.6, size: 0.9, up: 0 }); if (Math.hypot(pl.x, pl.z - 200) < 60) AMC.Audio.sfx('spark'); }
    }
    if (atStage && Math.random() < dt * 1.5) W.particles.burst(U.rand(-12, 12), 12, U.rand(188, 194), [0xff3da8, 0xffd23f, 0x3dd6ff][Math.floor(Math.random() * 3)], 8, { speed: 3, grav: 2, life: 2.2, size: 0.25, up: 0 });
    V.ambT -= dt; if (V.ambT <= 0) { V.ambT = 7 + Math.random() * 6; if (atStage || atArena) { AMC.Audio.sfx('cheer'); V.hype = 2.5; } else if (wName && /hafen/.test(wName) && Math.random() < 0.5) AMC.Audio.sfx('horn'); }
  };
  FX.cheer = function () { if (V) { V.hype = 4; V.people.forEach(p => { if (p.beh === 'cheer') p.t = 0; }); } };
  const CAR_NAME = { sedan: 'Limousine', taxi: 'Taxi', van: 'Kleinbus', police_car: 'Polizeiauto', delivery_van: 'Lieferwagen' };
  /** Fahrzeug in der Nähe, das gerade (fast) steht – zum Leihen */
  FX.nearCar = (x, z, r) => { if (!V) return null; const c = V.cars.find(c => !c.ship && c.v < 3 && Math.hypot(c.g.position.x - x, c.g.position.z - z) < r); if (c) c.name = CAR_NAME[c.model] || 'Auto'; return c || null; };
  /** Nächste Person (zum Ansprechen) und Animation von außen */
  FX.nearPerson = (x, z, r) => { if (!V) return null; let best = null, bd = r; for (const p of V.people) { const d = Math.hypot(p.x - x, p.z - z); if (d < bd && p.wrap.visible) { bd = d; best = p; } } return best; };
  FX.anim = (p, n) => { if (p && p.fig) { p.cur = null; anim(p, n); } };
  FX.take = c => { if (!V) return false; const i = V.cars.indexOf(c); if (i < 0) return false; V.cars.splice(i, 1); return true; };
  FX.count = () => V ? { people: V.people.length, cars: V.cars.length, screens: V.screens.length, kit: V.kit ? Object.values(V.kit).reduce((a, l) => a + l.length, 0) : 0 } : { people: 0, cars: 0, screens: 0 };
  FX.stop = function () {
    if (!V) return;
    V.people.forEach(p => { if (p.wrap.parent) p.wrap.parent.remove(p.wrap); p.fig.dispose(); });
    V.tvs.forEach(t => t.tex.dispose());
    V = null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
