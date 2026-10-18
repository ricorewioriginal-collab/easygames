'use strict';
/* AnMaCha Casino – große Einblendungen: Feature-Hinweise, Big Win mit Hochzählen, Risiko-Leiter (Rot/Schwarz). */
(function (G) {
  const C = G.CasinoCore, S = G.CasinoSymbols, L = G.CasinoLogic, T = G.CasinoTables;
  const { el, fmt, wallet, sound, wait } = C;
  const open = new Set();
  const mk = (cls, theme) => { const o = el('div', 'ovl ' + cls); if (theme) { o.style.setProperty('--a', theme.a); o.style.setProperty('--b', theme.b); } document.body.appendChild(o); return o; };

  function splash(html, theme, ms) {
    return new Promise(res => {
      const o = mk('splash', theme);
      o.innerHTML = `<div class="sbox">${html}<button class="pill gold" data-nav data-default>WEITER</button></div>`;
      o.querySelectorAll('canvas[data-art]').forEach(c => { c.width = c.height = 120; const g = c.getContext('2d'); g.scale(120 / 200, 120 / 200); S.drawArt(g, c.dataset.art); });
      let done = false; const unl = C.layer(o, () => close());
      const close = () => { if (done) return; done = true; unl(); open.delete(close); o.classList.add('out'); setTimeout(() => o.remove(), 250); res(); };
      open.add(close); o.addEventListener('click', close); setTimeout(close, ms || 2000);
    });
  }

  // Spielhallen-Ankündigung: Strahlen, Lauflicht-Rahmen, Buchstaben fallen ein, Freispiel-Zahl zählt hoch
  function featureIntro(title, sub, theme, opt) {
    opt = opt || {};
    return new Promise(res => {
      const o = mk('intro', theme), sp = C.data.turbo ? 0.6 : 1;
      const letters = [...title].map((ch, i) => ch === ' ' ? '<i> </i>' : `<span style="--i:${i}">${C.esc(ch)}</span>`).join('');
      o.innerHTML = `<div class="rays"></div><div class="bulbs"></div><div class="sbox"><h2>${letters}</h2>` +
        (opt.count ? `<p class="icount">0</p>` : '') + (sub ? `<div class="isub">${sub}</div>` : '') + `<button class="pill gold" data-nav data-default>LOS GEHT'S</button></div>`;
      o.querySelectorAll('canvas[data-art]').forEach(c => { c.width = c.height = 120; const g = c.getContext('2d'); g.scale(120 / 200, 120 / 200); S.drawArt(g, c.dataset.art); });
      sound.play('fanfare');
      let done = false, timer = 0; const cnt = o.querySelector('.icount');
      if (cnt) {                                                    // Freispiele zählen hoch, Tick für Tick
        let k = 0; const step = () => { if (done) return; k++; cnt.textContent = k; sound.play('tick'); cnt.classList.remove('bump'); void cnt.offsetWidth; cnt.classList.add('bump');
          if (k < opt.count) timer = setTimeout(step, Math.max(40, 700 / opt.count) * sp); else sound.play('lock'); };
        timer = setTimeout(step, 500 * sp);
      }
      const unl = C.layer(o, () => close());
      const close = () => { if (done) return; done = true; clearTimeout(timer); unl(); open.delete(close); o.classList.add('out'); setTimeout(() => o.remove(), 250); res(); };
      open.add(close); o.addEventListener('click', close); setTimeout(close, (opt.ms || 3000) * sp);
    });
  }

  // Großer Gewinn: zählt hoch, steigt dabei über die Stufen (BIG → MEGA → EPIC)
  function bigWin(title, amount, theme, opt) {
    opt = opt || {};
    return new Promise(res => {
      const o = mk('bigwin', theme), tiers = (opt.tiers || []).filter(t => t.v <= amount);
      o.innerHTML = `<div class="rays"></div><div class="bulbs"></div><div class="sbox"><h1>${title}</h1><p class="amt">0</p><button class="pill gold" data-nav data-default>EINSAMMELN</button></div>`;
      const amt = o.querySelector('.amt'), h1 = o.querySelector('h1'), dur = (2600 + tiers.length * 1300) * (C.data.turbo ? 0.6 : 1), t0 = performance.now();
      let done = false, raf = 0, last = 0, finished = false, tier = 0;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), v = amount * (1 - Math.pow(1 - k, 2)); amt.textContent = fmt(v);
        if (tier < tiers.length && v >= tiers[tier].v) { h1.textContent = tiers[tier].t; h1.classList.remove('lvl'); void h1.offsetWidth; h1.classList.add('lvl'); sound.play('big'); tier++; }
        if (now - last > 80) { sound.play('count'); last = now; }
        if (k < 1) raf = requestAnimationFrame(tick); else { finished = true; setTimeout(close, 1400); }
      };
      const closer = () => close(true);
      raf = requestAnimationFrame(tick);
      const unl = C.layer(o, closer);
      function close(force) {
        if (done) return;
        if (!finished && !force) { cancelAnimationFrame(raf); amt.textContent = fmt(amount); if (tiers.length) h1.textContent = tiers[tiers.length - 1].t; finished = true; setTimeout(close, 900); return; }
        done = true; cancelAnimationFrame(raf); unl(); open.delete(closer); o.classList.add('out'); setTimeout(() => o.remove(), 250); res();
      }
      open.add(closer); o.addEventListener('click', () => close());
    });
  }

  // Risiko: Gewinn auf Rot oder Schwarz setzen, bis zu 5 Stufen. Liefert den behaltenen Betrag.
  // Risiko: Farbe (Rot/Schwarz) = ×2, Symbol (♠♥♦♣) = ×4. Höchstens bis zum 64-fachen Startgewinn.
  function gamble(amount) {
    return new Promise(res => {
      const o = mk('gamble', { a: '#ffd24a', b: '#ff2d95' });
      let cur = amount, step = 0, done = false, busy = false, pending = null; const CAP = amount * 64;
      const suitBtn = (i, cls) => `<button class="pill suit ${cls}" data-nav data-g="s${i}">${L.SUITS[i]}</button>`;
      o.innerHTML = `<div class="sbox glass"><h2>RISIKO</h2><p class="muted">Farbe richtig = ×2, Symbol richtig = ×4, falsch = alles weg.</p>
        <div class="gcard3"><canvas width="256" height="256"></canvas></div>
        <div class="ladder"></div><div class="gmsg"></div>
        <div class="mbtns"><button class="pill red" data-nav data-g="red">ROT ×2</button><button class="pill black" data-nav data-g="black">SCHWARZ ×2</button></div>
        <div class="mbtns suits">${suitBtn(1, 'r')}${suitBtn(2, 'r')}${suitBtn(0, 'b')}${suitBtn(3, 'b')}</div>
        <div class="mbtns"><button class="pill gold" data-nav data-default data-g="take">NEHMEN</button></div>
        <div class="ghist"></div></div>`;
      const cv = o.querySelector('canvas'), g = cv.getContext('2d'), lad = o.querySelector('.ladder'), msg = o.querySelector('.gmsg'), hist = o.querySelector('.ghist');
      const draw = c => { g.clearRect(0, 0, 256, 256); g.drawImage(T.cardCanvas(c, { a: '#ffd24a', b: '#ff2d95', c: '#8b5cf6' }), 0, 0); };
      const ladder = () => { lad.innerHTML = `<span class="on">${C.short(cur)}</span><span>×2: ${C.short(cur * 2)}</span><span>×4: ${C.short(cur * 4)}</span>`; };
      draw(-1); ladder(); msg.textContent = 'Einsatz: ' + fmt(cur);
      const unl = C.layer(o, () => { if (!busy) finish(); });
      const btns = o.querySelectorAll('[data-g]');
      // pending: Ergebnis einer laufenden Karte – wird beim Schließen (z. B. Spiel verlassen) sofort verbucht.
      function finish() {
        if (done) return; done = true; open.delete(finish);
        if (pending !== null) { if (pending) wallet.give(pending); cur = pending; pending = null; }
        unl(); o.classList.add('out'); setTimeout(() => o.remove(), 250); wallet.reveal(); res(cur); }
      o.addEventListener('click', async e => {
        const b = e.target.closest('[data-g]'); if (!b || busy || done) return;
        const pick = b.dataset.g;
        if (pick === 'take') { sound.play('coin'); return finish(); }
        busy = true; btns.forEach(x => { x.disabled = true; });
        if (!wallet.take(cur)) { busy = false; return finish(); }
        const c = L.gambleCard(), red = L.isRed(c), su = pick[0] === 's';
        const ok = su ? L.suit(c) === +pick.slice(1) : (pick === 'red') === red, f = su ? 4 : 2;
        pending = ok ? cur * f : 0;
        for (let i = 0; i < 6; i++) { draw(Math.floor(Math.random() * 52)); sound.play('card'); await wait(70); if (done) return; }
        pending = null; draw(c); hist.insertAdjacentHTML('afterbegin', `<i class="${red ? 'r' : 'b'}">${L.SUITS[L.suit(c)]}</i>`);
        if (ok) { wallet.give(cur * f); cur *= f; step++; sound.play(su ? 'fanfare' : 'win'); msg.innerHTML = `${su ? 'Volltreffer ×4' : 'Richtig'}! <b>${fmt(cur)}</b>`; ladder(); }
        else { sound.play('lose'); msg.innerHTML = 'Leider falsch – Gewinn verloren.'; cur = 0; await wait(1300); return finish(); }
        if (cur >= CAP) { msg.innerHTML = `Höchststufe erreicht: <b>${fmt(cur)}</b>`; await wait(1200); return finish(); }
        await wait(500); if (done) return; busy = false; btns.forEach(x => { x.disabled = false; }); draw(-1);
      });
      open.add(finish);
    });
  }

  // Bonusspiel „Schatzwahl“: Ergebnis steht schon fest (st.vals in Aufdeck-Reihenfolge), der Spieler wählt nur die Felder.
  function pickBonus(st, theme, opt) {
    return new Promise(res => {
      const o = mk('pick', theme), faces = (opt && opt.faces) || ['emoji:🎁'];
      o.innerHTML = `<div class="sbox glass"><h2>BONUS</h2><p class="muted">Wähle <b>${st.vals.length}</b> Felder – jedes verbirgt einen Gewinn.</p><div class="pgrid"></div><p class="ptot">Gewinn: <b>${fmt(0)}</b></p></div>`;
      const grid = o.querySelector('.pgrid'), tot = o.querySelector('.ptot b'), items = [];
      for (let i = 0; i < st.items; i++) {
        const b = el('button', 'pitem'); b.setAttribute('data-nav', ''); if (i === 0) b.setAttribute('data-default', '');
        const c = el('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.scale(96 / 200, 96 / 200); S.drawArt(g, faces[i % faces.length]);
        b.appendChild(c); b.appendChild(el('span', 'pv')); grid.appendChild(b); items.push(b);
      }
      let k = 0, sum = 0, done = false, auto = 0;
      const unl = C.layer(o, () => {});
      function finish() { if (done) return; done = true; clearTimeout(auto); open.delete(finish); unl(); o.classList.add('out'); setTimeout(() => o.remove(), 250); res(); }
      const reveal = b => {
        if (done || k >= st.vals.length || b.classList.contains('open')) return;
        const v = st.vals[k++]; sum += v * st.unit; b.classList.add('open'); b.querySelector('.pv').textContent = fmt(v * st.unit); sound.play(v >= 15 ? 'win' : 'coin'); tot.textContent = fmt(sum);
        if (k >= st.vals.length) {
          let j = 0; items.forEach(x => { if (!x.classList.contains('open')) { x.classList.add('open', 'rest'); x.querySelector('.pv').textContent = fmt(st.rest[j++] * st.unit); } });
          tot.textContent = fmt(st.win); setTimeout(finish, 2200);
        } else if (opt && opt.auto) auto = setTimeout(autoPick, 650);
      };
      function autoPick() { const free = items.filter(x => !x.classList.contains('open')); if (free.length) reveal(free[Math.floor(Math.random() * free.length)]); }
      grid.addEventListener('click', e => { const b = e.target.closest('.pitem'); if (b) { clearTimeout(auto); reveal(b); } });
      open.add(finish); if (opt && opt.auto) auto = setTimeout(autoPick, 900);
    });
  }

  // Bonusrad: dreht auf das vorher ausgeloste Feld st.idx
  function bonusWheel(st, theme, opt) {
    return new Promise(res => {
      const o = mk('bwheel', theme), n = st.segs.length, seg = 360 / n;
      o.innerHTML = `<div class="sbox glass"><h2>BONUSRAD</h2><div class="wwrap"><canvas width="520" height="520"></canvas><i class="ptr"></i></div><p class="wres">&nbsp;</p><button class="pill gold" data-nav data-default>DREHEN</button></div>`;
      const cv = o.querySelector('canvas'), g = cv.getContext('2d'), btn = o.querySelector('button'), out = o.querySelector('.wres');
      const COL = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
      const label = s => (s.free ? s.free + ' FS' : fmt(s.x * st.unit));
      g.translate(260, 260);
      st.segs.forEach((s, i) => {
        const a0 = (i * seg - seg / 2 - 90) * Math.PI / 180, a1 = a0 + seg * Math.PI / 180;
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 250, a0, a1); g.closePath(); g.fillStyle = s.free ? '#111827' : COL[i % COL.length]; g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.stroke();
        g.save(); g.rotate((i * seg - 90) * Math.PI / 180); S.text(g, label(s), 160, 0, label(s).length > 7 ? 30 : 36, s.free ? '#ffd24a' : '#fff', '#000', 6); g.restore();
      });
      g.lineWidth = 12; g.strokeStyle = S.gold(g, -250, 250); g.beginPath(); g.arc(0, 0, 252, 0, 7); g.stroke();
      g.fillStyle = S.gold(g, -40, 40); g.beginPath(); g.arc(0, 0, 40, 0, 7); g.fill();
      let done = false, spun = false, tick = 0, auto = 0;
      const unl = C.layer(o, () => {});
      function finish() { if (done) return; done = true; clearTimeout(auto); clearInterval(tick); open.delete(finish); unl(); o.classList.add('out'); setTimeout(() => o.remove(), 250); res(); }
      function spin() {
        if (spun || done) return; spun = true; btn.disabled = true; sound.play('spin');
        const dur = 4.6 * (C.data.turbo ? 0.6 : 1), jitter = (Math.random() - 0.5) * seg * 0.6;
        cv.style.transition = `transform ${dur}s cubic-bezier(.12,.62,.16,1)`; cv.style.transform = `rotate(${-(st.idx * seg) - 360 * 6 + jitter}deg)`;
        const t0 = performance.now(); let next = 0;
        tick = setInterval(() => { const k = (performance.now() - t0) / 1000 / dur; if (k >= 1) return clearInterval(tick); if (performance.now() >= next) { sound.play('tick'); next = performance.now() + 40 + 400 * k * k; } }, 30);
        setTimeout(() => {
          if (done) return; const s = st.segs[st.idx];
          out.innerHTML = s.free ? `<b>${s.free} FREISPIELE!</b>` : `Gewinn: <b>${fmt(st.win)}</b>`; sound.play(s.free ? 'feature' : 'win');
          setTimeout(finish, 1800);
        }, dur * 1000 + 100);
      }
      btn.onclick = spin; open.add(finish);
      if (opt && opt.auto) auto = setTimeout(spin, 900);
    });
  }

  G.CasinoOverlay = { splash, featureIntro, bigWin, gamble, pickBonus, bonusWheel, closeAll() { [...open].forEach(f => f()); open.clear(); } };
})(window);
