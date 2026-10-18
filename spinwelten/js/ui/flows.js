/* Spinwelten 3D – Abläufe mit 3D-Szene: Sturmangriff, Schatzexpedition, Truhe öffnen, Insel abschließen, Finale.
 * Grundsatz: Erst wird gebucht (Spiellogik), dann wird gezeigt. Neuladen mittendrin verliert nichts und bucht nichts doppelt. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en), tx = o => SW.tx(o), F = n => SW.fmt(n);
  const UI = () => SW.UI, A = () => SW.App, G = () => SW.App.g;
  const h = (...a) => SW.UI.h(...a), btn = (...a) => SW.UI.btn(...a);
  const T = () => globalThis.THREE;
  const Fl = { busy: false }, FOX = 1.3;
  // Hinweis oben; die Ziele selbst sind Marker direkt auf der Insel (folgen der Kamera)
  function pickBar(info, marks) {
    Fl.closePick();
    const el = h('div', { id: 'pick', cls: 'top' }, [h('div', { cls: 'info' }, info)]);
    document.getElementById('ui').appendChild(el); Fl.pickEl = el;
    const box = h('div', { id: 'tmarks' });
    Fl.mk = marks.map(o => {
      const b = h('button', { type: 'button', cls: 'tm ' + (o.cls || ''), 'aria-label': o.title, disabled: o.off || null }, [h('span', { cls: 'ch' }, o.icon || ''), o.label ? h('small', null, o.label) : null]);
      b.addEventListener('click', e => { e.stopPropagation(); if (b.disabled) return; SW.Audio.sfx('click'); o.fn(); });
      box.appendChild(b); return { el: b, p: o.p };
    });
    document.getElementById('ui').appendChild(box); Fl.mkBox = box; Fl.place(); UI().refocus(); return el;
  }
  Fl.place = function () {
    if (Fl.foxM) SW.Characters.animateModel(Fl.foxM, performance.now() / 1000, 0.016);
    if (!Fl.mk) return; const a = A(), cam = a.island.camera, w = a.r.w, hh = a.r.h;
    for (const m of Fl.mk) {
      const v = m.p.clone().project(cam), vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      m.el.style.visibility = vis ? '' : 'hidden';
      m.el.style.transform = 'translate(' + Math.round((v.x + 1) / 2 * w) + 'px,' + Math.round((1 - v.y) / 2 * hh) + 'px) translate(-50%,-50%)';
    }
  };
  Fl.closePick = () => { if (Fl.pickEl) { Fl.pickEl.remove(); Fl.pickEl = null; } if (Fl.mkBox) { Fl.mkBox.remove(); Fl.mkBox = null; } Fl.mk = null; };
  function targetList(title, list, onPick, kind) {
    const g = G(), box = h('div', { cls: 'list', style: 'text-align:left' });
    list.forEach(v => {
      const st = g.s.bots[v.id], shield = st && st.shields > 0 && kind === 'attack';
      const sub = L('Insel ', 'Island ') + v.island + ' · ' + (kind === 'raid' ? '🪙 ' + F(v.coins) : L('Bauwerke ', 'Buildings ') + v.stages.filter(x => x > 0).length + '/5') + (shield ? ' · 🛡️' : '');
      const it = h('div', { cls: 'item' }, [h('img', { cls: 'av', src: SW.Symbols.avatar(v.look, 64), alt: '' }), h('div', { cls: 'tx' }, [h('b', null, v.name + ' 🤖' + (v.revenge ? ' · ' + L('Rache!', 'Revenge!') : '')), h('small', null, sub)]),
        btn(L('Wählen', 'Choose'), () => { d.close(); onPick(v.id); }, v.revenge ? 'coral small' : 'gold small')]);
      box.appendChild(it);
    });
    box.appendChild(h('p', { cls: 'note' }, L('Alle Ziele sind Computer-Spieler (🤖). Echte Spieler gibt es nur mit Spinwelten-Server.', 'All targets are computer players (🤖). Real players require a Spinwelten server.')));
    const d = UI().dialog({ title, node: box, noClose: true, buttons: [{ label: L('Verzichten (kleiner Trost)', 'Skip (small consolation)'), fn: () => { const r = g.skipPending(); A().after(); if (r && r.coins) UI().toast('+🪙 ' + F(r.coins)); A().go('machine'); } }] });
  }
  // ---------- Sturmangriff ----------
  Fl.attack = function () {
    const g = G(); if (!g.s.pending || g.s.pending.kind !== 'attack') return;
    if (g.s.tutorial && !g.s.tutorial.done && g.s.tutorial.step >= 0) { Fl.attackTarget(g.attackTargets().find(t => t.id === 'pip') ? 'pip' : g.attackTargets()[0].id); return; }
    targetList(L('⚡ Sturmangriff – wähle eine Insel', '⚡ Storm attack – choose an island'), g.attackTargets(), Fl.attackTarget, 'attack');
  };
  Fl.attackTarget = function (id) {
    const g = G(), a = A(), v = g.botView(id), st = g.s.bots[id];
    a.showTarget(v); Fl.target = id;
    const w = SW.WORLDS[v.island - 1], isl = a.island, up = new (T().Vector3)(0, 2.4 * SW.Island.BS, 0);
    const marks = [];
    w.buildings.forEach((b, i) => { if (v.stages[i]) marks.push({ p: isl.slotPos(i).add(up), cls: 'aim', title: tx(b.name), label: tx(b.name) + ' ' + '★'.repeat(v.stages[i]), fn: () => Fl.fire(i) }); });
    if (!marks.length) marks.push({ p: new (T().Vector3)(0, 2, 0), cls: 'aim', title: L('Sturm loslassen', 'Release storm'), label: L('Sturm loslassen', 'Release storm'), fn: () => Fl.fire(0) });
    pickBar('⚡ ' + L('Tippe auf ein Ziel!', 'Tap a target!') + (st.shields > 0 ? L(' · 🛡️ Schutzorb aktiv', ' · 🛡️ Shield orb active') : ''), marks);
    Fl.mode = 'attack';
  };
  // Bildschirmpunkt (px) eines Inselpunkts
  function scr(p) { const a = A(), v = p.clone().project(a.island.camera); return { x: (v.x + 1) / 2 * a.r.w, y: (1 - v.y) / 2 * a.r.h }; }
  function flash(col) {
    if (A().set.reducedMotion) return;
    const f = h('div', { cls: 'flash', style: col ? 'background:' + col : '' }); document.getElementById('ui').appendChild(f);
    f.animate([{ opacity: 0.7 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' }).onfinish = () => f.remove();
  }
  // Ablauf: Wolke zieht auf → Blitz → Treffer (Wackeln, Trümmer, Rauch) oder Schutzkuppel → Beute fliegt zur Münzanzeige
  Fl.fire = function (b) {
    if (Fl.busy) return; const g = G(), a = A(), id = Fl.target, c0 = g.s.coins;
    const res = g.attack(id, b);
    if (res.error) { a.after(); UI().toast(L('Geht nicht: ', 'Not possible: ') + res.error); return; }
    a.cTween = true; a.after();
    Fl.busy = true; Fl.closePick();
    const THREE = T(), isl = a.island, fx = isl.fx, V = (x, y, z) => new THREE.Vector3(x, y, z);
    const p = res.b >= 0 ? isl.slotPos(res.b) : V(0, 0, 0), blocked = res.res === 'blocked', hit = res.res === 'damaged' || res.res === 'downgraded';
    const quick = a.set.reducedMotion || a.set.skip, sp = a.set.speed || 1, ms = x => quick ? 0 : x / sp;
    const BS = SW.Island.BS, top = p.clone().add(V(0, 2.2 * BS, 0)), sky = p.clone().add(V(0, 7 + 2 * BS, 0));
    SW.Audio.sfx('attack'); if (a.set.haptics && navigator.vibrate) try { navigator.vibrate(30); } catch (e) { /* egal */ }
    if (res.b >= 0) isl.focus(res.b);
    if (!quick && fx) fx.cloud(sky, 2.4 / sp, '#4a4f6e');
    const impact = () => {
      flash(blocked ? '#bfffe8' : '#fff8d8'); isl.shake = blocked ? 0.25 : 0.55;
      if (a.set.haptics && navigator.vibrate) try { navigator.vibrate(blocked ? 30 : [50, 30, 80]); } catch (e) { /* egal */ }
      if (blocked) {
        SW.Audio.sfx('shield'); const dome = p.clone().add(V(0, 1.5, 0));
        if (fx) { if (!quick) fx.bolt(sky, dome.clone().add(V(0, 3.2, 0))); fx.shield(dome, 3.2, '#7dffcf'); fx.burst(dome.clone().add(V(0, 3.2, 0)), { n: 40, color: '#ffffff', color2: '#7dffcf', speed: 6, up: 3, life: 0.7 }); }
        return;
      }
      SW.Audio.sfx('hit');
      if (fx) {
        if (!quick) { fx.bolt(sky, top); setTimeout(() => fx.bolt(sky.clone().add(V(0.6, 0, -0.4)), top), 120); }
        fx.burst(top, { n: 90, color: '#ffe066', color2: '#c58bff', speed: 7, up: 5, life: 1.1 }); fx.ring(p.clone().add(V(0, 0.15, 0)), '#c58bff', 4);
        if (hit) { fx.debris(top, (a.island.w && a.island.w.pal && a.island.w.pal.accent) || '#c99a6a', quick ? 8 : 18, p.y + 0.1); fx.smoke(p.clone().add(V(0, 1, 0)), quick ? 4 : 9, '#6d6a72', 0.9 * BS); }
      }
      if (res.b >= 0) { isl.hitBuilding(res.b); const bv = g.botView(id); isl.setBuilding(res.b, bv.stages[res.b], bv.damaged[res.b], false); }
    };
    const loot = () => {
      const at = scr(top), c = { x: Math.max(90, Math.min(a.r.w - 90, at.x)), y: Math.max(140, Math.min(a.r.h * 0.6, at.y - 40)) };
      const title = blocked ? '🛡️ ' + L('ABGEWEHRT!', 'BLOCKED!') : res.res === 'miss' ? '🌪️ ' + L('Daneben', 'Missed') : '⚡ ' + L('TREFFER!', 'HIT!');
      a.winShow(title, res.coins, blocked ? '' : 'big', quick ? 900 : 1700 / sp, c);
      if (res.coins) { SW.Audio.sfx('coin'); a.coinFly(blocked ? 8 : 18, c0, g.s.coins, c); } else { a.cTween = false; a.after(); }
    };
    const end = () => {
      Fl.busy = false;
      const t = blocked ? L('Ein Schutzorb hat den Sturm aufgefangen. Es gab trotzdem ein paar Münzen.', 'A shield orb caught the storm. You still got a few coins.') : res.res === 'miss' ? L('Der Sturm wirbelt über die leere Insel.', 'The storm swirls over the empty island.') : res.res === 'downgraded' ? L('Volltreffer – das Bauwerk verliert eine Stufe.', 'Direct hit – the building loses a stage.') : L('Treffer – das Bauwerk ist beschädigt.', 'Hit – the building is damaged.');
      UI().dialog({ title: res.revenge ? L('Rache geglückt!', 'Revenge done!') : L('Sturmangriff', 'Storm attack'), text: t + '\n🪙 +' + F(res.coins), buttons: [{ label: L('Zurück zur Insel', 'Back to island'), cls: 'gold', fn: () => { a.go('machine'); if (a.tut) a.tut.after('attack'); } }], noClose: true });
    };
    setTimeout(impact, ms(800));
    setTimeout(loot, ms(1500) + (quick ? 100 : 0));
    setTimeout(end, ms(3000) + (quick ? 500 : 0));
  };
  // ---------- Schatzexpedition ----------
  Fl.raid = function () {
    const g = G(), p = g.s.pending; if (!p || p.kind !== 'raid') return;
    if (p.target) { Fl.raidTarget(p.target); return; }
    const list = g.raidTargets();
    if (!list.length) { const r = g.skipPending(); A().after(); UI().toast(L('Niemand hat gerade Schätze. Trost: +🪙 ', 'Nobody has treasure right now. Consolation: +🪙 ') + F(r ? r.coins : 0)); return; }
    if (g.s.tutorial && !g.s.tutorial.done) { Fl.raidTarget(list[0].id); return; }
    targetList(L('🧭 Schatzexpedition – wähle eine Insel', '🧭 Treasure expedition – choose an island'), list, Fl.raidTarget, 'raid');
  };
  Fl.raidTarget = function (id) {
    const g = G(), a = A(), r = g.raidStart(id); a.after();
    if (r.error) { UI().toast(r.error); a.go('machine'); return; }
    const v = g.botView(id); a.showTarget(v); Fl.target = id; Fl.mode = 'raid';
    const isl = a.island, THREE = T(), M = SW.Models, rad = (isl.r || 12) * 0.3;
    if (Fl.marks) Fl.marks.forEach(m => isl.root.remove(m));
    Fl.marks = [];
    for (let i = 0; i < 6; i++) {
      const ang = i / 6 * Math.PI * 2 + 0.3, x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
      const g0 = M.grp(); g0.position.set(x, 0.12, z);
      const ring = M.mesh(M.tor(0.8, 0.12, 6, 24), M.mat('#ffd75e', { em: '#ffb020', emi: 0.6 }), 0, 0.15, 0, false); ring.rotation.x = Math.PI / 2; g0.add(ring);
      const cross1 = M.mesh(M.box(1.2, 0.12, 0.22), M.mat('#c0392b', { em: '#ff5a3d', emi: 0.4 }), 0, 0.2, 0, false); cross1.rotation.y = 0.785; g0.add(cross1);
      const cross2 = M.mesh(M.box(1.2, 0.12, 0.22), M.mat('#c0392b', { em: '#ff5a3d', emi: 0.4 }), 0, 0.2, 0, false); cross2.rotation.y = -0.785; g0.add(cross2);
      const hit = new THREE.Mesh(M.cyl(1.2, 1.2, 1.6, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.userData.dig = i; g0.add(hit);
      g0.userData.hit = hit; g0.userData.bob = true;
      isl.root.add(g0); Fl.marks.push(g0);
    }
    Fl.hint = -1; Fl.found = {};
    // Mira, die Füchsin, gräbt für dich
    const fd = SW.Characters && SW.COMPANIONS && (SW.COMPANIONS.find(c => c.shape === 'fox') || SW.COMPANIONS[0]);
    if (fd) { const fr = M.grp(), fm = SW.Characters.model(fd, 1); fm.scale.setScalar(FOX); fr.add(fm); fr.position.set(0, 0, rad * 0.15); fr.rotation.y = 0.6; isl.root.add(fr); Fl.fox = fr; Fl.foxM = fm; }
    Fl.loot = [];
    r.picks.forEach(i => Fl.markDone(i, null));
    Fl.raidBar(r);
  };
  Fl.raidBar = function (r) {
    const g = G(), p = g.s.pending, picks = p ? p.picks : [];
    if (r && r.hint >= 0) Fl.hint = r.hint;
    const up = new (T().Vector3)(0, 0.4, 0);
    const marks = (Fl.marks || []).map((m, i) => ({ p: m.position.clone().add(up), cls: 'dig' + (picks.includes(i) ? ' done' : '') + (Fl.hint === i ? ' hint' : ''), off: picks.includes(i), title: L('Stelle ', 'Spot ') + (i + 1), icon: picks.includes(i) ? (Fl.found && Fl.found[i]) || '·' : '✖', fn: () => Fl.dig(i) }));
    pickBar('⛏️ ' + L(`Grabe! Noch ${3 - picks.length} von 3`, `Dig! ${3 - picks.length} of 3 left`) + (p && p.got ? ' · 🪙 ' + F(p.got) : '') + (Fl.hint >= 0 ? L(' · Mira wittert etwas bei 🦊', ' · Mira smells something at 🦊') : ''), marks);
  };
  Fl.markDone = function (i, kind) {
    const m = Fl.marks && Fl.marks[i]; if (!m) return;
    const c = kind === 'big' ? '#ffd75e' : kind === 'mid' ? '#f2d08a' : kind === 'relic' ? '#7fe8ff' : '#556070';
    m.children.forEach(o => { if (o.material && o.material.visible !== false) o.material = SW.Models.mat(c, { em: c, emi: kind && kind !== 'empty' ? 0.6 : 0 }); });
    m.userData.done = true;
  };
  // Schatz, der aus dem Loch steigt
  function treasure(kind) {
    const M = SW.Models, g = M.grp(), gold = M.mat('#ffd75e', { metal: 0.85, rough: 0.25, em: '#c98a1a', emi: 0.25 });
    if (kind === 'big') {
      g.add(M.mesh(M.rbox(1.1, 0.6, 0.75, 0.08), M.mat('#8a5a35', { rough: 0.8 }), 0, 0, 0, false));
      g.add(M.mesh(M.rbox(1.16, 0.28, 0.8, 0.1), M.mat('#a06a3c', { rough: 0.7 }), 0, 0.62, -0.05, false));
      g.add(M.mesh(M.box(1.2, 0.1, 0.84), gold, 0, 0.42, 0, false)); g.add(M.mesh(M.box(0.18, 0.22, 0.06), gold, 0, 0.35, 0.4, false));
      for (let k = 0; k < 5; k++) g.add(M.mesh(M.cyl(0.14, 0.14, 0.05, 12), gold, -0.3 + k * 0.15, 0.95 + (k % 2) * 0.06, 0.05, false));
    } else if (kind === 'mid') {
      for (let k = 0; k < 7; k++) { const c = M.mesh(M.cyl(0.24, 0.24, 0.07, 16), gold, (k % 3 - 1) * 0.22, Math.floor(k / 3) * 0.08 + 0.04, ((k * 7) % 3 - 1) * 0.12, false); c.rotation.x = (k % 2) * 0.3; g.add(c); }
    } else if (kind === 'relic') {
      const c = M.mesh(M.oct(0.45), M.mat('#7fe8ff', { em: '#3fd8e8', emi: 1.1, rough: 0.15, flat: true }), 0, 0.5, 0, false); c.scale.y = 1.5; g.add(c);
    } else g.add(M.mesh(M.ico(0.38, 0), M.mat('#7a7f88', { rough: 0.95, flat: true }), 0, 0.3, 0, false));
    return g;
  }
  // Mira hüpft zur Stelle, gräbt, der Fund steigt aus dem Boden, Münzen fliegen zur Anzeige
  Fl.dig = function (i) {
    if (Fl.busy) return; const g = G(), a = A(), c0 = g.s.coins, r = g.raidDig(i);
    if (r.error) { a.after(); return; }
    a.cTween = true; a.after();
    Fl.busy = true; Fl.closePick();
    const THREE = T(), isl = a.island, fx = isl.fx, m = Fl.marks[i], hole = m.position.clone(); hole.y = 0;
    const quick = a.set.reducedMotion || a.set.skip, sp = a.set.speed || 1, du = x => quick ? 0.05 : x / sp;
    const fox = Fl.fox, start = fox ? fox.position.clone() : hole.clone(), dir = start.clone().sub(hole); dir.y = 0;
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1); dir.normalize();
    const stand = hole.clone().addScaledVector(dir, 1.6), dist = start.distanceTo(stand), hops = Math.max(1, Math.min(4, Math.round(dist / 2.2)));
    const sym = r.kind === 'empty' ? '·' : r.kind === 'relic' ? '🔷' : r.kind === 'big' ? '💰' : '🪙';
    const reveal = () => {
      Fl.markDone(i, r.kind); Fl.found[i] = sym;
      const tr = treasure(r.kind); tr.scale.setScalar(1.5); tr.position.copy(hole).add(new THREE.Vector3(0, -0.6, 0)); isl.root.add(tr); Fl.loot.push(tr);
      const good = r.kind !== 'empty';
      fx.burst(hole.clone().add(new THREE.Vector3(0, 0.4, 0)), { n: 30, color: '#9a7a50', speed: 4, up: 5, life: 0.8, gravity: 9 });
      fx.anim(du(0.7), k => { const c1 = 1.7, q = k - 1, e = 1 + (c1 + 1) * q * q * q + c1 * q * q; tr.position.y = hole.y - 0.6 + e * (good ? 1.9 : 1.0); tr.rotation.y = k * Math.PI * 2; }, () => {
        const top = tr.position.clone().add(new THREE.Vector3(0, 0.9, 0)), v = top.clone().project(isl.camera), at = { x: Math.max(90, Math.min(a.r.w - 90, (v.x + 1) / 2 * a.r.w)), y: Math.max(150, (1 - v.y) / 2 * a.r.h - 30) };
        if (good) { SW.Audio.sfx(r.kind === 'big' ? 'big' : 'coin'); fx.burst(top, { n: r.kind === 'big' ? 110 : 60, color: r.kind === 'relic' ? '#7fe8ff' : '#ffd75e', color2: '#fff4c2', speed: 6, up: 6, life: 1.2 }); fx.ring(hole.clone().add(new THREE.Vector3(0, 0.15, 0)), '#ffd75e', 3); }
        else SW.Audio.sfx('error');
        if (Fl.foxM) Fl.foxM.rotation.x = 0;
        a.winShow(good ? (r.kind === 'big' ? L('GROSSER SCHATZ!', 'BIG TREASURE!') : r.kind === 'relic' ? '🔷 +' + (r.relics || 1) : '🪙 ' + L('Münzen!', 'Coins!')) : L('Leer …', 'Empty …'), r.coins, r.kind === 'big' ? 'big' : '', quick ? 900 : 1500 / sp, at);
        if (r.coins) a.coinFly(r.kind === 'big' ? 22 : 12, c0, g.s.coins, at); else { a.cTween = false; a.after(); }
        setTimeout(() => {
          Fl.busy = false;
          if (r.done) {
            r.layout.forEach((k, j) => { if (!Fl.marks[j].userData.done) Fl.markDone(j, k === 'empty' ? 'empty' : 'mid'); });
            UI().dialog({ title: L('Expedition beendet', 'Expedition complete'), text: L('Beute: 🪙 ', 'Loot: 🪙 ') + F(r.total) + (r.chest ? L('\nBeide großen Schätze gefunden – eine Holztruhe dazu!', '\nFound both big treasures – plus a wooden chest!') : ''), noClose: true, buttons: [{ label: L('Zurück zur Insel', 'Back to island'), cls: 'gold', fn: () => { Fl.cleanRaid(); a.go('machine'); if (a.tut) a.tut.after('raid'); } }] });
          } else Fl.raidBar(null);
        }, quick ? 400 : 1300 / sp);
      });
    };
    const dig = () => {
      SW.Audio.sfx('dig'); let n = 0;
      fx.anim(du(0.8), k => {
        if (Fl.foxM) Fl.foxM.rotation.x = 0.45 + Math.sin(k * 40) * 0.15;
        if (k * 5 > n) { n++; fx.burst(hole.clone().add(new THREE.Vector3(0, 0.3, 0)), { n: 12, color: '#9a7a50', color2: '#6b5236', speed: 3, up: 5, life: 0.7, gravity: 12 }); if (n === 3) SW.Audio.sfx('dig'); }
      }, reveal);
    };
    if (!fox) { dig(); return; }
    fox.rotation.y = Math.atan2(stand.x - start.x, stand.z - start.z);
    fx.anim(du(0.32 * hops), k => {
      fox.position.lerpVectors(start, stand, k); fox.position.y = start.y + Math.abs(Math.sin(k * Math.PI * hops)) * 0.9;
      const sq = Math.abs(Math.cos(k * Math.PI * hops)); Fl.foxM.scale.set(FOX * (1 + sq * 0.12), FOX * (1 - sq * 0.15), FOX * (1 + sq * 0.12));
    }, () => { fox.position.copy(stand); Fl.foxM.scale.setScalar(FOX); fox.rotation.y = Math.atan2(hole.x - stand.x, hole.z - stand.z); dig(); });
  };
  Fl.cleanRaid = function () {
    const a = A(), root = a.island.root;
    if (Fl.marks) Fl.marks.forEach(m => root.remove(m)); Fl.marks = null;
    if (Fl.fox) root.remove(Fl.fox); Fl.fox = Fl.foxM = null;
    if (Fl.loot) Fl.loot.forEach(o => root.remove(o)); Fl.loot = null;
  };
  Fl.pick = function (ndc) {
    const a = A(), isl = a.island;
    if (Fl.mode === 'raid' && Fl.marks) {
      const rc = new (T().Raycaster)(); rc.setFromCamera(ndc, isl.camera);
      const hit = rc.intersectObjects(Fl.marks.map(m => m.userData.hit), false);
      if (hit.length) { const i = hit[0].object.userData.dig; const p = G().s.pending; if (p && !p.picks.includes(i)) Fl.dig(i); return true; }
    }
    if (Fl.mode === 'attack') { const b = isl.pick(ndc); if (b >= 0) { const v = G().botView(Fl.target); if (v.stages[b] > 0) Fl.fire(b); return true; } }
    return false;
  };
  // ---------- Truhe ----------
  Fl.chest = function (type) {
    const g = G(), a = A(), res = g.openChest(type); a.after();
    if (res.error) { UI().toast(L('Keine Truhe dieser Art.', 'No chest of this kind.')); return; }
    UI().closeSheet(true);
    a.showStage('chest', type);
    SW.Audio.sfx('chest');
    const reveal = () => {
      const grid = h('div', { cls: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(84px,1fr))' });
      const anim = !a.set.reducedMotion, tm = [];
      res.cards.forEach((x, i) => {
        const c = x.card, el = h('div', { cls: 'card' + (anim ? ' flip' : '') + (c.r >= 2 ? ' rare' : ''), style: 'border-color:' + SW.RARITY[c.r].col + (anim ? ';animation-delay:' + (0.15 + i * 0.28) + 's' : '') }, [h('img', { src: SW.Symbols.cardUrl(c, 160), alt: '' }), x.isNew ? h('span', { cls: 'n', style: 'background:var(--jade)' }, L('NEU', 'NEW')) : null, h('span', { cls: 'cap' }, tx(c.name))]);
        grid.appendChild(el);
        if (anim) tm.push(setTimeout(() => SW.Audio.sfx(c.r >= 2 ? 'win' : 'coin'), 300 + i * 280));
      });
      // Tippen zeigt sofort alle Karten
      if (anim) grid.addEventListener('click', () => { tm.forEach(clearTimeout); grid.querySelectorAll('.card.flip').forEach(e => { e.style.animationDelay = '0s'; }); });
      const albums = res.cards.filter(x => x.album).map(x => x.album);
      UI().dialog({ title: tx(SW.CHESTS[type].name), node: h('div', null, [grid, albums.length ? h('p', { cls: 'warn' }, L('Album komplett! ', 'Album complete! ') + UI().rwText(albums[0])) : null]), noClose: true,
        buttons: [{ label: L('Super!', 'Great!'), cls: 'gold', fn: () => { a.hideStage(); if (a.tut) a.tut.after('chest'); } }] });
    };
    setTimeout(() => a.stage.openChest(reveal), a.set.reducedMotion ? 50 : 500);
  };
  // ---------- Insel abgeschlossen ----------
  Fl.islandDone = function () {
    const g = G(), a = A(), w = g.world(), lines = SW.STORY.islandDone;
    if (!g.islandComplete() || Fl.doneOpen) return; Fl.doneOpen = true; setTimeout(() => { Fl.doneOpen = false; }, 1500);
    SW.Audio.sfx('island');
    a.island.fx.burst(new (T().Vector3)(0, 6, 0), { n: 200, color: w.pal.glow, color2: '#ffffff', speed: 10, up: 8, life: 2 });
    const rew = g.completeIsland(); a.after();
    if (rew.error) return;
    const txt = SW.fill(tx(lines[(w.n - 1) % lines.length]), { island: tx(w.name) });
    UI().dialog({ title: L('Insel wiederhergestellt!', 'Island restored!'), text: txt + '\n' + UI().rwText(rew), noClose: true, buttons: [{ label: rew.ending ? L('Zum Finale', 'To the finale') : L('Weiterreisen', 'Travel on'), cls: 'gold', fn: () => {
      if (rew.ending) { Fl.finale(); return; }
      a.travel(w.n - 1, rew.next - 1, () => {
        const nw = g.world(), ch = g.chapter(nw.n);
        const chStart = (nw.n - 1) % 5 === 0 && SW.CHAPTERS[ch];
        UI().dialog({ title: nw.n + '. ' + tx(nw.name), text: (chStart ? L('Kapitel ', 'Chapter ') + (ch + 1) + ': ' + tx(SW.CHAPTERS[ch].name) + '\n' + tx(SW.CHAPTERS[ch].intro) + '\n' : '') + tx(nw.story), buttons: [{ label: L('Los geht’s!', 'Let’s go!'), cls: 'gold', fn: () => { if (a.tut) a.tut.after('island'); } }] });
      });
    } }] });
  };
  Fl.story = function (lines, done) {
    let i = 0;
    const next = () => {
      if (i >= lines.length) { if (done) done(); return; }
      const l = lines[i++], kivi = l.who === 'kivi';
      UI().dialog({ title: kivi ? 'Kivi' : l.who, img: kivi ? A().kiviImg() : null, text: SW.lang === 'en' ? l.en : l.de, noClose: true,
        buttons: [{ label: i < lines.length ? L('Weiter', 'Next') : L('Los!', 'Go!'), cls: 'gold', fn: next }].concat(i < lines.length ? [{ label: L('Überspringen', 'Skip'), cls: 'ghost', fn: () => { i = lines.length; next(); } }] : []) });
    };
    next();
  };
  Fl.finale = function () {
    const a = A(); a.go('atlas');
    Fl.story(SW.STORY.ending, () => UI().dialog({ title: L('Das Sternenherz leuchtet!', 'The Star Heart shines!'), text: tx(SW.STORY.ngplus), noClose: true,
      buttons: [{ label: L('Neues Spiel+ starten', 'Start New Game+'), cls: 'gold', fn: () => a.newGamePlus() }, { label: L('Später', 'Later'), fn: () => a.go('machine') }] }));
  };
  SW.Flows = Fl;
})(globalThis.SW = globalThis.SW || {});
