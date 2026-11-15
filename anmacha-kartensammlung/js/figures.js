'use strict';
/* AnMaCha Kartensammlung 3D – Spielfiguren: echte 3D-Modelle aus KayKit Adventurers 2.0 / Skeletons 1.1 (Kay Lousberg, CC0) mit Bewegungen
   (anim.glb: Idle, Interact, Throw, Use_Item, Hit, Spawn …). Geladen wird nur, was am Tisch sitzt; die Vorschaubilder fürs Menü liegen fertig in img/.
   Ohne WebGL-Modelle (z. B. offline ohne Cache) gibt es einfache Ersatzfiguren aus Grundkörpern (KR.buildFig).
   KR.FIGS: Liste; KR.figModel(THREE, id) → Promise<Group mit userData.play(name)>; KR.figTick(dt) bewegt alle Figuren. */
(function (root) {
  const KR = root.KR = root.KR || {};
  KR.FIGS = [
    { name: 'Ritter', emo: '🛡️', col: 0x60a5fa, file: 'ad_kn' },
    { name: 'Barbar', emo: '🪓', col: 0xf97316, file: 'ad_ba' },
    { name: 'Magierin', emo: '🔮', col: 0xa78bfa, file: 'ad_ma' },
    { name: 'Jäger', emo: '🏹', col: 0x22c55e, file: 'ad_ra' },
    { name: 'Schurkin', emo: '🗡️', col: 0xef4444, file: 'ad_ro' },
    { name: 'Schatten', emo: '🥷', col: 0x334155, file: 'ad_rh' },
    { name: 'Knochenritter', emo: '💀', col: 0xe2e8f0, file: 'sk_w' },
    { name: 'Knochenhexe', emo: '☠️', col: 0x84cc16, file: 'sk_m' }
  ];
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/js\/figures\.js.*$/, '') || './';
  const H = 1.55;                       // Höhe am Tisch (Weltmaße)
  const bufs = {}, mixers = new Set();
  let animP = null, loader = null;
  const getBuf = f => bufs[f] || (bufs[f] = fetch(BASE + 'models/' + f + '.glb').then(r => { if (!r.ok) throw new Error('glb'); return r.arrayBuffer(); }));
  const parse = (T, buf) => new Promise((res, rej) => { loader = loader || new T.GLTFLoader(); loader.parse(buf, BASE + 'models/', res, rej); });
  function clips(T) { return animP || (animP = getBuf('anim').then(b => parse(T, b)).then(g => g.animations)); }
  // Ein Modell je Platz: die Datei wird einmal geladen und für jede Figur neu ausgelesen (eigenes Skelett, kein Klon-Werkzeug nötig)
  KR.figModel = function (T, id) {
    const f = KR.FIGS[id] || KR.FIGS[0];
    if (!T.GLTFLoader) return Promise.reject(new Error('loader'));
    return Promise.all([getBuf(f.file).then(b => parse(T, b)), clips(T)]).then(([g, anims]) => {
      const m = g.scene;
      m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; const mt = o.material; if (mt && mt.map) { mt.map.encoding = T.LinearEncoding; mt.map.anisotropy = 4; mt.needsUpdate = true; } if (mt) { mt.metalness = 0; mt.roughness = .85; } } });
      m.scale.setScalar(H / 2.45);   // alle KayKit-Figuren nutzen dasselbe Skelett (Rig_Medium, Füße bei 0, ca. 2,45 hoch); die Hüllquader quantisierter Netze taugen nicht zum Messen
      const g2 = new T.Group(); g2.add(m);
      const mixer = new T.AnimationMixer(m), act = {};
      anims.forEach(c => { act[c.name] = mixer.clipAction(c); });
      let cur = act.Idle_A; if (cur) cur.play();
      mixer.addEventListener('finished', () => { if (act.Idle_A && cur !== act.Idle_A) { const prev = cur; cur = act.Idle_A; cur.reset().play(); prev.crossFadeTo(cur, .25, false); } });
      g2.userData.play = name => {
        const a = act[name]; if (!a || a === cur) return;
        a.reset(); a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = true; a.play(); if (cur) cur.crossFadeTo(a, .18, false); cur = a;
      };
      g2.userData.mixer = mixer; mixers.add(mixer);
      g2.userData.dispose = () => { mixers.delete(mixer); mixer.stopAllAction(); m.traverse(o => { if (o.isMesh) { o.geometry.dispose(); const mt = o.material; if (mt) { if (mt.map) mt.map.dispose(); mt.dispose(); } } }); };
      return g2;
    });
  };
  KR.figTick = dt => { mixers.forEach(m => m.update(dt)); return mixers.size > 0; };
  KR.figLoaded = () => mixers.size;
  KR.figPreload = T => { if (T.GLTFLoader) clips(T).catch(() => { }); };

  /* ---------- Ersatzfiguren aus Grundkörpern (falls die Modelle nicht laden) ---------- */
  let GEO = null; const MAT = {};
  function geo(T) {
    if (GEO) return GEO;
    GEO = {
      body: new T.CylinderGeometry(.27, .36, .56, 14), head: new T.SphereGeometry(.28, 16, 12), eye: new T.SphereGeometry(.075, 10, 8),
      pup: new T.SphereGeometry(.04, 8, 6), cone: new T.ConeGeometry(.1, .24, 8), box: new T.BoxGeometry(1, 1, 1), ball: new T.SphereGeometry(.05, 8, 6),
      stick: new T.CylinderGeometry(.018, .018, .22, 6), ear: new T.CylinderGeometry(.055, .07, .38, 8), foot: new T.SphereGeometry(.11, 10, 6), crown: new T.CylinderGeometry(.2, .17, .14, 10, 1, true)
    };
    return GEO;
  }
  const mat = (T, c) => MAT[c] || (MAT[c] = new T.MeshLambertMaterial({ color: c, side: T.DoubleSide }));
  function add(T, g, geom, c, x, y, z, sx, sy, sz, rz, rx) {
    const m = new T.Mesh(geom, mat(T, c)); m.position.set(x, y, z);
    if (sx) m.scale.set(sx, sy || sx, sz || sx); if (rz) m.rotation.z = rz; if (rx) m.rotation.x = rx; g.add(m); return m;
  }
  KR.buildFig = function (T, id) {
    const f = KR.FIGS[id] || KR.FIGS[0], G = geo(T), g = new T.Group(), c = f.col;
    const W = 0xffffff, B = 0x111827;
    const eyes = (y, z, s) => { [-1, 1].forEach(k => { add(T, g, G.eye, W, k * .1, y, z, s); add(T, g, G.pup, B, k * .1, y, z + .055 * (s || 1), s); }); };
    if (id === 0) { // Robo: Kastenkopf mit Antenne
      add(T, g, G.box, 0x94a3b8, 0, .3, 0, .5, .52, .36); add(T, g, G.box, c, 0, .78, 0, .5, .4, .42);
      add(T, g, G.box, 0x0f172a, 0, .79, .2, .38, .2, .04); [-1, 1].forEach(k => add(T, g, G.ball, 0x67e8f9, k * .1, .79, .23, .9));
      add(T, g, G.stick, 0x94a3b8, 0, 1.06, 0); add(T, g, G.ball, 0xff2d95, 0, 1.18, 0, 1.4);
      return g;
    }
    if (id === 3) { // Pingu: eiförmig, weißer Bauch, Schnabel
      add(T, g, G.head, c, 0, .42, 0, 1.25, 1.55, 1.15); add(T, g, G.head, W, 0, .38, .1, .95, 1.2, .9);
      eyes(.68, .25, .9); add(T, g, G.cone, 0xff9d2e, 0, .58, .34, .7, .7, .7, 0, Math.PI / 2);
      [-1, 1].forEach(k => add(T, g, G.foot, 0xff9d2e, k * .12, .03, .12, 1, .4, 1.3));
      return g;
    }
    add(T, g, G.body, c, 0, .28, 0);
    add(T, g, G.head, c, 0, .78, 0, id === 4 ? 1.25 : 1, id === 4 ? 1.1 : 1, 1);
    if (id === 1) { // Fuchs: spitze Ohren, helle Schnauze
      [-1, 1].forEach(k => add(T, g, G.cone, c, k * .15, 1.06, 0, 1, 1, 1, -k * .25));
      add(T, g, G.cone, 0xfff1e6, 0, .72, .27, .9, .8, .9, 0, Math.PI / 2); add(T, g, G.ball, B, 0, .72, .38);
      add(T, g, G.head, 0xfff1e6, 0, .3, .17, .7, .9, .5); eyes(.84, .22);
    } else if (id === 2) { // Mieze: Ohren, Schnurrhaare
      [-1, 1].forEach(k => add(T, g, G.cone, c, k * .16, 1.04, 0, .9, .8, .9, -k * .3));
      add(T, g, G.ball, 0xff7ab8, 0, .74, .28); [-1, 1].forEach(k => add(T, g, G.box, W, k * .18, .72, .25, .16, .012, .01));
      eyes(.84, .22);
    } else if (id === 4) { // Zorg: großer Kopf, Fühler, drei Augen
      [-1, 1].forEach(k => { const s = add(T, g, G.stick, c, k * .14, 1.12, 0, 1, 1.2, 1, -k * .4); s.position.x = k * .16; add(T, g, G.ball, 0xfde047, k * .21, 1.25, 0, 1.3); });
      [-.13, 0, .13].forEach(x => { add(T, g, G.eye, 0x0f172a, x, .82, .27, .9); add(T, g, G.ball, W, x + .02, .84, .33, .45); });
    } else if (id === 5) { // Hoppel: lange Ohren
      [-1, 1].forEach(k => { add(T, g, G.ear, c, k * .11, 1.18, 0, 1, 1, 1, -k * .15); add(T, g, G.ear, 0xffc2dd, k * .11, 1.18, .03, .55, .9, .4, -k * .15); });
      add(T, g, G.ball, 0xff7ab8, 0, .74, .28); eyes(.84, .22);
    } else if (id === 6) { // Quaki: Augen oben auf dem Kopf, breiter Mund
      [-1, 1].forEach(k => { add(T, g, G.head, c, k * .14, 1.0, .05, .42); add(T, g, G.eye, W, k * .14, 1.02, .14, 1); add(T, g, G.pup, B, k * .14, 1.02, .2); });
      add(T, g, G.box, 0x14532d, 0, .7, .26, .3, .03, .03);
    } else { // Krone: goldene Krone
      add(T, g, G.crown, 0xffd426, 0, 1.08, 0); [0, 1, 2, 3, 4].forEach(k => { const a = k / 5 * Math.PI * 2; add(T, g, G.ball, 0xffd426, Math.sin(a) * .19, 1.17, Math.cos(a) * .19, .9); });
      add(T, g, G.ball, 0x22d3ee, 0, 1.08, .2, .9); eyes(.82, .23);
    }
    [-1, 1].forEach(k => add(T, g, G.foot, c, k * .14, .03, .1, 1, .45, 1.2));
    return g;
  };
})(typeof window !== 'undefined' ? window : globalThis);
