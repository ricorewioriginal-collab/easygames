/* Funkhaus – Spielregeln (rein, ohne Oberfläche): Bewohner, Beziehungen, Tagesaktionen, Wochenaufgabe, Nominierung, Hörervotum, Finale.
   Alles läuft über einen Zufallsgenerator mit Startwert → Partien sind nachspielbar und testbar. */
export const TRAIT_LIST = ['ehrgeizig', 'herzlich', 'intrigant', 'lustig', 'ruhig', 'chaot', 'ehrlich', 'eitel'];
export const ACTIONS = ['talk', 'cook', 'alliance', 'tease', 'secret', 'rumor', 'show', 'relax'];
export const PAIR = { talk: 1, cook: 1, alliance: 1, tease: 1, secret: 1, rumor: 1, show: 0, relax: 0 };
export const SLOTS = 3, DAYS = 3;
export const ROOM_OF = { talk: ['wohn', 'garten', 'kueche'], cook: ['kueche'], alliance: ['garten', 'wohn'], tease: ['wohn', 'kueche'], secret: ['schlaf', 'garten'], rumor: ['schlaf', 'kueche'], show: ['studio'], relax: ['garten', 'schlaf', 'wohn'] };
// Verträglichkeit der Eigenschaften (obere Dreiecksmatrix, Reihenfolge wie TRAIT_LIST)
const AFF = [[-2, 2, -1, 1, 0, -2, 2, -1], [0, 3, -1, 3, 3, 1, 3, 1], [0, 0, -3, -1, -1, -1, -4, -2], [0, 0, 0, 2, 1, 3, 1, 0], [0, 0, 0, 0, 2, -3, 2, -1], [0, 0, 0, 0, 0, -1, -1, -2], [0, 0, 0, 0, 0, 0, 2, -1], [0, 0, 0, 0, 0, 0, 0, -3]];
const aff = (a, b) => { const i = TRAIT_LIST.indexOf(a), j = TRAIT_LIST.indexOf(b); return i <= j ? AFF[i][j] : AFF[j][i]; };
export const compat = (A, B) => { let s = 0; for (const a of A) for (const b of B) s += aff(a, b); return s / 4; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** cast: [{n, traits:[a,b], ...}], humans: Indexe der menschlichen Bewohner (Reihenfolge = Spielerplatz) */
export function newGame({ cast, humans = [], seed = 1 }) {
  const rnd = rng(seed), n = cast.length;
  const res = cast.map((c, i) => ({ i, n: c.n, traits: c.traits, human: humans.indexOf(i), alive: true, pop: 50 + Math.round((rnd() - 0.5) * 16), mood: 55 + Math.round((rnd() - 0.5) * 20), sym: new Array(n).fill(0), immune: false, task: 0, buzz: 0, leftWeek: 0, rank: 0 }));
  for (const a of res) for (const b of res) if (a !== b) a.sym[b.i] = Math.round(compat(a.traits, b.traits) * 4 + (rnd() - 0.5) * 16);
  return { n, res, rnd, seed, week: 1, day: 0, phase: 'day', allies: [], out: [], log: [], size: n, nominees: [], winner: -1, secrets: [], lastTask: null, taskKind: 'reflex' };
}
export const alive = G => G.res.filter(r => r.alive);
const has = (r, t) => r.traits.includes(t);
const pick = (G, arr) => arr[Math.floor(G.rnd() * arr.length)];
const allyOf = (G, i) => G.allies.findIndex(g => g.includes(i));
export const isAlly = (G, a, b) => { const g = allyOf(G, a); return g >= 0 && G.allies[g].includes(b); };
const addSym = (G, i, j, d) => { const r = G.res[i]; r.sym[j] = clamp(r.sym[j] + d, -100, 100); };
const addPop = (G, i, d) => { const r = G.res[i]; const k = d > 0 ? 1 - r.pop / 140 : 0.4 + r.pop / 140; const v = d * k; r.pop = clamp(r.pop + v, 4, 96); r.buzz += v; };
const addMood = (G, i, d) => { const r = G.res[i]; r.mood = clamp(r.mood + d, 0, 100); };

// ---------------------------------------------------------------- KI-Entscheidungen
const WEIGHTS = { ehrgeizig: { show: 3, alliance: 3, talk: 1, rumor: 1 }, herzlich: { talk: 3, cook: 3, secret: 2, relax: 1 }, intrigant: { rumor: 3, alliance: 3, tease: 2, secret: 1 }, lustig: { show: 3, tease: 2, cook: 2, talk: 1 }, ruhig: { relax: 3, talk: 2, cook: 1, secret: 1 }, chaot: { tease: 3, rumor: 2, show: 2, relax: 1, talk: 1 }, ehrlich: { talk: 3, secret: 2, cook: 2, show: 1 }, eitel: { show: 4, relax: 2, alliance: 1, tease: 1 } };
export function aiPlan(G, i) {
  const me = G.res[i], plan = [], others = alive(G).filter(r => r.i !== i);
  for (let s = 0; s < SLOTS; s++) {
    const w = {}; ACTIONS.forEach(a => { w[a] = 0.6; }); me.traits.forEach(t => { for (const a in WEIGHTS[t]) w[a] += WEIGHTS[t][a]; });
    if (me.mood < 35) { w.relax += 2; w.tease += 1; } if (allyOf(G, i) < 0) w.alliance += 1.5; if (me.pop < 40) w.show += 2;
    if (others.length < 3) { w.alliance = 0; }
    let tot = 0; for (const a in w) tot += w[a]; let x = G.rnd() * tot, act = 'talk'; for (const a in w) { x -= w[a]; if (x <= 0) { act = a; break; } }
    let t = -1;
    if (PAIR[act]) {
      const neg = act === 'tease' || act === 'rumor'; let best = null, bs = -1e9;
      for (const o of others) { let sc = G.rnd() * 14; sc += neg ? -me.sym[o.i] * 0.6 + o.pop * 0.25 : me.sym[o.i] * 0.5; if (act === 'alliance' && isAlly(G, i, o.i)) sc -= 40; if (neg && isAlly(G, i, o.i)) sc -= 60; if (act === 'secret' && me.sym[o.i] < 5) sc -= 25; if (sc > bs) { bs = sc; best = o; } }
      t = best.i;
    }
    plan.push({ a: act, t });
  }
  return plan;
}

// ---------------------------------------------------------------- Tagesaktion
function chance(G, a, t, base, extra = 0) { const A = G.res[a], T = G.res[t]; return clamp(base + compat(A.traits, T.traits) * 0.025 + T.sym[a] * 0.003 + (A.mood - 50) * 0.002 + extra, 0.1, 0.92); }
function doAction(G, a, act, t) {
  const A = G.res[a], T = t >= 0 ? G.res[t] : null, rnd = G.rnd; const ev = { t: 'act', week: G.week, day: G.day, a, act, tgt: t, ok: true, room: pick(G, ROOM_OF[act]), hl: false };
  switch (act) {
    case 'talk': { const ok = rnd() < chance(G, a, t, 0.7, has(A, 'herzlich') || has(A, 'lustig') ? 0.08 : 0); ev.ok = ok; if (ok) { addSym(G, t, a, 6 + Math.floor(rnd() * 4) + (has(A, 'herzlich') ? 2 : 0)); addSym(G, a, t, 3); addMood(G, a, 2); addMood(G, t, 2); } else addSym(G, t, a, -4); break; }
    case 'cook': { const ok = rnd() < chance(G, a, t, 0.72, has(A, 'chaot') ? -0.15 : 0.05); ev.ok = ok; if (ok) { addSym(G, a, t, 5); addSym(G, t, a, 5); addMood(G, a, 6); addMood(G, t, 6); addPop(G, a, 1.5); } else { addMood(G, a, -5); addMood(G, t, -5); addSym(G, t, a, -2); } break; }
    case 'alliance': {
      const need = T.sym[a] >= 8 && !isAlly(G, a, t), ok = need && rnd() < chance(G, a, t, 0.55, has(A, 'ehrlich') ? 0.1 : 0) + 0.1; ev.ok = ok;
      if (ok) { const gA = allyOf(G, a), gT = allyOf(G, t); if (gT >= 0 && gA < 0 && G.allies[gT].length < 4) G.allies[gT].push(a); else if (gA >= 0 && gT < 0 && G.allies[gA].length < 4) G.allies[gA].push(t); else if (gA < 0 && gT < 0) G.allies.push([a, t]); else ev.ok = false; }
      if (ev.ok) { const g = G.allies[allyOf(G, a)]; for (const x of g) for (const y of g) if (x !== y) addSym(G, x, y, 6); ev.hl = true; } else addSym(G, t, a, -3);
      break; }
    case 'tease': { const ok = rnd() < chance(G, a, t, 0.65, has(A, 'lustig') || has(A, 'chaot') ? 0.1 : -0.05) ; ev.ok = ok; if (ok) { addSym(G, t, a, -10); addSym(G, a, t, -3); addMood(G, t, -6); addPop(G, a, has(A, 'lustig') || has(A, 'chaot') ? 1 : -2); ev.hl = true; } else { addSym(G, t, a, -4); addPop(G, a, -4); } break; }
    case 'secret': { const ok = T.sym[a] >= 5 && rnd() < chance(G, a, t, 0.75, has(A, 'ehrlich') ? 0.08 : 0); ev.ok = ok; if (ok) { addSym(G, t, a, 12); addSym(G, a, t, 12); if ((has(T, 'intrigant') || has(T, 'chaot')) && rnd() < 0.4) G.secrets.push({ from: a, by: t }); ev.hl = true; } else addSym(G, t, a, -2); break; }
    case 'rumor': { const fail = 0.32 + (has(A, 'ehrlich') ? 0.18 : 0) - (has(A, 'intrigant') ? 0.14 : 0), ok = rnd() >= fail; ev.ok = ok; ev.hl = true;
      if (ok) { addPop(G, t, -(5 + Math.floor(rnd() * 3))); const w = alive(G).filter(r => r.i !== a && r.i !== t); for (let k = 0; k < 3 && w.length; k++) { const o = w.splice(Math.floor(rnd() * w.length), 1)[0]; addSym(G, o.i, t, -5); } addSym(G, t, a, -3); }
      else { for (const o of alive(G)) if (o.i !== a) addSym(G, o.i, a, -8); addPop(G, a, -6); addSym(G, t, a, -12); }
      break; }
    case 'show': { const ok = rnd() < clamp(0.74 + (has(A, 'lustig') || has(A, 'eitel') ? 0.1 : 0) - (has(A, 'ruhig') ? 0.1 : 0) + (A.mood - 50) * 0.002, 0.2, 0.92); ev.ok = ok; if (ok) addPop(G, a, 4 + (has(A, 'lustig') || has(A, 'eitel') ? 1 : 0)); else addPop(G, a, -3); ev.hl = true; break; }
    case 'relax': { const ok = !(has(A, 'chaot') && rnd() < 0.3); ev.ok = ok; addMood(G, a, ok ? 10 : -3); break; }
  }
  return ev;
}

function randomEvent(G) {
  if (G.rnd() > 0.55) return null; const al = alive(G); if (al.length < 3) return null; const ids = ['party', 'fight', 'birthday', 'blackout', 'rain', 'gift', 'gossip', 'burnt', 'karaoke', 'insomnia'], id = pick(G, ids);
  const a = pick(G, al).i; let b = pick(G, al.filter(r => r.i !== a)).i; const ev = { t: 'event', week: G.week, day: G.day, id, a, b, room: { party: 'kueche', fight: 'wohn', birthday: 'wohn', blackout: 'wohn', rain: 'garten', gift: 'wohn', gossip: 'schlaf', burnt: 'kueche', karaoke: 'wohn', insomnia: 'schlaf' }[id] };
  switch (id) {
    case 'party': al.forEach(r => addMood(G, r.i, 8)); for (let k = 0; k < 3; k++) { const x = pick(G, al).i, y = pick(G, al).i; if (x !== y) { addSym(G, x, y, 3); addSym(G, y, x, 3); } } break;
    case 'fight': addSym(G, a, b, -10); addSym(G, b, a, -10); addPop(G, a, 1); addPop(G, b, 1); break;
    case 'birthday': addMood(G, a, 10); addPop(G, a, 2); al.forEach(r => { if (r.i !== a) addSym(G, r.i, a, 3); }); break;
    case 'blackout': al.forEach(r => addMood(G, r.i, -4)); for (let k = 0; k < 2; k++) { const x = pick(G, al).i, y = pick(G, al).i; if (x !== y) { addSym(G, x, y, 2); addSym(G, y, x, 2); } } break;
    case 'rain': al.forEach(r => addMood(G, r.i, -3)); break;
    case 'gift': al.forEach(r => { addMood(G, r.i, 6); addPop(G, r.i, 1); }); break;
    case 'gossip': addSym(G, a, b, -6); addPop(G, b, -1); break;
    case 'burnt': addMood(G, a, -5); break;
    case 'karaoke': addPop(G, a, 2); addPop(G, b, 2); al.forEach(r => addMood(G, r.i, 4)); break;
    case 'insomnia': addMood(G, a, -6); break;
  }
  return ev;
}

/** plans: { [bewohnerIndex]: [{a,t}] } für Menschen; alle anderen entscheidet die KI. Gibt die Ereignisse des Tages zurück. */
export function resolveDay(G, plans = {}) {
  const evs = [], al = alive(G), pl = {}; al.forEach(r => { pl[r.i] = plans[r.i] && plans[r.i].length ? plans[r.i].slice(0, SLOTS) : aiPlan(G, r.i); });
  for (let s = 0; s < SLOTS; s++) {
    const order = al.map(r => r.i).sort(() => G.rnd() - 0.5);
    for (const i of order) { const p = pl[i][s]; if (!p) continue; let t = p.t; if (PAIR[p.a] && (t < 0 || !G.res[t] || !G.res[t].alive || t === i)) t = pick(G, al.filter(r => r.i !== i)).i; evs.push(doAction(G, i, p.a, PAIR[p.a] ? t : -1)); }
  }
  // Klatsch aus Geheimnissen
  for (const sc of G.secrets.splice(0)) { if (!G.res[sc.by].alive || !G.res[sc.from].alive) continue; for (const o of alive(G)) if (o.i !== sc.from && o.i !== sc.by) addSym(G, o.i, sc.from, -5); addPop(G, sc.from, -3); evs.push({ t: 'leak', week: G.week, day: G.day, a: sc.from, by: sc.by, hl: true, room: 'schlaf' }); }
  const re = randomEvent(G); if (re) evs.push(re);
  // Tagesabschluss: Stimmung und Beliebtheit pendeln sich ein
  for (const r of al) { r.mood += (55 - r.mood) * 0.12; r.pop += (50 - r.pop) * 0.03 + (has(r, 'lustig') ? 0.3 : 0) + (has(r, 'herzlich') ? 0.3 : 0) + (has(r, 'ehrlich') ? 0.2 : 0) + (has(r, 'ehrgeizig') ? 0.25 : 0) + (has(r, 'ruhig') ? 0.1 : 0) - (has(r, 'intrigant') ? 0.1 : 0) - (has(r, 'eitel') ? 0.1 : 0); r.pop = clamp(r.pop, 4, 96); }
  G.day++; if (G.day >= DAYS) G.phase = G.finalWeek ? 'finalvote' : 'task';
  G.log.push(...evs); return evs;
}

// ---------------------------------------------------------------- Wochenaufgabe
export const TASKS = ['reflex', 'memory', 'guess'];
export const taskKind = G => TASKS[(G.week - 1) % 3];
function aiTaskScore(G, r) { const t = taskKind(G); let base = 50 + (r.mood - 50) * 0.2 + (has(r, 'ehrgeizig') ? 8 : 0); if (t === 'reflex') base += has(r, 'chaot') ? -6 : has(r, 'ruhig') ? 4 : 0; if (t === 'memory') base += has(r, 'ruhig') || has(r, 'ehrlich') ? 6 : has(r, 'chaot') ? -8 : 0; if (t === 'guess') base += has(r, 'lustig') ? 5 : has(r, 'eitel') ? -4 : 0; return clamp(base + (G.rnd() - 0.5) * 36, 5, 98); }
/** scores: { [bewohnerIndex]: 0..100 } der Menschen. */
export function resolveTask(G, scores = {}) {
  const al = alive(G), sc = al.map(r => ({ i: r.i, s: r.human >= 0 ? clamp(+scores[r.i] || 0, 0, 100) : aiTaskScore(G, r) })).sort((a, b) => b.s - a.s || a.i - b.i);
  al.forEach(r => { r.immune = false; }); const win = sc[0].i; G.res[win].immune = true; addPop(G, win, 3); addMood(G, win, 15); if (sc[1]) addMood(G, sc[1].i, 6); al.forEach(r => { if (r.i !== win) addMood(G, r.i, -2); });
  G.lastTask = { kind: taskKind(G), scores: sc, winner: win }; G.phase = 'nom'; return G.lastTask;
}

// ---------------------------------------------------------------- Nominierung
export const nomCandidates = (G, i) => alive(G).filter(r => r.i !== i && !r.immune).map(r => r.i);
export function aiNominate(G, i) {
  const me = G.res[i], c = nomCandidates(G, i), sc = c.map(j => { const o = G.res[j]; let s = -me.sym[j] * 0.9 + (G.rnd() - 0.5) * 22; if (isAlly(G, i, j)) s -= 60; if (has(me, 'intrigant')) s += o.pop * 0.25; if (has(me, 'ehrgeizig')) s += o.pop * 0.12; if (has(me, 'herzlich')) s -= 6; if (has(me, 'ehrlich')) s -= me.sym[j] * 0.2; return { j, s }; }).sort((a, b) => b.s - a.s);
  return sc.slice(0, 2).map(x => x.j);
}
/** picks: { [bewohnerIndex]: [erste, zweite] } der Menschen (2 und 1 Punkt). */
export function nominate(G, picks = {}) {
  const pts = {}, al = alive(G), cast = {}; al.forEach(r => { const c = nomCandidates(G, r.i); let p = (picks[r.i] || []).filter((x, k, a) => c.includes(x) && a.indexOf(x) === k); if (r.human < 0 || p.length < Math.min(2, c.length)) { const ai = aiNominate(G, r.i); p = [...p, ...ai.filter(x => !p.includes(x))].slice(0, Math.min(2, c.length)); } cast[r.i] = p; p.forEach((j, k) => { pts[j] = (pts[j] || 0) + (k === 0 ? 2 : 1); }); });
  const list = Object.keys(pts).map(Number).sort((a, b) => pts[b] - pts[a] || G.rnd() - 0.5); let nom = list.slice(0, 2); if (list[2] !== undefined && pts[list[2]] === pts[list[1]]) nom.push(list[2]);
  if (nom.length < 2) { const rest = al.filter(r => !nom.includes(r.i) && !r.immune); while (nom.length < 2 && rest.length) nom.push(rest.splice(Math.floor(G.rnd() * rest.length), 1)[0].i); }
  G.nominees = nom; G.nomVotes = cast; G.nomPoints = pts; G.phase = 'vote'; return { points: pts, nominees: nom, votes: cast };
}

// ---------------------------------------------------------------- Hörervotum
export const appeal = (G, i) => { const r = G.res[i]; return r.pop * 0.85 + (r.mood - 50) * 0.08; };
function pcts(G, ids) { const w = ids.map(i => { const a = appeal(G, i) + (G.rnd() - 0.5) * 14; return Math.exp((100 - a) / 14); }), tot = w.reduce((a, b) => a + b, 0); const p = w.map(x => Math.round((x / tot) * 100)); p[0] += 100 - p.reduce((a, b) => a + b, 0); return p; }
export function vote(G) {
  const ids = G.nominees.slice(), p = pcts(G, ids); let k = 0; p.forEach((v, j) => { if (v > p[k]) k = j; });   // wer die meisten „Raus"-Stimmen hat, geht
  const leaver = ids[k]; const r = { ids, pct: p, leaver }; leaveHouse(G, leaver); G.phase = 'day'; if (alive(G).length <= 3) { G.finalWeek = true; G.week++; G.day = 0; G.nominees = []; alive(G).forEach(x => { x.immune = false; x.buzz = 0; }); } else nextWeek(G); return r;
}
function leaveHouse(G, i) {
  const r = G.res[i]; r.alive = false; r.leftWeek = G.week; G.out.push(i); r.immune = false; G.allies = G.allies.map(g => g.filter(x => x !== i)).filter(g => g.length > 1);
  alive(G).forEach(o => { if (o.sym[i] > 25) addMood(G, o.i, -8); else if (o.sym[i] < -25) addMood(G, o.i, 4); });
}
function nextWeek(G) { G.week++; G.day = 0; G.nominees = []; alive(G).forEach(r => { r.immune = false; r.buzz = 0; }); }
/** Finale: unter den letzten drei entscheiden die Hörer. Gibt Reihenfolge Sieger → Dritter. */
export function finalVote(G) {   // Phase 'finalvote'
  const ids = alive(G).map(r => r.i), sc = ids.map(i => ({ i, a: appeal(G, i) + (G.rnd() - 0.5) * 12 + (G.res[i].immune ? 3 : 0) })).sort((a, b) => b.a - a.a), tot = sc.reduce((s, x) => s + Math.exp(x.a / 14), 0), pct = sc.map(x => Math.round((Math.exp(x.a / 14) / tot) * 100)); pct[0] += 100 - pct.reduce((a, b) => a + b, 0);
  G.winner = sc[0].i; sc.slice().reverse().forEach((x, k) => { G.res[x.i].rank = 3 - k; }); G.order = sc.map(x => x.i); G.out.push(sc[2].i, sc[1].i, sc[0].i); G.phase = 'end'; return { order: sc.map(x => x.i), pct };
}
/** Endplatzierung: 1 = Sieger */
export const finalRanking = G => (G.winner >= 0 ? [...G.order, ...G.out.slice(0, G.size - 3).reverse()] : []);
/** Vollständige KI-Staffel (für Tests): alle Bewohner KI */
export function playSeason(G, humanChoice) {
  let guard = 0;
  while (G.phase !== 'end' && guard++ < 400) {
    if (G.phase === 'day') resolveDay(G, humanChoice ? humanChoice(G) : {});
    else if (G.phase === 'task') resolveTask(G, {});
    else if (G.phase === 'nom') nominate(G, {});
    else if (G.phase === 'vote') vote(G);
    else if (G.phase === 'finalvote') finalVote(G);
  }
  return G;
}
// Beziehungs-Anzeige (für Oberfläche)
export const heart = v => (v >= 35 ? 4 : v >= 12 ? 3 : v > -12 ? 2 : v > -35 ? 1 : 0);   // 0 💔 … 4 😍
export const stars = p => Math.max(1, Math.min(5, Math.round(p / 20)));
