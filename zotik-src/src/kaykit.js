/* KayKit-Figuren und -Requisiten von Kay Lousberg (CC0, www.kaylousberg.com), aufbereitet mit tools/make-zotik-kaykit.mjs → models/kk/
   - char(id, o): Figur mit Skelett-Bewegungen (Idle, Gehen, Laufen, Treffer, Tod, Erscheinen, Werfen …), Waffen an den Handknochen
   - prop(name): Klon eines Requisits (Dungeon-Pack, Waffen), place(par, list): viele gleiche Requisiten als Instanzen (wenige Zeichenaufrufe)
   Bis die Dateien geladen sind, bleibt die Gruppe leer – nichts hängt davon ab. Gezeichnet mit Cel-Shading wie die übrigen Figuren. */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { qualify, QCLIP } from './quat.js';
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
    top2: { ad_ma: [[1, 1], [2, 1]], ad_ro: [[1, 1]], ad_rh: [[1, 1]], ad_ra: [[0, 1]], ad_kn: [[0, 1], [6, 0]], ad_ba: [[2, 1]] },
    shirt: { ad_ra: [[5, 0], [6, 0]] } };   // helles Hemd (Waldläufer)
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
  /** Figur: o.h Zielhöhe (m), o.r / o.l Requisit in der rechten/linken Hand, o.tint Farbton (0..1 Mischung o.tk), o.hide RegExp: Teile ausblenden (Helm, Hut, Umhang …), o.pal Farben je Rolle (siehe recolor), o.deco(P, modell) hängt Zubehör an die Knochen */
  function char(id, o = {}) {
    if (/^ad_/.test(id) && !o.kay) return qchar(id, o);   // alle Menschen-Figuren: Quaternius-Rig mit Rollen-Look (Zotik selbst ist ein Fuchs und bleibt eigen)
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
      if (o.deco) o.deco(P, c);   // eigenes Zubehör an den Knochen (Frisur, Bart, Schmuck)
      root.add(c); P.mixer = new T.AnimationMixer(c);
      for (const n in cl) P.act[n] = P.mixer.clipAction(cl[n]);
      for (const n of ['Death_A', 'Hit_A', 'Spawn_Ground', 'Throw', 'Use_Item', 'Interact']) if (P.act[n]) { P.act[n].setLoop(T.LoopOnce, 1); P.act[n].clampWhenFinished = true; }
      P.mixer.addEventListener('finished', () => { P.once = null; play(P, P.want, .15); });
      P.ready = true; play(P, P.want, 0);
    }).catch(() => { });
    LIVE.add(P); return P;
  }
  /* ===== Quaternius-Figuren: ein geteiltes Basismodell, je Rolle andere Farben und Zubehör (quat.js) ===== */
  const QS = qualify(T, G, TOUCH); let qfile = null, qH = 0;
  const qrload = () => qfile || (qfile = new Promise((res, rej) => new GLTFLoader().load('models/qr/qr.glb', res, null, rej)));
  const SKIN = [0xf1c9a5, 0xe8b898, 0xd9a07a, 0xc08a62, 0x9a6a46], HAIR = [0x2a1c16, 0x5a3a22, 0x8a5a2a, 0xc89a4a, 0xa8481e, 0x3a3a48], ACCENT = [0xe8c040, 0xc8ccd6, 0xd8804a];
  const lum = c => ((c >> 16 & 255) * .3 + (c >> 8 & 255) * .59 + (c & 255) * .11);
  const shade = (c, k) => { const r = Math.min(255, (c >> 16 & 255) * k) | 0, g = Math.min(255, (c >> 8 & 255) * k) | 0, b = Math.min(255, (c & 255) * k) | 0; return r << 16 | g << 8 | b; };
  /* KayKit-Requisitname → Zubehör (Quaternius-Look, eigene Formen) */
  const WEAP = [[/staff/, 'stab'], [/sword|dagger|axe|hammer/, 'schwert'], [/shield/, 'schild'], [/bow/, 'bogen'], [/spellbook|book/, 'buch']];
  /* Märchenfiguren nach der gemeinfreien Buchvorlage: Name → Zubehör [Platz, Teil, Farbe, Farbe2, Größe] */
  const NAMED = [[/Haken|Hook|Kapitän/, [['head', 'dreispitz', 0x2a2a38, 0xe8c040, 1.55], ['head', 'bart', 0x1a1410, 0, 1.55], ['handR', 'saebel', 0xdde4ee, 0, 1]]],
    [/Peter Pan|Slightly|Nibs|Tootles|^John$|Michael/, [['head', 'muetze', 0x4a9a3a, 0, 1.55], ['head', 'feder', 0xe84a3a, 0, 1.55]]],
    [/Pinocchio/, [['head', 'muetze', 0xf4f0e8, 0, 1.55], ['head', 'nase', 0xd9a060, 0, 1.55]]], [/Geppetto|Brummelbart|Erzbart/, [['head', 'bart', 0xeeeeee, 0, 1.55], ['head', 'muetze', 0x8a6a4a, 0, 1.55]]],
    [/Quasimodo|Clopin|Gringoire/, [['head', 'kapuze', 0x6a5232, 0, 1.55]]], [/Little John|Robin|Jäger/, [['head', 'kapuze', 0x3a6a2a, 0, 1.55], ['head', 'feder', 0xe8d040, 0, 1.55], ['handL', 'bogen', 0x7a4a20, 0, 1]]],
    [/Artus|König|Sultan|Herzkönig|Meerkönig|Herzogin|Weiße Königin|Prinzessin|Eurystheus|Augias/, [['head', 'krone', 0xffd34d, 0, 1.55], ['back', 'cape', 0x8a2a2a, 0xffd34d, 1]]],
    [/Merlin/, [['head', 'spitzhut', 0x3a4aa0, 0xffd34d, 1.55], ['head', 'bart', 0xeeeeee, 0, 1.55], ['handR', 'stab', 0x7a5a30, 0x60e0ff, 1]]],
    [/Sir |Phoebus|Lancelot|Mulan|Feldherr|Kampfgefährte/, [['head', 'helm', 0xb8c0d0, 0xc03030, 1.55], ['torso', 'ruestung', 0xb8c0d0, 0xffd34d, 1], ['handR', 'schwert', 0xdde4ee, 0x8a6a30, 1]]],
    [/Großwesir|Sultan|Idris|Aladdin/, [['head', 'turban', 0xf0e8d8, 0xe84a8a, 1.55]]], [/Hutmacher/, [['head', 'zylinder', 0x3a2a4a, 0xe8c040, 1.55]]],
    [/Märzhase|Kaninchen/, [['head', 'langohr', 0xf4f0e8, 0, 1.55]]], [/Grinsekatze|Kater/, [['head', 'katzenohr', 0x9a6ac8, 0, 1.55]]], [/Alice/, [['head', 'schleife', 0x4a8ae8, 0, 1.55], ['torso', 'schuerze', 0xffffff, 0, 1]]],
    [/Fee/, [['back', 'fluegel', 0xa0f8ff, 0, 1], ['head', 'spitzohren', 0xf6dcc8, 0, 1.55]]], [/Wendy|Tigerlilie/, [['head', 'schleife', 0xe84a8a, 0, 1.55]]], [/Mowgli|Hathi|Baloo|Bagheera|Akela/, [['hips', 'guertel', 0x7a4a20, 0xe8c040, 1]]]];
  const EYE = [0x2a6ab0, 0x2a8a4a, 0x7a4a20, 0x6a6a7a, 0x3a8ad8, 0x8a5ac8];
  const HSTY = [[/Pinocchio|Peter Pan|Mowgli|Phoebus/, 'orig'], [/Fee/, 'zoepfe'], [/Alice|Artus|Merlin|Esmeralda|Königin|Prinzessin/, 'long'], [/Wendy/, 'dutt'], [/Tigerlilie|Mulan/, 'zopf'], [/Schneewittchen/, 'bob']];
  const HF = ['long', 'zopf', 'dutt', 'zoepfe', 'bob', 'orig', 'long'], HM = ['orig', 'orig', 'zopf', 'orig', 'orig', 'long'];
  function qchar(id, o = {}) {
    const root = new T.Group(), P = { root, id, q: true, ready: false, mixer: null, act: {}, cur: '', want: 'Idle_A', once: null, swing: 0, bones: {}, speed: 1 };
    qrload().then(g => {
      const c = skClone(g.scene), tint = o.tint, pl = o.pal || {};
      if (!qH) { g.scene.updateMatrixWorld(true); const b = new T.Box3().setFromObject(g.scene); qH = Math.max(.5, b.max.y - b.min.y); }
      const s = (o.h || 1.7) / qH; c.scale.multiplyScalar(s);
      const hs = [...id + (pl.top || tint || 0) + (o.h || 0)].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7) >>> 0;
      const top = pl.top ?? tint ?? 0x8a7a6a, top2 = pl.top2 ?? shade(top, .6), pants = pl.pants ?? shade(top2, .7), acc = ACCENT[hs % 3];
      const hair = pl.hair ?? HAIR[hs % 6], skin = pl.skin ?? SKIN[(hs >>> 3) % 5];
      const female = /ad_(ma|ro|rh)/.test(id);
      const fin = !!(o.hide && /Leg/.test(o.hide.source || o.hide));
      QS.paint(c, { noeyes: true, hair, skin, under: lum(top) > 150 ? shade(top, .7) : 0xf0ecdc, top, pants, detail: acc, boots: fin ? shade(pants, 1) : shade(pants, .5), cloth: top2 });
      const bones = {}; c.traverse(b => { if (b.isBone) bones[b.name] = b; }); P.bones = bones;
      const hid = o.hide || /^$/, hide = n => hid.test(n);
      const root3 = new T.Group(); root3.add(c); const tmp = new T.Group(); root.add(root3); root.updateMatrixWorld(true);
      /* Zubehör im Figurenraum (Meter) platzieren, dann an den Knochen hängen (attach behält die Weltlage) */
      const wear = (slot, obj, sc, rx) => { const b = bones[QS.BONE[slot]]; if (!b || !obj) return null; const wp = new T.Vector3(); b.getWorldPosition(wp); root.add(obj); obj.position.copy(root.worldToLocal(wp)); const off = QS.POS[slot] || [0, 0, 0]; obj.position.x += off[0]; obj.position.y += off[1] * (o.h || 1.7) / 1.8; obj.position.z += off[2];
        if (sc) obj.scale.setScalar(sc * (o.h || 1.7) / 1.8); if (rx) obj.rotation.x = rx; root.updateMatrixWorld(true); b.attach(obj); return obj; };
      const A = QS.ACC;
      for (const n of ['FistL', 'FistR']) if (bones[n]) bones[n].scale.setScalar(.62);   // kleine, normale Hände
      wear('head', QS.face({ eye: pl.eye ?? EYE[(hs >>> 9) % EYE.length], brow: shade(hair, .55), mouth: (hs >>> 14) % 4, female, blush: female || (hs >>> 5) % 3 === 0 }), 1.55);
      { const hn = o.name && (HSTY.find(n => n[0].test(o.name)) || [])[1]; const hst = hn || (female ? HF : HM)[(hs >>> 4) % (female ? HF.length : HM.length)]; if (hst !== 'orig' && A['h_' + hst]) wear('head', A['h_' + hst](hair), 1.55); }
      if (id === 'ad_ma' && !hide('Hat')) wear('head', A.spitzhut(top2, acc), 1.55);
      if (fin) wear('hips', A.flosse(pants));
      if (id === 'ad_ma') { wear('back', A.cape(top2, acc)); if (!fin) wear('hips', A.rock(top2)); }
      if (id === 'ad_ro') { if (!fin) wear('hips', A.rock(shade(top2, 1.1))); wear('head', A.schleife(acc), 1.55); wear('torso', A.schuerze(shade(top, 1.2))); }
      if (id === 'ad_rh') { if (!hide('Mask')) wear('head', A.kapuze(top2), 1.55); if (!hide('Cape')) wear('back', A.cape(top2, acc)); if (!fin) wear('hips', A.rock(shade(top2, .9))); }
      if (id === 'ad_kn') { if (!hide('Helmet')) wear('head', A.helm(0xb8c0d0, 0xc03030), 1.55); wear('torso', A.ruestung(0xb8c0d0, acc)); if (!hide('Cape')) wear('back', A.cape(top, acc)); }
      if (id === 'ad_ba') { wear('head', A.bart(shade(hair, .8)), 1.55); wear('hips', A.guertel(0x5a3a22, acc)); if (!hide('BearHat')) wear('head', A.muetze(shade(top2, .8)), 1.55); }
      if (id === 'ad_ra') { if (!hide('Cape')) { wear('head', A.kapuze(shade(top, .8)), 1.55); wear('back', A.cape(shade(top, .7), acc)); } wear('hips', A.guertel(0x5a3a22, acc)); if (lum(hair) > 200 && (o.h || 1.7) > 1.7) wear('head', A.bart(hair), 1.55); }
      if (o.name) for (const [re, L] of NAMED) if (re.test(o.name)) { for (const [sl, kk, c1, c2, sc] of L) wear(sl, A[kk](c1, c2 || undefined), sc); break; }
      const v = o.v || {};   // Hinweise aus folkNpc: hood, hat, beard, apron – Männer bekommen je Figur eine eigene Kopfbedeckung/Bart
      if (v.hood && id !== 'ad_rh') wear('head', A.kapuze(shade(v.cloth ?? top, .8)), 1.55);
      if (v.hat && id !== 'ad_ma') wear('head', A.muetze(shade(v.cloth2 ?? top2, 1.0)), 1.55);
      if (v.beard && id !== 'ad_ba') wear('head', A.bart(shade(hair, .85)), 1.55);
      if (v.apron != null) wear('torso', A.schuerze(v.apron), 1);
      if (!o.name || !NAMED.some(n => n[0].test(o.name))) if (!female && !v.hood && !v.hat && !v.beard && id !== 'ad_kn' && id !== 'ad_ba') { const k = (hs >>> 6) % 5; if (k === 0) wear('head', A.muetze(shade(top2, 1.1)), 1.55); else if (k === 1) wear('head', A.bart(shade(hair, .85)), 1.55); else if (k === 2) wear('head', A.dreispitz(shade(top2, .6), acc), 1.55); else if (k === 3) wear('torso', A.kragen(shade(top, 1.3)), 1); }
      for (const sl of ['r', 'l']) { const nm = o[sl]; if (!nm) continue; const m = WEAP.find(w => w[0].test(nm)); if (!m) continue; wear(sl === 'r' ? 'handR' : 'handL', A[m[1]](m[1] === 'stab' ? 0x7a5a30 : m[1] === 'schild' ? top : m[1] === 'bogen' ? 0x7a4a20 : 0xdde4ee, m[1] === 'schild' ? acc : m[1] === 'stab' ? 0x60e0ff : 0x8a6a30), 1, m[1] === 'schwert' || m[1] === 'schild' ? .9 : 0); }
      if (o.deco) { const a = new T.Group(); wear('head', a, .55); a.position.y += 0; P.bones.head = a; o.deco(P, c); }
      root.remove(root3); root.add(c);
      P.mixer = new T.AnimationMixer(c);
      const cl = Object.fromEntries(g.animations.filter(a => !a.name.includes('|')).map(a => [a.name, a])), used = new Set();
      for (const n in QCLIP) { let a = cl[QCLIP[n]]; if (!a) continue; if (used.has(a.name)) a = a.clone(); used.add(a.name); P.act[n] = P.mixer.clipAction(a); }
      for (const n of ['Death_A', 'Hit_A', 'Spawn_Ground', 'Throw', 'Use_Item', 'Interact']) if (P.act[n]) { P.act[n].setLoop(T.LoopOnce, 1); P.act[n].clampWhenFinished = true; }
      P.mixer.addEventListener('finished', () => { P.once = null; play(P, P.want, .15); });
      P.ready = true; play(P, P.want, 0);
    }).catch(e => console.warn('Quaternius-Figur', id, e && e.message));
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
    // alle anderen aktiven Animationen ausblenden – auch eine liegen gebliebene Einmal-Animation (z. B. Death_A nach K.O.)
    for (const k in P.act) { const b = P.act[k]; if (b !== a && b.isScheduled()) { if (fade > 0) b.fadeOut(fade); else b.stop(); } }
    a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.play(); if (fade > 0) a.fadeIn(fade);
    P.cur = n;
  }
  /** Daueranimation (Idle/Gehen/Laufen) – eine laufende Einmal-Animation läuft erst zu Ende */
  function loop(P, n) { if (P.down) return; P.want = n; if (!P.once) play(P, n); }
  /** Einmal-Animation (Treffer, Tod, Wurf …) */
  function once(P, n, fade = .1) { if (P.down && n !== 'Death_A') return; if (!P.act[n] && P.ready) return; P.once = n; P.cur = ''; play(P, n, fade); }

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
  function ko(P, on) { if (P.proc) { P.dead = on ? (P.dead || 1e-3) : 0; return; } P.down = !!on;
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
  /* Requisiten-Dateien: 'props' (KayKit) oder 'wz' (Wizp, models/wz/); three entfernt ':' aus Knotennamen (p:chest → pchest) */
  const props = (f = 'props') => PR[f] || (PR[f] = (f === 'props' ? load('props') : new Promise((res, rej) => new GLTFLoader().load('models/' + f + '/' + f + '.glb', res, null, rej))).then(g => { const m = {}; for (const c of g.scene.children) if (/^p/.test(c.name)) { dress(c, false); m[c.name.replace(/^p[:_]?/, '')] = c; } return m; }));
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
          if (by[k].some(q => q.tint)) { const cc = new T.Color(); by[k].forEach((q, i) => im.setColorAt(i, cc.set(q.tint || 0xffffff))); im.instanceColor.needsUpdate = true; }
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
