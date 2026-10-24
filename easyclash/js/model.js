/* EASYCLASH – Kämpfer-Modelle (Three.js r128, Toon-Look mit Kontur) mit Gelenken und Posen.
 * Ein gemeinsames Skelett (Hüfte, Rumpf, Kopf, Schultern/Ellbogen, Hüften/Knie) für alle Figuren; das Aussehen kommt aus dem Steckbrief
 * (look): Menschen, Tiere, Vögel, Roboter, Knuddel-Wesen – mit Haaren, Bart, Brille, Hüten, Ohren, Schnabel, Flügeln, Schwanz, Mikro usw.
 * Posen werden je Takt aus Zustand und Angriffsphase berechnet und weich überblendet. */
(function () {
  'use strict';
  const T3 = window.THREE;
  let grad = null, OUT = null, low = false;
  function setup(o) {
    low = !!(o && o.low);
    const d = new Uint8Array([90, 160, 230]); grad = new T3.DataTexture(d, 3, 1, T3.LuminanceFormat); grad.minFilter = grad.magFilter = T3.NearestFilter; grad.needsUpdate = true;
    OUT = new T3.MeshBasicMaterial({ color: 0x14101e, side: T3.BackSide });
  }
  const MATS = {};
  const toon = (c, e) => { const k = c + '|' + (e || ''); return MATS[k] || (MATS[k] = new T3.MeshToonMaterial(Object.assign({ color: new T3.Color(c), gradientMap: grad }, e ? { emissive: new T3.Color(e) } : {}))); };
  const G = {};
  const geo = (k, f) => G[k] || (G[k] = f());
  function mesh(g, m, p, o) { const x = new T3.Mesh(g, m); if (o !== false && !low) { const ol = new T3.Mesh(g, OUT); ol.scale.setScalar(o || 1.07); x.add(ol); } if (p) p.add(x); x.castShadow = !low; return x; }
  const sph = (r, s) => geo('s' + r + s, () => new T3.SphereGeometry(r, s || 14, Math.max(6, (s || 14) * .7 | 0)));
  const cyl = (a, b, h, s) => geo('c' + a + b + h + (s || 10), () => new T3.CylinderGeometry(a, b, h, s || 10));
  const bx = (w, h, d) => geo('b' + w + h + d, () => new T3.BoxGeometry(w, h, d));
  const cone = (r, h, s) => geo('k' + r + h + (s || 8), () => new T3.ConeGeometry(r, h, s || 8));
  // Gliedmaßen: Gruppe am Gelenk, Segment hängt nach unten
  function seg(par, len, r, mat, robot) {
    const g = new T3.Group(); par.add(g);
    const m = mesh(robot ? bx(r * 2, len, r * 2) : cyl(r, r * .88, len, 9), mat, g, 1.12); m.position.y = -len / 2;
    if (!robot) { const j = mesh(sph(r * 1.02, 9), mat, g, false); void j; }
    return g;
  }

  /* ---------- Figur bauen ---------- */
  function build(ch) {
    const L = Object.assign({ kind: 'human', skin: '#f2c6a4', top: '#5b6cff', bottom: '#2c3554', shoes: '#f4f4f8', hair: null, size: 1, bulk: 1 }, ch.look || {});
    const robot = L.kind === 'robot', bird = L.kind === 'bird', blob = L.kind === 'blob', beast = L.kind === 'beast';
    const root = new T3.Group(), J = {}; root.userData.J = J; root.userData.look = L;
    const sk = toon(L.skin), top = toon(L.top), bot = toon(L.bottom), sh = toon(L.shoes), hairM = L.hair ? toon(L.hair.color) : null;
    const s = L.size, w = L.bulk;
    const hip = J.hip = new T3.Group(); hip.position.y = .95; root.add(hip);
    const legLen = blob ? .3 : bird ? .38 : .44, armLen = .36;
    // Beine
    for (const side of [-1, 1]) {
      const up = J[side < 0 ? 'lHip' : 'rHip'] = seg(hip, legLen, .1 * w, bird ? toon(L.legs || '#ffa726') : bot, robot); up.position.set(side * .13 * w, 0, 0);
      const kn = J[side < 0 ? 'lKnee' : 'rKnee'] = seg(up, legLen, .085 * w, bird ? toon(L.legs || '#ffa726') : bot, robot); kn.position.y = -legLen;
      const ft = mesh(robot ? bx(.16, .1, .3) : bx(.15, .09, .27), bird ? toon(L.legs || '#ffa726') : sh, kn, 1.1); ft.position.set(0, -legLen - .02, .06);
    }
    // Rumpf
    const sp = J.spine = new T3.Group(); hip.add(sp);
    let torso;
    if (L.shape === 'tall') { torso = mesh(cyl(.3 * w, .3 * w, .85, 16), top, sp, 1.04); torso.position.y = .4; const b2 = mesh(sph(.3 * w, 14), top, sp, false); b2.position.y = -.02; const b3 = mesh(sph(.3 * w, 14), top, sp, 1.04); b3.position.y = .82; }
    else if (L.shape === 'roll') { torso = mesh(cyl(.38 * w, .38 * w, .8, 20), top, sp, 1.04); torso.position.y = .42; const hole = mesh(cyl(.13, .13, .02, 12), toon('#c8b89a'), sp, false); hole.position.y = .83; for (let k = 0; k < 3; k++) { const l = mesh(cyl(.385 * w, .385 * w, .01, 20), toon('#e0e0e0'), sp, false); l.position.y = .15 + k * .25; } }
    else if (blob || bird) { torso = mesh(sph(.42 * w, 18), top, sp, 1.04); torso.scale.set(1, 1.05, .95); torso.position.y = .32; }
    else if (robot) { torso = mesh(bx(.56 * w, .62, .36), top, sp, 1.04); torso.position.y = .34; }
    else { torso = mesh(cyl(.25 * w, .21 * w, .62, 14), top, sp, 1.04); torso.position.y = .32; const pel = mesh(cyl(.22 * w, .23 * w, .2, 12), bot, sp, 1.05); pel.position.y = .02; const ch2 = mesh(sph(.25 * w, 14), top, sp, false); ch2.scale.set(1.04, .5, .82); ch2.position.y = .62; }
    if (L.belly) { const b = mesh(sph(.2 * w, 12), toon(L.belly), sp, false); b.scale.set(1, 1.2, .5); b.position.set(0, .3, .2 * w + (blob || bird ? .14 : 0)); }
    if (L.bumps) for (let k = 0; k < 10; k++) { const b = mesh(sph(.04, 6), toon(L.bumps), sp, false); const a = k * 2.4; b.position.set(Math.cos(a) * .3 * w, .1 + (k % 5) * .17, Math.sin(a) * .3 * w); }
    if (L.print) { const p = mesh(bx(.2, .1, .02), toon(L.print), sp, false); p.position.set(0, .44, (robot ? .19 : .24) * w); }
    if (L.jacket) { for (const sx of [-1, 1]) { const j = mesh(bx(.13 * w, .6, .44 * w), toon(L.jacket), sp, 1.04); j.position.set(sx * .17 * w, .34, 0); } }
    if (L.cape) { const c = mesh(bx(.5 * w, .9, .04), toon(L.cape), sp, false); c.position.set(0, .2, -.24 * w); c.rotation.x = .12; J.cape = c; }
    // Arme (bei Vögeln Flügel)
    const shY = L.shape ? .55 : blob || bird ? .42 : .6;
    for (const side of [-1, 1]) {
      const sh2 = J[side < 0 ? 'lSh' : 'rSh'] = new T3.Group(); sh2.position.set(side * (.33 * w + (blob || bird ? .1 : 0)), shY, 0); sp.add(sh2);
      if (bird) { const wing = mesh(bx(.08, .5, .32), toon(L.wing || L.top), sh2, 1.08); wing.position.y = -.22; J[side < 0 ? 'lEl' : 'rEl'] = new T3.Group(); sh2.add(J[side < 0 ? 'lEl' : 'rEl']); continue; }
      const ua = seg(sh2, armLen, .075, L.sleeves === false ? sk : top, robot); void ua;
      const el = J[side < 0 ? 'lEl' : 'rEl'] = seg(sh2, armLen, .068, robot ? top : sk, robot); el.position.y = -armLen;
      const hand = mesh(robot ? bx(.14, .14, .14) : sph(.085, 10), L.gloves ? toon(L.gloves) : robot ? toon(L.bottom) : sk, el, 1.1); hand.position.y = -armLen - .03;
      if (side > 0 && L.mic) { const mic = mesh(cyl(.035, .03, .18, 8), toon('#26232b'), el, 1.1); mic.position.set(0, -armLen - .08, .07); const gr = mesh(sph(.045, 8), toon('#77757f'), mic, false); gr.position.y = .1; }
    }
    // Kopf
    const hd = J.head = new T3.Group(); hd.position.y = L.shape === 'roll' ? .3 : L.shape ? .62 : blob || bird ? .78 : .92; sp.add(hd);
    const hr = (L.head || 1) * (L.shape === 'roll' ? .36 : L.shape ? .3 : blob || bird ? .3 : .25);
    let skull;
    if (robot) { skull = mesh(bx(hr * 1.8, hr * 1.6, hr * 1.6), toon(L.skin), hd, 1.05); skull.position.y = hr * .8; }
    else if (L.shape) { skull = new T3.Group(); hd.add(skull); }
    else { skull = mesh(sph(hr, 18), sk, hd, 1.05); skull.position.y = hr * .9; skull.scale.set(1, 1.05, .98); }
    const fz = L.shape === 'roll' ? .4 * w : L.shape ? .31 * w : hr * .92, fy = hr * .95;
    // Augen
    const eyeC = toon(L.eyes || '#2a1a10'), white = toon('#ffffff');
    for (const sx of [-1, 1]) {
      if (robot) { const e = mesh(bx(hr * .38, hr * .22, .03), toon(L.eyes || '#00e5ff', L.eyes || '#00b8d4'), hd, false); e.position.set(sx * hr * .4, fy + hr * .05, hr * .81); continue; }
      const w2 = mesh(sph(hr * .22, 10), white, hd, false); w2.scale.set(1, 1.15, .5); w2.position.set(sx * hr * .36, fy + hr * .1, fz * .93);
      const ir = mesh(sph(hr * .13, 8), eyeC, w2, false); ir.position.set(0, 0, hr * .16);
    }
    // Brauen
    if (!robot && !bird) for (const sx of [-1, 1]) { const b = mesh(bx(hr * .42, hr * .09, .03), toon(L.brows || (L.hair ? L.hair.color : '#3a2a1a')), hd, false); b.position.set(sx * hr * .36, fy + hr * .42, fz * .95); b.rotation.z = sx * -.15; J[sx < 0 ? 'lBrow' : 'rBrow'] = b; }
    // Nase/Schnabel/Schnauze
    if (bird) { const bk = mesh(cone(hr * .3, hr * .8, 8), toon(L.beak || '#ffb300'), hd, 1.08); bk.rotation.x = Math.PI / 2; bk.position.set(0, fy - hr * .1, fz + hr * .3); }
    else if (beast) { const sn = mesh(sph(hr * .42, 10), toon(L.snout || L.skin), hd, 1.06); sn.scale.set(1.1, .8, 1); sn.position.set(0, fy - hr * .3, fz * .95); const n = mesh(sph(hr * .13, 8), toon('#1b1b1b'), sn, false); n.position.set(0, hr * .12, hr * .36); }
    else if (!robot) { const n = mesh(sph(hr * .14, 8), sk, hd, false); n.position.set(0, fy - hr * .08, fz * 1.02); }
    // Mund
    const mo = J.mouth = mesh(sph(hr * .16, 8), toon('#5a1a1a'), hd, false); mo.scale.set(1.4, .35, .5); mo.position.set(0, fy - hr * .45, fz * .97);
    // Bart, Septum, Ohr-Plug
    if (L.beard) { const bd = mesh(new T3.SphereGeometry(hr * 1.04, 18, 10, 0, Math.PI, Math.PI * .6, Math.PI * .35), toon(L.beard), hd, 1.03); bd.position.y = fy - hr * .05; bd.scale.set(1, 1.2, 1.08); const mu = mesh(bx(hr * .6, hr * .14, hr * .2), toon(L.beard), hd, false); mu.position.set(0, fy - hr * .3, fz); }
    if (L.septum) { const r = mesh(new T3.TorusGeometry(hr * .12, hr * .035, 5, 12), toon(L.septum, '#555'), hd, false); r.position.set(0, fy - hr * .27, fz * 1.06); }
    if (L.earplug) { const e = mesh(cyl(hr * .14, hr * .14, .03, 10), toon('#17141c'), hd, false); e.rotation.z = Math.PI / 2; e.position.set(hr * 1.02, fy - hr * .2, 0); }
    if (L.glasses) for (const sx of [-1, 1]) { const g = mesh(new T3.TorusGeometry(hr * .2, hr * .03, 5, 14), toon(L.glasses), hd, false); g.position.set(sx * hr * .36, fy + hr * .1, fz * 1.02); }
    if (L.shades) { const g = mesh(bx(hr * 1.5, hr * .3, .04), toon('#151515'), hd, false); g.position.set(0, fy + hr * .1, fz * 1.02); }
    // Ohren
    if (L.ears) {
      const ec = toon(L.earColor || L.skin);
      for (const sx of [-1, 1]) {
        let e;
        if (L.ears === 'cat' || L.ears === 'fox') { e = mesh(cone(hr * .3, hr * .6, 4), ec, hd, 1.08); e.position.set(sx * hr * .55, fy + hr * .95, 0); e.rotation.z = sx * -.3; }
        else if (L.ears === 'bunny') { e = mesh(cyl(hr * .12, hr * .16, hr * 1.4, 8), ec, hd, 1.08); e.position.set(sx * hr * .35, fy + hr * 1.5, 0); e.rotation.z = sx * -.15; }
        else { e = mesh(sph(hr * .28, 10), ec, hd, 1.08); e.position.set(sx * hr * .7, fy + hr * .75, 0); e.scale.z = .5; }
      }
    } else if (!robot && !bird && !blob && !L.shape) for (const sx of [-1, 1]) { const e = mesh(sph(hr * .2, 8), sk, hd, false); e.scale.set(.5, 1, .8); e.position.set(sx * hr * .98, fy, 0); }
    // Haare
    if (L.hair && !robot) hair(hd, L.hair.style, hairM, hr, fy, fz);
    // Hüte und Kopfschmuck
    if (L.hat) hat(hd, L.hat, hr, fy);
    if (L.horn) { const h = mesh(cone(hr * .16, hr * .9, 8), toon(L.horn), hd, 1.08); h.position.set(0, fy + hr * 1.2, hr * .4); h.rotation.x = .4; }
    if (L.antenna) { const a = mesh(cyl(.012, .012, hr * 1.2, 5), toon('#90a4ae'), hd, false); a.position.set(0, hr * 2.2, 0); const b = mesh(sph(hr * .16, 8), toon(L.antenna, L.antenna), a, false); b.position.y = hr * .6; }
    if (L.headphones) { const h = mesh(new T3.TorusGeometry(hr * 1.02, hr * .08, 5, 16, Math.PI), toon('#17141c'), hd, false); h.position.y = fy; for (const sx of [-1, 1]) { const c = mesh(cyl(hr * .3, hr * .3, hr * .2, 10), toon('#17141c'), hd, false); c.rotation.z = Math.PI / 2; c.position.set(sx * hr, fy, 0); } }
    // Schwanz / Rucksack / Flügel am Rücken
    if (L.tail) { const t = J.tail = mesh(cyl(.05, .09, .5, 8), toon(L.tail), hip, 1.1); t.position.set(0, .05, -.28 * w); t.rotation.x = -.9; }
    if (L.backpack) { const b = mesh(bx(.36 * w, .4, .18), toon(L.backpack), sp, 1.06); b.position.set(0, .36, -.28 * w); }
    if (L.wings && !bird) for (const sx of [-1, 1]) { const wg = mesh(bx(.04, .5, .36), toon(L.wings), sp, 1.06); wg.position.set(sx * .22, .5, -.3); wg.rotation.z = sx * .6; }
    if (L.scarf) { const sc = mesh(new T3.TorusGeometry(.2 * w, .06, 6, 14), toon(L.scarf), sp, false); sc.rotation.x = Math.PI / 2; sc.position.y = .72; }
    if (L.weapon === 'sword') { const sw = mesh(bx(.05, .7, .03), toon('#cfd8dc', '#556'), J.rEl, 1.1); sw.position.set(0, -armLen - .35, .05); }
    root.scale.setScalar(s); root.userData.hr = hr;
    root.traverse(o => { if (o.isMesh && !low && o.material !== OUT) o.castShadow = true; });
    return root;
  }
  function hair(hd, st, m, r, fy, fz) {
    const cap = (th, sc) => { const c = mesh(new T3.SphereGeometry(r * 1.06, 16, 10, 0, Math.PI * 2, 0, Math.PI * th), m, hd, 1.04); c.position.y = fy; if (sc) c.scale.set(sc[0], sc[1], sc[2]); return c; };
    if (st === 'bald') return;
    if (st === 'buzz') { cap(.42); return; }
    if (st === 'spiky') { cap(.45); for (const [x, z, rx, rz] of [[0, .3, -.6, 0], [.4, .2, -.4, -.6], [-.4, .2, -.4, .6], [0, -.2, .4, 0], [.3, -.1, .2, -.7], [-.3, -.1, .2, .7], [0, .5, -1, 0]]) { const c = mesh(cone(r * .3, r * .8, 6), m, hd, 1.08); c.position.set(x * r, fy + r * .9, z * r); c.rotation.set(rx, 0, rz); } return; }
    if (st === 'mohawk') { for (let i = 0; i < 5; i++) { const c = mesh(cone(r * .22, r * .8, 6), m, hd, 1.08); c.position.set(0, fy + r * .95, (-.5 + i * .25) * r); } return; }
    if (st === 'bowl') { const c = cap(.55, [1.05, 1.05, 1.05]); c.position.y = fy - r * .05; return; }
    if (st === 'fringe') { cap(.5); const f = mesh(bx(r * 1.6, r * .45, r * .3), m, hd, 1.06); f.position.set(0, fy + r * .55, fz * .85); for (const sx of [-1, 1]) { const sd = mesh(bx(r * .3, r * 1.2, r * 1.4), m, hd, 1.05); sd.position.set(sx * r * .92, fy - r * .1, -r * .15); } return; }
    if (st === 'long') { cap(.5); const b = mesh(bx(r * 2, r * 2, r * .5), m, hd, 1.05); b.position.set(0, fy - r * .5, -r * .7); for (const sx of [-1, 1]) { const sd = mesh(bx(r * .35, r * 1.8, r * 1.2), m, hd, 1.05); sd.position.set(sx * r * .9, fy - r * .4, -r * .15); } return; }
    if (st === 'bob') { cap(.5); const b = mesh(sph(r * 1.12, 14), m, hd, 1.04); b.scale.set(1.05, .85, 1); b.position.set(0, fy - r * .1, -r * .2); return; }
    if (st === 'pony') { cap(.5); const p = mesh(cyl(r * .2, r * .3, r * 1.4, 8), m, hd, 1.08); p.position.set(0, fy + r * .2, -r * 1.1); p.rotation.x = -.6; return; }
    if (st === 'bun') { cap(.5); const b = mesh(sph(r * .4, 10), m, hd, 1.08); b.position.set(0, fy + r * 1.1, -r * .3); return; }
    if (st === 'curly') { cap(.5); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, c = mesh(sph(r * .32, 8), m, hd, 1.06); c.position.set(Math.cos(a) * r * .8, fy + r * .55 + Math.sin(i) * .02, Math.sin(a) * r * .8); } return; }
    if (st === 'afro') { const b = mesh(sph(r * 1.5, 14), m, hd, 1.04); b.position.set(0, fy + r * .55, -r * .15); return; }
    cap(.48); // kurz (Standard)
  }
  function hat(hd, h, r, fy) {
    const m = toon(h.color || '#e53935');
    if (h.type === 'cap') { const c = mesh(new T3.SphereGeometry(r * 1.08, 16, 8, 0, Math.PI * 2, 0, Math.PI * .45), m, hd, 1.04); c.position.y = fy; const sch = mesh(bx(r * 1.2, r * .08, r * .8), m, hd, 1.08); sch.position.set(0, fy + r * .45, r * 1.05); }
    else if (h.type === 'crown') { const c = mesh(cyl(r * .7, r * .7, r * .5, 8, 1, true), toon('#ffd23f', '#6a4a00'), hd, 1.06); c.position.y = fy + r * 1.1; }
    else if (h.type === 'helmet') { const c = mesh(new T3.SphereGeometry(r * 1.2, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55), m, hd, 1.04); c.position.y = fy; const v = mesh(bx(r * 1.6, r * .5, r * .2), toon('#2b3a8a', '#101a40'), hd, false); v.position.set(0, fy + r * .1, r * 1.05); }
    else if (h.type === 'band') { const c = mesh(cyl(r * 1.06, r * 1.06, r * .25, 16, 1, true), m, hd, false); c.position.y = fy + r * .45; }
    else if (h.type === 'tophat') { const c = mesh(cyl(r * .7, r * .7, r * 1.1, 14), m, hd, 1.05); c.position.y = fy + r * 1.4; const b = mesh(cyl(r * 1.1, r * 1.1, r * .08, 14), m, hd, 1.05); b.position.y = fy + r * .85; }
    else if (h.type === 'beanie') { const c = mesh(new T3.SphereGeometry(r * 1.1, 16, 10, 0, Math.PI * 2, 0, Math.PI * .5), m, hd, 1.04); c.position.y = fy + r * .05; const p = mesh(sph(r * .25, 8), toon('#ffffff'), hd, false); p.position.y = fy + r * 1.15; }
    else if (h.type === 'sunglasses') { const g = mesh(bx(r * 1.5, r * .25, .04), toon('#151515'), hd, false); g.position.set(0, fy + r * 1.0, r * .6); g.rotation.x = -.5; }
  }

  /* ---------- Posen ---------- */
  const P0 = { hipY: 0, hipX: 0, spX: .08, spY: -.35, hdX: 0, hdY: .3, lShX: -1.1, lShZ: .25, lElX: -1.7, rShX: -1.0, rShZ: -.3, rElX: -1.9, lHipX: -.35, lHipZ: .1, lKnX: .45, rHipX: .25, rHipZ: -.12, rKnX: .5, rootY: 0, rootRY: 0, lean: 0 };
  const pose = o => Object.assign({}, P0, o);
  const LIB = {
    idle: pose({}), crouch: pose({ hipY: -.32, spX: .35, lHipX: -1.4, lKnX: 2.0, rHipX: -.9, rKnX: 1.9 }),
    walk: pose({}), block: pose({ spX: .2, lShX: -1.5, lElX: -2.3, rShX: -1.4, rElX: -2.3, lShZ: .1, rShZ: -.1, hdX: .2 }),
    cblock: pose({ hipY: -.32, spX: .45, lHipX: -1.4, lKnX: 2.0, rHipX: -.9, rKnX: 1.9, lShX: -1.6, lElX: -2.3, rShX: -1.5, rElX: -2.3 }),
    jab: pose({ spY: -.55, lShX: -1.55, lShZ: .05, lElX: -.05 }), jab2: pose({ spY: .25, rShX: -1.55, rShZ: -.05, rElX: -.05, lShX: -1.1, lElX: -1.8 }),
    jab3: pose({ spY: -.7, spX: .2, lShX: -1.6, lElX: -.1, lHipX: -.8, lKnX: .8, hipX: .2 }),
    kick: pose({ spX: -.25, rHipX: -1.6, rKnX: .2, lHipX: .1, lKnX: .2, lean: -.1 }), kick2: pose({ spY: 1.2, spX: -.35, rHipX: -1.4, rHipZ: -1.3, rKnX: .1, rootRY: 1.2 }),
    jabk: pose({ spX: -.3, lHipX: -1.9, lKnX: .1, rHipX: .2 }),
    low: pose({ hipY: -.3, spX: .5, lHipX: -1.4, lKnX: 2, rHipX: -.9, rKnX: 1.9, lShX: -.9, lElX: -.1 }),
    sweep: pose({ hipY: -.45, spX: .6, lHipX: -1.2, lKnX: 2.2, rHipX: -.1, rHipZ: -1.4, rKnX: .1, rootRY: .9 }),
    power: pose({ spY: .5, spX: .25, rShX: -1.65, rShZ: -.1, rElX: -.1, lShX: -.6, lElX: -1.4, lHipX: -.9, lKnX: .9, hipX: .3 }),
    launcher: pose({ spX: -.4, rHipX: -2.6, rKnX: .2, lHipX: .3, lKnX: .1, lShX: -.4, rShX: -.3, hdX: -.3 }),
    air: pose({ rHipX: -1.5, rKnX: .3, lHipX: -.6, lKnX: 1.6, spX: -.2 }),
    throw: pose({ lShX: -1.5, lElX: -.4, rShX: -1.5, rElX: -.4, spX: .3 }),
    grab: pose({ lShX: -1.4, lElX: -.6, rShX: -1.2, rElX: -.8, spX: .1, spY: .9 }),
    special: pose({ spY: -.2, lShX: -1.55, lElX: 0, rShX: -1.55, rElX: 0, lShZ: -.15, rShZ: .15, lHipX: -.7, lKnX: .7 }),
    rush: pose({ spX: .5, spY: -.3, lShX: -1.6, lElX: 0, rShX: -.3, rElX: -1.2, lHipX: -1.0, lKnX: .5, rHipX: .6 }),
    spin: pose({ lShZ: 1.4, rShZ: -1.4, lShX: 0, rShX: 0, lElX: 0, rElX: 0 }),
    dive: pose({ spX: .9, lShX: -2.8, rShX: -2.8, lElX: 0, rElX: 0, lHipX: .4, rHipX: .4 }),
    upper: pose({ spX: -.35, rShX: -3.0, rElX: -.1, lShX: -.5, lHipX: -.5, lKnX: .3, hdX: -.4 }),
    stomp: pose({ hipY: -.25, spX: .4, lShX: .3, rShX: .3, lElX: -.2, rElX: -.2, rHipX: -1.6, rKnX: 1.4 }),
    finale: pose({ spX: -.2, lShX: -3.0, rShX: -3.0, lShZ: .5, rShZ: -.5, lElX: 0, rElX: 0, hdX: -.4 }),
    hit: pose({ spX: -.45, hdX: -.4, lShX: -.3, rShX: -.2, lElX: -.8, rElX: -.7, hipX: -.1 }),
    hitlow: pose({ spX: .5, hdX: .3, hipY: -.1, lHipX: -.6, lKnX: .9 }),
    air2: pose({ spX: -.9, hdX: -.5, lShX: -2.2, rShX: -2, lElX: -.2, rElX: -.2, lHipX: -.6, rHipX: -.2, lKnX: .7, rKnX: .3 }),
    down: pose({ hipY: -.78, spX: -1.5, hdX: -.1, lShX: -2.6, rShX: -2.4, lElX: -.2, rElX: -.2, lHipX: -1.5, rHipX: -1.4, lKnX: .2, rKnX: .3 }),
    getup: pose({ hipY: -.35, spX: .5, lHipX: -1.4, lKnX: 2, rHipX: -.6, rKnX: 1.6, lShX: -.6, rShX: -.6 }),
    ko: pose({ hipY: -.78, spX: -1.55, hdX: -.3, lShX: -2.9, rShX: -2.5, lShZ: .6, rShZ: -.6, lElX: 0, rElX: 0, lHipX: -1.5, rHipX: -1.5, lKnX: 0, rKnX: 0 }),
    thrown: pose({ spX: -.6, hdX: -.4, lShX: -2.6, rShX: -2.4, lElX: 0, rElX: 0, lHipX: -.5, rHipX: -.2 }),
    win: pose({ spX: -.15, spY: 0, lShX: -3.0, lShZ: .3, lElX: -.2, rShX: -.2, rShZ: -.2, rElX: -1.6, hdX: -.25, lHipX: -.1, rHipX: -.1, lKnX: .1, rKnX: .1 }),
    side: pose({ spX: .1, lean: .35 })
  };
  const WIND = { jab: { lShX: -.9, lElX: -2.0 }, kick: { rHipX: -.6, rKnX: 1.6 }, power: { spY: -.6, rShX: -.6, rElX: -1.9 }, launcher: { hipY: -.15, rHipX: -.3, rKnX: 1.2 }, sweep: { hipY: -.35, spX: .5 }, special: { lShX: -.6, rShX: -.6, lElX: -2, rElX: -2, spY: -.8 }, finale: { hipY: -.2, spX: .4, lShX: -.4, rShX: -.4 } };
  const lerpP = (a, b, k) => { const o = {}; for (const n in a) o[n] = a[n] + ((b[n] != null ? b[n] : a[n]) - a[n]) * k; return o; };
  // Zielpose aus Zustand
  function target(F, tt) {
    const s = F.state;
    if (s === 'attack' && F.mv) {
      const id = F.mvId === 'special' ? (F.ch.sp || 'special') : F.mvId, m = F.mv, base = LIB[id] || LIB[F.mvId === 'special' ? 'special' : 'jab'];
      const wd = Object.assign({}, P0, WIND[id] || WIND[F.mvId === 'special' ? 'special' : ''] || {});
      if (F.t < m.st) return lerpP(P0, lerpP(wd, base, Math.max(0, (F.t - m.st * .55) / (m.st * .45))), Math.min(1, F.t / Math.max(1, m.st * .5)));
      if (F.t < m.st + m.act + 4) return base;
      return lerpP(base, P0, Math.min(1, (F.t - m.st - m.act - 4) / Math.max(4, m.rec * .7)));
    }
    if (s === 'walk' || s === 'walkb') { const ph = tt * (s === 'walk' ? 9 : -8); return pose({ lHipX: -.35 + Math.sin(ph) * .45, rHipX: .25 - Math.sin(ph) * .45, lKnX: .45 + Math.max(0, Math.cos(ph)) * .6, rKnX: .5 + Math.max(0, -Math.cos(ph)) * .6, hipY: Math.abs(Math.sin(ph)) * .03 }); }
    if (s === 'dash') return pose({ spX: .45, lHipX: -1, lKnX: .9, rHipX: .5 });
    if (s === 'bdash') return pose({ spX: -.25, lHipX: .3, rHipX: -.6, rKnX: .8 });
    if (s === 'crouch') return F.block ? LIB.cblock : LIB.crouch;
    if (s === 'block') return F.crouch >= 8 ? LIB.cblock : LIB.block;
    if (s === 'hit') return F.stunKind === 'low' ? LIB.hitlow : LIB.hit;
    if (s === 'air') return LIB.air2;
    if (s === 'jump') return pose({ lHipX: -1.2, lKnX: 1.8, rHipX: -.6, rKnX: 1.5, hipY: .02 });
    if (LIB[s]) return LIB[s];
    if (s === 'idle' && F.block) return LIB.block;
    const br = Math.sin(tt * 3.2) * .03; return pose({ hipY: -.03 + br, spX: .08 + br });
  }
  function apply(model, F, dt, tt) {
    const J = model.userData.J, tp = target(F, tt), k = Math.min(1, dt * (F.state === 'attack' ? 30 : 16)), c = model.userData.cur || (model.userData.cur = Object.assign({}, P0));
    for (const n in tp) c[n] += (tp[n] - c[n]) * k;
    J.hip.position.y = .95 + c.hipY; J.hip.position.z = c.hipX * .3; J.hip.rotation.z = c.lean;
    J.spine.rotation.set(c.spX, c.spY, 0); J.head.rotation.set(c.hdX, c.hdY * .4, 0);
    J.lSh.rotation.set(c.lShX, 0, c.lShZ); J.rSh.rotation.set(c.rShX, 0, c.rShZ); J.lEl.rotation.x = c.lElX * (J.lEl.children.length ? 1 : 0); J.rEl.rotation.x = c.rElX;
    J.lHip.rotation.set(c.lHipX, 0, c.lHipZ); J.rHip.rotation.set(c.rHipX, 0, c.rHipZ); J.lKnee.rotation.x = c.lKnX; J.rKnee.rotation.x = c.rKnX;
    model.userData.spin = c.rootRY;
    if (J.tail) J.tail.rotation.z = Math.sin(tt * 6) * .3;
    if (J.mouth) J.mouth.scale.y = F.state === 'attack' || F.state === 'hit' || F.state === 'win' ? .9 : .35;
  }

  window.ECModel = { setup, build, apply, toon };
})();
