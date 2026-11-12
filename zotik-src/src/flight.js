// Nautilux-Flug zwischen den Welten (wie die Gumi-Flüge bei Kingdom Hearts, aber eigenständig):
// Die Nautilux fliegt durch den Rissraum, weicht Gesteinsbrocken aus, schießt Rissdrohnen ab und
// sammelt Splitter-Ringe. Steuerung: Bewegen (Stick, WASD, Joystick); geschossen wird automatisch.
// Übergang wie bei Kingdom Hearts: Der Flug beginnt im Himmel der alten Welt (Farben, Hindernisse), führt durch den Rissraum
// und taucht am Ende in den Himmel der neuen Welt ein – Hindernisse, Nebel und Planet passen zur Zielwelt (from/to-Themen).
import * as T from 'three';

export function createFlight({ renderer, makeShip, makeWalker, makeIsle, inputVec, sfx, hud }) {
  let F = null;
  const R = (a, b) => a + Math.random() * (b - a);

  const RIFT = { bg: 0x05040f, fog: 0x0a0820 };
  const OB = {}, MATS = {}; let GEO = null;   // Hindernis-Bauteile je Thema (einmal gebaut, danach wiederverwendet)
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function obMesh(kind) {
    const k = OB[kind]; if (k) return k();
    const B = (g, c, o) => { const key = c + JSON.stringify(o || {}); return new T.Mesh(g, MATS[key] || (MATS[key] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, flatShading: true }, o || {})))); };
    const { sph, box, cyl, cone, ico, oct } = GEO || (GEO = { sph: new T.SphereGeometry(1, 12, 9), box: new T.BoxGeometry(1, 1, 1), cyl: new T.CylinderGeometry(1, 1, 1, 10), cone: new T.ConeGeometry(1, 1, 10), ico: new T.IcosahedronGeometry(1, 0), oct: new T.OctahedronGeometry(1, 0) });
    const grp = (...ms) => { const g = new T.Group(); for (const m of ms) g.add(m); return g; };
    const mat = (g, c, o, sx, sy, sz, x, y, z) => { const m = B(g, c, o); m.scale.set(sx, sy, sz); m.position.set(x || 0, y || 0, z || 0); return m; };
    const F = {
      apple: () => grp(mat(sph, 0xc8202a, { roughness: .3 }, 1, .95, 1), mat(cyl, 0x4a3020, {}, .08, .4, .08, 0, 1, 0), mat(sph, 0x3a8a2a, {}, .35, .08, .2, .3, 1.05, 0)),
      shard: () => mat(box, 0xe8f0ff, { metalness: 1, roughness: .05, emissive: 0x6a4aff, emissiveIntensity: .4 }, .2, 2.2, 1.2),
      leaf: () => mat(sph, 0x3a8a2a, { emissive: 0x0a3a0a, emissiveIntensity: .6 }, 1.8, .1, .9),
      log: () => mat(cyl, 0x6a4a2a, {}, .6, 4, .6),
      bubble: () => mat(sph, 0xbfefff, { transparent: true, opacity: .45, metalness: .3, roughness: .05, emissive: 0x2a8aaa, emissiveIntensity: .4 }, 1.2, 1.2, 1.2),
      fish: () => grp(mat(sph, 0xffa040, { emissive: 0x6a3010, emissiveIntensity: .6 }, .9, .6, .35), mat(cone, 0xffa040, {}, .45, .6, .2, -1, 0, 0)),
      bell: () => grp(mat(cone, 0xb08a3a, { metalness: .85, roughness: .3 }, 1, 1.6, 1), mat(sph, 0xb08a3a, { metalness: .85, roughness: .3 }, .55, .4, .55, 0, .85, 0)),
      gargoyle: () => grp(mat(ico, 0x8a8a92, {}, 1, 1, 1), mat(cone, 0x6a6a72, {}, .2, .7, .2, .5, .9, 0), mat(cone, 0x6a6a72, {}, .2, .7, .2, -.5, .9, 0)),
      column: () => mat(cyl, 0xece4d4, {}, .7, 4, .7),
      amphora: () => grp(mat(sph, 0xc06a2a, {}, .8, 1.1, .8), mat(cyl, 0x1a1410, {}, .3, .7, .3, 0, 1.1, 0)),
      lantern: () => grp(mat(sph, 0xe83a2a, { emissive: 0xc02010, emissiveIntensity: 1.6 }, .9, 1.2, .9), mat(cyl, 0xd8b040, {}, .5, .2, .5, 0, 1.2, 0)),
      kite: () => mat(oct, 0xe8c040, { emissive: 0x6a4a10, emissiveIntensity: .6 }, 1.4, 1.8, .1),
      raven: () => grp(mat(oct, 0x14141c, {}, .5, .4, 1), mat(sph, 0x14141c, {}, 1.6, .05, .5)),
      banner: () => mat(box, 0x2a4aa8, { emissive: 0x0a1a4a, emissiveIntensity: .8 }, .1, 2.4, 1.4),
      crate: () => mat(box, 0x8a6a3a, {}, 1.6, 1.6, 1.6),
      sandstone: () => mat(ico, 0xd8b070, {}, 1.4, 1, 1.4),
      ice: () => mat(oct, 0xd8f4ff, { metalness: .2, roughness: .1, emissive: 0x4aa0d0, emissiveIntensity: .4, transparent: true, opacity: .85 }, .9, 1.8, .9),
      ember: () => mat(ico, 0xff6a20, { emissive: 0xff4010, emissiveIntensity: 2 }, .9, .9, .9),
      crystal: () => mat(oct, 0xc8a0ff, { emissive: 0x7a4ad8, emissiveIntensity: 1.2 }, .7, 1.6, .7)
    };
    OB[kind] = F[kind] || null; return OB[kind] ? OB[kind]() : null;
  }
  // Zielplanet mit Andeutung der Welt (Wald, Türme, Tempel, Wasser, Mauer …)
  function planetDeco(planet, deco, col) {
    const g = new T.Group(); planet.add(g); const n = 26, mats = {};
    const m = (c, o) => mats[c] || (mats[c] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, flatShading: true }, o || {})));
    const put = (geo, mt, a, b, h, s) => { const me = new T.Mesh(geo, mt), v = new T.Vector3().setFromSphericalCoords(40 + h / 2, a, b); me.position.copy(v); me.lookAt(0, 0, 0); me.rotateX(-Math.PI / 2); me.scale.setScalar(s || 1); g.add(me); };
    const cone = new T.ConeGeometry(1.6, 6, 7), cyl = new T.CylinderGeometry(1.2, 1.2, 7, 8), box = new T.BoxGeometry(5, 3, 2.4);
    for (let i = 0; i < n; i++) { const a = .5 + Math.random() * 1.6, b = Math.random() * 6.283;
      if (deco === 'trees') put(cone, m(0x1e5a2a), a, b, 6, .8 + Math.random() * .6);
      else if (deco === 'towers') { put(cyl, m(0xb8b0a0), a, b, 7, .6 + Math.random() * .5); }
      else if (deco === 'temple') put(cyl, m(0xf0e8d8), a, b, 7, .4 + Math.random() * .3);
      else if (deco === 'wall') put(box, m(0x9a948a), 1.2 + Math.sin(i * .6) * .25, i / n * 6.283, 3, 1);
      else if (deco === 'castle') { put(cyl, m(0xe8e4dc), a, b, 7, .5); put(cone, m(0x3a5aa8), a, b, 12, .5); }
      else if (deco === 'coral') put(cone, m(0xe0607a, { emissive: 0x6a1020, emissiveIntensity: .6 }), a, b, 6, .6 + Math.random() * .5);
      else if (deco === 'snow') put(cone, m(0xf0f4ff), a, b, 6, 1 + Math.random() * .8);
      else if (deco === 'lava') put(cone, m(0x3a2a24, { emissive: 0xff4010, emissiveIntensity: .5 }), a, b, 6, 1 + Math.random() * .8);
      else if (deco === 'crystal') put(cone, m(0xc8a0ff, { emissive: 0x7a4ad8, emissiveIntensity: 1 }), a, b, 6, .7);
      else if (deco === 'dunes') put(cone, m(0xd8b070), a, b, 3, 1.4);
    }
    if (deco === 'water' || deco === 'coral') { const r = new T.Mesh(new T.TorusGeometry(58, 1.2, 6, 60), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .5 })); r.rotation.x = 1.3; planet.add(r); }
  }
  const lerpC = (o, a, b, k) => o.setHex(a).lerp(new T.Color(b), k);
  function start({ fromName, toName, color = 0x8ad0ff, dist = 1, onDone, from = null, to = null, medium = null, fromN = 0, toN = 0, naut = false }) {
    if (medium) return startGround({ fromName, toName, color, dist, onDone, from, to, medium, fromN, toN, naut });
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(62, innerWidth / innerHeight, .1, 900);
    const col = new T.Color(color);
    scene.background = new T.Color(0x05040f);
    scene.fog = new T.FogExp2(0x0a0820, .0065);
    scene.add(new T.HemisphereLight(0xc8d8ff, 0x201030, 1.1));
    const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(3, 6, 4); scene.add(sun);
    // Sterne und Nebel
    const sg = new T.BufferGeometry(), sp = new Float32Array(1800 * 3);
    for (let i = 0; i < 1800; i++) { sp[i * 3] = R(-160, 160); sp[i * 3 + 1] = R(-100, 100); sp[i * 3 + 2] = R(-600, 20); }
    sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    const stars = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: .7, sizeAttenuation: true, transparent: true, opacity: .9 })); scene.add(stars);
    const neb = [];
    // weiche Nebelschleier (Farbverlauf-Sprites statt kantiger Kugeln)
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.5, 'rgba(255,255,255,.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
    const ntex = new T.CanvasTexture(cv);
    for (let i = 0; i < 9; i++) {
      const m = new T.Sprite(new T.SpriteMaterial({ map: ntex, color: col.clone().offsetHSL(R(-.1, .1), 0, R(-.15, .05)), transparent: true, opacity: .35, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
      const sz = R(90, 200); m.scale.set(sz, sz * R(.5, .9), 1); m.position.set(R(-160, 160), R(-70, 70), R(-520, -150)); scene.add(m); neb.push(m);
    }
    // Zielwelt am Horizont
    const planet = new T.Mesh(new T.SphereGeometry(40, 32, 20), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .35, roughness: .8 }));
    planet.position.set(0, 10, -620); scene.add(planet); if (to && to.deco) planetDeco(planet, to.deco, col);
    const halo = new T.Mesh(new T.SphereGeometry(47, 24, 16), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .18, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    halo.position.copy(planet.position); scene.add(halo);
    // Schiff
    const ship = makeShip(); ship.visible = true; ship.scale.setScalar(.55); ship.rotation.set(0, Math.PI, 0); scene.add(ship);
    const trail = new T.Mesh(new T.ConeGeometry(.18, 1.2, 10), new T.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: .45, blending: T.AdditiveBlending, depthWrite: false }));
    trail.rotation.x = -Math.PI / 2; scene.add(trail);
    const rockG = new T.IcosahedronGeometry(1, 0), rockM = new T.MeshStandardMaterial({ color: 0x6a5a7a, roughness: .9, flatShading: true });
    const droneG = new T.OctahedronGeometry(.9, 0), droneM = new T.MeshStandardMaterial({ color: 0x8a4ac8, emissive: 0x6a2aff, emissiveIntensity: 1.2, roughness: .3 });
    const ringG = new T.TorusGeometry(1.6, .14, 8, 28), ringM = new T.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: .9 });
    const shotG = new T.SphereGeometry(.18, 8, 6), shotM = new T.MeshBasicMaterial({ color: 0x9af0ff });
    const len = Math.round(30 + Math.min(4, dist) * 4);   // Sekunden
    F = { scene, cam, ship, trail, planet, halo, stars, neb, obj: [], shots: [], t: 0, len, x: 0, y: 0, vx: 0, vy: 0, hp: 100, hits: 0, got: 0, kills: 0, spawn: 0, fire: 0, onDone, done: false, rockG, rockM, droneG, droneM, ringG, ringM, shotG, shotM, inv: 0,
      from: Object.assign({}, RIFT, from || {}), to: Object.assign({}, RIFT, to || {}), bgc: new T.Color(), fgc: new T.Color(), nb0: neb.map(n => n.material.color.clone()) };
    if (from) { scene.background.setHex(F.from.bg); scene.fog.color.setHex(F.from.fog); }
    hud.show(fromName, toName);
    sfx('quest');
  }

  function add(kind, theme) {
    const f = F; let m;
    if (kind === 'rock' && theme && theme.obst) { m = obMesh(theme.obst[Math.random() * theme.obst.length | 0]); if (m) { const s = R(1, 1.8); m.scale.multiplyScalar(s); m.rotation.set(R(0, 6), R(0, 6), R(0, 6)); m.userData.r = s * 1.3; } }
    if (m) { }
    else if (kind === 'rock') { m = new T.Mesh(f.rockG, f.rockM); const s = R(1.2, 3.2); m.scale.set(s, s * R(.7, 1.2), s); }
    else if (kind === 'drone') m = new T.Mesh(f.droneG, f.droneM);
    else { m = new T.Mesh(f.ringG, f.ringM); }
    m.position.set(R(-10, 10), R(-5.5, 6), -160);
    f.scene.add(m); f.obj.push({ m, kind, hp: kind === 'drone' ? 3 : kind === 'rock' ? 5 : 0, r: kind === 'rock' ? (m.userData.r || m.scale.x * .95) : kind === 'drone' ? 1 : 1.7, ph: R(0, 6) });
  }

  function update(dt) {
    const f = F; if (!f || f.done) return;
    if (f.medium) return updateGround(dt);
    f.t += dt; f.inv = Math.max(0, f.inv - dt);
    const sp = 42 + Math.min(1, f.t / 4) * 18;   // Fluggeschwindigkeit
    // Steuern
    const [ix, iy] = inputVec();
    f.vx += (ix * 14 - f.vx) * Math.min(1, dt * 6); f.vy += (-iy * 10 - f.vy) * Math.min(1, dt * 6);
    f.x = Math.max(-10, Math.min(10, f.x + f.vx * dt)); f.y = Math.max(-5.5, Math.min(6.5, f.y + f.vy * dt));
    f.ship.position.set(f.x, f.y, 0); f.ship.rotation.z = -f.vx * .05; f.ship.rotation.x = f.vy * .03;
    f.trail.position.set(f.x, f.y, 1.1); f.trail.scale.y = 1 + Math.sin(f.t * 30) * .15;
    f.cam.position.set(f.x * .55, f.y * .55 + 3.4, 11.5); f.cam.lookAt(f.x * .7, f.y * .7 + .2, -24);
    // Hintergrund
    const pos = f.stars.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { let z = pos.getZ(i) + sp * dt * 1.6; if (z > 20) z -= 620; pos.setZ(i, z); }
    pos.needsUpdate = true;
    for (const n of f.neb) { n.position.z += sp * dt * .25; if (n.position.z > 40) n.position.z -= 560; }
    const k = Math.min(1, f.t / f.len); f.planet.position.z = -620 + k * 470 + sm(.86, 1, k) * 130; f.halo.position.z = f.planet.position.z; f.planet.rotation.y += dt * .1;
    // Himmel: alte Welt → Rissraum → neue Welt (am Ende Eintauchen in den Nebel der Zielwelt)
    const ka = 1 - sm(0, .2, k), kb = sm(.62, .92, k), dive = sm(.9, 1, k);
    lerpC(f.bgc, RIFT.bg, f.from.bg, ka); f.bgc.lerp(new T.Color(f.to.bg), kb); f.bgc.lerp(new T.Color(f.to.fog), dive); f.scene.background.copy(f.bgc);
    lerpC(f.fgc, RIFT.fog, f.from.fog, ka); f.fgc.lerp(new T.Color(f.to.fog), kb); f.scene.fog.color.copy(f.fgc); f.scene.fog.density = .0065 + dive * .03;
    f.stars.material.opacity = .9 * (1 - Math.max(ka, kb) * .75);
    f.neb.forEach((n, i) => { n.material.color.copy(f.nb0[i]).lerp(new T.Color(ka > .5 ? f.from.fog : f.to.fog).multiplyScalar(2.2), Math.max(ka, kb) * .7); });
    // Gegner, Brocken, Ringe
    f.spawn -= dt;
    if (f.spawn <= 0 && f.t < f.len - 3) { f.spawn = R(.32, .6) * (1 - k * .35); const r = Math.random(), th = k < .22 ? f.from : k > .58 ? f.to : null; add(r < .5 ? 'rock' : r < .8 ? (th && th.obst ? 'rock' : 'drone') : 'ring', th); }
    // Automatisch feuern
    f.fire -= dt;
    if (f.fire <= 0) { f.fire = .16; for (const s of [-.6, .6]) { const m = new T.Mesh(f.shotG, f.shotM); m.position.set(f.x + s, f.y + .2, -1.5); f.scene.add(m); f.shots.push(m); } }
    for (let i = f.shots.length - 1; i >= 0; i--) { const m = f.shots[i]; m.position.z -= 120 * dt; if (m.position.z < -170) { f.scene.remove(m); f.shots.splice(i, 1); } }
    for (let i = f.obj.length - 1; i >= 0; i--) {
      const o = f.obj[i], m = o.m; m.position.z += sp * dt; o.ph += dt;
      if (o.kind === 'drone') { m.position.x += Math.sin(o.ph * 2) * dt * 4; m.rotation.y += dt * 3; }
      else if (o.kind === 'rock') { m.rotation.x += dt * .8; m.rotation.y += dt * .5; }
      else m.rotation.z += dt;
      let gone = false;
      if (o.kind !== 'ring') for (let j = f.shots.length - 1; j >= 0; j--) {
        const s = f.shots[j]; if (s.position.distanceTo(m.position) < o.r + .4) { f.scene.remove(s); f.shots.splice(j, 1); if (--o.hp <= 0) { gone = true; f.kills++; sfx('hit'); break; } }
      }
      if (!gone && Math.abs(m.position.z) < 1.4) {
        const d = Math.hypot(m.position.x - f.x, m.position.y - f.y);
        if (o.kind === 'ring' && d < 1.9) { f.got += 5; gone = true; sfx('shard'); }
        else if (o.kind !== 'ring' && d < o.r + .8 && f.inv <= 0) { f.hp = Math.max(0, f.hp - (o.kind === 'rock' ? 18 : 12)); f.hits++; f.inv = .8; gone = true; sfx('hurt'); }
      }
      if (gone || m.position.z > 12) { f.scene.remove(m); f.obj.splice(i, 1); }
    }
    hud.update({ prog: k, hp: f.hp, got: f.got + f.kills * 2 });
    if (f.t >= f.len) finish(false);
  }

  function render() { if (!F) return; F.cam.aspect = innerWidth / innerHeight; F.cam.updateProjectionMatrix(); renderer.render(F.scene, F.cam); }

  function finish(skipped) {
    const f = F; if (!f || f.done) return; f.done = true;
    const reward = skipped ? 0 : f.got + f.kills * 2 + (f.hp > 0 ? Math.round(f.hp / 5) : 0);
    f.scene.remove(f.ship); if (f.walker) f.scene.remove(f.walker.root); for (const o of f.keep || []) if (o.parent) o.parent.remove(o);   // gehören der Spielwelt-Fabrik: nicht freigeben
    const keepG = new Set(GEO ? Object.values(GEO) : []); f.scene.traverse(o => { if (o.geometry && !keepG.has(o.geometry)) o.geometry.dispose(); }); F = null; hud.hide();
    f.onDone({ reward, kills: f.kills, hits: f.hits, skipped, ship: f.ship });
  }

  /* ---------- Reise übers Weltmeer (Segelschiff) oder zu Fuß über den Wanderpfad ----------
     Gleiche Bedienung wie der Flug: links/rechts lenken, Hindernissen ausweichen, Kisten und Ringe sammeln.
     Zu Fuß dauert die Reise deutlich länger, dafür liegt mehr am Weg. */
  function canTex(base, fn, n = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = n; const c = cv.getContext('2d'); c.fillStyle = base; c.fillRect(0, 0, n, n); fn(c, n); const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; return t; }
  function makeBoat(col) {
    const g = new T.Group(), wood = new T.MeshStandardMaterial({ color: 0x8a5a32, roughness: .8 }), dark = new T.MeshStandardMaterial({ color: 0x4a2e1a, roughness: .9 });
    const hull = new T.Mesh(new T.CylinderGeometry(1.1, .55, 4.4, 10, 1, false, 0, Math.PI), wood); hull.rotation.set(Math.PI / 2, 0, Math.PI); hull.position.y = .55; hull.scale.set(1, 1, .7); g.add(hull);
    const deck = new T.Mesh(new T.BoxGeometry(2.1, .12, 4.2), dark); deck.position.y = .6; g.add(deck);
    const bow = new T.Mesh(new T.ConeGeometry(.75, 1.4, 8), wood); bow.rotation.x = -Math.PI / 2; bow.position.set(0, .45, -2.7); bow.scale.set(1.35, 1, .55); g.add(bow);
    const mast = new T.Mesh(new T.CylinderGeometry(.09, .11, 5, 8), dark); mast.position.set(0, 3, -.3); g.add(mast);
    const sailM = new T.MeshStandardMaterial({ color: 0xfff6e6, roughness: .9, side: T.DoubleSide }), sail = new T.Mesh(new T.PlaneGeometry(2.6, 2.8, 6, 6), sailM); sail.position.set(0, 3.2, -.2); g.add(sail);
    const pa = sail.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, -Math.cos(pa.getX(i) / 1.3 * 1.57) * .45); pa.needsUpdate = true; sail.geometry.computeVertexNormals();
    const band = new T.Mesh(new T.PlaneGeometry(2.62, .35), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .25, side: T.DoubleSide })); band.position.set(0, 3.0, -.62); g.add(band);
    const flag = new T.Mesh(new T.PlaneGeometry(.8, .45), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .4, side: T.DoubleSide })); flag.position.set(.4, 5.6, -.3); g.add(flag); g.userData.flag = flag; g.userData.sail = sail;
    const cab = new T.Mesh(new T.BoxGeometry(1.2, .7, 1), wood); cab.position.set(0, .95, 1.4); g.add(cab);
    const lamp = new T.Mesh(new T.SphereGeometry(.14, 8, 6), new T.MeshBasicMaterial({ color: 0xffd080 })); lamp.position.set(0, 1.45, 1.4); g.add(lamp);
    return g;
  }
  function startGround({ fromName, toName, color, dist, onDone, from, to, medium, fromN, toN, naut }) {
    const sea = medium === 'sea', scene = new T.Scene(), cam = new T.PerspectiveCamera(58, innerWidth / innerHeight, .1, 700), col = new T.Color(color);
    const fT = Object.assign({}, RIFT, from || {}), tT = Object.assign({}, RIFT, to || {});
    const sky0 = new T.Color(sea ? 0x6ab4ec : 0x8acbe8).lerp(new T.Color(fT.fog), .18), sky1 = new T.Color(sea ? 0x6ab4ec : 0x8acbe8).lerp(new T.Color(tT.fog), .25);
    scene.background = sky0.clone(); scene.fog = new T.Fog(sky0.getHex(), 90, sea ? 320 : 240);
    scene.add(new T.HemisphereLight(0xdfefff, sea ? 0x1a3a6a : 0x2a4a1a, .62)); const sun = new T.DirectionalLight(0xfff0d8, 1.05); sun.position.set(-6, 10, 4); scene.add(sun);
    const tex = sea ? canTex('#1e6aa8', (c, n) => { for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(${180 + Math.random() * 60 | 0},${220 + Math.random() * 35 | 0},255,${.15 + Math.random() * .3})`; c.lineWidth = 1 + Math.random() * 2; const x = Math.random() * n, y = Math.random() * n, w = 10 + Math.random() * 30; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 4, x + w, y); c.stroke(); } })
      : canTex('#4a8a3a', (c, n) => { for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${40 + Math.random() * 60 | 0},${110 + Math.random() * 70 | 0},${30 + Math.random() * 40 | 0},.6)`; c.fillRect(Math.random() * n, Math.random() * n, 2, 4 + Math.random() * 5); } });
    tex.repeat.set(sea ? 10 : 14, sea ? 24 : 30);
    const ground = new T.Mesh(new T.PlaneGeometry(320, 720), new T.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: sea ? .35 : .95, metalness: sea ? .15 : 0 })); ground.rotation.x = -Math.PI / 2; ground.position.z = -320; scene.add(ground);
    let path = null; if (!sea) { const pt = canTex('#b89a68', (c, n) => { for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${130 + Math.random() * 50 | 0},${100 + Math.random() * 40 | 0},${60 + Math.random() * 30 | 0},.7)`; c.beginPath(); c.arc(Math.random() * n, Math.random() * n, 1 + Math.random() * 3, 0, 6.3); c.fill(); } }); pt.repeat.set(1, 50);
      path = new T.Mesh(new T.PlaneGeometry(13, 720), new T.MeshStandardMaterial({ map: pt, roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .02, -320); scene.add(path); }
    // Ziel am Horizont: Insel bzw. Weltentor
    const goal = new T.Group(), keep = []; { const gc = col.clone(); if (sea) { const sand = new T.Mesh(new T.CylinderGeometry(66, 72, 3, 28), new T.MeshStandardMaterial({ color: 0xe8d8a0 })); goal.add(sand);
        if (makeIsle && toN) { const isl = makeIsle(toN); isl.scale.setScalar(32); isl.position.y = 2; goal.add(isl); keep.push(isl); } else { const isl = new T.Mesh(new T.ConeGeometry(60, 26, 18), new T.MeshStandardMaterial({ color: 0x5a9a4a })); isl.position.y = 4; goal.add(isl); } }
      const arch = new T.Mesh(new T.TorusGeometry(14, 1.8, 10, 32, Math.PI), new T.MeshStandardMaterial({ color: gc, emissive: gc, emissiveIntensity: .8 })); arch.position.y = sea ? 16 : 0; goal.add(arch);
      const gl = new T.Mesh(new T.CircleGeometry(12, 24, 0, Math.PI), new T.MeshBasicMaterial({ color: gc, transparent: true, opacity: .35, side: T.DoubleSide, depthWrite: false })); gl.position.y = arch.position.y; goal.add(gl); }
    goal.position.set(0, 0, -650); scene.add(goal);
    // Spielerfigur: Segelschiff oder Zotik zu Fuß
    let ship, walker = null; if (sea && naut && makeShip) { ship = makeShip(); ship.visible = true; ship.scale.setScalar(1.15); ship.rotation.set(0, Math.PI, 0); ship.userData.naut = 1; scene.add(ship); } else if (sea) { ship = makeBoat(color); scene.add(ship); } else { walker = makeWalker(); ship = walker.root; ship.rotation.y = Math.PI; scene.add(ship); }
    const wake = new T.Mesh(new T.PlaneGeometry(1.6, 7), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: sea ? .35 : 0, depthWrite: false })); wake.rotation.x = -Math.PI / 2; wake.position.set(0, .05, 4.6); scene.add(wake);
    const len = Math.round(sea ? 40 + Math.min(4, dist) * 10 : 62 + Math.min(4, dist) * 16);
    const isles = [fromN, toN]; for (let k = Math.min(fromN, toN) + 1; k < Math.max(fromN, toN) && k < 12; k++) isles.push(k); for (const k of [2, 3, 4, 5, 6, 7, 8, 9, 21, 22, 23, 24, 25, 26, 27]) if (isles.length < 6 && !isles.includes(k)) isles.push(k);
    F = { medium, sea, scene, cam, ship, walker, wake, ground, path, tex, goal, keep, isles: isles.filter(Boolean), iso: 0, obj: [], deco: [], shots: [], t: 0, len, x: 0, vx: 0, hp: 100, hits: 0, got: 0, kills: 0, spawn: 0, dspawn: 0, onDone, done: false, inv: 0, sky0, sky1, col,
      rockG: new T.IcosahedronGeometry(1, 0), rockM: new T.MeshStandardMaterial({ color: sea ? 0x5a6a7a : 0x7a7068, roughness: .9, flatShading: true }), ringG: new T.TorusGeometry(1.1, .12, 8, 24), ringM: new T.MeshBasicMaterial({ color: 0xffe27a }),
      boxG: new T.BoxGeometry(1, 1, 1), boxM: new T.MeshStandardMaterial({ color: 0xa8743a, roughness: .8 }), leafM: new T.MeshStandardMaterial({ color: new T.Color(0x3a9a4a).lerp(col, .2), roughness: .85 }), leaf2M: new T.MeshStandardMaterial({ color: new T.Color(0x5ab85a).lerp(col, .15), roughness: .85 }), blobG: new T.SphereGeometry(1, 14, 10), trunkM: new T.MeshStandardMaterial({ color: 0x6a4a2a }),
      sandM: new T.MeshStandardMaterial({ color: 0xe8d8a0 }), roofM: new T.MeshStandardMaterial({ color: new T.Color(0xb04a3a).lerp(col, .3) }), wallM: new T.MeshStandardMaterial({ color: 0xf0e0c0 }), vortM: new T.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: .6 }) };
    for (let z = -20; z > -300; z -= (sea && makeIsle ? 16 : 9)) gdeco(z);
    hud.show(fromName, toName, medium); sfx('quest');
  }
  function gdeco(z) {
    const f = F, side = Math.random() < .5 ? -1 : 1, x = side * (f.sea ? R(22, 90) : R(10, 50)), g = new T.Group();
    if (f.sea && makeIsle && f.isles.length) { const n = f.isles[f.iso++ % f.isles.length], sc = R(5, 9), isl = makeIsle(n); isl.scale.setScalar(sc); isl.rotation.y = R(0, 6.3); isl.position.y = .3; g.add(isl); f.keep.push(isl);
      const s = new T.Mesh(f.isandG || (f.isandG = new T.CylinderGeometry(1, 1.15, .5, 18)), f.sandM); s.scale.set(sc * 1.15, 1, sc * 1.15); g.add(s); }
    else if (f.sea) { const r = R(4, 10); const s = new T.Mesh(new T.CylinderGeometry(r, r * 1.2, 1.2, 12), f.sandM); g.add(s); const h = new T.Mesh(f.blobG, f.leafM); h.scale.set(r * .8, r * R(.35, .7), r * .8); h.position.y = .4; g.add(h);
      for (let i = 0; i < 2; i++) { const tr = new T.Mesh(new T.CylinderGeometry(.18, .25, 4, 6), f.trunkM); tr.position.set(R(-r * .6, r * .6), 2.4, R(-r * .4, r * .4)); tr.rotation.z = R(-.3, .3); g.add(tr); const cr = new T.Mesh(f.blobG, f.leaf2M); cr.scale.set(1.5, .45, 1.5); cr.position.set(tr.position.x, 4.4, tr.position.z); g.add(cr); } }
    else if (Math.random() < .12) { const w = new T.Mesh(f.boxG, f.wallM); w.scale.set(4, 3, 4); w.position.y = 1.5; g.add(w); const r = new T.Mesh(new T.ConeGeometry(3.4, 2.4, 4), f.roofM); r.position.y = 4.2; r.rotation.y = .785; g.add(r); }
    else { const n = 1 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) { const hh = R(3, 7), tr = new T.Mesh(new T.CylinderGeometry(.25, .35, hh * .4, 6), f.trunkM); tr.position.set(R(-2, 2), hh * .2, R(-2, 2)); g.add(tr); for (let b = 0; b < 3; b++) { const rr = R(1, 1.7) * hh / 5, cr = new T.Mesh(f.blobG, b % 2 ? f.leaf2M : f.leafM); cr.scale.setScalar(rr); cr.position.set(tr.position.x + R(-.6, .6), hh * .4 + rr * .6 + b * .5, tr.position.z + R(-.6, .6)); g.add(cr); } } }
    g.position.set(x, 0, z); f.scene.add(g); f.deco.push(g);
  }
  function updateGround(dt) {
    const f = F; f.t += dt; f.inv = Math.max(0, f.inv - dt); const sp = f.sea ? 26 : 13, k = Math.min(1, f.t / f.len);
    const [ix] = inputVec(); f.vx += (ix * (f.sea ? 9 : 7) - f.vx) * Math.min(1, dt * 5); f.x = Math.max(-6.5, Math.min(6.5, f.x + f.vx * dt));
    if (f.sea) { f.ship.position.set(f.x, Math.sin(f.t * 2) * .15, 0); f.ship.rotation.set(Math.sin(f.t * 1.6) * .03, 0, -f.vx * .05 + Math.sin(f.t * 1.3) * .04); const fl = f.ship.userData.flag; if (fl) fl.rotation.y = Math.sin(f.t * 6) * .3;
      f.wake.position.set(f.x, .05, 4.4); f.wake.scale.x = 1 + Math.sin(f.t * 9) * .1; f.cam.position.set(f.x * .5, 5.4, 11); f.cam.lookAt(f.x * .7, .6, -22); }
    else { f.ship.position.set(f.x, 0, 0); f.ship.rotation.y = Math.PI - f.vx * .06; f.walker.anim(f.t, 1); f.cam.position.set(f.x * .5, 3.8, 7.6); f.cam.lookAt(f.x * .7, 1.2, -16); }
    f.tex.offset.y += sp * dt / (720 / f.tex.repeat.y); if (f.path) f.path.material.map.offset.y += sp * dt / (720 / 50);
    if (f.sea) f.tex.offset.x = Math.sin(f.t * .3) * .05;
    f.scene.background.copy(f.sky0).lerp(f.sky1, k); f.scene.fog.color.copy(f.scene.background);
    f.goal.position.z = -650 + k * 520; f.goal.rotation.y = Math.sin(f.t * .2) * .05;
    for (let i = f.deco.length - 1; i >= 0; i--) { const d = f.deco[i]; d.position.z += sp * dt; if (d.position.z > 20) { f.scene.remove(d); f.deco.splice(i, 1); } }
    f.dspawn -= dt; if (f.dspawn <= 0) { f.dspawn = (f.sea && makeIsle ? 16 : 9) / sp; if (f.t < f.len - 4) gdeco(-300); }
    f.spawn -= dt;
    if (f.spawn <= 0 && f.t < f.len - 4) { f.spawn = R(.7, 1.3) * (f.sea ? 1 : 1.25); const r = Math.random(); gadd(r < .45 ? 'rock' : r < .6 ? (f.sea ? 'vortex' : 'log') : r < .78 ? 'box' : 'ring'); }
    for (let i = f.obj.length - 1; i >= 0; i--) {
      const o = f.obj[i], m = o.m; m.position.z += sp * dt; o.ph += dt;
      if (o.kind === 'ring') m.rotation.y += dt * 2; else if (o.kind === 'box') m.position.y = (f.sea ? .2 : .5) + Math.sin(o.ph * 2.5) * .15; else if (o.kind === 'vortex') m.rotation.z += dt * 3;
      let gone = false;
      if (Math.abs(m.position.z) < 1.3) { const d = Math.abs(m.position.x - f.x);
        if (o.kind === 'ring' && d < 1.4) { f.got += 4; gone = true; sfx('shard'); }
        else if (o.kind === 'box' && d < 1.3) { f.got += 10; gone = true; sfx('chest'); }
        else if ((o.kind === 'rock' || o.kind === 'log' || o.kind === 'vortex') && d < o.r + .7 && f.inv <= 0) { f.hp = Math.max(0, f.hp - (o.kind === 'vortex' ? 10 : 16)); f.hits++; f.inv = .9; sfx('hurt'); if (o.kind !== 'vortex') gone = true; } }
      if (gone || m.position.z > 14) { f.scene.remove(m); f.obj.splice(i, 1); }
    }
    hud.update({ prog: k, hp: f.hp, got: f.got });
    if (f.t >= f.len) finish(false);
  }
  function gadd(kind) {
    const f = F, x = R(-6, 6); let m, r = 1;
    if (kind === 'rock') { m = new T.Mesh(f.rockG, f.rockM); r = R(.8, 1.4); m.scale.set(r, r * (f.sea ? 1.3 : .9), r); m.position.set(x, f.sea ? r * .4 : r * .6, -200); }
    else if (kind === 'log') { m = new T.Mesh(new T.CylinderGeometry(.35, .35, 3.2, 8), f.trunkM); m.rotation.z = Math.PI / 2; r = 1.5; m.position.set(x, .35, -200); }
    else if (kind === 'vortex') { m = new T.Mesh(new T.TorusGeometry(1.4, .22, 6, 20), f.vortM); m.rotation.x = -Math.PI / 2; r = 1.5; m.position.set(x, .08, -200); }
    else if (kind === 'box') { m = new T.Mesh(f.boxG, f.boxM); m.scale.setScalar(.9); m.position.set(x, .5, -200); }
    else { m = new T.Mesh(f.ringG, f.ringM); m.position.set(x, 1.3, -200); }
    f.scene.add(m); f.obj.push({ kind, m, r, ph: Math.random() * 6 });
  }

  return { start, update, render, skip: () => finish(true), get on() { return !!F; } };
}
