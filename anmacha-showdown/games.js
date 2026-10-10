/* Mini-Spiele für AnMaCha Showdown. Jedes Spiel: { id, name, rules, better: 'high'|'low', fmt(v), play(P) -> Promise<{v,text}>, bot(skill,P) -> {v,text} }
   P = { el, shared, logos, sleep(ms), alive(), sfx } – skill 0 = Anfänger, 1 = Normal, 2 = Profi */
(function () {
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const num = (x, d) => x.toLocaleString('de-DE', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const wait = (P, ms) => P.sleep(ms);
  const tapEv = (el, fn) => { const h = e => { e.preventDefault(); fn(e); }; el.addEventListener('pointerdown', h); return () => el.removeEventListener('pointerdown', h); };
  const head = (P, title, sub) => { P.el.innerHTML = `<div class="gtitle">${title}</div><div class="gsub">${sub}</div><div class="gbody" id="gb"></div><div class="gres" id="gr"></div>`; return P.el.querySelector('#gb'); };
  const resTxt = (P, t) => { const r = P.el.querySelector('#gr'); if (r) r.innerHTML = t; };

  // ------------------------------------------------------------------ 1 Reaktion
  const react = {
    id: 'react', name: 'Reaktionstest', rules: 'Tippe sofort, wenn der Kreis GRÜN wird. Drei Versuche – zu früh getippt kostet Zeit!', better: 'low', fmt: v => num(v) + ' ms',
    async play(P) {
      const gb = head(P, 'Reaktionstest', 'Tippe sofort, wenn der Kreis <b style="color:#7CFF9A">GRÜN</b> wird. 3 Versuche.'); gb.innerHTML = '<button class="rbtn" id="rb">Gleich geht’s los …</button>'; const b = gb.querySelector('#rb'); const times = [];
      for (let i = 0; i < 3; i++) {
        b.className = 'rbtn red'; b.textContent = 'Warte …'; await wait(P, 700);
        const t = await new Promise(res => {
          let state = 'wait', t0 = 0, timer; const off = tapEv(b, () => { if (state === 'wait') { state = 'early'; clearTimeout(timer); off(); b.className = 'rbtn red'; b.textContent = 'Zu früh! +300 ms'; P.sfx.bad(); setTimeout(() => res(600), 900); } else if (state === 'go') { state = 'done'; off(); res(Math.round(performance.now() - t0)); } });
          timer = setTimeout(() => { if (state !== 'wait') return; state = 'go'; b.className = 'rbtn green'; b.textContent = 'JETZT!'; P.sfx.select(); t0 = performance.now(); }, 1500 + Math.random() * 2600);
        });
        times.push(t); b.className = 'rbtn'; b.textContent = t >= 600 ? 'Versuch ' + (i + 1) + ': 600 ms' : 'Versuch ' + (i + 1) + ': ' + t + ' ms'; resTxt(P, times.map(x => num(x) + ' ms').join(' · ')); await wait(P, 1000);
      }
      const avg = Math.round(times.reduce((a, c) => a + c, 0) / times.length); return { v: avg, text: `Ø ${num(avg)} ms` };
    },
    bot: s => { const v = Math.round([380, 300, 235][s] + gauss() * [70, 50, 32][s]); return { v: Math.max(150, v), text: `Ø ${num(Math.max(150, v))} ms` }; }
  };

  // ------------------------------------------------------------------ 2 Schätzen
  const EST = [
    ['Wie hoch ist die Zugspitze (in Metern)?', 2962, 'm'], ['Wie viele Knochen hat ein erwachsener Mensch?', 206, ''], ['Wie lang ist der Rhein insgesamt (in km)?', 1233, 'km'], ['Wie viele Zähne hat ein erwachsener Mensch mit Weisheitszähnen?', 32, ''],
    ['Wie viele Stufen hat der Eiffelturm bis zur obersten Besucherplattform ungefähr?', 1665, ''], ['In welchem Jahr wurde die Berliner Mauer gebaut?', 1961, ''], ['Wie viele Einwohner hat Deutschland ungefähr (in Millionen)?', 84, 'Mio.'],
    ['Wie viele Tasten hat ein Klavier?', 88, ''], ['Wie weit ist der Mond von der Erde entfernt (in tausend km)?', 384, 'Tsd. km'], ['Wie schwer ist ein ausgewachsener Afrikanischer Elefantenbulle ungefähr (in kg)?', 6000, 'kg'],
    ['Wie lang ist ein Marathon (in km)?', 42.2, 'km'], ['In welchem Jahr fiel die Berliner Mauer?', 1989, ''], ['Wie viele Länder sind Mitglied der EU (Stand 2026)?', 27, ''], ['Wie hoch ist der Mount Everest (in Metern)?', 8849, 'm'],
    ['Wie viele Minuten hat ein Fußballspiel (ohne Nachspielzeit)?', 90, 'min'], ['Wie viele Planeten hat unser Sonnensystem?', 8, ''], ['Wie viele Sekunden hat ein Tag?', 86400, 's'], ['Wie viele Bundesländer hat Deutschland?', 16, ''],
    ['Wie lange dauert ein Erdumlauf um die Sonne in Tagen?', 365, 'Tage'], ['Wie viele Saiten hat eine Geige?', 4, ''], ['Wie lang ist die Chinesische Mauer ungefähr (in tausend km)?', 21, 'Tsd. km'], ['In welchem Jahr landeten die ersten Menschen auf dem Mond?', 1969, ''],
    ['Wie viele Meter ist ein olympisches Schwimmbecken lang?', 50, 'm'], ['Wie viele Karten hat ein Skatblatt?', 32, '']
  ];
  const estimate = {
    id: 'est', name: 'Schätzduell', rules: 'Schätze die Zahl. Wer näher dran liegt, gewinnt das Spiel.', better: 'low', fmt: v => num(v, 1) + ' % daneben',
    async play(P) {
      const q = P.shared.q || (P.shared.q = rnd(EST)); const gb = head(P, 'Schätzduell', q[0]);
      gb.innerHTML = `<input class="ginp" id="gi" type="number" inputmode="decimal" placeholder="Deine Schätzung${q[2] ? ' (' + q[2] + ')' : ''}" autocomplete="off"><button class="pill go" id="gs">Festlegen</button>`;
      const gi = gb.querySelector('#gi'); setTimeout(() => gi.focus(), 100);
      const guess = await new Promise(res => { const ok = () => { const v = parseFloat(String(gi.value).replace(',', '.')); if (isFinite(v)) res(v); }; gb.querySelector('#gs').onclick = ok; gi.onkeydown = e => { if (e.key === 'Enter') ok(); }; });
      const err = Math.abs(guess - q[1]) / Math.abs(q[1]) * 100; resTxt(P, `Tipp: ${num(guess, guess % 1 ? 1 : 0)}`); await wait(P, 700); return { v: err, text: `${num(guess, guess % 1 ? 1 : 0)} (${num(err, 1)} % daneben)`, answer: q };
    },
    bot(s, P) { const q = P.shared.q || (P.shared.q = rnd(EST)), sig = [0.45, 0.2, 0.07][s], g = Math.max(0, q[1] * (1 + gauss() * sig)), gr = q[1] >= 100 ? Math.round(g) : Math.round(g * 10) / 10, err = Math.abs(gr - q[1]) / Math.abs(q[1]) * 100; return { v: err, text: `${num(gr, gr % 1 ? 1 : 0)} (${num(err, 1)} % daneben)` }; }
  };

  // ------------------------------------------------------------------ 3 Logo-Gedächtnis
  const memory = {
    id: 'mem', name: 'Logo-Gedächtnis', rules: 'Merke dir die Reihenfolge der leuchtenden Sender-Logos und tippe sie nach. Die Folge wird immer länger.', better: 'high', fmt: v => v + ' Logos',
    async play(P) {
      const ids = P.shared.ids || (P.shared.ids = shuffle(P.logos.map(l => l.idx)).slice(0, 6)), seq = P.shared.seq || (P.shared.seq = Array.from({ length: 14 }, () => Math.floor(Math.random() * 6)));
      const gb = head(P, 'Logo-Gedächtnis', 'Schau genau hin – dann tippst du die Logos in derselben Reihenfolge.'); gb.innerHTML = '<div class="mgrid" id="mg"></div>'; const mg = gb.querySelector('#mg'); const cells = [];
      ids.forEach((id, i) => { const l = P.logos.find(x => x.idx === id), b = document.createElement('button'); b.className = 'mcell'; b.innerHTML = `<img alt="" src="${l.src}">`; mg.appendChild(b); cells.push(b); });
      const flash = async i => { cells[i].classList.add('lit'); P.sfx.reveal(i); await wait(P, 480); cells[i].classList.remove('lit'); await wait(P, 160); };
      let L = 1, best = 0; await wait(P, 700);
      while (L <= 12) {
        resTxt(P, `Folge ${L}`); mg.classList.add('lock'); for (let i = 0; i < L; i++) await flash(seq[i]); mg.classList.remove('lock');
        let ok = true; for (let i = 0; i < L; i++) { const c = await new Promise(res => { cells.forEach((b, k) => { b.onclick = () => { cells.forEach(x => x.onclick = null); res(k); }; }); }); cells[c].classList.add('lit'); setTimeout(() => cells[c].classList.remove('lit'), 200); if (c !== seq[i]) { ok = false; break; } P.sfx.tick(); }
        if (!ok) { P.sfx.bad(); mg.classList.add('lock'); break; } best = L; L++; await wait(P, 600);
      }
      resTxt(P, `Geschafft: ${best} Logos`); await wait(P, 1100); return { v: best, text: `${best} Logos` };
    },
    bot: s => { const v = Math.max(1, Math.min(12, Math.round([3.5, 5.5, 8] [s] + gauss() * 1.5))); return { v, text: v + ' Logos' }; }
  };

  // ------------------------------------------------------------------ 4 Tap-Frenzy
  const tap = {
    id: 'tap', name: 'Tipp-Fieber', rules: 'Tippe so oft du kannst auf den Knopf – du hast 10 Sekunden ab dem ersten Tipp.', better: 'high', fmt: v => v + ' Tipps', secs: 10,
    async play(P, secs) {
      secs = secs || 10; const gb = head(P, 'Tipp-Fieber', `Tippe so schnell du kannst! ${secs} Sekunden ab dem ersten Tipp.`); gb.innerHTML = '<button class="tbtn" id="tb">TIPPEN!</button><div class="tcount" id="tc">0</div>'; const b = gb.querySelector('#tb'), tc = gb.querySelector('#tc');
      return new Promise(res => { let n = 0, started = false, t0 = 0, iv; const off = tapEv(b, () => { if (!started) { started = true; t0 = performance.now(); iv = setInterval(() => { const left = secs - (performance.now() - t0) / 1000; resTxt(P, `Noch ${num(Math.max(0, left), 1)} s`); if (left <= 0) { clearInterval(iv); off(); b.disabled = true; setTimeout(() => res({ v: n, text: n + ' Tipps' }), 600); } }, 80); } if (performance.now() - t0 <= secs * 1000 + 30 || !started) { n++; tc.textContent = n; b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 40); P.sfx.click(); } }); });
    },
    bot: (s, P, secs) => { const k = (secs || 10) / 10, v = Math.max(8, Math.round(([40, 52, 62][s] + gauss() * 6) * k)); return { v, text: v + ' Tipps' }; }
  };

  // ------------------------------------------------------------------ 5 Zielscheibe
  const target = {
    id: 'tgt', name: 'Zielscheibe', rules: 'Stoppe das Fadenkreuz erst waagerecht, dann senkrecht möglichst nah an der Mitte. Drei Schüsse.', better: 'high', fmt: v => v + ' Punkte',
    async play(P) {
      const gb = head(P, 'Zielscheibe', 'Tippe zweimal pro Schuss: erst waagerecht, dann senkrecht stoppen. 3 Schüsse.'); gb.innerHTML = '<canvas id="tc" width="300" height="300" class="tcv"></canvas>'; const cv = gb.querySelector('#tc'), g = cv.getContext('2d'); let total = 0; const shots = [];
      const draw = (cx, cy, mx, my) => { g.clearRect(0, 0, 300, 300); const R = [140, 112, 84, 56, 28]; ['#1b2a6a', '#233a8a', '#2f50c0', '#ff9a1f', '#ffd24a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(150, 150, R[i], 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.stroke(); }); shots.forEach(s => { g.fillStyle = '#ff2d95'; g.beginPath(); g.arc(s[0], s[1], 7, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); });
        g.strokeStyle = '#00ffc8'; g.lineWidth = 3; g.beginPath(); if (mx != null) { g.moveTo(mx, 0); g.lineTo(mx, 300); } if (my != null) { g.moveTo(0, my); g.lineTo(300, my); } g.stroke(); if (cx != null && cy != null) { g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.stroke(); } };
      for (let s = 0; s < 3; s++) {
        const sp = 1.6 + s * 0.6, ph = Math.random() * 6; let t0 = performance.now(), lockX = null, lockY = null; draw(null, null, 150, 150);
        const pt = await new Promise(res => {
          let raf; const loop = () => { const t = (performance.now() - t0) / 1000; if (lockX == null) draw(null, null, 150 + 135 * Math.sin(t * sp + ph), null); else draw(null, null, lockX, 150 + 135 * Math.sin(t * sp * 1.15 + ph * 2)); if (P.alive()) raf = requestAnimationFrame(loop); }; loop();
          const off = tapEv(cv, () => { const t = (performance.now() - t0) / 1000; if (lockX == null) { lockX = 150 + 135 * Math.sin(t * sp + ph); P.sfx.click(); t0 = performance.now(); } else { lockY = 150 + 135 * Math.sin(t * sp * 1.15 + ph * 2); off(); cancelAnimationFrame(raf); res([lockX, lockY]); } });
        });
        shots.push(pt); const d = Math.hypot(pt[0] - 150, pt[1] - 150), pts = d < 14 ? 10 : d < 28 ? 9 : d < 42 ? 7 : d < 56 ? 5 : d < 84 ? 4 : d < 112 ? 2 : d < 140 ? 1 : 0; total += pts; draw(null, null); P.sfx.reveal(pts > 6 ? 4 : 1); resTxt(P, `Schuss ${s + 1}: ${pts} Punkte · Summe ${total}`); await wait(P, 900);
      }
      return { v: total, text: total + ' Punkte' };
    },
    bot: s => { const v = Math.max(0, Math.min(30, Math.round([14, 20, 25][s] + gauss() * 3.5))); return { v, text: v + ' Punkte' }; }
  };

  // ------------------------------------------------------------------ 6 Farb-Verwirrung
  const COLS = [['ROT', '#ff3a4a'], ['BLAU', '#3a7bff'], ['GRÜN', '#2fe07a'], ['GELB', '#ffd24a']];
  const stroop = {
    id: 'col', name: 'Farb-Verwirrung', rules: 'Tippe die FARBE, in der das Wort geschrieben ist – nicht, was dort steht! 20 Sekunden, Fehler geben Minuspunkte.', better: 'high', fmt: v => v + ' Punkte',
    async play(P) {
      const gb = head(P, 'Farb-Verwirrung', 'Tippe die <b>Farbe der Schrift</b> – nicht das Wort. 20 Sekunden.'); gb.innerHTML = '<div class="sword" id="sw">…</div><div class="sbtns" id="sb"></div>'; const sw = gb.querySelector('#sw'), sb = gb.querySelector('#sb'); let cur = 0, score = 0;
      COLS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sbtn'; b.style.background = c[1]; b.dataset.i = i; sb.appendChild(b); });
      const next = () => { const w = Math.floor(Math.random() * 4); let ink = Math.floor(Math.random() * 4); if (Math.random() < 0.8) while (ink === w) ink = Math.floor(Math.random() * 4); cur = ink; sw.textContent = COLS[w][0]; sw.style.color = COLS[ink][1]; };
      next(); return new Promise(res => { const t0 = performance.now(); const iv = setInterval(() => { const left = 20 - (performance.now() - t0) / 1000; resTxt(P, `Noch ${num(Math.max(0, left), 1)} s · ${score} Punkte`); if (left <= 0) { clearInterval(iv); sb.querySelectorAll('button').forEach(b => b.disabled = true); setTimeout(() => res({ v: score, text: score + ' Punkte' }), 700); } }, 100);
        sb.addEventListener('pointerdown', e => { const b = e.target.closest('.sbtn'); if (!b || b.disabled) return; e.preventDefault(); if (+b.dataset.i === cur) { score++; P.sfx.tick(); } else { score--; P.sfx.bad(); } next(); }); });
    },
    bot: s => { const v = Math.max(0, Math.round([8, 13, 18][s] + gauss() * 3)); return { v, text: v + ' Punkte' }; }
  };

  // ------------------------------------------------------------------ 7 Kopfrechnen
  const calc = {
    id: 'calc', name: 'Kopfrechnen', rules: 'Sechs Rechenaufgaben, so schnell wie möglich. Jede falsche Antwort kostet 3 Sekunden Strafzeit.', better: 'low', fmt: v => num(v, 1) + ' s',
    async play(P) {
      const probs = P.shared.p || (P.shared.p = Array.from({ length: 6 }, () => { const t = Math.floor(Math.random() * 3); let a, b, r, txt; if (t === 0) { a = 12 + Math.floor(Math.random() * 78); b = 11 + Math.floor(Math.random() * 60); r = a + b; txt = `${a} + ${b}`; } else if (t === 1) { a = 40 + Math.floor(Math.random() * 60); b = 11 + Math.floor(Math.random() * 29); r = a - b; txt = `${a} − ${b}`; } else { a = 3 + Math.floor(Math.random() * 10); b = 4 + Math.floor(Math.random() * 9); r = a * b; txt = `${a} × ${b}`; } const opts = new Set([r]); while (opts.size < 4) { const d = [-10, -2, -1, 1, 2, 10][Math.floor(Math.random() * 6)]; opts.add(Math.max(1, r + d + (Math.random() < 0.3 ? 1 : 0))); } return { txt, r, opts: shuffle([...opts]) }; }));
      const gb = head(P, 'Kopfrechnen', 'Wähle jeweils das richtige Ergebnis. Fehler = +3 s.'); gb.innerHTML = '<div class="sword calc" id="cq"></div><div class="cbtns" id="cb"></div>'; const cq = gb.querySelector('#cq'), cb = gb.querySelector('#cb'); const t0 = performance.now(); let pen = 0;
      for (let i = 0; i < probs.length; i++) { const pr = probs[i]; cq.textContent = pr.txt + ' = ?'; cb.innerHTML = ''; resTxt(P, `Aufgabe ${i + 1}/${probs.length}${pen ? ' · Strafe ' + pen + ' s' : ''}`); const c = await new Promise(res => pr.opts.forEach(o => { const b = document.createElement('button'); b.className = 'cbtn'; b.textContent = o; b.onclick = () => res(o); cb.appendChild(b); })); if (c !== pr.r) { pen += 3; P.sfx.bad(); } else P.sfx.tick(); }
      const t = (performance.now() - t0) / 1000 + pen; resTxt(P, `Fertig: ${num(t, 1)} s`); await wait(P, 900); return { v: t, text: num(t, 1) + ' s' };
    },
    bot: s => { const v = Math.max(8, [38, 26, 17][s] + gauss() * [8, 6, 3.5][s]); return { v, text: num(v, 1) + ' s' }; }
  };

  // ------------------------------------------------------------------ 8 Sortier-Blitz
  const sort = {
    id: 'sort', name: 'Sortier-Blitz', rules: 'Tippe die Zahlen der Größe nach – von klein nach groß. Ein falscher Tipp kostet 2 Sekunden.', better: 'low', fmt: v => num(v, 1) + ' s',
    async play(P) {
      const nums = P.shared.n || (P.shared.n = shuffle(Array.from({ length: 99 }, (_, i) => i + 1)).slice(0, 7)); const gb = head(P, 'Sortier-Blitz', 'Tippe die Zahlen von <b>klein nach groß</b>.'); gb.innerHTML = '<div class="tiles" id="tl"></div>'; const tl = gb.querySelector('#tl'); const order = [...nums].sort((a, b) => a - b); let idx = 0, pen = 0; const t0 = performance.now();
      return new Promise(res => { nums.forEach(n => { const b = document.createElement('button'); b.className = 'tile'; b.textContent = n; b.onclick = () => { if (b.disabled) return; if (n === order[idx]) { idx++; b.disabled = true; b.classList.add('done'); P.sfx.tick(); if (idx === order.length) { const t = (performance.now() - t0) / 1000 + pen; resTxt(P, `Fertig: ${num(t, 1)} s`); setTimeout(() => res({ v: t, text: num(t, 1) + ' s' }), 900); } } else { pen += 2; P.sfx.bad(); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 300); resTxt(P, `Strafe: ${pen} s`); } }; tl.appendChild(b); }); });
    },
    bot: s => { const v = Math.max(4, [14, 9.5, 6.5][s] + gauss() * [3, 2, 1.2][s]); return { v, text: num(v, 1) + ' s' }; }
  };

  window.SD_GAMES = [react, estimate, memory, tap, target, stroop, calc, sort];
  window.SD_UTIL = { gauss, rnd, shuffle, num };
})();
