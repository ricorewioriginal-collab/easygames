/* Titanparcours – Kollisions-Prüfung über alle Hindernisse und Runden (node tests/collision-fuzz.mjs [seeds=40] [bot=0])
   1) Zufallseingaben auf vielen Zufallsparcours: kein NaN, kein Stecken in festen Flächen, kein Durchfallen durch Böden, kein Tunneln durch Wände.
   2) optional (bot>0): Planer-Bot pro Modul – jedes Hindernis einzeln in jeder Runde schaffbar, ohne Hängenbleiben. */
import { Sim, DT, PW, PH, makeCourse, MODULES, ROUNDS } from '../engine.js';
import { runBot, policy } from '../bot.js';
const SEEDS = +(process.argv[2] || 40), BOT = +(process.argv[3] || 0);
const POL = +(process.argv[4] || 0.55);
const issues = new Map(); const note = (k, m) => { if (!issues.has(k)) issues.set(k, { n: 0, m }); issues.get(k).n++; };
const free = s => !s.hang && !s.rope && !s.ladder && !s.glide && !s.chim && !s.wall && !s.dead && !s.finished;
/** Läufer-Rechteck steckt tiefer als tol in einer festen Fläche? */
const inside = (s, tol = 0.06) => { const h = s.h; for (const q of s.solids) { const ox = Math.min(s.x + PW / 2, q.x1) - Math.max(s.x - PW / 2, q.x0), oy = Math.min(s.y + h, q.top) - Math.max(s.y, q.bot); if (ox > tol && oy > tol) return q; } return null; };
const rnd = seed => { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; };
function fuzz(c, seed, label, startSec = 0) {
  const R = rnd(seed * 7919 + 13 + startSec), s = new Sim(c);
  if (startSec) { const sx = c.secs[startSec].x - 1.0, p = c.o.find(o => o.k === 'plat' && o.x <= sx && o.x + o.w >= sx); if (!p) return; s.x = sx; s.y = p.y; s.collect(); } let inp = {}, hold = 0, mode = 'pol', stuckIn = 0;
  for (let i = 0; i < 60 * 70 && !s.dead && !s.finished; i++) {
    // meist wie ein Läufer (Bot-Fortsetzung), immer wieder zufällige Störungen
    if (hold-- <= 0) { mode = R() < POL ? 'pol' : 'rnd'; inp = { r: R() < 0.8, l: R() < 0.12, j: R() < 0.35, d: R() < 0.12, g: R() < 0.3 }; hold = 2 + Math.floor(R() * 25); }
    if (mode === 'pol') inp = policy(s);
    const x0 = s.x, y0 = s.y, wasFree = free(s), wasDuck = s.duck; s.step(inp);
    if (![s.x, s.y, s.vx, s.vy].every(Number.isFinite)) { note(label + ' NaN', `x=${x0}`); return; }
    if (free(s) && wasFree) { const q = inside(s); stuckIn = q ? stuckIn + 1 : 0; if (q && stuckIn >= 2) {   // zwei Schritte in Folge: echtes Stecken (ein einzelner Streifkontakt an einer fahrenden Kante löst sich sofort)
      const o = c.o[q.i]; note(`${label}: steckt in ${o.k}${o.look ? '/' + o.look : ''}${q.gate ? ' (Tor)' : ''}`, `seed ${seed} t=${s.t.toFixed(2)} x=${s.x.toFixed(2)} y=${s.y.toFixed(2)} duck=${s.duck}/${wasDuck} vy=${s.vy.toFixed(2)} q=[${q.x0.toFixed(2)},${q.x1.toFixed(2)}]x[${q.bot.toFixed(2)},${q.top.toFixed(2)}]`); }
      // Tunneln: in einem Schritt mehr als eine halbe Körperbreite
      if (Math.abs(s.x - x0) > 0.4) note(`${label}: Sprung in x (${(s.x - x0).toFixed(2)} m)`, `seed ${seed} t=${s.t.toFixed(2)} x=${x0.toFixed(2)}→${s.x.toFixed(2)}`);
    }
  }
  // Hängenbleiben: nach den Störungen läuft die Bot-Fortsetzung weiter – sie muss vorankommen, ins Ziel kommen oder ins Wasser fallen
  const xs = s.x, st0 = s.hang ? 'hang' : s.rope ? 'rope' : s.ladder ? 'ladder' : s.glide ? 'glide' : s.chim ? 'chim' : s.wall ? 'wall' : s.onGround ? 'Boden' : 'Luft';
  for (let i = 0; i < 60 * 25 && !s.dead && !s.finished; i++) s.step(policy(s));
  if (!s.dead && !s.finished && s.x - xs < 1) note(`${label}: hängt fest (${st0})`, `seed ${seed} x=${s.x.toFixed(2)} y=${s.y.toFixed(2)} vx=${s.vx.toFixed(2)} vy=${s.vy.toFixed(2)} st=${s.hang ? 'hang' : s.rope ? 'rope' : s.ladder ? 'ladder' : s.glide ? 'glide' : s.chim ? 'chim' : s.wall ? 'wall' : s.onGround ? 'Boden' : 'Luft'} bei ${c.o.filter(o => (o.x != null ? o.x : o.x1 != null ? o.x1 : o.px) < s.x + 1 && (o.x != null ? o.x + (o.w || 0) : o.x2 != null ? o.x2 : o.px) > s.x - 1).map(o => o.k).join('/')}`);
}
const mods = Object.keys(MODULES);
for (let r = 0; r < 3; r++) for (let seed = 1; seed <= SEEDS; seed++) {
  { const c = makeCourse(r, seed); for (let k = 0; k < c.secs.length; k++) fuzz(c, seed, `R${r} gemischt ${c.secs[k].n}`, k); }
  for (const m of mods) for (let rep = 0; rep < 3; rep++) fuzz(makeCourse(r, seed, [m]), seed * 3 + rep, `R${r} ${m}`);
}
if (BOT) {
  for (let r = 0; r < 3; r++) for (const m of mods) for (let seed = 1; seed <= BOT; seed++) {
    const c = makeCourse(r, seed, [m]); const res = runBot(c, { maxT: 90, latency: 0.15 });
    if (!res.finished) note(`Bot R${r} ${m}: ${res.dead || 'Zeit'}`, `seed ${seed} x=${res.x.toFixed(2)} dist=${res.dist.toFixed(1)}`);
  }
}
const list = [...issues.entries()].sort((a, b) => b[1].n - a[1].n);
for (const [k, v] of list) console.log(`✗ ${k} ×${v.n}  (z. B. ${v.m})`);
console.log(list.length ? `${list.length} Problemarten` : '✓ keine Kollisionsfehler gefunden');
process.exit(list.length ? 1 : 0);
