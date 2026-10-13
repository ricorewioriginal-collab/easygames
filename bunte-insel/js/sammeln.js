'use strict';
/* Bunte Insel – Sammeln & Sammelbuch 🎣🥅⛏️📖: Angeln (See und Meer), Käfer fangen (Kescher im Gras), Buddeln (glitzernde Stellen am Strand) und ein Sammelbuch
   mit 36 Wesen/Funden (Bilder statt Text, Namen werden vorgelesen). Alles eigene Namen und Figuren – inspiriert von beliebten Sozial-/Sammelspielen, nichts kopiert.
   Verbindung zu den vorhandenen Systemen: Sticker im Sammelalbum (kids), Tagesaufgaben (meta), Aufgaben-Log (tasklog, K.log), Tierbuch (farm), Spaß-Menü,
   Aktionstaste (placeNear), Sterne. Spielstand: save.sammel. Sparsam: wenige Instanzen (8 Käfer, 4 Buddelstellen), nur nahe am Spieler, ein Fenster. */
BI.SAMMEL = {
  /* [id, Bild, Name, Seltenheit 0–3, Eigenschaften, Farbe/Farbton] */
  fish: [
    ['blubb', '🐟', 'Blubberle', 0, 'lake'], ['goldi', '🐠', 'Gold-Schnute', 0, 'lake'], ['kugel', '🐡', 'Kugel-Bauch', 1, 'lake'], ['freddy', '🐸', 'Frosch-Freddy', 1, 'lake'],
    ['schildi', '🐢', 'Wasserschildi', 2, 'lake'], ['karpf', '🐲', 'Drachen-Karpfen', 3, 'lake night'],
    ['krabbe', '🦀', 'Krabbel-Karl', 0, 'sea'], ['garnele', '🦐', 'Garnelchen', 0, 'sea'], ['tim', '🦑', 'Tintenfisch Tim', 1, 'sea'], ['okto', '🐙', 'Oktopina', 1, 'sea'],
    ['delfi', '🐬', 'Delfi', 2, 'sea'], ['mondwal', '🐋', 'Mondwal', 3, 'sea night'],
    ['zauber', '🧜', 'Zauber-Forelle', 2, 'lake sea region:maerchen'], ['dampfhai', '🦈', 'Dampfer-Hai Hugo', 2, 'sea region:dampf']],
  bug: [
    ['punkti', '🐞', 'Punkti', 0, '', 0xe53b3b], ['flatter', '🦋', 'Flatterlinde', 0, 'fly', 0xffb347], ['brummi', '🐝', 'Brummi', 0, 'fly', 0xffd23f], ['krabbel', '🐜', 'Krabbel', 0, '', 0x6a4a2a],
    ['huepf', '🦗', 'Hüpf', 1, '', 0x6bd36b], ['schleimi', '🐌', 'Schleimi', 0, '', 0xc8a070], ['mampfi', '🐛', 'Mampfi', 0, '', 0x7fd86b], ['kuno', '🪲', 'Käfer-Kuno', 1, '', 0x3a3d8a],
    ['himmel', '🦋', 'Himmelsfalter', 2, 'fly', 0x4da3ff, 200], ['funkel', '✨', 'Funkel', 2, 'fly night', 0xfff3a0], ['gold', '🪲', 'Goldkäfer', 2, '', 0xffc21f, 40], ['regen', '🦋', 'Regenbogen-Falter', 3, 'fly rainbow', 0xff6ad5, 300],
    ['feuer', '🔥', 'Feuerfalter', 2, 'fly region:drachen', 0xff6a1f], ['schnee', '❄️', 'Schneefalter', 2, 'fly region:maerchen', 0xdff6ff]],
  dig: [
    ['muschel', '🐚', 'Muschel', 0, ''], ['sternli', '🌟', 'Sternli', 0, ''], ['muenze', '🪙', 'Alte Münze', 0, ''], ['vase', '⚱️', 'Alter Krug', 1, ''],
    ['perle', '🦪', 'Perlmuschel', 1, ''], ['koralle', '🪸', 'Korallenzweig', 1, ''], ['knochen', '🦴', 'Dino-Knochen', 1, ''], ['zahn', '🦷', 'Dino-Zahn', 2, ''],
    ['kiste', '🧰', 'Mini-Schatzkiste', 2, ''], ['post', '🍾', 'Flaschenpost', 2, ''], ['kristall', '💎', 'Kristall', 2, ''], ['schluessel', '🗝️', 'Goldener Schlüssel', 3, ''],
    ['drachenei', '🥚', 'Drachenei-Splitter', 2, 'region:drachen'], ['sternstaub', '✨', 'Sternenstaub', 2, 'region:maerchen']],
  junk: [['🥾', 'Einen alten Stiefel! Hihi.'], ['🥫', 'Eine rostige Dose. Weg damit!'], ['🌿', 'Nur Seegras …']],
  groups: [['fish', '🐟', 'Fische', 'Fisch'], ['bug', '🐞', 'Käfer', 'Käfer'], ['dig', '🐚', 'Funde', 'Fund']]
};
BI.createSammeln = function (G) {
  const { scene, W, A, fx, P, say, save, persist, addStars } = G, TAU = Math.PI * 2, D = BI.SAMMEL, $ = id => document.getElementById(id), K = { open: false, tab: 0 };
  const RW = [60, 28, 10, 2], RC = ['#8a94a6', '#3f9bff', '#b36bff', '#ffb300'], RN = ['Häufig', 'Selten', 'Episch', 'Legendär'], RS = [1, 1, 2, 4], KEY = { fish: 'angler', bug: 'kaefer', dig: 'graeber' };
  const S = () => { const s = save.sammel || (save.sammel = {}); for (const k of ['fish', 'bug', 'dig']) s[k] = s[k] || {}; s.best = s.best || {}; s.ms = s.ms || {}; s.fd = s.fd || { d: '', got: 0 }; return s; };
  const total = () => D.fish.length + D.bug.length + D.dig.length, found = () => { const s = S(); return Object.keys(s.fish).length + Object.keys(s.bug).length + Object.keys(s.dig).length; };
  const night = () => (G.night ? G.night() : 0) > .5, onFoot = () => !P.veh && P.y < 1.5;
  /* Tagesglück: jeden Tag ist ein Wesen/Fund extra begehrt (+2 ⭐ beim ersten Fang des Tages) */
  const dayKey = () => { const n = new Date(); return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate(); };
  K.featured = () => { let a = 7; for (const c of dayKey()) a = (a * 31 + c.charCodeAt(0)) >>> 0; const all = [...D.fish.map(q => ['fish', q]), ...D.bug.map(q => ['bug', q]), ...D.dig.map(q => ['dig', q])]; const e = all[a % all.length]; return { g: e[0], sp: e[1] }; };
  /* ---------- Fang einbuchen: Sterne, Sticker, Tagesaufgabe, Meilensteine, große Anzeige ---------- */
  const pop = (() => { const e = document.createElement('div'); e.id = 'catchPop'; e.setAttribute('aria-live', 'polite'); e.hidden = true; e.style.cssText = 'position:fixed;left:50%;top:34%;transform:translate(-50%,-50%);z-index:55;background:#fff;border-radius:28px;padding:14px 26px;text-align:center;box-shadow:0 8px 34px rgba(0,0,0,.35);pointer-events:none;font-family:inherit;border:6px solid #ffd23f'; document.body.appendChild(e); return e; })();
  let popT = 0; const showPop = (sp, g, isNew, extra) => { pop.style.borderColor = RC[sp[3]]; pop.innerHTML = '<div style="font-size:84px;line-height:1.1' + (sp[6] && g === 'bug' ? ';filter:hue-rotate(' + sp[6] + 'deg)' : '') + '">' + sp[1] + '</div><div style="font-size:26px;font-weight:800">' + sp[2] + '</div><div style="font-size:17px;font-weight:700;color:' + RC[sp[3]] + '">' + RN[sp[3]] + (isNew ? ' · ✨ NEU!' : '') + (extra ? ' · ' + extra : '') + '</div>'; pop.hidden = false; popT = 3.2; };
  function collect(g, sp, extra) {
    const s = S(), set = s[g], isNew = !set[sp[0]]; set[sp[0]] = (set[sp[0]] | 0) + 1; let bonus = 0, fd = s.fd, F = K.featured(), key = dayKey();
    if (isNew) { bonus += RS[sp[3]]; if (G.earn) G.earn(KEY[g]); }
    if (F.g === g && F.sp[0] === sp[0] && fd.d !== key) { fd.d = key; bonus += 2; extra = (extra ? extra + ' · ' : '') + '🌟 Tagesglück +2'; }
    { const e = s.ev && s.ev.d === key ? s.ev : (s.ev = { d: key, n: 0 }); if (EVT.g === g && e.n < 5) { e.n++; bonus += 1; extra = (extra ? extra + ' · ' : '') + EVT.icon + ' Fest +1'; if (G.earn) G.earn('ereignis'); } }
    for (const [gg, id, nm] of [['fish', 'deco_aqua', 'ein Aquarium 🐟'], ['bug', 'deco_vitrine', 'eine Vitrine 🦋'], ['dig', 'deco_fund', 'einen Fundtisch 🐚']]) if (gg === g && Object.keys(set).length >= 3 && !save.owned.includes(id)) { save.owned.push(id); setTimeout(() => say('🎁 Neu fürs Zimmer: ' + nm + '! (Zimmer einrichten → Deko)', 4200), 1600); }
    if (bonus) addStars(bonus); if (G.room) G.room(); if (G.share) G.share(); if (G.note) G.note(g === 'fish' ? 'fish' : g === 'bug' ? 'bug' : 'dig');
    A.pop && A.pop(); if (sp[3] >= 2) A.fanfare && A.fanfare(); else if (isNew) A.star && A.star();
    showPop(sp, g, isNew, extra); A.speak && A.speak((isNew ? 'Neu! ' : '') + sp[2]);
    /* Meilensteine: 5/10/20/30 Einträge, ganze Kapitel */
    const n = found(); for (const [c, st] of [[5, 3], [10, 5], [20, 8], [30, 12], [total(), 20]]) if (n >= c && !s.ms['n' + c]) { s.ms['n' + c] = 1; addStars(st); setTimeout(() => say('📖 Sammelbuch: ' + c + ' Einträge! +' + st + ' ⭐', 3600), 1200); }
    if (Object.keys(set).length === D[g].length && !s.ms['c' + g]) { s.ms['c' + g] = 1; addStars(10); if (G.earn) G.earn('sammler'); setTimeout(() => say('🏆 Kapitel „' + D.groups.find(q => q[0] === g)[2] + '“ komplett! +10 ⭐', 4200), 1200); }
    persist(); if (K.open) render(); return isNew;
  }
  const here = () => BI.worldAt ? BI.worldAt(P.x, P.z) : 'insel', okReg = q => { const m = /region:(\w+)/.exec(q[4]); return !m || m[1] === here(); };
  /* ---------- 🎪 Tages-Ereignis: jeden Tag ein anderes Fest ---------- */
  const EV = [['fish', '🎪', 'Angelfest', 'Heute beißen die Fische besser – seltene sind dreimal so oft da, und die ersten 5 Fänge geben extra ⭐!'], ['bug', '🦋', 'Käfertag', 'Heute wimmelt es von Käfern und Faltern – seltene sind häufiger, die ersten 5 Fänge geben extra ⭐!'], ['dig', '🏖️', 'Buddel-Fest', 'Heute glitzert der Strand an mehr Stellen – seltene Funde sind häufiger, die ersten 5 geben extra ⭐!'], ['rainbow', '🌈', 'Regenbogen-Tag', 'Heute zeigt sich immer wieder ein Regenbogen mit bunten Sternen!']];
  K.event = () => { let a = 11; for (const c of dayKey()) a = (a * 17 + c.charCodeAt(0)) >>> 0; const e = EV[a % EV.length]; return { g: e[0], icon: e[1], name: e[2], text: e[3] }; };
  const EVT = K.event(), evBoost = g => EVT.g === g;
  const weighted = (list, g) => { const w = q => RW[q[3]] * (g && evBoost(g) && q[3] >= 1 ? 3 : 1); let t = 0; for (const q of list) t += w(q); let r = Math.random() * t; for (const q of list) { r -= w(q); if (r <= 0) return q; } return list[0]; };
  const isle = () => {
    let best = null;
    for (const q of W.isles || []) { if (!q || !Number.isFinite(q.R)) continue; const d = Math.hypot(P.x - q.x, P.z - q.z); if (d < q.R + 16 && (!best || d < best.d)) best = { cx: q.x, cz: q.z, R: q.R, d }; }
    const d = Math.hypot(P.x, P.z); if (d < 219 && (!best || d < best.d)) best = { cx: 0, cz: 0, R: 203, d };
    return best;
  };
  const atInterior = (x, z) => W.interiors && W.interiors.some(q => x > q.x0 - 1 && x < q.x1 + 1 && z > q.z0 - 1 && z < q.z1 + 1);
  /* ---------- 🎣 Angeln ---------- */
  const Fi = { st: 'idle', t: 0, spot: null, lake: false, sp: null }, bob = new THREE.Group(), line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff }));
  { const b = new BI.Batch(); b.sph(0, 0, 0, .22, 0xff3b3b, 1, 1, 1, 1); b.sph(0, .2, 0, .14, 0xffffff, 1); bob.add(b.mesh(BI.mat())); bob.visible = line.visible = false; line.frustumCulled = false; scene.add(bob, line); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(.4, .55, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
  function waterSpot() {
    if (!onFoot()) return null; const lk = W.lake;
    if (lk) { const d = Math.hypot(P.x - lk.x, P.z - lk.z); if (d < lk.r + 5) { const k = d > 4.6 ? 4.5 / d : 1; return { x: P.x + (lk.x - P.x) * k, z: P.z + (lk.z - P.z) * k, y: .07, lake: true }; } }
    const h = isle();
    if (h && h.d > h.R - 5 && h.d < h.R + 10 && W.seaAt && !W.seaAt(P.x, P.z)) {
      const dx = (P.x - h.cx) / Math.max(.1, h.d), dz = (P.z - h.cz) / Math.max(.1, h.d);
      for (let edge = h.R + 10.8; edge <= h.R + 16; edge += 1.2) { const x = h.cx + dx * edge, z = h.cz + dz * edge; if (W.seaAt(x, z)) return { x, z, y: -.02, lake: false }; }
    }
    return null;
  }
  K.canFish = () => !!waterSpot();
  function cast() {
    if (Fi.st !== 'idle') return; const sp = waterSpot(); if (!sp) { say('🎣 Zum Angeln geh an den See oder an den Strand!', 2600); return; }
    Fi.st = 'wait'; Fi.t = 1.6 + Math.random() * 3.6; Fi.spot = sp; P.h = Math.atan2(sp.x - P.x, sp.z - P.z); A.splash && A.splash(); fx.burst(sp.x, sp.y + .2, sp.z, 8, [BI.C.water, BI.C.white], 2, .6, 28, 3); say('🎣 Ausgeworfen! Warte, bis es zappelt …', 2200);
  }
  const stopFish = msg => { Fi.st = 'idle'; bob.visible = line.visible = ring.visible = false; if (msg) say(msg, 2000); };
  function reel() {
    if (Fi.st === 'wait') { stopFish('🎣 Zu früh! Der Fisch ist weggeschwommen.'); return; }
    if (Fi.st !== 'bite') return; const lake = Fi.spot.lake, nt = night();
    if (Math.random() < .13) { const j = D.junk[(Math.random() * 3) | 0]; stopFish(); A.pop && A.pop(); say(j[0] + ' ' + j[1], 2800); return; }
    const sp = weighted(D.fish.filter(q => q[4].includes(lake ? 'lake' : 'sea') && okReg(q) && (!q[4].includes('night') || nt || Math.random() < .12)), 'fish'), cm = Math.round(8 + Math.random() * 30 + sp[3] * 24), s = S();
    if (cm > (s.best[sp[0]] | 0)) s.best[sp[0]] = cm; stopFish(); fx.burst(Fi.spot.x, 1.4, Fi.spot.z, 14, [BI.C.water, BI.C.white, BI.C.gold], 4, 1.2, 30, 5); collect('fish', sp, cm + ' cm');
  }
  /* ---------- 🥅 Käfer ---------- */
  const NB = 14, NBA = EVT.g === 'bug' ? 14 : 8, bugs = [], bgeo = (() => { const b = new BI.Batch(); b.sph(0, .1, 0, .15, 0xffffff, 1, 1, .7, 1.5); for (const sd of [-1, 1]) b.box(sd * .17, .2, 0, .3, .02, .22, 0xffffff, 0, 0, sd * .35); b.sph(0, .14, .2, .08, 0x333333, 0); return b.mesh(BI.mat()).geometry; })();
  const bmesh = new THREE.InstancedMesh(bgeo, BI.mat().clone(), NB), dm = new THREE.Object3D(), cl = new THREE.Color(); bmesh.frustumCulled = false; bmesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(bmesh);
  for (let i = 0; i < NB; i++) { bugs.push({ on: false, x: 0, z: 0, sp: null, ph: Math.random() * 6, vx: 0, vz: 0, t: 0 }); bmesh.setColorAt(i, cl.setHex(0xffffff)); }
  const grass = (x, z) => { if (atInterior(x, z) || W.onRoad(x, z) || !W.free(x, z, .5) || W.groundY(x, z) > .3) return false; const h = (() => { for (const q of [BI.CITY, BI.PARK, BI.RAINBOW, BI.PUPS, BI.DAMPF, BI.DRACHEN, BI.BAULAND, BI.FUSSBALL, BI.MAERCHEN, BI.SCHLUESSEL, BI.ZOTIK, BI.RADIO]) { if (q && q.R && Math.hypot(x - q.x, z - q.z) < q.R - 12) return 1; } return Math.hypot(x, z) < 150 ? 1 : 0; })(); if (!h) return false; const lk = W.lake; return !(lk && Math.hypot(x - lk.x, z - lk.z) < lk.r + 3); };
  function spawnBug(b) {
    const nt = night(); for (let t = 0; t < 10; t++) { const a = Math.random() * TAU, d = 7 + Math.random() * 20, x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d; if (!grass(x, z)) continue;
      b.sp = weighted(D.bug.filter(q => (!q[4].includes('night') || nt) && okReg(q)), 'bug'); b.x = x; b.z = z; b.on = true; b.t = 0; const g = Math.random() * TAU; b.vx = Math.sin(g); b.vz = Math.cos(g); return; } b.on = false;
  }
  const nearBug = r => { let best = null, bd = r; for (const b of bugs) if (b.on) { const d = Math.hypot(b.x - P.x, b.z - P.z); if (d < bd) { bd = d; best = b; } } return best; };
  function net() {
    if (!onFoot()) return; fx.burst(P.x + Math.sin(P.h) * 1.4, 1, P.z + Math.cos(P.h) * 1.4, 6, [BI.C.white], 3, .5, 26, 1); A.pop && A.pop();
    const b = nearBug(3.4); if (!b) { say('🥅 Hier ist gerade kein Käfer. Such im Gras und bei den Blumen! 🌼', 2600); return; }
    const sp = b.sp; if (Math.random() > [.92, .84, .72, .6][sp[3]]) { say('Huch, entwischt! 😅 Versuch es nochmal!', 1800); b.on = false; b.t = -3; return; }
    b.on = false; b.t = -6; fx.burst(b.x, .6, b.z, 12, [BI.C.gold, BI.C.white], 3, .9, 28, 3); collect('bug', sp);
  }
  /* ---------- ⛏️ Buddeln ---------- */
  const NS = 6, NSA = EVT.g === 'dig' ? 6 : 4, spots = [], smesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.3, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), NS); smesh.frustumCulled = false; smesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(smesh);
  for (let i = 0; i < NS; i++) { spots.push({ on: false, x: 0, z: 0, t: Math.random() * 8 }); smesh.setColorAt(i, cl.setHex(0xffe27a)); }
  const Dg = { st: false, t: 0, spot: null, e: 0 };
  function spawnSpot(s) {
    const h = isle(); if (!h) { s.on = false; return; } const lo = h.R === 168 ? 166 : h.R - 11, hi = h.R === 168 ? 176 : h.R - 3;
    for (let t = 0; t < 14; t++) { const a = Math.random() * TAU, d = lo + Math.random() * (hi - lo), x = h.cx + Math.sin(a) * d, z = h.cz + Math.cos(a) * d; if (Math.hypot(x - P.x, z - P.z) > 46 || Math.hypot(x - P.x, z - P.z) < 5 || !W.free(x, z, .6)) continue; if (spots.some(o => o !== s && o.on && Math.hypot(o.x - x, o.z - z) < 6)) continue; s.x = x; s.z = z; s.on = true; return; } s.on = false;
  }
  const nearSpot = r => { let best = null, bd = r; for (const s of spots) if (s.on) { const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd) { bd = d; best = s; } } return best; };
  K.canDig = () => !!nearSpot(40);
  function dig() {
    if (!onFoot() || Dg.st) return; const s = nearSpot(2.6); if (!s) { say(nearSpot(60) ? '⛏️ Geh zu einer glitzernden Stelle am Strand! ✨' : '⛏️ Am Strand glitzert es – dort kannst du buddeln!', 2800); return; }
    Dg.st = true; Dg.t = 1.2; Dg.spot = s; Dg.e = 0; P.h = Math.atan2(s.x - P.x, s.z - P.z); A.dig && A.dig(); say('⛏️ Du buddelst …', 1200);
  }
  function digDone() {
    const s = Dg.spot; Dg.st = false; s.on = false; s.t = 14 + Math.random() * 10; const sp = weighted(D.dig.filter(okReg), 'dig'); fx.burst(s.x, .8, s.z, 18, [BI.C.gold, BI.C.white, BI.C.pink], 4, 1.2, 30, 4); collect('dig', sp);
  }
  /* Fest-Girlande am See (nur am Angelfest) */
  if (EVT.g === 'fish' && W.lake) { const lk = W.lake, b = new BI.Batch(), cols = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff], a0 = -.9, a1 = .9; for (const a of [a0, a1]) { const px = lk.x + Math.sin(a + 1.2) * (lk.r + 2), pz = lk.z + Math.cos(a + 1.2) * (lk.r + 2); b.cyl(px, 0, pz, .1, .12, 4.2, 0x8a5a33, 6); }
    const ax = lk.x + Math.sin(a0 + 1.2) * (lk.r + 2), az = lk.z + Math.cos(a0 + 1.2) * (lk.r + 2), bx = lk.x + Math.sin(a1 + 1.2) * (lk.r + 2), bz = lk.z + Math.cos(a1 + 1.2) * (lk.r + 2);
    for (let i = 0; i < 14; i++) { const t = i / 13, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = 4 - Math.sin(t * Math.PI) * 1.1; b.cone(x, y - .5, z, .38, .6, cols[i % 5], 3); } const gm = b.mesh(BI.mat()); gm.frustumCulled = false; scene.add(gm); }
  let evT = 4, rbT = 40, evSaid = false;
  /* ---------- Aktionstaste, Spaß-Menü ---------- */
  K.busy = () => Fi.st !== 'idle' || Dg.st;
  K.near = function () {
    if (Dg.st) return { k: 'digbusy', label: ['⛏️', 'Buddeln …'] };
    if (Fi.st === 'bite') return { k: 'reel', label: ['❗', 'Einholen!'] }; if (Fi.st === 'wait') return { k: 'reel', label: ['🎣', 'Warten …'] };
    if (K.open || !onFoot()) return null;
    if (nearSpot(2.6)) return { k: 'dig', label: ['⛏️', 'Buddeln'] }; if (nearBug(3.2)) return { k: 'net', label: ['🥅', 'Käfer fangen'] }; if (waterSpot()) return { k: 'cast', label: ['🎣', 'Angeln'] }; return null;
  };
  K.act = n => { if (n.k === 'reel') reel(); else if (n.k === 'cast') cast(); else if (n.k === 'net') net(); else if (n.k === 'dig') dig(); };
  K.fun = k => { if (k === 'sammelbuch') K.show(); else if (k === 'angeln') { if (Fi.st === 'idle') cast(); else reel(); } else if (k === 'kescher') net(); else if (k === 'buddeln') dig(); };
  K.update = function (dt, t) {
    if (!evSaid) { evT -= dt; if (evT <= 0) { evSaid = true; const s = S(); if (s.evSeen !== dayKey()) { s.evSeen = dayKey(); persist(); say(EVT.icon + ' Heute: ' + EVT.name + '! ' + EVT.text, 6200); } } }
    if (EVT.g === 'rainbow' && G.rainbow && onFoot()) { rbT -= dt; if (rbT <= 0) { rbT = 150 + Math.random() * 60; G.rainbow(); } }
    if (popT > 0) { popT -= dt; if (popT <= 0) pop.hidden = true; }
    if (Fi.st !== 'idle') {
      if (P.veh || Math.hypot(P.x - Fi.spot.x, P.z - Fi.spot.z) > 10) stopFish('🎣 Die Angel ist eingeholt.');
      else { Fi.t -= dt; const sp = Fi.spot, bite = Fi.st === 'bite'; bob.visible = line.visible = true; bob.position.set(sp.x, sp.y + (bite ? -.12 + Math.sin(t * 30) * .06 : Math.sin(t * 3) * .04), sp.z);
        const p = line.geometry.attributes.position; p.setXYZ(0, P.x + Math.sin(P.h) * .6, 1.2, P.z + Math.cos(P.h) * .6); p.setXYZ(1, sp.x, sp.y + .2, sp.z); p.needsUpdate = true; ring.visible = bite; if (bite) { ring.position.set(sp.x, sp.y + .05, sp.z); ring.scale.setScalar(1 + (t * 2) % 1.4); }
        if (Fi.st === 'wait' && Fi.t <= 0) { Fi.st = 'bite'; Fi.t = 1.5; A.splash && A.splash(); fx.burst(sp.x, sp.y + .3, sp.z, 12, [BI.C.water, BI.C.white], 3, .8, 28, 3); say('❗ Es beißt! Schnell einholen!', 1500); }
        else if (Fi.st === 'bite' && Fi.t <= 0) stopFish('Ach, der Fisch ist entwischt! 🐟'); }
    }
    if (Dg.st) { Dg.t -= dt; Dg.e -= dt; if (Dg.e <= 0) { Dg.e = .18; fx.emit(Dg.spot.x + (Math.random() - .5) * .6, .3, Dg.spot.z + (Math.random() - .5) * .6, (Math.random() - .5) * 1.5, 2.2, (Math.random() - .5) * 1.5, .7, 24, .9, .8, .5, 4, .6); } if (Dg.t <= 0 || P.veh) { if (P.veh) Dg.st = false; else digDone(); } }
    /* Käfer */
    for (let i = 0; i < NB; i++) {
      const b = bugs[i]; if (i >= NBA) { dm.scale.setScalar(0); dm.updateMatrix(); bmesh.setMatrixAt(i, dm.matrix); continue; } if (!b.on) { b.t += dt; if (b.t >= 0 && !K.open && onFoot() && Math.random() < dt * 1.2) spawnBug(b); dm.scale.setScalar(0); dm.position.set(0, -50, 0); dm.updateMatrix(); bmesh.setMatrixAt(i, dm.matrix); continue; }
      if (Math.hypot(b.x - P.x, b.z - P.z) > 36) { b.on = false; continue; }
      b.ph += dt; const fly = b.sp[4].includes('fly'), run = Math.hypot(b.x - P.x, b.z - P.z) < 3.6; if (Math.sin(b.ph * .9 + i) > .96 || run) { const g = run ? Math.atan2(b.x - P.x, b.z - P.z) + (Math.random() - .5) : Math.random() * TAU; b.vx = Math.sin(g); b.vz = Math.cos(g); }
      const sp = (fly ? 1.5 : .7) * (run ? 2 : 1), nx = b.x + b.vx * sp * dt, nz = b.z + b.vz * sp * dt; if (grass(nx, nz)) { b.x = nx; b.z = nz; } else { b.vx = -b.vx; b.vz = -b.vz; }
      dm.position.set(b.x, fly ? .9 + Math.sin(b.ph * 2.4 + i) * .35 : .03, b.z); dm.rotation.set(0, Math.atan2(b.vx, b.vz), fly ? Math.sin(b.ph * 18) * .35 : 0); dm.scale.setScalar(1 + b.sp[3] * .25); dm.updateMatrix(); bmesh.setMatrixAt(i, dm.matrix);
      const c = b.sp[5]; if (b.sp[4].includes('rainbow')) cl.setHSL((t * .4 + i * .1) % 1, .9, .6); else if (b.sp[4].includes('night')) cl.setHex(0xfff3a0); else cl.setHex(c); bmesh.setColorAt(i, cl);
    }
    bmesh.instanceMatrix.needsUpdate = true; if (bmesh.instanceColor) bmesh.instanceColor.needsUpdate = true;
    /* Buddelstellen */
    for (let i = 0; i < NS; i++) {
      const s = spots[i]; if (i >= NSA) { dm.scale.setScalar(0); dm.updateMatrix(); smesh.setMatrixAt(i, dm.matrix); continue; } if (!s.on) { s.t -= dt; if (s.t <= 0 && onFoot()) { s.t = 2 + Math.random() * 3; spawnSpot(s); } dm.scale.setScalar(0); dm.position.set(0, -50, 0); dm.updateMatrix(); smesh.setMatrixAt(i, dm.matrix); continue; }
      if (Math.hypot(s.x - P.x, s.z - P.z) > 70) { s.on = false; s.t = 1; continue; }
      dm.position.set(s.x, .5 + Math.sin(t * 3 + i) * .12, s.z); dm.rotation.set(0, t * 1.6 + i, 0); dm.scale.set(1, 1.3, 1); dm.updateMatrix(); smesh.setMatrixAt(i, dm.matrix);
      if (Math.random() < dt * 2.5) fx.emit(s.x + (Math.random() - .5) * 1.2, .3, s.z + (Math.random() - .5) * 1.2, 0, .8, 0, .8, 22, 1, .9, .5, 4, .5);
    }
    smesh.instanceMatrix.needsUpdate = true;
  };
  /* ---------- 📖 Sammelbuch (Fenster) ---------- */
  const box = () => $('sammelBox');
  function render() {
    const s = S(), b = box(); if (!b) return; b.innerHTML = ''; const g = D.groups[K.tab] ? D.groups[K.tab][0] : 'zoo', F = K.featured();
    const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
    b.appendChild(el('div', 'logo', '📖 Sammelbuch')); b.lastChild.style.fontSize = '30px';
    b.appendChild(el('div', 'sub', found() + ' von ' + total() + ' gefunden')); b.lastChild.style.margin = '4px 0 8px';
    const bar = el('div', '', '<div style="height:14px;border-radius:9px;background:#e6ecf5;overflow:hidden"><div style="height:100%;width:' + Math.round(found() / total() * 100) + '%;background:linear-gradient(90deg,#4cd07d,#ffd23f)"></div></div>'); bar.style.margin = '0 6px 8px'; b.appendChild(bar);
    { const ev = el('div', '', EVT.icon + ' <b>Heute: ' + EVT.name + '</b> <small>' + EVT.text + '</small>'); ev.style.cssText = 'background:#e4f6ff;border-radius:14px;padding:6px 10px;margin:0 6px 8px;font-weight:700;font-size:14px'; b.appendChild(ev); }
    const ft = el('div', '', '🌟 Heute extra begehrt: <b style="font-size:26px">' + F.sp[1] + '</b> ' + F.sp[2] + ' <small>(+2 ⭐ beim ersten Fang heute)</small>'); ft.style.cssText = 'background:#fff6d6;border-radius:14px;padding:6px 10px;margin:0 6px 8px;font-weight:700'; b.appendChild(ft);
    const tabs = el('div', ''); tabs.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px';
    [...D.groups, ['zoo', '🐾', 'Tiere']].forEach((q, i) => { const n = q[0] === 'zoo' ? '' : ' ' + Object.keys(s[q[0]]).length + '/' + D[q[0]].length, t = el('button', 'pill' + (i === K.tab ? ' sel' : ''), q[1] + ' ' + q[2] + n); t.type = 'button'; t.style.cssText = 'font-size:17px;padding:8px 12px;border-radius:16px;border:3px solid ' + (i === K.tab ? '#ffb300' : '#d5deea') + ';background:' + (i === K.tab ? '#fff3c4' : '#fff') + ';font-weight:800;cursor:pointer'; t.onclick = () => { if (q[0] === 'zoo') { if (G.zoo) { K.close(); G.zoo(); } return; } K.tab = i; render(); }; tabs.appendChild(t); }); b.appendChild(tabs);
    const grid = el('div', ''); grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 4px'; const set = s[g] || {};
    for (const sp of D[g] || []) { const have = set[sp[0]] | 0, c = el('button', '', '<div style="font-size:42px;line-height:1.1;' + (have ? (g === 'bug' && sp[6] ? 'filter:hue-rotate(' + sp[6] + 'deg)' : '') : 'filter:grayscale(1) brightness(.35);opacity:.55') + '">' + (have ? sp[1] : sp[1]) + '</div><div style="font-size:14px;font-weight:800;min-height:34px">' + (have ? sp[2] : '❓') + '</div><div style="font-size:12px;font-weight:700;color:' + RC[sp[3]] + '">' + (have ? '×' + have : RN[sp[3]]) + '</div>');
      c.type = 'button'; c.style.cssText = 'border-radius:16px;border:4px solid ' + (have ? RC[sp[3]] : '#d5deea') + ';background:' + (have ? '#fff' : '#f3f6fb') + ';padding:6px 2px;cursor:pointer;font-family:inherit'; c.onclick = () => { const bs = s.best[sp[0]]; say((have ? sp[1] + ' ' + sp[2] + ' (' + RN[sp[3]] + ')' + (bs ? ' · Rekord ' + bs + ' cm' : '') : '❓ Noch nicht gefunden – ' + (g === 'fish' ? (sp[4].includes('sea') ? 'am Strand angeln' : 'am See angeln') : g === 'bug' ? 'im Gras mit dem Kescher' : 'am Strand buddeln') + (sp[4].includes('night') ? ' (nachts)' : '')), 3200); }; grid.appendChild(c); }
    b.appendChild(grid); const done = el('button', 'big', '✔ Fertig'); done.style.cssText = 'margin-top:12px;font-size:20px;padding:10px 28px'; done.onclick = () => K.close(); b.appendChild(done);
  }
  K.show = function () { if (K.open) return; K.open = true; G.setStick && G.setStick(0, 0); render(); $('sammelPanel').hidden = false; G.earn && G.earn('sammel'); };
  K.close = function () { if (!K.open) return; K.open = false; $('sammelPanel').hidden = true; G.updateButtons && G.updateButtons(true); };
  addEventListener('keydown', e => { if (K.open && e.code === 'Escape') { K.close(); e.preventDefault(); } });
  /* ---------- Aufgaben-Log ---------- */
  K.log = function () {
    const s = S(), F = K.featured(), rows = D.groups.map(([g, ic, nm, one]) => ({ ok: Object.keys(s[g]).length === D[g].length, icon: ic, text: nm + ' im Sammelbuch: ' + Object.keys(s[g]).length + ' von ' + D[g].length + (g === 'fish' ? ' (am See & Strand angeln)' : g === 'bug' ? ' (Kescher im Gras)' : ' (glitzernde Stellen am Strand)') }));
    rows.push({ ok: !!(s.ev && s.ev.d === dayKey() && s.ev.n >= 5) || EVT.g === 'rainbow' && false, icon: EVT.icon, text: 'Heute: ' + EVT.name + ' – ' + EVT.text });
    rows.push({ ok: s.fd.d === dayKey(), icon: '🌟', text: 'Tagesglück: heute ' + F.sp[1] + ' ' + F.sp[2] + ' fangen (+2 ⭐)' });
    return { title: '📖 Sammelbuch & Fangen', count: found() + ' von ' + total(), rows };
  };
  K.counts = () => { const s = S(); return { fish: Object.keys(s.fish).length, bug: Object.keys(s.bug).length, dig: Object.keys(s.dig).length }; };
  S(); K.dbg = { bugs, spots, Fi, Dg, collect };
  return K;
};
