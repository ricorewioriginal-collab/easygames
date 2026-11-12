/* Mehr Welt in jeder Kapitelwelt (2–10): Dinge zum Zerschlagen, Truhen-Jagd (12 je Welt), Sprungblüten mit Splitterringen,
   zwei Bewohner mit kleinem Auftrag und ein Fest nach dem Weltboss. Alles eigene Inhalte, je Welt eigenes Thema.
   Bedienung wie überall: hinlaufen, Aktion (Sprechen/Öffnen) oder Angriff (Zerschlagen). */
export const WP_TH = {
  2: { p: 'Leuchtpilz', c: 0xff7ac8, c2: 0xfff0f8, k: 'pilz', it: ['Nias Notizbuch', '📓'], it2: ['Moosflöte', '🪈'], fest: [0xff8ac8, 0xffe27a, 0x9ad0ff] },
  3: { p: 'Frachtkiste', c: 0x9a6a3a, c2: 0x5a3a20, k: 'kiste', it: ['Gildenring', '💍'], it2: ['Kanalkarte', '🗺️'], fest: [0xffb04a, 0xff5a5a, 0x5ab0ff] },
  4: { p: 'Tonkrug', c: 0xd89a5a, c2: 0x8a5a2a, k: 'krug', it: ['Sonnenamulett', '🌞'], it2: ['Wasserschlauch', '💧'], fest: [0xffd45a, 0xff8a3a, 0x5ae0d0] },
  5: { p: 'Korallenkorb', c: 0xff8a7a, c2: 0x5ad0e0, k: 'koralle', it: ['Perlenkamm', '🦪'], it2: ['Muschelhorn', '🐚'], fest: [0x5ad0ff, 0xff8ac8, 0xfff07a] },
  6: { p: 'Eisblock', c: 0xbfe8ff, c2: 0x7ac0e8, k: 'eis', it: ['Wollhandschuh', '🧤'], it2: ['Schlittenglocke', '🔔'], fest: [0xbfe8ff, 0xff6a6a, 0xffffff] },
  7: { p: 'Aschetopf', c: 0x5a4a44, c2: 0xff7a2a, k: 'asche', it: ['Schmiedezange', '🔧'], it2: ['Glutstein', '🔥'], fest: [0xff7a2a, 0xffd45a, 0xff3a3a] },
  8: { p: 'Laterne', c: 0x6a5ab0, c2: 0xd8c0ff, k: 'laterne', it: ['Tagebuchseite', '📜'], it2: ['Laternendocht', '🕯️'], fest: [0xb08aff, 0x7ae0ff, 0xffe0a0] },
  9: { p: 'Sternkristall', c: 0x9ad0ff, c2: 0xffffff, k: 'stern', it: ['Sternkarte', '🌌'], it2: ['Wolkenfeder', '🪶'], fest: [0xffffff, 0x9ad0ff, 0xffe07a] },
  10: { p: 'Spiegelscherbe', c: 0xd8f0ff, c2: 0x8a9aff, k: 'spiegel', it: ['Echomedaillon', '🪞'], it2: ['Silberfaden', '🧵'], fest: [0xd8f0ff, 0xb08aff, 0xffe0a0] }
};
/* Bewohner mit Auftrag: Name, Aussehen, Bitte, Dank (Gegenstand liegt irgendwo in der Wildnis) */
const ASK = {
  2: [['Lumi', ['Mein Notizbuch! Ich habe es im lebenden Wald verloren, als ein Pilzling mich erschreckt hat.', 'Danke! Da steht alles drin, was der Wald mir je erzählt hat.']], ['Oska', ['Ich habe meine Moosflöte im Wald liegen lassen. Ohne sie schlafen die Pilze nicht ein.', 'Hör nur … die Pilze summen schon leiser. Danke!']]],
  3: [['Greta', ['Mein Gildenring ist mir in den Kanälen ins Wasser gefallen. Ohne ihn darf ich nicht in die Halle.', 'Mein Ring! Die Gilde wird staunen. Nimm das als Dank.']], ['Pim', ['Ich zeichne Karten der Kanäle. Meine beste habe ich draußen verloren!', 'Jede Schleuse, jeder Gang … alles noch da. Danke, Held!']]],
  4: [['Samira', ['Das Sonnenamulett meiner Großmutter liegt irgendwo im Dünenmeer. Der Wind hat es mir entrissen.', 'Es ist noch warm von der Sonne. Danke von Herzen.']], ['Jaro', ['Mein Wasserschlauch! Ohne ihn komme ich nicht bis zur nächsten Oase.', 'Kühl und voll. Du bist ein Lebensretter!']]],
  5: [['Maris', ['Mein Perlenkamm ist in der Strömung verschwunden. Er gehörte meiner Mutter.', 'Er glänzt wie am ersten Tag. Danke!']], ['Kai', ['Mit dem Muschelhorn rufe ich die Fische nach Hause. Ich habe es draußen verloren.', 'Hörst du? Die Fische kommen schon. Danke!']]],
  6: [['Hilde', ['Mein Wollhandschuh ist im Schneesturm davongeflogen. Meine Finger frieren!', 'Ah, wie warm. Du hast ein gutes Herz.']], ['Ole', ['Die Glocke von meinem Schlitten ist abgefallen. Ohne sie findet mich keiner im Nebel.', 'Kling, kling! Jetzt finde ich immer nach Hause.']]],
  7: [['Brann', ['Meine Schmiedezange liegt draußen bei den Lavaströmen. Ohne sie steht die Esse still.', 'Endlich! Die Esse glüht wieder. Danke, Freund.']], ['Funke', ['Ich sammle Glutsteine. Der schönste ist mir draußen aus der Tasche gefallen.', 'Er leuchtet noch! Danke, danke!']]],
  8: [['Lio', ['Eine Seite aus meinem Tagebuch ist weggeweht. Ohne sie vergesse ich einen ganzen Tag.', 'Da steht es … der Tag am See. Jetzt weiß ich es wieder. Danke.']], ['Nella', ['Meiner Laterne fehlt der Docht. Draußen in der Dunkelheit muss er liegen.', 'Licht! Die Nacht ist gleich weniger lang. Danke.']]],
  9: [['Orion', ['Meine Sternkarte ist mir aus der Hand geflogen. Ohne sie verirren sich die Wolkenschiffe.', 'Alle Sterne an ihrem Platz. Danke, Reisender!']], ['Wolke', ['Ich brauche eine Wolkenfeder für meinen Hut. Draußen schweben welche.', 'Federleicht! Jetzt bin ich die Schönste im Hafen.']]],
  10: [['Sille', ['Mein Echomedaillon ist zerbrochen und die Hälfte ist weg. Draußen bei den Spiegeln.', 'Jetzt höre ich die Stimme darin wieder. Danke.']], ['Faden', ['Ich webe aus Silberfaden Erinnerungen. Eine Rolle ist mir draußen davongerollt.', 'Jetzt kann ich weiterweben. Danke!']]]
};
const LOOK = [{ cloth: 0x4a8ae0, cloth2: 0x2a3a8a, hair: 0x8a4a2a, sc: .92 }, { cloth: 0xe0a0b8, cloth2: 0x7a4a5a, hair: 0x3a2a1a, sc: .95, apron: 0xffffff }];

export function createWorldPlus(C) {
  const { T, mk, G, M, glow, scene } = C;
  const S = () => C.S();
  let W = null;
  function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  function spot(R, path, h, zmin, zmax, off, tries) {
    for (let t = 0; t < (tries || 60); t++) {
      const z = zmin + R() * (zmax - zmin), x = path(z) + (R() < .5 ? -1 : 1) * (off[0] + R() * (off[1] - off[0]));
      if (C.pBlocked(x, z) || !C.colFree(x, z, 1.4)) continue;
      if (Math.abs(h(x + 1, z) - h(x - 1, z)) > 1.1) continue; return [x, z];
    }
    return null;
  }
  /* Zerschlagbares Objekt je Thema */
  function prop(th) {
    const g = new T.Group(), c = th.c, c2 = th.c2;
    switch (th.k) {
      case 'pilz': g.add(mk(G.cyl, M(0xf0e8d8), 0, .3, 0, .22, .6, .22)); g.add(mk(G.sph, M(c, { e: c, ei: .5 }), 0, .7, 0, .6, .35, .6)); break;
      case 'kiste': g.add(mk(G.box, M(c), 0, .4, 0, .8, .8, .8)); g.add(mk(G.box, M(c2), 0, .4, .41, .84, .12, .02, false)); g.add(mk(G.box, M(c2), 0, .4, -.41, .84, .12, .02, false)); break;
      case 'krug': g.add(mk(G.sph, M(c), 0, .45, 0, .55, .6, .55)); g.add(mk(G.cyl, M(c2), 0, .9, 0, .22, .2, .22)); break;
      case 'koralle': g.add(mk(G.cyl, M(c2), 0, .25, 0, .45, .5, .45)); for (let i = 0; i < 3; i++) g.add(mk(G.cone, M(c, { e: c, ei: .3 }), Math.cos(i * 2.1) * .2, .7, Math.sin(i * 2.1) * .2, .14, .5, .14)); break;
      case 'eis': g.add(mk(G.box, M(c, { t: 1, r: .1, e: c2, ei: .3 }), 0, .45, 0, .8, .9, .8)); break;
      case 'asche': g.add(mk(G.cyl, M(c), 0, .35, 0, .5, .7, .5)); g.add(glow(c2, 1.2, 0, .8, 0, .7)); break;
      case 'laterne': g.add(mk(G.cyl, M(0x3a3048), 0, .5, 0, .08, 1, .08)); g.add(mk(G.box, M(c, { e: c2, ei: .9 }), 0, 1.05, 0, .35, .4, .35)); g.add(glow(c2, 1.4, 0, 1.05, 0, .7)); break;
      case 'stern': g.add(mk(G.oct, M(c, { e: c, ei: .8 }), 0, .6, 0, .4, .6, .4)); g.add(glow(c2, 1.3, 0, .6, 0, .6)); break;
      default: g.add(mk(G.oct, M(c, { m: .7, r: .15, e: c2, ei: .4 }), 0, .55, 0, .35, .6, .2)); g.add(glow(c2, 1.1, 0, .6, 0, .5));
    }
    return g;
  }
  /* Gegenstand für einen Auftrag: kleiner schwebender Leuchtpunkt mit Symbol-Farbe */
  function lostItem(col) { const g = new T.Group(); g.add(mk(G.oct, M(col, { e: col, ei: 1 }), 0, 1, 0, .22, .3, .22)); g.add(glow(col, 2.4, 0, 1, 0, .8)); return g }

  function build(n, path, h) {
    W = null; const th = WP_TH[n]; if (!th) return; const s = S(); s.wp = s.wp || {}; const st = s.wp[n] = s.wp[n] || { q: [0, 0] };
    const R = rnd(7700 + n * 131), w = W = { n, br: [], pads: [], rings: [], items: [], fest: null };
    /* 1) Zerschlagbare Dinge: 6 im Ort, 10 am Weg */
    const spots = [];
    for (let i = 0; i < 6; i++) { const p = spot(R, path, h, -6, -30, [5, 14]); if (p) spots.push(p) }
    for (let i = 0; i < 10; i++) { const p = spot(R, path, h, -40, -150, [3, 9]); if (p) spots.push(p) }
    for (const [x, z] of spots) { const m = prop(th); m.position.set(x, h(x, z), z); m.rotation.y = R() * 6; scene.add(m); w.br.push({ x, z, m, hp: 1 }); }
    /* 2) Truhen-Jagd: 9 weitere Truhen abseits des Wegs (zusammen mit den 3 alten = 12) */
    for (let i = 0; i < 9; i++) {
      const p = spot(R, path, h, -20, -160, [10, 26]); if (!p) continue;
      const rw = i % 3 === 0 ? { shards: 60 + n * 12, potions: 1 } : i % 3 === 1 ? { shards: 45 + n * 10 } : { shards: 35 + n * 8, potions: 2 };
      C.addChest(n + 'x' + i, p[0], h(p[0], p[1]), p[1], rw);
    }
    /* 3) Sprungblüten mit Splitterringen in der Luft */
    for (let i = 0; i < 3; i++) {
      const p = spot(R, path, h, -45 - i * 35, -60 - i * 35, [4, 8]); if (!p) continue; const [x, z] = p, y = h(x, z);
      const pad = new T.Group(); pad.add(mk(G.cyl, M(th.fest[0], { e: th.fest[0], ei: .6 }), 0, .08, 0, 1.4, .16, 1.4)); pad.add(mk(G.tor, M(th.fest[1], { e: th.fest[1], ei: .8 }), 0, .18, 0, 1.4, 1.4, .3, false)); pad.children[1].rotation.x = Math.PI / 2;
      pad.add(glow(th.fest[0], 2.6, 0, .4, 0, .5)); pad.position.set(x, y, z); scene.add(pad); w.pads.push({ x, z, y, m: pad, cd: 0 });
      for (let k = 0; k < 4; k++) { const key = n + 'r' + i + k; if (st[key]) continue; const r = mk(G.tor, M(0xffe07a, { e: 0xffd040, ei: 1 }), x, y + 4 + k * 1.6, z, .7, .7, .14, false); scene.add(r); w.rings.push({ key, x, z, y: y + 4 + k * 1.6, m: r }) }
    }
    /* 4) Zwei Bewohner mit Auftrag; der Gegenstand liegt in der Wildnis */
    (ASK[n] || []).forEach((a, i) => {
      const p = spot(R, path, h, -8, -26, [6, 12]); if (!p) return; const it = i ? th.it2 : th.it;
      C.addNpc('wp' + n + i, a[0], p[0], p[1], C.makeVillager(Object.assign({}, LOOK[i])), () => talk(n, i, a, it), R() * 6, () => st.q[i] === 0 || (st.q[i] === 1 && st['g' + i]));
      if (st.q[i] < 2) { const q = spot(R, path, h, -70 - i * 40, -110 - i * 40, [8, 22]); if (q) { const m = lostItem(th.fest[i]); m.position.set(q[0], h(q[0], q[1]), q[1]); m.visible = st.q[i] === 1 && !st['g' + i]; scene.add(m); w.items.push({ i, x: q[0], z: q[1], m, it }) } }
    });
    /* 5) Weltrennen: Gastgeberin im Ort startet das Minispiel der Welt */
    { const rd = C.RIDES[n], p = spot(R, path, h, -4, -18, [4, 9]); if (rd && p) C.addNpc('wpr' + n, rd.who, p[0], p[1], C.makeVillager({ cloth: th.fest[0], cloth2: th.fest[1], hair: 0x3a2a1a, sc: .95, hat: 1 }), () => C.say([[rd.who, rd.em + ' ' + rd.n + '! ' + rd.txt + (S().ride && S().ride[n] ? ' Dein Rekord: ' + S().ride[n] + '.' : ' Der erste Lauf bringt einen Bonus.')]], null, [{ t: 'Rennen starten', fn: () => C.ride(n) }, { t: 'Später', fn: () => { } }]), R() * 6, () => !(S().ride && S().ride[n])) }
    if (st.done) fest(n, path, h);
    C.anim((t, dt) => frame(dt, C.pl));
  }
  function talk(n, i, a, it) {
    const st = S().wp[n];
    if (st.q[i] === 0) { C.say([[a[0], a[1][0]]], null, [{ t: 'Ich suche es', fn: () => { st.q[i] = 1; C.toast('📜 ' + a[0] + ': ' + it[1] + ' ' + it[0] + ' finden'); for (const o of W.items) if (o.i === i) o.m.visible = true; C.saveGame(true) } }, { t: 'Später', fn: () => { } }]); return }
    if (st.q[i] === 1 && st['g' + i]) { st.q[i] = 2; const s = S(); s.shards += 150 + n * 30; s.potions += 1; C.gainXp(60 + n * 15); C.sfx('quest'); C.toast('🎁 ' + a[0] + ': 💎 +' + (150 + n * 30) + ' · 🧪 +1'); C.say([[a[0], a[1][1]]]); C.saveGame(true); return }
    if (st.q[i] === 1) { C.say([[a[0], 'Hast du ' + it[1] + ' ' + it[0] + ' schon gefunden? Es muss irgendwo draußen leuchten.']]); return }
    C.say([[a[0], 'Danke noch mal! Komm jederzeit vorbei.']]);
  }
  /* Fest nach dem Weltboss: Wimpelketten und schwebende Lichter über dem Ort */
  function fest(n, path, h) {
    if (!W || W.fest) return; const th = WP_TH[n], g = new T.Group(), R = rnd(500 + n);
    for (let k = 0; k < 4; k++) {
      const z = -8 - k * 6, x0 = path(z) - 9, x1 = path(z) + 9, y = Math.max(h(x0, z), h(x1, z), h(path(z), z)) + 5.6;
      for (let i = 0; i <= 12; i++) { const t = i / 12, x = x0 + (x1 - x0) * t, yy = y - Math.sin(t * Math.PI) * .9, c = th.fest[i % 3], f = mk(G.cone0 || G.cone, M(c, { e: c, ei: .4 }), x, yy - .2, z, .16, .3, .05, false); f.rotation.x = Math.PI; g.add(f) }
      for (let i = 0; i < 12; i++) { const t = (i + .5) / 12, x = x0 + (x1 - x0) * t, yy = y - Math.sin(t * Math.PI) * .9; g.add(mk(G.box, M(0xf0e8d8), x, yy, z, (x1 - x0) / 12 + .05, .03, .03, false)) }
    }
    const lights = []; for (let i = 0; i < 14; i++) { const x = path(-16) + (R() - .5) * 26, z = -6 - R() * 24, c = th.fest[i % 3], s = glow(c, 1.6, x, h(x, z) + 3 + R() * 4, z, .75); g.add(s); lights.push([s, R() * 6]) }
    scene.add(g); W.fest = g; C.anim(t => { for (const [s, p] of lights) s.position.y += Math.sin(t * 1.3 + p) * .004 });
  }
  /* Aufruf aus dem Nahkampf: alles in Schlagrichtung zerspringt */
  function smash(px, pz, ax, az) {
    if (!W) return false; let hit = false; const th = WP_TH[W.n];
    for (const b of W.br) {
      if (!b.hp) continue; const dx = b.x - px, dz = b.z - pz, d = Math.hypot(dx, dz); if (d > 2.6 || (d > .6 && (dx * ax + dz * az) / d < .2)) continue;
      b.hp = 0; b.m.visible = false; hit = true; C.emit(b.x, C.hgt(b.x, b.z) + .6, b.z, th.c, 14, 4, .7, .25, 9, 3); C.sfx('chest');
      const s = S(), sh = 3 + Math.floor(Math.random() * 6) + W.n; s.shards += sh; let t = '💎 +' + sh; if (Math.random() < .16) { s.potions += 1; t += ' · 🧪 +1' } C.toast(th.p + ': ' + t);
    }
    return hit;
  }
  function frame(dt, pl) {
    if (!W) return; const st = S().wp[W.n], t = C.time();
    for (const r of W.rings) { if (!r.m.visible) continue; r.m.rotation.y = t * 2; const d = Math.hypot(pl.x - r.x, pl.z - r.z); if (d < 1.4 && Math.abs((pl.y || 0) + 1 - r.y) < 1.3) { r.m.visible = false; st[r.key] = 1; S().shards += 20 + W.n * 3; C.sfx('ui'); C.emit(r.x, r.y, r.z, 0xffe07a, 10, 3, .5, .2, 0, 0); C.toast('💫 Splitterring · 💎 +' + (20 + W.n * 3)) } }
    for (const p of W.pads) { p.cd -= dt; if (p.cd > 0) continue; const d = Math.hypot(pl.x - p.x, pl.z - p.z); if (d < 1.2 && (pl.y || 0) <= p.y + .4) { p.cd = .8; C.bounce(17); C.sfx('portal'); C.emit(p.x, p.y + .3, p.z, WP_TH[W.n].fest[0], 16, 5, .6, .25, 4, 6) } }
    for (const o of W.items) { if (!o.m.visible) continue; o.m.rotation.y = t * 1.5; if (Math.hypot(pl.x - o.x, pl.z - o.z) < 1.6) { o.m.visible = false; st['g' + o.i] = 1; C.sfx('chest'); C.toast('✨ Gefunden: ' + o.it[1] + ' ' + o.it[0] + ' – zurück in den Ort!'); C.saveGame(true) } }
  }
  function bossDone(n, path, h) { const s = S(); if (!s.wp || !s.wp[n]) return; s.wp[n].done = 1; fest(n, path, h) }
  function count(n) { const s = S(); let k = 0; for (let i = 0; i < 3; i++) if (s.chests[n + 'c' + i]) k++; for (let i = 0; i < 9; i++) if (s.chests[n + 'x' + i]) k++; return k }
  function menu(n) {
    const st = (S().wp || {})[n]; if (!st) return ''; const a = ASK[n] || [], th = WP_TH[n];
    let h2 = `<div class="row"><span>🧰 Truhen</span><span>${count(n)}/12</span></div>`;
    a.forEach((q, i) => { const it = i ? th.it2 : th.it; h2 += `<div class="row"><span>${st.q[i] === 2 ? '✅' : st.q[i] === 1 ? '👉' : '❔'} ${q[0]}: ${it[1]} ${it[0]}</span><span>${st.q[i] === 2 ? 'erledigt' : st.q[i] === 1 ? (st['g' + i] ? 'zurückbringen' : 'suchen') : 'ansprechen'}</span></div>` });
    return h2;
  }
  return { build, smash, frame, bossDone, count, menu, clear: () => { W = null }, get W() { return W } };
}
