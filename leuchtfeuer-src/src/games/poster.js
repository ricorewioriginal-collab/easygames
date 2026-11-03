// Spiel 2: Dreißig Zentimeter – das Sturmnacht-Plakat zusammensetzen (tauschen und drehen)
import { T, E, camSnap } from '../engine.js';
import { scene, fig } from '../world.js';
import { posterTex } from '../sets.js';
import * as C from '../core.js';
const PI = Math.PI;

export async function start(ctx) {
  const data = await scene('kunstraum', ['finn', 'ben'], { spots: { finn: [-1.6, -2.6, PI * 0.15], ben: [1.7, -2.5, -PI * 0.2] } });
  const s = C.newPoster(ctx.lvl, ctx.seed || 7), L = s.L;
  const bd = data.board, size = Math.min(2.5 / L.cols, 2.2 / L.rows), W = size * L.cols, H = size * L.rows;
  const img = posterTex(256 * L.cols, 256 * L.rows);
  camSnap(new T.Vector3(0, bd.y, bd.z + (L.cols > 4 ? 3.6 : 3.3)), new T.Vector3(0, bd.y, bd.z));
  const G = new T.Group(); G.position.set(0, bd.y, bd.z + 0.06); E.root.add(G);
  const tiles = [];
  for (let i = 0; i < s.n; i++) {
    const g = new T.PlaneGeometry(size * 0.985, size * 0.985), uv = g.attributes.uv, cx = i % L.cols, cy = Math.floor(i / L.cols);
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (cx + uv.getX(k)) / L.cols, 1 - (cy + 1 - uv.getY(k)) / L.rows);
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: img, roughness: 0.85, emissive: '#ffd27a', emissiveIntensity: 0 })); m.userData.tile = i; G.add(m); tiles.push(m);
  }
  const frame = new T.Mesh(new T.RingGeometry(size * 0.48, size * 0.53, 4, 1), new T.MeshBasicMaterial({ color: '#ffd56a' })); frame.rotation.z = PI / 4; frame.scale.set(1.4, 1.4, 1); G.add(frame);
  const posOf = slot => new T.Vector3(-W / 2 + size * (slot % L.cols + 0.5), H / 2 - size * (Math.floor(slot / L.cols) + 0.5), 0);
  let end = false;
  const tick = (dt, t) => {
    if (end || ctx.paused()) return;
    if (!s.done) s.t += dt;
    for (let slot = 0; slot < s.n; slot++) {
      const m = tiles[s.perm[slot]], p = posOf(slot); p.z = slot === s.sel ? 0.08 : 0;
      m.position.lerp(p, Math.min(1, dt * 14)); const tr = -s.rot[slot] * PI / 2; let d = tr - m.rotation.z; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; m.rotation.z += d * Math.min(1, dt * 14);
      m.material.emissiveIntensity = slot === s.sel ? 0.25 + Math.sin(t * 6) * 0.1 : s.done ? 0.15 : 0;
    }
    const cp = posOf(s.cur); frame.position.set(cp.x, cp.y, 0.1); frame.visible = !s.done;
    ctx.hud({ time: Math.floor(s.t), score: C.posterScore(s), a: `🧩 ${C.posterCorrect(s)}/${s.n}`, b: `↔ ${s.moves} Züge`, rot: L.rot });
  };
  E.hooks.add(tick);
  const ray = new T.Raycaster();
  function act(r) {
    if (r === 'swap') ctx.sfx('swap'); else if (r === 'sel') ctx.sfx('tick');
    if (s.done && !end) { end = true; ctx.sfx('win'); const f = fig('finn'), b = fig('ben'); if (f) f.play('yes', { once: true }); if (b) b.play('yes', { once: true });
      setTimeout(() => { E.hooks.delete(tick); ctx.end({ score: C.posterScore(s), stars: C.posterStars(s), rows: [['Züge', s.moves], ['Zeit', Math.round(s.t) + ' s']] }); }, 1600); }
  }
  return {
    key(code, down) {
      if (!down || s.done) return false;
      const mv = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] }[code];
      if (mv) { C.posterMove(s, mv[0], mv[1]); ctx.sfx('tick'); return true; }
      if (code === 'Enter') { act(C.posterPick(s)); return true; }
      if (code === 'Space' || code === 'KeyF' || code === 'KeyE' || code === 'KeyR') { if (C.posterRotate(s, s.sel >= 0 ? s.sel : s.cur)) { ctx.sfx('tick'); act(); } return true; }
      if (code === 'KeyQ' || code === 'Backspace') { s.sel = -1; return true; }
      return false;
    },
    pointer(type, nx, ny) {
      if (type !== 'tap' || s.done) return;
      ray.setFromCamera(new T.Vector2(nx * 2 - 1, -(ny * 2 - 1)), E.cam); const hit = ray.intersectObjects(tiles)[0]; if (!hit) return;
      const slot = s.perm.indexOf(hit.object.userData.tile);
      if (slot === s.sel && L.rot) { C.posterRotate(s, slot); ctx.sfx('tick'); act(); return; }
      act(C.posterPick(s, slot));
    },
    rotate() { if (C.posterRotate(s, s.sel >= 0 ? s.sel : s.cur)) { ctx.sfx('tick'); act(); } },
    stop() { end = true; E.hooks.delete(tick); }
  };
}
