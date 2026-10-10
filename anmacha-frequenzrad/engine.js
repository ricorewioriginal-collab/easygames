/* Frequenzrad – Spielablauf als reine Zustandsmaschine (ohne DOM).
   Phasen: spin → consonant | vowelFree → choose → vowel → … → roundEnd → gameEnd */
export const COLS = 13, ROWS = 4, VOWEL_COST = 250, SOLVE_BONUS = 500;
export const VOWELS = new Set([...'AEIOUÄÖÜ']), LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'];
export const CONS_ORDER = [...'NSRTDHLCGMBWFKZPVJXQY'];
export const SEGMENTS = [200, 'bank', 300, 150, 'skip', 500, 250, 'free', 400, 100, 'bank', 350, 600, 200, 'skip', 450, 800, 300, 'bank', 'free', 500, 900, 250, 700].map(s => typeof s === 'number' ? { t: 'val', v: s } : { t: s });
export const SKILL = { easy: 0.35, normal: 0.6, hard: 0.85 };
const isLetter = ch => /[A-ZÄÖÜ]/.test(ch);
/** Ersetzt Umlaute/ß, entfernt alles außer Buchstaben (für den Lösungsvergleich). */
export const normSolve = s => String(s == null ? '' : s).toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS').replace(/[^A-Z]/g, '');
function lev(a, b, max) { if (a === b) return 0; if (Math.abs(a.length - b.length) > max) return max + 1; let prev = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const cur = [i]; let m = i; for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < m) m = v; } if (m > max) return max + 1; prev = cur; } return prev[b.length]; }
/** Lösung richtig? Kleine Tippfehler werden bei längeren Sätzen verziehen (1 Fehler ab 14, 2 ab 28 Buchstaben). */
export function isSolution(input, puzzle) { const a = normSolve(input), b = normSolve(puzzle); if (!a) return false; const tol = b.length >= 28 ? 2 : b.length >= 14 ? 1 : 0; return lev(a, b, tol) <= tol; }
/** Tafel-Layout: Zeilen (max. COLS Zeichen, Wörter bleiben ganz), zentriert → Liste {ch, row, col}. */
export function layout(text) {
  const lines = ['']; for (const w of text.split(' ')) { const cur = lines[lines.length - 1]; if (!cur) lines[lines.length - 1] = w; else if ((cur + ' ' + w).length <= COLS) lines[lines.length - 1] = cur + ' ' + w; else lines.push(w); }
  if (lines.length > ROWS || lines.some(l => l.length > COLS)) return null; const r0 = Math.floor((ROWS - lines.length) / 2), cells = [];
  lines.forEach((l, r) => { const c0 = Math.floor((COLS - l.length) / 2); [...l].forEach((ch, i) => { if (ch !== ' ') cells.push({ ch, row: r0 + r, col: c0 + i }); }); }); return cells;
}

export class Game {
  constructor(opt, puzzles, rng) {
    this.rng = rng || Math.random; this.opt = Object.assign({ players: [{ name: 'Spieler 1' }, { name: 'Spieler 2' }], rounds: 3, diff: 'normal' }, opt);
    this.players = this.opt.players.map(p => ({ name: p.name, cpu: !!p.cpu, total: 0, round: 0 })); this.n = this.players.length; this.total = this.opt.rounds; this.round = -1; this.starter = this.n - 1; this.phase = 'idle';
    this.pool = puzzles.filter(p => layout(p.t)).sort(() => this.rng() - 0.5); this.used = 0; this.lastCat = ''; this.val = 0;
  }
  draw() { if (this.used >= this.pool.length) this.used = 0; let k = this.used; for (let i = this.used; i < Math.min(this.pool.length, this.used + 6); i++) if (this.pool[i].cat !== this.lastCat) { k = i; break; } [this.pool[this.used], this.pool[k]] = [this.pool[k], this.pool[this.used]]; const p = this.pool[this.used++]; this.lastCat = p.cat; return p; }
  get cur() { return this.players[this.turn]; }
  get isCpu() { return this.phase !== 'roundEnd' && this.phase !== 'gameEnd' && this.phase !== 'idle' && this.cur.cpu; }
  letterSet() { return new Set(this.puzzle.t.replace(/[^A-ZÄÖÜ]/g, '')); }
  left(pred) { return [...this.letterSet()].filter(ch => !this.rev.has(ch) && pred(ch)); }
  get consLeft() { return this.left(ch => !VOWELS.has(ch)); }
  get vowelsLeft() { return this.left(ch => VOWELS.has(ch)); }
  get solved() { return this.left(() => true).length === 0; }
  get ratio() { const all = [...this.puzzle.t].filter(isLetter), open = all.filter(ch => !this.rev.has(ch)); return 1 - open.length / all.length; }
  startRound() {
    this.round++; this.puzzle = this.draw(); this.cells = layout(this.puzzle.t); this.rev = new Set(); this.players.forEach(p => { p.round = 0; }); this.starter = (this.starter + 1) % this.n; this.turn = this.starter; this.phase = 'spin'; this.val = 0;
    return { type: 'round', round: this.round, total: this.total, cat: this.puzzle.cat, cells: this.cells.map(c => ({ row: c.row, col: c.col })), starter: this.turn };
  }
  passTurn() { this.turn = (this.turn + 1) % this.n; this.phase = 'spin'; this.val = 0; }
  spin() {
    if (this.phase !== 'spin' && this.phase !== 'choose') return { type: 'ignored' };
    const idx = Math.floor(this.rng() * SEGMENTS.length), seg = SEGMENTS[idx], t = this.turn, out = { type: 'spin', idx, seg, player: t };
    if (seg.t === 'bank') { this.cur.round = 0; this.passTurn(); out.next = this.turn; }
    else if (seg.t === 'skip') { this.passTurn(); out.next = this.turn; }
    else if (seg.t === 'free') { if (this.vowelsLeft.length) this.phase = 'vowelFree'; else { this.phase = 'spin'; out.again = true; } }
    else { this.val = seg.v; this.phase = this.consLeft.length ? 'consonant' : 'choose'; if (this.phase === 'choose') out.noCons = true; }
    return out;
  }
  guess(ch) {
    ch = String(ch || '').toUpperCase(); const ph = this.phase; if (!['consonant', 'vowelFree', 'vowel'].includes(ph) || !LETTERS.includes(ch)) return { type: 'ignored' };
    const isV = VOWELS.has(ch); if (ph === 'consonant' && isV) return { type: 'invalid', ch, why: 'Hier ist ein Konsonant gefragt.' }; if (ph !== 'consonant' && !isV) return { type: 'invalid', ch, why: 'Hier ist ein Vokal gefragt.' };
    if (this.rev.has(ch)) return { type: 'dup', ch };
    const n = this.puzzle.t.split('').filter(c => c === ch).length, t = this.turn; if (ph === 'vowel') this.cur.round -= VOWEL_COST; this.rev.add(ch);
    if (!n) { this.passTurn(); return { type: 'miss', ch, player: t, next: this.turn, vowel: isV }; }
    const gain = ph === 'consonant' ? this.val * n : 0; this.cur.round += gain; const out = { type: 'hit', ch, n, gain, player: t, free: ph === 'vowelFree', bought: ph === 'vowel' };
    if (this.solved) Object.assign(out, this.endRound(t)); else { this.phase = 'choose'; this.val = 0; } return out;
  }
  buyVowel() { if (this.phase !== 'choose' || this.cur.round < VOWEL_COST || !this.vowelsLeft.length) return { type: 'ignored' }; this.phase = 'vowel'; return { type: 'buy', player: this.turn }; }
  canBuy() { return this.phase === 'choose' && this.cur.round >= VOWEL_COST && this.vowelsLeft.length > 0; }
  solve(text) {
    if (this.phase !== 'spin' && this.phase !== 'choose') return { type: 'ignored' }; const t = this.turn;
    if (isSolution(text, this.puzzle.t)) return Object.assign({ type: 'solve', ok: true, player: t, text }, this.endRound(t, true));
    this.passTurn(); return { type: 'solve', ok: false, player: t, text, next: this.turn };
  }
  endRound(winner, byGuess) {
    this.puzzle.t.split('').forEach(ch => { if (isLetter(ch)) this.rev.add(ch); }); const gained = this.players[winner].round + SOLVE_BONUS; this.players[winner].total += gained; this.players.forEach((p, i) => { if (i !== winner) p.round = 0; });
    const out = { roundEnd: true, winner, gained, bonus: SOLVE_BONUS, answer: this.puzzle.t, totals: this.players.map(p => p.total) }; this.players[winner].round = 0; this.phase = 'roundEnd'; this.turn = winner; return out;
  }
  next() {
    if (this.phase !== 'roundEnd') return { type: 'ignored' };
    if (this.round + 1 < this.total) return this.startRound();
    this.phase = 'gameEnd'; const max = Math.max(...this.players.map(p => p.total)); return { type: 'game-end', winners: this.players.map((p, i) => i).filter(i => this.players[i].total === max), totals: this.players.map(p => p.total) };
  }
  // ---------------------------------------------------------------- Computergegner
  cpuAction() {
    const skill = SKILL[this.opt.diff] || SKILL.normal, ph = this.phase, r = () => this.rng();
    const pickCons = () => { const left = this.consLeft, present = left; // Wissensvorsprung: manchmal einen Buchstaben, der wirklich vorkommt
      const all = CONS_ORDER.filter(c => !this.rev.has(c)); if (!all.length) return left[0]; if (r() < skill * 0.3 && left.length) return left[Math.floor(r() * left.length)]; const k = Math.min(all.length - 1, Math.floor(r() * (1 + (1 - skill) * 5))); return all[k]; };
    const pickVowel = () => { const order = [...'EAIOUÄÖÜ'].filter(v => !this.rev.has(v)); if (r() < skill * 0.4 && this.vowelsLeft.length) return this.vowelsLeft[0]; return order[Math.min(order.length - 1, Math.floor(r() * (1 + (1 - skill) * 3)))]; };
    if (ph === 'consonant') return { type: 'letter', ch: pickCons() }; if (ph === 'vowelFree' || ph === 'vowel') return { type: 'letter', ch: pickVowel() };
    const ready = this.ratio >= (skill >= 0.8 ? 0.55 : skill >= 0.5 ? 0.68 : 0.82) && r() < 0.5 + skill * 0.5;
    if (ready) { const wrong = r() > 0.55 + skill * 0.4; return { type: 'solve', text: wrong ? this.puzzle.t.slice(0, -3) + 'XYZ' : this.puzzle.t }; }
    if (ph === 'choose' && this.canBuy() && (this.consLeft.length <= 2 || r() < 0.3 * skill)) return { type: 'buy' };
    return { type: 'spin' };
  }
}
