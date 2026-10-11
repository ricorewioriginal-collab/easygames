'use strict';
/* Bunte Insel – Fellretter-Bucht (Erweiterung): Themen-Insel im Süden, über eine Brücke erreichbar.
   Eine Rettungshund-Welt, frei erfunden: eigene Namen, eigene Hunde, Fahrzeuge, Farben und ein eigenes Wappen (keine Figuren, Namen oder Logos aus Fernsehserien).
   Mit Bellwarte (Zentrale mit 7 Hallentoren), Fahrzeug-Platz, Café, Rathaus, Leuchtturm, Strand und der goldenen Jannis-&-Blitz-Statue.
   Alles Statische steckt im EINEN Welt-Mesh; zur Laufzeit nur Schilder, Hunde, Bewohner und die zwei Statuen-Figuren. */
BI.PUPS = { x: -90, z: 275, R: 52, bridge: { x0: -94.5, x1: -85.5, z0: 148, z1: 228 } };
/* Das Fellretter-Team (Reihenfolge = Platz von links nach rechts); Blitz ist Jannis' eigener Hund und fährt den Streifenwagen in der Mitte */
BI.PUP_TEAM = [
  { id: 'rodel', name: 'Rodel', veh: 'snow', col: 0x4fc3f7, fur: 0x9aa5b8, dark: 0xeef3ff, uni: 0x4fc3f7, trim: 0xffffff, hat: 'goggles', lines: ['Brrr! Ich bin Rodel von den Fellrettern. Bei Eis und Schnee bin ich zur Stelle! ❄️', 'Tipp: Dünnes Eis nie betreten – hol lieber einen Erwachsenen!', 'Mein Schneemobil heißt „Eisfuchs“. Drin ist es kein bisschen kalt.'] },
  { id: 'welle', name: 'Welle', veh: 'boat', col: 0x1fb5b5, fur: 0x7a4a2a, dark: 0x4a2c18, uni: 0x1fb5b5, trim: 0xffd23f, hat: 'helmet', lines: ['Wuff! Ich bin Welle. Wo Wasser ist, bin ich dabei! 🌊', 'Merke: Schwimm nur, wenn ein Erwachsener zuschaut.', 'Mein Rettungsboot „Planschi“ fährt durch jede Welle.'] },
  { id: 'sprudel', name: 'Sprudel', veh: 'fire', col: 0xff7a1a, fur: 0xf0d9a8, dark: 0x8a5a33, uni: 0xff7a1a, trim: 0xffe14a, hat: 'helmet', lines: ['Ich bin Sprudel, der Feuerwehrhund! 🚒', 'Streichhölzer sind kein Spielzeug. Feuer ist nur etwas für Erwachsene.', 'Bei Gefahr rufst du die 112 – das merkt sich jeder Fellretter!'] },
  { id: 'blitz', name: 'Blitz', veh: 'police', col: 0x2d6be0, lines: [] },
  { id: 'brumm', name: 'Brumm', veh: 'digger', col: 0x3fa04a, fur: 0xb59a76, dark: 0x5a4a35, uni: 0x3fa04a, trim: 0xffe14a, hat: 'hard', lines: ['Brumm hier! Ich baue und repariere alles. 🚧', 'Wenn etwas kaputt ist, sagen wir: Das kriegen wir hin!', 'Mein Bagger „Schaufel-Susi“ buddelt schneller als jeder Hund.'] },
  { id: 'pia', name: 'Pia', veh: 'plane', col: 0x9b4de0, fur: 0xf4eaff, dark: 0xcdb6f0, uni: 0x9b4de0, trim: 0xffd23f, hat: 'goggles', lines: ['Hallo, ich bin Pia! Ich fliege hoch über die Bucht. ✈️', 'Von oben sieht die Insel aus wie ein Bonbon.', 'Mein Flieger „Wölkchen“ landet auf jeder Wiese.'] },
  { id: 'bella', name: 'Bella', veh: 'ambulance', col: 0xff5a7a, fur: 0xffffff, dark: 0x8a5a33, uni: 0xff5a7a, trim: 0xffffff, hat: 'cap', lines: ['Ich bin Bella, die Sani-Hündin. 🚑', 'Ein Pflaster hilft bei kleinen Wehwehchen – und ein Kuss auch!', 'Wenn sich jemand verletzt hat, hol sofort einen Erwachsenen.'] }
];
const PUP_MORE = {
  rodel: ['Wusstest du? Keine zwei Schneeflocken sind gleich – wie wir Hunde! ❄️', 'Wenn du mit mir spielst, wird mir ganz warm ums Herz. Die beste Heizung der Welt!', 'Ich träume davon, mal im Sommer Schlitten zu fahren. Auf Sand!'],
  welle: ['Ich liebe Bälle! Wirfst du mir einen? 🎾', 'Fische sind meine Freunde – ich rette sie nur, wenn sie sich verirren.', 'Nach jedem Einsatz gibt es bei mir eine Runde Planschen!'],
  sprudel: ['Ich kann mit meinem Schlauch Regenbögen spritzen! 🌈', 'Wenn es brennt: ruhig bleiben und Hilfe rufen. Das schaffst du!', 'Mein Helm glänzt schon wieder. Ich putze ihn jeden Morgen!'],
  brumm: ['Ich zähle gern Schrauben. Gestern waren es 4.711! 🔩', 'Gemeinsam bauen wir sogar eine Sandburg bis zum Mond!', 'Mein Bagger Schaufel-Susi ist ein kleines bisschen eifersüchtig auf Wölkchen.'],
  pia: ['Von oben sieht man alles – sogar, wo dein Teddy liegt! 🧸', 'Wolken sind wie Zuckerwatte, nur ohne Zucker. Ich habe es probiert.', 'Willst du mal mitfliegen? In unserer Fantasie geht alles!'],
  bella: ['Lachen ist die beste Medizin – und Streicheln auch! 💗', 'Ich habe immer einen Verband dabei, falls ein Teddy hinfällt.', 'Trink genug Wasser! Das wünscht dir deine Sani-Hündin.']
};
BI.PUP_TEAM.forEach(q => { if (PUP_MORE[q.id]) q.lines = q.lines.concat(PUP_MORE[q.id]); });
/* Gemeinsame Bildschirm-Styles (Einsatz-Hinweis unten in der Mitte, Hunde-Spielleiste): kollidieren nicht mit den Anzeigen oben */
BI.injectHudCss = function () {
  if (document.getElementById('bi-hud-css')) return; const st = document.createElement('style'); st.id = 'bi-hud-css';
  st.textContent = '.eChip{position:absolute;left:50%;transform:translateX(-50%);bottom:64px;width:min(520px,calc(100% - 440px));display:flex;align-items:center;gap:10px;padding:7px 14px;border-radius:20px;pointer-events:none;font-weight:700;font-size:14px;line-height:1.25;z-index:6}.eChip[hidden]{display:none}'
    + '.pPanel{position:absolute;left:50%;transform:translateX(-50%);bottom:122px;width:min(560px,calc(100% - 24px));padding:10px 10px 10px;border-radius:22px;background:rgba(255,255,255,.93);box-shadow:0 6px 24px rgba(20,50,100,.25);z-index:7;display:flex;flex-direction:column;gap:6px;pointer-events:auto}.pPanel[hidden]{display:none}'
    + '.pT{font-weight:800;text-align:center;color:#16335e;font-size:16px}.pB{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}'
    + '.pB button{display:flex;flex-direction:column;align-items:center;min-width:78px;padding:6px 8px;border-radius:16px;font-weight:800;font-size:13px;background:#fff;color:#16335e;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14);pointer-events:auto}.pB button span{font-size:24px;line-height:1.1}.pX{position:absolute;top:4px;right:10px;font-size:16px;font-weight:800;color:#16335e;pointer-events:auto;background:none}'
    + '@media (orientation:portrait){.eChip{bottom:25vh;width:calc(100% - 24px)}.pPanel{bottom:33vh}}';
  document.head.appendChild(st);
};
BI.PUPS_GOLD = { shirt: 0xffd23f, pants: 0xe6b422, hair: 0xc9951a, skin: 0xffe08a, shoe: 0xc9951a };

/* ---------- Boden, Brücke, Tor, Bellwarte, Fahrzeug-Platz, Häuser, Leuchtturm, Strand (statisch) ---------- */
BI.buildPupsGround = function (c) {
  const { W, st, lamp, ROADY, GRASS, SAND } = c, P = BI.PUPS, TEAM = BI.PUP_TEAM, TAU = Math.PI * 2, WD = 0x8a5a33, CREAM = 0xf6ecd6, CREAM2 = 0xe9dcc0;
  W.pups = P; W.spots.pups = { x: P.x, z: P.z - 40 };
  const X = u => P.x + u, Z = v => P.z + v;
  st.disc(P.x, P.z, P.R + 9, 0, GRASS, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, SAND, 56);
  /* Brücke (entlang z) mit Geländer */
  { const b = P.bridge, L = b.z1 - b.z0, cz = (b.z0 + b.z1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, 0x9a6b3d); for (let z = b.z0 + 1; z < b.z1; z += 2) st.rect(b.x0, z, b.x1, z + .08, ROADY + .01, 0x7a5230);
    for (let z = b.z0 + 2; z < b.z1; z += 6) st.rect(P.x - .12, z, P.x + .12, z + 2.4, ROADY + .015, 0xfff3c0);
    for (const sd of [-1, 1]) { const x = P.x + sd * 4.6; st.box(x, 0, cz, .25, 1.15, L, 0xc8803c); st.box(x, 1.15, cz, .35, .1, L, 0xe3a45a); W.addBox(x - .15, b.z0 + 2, x + .15, b.z1, false, 1.3); }
    for (let z = b.z0 + 4; z < b.z1; z += 10) for (const sd of [-1, 1]) st.cyl(P.x + sd * 3.8, -1.6, z, .45, .5, 1.62, 0x6b4a2a, 8); }
  /* Eingangstor mit Knochen-Zierde (Gruß an die Hundewelt) */
  { const gz = Z(-46); for (const sd of [-1, 1]) { st.box(X(sd * 5.6), 0, gz, .8, 6.2, .8, 0xffffff); st.sph(X(sd * 5.6), 6.6, gz, 1.0, 0xff7a1a, 1); } st.box(P.x, 6.2, gz, 12, .9, .8, 0x2d6be0); st.box(P.x, 7.1, gz, 12, .3, .9, 0xffd23f);
    st.box(P.x, 7.4, gz, 3.6, .5, .5, 0xfff3e0); for (const sx of [-1.8, 1.8]) { st.sph(P.x + sx, 7.65, gz - .25, .45, 0xfff3e0, 1); st.sph(P.x + sx, 7.65, gz + .25, .45, 0xfff3e0, 1); }
    W.addBox(X(-6), gz - .5, X(-5.2), gz + .5, false, 7); W.addBox(X(5.2), gz - .5, X(6), gz + .5, false, 7); W.spots.pupsGate = { x: P.x, y: 9.3, z: gz }; }
  /* Promenade vom Tor zur Statuen-Plaza, Fahrzeug-Platz vor der Bellwarte */
  const tile = (u0, v0, u1, v1) => { for (let i = 0; i < Math.floor((u1 - u0) / 3); i++) for (let j = 0; j < Math.floor((v1 - v0) / 2); j++) st.rect(X(u0 + i * 3), Z(v0 + j * 2), X(u0 + i * 3 + 3), Z(v0 + j * 2 + 2), ROADY + .01, (i + j) % 2 ? CREAM : CREAM2); };
  tile(-3, -45, 3, -19); tile(-18, 1, 18, 15); st.strip(P.x, Z(-3), 6, 6, 0, ROADY + .011, CREAM);
  /* Statuen-Plaza: Scheibe, blau-oranger Ring, Sockel */
  st.disc(X(0), Z(-9), 11, ROADY + .01, CREAM, 36); st.ring(X(0), Z(-9), 8.2, 9.4, ROADY + .02, 0x2d6be0, 36); st.ring(X(0), Z(-9), 9.4, 10.6, ROADY + .02, 0xff7a1a, 36);
  st.cyl(X(0), 0, Z(-9), 2.9, 3.2, 1.0, 0xcfd6e2, 18); st.cyl(X(0), 1.0, Z(-9), 2.5, 2.7, .7, 0xe9eef7, 18); st.cyl(X(0), 1.7, Z(-9), 2.3, 2.3, .22, 0xffd23f, 18); W.addCircle(X(0), Z(-9), 3.3, false, 3); W.spots.pupsStatue = { x: X(0), y: 1.92, z: Z(-9) };
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 11.8; st.sph(X(Math.sin(a) * r), .35, Z(-9 + Math.cos(a) * r), .35, [0xff5a8a, 0xffe14a, 0xffffff, 0xb36bff][i % 4], 1); }
  /* Bellwarte: Halle mit sieben Toren + Turm mit Aussichtsring */
  { const hz = 18; st.box(X(0), 0, Z(hz), 34, 5.4, 8, 0xf4efe6); st.box(X(0), 5.4, Z(hz), 35, .6, 9, 0x3a4a6a); st.box(X(0), 6.0, Z(hz - 4.3), 35, .3, .5, 0xff7a1a);
    TEAM.forEach((q, i) => { const x = (i - 3) * 4.4; st.box(X(x), 0, Z(hz - 4.05), 3.5, 4.0, .2, q.col); for (let k = 0; k < 4; k++) st.box(X(x), .5 + k * .9, Z(hz - 4.17), 3.5, .1, .06, 0xffffff); st.box(X(x), 4.2, Z(hz - 4.1), 3.8, .3, .3, 0xffffff); });
    W.addBox(X(-17.5), Z(hz - 4.2), X(17.5), Z(hz + 4.2), false, 7);
    const tz = 24; st.cyl(X(0), 0, Z(tz), 5.6, 6.4, 20, 0xffffff, 14); for (const [y, col] of [[4, 0x2d6be0], [10, 0xff7a1a], [16, 0x2d6be0]]) st.cyl(X(0), y, Z(tz), 5.65, 5.65, 1.4, col, 14);
    st.cyl(X(0), 20, Z(tz), 7.4, 7.4, .7, 0x3a4a6a, 14); st.cyl(X(0), 20.7, Z(tz), 5.8, 5.8, 3.4, 0xbfe6ff, 14); st.cyl(X(0), 24.1, Z(tz), 7.2, 7.2, .5, 0x3a4a6a, 14); st.cone(X(0), 24.6, Z(tz), 6.8, 3.6, 0xff7a1a, 14);
    st.cyl(X(0), 28.2, Z(tz), .15, .15, 5.5, 0xdddddd, 6); st.sph(X(0), 33.9, Z(tz), .5, 0xffd23f, 1); st.cyl(X(0), 12.5, Z(tz - 5.7), 2.2, 2.2, .3, 0xbfe6ff, 18, Math.PI / 2); st.sph(X(0), 21.4, Z(tz - 6.1), .6, 0xffd23f, 1);
    W.addCircle(X(0), Z(tz), 6.6, false, 30); W.spots.pupsTower = { x: X(0), y: 36, z: Z(tz) }; }
  /* Fahrzeuge parken vor den Toren (Nase zur Plaza); Position pro Team-Platz */
  const V = (cx, cz) => ({ box: (x, y, z, w, h, d, col, ry = 0, rx = 0, rz = 0) => st.box(cx - x, y, cz - z, w, h, d, col, ry + Math.PI, rx, rz), cyl: (x, y, z, rt, rb, h, col, seg = 8, rx = 0, ry = 0, rz = 0) => st.cyl(cx - x, y, cz - z, rt, rb, h, col, seg, rx, ry + Math.PI, rz), sph: (x, y, z, r, col, det = 1, sx = 1, sy = 1, sz = 1) => st.sph(cx - x, y, cz - z, r, col, det, sx, sy, sz), cone: (x, y, z, r, h, col, seg = 6) => st.cone(cx - x, y, cz - z, r, h, col, seg) });
  const wheels = (o, zs, w, r, col) => { for (const z of zs) for (const sd of [-1, 1]) o.cyl(sd * w, r - .2, z, r, r, .4, col || 0x1b1b22, 10, 0, 0, Math.PI / 2); };
  const car = (o, col, len, h) => { o.box(0, .45, 0, 2.1, .6, len, col); o.box(0, 1.05, -len * .12, 1.9, h, len * .5, col); o.box(0, 1.2, len * .14, 1.84, h * .55, .08, 0xbfe6ff, 0, -.35); o.box(0, .45, len / 2, 2.0, .35, .15, 0xdddddd); wheels(o, [len * .32, -len * .32], 1.05, .5); };
  const VEH = {
    police: o => { car(o, 0xffffff, 4.2, .75); o.box(0, .8, 0, 2.12, .28, 4.0, 0x2d6be0); o.box(-.4, 1.85, -.4, .6, .22, .5, 0x2d6be0); o.box(.4, 1.85, -.4, .6, .22, .5, 0xe0382b); },
    fire: o => { car(o, 0xff7a1a, 5.2, .9); o.box(0, 1.1, -1.4, 2.1, 1.1, 2.4, 0xff7a1a); o.box(0, 2.2, -1.2, .5, .12, 3.4, 0xdddddd); o.box(0, 1.5, -2.6, 1.0, 1.0, .5, 0xe0382b); o.cyl(0, 1.2, -2.7, .55, .55, .3, 0x555a66, 10, Math.PI / 2); wheels(o, [-1.9], 1.05, .5); },
    digger: o => { for (const sd of [-1, 1]) o.box(sd * 1.0, .1, 0, .7, .8, 3.4, 0x2a2a33); o.box(0, .6, 0, 2.0, .7, 2.8, 0x3fa04a); o.box(0, 1.3, -.4, 1.5, 1.2, 1.5, 0x3fa04a); o.box(0, 1.9, .1, 1.4, .7, .06, 0xbfe6ff); o.box(0, 1.1, 1.8, .4, .4, 2.4, 0xffe14a, 0, .5); o.box(0, .2, 3.1, 1.2, .8, .9, 0xffe14a, 0, -.4); },
    plane: o => { o.box(0, .9, 0, 1.2, 1.2, 4.4, 0x9b4de0); o.cone(0, .9, 2.4, .5, 1.1, 0x9b4de0, 8); o.box(0, 1.3, -.3, 6.4, .12, 1.4, 0xffffff); o.box(0, 1.2, -2.3, 2.2, .1, .8, 0xffffff); o.box(0, 1.2, -2.3, .1, 1.2, .8, 0xffd23f); o.box(0, 1.9, .5, .9, .5, 1.0, 0xbfe6ff); o.box(0, 1.0, 2.9, .2, 1.6, .1, 0xdddddd); o.box(0, 1.0, 2.9, 1.6, .2, .1, 0xdddddd); wheels(o, [.9, -.9], .9, .35); },
    ambulance: o => { car(o, 0xffffff, 4.6, 1.2); o.box(0, 1.05, -1.2, 2.1, 1.3, 2.4, 0xffffff); o.box(1.06, 1.5, -1.2, .05, .9, .3, 0xff5a7a); o.box(1.06, 1.5, -1.2, .05, .3, .9, 0xff5a7a); o.box(-1.06, 1.5, -1.2, .05, .9, .3, 0xff5a7a); o.box(-1.06, 1.5, -1.2, .05, .3, .9, 0xff5a7a); o.box(0, 2.3, -.4, .9, .2, .4, 0xff5a7a); },
    boat: o => { o.box(0, .55, 0, 1.9, .7, 3.6, 0x1fb5b5); o.cone(0, .55, 2.2, 1.05, 1.0, 0x1fb5b5, 4); o.box(0, 1.2, .2, 1.5, .7, 1.2, 0xffffff); o.box(0, 1.8, .2, .12, 1.4, .12, 0xdddddd); o.box(.4, 2.5, .2, .8, .5, .05, 0xffd23f); o.box(0, .3, -.6, 2.3, .25, 3.8, 0x2a2f3a); wheels(o, [-1.0], 1.15, .45); },
    snow: o => { for (const sd of [-1, 1]) o.box(sd * .9, .15, .3, .3, .12, 3.6, 0xeef3ff, 0, .15); o.box(0, .45, -.2, 1.6, .8, 2.8, 0x4fc3f7); o.box(0, .95, 1.0, 1.2, .5, .06, 0xbfe6ff, 0, -.5); o.box(0, 1.0, -1.0, 1.2, .3, 1.4, 0x2a2f3a); o.box(0, .3, -1.7, 1.6, .5, .8, 0x2a2a33); o.box(0, 1.2, .6, 1.2, .1, .1, 0xdddddd); }
  };
  TEAM.forEach((q, i) => { const x = (i - 3) * 4.4; VEH[q.veh](V(X(x), Z(9.5))); });
  /* Einsatz-Tafel (Bild kommt zur Laufzeit aus einsatz.js): Pfosten, Rückwand, Blinklicht */
  { const bx = X(-10), bz = Z(1.3); for (const sd of [-1, 1]) st.box(bx + sd * 2.6, 0, bz, .3, 1.6, .3, 0x555a66); st.box(bx, 1.5, bz, 6.2, 4.7, .3, 0x14305f); st.box(bx, 6.2, bz, 6.6, .3, .6, 0xffd23f); lamp.sph(bx, 6.9, bz, .4, 0xff3b3b, 1);
    W.addBox(X(-13.2), Z(1.0), X(-6.8), Z(1.6), false, 6); W.spots.pupsBoard = { x: bx, z: Z(-1.6) }; }
  /* Lampen entlang Promenade und Fahrzeug-Platz */
  for (let v = -42; v <= -22; v += 10) for (const sd of [-1, 1]) { st.cyl(X(sd * 4.2), 0, Z(v), .08, .1, 4.2, 0x555a66, 6); lamp.sph(X(sd * 4.2), 4.4, Z(v), .34, [0xff7a1a, 0x2d6be0][(sd + 1) >> 1], 1); }
  for (const u of [-18, 18]) { st.cyl(X(u), 0, Z(3), .08, .1, 4.2, 0x555a66, 6); lamp.sph(X(u), 4.4, Z(3), .34, 0xffd23f, 1); }
  /* Café (Osten), Rathaus mit Uhrenturm (Westen), kleine Häuser */
  { const hx = 27, hz = -12; st.box(X(hx), 0, Z(hz), 10, 4.6, 7.4, 0xffe9a8); st.cyl(X(hx), 4.6, Z(hz), 0, 7.4, 2.8, 0xff7a1a, 4, 0, Math.PI / 4, 0); for (let k = 0; k < 10; k++) st.box(X(hx - 4.5 + k), 3.2, Z(hz - 4.3), 1.0, .12, 1.5, k % 2 ? 0xffffff : 0xff7a1a, 0, .35);
    st.box(X(hx), 0, Z(hz - 3.72), 1.4, 2.5, .16, WD); for (const sx of [-3.2, 3.2]) st.box(X(hx + sx), 1.0, Z(hz - 3.72), 1.8, 1.4, .14, 0xbfe6ff); for (const [tx, tz] of [[-3, -7.4], [0, -8.4], [3, -7.4]]) { st.cyl(X(hx + tx), 0, Z(hz + tz), .7, .7, .08, 0xffffff, 10); st.cyl(X(hx + tx), 0, Z(hz + tz), .08, .08, .8, 0x555a66, 6); st.cyl(X(hx + tx), .8, Z(hz + tz), 0, 1.5, .5, [0xff5a8a, 0x4da3ff, 0xffe14a][(tx + 3) / 3], 8); }
    W.addBox(X(hx - 5), Z(hz - 3.7), X(hx + 5), Z(hz + 3.7), false, 8); W.spots.pupsCafe = { x: X(hx), z: Z(hz - 6) }; }
  { const hx = -27, hz = -12; st.box(X(hx), 0, Z(hz), 10, 5.4, 7.4, 0xc7e0ff); st.box(X(hx), 5.4, Z(hz), 10.8, .5, 8.2, 0x3a4a6a); st.box(X(hx), 5.9, Z(hz + 1.5), 3.2, 8.5, 3.2, 0xc7e0ff); st.cone(X(hx), 14.4, Z(hz + 1.5), 2.6, 2.6, 0xff7a1a, 4); st.cyl(X(hx), 10.2, Z(hz - .15), 1.3, 1.3, .2, 0xffffff, 18, Math.PI / 2); st.box(X(hx), 10.1, Z(hz - .3), .1, .9, .08, 0x2a2a33); st.box(X(hx), 10.2, Z(hz - .3), .7, .1, .08, 0x2a2a33);
    st.box(X(hx), 0, Z(hz - 3.72), 1.6, 2.8, .16, WD); for (const sx of [-3.2, 3.2]) st.box(X(hx + sx), 1.5, Z(hz - 3.72), 1.6, 1.8, .14, 0xbfe6ff); st.cyl(X(hx + 5.8), 0, Z(hz - 4), .08, .1, 7, 0xdddddd, 6); for (let k = 0; k < 2; k++) st.box(X(hx + 6.5), 6.4 - k * .4, Z(hz - 4), .9, .4, .05, k ? 0xffffff : 0x2d6be0);
    W.addBox(X(hx - 5.4), Z(hz - 3.7), X(hx + 5.4), Z(hz + 3.7), false, 8); W.spots.pupsHall = { x: X(hx), z: Z(hz - 6) }; }
  { const COT = [[-34, 8, 0xffd0e0, 0xff5a8a], [34, 8, 0xc9f0d6, 0x4cd07d], [-33, -26, 0xfff1a8, 0xff9a2e], [-8, -30, 0xe3d0ff, 0x9b4de0]]; COT.forEach(([hx, hz, wall, roof]) => { st.box(X(hx), 0, Z(hz), 6, 3.6, 5, wall); st.cyl(X(hx), 3.6, Z(hz), 0, 4.6, 2.4, roof, 4, 0, Math.PI / 4, 0); st.box(X(hx), 0, Z(hz - 2.55), 1.1, 2.1, .14, WD); st.box(X(hx - 1.9), 1.2, Z(hz - 2.55), 1.0, 1.0, .12, 0xbfe6ff); W.addBox(X(hx - 3), Z(hz - 2.5), X(hx + 3), Z(hz + 2.5), false, 6); }); }
  /* Leuchtturm im Nordosten (rot-weiß) */
  { const lx = 34, lz = -34; for (let k = 0; k < 4; k++) st.cyl(X(lx), k * 4.6, Z(lz), 3 - k * .25, 3.25 - k * .25, 4.6, k % 2 ? 0xffffff : 0xe0382b, 12); st.cyl(X(lx), 18.4, Z(lz), 3.4, 3.4, .5, 0x3a4a6a, 12); st.cyl(X(lx), 18.9, Z(lz), 1.7, 1.7, 2.2, 0xbfe6ff, 10); lamp.sph(X(lx), 20, Z(lz), .9, 0xffe14a, 1); st.cone(X(lx), 21.1, Z(lz), 2.2, 1.6, 0xe0382b, 10); W.addCircle(X(lx), Z(lz), 3.4, false, 20); W.spots.pupsLight = { x: X(lx), z: Z(lz) }; }
  /* Strand: Palmen, Sonnenschirme, Handtücher am Sandring; bunte Laubbäume */
  const rn = BI.rng(2024), PARA = [0xff5a8a, 0xffe14a, 0x4da3ff, 0x4cd07d, 0xff9a2e];
  for (let i = 0; i < 16; i++) { const an = rn() * TAU, d = 41 + rn() * 4, x = Math.sin(an) * d, z = Math.cos(an) * d; if (Math.abs(x) < 7 && z < -30) continue; if (x > 30 && z < -26) continue;
    st.cyl(X(x), 0, Z(z), .22, .32, 4.2, 0x9a6b3d, 6); for (let k = 0; k < 5; k++) st.box(X(x + Math.sin(k * 1.26) * 1.2), 4.1, Z(z + Math.cos(k * 1.26) * 1.2), 2.6, .12, .6, 0x3fae4a, k * 1.26, 0, .35); W.addCircle(X(x), Z(z), .45, false, 4); }
  for (let i = 0; i < 9; i++) { const an = TAU * (i / 9) + .2, d = 38 + rn() * 3, x = Math.sin(an) * d, z = Math.cos(an) * d; if (z < -22) continue; st.cyl(X(x), 0, Z(z), .06, .06, 2.2, 0xeeeeee, 5); st.cone(X(x), 1.8, Z(z), 1.5, .7, PARA[i % 5], 8); st.box(X(x + 1.4), .03, Z(z + .6), 1.2, .05, .7, PARA[(i + 2) % 5]); }
  for (let i = 0; i < 14; i++) { const an = rn() * TAU, d = 20 + rn() * 16, x = Math.sin(an) * d, z = Math.cos(an) * d; if (Math.abs(x) < 9 && z < 17) continue; if (Math.hypot(x - 27, z + 12) < 9 || Math.hypot(x + 27, z + 12) < 9 || Math.hypot(x - 34, z + 34) < 6 || Math.hypot(x - 34, z - 8) < 6 || Math.hypot(x + 34, z - 8) < 6 || Math.hypot(x + 33, z + 26) < 6 || Math.hypot(x + 8, z + 30) < 6 || z > 28 && Math.abs(x) < 20) continue;
    st.cyl(X(x), 0, Z(z), .2, .3, 2, WD, 6); st.sph(X(x), 3.2, Z(z), 1.6, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(X(x), Z(z), .5, false, 3); }
};

/* ---------- Laufzeit: Schilder, Fellretter, Bewohner, goldene Statue ---------- */
BI.createPups = function (G) {
  const { scene, W, A, fx, P, say } = G, K = {}, PU = BI.PUPS, TEAM = BI.PUP_TEAM, GOLD = BI.PUPS_GOLD;
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 56; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#16335e'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.pupsGate; if (g) sign('🐾 Willkommen in der Fellretter-Bucht!', g.x, g.y, g.z, 11); const t = W.spots.pupsTower; if (t) sign('🔔 Bellwarte', t.x, t.y, t.z - 3, 7); const s = W.spots.pupsStatue; if (s) sign('🏆 Jannis & Blitz – die ersten Fellretter', s.x, s.y + 6.6, s.z, 9);
    const c = W.spots.pupsCafe; if (c) sign('☕ Sonnen-Café', c.x, 6.4, c.z + 1.5, 5); const h = W.spots.pupsHall; if (h) sign('🏛️ Rathaus', h.x, 7.4, h.z + 1.5, 5); const l = W.spots.pupsLight; if (l) sign('💡 Leuchtturm', l.x, 24, l.z, 5);
    sign('👮 Blitz\' Platz', PU.x, 4.2, PU.z + 9.5 - 3.6, 4); }
  /* Goldene Statue: Jannis (Arme hoch) und Blitz (sitzt) auf dem Sockel */
  { const s = W.spots.pupsStatue, L = G.look ? G.look() : {}; const hero = BI.makeChar(Object.assign({}, GOLD, { style: L.style, hat: L.hat && L.hat !== 'none' ? L.hat : 'cap', scale: 1.9, mouth: 'smile' })); hero.dance(0, 0); hero.group.position.set(s.x - .9, s.y, s.z); hero.group.rotation.y = Math.PI; scene.add(hero.group);
    const dog = BI.makeDog({ fur: 0xe6b422, dark: 0xc9951a, uni: 0xffd23f, trim: 0xfff3a0, noName: true }); dog.group.scale.setScalar(1.9); dog.trick('sit', .5); dog.group.position.set(s.x + 1.3, s.y, s.z + .3); dog.group.rotation.y = Math.PI * .85; scene.add(dog.group); }
  /* ===== Mit den Hunden spielen: Reden, Pfötchen, Ball holen, Leckerli, Rolle, Salto ===== */
  BI.injectHudCss(); K.pups = [];
  const host = (document.getElementById('mission') || {}).parentNode || document.body, panel = document.createElement('div'); panel.className = 'pPanel'; panel.hidden = true; panel.innerHTML = '<div class="pT"></div><div class="pB"></div>';
  const OPT = [['talk', '💬', 'Reden'], ['paw', '🐾', 'Pfötchen'], ['ball', '🎾', 'Ball holen'], ['treat', '🦴', 'Leckerli'], ['roll', '🔄', 'Rolle'], ['flip', '🤸', 'Salto']];
  for (const [k, ic, tx] of OPT) { const b = document.createElement('button'); b.innerHTML = '<span>' + ic + '</span>' + tx; b.addEventListener('click', e => { e.stopPropagation(); choose(k); }); panel.querySelector('.pB').appendChild(b); }
  { const x = document.createElement('button'); x.className = 'pX'; x.textContent = '✖'; x.addEventListener('click', e => { e.stopPropagation(); closePanel(); }); panel.appendChild(x); } host.appendChild(panel);
  let pi = -1, cur = null, lastTreat = -1e9, lastFetch = -1e9; const ball = new THREE.Mesh(new THREE.SphereGeometry(.24, 10, 8), new THREE.MeshLambertMaterial({ color: 0xffd23f })); ball.visible = false; scene.add(ball);
  const openPanel = i => { pi = i; panel.querySelector('.pT').textContent = '🐾 ' + K.pups[i].name + ' – was wollen wir machen?'; panel.hidden = false; };
  const closePanel = () => { pi = -1; panel.hidden = true; };
  const dist = (p, x, z) => Math.hypot(p.n.x - x, p.n.z - z), face = (p, x, z) => { const h = Math.atan2(x - p.n.x, z - p.n.z); p.n.h = h; p.d.group.rotation.y = h; };
  const place = (p, x, z) => { p.n.x = x; p.n.z = z; p.d.group.position.x = x; p.d.group.position.z = z; };
  const bark = (p, txt) => say('🐾 ' + p.name + ': „' + txt + '“', 3200);
  function choose(k) {
    const p = K.pups[pi]; if (!p) return; closePanel(); if (k === 'talk') { if (G.talk) G.talk(p.n); return; }
    if (cur) { say('🐾 ' + p.name + ' ist noch beschäftigt – gleich wieder!', 1800); return; }
    const now = performance.now(), TR = { paw: ['paw', 1.7, 'Pfötchen! Wuff!'], roll: ['roll', 1.2, 'Rolle, Rolle, Rolle!'], flip: ['flip', 1.1, 'Ta-daa! Salto!'], treat: ['beg', 1.8, 'Mmmh, lecker! Danke dir!'] };
    if (k === 'treat' && now - lastTreat > 40000) { lastTreat = now; G.addStars(1); say('🦴 +1 ⭐ fürs Verwöhnen!', 1600); }
    if (TR[k]) { const t = TR[k]; cur = { p, mode: 'trick', name: t[0], t: 0, dur: t[1] }; bark(p, t[2]); fx.burst(p.n.x, 1.8, p.n.z, 8, [BI.C.pink, BI.C.white], 3, 1, 26, 3); return; }
    if (k === 'ball') { const f = [Math.sin(P.h), Math.cos(P.h)], q = W.resolve(P.x + f[0] * 7, P.z + f[1] * 7, .5, {}); cur = { p, mode: 'fly', t: 0, sx: P.x, sz: P.z, ex: q.x, ez: q.z }; ball.visible = true; ball.position.set(P.x, 1.4, P.z); bark(p, 'Wirf! Wirf! Ich hol ihn!'); snd('whoosh'); }
  }
  const snd = n => { try { A[n] && A[n](); } catch (e) { } };
  K.dbg = () => ({ cur: cur && cur.mode, ball: ball.visible && [ball.position.x, ball.position.z] });
  K.update = function (dt, t) {
    if (pi >= 0 && Math.hypot(P.x - K.pups[pi].n.x, P.z - K.pups[pi].n.z) > 6.5) closePanel();
    if (cur) { const c = cur, p = c.p, d = p.d; c.t += dt;
      if (c.mode === 'trick') { d.trick(c.name, Math.min(1, c.t / c.dur)); if (c.t >= c.dur) { d.reset(); cur = null; } }
      else if (c.mode === 'fly') { const k = Math.min(1, c.t / .9); ball.position.set(c.sx + (c.ex - c.sx) * k, 1.4 + Math.sin(k * Math.PI) * 2.6 - k * 1.1, c.sz + (c.ez - c.sz) * k); if (k >= 1) { c.mode = 'chase'; c.t = 0; } }
      else if (c.mode === 'chase') { const dx = ball.position.x - p.n.x, dz = ball.position.z - p.n.z, dd = Math.hypot(dx, dz); if (dd < .8) { c.mode = 'carry'; c.t = 0; snd('ding'); } else { face(p, ball.position.x, ball.position.z); place(p, p.n.x + dx / dd * 7 * dt, p.n.z + dz / dd * 7 * dt); d.pose(t * 14, .8, false); } }
      else if (c.mode === 'carry') { const dx = P.x - p.n.x, dz = P.z - p.n.z, dd = Math.hypot(dx, dz); ball.position.set(p.n.x + Math.sin(p.n.h) * 1.2, .75, p.n.z + Math.cos(p.n.h) * 1.2);
        if (dd < 1.7) { c.mode = 'drop'; c.t = 0; ball.position.set(p.n.x + Math.sin(p.n.h) * 1.4, .24, p.n.z + Math.cos(p.n.h) * 1.4); bark(p, 'Hier, dein Ball! Nochmal?'); const now = performance.now(); if (now - lastFetch > 12000) { lastFetch = now; G.addStars(1); say('🎾 +1 ⭐ fürs Spielen!', 1600); } fx.burst(p.n.x, 1.8, p.n.z, 10, [BI.C.gold, BI.C.white], 3, 1, 26, 3); }
        else { face(p, P.x, P.z); place(p, p.n.x + dx / dd * 6.5 * dt, p.n.z + dz / dd * 6.5 * dt); d.pose(t * 14, .8, false); } }
      else if (c.mode === 'drop') { d.trick('sit', Math.min(1, c.t / 1.4)); if (c.t > 1.4) { d.reset(); ball.visible = false; cur = null; } } }
    /* Hunde, die beim Spielen weggelaufen sind, gehen gemütlich zurück zu ihrem Fahrzeug */
    for (const p of K.pups) { if (cur && cur.p === p) continue; const dx = p.home.x - p.n.x, dz = p.home.z - p.n.z, dd = Math.hypot(dx, dz); if (dd > .15) { face(p, p.home.x, p.home.z); place(p, p.n.x + dx / dd * Math.min(dd, 3.2 * dt), p.n.z + dz / dd * Math.min(dd, 3.2 * dt)); p.d.pose(t * 10, .7, false); } else if (dd > 0) { place(p, p.home.x, p.home.z); p.n.h = p.n.h0; } }
  };
  /* Fellretter-Hunde: stehen bei ihren Fahrzeugen, erzählen, wedeln und spielen mit dir */
  K.people = function (folk) {
    const mk = (c, x, z, h, name, lines, kid) => { c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!kid, fixed: true }; folk.push(n); return n; };
    TEAM.forEach((q, i) => { if (!q.lines.length) return; const d = BI.makeDog({ name: q.name, fur: q.fur, dark: q.dark, uni: q.uni, trim: q.trim, hat: q.hat }); d.group.scale.setScalar(1.45); const hx = PU.x + (i - 3) * 4.4 + 1.6, hz = PU.z + 5.2, n = mk(d, hx, hz, Math.PI, 'Fellretter ' + q.name, q.lines, false); K.pups.push({ id: q.id, name: q.name, n, d, home: { x: hx, z: hz } }); });
    const SK = [0xffd2a8, 0xe0a979, 0x8d5a3b, 0xf3c9a0, 0xc68a5a], cit = [
      ['Bürgermeister Bommel', 'Willkommen in der Fellretter-Bucht! Bei uns passen alle auf alle auf. 🏛️', 'Die Fellretter sind unsere Helden – aber jeder kann ein Held sein: einfach freundlich helfen!', [-27, -3], { shirt: 0x2d6be0, pants: 0x3d4a7a, hair: 0xdddddd, skin: SK[3], hat: 'cap', style: 'short', wrink: 1, scale: .98 }],
      ['Tante Tilda', 'Mein Café hat den besten Hundekuchen der Bucht – natürlich nur für Hunde! 🍪', 'Für Kinder gibt es Kakao mit Sahne. Und Sterne? Die gibt es gratis, wenn du nett bist!', [27, -4], { shirt: 0xff7a1a, pants: 0x7a3d6a, hair: 0xa14a2b, skin: SK[1], hat: 'chef', style: 'bun', dress: true, scale: .96 }],
      ['Käpt\'n Karla', 'Vom Leuchtturm sehe ich jedes Boot. Das ist sicher! ⛵', 'Zieh immer eine Schwimmweste an, wenn du aufs Wasser gehst.', [31, -29], { shirt: 0xffffff, pants: 0x16335e, hair: 0x6b4423, skin: SK[2], hat: 'cap', style: 'ponytail', scale: .97 }],
      ['Mechaniker Max', 'Ich putze die Fahrzeuge jeden Morgen, bis sie blitzen! ✨', 'Der Bagger quietscht ein bisschen. Brumm sagt, das ist sein Lied.', [-22, 12], { shirt: 0x3fa04a, pants: 0x5a3d2b, hair: 0x222222, skin: SK[4], hat: 'cap', style: 'curly', scale: 1.0 }],
      ['Lotta', 'Wenn ich groß bin, werde ich Fellretterin! 🐶', 'Ich habe schon eine Hundeleine. Ich übe mit meinem Kuscheltier.', [6, -26], { shirt: 0xff5a8a, pants: 0x7a5ce0, hair: 0xd9a441, skin: SK[0], hat: 'none', style: 'pig', dress: true, scale: .62 }],
      ['Ole', 'Ich habe ein Foto mit der goldenen Statue gemacht! 📸', 'Jannis und Blitz sitzen da oben ganz still. Ob die abends tanzen?', [-6, -22], { shirt: 0x4da3ff, pants: 0x23262d, hair: 0x6b4423, skin: SK[2], hat: 'party', style: 'spiky', scale: .64 }]
    ];
    cit.forEach(([name, a, b, [dx, dz], look]) => { const c = BI.makeChar(look); mk(c, PU.x + dx, PU.z + dz, Math.atan2(-dx, 30 - dz), name, [a, b, 'Ich wohne gern hier!'], look.scale < .8); });
  };
  /* Statue bewundern: Konfetti, Spruch, +1 ⭐ alle 60 s */
  let last = -1e9; const COLS = [[1, .82, .2], [.35, .7, 1], [1, .6, .2], [1, 1, 1]];
  K.near = function () { if (P.veh || P.y > 1.5) return null; for (let i = 0; i < K.pups.length; i++) { const p = K.pups[i]; if (p.n.c.group.visible && Math.hypot(P.x - p.n.x, P.z - p.n.z) < 2.7) return { k: 'pup', i }; } const s = W.spots.pupsStatue; if (!s) return null; return Math.hypot(P.x - s.x, P.z - s.z) < 5.4 ? { k: 'statue' } : null; };
  K.act = function (n) { if (n && n.k === 'pup') { if (pi === n.i) closePanel(); else openPanel(n.i); return; } if (!n || n.k !== 'statue') return; const s = W.spots.pupsStatue, now = performance.now(); fx.burst(s.x, s.y + 3.4, s.z, 26, COLS, 4, 1.4, 28, 3); A.fanfare && A.fanfare(); say('🏆 Jannis & Blitz – die ersten Fellretter! Gemeinsam sind wir stark.', 4200); if (now - last > 60000) { last = now; G.addStars(1); say('🏆 +1 ⭐ fürs Bewundern!', 1800); } };
  return K;
};
