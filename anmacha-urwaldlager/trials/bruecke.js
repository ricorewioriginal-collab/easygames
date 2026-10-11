/* Prüfung: Die Wackelbrücke (3D) – aktive Balance, Windböen, fehlende Planken, Sterne nur mit Gewichtsverlagerung */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp;
  T.def({
    id: 'bruecke', name: 'Die Wackelbrücke', kind: 'Mut', stat: 'mut', e: '🌉', mode: '3d', lock: false,
    desc: 'Eine schwankende Hängebrücke über der Nebelschlucht. Halte die Balance gegen Windböen, spring über fehlende Planken und lehne dich weit hinaus, um die Sterne an den Seilen zu greifen. Unten fängt dich ein Sicherungsnetz – das kostet aber Zeit.',
    how: { pc: '<b>W/S</b> gehen · <b>A/D</b> Gewicht verlagern (gegen die Neigung halten) · <b>Leertaste</b> über Lücken springen · Maus ziehen: umsehen', touch: 'Joystick <b>hoch</b> = gehen, <b>links/rechts</b> = Gewicht verlagern · Taste <b>Springen</b> über Lücken' },
    controls: { joy: true, look: false, buttons: [{ id: 'jump', label: 'Springen', big: true }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short;
      const L = short ? 34 : 58, nStar = ctx.max - 1, limit = short ? 46 : 70 - d * 16;
      const R = E.rand(7 + Math.floor(Math.random() * 999));
      S.background = new THREE.Color(0x9cc6c0); S.fog = new THREE.Fog(0x9cc6c0, 18, 75);
      ctx.lights({ sky: 0xe6fff2, ground: 0x2f4a2a, hemi: .85, dir: .7 });
      // Brücke: Planken als InstancedMesh, Lücken an festen Stellen
      const gaps = []; const nGap = short ? 2 : 2 + Math.round(d * 3);
      for (let i = 0; i < nGap; i++) gaps.push(6 + (i + .5) * (L - 10) / nGap + (R() - .5) * 3);
      const isGap = z => gaps.some(g => Math.abs(z - g) < .55);
      const pl = [], plankGeo = new THREE.BoxGeometry(1.5, .07, .32);
      for (let z = 0; z < L; z += .42) if (!gaps.some(g => Math.abs(z + .16 - g) < .5)) pl.push(z);
      const planks = new THREE.InstancedMesh(plankGeo, E.mat('#8a5e34'), pl.length); const dm = new THREE.Object3D();
      planks.userData.z = pl; S.add(planks);
      const ropeGeo = new THREE.CylinderGeometry(.025, .025, 1, 5), ropeMat = E.mat('#c8a26a');
      const rails = [-.78, .78].map(x => { const m = new THREE.Mesh(ropeGeo, ropeMat); m.scale.y = L; m.rotation.x = Math.PI / 2; m.position.set(x, 1.05, L / 2); S.add(m); return m; });
      const hang = new THREE.InstancedMesh(ropeGeo, ropeMat, Math.ceil(L / 1.4) * 2); let hi = 0;
      for (let z = 0; z < L; z += 1.4) for (const x of [-.78, .78]) { dm.position.set(x, .52, z); dm.scale.set(1, 1.05, 1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); hang.setMatrixAt(hi++, dm.matrix); }
      hang.count = hi; S.add(hang);
      // Klippen, Schlucht, Bäume, Nebel
      const cliff = E.merge([
        { g: E.geo.box, m: E.mtx(0, -6, -7, 0, 0, 0, 30, 12, 14), c: '#4d6b3a', jit: .2 }, { g: E.geo.box, m: E.mtx(0, -6, L + 7, 0, 0, 0, 30, 12, 14), c: '#4d6b3a', jit: .2 },
        { g: E.geo.box, m: E.mtx(-24, -14, L / 2, 0, 0, 0, 6, 34, L + 30), c: '#3a4f33', jit: .3 }, { g: E.geo.box, m: E.mtx(24, -14, L / 2, 0, 0, 0, 6, 34, L + 30), c: '#3a4f33', jit: .3 }
      ]); S.add(new THREE.Mesh(cliff, E.vcMat));
      const tparts = []; for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, z = R() * (L + 24) - 12, x = side * (20 + R() * 6), h = 4 + R() * 6, onCliff = z < -1 || z > L + 1; const y = onCliff ? 0 : 6; tparts.push({ g: E.geo.cylLo, m: E.mtx(x, y + h / 2, z, 0, 0, 0, .25, h, .25), c: '#5a3d22' }, { g: E.geo.ico, m: E.mtx(x, y + h + 1, z, 0, R() * 3, 0, 2 + R(), 1.6 + R(), 2 + R()), c: ['#2f7d3a', '#3c8f45', '#25663a'][i % 3], jit: .25 }); }
      S.add(new THREE.Mesh(E.merge(tparts), E.vcMat));
      const mist = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ color: 0xdfeee8, transparent: true, opacity: .75 })); mist.rotation.x = -Math.PI / 2; mist.scale.set(60, L + 60, 1); mist.position.set(0, -9, L / 2); S.add(mist);
      const net = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .35 })); net.rotation.x = -Math.PI / 2; net.scale.set(6, L, 1); net.position.set(0, -4, L / 2); S.add(net);
      // Sterne an den Seilen (links/rechts abwechselnd, weit außen)
      const stars = []; for (let i = 0; i < nStar; i++) { const z = 5 + (i + .5) * (L - 8) / nStar, side = (i % 2 ? 1 : -1) * (R() < .25 ? -1 : 1), m = T.make.starMesh(); m.position.set(-side * 1.25, 1.45, z); S.add(m); stars.push({ m, z, side, got: false }); }
      const goal = T.make.starMesh(); goal.scale.setScalar(1.6); goal.position.set(0, 2, L + 1.5); S.add(goal);
      // Spielfigur
      const F = ctx.figure(Object.assign({}, ctx.who)); S.add(F.group);
      let z = -1.2, b = 0, vb = 0, air = 0, vy = 0, y = 0, falls = 0, fallT = 0, got = 0, time = 0, gustT = 2, gust = 0, gustDir = 1, sway = 0, finished = false, checkpoint = -1.2, camYaw = 0, warn = 0;
      const inst = .9 + d * 1.1, gustMax = .55 + d * 1.1;
      cam.position.set(0, 3, -6);
      function bridgeSway(zz, t) { return Math.sin(t * 1.3 + zz * .35) * .06 * Math.sin(Math.PI * clamp(zz / L, 0, 1)); }
      function updatePlanks(t) { for (let i = 0; i < pl.length; i++) { const zz = pl[i], s = Math.sin(Math.PI * clamp(zz / L, 0, 1)); dm.position.set(bridgeSway(zz, t) * 2, -s * .9 + Math.sin(t * 2 + zz) * .02 * s, zz + .16); dm.rotation.set(0, 0, b * .12 * s * Math.max(0, 1 - Math.abs(zz - z) / 6) + bridgeSway(zz, t)); dm.scale.set(1, 1, 1); dm.updateMatrix(); planks.setMatrixAt(i, dm.matrix); } planks.instanceMatrix.needsUpdate = true; }
      const sag = zz => -Math.sin(Math.PI * clamp(zz / L, 0, 1)) * .9;
      function place(t) {
        const s = sag(z), sx = bridgeSway(z, t) * 2; F.group.position.set(sx - (fallT > 0 ? b * 2 : 0), s + .04 + y - (fallT > 0 ? (1.6 - fallT) * 3 : 0), z); F.group.rotation.set(0, 0, b * .55); F.group.rotation.y = 0;
        const tx = F.group.position.x * .5, tz = z - 4.8, ty = s + 2.6; cam.position.x += (tx + Math.sin(camYaw) * 2 - cam.position.x) * .08; cam.position.y += (ty - cam.position.y) * .08; cam.position.z += (tz - cam.position.z) * .12; cam.lookAt(F.group.position.x * .6, s + 1.3, z + 3.5); cam.rotation.z += -b * .05;
      }
      updatePlanks(0); place(0);
      ctx.hud.hint('Halte die Balance – lehn dich zu den Sternen!');
      const api = {
        idle(dt) { time += dt; F.anim(dt, 'idle'); updatePlanks(time); place(time); stars.forEach(s => { s.m.rotation.y += dt * 2; }); },
        update(dt) {
          time += dt; const mv = I.move; const look = I.consumeLook(); camYaw = clamp(camYaw + look.dx * .003, -.8, .8);
          stars.forEach(s => { s.m.rotation.y += dt * 2; }); goal.rotation.y += dt * 1.5;
          if (finished) { F.anim(dt, 'cheer'); place(time); return; }
          const left = Math.max(0, limit - ctx.t); ctx.hud.time(left, left / limit); if (left <= 0) { finished = true; ctx.finish(got, 'time'); return; }
          if (fallT > 0) { fallT -= dt; F.anim(dt, 'scared'); place(time); if (fallT <= 0) { z = checkpoint; b = 0; vb = 0; y = 0; air = 0; ctx.hud.toast('Zurück auf die Brücke!'); } updatePlanks(time); ctx.hud.meter('bal', 0, 'Gleichgewicht', '#ff6b4a'); return; }
          // Wind
          gustT -= dt; if (gustT <= 0) { gustT = 2.2 + Math.random() * 2.8 - d; gustDir = Math.random() < .5 ? -1 : 1; gust = gustMax * (.5 + Math.random() * .5); warn = .8; ctx.hud.toast(gustDir < 0 ? '💨 Böe von rechts!' : '💨 Böe von links!'); }
          gust *= Math.pow(.55, dt); warn = Math.max(0, warn - dt);
          // Gehen
          const walk = clamp(mv.y, -.5, 1), speed = (walk > 0 ? 2.3 : 1.2) * walk; z = clamp(z + speed * dt, -1.5, L + 2);
          sway = Math.sin(time * 6) * Math.abs(speed) * .08;
          // Balance: instabiles Pendel, Spieler-Gewicht gegenlenken
          vb += (b * inst + gust * gustDir + sway * (Math.random() - .3) + bridgeSway(z, time) * 2) * dt; vb *= Math.pow(.35, dt);
          b = clamp(b + (vb + mv.x * 1.6) * dt, -1.3, 1.3); // b > 0 = Neigung nach rechts (Bildschirm)
          // Sprung
          if (air > 0) { air -= dt; vy -= 16 * dt; y = Math.max(0, y + vy * dt); if (y <= 0 && vy < 0) { air = 0; y = 0; ctx.S.thud(); vb += (Math.random() - .5) * .8; } }
          else if (I.pressed('jump')) { air = 1; vy = 6; ctx.S.click(); }
          if (air <= 0 && isGap(z)) { fall('Lücke übersehen!'); return; }
          if (Math.abs(b) > 1) { fall('Gleichgewicht verloren!'); return; }
          if (z > checkpoint + 8 && !isGap(z)) checkpoint = z;
          // Sterne greifen (seitliche Neigung nötig)
          stars.forEach(s => { if (s.got || Math.abs(s.z - z) > .9) return; if (Math.sign(b) === s.side && Math.abs(b) > .42) { s.got = true; got++; s.m.visible = false; ctx.hud.stars(got); ctx.hud.toast('★ Stern gegriffen!', 'good'); } });
          if (z >= L + .8) { finished = true; got++; goal.visible = false; ctx.hud.stars(got); ctx.finish(got, 'done'); return; }
          const pose = air > 0 ? 'cheer' : Math.abs(speed) > .1 ? 'walk' : 'idle'; F.anim(dt, pose, Math.abs(speed));
          F.armL.rotation.z = -.6 + b * .6; F.armR.rotation.z = .6 + b * .6;
          updatePlanks(time); place(time);
          const bal = 1 - Math.abs(b); ctx.hud.meter('bal', bal, Math.abs(b) > .7 ? '⚠ Gleichgewicht' : 'Gleichgewicht', bal < .3 ? '#ff6b4a' : bal < .55 ? '#ffcf4a' : '#9dff5c');
          ctx.hud.meter('pos', z / L, 'Strecke', '#37d6e8');
        },
        debug: () => ({ z, b, falls, got, L, gaps, stars: stars.map(s => ({ z: s.z, side: s.side, got: s.got })) }),
        details: () => ({ falls }),
        bot() { // Testpilot: lenkt gegen die Neigung, lehnt sich zu Sternen, springt über Lücken
          const st = stars.find(s => !s.got && s.z > z - .6 && s.z - z < 2.4), want = st ? st.side * .62 : 0;
          let x = clamp((want - b) * 2.2 - vb * .9, -1, 1); const nextGap = gaps.find(g => g - z > 0 && g - z < .8);
          return { move: { x, y: st && Math.abs(b - want) > .25 ? .25 : 1 }, press: nextGap && air <= 0 ? ['jump'] : [] };
        }
      };
      function fall(msg) { falls++; fallT = 1.6; ctx.S.bad(); ctx.hud.toast('😱 ' + msg + ' Ab ins Netz!', 'bad'); }
      return api;
    }
  });
})();
