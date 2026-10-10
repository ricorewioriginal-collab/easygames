'use strict';
/* Bunte Insel – Kämpfen (kindgerecht, ohne Blut): die Kampfarena (Duell wie bei Tekken, Monster-Wellen) und der Verbotene Wald
   (freier Kampf gegen kleine Monster, Boss „Waldgeist“). Nur in diesen beiden Bereichen kann gekämpft werden – überall sonst nicht.
   Mit HP (Herzen) und EP (Energie). Besiegte Monster verpuffen in Sterne, wer müde wird, wacht am Eingang wieder auf. */
BI.createCombat = function (G) {
  const { scene, camera, W, A, fx, P, save, persist, say, addStars } = G, $ = id => document.getElementById(id), K = { dim: 0, panelOpen: false }, TAU = BI.TAU, mat = BI.mat();
  const AR = W.spots.arena, FO = W.spots.forest, rnd = Math.random, clamp = BI.clamp;
  const HPM = 100, EPM = 50;
  let hp = HPM, ep = EPM, inv = 0, block = false, atk = null, mode = null, wasZone = null, spawnT = 3, flashT = 0, target = null, lastZone = null;
  const enemies = [], loot = [], S = () => save.fight || (save.fight = { k: 0, d: 0, b: 0, w: 0 });

  /* ---------- Monster-Modelle (eine Geometrie je Art) ---------- */
  const geos = {};
  const eyes = (b, y, z, w, s) => { for (const sx of [-1, 1]) { b.sph(sx * w, y, z, s, 0xffffff, 0); b.sph(sx * w, y, z + s * .8, s * .5, 0x222222, 0); } };
  const MODEL = {
    blob: b => { b.sph(0, .55, 0, .6, 0x6bd66b, 1, 1, .85, 1); eyes(b, .72, .42, .22, .14); b.box(0, .5, .58, .3, .05, .04, 0x2b6b2b); b.sph(-.3, .06, .2, .14, 0x4fb84f, 0); b.sph(.3, .06, .2, .14, 0x4fb84f, 0); },
    spike: b => { b.sph(0, .5, 0, .5, 0xff9a3a, 1, 1, .9, 1.1); for (let i = 0; i < 9; i++) { const a = i * .7; b.cone(Math.sin(a) * .34, .78 + (i % 3) * .06, Math.cos(a) * .34 - .12, .1, .36, 0xc0541a, 5); } eyes(b, .62, .42, .2, .12); b.sph(0, .5, .56, .08, 0x5a2b1a, 0); },
    mush: b => { b.cyl(0, 0, 0, .3, .36, .55, 0xf4e6c8, 8); b.sph(0, .72, 0, .62, 0xe0382b, 1, 1, .62, 1); for (const [x, z] of [[-.3, .2], [.28, .3], [0, -.3], [.32, -.1]]) b.sph(x, .98 - Math.abs(x) * .3, z, .12, 0xffffff, 0); eyes(b, .35, .3, .13, .09); },
    gblob: b => { b.sph(0, .55, 0, .6, 0xb36bff, 1, 1, .85, 1); eyes(b, .72, .42, .22, .14); b.box(0, .5, .58, .34, .06, .04, 0x4a2b6b); for (let i = 0; i < 3; i++) b.cone(-.3 + i * .3, 1.05, 0, .1, .3, 0xff8fc8, 4); },
    boss: b => { b.cyl(0, 0, 0, .6, .85, 1.6, 0x4a3a2a, 8); b.sph(0, 2.0, 0, .85, 0x2f6b4a, 1, 1, .9, 1); for (let i = 0; i < 6; i++) b.cone(Math.sin(i) * .6, 2.6, Math.cos(i) * .5, .2, .6, 0x1f4a3a, 5); for (const sx of [-1, 1]) { b.box(sx * 1.0, 1.1, 0, .28, 1.3, .28, 0x4a3a2a, 0, sx * .5); b.sph(sx * .3, 2.0, .72, .18, 0xffe14a, 0); b.box(sx * 1.2, .6, 0, .5, .12, .12, 0x4a3a2a); } b.box(0, 1.55, .85, .6, .1, .06, 0x1a1a1a); }
  };
  const geo = k => geos[k] || (geos[k] = (() => { const b = new BI.Batch(); MODEL[k](b); return b.mesh(mat).geometry; })());
  const TYPES = {
    blob: { n: 'Glibbi', hp: 30, spd: 2.0, dmg: 7, reach: 1.5, base: 1 }, spike: { n: 'Stachli', hp: 40, spd: 2.8, dmg: 9, reach: 1.5, base: 1 }, mush: { n: 'Pilzling', hp: 36, spd: 2.3, dmg: 8, reach: 1.5, base: 1 },
    gblob: { n: 'Riesen-Glibbi', hp: 150, spd: 1.8, dmg: 14, reach: 2.8, base: 2.4, big: true, geo: 'gblob' }, boss: { n: 'Waldgeist', hp: 230, spd: 2.0, dmg: 17, reach: 3.2, base: 2.2, big: true, geo: 'boss' }
  };
  const barGeo = new THREE.PlaneGeometry(1, .12), barBg = new THREE.MeshBasicMaterial({ color: 0x2b2f3a, depthTest: false, transparent: true, opacity: .7 }), barFg = new THREE.MeshBasicMaterial({ color: 0x4cd07d, depthTest: false });
  const ringGeo = new THREE.RingGeometry(.2, 1, 28), ringMat = new THREE.MeshBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false });
  function spawn(kind, x, z, o) {
    const T = TYPES[kind], g = new THREE.Group(), body = new THREE.Mesh(geo(T.geo || kind), mat); body.frustumCulled = false; g.add(body); g.scale.setScalar(T.base); g.position.set(x, 0, z);
    const bar = new THREE.Group(), bg = new THREE.Mesh(barGeo, barBg), fg = new THREE.Mesh(barGeo, barFg); bg.renderOrder = 5; fg.renderOrder = 6; bg.scale.x = 1.1; bar.add(bg, fg); bar.position.y = T.big ? 3.1 : 1.5; bar.scale.setScalar(1 / T.base); g.add(bar);
    let tele = null; if (T.big) { tele = new THREE.Mesh(ringGeo, ringMat); tele.rotation.x = -Math.PI / 2; tele.position.y = .08; tele.visible = false; scene.add(tele); }
    scene.add(g); const e = Object.assign({ kind, T, g, body, bar, fg, tele, x, z, vx: 0, vz: 0, hp: T.hp, max: T.hp, state: 'idle', wind: 0, cool: 1 + rnd(), stun: 0, dead: false, t: 0, ph: rnd() * 6, home: o && o.home }, o || {}); enemies.push(e); return e;
  }
  function removeEnemy(e) { scene.remove(e.g); if (e.tele) { scene.remove(e.tele); } const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); }
  function clearEnemies() { while (enemies.length) removeEnemy(enemies[0]); for (const l of loot) scene.remove(l.m); loot.length = 0; if (duel) { scene.remove(duel.f.group); duel = null; } }

  /* ---------- Beute: Herz, Energie-Kristall ---------- */
  const lootGeo = { heart: new THREE.SphereGeometry(.28, 8, 6), gem: new THREE.OctahedronGeometry(.3) }, lootMat = { heart: new THREE.MeshBasicMaterial({ color: 0xff4f7a }), gem: new THREE.MeshBasicMaterial({ color: 0x4da3ff }) };
  function drop(x, z) { const r = rnd(); if (r > .55) return; const k = r < .28 ? 'heart' : 'gem', m = new THREE.Mesh(lootGeo[k], lootMat[k]); m.position.set(x, .6, z); scene.add(m); loot.push({ m, k, t: 20 }); }

  /* ---------- Zonen & Zustand ---------- */
  const inForest = () => !P.veh && Math.hypot(P.x - FO.x, P.z - FO.z) < FO.R - .5;
  const inRing = () => !P.veh && Math.abs(P.x - AR.x) < AR.half + 1 && Math.abs(P.z - AR.z) < AR.half + 1;
  K.active = () => !P.veh && (inForest() || (!!mode && inRing()));
  K.nearKai = () => !P.veh && !mode && Math.hypot(P.x - AR.kai.x, P.z - AR.kai.z) < 3.2;
  K.lock = () => (duel && !duel.over) ? duel.cam : null;
  function resetStats() { hp = HPM; ep = EPM; inv = 0; atk = null; block = false; }

  /* ---------- Spieler: Angriffe ---------- */
  const ATK = { punch: { dur: .3, at: .12, dmg: 12, range: 2.4, cd: .32, cost: 0 }, kick: { dur: .5, at: .22, dmg: 20, range: 2.7, cd: .6, cost: 0 }, special: { dur: .7, at: .28, dmg: 32, range: 4.6, cd: 1, cost: 25, ring: true } };
  let atkCd = 0, freeze = 0, flick = false;
  K.attack = function (kind) {
    if (!K.active() || atk || atkCd > 0 || freeze > 0 || hp <= 0) return; const a = ATK[kind]; if (!a) return;
    if (a.cost > ep) { say('⚡ Zu wenig Energie – kurz ausruhen!', 1400); return; }
    ep -= a.cost; atk = { kind, a, t: 0, hit: false }; atkCd = a.cd; block = false;
    let best = null, bd = 4; for (const e of targets()) { const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < bd) { bd = d; best = e; } } if (best && kind !== 'special') P.h = Math.atan2(best.x - P.x, best.z - P.z);
    A.whoosh && A.whoosh();
  };
  K.setBlock = on => { block = !!on && K.active() && !atk; };
  K.key = function (code, down) {
    if (!K.active() && !K.panelOpen) return false; const map = { KeyJ: 'punch', KeyK: 'kick', KeyL: 'special' };
    if (map[code]) { if (down) K.attack(map[code]); return true; } if (code === 'KeyH') { K.setBlock(down); return true; } return false;
  };
  const targets = () => { const o = enemies.filter(e => !e.dead); if (duel && !duel.over && duel.f.hp > 0) o.push(duel.f); return o; };
  function hitEnemies(a) {
    let any = false; for (const e of targets()) {
      const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d > a.range + (e.T && e.T.big ? 1 : 0)) continue; if (!a.ring && Math.abs(BI.angDiff(P.h, Math.atan2(dx, dz))) > 1.15) continue;
      let dmg = a.dmg; if (e.blocking) dmg *= .2; damage(e, dmg, dx / (d || 1), dz / (d || 1)); any = true;
    }
    if (a.ring) { fx.burst(P.x, 1, P.z, 30, [BI.C.gold, BI.C.white, BI.C.blue], 6, 1, 28, 2); }
    if (!any && !a.ring) A.pop();
  }
  function damage(e, dmg, nx, nz) {
    e.hp -= dmg; e.stun = e.T && e.T.big ? .12 : .35; e.vx = nx * (e.T && e.T.big ? 2 : 5); e.vz = nz * (e.T && e.T.big ? 2 : 5); target = e; A.hit && A.hit(); fx.burst(e.x, 1.1, e.z, 10, [BI.C.gold, BI.C.white, BI.C.pink], 4, 1, 26, 3);
    if (e.state === 'wind' && !(e.T && e.T.big)) { e.state = 'idle'; e.cool = .8; if (e.tele) e.tele.visible = false; }
    if (e.hp <= 0) { if (e.isFighter) koFighter(e); else defeatMonster(e); }
  }
  function defeatMonster(e) {
    e.dead = true; e.t = 0; if (e.tele) e.tele.visible = false; A.bigpop && A.bigpop(); fx.burst(e.x, 1.2, e.z, 26, [BI.C.gold, BI.C.white, BI.C.pink, BI.C.purple], 6, 1.4, 32, 6);
    const st = S(); if (mode === 'wave') { addStars(e.T.big ? 5 : 1); } else { addStars(e.T.big ? 8 : 1); st.k++; K.kills++; if (e.kind === 'boss') { st.b++; bossAlive = false; say('👑 Waldgeist besiegt! Du bist ein Waldheld! +8 ⭐', 4200); A.fanfare(); G.earn('boss'); } else drop(e.x, e.z); if (st.k >= 10) G.earn('forest'); persist(); }
  }
  let bossAlive = false; K.kills = 0;

  /* ---------- Gegner verletzt den Spieler ---------- */
  function hurt(d) {
    if (inv > 0 || hp <= 0) return; if (block) d *= .2; hp = Math.max(0, hp - d); inv = .7; A.hit && A.hit(); fx.burst(P.x, 1.4, P.z, 8, [BI.C.white, BI.C.blue], 3, 1, 24, 2); flashT = .25;
    if (hp <= 0) onPlayerDown();
  }
  function onPlayerDown() {
    if (duel) { duel.pLost(); return; }
    say(mode === 'wave' ? '😴 Du bist müde – die Welle ist vorbei!' : '😴 Du bist müde … Ruh dich am Eingang aus!', 3200); A.bigpop && A.bigpop(); const was = mode; clearEnemies(); mode = null; resetStats(); K.dim = 0;
    if (was) { P.x = AR.kai.x; P.z = AR.kai.z + 2.5; } else { P.x = FO.gate.x; P.z = FO.gate.z; } P.y = 0; spawnT = 3;
  }

  /* ---------- Duell (wie Tekken): 3 Kämpfer, 2 Gewinn-Runden ---------- */
  const FIGHTERS = [
    { id: 'nele', n: 'Ninja Nele', icon: '🥷', hp: 90, dmg: 8, cd: 1.5, spd: 2.2, look: { shirt: 0x23262d, pants: 0x23262d, hair: 0x222222, skin: 0xffd2a8, hat: 'cap' }, reward: 5, scale: .95 },
    { id: 'sam', n: 'Sumo Sam', icon: '🤼', hp: 130, dmg: 12, cd: 1.7, spd: 1.6, look: { shirt: 0xffffff, pants: 0xe0382b, hair: 0x222222, skin: 0xe0a979 }, reward: 8, scale: 1.3 },
    { id: 'rudi', n: 'Roboter Rudi', icon: '🤖', hp: 110, dmg: 10, cd: 1.0, spd: 3.0, look: { shirt: 0x9aa5b8, pants: 0x6b7384, hair: 0x6b7384, skin: 0xc9ced6, hat: 'helmet' }, reward: 12, scale: 1.05 }
  ];
  let duel = null;
  function startDuel(def) {
    clearEnemies(); mode = 'duel'; resetStats(); const ch = BI.makeChar(Object.assign({ name: def.n, scale: def.scale }, def.look)); scene.add(ch.group);
    const f = { isFighter: true, T: { n: def.n }, def, ch, group: ch.group, x: AR.x + 3.5, z: AR.z, hp: def.hp, max: def.hp, vx: 0, vz: 0, stun: 0, cool: 1.2, state: 'idle', wind: 0, atk: null, blocking: false, blockT: 0, dead: false };
    duel = { f, def, rounds: [0, 0], round: 1, over: false, cd: 0, cam: { x: AR.x, z: AR.z, yaw: 0 }, pLost: () => endRound(false) }; P.x = AR.x - 3.5; P.z = AR.z; P.h = Math.PI / 2; closePanel(); newRound();
  }
  function newRound() { const d = duel; hp = HPM; ep = EPM; inv = 0; atk = null; d.f.hp = d.def.hp; d.f.dead = false; d.f.state = 'idle'; d.f.ch.group.rotation.x = 0; d.f.x = AR.x + 3.5; d.f.z = AR.z; P.x = AR.x - 3.5; P.z = AR.z; freeze = 2.6; d.cd = 2.6; say('🥊 Runde ' + d.round + ' – ' + d.def.n + '!', 1500); d.said = 3; }
  function koFighter(f) { f.dead = true; f.ko = 0; A.bigpop && A.bigpop(); fx.burst(f.x, 1.5, f.z, 24, [BI.C.gold, BI.C.white], 5, 1.2, 30, 5); say('💫 K.O.! Runde gewonnen!', 1800); duel.rounds[0]++; duel.endT = 1.8; duel.winner = 'p'; }
  function endRound(win) { const d = duel; if (!d || d.endT) return; if (!win) { d.rounds[1]++; d.endT = 1.8; d.winner = 'f'; say('💫 K.O.! Die Runde geht an ' + d.def.n, 1800); A.bigpop && A.bigpop(); d.f.ch.group.rotation.x = 0; } }
  function finishDuel(playerWon) {
    const d = duel, st = S(); if (playerWon) { addStars(d.def.reward); st.d++; persist(); say('🏆 Du hast ' + d.def.n + ' besiegt! +' + d.def.reward + ' ⭐', 4200); A.fanfare(); G.earn('fight'); fx.burst(P.x, 2.4, P.z, 40, [BI.C.gold, BI.C.pink, BI.C.white], 6, 1.4, 34, 6); }
    else say('Gut gekämpft! Probier es nochmal 💪', 3200);
    d.over = true; clearEnemies(); mode = null; resetStats(); P.x = AR.kai.x; P.z = AR.kai.z + 2.2;
  }
  function updateDuel(dt, t) {
    const d = duel, f = d.f, dx = P.x - f.x, dz = P.z - f.z, dist = Math.hypot(dx, dz) || .01;
    // Kamera von der Seite auf beide Kämpfer
    d.cam.x = (P.x + f.x) / 2; d.cam.z = (P.z + f.z) / 2; d.cam.yaw = Math.atan2(f.x - P.x, f.z - P.z) + Math.PI / 2;
    if (d.endT) { d.endT -= dt; if (f.dead) { f.ko += dt; f.ch.group.rotation.x = -Math.min(1.5, f.ko * 2.6); f.ch.group.position.y = Math.min(.5, f.ko) * .4; } else { const g = G.char().group; g.rotation.x = -Math.min(1.4, (1.8 - d.endT) * 2.4); }
      if (d.endT <= 0) { d.endT = 0; const [pw, fw] = d.rounds; if (pw >= 2) return finishDuel(true); if (fw >= 2) return finishDuel(false); d.round++; G.char().group.rotation.x = 0; f.ch.group.position.y = 0; newRound(); } return; }
    if (d.cd > 0) { d.cd -= dt; const n = Math.ceil(d.cd); if (n < d.said && n > 0) { d.said = n; say('⏱️ ' + n, 700); } if (d.cd <= 0) { say('🥊 KAMPF!', 900); A.fanfare && A.fanfare(); } f.ch.pose(t * 3, 0, false); }
    else {
      f.cool -= dt; f.stun -= dt; f.blockT -= dt; f.blocking = f.blockT > 0;
      if (f.state === 'wind') { f.wind -= dt; f.ch.armR.rotation.x = -2.2 * (1 - f.wind / f.windMax); if (f.wind <= 0) { f.state = 'idle'; f.cool = d.def.cd * (.8 + rnd() * .6); f.ch.armR.rotation.x = -1.3; if (dist < 2.8) hurt(d.def.dmg * (f.kind2 === 'kick' ? 1.4 : 1)); setTimeout(() => { if (f.ch) f.ch.armR.rotation.x = 0; }, 150); } }
      else if (f.stun <= 0) {
        if (atk && dist < 3.4 && f.blockT <= 0 && rnd() < dt * 1.4) f.blockT = .6;
        if (dist > 2.1) { const sp = d.def.spd * dt; f.x += dx / dist * sp; f.z += dz / dist * sp; f.ch.pose(t * 7, .6, false); } else { f.ch.pose(t * 2, 0, false); if (f.cool <= 0) { f.state = 'wind'; f.kind2 = rnd() < .3 ? 'kick' : 'punch'; f.windMax = f.wind = f.kind2 === 'kick' ? .65 : .45; } else { const sx = -dz / dist; f.x += sx * Math.sin(t * 1.3) * dt * .8; f.z += dx / dist * Math.sin(t * 1.3) * dt * .8; } }
      }
      f.x += f.vx * dt; f.z += f.vz * dt; { const fr = Math.exp(-dt * 7); f.vx *= fr; f.vz *= fr; }
    }
    // im Ring bleiben
    const L = AR.half - .8; f.x = clamp(f.x, AR.x - L, AR.x + L); f.z = clamp(f.z, AR.z - L, AR.z + L); P.x = clamp(P.x, AR.x - L, AR.x + L); P.z = clamp(P.z, AR.z - L, AR.z + L);
    f.group.position.x = f.x; f.group.position.z = f.z; f.group.rotation.y = Math.atan2(dx, dz); if (f.blocking) { f.ch.armL.rotation.x = f.ch.armR.rotation.x = -1.2; } else if (f.state !== 'wind') { f.ch.armL.rotation.x = 0; }
    if (f.state !== 'wind' && !f.blocking) f.ch.armR.rotation.x = f.ch.armR.rotation.x * .8;
    if (!d.endT) P.h = Math.atan2(f.x - P.x, f.z - P.z);
  }

  /* ---------- Monster-Wellen in der Arena ---------- */
  let wave = null;
  function startWave() { clearEnemies(); mode = 'wave'; resetStats(); wave = { n: 0, gap: 0 }; closePanel(); P.x = AR.x; P.z = AR.z + 3; nextWave(); }
  function nextWave() {
    wave.n++; const n = wave.n; const kinds = ['blob', 'spike', 'mush']; say('👾 Welle ' + n + ' von 5!', 1800); hp = Math.min(HPM, hp + 30); ep = EPM;
    if (n === 5) { const a = rnd() * TAU; spawn('gblob', AR.x + Math.sin(a) * 6, AR.z + Math.cos(a) * 6, { ring: true }); }
    for (let i = 0; i < 1 + n; i++) { const a = rnd() * TAU; spawn(kinds[(i + n) % 3], AR.x + Math.sin(a) * 6.5, AR.z + Math.cos(a) * 6.5, { ring: true }); }
  }

  /* ---------- Verbotener Wald ---------- */
  function forestSpawn(dt) {
    if (!inForest()) return; spawnT -= dt; const cap = save.eco ? 4 : 6, alive = enemies.filter(e => !e.dead).length;
    if (spawnT > 0 || alive >= cap) return; spawnT = 3 + rnd() * 3;
    for (let k = 0; k < 14; k++) { const a = rnd() * TAU, d = 9 + rnd() * 9, x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d; if (Math.hypot(x - FO.x, z - FO.z) > FO.R - 2.5 || !W.free(x, z, .8)) continue;
      let kind = rnd() < .34 ? 'blob' : rnd() < .5 ? 'spike' : 'mush'; if (!bossAlive && K.kills >= K.nextBoss) { kind = 'boss'; bossAlive = true; K.nextBoss += 10; say('⚠️ Der Waldgeist erwacht!', 3000); }
      spawn(kind, x, z, { home: true }); return; }
  }

  /* ---------- Gegner-KI ---------- */
  function updateEnemies(dt, t) {
    const px = P.x, pz = P.z;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i], T = e.T;
      if (e.dead) { e.t += dt; e.g.rotation.y += dt * 12; e.g.scale.setScalar(Math.max(.01, 1 - e.t * 1.6) * T.base); e.g.position.y += dt * 2.2; if (e.t > .65) removeEnemy(e); continue; }
      const dx = px - e.x, dz = pz - e.z, d = Math.hypot(dx, dz) || .01, canFight = K.active() && hp > 0;
      e.cool -= dt; e.stun -= dt;
      if (e.stun <= 0 && canFight) {
        if (e.state === 'wind') { e.wind -= dt; const k = 1 - e.wind / e.windMax; e.g.scale.setScalar(T.base * (1 + k * .22)); body(e, 1 + k * .5);
          if (e.wind <= 0) { e.state = 'idle'; e.cool = 1.2 + rnd() * .8; e.g.scale.setScalar(T.base); if (e.tele) e.tele.visible = false; const reach = e.tele ? 3.6 : T.reach + .5; if (d < reach) { hurt(T.dmg); } fx.burst(e.x, .4, e.z, 8, [BI.C.white, BI.C.dust], 3, .8, 22, 3); } }
        else if (d > T.reach * .85 && d < 26) { const sp = T.spd * dt; let nx = e.x + dx / d * sp, nz = e.z + dz / d * sp; const q = W.resolve(nx, nz, .55 * T.base, {}); e.x = q.x; e.z = q.z; }
        else if (e.cool <= 0 && d < 26) { e.state = 'wind'; e.windMax = e.wind = T.big ? .95 : .55; if (e.tele) { e.tele.visible = true; e.tele.scale.setScalar(3.6); e.tele.position.set(e.x, .08, e.z); } }
      }
      e.x += e.vx * dt; e.z += e.vz * dt; const fr = Math.exp(-dt * 7); e.vx *= fr; e.vz *= fr;
      if (e.ring) { const L = AR.half - 1; e.x = clamp(e.x, AR.x - L, AR.x + L); e.z = clamp(e.z, AR.z - L, AR.z + L); }
      else if (e.home) { const fd = Math.hypot(e.x - FO.x, e.z - FO.z); if (fd > FO.R - 1.5) { e.x = FO.x + (e.x - FO.x) / fd * (FO.R - 1.5); e.z = FO.z + (e.z - FO.z) / fd * (FO.R - 1.5); } }
      e.g.position.x = e.x; e.g.position.z = e.z; e.g.position.y = Math.abs(Math.sin(t * 5 + e.ph)) * (e.state === 'wind' ? 0 : .12); if (e.state !== 'wind') { e.g.rotation.y = Math.atan2(dx, dz); body(e, 1 + Math.sin(t * 6 + e.ph) * .05); }
      if (e.tele && e.tele.visible) { e.tele.position.set(e.x, .08, e.z); }
      e.bar.rotation.y = Math.atan2(camera.position.x - e.x, camera.position.z - e.z) - e.g.rotation.y; e.fg.scale.x = Math.max(.001, e.hp / e.max); e.fg.position.x = -(1 - e.fg.scale.x) * .5;
    }
  }
  const body = (e, s) => { e.body.scale.y = s; };

  /* ---------- Beute einsammeln ---------- */
  function updateLoot(dt, t) {
    for (let i = loot.length - 1; i >= 0; i--) { const l = loot[i]; l.t -= dt; l.m.rotation.y += dt * 3; l.m.position.y = .6 + Math.sin(t * 4 + i) * .1;
      if (K.active() && Math.hypot(P.x - l.m.position.x, P.z - l.m.position.z) < 1.4) { if (l.k === 'heart') { hp = Math.min(HPM, hp + 25); say('❤️ +25 Herzen!', 1200); } else { ep = Math.min(EPM, ep + 25); say('💎 +25 Energie!', 1200); } A.star && A.star(); scene.remove(l.m); loot.splice(i, 1); }
      else if (l.t <= 0) { scene.remove(l.m); loot.splice(i, 1); } }
  }

  /* ---------- Schild über dem Eingang ---------- */
  function sign(text, x, y, z, w) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = 'rgba(30,20,20,.85)'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#ffd23f'; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116); c.fillStyle = '#fff'; c.font = 'bold 50px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 66);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); s.scale.set(w, w / 4, 1); s.position.set(x, y, z); scene.add(s); return s; }
  sign('⚠️ Verbotener Wald', FO.gx, 3.6, FO.gz, 5.6); sign('Hier darf gekämpft werden!', FO.gx, 2.9, FO.gz, 4.4); sign('🥊 Kampfarena', AR.x, 3.6, AR.z + AR.half + 3.4, 4.8);
  const kai = BI.makeChar({ shirt: 0xe0382b, pants: 0x23262d, hair: 0x222222, skin: 0x8d5a3b, hat: 'cap', name: 'Kampfmeister Kai', scale: 1.05 }); kai.group.position.set(AR.kai.x, 0, AR.kai.z + 1); kai.group.rotation.y = Math.PI; scene.add(kai.group); W.addCircle(AR.kai.x, AR.kai.z + 1, .5, false, 1.8);

  /* ---------- Menü der Arena ---------- */
  function openPanel() { if (K.panelOpen || mode) return; K.panelOpen = true; G.setStick(0, 0); const b = $('arenaBox'); b.innerHTML = '';
    const mk = (t, f) => { const x = document.createElement('button'); x.className = 'pill'; x.style.cssText = 'display:block;margin:6px auto;min-width:220px;font-size:17px'; x.textContent = t; x.onclick = () => { A.pop(); f(); }; b.appendChild(x); };
    $('arenaTxt').textContent = 'Kampfmeister Kai: „Willkommen in der Arena! Hier wird fair gekämpft – ohne Blut, mit Herz.“';
    for (const d of FIGHTERS) mk(d.icon + ' Duell: ' + d.n + ' (+' + d.reward + ' ⭐)', () => startDuel(d)); mk('👾 Monster-Wellen (5 Wellen, +10 ⭐)', startWave);
    $('arenaPanel').hidden = false; }
  function closePanel() { K.panelOpen = false; $('arenaPanel').hidden = true; G.updateButtons && G.updateButtons(true); }
  K.openPanel = openPanel; K.closePanel = closePanel; $('arenaClose').addEventListener('click', closePanel);
  K.exit = function () { if (!mode && !inForest()) return; clearEnemies(); const was = mode; mode = null; resetStats(); K.dim = 0; if (was) { P.x = AR.kai.x; P.z = AR.kai.z + 2.5; } else { P.x = FO.gate.x; P.z = FO.gate.z; } };
  $('fbExit').addEventListener('click', K.exit);
  for (const [id, kind] of [['fbPunch', 'punch'], ['fbKick', 'kick'], ['fbSpecial', 'special']]) $(id).addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); K.attack(kind); });
  { const bb = $('fbBlock'); bb.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); K.setBlock(true); }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) bb.addEventListener(ev, () => K.setBlock(false)); }
  for (const id of ['fightBtns', 'fightBars']) $(id).addEventListener('pointerdown', e => e.stopPropagation());

  /* ---------- Frame ---------- */
  K.update = function (dt, t) {
    const act = K.active(); inv = Math.max(0, inv - dt); atkCd = Math.max(0, atkCd - dt); freeze = Math.max(0, freeze - dt); flashT = Math.max(0, flashT - dt);
    const fz = inForest(); if (fz !== wasZone) { wasZone = fz; if (fz) { resetStats(); K.kills = 0; K.nextBoss = 10; bossAlive = false; say('🌲 Verbotener Wald – hier wird gekämpft! (👊 Schlag, 🦵 Tritt, ✨ Spezial, 🛡️ Block)', 4800); } else if (!mode) { clearEnemies(); } }
    K.dim += ((fz ? .7 : 0) - K.dim) * Math.min(1, dt * 1.5);
    if (act && hp > 0) { ep = Math.min(EPM, ep + dt * (block ? 1 : 4)); if (!mode && Math.hypot(P.x - FO.x, P.z - FO.z) < FO.R && enemies.length === 0) hp = Math.min(HPM, hp + dt * 1.5); }
    if (act && fz) forestSpawn(dt);
    if (mode === 'wave') { if (wave.n > 0 && enemies.every(e => e.dead)) { wave.gap += dt; if (wave.gap > 1.4) { wave.gap = 0; if (wave.n >= 5) { addStars(10); S().w++; persist(); say('🏆 Alle Wellen geschafft! +10 ⭐', 4200); A.fanfare(); G.earn('fight'); clearEnemies(); mode = null; resetStats(); P.x = AR.kai.x; P.z = AR.kai.z + 2.2; } else nextWave(); } } }
    if (duel && !duel.over) updateDuel(dt, t);
    updateEnemies(dt, t); updateLoot(dt, t);
    // Angriffsanimation
    const c = G.char();
    if (atk && act) { atk.t += dt; const u = atk.t / atk.a.dur, sw = Math.sin(Math.min(1, u) * Math.PI);
      if (atk.kind === 'punch') { c.armR.rotation.set(-1.7 * sw, 0, 0); c.armL.rotation.set(.4 * sw, 0, 0); } else if (atk.kind === 'kick') { c.legR.rotation.x = -1.5 * sw; c.armL.rotation.set(-.6 * sw, 0, .5); c.armR.rotation.set(-.6 * sw, 0, -.5); } else { c.armL.rotation.set(-2.8 * sw, 0, .5); c.armR.rotation.set(-2.8 * sw, 0, -.5); }
      if (!atk.hit && atk.t >= atk.a.at) { atk.hit = true; hitEnemies(atk.a); } if (atk.t >= atk.a.dur) atk = null; }
    else if (block && act) { c.armL.rotation.set(-1.3, 0, .35); c.armR.rotation.set(-1.3, 0, -.35); }
    if (inv > 0 && act) { c.group.visible = Math.floor(t * 20) % 2 === 0; flick = true; } else if (flick) { c.group.visible = true; flick = false; }
    // Anzeige
    const show = act && G.state() === 'play'; $('fightBars').hidden = !show; $('fightBtns').hidden = !show;
    if (show) {
      $('fbHp').style.width = (hp / HPM * 100) + '%'; $('fbEp').style.width = (ep / EPM * 100) + '%';
      const tg = duel && !duel.over ? duel.f : (target && !target.dead && enemies.includes(target) ? target : null); $('fbEnemy').hidden = !tg;
      if (tg) { $('fbEName').textContent = (tg.T && tg.T.n) || ''; $('fbEHp').style.width = Math.max(0, tg.hp / tg.max * 100) + '%'; }
      $('fbInfo').textContent = duel && !duel.over ? 'Runde ' + duel.round + ' · Du ' + duel.rounds[0] + ' : ' + duel.rounds[1] + ' ' + duel.def.n : mode === 'wave' ? 'Welle ' + wave.n + '/5' : '🌲 Waldmonster besiegt: ' + K.kills;
      $('fbExit').hidden = false;
    }
    if (!act && enemies.length && !mode && !fz) { clearEnemies(); }
  };
  K.dbg = { enemies, spawn, damage, hurt, FIGHTERS, startDuel, startWave, get duel() { return duel; }, get mode() { return mode; }, get hp() { return hp; }, get atk() { return atk; } };
  return K;
};
