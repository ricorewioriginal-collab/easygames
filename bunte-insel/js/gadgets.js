'use strict';
/* Bunte Insel – Gadgets (wie „Gear“ in großen Online-Spielwelten): Doppelsprung 🦘, Hoverboard 🛹, Jetpack 🚀.
   Mit Sternen kaufen, im Fenster anlegen/ablegen. Im Parcours (Himmels- oder eigener) sind Gadgets aus – sonst wäre es zu leicht. */
BI.createGadgets = function (G) {
  const { P, A, fx, save, say } = G, X = { open: false, fuel: 1 }, $ = id => document.getElementById(id);
  X.LIST = [
    { k: 'double', icon: '🦘', name: 'Doppelsprung', price: 10, text: 'In der Luft nochmal springen' },
    { k: 'board', icon: '🛹', name: 'Hoverboard', price: 25, text: 'Schwebt und ist viel schneller' },
    { k: 'jet', icon: '🚀', name: 'Jetpack', price: 40, text: 'Springen und Knopf gedrückt halten = fliegen' }
  ];
  const owned = () => save.gadgets || (save.gadgets = []);
  X.eq = () => save.gadget || '';
  const busy = () => (G.blocked && G.blocked()) || P.veh;
  X.active = k => X.eq() === k && !busy();
  X.speedMul = () => X.active('board') ? 1.55 : 1;
  X.canDouble = () => X.active('double');
  /* ---------- Aussehen: Rucksack + Brett hängen an der Figur (bei neuer Figur neu anhängen) ---------- */
  const pack = (() => { const b = new BI.Batch(); b.box(0, 1.0, -.3, .5, .65, .22, 0x9aa0a8); b.cyl(-.14, .62, -.3, .1, .13, .22, 0x555a66, 8); b.cyl(.14, .62, -.3, .1, .13, .22, 0x555a66, 8); b.box(-.14, 1.55, -.3, .09, .15, .09, 0xe0382b); b.box(.14, 1.55, -.3, .09, .15, .09, 0xe0382b); const m = b.mesh(BI.mat()); m.visible = false; return m; })();
  const board = (() => { const b = new BI.Batch(); b.box(0, 0, 0, .75, .08, 1.5, 0x4da3ff); b.box(0, .08, 0, .6, .02, 1.35, 0xffffff); b.box(0, .02, .78, .5, .06, .14, 0xff8fc8); b.box(0, .02, -.78, .5, .06, .14, 0xff8fc8); const m = b.mesh(BI.mat()); m.visible = false; return m; })();
  const bar = document.createElement('div'); bar.className = 'chip'; bar.hidden = true; bar.style.cssText = 'position:absolute;left:50%;bottom:max(86px,calc(env(safe-area-inset-bottom) + 76px));transform:translateX(-50%);z-index:6;width:120px;height:14px;padding:2px;border-radius:9px;pointer-events:none'; bar.innerHTML = '<i style="display:block;height:100%;width:100%;border-radius:7px;background:linear-gradient(90deg,#ff8a1f,#ffd23f)"></i>'; (document.getElementById('hud') || document.body).appendChild(bar);
  /* ---------- Jetpack: nach dem Absprung Knopf halten ---------- */
  X.thrust = function (dt, held, gy) {
    if (!X.active('jet')) { bar.hidden = true; return; }
    const air = P.y > gy + .25;
    if (held && air && X.fuel > 0) {
      X.fuel = Math.max(0, X.fuel - dt / 1.1); P.vy = Math.min(P.vy + 42 * dt, 5.5);
      if (Math.random() < dt * 40) fx.emit(P.x - Math.sin(P.h) * .3, P.y + .5, P.z - Math.cos(P.h) * .3, (Math.random() - .5) * 1.2, -4, (Math.random() - .5) * 1.2, .5, 34, 1, .6 + Math.random() * .3, .15, 0, .95);
      if (!X.on) { X.on = true; A.whoosh && A.whoosh(); }
    } else X.on = false;
    if (!air) X.fuel = Math.min(1, X.fuel + dt * .7);
    bar.hidden = X.fuel >= .999 && !X.on; bar.firstChild.style.width = Math.round(X.fuel * 100) + '%';
  };
  X.doubleJump = function () { P.vy = 7.6; A.jump && A.jump(); fx.burst(P.x, P.y + .1, P.z, 10, [BI.C.white, BI.C.blue], 3, .5, 30, -1); };
  X.update = function (dt, t) {
    const g = G.char().group, e = X.eq(), on = !busy();
    const wantPack = e === 'jet' && on, wantBoard = e === 'board' && on;
    if (pack.visible !== wantPack || pack.parent !== g) { if (pack.parent !== g) g.add(pack); pack.visible = wantPack; }
    if (board.visible !== wantBoard || board.parent !== g) { if (board.parent !== g) g.add(board); board.visible = wantBoard; }
    if (wantBoard) { const lift = P.y < .6 ? .2 + Math.sin(t * 4) * .04 : .12; board.position.y = .02; g.position.y += lift; if (P.speed > .5 && Math.random() < dt * 20) fx.emit(P.x - Math.sin(P.h) * .8, P.y + .1, P.z - Math.cos(P.h) * .8, 0, .3, 0, .5, 30, .4, .8, 1, 0, .8); }
  };
  /* ---------- Fenster ---------- */
  const el = document.createElement('div'); el.id = 'gadPanel'; el.hidden = true;
  el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:12;padding:10px 10px max(12px,env(safe-area-inset-bottom));background:var(--glass);backdrop-filter:blur(8px);border-radius:24px 24px 0 0;box-shadow:0 -8px 24px rgba(20,50,100,.3);display:flex;flex-direction:column;gap:8px;align-items:center';
  el.innerHTML = '<div style="font-weight:800">🚀 Gadgets <span id="gadStars"></span></div><div id="gadCards" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div><button class="pill" id="gadClose">✔ Fertig</button>';
  document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = '#gadCards .gc{width:150px;padding:10px;border-radius:18px;background:#fff;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}#gadCards .gc b{font-size:34px}#gadCards .gc span{font-size:12px;opacity:.75;min-height:30px}#gadCards .gc button{padding:7px 12px;border-radius:14px;font-weight:800;background:#4cd07d;color:#fff}#gadCards .gc.eq{outline:3px solid #ffd23f}#gadCards .gc button.no{background:#c8ced8}'; document.head.appendChild(css);
  function render() {
    $('gadStars').textContent = '· ⭐ ' + save.stars; const box = $('gadCards'); box.innerHTML = '';
    for (const g of X.LIST) {
      const has = owned().includes(g.k), on = X.eq() === g.k, d = document.createElement('div'); d.className = 'gc' + (on ? ' eq' : '');
      d.innerHTML = '<b>' + g.icon + '</b><div style="font-weight:800">' + g.name + '</div><span>' + g.text + '</span>'; const b = document.createElement('button');
      if (!has) { b.textContent = 'Kaufen · ' + g.price + ' ⭐'; if (save.stars < g.price) b.className = 'no'; b.onclick = () => { if (save.stars < g.price) { say('Dafür brauchst du noch ' + (g.price - save.stars) + ' ⭐', 1800); return; } save.stars -= g.price; $('starN').textContent = save.stars; owned().push(g.k); save.gadget = g.k; G.persist(); A.buy && A.buy(); G.earn && G.earn('gadget'); say(g.icon + ' ' + g.name + ' ist jetzt dein Gadget!', 2200); render(); }; }
      else { b.textContent = on ? 'Ablegen' : 'Anlegen'; if (on) b.className = 'no'; b.onclick = () => { save.gadget = on ? '' : g.k; G.persist(); A.pop && A.pop(); X.fuel = 1; render(); }; }
      d.appendChild(b); box.appendChild(d);
    }
  }
  X.show = function () { if (X.open) return; X.open = true; render(); el.hidden = false; G.setStick && G.setStick(0, 0); };
  X.close = function () { X.open = false; el.hidden = true; };
  $('gadClose').onclick = () => X.close(); el.addEventListener('pointerdown', ev => ev.stopPropagation());
  return X;
};
