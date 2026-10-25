/* Zotik nach dem Master-Sheet (1.0): schlanker Fuchs mit großem Kopf, Fell, grünen Augen, grünem Schal, brauner Lederweste,
   Bronze-Schienen, großen Stiefeln und buschigem Schwanz mit heller Spitze.
   Gleiche Gelenke wie zuvor (legs, arms, head, ears, tail, scarf, handSword, backSword, mats), damit Animation und Kampf unverändert laufen. */
import { furMat, furShells } from './gfx.js';

export function buildFox(C) {
  const { T, M, glow, makeSword, mergeChar, mergeStatic, TOUCH } = C;
  const SHELLS = TOUCH ? 5 : 9, SEG = TOUCH ? [22, 15] : [34, 24];
  const root = new T.Group(), body = new T.Group(); root.add(body);

  /* --- Materialien (nicht aus dem gemeinsamen Cache: der Fellton-/Kleidungswechsel darf nichts anderes umfärben) --- */
  const mat = (c, o) => { o = o || {}; const m = new T.MeshStandardMaterial({ color: c, roughness: o.r ?? .8, metalness: o.m ?? 0 }); if (o.e !== undefined) { m.emissive = new T.Color(o.e); m.emissiveIntensity = o.ei ?? 1 } return m };
  const O = mat(0xff8a22, { r: .95, e: 0x3a1500, ei: 1 }), OD = mat(0xe06a14, { r: .95, e: 0x2a1000, ei: 1 }), CR = mat(0xfff2dc, { r: 1, e: 0x6a5a48, ei: 1 });
  const BR = mat(0x7e4e2c, { r: .55 }), PT = mat(0x5a4234, { r: .85 }), DK = mat(0x2a1e1a, { r: .5 }), GR = mat(0x2f9a45, { r: .9 }), BZ = mat(0xb98a4a, { r: .32, m: .85 }), RD = mat(0xb82a2a, { r: .9 });
  GR.side = T.DoubleSide; for (const m of [O, OD, CR]) m.envMapIntensity = .12;
  const fO = furMat(T, 0xff8a22, { len: .038, dens: 120 }), fOD = furMat(T, 0xe06a14, { len: .04, dens: 120 }), fCR = furMat(T, 0xfff2dc, { len: .045, dens: 120, root: .86, tip: 1.0 }),
    fTail = furMat(T, 0xff8a22, { len: .06, dens: 85, droop: .4 }), fTailD = furMat(T, 0xe06a14, { len: .06, dens: 85, droop: .4 }), fTailW = furMat(T, 0xfff2dc, { len: .065, dens: 85, root: .86, tip: 1.0, droop: .4 });
  const FM = { O: [fO, fTail], OD: [fOD, fTailD] };

  /* --- Geometrie-Helfer --- */
  const SPH = new T.SphereGeometry(1, SEG[0], SEG[1]);
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _e = new T.Euler(), _p = new T.Vector3(), _s = new T.Vector3();
  function el(rx, ry, rz, x, y, z, ax, ay, az) {
    _e.set(ax || 0, ay || 0, az || 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(rx, ry, rz));
    return SPH.clone().applyMatrix4(_m);
  }
  function geo(g0, rx, ry, rz, x, y, z, ax, ay, az) {
    _e.set(ax || 0, ay || 0, az || 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(rx, ry, rz));
    return g0.clone().applyMatrix4(_m);
  }
  function join(list) {
    let n = 0, ni = 0; for (const g of list) { n += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count }
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), I = new Uint32Array(ni); let o = 0, oi = 0;
    for (const g of list) {
      P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3);
      if (g.index) for (let i = 0; i < g.index.count; i++) I[oi++] = g.index.array[i] + o; else for (let i = 0; i < g.attributes.position.count; i++) I[oi++] = i + o;
      o += g.attributes.position.count; g.dispose();
    }
    const r = new T.BufferGeometry(); r.setAttribute('position', new T.BufferAttribute(P, 3)); r.setAttribute('normal', new T.BufferAttribute(N, 3)); r.setIndex(new T.BufferAttribute(I, 1)); return r;
  }
  /* Teil mit Fell: festes Netz + Schalen */
  function furry(parent, geos, mat, fmat, cast) {
    const g = join(geos), m = new T.Mesh(g, mat); m.castShadow = cast !== false; parent.add(m);
    const sh = furShells(T, g, fmat, SHELLS); parent.add(sh); return m;
  }
  function solid(parent, geos, mat, cast) { const m = new T.Mesh(join(geos), mat); m.castShadow = cast !== false; parent.add(m); return m }
  const CYL = new T.CylinderGeometry(1, 1, 1, TOUCH ? 14 : 24, 1), CONE = new T.ConeGeometry(1, 1, TOUCH ? 14 : 24, 1), BOX = new T.BoxGeometry(1, 1, 1), TOR = new T.TorusGeometry(1, .3, 12, TOUCH ? 24 : 40);
  const P = { root, body, legs: [], arms: [] };

  /* --- Beine: weite Hose, große Stiefel mit Bronzeschnalle --- */
  for (const s of [-1, 1]) {
    const leg = new T.Group(); leg.position.set(s * .15, .58, 0);
    furry(leg, [el(.15, .19, .15, 0, -.1, 0)], O, fO);                       // Oberschenkelfell lugt aus der Hose
    solid(leg, [el(.145, .2, .15, 0, -.13, 0), geo(CYL, .125, .2, .125, 0, -.3, 0)], PT);   // Hose
    solid(leg, [geo(CYL, .108, .17, .108, 0, -.4, 0), el(.12, .06, .12, 0, -.3, 0)], BR);    // Stiefelschaft + Umschlag
    solid(leg, [el(.125, .085, .215, 0, -.5, .07), el(.11, .075, .13, 0, -.5, .2)], BR);      // Stiefelspitze
    solid(leg, [geo(BOX, .13, .03, .24, 0, -.555, .08)], DK);                                  // Sohle
    solid(leg, [geo(TOR, .112, .112, .112, 0, -.33, 0, Math.PI / 2, 0, 0), el(.075, .045, .05, 0, -.5, .24)], BZ);   // Schnallenband + Kappe
    if (s > 0) solid(leg, [geo(BOX, .02, .2, .12, .14, -.1, .05)], RD);                       // Lappen an der Hose
    body.add(leg); P.legs.push(leg);
  }

  /* --- Rumpf --- */
  furry(body, [el(.235, .3, .19, 0, .86, 0)], O, fO);                               // Brust/Rücken
  furry(body, [el(.17, .22, .13, 0, .84, .11)], CR, fCR);                            // heller Bauch
  solid(body, [el(.27, .17, .22, 0, .66, -.01)], PT);                                // Hosenbund
  solid(body, [el(.265, .18, .215, 0, .74, -.005), geo(BOX, .05, .55, .025, 0, .93, .2, 0, 0, .55)], BR);   // Weste + Gurt
  solid(body, [geo(TOR, .25, .2, .12, 0, .62, 0, Math.PI / 2, 0, 0), geo(BOX, .07, .07, .03, 0, .62, .22), geo(BOX, .13, .17, .09, .29, .6, -.03)], BR);   // Gürtel, Schnalle-Basis, Tasche
  solid(body, [geo(BOX, .045, .05, .02, 0, .62, .24), geo(BOX, .04, .05, .02, .29, .6, .02)], BZ);
  solid(body, [el(.03, .03, .02, .06, .98, .215)], new T.MeshPhysicalMaterial({ color: 0x3a8cff, emissive: 0x2a7cff, emissiveIntensity: 1.8, roughness: .1, clearcoat: 1 }));   // Kristall am Gurt

  /* --- Arme: Fell, Lederschiene mit Bronze, dunkle Pfote --- */
  for (const s of [-1, 1]) {
    const arm = new T.Group(); arm.position.set(s * .32, 1.02, 0);
    furry(arm, [el(.085, .19, .085, 0, -.15, 0)], O, fO);
    solid(arm, [el(.125, .1, .125, 0, .02, 0)], BR);                                  // Schulterpolster
    solid(arm, [geo(CYL, .1, .085, .1, 0, -.33, 0), el(.105, .045, .105, 0, -.27, 0)], BR);
    solid(arm, [geo(TOR, .105, .105, .105, 0, -.28, 0, Math.PI / 2, 0, 0)], BZ);
    solid(arm, [el(.095, .1, .105, 0, -.43, .01), el(.035, .04, .045, -.05, -.5, .07), el(.035, .04, .045, 0, -.51, .08), el(.035, .04, .045, .05, -.5, .07)], DK);
    body.add(arm); P.arms.push(arm);
  }
  const sw = makeSword(); sw.position.set(.04, .35, 0); sw.rotation.x = Math.PI / 2; sw.visible = false; P.arms[1].add(sw); P.handSword = sw;
  const back = makeSword(); back.position.set(-.06, .5, -.27); back.rotation.set(.12, 0, -.95); body.add(back); P.backSword = back;

  /* --- Kopf --- */
  const head = new T.Group(); head.position.set(0, 1.33, 0); body.add(head); P.head = head;
  furry(head, [el(.32, .285, .295, 0, 0, 0), el(.07, .05, .07, -.2, -.14, .12, 0, 0, .6), el(.07, .05, .07, .2, -.14, .12, 0, 0, -.6)], O, fO);   // Schädel
  furry(head, [el(.15, .115, .17, 0, -.075, .26), el(.085, .06, .1, 0, -.15, .3)], CR, fCR);                                                    // Schnauze
  // Wangenfell (weiß, nach außen gefegt)
  for (const s of [-1, 1]) furry(head, [geo(CONE, .075, .2, .075, s * .27, -.1, .08, 0, 0, -s * 1.95), geo(CONE, .06, .17, .06, s * .25, -.17, .05, 0, 0, -s * 2.4)], CR, fCR, false);
  solid(head, [el(.05, .038, .042, 0, -.04, .425)], DK);                                                                                         // Nase
  const nose = new T.Mesh(new T.SphereGeometry(1, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })); nose.scale.set(.012, .008, .008); nose.position.set(-.012, -.025, .455); head.add(nose);
  const sm = new T.Mesh(new T.TorusGeometry(1, .13, 8, 20, Math.PI), DK); sm.scale.set(.065, .05, .05); sm.position.set(0, -.115, .365); sm.rotation.z = Math.PI; head.add(sm);
  // Augen: Lederhaut, Iris mit Klarlack, Pupille, zwei Glanzpunkte, Lid
  const eyeW = M(0xffffff, { r: .3 }), eyeG = new T.MeshPhysicalMaterial({ color: 0x1fc84a, emissive: 0x0f8a2a, emissiveIntensity: .6, envMapIntensity: .5, roughness: .18, clearcoat: 1, clearcoatRoughness: .05 }),
    eyeD = M(0x0a0a10, { r: .2 }), eyeS = new T.MeshBasicMaterial({ color: 0xffffff });
  for (const s of [-1, 1]) {
    solid(head, [el(.088, .108, .055, s * .128, .035, .235)], eyeW, false);
    solid(head, [el(.07, .092, .04, s * .128, .03, .262)], eyeG, false);
    solid(head, [el(.034, .06, .022, s * .128, .028, .287)], eyeD, false);
    solid(head, [el(.017, .017, .012, s * .108, .068, .3), el(.009, .009, .008, s * .15, -.01, .302)], eyeS, false);
    const lid = new T.Mesh(new T.TorusGeometry(1, .09, 6, 16, Math.PI * .95), DK); lid.scale.set(.095, .1, .05); lid.position.set(s * .128, .06, .262); lid.rotation.z = s > 0 ? .12 : -.12; head.add(lid);
    const br = new T.Mesh(BOX, DK); br.scale.set(.09, .012, .02); br.position.set(s * .13, .165, .245); br.rotation.z = -s * .1; head.add(br);
    // Ohren: Außenfell, helles Innenfell, dunkle Spitze
    const ear = new T.Group(); ear.position.set(s * .17, .2, -.02); ear.rotation.set(-.05, 0, -s * .3);
    furry(ear, [geo(CONE, .145, .5, .1, 0, .22, 0)], O, fO);
    furry(ear, [geo(CONE, .09, .38, .05, 0, .2, .05)], CR, fCR, false);
    solid(ear, [geo(CONE, .04, .07, .03, 0, .5, 0)], BR, false);
    head.add(ear); (P.ears = P.ears || []).push(ear);
  }
  // Haarschopf: gefegte Spitzen
  const tuft = [];
  for (let i = 0; i < 9; i++) { const a = (i - 4) * .3, r = Math.abs(i - 4); tuft.push(geo(CONE, .075, .27 - r * .014, .075, Math.sin(a) * .15, .26 - r * .012, Math.cos(a) * .09 - .01, -.42 + r * .05, 0, -a * .9)) }
  furry(head, tuft, OD, fOD, false);

  /* --- Schal: Wulst am Hals, Knoten, wehendes Tuch --- */
  solid(body, [geo(TOR, .22, .2, .2, 0, 1.075, .01, Math.PI / 2, 0, 0), el(.09, .075, .07, .06, 1.03, .2)], GR);
  const sc = new T.Group(); sc.position.set(-.12, 1.06, -.17);
  { // Band aus gebogenem Streifen (zwei Lagen), damit die Schalbewegung weich wirkt
    const mk2 = (w, l, bend, x, z) => { const g = new T.PlaneGeometry(w, l, 2, 8); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = -p.getY(i) / l; p.setZ(i, z + Math.sin(t * 3.2 + x * 9) * .03 * bend + t * t * -.05); p.setX(i, p.getX(i) + x + Math.sin(t * 2.5) * .02 * bend) } g.computeVertexNormals(); return g };
    for (const [w, l, x] of [[.17, .5, 0], [.13, .34, .1]]) { const m = new T.Mesh(mk2(w, l, 1, x, 0), GR); m.position.y = -l * .04; m.castShadow = true; sc.add(m) }
  }
  body.add(sc); P.scarf = sc;

  /* --- Schwanz: buschig, dicke Fell-Schalen, helle Spitze --- */
  const tail = new T.Group(); tail.position.set(0, .62, -.2); tail.rotation.x = .55; body.add(tail); P.tail = [];
  const rad = [.12, .19, .245, .265, .225], tw = [0, 0, 1, 2, 3], par0 = tail; let par = par0;
  for (let i = 0; i < 5; i++) {
    const sg = new T.Group(); sg.position.set(0, i ? .02 : 0, i ? -.24 : 0); sg.rotation.x = i ? .2 : 0; par.add(sg);
    const cream = i >= 3;
    furry(sg, [el(rad[i], rad[i], rad[i] * 1.5, 0, 0, -.12)], i === 2 ? OD : cream ? CR : O, i === 2 ? fTailD : cream ? fTailW : fTail);
    P.tail.push(sg); par = sg;
  }
  P.mats = { O, OD, GR, BR, PT }; P.furMats = FM;
  for (const g of [...P.legs, ...P.arms, ...P.ears]) mergeStatic(g);
  mergeChar(P, [P.backSword, P.scarf, P.tail[0]], P.ears);
  return P;
}

/** Fell über schon fertige Netze legen: map = [[Material, Fell-Material], ...]; Schalen übernehmen die Lage des Netzes. */
export function coat(T, root, map, shells) {
  const m = new Map(map), list = [];
  root.traverse(o => { if (o.isMesh && !o.isInstancedMesh && m.has(o.material)) list.push(o) });
  for (const o of list) {
    const sh = furShells(T, o.geometry, m.get(o.material), shells);
    sh.position.copy(o.position); sh.quaternion.copy(o.quaternion); sh.scale.copy(o.scale); o.parent.add(sh);
  }
}
