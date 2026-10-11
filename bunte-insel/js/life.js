'use strict';
/* Bunte Insel – Leben: Jede Welt bekommt Bewohner und Tiere, die zum Thema passen (Jogger und Igel auf der Hauptinsel, Geschäftsleute und Tauben in der Stadt,
   Clowns im Freizeitpark, Einhörner in der Regenbogenwelt, Matrosen und Mäuse im Dampfer-Hafen, Hunde und Katzen in der Fellretter-Bucht, Babydrachen und Ritter
   in den Drachenhöhen, Bauarbeiter und Rehe im Bauland, Mooslinge und Irrlichter in Lunaris, DJs und Fans in der Funkwelle, Meerleute und Fische in Atlantis).
   Sparsam gebaut: Eine Welt wird erst gefüllt, wenn man ihr nahekommt; bewegt und gezeichnet werden nur Figuren in der Nähe; Tiere sind je ein einziges Mesh.
   Menschen-Bewohner kann man ansprechen (wie die anderen Leute); sie wandern, bleiben stehen, hüpfen und tanzen. */
BI.createLife = function (G) {
  const { scene, W, P } = G, K = { talkers: [], regions: [] }, TAU = Math.PI * 2, rng = BI.rng(20261011), mat = BI.mat(), tmp = {};
  const R_ = (a, b) => a + rng() * (b - a), pick = a => a[(rng() * a.length) | 0], ang = BI.angDiff;
  const SK = [0xffd2a8, 0xe0a979, 0x8d5a3b, 0xf3c9a0], HR = [0x6b4423, 0x222222, 0xd9a441, 0xa14a2b, 0xf3d98a], PN = [0x3d4a7a, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a], STY = ['short', 'side', 'curly', 'bun', 'bob', 'afro', 'braids', 'ponytail'];
  const SH = [0xff5a5a, 0x3fa0ff, 0xffc933, 0x4cd07d, 0xb36bff, 0xff8fc8];
  /* ---------- kleine Tier-Modelle: je ein Mesh (Batch), dazu Flügel als eigene Gruppen ---------- */
  const mk = draw => { const b = new BI.Batch(); draw(b); return b.mesh(mat); };
  const crit = (draw, hop) => { const root = new THREE.Group(), inner = new THREE.Group(); inner.add(mk(draw)); root.add(inner); return { root, inner, pose: (ph, amp) => { inner.position.y = amp > 0 ? Math.abs(Math.sin(ph)) * hop : 0; inner.rotation.z = amp > 0 ? Math.sin(ph) * .06 : 0; } }; };
  const wingy = (draw, wing, fast) => { const root = new THREE.Group(), wl = new THREE.Group(), wr = new THREE.Group(); root.add(mk(draw)); wl.add(mk(b => wing(b, -1))); wr.add(mk(b => wing(b, 1))); root.add(wl, wr); return { root, flap: t => { const a = Math.sin(t * fast) * .9; wl.rotation.z = a; wr.rotation.z = -a; } }; };
  const M = {
    rabbit: () => crit(b => { b.sph(0, .22, 0, .2, 0xd9c8ae, 1, 1, .9, 1.3); b.sph(0, .38, .22, .13, 0xd9c8ae, 1); b.box(-.05, .5, .2, .04, .2, .03, 0xd9c8ae); b.box(.05, .5, .2, .04, .2, .03, 0xd9c8ae); b.sph(0, .25, -.28, .07, 0xffffff, 0); b.sph(.05, .41, .33, .02, 0x222222, 0); b.sph(-.05, .41, .33, .02, 0x222222, 0); }, .16),
    squirrel: () => crit(b => { b.sph(0, .2, 0, .14, 0xb0602a, 1, 1, 1, 1.4); b.sph(0, .34, .17, .1, 0xb0602a, 1); b.sph(0, .5, -.2, .12, 0xc8742e, 1, .8, 1.6, .8); b.box(-.04, .44, .17, .03, .07, .03, 0xb0602a); b.box(.04, .44, .17, .03, .07, .03, 0xb0602a); b.sph(0, .35, .26, .025, 0x222222, 0); }, .12),
    hedgehog: () => crit(b => { b.sph(0, .16, 0, .2, 0x6b4a30, 1, 1, .8, 1.3); b.sph(0, .13, .25, .1, 0xe0b890, 1); b.sph(0, .15, .34, .025, 0x222222, 0); for (let i = 0; i < 12; i++) b.cone(Math.sin(i * 2.1) * .12, .28, Math.cos(i * 1.3) * .16 - .05, .035, .12, 0x3a2a1c, 4); }, .05),
    pigeon: () => crit(b => { b.sph(0, .16, 0, .13, 0x9aa0ad, 1, 1, .9, 1.4); b.sph(0, .28, .14, .07, 0x8a909d, 1); b.box(0, .27, .22, .03, .02, .06, 0xe8a030); b.sph(0, .17, -.18, .05, 0x6a707d, 0, 1, 1, 2); b.box(0, .01, 0, .02, .1, .02, 0xd06a6a); }, .06),
    duck: () => crit(b => { b.sph(0, .2, 0, .2, 0xfff0a0, 1, 1, .9, 1.3); b.sph(0, .42, .18, .12, 0x4cd07d, 1); b.box(0, .4, .3, .1, .04, .1, 0xff9a2a); b.sph(0, .22, -.24, .08, 0xfff0a0, 0); }, .08),
    crab: () => crit(b => { b.sph(0, .12, 0, .16, 0xe0482a, 1, 1.4, .6, 1); for (const s of [-1, 1]) { b.sph(s * .26, .16, .1, .08, 0xe0482a, 0, 1, 1, 1.4); b.sph(s * .08, .26, .06, .03, 0x222222, 0); for (let k = 0; k < 3; k++) b.box(s * .2, .05, -.06 + k * .08, .16, .02, .02, 0xc03a20); } }, .04),
    deer: () => crit(b => { b.box(0, .62, 0, .4, .4, .95, 0xb98650); for (const x of [-.13, .13]) for (const z of [-.35, .35]) b.box(x, 0, z, .08, .65, .08, 0x8a5a33); b.box(0, .9, .5, .18, .5, .2, 0xb98650, 0, .35); b.box(0, 1.2, .62, .2, .22, .3, 0xb98650); b.box(0, 1.18, .8, .08, .08, .1, 0x222222); for (const s of [-1, 1]) { b.box(s * .08, 1.4, .58, .03, .3, .03, 0x6a4a2a, 0, 0, s * .3); b.box(s * .15, 1.55, .58, .12, .03, .03, 0x6a4a2a); } b.sph(0, .8, -.5, .08, 0xffffff, 0); }, .06),
    robot: () => crit(b => { b.box(0, .5, 0, .6, .7, .45, 0xc9ced6); b.box(0, 1.2, 0, .5, .4, .4, 0xe6eaf0); b.box(-.12, 1.3, .21, .1, .1, .03, 0x35d6e0); b.box(.12, 1.3, .21, .1, .1, .03, 0x35d6e0); b.box(0, 1.6, 0, .03, .25, .03, 0x888c99); b.sph(0, 1.88, 0, .06, 0xff5a5a, 0); for (const s of [-1, 1]) { b.box(s * .36, .5, 0, .1, .55, .1, 0x9aa0ad); b.box(s * .16, 0, 0, .14, .5, .16, 0x9aa0ad); } b.box(0, .6, .24, .3, .2, .03, 0x2a2f55); }, .08),
    unicorn: () => crit(b => { b.box(0, .85, 0, .5, .5, 1.2, 0xffffff); for (const x of [-.17, .17]) for (const z of [-.45, .45]) b.box(x, 0, z, .1, .9, .1, 0xf0f0ff); b.box(0, 1.2, .62, .2, .55, .25, 0xffffff, 0, .45); b.box(0, 1.65, .8, .22, .26, .4, 0xffffff); b.cone(0, 1.95, .86, .05, .4, 0xffd23f, 5, 0, .5); for (let i = 0; i < 6; i++) b.box(0, 1.55 - i * .1, .5 - i * .08, .06, .16, .22, [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x9b4de0][i]); for (let i = 0; i < 4; i++) b.box(0, .9 - i * .15, -.7, .1, .3, .12, [0xff3b3b, 0xffe14a, 0x3fa0ff, 0x9b4de0][i], 0, -.3); }, .09),
    fish: c => crit(b => { b.sph(0, 0, 0, .3, c, 1, .6, .8, 1.5); b.cone(0, 0, -.4, .25, .4, c, 4, Math.PI / 2); b.sph(0, .05, .35, .05, 0x111111, 0); b.box(0, .25, 0, .02, .2, .3, c); }, 0),
    gull: () => wingy(b => { b.sph(0, 0, 0, .16, 0xffffff, 1, .8, .8, 1.8); b.sph(0, .08, .26, .09, 0xffffff, 1); b.box(0, .07, .36, .03, .03, .1, 0xff9a2a); b.box(0, 0, -.3, .1, .02, .16, 0xdddddd); }, (b, s) => { b.box(s * .35, 0, 0, .55, .03, .28, 0xeeeeee); b.box(s * .6, 0, -.02, .25, .03, .2, 0x666b78); }, 7),
    bat: () => wingy(b => { b.sph(0, 0, 0, .1, 0x2a2438, 1, .8, .8, 1.3); b.cone(-.05, .1, .05, .03, .08, 0x2a2438, 3); b.cone(.05, .1, .05, .03, .08, 0x2a2438, 3); b.sph(0, .02, .1, .02, 0xff5a5a, 0); }, (b, s) => { b.box(s * .25, 0, 0, .4, .02, .22, 0x3a3250); }, 14),
    butterfly: c => wingy(b => { b.box(0, 0, 0, .02, .02, .14, 0x333333); }, (b, s) => { b.box(s * .08, 0, .03, .14, .01, .16, c); b.box(s * .07, 0, -.08, .1, .01, .1, c); }, 20),
    wisp: c => { const root = new THREE.Group(), m = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .8, fog: false })); root.add(m); return { root, pose: () => { } }; },
    jelly: c => { const root = new THREE.Group(), g = new THREE.Group(), m = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 6, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .65, fog: false })); g.add(m); for (let i = 0; i < 5; i++) { const t = mk(b => b.box(Math.sin(i * 1.26) * .2, -.5, Math.cos(i * 1.26) * .2, .03, .5, .03, c)); g.add(t); } root.add(g); return { root, pose: (ph) => { g.scale.y = 1 + Math.sin(ph) * .12; } }; },
    note: c => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); x.font = 'bold 54px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(Math.random() < .5 ? '♪' : '♫', 32, 34); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(1, 1, 1); const root = new THREE.Group(); root.add(sp); return { root, pose: () => { } }; }
  };
  const base = (o, root, extra) => Object.assign({ root, x: 0, z: 0, y: 0, h: rng() * TAU, tx: 0, tz: 0, wait: rng() * 3, ph: rng() * 6, spd: 1, r: .4, hop: 0, mode: 'walk', moving: false }, o, extra);
  /* ---------- Figuren ---------- */
  const F = {};
  F.person = (reg, o) => {
    const look = Object.assign({ shirt: pick(o.shirts || SH), pants: pick(o.pants || PN), hair: pick(o.hairs || HR), skin: pick(o.skins || SK), style: pick(STY), mouth: 'smile', hat: o.hats ? pick(o.hats) : 'none', scale: o.scale || (.9 + rng() * .12) }, o.look || {}), c = BI.makeChar(look);
    const n = base({ spd: o.spd || 1.1 + rng() * .8, r: .45, kind: 'person', mode: o.mode || 'walk', rad: o.rad || 10, dancer: o.dance, bursts: o.bursts }, c.group); n.c = c; n.pose = (ph, amp, wave) => c.pose(ph, amp, wave);
    const nm = o.names ? pick(o.names) : 'Bewohner', lines = o.lines || ['schön, dich zu sehen!']; n.p = { name: nm, lines: lines.slice(), i: 0 }; K.talkers.push(n); return n;
  };
  F.pet = (reg, o) => { const p = BI.makePet(o.pet || pick(['bello', 'mieze', 'hoppel'])); p.group.scale.setScalar(o.scale || 1); const n = base({ spd: o.spd || .9 + rng() * .5, r: .4, rad: 8, c: p }, p.group); n.pose = (ph, amp) => p.pose(ph, amp, amp > 0 || Math.sin(ph) > .5); return n; };
  F.dragon = (reg, o) => { const cols = pick([[0x5fd6a8, 0xffb347, 0x6cc6ff], [0xff8a6b, 0xffe27a, 0xffb0a0], [0xb48aff, 0xffd0f0, 0xc8b8ff], [0x6bb8ff, 0xfff0a0, 0xa8d8ff], [0xffd23f, 0xfff4c0, 0xffb347]]), d = BI.makeDrache({ body: cols[0], belly: cols[1], wing: cols[2] }); d.root.scale.setScalar(o.scale || R_(.4, .6)); const n = base({ spd: .7 + rng() * .4, r: .5, rad: 8 }, d.root); n.pose = (ph, amp) => d.set(amp > 0 ? 'walk' : (Math.sin(ph * .3) > .8 ? 'happy' : 'idle'), ph / 7); return n; };
  F.moosling = (reg, o) => { const d = BI.makeMoosling(); d.root.scale.setScalar(R_(.7, 1)); const n = base({ spd: .9 + rng() * .5, r: .4, rad: 9 }, d.root); n.pose = (ph, amp) => d.set(amp > 0 ? 'walk' : (Math.sin(ph * .4) > .85 ? 'happy' : 'idle'), ph / 8); return n; };
  F.willi = (reg, o) => { const d = BI.makeWilli({}); d.root.scale.setScalar(R_(.55, .75)); const n = base({ spd: 1 + rng() * .5, r: .4, rad: 9 }, d.root); n.pose = (ph, amp) => d.set(amp > 0 ? 'dance' : 'idle', ph / 8); return n; };
  F.critter = (reg, o) => { const m = M[o.k](o.c); const n = base({ spd: o.spd || .8 + rng() * .5, r: .3, rad: o.rad || 6, side: o.side, hopSp: o.hopSp }, m.root); n.pose = (ph, amp) => m.pose(ph, amp); n.scale0 = o.scale; if (o.scale) m.root.scale.setScalar(o.scale); return n; };
  F.fly = (reg, o) => { const m = M[o.k](o.c), n = base({ mode: 'fly', a: rng() * TAU, w: (rng() < .5 ? -1 : 1) * (o.w || R_(.12, .3)), rad: reg.R * R_(.15, .85), alt: o.alt ? R_(o.alt[0], o.alt[1]) : R_(10, 24), bob: o.bob == null ? 2 : o.bob, fast: o.fast }, m.root); n.flap = m.flap; if (o.scale) m.root.scale.setScalar(o.scale); return n; };
  F.float = (reg, o) => { const m = M[o.k](o.c), n = base({ mode: 'float', ax: 0, az: 0, alt: o.alt ? R_(o.alt[0], o.alt[1]) : R_(1, 3), amp: o.amp || 3, sp: o.sp || R_(.4, .9), rad: 0, flutter: o.k === 'butterfly' }, m.root); n.flap = m.flap; n.pose = m.pose; if (o.scale) m.root.scale.setScalar(o.scale); return n; };
  /* ---------- Welten ---------- */
  const land = (x, z) => Math.hypot(x, z) < W.K.LIMIT - 10;
  const REG = [
    { id: 'main', x: 0, z: 0, R: 165, pad: 8, ok: land, spec: [
      ['person', 4, { names: ['Jogger Jan', 'Läuferin Lea', 'Sprinter Sven', 'Joggerin Jule'], hats: ['headphones', 'cap'], spd: 3.1, rad: 24, lines: ['ich laufe jeden Morgen eine Runde um die Insel! 🏃', 'Fit bleiben macht richtig Spaß!', 'Trink genug Wasser, das ist wichtig!', 'Wer rastet, der rostet – hihi.'] }],
      ['person', 3, { names: ['Wanderin Wiebke', 'Wanderer Willi', 'Natur-Nora'], hats: ['cowboy', 'flowers'], spd: 1.3, rad: 18, lines: ['ich schaue mir gern Pflanzen und Tiere an. 🌿', 'Hast du schon einen Igel gesehen? Die sind scheu!', 'Frische Luft ist die beste Medizin.'] }],
      ['person', 3, { names: ['Gärtner Gustav', 'Gärtnerin Greta', 'Blumen-Berta'], hats: ['cap', 'flowers'], rad: 8, lines: ['bei mir wächst alles! 🌻', 'Pflanzen brauchen Wasser, Sonne und Liebe.', 'Magst du Tomaten oder lieber Erdbeeren?'] }],
      ['pet', 4, { pet: 'bello' }], ['pet', 4, { pet: 'mieze' }], ['pet', 3, { pet: 'hoppel' }],
      ['critter', 5, { k: 'squirrel', rad: 8 }], ['critter', 4, { k: 'hedgehog', rad: 5, spd: .5 }], ['critter', 10, { k: 'pigeon', rad: 5 }], ['critter', 6, { k: 'rabbit', rad: 8 }],
      ['float', 10, { k: 'butterfly', c: 0xffb347, alt: [1, 2.4], amp: 4 }], ['fly', 8, { k: 'gull', alt: [14, 28], w: .1 }], ['beach', 6, {}]] },
    { id: 'city', x: 0, z: -290, R: 62, pad: 6, spec: [
      ['person', 8, { names: ['Herr Meier', 'Frau Schulz', 'Herr Braun', 'Frau Weiss', 'Herr Kaiser', 'Frau Lange'], shirts: [0xffffff, 0xcfe0ff, 0xf0f0f0], pants: [0x23262d, 0x3d4a7a, 0x5a5a66], hats: ['none', 'tophat'], spd: 1.7, rad: 18, lines: ['ich habe gleich einen wichtigen Termin! 💼', 'Die Stadt schläft nie – hier ist immer was los.', 'Hast du schon die Läden angeschaut?', 'Kaffee gibt es beim Bäcker, ganz frisch.'] }],
      ['person', 6, { names: ['Touristin Tina', 'Tourist Tom', 'Reisende Rita'], hats: ['cap', 'cowboy'], rad: 14, lines: ['ich mache lauter Fotos von der Stadt! 📸', 'Wo geht es zum Hafen?', 'Bei euch ist es wunderschön!'] }],
      ['person', 2, { names: ['Straßenmusikerin Mara', 'Straßenmusiker Milo'], hats: ['party', 'headphones'], mode: 'dance', lines: ['ich spiele für alle, die zuhören! 🎵', 'Musik macht die Stadt bunt.', 'Magst du tanzen?'] }],
      ['critter', 12, { k: 'pigeon', rad: 6 }], ['pet', 3, { pet: 'mieze' }], ['pet', 3, { pet: 'blitz' }], ['fly', 4, { k: 'gull', alt: [18, 30], w: .12 }]] },
    { id: 'park', x: 285, z: 20, R: 56, pad: 6, spec: [
      ['person', 10, { names: ['Kira', 'Ben', 'Lotta', 'Finn', 'Mila', 'Paul', 'Emma', 'Noah'], hats: ['party', 'none'], scale: .62, spd: 2.4, rad: 14, lines: ['ich will unbedingt Achterbahn fahren! 🎢', 'Zuckerwatte ist das Beste!', 'Fang mich doch! 😄', 'Ich war schon dreimal im Riesenrad!'] }],
      ['person', 3, { names: ['Clown Charlie', 'Clownin Coco', 'Clown Pepe'], hats: ['party'], look: { shirt: 0xff3b3b, pants: 0x3fa0ff, hair: 0xff8a1f, style: 'afro' }, spd: 1.8, rad: 12, bursts: true, lines: ['hihi, ich bringe jeden zum Lachen! 🤡', 'Willst du einen Zaubertrick sehen? Simsalabim!', 'Lachen ist gesund, probier es mal!'] }],
      ['person', 3, { names: ['Maskottchen Bär', 'Maskottchen Bärchen', 'Plüsch-Paul'], hats: ['bear'], look: { shirt: 0xb07840, pants: 0xb07840, skin: 0xb07840, hair: 0x8a5a33 }, spd: 1.2, rad: 10, lines: ['knuddel mich ruhig! 🧸', 'Ich bin das Maskottchen vom Freizeitpark!', 'Brumm brumm, viel Spaß hier!'] }],
      ['critter', 8, { k: 'pigeon', rad: 6 }], ['critter', 4, { k: 'squirrel', rad: 6 }], ['float', 6, { k: 'butterfly', c: 0xff7ab8, alt: [1, 2.2], amp: 3 }]] },
    { id: 'rainbow', x: -285, z: 20, R: 46, pad: 5, spec: [
      ['person', 12, { names: ['Pia', 'Jonas', 'Mika', 'Sam', 'Nele', 'Alex', 'Ronja', 'Eli'], shirts: [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x9b4de0], hats: ['flowers', 'none', 'party'], look: { rainbow: true }, rad: 12, bursts: true, lines: ['bei uns darf jeder so sein, wie er ist! 🌈', 'Liebe ist Liebe – und alle gehören dazu.', 'Wir feiern heute bunt und laut!', 'Du bist toll, so wie du bist!'] }],
      ['critter', 3, { k: 'unicorn', rad: 10, scale: 1 }], ['float', 12, { k: 'butterfly', c: 0xb36bff, alt: [1, 2.6], amp: 4 }], ['fly', 8, { k: 'gull', alt: [8, 18], w: .15, scale: .8 }], ['pet', 3, { pet: 'mieze' }]] },
    { id: 'dampf', x: -262, z: -150, R: 48, pad: 6, spec: [
      ['person', 6, { names: ['Matrose Max', 'Matrosin Mia', 'Kapitän Kai', 'Smutje Sven', 'Steuerfrau Sia', 'Maat Moritz'], shirts: [0xf4f4f4, 0xdddddd, 0xc9c9c9], pants: [0x2a2a2e, 0x3a3a3e], hairs: [0x333333, 0x555555, 0xaaaaaa], skins: [0xdcdcdc, 0xc4c4c4, 0xe8e8e8], hats: ['cap', 'pirate'], rad: 14, lines: ['der Dampfer pfeift schon wieder! 🚢', 'Hier ist alles schwarz-weiß wie in einem alten Film.', 'Hast du die Kisten am Kran gesehen?', 'Ahoi, Landratte!'] }],
      ['person', 3, { names: ['Hafenarbeiter Hans', 'Hafenarbeiterin Hilde', 'Kranführer Karl'], shirts: [0xcfcfcf, 0xaaaaaa], pants: [0x2a2a2e], skins: [0xcfcfcf, 0xdcdcdc], hairs: [0x444444], hats: ['helmet'], rad: 10, lines: ['Kisten stapeln ist harte Arbeit! 📦', 'Pass auf beim Kran!', 'Feierabend ist, wenn die Pfeife tönt.'] }],
      ['willi', 6, {}], ['fly', 8, { k: 'gull', alt: [10, 22], w: .14, scale: .9 }]] },
    { id: 'pups', x: -90, z: 275, R: 52, pad: 6, spec: [
      ['pet', 4, { pet: 'bello' }], ['pet', 2, { pet: 'blitz' }], ['pet', 3, { pet: 'mieze' }], ['pet', 3, { pet: 'hoppel' }], ['pet', 4, { pet: 'bello', scale: .6, spd: 1.4 }],
      ['person', 6, { names: ['Fellretter Finn', 'Fellretterin Fiona', 'Tierärztin Tessa', 'Helfer Hugo', 'Helferin Hanna', 'Streifen-Sven'], shirts: [0x2d6be0, 0xe0382b, 0xffc933], hats: ['cap', 'helmet'], rad: 12, lines: ['wir retten jedes Fellchen! 🐾', 'Ein gutes Herz ist die beste Ausrüstung.', 'Hast du Blitz schon gestreichelt?', 'Wuff! Das heißt: Hallo!'] }],
      ['fly', 5, { k: 'gull', alt: [10, 22], w: .14 }]] },
    { id: 'drachen', x: 100, z: 275, R: 48, pad: 6, spec: [
      ['dragon', 7, {}],
      ['person', 5, { names: ['Ritter Rolf', 'Ritterin Rike', 'Wächter Wolf', 'Ritter Rudi', 'Wächterin Wanda'], shirts: [0x9aa5b8, 0x7d8aa0], pants: [0x5a3d2b], hats: ['helmet', 'viking'], look: { cape: true }, spd: 1, rad: 12, lines: ['ich beschütze die Drachenhöhen! 🛡️', 'Die kleinen Drachen sind eigentlich ganz brav.', 'Drachen mögen Funkelsteine, wusstest du das?', 'Mut ist wichtiger als ein Schwert.'] }],
      ['person', 3, { names: ['Zauberer Zorbo', 'Zauberin Zita', 'Magier Merlo'], shirts: [0x6b3dc2, 0x2a2a8a], hats: ['wizard'], look: { cape: true }, hairs: [0xeeeeee, 0xcccccc], spd: .8, rad: 8, lines: ['Hokuspokus – ich lese Drachensprache! ✨', 'In den Höhlen funkelt es überall.', 'Feuer ist heiß, aber Freundschaft wärmt mehr.'] }],
      ['fly', 6, { k: 'bat', alt: [6, 16], w: .35, fast: 14 }]] },
    { id: 'bauland', x: 277, z: -233, R: 150, pad: 10, spec: [
      ['person', 10, { names: ['Bauarbeiter Bernd', 'Baumeisterin Bea', 'Poliere Paula', 'Maurer Max', 'Zimmerin Zoe', 'Architekt Arno'], shirts: [0xff8a1f, 0xffc933, 0x4cd07d], pants: [0x3d4a7a, 0x5a3d2b], hats: ['helmet'], rad: 22, lines: ['hier kann jeder bauen, was er will! 🏗️', 'Fang mit einem festen Fundament an.', 'Wusstest du, dass man auch Türme bauen kann?', 'Ein Haus ohne Dach wird ziemlich nass.'] }],
      ['critter', 4, { k: 'robot', rad: 16, spd: .8 }], ['critter', 6, { k: 'deer', rad: 18, spd: .8 }], ['critter', 6, { k: 'rabbit', rad: 12 }], ['critter', 6, { k: 'pigeon', rad: 8 }], ['float', 8, { k: 'butterfly', c: 0xffd23f, alt: [1, 2.4], amp: 5 }]] },
    { id: 'zotik', x: 0, z: 440, R: 112, pad: 8, spec: [
      ['moosling', 8, {}],
      ['person', 4, { names: ['Fuchs Fenn', 'Fuchs-Frida', 'Silberfuchs Sira', 'Rotfuchs Rufus'], shirts: [0x6b4a2a, 0x3a5a8a], pants: [0x3a2a1a], skins: [0xe8832a, 0xd8d8e0, 0xf0a050], hairs: [0xf08a24, 0xe0e0e8, 0xc86a1a], look: { fox: true, scarf: 0x3fa04a, ctype: 5 }, rad: 14, lines: ['die Splitter funkeln überall in Lunaris! 💠', 'Hörst du die Welten flüstern?', 'Wer Zotik kennt, hat gute Freunde.', 'Meine Ohren hören alles!'] }],
      ['person', 4, { names: ['Wächter Wenzel', 'Wächterin Wilma', 'Hauptmann Harro', 'Wächter Wiebo'], shirts: [0x3f6fd8, 0x1d2a6a], pants: [0x2a2a3a], hats: ['helmet'], look: { cape: true }, spd: 1, rad: 14, lines: ['ich bewache den Mondkristall! 🌙', 'Der Riss an der Akademie macht mir Sorgen.', 'Lunaris ist friedlich, solange wir zusammenhalten.'] }],
      ['person', 8, { names: ['Magierin Mira', 'Gelehrter Gero', 'Händlerin Hanne', 'Bardin Bela', 'Alchemist Alo', 'Sternenguckerin Sia', 'Pilger Pit', 'Kräuterfrau Kora'], shirts: [0x7a3dc2, 0x2f9a6a, 0xd8a24a, 0x3f6fd8], hats: ['wizard', 'none', 'flowers'], look: { cape: true }, spd: 1, rad: 16, lines: ['Wissen ist Macht – Neugier der Schlüssel! 📖', 'Die Mooslinge sind die besten Freunde des Waldes.', 'Zehn Splitter ergeben einen Stern, sagt man.', 'Vom Hafen sieht man die Nautilux fliegen.'] }],
      ['float', 10, { k: 'wisp', c: 0xbfe0ff, alt: [1.2, 3.5], amp: 4 }], ['fly', 5, { k: 'gull', alt: [14, 26], w: .1 }]] },
    { id: 'radio', x: 300, z: 230, R: 112, pad: 8, spec: [
      ['person', 4, { names: ['DJ Dante', 'DJane Dua', 'DJ Rico', 'DJane Rena'], shirts: [0x1a1f5a, 0xff5ab4, 0x35d6e0], hats: ['headphones'], rad: 12, bursts: true, lines: ['ich lege die besten Hits auf! 🎧', 'Dreh das Radio an – die Welt klingt besser.', 'Welcher Sender ist dein Lieblingssender?', 'Musik verbindet uns alle.'] }],
      ['person', 12, { names: ['Fan Fabi', 'Hörerin Hella', 'Fan Felix', 'Hörerin Hanni', 'Fan Flo', 'Hörerin Heike'], shirts: SH, hats: ['headphones', 'cap', 'party'], rad: 18, dance: true, bursts: true, lines: ['ich höre den ganzen Tag Radio! 📻', 'Bei jedem Sender läuft was anderes Tolles.', 'Hast du schon alle dreizehn Sender gehört?', 'Lauter! Lauter! 🎶'] }],
      ['critter', 3, { k: 'robot', rad: 14, spd: .7 }], ['float', 8, { k: 'note', c: '#ff5ab4', alt: [2, 5], amp: 5 }], ['fly', 6, { k: 'gull', alt: [14, 26], w: .12 }]] },
    { id: 'atlantis', x: 1200, z: 0, R: 140, pad: 12, spec: [
      ['person', 10, { names: ['Meermann Moro', 'Meerfrau Marina', 'Perlentaucher Pim', 'Muschel-Mara', 'Tangwächter Tilo', 'Korallen-Kira', 'Delfinflüsterer Dio', 'Quallen-Quin'], shirts: [0x0f5a73, 0x35d6e0, 0x7a8cff], pants: [0xe8f0f6], hairs: [0x35d6e0, 0x7a8cff, 0x6bffd0], skins: [0xa8e0e8, 0xc8f0f0, 0x9ad0e0], hats: ['none', 'flowers'], look: { cape: true }, rad: 18, lines: ['willkommen in der Stadt unter der Erde! 🔱', 'Hier unten scheint nie die Sonne, aber alles leuchtet.', 'Die Gleiter schweben auf Wasserkraft.', 'Hast du schon das Herz von Atlantis gespürt?'] }],
      ['float', 16, { k: 'fish', c: 0xff9a4a, alt: [2, 9], amp: 14, sp: .6 }], ['float', 10, { k: 'fish', c: 0x6bd0ff, alt: [3, 10], amp: 16, sp: .5 }], ['float', 6, { k: 'jelly', c: 0xff6ad5, alt: [3, 9], amp: 8, sp: .3 }], ['critter', 6, { k: 'crab', rad: 8, spd: .5, side: true }]] }
  ];
  /* ---------- Aufbau und Bewegung ---------- */
  function spot(reg, pad) { for (let i = 0; i < 70; i++) { const a = rng() * TAU, d = Math.sqrt(rng()) * (reg.R - reg.pad), x = reg.x + Math.sin(a) * d, z = reg.z + Math.cos(a) * d; if (reg.ok && !reg.ok(x, z)) continue; if (W.free(x, z, pad || .8)) return [x, z]; } return null; }
  function place(n, reg, x, z) { n.x = n.tx = x; n.z = n.tz = z; n.ax = x; n.az = z; n.y = W.groundY(x, z); n.root.position.set(x, n.y, z); }
  function build(reg) {
    reg.built = true; reg.list = [];
    for (const [kind, count, o] of reg.spec) for (let i = 0; i < count; i++) {
      let n;
      if (kind === 'beach') { const a = rng() * TAU, r = R_(168, 175), x = Math.sin(a) * r, z = Math.cos(a) * r; if (!W.free(x, z, .5)) continue; n = F.critter(reg, { k: 'crab', rad: 5, spd: .5, side: true }); place(n, reg, x, z); n.beach = true; }
      else if (F[kind]) {
        n = F[kind](reg, o || {}); if (n.mode === 'fly') { n.root.position.set(reg.x, n.alt, reg.z); n.x = reg.x; n.z = reg.z; }
        else { const s = spot(reg, n.r + .3); if (!s) { K.talkers.splice(K.talkers.indexOf(n), 1); continue; } place(n, reg, s[0], s[1]); }
      } else continue;
      n.reg = reg; n.root.visible = false; scene.add(n.root); reg.list.push(n);
    }
  }
  const dist = (x, z, r) => Math.hypot(P.x - x, P.z - z) - (r || 0);
  function step(n, dt, t, reg) {
    const g = n.root;
    if (n.mode === 'fly') { n.a += dt * n.w; const x = reg.x + Math.sin(n.a) * n.rad, z = reg.z + Math.cos(n.a) * n.rad, y = n.alt + Math.sin(t * .8 + n.ph) * n.bob; g.position.set(x, y, z); g.rotation.y = n.a + (n.w > 0 ? Math.PI / 2 : -Math.PI / 2); g.rotation.z = Math.sin(t + n.ph) * .12; n.x = x; n.z = z; if (n.flap) n.flap(t + n.ph, n.fast || 7); return; }
    if (n.mode === 'float') {
      const x = n.ax + Math.sin(t * n.sp + n.ph) * n.amp, z = n.az + Math.cos(t * n.sp * .8 + n.ph * 1.3) * n.amp, y = (n.base == null ? (n.base = W.groundY(n.ax, n.az)) : n.base) + n.alt + Math.sin(t * n.sp * 1.7 + n.ph) * .5;
      g.rotation.y = Math.atan2(Math.cos(t * n.sp + n.ph), -Math.sin(t * n.sp * .8 + n.ph * 1.3) * .8) + (n.flutter ? 0 : 0); g.position.set(x, y, z); n.x = x; n.z = z; if (n.flap) n.flap(t + n.ph, 20); if (n.pose) n.pose(t * 2 + n.ph, 1); return;
    }
    n.wait -= dt; n.hop = Math.max(0, n.hop - dt); let moving = false, dancing = false;
    if (n.mode === 'dance') dancing = true;
    else if (n.wait <= 0) {
      const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
      if (d < .5) { n.wait = n.kind === 'person' ? 1 + rng() * 4 : .6 + rng() * 3; if (n.kind === 'person' && (n.dancer || n.bursts) && rng() < (n.dancer ? .5 : .15)) { n.dance = 3 + rng() * 4; } const a = rng() * TAU, r = 3 + rng() * n.rad; let tx = n.x + Math.sin(a) * r, tz = n.z + Math.cos(a) * r; const dd = Math.hypot(tx - reg.x, tz - reg.z), lim = reg.R - reg.pad; if (dd > lim) { tx = reg.x + (tx - reg.x) / dd * lim; tz = reg.z + (tz - reg.z) / dd * lim; } if (n.beach) { const q = Math.hypot(tx, tz); if (q < 166 || q > 176) { tx = tx / q * 171; tz = tz / q * 171; } } n.tx = tx; n.tz = tz; if (n.kind === 'person' && rng() < .12) n.hop = .6; }
      else { n.h += ang(n.h, Math.atan2(dx, dz)) * Math.min(1, dt * 7); n.x += Math.sin(n.h) * n.spd * dt; n.z += Math.cos(n.h) * n.spd * dt; moving = true; }
    }
    if (n.dance > 0) { n.dance -= dt; dancing = true; moving = false; }
    const q = W.resolve(n.x, n.z, n.r, tmp); if (q.hit && Math.hypot(q.x - n.x, q.z - n.z) > .02) { n.tx = q.x; n.tz = q.z; n.wait = .3; } n.x = q.x; n.z = q.z;
    n.ph += dt * (moving ? 7 : 0); n.y = W.groundY(n.x, n.z);
    g.position.set(n.x, n.y + (n.hop > 0 ? Math.sin(n.hop / .6 * Math.PI) * .5 : 0), n.z); g.rotation.y = n.h + (n.side ? Math.PI / 2 : 0);
    if (dancing && n.c && n.c.dance) { n.c.dance(t + n.ph, 0); g.position.y += Math.abs(Math.sin((t + n.ph) * 8)) * .12; } else n.pose(moving ? n.ph : t * 1.2 + n.x, moving ? .7 : 0, false);
  }
  /* Eine Welt wird gefüllt, sobald man ihr nahekommt; bewegt wird nur, was in der Nähe ist */
  K.update = function (dt, t, eco) {
    const view = eco ? 62 : 88;
    for (const reg of REG) {
      const d = dist(reg.x, reg.z), act = d < reg.R + 110; if (!act) { if (reg.on) { reg.on = false; for (const n of reg.list) n.root.visible = false; } continue; }
      if (!reg.built) { build(reg); } reg.on = true;
      for (const n of reg.list) {
        const dd = Math.hypot(P.x - n.x, P.z - n.z), vis = dd < view; if (n.root.visible !== vis) n.root.visible = vis; if (!vis) continue; step(n, dt, t, reg);
      }
    }
  };
  K.regions = REG;
  return K;
};
