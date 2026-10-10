/* Mach mich aus! – Spielregeln (rein, ohne Oberfläche): Kandidat, 20 Funk-Pulte mit Lampen, Enthüllungsphasen, Entscheidungen, Wahl und Date.
   Alles mit Startwert nachspielbar. */
export const TAGS = ['humor', 'abenteuer', 'gemuetlich', 'sport', 'musik', 'essen', 'tiere', 'kreativ', 'ordnung', 'party', 'romantik', 'ehrgeiz'];
export const STYLES = ['sportlich', 'elegant', 'laessig', 'schraeg'];
export const PHASES = ['look', 'steck', 'talent', 'quiz'];
export const SEATS = 20, QN = 2;   // Pulte, Fragen pro Runde
const BASE = { look: 24, steck: 30, talent: 35, quiz: 40 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const shuffle = (rnd, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const inter = (a, b) => a.filter(x => b.includes(x)).length;

/** Wahre Passgenauigkeit Pult ↔ Kandidat (0–100) */
export function chemistry(pult, cand, funke = 0) {
  return clamp(Math.round(25 + 22 * inter(pult.likes, cand.likes) - 28 * inter(pult.nogos, cand.likes) - 10 * inter(cand.nogos, pult.likes) + (pult.styles.includes(cand.style) ? 12 : 0) + funke), 0, 100);
}
/** Schätzung mit dem, was bisher enthüllt wurde (für KI-Pulte und Tipps an Menschen) */
export function estimate(pult, rev) {
  let e = 25; if (rev.style) e += pult.styles.includes(rev.style) ? 12 : 0; else e += 6;
  const known = rev.likes; e += 22 * inter(pult.likes, known) - 28 * inter(pult.nogos, known); const unk = 3 - known.length; e += unk * (22 * 0.25 - 28 * 0.17);
  if (rev.nogos.length) e -= 10 * inter(rev.nogos, pult.likes); else e -= 2.5;
  return clamp(Math.round(e + (rev.talent || 0)), 0, 100);
}
const persona = (p, human = -1) => Object.assign({}, p, { human });

/** content: {CANDIDATES, PULTE, QUIZ}; humans: [{n, g, age, style, likes:[3], nogos:[2]}] */
export function newShow({ content, humans = [], seed = 1, rounds }) {
  const rnd = rng(seed), H = humans.map((h, i) => ({ i, p: { n: h.n, age: h.age || 25, g: h.g || 'd', style: h.style || 'laessig', likes: h.likes, nogos: h.nogos, styles: [h.style || 'laessig', STYLES[(i + 1) % 4]], job: 'Das bist du!', line: 'Ich bin gespannt!' }, score: 0, asCand: 0, cand: 0, pult: 0 }));
  const R = rounds || Math.min(6, H.length + 3), aiCands = shuffle(rnd, content.CANDIDATES), order = []; let ai = 0;
  for (let r = 0; r < R; r++) order.push(r < H.length ? { human: r } : { human: -1, cand: aiCands[ai++ % aiCands.length] });
  const seatOf = H.map((_, i) => Math.floor((i + 0.5) * SEATS / Math.max(1, H.length)) % SEATS);
  return { rnd, seed, content, H, rounds: R, order, round: -1, seatOf, R: null, phase: 'idle', done: false, history: [], quizOrder: shuffle(rnd, content.QUIZ.map((_, i) => i)), qi: 0 };
}
export function startRound(S) {
  S.round++; const o = S.order[S.round], rnd = S.rnd;
  const cand = o.human >= 0 ? persona(S.H[o.human].p, o.human) : persona(o.cand);
  const taken = new Set([cand.n]); const pool = shuffle(rnd, S.content.PULTE).filter(p => !taken.has(p.n)); let pi = 0;
  const seats = Array.from({ length: SEATS }, (_, k) => { const hi = S.seatOf.indexOf(k); if (hi >= 0 && hi !== o.human) { return { k, p: persona(S.H[hi].p, hi), human: hi, on: true, funke: Math.round((rnd() - 0.5) * 16), picky: 0, offPhase: null, hist: [] }; } const p = pool[pi++]; return { k, p: persona(p), human: -1, on: true, funke: Math.round((rnd() - 0.5) * 16), picky: Math.round(-6 + rnd() * 14), offPhase: null, hist: [] }; });
  seats.forEach(s => { s.chem = chemistry(s.p, cand, s.funke); });
  S.R = { cand, humanCand: o.human, seats, rev: { style: null, likes: [], nogos: [], talent: 0, claims: [] }, step: -1, jokerUsed: false, answers: [], pick: -1, date: null, points: {}, offs: 0 };
  S.phase = 'look'; return S.R;
}
export const lightsOn = S => S.R.seats.filter(s => s.on).length;
/** Enthüllung einer Phase. input: Menschlicher Kandidat → talent: 0..12; quiz: [antwort 0..2, …] */
export function reveal(S, phase, input) {
  const R = S.R, c = R.cand, rev = R.rev, rnd = S.rnd; R.step = PHASES.indexOf(phase); S.phase = phase;
  if (phase === 'look') rev.style = c.style;
  else if (phase === 'steck') rev.likes = c.likes.slice(0, 2);
  else if (phase === 'talent') rev.talent = R.humanCand >= 0 ? clamp(Math.round(input == null ? 6 : input), 0, 12) : Math.round(2 + rnd() * 10);
  else if (phase === 'quiz') {
    R.questions = []; for (let q = 0; q < QN; q++) { const qi = S.quizOrder[S.qi++ % S.quizOrder.length], Q = S.content.QUIZ[qi]; let a; if (R.humanCand >= 0) a = clamp((input && input[q]) | 0, 0, 2); else { const truth = Q.a.map((x, i) => i).filter(i => c.likes.includes(Q.a[i].tag)), hit = truth.length && rnd() < 0.8; a = hit ? truth[Math.floor(rnd() * truth.length)] : Math.floor(rnd() * 3); } R.questions.push({ qi, a, tag: Q.a[a].tag }); R.answers.push(Q.a[a].tag); }
    for (const t of R.answers) if (!rev.claims.includes(t)) rev.claims.push(t);
    // gezeigte Neigungen: Steckbrief + Antworten (auch geflunkerte), Nogo: erster echter Nogo kommt heraus
    for (const t of rev.claims) if (!rev.likes.includes(t) && !c.nogos.includes(t)) rev.likes.push(t); rev.likes = rev.likes.slice(0, 3); rev.nogos = [c.nogos[0]];
  }
  return { phase, rev: JSON.parse(JSON.stringify(rev)), questions: R.questions };
}
/** Entscheidungsrunde nach einer Enthüllung. humanChoices: { sitzNr: true=an|false=aus } für menschliche Pulte. Gibt die ausgehenden Lampen in Reihenfolge zurück. */
export function decide(S, phase, humanChoices = {}) {
  const R = S.R, rnd = S.rnd, offs = [], rev = R.rev; const thr = BASE[phase];
  for (const s of shuffle(rnd, R.seats.filter(x => x.on))) {
    let off; const est = estimate(s.p, rev);
    if (s.human >= 0) off = humanChoices[s.k] === false;
    else { off = est < thr + s.picky; if (rnd() < 0.05) off = !off; if (est >= 62 && rnd() < 0.85) off = false; }
    const q = s.chem >= 55 ? (off ? -3 : 3) : s.chem >= 35 ? (off ? 0 : 1) : (off ? 3 : -2);   // Beobachtungs-Punkte
    s.hist.push({ phase, off, est, q }); if (off) { s.on = false; s.offPhase = phase; offs.push({ k: s.k, est, human: s.human }); R.offs++; }
  }
  return { off: offs, on: lightsOn(S) };
}
/** Anmach-Joker: eine ausgeschaltete Lampe wieder anmachen (einmal je Runde) */
export function joker(S, k) { const R = S.R, s = R.seats[k]; if (R.jokerUsed || !s || s.on) return false; s.on = true; s.back = true; R.jokerUsed = true; return true; }
export function aiJoker(S) { const R = S.R; if (R.jokerUsed || lightsOn(S) > 2) return -1; const off = R.seats.filter(s => !s.on && s.human < 0).sort((a, b) => estimate(b.p, R.rev) - estimate(a.p, R.rev)); if (!off.length || S.rnd() < 0.35) return -1; joker(S, off[0].k); return off[0].k; }
/** Kandidat wählt Sitz k (oder -1 = geht allein). Gibt das Date-Ergebnis zurück. */
export function choose(S, k) {
  const R = S.R, c = R.cand, rnd = S.rnd; R.pick = k;
  if (k < 0 || !R.seats[k] || !R.seats[k].on) { R.date = { none: true, blackout: lightsOn(S) === 0 }; S.phase = 'date'; return R.date; }
  const s = R.seats[k]; let bluff = 0; for (const t of R.rev.claims) if (!c.likes.includes(t) && s.p.likes.includes(t)) bluff++;
  const chem = clamp(s.chem - 12 * bluff, 0, 100); R.date = { k, chem, bluff, bucket: Math.min(4, Math.floor(chem / 20.01)), seat: s.p.n, on: lightsOn(S) }; S.phase = 'date'; return R.date;
}
export function aiChoose(S) { const R = S.R, on = R.seats.filter(s => s.on); if (!on.length) return -1; const sc = on.map(s => ({ k: s.k, v: s.chem + (rnd2(S) - 0.5) * 18 })).sort((a, b) => b.v - a.v)[0]; if (on.length === 1 && sc.v < 38) return -1; return sc.k; }
const rnd2 = S => S.rnd();
/** Punkte der Runde für Menschen; schreibt in S.H */
export function scoreRound(S) {
  const R = S.R, d = R.date, out = {};
  S.H.forEach(h => {
    let pts = 0, role;
    if (R.humanCand === h.i) { role = 'cand'; pts = d && !d.none ? Math.round(d.chem * 0.7 + lightsOn(S) * 1.5) : 8; h.asCand++; }
    else { role = 'pult'; const seat = R.seats[S.seatOf[h.i]]; pts = seat.hist.reduce((a, x) => a + x.q * 3, 0); if (d && !d.none && d.k === seat.k) pts += d.chem >= 55 ? 40 : 12; h.pult++; }
    h.score += pts; out[h.i] = { role, pts };
  });
  R.points = out; S.history.push({ cand: R.cand.n, date: d, points: out }); return out;
}
export function nextRound(S) { if (S.round + 1 >= S.rounds) { S.done = true; S.phase = 'end'; return false; } startRound(S); return true; }
export const ranking = S => S.H.map(h => h.i).sort((a, b) => S.H[b].score - S.H[a].score || a - b);
/** komplette KI-Runde (für Tests); humanPolicy: optional {decide(k, est), …} */
export function autoRound(S, opt = {}) {
  startRound(S); const R = S.R, trace = [];
  for (const ph of PHASES) { reveal(S, ph, ph === 'talent' ? 6 : [0, 0]); const hc = {}; R.seats.forEach(s => { if (s.human >= 0) hc[s.k] = opt.humanOn ? true : estimate(s.p, R.rev) >= BASE[ph]; }); const d = decide(S, ph, hc); trace.push(d.on); }
  aiJoker(S); const k = R.humanCand >= 0 ? aiChoose(S) : aiChoose(S); choose(S, k); scoreRound(S); return { trace, date: R.date };
}
