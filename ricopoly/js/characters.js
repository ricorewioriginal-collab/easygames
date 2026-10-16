/*! RicoPoly 3D – 16 eigene, prozedural modellierte und animierte 3D-Spielfiguren (Three.js r128).
 * Jede Figur ist ein Gelenk-Gerüst (Hüfte, Rumpf, Kopf, Arme, Beine bzw. Flügel, Schwanz, Rad) aus einfachen Formen.
 * Animationen werden pro Körperbau berechnet (Mensch, Android, Drache, Katzenwesen, Roboter) und weich überblendet. */
(function (root) {
  'use strict';
  var T = root.THREE;

  var LIST = [
    { id: 'businessman', kind: 'human', group: 'human', de: 'Geschäftsmann', en: 'Businessman', skin: '#f1c7a5', c1: '#2d3a5c', c2: '#d64545', hair: '#3b2a20' },
    { id: 'businesswoman', kind: 'human', group: 'human', de: 'Geschäftsfrau', en: 'Businesswoman', skin: '#e8b48f', c1: '#7a2f5c', c2: '#f4f0e8', hair: '#5a3020', fem: true },
    { id: 'adventurer', kind: 'human', group: 'human', de: 'Abenteurer', en: 'Adventurer', skin: '#d9a07a', c1: '#8a6b3d', c2: '#3f6b3a', hair: '#2b1d14' },
    { id: 'adventuress', kind: 'human', group: 'human', de: 'Abenteurerin', en: 'Adventuress', skin: '#c98d68', c1: '#3c7a8a', c2: '#c9853b', hair: '#8a3b1f', fem: true },
    { id: 'king', kind: 'human', group: 'human', de: 'König', en: 'King', skin: '#f0c4a0', c1: '#8b1d2c', c2: '#f2c94c', hair: '#c9c0b0' },
    { id: 'queen', kind: 'human', group: 'human', de: 'Königin', en: 'Queen', skin: '#f5d0b5', c1: '#4b2c8a', c2: '#f2c94c', hair: '#e3c26b', fem: true },
    { id: 'pirate', kind: 'human', group: 'human', de: 'Pirat', en: 'Pirate', skin: '#c88f6a', c1: '#b3262d', c2: '#20242e', hair: '#1b1b1b' },
    { id: 'detective', kind: 'human', group: 'human', de: 'Detektiv', en: 'Detective', skin: '#efc39f', c1: '#9c7b52', c2: '#5b4a35', hair: '#4a3626' },
    { id: 'dragon', kind: 'dragon', group: 'fantasy', de: 'Kleiner Drache', en: 'Little Dragon', skin: '#4fbf5a', c1: '#4fbf5a', c2: '#f5d76e', hair: '#ff8a3d' },
    { id: 'wizard', kind: 'human', group: 'fantasy', de: 'Zauberer', en: 'Wizard', skin: '#f0c8a8', c1: '#3446a8', c2: '#f2d45c', hair: '#e8e8f0' },
    { id: 'elf', kind: 'human', group: 'fantasy', de: 'Elfenkriegerin', en: 'Elf Warrior', skin: '#f6dcc4', c1: '#2f7a46', c2: '#c9b26b', hair: '#f3e3a6', fem: true },
    { id: 'goblin', kind: 'human', group: 'fantasy', de: 'Kobold', en: 'Goblin', skin: '#7cbf4a', c1: '#7a4a2a', c2: '#c9a24a', hair: '#3a2a1a', small: true },
    { id: 'knight', kind: 'human', group: 'fantasy', de: 'Ritter', en: 'Knight', skin: '#e9be98', c1: '#aeb7c4', c2: '#2b5fd9', hair: '#5a4630' },
    { id: 'cat', kind: 'cat', group: 'fantasy', de: 'Magisches Katzenwesen', en: 'Magic Cat Creature', skin: '#b58cff', c1: '#b58cff', c2: '#7af0ff', hair: '#ffffff' },
    { id: 'robot', kind: 'robot', group: 'scifi', de: 'Freundlicher Roboter', en: 'Friendly Robot', skin: '#e6edf5', c1: '#e6edf5', c2: '#38c6ff', hair: '#ff9e28' },
    { id: 'android', kind: 'android', group: 'scifi', de: 'Futuristischer Android', en: 'Futuristic Android', skin: '#d8e2ee', c1: '#f4f7fb', c2: '#38e1ff', hair: '#1c2233' }
  ];
  var BY = {}; LIST.forEach(function (c) { BY[c.id] = c; });
  var STATES = ['idle', 'walk', 'run', 'jump', 'cheer', 'lose', 'angry', 'roll', 'think', 'pay', 'buy', 'surprised', 'jail', 'jailReturn', 'victory'];
  var EMOTES = ['wave', 'dance', 'bow', 'laugh', 'shrug'];
  var ACCESSORIES = ['none', 'scarf', 'glasses', 'backpack', 'flower', 'headphones'];
  var OUTFITS = 3, POSES = 3;
  var LOCKED = { dragon: 'first_game', knight: 'first_group', cat: 'trade_ok', android: 'first_win' };   // kosmetische Freischaltungen über Erfolge

  // ---------- Geometrie- und Material-Cache (schont Speicher, jede Form gibt es nur einmal) ----------
  var GC = {}, MC = {};
  function geo(key, make) { return GC[key] || (GC[key] = make()); }
  function mat(color, o) {
    o = o || {};
    var k = color + '|' + (o.m || 0) + '|' + (o.r == null ? 0.6 : o.r) + '|' + (o.e || '') + '|' + (o.flat ? 1 : 0);
    if (MC[k]) return MC[k];
    var m = new T.MeshStandardMaterial({ color: new T.Color(color), metalness: o.m || 0, roughness: o.r == null ? 0.6 : o.r, flatShading: !!o.flat });
    if (o.e) { m.emissive = new T.Color(o.e); m.emissiveIntensity = o.ei || 1; }
    return (MC[k] = m);
  }
  function sphere(r, seg) { return geo('s' + r + ':' + (seg || 16), function () { return new T.SphereGeometry(r, seg || 16, Math.max(8, (seg || 16) * 0.75 | 0)); }); }
  function cyl(rt, rb, h, seg) { return geo('c' + rt + ':' + rb + ':' + h + ':' + (seg || 14), function () { return new T.CylinderGeometry(rt, rb, h, seg || 14); }); }
  function box(w, h, d) { return geo('b' + w + ':' + h + ':' + d, function () { return new T.BoxGeometry(w, h, d); }); }
  function cone(r, h, seg) { return geo('k' + r + ':' + h + ':' + (seg || 14), function () { return new T.ConeGeometry(r, h, seg || 14); }); }
  function torus(r, t) { return geo('t' + r + ':' + t, function () { return new T.TorusGeometry(r, t, 8, 20); }); }
  function mesh(g, m, x, y, z) { var o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; return o; }
  function rot(o, axis, v) { o.rotation[axis] = v; return o; }
  function pivot(parent, x, y, z) { var o = new T.Object3D(); o.position.set(x, y, z); parent.add(o); return o; }
  // Gliedmaße: Zylinder, der vom Gelenk nach unten hängt
  function limb(parent, len, r, m) { var o = mesh(cyl(r, r * 0.85, len, 10), m, 0, -len / 2, 0); parent.add(o); return o; }

  function lookOf(def, look) {
    look = look || {};
    return { c1: look.c1 || def.c1, c2: look.c2 || def.c2, outfit: (look.outfit | 0) % OUTFITS, acc: ACCESSORIES.indexOf(look.acc) >= 0 ? look.acc : 'none', pose: (look.pose | 0) % POSES, emote: EMOTES.indexOf(look.emote) >= 0 ? look.emote : 'wave' };
  }

  // ---------- Gesicht ----------
  function face(head, r, def, opt) {
    var eye = mat('#1b1b25', { r: 0.3 }), white = mat('#ffffff', { r: 0.4 });
    [-1, 1].forEach(function (s) {
      var w = mesh(sphere(r * 0.22, 10), white, s * r * 0.36, r * 0.12, r * 0.82); w.scale.z = 0.5; head.add(w);
      var p = mesh(sphere(r * 0.12, 8), eye, s * r * 0.36, r * 0.12, r * 0.93); head.add(p);
    });
    if (!opt || !opt.noMouth) { var m = mesh(torus(r * 0.16, r * 0.03), mat('#6b2a2a'), 0, -r * 0.3, r * 0.86); m.rotation.z = Math.PI; m.scale.y = 0.6; head.add(m); head.userData.mouth = m; }
    if (!opt || !opt.noNose) head.add(mesh(sphere(r * 0.1, 8), mat(def.skin), 0, -r * 0.05, r * 0.98));
  }

  // ---------- Mensch / Android ----------
  function buildBiped(def, L) {
    var g = new T.Group(), S = def.small ? 0.82 : 1, rig = { kind: def.kind, j: {}, def: def };
    var skin = mat(def.skin, { r: 0.7 }), c1 = mat(L.c1, { r: def.id === 'knight' ? 0.35 : 0.65, m: def.id === 'knight' ? 0.7 : 0 }), c2 = mat(L.c2, { r: 0.5 });
    var hair = mat(def.hair, { r: 0.8 }), dark = mat('#2a2a33', { r: 0.7 }), shoe = mat('#2b211c', { r: 0.6 });
    var andr = def.kind === 'android';
    if (andr) { skin = mat(def.skin, { r: 0.25, m: 0.4 }); c1 = mat(L.c1, { r: 0.2, m: 0.5 }); c2 = mat(L.c2, { r: 0.2, e: L.c2, ei: 1.2 }); }
    var root = new T.Group(); root.scale.setScalar(S); g.add(root);
    var hips = pivot(root, 0, 0.42, 0); rig.j.hips = hips;
    // Beine
    ['l', 'r'].forEach(function (side, k) {
      var sx = k ? -0.085 : 0.085;
      var leg = pivot(hips, sx, 0, 0); limb(leg, 0.2, 0.05, andr ? c1 : (def.fem && L.outfit !== 1 ? skin : dark));
      var knee = pivot(leg, 0, -0.2, 0); limb(knee, 0.19, 0.045, andr ? skin : (def.fem && L.outfit !== 1 ? skin : dark));
      var foot = mesh(box(0.09, 0.05, 0.15), andr ? c2 : shoe, 0, -0.2, 0.03); knee.add(foot);
      rig.j[side + 'Leg'] = leg; rig.j[side + 'Knee'] = knee;
    });
    // Rumpf
    var torso = pivot(hips, 0, 0, 0); rig.j.torso = torso;
    var body = mesh(cyl(0.13, 0.115, 0.36, 16), c1, 0, 0.18, 0); torso.add(body);
    torso.add(mesh(sphere(0.13, 14), c1, 0, 0.36, 0));
    var longRobe = def.id === 'wizard' || def.id === 'queen' || (def.id === 'detective' && L.outfit !== 2) || (def.fem && L.outfit === 0 && def.id !== 'elf');
    if (longRobe) { var robe = mesh(cone(0.24, 0.42, 18), def.id === 'detective' ? c1 : c1, 0, -0.04, 0); robe.rotation.y = 0.2; torso.add(robe); }
    else if (def.fem && L.outfit === 2) { torso.add(mesh(cone(0.19, 0.2, 16), c2, 0, 0.0, 0)); }
    // Kleidungsdetails
    if (def.id === 'businessman' || def.id === 'businesswoman') {
      var tie = mesh(box(0.035, 0.18, 0.02), c2, 0, 0.25, 0.125); torso.add(tie);
      if (L.outfit === 2) torso.add(mesh(box(0.27, 0.05, 0.25), c2, 0, 0.05, 0));
    }
    if (def.id === 'king' || def.id === 'queen' || (def.id === 'wizard' && L.outfit === 1)) {   // Umhang
      var cape = mesh(box(0.32, 0.5, 0.03), mat(def.id === 'wizard' ? L.c2 : L.c1, { r: 0.8 }), 0, 0.1, -0.13); cape.rotation.x = 0.12; torso.add(cape); rig.j.cape = cape;
      torso.add(rot(mesh(torus(0.13, 0.03), mat('#ffffff', { r: 0.9 }), 0, 0.36, 0), 'x', Math.PI / 2));
    }
    if (def.id === 'knight') { torso.add(mesh(box(0.2, 0.22, 0.03), c2, 0, 0.2, 0.125)); var belt = mesh(cyl(0.135, 0.135, 0.04, 16), dark, 0, 0.04, 0); torso.add(belt); }
    if (def.id === 'pirate') { torso.add(mesh(cyl(0.135, 0.135, 0.05, 16), dark, 0, 0.06, 0)); torso.add(mesh(box(0.05, 0.05, 0.02), mat('#f2c94c', { m: 0.8, r: 0.3 }), 0, 0.06, 0.135)); }
    if (def.id === 'adventurer' || def.id === 'adventuress' || L.acc === 'backpack') { var bp = mesh(box(0.2, 0.24, 0.1), mat(def.id === 'adventurer' ? '#6b4a2b' : L.c2), 0, 0.2, -0.16); torso.add(bp); }
    if (def.id === 'elf') { var bow = mesh(torus(0.2, 0.012), mat('#7a5230'), 0.02, 0.22, -0.15); bow.rotation.y = Math.PI / 2; bow.scale.y = 1.4; torso.add(bow); }
    if (andr) { [-1, 1].forEach(function (s) { torso.add(mesh(box(0.012, 0.3, 0.012), c2, s * 0.07, 0.2, 0.122)); }); torso.add(mesh(sphere(0.035, 10), c2, 0, 0.27, 0.13)); }
    // Arme
    ['l', 'r'].forEach(function (side, k) {
      var sx = k ? -0.165 : 0.165;
      var arm = pivot(torso, sx, 0.34, 0); limb(arm, 0.17, 0.042, c1);
      arm.add(mesh(sphere(0.05, 10), c1, 0, 0, 0));
      var fore = pivot(arm, 0, -0.17, 0); limb(fore, 0.15, 0.038, def.id === 'knight' || andr ? c1 : (def.fem && L.outfit === 2 ? skin : c1));
      var hand = mesh(sphere(0.045, 10), andr ? c2 : (def.id === 'knight' ? c1 : skin), 0, -0.17, 0); fore.add(hand);
      rig.j[side + 'Arm'] = arm; rig.j[side + 'Fore'] = fore; rig.j[side + 'Hand'] = hand;
    });
    // Gegenstände in der Hand
    var rh = rig.j.rFore;
    if (def.id === 'wizard') { var staff = mesh(cyl(0.015, 0.015, 0.7, 8), mat('#7a5230'), 0, -0.1, 0.03); rh.add(staff); rh.add(mesh(sphere(0.05, 12), mat('#9ff', { e: '#5ff', ei: 1.5 }), 0, 0.26, 0.03)); }
    if (def.id === 'knight') { var sword = mesh(box(0.025, 0.36, 0.01), mat('#dfe6ee', { m: 0.9, r: 0.2 }), 0, -0.32, 0.05); rh.add(sword); rh.add(mesh(box(0.1, 0.02, 0.03), mat('#c9a24a', { m: 0.8, r: 0.3 }), 0, -0.16, 0.05));
      var shield = mesh(cyl(0.12, 0.12, 0.025, 18), c2, 0.05, -0.1, 0); shield.rotation.z = Math.PI / 2; rig.j.lFore.add(shield); }
    if (def.id === 'detective') { var mg = mesh(torus(0.045, 0.01), mat('#c9a24a', { m: 0.8, r: 0.3 }), 0, -0.24, 0.02); rh.add(mg); }
    if (def.id === 'pirate') { var hook = mesh(torus(0.035, 0.008), mat('#cfd6de', { m: 0.9, r: 0.2 }), 0, -0.2, 0); rig.j.lFore.add(hook); }
    // Kopf
    var neck = pivot(torso, 0, 0.42, 0); var head = pivot(neck, 0, 0.13, 0); rig.j.head = head;
    var R = def.small ? 0.17 : 0.155;
    if (andr) { head.add(mesh(sphere(R, 18), skin, 0, 0, 0)); var visor = mesh(box(R * 1.5, R * 0.42, 0.05), mat('#101828', { r: 0.1, m: 0.6 }), 0, R * 0.12, R * 0.85); head.add(visor);
      [-1, 1].forEach(function (s) { head.add(mesh(sphere(R * 0.12, 8), c2, s * R * 0.32, R * 0.12, R * 0.9)); });
      head.add(rot(mesh(box(0.012, R * 1.3, 0.012), c2, 0, R * 0.2, -R * 0.2), 'x', -0.3));
    } else {
      head.add(mesh(sphere(R, 20), skin, 0, 0, 0));
      face(head, R, def);
      if (def.id === 'goblin' || def.id === 'elf') [-1, 1].forEach(function (s) { var ear = mesh(cone(0.045, def.id === 'goblin' ? 0.2 : 0.14, 8), skin, s * R * 1.05, R * 0.15, 0); ear.rotation.z = -s * 1.25; head.add(ear); });
      if (def.id === 'goblin') { var nose = mesh(cone(0.04, 0.1, 8), skin, 0, -0.01, R * 1.05); nose.rotation.x = Math.PI / 2; head.add(nose); }
      // Haare
      var hairCap = mesh(sphere(R * 1.04, 18), hair, 0, R * 0.12, -R * 0.08); hairCap.scale.set(1, 0.82, 1); head.add(hairCap);
      if (def.fem && def.id !== 'knight') {
        if (def.id === 'businesswoman') head.add(mesh(sphere(R * 0.45, 12), hair, 0, R * 0.55, -R * 0.75));
        else if (def.id === 'adventuress') { var pt = mesh(cone(R * 0.3, R * 1.4, 10), hair, 0, -R * 0.2, -R * 1.05); pt.rotation.x = -2.6; head.add(pt); }
        else { var lh = mesh(cyl(R * 0.9, R * 1.0, R * 1.5, 16), hair, 0, -R * 0.55, -R * 0.25); head.add(lh); }
      }
      if (def.id === 'king' || def.id === 'wizard' || def.id === 'pirate') { var beard = mesh(cone(R * 0.55, R * (def.id === 'wizard' ? 1.6 : 0.8), 12), hair, 0, -R * (def.id === 'wizard' ? 1.2 : 0.75), R * 0.55); beard.rotation.x = Math.PI; head.add(beard); }
    }
    // Kopfbedeckungen
    var gold = mat('#f2c94c', { m: 0.85, r: 0.25 });
    if (def.id === 'king') { var cr = mesh(cyl(R * 0.7, R * 0.75, R * 0.4, 14), gold, 0, R * 1.0, 0); head.add(cr); for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; head.add(mesh(cone(R * 0.12, R * 0.3, 6), gold, Math.cos(a) * R * 0.68, R * 1.32, Math.sin(a) * R * 0.68)); } head.add(mesh(sphere(R * 0.12, 8), mat('#d6223b', { r: 0.2 }), 0, R * 1.0, R * 0.72)); }
    if (def.id === 'queen') { var ti = mesh(torus(R * 0.62, R * 0.07), gold, 0, R * 0.92, 0); ti.rotation.x = Math.PI / 2; head.add(ti); head.add(mesh(cone(R * 0.15, R * 0.4, 6), gold, 0, R * 1.12, R * 0.55)); head.add(mesh(sphere(R * 0.1, 8), mat('#7af0ff', { r: 0.1 }), 0, R * 1.12, R * 0.66)); }
    if (def.id === 'wizard') { var wh = mesh(cone(R * 1.0, R * 2.6, 16), c1, 0, R * 1.7, -R * 0.1); wh.rotation.x = -0.15; head.add(wh); var brim = mesh(cyl(R * 1.5, R * 1.5, 0.02, 20), c1, 0, R * 0.55, 0); head.add(brim); head.add(mesh(sphere(R * 0.14, 8), mat('#fff6a8', { e: '#ffd23f', ei: 1 }), 0, R * 1.6, R * 0.55)); }
    if (def.id === 'pirate') { var ph = mesh(cyl(R * 1.25, R * 1.25, 0.03, 3), mat('#1b1b1b'), 0, R * 0.75, 0); ph.rotation.y = Math.PI / 6; head.add(ph); head.add(mesh(cyl(R * 0.75, R * 0.85, R * 0.5, 14), mat('#1b1b1b'), 0, R * 0.95, 0)); head.add(mesh(sphere(R * 0.12, 8), mat('#ffffff'), 0, R * 1.0, R * 0.78));
      var patch = mesh(cyl(R * 0.2, R * 0.2, 0.02, 12), mat('#111'), R * 0.36, R * 0.12, R * 0.98); patch.rotation.x = Math.PI / 2; head.add(patch); }
    if (def.id === 'detective') { var dh = mesh(cyl(R * 0.95, R * 1.0, R * 0.55, 16), c2, 0, R * 0.78, 0); head.add(dh); var db = mesh(cyl(R * 1.35, R * 1.35, 0.02, 20), c2, 0, R * 0.55, 0); head.add(db); }
    if (def.id === 'adventurer') { head.add(mesh(cyl(R * 0.85, R * 0.95, R * 0.5, 14), mat('#7a5230'), 0, R * 0.85, 0)); head.add(mesh(cyl(R * 1.5, R * 1.5, 0.02, 20), mat('#7a5230'), 0, R * 0.62, 0)); }
    if (def.id === 'adventuress') { var band = mesh(torus(R * 0.98, R * 0.08), c2, 0, R * 0.35, 0); band.rotation.x = Math.PI / 2 - 0.2; head.add(band); }
    if (def.id === 'knight') { var helm = mesh(cyl(R * 1.05, R * 1.08, R * 1.5, 16), c1, 0, R * 0.25, 0); head.add(helm); head.add(mesh(box(R * 1.4, R * 0.12, 0.02), mat('#111'), 0, R * 0.2, R * 1.06));
      var plume = mesh(cone(R * 0.25, R * 1.0, 8), c2, 0, R * 1.35, -R * 0.2); plume.rotation.x = -0.5; head.add(plume); }
    if (def.id === 'elf') { var circ = mesh(torus(R * 0.98, R * 0.04), mat(L.c2, { m: 0.8, r: 0.3 }), 0, R * 0.35, 0); circ.rotation.x = Math.PI / 2; head.add(circ); }
    if (def.id === 'goblin') { head.add(mesh(cone(R * 0.9, R * 0.9, 10), c1, 0, R * 1.05, 0)); }
    accessory(rig, head, torso, R, L);
    rig.root = g;
    return rig;
  }

  function accessory(rig, head, torso, R, L) {
    if (L.acc === 'scarf') { var sc = mesh(torus(0.11, 0.035), mat(L.c2, { r: 0.9 }), 0, 0.4, 0); sc.rotation.x = Math.PI / 2; torso.add(sc); torso.add(mesh(box(0.06, 0.16, 0.03), mat(L.c2, { r: 0.9 }), 0.06, 0.3, 0.12)); }
    if (L.acc === 'glasses') { var gm = mat('#15151a', { r: 0.3 }); [-1, 1].forEach(function (s) { var gl = mesh(torus(R * 0.2, R * 0.03), gm, s * R * 0.36, R * 0.12, R * 0.98); head.add(gl); }); head.add(mesh(box(R * 0.3, R * 0.04, R * 0.04), gm, 0, R * 0.14, R * 1.0)); }
    if (L.acc === 'flower') { var fl = new T.Group(); fl.position.set(R * 0.65, R * 0.6, R * 0.35); head.add(fl); for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2; fl.add(mesh(sphere(R * 0.12, 8), mat('#ff7ab6'), Math.cos(a) * R * 0.14, Math.sin(a) * R * 0.14, 0)); } fl.add(mesh(sphere(R * 0.1, 8), mat('#ffd23f'), 0, 0, R * 0.04)); }
    if (L.acc === 'headphones') { var hm = mat('#22252e', { r: 0.4 }); var band = mesh(torus(R * 1.05, R * 0.06), hm, 0, R * 0.1, 0); head.add(band); [-1, 1].forEach(function (s) { var cup = mesh(cyl(R * 0.3, R * 0.3, R * 0.2, 14), mat(L.c2, { r: 0.4 }), s * R * 1.02, 0, 0); cup.rotation.z = Math.PI / 2; head.add(cup); }); }
  }

  // ---------- Vierbeiner: Drache und Katzenwesen ----------
  function buildQuad(def, L) {
    var g = new T.Group(), rig = { kind: def.kind, j: {}, def: def }, dragon = def.kind === 'dragon';
    var c1 = mat(L.c1, { r: dragon ? 0.45 : 0.85, flat: dragon }), c2 = mat(L.c2, { r: 0.5 }), dark = mat('#1d1d25');
    var hips = pivot(g, 0, dragon ? 0.34 : 0.32, 0); rig.j.hips = hips;
    var body = mesh(sphere(dragon ? 0.22 : 0.18, 16), c1, 0, 0, 0); body.scale.set(dragon ? 0.95 : 0.85, dragon ? 0.85 : 0.75, 1.35); hips.add(body); rig.j.torso = body;
    var belly = mesh(sphere(dragon ? 0.19 : 0.14, 14), c2, 0, -0.05, 0.02); belly.scale.set(0.85, 0.7, 1.25); hips.add(belly);
    // Beine (vorne/hinten)
    [['fl', 0.12, 0.17], ['fr', -0.12, 0.17], ['bl', 0.12, -0.17], ['br', -0.12, -0.17]].forEach(function (d) {
      var leg = pivot(hips, d[1], -0.06, d[2] * (dragon ? 1.1 : 1.15)); limb(leg, 0.24, dragon ? 0.06 : 0.045, c1);
      leg.add(mesh(sphere(dragon ? 0.065 : 0.05, 10), c2, 0, -0.25, 0.02)); rig.j[d[0]] = leg;
    });
    // Hals und Kopf
    var neck = pivot(hips, 0, 0.08, dragon ? 0.25 : 0.2); rig.j.neck = neck;
    if (dragon) { var nm = mesh(cyl(0.08, 0.11, 0.24, 12), c1, 0, 0.1, 0.03); nm.rotation.x = 0.5; neck.add(nm); }
    var head = pivot(neck, 0, dragon ? 0.24 : 0.12, dragon ? 0.12 : 0.06); rig.j.head = head;
    var R = dragon ? 0.15 : 0.15;
    head.add(mesh(sphere(R, 18), c1, 0, 0, 0));
    if (dragon) {
      var snout = mesh(sphere(R * 0.75, 14), c1, 0, -R * 0.25, R * 0.75); snout.scale.set(0.9, 0.7, 1.1); head.add(snout);
      [-1, 1].forEach(function (s) { head.add(mesh(sphere(R * 0.08, 6), dark, s * R * 0.25, -R * 0.1, R * 1.45)); var horn = mesh(cone(R * 0.16, R * 0.6, 8), mat('#fff2c4', { r: 0.4 }), s * R * 0.45, R * 0.7, -R * 0.35); horn.rotation.x = -0.6; head.add(horn); });
      for (var i = 0; i < 4; i++) { var sp = mesh(cone(0.035, 0.09, 6), mat(def.hair, { r: 0.5 }), 0, 0.17, 0.12 - i * 0.12); hips.add(sp); }
    } else {
      [-1, 1].forEach(function (s) { var ear = mesh(cone(R * 0.35, R * 0.7, 4), c1, s * R * 0.55, R * 0.8, 0); ear.rotation.z = -s * 0.3; head.add(ear); head.add(rot(mesh(cone(R * 0.2, R * 0.4, 4), mat('#ffc4e1'), s * R * 0.55, R * 0.78, R * 0.06), 'z', -s * 0.3)); });
      [-1, 1].forEach(function (s) { for (var k = 0; k < 2; k++) { var wh = mesh(box(R * 0.9, 0.006, 0.006), mat('#ffffff'), s * R * 0.75, -R * (0.15 + k * 0.12), R * 0.8); wh.rotation.z = s * (k ? -0.15 : 0.15); head.add(wh); } });
      var collar = mesh(torus(0.11, 0.02), c2, 0, 0.0, 0.0); collar.rotation.x = Math.PI / 2 - 0.4; neck.add(collar);
      neck.add(mesh(cone(0.04, 0.06, 5), mat('#ffe066', { e: '#ffcc00', ei: 0.8 }), 0, -0.06, 0.1));
    }
    face(head, R, { skin: L.c1 }, { noNose: dragon });
    // Schwanz aus Gliedern
    rig.j.tail = [];
    var prev = pivot(hips, 0, 0.04, dragon ? -0.27 : -0.22);
    for (var t = 0; t < (dragon ? 5 : 5); t++) {
      var seg = pivot(prev, 0, 0, t ? -0.09 : 0); var r = (dragon ? 0.07 : 0.035) * (1 - t * 0.14);
      var sm = mesh(sphere(r, 10), t === 4 && !dragon ? mat(L.c2, { e: L.c2, ei: 1.2 }) : c1, 0, 0, -0.05); seg.add(sm);
      rig.j.tail.push(seg); prev = seg;
    }
    if (dragon) { var tip = mesh(cone(0.06, 0.12, 4), mat(def.hair), 0, 0, -0.1); tip.rotation.x = -Math.PI / 2; prev.add(tip); }
    // Flügel (Drache)
    if (dragon) {
      rig.j.wings = [];
      [-1, 1].forEach(function (s) {
        var w = pivot(hips, s * 0.12, 0.14, 0.02);
        var shape = new T.Shape(); shape.moveTo(0, 0); shape.lineTo(0.42, 0.18); shape.lineTo(0.36, -0.04); shape.lineTo(0.26, 0.02); shape.lineTo(0.18, -0.08); shape.lineTo(0.08, -0.02); shape.lineTo(0, 0);
        var wg = geo('wing', function () { return new T.ShapeGeometry(shape); });
        var wm = new T.Mesh(wg, mat(L.c2, { r: 0.6 })); wm.material = wm.material.clone(); wm.material.side = T.DoubleSide; wm.castShadow = true;
        wm.rotation.x = -Math.PI / 2; if (s < 0) wm.scale.x = -1; w.add(wm); rig.j.wings.push(w);
      });
    }
    accessoryQuad(rig, head, R, L);
    rig.root = g;
    return rig;
  }
  function accessoryQuad(rig, head, R, L) {
    if (L.acc === 'glasses' || L.acc === 'flower' || L.acc === 'headphones') accessory(rig, head, new T.Object3D(), R, L);
    if (L.acc === 'scarf') { var sc = mesh(torus(0.12, 0.035), mat(L.c2, { r: 0.9 }), 0, 0, 0); sc.rotation.x = Math.PI / 2 - 0.4; rig.j.neck.add(sc); }
    if (L.acc === 'backpack') rig.j.hips.add(mesh(box(0.16, 0.12, 0.16), mat('#6b4a2b'), 0, 0.2, -0.05));
    if (L.outfit === 1) { var cape = mesh(box(0.3, 0.02, 0.32), mat(L.c2, { r: 0.8 }), 0, 0.19, -0.02); rig.j.hips.add(cape); }
    if (L.outfit === 2) { var crown = mesh(cyl(R * 0.4, R * 0.45, R * 0.3, 8), mat('#f2c94c', { m: 0.85, r: 0.25 }), 0, R * 1.0, 0); head.add(crown); }
  }

  // ---------- Roboter ----------
  function buildRobot(def, L) {
    var g = new T.Group(), rig = { kind: 'robot', j: {}, def: def };
    var c1 = mat(L.c1, { r: 0.3, m: 0.3 }), c2 = mat(L.c2, { r: 0.3, e: L.c2, ei: 0.6 }), dark = mat('#2a2f3a', { r: 0.4, m: 0.5 });
    var hips = pivot(g, 0, 0.16, 0); rig.j.hips = hips;
    var wheel = pivot(hips, 0, 0, 0); rig.j.wheel = wheel;
    var tire = mesh(torus(0.11, 0.045), dark, 0, 0, 0); tire.rotation.y = Math.PI / 2; wheel.add(tire);
    wheel.add(rot(mesh(cyl(0.07, 0.07, 0.06, 6), c2, 0, 0, 0), 'z', Math.PI / 2));
    var torso = pivot(hips, 0, 0.12, 0); rig.j.torso = torso;
    var body = mesh(box(0.34, 0.32, 0.26), c1, 0, 0.17, 0); torso.add(body);
    torso.add(mesh(box(0.2, 0.12, 0.02), mat('#101828', { r: 0.1 }), 0, 0.2, 0.135));
    for (var i = 0; i < 3; i++) torso.add(mesh(sphere(0.018, 6), mat(['#ff5a5a', '#ffd23f', '#5aff8c'][i], { e: ['#ff5a5a', '#ffd23f', '#5aff8c'][i], ei: 0.8 }), -0.05 + i * 0.05, 0.2, 0.15));
    if (L.outfit === 1) torso.add(mesh(box(0.36, 0.06, 0.28), c2, 0, 0.03, 0));
    if (L.outfit === 2) torso.add(rot(mesh(cyl(0.03, 0.03, 0.12, 8), c2, 0, 0.18, -0.18), 'x', Math.PI / 2));
    ['l', 'r'].forEach(function (side, k) {
      var s = k ? -1 : 1;
      var arm = pivot(torso, s * 0.2, 0.28, 0); arm.add(mesh(sphere(0.045, 10), dark));
      limb(arm, 0.16, 0.03, dark); var fore = pivot(arm, 0, -0.16, 0); limb(fore, 0.14, 0.028, c1);
      var claw = mesh(torus(0.035, 0.012), c2, 0, -0.16, 0); claw.rotation.y = Math.PI / 2; fore.add(claw);
      rig.j[side + 'Arm'] = arm; rig.j[side + 'Fore'] = fore;
    });
    var neck = pivot(torso, 0, 0.34, 0); neck.add(mesh(cyl(0.04, 0.05, 0.06, 10), dark, 0, 0.03, 0));
    var head = pivot(neck, 0, 0.14, 0); rig.j.head = head;
    var hb = mesh(box(0.3, 0.22, 0.22), c1, 0, 0, 0); head.add(hb);
    var screen = mesh(box(0.24, 0.15, 0.02), mat('#0b1220', { r: 0.1 }), 0, 0, 0.115); head.add(screen);
    var eyeM = new T.MeshBasicMaterial({ color: new T.Color(L.c2) });
    rig.eyes = [-1, 1].map(function (s) { var e = new T.Mesh(sphere(0.028, 10), eyeM); e.position.set(s * 0.055, 0.015, 0.127); e.scale.z = 0.3; head.add(e); return e; });
    var mouth = new T.Mesh(box(0.08, 0.012, 0.01), eyeM); mouth.position.set(0, -0.04, 0.127); head.add(mouth); head.userData.mouth = mouth;
    var ant = mesh(cyl(0.008, 0.008, 0.12, 6), dark, 0, 0.17, 0); head.add(ant);
    var bulb = mesh(sphere(0.03, 10), mat(def.hair, { e: def.hair, ei: 1.4 }), 0, 0.24, 0); head.add(bulb); rig.j.bulb = bulb;
    [-1, 1].forEach(function (s) { head.add(rot(mesh(cyl(0.04, 0.04, 0.03, 12), c2, s * 0.16, 0, 0), 'z', Math.PI / 2)); });
    if (L.acc === 'headphones' || L.acc === 'glasses' || L.acc === 'flower') accessory(rig, head, torso, 0.13, L);
    if (L.acc === 'scarf') { var sc = mesh(torus(0.07, 0.03), mat(L.c2, { r: 0.9 }), 0, 0.34, 0); sc.rotation.x = Math.PI / 2; torso.add(sc); }
    if (L.acc === 'backpack') torso.add(mesh(box(0.22, 0.22, 0.1), mat('#ff9e28'), 0, 0.18, -0.18));
    rig.root = g;
    return rig;
  }

  // ---------- Animation ----------
  var JOINTS = ['hips', 'torso', 'head', 'lArm', 'rArm', 'lFore', 'rFore', 'lLeg', 'rLeg', 'lKnee', 'rKnee', 'neck', 'fl', 'fr', 'bl', 'br', 'wheel'];
  function Character(id, look) {
    var def = BY[id] || BY.businessman, L = lookOf(def, look);
    var rig = def.kind === 'human' || def.kind === 'android' ? buildBiped(def, L) : def.kind === 'robot' ? buildRobot(def, L) : buildQuad(def, L);
    this.def = def; this.look = L; this.rig = rig; this.group = new T.Group(); this.group.add(rig.root);
    this.state = 'idle'; this.t = Math.random() * 10; this.st = 0; this.speed = 1; this.once = null; this.reduced = false;
    this.base = {};
    var j = rig.j, self = this;
    JOINTS.forEach(function (k) { if (j[k]) self.base[k] = { rx: j[k].rotation.x, ry: j[k].rotation.y, rz: j[k].rotation.z, y: j[k].position.y }; });
  }
  Character.prototype.play = function (state, opt) {
    if (state === this.state && !(opt && opt.restart)) return;
    this.state = state; this.st = 0; this.once = opt && opt.then ? opt.then : null; this.dur = opt && opt.dur || 0;
  };
  Character.prototype.dispose = function () { if (this.group.parent) this.group.parent.remove(this.group); };   // Geometrien/Materialien liegen im gemeinsamen Cache

  // Zielpose je Zustand: Werte sind Rotationen (Bogenmaß) bzw. Höhenversatz "lift"
  function poseBiped(c, P, t, st) {
    var s = c.state, L = c.look, sw, k;
    var andr = c.def.kind === 'android';
    var q = function (x) { return andr ? Math.round(x * 4) / 4 : x; };   // Android: mechanisch abgestufte Bewegung
    P.lift = 0; P.lean = 0;
    switch (s) {
      case 'idle':
        P.torso.rx = Math.sin(t * 1.6) * 0.02; P.head.ry = Math.sin(t * 0.5) * 0.35; P.head.rx = Math.sin(t * 0.7) * 0.05;
        P.lArm.rz = 0.12 + Math.sin(t * 1.6) * 0.03; P.rArm.rz = -0.12 - Math.sin(t * 1.6) * 0.03; P.lFore.rx = -0.15; P.rFore.rx = -0.15;
        P.lift = Math.sin(t * 1.6) * 0.004; break;
      case 'walk': case 'run':
        var f = s === 'run' ? 13 : 8.5, a = s === 'run' ? 0.95 : 0.6; sw = q(Math.sin(t * f));
        P.lLeg.rx = sw * a; P.rLeg.rx = -sw * a; P.lKnee.rx = Math.max(0, -Math.cos(t * f)) * a * 1.2; P.rKnee.rx = Math.max(0, Math.cos(t * f)) * a * 1.2;
        P.lArm.rx = -sw * a * 0.9; P.rArm.rx = sw * a * 0.9; P.lFore.rx = -0.5; P.rFore.rx = -0.5; P.lArm.rz = 0.1; P.rArm.rz = -0.1;
        P.lift = Math.abs(Math.sin(t * f)) * (s === 'run' ? 0.05 : 0.025); P.lean = s === 'run' ? 0.2 : 0.06; P.head.rx = -P.lean * 0.6; break;
      case 'jump':
        k = Math.sin(Math.min(1, st / 0.7) * Math.PI);
        P.lift = k * 0.35; P.lArm.rz = 0.3 + k * 2.4; P.rArm.rz = -0.3 - k * 2.4; P.lLeg.rx = -k * 0.6; P.rLeg.rx = -k * 0.6; P.lKnee.rx = k * 1.2; P.rKnee.rx = k * 1.2; break;
      case 'cheer':
        k = Math.abs(Math.sin(t * 7));
        P.lift = k * 0.12; P.lArm.rz = 2.6 + Math.sin(t * 14) * 0.25; P.rArm.rz = -2.6 - Math.sin(t * 14) * 0.25; P.lFore.rz = 0.3; P.rFore.rz = -0.3;
        P.head.rx = -0.25; P.lKnee.rx = (1 - k) * 0.4; P.rKnee.rx = (1 - k) * 0.4; P.lLeg.rx = -(1 - k) * 0.2; P.rLeg.rx = -(1 - k) * 0.2; break;
      case 'lose':
        P.head.rx = 0.55; P.torso.rx = 0.35; P.lArm.rz = 0.05; P.rArm.rz = -0.05; P.lArm.rx = 0.15; P.rArm.rx = 0.15;
        P.lLeg.rx = -0.5; P.rLeg.rx = -0.5; P.lKnee.rx = 0.9; P.rKnee.rx = 0.9; P.lift = -0.07; P.head.ry = Math.sin(t * 2) * 0.25; break;
      case 'angry':
        sw = Math.sin(t * 16);
        P.lArm.rx = -1.2 + sw * 0.25; P.rArm.rx = -1.2 - sw * 0.25; P.lFore.rx = -1.3; P.rFore.rx = -1.3; P.lArm.rz = 0.4; P.rArm.rz = -0.4;
        P.rLeg.rx = Math.max(0, Math.sin(t * 8)) * -0.6; P.rKnee.rx = Math.max(0, Math.sin(t * 8)) * 0.8; P.torso.rx = 0.12; P.head.rx = 0.15; P.head.rz = sw * 0.08; break;
      case 'roll':
        k = Math.min(1, st / 0.9);
        P.rArm.rx = k < 0.6 ? -0.5 - Math.sin(k / 0.6 * Math.PI * 2) * 1.6 : -2.2 + (k - 0.6) * 4; P.rFore.rx = -0.6; P.torso.ry = Math.sin(k * Math.PI) * -0.4;
        P.lArm.rz = 0.4; P.head.rx = 0.1; P.lLeg.rx = -0.2; P.rLeg.rx = 0.25; break;
      case 'think':
        P.rArm.rx = -1.0; P.rArm.rz = -0.2; P.rFore.rx = -2.1; P.rFore.ry = 0.3; P.head.rz = 0.2 + Math.sin(t * 1.2) * 0.06; P.head.rx = -0.1;
        P.lArm.rx = -0.4; P.lArm.rz = 0.3; P.lFore.rx = -1.2; P.lift = Math.sin(t * 1.5) * 0.004; break;
      case 'pay':
        k = Math.sin(Math.min(1, st / 0.6) * Math.PI / 2);
        P.rArm.rx = -1.3 * k; P.rFore.rx = -0.2; P.lArm.rz = 0.15; P.torso.rx = 0.12 * k; P.head.rx = 0.2; P.head.ry = Math.sin(t * 3) * 0.1; break;
      case 'buy':
        k = Math.sin(t * 10);
        P.lArm.rx = -1.2; P.rArm.rx = -1.2; P.lArm.rz = -0.35 + k * 0.15; P.rArm.rz = 0.35 - k * 0.15; P.lFore.rx = -0.6; P.rFore.rx = -0.6; P.lift = Math.abs(k) * 0.03; P.head.rx = -0.15; break;
      case 'surprised':
        k = Math.min(1, st / 0.25);
        P.lArm.rz = 1.3 * k; P.rArm.rz = -1.3 * k; P.lFore.rz = 0.6; P.rFore.rz = -0.6; P.head.rx = -0.3 * k; P.torso.rx = -0.15 * k; P.lift = Math.sin(Math.min(1, st / 0.4) * Math.PI) * 0.08; break;
      case 'jail':
        P.lArm.rx = 0.5; P.rArm.rx = 0.5; P.lArm.rz = -0.25; P.rArm.rz = 0.25; P.lFore.rx = -0.4; P.rFore.rx = -0.4; P.head.rx = 0.45; P.torso.rx = 0.1;
        P.head.ry = Math.sin(t * 0.8) * 0.2; P.lift = Math.sin(t * 1.0) * 0.004; break;
      case 'jailReturn':
        k = Math.sin(t * 3);
        P.lArm.rz = 2.4 + k * 0.1; P.rArm.rz = -2.4 - k * 0.1; P.lFore.rz = 0.5; P.rFore.rz = -0.5; P.torso.rx = -0.15; P.head.rx = -0.3; P.lift = Math.max(0, k) * 0.02; break;
      case 'victory':
        if (L.pose === 0) { k = Math.abs(Math.sin(t * 5)); P.rArm.rz = -2.9; P.rFore.rz = -0.2; P.lArm.rx = -0.3; P.lArm.rz = 0.25; P.lift = k * 0.1; P.head.rx = -0.3; }
        else if (L.pose === 1) { P.lArm.rz = 1.5; P.rArm.rz = -1.5; P.torso.ry = t * 3; P.head.rx = -0.25; P.lift = 0.02 + Math.abs(Math.sin(t * 6)) * 0.04; }
        else { sw = Math.sin(t * 8); P.lArm.rz = 1.2 + sw * 0.6; P.rArm.rz = -1.2 + sw * 0.6; P.torso.rz = sw * 0.15; P.lLeg.rz = 0.1 + sw * 0.1; P.rLeg.rz = -0.1 + sw * 0.1; P.lift = Math.abs(sw) * 0.04; P.head.rz = -sw * 0.15; }
        break;
      case 'wave': P.rArm.rz = -2.5; P.rFore.rz = -0.4 + Math.sin(t * 10) * 0.5; P.head.rz = 0.1; P.lArm.rz = 0.12; break;
      case 'dance': sw = Math.sin(t * 9); P.lArm.rx = -1.0 + sw * 0.6; P.rArm.rx = -1.0 - sw * 0.6; P.lFore.rx = -1; P.rFore.rx = -1; P.torso.ry = sw * 0.4; P.lift = Math.abs(sw) * 0.06; P.lLeg.rx = sw * 0.3; P.rLeg.rx = -sw * 0.3; P.head.rz = sw * 0.12; break;
      case 'bow': k = Math.sin(Math.min(1, st / 0.8) * Math.PI); P.torso.rx = 0.9 * k; P.head.rx = 0.3 * k; P.rArm.rx = -0.6 * k; P.rFore.rx = -1.2 * k; P.lArm.rx = 0.4 * k; break;
      case 'laugh': k = Math.sin(t * 18); P.torso.rx = -0.2 + k * 0.05; P.head.rx = -0.35 + k * 0.08; P.lArm.rx = -0.6; P.rArm.rx = -0.6; P.lFore.rx = -1.4; P.rFore.rx = -1.4; P.lift = Math.abs(k) * 0.015; break;
      case 'shrug': k = Math.sin(Math.min(1, st / 0.5) * Math.PI / 2); P.lArm.rz = 0.6 * k; P.rArm.rz = -0.6 * k; P.lFore.rx = -1.2 * k; P.rFore.rx = -1.2 * k; P.lFore.ry = -0.8 * k; P.rFore.ry = 0.8 * k; P.head.rz = 0.25 * k; P.lift = k * 0.01; break;
    }
  }
  function poseQuad(c, P, t, st) {
    var s = c.state, dragon = c.def.kind === 'dragon', sw, k, wing = 0;
    P.lift = 0; P.lean = 0;
    var tail = function (amp, sp) { P.tail = function (i) { return Math.sin(t * sp - i * 0.7) * amp; }; };
    tail(0.25, 2);
    switch (s) {
      case 'idle': P.head.rx = Math.sin(t * 1.3) * 0.08; P.head.ry = Math.sin(t * 0.45) * 0.4; wing = 0.25 + Math.sin(t * 1.4) * 0.12; P.lift = Math.sin(t * 1.6) * 0.006; break;
      case 'walk': case 'run':
        var f = s === 'run' ? 12 : 8;
        if (dragon) {   // Drache: Hüpfen mit Flügelschlag
          k = Math.abs(Math.sin(t * f * 0.55)); P.lift = k * (s === 'run' ? 0.16 : 0.1); wing = 0.4 + Math.sin(t * f * 1.1) * 0.9;
          P.fl.rx = -k * 0.6; P.fr.rx = -k * 0.6; P.bl.rx = k * 0.5; P.br.rx = k * 0.5; P.lean = -0.1 + k * 0.15;
        } else {        // Katzenwesen: Trab (diagonale Beinpaare)
          sw = Math.sin(t * f); P.fl.rx = sw * 0.7; P.br.rx = sw * 0.7; P.fr.rx = -sw * 0.7; P.bl.rx = -sw * 0.7; P.lift = Math.abs(Math.cos(t * f)) * 0.03; P.head.rx = Math.sin(t * f * 2) * 0.04;
        }
        tail(0.35, f * 0.6); break;
      case 'jump': k = Math.sin(Math.min(1, st / 0.7) * Math.PI); P.lift = k * 0.4; P.fl.rx = -k; P.fr.rx = -k; P.bl.rx = k; P.br.rx = k; wing = 0.3 + k * 1.2; P.lean = -k * 0.3; break;
      case 'cheer': k = Math.abs(Math.sin(t * 6)); P.lift = k * 0.14; P.lean = -0.5; P.fl.rx = -1.4 + Math.sin(t * 12) * 0.3; P.fr.rx = -1.4 - Math.sin(t * 12) * 0.3; P.head.rx = -0.35; wing = 0.6 + Math.sin(t * 14) * 0.9; tail(0.6, 10); break;
      case 'lose': P.lift = -0.13; P.fl.rx = -1.3; P.fr.rx = -1.3; P.bl.rx = 1.3; P.br.rx = 1.3; P.head.rx = 0.5; wing = -0.2; tail(0.05, 1); break;
      case 'angry': sw = Math.sin(t * 18); P.lean = 0.15; P.head.rx = 0.25 + sw * 0.05; P.fl.rx = Math.max(0, Math.sin(t * 9)) * -0.7; wing = 0.9 + sw * 0.2; tail(0.6, 14); P.lift = Math.abs(sw) * 0.01; break;
      case 'roll': k = Math.min(1, st / 0.9); P.fr.rx = -0.6 - Math.sin(k * Math.PI * 2) * 0.9; P.lean = -0.3 * Math.sin(k * Math.PI); P.head.rx = 0.2; wing = 0.5; break;
      case 'think': P.head.rz = 0.35; P.head.rx = -0.1 + Math.sin(t * 1.2) * 0.05; P.fl.rx = -0.9; tail(0.4, 1.4); wing = 0.2; break;
      case 'pay': k = Math.sin(Math.min(1, st / 0.6) * Math.PI / 2); P.fr.rx = -1.2 * k; P.head.rx = 0.3; P.lean = 0.1; wing = 0.1; break;
      case 'buy': k = Math.abs(Math.sin(t * 9)); P.lift = k * 0.06; P.head.rx = -0.25; wing = 0.5 + k * 0.6; tail(0.5, 9); break;
      case 'surprised': k = Math.min(1, st / 0.25); P.lean = -0.45 * k; P.head.rx = -0.4 * k; P.lift = Math.sin(Math.min(1, st / 0.4) * Math.PI) * 0.12; wing = 1.2 * k; tail(0.1, 20); break;
      case 'jail': P.lift = -0.1; P.fl.rx = -1.2; P.fr.rx = -1.2; P.bl.rx = 1.2; P.br.rx = 1.2; P.head.rx = 0.35; P.head.ry = Math.sin(t * 0.7) * 0.3; wing = -0.1; tail(0.08, 1); break;
      case 'jailReturn': k = Math.abs(Math.sin(t * 4)); P.lean = -0.3; P.lift = k * 0.08; wing = 1.0 + Math.sin(t * 8) * 0.5; P.head.rx = -0.3; tail(0.5, 6); break;
      case 'victory':
        if (c.look.pose === 0) { P.lean = -0.7; P.lift = 0.05; P.fl.rx = -1.6; P.fr.rx = -1.6; P.head.rx = -0.5; wing = 1.3 + Math.sin(t * 10) * 0.3; }
        else if (c.look.pose === 1) { P.spin = t * 4; P.lift = 0.05 + Math.abs(Math.sin(t * 6)) * 0.08; wing = 0.8; }
        else { sw = Math.sin(t * 8); P.lift = Math.abs(sw) * 0.1; P.head.rz = sw * 0.3; wing = 0.6 + sw * 0.6; tail(0.7, 8); }
        break;
      case 'wave': P.fr.rx = -1.6 + Math.sin(t * 10) * 0.4; P.head.rz = 0.15; wing = 0.4; break;
      case 'dance': sw = Math.sin(t * 9); P.spin = sw * 0.6; P.lift = Math.abs(sw) * 0.08; P.head.rz = sw * 0.25; wing = 0.6 + sw * 0.5; tail(0.6, 9); break;
      case 'bow': k = Math.sin(Math.min(1, st / 0.8) * Math.PI); P.lean = 0.35 * k; P.head.rx = 0.5 * k; P.fl.rx = 0.6 * k; P.fr.rx = 0.6 * k; break;
      case 'laugh': k = Math.sin(t * 18); P.lean = -0.25; P.head.rx = -0.4 + k * 0.1; P.lift = Math.abs(k) * 0.02; tail(0.4, 12); break;
      case 'shrug': k = Math.sin(Math.min(1, st / 0.5) * Math.PI / 2); P.head.rz = 0.3 * k; wing = 0.7 * k; P.fl.rx = -0.4 * k; P.fr.rx = -0.4 * k; break;
    }
    P.wing = wing;
  }
  function poseRobot(c, P, t, st) {
    var s = c.state, k, sw, mood = 'happy';
    P.lift = 0; P.lean = 0; P.roll = 0;
    var mech = function (x) { return Math.round(x * 6) / 6; };   // ruckartige Servobewegung
    switch (s) {
      case 'idle': P.head.ry = mech(Math.sin(t * 0.6)) * 0.4; P.lArm.rz = 0.15; P.rArm.rz = -0.15; P.lFore.rx = -0.3; P.rFore.rx = -0.3; P.lift = Math.sin(t * 2) * 0.006; break;
      case 'walk': case 'run': P.roll = t * (s === 'run' ? 16 : 10); P.lean = s === 'run' ? 0.25 : 0.12; P.lArm.rx = -0.3; P.rArm.rx = -0.3; P.lFore.rx = -1.2; P.rFore.rx = -1.2; P.lift = Math.abs(Math.sin(t * 14)) * 0.01; break;
      case 'jump': k = Math.sin(Math.min(1, st / 0.7) * Math.PI); P.lift = k * 0.32; P.lArm.rz = 1.4 * k; P.rArm.rz = -1.4 * k; break;
      case 'cheer': k = Math.abs(Math.sin(t * 7)); P.lift = k * 0.1; P.lArm.rz = 2.5; P.rArm.rz = -2.5; P.lFore.rz = mech(Math.sin(t * 12)) * 0.5; P.rFore.rz = -mech(Math.sin(t * 12)) * 0.5; P.head.rz = mech(Math.sin(t * 6)) * 0.2; mood = 'joy'; break;
      case 'lose': P.lean = 0.4; P.head.rx = 0.5; P.lArm.rz = 0.05; P.rArm.rz = -0.05; P.lift = -0.03; mood = 'sad'; break;
      case 'angry': sw = mech(Math.sin(t * 14)); P.lArm.rx = -1.4 + sw * 0.3; P.rArm.rx = -1.4 - sw * 0.3; P.lFore.rx = -0.8; P.rFore.rx = -0.8; P.head.rz = sw * 0.1; P.lean = 0.1; mood = 'angry'; break;
      case 'roll': k = Math.min(1, st / 0.9); P.rArm.rx = -0.4 - Math.sin(k * Math.PI * 2) * 1.8; P.rFore.rx = -0.4; P.torso.ry = Math.sin(k * Math.PI) * -0.5; break;
      case 'think': P.rArm.rx = -1.1; P.rFore.rx = -1.8; P.head.rz = mech(0.25 + Math.sin(t) * 0.05); mood = 'think'; break;
      case 'pay': k = Math.sin(Math.min(1, st / 0.6) * Math.PI / 2); P.rArm.rx = -1.4 * k; P.lean = 0.1; break;
      case 'buy': k = Math.sin(t * 10); P.lArm.rx = -1.3; P.rArm.rx = -1.3; P.lArm.rz = -0.35 + k * 0.2; P.rArm.rz = 0.35 - k * 0.2; P.lift = Math.abs(k) * 0.02; mood = 'joy'; break;
      case 'surprised': k = Math.min(1, st / 0.2); P.lean = -0.25 * k; P.lArm.rz = 1.2 * k; P.rArm.rz = -1.2 * k; P.lift = Math.sin(Math.min(1, st / 0.4) * Math.PI) * 0.07; mood = 'wow'; break;
      case 'jail': P.lean = 0.25; P.head.rx = 0.4; P.lArm.rx = 0.3; P.rArm.rx = 0.3; mood = 'sad'; break;
      case 'jailReturn': P.lArm.rz = 2.3; P.rArm.rz = -2.3; P.lift = Math.abs(Math.sin(t * 5)) * 0.04; mood = 'joy'; break;
      case 'victory':
        if (c.look.pose === 0) { P.rArm.rz = -2.9; P.lArm.rz = 0.3; P.lift = Math.abs(Math.sin(t * 5)) * 0.08; }
        else if (c.look.pose === 1) { P.spin = t * 5; P.lArm.rz = 1.5; P.rArm.rz = -1.5; }
        else { sw = mech(Math.sin(t * 8)); P.lArm.rx = -1 + sw; P.rArm.rx = -1 - sw; P.head.rz = sw * 0.2; P.lift = Math.abs(sw) * 0.04; }
        mood = 'joy'; break;
      case 'wave': P.rArm.rz = -2.5; P.rFore.rz = mech(Math.sin(t * 10)) * 0.6; break;
      case 'dance': sw = mech(Math.sin(t * 9)); P.spin = sw * 0.6; P.lArm.rx = -1 + sw * 0.5; P.rArm.rx = -1 - sw * 0.5; P.lift = Math.abs(sw) * 0.05; mood = 'joy'; break;
      case 'bow': k = Math.sin(Math.min(1, st / 0.8) * Math.PI); P.lean = 0.5 * k; P.head.rx = 0.4 * k; break;
      case 'laugh': k = Math.sin(t * 20); P.head.rx = -0.3 + k * 0.08; P.lift = Math.abs(k) * 0.015; mood = 'joy'; break;
      case 'shrug': k = Math.sin(Math.min(1, st / 0.5) * Math.PI / 2); P.lArm.rz = 0.7 * k; P.rArm.rz = -0.7 * k; P.head.rz = 0.25 * k; mood = 'think'; break;
    }
    P.mood = mood;
  }

  Character.prototype.update = function (dt) {
    dt = Math.min(dt, 0.1) * this.speed;
    this.t += dt; this.st += dt;
    var t = this.t, st = this.st, j = this.rig.j, P = {}, self = this;
    JOINTS.forEach(function (k) { P[k] = { rx: 0, ry: 0, rz: 0 }; });
    if (this.reduced && (this.state === 'idle' || this.state === 'jail')) t = 0;   // reduzierte Bewegung: ruhige Grundhaltung
    var kind = this.def.kind;
    if (kind === 'human' || kind === 'android') poseBiped(this, P, t, st);
    else if (kind === 'robot') poseRobot(this, P, t, st);
    else poseQuad(this, P, t, st);
    // Weich überblenden (exponentielle Annäherung statt springender Gelenke)
    var a = 1 - Math.exp(-dt * (kind === 'android' || kind === 'robot' ? 18 : 12));
    JOINTS.forEach(function (k) {
      var o = j[k]; if (!o || k === 'wheel') return;
      var b = self.base[k], p = P[k];
      o.rotation.x += (b.rx + p.rx - o.rotation.x) * a;
      o.rotation.y += (b.ry + p.ry - o.rotation.y) * a;
      o.rotation.z += (b.rz + p.rz - o.rotation.z) * a;
    });
    var hipsBase = this.base.hips.y;
    j.hips.position.y += (hipsBase + (P.lift || 0) - j.hips.position.y) * a;
    var lean = (P.lean || 0);
    if (kind === 'human' || kind === 'android') { j.torso.rotation.x += lean * a * 0.5; }
    else j.hips.rotation.x += (lean - j.hips.rotation.x) * a;
    this.rig.root.rotation.y += (((P.spin || 0)) - this.rig.root.rotation.y) * (P.spin != null ? 1 : a);
    if (j.tail && P.tail) j.tail.forEach(function (seg, i) { var target = P.tail(i); seg.rotation.y += (target - seg.rotation.y) * a; seg.rotation.x += (0.15 - seg.rotation.x) * a; });
    if (j.wings) j.wings.forEach(function (w, i) { var s = i ? 1 : -1, target = (P.wing || 0) * s; w.rotation.z += (target - w.rotation.z) * Math.min(1, a * 1.6); });
    if (j.cape) j.cape.rotation.x = 0.12 + Math.abs(Math.sin(t * 3)) * (this.state === 'walk' || this.state === 'run' ? 0.35 : 0.05);
    if (j.wheel) j.wheel.rotation.x = -(P.roll || 0);
    if (this.rig.eyes) {
      var m = P.mood, sy = m === 'joy' ? 0.35 : m === 'sad' ? 0.5 : m === 'wow' ? 1.5 : m === 'angry' ? 0.6 : 1, blink = (t % 3.2) < 0.12 ? 0.15 : 1;
      this.rig.eyes.forEach(function (e, i) { e.scale.y = sy * blink; e.rotation.z = m === 'angry' ? (i ? 0.5 : -0.5) : 0; });
      if (j.bulb) j.bulb.material.emissiveIntensity = 0.8 + Math.sin(t * 6) * 0.6;
    }
    var mouth = j.head && j.head.userData.mouth;
    if (mouth && kind !== 'robot') { var happy = /cheer|victory|buy|jailReturn|laugh|dance|wave/.test(this.state), sad = /lose|jail|angry/.test(this.state); mouth.rotation.z = sad ? 0 : Math.PI; mouth.scale.y = this.state === 'surprised' ? 1.6 : happy ? 0.9 : 0.6; }
    if (this.dur && this.st >= this.dur) { var then = this.once; this.dur = 0; this.once = null; this.play(then || 'idle'); }
  };

  root.RicoChars = {
    LIST: LIST, BY: BY, STATES: STATES, EMOTES: EMOTES, ACCESSORIES: ACCESSORIES, OUTFITS: OUTFITS, POSES: POSES, LOCKED: LOCKED,
    create: function (id, look) { return new Character(id, look); },
    lookOf: function (id, look) { return lookOf(BY[id] || BY.businessman, look); }
  };
})(typeof self !== 'undefined' ? self : this);
