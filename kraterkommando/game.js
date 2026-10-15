(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'easygames.kraterkommando.match.v1';
  const SETTINGS = 'easygames.kraterkommando.settings.v1';
  const SIZE = 40, GRID = 40, TURN_SECONDS = 45;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const names = [['Nova', 'Keks', 'Pixel'], ['Funk', 'Momo', 'Komet']];
  const weapons = {
    rocket: { radius: 4.1, damage: 48, ammo: Infinity },
    grenade: { radius: 4.7, damage: 55, ammo: 3 },
    cluster: { radius: 2.6, damage: 26, ammo: 2 },
    airstrike: { radius: 3.4, damage: 34, ammo: 2 },
    teleport: { radius: 0, damage: 0, ammo: 2 }
  };
  let scene, camera, renderer, terrain, aimLine, selection, clock;
  let S = null, active = false, paused = false, busy = false, projectile = null, particles = [], botTimeout = 0;
  let bodies = [], deco = [], keys = {}, heldMove = '', cameraAz = .72, camDistance = 47;
  let last = 0, timerAcc = 0, messageTimer = 0, nextTurnTimer = 0, flightTime = 0, lastMoveSave = 0, matchId = 0;
  const materials = {};
  const updateLoad = (v, s) => { $('progress').style.width = v + '%'; $('loadStatus').textContent = s; };
  function announce(s, ms = 2200) {
    $('message').textContent = s; $('message').classList.add('show');
    clearTimeout(messageTimer); messageTimer = setTimeout(() => $('message').classList.remove('show'), ms);
  }
  function save() {
    if (!S) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) { announce('Speicher voll – Gefecht konnte nicht gespeichert werden'); }
  }
  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || s.version !== 1 || !Array.isArray(s.heights) || s.heights.length !== (GRID + 1) ** 2 || !Array.isArray(s.units) || s.units.length !== 6) return null;
      return s;
    } catch (_) { return null; }
  }
  function show(which) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('active', el.id === which);
  }
  function noise(x, z, seed) {
    const a = Math.sin(x * .35 + seed) * Math.cos(z * .31 + seed * .4);
    const b = Math.sin(x * .71 + z * .29 + seed * 1.8) * .45;
    const c = Math.cos(x * .15 - z * .47 + seed * .3) * .65;
    return a + b + c;
  }
  function generatedHeights(seed) {
    const h = [];
    for (let z = 0; z <= GRID; z++) for (let x = 0; x <= GRID; x++) {
      const wx = x - GRID / 2, wz = z - GRID / 2;
      const edge = Math.max(Math.abs(wx), Math.abs(wz));
      h.push(clamp(4.2 + noise(wx, wz, seed) * .78 - Math.max(0, edge - 14) * .55, .25, 7.5));
    }
    return h;
  }
  function height(x, z) {
    if (!S) return 0;
    const gx = clamp((x + SIZE / 2) / SIZE * GRID, 0, GRID - .001);
    const gz = clamp((z + SIZE / 2) / SIZE * GRID, 0, GRID - .001);
    const ix = Math.floor(gx), iz = Math.floor(gz), tx = gx - ix, tz = gz - iz;
    const at = (a, b) => S.heights[b * (GRID + 1) + a];
    return (at(ix, iz) * (1 - tx) + at(ix + 1, iz) * tx) * (1 - tz) +
      (at(ix, iz + 1) * (1 - tx) + at(ix + 1, iz + 1) * tx) * tz;
  }
  function newState() {
    const seed = rand(0, 1000), opts = { opponent: $('opponent').value, difficulty: $('difficulty').value };
    const units = [];
    const slots = [[[-12, -11], [-14, 1], [-10, 11]], [[12, -11], [14, 1], [10, 11]]];
    for (let team = 0; team < 2; team++) for (let n = 0; n < 3; n++) {
      const p = slots[team][n];
      units.push({ team, name: names[team][n], x: p[0] + rand(-1, 1), z: p[1] + rand(-1, 1), hp: 100,
        ammo: { grenade: 3, cluster: 2, airstrike: 2, teleport: 2 } });
    }
    return { version: 1, seed, heights: generatedHeights(seed), units, team: 0, current: 0, lastByTeam: [0, 2], round: 1,
      wind: rand(-2, 2), seconds: TURN_SECONDS, opts, yaw: 90, angle: 45, power: 70, weapon: 'rocket', winner: null };
  }
  function init3D() {
    if (!window.THREE) throw Error('Three.js konnte nicht geladen werden.');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8cc5d6);
    scene.fog = new THREE.Fog(0x8cc5d6, 60, 115);
    camera = new THREE.PerspectiveCamera(53, 1, .1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    $('viewport').appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xe7faff, 0x335c48, 1.1));
    const sun = new THREE.DirectionalLight(0xffe3af, 1.55);
    sun.position.set(-20, 35, -15); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 100 });
    scene.add(sun);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshPhongMaterial({ color: 0x317fa5, transparent: true, opacity: .8, shininess: 110 }));
    water.rotation.x = -Math.PI / 2; water.position.y = .35; scene.add(water);
    const base = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 1.3, SIZE), new THREE.MeshLambertMaterial({ color: 0x344a39 }));
    base.position.y = -.7; base.receiveShadow = true; scene.add(base);
    materials.terrain = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    materials.red = new THREE.MeshStandardMaterial({ color: 0xff7479, roughness: .55 });
    materials.blue = new THREE.MeshStandardMaterial({ color: 0x61c9ff, roughness: .55 });
    materials.eye = new THREE.MeshStandardMaterial({ color: 0x162538, roughness: .3 });
    materials.white = new THREE.MeshStandardMaterial({ color: 0xffffff });
    materials.trunk = new THREE.MeshLambertMaterial({ color: 0x745340 });
    materials.leaf = new THREE.MeshLambertMaterial({ color: 0x34866f });
    selection = new THREE.Mesh(new THREE.RingGeometry(.68, .84, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    selection.rotation.x = -Math.PI / 2; scene.add(selection);
    aimLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: .35, gapSize: .22, transparent: true, opacity: .7 }));
    scene.add(aimLine);
    clock = new THREE.Clock();
    addDecor();
    addInput();
    resize(); window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }
  function addDecor() {
    const rng = n => { const v = Math.sin(n * 124.287 + 31.33) * 43758.54; return v - Math.floor(v); };
    for (let i = 0; i < 18; i++) {
      const x = (rng(i + 1) - .5) * 36, z = (rng(i + 81) - .5) * 36;
      if (Math.abs(x) > 8 && Math.abs(z) < 13) continue;
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .17, 1.1, 6), materials.trunk);
      trunk.position.y = .55; trunk.castShadow = true; group.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.75 + rng(i + 65) * .4, 0), materials.leaf);
      crown.position.y = 1.5; crown.castShadow = true; group.add(crown);
      group.position.set(x, 0, z); scene.add(group); deco.push(group);
    }
  }
  function meshTerrain() {
    if (terrain) { scene.remove(terrain); terrain.geometry.dispose(); }
    const pos = [], col = [], idx = [];
    const color = new THREE.Color();
    for (let z = 0; z <= GRID; z++) for (let x = 0; x <= GRID; x++) {
      const y = S.heights[z * (GRID + 1) + x];
      pos.push(x - SIZE / 2, y, z - SIZE / 2);
      const hue = y < 1.7 ? .12 : y > 6 ? .29 : .34;
      color.setHSL(hue, y < 1.7 ? .48 : .42, y < 1.7 ? .44 : .34 + y * .012);
      col.push(color.r, color.g, color.b);
    }
    for (let z = 0; z < GRID; z++) for (let x = 0; x < GRID; x++) {
      const a = z * (GRID + 1) + x, b = a + 1, c = a + GRID + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    terrain = new THREE.Mesh(g, materials.terrain); terrain.castShadow = true; terrain.receiveShadow = true; scene.add(terrain);
    for (const tree of deco) tree.position.y = height(tree.position.x, tree.position.z);
  }
  function makeUnit(u) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(.63, 16, 12), materials[u.team ? 'blue' : 'red']);
    body.scale.y = .8; body.position.y = .63; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 12), materials[u.team ? 'blue' : 'red']);
    head.position.y = 1.25; head.castShadow = true; g.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(.44, 16, 8, 0, Math.PI * 2, 0, Math.PI * .5), new THREE.MeshLambertMaterial({ color: u.team ? 0x17749e : 0xa93045 }));
    helmet.position.y = 1.35; helmet.castShadow = true; g.add(helmet);
    for (const dx of [-.16, .16]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.085, 8, 8), materials.white);
      eye.position.set(dx, 1.29, -.37); g.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), materials.eye);
      pupil.position.set(dx, 1.29, -.44); g.add(pupil);
    }
    const barBack = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .13), new THREE.MeshBasicMaterial({ color: 0x14283d, side: THREE.DoubleSide }));
    barBack.position.y = 1.95; g.add(barBack);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(1.21, .09), new THREE.MeshBasicMaterial({ color: u.team ? 0x79d6ff : 0xff8b92, side: THREE.DoubleSide }));
    bar.position.set(0, 1.95, .008); g.add(bar); g.userData.bar = bar;
    scene.add(g); return g;
  }
  function syncBodies() {
    while (bodies.length) { const b = bodies.pop(); scene.remove(b); }
    bodies = S.units.map(makeUnit);
    updateBodies();
  }
  function updateBodies() {
    S.units.forEach((u, i) => {
      const b = bodies[i]; if (!b) return;
      b.visible = u.hp > 0;
      b.position.set(u.x, height(u.x, u.z), u.z);
      b.userData.bar.scale.x = clamp(u.hp / 100, .001, 1);
      b.userData.bar.position.x = -(1 - b.userData.bar.scale.x) * .605;
      b.userData.bar.parent.rotation.y = Math.atan2(camera.position.x - u.x, camera.position.z - u.z);
    });
    const u = S.units[S.current];
    if (u && u.hp > 0) selection.position.set(u.x, height(u.x, u.z) + .06, u.z);
  }
  function crater(x, z, radius, depth) {
    for (let iz = 0; iz <= GRID; iz++) for (let ix = 0; ix <= GRID; ix++) {
      const dx = ix - GRID / 2 - x, dz = iz - GRID / 2 - z, d = Math.hypot(dx, dz);
      if (d < radius) {
        const k = Math.cos(d / radius * Math.PI / 2) ** 2;
        const i = iz * (GRID + 1) + ix;
        S.heights[i] = Math.max(.25, S.heights[i] - depth * k);
      }
    }
    meshTerrain();
  }
  function alive(team) { return S.units.some(u => u.team === team && u.hp > 0); }
  function teamHealth(team) { return S.units.filter(u => u.team === team).reduce((n, u) => n + Math.max(0, u.hp), 0); }
  function damageBlast(x, y, z, radius, maxDamage) {
    for (const u of S.units) {
      if (u.hp <= 0) continue;
      const d = Math.hypot(u.x - x, u.z - z, height(u.x, u.z) + .7 - y);
      if (d < radius + .6) {
        let amount = Math.round(maxDamage * (1 - d / (radius + .6)));
        if (amount < 1) amount = 1;
        u.hp = Math.max(0, u.hp - amount);
      }
    }
  }
  function burst(x, y, z, color = 0xffce76) {
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(.08, .2), 0), new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, y, z); scene.add(m);
      particles.push({ mesh: m, vx: rand(-7, 7), vy: rand(1, 9), vz: rand(-7, 7), life: rand(.5, 1.1) });
    }
  }
  function explode(x, y, z, kind = 'rocket', factor = 1) {
    const w = weapons[kind];
    burst(x, y, z, kind === 'cluster' ? 0xffe197 : 0xffab6c);
    damageBlast(x, y, z, w.radius * factor, w.damage * factor);
    crater(x, z, w.radius * .75 * factor, w.radius * .75 * factor);
    // Stürze durch frische Krater richten zusätzlichen Schaden an.
    for (const u of S.units) {
      if (u.hp <= 0) continue;
      const d = Math.hypot(u.x - x, u.z - z);
      if (d < w.radius * .8 * factor && height(u.x, u.z) < 1) u.hp = Math.max(0, u.hp - 8);
    }
    updateBodies(); updateHud(); save();
  }
  function projectileMesh(kind) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(kind === 'rocket' ? .22 : .29, 12, 8),
      new THREE.MeshStandardMaterial({ color: kind === 'grenade' ? 0x343f4b : 0xffde84, emissive: kind === 'rocket' ? 0x7d4816 : 0x222222 }));
    m.castShadow = true; scene.add(m); return m;
  }
  function dir(yaw, angle) {
    const y = yaw * Math.PI / 180, a = angle * Math.PI / 180;
    return new THREE.Vector3(Math.sin(y) * Math.cos(a), Math.sin(a), -Math.cos(y) * Math.cos(a));
  }
  function launch(kind, yaw = S.yaw, angle = S.angle, power = S.power, origin = null) {
    const u = S.units[S.current], d = dir(yaw, angle), speed = 10 + power * .245;
    const pos = origin || new THREE.Vector3(u.x, height(u.x, u.z) + 1.5, u.z);
    pos.addScaledVector(d, 1.15);
    projectile = { kind, pos, vel: d.multiplyScalar(speed), mesh: projectileMesh(kind), age: 0, bounces: 0 };
    projectile.mesh.position.copy(pos); flightTime = 0;
    announce(kind === 'grenade' ? 'Granate fliegt!' : 'Feuer frei!');
  }
  function removeProjectile() { if (projectile) { scene.remove(projectile.mesh); projectile.mesh.geometry.dispose(); projectile.mesh.material.dispose(); projectile = null; } }
  function finishAction() {
    busy = true; save();
    clearTimeout(nextTurnTimer);
    nextTurnTimer = setTimeout(function advance() {
      if (!active) return;
      if (paused) { nextTurnTimer = setTimeout(advance, 300); return; }
      if (!alive(0) || !alive(1)) return endMatch(alive(0) ? 0 : 1);
      nextTurn();
    }, 1350);
  }
  function nextTurn() {
    clearTimeout(botTimeout); busy = false;
    let team = 1 - S.team;
    let choices = S.units.map((u, i) => ({ u, i })).filter(o => o.u.team === team && o.u.hp > 0);
    if (!choices.length) return endMatch(1 - team);
    // Pro Team einen eigenen Zeiger führen, damit alle Figuren reihum drankommen.
    if (!Array.isArray(S.lastByTeam)) S.lastByTeam = [S.current >= 0 && S.current < 3 ? S.current : -1, 2];
    const rotated = choices.filter(o => o.i > S.lastByTeam[team]);
    const pick = (rotated.length ? rotated : choices)[0];
    S.team = team; S.current = pick.i; S.lastByTeam[team] = pick.i; S.seconds = TURN_SECONDS;
    if (team === 0) S.round++;
    S.wind = clamp(S.wind * .45 + rand(-1.8, 1.8), -3, 3);
    S.yaw = team ? -90 : 90; S.angle = 45; S.power = 70; S.weapon = 'rocket';
    syncControls(); updateHud(); updateAim(); save();
    announce((team ? 'Blau' : 'Rot') + ' ist am Zug: ' + S.units[S.current].name);
    scheduleBot();
  }
  function endMatch(winner) {
    active = false; busy = true; clearTimeout(botTimeout); clearTimeout(nextTurnTimer);
    S.winner = winner; save();
    $('resultTitle').textContent = winner === 0 ? 'Team Rot gewinnt!' : 'Team Blau gewinnt!';
    $('resultText').textContent = `Nach ${S.round} Runden steht der Sieger fest. Rot: ${teamHealth(0)} LP · Blau: ${teamHealth(1)} LP.`;
    $('result').hidden = false;
  }
  function fire() {
    if (!active || paused || busy || isBotTurn()) return;
    const u = S.units[S.current];
    if (!u || u.hp <= 0) return;
    const kind = S.weapon;
    if (kind !== 'rocket' && (u.ammo[kind] || 0) <= 0) { announce('Diese Waffe ist aufgebraucht'); return; }
    if (kind !== 'rocket') u.ammo[kind]--;
    busy = true; updateHud(); save();
    const thisMatch = matchId;
    if (kind === 'teleport') {
      const d = dir(S.yaw, 0);
      const tx = clamp(u.x + d.x * (4 + S.power * .12), -18, 18);
      const tz = clamp(u.z + d.z * (4 + S.power * .12), -18, 18);
      burst(u.x, height(u.x, u.z) + 1, u.z, 0x9eefff);
      u.x = tx; u.z = tz; burst(tx, height(tx, tz) + 1, tz, 0x9eefff);
      updateBodies(); announce('Teleportiert!'); finishAction(); return;
    }
    if (kind === 'airstrike') {
      const d = dir(S.yaw, 0), cx = clamp(u.x + d.x * (5 + S.power * .2), -18, 18), cz = clamp(u.z + d.z * (5 + S.power * .2), -18, 18);
      announce('Luftschlag im Anflug!');
      for (let i = -1; i <= 1; i++) setTimeout(function strike() {
        if (!active || thisMatch !== matchId) return;
        if (paused) { setTimeout(strike, 250); return; }
        const x = clamp(cx + d.z * i * 2.7, -19, 19), z = clamp(cz - d.x * i * 2.7, -19, 19);
        explode(x, height(x, z) + .2, z, 'airstrike');
      }, (i + 1) * 420);
      setTimeout(() => { if (thisMatch === matchId) finishAction(); }, 1500); return;
    }
    launch(kind);
  }
  function move(dx, dz) {
    if (!active || paused || busy || isBotTurn()) return;
    const u = S.units[S.current], x = clamp(u.x + dx * .34, -18.4, 18.4), z = clamp(u.z + dz * .34, -18.4, 18.4);
    if (Math.abs(height(x, z) - height(u.x, u.z)) > 1.15) return;
    if (S.units.some(v => v !== u && v.hp > 0 && Math.hypot(v.x - x, v.z - z) < 1.2)) return;
    u.x = x; u.z = z; updateBodies(); updateAim();
    if (Date.now() - lastMoveSave > 1200) { lastMoveSave = Date.now(); save(); }
  }
  function jump() {
    if (!active || paused || busy || isBotTurn()) return;
    const u = S.units[S.current], d = dir(S.yaw, 0);
    const x = clamp(u.x + d.x * 1.6, -18.4, 18.4), z = clamp(u.z + d.z * 1.6, -18.4, 18.4);
    if (S.units.some(v => v !== u && v.hp > 0 && Math.hypot(v.x - x, v.z - z) < 1.2)) return;
    const drop = height(u.x, u.z) - height(x, z);
    u.x = x; u.z = z;
    if (drop > 2.2) u.hp = Math.max(0, u.hp - Math.round((drop - 2.2) * 8));
    updateBodies(); updateHud(); updateAim(); save();
    if (u.hp <= 0) { announce(u.name + ' ist ausgeschieden!'); finishAction(); }
  }
  function isBotTurn() { return !!(S && S.opts.opponent === 'cpu' && S.team === 1); }
  function scheduleBot() {
    if (!isBotTurn() || !active) return;
    clearTimeout(botTimeout);
    botTimeout = setTimeout(() => {
      if (!isBotTurn() || paused || busy || !active) return;
      const u = S.units[S.current], targets = S.units.filter(v => v.team === 0 && v.hp > 0);
      if (!targets.length) return endMatch(1);
      targets.sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z));
      const target = targets[0], dx = target.x - u.x, dz = target.z - u.z, dist = Math.hypot(dx, dz);
      const err = S.opts.difficulty === 'hard' ? 1 : S.opts.difficulty === 'easy' ? 5 : 2.8;
      S.yaw = Math.atan2(dx, -dz) * 180 / Math.PI + rand(-err * 2, err * 2);
      S.angle = clamp(30 + dist * .36 + rand(-err, err), 20, 65);
      const range = dist * 13 / Math.max(.2, Math.sin(2 * S.angle * Math.PI / 180));
      S.power = clamp((Math.sqrt(range) - 10) / .245 + rand(-err * 2, err * 2), 25, 100);
      S.weapon = u.ammo.cluster > 0 && dist < 13 && Math.random() < .3 ? 'cluster' : 'rocket';
      syncControls(); updateAim();
      // Bot führt dieselbe Waffenaktion wie der Mensch aus.
      const was = S.opts.opponent; S.opts.opponent = 'local'; fire(); S.opts.opponent = was;
    }, 1500);
  }
  function syncControls() {
    $('yaw').value = Math.round(S.yaw); $('angle').value = Math.round(S.angle);
    $('power').value = Math.round(S.power); $('weapon').value = S.weapon;
    $('yawVal').textContent = Math.round(S.yaw) + '°';
    $('angleVal').textContent = Math.round(S.angle) + '°';
    $('powerVal').textContent = Math.round(S.power) + '%';
  }
  function updateHud() {
    if (!S) return;
    const u = S.units[S.current], bot = isBotTurn();
    $('teamHud').innerHTML = [0, 1].map(t => `<div class="team-card ${t ? 'blue' : 'red'}"><strong>${t ? '🔵 BLAU' : '🔴 ROT'} ${S.team === t ? '●' : ''}</strong><span>${S.units.filter(v => v.team === t && v.hp > 0).length} Figuren · ${teamHealth(t)} LP</span></div>`).join('');
    $('turnInfo').textContent = 'RUNDE ' + S.round + (bot ? ' · COMPUTER' : ' · ' + (S.team ? 'BLAU' : 'ROT'));
    $('unitName').textContent = u.name; $('unitHp').textContent = u.hp + ' LP';
    $('wind').textContent = (S.wind < 0 ? '← ' : '→ ') + Math.abs(S.wind).toFixed(1);
    $('timer').textContent = Math.ceil(S.seconds); $('timer').classList.toggle('urgent', S.seconds <= 10);
    for (const [id, w] of Object.entries(weapons)) {
      const o = $('weapon').querySelector(`option[value="${id}"]`);
      o.textContent = { rocket: '🚀 Rakete', grenade: '💣 Granate', cluster: '✨ Streubombe', airstrike: '✈️ Luftschlag', teleport: '🌀 Teleport' }[id] + (id === 'rocket' ? ' · ∞' : ' · ' + (u.ammo[id] || 0));
      o.disabled = id !== 'rocket' && !u.ammo[id];
    }
    for (const id of ['weapon', 'yaw', 'angle', 'power', 'fireBtn', 'jumpBtn', 'skipBtn']) $(id).disabled = bot || busy || !active;
  }
  function updateAim() {
    if (!S || !aimLine) return;
    const u = S.units[S.current], d = dir(S.yaw, S.angle), sp = 10 + S.power * .245;
    let p = new THREE.Vector3(u.x, height(u.x, u.z) + 1.5, u.z).addScaledVector(d, 1.1);
    let v = d.multiplyScalar(sp), pts = [];
    for (let i = 0; i < 33; i++) {
      pts.push(p.clone()); v.x += S.wind * .015; v.y -= 13 * .045; p.addScaledVector(v, .045);
      if (p.y < height(p.x, p.z) || Math.abs(p.x) > 20 || Math.abs(p.z) > 20) break;
    }
    aimLine.geometry.dispose(); aimLine.geometry = new THREE.BufferGeometry().setFromPoints(pts); aimLine.computeLineDistances();
    aimLine.visible = S.weapon !== 'airstrike' && S.weapon !== 'teleport' && !busy;
  }
  function startGame(continued) {
    matchId++;
    clearTimeout(botTimeout); clearTimeout(nextTurnTimer); removeProjectile();
    S = continued ? read() : newState();
    if (!S) return;
    if (!continued) save();
    active = true; paused = false; busy = false; $('pause').hidden = true; $('result').hidden = true;
    meshTerrain(); syncBodies(); syncControls(); updateHud(); updateAim(); show('game');
    S.winner == null ? (announce('Team ' + (S.team ? 'Blau' : 'Rot') + ' beginnt!'), scheduleBot()) : endMatch(S.winner);
  }
  function resize() {
    if (!renderer) return;
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function cameraUpdate() {
    if (!S) return;
    const u = S.units[S.current], focus = new THREE.Vector3(u.x * .3, 2.5, u.z * .3);
    camera.position.set(focus.x + Math.sin(cameraAz) * camDistance, 26, focus.z + Math.cos(cameraAz) * camDistance);
    camera.lookAt(focus);
    for (const b of bodies) if (b.userData.bar) b.userData.bar.parent.rotation.y = cameraAz;
  }
  function frame(time) {
    requestAnimationFrame(frame);
    const dt = Math.min(.04, last ? (time - last) / 1000 : .016); last = time;
    if (S) {
      cameraUpdate();
      if (active && !paused) {
        if (heldMove) {
          const moves = { forward: [0, -.065], backward: [0, .065], left: [-.065, 0], right: [.065, 0] };
          const m = moves[heldMove]; if (m) move(m[0], m[1]);
        }
        timerAcc += dt;
        if (timerAcc >= .1 && !busy) {
          S.seconds = Math.max(0, S.seconds - timerAcc); timerAcc = 0;
          $('timer').textContent = Math.ceil(S.seconds); $('timer').classList.toggle('urgent', S.seconds <= 10);
          if (S.seconds <= 0) { announce('Zeit abgelaufen!'); finishAction(); }
        }
        if (projectile) {
          const p = projectile; p.age += dt; flightTime += dt;
          p.vel.x += S.wind * .65 * dt; p.vel.y -= 13 * dt; p.pos.addScaledVector(p.vel, dt);
          p.mesh.position.copy(p.pos);
          const unitHit = S.units.some((u, i) => u.hp > 0 && !(i === S.current && p.age < .25) &&
            Math.hypot(u.x - p.pos.x, u.z - p.pos.z, height(u.x, u.z) + .9 - p.pos.y) < .75);
          const floorHit = p.pos.y <= height(p.pos.x, p.pos.z) + .18;
          if (p.kind === 'grenade' && floorHit && p.bounces < 2 && p.age < 2.6) {
            p.pos.y = height(p.pos.x, p.pos.z) + .23; p.vel.y = Math.abs(p.vel.y) * .46; p.vel.x *= .65; p.vel.z *= .65; p.bounces++;
          } else if (unitHit || (floorHit && p.kind !== 'grenade') || p.age > (p.kind === 'grenade' ? 3.1 : 7) ||
            Math.abs(p.pos.x) > 24 || Math.abs(p.pos.z) > 24 || p.pos.y < -3) {
            const x = clamp(p.pos.x, -19.8, 19.8), z = clamp(p.pos.z, -19.8, 19.8), y = Math.max(height(x, z), p.pos.y);
            const kind = p.kind; removeProjectile();
            if (kind === 'cluster') {
              const thisMatch = matchId;
              explode(x, y, z, 'cluster', .8);
              for (let i = 0; i < 5; i++) setTimeout(() => {
                if (!active || thisMatch !== matchId) return;
                const xx = clamp(x + rand(-3.2, 3.2), -19, 19), zz = clamp(z + rand(-3.2, 3.2), -19, 19);
                explode(xx, height(xx, zz) + .2, zz, 'cluster', .7);
              }, 130 + i * 115);
              setTimeout(() => { if (thisMatch === matchId) finishAction(); }, 850);
            } else { explode(x, y, z, kind); finishAction(); }
          }
          if (p && projectile && p.kind === 'grenade' && p.age > 3.1) {
            const x = p.pos.x, z = p.pos.z; removeProjectile(); explode(x, height(x, z), z, 'grenade'); finishAction();
          }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]; p.life -= dt; p.vy -= 12 * dt;
          p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
          p.mesh.scale.setScalar(Math.max(.01, p.life));
          if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1); }
        }
      }
    }
    renderer.render(scene, camera);
  }
  function addInput() {
    let dragging = false, lastX = 0;
    renderer.domElement.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; renderer.domElement.setPointerCapture(e.pointerId); });
    renderer.domElement.addEventListener('pointermove', e => { if (!dragging) return; cameraAz -= (e.clientX - lastX) * .006; lastX = e.clientX; });
    renderer.domElement.addEventListener('pointerup', () => dragging = false);
    renderer.domElement.addEventListener('wheel', e => { camDistance = clamp(camDistance + Math.sign(e.deltaY) * 2, 28, 72); }, { passive: true });
    document.addEventListener('keydown', e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (k === 'escape') return togglePause();
      if (!active || paused) return;
      if (k === 'q') cameraAz -= .13;
      if (k === 'e') cameraAz += .13;
      if (k === ' ') fire();
      if (k === 'shift') jump();
      const m = { w: [0, -.4], arrowup: [0, -.4], s: [0, .4], arrowdown: [0, .4],
        a: [-.4, 0], arrowleft: [-.4, 0], d: [.4, 0], arrowright: [.4, 0] }[k];
      if (m && !e.repeat) move(m[0], m[1]);
    });
    document.querySelectorAll('[data-move]').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); heldMove = btn.dataset.move; btn.setPointerCapture(e.pointerId); });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, () => heldMove = '');
    });
  }
  function togglePause(force) {
    if (!active || !S) return;
    paused = force === undefined ? !paused : force;
    $('pause').hidden = !paused;
    if (!paused) scheduleBot(); else clearTimeout(botTimeout);
    save();
  }
  function boot() {
    updateLoad(30, 'Lade Spielregeln');
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS) || '{}');
      if (settings.opponent) $('opponent').value = settings.opponent;
      if (settings.difficulty) $('difficulty').value = settings.difficulty;
    } catch (_) {}
    init3D();
    updateLoad(80, 'Baue Insel');
    $('newGame').onclick = () => {
      if (read() && !confirm('Das gespeicherte Gefecht durch ein neues ersetzen?')) return;
      try { localStorage.setItem(SETTINGS, JSON.stringify({ opponent: $('opponent').value, difficulty: $('difficulty').value })); } catch (_) {}
      startGame(false);
    };
    $('continueGame').onclick = () => startGame(true);
    $('pauseBtn').onclick = () => togglePause();
    $('resumeBtn').onclick = () => togglePause(false);
    $('saveQuitBtn').onclick = () => { save(); paused = false; active = false; clearTimeout(botTimeout); $('pause').hidden = true; $('continueGame').hidden = false; show('menu'); };
    $('restartBtn').onclick = () => { if (confirm('Ein neues Gefecht starten?')) startGame(false); };
    $('againBtn').onclick = () => startGame(false);
    $('resultMenuBtn').onclick = () => { $('result').hidden = true; show('menu'); $('continueGame').hidden = true; };
    $('fireBtn').onclick = fire; $('jumpBtn').onclick = jump;
    $('skipBtn').onclick = () => { if (!busy && !isBotTurn()) { announce('Zug beendet'); finishAction(); } };
    for (const id of ['yaw', 'angle', 'power', 'weapon']) $(id).addEventListener('input', () => {
      S.yaw = +$('yaw').value; S.angle = +$('angle').value; S.power = +$('power').value; S.weapon = $('weapon').value;
      syncControls(); updateAim(); save();
    });
    addEventListener('pagehide', save);
    const saved = read(); $('continueGame').hidden = !saved || saved.winner != null;
    updateLoad(100, 'Bereit');
    setTimeout(() => show('menu'), 420);
  }
  window.addEventListener('load', () => {
    try { boot(); }
    catch (e) { updateLoad(100, 'Fehler beim Laden'); $('loading').querySelector('p').textContent = e.message || '3D-Grafik konnte nicht gestartet werden.'; }
  });
})();
