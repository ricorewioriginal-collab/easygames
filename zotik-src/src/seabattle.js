/* Seekampf auf der Weltkarte: rundenbasiert im Stil klassischer Konsolen-RPGs (eigene Umsetzung).
   Auf dem Meer ziehen Flossen umher; wer sie mit der Nautilux berührt, kämpft rundenweise:
   Gruppe gegen bis zu drei Meeresbestien, Befehle über das Kommandomenü der Dialoge (Handy, PC, TV, Controller gleich).
   IP-Leiste je Figur (wie Lufia): füllt sich bei Treffern, ab 40 IP ist die eigene Kunst bereit. */
export function createSeaBattle(C) {
  const { T, scene, camera, say, sfx, toast, banner, dnum, emit } = C;
  const KIND = [
    { k: 'qualle', n: 'Glimmqualle', col: 0x8ad8ff, hp: 34, atk: 5, sc: 2.3, el: '⚡' },
    { k: 'krabbe', n: 'Riffpanzer', col: 0xd86a3a, hp: 52, atk: 6, sc: 2, def: .6 },
    { k: 'schlange', n: 'Tiefenschlange', col: 0x2a8a8a, hp: 70, atk: 8, sc: 2.4 }];
  const BOSS = { k: 'schlange', n: 'Mahlstromschlange', col: 0x5a2a9a, hp: 220, atk: 12, sc: 3.2, boss: 1 };
  let B = null;

  function start(L, fin) {
    if (B) return; const S = C.S(), pl = C.pl, rare = Math.random() < .12, cnt = rare ? 1 : 1 + (Math.random() * 3 | 0);
    let fc = pl.face; for (let t = 0; t < 12; t++) { const a = pl.face + t * .52; if (C.water(pl.x + Math.sin(a) * 10, pl.z + Math.cos(a) * 10)) { fc = a; break; } } pl.face = fc;
    const fx = Math.sin(fc), fz = Math.cos(fc), foes = [];
    for (let i = 0; i < cnt; i++) { const d = rare ? BOSS : KIND[(Math.random() * KIND.length) | 0], o = (i - (cnt - 1) / 2) * 4.2;
      const x = pl.x + fx * 10 + fz * o, z = pl.z + fz * 10 - fx * o, P = C.makeKind(d.k, d.col); P.root.scale.setScalar(d.sc); P.root.position.set(x, C.wl, z); P.root.rotation.y = pl.face + Math.PI; scene.add(P.root);
      const hp = Math.round(d.hp * (1 + L * .55)); foes.push({ d, P, x, z, hp, max: hp, atk: d.atk * (1 + L * .35), t: Math.random() * 6, lunge: 0, dead: 0, name: d.n + (cnt > 1 ? ' ' + 'ABC'[i] : '') }); }
    const party = [{ id: 'zotik', n: 'Zotik', ip: 30, get hp() { return S.hp }, set hp(v) { S.hp = v }, get max() { return C.maxHp() }, atk: () => C.atkV() }];
    for (const a of C.CMP().filter(a => !a.ko && !a.guest).slice(0, 3)) { const p = C.PARTY[a.id]; party.push({ id: a.id, n: p.n, ip: 30, a, get hp() { return a.hp }, set hp(v) { a.hp = v }, get max() { return C.cmax(a.id) }, atk: () => (p.atk * 1.5 + S.lvl * 1.2) * 1.4 }); }
    B = { L, fin, foes, party, turn: 0, guard: {}, taunt: null, cam: { x: pl.x - fx * 4.5 + fz * 7, y: pl.y + 5.4, z: pl.z - fz * 4.5 - fx * 7 }, look: { x: pl.x + fx * 6.5, y: pl.y + .9, z: pl.z + fz * 6.5 } };
    C.setOn(true); sfx('roar'); banner(rare ? '🌀 ' + BOSS.n : '🌊 Seekampf', rare ? 'Eine Bestie aus der Tiefe!' : foes.map(f => f.d.n).join(' · '));
    setTimeout(next, 900);
  }
  const live = () => B.foes.filter(f => !f.dead), up = () => B.party.filter(m => m.hp > 0);
  const bar = m => m.n + ' ' + Math.max(0, Math.round(m.hp)) + '/' + m.max + (m.ip >= 40 ? ' ⭐' : '');
  const status = () => up().map(bar).join(' · ') + '   ┃   ' + live().map(f => (f.d.el || '🐙') + ' ' + f.name + ' ' + Math.max(0, f.hp) + '/' + f.max).join(' · ');
  const SK = { zotik: ['✨ Rissblitz', 'all'], lyra: ['💚 Heilwelle', 'heal'], mira: ['🌙 Mondlicht', 'heal'], mirael: ['💧 Kühlnebel', 'heal'], rovan: ['📣 Provokation', 'taunt'], toren: ['🔥 Glutschlag', 'taunt'] };
  const skill = id => SK[id] || ['🎯 Volltreffer', 'shot'];

  function next() {
    if (!B) return; if (!live().length) return win(); if (!up().length) return lose();
    while (B.turn < B.party.length && B.party[B.turn].hp <= 0) B.turn++;
    if (B.turn >= B.party.length) { B.turn = 0; B.guard = {}; return foeTurn(0); }
    const m = B.party[B.turn], S = C.S(), [sn] = skill(m.id), o = [{ t: '⚔️ Angriff', fn: () => pick(f => attack(m, f, 1)) },
      { t: sn + (m.ip >= 40 ? ' (40 IP)' : ' · IP ' + m.ip + '/40'), fn: () => m.ip >= 40 ? art(m) : (toast('Noch nicht genug IP: Treffer füllen die Leiste'), next()) }];
    if (S.potions > 0) o.push({ t: '🧪 Heiltrank (' + S.potions + ')', fn: () => { S.potions--; const h = Math.round(m.max * .5); m.hp = Math.min(m.max, m.hp + h); sfx('heal'); dnum(C.pl.x, C.pl.y + 2.4, C.pl.z, '+' + h, 'h'); adv(); } });
    o.push({ t: '🛡️ Abwehr', fn: () => { B.guard[m.id] = 1; m.ip = Math.min(100, m.ip + 10); toast('🛡️ ' + m.n + ' wehrt ab'); adv(); } });
    if (!B.foes.some(f => f.d.boss)) o.push({ t: '🏃 Davonsegeln', fn: () => { if (Math.random() < .75) { toast('🚤 Entkommen!'); end(); } else { toast('Die Bestien schneiden den Weg ab!'); B.turn = B.party.length; adv(); } } });
    say([[m.n, status()]], null, o);
  }
  function pick(fn) { const L = live(); if (L.length === 1) return fn(L[0]); say([[B.party[B.turn].n, 'Welches Ziel?']], null, L.map(f => ({ t: (f.d.el || '🐙') + ' ' + f.name + ' (' + f.hp + ')', fn: () => fn(f) }))); }
  function hit(f, dmg, m) { dmg = Math.max(1, Math.round(dmg * (f.d.def || 1) * (.9 + Math.random() * .2))); f.hp -= dmg; f.lunge = -.35; dnum(f.x, C.wl + 2.4 * f.d.sc / 1.6, f.z, dmg, 'e'); emit(f.x, C.wl + 1.2, f.z, 0xffffff, 10, 3, .4, .3, 0);
    if (m) m.ip = Math.min(100, m.ip + 8); if (f.hp <= 0) { f.dead = 1; sfx('kill'); emit(f.x, C.wl + .6, f.z, 0xc8f4ff, 26, 5, .9, .5, -2); } }
  function attack(m, f, k) { sfx('hit'); hit(f, m.atk() * k, m); adv(); }
  function art(m) { m.ip -= 40; const [n, ty] = skill(m.id); banner(n, m.n); sfx('skill2');
    if (ty === 'all') { for (const f of live()) hit(f, m.atk() * .9); }
    else if (ty === 'heal') { for (const p of B.party) if (p.hp > 0) { p.hp = Math.min(p.max, p.hp + p.max * .35); } dnum(C.pl.x, C.pl.y + 2.4, C.pl.z, '💚', 'h'); sfx('heal'); }
    else if (ty === 'taunt') { B.taunt = m; B.guard[m.id] = 1; toast('📣 Die Bestien greifen ' + m.n + ' an'); }
    else { const f = live().sort((a, b) => a.hp - b.hp)[0]; if (f) hit(f, m.atk() * 2.2); }
    adv(); }
  function adv() { B.turn++; setTimeout(next, 650); }
  function foeTurn(i) {
    if (!B) return; const L = live(); if (!L.length) return win(); if (i >= L.length) { B.taunt = null; return next(); }
    const f = L[i], T0 = up(); if (!T0.length) return lose();
    const m = B.taunt && B.taunt.hp > 0 ? B.taunt : T0[(Math.random() * T0.length) | 0]; f.lunge = 1; sfx('roar');
    setTimeout(() => { if (!B) return; let d = Math.round(f.atk * (B.guard[m.id] ? .45 : 1) * (.85 + Math.random() * .3)); m.hp = Math.max(0, m.hp - d); m.ip = Math.min(100, m.ip + 12); sfx('hurt');
      dnum(C.pl.x, C.pl.y + 2.2, C.pl.z, m.n + ' −' + d, 'p'); if (m.hp <= 0) { toast('💫 ' + m.n + ' ist K.O.'); if (m.a) { m.a.ko = true; m.a.kot = 0; } }
      setTimeout(() => foeTurn(i + 1), 520); }, 420);
  }
  function win() { const S = C.S(), xp = B.foes.reduce((s, f) => s + Math.round(f.max * .35), 0), sh = B.foes.reduce((s, f) => s + Math.round(f.max * .12), 0); S.shards += sh; sfx('level');
    banner('Seesieg', '+' + xp + ' EP · +' + sh + ' 💎'); const fin = B.fin; end(); C.gainXp(xp); if (fin) fin.gone = 1; }
  function lose() { banner('Die Nautilux treibt ab', 'Zurück am Steg'); const S = C.S(); S.hp = Math.round(C.maxHp() * .3); for (const m of B.party) if (m.a) { m.a.ko = false; m.a.hp = Math.round(m.max * .3); } end(); C.lose(); }
  function end() { if (!B) return; for (const f of B.foes) scene.remove(f.P.root); const S = C.S(); if (S.hp < 1) S.hp = 1; B = null; C.setOn(false); }
  function update(dt) {
    if (!B) return; const k = 1 - Math.exp(-5 * dt);
    camera.position.x += (B.cam.x - camera.position.x) * k; camera.position.y += (B.cam.y - camera.position.y) * k; camera.position.z += (B.cam.z - camera.position.z) * k; camera.lookAt(B.look.x, B.look.y, B.look.z);
    for (const f of B.foes) { f.t += dt; const r = f.P.root;
      if (f.dead) { r.position.y -= dt * 2.2; r.rotation.z += dt * 2; if (r.position.y < C.wl - 4) r.visible = false; continue; }
      if (f.lunge > 0) f.lunge = Math.max(0, f.lunge - dt * 2.4); else if (f.lunge < 0) f.lunge = Math.min(0, f.lunge + dt * 2.4);
      const l = f.lunge > 0 ? Math.sin(f.lunge * Math.PI) * .55 : f.lunge * .3, px = C.pl.x, pz = C.pl.z;
      r.position.set(f.x + (px - f.x) * l, C.wl + Math.sin(f.t * 1.8) * .18 + (f.d.k === 'qualle' ? .6 : 0), f.z + (pz - f.z) * l); r.rotation.z = Math.sin(f.t * 1.3) * .06; }
  }
  return { start, update, get on() { return !!B } };
}
