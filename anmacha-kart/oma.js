'use strict';
/* Oma-Welt (aus „Oma-Rennen“ übernommen): Stadt-Kulissen der sechs Oma-Strecken, Oma-Namen für die Items und Oma-Sprüche.
 * view.js ruft KartWorlds.oma(api) aus tourLandscape auf; game.js nutzt OMA.item()/OMA.say() für Fahrer mit ac:'oma'. */
window.KartWorlds = window.KartWorlds || {};
window.KartWorlds.oma = A => {
  const { T, d, tr, anim, CX, CZ, R0, PI2, R, ra, pick, put, along, free, face, tree, lamp, points, land, sun, grp, mesh, clouds } = A;
  const sc = d.scene, night = sc === 'xmas' || sc === 'grusel', win = night ? '#ffd88a' : '#a8d4ff';
  // Häuser mit Giebeldach, Fensterreihen und Tür – Breitseite zur Strecke
  const house = (x, z, i, cols, roof, h0, h1, flat) => {
    const ry = face(i), w = ra(9, 14), h = ra(h0, h1), c = pick(cols);
    put('box', c, x, h / 2, z, 8, h, w, ry);
    if (flat) put('box', roof, x, h + 0.4, z, 8.4, 0.8, w + 0.4, ry); else put('pyr', roof, x, h + 2, z, 6.2, 4, w * 0.78, ry);
    for (let f = 0; f < Math.floor((h - 1.5) / 3.4); f++) put('box', win, x, 3 + f * 3.4, z, 8.12, 1.1, w * 0.78, ry, night);
  };
  const bench = (x, z, i) => { const ry = face(i); put('box', '#8a5a2a', x, 0.55, z, 0.7, 0.15, 2.4, ry); put('box', '#8a5a2a', x, 1, z, 0.12, 0.7, 2.4, ry); };
  const stall = (x, z, i, roofs) => { const ry = face(i), c = pick(roofs); put('box', '#c8a070', x, 0.6, z, 1.8, 1.2, 3.2, ry); put('box', c, x, 2.6, z, 2.4, 0.25, 3.6, ry); put('cyl', '#6a4a2a', x, 1.4, z, 0.08, 2.6); for (let q = 0; q < 3; q++) put('sph', pick(['#ff4a4a', '#ffd040', '#7ac040', '#ff8ac0']), x + ra(-0.5, 0.5), 1.35, z + ra(-0.5, 0.5), 0.32); };
  const fountain = (x, z) => { put('cyl', '#c0c0c8', x, 0.4, z, 3.2, 0.8); put('cyl', '#5ab0ff', x, 0.84, z, 2.9, 0.06, 2.9, 0, true); put('cyl', '#c0c0c8', x, 1.6, z, 0.35, 2.4); put('sph', '#bfe8ff', x, 3.1, z, 0.9, 0.6, 0.9, 0, true); };
  const palm = (x, z, pot) => { if (pot) put('cyl', '#c06a3a', x, 0.5, z, 0.8, 1); put('cyl', '#a8844a', x, 3, z, 0.22, 6); for (let q = 0; q < 6; q++) { const b = q / 6 * PI2; put('box', '#3aa04a', x + Math.cos(b) * 1.2, 6, z + Math.sin(b) * 1.2, 2.6, 0.12, 0.6, -b, false, 0, 0.4); } };
  const xtree = (x, z, s) => { put('cyl', '#6a4a2a', x, 0.8 * s, z, 0.4 * s, 1.6 * s); for (let q = 0; q < 3; q++) put('cone', '#2a7a3a', x, (3 + q * 1.8) * s, z, (2.6 - q * 0.7) * s, 2.8 * s); for (let q = 0; q < 9; q++) { const b = q * 2.3, r = (2 - q * 0.17) * s; put('sph', ['#ff3a3a', '#ffd040', '#5ab0ff'][q % 3], x + Math.cos(b) * r, (2.4 + q * 0.5) * s, z + Math.sin(b) * r, 0.22 * s, null, null, 0, true); } put('cone', '#ffd040', x, 8.6 * s, z, 0.5 * s, 0.8 * s, null, 0, true); };
  const snowman = (x, z) => { put('sph', '#ffffff', x, 0.9, z, 1); put('sph', '#ffffff', x, 2.2, z, 0.7); put('sph', '#ffffff', x, 3.2, z, 0.5); put('cone', '#ff8a2a', x, 3.2, z, 0.1, 0.5, 0.1, 0, false, Math.PI / 2); put('cyl', '#202020', x, 3.8, z, 0.4, 0.5); };
  const roofs = ['#e84a5a', '#3a8ae8', '#40c070', '#ffb020'];
  if (sc === 'markt') {
    along(56, 10, 26, (x, z, i) => house(x, z, i, ['#f2d7a8', '#e8b8a0', '#cfe0c0', '#f4e8c8', '#d8c8e8', '#f0c8a0'], pick(['#b04a3a', '#8a3a2a', '#a05a3a']), 9, 17));
    along(30, 2.5, 7, (x, z, i) => stall(x, z, i, roofs)); along(26, 1.5, 2.5, (x, z) => lamp(x, z, 5, '#fff8e0')); along(18, 3, 8, bench);
    along(20, 4, 9, (x, z) => tree(x, z, ra(6, 9), pick(['#3a9a3a', '#4aa84a']), null, true));
    { const i = Math.floor(tr.N * 0.42), off = tr.wallD + 36, x = tr.P[i * 2] + tr.Nm[i * 2] * off, z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * off; put('box', '#d8c8b0', x, 9, z, 8, 18, 8); put('cone', '#3a6a5a', x, 24, z, 5, 12); put('cyl', '#fff8e0', x, 14, z, 1.6, 0.25, 1.6, 0, true, Math.PI / 2); put('box', '#c8b8a0', x + 9, 5, z, 12, 10, 16); put('pyr', '#8a3a2a', x + 9, 12.5, z, 9.5, 5, 12.5); }
    free(16, 30, R0 * 0.1, R0 * 0.8, (x, z) => fountain(x, z));
    sun('#fff2b0', 260, 36); clouds(10);
  } else if (sc === 'park') {
    free(120, 8, 0, R0 + 260, (x, z) => tree(x, z, ra(8, 15), pick(['#2f8a2a', '#3a9a3a', '#4aa84a', '#5ab04a']), null, R() < 0.6));
    along(70, 4, 40, (x, z) => tree(x, z, ra(6, 11), pick(['#2f8a2a', '#3a9a3a', '#4aa84a']), null, true));
    along(60, 1.2, 1.2, (x, z) => put('box', '#2f7a2a', x, 0.6, z, 1.4, 1.2, 1.4));
    along(24, 3, 8, bench); along(22, 1.5, 2.5, (x, z) => lamp(x, z, 4.5, '#fff8e0'));
    along(40, 3, 14, (x, z) => { for (let q = 0; q < 5; q++) put('sph', pick(['#ff4a8a', '#ffd040', '#ff8a2a', '#b07aff', '#ffffff']), x + ra(-1.6, 1.6), 0.35, z + ra(-1.6, 1.6), 0.4, 0.3, 0.4); });
    for (let k = 0; k < 3; k++) { const i = Math.floor(tr.N * (0.15 + k * 0.3)), s = k % 2 ? 1 : -1, off = tr.wallD + 18, x = tr.P[i * 2] + tr.Nm[i * 2] * s * off, z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * off; fountain(x, z); }
    { const i = Math.floor(tr.N * 0.62), off = tr.wallD + 24, x = tr.P[i * 2] - tr.Nm[i * 2] * off, z = tr.P[i * 2 + 1] - tr.Nm[i * 2 + 1] * off; put('cyl', '#ffffff', x, 0.4, z, 7, 0.8); for (let q = 0; q < 8; q++) { const b = q / 8 * PI2; put('cyl', '#ffffff', x + Math.cos(b) * 6, 3.6, z + Math.sin(b) * 6, 0.25, 6.4); } put('cone', '#3a8a5a', x, 8.6, z, 8, 3.6); put('sph', '#ffd040', x, 10.6, z, 0.6, null, null, 0, true); }
    const pig = []; for (let k = 0; k < 14; k++) { const g = grp(CX + ra(-R0, R0) * 0.8, ra(16, 30), CZ + ra(-R0, R0) * 0.8); mesh(g, 'sph', '#9aa0b0', 0, 0, 0, 0.6, 0.45, 0.8); [-1, 1].forEach(s => mesh(g, 'box', '#8a90a0', s * 0.8, 0, 0, 1.2, 0.08, 0.5)); pig.push([g, k]); }
    anim.push(t => pig.forEach(([g, k]) => { const a = t * 0.3 + k; g.position.x += Math.cos(a) * 0.08; g.position.z += Math.sin(a) * 0.08; g.rotation.y = -a; g.children[1].rotation.z = Math.sin(t * 12 + k) * 0.5; g.children[2].rotation.z = -Math.sin(t * 12 + k) * 0.5; }));
    sun('#fff2b0', 260, 40); clouds(14);
  } else if (sc === 'mall') {
    along(46, 10, 30, (x, z, i) => { house(x, z, i, ['#e8e0f0', '#d8d0f0', '#f0e0f0', '#e0e8ff'], '#bfb6cc', 14, 26, true); put('box', pick(['#ff2d95', '#00e5ff', '#ffd24a', '#7cff6a']), x, 1.6, z, 8.3, 0.9, 6, face(i), true); });
    along(36, 2.5, 6, (x, z) => palm(x, z, true)); along(30, 1.5, 2.2, (x, z) => lamp(x, z, 6, '#ffffff')); along(16, 3, 6, bench);
    along(10, 6, 12, (x, z, i) => { const ry = face(i); put('box', '#c0c8d8', x, 3, z, 2.4, 0.4, 9, ry, false, -0.55); put('box', '#00e5ff', x, 3.25, z, 2.5, 0.08, 9.1, ry, true, -0.55); });
    along(14, 4, 9, (x, z, i) => { const ry = face(i); put('box', '#ffffff', x, 2.2, z, 0.3, 3, 2, ry); put('box', pick(['#ff2d95', '#00e5ff', '#ffd24a']), x, 2.2, z, 0.34, 2.4, 1.6, ry, true); });
    points(220, 0xffd0f8, 1.2, R0 + 120, 4, 26, 1);
    clouds(8, 0xffe8ff);
  } else if (sc === 'strand') {
    land(d.land || '#f0d898', 46);
    { const g = grp(CX, -0.02, CZ), sea = mesh(g, 'box', '#2a8ad0', 0, 0, 0, 3000, 0.05, 3000); sea.position.y = -0.12; sea.material.transparent = true; sea.material.opacity = 0.92; anim.push(t => { sea.position.y = -0.12 + Math.sin(t * 0.8) * 0.04; }); }
    along(60, 4, 30, (x, z) => palm(x, z)); along(48, 3, 20, (x, z, i) => { const ry = face(i) + (R() < 0.5 ? 0 : Math.PI); put('box', '#ffffff', x, 0.8, z, 1.2, 1.6, 1.6, ry); put('box', pick(['#3a8ae8', '#e84a5a', '#40c070']), x, 1.6, z, 1.25, 1.3, 1.7, ry); });
    along(22, 1.5, 2.5, (x, z) => lamp(x, z, 5, '#fff0c8')); along(16, 3, 7, bench);
    along(20, 8, 20, (x, z) => { const c = pick(['#ff4a8a', '#ffd040', '#3a8ae8', '#40c070']); put('cyl', '#ffffff', x, 1.6, z, 0.06, 3.2); put('cone', c, x, 3.4, z, 2.2, 0.9); });
    free(10, 60, R0 + 40, R0 + 220, (x, z) => { put('box', '#ffffff', x, 0.6, z, 1.4, 0.8, 4); put('cyl', '#6a4a2a', x, 3, z, 0.08, 4.5); put('cone', '#ff6a4a', x + 0.6, 3.4, z, 0.1, 3, 1.2); });
    const gull = []; for (let k = 0; k < 16; k++) { const g = grp(CX, ra(14, 34), CZ); [-1, 1].forEach(s => mesh(g, 'box', '#ffffff', s * 0.9, 0, 0, 1.6, 0.08, 0.45)); mesh(g, 'sph', '#ffffff', 0, 0, 0, 0.35, 0.3, 0.7); gull.push([g, k, ra(R0 * 0.3, R0 * 1.1)]); }
    anim.push(t => gull.forEach(([g, k, r]) => { const a = t * 0.12 + k * 0.4; g.position.x = CX + Math.cos(a) * r; g.position.z = CZ + Math.sin(a) * r; g.rotation.y = -a; g.children[0].rotation.z = Math.sin(t * 6 + k) * 0.4; g.children[1].rotation.z = -Math.sin(t * 6 + k) * 0.4; }));
    sun('#ffb060', 40, 70); clouds(10, 0xffe0c8);
  } else if (sc === 'xmas') {
    along(50, 10, 26, (x, z, i) => house(x, z, i, ['#a8443a', '#c8a070', '#8a6a4a', '#e8d8c0'], '#ffffff', 8, 14));
    along(40, 2.5, 7, (x, z, i) => stall(x, z, i, ['#d0202a', '#ffffff', '#2a7a3a']));
    along(20, 4, 14, (x, z) => xtree(x, z, ra(0.8, 1.3))); along(14, 3, 10, snowman); along(30, 1.5, 2.5, (x, z) => lamp(x, z, 4.5, '#ffcc66'));
    along(80, 0.8, 0.8, (x, z, i) => put('sph', ['#ff3a3a', '#ffd040', '#5ab0ff', '#7cff6a'][i % 4], x, 1.6, z, 0.18, null, null, 0, true));
    { const i = Math.floor(tr.N * 0.55), off = tr.wallD + 30, x = tr.P[i * 2] + tr.Nm[i * 2] * off, z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * off; xtree(x, z, 3.2); }
    free(60, 20, R0 * 0.2, R0 + 260, (x, z) => xtree(x, z, ra(1, 1.8)));
    const snow = points(900, 0xffffff, 1.3, R0 + 200, 0, 60); anim.push(t => { snow.position.y = -((t * 4) % 60) + 30; });
    points(400, 0xffffff, 2.4, 950, 220, 450);
  } else if (sc === 'grusel') {
    along(70, 4, 30, (x, z, i) => { const ry = face(i); put('box', '#8a8a96', x, 0.9, z, 0.3, 1.8, 1.2, ry); put('cyl', '#8a8a96', x, 1.8, z, 0.6, 0.3, 0.6, ry, false, Math.PI / 2); });
    along(40, 2, 16, (x, z) => { put('sph', '#ff7a1a', x, 0.6, z, 0.9, 0.65, 0.9); put('cyl', '#3a6a2a', x, 1.3, z, 0.1, 0.4); put('sph', '#ffe060', x, 0.7, z, 0.4, 0.3, 0.95, 0, true); });
    along(40, 6, 36, (x, z) => { put('cyl', '#3a2a2a', x, 2.5, z, 0.3, 5); for (let q = 0; q < 4; q++) put('cyl', '#3a2a2a', x + Math.cos(q * 1.6) * 0.8, 4 + q * 0.3, z + Math.sin(q * 1.6) * 0.8, 0.1, 2, null, q * 1.6, false, 0.9); });
    along(24, 1.5, 2.5, (x, z) => lamp(x, z, 4.5, '#b48aff'));
    { const i = Math.floor(tr.N * 0.3), off = tr.wallD + 40, x = tr.P[i * 2] - tr.Nm[i * 2] * off, z = tr.P[i * 2 + 1] - tr.Nm[i * 2 + 1] * off, ry = face(i); put('box', '#4a3a5a', x, 9, z, 18, 18, 46, ry); put('pyr', '#1a1424', x, 22, z, 14, 8, 34, ry); for (let f = 0; f < 4; f++) put('box', '#ffd88a', x, 3 + f * 4, z, 18.2, 1.4, 40, ry, true); }
    const gh = []; for (let k = 0; k < 12; k++) { const g = grp(0, 0, 0); mesh(g, 'sph', '#e8f0ff', 0, 0, 0, 1.4, 1.8, 1.4, true); mesh(g, 'cone', '#e8f0ff', 0, -1.8, 0, 1.4, 1.6, 1.4, true); [-1, 1].forEach(s => mesh(g, 'sph', '#1a1030', s * 0.5, 0.4, 1.2, 0.22)); gh.push([g, k, ra(R0 * 0.2, R0 * 1.1), ra(8, 18)]); }
    anim.push(t => gh.forEach(([g, k, r, y]) => { const a = t * 0.15 + k * 0.52; g.position.set(CX + Math.cos(a) * r, y + Math.sin(t * 1.4 + k) * 1.5, CZ + Math.sin(a) * r); g.rotation.y = -a; }));
    sun('#fff4cf', 260, 22); points(500, 0xffffff, 2, 950, 220, 480); points(160, 0xb48aff, 1.6, R0 + 120, 1, 12, 1);
  }
};
// Oma-Namen der Items und Sprüche (nur Anzeige; die Rennsimulation bleibt gleich)
window.OMA = (() => {
  const ITEM = { boost: 'Rheuma-Rakete', boost3: 'Rheuma-Raketen-Trio', banana: 'Gebiss', banana3: 'Gebiss-Trio', rock: 'Handtasche', rock3: 'Handtaschen-Trio', mine: 'Wollknäuel', rocket: 'Pralinen-Lenkrakete', shield: 'Regenschirm', flash: 'Hörgeräte-Pfiff', fog: 'Puderwolke' };
  const SAYS = {
    hit: ['Unverschämtheit!', 'Na warte, Freundchen!', 'Meine Hüfte!', 'Das sag ich deiner Mutter!', 'Rüpel!', 'Mein Gebiss!'],
    use: ['Da hast du!', 'Nimm das, Jungspund!', 'Huch, wie ungeschickt von mir!', 'Ups!'],
    boost: ['Huiii!', 'Vollgas, Erwin!', 'Jetzt geht die Post ab!'],
    win: ['Das hab ich schon 1962 gekonnt!', 'Und jetzt Kaffee und Kuchen!', 'Gewonnen – und kein bisschen außer Atem!'],
    lose: ['Nächstes Mal nehm ich die Abkürzung.', 'Mein Rollator war nicht aufgepumpt!', 'Pff, Anfängerglück.']
  };
  const is = c => !!c && c.ac === 'oma';
  return { ITEM, SAYS, is, item: (c, it, fb) => (is(c) && ITEM[it]) || fb, say: (c, kind) => is(c) && SAYS[kind] ? SAYS[kind][Math.floor(Math.random() * SAYS[kind].length)] : '' };
})();
