/* Wobbel – Spielsitzung: Zustand, Zugverlauf (Rückgängig), Neustart, Eingabepuffer, Level-Abschluss. */
import { parseLevel, createState, cloneState, step, isSolved, targetsDone, findPath, DIRS } from './engine.js';
import { WORLDS } from './worlds.js';

export class Session {
  constructor(view, hooks) { this.view = view; this.hooks = hooks; this.queue = []; this.L = null; this.state = null; this.history = []; this.index = -1; this.def = null; this.pendingWin = false; this.solved = false; this.undos = 0; }
  start(def) {
    this.def = def; this.index = def.index; this.L = parseLevel(def); this.state = createState(this.L); this.history = []; this.queue = []; this.pendingWin = false; this.solved = false; this.undos = 0; this.world = WORLDS[def.world] || WORLDS[0];
    this.view.loadLevel(this.L, this.state, this.world); this.hooks.onChange(this); this.hooks.onStart && this.hooks.onStart(this);
  }
  get stats() { return { moves: this.state.moves, pushes: this.state.pushes, done: targetsDone(this.L, this.state), total: this.L.targets.length, canUndo: this.history.length > 0, keys: this.state.keysHeld }; }
  push(dir) { if (this.solved) return; if (this.queue.length < 4) this.queue.push(dir); }
  clearQueue() { this.queue.length = 0; }
  walkTo(cell) {
    if (this.solved || this.view.busy) return false; const L = this.L, s = this.state, p = s.p, px = p % L.w, py = (p / L.w) | 0, cx = cell % L.w, cy = (cell / L.w) | 0;
    if (s.crate[cell]) { const dx = cx - px, dy = cy - py; if (Math.abs(dx) + Math.abs(dy) === 1) { this.queue = [DIRS.findIndex(d => d[0] === dx && d[1] === dy)]; return true; } return false; }
    const path = findPath(L, s, p, cell); if (!path || !path.length) return false; this.queue = path.slice(0, 60); return true;
  }
  update() {
    if (this.view.busy) return; if (this.pendingWin) { this.pendingWin = false; this.solved = true; this.hooks.onSolved(this); return; }
    while (this.queue.length) { const d = this.queue.shift(); if (this.doMove(d)) break; this.queue.length = 0; }
  }
  doMove(dir) {
    const s = cloneState(this.state), res = step(this.L, s, dir);
    if (!res) { this.view.blocked(dir); this.hooks.onChange(this); return false; }
    this.history.push(this.state); this.state = s; this.view.move(dir, res, s); this.hooks.onChange(this);
    if (isSolved(this.L, s)) this.pendingWin = true; return true;
  }
  undo() { if (this.solved || !this.history.length || this.view.busy) return false; this.queue.length = 0; this.state = this.history.pop(); this.undos++; this.view.buildDynamic(this.state, true); this.view.teleportTo(this.state.p); this.view.cb.sfx('undo'); this.hooks.onChange(this); return true; }
  restart() { if (this.view.busy && !this.solved) { /* laufende Bewegung zu Ende lassen */ } this.queue.length = 0; this.pendingWin = false; this.solved = false; this.history = []; this.state = createState(this.L); this.undos = 0; this.view.anims.length = 0; this.view.buildDynamic(this.state, true); this.view.teleportTo(this.state.p); this.view.cb.sfx('restart'); this.hooks.onChange(this); }
}
// Sterne anhand der kürzesten bekannten Lösung (Par)
export function starsFor(moves, par) { if (!par) return moves ? 3 : 1; if (moves <= Math.ceil(par * 1.2) + 2) return 3; if (moves <= Math.ceil(par * 1.8) + 6) return 2; return 1; }
