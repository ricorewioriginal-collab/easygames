/* Arena von Valdoria: Turniere mit Pokalen, Superbosse, Revanche gegen alte Bosse und eine lokale Rangliste.
   Eingebunden in die Hauptgeschichte: Turniere schalten sich mit abgeschlossenen Kapitelwelten frei, der letzte Pokal und die
   Superbosse nach dem gewählten Ende. Nutzt das vorhandene Kampfsystem (spawnEnemy, Kits, Bossleiste), keine eigenen Gegnerwerte
   außer Faktoren. Speicherstand: S.ar. */
export const CUPS = [
  { id: 'bronze', n: 'Bronzepokal', em: '🥉', need: 3, rounds: 3, bn: 3, hpx: 1, pts: 120, rew: 500, fin: 'M', first: ['Bronze-Kämpfer', 'potions', 3] },
  { id: 'silber', n: 'Silberpokal', em: '🥈', need: 5, rounds: 4, bn: 7, hpx: 1.2, pts: 260, rew: 1100, fin: 'MM', first: ['Silber-Kämpfer', 'ether', 2] },
  { id: 'gold', n: 'Goldpokal', em: '🥇', need: 8, rounds: 5, bn: 11, hpx: 1.4, pts: 450, rew: 2200, fin: 'X', first: ['Gold-Kämpfer', 'fruit', 2] },
  { id: 'platin', n: 'Platinpokal', em: '🏆', need: 99, rounds: 6, bn: 16, hpx: 1.7, pts: 800, rew: 4000, fin: 'XM', first: ['Arena-Meister', 'phoenix', 1], ending: 1 }
];
export const SUPERS = [
  { id: 'urwolf', n: 'Der Urwolf', sub: 'Erster Hüter des Mondes', col: 0xdfe8ff, kit: ['blink', 'wave', 'rain'], lv: 5, hpx: 2.2, cup: 'silber', rew: 1800, pts: 500, gear: 'a_ur', title: 'Urwolf-Bezwinger', intro: 'Der Mond verdunkelt sich. Der Urwolf, älter als der Riss, steigt in die Arena.' },
  { id: 'aschen', n: 'Orun, Schatten des Risses', sub: 'Was Orun vergessen wollte', col: 0xff7a2a, kit: ['rain', 'nova', 'tri', 'summon'], lv: 11, hpx: 5, cup: 'gold', rew: 3500, pts: 900, gear: 'c_ur', title: 'Rissbezwinger', intro: 'Orun, so wie er einmal war, bevor der Riss ihn fand. Halte dich nicht zurück.' },
  { id: 'kern', n: 'Der Namenlose Kern', sub: 'Die Stille hinter allen Welten', col: 0xffe890, kit: ['blink', 'wave', 'nova', 'tri', 'summon'], lv: 19, hpx: 8, cup: 'platin', rew: 7000, pts: 1500, gear: 'w_ur', title: 'Kernbezwinger', intro: 'Nichts spricht. Nichts atmet. Dann öffnet sich die Mitte der Arena, und der Kern steht vor dir.' }
];
const RIVALS = [['Kael', 180], ['Mirael', 420], ['Eryn', 700], ['Toren', 1000], ['Aera', 1450], ['Professorium', 2100], ['Veyra', 3000]];
const TABN = ['Turniere', 'Superbosse', 'Revanche', 'Rangliste'];
const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

export function createArena(c) {
  const S = () => c.S(), R = () => { const s = c.S(); return s.ar || (s.ar = { pts: 0, cup: {}, best: {}, rev: {}, sup: {}, met: 0, runs: 0 }) };
  const run = { cur: null }; let tab = 0, spot = null;
  const finList = () => { const o = [], s = S(); for (let k = 2; k <= 10; k++) if (s.cd[k] && s.cd[k].fin) o.push(k); return o };
  const ended = () => !!S().ending;
  const cupOpen = q => q.ending ? ended() && finList().length >= 9 : finList().length >= q.need;
  const supOpen = q => !!R().cup[q.cup];
  /* Gegnerarten je Kapitelwelt (wie mkE in buildWorld, aber unter eigenen Schlüsseln) */
  function ensure(k) {
    if (c.ED['arA' + k]) return; const C = c.CHP[k]; if (!C) return;
    const mk = (key, d, make, ex) => { c.ED[key] = Object.assign({ hp: d[1], dmg: Math.round(d[2] * .8), xp: Math.round(d[1] * .3), spd: 3.4, aggro: 60, rng: 9, wind: .8, cool: 2.4, sc: 1, sh: [k, k * 2 + 2], col: d[3], name: d[0], make }, ex); c.WLD().edKeys.push(key) };
    const own = (sl, d, fb) => () => c.makeCreature(k, sl, d[3]) || fb();
    mk('arA' + k, C.A, own('A', C.A, () => c.tint(c.makeRiftling(), C.A[3], .6)), { base: 'rift', ranged: true, hov: 1.3 });
    mk('arB' + k, C.B, own('B', C.B, () => c.tint(c.makeWolf(false), C.B[3], .5)), { base: 'wolf', spd: 5.8, rng: 2.5, wind: .6, cool: 1.3 });
    mk('arM' + k, C.M, own('M', C.M, () => c.tint(c.makeWolf(false), C.M[3], .55)), { kit: c.MKIT[k], base: 'wolf', spd: 5.2, rng: 3.4, wind: .75, cool: 1.1, sc: 1.55, mini: true });
    mk('arX' + k, C.X, own('X', C.X, () => c.tint(c.makeWolf(true), C.X[3], .45)), { kit: c.BKIT[k], base: 'wolf', spd: 5.4, rng: 4.6, wind: .7, cool: 1.1, sc: 2, boss: true, sub: C.X[4], p2t: C.X[0] + ' bäumt sich auf!', minion: 'arA' + k });
  }
  function ensureSup(q) {
    const key = 'ars_' + q.id; if (c.ED[key]) return; ensure(10);
    c.ED[key] = { hp: 900, dmg: 40, xp: 400, spd: 5.6, aggro: 60, rng: 4.8, wind: .65, cool: 1, sc: 2.5, sh: [80, 140], col: q.col, name: q.n, make: () => c.tint(c.makeWolf(true), q.col, .55), kit: q.kit, base: 'wolf', boss: true, sub: q.sub, p2t: q.n + ' entfesselt seine Kraft!', minion: 'arA10' };
    c.WLD().edKeys.push(key);
  }
  const base = () => { const W = c.WLD(); return W && W.lv ? W.lv : c.WLV[3] };
  const lvBonus = (target, off) => Math.max(-4, Math.round(target - base() - off));
  function place(i, n) { const a = Math.random() * 6.283, r = 9 + Math.random() * 3; let x = spot.x + Math.cos(a) * r, z = spot.z + Math.sin(a) * r; for (let t = 0; t < 20 && c.blocked(x, z); t++) { const b = Math.random() * 6.283; x = spot.x + Math.cos(b) * r; z = spot.z + Math.sin(b) * r } return [x, z] }
  function foe(key, bonus, mult, isBoss) {
    const [x, z] = place(); const e = c.spawn(key, x, z, bonus); e.ar = 1; e.summoned = true; e.st = 'chase';
    if (mult !== 1) { e.hp = e.max = Math.round(e.max * mult) }
    if (isBoss) { e.awake = true; e.face = 0; c.setBoss(e); c.$('boss').hidden = false; c.$('bossn').textContent = e.d.name + ' · Lv. ' + e.lv }
    return e;
  }
  const pick = a => a[Math.random() * a.length | 0];
  /* ---- Ablauf ---- */
  function begin(r) {
    if (c.MP().role === 'guest') return c.toast('Nur der Gastgeber startet Kämpfe in der Arena.');
    if (run.cur) return c.toast('Ein Kampf läuft bereits.'); if (!spot) return;
    c.closePuzzle(); r.t = 0; r.gap = 0; r.left = 0; run.cur = r; R().runs++;
    if (r.kind === 'cup') nextRound(); else single();
  }
  function nextRound() {
    const r = run.cur, q = r.cup, pool = r.pool, last = r.r === q.rounds; let n = 0;
    const mk = (kind, boss) => { const k = pick(pool); ensure(k); const off = kind === 'X' ? 4 : kind === 'M' ? 3 : 1.5; foe('ar' + kind + k, lvBonus(c.WLV[k] + q.bn, off), q.hpx * (kind === 'X' ? .55 : 1), boss); n++ };
    if (last) { for (const f of q.fin) mk(f, f === 'X' && !c.hasBoss()); for (let i = 0; i < 2; i++) mk(i ? 'B' : 'A') }
    else { const cnt = Math.min(8, 2 + r.r + (q.rounds > 4 ? 1 : 0)); for (let i = 0; i < cnt; i++) mk(i % 3 === 2 ? 'B' : i === cnt - 1 && r.r > 2 ? 'M' : 'A') }
    r.left = n; c.banner(q.n + ' · Runde ' + r.r + '/' + q.rounds, last ? 'Finale' : 'Gegner: ' + n); c.sfx('roar');
  }
  function single() {
    const r = run.cur;
    if (r.kind === 'sup') { const q = r.sup; ensureSup(q); const e = foe('ars_' + q.id, Math.max(-4, Math.min(95, S().lvl + q.lv - base() - 4)), q.hpx, true); r.left = 1; c.banner(q.n, q.sub); c.sfx('roar'); c.shake(.6); return e }
    const k = r.k; let key, t;
    if (k === 'wolf') key = 'boss'; else if (k === 'orun') key = 'orun'; else { ensure(k); key = 'arX' + k }
    t = (k === 'wolf' || k === 'orun') ? S().lvl + 2 : c.WLV[k] + 6; const e = foe(key, Math.max(-4, Math.round(t - base() - 4)), 1.4, true); e.arRev = 1; r.left = 1;
    c.banner('Revanche: ' + e.d.name, e.d.sub || ''); c.sfx('roar');
  }
  function kill(e) {
    const r = run.cur; if (!r) return; r.left--; if (e.boss) { c.hideBoss(); c.setBoss(null) } if (r.left > 0) return;
    if (r.kind === 'cup' && r.r < r.cup.rounds) { c.toast('✔ Runde ' + r.r + ' geschafft'); r.r++; r.gap = 2.8; return }
    done(r);
  }
  function done(r) {
    run.cur = null; const A = R(), t = r.t;
    if (r.kind === 'cup') {
      const q = r.cup, first = !A.cup[q.id], par = q.rounds * 50, bonus = Math.max(0, Math.round((par - t) / 2)), pts = Math.round((q.pts + bonus) * (first ? 1 : .5)), sh = Math.round(q.rew * (first ? 1 : .4));
      A.cup[q.id] = 1; if (!A.best[q.id] || t < A.best[q.id]) A.best[q.id] = Math.round(t); A.pts += pts; c.S().shards += sh; c.gainXp(150 + q.rounds * 90);
      c.banner(q.em + ' ' + q.n + ' gewonnen', 'Zeit ' + fmt(t) + (first ? ' · Erster Sieg' : '')); c.sfx('level'); c.toast('💎 +' + sh + ' · 🏅 +' + pts + ' Arenapunkte');
      if (first) { const [ti, key, nn] = q.first, s = c.S(); (s.titles = s.titles || []).includes(ti) || s.titles.push(ti); if (key === 'potions') s.potions += nn; else s.items[key] = (s.items[key] || 0) + nn; c.toast('🎖️ Titel: ' + ti + ' · ' + nn + '× ' + ({ potions: 'Trank', ether: 'Äther', fruit: 'Frucht', phoenix: 'Phönixfeder' })[key]) }
    } else if (r.kind === 'sup') {
      const q = r.sup, first = !A.sup[q.id], sh = Math.round(q.rew * (first ? 1 : .3)), pts = Math.round(q.pts * (first ? 1 : .4));
      A.sup[q.id] = (A.sup[q.id] || 0) + 1; A.pts += pts; c.S().shards += sh; c.gainXp(600);
      c.banner(q.n + ' besiegt', first ? 'Erster Sieg' : 'Wiederholt'); c.sfx('level'); c.toast('💎 +' + sh + ' · 🏅 +' + pts);
      if (first) { const s = c.S(); (s.titles = s.titles || []).includes(q.title) || s.titles.push(q.title); c.giveGear(q.gear); c.toast('🎖️ Titel: ' + q.title) }
    } else {
      const k = r.k, first = !A.rev[k], sh = (k === 'wolf' ? 300 : k === 'orun' ? 400 : 200 + k * 60) * (first ? 2 : 1), pts = 30 + (typeof k === 'number' ? k * 8 : 10) * (first ? 2 : 1);
      A.rev[k] = (A.rev[k] || 0) + 1; A.pts += pts; c.S().shards += sh; c.gainXp(200); c.banner('Revanche gewonnen', first ? 'Erste Revanche: doppelte Belohnung' : ''); c.sfx('level'); c.toast('💎 +' + sh + ' · 🏅 +' + pts);
    }
    c.saveGame(true);
  }
  function abort() {
    for (const e of c.E()) if (e.ar && !e.dead) { e.dead = true; e.m.root.visible = false; e.tel.visible = false }
    if (run.cur) { c.hideBoss(); c.setBoss(null) } run.cur = null;
  }
  /* ---- Menü ---- */
  function board() {
    const A = R(), rows = RIVALS.map(([n, p]) => [n, p, 0]); rows.push(['Zotik', A.pts, 1]); rows.sort((a, b) => b[1] - a[1]);
    return rows;
  }
  function open() {
    if (!spot) return; if (!run.cur || !c.E().some(e => e.ar && !e.dead)) run.cur = null;
    c.openPanel('🏟️ Arena von Valdoria', () => 'Arenapunkte: ' + R().pts + ' · Platz ' + (board().findIndex(r => r[2]) + 1) + ' von ' + (RIVALS.length + 1), W => {
      const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px'; TABN.forEach((t, i) => { const b = c.pBtn((i === tab ? '▶ ' : '') + t, () => { tab = i; c.rePanel() }); bar.appendChild(b) }); W.appendChild(bar);
      const busy = !!run.cur, fl = finList();
      if (tab === 0) {
        for (const q of CUPS) { const ok = cupOpen(q), A = R(); c.pRow(W, q.em + ' <b>' + q.n + '</b> · ' + q.rounds + ' Runden' + (A.cup[q.id] ? ' · ✅ Bestzeit ' + fmt(A.best[q.id] || 0) : '') + '<br><small>' + (ok ? 'Finale: ' + (q.fin.includes('X') ? 'Weltenboss' : 'Wächter') + ' · Belohnung ' + q.rew + ' Splitter' : q.ending ? '🔒 Erst nach dem Ende der Hauptgeschichte (alle Kapitel, Siegel gebrochen)' : '🔒 Schließe ' + q.need + ' Kapitelwelten ab (' + fl.length + '/' + q.need + ')') + '</small>', c.pBtn(busy ? 'läuft …' : 'Antreten', () => begin({ kind: 'cup', cup: q, r: 1, pool: fl.slice() }), !ok || busy)) }
        c.pRow(W, '<small>Gegner stammen aus den Welten, die du gerettet hast. Fällst du, ist das Turnier vorbei; Belohnungen gibt es nur am Ende.</small>');
      } else if (tab === 1) {
        for (const q of SUPERS) { const ok = supOpen(q), n = R().sup[q.id] || 0; c.pRow(W, '👑 <b>' + (ok ? q.n : '???') + '</b>' + (n ? ' · besiegt ×' + n : '') + '<br><small>' + (ok ? q.sub + ' · ' + q.rew + ' Splitter' + (n ? '' : ' · Uralt-Ausrüstung & Titel') : '🔒 Gewinne den ' + CUPS.find(x => x.id === q.cup).n) + '</small>', c.pBtn(busy ? 'läuft …' : 'Herausfordern', () => { c.say([['Garrik', q.intro]], () => begin({ kind: 'sup', sup: q })) }, !ok || busy)) }
        c.pRow(W, '<small>Superbosse sind deutlich stärker als jeder Weltenboss und wachsen mit deiner Stufe.</small>');
      } else if (tab === 2) {
        const S0 = c.S(), L = []; if (S0.boss) L.push(['wolf', 'Mondwolf-Alpha', 'Lunaris']); if (S0.orun) L.push(['orun', 'Orun', 'Lunaris']);
        for (const k of fl) L.push([k, c.CHP[k].X[0], c.CHP[k].name]);
        if (!L.length) c.pRow(W, 'Besiege Weltenbosse, dann kannst du dich hier erneut mit ihnen messen.');
        for (const [k, n, w] of L) c.pRow(W, '⚔️ <b>' + n + '</b> · ' + w + (R().rev[k] ? ' · ×' + R().rev[k] : '') + '<br><small>Stärker als beim ersten Mal · ' + (R().rev[k] ? 'Belohnung normal' : 'erste Revanche: doppelte Belohnung') + '</small>', c.pBtn(busy ? 'läuft …' : 'Revanche', () => begin({ kind: 'rev', k }), busy));
      } else {
        board().forEach((r, i) => c.pRow(W, (i + 1) + '. ' + (r[2] ? '<b>' + r[0] + ' (du)</b>' : r[0]) + ' · ' + r[1] + ' Punkte'));
        const A = R(); for (const q of CUPS) if (A.best[q.id]) c.pRow(W, q.em + ' Bestzeit ' + q.n + ': ' + fmt(A.best[q.id]));
        const ti = c.S().titles || []; if (ti.length) c.pRow(W, '🎖️ Titel: ' + ti.join(' · '));
      }
    });
  }
  /* ---- Bau in Valdoria ---- */
  function build(n, mir) {
    run.cur = null; spot = null; if (n !== 3) return;
    /* freie Fläche suchen: abseits von Markt (Mitte), Hafen und Wohnung, mit möglichst viel Platz ringsum */
    let ax, az, best = -1;
    for (let x = -64; x <= 64; x += 4) for (let z = -76; z <= 64; z += 4) {
      if (Math.hypot(x, z) < 34 || Math.hypot(x + 30 * mir, z - 30) < 22 || Math.hypot(x - 30 * mir, z - 28) < 22 || c.blocked(x, z)) continue;
      let r = 0; while (r < 22 && c.colFree(x, z, r + 2)) r += 2; if (r < 14) continue;
      let ok = true; for (let a = 0; ok && a < 12; a++) if (c.blocked(x + Math.cos(a * .5236) * 14, z + Math.sin(a * .5236) * 14)) ok = false;
      const sc = r * 10 - Math.hypot(x, z) * .2; if (ok && sc > best) { best = sc; ax = x; az = z }
    }
    if (ax === undefined) { ax = 0; az = -56 }
    spot = { x: ax, z: az }; const { T, mk, G, M, glow } = c, g = new T.Group(), y = c.hgt(ax, az); g.position.set(ax, y, az);
    g.add(mk(G.cyl, M(0x6a5a4a, { r: .8 }), 0, .3, 0, 7, .6, 7)); const rg = mk(G.tor, M(0xff9a4a, { e: 0xff6a20, ei: 1.2 }), 0, .7, 0, 6.8, 6.8, .2, false); rg.rotation.x = Math.PI / 2; g.add(rg);
    for (let k = 0; k < 8; k++) { const a = k * .785; g.add(mk(G.cyl0, M(0x9a8a7a), Math.cos(a) * 6.2, 2.4, Math.sin(a) * 6.2, .55, 4.8, .55)); g.add(mk(G.oct, M(0xff9a4a, { e: 0xff7a20, ei: 1.6 }), Math.cos(a) * 6.2, 5.2, Math.sin(a) * 6.2, .4, .6, .4, false)) }
    const fl = mk(G.oct, M(0xffd070, { e: 0xffa030, ei: 1.8 }), 0, 2.2, 0, .6, .9, .6, false); g.add(fl); g.add(glow(0xffa040, 2.6, 0, 2.2, 0, .45)); g.add(mk(G.cyl0, M(0x6a5a4a), 0, 1, 0, .7, 1.6, .7)); c.scene.add(g); c.addCol(ax, az, .8);
    c.anim((t, dt) => { fl.rotation.y = t; fl.position.y = 2.2 + Math.sin(t * 2) * .12; const r = run.cur; if (!r) return;
      if (!c.playing()) return; r.t += dt; if (Math.hypot(c.pl.x - ax, c.pl.z - az) > 50) { abort(); return c.toast('Du hast die Arena verlassen – Kampf abgebrochen.') }
      if (r.gap > 0) { r.gap -= dt; if (r.gap <= 0) nextRound() } });
    c.INT.push({ x: ax, z: az, name: 'Arena von Valdoria', pr: 'Arena betreten', rad: 5, vis: () => true, talk() { talkMaster() } });
    const mx = ax + 4, mz = az + 9; c.addNpc('garrik', 'Garrik', mx, mz, c.folk('Garrik', c.V(0xa03a2a, 0x5a2a1a, 0x2a1a1a, { sc: 1.1, beard: 1, wide: 1.15 })), talkMaster, Math.PI, () => !R().met);
  }
  function talkMaster() {
    const A = R(), fl = finList().length;
    if (!A.met) { A.met = 1; c.saveGame(true); return c.say([['Garrik', 'Willkommen in der Arena von Valdoria, Zotik. Seit der Riss die Welten berührt, trainieren hier Kämpfer aus allen Ecken.'], ['Garrik', 'Wer Kapitelwelten rettet, darf sich messen: Turniere, Pokale, Revanche gegen alte Bosse. Dein Name steht bald auf der Tafel.'], ['Zotik', 'Und die Gegner?'], ['Garrik', 'Die Wesen der Welten, die du gerettet hast. Je mehr Welten, desto härter die Pokale. Wer das Ende der Reise erreicht, dem öffne ich die Kammern der Superbosse.']], open) }
    c.say([['Garrik', fl < 3 ? 'Rette erst ' + (3 - fl) + ' weitere Kapitelwelt(en), dann nehme ich dich ins erste Turnier auf.' : 'Bereit für die Arena? Dein Platz in der Rangliste: ' + (board().findIndex(r => r[2]) + 1) + '.']], open);
  }
  /* Nach einer geretteten Welt: Hinweis auf neue Turniere */
  function news(n) { const fl = finList().length; for (const q of CUPS) if (!q.ending && fl === q.need) return c.toast('🏟️ Die Arena in Valdoria öffnet den ' + q.n); if (n === 10) c.toast('🏟️ In der Arena von Valdoria wartet bald das Platinturnier') }
  function stat() { const A = R(); if (!A.pts && !Object.keys(A.cup).length) return ''; return '<div class="row"><span>🏟️ Arena: ' + CUPS.filter(q => A.cup[q.id]).map(q => q.em).join(' ') + ' ' + Object.keys(A.sup).length + '/3 Superbosse</span><span>' + A.pts + ' Punkte</span></div>' }
  return { build, kill, abort, open, news, stat, board, run, CUPS, SUPERS, finList, ensure };
}
