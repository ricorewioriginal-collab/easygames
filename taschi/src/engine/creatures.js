// Taschi creature builder: nine body plans (biped, quad, sprout, bird, fish,
// serpent, golem, insect, wisp) combined with feature parts (ears, crests,
// tails, wings, horns, shells, manes, patterns …). Every species also gets
// seeded proportions, so related forms share a design language but no two
// species are identical. Parts are pivots that the animator moves.
import { THREE } from './three.js';
import { Builder, matrix, capsule, lathe, lumpy } from './geometry.js';
import { outlineMaterial, glowMaterial } from './materials.js';
import { toonGradient } from './textures.js';
import { SPECIES } from '../data/species.js';
import { createRng } from '../core/rng.js';

const C = (c) => new THREE.Color(c);
const shade = (c, f) => C(c).multiplyScalar(f).getHex();
const mix = (a, b, t) => C(a).lerp(C(b), t).getHex();

const FLYERS = new Set(['bird', 'wisp', 'fish']);

function creatureMaterial() {
  return new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient(), emissive: 0x000000 });
}

export function createCreature(id, { outline = true, shiny = false } = {}) {
  const sp = SPECIES[id];
  const look = sp.look || { plan: 'quad', colors: [sp.color, shade(sp.color, 0.7), 0xf6eee0], features: {}, size: 1 };
  const F = look.features || {};
  const rng = createRng('creature:' + id);
  const [main0, acc0, belly0] = look.colors;
  const main = shiny ? mix(main0, 0xffe080, 0.45) : main0, acc = acc0, belly = belly0;
  const mat = creatureMaterial();
  const root = new THREE.Group(); root.name = 'creature:' + id;
  const body = new THREE.Group(); root.add(body);
  const parts = { root, body };
  const meshes = [];
  const pivot = (name, parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); parts[name] = g; return g; };
  const emit = (builder, parent, withOutline = outline) => {
    if (builder.empty) return null;
    const geo = builder.build();
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); meshes.push(m);
    if (withOutline) { const o = new THREE.Mesh(geo, outlineMaterial(0x202638)); o.scale.setScalar(1.05); m.add(o); }
    return m;
  };
  // seeded proportions
  const P = { head: 0.9 + rng.next() * 0.25, body: 0.92 + rng.next() * 0.2, leg: 0.85 + rng.next() * 0.3, tail: 0.8 + rng.next() * 0.5, ear: 0.85 + rng.next() * 0.35, chunky: 0.9 + rng.next() * 0.2 };
  const plan = look.plan;
  let headY = 1.2, headZ = 0.15, headR = 0.42 * P.head, bodyTop = 1;
  const B = new Builder();
  const legs = [];

  // --------------------------------------------------------------- body plans
  if (plan === 'biped' || plan === 'sprout') {
    const h = (plan === 'sprout' ? 0.75 : 0.95) * P.body, r = (plan === 'sprout' ? 0.5 : 0.42) * P.chunky;
    const legH = (plan === 'sprout' ? 0.12 : 0.28) * P.leg;
    B.add(lathe([[0.01, 0], [r * 0.8, 0.06], [r, h * 0.35], [r * 0.92, h * 0.7], [r * 0.6, h * 0.95], [0.02, h]], 16), main, matrix(0, legH, 0), { shade: 0.25 });
    B.add(new THREE.SphereGeometry(r * 0.72, 12, 10), belly, matrix(0, legH + h * 0.4, r * 0.38, 0, 0, 0, 0.9, 1.05, 0.5));
    headY = legH + h + (plan === 'sprout' ? -0.05 : 0.12); headZ = 0.05; headR = (plan === 'sprout' ? 0.38 : 0.42) * P.head;
    bodyTop = legH + h;
    for (const sx of [-1, 1]) {
      const leg = pivot(sx > 0 ? 'legL' : 'legR', body, sx * r * 0.45, legH + 0.02, 0);
      const lb = new Builder();
      lb.add(capsule(0.1 * P.chunky, legH * 0.8, 8, 3), main, matrix(0, -legH * 0.45, 0));
      lb.add(new THREE.SphereGeometry(0.14 * P.chunky, 10, 6), shade(main, 0.85), matrix(0, -legH, 0.08, 0, 0, 0, 1, 0.55, 1.4));
      emit(lb, leg); legs.push(leg);
      const arm = pivot(sx > 0 ? 'armL' : 'armR', body, sx * r * 0.92, legH + h * 0.62, 0.05);
      const ab = new Builder();
      const armLen = F.longArms ? 0.55 : 0.28;
      ab.add(capsule(0.075, armLen, 8, 3), main, matrix(sx * 0.05, -armLen * 0.5, 0.04, 0, 0, sx * 0.35));
      if (plan === 'sprout') ab.add(new THREE.ConeGeometry(0.12, 0.32, 5), mix(main, 0x3a9a5a, 0.4), matrix(sx * 0.12, -0.2, 0.04, 0, 0, sx * 1.1, 1, 1, 0.4));
      emit(ab, arm, false);
    }
  } else if (plan === 'quad') {
    const len = 0.9 * P.body, r = 0.36 * P.chunky, legH = 0.42 * P.leg;
    B.add(capsule(r, len, 14, 5), main, matrix(0, legH + r * 0.85, 0, Math.PI / 2, 0, 0, 1, 1, 0.92), { shade: 0.25 });
    B.add(new THREE.SphereGeometry(r * 0.85, 12, 8), belly, matrix(0, legH + r * 0.55, 0.05, 0, 0, 0, 0.75, 0.6, 1.35));
    headY = legH + r * 1.55; headZ = len * 0.5 + r * 0.55; headR = 0.36 * P.head;
    bodyTop = legH + r * 1.7;
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const leg = pivot('leg' + legs.length, body, sx * r * 0.6, legH + 0.05, sz * len * 0.42);
      const lb = new Builder();
      lb.add(capsule(0.1 * P.chunky, legH * 0.75, 8, 3), main, matrix(0, -legH * 0.48, 0));
      lb.add(new THREE.SphereGeometry(0.125 * P.chunky, 10, 6), shade(main, 0.82), matrix(0, -legH + 0.04, 0.04, 0, 0, 0, 1, 0.6, 1.25));
      emit(lb, leg); legs.push(leg);
    }
  } else if (plan === 'bird') {
    const r = 0.44 * P.chunky;
    B.add(new THREE.SphereGeometry(r, 16, 12), main, matrix(0, 0.62, 0, 0, 0, 0, 1, 1.05, 1.15), { shade: 0.25 });
    B.add(new THREE.SphereGeometry(r * 0.78, 12, 8), belly, matrix(0, 0.55, r * 0.35, 0, 0, 0, 0.85, 0.95, 0.55));
    headY = 0.62 + r * 1.0; headZ = r * 0.55; headR = 0.3 * P.head;
    bodyTop = 0.62 + r;
    for (const sx of [-1, 1]) {
      const leg = pivot(sx > 0 ? 'legL' : 'legR', body, sx * 0.14, 0.3, 0);
      const lb = new Builder();
      lb.cyl(0.03, 0.035, 0.3, 0xe8a03a, 0, -0.15, 0, 5);
      for (let k = -1; k <= 1; k++) lb.add(new THREE.CylinderGeometry(0.02, 0.025, 0.14, 4), 0xe8a03a, matrix(k * 0.04, -0.3, 0.06, Math.PI / 2, k * 0.4, 0));
      emit(lb, leg, false); legs.push(leg);
    }
    const wingType = F.wings || 'feather';
    for (const sx of [-1, 1]) {
      const wing = pivot(sx > 0 ? 'wingL' : 'wingR', body, sx * r * 0.85, 0.78, -0.02);
      const wb = new Builder();
      for (let k = 0; k < 4; k++) wb.add(new THREE.SphereGeometry(0.32 - k * 0.04, 8, 6), k % 2 ? acc : main, matrix(sx * (0.18 + k * 0.12), -0.05 - k * 0.04, -0.05 - k * 0.06, 0, 0, sx * (0.4 + k * 0.1), 1.25, 0.28, 0.75));
      if (wingType === 'bat') wb.add(new THREE.ConeGeometry(0.4, 0.8, 3), acc, matrix(sx * 0.5, -0.1, -0.1, 0, 0, sx * 1.6, 1, 1, 0.15));
      emit(wb, wing);
    }
  } else if (plan === 'fish') {
    const len = 0.85 * P.body, r = 0.36 * P.chunky;
    B.add(new THREE.SphereGeometry(r, 16, 12), main, matrix(0, 0.85, 0, 0, 0, 0, 0.85, 1, 1.5), { shade: 0.3 });
    B.add(new THREE.SphereGeometry(r * 0.8, 12, 8), belly, matrix(0, 0.75, 0.12, 0, 0, 0, 0.7, 0.7, 1.3));
    headY = 0.92; headZ = r * 1.2; headR = 0.3 * P.head;
    bodyTop = 0.85 + r;
    for (const sx of [-1, 1]) {
      const fin = pivot(sx > 0 ? 'wingL' : 'wingR', body, sx * r * 0.8, 0.8, 0.1);
      const fb = new Builder();
      fb.add(new THREE.ConeGeometry(0.16, 0.42, 4), acc, matrix(sx * 0.18, -0.06, 0, 0, 0, sx * 1.9, 1, 1, 0.25));
      emit(fb, fin, false);
    }
    void len;
  } else if (plan === 'serpent') {
    const segs = 6;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1), r = (0.34 - t * 0.18) * P.chunky;
      B.add(new THREE.SphereGeometry(r, 12, 10), i % 2 ? main : shade(main, 0.94), matrix(Math.sin(t * Math.PI * 1.4) * 0.35, 0.35 + Math.sin(t * Math.PI) * 0.3 + (1 - t) * 0.4, 0.2 - t * 1.4), { shade: 0.2 });
      B.add(new THREE.SphereGeometry(r * 0.75, 8, 6), belly, matrix(Math.sin(t * Math.PI * 1.4) * 0.35, 0.3 + Math.sin(t * Math.PI) * 0.3 + (1 - t) * 0.4, 0.2 - t * 1.4 + r * 0.25, 0, 0, 0, 0.8, 0.7, 0.6));
    }
    headY = 1.15; headZ = 0.45; headR = 0.36 * P.head; bodyTop = 1.0;
  } else if (plan === 'golem') {
    const g = new Builder();
    B.add(lumpy(new THREE.DodecahedronGeometry(0.62 * P.chunky, 1), 0.12, 3), main, matrix(0, 0.85, 0, 0, 0, 0, 1.05, 0.95, 0.9), { shade: 0.3 });
    B.add(lumpy(new THREE.DodecahedronGeometry(0.36, 0), 0.12, 5), shade(main, 0.85), matrix(0.35, 1.2, -0.25));
    headY = 1.5; headZ = 0.2; headR = 0.34 * P.head; bodyTop = 1.45;
    for (const sx of [-1, 1]) {
      const arm = pivot(sx > 0 ? 'armL' : 'armR', body, sx * 0.62, 1.05, 0.05);
      const ab = new Builder();
      ab.add(lumpy(new THREE.DodecahedronGeometry(0.24, 0), 0.1, sx + 3), shade(main, 0.9), matrix(sx * 0.12, -0.2, 0));
      ab.add(lumpy(new THREE.DodecahedronGeometry(0.28, 0), 0.1, sx + 5), acc, matrix(sx * 0.18, -0.55, 0.05));
      emit(ab, arm);
      const leg = pivot(sx > 0 ? 'legL' : 'legR', body, sx * 0.3, 0.35, 0);
      const lb = new Builder();
      lb.add(lumpy(new THREE.DodecahedronGeometry(0.22, 0), 0.1, sx + 7), shade(main, 0.8), matrix(0, -0.16, 0.03));
      emit(lb, leg); legs.push(leg);
    }
    void g;
  } else if (plan === 'insect') {
    B.add(new THREE.SphereGeometry(0.34 * P.chunky, 14, 10), main, matrix(0, 0.55, -0.35, 0, 0, 0, 1, 0.85, 1.25), { shade: 0.25 });
    B.add(new THREE.SphereGeometry(0.24, 12, 8), acc, matrix(0, 0.58, 0.05, 0, 0, 0, 1, 0.9, 0.9));
    headY = 0.72; headZ = 0.32; headR = 0.27 * P.head; bodyTop = 0.85;
    for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) {
      const leg = pivot('leg' + legs.length, body, sx * 0.18, 0.5, 0.1 - i * 0.2);
      const lb = new Builder();
      lb.add(new THREE.CylinderGeometry(0.03, 0.035, 0.42, 5), shade(acc, 0.7), matrix(sx * 0.16, -0.12, 0, 0, 0, sx * 1.0));
      lb.add(new THREE.CylinderGeometry(0.025, 0.03, 0.32, 5), shade(acc, 0.6), matrix(sx * 0.34, -0.33, 0, 0, 0, sx * 0.2));
      emit(lb, leg, false); legs.push(leg);
    }
  } else { // wisp
    B.add(lathe([[0.01, 0], [0.18, 0.08], [0.36, 0.35], [0.42, 0.62], [0.36, 0.86], [0.2, 0.98], [0.01, 1.02]], 16), main, matrix(0, 0.5, 0, 0, 0, 0, P.chunky, P.body, P.chunky), { shade: 0.2 });
    for (let k = 0; k < 3; k++) B.add(new THREE.ConeGeometry(0.12, 0.45, 6), shade(main, 0.9 - k * 0.05), matrix((k - 1) * 0.18, 0.38, -0.05, Math.PI + (k - 1) * 0.2, 0, (k - 1) * 0.35));
    headY = 0.5 + 0.62 * P.body; headZ = 0.12; headR = 0.36 * P.head; bodyTop = 1.5;
    for (const sx of [-1, 1]) {
      const arm = pivot(sx > 0 ? 'armL' : 'armR', body, sx * 0.38, 0.95, 0.05);
      const ab = new Builder(); ab.add(capsule(0.06, 0.18, 6, 2), main, matrix(sx * 0.08, -0.1, 0, 0, 0, sx * 0.9)); emit(ab, arm, false);
    }
  }

  // --------------------------------------------------------------- pattern
  if (F.pattern === 'stripes' && plan !== 'serpent') for (let i = 0; i < 3; i++) B.add(new THREE.TorusGeometry(plan === 'quad' ? 0.35 : 0.36, 0.035, 4, 18, Math.PI), acc, plan === 'quad' ? matrix(0, 0.42 * P.leg + 0.36 * 0.85, -0.2 + i * 0.22, 0, Math.PI / 2, 0, 1, 1.05, 1) : matrix(0, bodyTop * (0.45 + i * 0.13), -0.02, 0, 0, 0, 1.05, 1, 1.05));
  if (F.pattern === 'spots') for (let i = 0; i < 6; i++) { const a = i * 2.3; B.add(new THREE.SphereGeometry(0.07, 6, 4), acc, matrix(Math.cos(a) * 0.3, bodyTop * (0.5 + (i % 3) * 0.12), -Math.abs(Math.sin(a)) * 0.25 - 0.05, 0, 0, 0, 1, 1, 0.4)); }
  if (F.shell) B.add(new THREE.SphereGeometry(0.44, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), acc, plan === 'quad' ? matrix(0, 0.42 * P.leg + 0.36 * 1.05, -0.1, 0, 0, 0, 1, 0.7, 1.4) : matrix(0, bodyTop * 0.55, -0.22, -0.4, 0, 0, 1, 1, 0.7), { shade: 0.2 });
  if (F.crystal) for (let i = 0; i < 4; i++) B.add(new THREE.OctahedronGeometry(0.12 + (i % 2) * 0.06, 0), mix(acc, 0xbff4ff, 0.5), matrix(Math.cos(i * 1.7) * 0.25, bodyTop + 0.02 - (i % 2) * 0.08, -0.15 + Math.sin(i * 1.7) * 0.15, 0, i, 0.3, 0.7, 1.8, 0.7));
  if (F.spikes) for (let i = 0; i < F.spikes; i++) { const t = i / Math.max(1, F.spikes - 1); B.add(new THREE.ConeGeometry(0.08, 0.3, 5), acc, matrix(0, bodyTop - 0.02 - t * 0.15, 0.2 - t * 0.7, -0.6 - t * 0.6, 0, 0)); }
  if (F.mane) for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; B.add(new THREE.ConeGeometry(0.11, 0.38, 5), F.crest === 'flame' ? mix(acc, 0xffc060, 0.6) : acc, matrix(Math.cos(a) * 0.3, headY - 0.12 + Math.sin(a) * 0.3, headZ - 0.18, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2)); }
  if (F.aura) { const aura = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), glowMaterial(mix(main, 0xffffff, 0.4), 0.12)); aura.scale.set(0.9, bodyTop * 0.8, 0.9); aura.position.y = bodyTop * 0.55; body.add(aura); parts.aura = aura; }
  emit(B, body);

  // --------------------------------------------------------------- head
  const head = pivot('head', body, 0, headY, headZ);
  const H = new Builder();
  const hr = headR;
  if (plan === 'golem') H.add(lumpy(new THREE.DodecahedronGeometry(hr, 1), 0.1, 11), shade(main, 1.05), matrix(0, 0, 0, 0, 0, 0, 1.1, 0.9, 1));
  else H.add(new THREE.SphereGeometry(hr, 18, 14), main, matrix(0, 0, 0, 0, 0, 0, 1.05, 0.97, 1), { shade: 0.2 });
  // muzzle / beak
  if (plan === 'bird') H.add(new THREE.ConeGeometry(hr * 0.32, hr * 0.8, 6), 0xf0a83a, matrix(0, -hr * 0.12, hr * 1.15, Math.PI / 2, 0, 0));
  else if (plan === 'quad' || plan === 'serpent') H.add(new THREE.SphereGeometry(hr * 0.55, 12, 8), belly, matrix(0, -hr * 0.28, hr * 0.72, 0, 0, 0, 1.1, 0.75, 0.9));
  else H.add(new THREE.SphereGeometry(hr * 0.42, 10, 8), belly, matrix(0, -hr * 0.42, hr * 0.62, 0, 0, 0, 1.2, 0.6, 0.7));
  H.add(new THREE.SphereGeometry(hr * 0.1, 6, 4), 0x2a2232, matrix(0, plan === 'bird' ? -hr * 0.05 : -hr * 0.15, hr * (plan === 'quad' ? 1.22 : 0.98)));
  if (F.fangs) for (const sx of [-1, 1]) H.add(new THREE.ConeGeometry(hr * 0.06, hr * 0.2, 4), 0xffffff, matrix(sx * hr * 0.15, -hr * 0.55, hr * 0.85, Math.PI, 0, 0));
  if (F.mask) H.add(new THREE.SphereGeometry(hr * 1.01, 14, 6, -Math.PI * 0.2, Math.PI * 1.4, Math.PI * 0.32, Math.PI * 0.22), 0x2a2232, matrix(0, 0, 0, 0, Math.PI * 0.5 - Math.PI * 0.2 + 0.63, 0));
  if (F.gills) for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) H.add(new THREE.ConeGeometry(hr * 0.1, hr * 0.55, 4), acc, matrix(sx * hr * (0.95 + k * 0.05), hr * (0.35 - k * 0.3), -hr * 0.1, 0, 0, sx * (-1.1 + k * 0.5)));
  // ears
  const ear = (type) => {
    for (const sx of [-1, 1]) {
      const ep = pivot(sx > 0 ? 'earL' : 'earR', head, sx * hr * 0.55, hr * 0.7, -hr * 0.1);
      const eb = new Builder();
      const e = P.ear;
      if (type === 'long') { eb.add(capsule(hr * 0.16, hr * 1.1 * e, 8, 3), main, matrix(sx * hr * 0.1, hr * 0.6 * e, 0, 0, 0, -sx * 0.25, 1, 1, 0.55)); eb.add(capsule(hr * 0.09, hr * 0.8 * e, 6, 2), belly, matrix(sx * hr * 0.1, hr * 0.6 * e, hr * 0.05, 0, 0, -sx * 0.25, 1, 1, 0.3)); }
      else if (type === 'round') eb.add(new THREE.SphereGeometry(hr * 0.32 * e, 10, 8), main, matrix(sx * hr * 0.15, hr * 0.2, 0, 0, 0, 0, 1, 1, 0.45));
      else if (type === 'tuft') { eb.add(new THREE.ConeGeometry(hr * 0.26, hr * 0.85 * e, 4), main, matrix(sx * hr * 0.12, hr * 0.35, 0, 0, 0, -sx * 0.3)); eb.add(new THREE.ConeGeometry(hr * 0.07, hr * 0.4, 4), acc, matrix(sx * hr * 0.26, hr * 0.85 * e, 0, 0, 0, -sx * 0.3)); }
      else eb.add(new THREE.ConeGeometry(hr * 0.24, hr * 0.7 * e, 4), main, matrix(sx * hr * 0.1, hr * 0.3, 0, 0, Math.PI / 4, -sx * 0.35));
      emit(eb, ep, false);
    }
  };
  if (F.ears) ear(F.ears);
  // horns
  if (F.horns) for (let i = 0; i < F.horns; i++) { const sx = i % 2 ? -1 : 1, k = Math.floor(i / 2); H.add(new THREE.ConeGeometry(hr * 0.12, hr * (0.8 - k * 0.2), 6), mix(acc, 0xf5ead8, 0.4), matrix(sx * hr * (0.35 + k * 0.25), hr * (0.85 - k * 0.15), -hr * (0.15 + k * 0.2), -0.3, 0, -sx * (0.3 + k * 0.3))); }
  if (F.antennae) for (const sx of [-1, 1]) { H.add(new THREE.CylinderGeometry(hr * 0.03, hr * 0.03, hr * 1.1, 4), shade(acc, 0.7), matrix(sx * hr * 0.3, hr * 1.15, hr * 0.1, 0.3, 0, -sx * 0.4)); H.add(new THREE.SphereGeometry(hr * 0.1, 6, 4), F.glow ? 0xfff6a0 : acc, matrix(sx * hr * 0.55, hr * 1.62, hr * 0.28)); }
  // crest
  const crest = new Builder();
  const cy = hr * 0.92;
  switch (F.crest) {
    case 'flame': for (let k = 0; k < 3; k++) crest.add(new THREE.ConeGeometry(hr * (0.22 - k * 0.04), hr * (0.75 - k * 0.15), 6), k ? 0xffd25a : 0xff8a3a, matrix((k - 1) * hr * 0.2, cy + hr * 0.3, -k * hr * 0.12, -0.2, 0, (k - 1) * 0.3)); break;
    case 'leaf': crest.add(new THREE.SphereGeometry(hr * 0.5, 10, 6), 0x3fa35a, matrix(hr * 0.15, cy + hr * 0.25, 0, 0, 0.4, -0.5, 1, 0.18, 0.6)); crest.add(new THREE.CylinderGeometry(hr * 0.03, hr * 0.03, hr * 0.3, 4), 0x2f6a3a, matrix(0, cy + hr * 0.05, 0)); break;
    case 'spark': for (let k = 0; k < 3; k++) crest.add(new THREE.ConeGeometry(hr * 0.12, hr * 0.6, 4), k === 1 ? 0xfff2a0 : acc, matrix((k - 1) * hr * 0.28, cy + hr * 0.2, -hr * 0.1, 0, 0, (k - 1) * 0.5)); break;
    case 'fin': crest.add(new THREE.ConeGeometry(hr * 0.4, hr * 0.8, 3), acc, matrix(0, cy + hr * 0.15, -hr * 0.2, -0.3, 0, 0, 0.25, 1, 1)); break;
    case 'feather': for (let k = 0; k < 3; k++) crest.add(new THREE.ConeGeometry(hr * 0.08, hr * 0.7, 4), k === 1 ? acc : main, matrix((k - 1) * hr * 0.12, cy + hr * 0.25, -hr * 0.2, -0.6 + (k - 1) * 0.1, 0, (k - 1) * 0.35)); break;
    case 'crown': for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; crest.add(new THREE.ConeGeometry(hr * 0.09, hr * 0.4, 4), 0xffd25a, matrix(Math.cos(a) * hr * 0.32, cy + hr * 0.12, Math.sin(a) * hr * 0.32)); } crest.add(new THREE.TorusGeometry(hr * 0.33, hr * 0.05, 4, 12), 0xf5c040, matrix(0, cy, 0, Math.PI / 2, 0, 0)); break;
    case 'crystal': crest.add(new THREE.OctahedronGeometry(hr * 0.3, 0), mix(acc, 0xbff4ff, 0.5), matrix(0, cy + hr * 0.3, 0, 0, 0, 0, 0.6, 1.5, 0.6)); break;
    case 'halo': { const halo = new THREE.Mesh(new THREE.TorusGeometry(hr * 0.55, hr * 0.06, 6, 24), glowMaterial(0xfff4c0, 0.9)); halo.rotation.x = Math.PI / 2; halo.position.y = cy + hr * 0.4; head.add(halo); parts.halo = halo; break; }
    case 'horn': crest.add(new THREE.ConeGeometry(hr * 0.15, hr * 0.8, 6), mix(acc, 0xf5ead8, 0.3), matrix(0, cy + hr * 0.25, hr * 0.25, 0.4, 0, 0)); break;
    case 'tuft': for (let k = 0; k < 3; k++) crest.add(new THREE.SphereGeometry(hr * 0.16, 7, 5), shade(main, 1.1), matrix((k - 1) * hr * 0.15, cy + hr * 0.08, k * 0.02)); break;
    case 'star': { const st = new THREE.Shape(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? hr * 0.12 : hr * 0.3, a = k / 10 * Math.PI * 2 + Math.PI / 2; k ? st.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : st.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } crest.add(new THREE.ExtrudeGeometry(st, { depth: hr * 0.08, bevelEnabled: false }), 0xffe27a, matrix(0, cy + hr * 0.3, hr * 0.1)); break; }
  }
  if (!crest.empty) { const cp = pivot('crest', head, 0, 0, 0); emit(crest, cp, false); }
  emit(H, head);
  // eyes
  const eyeStyle = F.eyes || 'big';
  const E = new Builder();
  const er = hr * (eyeStyle === 'big' ? 0.24 : eyeStyle === 'sleepy' ? 0.18 : 0.2);
  const eyeX = plan === 'bird' ? hr * 0.42 : hr * 0.38, eyeZ = plan === 'quad' ? hr * 0.82 : hr * 0.84;
  for (const sx of [-1, 1]) {
    E.add(new THREE.SphereGeometry(er, 12, 10), 0xffffff, matrix(sx * eyeX, 0, 0, 0, 0, 0, 0.9, eyeStyle === 'sleepy' ? 0.55 : 1.15, 0.5));
    E.add(new THREE.SphereGeometry(er * 0.72, 10, 8), F.glow ? mix(acc, 0x101828, 0.4) : 0x1e2638, matrix(sx * eyeX, -er * 0.05, er * 0.25, 0, 0, eyeStyle === 'sharp' ? sx * 0.5 : 0, eyeStyle === 'sharp' ? 0.7 : 0.9, eyeStyle === 'sleepy' ? 0.5 : 1.05, 0.5));
    E.add(new THREE.SphereGeometry(er * 0.28, 6, 4), 0xffffff, matrix(sx * eyeX + er * 0.25, er * 0.3, er * 0.5));
    if (eyeStyle === 'sharp') E.add(new THREE.BoxGeometry(er * 2, er * 0.25, er * 0.3), shade(main, 0.6), matrix(sx * eyeX, er * 0.95, er * 0.2, 0, 0, sx * -0.4));
  }
  const eyes = new THREE.Mesh(E.build(), mat);
  eyes.position.set(0, hr * 0.12, eyeZ);
  head.add(eyes); parts.eyes = eyes;

  // --------------------------------------------------------------- tail
  const tailType = F.tail || (plan === 'quad' ? 'thin' : plan === 'fish' ? 'fin' : null);
  if (tailType) {
    const tz = plan === 'quad' ? -0.9 * P.body * 0.55 - 0.2 : plan === 'fish' ? -0.62 : plan === 'bird' ? -0.45 : -0.32;
    const ty = plan === 'quad' ? 0.42 * P.leg + 0.4 : plan === 'fish' ? 0.85 : plan === 'bird' ? 0.55 : bodyTop * 0.35;
    const tail = pivot('tail', body, 0, ty, tz);
    const T = new Builder();
    const L = P.tail;
    switch (tailType) {
      case 'bushy': T.add(new THREE.SphereGeometry(0.22, 10, 8), main, matrix(0, 0.22 * L, -0.25 * L, 0.6, 0, 0, 0.9, 1.9 * L, 0.9)); T.add(new THREE.SphereGeometry(0.14, 8, 6), belly, matrix(0, 0.5 * L, -0.42 * L)); break;
      case 'fin': T.add(new THREE.ConeGeometry(0.3, 0.5 * L, 4), acc, matrix(0, 0, -0.25 * L, -Math.PI / 2, 0, 0, 1, 1, 0.25)); break;
      case 'feather': for (let k = 0; k < 3; k++) T.add(new THREE.ConeGeometry(0.08, 0.7 * L, 4), k === 1 ? acc : main, matrix((k - 1) * 0.1, 0.05, -0.3 * L, -Math.PI / 2 - 0.3, 0, (k - 1) * 0.25)); break;
      case 'spike': T.add(new THREE.ConeGeometry(0.12, 0.8 * L, 6), main, matrix(0, 0.1, -0.4 * L, -Math.PI / 2 - 0.3, 0, 0)); T.add(new THREE.ConeGeometry(0.1, 0.25, 4), acc, matrix(0, 0.27, -0.85 * L, -Math.PI / 2 - 0.3, 0, 0)); break;
      case 'wisp': for (let k = 0; k < 3; k++) T.add(new THREE.SphereGeometry(0.16 - k * 0.04, 8, 6), mix(main, 0xffffff, k * 0.2), matrix(Math.sin(k) * 0.1, k * 0.08, -0.2 - k * 0.2 * L)); break;
      case 'ringed': for (let k = 0; k < 5; k++) T.add(new THREE.SphereGeometry(0.1, 8, 6), k % 2 ? acc : main, matrix(0, k * 0.12 * L, -0.12 - k * 0.1 * L, 0, 0, 0, 1, 1.3, 1)); break;
      case 'leaf': T.add(new THREE.SphereGeometry(0.24, 8, 6), 0x3fa35a, matrix(0, 0.1, -0.3 * L, 0.3, 0, 0, 0.7, 0.15, 1.4)); break;
      case 'flame': for (let k = 0; k < 3; k++) T.add(new THREE.ConeGeometry(0.16 - k * 0.03, 0.6 * L, 6), k ? 0xffd25a : 0xff7a3a, matrix((k - 1) * 0.08, 0.1, -0.35 * L, -Math.PI / 2 - 0.4, 0, (k - 1) * 0.3)); break;
      default: T.add(capsule(0.05, 0.55 * L, 6, 2), main, matrix(0, 0.15, -0.3 * L, -1.0, 0, 0)); T.add(new THREE.SphereGeometry(0.08, 6, 4), acc, matrix(0, 0.42 * L, -0.48 * L));
    }
    emit(T, tail, false);
  }
  // wings on non-birds
  if (F.wings && plan !== 'bird') {
    for (const sx of [-1, 1]) {
      const wing = pivot(sx > 0 ? 'wingL' : 'wingR', body, sx * 0.25, bodyTop * 0.85, -0.2);
      const W = new Builder();
      if (F.wings === 'insect') { W.add(new THREE.SphereGeometry(0.32, 8, 6), mix(acc, 0xe8f6ff, 0.6), matrix(sx * 0.32, 0.1, -0.1, 0, 0.3 * sx, sx * 0.4, 1.2, 0.1, 0.7)); W.add(new THREE.SphereGeometry(0.22, 8, 6), mix(acc, 0xe8f6ff, 0.6), matrix(sx * 0.25, -0.12, -0.2, 0, 0.2 * sx, -sx * 0.3, 1, 0.1, 0.6)); }
      else if (F.wings === 'bat') { W.add(new THREE.ConeGeometry(0.42, 0.9, 3), acc, matrix(sx * 0.45, 0.15, -0.05, 0, 0, sx * 1.4, 1, 1, 0.12)); W.add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4), shade(acc, 0.6), matrix(sx * 0.4, 0.32, 0, 0, 0, sx * 1.2)); }
      else for (let k = 0; k < 3; k++) W.add(new THREE.SphereGeometry(0.28 - k * 0.05, 8, 6), k % 2 ? acc : main, matrix(sx * (0.2 + k * 0.14), 0.1 - k * 0.04, -k * 0.05, 0, 0, sx * (0.5 + k * 0.12), 1.3, 0.25, 0.7));
      W.parts.forEach(() => {});
      emit(W, wing, false);
    }
  }
  if (F.glow) { const l = new THREE.PointLight(mix(main, 0xffffff, 0.4), 0.5, 3); l.position.y = bodyTop * 0.7; body.add(l); parts.light = l; }

  // normalise size so that battle scale is consistent
  const size = look.size || 1;
  const cr = new Creature(root, parts, { plan, legs, flyer: FLYERS.has(plan) || !!F.wings, bodyTop, behavior: sp.behavior, size, mat, meshes });
  root.userData.creature = cr;
  return cr;
}

export class Creature {
  constructor(root, parts, info) {
    Object.assign(this, info);
    this.root = root; this.parts = parts;
    this.t = Math.random() * 10; this.blink = 2; this.action = null; this.actionT = 0; this.speed = 0; this.flash = 0;
    this.baseY = this.flyer && this.plan !== 'insect' ? 0.35 : 0;
    this.offset = new THREE.Vector3();
  }
  get object() { return this.root; }
  play(action, duration = 0.6, onDone) { this.action = action; this.actionT = 0; this.actionDur = duration; this.onDone = onDone; }
  hitFlash() { this.flash = 1; }
  setMoving(speed) { this.speed = speed; }
  update(dt) {
    this.t += dt;
    const t = this.t, p = this.parts;
    const moving = this.speed > 0.2;
    const ph = t * (moving ? 9 + this.speed : 2);
    let bob = 0, lean = 0, yaw = 0, lunge = 0, scale = 1, roll = 0;
    // idle breathing
    p.body.scale.set(1 + Math.sin(t * 2.1) * 0.015, 1 + Math.sin(t * 2.1 + 1) * 0.025, 1);
    if (this.flyer) bob = Math.sin(t * 2.6) * 0.08 + this.baseY;
    if (moving && !this.flyer) bob = Math.abs(Math.sin(ph)) * (this.plan === 'sprout' || this.plan === 'biped' ? 0.12 : 0.05);
    // legs
    this.legs.forEach((leg, i) => { leg.rotation.x = moving ? Math.sin(ph + (i % 2 ? Math.PI : 0) + (i >= 2 ? Math.PI : 0)) * 0.6 : 0; });
    if (p.armL) { p.armL.rotation.z = Math.sin(t * 2) * 0.08 + (moving ? Math.sin(ph) * 0.3 : 0); p.armR.rotation.z = -Math.sin(t * 2) * 0.08 - (moving ? Math.sin(ph) * 0.3 : 0); }
    if (p.wingL) { const f = this.plan === 'bird' || this.flyer ? (moving ? 14 : 7) : 2; const a = Math.sin(t * f) * (this.plan === 'fish' ? 0.35 : 0.55); p.wingL.rotation.z = -a; p.wingR.rotation.z = a; }
    if (p.tail) { p.tail.rotation.y = Math.sin(t * (moving ? 7 : 2.4)) * 0.35; p.tail.rotation.x = Math.sin(t * 1.3) * 0.08; }
    if (p.earL) { const tw = Math.max(0, Math.sin(t * 0.9) - 0.92) * 8; p.earL.rotation.z = tw * 0.3; p.earR.rotation.z = -Math.max(0, Math.sin(t * 0.9 + 2) - 0.92) * 2.4; }
    if (p.head) { p.head.rotation.y = Math.sin(t * 0.6) * 0.18; p.head.rotation.x = Math.sin(t * 1.1) * 0.04; }
    if (p.halo) p.halo.rotation.z = t;
    if (p.aura) p.aura.material.opacity = 0.1 + Math.sin(t * 3) * 0.04;
    if (this.plan === 'serpent' || this.plan === 'fish') roll = Math.sin(t * 2) * 0.06;
    // actions
    if (this.action) {
      this.actionT += dt;
      const u = Math.min(1, this.actionT / this.actionDur);
      switch (this.action) {
        case 'attack': lunge = Math.sin(u * Math.PI) * 1.1; lean = Math.sin(u * Math.PI) * 0.3; break;
        case 'special': bob += Math.sin(u * Math.PI) * 0.8; yaw = u * Math.PI * 2; scale = 1 + Math.sin(u * Math.PI) * 0.15; break;
        case 'hit': lunge = -Math.sin(u * Math.PI) * 0.45; lean = -Math.sin(u * Math.PI) * 0.25; roll = Math.sin(u * Math.PI * 4) * 0.12; break;
        case 'faint': lean = -u * 1.4; bob -= u * 0.4; scale = 1 - u * 0.25; break;
        case 'happy': bob += Math.abs(Math.sin(u * Math.PI * 2)) * 0.5; yaw = Math.sin(u * Math.PI * 2) * 0.6; break;
        case 'cry': lean = -Math.sin(u * Math.PI) * 0.35; scale = 1 + Math.sin(u * Math.PI) * 0.12; if (p.head) p.head.rotation.x = -Math.sin(u * Math.PI) * 0.4; break;
        case 'sleep': lean = 0.2; bob -= 0.1; break;
        case 'appear': scale = u; break;
      }
      if (u >= 1 && this.action !== 'faint' && this.action !== 'sleep') { const cb = this.onDone; this.action = null; this.onDone = null; cb && cb(); }
      else if (u >= 1 && this.onDone) { const cb = this.onDone; this.onDone = null; cb(); }
    }
    p.body.position.set(0, bob, lunge);
    p.body.rotation.set(lean, yaw, roll);
    const s = scale;
    p.body.scale.multiplyScalar(s);
    // blink
    this.blink -= dt;
    p.eyes.scale.y = this.blink < 0.1 ? 0.12 : (this.action === 'faint' ? 0.15 : 1);
    if (this.blink < 0) this.blink = 1.8 + Math.random() * 3.5;
    // hit flash
    if (this.flash > 0) { this.flash = Math.max(0, this.flash - dt * 3.5); this.mat.emissive.setRGB(this.flash * 0.9, this.flash * 0.25, this.flash * 0.2); }
  }
  setTint(r, g, b) { this.mat.emissive.setRGB(r, g, b); }
  dispose() { this.mat.dispose(); this.root.traverse(o => { if (o.isMesh && o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); }
}

// Display scale for battle/overworld based on species size.
export function displayScale(id, context = 'battle') {
  const size = SPECIES[id]?.look?.size || 1;
  const s = 0.75 + size * 0.55;
  return context === 'battle' ? s * 1.05 : s * 0.62;
}
