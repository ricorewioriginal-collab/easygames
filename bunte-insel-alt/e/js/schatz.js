'use strict';
/* Bunte Insel – Schatzsuche über alle Inseln 🗺️🧰: Schatzmeister Piet (Hauptinsel) gibt das erste Bilder-Rätsel; eine goldene Lichtsäule zeigt von Weitem,
   wo die Kiste steht (nur EINE Kiste und EIN Lichtstrahl gleichzeitig, sparsam). Jede Kiste = +1 ⭐ und das nächste Rätsel (mit Bildern, wird vorgelesen,
   der Pfeil 👣 zeigt die Insel). 8 Stationen: Freizeitpark, Fußball-Arena, Märchenland, Funkwelle, Drachenhöhen, Regenbogenwelt, Zotik, Atlantis.
   Am Ende: der große Schatz (+10 ⭐, Sticker); danach geht es wieder von vorn (jedes Mal +5 ⭐ am Ende). Alles selbst erfunden. */
BI.SCHATZ_STEPS = [
  { dest: 'park', icons: '🎠🎡', short: 'Freizeitpark', say: 'Wo dreht sich alles im Kreis? Such die Kiste im Freizeitpark!', isle: () => BI.PARK, anchor: () => ({ x: BI.PARK.x + 24, z: BI.PARK.z - 20 }) },
  { dest: 'fussball', icons: '⚽🥅', short: 'Fußball-Arena', say: 'Wo rollt der Ball? Such die Kiste hinter dem Tor!', isle: () => BI.FUSSBALL, anchor: () => { const P = BI.FUSSBALL.pitch; return { x: P.x + P.HX + 7, z: P.z + 3 }; } },
  { dest: 'maerchen', icons: '🏰👑', short: 'Märchenland', say: 'Wo wohnt die Prinzessin? Such die Kiste im Märchenland!', isle: () => BI.MAERCHEN, anchor: () => BI.MAERCHEN.at(0, 15) },
  { dest: 'radio', icons: '📻🎵', short: 'Funkwelle', say: 'Wo spielt laute Musik? Such die Kiste in der Funkwelle!', isle: () => BI.RADIO, anchor: () => ({ x: BI.RADIO.x + 7, z: BI.RADIO.z + 7 }) },
  { dest: 'drachen', icons: '🐉🔥', short: 'Drachenhöhen', say: 'Wo wohnen die Drachen? Such die Kiste in den Drachenhöhen!', isle: () => BI.DRACHEN, anchor: () => ({ x: BI.DRACHEN.x + 10, z: BI.DRACHEN.z + 8 }) },
  { dest: 'rainbow', icons: '🌈🦄', short: 'Regenbogenwelt', say: 'Wo ist alles bunt? Such die Kiste in der Regenbogenwelt!', isle: () => BI.RAINBOW, anchor: () => ({ x: BI.RAINBOW.x + 9, z: BI.RAINBOW.z + 8 }) },
  { dest: 'zotik', icons: '⭐💎', short: 'Lunaris', say: 'Wo glitzert der Mondkristall? Such die Kiste in Lunaris!', isle: () => BI.ZOTIK, anchor: () => ({ x: BI.ZOTIK.x + 8, z: BI.ZOTIK.z + 8 }) },
  { dest: 'atlantis', icons: '🔱🐠', short: 'Atlantis', say: 'Ganz tief unten schwimmen die Fische. Such den großen Schatz in Atlantis!', isle: () => BI.ATLANTIS, anchor: () => ({ x: BI.ATLANTIS.x + 6, z: BI.ATLANTIS.z + 36 }) }
];
BI.createSchatz = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, ST = BI.SCHATZ_STEPS, S = () => (save.schatz || (save.schatz = { i: -1, found: 0, runs: 0 }));
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#5a3a00'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3c8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  /* freie Plätze für die Kisten: nahe am Wunschpunkt, frei, auf der Insel */
  const findSpot = (a, I) => { for (let r = 0; r <= 26; r += 2) for (let k = 0; k < (r ? 12 : 1); k++) { const an = k / 12 * Math.PI * 2 + r, x = a.x + Math.sin(an) * r, z = a.z + Math.cos(an) * r; if (Math.hypot(x - I.x, z - I.z) < I.R - 6 && W.free(x, z, 1.8) && !(W.spots.arcades || []).some(q => Math.hypot(q.x - x, q.z - z) < 7)) return { x, z }; } return { x: a.x, z: a.z }; };
  const spots = ST.map(s => findSpot(s.anchor(), s.isle()));
  /* Piet, der Schatzmeister, auf der Hauptinsel nahe dem Start */
  const pietAt = findSpot({ x: -16, z: 34 }, { x: 0, z: 0, R: 150 });
  /* Kiste + Lichtsäule (ein einziges Objekt, wird versetzt) */
  const chest = new THREE.Group(); { const b = new BI.Batch(); b.box(0, 0, 0, 1.5, .8, 1.0, 0x8a5a33); b.box(0, .8, 0, 1.56, .3, 1.06, 0xb98650); b.box(0, .4, .52, .3, .3, .06, 0xffd23f); b.box(-.7, 0, 0, .1, 1.0, 1.1, 0xffd23f); b.box(.7, 0, 0, .1, 1.0, 1.1, 0xffd23f); b.sph(0, 1.45, 0, .22, 0xffd23f, 1); chest.add(b.mesh(BI.mat())); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, 1.3, 130, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); beam.position.y = 65; chest.add(beam); chest.visible = false; scene.add(chest);
  /* Steht später etwas im Weg (z. B. ein gebautes Fahrgeschäft im Park), wird die Kiste an einen freien Platz in der Nähe gesetzt */
  const revalidate = () => { const s = S(); if (s.i < 0 || s.i >= ST.length) return; const q = spots[s.i]; if (!W.free(q.x, q.z, 1.2)) { const st = ST[s.i], n = findSpot(q, st.isle()); spots[s.i] = n; } };
  const showChest = () => { const s = S(); if (s.i < 0 || s.i >= ST.length) { chest.visible = false; return; } revalidate(); chest.position.set(spots[s.i].x, 0, spots[s.i].z); chest.visible = true; };
  const clue = (speak) => { const s = S(); if (s.i < 0) return; const t = ST[s.i]; say(t.icons + '  ' + t.short, 4200); if (speak) A.speak && A.speak(t.say); G.guide && G.guide(t.dest); };
  K.start = function () { const s = S(); s.i = 0; persist(); showChest(); say('🗺️ Ahoi! Die Schatzsuche beginnt! Folge dem goldenen Lichtstrahl!', 4200); A.speak && A.speak('Ahoi! Folge dem goldenen Lichtstrahl, dann findest du die Kiste!'); setTimeout(() => clue(true), 3600); };
  /* Figur Piet */
  K.people = function () {
    const look = { shirt: 0x8a2a2a, pants: 0x2a2a3a, hair: 0x222222, skin: 0xd8a070, hat: 'pirate', style: 'short', beard: 5, beardc: 0x222222, scale: 1.04 }, c = BI.makeChar(look), h = Math.atan2(-pietAt.x, 26 - pietAt.z);
    c.group.position.set(pietAt.x, 0, pietAt.z); c.group.rotation.y = h; scene.add(c.group); sign('🗺️ Schatzmeister Piet', pietAt.x, 3.3, pietAt.z, 6.5); K.piet = pietAt;
    K.pietChar = c; W.addCircle(pietAt.x, pietAt.z, .5, false, 2); /* nicht über „Sprechen“, sondern über den eigenen Knopf (Schatzsuche starten / Rätsel nochmal hören) */
  };
  K.near = function () {
    if (P.veh || P.y > 4) return null; const s = S();
    if (s.i >= 0 && s.i < ST.length) { const q = spots[s.i]; if (Math.hypot(P.x - q.x, P.z - q.z) < 2.8) return { k: 'schatz' }; }
    if (Math.hypot(P.x - pietAt.x, P.z - pietAt.z) < 3.6) return s.i < 0 ? { k: 'schatzstart' } : { k: 'schatzclue' };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'schatzstart') K.start(); else if (n.k === 'schatzclue') clue(true);
    else if (n.k === 'schatz' && s.i >= 0) {
      const q = spots[s.i], last = s.i >= ST.length - 1; s.found++; fx.burst(q.x, 1.4, q.z, last ? 60 : 30, [[1, .85, .3], [1, 1, 1], [1, .6, .8], [.5, .9, 1]], 6, 1.5, 30, 5); A.star && A.star(); G.addStars(1);
      if (last) { s.runs++; const bonus = s.runs === 1 ? 10 : 5; G.addStars(bonus); G.earn && G.earn('schatz'); s.i = -1; persist(); showChest(); say('💰 DER GROSSE SCHATZ! +' + (bonus + 1) + ' ⭐ – Piet freut sich!', 5200); A.fanfare && A.fanfare(); A.speak && A.speak('Der große Schatz! Super gemacht!'); }
      else { s.i++; persist(); showChest(); say('🧰 Kiste gefunden! +1 ⭐', 2400); setTimeout(() => clue(true), 1800); }
    }
  };
  let tt = 0;
  let rv = 0;
  K.update = function (dt, t) { if (!chest.visible) return; rv -= dt; if (rv <= 0) { rv = 2; const o = chest.position.x; revalidate(); const q = spots[S().i]; if (q && (q.x !== o)) chest.position.set(q.x, 0, q.z); } chest.rotation.y = Math.sin(t * .8) * .25; chest.position.y = Math.sin(t * 2) * .08; beam.material.opacity = .26 + .1 * Math.sin(t * 3); tt -= dt; if (tt <= 0) { tt = .25; const q = chest.position; if (Math.hypot(P.x - q.x, P.z - q.z) < 60) fx.emit(q.x + (Math.random() - .5) * 1.6, 1.4, q.z + (Math.random() - .5) * 1.6, 0, 1.6, 0, 1.2, 30, .5, .85, .9, -.3, .8); } };
  K.log = () => { const s = S(), cur = s.i >= 0 && s.i < ST.length ? ST[s.i] : null; return { title: '🗺️ Schatzsuche', count: (s.i < 0 ? s.runs ? 'geschafft ×' + s.runs : 'noch nicht gestartet' : s.i + ' von ' + ST.length), rows: [
    { ok: s.i >= 0 || s.runs > 0, icon: '🗺️', text: 'Mit Schatzmeister Piet sprechen und die Schatzsuche starten', dest: null },
    cur ? { ok: false, icon: cur.icons, text: 'Nächste Kiste: ' + cur.short + ' (goldenen Lichtstrahl folgen)', dest: cur.dest } : { ok: s.runs > 0, icon: '💰', text: 'Alle ' + ST.length + ' Kisten finden – der große Schatz wartet', dest: null }] }; };
  K.state = () => ({ spots, chest, pietAt });
  showChest();
  return K;
};
