/* Baumodus: Objekte kaufen/platzieren/verschieben/verkaufen, Wände, Türen, Fenster, Böden, Raumfunktionen,
   Rückgängig/Wiederholen, Raum-Übersicht mit fehlenden Anforderungen. Regeln prüft PT.Build/PT.Sim. */
(function (root) {
  'use strict';
  const PT = root.PT, UI = PT.UI, S = PT.Sim, B = PT.Build, D = PT.DATA, esc = PT.esc;
  const BM = UI.Build = {};
  const G = () => PT.G;
  let on = false, bar = null, drawer = null, info = null, lotId = 'studio';
  let tool = 'obj', sel = null, rot = 0, floorType = 1, cat = 'mikro', moving = null, drag = null, lastPick = null;
  const TOOLS = [['obj', '🪑', 'Objekte'], ['wall', '🧱', 'Wand'], ['door', '🚪', 'Tür'], ['window', '🪟', 'Fenster'], ['floor', '⬜', 'Boden'], ['room', '🏷️', 'Raum'], ['move', '✋', 'Verschieben'], ['remove', '🗑️', 'Abriss']];

  BM.active = () => on;
  BM.open = function (lot) {
    const g = G(), st = g.st, lk = S.buildLocked(st); if (lk) { UI.toast(lk, 'bad'); return; }
    lotId = lot || (st.lots.campus.owned && g.world && g.world.playerPos && g.world.playerPos().district === 'campus' ? 'campus' : 'studio');
    if (!st.lots[lotId].owned) { UI.toast('Dieses Grundstück gehört euch noch nicht.', 'bad'); return; }
    on = true; g.mode = 'build'; g.hist = g.hist || { undo: [], redo: [] };
    g.world && g.world.setCamMode('build', { lot: lotId });
    bar = UI.el('<div class="pt-buildbar"><div class="pt-bb-tools">' + TOOLS.map(t => '<button data-act="tool" data-t="' + t[0] + '" title="' + t[2] + '"><span>' + t[1] + '</span><small>' + t[2] + '</small></button>').join('') +
      '</div><div class="pt-bb-side"><button data-act="undo" title="Rückgängig (Strg+Z)">↶</button><button data-act="redo" title="Wiederholen (Strg+Y)">↷</button><button data-act="rot" title="Drehen (R)">⟳</button><button data-act="rooms" title="Räume">🏠</button>' +
      (st.lots.campus.owned ? '<button data-act="lot" title="Grundstück wechseln">' + (lotId === 'studio' ? '🏫' : '🏠') + '</button>' : '') + '<button data-act="exit" class="pri" title="Fertig (Esc)">✓ Fertig</button></div></div>');
    drawer = UI.el('<div class="pt-drawer"></div>');
    const cam = UI.el('<div class="pt-bb-cam"><button data-act="zin" aria-label="Näher">＋</button><button data-act="zout" aria-label="Weiter weg">－</button><button data-act="vl" aria-label="Ansicht links drehen">⤺</button><button data-act="vr" aria-label="Ansicht rechts drehen">⤻</button></div>');
    info = UI.el('<div class="pt-bb-info"></div>');
    [bar, drawer, cam, info].forEach(e => { UI.layer().appendChild(e); UI.bind(e, ACT); });
    BM._cam = cam;
    setTool('obj'); bindPointer(true); addEventListener('keydown', onKey); document.body.classList.add('pt-building');
    UI.toast('Baumodus: ' + (lotId === 'studio' ? 'Euer Studio' : 'Campus') + '. Ziehen = Kamera schieben, zwei Finger oder Mausrad = zoomen, Tippen = platzieren. PC: Pfeiltasten/WASD schieben, Q/E drehen.', 'info', 6000);
    g.hud && g.hud();
  };
  BM.close = function () {
    if (!on) return; on = false; const g = G();
    bindPointer(false); removeEventListener('keydown', onKey); document.body.classList.remove('pt-building');
    [bar, drawer, info, BM._cam].forEach(e => e && e.remove()); bar = drawer = info = null;
    if (g.world) { g.world.ghost(null); g.world.ghostEdge(null); g.world.highlightCells(null); g.world.setCamMode('follow'); }
    g.mode = 'walk'; moving = null; g.hud && g.hud(); g.autosave && g.autosave();
  };
  function setTool(t) {
    tool = t; moving = null; const w = G().world;
    if (w) { w.ghost(null); w.ghostEdge(null); w.highlightCells(null); }
    bar.querySelectorAll('[data-act="tool"]').forEach(b => b.classList.toggle('sel', b.dataset.t === t));
    renderDrawer(); renderInfo();
  }
  function cost(n) { return n ? PT.money(n) : 'gratis'; }
  function renderDrawer() {
    const st = G().st;
    if (tool === 'obj') {
      const list = D.objects.filter(o => o.cat === cat);
      drawer.innerHTML = '<div class="pt-tabs">' + Object.keys(D.objectCats).map(k => '<button data-act="cat" data-c="' + k + '" class="' + (k === cat ? 'sel' : '') + '">' + D.objectCats[k].icon + ' ' + esc(D.objectCats[k].name) + '</button>').join('') + '</div><div class="pt-items">' +
        list.map(o => { const locked = st.mode === 'career' && o.unlock > (st.chapter || 1); return '<button data-act="item" data-id="' + o.id + '" class="pt-item ' + (sel === o.id ? 'sel' : '') + (locked ? ' locked' : '') + '"' + (locked ? ' title="Ab Kapitel ' + o.unlock + '"' : '') + '><b>' + esc(o.name) + '</b><small>' + (locked ? '🔒 Kapitel ' + o.unlock : cost(o.cost) + (o.upkeep ? ' · ' + o.upkeep + '/Tag' : '')) + '</small><small class="st">' + esc(B.statText(o)) + '</small><small class="ly">' + ({ floor: 'Boden', top: 'auf Tisch/Ablage', wall: 'an die Wand', ceil: 'an die Decke' })[o.layer] + ' · ' + o.w + '×' + o.d + '</small></button>'; }).join('') + '</div>';
    } else if (tool === 'floor') {
      drawer.innerHTML = '<div class="pt-items">' + D.buildParts.floors.map((f, i) => '<button data-act="floort" data-i="' + (i + 1) + '" class="pt-item ' + (floorType === i + 1 ? 'sel' : '') + '"><i class="sw" style="background:' + f.color + '"></i><b>' + esc(f.name) + '</b><small>' + cost(f.cost) + ' je m² · Akustik ' + f.absorb + ' · Wohlfühlen ' + f.comfort + '</small></button>').join('') + '<button data-act="floort" data-i="0" class="pt-item ' + (floorType === 0 ? 'sel' : '') + '"><b>Boden entfernen</b><small>50 % zurück</small></button></div>';
    } else if (tool === 'wall' || tool === 'door' || tool === 'window') {
      const p = D.buildParts[tool]; drawer.innerHTML = '<p class="pt-hint">' + esc(p.name) + ': ' + cost(p.cost) + ' je Kante. Auf eine Kante tippen; ziehen setzt mehrere. ' + (tool === 'wall' ? 'Räume brauchen Wände rundum und eine Tür.' : tool === 'door' ? 'Vor und hinter Türen muss frei bleiben.' : 'Fenster lassen Licht rein, aber niemanden durch.') + '</p>';
    } else if (tool === 'room') {
      drawer.innerHTML = '<p class="pt-hint">In einen Raum tippen und eine Funktion wählen. Ein Raum ist eine von Wänden umschlossene Bodenfläche.</p>';
    } else if (tool === 'move') drawer.innerHTML = '<p class="pt-hint">' + (moving ? 'Neuen Platz antippen (R dreht). Esc bricht ab.' : 'Ein Objekt antippen, dann den neuen Platz.') + '</p>';
    else if (tool === 'remove') drawer.innerHTML = '<p class="pt-hint">Objekt oder Wand antippen: wird verkauft (' + Math.round(D.rules.sellRefund * 100) + ' % zurück) bzw. abgerissen (50 %).</p>';
  }
  function renderInfo() {
    const st = G().st, lot = st.lots[lotId], rooms = B.evaluate(lot).filter(r => r.enclosed || r.fn);
    info.innerHTML = '<b>' + (lotId === 'studio' ? '🏠 Studio' : '🏫 Campus') + '</b> · ' + UI.money(st.money) + (sel && tool === 'obj' ? ' · ' + esc(D.objectById[sel].name) + ' (' + cost(D.objectById[sel].cost) + ')' : '') +
      '<div class="pt-rooms">' + rooms.map(r => { const F = r.fn && D.roomFns[r.fn]; return '<button data-act="hl" data-r="' + r.id + '" class="' + (r.fn ? (r.valid ? 'ok' : 'bad') : '') + '">' + (F ? F.icon + ' ' + esc(F.name) : 'Raum ohne Funktion') + ' · ' + r.area + ' m²' + (F ? (r.valid ? ' ✓ Wert ' + r.value : ' ✗ ' + esc(r.miss.slice(0, 2).map(B.missText).join(', '))) : '') + '</button>'; }).join('') + '</div>';
  }

  // ── Zeiger ───────────────────────────────────────────────
  let pointers = {}, panFrom = null, pinch = null, moved = 0;
  function bindPointer(onOff) {
    const cv = G().world && G().world.renderer && G().world.renderer.domElement; if (!cv) return;
    const m = onOff ? 'addEventListener' : 'removeEventListener';
    cv[m]('pointerdown', pDown); cv[m]('pointermove', pMove); cv[m]('pointerup', pUp); cv[m]('pointercancel', pUp); cv[m]('wheel', pWheel, { passive: false }); cv[m]('contextmenu', noCtx);
  }
  const noCtx = e => e.preventDefault();
  function pWheel(e) { e.preventDefault(); G().world.buildZoom(e.deltaY > 0 ? 0.9 : 1.1); }
  function pDown(e) {
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = 0;
    const ids = Object.keys(pointers);
    if (ids.length === 2) { const [a, b] = ids.map(k => pointers[k]); pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; return; }
    if (e.button === 1 || e.button === 2 || (e.pointerType !== 'mouse' && !needsDrag())) { panFrom = { x: e.clientX, y: e.clientY }; }
    else if (needsDrag()) { drag = { keys: {} }; apply(e); }
    else panFrom = { x: e.clientX, y: e.clientY, click: true };
  }
  function needsDrag() { return tool === 'wall' || tool === 'door' || tool === 'window' || tool === 'floor'; }
  function pMove(e) {
    const p = pointers[e.pointerId];
    if (p) { moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y); }
    if (pinch && p) {
      // Zwei Finger: Abstand = Zoom, Mittelpunkt verschieben = Kamera schieben (geht auch mit Wand-/Bodenwerkzeug)
      const [a0, b0] = Object.keys(pointers).map(k => pointers[k]), m0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
      p.x = e.clientX; p.y = e.clientY; const [a, b] = Object.keys(pointers).map(k => pointers[k]); const d = Math.hypot(a.x - b.x, a.y - b.y), m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const w = G().world, g0 = w.groundAt(m0.x, m0.y), g1 = w.groundAt(m1.x, m1.y); if (g0 && g1) w.buildPanWorld(g0.x - g1.x, g0.z - g1.z);
      w.buildZoom(Math.max(20, d) / Math.max(20, pinch)); pinch = d; return;
    }
    if (panFrom && p && moved > 8) { const w = G().world, a = w.groundAt(p.x, p.y), c = w.groundAt(e.clientX, e.clientY); if (a && c) w.buildPanWorld(a.x - c.x, a.z - c.z); }
    if (p) { p.x = e.clientX; p.y = e.clientY; }
    preview(e); if (drag) apply(e);
  }
  function pUp(e) {
    const wasPan = panFrom && moved > 8; delete pointers[e.pointerId];
    if (Object.keys(pointers).length < 2) pinch = null;
    if (drag) { drag = null; return; }
    if (panFrom && !wasPan) { preview(e); apply(e); }
    panFrom = null;
  }
  function pick(e) { const p = G().world.pick(e.clientX, e.clientY); return p && p.lot === lotId ? p : null; }
  function objAt(lot, x, z) {
    // oben liegende Geräte zuerst
    const order = ['top', 'ceil', 'floor', 'wall'];
    return lot.objs.filter(o => B.cells(o).some(c => c[0] === x && c[1] === z) || (D.objectById[o.id].layer === 'wall' && o.x === x && o.z === z)).sort((a, b) => order.indexOf(D.objectById[a.id].layer) - order.indexOf(D.objectById[b.id].layer))[0] || null;
  }
  function preview(e, pk) {
    const w = G().world, st = G().st, lot = st.lots[lotId], p = pk || pick(e); lastPick = p;
    if (!p) { w.ghost(null); w.ghostEdge(null); return; }
    if (tool === 'obj' && sel) { const o = { id: sel, x: p.x, z: p.z, r: rot }; const c = B.canPlace(lot, o); w.ghost(sel, { x: p.x, z: p.z, r: rot, ok: c.ok && S.canAfford(st, D.objectById[sel].cost) }); }
    else if (tool === 'move' && moving) { const o = lot.objs.find(x => x.u === moving); if (o) { const c = B.canPlace(lot, { id: o.id, x: p.x, z: p.z, r: rot }, o.u); w.ghost(o.id, { x: p.x, z: p.z, r: rot, ok: c.ok }); } }
    else if (tool === 'wall' || tool === 'door' || tool === 'window') { const c = B.canWall(lot, p.edge, tool); w.ghostEdge(p.edge, tool, c.ok); }
    else if (tool === 'remove') { const o = objAt(lot, p.x, p.z); if (o) { w.ghost(o.id, { x: o.x, z: o.z, r: o.r, ok: false }); w.ghostEdge(null); } else { w.ghost(null); w.ghostEdge(lot.walls[p.edge] ? p.edge : null, 'none', false); } }
    else if (tool === 'floor') w.highlightCells([[p.x, p.z]], floorType ? D.buildParts.floors[floorType - 1].color : '#ff4d6d');
  }
  function done(r, okSound) {
    const g = G();
    if (!r.ok) { UI.toast(r.err, 'bad'); PT.Audio && PT.Audio.fx('bad'); return false; }
    PT.Audio && PT.Audio.fx(okSound || 'build'); g.world && g.world.refreshLot(lotId); renderInfo(); g.hud && g.hud(); g.afterAction(); return true;
  }
  function apply(e) {
    const g = G(), st = g.st, lot = st.lots[lotId], p = pick(e); if (!p) return;
    if (tool === 'obj') { if (!sel) { UI.toast('Zuerst ein Objekt in der Liste wählen.', 'info'); return; } done(S.build(st, lotId, { t: 'place', o: { id: sel, x: p.x, z: p.z, r: rot } }, g.hist)); preview(e); }
    else if (tool === 'wall' || tool === 'door' || tool === 'window') {
      if (drag && drag.keys[p.edge]) return; if (drag) { if (drag.ori && drag.ori !== p.edge[0]) return; drag.ori = p.edge[0]; drag.keys[p.edge] = 1; }
      if (lot.walls[p.edge] === tool) { if (!drag || Object.keys(drag.keys).length === 1) { if (!drag) done(S.build(st, lotId, { t: 'wall', k: p.edge, to: 'none' }, g.hist), 'pop'); } return; }
      done(S.build(st, lotId, { t: 'wall', k: p.edge, to: tool }, g.hist));
    } else if (tool === 'floor') {
      const k = p.x + ',' + p.z; if (drag && drag.keys[k]) return; if (drag) drag.keys[k] = 1;
      if ((lot.floor[B.idx(lot, p.x, p.z)] || 0) === floorType) return;
      done(S.build(st, lotId, { t: 'floor', x: p.x, z: p.z, to: floorType }, g.hist));
    } else if (tool === 'room') {
      const regs = B.regions(lot), ri = B.inLot(lot, p.x, p.z) ? regs.reg[B.idx(lot, p.x, p.z)] : -1;
      if (ri < 0) { UI.toast('Hier ist kein Raum – erst Boden legen und Wände ziehen.', 'info'); return; }
      g.world.highlightCells(regs.list[ri].cells, '#ff8a1e');
      const fns = Object.keys(D.roomFns);
      UI.choose('Raumfunktion', regs.list[ri].area + ' m²' + (regs.list[ri].enclosed ? '' : ' – noch nicht rundum von Wänden umschlossen'), fns.map(k => { const F = D.roomFns[k]; return { label: F.icon + ' ' + F.name, desc: 'Ab ' + F.minArea + ' m² · braucht ' + Object.keys(F.req).map(r => F.req[r] + '× ' + B.reqName(r)).join(', ') + (F.reqAny ? ', ' + F.reqAny.map(B.reqName).join(' oder ') : '') + ' – ' + F.desc }; }).concat([{ label: '✕ Funktion entfernen' }])).then(i => {
        g.world.highlightCells(null); if (i < 0) return;
        const fn = fns[i] || null;
        if (done(S.build(st, lotId, { t: 'roomfn', x: p.x, z: p.z, fn }, g.hist), 'good') && fn) {
          const r = B.evaluate(lot).find(x => x.cells.some(c => c[0] === p.x && c[1] === p.z));
          if (r && !r.valid) UI.toast(D.roomFns[fn].name + ': noch nicht gültig – ' + r.miss.map(B.missText).join(', '), 'info', 6000); else UI.toast(D.roomFns[fn].name + ' ist bereit!', 'good');
        }
      });
    } else if (tool === 'move') {
      if (!moving) { const o = objAt(lot, p.x, p.z); if (o) { moving = o.u; rot = o.r; renderDrawer(); } return; }
      const o = lot.objs.find(x => x.u === moving); if (!o) { moving = null; return; }
      if (done(S.build(st, lotId, { t: 'move', u: moving, to: { x: p.x, z: p.z, r: rot } }, g.hist))) { moving = null; g.world.ghost(null); renderDrawer(); }
    } else if (tool === 'remove') {
      const o = objAt(lot, p.x, p.z);
      if (o) done(S.build(st, lotId, { t: 'remove', u: o.u }, g.hist), 'cash');
      else if (lot.walls[p.edge]) done(S.build(st, lotId, { t: 'wall', k: p.edge, to: 'none' }, g.hist), 'pop');
      g.world.ghost(null); g.world.ghostEdge(null);
    }
  }
  function onKey(e) {
    if (!on || UI.top() || document.querySelector('.pt-dlg')) return;
    const w = G().world, k = e.code, ctrl = e.ctrlKey || e.metaKey;
    if (k === 'Escape') { e.preventDefault(); if (moving) { moving = null; w.ghost(null); renderDrawer(); } else BM.close(); }
    else if (k === 'KeyR') { rot = (rot + 1) & 3; if (lastPick) preview(null, lastPick); }
    else if ((ctrl && k === 'KeyZ') || (!ctrl && k === 'KeyZ')) { e.preventDefault(); ACT.undo(); }
    else if ((ctrl && k === 'KeyY') || (!ctrl && k === 'KeyY')) { e.preventDefault(); ACT.redo(); }
    else if (k === 'ArrowLeft' || k === 'KeyA') w.buildPan(-2, 0); else if (k === 'ArrowRight' || k === 'KeyD') w.buildPan(2, 0);
    else if (k === 'ArrowUp' || k === 'KeyW') w.buildPan(0, -2); else if (k === 'ArrowDown' || k === 'KeyS') w.buildPan(0, 2);
    else if (k === 'Equal' || k === 'NumpadAdd') w.buildZoom(1.1); else if (k === 'Minus' || k === 'NumpadSubtract') w.buildZoom(0.9);
    else if (k === 'KeyQ') w.buildRotate(-1); else if (k === 'KeyE') w.buildRotate(1);
    else if (/^Digit[1-8]$/.test(k)) setTool(TOOLS[+k.slice(5) - 1][0]);
  }
  const ACT = {
    tool: b => setTool(b.dataset.t),
    cat: b => { cat = b.dataset.c; renderDrawer(); },
    item: b => { const o = D.objectById[b.dataset.id], st = G().st; if (st.mode === 'career' && o.unlock > (st.chapter || 1)) { UI.toast(o.name + ' gibt es ab Kapitel ' + o.unlock + '.', 'info'); return; } sel = o.id; rot = 0; renderDrawer(); renderInfo(); UI.toast(o.name + ' gewählt – auf einen freien Platz tippen. R dreht.', 'info', 2500); },
    floort: b => { floorType = +b.dataset.i; renderDrawer(); },
    undo: () => { const g = G(); const r = S.undo(g.st, g.hist); if (!r.ok) UI.toast(r.err, 'info'); else { refreshAll(); PT.Audio && PT.Audio.fx('pop'); } },
    redo: () => { const g = G(); const r = S.undo(g.st, g.hist, true); if (!r.ok) UI.toast(r.err, 'info'); else { refreshAll(); PT.Audio && PT.Audio.fx('pop'); } },
    rot: () => { rot = (rot + 1) & 3; if (lastPick) preview(null, lastPick); UI.toast('Drehung ' + rot * 90 + '°', 'info', 1200); },
    rooms: () => { info.classList.toggle('big'); renderInfo(); },
    hl: b => { const lot = G().st.lots[lotId], r = B.evaluate(lot).find(x => x.id === +b.dataset.r); if (r) G().world.highlightCells(r.cells, r.valid ? '#4be08a' : '#ff4d6d'); },
    lot: () => { const nl = lotId === 'studio' ? 'campus' : 'studio'; BM.close(); BM.open(nl); },
    exit: () => BM.close(),
    zin: () => G().world.buildZoom(1.18), zout: () => G().world.buildZoom(0.85), vl: () => G().world.buildRotate(-1), vr: () => G().world.buildRotate(1)
  };
  function refreshAll() { const g = G(); ['studio', 'campus'].forEach(k => g.world && g.st.lots[k].owned && g.world.refreshLot(k)); renderInfo(); g.hud && g.hud(); g.afterAction(); }
})(typeof window !== 'undefined' ? window : globalThis);
