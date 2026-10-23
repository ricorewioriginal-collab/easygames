/* Funkgalgen – 3D-Bühne (Three.js r128): Moderator auf einem Turm aus Lautsprecher-Kisten über einer Riesen-Torte.
 * Jeder Fehler schießt eine Kiste heraus, der Turm neigt sich; nach dem letzten Fehler kippt alles – der Moderator landet in der Torte. */
(function () {
  'use strict';
  const T3 = window.THREE;
  const S = { ok: false };
  const BOXH = .3, BOXW = .78, BOXD = .6, TX = -.55;
  let renderer, scene, camera, host, tower, boxes = [], mod, cake, cakeTop, parts = [], spots = [], onAir, t = 0, state = 'idle', fallT = 0, winT = 0, wob = 0, lean = 0, leanT = 0, paused = false, low = false;
  const M = (c, o) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: .05 }, o || {}));
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const tx = new T3.CanvasTexture(c); tx.anisotropy = 4; return tx; }
  const speakerTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#1d1a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#FF4FAE'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    for (const [x, r] of [[70, 44], [180, 34]]) { const gr = g.createRadialGradient(x, h / 2, 2, x, h / 2, r); gr.addColorStop(0, '#666'); gr.addColorStop(.3, '#222'); gr.addColorStop(1, '#3a3550'); g.fillStyle = gr; g.beginPath(); g.arc(x, h / 2, r, 0, 7); g.fill(); g.strokeStyle = '#555'; g.lineWidth = 4; g.stroke(); } });

  function init(el, opt) {
    if (S.ok) { el.appendChild(renderer.domElement); host = el; resize(); return; }
    low = !!(opt && opt.low); host = el;
    renderer = new T3.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5)); el.appendChild(renderer.domElement);
    scene = new T3.Scene(); camera = new T3.PerspectiveCamera(42, 1, .1, 60);
    scene.add(new T3.HemisphereLight(0xffffff, 0x3a2a6a, .75));
    const key = new T3.DirectionalLight(0xffffff, .8); key.position.set(3, 6, 5); scene.add(key);
    const rim = new T3.PointLight(0xff4fae, .9, 12); rim.position.set(-3, 3, -1); scene.add(rim);
    // Bühne
    const floor = new T3.Mesh(new T3.CylinderGeometry(3.6, 3.8, .2, 64), M(0x1a1440)); floor.position.y = -.1; scene.add(floor);
    const ring = new T3.Mesh(new T3.TorusGeometry(3.62, .04, 8, 80), new T3.MeshBasicMaterial({ color: 0xff4fae })); ring.rotation.x = Math.PI / 2; ring.position.y = .01; scene.add(ring);
    const wall = new T3.Mesh(new T3.PlaneGeometry(14, 7), new T3.MeshBasicMaterial({ map: canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a1b6b'); gr.addColorStop(1, '#0b0f2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,79,174,' + (.05 + Math.random() * .1) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 2); } }) }));
    wall.position.set(0, 3, -3.2); scene.add(wall);
    // Senderlogos und ON-AIR-Schild an der Rückwand
    const tl = new T3.TextureLoader();
    [[1, -2.6], [7, 2.6]].forEach(([n, x]) => { const m = new T3.Mesh(new T3.PlaneGeometry(1.25, 1.25), new T3.MeshBasicMaterial({ map: tl.load('../anmacha-memory/logos/' + String(n).padStart(2, '0') + '.png') })); m.position.set(x, 3.1, -3.15); scene.add(m); const f = new T3.Mesh(new T3.PlaneGeometry(1.4, 1.4), new T3.MeshBasicMaterial({ color: 0xff4fae })); f.position.set(x, 3.1, -3.16); scene.add(f); });
    onAir = new T3.Mesh(new T3.BoxGeometry(1.5, .45, .1), new T3.MeshBasicMaterial({ map: canvasTex(256, 80, (g, w, h) => { g.fillStyle = '#d0102a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 54px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', w / 2, h / 2 + 2); }) }));
    onAir.position.set(0, 4.05, -3.1); scene.add(onAir);
    for (let i = 0; i < 3; i++) { const c = new T3.Mesh(new T3.ConeGeometry(.9, 5, 24, 1, true), new T3.MeshBasicMaterial({ color: [0xff4fae, 0x00e5ff, 0xffc94d][i], transparent: true, opacity: .09, side: T3.DoubleSide, depthWrite: false })); c.position.set(-2.5 + i * 2.5, 4.6, -1); scene.add(c); spots.push(c); }
    // Torte
    cake = new T3.Group(); cake.position.set(1.15, 0, .35);
    const plate = new T3.Mesh(new T3.CylinderGeometry(1.0, 1.0, .05, 40), M(0xf0f0f8, { metalness: .3 })); plate.position.y = .03; cake.add(plate);
    const t1 = new T3.Mesh(new T3.CylinderGeometry(.8, .8, .42, 40), M(0xc7843f)); t1.position.y = .26; cake.add(t1);
    const c1 = new T3.Mesh(new T3.CylinderGeometry(.82, .82, .1, 40), M(0xfffaf0)); c1.position.y = .47; cake.add(c1);
    const t2 = new T3.Mesh(new T3.CylinderGeometry(.55, .55, .34, 40), M(0xff9ec8)); t2.position.y = .69; cake.add(t2);
    cakeTop = new T3.Group(); cakeTop.position.y = .86; cake.add(cakeTop);
    cakeTop.add(new T3.Mesh(new T3.CylinderGeometry(.57, .57, .08, 40), M(0xfffaf0)));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = new T3.Mesh(new T3.SphereGeometry(.07, 12, 8), M(0xfffaf0)); s.position.set(Math.cos(a) * .42, .07, Math.sin(a) * .42); cakeTop.add(s); const ch = new T3.Mesh(new T3.SphereGeometry(.045, 10, 8), M(0xd0102a, { roughness: .3 })); ch.position.set(Math.cos(a) * .42, .14, Math.sin(a) * .42); cakeTop.add(ch); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, d = new T3.Mesh(new T3.CylinderGeometry(.04, .04, .12 + (i % 3) * .06, 8), M(0xfffaf0)); d.position.set(Math.cos(a) * .82, .4 - (i % 3) * .03, Math.sin(a) * .82); cake.add(d); }
    scene.add(cake);
    // Turm und Moderator
    tower = new T3.Group(); tower.position.set(TX, 0, 0); scene.add(tower);
    mod = buildMod(); scene.add(mod);
    S.ok = true; resize(); addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) last = performance.now(); });
    requestAnimationFrame(loop);
  }
  function buildMod() {
    const g = new T3.Group(), skin = M(0xe8b48f), shirt = M(0xff4fae), pants = M(0x2b2f55), dark = M(0x1a1a1a);
    const leg = x => { const l = new T3.Mesh(new T3.CylinderGeometry(.065, .06, .5, 10), pants); l.position.set(x, .25, 0); g.add(l); const s = new T3.Mesh(new T3.BoxGeometry(.12, .07, .2), dark); s.position.set(x, .03, .04); g.add(s); };
    leg(-.08); leg(.08);
    const body = new T3.Mesh(new T3.CylinderGeometry(.17, .15, .48, 14), shirt); body.position.y = .74; g.add(body);
    const sh = new T3.Mesh(new T3.SphereGeometry(.17, 14, 10), shirt); sh.scale.y = .5; sh.position.y = .97; g.add(sh);
    const head = new T3.Group(); head.position.y = 1.18; g.add(head); g.userData.head = head;
    head.add(new T3.Mesh(new T3.SphereGeometry(.15, 18, 14), skin));
    const hair = new T3.Mesh(new T3.SphereGeometry(.155, 18, 12, 0, Math.PI * 2, 0, Math.PI * .5), M(0x3a2414)); hair.position.y = .02; hair.rotation.x = -.25; head.add(hair);
    for (const x of [-.05, .05]) { const e = new T3.Mesh(new T3.SphereGeometry(.022, 8, 6), dark); e.position.set(x, .02, .135); head.add(e); }
    const mouth = new T3.Mesh(new T3.TorusGeometry(.04, .012, 6, 12, Math.PI), M(0x7a2020)); mouth.position.set(0, -.05, .13); mouth.rotation.z = Math.PI; head.add(mouth); g.userData.mouth = mouth;
    const band = new T3.Mesh(new T3.TorusGeometry(.17, .022, 8, 20, Math.PI), dark); band.position.y = .02; head.add(band);
    for (const x of [-.165, .165]) { const cup = new T3.Mesh(new T3.CylinderGeometry(.06, .06, .05, 14), dark); cup.rotation.z = Math.PI / 2; cup.position.set(x, .0, 0); head.add(cup); }
    const arm = s => { const p = new T3.Group(); p.position.set(s * .2, .95, 0); const a = new T3.Mesh(new T3.CylinderGeometry(.05, .045, .45, 10), shirt); a.position.y = -.22; p.add(a); const hnd = new T3.Mesh(new T3.SphereGeometry(.055, 10, 8), skin); hnd.position.y = -.46; p.add(hnd); g.add(p); return p; };
    g.userData.armL = arm(-1); g.userData.armR = arm(1);
    const mic = new T3.Group(); mic.add(new T3.Mesh(new T3.CylinderGeometry(.025, .02, .2, 8), dark)); const mh = new T3.Mesh(new T3.SphereGeometry(.05, 10, 8), M(0x888888, { metalness: .6 })); mh.position.y = .12; mic.add(mh); mic.position.set(0, -.5, .04); g.userData.armR.add(mic);
    return g;
  }
  function reset(max) {
    for (const b of boxes) tower.remove(b.m); boxes = []; for (const p of parts) scene.remove(p.m); parts = [];
    const mats = [0xff4fae, 0x00e5ff, 0xffc94d, 0x8b5cf6];
    for (let i = 0; i < max; i++) {
      const side = M(0x2a2540), front = new T3.MeshStandardMaterial({ map: speakerTex, roughness: .6 }), edge = M(mats[i % 4], { emissive: mats[i % 4], emissiveIntensity: .25 });
      const m = new T3.Mesh(new T3.BoxGeometry(BOXW, BOXH, BOXD), [side, side, edge, side, front, side]);
      m.position.set(((i % 2) - .5) * .04, BOXH / 2 + i * BOXH, 0); m.rotation.y = ((i % 3) - 1) * .06; tower.add(m); boxes.push({ m, y: m.position.y, out: false });
    }
    tower.rotation.z = 0; lean = leanT = 0; state = 'idle'; fallT = winT = 0; wob = 0; cakeTop.scale.set(1, 1, 1);
    mod.rotation.set(0, 0, 0); placeMod(1);
  }
  const live = () => boxes.filter(b => !b.out);
  function topY() { return live().length * BOXH; }
  function placeMod(k) { const p = new T3.Vector3(0, topY(), 0); tower.localToWorld(p); mod.position.lerp(p, k); mod.rotation.z = tower.rotation.z + Math.sin(t * 6) * wob; }
  function wrong(lives, max) {
    const l = live(); if (!l.length) return;
    const b = l.length > 1 ? l[(Math.random() * (l.length - 1)) | 0] : l[0]; b.out = true;
    // Kiste herausschießen
    const wp = new T3.Vector3(); b.m.getWorldPosition(wp); tower.remove(b.m); scene.add(b.m); b.m.position.copy(wp);
    parts.push({ m: b.m, v: new T3.Vector3((Math.random() < .5 ? -1 : 1) * (1.5 + Math.random()), 2.5, 2 + Math.random()), r: new T3.Vector3(Math.random() * 8, Math.random() * 8, 0), life: 2.5 });
    // darüberliegende Kisten rutschen nach
    live().forEach((x, i) => { x.y = BOXH / 2 + i * BOXH; });
    leanT = -(max - lives) * .035; wob = .04 + (max - lives) * .02;
    if (lives <= 0) { state = 'fall'; fallT = 0; }
  }
  function right() { wob = Math.max(0, wob * .7); state = state === 'fall' ? state : 'cheer'; winT = 0; }
  function win() { state = 'win'; winT = 0; confetti(); }
  function confetti() { for (let i = 0; i < (low ? 40 : 90); i++) { const m = new T3.Mesh(new T3.PlaneGeometry(.06, .1), new T3.MeshBasicMaterial({ color: [0xff4fae, 0x00e5ff, 0xffc94d, 0x2ee6a0, 0xffffff][i % 5], side: T3.DoubleSide })); m.position.set((Math.random() - .5) * 5, 4 + Math.random() * 2, (Math.random() - .5) * 2); scene.add(m); parts.push({ m, v: new T3.Vector3((Math.random() - .5) * .6, -1 - Math.random(), 0), r: new T3.Vector3(Math.random() * 6, Math.random() * 6, 0), life: 5, slow: true }); } }
  function splash(at) { for (let i = 0; i < (low ? 20 : 45); i++) { const m = new T3.Mesh(new T3.SphereGeometry(.04 + Math.random() * .05, 8, 6), M(0xfffaf0)); m.position.copy(at); scene.add(m); const a = Math.random() * Math.PI * 2; parts.push({ m, v: new T3.Vector3(Math.cos(a) * (1 + Math.random() * 2), 2 + Math.random() * 3, Math.sin(a) * (1 + Math.random() * 2)), r: new T3.Vector3(), life: 2 }); } }
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    if (paused || document.hidden || !host || !host.offsetWidth) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    lean += (leanT - lean) * Math.min(1, dt * 6);
    for (const b of live()) b.m.position.y += (b.y - b.m.position.y) * Math.min(1, dt * 10);
    for (const s of spots) s.rotation.z = Math.sin(t * .7 + s.position.x) * .25;
    onAir.material.color.setScalar(.75 + .25 * Math.sin(t * 3));
    const ud = mod.userData;
    if (state === 'fall') {
      fallT += dt; tower.rotation.z = lean - Math.min(1.3, fallT * fallT * 2.2);
      const k = Math.min(1, fallT / 1.1), start = new T3.Vector3(TX, topY() + .2, 0), end = new T3.Vector3(cake.position.x, .9, cake.position.z);
      mod.position.set(start.x + (end.x - start.x) * k, start.y + (end.y - start.y) * k + Math.sin(k * Math.PI) * 1.2 - (fallT > 1.1 ? Math.min(.3, (fallT - 1.1) * 1.2) : 0), start.z + (end.z - start.z) * k);
      mod.rotation.z = -k * 2.6; ud.armL.rotation.z = -2.6 + Math.sin(t * 20) * .4; ud.armR.rotation.z = 2.6 - Math.sin(t * 20) * .4;
      if (fallT > 1.1 && !S.splashed) { S.splashed = true; splash(new T3.Vector3(end.x, 1, end.z)); cakeTop.scale.set(1.15, .5, 1.15); }
    } else {
      S.splashed = false; tower.rotation.z = lean + Math.sin(t * 3) * wob * .25; placeMod(Math.min(1, dt * 12));
      let jump = 0, armA = .15 + Math.sin(t * 2) * .05;
      if (state === 'win') { winT += dt; jump = Math.abs(Math.sin(winT * 7)) * .25; armA = 2.6 + Math.sin(winT * 14) * .3; }
      else if (state === 'cheer') { winT += dt; jump = Math.max(0, Math.sin(Math.min(1, winT / .35) * Math.PI)) * .15; armA = winT < .5 ? 2.4 : .15; if (winT > .6) state = 'idle'; }
      else if (wob > .12) armA = .8 + Math.sin(t * 9) * .7; // Angst: mit den Armen rudern
      mod.position.y += jump; ud.armL.rotation.z = -armA; ud.armR.rotation.z = armA * (state === 'idle' && wob <= .12 ? .2 : 1) + (state === 'idle' && wob <= .12 ? -.9 : 0);
      ud.head.rotation.y = Math.sin(t * .8) * .3; ud.mouth.rotation.z = wob > .12 && state === 'idle' ? 0 : Math.PI;
      cakeTop.scale.lerp(new T3.Vector3(1, 1, 1), Math.min(1, dt * 2));
    }
    for (const p of parts) { p.life -= dt; p.v.y -= (p.slow ? .6 : 6) * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += p.r.x * dt; p.m.rotation.y += p.r.y * dt; if (!p.slow && p.m.position.y < .05 && p.v.y < 0) { p.v.y *= -.3; p.v.x *= .6; p.v.z *= .6; } }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) { scene.remove(parts[i].m); parts.splice(i, 1); }
    renderer.render(scene, camera);
  }
  function resize() {
    if (!host) return; const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false);
    camera.aspect = w / h; const port = w / h < 1.1; camera.fov = port ? 50 : 40; camera.position.set(port ? .3 : .35, port ? 2.6 : 2.3, port ? 8.6 : 6.6); camera.lookAt(.3, port ? 1.75 : 1.7, 0); camera.updateProjectionMatrix();
  }
  window.FGScene = { init, reset, wrong, right, win, pause: on => { paused = on; }, resize, boxesLeft: () => live().length };
})();
