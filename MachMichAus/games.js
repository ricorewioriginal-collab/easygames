/* Mach mich aus! – Talent-Minispiel „Funk-Takt“ (läuft am Gastgeber und am Handy): tippe im Takt, wenn der Ring das Ziel trifft. */
import { SFX } from './audio.js';
const FAST = () => window.__mmFast || 1;
/** onDone(score 0..12) */
export function mountTalent(root, onDone) {
  let dead = false, finished = false, raf = 0; const BEATS = 8, GAP = 700;
  root.innerHTML = `<div class="tk"><div class="tkh"><b>🎭 Funk-Takt</b><span id="tkInfo">Tippe im Takt!</span></div><div class="beat"><div class="tgt"></div><div class="ring" id="ring"></div><button class="tap" id="tap">TIPP!</button></div><div class="hint">Wenn der Ring das Ziel trifft, tippst du. Je genauer, desto mehr Beifall.</div></div>`;
  const ring = root.querySelector('#ring'), tap = root.querySelector('#tap'), info = root.querySelector('#tkInfo'); const t0 = performance.now() + 1400 / FAST(), g = GAP / FAST(); const taps = []; let n = 0;
  const done = () => { if (finished || dead) return; finished = true; cancelAnimationFrame(raf); const err = []; for (let i = 0; i < BEATS; i++) { const bt = t0 + i * g; let best = 1e9; for (const t of taps) best = Math.min(best, Math.abs(t - bt)); err.push(best); } const acc = err.map(e => Math.max(0, 1 - (e * FAST()) / 320)); const sc = Math.round((acc.reduce((a, b) => a + b, 0) / BEATS) * 12); onDone(sc); };
  const tick = () => { if (dead) return; const now = performance.now(), ph = ((now - t0) / g) % 1, i = Math.floor((now - t0) / g); if (now < t0) { ring.style.transform = 'scale(0)'; } else { ring.style.transform = `scale(${0.15 + 0.85 * ph})`; ring.style.opacity = String(0.3 + 0.7 * ph); } if (i >= BEATS) { done(); return; } if (i >= 0) info.textContent = `Takt ${Math.min(BEATS, i + 1)}/${BEATS}`; raf = requestAnimationFrame(tick); };
  const hit = e => { if (e) e.preventDefault(); if (finished) return; taps.push(performance.now()); n++; SFX.beep(520 + 60 * (n % 4)); tap.classList.add('on'); setTimeout(() => tap.classList.remove('on'), 90); };
  tap.onpointerdown = hit; raf = requestAnimationFrame(tick);
  return { destroy() { dead = true; cancelAnimationFrame(raf); root.innerHTML = ''; } };
}
