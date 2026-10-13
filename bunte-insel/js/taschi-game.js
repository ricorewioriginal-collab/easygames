'use strict';
/* Bunte Insel – Taschi-Land 🔴 (Spiel): Starter-Wahl beim Professor, Taschis fangen (Taschibälle), rundenweise Kämpfe (Typen, Attacken, Level, Entwicklung),
   Arena mit 4 Leitern + Meisterin, Team Funke, Taschidex, Heilhaus, Fangladen, 8 Orden. Freunde (Blitzi, Fellino …) laufen frei herum und sind nie Gegner. Alles selbst erfunden. */
BI.createTaschi = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { open: false, fast: false, ready: false }, T = BI.TASCHI, SP = BI.TSPECIES, MV = BI.TMOVES, TY = BI.TTYPES, CH = BI.TCHART, IT = BI.TITEMS, TR = BI.TTRAINERS, ORD = BI.TORDEN, TAU = Math.PI * 2;
  const S = () => { const s = save.taschi || (save.taschi = {}); s.team = s.team || []; s.box = s.box || []; s.dex = s.dex || {}; s.orden = s.orden || {}; s.items = s.items || { ball: 5, trank: 2 }; s.done = s.done || {}; s.n = s.n || { caught: 0, wins: 0 }; return s; };
  const $ = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const hpMax = (id, lv) => Math.floor(SP[id].hp * 2 * lv / 100) + lv + 10, stat = (b, lv) => Math.floor(b * 2 * lv / 100) + 5, need = lv => Math.floor(lv * lv * .9) + 12;
  const movesAt = (id, lv) => { const u = []; for (const m of SP[id].mv) if (m[0] <= lv && !u.includes(m[1])) u.push(m[1]); return u.slice(-4); };
  const mk = (id, lv) => { const m = { id, lv, xp: 0, mv: movesAt(id, lv) }; m.hp = hpMax(id, lv); return m; };
  const eff = (mt, dt) => (CH[mt] && CH[mt][dt] != null ? CH[mt][dt] : 1);
  const nOrden = () => Object.keys(S().orden).length, nameOf = m => SP[m.id].n, pic = id => BI.taschiPic(id) || '';
  const seen = id => { const d = S().dex; if (!d[id]) { d[id] = 1; } }, got = id => { const d = S().dex, was = d[id] === 2; d[id] = 2; if (!was) setTimeout(milestones, 50); };
  const flag = f => { (save.flags || (save.flags = {}))[f] = 1; };
  const damage = (att, def, mv) => { const a = SP[att.id], d = SP[def.id], e = eff(mv.t, d.t), crit = Math.random() < .06; let x = Math.floor(((2 * att.lv / 5 + 2) * mv.p * stat(a.at, att.lv) / stat(d.df, def.lv)) / 50) + 2; x = Math.floor(x * (a.t === mv.t ? 1.5 : 1) * e * (.85 + Math.random() * .15) * (crit ? 1.5 : 1)); return { d: e === 0 ? 0 : Math.max(1, x), eff: e, crit: crit && e > 0 }; };
  K.mk = mk; K.hpMax = hpMax; K.eff = eff; K.damage = damage; K.movesAt = movesAt; K.S = S;

  /* ===== Freunde & Personen auf der Insel ===== */
  const FR = ['blitzi', 'fellino', 'flamino', 'wellino', 'blitzino', 'laubino', 'glutzahn', 'samenling', 'plaetscher'], friends = [], npcs = [];
  const place = (g, a, b, h) => { const p = T.at(a, b); g.position.set(p.x, 0, p.z); g.rotation.y = h == null ? Math.atan2(-T.ux, -T.uz) : h; scene.add(g); return p; };
  K.build = function () {
    if (K.ready) return; K.ready = true; if (BI.buildTaschiZones) BI.buildTaschiZones({ W, scene });
    FR.forEach((id, i) => { const g = BI.taschiMesh(id, { s: .85 }), a = -34 + Math.cos(i / FR.length * TAU) * 11, b = Math.sin(i / FR.length * TAU) * 11, p = place(g, a, b, i); friends.push({ id, g, x: p.x, z: p.z, tx: p.x, tz: p.z, h: i, w: Math.random() * 3, hop: 0, hx: p.x, hz: p.z }); });
    const look = (o) => Object.assign({ hat: 'none', style: 'short', skin: 0xf3c9a0, pants: 0x4a4a5a, shoe: 0x333333 }, o);
    const mkN = (id, a, b, name, icon, o, h, label) => { BI.DLG_LOOKS[name] = look(o); const c = BI.makeChar(look(o)); const p = place(c.group, a, b, h); npcs.push({ id, c, x: p.x, z: p.z, name, icon, label, r: 3.2 }); return npcs[npcs.length - 1]; };
    mkN('prof', -31, 19, 'Professor Ulme', '🔬', { shirt: 0xffffff, pants: 0x6a5a4a, hair: 0xc8c8d0, style: 'short', logo: 0xe8453c }, null, ['🔬', 'Mit Professor Ulme reden']);
    mkN('nurse', -32, -20, 'Schwester Hanna', '💖', { shirt: 0xff9ac0, pants: 0xffffff, hair: 0xff9ac0, style: 'bun' }, null, ['💖', 'Heilhaus: Taschis heilen']);
    mkN('shop', -14, -23, 'Fabi vom Fangladen', '🛒', { shirt: 0x3f8cff, pants: 0xffffff, hair: 0x4a3320, hat: 'cap', style: 'short' }, null, ['🛒', 'Fangladen: Taschibälle kaufen']);
    mkN('kai', -22, -4, 'Kai', '🧢', { shirt: 0x3f6fd8, pants: 0x3a3a4a, hair: 0x222222, hat: 'cap', style: 'spiky', logo: 0xffffff }, null, ['🧢', 'Freundschafts-Kampf mit Kai']);
    for (const [id, off, rad] of [['fiete', -1.3, 14], ['perla', -.65, 14], ['volt', .65, 14], ['bluete', 1.3, 14], ['aurelia', 0, 16.5]]) {
      const q = T.arenaPos(off, rad), look2 = { fiete: { shirt: 0x8a8a96, hair: 0x6b4423, style: 'spiky', skin: 0xd8a070 }, perla: { shirt: 0x3f9cff, pants: 0xffffff, hair: 0xff8a3a, style: 'ponytail' }, volt: { shirt: 0xffd23f, pants: 0x3a3a4a, hair: 0x4a3320, hat: 'pirate', style: 'short' }, bluete: { shirt: 0x4cc05a, pants: 0xffffff, hair: 0xff9ac0, style: 'long', dress: true }, aurelia: { shirt: 0xb36bff, pants: 0xb36bff, hair: 0xf3d98a, style: 'long', hat: 'crown', dress: true } }[id];
      const c = BI.makeChar(look(look2)); c.group.position.set(q.x, id === 'aurelia' ? .7 : 0, q.z); c.group.rotation.y = q.h; scene.add(c.group); npcs.push({ id, c, x: q.x, z: q.z, name: TR[id].n, icon: TR[id].icon, label: [TR[id].icon, TR[id].n + ' herausfordern'], r: 3.4, leader: id });
    }
    const jp = T.at(60, -9); { const c = BI.makeChar(look({ shirt: 0xffffff, pants: 0xffffff, hair: 0xe8453c, style: 'long', logo: 0xe8453c, dress: true })); const p = place(c.group, 59, -10, Math.atan2(T.ux, T.uz) + Math.PI + .4); npcs.push({ id: 'jette', c, x: p.x, z: p.z, name: 'Jette', icon: '🎈', label: ['🎈', 'Team Funke herausfordern'], r: 3.4, funke: 1 }); }
    { const c = BI.makeChar(look({ shirt: 0xffffff, pants: 0xffffff, hair: 0x3f8cff, style: 'spiky', logo: 0xe8453c })); const p = place(c.group, 59, -3, Math.atan2(T.ux, T.uz) + Math.PI - .4); npcs.push({ id: 'jim', c, x: p.x, z: p.z, name: 'Jim', icon: '🎈', label: ['🎈', 'Team Funke herausfordern'], r: 3.4, funke: 1 }); }
    { const g = BI.taschiMesh('mauzi', { s: 1.25 }), p = place(g, 63, -6, Math.atan2(T.ux, T.uz) + Math.PI); npcs.push({ id: 'mauzi', c: { group: g }, x: p.x, z: p.z, name: 'Mauzi', icon: '🐱', label: ['🐱', 'Team Funke herausfordern'], r: 3.4, funke: 1 }); }
    { const p = T.at(T.statue.a + 0, T.statue.b); npcs.push({ id: 'statue', x: p.x, z: p.z, name: 'Statue', icon: '🗿', label: ['🗿', 'Statue von Professor Ulme'], r: 8.5 }); }
    { const p = T.at(-30, 16); npcs.push({ id: 'table', x: p.x, z: p.z, name: 'Starter-Tisch', icon: '🔴', label: ['🔴', 'Drei Taschibälle ansehen'], r: 3.6 }); }
  };

  /* ===== Oberfläche (Kampf + Fenster) ===== */
  const css = $('style'); css.textContent = `
#tbat,#tpan{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;font-family:inherit;color:#1c2540;-webkit-user-select:none;user-select:none}
#tbat[hidden],#tpan[hidden]{display:none}
#tbat{background:linear-gradient(#9fd8ff 0,#d8f0ff 38%,#8fd66b 38.1%,#5fb64a 100%)}
#tbat .st{position:relative;flex:1;min-height:0}
#tbat .sp{position:absolute;width:min(34vw,170px);height:min(34vw,170px);object-fit:contain;filter:drop-shadow(0 6px 4px rgba(0,0,0,.25))}
#tbat .sp.foe{right:6%;top:9%}#tbat .sp.me{left:4%;bottom:2%;width:min(40vw,210px);height:min(40vw,210px)}
#tbat .pan{position:absolute;background:rgba(255,255,255,.93);border-radius:14px;padding:6px 10px;min-width:150px;box-shadow:0 3px 8px rgba(0,0,0,.2);font-size:14px}
#tbat .pan.foe{left:3%;top:5%}#tbat .pan.me{right:3%;bottom:6%}
#tbat .pan b{font-size:16px}#tbat .hp{height:9px;border-radius:5px;background:#d8dee8;overflow:hidden;margin:3px 0}#tbat .hp i{display:block;height:100%;background:#3fc860;transition:width .5s,background .5s}
#tbat .msg{margin:6px 8px;padding:10px 14px;border-radius:14px;background:#1c2540;color:#fff;font-size:17px;font-weight:600;min-height:3.1em;display:flex;align-items:center}
#tbat .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 8px max(10px,env(safe-area-inset-bottom))}
#tbat .acts button,#tpan button.tb{border:0;border-radius:14px;padding:10px 6px;font-size:16px;font-weight:700;background:#fff;color:#1c2540;box-shadow:0 3px 0 rgba(0,0,0,.18);min-height:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-align:left}
#tbat .acts button:disabled{opacity:.45}#tbat .acts button small{font-weight:500;opacity:.7}
#tbat .acts .go{background:#ff6a3a;color:#fff}#tbat .acts .bk{background:#dfe6f2}
#tpan{background:rgba(20,28,60,.72);align-items:center;justify-content:center}
#tpan .box{background:#fffaf0;border-radius:20px;width:min(94vw,560px);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4)}
#tpan .hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#e8453c;color:#fff;font-weight:800;font-size:18px}
#tpan .hd button{border:0;color:#1c2540;background:#fff;border-radius:50%;width:38px;height:38px;font-size:18px;cursor:pointer}
#tpan .bd{padding:10px;overflow:auto;display:flex;flex-direction:column;gap:8px}
#tpan .row{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:6px 10px;box-shadow:0 2px 0 rgba(0,0,0,.1)}
#tpan .row img{width:56px;height:56px;object-fit:contain}#tpan .row .t{flex:1;font-size:15px}#tpan .row .t small{display:block;opacity:.7}
#tpan .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}
#tpan .cell{background:#fff;border-radius:12px;padding:6px;text-align:center;font-size:12px;box-shadow:0 2px 0 rgba(0,0,0,.1)}#tpan .cell img{width:64px;height:64px;object-fit:contain}
#tpan .cell.no img{filter:brightness(0) opacity(.35)}#tpan .cell.big{font-size:30px;padding:8px}
#tpan .tip{font-size:14px;padding:4px 6px}#tpan button.tb{min-height:42px;padding:8px 12px}
`; document.head.appendChild(css);
  const bat = $('div'); bat.id = 'tbat'; bat.hidden = true; bat.innerHTML = '<div class="st"><div class="pan foe"><b></b> <span class="lv"></span><div class="ty"></div><div class="hp"><i></i></div></div><img class="sp foe" alt=""><img class="sp me" alt=""><div class="pan me"><b></b> <span class="lv"></span><div class="ty"></div><div class="hp"><i></i></div><small class="hpn"></small></div></div><div class="msg"></div><div class="acts"></div>';
  const pan = $('div'); pan.id = 'tpan'; pan.hidden = true; pan.innerHTML = '<div class="box"><div class="hd"><span></span><button aria-label="Schließen">✖</button></div><div class="bd"></div></div>';
  document.body.appendChild(bat); document.body.appendChild(pan);
  const q$ = (r, s) => r.querySelector(s), acts = q$(bat, '.acts'), msgEl = q$(bat, '.msg');
  let B = null, panelOpen = false;
  K.busy = () => !!B || panelOpen; Object.defineProperty(K, 'open', { get: () => !!B || panelOpen, set: () => { } });
  const tchips = id => `<span title="${TY[SP[id].t].n}">${TY[SP[id].t].i} ${TY[SP[id].t].n}</span>`;
  const hpCol = r => r > .5 ? '#3fc860' : r > .2 ? '#f0b82a' : '#e8453c';

  /* ---- Fenster (Professor, Team, Dex …) ---- */
  function openPanel(title, fill) { panelOpen = true; pan.hidden = false; q$(pan, '.hd span').textContent = title; const bd = q$(pan, '.bd'); bd.innerHTML = ''; fill(bd); G.setStick && G.setStick(0, 0); }
  function closePanel() { panelOpen = false; pan.hidden = true; persist(); }
  q$(pan, '.hd button').onclick = closePanel; K.closePanel = closePanel;
  const row = (img, title, sub, btns) => { const r = $('div', 'row'); if (img) { const im = $('img'); im.src = img; im.alt = ''; r.appendChild(im); } r.appendChild($('div', 't', '<b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : ''))); for (const [t, f, dis] of btns || []) { const b = $('button', 'tb', t); if (dis) b.disabled = true; b.onclick = f; r.appendChild(b); } return r; };
  const bar = m => { const r = Math.max(0, m.hp / hpMax(m.id, m.lv)); return `<div class="hp" style="height:8px;border-radius:4px;background:#d8dee8;overflow:hidden;margin:3px 0"><i style="display:block;height:100%;width:${Math.round(r * 100)}%;background:${hpCol(r)}"></i></div>`; };

  function teamPanel() {
    openPanel('🎒 Mein Team', bd => {
      const s = S(); bd.appendChild($('div', 'tip', 'Tippe auf „⬆️“, um einen Freund nach vorn zu stellen. Mit Tränken 🧪 und Steinen 💎 kannst du hier auch heilen und entwickeln.'));
      s.team.forEach((m, i) => { const btns = []; if (i > 0) btns.push(['⬆️', () => { s.team.splice(i, 1); s.team.unshift(m); teamPanel(); }]); const it = ['supertrank', 'trank'].find(k => s.items[k]); if (m.hp < hpMax(m.id, m.lv) && m.hp > 0 && it) btns.push(['🧪', () => { useHeal(it, m); teamPanel(); }]);
        if (SP[m.id].st) for (const k of Object.keys(IT)) if (IT[k].stone && s.items[k]) btns.push([IT[k].i, () => { stoneEvolve(m, k); teamPanel(); }]);
        if (s.team.length > 1) btns.push(['📦', () => { s.team.splice(i, 1); s.box.push(m); teamPanel(); }]);
        bd.appendChild(row(pic(m.id), nameOf(m) + ' · Lv ' + m.lv + ' ' + tchips(m.id), 'HP ' + m.hp + '/' + hpMax(m.id, m.lv) + bar(m), btns)); });
      if (s.box.length) { bd.appendChild($('div', 'tip', '<b>📦 Taschi-Lager</b> (' + s.box.length + ')')); s.box.forEach((m, i) => bd.appendChild(row(pic(m.id), nameOf(m) + ' · Lv ' + m.lv, null, [['➡️ Team', () => { if (s.team.length >= 6) { say('Das Team ist voll (6) – stelle erst einen ins Lager.', 2400); return; } s.box.splice(i, 1); s.team.push(m); teamPanel(); }]]))); }
      const items = Object.keys(s.items).filter(k => s.items[k] > 0); bd.appendChild($('div', 'tip', '<b>Beutel:</b> ' + (items.map(k => IT[k].i + ' ' + IT[k].n + ' ×' + s.items[k]).join(' · ') || 'leer')));
    });
  }
  function useHeal(k, m) { const s = S(); if (!s.items[k]) return false; const it = IT[k]; if (it.revive) { if (m.hp > 0) return false; m.hp = Math.ceil(hpMax(m.id, m.lv) / 2); } else { if (m.hp <= 0 || m.hp >= hpMax(m.id, m.lv)) return false; m.hp = Math.min(hpMax(m.id, m.lv), m.hp + it.heal); } s.items[k]--; return true; }
  function stoneEvolve(m, k) { const s = S(), to = IT[k].stone; if (!s.items[k] || !SP[m.id].st || !SP[m.id].st.includes(to)) return false; s.items[k]--; const r = m.hp / hpMax(m.id, m.lv); m.id = to; m.hp = Math.max(1, Math.round(hpMax(to, m.lv) * r)); m.mv = Array.from(new Set(m.mv.concat(movesAt(to, m.lv)))).slice(-4); got(to); say('✨ Wow! Dein Fellino ist jetzt ' + SP[to].n + '!', 3600); G.fanfare && G.fanfare(); return true; }
  function dexPanel(world) {
    openPanel('📘 Taschidex', bd => { const s = S(), all = Object.keys(SP), ids = world ? all.filter(i => SP[i].world === world) : all, n = all.filter(i => s.dex[i] === 2).length;
      bd.appendChild($('div', 'tip', 'Gefangen: <b>' + n + ' / ' + all.length + '</b>' + (world ? ' · ' + BI.TWORLDS[world][0] : '') + ' · Tippe auf ein Bild.'));
      const chips = $('div', 'tip'); for (const k of [null].concat(Object.keys(BI.TWORLDS))) { const b = $('button', 'tb', k ? (BI.TWORLDS[k][0].split(' ')[0]) : 'Alle'); b.style.cssText = 'margin:2px;padding:4px 8px;min-height:30px;font-size:13px' + (k === (world || null) ? ';background:#ffd23f' : ''); b.onclick = () => dexPanel(k); chips.appendChild(b); } bd.appendChild(chips);
      const g = $('div', 'grid'); for (const id of ids) { const st = s.dex[id] || 0, c = $('div', 'cell' + (st ? '' : ' no'), '<img alt="" src="' + pic(id) + '"><br>' + (st ? SP[id].n : '???') + (st === 2 ? ' ✔️' : '')); c.onclick = () => say(st ? TY[SP[id].t].i + ' ' + SP[id].n + ': ' + SP[id].dex : '❓ Dieses Taschi hast du noch nicht gesehen.', 4800); g.appendChild(c); } bd.appendChild(g); });
  }
  function ordenPanel() {
    openPanel('🏅 Orden', bd => { const s = S(); bd.appendChild($('div', 'tip', 'Du hast <b>' + nOrden() + ' von 8</b> Orden. Löse die Aufgaben der Insel!')); for (const o of ORD) bd.appendChild(row(null, (s.orden[o.key] ? '✅ ' : '⬜ ') + o.icon + ' ' + o.n, o.t, [])); });
  }
  function shopPanel() {
    openPanel('🛒 Fangladen', bd => { const s = S(); bd.appendChild($('div', 'tip', 'Du hast <b>' + save.stars + ' ⭐</b>. Tipp: Je schwächer ein wildes Taschi, desto leichter fängst du es!'));
      for (const k of ['ball', 'super', 'trank', 'supertrank', 'beleber', 'stein_w', 'stein_f', 'stein_d', 'stein_b']) { const it = IT[k]; bd.appendChild(row(null, it.i + ' ' + it.n + ' · ' + it.price + ' ⭐', it.d + ' (du hast ' + (s.items[k] || 0) + ')', [['Kaufen', () => { if (save.stars < it.price) { say('Dafür brauchst du mehr Sterne ⭐', 2000); return; } G.addStars(-it.price); s.items[k] = (s.items[k] || 0) + 1; shopPanel(); }]])); } });
  }
  function starterPanel() {
    openPanel('🔴 Wähle dein erstes Taschi!', bd => { bd.appendChild($('div', 'tip', 'Professor Ulme: „Such dir einen Freund aus – er begleitet dich auf deiner Reise!“')); for (const id of ['glutzahn', 'samenling', 'plaetscher']) bd.appendChild(row(pic(id), SP[id].n + ' ' + tchips(id), SP[id].dex, [['Dieses!', () => { const s = S(); s.team.push(mk(id, 5)); got(id); s.items.ball = Math.max(s.items.ball || 0, 5); G.fanfare && G.fanfare(); say('🔴 ' + SP[id].n + ' ist jetzt dein Freund! Fang im hohen Gras neue Taschis.', 4200); flag('ta_start'); closePanel(); }]])); });
  }
  function heal() { for (const m of S().team.concat(S().box)) m.hp = hpMax(m.id, m.lv); }
  function profPanel() {
    const s = S(), caught = Object.keys(SP).filter(i => s.dex[i] === 2).length;
    openPanel('🔬 Professor Ulme', bd => { bd.appendChild($('div', 'tip', s.team.length ? 'Professor Ulme: „Hast du schon alle Orden? Fang Taschis, gewinne Kämpfe in der Arena und besiege Team Funke!“' : 'Professor Ulme: „Willkommen! Ich erforsche Taschis – das sind freundliche Wesen. Such dir deinen ersten Freund aus!“'));
      if (!s.team.length) bd.appendChild(row(null, '🔴 Erstes Taschi wählen', 'Glutzahn, Samenling oder Plätscherchen', [['Los!', starterPanel]]));
      bd.appendChild(row(null, '📘 Taschidex', caught + ' Taschis gefangen', [['Ansehen', dexPanel]])); bd.appendChild(row(null, '🏅 Orden', nOrden() + ' von 8', [['Ansehen', ordenPanel]])); bd.appendChild(row(null, '🎒 Team & Beutel', s.team.length + ' im Team', [['Ansehen', teamPanel]]));
      if (caught >= 8 && !s.orden.forscher) bd.appendChild(row(null, '📘 Forscher-Orden abholen', 'Du hast 8 verschiedene Taschis gefangen!', [['Abholen', () => { award('forscher'); profPanel(); }]]));
      const gifts = [['gblitzi', 'fels', 'Blitzi', () => { const m = mk('blitzi', Math.max(8, avgLv())); (s.team.length < 6 ? s.team : s.box).push(m); got('blitzi'); }], ['gfellino', 'perle', 'Fellino', () => { const m = mk('fellino', Math.max(8, avgLv())); (s.team.length < 6 ? s.team : s.box).push(m); got('fellino'); }], ['gstein', 'funke', '4 Steine für Fellino', () => { for (const k of ['stein_w', 'stein_f', 'stein_d', 'stein_b']) s.items[k] = (s.items[k] || 0) + 1; }], ['gmeister', 'meister', 'Meisterball ×3', () => { s.items.meister = (s.items.meister || 0) + 3; }]];
      for (const [gk, need2, nm, fn] of gifts) if (s.orden[need2] && !s.done[gk]) bd.appendChild(row(null, '🎁 Geschenk: ' + nm, 'Weil du den ' + ORD.find(o => o.key === need2).n + ' hast!', [['Nehmen', () => { s.done[gk] = 1; fn(); G.fanfare && G.fanfare(); say('🎁 ' + nm + ' bekommen!', 3000); profPanel(); }]])); });
  }
  const avgLv = () => { const t = S().team; return t.length ? Math.round(t.reduce((a, m) => a + m.lv, 0) / t.length) : 5; };

  function award(key) {
    const s = S(); if (s.orden[key]) return; s.orden[key] = 1; const o = ORD.find(x => x.key === key); G.addStars(5); G.fanfare && G.fanfare();
    setTimeout(() => say('🏅 ' + o.icon + ' ' + o.n + ' bekommen! (' + nOrden() + ' von 8) +5 ⭐', 5200), K.fast ? 0 : 400);
    if (nOrden() >= 4) flag('ta_o4'); if (key === 'fang') flag('ta_fang');
    if (nOrden() >= 8) { flag('ta_o8'); G.addStars(10); G.earn && G.earn('taschi_meister'); setTimeout(() => say('👑 Du bist Taschi-Meister! Alle 8 Orden! +10 ⭐', 6200), K.fast ? 0 : 3400); }
    persist();
  }
  K.award = award;

  /* ===== Kampf ===== */
  const cur = () => B.foes[B.fi], mine = () => S().team[B.mi];
  function q(t, ms, fn) { B.q.push({ t, ms, fn }); }
  function go(next) { B.next = next || null; flush(); }
  function msg(t) { msgEl.textContent = t; }
  function flush() {
    if (!B || B.tm) return; const e = B.q.shift();
    if (!e) { B.busy = false; const n = B.next; B.next = null; paint(); if (n) n(); else menu('main'); return; }
    B.busy = true; if (e.t) msg(e.t); if (e.fn) e.fn(); paint(); acts.innerHTML = '';
    if (K.fast) return flush();
    B.tm = setTimeout(() => { B.tm = 0; flush(); }, e.ms || 1000);
  }
  function paint() {
    if (!B) return; const f = cur(), m = mine(); if (!f || !m) return; const pf = q$(bat, '.pan.foe'), pm = q$(bat, '.pan.me');
    const fill = (p, mon, hp) => { const r = Math.max(0, hp / hpMax(mon.id, mon.lv)); q$(p, 'b').textContent = nameOf(mon); q$(p, '.lv').textContent = 'Lv ' + mon.lv; q$(p, '.ty').innerHTML = tchips(mon.id); const i = q$(p, '.hp i'); i.style.width = Math.round(r * 100) + '%'; i.style.background = hpCol(r); };
    fill(pf, f, B.dispF); fill(pm, m, B.dispM); q$(pm, '.hpn').textContent = Math.max(0, B.dispM) + ' / ' + hpMax(m.id, m.lv) + ' HP';
    q$(bat, '.sp.foe').src = pic(f.id); q$(bat, '.sp.me').src = pic(m.id);
  }
  function btn(t, f, cls, dis) { const b = $('button', cls || '', t); if (dis) b.disabled = true; b.onclick = f; acts.appendChild(b); return b; }
  function menu(k, forced) {
    if (!B || B.over || B.busy) return; acts.innerHTML = ''; const s = S(), m = mine();
    if (k === 'main') { msg('Was soll ' + nameOf(m) + ' tun?'); btn('⚔️ Kampf', () => menu('moves')); btn('🎒 Beutel', () => menu('bag')); btn('🔄 Team', () => menu('team')); btn('🏃 Flucht', () => act({ k: 'run' }), '', B.kind === 'trainer'); }
    else if (k === 'moves') { m.mv.forEach((id, i) => { const mv = MV[id], e = eff(mv.t, SP[cur().id].t); btn(TY[mv.t].i + ' ' + mv.n + ' <small>' + (e > 1 ? '💥' : e < 1 ? (e === 0 ? '🚫' : '↓') : '') + '</small>', () => act({ k: 'move', i })); }); btn('◀ Zurück', () => menu('main'), 'bk'); }
    else if (k === 'bag') { const f = cur(); for (const id of ['ball', 'super', 'meister']) if (s.items[id]) btn(IT[id].i + ' ' + IT[id].n + ' ×' + s.items[id], () => act({ k: 'ball', id }), 'go', B.kind === 'trainer'); for (const id of ['trank', 'supertrank']) if (s.items[id]) btn(IT[id].i + ' ' + IT[id].n + ' ×' + s.items[id], () => act({ k: 'heal', id }), '', m.hp >= hpMax(m.id, m.lv)); btn('◀ Zurück', () => menu('main'), 'bk'); if (B.kind === 'trainer') msg('Gegen Trainer darf man keine Taschis fangen!'); }
    else if (k === 'team') { msg(forced ? 'Wen schickst du als Nächstes?' : 'Wen soll ich einwechseln?'); s.team.forEach((t, i) => btn(nameOf(t) + ' Lv ' + t.lv + ' <small>' + t.hp + ' HP</small>', () => act({ k: 'swap', i, forced }), '', t.hp <= 0 || i === B.mi)); if (!forced) btn('◀ Zurück', () => menu('main'), 'bk'); }
  }
  const dn = (mon, foe) => foe ? (B.kind === 'wild' ? 'Wildes ' : 'Gegnerisches ') + nameOf(mon) : nameOf(mon);
  function attack(att, def, mvId, attFoe) {
    const mv = MV[mvId]; q(dn(att, attFoe) + ' setzt ' + mv.n + ' ein! ' + TY[mv.t].i, 900);
    if (Math.random() < .05) { q('…aber es geht daneben!', 800); return false; }
    const r = damage(att, def, mv); def.hp = Math.max(0, def.hp - r.d); const snap = def.hp; q(null, 500, () => { if (attFoe) B.dispM = snap; else B.dispF = snap; });
    if (r.eff > 1) q('Das ist sehr effektiv! 💥', 800); else if (r.eff === 0) q('Das wirkt nicht…', 800); else if (r.eff < 1) q('Das ist nicht sehr effektiv…', 800); if (r.crit) q('Volltreffer! ✨', 700);
    if (def.hp <= 0) { q(dn(def, !attFoe) + ' ist erschöpft!', 1000); return true; } return false;
  }
  function foeMove(f, m) { const mvs = f.mv; if (B.kind === 'trainer' && Math.random() < .65) { let best = mvs[0], bv = -1; for (const id of mvs) { const v = eff(MV[id].t, SP[m.id].t) * MV[id].p; if (v > bv) { bv = v; best = id; } } return best; } return mvs[(Math.random() * mvs.length) | 0]; }
  function act(a) {
    if (!B || B.busy || B.over) return; acts.innerHTML = ''; const s = S(), me = mine(), f = cur(); let fd = false, md = false;
    const doFoe = () => { if (attack(f, me, foeMove(f, me), true)) md = true; };
    if (a.k === 'move') { const mid = me.mv[a.i]; if (!mid) return; const first = stat(SP[me.id].sp, me.lv) + (Math.random() < .5 ? .5 : 0) >= stat(SP[f.id].sp, f.lv); if (first) { if (attack(me, f, mid, false)) fd = true; if (!fd) doFoe(); } else { doFoe(); if (!md && attack(me, f, mid, false)) fd = true; } }
    else if (a.k === 'swap') { B.mi = a.i; const m2 = mine(); B.dispM = m2.hp; q('Los, ' + nameOf(m2) + '! ' + TY[SP[m2.id].t].i, 900, () => { B.dispM = m2.hp; }); if (!a.forced) { const me2 = m2; if (attack(f, me2, foeMove(f, me2), true)) md = true; } }
    else if (a.k === 'heal') { const it = IT[a.id]; if (useHeal(a.id, me)) { const snap = me.hp; q('🧪 ' + nameOf(me) + ' wird geheilt!', 900, () => { B.dispM = snap; }); doFoe(); } else { menu('bag'); return; } }
    else if (a.k === 'run') { const p = .5 + (stat(SP[me.id].sp, me.lv) - stat(SP[f.id].sp, f.lv)) / 120 + B.runs * .15; B.runs++; if (Math.random() < p || K.forceRun) { q('Du bist sicher weggelaufen! 🏃', 900); B.res = 'run'; return end(); } q('Weglaufen klappt nicht!', 800); doFoe(); }
    else if (a.k === 'ball') { if (B.kind === 'trainer' || !s.items[a.id]) return; s.items[a.id]--; const it = IT[a.id], sp = SP[f.id], r = f.hp / hpMax(f.id, f.lv), p = Math.min(1, Math.max(.05, sp.cr * it.mul * (.4 + 1.2 * (1 - r)))), ok = Math.random() < p || it.mul > 50 || K.forceCatch, sh = ok ? 3 : (Math.random() * 3) | 0;
      q(it.i + ' Du wirfst einen ' + it.n + '!', 900); for (let i = 0; i < sh; i++) q('…wackel…', 650); if (ok) { q('✨ ' + nameOf(f) + ' wurde gefangen! ✨', 1200); B.res = 'caught'; B.caught = f; return end(); } q(nameOf(f) + ' hat sich befreit!', 900); doFoe(); }
    resolve(fd, md);
  }
  K.play = act;
  function resolve(fd, md) {
    if (fd) return foeDown(); if (md) return meDown(); go(null);
  }
  function gain(m, f) {
    const sp = SP[f.id], xp = Math.max(8, Math.floor((sp.hp + sp.at + sp.df + sp.sp) / 4 * f.lv / 4 * (B.kind === 'trainer' ? 1.4 : 1))); q(nameOf(m) + ' bekommt ' + xp + ' EP! ⭐', 900); m.xp += xp;
    while (m.xp >= need(m.lv)) { m.xp -= need(m.lv); const old = hpMax(m.id, m.lv); m.lv++; const nw = hpMax(m.id, m.lv); if (m.hp > 0) m.hp += nw - old; const snap = m.hp; q('⬆️ ' + nameOf(m) + ' ist jetzt Level ' + m.lv + '!', 1100, () => { if (mine() === m) B.dispM = snap; });
      const nm = movesAt(m.id, m.lv); for (const x of nm) if (!m.mv.includes(x)) q('Neue Attacke gelernt: ' + MV[x].n + '! ' + TY[MV[x].t].i, 1100); m.mv = nm; const e = SP[m.id].evo; if (e && m.lv >= e.lv) evolve(m, e.to); }
  }
  function evolve(m, to) { q('✨ ' + nameOf(m) + ' verändert sich…', 1300); const r = m.hp / hpMax(m.id, m.lv); m.id = to; m.hp = Math.max(1, Math.round(hpMax(to, m.lv) * r)); m.mv = Array.from(new Set(m.mv.concat(movesAt(to, m.lv)))).slice(-4); got(to); const snap = m.hp; q('…jetzt ist es ' + nameOf(m) + '! 🎉', 1500, () => { if (mine() === m) B.dispM = snap; }); }
  function foeDown() {
    const m = mine(), f = cur(); if (m.hp > 0) gain(m, f);
    if (B.fi + 1 < B.foes.length) { B.fi++; const nx = cur(); seen(nx.id); q((TR[B.tr] ? TR[B.tr].n : 'Der Trainer') + ' schickt ' + nameOf(nx) + '!', 1000, () => { B.dispF = nx.hp; }); return go(null); }
    B.res = 'win'; if (B.tr) { const t = TR[B.tr]; q('🏆 ' + t.n + ' wurde besiegt!', 1000); q(t.win, 1800); } else q('Der Kampf ist gewonnen! 🎉', 900); end();
  }
  function meDown() {
    const s = S(); if (s.team.some(t => t.hp > 0)) { B.busy = false; return go(() => { acts.innerHTML = ''; B.busy = false; menu('team', true); }); }
    q('Dein ganzes Team ist müde… 💤', 1300); q('Du eilst ins Heilhaus und ruhst dich aus.', 1400); B.res = 'lose'; end();
  }
  function end() { B.over = true; go(() => finish()); }
  function finish() {
    const b = B, s = S(); if (b.tm) clearTimeout(b.tm); B = null; bat.hidden = true; G.setStick && G.setStick(0, 0);
    if (b.res === 'caught') { const f = b.caught; got(f.id); s.n.caught++; (s.team.length < 6 ? s.team : s.box).push(f); say('🔴 ' + nameOf(f) + ' ' + (s.team.includes(f) ? 'ist jetzt in deinem Team!' : 'wartet im Taschi-Lager.'), 3600); if (!s.orden.fang) award('fang'); G.earn && G.earn('taschi_fang'); }
    if (b.res === 'win') { s.n.wins++; if (b.tr) { const t = TR[b.tr], first = !s.done[b.tr]; s.done[b.tr] = 1; G.addStars(first ? t.star : 1); if (t.orden) award(t.orden); if (first && !t.orden) say(t.icon + ' ' + t.win + ' +' + t.star + ' ⭐', 4200); } }
    if (b.res === 'lose') { heal(); const p = T.at(-33, -17); P.x = p.x; P.z = p.z; P.y = 0; }
    persist(); if (b.onEnd) b.onEnd(b.res); K.last = b.res;
  }
  function startBattle(o) {
    const s = S(); if (B) return false; if (!s.team.some(m => m.hp > 0)) { say(s.team.length ? '💤 Dein Team ist müde – ab ins Heilhaus!' : '🔴 Hol dir erst dein erstes Taschi bei Professor Ulme!', 3200); return false; }
    B = { kind: o.trainer ? 'trainer' : 'wild', tr: o.trainer || null, foes: o.foes, fi: 0, mi: s.team.findIndex(m => m.hp > 0), q: [], busy: false, over: false, onEnd: o.onEnd, runs: 0, next: null, tm: 0, res: '' };
    bat.hidden = false; G.setStick && G.setStick(0, 0); const f = cur(), m = mine(); seen(f.id); B.dispF = f.hp; B.dispM = m.hp; paint(); acts.innerHTML = '';
    if (B.tr) { q(TR[B.tr].icon + ' ' + TR[B.tr].n + ' fordert dich heraus!', 1300); q(TR[B.tr].n + ' schickt ' + nameOf(f) + '!', 900); } else q('Ein wildes ' + nameOf(f) + ' (Lv ' + f.lv + ') erscheint! ' + TY[SP[f.id].t].i, 1100);
    q('Los, ' + nameOf(m) + '! ' + TY[SP[m.id].t].i, 900); go(null); return true;
  }
  K.startBattle = startBattle;
  K.wild = function (id, lv, onEnd) { return startBattle({ foes: [mk(id, lv)], onEnd }); };
  K.fightTrainer = function (id, onEnd) { const t = TR[id]; return startBattle({ trainer: id, foes: t.team.map(([s, l]) => mk(s, l)), onEnd }); };
  K.battle = () => B; K.state = () => ({ B, S: S() });

  /* ===== Leute, Gras, Freunde ===== */
  const near = (o, r) => Math.hypot(P.x - o.x, P.z - o.z) < (r || o.r || 3);
  K.near = function () {
    if (!K.ready || P.veh || P.y > 1.5 || B || panelOpen) return null; if (Math.hypot(P.x - T.x, P.z - T.z) > T.R + 6) return null; let best = null, bd = 1e9;
    for (const n of npcs) { const d = Math.hypot(P.x - n.x, P.z - n.z); if (d < n.r && d < bd) { bd = d; best = { k: 'npc', id: n.id, label: n.label }; } }
    for (const f of friends) { const d = Math.hypot(P.x - f.x, P.z - f.z); if (d < 2.6 && d < bd) { bd = d; best = { k: 'friend', f, label: ['💛', SP[f.id].n + ' streicheln'] }; } }
    return best;
  };
  K.interact = function (n) {
    const s = S(); if (!n) return;
    if (n.k === 'friend') { const f = n.f; f.hop = 1; fx && fx.burst && fx.burst(f.x, 1.2, f.z, 10, [0xff7ac0, 0xffd23f, 0xffffff], 5, 1.5, 12, 3); const line = { blitzi: 'Blitzi: „Bli-bli-blitz!“ ⚡ (schmiegt sich an dich)', fellino: 'Fellino: „Fell-fell!“ Es sieht dich mit großen Augen an.', flamino: 'Flamino wärmt dir die Hände. 🔥', wellino: 'Wellino spritzt dir ein bisschen Wasser auf die Schuhe. 💧', blitzino: 'Blitzino knistert fröhlich. ⚡', laubino: 'Laubino riecht nach frischem Gras. 🌿', glutzahn: 'Glutzahn wedelt mit der Flammen-Schwanzspitze. 🔥', samenling: 'Samenling quakt leise. Die Knolle wackelt! 🌿', plaetscher: 'Plätscherchen versteckt sich kurz im Panzer – und lugt dann wieder raus. 💧' }[f.id]; say(line, 3200); seen(f.id); return; }
    const id = n.id;
    if (id === 'prof') return profPanel(); if (id === 'nurse') return K.healVisit(); if (id === 'shop') return shopPanel();
    if (id === 'statue') return say('🗿 Professor Ulme hat Taschi-Land entdeckt und schützt alle Freunde hier. Seine Statue hält den allerersten Taschiball!', 6200);
    if (id === 'table') return say('🔴🔵🟢 Drei Taschibälle – frag Professor Ulme, welcher Freund zu dir passt!', 4200);
    if (id === 'kai') { if (!s.team.length) return say('🧢 Kai: „Hol dir erst ein Taschi beim Professor – dann kämpfen wir!“ (Blitzi winkt dir zu)', 4400); return K.fightTrainer('kai'); }
    if (TR[id] && TR[id].orden && id !== 'mauzi') { if (id === 'aurelia' && nOrden() < 7) return say('👑 Aurelia: „Hol erst alle anderen 7 Orden – dann kämpfen wir!“ (Du hast ' + nOrden() + ')', 4800); if (!s.team.length) return say('Hol dir erst ein Taschi beim Professor!', 3000); return K.fightTrainer(id); }
    if (id === 'jette' || id === 'jim' || id === 'mauzi') { if (!s.team.length) return say('🎈 Jette: „Hihi, ohne Taschi? Komm später wieder!“', 3200); if (s.orden.team) return say('🎈 Team Funke: „Der Ballon gehört jetzt dir! Wir laufen wieder zu Fuß.“', 4200); const nx = ['jette', 'jim', 'mauzi'].find(k => !s.done[k]); return K.fightTrainer(nx, res => { if (res === 'win' && nx !== 'mauzi') setTimeout(() => say('🎈 Weiter geht’s – der Nächste von Team Funke wartet!', 3000), 300); }); }
  };
  K.healVisit = function () { const s = S(); if (!s.team.length) { say('💖 Schwester Hanna: „Du hast noch kein Taschi – frag zuerst Professor Ulme!“', 4200); return; } const was = s.team.concat(s.box).some(m => m.hp < hpMax(m.id, m.lv)); heal(); G.fanfare && G.fanfare(); say(was ? '💖 Schwester Hanna: „Fertig! Alle deine Taschis sind wieder topfit.“' : '💖 Schwester Hanna: „Deine Taschis sind schon ganz fit – super!“', 4200); teamPanel(); };
  K.openTeam = teamPanel; K.openShop = shopPanel;
  K.act = K.interact; K.menu = menu;
  let accum = 0, nextEnc = 9, zoneWas = null, hintT = 0; const zoneAt = (x, z) => { for (const Z of T.zones) { const p = T.at(Z.a, Z.b); if (Math.hypot(x - p.x, z - p.z) < Z.r - 1) { Z.world = 'TASCHI'; return Z; } } for (const Z of BI.TZONES || []) if (Math.hypot(x - Z.x, z - Z.z) < Z.r - 1) return Z; return null; };
  K.zoneAt = zoneAt;
  K.encounter = function (zone) {
    const s = S(), pool = zone.world === 'TASCHI' ? BI.TWILD[zone.id] : BI.TWILDW[zone.world], tot = pool.reduce((a, p) => a + p[1], 0); let r = Math.random() * tot, id = pool[0][0]; for (const p of pool) { r -= p[1]; if (r <= 0) { id = p[0]; break; } } const base = zone.world === 'TASCHI' ? 3 + nOrden() * 2 : BI.TWORLDS[zone.world][1] + Math.floor(nOrden() * 1.2), lv = Math.max(3, Math.min(40, base + ((Math.random() * 3) | 0))); return K.wild(id, lv);
  };
  let lx = null, lz = null, offWas = null;
  K.off = () => !!save.taschiOff;
  K.update = function (dt, t) {
    if (!K.ready) return; const d = Math.hypot(P.x - T.x, P.z - T.z), off = K.off() && d > T.R + 12; /* Taschis aus: nur außerhalb von Taschi-Land – die Insel selbst geht normal */
    const ok = K.off() + '|' + off; if (ok !== offWas) { offWas = ok; if (BI.TZONES.mesh) BI.TZONES.mesh.visible = !K.off(); const hb = document.getElementById('bTaschiHub'); if (hb) hb.hidden = off; }
    followUpdate(dt, t, off);
    if (d <= T.R + 140) { for (const f of friends) { f.w -= dt; if (f.w <= 0) { f.w = 2 + Math.random() * 4; const a = Math.random() * TAU, r = Math.random() * 11, c = T.at(T.statue.a, T.statue.b); f.tx = c.x + Math.sin(a) * (4.5 + r); f.tz = c.z + Math.cos(a) * (4.5 + r); }
      const dx = f.tx - f.x, dz = f.tz - f.z, l = Math.hypot(dx, dz); if (l > .15) { const k = Math.min(l, 1.6 * dt) / l; f.x += dx * k; f.z += dz * k; f.h = Math.atan2(dx, dz); } f.hop = Math.max(0, f.hop - dt * 2.2);
      f.g.position.set(f.x, W.groundY(f.x, f.z) + Math.abs(Math.sin(t * (l > .15 ? 7 : 2) + f.w)) * (l > .15 ? .12 : .02) + Math.sin(f.hop * Math.PI) * .9, f.z); f.g.rotation.y = f.h; }
    for (const n of npcs) if (n.c && n.c.group) { const gp = n.c.group.position; if (n.gy == null) n.gy = W.groundY(gp.x, gp.z); gp.y = n.id === 'aurelia' ? .7 + Math.sin(t * 2) * .02 : n.gy + Math.sin(t * 2 + n.x) * .02 + .02; } }
    if (P.veh || B || panelOpen || P.y > 1.5) { lx = null; return; }
    let z = zoneAt(P.x, P.z); if (z && K.off() && z.world !== 'TASCHI') z = null; if (lx != null && z) { accum += Math.hypot(P.x - lx, P.z - lz); if (accum > nextEnc) { accum = 0; nextEnc = 7 + Math.random() * 9; if (S().team.some(m => m.hp > 0)) { K.encounter(z); } else if (hintT <= 0) { hintT = 12; say(S().team.length ? '💤 Dein Team ist müde – ab ins Heilhaus!' : '🔴 Im Gras raschelt es… Hol dir erst ein Taschi bei Professor Ulme!', 3600); } } } else if (!z) accum = Math.min(accum, 3);
    hintT -= dt; lx = P.x; lz = P.z; zoneWas = z;
  };
  K.busy = () => !!B || panelOpen;
  /* ===== Begleiter: das vorderste Taschi läuft hinter dir her (überall, außer im Fahrzeug, drinnen und im Kampf) ===== */
  let fol = null, folId = null;
  function followUpdate(dt, t, hide) {
    const s = S(), lead = s.team.find(m => m.hp > 0) || s.team[0]; if (hide || !lead || P.veh || B || (G.indoors && G.indoors())) { if (fol) fol.visible = false; return; }
    if (!fol || folId !== lead.id) { if (fol) scene.remove(fol); fol = BI.taschiMesh(lead.id, { s: .62 }); folId = lead.id; fol.userData.p = { x: P.x - Math.sin(P.h) * 1.7, z: P.z - Math.cos(P.h) * 1.7, h: P.h }; scene.add(fol); }
    const p = fol.userData.p, tx = P.x - Math.sin(P.h) * 1.8 + Math.cos(P.h) * .7, tz = P.z - Math.cos(P.h) * 1.8 - Math.sin(P.h) * .7, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d > 14) { p.x = tx; p.z = tz; } else if (d > .5) { const k = Math.min(d - .4, (P.speed || 0) * 1.1 * dt + d * dt * 2.5) / d; p.x += dx * k; p.z += dz * k; p.h = Math.atan2(dx, dz); }
    fol.visible = true; fol.position.set(p.x, Math.max(0, W.groundY(p.x, p.z)) + (d > .6 ? Math.abs(Math.sin(t * 9)) * .14 : 0), p.z); fol.rotation.y = p.h;
  }
  /* ===== Meilensteine im Taschidex ===== */
  const worldsCaught = () => { const s = S(), out = {}; for (const id of Object.keys(SP)) if (s.dex[id] === 2 && SP[id].world) out[SP[id].world] = (out[SP[id].world] || 0) + 1; return out; };
  function milestones() {
    const s = S(), n = Object.keys(SP).filter(i => s.dex[i] === 2).length, tot = Object.keys(SP).length, give = (k, st, sticker, txt) => { if (s.done[k]) return; s.done[k] = 1; G.addStars(st); G.fanfare && G.fanfare(); sticker && G.earn && G.earn(sticker); say(txt + ' +' + st + ' ⭐', 5200); persist(); };
    if (n >= 25) give('d25', 5, 'taschi_dex25', '📘 25 Taschis im Taschidex!'); if (n >= 50) give('d50', 10, 'taschi_dex50', '📘 50 Taschis im Taschidex!'); if (n >= tot) give('dall', 25, null, '📘 ALLE ' + tot + ' Taschis gefangen – Meister-Forscher!');
    const wc = worldsCaught(), full = Object.keys(BI.TWORLDS).filter(k => (wc[k] || 0) >= 2).length; if (full >= Object.keys(BI.TWORLDS).length) give('wforsch', 15, 'taschi_weltforscher', '🌍 In jeder Welt 2 Taschis gefangen – Weltforscher!');
  }
  K.milestones = milestones;
  /* ===== Taschi-Menü (überall erreichbar) ===== */
  function hubPanel() {
    const s = S(), tot = Object.keys(SP).length, n = Object.keys(SP).filter(i => s.dex[i] === 2).length;
    openPanel('🔴 Taschis', bd => {
      bd.appendChild($('div', 'tip', s.team.length ? 'Dein Team: ' + s.team.map(m => SP[m.id].n + ' Lv ' + m.lv).join(' · ') : 'Du hast noch kein Taschi – Professor Ulme wartet in Taschi-Land (Insel im Osten, 🧭 Wohin?).'));
      bd.appendChild(row(null, '🎒 Team & Beutel', s.team.length + ' im Team · ' + s.box.length + ' im Lager', [['Ansehen', teamPanel]])); bd.appendChild(row(null, '📘 Taschidex', n + ' von ' + tot + ' gefangen', [['Ansehen', () => dexPanel()]]));
      bd.appendChild(row(null, '🏅 Orden', nOrden() + ' von 8', [['Ansehen', ordenPanel]])); bd.appendChild(row(null, '🌍 Weltforscher', 'Fang überall Taschis: in jeder Welt leben eigene Arten!', [['Ansehen', worldPanel]]));
      if (G.beamHeil) bd.appendChild(row(null, '💖 Zum Heilhaus', 'Fliegt dich zu Schwester Hanna nach Taschi-Land', [['Los!', () => { closePanel(); G.beamHeil(); }]]));
    });
  }
  function worldPanel() {
    const wc = worldsCaught(); openPanel('🌍 Weltforscher', bd => { bd.appendChild($('div', 'tip', 'Fang in jeder Welt mindestens 2 Taschis. Wilde Taschis sitzen im <b>Fanggras</b> (dunkle Flecken mit hohen Halmen).')); for (const k of Object.keys(BI.TWORLDS)) { const have = Object.keys(SP).filter(i => SP[i].world === k && S().dex[i] === 2).length, all = Object.keys(SP).filter(i => SP[i].world === k).length; bd.appendChild(row(null, (wc[k] >= 2 ? '✅ ' : '⬜ ') + BI.TWORLDS[k][0], have + ' von ' + all + ' gefangen · Stufe ab ' + BI.TWORLDS[k][1], [['📘', () => dexPanel(k)]])); } });
  }
  K.openHub = hubPanel; K.worldPanel = worldPanel;
  K.log = () => { const s = S(), caught = Object.keys(SP).filter(i => s.dex[i] === 2).length; return { title: '🔴 Taschi-Land', count: nOrden() + ' von 8 Orden', rows: [
    { ok: !!s.team.length, icon: '🔬', text: 'Bei Professor Ulme dein erstes Taschi wählen', dest: 'taschi' },
    { ok: !!s.orden.fang, icon: '🔴', text: 'Im hohen Gras ein wildes Taschi fangen (Fang-Orden)', dest: 'taschi' },
    { ok: !!s.orden.fels, icon: '🪨', text: 'Fels-Fiete in der Arena besiegen', dest: 'taschi' }, { ok: !!s.orden.perle, icon: '💧', text: 'Perla in der Arena besiegen', dest: 'taschi' },
    { ok: !!s.orden.funke, icon: '⚡', text: "Käpt'n Volt in der Arena besiegen", dest: 'taschi' }, { ok: !!s.orden.bluete, icon: '🌿', text: 'Blüte in der Arena besiegen', dest: 'taschi' },
    { ok: !!s.orden.forscher, icon: '📘', text: 'Taschidex: 8 verschiedene Taschis fangen (' + Math.min(8, caught) + ' von 8)', dest: 'taschi' },
    { ok: !!s.orden.team, icon: '🎈', text: 'Team Funke (Jette, Jim, Mauzi) besiegen', dest: 'taschi' }, { ok: !!s.orden.meister, icon: '👑', text: 'Meisterin Aurelia besiegen (alle 7 Orden nötig)', dest: 'taschi' },
    { ok: !!s.done.d25, icon: '📘', text: 'Taschidex: 25 Taschis fangen (' + Math.min(25, caught) + ' von 25) – wilde Taschis gibt es in jeder Welt im Fanggras', dest: 'taschi' }, { ok: !!s.done.d50, icon: '📚', text: 'Taschidex: 50 Taschis fangen (' + Math.min(50, caught) + ' von 50)', dest: 'taschi' },
    { ok: !!s.done.wforsch, icon: '🌍', text: 'Weltforscher: in jeder der ' + Object.keys(BI.TWORLDS).length + ' Welten 2 Taschis fangen (' + Object.keys(BI.TWORLDS).filter(k => (worldsCaught()[k] || 0) >= 2).length + ' von ' + Object.keys(BI.TWORLDS).length + ')', dest: 'taschi' }] }; };
  K.dbg = { mk, hpMax, movesAt, award, heal, profPanel, teamPanel, dexPanel, shopPanel, starterPanel, ordenPanel, friends, npcs, S, nOrden, B: () => B, closePanel };
  K.cheatAll = function () { const s = S(); if (!s.team.length) s.team.push(mk('blitzi', 12)); for (const o of ORD) if (!s.orden[o.key]) s.orden[o.key] = 1; flag('ta_o4'); flag('ta_o8'); flag('ta_fang'); G.earn && (G.earn('taschi_meister'), G.earn('taschi_fang')); for (const k of Object.keys(SP)) s.dex[k] = 2; for (const k of Object.keys(IT)) s.items[k] = Math.max(s.items[k] || 0, 9); persist(); };
  return K;
};
