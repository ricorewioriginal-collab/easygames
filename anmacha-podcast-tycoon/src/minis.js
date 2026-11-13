/* AnMaCha – Der Podcast: Minispiele der Live-Aufnahme mit Konsolen-Gefühl (eigene Zeichenfläche, Treffer-Wertung, Kombo, Partikel, Wackeln).
   Ein Bedienkonzept für alle Geräte: Steuerkreuz / Pfeiltasten / WASD + Ⓐ (Leertaste/Enter) – auf dem Handy direkt antippen.
   rhythm  – Themen-Rhythmus: Pfeile fallen auf die Trefferlinie, im Takt drücken (Thema einbringen)
   qte     – Pointen-Timing: Ringe schrumpfen auf Knöpfe, genau treffen, danach Lacher-Finale (Ⓐ hämmern)
   cables  – Kabelsalat: verknotete Kabel verfolgen und den richtigen Stecker zum Gerät finden
   mixer   – Rückkopplung: drei Regler im grünen Bereich halten, bevor es pfeift
   simon   – Soundboard: Tusch, Hupe (Gisela!), Applaus und Lacher nachspielen – die Folge wird immer länger
   Jedes Spiel meldet am Ende eine Qualität 0…1 an die Live-Aufnahme. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input;
  const M = AMC.Minis = {};
  const DIRS = ['left', 'down', 'up', 'right'];
  const ARROW = { left: '◀', down: '▼', up: '▲', right: '▶' };
  const COL = { left: '#ff4fa0', down: '#3dd6ff', up: '#6cff8a', right: '#ffd23f' };
  const FACE = { x: 'left', a: 'down', y: 'up', b: 'right' };   // Controller: Ⓧ Ⓐ Ⓨ Ⓑ spielen ebenfalls die vier Bahnen
  const sfx = n => AMC.Audio.sfx(n), note = (m, d, t, p) => AMC.Audio.note && AMC.Audio.note(m, d, t, p);
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

  function dirHit() {
    for (const d of DIRS) if (I.hit(d)) return d;
    const ph = I.padHits[0] || []; for (const k of ph) { if (FACE[k]) return FACE[k]; if (DIRS.includes(k)) return k; }   // Steuerkreuz auch im Emote-Modus
    return null;
  }
  const okHit = () => I.hit('ok') || (I.padHits[0] || []).includes('a');
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const helpTxt = (pad, kb, touch) => I.device === 'pad' ? pad : I.device === 'touch' ? touch : kb;

  /** box: Overlay-Element; o: Einstellungen je Spiel; done(q) */
  M.start = function (box, kind, o, done) {
    box.innerHTML = ''; box.hidden = false; box.className = 'sh-mini mg2 k-' + kind;
    const cv = document.createElement('canvas'); box.appendChild(cv);
    const g = cv.getContext('2d');
    const api = { W: 400, H: 300, g, t: 0, shake: 0, flashA: 0, flashC: '#fff', parts: [], pops: [], ended: false, q: 0 };
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, root.devicePixelRatio || 1); api.W = Math.max(240, r.width); api.H = Math.max(220, r.height); cv.width = Math.round(api.W * d); cv.height = Math.round(api.H * d); g.setTransform(d, 0, 0, d, 0, 0); };
    size();
    api.pop = (text, x, y, c, s) => api.pops.push({ text, x, y, c: c || '#fff', s: s || 26, t: 0 });
    api.burst = (x, y, c, n, sp) => { for (let i = 0; i < (n || 14); i++) { const a = Math.random() * 6.283, v = (sp || 160) * (0.4 + Math.random()); api.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.5 + Math.random() * 0.4, c, s: 2 + Math.random() * 3 }); } };
    api.flash = (c, a) => { api.flashC = c; api.flashA = a || 0.35; };
    api.end = q => { if (api.ended) return; api.ended = true; api.q = U.clamp(q, 0, 1); api.endT = 0; const w = q >= 0.95 ? ['PERFEKT!', '#ffd23f'] : q >= 0.75 ? ['STARK!', '#6cff8a'] : q >= 0.45 ? ['OKAY', '#3dd6ff'] : ['AUTSCH …', '#ff6a6a']; api.pop(w[0], api.W / 2, api.H / 2, w[1], 54); sfx(q >= 0.75 ? 'perfect' : q >= 0.45 ? 'combo' : 'miss'); if (q >= 0.75) api.burst(api.W / 2, api.H / 2, w[1], 40, 300); };
    const game = GAMES[kind](o, api);
    let taps = [];
    cv.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const r = cv.getBoundingClientRect(); taps.push({ x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId, type: 'down' }); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* egal */ } });
    cv.addEventListener('pointermove', e => { if (!e.buttons) return; const r = cv.getBoundingClientRect(); taps.push({ x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId, type: 'move' }); });
    cv.addEventListener('pointerup', e => { taps.push({ type: 'up', id: e.pointerId }); });
    root.addEventListener('resize', size);
    const ctl = {
      kind,
      update(dt) {
        api.t += dt;
        if (!api.ended) { game.update(dt, taps); } else if ((api.endT += dt) > 1.0 && !ctl.fired) { ctl.fired = true; done(api.q); }
        taps = [];
        // Zeichnen
        const W = api.W, H = api.H; g.save();
        if (api.shake > 0) { g.translate((Math.random() - 0.5) * api.shake, (Math.random() - 0.5) * api.shake); api.shake = Math.max(0, api.shake - dt * 60); }
        const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#141833'); bg.addColorStop(1, '#07080f');
        g.fillStyle = bg; rr(g, 0, 0, W, H, 22); g.fill();
        // Raster wie auf einem Studio-Monitor
        g.globalAlpha = 0.06; g.fillStyle = '#fff'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1); g.globalAlpha = 1;
        game.draw(g, W, H);
        // Kopfzeile
        g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, 10, 10, W - 20, 34, 12); g.fill();
        g.font = '700 16px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = o.color || '#ff8a1e'; g.fillText(game.title || o.label || '', 22, 27);
        if (game.right) { g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText(game.right(), W - 22, 27); }
        if (game.bar != null) { const b = U.clamp(game.bar(), 0, 1); g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, 16, 48, W - 32, 5, 3); g.fill(); g.fillStyle = b < 0.25 ? '#ff5a5a' : '#ff8a1e'; rr(g, 16, 48, (W - 32) * b, 5, 3); g.fill(); }
        if (game.help) { g.font = '500 13px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(game.help(), W / 2, H - 14); }
        // Partikel und Texte
        for (const p of api.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; g.globalAlpha = Math.max(0, Math.min(1, p.life * 2)); g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
        api.parts = api.parts.filter(p => p.life > 0); g.globalAlpha = 1;
        for (const p of api.pops) { p.t += dt; const k = Math.min(1, p.t * 7), a = Math.max(0, 1 - Math.max(0, p.t - 0.5) * 2.2); g.globalAlpha = a; g.font = '800 ' + Math.round(p.s * (0.6 + 0.5 * k - 0.1 * Math.max(0, k - 0.8))) + 'px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(p.text, p.x, p.y - p.t * 30); g.fillStyle = p.c; g.fillText(p.text, p.x, p.y - p.t * 30); }
        api.pops = api.pops.filter(p => p.t < 1); g.globalAlpha = 1;
        if (api.flashA > 0) { g.globalAlpha = api.flashA; g.fillStyle = api.flashC; rr(g, 0, 0, W, H, 22); g.fill(); g.globalAlpha = 1; api.flashA = Math.max(0, api.flashA - dt * 2.2); }
        g.restore();
        g.lineWidth = 2; g.strokeStyle = 'rgba(255,138,30,.65)'; rr(g, 1, 1, W - 2, H - 2, 21); g.stroke();
      },
      destroy() { root.removeEventListener('resize', size); if (game.stop) game.stop(); }
    };
    return ctl;
  };

  const GAMES = {};

  // ------------------------------------------------------------------ Themen-Rhythmus
  GAMES.rhythm = function (o, api) {
    const song = o.song, slow = song ? Math.max(1, 0.11 / (song.step / 1000) * (o.hard ? 0.8 : 1)) : 1, stepS = song ? song.step / 1000 * slow : 0;
    const bpm = song ? 60 / (stepS * 4) : o.bpm || 112, beat = 60 / bpm, travel = 1.5 / (o.speed || 1), lead = beat * 4;
    const notes = []; let t = lead, last = '', same = 0, n = o.n || 10, s0 = 0, songSec = 0;
    if (song) {
      // Echte Melodie aus Klavierlicht: Tonhöhe bestimmt die Bahn, Treffer spielen den Ton
      const mel = song.mel.slice().sort((a, b) => a[0] - b[0]), gap = (o.hard ? 0.3 : 0.42) / stepS;
      s0 = mel[0][0]; let prev = -1e9;
      for (const [st, m, l] of mel) { if (notes.length >= n) break; if (st - prev < gap) continue; prev = st; notes.push({ t: lead + (st - s0) * stepS, m, l: l * stepS, done: false, q: 0 }); }
      const ps = notes.map(x => x.m).sort((a, b) => a - b), qn = k => ps[Math.min(ps.length - 1, Math.floor(ps.length * k))];
      const cut = [qn(0.25), qn(0.5), qn(0.75)];
      notes.forEach((x, i) => { let li = x.m <= cut[0] ? 0 : x.m <= cut[1] ? 1 : x.m <= cut[2] ? 2 : 3; if (i && notes[i - 1].m !== x.m && DIRS[li] === notes[i - 1].d) li = (li + (x.m > notes[i - 1].m ? 1 : 3)) % 4; x.d = DIRS[li]; });
      n = notes.length; t = notes[n - 1].t + 0.4; songSec = t - lead + 0.6;
    } else for (let i = 0; i < n; i++) {
      let d = U.pick(DIRS); if (d === last && ++same > 1) { d = U.pick(DIRS.filter(x => x !== last)); same = 0; } last = d;
      notes.push({ t, d, done: false, q: 0 });
      t += beat * (o.hard && Math.random() < 0.35 ? 0.5 : Math.random() < 0.25 ? 2 : 1);
    }
    let accomp = null;
    const endT = t + 0.8; let time = 0, combo = 0, best = 0, score = 0, hits = 0, count = 3, flashL = {}, mel = 0;
    const laneX = (W, d) => W / 2 + (DIRS.indexOf(d) - 1.5) * Math.min(86, W / 5.2);
    const judge = (d, W, H) => {
      flashL[d] = 0.15;
      const cand = notes.filter(nn => !nn.done && nn.d === d && Math.abs(nn.t - time) < 0.25).sort((a, b) => Math.abs(a.t - time) - Math.abs(b.t - time))[0];
      if (!cand) { sfx('tick'); return; }
      const e = Math.abs(cand.t - time), q = e < 0.07 ? 1 : e < 0.13 ? 0.75 : 0.4; cand.done = true; cand.q = q; score += q; hits++;
      combo = q >= 0.75 ? combo + 1 : 0; best = Math.max(best, combo);
      const x = laneX(W, d), y = H * 0.78;
      api.pop(q >= 1 ? 'PERFEKT' : q >= 0.75 ? 'GUT' : 'OK', x, y - 34, q >= 1 ? '#ffd23f' : q >= 0.75 ? '#6cff8a' : '#3dd6ff', 20);
      api.burst(x, y, COL[d], q >= 1 ? 18 : 8);
      if (cand.m) AMC.Audio.piano(cand.m, 0, Math.max(0.2, cand.l), q >= 1 ? 0.85 : 0.6); else note(60 + PENTA[mel++ % PENTA.length] + (q >= 1 ? 12 : 0), 0.22, 'triangle', 0.12);
      if (o.onJudge) o.onJudge(q, combo);
      if (combo && combo % 5 === 0) { api.pop(combo + 'er KOMBO!', api.W / 2, H * 0.35, '#ff8a1e', 30); sfx('combo'); }
    };
    return {
      title: (song ? '🎹 ' : '🎤 ') + (o.label || 'Thema'),
      stop() { if (accomp) accomp(); },
      right: () => (combo > 1 ? '🔥 ' + combo + '  ' : '') + Math.round(score / n * 100) + ' %',
      bar: () => 1 - time / endT,
      help: () => helpTxt('Steuerkreuz oder Ⓧ Ⓐ Ⓨ Ⓑ im Takt', '← ↓ ↑ → (oder WASD) im Takt drücken', 'Im Takt auf die Bahn tippen'),
      update(dt, taps) {
        time += dt;
        if (time < lead) { const c = 3 - Math.floor(time / beat); if (c !== count && c >= 0) { count = c; if (c > 0) { api.pop(String(c), api.W / 2, api.H / 2, '#fff', 64); sfx('drum'); } else { api.pop('LOS!', api.W / 2, api.H / 2, '#ff8a1e', 60); sfx('drum'); } } }
        if (song && !accomp && time >= lead) accomp = AMC.Audio.playSong(song, { from: s0, sec: songSec, slow, mel: false, vel: 0.5 });
        const d = dirHit(); if (d) judge(d, api.W, api.H);
        for (const tp of taps) if (tp.type === 'down') { let bestD = DIRS[0], bd = 1e9; for (const dd of DIRS) { const dx = Math.abs(laneX(api.W, dd) - tp.x); if (dx < bd) { bd = dx; bestD = dd; } } judge(bestD, api.W, api.H); }
        for (const nn of notes) if (!nn.done && time - nn.t > 0.25) { nn.done = true; nn.q = 0; combo = 0; if (o.onJudge) o.onJudge(0, 0); api.pop('VERPASST', laneX(api.W, nn.d), api.H * 0.78 - 34, '#ff6a6a', 16); api.shake = 6; }
        for (const k in flashL) flashL[k] -= dt;
        if (time > endT) api.end(score / n);
      },
      draw(g, W, H) {
        const hy = H * 0.78, top = 64, lw = Math.min(70, W / 6);
        for (const d of DIRS) {
          const x = laneX(W, d);
          const gr = g.createLinearGradient(0, top, 0, hy); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, (flashL[d] > 0 ? COL[d] : 'rgba(255,255,255,.10)'));
          g.fillStyle = gr; g.globalAlpha = flashL[d] > 0 ? 0.55 : 1; rr(g, x - lw / 2, top, lw, hy - top + 28, 12); g.fill(); g.globalAlpha = 1;
          // Empfänger
          g.lineWidth = 3; g.strokeStyle = COL[d]; g.beginPath(); g.arc(x, hy, lw * 0.36, 0, 7); g.stroke();
          g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 ' + Math.round(lw * 0.34) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ARROW[d], x, hy + 1);
        }
        // Takt-Linien
        const bpmL = 60 / (o.bpm || 112);
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
        for (let k = -1; k < 6; k++) { const bt = Math.ceil(time / bpmL) * bpmL + k * bpmL, y = hy - (bt - time) / travel * (hy - top); if (y > top && y < hy) { g.beginPath(); g.moveTo(laneX(W, 'left') - lw / 2, y); g.lineTo(laneX(W, 'right') + lw / 2, y); g.stroke(); } }
        for (const nn of notes) {
          if (nn.done) continue;
          const y = hy - (nn.t - time) / travel * (hy - top); if (y < top - 30 || y > H) continue;
          const x = laneX(W, nn.d), r = lw * 0.34;
          g.shadowColor = COL[nn.d]; g.shadowBlur = 16; g.fillStyle = COL[nn.d]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.shadowBlur = 0;
          g.fillStyle = '#10131f'; g.font = '800 ' + Math.round(r * 1.05) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ARROW[nn.d], x, y + 1);
        }
        if (combo > 2) { g.font = '800 22px Fredoka, system-ui'; g.fillStyle = 'rgba(255,138,30,.9)'; g.textAlign = 'left'; g.fillText('×' + combo, 20, H * 0.5); }
      }
    };
  };

  // ------------------------------------------------------------------ Pointen-Timing + Lacher-Finale
  GAMES.qte = function (o, api) {
    const n = o.n || 4, life = 1.25 / (o.speed || 1), list = [];
    for (let i = 0; i < n; i++) list.push({ d: U.pick(DIRS), at: 0.6 + i * (life * 0.85), x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.36, done: false, q: 0 });
    let time = 0, phase = 'qte', mash = 0, mashT = 0; const mashDur = 2.6; let score = 0;
    const cur = () => list.find(p => !p.done && time >= p.at);
    const rOf = p => { const k = (time - p.at) / life; return 1 - k; };   // 1 → 0 (Ziel 0,3)
    const judge = (p, ok) => {
      const k = rOf(p), e = Math.abs(k - 0.3); const q = !ok ? 0 : e < 0.06 ? 1 : e < 0.14 ? 0.75 : e < 0.24 ? 0.4 : 0.1;
      p.done = true; p.q = q; score += q; const X = p.x * api.W, Y = p.y * api.H;
      api.pop(q >= 1 ? 'PERFEKT' : q >= 0.75 ? 'GUT' : q > 0.2 ? 'knapp' : 'DANEBEN', X, Y - 50, q >= 0.75 ? '#ffd23f' : q > 0.2 ? '#3dd6ff' : '#ff6a6a', 22);
      if (q >= 0.75) { api.burst(X, Y, COL[p.d], 18); note(72 + (q >= 1 ? 7 : 0), 0.18, 'square', 0.08); } else { sfx('miss'); api.shake = 8; }
    };
    return {
      title: '😂 Pointe',
      right: () => phase === 'qte' ? list.filter(p => p.done).length + '/' + n : '😂 ' + Math.round(mash * 100) + ' %',
      bar: () => phase === 'qte' ? 1 - list.filter(p => p.done).length / n : 1 - mashT / mashDur,
      help: () => phase === 'qte' ? helpTxt('Richtung drücken, wenn der Ring den Knopf trifft', 'Pfeiltaste drücken, wenn der Ring den Knopf trifft', 'Antippen, wenn der Ring den Knopf trifft') : helpTxt('Ⓐ hämmern – Lacher!', 'Leertaste hämmern – Lacher!', 'Schnell tippen – Lacher!'),
      update(dt, taps) {
        time += dt;
        if (phase === 'qte') {
          const p = cur();
          if (p) {
            const d = dirHit(); if (d) judge(p, d === p.d);
            for (const tp of taps) if (tp.type === 'down' && !p.done) { const dx = tp.x - p.x * api.W, dy = tp.y - p.y * api.H; judge(p, Math.hypot(dx, dy) < 90); }
            if (!p.done && rOf(p) < 0.05) judge(p, false);
          }
          if (list.every(q => q.done)) { phase = 'mash'; api.pop('LACHER-FINALE!', api.W / 2, api.H * 0.3, '#ff8a1e', 30); sfx('whoosh'); }
        } else {
          mashT += dt; mash = Math.max(0, mash - dt * 0.12);
          let presses = okHit() ? 1 : 0; presses += taps.filter(t => t.type === 'down').length; const dd = dirHit(); if (dd) presses++;
          if (presses) { mash = Math.min(1, mash + 0.075 * presses); sfx('tick'); if (Math.random() < 0.3) api.burst(api.W / 2 + (Math.random() - 0.5) * 200, api.H * 0.62, U.pick(['#ffd23f', '#ff8a1e', '#ff4fa0']), 4); }
          if (mash >= 1 || mashT > mashDur) { if (mash > 0.6) sfx('laugh'); api.end(score / n * 0.7 + mash * 0.3); }
        }
      },
      draw(g, W, H) {
        if (phase === 'qte') {
          for (const p of list) {
            if (p.done || time < p.at - 0.3) continue;
            const X = p.x * W, Y = p.y * H, R = Math.min(42, W / 10), k = time < p.at ? 1 : rOf(p);
            g.globalAlpha = time < p.at ? 0.35 : 1;
            g.fillStyle = COL[p.d]; g.shadowColor = COL[p.d]; g.shadowBlur = 20; g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); g.shadowBlur = 0;
            g.fillStyle = '#10131f'; g.font = '800 ' + Math.round(R) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ARROW[p.d], X, Y + 2);
            g.lineWidth = 4; g.strokeStyle = '#fff'; g.beginPath(); g.arc(X, Y, R * (0.7 + k * 3.3), 0, 7); g.stroke();
            g.globalAlpha = 1;
          }
        } else {
          const w = Math.min(420, W - 60), x = (W - w) / 2, y = H * 0.55;
          g.font = '800 ' + Math.round(40 + mash * 26) + 'px Fredoka, system-ui'; g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText('HA'.repeat(1 + Math.floor(mash * 4)) + '!', W / 2 + (Math.random() - 0.5) * mash * 6, H * 0.4);
          g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, x, y, w, 26, 13); g.fill();
          const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#ff8a1e'); gr.addColorStop(1, '#ffd23f'); g.fillStyle = gr; rr(g, x, y, Math.max(26, w * mash), 26, 13); g.fill();
        }
      }
    };
  };

  // ------------------------------------------------------------------ Kabelsalat (Kabel verfolgen)
  GAMES.cables = function (o, api) {
    const DEV = [['🎙️', 'Mikro Andrew', '#ff8a1e'], ['🎙️', 'Mikro Marco', '#3dd6ff'], ['🎵', 'Musik', '#ff4fa0'], ['📞', 'Hörer-Telefon', '#6cff8a'], ['🎛️', 'Mischpult', '#b36cff']];
    const n = o.n || 4, devs = DEV.slice(0, n), perm = U.shuffle(devs.map((_, i) => i));   // Stecker i (links) → Gerät perm[i] (rechts)
    const curves = perm.map(() => ({ a: Math.random(), b: Math.random(), c: Math.random() }));
    let time = 0; const limit = o.time || 18; let ask = 0, sel = 0, solved = [], wrong = 0, cool = 0;
    const plugY = (H, i) => 90 + i * ((H - 140) / Math.max(1, n - 1));
    return {
      title: '🔌 Kabelsalat',
      right: () => solved.length + '/' + n,
      bar: () => 1 - time / limit,
      help: () => helpTxt('↑↓ Stecker wählen · Ⓐ einstecken', '↑↓ Stecker wählen · Leertaste einstecken', 'Stecker antippen'),
      update(dt, taps) {
        time += dt; cool -= dt;
        const try_ = i => {
          if (cool > 0 || solved.includes(i)) return;
          if (perm[i] === ask) { solved.push(i); sfx('plug'); api.burst(api.W * 0.12, plugY(api.H, i), devs[ask][2], 16); api.pop('Verbunden!', api.W / 2, api.H * 0.2, devs[ask][2], 22); ask++; while (ask < n && solved.some(j => perm[j] === ask)) ask++; }
          else { wrong++; time += 2; cool = 0.4; sfx('spark'); api.shake = 12; api.flash('#ff3a3a', 0.3); api.burst(api.W * 0.12, plugY(api.H, i), '#fff', 20, 260); api.pop('ZZZAP! −2 s', api.W / 2, api.H * 0.2, '#ff6a6a', 22); }
        };
        if (I.hit('up')) { sel = (sel + n - 1) % n; sfx('move'); } if (I.hit('down')) { sel = (sel + 1) % n; sfx('move'); }
        if (okHit()) try_(sel);
        for (const tp of taps) if (tp.type === 'down') { let bi = -1, bd = 1e9; for (let i = 0; i < n; i++) { const d = Math.hypot(tp.x - api.W * 0.12, tp.y - plugY(api.H, i)); if (d < bd) { bd = d; bi = i; } } if (bd < 70 || tp.x < api.W * 0.35) { sel = bi; try_(bi); } }
        if (ask >= n) api.end(Math.max(0.3, 1 - wrong * 0.18 - Math.max(0, time - limit * 0.6) / limit));
        else if (time > limit) api.end(solved.length / n * 0.6);
      },
      draw(g, W, H) {
        const x0 = W * 0.12, x1 = W * (W > 520 ? 0.74 : 0.86);
        for (let i = 0; i < n; i++) {
          const y0 = plugY(H, i), y1 = plugY(H, perm[i]), cv = curves[i], ok = solved.includes(i);
          const cx1 = W * (0.3 + cv.a * 0.15), cy1 = 70 + cv.b * (H - 120), cx2 = W * (0.55 + cv.c * 0.15), cy2 = 70 + (1 - cv.b) * (H - 120);
          g.lineCap = 'round';
          g.lineWidth = 11; g.strokeStyle = '#05060a'; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1); g.stroke();
          g.lineWidth = 7; g.strokeStyle = ok ? devs[perm[i]][2] : i === sel ? '#c9cede' : '#5d6378'; if (ok) { g.shadowColor = devs[perm[i]][2]; g.shadowBlur = 12; }
          g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1); g.stroke(); g.shadowBlur = 0;
        }
        for (let i = 0; i < n; i++) {   // Stecker links
          const y = plugY(H, i); g.fillStyle = i === sel ? '#ff8a1e' : '#2a2f45'; rr(g, x0 - 34, y - 15, 40, 30, 8); g.fill();
          g.fillStyle = '#d8dbe6'; g.fillRect(x0 - 44, y - 5, 12, 4); g.fillRect(x0 - 44, y + 2, 12, 4);
          g.fillStyle = '#fff'; g.font = '700 14px Fredoka, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String.fromCharCode(65 + i), x0 - 14, y + 1);
        }
        for (let k = 0; k < n; k++) {   // Geräte rechts
          const y = plugY(H, k), d = devs[k], done = solved.some(j => perm[j] === k), act = k === ask;
          g.fillStyle = done ? d[2] : act ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)'; rr(g, x1 + 4, y - 17, W - x1 - 14, 34, 10); g.fill();
          if (act) { g.lineWidth = 2; g.strokeStyle = '#ffd23f'; rr(g, x1 + 4, y - 17, W - x1 - 14, 34, 10); g.stroke(); }
          g.fillStyle = done ? '#10131f' : '#fff'; g.font = '600 13px Fredoka, system-ui'; g.textAlign = 'left'; g.fillText(d[0] + (W > 520 ? ' ' + d[1] : ''), x1 + 12, y + 1);
        }
        if (ask < n) { g.font = '700 15px Fredoka, system-ui'; g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText('Welcher Stecker führt zu ' + devs[ask][0] + ' ' + devs[ask][1] + '?', W / 2, 70); }
      }
    };
  };

  // ------------------------------------------------------------------ Mischpult: Rückkopplung verhindern
  GAMES.mixer = function (o, api) {
    const CH = [['Andrew', '#ff9d2e'], ['Marco', '#3dd6ff'], ['Musik', '#ff4fa0']];
    const f = CH.map(() => ({ v: 0.25 + Math.random() * 0.5, vel: 0 }));
    const lo = 0.42, hi = 0.68, dur = o.time || 9;
    let time = 0, sel = 0, good = 0, fb = 0, sq = 0, drag = null;
    const fx = (W, i) => W / 2 + (i - 1) * Math.min(150, W / 3.6);
    const ft = H => 82, fh = H => H - 150;
    return {
      title: '🔊 Rückkopplung!',
      right: () => Math.round(good / dur * 100) + ' % sauber',
      bar: () => 1 - time / dur,
      help: () => helpTxt('←→ Regler wählen · ↑↓ schieben', '←→ Regler wählen · ↑↓ schieben', 'Regler mit dem Finger schieben'),
      update(dt, taps) {
        time += dt;
        if (I.hit('left')) { sel = (sel + 2) % 3; sfx('move'); } if (I.hit('right')) { sel = (sel + 1) % 3; sfx('move'); }
        let mv = -(I.move.y || 0); if (I.keys.has('ArrowUp') || I.keys.has('KeyW')) mv = 1; if (I.keys.has('ArrowDown') || I.keys.has('KeyS')) mv = -1;
        const pad = I.pads && I.pads()[0]; if (pad && pad.buttons[12] && pad.buttons[12].pressed) mv = 1; if (pad && pad.buttons[13] && pad.buttons[13].pressed) mv = -1;
        f[sel].v = U.clamp(f[sel].v + mv * dt * 0.9, 0, 1);
        for (const tp of taps) {
          if (tp.type === 'down') { let bi = 0, bd = 1e9; for (let i = 0; i < 3; i++) { const d = Math.abs(tp.x - fx(api.W, i)); if (d < bd) { bd = d; bi = i; } } sel = bi; drag = tp.id; }
          if ((tp.type === 'down' || tp.type === 'move') && tp.id === drag) f[sel].v = U.clamp(1 - (tp.y - ft(api.H)) / fh(api.H), 0, 1);
          if (tp.type === 'up' && tp.id === drag) drag = null;
        }
        // Störungen: Regler wandern von selbst
        for (const c of f) { c.vel += (Math.random() - 0.5) * dt * (1.6 + time * 0.12); c.vel *= 0.985; c.v = U.clamp(c.v + c.vel * dt, 0, 1); if (c.v <= 0 || c.v >= 1) c.vel *= -0.5; }
        const out = f.filter(c => c.v < lo || c.v > hi).length, hot = f.some(c => c.v > hi + 0.12);
        if (!out) { good += dt; fb = Math.max(0, fb - dt * 0.35); } else fb = Math.min(1, fb + dt * (hot ? 0.28 : 0.12) * out);
        if (hot && (sq -= dt) <= 0) { sq = 0.6; sfx('feedback'); api.shake = 4; }
        if (fb >= 1) { api.flash('#ff3a3a', 0.5); api.shake = 16; api.end(good / dur * 0.6); }
        else if (time >= dur) api.end(Math.min(1, good / dur * 1.15));
      },
      draw(g, W, H) {
        const top = ft(H), h = fh(H);
        for (let i = 0; i < 3; i++) {
          const x = fx(W, i), c = f[i], s = i === sel;
          g.fillStyle = 'rgba(255,255,255,.06)'; rr(g, x - 34, top - 10, 68, h + 34, 14); g.fill();
          if (s) { g.lineWidth = 2; g.strokeStyle = '#ffd23f'; rr(g, x - 34, top - 10, 68, h + 34, 14); g.stroke(); }
          g.fillStyle = 'rgba(255,60,60,.25)'; g.fillRect(x - 6, top, 12, h * (1 - hi));
          g.fillStyle = 'rgba(80,255,140,.35)'; g.fillRect(x - 6, top + h * (1 - hi), 12, h * (hi - lo));
          g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x - 6, top + h * (1 - lo), 12, h * lo);
          const y = top + h * (1 - c.v), inz = c.v >= lo && c.v <= hi;
          g.fillStyle = inz ? '#e8ecf5' : '#ff6a6a'; g.shadowColor = inz ? CH[i][1] : '#ff3a3a'; g.shadowBlur = 14; rr(g, x - 26, y - 11, 52, 22, 6); g.fill(); g.shadowBlur = 0;
          g.fillStyle = '#10131f'; g.fillRect(x - 20, y - 1, 40, 2);
          g.fillStyle = CH[i][1]; g.font = '700 13px Fredoka, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(CH[i][0], x, top + h + 14);
        }
        // Rückkopplungs-Anzeige
        const w = Math.min(320, W - 60), x = (W - w) / 2, y = H - 40;
        g.fillStyle = 'rgba(255,255,255,.1)'; rr(g, x, y - 18, w, 8, 4); g.fill(); g.fillStyle = fb > 0.66 ? '#ff3a3a' : fb > 0.33 ? '#ff8a1e' : '#6cff8a'; rr(g, x, y - 18, Math.max(8, w * fb), 8, 4); g.fill();
        if (fb > 0.5) { g.globalAlpha = (fb - 0.5) * 0.6 * (0.5 + 0.5 * Math.sin(time * 30)); g.fillStyle = '#ff2030'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
      }
    };
  };

  // ------------------------------------------------------------------ Soundboard-Memory
  GAMES.simon = function (o, api) {
    const PADS = { up: ['🥁', 'Tusch', '#ffd23f', 72], left: ['📯', 'Giselas Hupe', '#ff8a1e', 64], right: ['👏', 'Applaus', '#6cff8a', 67], down: ['😂', 'Lacher', '#ff4fa0', 60] };
    const rounds = o.rounds || 3, startLen = o.len || 3, seq = []; for (let i = 0; i < startLen + rounds; i++) seq.push(U.pick(DIRS));
    let round = 0, phase = 'show', i = 0, t = 0, lit = null, litT = 0, input = 0, ok = 0, time = 0;
    const len = () => startLen + round;
    const play = d => { lit = d; litT = 0.32; const p = PADS[d]; note(p[3], 0.3, 'square', 0.1); note(p[3] + 7, 0.3, 'triangle', 0.08); if (d === 'left') sfx('horn'); if (d === 'right') sfx('applause'); if (d === 'down') sfx('laugh'); if (d === 'up') sfx('drum'); };
    const pos = (W, H, d) => { const cx = W / 2, cy = H / 2 + 6, r = Math.min(96, Math.min(W, H) / 4.2); return { up: [cx, cy - r], down: [cx, cy + r], left: [cx - r * 1.35, cy], right: [cx + r * 1.35, cy] }[d]; };
    return {
      title: '🎛️ Soundboard',
      right: () => 'Runde ' + Math.min(rounds, round + 1) + '/' + rounds,
      bar: () => 1 - round / rounds,
      help: () => phase === 'show' ? 'Gut zuhören und zuschauen …' : helpTxt('Nachspielen: Steuerkreuz', 'Nachspielen: Pfeiltasten', 'Nachspielen: Pads antippen'),
      update(dt, taps) {
        time += dt; litT -= dt; if (litT <= 0) lit = null;
        if (phase === 'show') {
          t += dt; if (t > 0.62) { t = 0; if (i < len()) play(seq[i++]); else { phase = 'input'; input = 0; api.pop('DU BIST DRAN!', api.W / 2, 74, '#ffd23f', 20); } }
        } else if (phase === 'input') {
          let d = dirHit();
          for (const tp of taps) if (tp.type === 'down') { let bd = 1e9; for (const dd of DIRS) { const p = pos(api.W, api.H, dd), dist = Math.hypot(tp.x - p[0], tp.y - p[1]); if (dist < bd) { bd = dist; d = dd; } } }
          if (d) {
            play(d); const P = pos(api.W, api.H, d);
            if (d === seq[input]) { input++; api.burst(P[0], P[1], PADS[d][2], 10); if (input >= len()) { ok++; round++; api.pop('RICHTIG!', api.W / 2, api.H * 0.22, '#6cff8a', 26); sfx('combo'); if (round >= rounds) return api.end(ok / rounds); phase = 'show'; i = 0; t = -0.6; } }
            else { api.shake = 12; api.flash('#ff3a3a', 0.3); api.pop('FALSCH!', api.W / 2, api.H * 0.22, '#ff6a6a', 26); sfx('miss'); round++; if (round >= rounds) return api.end(ok / rounds * 0.9 + 0.05); phase = 'show'; i = 0; t = -0.8; }
          }
        }
      },
      draw(g, W, H) {
        for (const d of DIRS) {
          const p = pos(W, H, d), P = PADS[d], on = lit === d, r = Math.min(52, Math.min(W, H) / 7.5);
          g.fillStyle = on ? P[2] : 'rgba(255,255,255,.08)'; if (on) { g.shadowColor = P[2]; g.shadowBlur = 30; }
          rr(g, p[0] - r, p[1] - r * 0.8, r * 2, r * 1.6, 16); g.fill(); g.shadowBlur = 0;
          g.lineWidth = 2; g.strokeStyle = P[2]; rr(g, p[0] - r, p[1] - r * 0.8, r * 2, r * 1.6, 16); g.stroke();
          g.font = Math.round(r * 0.75) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(P[0], p[0], p[1] - 6);
          g.font = '600 11px Fredoka, system-ui'; g.fillStyle = on ? '#10131f' : '#fff'; g.fillText(P[1] + ' ' + ARROW[d], p[0], p[1] + r * 0.5);
        }
        if (phase === 'input') { g.font = '700 14px Fredoka, system-ui'; g.fillStyle = '#ffd23f'; g.textAlign = 'center'; g.fillText(input + ' / ' + len(), W / 2, H / 2 + 6); }
      }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
