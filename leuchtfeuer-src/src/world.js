// Leuchtfeuer – Schauplatz wechseln, Figuren aufstellen, Kamera für Gespräche
import { T, E, setSky, weather, figure, camTo, camSnap, sunFollow, X, exploreOff, markAt } from './engine.js';
import { SETS } from './sets.js';
const PI = Math.PI;

let token = 0;
export const W = { name: null, cast: [], data: null };

export async function scene(name, cast = [], o = {}) {
  const my = ++token;
  // Figuren vorher laden (verdeckt die Ladezeit)
  const figs = await Promise.all(cast.map(id => figure(id, { winter: o.winter })));
  if (my !== token) return null;
  exploreOff(); markAt(null);
  if (E.root) { E.scene.remove(E.root); E.root.traverse(m => { if (m.userData && m.userData.dispose) m.userData.dispose(); if (m.isLight && m.shadow && m.shadow.map) m.shadow.map.dispose(); }); }
  for (const k in E.figs) { const f = E.figs[k]; if (f.root.parent) f.root.parent.remove(f.root); }
  const G = new T.Group(); E.root = G; E.scene.add(G);
  const data = SETS[name](G, o); data.name = name; E.set = data; W.name = name; W.data = data; W.cast = cast;
  setSky(o.sky || data.sky, data.bg ? { bg: data.bg } : {});
  weather(o.weather !== undefined ? o.weather : data.weather || null);
  // Figuren aufstellen
  const focus = data.focus || [0, 0];
  figs.forEach((f, i) => {
    const sp = (o.spots && o.spots[cast[i]]) || data.spots[cast[i]] || [focus[0] + Math.cos(i * 1.3) * 2, focus[1] + Math.sin(i * 1.3) * 2, 0];
    f.root.position.set(sp[0], 0, sp[1]); f.root.rotation.y = sp[2] || 0; f.root.scale.copy(f.root.scale); G.add(f.root); f.play('idle', { fade: 0 });
    f.mixer.update(Math.random() * 2);
  });
  const c = o.cam || data.cam; camSnap(new T.Vector3(...c.pos), new T.Vector3(...c.look));
  sunFollow(focus[0], focus[1]);
  return data;
}
export const fig = id => { for (const k in E.figs) { const f = E.figs[k]; if (f.id === id && f.root.parent) return f; } return null; };
export function pose(id, anim, o) { const f = fig(id); if (f) f.play(anim, o); }
export function face(id, x, z) { const f = fig(id); if (!f) return; const p = f.root.position; f.root.rotation.y = Math.atan2(x - p.x, z - p.z); }
export function faceEach(a, b) { const fa = fig(a), fb = fig(b); if (!fa || !fb) return; face(a, fb.root.position.x, fb.root.position.z); face(b, fa.root.position.x, fa.root.position.z); }
// Gesprächskamera: über die Schulter auf die sprechende Figur, sonst Übersicht
export function talkCam(who) {
  const d = W.data; if (!d) return;
  const f = who ? fig(who) : null;
  if (!f || X.on) { if (!X.on) camTo(new T.Vector3(...d.cam.pos), new T.Vector3(...d.cam.look), 2); return; }
  const p = f.root.position, ry = f.root.rotation.y, side = (W.cast.indexOf(who) % 2 ? -1 : 1) * 0.55;
  const dist = d.indoor ? 2.1 : 2.6, h = 1.55 * (f.root.scale.y || 1);
  const pos = new T.Vector3(p.x + Math.sin(ry + side) * dist, p.y + h + 0.05, p.z + Math.cos(ry + side) * dist);
  if (d.camBox) { const cb = d.camBox; pos.x = Math.max(cb[0], Math.min(cb[1], pos.x)); pos.z = Math.max(cb[2], Math.min(cb[3], pos.z)); }
  camTo(pos, new T.Vector3(p.x, p.y + h - 0.05, p.z), 2.2);
}
// Figur an einen Platz stellen (z. B. nach dem Ziel)
export function place(id, x, z, ry) { const f = fig(id); if (!f) return; f.root.position.set(x, 0, z); if (ry != null) f.root.rotation.y = ry; }
export function walkTo(id, x, z, speed = 1.6) {
  const f = fig(id); if (!f) return Promise.resolve();
  return new Promise(res => {
    const step = dt => {
      const p = f.root.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.08 || !f.root.parent) { E.hooks.delete(step); f.play('idle'); res(); return; }
      const s = Math.min(d, speed * dt); p.x += dx / d * s; p.z += dz / d * s; f.root.rotation.y = Math.atan2(dx, dz); f.play('walk', { speed: speed / 1.6 });
    };
    E.hooks.add(step);
  });
}
