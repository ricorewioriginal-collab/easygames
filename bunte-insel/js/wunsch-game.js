'use strict';
/* Bunte Insel – Wunsch-Insel 🌠 (Laufzeit): Wunschfrüchte + geheimes Symbol, Schlucht-Rätsel (Wandzeichen in der richtigen Reihenfolge), Floß aus 6 Teilen mit Probefahrt,
   Aussichtsturm, Truhen, Sternscherben, Hängematte, Einbruch der Dunkelheit (Überlebens-Kampf) und die Schattenarena (3 Runden + Endgegner „Umbra“ mit eigener Mechanik).
   Kampf: Angriff ⚔️ (3er-Kombo), Ausweichen 🌀 (kurz unverwundbar), Spezial ✨ (Lichtwelle, lädt sich durch Treffer auf). Alles selbst erfunden. */
BI.createWunsch = function (G) {
  const { scene, W, A, fx, P, say, save, persist, addStars } = G, K = { open: false }, T = BI.WUNSCH, Q = T.P, L = T.at, TAU = Math.PI * 2, GOLD = 0xffd23f;
  const S = () => { const s = save.wunsch || (save.wunsch = {}); s.visit |= 0; s.fruit = s.fruit || [0, 0, 0]; s.sym |= 0; s.light |= 0; s.cave |= 0; s.parts = s.parts || [0, 0, 0, 0, 0, 0]; s.raft |= 0; s.trial |= 0; s.tower |= 0; s.chests = s.chests || [0, 0, 0]; s.stars = s.stars || [0, 0, 0, 0, 0]; s.ham |= 0; s.dark |= 0; s.rounds |= 0; s.boss |= 0; s.talk = s.talk || {}; return s; }; S();
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const gY = (x, z) => W.groundY(x, z), nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r, onIsle = () => Math.hypot(P.x - T.x, P.z - T.z) < T.R + 14;
  const $ = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const emo = (txt, x, y, z, size, op, wide) => { const cv = document.createElement('canvas'); cv.width = wide ? 640 : 128; cv.height = 128; const c = cv.getContext('2d'); c.font = '92px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cv.width / 2, 70); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, opacity: op == null ? 1 : op })); sp.position.set(x, y, z); sp.scale.set(wide ? size * 5 : size, size, size); scene.add(sp); return sp; };
  const SYM = ['☀️', '🌙', '⭐', '💖', '🗝️'], PERM = [3, 0, 4, 2, 1];             /* PERM[i] = welches Zeichen an Wandposition i sitzt; die richtige Reihenfolge ist 0,1,2,3,4 */
  const ICON = { holz: '🪵', seil: '🧵', segel: '⛵' };

  /* ===== Sammel-Dinge, Truhen, Zeichen ===== */
  const bob = []; const item = (txt, a, b, dy, size) => { const p = L(a, b), y = gY(p.x, p.z) + dy, sp = emo(txt, p.x, y, p.z, size || 1.5); const o = { sp, x: p.x, z: p.z, y, ph: Math.random() * 6 }; bob.push(o); return o; };
  const fruits = Q.fruits.map(([a, b]) => item('🌟', a, b, 1.1, 1.4)), parts = Q.parts.map(([k, a, b]) => item(ICON[k], a, b, 1.1, 1.6)), stars = Q.stars.map(([a, b]) => item('✨', a, b, 1.3, 1.3));
  const CY = [6.3, 3, 4];
  const chestM = Q.chests.map(([a, b], i) => { const p = L(a, b), g = new THREE.Group(), bb = new BI.Batch(); bb.box(0, .3, 0, 1.5, .6, 1.0, 0x8a5a2a); bb.box(0, .62, 0, 1.54, .1, 1.04, GOLD); bb.box(0, .3, .5, .2, .3, .06, GOLD); g.add(bb.mesh(BI.mat()));
    const lb = new BI.Batch(); lb.box(0, 0, 0, 1.5, .3, 1.0, 0xa06a32); lb.box(0, .16, 0, 1.54, .06, 1.04, GOLD); const lm = lb.mesh(BI.mat()); lm.position.set(0, .12, .5); const lp = new THREE.Group(); lp.add(lm); lp.position.set(0, .62, -.5); g.add(lp);
    g.position.set(p.x, CY[i] + .25, p.z); g.rotation.y = Math.atan2(T.ux, T.uz) + Math.PI; scene.add(g); return { g, lid: lp, x: p.x, z: p.z }; });
  const glyphM = Q.glyphs.map(([a, b], i) => { const p = L(a, b), sp = emo(SYM[PERM[i]], p.x, 2.3, p.z, 1.9, .15); return { sp, x: p.x, z: p.z, i }; });
  const sp0 = L(Q.symbol[0] - 3.4, Q.symbol[1]), symTree = emo('☀️🌙⭐💖🗝️', sp0.x, 4.4, sp0.z, 1.4, 1, true); symTree.visible = false;
  const buoy = (() => { const p = L(...Q.buoy), g = new THREE.Group(), bb = new BI.Batch(); bb.cyl(0, 0, 0, .7, .9, 1.2, 0xe8453c, 10); bb.cyl(0, 1.2, 0, .5, .7, .5, 0xffffff, 10); bb.cyl(0, 1.7, 0, .08, .08, 1.6, 0x555a66, 6); g.add(bb.mesh(BI.mat())); g.position.set(p.x, -.4, p.z); scene.add(g); g.visible = false; return { g, x: p.x, z: p.z }; })();
  const portal = (() => { const c = W.spots.wArenaC, m = new THREE.Mesh(new THREE.TorusGeometry(2.2, .3, 8, 30), new THREE.MeshBasicMaterial({ color: 0x8a4ad8 })); m.position.set(c.x, 2.6, c.z); m.visible = S().dark >= 2; scene.add(m); m.add(new THREE.Mesh(new THREE.CircleGeometry(2.0, 24), new THREE.MeshBasicMaterial({ color: 0x1a0a30, transparent: true, opacity: .8, side: THREE.DoubleSide }))); return m; })();

  /* ===== Figuren ===== */
  const people = [];
  K.build = function () {
    const look = o => Object.assign({ hat: 'none', skin: 0xf3c9a0, shoe: 0x333333 }, o), mk = (id, a, b, name, o, h) => { BI.DLG_LOOKS[name] = look(o); const c = BI.makeChar(look(o)), p = L(a, b); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); people.push({ id, c, x: p.x, z: p.z, name }); };
    mk('silvan', ...Q.silvan, 'Silvan', { shirt: 0x2a2a3a, pants: 0x2a2a3a, hair: 0xd8d8e8, style: 'long', logo: 0x8a6ad8 }, Math.atan2(T.ux, T.uz) + 2.4);
    mk('kira', ...Q.kira, 'Kira', { shirt: 0xff7a9a, pants: 0xffffff, hair: 0xc8452a, style: 'short', dress: true }, Math.atan2(T.ux, T.uz) + 1);
  };
  const stage = () => { const s = S(); return !s.fruit.every(Boolean) ? 0 : !s.cave ? 1 : !s.trial ? 2 : s.dark < 2 ? 3 : s.rounds < 3 ? 4 : !s.boss ? 5 : 6; };
  const LINES = [
    ['Wunschfrüchte haben ein Geheimnis! Eine hängt an der krummen Palme am Strand, eine liegt hinter der Hütte, die dritte unter dem großen Baum. 🌟', 'Such sie zuerst – dann zeigt dir der große Baum etwas.'],
    ['Silvan hat eine Schlucht gefunden! Weck den Kristall am Eingang – dann berühre die Wandzeichen in der Reihenfolge vom großen Baum: ☀️ 🌙 ⭐ 💖 🗝️', 'In der Schlucht ruht ein Licht. Erst der Kristall, dann die Zeichen – in der richtigen Reihenfolge!'],
    ['Wir bauen ein Floß! 3 Stämme 🪵, 2 Seile 🧵 und 1 Segel ⛵ – sie liegen überall, auch auf Felsen, am Turm und hinter Hütten. Dann ab zur roten Boje!', 'Ein Floß ist besser als jedes Boot. Such alle Teile und bau es am Strand zusammen.'],
    ['Lass uns zur Hängematte gehen und den Sonnenuntergang ansehen … 🌇', 'Komisch … der Himmel wird so dunkel. Bleib wachsam!'],
    ['Die Schattenarena ist erwacht! Betritt das dunkle Portal in der Inselmitte. Pass auf deine Herzen auf! 💖', 'Weich aus 🌀, schlag zu ⚔️ und nutze die Lichtwelle ✨, wenn sie leuchtet!'],
    ['Du schaffst das! Umbra hat einen Panzer – nur wenn er gegen einen Pfeiler kracht, ist er betäubt!', 'Lock Umbra so, dass zwischen ihm und dir ein Pfeiler steht. Dann: rennen lassen, ausweichen, zuschlagen!'],
    ['Die Insel ist wieder hell! Danke, du bist ein echter Held! 💛', 'Nicht schlecht … beim nächsten Mal bin ich schneller. 😏']];
  K.stage = stage;

  /* ===== Aufgaben ===== */
  const heart = (x, z, n) => fx.burst(x, 1.4, z, n || 14, [[1, .9, .5], [1, .6, .9], [1, 1, 1]], 3.4, 1, 28, 3);
  const nPart = k => Q.parts.filter((q, i) => q[0] === k && S().parts[i]).length, nTot = k => Q.parts.filter(q => q[0] === k).length, allParts = () => S().parts.every(Boolean), nFr = () => S().fruit.filter(Boolean).length;
  const pick = (o, i, arr) => { arr[i] = 1; o.sp.visible = false; heart(o.x, o.z, 12); A.star && A.star(); persist(); };
  function checkFruit() { const s = S(); if (nFr() === 3 && !s.sym) { s.sym = 1; symTree.visible = true; addStars(2); A.fanfare && A.fanfare(); note(784, 1.2, 'sine', .1); note(988, 1.4, 'sine', .08, .15); say('🌟 Drei Wunschfrüchte! Am großen Baum leuchtet ein geheimes Zeichen auf – merk dir die Reihenfolge! +2 ⭐', 7000); persist(); } }
  let seq = [];
  function pressGlyph(g) {
    const s = S(); if (s.cave) { say('🌠 Das Tor ist schon offen – schau es dir an!', 2400); return; } if (!s.light) { say('🔮 Erst den leuchtenden Kristall am Eingang berühren – dann zeigen sich die Zeichen!', 3400); return; }
    const sy = PERM[g.i]; if (seq.includes(sy)) return; seq.push(sy); g.sp.material.opacity = 1; note(392 + sy * 98, .5, 'sine', .12); heart(g.x, g.z, 6);
    if (sy !== seq.length - 1) { seq = []; note(180, .5, 'sawtooth', .08); say('🌀 Falsche Reihenfolge! Die Zeichen erlöschen. Tipp: Das geheime Zeichen am großen Baum zeigt sie.', 4200); return; }
    if (seq.length === 5) { s.cave = 1; addStars(5); G.earn && G.earn('wunsch_hoehle'); A.fanfare && A.fanfare(); const d = L(...Q.door); heart(d.x, d.z, 40); [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, .7, 'sine', .12, i * .14)); const sch = save.schluessel || (save.schluessel = {}); sch.owned = sch.owned || [0]; if (!sch.owned.includes(5)) sch.owned.push(5); say('🌠 Das Tor in der Schlucht öffnet sich – und ein neuer Lichtschlüssel erscheint: der WUNSCHSCHLÜSSEL! (im Wuschel-Laden wählbar) +5 ⭐', 7600); persist(); }
  }
  function buildRaft() {
    const s = S(); if (s.raft) return; if (!allParts()) { say('🛶 Fürs Floß fehlt noch: 🪵 ' + nPart('holz') + '/3 · 🧵 ' + nPart('seil') + '/2 · ⛵ ' + nPart('segel') + '/1', 4600); return; }
    s.raft = 1; buoy.g.visible = true; addStars(3); A.fanfare && A.fanfare(); const p = L(...Q.raft); heart(p.x, p.z, 30); spawnRaft(); say('🛶 Das Floß ist fertig und liegt am Steg! Steig ein und mach die Probefahrt: fahr zur roten Boje 🔴 im Meer! +3 ⭐', 6200); persist();
  }
  function spawnRaft() { if (K.raftV || !G.addVeh) return; const p = L(Q.dock[0] + 1, Q.raft[1]); K.raftV = G.addVeh('floss', p.x, p.z, Math.atan2(-T.ux, -T.uz)); }
  function chest(i) { const s = S(); if (s.chests[i]) { say('📦 Diese Truhe ist schon leer.', 2000); return; } s.chests[i] = 1; addStars(3); A.fanfare && A.fanfare(); heart(chestM[i].x, chestM[i].z, 22); const n = s.chests.filter(Boolean).length; say('📦 Truhe offen! +3 ⭐ (' + n + ' von 3)' + (n === 3 ? ' – alle Truhen gefunden! 🏆 +3 ⭐' : ''), 3600); if (n === 3) { addStars(3); G.earn && G.earn('wunsch_truhen'); } persist(); }
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'wglyph') return pressGlyph(glyphM[n.i]);
    if (n.k === 'wcrystal') { if (!s.light) { s.light = 1; A.fanfare && A.fanfare(); note(660, 1, 'sine', .1); note(880, 1.2, 'sine', .08, .1); const q = L(...Q.crystal); fx.burst(q.x, 2, q.z, 30, [[.7, .6, 1], [1, 1, 1]], 4, 1.4, 28, 3); persist(); say('🔮 Der Kristall leuchtet! An den Felswänden erscheinen fünf Zeichen. Berühre sie in der richtigen Reihenfolge!', 5600); } else say('🔮 Der Kristall pulsiert sanft. Die Zeichen warten auf dich.', 2600); return; }
    if (n.k === 'wdoor') { say(s.cave ? '🌠 Hinter dem Tor schläft ein warmes Licht … Es hat dir den Wunschschlüssel geschenkt!' : '🚪 Das Tor ist zu. Es öffnet sich, wenn die Zeichen in der richtigen Reihenfolge leuchten.', 4200); return; }
    if (n.k === 'wsym') { if (!s.sym) { say('🌳 Am Stamm sind Kratzer zu erkennen … Sammle erst die drei Wunschfrüchte!', 3600); return; } if (!s.talk.sym) { s.talk.sym = 1; persist(); } say('🌳 Das Zeichen zeigt die Reihenfolge: ☀️ Sonne → 🌙 Mond → ⭐ Stern → 💖 Herz → 🗝️ Schlüssel', 6200); return; }
    if (n.k === 'wraft') return buildRaft();
    if (n.k === 'wchest') return chest(n.i);
    if (n.k === 'wscope') { if (!s.tower) { s.tower = 1; addStars(2); A.fanfare && A.fanfare(); persist(); say('🔭 Durch das Fernrohr siehst du die ganze Insel: die Schlucht, die Arena, das Meer … und weit hinten das Schlüsselreich! +2 ⭐', 6200); } else say('🔭 Was für eine Aussicht!', 2000); return; }
    if (n.k === 'wham') { if (!(s.fruit.every(Boolean) && s.cave && s.trial) || s.dark >= 2) { A.pop && A.pop(); if (!s.ham) { s.ham = 1; addStars(1); persist(); say('🌴 Ahh, in der Hängematte schaukelt es sich herrlich! +1 ⭐', 3600); } else say('🌴 Schaukel, schaukel … Die Sonne glitzert auf dem Wasser.', 3000); return; } K.darkStart(); return; }
    if (n.k === 'wtalk') { const l = LINES[stage()]; say(n.who === 'kira' ? '🌸 Kira: „' + l[0] + '“' : '🌙 Silvan: „' + l[1] + '“', 8000); A.hello && A.hello(); return; }
    if (n.k === 'warena') { if (s.dark < 2) { say('🏟️ Die Arena ist versiegelt. Ein dunkles Geheimnis schläft darunter … Vielleicht weckt es der Abend?', 4600); return; } K.arenaStart(); return; }
  };
  K.near = function () {
    if (P.veh || P.y > 12 || !onIsle() || cb.on) return null; const s = S(); let best = null, bd = 1e9; const c = (d, o) => { if (d < bd) { bd = d; best = o; } }, dist = q => Math.hypot(P.x - q.x, P.z - q.z);
    glyphM.forEach((g, i) => { const d = dist(g); if (d < 3.7) c(d, { k: 'wglyph', i, label: [SYM[PERM[i]], 'Zeichen berühren'] }); });
    { const q = L(...Q.crystal), d = dist(q); if (d < 3) c(d, { k: 'wcrystal', label: ['🔮', 'Kristall berühren'] }); }
    { const q = L(...Q.door), d = dist(q); if (d < 3.8) c(d, { k: 'wdoor', label: ['🚪', 'Tor ansehen'] }); }
    { const q = L(...Q.symbol), d = dist(q); if (d < 6.5 && d > 1) c(d, { k: 'wsym', label: ['🌳', 'Zeichen am Baum'] }); }
    { const q = L(...Q.raft), d = dist(q); if (d < 5 && !s.raft) c(d, { k: 'wraft', label: ['🛶', allParts() ? 'Floß bauen!' : 'Floß-Bauplatz'] }); }
    chestM.forEach((m, i) => { const d = dist(m); if (d < 2.8 && Math.abs(P.y - CY[i]) < 2) c(d, { k: 'wchest', i, label: ['📦', s.chests[i] ? 'Leere Truhe' : 'Truhe öffnen'] }); });
    { const q = W.spots.wTower, d = dist(q); if (d < 3 && P.y > 4) c(d, { k: 'wscope', label: ['🔭', 'Fernrohr'] }); }
    { const q = W.spots.wHammock, d = dist(q); if (d < 4) c(d, { k: 'wham', label: ['🌴', s.fruit.every(Boolean) && s.cave && s.trial && s.dark < 2 ? 'Sonnenuntergang ansehen' : 'Hängematte'] }); }
    for (const p of people) { const d = dist(p); if (d < 3.4) c(d, { k: 'wtalk', who: p.id, label: [p.id === 'kira' ? '🌸' : '🌙', 'Mit ' + p.name + ' reden'] }); }
    { const q = W.spots.wArenaC, d = dist(q); if (d < 3.2) c(d, { k: 'warena', label: ['🏟️', s.dark >= 2 ? 'Schattenarena betreten' : 'Versiegelte Arena'] }); }
    return best;
  };

  /* ===== Kampf-Motor (Einbruch der Dunkelheit + Schattenarena) ===== */
  const cb = { on: false, mode: '', hp: 5, inv: 0, atk: 0, combo: 0, comboT: 0, meter: 0, dodge: 0, dodgeCd: 0, en: [], orbs: [], round: 0, t: 0, spawn: 0, wait: 0, lost: 0, msgT: 0, dash: null, boss: null };
  const GC = new THREE.CircleGeometry(1, 28), GP = new THREE.PlaneGeometry(1, 1), telMat = () => new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: .35, depthWrite: false, side: THREE.DoubleSide });
  const ET = { krab: { hp: 2, sc: .8, spd: 3.4 }, spring: { hp: 3, sc: 1.0, spd: 2.6 }, schuetz: { hp: 3, sc: .95, spd: 2.2 }, wirbler: { hp: 4, sc: 1.1, spd: 3.0 }, boss: { hp: 12, sc: 3 } };
  const mkShadow = (sc, big) => { const b = new BI.Batch(); b.sph(0, .55, 0, .55, 0x241a36, 1, 1, 1.05, 1); b.sph(0, .25, 0, .6, 0x1a1226, 1, 1, .5, 1); for (const sd of [-1, 1]) { b.cone(sd * .3, .95, .05, .12, .4, 0x241a36, 4); b.sph(sd * .2, .7, .46, .1, 0xffe14a, 0, 1, 1.5, .5); } if (big) for (let i = 0; i < 6; i++) { const g = i / 6 * TAU; b.cone(Math.sin(g) * .6, 1.1, Math.cos(g) * .6, .14, .5, 0x3a2a56, 4); } const g = new THREE.Group(); g.add(b.mesh(BI.mat())); g.scale.setScalar(sc); scene.add(g); return g; };
  const mkRing = () => { const m = new THREE.Mesh(GC, telMat()); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return m; };
  const mkLine = () => { const g = new THREE.Group(), m = new THREE.Mesh(GP, telMat()); m.rotation.x = Math.PI / 2; g.add(m); g.visible = false; scene.add(g); g.userData.m = m; return g; };
  const setRing = (e, x, z, r) => { e.ring.visible = true; e.ring.position.set(x, .09, z); e.ring.scale.set(r, r, 1); };
  const setLine = (e, x, z, dx, dz, len, w) => { const g = e.line; g.visible = true; g.position.set(x, .09, z); g.rotation.y = Math.atan2(dx, dz); g.userData.m.scale.set(w, len, 1); g.userData.m.position.z = len / 2; };
  const hudEl = $('div'); hudEl.id = 'wHud'; hudEl.hidden = true; hudEl.innerHTML = '<div class="wh"></div><div class="wm"></div><div class="wb"><button data-k="atk" aria-label="Angriff">⚔️</button><button data-k="dodge" aria-label="Ausweichen">🌀</button><button data-k="spec" aria-label="Lichtwelle">✨</button></div><button class="wx" data-k="exit" aria-label="Aufgeben">✖</button>';
  const hcss = $('style'); hcss.textContent = '#wHud{position:fixed;inset:0;z-index:55;pointer-events:none;font-family:inherit}#wHud[hidden]{display:none}#wHud .wh{position:absolute;left:50%;top:calc(max(12px,env(safe-area-inset-top)) + 112px);transform:translateX(-50%);background:rgba(20,16,40,.82);color:#fff;border-radius:16px;padding:6px 14px;font-size:20px;font-weight:700;text-align:center;white-space:nowrap}#wHud .wm{position:absolute;left:50%;top:calc(max(12px,env(safe-area-inset-top)) + 160px);transform:translateX(-50%);color:#fff;font-size:22px;font-weight:800;text-shadow:0 2px 6px #000;text-align:center;max-width:90vw}#wHud .wb{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:calc(max(12px,env(safe-area-inset-bottom)) + 150px);display:flex;flex-direction:column;gap:10px;pointer-events:auto}#wHud button{width:64px;height:64px;border-radius:50%;border:3px solid #fff;background:rgba(60,40,120,.85);font-size:30px;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.3);cursor:pointer;touch-action:manipulation}#wHud button.rdy{background:#e8a020;animation:wp .6s infinite alternate}@keyframes wp{to{transform:scale(1.1)}}#wHud button:disabled{opacity:.45}#wHud .wx{position:absolute;left:12px;top:calc(max(12px,env(safe-area-inset-top)) + 112px);width:44px;height:44px;font-size:18px;pointer-events:auto}'; document.head.appendChild(hcss); document.body.appendChild(hudEl);
  const q$ = s => hudEl.querySelector(s); let hudT = 0;
  const hud = () => { q$('.wh').textContent = '❤️'.repeat(Math.max(0, cb.hp)) + '🖤'.repeat(Math.max(0, 5 - cb.hp)) + '  ' + (cb.mode === 'dark' ? '🌑 ' + Math.max(0, Math.ceil(cb.t)) + ' s' : cb.boss ? '👹 Umbra' : '🏟️ Runde ' + Math.min(3, cb.round + 1) + '/3') + '  ✨' + Math.round(cb.meter) + '%'; const sp = q$('[data-k=spec]'); sp.classList.toggle('rdy', cb.meter >= 100); sp.disabled = cb.meter < 100; q$('[data-k=dodge]').disabled = cb.dodgeCd > 0; };
  const banner = (t, sec) => { q$('.wm').textContent = t; cb.msgT = sec || 2.4; };
  const hurt = (n, ex, ez) => { if (cb.inv > 0 || cb.dodge > 0 || cb.hp <= 0 || !cb.on) return; cb.hp -= n; cb.inv = 1.0; A.bonk && A.bonk(); fx.burst(P.x, 1.3, P.z, 10, [[.5, .2, .7], [1, .4, .4]], 3, 1, 28, 2); const dx = P.x - ex, dz = P.z - ez, l = Math.hypot(dx, dz) || 1; P.x += dx / l * 1.2; P.z += dz / l * 1.2; if (cb.hp <= 0) { cb.hp = 0; cb.lost = 1.8; banner('💤 Das war knapp … versuch es gleich nochmal!', 2); } };
  function spawn(type, a, b) {
    const ty = ET[type], boss = type === 'boss', c = W.spots.wArenaC, arena = cb.mode === 'arena', bx = arena ? c.x : P.x, bz = arena ? c.z : P.z;
    const e = { type, boss, g: mkShadow(ty.sc, boss), ring: mkRing(), line: mkLine(), x: bx + Math.sin(a) * b, z: bz + Math.cos(a) * b, hp: ty.hp, mhp: ty.hp, st: 'move', t: 1 + Math.random(), tx: 0, tz: 0, kx: 0, kz: 0, stun: 0, r: boss ? 2.1 : .8 * ty.sc, face: 0, shield: boss, dm: 0, pc: 0, dirx: 0, dirz: 0 };
    e.g.position.set(e.x, 0, e.z); cb.en.push(e); return e;
  }
  function kill(e) { fx.burst(e.x, 1.2, e.z, e.boss ? 60 : 16, [[.25, .1, .4], [1, .9, .4], [.6, .4, .9]], e.boss ? 8 : 4, 1.2, 30, 3); drop(e); e.dead = 1; A.pop && A.pop(); }
  const drop = e => { scene.remove(e.g); scene.remove(e.ring); scene.remove(e.line); };
  function hitE(e, d, kb) {
    if (e.shield) { fx.burst(e.x, 2.4, e.z, 6, [[.8, .8, 1], [1, 1, 1]], 2, .6, 24, 1); note(900, .1, 'square', .04); return false; }
    e.hp -= d; e.stun = Math.max(e.stun, e.boss ? 0 : .25); const dx = e.x - P.x, dz = e.z - P.z, l = Math.hypot(dx, dz) || 1; e.kx = dx / l * kb * (e.boss ? .25 : 1); e.kz = dz / l * kb * (e.boss ? .25 : 1);
    if (!e.boss) { e.st = 'move'; e.t = .8; e.ring.visible = false; e.line.visible = false; e.g.position.y = 0; } fx.burst(e.x, 1.2, e.z, 8, [[1, .9, .5], [.7, .5, 1]], 3, .8, 26, 2); cb.meter = Math.min(100, cb.meter + 12); if (e.hp <= 0) kill(e); return true;
  }
  function attack() {
    if (!cb.on || cb.atk > 0 || cb.hp <= 0) return; cb.atk = .32; cb.comboT = 1.1; cb.combo = (cb.combo % 3) + 1; P.punchT = .4; P.punchHit = true; A.pop && A.pop(); const dmg = cb.combo === 3 ? 2 : 1, kb = cb.combo === 3 ? 4 : 1.6; let hit = 0;
    for (const e of cb.en) { if (e.dead) continue; const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d < 2.9 + e.r && (dx * Math.sin(P.h) + dz * Math.cos(P.h)) / (d || 1) > .1 && hitE(e, dmg, kb)) hit++; }
    fx.burst(P.x + Math.sin(P.h) * 1.6, 1.3, P.z + Math.cos(P.h) * 1.6, cb.combo === 3 ? 14 : 6, [[1, .95, .6], [.7, .8, 1]], 3, .9, 28, 1); if (cb.combo === 3 && hit) banner('💥 Kombo!', 1);
  }
  function dodge() { if (!cb.on || cb.dodgeCd > 0 || cb.hp <= 0) return; cb.dodge = .45; cb.dodgeCd = 1.1; cb.dash = { x: Math.sin(P.h), z: Math.cos(P.h), t: .25 }; fx.burst(P.x, .6, P.z, 8, [[.8, .8, 1], [1, 1, 1]], 2.4, .8, 24, 2); note(300, .2, 'triangle', .06); }
  function special() {
    if (!cb.on || cb.meter < 100 || cb.hp <= 0) return; cb.meter = 0; for (let k = 0; k < 3; k++) setTimeout(() => fx.burst(P.x + (Math.random() - .5) * 8, .8, P.z + (Math.random() - .5) * 8, 30, [[1, .95, .5], [1, 1, 1], [.6, .8, 1]], 6, 1.5, 30, 3), k * 120); A.fanfare && A.fanfare();
    for (const o of cb.orbs) scene.remove(o.m); cb.orbs = []; for (const e of cb.en) { if (e.dead || Math.hypot(e.x - P.x, e.z - P.z) > 8 + e.r) continue; if (e.boss && e.shield) { e.stun = Math.max(e.stun, 1.2); continue; } hitE(e, 3, 6); } banner('✨ Lichtwelle!', 1);
  }
  hudEl.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('button'); if (!b) return; const k = b.dataset.k; if (k === 'atk') attack(); else if (k === 'dodge') dodge(); else if (k === 'spec') special(); else if (k === 'exit') { if (cb.mode === 'dark') endDark(false); else K.arenaStop('exit'); } });
  addEventListener('keydown', e => { if (!cb.on) return; if (e.code === 'KeyJ') attack(); else if (e.code === 'KeyK') dodge(); else if (e.code === 'KeyL') special(); });
  K.attack = attack; K.dodge = dodge; K.special = special;
  function cleanup() { for (const e of cb.en) drop(e); cb.en = []; for (const o of cb.orbs) scene.remove(o.m); cb.orbs = []; cb.boss = null; }
  function begin(mode) { cleanup(); Object.assign(cb, { on: true, mode, hp: 5, inv: 0, atk: 0, combo: 0, comboT: 0, meter: 0, dodge: 0, dodgeCd: 0, round: 0, t: 0, spawn: 1, wait: 0, lost: 0, msgT: 0, dash: null }); hudEl.hidden = false; G.setStick && G.setStick(0, 0); K.open = true; }
  function end() { cb.on = false; hudEl.hidden = true; cleanup(); K.open = false; }
  /* ---- Einbruch der Dunkelheit ---- */
  let nightWas = 0;
  K.darkStart = function () {
    if (cb.on || K._dk) return; K._dk = 1; nightWas = G.getNightT ? G.getNightT() : 0; G.setNightT && G.setNightT(1); const p = W.spots.wHammock; P.veh = null; P.x = p.x + 3; P.z = p.z; P.y = 0; say('🌇 Der Himmel färbt sich orange … rosa … und dann wird er dunkel! 🌑', 5200); A.fanfare && A.fanfare();
    for (let i = 0; i < 6; i++) setTimeout(() => fx.burst(P.x + (Math.random() - .5) * 20, .3, P.z + (Math.random() - .5) * 20, 30, [[.1, .05, .2], [.3, .1, .5]], 7, 1.2, 40, 4), i * 450); [196, 185, 175, 165].forEach((f, i) => note(f, 1.4, 'sawtooth', .05, i * .5));
    setTimeout(() => { K._dk = 0; if (!onIsle()) { if (G.setNightT) G.setNightT(nightWas); return; } begin('dark'); cb.t = 40; banner('🌑 Schattenwesen! Halte 40 Sekunden durch – ⚔️ schlagen, 🌀 ausweichen!', 4); }, 2600);
  };
  function endDark(win) {
    const s = S(); end(); if (G.setNightT) G.setNightT(nightWas);
    if (win) { s.dark = 2; addStars(5); A.fanfare && A.fanfare(); G.earn && G.earn('wunsch_dunkel'); const c = W.spots.wArenaC; for (let k = 0; k < 5; k++) setTimeout(() => fx.burst(c.x, 1 + k, c.z, 40, [[.6, .3, 1], [1, .9, .5], [.2, .1, .4]], 6, 1.4, 30, 4), k * 300); portal.visible = true; say('🌀 Geschafft! Die Dunkelheit weicht – aber mitten auf der Insel hat sich ein dunkles Portal geöffnet: die Schattenarena erwacht! +5 ⭐', 7600); }
    else say('🌟 Die Schatten ziehen sich zurück. Probier es an der Hängematte nochmal!', 4000); persist();
  }
  /* ---- Schattenarena ---- */
  const ROUNDS = [['krab', 'krab', 'krab'], ['spring', 'spring', 'krab', 'krab'], ['schuetz', 'schuetz', 'spring', 'krab', 'wirbler']];
  const pillars = () => { const c = W.spots.wArenaC; return [0, 1, 2, 3].map(i => { const g = i / 4 * TAU + Math.PI / 4; return { x: c.x + Math.sin(g) * 10, z: c.z + Math.cos(g) * 10, r: 1.4 }; }); };
  K.arenaStart = function () { if (cb.on) return; begin('arena'); startRound(); };
  K.arenaStop = function (why) { end(); if (why === 'exit') say('🏟️ Du verlässt die Arena. Komm jederzeit wieder!', 2600); if (why === 'lose') { const c = W.spots.wArena; P.x = c.x; P.z = c.z; say('🏟️ Die Schatten haben gewonnen – diesmal. Probier es nochmal! (Tipp: ✨ Lichtwelle aufladen, 🌀 ausweichen)', 5200); } };
  function startRound() { cb.wait = 0; if (cb.round >= 3) return startBoss(); banner('🏟️ Runde ' + (cb.round + 1) + ' von 3', 2.4); cb.hp = Math.min(5, cb.hp + 1); ROUNDS[cb.round].forEach((ty, i, arr) => spawn(ty, i / arr.length * TAU + .5, 12)); }
  function startBoss() { cb.hp = 5; const e = spawn('boss', 0, 11); e.st = 'idle'; e.t = 1.6; cb.boss = e; banner('👹 UMBRA, der Schatten-Riese! Sein Panzer schützt ihn … lock ihn gegen einen Pfeiler!', 5); A.fanfare && A.fanfare(); [110, 98, 87].forEach((f, i) => note(f, 1.2, 'sawtooth', .07, i * .4)); }
  function orb(x, z, tx, tz, sp) { const m = new THREE.Mesh(new THREE.SphereGeometry(.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8a3ae0 })); m.position.set(x, 1.2, z); scene.add(m); const l = Math.hypot(tx - x, tz - z) || 1; cb.orbs.push({ m, x, z, vx: (tx - x) / l * sp, vz: (tz - z) / l * sp, t: 3.2 }); }
  function aiEnemy(e, dt) {
    const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz) || 1, ty = ET[e.type]; e.face = Math.atan2(dx, dz);
    if (e.kx || e.kz) { e.x += e.kx * dt * 4; e.z += e.kz * dt * 4; e.kx *= Math.max(0, 1 - dt * 6); e.kz *= Math.max(0, 1 - dt * 6); if (Math.abs(e.kx) + Math.abs(e.kz) < .1) e.kx = e.kz = 0; }
    if (e.stun > 0) { e.stun -= dt; return; } e.t -= dt;
    if (e.type === 'krab') {
      if (e.st === 'move') { e.x += dx / d * ty.spd * dt; e.z += dz / d * ty.spd * dt; if (d < 6 && e.t <= 0) { e.st = 'tel'; e.t = .7; } }
      else if (e.st === 'tel') { e.tx = dx / d; e.tz = dz / d; setLine(e, e.x, e.z, e.tx, e.tz, 4.5, 1.1); if (e.t <= 0) { e.st = 'dash'; e.t = .45; e.line.visible = false; } }
      else if (e.st === 'dash') { e.x += e.tx * 10 * dt; e.z += e.tz * 10 * dt; if (Math.hypot(P.x - e.x, P.z - e.z) < 1.3) hurt(1, e.x, e.z); if (e.t <= 0) { e.st = 'rest'; e.t = .9; } }
      else if (e.t <= 0) { e.st = 'move'; e.t = 1.2 + Math.random(); }
    } else if (e.type === 'spring') {
      if (e.st === 'move') { e.x += dx / d * ty.spd * dt; e.z += dz / d * ty.spd * dt; if (d < 9 && e.t <= 0) { e.st = 'tel'; e.t = 1; e.tx = P.x; e.tz = P.z; } }
      else if (e.st === 'tel') { setRing(e, e.tx, e.tz, 2.8); e.g.position.y = Math.sin(Math.min(1, 1 - e.t) * Math.PI) * 3.2; e.x += (e.tx - e.x) * Math.min(1, dt * 3); e.z += (e.tz - e.z) * Math.min(1, dt * 3); if (e.t <= 0) { e.st = 'rest'; e.t = .8; e.ring.visible = false; e.g.position.y = 0; fx.burst(e.tx, .3, e.tz, 24, [[.4, .2, .6], [1, 1, 1]], 5, 1, 26, 3); note(120, .3, 'square', .08); if (Math.hypot(P.x - e.tx, P.z - e.tz) < 2.8) hurt(1, e.tx, e.tz); } }
      else if (e.t <= 0) { e.st = 'move'; e.t = 1.4 + Math.random(); }
    } else if (e.type === 'schuetz') {
      const want = d < 8 ? -1 : d > 12 ? 1 : 0; e.x += dx / d * want * ty.spd * dt; e.z += dz / d * want * ty.spd * dt;
      if (e.st === 'move' && e.t <= 0) { e.st = 'tel'; e.t = .7; e.g.scale.setScalar(1.2 * ty.sc); } else if (e.st === 'tel' && e.t <= 0) { e.st = 'move'; e.t = 2.2; e.g.scale.setScalar(ty.sc); orb(e.x, e.z, P.x, P.z, 7); note(500, .15, 'triangle', .05); }
    } else if (e.type === 'wirbler') {
      if (e.st === 'move') { e.x += dx / d * ty.spd * dt; e.z += dz / d * ty.spd * dt; if (d < 3.4 && e.t <= 0) { e.st = 'tel'; e.t = .8; } }
      else if (e.st === 'tel') { setRing(e, e.x, e.z, 3.4); if (e.t <= 0) { e.st = 'spin'; e.t = .8; } }
      else if (e.st === 'spin') { e.g.rotation.y += dt * 18; e.dm -= dt; setRing(e, e.x, e.z, 3.4); if (e.dm <= 0 && Math.hypot(P.x - e.x, P.z - e.z) < 3.5) { hurt(1, e.x, e.z); e.dm = .5; } e.x += dx / d * 1.2 * dt; e.z += dz / d * 1.2 * dt; if (e.t <= 0) { e.st = 'rest'; e.t = 1.1; e.ring.visible = false; } }
      else if (e.t <= 0) { e.st = 'move'; e.t = 1.4; }
    }
  }
  /* Umbra: Panzer an → Treffer prallen ab. Rennt er beim Sturmangriff gegen einen Pfeiler, ist er 5,5 s betäubt (Panzer weg) und nimmt Schaden. */
  function aiBoss(e, dt) {
    const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz) || 1, frac = e.hp / e.mhp, ph = frac > .66 ? 0 : frac > .33 ? 1 : 2; if (e.st !== 'charge') e.face = Math.atan2(dx, dz);
    if (e.kx || e.kz) { e.x += e.kx * dt * 3; e.z += e.kz * dt * 3; e.kx *= Math.max(0, 1 - dt * 6); e.kz *= Math.max(0, 1 - dt * 6); }
    if (e.st === 'stun') { e.stun -= dt; e.shield = false; e.g.rotation.z = Math.sin(performance.now() / 70) * .15; if (e.stun <= 0) { e.shield = true; e.st = 'idle'; e.t = 1.2; e.g.rotation.z = 0; banner('🛡️ Umbras Panzer ist wieder da!', 1.8); } return; }
    if (e.stun > 0) { e.stun -= dt; return; } e.t -= dt;
    if (e.st === 'idle') {
      if (e.t <= 0) { if (e.pc % 3 === 2 || d < 5) { e.pc++; e.st = 'slam'; e.t = 1.1; } else { e.pc++; e.st = 'aim'; e.t = 1.3 - ph * .2; } } else { e.x += dx / d * 1.6 * dt; e.z += dz / d * 1.6 * dt; }
    } else if (e.st === 'slam') {
      setRing(e, e.x, e.z, 6); e.g.position.y = Math.max(0, Math.sin((1.1 - e.t) / 1.1 * Math.PI) * .8);
      if (e.t <= 0) { e.st = 'idle'; e.t = 1.4 - ph * .3; e.ring.visible = false; e.g.position.y = 0; fx.burst(e.x, .3, e.z, 40, [[.3, .1, .5], [1, 1, 1]], 8, 1.4, 30, 3); note(80, .5, 'square', .1); if (Math.hypot(P.x - e.x, P.z - e.z) < 6) hurt(1, e.x, e.z); if (ph >= 1 && cb.en.filter(q => !q.dead && !q.boss).length < 3) spawn('krab', Math.random() * TAU, 8); }
    } else if (e.st === 'aim') {
      e.dirx = dx / d; e.dirz = dz / d; setLine(e, e.x, e.z, e.dirx, e.dirz, 24, 4.4); e.line.userData.m.material.opacity = .22 + (1.3 - e.t) * .25;
      if (e.t <= 0) { e.st = 'charge'; e.t = 1.5; e.line.visible = false; e.face = Math.atan2(e.dirx, e.dirz); }
    } else if (e.st === 'charge') {
      e.x += e.dirx * 15 * dt; e.z += e.dirz * 15 * dt; let crash = false; for (const q of pillars()) if (Math.hypot(q.x - e.x, q.z - e.z) < q.r + e.r * .7) { crash = true; fx.burst(q.x, 2, q.z, 50, [[.8, .8, 1], [.5, .4, .8], [1, 1, 1]], 8, 1.6, 34, 4); }
      if (Math.hypot(P.x - e.x, P.z - e.z) < e.r + .7) hurt(2, e.x, e.z); const c = W.spots.wArenaC;
      if (crash) { e.shield = false; e.stun = 5.5; e.st = 'stun'; A.fanfare && A.fanfare(); note(60, .6, 'square', .12); banner('💥 Umbra ist betäubt! SCHLAG ZU!', 2.4); }
      else if (Math.hypot(e.x - c.x, e.z - c.z) > T.P.arenaR - 3 || e.t <= 0) { e.shield = false; e.stun = 1.6; e.st = 'stun'; banner('Umbra ist gegen die Wand gerannt – kurz betäubt!', 1.6); }
    }
  }
  K.cb = cb;
  /* ===== Takt ===== */
  K.update = function (dt, t) {
    const s = S(); if (!onIsle()) { if (cb.on) { if (cb.mode === 'dark') endDark(false); else K.arenaStop('exit'); } return; }
    if (!s.visit) { s.visit = 1; persist(); addStars(1); G.earn && G.earn('wunsch_insel'); say('🌠 Wunsch-Insel! Hier hat jeder einen Wunsch. Sammle Wunschfrüchte, finde die geheime Schlucht, bau ein Floß – und gib auf den Abend acht … +1 ⭐', 7600); }
    portal.rotation.y += dt * 1.4; for (const o of bob) o.sp.position.y = o.y + Math.sin(t * 2 + o.ph) * .18;
    fruits.forEach((o, i) => { if (s.fruit[i]) { o.sp.visible = false; return; } if (nr(o.x, o.z, 2)) { pick(o, i, s.fruit); say('🌟 Wunschfrucht gefunden! (' + nFr() + ' von 3)', 2600); checkFruit(); } });
    if (s.sym) symTree.visible = true;
    parts.forEach((o, i) => { if (s.parts[i]) { o.sp.visible = false; return; } if (nr(o.x, o.z, 2.2) && Math.abs(P.y - (o.y - 1.1)) < 2.5) { pick(o, i, s.parts); const k = Q.parts[i][0]; say(ICON[k] + ' ' + (k === 'holz' ? 'Baumstamm' : k === 'seil' ? 'Seil' : 'Segel') + ' gefunden! (🪵 ' + nPart('holz') + '/3 · 🧵 ' + nPart('seil') + '/2 · ⛵ ' + nPart('segel') + '/1)', 3600); if (allParts()) setTimeout(() => say('🛶 Alle Teile beisammen! Geh zum Floß-Bauplatz am Strand und bau das Floß.', 4600), 3400); } });
    stars.forEach((o, i) => { if (s.stars[i]) { o.sp.visible = false; return; } if (nr(o.x, o.z, 2) && Math.abs(P.y - (o.y - 1.3)) < 2.5) { s.stars[i] = 1; o.sp.visible = false; addStars(1); heart(o.x, o.z, 8); A.star && A.star(); persist(); if (s.stars.every(Boolean)) { addStars(3); say('✨ Alle 5 Sternscherben! +3 ⭐', 3000); } } });
    chestM.forEach((m, i) => { m.lid.rotation.x += ((s.chests[i] ? -1.2 : 0) - m.lid.rotation.x) * Math.min(1, dt * 6); });
    glyphM.forEach((g, i) => { g.sp.material.opacity = s.cave || seq.includes(PERM[i]) ? 1 : s.light ? .55 : .15; });
    if (s.raft) { buoy.g.visible = true; buoy.g.position.y = -.4 + Math.sin(t * 1.6) * .08; spawnRaft(); }
    if (s.raft && !s.trial && P.veh && P.veh.type === 'floss' && Math.hypot(P.veh.x - buoy.x, P.veh.z - buoy.z) < 5) { s.trial = 1; addStars(5); A.fanfare && A.fanfare(); G.earn && G.earn('wunsch_floss'); heart(buoy.x, buoy.z, 40); say('🛶 Probefahrt geschafft! Das Floß schwimmt! +5 ⭐ – Kira ruft: „Komm zur Hängematte, die Sonne geht unter!“', 7000); persist(); }
    if (cb.msgT > 0) { cb.msgT -= dt; if (cb.msgT <= 0) q$('.wm').textContent = ''; }
    if (!cb.on) return; hudT -= dt; if (hudT <= 0) { hudT = .1; hud(); }
    if (cb.lost > 0) { cb.lost -= dt; if (cb.lost <= 0) { if (cb.mode === 'dark') endDark(false); else K.arenaStop('lose'); } return; }
    cb.atk -= dt; cb.inv -= dt; cb.comboT -= dt; if (cb.comboT <= 0) cb.combo = 0; cb.dodge -= dt; cb.dodgeCd -= dt;
    if (cb.dash) { const k = Math.min(cb.dash.t, dt); P.x += cb.dash.x * 20 * k; P.z += cb.dash.z * 20 * k; cb.dash.t -= dt; if (cb.dash.t <= 0) cb.dash = null; }
    if (cb.mode === 'arena') { const c = W.spots.wArenaC, lim = T.P.arenaR - 1.4, d = Math.hypot(P.x - c.x, P.z - c.z); if (d > lim) { P.x = c.x + (P.x - c.x) * lim / d; P.z = c.z + (P.z - c.z) * lim / d; } for (const pl of pillars()) { const dx = P.x - pl.x, dz = P.z - pl.z, dd = Math.hypot(dx, dz) || .01; if (dd < pl.r + .5) { P.x = pl.x + dx / dd * (pl.r + .5); P.z = pl.z + dz / dd * (pl.r + .5); } } }
    if (cb.mode === 'dark') { cb.t -= dt; cb.spawn -= dt; if (cb.spawn <= 0 && cb.en.filter(q => !q.dead).length < 4) { cb.spawn = 2.2; spawn('krab', Math.random() * TAU, 10); } if (cb.t <= 0) { endDark(true); return; } }
    let bossDead = false;
    for (const e of cb.en) {
      if (e.dead) { if (e.boss) bossDead = true; continue; } if (e.boss) aiBoss(e, dt); else aiEnemy(e, dt);
      if (cb.mode === 'arena') { const c = W.spots.wArenaC, d = Math.hypot(e.x - c.x, e.z - c.z), lim = T.P.arenaR - 1.5; if (d > lim) { e.x = c.x + (e.x - c.x) * lim / d; e.z = c.z + (e.z - c.z) * lim / d; } }
      e.g.position.x = e.x; e.g.position.z = e.z; if (!(e.type === 'wirbler' && e.st === 'spin')) e.g.rotation.y = e.face; if (!e.boss && e.type !== 'spring' && e.st === 'move') e.g.position.y = Math.abs(Math.sin(t * 8 + e.x)) * .12;
      if (cb.mode === 'dark' && Math.hypot(P.x - e.x, P.z - e.z) > 40) { drop(e); e.dead = 1; }
    }
    cb.en = cb.en.filter(e => !e.dead); if (bossDead) return bossDown();
    for (const o of cb.orbs) { o.x += o.vx * dt; o.z += o.vz * dt; o.t -= dt; o.m.position.set(o.x, 1.2, o.z); if (Math.hypot(P.x - o.x, P.z - o.z) < 1.0) { hurt(1, o.x, o.z); o.t = 0; } } for (const o of cb.orbs) if (o.t <= 0) scene.remove(o.m); cb.orbs = cb.orbs.filter(o => o.t > 0);
    if (cb.mode === 'arena' && !cb.boss && cb.en.length === 0 && cb.round < 3) { cb.wait += dt; if (cb.wait > .6 && cb.wait < 99) { cb.wait = 99; const r = cb.round; cb.round++; s.rounds = Math.max(s.rounds, cb.round); addStars(2 + r); A.fanfare && A.fanfare(); banner('✔ Runde ' + (r + 1) + ' geschafft! +' + (2 + r) + ' ⭐', 2.2); persist(); setTimeout(() => { if (cb.on && cb.mode === 'arena') startRound(); }, 2400); } }
  };
  function bossDown() {
    const s = S(), first = !s.boss; s.boss = 1; end(); addStars(first ? 10 : 3); A.fanfare && A.fanfare(); if (first) G.earn && G.earn('wunsch_arena'); const c = W.spots.wArenaC;
    for (let k = 0; k < 6; k++) setTimeout(() => fx.burst(c.x + (Math.random() - .5) * 10, 2 + Math.random() * 4, c.z + (Math.random() - .5) * 10, 50, [[1, .9, .5], [1, .6, .9], [.5, .8, 1], [1, 1, 1]], 8, 1.6, 30, 4), k * 300);
    say(first ? '👑 UMBRA ist besiegt! Die Schattenarena strahlt – du bist der Held der Wunsch-Insel! +10 ⭐' : '👑 Umbra ist wieder besiegt! +3 ⭐', 7000); persist();
  }
  K.busy = () => false;
  K.log = function () {
    const s = S(), n = k => nPart(k) + '/' + nTot(k), rows = [
      { ok: !!s.visit, icon: '🌠', text: 'Wunsch-Insel besuchen (Holzbrücke an der Westküste des Schlüsselreichs)', dest: 'wunschinsel' },
      { ok: nFr() === 3, icon: '🌟', text: '3 Wunschfrüchte finden: ' + nFr() + ' von 3 (krumme Palme, hinter der Hütte, unter dem großen Baum)', dest: 'wunschinsel' },
      { ok: !!s.talk.sym, icon: '🌳', text: 'Das geheime Zeichen am großen Baum ansehen', dest: 'wunschinsel' },
      { ok: !!s.cave, icon: '🕳️', text: 'Geheime Schlucht: Kristall wecken und die 5 Wandzeichen in der richtigen Reihenfolge berühren', dest: 'wunsch_hoehle' },
      { ok: allParts(), icon: '🪵', text: 'Floß-Teile finden: 🪵 ' + n('holz') + ' · 🧵 ' + n('seil') + ' · ⛵ ' + n('segel'), dest: 'wunschinsel' },
      { ok: !!s.raft, icon: '🛶', text: 'Das Floß am Strand bauen', dest: 'wunschinsel' }, { ok: !!s.trial, icon: '🔴', text: 'Probefahrt mit dem Floß zur roten Boje', dest: 'wunschinsel' },
      { ok: !!s.tower, icon: '🗼', text: 'Den Aussichtsturm besteigen und durchs Fernrohr schauen', dest: 'wunsch_turm' }, { ok: s.chests.every(Boolean), icon: '📦', text: '3 versteckte Truhen öffnen: ' + s.chests.filter(Boolean).length + ' von 3 (Turm, zwei Felsen)', dest: 'wunsch_turm' },
      { ok: s.dark >= 2, icon: '🌑', text: 'Der Einbruch der Dunkelheit: 40 Sekunden gegen die Schattenwesen durchhalten (Hängematte, wenn alles andere fertig ist)', dest: 'wunschinsel' },
      { ok: s.rounds >= 3, icon: '🏟️', text: 'Schattenarena: 3 Runden gewinnen', dest: 'wunsch_arena' }, { ok: s.boss > 0, icon: '👹', text: 'Endgegner Umbra besiegen (Pfeiler-Trick!)', dest: 'wunsch_arena' },
      { ok: s.stars.every(Boolean), icon: '✨', text: '5 Sternscherben auf den Felsen sammeln: ' + s.stars.filter(Boolean).length + ' von 5', dest: 'wunschinsel' }];
    return { title: '🌠 Wunsch-Insel', count: rows.filter(r => r.ok).length + ' von ' + rows.length, rows };
  };
  K.cheatAll = function () { const s = S(); s.visit = 1; s.fruit = [1, 1, 1]; s.sym = 1; s.talk.sym = 1; s.light = 1; s.cave = 1; s.parts = [1, 1, 1, 1, 1, 1]; s.raft = 1; s.trial = 1; s.tower = 1; s.chests = [1, 1, 1]; s.stars = [1, 1, 1, 1, 1]; s.ham = 1; s.dark = 2; s.rounds = 3; s.boss = 1; const sch = save.schluessel || (save.schluessel = {}); sch.owned = sch.owned || [0]; if (!sch.owned.includes(5)) sch.owned.push(5); portal.visible = true; persist(); };
  K.dbg = { hitE, kill, cb, spawn, ET, startBoss, pillars, hurt, attack, dodge, special, S, buildRaft, chest, pressGlyph, glyphM, fruits, parts, stars, SYM, PERM, begin, endDark, startRound, people, stage, chestM, buoy };
  K.build();
  return K;
};
