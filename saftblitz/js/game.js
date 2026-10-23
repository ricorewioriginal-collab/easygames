/* Saftblitz – Spiel: Grafik (Canvas 2D), Physik, Klingen, Modi, Ton, Menüs.
 * Eingabe: Touch/Maus (wischen), Tastatur (Pfeile/WASD + Shift), Gamecontroller (Sticks, RT/A schneller, Start Pause).
 * In Menüs übernimmt ../gamepad.js das Steuerkreuz; im Spiel wird es angehalten und die Sticks werden hier gelesen. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const P = 'saftblitz-';
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const SET = Object.assign({ sound: true, music: true, hover: false, vib: true, low: false }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const PROG = Object.assign({ total: 0, fruits: 0, games: 0, blade: 'neon', scene: 'studio', ach: {} }, LS.get(P + 'progress', {}));
  const saveProg = () => LS.set(P + 'progress', PROG);
  const REK = LS.get(P + 'rek', {});
  let toastT = 0;
  function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
  const rnd = Math.random;

  /* ---------- Leinwand ---------- */
  const cv = $('c'), cx = cv.getContext('2d'), bgc = $('bg'), bx = bgc.getContext('2d');
  let U = 1, Wd = 1, DPR = 1, CW = 0, CH = 0;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, SET.low ? 1.25 : 2);
    CW = Math.round(innerWidth * DPR); CH = Math.round(innerHeight * DPR);
    for (const c of [cv, bgc]) { c.width = CW; c.height = CH; }
    U = CH; Wd = CW / CH; sprites.clear(); drawScene(bx, CW, CH, PROG.scene);
  }
  addEventListener('resize', resize);

  /* ---------- Grafik: Früchte als vorgezeichnete Bilder ---------- */
  const sprites = new Map();
  const logo = new Image(); logo.src = '../anmacha-solitaire/img/anmacha-logo.png'; logo.onload = () => sprites.clear();
  function seeded(n) { let a = n; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
  function shapePath(g, f, R) {
    g.beginPath();
    if (f.shape === 'oval') g.ellipse(0, 0, R, R * .8, 0, 0, Math.PI * 2);
    else if (f.shape === 'lemon') { g.ellipse(0, 0, R, R * .76, 0, 0, Math.PI * 2); g.moveTo(R * 1.12, 0); g.ellipse(R * .98, 0, R * .16, R * .12, 0, 0, Math.PI * 2); g.moveTo(-R * .86, 0); g.ellipse(-R * .98, 0, R * .16, R * .12, 0, 0, Math.PI * 2); }
    else if (f.shape === 'berry') { g.moveTo(0, R * 1.05); g.bezierCurveTo(-R * .9, R * .5, -R * 1.05, -R * .45, -R * .55, -R * .72); g.quadraticCurveTo(0, -R * .95, R * .55, -R * .72); g.bezierCurveTo(R * 1.05, -R * .45, R * .9, R * .5, 0, R * 1.05); }
    else g.arc(0, 0, R, 0, Math.PI * 2);
    g.closePath();
  }
  function gloss(g, R) { g.save(); g.globalAlpha = .45; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-R * .35, -R * .45, R * .32, R * .16, -.6, 0, Math.PI * 2); g.fill(); g.globalAlpha = .18; g.beginPath(); g.ellipse(-R * .1, -R * .2, R * .62, R * .5, -.6, 0, Math.PI * 2); g.fill(); g.restore(); }
  function leaf(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#3fbf3f'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * .6, -s * .5, s * 1.2, 0); g.quadraticCurveTo(s * .6, s * .4, 0, 0); g.fill(); g.strokeStyle = '#1f7a22'; g.lineWidth = Math.max(1, s * .06); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 1.1, 0); g.stroke(); g.restore(); }
  function drawFruit(g, k, R) {
    const f = SB.FRUITS[k], r = seeded(k.length * 97 + 7);
    const grd = g.createRadialGradient(-R * .35, -R * .4, R * .08, 0, 0, R * 1.05);
    grd.addColorStop(0, f.skin[0]); grd.addColorStop(.6, f.skin[1]); grd.addColorStop(1, f.skin[2]);
    g.save(); shapePath(g, f, R); g.fillStyle = grd; g.fill(); g.clip();
    if (f.stripes) { g.strokeStyle = f.stripes; g.lineWidth = R * .16; g.lineCap = 'round'; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * R * .3, -R); g.bezierCurveTo(i * R * .42, -R * .3, i * R * .18, R * .3, i * R * .3, R); g.stroke(); } }
    if (k === 'orange' || k === 'zitrone') { g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, R * .025, 0, 6.28); g.fill(); } }
    if (k === 'kiwi') { g.strokeStyle = 'rgba(255,230,190,.25)'; g.lineWidth = Math.max(1, R * .02); for (let i = 0; i < 90; i++) { const a = r() * 6.28, d = r() * R; const x = Math.cos(a) * d, y = Math.sin(a) * d * .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R * .05, y + R * .03); g.stroke(); } }
    if (k === 'erdbeere') { g.fillStyle = f.seed; for (let i = 0; i < 26; i++) { const x = (r() - .5) * R * 1.6, y = (r() - .4) * R * 1.6; g.beginPath(); g.ellipse(x, y, R * .035, R * .055, .3, 0, 6.28); g.fill(); } }
    if (k === 'drache') { for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + .3, x = Math.cos(a) * R * .7, y = Math.sin(a) * R * .8; g.fillStyle = '#7fe05a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a + 1.2) * R * .35, y + Math.sin(a + 1.2) * R * .35); g.lineTo(x + Math.cos(a + .4) * R * .18, y + Math.sin(a + .4) * R * .18); g.fill(); } }
    g.restore();
    gloss(g, R);
    if (k === 'apfel' || k === 'pflaume') { g.strokeStyle = '#5a3a1a'; g.lineWidth = R * .09; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -R * .85); g.quadraticCurveTo(R * .05, -R * 1.1, R * .18, -R * 1.22); g.stroke(); leaf(g, R * .12, -R * 1.05, R * .45, -.5); }
    if (k === 'erdbeere') { for (let i = 0; i < 5; i++) leaf(g, 0, -R * .72, R * .45, Math.PI + i * .8 - .3); }
    if (k === 'kiwi' || k === 'zitrone') { }
  }
  function drawInner(g, k, R) { // Schnittfläche
    const f = SB.FRUITS[k], r = seeded(k.length * 31 + 3);
    g.save(); shapePath(g, f, R); g.fillStyle = f.rind; g.fill(); g.clip();
    g.save(); g.scale(.86, .86); shapePath(g, f, R); const gr = g.createRadialGradient(0, 0, R * .1, 0, 0, R); gr.addColorStop(0, '#fff'); gr.addColorStop(.25, f.flesh); gr.addColorStop(1, f.flesh); g.fillStyle = gr; g.fill(); g.restore();
    if (f.segs) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = R * .05; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * .85, Math.sin(a) * R * .85); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(0, 0, R * .1, 0, 6.28); g.fill(); }
    if (k === 'melone') { g.fillStyle = f.seed; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + r() * .3, d = R * (.45 + r() * .2); g.save(); g.translate(Math.cos(a) * d, Math.sin(a) * d); g.rotate(a); g.beginPath(); g.ellipse(0, 0, R * .07, R * .04, 0, 0, 6.28); g.fill(); g.restore(); } }
    if (k === 'kiwi') { g.fillStyle = f.core; g.beginPath(); g.ellipse(0, 0, R * .28, R * .2, 0, 0, 6.28); g.fill(); g.fillStyle = f.seed; for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28, d = R * .4; g.beginPath(); g.ellipse(Math.cos(a) * d, Math.sin(a) * d * .8, R * .04, R * .022, a, 0, 6.28); g.fill(); } }
    if (k === 'apfel') { g.fillStyle = f.seed; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; g.save(); g.rotate(a); g.beginPath(); g.ellipse(0, -R * .2, R * .05, R * .1, 0, 0, 6.28); g.fill(); g.restore(); } }
    if (k === 'pflaume') { g.fillStyle = f.seed; g.beginPath(); g.ellipse(0, 0, R * .3, R * .42, .2, 0, 6.28); g.fill(); }
    if (k === 'erdbeere') { g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.ellipse(0, R * .05, R * .22, R * .5, 0, 0, 6.28); g.fill(); }
    if (k === 'drache') { g.fillStyle = f.seed; for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * .75; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, R * .022, 0, 6.28); g.fill(); } }
    g.restore();
  }
  function drawSpecial(g, k, R) {
    const s = SB.SPECIAL[k];
    if (k === 'bombe') {
      const gr = g.createRadialGradient(-R * .35, -R * .35, R * .05, 0, 0, R); gr.addColorStop(0, '#6a6a7a'); gr.addColorStop(.5, '#24242e'); gr.addColorStop(1, '#0a0a10');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, 6.28); g.fill();
      g.fillStyle = '#8a8a96'; g.fillRect(-R * .25, -R * 1.12, R * .5, R * .3);
      g.strokeStyle = '#c9a26a'; g.lineWidth = R * .1; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -R * 1.1); g.quadraticCurveTo(R * .3, -R * 1.5, R * .55, -R * 1.35); g.stroke();
      g.fillStyle = '#ff3b3b'; g.font = '900 ' + Math.round(R * .9) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✖', 0, R * .08);
      gloss(g, R); return;
    }
    if (k === 'herz') {
      const gr = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R * 1.1); gr.addColorStop(0, '#ffb3d0'); gr.addColorStop(.6, '#ff2d7a'); gr.addColorStop(1, '#9a0a3d');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, R * .95); g.bezierCurveTo(-R * 1.4, -R * .1, -R * .7, -R * 1.2, 0, -R * .45); g.bezierCurveTo(R * .7, -R * 1.2, R * 1.4, -R * .1, 0, R * .95); g.fill(); gloss(g, R * .8); return;
    }
    if (k === 'kokos') {
      const gr = g.createRadialGradient(-R * .35, -R * .4, R * .05, 0, 0, R); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(.5, '#ffc94d'); gr.addColorStop(1, '#a66a00');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, 6.28); g.fill();
      g.save(); g.clip(); g.strokeStyle = 'rgba(120,70,0,.25)'; g.lineWidth = Math.max(1, R * .03); const r = seeded(5); for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * R; g.beginPath(); g.moveTo(Math.cos(a) * d, Math.sin(a) * d); g.lineTo(Math.cos(a) * d + R * .15, Math.sin(a) * d + R * .05); g.stroke(); } g.restore();
      if (logo.complete && logo.naturalWidth) { const w = R * 1.7, h = w * logo.naturalHeight / logo.naturalWidth; g.drawImage(logo, -w / 2, -h / 2, w, h); }
      gloss(g, R); return;
    }
    // Power-Frucht: Glaskugel mit Zeichen
    const gr = g.createRadialGradient(-R * .3, -R * .35, R * .05, 0, 0, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, s.color); gr.addColorStop(1, 'rgba(0,0,0,.6)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, 6.28); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = R * .08; g.beginPath(); g.arc(0, 0, R * .92, 0, 6.28); g.stroke();
    g.fillStyle = '#fff'; g.font = '900 ' + Math.round(R * .95) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(k === 'frost' ? '❄' : k === 'rausch' ? '»' : '×2', 0, R * .05); gloss(g, R);
  }
  function sprite(k, inner) {
    const def = SB.FRUITS[k] || SB.SPECIAL[k], R = Math.max(6, Math.round(def.r * U)), key = k + (inner ? 'i' : '') + R;
    let s = sprites.get(key); if (s) return s;
    const c = document.createElement('canvas'), S = Math.ceil(R * 3.2); c.width = c.height = S;
    const g = c.getContext('2d'); g.translate(S / 2, S / 2);
    if (SB.FRUITS[k]) { if (inner) drawInner(g, k, R); else drawFruit(g, k, R); } else drawSpecial(g, k, R);
    s = { c, S, R }; sprites.set(key, s); return s;
  }

  /* ---------- Schauplätze ---------- */
  function drawScene(g, w, h, k) {
    g.save(); g.clearRect(0, 0, w, h);
    const lin = (a, b, stops) => { const gr = g.createLinearGradient(0, a, 0, b); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
    if (k === 'strand') {
      g.fillStyle = lin(0, h, [[0, '#2a1a5e'], [.45, '#ff6a6a'], [.62, '#ffb36b'], [.63, '#2b8fb3'], [1, '#0d4a6b']]); g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,230,150,.9)'; g.beginPath(); g.arc(w * .7, h * .6, h * .12, Math.PI, 0); g.fill();
      g.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 9; i++) g.fillRect(w * (.45 + i * .05), h * (.65 + i * .03), w * .25, 2);
      g.fillStyle = '#e8c27a'; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(w * .3, h * .82, w * .6, h * .92); g.lineTo(w, h * .88); g.lineTo(w, h); g.fill();
    } else if (k === 'nacht') {
      g.fillStyle = lin(0, h, [[0, '#05031a'], [.7, '#2a0a4a'], [1, '#4a0f4a']]); g.fillRect(0, 0, w, h);
      const r = seeded(3); g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) { g.globalAlpha = r() * .8; g.fillRect(r() * w, r() * h * .6, 2, 2); } g.globalAlpha = 1;
      for (let i = 0; i < 24; i++) { const bw = w / 18, bh = h * (.18 + r() * .35), x = i * bw * .8; g.fillStyle = '#0d0624'; g.fillRect(x, h - bh, bw * .9, bh); g.fillStyle = ['#ff2d95', '#00e5ff', '#ffc94d'][i % 3]; g.globalAlpha = .55; for (let j = 0; j < 8; j++) if (r() < .5) g.fillRect(x + bw * .15 + (j % 2) * bw * .35, h - bh + 10 + (j >> 1) * bh * .2, bw * .2, bh * .06); g.globalAlpha = 1; }
    } else if (k === 'club') {
      g.fillStyle = lin(0, h, [[0, '#140026'], [1, '#05000d']]); g.fillRect(0, 0, w, h);
      const cols = ['rgba(255,45,149,.22)', 'rgba(0,229,255,.2)', 'rgba(139,92,246,.22)', 'rgba(255,201,77,.18)'];
      for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.beginPath(); const x0 = w * (i + .5) / 8; g.moveTo(x0, 0); g.lineTo(x0 - w * .25 + i * w * .02, h); g.lineTo(x0 - w * .12 + i * w * .02, h); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < w; x += h * .08) for (let y = h * .7; y < h; y += h * .08) g.fillRect(x + 2, y + 2, h * .08 - 4, h * .08 - 4);
    } else { // Funkstudio
      g.fillStyle = lin(0, h, [[0, '#2a1240'], [1, '#120a24']]); g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.035)'; const s = h * .09; for (let y = 0; y < h; y += s) for (let x = (y / s % 2) * s / 2; x < w; x += s) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + s / 2, y + s / 2); g.lineTo(x, y + s); g.lineTo(x - s / 2, y + s / 2); g.fill(); }
      const m = Math.min(w, h);
      g.fillStyle = '#ff2d2d'; g.shadowColor = '#ff2d2d'; g.shadowBlur = m * .03; const bw = m * .26, bh = m * .06; g.globalAlpha = .8; g.fillRect(w - bw - m * .04, h - bh - m * .05, bw, bh); g.shadowBlur = 0;
      g.fillStyle = '#fff'; g.font = '900 ' + Math.round(bh * .6) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', w - bw / 2 - m * .04, h - bh / 2 - m * .05); g.globalAlpha = 1;
      g.fillStyle = 'rgba(0,0,0,.35)'; for (const x of [m * .05, w - m * .17]) { g.fillRect(x, h * .25, m * .12, m * .28); g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.arc(x + m * .06, h * .25 + m * .07, m * .04, 0, 6.28); g.arc(x + m * .06, h * .25 + m * .19, m * .05, 0, 6.28); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; }
    }
    const v = g.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, Math.max(w, h) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.restore();
  }

  /* ---------- Ton ---------- */
  let AC = null, master = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .8; master.connect(AC.destination); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  let noiseBuf = null;
  function noise() { if (!noiseBuf) { const n = AC.sampleRate * .5; noiseBuf = AC.createBuffer(1, n, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; }
  function nz(t, dur, f0, f1, vol, type) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noise(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .02); }
  function tone(t, f, dur, vol, type, f2) { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02); }
  let lastSwish = 0;
  function sfx(k, x) {
    if (!SET.sound || !ac()) return; const t = AC.currentTime;
    if (k === 'swish') { if (t - lastSwish < .12) return; lastSwish = t; nz(t, .14, 900, 4000, .12); }
    else if (k === 'slice') { nz(t, .08, 3000, 1200, .25); nz(t + .02, .18, 600, 200, .18, 'lowpass'); tone(t, 220 + (x || 0) * 40, .08, .05, 'triangle', 120); }
    else if (k === 'combo') { [0, 1, 2, 3].forEach(i => tone(t + i * .06, 523 * Math.pow(1.26, i), .12, .08, 'triangle')); }
    else if (k === 'crit') { tone(t, 1318, .25, .09, 'square', 1975); }
    else if (k === 'bomb') { nz(t, .9, 1200, 60, .7, 'lowpass'); tone(t, 90, .6, .4, 'sine', 30); }
    else if (k === 'miss') { tone(t, 330, .25, .08, 'sawtooth', 160); }
    else if (k === 'power') { [0, 1, 2].forEach(i => tone(t + i * .07, 784 * Math.pow(1.335, i), .2, .08, 'sine')); }
    else if (k === 'perfect') { tone(t, 1046, .1, .07, 'triangle'); tone(t + .05, 1568, .12, .06, 'triangle'); }
    else if (k === 'kokos') { tone(t, 600 + (x || 0) * 50, .07, .07, 'square'); }
    else if (k === 'start') { [0, 1, 2].forEach(i => tone(t + i * .1, 392 * Math.pow(1.26, i), .14, .08, 'triangle')); }
    else if (k === 'end') { [0, 1, 2, 3].forEach(i => tone(t + i * .12, 784 / Math.pow(1.19, i), .2, .07, 'triangle')); }
    else if (k === 'fuse') { nz(t, .05, 5000, 3000, .03); }
  }
  // Radio-Rhythmus: Beat wird im Browser erzeugt (Bassdrum, Klatschen, Hi-Hat, Bass)
  const MUS = { on: false, bpm: 112, t0: 0, next: 0, step: 0 };
  const BASS = [45, 0, 45, 0, 48, 0, 45, 43, 41, 0, 41, 0, 43, 0, 40, 0];
  function musicStart(bpm) { MUS.bpm = bpm; MUS.p0 = performance.now() / 1000 + .15; if (!ac()) return; MUS.on = true; MUS.bpm = bpm; MUS.t0 = AC.currentTime + .15; MUS.next = MUS.t0; MUS.step = 0; }
  function musicStop() { MUS.on = false; }
  function musicTick() {
    if (!MUS.on || !AC) return; const st = 60 / MUS.bpm / 4;
    while (MUS.next < AC.currentTime + .15) {
      const t = MUS.next, s = MUS.step % 16, play = SET.music && SET.sound && G.state === 'play';
      if (play) {
        if (s % 4 === 0) tone(t, 140, .22, .5, 'sine', 40);
        if (s === 4 || s === 12) nz(t, .16, 1800, 900, .22);
        if (s % 2 === 0) nz(t, .04, 9000, 7000, .05, 'highpass');
        if (BASS[s]) tone(t, 440 * Math.pow(2, (BASS[s] - 69) / 12) * 2, st * 1.8, .12, 'sawtooth');
      }
      MUS.next += st; MUS.step++;
    }
  }
  const beatLen = () => 60 / MUS.bpm;
  function beatPhase() { // Audio-Uhr, wenn der Ton läuft; sonst die normale Uhr
    if (AC && AC.state === 'running' && MUS.on) return (AC.currentTime - MUS.t0) / beatLen();
    return (performance.now() / 1000 - MUS.p0) / beatLen();
  }

  /* ---------- Spielzustand ---------- */
  const G = { state: 'menu', mode: 'klassik', t: 0, ents: [], halves: [], parts: [], pops: [], splats: [], pend: [], score: [0, 0], lives: 3, time: 0, level: 0, waveT: 0, sinceWave: 0,
    slow: 0, frost: 0, rausch: 0, rauschT: 0, dopp: 0, shake: 0, flash: 0, over: 0, r: null, beatN: -1, streak: 0, kokosDone: false, paused: false };
  const M = () => SB.MODES[G.mode];
  const duo = () => G.mode === 'duo';
  function newRound(mode) {
    G.mode = mode; G.state = 'play'; G.t = 0; G.ents = []; G.halves = []; G.parts = []; G.pops = []; G.splats = []; G.pend = []; G.score = [0, 0];
    G.lives = M().lives; G.time = M().time; G.level = 0; G.waveT = .8; G.sinceWave = 0; G.slow = 0; G.frost = 0; G.rausch = 0; G.dopp = 0; G.shake = 0; G.flash = 0; G.over = 0;
    G.streak = 0; G.kokosDone = false; G.beatN = -1; G.paused = false;
    G.r = { mode, score: 0, fruits: 0, maxCombo: 0, crit: 0, bombs: 0, power: 0, kokos: 0, perfect: 0, missed: 0 };
    blades.clear();
    if (mode === 'rhythmus') musicStart(SB.MODES.rhythmus.bpm); else musicStop();
    ['ovEnd', 'ovPause'].forEach(id => { $(id).hidden = true; });
    $('sMenu').classList.remove('on'); $('hud').hidden = false; $('hDuo').hidden = !duo(); $('hScore').parentNode.hidden = duo();
    hudBest(); padNav(false); sfx('start');
  }
  function hudBest() { const b = REK[G.mode]; $('hBest').textContent = b && !duo() ? 'Rekord ' + b : ''; }
  const half = () => Wd / 2;
  function spawnWave(p) {
    const W = duo() ? half() : Wd, ox = duo() ? p * half() : 0;
    const list = SB.wave(G.mode, G.level, W, rnd, { lives: G.lives, late: G.time > 0 && G.time < 18, kokosDone: G.kokosDone, rausch: G.rausch > 0 });
    for (const s of list) { s.x += ox; s.p = p; if (s.type === 'kokos') G.kokosDone = true; G.pend.push(s); }
  }
  function addEnt(s) {
    const def = SB.FRUITS[s.type] || SB.SPECIAL[s.type];
    G.ents.push({ type: s.type, x: s.x, y: s.y, vx: s.vx, vy: s.vy, a: rnd() * 6.28, va: s.rot, r: def.r, p: s.p || 0, hits: 0, frozen: 0, alive: true, fruit: !!SB.FRUITS[s.type] });
    if (s.type === 'bombe') sfx('fuse');
  }

  /* ---------- Klingen ---------- */
  const blades = new Map(); // id -> { p, pts: [{x,y,t}], on, last, sw: { hits, at, x, y }, kind, cx, cy }
  function blade(id, p, kind) { let b = blades.get(id); if (!b) { b = { id, p, pts: [], on: false, last: null, sw: null, kind, cx: Wd / 2, cy: .6, idle: 0 }; blades.set(id, b); } return b; }
  function bladeMove(b, x, y, now) {
    const l = b.last;
    b.pts.push({ x, y, t: now }); if (b.pts.length > 40) b.pts.shift();
    if (l) {
      const d = Math.hypot(x - l.x, y - l.y), dt = Math.max(1e-3, now - l.t);
      if (d / dt > .5 && d > .003) { cut(b, l.x, l.y, x, y, now); if (d / dt > 1.6) sfx('swish'); b.idle = 0; }
    }
    b.last = { x, y, t: now };
  }
  function bladeEnd(b) { finishSwipe(b); b.on = false; b.last = null; }
  function finishSwipe(b) {
    const s = b.sw; b.sw = null; if (!s || !s.hits) return;
    if (s.hits >= 3) {
      const bonus = s.hits * (G.dopp > 0 ? 2 : 1); add(b.p, bonus); G.r.maxCombo = Math.max(G.r.maxCombo, s.hits);
      pop(s.x, s.y - .05, s.hits + 'er-Combo +' + bonus, '#FFC94D', 1.3); sfx('combo'); G.slow = Math.max(G.slow, .25);
    }
  }
  function add(p, n) { G.score[p] = Math.max(0, G.score[p] + n); }
  function pop(x, y, txt, col, sc) { G.pops.push({ x, y, txt, col, sc: sc || 1, life: 1 }); }
  function cut(b, ax, ay, bx2, by, now) {
    if (G.state !== 'play' && G.state !== 'menu') return;
    const ang = Math.atan2(by - ay, bx2 - ax);
    for (const e of G.ents) {
      if (!e.alive) continue;
      if (G.state === 'play' && duo() && e.p !== b.p) continue;
      if (!SB.segHit(ax, ay, bx2, by, e.x, e.y, e.r * 1.08)) continue;
      if (e.type === 'kokos' && G.state === 'play') { hitKokos(e, b, now); continue; }
      e.alive = false;
      if (G.state === 'menu') { sliceFx(e, ang); continue; }
      if (e.type === 'bombe') { boom(e, b.p); continue; }
      sliceFx(e, ang);
      if (!e.fruit) { power(e, b.p); continue; }
      G.r.fruits++; PROG.fruits++;
      const sw = b.sw || (b.sw = { hits: 0, x: e.x, y: e.y }); sw.hits++; sw.x = e.x; sw.y = e.y;
      let crit = M().crit && rnd() < 1 / 32, onBeat = false;
      if (M().beat) { const ph = beatPhase(), d = Math.abs(ph - Math.round(ph)) * beatLen(); onBeat = d < .1; if (onBeat) { G.streak++; G.r.perfect++; } else G.streak = 0; }
      const sc = SB.scoreSwipe(1, { crit, onBeat, streak: G.streak, doppelt: G.dopp > 0 });
      add(b.p, sc.pts);
      if (crit) { G.r.crit++; pop(e.x, e.y, 'Kritisch! +' + sc.pts, '#ff4d6a', 1.4); sfx('crit'); }
      else if (onBeat) { pop(e.x, e.y, 'Perfekt! +' + sc.pts + (G.streak > 3 ? ' · ' + G.streak + 'er Serie' : ''), '#00E5FF', 1.1); sfx('perfect'); }
      else pop(e.x, e.y, '+' + sc.pts, '#fff', .8);
      sfx('slice', sw.hits);
    }
  }
  function sliceFx(e, ang) {
    const f = SB.FRUITS[e.type], col = f ? f.juice : (SB.SPECIAL[e.type].color || '#fff');
    if (f) for (const side of [-1, 1]) {
      const nx = -Math.sin(ang) * side, ny = Math.cos(ang) * side;
      G.halves.push({ type: e.type, x: e.x + nx * e.r * .2, y: e.y + ny * e.r * .2, vx: e.vx * .6 + nx * .35, vy: Math.min(e.vy, 0) * .4 + ny * .35 - .15, a: ang, va: side * (2 + rnd() * 3), side, life: 3 });
    }
    const n = SET.low ? 8 : 18;
    for (let i = 0; i < n; i++) { const a = rnd() * 6.28, v = .2 + rnd() * .7; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v + e.vx * .3, vy: Math.sin(a) * v - .2, r: e.r * (.06 + rnd() * .12), col, life: .5 + rnd() * .5 }); }
    if (!SET.low) for (let i = 0; i < 6; i++) { // Saftflecken: bleiben farbig und blenden aus
      const a = rnd() * 6.28, d = rnd() * e.r * 1.3; G.splats.push({ x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, r: e.r * (.18 + rnd() * .34), col, life: 2.2 + rnd() });
    }
    if (G.splats.length > 90) G.splats.splice(0, G.splats.length - 90);
  }
  function boom(e, p) {
    G.r.bombs++; G.shake = .5; G.flash = .6; sfx('bomb');
    if (SET.vib && navigator.vibrate) try { navigator.vibrate(220); } catch (x) { }
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, v = .3 + rnd() * 1.2; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: .008 + rnd() * .012, col: i % 2 ? '#ffb13b' : '#ff4d1a', life: .6 + rnd() * .5 }); }
    if (M().bombs === 'aus') { G.over = 1.2; pop(e.x, e.y, 'BUMM!', '#ff4d1a', 2); }
    else { add(p, -10); pop(e.x, e.y, '−10', '#ff4d1a', 1.6); }
  }
  function power(e, p) {
    G.r.power++; sfx('power');
    if (e.type === 'herz') { G.lives = Math.min(M().lives, G.lives + 1); pop(e.x, e.y, '+1 Leben', '#ff3d7f', 1.3); return; }
    if (e.type === 'frost') { G.frost = 5; pop(e.x, e.y, 'Frost!', '#7fe8ff', 1.5); }
    if (e.type === 'rausch') { G.rausch = 4.5; G.rauschT = 0; pop(e.x, e.y, 'Rausch!', '#ff8a1f', 1.5); }
    if (e.type === 'doppelt') { G.dopp = 6; pop(e.x, e.y, 'Doppelte Punkte!', '#ffd84d', 1.5); }
    void p;
  }
  function hitKokos(e, b, now) {
    if (now - (e.lastHit || 0) < .07) return;
    e.lastHit = now;
    if (!e.frozen) { e.frozen = 2.6; e.vx = 0; e.vy = 0; G.slow = 0; }
    e.hits++; add(b.p, G.dopp > 0 ? 2 : 1); sfx('kokos', e.hits); G.shake = .12;
    pop(e.x + (rnd() - .5) * .1, e.y - e.r - .02, '+' + (G.dopp > 0 ? 2 : 1), '#FFC94D', 1);
    for (let i = 0; i < 6; i++) { const a = rnd() * 6.28; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * .6, vy: Math.sin(a) * .6, r: .006, col: '#ffe27a', life: .4 }); }
    if (e.hits >= SB.SPECIAL.kokos.hits) kokosBurst(e, b.p);
  }
  function kokosBurst(e, p) {
    if (!e.alive) return; e.alive = false; G.r.kokos++;
    const bonus = e.hits * (G.dopp > 0 ? 2 : 1); add(p, bonus); pop(e.x, e.y, 'Gold-Kokosnuss +' + bonus, '#FFC94D', 1.8); sfx('combo');
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, v = .3 + rnd(); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: .006 + rnd() * .01, col: i % 3 ? '#ffc94d' : '#fff', life: .8 }); }
  }

  /* ---------- Hauptschleife ---------- */
  let lastT = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    pollPads(dt, now / 1000);
    keyBlade(dt, now / 1000);
    musicTick();
    if (G.state === 'play' && !G.paused) step(dt, now / 1000);
    else if (G.state === 'menu') demo(dt);
    draw(now / 1000);
  }
  function step(dt0, now) {
    let ts = 1; if (G.frost > 0) ts = .45; if (G.slow > 0) ts = Math.min(ts, .55);
    const dt = dt0 * ts;
    G.t += dt0; G.slow = Math.max(0, G.slow - dt0); G.frost = Math.max(0, G.frost - dt0); G.dopp = Math.max(0, G.dopp - dt0); G.shake = Math.max(0, G.shake - dt0); G.flash = Math.max(0, G.flash - dt0);
    G.level = SB.levelOf(G.mode, G.t, Math.max(G.score[0], G.score[1]));
    if (G.over > 0) { G.over -= dt0; if (G.over <= 0) end(); physics(dt); return; }
    if (M().time) { G.time -= dt0; if (G.time <= 0) { G.time = 0; end(); return; } }
    // Wellen
    const players = duo() ? [0, 1] : [0];
    if (M().beat) {
      const n = Math.floor(beatPhase()); // jeder 2. Schlag: Wurf, Gipfel genau 2 Schläge später
      if (n !== G.beatN && n >= 0) { G.beatN = n; if (n % 2 === 0) beatWave(); }
    } else {
      G.sinceWave += dt;
      const active = G.ents.filter(e => e.alive).length + G.pend.length;
      if ((active === 0 && (G.waveT -= dt) <= 0) || G.sinceWave > 3.4 - G.level * 1.6) { players.forEach(spawnWave); G.waveT = .35 + rnd() * .5; G.sinceWave = 0; }
    }
    if (G.rausch > 0) { G.rausch -= dt0; G.rauschT -= dt0; if (G.rauschT <= 0) { G.rauschT = .55; players.forEach(spawnWave); } }
    for (const s of G.pend) s.delay -= dt;
    G.pend = G.pend.filter(s => { if (s.delay <= 0) { addEnt(s); return false; } return true; });
    physics(dt);
    // Swipes beenden, wenn eine Klinge kurz still steht
    for (const [, b] of blades) { b.idle += dt0; if (b.sw && b.idle > .16) finishSwipe(b); }
    void now;
  }
  function beatWave() {
    const W = Wd, L = .9 * beatLen() * 2, h = .5 * SB.G * L * L; // Gipfelzeit = 2 Schläge
    const n = 1 + Math.round(G.level * 3 + rnd() * 1.5);
    for (let k = 0; k < n; k++) {
      const x0 = W * (.12 + rnd() * .76), s = SB.launch(rnd, W, Math.max(.08, 1.12 - h), x0);
      s.type = SB.FRUIT_KEYS[(rnd() * SB.FRUIT_KEYS.length) | 0]; s.delay = 0; s.p = 0; G.pend.push(s);
    }
    if (rnd() < .12 + G.level * .25) { const s = SB.launch(rnd, W, .2, W * (.2 + rnd() * .6)); s.type = 'bombe'; s.delay = 0; G.pend.push(s); }
    if (rnd() < .08) { const s = SB.launch(rnd, W, .18, W * (.3 + rnd() * .4)); s.type = ['frost', 'doppelt'][(rnd() * 2) | 0]; s.delay = 0; G.pend.push(s); }
  }
  function physics(dt) {
    const g = SB.G;
    for (const e of G.ents) {
      if (!e.alive) continue;
      if (e.frozen > 0) { e.frozen -= dt; e.a += dt * 6; if (e.frozen <= 0) kokosBurst(e, 0); continue; }
      e.vy += g * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.a += e.va * dt;
      if (e.y > 1.25 && e.vy > 0) {
        e.alive = false;
        if (G.state === 'play' && e.fruit) { G.r.missed++; if (G.mode === 'klassik' && G.over <= 0) { G.lives--; sfx('miss'); pop(Math.max(.06, Math.min(Wd - .06, e.x)), .92, '✖', '#ff3b3b', 1.6); if (G.lives <= 0) G.over = .9; } }
      }
    }
    G.ents = G.ents.filter(e => e.alive);
    for (const h of G.halves) { h.vy += g * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.a += h.va * dt; h.life -= dt; }
    G.halves = G.halves.filter(h => h.y < 1.4 && h.life > 0);
    for (const q of G.parts) { q.vy += g * .8 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
    G.parts = G.parts.filter(q => q.life > 0);
    for (const q of G.pops) { q.y -= dt * .08; q.life -= dt * .9; }
    G.pops = G.pops.filter(q => q.life > 0);
    for (const q of G.splats) q.life -= dt; G.splats = G.splats.filter(q => q.life > 0);
    if (G.parts.length > 400) G.parts.splice(0, G.parts.length - 400);
  }
  // Menü: Früchte schweben durchs Bild und lassen sich zum Spaß zerschneiden
  let demoT = 0;
  function demo(dt) {
    demoT -= dt;
    if (demoT <= 0 && G.ents.length < 5) { demoT = .9 + rnd(); const s = SB.launch(rnd, Wd, .1 + rnd() * .3, Wd * (.1 + rnd() * .8)); s.type = SB.FRUIT_KEYS[(rnd() * SB.FRUIT_KEYS.length) | 0]; addEnt(s); }
    physics(dt * .8);
  }

  /* ---------- Zeichnen ---------- */
  function drawSprite(s, x, y, a, sc) { cx.save(); cx.translate(x * U, y * U); cx.rotate(a); if (sc && sc !== 1) cx.scale(sc, sc); cx.drawImage(s.c, -s.S / 2, -s.S / 2); cx.restore(); }
  function draw(now) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, CW, CH);
    const sh = G.shake > 0 ? G.shake * U * .03 : 0;
    cx.translate((rnd() - .5) * sh, (rnd() - .5) * sh);
    for (const q of G.splats) { cx.globalAlpha = Math.min(.55, q.life * .3); cx.fillStyle = q.col; cx.beginPath(); cx.arc(q.x * U, q.y * U, q.r * U, 0, 6.28); cx.fill(); }
    cx.globalAlpha = 1;
    if (G.state === 'play' && M().beat) { const ph = beatPhase(), f = 1 - (ph - Math.floor(ph)); cx.fillStyle = 'rgba(0,229,255,' + (f * f * .08) + ')'; cx.fillRect(0, 0, CW, CH); }
    if (duo() && G.state === 'play') { cx.fillStyle = 'rgba(255,255,255,.14)'; cx.fillRect(CW / 2 - 1, 0, 2, CH); }
    for (const h of G.halves) {
      const s = sprite(h.type, true); cx.save(); cx.translate(h.x * U, h.y * U); cx.rotate(h.a); cx.beginPath();
      if (h.side < 0) cx.rect(-s.S / 2, -s.S / 2, s.S, s.S / 2); else cx.rect(-s.S / 2, 0, s.S, s.S / 2);
      cx.clip(); cx.globalAlpha = Math.min(1, h.life); cx.drawImage(s.c, -s.S / 2, -s.S / 2); cx.restore();
    }
    for (const e of G.ents) {
      const s = sprite(e.type);
      if (e.type === 'bombe') { const pu = .5 + .5 * Math.sin(now * 12); cx.save(); cx.globalAlpha = .35 + pu * .3; cx.fillStyle = '#ff2d2d'; cx.beginPath(); cx.arc(e.x * U, e.y * U, e.r * U * (1.35 + pu * .15), 0, 6.28); cx.fill(); cx.restore(); }
      else if (!e.fruit && e.type !== 'herz') { cx.save(); cx.globalAlpha = .3 + .2 * Math.sin(now * 6); cx.fillStyle = SB.SPECIAL[e.type].color; cx.beginPath(); cx.arc(e.x * U, e.y * U, e.r * U * 1.45, 0, 6.28); cx.fill(); cx.restore(); }
      drawSprite(s, e.x, e.y, e.type === 'bombe' ? e.a * .3 : e.a, e.frozen > 0 ? 1 + .05 * Math.sin(now * 40) : 1);
      if (e.type === 'bombe') { const fx = e.x * U + Math.cos(e.a * .3 - 1) * e.r * U * 1.4, fy = e.y * U + Math.sin(e.a * .3 - 1) * e.r * U * 1.4; cx.fillStyle = rnd() < .5 ? '#fff6a0' : '#ff9a1f'; cx.beginPath(); cx.arc(fx, fy, e.r * U * (.15 + rnd() * .15), 0, 6.28); cx.fill(); }
    }
    for (const q of G.parts) { cx.globalAlpha = Math.min(1, q.life * 2); cx.fillStyle = q.col; cx.beginPath(); cx.arc(q.x * U, q.y * U, q.r * U, 0, 6.28); cx.fill(); }
    cx.globalAlpha = 1;
    drawBlades(now);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (const q of G.pops) {
      const fs = Math.round(U * .042 * q.sc); cx.font = 'italic 900 ' + fs + 'px system-ui'; cx.globalAlpha = Math.min(1, q.life * 1.6);
      const tw = cx.measureText(q.txt).width, px = Math.max(tw / 2 + 8, Math.min(CW - tw / 2 - 8, q.x * U)), py = Math.max(fs, Math.min(CH - fs, q.y * U));
      cx.lineWidth = fs * .16; cx.strokeStyle = 'rgba(0,0,0,.7)'; cx.strokeText(q.txt, px, py); cx.fillStyle = q.col; cx.fillText(q.txt, px, py);
    }
    cx.globalAlpha = 1;
    if (G.frost > 0) { cx.fillStyle = 'rgba(127,232,255,' + (.12 + .04 * Math.sin(now * 3)) + ')'; cx.fillRect(-20, -20, CW + 40, CH + 40); }
    if (G.flash > 0) { cx.fillStyle = 'rgba(255,255,255,' + (G.flash * .8) + ')'; cx.fillRect(-20, -20, CW + 40, CH + 40); }
    if (G.state === 'play') hud();
  }
  const bladeDef = k => SB.BLADES.find(b => b.k === k) || SB.BLADES[0];
  function drawBlades(now) {
    const def = bladeDef(PROG.blade);
    for (const [, b] of blades) {
      const pts = b.pts.filter(q => now - q.t < .13); b.pts = pts;
      if (b.kind !== 'ptr' && G.state === 'play' && now - (b.used || 0) < 4) { cx.strokeStyle = b.p ? 'rgba(255,45,149,.8)' : 'rgba(0,229,255,.8)'; cx.lineWidth = U * .004; cx.beginPath(); cx.arc(b.cx * U, b.cy * U, U * .018, 0, 6.28); cx.stroke(); }
      if (pts.length < 2) continue;
      const wmax = U * .016;
      for (const pass of [0, 1]) {
        cx.beginPath();
        const L = [], R = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], dx = c.x - a.x, dy = c.y - a.y, l = Math.hypot(dx, dy) || 1;
          let w = wmax * (i / (pts.length - 1)) * (pass ? .45 : 1.6);
          let jx = 0, jy = 0; if (def.zap) { jx = (rnd() - .5) * .006; jy = (rnd() - .5) * .006; }
          L.push([(pts[i].x + jx) * U - dy / l * w, (pts[i].y + jy) * U + dx / l * w]); R.push([(pts[i].x + jx) * U + dy / l * w, (pts[i].y + jy) * U - dx / l * w]);
        }
        cx.moveTo(L[0][0], L[0][1]); for (const q of L) cx.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) cx.lineTo(R[i][0], R[i][1]); cx.closePath();
        let col;
        if (def.rainbow) { const gr = cx.createLinearGradient(L[0][0], L[0][1], L[L.length - 1][0], L[L.length - 1][1]); const h0 = (now * 200) % 360; for (let k = 0; k <= 4; k++) gr.addColorStop(k / 4, 'hsla(' + ((h0 + k * 70) % 360) + ',100%,' + (pass ? 85 : 60) + '%,' + (pass ? 1 : .45) + ')'); col = gr; }
        else col = pass ? def.c[0] : def.c[1];
        if (duo() && G.state === 'play' && !pass) col = b.p ? 'rgba(255,45,149,.55)' : 'rgba(0,229,255,.55)';
        cx.globalAlpha = pass ? 1 : .55; cx.fillStyle = col; cx.fill();
      }
      cx.globalAlpha = 1;
      if (def.spark && !SET.low && rnd() < .6) { const h = pts[pts.length - 1]; G.parts.push({ x: h.x, y: h.y, vx: (rnd() - .5) * .4, vy: (rnd() - .5) * .4, r: .003 + rnd() * .003, col: def.c[1], life: .3 }); }
    }
  }
  let hudCache = '';
  function hud() {
    const t = Math.ceil(G.time), lives = M().lives ? Array.from({ length: M().lives }, (_, i) => '<span class="' + (i >= G.lives ? 'x' : '') + '">✖</span>').join('') : '';
    const pw = [G.frost > 0 ? '<span style="color:#7fe8ff">❄ ' + G.frost.toFixed(1) + '</span>' : '', G.rausch > 0 ? '<span style="color:#ff8a1f">» ' + G.rausch.toFixed(1) + '</span>' : '', G.dopp > 0 ? '<span style="color:#ffd84d">×2 ' + G.dopp.toFixed(1) + '</span>' : ''].join('');
    const center = M().beat && G.streak > 1 ? '📻 Serie ' + G.streak : '';
    const key = G.score.join() + '|' + lives + '|' + t + '|' + pw + '|' + center;
    if (key === hudCache) return; hudCache = key;
    $('hScore').textContent = G.score[0]; $('d1').textContent = G.score[0]; $('d2').textContent = G.score[1];
    $('hLives').innerHTML = lives; $('hTime').textContent = M().time ? Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') : ''; $('hTime').classList.toggle('low', M().time && t <= 10);
    $('hPow').innerHTML = pw; $('hCenter').textContent = center;
  }

  /* ---------- Rundenende ---------- */
  function end() {
    if (G.state !== 'play') return;
    G.state = 'end'; musicStop(); sfx('end');
    for (const [, b] of blades) finishSwipe(b);
    const r = G.r; r.score = duo() ? Math.max(G.score[0], G.score[1]) : G.score[0];
    PROG.games++; PROG.total += duo() ? G.score[0] + G.score[1] : r.score;
    const before = { blades: SB.BLADES.filter(b => b.need <= PROG.total - r.score).length, scenes: SB.SCENES.filter(s => s.need <= PROG.total - r.score).length };
    let rec = false;
    if (!duo() && r.score > (REK[G.mode] || 0)) { REK[G.mode] = r.score; rec = true; LS.set(P + 'rek', REK); }
    if (G.mode === 'klassik') LS.set(P + 'highscore', REK.klassik || 0);
    const fresh = SB.ACH.filter(a => !PROG.ach[a[0]] && a[2](r, PROG));
    fresh.forEach(a => { PROG.ach[a[0]] = Date.now(); });
    saveProg();
    $('eTitle').textContent = duo() ? (G.score[0] === G.score[1] ? 'Unentschieden!' : 'Spieler ' + (G.score[0] > G.score[1] ? 1 : 2) + ' gewinnt!') : (G.r.bombs && M().bombs === 'aus' ? '💥 Bombe erwischt!' : G.mode === 'klassik' ? 'Keine Leben mehr' : 'Zeit ist um!');
    $('eScore').textContent = duo() ? G.score[0] + ' : ' + G.score[1] : r.score;
    $('eRec').textContent = rec ? '🏆 Neuer Rekord im Modus ' + M().n + '!' : (REK[G.mode] && !duo() ? 'Rekord: ' + REK[G.mode] : '');
    $('eFacts').innerHTML = '<li>Früchte<b>' + r.fruits + '</b></li><li>Beste Combo<b>' + (r.maxCombo || '–') + '</b></li>' +
      (M().crit ? '<li>Kritisch<b>' + r.crit + '</b></li>' : '') + (M().beat ? '<li>Perfekt im Takt<b>' + r.perfect + '</b></li>' : '') + (M().power ? '<li>Power-Früchte<b>' + r.power + '</b></li>' : '') +
      (G.mode === 'klassik' ? '<li>Verpasst<b>' + r.missed + '</b></li>' : '') + '<li>Gesamtpunkte<b>' + PROG.total + '</b></li>';
    const after = { blades: SB.BLADES.filter(b => b.need <= PROG.total).length, scenes: SB.SCENES.filter(s => s.need <= PROG.total).length };
    const news = fresh.map(a => '<div>🏅 ' + a[1] + '</div>');
    if (after.blades > before.blades) news.push('<div>🗡️ Neue Klinge: ' + SB.BLADES[after.blades - 1].n + '</div>');
    if (after.scenes > before.scenes) news.push('<div>🌆 Neuer Schauplatz: ' + SB.SCENES[after.scenes - 1].n + '</div>');
    $('eAch').innerHTML = news.join('');
    setTimeout(() => { $('ovEnd').hidden = false; padNav(true); focus($('eAgain')); }, 500);
  }

  /* ---------- Menüs ---------- */
  function toMenu() {
    G.state = 'menu'; musicStop(); G.ents = []; G.halves = []; G.pend = []; G.pops = []; G.splats = []; blades.clear();
    ['ovEnd', 'ovPause'].forEach(id => { $(id).hidden = true; }); $('hud').hidden = true; $('sMenu').classList.add('on'); padNav(true); menuStat(); focus(document.querySelector('.mode'));
  }
  function menuStat() {
    document.querySelectorAll('.mode').forEach(b => { const v = REK[b.dataset.m]; let x = b.querySelector('.rk'); if (v) { if (!x) { x = document.createElement('span'); x.className = 'rk'; b.querySelector('b').appendChild(x); } x.textContent = '🏆 ' + v; } });
    const n = Object.keys(PROG.ach).length;
    $('menuStat').textContent = PROG.games ? PROG.fruits + ' Früchte · ' + PROG.total + ' Punkte gesamt · ' + n + '/' + SB.ACH.length + ' Erfolge' : 'Tipp: Schneide die Früchte im Hintergrund!';
  }
  function pause(on) {
    if (G.state !== 'play') return; G.paused = on; $('ovPause').hidden = !on; padNav(on);
    if (on) { $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; focus($('pGo')); if (AC) AC.suspend(); } else if (AC && SET.sound) AC.resume();
  }
  const focus = el => { if (el && !('ontouchstart' in window && !usedPad)) try { el.focus({ preventScroll: true }); } catch (e) { } };
  $('modes').onclick = e => { const b = e.target.closest('.mode'); if (b) { ac(); newRound(b.dataset.m); } };
  $('bPause').onclick = () => pause(true);
  $('pGo').onclick = () => pause(false);
  $('pRe').onclick = () => { $('ovPause').hidden = true; newRound(G.mode); };
  $('pSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('pQuit').onclick = () => { G.state = 'end'; toMenu(); };
  $('eAgain').onclick = () => newRound(G.mode);
  $('eMenu').onclick = toMenu;
  $('bHelp').onclick = () => { $('ovHelp').hidden = false; focus($('helpX')); }; $('helpX').onclick = () => { $('ovHelp').hidden = true; };
  $('bSet').onclick = () => { $('sSound').checked = SET.sound; $('sMusic').checked = SET.music; $('sHover').checked = SET.hover; $('sVib').checked = SET.vib; $('sLow').checked = SET.low; $('ovSet').hidden = false; focus($('setX')); };
  $('setX').onclick = () => { const low = SET.low; SET.sound = $('sSound').checked; SET.music = $('sMusic').checked; SET.hover = $('sHover').checked; SET.vib = $('sVib').checked; SET.low = $('sLow').checked; saveSet(); $('ovSet').hidden = true; if (low !== SET.low) resize(); };
  $('bAch').onclick = () => {
    $('achList').innerHTML = SB.ACH.map(a => '<li class="' + (PROG.ach[a[0]] ? 'done' : '') + '">' + (PROG.ach[a[0]] ? '🏅' : '🔒') + ' ' + a[1] + '</li>').join('');
    $('ovAch').hidden = false; focus($('achX'));
  };
  $('achX').onclick = () => { $('ovAch').hidden = true; };
  $('bColl').onclick = () => { renderColl(); $('ovColl').hidden = false; focus($('collX')); };
  $('collX').onclick = () => { $('ovColl').hidden = true; };
  function renderColl() {
    const next = SB.BLADES.concat(SB.SCENES).filter(x => x.need > PROG.total).sort((a, b) => a.need - b.need)[0];
    $('collInfo').textContent = PROG.total + ' Punkte gesamt' + (next ? ' · nächste Freischaltung bei ' + next.need : ' · alles freigeschaltet!');
    const item = (x, kind) => { const lock = x.need > PROG.total, on = (kind === 'b' ? PROG.blade : PROG.scene) === x.k; return '<button class="itm' + (on ? ' on' : '') + (lock ? ' lock' : '') + '" data-kind="' + kind + '" data-k="' + x.k + '"' + (lock ? ' aria-disabled="true"' : '') + '><canvas width="240" height="112"></canvas><b>' + x.n + '</b><small>' + (lock ? '🔒 ab ' + x.need + ' Punkten' : on ? '✓ gewählt' : 'wählen') + '</small></button>'; };
    $('collBlades').innerHTML = SB.BLADES.map(x => item(x, 'b')).join(''); $('collScenes').innerHTML = SB.SCENES.map(x => item(x, 's')).join('');
    document.querySelectorAll('.itm').forEach(el => {
      const c = el.querySelector('canvas'), g = c.getContext('2d'), k = el.dataset.k;
      if (el.dataset.kind === 's') { drawScene(g, 240, 112, k); return; }
      const d = bladeDef(k); g.fillStyle = '#160b2e'; g.fillRect(0, 0, 240, 112);
      for (const pass of [0, 1]) { g.beginPath(); g.moveTo(20, 86); g.quadraticCurveTo(120, -10, 220, 40); g.lineWidth = pass ? 5 : 14; g.lineCap = 'round';
        if (d.rainbow) { const gr = g.createLinearGradient(20, 0, 220, 0); ['#ff3b3b', '#ffc94d', '#2ee6a0', '#00e5ff', '#8b5cf6'].forEach((cc, i) => gr.addColorStop(i / 4, cc)); g.strokeStyle = gr; g.globalAlpha = pass ? 1 : .5; } else { g.strokeStyle = pass ? d.c[0] : d.c[1]; g.globalAlpha = pass ? 1 : .55; } g.stroke(); }
      g.globalAlpha = 1;
    });
  }
  $('ovColl').addEventListener('click', e => {
    const b = e.target.closest('.itm'); if (!b || b.classList.contains('lock')) return;
    if (b.dataset.kind === 'b') PROG.blade = b.dataset.k; else { PROG.scene = b.dataset.k; drawScene(bx, CW, CH, PROG.scene); }
    saveProg(); renderColl(); focus(document.querySelector('.itm[data-k="' + b.dataset.k + '"]'));
  });

  /* ---------- Eingabe: Zeiger ---------- */
  let lastPtrType = 'mouse';
  const wx = e => e.clientX * DPR / U, wy = e => e.clientY * DPR / U;
  function ptrPlayer(e) { return G.state === 'play' && duo() ? (wx(e) < half() ? 0 : 1) : 0; }
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('button, .card, input, a, label')) return;
    lastPtrType = e.pointerType; ac();
    const b = blade('ptr' + e.pointerId, ptrPlayer(e), 'ptr'); b.on = true; b.last = null; b.p = ptrPlayer(e); bladeMove(b, wx(e), wy(e), performance.now() / 1000);
  });
  document.addEventListener('pointermove', e => {
    lastPtrType = e.pointerType;
    let b = blades.get('ptr' + e.pointerId);
    if (!b && e.pointerType === 'mouse' && SET.hover) { b = blade('ptr' + e.pointerId, ptrPlayer(e), 'ptr'); b.on = true; }
    if (!b || !b.on) return;
    if (e.pointerType === 'mouse' && !SET.hover && !(e.buttons & 1)) { bladeEnd(b); return; }
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const q of evs.length ? evs : [e]) bladeMove(b, wx(q), wy(q), (q.timeStamp || performance.now()) / 1000);
  });
  const ptrUp = e => { const b = blades.get('ptr' + e.pointerId); if (b && !(e.pointerType === 'mouse' && SET.hover)) { bladeEnd(b); blades.delete('ptr' + e.pointerId); } };
  document.addEventListener('pointerup', ptrUp); document.addEventListener('pointercancel', ptrUp);

  /* ---------- Eingabe: Tastatur ---------- */
  const keys = new Set();
  addEventListener('keydown', e => {
    const k = e.key;
    if (G.state === 'play' && !G.paused) {
      if (k === 'Escape' || k === 'p' || k === 'P') { e.preventDefault(); pause(true); return; }
      if (/^(Arrow|w$|a$|s$|d$|W$|A$|S$|D$|Shift)/.test(k)) { e.preventDefault(); keys.add(k.toLowerCase()); }
      return;
    }
    const ov = Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
    if (k === 'Escape') { if (ov && ov.id === 'ovPause') { e.preventDefault(); pause(false); } else if (ov && ov.id !== 'ovEnd') { e.preventDefault(); ov.hidden = true; } }
  });
  addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); });
  addEventListener('blur', () => keys.clear());
  function keyBlade(dt, now) {
    if (G.state !== 'play' || G.paused) return;
    let dx = 0, dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx--; if (keys.has('arrowright') || keys.has('d')) dx++;
    if (keys.has('arrowup') || keys.has('w')) dy--; if (keys.has('arrowdown') || keys.has('s')) dy++;
    if (!dx && !dy) { const b0 = blades.get('kbd'); if (b0 && b0.on) bladeEnd(b0); return; }
    const b = blade('kbd', 0, 'kbd'); b.used = now;
    const sp = (keys.has('shift') ? 2.6 : 1.5), l = Math.hypot(dx, dy);
    b.cx = Math.max(0, Math.min(Wd, b.cx + dx / l * sp * dt)); b.cy = Math.max(0, Math.min(1, b.cy + dy / l * sp * dt)); b.on = true;
    bladeMove(b, b.cx, b.cy, now);
  }

  /* ---------- Eingabe: Gamecontroller ---------- */
  let usedPad = false; const padPrev = {};
  function padNav(on) { if (window.EasyGamesPad && EasyGamesPad.enabled) try { EasyGamesPad.enabled(on); } catch (e) { } }
  function pollPads(dt, now) {
    const list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : [];
    if (!list.length) return;
    list.forEach((pad, idx) => {
      const prev = padPrev[pad.index] || {}, btn = i => pad.buttons[i] && pad.buttons[i].pressed;
      const start = btn(9);
      if (start && !prev.start) { usedPad = true; if (G.state === 'play') pause(!G.paused); }
      padPrev[pad.index] = { start };
      if (G.state !== 'play' || G.paused) return;
      const ax = pad.axes || [], dz = v => Math.abs(v) < .18 ? 0 : v;
      let x = dz(ax[0] || 0), y = dz(ax[1] || 0); const x2 = dz(ax[2] || 0), y2 = dz(ax[3] || 0);
      if (Math.hypot(x2, y2) > Math.hypot(x, y)) { x = x2; y = y2; }
      if (btn(14)) x = -1; if (btn(15)) x = 1; if (btn(12)) y = -1; if (btn(13)) y = 1;
      const pl = duo() ? (lastPtrType === 'mouse' && list.length === 1 ? 1 : Math.min(1, idx)) : 0;
      const b = blade('pad' + pad.index, pl, 'pad'); b.p = pl;
      if (!b.init) { b.init = true; b.cx = duo() ? (pl + .5) * half() : Wd / 2; b.cy = .55; }
      if (!x && !y) { if (b.on) bladeEnd(b); return; }
      usedPad = true; b.used = now;
      const boost = btn(7) || btn(0) || btn(5) ? 1.9 : 1, sp = 1.9 * boost * Math.min(1, Math.hypot(x, y) * 1.2);
      const l = Math.hypot(x, y); b.cx = Math.max(0, Math.min(Wd, b.cx + x / l * sp * dt)); b.cy = Math.max(0, Math.min(1, b.cy + y / l * sp * dt)); b.on = true;
      bladeMove(b, b.cx, b.cy, now);
    });
  }
  addEventListener('gamepadconnected', () => { usedPad = true; toast('🎮 Controller verbunden – Stick führt die Klinge, RT/A schneller'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play' && !G.paused) pause(true); });

  /* ---------- Start ---------- */
  if (window.self !== window.top) $('backLink').hidden = true;
  resize(); menuStat(); requestAnimationFrame(frame);
  if (!PROG.games && !LS.get(P + 'seenHelp', false)) { LS.set(P + 'seenHelp', true); }
  setTimeout(() => padNav(true), 500);
  window.SAFTBLITZ = { state: () => ({ state: G.state, mode: G.mode, score: G.score.slice(), lives: G.lives, time: G.time, ents: G.ents.map(e => ({ type: e.type, x: e.x, y: e.y, r: e.r, p: e.p })), cursors: Array.from(blades.values()).filter(b => b.kind !== 'ptr').map(b => ({ id: b.id, x: b.cx, y: b.cy })) }), unit: () => U / DPR, end: () => end() }; // für Tests
})();
