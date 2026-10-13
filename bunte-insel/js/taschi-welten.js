'use strict';
/* Bunte Insel – Taschi-System für ALLE Welten 🔴🌍: auf jeder Insel liegen Fanggras-Flecken (Zonen), in denen Taschis dieser Welt erscheinen (BI.TWILDW, siehe taschi-data.js).
   Zonen werden nach dem Bau aller Inseln auf freien, flachen Stellen ausgewürfelt (nicht auf Straßen/Häusern). BI.TZONES wird von taschi-game.js gelesen. */
BI.TZONES = [];
BI.buildTaschiZones = function (c) {
  const { W, scene } = c, st = new BI.Batch(), ROADY = .06, rn = BI.rng(909), TAU = Math.PI * 2; BI.TZONES.length = 0;
  const ISL = { INSEL: { x: 0, z: 0, R: 150, min: 60 }, CITY: BI.CITY, PARK: BI.PARK, RAINBOW: BI.RAINBOW, PUPS: BI.PUPS, DAMPF: BI.DAMPF, DRACHEN: BI.DRACHEN, BAULAND: BI.BAULAND, FUSSBALL: BI.FUSSBALL, MAERCHEN: BI.MAERCHEN, SCHLUESSEL: BI.SCHLUESSEL, SCHWAMM: BI.SCHWAMM, RAETSEL: BI.RAETSEL, ZOTIK: BI.ZOTIK, RADIO: BI.RADIO, ATLANTIS: BI.ATLANTIS, WUNSCH: BI.WUNSCH };
  const okAt = (x, z, rr) => { rr = rr || 6.5; if (W.groundY(x, z) > .25 || W.onRoad(x, z) || !W.free(x, z, 2.5)) return false; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, px = x + Math.sin(a) * rr, pz = z + Math.cos(a) * rr; if (!W.free(px, pz, 1) || W.groundY(px, pz) > .6) return false; } return true; };
  for (const [key, O] of Object.entries(ISL)) {
    if (!O || O.x == null) continue; const want = key === 'INSEL' ? 4 : 2, col = BI.TWORLDS[key][2]; let n = 0;
    for (let t = 0; t < 600 && n < want; t++) {
      const a = rn() * TAU, d = (O.min || 12) + Math.sqrt(rn()) * ((O.R || 60) * (key === 'INSEL' ? .78 : .72) - (O.min || 12)), x = O.x + Math.sin(a) * d, z = O.z + Math.cos(a) * d;
      if (!okAt(x, z, t > 300 ? 3 : 6.5) || BI.TZONES.some(q => Math.hypot(q.x - x, q.z - z) < 22)) continue;
      const Z = { id: key + n, x, z, r: 7.5, world: key, n: BI.TWORLDS[key][0] + ' – Fanggras' }; BI.TZONES.push(Z); n++;
      if (key === 'ATLANTIS') continue; /* unter der Erde: eigene Optik, hier nur die Zone */
      st.disc(x, z, Z.r, ROADY + .014, col, 28);
      for (let i = 0; i < 46; i++) { const g = rn() * TAU, dd = Math.sqrt(rn()) * (Z.r - .5), h = .7 + rn() * .6; st.cone(x + Math.sin(g) * dd, 0, z + Math.cos(g) * dd, .2, h, [0x2f9a3f, 0x3fb04a, 0x58c050][i % 3], 4); }
    }
  }
  const m = st.mesh(BI.mat()); scene.add(m); BI.TZONES.mesh = m; /* Taschis aus (Einstellungen): Fanggras außerhalb von Taschi-Land wird ausgeblendet */
};