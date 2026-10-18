/* Spinwelten 3D – prozedurale Modelle (Three.js r128): Materialien, Grundformen, Bauwerke in 6 Zuständen.
 * Zustand 0 = leerer Bauplatz, 1 = roh, 2 = Fundament, 3 = Gebäude, 4 = Ausbau, 5 = leuchtendes Meisterwerk.
 * 28 Archetypen × 9 Dachformen × Proportionen (tall/wide) ergeben je Bauwerk eine eigene Silhouette.
 * Geometrien und Materialien werden zwischengespeichert (wenig Speicher, wenige Shader-Varianten). */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const G = {}, M = {};
  function geo(key, make) { return G[key] || (G[key] = make()); }
  function col(c) { return new (T().Color)(c); }
  function mix(a, b, t) { return '#' + col(a).lerp(col(b), t).getHexString(); }
  function mat(c, o) {
    o = o || {};
    const key = c + '|' + (o.rough !== undefined ? o.rough : '') + '|' + (o.metal || 0) + '|' + (o.em || '') + '|' + (o.emi || 0) + '|' + (o.op || 1) + '|' + (o.flat ? 1 : 0) + '|' + (o.side || 0);
    if (M[key]) return M[key];
    const THREE = T();
    const m = new THREE.MeshStandardMaterial({ color: col(c), roughness: o.rough !== undefined ? o.rough : 0.72, metalness: o.metal || 0, flatShading: !!o.flat });
    if (o.em) { m.emissive = col(o.em); m.emissiveIntensity = o.emi || 1; }
    if (o.op !== undefined && o.op < 1) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; }
    if (o.side) m.side = THREE.DoubleSide;
    return (M[key] = m);
  }
  function basic(c, op, add) {
    const key = 'b|' + c + '|' + (op || 1) + '|' + (add ? 1 : 0);
    if (M[key]) return M[key];
    const THREE = T(), m = new THREE.MeshBasicMaterial({ color: col(c), transparent: (op || 1) < 1 || !!add, opacity: op || 1, depthWrite: !add && (op || 1) >= 1 });
    if (add) m.blending = THREE.AdditiveBlending;
    return (M[key] = m);
  }
  // Grundformen (gecacht)
  const cyl = (rt, rb, h, s) => geo(`c${rt}|${rb}|${h}|${s || 18}`, () => new (T().CylinderGeometry)(rt, rb, h, s || 18));
  const sph = (r, w, h, ts, tl) => geo(`s${r}|${w}|${h}|${ts}|${tl}`, () => new (T().SphereGeometry)(r, w || 18, h || 12, 0, Math.PI * 2, ts || 0, tl || Math.PI));
  const cone = (r, h, s) => geo(`k${r}|${h}|${s || 18}`, () => new (T().ConeGeometry)(r, h, s || 18));
  const box = (w, h, d) => geo(`b${w}|${h}|${d}`, () => new (T().BoxGeometry)(w, h, d));
  const tor = (r, t, rs, ts, arc) => geo(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new (T().TorusGeometry)(r, t, rs || 8, ts || 24, arc || Math.PI * 2));
  const oct = r => geo('o' + r, () => new (T().OctahedronGeometry)(r, 0));
  const ico = (r, d) => geo('i' + r + '|' + (d || 0), () => new (T().IcosahedronGeometry)(r, d || 0));
  // Abgerundeter Quader (Extrusion mit Fase) – weiche Kanten statt Klötzchen
  function rbox(w, h, d, r) {
    r = Math.min(r === undefined ? 0.12 : r, w / 2 - 0.01, d / 2 - 0.01, h / 2 - 0.01);
    return geo(`rb${w}|${h}|${d}|${r}`, () => {
      const THREE = T(), s = new THREE.Shape(), x = -w / 2 + r, z = -d / 2 + r, W = w - 2 * r, D = d - 2 * r;
      s.moveTo(x, z); s.lineTo(x + W, z); s.quadraticCurveTo(x + W + r, z, x + W + r, z + r); s.lineTo(x + W + r, z + D);
      s.quadraticCurveTo(x + W + r, z + D + r, x + W, z + D + r); s.lineTo(x, z + D + r); s.quadraticCurveTo(x - r, z + D + r, x - r, z + D);
      s.lineTo(x - r, z + r); s.quadraticCurveTo(x - r, z, x, z);
      const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.01, h - 2 * r * 0.6), bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 2, curveSegments: 4 });
      g.rotateX(-Math.PI / 2); g.translate(0, r * 0.6, 0); g.computeVertexNormals();
      return g;
    });
  }
  function mesh(g, m, x, y, z, shadow) {
    const o = new (T().Mesh)(g, m);
    o.position.set(x || 0, y || 0, z || 0);
    if (shadow !== false) { o.castShadow = true; o.receiveShadow = true; }
    return o;
  }
  function grp() { return new (T().Group)(); }
  function put(g, o) { g.add(o); return o; }

  // Farbschema eines Bauwerks aus der Welt-Palette
  function scheme(pal, i) {
    const wallBase = ['#f6ecd9', '#efe4f6', '#e5f3ee', '#f8e7dc', '#e7eef8'][i % 5];
    return {
      wall: mix(wallBase, pal.accent2 || '#ffffff', 0.12), wall2: mix(wallBase, pal.rock || '#888', 0.25),
      roof: pal.accent || '#d0465e', roof2: mix(pal.accent || '#d0465e', '#000000', 0.25),
      trim: pal.accent2 || '#f2d08a', stone: pal.rock || '#8a8f99', stone2: pal.rock2 || '#6d727c',
      wood: '#9a6a3f', glow: pal.glow || '#ffe9a8', glass: mix(pal.glow || '#bfefff', '#9fe7ff', 0.5), metal: '#d8b26a'
    };
  }
  // ---------- Dächer ----------
  function roof(g, type, y, r, sc, lvl, tall) {
    const R = mat(sc.roof, { rough: 0.6 }), R2 = mat(sc.roof2, { rough: 0.6 });
    tall = tall || 1;
    switch (type) {
      case 'cone': g.add(mesh(cone(r * 1.15, r * 1.4 * tall, 20), R, 0, y + r * 0.7 * tall, 0)); if (lvl >= 4) g.add(mesh(sph(r * 0.14), mat(sc.trim, { metal: 0.6, rough: 0.3 }), 0, y + r * 1.45 * tall, 0)); break;
      case 'dome': g.add(mesh(sph(r * 1.02, 22, 12, 0, Math.PI / 2), R, 0, y, 0)); if (lvl >= 4) g.add(mesh(cyl(r * 0.1, r * 0.14, r * 0.5, 10), mat(sc.trim, { metal: 0.6, rough: 0.3 }), 0, y + r * 1.15, 0)); break;
      case 'flat': g.add(mesh(rbox(r * 2.2, 0.18, r * 2.2, 0.06), R2, 0, y, 0)); if (lvl >= 4) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.add(mesh(box(0.22, 0.3, 0.22), R, Math.cos(a) * r * 0.95, y + 0.3, Math.sin(a) * r * 0.95)); } } break;
      case 'gable': {
        const THREE = T(), s = new THREE.Shape(); s.moveTo(-r * 1.2, 0); s.lineTo(0, r * 0.95 * tall); s.lineTo(r * 1.2, 0); s.lineTo(-r * 1.2, 0);
        const gg = geo(`gab${r}|${tall}`, () => { const x = new THREE.ExtrudeGeometry(s, { depth: r * 2.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 }); x.translate(0, 0, -r * 1.05); return x; });
        g.add(mesh(gg, R, 0, y, 0)); if (lvl >= 4) g.add(mesh(box(0.25, 0.7, 0.25), mat(sc.stone2), r * 0.5, y + r * 0.6, r * 0.4)); break;
      }
      case 'spire': g.add(mesh(cone(r * 0.9, r * 2.4 * tall, 8), R, 0, y + r * 1.2 * tall, 0)); g.add(mesh(cyl(r * 0.92, r * 0.92, 0.16, 8), R2, 0, y + 0.08, 0)); break;
      case 'onion': {
        const THREE = T();
        const og = geo('onion' + r, () => { const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; const rr = Math.sin(t * Math.PI) * (1 - t * 0.5) * r * 1.15 + (t > 0.9 ? 0 : 0.02); pts.push(new THREE.Vector2(Math.max(0.001, rr), t * r * 2.2)); } return new THREE.LatheGeometry(pts, 20); });
        g.add(mesh(og, R, 0, y, 0)); g.add(mesh(cone(0.08, 0.6, 8), mat(sc.trim, { metal: 0.6, rough: 0.3 }), 0, y + r * 2.4, 0)); break;
      }
      case 'crystal': { const cm = mat(sc.glow, { em: sc.glow, emi: lvl >= 5 ? 0.9 : 0.35, rough: 0.2 }); const c1 = mesh(oct(r * 0.75), cm, 0, y + r * 0.8, 0); c1.scale.set(0.7, 1.6, 0.7); g.add(c1); for (let i = 0; i < 3; i++) { const a = i * 2.1; const c = mesh(oct(r * 0.35), cm, Math.cos(a) * r * 0.55, y + r * 0.35, Math.sin(a) * r * 0.55); c.scale.set(0.6, 1.5, 0.6); c.rotation.z = Math.cos(a) * 0.4; c.rotation.x = Math.sin(a) * 0.4; g.add(c); } break; }
      case 'tiers': for (let i = 0; i < 3; i++) { const rr = r * (1.35 - i * 0.3); put(g, mesh(cone(rr, r * 0.45, 4), i % 2 ? R2 : R, 0, y + i * r * 0.5 + r * 0.2, 0)).rotation.y = Math.PI / 4; } break;
      default: break;
    }
  }
  // Fenster und Türen (Meisterwerk: leuchtend)
  function windows(g, n, rad, y, h, sc, lvl, square) {
    const wm = lvl >= 5 ? mat(sc.glow, { em: sc.glow, emi: 1.2 }) : mat(mix(sc.glass, '#20304a', 0.45), { rough: 0.2, metal: 0.1, em: lvl >= 4 ? sc.glow : undefined, emi: 0.2 });
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const w = mesh(rbox(0.26, h, 0.1, 0.04), wm, Math.sin(a) * rad, y, Math.cos(a) * rad, false);
      w.rotation.y = a; g.add(w);
      if (lvl >= 4) { const f = mesh(box(0.34, 0.06, 0.14), mat(sc.trim), Math.sin(a) * (rad + 0.01), y - h / 2 - 0.03, Math.cos(a) * (rad + 0.01), false); f.rotation.y = a; g.add(f); }
    }
    void square;
  }
  function door(g, z, sc, h) { h = h || 0.7; g.add(mesh(rbox(0.5, h, 0.12, 0.08), mat(sc.wood, { rough: 0.85 }), 0, h / 2 + 0.25, z, false)); g.add(mesh(sph(0.04, 6, 4), mat(sc.metal, { metal: 0.8, rough: 0.3 }), 0.15, 0.25 + h * 0.5, z + 0.07, false)); }
  function banner(g, x, y, z, sc, h) {
    h = h || 1.2; g.add(mesh(cyl(0.03, 0.03, h, 6), mat(sc.wood), x, y + h / 2, z));
    const f = mesh(box(0.5, 0.32, 0.02), mat(sc.roof, { side: 1 }), x + 0.26, y + h - 0.2, z, false); f.userData.wave = 1; g.add(f);
  }
  // Schwebender Runenring + Leuchten für Stufe 5
  function master(g, top, r, sc) {
    const ring = mesh(tor(r * 0.9, 0.05, 6, 40), basic(sc.glow, 0.85, true), 0, top + 0.5, 0, false);
    ring.rotation.x = Math.PI / 2; ring.userData.spin = 0.8; g.add(ring);
    const gem = mesh(oct(0.22), mat(sc.glow, { em: sc.glow, emi: 1.4, rough: 0.2 }), 0, top + 0.9, 0, false);
    gem.userData.bob = 1; gem.userData.spin = 1.4; g.add(gem);
    const halo = mesh(sph(0.5, 12, 8), basic(sc.glow, 0.18, true), 0, top + 0.9, 0, false); halo.userData.pulse = 1; g.add(halo);
  }
  // ---------- Archetypen: Hauptkörper (lvl 3–5) ----------
  // Rückgabe: Höhe der Oberkante (für Dach und Meisterwerk-Krone)
  const ARCH = {
    tower(g, p) { const r = 0.75 * p.w, h = 2.6 * p.h; g.add(mesh(cyl(r * 0.9, r, h, 20), mat(p.sc.wall), 0, p.y + h / 2, 0)); if (p.lvl >= 4) { g.add(mesh(cyl(r * 1.08, r * 1.08, 0.16, 20), mat(p.sc.trim), 0, p.y + h * 0.55, 0)); windows(g, 4, r * 0.93, p.y + h * 0.75, 0.38, p.sc, p.lvl); } door(g, r * 0.95, p.sc); return p.y + h; },
    lighthouse(g, p) { const r = 0.62 * p.w, h = 3.0 * p.h; const body = mesh(cyl(r * 0.6, r, h, 20), mat(p.sc.wall), 0, p.y + h / 2, 0); g.add(body); for (let i = 1; i < 4; i++) g.add(mesh(cyl(r * (1 - i * 0.1) + 0.02, r * (1 - i * 0.1) + 0.04, 0.22, 20), mat(p.sc.roof), 0, p.y + h * i / 4, 0)); const lr = r * 0.62; g.add(mesh(cyl(lr * 1.15, lr * 1.15, 0.12, 16), mat(p.sc.trim), 0, p.y + h, 0)); g.add(mesh(cyl(lr * 0.8, lr * 0.8, 0.6, 12), p.lvl >= 4 ? mat(p.sc.glow, { em: p.sc.glow, emi: p.lvl >= 5 ? 1.6 : 0.6 }) : mat(p.sc.glass, { op: 0.7, rough: 0.1 }), 0, p.y + h + 0.36, 0)); door(g, r * 0.95, p.sc); return p.y + h + 0.66; },
    hall(g, p) { const w = 2.4 * p.w, h = 1.3 * p.h, d = 1.6; g.add(mesh(rbox(w, h, d, 0.14), mat(p.sc.wall), 0, p.y, 0)); if (p.lvl >= 4) for (let i = 0; i < 4; i++) g.add(mesh(cyl(0.09, 0.11, h, 10), mat(p.sc.trim), -w / 2 + 0.3 + i * (w - 0.6) / 3, p.y + h / 2, d / 2 + 0.22)); door(g, d / 2 + 0.01, p.sc, 0.8); windows(g, 6, d / 2 + 0.25, p.y + h * 0.6, 0.32, p.sc, p.lvl); return p.y + h; },
    house(g, p) { const w = 1.6 * p.w, h = 1.25 * p.h; g.add(mesh(rbox(w, h, w * 0.9, 0.1), mat(p.sc.wall), 0, p.y, 0)); door(g, w * 0.45 + 0.01, p.sc); if (p.lvl >= 4) { g.add(mesh(rbox(w * 0.55, h * 0.7, w * 0.5, 0.08), mat(p.sc.wall2), w * 0.7, p.y, 0)); g.add(mesh(box(0.3, 0.06, 0.3), mat(p.sc.wood), w * 0.7, p.y + h * 0.7 + 0.03, 0)); } windows(g, 4, w * 0.47, p.y + h * 0.62, 0.3, p.sc, p.lvl); return p.y + h; },
    dome(g, p) { const r = 1.0 * p.w, h = 0.9 * p.h; g.add(mesh(cyl(r, r * 1.05, h, 24), mat(p.sc.wall), 0, p.y + h / 2, 0)); if (p.lvl >= 4) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.add(mesh(cyl(0.07, 0.07, h, 8), mat(p.sc.trim), Math.cos(a) * r * 1.05, p.y + h / 2, Math.sin(a) * r * 1.05)); } door(g, r * 1.0, p.sc); return p.y + h; },
    pier(g, p) { const L = 2.6 * p.w; for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.add(mesh(cyl(0.08, 0.1, 1.2, 8), mat(p.sc.wood), s * 0.55, p.y - 0.3, -L / 2 + i * L / 3)); g.add(mesh(rbox(1.4, 0.16, L, 0.05), mat(p.sc.wood, { rough: 0.9 }), 0, p.y + 0.2, 0)); const hut = 0.9 * p.h; g.add(mesh(rbox(0.9, hut, 0.9, 0.08), mat(p.sc.wall), 0, p.y + 0.36, -L / 2 + 0.6)); if (p.lvl >= 4) { const boat = mesh(sph(0.45, 12, 8, Math.PI / 2, Math.PI / 2), mat(p.sc.roof, { side: 1 }), 1.15, p.y - 0.1, L / 4); boat.scale.set(0.8, 0.6, 2); boat.rotation.x = Math.PI; g.add(boat); } banner(g, 0.55, p.y + 0.3, L / 2 - 0.1, p.sc, 1); return p.y + 0.36 + hut; },
    windmill(g, p) { const h = 2.3 * p.h, r = 0.7 * p.w; g.add(mesh(cyl(r * 0.6, r, h, 10), mat(p.sc.wall), 0, p.y + h / 2, 0)); const hub = grp(); hub.position.set(0, p.y + h * 0.85, r * 0.75); hub.userData.spinZ = 1.1; const bl = mat(p.sc.trim, { side: 1 }); const n = p.lvl >= 4 ? 4 : 2; for (let i = 0; i < n * (n === 2 ? 1 : 1); i++) { const b = mesh(box(0.28, 1.6 * p.w, 0.04), bl, 0, 0.8 * p.w, 0, false); const arm = grp(); arm.rotation.z = i * Math.PI * 2 / n; arm.add(b); hub.add(arm); } hub.add(mesh(sph(0.14, 10, 8), mat(p.sc.metal, { metal: 0.7, rough: 0.3 }))); g.add(hub); door(g, r * 0.95, p.sc); return p.y + h; },
    bridge(g, p) { const L = 3.2 * p.w; const a = mesh(tor(L / 2, 0.22, 8, 28, Math.PI), mat(p.sc.stone), 0, p.y - 0.2, 0); a.scale.set(1, 0.45 * p.h, 1.6); g.add(a); g.add(mesh(rbox(L * 0.98, 0.16, 0.9, 0.05), mat(p.sc.wood), 0, p.y + L * 0.22 * p.h - 0.1, 0)); if (p.lvl >= 4) for (const s of [-1, 1]) for (let i = 0; i < 5; i++) g.add(mesh(cyl(0.04, 0.04, 0.4, 6), mat(p.sc.trim), -L * 0.4 + i * L * 0.2, p.y + L * 0.22 * p.h + 0.15, s * 0.4)); return p.y + L * 0.22 * p.h; },
    fountain(g, p) { const r = 1.0 * p.w; g.add(mesh(cyl(r, r * 1.1, 0.4, 24), mat(p.sc.stone), 0, p.y + 0.2, 0)); g.add(mesh(cyl(r * 0.9, r * 0.9, 0.05, 24), mat(p.sc.glass, { op: 0.75, rough: 0.05, em: p.sc.glass, emi: 0.2 }), 0, p.y + 0.37, 0, false)); const h = 1.0 * p.h; g.add(mesh(cyl(0.12, 0.18, h, 12), mat(p.sc.trim), 0, p.y + 0.4 + h / 2, 0)); g.add(mesh(cyl(r * 0.4, r * 0.3, 0.16, 16), mat(p.sc.stone), 0, p.y + 0.4 + h, 0)); if (p.lvl >= 4) { const jet = mesh(cone(0.18, 0.6, 10), basic(p.sc.glass, 0.55, true), 0, p.y + 0.8 + h, 0, false); jet.userData.pulse = 1; g.add(jet); } return p.y + 0.6 + h; },
    treehouse(g, p) { const h = 2.0 * p.h; g.add(mesh(cyl(0.28, 0.45, h, 10), mat('#8a5a35', { rough: 0.95 }), 0, p.y + h / 2, 0)); const leaf = mat(p.pal.grass2 || '#4f9a52', { flat: true }); [[0, 0, 0, 1.1], [0.7, -0.2, 0.3, 0.7], [-0.6, -0.1, -0.3, 0.75], [0.1, 0.5, -0.5, 0.6]].forEach(q => g.add(mesh(ico(q[3] * p.w, 1), leaf, q[0], p.y + h + 0.3 + q[1], q[2]))); g.add(mesh(rbox(1.0, 0.7, 0.9, 0.08), mat(p.sc.wall2), 0.25, p.y + h * 0.5, 0.45)); if (p.lvl >= 4) g.add(mesh(box(0.06, h * 0.5, 0.3), mat(p.sc.wood), -0.4, p.y + h * 0.25, 0.6)); return p.y + h + 1.2; },
    tent(g, p) { const r = 1.0 * p.w, h = 1.9 * p.h; const m1 = mat(p.sc.roof, { flat: true }), m2 = mat(p.sc.wall, { flat: true }); const c = mesh(cone(r, h, 12), m1, 0, p.y + h / 2, 0); g.add(c); if (p.lvl >= 4) put(g, mesh(cone(r * 0.75, h * 0.75, 12), m2, 0, p.y + h * 0.375 + 0.02, 0)).scale.set(1.36, 1, 1.36); banner(g, 0, p.y + h - 0.1, 0, p.sc, 0.8); return p.y + h; },
    pagoda(g, p) { const r = 0.9 * p.w; let y = p.y; for (let i = 0; i < (p.lvl >= 4 ? 3 : 2); i++) { const s = 1 - i * 0.22, hh = 0.75 * p.h; g.add(mesh(rbox(r * 1.6 * s, hh, r * 1.6 * s, 0.08), mat(p.sc.wall), 0, y, 0)); y += hh; const rf = mesh(cone(r * 1.55 * s, 0.45, 4), mat(p.sc.roof), 0, y + 0.18, 0); rf.rotation.y = Math.PI / 4; g.add(rf); y += 0.3; } door(g, r * 0.8, p.sc); return y; },
    pyramid(g, p) { let y = p.y; const n = p.lvl >= 4 ? 5 : 3; for (let i = 0; i < n; i++) { const s = (2.4 - i * 0.42) * p.w; g.add(mesh(rbox(s, 0.42 * p.h, s, 0.06), mat(i % 2 ? p.sc.stone : p.sc.wall2), 0, y, 0)); y += 0.42 * p.h; } return y; },
    crystal(g, p) { g.add(mesh(ico(0.9 * p.w, 0), mat(p.sc.stone, { flat: true }), 0, p.y + 0.25, 0)); const cm = mat(p.sc.glow, { em: p.sc.glow, emi: p.lvl >= 5 ? 1.1 : 0.4, rough: 0.15, flat: true }); const n = p.lvl >= 4 ? 7 : 4; for (let i = 0; i < n; i++) { const a = i * 2.4, rr = i ? 0.5 : 0, s = i ? 0.5 + (i % 3) * 0.15 : 1.0; const c = mesh(oct(0.5 * s * p.w), cm, Math.cos(a) * rr, p.y + 0.9 * s * p.h + 0.3, Math.sin(a) * rr); c.scale.set(0.55, 2.0 * p.h, 0.55); c.rotation.set(Math.sin(a) * 0.35 * (i ? 1 : 0), a, Math.cos(a) * 0.35 * (i ? 1 : 0)); g.add(c); } return p.y + 2.3 * p.h; },
    gate(g, p) { const h = 2.3 * p.h, sp = 1.0 * p.w; for (const s of [-1, 1]) g.add(mesh(rbox(0.5, h, 0.5, 0.1), mat(p.sc.stone), s * sp, p.y, 0)); g.add(mesh(rbox(sp * 2 + 0.9, 0.35, 0.65, 0.1), mat(p.sc.roof), 0, p.y + h, 0)); if (p.lvl >= 4) { const ring = mesh(tor(sp * 0.7, 0.07, 8, 32), mat(p.sc.trim, { metal: 0.5, rough: 0.35 }), 0, p.y + h * 0.5, 0); g.add(ring); } if (p.lvl >= 5) { const disc = mesh(geo('portal', () => new (T().CircleGeometry)(1, 32)), basic(p.sc.glow, 0.55, true), 0, p.y + h * 0.5, 0, false); disc.scale.setScalar(sp * 0.68); disc.userData.pulse = 1; g.add(disc); } return p.y + h + 0.35; },
    ship(g, p) { const hull = mesh(sph(0.9 * p.w, 18, 10, Math.PI / 2, Math.PI / 2), mat(p.sc.wood, { side: 1 }), 0, p.y + 0.9, 0); hull.scale.set(0.9, 0.8, 2.0); hull.rotation.x = Math.PI; g.add(hull); g.add(mesh(rbox(1.5 * p.w, 0.12, 3.2 * p.w, 0.05), mat(mix(p.sc.wood, '#ffffff', 0.15)), 0, p.y + 0.86, 0)); const mh = 2.2 * p.h; g.add(mesh(cyl(0.06, 0.08, mh, 8), mat(p.sc.wood), 0, p.y + 0.9 + mh / 2, 0)); const sail = mesh(geo('sail', () => { const s = new (T().PlaneGeometry)(1, 1, 4, 4); return s; }), mat(p.sc.wall, { side: 1 }), 0, p.y + 0.9 + mh * 0.6, 0.05, false); sail.scale.set(1.3 * p.w, mh * 0.55, 1); sail.rotation.y = Math.PI / 2; sail.userData.wave = 1; g.add(sail); for (let i = 0; i < 3; i++) g.add(mesh(cyl(0.05, 0.05, 1.0, 6), mat(p.sc.wood), 0.4, p.y + 0.4, -1 + i)); if (p.lvl >= 4) { const bal = mesh(sph(0.75, 16, 10), mat(p.sc.roof), 0, p.y + 0.9 + mh + 0.6, 0); bal.scale.set(1, 0.8, 1.6); g.add(bal); } return p.y + 0.9 + mh + (p.lvl >= 4 ? 1.2 : 0); },
    greenhouse(g, p) { const w = 1.0 * p.w, L = 2.2 * p.w; const gl = mat(p.sc.glass, { op: 0.45, rough: 0.05, metal: 0.1 }); const arc = mesh(cyl(w, w, L, 16, 1), gl, 0, p.y + 0.05, 0, false); arc.geometry = geo('ghArc' + w + '|' + L, () => new (T().CylinderGeometry)(w, w, L, 16, 1, true, 0, Math.PI)); arc.rotation.z = Math.PI / 2; arc.rotation.y = Math.PI / 2; arc.scale.y = 1; g.add(arc); for (let i = 0; i < 5; i++) { const rib = mesh(tor(w, 0.035, 6, 20, Math.PI), mat(p.sc.trim, { metal: 0.5, rough: 0.4 }), 0, p.y + 0.05, -L / 2 + i * L / 4); g.add(rib); } const plant = mat(p.pal.grass2 || '#4f9a52', { flat: true }); for (let i = 0; i < (p.lvl >= 4 ? 6 : 3); i++) g.add(mesh(ico(0.22 + (i % 2) * 0.1, 0), plant, ((i % 2) - 0.5) * 0.7, p.y + 0.3, -L / 2 + 0.4 + i * 0.3)); return p.y + w + 0.05; },
    factory(g, p) { const w = 1.9 * p.w, h = 1.2 * p.h; g.add(mesh(rbox(w, h, 1.5, 0.1), mat(p.sc.wall2), 0, p.y, 0)); const n = p.lvl >= 4 ? 3 : 1; for (let i = 0; i < n; i++) { const c = mesh(cyl(0.14, 0.18, 1.3 * p.h, 10), mat(p.sc.stone2), -w / 2 + 0.4 + i * 0.45, p.y + h + 0.6 * p.h, -0.4); c.userData.smoke = 1; g.add(c); } const gear = gearMesh(0.42, mat(p.sc.metal, { metal: 0.75, rough: 0.35 })); gear.position.set(w / 2 - 0.25, p.y + h * 0.6, 0.78); gear.userData.spinZ = 0.8; g.add(gear); windows(g, 5, 0.8, p.y + h * 0.55, 0.3, p.sc, p.lvl); return p.y + h; },
    igloo(g, p) { const r = 1.05 * p.w; g.add(mesh(sph(r, 20, 12, 0, Math.PI / 2), mat(mix(p.sc.wall, '#dff4ff', 0.6), { rough: 0.5 }), 0, p.y, 0)); const t = mesh(cyl(0.42, 0.42, 0.9, 14, 1), mat(mix(p.sc.wall, '#dff4ff', 0.6), { rough: 0.5 }), 0, p.y + 0.3, r * 0.85); t.rotation.x = Math.PI / 2; g.add(t); if (p.lvl >= 4) for (let i = 1; i < 4; i++) put(g, mesh(tor(r * Math.cos(i * 0.36), 0.03, 4, 32), mat('#c7e6f5'), 0, p.y + r * Math.sin(i * 0.36), 0, false)).rotation.x = Math.PI / 2; return p.y + r; },
    theater(g, p) { const r = 1.5 * p.w; for (let i = 0; i < 3; i++) { const t = mesh(geo('th' + i + r, () => new (T().CylinderGeometry)(r - i * 0.35, r - i * 0.35, 0.3, 20, 1, false, 0, Math.PI)), mat(i % 2 ? p.sc.wall2 : p.sc.stone), 0, p.y + 0.15 + i * 0.3, -0.3); g.add(t); } g.add(mesh(rbox(1.6, 0.25, 0.9, 0.06), mat(p.sc.wood), 0, p.y + 0.12, 0.6)); const h = 1.4 * p.h; g.add(mesh(rbox(1.8, h, 0.2, 0.05), mat(p.sc.roof), 0, p.y + 0.2, 1.05)); if (p.lvl >= 4) for (const s of [-1, 1]) g.add(mesh(cyl(0.1, 0.1, h + 0.4, 10), mat(p.sc.trim), s * 0.95, p.y + (h + 0.4) / 2, 1.05)); return p.y + h + 0.2; },
    station(g, p) { const L = 2.6 * p.w; g.add(mesh(rbox(1.4, 0.3, L, 0.06), mat(p.sc.stone), 0, p.y, 0)); for (const s of [-1, 1]) g.add(mesh(box(0.06, 0.06, L + 0.6), mat(p.sc.metal, { metal: 0.8, rough: 0.3 }), 1.0 + s * 0.22, p.y + 0.05, 0)); const h = 1.3 * p.h; for (let i = 0; i < 3; i++) g.add(mesh(cyl(0.06, 0.06, h, 8), mat(p.sc.trim), -0.5, p.y + 0.3 + h / 2, -L / 2 + 0.3 + i * (L - 0.6) / 2)); g.add(mesh(rbox(1.5, 0.12, L, 0.05), mat(p.sc.roof), -0.1, p.y + 0.3 + h, 0)); if (p.lvl >= 4) { const tr = grp(); tr.add(mesh(rbox(0.6, 0.55, 1.2, 0.12), mat(p.sc.roof2), 0, 0, 0)); tr.add(mesh(cyl(0.18, 0.18, 0.3, 10), mat(p.sc.stone2), 0, 0.65, -0.35)); tr.position.set(1.0, p.y + 0.1, 0.3); tr.userData.slide = 1; g.add(tr); } return p.y + 0.42 + h; },
    temple(g, p) { let y = p.y; for (let i = 0; i < 3; i++) { const s = 2.4 * p.w - i * 0.25; g.add(mesh(rbox(s, 0.16, s, 0.04), mat(p.sc.stone), 0, y, 0)); y += 0.16; } const h = 1.5 * p.h, r = 0.9 * p.w; const n = p.lvl >= 4 ? 8 : 4; for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + Math.PI / 4; g.add(mesh(cyl(0.1, 0.12, h, 10), mat(p.sc.wall), Math.cos(a) * r, y + h / 2, Math.sin(a) * r)); } g.add(mesh(cyl(r * 0.55, r * 0.55, h * 0.9, 16), mat(p.sc.wall2), 0, y + h * 0.45, 0)); g.add(mesh(cyl(r + 0.25, r + 0.25, 0.18, 24), mat(p.sc.trim), 0, y + h + 0.09, 0)); return y + h + 0.18; },
    mushroom(g, p) { const h = 1.5 * p.h, r = 1.25 * p.w; g.add(mesh(cyl(0.45 * p.w, 0.6 * p.w, h, 16), mat(mix(p.sc.wall, '#fff6e6', 0.4)), 0, p.y + h / 2, 0)); const cap = mesh(sph(r, 22, 12, 0, Math.PI / 2), mat(p.sc.roof), 0, p.y + h - 0.1, 0); cap.scale.y = 0.62; g.add(cap); if (p.lvl >= 4) for (let i = 0; i < 7; i++) { const a = i * 0.9, rr = r * (0.35 + (i % 3) * 0.2); g.add(mesh(sph(0.13, 8, 6), mat('#fff6e6'), Math.cos(a) * rr, p.y + h - 0.1 + Math.sqrt(Math.max(0, r * r - rr * rr)) * 0.62 - 0.02, Math.sin(a) * rr, false)); } door(g, 0.5 * p.w, p.sc, 0.6); windows(g, 2, 0.5 * p.w, p.y + h * 0.65, 0.25, p.sc, p.lvl); return p.y + h + r * 0.62 - 0.1; },
    clocktower(g, p) { const w = 1.0 * p.w, h = 2.9 * p.h; g.add(mesh(rbox(w, h, w, 0.08), mat(p.sc.wall), 0, p.y, 0)); const face = clockFace(p.sc); for (let i = 0; i < (p.lvl >= 4 ? 4 : 1); i++) { const f = new (T().Mesh)(geo('cf', () => new (T().CircleGeometry)(0.36, 24)), face); const a = i * Math.PI / 2; f.position.set(Math.sin(a) * (w / 2 + 0.02), p.y + h * 0.78, Math.cos(a) * (w / 2 + 0.02)); f.rotation.y = a; g.add(f); const hand = mesh(box(0.04, 0.28, 0.02), basic('#2a2a3a'), 0, 0, 0.01, false); hand.geometry = geo('hand', () => { const b = new (T().BoxGeometry)(0.04, 0.28, 0.02); b.translate(0, 0.12, 0); return b; }); hand.userData.spinZ = 0.5; f.add(hand); } door(g, w / 2 + 0.01, p.sc); return p.y + h; },
    market(g, p) { const n = p.lvl >= 4 ? 4 : 2; for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + 0.4, r = 0.9 * p.w; const st = grp(); st.position.set(Math.cos(a) * r, p.y, Math.sin(a) * r); st.rotation.y = -a + Math.PI / 2; st.add(mesh(rbox(0.9, 0.5, 0.6, 0.05), mat(p.sc.wood), 0, 0, 0)); for (const s of [-1, 1]) st.add(mesh(cyl(0.035, 0.035, 1.1, 6), mat(p.sc.wood), s * 0.42, 0.55, 0.28)); const aw = mesh(box(1.0, 0.06, 0.8), mat(i % 2 ? p.sc.roof : p.sc.trim), 0, 1.1, 0.05); aw.rotation.x = 0.25; st.add(aw); st.add(mesh(sph(0.1, 8, 6), mat(['#ff7a6b', '#ffd98a', '#7bd88f', '#7fe8ff'][i % 4]), -0.2, 0.58, 0)); g.add(st); } g.add(mesh(cyl(0.25, 0.3, 0.3, 12), mat(p.sc.stone), 0, p.y + 0.15, 0)); banner(g, 0, p.y + 0.3, 0, p.sc, 1.6 * p.h); return p.y + 1.3; },
    obelisk(g, p) { const h = 3.0 * p.h; g.add(mesh(rbox(1.2 * p.w, 0.3, 1.2 * p.w, 0.06), mat(p.sc.stone), 0, p.y, 0)); const ob = mesh(cyl(0.18 * p.w, 0.42 * p.w, h, 4), mat(p.sc.wall2, { flat: true }), 0, p.y + 0.3 + h / 2, 0); ob.rotation.y = Math.PI / 4; g.add(ob); if (p.lvl >= 4) for (let i = 0; i < 4; i++) put(g, mesh(box(0.05, h * 0.6, 0.02), mat(p.sc.glow, { em: p.sc.glow, emi: 0.8 }), Math.sin(i * Math.PI / 2) * 0.27 * p.w, p.y + 0.3 + h * 0.45, Math.cos(i * Math.PI / 2) * 0.27 * p.w, false)).rotation.y = i * Math.PI / 2; return p.y + 0.3 + h; },
    palace(g, p) { const w = 2.0 * p.w, h = 1.3 * p.h; g.add(mesh(rbox(w, h, 1.4, 0.12), mat(p.sc.wall), 0, p.y, 0)); door(g, 0.71, p.sc, 0.85); const tr = 0.42; for (const s of [-1, 1]) { const th = h * (p.lvl >= 4 ? 1.8 : 1.3); g.add(mesh(cyl(tr, tr * 1.05, th, 14), mat(p.sc.wall2), s * (w / 2 + 0.1), p.y + th / 2, 0)); roof(g, 'cone', p.y + th, tr, p.sc, p.lvl, 0.9); } windows(g, 6, 0.72, p.y + h * 0.6, 0.32, p.sc, p.lvl); return p.y + h; },
    arch(g, p) { const r = 1.35 * p.w; const a = mesh(tor(r, 0.24, 10, 36, Math.PI), mat(p.sc.stone), 0, p.y, 0); a.scale.y = p.h; g.add(a); for (const s of [-1, 1]) g.add(mesh(rbox(0.7, 0.3, 0.7, 0.08), mat(p.sc.stone2), s * r, p.y, 0)); if (p.lvl >= 4) { const inner = mesh(tor(r * 0.8, 0.06, 6, 30, Math.PI), mat(p.sc.trim, { metal: 0.5 }), 0, p.y, 0); inner.scale.y = p.h; g.add(inner); } return p.y + r * p.h; }
  };
  const ROUND = { tower: 1, lighthouse: 1, dome: 1, fountain: 1, tent: 1, igloo: 1, crystal: 1, mushroom: 1, temple: 1, windmill: 1, treehouse: 1, theater: 1, arch: 1 };
  const NOROOF = { pier: 1, bridge: 1, fountain: 1, treehouse: 1, crystal: 1, gate: 1, ship: 1, greenhouse: 1, igloo: 1, theater: 1, station: 1, market: 1, obelisk: 1, arch: 1, pyramid: 0 };
  function gearMesh(r, m) {
    const g = geo('gear' + r, () => {
      const THREE = T(), s = new THREE.Shape(), n = 10;
      for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r : r * 0.78; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); }
      const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.25, 0, Math.PI * 2, true); s.holes.push(hole);
      return new THREE.ExtrudeGeometry(s, { depth: r * 0.25, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
    });
    const o = new (T().Mesh)(g, m); o.castShadow = true; return o;
  }
  let clockMat = null;
  function clockFace() {
    if (clockMat) return clockMat;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#fbf3df'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.strokeStyle = '#8a6a3a'; x.lineWidth = 6; x.stroke();
    x.fillStyle = '#5a4630'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.arc(64 + Math.sin(a) * 48, 64 - Math.cos(a) * 48, i % 3 ? 3 : 6, 0, 7); x.fill(); }
    const t = new (T().CanvasTexture)(c);
    clockMat = new (T().MeshBasicMaterial)({ map: t });
    return clockMat;
  }
  // ---------- Bauwerk erzeugen ----------
  // def: {arch, roof, tall, wide}, stage 0–5, pal: Weltpalette, idx: 0–4 (Farbvariante), damaged: bool
  function building(def, stage, pal, idx, damaged) {
    const g = grp(), sc = scheme(pal, idx || 0), seed = SW.rng.hash(def.id || def.arch);
    const rr = SW.rng.seeded(seed);
    const round = !!ROUND[def.arch];
    const W = def.wide || 1, Hh = def.tall || 1;
    // Bauplatz-Ring (immer): Pflaster
    const padM = mat(mix(mix(sc.stone, pal.grass2 || '#5f9a52', 0.3), '#3a3040', 0.12), { rough: 0.95 });
    const pad = mesh(round ? cyl(1.75, 1.85, 0.12, 24) : rbox(3.2, 0.12, 3.2, 0.2), padM, 0, round ? 0.06 : 0, 0, false); pad.receiveShadow = true; g.add(pad);
    if (stage === 0) {
      const ring = mesh(tor(1.35, 0.05, 6, 40), basic(sc.glow, 0.8, true), 0, 0.16, 0, false); ring.rotation.x = Math.PI / 2; ring.userData.pulse = 1; g.add(ring);
      g.add(mesh(cyl(0.05, 0.05, 1.0, 6), mat(sc.wood), 0.9, 0.6, 0.9));
      const sign = mesh(rbox(0.6, 0.4, 0.06, 0.03), mat(sc.trim), 0.9, 0.9, 0.93); g.add(sign);
      for (let i = 0; i < 4; i++) g.add(mesh(ico(0.12 + rr.next() * 0.1, 0), mat(sc.stone, { flat: true }), (rr.next() - 0.5) * 1.6, 0.18, (rr.next() - 0.5) * 1.6));
      g.userData.top = 1.2; return g;
    }
    if (stage === 1) {  // roh: Steine, Balken, niedrige Mauerreste
      for (let i = 0; i < 6; i++) { const s = 0.18 + rr.next() * 0.16; g.add(mesh(ico(s, 0), mat(i % 2 ? sc.stone : sc.stone2, { flat: true }), (rr.next() - 0.5) * 2, 0.12 + s * 0.6, (rr.next() - 0.5) * 2)); }
      for (let i = 0; i < 3; i++) { const b = mesh(box(1.6, 0.12, 0.14), mat(sc.wood), (rr.next() - 0.5) * 0.6, 0.22 + i * 0.13, -0.6 + i * 0.12); b.rotation.y = rr.next() * 0.6 - 0.3; g.add(b); }
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.add(mesh(box(0.14, 0.9, 0.14), mat(sc.wood), Math.cos(a) * 1.0, 0.55, Math.sin(a) * 1.0)); }
      g.add(mesh(round ? cyl(0.9 * W, 0.95 * W, 0.4, 16) : rbox(1.8 * W, 0.4, 1.4, 0.06), mat(sc.wall2, { flat: true }), 0, round ? 0.32 : 0.12, 0));
      g.userData.top = 1.1; return g;
    }
    // Fundament ab Stufe 2
    const plinthH = 0.32;
    g.add(mesh(round ? cyl(1.25 * Math.max(0.8, W), 1.35 * Math.max(0.8, W), plinthH, 24) : rbox(2.8 * Math.max(0.8, Math.min(1.15, W)), plinthH, 2.6, 0.1), mat(sc.stone), 0, round ? 0.12 + plinthH / 2 : 0.12, 0));
    const y0 = 0.12 + plinthH;
    if (stage === 2) {
      const sc2 = mat(sc.wood);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.add(mesh(box(0.1, 2.0 * Hh, 0.1), sc2, Math.cos(a) * 1.2, y0 + Hh, Math.sin(a) * 1.2)); }
      for (let k = 1; k <= 2; k++) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const b = mesh(box(1.75, 0.07, 0.07), sc2, Math.cos(a + Math.PI / 4) * 0.85 * Math.SQRT2 * 0.6, y0 + k * 0.7 * Hh, Math.sin(a + Math.PI / 4) * 0.85 * Math.SQRT2 * 0.6); b.rotation.y = -a; g.add(b); }
      g.add(mesh(round ? cyl(0.85 * W, 0.9 * W, 0.6 * Hh, 18) : rbox(1.6 * W, 0.6 * Hh, 1.3, 0.08), mat(sc.wall), 0, round ? y0 + 0.3 * Hh : y0, 0));
      g.add(mesh(box(0.5, 0.36, 0.5), mat('#c9a46a'), 1.3, y0 + 0.18, 0.8));
      g.userData.top = y0 + 2 * Hh; return g;
    }
    const lvl = stage;  // 3, 4, 5
    const body = grp(); g.add(body);
    const fn = ARCH[def.arch] || ARCH.house;
    const top = fn(body, { y: y0, w: W, h: Hh, sc, lvl, pal, rng: rr });
    const rType = def.roof || 'cone';
    if (!NOROOF[def.arch] && rType !== 'none') {
      const rr2 = def.arch === 'hall' ? 1.25 * W : def.arch === 'house' ? 0.85 * W : def.arch === 'factory' ? 0.95 * W : def.arch === 'palace' ? 0.9 * W : def.arch === 'clocktower' ? 0.6 * W : def.arch === 'tower' ? 0.75 * W : def.arch === 'lighthouse' ? 0.45 * W : def.arch === 'pyramid' ? 0.45 * W : def.arch === 'temple' ? 1.1 * W : def.arch === 'tent' ? 0.3 : def.arch === 'pagoda' ? 0.4 : def.arch === 'windmill' ? 0.5 * W : def.arch === 'mushroom' ? 0.3 : 1.0 * W;
      if (lvl >= 4 || ['flat', 'dome', 'cone'].includes(rType)) roof(body, lvl >= 4 ? rType : 'flat', top, rr2, sc, lvl, Hh);
      else roof(body, 'flat', top, rr2, sc, lvl, Hh);
    } else if (def.roof === 'crystal' || (NOROOF[def.arch] && lvl >= 4 && def.roof && def.roof !== 'none' && def.roof !== 'flat')) {
      roof(body, def.roof, top, 0.45, sc, lvl, Hh * 0.8);
    }
    if (lvl >= 4) {
      // Ausbau: Laternen, Beet, Fahne – je nach Zufall des Bauwerks
      const lx = round ? 1.45 : 1.55;
      g.add(mesh(cyl(0.04, 0.05, 0.9, 6), mat(sc.metal, { metal: 0.6, rough: 0.4 }), lx, y0 + 0.45 - 0.2, 1.1));
      g.add(mesh(sph(0.11, 10, 8), lvl >= 5 ? mat(sc.glow, { em: sc.glow, emi: 1.5 }) : mat(sc.glass, { em: sc.glow, emi: 0.4 }), lx, y0 + 0.75, 1.1, false));
      if (rr.next() < 0.6) banner(g, -1.45, 0.4, -1.1, sc, 1.4);
      const fl = ['#ff7a6b', '#ffd98a', '#c58bff', '#7fe8ff'];
      for (let i = 0; i < 5; i++) g.add(mesh(sph(0.08, 6, 5), mat(fl[i % 4]), -1.4 + i * 0.16, 0.32, 1.35, false));
    }
    if (lvl >= 5) master(g, top + (NOROOF[def.arch] ? 0.1 : 1.0 * Hh), 0.8, sc);
    if (damaged) {
      body.rotation.z = 0.06; body.rotation.x = -0.04;
      for (let i = 0; i < 4; i++) g.add(mesh(ico(0.14 + rr.next() * 0.1, 0), mat('#4a4a52', { flat: true }), (rr.next() - 0.5) * 2.2, 0.25, (rr.next() - 0.5) * 2.2));
      const sm = mesh(sph(0.35, 8, 6), basic('#5a5a66', 0.45), 0.2, top * 0.7, 0.2, false); sm.userData.smokePuff = 1; g.add(sm);
      g.traverse(o => { if (o.isMesh && o.material && o.material.color && !o.material.transparent) { const k = o.material; o.material = mat('#' + k.color.clone().multiplyScalar(0.62).getHexString(), { rough: 0.9 }); } });
    }
    g.userData.top = top + (lvl >= 5 ? 1.5 : 0.5);
    return g;
  }
  // Animierte Kleinteile eines Bauwerks pro Frame bewegen
  function animate(root, t, dt) {
    root.traverse(o => {
      const u = o.userData; if (!u) return;
      if (u.spin) o.rotation.z += dt * u.spin;
      if (u.spinZ) o.rotation.z += dt * u.spinZ;
      if (u.bob) o.position.y += Math.sin(t * 2 + o.id) * 0.002;
      if (u.pulse && o.material) o.material.opacity = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3 + o.id));
      if (u.wave) o.rotation.y = (o.rotation.y || 0) * 0.9 + Math.sin(t * 3 + o.id) * 0.05;
      if (u.smokePuff) { o.position.y += dt * 0.4; o.scale.setScalar(1 + ((t * 0.4 + o.id) % 1) * 1.5); if (o.position.y > 4) o.position.y = 1.5; }
      if (u.slide) o.position.z = Math.sin(t * 0.5) * 0.6;
    });
  }
  function disposeTree(root) {
    // gecachte Geometrien/Materialien bleiben bestehen (gemeinsam genutzt); nur Einzelstücke freigeben
    root.traverse(o => { if (o.isMesh && o.geometry && !o.geometry.__cached && o.userData.own) o.geometry.dispose(); });
  }
  SW.Models = { put, mat, basic, mix, col, cyl, sph, cone, box, tor, oct, ico, rbox, mesh, grp, gearMesh, building, animate, disposeTree, scheme, ARCH: Object.keys(ARCH) };
})(globalThis.SW = globalThis.SW || {});
