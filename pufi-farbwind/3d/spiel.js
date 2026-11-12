/* Pufi & der Farbwind 3D – Spiellogik: Level, Physik, Pufi, Gegner, Boss, Kamera, Eingabe (Tastatur, Maus, Touch, Controller), Menüs.
 * Eigene Figuren und Welten; Genre-Anleihen (Flattersprung, Eier werfen, Sterne-Countdown) ohne fremde Namen oder Grafiken. */
(function () {
  'use strict';
  const T = window.THREE, G = window.PufiGrafik, K = window.PufiKlang, W = window.PufiWelten;
  const $ = id => document.getElementById(id);
  const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, f) => a + (b - a) * f;
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // ---------- Speicher ----------
  const SKEY = 'easygames.pufi-farbwind.3d', OKEY = 'easygames.pufi-farbwind.3d-opt';
  const load = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } };
  const save = load(SKEY, { unlocked: 1, best: {}, coins: 0 });
  const opt = load(OKEY, { music: 0.7, sfx: 0.85, quality: 'auto', invX: false, invY: false, sens: 1, autoCam: true, vib: true, sound: true });
  const store = () => { try { localStorage.setItem(SKEY, JSON.stringify(save)); localStorage.setItem(OKEY, JSON.stringify(opt)); } catch (e) { } };
  Object.assign(K.opt, { music: opt.music, sfx: opt.sfx, on: opt.sound });
  const quality = opt.quality === 'auto' ? (IS_TOUCH || (navigator.deviceMemory || 8) < 4 ? 'mittel' : 'hoch') : opt.quality;

  // ---------- Physik-Konstanten ----------
  const RUN = 8, GRAV = 32, JUMP = 12, RAD = 0.42, STEP = 0.55, HGT = 1.5, MAXEGG = 6;
  const SPRING = 19.5, SPRING_P = 24;

  // ---------- Szene ----------
  const canvas = $('gl');
  G.init(canvas, quality);
  const scene = G.scene, camera = G.camera;
  let prBase = Math.min(window.devicePixelRatio || 1, quality === 'hoch' ? 2 : quality === 'mittel' ? 1.5 : 1), prScale = 1;
  function resize() { G.resize(innerWidth, innerHeight, prBase * prScale * (S.retro ? 0.34 : 1)); }
  const pufi = G.makePufi(); scene.add(pufi);
  const shadowBlob = G.makeShadow(); scene.add(shadowBlob);
  const trail = G.makeTrail(16); scene.add(trail);
  const clouds = G.cloudLayer(18, 20, 150); scene.add(clouds);
  const PU = pufi.userData; scene.add(PU.tongue, PU.tip);   // Zunge in Weltkoordinaten (nicht als Kind von Pufi)

  // ---------- Zustand ----------
  const S = { mode: 'boot', view: '', li: 0, L: null, time: 0, lives: 5, retro: false, attract: true, banner: 0 };
  const P = {
    pos: new T.Vector3(), vel: new T.Vector3(), face: 0, ground: null, wasGround: false, coyote: 0, jumpBuf: 0, flutter: 1, fluttering: false, pound: 0, poundT: 0,
    tongue: null, mouth: null, eggs: [], aim: false, aimT: 0, inv: 0, stars: 10, baby: true, phase: 0, squash: 0, dead: 0, airT: 0, hist: [], cheer: 0, lastSafe: null, feder: 0, magnet: 0, rainbow: 0
  };
  // ---------- Level-Aufbau ----------
  const SHARED_GEO = new Set([G.coinGeo, G.starGeo, G.eggGeo]);
  const SHARED_MAT = new Set(Object.values(G.mats).flat());
  function disposeGroup(g) {
    g.traverse(o => {
      if (o.geometry && !SHARED_GEO.has(o.geometry)) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!SHARED_MAT.has(m)) m.dispose(); });
    });
  }
  function solidBox(x, y, z, w, h, d, kind, ref) { return { t: 'box', x0: x - w / 2, x1: x + w / 2, y0: y - h, y1: y, z0: z - d / 2, z1: z + d / 2, kind, ref, on: true, dx: 0, dy: 0, dz: 0 }; }
  function solidCyl(x, y, z, r, h, kind, ref) { return { t: 'cyl', x, z, r, y0: y - h, y1: y, kind, ref, on: true, dx: 0, dy: 0, dz: 0 }; }
  function moveSolid(s, dx, dy, dz) { s.dx = dx; s.dy = dy; s.dz = dz; if (s.t === 'box') { s.x0 += dx; s.x1 += dx; s.z0 += dz; s.z1 += dz; } else { s.x += dx; s.z += dz; } s.y0 += dy; s.y1 += dy; }
  // Inseln laufen nach unten spitz zu: Radius in der Tiefe dy unter der Oberkante (wie G.island)
  function rAt(s, y) {
    if (!s.taper) return s.r; const dy = s.y1 - y; if (dy <= 0.35) return s.r;
    const f = Math.min(1, (dy - 0.35) / Math.max(0.5, s.taper - 0.35)); return Math.max(0.15, s.r * (1.02 - 0.15 * f) * (1 - Math.pow(f, 2.2) * 0.92));
  }
  function inFoot(s, x, z, m) { return s.t === 'box' ? x >= s.x0 - m && x <= s.x1 + m && z >= s.z0 - m && z <= s.z1 + m : Math.hypot(x - s.x, z - s.z) <= s.r + m; }
  function pushOut(s, p, rad) {
    if (s.t === 'cyl') { const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz), R = rAt(s, Math.min(s.y1, p.y + HGT)) + rad; if (d >= R) return null; const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0; p.x = s.x + nx * R; p.z = s.z + nz * R; return [nx, nz]; }
    const cx = clamp(p.x, s.x0, s.x1), cz = clamp(p.z, s.z0, s.z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
    if (d >= rad) return null;
    if (d > 1e-4) { p.x = cx + dx / d * rad; p.z = cz + dz / d * rad; return [dx / d, dz / d]; }
    const pen = [[p.x - s.x0, -1, 0], [s.x1 - p.x, 1, 0], [p.z - s.z0, 0, -1], [s.z1 - p.z, 0, 1]].sort((a, b) => a[0] - b[0])[0];
    if (pen[1]) p.x = pen[1] < 0 ? s.x0 - rad : s.x1 + rad; else p.z = pen[2] < 0 ? s.z0 - rad : s.z1 + rad; return [pen[1], pen[2]];
  }
  function topBelow(x, y, z, m = 0) { let best = null; if (!S.L) return null; for (const s of S.L.solids) if (s.on && s.y1 <= y + 0.05 && inFoot(s, x, z, m) && (!best || s.y1 > best.y1)) best = s; return best; }

  function buildLevel(i) {
    if (S.L) { scene.remove(S.L.group); disposeGroup(S.L.group); }
    const def = W.LEVELS[i], th = def.theme, grp = new T.Group(); scene.add(grp);
    G.setTheme(th);
    const L = { def, i, group: grp, solids: [], items: [], enemies: [], lifts: [], crumbles: [], fblocks: [], winds: [], clouds: [], eggs: [], deco: [], eblocks: [], zone: null, boss: null, goal: null,
      signs: [], shots: [], counts: { red: 0, flowers: 0, coins: 0 }, totals: W.totals(def), switchT: 0, time: 0, done: false, bubble: null, check: new T.Vector3(...def.start), checkYaw: def.startYaw ?? Math.PI, rings: [] };
    S.L = L;
    const add = (o, x, y, z) => { o.position.set(x, y, z); grp.add(o); return o; };
    const grassSpots = [];
    const mkPlat = (o, hidden) => {
      const mat = o.mat === 'retro' ? G.mats.retro[o.tile || 0] : G.mats[o.mat] || G.mats.holz;   // holz, stein, honig, wolke, eis, kristall, moos …
      const geo = o.mat === 'retro' ? G.boxUV(o.w, o.h, o.d, 1.5) : G.roundBox(o.w, o.h, o.d, o.mat === 'wolke' ? 0.35 : 0.16);
      const mesh = new T.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; add(mesh, o.x, o.y, o.z);
      const s = solidBox(o.x, o.y, o.z, o.w, o.h, o.d, o.k, { o, mesh }); L.solids.push(s);
      if (o.mat === 'wolke') { const puff = new T.Group(); for (let k = 0; k < 4; k++) { const b = new T.Mesh(new T.SphereGeometry(0.5, 12, 8), G.mats.wolke); b.position.set((Math.random() - 0.5) * o.w, -o.h * 0.6, (Math.random() - 0.5) * o.d); b.scale.set(1.4, 0.7, 1.2); puff.add(b); } mesh.add(puff); }
      if (hidden) { s.on = false; mesh.visible = false; }
      return s;
    };
    const def2 = def.items;
    def2.forEach(o => {
      switch (o.k) {
        case 'insel': {
          const g = G.island(o.r, o.h, th); add(g, o.x, o.y, o.z); { const sc = solidCyl(o.x, o.y, o.z, o.r, o.h, 'insel', { o }); sc.taper = o.h; L.solids.push(sc); } if (G.theme.grassOn) grassSpots.push(o);
          break;
        }
        case 'plat': mkPlat(o); break;
        case 'broeckel': { const s = mkPlat(Object.assign({}, o, { mat: 'broeckel' })); s.kind = 'broeckel'; L.crumbles.push({ s, o, t: -1, back: 0, mesh: s.ref.mesh, home: s.ref.mesh.position.clone() }); break; }
        case 'farbblock': { const s = mkPlat(Object.assign({}, o, { mat: 'farb' })); s.on = false; s.ref.mesh.material = G.mats.farb; s.ref.mesh.castShadow = false; L.fblocks.push(s); break; }
        case 'lift': { const s = mkPlat(o); s.kind = 'lift'; L.lifts.push({ s, o, mesh: s.ref.mesh, last: new T.Vector3(o.x, o.y, o.z) }); break; }
        case 'pilz': { const m = G.makePilz(); add(m, o.x, o.y, o.z); L.solids.push(solidCyl(o.x, o.y + 0.95, o.z, 0.95, 0.95, 'pilz', { o, mesh: m })); break; }
        case 'eiblock': { const m = G.makeEiblock(); add(m, o.x, o.y, o.z); L.solids.push(solidBox(o.x, o.y + 0.5, o.z, 1, 1, 1, 'eiblock', { o, mesh: m, bump: 0 })); L.eblocks.push(m); break; }
        case 'wolke': {
          const m = G.makeWolke(); add(m, o.x, o.y, o.z); const c = { o, mesh: m, done: false, extra: [] };
          if (o.gibt === 'bruecke') o.extra.forEach(e => c.extra.push(mkPlat(e, true)));
          L.clouds.push(c); break;
        }
        case 'wind': { const m = G.makeWindColumn(o.r, o.h); add(m, o.x, o.y, o.z); L.winds.push(Object.assign(o, { mesh: m, on: true })); break; }
        case 'schalter': { const m = G.makeSchalter(); add(m, o.x, o.y, o.z); L.solids.push(solidCyl(o.x, o.y + 0.6, o.z, 0.85, 0.6, 'schalter', { o, mesh: m })); L.switchObj = m; break; }
        case 'retrozone': {
          const dx = o.bx - o.ax, dz = o.bz - o.az, len = Math.hypot(dx, dz); L.zone = Object.assign({}, o, { dx: dx / len, dz: dz / len, len, yaw: Math.atan2(-dz / len, dx / len) });
          const t = topBelow(o.ax, 50, o.az, 0.5); const gate = G.makePortal(); add(gate, o.ax + L.zone.dx * 0.6, t ? t.y1 : 0, o.az + L.zone.dz * 0.6); gate.rotation.y = Math.atan2(L.zone.dx, L.zone.dz) + Math.PI / 2; break;
        }
        case 'muenze': case 'rot': case 'stern': case 'bluete': {
          const m = o.k === 'muenze' ? G.makeCoin(false) : o.k === 'rot' ? G.makeCoin(true) : o.k === 'stern' ? G.makeStar() : G.makeFlower();
          add(m, o.x, o.y, o.z); L.items.push({ k: o.k, mesh: m, pos: m.position, taken: false, ph: Math.random() * TAU }); break;
        }
        case 'ring': { const m = G.makeRing(); add(m, o.x, o.y, o.z); L.rings.push({ o, mesh: m, used: false }); break; }
        case 'ziel': { const m = G.makeGoal(); add(m, o.x, o.y, o.z); L.goal = { o, mesh: m, on: !def.boss }; m.visible = !def.boss; break; }
        case 'muffel': case 'flatter': case 'igel': case 'schnapp': case 'hupfer': case 'spucker': case 'wirbel': case 'nebli': case 'rutscher': spawnEnemy(o.k, o); break;
        case 'boss': { const m = G.makeBoss(o.col); add(m, o.x, o.y, o.z); const hp = o.hp || 3; L.boss = { o, mesh: m, hp, max: hp, name: o.name || 'Brummnebel', state: 'wait', t: 0, pos: m.position, home: new T.Vector3(o.x, o.y, o.z), ang: 0, wave: -1, minT: 2 }; break; }
        case 'herz': case 'feder': case 'magnet': case 'regen': {
          const m = o.k === 'herz' ? G.makeHerz() : o.k === 'feder' ? G.makeFeder() : o.k === 'magnet' ? G.makeMagnet() : G.makeRegenbogen();
          add(m, o.x, o.y, o.z); L.items.push({ k: o.k, mesh: m, pos: m.position, taken: false, ph: Math.random() * TAU }); break;
        }
        case 'tafel': { const m = G.makeTafel(); add(m, o.x, o.y, o.z); m.rotation.y = 0.25; L.solids.push(solidCyl(o.x, o.y + 1.2, o.z, 0.15, 1.2, 'deko', {})); L.signs.push({ o, mesh: m, cool: 0 }); break; }
        case 'deko': {
          const t = o.typ, sc = o.s || 1, mk = { baum: () => G.makeTree(sc, th), busch: () => G.makeBush(sc, th), fels: () => G.makeRock(sc, th), tanne: () => G.makeTanne(sc), palme: () => G.makePalme(sc), kristall: () => G.makeKristall(sc, th === 'glut' ? '#ff8a4a' : th === 'eis' ? '#9fe6ff' : '#9a8aff'),
            riesenpilz: () => G.makeRiesenpilz(sc, ['#ff7a5a', '#7ab8ff', '#ffb84a'][Math.abs(Math.round(o.x)) % 3]), laterne: () => G.makeLaterne(sc), blumen: () => G.makeBlumen(sc), schneemann: () => G.makeSchneemann(sc), saeule: () => G.makeSaeule(sc, th) }[t];
          if (!mk) break; add(mk(), o.x, o.y, o.z).rotation.y = o.x * 1.3 + o.z;
          const col = { baum: [0.35, 2.2], tanne: [0.3, 1.2], palme: [0.28, 3], riesenpilz: [0.4, 2.2], laterne: [0.12, 2.2], schneemann: [0.55, 1.6], saeule: [0.45, 3.2], fels: [0.85, 1], kristall: [0.5, 1.6] }[t];
          if (col) L.solids.push(solidCyl(o.x, o.y + col[1] * sc, o.z, col[0] * sc, col[1] * sc, t === 'fels' ? 'fels' : 'deko', {}));
          if (t === 'riesenpilz') L.solids.push(solidCyl(o.x, o.y + 2.85 * sc, o.z, 1.35 * sc, 0.5 * sc, 'plat', { o }));
          break;
        }
        case 'baum': add(G.makeTree(o.s, th), o.x, o.y, o.z).rotation.y = o.x * 1.7; L.solids.push(solidCyl(o.x, o.y + 2.2 * o.s, o.z, 0.35 * o.s, 2.2 * o.s, 'deko', {})); break;
        case 'busch': add(G.makeBush(o.s, th), o.x, o.y, o.z).rotation.y = o.z; break;
        case 'fels': add(G.makeRock(o.s, th), o.x, o.y, o.z).rotation.y = o.x; L.solids.push(solidCyl(o.x, o.y + 0.9 * o.s, o.z, 0.85 * o.s, 1, 'fels', {})); break;
      }
    });
    const gc = quality === 'hoch' ? 9000 : quality === 'mittel' ? 3500 : 0;
    if (gc && grassSpots.length) { const gf = G.grassField(grassSpots, gc); if (gf) grp.add(gf); }
    // Ferne Inseln als Kulisse
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + i, r = 140 + (k % 3) * 40, isl = G.island(14 + (k % 3) * 8, 18, th); isl.position.set(Math.cos(a) * r, -4 + (k % 4) * 6, Math.sin(a) * r - 40); grp.add(isl); }
    // Spieler an den Start
    resetPlayer(L.check, def.startYaw ?? Math.PI, true);
    S.retro = false; document.body.classList.remove('retro'); K.setRetro(false);
    return L;
  }
  // Gegnerwerte: Radius, Höhe, essbar (Zunge), Draufspringen besiegt
  const ENEMY = {
    muffel: { r: 0.55, h: 1.1, edible: true, stomp: true }, flatter: { r: 0.55, h: 0.7, edible: true, stomp: true }, igel: { r: 0.75, h: 1.1, edible: false, stomp: false },
    schnapp: { r: 0.6, h: 1.8, edible: false, stomp: false }, hupfer: { r: 0.55, h: 1.1, edible: true, stomp: true }, spucker: { r: 0.6, h: 1.6, edible: false, stomp: true },
    wirbel: { r: 0.65, h: 1.3, edible: false, stomp: false }, nebli: { r: 0.5, h: 1.0, edible: true, stomp: true }, rutscher: { r: 0.55, h: 1.1, edible: true, stomp: true }
  };
  function enemyMesh(k, i = 0) {
    return k === 'muffel' ? G.makeMuffel(i) : k === 'flatter' ? G.makeFlatter() : k === 'igel' ? G.makeIgel() : k === 'schnapp' ? G.makeSchnapp() : k === 'hupfer' ? G.makeHupfer() :
      k === 'spucker' ? G.makeSpucker() : k === 'wirbel' ? G.makeWirbel() : k === 'nebli' ? G.makeNebli() : G.makeRutscher();
  }
  function spawnEnemy(k, o) {
    const L = S.L; let m;
    m = enemyMesh(k, L.enemies.length);
    m.position.set(o.x, o.y, o.z); L.group.add(m);
    const D = ENEMY[k];
    const e = { k, o, mesh: m, pos: m.position, base: new T.Vector3(o.x, o.y, o.z), alive: true, t: Math.random() * 10, r: D.r, h: D.h,
      edible: D.edible, stomp: D.stomp, ang: Math.random() * TAU, state: 'walk', squash: 0, face: 0, cd: 1 + Math.random() * 2, hop: null, stun: 0 };
    L.enemies.push(e); return e;
  }
  function resetPlayer(pos, yaw, full) {
    P.pos.copy(pos); P.vel.set(0, 0, 0); P.face = yaw; P.ground = null; P.pound = 0; P.tongue = null; P.aim = false; P.inv = full ? 0 : 1.5; P.flutter = 1; P.dead = 0; P.feder = P.magnet = P.rainbow = 0;
    P.hist = []; if (full) { P.mouth = null; } P.baby = true; P.stars = Math.max(P.stars, 10); if (full) P.stars = 10;
    cam.yaw = yaw + Math.PI; cam.pitch = 0.32; cam.ty = pos.y + 1.3; cam.tx = pos.x; cam.tz = pos.z; cam.manual = 0;
    if (S.L && S.L.bubble) { S.L.group.remove(S.L.bubble.mesh); disposeGroup(S.L.bubble.mesh); S.L.bubble = null; }
  }

  // ---------- Eingabe ----------
  const keys = new Set();
  const IN = { mx: 0, my: 0, lx: 0, ly: 0, jump: false, tongue: false, throw: false, pound: false, cam: false, pause: false, music: false, zoom: 0 };
  const prev = {}; const edge = {};
  const touch = { mx: 0, my: 0, lx: 0, ly: 0, btn: {} };
  const mouse = { lx: 0, ly: 0 };
  const forced = {};   // Testschnittstelle
  let lastDevice = IS_TOUCH ? 'touch' : 'keys';
  addEventListener('keydown', e => {
    if (e.target && e.target.matches && e.target.matches('input[type=text],textarea')) return;
    K.init();
    if (S.mode === 'boot') { e.preventDefault(); toTitle(); return; }
    if (!$('screen').hidden) { menuKey(e); return; }
    keys.add(e.code); lastDevice = 'keys'; setTouchUI();
    if (/^(Arrow|Space|Tab)/.test(e.code)) e.preventDefault();
    if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat && S.mode === 'play') openPause();
    if (e.code === 'KeyM' && !e.repeat) toggleSound();
    if (e.code === 'KeyF' && !e.repeat) toggleFull();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => { keys.clear(); touch.btn = {}; touch.mx = touch.my = 0; if (S.mode === 'play') openPause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'play') openPause(); });
  // Maus: ziehen = Kamera, Rad = Zoom
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    K.init();
    if (S.mode === 'boot') { toTitle(); return; }
    if (e.pointerType === 'touch') { if (e.clientX < innerWidth * 0.42) return; lastDevice = 'touch'; setTouchUI(); }
    if (drag) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { canvas.setPointerCapture(e.pointerId); } catch (x) { }
  });
  canvas.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; const k = e.pointerType === 'touch' ? 0.009 : 0.005; mouse.lx += (e.clientX - drag.x) * k; mouse.ly += (e.clientY - drag.y) * k; drag.x = e.clientX; drag.y = e.clientY; });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => canvas.addEventListener(t, e => { if (drag && drag.id === e.pointerId) drag = null; }));
  canvas.addEventListener('wheel', e => { cam.zoom = clamp(cam.zoom + Math.sign(e.deltaY) * 0.08, 0.65, 1.5); }, { passive: true });
  $('boot').addEventListener('pointerdown', () => { K.init(); toTitle(); });
  // Touch: Stick links, Knöpfe rechts
  const stickZone = $('stickZone'), stickBase = $('stickBase'), knob = $('stickKnob'); let stickId = null, sx = 0, sy = 0;
  stickZone.addEventListener('pointerdown', e => { e.preventDefault(); K.init(); lastDevice = 'touch'; if (stickId !== null) return; stickId = e.pointerId; stickZone.setPointerCapture(e.pointerId); const r = stickZone.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; stickBase.style.left = (sx - r.left) + 'px'; stickBase.style.top = (sy - r.top) + 'px'; stickBase.classList.add('active'); });
  stickZone.addEventListener('pointermove', e => { if (e.pointerId !== stickId) return; let dx = (e.clientX - sx) / 45, dy = (e.clientY - sy) / 45; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } touch.mx = dx; touch.my = dy; knob.style.transform = `translate(${dx * 32}px,${dy * 32}px)`; });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => stickZone.addEventListener(t, e => { if (e.pointerId !== stickId) return; stickId = null; touch.mx = touch.my = 0; knob.style.transform = ''; stickBase.classList.remove('active'); }));
  document.querySelectorAll('#touch [data-act]').forEach(b => {
    const act = b.dataset.act; let id = null;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); K.init(); id = e.pointerId; try { b.setPointerCapture(id); } catch (x) { } touch.btn[act] = true; b.classList.add('pressed'); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => b.addEventListener(t, e => { if (e.pointerId !== id) return; id = null; touch.btn[act] = false; b.classList.remove('pressed'); }));
  });
  function setTouchUI() { const on = lastDevice === 'touch' && S.mode === 'play'; $('touch').hidden = !on; document.body.classList.toggle('touch', lastDevice === 'touch'); }
  let padPrev = [];
  function readPad() {
    let pads = []; try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { }
    for (const p of pads) if (p && p.connected !== false && p.buttons && p.buttons.length >= 4) return p;
    return null;
  }
  function sample(dt) {
    const pad = readPad(), b = i => !!(pad && pad.buttons[i] && pad.buttons[i].pressed), ax = i => { const v = pad && pad.axes[i] || 0; return Math.abs(v) > 0.18 ? (v - Math.sign(v) * 0.18) / 0.82 : 0; };
    const k = c => keys.has(c);
    if (pad && pad.buttons.some(x => x.pressed)) { if (lastDevice !== 'pad') { lastDevice = 'pad'; setTouchUI(); } }
    let mx = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0) + touch.mx + ax(0) + (b(15) ? 1 : 0) - (b(14) ? 1 : 0);
    let my = (k('KeyS') || k('ArrowDown') ? 1 : 0) - (k('KeyW') || k('ArrowUp') ? 1 : 0) + touch.my + ax(1) + (b(13) ? 1 : 0) - (b(12) ? 1 : 0);
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
    IN.mx = forced.mx !== undefined ? forced.mx : mx; IN.my = forced.my !== undefined ? forced.my : my;
    const sens = opt.sens * (opt.invX ? -1 : 1), sensY = opt.sens * (opt.invY ? -1 : 1);
    IN.lx = (ax(2) * 2.6 + ((k('KeyE') ? 1 : 0) - (k('KeyQ') ? 1 : 0)) * 2.2) * dt * sens + mouse.lx * sens;
    IN.ly = ax(3) * 1.6 * dt * sensY + mouse.ly * sensY; mouse.lx = mouse.ly = 0;
    const H = {
      jump: k('Space') || k('KeyK') && false || touch.btn.jump || b(0),
      tongue: k('KeyX') || k('KeyJ') || touch.btn.tongue || b(2),
      throw: k('KeyC') || k('KeyK') || touch.btn.throw || b(1) || b(5) || b(7),
      pound: k('KeyV') || k('KeyL') || k('ShiftLeft') || k('ShiftRight') || touch.btn.pound || b(3) || b(4),
      cam: k('KeyR') || touch.btn.cam || b(6) || b(10),
      pause: b(9), music: b(8)
    };
    for (const n in H) { const v = forced[n] !== undefined ? forced[n] : H[n]; edge[n] = v && !prev[n]; IN[n] = v; prev[n] = v; }
    if (edge.pause && S.mode === 'play') openPause();
    if (edge.music) toggleSound();
    padPrev = pad ? pad.buttons.map(x => x.pressed) : [];
    return pad;
  }
  function rumble(ms, strong = 0.5) {
    if (!opt.vib) return;
    const pad = readPad(); try { if (pad && pad.vibrationActuator) pad.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: strong * 0.6 }); } catch (e) { }
    if (lastDevice === 'touch') K.vibrate(Math.min(60, ms));
  }

  // ---------- Kamera ----------
  const cam = { yaw: Math.PI, pitch: 0.32, dist: 8.5, zoom: 1, tx: 0, ty: 0, tz: 0, manual: 9, snap: 0, zoneW: 0 };
  function updateCam(dt) {
    const L = S.L; if (!L) return;
    if (Math.abs(IN.lx) > 1e-4 || Math.abs(IN.ly) > 1e-4) cam.manual = 0; else cam.manual += dt;
    cam.yaw -= IN.lx; cam.pitch = clamp(cam.pitch + IN.ly, -0.15, 1.2);
    if (edge.cam) cam.snap = 0.35;
    const behind = P.face + Math.PI, sp = Math.hypot(P.vel.x, P.vel.z) / RUN;
    if (cam.snap > 0) { cam.snap -= dt; cam.yaw += angDiff(cam.yaw, behind) * Math.min(1, dt * 12); }
    else if (opt.autoCam && cam.manual > 1.4 && sp > 0.3 && !P.aim) { const d = angDiff(cam.yaw, behind); if (Math.abs(d) < 2.3) cam.yaw += d * Math.min(1, dt * 0.9 * sp); }
    // Retro-Zone: feste Seitenansicht
    const inZ = zoneInfo(); cam.zoneW = lerp(cam.zoneW, inZ ? 1 : 0, Math.min(1, dt * 3));
    let yaw = cam.yaw, pitch = cam.pitch, dist = cam.dist * cam.zoom;
    if (L.zone && cam.zoneW > 0.01) { yaw = cam.yaw + angDiff(cam.yaw, L.zone.yaw) * cam.zoneW; pitch = lerp(pitch, 0.12, cam.zoneW); dist = lerp(dist, 12.5, cam.zoneW); if (cam.zoneW > 0.98) cam.yaw = L.zone.yaw; }
    if (L.boss && L.boss.state !== 'wait' && L.boss.state !== 'gone') dist = Math.max(dist, 11);
    // Ziel: Spieler, vertikal ruhiger (folgt beim Springen erst später)
    cam.tx = lerp(cam.tx, P.pos.x, Math.min(1, dt * 9)); cam.tz = lerp(cam.tz, P.pos.z, Math.min(1, dt * 9));
    const wantY = P.pos.y + 1.3, grounded = P.ground || P.pos.y + 1.3 < cam.ty - 1.2 || P.pos.y + 1.3 > cam.ty + 3.5 || inZ;
    if (grounded) cam.ty = lerp(cam.ty, wantY, Math.min(1, dt * (P.pos.y + 1.3 < cam.ty ? 7 : 4)));
    const cy = Math.cos(pitch);
    // Kamera-Kollision: nicht durch Inseln, Plattformen oder Wände schauen
    if (!inZ) { const free = camFree(cam.tx, cam.ty + 0.4, cam.tz, Math.sin(yaw) * cy, (Math.sin(pitch) * dist + 0.2) / dist, Math.cos(yaw) * cy, dist); cam.cd = free < (cam.cd ?? dist) ? free : lerp(cam.cd ?? dist, free, Math.min(1, dt * 2.5)); dist = Math.min(dist, cam.cd); } else cam.cd = dist;
    camera.position.set(cam.tx + Math.sin(yaw) * cy * dist, cam.ty + Math.sin(pitch) * dist + 0.6, cam.tz + Math.cos(yaw) * cy * dist);
    const minY = (G.theme ? G.theme.fluidY : -2) + 0.8; if (camera.position.y < minY) camera.position.y = minY;
    camera.lookAt(cam.tx, cam.ty + 0.4, cam.tz);
    S.camYaw = yaw;
  }
  function camHit(x, y, z) {
    for (const s of S.L.solids) {
      if (!s.on || s.kind === 'deko' || s.kind === 'fels' || s.kind === 'eiblock' || s.kind === 'pilz' || s.kind === 'schalter' || y > s.y1 + 0.3 || y < s.y0 - 0.3) continue;
      if (s.t === 'box') { if (x > s.x0 - 0.3 && x < s.x1 + 0.3 && z > s.z0 - 0.3 && z < s.z1 + 0.3) return true; }
      else if (Math.hypot(x - s.x, z - s.z) < rAt(s, y) + 0.3) return true;
    }
    return false;
  }
  function camFree(x, y, z, dx, dy, dz, dist) {
    for (let k = 1; k <= 10; k++) { const f = k / 10 * dist; if (camHit(x + dx * f, y + dy * f, z + dz * f)) return Math.max(2.2, (k - 1) / 10 * dist); }
    return dist;
  }
  function zoneInfo() {
    const z = S.L && S.L.zone; if (!z) return null;
    const px = P.pos.x - z.ax, pz = P.pos.z - z.az, f = (px * z.dx + pz * z.dz), perp = -px * z.dz + pz * z.dx;
    if (f < 0.3 || f > z.len - 0.3 || Math.abs(perp) > z.w + 0.6) return null;
    return { f, perp };
  }

  // ---------- Spieler ----------
  function update(dt) {
    const L = S.L; if (!L) return;
    L.time += dt; S.time += dt;
    G.timeU.value += dt;
    updateWorld(dt);
    if (S.mode === 'play') updatePlayer(dt);
    else if (S.mode === 'clearAnim') { P.cheer += dt; P.vel.set(0, P.vel.y, 0); physics(dt); }
    updateEnemies(dt); updateShots(dt);
    updateEggs(dt);
    if (L.boss) updateBoss(dt);
    updatePufiMesh(dt);
  }
  function updatePlayer(dt) {
    const L = S.L;
    if (P.dead > 0) { P.dead -= dt; P.vel.y -= GRAV * dt * 0.4; P.pos.addScaledVector(P.vel, dt); if (P.dead <= 0) loseLife(); return; }
    P.inv = Math.max(0, P.inv - dt);
    // Bewegung relativ zur Kamera
    const yaw = S.camYaw || cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    let wx = rx * IN.mx - fx * IN.my, wz = rz * IN.mx - fz * IN.my;
    const zi = zoneInfo();
    if (zi) { const z = L.zone, d = wx * z.dx + wz * z.dz; wx = z.dx * d; wz = z.dz * d; P.pos.x -= -z.dz * zi.perp * Math.min(1, dt * 8); P.pos.z -= z.dx * zi.perp * Math.min(1, dt * 8); }
    if (!!zi !== S.retro) setRetro(!!zi);
    const mag = Math.min(1, Math.hypot(wx, wz));
    let top = RUN * mag * (P.aim ? 0.45 : 1) * (P.pound ? 0 : 1) * (P.rainbow > 0 ? 1.25 : 1);
    const tvx = mag > 0.01 ? wx / Math.max(mag, 1e-3) * top : 0, tvz = mag > 0.01 ? wz / Math.max(mag, 1e-3) * top : 0;
    const icy = P.ground && P.ground.ref && P.ground.ref.o && P.ground.ref.o.mat === 'eis';
    const acc = P.ground ? (icy ? (mag > 0.01 ? 9 : 3.5) : mag > 0.01 ? 42 : 34) : 16;
    P.vel.x += clamp(tvx - P.vel.x, -acc * dt, acc * dt); P.vel.z += clamp(tvz - P.vel.z, -acc * dt, acc * dt);
    if (P.aim) P.face += angDiff(P.face, Math.atan2(fx, fz)) * Math.min(1, dt * 12);
    else if (mag > 0.1) P.face += angDiff(P.face, Math.atan2(wx, wz)) * Math.min(1, dt * 14);
    // Springen, Flattern, Stampfen
    if (edge.jump) P.jumpBuf = 0.14; else P.jumpBuf = Math.max(0, P.jumpBuf - dt);
    if (P.ground) { P.coyote = 0.11; P.flutter = 1; } else P.coyote = Math.max(0, P.coyote - dt);
    if (P.jumpBuf > 0 && P.coyote > 0 && !P.pound) { P.vel.y = JUMP; P.ground = null; P.coyote = 0; P.jumpBuf = 0; P.squash = -0.25; K.sfx('jump'); G.dust(P.pos.x, P.pos.y, P.pos.z, 6); }
    P.fluttering = false;
    if (!P.ground && P.flutter < 1) P.flutter = Math.max(0, P.flutter - dt * (P.feder > 0 ? 0.35 : 1));
    if (!P.ground && IN.jump && !P.pound && P.vel.y < 1 && P.flutter > 0 && P.airT > 0.12) {
      if (P.flutter >= 1) P.flutter = 0.999;
      P.fluttering = true; P.vel.y = Math.min(P.feder > 0 ? 2 : 1.2, P.vel.y + (GRAV * 0.9 + 22 * P.flutter) * dt);
      if (Math.floor(L.time * 9) !== Math.floor((L.time - dt) * 9)) { K.sfx('flutter'); G.dust(P.pos.x, P.pos.y + 0.2, P.pos.z, 2, '#ffffff', 1.2); }
    }
    if (edge.pound) {
      if (!P.ground && !P.pound) { P.pound = 1; P.poundT = 0.22; P.vel.set(0, 0, 0); K.sfx('pound'); }
      else if (P.ground && P.mouth) layEgg();
    }
    if (P.pound === 1) { P.poundT -= dt; P.vel.set(0, 0, 0); if (P.poundT <= 0) { P.pound = 2; P.vel.y = -28; } }
    // Zunge
    if (edge.tongue && !P.tongue && !P.pound) { if (P.mouth) spit(); else startTongue(); }
    if (P.tongue) updateTongue(dt);
    // Eier zielen und werfen
    if (edge.throw) {
      if (P.aim) throwEgg();
      else if (P.eggs.length) { P.aim = true; P.aimT = 0; }
      else toast(P.mouth ? 'Mit Y (Stampfen) aus dem Gefangenen ein Ei legen!' : 'Keine Eier! Fang Muffel mit der Zunge (X) oder stoß einen Eierblock an.', 2.4);
    }
    if (P.aim) { P.aimT += dt; if (!IN.throw && P.aimT > 0.28) throwEgg(); }
    physics(dt);
    // Wasser/Lava
    if (P.pos.y < G.theme.fluidY - 0.5) { K.sfx('splash'); G.burst(P.pos.x, G.theme.fluidY, P.pos.z, 20, G.theme.fluid === 'lava' ? '#ffb040' : '#ffffff', 6, 0.6); die(); }
    // Ei-Spur
    const h = P.hist; if (!h.length || h[0].distanceTo(P.pos) > 0.14) { h.unshift(P.pos.clone()); if (h.length > 80) h.pop(); }
    // Einsammeln
    const cx = P.pos.x, cy = P.pos.y + 0.75, cz = P.pos.z;
    for (const it of L.items) if (!it.taken && Math.hypot(it.pos.x - cx, it.pos.y - cy, it.pos.z - cz) < (BIG_ITEM.has(it.k) ? 1.4 : 1.1)) collect(it);
    for (const r of L.rings) if (!r.used && Math.hypot(r.mesh.position.x - cx, r.mesh.position.y - cy, r.mesh.position.z - cz) < 1.8) useRing(r);
    if (L.goal && L.goal.on && !L.done && Math.hypot(L.goal.mesh.position.x - cx, L.goal.mesh.position.z - cz) < 1.9 && Math.abs(L.goal.mesh.position.y - P.pos.y) < 2.5) finishLevel();
    // Windsäulen
    let windNear = 0;
    for (const w of L.winds) { if (w.on === false) continue; const d = Math.hypot(P.pos.x - w.x, P.pos.z - w.z); windNear = Math.max(windNear, 1 - d / 12); if (d < w.r + 0.2 && P.pos.y > w.y - 1 && P.pos.y < w.y + w.h) { P.vel.y = Math.min(10, P.vel.y + 58 * dt); P.flutter = 1; P.pound = 0; if (Math.random() < 0.4) G.particles.emit(P.pos.x + (Math.random() - 0.5) * 2, P.pos.y, P.pos.z + (Math.random() - 0.5) * 2, 0, 6, 0, 0.5, 0.4, 1, 1, 1, 0.8, 0); } }
    K.wind(windNear);
    // Hilfen: Zeitwerte, Magnet, Regenbogen, Hinweistafeln
    if (P.feder > 0) { P.feder -= dt; if (Math.random() < 0.3) G.particles.emit(P.pos.x, P.pos.y + 0.8, P.pos.z, 0, 0.5, 0, 0.6, 0.3, 0.6, 0.9, 1, 0.9, 0); }
    if (P.magnet > 0) { P.magnet -= dt; for (const it of L.items) if (!it.taken && (it.k === 'muenze' || it.k === 'rot' || it.k === 'stern')) { const d = Math.hypot(it.pos.x - cx, it.pos.y - cy, it.pos.z - cz); if (d < 7) it.pos.lerp(new T.Vector3(cx, cy, cz), Math.min(1, dt * 6 / Math.max(0.5, d * 0.4))); } }
    if (P.rainbow > 0) { P.rainbow -= dt; P.inv = Math.max(P.inv, 0); if (Math.random() < 0.8) { const c = new T.Color().setHSL((S.time * 2) % 1, 1, 0.65); G.particles.emit(P.pos.x, P.pos.y + 0.7, P.pos.z, 0, 0.6, 0, 0.6, 0.45, c.r, c.g, c.b, 1, 0); } if (P.rainbow <= 0) K.playMusic(G.theme.music); }
    for (const sg of L.signs) { sg.cool -= dt; if (sg.cool <= 0 && Math.hypot(sg.o.x - P.pos.x, sg.o.z - P.pos.z) < 2.4 && Math.abs(sg.o.y - P.pos.y) < 2) { sg.cool = 9; toast('💡 ' + sg.o.text, 3.6); K.sfx('select'); } }
    // Tamo-Blase
    updateBubble(dt);
  }
  function physics(dt) {
    const L = S.L, steps = Math.max(1, Math.ceil(Math.hypot(P.vel.x, P.vel.y, P.vel.z) * dt / 0.25));
    const h = dt / steps, wasAir = !P.ground;
    // Mitfahren auf Lift/Bröckel
    if (P.ground && P.ground.on) { P.pos.x += P.ground.dx; P.pos.y += P.ground.dy; P.pos.z += P.ground.dz; }
    if (P.ground && !P.ground.on) P.ground = null;
    let landed = null, bonked = null;
    for (let s = 0; s < steps; s++) {
      if (!P.ground || P.vel.y > 0) P.vel.y = Math.max(-30, P.vel.y - (P.pound === 1 ? 0 : GRAV) * h);
      const prevY = P.pos.y;
      P.pos.x += P.vel.x * h; P.pos.z += P.vel.z * h;
      for (const sd of L.solids) {
        if (!sd.on || P.pos.y >= sd.y1 - 0.08 || P.pos.y + HGT <= sd.y0 + 0.02) continue;
        const rise = sd.y1 - P.pos.y;
        if (rise <= STEP && (P.ground || P.vel.y <= 0) && sd.kind !== 'eiblock') {   // kleine Stufe: hochsteigen
          if (inFoot(sd, P.pos.x, P.pos.z, RAD * 0.55)) { P.pos.y = sd.y1; P.vel.y = Math.max(0, P.vel.y); if (!P.ground) landed = sd; P.ground = sd; }
          continue;
        }
        pushOut(sd, P.pos, RAD);
      }
      P.pos.y += P.vel.y * h;
      if (P.vel.y <= 0) {
        let best = null;
        for (const sd of L.solids) if (sd.on && inFoot(sd, P.pos.x, P.pos.z, RAD * 0.55) && P.pos.y <= sd.y1 + 0.02 && prevY >= sd.y1 - 0.3 - Math.abs(P.vel.y * h) && (!best || sd.y1 > best.y1)) best = sd;
        if (best) { P.pos.y = best.y1; if (!P.ground) landed = best; P.ground = best; P.vel.y = 0; }
        else if (P.ground) {   // Kante verlassen?
          if (!(P.ground.on && inFoot(P.ground, P.pos.x, P.pos.z, RAD * 0.55) && Math.abs(P.pos.y - P.ground.y1) < 0.3)) P.ground = null; else { P.pos.y = P.ground.y1; P.vel.y = 0; }
        }
      } else {
        P.ground = null;
        for (const sd of L.solids) if (sd.on && inFoot(sd, P.pos.x, P.pos.z, RAD * 0.3) && P.pos.y + HGT > sd.y0 && prevY + HGT <= sd.y0 + 0.05) { P.pos.y = sd.y0 - HGT; P.vel.y = -1; bonked = sd; break; }
      }
    }
    if (P.ground) { P.airT = 0; if (P.ground.kind === 'insel' || P.ground.kind === 'plat') P.lastSafe = P.pos.clone(); } else P.airT += dt;
    if (landed && wasAir) onLand(landed);
    if (bonked) onBonk(bonked);
  }
  function onLand(s) {
    const L = S.L, v = P.pound === 2;
    P.squash = v ? 0.45 : 0.25;
    if (s.kind === 'pilz') { P.vel.y = v ? SPRING_P : SPRING; P.ground = null; P.pound = 0; P.flutter = 1; K.sfx('spring'); s.ref.mesh.userData.cap.scale.y = 0.25; rumble(80, 0.3); G.burst(P.pos.x, P.pos.y, P.pos.z, 14, '#ff9cc7', 5, 0.5); return; }
    if (s.kind === 'schalter') pressSwitch(s);
    if (s.kind === 'broeckel') { const c = L.crumbles.find(c => c.s === s); if (c && c.t < 0) { c.t = 0.75; K.sfx('crumble'); } }
    if (v) {
      P.pound = 0; K.sfx('poundland'); rumble(140, 0.8); shake(0.35); G.ringWave(P.pos.x, P.pos.y, P.pos.z, 7, '#ffffff'); G.dust(P.pos.x, P.pos.y, P.pos.z, 16, '#f0e4d0', 4);
      for (const e of L.enemies) if (e.alive && Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 2.8 && Math.abs(e.pos.y - P.pos.y) < 1.5 && e.k !== 'schnapp') killEnemy(e, true);
      for (const sd of L.solids) if (sd.kind === 'eiblock' && inFoot(sd, P.pos.x, P.pos.z, 1.2) && sd.y0 > P.pos.y && sd.y0 - P.pos.y < 3) hitEiblock(sd);
      const b = L.boss; if (b && b.state === 'dazed' && Math.hypot(b.pos.x - P.pos.x, b.pos.z - P.pos.z) < 3) hurtBoss();
    } else { K.sfx('land'); G.dust(P.pos.x, P.pos.y, P.pos.z, 5); }
  }
  function onBonk(s) { if (s.kind === 'eiblock') hitEiblock(s); else K.sfx('bounce'); }
  function hitEiblock(s) {
    const r = s.ref; if (r.bump > 0) return; r.bump = 0.25; K.sfx('block');
    if (P.eggs.length < MAXEGG) { addEgg(); toast('🥚 Ei!', 0.8); } else { G.burst(r.o.x, r.o.y + 1.2, r.o.z, 8, '#ffe27a', 3, 0.4); }
  }
  function addEgg() { const m = G.makeEgg(P.eggs.length + Math.floor(Math.random() * 6)); m.position.copy(P.pos); S.L.group.add(m); P.eggs.push({ mesh: m }); K.sfx('egg'); updHud(); }
  function layEgg() {
    if (P.eggs.length >= MAXEGG) { spit(); return; }
    P.mouth = null; addEgg(); P.squash = 0.35; G.dust(P.pos.x, P.pos.y, P.pos.z, 6, '#ffd0ea');
  }
  // Zunge: zielt automatisch auf den nächsten Gegner im Blickkegel, trifft entlang der ganzen Strecke
  const TONGUE = 4.4;
  function startTongue() {
    const L = S.L, ox = P.pos.x, oy = P.pos.y + 1.05, oz = P.pos.z; let best = null;
    for (const e of L.enemies) {
      if (!e.alive || e.state === 'caught') continue;
      const dx = e.pos.x - ox, dz = e.pos.z - oz, dy = e.pos.y + e.h * 0.5 - oy, d = Math.hypot(dx, dz);
      if (d > TONGUE + e.r || Math.abs(dy) > 2.4) continue;
      const a = Math.abs(angDiff(P.face, Math.atan2(dx, dz))), sc = a + d * 0.08;
      if ((a < 0.8 || d < 1.4) && (!best || sc < best.sc)) best = { e, sc };
    }
    let dir;
    if (best) { const e = best.e; dir = new T.Vector3(e.pos.x - ox, e.pos.y + e.h * 0.5 - oy, e.pos.z - oz).normalize(); P.face = Math.atan2(dir.x, dir.z); }
    else dir = new T.Vector3(Math.sin(P.face), 0.06, Math.cos(P.face)).normalize();
    P.tongue = { t: 0, hit: null, dir }; K.sfx('tongue');
  }
  function segDist(p, a, b) { const ab = b.clone().sub(a), l2 = ab.lengthSq() || 1e-6, f = clamp(p.clone().sub(a).dot(ab) / l2, 0, 1); return p.distanceTo(a.addScaledVector(ab, f)); }
  function updateTongue(dt) {
    const L = S.L, t = P.tongue; t.t += dt; const D = 0.36, ext = Math.sin(clamp(t.t / D, 0, 1) * Math.PI) * TONGUE;
    const ox = P.pos.x + t.dir.x * 0.5, oy = P.pos.y + 1.05, oz = P.pos.z + t.dir.z * 0.5, org = new T.Vector3(ox, oy, oz);
    const tip = new T.Vector3(ox + t.dir.x * ext, oy + t.dir.y * ext, oz + t.dir.z * ext);
    if (t.hit) t.hit.pos.copy(tip).y -= t.hit.h * 0.4;
    else if (t.t < D * 0.55) {
      for (const e of L.enemies) {
        if (!e.alive || e.state === 'caught') continue;
        const c = new T.Vector3(e.pos.x, e.pos.y + e.h * 0.5, e.pos.z);
        if (segDist(c, org.clone(), tip) < e.r + 0.5) {
          if (e.edible) { t.hit = e; e.state = 'caught'; K.sfx('gulp'); }
          else { t.t = Math.max(t.t, D - t.t); K.sfx('bounce'); G.burst(tip.x, tip.y, tip.z, 6, '#ffffff', 2, 0.3); if (e.k === 'wirbel') e.stun = 1; }
          break;
        }
      }
      for (const it of L.items) if (!it.taken && it.k !== 'bluete' && segDist(it.pos, org.clone(), tip) < 0.8) collect(it);
    }
    PU.tongue.visible = PU.tip.visible = ext > 0.05;
    const mid = org.clone().lerp(tip, 0.5); PU.tongue.position.copy(mid); PU.tongue.scale.set(1, Math.max(0.01, ext), 1); PU.tongue.lookAt(tip); PU.tongue.rotateX(Math.PI / 2); PU.tip.position.copy(tip);
    if (t.t >= D) {
      PU.tongue.visible = PU.tip.visible = false;
      if (t.hit) { const e = t.hit; e.alive = false; e.mesh.visible = false; P.mouth = e.k; K.sfx('gulp'); rumble(40, 0.2); toast('Im Mund! Y = Ei legen · X = ausspucken', 1.4); }
      P.tongue = null;
    }
  }
  function spit() {
    const L = S.L, k = P.mouth; P.mouth = null; K.sfx('throw');
    const m = enemyMesh(k || 'muffel', 0); m.scale.setScalar(0.7); L.group.add(m);
    const dir = new T.Vector3(Math.sin(P.face), 0.15, Math.cos(P.face)).normalize();
    L.eggs.push({ mesh: m, pos: m.position.set(P.pos.x + dir.x, P.pos.y + 1, P.pos.z + dir.z), vel: dir.multiplyScalar(18), bounces: 0, life: 1.2, spit: true });
  }
  // Zielhilfe: nächstes Ziel im Blickkegel
  function aimDir() {
    const L = S.L, yaw = S.camYaw || cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const from = new T.Vector3(P.pos.x, P.pos.y + 1.1, P.pos.z);
    const targets = [];
    L.enemies.forEach(e => { if (e.alive && e.state !== 'caught') targets.push(new T.Vector3(e.pos.x, e.pos.y + e.h * 0.5, e.pos.z)); });
    L.clouds.forEach(c => { if (!c.done) targets.push(c.mesh.position); });
    if (L.boss && L.boss.hp > 0 && L.boss.state !== 'wait') { const cp = new T.Vector3(); L.boss.mesh.userData.core.getWorldPosition(cp); targets.push(cp); }
    let best = null, bs = 0.42;
    for (const t of targets) { const dx = t.x - from.x, dz = t.z - from.z, d = Math.hypot(dx, dz); if (d < 1 || d > 24) continue; const a = Math.acos(clamp((dx * fx + dz * fz) / d, -1, 1)); if (a < bs) { bs = a; best = t; } }
    const speed = 21, g = 10;
    if (best) { const d = from.distanceTo(best), tt = d / speed; return { v: new T.Vector3((best.x - from.x) / tt, (best.y - from.y) / tt + 0.5 * g * tt, (best.z - from.z) / tt), from, target: best, g }; }
    const elev = clamp(0.5 - (cam.pitch - 0.32) * 1.1, -0.15, 1.0);
    return { v: new T.Vector3(fx * Math.cos(elev) * speed, Math.sin(elev) * speed, fz * Math.cos(elev) * speed), from, target: null, g };
  }
  function throwEgg() {
    P.aim = false; const e = P.eggs.pop(); if (!e) return; const a = aimDir();
    e.mesh.position.copy(a.from); S.L.eggs.push({ mesh: e.mesh, pos: e.mesh.position, vel: a.v, bounces: 2, life: 3.2, g: a.g });
    K.sfx('throw'); P.squash = -0.2; rumble(50, 0.3); updHud();
  }
  function updateEggs(dt) {
    const L = S.L;
    // folgende Eier
    P.eggs.forEach((e, i) => {
      const idx = Math.min(P.hist.length - 1, (i + 1) * 6), p = P.hist[idx] || P.pos;
      e.mesh.position.lerp(new T.Vector3(p.x, p.y + 0.35 + Math.abs(Math.sin(S.time * 8 + i)) * 0.15, p.z), Math.min(1, dt * 14));
      e.mesh.rotation.y += dt * 2;
    });
    // geworfene Eier
    for (let i = L.eggs.length - 1; i >= 0; i--) {
      const e = L.eggs[i], prevY = e.pos.y; e.life -= dt; e.vel.y -= (e.g || 10) * dt * (e.spit ? 0.3 : 1); e.pos.addScaledVector(e.vel, dt); e.mesh.rotation.x += dt * 12;
      if (Math.random() < 0.6) G.particles.emit(e.pos.x, e.pos.y, e.pos.z, 0, 0, 0, 0.35, 0.35, 1, 0.85, 0.95, 0.8);
      let gone = e.life <= 0 || e.pos.y < G.theme.fluidY;
      for (const s of L.solids) {
        if (gone || !s.on || !inFoot(s, e.pos.x, e.pos.z, 0.2) || e.pos.y > s.y1 + 0.2 || e.pos.y < s.y0 - 0.2) continue;
        if (s.kind === 'eiblock') hitEiblock(s);
        if (e.spit || --e.bounces < 0) { gone = true; break; }
        K.sfx('bounce');
        if (prevY >= s.y1 - 0.05) { e.pos.y = s.y1 + 0.25; e.vel.y = Math.abs(e.vel.y) * 0.65; }
        else { const n = pushOut(s, e.pos, 0.3) || [-Math.sign(e.vel.x), 0]; const dot = e.vel.x * n[0] + e.vel.z * n[1]; e.vel.x -= 2 * dot * n[0]; e.vel.z -= 2 * dot * n[1]; e.vel.multiplyScalar(0.85); }
      }
      for (const en of L.enemies) if (!gone && en.alive && en.state !== 'caught' && Math.hypot(en.pos.x - e.pos.x, en.pos.y + en.h * 0.5 - e.pos.y, en.pos.z - e.pos.z) < en.r + 0.45) { killEnemy(en); if (!e.spit) gone = true; }
      for (const c of L.clouds) if (!gone && !c.done && c.mesh.position.distanceTo(e.pos) < 1.4) { openCloud(c); gone = true; }
      for (const it of L.items) if (!it.taken && it.pos.distanceTo(e.pos) < 0.9) collect(it);
      const b = L.boss; if (!gone && b && b.hp > 0 && ['float', 'dive', 'dazed', 'rise'].includes(b.state)) { const cp = new T.Vector3(); b.mesh.userData.core.getWorldPosition(cp); if (cp.distanceTo(e.pos) < 1.3) { hurtBoss(); gone = true; } else if (b.pos.distanceTo(e.pos) < 2.6 && e.pos.y > b.pos.y + 1) { K.sfx('bounce'); e.vel.multiplyScalar(-0.5); } }
      if (gone) { G.burst(e.pos.x, e.pos.y, e.pos.z, 12, '#fff6e8', 3, 0.45); K.sfx('poof'); L.group.remove(e.mesh); disposeGroup(e.mesh); L.eggs.splice(i, 1); }
    }
    // Zielspur
    if (P.aim && P.eggs.length) {
      const a = aimDir(), m4 = new T.Matrix4(); let n = 0; const p = a.from.clone(), v = a.v.clone();
      for (let k = 0; k < 16; k++) { for (let s = 0; s < 3; s++) { v.y -= a.g * 0.02; p.addScaledVector(v, 0.02); } m4.makeTranslation(p.x, p.y, p.z); trail.setMatrixAt(n++, m4); }
      trail.count = n; trail.instanceMatrix.needsUpdate = true; trail.material.color.setHSL((S.time * 0.5) % 1, 0.8, a.target ? 0.6 : 0.85);
    } else trail.count = 0;
  }
  function collect(it) {
    const L = S.L; it.taken = true; it.mesh.visible = false; const p = it.pos;
    if (it.k === 'muenze') { L.counts.coins++; addCoins(1); K.sfx('coin'); G.burst(p.x, p.y, p.z, 8, '#ffd84a', 3, 0.35, 0.5); }
    else if (it.k === 'rot') { L.counts.red++; addCoins(1); K.sfx('red'); G.burst(p.x, p.y, p.z, 14, '#ff5f7f', 4, 0.45); toast('◎ Rote Münze ' + L.counts.red + '/' + L.totals.red, 1.2); }
    else if (it.k === 'bluete') { L.counts.flowers++; K.sfx('flower'); G.rainbow(p.x, p.y, p.z, 30, 6); flash(); toast('✿ Farbblüte ' + L.counts.flowers + '/' + L.totals.flowers, 1.6); rumble(80, 0.3); }
    else if (it.k === 'stern') { P.stars = Math.min(30, P.stars + 1); K.sfx('star'); G.burst(p.x, p.y, p.z, 10, '#fff07a', 3, 0.4); }
    else if (it.k === 'herz') { S.lives++; P.stars = Math.max(P.stars, 10); K.sfx('oneup'); G.burst(p.x, p.y, p.z, 16, '#ff6a9a', 4, 0.5); toast('♥ Herzfrucht: +1 Leben', 1.8); }
    else if (it.k === 'feder') { P.feder = 15; P.flutter = 1; K.sfx('ring'); G.burst(p.x, p.y, p.z, 14, '#8fe8ff', 4, 0.5); toast('🪶 Flatterfeder: 15 s länger und höher flattern', 2); }
    else if (it.k === 'magnet') { P.magnet = 15; K.sfx('ring'); G.burst(p.x, p.y, p.z, 14, '#ff6a6a', 4, 0.5); toast('🧲 Münzmagnet: 15 s lang fliegen Münzen und Sterne zu dir', 2); }
    else if (it.k === 'regen') { P.rainbow = 9; K.sfx('flower'); G.rainbow(p.x, p.y, p.z, 30, 6); flash(); toast('🌈 Regenbogenstern: 9 s unbesiegbar!', 2); K.playMusic('wolken'); }
    updHud();
  }
  function addCoins(n) { save.coins = (save.coins || 0) + n; S.coins = (S.coins || 0) + n; if (Math.floor(S.coins / 100) > Math.floor((S.coins - n) / 100)) { S.lives++; K.sfx('oneup'); toast('♥ Extraleben!', 1.6); } }
  function useRing(r) {
    r.used = true; const L = S.L; P.stars = Math.min(30, P.stars + 10); K.sfx('ring'); G.rainbow(r.mesh.position.x, r.mesh.position.y, r.mesh.position.z, 40, 7); flash();
    const t = topBelow(r.mesh.position.x, r.mesh.position.y, r.mesh.position.z, 0.5); L.check.set(r.mesh.position.x, t ? t.y1 : P.pos.y, r.mesh.position.z); L.checkYaw = P.face;
    r.mesh.userData.m.emissive.set('#7affc0'); toast('Farbring: +10 ★ und Rücksetzpunkt', 1.8); updHud();
  }
  function openCloud(c) {
    const L = S.L; c.done = true; K.sfx('cloud'); G.burst(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, 24, '#ffffff', 5, 0.7); c.mesh.visible = false;
    const p = c.mesh.position;
    if (c.o.gibt === 'sterne') for (let k = 0; k < 5; k++) { const m = G.makeStar(), a = k / 5 * TAU; const t = topBelow(p.x + Math.cos(a) * 1.6, p.y, p.z + Math.sin(a) * 1.6, 0.3); m.position.set(p.x + Math.cos(a) * 1.6, (t ? t.y1 : p.y - 2) + 1.1, p.z + Math.sin(a) * 1.6); L.group.add(m); L.items.push({ k: 'stern', mesh: m, pos: m.position, taken: false, ph: k }); }
    if (c.o.gibt === 'bluete') { const m = G.makeFlower(); const t = topBelow(p.x, p.y, p.z, 0.5); m.position.set(p.x, Math.max((t ? t.y1 : p.y - 3) + 1.3, p.y - 3), p.z); L.group.add(m); L.items.push({ k: 'bluete', mesh: m, pos: m.position, taken: false, ph: 0 }); }
    if (c.o.gibt === 'bruecke') c.extra.forEach((s, k) => { s.on = true; s.ref.mesh.visible = true; s.ref.mesh.scale.setScalar(0.01); s.ref.grow = -k * 0.15; G.burst(s.ref.o.x, s.ref.o.y, s.ref.o.z, 14, '#ffd6f2', 4, 0.6); });
    toast(c.o.gibt === 'bruecke' ? 'Eine Wolkenbrücke erscheint!' : c.o.gibt === 'bluete' ? 'Eine Farbblüte!' : 'Sterne!', 1.4);
  }
  function pressSwitch(s) {
    const L = S.L; if (L.switchT > 0) return; L.switchT = 12; K.sfx('switch'); rumble(60, 0.4);
    L.fblocks.forEach(b => { b.on = true; b.ref.mesh.material = G.mats.lift; b.ref.mesh.castShadow = true; G.burst(b.ref.o.x, b.ref.o.y, b.ref.o.z, 10, '#ff7ac0', 3, 0.5); });
    s.ref.mesh.userData.top.scale.y = 0.3; toast('Farbblöcke für 12 Sekunden!', 1.6);
  }
  // ---------- Treffer, Leben ----------
  function hurt(from) {
    if (P.inv > 0 || P.rainbow > 0 || P.dead > 0 || S.mode !== 'play') return;
    const L = S.L; P.inv = 1.6; K.sfx('hurt'); rumble(220, 0.9); shake(0.3);
    const dx = P.pos.x - from.x, dz = P.pos.z - from.z, d = Math.hypot(dx, dz) || 1; P.vel.set(dx / d * 7, 8, dz / d * 7); P.ground = null; P.pound = 0; P.aim = false;
    if (P.baby) {
      P.baby = false; const b = G.makeBubble(); b.position.set(P.pos.x, P.pos.y + 1.6, P.pos.z); L.group.add(b);
      L.bubble = { mesh: b, t: 0, tick: 0, ang: Math.atan2(dz, dx) }; toast('Tamo schwebt davon – schnell zurückholen!', 2);
    }
  }
  function updateBubble(dt) {
    const L = S.L, b = L.bubble; if (!b) { if (P.baby && P.stars < 10 && Math.floor(L.time * 2) !== Math.floor((L.time - dt) * 2)) { P.stars++; updHud(); } return; }
    b.t += dt; b.ang += dt * 0.7; b.tick += dt;
    const want = new T.Vector3(P.pos.x + Math.cos(b.ang) * 2.6, P.pos.y + 1.7 + Math.sin(b.t * 1.7) * 0.5, P.pos.z + Math.sin(b.ang) * 2.6);
    b.mesh.position.lerp(want, Math.min(1, dt * 1.6)); b.mesh.userData.tamo.rotation.y += dt * 2; b.mesh.userData.b.scale.setScalar(1 + Math.sin(b.t * 6) * 0.04);
    if (b.tick >= 0.75) { b.tick = 0; P.stars--; K.sfx('tick'); updHud(); if (P.stars <= 0) { P.stars = 0; L.group.remove(b.mesh); disposeGroup(b.mesh); L.bubble = null; K.sfx('bossroar'); toast('Die Nebelgreifer haben Tamo geholt …', 2); die(); return; } }
    if (b.t > 1.1 && b.mesh.position.distanceTo(new T.Vector3(P.pos.x, P.pos.y + 0.9, P.pos.z)) < 1.5) {
      K.sfx('bubble'); G.burst(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 20, '#bfe8ff', 4, 0.6); L.group.remove(b.mesh); disposeGroup(b.mesh); L.bubble = null; P.baby = true; updHud();
    }
  }
  function die() { if (P.dead > 0) return; P.dead = 1.3; P.vel.set(0, 6, 0); K.stopMusic(); K.sfx('lose'); rumble(300, 1); trail.count = 0; P.aim = false; }
  function loseLife() {
    const L = S.L; S.lives--;
    if (S.lives <= 0) { S.mode = 'over'; showOver(); return; }
    P.eggs.forEach(e => { L.group.remove(e.mesh); disposeGroup(e.mesh); }); P.eggs = [];
    P.stars = 10; resetPlayer(L.check, L.checkYaw, false); P.baby = true;
    K.playMusic(G.theme.music); updHud(); toast('♥ ' + S.lives + ' Leben übrig', 1.6);
    if (L.boss && L.boss.hp > 0) { L.boss.state = 'float'; L.boss.t = 0; }
  }
  // ---------- Gegner ----------
  const BIG_ITEM = new Set(['bluete', 'herz', 'feder', 'magnet', 'regen']);
  function groundAt(x, y, z) { const g = topBelow(x, y + 0.6, z, -0.25); return !!g && Math.abs(g.y1 - y) < 0.7; }
  function shoot(e) {
    const L = S.L, m = G.makeKern(), from = new T.Vector3(e.pos.x, e.pos.y + 1.15, e.pos.z), to = new T.Vector3(P.pos.x, P.pos.y + 0.8, P.pos.z), v = to.sub(from).normalize().multiplyScalar(8);
    m.position.copy(from).addScaledVector(v, 0.09); L.group.add(m); L.shots.push({ mesh: m, pos: m.position, vel: v, life: 3 }); K.sfx('throw');
  }
  function updateShots(dt) {
    const L = S.L;
    for (let i = L.shots.length - 1; i >= 0; i--) {
      const s = L.shots[i]; s.life -= dt; s.pos.addScaledVector(s.vel, dt); s.mesh.rotation.x += dt * 9;
      let gone = s.life <= 0;
      if (!gone) for (const sd of L.solids) if (sd.on && sd.kind !== 'deko' && s.pos.y < sd.y1 && s.pos.y > sd.y0 && inFoot(sd, s.pos.x, s.pos.z, 0.1)) { gone = true; break; }
      if (!gone && S.mode === 'play' && P.dead <= 0 && Math.hypot(s.pos.x - P.pos.x, s.pos.y - P.pos.y - 0.8, s.pos.z - P.pos.z) < 0.75) { if (P.rainbow <= 0) hurt(s.pos); gone = true; }
      if (gone) { G.burst(s.pos.x, s.pos.y, s.pos.z, 6, '#ffd36a', 2, 0.3); L.group.remove(s.mesh); disposeGroup(s.mesh); L.shots.splice(i, 1); }
    }
  }
  function killEnemy(e, big) {
    e.alive = false; K.sfx('stomp'); G.burst(e.pos.x, e.pos.y + 0.5, e.pos.z, 16, '#ffffff', 4, 0.6); e.mesh.visible = false;
    if (Math.random() < 0.5 || big) { const m = G.makeStar(); m.position.set(e.pos.x, e.pos.y + 1, e.pos.z); S.L.group.add(m); S.L.items.push({ k: 'stern', mesh: m, pos: m.position, taken: false, ph: 0 }); }
  }
  function updateEnemies(dt) {
    const L = S.L, px = P.pos.x, py = P.pos.y, pz = P.pos.z, play = S.mode === 'play' && P.dead <= 0;
    for (const e of L.enemies) {
      if (!e.alive || e.state === 'caught') continue;
      e.t += dt; const m = e.mesh;
      if (e.k === 'muffel') {
        const dx = px - e.pos.x, dz = pz - e.pos.z, d = Math.hypot(dx, dz);
        let tx, tz;
        if (play && d < 7 && Math.abs(py - e.pos.y) < 2) { tx = dx / d; tz = dz / d; e.state = 'chase'; }
        else { e.ang += dt * 0.6; const gx = e.base.x + Math.cos(e.ang) * e.o.r, gz = e.base.z + Math.sin(e.ang) * e.o.r, gd = Math.hypot(gx - e.pos.x, gz - e.pos.z) || 1; tx = (gx - e.pos.x) / gd; tz = (gz - e.pos.z) / gd; e.state = 'walk'; }
        const sp = e.state === 'chase' ? 2.4 : 1.6; const nx = e.pos.x + tx * sp * dt, nz = e.pos.z + tz * sp * dt;
        if (Math.hypot(nx - e.base.x, nz - e.base.z) < e.o.r + 2.5 && groundAt(nx, e.pos.y, nz)) { e.pos.x = nx; e.pos.z = nz; }
        e.face += angDiff(e.face, Math.atan2(tx, tz)) * Math.min(1, dt * 6); m.rotation.y = e.face;
        const hop = Math.abs(Math.sin(e.t * 7)); m.userData.body.position.y = 0.55 + hop * 0.12; m.userData.f1.position.z = 0.1 + Math.sin(e.t * 7) * 0.15; m.userData.f2.position.z = 0.1 - Math.sin(e.t * 7) * 0.15;
        m.scale.set(1 + (1 - hop) * 0.06, 1 - (1 - hop) * 0.06, 1);
      } else if (e.k === 'flatter') {
        const f = Math.sin(e.t * TAU / e.o.per); e.pos.set(e.base.x + e.o.ax[0] * f, e.base.y + e.o.ax[1] * f + Math.sin(e.t * 3) * 0.3, e.base.z + e.o.ax[2] * f);
        m.rotation.y = Math.atan2(e.o.ax[0] * Math.cos(e.t * TAU / e.o.per), e.o.ax[2] * Math.cos(e.t * TAU / e.o.per) + 1e-3); const w = Math.sin(e.t * 22) * 0.9; m.userData.wl.rotation.z = w; m.userData.wr.rotation.z = -w;
      } else if (e.k === 'igel') {
        const f = Math.sin(e.t * TAU / e.o.per), v = Math.cos(e.t * TAU / e.o.per); e.pos.set(e.base.x + e.o.ax[0] * f, e.base.y, e.base.z + e.o.ax[2] * f);
        m.userData.core.rotation.z -= v * e.o.ax[0] * dt * 2.5; m.userData.core.rotation.x += v * e.o.ax[2] * dt * 2.5;
      } else if (e.k === 'hupfer') {   // springt in Bögen auf Pufi zu, bleibt auf seiner Insel
        const u = m.userData, dx = px - e.pos.x, dz = pz - e.pos.z, d = Math.hypot(dx, dz) || 1;
        if (e.hop) {
          e.hop.t += dt / 0.6; const f = Math.min(1, e.hop.t); e.pos.x = lerp(e.hop.ax, e.hop.bx, f); e.pos.z = lerp(e.hop.az, e.hop.bz, f); e.pos.y = e.base.y + Math.sin(f * Math.PI) * 1.4;
          u.legL.rotation.x = u.legR.rotation.x = -0.8; if (f >= 1) { e.hop = null; e.cd = play && d < 8 ? 0.7 : 1.6; u.body.scale.set(1.15, 0.8, 1.15); }
        } else {
          e.cd -= dt; u.body.scale.lerp(new T.Vector3(1, 1, 1), Math.min(1, dt * 8)); u.legL.rotation.x = u.legR.rotation.x = 0;
          if (e.cd <= 0) {
            let tx, tz; if (play && d < 8 && Math.abs(py - e.pos.y) < 2.5) { tx = dx / d; tz = dz / d; } else { e.ang += 1.9; tx = Math.cos(e.ang); tz = Math.sin(e.ang); }
            let bx = e.pos.x + tx * 2.2, bz = e.pos.z + tz * 2.2;
            if (Math.hypot(bx - e.base.x, bz - e.base.z) > (e.o.r || 3) + 1 || !groundAt(bx, e.base.y, bz)) { bx = e.base.x; bz = e.base.z; }
            e.hop = { t: 0, ax: e.pos.x, az: e.pos.z, bx, bz }; e.face = Math.atan2(bx - e.pos.x, bz - e.pos.z) || e.face; if (d < 14) K.sfx('jump');
          }
        }
        m.rotation.y += angDiff(m.rotation.y, e.face) * Math.min(1, dt * 10);
      } else if (e.k === 'spucker') {   // dreht sich zu Pufi und spuckt Kerne
        const u = m.userData, dx = px - e.pos.x, dz = pz - e.pos.z, d = Math.hypot(dx, dz);
        m.rotation.y += angDiff(m.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 3);
        e.cd -= dt; u.head.scale.setScalar(1 + Math.max(0, 0.4 - e.cd) * 0.5);
        if (e.cd <= 0) { e.cd = 2.6; if (play && d < 15 && Math.abs(py - e.pos.y) < 5) shoot(e); }
      } else if (e.k === 'wirbel') {   // flitzt auf einer Bahn, nur Eier helfen – oben drauf federt
        if (e.stun > 0) e.stun -= dt; else { e.t2 = (e.t2 || 0) + dt; const f = Math.sin(e.t2 * TAU / e.o.per); e.pos.set(e.base.x + e.o.ax[0] * f, e.base.y, e.base.z + e.o.ax[2] * f); }
        m.userData.spin.rotation.y += dt * (e.stun > 0 ? 3 : 18); m.userData.face.rotation.y = Math.atan2(px - e.pos.x, pz - e.pos.z);
      } else if (e.k === 'nebli') {   // schwebt Pufi hinterher, kehrt heim, wenn er zu weit weg ist
        const dx = px - e.pos.x, dz = pz - e.pos.z, d = Math.hypot(dx, dz) || 1, hb = Math.hypot(px - e.base.x, pz - e.base.z);
        let tx = e.base.x, tz = e.base.z, ty = e.base.y + 0.6 + Math.sin(e.t * 2) * 0.35;
        if (play && hb < (e.o.r || 5) + 4 && Math.abs(py - e.base.y) < 4) { tx = px; tz = pz; ty = py + 0.4 + Math.sin(e.t * 2) * 0.3; }
        const sp = 1.7 * dt, vx = tx - e.pos.x, vz = tz - e.pos.z, vd = Math.hypot(vx, vz);
        if (vd > 0.05) { e.pos.x += vx / vd * Math.min(sp, vd); e.pos.z += vz / vd * Math.min(sp, vd); }
        e.pos.y = lerp(e.pos.y, ty, Math.min(1, dt * 2)); m.rotation.y += angDiff(m.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 4);
        m.userData.body.scale.set(1 + Math.sin(e.t * 3) * 0.05, 1 - Math.sin(e.t * 3) * 0.05, 1); m.userData.body.children[0].material.opacity = 0.7 + Math.sin(e.t * 2) * 0.15; void d;
      } else if (e.k === 'rutscher') {   // saust übers Eis hin und her
        e.t2 = (e.t2 || 0) + dt; const ph = e.t2 * TAU / e.o.per, f = Math.sin(ph); e.pos.set(e.base.x + e.o.ax[0] * f, e.base.y, e.base.z + e.o.ax[2] * f);
        m.rotation.y = Math.atan2(e.o.ax[0] * Math.cos(ph), e.o.ax[2] * Math.cos(ph) + 1e-3); m.userData.body.rotation.x = 0.35 * Math.abs(Math.cos(ph));
        if (Math.random() < 0.2) G.particles.emit(e.pos.x, e.pos.y + 0.1, e.pos.z, 0, 1, 0, 0.4, 0.25, 0.9, 0.97, 1, 0.8, 0);
      } else if (e.k === 'schnapp') {
        const dx = px - e.pos.x, dz = pz - e.pos.z, d = Math.hypot(dx, dz); m.rotation.y += angDiff(m.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 4);
        const near = play && d < 3.4; e.bite = near ? (e.bite || 0) + dt : 0; const open = near ? Math.abs(Math.sin(e.bite * 5)) : 0.15 + Math.sin(e.t * 2) * 0.1;
        m.userData.top.rotation.x = -open * 0.7; m.userData.bot.rotation.x = open * 0.4; m.userData.h.position.z = near ? Math.min(0.8, d - 0.6) * open : 0; m.userData.h.position.y = 1.35 + Math.sin(e.t * 2) * 0.08;
      }
      // Berührung mit Pufi
      if (!play) continue;
      const hx = px - e.pos.x, hz = pz - e.pos.z, hd = Math.hypot(hx, hz), reach = e.k === 'schnapp' ? (e.bite ? 1.5 : 0.9) : e.r + RAD;
      if (hd < reach && py < e.pos.y + e.h && py + HGT > e.pos.y) {
        if (P.rainbow > 0) { killEnemy(e, true); continue; }
        if (e.k === 'wirbel' && P.vel.y < 0 && py > e.pos.y + e.h * 0.45) { P.vel.y = 16; P.pound = 0; P.flutter = 1; P.ground = null; K.sfx('spring'); e.stun = 0.8; G.burst(e.pos.x, e.pos.y + 1.3, e.pos.z, 10, '#ffe27a', 4, 0.4); continue; }
        if (P.vel.y < 0 && py > e.pos.y + e.h * 0.45 && (e.stomp || P.pound === 2) && e.k !== 'schnapp') { killEnemy(e); P.vel.y = IN.jump ? 13 : 9; P.pound = 0; P.flutter = 1; }
        else if (P.pound === 2 && e.k !== 'igel' && e.k !== 'schnapp') killEnemy(e, true);
        else hurt(e.pos);
      }
    }
  }
  // ---------- Boss „Brummnebel“ ----------
  function updateBoss(dt) {
    const b = S.L.boss, m = b.mesh, u = m.userData, play = S.mode === 'play' && P.dead <= 0; b.t += dt;
    const c = b.home;
    if (b.state === 'wait') { m.position.set(c.x, c.y + 6 + Math.sin(b.t) * 0.4, c.z - 2); if (play && Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < 12.5 && P.pos.y > c.y - 1.5) { b.state = 'intro'; b.t = 0; K.sfx('bossroar'); shake(0.6); banner('BOSS', b.name); K.playMusic('burg'); } }
    else if (b.state === 'intro') { m.position.y = c.y + 6 + Math.sin(b.t * 4) * 0.3; u.body.rotation.z = Math.sin(b.t * 12) * 0.05; if (b.t > 2.2) { b.state = 'float'; b.t = 0; } }
    else if (b.state === 'float') {
      const sp = 0.45 + (b.max - b.hp) * 0.18 * 3 / b.max + (b.max > 3 ? 0.15 : 0); b.ang += dt * sp; const tgt = new T.Vector3(c.x + Math.cos(b.ang) * 7, c.y + 5 + Math.sin(b.t * 2) * 0.6, c.z + 2 + Math.sin(b.ang) * 6);
      m.position.lerp(tgt, Math.min(1, dt * 2)); m.rotation.y += angDiff(m.rotation.y, Math.atan2(P.pos.x - m.position.x, P.pos.z - m.position.z)) * Math.min(1, dt * 3);
      b.minT -= dt; if (b.minT <= 0) { b.minT = 5; const alive = S.L.enemies.filter(e => e.alive && e.k === 'muffel').length; if (alive < 3) { const e = spawnEnemy('muffel', { x: m.position.x, y: c.y, z: m.position.z, r: 3 }); e.pos.y = c.y; G.burst(m.position.x, c.y + 1, m.position.z, 14, '#c9b0ff', 4, 0.6); } }
      if (b.t > 6 - (b.max - b.hp) * 3 / b.max - (b.max > 3 ? 0.8 : 0)) { b.state = 'dive'; b.t = 0; b.target = new T.Vector3(P.pos.x, c.y, P.pos.z); if (Math.hypot(b.target.x - c.x, b.target.z - c.z) > 10) b.target.set(c.x, c.y, c.z); K.sfx('bossroar'); }
    } else if (b.state === 'dive') {
      if (b.t < 0.7) { m.position.lerp(new T.Vector3(b.target.x, c.y + 7, b.target.z), Math.min(1, dt * 4)); u.body.rotation.x = -0.3; }
      else { m.position.y -= dt * 22; if (m.position.y <= c.y) { m.position.y = c.y; b.state = 'dazed'; b.t = 0; b.wave = 0; b.wavePos = m.position.clone(); K.sfx('shock'); shake(0.7); rumble(250, 0.9); G.ringWave(m.position.x, c.y, m.position.z, 12, '#c9b0ff', 40); G.dust(m.position.x, c.y, m.position.z, 30, '#d8c8f0', 6); } }
    } else if (b.state === 'dazed') {
      u.body.rotation.x = lerp(u.body.rotation.x, 0.25, dt * 4); u.body.rotation.z = Math.sin(b.t * 8) * 0.08;
      if (Math.random() < 0.3) G.particles.emit(m.position.x + Math.cos(b.t * 6) * 1.5, m.position.y + 5, m.position.z + Math.sin(b.t * 6) * 1.5, 0, 0, 0, 0.5, 0.6, 1, 0.95, 0.4, 1, 0);
      if (b.t > 3) { b.state = 'rise'; b.t = 0; }
    } else if (b.state === 'hurt') {
      m.position.y += dt * 4; u.body.rotation.z = Math.sin(b.t * 30) * 0.15; u.core.material.emissive.setHSL((b.t * 3) % 1, 1, 0.5);
      if (b.t > 1) { u.core.material.emissive.set('#ffb020'); if (b.hp <= 0) { b.state = 'dead'; b.t = 0; K.sfx('bossroar'); } else { b.state = 'float'; b.t = 0; } }
    } else if (b.state === 'rise') { m.position.y += dt * 5; u.body.rotation.x = lerp(u.body.rotation.x, 0, dt * 4); if (m.position.y > c.y + 5) { b.state = 'float'; b.t = 0; } }
    else if (b.state === 'dead') {
      m.scale.setScalar(Math.max(0.01, 1 - b.t * 0.6)); m.rotation.y += dt * 8; if (Math.random() < 0.8) G.rainbow(m.position.x, m.position.y + 2, m.position.z, 6, 6);
      if (b.t > 1.7) { b.state = 'gone'; m.visible = false; S.L.goal.on = true; S.L.goal.mesh.visible = true; S.L.goal.mesh.scale.setScalar(0.01); flash(); K.sfx('flower'); banner('GESCHAFFT', 'Das Farbtor öffnet sich!'); K.playMusic('wolken'); S.L.enemies.forEach(e => { if (e.alive) killEnemy(e); }); }
    }
    if (b.state === 'gone' && S.L.goal.mesh.scale.x < 1) S.L.goal.mesh.scale.setScalar(Math.min(1, S.L.goal.mesh.scale.x + dt * 1.5));
    // Schockwelle
    if (b.wave >= 0) { b.wave += dt * 10; if (play && P.ground && Math.abs(Math.hypot(P.pos.x - b.wavePos.x, P.pos.z - b.wavePos.z) - b.wave) < 0.7) hurt(b.wavePos); if (b.wave > 13) b.wave = -1; }
    // Berührung
    if (play && b.state !== 'gone' && b.state !== 'dead' && b.state !== 'wait') {
      const d = Math.hypot(P.pos.x - m.position.x, P.pos.z - m.position.z), dy = P.pos.y - m.position.y;
      if (d < 2.4 && dy > 3.2 && dy < 5.2 && P.vel.y < 0 && b.state === 'dazed') { hurtBoss(); P.vel.y = 14; P.pound = 0; }
      else if (d < 2.3 && dy > -1 && dy < 4) hurt(m.position);
    }
    u.armL.position.y = 2 + Math.sin(b.t * 3) * 0.3; u.armR.position.y = 2 - Math.sin(b.t * 3) * 0.3;
  }
  function hurtBoss() {
    const b = S.L.boss; if (!b || b.state === 'hurt' || b.state === 'dead' || b.state === 'gone') return;
    b.hp--; b.state = 'hurt'; b.t = 0; b.wave = -1; K.sfx('bosshit'); shake(0.5); rumble(200, 0.8); G.rainbow(b.pos.x, b.pos.y + 2.5, b.pos.z, 24, 7); updHud();
    toast(b.hp > 0 ? 'Treffer! Noch ' + b.hp : b.name + ' löst sich auf!', 1.4);
  }
  // ---------- Welt animieren ----------
  function updateWorld(dt) {
    const L = S.L, t = L.time;
    for (const l of L.lifts) { const f = Math.sin(t * TAU / l.o.per), nx = l.o.x + l.o.ax[0] * f, ny = l.o.y + l.o.ax[1] * f, nz = l.o.z + l.o.ax[2] * f; moveSolid(l.s, nx - l.last.x, ny - l.last.y, nz - l.last.z); l.last.set(nx, ny, nz); l.mesh.position.set(nx, ny, nz); }
    for (const c of L.crumbles) {
      if (c.t > 0) { c.t -= dt; c.mesh.position.x = c.home.x + (Math.random() - 0.5) * 0.12; if (c.t <= 0) { c.s.on = false; c.back = 4; G.dust(c.home.x, c.home.y - 0.3, c.home.z, 10, '#ffc860', 3); } }
      else if (c.back > 0) { c.back -= dt; c.mesh.position.y -= dt * 9; c.mesh.visible = c.mesh.position.y > c.home.y - 12; if (c.back <= 0) { c.s.on = true; c.t = -1; c.mesh.position.copy(c.home); c.mesh.visible = true; c.mesh.scale.setScalar(0.01); } }
      if (c.mesh.scale.x < 1) c.mesh.scale.setScalar(Math.min(1, c.mesh.scale.x + dt * 3));
    }
    if (L.switchT > 0) {
      const before = L.switchT; L.switchT -= dt;
      if (L.switchT < 4 && Math.floor(before * 2) !== Math.floor(L.switchT * 2)) K.sfx('swtick');
      L.fblocks.forEach(b => b.ref.mesh.visible = L.switchT > 3 || Math.floor(L.switchT * 8) % 2 === 0);
      if (L.switchT <= 0) { L.fblocks.forEach(b => { b.on = false; b.ref.mesh.visible = true; b.ref.mesh.material = G.mats.farb; b.ref.mesh.castShadow = false; }); if (L.switchObj) L.switchObj.userData.top.scale.y = 1; }
    }
    for (const s of L.solids) {
      if (s.kind === 'eiblock') { const r = s.ref; if (r.bump > 0) { r.bump -= dt; r.mesh.position.y = r.o.y + Math.sin(r.bump / 0.25 * Math.PI) * 0.35; } r.mesh.rotation.y = Math.sin(t * 1.5 + r.o.x) * 0.06; }
      if (s.kind === 'pilz') { const cp = s.ref.mesh.userData.cap; cp.scale.y = lerp(cp.scale.y, 0.5, dt * 10); }
      if (s.ref && s.ref.grow !== undefined) { s.ref.grow += dt * 3; s.ref.mesh.scale.setScalar(clamp(s.ref.grow, 0.01, 1)); }
    }
    for (const it of L.items) { if (it.taken) continue; it.mesh.rotation.y = t * (it.k === 'bluete' ? 1.2 : 3) + it.ph; if (it.k === 'regen') it.mesh.userData.m.emissive.setHSL((t * 0.6) % 1, 1, 0.5); if (it.k === 'bluete') { it.mesh.userData.petals.rotation.z = t * 0.8; it.mesh.position.y += Math.sin(t * 2 + it.ph) * 0.004; } }
    for (const r of L.rings) { r.mesh.rotation.y = t * (r.used ? 0.6 : 1.4); }
    for (const c of L.clouds) if (!c.done) { c.mesh.position.y = c.o.y + Math.sin(t * 1.3 + c.o.x) * 0.25; c.mesh.userData.q.material.rotation = Math.sin(t * 3) * 0.15; }
    if (L.goal && L.goal.mesh.visible) { const u = L.goal.mesh.userData; u.petal.forEach((p, k) => p.scale.setScalar(1 + Math.sin(t * 4 + k) * 0.12)); u.swirl.material.opacity = 0.25 + Math.sin(t * 3) * 0.1; if (Math.random() < 0.3) { const a = Math.random() * Math.PI; G.particles.emit(L.goal.mesh.position.x + Math.cos(a) * 2, L.goal.mesh.position.y + 1.2 + Math.sin(a) * 2, L.goal.mesh.position.z, 0, 1, 0, 1, 0.4, 1, 0.8, 0.95, 1, 0); } }
    for (const w of L.winds) if (w.per) { const on = Math.sin(t * TAU / w.per) > -0.15; if (on !== w.on) { w.on = on; if (on && Math.hypot(P.pos.x - w.x, P.pos.z - w.z) < 18) K.sfx('splash'); } w.mesh.scale.y = lerp(w.mesh.scale.y, on ? 1 : 0.05, Math.min(1, dt * 6)); }
    for (const w of L.winds) if (w.on !== false && Math.random() < 0.5) { const a = Math.random() * TAU, r = Math.random() * w.r; G.particles.emit(w.x + Math.cos(a) * r, w.y + Math.random() * 2, w.z + Math.sin(a) * r, 0, 4 + Math.random() * 4, 0, w.h / 6, 0.35, ...new T.Color().setHSL(Math.random(), 0.8, 0.75).toArray(), 0.9, 0); }
    if (G.theme.fluid === 'lava' && Math.random() < 0.3) { const a = Math.random() * TAU, r = 8 + Math.random() * 40; G.particles.emit(P.pos.x + Math.cos(a) * r, G.theme.fluidY + 0.2, P.pos.z + Math.sin(a) * r, 0, 2 + Math.random() * 2, 0, 1.6, 0.5, 1, 0.55, 0.15, 1, 0.5); }
    clouds.children.forEach(s => { s.position.x += dt * s.userData.v; if (s.position.x > 260) s.position.x = -260; });
    G.fluid.material.uniforms.time.value = t; G.fluid.position.x = Math.round(P.pos.x / 10) * 10; G.fluid.position.z = Math.round(P.pos.z / 10) * 10;
    G.particles.update(dt); G.puffs.update(dt);
  }
  // ---------- Pufi animieren ----------
  function updatePufiMesh(dt) {
    const u = PU, sp = Math.hypot(P.vel.x, P.vel.z), run = clamp(sp / RUN, 0, 1);
    pufi.position.copy(P.pos); pufi.rotation.y = P.face;
    P.phase += dt * (6 + sp * 1.6);
    P.squash = lerp(P.squash, 0, Math.min(1, dt * 10));
    const sq = P.squash, air = !P.ground;
    u.body.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5); u.body.position.y = P.ground ? Math.abs(Math.sin(P.phase)) * 0.08 * run : 0;
    const swing = P.fluttering ? Math.sin(S.time * 40) * 0.9 : air ? 0.4 : Math.sin(P.phase) * 0.7 * run;
    u.footL.position.z = 0.08 + swing * 0.3; u.footR.position.z = 0.08 - swing * 0.3; u.footL.position.y = 0.12 + Math.max(0, swing) * 0.15 * (P.ground ? 1 : 0); u.footR.position.y = 0.12 + Math.max(0, -swing) * 0.15 * (P.ground ? 1 : 0);
    u.armL.rotation.x = -swing * 0.6; u.armR.rotation.x = swing * 0.6;
    u.body.rotation.x = air ? (P.vel.y > 0 ? -0.12 : 0.15) : run * 0.12;
    u.body.rotation.y = P.pound === 1 ? (1 - P.poundT / 0.22) * TAU : 0;
    if (P.cheer > 0) { u.body.rotation.y = P.cheer * 8; u.armL.rotation.z = -1.2 - Math.sin(P.cheer * 12) * 0.3; u.armR.rotation.z = 1.2 + Math.sin(P.cheer * 12) * 0.3; } else { u.armL.rotation.z = 0; u.armR.rotation.z = 0; }
    u.tail.rotation.z = Math.sin(S.time * 4) * 0.3;
    const blink = (S.time % 3.4) < 0.12; u.eL.scale.y = u.eR.scale.y = blink ? 0.1 : 1;
    const full = !!P.mouth; u.cheekL.scale.setScalar(full ? 2.2 : 1); u.cheekR.scale.setScalar(full ? 2.2 : 1); u.mouth.visible = !!P.tongue;
    u.tamo.visible = P.baby; u.tamo.position.y = 1.05 + Math.abs(Math.sin(P.phase)) * 0.05;
    u.crest.rotation.x = air ? -0.3 : Math.sin(S.time * 3) * 0.06;
    pufi.visible = !(P.inv > 0 && Math.floor(S.time * 16) % 2 === 0 && S.mode === 'play');
    // Schattenfleck
    const g = topBelow(P.pos.x, P.pos.y + 0.1, P.pos.z, 0.2);
    if (g) { shadowBlob.visible = true; shadowBlob.position.set(P.pos.x, g.y1 + 0.03, P.pos.z); const h = clamp(1 - (P.pos.y - g.y1) / 10, 0.3, 1); shadowBlob.scale.setScalar(h); shadowBlob.material.opacity = h; } else shadowBlob.visible = false;
    // Sonne folgt Pufi (scharfe Schatten)
    const sd = G.theme.sunDir; G.sun.position.set(P.pos.x + sd[0] * 40, P.pos.y + sd[1] * 40, P.pos.z + sd[2] * 40); G.sun.target.position.copy(P.pos);
  }
  // ---------- Effekte ----------
  let shakeT = 0; function shake(s) { shakeT = Math.max(shakeT, s); }
  function flash() { const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  let toastT = 0; function toast(msg, sec = 2) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); toastT = sec; }
  function banner(small, big) { const b = $('banner'); b.innerHTML = '<small>' + small + '</small><b>' + big + '</b>'; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  function setRetro(on) {
    S.retro = on; document.body.classList.toggle('retro', on); K.setRetro(on); resize(); flash();
    if (on) { K.sfx('retro'); toast('🕹️ RETRO-ZONE – wie früher: nur links und rechts!', 2.2); }
  }
  // ---------- HUD ----------
  let hudKey = '';
  function updHud() {
    const L = S.L; if (!L) return;
    const pw = (P.feder > 0 ? ' · 🪶' + Math.ceil(P.feder) : '') + (P.magnet > 0 ? ' · 🧲' + Math.ceil(P.magnet) : '') + (P.rainbow > 0 ? ' · 🌈' + Math.ceil(P.rainbow) : '');
    const k = [P.stars, S.lives, P.eggs.length, L.counts.red, L.counts.flowers, S.coins, P.baby, L.boss && L.boss.hp, pw].join();
    if (k === hudKey) return; hudKey = k;
    $('hStarN').textContent = P.stars; $('hStarArc').style.strokeDashoffset = 119.4 * (1 - P.stars / 30);
    $('hStar').classList.toggle('danger', !P.baby);
    $('hLives').textContent = '♥ ' + S.lives; $('hEggs').textContent = P.eggs.length ? '🥚'.repeat(P.eggs.length) : '🥚 0';
    $('hCoins').textContent = '● ' + (S.coins || 0); $('hRed').textContent = '◎ ' + L.counts.red + '/' + L.totals.red; $('hFlowers').textContent = '✿ ' + L.counts.flowers + '/' + L.totals.flowers;
    $('hLevel').textContent = L.def.id + ' · ' + L.def.name + (L.boss && L.boss.hp > 0 && L.boss.state !== 'wait' ? ' · ' + L.boss.name + ' ' + '♥'.repeat(L.boss.hp) : '') + pw;
    const c = $('count'); c.textContent = P.stars; c.classList.toggle('on', !P.baby && S.mode === 'play');
  }
  // ---------- Ablauf ----------
  function startLevel(i) {
    S.li = i; buildLevel(i); S.mode = 'play'; S.attract = false; closeScreen();
    $('hud').hidden = false; setTouchUI(); hudKey = ''; updHud();
    K.playMusic(G.theme.music); K.muffle(false);
    banner(W.LEVELS[i].id + ' · ' + W.WELTEN[W.LEVELS[i].welt].name.toUpperCase(), W.LEVELS[i].name);
    setTimeout(() => S.mode === 'play' && S.L && S.L.i === i && toast(W.LEVELS[i].tipp, 4.5), 2400);
  }
  function score(L) { const st = Math.min(30, P.stars), red = Math.round(L.counts.red / Math.max(1, L.totals.red) * 20), fl = L.counts.flowers * 10; return { st, red, fl, total: st + red + fl }; }
  function finishLevel() {
    const L = S.L; L.done = true; S.mode = 'clearAnim'; P.cheer = 0.01; P.aim = false; trail.count = 0; K.jingle('clear'); flash(); G.rainbow(P.pos.x, P.pos.y + 1, P.pos.z, 50, 8); rumble(200, 0.5);
    setRetro(false); cam.snap = 0;
    setTimeout(() => { if (S.mode === 'clearAnim') showClear(); }, 2300);
  }
  function showClear() {
    const L = S.L, sc = score(L), id = L.def.id, old = save.best[id] || { score: 0, flowers: 0, red: 0 };
    const rec = sc.total > old.score;
    save.best[id] = { score: Math.max(old.score, sc.total), flowers: Math.max(old.flowers, L.counts.flowers), red: Math.max(old.red, L.counts.red) };
    save.unlocked = Math.max(save.unlocked, Math.min(W.COUNT, L.i + 2)); store();
    S.mode = 'clear'; $('touch').hidden = true;
    const last = L.i >= W.COUNT - 1, bossWin = !last && L.def.boss;
    showScreen('clear', `<div class="panel"><h2>${last ? 'Insel gerettet!' : 'Geschafft!'}</h2><p>${L.def.id} · ${L.def.name}${last ? '<br>Der Sturmnebel ist besiegt und der Farbwind weht wieder über alle sechs Inseln. Danke, Pufi &amp; Tamo!' : bossWin ? '<br>Brummnebel ist besiegt! Doch hinter den Frostgipfeln braut sich der Sturmnebel zusammen …' : ''}</p>
      <div class="tally"><span>★ Sterne (max. 30)</span><b>${sc.st}</b><span>◎ Rote Münzen ${L.counts.red}/${L.totals.red}</span><b>${sc.red}</b><span>✿ Farbblüten ${L.counts.flowers}/${L.totals.flowers}</span><b>${sc.fl}</b><span class="sum">Punkte</span><b class="sum">${sc.total} / 100</b>${rec ? '<span class="rec">✨ Neuer Bestwert!</span>' : ''}</div>
      <div class="btns two">${last ? '' : '<button class="btn primary" data-a="next" data-pad-first>▶ Nächstes Level</button>'}<button class="btn${last ? ' primary' : ''}" data-a="again">↻ Nochmal</button><button class="btn" data-a="map">🗺️ Inselkarte</button><button class="btn" data-a="title">⌂ Hauptmenü</button></div></div>`,
      { next: () => startLevel(L.i + 1), again: () => startLevel(L.i), map: openMap, title: toTitle });
  }
  function showOver() {
    K.jingle('over'); $('touch').hidden = true;
    showScreen('over', `<div class="panel"><h2>Game Over</h2><p>Keine Leben mehr – aber Pufi gibt nicht auf! Du startest das Level mit 5 Leben neu.</p><div class="btns two"><button class="btn primary" data-a="again" data-pad-first>↻ Nochmal</button><button class="btn" data-a="map">🗺️ Inselkarte</button><button class="btn" data-a="title">⌂ Hauptmenü</button></div></div>`,
      { again: () => { S.lives = 5; startLevel(S.li); }, map: () => { S.lives = 5; openMap(); }, title: () => { S.lives = 5; toTitle(); } }, 'title');
  }
  // ---------- Menüs ----------
  let actions = {}, backAct = null;
  function showScreen(view, html, acts, back) {
    const s = $('screen'); s.className = 'screen ' + view; s.innerHTML = html; s.hidden = false; S.view = view; actions = acts || {}; backAct = back || null;
    s.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { K.init(); K.sfx(b.dataset.a === 'back' ? 'back' : 'ok'); const f = actions[b.dataset.a]; if (f) f(b); }));
    s.querySelectorAll('button').forEach(b => b.addEventListener('mouseenter', () => K.sfx('select')));
    $('cloudBox').hidden = view !== 'cloud';
    if (lastDevice !== 'touch') setTimeout(() => { const f = s.querySelector('[data-pad-first]') || s.querySelector('.btn:not(:disabled)'); if (f) f.focus({ preventScroll: true }); }, 30);
    $('touch').hidden = true;
  }
  function closeScreen() { $('screen').hidden = true; $('screen').innerHTML = ''; $('cloudBox').hidden = true; S.view = ''; }
  function menuKey(e) {
    const s = $('screen'), list = [...s.querySelectorAll('button:not(:disabled),input')];
    const i = list.indexOf(document.activeElement);
    if (['ArrowDown', 'KeyS', 'ArrowRight', 'KeyD', 'ArrowUp', 'KeyW', 'ArrowLeft', 'KeyA'].includes(e.code)) {
      if (document.activeElement && document.activeElement.type === 'range' && /Left|Right|KeyA|KeyD/.test(e.code)) return;
      e.preventDefault(); const d = /Down|Right|KeyS|KeyD/.test(e.code) ? 1 : -1; const n = list[(i + d + list.length) % list.length]; if (n) { n.focus(); K.sfx('select'); }
    } else if (e.code === 'Escape' || e.code === 'Backspace') { e.preventDefault(); goBack(); }
    else if ((e.code === 'Enter' || e.code === 'Space') && i < 0 && list[0]) { e.preventDefault(); list[0].focus(); }
  }
  function goBack() { K.sfx('back'); if (typeof backAct === 'function') backAct(); else if (backAct === 'title') toTitle(); else if (S.mode === 'pause') resume(); }
  function toTitle() {
    if (S.mode === 'boot') { $('boot').classList.add('gone'); setTimeout(() => $('boot').hidden = true, 650); K.init(); K.sfx('start'); }
    S.mode = 'menu'; S.attract = true; $('hud').hidden = true; $('touch').hidden = true; setRetro(false); $('count').classList.remove('on');
    if (!S.L || !S.attractBuilt || S.L.i !== 0 || S.L.done) { buildLevel(0); S.attractBuilt = true; }
    K.playMusic('titel'); K.muffle(false);
    const cont = save.unlocked > 1;
    showScreen('title', `<div class="menu"><div class="mlogo"><b>PUFI</b><span>&amp; der Farbwind<em>3D</em></span></div><div class="btns">
      <button class="btn primary" data-a="play" data-pad-first><span class="ic">▶</span>${cont ? 'Weiterspielen' : 'Abenteuer starten'}<span class="sub">${cont ? 'Level ' + W.LEVELS[Math.min(save.unlocked, W.COUNT) - 1].id + ' · ' + W.LEVELS[Math.min(save.unlocked, W.COUNT) - 1].name : 'Insel 1 · Blütenbucht'}</span></button>
      <button class="btn" data-a="map"><span class="ic">🗺️</span>Inselkarte</button>
      <button class="btn" data-a="klassik"><span class="ic">🕹️</span>Klassik 2D<span class="sub">das Original-Abenteuer mit 24 Leveln</span></button>
      <button class="btn" data-a="opts"><span class="ic">⚙️</span>Optionen</button>
      <button class="btn" data-a="help"><span class="ic">🎮</span>Steuerung</button>
      <button class="btn" data-a="cloud"><span class="ic">☁️</span>Google-Speicher</button>
      </div><p class="info">Controller, Touch und Tastatur · ${IS_TOUCH ? 'Tippe auf die Knöpfe' : 'Pfeiltasten + Enter oder Maus'}</p></div>`,
      { play: () => startLevel(Math.min(save.unlocked, W.COUNT) - 1), map: openMap, klassik: () => { location.href = './klassik.html'; }, opts: () => openOptions(toTitle), help: () => openHelp(toTitle), cloud: openCloud });
  }
  function openMap() {
    S.mode = S.mode === 'pause' ? 'pause' : 'menu'; const fromPause = S.mode === 'pause';
    if (!fromPause) { $('hud').hidden = true; }
    const worlds = W.WELTEN.map((w, wi) => `<div class="world"><h3 style="color:${w.farbe}">Insel ${wi + 1} · ${w.name}</h3><div class="lvls">` + W.LEVELS.map((l, i) => {
      if (l.welt !== wi) return ''; const b = save.best[l.id], lock = i + 1 > save.unlocked, tot = W.totals(l);
      return `<button class="btn lvl${b ? ' done' : ''}${b && b.score >= 100 ? ' perfect' : ''}" data-a="l${i}" ${lock ? 'disabled' : ''}${i === Math.min(save.unlocked, W.COUNT) - 1 ? ' data-pad-first' : ''}><b>${lock ? '🔒 ' : ''}${l.id} ${l.name}${l.boss ? ' 👑' : ''}</b><span class="st">${b ? '★ ' + b.score + '/100 · ✿ ' + b.flowers + '/' + tot.flowers + ' · ◎ ' + b.red + '/' + tot.red : lock ? 'noch verschlossen' : 'neu'}</span></button>`;
    }).join('') + '</div></div>').join('');
    const acts = { back: fromPause ? openPause : toTitle }; W.LEVELS.forEach((l, i) => acts['l' + i] = () => { S.lives = Math.max(S.lives, 5); startLevel(i); });
    showScreen('map', `<div class="panel"><h2>Inselkarte</h2><p>Jedes Level hat 5 Farbblüten, 8 rote Münzen und bis zu 30 Sterne – zusammen 100 Punkte.</p><div class="map">${worlds}</div><div class="btns"><button class="btn" data-a="back">← Zurück</button></div></div>`, acts, acts.back);
  }
  function openOptions(back) {
    const q = opt.quality, Q = { auto: 'Automatisch', hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' };
    const yn = v => v ? 'An' : 'Aus';
    showScreen('options', `<div class="panel"><h2>Optionen</h2><div class="opts">
      <label class="opt">🎵 Musik<input type="range" min="0" max="1" step="0.05" value="${opt.music}" id="oMusic"></label>
      <label class="opt">🔊 Effekte<input type="range" min="0" max="1" step="0.05" value="${opt.sfx}" id="oSfx"></label>
      <div class="opt">♪ Ton<button class="btn" data-a="sound">${yn(opt.sound)}</button></div>
      <div class="opt">✨ Grafik<button class="btn" data-a="q">${Q[q]}</button></div>
      <label class="opt">🎥 Kamera-Tempo<input type="range" min="0.4" max="2" step="0.1" value="${opt.sens}" id="oSens"></label>
      <div class="opt">↔ Kamera X umkehren<button class="btn" data-a="ix">${yn(opt.invX)}</button></div>
      <div class="opt">↕ Kamera Y umkehren<button class="btn" data-a="iy">${yn(opt.invY)}</button></div>
      <div class="opt">🧭 Kamera folgt automatisch<button class="btn" data-a="ac">${yn(opt.autoCam)}</button></div>
      <div class="opt">📳 Vibration<button class="btn" data-a="vib">${yn(opt.vib)}</button></div>
      <div class="opt">🎮 Controller-Belegung<button class="btn" data-a="pad">Ändern</button></div>
      </div><p id="qHint" style="font-size:12px;opacity:.8">${opt.quality !== quality && opt.quality !== 'auto' ? 'Die neue Grafikstufe gilt nach dem nächsten Start vollständig.' : 'Grafik „Automatisch“ wählt am Handy „Mittel“ und senkt bei Ruckeln die Auflösung.'}</p>
      <div class="btns"><button class="btn primary" data-a="back">✓ Fertig</button></div></div>`, {
      back: () => { store(); back(); },
      sound: b => { opt.sound = !opt.sound; K.opt.on = opt.sound; K.apply(); b.textContent = yn(opt.sound); store(); },
      q: b => { const l = ['auto', 'hoch', 'mittel', 'niedrig']; opt.quality = l[(l.indexOf(opt.quality) + 1) % 4]; b.textContent = Q[opt.quality]; $('qHint').textContent = 'Die neue Grafikstufe gilt nach dem nächsten Start vollständig.'; store(); },
      ix: b => { opt.invX = !opt.invX; b.textContent = yn(opt.invX); store(); }, iy: b => { opt.invY = !opt.invY; b.textContent = yn(opt.invY); store(); },
      ac: b => { opt.autoCam = !opt.autoCam; b.textContent = yn(opt.autoCam); store(); }, vib: b => { opt.vib = !opt.vib; b.textContent = yn(opt.vib); store(); },
      pad: () => { if (window.EasyGamesPad && EasyGamesPad.showLegend) EasyGamesPad.showLegend(6000); toast('Controller-Belegung ändern: Select + Start gleichzeitig drücken.', 3.5); }
    }, () => { store(); back(); });
    const bind = (id, k, f) => { const el = $(id); el.addEventListener('input', () => { opt[k] = +el.value; f && f(); store(); }); };
    bind('oMusic', 'music', () => { K.opt.music = opt.music; K.apply(); }); bind('oSfx', 'sfx', () => { K.opt.sfx = opt.sfx; K.apply(); K.sfx('coin'); }); bind('oSens', 'sens');
  }
  function openHelp(back, tab) {
    tab = tab || (lastDevice === 'pad' ? 'pad' : lastDevice === 'touch' ? 'touch' : 'pc');
    const rows = {
      pc: [['Laufen', 'W A S D / Pfeiltasten'], ['Springen · Flattern', 'Leertaste (halten)'], ['Zunge · ausspucken', 'X oder J'], ['Ei zielen + werfen', 'C oder K (antippen = Zielen, nochmal = Wurf; halten + loslassen geht auch)'], ['Stampfen · Ei legen', 'V, L oder Shift'], ['Kamera', 'Maus ziehen, Q / E drehen, Mausrad Zoom, R hinter Pufi'], ['Pause · Musik · Vollbild', 'Esc / P · M · F']],
      pad: [['Laufen', 'Linker Stick / Steuerkreuz'], ['Kamera', 'Rechter Stick · LT oder L3: hinter Pufi'], ['Springen · Flattern', 'A (halten)'], ['Zunge · ausspucken', 'X'], ['Ei zielen + werfen', 'B, RB oder RT (halten, loslassen = Wurf)'], ['Stampfen · Ei legen', 'Y oder LB'], ['Pause · Musik', 'Start · Select'], ['Belegung ändern', 'Select + Start']],
      touch: [['Laufen', 'Linke Bildschirmhälfte: Daumen-Stick'], ['Kamera', 'Rechts auf freier Fläche wischen · 🎥 hinter Pufi'], ['Springen · Flattern', 'A (halten)'], ['Zunge', 'X'], ['Ei zielen + werfen', 'B antippen = Zielen, nochmal = Wurf'], ['Stampfen · Ei legen', 'Y'], ['Pause', 'Ⅱ oben rechts']]
    };
    const tabs = [['pc', '⌨️ PC'], ['pad', '🎮 Controller'], ['touch', '📱 Touch']].map(([k, n]) => `<button class="btn${k === tab ? ' on' : ''}" data-a="t_${k}">${n}</button>`).join('');
    showScreen('help', `<div class="panel"><h2>Steuerung</h2><div class="tabs">${tabs}</div><table class="keys">${rows[tab].map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table>
      <p style="font-size:13px;text-align:left">💡 <b>Ziel:</b> Trag Tamo bis zum Farbtor. Wirst du getroffen, schwebt Tamo in einer Blase davon – hol ihn zurück, bevor die Sterne auf 0 fallen. Fang Muffel mit der Zunge und lege Eier (bis zu 6). Eier öffnen ?-Wolken, besiegen Igelkugeln und Schnappblüten. Farbringe speichern den Fortschritt und geben +10 ★. In <b>Retro-Zonen</b> wird die Welt zur Pixel-Seitenansicht.</p>
      <p style="font-size:13px;text-align:left">🐸 <b>Gegner:</b> Muffel, Hupfer, Nebli und Rutscher kann man fressen. Kernspucker, Igelkugeln und Schnappblüten besiegst du mit Eiern. Auf Wirbelkreiseln federst du hoch. · 🎁 <b>Hilfen:</b> ♥ Herzfrucht (+1 Leben), 🪶 Flatterfeder, 🧲 Münzmagnet, 🌈 Regenbogenstern (unbesiegbar). Hinweistafeln (!) erklären Neues.</p>
      <p style="font-size:11px;opacity:.7;text-align:left">Mitwirkende: Musik, Figuren und Welten eigens für dieses Spiel. Retro-Kacheln: „Retro Platformer Tilesets“ von Jestan. Klänge: „Momo Adventures“ von GreenRetroman, Kenney (CC0). Details in LIZENZEN.md.</p>
      <div class="btns"><button class="btn primary" data-a="back">✓ Verstanden</button></div></div>`,
      { back, t_pc: () => openHelp(back, 'pc'), t_pad: () => openHelp(back, 'pad'), t_touch: () => openHelp(back, 'touch') }, back);
  }
  function openCloud() {
    showScreen('cloud', `<div class="panel" style="padding-bottom:180px"><h2>Google-Speicher</h2><p>Melde dich an, um freigeschaltete Level, Bestwerte und Einstellungen auf allen Geräten zu haben.</p><div class="btns" style="margin-top:150px"><button class="btn primary" data-a="back">← Zurück</button></div></div>`, { back: toTitle }, toTitle);
  }
  function openPause() {
    if (S.mode !== 'play') return; S.mode = 'pause'; K.muffle(true); K.wind(0); keys.clear(); touch.btn = {};
    showScreen('pause', `<div class="panel"><h2>Pause</h2><p>${S.L.def.id} · ${S.L.def.name} · ✿ ${S.L.counts.flowers}/${S.L.totals.flowers} · ◎ ${S.L.counts.red}/${S.L.totals.red}</p><div class="btns two">
      <button class="btn primary" data-a="go" data-pad-first>▶ Weiterspielen</button><button class="btn" data-a="re">↻ Level neu starten</button>
      <button class="btn" data-a="opts">⚙️ Optionen</button><button class="btn" data-a="help">🎮 Steuerung</button>
      <button class="btn" data-a="map">🗺️ Inselkarte</button><button class="btn" data-a="title">⌂ Hauptmenü</button></div></div>`,
      { go: resume, re: () => startLevel(S.li), opts: () => openOptions(reopenPause), help: () => openHelp(reopenPause), map: openMap, title: toTitle }, resume);
  }
  function reopenPause() { S.mode = 'play'; openPause(); }
  function resume() { closeScreen(); S.mode = 'play'; K.muffle(false); setTouchUI(); for (const n in prev) prev[n] = true; }
  function toggleSound() { opt.sound = !opt.sound; K.opt.on = opt.sound; K.init(); K.apply(); store(); $('bSound').textContent = opt.sound ? '♪' : '✕'; }
  function toggleFull() { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { } }
  $('bPause').addEventListener('click', () => openPause()); $('bSound').addEventListener('click', toggleSound); $('bFull').addEventListener('click', toggleFull);
  $('bSound').textContent = opt.sound ? '♪' : '✕';
  // Controller in Menüs: gamepad.js führt (data-pad="info menu=.screen"); Start/Select im Spiel selbst
  addEventListener('easygames:pad', e => { if (e.detail && e.detail.on) { lastDevice = 'pad'; setTouchUI(); } });
  // Startbildschirm: Controller-Knopf startet
  function bootPad() { if (S.mode !== 'boot') return; const p = readPad(); if (p && p.buttons.some(b => b.pressed)) { lastDevice = 'pad'; toTitle(); } }

  // ---------- Hauptschleife ----------
  let last = performance.now(), fpsAcc = 0, fpsN = 0, slow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.manual) dt = 0;
    if (S.mode === 'boot') bootPad();
    if (!S.manual) sample(dt || 1 / 60);
    if (dt > 0 && S.L) {
      const run = S.mode === 'play' || S.mode === 'clearAnim' || S.mode === 'menu';
      if (run) { const n = Math.ceil(dt / (1 / 60)); for (let i = 0; i < n; i++) update(dt / n); }
      if (S.mode === 'menu' || S.mode === 'boot') attractCam(dt);
      else updateCam(dt);
    }
    if (shakeT > 0) { shakeT = Math.max(0, shakeT - dt); camera.position.x += (Math.random() - 0.5) * shakeT * 0.8; camera.position.y += (Math.random() - 0.5) * shakeT * 0.8; }
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
    if (S.L) updHud();
    G.renderer.render(scene, camera);
    // Auflösung bei Ruckeln senken (nur „Automatisch“)
    if (dt > 0 && opt.quality === 'auto' && S.mode === 'play') { fpsAcc += dt; fpsN++; if (fpsAcc > 2) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; if (fps < 42 && prScale > 0.6) { prScale -= 0.12; resize(); slow++; } else if (fps > 57 && prScale < 1) { prScale = Math.min(1, prScale + 0.06); resize(); } } }
  }
  function attractCam(dt) {
    if (S.mode === 'menu' && S.L) { S.L.time += 0; }
    const t = performance.now() / 1000, L = S.L, c = L ? L.check : new T.Vector3();
    if (S.mode === 'boot' && L) update(dt);
    P.vel.set(0, 0, 0); P.face = Math.sin(t * 0.4) * 0.6 + Math.PI * 0.15;
    const a = t * 0.12 + 0.6, r = 9.5; camera.position.set(c.x + Math.sin(a) * r, c.y + 3.2 + Math.sin(t * 0.3) * 0.5, c.z + Math.cos(a) * r); camera.lookAt(c.x + 1.5, c.y + 1.2, c.z);
    if (Math.random() < 0.1) G.particles.emit(c.x + (Math.random() - 0.5) * 12, c.y + Math.random() * 5, c.z + (Math.random() - 0.5) * 12, 0, 0.4, 0, 2.5, 0.3, 1, 0.9, 0.7, 0.9, 0);
  }
  addEventListener('resize', resize);
  // ---------- Start ----------
  buildLevel(0); S.attractBuilt = true; resize(); requestAnimationFrame(frame);
  setTimeout(() => { $('boot').classList.add('ready'); $('bootPrompt').textContent = IS_TOUCH ? 'TIPPEN ZUM STARTEN' : 'TASTE ODER Ⓐ DRÜCKEN'; }, 900);

  // ---------- Testschnittstelle ----------
  window.Pufi3D = {
    state: () => ({ mode: S.mode, view: S.view, level: S.L && S.L.def.id, li: S.li, lives: S.lives, stars: P.stars, baby: P.baby, eggs: P.eggs.length, mouth: P.mouth, aim: P.aim, retro: S.retro,
      P: { x: P.pos.x, y: P.pos.y, z: P.pos.z, vy: P.vel.y, ground: !!P.ground, face: P.face, flutter: P.fluttering, pound: P.pound }, counts: S.L && Object.assign({}, S.L.counts), boss: S.L && S.L.boss && { hp: S.L.boss.hp, state: S.L.boss.state },
      goal: S.L && S.L.goal && S.L.goal.on, camYaw: S.camYaw, switchT: S.L && S.L.switchT, device: lastDevice, quality }),
    start: i => startLevel(i), title: toTitle, map: openMap, options: () => openOptions(toTitle), help: () => openHelp(toTitle), pause: openPause, resume,
    set: (x, y, z) => { P.pos.set(x, y, z); P.vel.set(0, 0, 0); P.ground = null; cam.tx = x; cam.tz = z; cam.ty = y + 1.3; },
    press: (n, v) => { if (v === undefined) delete forced[n]; else forced[n] = v; },
    step: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) { sample(dt); update(dt); updateCam(dt); } },
    manual: on => { S.manual = !!on; }, giveEggs: n => { for (let i = 0; i < n; i++) addEgg(); }, hurt: () => hurt(new T.Vector3(P.pos.x + 1, P.pos.y, P.pos.z)),
    level: () => S.L, P, K, finish: finishLevel, hurtBoss,
    tongue: () => ({ vis: PU.tongue.visible, world: PU.tongue.parent === scene, near: PU.tongue.position.distanceTo(P.pos) < 4 })
  };
})();
