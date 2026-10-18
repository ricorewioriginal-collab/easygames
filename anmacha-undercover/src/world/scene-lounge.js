/* AnMaCha UNDERCOVER 3D – Lounge: runder Besprechungstisch für Meetings und das Wortspiel (bis 12 Plätze).
   AMU.WorldLounge.build(theme, quality) → { group, seat(i, n, out) → [x, z, ry], cards, ring, cone, holo, strips, dispose }
   Statisches ist zu zwei Geometrien zusammengefügt (fest + leuchtend), dazu Wand, Lichtkegel, Karten (InstancedMesh). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const T = root.THREE;
  const PI = Math.PI;
  const SEAT_R = 3.05, OUT_R = 4.9, TABLE_R = 2.15, TABLE_H = 0.6, CARD_R = 1.62, MAXSEAT = 12;
  let thinRing = null;

  function build(theme, quality) {
    const K = AMU.WorldKit, M = K.mats(), q = K.qOf(quality);
    const th = theme || { floor: '#2a3558', floor2: '#34406a', wall: '#1a2344', wallTop: '#ff9a2e', accent: '#29d3ff', sky: '#070d1f', fog: '#0a1430', amb: 0.55 };
    const group = new T.Group(); group.name = 'amu-lounge';
    const geos = [], mats = [], texs = [];
    const s = K.builder(q), g = K.builder(q);
    const floorC = K.mix(th.floor, '#10131f', 0.35), acc = th.accent, top = th.wallTop;
    s.at(0, 0, 0); g.at(0, 0, 0);
    // Boden: Studio-Podest mit Ringen
    s.add('cyl', floorC, 0, -0.06, 0, 26, 0.1, 26);
    s.add('cyl', K.mix(th.floor2, '#000000', 0.15), 0, -0.005, 0, 9.4, 0.02, 9.4);
    g.add('ring', K.mix(acc, floorC, 0.35), 0, 0.012, 0, 9.6, 9.6, 0.3, PI / 2);
    g.add('ring', K.mix(top, floorC, 0.45), 0, 0.012, 0, 14, 14, 0.25, PI / 2);
    // Tisch
    s.add('cyl', '#262c40', 0, 0.06, 0, 1.6, 0.12, 1.6);
    s.add('cyl', '#3a4158', 0, TABLE_H / 2, 0, 0.5, TABLE_H, 0.5, 0, 0, 0, 0.4);
    s.add('cyl', K.mix(th.wall, '#6a7490', 0.35), 0, TABLE_H, 0, TABLE_R * 2, 0.1, TABLE_R * 2);
    s.add('cyl', '#121626', 0, TABLE_H + 0.055, 0, TABLE_R * 2 - 0.3, 0.02, TABLE_R * 2 - 0.3);
    g.add('ring', acc, 0, TABLE_H + 0.02, 0, TABLE_R * 2 + 0.02, TABLE_R * 2 + 0.02, 0.9, PI / 2);
    // Mitte: Sendemast-Pult
    s.add('cyl', '#2c3246', 0, TABLE_H + 0.12, 0, 0.7, 0.14, 0.7);
    g.add('hemi', '#ff2a3c', 0, TABLE_H + 0.19, 0, 0.36, 0.24, 0.36);
    // Hintergrund-Deko: Lautsprechertürme und Lichtsäulen im Kreis
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * PI * 2 + PI / 8, x = Math.cos(a) * 10.5, z = Math.sin(a) * 10.5;
      s.at(x, z, Math.atan2(-x, -z));
      s.add('box', '#14171f', 0, 1.1, 0, 1.0, 2.2, 0.8, 0, 0, 0, 0.3);
      s.add('cyl', '#3c4254', 0, 1.45, 0.405, 0.6, 0.04, 0.6, PI / 2); s.add('cyl', '#3c4254', 0, 0.7, 0.405, 0.42, 0.04, 0.42, PI / 2);
      g.at(x, z, Math.atan2(-x, -z));
      g.add('box', i % 2 ? acc : top, 0, 2.05, 0.405, 0.8, 0.05, 0.01);
    }
    s.at(0, 0, 0); g.at(0, 0, 0);
    const sg = s.build(), gg = g.build();
    const sm = new T.Mesh(sg, M.solid); sm.receiveShadow = true; sm.castShadow = true;
    group.add(sm, new T.Mesh(gg, M.glow)); geos.push(sg, gg);

    // Hocker als eigene Instanzen (Anzahl je nach Spielerzahl)
    const stoolGeo = K.protos(q).cyl, stoolMat = new T.MeshLambertMaterial({ color: K.mix(top, '#2a2a3a', 0.35) }); mats.push(stoolMat);
    const stools = new T.InstancedMesh(stoolGeo, stoolMat, MAXSEAT); stools.count = 0; stools.castShadow = true; group.add(stools);

    // Wand ringsum (Innenseite sichtbar) mit Leuchtbändern
    const wallGeo = new T.CylinderGeometry(15, 15, 5, q === 'low' ? 24 : 40, 1, true); geos.push(wallGeo);
    const wallMat = new T.MeshLambertMaterial({ color: K.shade(th.wall, 1.4), side: T.BackSide }); mats.push(wallMat);
    const wall = new T.Mesh(wallGeo, wallMat); wall.position.y = 2.4; group.add(wall);
    if (!thinRing) { thinRing = new T.TorusGeometry(1, 0.004, 3, 64); thinRing.rotateX(PI / 2); }
    const stripMat = new T.MeshBasicMaterial({ color: acc }); mats.push(stripMat);
    const strips = [];
    [1.0, 3.2].forEach(y => { const m = new T.Mesh(thinRing, stripMat); m.scale.setScalar(14.9); m.position.y = y; group.add(m); strips.push(m); });
    // ON-AIR-Schilder
    const signT = K.signTex('ON AIR', '#ff4050', '#2a0a10'); texs.push(signT);
    const signM = new T.MeshBasicMaterial({ map: signT }); mats.push(signM);
    const signG = new T.PlaneGeometry(3.2, 0.8); geos.push(signG);
    [0, PI].forEach(a => { const m = new T.Mesh(signG, signM); m.position.set(Math.cos(a) * 14.6, 3.9, Math.sin(a) * 14.6); m.lookAt(0, 3.9, 0); group.add(m); });

    // Lichtpfütze über dem Tisch, Sprecher-Ring + Lichtkegel, kreisendes Hologramm
    const poolG = new T.PlaneGeometry(1, 1); poolG.rotateX(-PI / 2); geos.push(poolG);
    const poolM = M.pool.clone(); poolM.color.set(K.mix('#ffe2b0', acc, 0.2)); poolM.opacity = 0.55; mats.push(poolM);
    const pool = new T.Mesh(poolG, poolM); pool.scale.set(11, 1, 11); pool.position.y = 0.015; pool.renderOrder = 1; group.add(pool);
    const ringM = new T.MeshBasicMaterial({ color: top, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }); mats.push(ringM);
    const ringG = new T.RingGeometry(0.5, 0.68, q === 'low' ? 24 : 40); ringG.rotateX(-PI / 2); geos.push(ringG);
    const ring = new T.Mesh(ringG, ringM); ring.position.y = 0.03; ring.visible = false; ring.renderOrder = 2; group.add(ring);
    const coneG = new T.CylinderGeometry(0.25, 0.85, 4.2, q === 'low' ? 12 : 20, 1, true); coneG.translate(0, 2.1, 0); geos.push(coneG);
    const coneM = new T.MeshBasicMaterial({ color: K.mix(top, '#ffffff', 0.4), transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }); mats.push(coneM);
    const cone = new T.Mesh(coneG, coneM); cone.visible = false; cone.renderOrder = 3; group.add(cone);
    const holoM = new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false }); mats.push(holoM);
    const holo = new T.Mesh(new T.TorusGeometry(0.5, 0.025, 4, q === 'low' ? 24 : 40), holoM); geos.push(holo.geometry);
    holo.position.y = TABLE_H + 0.75; holo.renderOrder = 2; group.add(holo);

    // Rollenkarten (verdeckt)
    const cardT = K.cardTex(top); texs.push(cardT);
    const cardM = new T.MeshLambertMaterial({ map: cardT }); mats.push(cardM);
    const cards = new T.InstancedMesh(K.protos(q).box, cardM, MAXSEAT);
    const white = new T.Color(1, 1, 1); for (let i = 0; i < MAXSEAT; i++) cards.setColorAt(i, white);
    cards.count = 0;
    group.add(cards);

    /** Platz i von n → o = [x, z, Blickrichtung, Winkel] (o wird wiederverwendet). */
    function seat(i, n, out, o) {
      const a = -PI / 2 + i / Math.max(1, n) * PI * 2, r = out ? OUT_R : SEAT_R;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      o = o || [0, 0, 0, 0]; o[0] = x; o[1] = z; o[2] = Math.atan2(-x, -z); o[3] = a;
      return o;
    }
    return {
      group, seat, cards, stools, ring, cone, holo, strips, stripMat, theme: th, SEAT_R, CARD_R, TABLE_H, MAXSEAT,
      dispose() {
        if (group.parent) group.parent.remove(group);
        geos.forEach(x => x.dispose()); mats.forEach(x => x.dispose()); texs.forEach(x => x.dispose());
        cards.dispose(); stools.dispose();
      }
    };
  }

  AMU.WorldLounge = { build };
})(typeof window !== 'undefined' ? window : globalThis);
