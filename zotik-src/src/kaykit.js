/* KayKit-Figuren und -Requisiten von Kay Lousberg (CC0, www.kaylousberg.com), aufbereitet mit tools/make-zotik-kaykit.mjs → models/kk/
   - char(id, o): Figur mit Skelett-Bewegungen (Idle, Gehen, Laufen, Treffer, Tod, Erscheinen, Werfen …), Waffen an den Handknochen
   - prop(name): Klon eines Requisits (Dungeon-Pack, Waffen), place(par, list): viele gleiche Requisiten als Instanzen (wenige Zeichenaufrufe)
   Bis die Dateien geladen sind, bleibt die Gruppe leer – nichts hängt davon ab. Gezeichnet mit Cel-Shading wie die übrigen Figuren. */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
const skClone = o => SkeletonUtils.clone(o);

export function createKayKit({ T, G, TOUCH }) {
  const files = {}, load = k => files[k] || (files[k] = new Promise((res, rej) => new GLTFLoader().load('models/kk/' + k + '.glb', res, null, rej)));
  let clips = null;
  // Die Animationsdatei benennt ihre Knochen beim Laden eindeutig um (hips → hips_1); ohne Rückbenennung landen alle Spuren auf dem Modell selbst (Figur kippt, liegt, verschwindet)
  const anims = () => load('anim').then(g => clips || (clips = Object.fromEntries(g.animations.map(a => { for (const t of a.tracks) t.name = t.name.replace(/_1(?=\.(quaternion|position|scale)$)/, ''); return [a.name, a]; }))));
  /* Materialien: Cel-Shading mit der Farbtextur, „Glow“ (Augen der Skelette) leuchtet */
  const mats = new Map();
  function toon(src, skin) {
    const k = src.uuid + (skin ? 's' : ''); if (mats.has(k)) return mats.get(k);
    const glowM = /glow/i.test(src.name || '') || (src.emissive && src.emissive.getHex() > 0 && !src.map);
    const m = glowM ? new T.MeshBasicMaterial({ color: src.emissive && src.emissive.getHex() ? src.emissive : 0xffffff, skinning: skin })
      : new T.MeshToonMaterial({ map: src.map, color: 0xffffff, gradientMap: G, skinning: skin });
    if (m.map) { m.map.encoding = T.sRGBEncoding; m.map.anisotropy = TOUCH ? 4 : 8; }
    m.name = src.name; mats.set(k, m); return m;
  }
  const dress = (root, skin) => root.traverse(o => { if (!o.isMesh) return; o.material = toon(o.material, !!o.isSkinnedMesh); o.castShadow = !TOUCH; o.receiveShadow = false; if (o.isSkinnedMesh) o.frustumCulled = false; });
  const H = {};   // Höhe je Figur (aus der Ruhepose)
  const LIVE = new Set();
  const WPN = { r: 'handslotr', l: 'handslotl' };   // three entfernt Punkte aus Knotennamen

  /* Umfärben nach Steckbrief (Master-Sheet): Die KayKit-Textur ist ein Raster aus 8×4 Farbverläufen. Je Rolle (Haar, Haut, Oberteil, Umhang, Hose)
     werden die passenden Felder neu eingefärbt, der Helligkeitsverlauf bleibt erhalten. o.pal = { hair, skin, top, top2, pants, eye } */
  const RC = { hair: { '*': [[1, 0]] }, skin: { '*': [[0, 0]] }, eye: { '*': [[2, 0]] }, pants: { '*': [[3, 2]], ad_kn: [], ad_ba: [[3, 2]] },
    top: { ad_ma: [[0, 1]], ad_ro: [[0, 1], [5, 0]], ad_rh: [[0, 1], [5, 0]], ad_ra: [[7, 0]], ad_kn: [[7, 0]], ad_ba: [[7, 0]] },
    top2: { ad_ma: [[1, 1], [2, 1]], ad_ro: [[1, 1]], ad_rh: [[1, 1]], ad_ra: [[0, 1]], ad_kn: [[0, 1], [6, 0]], ad_ba: [[2, 1]] } };
  const rtex = new Map();
  function recolor(img, id, pal) {
    const key = id + JSON.stringify(pal); if (rtex.has(key)) return rtex.get(key);
    const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, S, S);
    const cw = S / 8, ch = S / 4;
    for (const role in pal) { const cells = RC[role] && (RC[role][id] || RC[role]['*']); if (!cells || pal[role] == null) continue;
      const tr = (pal[role] >> 16 & 255), tg = (pal[role] >> 8 & 255), tb = pal[role] & 255, tl = (tr * .3 + tg * .59 + tb * .11) || 1;
      for (const [c, r] of cells) { const d = x.getImageData(c * cw, r * ch, cw, ch), p = d.data; let L0 = 0; for (let i = 0; i < p.length; i += 4) L0 += p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11; L0 = L0 / (p.length / 4) || 1;
        for (let i = 0; i < p.length; i += 4) { const k = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / L0; p[i] = Math.min(255, tr * k); p[i + 1] = Math.min(255, tg * k); p[i + 2] = Math.min(255, tb * k); }
        x.putImageData(d, c * cw, r * ch); } }
    const tx = new T.CanvasTexture(cv); tx.flipY = false; tx.encoding = T.sRGBEncoding; tx.anisotropy = 4; rtex.set(key, tx); return tx;
  }
  /** Figur: o.h Zielhöhe (m), o.r / o.l Requisit in der rechten/linken Hand, o.tint Farbton (0..1 Mischung o.tk), o.hide RegExp: Teile ausblenden (Helm, Hut, Umhang …), o.pal Farben je Rolle (siehe recolor) */
  function char(id, o = {}) {
    const root = new T.Group(), P = { root, id, ready: false, mixer: null, act: {}, cur: '', want: 'Idle_A', once: null, swing: 0, bones: {}, speed: 1 };
    Promise.all([load(id), anims(), (o.r || o.l) ? load('props') : null]).then(([g, cl]) => {
      const c = skClone(g.scene); dress(c, true);
      if (!H[id]) { g.scene.updateMatrixWorld(true); const b = new T.Box3().setFromObject(g.scene); H[id] = Math.max(.5, b.max.y - b.min.y); }
      c.scale.setScalar((o.h || 1.8) / H[id]);
      c.traverse(b => { if (b.isBone) P.bones[b.name] = b; });
      if (o.pal) { const mm = new Map(); c.traverse(m => { if (!m.isMesh || !m.material.map || !m.material.map.image) return; let n = mm.get(m.material); if (!n) { n = m.material.clone(); n.map = recolor(m.material.map.image, id, o.pal); mm.set(m.material, n); } m.material = n; }); }
      if (o.hide) c.traverse(m => { if (m.isMesh && o.hide.test(m.name)) m.visible = false; });
      if (o.tint) c.traverse(m => { if (m.isMesh && m.material.color && m.material.map) { m.material = m.material.clone(); m.material.color.lerp(new T.Color(o.tint), o.tk ?? .35); } });
      for (const s of ['r', 'l']) if (o[s]) { const w = prop(o[s]), b = P.bones[WPN[s]]; if (b) { b.add(w); if (o[s + 'rot']) w.rotation.set(...o[s + 'rot']); } }
      root.add(c); P.mixer = new T.AnimationMixer(c);
      for (const n in cl) P.act[n] = P.mixer.clipAction(cl[n]);
      for (const n of ['Death_A', 'Hit_A', 'Spawn_Ground', 'Throw', 'Use_Item', 'Interact']) if (P.act[n]) { P.act[n].setLoop(T.LoopOnce, 1); P.act[n].clampWhenFinished = true; }
      P.mixer.addEventListener('finished', () => { P.once = null; play(P, P.want, .15); });
      P.ready = true; play(P, P.want, 0);
    }).catch(() => { });
    LIVE.add(P); return P;
  }
  /** Bestie (Quaternius „Bestiary“, im Spiel frei nutzbar): Imp, Puglin – ohne mitgelieferte Bewegungen, daher prozedural über die Knochen.
      o.h Zielhöhe, o.v Farbvariante (2/3) */
  const qbf = {}, qload = k => qbf[k] || (qbf[k] = new Promise((res, rej) => new GLTFLoader().load('models/qb/' + k + '.glb', res, null, rej)));
  const vtex = {}, vload = (k, v) => vtex[k + v] || (vtex[k + v] = new T.TextureLoader().load('models/qb/' + k + '_' + v + '.jpg', t => { t.flipY = false; t.encoding = T.sRGBEncoding; }));
  function beast(id, o = {}) {
    const root = new T.Group(), P = { root, id, proc: true, ready: false, bones: {}, rest: {}, ph: Math.random() * 6, spd: 0, swing: 0, hit: 0, dead: 0, cur: 'Idle' };
    qload(id).then(g => {
      const c = skClone(g.scene); c.traverse(m => { if (!m.isMesh) return; const s = m.material, k = s.uuid + (o.v || 1);
        if (!mats.has(k)) mats.set(k, new T.MeshToonMaterial({ map: o.v ? vload(id, o.v) : s.map, color: 0xffffff, gradientMap: G, skinning: true, emissive: 0xffffff, emissiveMap: s.emissiveMap, emissiveIntensity: s.emissiveMap ? 1.6 : 0, side: T.DoubleSide }));
        if (s.map) s.map.encoding = T.sRGBEncoding; m.material = mats.get(k); m.castShadow = !TOUCH; m.frustumCulled = false; });
      g.scene.updateMatrixWorld(true);
      if (!H['qb' + id]) { const b = new T.Box3().setFromObject(g.scene); H['qb' + id] = Math.max(.3, b.max.y - b.min.y); }
      c.scale.setScalar((o.h || 1.6) / H['qb' + id]); if (o.ry) c.rotation.y = o.ry;
      const body = new T.Group(); body.add(c); root.add(body); P.body = body; P.model = c;
      c.updateMatrixWorld(true); const iq = c.getWorldQuaternion(new T.Quaternion()).invert();
      c.traverse(b => { if (!b.isBone) return; P.bones[b.name] = b; const pw = b.parent.getWorldQuaternion(new T.Quaternion()).premultiply(iq); P.rest[b.name] = { q: b.quaternion.clone(), pw, pwi: pw.clone().invert(), p: b.position.clone() }; });
      P.ready = true;
    }).catch(() => { });
    LIVE.add(P); return P;
  }
  const _q = new T.Quaternion(), _ax = new T.Vector3();
  /* Knochen um eine Achse im Figurenraum drehen (unabhängig von der Achsenlage im Modell) */
  function rot(P, n, x, y, z) { const b = P.bones[n], r = P.rest[n]; if (!b) return; b.quaternion.copy(r.q);   // Reihenfolge: erst z (Arme senken), dann y, dann x (Schwingen)
    if (z) { _q.setFromAxisAngle(_ax.set(0, 0, 1), z); b.quaternion.premultiply(r.pwi.clone().multiply(_q).multiply(r.pw)); }
    if (y) { _q.setFromAxisAngle(_ax.set(0, 1, 0), y); b.quaternion.premultiply(r.pwi.clone().multiply(_q).multiply(r.pw)); }
    if (x) { _q.setFromAxisAngle(_ax.set(1, 0, 0), x); b.quaternion.premultiply(r.pwi.clone().multiply(_q).multiply(r.pw)); } }
  function procAnim(P, dt) {
    const v = P.spd, a = P.swing, B = P.body;
    if (P.dead > 0) { P.dead += dt; const k = Math.min(1, P.dead / .6); B.rotation.x = -1.45 * k * k; B.position.y = -.1 * k; P.cur = 'Death'; return; }
    B.rotation.x = 0; B.position.y = 0;
    P.ph += dt * (3 + v * 7); const s = Math.sin(P.ph) * Math.min(1, v * 1.2), bob = Math.abs(Math.cos(P.ph)) * .06 * Math.min(1, v);
    const idle = Math.sin(P.ph * .6) * .05, h = P.hit > 0 ? (P.hit -= dt) / .25 : 0;
    B.position.y = bob;
    rot(P, 'thigh_l', s * .7); rot(P, 'thigh_r', -s * .7);
    rot(P, 'calf_l', Math.max(0, -s) * .8); rot(P, 'calf_r', Math.max(0, s) * .8);
    rot(P, 'spine_01', .08 * v - .35 * h, s * .12); rot(P, 'spine_03', idle - a * .25);
    rot(P, 'Head', -idle * .6 + .15 * h);
    const up = a < .75 ? a / .75 : 1 - (a - .75) / .25 * 1.5;
    rot(P, 'upperarm_l', -s * .5, 0, -1.2); rot(P, 'upperarm_r', s * .5 - 2.2 * Math.max(-.5, up), 0, 1.2 - .9 * Math.max(0, up));
    rot(P, 'lowerarm_r', -.4 - .6 * Math.max(0, up));
    P.cur = a > 0 ? 'Attack' : v > .05 ? 'Walk' : 'Idle';
  }
  function play(P, n, fade = .2) {
    if (!P.ready) { P.want = n; return; }
    const a = P.act[n]; if (!a || P.cur === n) return;
    const prev = P.act[P.cur]; a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.play();
    if (prev && fade > 0) a.crossFadeFrom(prev, fade, false); else if (prev) prev.stop();
    P.cur = n;
  }
  /** Daueranimation (Idle/Gehen/Laufen) – eine laufende Einmal-Animation läuft erst zu Ende */
  function loop(P, n) { P.want = n; if (!P.once) play(P, n); }
  /** Einmal-Animation (Treffer, Tod, Wurf …) */
  function once(P, n, fade = .1) { if (!P.act[n] && P.ready) return; P.once = n; P.cur = ''; play(P, n, fade); }

  /* Gegner steuern: Zustand des Gegners → Bewegung, Ausholen per Arm-Schwung über der Animation */
  function drive(P, e, spd) {
    if (P.proc) { P.spd = spd; if (e.dead) { if (!P.dead) P.dead = 1e-3; return; } P.dead = 0; const ht = e.hitT || -9; if (ht !== P.lastHit) { P.lastHit = ht; P.hit = .25; }
      const a = e.st === 'wind' && e.atk ? e.atk : null; P.swing = a ? Math.min(1, a.t / Math.max(.2, a.dur)) : Math.max(0, P.swing - .1); return; }
    if (!P.ready) { P.want = spd > .6 ? 'Running_A' : spd > .05 ? 'Walking_A' : 'Idle_A'; return; }
    if (e.dead) { if (P.cur !== 'Death_A') once(P, 'Death_A', .08); return; }
    if (P.cur === 'Death_A') { P.once = null; P.cur = ''; play(P, 'Spawn_Ground', 0); P.once = 'Spawn_Ground'; }
    const ht = e.hitT || -9; if (ht !== P.lastHit) { P.lastHit = ht; if (!P.once && Math.random() < .6) once(P, 'Hit_A'); }
    const a = e.st === 'wind' && e.atk ? e.atk : null;
    if (a && a.type === 'shot') { if (P.cur !== 'Throw' && a.t < .1) once(P, 'Throw'); P.swing = 0; }
    else P.swing = a ? Math.min(1, a.t / Math.max(.2, a.dur)) : Math.max(0, P.swing - .12);
    P.speed = 1;
    loop(P, spd > .6 ? 'Running_A' : spd > .05 ? 'Walking_A' : 'Idle_A');
  }
  /* Dorffigur: Stehen oder Gehen */
  function walk(P, mv) { if (P.proc) { P.spd = mv; return; } loop(P, mv > .7 ? 'Running_A' : mv > .05 ? 'Walking_A' : 'Idle_A'); }

  /* K.O.: liegen bleiben (Death_A bleibt stehen), beim Aufstehen Spawn_Ground */
  function ko(P, on) { if (P.proc) { P.dead = on ? (P.dead || 1e-3) : 0; return; }
    if (on) { if (P.want !== 'Death_A') { P.want = 'Death_A'; if (P.ready) once(P, 'Death_A', .08); } return; }
    if (P.want === 'Death_A') { P.want = 'Idle_A'; P.once = null; P.cur = ''; if (P.ready && P.act.Spawn_Ground) { play(P, 'Spawn_Ground', 0); P.once = 'Spawn_Ground'; } else play(P, 'Idle_A', .1); } }
  const _v = new T.Vector3();
  function update(dt, cam) {
    let n = 0;
    for (const P of LIVE) {
      if (!P.root.parent) { if (P.ready) LIVE.delete(P); continue; }
      if ((!P.mixer && !(P.proc && P.ready)) || !P.root.visible) continue;
      P.root.getWorldPosition(_v); const d = cam ? _v.distanceTo(cam) : 0;
      if (d > (TOUCH ? 45 : 70)) continue;
      if (d > 25 && ((P.skip = (P.skip || 0) + 1) & 1)) { P.acc = (P.acc || 0) + dt; continue; }
      if (P.proc) { procAnim(P, dt + (P.acc || 0)); P.acc = 0; n++; continue; }
      P.mixer.update((dt + (P.acc || 0)) * P.speed); P.acc = 0; n++;
      if (P.swing > 0) { const u = P.bones['upperarmr'], l = P.bones['lowerarmr'], k = P.swing < .75 ? P.swing / .75 : 1 - (P.swing - .75) / .25 * 1.6;
        if (u) u.rotation.x -= 2.1 * k; if (l) l.rotation.x -= .6 * k; }
    }
    return n;
  }

  /* Requisiten */
  const PR = {};
  /* Requisiten-Dateien: 'props' (KayKit) oder 'wz' (Wizp, models/wz/) */
  const props = (f = 'props') => PR[f] || (PR[f] = (f === 'props' ? load('props') : new Promise((res, rej) => new GLTFLoader().load('models/' + f + '/' + f + '.glb', res, null, rej))).then(g => { const m = {}; for (const c of g.scene.children) if (/^p[:_]/.test(c.name)) { dress(c, false); m[c.name.slice(2)] = c; } return m; }));
  function prop(name, s = 1) {
    const g = new T.Group(); g.scale.setScalar(s);
    props().then(m => { const src = m[name]; if (!src) return; const c = src.clone(true); c.position.set(0, 0, 0); g.add(c); }).catch(() => { });
    return g;
  }
  /** Viele Requisiten als Instanzen: list = [{k, x, y, z, ry, s}] */
  /** q.h: Zielhöhe statt Faktor (aus der Ruhegröße des Teils) */
  const PH = {};
  function place(par, list, f) {
    if (!list.length) return;
    props(f).then(m => {
      const by = {}; for (const q of list) if (m[q.k]) (by[q.k] = by[q.k] || []).push(q);
      const ob = new T.Object3D(), M4 = new T.Matrix4();
      for (const k in by) {
        const src = m[k]; src.updateMatrixWorld(true); const inv = new T.Matrix4().copy(src.matrixWorld).invert();
        if (PH[k] === undefined) { const b = new T.Box3().setFromObject(src); PH[k] = Math.max(.05, b.max.y - b.min.y); }
        src.traverse(o => { if (!o.isMesh) return;
          const loc = new T.Matrix4().multiplyMatrices(inv, o.matrixWorld);
          const im = new T.InstancedMesh(o.geometry, o.material, by[k].length); im.castShadow = !TOUCH; im.receiveShadow = true;
          by[k].forEach((q, i) => { (q._h || (q._h = [])).push([im, i]); ob.position.set(q.x, q.y || 0, q.z); ob.rotation.set(0, q.ry || 0, 0); ob.scale.setScalar(q.h ? q.h / PH[k] * (q.s || 1) : q.s || 1); ob.updateMatrix(); M4.multiplyMatrices(ob.matrix, loc); im.setMatrixAt(i, M4); });
          im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere && im.computeBoundingSphere(); im.frustumCulled = false; par.add(im); });
      }
    }).catch(e => console.warn('KayKit-Requisiten', f, e && e.message));
  }
  /* ein Teil aus place() ausblenden (zerschlagen) */
  const Z4 = new T.Matrix4().makeScale(0, 0, 0);
  function hideQ(q) { for (const [im, i] of q._h || []) { im.setMatrixAt(i, Z4); im.instanceMatrix.needsUpdate = true; } }
  const warm = () => { load('anim'); props(); };
  const heightOf = k => PH[k];
  return { char, beast, heightOf, play, once, loop, drive, walk, ko, update, prop, place, hideQ, warm, load, get live() { return LIVE.size; } };
}
