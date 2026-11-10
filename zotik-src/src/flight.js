// Nautilux-Flug zwischen den Welten (wie die Gumi-Flüge bei Kingdom Hearts, aber eigenständig):
// Die Nautilux fliegt durch den Rissraum, weicht Gesteinsbrocken aus, schießt Rissdrohnen ab und
// sammelt Splitter-Ringe. Steuerung: Bewegen (Stick, WASD, Joystick); geschossen wird automatisch.
import * as T from 'three';

export function createFlight({ renderer, makeShip, inputVec, sfx, hud }) {
  let F = null;
  const R = (a, b) => a + Math.random() * (b - a);

  function start({ fromName, toName, color = 0x8ad0ff, dist = 1, onDone }) {
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
    planet.position.set(0, 10, -620); scene.add(planet);
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
    F = { scene, cam, ship, trail, planet, halo, stars, neb, obj: [], shots: [], t: 0, len, x: 0, y: 0, vx: 0, vy: 0, hp: 100, hits: 0, got: 0, kills: 0, spawn: 0, fire: 0, onDone, done: false, rockG, rockM, droneG, droneM, ringG, ringM, shotG, shotM, inv: 0 };
    hud.show(fromName, toName);
    sfx('quest');
  }

  function add(kind) {
    const f = F; let m;
    if (kind === 'rock') { m = new T.Mesh(f.rockG, f.rockM); const s = R(1.2, 3.2); m.scale.set(s, s * R(.7, 1.2), s); }
    else if (kind === 'drone') m = new T.Mesh(f.droneG, f.droneM);
    else { m = new T.Mesh(f.ringG, f.ringM); }
    m.position.set(R(-10, 10), R(-5.5, 6), -160);
    f.scene.add(m); f.obj.push({ m, kind, hp: kind === 'drone' ? 3 : kind === 'rock' ? 5 : 0, r: kind === 'rock' ? m.scale.x * .95 : kind === 'drone' ? 1 : 1.7, ph: R(0, 6) });
  }

  function update(dt) {
    const f = F; if (!f || f.done) return;
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
    const k = Math.min(1, f.t / f.len); f.planet.position.z = -620 + k * 470; f.halo.position.z = f.planet.position.z; f.planet.rotation.y += dt * .1;
    // Gegner, Brocken, Ringe
    f.spawn -= dt;
    if (f.spawn <= 0 && f.t < f.len - 3) { f.spawn = R(.32, .6) * (1 - k * .35); const r = Math.random(); add(r < .5 ? 'rock' : r < .8 ? 'drone' : 'ring'); }
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
    f.scene.remove(f.ship);   // gehört der Spielwelt-Fabrik: nicht freigeben
    f.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); F = null; hud.hide();
    f.onDone({ reward, kills: f.kills, hits: f.hits, skipped, ship: f.ship });
  }

  return { start, update, render, skip: () => finish(true), get on() { return !!F; } };
}
