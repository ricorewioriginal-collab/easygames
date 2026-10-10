/* Preisradar – Spielablauf und Wertung als reine Logik (ohne DOM).
   Runden: bid (Gebotsduell), dial (Frequenz-Skala), hilo (Teurer oder billiger?), cart (Einkaufswagen), final (Preisfinale). */
export const KINDS = ['bid', 'dial', 'hilo', 'cart'];
export const CART_TIME = 45, CART_ITEMS = 8;
export const SKILL = { easy: 0.3, normal: 0.55, hard: 0.8 };
const cents = x => Math.round(x * 100) / 100;
export const sum = items => cents(items.reduce((a, i) => a + i.p, 0));

// ---------------------------------------------------------------- Wertung
/** Gebotsduell/Finale: am nächsten dran ohne drüber = win Punkte; ist jeder drüber, bekommt der Nächste `consolation`. answers: [Zahl|null]. */
export function bidScore(answers, price, win = 3, consolation = 1) {
  const pts = answers.map(() => 0), valid = answers.map((a, i) => ({ a, i })).filter(x => typeof x.a === 'number' && isFinite(x.a) && x.a >= 0);
  const under = valid.filter(x => x.a <= price + 1e-9); if (under.length) { const best = Math.max(...under.map(x => x.a)); under.filter(x => x.a === best).forEach(x => { pts[x.i] = win; }); return pts; }
  if (valid.length) { const best = Math.min(...valid.map(x => x.a)); valid.filter(x => x.a === best).forEach(x => { pts[x.i] = consolation; }); } return pts;
}
export function dialScore(guess, price) { if (typeof guess !== 'number' || !isFinite(guess)) return 0; const rel = Math.abs(guess - price) / price; return rel <= 0.02 ? 5 : rel <= 0.05 ? 4 : rel <= 0.1 ? 3 : rel <= 0.2 ? 2 : rel <= 0.35 ? 1 : 0; }
export const hiloTruth = items => items.slice(1).map((it, i) => it.p > items[i].p);
export function hiloScore(choices, items) { const t = hiloTruth(items); if (!Array.isArray(choices)) return 0; const ok = t.filter((v, i) => choices[i] === v).length; return ok + (ok === t.length ? 1 : 0); }
export function cartScore(total, target) { if (typeof total !== 'number' || total > target + 1e-9 || total <= 0) return 0; const d = cents(target - total); return d <= 0.5 ? 5 : d <= 2 ? 3 : d <= 5 ? 2 : d <= Math.max(8, target * 0.2) ? 1 : 0; }

// ---------------------------------------------------------------- Runden bauen
const niceStep = p => (p < 5 ? 0.5 : p < 20 ? 1 : p < 100 ? 5 : p < 500 ? 25 : p < 3000 ? 100 : p < 20000 ? 500 : 2500);
const floorTo = (x, s) => Math.max(0, Math.floor(x / s) * s), ceilTo = (x, s) => Math.ceil(x / s) * s;
function sample(arr, n, rng) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }
export function buildRound(kind, products, rng, used = new Set()) {
  const fresh = products.filter(p => !used.has(p.n)), pool = fresh.length >= 12 ? fresh : products;
  if (kind === 'bid') { const item = sample(pool, 1, rng)[0]; return { kind, items: [item], price: item.p }; }
  if (kind === 'dial') { const item = sample(pool.filter(p => p.p >= 3), 1, rng)[0] || sample(pool, 1, rng)[0], s = niceStep(item.p); let min = floorTo(item.p * (0.3 + rng() * 0.35), s), max = ceilTo(item.p * (1.7 + rng() * 1.0), s); if (max <= min) max = min + s * 4; return { kind, items: [item], price: item.p, min, max, step: s >= 1 ? 1 : 0.1 }; }
  if (kind === 'hilo') { for (let t = 0; t < 60; t++) { const it = sample(pool, 4, rng); let ok = true; for (let i = 1; i < 4; i++) if (Math.max(it[i].p, it[i - 1].p) / Math.min(it[i].p, it[i - 1].p) < 1.2) ok = false; if (ok) return { kind, items: it }; } return { kind, items: sample(pool, 4, rng) }; }
  if (kind === 'cart') {
    const cheap = products.filter(p => p.p <= 16), base = cheap.filter(p => !used.has(p.n)).length >= 12 ? cheap.filter(p => !used.has(p.n)) : cheap;
    for (let t = 0; t < 200; t++) { const items = sample(base, CART_ITEMS, rng), k = 3 + Math.floor(rng() * 3), subset = sample(items, k, rng), target = sum(subset); if (target >= 14 && target <= 55) return { kind, items, target, time: CART_TIME, solution: items.map(i => subset.includes(i)) }; }
    const items = sample(base, CART_ITEMS, rng), subset = items.slice(0, 3); return { kind, items, target: sum(subset), time: CART_TIME, solution: items.map(i => subset.includes(i)) };
  }
  const items = sample(pool.filter(p => p.p >= 5), 3, rng); return { kind: 'final', items, price: sum(items) };
}
/** Was die Spieler vor dem Aufdecken sehen dürfen (kein Preis, keine Lösung; beim Höher/Tiefer nur der erste Preis, beim Einkaufswagen alle Preise). */
export function publicSpec(spec) {
  const s = Object.assign({}, spec); delete s.solution; delete s.price; const strip = it => ({ n: it.n, e: it.e, c: it.c, u: it.u });
  if (s.kind === 'hilo') s.items = s.items.map((it, i) => (i === 0 ? it : strip(it))); else if (s.kind !== 'cart') s.items = s.items.map(strip); return s;
}

export class Show {
  constructor(opt, products, rng) {
    this.rng = rng || Math.random; this.opt = Object.assign({ players: [{ name: 'Spieler 1' }, { name: 'Spieler 2' }], length: 4, diff: 'normal' }, opt); this.products = products;
    this.players = this.opt.players.map(p => ({ name: p.name, cpu: !!p.cpu, total: 0 })); this.n = this.players.length; this.used = new Set();
    this.plan = []; for (let i = 0; i < this.opt.length; i++) this.plan.push(KINDS[i % KINDS.length]); this.plan.push('final');
    this.index = -1; this.phase = 'idle'; this.answers = []; this.spec = null;
  }
  get total() { return this.plan.length; }
  startRound() {
    this.index++; const kind = this.plan[this.index]; this.spec = buildRound(kind, this.products, this.rng, this.used); this.spec.items.forEach(i => this.used.add(i.n)); this.answers = this.players.map(() => undefined); this.phase = 'collect';
    return { type: 'round', index: this.index, total: this.total, kind: this.spec.kind, spec: publicSpec(this.spec) };
  }
  /** Antwort eines Spielers (ungültig → false). Nur einmal pro Runde. */
  submit(slot, ans) {
    if (this.phase !== 'collect' || slot < 0 || slot >= this.n || this.answers[slot] !== undefined) return false; const v = this.clean(ans); if (v === undefined) return false; this.answers[slot] = v; return true;
  }
  clean(a) {
    const k = this.spec.kind;
    if (k === 'bid' || k === 'final') { const x = typeof a === 'string' ? parseFloat(a.replace(',', '.').replace(/[^0-9.]/g, '')) : a; return typeof x === 'number' && isFinite(x) && x >= 0 && x < 1e7 ? cents(x) : undefined; }
    if (k === 'dial') { const x = +a; return isFinite(x) ? cents(Math.min(this.spec.max, Math.max(this.spec.min, x))) : undefined; }
    if (k === 'hilo') return Array.isArray(a) && a.length === 3 && a.every(v => typeof v === 'boolean') ? a.slice() : undefined;
    if (k === 'cart') { if (!Array.isArray(a)) return undefined; const idx = [...new Set(a.filter(i => Number.isInteger(i) && i >= 0 && i < this.spec.items.length))].sort((x, y) => x - y); return idx; }
  }
  humansPending() { return this.players.map((p, i) => (!p.cpu && this.answers[i] === undefined ? i : -1)).filter(i => i >= 0); }
  fillCpu() { this.players.forEach((p, i) => { if (p.cpu && this.answers[i] === undefined) this.answers[i] = this.cpuAnswer(); }); }
  cpuAnswer() {
    const s = this.spec, skill = SKILL[this.opt.diff] || SKILL.normal, r = this.rng, noise = (1 - skill) * 0.9 + 0.08, jitter = () => 1 + (r() - 0.5) * 2 * noise;
    if (s.kind === 'bid' || s.kind === 'final') return cents(Math.max(0.5, s.price * (0.82 * jitter())));
    if (s.kind === 'dial') return cents(Math.min(s.max, Math.max(s.min, s.price * jitter())));
    if (s.kind === 'hilo') return hiloTruth(s.items).map(t => (r() < 0.5 + skill * 0.4 ? t : !t));
    // Einkaufswagen: grob gierig, je besser die Stufe desto näher am Ziel
    const order = s.items.map((it, i) => i).sort((a, b) => s.items[b].p - s.items[a].p), pick = []; let t = 0, goal = s.target * (0.85 + skill * 0.15);
    for (const i of order) if (t + s.items[i].p <= goal + 1e-9) { pick.push(i); t = cents(t + s.items[i].p); } return pick.sort((a, b) => a - b);
  }
  resolve() {
    if (this.phase !== 'collect') return null; this.fillCpu(); const s = this.spec, a = this.answers; let pts, reveal;
    if (s.kind === 'bid') { pts = bidScore(a, s.price, 3, 1); reveal = { price: s.price }; }
    else if (s.kind === 'final') { pts = bidScore(a, s.price, 5, 2); reveal = { price: s.price, prices: s.items.map(i => i.p) }; }
    else if (s.kind === 'dial') { pts = a.map(g => dialScore(g, s.price)); reveal = { price: s.price }; }
    else if (s.kind === 'hilo') { pts = a.map(c => hiloScore(c, s.items)); reveal = { prices: s.items.map(i => i.p), truth: hiloTruth(s.items) }; }
    else { const totals = a.map(idx => (Array.isArray(idx) ? sum(idx.map(i => s.items[i])) : 0)); pts = totals.map(t => cartScore(t, s.target)); reveal = { target: s.target, totals, solution: s.solution }; }
    this.players.forEach((p, i) => { p.total += pts[i]; }); this.phase = 'reveal';
    return { type: 'result', kind: s.kind, points: pts, answers: a.slice(), totals: this.players.map(p => p.total), reveal };
  }
  next() {
    if (this.phase !== 'reveal') return { type: 'ignored' }; if (this.index + 1 < this.plan.length) return this.startRound();
    this.phase = 'end'; const max = Math.max(...this.players.map(p => p.total)); return { type: 'end', totals: this.players.map(p => p.total), winners: this.players.map((p, i) => i).filter(i => this.players[i].total === max) };
  }
}
