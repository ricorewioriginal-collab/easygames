/* Wobbel – Tipp: der Löser (Web Worker) sucht von der aktuellen Stellung aus die kürzeste Lösung. */
import { parseLevel } from './engine.js';
import { solve, pathString } from './solver.js';
let worker = null, pending = null;
export function cancelTip() { if (worker) { worker.terminate(); worker = null; } if (pending) { pending({ ok: false, reason: 'abgebrochen' }); pending = null; } }
/** def: Level (map), state: aktueller Spielzustand → Promise<{ok, path:'RRUL…'|reason}> */
export function askTip(def, state, limits) {
  cancelTip(); const opt = Object.assign({ maxStates: 1200000, maxMs: 12000 }, limits || {}), from = { p: state.p, crate: state.crate, filled: state.filled, open: state.open, broken: state.broken, keyTaken: state.keyTaken, keysHeld: state.keysHeld, moves: 0, pushes: 0 };
  return new Promise(resolve => {
    const done = r => { if (pending !== done) return; pending = null; if (worker) { worker.terminate(); worker = null; } resolve(r); }; pending = done;
    const res = r => done(r.solvable === true ? { ok: true, path: r.path } : { ok: false, reason: r.solvable === false ? 'unlösbar' : 'zu komplex' });
    try { worker = new Worker(new URL('../editor/solve-worker.js', import.meta.url), { type: 'module' }); worker.onmessage = e => res(e.data); worker.onerror = () => { worker = null; inline(); }; worker.postMessage({ rows: def.map, from, ...opt }); } catch (e) { inline(); }
    function inline() { setTimeout(() => { const r = solve(parseLevel({ map: def.map }), { maxStates: 400000, maxMs: 6000, from }); res(r.solvable === true ? { solvable: true, path: pathString(r.path) } : r); }, 30); }
  });
}
