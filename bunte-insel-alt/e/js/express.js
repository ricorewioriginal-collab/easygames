'use strict';
/* Bunte Insel – Emotes & Schnell-Chat (wie in großen Online-Spielwelten): Figur zeigt Gefühle (Winken, Jubeln, Lachen, Tanzen, Verbeugen, Salto, Schlafen, Zeigen, Muskeln),
   Schnell-Chat mit festen, freundlichen Sätzen in einer Sprechblase (keine freie Texteingabe → kindersicher). Mitspieler sehen beides. */
BI.createExpress = function (G) {
  const { P, A, fx, say } = G, X = { open: false, cur: null }, $ = id => document.getElementById(id);
  X.EMOTES = [
    { k: 'wave', icon: '👋', name: 'Winken', dur: 2.4 }, { k: 'cheer', icon: '🙌', name: 'Jubeln', dur: 2.4 }, { k: 'laugh', icon: '😂', name: 'Lachen', dur: 2.6 }, { k: 'dance', icon: '💃', name: 'Tanzen', dur: 4 },
    { k: 'bow', icon: '🙇', name: 'Verbeugen', dur: 2 }, { k: 'flip', icon: '🤸', name: 'Salto', dur: 1.1 }, { k: 'sleep', icon: '😴', name: 'Schlafen', dur: 4 }, { k: 'point', icon: '👉', name: 'Zeigen', dur: 2 }, { k: 'flex', icon: '💪', name: 'Muskeln', dur: 2.5 }
  ];
  X.PHRASES = ['Hallo! 👋', 'Danke! 😊', 'Super! 👍', 'Folge mir! 🏃', 'Hilfe! 🆘', 'Tolles Spiel! 🎮', 'Komm, wir spielen! 🎈', 'Bis gleich! 👋', 'Ups! 🙈', 'Gut gemacht! 🎉', 'Sterne suchen? ⭐', 'Wer fährt mit? 🚗'];
  const byK = k => X.EMOTES.find(e => e.k === k);
  const me = { get x() { return P.veh ? P.veh.x : P.x; }, get z() { return P.veh ? P.veh.z : P.z; }, get y() { return P.veh ? (P.veh.y || 0) : P.y; } };
  /* ---------- Fenster ---------- */
  const el = document.createElement('div'); el.id = 'expPanel'; el.hidden = true;
  el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:12;padding:10px 10px max(12px,env(safe-area-inset-bottom));background:var(--glass);backdrop-filter:blur(8px);border-radius:24px 24px 0 0;box-shadow:0 -8px 24px rgba(20,50,100,.3);display:flex;flex-direction:column;gap:8px';
  el.innerHTML = '<div class="row" id="expEmo" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div><div class="row" id="expChat" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div><div style="display:flex;justify-content:center"><button class="pill" id="expClose">✔ Fertig</button></div>';
  document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = '#expEmo button{width:64px;height:64px;border-radius:16px;background:#fff;box-shadow:var(--shadow);font-size:28px;line-height:1;display:flex;flex-direction:column;align-items:center;justify-content:center}#expEmo small{font-size:10px;font-weight:700;opacity:.75;margin-top:2px}#expChat button{padding:8px 12px;border-radius:16px;background:#fff;box-shadow:var(--shadow);font-weight:700;font-size:14px}'; document.head.appendChild(css);
  for (const e of X.EMOTES) { const b = document.createElement('button'); b.innerHTML = e.icon + '<small>' + e.name + '</small>'; b.onclick = () => { X.close(); X.emote(e.k, true); }; $('expEmo').appendChild(b); }
  X.PHRASES.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { X.close(); X.chat(i, true); }; $('expChat').appendChild(b); });
  $('expClose').onclick = () => X.close(); el.addEventListener('pointerdown', ev => ev.stopPropagation());
  X.show = function () { if (X.open) return; X.open = true; el.hidden = false; G.setStick && G.setStick(0, 0); };
  X.close = function () { X.open = false; el.hidden = true; };
  /* ---------- Ausführen ---------- */
  X.emote = function (k, send) {
    const e = byK(k); if (!e || P.veh) return; X.cur = { k, t: 0, dur: e.dur }; A.pop && A.pop(); G.showEmoji(e.icon, null); if (k === 'cheer' || k === 'flip') A.giggle && A.giggle();
    if (send && G.send) G.send({ t: 'm', k }); G.earn && G.earn('emote');
  };
  X.chat = function (i, send) {
    const t = X.PHRASES[i]; if (!t) return; G.bubble(me, t, 3200); A.pop && A.pop(); if (send && G.send) G.send({ t: 'c', i }); G.earn && G.earn('emote');
  };
  X.update = function (dt, t) {
    const c = X.cur; if (!c) return; const ch = G.char(), g = ch.group;
    if (P.veh || P.speed > .6) { X.cur = null; g.rotation.set(0, P.h, 0); return; }
    c.t += dt; const u = Math.min(1, c.t / c.dur), s = Math.sin(c.t * 9), env = Math.sin(Math.min(1, u) * Math.PI);
    ch.pose(0, 0, false);
    switch (c.k) {
      case 'wave': ch.pose(c.t * 4, 0, true); break;
      case 'cheer': ch.armL.rotation.set(-2.9, 0, .3); ch.armR.rotation.set(-2.9, 0, -.3); g.position.y = P.y + Math.abs(Math.sin(c.t * 6)) * .3; break;
      case 'laugh': ch.armL.rotation.set(-.6, 0, .5); ch.armR.rotation.set(-.6, 0, -.5); g.rotation.set(-.25 + s * .08, P.h, 0); g.position.y = P.y + Math.abs(s) * .08; break;
      case 'dance': g.rotation.set(0, P.h + c.t * 3, 0); ch.armL.rotation.set(-2.6 + Math.sin(c.t * 8) * .5, 0, .6); ch.armR.rotation.set(-2.6 - Math.sin(c.t * 8) * .5, 0, -.6); ch.legL.rotation.x = Math.sin(c.t * 8) * .6; ch.legR.rotation.x = -Math.sin(c.t * 8) * .6; g.position.y = P.y + Math.abs(Math.sin(c.t * 8)) * .15; break;
      case 'bow': g.rotation.set(env * 1.0, P.h, 0); ch.armL.rotation.set(env * .5, 0, 0); ch.armR.rotation.set(env * .5, 0, 0); break;
      case 'flip': g.rotation.set(-u * Math.PI * 2, P.h, 0); g.position.y = P.y + Math.sin(u * Math.PI) * 1.5 + .4; ch.armL.rotation.set(-2.8, 0, .3); ch.armR.rotation.set(-2.8, 0, -.3); ch.legL.rotation.x = ch.legR.rotation.x = -1.1; break;
      case 'sleep': ch.sit(); g.rotation.set(0, P.h, Math.sin(c.t * 1.5) * .12 + .15); g.position.y = P.y - .35; if (Math.random() < dt * 1.2) G.showEmoji('💤', null); break;
      case 'point': ch.armR.rotation.set(-1.55, 0, -.15); ch.armL.rotation.set(0, 0, .1); break;
      case 'flex': ch.armL.rotation.set(-1.5, 0, 1.1); ch.armR.rotation.set(-1.5, 0, -1.1); g.position.y = P.y + Math.abs(s) * .05; if (Math.random() < dt * 3) fx.burst(P.x, P.y + 1.7, P.z, 2, [BI.C.gold, BI.C.white], 2, .6, 24, 0); break;
    }
    if (u >= 1) { X.cur = null; g.rotation.set(0, P.h, 0); g.position.y = P.y; }
  };
  return X;
};
