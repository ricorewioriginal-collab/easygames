'use strict';
/* Bunte Insel – Bauen wie bei den Sims (alles gratis): Raster 4 m, Boden/Wände/Türen/Fenster/Dach, Möbel, Garten & Spaß.
   Auf den Boden tippen setzt den Cursor, "Bauen" setzt das Teil (am selben Platz erneut = umfärben/ersetzen). Alles wird gespeichert. */
BI.createBuild = function (G) {
  const { scene, W, A, fx } = G, CELL = 4, MAXP = 500, TAU = BI.TAU;
  const PAL = [0xff6b6b, 0x4da3ff, 0xffd23f, 0x6bd67e, 0xb36bff, 0xff9ad5, 0xffffff, 0xc8a27a], GLASS = 0xa8dcff, WOOD = 0x8a5a33, DARK = 0x2b2f3a;
  const shade = (c, k) => { const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); };
  /* Katalog: draw(b, c) zeichnet lokal um die Zellmitte; cols = Kollisionsboxen (lokal), circ = Kreise (lokal); slot = belegte Ebene */
  const CAT = {
    floor:  { icon: '🟫', name: 'Boden', tab: 0, slot: 'floor', c: 7, draw(b, c) { b.box(0, 0, 0, 4, .16, 4, c); b.box(0, .16, 0, 3.7, .02, 3.7, shade(c, 1.1)); } },
    disco:  { icon: '🪩', name: 'Disko', tab: 0, slot: 'floor', c: 0, draw(b) { b.box(0, 0, 0, 4, .16, 4, 0x2a2540); [[-1, -1, 0xff4fa0], [1, -1, 0x4dd0ff], [-1, 1, 0xffd23f], [1, 1, 0x6bff8a]].forEach(q => b.box(q[0], .16, q[1], 1.8, .03, 1.8, q[2])); } },
    wall:   { icon: '🧱', name: 'Wand', tab: 0, edge: true, c: 6, draw(b, c) { b.box(0, 0, -2, 4.2, 3, .4, c); b.box(0, 0, -2, 4.3, .25, .5, shade(c, .8)); b.box(0, 2.85, -2, 4.3, .15, .5, shade(c, .75)); }, cols: [[-2.1, -2.2, 2.1, -1.8, 3]] },
    door:   { icon: '🚪', name: 'Tür', tab: 0, edge: true, c: 6, draw(b, c) { b.box(-1.5, 0, -2, 1.2, 3, .4, c); b.box(1.5, 0, -2, 1.2, 3, .4, c); b.box(0, 2.2, -2, 1.8, .8, .4, c); b.box(-.95, 0, -2, .12, 2.2, .5, WOOD); b.box(.95, 0, -2, .12, 2.2, .5, WOOD); b.box(0, 2.1, -2, 2.0, .12, .5, WOOD); b.box(0, 0, -2, 1.8, .03, .45, 0xcfc7b8); }, cols: [[-2.1, -2.2, -.9, -1.8, 3], [.9, -2.2, 2.1, -1.8, 3]] },
    window: { icon: '🪟', name: 'Fenster', tab: 0, edge: true, c: 6, draw(b, c) { b.box(0, 0, -2, 4.2, 3, .4, c); b.box(0, 1.0, -2, 1.9, 1.3, .46, GLASS); b.box(0, 1.0, -2, .1, 1.3, .5, 0xffffff); b.box(0, 1.6, -2, 1.9, .1, .5, 0xffffff); b.box(0, .95, -2, 2.0, .1, .5, 0xffffff); }, cols: [[-2.1, -2.2, 2.1, -1.8, 3]] },
    roof:   { icon: '🏠', name: 'Dach', tab: 0, slot: 'roof', c: 0, draw(b, c) { b.prism(0, 3, 0, 4.9, 2.2, 4.9, c, Math.PI / 2); b.box(0, 2.95, 0, 4.4, .12, 4.4, shade(c, .6)); } },
    tower:  { icon: '🗼', name: 'Turm', tab: 0, slot: 'item', c: 6, draw(b, c) { b.cyl(0, 0, 0, 1.4, 1.7, 7, c, 10); b.cyl(0, 7, 0, 1.95, 1.95, .3, shade(c, .7), 10); b.cone(0, 7.3, 0, 2.2, 2.6, 0xc2453d, 10); b.box(0, 0, 1.55, .9, 1.8, .15, 0x6b4a2a); b.box(0, 4, 1.4, .6, .9, .14, GLASS); }, circ: [[0, 0, 1.75, 10]] },
    sofa:   { icon: '🛋️', name: 'Sofa', tab: 1, slot: 'item', c: 1, draw(b, c) { b.box(0, 0, 0, 2.3, .45, .95, c); b.box(0, .45, -.38, 2.3, .55, .22, shade(c, .85)); b.box(-1.1, .3, 0, .22, .4, .95, shade(c, .85)); b.box(1.1, .3, 0, .22, .4, .95, shade(c, .85)); b.box(-.5, .45, .05, .8, .12, .7, shade(c, 1.15)); b.box(.5, .45, .05, .8, .12, .7, shade(c, 1.15)); }, cols: [[-1.15, -.5, 1.15, .5, 1]] },
    bed:    { icon: '🛏️', name: 'Bett', tab: 1, slot: 'item', c: 5, draw(b, c) { b.box(0, 0, 0, 1.6, .35, 2.3, WOOD); b.box(0, .35, .1, 1.5, .25, 2.0, c); b.box(0, .6, -.85, 1.0, .14, .42, 0xffffff); b.box(0, .35, -1.1, 1.6, .7, .12, WOOD); }, cols: [[-.8, -1.15, .8, 1.15, 1]] },
    table:  { icon: '🍽️', name: 'Tisch', tab: 1, slot: 'item', c: 7, draw(b, c) { b.box(0, .75, 0, 1.7, .1, 1.1, c); for (const x of [-.75, .75]) for (const z of [-.45, .45]) b.box(x, 0, z, .12, .75, .12, shade(c, .7)); b.cyl(-.4, .85, 0, .3, .3, .04, 0xffffff, 10); b.cyl(.4, .85, 0, .3, .3, .04, 0xffffff, 10); b.sph(0, 1.0, 0, .15, 0xff5a5a, 0); }, cols: [[-.85, -.55, .85, .55, 1]] },
    tv:     { icon: '📺', name: 'Fernseher', tab: 1, slot: 'item', c: 6, draw(b, c) { b.box(0, 0, 0, 1.7, .55, .55, WOOD); b.box(0, .55, 0, 1.4, .9, .14, DARK); b.box(0, .62, .08, 1.2, .72, .03, 0x6fd0ff); b.box(0, .55, 0, .3, .05, .3, DARK); }, cols: [[-.85, -.28, .85, .28, 1.5]] },
    plant:  { icon: '🪴', name: 'Pflanze', tab: 1, slot: 'item', c: 3, draw(b, c) { b.cyl(0, 0, 0, .3, .22, .5, 0xc2453d, 8); b.sph(0, 1.0, 0, .55, c, 1, 1, 1.2, 1); b.sph(.25, 1.35, .1, .3, shade(c, 1.15), 1); }, circ: [[0, 0, .45, 2]] },
    lamp:   { icon: '💡', name: 'Lampe', tab: 1, slot: 'item', c: 2, draw(b, c) { b.cyl(0, 0, 0, .09, .13, 2.2, DARK, 6); b.sph(0, 2.4, 0, .4, c, 1); b.cyl(0, 0, 0, .35, .35, .08, DARK, 8); }, circ: [[0, 0, .3, 3]] },
    tree:   { icon: '🌳', name: 'Baum', tab: 2, slot: 'item', c: 3, draw(b, c) { b.cyl(0, 0, 0, .3, .42, 2.2, WOOD, 6); b.sph(0, 3.2, 0, 1.9, c, 1, 1, .9, 1); b.sph(.8, 4.0, -.5, 1.2, shade(c, 1.1), 1, 1, .9, 1); }, circ: [[0, 0, .8, 8]] },
    flowers:{ icon: '🌷', name: 'Beet', tab: 2, slot: 'item', c: 5, draw(b, c) { b.box(0, 0, 0, 3.4, .22, 3.4, 0x6b4a2a); for (let i = 0; i < 12; i++) { const a = i * 2.4, r = .4 + (i % 4) * .4, x = Math.sin(a) * r, z = Math.cos(a) * r; b.cyl(x, .2, z, .03, .03, .5, 0x3fa84e, 3); b.sph(x, .78, z, .2, i % 3 ? c : 0xffd23f, 0); } } },
    fence:  { icon: '🪵', name: 'Zaun', tab: 2, edge: true, c: 7, draw(b, c) { for (const x of [-1.8, -.6, .6, 1.8]) b.box(x, 0, -2, .18, 1.1, .18, c); b.box(0, .3, -2, 4, .1, .08, c); b.box(0, .78, -2, 4, .1, .08, c); }, cols: [[-2.1, -2.15, 2.1, -1.85, 1.2]] },
    fountain:{ icon: '⛲', name: 'Brunnen', tab: 2, slot: 'item', c: 6, draw(b, c) { b.cyl(0, 0, 0, 1.8, 1.9, .7, shade(c, .9), 16); b.cyl(0, .6, 0, 1.5, 1.5, .1, 0x57c4ff, 16); b.cyl(0, .5, 0, .25, .35, 1.6, shade(c, .9), 8); b.cyl(0, 2.0, 0, .9, .3, .25, shade(c, .9), 10); }, circ: [[0, 0, 1.9, 3]], fountain: true },
    pool:   { icon: '🏊', name: 'Pool', tab: 2, slot: 'item', c: 6, draw(b, c) { b.box(0, .05, 0, 3.3, .4, 3.3, 0x4db6f0); for (const s of [-1, 1]) { b.box(s * 1.8, 0, 0, .25, .5, 3.8, c); b.box(0, 0, s * 1.8, 3.8, .5, .25, c); } b.sph(.6, .5, .4, .25, 0xffd23f, 1); b.sph(.9, .55, .1, .16, 0xff6b6b, 0); }, pool: true },
    tramp:  { icon: '🤸', name: 'Trampolin', tab: 2, slot: 'item', c: 1, draw(b, c) { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; b.cyl(Math.sin(a) * 1.45, 0, Math.cos(a) * 1.45, .07, .07, .28, DARK, 5); } b.cyl(0, .25, 0, 1.6, 1.6, .1, DARK, 18); b.cyl(0, .33, 0, 1.35, 1.35, .05, c, 18); }, tramp: true },
    slide:  { icon: '🛝', name: 'Rutsche', tab: 2, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, -1.2, 1.5, 2.4, 1.4, 0xc2453d); b.box(0, 2.4, -1.2, 1.9, .15, 1.8, c); b.box(0, 1.2, .9, 1.2, .15, 3.4, c, 0, .5); for (let k = 0; k < 4; k++) b.box(0, .4 + k * .55, -.4, 1.0, .07, .07, SILVER); }, cols: [[-.9, -2.0, .9, -.4, 2.6]] },
    doghouse:{ icon: '🐕', name: 'Hundehütte', tab: 2, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, 0, 1.8, 1.1, 1.8, shade(c, 1.05)); b.prism(0, 1.1, 0, 2.3, .9, 2.1, 0x8a5a33, 0); b.box(0, 0, .91, .8, .85, .06, 0x2b2f3a); b.cyl(0, .85, .93, .4, .4, .05, 0x2b2f3a, 10, Math.PI / 2); b.box(.7, 0, 1.2, .5, .12, .5, 0xffd23f); b.box(0, 1.9, .0, .3, .12, .3, 0xffd23f); }, cols: [[-.95, -.95, .95, .95, 1.8]] },
    tent:   { icon: '⛺', name: 'Zelt', tab: 2, slot: 'item', c: 5, draw(b, c) { b.prism(0, 0, 0, 3.4, 2.4, 3.4, c, 0); b.box(0, 0, 1.68, .9, 1.4, .06, DARK); b.box(0, 2.35, 0, .1, .3, .1, 0xffd23f); }, cols: [[-1.5, -1.5, 1.5, 1.5, 2.4]] },
    /* ----- Bauernhof ----- */
    hay:    { icon: '🌾', name: 'Heuballen', tab: 3, slot: 'item', c: 2, draw(b, c) { b.cyl(0, .3, 0, .9, .9, 1.2, 0xe8c85a, 12, 0, 0, Math.PI / 2); b.cyl(0, .3, 0, .92, .92, .1, 0xc9a23a, 12, 0, 0, Math.PI / 2); b.cyl(.7, .3, 0, .92, .92, .1, 0xc9a23a, 12, 0, 0, Math.PI / 2); b.cyl(-.7, .3, 0, .92, .92, .1, 0xc9a23a, 12, 0, 0, Math.PI / 2); }, circ: [[0, 0, 1, 1.8]] },
    trough: { icon: '🪣', name: 'Futtertrog', tab: 3, slot: 'item', c: 7, draw(b, c) { b.box(0, 0, 0, 2.2, .6, .8, WOOD); b.box(0, .5, 0, 1.9, .06, .55, 0x57c4ff); for (const x of [-1.0, 1.0]) b.box(x, 0, 0, .12, .5, .9, shade(WOOD, .8)); }, cols: [[-1.1, -.45, 1.1, .45, .7]] },
    coop:   { icon: '🐔', name: 'Hühnerstall', tab: 3, slot: 'item', c: 2, draw(b, c) { b.box(0, .5, 0, 2.4, 1.4, 1.8, c); b.prism(0, 1.9, 0, 2.8, .9, 2.2, 0xc2453d, 0); for (const x of [-.9, .9]) b.box(x, 0, 0, .12, .6, .12, WOOD); b.box(0, .2, 1.1, 1.0, .08, 1.1, WOOD, 0, .3); b.box(0, .8, .91, .6, .7, .06, DARK); b.box(1.4, .5, 0, .5, .5, .8, 0xb98650); b.sph(1.4, 1.05, 0, .2, 0xfff4dc, 0); }, cols: [[-1.3, -1, 1.3, 1, 1.8]] },
    barnsm: { icon: '🛖', name: 'Kleine Scheune', tab: 3, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, 0, 3.4, 2.4, 3.0, c); b.prism(0, 2.4, 0, 3.8, 1.4, 3.4, 0x8a2b2b, Math.PI / 2); b.box(0, 0, 1.52, 1.4, 1.8, .08, 0xf5ecd8); b.box(0, .9, 1.56, 1.4, .12, .06, c, 0, 0, .7); b.box(0, .9, 1.56, 1.4, .12, .06, c, 0, 0, -.7); }, cols: [[-1.8, -1.6, 1.8, 1.6, 3]] },
    scarecrow:{ icon: '🧑‍🌾', name: 'Vogelscheuche', tab: 3, slot: 'item', c: 1, draw(b, c) { b.box(0, 0, 0, .1, 2.0, .1, WOOD); b.box(0, 1.4, 0, 1.6, .1, .1, WOOD); b.box(0, .9, 0, .55, .7, .22, c); b.sph(0, 2.15, 0, .26, 0xf3d9a0, 1); b.cone(0, 2.3, 0, .36, .4, 0xc2453d, 8); b.box(-.7, 1.0, 0, .2, .5, .08, c); b.box(.7, 1.0, 0, .2, .5, .08, c); b.box(-.08, 2.15, .24, .05, .05, .03, DARK); b.box(.08, 2.15, .24, .05, .05, .03, DARK); }, circ: [[0, 0, .35, 2]] },
    raised: { icon: '🥕', name: 'Hochbeet', tab: 3, slot: 'item', c: 3, draw(b, c) { b.box(0, 0, 0, 3.0, .7, 1.4, WOOD); b.box(0, .6, 0, 2.7, .1, 1.1, 0x6b4a2a); for (let i = 0; i < 6; i++) { const x = -1.1 + i * .44; b.cone(x, .65, -.25 + (i % 2) * .5, .1, .4, c, 5); b.sph(x, .75, -.25 + (i % 2) * .5, .06, [0xff8a1f, 0xe0382b][i % 2], 0); } }, cols: [[-1.5, -.7, 1.5, .7, .8]] },
    well:   { icon: '⛲', name: 'Ziehbrunnen', tab: 3, slot: 'item', c: 6, draw(b, c) { b.cyl(0, 0, 0, .9, 1.0, .9, 0x9aa0a8, 12); b.cyl(0, .8, 0, .7, .7, .1, 0x57c4ff, 12); for (const x of [-.8, .8]) b.box(x, 0, 0, .12, 2.0, .12, WOOD); b.box(0, 2.0, 0, 2.0, .12, .12, WOOD); b.prism(0, 2.1, 0, 2.4, .6, 1.2, 0xc2453d, Math.PI / 2); b.box(0, 1.3, 0, .06, .7, .06, 0x555b66); b.cyl(0, .9, 0, .2, .2, .3, 0xb98650, 8); }, circ: [[0, 0, 1, 2]] },
    cart:   { icon: '🛒', name: 'Heuwagen', tab: 3, slot: 'item', c: 2, draw(b, c) { b.box(0, .4, 0, 1.6, .15, 2.6, WOOD); for (const sx of [-1, 1]) b.box(sx * .8, .4, 0, .1, .6, 2.6, WOOD); b.box(0, .9, 0, 1.5, .5, 2.4, 0xe8c85a); for (const sx of [-1, 1]) b.cyl(sx * .95, .2, -.7, .4, .4, .12, DARK, 10, 0, 0, Math.PI / 2); for (const sx of [-1, 1]) b.cyl(sx * .95, .2, .7, .4, .4, .12, DARK, 10, 0, 0, Math.PI / 2); b.box(0, .3, 2.0, .1, .1, 1.4, WOOD); }, cols: [[-.9, -1.3, .9, 1.3, 1.2]] },
    mailbox:{ icon: '📮', name: 'Briefkasten', tab: 3, slot: 'item', c: 1, draw(b, c) { b.box(0, 0, 0, .12, 1.2, .12, WOOD); b.box(0, 1.2, 0, .6, .4, .8, c); b.cyl(0, 1.3, 0, .3, .3, .8, c, 8, Math.PI / 2); b.box(.35, 1.4, .1, .05, .35, .05, 0xe0382b); }, circ: [[0, 0, .3, 1.7]] },
    /* ----- Sommer & Freibad ----- */
    lounger:{ icon: '🏖️', name: 'Sonnenliege', tab: 4, slot: 'item', c: 0, draw(b, c) { b.box(0, .3, 0, .9, .14, 2.0, c); b.box(0, .6, -.8, .9, .5, .14, c, 0, .8); b.box(-.35, 0, .8, .08, .3, .08, 0x555b66); b.box(.35, 0, .8, .08, .3, .08, 0x555b66); b.box(-.35, 0, -.8, .08, .3, .08, 0x555b66); b.box(.35, 0, -.8, .08, .3, .08, 0x555b66); b.box(0, .44, .2, .6, .06, .5, 0xffffff); }, cols: [[-.5, -1, .5, 1, .6]] },
    parasol:{ icon: '⛱️', name: 'Sonnenschirm', tab: 4, slot: 'item', c: 0, draw(b, c) { b.cyl(0, 0, 0, .06, .08, 2.6, 0xe8e8ee, 6); b.cone(0, 2.2, 0, 1.9, .6, c, 10); b.box(0, 2.78, 0, .06, .14, .06, 0xe8e8ee); }, circ: [[0, 0, .2, 2.7]] },
    grill:  { icon: '🍖', name: 'Grill', tab: 4, slot: 'item', c: 6, draw(b, c) { b.box(0, .7, 0, 1.1, .5, .7, DARK); b.box(0, 1.2, 0, 1.15, .06, .75, 0x9aa0a8); for (const x of [-.4, .4]) for (const z of [-.25, .25]) b.box(x, 0, z, .08, .7, .08, 0x555b66); b.sph(.2, 1.35, 0, .12, 0xc2453d, 0); b.box(-.25, 1.3, 0, .35, .06, .12, 0x8a5a33); b.cyl(0, 1.25, 0, .02, .02, .5, 0xcfd8e6, 4); }, circ: [[0, 0, .6, 1.4]] },
    hammock:{ icon: '🛌', name: 'Hängematte', tab: 4, slot: 'item', c: 5, draw(b, c) { b.box(-1.5, 0, 0, .12, 1.8, .12, WOOD); b.box(1.5, 0, 0, .12, 1.8, .12, WOOD); for (let i = 0; i < 7; i++) { const x = -1.4 + i * .467, y = 1.2 - Math.sin(i / 6 * Math.PI) * .6; b.box(x, y, 0, .5, .08, .8, c); } }, cols: [[-1.6, -.2, -1.4, .2, 2], [1.4, -.2, 1.6, .2, 2]] },
    sandbox:{ icon: '🏝️', name: 'Sandkasten', tab: 4, slot: 'item', c: 2, draw(b, c) { b.box(0, 0, 0, 2.6, .4, 2.6, WOOD); b.box(0, .3, 0, 2.3, .08, 2.3, 0xf1d98a); b.cone(.4, .35, .3, .3, .5, 0xf1d98a, 8); b.box(-.7, .38, -.5, .3, .25, .3, 0xff5a5a); b.box(-.5, .55, -.5, .04, .4, .04, 0xffd23f); }, cols: [[-1.3, -1.3, 1.3, 1.3, .5]] },
    swingset:{ icon: '🪢', name: 'Schaukel', tab: 4, slot: 'item', c: 1, draw(b, c) { for (const x of [-1.4, 1.4]) { b.box(x, 0, -.5, .12, 2.4, .12, c, 0, .3); b.box(x, 0, .5, .12, 2.4, .12, c, 0, -.3); } b.box(0, 2.3, 0, 3.0, .14, .14, c); for (const x of [-.5, .5]) { b.box(x, 1.0, 0, .04, 1.3, .04, 0x555b66); b.box(x, .85, 0, .45, .08, .3, 0xffd23f); } }, cols: [[-1.5, -.6, -1.3, .6, 2.4], [1.3, -.6, 1.5, .6, 2.4]] },
    gnome:  { icon: '🧙', name: 'Gartenzwerg', tab: 4, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, 0, .4, .5, .3, 0x4da3ff); b.sph(0, .65, .02, .17, 0xf3d9a0, 1); b.cone(0, .7, 0, .22, .6, c, 8); b.box(0, .5, .13, .2, .3, .06, 0xffffff); b.box(-.1, .68, .16, .04, .04, .03, DARK); b.box(.1, .68, .16, .04, .04, .03, DARK); b.sph(0, .62, .17, .04, 0xff8fa8, 0); }, circ: [[0, 0, .25, 1.3]] },
    campfire:{ icon: '🔥', name: 'Lagerfeuer', tab: 4, slot: 'item', c: 0, draw(b, c) { for (let i = 0; i < 8; i++) { const a = i * .785; b.sph(Math.sin(a) * .7, .12, Math.cos(a) * .7, .15, 0x9aa0a8, 0); } for (let i = 0; i < 4; i++) b.box(0, .1, 0, 1.0, .14, .14, WOOD, i * .78, 0, .3); b.cone(0, .15, 0, .38, .9, 0xff8a1f, 6); b.cone(0, .15, 0, .22, .6, 0xffd23f, 6); }, circ: [[0, 0, .8, .6]] },
    picnic: { icon: '🧺', name: 'Picknickdecke', tab: 4, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, 0, 2.6, .05, 2.6, c); for (let i = -2; i <= 2; i += 2) { b.box(i * .5, .05, 0, .5, .01, 2.6, 0xffffff); b.box(0, .05, i * .5, 2.6, .01, .5, 0xffffff); } b.cyl(0, .06, 0, .3, .3, .3, 0xb98650, 8); b.sph(.5, .2, .4, .16, 0xe0382b, 1); b.sph(-.6, .2, -.3, .16, 0xffd23f, 1); } },
    birdhouse:{ icon: '🐦', name: 'Vogelhaus', tab: 4, slot: 'item', c: 2, draw(b, c) { b.box(0, 0, 0, .1, 1.6, .1, WOOD); b.box(0, 1.6, 0, .6, .5, .6, c); b.prism(0, 2.1, 0, .8, .4, .8, 0xc2453d, 0); b.cyl(0, 1.7, .31, .12, .12, .04, DARK, 8, Math.PI / 2); b.box(0, 1.55, .35, .3, .04, .12, WOOD); }, circ: [[0, 0, .25, 2.5]] },
    icecart:{ icon: '🍦', name: 'Eiswagen-Stand', tab: 4, slot: 'item', c: 5, draw(b, c) { b.box(0, .5, 0, 1.8, .9, 1.0, 0xfff0c0); b.box(0, 1.4, 0, 1.9, .1, 1.1, c); for (let i = 0; i < 5; i++) b.box(-.8 + i * .4, 1.5, .45, .4, .4, .08, i % 2 ? 0xffffff : c); b.cyl(-.5, 0, .7, .3, .3, .15, DARK, 10, 0, 0, Math.PI / 2); b.cyl(.5, 0, .7, .3, .3, .15, DARK, 10, 0, 0, Math.PI / 2); b.sph(0, 1.15, 0, .22, 0xffb0d0, 1); b.cone(0, .7, 0, .2, .4, 0xd9a54a, 8); }, cols: [[-1, -.55, 1, .55, 1.6]] },
    /* ----- Parcours (selbst bauen: Start 🚩 → Hindernisse → Ziel 🏁) ----- */
    obstart:{ icon: '🚩', name: 'Start', tab: 5, slot: 'item', c: 3, draw(b, c) { b.box(0, 0, 0, 3.4, .12, 3.4, DARK); b.box(0, .12, 0, 3.0, .03, 3.0, c); b.box(1.4, 0, -1.4, .1, 2.6, .1, 0xdddddd); b.box(1.4, 2.0, -1.0, .06, .6, .8, 0xe0382b); } },
    obcp:   { icon: '⛳', name: 'Checkpoint', tab: 5, slot: 'item', c: 2, draw(b, c) { b.box(0, 0, 0, 3.0, .1, 3.0, DARK); b.box(0, .1, 0, 2.6, .03, 2.6, c); b.box(1.2, 0, -1.2, .08, 2.0, .08, 0xdddddd); b.box(1.2, 1.5, -.9, .06, .5, .6, 0xffd23f); } },
    obfin:  { icon: '🏁', name: 'Ziel', tab: 5, slot: 'item', c: 6, draw(b, c) { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) b.box(-1.5 + i * 1, 0, -1.5 + j * 1, 1, .1, 1, (i + j) % 2 ? DARK : 0xffffff); for (const s of [-1.6, 1.6]) b.box(s, 0, 0, .2, 3.2, .2, 0xdddddd); for (let i = 0; i < 8; i++) b.box(-1.6 + i * .45, 3.0, 0, .45, .4, .15, i % 2 ? DARK : 0xffffff); } },
    oblava: { icon: '🌋', name: 'Lava', tab: 5, slot: 'item', c: 0, draw(b, c) { b.box(0, 0, 0, 3.6, .1, 3.6, 0x7a1f12); b.box(0, .1, 0, 3.2, .05, 3.2, 0xff5a1f); for (const [x, z] of [[-.8, -.6], [.7, .5], [-.2, 1.0], [.9, -1.0]]) b.sph(x, .2, z, .28, 0xffd23f, 1, 1, .6, 1); } },
    obblock:{ icon: '🧱', name: 'Hürde', tab: 5, slot: 'item', c: 1, draw(b, c) { b.box(0, 0, 0, 3.2, .7, .7, c); for (let i = 0; i < 4; i++) b.box(-1.2 + i * .8, .71, 0, .4, .02, .72, 0xffffff); }, cols: [[-1.6, -.4, 1.6, .4, .75]] },
    obpad:  { icon: '🔼', name: 'Sprungpilz', tab: 5, slot: 'item', c: 5, draw(b, c) { b.cyl(0, 0, 0, .5, .7, .3, DARK, 10); b.cyl(0, .3, 0, 1.3, 1.1, .25, c, 12); b.cyl(0, .55, 0, .8, .8, .05, 0xffffff, 12); }, tramp: true },
  };
  const SILVER = 0xc9ced6; // (für Rutsche)
  const TABS = [{ icon: '🏠', name: 'Haus' }, { icon: '🛋️', name: 'Möbel' }, { icon: '🌳', name: 'Garten & Spaß' }, { icon: '🌾', name: 'Bauernhof' }, { icon: '🏖️', name: 'Sommer' }, { icon: '🏁', name: 'Parcours' }];
  const B = { CAT, TABS, PAL, items: [], active: false, sel: 'floor', rot: 0, color: 7, cx: 0, cz: 0, gx: 0, gz: 0, valid: false };

  /* ---------- Geometrie (lokal zeichnen, gedreht anhängen) ---------- */
  const cache = {};
  function local(t, c) {
    const k = t + '|' + c; if (cache[k]) return cache[k];
    const b = new BI.Batch(); CAT[t].draw(b, PAL[c % PAL.length]); return cache[k] = b;
  }
  function append(dst, src, ox, oz, ry) {
    const cs = Math.cos(ry), sn = Math.sin(ry), p = src.p, n = src.n, col = src.c;
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i], z = p[i + 2]; dst.p.push(x * cs + z * sn + ox, p[i + 1], -x * sn + z * cs + oz);
      const nx = n[i], nz = n[i + 2]; dst.n.push(nx * cs + nz * sn, n[i + 1], -nx * sn + nz * cs); dst.c.push(col[i], col[i + 1], col[i + 2]);
    }
  }
  const rotPt = (x, z, ry) => [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];

  /* ---------- Platz / Gültigkeit ---------- */
  function center(gx, gz) { return [gx * CELL, gz * CELL]; }
  function checkPoint(t, gx, gz, r) { // Weltpunkt, der frei sein muss
    const [cx, cz] = center(gx, gz); if (!CAT[t].edge) return [cx, cz];
    const e = rotPt(0, -2, r * Math.PI / 2); return [cx + e[0], cz + e[1]];
  }
  const slotOf = (t, r) => CAT[t].edge ? 'edge' + r : CAT[t].slot;
  /* Gebautes, das vor dem Kino schon auf dessen Fläche stand, bleibt erhalten (sonst würde es beim nächsten Speichern verschwinden) */
  const legacy = (t, gx, gz, r) => { const C = BI.CINEMA; if (!C || B.items.length >= MAXP) return false; const q = checkPoint(t, gx, gz, r); return q[0] > C.x0 - 3 && q[0] < -43 && q[1] > C.z0 - 3 && q[1] < C.z1 + 3; };
  B.canPlace = function (t, gx, gz, r) { const q = checkPoint(t, gx, gz, r); return B.items.length < MAXP + 1 && W.canBuild(q[0], q[1], CAT[t].edge ? 1.2 : 1.8); };

  /* ---------- Teile setzen / entfernen ---------- */
  function mkColliders(it) {
    const c = CAT[it.t], ry = it.r * Math.PI / 2, [cx, cz] = center(it.gx, it.gz), out = [];
    for (const b of c.cols || []) {
      const a = rotPt(b[0], b[1], ry), d = rotPt(b[2], b[3], ry);
      out.push(W.addBox(cx + Math.min(a[0], d[0]), cz + Math.min(a[1], d[1]), cx + Math.max(a[0], d[0]), cz + Math.max(a[1], d[1]), true, b[4]));
    }
    for (const q of c.circ || []) { const p = rotPt(q[0], q[1], ry); out.push(W.addCircle(cx + p[0], cz + p[1], q[2], true, q[3])); }
    return out;
  }
  function addItem(t, gx, gz, r, c, quiet, owner) {
    const slot = slotOf(t, r);
    for (let i = B.items.length - 1; i >= 0; i--) { const o = B.items[i]; if (o.gx === gx && o.gz === gz && slotOf(o.t, o.r) === slot) { if (owner && o.o !== owner) return null; dropItem(i); } }
    const it = { t, gx, gz, r, c, cols: [], o: owner }; it.cols = mkColliders(it); B.items.push(it); dirty = true; if (!quiet && !owner) save();
    return it;
  }
  function dropItem(i) { const it = B.items[i]; for (const k of it.cols) W.removeCollider(k); B.items.splice(i, 1); dirty = true; }
  B.place = function () {
    if (!B.valid) { G.say('Hier kann man nicht bauen 🚫', 1400); return false; }
    addItem(B.sel, B.gx, B.gz, B.rot, B.color); A.place(); if (B.onOp) B.onOp({ op: 'a', i: [B.sel, B.gx, B.gz, B.rot, B.color] });
    const [cx, cz] = center(B.gx, B.gz); fx.burst(cx, 1, cz, 10, [BI.C.gold, BI.C.white, BI.C.pink], 3, .7, 26, 6); return true;
  };
  B.remove = function () {
    let n = 0; for (let i = B.items.length - 1; i >= 0; i--) if (B.items[i].gx === B.gx && B.items[i].gz === B.gz) { dropItem(i); n++; }
    if (n) { save(); if (B.onOp) B.onOp({ op: 'd', gx: B.gx, gz: B.gz }); A.pop(); const [cx, cz] = center(B.gx, B.gz); fx.burst(cx, 1, cz, 8, [BI.C.dust, BI.C.white], 3, .6, 30, 6); } else G.say('Hier ist nichts zum Wegräumen', 1400);
    return n;
  };
  B.clearAll = function () { for (let i = B.items.length - 1; i >= 0; i--) if (!B.items[i].o) dropItem(i); save(); if (B.onOp) B.onOp({ op: 'l', l: [] }); };
  /* Gemeinsames Bauen: Teile von Freunden sind nur für diese Sitzung da (nicht gespeichert) */
  B.exportMine = () => B.items.filter(i => !i.o).map(i => [i.t, i.gx, i.gz, i.r, i.c]);
  B.exportOwner = o => B.items.filter(i => i.o === o).map(i => [i.t, i.gx, i.gz, i.r, i.c]);
  B.owners = () => [...new Set(B.items.filter(i => i.o).map(i => i.o))];
  B.dropOwner = o => { let n = 0; for (let i = B.items.length - 1; i >= 0; i--) if (o == null ? !!B.items[i].o : B.items[i].o === o) { dropItem(i); n++; } return n; };
  B.applyRemote = function (owner, d) {
    const ok = r => Array.isArray(r) && CAT[r[0]] && B.canPlace(r[0], r[1] | 0, r[2] | 0, r[3] | 0);
    if (d.op === 'a') { const r = d.i; if (ok(r)) addItem(r[0], r[1] | 0, r[2] | 0, (r[3] | 0) & 3, (r[4] | 0) % PAL.length, true, owner); }
    else if (d.op === 'd') { for (let i = B.items.length - 1; i >= 0; i--) if (B.items[i].o === owner && B.items[i].gx === (d.gx | 0) && B.items[i].gz === (d.gz | 0)) dropItem(i); }
    else if (d.op === 'l') { B.dropOwner(owner); for (const r of (Array.isArray(d.l) ? d.l : []).slice(0, MAXP)) if (ok(r)) addItem(r[0], r[1] | 0, r[2] | 0, (r[3] | 0) & 3, (r[4] | 0) % PAL.length, true, owner); }
  };
  let saveT = 0;
  function save() { saveT = .8; }
  B.saveNow = () => { saveT = 0; flushSave(); };
  function flushSave() { BI.store.set('build', B.exportMine()); }

  /* ---------- Mesh ---------- */
  let dirty = true, mesh = null, roofMesh = null, rebuildT = 0; const roofKeys = new Set(), wallKeys = new Set();
  const mat = BI.mat();
  function rebuild() {
    const dst = new BI.Batch(), rf = new BI.Batch(); roofKeys.clear(); wallKeys.clear();
    for (const it of B.items) {
      const [cx, cz] = center(it.gx, it.gz); append(it.t === 'roof' ? rf : dst, local(it.t, it.c), cx, cz, it.r * Math.PI / 2);
      if (it.t === 'roof') roofKeys.add(it.gx + ',' + it.gz); else if (CAT[it.t].edge && it.t !== 'fence') wallKeys.add(it.gx + ',' + it.gz);
    }
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh = null; } if (roofMesh) { scene.remove(roofMesh); roofMesh.geometry.dispose(); roofMesh = null; }
    if (!dst.empty) { mesh = dst.mesh(mat); mesh.frustumCulled = false; scene.add(mesh); }
    if (!rf.empty) { roofMesh = rf.mesh(mat); roofMesh.frustumCulled = false; scene.add(roofMesh); }
    dirty = false;
  }

  /* ---------- Vorschau + Raster ---------- */
  const ghostMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: .62, depthWrite: false });
  let ghost = null, ghostKey = '';
  const gridGeo = (() => { const p = []; for (let i = -4; i <= 5; i++) { const o = (i - .5) * CELL; p.push(o, 0, -5 * CELL, o, 0, 5 * CELL, -5 * CELL, 0, o, 5 * CELL, 0, o); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return g; })();
  const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })); grid.visible = false; scene.add(grid);
  const cell = new THREE.Mesh(new THREE.PlaneGeometry(CELL, CELL), new THREE.MeshBasicMaterial({ color: 0x66ff99, transparent: true, opacity: .35, depthWrite: false })); cell.rotation.x = -Math.PI / 2; cell.visible = false; scene.add(cell);
  function updateGhost() {
    const k = B.sel + '|' + B.color + '|' + B.rot; if (k !== ghostKey || !ghost) {
      ghostKey = k; if (ghost) { scene.remove(ghost); ghost.geometry.dispose(); }
      const d = new BI.Batch(); append(d, local(B.sel, B.color), 0, 0, B.rot * Math.PI / 2); ghost = d.mesh(ghostMat); ghost.frustumCulled = false; scene.add(ghost);
    }
    const [cx, cz] = center(B.gx, B.gz); ghost.position.set(cx, .02, cz); grid.position.set(cx, .14, cz); cell.position.set(cx, .16, cz);
    B.valid = B.canPlace(B.sel, B.gx, B.gz, B.rot); ghostMat.color.setHex(B.valid ? 0xffffff : 0xff6a6a); cell.material.color.setHex(B.valid ? 0x66ff99 : 0xff5a5a);
  }

  /* ---------- Bedienung ---------- */
  B.setType = function (t) { if (!CAT[t]) return; B.sel = t; B.color = CAT[t].c != null ? CAT[t].c : B.color; };
  B.rotate = function () { B.rot = (B.rot + 1) % 4; };
  B.nextColor = function () { B.color = (B.color + 1) % PAL.length; };
  B.setCursor = function (x, z) {
    const gx = Math.round(x / CELL), gz = Math.round(z / CELL), dx = x - gx * CELL, dz = z - gz * CELL;
    B.gx = gx; B.gz = gz; if (CAT[B.sel].edge) B.rot = Math.abs(dz) > Math.abs(dx) ? (dz < 0 ? 0 : 2) : (dx < 0 ? 1 : 3); // nächste Kante wählen
  };
  B.enter = function (x, z, h) { B.active = true; B.setCursor(x + Math.sin(h) * 6, z + Math.cos(h) * 6); grid.visible = cell.visible = true; };
  B.exit = function () { B.active = false; grid.visible = cell.visible = false; if (ghost) { scene.remove(ghost); ghost.geometry.dispose(); ghost = null; ghostKey = ''; } };
  B.update = function (dt, t) {
    if (dirty) { rebuildT -= dt; if (rebuildT <= 0) { rebuild(); rebuildT = .08; } }
    if (saveT > 0) { saveT -= dt; if (saveT <= 0) flushSave(); }
    if (B.active) updateGhost();
    if (roofMesh) { const P = G.P, hide = B.active || (!P.veh && B.shelter(P.x, P.z) === 2); if (roofMesh.visible === hide) roofMesh.visible = !hide; }
  };
  /* 2 = unter einem Dach (Dach wird ausgeblendet, Kamera steiler), 1 = nahe an Wänden, 0 = draußen */
  B.roofVisible = () => !!roofMesh && roofMesh.visible;
  B.shelter = (x, z) => {
    const gx = Math.round(x / CELL), gz = Math.round(z / CELL); if (roofKeys.has(gx + ',' + gz)) return 2;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (wallKeys.has((gx + i) + ',' + (gz + j))) return 1; return 0;
  };
  B.nearType = (x, z, key, r) => { for (const it of B.items) if (CAT[it.t][key] && Math.hypot(x - it.gx * CELL, z - it.gz * CELL) < r) return it; return null; };
  Object.defineProperty(B, 'count', { get: () => B.items.length });

  /* ---------- Laden ---------- */
  const saved = BI.store.get('build', []);
  if (Array.isArray(saved)) for (const r of saved.slice(0, MAXP)) { if (Array.isArray(r) && CAT[r[0]] && (B.canPlace(r[0], r[1] | 0, r[2] | 0, r[3] | 0) || legacy(r[0], r[1] | 0, r[2] | 0, r[3] | 0))) addItem(r[0], r[1] | 0, r[2] | 0, (r[3] | 0) & 3, (r[4] | 0) % PAL.length, true); }
  rebuild();
  return B;
};
