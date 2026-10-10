/* Wobbel – Eingabe: Tastatur, Wischen/Ziehen, Tippen (Laufen), Bildschirm-Steuerkreuz. Richtungen sind bildschirmbezogen. */
export function initInput({ view, canvas, actions }) {
  const SCREEN = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const best = (vx, vy) => { const dirs = view.screenDirs(); let bi = 0, bs = -9; dirs.forEach((d, i) => { const l = Math.hypot(d[0], d[1]) || 1, sc = (d[0] * vx + d[1] * vy) / l / (Math.hypot(vx, vy) || 1); if (sc > bs) { bs = sc; bi = i; } }); return bi; };
  const dirFor = name => best(SCREEN[name][0], SCREEN[name][1]);
  const KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  const active = () => actions.playing();
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const k = e.key;
    if (!active()) { if (k === 'Escape') actions.back(); return; }
    if (KEYS[k]) { e.preventDefault(); session().push(dirFor(KEYS[k])); }
    else if (k === 'z' || k === 'Z' || k === 'Backspace' || k === 'u' || k === 'U') { e.preventDefault(); actions.undo(); }
    else if (k === 'r' || k === 'R') actions.restart(); else if (k === 'q' || k === 'Q') actions.rotate(-1); else if (k === 'e' || k === 'E') actions.rotate(1);
    else if (k === 'Escape' || k === 'm' || k === 'M') actions.back(); else if (k === 'n' || k === 'N') actions.next();
  });
  const session = () => actions.session();
  // Zeiger auf der Spielfläche
  let st = null;
  canvas.addEventListener('pointerdown', e => { if (!active()) return; canvas.setPointerCapture(e.pointerId); st = { x: e.clientX, y: e.clientY, ax: e.clientX, ay: e.clientY, t: performance.now(), moved: false, id: e.pointerId }; e.preventDefault(); });
  canvas.addEventListener('pointermove', e => { if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.ax, dy = e.clientY - st.ay, th = Math.max(34, Math.min(innerWidth, innerHeight) * 0.07); if (Math.hypot(dx, dy) > th) { st.moved = true; session().push(best(dx, dy)); st.ax = e.clientX; st.ay = e.clientY; } });
  const end = e => { if (!st || e.pointerId !== st.id) return; const d = Math.hypot(e.clientX - st.x, e.clientY - st.y), dt = performance.now() - st.t; if (!st.moved && d < 12 && dt < 450) { const cell = view.pickCell(e.clientX, e.clientY); if (cell != null) { if (!session().walkTo(cell)) view.cb.sfx('blocked'); } } st = null; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', () => { st = null; }); canvas.addEventListener('contextmenu', e => e.preventDefault());
  // Steuerkreuz
  document.querySelectorAll('#dpad [data-d]').forEach(b => { let rep = null; const fire = () => session().push(dirFor(b.dataset.d)); b.addEventListener('pointerdown', e => { e.preventDefault(); if (!active()) return; fire(); clearInterval(rep); rep = setInterval(fire, 190); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { clearInterval(rep); rep = null; })); });
}
