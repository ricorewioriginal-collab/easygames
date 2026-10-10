/* Hörerwahl – Spielablauf als reine Zustandsmaschine (ohne DOM). Die Oberfläche ruft Methoden auf und zeigt die zurückgegebenen Ereignisse.
   Phasen: idle → faceoff → choose → play → steal → roundEnd → (nächste Runde) → matchEnd → finale → finaleEnd */
import { makeMatcher } from './matcher.js';
export const STRIKES = 3, FINALE_Q = 5, FINALE_GOAL = 100;
export const SKILL = { easy: 0.4, normal: 0.62, hard: 0.82 };
export const multFor = (round, total) => (total < 2 ? 1 : round === total - 1 ? (total >= 3 ? 3 : 2) : round === total - 2 && total >= 4 ? 2 : 1);
const MISS_TEXTS = ['Ähm …', 'Keine Ahnung', 'Hmm, schwierig', 'Vielleicht Banane?', 'Äh, Pizza?', 'Da muss ich passen'];

export class Match {
  constructor(opt, questions, rng) {
    this.rng = rng || Math.random; this.opt = Object.assign({ teams: ['Team Antenne', 'Team Frequenz'], solo: false, diff: 'normal', rounds: 4, finale: true }, opt);
    this.teams = this.opt.teams.map(name => ({ name, score: 0 })); this.solo = !!this.opt.solo; this.total = this.opt.rounds; this.round = -1; this.phase = 'idle';
    this.pool = this.shuffle(questions.slice()); this.used = 0; this.lastCat = ''; this.finale = null;
  }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  draw() { // nächste Frage, möglichst andere Kategorie als zuvor
    if (this.used >= this.pool.length) this.used = 0; let k = this.used; for (let i = this.used; i < Math.min(this.pool.length, this.used + 6); i++) if (this.pool[i].cat !== this.lastCat) { k = i; break; }
    [this.pool[this.used], this.pool[k]] = [this.pool[k], this.pool[this.used]]; const q = this.pool[this.used++]; this.lastCat = q.cat; return q;
  }
  other(t) { return 1 - t; }
  get isCpu() { return this.solo && this.turn === 1 && ['faceoff', 'play', 'steal'].includes(this.phase); }
  // ---------------------------------------------------------------- Runde
  startRound() {
    this.round++; this.q = this.draw(); this.board = this.q.a.map(a => ({ t: a.t, p: a.p, shown: false })); this.matcher = makeMatcher(this.q.a); this.bank = 0; this.strikes = 0; this.mult = multFor(this.round, this.total);
    this.first = this.round % 2; this.turn = this.first; this.control = null; this.fo = { step: 0, res: [null, null], retries: 0 }; this.phase = 'faceoff'; this.rest = [];
    return { type: 'round', round: this.round, total: this.total, mult: this.mult, q: this.q.q, cat: this.q.cat, count: this.board.length, first: this.first };
  }
  reveal(idx) { this.board[idx].shown = true; return this.board[idx].p; }
  judge(text) { if (!String(text || '').trim()) return { idx: -1, dup: false, empty: true }; const r = this.matcher(text); if (!r) return { idx: -1, dup: false }; return this.board[r.idx].shown ? { idx: -1, dup: true, again: r.idx } : { idx: r.idx, dup: false }; }
  submit(text) {
    if (this.phase === 'faceoff') return this.faceoffAnswer(text);
    if (this.phase === 'play') return this.playAnswer(text);
    if (this.phase === 'steal') return this.stealAnswer(text);
    return { type: 'ignored' };
  }
  faceoffAnswer(text) {
    const t = this.turn, j = this.judge(text), pts = j.idx >= 0 ? this.reveal(j.idx) : 0; if (j.idx >= 0) this.bank += pts; this.fo.res[t] = { idx: j.idx, pts }; const out = { type: 'faceoff-answer', team: t, text, idx: j.idx, pts, dup: j.dup, again: j.again };
    const done = team => { this.control = team; this.phase = 'choose'; this.turn = team; out.winner = team; };
    if (j.idx === 0) { done(t); return out; }
    if (this.fo.step === 0) { this.fo.step = 1; this.turn = this.other(t); out.next = this.turn; return out; }
    const [a, b] = [this.fo.res[this.first], this.fo.res[this.other(this.first)]];
    if (a.pts === b.pts) {   // beide daneben: eine Zusatzrunde, danach entscheidet das Los
      if (this.fo.retries < 1 && !(a.pts > 0)) { this.fo.retries++; this.fo.step = 0; this.fo.res = [null, null]; this.turn = this.first; out.retry = true; out.next = this.turn; return out; }
      done(this.rng() < 0.5 ? 0 : 1); out.coin = true; return out;
    }
    done(a.pts > b.pts ? this.first : this.other(this.first)); return out;
  }
  choose(play) { if (this.phase !== 'choose') return { type: 'ignored' }; if (!play) this.control = this.other(this.control); this.turn = this.control; this.phase = 'play'; this.strikes = 0; return { type: 'choice', team: this.turn, played: !!play }; }
  playAnswer(text) {
    const t = this.turn, j = this.judge(text); if (j.dup) return { type: 'play-answer', team: t, text, idx: -1, dup: true, again: j.again, strikes: this.strikes };
    if (j.idx >= 0) { const pts = this.reveal(j.idx); this.bank += pts; const out = { type: 'play-answer', team: t, text, idx: j.idx, pts, strikes: this.strikes }; if (this.board.every(b => b.shown)) Object.assign(out, this.endRound(t)); return out; }
    this.strikes++; const out = { type: 'play-answer', team: t, text, idx: -1, strikes: this.strikes };
    if (this.strikes >= STRIKES) { this.phase = 'steal'; this.turn = this.other(t); out.steal = this.turn; } return out;
  }
  stealAnswer(text) {
    const t = this.turn, j = this.judge(text), ctl = this.control; let pts = 0; const hit = j.idx >= 0; if (hit) { pts = this.reveal(j.idx); this.bank += pts; }
    const out = { type: 'steal-answer', team: t, text, idx: j.idx, pts, hit, dup: j.dup, again: j.again }; return Object.assign(out, this.endRound(hit ? t : ctl));
  }
  endRound(winner) {
    const gained = this.bank * this.mult; this.teams[winner].score += gained; this.rest = this.board.map((b, i) => i).filter(i => !this.board[i].shown); this.phase = 'roundEnd';
    return { roundEnd: true, winner, gained, bank: this.bank, mult: this.mult, rest: this.rest.slice(), scores: this.teams.map(t => t.score) };
  }
  next() {
    if (this.phase !== 'roundEnd') return { type: 'ignored' };
    if (this.round + 1 < this.total) return this.startRound();
    this.phase = 'matchEnd'; const [a, b] = [this.teams[0].score, this.teams[1].score]; const winner = a === b ? null : a > b ? 0 : 1; return { type: 'match-end', winner, scores: [a, b], finale: this.opt.finale && winner !== null };
  }
  // ---------------------------------------------------------------- Computergegner
  cpuText() {
    const skill = SKILL[this.opt.diff] || SKILL.normal, open = this.board.map((b, i) => i).filter(i => !this.board[i].shown); if (!open.length) return MISS_TEXTS[0];
    const maxP = Math.max(...this.board.map(b => b.p)), topOpen = Math.max(...open.map(i => this.board[i].p)), know = skill * (0.45 + 0.55 * topOpen / maxP);
    if (this.rng() > know) return MISS_TEXTS[Math.floor(this.rng() * MISS_TEXTS.length)];
    let sum = open.reduce((s, i) => s + this.board[i].p, 0), r = this.rng() * sum; for (const i of open) { r -= this.board[i].p; if (r <= 0) return this.board[i].t; } return this.board[open[0]].t;
  }
  cpuChoosesPlay() { return this.opt.diff === 'easy' ? this.rng() < 0.5 : true; }
  // ---------------------------------------------------------------- Finale: 5 Fragen, je eine Antwort, Ziel 100 Punkte
  startFinale(team) {
    const qs = []; for (let i = 0; i < FINALE_Q; i++) qs.push(this.draw()); this.finale = { team, qs, i: 0, total: 0, results: [] }; this.phase = 'finale';
    return { type: 'finale', team, goal: FINALE_GOAL, count: FINALE_Q, q: qs[0].q, cat: qs[0].cat };
  }
  finaleAnswer(text) {
    const f = this.finale, q = f.qs[f.i], r = String(text || '').trim() ? makeMatcher(q.a)(text) : null, pts = r ? q.a[r.idx].p : 0; f.total += pts;
    f.results.push({ text, idx: r ? r.idx : -1, pts, best: q.a[0].t, answer: r ? q.a[r.idx].t : null }); f.i++;
    const out = { type: 'finale-answer', idx: r ? r.idx : -1, pts, total: f.total, answerText: r ? q.a[r.idx].t : null, best: q.a[0].t, top: q.a.slice(0, 3).map(a => `${a.t} (${a.p})`) };
    if (f.i >= f.qs.length) { this.phase = 'finaleEnd'; out.done = true; out.won = f.total >= FINALE_GOAL; } else { out.next = { q: f.qs[f.i].q, cat: f.qs[f.i].cat }; }
    return out;
  }
}
