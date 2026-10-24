/* Küchen-Chaos – Touch-Steuerung nach dem Vorbild von AnMaCha Kart Rush: links virtueller Joystick (hier in alle Richtungen: st.x, st.y),
 * rechts 4 Tasten im Raute-Layout (Belegung frei: [taste, text, x, y, symbol]). Ein Daumen zwischen zwei Tasten drückt beide. */
(function () {
  'use strict';
  
let touchReset = null;
  const clampN = (v, a, b) => v < a ? a : v > b ? b : v;
  function buildTouch(root, st, TBTN) {
    const TBIT = {}; TBTN.forEach(([k], n) => { TBIT[k] = 1 << n; });
  root.innerHTML = '<div class="joy"><div class="jb"><div class="jk"></div></div></div><div class="pad">' + TBTN.map(([k, t, , , ic]) => `<div class="tbtn tb-${k}" data-k="${k}"><i>${ic}</i>${t}</div>`).join('') + '</div>';
  const jb = root.querySelector('.jb'), jk = root.querySelector('.jk'), pad = root.querySelector('.pad'), els = {}, ptr = new Map();
  root.querySelectorAll('.tbtn').forEach(el => { els[el.dataset.k] = el; });
  let sid = null, hx = 0, hy = 0, ox = 0, oy = 0, rad = 50, mask = 0, g = null;
  // Tasten-Geometrie (Mitte der Raute, Tastenradius, Abstand der Tastenmitten) – nur beim Antippen neu gemessen
  const geo = () => { const r = pad.getBoundingClientRect(), br = els[TBTN[0][0]].offsetWidth / 2; g = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, br, d: r.width / 2 - br }; };
  const hit = (x, y) => {
    let m = 0, best = 0, bd = 1e9; for (const [k, , ax, ay] of TBTN) { const dx = x - (g.cx + ax * g.d), dy = y - (g.cy + ay * g.d), q = Math.hypot(dx, dy) / g.br; if (q < 1.2) m |= TBIT[k]; if (q < bd) { bd = q; best = TBIT[k]; } }
    return m || (bd < 1.7 ? best : 0);
  };
  const apply = () => { let m = 0; ptr.forEach(v => { m |= v; }); if (m === mask) return; if (m & ~mask && navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
    mask = m; for (const k in TBIT) { const on = m & TBIT[k] ? 1 : 0; st[k] = on; els[k].classList.toggle('on', !!on); } };
  const knob = (x, y) => { jk.style.transform = `translate3d(${x}px,${y}px,0)`; };
  const base = (x, y) => { jb.style.transform = `translate3d(${x - hx}px,${y - hy}px,0)`; };
  const stickEnd = () => { sid = null; st.x = 0; st.y = 0; knob(0, 0); jb.classList.remove('act'); jb.style.transform = ''; };
  root.addEventListener('pointerdown', e => {
    e.preventDefault(); try { root.setPointerCapture(e.pointerId); } catch (x) {}
    if (sid === null && e.clientX < innerWidth * 0.5 && !e.target.closest('.pad')) {
      const r = jb.getBoundingClientRect(); hx = r.left + r.width / 2; hy = r.top + r.height / 2; rad = r.width * 0.42; sid = e.pointerId;
      // Daumen im Joystick-Ring: dort bleiben, sonst springt der Joystick unter den Finger
      if (Math.hypot(e.clientX - hx, e.clientY - hy) <= r.width / 2) { ox = hx; oy = hy; } else { const h = r.width / 2 + 4; ox = clampN(e.clientX, h, innerWidth - h); oy = clampN(e.clientY, h, innerHeight - h); base(ox, oy); }
      jb.classList.add('act'); move(e);
    } else { geo(); ptr.set(e.pointerId, hit(e.clientX, e.clientY)); apply(); }
  });
  const move = e => {
    let dx = e.clientX - ox, dy = e.clientY - oy; const dist = Math.hypot(dx, dy);
    // Zieht der Daumen über den Rand hinaus, wandert der Joystick mit – Gegenlenken greift dann sofort
    if (dist > rad) { const f = (dist - rad) / dist; ox += dx * f; oy += dy * f; dx -= dx * f; dy -= dy * f; base(ox, oy); }
    const cv = v => { const a = Math.abs(v); return a < 0.12 ? 0 : Math.sign(v) * Math.min(1, (a - 0.12) / 0.7); }; st.x = cv(dx / rad); st.y = cv(dy / rad); knob(dx, dy);
  };
  root.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); else if (ptr.has(e.pointerId)) { const m = hit(e.clientX, e.clientY); if (m !== ptr.get(e.pointerId)) { ptr.set(e.pointerId, m); apply(); } } });
  const end = e => { if (e.pointerId === sid) stickEnd(); if (ptr.delete(e.pointerId)) apply(); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => root.addEventListener(ev, end)); root.addEventListener('contextmenu', e => e.preventDefault());
  // Nichts darf hängen bleiben: App-Wechsel, Drehen des Handys oder Fokusverlust lassen alles los
  if (!touchReset) { const f = () => touchReset && touchReset(); addEventListener('blur', f); addEventListener('orientationchange', f); document.addEventListener('visibilitychange', () => { if (document.hidden) f(); }); }
  touchReset = () => { ptr.clear(); apply(); if (sid !== null) stickEnd(); };
}
  window.KCTouch = { build: buildTouch, reset: () => touchReset && touchReset() };
})();
