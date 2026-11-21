/* Spuren wilder Nächte in fremden Schlafzimmern (18+): zerwühlte Decke, aufgerissene Kondomverpackungen,
   gebrauchte Kondome als kleine stilisierte Ringe, Unterhosen in der Ecke, umgekipptes Gleitgel.
   Und der Darkroom: rotes Licht, Nebel, Silhouetten, Lichtschlitze. Alles aus Grundformen, zusammengefasst und eingefroren. */
import { Mesh, PointLight, Vector3, Color3, type Scene, type TransformNode } from '../engine/bjs';
import { box, cyl, torus, sphere, planeZ, pbr, glow, ring, canvasTex } from '../engine/geo';

const freeze = (parts: Mesh[]) => {
  let m: Mesh | null = null;
  try { m = Mesh.MergeMeshes(parts, true, true, undefined, false, true); } catch { /* einzeln lassen */ }
  if (!m) { const root = new Mesh('spuren', parts[0]?.getScene()); parts.forEach((p) => { p.parent = root; p.isPickable = false; }); return root; }
  { m.isPickable = false; m.freezeWorldMatrix(); m.receiveShadows = true; }
  return m;
};

/** Unordnung rund um ein Doppelbett (Mitte x/z, Bett ca. 1,6 × 2 m); gibt das Mesh zum Ein- und Ausschalten zurück */
export function bedMess(sc: Scene, bx: number, bz: number, seed = 1): Mesh | null {
  let r = seed * 7919 + 13; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const parts: Mesh[] = [];
  const add = (m: Mesh, mat: ReturnType<typeof pbr>, x: number, y: number, z: number, ry = 0, rx = 0) => { m.material = mat; m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parts.push(m); };
  const duvet = pbr(sc, [0xf4f0ff, 0xffe0ef, 0xdff4ff][seed % 3], .95), foil = pbr(sc, 0xd8d8e8, .25, .9), foil2 = pbr(sc, 0xffc83d, .3, .8);
  // zerwühlte Decke: schräge Wülste über dem Bett, ein Zipfel hängt runter
  for (let i = 0; i < 5; i++) { const w = sphere(sc, .32 + rnd() * .12, 8); w.scaling.set(1.3, .42, 1); add(w, duvet, bx - .5 + rnd() * 1, .6 + rnd() * .05, bz - .2 + rnd() * .9, rnd() * 3); }
  add(box(sc, .9, .05, .7), duvet, bx + .9, .35, bz + .5, .4, 1.2);
  add(box(sc, .5, .14, .34), pbr(sc, 0xffffff, .9), bx - .55, .66, bz - .75, .5, .25);   // Kissen schief
  // Kondomverpackungen: aufgerissen auf Nachttisch, Bett und Boden
  for (let i = 0; i < 4; i++) { const onBed = i < 2; add(box(sc, .11, .008, .11), i % 2 ? foil2 : foil, bx + (onBed ? -.4 + rnd() * .8 : 1 + rnd() * .7), onBed ? .7 : .012, bz + (onBed ? rnd() * .8 : -.6 + rnd() * 1.6), rnd() * 3); }
  // gebrauchte Kondome: kleine, stilisierte Ringe (nichts Anatomisches)
  for (let i = 0; i < 2; i++) add(torus(sc, .05, .016, 12), pbr(sc, 0xf3e6c8, .5, 0, { alpha: .85 }), bx + 1.1 + rnd() * .5, .02, bz + .7 - rnd() * .6);
  // Unterhosen in der Ecke und am Bettende
  const under = [0xff2f7a, 0x1aa7ff, 0x16161c, 0xffd23b];
  for (let i = 0; i < 3; i++) add(box(sc, .3, .03, .22), pbr(sc, under[(seed + i) % 4], .8), bx + (i === 2 ? -1.4 : 1.3 + i * .35), .02, bz + (i === 2 ? 1.6 : 1.4 - i * .2), rnd() * 3);
  add(box(sc, .5, .03, .7), pbr(sc, 0x2b2b38, .9), bx - 1.3, .02, bz + .9, .7);                // Jeans
  add(box(sc, .14, .05, .3), pbr(sc, 0xffffff, .8), bx + .3, .03, bz + 1.5, 1.3);              // Socke
  add(cyl(sc, .06, .06, .22, 10), pbr(sc, 0x5ce1ff, .3, 0, { alpha: .8 }), bx + 1.05, .06, bz - .9, .3, Math.PI / 2);   // Gleitgel, umgekippt
  return freeze(parts);
}

/** Darkroom: Trennwände mit Lichtschlitzen, rote Glühbirnen, Nebelschwaden, schwarze Silhouetten im Gegenlicht */
export function darkroom(sc: Scene, W: number, D: number) {
  sc.fogMode = 2; sc.fogDensity = .12; sc.fogColor = new Color3(.16, .02, .04);
  const parts: Mesh[] = [];
  const wall = pbr(sc, 0x0c0608, .95);
  for (const [x, z, w, d] of [[-2.6, -1.4, .14, 3.4], [1.2, 1.2, .14, 3.2], [-4, 1.6, 2.4, .14], [3.4, -2, 2.6, .14]] as const) { const m = box(sc, w, 2.6, d); m.material = wall; m.position.set(x, 1.3, z); parts.push(m); }
  freeze(parts);
  // Lichtschlitze und Glühbirnen: Gegenlicht, damit Menschen als Schatten erscheinen
  for (const [x, z, ry] of [[0, -D / 2 + .05, 0], [-W / 2 + .05, 0, Math.PI / 2], [W / 2 - .05, -1, -Math.PI / 2]] as const) {
    const s = planeZ(sc, 2.6, .08); s.material = glow(sc, 0xff1030, 2.2); s.position.set(x, .25, z); s.rotation.y = ry;
    const t = planeZ(sc, 3.6, 2.2); t.material = glow(sc, 0x7a0618, .9, { alpha: .5 }); t.position.set(x + (ry ? 0 : 0), 1.3, z + (ry ? 0 : .02)); t.rotation.y = ry;
  }
  const bulbs: PointLight[] = [];
  for (const [x, z] of [[-3.8, -2.6], [2.6, 2.4], [0, 0]]) {
    const b = sphere(sc, .07, 8); b.material = glow(sc, 0xff2040, 2.5); b.position.set(x, 2.7, z);
    const l = new PointLight('rot', new Vector3(x, 2.5, z), sc); l.diffuse = new Color3(1, .08, .12); l.intensity = 3; l.range = 6; bulbs.push(l);
  }
  // Nebel am Boden: halbdurchsichtige Schwaden, die langsam treiben
  const fogM = glow(sc, 0x501020, .35, { alpha: .22 });
  const wisps = Array.from({ length: 7 }, (_, i) => { const m = planeZ(sc, 3.4, 1.2, true); m.material = fogM; m.position.set(-4 + i * 1.4, .45 + (i % 3) * .2, -2.4 + (i % 4) * 1.5); m.rotation.y = i * .9; m.isPickable = false; return m; });
  return (t: number) => {
    bulbs.forEach((l, i) => (l.intensity = 2.4 + Math.sin(t * 2.2 + i * 2) * .9 + (Math.sin(t * 17 + i) > .96 ? -1.5 : 0)));
    wisps.forEach((m, i) => { m.position.x += Math.sin(t * .3 + i) * .004; m.rotation.y += .0015; });
  };
}

/** Sexarbeit klar erkennbar (18+): rotes Leuchtschild über dem Kopf (Name, Angebot) und roter Lichtkreis am Boden */
export function escortSign(sc: Scene, parent: TransformNode, title: string, sub: string, color: string) {
  const tex = canvasTex(sc, 512, 160, (g) => {
    g.fillStyle = 'rgba(30,0,12,.78)'; g.beginPath(); g.roundRect(8, 8, 496, 144, 36); g.fill();
    g.strokeStyle = color; g.lineWidth = 8; g.shadowColor = color; g.shadowBlur = 22; g.stroke();
    g.shadowBlur = 14; g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = '900 58px system-ui, sans-serif'; g.fillText(title, 256, 76, 470);
    g.font = '700 34px system-ui, sans-serif'; g.fillStyle = color; g.fillText(sub, 256, 126, 470);
  }, true);
  const p = planeZ(sc, 1.25, .39, true); p.material = glow(sc, 0xffffff, 1.3, { tex }); p.parent = parent; p.position.y = 2.25; p.billboardMode = 7; p.isPickable = false;
  const r = ring(sc, .45, .62, 28); r.material = glow(sc, color, 1.6, { alpha: .55 }); r.parent = parent; r.position.y = .04; r.isPickable = false;
  return p;
}
