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
  let scene, camera, renderer, terrain, aimLine, selection, impactRing, clock;
  let S = null, active = false, paused = false, busy = false, projectile = null, particles = [], botTimeout = 0;
  let bodies = [], deco = [], cameraAz = .72, camDistance = 26, cameraFocus = null, stickX = 0, stickY = 0, charging = false;
  const pressed = new Set();
  let last = 0, timerAcc = 0, messageTimer = 0, nextTurnTimer = 0, flightTime = 0, lastMoveSave = 0, matchId = 0, shake = 0, audioContext = null;
  const materials = {};
  function sound(freq, duration = .16, type = 'square', gain = .035) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const osc = audioContext.createOscillator(), vol = audioContext.createGain(), t = audioContext.currentTime;
      osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(Math.max(35, freq * .38), t + duration);
      vol.gain.setValueAtTime(gain, t); vol.gain.exponentialRampToValueAtTime(.001, t + duration);
      osc.connect(vol).connect(audioContext.destination); osc.start(t); osc.stop(t + duration);
    } catch (_) {}
  }
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
    scene.background = new THREE.Color(0xa9d9df);
    scene.fog = new THREE.Fog(0xa9d9df, 42, 95);
    camera = new THREE.PerspectiveCamera(59, 1, .1, 180);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    $('viewport').appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xf0fcff, 0x566447, 1.25));
    const sun = new THREE.DirectionalLight(0xffe5b7, 1.6);
    sun.position.set(-20, 35, -15); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 100 });
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshPhongMaterial({ color: 0x3a88a0, shininess: 95, transparent: true, opacity: .78 }));
    water.rotation.x = -Math.PI / 2; water.position.y = .15; scene.add(water);
    const base = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 1.5, SIZE), new THREE.MeshLambertMaterial({ color: 0x65543b }));
    base.position.y = -.75; base.receiveShadow = true; scene.add(base);
    materials.terrain = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    materials.red = new THREE.MeshStandardMaterial({ color: 0xff8777, roughness: .68 });
    materials.blue = new THREE.MeshStandardMaterial({ color: 0x78d5f1, roughness: .68 });
    materials.eye = new THREE.MeshStandardMaterial({ color: 0x162538, roughness: .3 });
    materials.white = new THREE.MeshStandardMaterial({ color: 0xffffff });
    materials.trunk = new THREE.MeshLambertMaterial({ color: 0x745340 });
    materials.leaf = new THREE.MeshLambertMaterial({ color: 0x4b986d, flatShading: true });
    selection = new THREE.Mesh(new THREE.RingGeometry(.83, 1.04, 36), new THREE.MeshBasicMaterial({ color: 0xfff4a7, side: THREE.DoubleSide, transparent: true, opacity: .92 }));
    selection.rotation.x = -Math.PI / 2; scene.add(selection);
    aimLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0xfffae0, dashSize: .46, gapSize: .22, transparent: true, opacity: 1, linewidth: 2 }));
    scene.add(aimLine);
    impactRing = new THREE.Mesh(new THREE.RingGeometry(.5, .65, 32), new THREE.MeshBasicMaterial({ color: 0xffd375, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
    impactRing.rotation.x = -Math.PI / 2; scene.add(impactRing);
    clock = new THREE.Clock();
    addDecor();
    addInput();
    resize(); window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }
  function addDecor() {
    const rng = n => { const v = Math.sin(n * 124.287 + 31.33) * 43758.54; return v - Math.floor(v); };
    for (let i = 0; i < 23; i++) {
      const x = (rng(i + 1) - .5) * 36, z = (rng(i + 81) - .5) * 36;
      if (Math.abs(x) > 8 && Math.abs(z) < 13) continue;
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .17, 1.1, 6), materials.trunk);
      trunk.position.y = .55; trunk.castShadow = true; group.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.75 + rng(i + 65) * .4, 0), materials.leaf);
      crown.position.y = 1.5; crown.castShadow = true; group.add(crown);
      group.position.set(x, 0, z); scene.add(group); deco.push(group);
    }
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8a9a87, flatShading: true });
    for (let i = 0; i < 20; i++) {
      const x = (rng(i + 215) - .5) * 36, z = (rng(i + 514) - .5) * 36;
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(.25 + rng(i + 415) * .4, 0), rockMat);
      rock.scale.y = .62; rock.rotation.y = rng(i + 65) * Math.PI; rock.position.set(x, 0, z); rock.castShadow = true; scene.add(rock); deco.push(rock);
    }
  }
  function meshTerrain() {
    if (terrain) { scene.remove(terrain); terrain.geometry.dispose(); }
    const pos = [], col = [], idx = [];
    const color = new THREE.Color();
    for (let z = 0; z <= GRID; z++) for (let x = 0; x <= GRID; x++) {
      const y = S.heights[z * (GRID + 1) + x];
      pos.push(x - SIZE / 2, y, z - SIZE / 2);
      const hue = y < 1.7 ? .105 : y > 6 ? .25 : .285;
      color.setHSL(hue, y < 1.7 ? .43 : .36, y < 1.7 ? .49 : .39 + y * .007);
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
    const skin = materials[u.team ? 'blue' : 'red'];
    for (const [r, y, z] of [[.5, .42, .25], [.55, .75, .09], [.56, 1.07, -.02]]) {
      const part = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), skin);
      part.position.set(0, y, z); part.scale.set(1, .68, .82); part.castShadow = true; g.add(part);
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(.53, 22, 16), skin);
    head.position.set(0, 1.43, -.12); head.scale.set(1, .93, .96); head.castShadow = true; g.add(head);
    const band = new THREE.Mesh(new THREE.TorusGeometry(.47, .09, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: u.team ? 0x1b76a8 : 0xa43d4b, roughness: .7 }));
    band.position.set(0, 1.63, -.13); band.rotation.x = Math.PI / 2; g.add(band);
    for (const dx of [-.21, .21]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), materials.white);
      eye.position.set(dx, 1.53, -.57); eye.scale.z = .6; g.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), materials.eye);
      pupil.position.set(dx + .01, 1.53, -.68); g.add(pupil);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(.22, .045, .055), materials.eye);
      brow.position.set(dx, 1.72, -.57); brow.rotation.z = dx > 0 ? -.18 : .18; g.add(brow);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.17, .026, 6, 15, Math.PI), materials.eye);
    smile.position.set(0, 1.30, -.625); smile.rotation.z = Math.PI; g.add(smile);
    const launcher = new THREE.Mesh(new THREE.CylinderGeometry(.17, .21, .73, 10), new THREE.MeshStandardMaterial({ color: 0x415265, metalness: .18, roughness: .65 }));
    launcher.rotation.x = Math.PI / 2; launcher.position.set(.54, 1.02, -.3); launcher.castShadow = true; g.add(launcher);
    const barBack = new THREE.Mesh(new THREE.PlaneGeometry(1.44, .17), new THREE.MeshBasicMaterial({ color: 0x14283d, side: THREE.DoubleSide }));
    barBack.position.y = 2.18; g.add(barBack);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .13), new THREE.MeshBasicMaterial({ color: u.team ? 0x79d6ff : 0xff8b92, side: THREE.DoubleSide }));
    bar.position.set(0, 2.18, .01); g.add(bar); g.userData.bar = bar;
    const label = document.createElement('canvas'); label.width = 256; label.height = 64;
    const ctx = label.getContext('2d'); ctx.fillStyle = 'rgba(15,42,61,.88)';
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(10, 4, 236, 52, 21); else ctx.rect(10, 4, 236, 52); ctx.fill();
    ctx.fillStyle = '#fffaf0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 31px system-ui'; ctx.fillText(u.name, 128, 30);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(label), depthTest: false, transparent: true }));
    tag.position.y = 2.65; tag.scale.set(2.35, .59, 1); g.add(tag);
    g.scale.setScalar(1.2);
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
      b.userData.bar.position.x = -(1 - b.userData.bar.scale.x) * .7;
      b.rotation.y = cameraAz + Math.PI;
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
    const ring = new THREE.Mesh(new THREE.RingGeometry(.2, .35, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, y + .1, z); scene.add(ring);
    particles.push({ mesh: ring, ring: true, life: .48 });
  }
  function explode(x, y, z, kind = 'rocket', factor = 1) {
    const w = weapons[kind];
    burst(x, y, z, kind === 'cluster' ? 0xffe197 : 0xffab6c);
    shake = .42;
    sound(110, .3, 'sawtooth', .045);
    if (navigator.vibrate) navigator.vibrate(70);
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
    const group = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: kind === 'grenade' ? 0x4a5961 : 0xf1eee0, metalness: .35, roughness: .4 });
    if (kind === 'rocket') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(.17, .22, .75, 10), steel);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.17, .28, 10), new THREE.MeshStandardMaterial({ color: 0xff755f }));
      tip.position.y = .5; group.add(tube, tip);
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(.07, .25, .33), new THREE.MeshLambertMaterial({ color: 0xdf8672 }));
        fin.position.set(Math.cos(i * Math.PI / 2) * .2, -.27, Math.sin(i * Math.PI / 2) * .2);
        fin.rotation.y = i * Math.PI / 2; group.add(fin);
      }
    } else {
      group.add(new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), steel));
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(.28, .04, 6, 16), new THREE.MeshBasicMaterial({ color: kind === 'cluster' ? 0xffd477 : 0x96be8e }));
      stripe.rotation.x = Math.PI / 2; group.add(stripe);
    }
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group); return group;
  }
  function dir(yaw, angle) {
    const y = yaw * Math.PI / 180, a = angle * Math.PI / 180;
    return new THREE.Vector3(Math.sin(y) * Math.cos(a), Math.sin(a), -Math.cos(y) * Math.cos(a));
  }
  function launch(kind, yaw = S.yaw, angle = S.angle, power = S.power, origin = null) {
    const u = S.units[S.current], d = dir(yaw, angle), speed = 10 + power * .245;
    const pos = origin || new THREE.Vector3(u.x, height(u.x, u.z) + 1.5, u.z);
    pos.addScaledVector(d, 1.15);
    projectile = { kind, pos, vel: d.multiplyScalar(speed), mesh: projectileMesh(kind), age: 0, bounces: 0, trail: 0 };
    projectile.mesh.position.copy(pos); flightTime = 0;
    sound(kind === 'grenade' ? 290 : 550, .18, 'sawtooth', .025);
    announce(kind === 'grenade' ? 'Granate fliegt!' : 'Feuer frei!');
  }
  function removeProjectile() {
    if (!projectile) return;
    scene.remove(projectile.mesh);
    projectile.mesh.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
    projectile = null;
  }
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
    $('weaponIcon').textContent = { rocket: '🚀', grenade: '💣', cluster: '✨', airstrike: '✈️', teleport: '🌀' }[S.weapon];
    $('weaponName').textContent = { rocket: 'Rakete', grenade: 'Granate', cluster: 'Streubombe', airstrike: 'Luftschlag', teleport: 'Teleport' }[S.weapon];
    document.querySelector('.charge-ring').style.setProperty('--charge', Math.round(S.power) + '%');
  }
  function updateHud() {
    if (!S) return;
    const u = S.units[S.current], bot = isBotTurn();
    $('teamHud').innerHTML = [0, 1].map(t => `<div class="team-card ${t ? 'blue' : 'red'}"><strong>${t ? '🔵 BLAU' : '🔴 ROT'} ${S.team === t ? '●' : ''}</strong><span>${S.units.filter(v => v.team === t && v.hp > 0).length} Figuren · ${teamHealth(t)} LP</span></div>`).join('');
    $('game').classList.toggle('blue-turn', S.team === 1);
    $('turnInfo').textContent = 'RUNDE ' + S.round + (bot ? ' · COMPUTER' : ' · ' + (S.team ? 'BLAU' : 'ROT'));
    $('unitName').textContent = u.name; $('unitHp').textContent = u.hp + ' LP';
    $('wind').textContent = (S.wind < 0 ? '← ' : '→ ') + Math.abs(S.wind).toFixed(1);
    $('timer').textContent = Math.ceil(S.seconds); $('timer').classList.toggle('urgent', S.seconds <= 10);
    for (const [id, w] of Object.entries(weapons)) {
      const o = $('weapon').querySelector(`option[value="${id}"]`);
      o.textContent = { rocket: '🚀 Rakete', grenade: '💣 Granate', cluster: '✨ Streubombe', airstrike: '✈️ Luftschlag', teleport: '🌀 Teleport' }[id] + (id === 'rocket' ? ' · ∞' : ' · ' + (u.ammo[id] || 0));
      o.disabled = id !== 'rocket' && !u.ammo[id];
    }
    const labels = { rocket: ['🚀', 'Rakete'], grenade: ['💣', 'Granate'], cluster: ['✨', 'Streubombe'], airstrike: ['✈️', 'Luftschlag'], teleport: ['🌀', 'Teleport'] };
    $('weaponGrid').innerHTML = Object.keys(weapons).map(id => `<button data-weapon="${id}" class="${S.weapon === id ? 'chosen' : ''}" ${id !== 'rocket' && !u.ammo[id] ? 'disabled' : ''}><span>${labels[id][0]}</span><div>${labels[id][1]}<small>${id === 'rocket' ? 'Unbegrenzt' : (u.ammo[id] || 0) + ' übrig'}</small></div></button>`).join('');
    for (const id of ['weapon', 'yaw', 'angle', 'power', 'fireBtn', 'jumpBtn', 'skipBtn', 'weaponBtn', 'aimBtn']) $(id).disabled = bot || busy || !active;
  }
  function updateAim() {
    if (!S || !aimLine) return;
    const u = S.units[S.current], d = dir(S.yaw, S.angle), sp = 10 + S.power * .245;
    let p = new THREE.Vector3(u.x, height(u.x, u.z) + 1.5, u.z).addScaledVector(d, 1.1);
    let v = d.multiplyScalar(sp), pts = [], hit = null;
    for (let i = 0; i < 95; i++) {
      pts.push(p.clone()); v.x += S.wind * .65 * .045; v.y -= 13 * .045; p.addScaledVector(v, .045);
      if (p.y < height(p.x, p.z) || Math.abs(p.x) > 20 || Math.abs(p.z) > 20) {
        hit = [clamp(p.x, -19.7, 19.7), clamp(p.z, -19.7, 19.7)]; break;
      }
    }
    aimLine.geometry.dispose(); aimLine.geometry = new THREE.BufferGeometry().setFromPoints(pts); aimLine.computeLineDistances();
    aimLine.visible = S.weapon !== 'airstrike' && S.weapon !== 'teleport' && !busy;
    impactRing.visible = !!hit && aimLine.visible;
    if (hit) impactRing.position.set(hit[0], height(hit[0], hit[1]) + .11, hit[1]);
  }
  function startGame(continued) {
    matchId++;
    clearTimeout(botTimeout); clearTimeout(nextTurnTimer); removeProjectile();
    S = continued ? read() : newState();
    if (!S) return;
    if (!continued) save();
    active = true; paused = false; busy = false; charging = false; stickX = stickY = 0; cameraFocus = null;
    $('pause').hidden = true; $('result').hidden = true; $('weaponPanel').hidden = true; $('aimPanel').hidden = true;
    meshTerrain(); syncBodies(); syncControls(); updateHud(); updateAim(); show('game');
    S.winner == null ? (announce('Team ' + (S.team ? 'Blau' : 'Rot') + ' beginnt!'), scheduleBot()) : endMatch(S.winner);
  }
  function resize() {
    if (!renderer) return;
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    camDistance = w < h ? 20 : 27;
  }
  function cameraUpdate(dt) {
    if (!S) return;
    const u = S.units[S.current], aim = dir(S.yaw, 0), subject = projectile ? projectile.pos : null;
    const desired = subject
      ? new THREE.Vector3(subject.x, Math.max(2.7, subject.y * .52), subject.z)
      : new THREE.Vector3(u.x + aim.x * 2.2, height(u.x, u.z) + 1.35, u.z + aim.z * 2.2);
    if (!cameraFocus) cameraFocus = desired.clone();
    cameraFocus.lerp(desired, Math.min(1, dt * (projectile ? 3.4 : 4.7)));
    const dist = projectile ? Math.max(18, camDistance * .9) : camDistance;
    camera.position.set(cameraFocus.x + Math.sin(cameraAz) * dist, cameraFocus.y + dist * .48, cameraFocus.z + Math.cos(cameraAz) * dist);
    if (shake > 0) { camera.position.x += rand(-shake, shake); camera.position.y += rand(-shake, shake); shake = Math.max(0, shake - dt * 1.3); }
    camera.lookAt(cameraFocus);
    for (const b of bodies) b.rotation.y = cameraAz + Math.PI;
  }
  function frame(time) {
    requestAnimationFrame(frame);
    const dt = Math.min(.04, last ? (time - last) / 1000 : .016); last = time;
    if (S) {
      cameraUpdate(dt);
      if (active && !paused) {
        const inputX = stickX + (pressed.has('d') || pressed.has('arrowright') ? 1 : 0) - (pressed.has('a') || pressed.has('arrowleft') ? 1 : 0);
        const inputY = stickY + (pressed.has('s') || pressed.has('arrowdown') ? 1 : 0) - (pressed.has('w') || pressed.has('arrowup') ? 1 : 0);
        if (Math.hypot(inputX, inputY) > .14) {
          const length = Math.max(1, Math.hypot(inputX, inputY)), x = inputX / length, y = inputY / length;
          move((x * Math.cos(cameraAz) + y * Math.sin(cameraAz)) * dt * 8,
            (-x * Math.sin(cameraAz) + y * Math.cos(cameraAz)) * dt * 8);
        }
        if (charging) {
          S.power = clamp(S.power + dt * 40, 25, 100);
          syncControls(); updateAim();
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
          p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.vel.clone().normalize());
          p.trail += dt;
          if (p.trail > .065) {
            p.trail = 0;
            const smoke = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(.10, .18), 0),
              new THREE.MeshBasicMaterial({ color: 0xe7d7ba, transparent: true, opacity: .72, depthWrite: false }));
            smoke.position.copy(p.pos); scene.add(smoke);
            particles.push({ mesh: smoke, vx: rand(-.6, .6), vy: rand(.2, .8), vz: rand(-.6, .6), life: .52, smoke: true });
          }
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
          const p = particles[i]; p.life -= dt;
          if (p.ring) {
            p.mesh.scale.setScalar(1 + (1 - p.life / .48) * 12);
            p.mesh.material.opacity = Math.max(0, p.life / .48) * .85;
          } else {
            p.vy -= p.smoke ? 0 : 12 * dt;
            p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
            p.mesh.scale.setScalar(Math.max(.01, p.smoke ? 1.5 - p.life : p.life));
            if (p.smoke) p.mesh.material.opacity = Math.max(0, p.life);
          }
          if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1); }
        }
      }
    }
    renderer.render(scene, camera);
  }
  function addInput() {
    let drag = null;
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    renderer.domElement.addEventListener('pointerdown', e => {
      if (!active || paused || busy || isBotTurn()) return;
      e.preventDefault(); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: e.button === 2 ? 'camera' : 'aim' };
      renderer.domElement.setPointerCapture(e.pointerId);
      $('aimHint').classList.add('faded');
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId || !active || paused || busy) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (drag.mode === 'camera') cameraAz -= dx * .008;
      else {
        S.yaw = ((S.yaw + dx * .55 + 540) % 360) - 180;
        S.angle = clamp(S.angle - dy * .38, 10, 80);
        syncControls(); updateAim();
      }
    });
    const stopDrag = e => { if (drag && drag.id === e.pointerId) { drag = null; save(); } };
    renderer.domElement.addEventListener('pointerup', stopDrag);
    renderer.domElement.addEventListener('pointercancel', stopDrag);
    renderer.domElement.addEventListener('wheel', e => {
      e.preventDefault(); camDistance = clamp(camDistance + Math.sign(e.deltaY) * 2, 15, 45);
    }, { passive: false });
    const stick = $('stick'), thumb = $('stickThumb');
    let stickId = null;
    const stickMove = e => {
      if (stickId !== e.pointerId) return;
      const r = stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const max = r.width * .31, dx = e.clientX - cx, dy = e.clientY - cy, length = Math.max(max, Math.hypot(dx, dy));
      stickX = dx / length; stickY = dy / length;
      thumb.style.transform = `translate(${stickX * max}px,${stickY * max}px)`;
    };
    stick.addEventListener('pointerdown', e => {
      if (!active || paused || busy || isBotTurn()) return;
      e.preventDefault(); stickId = e.pointerId; stick.setPointerCapture(e.pointerId); stickMove(e);
    });
    stick.addEventListener('pointermove', stickMove);
    const stopStick = e => { if (stickId === e.pointerId) { stickId = null; stickX = stickY = 0; thumb.style.transform = ''; save(); } };
    stick.addEventListener('pointerup', stopStick);
    stick.addEventListener('pointercancel', stopStick);
    document.addEventListener('keydown', e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (k === 'escape') { if (!$('weaponPanel').hidden) $('weaponPanel').hidden = true; else if (!$('aimPanel').hidden) $('aimPanel').hidden = true; else togglePause(); return; }
      if (!active || paused) return;
      pressed.add(k);
      if (k === 'q') cameraAz -= .13;
      if (k === 'e') cameraAz += .13;
      if (k === ' ' && !e.repeat) fire();
      if (k === 'shift' && !e.repeat) jump();
      if ('12345'.includes(k) && k.length === 1 && !e.repeat) {
        const id = Object.keys(weapons)[+k - 1], u = S.units[S.current];
        if (id && (id === 'rocket' || u.ammo[id] > 0)) { S.weapon = id; syncControls(); updateHud(); updateAim(); }
      }
    });
    document.addEventListener('keyup', e => pressed.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => pressed.clear());
    const fireButton = $('fireBtn');
    let fireId = null;
    fireButton.addEventListener('pointerdown', e => {
      if (!active || paused || busy || isBotTurn()) return;
      e.preventDefault(); fireId = e.pointerId; charging = true; fireButton.setPointerCapture(e.pointerId);
    });
    fireButton.addEventListener('pointerup', e => {
      if (fireId !== e.pointerId) return;
      e.preventDefault(); fireId = null; charging = false; fire(); 
    });
    fireButton.addEventListener('pointercancel', e => { if (fireId === e.pointerId) { fireId = null; charging = false; } });
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
    $('jumpBtn').onclick = jump;
    $('skipBtn').onclick = () => { if (!busy && !isBotTurn()) { announce('Zug beendet'); finishAction(); } };
    $('weaponBtn').onclick = () => { if (active && !busy) { $('aimPanel').hidden = true; $('weaponPanel').hidden = false; } };
    $('aimBtn').onclick = () => { if (active && !busy) { $('weaponPanel').hidden = true; $('aimPanel').hidden = false; } };
    $('closeWeapon').onclick = () => $('weaponPanel').hidden = true;
    $('closeAim').onclick = () => $('aimPanel').hidden = true;
    $('weaponPanel').addEventListener('click', e => { if (e.target === $('weaponPanel')) $('weaponPanel').hidden = true; });
    $('aimPanel').addEventListener('click', e => { if (e.target === $('aimPanel')) $('aimPanel').hidden = true; });
    $('weaponGrid').onclick = e => {
      const b = e.target.closest('[data-weapon]');
      if (!b || b.disabled || !active || busy) return;
      S.weapon = b.dataset.weapon; syncControls(); updateHud(); updateAim(); save(); $('weaponPanel').hidden = true;
    };
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
