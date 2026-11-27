/* Wasserturm und Brunnen statt KayKit-Spielzeug: einfache, maßstäbliche Formen mit Foto-Texturen
   (Holzdauben Poly Haven „dark_wooden_planks“, Beton/Stein aus den Gehwegplatten, Wasser wie das Meer). */
import { Mesh, PBRMaterial, Color3, Vector3, CreateLathe, type Scene } from '../engine/bjs';
import { box, cyl } from '../engine/geo';
import { worldTex, waterSurface } from '../engine/surfaces';

function photo(sc: Scene, name: string, file: string, u: number, v: number, tint: Color3, rough: number, rot = 0) {
  const m = new PBRMaterial(name, sc), c = worldTex(sc, file + '_col.jpg').clone(), n = worldTex(sc, file + '_nor.jpg').clone();
  for (const t of [c, n]) { t.uScale = u; t.vScale = v; t.wAng = rot; }
  m.albedoTexture = c; m.bumpTexture = n; m.invertNormalMapY = true; m.albedoColor = tint; m.roughness = rough; m.metallic = 0;
  return m;
}
const merge = (ms: Mesh[], name: string) => { const m = Mesh.MergeMeshes(ms, true, true)!; m.name = name; return m; };

/** Wassertank auf Stahlbeinen wie auf den Dächern von New York (Maße in Metern, Fuß bei y = 0): Quellen zum Instanzieren */
export function waterTowerParts(sc: Scene) {
  const steel = new PBRMaterial('towerSteel', sc); steel.albedoColor = new Color3(.16, .15, .14); steel.roughness = .55; steel.metallic = .7;
  const parts: Mesh[] = [];
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const l = box(sc, .16, 1.7, .16); l.position.set(x * 1.05, .85, z * 1.05); parts.push(l); }
  for (const r of [Math.PI / 4, -Math.PI / 4]) { const b = box(sc, 2.9, .12, .12); b.position.y = 1.55; b.rotation.y = r; parts.push(b); }
  for (const y of [2.15, 2.95, 3.75]) { const b = cyl(sc, 1.53, 1.53, .06, 24); b.position.y = y; parts.push(b); }
  const ladder = box(sc, .05, 3.1, .05); ladder.position.set(1.62, 2.95, .18); parts.push(ladder);
  const ladder2 = ladder.clone('l2'); ladder2.position.z = -.18; parts.push(ladder2);
  const frame = merge(parts, 'towerSteel'); frame.material = steel;
  const tank = cyl(sc, 1.48, 1.52, 2.6, 24); tank.position.y = 3.05;
  const deck = cyl(sc, 1.7, 1.7, .12, 24); deck.position.y = 1.7;
  const wood = merge([tank, deck], 'towerWood'); wood.material = photo(sc, 'towerWood', 'tank_wood', 5, 1.4, new Color3(1, .95, .9), .9, Math.PI / 2);
  const roof = merge([cyl(sc, .06, 1.62, .8, 24), (() => { const k = cyl(sc, .1, .1, .25, 8); k.position.y = .5; return k; })()], 'towerRoof');
  roof.position.y = 4.75; roof.bakeCurrentTransformIntoVertices();
  roof.material = photo(sc, 'towerRoof', 'asphalt', 2, 1, new Color3(.5, .48, .46), .85);
  return [frame, wood, roof];
}

/** Brunnen aus Kunststein: Becken mit Rand, Wasser, Säule mit zwei Schalen. Liefert die Wellen-Bewegung je Bild. */
export function fountain(sc: Scene, x: number, z: number, add: (m: Mesh, cast?: boolean) => void) {
  const stone = photo(sc, 'fountainStone', 'paving', 3, 1, new Color3(1.05, 1, .95), .75);
  const top = photo(sc, 'fountainStone2', 'paving', 2, 1, new Color3(1.05, 1, .95), .75);
  const lathe = (name: string, prof: Array<[number, number]>, tess = 40) => CreateLathe(name, { shape: prof.map(([r, y]) => new Vector3(r, y, 0)), tessellation: tess, closed: true }, sc);
  // Becken: Außenwand mit Profil, breiter Rand zum Sitzen, Innenwand
  const basin = lathe('fountainBasin', [[2.35, 0], [3.05, 0], [3.05, .1], [2.95, .18], [2.95, .55], [3.15, .62], [3.15, .78], [2.8, .82], [2.6, .78], [2.6, .25], [0, .25]]);
  basin.material = stone; basin.position.set(x, .1, z); add(basin);
  // Säule mit zwei Schalen und Knauf
  const col = lathe('fountainColumn', [[0, 0], [.55, 0], [.55, .15], [.32, .3], [.26, 1.2], [.3, 1.35], [1.25, 1.55], [1.3, 1.68], [1.05, 1.68], [.25, 1.6], [.2, 2.25], [.22, 2.32], [.7, 2.45], [.74, 2.55], [.55, 2.55], [.14, 2.5], [.12, 2.8], [.2, 2.9], [.08, 3.1], [0, 3.15]], 32);
  col.material = top; col.position.set(x, .35, z); add(col);
  // Wasser im Becken und in den Schalen
  const wm = new PBRMaterial('fountainWater', sc); wm.albedoColor = new Color3(.1, .32, .38); wm.alpha = .88;
  const wave = waterSurface(wm, sc, 6, 6);
  for (const [r, y] of [[2.62, .74], [1.08, 1.98], [.57, 2.86]]) { const w = cyl(sc, r, r, .02, 32); w.material = wm; w.position.set(x, y, z); add(w, false); }
  // Wasserschleier: fällt von der unteren Schale ins Becken
  const veil = cyl(sc, 1.3, 1.42, 1.28, 32, false); veil.position.set(x, 1.38, z);
  const vm = new PBRMaterial('fountainVeil', sc); vm.albedoColor = new Color3(.75, .9, 1); vm.alpha = .22; vm.roughness = .1; vm.metallic = 0; vm.backFaceCulling = false;
  const vt = worldTex(sc, 'water_nor.jpg').clone(); vt.uScale = 6; vt.vScale = 1.5; vm.bumpTexture = vt; veil.material = vm; add(veil, false);
  return (t: number) => { wave(t); vt.vOffset = -t * .9; };
}
