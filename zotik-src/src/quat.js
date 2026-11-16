/* Quaternius-Figuren (CC0, quaternius.com): ein animiertes Basismodell (models/qr/qr.glb), je Rolle/Welt anders eingefärbt und mit Zubehör ausgestattet.
   Alle Figuren teilen Geometrie und Animationsclips; Farben/Zubehör sind pro Figur nur wenige Materialien/Meshes. Zotik selbst bleibt beim eigenen Modell. */
export const QCLIP = { Idle_A: 'Idle', Walking_A: 'Walk', Running_A: 'Run', Death_A: 'Death', Hit_A: 'RecieveHit', Interact: 'PickUp', Throw: 'Dagger_Attack', Use_Item: 'PickUp', Spawn_Ground: 'Idle', Attack: 'Dagger_Attack2' };
const MAT = { hair: 'Hair', skin: 'Skin', under: 'UnderShirt', pants: 'Pants', top: 'Shirt', detail: 'Detail', boots: 'Boots', cloth: 'Material.006' };
export function qualify(T, G, TOUCH) {
  const cache = new Map();
  const toon = (col, k) => { const key = k + col; if (!cache.has(key)) cache.set(key, new T.MeshToonMaterial({ color: new T.Color(col).convertSRGBToLinear(), gradientMap: G, skinning: k === 's' })); return cache.get(key); };
  /** Rolle anwenden: pal = {hair,skin,under,pants,top,detail,boots,cloth} (Hex), Zubehör über acc(list) */
  const hid = new T.MeshBasicMaterial({ visible: false });
  function paint(scene, pal) {
    scene.traverse(m => { if (!m.isMesh) return; const skin = !!m.isSkinnedMesh; m.castShadow = !TOUCH; m.frustumCulled = false;
      const f = mt => { const n = mt.name; if (pal.noeyes && (n === 'Eye' || n === 'Pupil' || n === 'White')) return hid; for (const r in MAT) if (MAT[r] === n && pal[r] != null) return toon(pal[r], skin ? 's' : 'n'); const k = skin ? 's' : 'n', key = k + 'o' + mt.name; if (!cache.has(key)) cache.set(key, new T.MeshToonMaterial({ color: mt.color.clone(), gradientMap: G, skinning: skin })); return cache.get(key); };
      m.material = Array.isArray(m.material) ? m.material.map(f) : f(m.material); });
  }
  const M = (col, o = {}) => toon(col, 'n');
  const mesh = (g, col, p, s, r) => { const m = new T.Mesh(g, M(col)); if (p) m.position.set(...p); if (s) m.scale.set(...s); if (r) m.rotation.set(...r); m.castShadow = !TOUCH; return m; };
  const geo = { box: new T.BoxBufferGeometry(1, 1, 1), sph: new T.SphereBufferGeometry(.5, 12, 8), cone: new T.ConeBufferGeometry(.5, 1, 12), cyl: new T.CylinderBufferGeometry(.5, .5, 1, 12), tor: new T.TorusBufferGeometry(.5, .08, 6, 16), wing: new T.CircleBufferGeometry(.5, 12) };
  /* Zubehör in Kopf-/Rumpf-Koordinaten (Meter, Figur ~1,8 m, Blick nach +z); wird an Knochen gehängt, Skalierung gleicht attach() aus */
  const ACC = {
    krone: c => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.2, .07, .2])); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.add(mesh(geo.cone, c, [Math.sin(a) * .1, .07, Math.cos(a) * .1], [.045, .1, .045])); } return g; },
    spitzhut: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.46, .025, .46])); g.add(mesh(geo.cone, c, [0, .22, 0], [.26, .46, .26])); g.add(mesh(geo.tor, b || 0xe8c040, [0, .03, 0], [.27, .27, .5], [1.57, 0, 0])); g.children[1].rotation.z = .12; return g; },
    helm: (c, b) => { const g = new T.Group(); const d = mesh(geo.sph, c, [0, .02, 0], [.3, .27, .3]); g.add(d); g.add(mesh(geo.box, b || c, [0, -.02, .15], [.03, .15, .02])); g.add(mesh(geo.cone, b || 0xc03030, [0, .2, -.02], [.05, .2, .05])); return g; },
    muetze: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, .02, 0], [.3, .2, .3])); g.add(mesh(geo.box, c, [0, -.04, .17], [.2, .02, .12])); return g; },
    dreispitz: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cone, c, [0, .06, 0], [.4, .16, .34], [0, 0, 0])); g.children[0].rotation.y = .78; g.children[0].scale.set(.4, .16, .4); g.add(mesh(geo.tor, b || 0xe8c040, [0, 0, 0], [.32, .32, .6], [1.57, 0, 0])); return g; },
    kapuze: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, .0, -.03], [.34, .34, .36])); const f = mesh(geo.sph, 0x2a2018, [0, -.02, .1], [.2, .22, .12]); g.add(f); return g; },
    schleife: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [-.06, 0, 0], [.1, .08, .06])); g.add(mesh(geo.sph, c, [.06, 0, 0], [.1, .08, .06])); g.add(mesh(geo.sph, c, [0, 0, 0], [.04, .04, .04])); return g; },
    blume: c => { const g = new T.Group(); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.add(mesh(geo.sph, c, [Math.sin(a) * .045, Math.cos(a) * .045, 0], [.05, .05, .02])); } g.add(mesh(geo.sph, 0xffe060, [0, 0, .005], [.04, .04, .03])); return g; },
    klappe: c => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.07, .01, .07], [1.57, 0, 0])); g.add(mesh(geo.box, c, [0, .02, -.02], [.3, .012, .012], [0, 0, .25])); return g; },
    bart: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, -.31, .06], [.21, .14, .13])); return g; },
    cape: (c, b) => { const g = new T.Group(); g.add(mesh(geo.box, c, [0, -.38, -.0], [.42, .8, .035])); g.add(mesh(geo.box, b || c, [0, -.38, .001], [.1, .8, .037])); g.rotation.x = .07; return g; },
    schuerze: c => { const g = new T.Group(); g.add(mesh(geo.box, c, [0, -.2, 0], [.34, .5, .02])); return g; },
    rock: c => { const g = new T.Group(); g.add(mesh(geo.cone, c, [0, -.1, 0], [.5, .26, .5])); return g; },
    flosse: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, -.3, 0], [.42, .8, .36])); for (const s of [-1, 1]) { g.add(mesh(geo.sph, c, [s * .3, -.5, -.05], [.62, .3, .08], [0, 0, s * -.7])); g.add(mesh(geo.sph, c, [s * .16, -.62, -.1], [.36, .2, .08], [0, 0, s * -.3])); } return g; },
    kragen: c => { const g = new T.Group(); g.add(mesh(geo.tor, c, [0, 0, 0], [.34, .34, .8], [1.57, 0, 0])); return g; },
    ruestung: (c, b) => { const g = new T.Group(); g.add(mesh(geo.box, c, [0, 0, 0], [.36, .38, .24])); g.add(mesh(geo.sph, c, [-.24, .14, 0], [.2, .16, .2])); g.add(mesh(geo.sph, c, [.24, .14, 0], [.2, .16, .2])); g.add(mesh(geo.box, b || 0xe8c040, [0, 0, .122], [.08, .3, .01])); return g; },
    guertel: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.34, .06, .22])); g.add(mesh(geo.box, b || 0xe8c040, [0, 0, .115], [.07, .06, .02])); return g; },
    fluegel: (c, o = 1) => { const g = new T.Group(); for (const s of [-1, 1]) { const w = mesh(geo.wing, c, [s * .24, .08, 0], [.42 * o, .74 * o, 1], [0, 0, s * .5]); w.material = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .7, side: T.DoubleSide }); g.add(w); const w2 = mesh(geo.wing, c, [s * .2, -.14, 0], [.26 * o, .42 * o, 1], [0, 0, s * -.4]); w2.material = w.material; g.add(w2); } return g; },
    spitzohren: c => { const g = new T.Group(); for (const s of [-1, 1]) g.add(mesh(geo.cone, c, [s * .17, .0, 0], [.07, .22, .035], [0, 0, -s * 1.1])); return g; },
    stab: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.04, 1.5, .04])); g.add(mesh(geo.sph, b || 0x60e0ff, [0, .8, 0], [.16, .16, .16])); return g; },
    schwert: (c, b) => { const g = new T.Group(); g.add(mesh(geo.box, c, [0, .35, 0], [.07, .7, .015])); g.add(mesh(geo.box, b || 0x8a6a30, [0, 0, 0], [.22, .04, .04])); g.add(mesh(geo.cyl, b || 0x8a6a30, [0, -.1, 0], [.04, .18, .04])); return g; },
    saebel: c => { const g = new T.Group(); g.add(mesh(geo.box, c, [.02, .32, 0], [.05, .64, .012], [0, 0, -.12])); g.add(mesh(geo.box, 0x8a6a30, [0, 0, 0], [.16, .03, .03])); return g; },
    bogen: c => { const g = new T.Group(); const a = new T.Mesh(new T.TorusBufferGeometry(.42, .018, 6, 20, 2.6), M(c)); a.rotation.z = 1.57 - 1.3; g.add(a); return g; },
    schild: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.46, .04, .46], [1.57, 0, 0])); g.add(mesh(geo.cyl, b || 0xe8c040, [0, 0, .03], [.14, .04, .14], [1.57, 0, 0])); return g; },
    sack: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, 0, 0], [.4, .46, .3])); g.add(mesh(geo.sph, 0xe8d8a0, [0, .24, 0], [.12, .08, .12])); return g; },
    laterne: c => { const g = new T.Group(); g.add(mesh(geo.box, 0x2a2a30, [0, 0, 0], [.1, .14, .1])); const m = mesh(geo.sph, c, [0, 0, 0], [.12, .12, .12]); m.material = new T.MeshBasicMaterial({ color: c }); g.add(m); return g; },
    buch: c => { const g = new T.Group(); g.add(mesh(geo.box, c, [0, 0, 0], [.2, .26, .05])); g.add(mesh(geo.box, 0xf4ecd0, [.012, 0, 0], [.18, .24, .045])); return g; },
    /* weiche Frisuren-Ergänzungen: das Originalhaar des Modells bleibt, dazu lange Partien, Zopf, Dutt, Zöpfe (alles runde Formen) */
    h_long: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, -.34, -.1], [.38, .62, .22])); for (const s of [-1, 1]) g.add(mesh(geo.sph, c, [s * .19, -.27, -.03], [.1, .4, .16])); return g; },
    h_zopf: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, -.17, -.17], [.13, .13, .13])); g.add(mesh(geo.sph, c, [0, -.36, -.22], [.1, .36, .1], [.2, 0, 0])); g.add(mesh(geo.sph, 0xffffff, [0, -.19, -.17], [.05, .05, .05])); return g; },
    h_dutt: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, .02, -.09], [.2, .18, .2])); return g; },
    h_zoepfe: c => { const g = new T.Group(); for (const s of [-1, 1]) { g.add(mesh(geo.sph, c, [s * .21, -.3, -.04], [.1, .38, .1], [0, 0, s * .12])); g.add(mesh(geo.sph, 0xff6a9a, [s * .21, -.14, -.04], [.06, .05, .06])); } return g; },
    h_bob: c => { const g = new T.Group(); for (const s of [-1, 1]) g.add(mesh(geo.sph, c, [s * .18, -.2, -.03], [.1, .24, .2])); g.add(mesh(geo.sph, c, [0, -.2, -.15], [.32, .26, .12])); return g; },
    nase: c => { const g = new T.Group(); g.add(mesh(geo.cone, c, [0, -.2, .16], [.05, .26, .05], [1.57, 0, 0])); return g; },
    zylinder: (c, b) => { const g = new T.Group(); g.add(mesh(geo.cyl, c, [0, 0, 0], [.46, .02, .46])); g.add(mesh(geo.cyl, c, [0, .2, 0], [.27, .4, .27])); g.add(mesh(geo.cyl, b || 0xe8c040, [0, .06, 0], [.285, .08, .285])); return g; },
    turban: (c, b) => { const g = new T.Group(); g.add(mesh(geo.sph, c, [0, .04, 0], [.36, .26, .36])); g.add(mesh(geo.sph, b || 0xe8c040, [0, .16, .12], [.07, .07, .05])); return g; },
    langohr: c => { const g = new T.Group(); for (const s of [-1, 1]) g.add(mesh(geo.sph, c, [s * .08, .26, 0], [.07, .46, .035], [0, 0, -s * .12])); return g; },
    katzenohr: c => { const g = new T.Group(); for (const s of [-1, 1]) g.add(mesh(geo.cone, c, [s * .12, .1, 0], [.08, .14, .05], [0, 0, -s * .3])); return g; },
    feder: c => { const g = new T.Group(); g.add(mesh(geo.sph, c, [.12, .14, -.02], [.035, .3, .07], [0, 0, -.5])); return g; },
    stern: c => { const g = new T.Group(); const m = mesh(geo.sph, c, [0, 0, 0], [.1, .1, .03]); m.material = new T.MeshBasicMaterial({ color: c }); g.add(m); return g; },
  };
  /* Gesicht als gezeichnete Textur (große Augen, Brauen, Nase, Mund) auf einem Kopfmuster – keine Geometrie, ein Material je Gesichtstyp */
  const ftex = new Map(), hex = c => '#' + (c & 0xffffff).toString(16).padStart(6, '0');
  function faceTex(p) {
    const key = [p.eye, p.brow, p.mouth, p.female ? 1 : 0, p.blush ? 1 : 0].join(); if (ftex.has(key)) return ftex.get(key);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d');
    for (const s of [-1, 1]) { const cx = 128 + s * 58, cy = 58;
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx, cy, 16, 19, 0, 0, 6.283); x.fill();
      const g = x.createLinearGradient(0, cy - 26, 0, cy + 26); g.addColorStop(0, hex(p.eye)); g.addColorStop(1, hex(p.eye | 0)); x.fillStyle = hex(p.eye); x.beginPath(); x.ellipse(cx, cy + 2, 12, 16.5, 0, 0, 6.283); x.fill();
      x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(cx, cy - 9, 12, 8.5, 0, 0, 6.283); x.fill();
      x.fillStyle = '#1a1420'; x.beginPath(); x.ellipse(cx, cy + 3, 6.2, 9, 0, 0, 6.283); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - 4, cy - 5, 4.2, 0, 6.283); x.fill(); x.beginPath(); x.arc(cx + 5, cy + 9, 2.3, 0, 6.283); x.fill();
      x.strokeStyle = '#2a1a20'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.ellipse(cx, cy, 16, 19, 0, 3.6, 5.8); x.stroke();
      if (p.female) { x.lineWidth = 4; x.beginPath(); x.moveTo(cx + s * 17, cy - 6); x.lineTo(cx + s * 25, cy - 12); x.stroke(); }
      x.strokeStyle = hex(p.brow); x.lineWidth = 4.5; x.beginPath(); x.moveTo(cx - s * 20, cy - 30); x.quadraticCurveTo(cx, cy - 41, cx + s * 18, cy - 33); x.stroke();
      if (p.blush) { x.fillStyle = 'rgba(255,120,130,.28)'; x.beginPath(); x.ellipse(cx + s * 4, cy + 34, 16, 9, 0, 0, 6.283); x.fill(); } }
    x.strokeStyle = 'rgba(120,60,40,.45)'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(122, 92); x.quadraticCurveTo(128, 98, 134, 92); x.stroke();
    x.strokeStyle = '#8a3a3a'; x.fillStyle = '#7a2a2a'; x.lineWidth = 5;
    const m = p.mouth % 4;
    if (m === 0) { x.beginPath(); x.moveTo(104, 106); x.quadraticCurveTo(128, 124, 152, 106); x.stroke(); }
    else if (m === 1) { x.beginPath(); x.moveTo(106, 104); x.quadraticCurveTo(128, 132, 150, 104); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(116, 106, 24, 5); }
    else if (m === 2) { x.beginPath(); x.moveTo(108, 108); x.quadraticCurveTo(130, 118, 152, 100); x.stroke(); }
    else { x.beginPath(); x.moveTo(114, 107); x.quadraticCurveTo(128, 116, 142, 107); x.stroke(); }
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 4; ftex.set(key, t); return t;
  }
  function face(p) { const g = new T.Group(); const R = .19, th = 2.1;
    const m = new T.Mesh(new T.CylinderBufferGeometry(R, R, .2, 24, 1, true, -th / 2, th), new T.MeshBasicMaterial({ map: faceTex(p), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.position.set(0, -.215, 0); g.add(m); return g; }
  const BONE = { head: 'Head', torso: 'Torso', hips: 'Hips', handR: 'FistR', handL: 'FistL', back: 'Torso' };
  const POS = { head: [0, .44, .0], torso: [0, 0, .0], hips: [0, 0, 0], back: [0, 0, -.14] };
  return { paint, face, ACC, BONE, POS, mesh, geo, M, toon };
}
