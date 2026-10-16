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

  function bigWin(title, amount, theme) {
    return new Promise(res => {
      const o = mk('bigwin', theme);
      o.innerHTML = `<div class="rays"></div><div class="sbox"><h1>${title}</h1><p class="amt">0</p><button class="pill gold" data-nav data-default>EINSAMMELN</button></div>`;
      const amt = o.querySelector('.amt'), dur = 2600 * (C.data.turbo ? 0.6 : 1), t0 = performance.now();
      let done = false, raf = 0, last = 0, finished = false;
      const tick = now => { const k = Math.min(1, (now - t0) / dur); amt.textContent = fmt(amount * (1 - Math.pow(1 - k, 2))); if (now - last > 80) { sound.play('count'); last = now; } if (k < 1) raf = requestAnimationFrame(tick); else { finished = true; setTimeout(close, 1400); } };
      raf = requestAnimationFrame(tick);
      const unl = C.layer(o, () => close(true));
      function close(force) {
        if (done) return;
        if (!finished && !force) { cancelAnimationFrame(raf); amt.textContent = fmt(amount); finished = true; setTimeout(close, 900); return; }
        done = true; cancelAnimationFrame(raf); unl(); open.delete(close); o.classList.add('out'); setTimeout(() => o.remove(), 250); res();
      }
      open.add(() => close(true)); o.addEventListener('click', () => close());
    });
  }

  // Risiko: Gewinn auf Rot oder Schwarz setzen, bis zu 5 Stufen. Liefert den behaltenen Betrag.
  function gamble(amount) {
    return new Promise(res => {
      const o = mk('gamble', { a: '#ffd24a', b: '#ff2d95' });
      let cur = amount, step = 0, done = false, busy = false; const MAX = 5;
      o.innerHTML = `<div class="sbox glass"><h2>RISIKO</h2><p class="muted">Rot oder Schwarz? Richtig = doppelt, falsch = alles weg.</p>
        <div class="gcard3"><canvas width="256" height="256"></canvas></div>
        <div class="ladder"></div><div class="gmsg"></div>
        <div class="mbtns"><button class="pill red" data-nav data-g="red">ROT</button><button class="pill black" data-nav data-g="black">SCHWARZ</button><button class="pill gold" data-nav data-default data-g="take">NEHMEN</button></div>
        <div class="ghist"></div></div>`;
      const cv = o.querySelector('canvas'), g = cv.getContext('2d'), lad = o.querySelector('.ladder'), msg = o.querySelector('.gmsg'), hist = o.querySelector('.ghist');
      const draw = c => { g.clearRect(0, 0, 256, 256); g.drawImage(T.cardCanvas(c, { a: '#ffd24a', b: '#ff2d95', c: '#8b5cf6' }), 0, 0); };
      const ladder = () => { lad.innerHTML = Array.from({ length: MAX + 1 }, (_, i) => `<span class="${i === step ? 'on' : ''}">${C.short(amount * Math.pow(2, i))}</span>`).reverse().join(''); };
      draw(-1); ladder(); msg.textContent = 'Einsatz: ' + fmt(cur);
      const unl = C.layer(o, () => finish());
      const btns = o.querySelectorAll('[data-g]');
      function finish() { if (done) return; done = true; unl(); o.classList.add('out'); setTimeout(() => o.remove(), 250); wallet.reveal(); res(cur); }
      o.addEventListener('click', async e => {
        const b = e.target.closest('[data-g]'); if (!b || busy || done) return;
        if (b.dataset.g === 'take') { sound.play('coin'); return finish(); }
        busy = true; btns.forEach(x => { x.disabled = true; });
        if (!wallet.take(cur)) { busy = false; return finish(); }
        const c = L.gambleCard(), red = L.isRed(c), ok = (b.dataset.g === 'red') === red;
        for (let i = 0; i < 6; i++) { draw(Math.floor(Math.random() * 52)); sound.play('card'); await wait(70); }
        draw(c); hist.insertAdjacentHTML('afterbegin', `<i class="${red ? 'r' : 'b'}">${L.SUITS[L.suit(c)]}</i>`);
        if (ok) { wallet.give(cur * 2); cur *= 2; step++; sound.play('win'); msg.innerHTML = `Richtig! <b>${fmt(cur)}</b>`; ladder(); }
        else { sound.play('lose'); msg.innerHTML = 'Leider falsch – Gewinn verloren.'; cur = 0; await wait(1300); return finish(); }
        if (step >= MAX) { msg.innerHTML = `Höchststufe erreicht: <b>${fmt(cur)}</b>`; await wait(1200); return finish(); }
        await wait(500); busy = false; btns.forEach(x => { x.disabled = false; }); draw(-1);
      });
      open.add(finish);
    });
  }

  G.CasinoOverlay = { splash, bigWin, gamble, closeAll() { [...open].forEach(f => f()); open.clear(); } };
})(window);
