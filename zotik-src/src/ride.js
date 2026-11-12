/* Weltrennen: ein Minispiel je Kapitelwelt mit eigenem Thema (Kanalboot, Sandsurfen, Schlitten …).
   Ausweichen, Splitter sammeln, 45 Sekunden. Bedienung für alle Geräte gleich: links/rechts (Tasten, Stick, Steuerkreuz)
   oder die linke/rechte Bildschirmhälfte antippen bzw. halten. Zurück/Escape beendet. Alles selbst gezeichnet. */
export const RIDES = {
  2: { sh: 'thorn', n: 'Blattflug', em: '🍃', who: 'Tilda', bg: ['#0f3a34', '#1c6a48'], lane: '#2fae7e', edge: '#0a2a20', me: '#ffb04a', ob: ['#7a5a2a', '#4a3a2a'], obN: 'Dornranke', coin: '#ff8ac8', fx: '#9aefb0', txt: 'Reite ein Blatt durch den lebenden Wald. Weich den Dornranken aus!' },
  3: { sh: 'barrel', n: 'Kanalrennen', em: '🛶', who: 'Wenke', bg: ['#1a1a30', '#2a3a5a'], lane: '#2a6aa0', edge: '#5a5a6a', me: '#c0703a', ob: ['#8a5a2a', '#5a3a20'], obN: 'Treibfass', coin: '#ffd45a', fx: '#bfe4ff', txt: 'Steuere das Kanalboot durch die Grachten. Weich den Treibfässern aus!' },
  4: { sh: 'rock', n: 'Dünensurfen', em: '🏄', who: 'Ramin', bg: ['#e8b060', '#c8803a'], lane: '#f0c878', edge: '#a86a2a', me: '#3aa0d8', ob: ['#7a6a5a', '#4a3a2a'], obN: 'Felsbrocken', coin: '#5ae0d0', fx: '#fff0c0', txt: 'Surfe die Dünen hinab. Weich den Felsbrocken aus!' },
  5: { sh: 'spike', n: 'Strömungsritt', em: '🐠', who: 'Marla', bg: ['#04203a', '#0a4a6a'], lane: '#0a6a8a', edge: '#04304a', me: '#ffb04a', ob: ['#ff6a5a', '#a03a3a'], obN: 'Stachelkoralle', coin: '#fff07a', fx: '#7ae0ff', txt: 'Reite die Strömung durchs Riff. Weich den Stachelkorallen aus!' },
  6: { sh: 'tree', n: 'Schlittenfahrt', em: '🛷', who: 'Bjarne', bg: ['#cfe4f0', '#9ac0d8'], lane: '#eef6fb', edge: '#7a9ab0', me: '#d83a3a', ob: ['#4a6a4a', '#2a4a3a'], obN: 'Tanne', coin: '#7ad0ff', fx: '#ffffff', txt: 'Rase mit dem Schlitten den Hang hinab. Weich den Tannen aus!' },
  7: { sh: 'pillar', n: 'Lavafloß', em: '🔥', who: 'Glimma', bg: ['#2a0a06', '#5a1a0a'], lane: '#c8401a', edge: '#3a1a10', me: '#8a6a4a', ob: ['#3a2a28', '#1a1010'], obN: 'Basaltsäule', coin: '#ffe07a', fx: '#ffb04a', txt: 'Treib auf dem Floß über den Lavastrom. Weich den Basaltsäulen aus!' },
  8: { sh: 'moth', n: 'Laternenflug', em: '🏮', who: 'Mondo', bg: ['#08061a', '#1a1440'], lane: '#241c50', edge: '#0a0820', me: '#ffd080', ob: ['#4a3a8a', '#2a2050'], obN: 'Schattenfalter', coin: '#d8c0ff', fx: '#ffe0a0', txt: 'Gleite mit einer Laterne durch die Nacht. Weich den Schattenfaltern aus!' },
  9: { sh: 'cloud', n: 'Wolkengleiten', em: '☁️', who: 'Stella', bg: ['#3a6ab0', '#8ab8e8'], lane: '#b8d8f8', edge: '#6a9ad0', me: '#ffd45a', ob: ['#5a5a7a', '#3a3a5a'], obN: 'Gewitterwolke', coin: '#ffffff', fx: '#ffe07a', txt: 'Gleite zwischen den Wolken. Weich den Gewitterwolken aus!' },
  10: { sh: 'mirror', n: 'Spiegelpfad', em: '🪞', who: 'Iris', bg: ['#14142a', '#2a2a5a'], lane: '#3a3a7a', edge: '#8a9aff', me: '#d8f0ff', ob: ['#b08aff', '#5a3aa0'], obN: 'Splitterspiegel', coin: '#ffe0a0', fx: '#d8f0ff', txt: 'Lauf über den Spiegelpfad. Weich den Splitterspiegeln aus!' }
};
export function createRide(C) {
  let R = null, UI = null;
  function ui() {
    if (UI) return UI; const d = document.createElement('div'); d.id = 'ride'; d.hidden = true;
    d.innerHTML = `<style>#ride{position:fixed;inset:0;z-index:30;background:#000;touch-action:none;user-select:none}#ride[hidden]{display:none}#ride canvas{position:absolute;inset:0;width:100%;height:100%}
      #ride .rh{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;padding:10px 14px;font:800 18px system-ui,sans-serif;color:#fff;text-shadow:0 2px 4px #000;pointer-events:none}
      #ride .rb{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100% - 32px));padding:18px;border-radius:18px;background:rgba(10,14,30,.88);border:2px solid #ffd45a;color:#fff;text-align:center;font:600 15px system-ui,sans-serif}
      #ride .rb h3{margin:0 0 6px;color:#ffd45a;font-size:22px}#ride .rb button{font:inherit;font-weight:800;margin:10px 6px 0;padding:10px 18px;border-radius:12px;border:2px solid #ffd45a;background:#2a1a50;color:#ffd45a;cursor:pointer}#ride .rb button:focus{outline:3px solid #7dffb2}#ride .rb[hidden]{display:none}</style>
      <canvas></canvas><div class="rh"><span id="rdS"></span><span id="rdT"></span><span id="rdH"></span></div><div class="rb" id="rdBox"><h3 id="rdN"></h3><p id="rdX"></p><button id="rdGo">Los!</button><button id="rdQ">Zurück</button></div>`;
    document.body.appendChild(d); const cv = d.querySelector('canvas');
    UI = { d, cv, cx: cv.getContext('2d'), box: d.querySelector('#rdBox'), nm: d.querySelector('#rdN'), tx: d.querySelector('#rdX'), go: d.querySelector('#rdGo'), q: d.querySelector('#rdQ'), s: d.querySelector('#rdS'), t: d.querySelector('#rdT'), h: d.querySelector('#rdH'), held: { l: 0, r: 0, tl: 0, tr: 0 } };
    const tp = e => { if (!R || !R.run) return; const xs = [...(e.touches || (e.buttons ? [e] : []))].map(t => t.clientX); UI.held.tl = xs.some(x => x < innerWidth / 2) ? 1 : 0; UI.held.tr = xs.some(x => x >= innerWidth / 2) ? 1 : 0; e.preventDefault(); };
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) cv.addEventListener(ev, tp, { passive: false });
    cv.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') { UI.held.tl = e.clientX < innerWidth / 2 ? 1 : 0; UI.held.tr = 1 - UI.held.tl } });
    cv.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') { UI.held.tl = UI.held.tr = 0 } });
    addEventListener('keydown', e => { if (!R) return; const k = e.code; if (k === 'ArrowLeft' || k === 'KeyA') UI.held.l = 1; else if (k === 'ArrowRight' || k === 'KeyD') UI.held.r = 1; else if ((k === 'Escape' || k === 'Backspace') && R) { close(); e.preventDefault() } else if ((k === 'Enter' || k === 'KeyJ' || k === 'Space') && !R.run && !UI.box.hidden) { (document.activeElement === UI.q ? UI.q : UI.go).click(); e.preventDefault() } else if ((k === 'ArrowUp' || k === 'ArrowDown' || k === 'KeyW' || k === 'KeyS') && !UI.box.hidden) { (document.activeElement === UI.go ? UI.q : UI.go).focus(); e.preventDefault() } });
    addEventListener('keyup', e => { const k = e.code; if (k === 'ArrowLeft' || k === 'KeyA') UI.held.l = 0; else if (k === 'ArrowRight' || k === 'KeyD') UI.held.r = 0 });
    UI.go.onclick = () => start(); UI.q.onclick = () => close();
    return UI;
  }
  function size() { const u = UI, dpr = Math.min(2, devicePixelRatio || 1); u.cv.width = innerWidth * dpr; u.cv.height = innerHeight * dpr; u.dpr = dpr }
  function open(n) {
    const th = RIDES[n]; if (!th) return; const u = ui(); size(); const s = C.S(); s.ride = s.ride || {};
    R = { n, th, run: false, best: s.ride[n] || 0 }; u.d.hidden = false; u.box.hidden = false; u.nm.textContent = th.em + ' ' + th.n;
    u.tx.innerHTML = th.txt + '<br><small>Links/rechts: Tasten, Stick oder Bildschirmhälfte antippen · 45 Sekunden · 3 Herzen</small>' + (R.best ? '<br>Rekord: ' + R.best : '');
    u.go.textContent = 'Los!'; u.s.textContent = u.t.textContent = u.h.textContent = ''; C.setMode('ride'); setTimeout(() => u.go.focus(), 50); draw();
  }
  function start() {
    const u = UI; u.box.hidden = true; Object.assign(R, { run: true, t: 45, x: .5, vx: 0, dist: 0, sc: 0, hp: 3, inv: 0, obs: [], coins: [], parts: [], sp: 0, cs: 0, speed: .42 }); C.sfx('portal');
  }
  function end() {
    const u = UI, s = C.S(), sc = Math.round(R.sc); R.run = false; let rw = Math.min(400, sc * 2), first = !s.ride[R.n]; if (first) rw += 200;
    if (sc > (s.ride[R.n] || 0)) s.ride[R.n] = sc; s.shards += rw; C.saveGame(true); C.sfx(R.hp > 0 ? 'level' : 'hurt');
    u.box.hidden = false; u.nm.textContent = R.hp > 0 ? '🏁 Ziel erreicht!' : '💥 Ausgeschieden'; u.tx.innerHTML = `Punkte: <b>${sc}</b>${sc >= (R.best || 0) && sc > 0 ? ' · Neuer Rekord!' : ' · Rekord: ' + R.best}<br>💎 +${rw}${first ? ' (inklusive Erstfahrt-Bonus)' : ''}`;
    R.best = Math.max(R.best || 0, sc); u.go.textContent = 'Nochmal'; setTimeout(() => u.go.focus(), 50);
  }
  function close() { if (!R) return; UI.d.hidden = true; R = null; C.setMode('play'); C.toast('🏁 Weltrennen beendet') }
  function frame(dt) {
    if (!R) return; dt = Math.min(dt, .05); const u = UI; if (u.cv.width !== Math.round(innerWidth * u.dpr)) size();
    if (R.run) {
      const h = u.held, dir = (h.r || h.tr ? 1 : 0) - (h.l || h.tl ? 1 : 0); R.vx += (dir * 3.2 - R.vx * 6) * dt; R.x = Math.min(.92, Math.max(.08, R.x + R.vx * dt));
      R.t -= dt; R.speed = .42 + (45 - R.t) * .012; R.dist += R.speed * dt; R.sc += R.speed * dt * 20; R.inv -= dt;
      R.sp -= dt; if (R.sp <= 0) { R.sp = Math.max(.32, .9 - (45 - R.t) * .014); const w = .07 + Math.random() * .05; R.obs.push({ x: .1 + Math.random() * .8, y: -.1, w }); if (Math.random() < .35) R.obs.push({ x: .1 + Math.random() * .8, y: -.25, w: .06 }) }
      R.cs -= dt; if (R.cs <= 0) { R.cs = .55; const x = .12 + Math.random() * .76; for (let k = 0; k < 3; k++) R.coins.push({ x, y: -.05 - k * .07 }) }
      const vy = R.speed * 1.6 * dt, py = .82;
      for (const o of R.obs) { o.y += vy; if (!o.hit && R.inv <= 0 && Math.abs(o.y - py) < .045 && Math.abs(o.x - R.x) < o.w * .5 + .035) { o.hit = 1; R.hp--; R.inv = 1.2; C.sfx('hurt'); burst(R.x, py, '#ff5a5a', 16); if (navigator.vibrate) try { navigator.vibrate(60) } catch (e) { } } }
      for (const c of R.coins) { c.y += vy; if (!c.got && Math.abs(c.y - py) < .05 && Math.abs(c.x - R.x) < .05) { c.got = 1; R.sc += 10; C.sfx('ui'); burst(c.x, c.y, R.th.coin, 6) } }
      R.obs = R.obs.filter(o => o.y < 1.15); R.coins = R.coins.filter(c => c.y < 1.15 && !c.got);
      if (Math.random() < dt * 30) R.parts.push({ x: R.x + (Math.random() - .5) * .04, y: py + .04, vx: (Math.random() - .5) * .1, vy: .25, l: .5, c: R.th.fx });
      if (R.hp <= 0 || R.t <= 0) end();
      u.s.textContent = '⭐ ' + Math.round(R.sc); u.t.textContent = '⏱ ' + Math.max(0, Math.ceil(R.t)); u.h.textContent = '❤'.repeat(Math.max(0, R.hp)) + '♡'.repeat(Math.max(0, 3 - R.hp));
    }
    for (const p of R.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt } R.parts = R.parts.filter(p => p.l > 0);
    draw();
  }
  function burst(x, y, c, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = .1 + Math.random() * .25; R.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .5, c }) } }
  function draw() {
    const u = UI, c = u.cx, W = u.cv.width, H = u.cv.height, th = R.th, s = Math.min(W, H * .75), X0 = (W - s) / 2, X = x => X0 + x * s, Y = y => y * H, t = C.time();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = th.edge; c.fillRect(0, 0, X0, H); c.fillRect(X0 + s, 0, W - X0 - s, H);
    c.fillStyle = th.lane; c.fillRect(X0, 0, s, H);
    const dd = (R.dist || t * .2) * H * 1.6;
    /* Ufer mit Kulisse */
    for (const side of [0, 1]) { const ex = side ? X0 + s : 0, ew = side ? W - X0 - s : X0; if (ew < 4) continue; const step = H / 4;
      for (let k = -1; k < 6; k++) { const y = ((k * step + dd * .9) % (H + step)) - step / 2, bx = side ? ex + ew * .15 : ex + ew * .25, bw = ew * .6, bh = step * .55;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(bx + 6, y + 6, bw, bh); c.fillStyle = th.ob[1]; c.fillRect(bx, y, bw, bh); c.fillStyle = th.fx; c.globalAlpha = .55;
        for (let wy = 0; wy < 2; wy++) for (let wx = 0; wx < 3; wx++) c.fillRect(bx + bw * (.12 + wx * .3), y + bh * (.2 + wy * .4), bw * .16, bh * .2); c.globalAlpha = 1 } }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(X0 - s * .012, 0, s * .012, H); c.fillRect(X0 + s, 0, s * .012, H);
    /* Wellen auf der Bahn */
    c.strokeStyle = th.fx; c.globalAlpha = .14; c.lineWidth = 2 * u.dpr; for (let k = 0; k < 9; k++) { const y = ((k * H / 8 + dd) % (H + 40)) - 20; c.beginPath(); for (let i = 0; i <= 12; i++) { const xx = X0 + s * (.06 + i * .073), yy = y + Math.sin(i * 1.3 + k + t * 2) * 5 * u.dpr; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy) } c.stroke() } c.globalAlpha = 1;
    const off = dd % (H / 6); c.globalAlpha = .18; c.fillStyle = th.fx; for (let k = -1; k < 7; k++) { const y = k * H / 6 + off; c.fillRect(X0 + s * .02, y, s * .015, H / 14); c.fillRect(X0 + s * .965, y, s * .015, H / 14) } c.globalAlpha = 1;
    if (R.obs) for (const o of R.obs) obst(c, X(o.x), Y(o.y), o.w * s * .5, th, t + o.x * 9);
    c.shadowColor = th.coin; c.shadowBlur = 12 * u.dpr;
    if (R.coins) for (const k of R.coins) { const cx = X(k.x), cy = Y(k.y), r = s * .018 * (1 + .15 * Math.sin(t * 8 + k.y * 20)); c.fillStyle = k.c || th.coin; c.save(); c.translate(cx, cy); c.rotate(.785); c.fillRect(-r, -r, r * 2, r * 2); c.restore() }
    c.shadowBlur = 0;
    for (const p of R.parts || []) { c.globalAlpha = Math.max(0, p.l * 2); c.fillStyle = p.c; c.fillRect(X(p.x) - 2 * u.dpr, Y(p.y) - 2 * u.dpr, 4 * u.dpr, 4 * u.dpr) } c.globalAlpha = 1;
    const px = X(R.x === undefined ? .5 : R.x), py = Y(.82), r = s * .035, bl = R.inv > 0 && Math.floor(t * 12) % 2;
    if (!bl) { c.save(); c.translate(px, py); c.rotate((R.vx || 0) * .25); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, r * .9, r * 1.2, r * .4, 0, 0, 6.29); c.fill(); c.fillStyle = th.me; c.beginPath(); c.ellipse(0, r * .3, r * 1.1, r * .55, 0, 0, 6.29); c.fill();
      c.fillStyle = '#e8731c'; c.beginPath(); c.arc(0, -r * .35, r * .55, 0, 6.29); c.fill(); c.beginPath(); c.moveTo(-r * .5, -r * .6); c.lineTo(-r * .3, -r * 1.25); c.lineTo(-r * .05, -r * .75); c.fill(); c.beginPath(); c.moveTo(r * .5, -r * .6); c.lineTo(r * .3, -r * 1.25); c.lineTo(r * .05, -r * .75); c.fill();
      c.fillStyle = '#fff4e6'; c.beginPath(); c.arc(0, -r * .2, r * .28, 0, 6.29); c.fill(); c.fillStyle = '#1a1a2a'; c.fillRect(-r * .25, -r * .5, r * .1, r * .12); c.fillRect(r * .15, -r * .5, r * .1, r * .12); c.restore() }
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  }
  function obst(c, x, y, r, th, ph) {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + r * .15, y + r * .55, r, r * .4, 0, 0, 6.29); c.fill();
    const a = th.ob[0], b = th.ob[1];
    switch (th.sh) {
      case 'barrel': c.fillStyle = a; c.beginPath(); c.ellipse(x, y, r * .8, r, 0, 0, 6.29); c.fill(); c.fillStyle = b; c.fillRect(x - r * .8, y - r * .45, r * 1.6, r * .14); c.fillRect(x - r * .8, y + r * .3, r * 1.6, r * .14); break;
      case 'tree': c.fillStyle = '#5a3a20'; c.fillRect(x - r * .12, y + r * .2, r * .24, r * .5); for (let k = 0; k < 3; k++) { c.fillStyle = k % 2 ? b : a; c.beginPath(); c.moveTo(x, y - r * (1.2 - k * .45)); c.lineTo(x - r * (.55 + k * .2), y + r * (.1 + k * .2) - r * .3); c.lineTo(x + r * (.55 + k * .2), y + r * (.1 + k * .2) - r * .3); c.fill() } c.fillStyle = '#fff'; c.globalAlpha = .6; c.beginPath(); c.moveTo(x, y - r * 1.2); c.lineTo(x - r * .2, y - r * .9); c.lineTo(x + r * .2, y - r * .9); c.fill(); c.globalAlpha = 1; break;
      case 'spike': case 'thorn': c.fillStyle = b; c.beginPath(); c.arc(x, y, r * .6, 0, 6.29); c.fill(); c.fillStyle = a; for (let k = 0; k < 7; k++) { const an = k * .9 + ph * .3; c.beginPath(); c.moveTo(x + Math.cos(an) * r * .4, y + Math.sin(an) * r * .4); c.lineTo(x + Math.cos(an + .2) * r * 1.1, y + Math.sin(an + .2) * r * 1.1); c.lineTo(x + Math.cos(an + .45) * r * .4, y + Math.sin(an + .45) * r * .4); c.fill() } break;
      case 'pillar': c.fillStyle = b; c.fillRect(x - r * .6, y - r, r * 1.2, r * 1.8); c.fillStyle = a; c.fillRect(x - r * .6, y - r, r * 1.2, r * .3); c.fillStyle = '#ff7a2a'; c.globalAlpha = .5 + .3 * Math.sin(ph * 4); c.fillRect(x - r * .1, y - r * .6, r * .2, r * 1.2); c.globalAlpha = 1; break;
      case 'moth': { const f = Math.sin(ph * 10) * .5 + .7; c.fillStyle = a; c.beginPath(); c.ellipse(x - r * .5, y, r * .6 * f, r * .7, -.4, 0, 6.29); c.ellipse(x + r * .5, y, r * .6 * f, r * .7, .4, 0, 6.29); c.fill(); c.fillStyle = b; c.beginPath(); c.ellipse(x, y, r * .18, r * .6, 0, 0, 6.29); c.fill(); c.fillStyle = '#ff5aa0'; c.fillRect(x - r * .4, y - r * .2, r * .12, r * .12); c.fillRect(x + r * .28, y - r * .2, r * .12, r * .12); break }
      case 'cloud': c.fillStyle = a; for (const [dx, dy, rr] of [[-.5, .1, .55], [0, -.2, .7], [.5, .1, .55], [0, .25, .6]]) { c.beginPath(); c.arc(x + dx * r, y + dy * r, rr * r, 0, 6.29); c.fill() } c.strokeStyle = '#ffe07a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + r * .4); c.lineTo(x - r * .2, y + r * .8); c.lineTo(x + r * .1, y + r * .8); c.lineTo(x - r * .1, y + r * 1.2); c.stroke(); break;
      case 'mirror': c.save(); c.translate(x, y); c.rotate(ph * .8); c.fillStyle = b; c.beginPath(); c.moveTo(0, -r); c.lineTo(r * .7, 0); c.lineTo(0, r); c.lineTo(-r * .7, 0); c.fill(); c.fillStyle = a; c.globalAlpha = .7; c.beginPath(); c.moveTo(0, -r * .7); c.lineTo(r * .4, 0); c.lineTo(0, r * .2); c.fill(); c.globalAlpha = 1; c.restore(); break;
      default: c.fillStyle = b; c.beginPath(); c.arc(x, y + r * .1, r * .9, 0, 6.29); c.fill(); c.fillStyle = a; c.beginPath(); c.arc(x - r * .1, y - r * .05, r * .75, 0, 6.29); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.arc(x - r * .3, y - r * .35, r * .2, 0, 6.29); c.fill();
  }
  return { open, frame, close, get on() { return !!R }, get R() { return R } };
}
