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
  const gmat = new Map(), gm = (c, o = {}) => { const k = c + '/' + (o.e || 0) + '/' + (o.ds || 0); if (!gmat.has(k)) gmat.set(k, new T.MeshToonMaterial({ color: C(c), gradientMap: G, emissive: C(o.e || 0), emissiveIntensity: o.e ? 1.5 : 0, side: o.ds ? T.DoubleSide : T.FrontSide })); return gmat.get(k); };
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

  // Zubehör an Knochen (Ruhepose, Modellraum: Blick nach −Z; f = nach vorn in Metern)
  function gear(fig, x) {
    const B = fig.bones, S = fig.scene; S.updateMatrixWorld(true);
    const wp = n => B[n] ? B[n].getWorldPosition(new T.Vector3()) : new T.Vector3();
    const add = (bone, m, p, r) => { const b = B[bone]; if (!b) return m; m.position.copy(p); if (r) m.rotation.set(r[0], r[1], r[2]); m.updateMatrix(); m.matrix.premultiply(b.matrixWorld.clone().invert()); m.matrix.decompose(m.position, m.quaternion, m.scale); b.add(m); m.castShadow = true; fig.extra.push(m); return m; };
    const head = wp('J_Bip_C_Head'), chest = wp('J_Bip_C_UpperChest'), hips = wp('J_Bip_C_Hips'), hr = wp('J_Bip_R_Hand'), hl = wp('J_Bip_L_Hand');
    const hc = C(fig.look.hair).getHex(), V = (a, y, f) => new T.Vector3(a.x, a.y + y, a.z - f), M = (g, c, o) => new T.Mesh(g, gm(c, o));
    const hy = head.y + .1;   // Kopfmitte
    if (x.long) { const g = new T.CylinderGeometry(.1, .15, .5, 14, 1, true, -Math.PI * .38, Math.PI * .76);   /* θ = 0 zeigt nach +Z = Rücken (VRoid blickt nach −Z) */ add('J_Bip_C_Head', M(g, hc, { ds: 1 }), V(head, -.12, -.02)); }
    if (x.locks) for (const s of [-1, 1]) add('J_Bip_C_Head', M(new T.ConeGeometry(.035, .34, 7), hc), new T.Vector3(head.x + s * .085, hy - .12, head.z - .03), [Math.PI, 0, s * .12]);
    if (x.pony) { add('J_Bip_C_Head', M(new T.SphereGeometry(.05, 10, 8), hc), V(head, .14, -.1)); add('J_Bip_C_Head', M(new T.ConeGeometry(.05, .36, 8), hc), V(head, -.02, -.14), [Math.PI - .4, 0, 0]); }
    if (x.bun) add('J_Bip_C_Head', M(new T.SphereGeometry(.065, 12, 10), hc), V(head, .2, -.07));
    if (x.spikes) for (let i = 0; i < 5; i++) add('J_Bip_C_Head', M(new T.ConeGeometry(.035, .14, 6), hc), V(head, .2, .02 - i * .03), [-.3 - i * .25, 0, (i - 2) * .3]);
    if (x.tufts) for (const s of [-1, 1]) add('J_Bip_C_Head', M(new T.SphereGeometry(.06, 10, 8), x.tufts), new T.Vector3(head.x + s * .085, hy + .02, head.z + .02));
    if (x.beard) { const b = M(new T.SphereGeometry(.07, 12, 10), x.beard); b.scale.set(1.05, .85, .7); add('J_Bip_C_Head', b, V(head, .0, .05)); }
    if (x.hood) { const g = new T.SphereGeometry(.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * .62); add('J_Bip_C_Head', M(g, x.hood, { ds: 1 }), V(head, .1, -.02), [-.35, 0, 0]); }
    if (x.hat) { add('J_Bip_C_Head', M(new T.CylinderGeometry(.18, .18, .02, 18), x.hat), V(head, .2, 0)); add('J_Bip_C_Head', M(new T.ConeGeometry(.11, .2, 14), x.hat), V(head, .3, 0)); }
    if (x.clip) add('J_Bip_C_Head', M(new T.OctahedronGeometry(.028), x.clip, { e: x.clip }), new T.Vector3(head.x + .07, hy + .06, head.z - .05));
    if (x.goggles) for (const s of [-1, 1]) { add('J_Bip_C_Head', M(new T.TorusGeometry(.032, .01, 6, 14), 0xb98a4a), new T.Vector3(head.x + s * .036, hy + .07, head.z - .07), [-.6, 0, 0]); add('J_Bip_C_Head', M(new T.CircleGeometry(.026, 12), 0x4fe8ff, { e: 0x2ad8f0 }), new T.Vector3(head.x + s * .036, hy + .072, head.z - .077), [-.6 + Math.PI, 0, 0]); }
    if (x.cape) { const h = x.capeH || .75, g = new T.CylinderGeometry(.15, .27, h, 16, 1, true, -Math.PI * .42, Math.PI * .84); g.translate(0, -h / 2, 0); add('J_Bip_C_UpperChest', M(g, x.cape, { ds: 1 }), V(chest, .05, -.02), [-.06, 0, 0]); }
    if (x.coat) { const h = x.coatH || .55, y0 = x.coatH ? chest.y - hips.y + .05 : .1, g = new T.CylinderGeometry(x.coatH ? .14 : .16, x.coatH ? .25 : .29, h, 16, 1, true, -Math.PI * .7, Math.PI * 1.4); add('J_Bip_C_Hips', M(g, x.coat), V(hips, y0 - h / 2, 0));
      if (x.lining) { const gi = new T.CylinderGeometry(.135, x.coatH ? .245 : .285, h * .98, 16, 1, true, -Math.PI * .7, Math.PI * 1.4); const li = new T.Mesh(gi, gm(x.lining, { ds: 1 })); li.material = li.material.clone(); li.material.side = T.BackSide; add('J_Bip_C_Hips', li, V(hips, y0 - h / 2, 0)); }
      if (x.trim) for (const a of [Math.PI * .7, -Math.PI * .7]) { const t = M(new T.BoxGeometry(.03, h, .02), x.trim, { e: x.trim }); const r = .225; add('J_Bip_C_Hips', t, new T.Vector3(hips.x + Math.sin(a) * r, hips.y + y0 - h / 2, hips.z + Math.cos(a) * r), [0, a, Math.atan2((.29 - .16) * Math.sign(Math.sin(a)), h) * -1]); } }
    if (x.belt) add('J_Bip_C_Spine', M(new T.TorusGeometry(.125, .014, 6, 20), x.belt, { e: x.belt }), V(hips, .1, 0), [Math.PI / 2, 0, 0]);
    if (x.cuffs) for (const s of ['L', 'R']) { const a = wp('J_Bip_' + s + '_Hand'); add('J_Bip_' + s + '_LowerArm', M(new T.CylinderGeometry(.04, .045, .07, 10), x.cuffs, { e: x.cuffs }), new T.Vector3(a.x - Math.sign(a.x) * .07, a.y, a.z), [0, 0, Math.PI / 2]); }
    if (x.waves) for (let i = 0; i < 7; i++) { const a = -1.1 + i * .37, l = .42 + (i % 2) * .1; add('J_Bip_C_Head', M(new T.ConeGeometry(.05, l, 7), hc), new T.Vector3(head.x + Math.sin(a) * .12, hy - .2 - l * .35, head.z + Math.cos(a) * .1), [Math.PI + Math.cos(a) * .15, 0, -Math.sin(a) * .18]); }
    if (x.apron) add('J_Bip_C_Spine', M(new T.BoxGeometry(.26, .38, .015), x.apron), V(hips, -.05, .13));
    if (x.pack) { add('J_Bip_C_UpperChest', M(new T.CylinderGeometry(.11, .11, .32, 12), 0xb98a4a), V(chest, -.05, -.17)); add('J_Bip_C_UpperChest', M(new T.SphereGeometry(.06, 10, 8), 0x4fe8ff, { e: 0x2ad8f0 }), V(chest, -.05, -.29)); }
    if (x.quiver) add('J_Bip_C_UpperChest', M(new T.CylinderGeometry(.045, .045, .38, 8), 0x5a3a22), V(chest, -.05, -.13), [0, 0, .45]);
    if (x.pads) for (const s of ['L', 'R']) { const u = wp('J_Bip_' + s + '_UpperArm'); add('J_Bip_' + s + '_UpperArm', M(new T.SphereGeometry(.07, 10, 8), x.pads), V(u, .03, 0)); }
    if (x.boots) for (const s of ['L', 'R']) { const k = wp('J_Bip_' + s + '_LowerLeg'), a = wp('J_Bip_' + s + '_Foot'), len = (k.y - a.y) * .7; add('J_Bip_' + s + '_LowerLeg', M(new T.CylinderGeometry(.055, .048, len, 12), x.boots), new T.Vector3(a.x, a.y + len / 2, a.z)); }
    // Hände: Arme liegen in der Ruhepose waagerecht – Stab und Schwert liegen in Armrichtung (beim Herabhängen senkrecht)
    const sr = Math.sign(hr.x) || -1, sl = Math.sign(hl.x) || 1;
    if (x.staff) { const g = new T.Group(); g.add(M(new T.CylinderGeometry(.016, .016, 1.45, 6), 0x6a4a2a)); const o = M(new T.SphereGeometry(.07, 12, 10), x.staff, { e: x.staff }); o.position.y = .74; g.add(o); add('J_Bip_R_Hand', g, new T.Vector3(hr.x + sr * .05, hr.y, hr.z - .03), [0, 0, sr * Math.PI / 2]); }
    if (x.sword) { const g = new T.Group(), bl = M(new T.BoxGeometry(.045, .75, .012), 0xc8d0e0); bl.position.y = -.42; g.add(bl, M(new T.BoxGeometry(.18, .035, .035), 0x8a6a3a)); add('J_Bip_R_Hand', g, new T.Vector3(hr.x + sr * .05, hr.y, hr.z - .03), [0, 0, sr * Math.PI / 2]); }
    if (x.shield) add('J_Bip_L_LowerArm', M(new T.CylinderGeometry(.17, .17, .035, 16), 0x8a8a9a), new T.Vector3(hl.x - sl * .12, hl.y, hl.z - .08), [Math.PI / 2, 0, 0]);
    if (x.bow) add('J_Bip_L_Hand', M(new T.TorusGeometry(.3, .013, 5, 16, Math.PI), 0x6a4a2a), new T.Vector3(hl.x + sl * .04, hl.y, hl.z - .04), [0, Math.PI / 2, 0]);
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
