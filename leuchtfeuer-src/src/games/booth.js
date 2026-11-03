// Spiel 3: Zwei mit Zwiebeln – Fischbrötchen nach Bestellung (Räucherei oder Weihnachtsmarkt)
import { T, E, mat, camSnap, figure } from '../engine.js';
import { scene, fig } from '../world.js';
import * as C from '../core.js';
const PI = Math.PI;
const FISHC = { lachs: '#ef8a5c', matjes: '#cfc6cc', makrele: '#b48a4c' };

export async function start(ctx) {
  const market = ctx.lvl === 1;
  const helpers = ctx.story ? (market ? ['finn'] : ['finn', 'ben']) : ['finn', 'ben'];
  const ids = ['kunde1', 'kunde2', 'kunde3', 'kunde4', 'kunde5'];
  await Promise.all(ids.map(id => figure(id, { winter: market })));
  const data = await scene(market ? 'markt' : 'raeucherei', helpers, market ? { spots: { finn: [0.2, -1.2, 0], ben: [-1.1, -1.4, 0.3] }, winter: true } : { spots: { finn: [0.2, 1.4, 0], ben: [-1.3, 1.3, 0.2] } });
  const cz = data.counter.z, top = 1.08;
  camSnap(new T.Vector3(0.3, 1.85, cz - (market ? 1.1 : 1.55)), new T.Vector3(0, 1.35, cz + 2.4));
  const Q = market ? [[0, cz + 1.3], [1.3, cz + 2.1], [-1.2, cz + 2.4], [0.3, cz + 3.3]] : [[0, cz + 1.0], [1.4, cz + 1.5], [-1.3, cz + 1.6], [2.6, cz + 2.0]];
  const ENTRY = [6, cz + 3];
  const s = C.newBooth(ctx.lvl, { diff: ctx.diff });
  // Brötchen auf der Theke
  const plate = new T.Group(); plate.position.set(0, top + (market ? 0.0 : 0), cz); E.root.add(plate);
  const rollM = mat('#d9a35c', { roughness: 0.75 }), onionM = new T.MeshStandardMaterial({ color: '#f1e7f2', roughness: 0.5 });
  function buildPlate() {
    while (plate.children.length) plate.remove(plate.children[0]);
    const m = s.made; if (!m.fish) return;
    for (let k = 0; k < m.count; k++) {
      const r = new T.Group(); r.position.x = (k - (m.count - 1) / 2) * 0.32;
      const bot = new T.Mesh(new T.SphereGeometry(0.11, 18, 10, 0, PI * 2, PI / 2, PI / 2), rollM); bot.scale.set(1.25, 0.5, 0.85); bot.position.y = 0.05; r.add(bot);
      const f = new T.Mesh(new T.CapsuleGeometry(0.035, 0.22, 4, 10), mat(FISHC[m.fish], { roughness: 0.35 })); f.rotation.z = PI / 2; f.position.y = 0.075; r.add(f);
      if (m.onion) for (let i = 0; i < 4; i++) { const o = new T.Mesh(new T.TorusGeometry(0.025, 0.006, 6, 14), onionM); o.rotation.x = PI / 2; o.position.set(-0.08 + i * 0.055, 0.11, (i % 2) * 0.02); r.add(o); }
      const lid = new T.Mesh(new T.SphereGeometry(0.11, 18, 10, 0, PI * 2, 0, PI / 2), rollM); lid.scale.set(1.25, 0.55, 0.85); lid.position.y = 0.12; lid.rotation.z = 0.25; lid.position.x = -0.03; r.add(lid);
      r.traverse(o => { o.castShadow = true; }); plate.add(r);
    }
  }
  // Kundschaft
  const busy = new Map();   // order id → figure
  function freeFig() { const used = new Set([...busy.values()].map(f => f.id)); const free = ids.filter(i => !used.has(i)); return free[Math.floor(Math.random() * free.length)]; }
  function arrive(o) {
    const id = freeFig(); if (!id) return; const f = E.figs[id + (market ? '_w' : '')]; if (!f) return;
    f.root.position.set(ENTRY[0], 0, ENTRY[1]); E.root.add(f.root); f.play('walk'); busy.set(o.id, f); f.userData = { o };
  }
  function leave(id, happy) { const f = busy.get(id); if (!f) return; busy.delete(id); f.userData.leaving = true; f.userData.target = [-6, cz + 3.4]; if (happy) f.play('yes', { once: true }); setTimeout(() => { f.userData.go = true; }, happy ? 700 : 0); }
  const leaving = new Set();
  let end = false;
  const tick = (dt, t) => {
    if (end || ctx.paused()) return;
    C.boothTick(s, dt);
    for (const ev of s.ev) {
      if (ev.k === 'arrive') { arrive(s.q.find(o => o.id === ev.id)); ctx.sfx('bell'); }
      if (ev.k === 'served') { const f = busy.get(ev.id); leaving.add(f); leave(ev.id, true); ctx.say(ev.say, true); ctx.sfx('coin'); buildPlate(); }
      if (ev.k === 'wrong') { ctx.say(ev.say, false); ctx.sfx('wrong'); buildPlate(); }
      if (ev.k === 'leave') { const f = busy.get(ev.id); leaving.add(f); leave(ev.id, false); ctx.say(ev.say, false); ctx.sfx('sink'); }
      if (ev.k === 'fish' || ev.k === 'onion') { buildPlate(); ctx.sfx('tick'); }
      if (ev.k === 'end') finish();
    }
    s.ev.length = 0;
    // Laufen in die Schlange
    s.q.forEach((o, i) => { const f = busy.get(o.id); if (!f) return; const q = Q[Math.min(i, Q.length - 1)]; walkStep(f, q[0], q[1], dt, 1.5, true); });
    for (const f of leaving) { if (!f.userData.go) continue; if (walkStep(f, f.userData.target[0], f.userData.target[1], dt, 1.7, false)) { leaving.delete(f); if (f.root.parent) f.root.parent.remove(f.root); } }
    const bubbles = s.q.map((o, i) => { const f = busy.get(o.id); if (!f) return null; const p = f.root.position.clone(); p.y += 2.05 * f.root.scale.y; p.project(E.cam); return { id: o.id, x: (p.x + 1) / 2, y: (1 - p.y) / 2, text: C.orderText(o), pat: o.pat / o.max, first: i === 0, fish: o.fish, onion: o.onion, count: o.count }; }).filter(Boolean);
    ctx.bubbles(bubbles);
    ctx.hud({ time: Math.max(0, Math.ceil(s.dur - s.t)), score: C.boothScore(s), a: `🪙 ${s.coins}`, b: `🥖 ${s.served}`, made: s.made });
  };
  function walkStep(f, x, z, dt, sp, faceCounter) {
    const p = f.root.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.06) { if (faceCounter) { f.root.rotation.y += (PI - f.root.rotation.y) * Math.min(1, dt * 6); f.play('idle'); } return true; }
    const st = Math.min(d, sp * dt); p.x += dx / d * st; p.z += dz / d * st; f.root.rotation.y = Math.atan2(dx, dz); f.play('walk'); return false;
  }
  E.hooks.add(tick);
  function finish() {
    end = true; E.hooks.delete(tick); ctx.bubbles([]);
    const b = fig('ben'), j = fig('finn'); if (b) b.play('yes', { once: true }); if (j) j.play('yes', { once: true });
    setTimeout(() => ctx.end({ score: C.boothScore(s), stars: C.boothStars(s), rows: [['Fischbrötchen', s.served], ['Münzen', s.coins + ' (Trinkgeld ' + s.tips + ')'], ['Falsch / gegangen', s.wrong + ' / ' + s.left]] }), 900);
  }
  const act = {
    lachs: () => C.boothFish(s, 'lachs'), matjes: () => C.boothFish(s, 'matjes'), makrele: () => C.boothFish(s, 'makrele'),
    onion: () => C.boothOnion(s), serve: () => { if (!s.made.fish) { ctx.sfx('wrong'); return; } C.boothServe(s); }, clear: () => { C.boothClear(s); buildPlate(); ctx.sfx('tick'); }
  };
  return {
    act: k => { if (!end && !ctx.paused()) act[k](); },
    key(code, down) {
      if (!down) return false;
      const k = { KeyQ: 'lachs', Digit1: 'lachs', KeyF: 'matjes', Digit2: 'matjes', KeyE: 'makrele', Digit3: 'makrele', Space: 'onion', KeyZ: 'onion', Digit4: 'onion', Enter: 'serve', Backspace: 'clear', KeyM: 'clear', KeyX: 'clear' }[code];
      if (k) { this.act(k); return true; } return false;
    },
    pointer() { },
    stop() { end = true; E.hooks.delete(tick); ctx.bubbles([]); }
  };
}
