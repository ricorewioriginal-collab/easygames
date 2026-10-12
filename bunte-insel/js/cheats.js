'use strict';
/* Bunte Insel – Geheimcodes 🔑 (⚙️ → „Code eingeben“): Cheats und Specials, die es im normalen Spiel nicht gibt.
   Toggle-Codes (nochmal eingeben = aus) merken sich im Spielstand (save.cheat.on). Neue Codes: einfach in BI.CHEATS eintragen – Eingabefenster, Lösungsbuch und docs/ ziehen sie automatisch. */
BI.CHEATS = [
  { code: 'TASCHIMEISTER', icon: '🔴', text: 'Taschi-Land: alle 8 Orden, alle Taschis im Taschidex und viele Fangbälle, Tränke und Steine (+ ein Starter-Team).' },
  { code: 'UNENDLICHSTERNE', icon: '♾️', text: 'Unendlich Sterne: nichts kostet mehr Sterne, der Vorrat ist immer voll (999.999).', toggle: true },
  { code: 'ALLESFREI', icon: '🔓', text: 'Schaltet ALLE Inhalte frei: alle Sticker, die ganze Inselreise, alle Welten im Story-Modus (auch künftige), alle Läden-Gegenstände.' },
  { code: 'STERNENREGEN', icon: '🌟', text: '+500 Sterne sofort.' },
  { code: 'FLIEGEN', icon: '🕊️', text: 'Flugmodus: Springen (B/Leertaste) flattert nach oben, man schwebt langsam herab – Special, gibt es sonst nicht.', toggle: true },
  { code: 'MONDSPRUNG', icon: '🌙', text: 'Mondsprung: doppelte Sprunghöhe, weniger Schwerkraft.', toggle: true },
  { code: 'RAKETENSCHUH', icon: '🚀', text: 'Raketenschuhe: doppeltes Lauftempo.', toggle: true },
  { code: 'RIESE', icon: '🗿', text: 'Riesen-Held: doppelt so groß.', toggle: true },
  { code: 'ZWERG', icon: '🐭', text: 'Zwerg-Held: halb so groß.', toggle: true },
  { code: 'REGENBOGENSPUR', icon: '🌈', text: 'Regenbogenspur: bunte Sterne und Funken hinter dir.', toggle: true },
  { code: 'UNSTERBLICH', icon: '🛡️', text: 'Unbesiegbar: Gegner können dir nichts mehr tun.', toggle: true },
  { code: 'HELDENKRAFT', icon: '⚔️', text: 'Heldenkraft: zehnfache Schwertstärke in allen Kämpfen.', toggle: true },
  { code: 'TAGESGESCHENK', icon: '🎁', text: 'Das Tagesgeschenk noch einmal abholen.' },
  { code: 'ZUHAUSE', icon: '🏠', text: 'Sofort nach Hause beamen.' },
  { code: 'ALLESAUS', icon: '↩️', text: 'Schaltet alle Specials wieder aus (Freischaltungen bleiben).' }
];
BI.createCheats = function (G) {
  const { save, say, persist, P, fx, A } = G, K = {}, $ = id => document.getElementById(id);
  const S = () => { const c = save.cheat || (save.cheat = {}); c.on = c.on || {}; return c; };
  const norm = s => String(s || '').toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS').replace(/[^A-Z0-9]/g, '');
  const on = c => !!S().on[c];
  K.inf = () => on('UNENDLICHSTERNE'); K.fly = () => on('FLIEGEN'); K.god = () => on('UNSTERBLICH'); K.open = () => !!S().open;
  K.speedMul = () => on('RAKETENSCHUH') ? 2 : 1; K.jumpMul = () => on('MONDSPRUNG') ? 1.6 : 1; K.gravMul = () => on('FLIEGEN') ? .22 : on('MONDSPRUNG') ? .5 : 1; K.swordMul = () => on('HELDENKRAFT') ? 10 : 1;
  K.size = () => on('RIESE') ? 2 : on('ZWERG') ? .5 : 1;
  K.list = () => BI.CHEATS; K.active = () => BI.CHEATS.filter(c => c.toggle && on(c.code));
  function unlockAll() {
    const S0 = S(); S0.open = true; let n = 0;
    for (const id of G.stickerIds()) if (!(save.stk || (save.stk = [])).includes(id)) { save.stk.push(id); n++; }
    if (G.finishStory) G.finishStory(); if (G.unlockPets) G.unlockPets(); if (G.taschiAll) G.taschiAll();
    for (const it of G.shopIds()) if (!save.owned.includes(it)) save.owned.push(it);
    persist(); G.applyStory && G.applyStory(); return n;
  }
  K.redeem = function (text) {
    const code = norm(text), c = BI.CHEATS.find(q => q.code === code);
    if (!code) return { ok: false, msg: 'Bitte einen Code eingeben.' };
    if (!c) { A.bonk && A.bonk(); return { ok: false, msg: '🤔 Diesen Code kenne ich nicht. Tipp: Codes stehen im Lösungsbuch.' }; }
    const s = S(); let msg = c.icon + ' ' + c.code + '!';
    if (c.code === 'ALLESFREI') { const n = unlockAll(); msg = '🔓 Alles freigeschaltet! (' + n + ' neue Sticker, Inselreise fertig, alle Welten offen, alle Gegenstände)'; }
    else if (c.code === 'TASCHIMEISTER') { G.taschiAll && G.taschiAll(); msg = '🔴 Taschi-Land: alle Orden, Taschidex voll, Beutel gefüllt!'; }
    else if (c.code === 'STERNENREGEN') { G.addStars(500); msg = '🌟 +500 Sterne!'; }
    else if (c.code === 'TAGESGESCHENK') { save.daily = { d: '', s: (save.daily && save.daily.s) || 0 }; G.daily && G.daily(); msg = '🎁 Tagesgeschenk!'; }
    else if (c.code === 'ZUHAUSE') { G.goHome && G.goHome(); msg = '🏠 Zuhause!'; }
    else if (c.code === 'ALLESAUS') { s.on = {}; persist(); msg = '↩️ Alle Specials aus.'; }
    else if (c.toggle) { if (s.on[c.code]) { delete s.on[c.code]; msg = c.icon + ' ' + c.code + ' aus.'; } else { s.on[c.code] = 1; msg = c.icon + ' ' + c.code + ' an! ' + c.text; if (c.code === 'UNENDLICHSTERNE') { save.stars = 999999; G.refreshStars && G.refreshStars(); } if (c.code === 'RIESE') delete s.on.ZWERG; if (c.code === 'ZWERG') delete s.on.RIESE; } persist(); }
    A.fanfare && A.fanfare(); fx.burst(P.x, 2.2, P.z, 28, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 6, 1.3, 28, 5); say(msg, 5200); return { ok: true, msg };
  };
  /* jedes Bild: Größe + Regenbogenspur */
  let sc = 1, tr = 0;
  K.update = function (dt, t) {
    const ch = G.char && G.char(); if (ch && ch.group) { const want = K.size(); if (Math.abs(sc - want) > .01 || ch.group.scale.x !== want) { sc += (want - sc) * Math.min(1, dt * 6); if (want === 1 && Math.abs(sc - 1) < .02) sc = 1; ch.group.scale.setScalar(sc); } }
    if (on('REGENBOGENSPUR') && !P.veh) { tr -= dt; if (tr <= 0 && (P.speed > .6 || P.y > .5)) { tr = .06; const k = (t * 3) % 1, col = [[1, .3, .3], [1, .7, .2], [1, 1, .3], [.3, 1, .4], [.3, .7, 1], [.7, .4, 1]][(k * 6) | 0]; fx.burst(P.x, Math.max(.2, P.y + .3), P.z, 2, [col, [1, 1, 1]], 1.6, .6, 30, 0); } }
  };
  /* Eingabefenster */
  let panel = null;
  K.openPanel = function () {
    K.closePanel(); G.setStick && G.setStick(0, 0); panel = document.createElement('div'); panel.style.cssText = 'position:fixed;inset:0;z-index:99995;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.62);font-family:Fredoka,system-ui,sans-serif';
    const card = document.createElement('div'); card.style.cssText = 'background:#fffaf0;border:6px solid #9a6af0;border-radius:24px;padding:16px;width:min(94vw,440px);text-align:center;max-height:92vh;overflow:auto'; panel.appendChild(card);
    const draw = (msg, good) => {
      card.innerHTML = '<div style="font-size:26px;font-weight:900;color:#5a3aa0">🔑 Code eingeben</div><div style="font-size:14px;color:#556;margin:4px 0 10px">Geheimcodes schalten Specials und Cheats frei. Gleicher Code nochmal = aus.</div>';
      const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;justify-content:center'; const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.autocapitalize = 'characters'; inp.placeholder = 'CODE'; inp.setAttribute('aria-label', 'Code'); inp.style.cssText = 'flex:1;min-width:0;font:800 22px inherit;text-transform:uppercase;text-align:center;border-radius:14px;border:3px solid #9a6af0;padding:8px'; const go = document.createElement('button'); go.type = 'button'; go.textContent = '✔ Einlösen'; go.style.cssText = 'border-radius:14px;border:3px solid #4cd07d;background:#fff;padding:8px 14px;font:900 17px inherit;cursor:pointer';
      const run = () => { const r = K.redeem(inp.value); draw(r.msg, r.ok); }; go.onclick = run; inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') run(); if (e.key === 'Escape') K.closePanel(); }); row.append(inp, go); card.appendChild(row);
      if (msg) { const m = document.createElement('div'); m.style.cssText = 'margin:10px 0;padding:8px;border-radius:12px;font-weight:800;background:' + (good ? '#d8ffe4' : '#ffe0e0'); m.textContent = msg; card.appendChild(m); }
      const act = K.active(); const a = document.createElement('div'); a.style.cssText = 'margin-top:10px;text-align:left;font-size:15px;font-weight:700'; a.textContent = act.length ? 'Aktiv: ' + act.map(c => c.icon + ' ' + c.code).join(' · ') : 'Gerade ist kein Special an.'; card.appendChild(a);
      const x = document.createElement('button'); x.type = 'button'; x.textContent = 'Schließen'; x.style.cssText = 'margin-top:12px;border-radius:14px;border:3px solid #e0902a;background:#fff;padding:8px 22px;font:800 16px inherit;cursor:pointer'; x.onclick = K.closePanel; card.appendChild(x); setTimeout(() => { try { inp.focus(); } catch (e) { } }, 50);
    };
    draw(); document.body.appendChild(panel); K.panelOpen = true;
  };
  K.closePanel = function () { if (panel) { panel.remove(); panel = null; } K.panelOpen = false; };
  K.dbg = { norm, S };
  return K;
};
