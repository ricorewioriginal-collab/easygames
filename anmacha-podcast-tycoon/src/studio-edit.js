/* AnMaCha – Der Podcast: Studio frei gestalten und ausbauen.
   Möbel, Deko, Technik und Spaß-Objekte mit Fan-Punkten (🎟️) kaufen, frei hinstellen, drehen, verschieben, verkaufen;
   Wand-, Akzent-, Boden- und Lichtfarbe wählen. Das eigene Studio ist im Hauptmenü, in der Live-Show und im Quiz zu sehen
   und bringt Boni: jedes Objekt erhöht den Studio-Wert → mehr Start-Stimmung und mehr Hörer in jeder Aufnahme.
   Bedienung für alle Geräte gleich: Steuerkreuz/Stick/WASD bewegen, Ⓐ hinstellen, Ⓨ drehen, Ⓧ Objekt im Raum wählen, Ⓑ zurück;
   Kamera mit rechtem Stick, Maus oder Wischen; auf dem Handy Boden antippen und die Knöpfe unten nutzen. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, W = AMC.World, I = AMC.Input, Save = AMC.Save;
  const E = AMC.StudioEdit = { active: false };
  let T = null;

  // ------------------------------------------------------------------ Katalog
  // cat: furn | deco | tech | fun ; v = Studio-Wert ; r = Platzbedarf (Radius in m)
  const CAT = { furn: '🛋️ Möbel', deco: '🪴 Deko', tech: '🎚️ Technik', fun: '🎉 Spaß', room: '🎨 Raum' };
  const ITEMS = [
    { id: 'plant', cat: 'deco', name: 'Monstera', icon: '🪴', cost: 60, v: 3, r: 0.45 },
    { id: 'rug', cat: 'deco', name: 'Runder Teppich', icon: '🟠', cost: 80, v: 3, r: 1.1, flat: true },
    { id: 'lava', cat: 'deco', name: 'Lavalampe', icon: '🫧', cost: 70, v: 4, r: 0.3 },
    { id: 'lamp', cat: 'deco', name: 'Stehlampe', icon: '💡', cost: 90, v: 4, r: 0.35 },
    { id: 'vinyl', cat: 'deco', name: 'Plattenregal', icon: '💿', cost: 160, v: 7, r: 0.8 },
    { id: 'gold', cat: 'deco', name: 'Goldene Schallplatte', icon: '📀', cost: 300, v: 12, r: 0.4 },
    { id: 'trophy', cat: 'deco', name: 'Pokal „Podcast des Jahres“', icon: '🏆', cost: 500, v: 20, r: 0.4 },
    { id: 'sofa', cat: 'furn', name: 'Gäste-Sofa', icon: '🛋️', cost: 200, v: 8, r: 1.2 },
    { id: 'chair', cat: 'furn', name: 'Sessel', icon: '🪑', cost: 120, v: 5, r: 0.55 },
    { id: 'table', cat: 'furn', name: 'Couchtisch', icon: '🟫', cost: 90, v: 3, r: 0.6 },
    { id: 'coffee', cat: 'furn', name: 'Kaffeebar', icon: '☕', cost: 140, v: 6, r: 0.6 },
    { id: 'fridge', cat: 'furn', name: 'Köttbullar-Kühlschrank', icon: '🧊', cost: 150, v: 6, r: 0.5 },
    { id: 'onair', cat: 'tech', name: 'ON-AIR-Leuchte', icon: '🔴', cost: 150, v: 7, r: 0.4 },
    { id: 'speaker', cat: 'tech', name: 'Lautsprecher-Turm', icon: '🔊', cost: 180, v: 7, r: 0.45 },
    { id: 'cam', cat: 'tech', name: 'Kamera auf Stativ', icon: '🎥', cost: 150, v: 6, r: 0.5 },
    { id: 'ring', cat: 'tech', name: 'Ringlicht', icon: '⭕', cost: 110, v: 5, r: 0.4 },
    { id: 'radio', cat: 'tech', name: 'Retro-Radio', icon: '📻', cost: 130, v: 6, r: 0.4 },
    { id: 'disco', cat: 'fun', name: 'Discokugel', icon: '🪩', cost: 220, v: 10, r: 0.5 },
    { id: 'arcade', cat: 'fun', name: 'Arcade-Automat', icon: '🕹️', cost: 350, v: 14, r: 0.55 },
    { id: 'aqua', cat: 'fun', name: 'Aquarium', icon: '🐠', cost: 260, v: 11, r: 0.7 },
    { id: 'gisela', cat: 'fun', name: 'Gisela-Modell (Camper)', icon: '🚐', cost: 400, v: 16, r: 0.9 },
    { id: 'cat', cat: 'fun', name: 'Kratzbaum (Katze aus Folge 11)', icon: '🐈', cost: 180, v: 7, r: 0.5 },
    { id: 'pickle', cat: 'fun', name: 'Gurke im Glas', icon: '🥒', cost: 40, v: 2, r: 0.25 },
    { id: 'cables', cat: 'fun', name: 'Marcos Kabelkiste', icon: '🔌', cost: 50, v: 2, r: 0.4 }
  ];
  const THEMES = {
    wall: [['Studio-Schwarz', 0x1b1c24], ['Nachtblau', 0x14213d], ['Bordeaux', 0x3a1420], ['Waldgrün', 0x15301f], ['Beton', 0x55575e], ['Lila', 0x2a1840]],
    accent: [['AnMaCha-Orange', 0xff8a1e], ['Cyan', 0x3dd6ff], ['Pink', 0xff3da8], ['Gelb', 0xffd23f], ['Grün', 0x40d070], ['Weiß', 0xeeeeee]],
    floor: [['Eiche dunkel', '#3a2a1e'], ['Ahorn hell', '#8a6a48'], ['Schwarz glänzend', '#16171c'], ['Teppich grau', '#4a4c55'], ['Retro-Fliesen', 'tiles']],
    light: [['Orange & Blau', [0xff8a1e, 0x3d7dff]], ['Pink & Cyan', [0xff3da8, 0x3dd6ff]], ['Warmweiß', [0xffd8a8, 0xffe8c8]], ['Grün & Lila', [0x40d070, 0x9a4dff]], ['Rot & Gold', [0xff3030, 0xffc040]]]
  };
  E.ITEMS = ITEMS; E.THEMES = THEMES;
  const DEF_ITEMS = [{ id: 'plant', x: -6.6, z: -3.5, r: 0 }, { id: 'plant', x: 6.6, z: -3.5, r: 0 }, { id: 'sofa', x: 5.3, z: 2.2, r: -Math.PI / 2 }, { id: 'vinyl', x: -7.3, z: 0.8, r: Math.PI / 2 }, { id: 'ring', x: -3.4, z: 1.2, r: 0.5 }, { id: 'ring', x: 3.4, z: 1.2, r: -0.5 }];
  function data() {
    const d = Save.data;
    if (!d.studio) d.studio = { items: DEF_ITEMS.map(o => Object.assign({}, o)), theme: { wall: 0, accent: 0, floor: 0, light: 0 }, gift: false };
    return d.studio;
  }
  E.data = data;
  /** Studio-Wert und Boni (Live-Show) */
  E.value = () => data().items.reduce((a, o) => { const it = ITEMS.find(x => x.id === o.id); return a + (it ? it.v : 0); }, 0);
  E.bonus = () => { const v = E.value(); return { hype: Math.min(25, Math.round(v / 6)), lis: Math.min(0.25, v / 600), stars: v >= 120 ? 3 : v >= 70 ? 2 : v >= 30 ? 1 : 0 }; };

  // ------------------------------------------------------------------ Objekte bauen (einfach, leicht, mit etwas Leben)
  const matC = {};
  const M = (c, o) => { const k = c + JSON.stringify(o || {}); return matC[k] || (matC[k] = W.mat(c, o)); };
  const anims = [];
  function build(id) {
    const g = new T.Group(), B = (w, h, d, c, x, y, z, o) => W.box(w, h, d, M(c, o), x, y, z, g), C = (rt, rb, h, c, x, y, z, o, s) => W.cyl(rt, rb, h, M(c, o), x, y, z, g, s);
    const S = (r, c, x, y, z, o) => { const m = new T.Mesh(new T.SphereGeometry(r, 14, 10), M(c, o)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    switch (id) {
      case 'plant': C(0.28, 0.22, 0.55, 0xeeeeee, 0, 0.28, 0, { r: 0.6 }); for (let i = 0; i < 8; i++) { const l = S(0.26, 0x2f8a3a, Math.cos(i * 2.4) * 0.16, 0.85 + (i % 3) * 0.17, Math.sin(i * 2.4) * 0.16, { r: 0.8 }); l.scale.set(0.65, 1.3, 0.25); l.rotation.set(Math.cos(i) * 0.6, i * 2.4, Math.sin(i) * 0.6); } break;
      case 'rug': { const m = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 0.02, 40), M(0xff8a1e, { r: 0.95 })); m.position.y = 0.011; m.receiveShadow = true; g.add(m); const m2 = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.025, 40), M(0x2a1a10, { r: 0.95 })); m2.position.y = 0.013; g.add(m2); break; }
      case 'lava': { C(0.12, 0.16, 0.18, 0x222222, 0, 0.09, 0, { m: 0.7 }); const gl = C(0.1, 0.13, 0.5, 0xff3da8, 0, 0.43, 0, { e: 0x801050, ei: 1.2 }); gl.material = new T.MeshStandardMaterial({ color: W.lin(0xff6ad0), emissive: W.lin(0xa01070), transparent: true, opacity: 0.75 }); C(0.06, 0.1, 0.12, 0x222222, 0, 0.74, 0, { m: 0.7 }); const b = S(0.05, 0xffd23f, 0, 0.3, 0, { e: 0xff8000, ei: 1.5 }); const b2 = S(0.04, 0xffd23f, 0, 0.5, 0, { e: 0xff8000, ei: 1.5 }); anims.push((t, o) => { b.position.y = 0.32 + Math.sin(t * 0.9 + o.seed) * 0.12; b2.position.y = 0.48 + Math.cos(t * 0.7 + o.seed) * 0.1; }); W.glow(0xff3da8, 1.2, g, 0, 0.45, 0); break; }
      case 'lamp': C(0.2, 0.22, 0.04, 0x222222, 0, 0.02, 0, { m: 0.7 }); C(0.02, 0.02, 1.6, 0x222222, 0, 0.8, 0, { m: 0.7 }); C(0.14, 0.26, 0.3, 0xf4e8d0, 0, 1.68, 0, { e: 0xffd8a0, ei: 0.9 }); W.glow(0xffd8a0, 2.2, g, 0, 1.6, 0); break;
      case 'vinyl': for (let s = 0; s < 3; s++) { B(1.6, 0.05, 0.4, 0x6b4a30, 0, 0.4 + s * 0.55, 0); for (let v = 0; v < 10; v++) B(0.03, 0.3, 0.3, [0xff8a1e, 0x3dd6ff, 0xff3da8, 0xffd23f, 0x111111][(v + s) % 5], -0.7 + v * 0.15, 0.58 + s * 0.55, 0, {}); } B(0.05, 1.6, 0.4, 0x6b4a30, -0.8, 0.8, 0); B(0.05, 1.6, 0.4, 0x6b4a30, 0.8, 0.8, 0); break;
      case 'gold': B(0.4, 0.9, 0.4, 0x16171c, 0, 0.45, 0, { r: 0.4 }); { const d = C(0.22, 0.22, 0.02, 0xffd23f, 0, 1.15, 0, { m: 0.9, r: 0.2 }); d.rotation.x = Math.PI / 2; anims.push((t) => { d.rotation.z = t * 0.8; }); } B(0.5, 0.6, 0.03, 0x111111, 0, 1.15, -0.04); break;
      case 'trophy': B(0.4, 0.9, 0.4, 0x16171c, 0, 0.45, 0, { r: 0.4 }); C(0.08, 0.12, 0.08, 0xffd23f, 0, 0.94, 0, { m: 0.9, r: 0.25 }); C(0.03, 0.03, 0.18, 0xffd23f, 0, 1.07, 0, { m: 0.9, r: 0.25 }); C(0.2, 0.06, 0.3, 0xffd23f, 0, 1.3, 0, { m: 0.9, r: 0.25 }); W.glow(0xffd23f, 1.4, g, 0, 1.3, 0); break;
      case 'sofa': { const c = 0x3a3f6a; B(2.2, 0.42, 0.85, c, 0, 0.3, 0, { r: 0.9 }); B(2.2, 0.65, 0.2, c, 0, 0.72, -0.36, { r: 0.9 }); B(0.2, 0.55, 0.85, c, -1.1, 0.5, 0, { r: 0.9 }); B(0.2, 0.55, 0.85, c, 1.1, 0.5, 0, { r: 0.9 }); B(0.5, 0.35, 0.12, 0xff8a1e, -0.5, 0.65, -0.22, { r: 0.9 }); B(0.5, 0.35, 0.12, 0xffd23f, 0.5, 0.65, -0.22, { r: 0.9 }); break; }
      case 'chair': { const c = 0x8a3a2a; B(0.8, 0.4, 0.75, c, 0, 0.3, 0, { r: 0.9 }); B(0.8, 0.6, 0.18, c, 0, 0.7, -0.3, { r: 0.9 }); B(0.15, 0.4, 0.75, c, -0.4, 0.55, 0, { r: 0.9 }); B(0.15, 0.4, 0.75, c, 0.4, 0.55, 0, { r: 0.9 }); break; }
      case 'table': B(1.1, 0.06, 0.6, 0x6b4a30, 0, 0.42, 0, { r: 0.5 }); [[-0.48, -0.24], [0.48, -0.24], [-0.48, 0.24], [0.48, 0.24]].forEach(([x, z]) => C(0.025, 0.025, 0.4, 0x222222, x, 0.2, z)); C(0.05, 0.04, 0.1, 0xffffff, 0.2, 0.5, 0); S(0.06, 0xff8a1e, -0.2, 0.5, 0.05); break;
      case 'coffee': B(1.0, 0.95, 0.55, 0x2a2c34, 0, 0.47, 0, { r: 0.5 }); B(1.04, 0.05, 0.6, 0x8a6a48, 0, 0.97, 0); B(0.32, 0.4, 0.3, 0xc0c4cc, -0.2, 1.2, 0, { m: 0.8, r: 0.3 }); C(0.04, 0.035, 0.08, 0xffffff, 0.15, 1.04, 0.1); C(0.04, 0.035, 0.08, 0xff8a1e, 0.3, 1.04, 0.05); { const st = W.glow(0xffffff, 0.4, g, -0.2, 1.5, 0.1); anims.push(t => { st.material.opacity = 0.25 + Math.sin(t * 3) * 0.2; st.position.y = 1.45 + (t * 0.3 % 0.3); }); } break;
      case 'fridge': B(0.7, 1.7, 0.65, 0xe8e8ee, 0, 0.85, 0, { r: 0.3, m: 0.3 }); B(0.03, 0.4, 0.05, 0x888888, 0.28, 1.2, 0.34, { m: 0.8 }); { const s = new T.Mesh(new T.PlaneGeometry(0.4, 0.2), new T.MeshBasicMaterial({ map: W.textTex(['Köttbullar', 'NUR MARCO!'], { w: 256, h: 128, size: 36, bg: '#ffd23f', fg: '#222', accent: '#222' }) })); s.position.set(-0.05, 1.3, 0.331); g.add(s); } break;
      case 'onair': C(0.04, 0.04, 1.4, 0x222222, 0, 0.7, 0, { m: 0.7 }); C(0.25, 0.25, 0.04, 0x222222, 0, 0.02, 0); { const s = new T.Mesh(new T.PlaneGeometry(0.9, 0.32), new T.MeshBasicMaterial({ map: W.textTex(['ON AIR'], { w: 256, h: 96, size: 64, bg: '#2a0505', fg: '#ff3a3a', accent: '#ff3a3a' }), toneMapped: false })); s.position.set(0, 1.55, 0.03); g.add(s); B(0.95, 0.36, 0.05, 0x111111, 0, 1.55, 0); const gl = W.glow(0xff2020, 1.6, g, 0, 1.55, 0.1); anims.push(t => { gl.material.opacity = 0.6 + Math.sin(t * 4) * 0.3; }); } break;
      case 'speaker': B(0.5, 1.5, 0.45, 0x16171c, 0, 0.75, 0, { r: 0.4 }); { const w1 = C(0.17, 0.17, 0.03, 0x333333, 0, 0.5, 0.23, { m: 0.4 }); w1.rotation.x = Math.PI / 2; const w2 = C(0.1, 0.1, 0.03, 0x333333, 0, 1.05, 0.23, { m: 0.4 }); w2.rotation.x = Math.PI / 2; const t1 = C(0.05, 0.05, 0.03, 0xff8a1e, 0, 1.3, 0.23, { e: 0x803000 }); t1.rotation.x = Math.PI / 2; anims.push(t => { const k = 1 + Math.abs(Math.sin(t * 8)) * 0.08; w1.scale.set(k, 1, k); }); } break;
      case 'cam': [0, 2.1, 4.2].forEach(a => { const l = C(0.02, 0.02, 1.3, 0x222222, Math.sin(a) * 0.25, 0.62, Math.cos(a) * 0.25); l.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35); }); B(0.3, 0.22, 0.42, 0x111111, 0, 1.35, 0, { m: 0.5 }); { const o = C(0.08, 0.09, 0.2, 0x222222, 0, 1.35, 0.28, { m: 0.6 }); o.rotation.x = Math.PI / 2; S(0.025, 0xff2020, 0.1, 1.48, 0.15, { e: 0xff0000, ei: 2 }); } break;
      case 'ring': C(0.03, 0.03, 1.9, 0x222222, 0, 0.95, 0, { m: 0.7 }); { const r = new T.Mesh(new T.TorusGeometry(0.42, 0.04, 8, 32), new T.MeshBasicMaterial({ color: 0xfff4e0, toneMapped: false })); r.position.set(0, 2.1, 0); g.add(r); } break;
      case 'radio': B(0.5, 0.75, 0.4, 0x16171c, 0, 0.375, 0); B(0.62, 0.38, 0.28, 0x8a4a22, 0, 0.94, 0, { r: 0.5 }); B(0.34, 0.24, 0.02, 0xe8d8b0, -0.08, 0.94, 0.15); { const d = C(0.06, 0.06, 0.02, 0x333333, 0.19, 0.94, 0.15); d.rotation.x = Math.PI / 2; } { const h = new T.Mesh(new T.TorusGeometry(0.2, 0.015, 6, 16, Math.PI), M(0x666666, { m: 0.8 })); h.position.set(0, 1.12, 0); g.add(h); } break;
      case 'disco': { C(0.01, 0.01, 1.2, 0x888888, 0, 3.0, 0); const b = new T.Mesh(new T.IcosahedronGeometry(0.32, 1), new T.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15, flatShading: true })); b.position.y = 2.35; g.add(b); const gl = W.glow(0xffffff, 1.4, g, 0, 2.35, 0); anims.push((t, o) => { b.rotation.y = t * 1.2; gl.material.color.setHSL((t * 0.15 + o.seed) % 1, 1, 0.7); }); break; }
      case 'arcade': { B(0.8, 1.8, 0.75, 0x1d1240, 0, 0.9, 0, { r: 0.5 }); B(0.82, 0.12, 0.6, 0xff3da8, 0, 1.0, 0.1, { e: 0x800040 }); const scr = new T.Mesh(new T.PlaneGeometry(0.6, 0.45), new T.MeshBasicMaterial({ color: 0x3dd6ff, toneMapped: false })); scr.position.set(0, 1.42, 0.38); scr.rotation.x = -0.15; g.add(scr); S(0.04, 0xff2020, -0.15, 1.08, 0.3); S(0.03, 0xffd23f, 0.1, 1.08, 0.3); S(0.03, 0x40d070, 0.2, 1.08, 0.3); anims.push((t, o) => scr.material.color.setHSL((t * 0.25 + o.seed) % 1, 0.8, 0.55)); break; }
      case 'aqua': { B(1.3, 0.75, 0.5, 0x2a2c34, 0, 0.375, 0); const gl = new T.Mesh(new T.BoxGeometry(1.25, 0.65, 0.45), new T.MeshStandardMaterial({ color: W.lin(0x5ac8ff), transparent: true, opacity: 0.35, roughness: 0.05 })); gl.position.y = 1.08; g.add(gl); const fish = []; for (let i = 0; i < 4; i++) { const f = S(0.04, [0xff8a1e, 0xffd23f, 0xff3da8, 0x3dd6ff][i], 0, 1.0 + i * 0.08, 0, { e: 0x201000 }); f.scale.set(1.6, 1, 0.6); fish.push(f); } anims.push((t, o) => fish.forEach((f, i) => { const a = t * (0.6 + i * 0.15) + i * 1.7 + o.seed; f.position.x = Math.sin(a) * 0.48; f.position.z = Math.cos(a * 1.3) * 0.12; f.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI; })); W.glow(0x5ac8ff, 1.6, g, 0, 1.1, 0); break; }
      case 'gisela': { B(0.9, 0.35, 0.9, 0x16171c, 0, 0.175, 0); const c = E.camper(0.42); c.position.y = 0.36; c.rotation.y = 0.6; g.add(c); anims.push(t => { c.rotation.y = 0.6 + t * 0.3; }); break; }
      case 'cat': B(0.6, 0.06, 0.6, 0xc8b08a, 0, 0.03, 0); C(0.08, 0.08, 1.1, 0xd8c8a0, 0, 0.58, 0); B(0.5, 0.06, 0.5, 0xc8b08a, 0, 0.75, 0); B(0.45, 0.06, 0.45, 0xc8b08a, 0, 1.15, 0); { const body = S(0.12, 0x333333, 0, 1.28, 0); body.scale.set(1.3, 0.8, 0.9); const h = S(0.08, 0x333333, 0.14, 1.36, 0); S(0.015, 0x6cff8a, 0.21, 1.38, 0.03, { e: 0x30ff60 }); S(0.015, 0x6cff8a, 0.21, 1.38, -0.03, { e: 0x30ff60 }); anims.push((t, o) => { h.position.y = 1.36 + Math.sin(t * 2 + o.seed) * 0.01; }); } break;
      case 'pickle': { C(0.11, 0.11, 0.3, 0xddeeff, 0, 0.15, 0); const p = S(0.05, 0x3a8a2a, 0, 0.16, 0); p.scale.set(1, 2.6, 1); C(0.115, 0.115, 0.04, 0xcc3333, 0, 0.32, 0); break; }
      case 'cables': B(0.6, 0.35, 0.45, 0x6b4a30, 0, 0.175, 0); for (let i = 0; i < 6; i++) { const c = new T.Mesh(new T.TorusGeometry(0.12 + i * 0.01, 0.015, 6, 18), M([0x111111, 0xff8a1e, 0x3dd6ff, 0xff3da8][i % 4])); c.position.set((i % 3 - 1) * 0.15, 0.4, (i % 2 - 0.5) * 0.12); c.rotation.set(1.2 + i * 0.4, i, 0.3 * i); g.add(c); } break;
    }
    return g;
  }
  /** Gisela – Marcos umgebauter Camper (auch für Stadt und Szenen); s = Maßstab */
  E.camper = function (s) {
    T = root.THREE;
    const g = new T.Group(), B = (w, h, d, c, x, y, z, o) => W.box(w, h, d, M(c, o), x, y, z, g);
    B(2.0, 0.95, 4.4, 0xf2efe6, 0, 1.15, 0, { r: 0.5 });             // Aufbau (cremeweiß)
    B(2.02, 0.5, 4.42, 0x3aa7a0, 0, 0.6, 0, { r: 0.5 });             // unten türkis
    B(2.04, 0.08, 4.44, 0xff8a1e, 0, 0.88, 0, { r: 0.5 });           // AnMaCha-Streifen
    B(1.9, 0.5, 3.0, 0xf2efe6, 0, 1.85, -0.5, { r: 0.5 });           // Aufstelldach
    B(1.7, 0.45, 0.06, 0x223344, 0, 1.3, 2.21, { r: 0.1, m: 0.4 });   // Frontscheibe
    [-1.01, 1.01].forEach(x => { B(0.04, 0.4, 1.4, 0x223344, x, 1.3, -0.6, { r: 0.1, m: 0.4 }); B(0.04, 0.4, 0.7, 0x223344, x, 1.3, 1.3, { r: 0.1, m: 0.4 }); });
    [[-0.85, 1.45], [0.85, 1.45], [-0.85, -1.45], [0.85, -1.45]].forEach(([x, z]) => { const w = W.cyl(0.34, 0.34, 0.26, M(0x1a1a1a, { r: 0.8 }), x, 0.34, z, g, 18); w.rotation.z = Math.PI / 2; const h = W.cyl(0.16, 0.16, 0.27, M(0xdddddd, { m: 0.8, r: 0.3 }), x, 0.34, z, g, 12); h.rotation.z = Math.PI / 2; });
    [-0.65, 0.65].forEach(x => { const l = W.cyl(0.12, 0.12, 0.05, M(0xfff4c0, { e: 0xffe080, ei: 1.2 }), x, 0.85, 2.22, g, 12); l.rotation.x = Math.PI / 2; });
    // Name auf der Seite
    const tex = W.textTex(['Gisela'], { w: 256, h: 96, size: 64, bg: '#f2efe6', fg: '#ff8a1e', accent: '#f2efe6' });
    [-1.03, 1.03].forEach(x => { const p = new T.Mesh(new T.PlaneGeometry(1.3, 0.48), new T.MeshBasicMaterial({ map: tex, transparent: true })); p.position.set(x, 1.15, 0.6); p.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(p); });
    // Blumen-Aufkleber (Hippie-Camper)
    [[1.03, 0.6, -1.3], [-1.03, 0.62, -1.1]].forEach(([x, y, z]) => { for (let i = 0; i < 5; i++) { const p = new T.Mesh(new T.CircleGeometry(0.09, 10), M(0xffd23f)); const a = i / 5 * Math.PI * 2; p.position.set(x * 1.002, y + Math.sin(a) * 0.12, z + Math.cos(a) * 0.12); p.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(p); } });
    g.scale.setScalar(s || 1);
    return g;
  };

  // ------------------------------------------------------------------ Studio einrichten (Raumfarben + Objekte)
  E.apply = function () {
    T = root.THREE; const ST = AMC.Studio; if (!ST.group) return;
    const d = data(), th = d.theme;
    if (!ST.decor) { ST.decor = new T.Group(); ST.group.add(ST.decor); }
    ST.decor.children.slice().forEach(c => ST.decor.remove(c)); anims.length = 0;
    d.items.forEach((o, i) => { const m = build(o.id); m.position.set(o.x, 0, o.z); m.rotation.y = o.r || 0; m.userData.idx = i; m.userData.seed = (i * 0.37) % 1; m.userData.anim = anims.length; ST.decor.add(m); o._m = m; });
    E.animSeeds = d.items.map((_, i) => ({ seed: (i * 0.37) % 1 }));
    const R = ST.room; if (R) {
      R.wall.color.copy(W.lin(THEMES.wall[th.wall || 0][1]));
      R.accent.color.copy(W.lin(THEMES.accent[th.accent || 0][1])); R.accent.emissive.copy(W.lin(THEMES.accent[th.accent || 0][1])).multiplyScalar(0.12);
      const f = THEMES.floor[th.floor || 0][1]; R.floorMat.map = R.floorTex(f); R.floorMat.needsUpdate = true;
      const L = THEMES.light[th.light || 0][1]; ST.rimA.color.setHex(L[0]); ST.rimB.color.setHex(L[1]);
    }
  };
  E.tick = function (t) { for (const a of anims) try { a(t, { seed: 0.3 }); } catch (e) { /* Deko darf nie stören */ } };

  // ------------------------------------------------------------------ Editor
  let S = null;
  const BOUND = { x0: -7.3, x1: 7.3, z0: -3.9, z1: 5.8 }, DESK = { x0: -2.5, x1: 2.5, z0: -1.9, z1: 0.5 };
  const free = (x, z, r, skip) => {
    if (x - r < BOUND.x0 - 0.3 || x + r > BOUND.x1 + 0.3 || z - r < BOUND.z0 - 0.4 || z + r > BOUND.z1) return false;
    if (x + r > DESK.x0 && x - r < DESK.x1 && z + r > DESK.z0 && z - r < DESK.z1) return false;
    return true;
  };
  E.open = function (onClose) {
    T = root.THREE; const ST = AMC.Studio; ST.enter('edit'); E.apply();
    const d = data();
    if (!d.gift) { d.gift = true; Save.data.fan += 400; Save.save(); setTimeout(() => AMC.UI.toast('🎁 Startbudget von Wir ♥ Medien: +400 🎟️ fürs Studio!'), 600); }
    S = { phase: 'browse', cat: 'furn', sel: 0, ghost: null, item: null, moving: -1, rot: 0, x: 0, z: 2.5, pick: 0, yaw: 0.35, dist: 11.5, onClose, hl: null };
    E.active = true; buildUi(); setGhost(null);
    const cv = W.renderer.domElement; let down = null;
    S.pd = e => { down = [e.clientX, e.clientY]; }; S.pu = e => { if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (moved < 9) tapFloor(e.clientX, e.clientY); };
    cv.addEventListener('pointerdown', S.pd); cv.addEventListener('pointerup', S.pu);
    AMC.Audio.music('menu');
  };
  E.close = function () {
    if (!S) return; const cv = W.renderer.domElement; cv.removeEventListener('pointerdown', S.pd); cv.removeEventListener('pointerup', S.pu);
    setGhost(null); hl(-1); const u = U.$('edUi'); if (u) u.remove(); const cb = S.onClose; S = null; E.active = false; Save.save(); cb && cb();
  };
  function tapFloor(cx, cy) {
    if (!S) return;
    const r = new T.Raycaster(), v = new T.Vector2(cx / root.innerWidth * 2 - 1, -(cy / root.innerHeight) * 2 + 1); r.setFromCamera(v, W.camera);
    const p = new T.Vector3(); if (!r.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), p)) return;
    if (S.phase === 'place') { S.x = p.x; S.z = p.z; snap(); }
    else { // vorhandenes Objekt antippen → auswählen
      const it = data().items; let bi = -1, bd = 1.2; it.forEach((o, i) => { const dd = Math.hypot(o.x - p.x, o.z - p.z); if (dd < bd) { bd = dd; bi = i; } });
      if (bi >= 0) { S.phase = 'pick'; S.pick = bi; hl(bi); renderUi(); }
    }
  }
  const snap = () => { S.x = U.clamp(Math.round(S.x * 4) / 4, BOUND.x0, BOUND.x1); S.z = U.clamp(Math.round(S.z * 4) / 4, BOUND.z0, BOUND.z1); };
  function setGhost(id) {
    const ST = AMC.Studio;
    if (S && S.ghost) { ST.group.remove(S.ghost); S.ghost = null; }
    if (!id || !S) return;
    const g = build(id); g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.6; o.castShadow = false; } });
    const ring = new T.Mesh(new T.RingGeometry(0.1, 0.14, 32), new T.MeshBasicMaterial({ color: 0x6cff8a, transparent: true, opacity: 0.9, side: T.DoubleSide, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring); g.userData.ring = ring;
    S.ghost = g; ST.group.add(g);
  }
  function hl(i) {
    const ST = AMC.Studio;
    if (S && S.hl) { ST.group.remove(S.hl); S.hl = null; }
    if (!S || i < 0) return; const o = data().items[i]; if (!o) return; const it = ITEMS.find(x => x.id === o.id);
    const m = new T.Mesh(new T.RingGeometry(it.r, it.r + 0.08, 40), new T.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(o.x, 0.04, o.z); ST.group.add(m); S.hl = m;
  }
  const list = () => S.cat === 'room' ? ROOM() : ITEMS.filter(i => i.cat === S.cat);
  function ROOM() {
    const th = data().theme, out = [];
    [['wall', '🧱 Wand'], ['accent', '✨ Akzent'], ['floor', '🟫 Boden'], ['light', '💡 Licht']].forEach(([k, n]) => out.push({ room: k, name: n + ': ' + THEMES[k][th[k] || 0][0], icon: n.split(' ')[0], cost: 0 }));
    return out;
  }
  function buildUi() {
    const ui = U.el('div', 'ed-ui'); ui.id = 'edUi';
    ui.innerHTML = '<div class="ed-top glass"><b>🛠️ Studio gestalten</b><span id="edPts"></span><span id="edVal"></span><button type="button" class="btn small" id="edDone">' + AMC.glyph('b') + ' Fertig</button></div>' +
      '<div class="ed-bot"><div class="ed-tabs" id="edTabs"></div><div class="ed-list" id="edList"></div><div class="ed-act" id="edAct"></div><div class="ed-hint" id="edHint"></div></div>';
    U.$('ui').appendChild(ui);
    ui.querySelector('#edDone').onclick = () => { AMC.Audio.sfx('back'); E.close(); };
    renderUi();
  }
  function renderUi() {
    if (!S) return; const d = data(), b = E.bonus();
    U.$('edPts').textContent = '🎟️ ' + U.fmt(Save.data.fan);
    U.$('edVal').innerHTML = 'Studio-Wert <b>' + E.value() + '</b> ' + '★'.repeat(b.stars) + '<i>' + '★'.repeat(3 - b.stars) + '</i> · +' + b.hype + ' Stimmung · +' + Math.round(b.lis * 100) + ' % Hörer';
    const tabs = U.$('edTabs'); tabs.innerHTML = Object.keys(CAT).map(k => '<button type="button" class="tab' + (k === S.cat ? ' on' : '') + '" data-c="' + k + '">' + CAT[k] + '</button>').join('');
    tabs.querySelectorAll('button').forEach(bt => bt.onclick = () => { S.cat = bt.dataset.c; S.sel = 0; if (S.phase !== 'browse') cancel(); AMC.Audio.sfx('move'); renderUi(); });
    const L = list(); S.sel = U.clamp(S.sel, 0, L.length - 1);
    const el = U.$('edList');
    el.innerHTML = L.map((it, i) => '<button type="button" class="ed-card' + (i === S.sel && S.phase === 'browse' ? ' sel' : '') + (it.cost > Save.data.fan ? ' poor' : '') + '" data-i="' + i + '"><span>' + it.icon + '</span><b>' + it.name + '</b><small>' + (it.room ? 'ändern' : '🎟️ ' + it.cost + ' · +' + it.v + ' Wert') + '</small></button>').join('');
    el.querySelectorAll('.ed-card').forEach(bt => bt.onclick = () => { S.sel = +bt.dataset.i; take(); });
    const sc = el.querySelector('.sel'); if (sc && sc.scrollIntoView) sc.scrollIntoView({ block: 'nearest', inline: 'center' });
    const act = U.$('edAct'), A = [];
    if (S.phase === 'place') A.push(['rot', AMC.glyph('y') + ' Drehen'], ['ok', AMC.glyph('a') + (S.moving >= 0 ? ' Abstellen' : ' Hinstellen')], ['cancel', AMC.glyph('b') + ' Abbrechen']);
    else if (S.phase === 'pick') A.push(['prev', '◀'], ['next', '▶'], ['move', AMC.glyph('a') + ' Verschieben'], ['sell', AMC.glyph('x') + ' Verkaufen'], ['cancel', AMC.glyph('b') + ' Zurück']);
    else A.push(['pickmode', AMC.glyph('x') + ' Objekt im Raum wählen']);
    act.innerHTML = A.map(a => '<button type="button" class="btn small' + (a[0] === 'ok' || a[0] === 'move' ? ' primary' : '') + '" data-a="' + a[0] + '">' + a[1] + '</button>').join('');
    act.querySelectorAll('button').forEach(bt => bt.onclick = () => doAct(bt.dataset.a));
    const pi = S.phase === 'pick' ? d.items[S.pick] : null, pit = pi && ITEMS.find(x => x.id === pi.id);
    U.$('edHint').innerHTML = S.phase === 'place' ? 'Bewegen: ' + (I.device === 'touch' ? 'Boden antippen' : AMC.glyph('ls') + ' / WASD') + ' · Kamera: ' + (I.device === 'pad' ? AMC.glyph('rs') : 'ziehen') :
      S.phase === 'pick' ? (pit ? pit.icon + ' ' + pit.name + ' · Verkauf bringt 🎟️ ' + Math.round(pit.cost / 2) : '') : AMC.glyph('dpad') + ' Auswählen · ' + AMC.glyph('a') + ' Nehmen · LB/RB oder Reiter: Kategorie';
  }
  function doAct(a) {
    if (a === 'rot') { S.rot += Math.PI / 4; AMC.Audio.sfx('move'); }
    else if (a === 'ok') place();
    else if (a === 'cancel') cancel();
    else if (a === 'pickmode') { if (!data().items.length) return AMC.UI.toast('Noch nichts im Studio.'); S.phase = 'pick'; S.pick = U.clamp(S.pick, 0, data().items.length - 1); hl(S.pick); AMC.Audio.sfx('ok'); }
    else if (a === 'prev' || a === 'next') { const n = data().items.length; S.pick = (S.pick + (a === 'next' ? 1 : n - 1)) % n; hl(S.pick); AMC.Audio.sfx('move'); }
    else if (a === 'move') { const o = data().items[S.pick]; if (!o) return; S.moving = S.pick; S.item = ITEMS.find(x => x.id === o.id); S.x = o.x; S.z = o.z; S.rot = o.r || 0; o._m.visible = false; hl(-1); setGhost(o.id); S.phase = 'place'; AMC.Audio.sfx('ok'); }
    else if (a === 'sell') {
      const d = data(), o = d.items[S.pick]; if (!o) return; const it = ITEMS.find(x => x.id === o.id);
      d.items.splice(S.pick, 1); Save.data.fan += Math.round(it.cost / 2); Save.save(); AMC.Audio.sfx('buy'); AMC.UI.toast(it.icon + ' verkauft: +' + Math.round(it.cost / 2) + ' 🎟️');
      E.apply(); if (!d.items.length) cancel(); else { S.pick = Math.min(S.pick, d.items.length - 1); hl(S.pick); }
    }
    renderUi();
  }
  function cancel() {
    if (S.moving >= 0) { const o = data().items[S.moving]; if (o && o._m) o._m.visible = true; }
    S.moving = -1; S.item = null; S.phase = 'browse'; setGhost(null); hl(-1); AMC.Audio.sfx('back'); renderUi();
  }
  function take() {
    const it = list()[S.sel]; if (!it) return;
    if (it.room) { const th = data().theme; th[it.room] = ((th[it.room] || 0) + 1) % THEMES[it.room].length; Save.save(); E.apply(); AMC.Audio.sfx('swap'); renderUi(); return; }
    if (Save.data.fan < it.cost) { AMC.Audio.sfx('buzz'); AMC.UI.toast('🎟️ Dir fehlen noch ' + U.fmt(it.cost - Save.data.fan) + ' Fan-Punkte – spiel Story, Live-Show oder Themenjagd!'); return; }
    S.item = it; S.moving = -1; S.phase = 'place'; S.rot = 0;
    // Startpunkt: vor der Kamera in der Raummitte
    S.x = 0; S.z = 2.6; snap(); setGhost(it.id); AMC.Audio.sfx('ok'); renderUi();
  }
  function place() {
    if (!S.item) return; const d = data();
    if (!free(S.x, S.z, S.item.flat ? 0.2 : S.item.r * 0.6)) { AMC.Audio.sfx('buzz'); AMC.UI.toast('Hier ist kein Platz (Tisch oder Wand im Weg).'); return; }
    if (S.moving >= 0) { const o = d.items[S.moving]; o.x = S.x; o.z = S.z; o.r = S.rot; }
    else { Save.data.fan -= S.item.cost; d.items.push({ id: S.item.id, x: S.x, z: S.z, r: S.rot }); AMC.Audio.sfx('buy'); W.particles.burst(S.x, 0.6, S.z, 0xffd23f, 24, { speed: 4 }); }
    Save.save(); E.apply();
    const again = S.moving < 0 && Save.data.fan >= S.item.cost;
    S.moving = -1;
    if (!again) { S.item = null; S.phase = 'browse'; setGhost(null); }
    renderUi();
  }
  E.update = function (dt) {
    if (!S) return;
    // Kamera (Umlaufbahn)
    S.yaw -= (I.look.x || 0) * dt * 2.2 + I.mouse.dx * 0.006; S.dist = U.clamp(S.dist + (I.look.y || 0) * dt * 6 + I.zoom * 0.8, 6, 16); I.mouse.dx = 0; I.mouse.dy = 0; I.zoom = 0;
    const cam = W.camera, cx = 0, cz = 1;
    cam.position.set(cx + Math.sin(S.yaw) * S.dist, 6.2 + S.dist * 0.35, cz + Math.cos(S.yaw) * S.dist); cam.lookAt(cx, 0.6, cz - 0.4);
    if (I.hit('back') || I.hit('pause')) { I.eat('pause'); if (S.phase === 'browse') { AMC.Audio.sfx('back'); return E.close(); } return cancel(); }
    const ph = I.padHits[0] || [];
    if (S.phase === 'browse') {
      const n = list().length;
      if (I.hit('left') || I.hit('up')) { S.sel = (S.sel + n - 1) % n; AMC.Audio.sfx('move'); renderUi(); }
      if (I.hit('right') || I.hit('down')) { S.sel = (S.sel + 1) % n; AMC.Audio.sfx('move'); renderUi(); }
      const ks = Object.keys(CAT);
      if (ph.includes('lb') || ph.includes('rb') || I.hit('radioNext')) { S.cat = ks[(ks.indexOf(S.cat) + (ph.includes('lb') ? ks.length - 1 : 1)) % ks.length]; S.sel = 0; AMC.Audio.sfx('move'); renderUi(); }
      if (I.hit('ok')) take();
      else if (I.hit('act')) doAct('pickmode');
    } else if (S.phase === 'place') {
      // relativ zur Kamera bewegen
      const mx = I.move.x || 0, my = I.move.y || 0;
      if (mx || my) { const s = Math.sin(S.yaw), c = Math.cos(S.yaw), sp = 4.5 * dt; S.x += (mx * c + my * s) * sp; S.z += (-mx * s + my * c) * sp; S.x = U.clamp(S.x, BOUND.x0, BOUND.x1); S.z = U.clamp(S.z, BOUND.z0, BOUND.z1); S.free = true; }
      else if (S.free) { snap(); S.free = false; }
      ['up', 'down', 'left', 'right'].forEach(dd => { if (I.hit(dd) && I.device === 'pad' && !mx && !my) { const s = Math.sin(S.yaw), c = Math.cos(S.yaw), v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dd]; S.x += (v[0] * c + v[1] * s) * 0.5; S.z += (-v[0] * s + v[1] * c) * 0.5; snap(); } });
      if (I.hit('swap')) doAct('rot');
      if (I.hit('ok')) place();
    } else if (S.phase === 'pick') {
      if (I.hit('left') || I.hit('up')) doAct('prev'); if (I.hit('right') || I.hit('down')) doAct('next');
      if (I.hit('ok')) doAct('move'); else if (I.hit('act')) doAct('sell');
    }
    if (S.ghost) {
      S.ghost.position.set(S.x, 0, S.z); S.ghost.rotation.y += (S.rot - S.ghost.rotation.y) * Math.min(1, dt * 14);
      const ok = S.item && free(S.x, S.z, S.item.flat ? 0.2 : S.item.r * 0.6), ring = S.ghost.userData.ring;
      ring.material.color.setHex(ok ? 0x6cff8a : 0xff4a4a); const r = (S.item ? S.item.r : 0.5); ring.scale.setScalar(r / 0.12 * (1 + Math.sin(performance.now() / 160) * 0.04));
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
