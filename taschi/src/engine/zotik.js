// Zotik – der Fuchs-Held aus dem easygames-Spiel „Zotik“, im Taschi-Stil nachgebaut nach seinem Master-Sheet
// (zotik-src/src/fox.js): orangefarbenes Fell, heller Bauch, helle Schnauze und Wangenbüschel, grüne Augen,
// große Ohren mit heller Innenseite und dunkler Spitze, gefegter Haarschopf, grüner Schal mit wehendem Ende,
// braune Lederweste mit Gurt und blauem Kristall, Gürtel mit Tasche, dunkle Hose mit rotem Flicken,
// große Stiefel mit Bronzeschnallen, Lederschienen mit Bronzering, dunkle Pfoten, Schwert auf dem Rücken
// und ein buschiger Schwanz mit dunklem Ring und heller Spitze.
// Eine Bauweise für beides: die spielbare Figur (Character, gleiche Gelenke wie die Menschen) und das
// legendäre Taschi (Creature). Teile werden je Gelenk zu einem Netz zusammengelegt (wenige Zeichenaufrufe).
import { THREE } from './three.js';
import { Builder, matrix } from './geometry.js';
import { glowMaterial } from './materials.js';

const O = 0xff8a22, OD = 0xe06a14, CR = 0xfff2dc, BR = 0x7e4e2c, PT = 0x5a4234, DK = 0x2a1e1a, GR = 0x2f9a45, BZ = 0xb98a4a, RD = 0xb82a2a;
const EYE = 0x1fc84a, STEEL = 0xd5dde6;
const SPH = new THREE.SphereGeometry(1, 18, 12), CYL = new THREE.CylinderGeometry(1, 1, 1, 14, 1), CONE = new THREE.ConeGeometry(1, 1, 12, 1), BOX = new THREE.BoxGeometry(1, 1, 1);
const TOR = new THREE.TorusGeometry(1, 0.3, 8, 24);
for (const g of [SPH, CYL, CONE, BOX, TOR]) g.userData.shared = true;
let CRYSTAL = null;

// Ellipsoid, Zylinder, Kegel, Quader, Ring: Größe (rx, ry, rz), Lage, Drehung
const el = (b, c, rx, ry, rz, x, y, z, ax = 0, ay = 0, az = 0) => b.add(SPH, c, matrix(x, y, z, ax, ay, az, rx, ry, rz));
const cy = (b, c, rx, ry, rz, x, y, z, ax = 0, ay = 0, az = 0) => b.add(CYL, c, matrix(x, y, z, ax, ay, az, rx, ry, rz));
const co = (b, c, rx, ry, rz, x, y, z, ax = 0, ay = 0, az = 0) => b.add(CONE, c, matrix(x, y, z, ax, ay, az, rx, ry, rz));
const bx = (b, c, sx, sy, sz, x, y, z, ax = 0, ay = 0, az = 0) => b.add(BOX, c, matrix(x, y, z, ax, ay, az, sx, sy, sz));
const ring = (b, c, s, x, y, z) => b.add(TOR, c, matrix(x, y, z, Math.PI / 2, 0, 0, s, s, s));

/**
 * Baut Zotik mit Gelenken. mesh(builder, parent) legt ein Netz an (Material/Umriss bestimmt der Aufrufer).
 * Rückgabe: { root, fig, bones, dims } – bones wie bei den Menschen (hips … kneeR, eyes, mouth, handL/R) plus tail, earL, earR.
 */
export function buildZotikRig(mesh, { scale = 0.9 } = {}) {
  const root = new THREE.Group(); root.name = 'zotik';
  const fig = new THREE.Group(); fig.scale.setScalar(scale); root.add(fig);
  const bones = {};
  const pivot = (name, parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); bones[name] = g; return g; };
  const hips = pivot('hips', fig, 0, 0.58, 0), torso = pivot('torso', hips, 0, 0, 0);
  const neck = pivot('neck', torso, 0, 0.7, 0), head = pivot('head', neck, 0, 0.05, 0);

  // --- Beine: Fell am Oberschenkel, weite Hose, große Stiefel mit Bronzeschnalle
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const thigh = pivot('thigh' + side, hips, s * 0.15, 0, 0), knee = pivot('knee' + side, thigh, 0, -0.27, 0);
    const tb = new Builder();
    el(tb, O, 0.15, 0.19, 0.15, 0, -0.1, 0);
    el(tb, PT, 0.145, 0.2, 0.15, 0, -0.13, 0);
    cy(tb, PT, 0.125, 0.1, 0.125, 0, -0.24, 0);
    if (s > 0) bx(tb, RD, 0.02, 0.2, 0.12, 0.14, -0.1, 0.05);   // Flicken an der Hose
    mesh(tb, thigh);
    const kb = new Builder();
    cy(kb, PT, 0.125, 0.1, 0.125, 0, -0.02, 0);
    cy(kb, BR, 0.108, 0.17, 0.108, 0, -0.13, 0);                // Stiefelschaft
    el(kb, BR, 0.12, 0.06, 0.12, 0, -0.03, 0);                  // Umschlag
    el(kb, BR, 0.125, 0.085, 0.215, 0, -0.23, 0.07); el(kb, BR, 0.11, 0.075, 0.13, 0, -0.23, 0.2);   // Stiefelspitze
    bx(kb, DK, 0.13, 0.03, 0.24, 0, -0.285, 0.08);              // Sohle
    ring(kb, BZ, 0.112, 0, -0.06, 0); el(kb, BZ, 0.075, 0.045, 0.05, 0, -0.23, 0.24);   // Schnallenband + Kappe
    mesh(kb, knee);
  }

  // --- Rumpf: Fell, heller Bauch, Hosenbund, Lederweste mit Gurt, Gürtel mit Tasche, Schal, Schwert
  const tb = new Builder();
  el(tb, O, 0.235, 0.3, 0.19, 0, 0.28, 0);
  el(tb, CR, 0.17, 0.22, 0.13, 0, 0.26, 0.11);
  el(tb, PT, 0.27, 0.17, 0.22, 0, 0.08, -0.01);
  el(tb, BR, 0.265, 0.18, 0.215, 0, 0.16, -0.005);
  bx(tb, BR, 0.05, 0.55, 0.025, 0, 0.35, 0.2, 0, 0, 0.55);       // Gurt über der Brust
  {
    tb.add(TOR, BR, matrix(0, 0.04, 0, Math.PI / 2, 0, 0, 0.25, 0.2, 0.12));   // Gürtel
    bx(tb, BR, 0.07, 0.07, 0.03, 0, 0.04, 0.22); bx(tb, BR, 0.13, 0.17, 0.09, 0.29, 0.02, -0.03);   // Schnalle, Tasche
    bx(tb, BZ, 0.045, 0.05, 0.02, 0, 0.04, 0.24); bx(tb, BZ, 0.04, 0.05, 0.02, 0.29, 0.02, 0.02);
  }
  el(tb, 0x3a8cff, 0.03, 0.03, 0.02, 0.06, 0.4, 0.215);          // Kristall am Gurt
  tb.add(TOR, GR, matrix(0, 0.495, 0.01, Math.PI / 2, 0, 0, 0.22, 0.2, 0.2));   // Schal
  el(tb, GR, 0.09, 0.075, 0.07, 0.06, 0.45, 0.2);                // Knoten
  bx(tb, GR, 0.17, 0.48, 0.02, -0.12, 0.27, -0.27, -0.42, 0, 0.12);   // wehende Enden
  bx(tb, GR, 0.13, 0.32, 0.02, -0.02, 0.33, -0.25, -0.32, 0, -0.1);
  // Schwert quer auf dem Rücken: Griff über der rechten Schulter
  {
    const a = -0.85, ux = -Math.sin(a), uy = Math.cos(a), cx = -0.02, cyy = 0.26, cz = -0.27;
    bx(tb, STEEL, 0.06, 0.78, 0.014, cx, cyy, cz, 0, 0, a);
    bx(tb, 0x9aa6b4, 0.012, 0.74, 0.018, cx, cyy, cz, 0, 0, a);
    bx(tb, BZ, 0.2, 0.04, 0.05, cx + ux * 0.4, cyy + uy * 0.4, cz, 0, 0, a);
    cy(tb, BR, 0.024, 0.15, 0.024, cx + ux * 0.49, cyy + uy * 0.49, cz, 0, 0, a);
    el(tb, BZ, 0.035, 0.035, 0.035, cx + ux * 0.58, cyy + uy * 0.58, cz);
  }
  mesh(tb, torso);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), CRYSTAL || (CRYSTAL = glowMaterial(0x6ab4ff, 0.9)));
  glow.position.set(0.06, 0.4, 0.22); torso.add(glow);

  // --- Arme: Fell, Schulterpolster, Lederschiene mit Bronzering, dunkle Pfote
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const arm = pivot('arm' + side, torso, s * 0.32, 0.44, 0), elbow = pivot('elbow' + side, arm, 0, -0.24, 0);
    const ub = new Builder();
    el(ub, O, 0.085, 0.15, 0.085, 0, -0.12, 0);
    el(ub, BR, 0.125, 0.1, 0.125, 0, 0.02, 0);
    mesh(ub, arm);
    const fb = new Builder();
    el(fb, O, 0.08, 0.1, 0.08, 0, -0.04, 0);
    cy(fb, BR, 0.1, 0.085, 0.1, 0, -0.09, 0); el(fb, BR, 0.105, 0.045, 0.105, 0, -0.03, 0);
    ring(fb, BZ, 0.105, 0, -0.04, 0);
    el(fb, DK, 0.095, 0.1, 0.105, 0, -0.19, 0.01);
    for (const [fx, fy, fz] of [[-0.05, -0.26, 0.07], [0, -0.27, 0.08], [0.05, -0.26, 0.07]]) el(fb, DK, 0.035, 0.04, 0.045, fx, fy, fz);
    mesh(fb, elbow);
    pivot('hand' + side, elbow, 0, -0.22, 0.03);
  }

  // --- Kopf: Schädel, Schnauze, Wangenbüschel, Nase, Brauen, Lider, Ohren, Haarschopf
  const hb = new Builder();
  el(hb, O, 0.32, 0.285, 0.295, 0, 0, 0);
  el(hb, O, 0.07, 0.05, 0.07, -0.2, -0.14, 0.12, 0, 0, 0.6); el(hb, O, 0.07, 0.05, 0.07, 0.2, -0.14, 0.12, 0, 0, -0.6);
  el(hb, CR, 0.15, 0.115, 0.17, 0, -0.075, 0.26); el(hb, CR, 0.085, 0.06, 0.1, 0, -0.15, 0.3);
  for (const s of [-1, 1]) {
    co(hb, CR, 0.075, 0.2, 0.075, s * 0.27, -0.1, 0.08, 0, 0, -s * 1.95);
    co(hb, CR, 0.06, 0.17, 0.06, s * 0.25, -0.17, 0.05, 0, 0, -s * 2.4);
    bx(hb, DK, 0.09, 0.014, 0.022, s * 0.13, 0.165, 0.245, 0, 0, -s * 0.1);     // Braue
    el(hb, DK, 0.098, 0.02, 0.045, s * 0.128, 0.142, 0.255, 0, 0, s * 0.12);    // Lid
  }
  el(hb, DK, 0.05, 0.038, 0.042, 0, -0.04, 0.425);                               // Nase
  el(hb, 0x6a5a58, 0.012, 0.008, 0.008, -0.012, -0.025, 0.455);
  for (let i = 0; i < 9; i++) {   // gefegter Haarschopf
    const a = (i - 4) * 0.3, r = Math.abs(i - 4);
    co(hb, OD, 0.075, 0.27 - r * 0.014, 0.075, Math.sin(a) * 0.15, 0.26 - r * 0.012, Math.cos(a) * 0.09 - 0.01, -0.42 + r * 0.05, 0, -a * 0.9);
  }
  mesh(hb, head);
  for (const s of [1, -1]) {
    const ear = pivot('ear' + (s > 0 ? 'L' : 'R'), head, s * 0.17, 0.2, -0.02);
    ear.rotation.set(-0.05, 0, -s * 0.3);
    const eb = new Builder();
    co(eb, O, 0.145, 0.5, 0.1, 0, 0.22, 0);
    co(eb, CR, 0.09, 0.38, 0.05, 0, 0.2, 0.05);
    co(eb, BR, 0.04, 0.07, 0.03, 0, 0.5, 0);
    mesh(eb, ear);
  }
  // Augen eigenes Netz (Blinzeln), Mund eigenes Netz (Sprechen)
  const ey = new Builder();
  for (const s of [-1, 1]) {
    el(ey, 0xffffff, 0.088, 0.108, 0.055, s * 0.128, 0.005, -0.015);
    el(ey, EYE, 0.07, 0.092, 0.04, s * 0.128, 0, 0.012);
    el(ey, 0x0a0a10, 0.034, 0.06, 0.022, s * 0.128, -0.002, 0.037);
    el(ey, 0xffffff, 0.017, 0.017, 0.012, s * 0.128 - 0.02, 0.038, 0.05); el(ey, 0xffffff, 0.009, 0.009, 0.008, s * 0.128 + 0.022, -0.04, 0.052);
  }
  const eyes = new THREE.Group(); eyes.position.set(0, 0.03, 0.25); head.add(eyes); bones.eyes = eyes; mesh(ey, eyes);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3a1a1a }));
  mouth.scale.set(1.4, 0.3, 0.5); mouth.position.set(0, -0.125, 0.36); head.add(mouth); bones.mouth = mouth;

  // --- Schwanz: buschig, dunkler Ring, helle Spitze (eine Kette, ein Netz)
  const tail = pivot('tail', hips, 0, 0.04, -0.2); tail.rotation.x = 0.55;
  const tl = new Builder(), rad = [0.12, 0.19, 0.245, 0.265, 0.225], M = new THREE.Matrix4();
  for (let i = 0; i < 5; i++) {
    if (i) M.multiply(new THREE.Matrix4().makeTranslation(0, 0.02, -0.24)).multiply(new THREE.Matrix4().makeRotationX(0.2));
    tl.add(SPH, i === 2 ? OD : i >= 3 ? CR : O, M.clone().multiply(matrix(0, 0, -0.12, 0, 0, 0, rad[i], rad[i], rad[i] * 1.5)));
  }
  mesh(tl, tail);

  return { root, fig, bones, dims: { s: scale, legLen: 0.58, stoop: 0, headR: 0.29 * scale } };
}
