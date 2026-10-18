/* AnMaCha UNDERCOVER 3D – Oberfläche der 24 Mini-Aufgaben (DOM). Logik/Prüfung: AMU.Tasks (src/core/tasks.js).
   AMU.TaskUI.open(id, { container, seed, diff, sfx(name), onDone(acts), onCancel(), lang }) → { close() }
   Bedienung: Zeiger (Maus/Touch), Tastatur: Pfeile = Fokus bewegen, ←/→ bzw. +/- = Regler, Enter/Leertaste = auslösen, Esc = abbrechen. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  // Farbe + Form (farbenblind-freundlich)
  const SYM = [['#ff5a5a', '▲', 'Rot'], ['#3fd06b', '●', 'Grün'], ['#4c8dff', '■', 'Blau'], ['#ffd23f', '◆', 'Gelb'],
    ['#c77dff', '★', 'Lila'], ['#ff9a2e', '✚', 'Orange'], ['#29d3ff', '⬟', 'Cyan'], ['#f4f4f4', '♥', 'Weiß']];
  const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const MHz = f => (f / 10).toFixed(1).replace('.', ',');
  const BUS = 'ABCD';
  const CAT = { mic: ['🎙', 'Mikrofone'], music: ['🎵', 'Musik'], phone: ['☎', 'Telefon & Leitungen'], fx: ['✨', 'Jingles & Effekte'] };
  const POWER = ['NIEDRIG', 'MITTEL', 'HOCH'];

  const CSS = `
.amt-root{--cy:#29d3ff;--or:#ff9a2e;--ok:#3fd06b;--bad:#ff5a5a;--tx:#e8f1ff;--mu:#a9bce0;--pn:#1b2f63;
 box-sizing:border-box;position:relative;width:min(560px,92vw);max-height:80vh;overflow:auto;overscroll-behavior:contain;margin:0 auto;
 background:linear-gradient(160deg,#13224a,#0b1630);color:var(--tx);border:1px solid #29d3ff55;border-radius:16px;
 box-shadow:0 0 24px #29d3ff2e,inset 0 0 30px #0006;padding:12px 14px;font:15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
 -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.amt-root *{box-sizing:border-box}
.amt-head{display:flex;align-items:center;gap:8px}
.amt-ic{font-size:26px;line-height:1}
.amt-title{flex:1;margin:0;font-size:18px;color:var(--cy);text-shadow:0 0 8px #29d3ff66}
.amt-hint{margin:6px 0 8px;color:var(--mu);font-size:14px}
.amt-pbar{height:6px;background:#0008;border-radius:3px;overflow:hidden;margin-bottom:10px}
.amt-pbar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--cy),var(--or));transition:width .25s}
.amt-body{display:flex;flex-direction:column;gap:8px}
.amt-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px}
.amt-msg{flex:1 1 100%;min-height:19px;font-size:14px;color:var(--mu)}.amt-msg.amt-bad{color:var(--bad);font-weight:700}
.amt-btn{min-height:44px;min-width:44px;padding:6px 10px;border-radius:10px;border:1px solid #29d3ff44;background:var(--pn);color:var(--tx);
 font:inherit;font-size:15px;cursor:pointer;touch-action:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;
 transition:transform .08s,background .15s,box-shadow .15s;position:relative}
.amt-btn:active{transform:scale(.96)}.amt-btn:disabled{cursor:default}
.amt-kb .amt-focus{outline:3px solid var(--or);outline-offset:2px;box-shadow:0 0 14px var(--or);z-index:1}
.amt-x{background:#3a1530;border-color:#ff5a5a77}
.amt-main{background:linear-gradient(#1f7194,#145070);border-color:var(--cy);font-weight:700;width:100%}
.amt-sel{border-color:var(--or)!important;background:#4a3010!important;box-shadow:0 0 10px #ff9a2e88}
.amt-okc{border-color:var(--ok);background:#123a26}
.amt-wrong{border-color:var(--bad)!important;background:#4a1520!important}
.amt-dis{opacity:.6}
.amt-card{background:#07102acc;border:1px solid #29d3ff33;border-radius:10px;padding:8px 10px;font-size:14px}
.amt-card b{color:var(--or)}
.amt-sub{font-size:14px;color:var(--mu);margin:2px 0}
.amt-row{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.amt-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.amt-col{display:flex;flex-direction:column;gap:6px}
.amt-grid{--cs:min(48px,calc((92vw - 30px - var(--n,5) * 3px)/var(--n,5)));display:grid;gap:3px;justify-content:center}
.amt-badge{position:absolute;top:-2px;font-size:13px;line-height:1;pointer-events:none}
.amt-cell{width:var(--cs);height:var(--cs);min-width:0;min-height:0;padding:0;font-size:18px;border-radius:7px}
.amt-mk{width:22px;display:flex;align-items:center;justify-content:center;font-size:18px}
.amt-sym{font-size:20px;line-height:1;text-shadow:0 0 6px currentColor}
.amt-big .amt-sym{font-size:30px}
.amt-li{display:flex;align-items:center;gap:8px;width:100%;justify-content:flex-start;text-align:left}
.amt-grow{flex:1}.amt-val{color:var(--cy);font-variant-numeric:tabular-nums}
.amt-num{color:var(--mu);min-width:22px}
.amt-tag{font-size:12px;padding:1px 6px;border-radius:6px;background:#0008;color:var(--mu)}
.amt-sl{display:block;width:100%;padding:6px 10px;text-align:left}
.amt-sl-lab{display:flex;justify-content:space-between;gap:8px;font-size:14px;margin-bottom:6px}
.amt-sl-tr{position:relative;height:22px;border-radius:11px;background:#06102a;border:1px solid #29d3ff33}
.amt-sl-band{position:absolute;top:-1px;bottom:-1px;background:#3fd06b44;border:1px solid var(--ok);border-radius:6px}
.amt-sl-fill{position:absolute;left:0;top:0;bottom:0;background:#29d3ff2a;border-radius:11px}
.amt-sl-kn{position:absolute;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:var(--cy);box-shadow:0 0 10px var(--cy)}
.amt-sl.amt-ok .amt-sl-kn{background:var(--ok);box-shadow:0 0 10px var(--ok)}
.amt-meter{height:14px;border-radius:7px;background:#06102a;border:1px solid #29d3ff33;overflow:hidden}
.amt-meter>i{display:block;height:100%;background:linear-gradient(90deg,var(--bad),var(--or),var(--ok))}
.amt-lit{background:#fff3!important;border-color:#fff!important;box-shadow:0 0 18px #fff,0 0 30px var(--cy)!important;transform:scale(1.06)}
.amt-on{background:linear-gradient(#ffb24d,#e07a10)!important;color:#1a0f00;border-color:#ffd9a0;box-shadow:0 0 14px #ff9a2eaa}
.amt-beam{background:#0f4a66!important;box-shadow:inset 0 0 10px var(--cy)}
.amt-pow{background:#3a2a0e!important}
.amt-h1{background:#7a1a1a!important}.amt-h2{background:#7a4a12!important}.amt-h3{background:#5a5a18!important}.amt-h4{background:#1a3a5a!important}
.amt-mir{display:block;width:70%;height:4px;border-radius:2px;background:var(--cy);box-shadow:0 0 8px var(--cy)}
.amt-disp{font-size:30px;font-weight:800;text-align:center;color:var(--cy);font-variant-numeric:tabular-nums;text-shadow:0 0 12px #29d3ff88}
.amt-fview{height:76px;border-radius:10px;background:radial-gradient(#1b2f63,#06102a);display:flex;align-items:center;justify-content:center;overflow:hidden}
.amt-ftxt{font-size:30px;font-weight:900;color:var(--or);letter-spacing:2px}
.amt-dial{width:132px;height:132px;border-radius:50%;margin:0 auto;padding:0;background:radial-gradient(circle at 40% 35%,#2b4a8f,#0b1630);border:2px solid var(--cy)}
.amt-dial>i{position:absolute;left:50%;top:8px;width:6px;height:40px;margin-left:-3px;border-radius:3px;background:var(--or);box-shadow:0 0 10px var(--or);transform-origin:3px 58px}
.amt-svg{width:100%;max-height:200px;display:block}
.amt-bat{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:56px}
.amt-cells{display:flex;flex-direction:column-reverse;gap:2px;width:40px;padding:3px;border:2px solid var(--mu);border-radius:6px}
.amt-cells>i{display:block;height:9px;border-radius:2px;background:#0008}
.amt-cells>i.b{background:#3fd06b88}.amt-cells>i.p{background:var(--or)}
.amt-band{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:70px;font-size:12px;color:var(--mu)}
.amt-band>i{display:block;width:70%;border-radius:3px 3px 0 0;background:#29d3ff44}
.amt-band.n>i{background:var(--bad)}.amt-band.v>i{background:var(--ok)}.amt-band.cut>i{opacity:.35}
.amt-strip{display:grid;gap:2px;flex:1}.amt-strip>i{height:14px;border-radius:3px;background:#0008}.amt-strip>i.c{background:var(--cy)}
.amt-on .amt-strip>i.c{background:#1a0f00}
.amt-shake{animation:amt-sh .35s;box-shadow:0 0 0 2px var(--bad),0 0 26px #ff5a5a88}
@keyframes amt-sh{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.amt-okov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:34px;font-weight:800;color:var(--ok);
 background:#0b1630d0;border-radius:16px;text-shadow:0 0 16px #3fd06b;z-index:5}
.amt-win .amt-okov{display:flex;animation:amt-pop .6s ease-out}
@keyframes amt-pop{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.08)}100%{transform:scale(1)}}
.amt-spin{animation:amt-rot 1.2s linear infinite;transform-origin:80px 85px}
@keyframes amt-rot{to{transform:rotate(360deg)}}
@media (max-width:420px){.amt-root{padding:10px 8px}.amt-title{font-size:16px}.amt-disp{font-size:24px}}
@media (prefers-reduced-motion:reduce){.amt-shake,.amt-win .amt-okov,.amt-spin{animation:none}}`;

  function injectCss(doc) {
    if (doc.getElementById('amt-task-css')) return;
    const s = doc.createElement('style'); s.id = 'amt-task-css'; s.textContent = CSS; (doc.head || doc.documentElement).appendChild(s);
  }

  // ---------- Aufgaben-Oberflächen: render(c, body, st) ----------
  const UI = {};

  UI.pegel = {
    render(c, b, st) {
      for (let i = 0; i < st.n; i++) c.slider(b, { k: 'f' + i, label: 'Kanal ' + (i + 1), sym: i, value: st.v[i], min: 0, max: 100, step: 4, big: 12,
        band: [st.lo[i], st.hi[i]], ok: c.L.ok(st, i), fmt: v => v + ' %', on: v => c.act({ t: 'set', i, v }) });
    },
    status: (c, st) => st.v.filter((v, i) => c.L.ok(st, i)).length + '/' + st.n + ' Regler im grünen Bereich'
  };

  UI.kabel = {
    render(c, b, st) {
      const L = c.local; if (L.l == null) L.l = -1;
      const w = c.el('div', 'amt-two', null, b), cl = c.el('div', 'amt-col', null, w), cr = c.el('div', 'amt-col', null, w);
      c.el('div', 'amt-sub', 'Stecker', cl); c.el('div', 'amt-sub', 'Buchsen', cr);
      st.left.forEach((kind, i) => {
        const done = st.conn[i] !== -1;
        const bt = c.btn(cl, 'l' + i, null, done ? null : () => { L.l = L.l === i ? -1 : i; c.sfx('click'); c.refresh(); },
          'amt-li' + (L.l === i ? ' amt-sel' : '') + (done ? ' amt-okc' : ''));
        c.sym(kind, bt); c.el('span', 'amt-grow', SYM[kind][2], bt); c.el('span', 'amt-tag', done ? '✓ ' + (i + 1) : '🔌', bt);
      });
      st.right.forEach((kind, r) => {
        const l = st.conn.indexOf(r);
        const bt = c.btn(cr, 'r' + r, null, l !== -1 ? null : () => {
          if (L.l < 0) { c.msg('Wähle zuerst links einen Stecker.'); return; }
          const sel = L.l; L.l = -1; c.act({ t: 'link', l: sel, r });
        }, 'amt-li' + (l !== -1 ? ' amt-okc' : ''));
        c.el('span', 'amt-tag', l !== -1 ? '✓ ' + (l + 1) : '◎', bt); c.el('span', 'amt-grow', SYM[kind][2], bt); c.sym(kind, bt);
      });
    },
    errMsg: () => 'Passt nicht – Farbe und Form müssen gleich sein.'
  };

  UI.playlist_sort = {
    retry: true,
    render(c, b, st) {
      const L = c.local; if (L.s == null) L.s = -1;
      c.el('div', 'amt-card', 'Sortieren nach ' + (st.key === 'bpm' ? 'Tempo (BPM)' : 'Länge') + ' – ' +
        (st.dir > 0 ? 'aufsteigend ↑ (kleinster Wert oben)' : 'absteigend ↓ (größter Wert oben)'), b);
      const list = c.el('div', 'amt-col', null, b);
      st.order.forEach((it, pos) => {
        const t = st.items[it];
        const bt = c.btn(list, 'p' + pos, null, () => {
          if (L.s < 0) { L.s = pos; c.sfx('click'); c.refresh(); return; }
          const i = L.s; L.s = -1; if (i === pos) c.refresh(); else c.act({ t: 'swap', i, j: pos });
        }, 'amt-li' + (L.s === pos ? ' amt-sel' : ''));
        c.el('span', 'amt-num', (pos + 1) + '.', bt); c.el('span', 'amt-grow', t.title, bt);
        c.el('span', 'amt-val', st.key === 'bpm' ? t.bpm + ' BPM' : mmss(t.sec), bt);
      });
    },
    status: (c, st) => c.local.s >= 0 ? 'Jetzt den Zielplatz wählen.' : 'Titel wählen, dann Zielplatz – sie tauschen.'
  };

  UI.fokus = {
    render(c, b, st) {
      const sharp = c.L.sharp(st), L = c.local;
      const v = c.el('div', 'amt-fview', null, b), t = c.el('div', 'amt-ftxt', 'ANMACHA FM', v);
      t.style.filter = 'blur(' + ((100 - sharp) / 8).toFixed(1) + 'px)';
      c.meter(b, 'Schärfe ' + sharp + ' %', sharp);
      const d = c.btn(b, 'dial', null, null, 'amt-dial', {
        adj: (dir, big) => c.act({ t: 'turn', d: dir * (big ? 15 : 2) }),
        drag(e, el, start) {
          const r = el.getBoundingClientRect(), ang = Math.atan2(e.clientX - r.left - r.width / 2, r.top + r.height / 2 - e.clientY) * 180 / Math.PI;
          if (start || L.last == null) { L.last = ang; return; }
          const dd = Math.round(((ang - L.last + 540) % 360) - 180);
          if (dd) { L.last += dd; c.act({ t: 'turn', d: dd }); }
        }
      });
      c.el('i', null, null, d).style.transform = 'rotate(' + st.a + 'deg)';
      c.btn(b, 'lock', '🔒 Fokus fixieren', () => c.act({ t: 'lock' }), 'amt-main');
    },
    status: () => 'Drehknopf ziehen oder ←/→ drücken.',
    errMsg: () => 'Noch unscharf – weiter drehen!'
  };

  UI.frequenz = {
    render(c, b, st) {
      const card = c.el('div', 'amt-card', null, b);
      st.targets.forEach((f, i) => c.el('div', null, (i < st.idx ? '✓ ' : i === st.idx ? '▶ ' : '· ') + st.names[i] + ' – ' + MHz(f) + ' MHz', card));
      c.el('div', 'amt-disp', MHz(st.f) + ' MHz', b);
      c.slider(b, { k: 'sl', label: 'Abstimmung', value: st.f, min: 875, max: 1080, step: 1, big: 10, fmt: v => MHz(v), on: v => c.act({ t: 'step', d: v - st.f }) });
      const row = c.el('div', 'amt-row', null, b);
      [[-10, '−1,0'], [-1, '−0,1'], [1, '+0,1'], [10, '+1,0']].forEach(([d, lab]) => c.btn(row, 's' + d, lab, () => c.act({ t: 'step', d })));
      c.btn(b, 'lock', '💾 Sender speichern', () => c.act({ t: 'lock' }), 'amt-main');
    },
    status: (c, st) => 'Gespeichert: ' + st.idx + '/' + st.k,
    errMsg: () => 'Frequenz stimmt nicht exakt.'
  };

  UI.mikro = {
    render(c, b, st) {
      const card = c.el('div', 'amt-card', 'Prüfliste: ', b);
      st.order.forEach((ch, k) => { const s = c.el('b', null, (k < st.pos ? '✓' : k === st.pos ? '▶' : '') + 'K' + (ch + 1) + ' ', card); if (k !== st.pos) s.style.color = k < st.pos ? 'var(--ok)' : 'var(--mu)'; });
      const g = c.grid(b, 4, 'amt-big');
      st.layout.forEach(ch => {
        const ok = st.order.indexOf(ch) < st.pos;
        const bt = c.btn(g, 'm' + ch, null, () => c.act({ t: 'press', c: ch }), 'amt-col' + (ok ? ' amt-okc' : ''));
        bt.style.minHeight = '64px'; c.el('span', null, '🎙', bt); c.el('b', null, 'K' + (ch + 1), bt);
      });
    },
    status: (c, st) => st.pos + '/' + st.n + ' Kanäle geprüft',
    errMsg: () => 'Falscher Kanal – Prüfung beginnt von vorn.'
  };

  UI.signal = {
    render(c, b, st) {
      const g = c.grid(b, st.W, 'amt-sq');
      for (let y = 0; y < st.H; y++) for (let x = 0; x < st.W; x++) {
        const v = st.g[y * st.W + x];
        c.btn(g, 'c' + x + '_' + y, v < 0 ? '·' : v === 0 ? '⚡' : String(v), v < 0 ? () => c.act({ t: 'probe', x, y }) : null,
          'amt-cell' + (v === 0 ? ' amt-wrong' : v > 0 ? ' amt-h' + Math.min(4, v) : ''));
      }
    },
    status: (c, st) => 'Defekte: ' + c.L.found(st) + '/' + st.K + ' · Messungen: ' + st.probes + ' · Zahl = Schritte zum nächsten Defekt'
  };

  function wireSvg(m, on) {
    const col = on ? '#ff9a2e' : '#6f86b8', seg = ['M20 20V0', 'M20 20H40', 'M20 20V40', 'M20 20H0'];
    return '<svg viewBox="0 0 40 40" width="100%" height="100%">' + seg.filter((s, k) => m & (1 << k)).map(s => '<path d="' + s + '" stroke="' + col +
      '" stroke-width="7" stroke-linecap="round"/>').join('') + '<circle cx="20" cy="20" r="5" fill="' + col + '"/></svg>';
  }
  UI.strom = {
    retry: true,
    render(c, b, st) {
      const f = c.L.flow(st), g = c.grid(b, st.N, null, true);
      for (let y = 0; y < st.N; y++) {
        c.el('div', 'amt-mk', y === st.sr ? '⚡' : '', g);
        for (let x = 0; x < st.N; x++) {
          const i = y * st.N + x, bt = c.btn(g, 't' + i, null, () => c.act({ t: 'rot', i }), 'amt-cell' + (f.on[i] ? ' amt-pow' : ''));
          bt.innerHTML = wireSvg(st.t[i], f.on[i]);
        }
        c.el('div', 'amt-mk', y === st.lr ? (f.lit ? '💡' : '○') : '', g);
      }
    },
    status: (c, st) => 'Drehungen: ' + st.moves
  };

  UI.schalter = {
    render(c, b, st) {
      const L = c.local;
      if (st.phase === 'show' && !L.play) {
        L.play = true; L.lit = -1; let t = 600;
        st.seq.slice(0, st.round).forEach(s => {
          c.later(() => { L.lit = s; c.sfx('click'); c.refresh(); }, t);
          c.later(() => { L.lit = -1; c.refresh(); }, t + 420); t += 640;
        });
        c.later(() => { L.play = false; c.act({ t: 'ready' }, { silent: true }); }, t);
      }
      const g = c.grid(b, 3, 'amt-big');
      for (let i = 0; i < st.n; i++) {
        const bt = c.btn(g, 's' + i, null, () => {
          if (st.phase !== 'input') return;
          L.fl = i; c.later(() => { if (L.fl === i) { L.fl = -1; c.refresh(); } }, 220); c.act({ t: 'press', i });
        }, 'amt-col' + (L.lit === i || L.fl === i ? ' amt-lit' : ''));
        bt.style.minHeight = '70px'; c.sym(i, bt); c.el('span', 'amt-tag', 'S' + (i + 1), bt);
      }
    },
    status: (c, st) => st.phase === 'show' ? '👀 Merken … Runde ' + st.round + '/' + st.L : '👉 Wiederholen: ' + st.pos + '/' + st.round + ' (Runde ' + st.round + '/' + st.L + ')',
    errMsg: () => 'Falsch! Die Folge wird wiederholt.'
  };

  UI.platte = {
    render(c, b, st) {
      const tip = a => [185 - 120 * Math.sin(a * Math.PI / 180), 15 + 120 * Math.cos(a * Math.PI / 180)], [tx, ty] = tip(st.ta), [ax, ay] = tip(st.arm);
      c.el('div', null, null, b).innerHTML = '<svg class="amt-svg" viewBox="0 0 200 160"><g class="' + (st.on ? 'amt-spin' : '') + '">' +
        '<circle cx="80" cy="85" r="65" fill="#111" stroke="#29d3ff55"/>' + [58, 50, 42, 34].map(r => '<circle cx="80" cy="85" r="' + r + '" fill="none" stroke="#333"/>').join('') +
        '<circle cx="80" cy="85" r="22" fill="#ff9a2e"/></g><text x="80" y="91" text-anchor="middle" font-size="17" font-weight="800" fill="#1a0f00">' + st.ts + '</text>' +
        '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="5" fill="none" stroke="#ff9a2e" stroke-width="2.5"/>' +
        '<line x1="185" y1="15" x2="' + ax.toFixed(1) + '" y2="' + ay.toFixed(1) + '" stroke="#cfe" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="185" cy="15" r="8" fill="#29d3ff"/><circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="3" fill="#29d3ff"/></svg>';
      c.slider(b, { k: 'arm', label: 'Tonarm', value: st.arm, min: 0, max: 45, step: 1, big: 5, fmt: v => v + '°', on: v => c.act({ t: 'arm', d: v - st.arm }) });
      const row = c.el('div', 'amt-row', null, b); c.el('span', 'amt-sub', 'Drehzahl:', row);
      [33, 45].forEach(v => c.btn(row, 'sp' + v, v + ' U/min', () => c.act({ t: 'speed', v }), st.sp === v ? 'amt-sel' : ''));
      if (st.hasW) {
        c.el('div', 'amt-card', 'Auflagekraft laut Karte: ' + (st.tw / 10).toFixed(1).replace('.', ',') + ' g', b);
        c.slider(b, { k: 'w', label: 'Auflagekraft', value: st.w, min: 5, max: 35, step: 1, big: 5, fmt: v => (v / 10).toFixed(1).replace('.', ',') + ' g', on: v => c.act({ t: 'weight', d: v - st.w }) });
      }
      c.btn(b, 'go', '▶ Start', () => c.act({ t: 'start' }), 'amt-main');
    },
    status: () => 'Nadelspitze in den orangen Ring, Drehzahl wie auf dem Etikett.',
    errMsg: (c, st) => { const p = c.L.parts(st); return !p[0] ? 'Nadel sitzt nicht auf der Einlaufrille.' : !p[1] ? 'Falsche Drehzahl – schau aufs Etikett.' : 'Auflagekraft stimmt nicht.'; }
  };

  UI.kanaele = {
    retry: true,
    render(c, b, st) {
      const card = c.el('div', 'amt-card', null, b); c.el('div', 'amt-sub', 'Patch-Plan', card);
      st.cats.forEach((k, ci) => { const d = c.el('div', null, CAT[k][0] + ' ' + CAT[k][1] + ' → ', card); c.el('b', null, 'Bus ' + BUS[st.patch[ci]], d); });
      st.inputs.forEach((inp, i) => {
        const row = c.el('div', 'amt-row' + (st.wrong.includes(i) ? ' amt-wrong' : ''), null, b);
        row.style.cssText = 'justify-content:space-between;align-items:center;border-radius:10px;padding:2px 4px;border:1px solid transparent';
        c.el('span', 'amt-grow', CAT[st.cats[inp.c]][0] + ' ' + inp.name, row);
        for (let k = 0; k < st.nb; k++) c.btn(row, 'i' + i + 'b' + k, BUS[k], () => c.act({ t: 'set', i, b: k }), st.route[i] === k ? 'amt-sel' : '');
      });
      c.btn(b, 'chk', '✔ Routing prüfen', () => c.act({ t: 'check' }), 'amt-main');
    },
    errMsg: (c, st) => st.wrong.length + ' Eingang/Eingänge falsch geroutet (rot markiert).'
  };

  UI.paket = {
    render(c, b, st) {
      const card = c.el('div', 'amt-card', null, b); c.el('div', 'amt-sub', '📒 Hausverzeichnis', card);
      st.roles.forEach((ro, k) => { const d = c.el('div', null, ro + ' → ', card); c.el('b', null, st.rooms[st.dir[k]], d); });
      if (st.pos < st.q.length) {
        const p = c.el('div', 'amt-disp', null, b); p.style.fontSize = '20px';
        p.textContent = '📦 Paket #' + st.nums[st.pos] + ' – An: ' + st.roles[st.q[st.pos]];
      }
      const g = c.grid(b, 2);
      st.rooms.forEach((rm, r) => c.btn(g, 'r' + r, '🚪 ' + rm, () => c.act({ t: 'send', r })));
    },
    status: (c, st) => 'Zugestellt: ' + st.pos + '/' + st.q.length,
    errMsg: () => 'Falscher Raum – schau ins Hausverzeichnis.'
  };

  UI.kuehlung = {
    retry: true,
    render(c, b, st) {
      const h = st.heat[st.step % st.heat.length], cool = c.L.cool(st), pct = v => ((v - 10) / 89 * 100).toFixed(1) + '%';
      c.el('div', 'amt-disp', st.T + ' °C', b).style.color = st.T >= st.lo && st.T <= st.hi ? 'var(--ok)' : st.T > st.hi ? 'var(--or)' : 'var(--cy)';
      const tr = c.el('div', 'amt-sl-tr', null, b), band = c.el('div', 'amt-sl-band', null, tr), kn = c.el('div', 'amt-sl-kn', null, tr);
      band.style.left = pct(st.lo); band.style.width = ((st.hi - st.lo) / 89 * 100).toFixed(1) + '%'; kn.style.left = pct(st.T);
      const card = c.el('div', 'amt-card', null, b);
      c.el('div', null, 'Zielbereich: ' + st.lo + '–' + st.hi + ' °C · stabil: ' + '●'.repeat(st.stable) + '○'.repeat(Math.max(0, st.need - st.stable)), card);
      c.el('div', null, 'Wärmelast nächster Takt: +' + h + ' · Kühlung jetzt: −' + cool + (st.diff === 0 ? ' · Prognose: ' + (st.T + h - cool) + ' °C' : ''), card);
      const row = c.el('div', 'amt-row', null, b);
      st.fans.forEach((on, i) => c.btn(row, 'f' + i, '🌀 Lüfter ' + (i + 1) + ' (−3)', () => c.act({ t: 'fan', i }), on ? 'amt-on' : ''));
      c.btn(row, 'v', '💧 Ventil (−1)', () => c.act({ t: 'valve' }), st.valve ? 'amt-on' : '');
      c.btn(b, 'tick', '⏭ Nächster Takt', () => c.act({ t: 'tick' }), 'amt-main');
    },
    status: (c, st) => 'Takt ' + st.step + ' · halte ' + st.need + ' Takte im Zielbereich',
    errMsg: (c, st) => st.T === st.start ? 'Überhitzung! Notkühlung – neuer Anlauf.' : 'Zielbereich verlassen – Zähler zurückgesetzt.'
  };

  UI.antenne = {
    render(c, b, st) {
      st.ants.forEach((an, i) => {
        const card = c.el('div', 'amt-card', null, b), pt = (deg, r) => [50 + r * Math.sin(deg * Math.PI / 180), 50 - r * Math.cos(deg * Math.PI / 180)];
        const [tx, ty] = pt(an.taz, 40), [nx, ny] = pt(an.az, 36), ok = c.L.okAz(st, i) && c.L.okEl(st, i);
        const e = (deg, r) => [110 + r * Math.cos(deg * Math.PI / 180), 90 - r * Math.sin(deg * Math.PI / 180)], [ex, ey] = e(an.tel, 70), [cx, cy] = e(an.el, 64);
        const head = c.el('div', 'amt-row', null, card); head.style.justifyContent = 'space-between';
        c.el('b', null, (ok ? '✓ ' : '') + 'Antenne ' + (i + 1), head); c.el('span', 'amt-sub', 'Ziel: ' + an.taz + '° / ' + an.tel + '°', head);
        c.el('div', null, null, card).innerHTML = '<svg class="amt-svg" style="max-height:100px" viewBox="0 0 200 100">' +
          '<circle cx="50" cy="50" r="44" fill="#06102a" stroke="#29d3ff55"/><text x="50" y="14" text-anchor="middle" font-size="9" fill="#a9bce0">N</text>' +
          '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="5" fill="none" stroke="#ff9a2e" stroke-width="2.5"/>' +
          '<line x1="50" y1="50" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#29d3ff" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M110 90H185A75 75 0 0 0 110 15Z" fill="#06102a" stroke="#29d3ff55"/>' +
          '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="5" fill="none" stroke="#ff9a2e" stroke-width="2.5"/>' +
          '<line x1="110" y1="90" x2="' + cx.toFixed(1) + '" y2="' + cy.toFixed(1) + '" stroke="#29d3ff" stroke-width="3" stroke-linecap="round"/></svg>';
        c.slider(card, { k: 'a' + i, label: 'Azimut', value: an.az, min: 0, max: 359, step: 2, big: 15, wrap: true, ok: c.L.okAz(st, i), fmt: v => v + '°',
          on: v => c.act({ t: 'adj', i, k: 'az', d: ((v - an.az + 540) % 360) - 180 }) });
        c.slider(card, { k: 'e' + i, label: 'Elevation', value: an.el, min: 0, max: 90, step: 2, big: 10, ok: c.L.okEl(st, i), fmt: v => v + '°',
          on: v => c.act({ t: 'adj', i, k: 'el', d: v - an.el }) });
      });
    },
    status: () => 'Blaue Nadel auf den orangen Ring stellen.'
  };

  UI.code = {
    render(c, b, st) {
      const card = c.el('div', 'amt-card', null, b); c.el('div', 'amt-sub', '🧩 Gefundene Schnipsel', card);
      st.clues.forEach(q => {
        const P = n => 'Stelle ' + (n + 1);
        c.el('div', null, '• ' + (q.k === 'eq' ? P(q.i) + ' ist ' + q.v + '.' : q.k === 'sum' ? P(q.i) + ' + ' + P(q.j) + ' = ' + q.v + '.' :
          q.v === 0 ? P(q.i) + ' ist gleich ' + P(q.j) + '.' : P(q.i) + ' ist um ' + Math.abs(q.v) + (q.v > 0 ? ' größer' : ' kleiner') + ' als ' + P(q.j) + '.'), card);
      });
      const d = c.el('div', 'amt-disp', null, b);
      for (let i = 0; i < st.len; i++) d.textContent += (i < st.entry.length ? st.entry[i] : '_') + (i < st.len - 1 ? ' ' : '');
      const g = c.grid(b, 3);
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0, 'ok'].forEach(k => c.btn(g, 'k' + k, k === 'del' ? '⌫' : k === 'ok' ? '✔' : String(k),
        () => c.act(k === 'del' ? { t: 'del' } : k === 'ok' ? { t: 'enter' } : { t: 'digit', d: k }), k === 'ok' ? 'amt-okc' : ''));
    },
    status: (c, st) => st.entry.length + '/' + st.len + ' Ziffern',
    errMsg: () => 'Falscher Code – Eingabe gelöscht.'
  };

  UI.filter = {
    retry: true,
    render(c, b, st) {
      const cov = Array(st.B).fill(false); st.f.forEach(([s, e], i) => { if (st.on[i]) for (let k = s; k <= e; k++) cov[k] = true; });
      const sp = c.grid(b, st.B); sp.style.gridTemplateColumns = 'repeat(' + st.B + ',1fr)'; sp.style.justifyContent = 'stretch';
      for (let k = 0; k < st.B; k++) {
        const n = st.noise[k], v = st.voice[k], col = c.el('div', 'amt-band' + (n ? ' n' : v ? ' v' : '') + (cov[k] ? ' cut' : ''), null, sp);
        c.el('span', null, n ? '✖' : v ? '♪' : '', col); c.el('i', null, null, col).style.height = (n ? 46 : v ? 30 : 10) + 'px'; c.el('span', null, String(k + 1), col);
      }
      st.f.forEach(([s, e], i) => {
        const bt = c.btn(b, 'f' + i, null, () => c.act({ t: 'toggle', i }), 'amt-li' + (st.on[i] ? ' amt-on' : ''));
        c.el('b', null, 'F' + (i + 1), bt);
        const strip = c.el('div', 'amt-strip', null, bt); strip.style.gridTemplateColumns = 'repeat(' + st.B + ',1fr)';
        for (let k = 0; k < st.B; k++) c.el('i', k >= s && k <= e ? 'c' : null, null, strip);
      });
      c.btn(b, 'go', '🎧 Filter anwenden', () => c.act({ t: 'apply' }), 'amt-main');
    },
    status: () => '✖ = Störspitze (weg damit) · ♪ = Stimme (nicht beschneiden)',
    errMsg: (c, st) => st.fb ? st.fb.miss + ' Störspitze(n) offen, ' + st.fb.hit + ' Stimm-Band/Bänder beschnitten.' : 'Noch nicht richtig.'
  };

  UI.bruecke = {
    retry: true,
    render(c, b, st) {
      const on = c.L.reach(st), g = c.grid(b, st.W, 'amt-sq');
      for (let y = 0; y < st.H; y++) for (let x = 0; x < st.W; x++) {
        const v = st.c[y * st.W + x];
        const bt = c.btn(g, 'c' + x + '_' + y, v === 2 ? '🪨' : v === 1 ? '■' : '', v === 2 ? null : () => c.act({ t: 'cell', x, y }),
          'amt-cell' + (v === 1 ? (on[y * st.W + x] ? ' amt-beam' : ' amt-pow') : ''));
        if ((x === 0 && y === st.ra) || (x === st.W - 1 && y === st.rb)) c.el('span', 'amt-badge', x ? '🔌◀' : '▶🔌', bt).style[x ? 'right' : 'left'] = '-2px';
      }
    },
    status: (c, st) => 'Kabelstücke: ' + st.cnt + '/' + st.budget + ' (Feld erneut tippen = entfernen)',
    errMsg: () => 'Keine Kabelstücke mehr – entferne überflüssige.'
  };

  UI.wellen = {
    retry: true,
    render(c, b, st) {
      const tr = c.L.trace(st), beam = new Set(tr.cells), mi = {}, g = c.grid(b, st.N, 'amt-sq');
      st.m.forEach((m, i) => { mi[m.y * st.N + m.x] = i; });
      for (let y = 0; y < st.N; y++) for (let x = 0; x < st.N; x++) {
        const k = y * st.N + x, j = mi[k], isR = x === st.rx && y === st.ry, cls = 'amt-cell' + (beam.has(k) ? ' amt-beam' : '');
        if (j !== undefined) {
          const bt = c.btn(g, 'm' + j, null, () => c.act({ t: 'flip', i: j }), cls);
          c.el('i', 'amt-mir', null, bt).style.transform = 'rotate(' + (st.m[j].o ? 45 : -45) + 'deg)';
        } else c.btn(g, null, isR ? '📡' : x === 0 && y === st.er ? '📶' : '', null, cls + (isR && tr.hit ? ' amt-okc' : ''));
      }
    },
    status: (c, st) => 'Reflektoren gekippt: ' + st.flips
  };

  UI.sicherung = {
    render(c, b, st) {
      c.btn(b, 'main', 'Hauptschalter: ' + (st.main ? 'EIN ⚡' : 'AUS ⭘'), () => c.act({ t: 'main' }), 'amt-main' + (st.main ? ' amt-on' : ''));
      const g = c.grid(b, 2);
      st.slots.forEach((s, i) => {
        const bt = c.btn(g, 's' + i, null, s.ok ? null : () => { if (st.sel < 0) c.msg('Wähle erst eine Ersatzsicherung.'); else c.act({ t: 'put', s: i }); },
          'amt-li ' + (s.ok ? 'amt-okc' : 'amt-wrong'));
        c.el('span', 'amt-grow', s.name, bt); c.el('b', null, s.a + ' A', bt); c.el('span', null, s.ok ? '✓' : '✖', bt);
      });
      c.el('div', 'amt-sub', 'Ersatzsicherungen:', b);
      const row = c.el('div', 'amt-row', null, b);
      st.spares.forEach((v, k) => { if (v !== null) c.btn(row, 'p' + k, '🔩 ' + v + ' A', () => c.act({ t: 'pick', k }), st.sel === k ? 'amt-sel' : ''); });
    },
    status: (c, st) => st.slots.some(s => !s.ok) ? (st.main ? 'Erst Hauptschalter AUS!' : 'Sicherung wählen, dann defekten Platz ✖ antippen.') : 'Alle ersetzt – Hauptschalter wieder EIN.',
    errMsg: (c, st) => st.fb === 'main' ? 'Stromschlag-Gefahr! Erst Hauptschalter AUS.' : 'Falscher Ampere-Wert!'
  };

  UI.licht_memory = {
    render(c, b, st) {
      const L = c.local;
      if (st.miss && L.hm !== st.miss) { const m = L.hm = st.miss; c.later(() => { if (st.miss === m) c.act({ t: 'hide' }, { silent: true }); }, 900); }
      const g = c.grid(b, 4, 'amt-big');
      st.cards.forEach((kind, i) => {
        const up = st.m[i] || st.up.includes(i) || (st.miss && st.miss.includes(i));
        const bt = c.btn(g, 'c' + i, up ? null : '?', st.m[i] ? null : () => c.act({ t: 'flip', i }), st.m[i] ? 'amt-okc' : up ? 'amt-lit' : '');
        bt.style.minHeight = '56px'; if (up) c.sym(kind, bt);
      });
    },
    status: (c, st) => 'Paare: ' + st.m.filter(Boolean).length / 2 + '/' + st.p + ' · Fehlversuche: ' + st.err,
    errMsg: () => 'Kein Paar.'
  };

  UI.akkus = {
    retry: true,
    render(c, b, st) {
      const L = c.local; if (L.p == null || st.used[L.p] !== -1) L.p = -1;
      c.el('div', 'amt-sub', 'Ladepakete:', b);
      const tray = c.el('div', 'amt-row', null, b);
      st.packs.forEach((p, k) => { if (st.used[k] === -1) c.btn(tray, 'p' + k, '⚡+' + p, () => { L.p = L.p === k ? -1 : k; c.sfx('click'); c.refresh(); }, L.p === k ? 'amt-sel' : ''); });
      const row = c.el('div', 'amt-row', null, b); row.style.alignItems = 'flex-start';
      for (let bi = 0; bi < st.B; bi++) {
        const ch = c.L.charge(st, bi), box = c.el('div', 'amt-bat', null, row), cells = c.el('div', 'amt-cells', null, box);
        for (let u = 0; u < st.cap[bi]; u++) c.el('i', u < st.base[bi] ? 'b' : u < ch ? 'p' : null, null, cells);
        c.btn(box, 'b' + bi, (ch === st.cap[bi] ? '✓ ' : '') + ch + '/' + st.cap[bi], () => {
          if (L.p < 0) { c.msg('Wähle erst ein Ladepaket.'); return; }
          const p = L.p; L.p = -1; c.act({ t: 'give', p, b: bi });
        }, ch === st.cap[bi] ? 'amt-okc' : '');
        st.packs.forEach((p, k) => { if (st.used[k] === bi) c.btn(box, 't' + k, '↩ ' + p, () => c.act({ t: 'take', p: k })); });
      }
    },
    status: () => 'Paket wählen, dann Akku antippen · ↩ nimmt ein Paket zurück',
    errMsg: () => 'Überladung! Das Paket passt nicht mehr in diesen Akku.'
  };

  UI.notfunk = {
    render(c, b, st) {
      const lab = { cover: 'Schutzkappe öffnen', ident: 'Rufzeichen ' + st.calls[st.ident] + ' bestätigen', arm: 'Sender scharf schalten',
        chan: 'Kanal ' + st.chan + ' wählen', power: 'Leistung ' + POWER[st.power] + ' wählen', hold: 'Sendetaste halten' };
      const card = c.el('div', 'amt-card', null, b); c.el('div', 'amt-sub', '🚨 Notfall-Karte', card);
      st.steps.forEach((s, k) => { const d = c.el('div', null, (k < st.pos ? '✓ ' : k === st.pos ? '▶ ' : (k + 1) + '. ') + lab[s], card); if (k < st.pos) d.style.color = 'var(--ok)'; });
      const has = s => st.steps.includes(s), past = s => st.steps.indexOf(s) < st.pos;
      const r1 = c.el('div', 'amt-row', null, b);
      c.btn(r1, 'cover', past('cover') ? '🔓 Kappe offen' : '🔒 Kappe öffnen', () => c.act({ t: 'cover' }), past('cover') ? 'amt-okc' : '');
      c.btn(r1, 'arm', past('arm') ? '⚠ Scharf' : '⚠ Scharf schalten', () => c.act({ t: 'arm' }), past('arm') ? 'amt-on' : '');
      if (has('ident')) { const r = c.el('div', 'amt-row', null, b); st.calls.forEach((n, v) => c.btn(r, 'id' + v, n, () => c.act({ t: 'ident', v }))); }
      const ch = c.grid(b, 9); ch.style.gridTemplateColumns = 'repeat(auto-fit,minmax(44px,1fr))'; ch.style.justifyContent = 'stretch';
      for (let v = 1; v <= 9; v++) c.btn(ch, 'ch' + v, String(v), () => c.act({ t: 'chan', v }), past('chan') && v === st.chan ? 'amt-sel' : '');
      if (has('power')) { const r = c.el('div', 'amt-row', null, b); POWER.forEach((n, v) => c.btn(r, 'pw' + v, n, () => c.act({ t: 'power', v }), past('power') && v === st.power ? 'amt-sel' : '')); }
      c.meter(b, 'Senden: ' + st.held + '/' + st.holdN, st.held / st.holdN * 100);
      c.btn(b, 'tx', '📡 SENDEN (gedrückt halten)', null, 'amt-main', { hold: { ms: 220, tick: () => c.act({ t: 'hold' }), end: () => c.act({ t: 'release' }) } });
    },
    status: () => 'Reihenfolge einhalten – jeder Fehler startet von vorn.',
    errMsg: (c, st) => st.pos === 0 && st.held === 0 ? 'Sicherheitsabschaltung! Von vorn beginnen.' : 'Zu früh losgelassen!'
  };

  UI.playlist_clean = {
    retry: true,
    render(c, b, st) {
      const card = c.el('div', 'amt-card', null, b); c.el('div', 'amt-sub', '📋 Regeln für die Sendung', card);
      st.rules.forEach(r => c.el('div', null, '• ' + (r.k === 'dup' ? 'Keine doppelten Titel (nur das erste Vorkommen bleibt)' : r.k === 'long' ? 'Nicht länger als ' + mmss(r.v) :
        r.k === 'short' ? 'Nicht kürzer als ' + mmss(r.v) : r.k === 'genre' ? 'Nur Genres: ' + r.v.join(', ') : 'Keine Titel mit Kennzeichen 🅴'), card));
      st.tr.forEach((t, i) => {
        const bt = c.btn(b, 't' + i, null, () => c.act({ t: 'toggle', i }), 'amt-li' + (st.rm[i] ? ' amt-wrong' : ''));
        c.el('span', 'amt-num', st.rm[i] ? '🗑' : (i + 1) + '.', bt);
        const n = c.el('span', 'amt-grow', t.title, bt); if (st.rm[i]) n.style.textDecoration = 'line-through';
        if (t.ex) c.el('span', 'amt-tag', '🅴', bt);
        c.el('span', 'amt-tag', t.genre, bt); c.el('span', 'amt-val', mmss(t.sec), bt);
      });
      c.btn(b, 'go', '✔ Playlist übernehmen', () => c.act({ t: 'apply' }), 'amt-main');
    },
    status: (c, st) => st.rm.filter(Boolean).length + ' Titel markiert',
    errMsg: (c, st) => st.fb + ' Entscheidung(en) falsch – prüfe die Regeln.'
  };

  UI.buehne = {
    retry: true,
    render(c, b, st) {
      c.el('div', 'amt-sub', 'Zielmuster:', b);
      const tg = c.grid(b, st.N, 'amt-sq'); tg.style.setProperty('--cs', '22px');
      st.target.forEach(v => c.el('div', 'amt-cell amt-btn amt-dis' + (v ? ' amt-on' : ''), v ? '●' : '○', tg).style.fontSize = '12px');
      c.el('div', 'amt-sub', 'Bühne:', b);
      const g = c.grid(b, st.N, 'amt-sq');
      st.cur.forEach((v, i) => c.btn(g, 'c' + i, v ? '●' : '○', () => c.act({ t: 'press', i }), 'amt-cell' + (v ? ' amt-on' : '')));
    },
    status: (c, st) => st.cur.filter((v, i) => v === st.target[i]).length + '/' + st.cur.length + ' Panels passen'
  };

  // ---------- Rahmen ----------
  function open(id, opts) {
    opts = opts || {};
    const box = opts.container, doc = box.ownerDocument, win = doc.defaultView || root, Tk = AMU.Tasks;
    injectCss(doc);
    const def = Tk.byId(id), ui = UI[id];
    const E = (tag, cls, text, parent) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const rootEl = E('div', 'amt-root');
    box.textContent = ''; box.appendChild(rootEl);
    let closed = false, finished = false, doneCalled = false, focusKey = null, drag = null, downKey = null, hold = null, holdT = 0, lastClick = 0, msgT = 0;
    const timers = new Set();
    const sfx = n => { try { if (opts.sfx) opts.sfx(n); } catch (e) { /* Ton ist optional */ } };
    const later = (fn, ms) => { const t = win.setTimeout(() => { timers.delete(t); if (!closed) fn(); }, ms); timers.add(t); return t; };

    if (!def || !ui) {
      E('div', 'amt-card', 'Unbekannte Aufgabe: ' + id, rootEl);
      const x = E('button', 'amt-btn amt-x', '✕ Schließen', rootEl); x.type = 'button';
      x.addEventListener('click', () => { handle.close(); if (opts.onCancel) opts.onCancel(); });
      const handle = { close() { if (!closed) { closed = true; rootEl.remove(); } } };
      return handle;
    }
    const st = Tk.create(id, opts.seed == null ? (Math.random() * 1e9) | 0 : opts.seed, opts.diff == null ? 1 : opts.diff);

    // Kopf, Hinweis, Fortschritt, Inhalt, Fuß
    const head = E('div', 'amt-head', null, rootEl);
    E('span', 'amt-ic', def.icon, head);
    E('h2', 'amt-title', opts.lang === 'en' ? def.en : def.name, head);
    const hint = E('p', 'amt-hint', def.hint, rootEl);
    const pbar = E('div', 'amt-pbar', null, rootEl), pfill = E('i', null, null, pbar);
    const body = E('div', 'amt-body', null, rootEl);
    const foot = E('div', 'amt-foot', null, rootEl), msgEl = E('div', 'amt-msg', null, foot);
    E('div', 'amt-okov', '✓ Erledigt!', rootEl);
    hint.id = 'amt-h-' + id; rootEl.setAttribute('role', 'dialog'); rootEl.setAttribute('aria-label', def.name);

    const c = {
      st, L: Tk.LOGIC[id], local: {}, sfx, later,
      act, refresh: render,
      el: E,
      msg(text) { showMsg(text, false); },
      btn(parent, k, label, on, cls, ext) {
        const b = E('button', 'amt-btn' + (cls ? ' ' + cls : ''), label, parent); b.type = 'button';
        if (k != null && (on || ext)) { b.classList.add('amt-f'); b.dataset.k = k; b._on = on || null; if (ext) { b._adj = ext.adj; b._drag = ext.drag; b._hold = ext.hold; } }
        else { b.disabled = true; if (!/amt-(okc|beam|pow|on|lit|wrong|h\d)/.test(cls || '')) b.classList.add('amt-dis'); }
        return b;
      },
      sym(kind, parent) { const s = E('span', 'amt-sym', SYM[kind][1], parent); s.style.color = SYM[kind][0]; s.title = SYM[kind][2]; return s; },
      grid(parent, cols, cls, marks) {
        const g = E('div', 'amt-grid' + (cls ? ' ' + cls : ''), null, parent);
        g.style.setProperty('--n', cols + (marks ? 1 : 0));
        const sq = marks || cls === 'amt-sq';
        g.style.gridTemplateColumns = marks ? '22px repeat(' + cols + ',var(--cs)) 22px' : sq ? 'repeat(' + cols + ',var(--cs))' : 'repeat(' + cols + ',minmax(0,1fr))';
        if (!sq) g.style.justifyContent = 'stretch';
        return g;
      },
      meter(parent, label, pct) {
        E('div', 'amt-sub', label, parent); const m = E('div', 'amt-meter', null, parent);
        E('i', null, null, m).style.width = Math.max(0, Math.min(100, pct)) + '%';
      },
      slider(parent, o) {
        const span = o.max - o.min, pos = v => ((v - o.min) / span * 100).toFixed(2) + '%';
        const s = c.btn(parent, o.k, null, null, 'amt-sl' + (o.ok ? ' amt-ok' : ''), {
          adj(dir, big) {
            let v = o.value + dir * (big ? o.big : o.step);
            v = o.wrap ? ((v - o.min) % (span + 1) + span + 1) % (span + 1) + o.min : Math.max(o.min, Math.min(o.max, v));
            if (v !== o.value) o.on(v);
          },
          drag(e, el) {
            const r = el.querySelector('.amt-sl-tr').getBoundingClientRect(); if (!r.width) return;
            const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v = Math.max(o.min, Math.min(o.max, Math.round(o.min + f * span)));
            if (v !== o.value) o.on(v);
          }
        });
        s.setAttribute('role', 'slider'); s.setAttribute('aria-valuenow', o.value); s.setAttribute('aria-label', o.label);
        const lab = E('div', 'amt-sl-lab', null, s), l = E('span', null, null, lab);
        if (o.sym != null) { c.sym(o.sym, l); l.append(' '); }
        l.append(o.label); E('span', 'amt-val', (o.ok ? '✓ ' : '') + (o.fmt ? o.fmt(o.value) : o.value), lab);
        const tr = E('div', 'amt-sl-tr', null, s);
        if (o.band) { const bd = E('div', 'amt-sl-band', null, tr); bd.style.left = pos(o.band[0]); bd.style.width = ((o.band[1] - o.band[0]) / span * 100).toFixed(2) + '%'; }
        if (!o.wrap) E('div', 'amt-sl-fill', null, tr).style.width = pos(o.value);
        E('div', 'amt-sl-kn', null, tr).style.left = pos(o.value);
        return s;
      }
    };

    let retryBtn = null;
    if (ui.retry) {
      retryBtn = c.btn(foot, 'retry', '↺ Neu versuchen', () => { c.local = {}; act({ t: 'reset' }); });
    }
    c.btn(foot, 'x', '✕ Abbrechen', cancel, 'amt-x');

    const focusables = () => Array.prototype.filter.call(rootEl.querySelectorAll('.amt-f'), e => !e.disabled);
    const byKey = k => k == null ? null : focusables().find(e => e.dataset.k === k) || null;
    function applyFocus() {
      rootEl.querySelectorAll('.amt-focus').forEach(e => e.classList.remove('amt-focus'));
      const e = byKey(focusKey); if (e) e.classList.add('amt-focus');
      return e;
    }
    function setFocus(e) { if (e) { focusKey = e.dataset.k; const f = applyFocus(); if (f && rootEl.classList.contains('amt-kb') && f.scrollIntoView) f.scrollIntoView({ block: 'nearest' }); } }

    function updateStatus() { if (!msgT) { msgEl.className = 'amt-msg'; msgEl.textContent = ui.status ? ui.status(c, st) : ''; } }
    function showMsg(text, isBad) {
      if (msgT) { win.clearTimeout(msgT); timers.delete(msgT); }
      msgEl.className = 'amt-msg' + (isBad ? ' amt-bad' : ''); msgEl.textContent = text;
      msgT = later(() => { msgT = 0; updateStatus(); }, isBad ? 1800 : 1400);
    }
    function render() {
      if (closed) return;
      body.textContent = '';
      try { ui.render(c, body, st); } catch (e) { E('div', 'amt-card', 'Fehler in der Aufgabe.', body); if (win.console) win.console.error(e); }
      const p = Tk.prog(id, st);
      pbar.style.display = p === null ? 'none' : ''; if (p !== null) pfill.style.width = (p * 100).toFixed(1) + '%';
      if (retryBtn) retryBtn.style.visibility = finished ? 'hidden' : '';
      updateStatus();
      if (!byKey(focusKey)) { const f = body.querySelector('.amt-f:not(:disabled)') || focusables()[0]; focusKey = f ? f.dataset.k : null; }
      applyFocus();
    }
    const actLog = [];   // Aktionsprotokoll: der Spielkern prüft damit die Lösung nach (task_done)
    function act(a, o) {
      if (closed || finished) return;
      const e0 = st.err, p0 = Tk.prog(id, st);
      Tk.act(id, st, a);
      if (actLog.length < 600) { try { actLog.push(JSON.parse(JSON.stringify(a))); } catch (e) { /* nicht serialisierbar */ } }
      if (st.err > e0) bad(ui.errMsg ? ui.errMsg(c, st) : 'Falsch – versuch es nochmal!');
      else if (!(o && o.silent)) {
        const p1 = Tk.prog(id, st), now = Date.now();
        if (p0 !== null && p1 !== null && p1 > p0 + 1e-9) sfx('good');
        else if (now - lastClick > 70) { lastClick = now; sfx('click'); }
      }
      render();
      if (Tk.done(id, st)) finish();
    }
    function bad(text) {
      stopHold(true);
      sfx('bad'); rootEl.classList.remove('amt-shake'); void rootEl.offsetWidth; rootEl.classList.add('amt-shake');
      later(() => rootEl.classList.remove('amt-shake'), 400);
      showMsg(text, true);
    }
    function finish() {
      finished = true; stopHold(true); drag = null;
      sfx('done'); rootEl.classList.add('amt-win');
      if (retryBtn) retryBtn.style.visibility = 'hidden';
      later(() => { if (!doneCalled) { doneCalled = true; try { if (opts.onDone) opts.onDone(actLog.slice()); } catch (e) { if (win.console) win.console.error(e); } } }, 650);
    }
    function startHold(h) {
      if (holdT || finished) return;
      hold = h; h.tick();
      if (!finished && !closed && hold) holdT = win.setInterval(() => { if (hold) hold.tick(); }, h.ms || 200);
    }
    function stopHold(silent) {
      if (holdT) { win.clearInterval(holdT); holdT = 0; }
      const h = hold; hold = null;
      if (h && !silent && h.end) h.end();
    }
    function cancel() { if (closed) return; handle.close(); if (opts.onCancel) opts.onCancel(); }

    // Räumliche Navigation per Pfeiltasten
    function move(dir) {
      const els = focusables(); if (!els.length) return;
      const cur = byKey(focusKey);
      if (!cur) { setFocus(els[0]); return; }
      const idx = els.indexOf(cur);
      if (dir === 'next' || dir === 'prev') { setFocus(els[(idx + (dir === 'next' ? 1 : -1) + els.length) % els.length]); return; }
      const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
      let best = null, bs = Infinity;
      for (const e of els) {
        if (e === cur) continue;
        const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        const main = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx, side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
        if (main < 4) continue;
        const sc = main + side * 2; if (sc < bs) { bs = sc; best = e; }
      }
      setFocus(best || els[(idx + (dir === 'down' || dir === 'right' ? 1 : -1) + els.length) % els.length]);
    }
    const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    function onKey(e) {
      if (closed) return;
      const k = e.key;
      if (finished) return;
      if (k === 'Escape' || k === 'Esc') { e.preventDefault(); e.stopPropagation(); cancel(); return; }
      const cur = byKey(focusKey);
      if (KEYDIR[k]) {
        const d = KEYDIR[k];
        if ((d === 'left' || d === 'right') && cur && cur._adj) cur._adj(d === 'left' ? -1 : 1, e.shiftKey); else move(d);
      } else if (k === '+' || k === '=' || k === '-' || k === 'PageUp' || k === 'PageDown') {
        if (cur && cur._adj) cur._adj(k === '-' || k === 'PageDown' ? -1 : 1, k.startsWith('Page') || e.shiftKey);
      } else if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
        if (cur && !e.repeat) { if (cur._hold) startHold(cur._hold); else if (cur._on) cur._on(); }
      } else if (k === 'Tab') move(e.shiftKey ? 'prev' : 'next');
      else return;
      if (!rootEl.classList.contains('amt-kb')) { rootEl.classList.add('amt-kb'); applyFocus(); }
      e.preventDefault(); e.stopPropagation();
    }
    function onKeyUp(e) { if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && hold) { e.preventDefault(); stopHold(false); } }
    function onDown(e) {
      const t = e.target.closest ? e.target.closest('.amt-f') : null;
      if (!t || closed || finished) return;
      e.preventDefault();
      rootEl.classList.remove('amt-kb'); focusKey = t.dataset.k; applyFocus(); downKey = t.dataset.k;
      if (t._hold) startHold(t._hold);
      if (t._drag) { drag = t.dataset.k; t._drag(e, t, true); }
    }
    function onMove(e) { if (!drag || closed) return; const t = byKey(drag); if (t && t._drag) { e.preventDefault(); t._drag(e, t, false); } }
    function onUp(e) {
      const k = downKey; downKey = null; drag = null; stopHold(false);
      if (closed || finished || e.type !== 'pointerup' || k == null) return;
      const t = e.target && e.target.closest ? e.target.closest('.amt-f') : null;
      if (t && t.dataset.k === k && t._on) t._on();
    }
    doc.addEventListener('keydown', onKey, true);
    doc.addEventListener('keyup', onKeyUp, true);
    rootEl.addEventListener('pointerdown', onDown);
    doc.addEventListener('pointermove', onMove, { passive: false });
    doc.addEventListener('pointerup', onUp);
    doc.addEventListener('pointercancel', onUp);

    const handle = {
      state: st,
      close() {
        if (closed) return; closed = true;
        stopHold(true); timers.forEach(t => win.clearTimeout(t)); timers.clear();
        doc.removeEventListener('keydown', onKey, true); doc.removeEventListener('keyup', onKeyUp, true);
        rootEl.removeEventListener('pointerdown', onDown);
        doc.removeEventListener('pointermove', onMove, { passive: false }); doc.removeEventListener('pointerup', onUp); doc.removeEventListener('pointercancel', onUp);
        rootEl.remove();
      }
    };
    render();
    return handle;
  }

  AMU.TaskUI = { open, ids: () => Object.keys(UI) };
})(typeof window !== 'undefined' ? window : globalThis);
