/* Werwolf-Nacht – Kern: Rollen, Nacht (Leibwächter → Werwölfe → Seherin → Hexe), Morgen, Tag mit Aussagen, Abstimmung, Jäger,
 * Sieg. Computer-Dorfbewohner mit Verdachts-Gedächtnis: Seherin weiß, Werwölfe tarnen sich, Anklagen und Abstimmungen färben ab.
 * Ohne DOM, deterministisch mit Startzahl – genutzt vom Solo-Spiel und vom Fernseher (Gastgeber). Testbar mit node. */
(function (root) {
  'use strict';
  const ROLES = {
    wolf: { n: 'Werwolf', team: 'wolf', icon: '🐺', night: true, desc: 'Nachts sucht ihr Werwölfe euch gemeinsam ein Opfer. Tagsüber tarnst du dich als harmloser Dorfbewohner.' },
    seer: { n: 'Seherin', team: 'village', icon: '🔮', night: true, desc: 'Jede Nacht schaust du dir eine Person an und erfährst, ob sie ein Werwolf ist.' },
    witch: { n: 'Hexe', team: 'village', icon: '🧪', night: true, desc: 'Du hast einen Heiltrank (rettet das Opfer der Nacht) und einen Gifttrank (tötet jemanden) – jeden nur einmal.' },
    guard: { n: 'Leibwächter', team: 'village', icon: '🛡️', night: true, desc: 'Jede Nacht beschützt du eine Person vor den Werwölfen – aber nie zweimal hintereinander dieselbe.' },
    hunter: { n: 'Jäger', team: 'village', icon: '🏹', night: false, desc: 'Wenn du stirbst, darfst du mit deinem letzten Schuss jemanden mitnehmen.' },
    villager: { n: 'Dorfbewohner', team: 'village', icon: '🧑‍🌾', night: false, desc: 'Du hast keine besondere Fähigkeit – aber deine Stimme zählt. Finde die Werwölfe!' }
  };
  const ORDER = ['guard', 'wolf', 'seer', 'witch'];
  function rng(seed) { let a = (seed >>> 0) || 7; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(r, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Rollen je Spielerzahl (5–12)
  function deal(n) {
    const r = ['seer'], wolves = n <= 6 ? 1 : n <= 9 ? 2 : 3;
    for (let i = 0; i < wolves; i++) r.push('wolf');
    if (n >= 6) r.push('witch'); if (n >= 7) r.push('hunter'); if (n >= 8) r.push('guard');
    while (r.length < n) r.push('villager');
    return r;
  }
  // players: [{ name, bot, look }]; o: { seed, force: { index: rolle } }
  function newGame(players, o) {
    o = o || {}; const r = rng(o.seed || 1), n = players.length;
    let roles = shuffle(r, deal(n));
    if (o.force) for (const i in o.force) { const want = o.force[i], j = roles.indexOf(want); if (j >= 0) { [roles[i], roles[j]] = [roles[j], roles[i]]; } }
    const G = { seed: o.seed || 1, r, day: 0, phase: 'night', n, over: null, log: [], potions: { heal: 1, kill: 1 }, guardLast: -1, night: null, seen: {}, claims: [], lastLynch: null, votesHist: [],
      p: players.map((pl, i) => ({ id: i, name: pl.name, bot: !!pl.bot, look: pl.look != null ? pl.look : i * 7919, role: roles[i], alive: true, died: 0, how: '' })) };
    // Verdachts-Gedächtnis jedes Computer-Spielers
    G.sus = G.p.map(a => G.p.map(b => a.id === b.id ? -999 : (r() - .5) * 4));
    G.p.forEach(a => { if (a.role === 'wolf') G.p.forEach(b => { if (b.role === 'wolf' && b.id !== a.id) G.sus[a.id][b.id] = -500; }); });
    startNight(G); return G;
  }
  const alive = G => G.p.filter(p => p.alive);
  const aliveIds = G => alive(G).map(p => p.id);
  const wolvesAlive = G => alive(G).filter(p => p.role === 'wolf');
  function winner(G) {
    const w = wolvesAlive(G).length, o = alive(G).length - w;
    if (!w) return 'village'; if (w >= o) return 'wolf'; return null;
  }
  function startNight(G) { G.day++; G.phase = 'night'; G.night = { guard: -1, wolfVotes: {}, seer: -1, witchHeal: false, witchKill: -1, victim: -1, done: {} }; }
  // Wer muss in dieser Nacht handeln? (nur Lebende)
  function actors(G, kind) { return alive(G).filter(p => p.role === kind); }
  function needs(G, kind) {
    if (kind === 'witch') return actors(G, 'witch').length > 0 && (G.potions.heal || G.potions.kill);
    return actors(G, kind).length > 0;
  }
  function targets(G, kind, pid) {
    const ids = aliveIds(G);
    if (kind === 'guard') return ids.filter(i => i !== G.guardLast);
    if (kind === 'wolf') return ids.filter(i => G.p[i].role !== 'wolf');
    if (kind === 'seer') return ids.filter(i => i !== pid && !(G.seen[pid] && G.seen[pid][i] !== undefined));
    if (kind === 'witch') return ids.filter(i => i !== pid);
    return ids.filter(i => i !== pid);
  }
  // Opfer der Werwölfe (Mehrheit, bei Gleichstand Zufall) – vor dem Zug der Hexe nötig
  function wolfVictim(G) {
    const N = G.night; if (N.victim >= 0) return N.victim;
    const c = {}; for (const w in N.wolfVotes) { const t = N.wolfVotes[w]; if (t >= 0) c[t] = (c[t] || 0) + 1; }
    const ks = Object.keys(c).map(Number); if (!ks.length) return -1;
    const mx = Math.max(...ks.map(k => c[k])), top = ks.filter(k => c[k] === mx);
    N.victim = top[Math.floor(G.r() * top.length)]; return N.victim;
  }
  function act(G, kind, pid, target, extra) {
    const N = G.night, P = G.p[pid]; if (!P || !P.alive || P.role !== kind || G.phase !== 'night') return false;
    if (kind === 'guard') { if (target === G.guardLast || !G.p[target] || !G.p[target].alive) return false; N.guard = target; }
    else if (kind === 'wolf') { if (target >= 0 && (!G.p[target] || !G.p[target].alive || G.p[target].role === 'wolf')) return false; N.wolfVotes[pid] = target; N.victim = -1; }
    else if (kind === 'seer') { if (!G.p[target] || !G.p[target].alive || target === pid) return false; N.seer = target; (G.seen[pid] = G.seen[pid] || {})[target] = G.p[target].role === 'wolf'; if (G.sus[pid]) G.sus[pid][target] = G.p[target].role === 'wolf' ? 500 : -300; }
    else if (kind === 'witch') { extra = extra || {}; if (extra.heal && G.potions.heal && wolfVictim(G) >= 0) N.witchHeal = true; if (extra.kill >= 0 && G.potions.kill && G.p[extra.kill] && G.p[extra.kill].alive && extra.kill !== pid) N.witchKill = extra.kill; }
    N.done[kind + pid] = true; return true;
  }
  /* ---------- Computer: Nacht ---------- */
  const top = (G, pid, ids, f) => { let best = -1, bv = -1e9; for (const i of ids) { const v = (f ? f(i) : G.sus[pid][i]) + G.r() * 3; if (v > bv) { bv = v; best = i; } } return best; };
  // Bedrohung für die Werwölfe: wer sie verdächtigt oder sich als Seherin ausgibt
  function threat(G, i) {
    let t = 0; for (const w of wolvesAlive(G)) t += Math.max(0, G.sus[i][w.id]) * .4;
    if (G.claims.some(c => c.pid === i && c.kind === 'seer')) t += 60; if (G.p[i].role === 'seer' && G.day > 2) t += 3; return t;
  }
  function botNight(G, kind) {
    for (const P of actors(G, kind)) {
      if (!P.bot || G.night.done[kind + P.id]) continue; const ts = targets(G, kind, P.id);
      if (kind === 'guard') { const claim = G.claims.find(c => c.kind === 'seer' && G.p[c.pid].alive && c.pid !== P.id && G.guardLast !== c.pid); act(G, 'guard', P.id, claim ? claim.pid : ts.includes(P.id) && G.r() < .4 ? P.id : top(G, P.id, ts, i => -G.sus[P.id][i])); }
      else if (kind === 'wolf') act(G, 'wolf', P.id, top(G, P.id, ts, i => threat(G, i)));
      else if (kind === 'seer') { if (ts.length) act(G, 'seer', P.id, top(G, P.id, ts)); else G.night.done['seer' + P.id] = true; }
      else if (kind === 'witch') {
        const v = wolfVictim(G), ex = {};
        if (v >= 0 && G.potions.heal && (v === P.id || G.day === 1 && G.r() < .7 || G.claims.some(c => c.pid === v && c.kind === 'seer'))) ex.heal = true;
        if (G.potions.kill && G.day > 1) { const t = top(G, P.id, ts.filter(i => i !== v)); if (t >= 0 && G.sus[P.id][t] > 30) ex.kill = t; }
        act(G, 'witch', P.id, -1, ex);
      }
    }
  }
  /* ---------- Morgen ---------- */
  function kill(G, id, how) { const P = G.p[id]; if (!P || !P.alive) return false; P.alive = false; P.died = G.day; P.how = how; return true; }
  function resolveNight(G) {
    for (const k of ORDER) botNight(G, k);
    const N = G.night, v = wolfVictim(G), died = [];
    let saved = '';
    if (v >= 0) { if (N.guard === v) saved = 'guard'; else if (N.witchHeal) saved = 'witch'; else { kill(G, v, 'wolf'); died.push(v); } }
    if (N.witchHeal) G.potions.heal = 0;
    if (N.witchKill >= 0) { G.potions.kill = 0; if (kill(G, N.witchKill, 'poison')) died.push(N.witchKill); }
    G.guardLast = N.guard; G.phase = 'dawn';
    // Wer nachts stirbt und jemanden laut verdächtigt hatte, macht diesen Verdacht glaubwürdiger
    for (const d of died) for (const c of G.claims) if (c.pid === d && c.target >= 0) bump(G, c.target, c.wolf ? 18 : -8);
    G.log.push({ day: G.day, night: true, died: died.slice(), saved });
    const hunter = died.find(i => G.p[i].role === 'hunter');
    G.over = winner(G);
    return { died, saved, victim: v, hunter: hunter === undefined ? -1 : hunter };
  }
  function bump(G, target, v, except) { for (const P of G.p) if (P.bot && P.alive && P.id !== target && P.id !== except && !(P.role === 'wolf' && G.p[target].role === 'wolf') && !(G.seen[P.id] && G.seen[P.id][target] !== undefined)) G.sus[P.id][target] += v; }
  function hunterShot(G, pid, target) {
    const P = G.p[pid]; if (!P || P.role !== 'hunter' || P.shot) return false;
    if (target === undefined || target === null) { const ts = aliveIds(G).filter(i => i !== pid); target = top(G, pid, ts); }
    P.shot = true; if (target < 0 || !kill(G, target, 'hunter')) return false; G.over = winner(G); return target;
  }
  /* ---------- Tag: Aussagen ---------- */
  // Rückgabe: Liste von Aussagen { pid, kind: 'accuse'|'claim'|'defend'|'calm', target, wolf } – die App macht daraus Text
  function dayTalk(G) {
    G.phase = 'day'; const out = [];
    for (const P of shuffle(G.r, alive(G).filter(p => p.bot))) {
      const ids = aliveIds(G).filter(i => i !== P.id);
      // Seherin mit Wolf-Fund packt aus (oder schon bekannt)
      if (P.role === 'seer' && G.seen[P.id]) {
        const found = Object.keys(G.seen[P.id]).map(Number).find(i => G.seen[P.id][i] && G.p[i].alive);
        if (found !== undefined && (G.r() < .75 || G.claims.some(c => c.pid === P.id))) { out.push(say(G, P.id, 'claim', found, true)); continue; }
      }
      // Werwolf: manchmal falsche Seherin, sonst gegen den gefährlichsten Ankläger
      if (P.role === 'wolf') {
        const realClaim = G.claims.find(c => c.kind === 'seer' && c.pid !== P.id && G.p[c.pid].alive);
        if (realClaim && G.r() < .35 && !G.claims.some(c => c.pid === P.id)) { out.push(say(G, P.id, 'claim', realClaim.pid, true)); continue; }
        const t = top(G, P.id, ids.filter(i => G.p[i].role !== 'wolf'), i => threat(G, i) + avgSus(G, i) * .6); out.push(say(G, P.id, G.r() < .8 ? 'accuse' : 'calm', t)); continue;
      }
      const t = top(G, P.id, ids), v = G.sus[P.id][t];
      out.push(say(G, P.id, v > 12 ? 'accuse' : v > 4 ? 'doubt' : G.r() < .5 ? 'calm' : 'doubt', t));
    }
    return out;
  }
  const avgSus = (G, i) => { let s = 0, n = 0; for (const P of alive(G)) if (P.bot && P.id !== i && P.role !== 'wolf') { s += G.sus[P.id][i]; n++; } return n ? s / n : 0; };
  function say(G, pid, kind, target, wolf) {
    if (kind === 'claim') { claim(G, pid, target, wolf); return { pid, kind, target, wolf }; }
    if (kind === 'accuse' || kind === 'doubt') accuse(G, pid, target, kind === 'accuse' ? 1 : .5);
    return { pid, kind, target };
  }
  // Jemand verdächtigt jemanden – färbt auf die anderen ab (je nachdem, wie glaubwürdig der Ankläger wirkt)
  function accuse(G, pid, target, w) {
    w = w == null ? 1 : w; if (!G.p[target] || !G.p[target].alive) return;
    for (const P of alive(G)) { if (!P.bot || P.id === pid || P.id === target) continue; if (P.role === 'wolf' && G.p[target].role === 'wolf') continue; if (G.seen[P.id] && G.seen[P.id][target] !== undefined) continue; const trust = Math.max(-1, Math.min(1, -G.sus[P.id][pid] / 30)); G.sus[P.id][target] += (5 + trust * 4) * w; }
    G.claims.push({ pid, kind: 'accuse', target, day: G.day });
  }
  // „Ich bin die Seherin: X ist (k)ein Werwolf“ – zwei Seherinnen machen sich gegenseitig verdächtig
  function claim(G, pid, target, wolf) {
    const others = G.claims.filter(c => c.kind === 'seer' && c.pid !== pid && G.p[c.pid].alive);
    G.claims.push({ pid, kind: 'seer', target, wolf: !!wolf, day: G.day });
    for (const P of alive(G)) {
      if (!P.bot || P.id === pid) continue;
      if (P.role === 'seer') { G.sus[P.id][pid] += 80; continue; }     // die echte Seherin weiß: das ist gelogen
      if (P.role === 'wolf') continue;
      const doubt = others.length ? .35 : 1; if (target !== P.id) G.sus[P.id][target] += (wolf ? 45 : -25) * doubt;
      if (others.length) { G.sus[P.id][pid] += 10; others.forEach(o => { G.sus[P.id][o.pid] += 10; }); }
    }
  }
  /* ---------- Abstimmung ---------- */
  function botVotes(G) {
    G.phase = 'vote'; const v = {};
    for (const P of alive(G)) {
      if (!P.bot) continue; const ids = aliveIds(G).filter(i => i !== P.id);
      if (P.role === 'wolf') v[P.id] = top(G, P.id, ids.filter(i => G.p[i].role !== 'wolf'), i => avgSus(G, i) + threat(G, i) * .5);
      else v[P.id] = top(G, P.id, ids);
    }
    return v;
  }
  // votes: { wählerId: zielId | -1 (enthalten) } → Mehrheit; Gleichstand = niemand
  function resolveVote(G, votes) {
    const c = {}; for (const k in votes) { const t = votes[k]; if (t >= 0 && G.p[t] && G.p[t].alive && G.p[k] && G.p[k].alive) c[t] = (c[t] || 0) + 1; }
    const ks = Object.keys(c).map(Number); let out = -1;
    if (ks.length) { const mx = Math.max(...ks.map(k => c[k])), tops = ks.filter(k => c[k] === mx); if (tops.length === 1) out = tops[0]; }
    if (out >= 0) {
      kill(G, out, 'vote'); const isWolf = G.p[out].role === 'wolf';
      // aus dem Ergebnis lernen: wer gegen einen Unschuldigen gestimmt hat, wird verdächtiger
      for (const k in votes) { const voter = +k; if (votes[k] === out) bump(G, voter, isWolf ? -12 : 14, voter); else if (votes[k] >= 0 && isWolf) bump(G, voter, 4, voter); }
    }
    G.lastLynch = out; G.votesHist.push({ day: G.day, votes: Object.assign({}, votes), out });
    G.log.push({ day: G.day, vote: out, counts: c }); G.phase = 'verdict'; G.over = winner(G);
    return { out, counts: c, hunter: out >= 0 && G.p[out].role === 'hunter' ? out : -1 };
  }
  function nextNight(G) { if (!G.over) startNight(G); }

  const WW = { ROLES, ORDER, deal, newGame, alive, aliveIds, winner, needs, targets, act, wolfVictim, botNight, resolveNight, hunterShot, dayTalk, accuse, claim, botVotes, resolveVote, nextNight, actors, rng, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = WW;
  root.WW = WW;
})(typeof window !== 'undefined' ? window : globalThis);
