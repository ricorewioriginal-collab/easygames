'use strict';
/* Bunte Insel – Wetter & Jahreszeiten: Regen, Schnee, Laub, Regenbogen (mit Bonus-Sternen). Wenige Partikel, kein Zusatz-Licht. */
BI.createWeather = function (G) {
  const { scene, camera, W, A, P, save, say, stars, fx } = G, TAU = BI.TAU, K = { kind: 'clear', wx: 0, rainy: 0 };
  K.season = () => { const s = save.season || 'auto'; if (s !== 'auto') return s; const m = new Date().getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; };
  const TINT = { spring: 0xffe4f2, summer: 0xffffff, autumn: 0xffb878, winter: 0xe6eeff };
  K.applySeason = () => { if (W.treeMat) W.treeMat.color.setHex(TINT[K.season()] || 0xffffff); K.pick(true); };
  /* Niederschlag: ein Points-Objekt um die Kamera */
  const N = 280, pos = new Float32Array(N * 3), g = new THREE.BufferGeometry(); for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 40; pos[i * 3 + 1] = Math.random() * 22; pos[i * 3 + 2] = (Math.random() - .5) * 40; }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: 0xbfe3ff, size: 2, sizeAttenuation: false, transparent: true, opacity: .7, depthWrite: false }), pts = new THREE.Points(g, pm); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
  /* Regenbogen */
  const bow = new THREE.Group(), RC = [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x4a4fe0, 0x9b4de0], bowMats = [];
  RC.forEach((c, i) => { const m = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false, fog: false }); bowMats.push(m); bow.add(new THREE.Mesh(new THREE.RingGeometry(70 - i * 2.2, 72 - i * 2.2 + .1, 48, 1, 0, Math.PI), m)); });
  bow.visible = false; scene.add(bow);
  let bowT = 0;
  K.rainbow = function () {
    const a = (P.h || 0) + (Math.random() - .5) * 1.2, px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    bow.position.set(px + Math.sin(a) * 150, -2, pz + Math.cos(a) * 150); bow.rotation.y = Math.atan2(px - bow.position.x, pz - bow.position.z); bow.visible = true; bowT = 70;
    say('🌈 Ein Regenbogen! Sammle die Regenbogen-Sterne!', 3600); A.fanfare && A.fanfare();
    for (let i = 0, k = 0; i < stars.length && k < 6; i++) { const s = stars[i]; for (let t = 0; t < 20; t++) { const aa = Math.random() * TAU, d = 8 + Math.random() * 16, x = px + Math.sin(aa) * d, z = pz + Math.cos(aa) * d; if (W.free(x, z, 1.2)) { s.x = x; s.z = z; s.on = true; k++; break; } } }
  };
  /* Zustandsautomat: alle 2–4 Minuten neues Wetter */
  let timer = 25 + Math.random() * 40, target = 0, was = 'clear';
  K.pick = function (force) {
    const se = K.season(), r = Math.random(); let k;
    if (se === 'winter') k = r < .45 ? 'snow' : r < .7 ? 'cloudy' : 'clear';
    else if (se === 'summer') k = r < .12 ? 'rain' : r < .3 ? 'cloudy' : 'clear';
    else k = r < .3 ? 'rain' : r < .55 ? 'cloudy' : 'clear';
    if (K.forced) k = K.forced; K.set(k); timer = 120 + Math.random() * 120;
  };
  K.set = function (k) { K.kind = k; target = k === 'clear' ? 0 : k === 'cloudy' ? .45 : 1; };
  K.update = function (dt, t) {
    timer -= dt; if (timer <= 0 && !K.forced) K.pick();
    K.wx += (target - K.wx) * Math.min(1, dt * .35);
    const precip = (K.kind === 'rain' || K.kind === 'snow') ? K.wx : 0, prev = K.rainy; K.rainy += (precip - K.rainy) * Math.min(1, dt * .8);
    pts.visible = K.rainy > .05; A.rain && A.rain(K.kind === 'rain' && K.rainy > .3);
    if (pts.visible) {
      const snow = K.kind === 'snow', px = camera.position.x, py = camera.position.y, pz = camera.position.z, v = snow ? 2.2 : 24; pm.size = snow ? 4 : 2.2; pm.opacity = .75 * K.rainy; pm.color.setHex(snow ? 0xffffff : 0xbfe3ff);
      for (let i = 0; i < N; i++) {
        let y = pos[i * 3 + 1] - dt * v * (.8 + (i % 5) * .1); if (snow) { pos[i * 3] += Math.sin(t + i) * dt * .6; }
        if (y < -2) { y += 22; pos[i * 3] = (Math.random() - .5) * 40; pos[i * 3 + 2] = (Math.random() - .5) * 40; } pos[i * 3 + 1] = y;
      }
      pts.position.set(px, py - 6, pz); g.attributes.position.needsUpdate = true;
    }
    if (K.kind === 'rain' && K.rainy > .5 && G.garden) G.garden.rain(dt);
    if (was === 'rain' && K.kind !== 'rain' && K.set && prev > .5) { if (K.kind === 'clear' || K.kind === 'cloudy') K.rainbow(); }
    was = K.kind;
    if (bowT > 0) { bowT -= dt; const o = Math.min(.55, bowT / 8 * .55, (70 - bowT) / 3 * .55); for (const m of bowMats) m.opacity = o; if (bowT <= 0) bow.visible = false; }
  };
  K.applySeason();
  return K;
};
