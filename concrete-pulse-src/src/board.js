// Skateboard: Deck (Ribbon mit Kicktails), Griptape, Unterseiten-Grafik, Achsen, Rollen.
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';

export const DECK_TOP = 0.1;
const L = 0.4, W = 0.105;     // halbe Länge / halbe Breite
const lin = c => Color3.FromHexString(c).toLinearSpace();

function profile(z) {        // Höhe des Decks über der Brettmitte (Kicks an den Enden)
  const a = Math.abs(z), k = Math.max(0, a - 0.27) / 0.13;
  return k * k * 0.06;
}
function halfWidth(z) {
  const a = Math.abs(z), e = a - (L - W);
  if (e <= 0) return W;
  return Math.sqrt(Math.max(0, W * W - e * e)) * 0.999 + 0.0005;
}

function deckPaths(off, thick, uvMode) {
  const paths = [], N = 48, M = 10;
  for (let i = 0; i <= N; i++) {
    const z = -L + (2 * L * i) / N, hw = halfWidth(z), y = profile(z) + off;
    const p = [];
    for (let j = 0; j <= M; j++) { const x = -hw + (2 * hw * j) / M; const c = 1 - (x / W) * (x / W); p.push(new Vector3(x, y + c * 0.004, z)); }
    if (thick) for (let j = M; j >= 0; j--) { const x = -hw + (2 * hw * j) / M; p.push(new Vector3(x, y - thick, z)); }
    paths.push(p);
  }
  return paths;
}

function graphicTexture(scene, design) {
  const t = new DynamicTexture('deckart', { width: 128, height: 512 }, scene, true);
  const g = t.getContext();
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, design.c1); grad.addColorStop(1, design.c2);
  g.fillStyle = grad; g.fillRect(0, 0, 128, 512);
  g.globalAlpha = 0.9;
  if (design.pattern === 'stripes') { g.fillStyle = design.c3; for (let i = -4; i < 20; i++) { g.save(); g.translate(64, i * 40); g.rotate(-0.5); g.fillRect(-120, 0, 240, 14); g.restore(); } }
  else if (design.pattern === 'dots') { g.fillStyle = design.c3; for (let y = 20; y < 512; y += 28) for (let x = 12 + ((y / 28) % 2) * 14; x < 128; x += 28) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); } }
  else if (design.pattern === 'wave') { g.strokeStyle = design.c3; g.lineWidth = 10; for (let k = 0; k < 6; k++) { g.beginPath(); for (let y = 0; y <= 512; y += 8) g.lineTo(64 + Math.sin(y / 40 + k) * 40, y); g.stroke(); } }
  else if (design.pattern === 'bolt') { g.fillStyle = design.c3; g.beginPath(); g.moveTo(80, 60); g.lineTo(30, 270); g.lineTo(70, 270); g.lineTo(44, 450); g.lineTo(104, 220); g.lineTo(62, 220); g.closePath(); g.fill(); }
  else if (design.pattern === 'grid') { g.strokeStyle = design.c3; g.lineWidth = 3; for (let i = 0; i < 512; i += 24) { g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } for (let i = 0; i < 128; i += 24) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); } }
  // Schriftzug
  g.save(); g.translate(64, 256); g.rotate(Math.PI / 2); g.globalAlpha = 1;
  g.font = '900 44px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(design.label || 'PULSE', 0, 0);
  g.fillStyle = design.text || '#ffffff'; g.fillText(design.label || 'PULSE', 0, 0); g.restore();
  t.update(); t.wrapU = t.wrapV = 0; return t;
}

const sharedMats = new WeakMap();   // je Szene eigene Materialien
function mat(scene, key, f) { let m = sharedMats.get(scene); if (!m) sharedMats.set(scene, m = {}); return m[key] || (m[key] = f()); }

export function makeBoard(scene, design, shadow) {
  const root = new TransformNode('board', scene);
  const deck = new TransformNode('deck', scene); deck.parent = root; deck.position.y = 0.085;
  const wood = mat(scene, 'wood', () => { const m = new PBRMaterial('wood', scene); m.albedoColor = lin('#d9a86a'); m.roughness = 0.6; m.metallic = 0; return m; });
  const body = MeshBuilder.CreateRibbon('deckBody', { pathArray: deckPaths(0.012, 0.012), closePath: true, sideOrientation: Mesh.DOUBLESIDE }, scene);
  body.material = wood; body.parent = deck;
  const grip = MeshBuilder.CreateRibbon('grip', { pathArray: deckPaths(0.0125, 0) }, scene);
  grip.material = mat(scene, 'grip', () => { const m = new PBRMaterial('grip', scene); m.albedoColor = lin('#1b1c20'); m.roughness = 0.95; m.metallic = 0; return m; });
  grip.parent = deck;
  // Grafik unten
  const art = MeshBuilder.CreateRibbon('art', { pathArray: deckPaths(-0.0005, 0).map(p => p.slice().reverse()) }, scene);
  const am = new PBRMaterial('artm', scene); am.albedoTexture = graphicTexture(scene, design); am.roughness = 0.35; am.metallic = 0; am.clearCoat.isEnabled = true; am.clearCoat.intensity = 0.6;
  art.material = am; art.parent = deck;
  const metal = mat(scene, 'metal', () => { const m = new PBRMaterial('metal', scene); m.albedoColor = lin('#c9ced6'); m.roughness = 0.3; m.metallic = 1; return m; });
  const wheelM = new PBRMaterial('wheel', scene); wheelM.albedoColor = lin(design.wheel || '#f3f0e6'); wheelM.roughness = 0.45; wheelM.metallic = 0;
  const parts = [body, grip, art];
  for (const z of [-0.23, 0.23]) {
    const base = MeshBuilder.CreateBox('plate', { width: 0.07, height: 0.012, depth: 0.09 }, scene); base.material = metal; base.parent = root; base.position.set(0, 0.079, z);
    const hanger = MeshBuilder.CreateCylinder('hanger', { diameter: 0.026, height: 0.17, tessellation: 10 }, scene); hanger.rotation.z = Math.PI / 2; hanger.material = metal; hanger.parent = root; hanger.position.set(0, 0.045, z);
    const king = MeshBuilder.CreateBox('king', { width: 0.03, height: 0.04, depth: 0.03 }, scene); king.material = metal; king.parent = root; king.position.set(0, 0.06, z + (z > 0 ? -0.015 : 0.015));
    parts.push(base, hanger, king);
    for (const x of [-0.1, 0.1]) {
      const w = MeshBuilder.CreateCylinder('wheel', { diameter: 0.056, height: 0.034, tessellation: 18 }, scene);
      w.rotation.z = Math.PI / 2; w.material = wheelM; w.parent = root; w.position.set(x, 0.028, z); parts.push(w);
    }
  }
  for (const p of parts) { if (shadow) shadow.addShadowCaster(p); p.receiveShadows = true; }
  root.metadata = { wheels: parts.filter(p => p.name === 'wheel') };
  return root;
}
