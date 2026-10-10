/* Löser im Hintergrund (Web Worker, ES-Modul), damit die Oberfläche nicht einfriert. */
import { parseLevel } from '../game/engine.js';
import { solve, replay, pathString } from '../game/solver.js';
onmessage = e => {
  const { rows, maxStates, maxMs } = e.data, L = parseLevel({ map: rows }), r = solve(L, { maxStates, maxMs });
  postMessage(r.solvable === true ? { solvable: true, moves: r.moves, pushes: r.pushes, states: r.states, path: pathString(r.path), checked: replay(L, r.path) } : { solvable: r.solvable, states: r.states, reason: r.reason });
};
