// Nautilux-Erkundung in den Welten: Himmelsinseln (Luftschiff), ein See je Welt (als Schiff auf dem Wasser, als U-Boot darunter)
// und eigene Gegner in jedem Bereich: Wolkenrochen am Himmel, Seeschlangen an der Oberfläche, Tiefseefische unter Wasser.
// Die Nautilux feuert selbst auf den nächsten Gegner im selben Bereich; Steigen/Sinken mit Aktionstaste (A) und Ausweichtaste (B).
export function createNautZone(c) {
  const { T, mk, G, M, glow, scene } = c;
  const R2 = (R, a, b) => a + R() * (b - a), sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const sets = {};   // je Welt (Lunaris bleibt beim Weltwechsel erhalten)
  let Z = null, fire = 0, wake = 0, uw = null, gcd = 0;   // gcd: höchstens ein gegnerischer Schuss pro 0,9 s (machbar)
  const shotG = new T.SphereGeometry(.22, 8, 6), shotP = new T.MeshBasicMaterial({ color: 0x9af0ff }), shotE = new T.MeshBasicMaterial({ color: 0xff6a9a });

  // See: Lage je Welt (vor dem Gelände festgelegt, damit die Mulde ins Gelände kommt)
  function lakeFor(n, pathx, wl) {
    if ([5, 12].includes(n)) return null;   // Aqualis liegt unter dem Meer (dort taucht das U-Boot frei durch die Stadt)
    const side = n % 2 ? 1 : -1, z = -98, x = Math.max(-96, Math.min(96, pathx(z) + side * 60));
    return { x, z, r: 21, wl: wl ?? -1, dep: 7, kind: n === 7 ? 'lava' : n === 9 ? 'cloud' : 'water' };   // Ignara: Lavasee (Hitzeschild), Astralis: Wolkenmeer
  }
  // innerhalb des Radius liegt alles unter Wasser (Mulde bis dep tief), dahinter steigt ein Ufer an und geht ins Gelände über
  const carve = (L, q, x, z) => { if (!L) return q; const d = Math.hypot(x - L.x, z - L.z); if (d > L.r * 1.35) return q;
    if (d < L.r) return Math.min(q, L.wl - .5 - (L.dep - .5) * Math.pow(Math.max(0, 1 - (d / L.r) ** 2), .7));
    return q + (Math.min(q, L.wl - .5 + (d - L.r) * .8) - q) * (1 - sm(L.r, L.r * 1.35, d)); };
  const lakeAt = (x, z) => { const L = Z && Z.lake; return L && Math.hypot(x - L.x, z - L.z) < L.r * 1.05 && c.hgt(x, z) < L.wl - .1 ? L : null; };

  function foeMesh(kind, col) {
    const g = new T.Group(), b = new T.Group(); g.add(b); const C = M(col, { r: .5 }), E = M(0xffffff, { e: 0xffffff, ei: 2 });
    if (kind === 'sky') {   // Wolkenrochen
      const w = mk(G.oct, C, 0, 0, 0, 2.2, .35, 1.4); b.add(w); b.add(mk(G.sph, M(col, { e: col, ei: .6 }), 0, .15, .6, .5, .35, .6));
      const t = mk(G.cone0, C, 0, 0, -1.9, .12, 1.8, .12); t.rotation.x = -Math.PI / 2; b.add(t); for (const s of [-1, 1]) b.add(mk(G.sph0, E, s * .25, .3, 1.05, .08, .08, .06, false));
      b.add(glow(col, 3, 0, 0, 0, .35));
    } else if (kind === 'sea') {   // Seeschlange: Buckel aus dem Wasser und ein Kopf
      for (let i = 0; i < 3; i++) { const r = mk(G.tor, C, 0, 0, -i * 1.6, .9, .9, .9); r.rotation.y = Math.PI / 2; b.add(r); }
      const hd = mk(G.sph, C, 0, 1.1, 1.3, .55, .5, .8); b.add(hd); for (const s of [-1, 1]) b.add(mk(G.sph0, M(0xffe060, { e: 0xffc020, ei: 2 }), s * .25, 1.3, 1.85, .09, .09, .06, false));
      for (let i = 0; i < 4; i++) b.add(mk(G.cone0, M(0xffffff), (i - 1.5) * .25, .9, 1.2 - i * .05, .05, .3, .05, false));
    } else {   // Tiefseefisch mit Leuchtköder
      b.add(mk(G.sph, C, 0, 0, 0, .9, .75, 1.3)); const tl = mk(G.cone0, C, 0, 0, -1.4, .7, .9, .2); tl.rotation.x = -Math.PI / 2; b.add(tl);
      for (const s of [-1, 1]) b.add(mk(G.sph0, E, s * .45, .25, .9, .14, .14, .1, false));
      const st = mk(G.cyl0, C, 0, .9, .7, .03, .8, .03); st.rotation.x = .6; b.add(st); b.add(mk(G.sph0, M(0xaaffee, { e: 0x6affd8, ei: 2.4 }), 0, 1.25, 1.1, .14, .14, .14, false)); b.add(glow(0x6affd8, 2.4, 0, 1.25, 1.1, .7));
    }
    scene.add(g); return { g, b };
  }
  function addFoe(kind, x, y, z, col, home) {
    const lv = c.eLevel(kind === 'sky' ? 2 : 1), m = foeMesh(kind, col), hp = Math.round(c.eHp(lv) * (kind === 'sea' ? 1.6 : 1.15));
    const f = { kind, x, y, z, hx: home.x, hy: home.y, hz: home.z, hr: home.r, a: Math.random() * 6, lv, hp, max: hp, dmg: Math.round(c.eDm(lv) * (kind === 'sea' ? 1 : .8)), cd: 1 + Math.random() * 2, m, dead: 0, flash: 0 };
    m.g.position.set(x, y, z); Z.foes.push(f); return f;
  }

  // Bereich der Spielerin / des Spielers: 'sky' (Luftschiff), 'sea' (auf dem See), 'deep' (unter Wasser), sonst null
  function medium() {
    if (!c.naut.on) return null; const p = c.pl;
    if (c.nAir() && p.y > c.hgt(p.x, p.z) + 5) return 'sky';
    if (c.nSub() && c.aqua && c.aqua()) return p.y > c.hgt(p.x, p.z) + 2.5 ? 'deep' : null;
    const L = lakeAt(p.x, p.z); if (!L) return null;
    return c.nSub() && L.kind === 'water' && p.y < L.wl - .6 ? 'deep' : 'sea';
  }

  function treasure(id, x, z, y, rw, vis, name) {
    const g = c.makeChest(); g.position.set(x, y, z); scene.add(g); g.visible = !c.S().chests[id]; const gl = glow(0xffe08a, 3.4, x, y + 2, z, .55); scene.add(gl);
    c.INT.push({ x, z, name, pr: 'Schatz bergen', rad: 4.5, vis: () => !c.S().chests[id] && vis(), talk() {
      const S = c.S(); if (S.chests[id]) return; S.chests[id] = 1; g.visible = false; gl.visible = false; S.shards += rw.shards; S.potions += rw.potions || 0;
      c.sfx('pick'); c.toast('💎 +' + rw.shards + (rw.potions ? '  🧪 +' + rw.potions : '')); c.emit(x, y + 1, z, 0xffe08a, 30, 5, .8, .7, 2); c.save(); } });
  }

  // Welt aufbauen: Himmelsinseln, See, Gegner, Schätze
  function populate(n, lake, R, col) {
    Z = sets[n] = { n, lake, foes: [], shots: [] };
    const tint = new T.Color(col || 0x8ab0ff), rock = M(0x6d6a86, { f: 1 }), grass = M(tint.clone().lerp(new T.Color(0x3f9d70), .6).getHex());
    // Himmelsinseln mit Schatz und Wolkenrochen
    for (let i = 0; i < 4; i++) {
      let x = 0, z = 0; for (let t = 0; t < 40; t++) { x = R2(R, -100, 100); z = R2(R, -190, 20); if (Math.hypot(x, z) > 40 && (!lake || Math.hypot(x - lake.x, z - lake.z) > 30)) break; }
      let top = 0; for (let a = 0; a < 6; a++) top = Math.max(top, c.hgt(x + Math.cos(a) * 8, z + Math.sin(a) * 8));
      const y = Math.max(top, 0) + R2(R, 24, 38), r = R2(R, 6, 9), g = new T.Group(); g.position.set(x, y, z);
      const cone = mk(G.cone0, rock, 0, -r * .75, 0, r, r * 1.6, r); cone.rotation.x = Math.PI; g.add(cone); g.add(mk(G.cyl, grass, 0, .25, 0, r * 1.03, .6, r * 1.03));
      for (let k = 0; k < 3; k++) { const a = R() * 6.28, d = R() * r * .6; g.add(mk(G.cyl0, M(0x4a3328), Math.cos(a) * d, 1.2, Math.sin(a) * d, .22, 1.6, .22)); g.add(mk(G.ico, M(tint.getHex(), { e: tint.getHex(), ei: .25 }), Math.cos(a) * d, 2.4, Math.sin(a) * d, 1.1, .9, 1.1)); }
      g.add(mk(G.oct, M(0x8ad0ff, { e: 0x4aa8ff, ei: 1.6 }), 0, -r * 1.4, 0, .6, 1.4, .6, false)); scene.add(g);
      treasure(n + 'sky' + i, x + 2, z, y + .55, { shards: 70 + n * 25, potions: 1 }, () => c.nAir() && Math.abs(c.pl.y - y) < 9, 'Himmelsschatz');
      for (let k = 0; k < 2; k++) addFoe('sky', x + R2(R, -12, 12), y + R2(R, 2, 7), z + R2(R, -12, 12), tint.clone().offsetHSL(.05 * k, 0, -.1).getHex(), { x, y: y + 4, z, r: 14 });
    }
    if (lake) {
      const K = { water: [0x2a8ad0, 0x0a3a6a], lava: [0xff5a10, 0xff3000], cloud: [0xf4f6ff, 0x8a9ac0] }[lake.kind] || [0x2a8ad0, 0x0a3a6a];
      const wm = new T.MeshStandardMaterial({ color: K[0], transparent: true, opacity: .78, emissive: K[1], emissiveIntensity: .45, roughness: .12, metalness: .25, depthWrite: false, side: T.DoubleSide });
      const w = new T.Mesh(new T.CircleGeometry(lake.r * 1.3, 48), wm); w.rotation.x = -Math.PI / 2; w.position.set(lake.x, lake.wl, lake.z); w.renderOrder = 2; scene.add(w); Z.water = wm;
      if (lake.kind === 'water') treasure(n + 'deep0', lake.x + 3, lake.z - 2, c.hgt(lake.x + 3, lake.z - 2), { shards: 90 + n * 25, potions: 2 }, () => c.nSub() && c.pl.y < lake.wl - 1, 'Tiefseeschatz');
      const fx = lake.x - lake.r * .55, fz = lake.z + lake.r * .3, crate = mk(G.box, M(0x7a5a30), fx, lake.wl + .2, fz, 1.2, .8, 1.2); scene.add(crate);
      treasure(n + 'sea0', fx, fz, lake.wl + .6, { shards: 50 + n * 15 }, () => c.naut.on && !c.nAir() && !!lakeAt(c.pl.x, c.pl.z), 'Treibgut');
      for (let k = 0; k < 3; k++) { const a = k * 2.1; addFoe('sea', lake.x + Math.cos(a) * lake.r * .5, lake.wl, lake.z + Math.sin(a) * lake.r * .5, lake.kind === 'lava' ? 0xc8401a : lake.kind === 'cloud' ? 0xc8d8ff : 0x3a8a6a, { x: lake.x, y: lake.wl, z: lake.z, r: lake.r * .6 }); }
      if (lake.kind === 'water') for (let k = 0; k < 3; k++) { const a = k * 2.1 + 1; addFoe('deep', lake.x + Math.cos(a) * lake.r * .4, lake.wl - 4, lake.z + Math.sin(a) * lake.r * .4, 0x5a4a8a, { x: lake.x, y: lake.wl - 4, z: lake.z, r: lake.r * .45 }); }
    }
    if (n === 5) for (let i = 0; i < 4; i++) {   // Aqualis: versunkene Ruinen hoch in der Stadt, nur mit dem U-Boot erreichbar
      const x = R2(R, -90, 90), z = R2(R, -170, 20), y = Math.max(0, c.hgt(x, z)) + R2(R, 9, 15), g = new T.Group(); g.position.set(x, 0, z);
      for (const s2 of [-1, 1]) g.add(mk(G.cyl, M(0x6a8a9a, { r: .8 }), s2 * 2.2, y / 2, 0, .6, y, .6)); g.add(mk(G.box, M(0x7a9aaa, { r: .8 }), 0, y + .3, 0, 6, .6, 3)); scene.add(g);
      treasure(n + 'ruin' + i, x, z, y + .6, { shards: 120 + n * 20, potions: 1 }, () => c.nSub() && Math.abs(c.pl.y - y) < 6, 'Versunkener Schatz');
      for (let k = 0; k < 2; k++) addFoe('deep', x + R2(R, -8, 8), y + R2(R, -2, 3), z + R2(R, -8, 8), 0x3a6aa0, { x, y: y + 1, z, r: 9 });
    }
    c.anim(t => { if (Z && Z.water && Z.n === n) Z.water.opacity = .74 + .06 * Math.sin(t * 1.7); });
  }
  const activate = n => { Z = sets[n] || null; };
  const clear = n => { if (n !== 1) delete sets[n]; if (Z && Z.n === n && n !== 1) Z = null; };

  function shoot(from, to, sp, mat, own, dmg) {
    const m = new T.Mesh(shotG, mat), d = new T.Vector3(to.x - from.x, to.y - from.y, to.z - from.z).normalize().multiplyScalar(sp);
    m.position.set(from.x, from.y, from.z); scene.add(m); Z.shots.push({ m, v: d, own, dmg, life: 2.4 });
  }
  function update(dt, time) {
    if (!Z) return; const p = c.pl, med = medium();
    // Unterwasser-Schleier
    if (!uw) { uw = document.createElement('div'); uw.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 30%,rgba(40,140,200,.18),rgba(10,40,90,.5));opacity:0;transition:opacity .4s;z-index:3'; document.body.appendChild(uw); }
    uw.style.opacity = med === 'deep' ? 1 : 0;
    if (med === 'sea' && Math.hypot(p.vx, p.vz) > 3 && (wake -= dt) <= 0) { wake = .05; c.emit(p.x - Math.sin(p.face) * 1.6, Z.lake.wl + .15, p.z - Math.cos(p.face) * 1.6, 0xeaf6ff, 2, 1.5, .5, .4, 0); }
    // Gegner
    gcd -= dt; let best = null, bd = 26;
    for (const f of Z.foes) {
      if (f.dead) { f.dead -= dt; if (f.dead <= 0) { f.dead = 0; f.hp = f.max; f.x = f.hx; f.z = f.hz; f.y = f.hy; f.m.g.visible = true; } continue; }
      const dx = p.x - f.x, dy = p.y + 1 - f.y, dz = p.z - f.z, d = Math.hypot(dx, dy, dz), on = med === f.kind && d < 32;
      f.a += dt * (on ? .3 : .5);
      let tx = f.hx + Math.cos(f.a) * f.hr, ty = f.hy + (f.kind === 'sky' ? Math.sin(f.a * 2) * 2 : 0), tz = f.hz + Math.sin(f.a) * f.hr;
      if (on) { const k = d > 11 ? .55 : -.2; tx = f.x + dx * k; tz = f.z + dz * k; if (f.kind !== 'sea') ty = f.y + dy * .5; }
      if (f.kind === 'sea') { ty = Z.lake.wl - .3; const L = Z.lake, dl = Math.hypot(tx - L.x, tz - L.z); if (dl > L.r * .85) { tx = L.x + (tx - L.x) / dl * L.r * .85; tz = L.z + (tz - L.z) / dl * L.r * .85; } }
      if (f.kind === 'deep' && Z.lake) { const L = Z.lake; ty = Math.min(L.wl - 1.5, Math.max(c.hgt(f.x, f.z) + 1.2, ty)); const dl = Math.hypot(tx - L.x, tz - L.z); if (dl > L.r * .8) { tx = L.x + (tx - L.x) / dl * L.r * .8; tz = L.z + (tz - L.z) / dl * L.r * .8; } }
      const k = Math.min(1, dt * (on ? 1.6 : .8)); f.x += (tx - f.x) * k; f.y += (ty - f.y) * k; f.z += (tz - f.z) * k;
      f.m.g.position.set(f.x, f.y + (f.kind === 'sea' ? Math.max(0, Math.sin(time * 2 + f.a)) * .4 : 0), f.z); f.m.g.rotation.y = Math.atan2(on ? dx : tx - f.x, on ? dz : tz - f.z);
      f.m.b.rotation.z = f.kind === 'sky' ? Math.sin(time * 3 + f.a) * .25 : 0; f.m.b.position.y = f.kind === 'deep' ? Math.sin(time * 2 + f.a) * .2 : 0;
      if (f.flash > 0) { f.flash -= dt; f.m.g.scale.setScalar(1 + f.flash); }
      if (on) { f.cd -= dt; if (f.cd <= 0 && gcd <= 0) { gcd = .9; f.cd = 3 + Math.random() * 1.5; shoot({ x: f.x, y: f.y + (f.kind === 'sea' ? 1.1 : 0), z: f.z }, { x: p.x, y: p.y + 1, z: p.z }, f.kind === 'deep' ? 11 : 15, shotE, false, f.dmg); } }
      if (on && d < bd) { bd = d; best = f; }
    }
    // Nautilux feuert selbst (auf den nächsten Gegner im selben Bereich)
    fire -= dt;
    if (best && fire <= 0) { fire = .32; const fr = { x: p.x, y: p.y + 1, z: p.z }, to = { x: best.x, y: best.y, z: best.z }; shoot(fr, to, 42, shotP, true, c.atkV() * .5); c.sfx('shot'); }
    for (let i = Z.shots.length - 1; i >= 0; i--) {
      const s = Z.shots[i]; s.life -= dt; s.m.position.addScaledVector(s.v, dt); let gone = s.life <= 0;
      if (!gone && s.own) for (const f of Z.foes) { if (f.dead) continue; if (s.m.position.distanceTo(f.m.g.position) < (f.kind === 'sky' ? 2 : 1.6)) { gone = true; hit(f, s.dmg); break; } }
      else if (!gone && Math.hypot(s.m.position.x - p.x, s.m.position.y - p.y - 1, s.m.position.z - p.z) < 1.7) { gone = true; c.hurtP(s.dmg, s.m.position.x, s.m.position.z); }
      if (gone) { scene.remove(s.m); Z.shots.splice(i, 1); }
    }
  }
  function hit(f, dmg) {
    f.hp -= dmg; f.flash = .25; c.dnum(f.x, f.y + 1.5, f.z, Math.round(dmg), ''); c.emit(f.x, f.y, f.z, 0xffffff, 8, 4, .4, .5);
    if (f.hp <= 0) { f.dead = 45; f.m.g.visible = false; c.sfx('hit'); c.emit(f.x, f.y, f.z, 0x9ae0ff, 30, 6, .8, .7);
      const S = c.S(), sh = 6 + Math.round(f.lv * 1.5); S.shards += sh; c.gainXp(Math.round((6 + 4 * f.lv) * 1.3 * Math.max(.2, Math.min(1.3, 1 - (S.lvl - f.lv) * .12)))); c.toast('💎 +' + sh); }
  }
  return { lakeFor, carve, lakeAt, populate, activate, clear, update, medium, get cur() { return Z; } };
}
