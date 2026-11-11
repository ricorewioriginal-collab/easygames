// Story-Etappen: jede Welt hat zwei eigene Abschnitte mit eigener Spielweise (statt jedes Kapitel nach demselben Schema).
//  chase     – jemanden verfolgen und stellen
//  escort    – eine Figur sicher durch die Wildnis begleiten (Angriffswellen)
//  survive   – Gefahrenzone (Kälte, Hitze, Sandsturm): Lebenskraft schwindet, nur an entzündeten Feuern/Steinen ist man sicher
//  companion – nur ein bestimmter Gefährte kann die Hindernisse lösen
//  memory    – Erinnerungen in der richtigen Reihenfolge wecken (Hinweis im Dialog)
//  sky       – Himmelssiegel mit dem Luftschiff entzünden
export function createEtappen(c) {
  const { T, mk, G, M, glow, scene } = c;
  let A = null;   // laufende Etappe
  const near = (x, z, r) => Math.hypot(c.pl.x - x, c.pl.z - z) < r;
  function spot(z, off) { for (let t = 0; t < 30; t++) { const x = c.pathx(z) + off + (t ? (Math.random() - .5) * t : 0), zz = z + (t ? (Math.random() - .5) * t : 0); if (c.ok(x, zz)) return [x, zz]; } return [c.pathx(z), z]; }
  function marker(x, z, col, s = 1) { const g = new T.Group(), y = c.hgt(x, z); g.position.set(x, y, z); g.add(mk(G.cyl, M(0x5a5a6a, { r: .8 }), 0, .3 * s, 0, .6 * s, .6 * s, .6 * s)); const o = mk(G.oct, M(col, { e: col, ei: .3 }), 0, 1.5 * s, 0, .45 * s, .8 * s, .45 * s, false); g.add(o); const gl = glow(col, 4 * s, 0, 1.5 * s, 0, 0); g.add(gl); scene.add(g);
    return { g, o, gl, lit(on) { o.material = M(col, { e: col, ei: on ? 2.2 : .3 }); gl.material.opacity = on ? .8 : 0; } }; }

  function start(d, n, onDone) {
    const st = { d, n, onDone, t: 0, step: 0, parts: [], done: false };
    A = st; const finish = () => { if (st.done) return; st.done = true; A = null; c.sfx('level'); c.banner(d.name, 'Etappe geschafft'); for (const p of st.parts) if (p.g) p.g.visible = false; if (d.outro) c.say(d.outro, onDone); else onDone(); };
    st.finish = finish;
    const intro = () => { c.toast('📜 ' + d.goal); };
    if (d.intro) c.say(d.intro, intro); else intro();
    const zs = [-62, -84, -106, -128];
    switch (d.k) {
      case 'chase': {
        const P = c.makeVillager(d.look), wp = zs.map((z, i) => spot(z, i % 2 ? 13 : -13)); P.root.position.set(wp[0][0], c.hgt(wp[0][0], wp[0][1]), wp[0][1]); scene.add(P.root);
        st.run = { P, wp, i: 0, x: wp[0][0], z: wp[0][1], mv: 0 }; st.text = () => `${d.goal} (${st.run.i}/${wp.length - 1})`; break; }
      case 'escort': {
        const P = c.makeVillager(d.look), z = -56, x = c.pathx(z) + 3; P.root.position.set(x, c.hgt(x, z), z); scene.add(P.root);   // geht den Weg entlang (nicht querfeldein), damit man immer folgen kann
        st.esc = { P, x, z, sz: z, gz: -140, hp: 100, w: 0, mv: 0 }; st.text = () => `${d.goal} (Leben ${Math.max(0, Math.round(st.esc.hp))} %)`; break; }
      case 'survive': case 'sky': case 'companion': case 'memory': {
        const cnt = d.k === 'survive' ? 5 : d.k === 'memory' ? 4 : d.k === 'sky' ? 4 : 3, col = d.col || 0xffb060;
        for (let i = 0; i < cnt; i++) {
          const z = -58 - i * (84 / (cnt - 1 || 1)), [x, zz] = spot(z, d.k === 'survive' ? (i % 2 ? 6 : -6) : (i % 2 ? 16 : -16));
          const y0 = d.k === 'sky' ? 18 + i * 2 : 0, m = marker(x, zz, col, d.k === 'sky' ? 1.6 : 1); if (y0) m.g.position.y += y0;
          const p = { ...m, x, z: zz, y: m.g.position.y, i, on: false }; st.parts.push(p);
          if (d.k === 'memory') { const lbl = d.items[i]; p.lbl = lbl; }
          c.INT.push({ x, z: zz, name: d.k === 'memory' ? d.items[i] : d.part, pr: d.act, rad: d.k === 'sky' ? 5 : 2.6, vis: () => !st.done && A === st && !p.on && (d.k !== 'sky' || (c.nAir() && Math.abs(c.pl.y - p.y) < 8)), talk() { use(st, p); } });
        }
        st.text = () => `${d.goal} (${st.parts.filter(p => p.on).length}/${cnt})`; break; }
    }
    return st;
  }
  function use(st, p) {
    const d = st.d;
    if (d.k === 'companion') { if (!c.S().party.includes(d.who) || c.cmpKo(d.who)) return c.toast(`Das kann nur ${d.whoN} – und ${d.whoN} muss bei dir und auf den Beinen sein.`); c.say([[d.whoN, d.lines[p.i % d.lines.length]]]); }
    if (d.k === 'memory') { const want = d.order[st.parts.filter(q => q.on).length]; if (p.i !== want) { c.sfx('hurt'); c.toast('Die Erinnerungen verschwimmen – von vorn. ' + d.hint); for (const q of st.parts) { q.on = false; q.lit(false); } c.refresh(); return; } }
    p.on = true; p.lit(true); c.sfx('pick'); c.emit(p.x, p.y + 1.5, p.z, d.col || 0xffb060, 24, 4, .7, .6);
    if (st.parts.every(q => q.on)) st.finish(); else { c.toast('📜 ' + st.text()); c.refresh(); }   // Anzeige oben rechts zählt mit
  }
  function update(dt, t) {
    const st = A; if (!st || st.done) return; st.t += dt; const d = st.d, S = c.S();
    if (st.run) {   // Verfolgung: läuft weiter, sobald man nahe kommt
      const r = st.run, [tx, tz] = r.wp[Math.min(r.i, r.wp.length - 1)], dx = tx - r.x, dz = tz - r.z, dd = Math.hypot(dx, dz);
      if (dd > .4) { const sp = Math.min(dd, 7.2 * dt); r.x += dx / dd * sp; r.z += dz / dd * sp; r.mv = 1; r.P.root.rotation.y = Math.atan2(dx, dz); } else { r.mv = 0;
        if (near(r.x, r.z, 3)) { if (r.i >= r.wp.length - 1) return st.finish(); r.i++; c.sfx('ui'); c.toast(d.flee[(r.i - 1) % d.flee.length]); c.refresh(); } else if (near(r.x, r.z, 10)) r.P.root.rotation.y = Math.atan2(c.pl.x - r.x, c.pl.z - r.z); }
      r.P.root.position.set(r.x, c.hgt(r.x, r.z), r.z); c.animHuman(r.P, t, r.mv);
    }
    if (st.esc) {   // Begleitung: geht weiter, wenn man in der Nähe ist; Wellen an festen Punkten
      const e = st.esc, dd = e.z - e.gz, prog = 1 - dd / (e.sz - e.gz);
      const go = near(e.x, e.z, 11) && !c.E.some(q => !q.dead && q.esc && Math.hypot(q.x - e.x, q.z - e.z) < 12);
      if (dd < 1.5) return st.finish();
      if (go) { e.z -= 2.6 * dt; const tx = c.pathx(e.z) + 3; e.P.root.rotation.y = Math.atan2(tx - e.x, -2.6 * dt); e.x = tx; e.mv = .45; } else e.mv = 0;
      if (e.w < 3 && prog > [.2, .5, .8][e.w]) { e.w++; c.toast(`⚔ ${d.waveT} (${e.w}/3)`); for (let i = 0; i < 3 + e.w; i++) { const a = Math.random() * 6.28; let qx = e.x, qz = e.z; for (let k = 1; k > .15; k -= .17) { qx = e.x + Math.cos(a) * 9 * k; qz = e.z + Math.sin(a) * 9 * k; if (!c.blk(qx, qz)) break; } const q = c.spawnEnemy((i % 2 ? 'a' : 'b') + st.n, qx, qz); if (q) { q.esc = 1; q.summoned = true; q.st = 'chase'; } } }
      for (const q of c.E) if (!q.dead && q.esc && Math.hypot(q.x - e.x, q.z - e.z) < 2.6) e.hp -= 7 * dt;
      if (e.hp <= 0) { c.toast(`💥 ${d.lose}`); e.hp = 100; e.z = e.sz; e.x = c.pathx(e.z) + 3; e.w = 0; for (const q of c.E) if (q.esc && !q.dead) { q.hp = 0; c.killE(q); } }
      e.P.root.position.set(e.x, c.hgt(e.x, e.z), e.z); c.animHuman(e.P, t, e.mv);
    }
    if (d.k === 'survive') {   // Gefahrenzone: in der Wildnis schwindet Leben, außer nahe an entzündeten Punkten
      const wild = c.pl.z < -50 && c.pl.z > -150, safe = st.parts.some(p => p.on && near(p.x, p.z, 8));
      if (wild && !safe && !c.pl.dead) { S.hp = Math.max(1, S.hp - c.maxHp() * .022 * dt); if ((st.warn = (st.warn || 0) - dt) <= 0) { st.warn = 5; c.toast(d.warn); } }
      c.vignette(wild && !safe ? d.tint : null);
    }
    for (const p of st.parts) { p.o.rotation.y = t * (p.on ? 2 : .6); }
  }
  return { start, update, get on() { return !!A; }, get cur() { return A; }, text: () => A && A.text ? A.text() : '', stop() { if (A) { for (const p of A.parts) if (p.g) p.g.visible = false; A = null; } c.vignette(null); } };
}

// Daten: zwei Etappen je Welt (2 = Elaris … 10 = Elyndra); 'b' = vor dem Rätsel, 'a' = vor dem Weltenboss
export const ETAP = {
  2: [{ k: 'escort', name: 'Der Weg zum Turm', goal: 'Begleite Waldhüterin Sela durch den Wald', look: { cloth: 0x5a8a4a, cloth2: 0x3a2a1e, hair: 0xd8a040, hs: 2 }, waveT: 'Dornenwölfe greifen Sela an', lose: 'Sela musste umkehren – noch einmal von vorn',
      intro: [['Sela', 'Der Wald lässt niemanden allein zum Turm. Begleitest du mich?'], ['Zotik', 'Bleib dicht hinter mir.']], outro: [['Sela', 'Da ist er, der Turm. Ohne dich wäre ich nie angekommen.']] },
    { k: 'memory', name: 'Das Gedächtnis des Waldes', goal: 'Wecke die Erinnerungen des Waldes in der richtigen Reihenfolge', items: ['Erinnerung: Same', 'Erinnerung: Regen', 'Erinnerung: Blüte', 'Erinnerung: Laub'], order: [0, 1, 2, 3], hint: 'Ein Baum wächst: erst der Same, dann Regen, dann die Blüte, zuletzt fällt das Laub.', act: 'Erinnerung wecken', col: 0x7affb0,
      intro: [['Lyra', 'Die Wurzelkönigin ist durch alte Erinnerungen geschützt. Wir müssen sie in der Reihenfolge wecken, in der ein Baum lebt.']] }],
  3: [{ k: 'chase', name: 'Der Kartendieb', goal: 'Stelle den Dieb, der Harlans Karte gestohlen hat', look: { cloth: 0x3a3a4a, cloth2: 0x2a2a30, hair: 0x2a1c16, hood: 1 }, flee: ['„Zu langsam, Fuchs!“', '„Über die Brücke, da kriegst du mich nie!“', '„Na schön … fast!“'],
      intro: [['Harlan', 'Haltet den Dieb! Er hat die Karte der Kanäle!'], ['Nia', 'Da läuft er – Richtung Norden!']], outro: [['Dieb', 'Schon gut, schon gut! Hier ist die Karte. Ich wollte nur sehen, wohin die Risse führen.'], ['Zotik', 'Dann komm mit und sieh selbst.']] },
    { k: 'companion', name: 'Die Schleusenmauern', goal: 'Lass Rovan die drei Schleusenmauern einreißen', who: 'rovan', whoN: 'Rovan', part: 'Schleusenmauer', act: 'Rovan rufen', col: 0x9ab0c8, lines: ['Zur Seite. *KRACH*', 'Die hier war hartnäckig. Nicht hartnäckig genug.', 'Das war die letzte. Weiter.'],
      intro: [['Rovan', 'Der Kanalwächter hat die Schleusen versiegelt. Zeig mir die Mauern – ich reiße sie ein.']] }],
  4: [{ k: 'survive', name: 'Der Sandsturm', goal: 'Durchquere den Sandsturm – entzünde die Lauschsteine', part: 'Lauschstein', act: 'Lauschstein wecken', col: 0xffc060, tint: 'rgba(200,150,60,.35)', warn: '🌪️ Der Sandsturm zehrt an dir – such den nächsten Lauschstein!',
      intro: [['Nuri', 'Ein Sandsturm zieht auf! Die alten Lauschsteine halten den Sand fern – weck sie, einen nach dem anderen.']] },
    { k: 'chase', name: 'Der Sandläufer', goal: 'Fang den Sandläufer, der den Sonnenschlüssel trägt', look: { cloth: 0xd8b060, cloth2: 0x8a6a3a, hair: 0x3a2a1a, hat: 1 }, flee: ['„Der Schlüssel gehört der Wüste!“', '„Die Dünen sind mein Zuhause!“', '„Du bist schnell … für einen Fuchs.“'],
      intro: [['Lyra', 'Der Sonnenschlüssel für Kharos’ Halle – jemand rennt damit davon!']] }],
  5: [{ k: 'escort', name: 'Die Kuppelreparatur', goal: 'Begleite Ingenieurin Nerea zum beschädigten Kuppelventil', look: { cloth: 0x3a8ac0, cloth2: 0x2a4a6a, hair: 0x6ae0d0, hs: 2 }, waveT: 'Riffkrabben stören die Reparatur', lose: 'Nerea musste zurück – noch einmal',
      intro: [['Nerea', 'Wenn das Kuppelventil bricht, läuft der Stadtteil voll. Schützt mich auf dem Weg!']] },
    { k: 'companion', name: 'Die Korallenherzen', goal: 'Lass Lyra die drei kranken Korallenherzen heilen', who: 'lyra', whoN: 'Lyra', part: 'Korallenherz', act: 'Lyra rufen', col: 0xff8ab0, lines: ['Ganz ruhig … *Licht*. Es schlägt wieder.', 'Das hier war fast verloren.', 'Das letzte Herz. Hörst du, wie das Riff atmet?'],
      intro: [['Lyra', 'Die Korallen sterben, weil der Splitter ihnen die Kraft nimmt. Ich kann sie heilen – bring mich hin.']] }],
  6: [{ k: 'survive', name: 'Die ewige Kälte', goal: 'Überquere die Eisfelder – entzünde die Wärmefeuer', part: 'Wärmefeuer', act: 'Feuer entzünden', col: 0xff8a3a, tint: 'rgba(120,180,255,.35)', warn: '❄️ Die Kälte kriecht in die Knochen – zum nächsten Feuer!',
      intro: [['Falk', 'Ohne Feuer erfriert ihr da draußen. Entzündet die alten Wärmefeuer auf dem Weg.']] },
    { k: 'escort', name: 'Falks letzte Fahrt', goal: 'Begleite Falk zur gefrorenen Stadt', look: { cloth: 0x8a6a4a, cloth2: 0x4a3a2a, hair: 0xd8d8d8, beard: 1 }, waveT: 'Frostwölfe umkreisen Falk', lose: 'Falk musste umkehren – noch einmal',
      intro: [['Falk', 'Ich will die Stadt noch einmal sehen. Bringt ihr mich hin?']] }],
  7: [{ k: 'survive', name: 'Die Aschefelder', goal: 'Durchquere die Hitze – wecke die Kühlkristalle', part: 'Kühlkristall', act: 'Kristall wecken', col: 0x6ad8ff, tint: 'rgba(255,90,30,.35)', warn: '🔥 Die Hitze ist unerträglich – zum nächsten Kühlkristall!',
      intro: [['Brenna', 'Die Aschefelder kochen. Nur die alten Kühlkristalle halten die Hitze ab.']] },
    { k: 'companion', name: 'Die Felssperren', goal: 'Lass Rovan die drei Felssperren vor den Minen sprengen', who: 'rovan', whoN: 'Rovan', part: 'Felssperre', act: 'Rovan rufen', col: 0xc06a3a, lines: ['Heißer Stein bricht leichter. *KRACH*', 'Noch eine.', 'Weg frei. Das Herz des Berges wartet.'],
      intro: [['Rovan', 'Der Eingang zu den Minen ist verschüttet. Lass mich vor.']] }],
  8: [{ k: 'memory', name: 'Die falschen Erinnerungen', goal: 'Wecke die wahren Erinnerungen in der richtigen Reihenfolge', items: ['Erinnerung: Abschied', 'Erinnerung: Begegnung', 'Erinnerung: Streit', 'Erinnerung: Versöhnung'], order: [1, 2, 3, 0], hint: 'Eryn sagte: erst die Begegnung, dann der Streit, dann die Versöhnung – und ganz zuletzt der Abschied.', act: 'Erinnerung wecken', col: 0xc08aff,
      intro: [['Eryn', 'Der Splitter mischt wahre und falsche Erinnerungen. Wahr ist nur, was in der richtigen Reihenfolge geschah: Begegnung, Streit, Versöhnung, Abschied.']] },
    { k: 'chase', name: 'Das Schattenkind', goal: 'Folge dem Schattenkind durch die Gassen', look: { cloth: 0x3a2a5a, cloth2: 0x1a1a2a, hair: 0xe0e0ff }, flee: ['„Fang mich doch!“', '„Hier war ich schon einmal … oder?“', '„Du gibst nicht auf, oder?“'],
      intro: [['Nia', 'Da – ein Kind aus Schatten! Es weiß, wo der Hüter ist!']], outro: [['Schattenkind', 'Du hast mich gefunden. Der Hüter wartet hinter dem dunklen Tor.']] }],
  9: [{ k: 'sky', name: 'Die Himmelssiegel', goal: 'Entzünde die vier Himmelssiegel mit dem Luftschiff', part: 'Himmelssiegel', act: 'Siegel entzünden', col: 0xffe27a,
      intro: [['Aera', 'Die Sternenruinen öffnen sich nur, wenn die Himmelssiegel brennen. Sie schweben hoch über dem Weg – nimm das Luftschiff!']] },
    { k: 'escort', name: 'Aeras Kurs', goal: 'Begleite Navigatorin Aera zu den Sternenruinen', look: { cloth: 0xe0e8ff, cloth2: 0x5a6ab0, hair: 0xffd8a0, hs: 1 }, waveT: 'Wolkenschwingen stürzen herab', lose: 'Aera musste umkehren – noch einmal',
      intro: [['Aera', 'Ich muss die Sterne an den Ruinen neu vermessen. Haltet mir den Himmel frei!']] }],
  10: [{ k: 'memory', name: 'Die Spiegel der Welten', goal: 'Wecke die Weltenspiegel in der Reihenfolge eurer Reise', items: ['Spiegel: Elaris', 'Spiegel: Solmera', 'Spiegel: Valdoria', 'Spiegel: Aqualis'], order: [0, 2, 1, 3], hint: 'Eure Reise: Elaris, dann Valdoria, dann Solmera, dann Aqualis.', act: 'Spiegel wecken', col: 0xffc8ff,
      intro: [['Lyra', 'Die Spiegel zeigen unsere Reise. Weck sie in der Reihenfolge, in der wir die Welten betreten haben.']] },
    { k: 'companion', name: 'Lyras Licht', goal: 'Lass Lyra die drei Echo-Schleier lichten', who: 'lyra', whoN: 'Lyra', part: 'Echo-Schleier', act: 'Lyra rufen', col: 0xffe0ff, lines: ['Ich sehe dich, Echo. Geh in Frieden.', 'Meine Mutter hätte das gekonnt. Jetzt kann ich es auch.', 'Der Weg zu Elyon ist frei.'],
      intro: [['Lyra', 'Die Echos verschleiern den Weg. Mein Licht kann sie lösen – bleib bei mir.']] }]
};
