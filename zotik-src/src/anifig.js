// Anime-Figuren für Zotik: VRoid-Beispielmodelle (CC0, aufbereitet mit tools/make-zotik-figs.mjs → models/*.glb)
// mit Cel-Shading, Kontur und Ausstattung nach den Master-Sheets (Mira, Lyra, Nia, Rovan, Professorium) – abgewandelt, aber erkennbar.
// Haare, Kleidung und Iris sind in den Modellen hell-grau und werden je Figur eingefärbt. Bewegt wird prozedural (Stehen, Gehen, Laufen, Zuschlagen).
// Bis ein Modell geladen ist (oder ohne Netz) bleibt die gebaute Figur sichtbar – nichts hängt davon ab.
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createAniFig({ T, G, TOUCH }) {
  const files = {}, load = k => files[k] || (files[k] = new Promise((res, rej) => new GLTFLoader().load('models/' + k + '.glb', res, null, rej)));
  const C = c => new T.Color(c);
  const OUT = new T.MeshBasicMaterial({ color: 0x1c1622, side: T.BackSide, skinning: true });
  OUT.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed += normal * 0.009;'); };
  const gmat = new Map(), gm = (c, o = {}) => { const k = c + '/' + (o.e || 0) + '/' + (o.ds || 0) + '/' + (o.ei ?? ''); if (!gmat.has(k)) gmat.set(k, new T.MeshToonMaterial({ color: C(c), gradientMap: G, emissive: C(o.e || 0), emissiveIntensity: o.e ? (o.ei ?? 1.5) : 0, side: o.ds ? T.DoubleSide : T.FrontSide })); return gmat.get(k); };
  const hex = n => '#' + (n >>> 0).toString(16).padStart(6, '0');

  // Hauptfiguren (Grundmodell, Farben, Zubehör) nach den Master-Sheets
  const CAST = {
    mira: { m: 'f1', h: 1.65, hair: '#4a86f0', top: '#c8d8ff', bottom: '#22336e', shoes: '#6a4428', acc: '#b06cff', eye: '#3a8cff',
      x: { long: 1, locks: 1, cape: 0x22336e, clip: 0xb06cff, staff: 0x58b8ff } },
    // Lyra nach Master-Sheet: lange rosa Wellen, Blütenspange, dunkles Mieder, offener weiß-goldener Mantel mit violettem Futter, dunkle Strümpfe, braun-goldene Stiefel
    lyra: { m: 'f1', h: 1.66, hair: '#ff9ad0', top: '#2e2c4a', bottom: '#2a2638', shoes: '#7a4a26', acc: '#d8a84a', eye: '#9a5ae0',
      x: { long: 1, locks: 1, waves: 1, clip: 0xb06cff, coat: 0xe6dfe8, coatH: 1.05, lining: 0x6a2aa8, trim: 0xd8a84a, cape: 0x6a2aa8, capeH: 1.05, belt: 0xd8a84a, staff: 0x8ad0ff, boots: 0x7a4a26, cuffs: 0xd8a84a } },
    nia: { m: 'f1', h: 1.6, hair: '#6ac05a', top: '#a8c878', bottom: '#4a6a2a', shoes: '#5a3a22', acc: '#d8b860', eye: '#3aa04a', x: { pony: 1, bow: 1, quiver: 1 } },
    rovan: { m: 'm2', h: 1.8, hair: '#7a4a2a', top: '#5a78b0', bottom: '#4a3424', shoes: '#3a2a1e', eye: '#8a5a30', x: { cape: 0x2a3a5a, sword: 1, shield: 1, pads: 0x8a8a9a } },
    prof: { m: 'm1', h: 1.75, hair: '#f4f4f4', top: '#efe4c8', bottom: '#5a4030', shoes: '#4a3426', acc: '#b98a4a', eye: '#4a7aa0', skin: '#f6e2d6',
      x: { beard: 0xf0f0f0, tufts: 0xf4f4f4, goggles: 1, coat: 0xe8dcc0, pack: 1 } }
  };
  // Steckbrief einer gebauten Dorffigur → Look
  function villagerLook(o) {
    const hs = o.hs ?? (((o.cloth * 7 + (o.hair || 0) * 3 + (o.cloth2 || 0)) >>> 0) % 5), w = o.g === 'f' || (o.g !== 'm' && !o.beard && !o.bald && (hs === 1 || hs === 2 || hs === 3) && (o.wide || 1) < 1.2);   // Frauen nie mit Bart: Bart/Glatze = Mann, g:'f'/'m' setzt es fest
    return { m: w ? 'f1' : 'm1', h: 1.7, hair: hex(o.hair || 0x5a3a26), top: hex(o.cloth), bottom: hex(o.cloth2 || 0x5a3a26), shoes: '#4a3426', acc: hex(o.cloth2 || 0x8a6a3a),
      eye: hex(o.eye || [0x3a6ac8, 0x4a8a3a, 0x7a4a22, 0x5a3a8a][hs % 4]), skin: o.skin ? hex(o.skin) : null,
      x: { pony: hs === 1, long: hs === 2, bun: hs === 3, spikes: hs === 4 && !w, beard: o.beard && !w ? o.hair || 0x5a3a26 : 0, bald: o.bald, hood: o.hood ? o.cloth : 0, hat: o.hat ? o.cloth2 || 0x5a3a26 : 0,
        apron: o.apron, cape: o.cape, pack: o.pack } };
  }

  // Skelett samt Haut klonen (Geometrie und Texturen bleiben geteilt)
  function cloneRig(src) {
    const c = src.clone(true), bones = {};
    c.traverse(o => { if (o.isBone) bones[o.name] = o; });
    c.traverse(o => { if (!o.isSkinnedMesh) return; const sk = o.skeleton; o.bind(new T.Skeleton(sk.bones.map(b => bones[b.name]), sk.boneInverses.map(m => m.clone())), o.bindMatrix.clone()); o.frustumCulled = false; });
    return { scene: c, bones };
  }
  // Materialien: Cel-Shading, Farbe je Teil (zwischengespeichert, damit gleiche Figuren dieselben Materialien teilen)
  const mcache = new Map();
  function matFor(src, L) {
    const n = src.name || '', col = /HAIR|FaceBrow/.test(n) ? L.hair : /Tops/.test(n) ? L.top : /Bottoms/.test(n) ? L.bottom || L.top : /Shoes/.test(n) ? L.shoes : /Accessory/.test(n) ? L.acc || L.top : /EyeIris/.test(n) ? L.eye : /SKIN/.test(n) ? L.skin || '#ffffff' : '#ffffff';
    const k = src.uuid + col; if (mcache.has(k)) return mcache.get(k);
    const basic = /EyeHighlight|EyeWhite/.test(n);
    const m = basic ? new T.MeshBasicMaterial({ map: src.map, color: C(col), skinning: true, transparent: src.transparent, alphaTest: src.alphaTest, depthWrite: !src.transparent })
      : new T.MeshToonMaterial({ map: src.map, color: C(col), gradientMap: G, skinning: true, transparent: src.transparent, alphaTest: src.alphaTest, side: src.side, depthWrite: !src.transparent });
    if (/HAIR/.test(n)) { m.color.multiplyScalar(1.3); m.emissive = C(col).multiplyScalar(.14); }   // Anime-Haar leuchtet kräftig, auch nachts
    m.name = n; mcache.set(k, m); return m;
  }

  // Verjüngte, leicht flach gedrückte Strähne entlang einer Kurve (Anime-Haar, Bänder) – r0 Anfangsdicke, fl Abflachung
  function strand(pts, r0, fl = .55, seg = 10, rad = 8, end = .08) {
    const cv = new T.CatmullRomCurve3(pts), fr = cv.computeFrenetFrames(seg, false), pos = [], idx = [], up = new T.Vector3(0, 0, 1);
    for (let i = 0; i <= seg; i++) { const t = i / seg, p = cv.getPointAt(t), r = r0 * Math.max(end, 1 - t * (1 - end)) * (t < .12 ? .75 + t * 2 : 1);
      const tg = fr.tangents[i], n = new T.Vector3().crossVectors(tg, up); if (n.lengthSq() < 1e-4) n.set(1, 0, 0); n.normalize(); const b = new T.Vector3().crossVectors(tg, n).normalize();
      for (let j = 0; j <= rad; j++) { const a = j / rad * Math.PI * 2, cx = Math.cos(a) * r, cy = Math.sin(a) * r * fl; pos.push(p.x + n.x * cx + b.x * cy, p.y + n.y * cx + b.y * cy, p.z + n.z * cx + b.z * cy); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, c = a + rad + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // Gewand mit Falten: offener Kegelstumpf, vorn offen (Lücke um −Z), Saum schwingt in Falten, Tiefe etwas flacher als Breite
  function robe(rt, rb, h, open = .3, folds = 9, amp = .014, depth = .82) {
    const g = new T.CylinderGeometry(rt, rb, h, 36, 6, true, -Math.PI * (1 - open), Math.PI * 2 * (1 - open)), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = (h / 2 - y) / h, a = Math.atan2(x, z), r = Math.hypot(x, z), k = (r + Math.sin(a * folds) * amp * f * f * 1.6) / (r || 1);
      p.setXYZ(i, x * k, y, z * k * depth); }
    g.translate(0, -h / 2, 0); g.computeVertexNormals(); return g;
  }
  // Zubehör an Knochen (Ruhepose, Modellraum: Blick nach −Z, Rücken = +Z; f = nach vorn in Metern)
  function gear(fig, x) {
    const B = fig.bones, S = fig.scene; S.updateMatrixWorld(true);
    const wp = n => B[n] ? B[n].getWorldPosition(new T.Vector3()) : new T.Vector3();
    const add = (bone, m, p, r) => { const b = B[bone]; if (!b) return m; m.position.copy(p); if (r) m.rotation.set(r[0], r[1], r[2]); m.updateMatrix(); m.matrix.premultiply(b.matrixWorld.clone().invert()); m.matrix.decompose(m.position, m.quaternion, m.scale); b.add(m); m.castShadow = true; fig.extra.push(m); return m; };
    const head = wp('J_Bip_C_Head'), chest = wp('J_Bip_C_UpperChest'), hips = wp('J_Bip_C_Hips'), hr = wp('J_Bip_R_Hand'), hl = wp('J_Bip_L_Hand');
    const hc = C(fig.look.hair).getHex(), V = (a, y, f) => new T.Vector3(a.x, a.y + y, a.z - f), M = (g, c, o) => new T.Mesh(g, gm(c, o)), P3 = (a, b, c) => new T.Vector3(a, b, c);
    const hy = head.y + .1, hx = head.x, hz = head.z;   // Kopfmitte
    const ulL = wp('J_Bip_L_UpperLeg'), ulR = wp('J_Bip_R_UpperLeg'), hw = Math.max(.11, Math.abs(ulL.x - ulR.x) / 2 + .085);   // halbe Hüftbreite
    const HS = (pts, r, o = {}) => add('J_Bip_C_Head', M(strand(pts, r, o.fl ?? .5, o.seg || 10, 8, o.end ?? .1), o.c ?? hc, { ds: 1 }), P3(0, 0, 0));
    // Langes Haar: Vorhang aus Strähnen hinter dem Kopf bis über die Schultern
    if (x.long || x.waves) { const n = x.waves ? 11 : 9, len = x.waves ? .5 : .42;
      for (let i = 0; i < n; i++) { const a = -1.25 + i * 2.5 / (n - 1), s = Math.sin(a), c = Math.cos(a), w = x.waves ? .035 : 0, e = (i % 2 ? .04 : 0);
        HS([P3(hx + s * .085, hy + .07, hz + c * .07), P3(hx + s * .125, hy - .06, hz + c * .11), P3(hx + s * .14 + w, hy - .2 - len * .3, hz + c * .1 + .03), P3(hx + s * .13 - w, hy - .2 - len * .65, hz + c * .09 + .05), P3(hx + s * .12 + w * .6, hy - .2 - len - e, hz + c * .08 + .06)], .042, { fl: .45 }); } }
    // Seitensträhnen vor den Ohren
    if (x.locks) for (const s of [-1, 1]) HS([P3(hx + s * .07, hy + .05, hz - .05), P3(hx + s * .1, hy - .08, hz - .06), P3(hx + s * .1, hy - .24, hz - .045), P3(hx + s * .085, hy - .36, hz - .03)], .028, { fl: .5 });
    // Pferdeschwanz: Haargummi und geschwungener Zopf
    if (x.pony) { add('J_Bip_C_Head', M(new T.TorusGeometry(.03, .012, 6, 12), x.tie || 0xd8b860), V(head, .14, -.11), [.6, 0, 0]);
      HS([P3(hx, hy + .05, hz + .11), P3(hx, hy + .02, hz + .19), P3(hx + .01, hy - .14, hz + .2), P3(hx - .01, hy - .32, hz + .16)], .055, { fl: .65 }); }
    if (x.bun) add('J_Bip_C_Head', M(new T.SphereGeometry(.065, 12, 10), hc), V(head, .2, -.07));
    if (x.spikes) for (let i = 0; i < 5; i++) add('J_Bip_C_Head', M(new T.ConeGeometry(.035, .14, 6), hc), V(head, .2, .02 - i * .03), [-.3 - i * .25, 0, (i - 2) * .3]);
    if (x.tufts) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) HS([P3(hx + s * .08, hy + .02 + k * .03, hz + .01 + k * .02), P3(hx + s * (.14 + k * .01), hy + .05 + k * .025, hz + .03 + k * .02), P3(hx + s * (.18 + k * .015), hy + .02 + k * .04, hz + .05 + k * .02)], .03, { c: x.tufts, fl: .7, seg: 6, end: .2 });
    if (x.beard) { const b = M(new T.SphereGeometry(.07, 14, 10), x.beard); b.scale.set(1.05, .85, .7); add('J_Bip_C_Head', b, V(head, .0, .05));
      if (x.tufts) for (const s of [-1, 1]) HS([P3(hx + s * .03, hy - .07, hz - .1), P3(hx + s * .08, hy - .06, hz - .1), P3(hx + s * .12, hy - .03, hz - .08)], .016, { c: x.beard, fl: .8, seg: 5, end: .15 }); }
    if (x.hood) { const g = new T.SphereGeometry(.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * .62); add('J_Bip_C_Head', M(g, x.hood, { ds: 1 }), V(head, .1, -.02), [-.35, 0, 0]); }
    if (x.hat) { add('J_Bip_C_Head', M(new T.CylinderGeometry(.18, .18, .02, 18), x.hat), V(head, .2, 0)); add('J_Bip_C_Head', M(new T.ConeGeometry(.11, .2, 14), x.hat), V(head, .3, 0)); }
    // Haarspange: Blüte aus fünf Blättern mit leuchtender Mitte
    if (x.clip) { const g = new T.Group(); for (let i = 0; i < 5; i++) { const l = M(new T.SphereGeometry(.016, 8, 6), x.clip, { e: x.clip, ei: .35 }); l.scale.set(1, .5, 1.6); const a = i / 5 * Math.PI * 2; l.position.set(Math.cos(a) * .018, Math.sin(a) * .018, 0); l.rotation.z = a; g.add(l); }
      g.add(M(new T.SphereGeometry(.011, 8, 6), 0xfff0a0, { e: 0xffe060, ei: .8 })); add('J_Bip_C_Head', g, P3(hx + .075, hy + .07, hz - .05), [0, -.5, 0]); }
    if (x.goggles) { for (const s of [-1, 1]) { add('J_Bip_C_Head', M(new T.TorusGeometry(.032, .01, 8, 16), 0xb98a4a), P3(hx + s * .036, hy + .07, hz - .07), [-.6, 0, 0]); add('J_Bip_C_Head', M(new T.CircleGeometry(.026, 14), 0x4fe8ff, { e: 0x2ad8f0, ei: .9 }), P3(hx + s * .036, hy + .072, hz - .077), [-.6 + Math.PI, 0, 0]); }
      add('J_Bip_C_Head', M(new T.TorusGeometry(.105, .008, 6, 28), 0x5a3a22), P3(hx, hy + .06, hz), [Math.PI / 2 + .25, 0, 0]); }
    // Umhang mit Faltenwurf und Saumborte
    if (x.cape) { const h = x.capeH || .75, g = robe(hw + .03, hw + .17, h, .58, 7, .02, .9); add('J_Bip_C_UpperChest', M(g, x.cape, { ds: 1 }), V(chest, .06, -.03), [-.07, 0, 0]);
      add('J_Bip_C_UpperChest', M(new T.TorusGeometry(.016, .006, 6, 12), x.trim || 0xd8a84a, { e: x.trim || 0xd8a84a, ei: .3 }), V(chest, .1, .09), [0, 0, 0]); }
    // Mantel: ausgestellt, vorn offen, Futter innen, Goldborte an den Kanten
    if (x.coat) { const h = x.coatH || .55, y0 = x.coatH ? chest.y - hips.y + .05 : .1, rt = (x.coatH ? hw - .01 : hw + .005), rb = rt + (x.coatH ? .13 : .1), op = .2;
      add('J_Bip_C_Hips', M(robe(rt, rb, h, op), x.coat), V(hips, y0, 0));
      if (x.lining) { const li = new T.Mesh(robe(rt - .006, rb - .006, h * .985, op), gm(x.lining)); li.material = li.material.clone(); li.material.side = T.BackSide; add('J_Bip_C_Hips', li, V(hips, y0, 0)); }
      if (x.trim) { const tm = gm(x.trim, { e: x.trim, ei: .25 }); for (const s of [-1, 1]) { const a = s * Math.PI * (1 - op), pts = [];
          for (let k = 0; k <= 6; k++) { const f = k / 6, r = rt + (rb - rt) * f; pts.push(P3(hips.x + Math.sin(a) * r, hips.y + y0 - h * f, hips.z + Math.cos(a) * r * .82)); }
          add('J_Bip_C_Hips', new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, .011, 6), tm), P3(0, 0, 0)); }
        const hp = []; for (let k = 0; k <= 24; k++) { const a = -Math.PI * (1 - op) + k / 24 * Math.PI * 2 * (1 - op), r = rb + Math.sin(a * 9) * .014 * 1.6; hp.push(P3(hips.x + Math.sin(a) * r, hips.y + y0 - h, hips.z + Math.cos(a) * r * .82)); }
        add('J_Bip_C_Hips', new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(hp), 48, .009, 5), tm), P3(0, 0, 0));} }
    if (x.belt) { const b = M(new T.TorusGeometry(hw - .02, .016, 8, 32), x.belt, { e: x.belt, ei: .25 }); b.scale.set(1, .78, 1); add('J_Bip_C_Spine', b, V(hips, .1, 0), [Math.PI / 2, 0, 0]);
      add('J_Bip_C_Spine', M(new T.BoxGeometry(.05, .04, .015), x.belt, { e: x.belt, ei: .4 }), V(hips, .1, (hw - .02) * .78 + .005)); }
    if (x.cuffs) for (const s of ['L', 'R']) { const a = wp('J_Bip_' + s + '_Hand'); add('J_Bip_' + s + '_LowerArm', M(new T.CylinderGeometry(.038, .044, .06, 14), x.cuffs, { e: x.cuffs, ei: .25 }), P3(a.x - Math.sign(a.x) * .07, a.y, a.z), [0, 0, Math.PI / 2]); }
    if (x.apron) add('J_Bip_C_Spine', M(new T.BoxGeometry(.26, .38, .015), x.apron), V(hips, -.05, .13));
    if (x.pack) { add('J_Bip_C_UpperChest', M(new T.CylinderGeometry(.11, .11, .32, 16), 0xb98a4a), V(chest, -.05, -.17), [0, 0, 0]); for (const k of [-.12, .12]) add('J_Bip_C_UpperChest', M(new T.TorusGeometry(.112, .008, 6, 20), 0x6a4a2a), V(chest, -.05 + k, -.17), [Math.PI / 2, 0, 0]); add('J_Bip_C_UpperChest', M(new T.SphereGeometry(.06, 12, 10), 0x4fe8ff, { e: 0x2ad8f0, ei: .9 }), V(chest, -.05, -.29)); }
    if (x.quiver) { const q = new T.Group(); q.add(M(new T.CylinderGeometry(.045, .038, .38, 12), 0x5a3a22)); q.add(M(new T.TorusGeometry(.046, .007, 5, 14), 0xd8b860)).position.y = .17; q.children[1].rotation.x = Math.PI / 2;
      for (let i = 0; i < 3; i++) { const f = M(new T.ConeGeometry(.018, .06, 4), [0xe8e0d0, 0x6ac05a, 0xe8e0d0][i]); f.position.set((i - 1) * .018, .22, (i % 2) * .01); q.add(f); }
      add('J_Bip_C_UpperChest', q, V(chest, -.05, -.13), [0, 0, .45]); }
    // Schulterstücke: Metallschale mit Rand
    if (x.pads) for (const s of ['L', 'R']) { const u = wp('J_Bip_' + s + '_UpperArm'), g = new T.Group(), sh = M(new T.SphereGeometry(.075, 14, 8, 0, Math.PI * 2, 0, Math.PI * .5), x.pads, { ds: 1 }); sh.scale.set(1.1, .8, 1); g.add(sh); const rm = M(new T.TorusGeometry(.076, .008, 5, 20), 0xd8b860); rm.rotation.x = Math.PI / 2; rm.scale.set(1.1, 1, 1); g.add(rm);
      add('J_Bip_' + s + '_UpperArm', g, V(u, .02, 0), [0, 0, -Math.sign(u.x) * .35]); }
    if (x.boots) for (const s of ['L', 'R']) { const k = wp('J_Bip_' + s + '_LowerLeg'), a = wp('J_Bip_' + s + '_Foot'), len = (k.y - a.y) * .7; add('J_Bip_' + s + '_LowerLeg', M(new T.CylinderGeometry(.058, .048, len, 14), x.boots), P3(a.x, a.y + len / 2, a.z));
      add('J_Bip_' + s + '_LowerLeg', M(new T.TorusGeometry(.06, .01, 6, 16), x.cuffs || 0xd8a84a), P3(a.x, a.y + len, a.z), [Math.PI / 2, 0, 0]); }
    // Hände: Arme liegen in der Ruhepose waagerecht – Stab und Schwert liegen in Armrichtung (beim Herabhängen senkrecht)
    const sr = Math.sign(hr.x) || -1, sl = Math.sign(hl.x) || 1;
    if (x.staff) { const g = new T.Group(), wood = 0x6a4a2a; g.add(M(new T.CylinderGeometry(.018, .013, 1.4, 8), wood));
      for (let i = 0; i < 3; i++) { const r = M(new T.TorusGeometry(.02, .006, 5, 10), 0xd8a84a); r.rotation.x = Math.PI / 2; r.position.y = .55 + i * .05; g.add(r); }
      const fork = strand([P3(0, .62, 0), P3(.05, .72, 0), P3(.03, .84, 0), P3(-.01, .86, 0)], .012, 1, 6, 6, .4), fk = new T.Mesh(fork, gm(wood)); g.add(fk); const fk2 = fk.clone(); fk2.scale.x = -1; g.add(fk2);
      const o = M(new T.OctahedronGeometry(.045), x.staff, { e: x.staff, ei: .9 }); o.scale.set(1, 1.6, 1); o.position.y = .76; g.add(o);
      add('J_Bip_R_Hand', g, P3(hr.x + sr * .05, hr.y, hr.z - .03), [0, 0, sr * Math.PI / 2]); }
    if (x.sword) { const g = new T.Group(), steel = 0xdfe6f0, gold = 0xc9a24a, bl = M(new T.BoxGeometry(.048, .66, .01), steel, { e: 0x3a4a60, ei: .3 }); bl.position.y = -.42; g.add(bl);
      const tip = M(new T.ConeGeometry(.034, .1, 4), steel, { e: 0x3a4a60, ei: .3 }); tip.scale.z = .3; tip.rotation.set(Math.PI, Math.PI / 4, 0); tip.position.y = -.8; g.add(tip);
      const fu = M(new T.BoxGeometry(.012, .5, .012), 0x9aa8c0); fu.position.set(0, -.36, -.006); g.add(fu);
      const gd = M(new T.BoxGeometry(.2, .03, .04), gold); gd.position.y = -.08; g.add(gd); for (const s of [-1, 1]) { const e = M(new T.SphereGeometry(.02, 8, 6), gold); e.position.set(s * .1, -.08, 0); g.add(e); }
      const gr = M(new T.CylinderGeometry(.018, .018, .12, 8), 0x3a2418); gr.position.y = 0; g.add(gr); const pm = M(new T.SphereGeometry(.026, 10, 8), gold); pm.position.y = .07; g.add(pm);
      add('J_Bip_R_Hand', g, P3(hr.x + sr * .05, hr.y, hr.z - .03), [0, 0, sr * Math.PI / 2]); }
    if (x.shield) { const g = new T.Group(), c = x.shieldC || 0x2a4a8a, d = M(new T.CylinderGeometry(.16, .16, .03, 28), c); g.add(d);
      const rm = M(new T.TorusGeometry(.16, .014, 6, 32), 0xb8c0cc); rm.rotation.x = Math.PI / 2; g.add(rm);
      const bs = M(new T.SphereGeometry(.045, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xc9a24a); bs.position.y = .015; g.add(bs);
      for (const r of [0, Math.PI / 2]) { const b = M(new T.BoxGeometry(.3, .006, .03), 0xc9a24a); b.position.y = .017; b.rotation.y = r; g.add(b); }
      add('J_Bip_L_LowerArm', g, P3(hl.x - sl * .12, hl.y, hl.z - .08), [Math.PI / 2, 0, 0]); }
    if (x.bow) { const g = new T.Group(), arc = [], n = 8; for (let i = 0; i <= n; i++) { const t = i / n - .5, y = t * .7, z = -Math.cos(t * Math.PI) * .12 + (Math.abs(t) > .4 ? (Math.abs(t) - .4) * .5 : 0); arc.push(P3(0, y, z)); }
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(arc), 20, .012, 6), gm(0x6a4a2a))); const gp = M(new T.CylinderGeometry(.017, .017, .09, 8), 0x3a2418); gp.position.z = -.12; g.add(gp);
      const st = M(new T.CylinderGeometry(.0025, .0025, .7, 4), 0xf0ece0); st.position.z = arc[0].z; g.add(st);
      add('J_Bip_L_Hand', g, P3(hl.x + sl * .04, hl.y, hl.z - .02), [0, 0, sl * Math.PI / 2]); }
  }

  // Knochen für die Bewegung samt Ruhelage
  const BN = { hips: 'J_Bip_C_Hips', spine: 'J_Bip_C_Spine', chest: 'J_Bip_C_Chest', head: 'J_Bip_C_Head',
    ua0: 'J_Bip_L_UpperArm', la0: 'J_Bip_L_LowerArm', ua1: 'J_Bip_R_UpperArm', la1: 'J_Bip_R_LowerArm', ul0: 'J_Bip_L_UpperLeg', ll0: 'J_Bip_L_LowerLeg', ul1: 'J_Bip_R_UpperLeg', ll1: 'J_Bip_R_LowerLeg' };
  const QA = new T.Quaternion(), XA = new T.Vector3(1, 0, 0), YA = new T.Vector3(0, 1, 0), ZA = new T.Vector3(0, 0, 1);
  function rig(fig) {
    const R = {}; for (const k in BN) { const b = fig.bones[BN[k]]; if (b) R[k] = { b, q: b.quaternion.clone(), p: b.position.clone() }; }
    fig.scene.updateMatrixWorld(true);
    for (const i of [0, 1]) { const h = fig.bones[i ? 'J_Bip_R_Hand' : 'J_Bip_L_Hand'], s = h ? Math.sign(h.getWorldPosition(new T.Vector3()).x) || (i ? -1 : 1) : (i ? -1 : 1);
      R['s' + i] = s; R['ax' + i] = XA.clone().applyAxisAngle(ZA, s * 1.25).normalize(); }   // Ellbogen-Achse im Oberarm-Raum (Arm hängt herab)
    return R;
  }
  const set = (r, ...rots) => { if (!r) return; r.b.quaternion.copy(r.q); for (const [ax, a] of rots) r.b.quaternion.multiply(QA.setFromAxisAngle(ax, a)); };

  // P = gebaute Figur (root, body, …). Lädt das Modell und tauscht es ein; look = Name aus CAST oder Steckbrief.
  function dress(P, look, opt = {}) {
    const L = typeof look === 'string' ? CAST[look] : look; if (!L) return P;
    load(L.m).then(g => {
      if (P.dead) return;
      const { scene, bones } = cloneRig(g.scene), wrap = new T.Group(), fig = { root: wrap, scene, bones, extra: [], look: L, ph: Math.random() * 6 };
      wrap.add(scene);
      const outl = !TOUCH || opt.cast, list = [];
      scene.traverse(o => { if (o.isMesh) list.push(o); });
      for (const o of list) {
        const n = o.material.name || ''; if (/EyeExtra/.test(n)) { o.visible = false; continue; }
        o.material = matFor(o.material, L); o.castShadow = !o.material.transparent;
        if (L.x && L.x.bald && /HAIR/.test(n)) o.visible = false;
        if (outl && o.isSkinnedMesh && /Body_00_SKIN|CLOTH|HAIR|Face_00_SKIN/.test(n) && !o.material.transparent && o.visible) { const l = new T.SkinnedMesh(o.geometry, OUT); l.bind(o.skeleton, o.bindMatrix); l.frustumCulled = false; l.raycast = () => {}; o.parent.add(l); }
      }
      gear(fig, L.x || {}); fig.R = rig(fig);
      const hd = bones.J_Bip_C_Head, top = hd ? hd.getWorldPosition(new T.Vector3()).y + .2 : 1.6;
      scene.rotation.y = Math.PI;   // VRoid blickt nach −Z, Zotik-Figuren nach +Z
      wrap.scale.setScalar((L.h || 1.7) / top / (opt.cast ? P.root.scale.x || 1 : 1));
      P.body.visible = false; P.root.add(wrap); P.fig = fig;
    }).catch(e => { console.warn('Zotik-Figur', L.m, e && e.message); });
    return P;
  }

  // Bewegung: Atmen, Gehen/Laufen (Beine, Knie, Arme, Hüfte), Zuschlagen mit dem rechten Arm
  function animate(P, t, mv) {
    const d = Math.min(.1, Math.max(0, t - (P._lt ?? t))); P._lt = t; const f = P.fig, R = f.R; if (!R) return;
    const m = Math.min(1, mv), run = m > .65; f.ph += d * (5 + m * (run ? 9 : 7));
    const s = Math.sin(f.ph) * m * (run ? 1 : .75), c = Math.cos(f.ph), br = Math.sin(t * 1.7) * .025;
    set(R.ul0, [XA, s * .8]); set(R.ul1, [XA, -s * .8]);
    set(R.ll0, [XA, -Math.max(0, -c) * m * (run ? 1.3 : .8)]); set(R.ll1, [XA, -Math.max(0, c) * m * (run ? 1.3 : .8)]);
    const down = 1.25 - m * .05, elb = .25 + m * (run ? .8 : .3);
    set(R.ua0, [XA, -s * .7], [ZA, -R.s0 * down]); set(R.la0, [R.ax0, elb]);
    if (P.hit > 0) {   // Angriff: Arm hoch und kräftig nach vorn-unten
      P.hit -= d; const k = 1 - Math.max(0, P.hit) / .5, a = k < .35 ? .3 + k / .35 * 2.4 : 2.7 - (k - .35) / .65 * 2.5;
      set(R.ua1, [XA, a], [ZA, -R.s1 * .9]); set(R.la1, [R.ax1, .2]); set(R.chest, [YA, -.25 * Math.sin(k * Math.PI)]);
    } else { set(R.ua1, [XA, s * .7], [ZA, -R.s1 * down]); set(R.la1, [R.ax1, elb]); set(R.chest, [XA, br + (run ? .12 : 0)], [YA, s * .12]); }
    set(R.spine, [YA, -s * .06]); set(R.head, [YA, Math.sin(t * .45 + f.ph * .02) * .12 * (1 - m)], [XA, -br]);
    if (R.hips) { R.hips.b.position.copy(R.hips.p); R.hips.b.position.y += Math.abs(Math.sin(f.ph)) * .025 * m - br * .2; }
  }
  return { dress, animate, villagerLook, CAST };
}
