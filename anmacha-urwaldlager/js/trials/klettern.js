/* Prüfung: Die Kletterwand – selbst an der Felswand nach oben klettern und die Sterne an den Griffen holen.
   Stick zeigt zum nächsten Griff (er leuchtet auf), Knopf = hinübergreifen. Die Kraft lässt nach – an den
   großen grünen Griffen kann man verschnaufen. Braune Griffe sind locker und brechen nach kurzer Zeit weg. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R;
  const WW = 7, WH = 13, REACH = 1.75;

  UL.Trials.reg('klettern', {
    orbit: true,
    env: (theme) => theme === 'studio' ? { radius: 15 } : { tod: 'day', radius: 16, clear: [{ x: 0, z: 3, r: 6 }], seed: 52 },
    setup(ctx) {
      const sc = ctx.scene, rng = ctx.rng, studio = ctx.theme === 'studio';
      // Felswand mit Struktur
      const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
      g.fillStyle = studio ? '#6a6878' : '#8a7a62'; g.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 2600; i++) { g.fillStyle = Math.random() < 0.5 ? (studio ? '#4a4858' : '#5e5040') : (studio ? '#8a889a' : '#a8987a'); g.globalAlpha = Math.random() * 0.35; const s = 2 + Math.random() * 8; g.fillRect(Math.random() * 256, Math.random() * 512, s, s * 0.6); }
      g.globalAlpha = 0.4; g.strokeStyle = '#3a3026'; g.lineWidth = 2; for (let i = 0; i < 18; i++) { g.beginPath(); let x = Math.random() * 256, y = Math.random() * 512; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 40; y += Math.random() * 30; g.lineTo(x, y); } g.stroke(); }
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
      const wall = new T.Mesh(new T.BoxGeometry(WW, WH, 0.6), new T.MeshLambertMaterial({ map: t })); wall.position.set(0, WH / 2, -0.3); wall.receiveShadow = true; sc.add(wall);
      for (const s of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(0.4, WH + 1, 0.8), R.mat(studio ? 0x2a2833 : 0x5a3a1e)); p.position.set(s * (WW / 2 + 0.2), (WH + 1) / 2, -0.3); sc.add(p); }
      const top = new T.Mesh(new T.BoxGeometry(WW + 0.8, 0.3, 1.4), R.mat(studio ? 0x2a2833 : 0x5a3a1e)); top.position.set(0, WH + 0.6, 0); sc.add(top);
      const mat = new T.Mesh(new T.BoxGeometry(WW + 1, 0.35, 3), R.mat(studio ? 0x2a6ac8 : 0x3a6a2a)); mat.position.set(0, 0.17, 1.4); sc.add(mat);
      // Glocke oben
      ctx.bell = new T.Mesh(new T.CylinderGeometry(0.12, 0.28, 0.4, 12, 1, true), R.mat(0xffc830)); ctx.bell.position.set(0, WH + 0.2, 0.4); sc.add(ctx.bell);
      // Griffe: Reihen nach oben, grüne Rastgriffe, braune lockere Griffe
      ctx.holds = [];
      const hg = new T.DodecahedronGeometry(0.13), colN = [0xe0403a, 0x3a7ae0, 0xe0c03a, 0xa040e0];
      for (let y = 0.9, row = 0; y < WH - 0.3; y += rng.range(0.62, 0.82), row++) {
        const n = rng.int(3, 4);
        for (let i = 0; i < n; i++) {
          const x = -WW / 2 + 0.7 + (i + rng.range(0.15, 0.85)) * (WW - 1.4) / n;
          const kind = row % 4 === 3 && i === 1 ? 'rest' : rng.next() < 0.16 * ctx.k && row > 1 ? 'loose' : 'n';
          const m = new T.Mesh(hg, R.mat(kind === 'rest' ? 0x3ac050 : kind === 'loose' ? 0x8a5a2a : colN[(row + i) % 4]));
          if (kind === 'rest') m.scale.set(2, 1.3, 1.4); else m.scale.set(1.2, 0.9, 1);
          m.position.set(x, y, 0.06); m.castShadow = true; sc.add(m);
          ctx.holds.push({ m, x, y, kind, t: 0, gone: false, star: null });
        }
      }
      // Sterne an Griffen, nach oben verteilt; der letzte Stern hängt an der Glocke
      const n = ctx.max - 1, cand = ctx.holds.filter(h => h.kind !== 'loose' && h.y > 1.8);
      for (let i = 0; i < n; i++) { const yy = 1.8 + (i + 0.5) * (WH - 2.6) / n; const h = cand.reduce((a, b) => !b.star && Math.abs(b.y - yy) < Math.abs(a.y - yy) ? b : a, cand.find(h => !h.star)); if (!h || h.star) continue; const s = R.star(0.26); s.position.set(h.x, h.y + 0.32, 0.25); sc.add(s); h.star = s; }
      ctx.topStar = R.star(0.32); ctx.topStar.position.set(0, WH + 0.75, 0.5); sc.add(ctx.topStar);
      // Ring zeigt den Zielgriff
      ctx.ring = new T.Mesh(new T.TorusGeometry(0.24, 0.035, 6, 20), new T.MeshBasicMaterial({ color: 0xffffff })); ctx.ring.visible = false; sc.add(ctx.ring);
      // Sicherungsseil
      ctx.rope = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, WH + 0.6, 0.3), new T.Vector3()]), new T.LineBasicMaterial({ color: 0xffd040 })); sc.add(ctx.rope);
      ctx.cur = null; ctx.pos = new T.Vector3(0, 0.35, 0.9); ctx.from = null; ctx.mv = 0; ctx.kraft = 1; ctx.fall = 0;
      ctx.player.root.position.copy(ctx.pos); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(-WW / 2 - 1.6, 0, 3.2); ctx.hostRy = 2.4;
      ctx.intro = { pos: new T.Vector3(4, 7, 10), look: new T.Vector3(0, 6, 0) };
      UL.Trials.sign(ctx, WW / 2 + 2.4, 2.4, -0.6);
      ctx.cam.position.set(0, 2.5, 6.5); ctx.cam.lookAt(0, 2, 0);
    },
    // Körperposition, wenn die Hände am Griff hängen
    body(h) { return new T.Vector3(h.x, Math.max(0.35, h.y - 1.55), 0.42); },
    start(ctx) { ctx.player.play('raise', { hold: true }); },
    grab(ctx, h) {
      ctx.from = ctx.player.root.position.clone(); ctx.cur = h; ctx.mv = 1; h.t = 0;
      ctx.kraft = Math.max(0, ctx.kraft - 0.035 * ctx.k); UL.Audio.sfx('step');
      if (h.star) { const s = h.star; h.star = null; ctx.addStar(s.position.clone()); ctx.scene.remove(s); }
    },
    drop(ctx, why) {
      ctx.bad(why, 'scream'); ctx.player.play('hit');
      const below = ctx.holds.filter(h => h.kind === 'rest' && !h.gone && ctx.cur && h.y < ctx.cur.y - 0.5).sort((a, b) => b.y - a.y)[0];
      ctx.from = ctx.player.root.position.clone(); ctx.cur = below || null; ctx.mv = 1; ctx.fall = 1; ctx.kraft = Math.max(ctx.kraft, 0.45);
      ctx.time = Math.max(1, ctx.time - 5);
      UL.after(0.9, () => { if (!ctx.done) ctx.player.play('raise', { hold: true }); });
    },
    update(dt, ctx) {
      const I = ctx.inp, f = ctx.player;
      // Bewegung zum Griff (oder Sturz zurück)
      if (ctx.mv > 0) {
        ctx.mv = Math.max(0, ctx.mv - dt / (ctx.fall ? 0.7 : 0.3));
        const to = ctx.cur ? this.body(ctx.cur) : new T.Vector3(ctx.from.x, 0.35, 0.9), k = UL.smooth ? UL.smooth(1 - ctx.mv) : 1 - ctx.mv;
        f.root.position.lerpVectors(ctx.from, to, k); if (!ctx.fall) f.root.position.y += Math.sin(k * Math.PI) * 0.12;
        if (ctx.mv === 0) ctx.fall = 0;
      }
      // Kraft
      const onRest = ctx.cur && ctx.cur.kind === 'rest';
      if (ctx.cur) ctx.kraft = UL.clamp(ctx.kraft + (onRest ? 0.22 : -0.028 * ctx.k) * dt, 0, 1); else ctx.kraft = Math.min(1, ctx.kraft + dt * 0.3);
      if (ctx.cur && ctx.kraft <= 0 && !ctx.fall) this.drop(ctx, 'Keine Kraft mehr – abgerutscht!');
      // lockere Griffe brechen weg
      if (ctx.cur && ctx.cur.kind === 'loose' && !ctx.fall) { const h = ctx.cur; h.t += dt; h.m.position.x = h.x + Math.sin(ctx.t * 40) * 0.02 * h.t; if (h.t > 1.1) { h.gone = true; h.m.visible = false; ctx.stage.parts.burst(h.x, h.y, 0.2, 12, 1.5, 1.5, [0x8a5a2a, 0x6a4a2a]); this.drop(ctx, 'Der Griff bricht weg!'); } }
      // Zielgriff wählen: Stick-Richtung (oben = nach oben)
      const dx = I.mx, dy = -I.my, mag = Math.hypot(dx, dy);
      const hp = ctx.cur ? new T.Vector2(ctx.cur.x, ctx.cur.y) : new T.Vector2(f.root.position.x, 1.0);
      let best = null, bs = -1e9;
      if (mag > 0.3 && ctx.mv === 0) for (const h of ctx.holds) {
        if (h.gone || h === ctx.cur) continue; const ox = h.x - hp.x, oy = h.y - hp.y, d = Math.hypot(ox, oy);
        if (d > (ctx.cur ? REACH : 1.4) || d < 0.2) continue; const dot = (ox * dx + oy * dy) / (d * mag); if (dot < 0.55) continue;
        const sc = dot * 2 - Math.abs(d - 1.0) * 0.6; if (sc > bs) { bs = sc; best = h; }
      }
      ctx.target = best; ctx.ring.visible = !!best; if (best) { ctx.ring.position.set(best.x, best.y, 0.2); ctx.ring.material.color.setHex(best.kind === 'rest' ? 0x7aff8a : best.kind === 'loose' ? 0xffa040 : 0xffffff); }
      if (I.ok && best && !ctx.fall) this.grab(ctx, best);
      // ganz oben: Glocke läuten
      if (ctx.cur && ctx.cur.y > WH - 1.0 && ctx.topStar.visible && ctx.mv === 0) { ctx.topStar.visible = false; ctx.addStar(ctx.topStar.position.clone()); UL.Audio.sfx('gong'); ctx.bell.rotation.z = 0.5; f.play('cheer'); UL.after(1.6, () => ctx.end('gipfel')); }
      ctx.bell.rotation.z *= 0.95;
      f.root.rotation.y = Math.PI; f.root.rotation.z = ctx.cur && ctx.mv === 0 ? Math.sin(ctx.t * 2) * 0.03 : 0;
      ctx.rope.geometry.attributes.position.setXYZ(1, f.root.position.x, f.root.position.y + 1.0, f.root.position.z); ctx.rope.geometry.attributes.position.needsUpdate = true;
      const low = ctx.kraft < 0.25;
      ctx.meters = [{ label: '💪 Kraft', v: ctx.kraft, danger: low, color: low ? '#e04030' : '#ffb03a' }, { label: '⛰️ Höhe', v: f.root.position.y / (WH - 1.4), color: '#3ad0ff' }];
      ctx.extraHud = onRest ? '<span class="chip">🟢 Verschnaufen …</span>' : ctx.cur && ctx.cur.kind === 'loose' ? '<span class="chip warn">🟤 Locker! Schnell weiter!</span>' : '';
      ctx.overlay(ctx.t < 6 ? `<div class="lbl">🧗 Stick zum Griff, ${UL.In.glyph('ok')} = greifen · grüne Griffe = ausruhen</div>` : '');
      const port = UL.portrait(), py = f.root.position.y;
      ctx.cam.position.lerp(new T.Vector3(f.root.position.x * 0.5, py + (port ? 2.2 : 1.6), port ? 8 : 6), 1 - Math.exp(-3.5 * dt)); ctx.cam.lookAt(f.root.position.x * 0.6, py + (port ? 2.2 : 1.6), 0);
    },
    bot(dt, ctx, I) {
      if (ctx.mv > 0) return;
      const cur = ctx.cur, hx = cur ? cur.x : ctx.player.root.position.x, hy = cur ? cur.y : 1.0;
      if (cur && cur.kind === 'rest' && ctx.kraft < 0.8) return;
      let best = null, bs = -1e9;
      for (const h of ctx.holds) { if (h.gone || h === cur) continue; const ox = h.x - hx, oy = h.y - hy, d = Math.hypot(ox, oy); if (d > (cur ? REACH : 1.4) * 0.95 || oy < 0.15) continue; const s = oy + (h.star ? 1.5 : 0) + (h.kind === 'rest' && ctx.kraft < 0.5 ? 2 : 0) - (h.kind === 'loose' ? 1 : 0); if (s > bs) { bs = s; best = h; } }
      if (!best) return;
      const ox = best.x - hx, oy = best.y - hy, d = Math.hypot(ox, oy) || 1; I.mx = ox / d; I.my = -oy / d;
      if (ctx.target === best) I.ok = true;
    }
  });
})();
