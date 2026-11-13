/* AnMaCha – Der Podcast: eigene Figuren für Marco, Andrew und die Fans.
   Körper, Kleidung, Gesicht und Haare entstehen hier als EIN weich gehäuteter Körper (realistische, schlanke Proportionen statt Superhelden-Muskeln),
   der auf dem Skelett der easygames-Figuren sitzt – so laufen alle 22 Bewegungen weiter (Laufen, Springen, Tanzen …).
   Marco: braune Haare, Vollbart, etwas kräftiger. Andrew: rotblonde kurze Haare, glatt rasiert, schlank. Beide: schwarzes Polo mit AnMaCha-Logo,
   Namensschild und Festival-Ausweis am Band (nach dem Foto vom Podfluencer Festival). Pro Figur 1 Draw-Call für den Körper + kleine Extras. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const P = AMC.People = {};
  let T = null;

  // ------------------------------------------------------------------ Geometrie-Sammler (ein Körper = eine Geometrie mit Farbe + Knochen-Gewichten)
  function Builder(bones) {
    const pos = [], nor = [], col = [], si = [], sw = [], idx = [];
    const bi = n => { const i = bones.indexOf(n); return i < 0 ? 0 : i; };
    return {
      bi,
      /** g: BufferGeometry in Ruhe-Weltkoordinaten; color(v, i) → Color; weight(v, i) → [[bone, w], …] */
      add(g, color, weight) {
        if (!g.index) { const n = g.attributes.position.count, ix = []; for (let i = 0; i < n; i++) ix.push(i); g.setIndex(ix); }
        if (!g.attributes.normal) g.computeVertexNormals();
        const p = g.attributes.position, nn = g.attributes.normal, base = pos.length / 3, v = new T.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.set(p.getX(i), p.getY(i), p.getZ(i)); pos.push(v.x, v.y, v.z); nor.push(nn.getX(i), nn.getY(i), nn.getZ(i));
          const c = typeof color === 'function' ? color(v, i) : color; col.push(c.r, c.g, c.b);
          const w = (typeof weight === 'function' ? weight(v, i) : weight).slice(0, 4); let s = 0; w.forEach(x => { s += x[1]; });
          for (let k = 0; k < 4; k++) { si.push(w[k] ? bi(w[k][0]) : 0); sw.push(w[k] ? w[k][1] / s : 0); }
        }
        const ix = g.index.array; for (let k = 0; k < ix.length; k++) idx.push(ix[k] + base);
        g.dispose();
      },
      geometry() {
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
        g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
        g.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
        g.setIndex(idx); g.computeBoundingSphere(); return g;
      }
    };
  }

  // Röhre entlang A→B mit elliptischen Ringen: rings = [{ t, rx, rz, c, dz }] (rx in Richtung ex, rz in Richtung ez)
  function tube(A, B, ex0, rings, seg, caps) {
    seg = seg || 18;
    const u = B.clone().sub(A), len = u.length(); u.normalize();
    const ex = ex0.clone().sub(u.clone().multiplyScalar(ex0.dot(u))).normalize(), ez = new T.Vector3().crossVectors(ex, u).normalize();
    const pos = [], ix = [], ringOf = [];
    rings.forEach((r, k) => {
      const c = A.clone().addScaledVector(u, r.t * len).addScaledVector(ez, r.dz || 0).addScaledVector(ex, r.dx || 0);
      for (let s = 0; s < seg; s++) {
        const a = s / seg * Math.PI * 2, x = Math.cos(a) * r.rx, z = Math.sin(a) * r.rz * (r.flat && Math.sin(a) < 0 ? r.flat : 1);
        const p = c.clone().addScaledVector(ex, x).addScaledVector(ez, z); pos.push(p.x, p.y, p.z); ringOf.push(k);
      }
    });
    for (let k = 0; k < rings.length - 1; k++) for (let s = 0; s < seg; s++) {
      const a = k * seg + s, b = k * seg + (s + 1) % seg, c = a + seg, d = b + seg; ix.push(a, c, b, b, c, d);
    }
    if (caps !== false) {
      [0, rings.length - 1].forEach((k, e) => {
        const r = rings[k], c = A.clone().addScaledVector(u, r.t * len).addScaledVector(ez, r.dz || 0).addScaledVector(ex, r.dx || 0).addScaledVector(u, (e ? 1 : -1) * Math.min(r.rx, r.rz) * 0.5);
        const ci = pos.length / 3; pos.push(c.x, c.y, c.z); ringOf.push(k);
        for (let s = 0; s < seg; s++) { const a = k * seg + s, b = k * seg + (s + 1) % seg; if (e) ix.push(a, b, ci); else ix.push(b, a, ci); }
      });
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(ix);
    orient(g, A.clone().add(B).multiplyScalar(0.5)); g.userData.ring = ringOf; g.userData.len = len;
    return g;
  }
  // Normalen nach außen (Wicklung prüfen)
  function orient(g, center) {
    g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal; let out = 0;
    for (let i = 0; i < p.count; i++) out += (p.getX(i) - center.x) * n.getX(i) + (p.getY(i) - center.y) * n.getY(i) + (p.getZ(i) - center.z) * n.getZ(i);
    if (out < 0) { const ix = g.index.array; for (let t = 0; t < ix.length; t += 3) { const k = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = k; } g.index.needsUpdate = true; g.computeVertexNormals(); }
    return g;
  }
  function ellipsoid(c, r, ws, hs, mod) {
    const g = new T.SphereGeometry(1, ws || 16, hs || 12), p = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.set(p.getX(i) * r[0], p.getY(i) * r[1], p.getZ(i) * r[2]); if (mod) mod(v); p.setXYZ(i, v.x + c.x, v.y + c.y, v.z + c.z); }
    g.computeVertexNormals(); return g;
  }
  // Dreiecke entfernen, deren Ecken nicht alle keep(v) erfüllen
  function clip(g, keep) {
    const p = g.attributes.position, ix = g.index.array, out = [], v = new T.Vector3(), ok = [];
    for (let i = 0; i < p.count; i++) ok.push(keep(v.set(p.getX(i), p.getY(i), p.getZ(i))));
    for (let t = 0; t < ix.length; t += 3) if (ok[ix[t]] && ok[ix[t + 1]] && ok[ix[t + 2]]) out.push(ix[t], ix[t + 1], ix[t + 2]);
    g.setIndex(out); return g;
  }
  // Teile außerhalb der Fläche unter die Haut drücken (weiche Ränder statt Treppen beim Abschneiden)
  function sink(g, c, keep) {
    const p = g.attributes.position, v = new T.Vector3(), d = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); if (keep(v)) continue; d.copy(v).sub(c).multiplyScalar(0.8).add(c); p.setXYZ(i, d.x, d.y, d.z); }
    g.computeVertexNormals(); return g;
  }
  const lerp = (a, b, k) => a + (b - a) * k, sat = x => Math.max(0, Math.min(1, x));
  function hash(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }

  // ------------------------------------------------------------------ Logo-/Namens-Aufdruck und Festival-Ausweis (eine Textur je Figur)
  function decalTex(name, badge) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    // oben: Logo + Name (Brust)
    g.clearRect(0, 0, 256, 256);
    const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    g.fillStyle = '#ff8a1e'; rr(34, 6, 60, 60, 10); g.fill();
    g.fillStyle = '#1a1a1a'; rr(42, 14, 44, 44, 6); g.fill();
    g.fillStyle = '#ff8a1e'; g.beginPath(); g.moveTo(56, 22); g.lineTo(78, 36); g.lineTo(56, 50); g.closePath(); g.fill();
    if (name) { g.fillStyle = '#fff'; g.font = 'bold 26px Fredoka, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(name, 64, 100); }
    // unten: Ausweis (Podfluencer Festival)
    if (badge) {
      g.fillStyle = '#f2f2f2'; rr(140, 132, 104, 120, 8); g.fill();
      g.fillStyle = '#1b1b1b'; rr(140, 132, 104, 46, 8); g.fill(); g.fillRect(140, 160, 104, 18);
      g.fillStyle = '#ffc400'; g.beginPath(); g.moveTo(140, 252); g.lineTo(140, 214); g.lineTo(200, 252); g.closePath(); g.fill();
      g.fillStyle = '#ffc400'; g.font = 'bold 15px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('PODFLUENCER', 192, 155);
      g.fillStyle = '#fff'; g.font = 'italic 13px Arial'; g.fillText('Festival', 192, 172);
      g.fillStyle = '#ddd'; g.fillRect(170, 190, 44, 30); g.fillStyle = '#666'; g.font = '10px Arial'; g.fillText(name || '', 192, 209);
    }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }

  // ------------------------------------------------------------------ Steckbriefe → Figur
  const DEF = { body: 'm', skin: '#eec3a3', hair: { style: 'short', color: '#4a3020' }, top: '#2f6bff', topStyle: 'tee', bottom: '#2c3554', bottomStyle: 'pants', shoes: '#f2f2f2', eyes: '#4b6b8a' };

  /** kit: EasyFiguren-Baukasten (liefert Skelett + Bewegungen); look siehe DEF; extras: { name, badge, logo, build, face } */
  P.make = async function (kit, look) {
    T = root.THREE;
    const L = Object.assign({}, DEF, look || {}), L0 = Object.assign({}, L);
    const fig = await kit.make({ body: 'm', hair: { style: 'bald' }, skin: L.skin, top: L.top, bottom: L.bottom, shoes: L.shoes, bulk: 1 });
    // Original-Körper verstecken (Skelett + Bewegungen bleiben)
    fig.scene.traverse(o => { if (o.isMesh) o.visible = false; });
    fig.extra.forEach(e => { e.visible = false; });
    fig.scene.updateMatrixWorld(true);
    const boneList = []; fig.scene.traverse(o => { if (o.isBone) boneList.push(o); });
    const names = boneList.map(b => b.name), B = n => fig.bones[n], W = n => B(n).getWorldPosition(new T.Vector3());
    const bd = Builder(names), C = c => new T.Color(c).convertSRGBToLinear();
    const woman = L.body === 'w', build = L.build || (woman ? 0.92 : 1), belly = L.belly || 0;
    const cSkin = C(L.skin), cTop = C(L.top), cBot = C(L.bottom), cShoe = C(L.shoes), cHair = C((L.hair && L.hair.color) || '#3a2a1a'), cSole = C('#e8e8e8');
    const cBeard = C(L.beard || (L.hair && L.hair.color) || '#3a2a1a'), cLip = C(L.lip || '#b8665a'), cBrow = C(L.brow || (L.hair && L.hair.color) || '#3a2a1a');
    const shade = (c, k) => c.clone().multiplyScalar(k);
    const X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), Z = new T.Vector3(0, 0, 1);

    // ---------------- Rumpf (Hüfte bis Hals) – Polo über Jeans
    const pel = W('pelvis'), s1 = W('spine_01'), s2 = W('spine_02'), s3 = W('spine_03'), nk = W('neck_01'), hd = W('Head');
    const ua = { l: W('upperarm_l'), r: W('upperarm_r') }, la = { l: W('lowerarm_l'), r: W('lowerarm_r') }, ha = { l: W('hand_l'), r: W('hand_r') };
    const th = { l: W('thigh_l'), r: W('thigh_r') }, ca = { l: W('calf_l'), r: W('calf_r') }, ft = { l: W('foot_l'), r: W('foot_r') }, ba = { l: W('ball_l'), r: W('ball_r') };
    const shY = ua.l.y, hipY = th.l.y, sx = ua.l.x;   // Schulterhöhe, Hüftgelenk, Schulterbreite (Skelett)
    const hem = L.topStyle === 'none' ? hipY + 0.02 : hipY + 0.035;   // Saum des Oberteils
    const top = L.topStyle !== 'none';
    const TR = [   // y, rx, rz, Vorwärtsversatz
      [hipY - 0.09, 0.15, 0.105, 0.0],
      [hipY - 0.03, 0.172, 0.118, 0.0],
      [hipY + 0.03, 0.172, 0.118, 0.004],
      [hem - 0.002, 0.168, 0.116, 0.006],
      [hem + 0.004, 0.176, 0.124, 0.008],
      [s1.y + 0.04, 0.172 + belly * 0.01, 0.122 + belly * 0.03, 0.014 + belly * 0.02],
      [s2.y + 0.04, 0.172 + belly * 0.008, 0.124 + belly * 0.022, 0.02 + belly * 0.012],
      [s3.y + 0.03, 0.182, 0.122 + (woman ? 0.018 : 0), 0.024],
      [shY - 0.04, 0.198, 0.112, 0.016],
      [shY + 0.025, 0.19, 0.098, 0.008],
      [shY + 0.06, 0.12, 0.085, 0.0],
      [nk.y + 0.012, 0.062, 0.058, 0.0]
    ].map(r => ({ y: r[0], rx: r[1] * (woman && r[0] > s3.y ? 0.9 : woman && r[0] < s1.y ? 1.06 : 1) * build, rz: r[2] * build, dz: r[3] }));
    {
      const A = new T.Vector3(0, TR[0].y, -0.01), Bp = new T.Vector3(0, TR[TR.length - 1].y, -0.01), len = Bp.y - A.y;
      const g = tube(A, Bp, X, TR.map(r => ({ t: (r.y - A.y) / len, rx: r.rx, rz: r.rz, dz: r.dz })), 26);
      const ring = g.userData.ring, TOP = top && L.topStyle === 'tank' ? 2 : top ? 1 : 0;
      bd.add(g, (v, i) => {
        const k = ring[i]; if (k <= 3) return v.y < hipY - 0.06 ? shade(cBot, 0.9) : cBot;
        if (!TOP) return cSkin;
        if (TOP === 2 && v.y > shY - 0.06 && Math.abs(v.x) > 0.06 && Math.abs(v.x) < 0.2 && !(Math.abs(v.x) > 0.085 && Math.abs(v.x) < 0.12)) return cSkin;
        return cTop;
      }, v => {
        const y = v.y, sd = v.x > 0 ? 'l' : 'r';
        if (y < s1.y) { const k = sat((y - hipY) / (s1.y - hipY)), w = [['pelvis', 1 - k], ['spine_01', k]]; if (y < hipY + 0.02 && Math.abs(v.x) > 0.06) w.push(['thigh_' + sd, 0.35 * sat((hipY + 0.02 - y) / 0.1)]); return w; }
        if (y < s2.y) { const k = (y - s1.y) / (s2.y - s1.y); return [['spine_01', 1 - k], ['spine_02', k]]; }
        if (y < s3.y) { const k = (y - s2.y) / (s3.y - s2.y); return [['spine_02', 1 - k], ['spine_03', k]]; }
        if (y > shY - 0.02 && Math.abs(v.x) > 0.11) return [['spine_03', 0.6], ['clavicle_' + sd, 0.4]];
        if (y > nk.y - 0.01) return [['spine_03', 0.5], ['neck_01', 0.5]];
        return [['spine_03', 1]];
      });
      // Polo-Kragen
      if (top && L.topStyle !== 'tank') {
        const cg = tube(new T.Vector3(0, nk.y - 0.025, -0.012), new T.Vector3(0, nk.y + 0.02, -0.01), X, [
          { t: 0, rx: 0.074, rz: 0.07, dz: 0.004 }, { t: 0.5, rx: 0.068, rz: 0.066, dz: 0.002 }, { t: 1, rx: 0.064, rz: 0.062 }], 22, false);
        clip(cg, v => !(v.z > 0.035 && Math.abs(v.x) < 0.022));   // vorne offen (Knopfleiste)
        bd.add(cg, shade(cTop, 0.85), [['spine_03', 0.5], ['neck_01', 0.5]]);
      }
    }
    // ---------------- Hals
    bd.add(tube(new T.Vector3(0, nk.y - 0.03, -0.012), new T.Vector3(0, hd.y + 0.035, 0.008), X,
      [{ t: 0, rx: 0.052, rz: 0.05 }, { t: 0.5, rx: 0.046, rz: 0.046 }, { t: 1, rx: 0.044, rz: 0.044 }], 16, false), cSkin,
      v => { const k = sat((v.y - nk.y) / (hd.y - nk.y)); return [['neck_01', 1 - k * 0.6], ['Head', k * 0.6]]; });

    // ---------------- Arme (Ruhepose waagerecht) mit Ärmel
    const sleeve = !top || L.topStyle === 'tank' ? 0 : L.topStyle === 'long' ? 1.95 : 0.5;
    for (const sd of ['l', 'r']) {
      const s = sd === 'l' ? 1 : -1, U = ua[sd], Lw = la[sd], H = ha[sd];
      const sh0 = U.clone().add(new T.Vector3(-s * 0.03, 0.006, 0.01));
      // Schulterkugel
      bd.add(ellipsoid(U.clone().add(new T.Vector3(-s * 0.022, 0.0, 0.01)), [0.062 * build, 0.06 * build, 0.058 * build], 16, 12), sleeve ? cTop : cSkin, [['upperarm_' + sd, 0.75], ['clavicle_' + sd, 0.25]]);
      const r0 = 0.058 * build, r1 = 0.044 * build;
      const rings = [{ t: 0, rx: r0, rz: r0 }, { t: 0.25, rx: r0 * 0.96, rz: r0 * 0.94 }];
      if (sleeve && sleeve < 1) rings.push({ t: sleeve - 0.01, rx: r0 * 1.04, rz: r0 * 1.02 }, { t: sleeve, rx: r0 * 0.86, rz: r0 * 0.84 }, { t: sleeve + 0.012, rx: r0 * 0.82, rz: r0 * 0.8 });
      rings.push({ t: 0.75, rx: r1 * 1.08, rz: r1 * 1.05 }, { t: 1.0, rx: r1, rz: r1 });
      rings.sort((a, b) => a.t - b.t);
      const g = tube(sh0, Lw, Y, rings, 16), ring = g.userData.ring;
      bd.add(g, (v, i) => { const t = rings[ring[i]].t; return sleeve >= 1 || (sleeve && t < sleeve - 0.001) ? cTop : cSkin; },
        v => { const t = sat((v.x - sh0.x) / (Lw.x - sh0.x)); return t > 0.8 ? [['upperarm_' + sd, 1 - (t - 0.8) * 2.2], ['lowerarm_' + sd, (t - 0.8) * 2.2]] : [['upperarm_' + sd, 1]]; });
      bd.add(ellipsoid(Lw.clone(), [r1 * 1.0, r1 * 1.0, r1 * 1.0], 12, 8), sleeve > 1 ? cTop : cSkin, [['upperarm_' + sd, 0.5], ['lowerarm_' + sd, 0.5]]);   // Ellbogen
      // Unterarm
      const fr = [{ t: 0, rx: r1, rz: r1 }, { t: 0.35, rx: r1 * 1.02, rz: r1 * 0.95 }, { t: 1, rx: r1 * 0.68, rz: r1 * 0.6 }];
      const fg = tube(Lw.clone(), H.clone().add(new T.Vector3(s * 0.03, 0, 0)), Y, fr, 14), cuff = sleeve > 1;
      bd.add(fg, cuff ? cTop : cSkin, v => { const t = sat((v.x - Lw.x) / (H.x - Lw.x)); return t < 0.15 ? [['lowerarm_' + sd, 0.5 + t * 3.3], ['upperarm_' + sd, 0.5 - t * 3.3]] : t > 0.9 ? [['lowerarm_' + sd, 0.6], ['hand_' + sd, 0.4]] : [['lowerarm_' + sd, 1]]; });
      // Uhr (z. B. Andrews Smartwatch am linken Handgelenk)
      if (L.watch && L.watch === sd) bd.add(tube(H.clone().add(new T.Vector3(-s * 0.05, 0, 0)), H.clone().add(new T.Vector3(-s * 0.025, 0, 0)), Y, [{ t: 0, rx: r1 * 0.78, rz: r1 * 0.72 }, { t: 1, rx: r1 * 0.78, rz: r1 * 0.72 }], 12), C('#1b1b1f'), [['lowerarm_' + sd, 1]]);
      // Hand: Handfläche + Daumen
      const hc = H.clone().add(new T.Vector3(s * 0.06, -0.004, -0.028));
      bd.add(ellipsoid(hc, [0.058, 0.024, 0.042], 14, 10), cSkin, [['hand_' + sd, 1]]);
      const tb = W('thumb_01_' + sd), te = W('thumb_03_' + sd);
      bd.add(tube(tb, te, Y, [{ t: 0, rx: 0.016, rz: 0.014 }, { t: 1, rx: 0.012, rz: 0.011 }], 10), cSkin, [['hand_' + sd, 1]]);
      // Fingerspitzen (leicht gebogen)
      bd.add(ellipsoid(hc.clone().add(new T.Vector3(s * 0.05, -0.006, 0)), [0.03, 0.017, 0.04], 12, 8), cSkin, [['hand_' + sd, 0.5], ['middle_01_' + sd, 0.5]]);
    }
    // ---------------- Beine (Jeans oder Shorts) + Schuhe
    const shorts = L.bottomStyle === 'shorts', skirt = L.bottomStyle === 'skirt';
    for (const sd of ['l', 'r']) {
      const s = sd === 'l' ? 1 : -1, A = th[sd].clone().add(new T.Vector3(-s * 0.012, 0.04, 0.0)), K = ca[sd], F = ft[sd];
      const r0 = 0.09 * build, rk = 0.058, rl = 0.044;
      const rings = [{ t: 0, rx: r0, rz: r0 * 0.95 }, { t: 0.4, rx: r0 * 0.88, rz: r0 * 0.88 }];
      if (shorts) rings.push({ t: 0.58, rx: r0 * 0.86, rz: r0 * 0.86 }, { t: 0.6, rx: rk * 1.12, rz: rk * 1.12 });
      rings.push({ t: 0.9, rx: rk * 1.04, rz: rk * 1.04 }, { t: 1, rx: rk, rz: rk });
      const g = tube(A, K, Z, rings, 16), ring = g.userData.ring;
      bd.add(g, (v, i) => (shorts && rings[ring[i]].t > 0.59) ? cSkin : cBot, v => { const t = sat((A.y - v.y) / (A.y - K.y)); return t < 0.12 ? [['thigh_' + sd, 0.6 + t * 3.3], ['pelvis', 0.4 - t * 3.3]] : t > 0.85 ? [['thigh_' + sd, 1 - (t - 0.85) * 3.3], ['calf_' + sd, (t - 0.85) * 3.3]] : [['thigh_' + sd, 1]]; });
      bd.add(ellipsoid(K.clone(), [rk * 0.97, rk * 0.97, rk * 0.97], 12, 8), shorts ? cSkin : cBot, [['thigh_' + sd, 0.5], ['calf_' + sd, 0.5]]);   // Knie
      const lr = [{ t: 0, rx: rk, rz: rk }, { t: 0.3, rx: rk * 1.04, rz: rk * 1.1, dz: -0.006 }, { t: 0.92, rx: rl, rz: rl }, { t: 1, rx: shorts ? rl * 0.9 : rl * 1.15, rz: shorts ? rl * 0.9 : rl * 1.15 }];
      const lg = tube(K.clone(), F.clone().add(new T.Vector3(0, -0.025, 0.012)), Z, lr, 14);
      bd.add(lg, shorts ? cSkin : cBot, v => { const t = sat((K.y - v.y) / (K.y - F.y)); return t < 0.12 ? [['calf_' + sd, 0.5 + t * 4], ['thigh_' + sd, 0.5 - t * 4]] : [['calf_' + sd, 1]]; });
      if (shorts) bd.add(tube(F.clone().add(new T.Vector3(0, 0.07, 0.01)), F.clone().add(new T.Vector3(0, 0.0, 0.01)), Z, [{ t: 0, rx: rl * 1.02, rz: rl * 1.02 }, { t: 1, rx: rl * 1.05, rz: rl * 1.05 }], 12, false), C('#f2f2f2'), [['calf_' + sd, 1]]);
      // Schuh: Ferse am Fuß, Spitze am Ballen
      const floor = Math.min(ba[sd].y, F.y) - 0.026, sh = new T.Vector3(F.x, floor + 0.048, F.z + 0.06);
      bd.add(ellipsoid(sh, [0.055, 0.052, 0.135], 16, 10, v => { if (v.y < -0.012) v.y = -0.012 - (-(v.y) - 0.012) * 0.6; }), (v) => v.y < floor + 0.012 ? cSole : cShoe,
        v => { const k = sat((v.z - (F.z + 0.02)) / 0.12); return [['foot_' + sd, 1 - k], ['ball_' + sd, k]]; });
    }
    if (skirt) bd.add(tube(new T.Vector3(0, hipY + 0.06, -0.01), new T.Vector3(0, ca.l.y + 0.08, -0.01), X, [{ t: 0, rx: 0.18, rz: 0.13 }, { t: 1, rx: 0.25, rz: 0.19 }], 22, false), cBot,
      v => v.y > hipY - 0.05 ? [['pelvis', 1]] : [['pelvis', 0.5], ['thigh_' + (v.x > 0 ? 'l' : 'r'), 0.5]]);

    // ---------------- Kopf: Schädel, Kiefer, Ohren, Nase, Augen, Brauen, Haare, Bart
    const hc = new T.Vector3(0, hd.y + 0.08, 0.02), R = [0.086, 0.115, 0.1];
    const jaw = v => { const yy = v.y / R[1]; if (yy < 0) { const k = Math.pow(-yy, 1.4); v.x *= 1 - 0.22 * k; v.z = v.z * (1 - 0.12 * k) + (v.z > 0 ? 0.004 * k : 0); } if (yy > 0.3 && v.z > 0) v.z *= 0.97; };
    const surfZ = (x, y) => { const jy = y / R[1], k = jy < 0 ? Math.pow(-jy, 1.4) : 0, rx = R[0] * (1 - 0.22 * k); const q = 1 - (x / rx) * (x / rx) - jy * jy; return Math.sqrt(Math.max(0, q)) * R[2] * (1 - 0.12 * k) + 0.004 * k; };
    const headW = [['Head', 1]];
    bd.add(ellipsoid(hc, R, 30, 22, jaw), cSkin, headW);
    for (const s of [1, -1]) {
      bd.add(ellipsoid(hc.clone().add(new T.Vector3(s * R[0] * 0.97, 0.0, -0.008)), [0.014, 0.03, 0.021], 10, 8), shade(cSkin, 0.95), headW);   // Ohr
      // Auge: weiß + Iris + Pupille, Lid oben
      const ex = s * 0.032, ey = 0.01, ez = surfZ(ex, ey) - 0.006, e = hc.clone().add(new T.Vector3(ex, ey, ez));
      bd.add(ellipsoid(e, [0.0155, 0.0115, 0.0095], 12, 8), C('#f4f1ec'), headW);
      bd.add(ellipsoid(e.clone().add(new T.Vector3(0, 0, 0.0075)), [0.0076, 0.0076, 0.003], 10, 6), C(L.eyes || '#4b6b8a'), headW);
      bd.add(ellipsoid(e.clone().add(new T.Vector3(0, 0, 0.0098)), [0.0036, 0.0036, 0.0016], 8, 5), C('#0d0d10'), headW);
      bd.add(ellipsoid(e.clone().add(new T.Vector3(0, 0.0112, 0.0)), [0.0168, 0.0042, 0.0102], 12, 6), shade(cSkin, 0.93), headW);   // Oberlid
      // Augenbraue
      const by = 0.034, bz = surfZ(s * 0.033, by) + 0.002;
      bd.add(tube(hc.clone().add(new T.Vector3(s * 0.014, by - 0.001, bz - 0.001)), hc.clone().add(new T.Vector3(s * 0.05, by + 0.002 - 0.004, bz - 0.012)), Y,
        [{ t: 0, rx: 0.0042, rz: 0.003 }, { t: 0.6, rx: 0.0048, rz: 0.003 }, { t: 1, rx: 0.003, rz: 0.002 }], 8), cBrow, headW);
    }
    // Nase
    bd.add(ellipsoid(hc.clone().add(new T.Vector3(0, -0.022, surfZ(0, -0.022) + 0.004)), [0.0125, 0.02, 0.014], 12, 10, v => { if (v.y > 0) { v.x *= 1 - v.y / 0.04; v.z *= 1 - v.y / 0.05; } }), shade(cSkin, 1.02), headW);
    for (const s of [1, -1]) bd.add(ellipsoid(hc.clone().add(new T.Vector3(s * 0.011, -0.036, surfZ(0.011, -0.036) + 0.002)), [0.0075, 0.006, 0.008], 8, 6), cSkin, headW);
    // Bart (Vollbart: Wangen, Kinn, Oberlippe)
    const bearded = !!L.beard, bf = 1.075;
    if (bearded) {
      const g = ellipsoid(hc.clone().add(new T.Vector3(0, -0.004, 0.002)), [R[0] * bf, R[1] * 1.08, R[2] * bf], 72, 54, v => {
        jaw(v); const k = v.y / R[1]; if (k < -0.25) { v.z += 0.012 * sat((-k - 0.25) * 2) * sat(v.z / R[2] + 0.3); v.y -= 0.01 * sat((-k - 0.5) * 2) * sat(v.z / R[2]); }
        const n = hash(v.x * 300, v.y * 300, v.z * 300); v.multiplyScalar(1 + (n - 0.5) * 0.02);
      });
      sink(g, hc, v => {
        const x = v.x - hc.x, y = v.y - hc.y, z = v.z - hc.z, ax = Math.abs(x);
        if (z < -0.035) return false;                              // hinten frei
        if (ax > 0.07 && z < -0.005) return y < 0.012;
        return y < -0.043 + 0.056 * Math.pow(sat((ax - 0.012) / 0.062), 1.5);   // Oberlippe → Wange → Koteletten
      });
      bd.add(g, (v) => shade(cBeard, 0.85 + hash(v.x * 900, v.y * 900, v.z * 900) * 0.3), headW);
    }
    if (bearded) {   // Schnurrbart über der Oberlippe
      const my0 = -0.046, z0 = surfZ(0, my0) * 1.075 + 0.014;
      bd.add(tube(hc.clone().add(new T.Vector3(-0.03, my0 - 0.008, z0 - 0.012)), hc.clone().add(new T.Vector3(0.03, my0 - 0.008, z0 - 0.012)), Y,
        [{ t: 0, rx: 0.004, rz: 0.004, dz: 0 }, { t: 0.25, rx: 0.007, rz: 0.008, dz: -0.009 }, { t: 0.5, rx: 0.0075, rz: 0.009, dz: -0.012 }, { t: 0.75, rx: 0.007, rz: 0.008, dz: -0.009 }, { t: 1, rx: 0.004, rz: 0.004, dz: 0 }], 10),
        v => shade(cBeard, 0.8 + hash(v.x * 900, v.y * 900, v.z * 900) * 0.3), headW);
    }
    // Mund (eigenes Teil fürs Sprechen): Lippen + Zähne
    const my = -0.058, mz = surfZ(0, my) + (bearded ? 0.014 : 0.002), mouthPos = hc.clone().add(new T.Vector3(0, my, mz));
    // Haare
    const hair = L.hair && L.hair.style !== 'bald' ? L.hair : null;
    if (hair) {
      const st = hair.style, vol = hair.vol || 1, long = /^(long|bob|pony|bun)$/.test(st);
      const front = st === 'buzz' ? 0.09 : st === 'fringe' ? 0.04 : 0.086;
      const g = ellipsoid(hc.clone().add(new T.Vector3(0, 0.006, -0.006)), [R[0] * 1.07, R[1] * 1.04, R[2] * 1.1], L.name ? 72 : 36, L.name ? 54 : 26, v => {
        const y = v.y, z = v.z; const tY = y / R[1];
        let d = st === 'buzz' ? 0.002 : 0.006 * vol;
        if (tY > 0.3 && st !== 'buzz') d += (0.012 + (hair.quiff || 0) * (z > 0 ? sat(z / R[2]) : 0)) * vol * sat((tY - 0.3) * 1.6);
        if (st === 'curly' || st === 'spike') d += hash(v.x * 120, v.y * 120, v.z * 120) * (st === 'spike' ? 0.03 : 0.014);
        if (hair.part && tY > 0.5 && v.x < -0.01) d += 0.006;
        const len = Math.hypot(v.x, v.y, v.z) || 1; v.multiplyScalar(1 + d / len);
        if (st === 'buzz') return;
      });
      sink(g, hc, v => {
        const x = v.x - hc.x, y = v.y - hc.y, z = v.z - hc.z, ax = Math.abs(x), zn = z / R[2];
        const lineF = front - Math.max(0, ax - 0.02) * 0.45 + Math.max(0, 0.02 - ax) * 0.3;          // Stirn (leicht gebogen) → Schläfe
        const lineS = long ? -0.13 : st === 'buzz' ? 0.05 : 0.045;   // seitlich über/hinter dem Ohr
        const lineB = long ? -0.16 : st === 'buzz' ? -0.06 : -0.07;   // Nacken
        const line = zn > 0.25 ? lerp(lineS, lineF, sat((zn - 0.25) / 0.45)) : zn < -0.1 ? lerp(lineS, lineB, sat((-zn - 0.1) / 0.5)) : lineS;
        if (long && zn > 0.4 && ax < 0.06) return y > lineF;
        return y > line;
      });
      bd.add(g, v => shade(cHair, 0.82 + hash(v.x * 400, v.y * 2000, v.z * 400) * 0.35), headW);
      if (st === 'long' || st === 'bob') {   // Haarvorhang hinten bis Schulter/Kinn
        const lo = st === 'long' ? shY - 0.02 : hc.y - 0.1;
        const cg = tube(new T.Vector3(0, hc.y + 0.02, hc.z - 0.012), new T.Vector3(0, lo, hc.z - 0.03), X,
          [{ t: 0, rx: R[0] * 1.1, rz: R[2] * 1.06 }, { t: 0.5, rx: R[0] * 1.2, rz: R[2] * 1.02 }, { t: 1, rx: R[0] * (st === 'long' ? 1.35 : 1.15), rz: R[2] * 0.75 }], 24, false);
        clip(cg, v => v.z - hc.z < (v.y > hc.y - 0.07 ? -0.02 : 0.02) || Math.abs(v.x) > 0.07);
        bd.add(cg, v => shade(cHair, 0.8 + hash(v.x * 400, v.y * 2000, v.z * 400) * 0.3), v => v.y < hc.y - 0.12 ? [['Head', 0.6], ['neck_01', 0.4]] : headW);
      }
      if (st === 'bun') bd.add(ellipsoid(hc.clone().add(new T.Vector3(0, 0.1, -0.07)), [0.045, 0.04, 0.042], 14, 10), cHair, headW);
      if (st === 'pony') bd.add(tube(hc.clone().add(new T.Vector3(0, 0.04, -0.1)), hc.clone().add(new T.Vector3(0, -0.14, -0.15)), X, [{ t: 0, rx: 0.03, rz: 0.03 }, { t: 0.4, rx: 0.035, rz: 0.032 }, { t: 1, rx: 0.012, rz: 0.012 }], 10), cHair, headW);
    }
    // Kopfbedeckungen
    const hat = L.hat && L.hat.type ? L.hat : null;
    if (hat) {
      const cH = C(hat.color || '#222');
      if (hat.type === 'cap' || hat.type === 'beanie') {
        const g = ellipsoid(hc.clone().add(new T.Vector3(0, 0.012, -0.004)), [R[0] * 1.13, R[1] * (hat.type === 'beanie' ? 1.12 : 1.06), R[2] * 1.13], 24, 16);
        clip(g, v => v.y - hc.y > (hat.type === 'beanie' ? 0.025 : 0.035)); bd.add(g, cH, headW);
        if (hat.type === 'cap') bd.add(ellipsoid(hc.clone().add(new T.Vector3(0, 0.04, R[2] + 0.035)), [0.07, 0.006, 0.06], 16, 6), cH, headW);
      } else if (hat.type === 'tophat') {
        bd.add(tube(hc.clone().add(new T.Vector3(0, 0.07, 0)), hc.clone().add(new T.Vector3(0, 0.25, 0)), X, [{ t: 0, rx: 0.075, rz: 0.075 }, { t: 1, rx: 0.08, rz: 0.08 }], 18), cH, headW);
        bd.add(tube(hc.clone().add(new T.Vector3(0, 0.07, 0)), hc.clone().add(new T.Vector3(0, 0.08, 0)), X, [{ t: 0, rx: 0.13, rz: 0.13 }, { t: 1, rx: 0.13, rz: 0.13 }], 20), cH, headW);
      } else if (hat.type === 'crown') {
        bd.add(tube(hc.clone().add(new T.Vector3(0, 0.09, 0)), hc.clone().add(new T.Vector3(0, 0.15, 0)), X, [{ t: 0, rx: 0.075, rz: 0.075 }, { t: 1, rx: 0.08, rz: 0.08 }], 10, false), cH, headW);
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; bd.add(ellipsoid(hc.clone().add(new T.Vector3(Math.sin(a) * 0.078, 0.16, Math.cos(a) * 0.078)), [0.012, 0.022, 0.012], 6, 5), cH, headW); }
      } else if (hat.type === 'band') {
        bd.add(tube(hc.clone().add(new T.Vector3(0, 0.035, 0)), hc.clone().add(new T.Vector3(0, 0.06, 0)), X, [{ t: 0, rx: R[0] * 1.12, rz: R[2] * 1.12 }, { t: 1, rx: R[0] * 1.1, rz: R[2] * 1.1 }], 20, false), cH, headW);
      } else if (hat.type === 'sunglasses') {
        for (const s of [1, -1]) bd.add(ellipsoid(hc.clone().add(new T.Vector3(s * 0.032, 0.01, surfZ(0.032, 0.01) + 0.008)), [0.022, 0.015, 0.004], 12, 6), C('#0c0c0e'), headW);
        bd.add(tube(hc.clone().add(new T.Vector3(-0.011, 0.016, surfZ(0, 0.016) + 0.01)), hc.clone().add(new T.Vector3(0.011, 0.016, surfZ(0, 0.016) + 0.01)), Y, [{ t: 0, rx: 0.002, rz: 0.002 }, { t: 1, rx: 0.002, rz: 0.002 }], 6), C('#0c0c0e'), headW);
      }
    }
    // Festival-Band (Lanyard) um den Hals bis zum Ausweis
    const badgeY = s2.y + 0.045, badgeZ = TR[6].rz + TR[6].dz - 0.01 + 0.012;
    if (L.badge) {
      for (const s of [1, -1]) {
        const a = new T.Vector3(s * 0.05, nk.y - 0.005, 0.045), b = new T.Vector3(s * 0.012 + 0.03, badgeY + 0.075, badgeZ + 0.008);
        bd.add(tube(a, b, Z, [{ t: 0, rx: 0.006, rz: 0.0015 }, { t: 1, rx: 0.006, rz: 0.0015 }], 6), C('#111114'), v => v.y > s3.y + 0.1 ? [['spine_03', 0.7], ['neck_01', 0.3]] : [['spine_03', 1]]);
      }
    }

    // ---------------- Körper zusammensetzen
    const geo = bd.geometry();
    const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0, skinning: true });
    mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.06;'); };
    mat.customProgramCacheKey = () => 'amc-people';
    const skel = new T.Skeleton(boneList);
    const body = new T.SkinnedMesh(geo, mat); body.frustumCulled = false; body.castShadow = true; body.receiveShadow = false;
    fig.scene.add(body); fig.scene.updateMatrixWorld(true); body.bind(skel, body.matrixWorld);
    fig.mats.length = 0; fig.mats.push(mat); fig.body = body;
    const headB = B('Head'), headInv = headB.matrixWorld.clone().invert();
    const toHead = m => { m.updateMatrix(); m.matrix.premultiply(headInv); m.matrix.decompose(m.position, m.quaternion, m.scale); headB.add(m); fig.extra.push(m); return m; };
    // Mund: Lippen (dunkel) + Zähne, skaliert beim Sprechen
    {
      const mg = new T.Group(); mg.position.copy(mouthPos);
      const lip = new T.Mesh(new T.CircleGeometry(0.018, 18, Math.PI, Math.PI), new T.MeshStandardMaterial({ color: C('#5a1f1c'), roughness: 0.6 })); lip.scale.set(1, 0.62, 1);
      const teeth = new T.Mesh(new T.PlaneGeometry(0.028, 0.005), new T.MeshStandardMaterial({ color: C('#f6f3ee'), roughness: 0.4 })); teeth.position.set(0, -0.0025, 0.0004);
      const ul = new T.Mesh(new T.TorusGeometry(0.0182, 0.0024, 6, 18, Math.PI), new T.MeshStandardMaterial({ color: cLip, roughness: 0.6 })); ul.rotation.z = Math.PI; ul.scale.set(1, 0.62, 0.6);
      mg.add(lip, teeth, ul); mg.rotation.x = -0.12; toHead(mg); fig.extra.pop(); fig.mouth = mg;
      mg.traverse(o => { if (o.material) fig.mats.push(o.material); });
    }
    // Schmuck: Nasenpiercing (Septum-Ring) und Ohrring mit Kreuz
    if (L.piercing || L.earring) {
      const met = new T.MeshStandardMaterial({ color: 0xc8ccd4, metalness: 0.9, roughness: 0.25 }), blk = new T.MeshStandardMaterial({ color: 0x18181c, metalness: 0.6, roughness: 0.35 });
      fig.mats.push(met, blk);
      if (L.piercing) { const r = new T.Mesh(new T.TorusGeometry(0.0062, 0.0011, 6, 16), met); r.position.copy(hc).add(new T.Vector3(0, -0.043, surfZ(0, -0.04) + 0.006)); r.rotation.x = 0.35; toHead(r); }
      if (L.earring) {
        const sx = L.earring === 'r' ? -1 : 1, e = new T.Group(); e.position.copy(hc).add(new T.Vector3(sx * R[0] * 0.99, -0.03, -0.004));
        const hoop = new T.Mesh(new T.TorusGeometry(0.0045, 0.001, 6, 12), blk); hoop.rotation.y = Math.PI / 2; e.add(hoop);
        const v = new T.Mesh(new T.BoxGeometry(0.0022, 0.016, 0.0022), blk); v.position.y = -0.012; e.add(v);
        const h = new T.Mesh(new T.BoxGeometry(0.0022, 0.0022, 0.009), blk); h.position.y = -0.009; e.add(h);
        toHead(e); fig.extra.pop(); fig.ear = e;
      }
    }
    // Aufdruck (Logo + Name) und Ausweis: flache Teile auf dem Oberkörper
    if (L.logo || L.badge) {
      const tex = decalTex(L.logo ? L.name : '', L.badge), m = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, alphaTest: 0.05 });
      const sp = B('spine_03'), inv = sp.matrixWorld.clone().invert(), g = new T.Group();
      if (L.logo) {
        const zc = TR[7].rz + TR[7].dz - 0.012, pg = new T.PlaneGeometry(0.06, 0.06); const uv = pg.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.5, 0.5 + uv.getY(i) * 0.5);
        const pm = new T.Mesh(pg, m); pm.position.set(0.075, s3.y + 0.065, zc + 0.006); pm.rotation.y = 0.32; g.add(pm);
      }
      if (L.badge) {
        const pg = new T.PlaneGeometry(0.052, 0.06); const uv = pg.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.53 + uv.getX(i) * 0.45, uv.getY(i) * 0.5);
        const pm = new T.Mesh(pg, m); pm.position.set(0.03, badgeY + 0.04, badgeZ + 0.012); pm.rotation.x = -0.12; g.add(pm);
      }
      g.children.slice().forEach(c => { c.updateMatrix(); c.matrix.premultiply(inv); c.matrix.decompose(c.position, c.quaternion, c.scale); sp.add(c); fig.extra.push(c); });
      fig.mats.push(m);
    }
    // ---------------- Leben: Blinzeln, Sprechen, Atmen
    const baseUpd = fig.update; let tt = Math.random() * 10, talk = 0, talkT = 0, blinkT = 2 + Math.random() * 3;
    fig.talk = on => { talk = on ? 1 : 0; };
    fig.update = dt => {
      baseUpd(dt); tt += dt;
      if (fig.mouth) {
        talkT += dt * (talk ? 14 : 4);
        const open = talk ? 0.65 + Math.abs(Math.sin(talkT)) * 0.9 + Math.sin(talkT * 2.7) * 0.2 : 1;
        fig.mouth.scale.y += (open - fig.mouth.scale.y) * Math.min(1, dt * 18);
      }
    };
    fig.look = L0; fig.people = true;
    const baseDispose = fig.dispose;
    fig.dispose = () => { baseDispose(); geo.dispose(); [fig.mouth, fig.ear].forEach(g => g && g.traverse(o => { if (o.geometry) o.geometry.dispose(); })); };
    return fig;
  };
})(typeof window !== 'undefined' ? window : globalThis);
