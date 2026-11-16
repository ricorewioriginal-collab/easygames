/* Prüfung: Die Ekel-Box – Kopf in der Plexiglas-Box, Krabbeltiere und Maden werden eingefüllt; Sterne mit den Zähnen von den Wänden ziehen, Nester meiden, Panik im Griff behalten */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const S = 0.5, HY = 1.62, FY = 1.3;   // halbe Kantenlänge innen, Kopfhöhe, Boxboden (Hals)

  // Mehlwürmer als Instanzen (Kapseln aus gestauchten Kugeln)
  function worms(scene, n) {
    const g = new T.SphereGeometry(0.5, 6, 4); g.scale(0.32, 0.32, 1.6);
    const m = new T.InstancedMesh(g, new T.MeshLambertMaterial({ color: R.lin(0xd8b878) }), n); scene.add(m);
    const list = []; for (let i = 0; i < n; i++) list.push({ x: 0, y: -9, z: 0, r: 0, s: 0.028, on: false, ph: Math.random() * 6 });
    const M = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), V = new T.Vector3(), P = new T.Vector3();
    return { mesh: m, list, sync(t) { list.forEach((w, i) => { E.set(Math.sin(t * 5 + w.ph) * 0.3, w.r, 0); Q.setFromEuler(E); V.setScalar(w.on ? w.s : 0.0001); P.set(w.x, w.y, w.z); M.compose(P, Q, V); m.setMatrixAt(i, M); }); m.instanceMatrix.needsUpdate = true; } };
  }

  UL.Trials.reg('box', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'day', radius: 14, clear: [{ x: 0, z: 0, r: 5 }], seed: 57 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Podest und Box (Holzrahmen, Plexiglas-Scheiben), um den Kopf des Promis
      const podest = new T.Mesh(new T.CylinderGeometry(2.2, 2.4, 0.3, 24), R.mat(studio ? 0x2a2833 : 0x6a4a2a)); podest.position.y = 0.15; sc.add(podest);
      const box = ctx.box = new T.Group(); box.position.set(0, 0, 0); sc.add(box);
      const wood = R.mat(studio ? 0xc0c8d0 : 0x9a6a3a);
      const glass = new T.MeshLambertMaterial({ color: 0xcfefff, transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false });
      for (const [x, z, ry] of [[0, -S, 0], [0, S, 0], [-S, 0, Math.PI / 2], [S, 0, Math.PI / 2]]) { const p = new T.Mesh(new T.PlaneGeometry(S * 2, S * 2 + 0.2), glass); p.position.set(x, FY + S, z); p.rotation.y = ry; box.add(p); }
      const edges = [];
      for (const x of [-S, S]) for (const z of [-S, S]) edges.push([x, FY + S, z, 0.06, S * 2 + 0.2, 0.06]);
      for (const y of [FY - 0.08, FY + S * 2 + 0.08]) { edges.push([0, y, -S, S * 2 + 0.1, 0.08, 0.06], [0, y, S, S * 2 + 0.1, 0.08, 0.06], [-S, y, 0, 0.06, 0.08, S * 2 + 0.1], [S, y, 0, 0.06, 0.08, S * 2 + 0.1]); }
      edges.forEach(([x, y, z, w, h, d]) => { const e = new T.Mesh(new T.BoxGeometry(w, h, d), wood); e.position.set(x, y, z); box.add(e); });
      const floor = new T.Mesh(new T.RingGeometry(0.13, S * 1.4, 24, 1), R.mat(studio ? 0x8a8f99 : 0x7a5a32)); floor.rotation.x = -Math.PI / 2; floor.position.y = FY; floor.scale.set(0.72, 0.72, 1); box.add(floor);
      // Einfüll-Trichter oben
      const fun = new T.Mesh(new T.CylinderGeometry(0.22, 0.08, 0.3, 12, 1, true), R.mat(0x3a7a3a)); fun.position.set(0, FY + S * 2 + 0.25, 0); box.add(fun);
      // Halter an den Innenwänden: Sterne und Nester
      const slots = [];
      for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) for (const u of [-0.26, 0, 0.26]) for (const v of [-0.12, 0.2]) {
        const x = nx ? nx * (S - 0.04) : u, z = nz ? nz * (S - 0.04) : u;
        slots.push({ x, y: HY + v, z, nx, nz });
      }
      ctx.rng.shuffle(slots);
      ctx.slots = [];
      const nStar = ctx.max + 2, nTrap = Math.round(5 * Math.min(1.4, ctx.k));
      slots.slice(0, nStar + nTrap).forEach((s, i) => {
        const trap = i >= nStar, g = new T.Group(); g.position.set(s.x, s.y, s.z); g.lookAt(0, s.y, 0); box.add(g);
        const hook = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.05, 4), R.mat(0x888888)); hook.rotation.x = Math.PI / 2; hook.position.z = 0.02; g.add(hook);
        let o;
        if (trap) { o = new T.Group(); for (let k = 0; k < 7; k++) { const b = new T.Mesh(new T.SphereGeometry(0.022, 6, 4), R.mat(k % 3 ? 0x1a100a : 0x3a2412)); b.position.set(UL.rand(-0.04, 0.04), UL.rand(-0.04, 0.04), 0.05); b.scale.z = 1.6; o.add(b); } const web = new T.Mesh(new T.CircleGeometry(0.08, 8), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, wireframe: true })); web.position.z = 0.03; o.add(web); }
        else { o = R.star(0.07); o.position.z = 0.05; }
        o.userData.b = o.scale.x; g.add(o);
        ctx.slots.push({ g, o, trap, used: false, wp: new T.Vector3(s.x, s.y, s.z) });
      });
      // Gekrabbel in der Box
      ctx.bugs = UL.Trials.bugs(sc, 60, 0x2a1408);
      ctx.bugs.list.forEach(b => { b.y = -9; b.s = 0.0001; b.on = false; });
      ctx.worms = worms(sc, 140);
      ctx.panic = 0.15; ctx.yaw = 0; ctx.pitch = 0; ctx.grab = 0; ctx.loadT = 3; ctx.stun = 0; ctx.loads = 0;
      ctx.player.root.position.set(0, 0, 0);
      ctx.hostPos.set(-2.2, 0.3, 2.4); ctx.hostRy = 2.4;
      ctx.intro = { pos: new T.Vector3(2.6, 2.2, 3.2), look: new T.Vector3(0, 1.6, 0) };
      UL.Trials.sign(ctx, 0, -3.2, 0);
      ctx.cam.position.set(2.6, 2.2, 3.2); ctx.cam.lookAt(0, 1.6, 0);
      ctx.reticle = true;
    },
    start(ctx) {
      ctx.player.root.visible = false;
      ctx.cam.position.set(0, HY, 0.05); ctx.cam.near = 0.02; ctx.cam.updateProjectionMatrix();
      ctx.overlay('<div class="reticle"></div>');
      this.load(ctx, 18, 30);
    },
    // Ladung einfüllen: Kakerlaken und Mehlwürmer
    load(ctx, nb, nw) {
      ctx.loads++;
      let k = 0;
      for (const b of ctx.bugs.list) { if (k >= nb) break; if (b.on) continue; b.on = true; b.x = UL.rand(-0.15, 0.15); b.z = UL.rand(-0.15, 0.15); b.y = FY + S * 2; b.vy = 0; b.s = UL.rand(0.035, 0.05); b.r = Math.random() * 6; b.wall = Math.random() < 0.45; b.sp = UL.rand(0.08, 0.2); k++; }
      k = 0;
      for (const w of ctx.worms.list) { if (k >= nw) break; if (w.on) continue; w.on = true; w.x = UL.rand(-0.2, 0.2); w.z = UL.rand(-0.2, 0.2); w.y = FY + S * 2; w.vy = 0; w.r = Math.random() * 6; k++; }
      ctx.stage.parts.burst(0, FY + S * 2, 0, 30, 0.6, -1, [0x2a1408, 0xd8b878, 0x3a2412]);
      UL.Audio.sfx('slime'); UL.Trials.crawl(5 + ctx.loads, ['roach', 'maggot', 'spider', 'maggot'], 3);
      ctx.panic = Math.min(1, ctx.panic + 0.12);
      if (ctx.loads > 1) ctx.bad(UL.pick(['Nachschub von oben!', 'Noch mehr Viecher!', 'Die krabbeln ins Ohr!']), 'scream');
    },
    update(dt, ctx) {
      const I = ctx.inp, cam = ctx.cam;
      const prog = 1 - ctx.time / ctx.timeMax;
      ctx.loadT -= dt; if (ctx.loadT <= 0) { ctx.loadT = UL.lerp(9, 5, prog) / ctx.k; this.load(ctx, 10 + Math.round(prog * 10), 16 + Math.round(prog * 20)); }
      // Tiere: fallen, krabbeln über Boden und Wände
      const t = ctx.t; let near = 0;
      ctx.bugs.list.forEach(b => {
        if (!b.on) return;
        if (b.vy !== undefined && b.y > FY + 0.02 && !b.climb) { b.vy -= 6 * dt; b.y = Math.max(FY + 0.02, b.y + b.vy * dt); if (b.y <= FY + 0.02) { b.vy = undefined; b.climb = b.wall; } return; }
        b.r += (Math.random() - 0.5) * 6 * dt;
        const nx = b.x + Math.sin(b.r) * b.sp * dt, nz = b.z + Math.cos(b.r) * b.sp * dt;
        if (b.climb) { b.y = UL.clamp(b.y + Math.sin(t * 2 + b.r) * b.sp * dt, FY + 0.02, FY + S * 1.9); }
        if (Math.abs(nx) > S - 0.03 || Math.abs(nz) > S - 0.03) b.r += Math.PI; else { b.x = nx; b.z = nz; }
        if (Math.hypot(b.x, b.z) < 0.16 && b.y < HY + 0.05) { b.x *= 1.15; b.z *= 1.15; }
        if (Math.hypot(b.x, b.z) < 0.22) near++;
      });
      ctx.bugs.sync();
      let wn = 0;
      ctx.worms.list.forEach(w => { if (!w.on) return; wn++; if (w.vy !== undefined) { w.vy -= 6 * dt; w.y += w.vy * dt; const floorY = FY + 0.015 + Math.min(0.14, wn * 0.0009); if (w.y <= floorY) { w.y = floorY; w.vy = undefined; } } else { w.r += Math.sin(t * 3 + w.ph) * dt; w.x = UL.clamp(w.x + Math.sin(w.r) * 0.02 * dt, -S + 0.03, S - 0.03); w.z = UL.clamp(w.z + Math.cos(w.r) * 0.02 * dt, -S + 0.03, S - 0.03); } });
      ctx.worms.sync(t);
      // Panik
      const calm = I.altD && ctx.stun <= 0;
      ctx.panic += (near * 0.006 + wn * 0.00012 + 0.012) * ctx.k * dt;
      if (calm) ctx.panic -= 0.3 * dt;
      ctx.panic = UL.clamp(ctx.panic, 0, 1);
      if (Math.random() < dt * (0.3 + ctx.panic)) UL.Trials.crawl(1, ['roach', 'maggot', 'spider'], 1.6);
      if (ctx.panic >= 1 && ctx.stun <= 0) { ctx.stun = 2; ctx.panic = 0.55; ctx.grab = 0; R.shake = 1; ctx.bad('PANIKATTACKE!', 'scream'); UL.Trials.crawl(12, undefined, 2); }
      if (ctx.stun > 0) ctx.stun -= dt;
      // Kopf drehen (Stick oder Wischen), nicht beim ruhigen Atmen
      if (ctx.stun <= 0 && !calm) {
        ctx.yaw -= I.mx * 1.9 * dt + I.lx * 1.2;
        ctx.pitch = UL.clamp(ctx.pitch - I.my * 1.3 * dt - I.ly * 0.8, -0.55, 0.45);
      } else if (ctx.stun > 0) { ctx.yaw += Math.sin(t * 17) * 0.02; }
      cam.position.set(0, HY, 0);
      cam.rotation.set(ctx.pitch, ctx.yaw, 0, 'YXZ');
      // Zielen: Halter nahe der Bildmitte
      const fw = new T.Vector3(0, 0, -1).applyEuler(cam.rotation);
      let aim = null, best = 0.18;
      for (const s of ctx.slots) { if (s.used) continue; const d = s.wp.clone().sub(cam.position).normalize(); const a = Math.acos(UL.clamp(d.dot(fw), -1, 1)); if (a < best) { best = a; aim = s; } }
      ctx.aim = aim;
      for (const s of ctx.slots) if (!s.used) s.o.scale.setScalar(s.o.userData.b * (s === aim ? 1.3 + Math.sin(t * 10) * 0.08 : 1));
      if (aim && I.okD && ctx.stun <= 0 && !calm) {
        ctx.grab += dt;
        if (aim.trap) { aim.used = true; aim.o.visible = false; ctx.grab = 0; ctx.panic = Math.min(1, ctx.panic + 0.3); UL.Trials.crawl(10, ['spider', 'roach'], 3); ctx.bad('Ins Spinnennest gebissen!', 'scream'); }
        else if (ctx.grab > 0.6) { aim.used = true; aim.o.visible = false; ctx.grab = 0; ctx.addStar(aim.wp); UL.Audio.sfx('pick'); }
      } else ctx.grab = Math.max(0, ctx.grab - dt * 2);
      ctx.overlay(`<div class="reticle ${aim ? (aim.trap ? 'bad' : 'on') : ''}"></div><div class="lbl">${ctx.stun > 0 ? '😱 PANIK – gleich geht’s weiter …' : calm ? '😮‍💨 Ruhig atmen …' : aim ? (aim.trap ? '🕷️ Achtung: Nest!' : `⭐ Aktion halten: mit den Zähnen ziehen <span class="bar"><i style="width:${Math.round(ctx.grab / 0.6 * 100)}%"></i></span>`) : 'Kopf drehen und einen Stern anpeilen'}</div>`);
      ctx.meters = [{ label: '😱 Panik', v: ctx.panic, danger: ctx.panic > 0.75, color: ctx.panic > 0.75 ? '#ff4a4a' : '#ffb03a' }];
      const left = ctx.slots.filter(s => !s.used && !s.trap).length;
      if (left + ctx.stars < ctx.max) ctx.end('leer');
      ctx.extraHud = `<span class="chip">🪲 ${ctx.bugs.list.filter(b => b.on).length + wn} Tiere in der Box</span>`;
    },
    finish(ctx) { ctx.player.root.visible = true; ctx.cam.near = 0.1; ctx.cam.updateProjectionMatrix(); },
    bot(dt, ctx, I) {
      if (ctx.panic > 0.8) { I.altD = true; return; }
      const cam = ctx.cam;
      let best = null, ba = 9;
      for (const s of ctx.slots) { if (s.used || s.trap) continue; const yaw = Math.atan2(-s.wp.x, -s.wp.z); let dy = yaw - ctx.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); if (Math.abs(dy) < ba) { ba = Math.abs(dy); best = { s, dy }; } }
      if (!best) return;
      const pitch = Math.atan2(best.s.wp.y - HY, Math.hypot(best.s.wp.x, best.s.wp.z));
      I.mx = -UL.clamp(best.dy * 3, -1, 1); I.my = -UL.clamp((pitch - ctx.pitch) * 3, -1, 1);
      if (ctx.aim === best.s) I.okD = true;
    }
  });
})();
