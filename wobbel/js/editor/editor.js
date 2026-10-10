/* Wobbel – Level-Editor: Raster zeichnen, prüfen (Löser im Worker), testen, speichern, teilen. */
import { parseLevel, T } from '../game/engine.js';
import { WORLDS } from '../game/worlds.js';
import { validate, encode, decode, MAX_W, MAX_H, MIN_W, MIN_H } from './codec.js';
import { Custom } from './custom-levels.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const PAINT = { 1: '#ff5a6a', 2: '#4cd964', 3: '#4aa8ff' }, CRATE_COL = { r: '#ff5a6a', g: '#4cd964', b: '#4aa8ff' }, TARGET_COL = { '.': '#ffd24a', R: '#ff5a6a', G: '#4cd964', B: '#4aa8ff' };
const WALL_COL = { bush: ['#3fb04a', '#2a8a38'], rock: ['#a09a92', '#7e7870'], ruin: ['#d9b97a', '#a98a50'], brick: ['#ff7aa8', '#d85a88'], ice: ['#b8ecff', '#7ed0f0'], castle: ['#a89ac8', '#8274a8'] };
const TOOLS = [
  { id: '#', name: 'Wand', grp: 'Gelände' }, { id: ' ', name: 'Boden / Radierer', grp: 'Gelände' }, { id: '~', name: 'Wasser', grp: 'Gelände' }, { id: 'i', name: 'Eis', grp: 'Gelände' },
  { id: '@', name: 'Wobbel', grp: 'Figuren' }, { id: '$', name: 'Kiste', grp: 'Figuren' }, { id: 'r', name: 'Rote Kiste', grp: 'Figuren' }, { id: 'g', name: 'Grüne Kiste', grp: 'Figuren' }, { id: 'b', name: 'Blaue Kiste', grp: 'Figuren' },
  { id: '.', name: 'Zielfeld', grp: 'Ziele' }, { id: 'R', name: 'Rotes Ziel', grp: 'Ziele' }, { id: 'G', name: 'Grünes Ziel', grp: 'Ziele' }, { id: 'B', name: 'Blaues Ziel', grp: 'Ziele' },
  { id: '1', name: 'Roter Klecks', grp: 'Farbe' }, { id: '2', name: 'Grüner Klecks', grp: 'Farbe' }, { id: '3', name: 'Blauer Klecks', grp: 'Farbe' },
  { id: 'k', name: 'Schlüssel', grp: 'Schloss' }, { id: 'D', name: 'Tür', grp: 'Schloss' },
  { id: '^', name: 'Pfeil hoch', grp: 'Ruinen' }, { id: '>', name: 'Pfeil rechts', grp: 'Ruinen' }, { id: 'v', name: 'Pfeil runter', grp: 'Ruinen' }, { id: '<', name: 'Pfeil links', grp: 'Ruinen' }, { id: 'x', name: 'Brüchiger Boden', grp: 'Ruinen' }
];

// ---------------------------------------------------------------- Zeichnen einer Zelle (Raster-Ansicht)
function drawCell(g, ch, x, y, s, world, outside, dark) {
  const w = WORLDS[world] || WORLDS[0];
  if (outside) { g.fillStyle = '#8fd8ff'; g.fillRect(x, y, s, s); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(1, s / 16); g.beginPath(); g.moveTo(x + s * 0.15, y + s * 0.6); g.quadraticCurveTo(x + s * 0.35, y + s * 0.45, x + s * 0.55, y + s * 0.6); g.stroke(); return; }
  const cx = x + s / 2, cy = y + s / 2, r = s * 0.5;
  g.fillStyle = w.floor[((x / s | 0) + (y / s | 0)) & 1] || w.floor[0]; g.fillRect(x, y, s, s);
  const rr = (px, py, pw, ph, rad) => { g.beginPath(); g.moveTo(px + rad, py); g.arcTo(px + pw, py, px + pw, py + ph, rad); g.arcTo(px + pw, py + ph, px, py + ph, rad); g.arcTo(px, py + ph, px, py, rad); g.arcTo(px, py, px + pw, py, rad); g.closePath(); };
  switch (ch) {
    case '#': { const c = WALL_COL[w.wall] || WALL_COL.rock; g.fillStyle = c[1]; rr(x + s * 0.06, y + s * 0.1, s * 0.88, s * 0.86, s * 0.2); g.fill(); g.fillStyle = c[0]; rr(x + s * 0.06, y + s * 0.04, s * 0.88, s * 0.82, s * 0.2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; rr(x + s * 0.18, y + s * 0.12, s * 0.3, s * 0.12, s * 0.06); g.fill(); break; }
    case '~': g.fillStyle = '#35b8f0'; g.fillRect(x, y, s, s); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1.5, s / 14); g.beginPath(); g.moveTo(x + s * .15, y + s * .4); g.quadraticCurveTo(x + s * .32, y + s * .25, x + s * .5, y + s * .4); g.quadraticCurveTo(x + s * .68, y + s * .55, x + s * .85, y + s * .4); g.stroke(); break;
    case 'i': g.fillStyle = '#cdf1ff'; g.fillRect(x, y, s, s); g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1.5, s / 12); g.beginPath(); g.moveTo(x + s * .2, y + s * .75); g.lineTo(x + s * .45, y + s * .3); g.moveTo(x + s * .5, y + s * .8); g.lineTo(x + s * .75, y + s * .35); g.stroke(); break;
    case '1': case '2': case '3': g.fillStyle = PAINT[ch]; g.beginPath(); for (let i = 0; i <= 9; i++) { const a = i / 9 * Math.PI * 2, rad = r * (0.62 + (i % 3 === 0 ? 0.28 : i % 2 ? 0.05 : 0.12)); g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.closePath(); g.fill(); break;
    case '.': case 'R': case 'G': case 'B': g.strokeStyle = TARGET_COL[ch]; g.lineWidth = Math.max(2, s / 9); g.beginPath(); g.arc(cx, cy, r * 0.58, 0, 7); g.stroke(); g.fillStyle = TARGET_COL[ch] + '66'; g.beginPath(); g.arc(cx, cy, r * 0.58, 0, 7); g.fill(); if (ch !== '.') { g.fillStyle = '#fff'; g.font = `900 ${s * 0.3}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch === 'R' ? '●' : ch === 'G' ? '▲' : '■', cx, cy + 1); } break;
    case '$': g.fillStyle = '#7a4a28'; rr(x + s * .12, y + s * .12, s * .76, s * .76, s * .1); g.fill(); g.fillStyle = '#e8b062'; rr(x + s * .17, y + s * .17, s * .66, s * .66, s * .07); g.fill(); g.strokeStyle = '#a8683a'; g.lineWidth = Math.max(1.5, s / 14); g.beginPath(); g.moveTo(x + s * .2, y + s * .2); g.lineTo(x + s * .8, y + s * .8); g.moveTo(x + s * .8, y + s * .2); g.lineTo(x + s * .2, y + s * .8); g.stroke(); break;
    case 'r': case 'g': case 'b': g.fillStyle = '#1b2748'; rr(x + s * .12, y + s * .12, s * .76, s * .76, s * .1); g.fill(); g.fillStyle = CRATE_COL[ch]; rr(x + s * .17, y + s * .17, s * .66, s * .66, s * .07); g.fill(); g.fillStyle = '#fff7e0'; g.fillRect(cx - s * .06, y + s * .17, s * .12, s * .66); g.fillRect(x + s * .17, cy - s * .06, s * .66, s * .12); g.fillStyle = '#fff'; g.font = `900 ${s * 0.26}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch === 'r' ? '●' : ch === 'g' ? '▲' : '■', cx, cy + 1); break;
    case '^': case '>': case 'v': case '<': { const a = { '^': 0, '>': 1, v: 2, '<': 3 }[ch] * Math.PI / 2; g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = '#ff8a3d'; g.strokeStyle = '#7a3a10'; g.lineWidth = Math.max(1.5, s / 16); g.beginPath(); g.moveTo(0, -r * .62); g.lineTo(r * .5, -r * .02); g.lineTo(r * .18, -r * .02); g.lineTo(r * .18, r * .6); g.lineTo(-r * .18, r * .6); g.lineTo(-r * .18, -r * .02); g.lineTo(-r * .5, -r * .02); g.closePath(); g.fill(); g.stroke(); g.restore(); break; }
    case 'x': g.strokeStyle = '#5a4020'; g.lineWidth = Math.max(1.5, s / 14); g.beginPath(); g.moveTo(x + s * .15, y + s * .2); g.lineTo(x + s * .45, y + s * .5); g.lineTo(x + s * .35, y + s * .85); g.moveTo(x + s * .45, y + s * .5); g.lineTo(x + s * .85, y + s * .4); g.moveTo(x + s * .6, y + s * .15); g.lineTo(x + s * .55, y + s * .45); g.stroke(); break;
    case 'k': g.font = `${s * 0.62}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔑', cx, cy + 1); break;
    case 'D': g.fillStyle = '#7a4a28'; rr(x + s * .14, y + s * .06, s * .72, s * .88, s * .12); g.fill(); g.fillStyle = '#c4824a'; rr(x + s * .2, y + s * .12, s * .6, s * .76, s * .08); g.fill(); g.strokeStyle = '#a8683a'; g.lineWidth = Math.max(1, s / 18); for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x + s * (0.2 + i * 0.2), y + s * .14); g.lineTo(x + s * (0.2 + i * 0.2), y + s * .86); g.stroke(); } g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(cx + s * .12, cy, s * .06, 0, 7); g.fill(); break;
    case '@': g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx, cy + r * .62, r * .5, r * .16, 0, 0, 7); g.fill(); g.fillStyle = '#ff6fb0'; g.strokeStyle = '#1b2748'; g.lineWidth = Math.max(1.5, s / 14); g.beginPath(); g.ellipse(cx, cy + r * .08, r * .7, r * .62, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#fff'; [-1, 1].forEach(k => { g.beginPath(); g.ellipse(cx + k * r * .26, cy - r * .08, r * .17, r * .2, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#1b2748'; g.beginPath(); g.arc(cx + k * r * .26, cy - r * .04, r * .08, 0, 7); g.fill(); g.fillStyle = '#fff'; }); g.strokeStyle = '#1b2748'; g.beginPath(); g.arc(cx, cy + r * .22, r * .18, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); break;
  }
}

export function initEditor(ctx) {   // ctx: {toast, sfx, playTest(def, opts), back()}
  const cv = $('edCv'), g = cv.getContext('2d');
  let w = 10, h = 8, grid = [], world = 0, tool = '#', name = '', id = null, verified = null, solving = null, hist = [], redo = [], down = null, erase = false, S = 40, cellOf = null;
  const rows = () => grid.map(r => r.join(''));
  const blank = (W, H) => Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : ' '));
  const snapshot = () => { hist.push(rows()); if (hist.length > 120) hist.shift(); redo.length = 0; };
  const load = (m, nm, wd, vid, ver) => { grid = m.map(r => [...r]); h = grid.length; w = grid[0].length; name = nm || ''; world = wd | 0; id = vid || null; verified = ver || null; hist = []; redo = []; $('edName').value = name; sync(); };
  const edited = () => { verified = null; stopSolve(); sync(); };
  // ---------------------------------------------------------------- Werkzeugleiste
  function buildPalette() {
    const pal = $('edPal'); pal.innerHTML = ''; let grp = null;
    TOOLS.forEach(t => { if (t.grp !== grp) { grp = t.grp; const l = document.createElement('div'); l.className = 'ed-grp'; l.textContent = grp; pal.appendChild(l); } const b = document.createElement('button'); b.className = 'ed-tool'; b.dataset.t = t.id; b.title = t.name; b.setAttribute('aria-label', t.name); const c = document.createElement('canvas'); c.width = c.height = 44; b.appendChild(c); const gg = c.getContext('2d'); gg.fillStyle = '#fff'; gg.fillRect(0, 0, 44, 44); if (t.id === ' ') { gg.font = '26px sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('🧽', 22, 24); } else drawCell(gg, t.id, 0, 0, 44, world, false); b.onclick = () => { tool = t.id; ctx.sfx('click'); syncTools(); }; pal.appendChild(b); });
    $('edWorlds').innerHTML = WORLDS.map((wd, i) => `<button class="ed-w" data-w="${i}" title="${wd.name}">${wd.emoji}</button>`).join(''); $('edWorlds').querySelectorAll('[data-w]').forEach(b => b.onclick = () => { world = +b.dataset.w; ctx.sfx('click'); sync(); rebuildPalette(); });
  }
  const rebuildPalette = () => { buildPalette(); syncTools(); };
  const syncTools = () => { document.querySelectorAll('#edPal .ed-tool').forEach(b => b.classList.toggle('on', b.dataset.t === tool)); $('edWorlds').querySelectorAll('[data-w]').forEach(b => b.classList.toggle('on', +b.dataset.w === world)); };
  // ---------------------------------------------------------------- Ansicht
  function layout() { const wrap = $('edWrap'); const aw = Math.max(80, wrap.clientWidth - 8), ah = Math.max(80, wrap.clientHeight - 8); S = Math.max(14, Math.min(54, Math.floor(Math.min(aw / w, ah / h)))); const dpr = Math.min(devicePixelRatio || 1, 2); cv.style.width = w * S + 'px'; cv.style.height = h * S + 'px'; cv.width = w * S * dpr; cv.height = h * S * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
  function draw() {
    const r = rows(); let L = null; try { L = parseLevel({ map: r }); } catch (e) {}
    g.clearRect(0, 0, w * S, h * S);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, outside = L && L.terrain[i] === T.VOID && grid[y][x] !== '#'; drawCell(g, grid[y][x] === '#' && !outside ? '#' : outside ? ' ' : grid[y][x], x * S, y * S, S, world, outside); }
    g.strokeStyle = 'rgba(27,39,72,.18)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= w; x++) { g.moveTo(x * S + .5, 0); g.lineTo(x * S + .5, h * S); } for (let y = 0; y <= h; y++) { g.moveTo(0, y * S + .5); g.lineTo(w * S, y * S + .5); } g.stroke();
  }
  function sync() {
    $('edW').textContent = w; $('edH').textContent = h; syncTools(); $('edUndo').disabled = !hist.length; $('edRedo').disabled = !redo.length; layout();
    const v = validate(rows()), st = $('edStatus'); let html = '';
    v.errors.forEach(e => { html += `<div class="ed-line bad">❌ ${esc(e)}</div>`; }); v.warnings.forEach(e => { html += `<div class="ed-line warn">⚠️ ${esc(e)}</div>`; });
    const i = v.info; if (i && i.w) html += `<div class="ed-line">📐 ${i.w}×${i.h} · 📦 ${i.crates} Kisten · 🎯 ${i.targets} Ziele${i.doors ? ' · 🚪 ' + i.doors : ''}${i.keys ? ' · 🔑 ' + i.keys : ''}${i.water ? ' · 💧 ' + i.water : ''}</div>`;
    if (solving) html += `<div class="ed-line">🔍 Der Löser sucht … <span id="edSec">0</span> s <button class="btn ghost small" id="edCancel">Abbrechen</button></div>`;
    else if (verified) html += `<div class="ed-line good">✅ Lösbar – ${verified.by === 'spieler' ? 'von dir gelöst in' : 'kürzeste Lösung:'} ${verified.moves} Zügen${verified.path ? ' <button class="btn ghost small" id="edShow">▶ Lösung ansehen</button>' : ''}</div>`;
    else if (!v.errors.length) html += `<div class="ed-line">⏳ Noch nicht geprüft – „Prüfen" oder „Testen" drücken.</div>`;
    st.innerHTML = html; const c = $('edCancel'); if (c) c.onclick = stopSolve; const sh = $('edShow'); if (sh) sh.onclick = showSolution;
    $('edTest').disabled = v.errors.length > 0; $('edSolve').disabled = v.errors.length > 0 || !!solving;
  }
  // ---------------------------------------------------------------- Malen
  function cellAt(e) { const rect = cv.getBoundingClientRect(), x = Math.floor((e.clientX - rect.left) / rect.width * w), y = Math.floor((e.clientY - rect.top) / rect.height * h); return x >= 0 && y >= 0 && x < w && y < h ? [x, y] : null; }
  function paint(x, y) { const ch = erase ? ' ' : tool; if (grid[y][x] === ch) return false; if (ch === '@') grid.forEach((r, yy) => r.forEach((c, xx) => { if (c === '@') r[xx] = ' '; })); grid[y][x] = ch; return true; }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); const c = cellAt(e); if (!c) return; cv.setPointerCapture(e.pointerId); erase = e.button === 2; snapshot(); down = { last: c.join() }; if (paint(c[0], c[1])) { ctx.sfx('click'); edited(); } else { hist.pop(); } });
  cv.addEventListener('pointermove', e => { if (!down) return; const c = cellAt(e); if (!c || c.join() === down.last) return; down.last = c.join(); if (paint(c[0], c[1])) edited(); });
  const up = () => { down = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('contextmenu', e => e.preventDefault());
  // Größe
  function resize(dw, dh) { const nw = Math.max(MIN_W, Math.min(MAX_W, w + dw)), nh = Math.max(MIN_H, Math.min(MAX_H, h + dh)); if (nw === w && nh === h) return; snapshot(); const old = grid; grid = Array.from({ length: nh }, (_, y) => Array.from({ length: nw }, (_, x) => (old[y] && old[y][x] !== undefined) ? old[y][x] : ' ')); w = nw; h = nh; edited(); }
  $('edWm').onclick = () => resize(-1, 0); $('edWp').onclick = () => resize(1, 0); $('edHm').onclick = () => resize(0, -1); $('edHp').onclick = () => resize(0, 1);
  $('edBorder').onclick = () => { snapshot(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) grid[y][x] = '#'; ctx.sfx('click'); edited(); };
  $('edClear').onclick = () => { if (!confirm('Das ganze Level leeren?')) return; snapshot(); grid = blank(w, h); edited(); };
  const doUndo = () => { if (!hist.length) return; redo.push(rows()); const r = hist.pop(); grid = r.map(x => [...x]); h = grid.length; w = grid[0].length; verified = null; stopSolve(); sync(); };
  const doRedo = () => { if (!redo.length) return; hist.push(rows()); const r = redo.pop(); grid = r.map(x => [...x]); h = grid.length; w = grid[0].length; verified = null; sync(); };
  $('edUndo').onclick = doUndo; $('edRedo').onclick = doRedo;
  addEventListener('keydown', e => { if ($('editor').hidden || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); } });
  $('edName').oninput = e => { name = e.target.value; };
  addEventListener('resize', () => { if (!$('editor').hidden) layout(); });
  // ---------------------------------------------------------------- Löser (Web Worker)
  let worker = null, timer = null;
  function stopSolve() { if (worker) { worker.terminate(); worker = null; } clearInterval(timer); if (solving) { solving = null; sync(); } }
  function solveNow() {
    const v = validate(rows()); if (v.errors.length) return; const mobile = matchMedia('(pointer:coarse)').matches, limits = { maxStates: mobile ? 700000 : 1500000, maxMs: mobile ? 25000 : 40000 }; solving = { t0: Date.now() }; sync(); const mine = rows();
    const done = res => { if (!solving) return; const still = rows().join('/') === mine.join('/'); clearInterval(timer); if (worker) { worker.terminate(); worker = null; } solving = null; if (!still) { sync(); return; }
      if (res.solvable === true) { verified = { moves: res.moves, pushes: res.pushes, by: 'löser', path: res.path }; ctx.toast(`Lösbar! Kürzeste Lösung: ${res.moves} Züge.`); ctx.sfx('place'); sync(); }
      else if (res.solvable === false) { sync(); $('edStatus').insertAdjacentHTML('afterbegin', '<div class="ed-line bad">❌ Unlösbar – mit diesem Aufbau kann man das Level nicht schaffen.</div>'); ctx.sfx('blocked'); }
      else { sync(); $('edStatus').insertAdjacentHTML('afterbegin', `<div class="ed-line warn">🤔 Für die automatische Prüfung zu komplex (${res.reason || 'Limit erreicht'}). Teste das Level selbst oder vereinfache es.</div>`); } };
    timer = setInterval(() => { const s = $('edSec'); if (s) s.textContent = Math.round((Date.now() - solving.t0) / 1000); }, 500);
    try { worker = new Worker(new URL('./solve-worker.js', import.meta.url), { type: 'module' }); worker.onmessage = e => done(e.data); worker.onerror = () => { worker = null; fallback(); }; worker.postMessage({ rows: mine, ...limits }); } catch (e) { fallback(); }
    function fallback() { import('../game/solver.js').then(({ solve, pathString }) => { setTimeout(() => { const r = solve(parseLevel({ map: mine }), { maxStates: 300000, maxMs: 8000 }); done(r.solvable === true ? { solvable: true, moves: r.moves, pushes: r.pushes, path: pathString(r.path) } : r); }, 30); }); }
  }
  $('edSolve').onclick = () => { ctx.sfx('click'); solveNow(); };
  // ---------------------------------------------------------------- Testen / Lösung ansehen
  const defNow = () => ({ name: name.trim() || 'Mein Level', world, map: rows(), hint: '', par: verified ? verified.moves : 0 });
  function test(opts) { const v = validate(rows()); if (v.errors.length) return; stopSolve(); ctx.sfx('click'); ctx.playTest(defNow(), Object.assign({ onSolved: r => { if (!verified || r.moves < verified.moves) verified = { moves: r.moves, pushes: r.pushes, by: 'spieler' }; ctx.event && ctx.event('solved'); }, onExit: () => { open(true); } }, opts || {})); }
  $('edTest').onclick = () => test();
  function showSolution() { if (verified && verified.path) test({ autoplay: verified.path }); }
  // ---------------------------------------------------------------- Speichern / Teilen / Meine Level
  const nm = () => (name.trim() || 'Mein Level');
  function save() { const e = Custom.save({ id, name: nm(), world, map: rows(), verified }); id = e.id; ctx.toast('Gespeichert in „Meine Level".'); ctx.sfx('place'); renderList(); ctx.event && ctx.event('save'); return e; }
  $('edSave').onclick = () => { if (validate(rows()).info.w) save(); };
  function shareLink(code) { return location.origin + location.pathname.replace(/index\.html$/, '') + '?code=' + code.slice(8); }
  function openShare(def) { const code = encode(def); $('shCode').value = code; $('shLink').value = shareLink(code); $('shDlg').hidden = false; $('shMsg').textContent = ''; $('shNative').hidden = !navigator.share; }
  $('edShare').onclick = () => { const v = validate(rows()); if (v.errors.length) { ctx.toast('Das Level hat noch Fehler – siehe Statusfeld.'); return; } if (!verified && !confirm('Das Level ist noch nicht als lösbar bestätigt. Trotzdem teilen?\n\n(Tipp: erst „Prüfen" oder „Testen")')) return; openShare(defNow()); };
  const copy = async (el, label) => { try { await navigator.clipboard.writeText(el.value); } catch (e) { el.select(); document.execCommand('copy'); } $('shMsg').textContent = label + ' kopiert ✓'; ctx.sfx('place'); };
  $('shCopyCode').onclick = () => copy($('shCode'), 'Code'); $('shCopyLink').onclick = () => copy($('shLink'), 'Link'); $('shClose').onclick = () => { $('shDlg').hidden = true; };
  $('shIssue').onclick = () => { const code = $('shCode').value, url = 'https://github.com/ricorewioriginal-collab/easygames/issues/new?title=' + encodeURIComponent('Community-Level: ' + nm()) + '&body=' + encodeURIComponent('Name: ' + nm() + '\nAutor: \n\nCode:\n```\n' + code + '\n```\n'); window.open(url, '_blank', 'noopener'); };
  $('shNative').onclick = () => { navigator.share({ title: 'Wobbel-Level: ' + nm(), text: 'Schaffst du mein Wobbel-Level „' + nm() + '"?', url: $('shLink').value }).catch(() => {}); };
  function renderList() {
    const l = Custom.all(), box = $('myList'); if (!box) return;
    box.innerHTML = l.length ? l.map(e => `<div class="my-row" data-id="${e.id}"><div class="my-info"><b>${WORLDS[e.world].emoji} ${esc(e.name)}</b><small>${e.map[0].length}×${e.map.length} · ${e.verified ? '✅ ' + e.verified.moves + ' Züge' : '⏳ ungeprüft'}</small></div><div class="my-btns"><button data-a="play" title="Spielen">▶</button><button data-a="edit" title="Bearbeiten">✏️</button><button data-a="share" title="Teilen">🔗</button><button data-a="del" title="Löschen">🗑</button></div></div>`).join('') : '<p class="info">Noch keine eigenen Level – baue dein erstes im Editor und speichere es!</p>';
    box.querySelectorAll('.my-row').forEach(row => { const e = Custom.get(row.dataset.id); row.querySelectorAll('button').forEach(b => b.onclick = () => { ctx.sfx('click'); const a = b.dataset.a;
      if (a === 'edit') { $('myDlg').hidden = true; load(e.map, e.name, e.world, e.id, e.verified); rebuildPalette(); }
      else if (a === 'play') { $('myDlg').hidden = true; ctx.playTest({ name: e.name, world: e.world, map: e.map, hint: '', par: e.verified ? e.verified.moves : 0 }, { onExit: () => { open(true); $('myDlg').hidden = false; }, onSolved: r => { if (!e.verified || r.moves < e.verified.moves) Custom.save({ id: e.id, verified: { moves: r.moves, pushes: r.pushes, by: 'spieler' } }); } }); }
      else if (a === 'share') openShare({ name: e.name, world: e.world, map: e.map });
      else if (a === 'del') { if (confirm(`„${e.name}" wirklich löschen?`)) { Custom.remove(e.id); if (id === e.id) id = null; renderList(); } } }); });
  }
  $('edMy').onclick = () => { ctx.sfx('click'); renderList(); $('myDlg').hidden = false; }; $('myClose').onclick = () => { $('myDlg').hidden = true; };
  $('myNew').onclick = () => { $('myDlg').hidden = true; newLevel(); };
  $('myImport').onclick = () => { $('imTxt').value = ''; $('imMsg').textContent = ''; $('imDlg').hidden = false; };
  $('imClose').onclick = () => { $('imDlg').hidden = true; };
  $('imOk').onclick = () => { try { const d = decode($('imTxt').value); $('imDlg').hidden = true; $('myDlg').hidden = true; load(d.map, d.name, d.world, null, null); rebuildPalette(); ctx.toast('Level geladen – jetzt prüfen oder testen!'); } catch (e) { $('imMsg').textContent = e.message; } };
  // ---------------------------------------------------------------- Ein-/Ausstieg
  function newLevel() { w = 10; h = 8; grid = blank(w, h); grid[3][2] = '@'; grid[3][4] = '$'; grid[3][7] = '.'; name = ''; world = 0; id = null; verified = null; hist = []; redo = []; $('edName').value = ''; rebuildPalette(); sync(); }
  function open(keep) { $('editor').hidden = false; if (!keep || !grid.length) newLevel(); else { rebuildPalette(); sync(); } requestAnimationFrame(layout); }
  function close() { stopSolve(); $('editor').hidden = true; ['myDlg', 'shDlg', 'imDlg'].forEach(d => { $(d).hidden = true; }); }
  $('edBack').onclick = () => { ctx.sfx('click'); if (hist.length && !confirm('Zurück zum Menü? Nicht gespeicherte Änderungen gehen verloren.')) return; close(); ctx.back(); };
  buildPalette();
  return { open, close, load, isOpen: () => !$('editor').hidden, importCode: decode, state: () => ({ rows: rows(), name, world, verified }) };
}
