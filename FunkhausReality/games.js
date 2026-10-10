/* Funkhaus – Wochenaufgaben als Mini-Spiele (laufen am Gastgeber UND am Handy). mountTask(root, kind, seed, onDone(score 0..100)) */
import { SFX } from './audio.js';
const FAST = () => window.__fhFast || 1, sleep = ms => new Promise(r => setTimeout(r, ms / FAST()));
const rngS = seed => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
export const TASK_INFO = { reflex: { t: '⚡ Funk-Reflex', d: 'Fünfmal: Sobald das Signal GRÜN wird, tippe so schnell du kannst. Zu früh tippen kostet Zeit!' }, memory: { t: '🎵 Merk-Melodie', d: 'Merke dir die Tonfolge und spiele sie nach. Sie wird immer länger – wie weit kommst du?' }, guess: { t: '📡 Schätz-Radar', d: 'Du siehst kurz viele Funkpunkte. Schätze, wie viele es waren – je näher, desto besser.' } };
export function mountTask(root, kind, seed, onDone) {
  let dead = false, finished = false; const done = sc => { if (finished || dead) return; finished = true; onDone(Math.max(0, Math.min(100, Math.round(sc)))); };
  const R = rngS(seed + 17);
  root.innerHTML = `<div class="tk"><div class="tkh"></div><div class="tkb"></div></div>`; const head = root.querySelector('.tkh'), body = root.querySelector('.tkb'); head.innerHTML = `<b>${TASK_INFO[kind].t}</b><span id="tkInfo"></span>`; const info = t => { head.querySelector('#tkInfo').textContent = t; };
  if (kind === 'reflex') {
    let n = 0, sum = 0, armed = false, t0 = 0, timer = 0; body.innerHTML = '<button class="sig wait" id="sig">Warte …</button>';
    const sig = body.querySelector('#sig');
    const next = () => { if (dead) return; n++; if (n > 5) { done((700 - sum / 5) / 5); return; } info(`Runde ${n}/5`); armed = false; sig.className = 'sig wait'; sig.textContent = 'Warte …'; timer = setTimeout(() => { if (dead) return; armed = true; t0 = performance.now(); sig.className = 'sig go'; sig.textContent = 'JETZT!'; SFX.beep(1320); }, (800 + R() * 1700) / FAST()); };
    sig.onpointerdown = e => { e.preventDefault(); if (finished) return; if (!armed) { clearTimeout(timer); sum += 700; sig.className = 'sig bad'; sig.textContent = 'Zu früh!'; SFX.buzz(); setTimeout(next, 700 / FAST()); return; } armed = false; const ms = Math.min(700, (performance.now() - t0) * FAST()); sum += ms; sig.className = 'sig ok'; sig.textContent = Math.round(ms) + ' ms'; SFX.ding(); setTimeout(next, 700 / FAST()); };
    next(); return { destroy() { dead = true; clearTimeout(timer); root.innerHTML = ''; } };
  }
  if (kind === 'memory') {
    const cols = ['#ff2d95', '#00e5ff', '#ffd24a', '#00ff88']; body.innerHTML = '<div class="pads">' + cols.map((c, i) => `<button class="pad" data-i="${i}" style="--pc:${c}"></button>`).join('') + '</div>'; const pads = [...body.querySelectorAll('.pad')]; const seq = []; let pos = 0, input = false, reached = 0;
    const flash = async i => { pads[i].classList.add('on'); SFX.pad(i); await sleep(380); pads[i].classList.remove('on'); await sleep(140); };
    const round = async () => { if (dead) return; seq.push(Math.floor(R() * 4)); if (seq.length < 3) while (seq.length < 3) seq.push(Math.floor(R() * 4)); input = false; info(`Länge ${seq.length}: zuhören …`); await sleep(500); for (const i of seq) { if (dead) return; await flash(i); } pos = 0; input = true; info(`Jetzt du! (${seq.length})`); };
    pads.forEach(p => { p.onpointerdown = async e => { e.preventDefault(); if (!input || finished) return; const i = +p.dataset.i; p.classList.add('on'); SFX.pad(i); setTimeout(() => p.classList.remove('on'), 160 / FAST()); if (i !== seq[pos]) { input = false; SFX.buzz(); info('Falsch!'); await sleep(800); done(Math.max(0, (seq.length - 3)) * 16 + 8); return; } pos++; if (pos === seq.length) { input = false; reached = seq.length; if (reached >= 9) { SFX.top(); done(100); return; } SFX.ding(); await sleep(500); round(); } }; });
    round(); return { destroy() { dead = true; root.innerHTML = ''; } };
  }
  // guess
  const N = 40 + Math.floor(R() * 70); body.innerHTML = '<div class="dots" id="dots"></div><div class="gin" hidden><input id="gv" type="number" inputmode="numeric" min="0" max="500" placeholder="Wie viele?"><button class="btn green" id="gok">Tippen</button></div>'; const dots = body.querySelector('#dots'), gin = body.querySelector('.gin');
  for (let i = 0; i < N; i++) { const d = document.createElement('i'); d.style.left = (4 + R() * 90) + '%'; d.style.top = (4 + R() * 88) + '%'; d.style.background = ['#00e5ff', '#ff2d95', '#ffd24a', '#00ff88'][i % 4]; dots.appendChild(d); }
  info('Merken! 3 Sekunden …'); sleep(3000).then(() => { if (dead) return; dots.innerHTML = '<div class="q">?</div>'; gin.hidden = false; info('Wie viele Punkte waren es?'); body.querySelector('#gv').focus(); });
  const submit = () => { const v = parseInt(body.querySelector('#gv').value, 10); if (!isFinite(v)) return; done(100 - (Math.abs(v - N) / N) * 250); };
  body.querySelector('#gok').onclick = submit; body.querySelector('#gv').onkeydown = e => { if (e.key === 'Enter') submit(); };
  return { destroy() { dead = true; root.innerHTML = ''; }, answer: N };
}
