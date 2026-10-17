// Royal Radio Match 3D – Solver für Levelprüfung und Balancing (läuft nur in Node, nicht Teil des Spiels).
//   cert: gieriger Spieler, der jede Zugfolge komplett simuliert (inkl. Nachfüllen mit dem Level-Seed) -> liefert einen
//         reproduzierbaren Siegpfad (Zertifikat) unter den festgelegten RNG-Regeln.
//   fair: gieriger Spieler ohne Blick in den Zufall (simuliert Nachfüllen mit fremdem Zufall) -> Stichprobe zur Schwierigkeit mit anderen Seeds.
//   quick: Vorschau nur der ersten Welle (wie der Hinweis-Knopf im Spiel).
// Eine Stichprobe beweist keine Lösbarkeit; bewiesen ist ein Level nur durch einen abgespielten, gespeicherten Siegpfad.
'use strict';
const path = require('path');
const core = path.join(__dirname, '..', 'src', 'core');
require(path.join(core, 'defs.js')); require(path.join(core, 'rng.js'));
const Engine = require(path.join(core, 'engine.js'));

// blind: Nachfüllen wird mit einem fremden Zufall simuliert – der Spieler kennt die echten neuen Steine nicht
function certStep(e, top, blind) {
  const ranked = e.rankMoves().slice(0, top);
  let best = null, bv = -Infinity;
  for (const r of ranked) {
    const c = e.clone();
    if (blind) c.rng = new Engine.Rng(blind.int(1e9) + 1);
    c.swap(r.m[0], r.m[1]);
    const v = c.value() + r.v * 0.05;
    if (v > bv) { bv = v; best = r.m; }
    if (c.status === 'won' && !blind) return r.m;
  }
  return best;
}

// Spielt ein Level. Rückgabe { won, used, path }
function play(def, opt = {}) {
  const d = Object.assign({}, def, { moves: opt.budget || 150 });
  if (opt.seed != null) d.seed = opt.seed;
  const e = new Engine(d, { events: false });
  const pathOut = [], blind = opt.mode === 'fair' ? new Engine.Rng((d.seed * 31) >>> 0) : null;
  while (e.status === 'play') {
    const m = opt.mode === 'quick' ? e.bestMove() : certStep(e, opt.top || 10, blind);
    if (!m) break;
    const r = e.swap(m[0], m[1]);
    if (!r.ok) throw new Error('Solver: ungültiger Zug ' + m);
    pathOut.push(m);
  }
  return { won: e.status === 'won', used: d.moves - e.moves, path: pathOut, score: e.score };
}

// Spielt einen gespeicherten Siegpfad nach (Zertifikatsprüfung)
function replay(def, steps) {
  const e = new Engine(def, { events: false });
  for (const m of steps) {
    if (e.status !== 'play') break;
    const r = e.swap(m[0], m[1]);
    if (!r.ok) return { won: false, error: 'Zug ungültig: ' + m, at: e.movesStart - e.moves };
  }
  return { won: e.status === 'won', left: e.moves, hash: e.hash() };
}

module.exports = { play, replay, Engine };
