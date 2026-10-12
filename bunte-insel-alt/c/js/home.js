'use strict';
/* Bunte Insel – Umziehen: Im Baumenü (Reiter „Umzug“) stellst du deine Wohnung (Haus Sonnenschein) an einen beliebigen freien Ort der Hauptinsel oder des Baulands.
   Die Wohnung hat dort dieselben Zimmer, Eltern, Bett, Kleiderschrank und Spielkiste; Zuhause, Start, Haustier und Pappnase wohnen dort mit.
   Zu jedem Haus gehören Limousine, Rutschauto und Hubschrauber – sie ziehen mit um und kehren nach der Fahrt von selbst vors Haus zurück.
   Gespeichert wird nur die Lage (save.home = { x0, ZF }); der Umzug gilt für dich (andere Spieler sehen dein altes Zuhause im Haus Sonnenschein). */
BI.createHome = function (G) {
  const { scene, W, fx, say, save, persist, A } = G, K = { cur: null }, FW = 12, mat = BI.mat();
  const landOK = (x, z) => Math.hypot(x, z) < W.K.LIMIT - 8 || (W.bauland && Math.hypot(x - W.bauland.x, z - W.bauland.z) < W.bauland.R - 8);
  let vk = '', vv = false;
  /* Passt die Wohnung (12 × 16 m + Vorplatz) mit der Tür bei (x, z) dorthin? Eigene alte Wohnung zählt nicht als Hindernis. */
  K.valid = function (x, z) {
    const key = x + ',' + z + ',' + (K.cur ? 1 : 0); if (key === vk) return vv; vk = key;
    const x0 = x - FW / 2, zF = z - 2.6, zB = zF - 16, skip = K.cur ? K.cur.set : null; vv = false;
    for (let px = x0 - 1; px <= x0 + FW + 1.01; px += 3) for (let pz = zB - 1; pz <= zF + 1.01; pz += 3) if (!landOK(px, pz) || W.blockedAt(px, pz, .3, false, skip)) return false;
    for (const q of [[x0 - 2, zF + 3], [x0 + FW + 2, zF + 3], [x0 - 2, zF + 12], [x0 + FW + 2, zF + 12], [x, zF + 12]]) if (!landOK(q[0], q[1])) return false;
    for (const sp of BI.homeSpawns({ cx: x, zF, i: 0 })) if (!landOK(sp.x, sp.z) || W.railSdf(sp.x, sp.z) < 5) return false;
    if (W.bauland && Math.hypot(x - W.bauland.entry.x, z - W.bauland.entry.z) < 15) return false;
    return vv = true;
  };
  K.roof = () => K.cur && K.cur.roof;
  /* Fahrzeuge des Hauses (meine Wohnung) zu den Plätzen der Wohnung f stellen */
  function carry(f, fxOn) {
    const mine = G.vehs().filter(v => v.home && v.home.slot === G.slot()), tmp = {};
    for (const sp of BI.homeSpawns(f)) {
      const v = mine.find(q => q.type === sp.type); if (!v) continue; W.resolve(sp.x, sp.z, v.r + .3, tmp);
      if (fxOn) fx.burst(v.x, 1.2, v.z, 8, [BI.C.white, BI.C.gold], 3, .8, 26, 3);
      v.home = { x: tmp.x, z: tmp.z, h: sp.h, slot: v.home.slot }; v.setPose(tmp.x, tmp.z, sp.h); v.v = 0; v.y = 0; v.vy = 0; v.idleT = 0;
      if (fxOn) fx.burst(tmp.x, 1.2, tmp.z, 8, [BI.C.white, BI.C.pink], 3, .8, 26, 3);
    }
  }
  function make(x0, zF) {
    const st = new BI.Batch(), roofB = new BI.Batch(), cols = [];
    const Wp = { addBox: (...a) => { const it = W.addBox(...a); cols.push(it); return it; }, addCircle: (...a) => { const it = W.addCircle(...a); cols.push(it); return it; } };
    const f = BI.buildFlat({ W: Wp, st, roofB, i: G.slot(), x0, ZF: zF, right: true }); st.rect(x0 - 1, zF, x0 + FW + 1, zF + 5, .035, 0xd9cfb8);
    const mesh = st.mesh(mat), roof = roofB.mesh(mat); mesh.frustumCulled = false; roof.frustumCulled = false; scene.add(mesh, roof);
    K.cur = { f, mesh, roof, cols, set: new Set(cols) }; W.homeBox = { x0: f.x0, x1: f.x1, z0: f.zB - .5, z1: f.zF + .2 }; G.initFlat(f); G.setHome(f); vk = '';
    return f;
  }
  function drop() {
    const c = K.cur; if (!c) return; scene.remove(c.mesh, c.roof); c.mesh.geometry.dispose(); c.roof.geometry.dispose(); for (const q of c.cols) W.removeCollider(q);
    G.dropFlat(c.f); G.setHome(null); W.homeBox = null; K.cur = null; vk = '';
  }
  /* mode: 'home' = hierher ziehen, 'back' = zurück ins Haus Sonnenschein */
  K.move = function (mode, x, z) {
    if (G.riding && G.riding()) { say('Zum Umziehen erst aussteigen 🙂', 1800); return false; }
    if (mode === 'back') {
      if (!K.cur) { say('🏢 Du wohnst schon im Haus Sonnenschein', 2200); return false; }
      drop(); save.home = null; persist(); carry(W.spots.flats[G.slot()], true); A.fanfare && A.fanfare(); say('🏢 Zurück im Haus Sonnenschein – deine Fahrzeuge stehen wieder vor der Tür', 3600); return true;
    }
    if (!K.valid(x, z)) { say('Hier ist kein Platz für deine Wohnung 🚫 (frei, weit weg von Straßen und Gebäuden)', 2600); return false; }
    const x0 = x - FW / 2, zF = z - 2.6; drop(); const f = make(x0, zF); save.home = { x0, ZF: zF }; persist(); carry(f, true);
    fx.burst(f.cx, 2, f.zF + 2, 24, [BI.C.gold, BI.C.white, BI.C.pink], 4, 1.2, 28, 4); A.fanfare && A.fanfare(); say('🏡 Umgezogen! Deine Wohnung steht jetzt hier – Limousine, Rutschauto und Hubschrauber sind mitgekommen.', 4200); return true;
  };
  K.load = function () { const h = save.home; if (h && Number.isFinite(h.x0) && Number.isFinite(h.ZF) && Math.abs(h.x0) < 900 && Math.abs(h.ZF) < 900) { const f = make(h.x0, h.ZF); carry(f, false); } };
  return K;
};
