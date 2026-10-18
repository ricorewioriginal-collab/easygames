/* Spinwelten 3D – Abläufe mit 3D-Szene: Sturmangriff, Schatzexpedition, Truhe öffnen, Insel abschließen, Finale.
 * Grundsatz: Erst wird gebucht (Spiellogik), dann wird gezeigt. Neuladen mittendrin verliert nichts und bucht nichts doppelt. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en), tx = o => SW.tx(o), F = n => SW.fmt(n);
  const UI = () => SW.UI, A = () => SW.App, G = () => SW.App.g;
  const h = (...a) => SW.UI.h(...a), btn = (...a) => SW.UI.btn(...a);
  const T = () => globalThis.THREE;
  const Fl = { busy: false };
  function pickBar(info, opts) {
    Fl.closePick();
    const el = h('div', { id: 'pick' }, [h('div', { cls: 'info' }, info), h('div', { cls: 'opts' }, opts)]);
    document.getElementById('ui').appendChild(el); Fl.pickEl = el; UI().refocus(); return el;
  }
  Fl.closePick = () => { if (Fl.pickEl) { Fl.pickEl.remove(); Fl.pickEl = null; } };
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
    const w = SW.WORLDS[v.island - 1];
    const opts = w.buildings.map((b, i) => btn(tx(b.name) + (v.stages[i] ? ' (' + v.stages[i] + ')' : ''), () => Fl.fire(i), v.stages[i] ? 'coral small' : 'small', { disabled: !v.stages[i] }));
    const none = v.stages.every(x => !x);
    if (none) opts.push(btn(L('Sturm loslassen', 'Release storm'), () => Fl.fire(0), 'coral small'));
    pickBar(L(`Ziel: ${v.name} 🤖 – tippe auf ein Bauwerk`, `Target: ${v.name} 🤖 – tap a building`) + (st.shields > 0 ? L(' · Achtung: Schutzorb aktiv', ' · Careful: shield orb active') : ''), opts);
    Fl.mode = 'attack';
  };
  Fl.fire = function (b) {
    if (Fl.busy) return; const g = G(), a = A(), id = Fl.target;
    const res = g.attack(id, b); a.after();
    if (res.error) { UI().toast(L('Geht nicht: ', 'Not possible: ') + res.error); return; }
    Fl.busy = true; Fl.closePick();
    const isl = a.island, p = res.b >= 0 ? isl.slotPos(res.b) : new (T().Vector3)(0, 0, 0), from = new (T().Vector3)(-40, 30, 30);
    SW.Audio.sfx('attack'); if (a.set.haptics && navigator.vibrate) try { navigator.vibrate(30); } catch (e) { /* egal */ }
    if (res.b >= 0) isl.focus(res.b);
    const finish = () => {
      if (res.res === 'blocked') { SW.Audio.sfx('shield'); isl.fx.shield(p.clone().add(new (T().Vector3)(0, 1.5, 0)), 3.2, '#7dffcf'); }
      else { SW.Audio.sfx('hit'); isl.fx.burst(p.clone().add(new (T().Vector3)(0, 1, 0)), { n: 90, color: '#c58bff', color2: '#ffe066', speed: 7, up: 5, life: 1.2 }); isl.fx.ring(p, '#c58bff', 4); const bv = g.botView(id); if (res.b >= 0) isl.setBuilding(res.b, bv.stages[res.b], bv.damaged[res.b], false); }
      setTimeout(() => {
        Fl.busy = false;
        const t = res.res === 'blocked' ? L('Abgewehrt! Ein Schutzorb hat den Sturm aufgefangen.', 'Blocked! A shield orb caught the storm.') : res.res === 'miss' ? L('Der Sturm wirbelt über die leere Insel.', 'The storm swirls over the empty island.') : res.res === 'downgraded' ? L('Volltreffer – das Bauwerk verliert eine Stufe.', 'Direct hit – the building loses a stage.') : L('Treffer – das Bauwerk ist beschädigt.', 'Hit – the building is damaged.');
        UI().dialog({ title: res.revenge ? L('Rache geglückt!', 'Revenge done!') : L('Sturmangriff', 'Storm attack'), text: t + '\n🪙 +' + F(res.coins), buttons: [{ label: L('Zurück zur Insel', 'Back to island'), cls: 'gold', fn: () => { a.go('machine'); if (a.tut) a.tut.after('attack'); } }], noClose: true });
      }, a.set.reducedMotion ? 300 : 1300);
    };
    if (a.set.reducedMotion || a.set.skip) { setTimeout(finish, 150); return; }
    const to = p.clone().add(new (T().Vector3)(0, 1.2, 0));
    if (res.res === 'blocked') to.y += 2.2;
    isl.fx.projectile(from, to, '#c58bff', 1.3 / (a.set.speed || 1), finish);
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
    r.picks.forEach(i => Fl.markDone(i, null));
    Fl.raidBar(r);
  };
  Fl.raidBar = function (r) {
    const g = G(), p = g.s.pending, picks = p ? p.picks : [];
    const opts = [0, 1, 2, 3, 4, 5].map(i => btn(L('Stelle ', 'Spot ') + (i + 1) + (r && r.hint === i ? ' 🦊' : ''), () => Fl.dig(i), 'gold small', { disabled: picks.includes(i) }));
    pickBar(L(`Grabe an 3 von 6 Stellen · noch ${3 - picks.length}`, `Dig at 3 of 6 spots · ${3 - picks.length} left`) + (r && r.hint >= 0 ? L(' · Mira wittert etwas bei 🦊', ' · Mira smells something at 🦊') : ''), opts);
  };
  Fl.markDone = function (i, kind) {
    const m = Fl.marks && Fl.marks[i]; if (!m) return;
    const c = kind === 'big' ? '#ffd75e' : kind === 'mid' ? '#f2d08a' : kind === 'relic' ? '#7fe8ff' : '#556070';
    m.children.forEach(o => { if (o.material && o.material.visible !== false) o.material = SW.Models.mat(c, { em: c, emi: kind && kind !== 'empty' ? 0.6 : 0 }); });
    m.userData.done = true;
  };
  Fl.dig = function (i) {
    if (Fl.busy) return; const g = G(), a = A(), r = g.raidDig(i); a.after();
    if (r.error) return;
    Fl.busy = true; SW.Audio.sfx('dig');
    const m = Fl.marks[i], p = m.position.clone();
    a.island.fx.burst(p.clone().add(new (T().Vector3)(0, 0.5, 0)), { n: 40, color: '#9a7a50', speed: 4, up: 5, life: 0.9, gravity: 9 });
    setTimeout(() => {
      Fl.busy = false; Fl.markDone(i, r.kind);
      if (r.coins || r.relics) { SW.Audio.sfx('coin'); a.island.fx.burst(p.clone().add(new (T().Vector3)(0, 1, 0)), { n: 60, color: '#ffd75e', color2: '#fff4c2', speed: 5, up: 6, life: 1.2 }); }
      UI().reward(r.kind === 'empty' ? L('Leer …', 'Empty …') : '🪙 +' + F(r.coins), r.relics ? '🔷 +' + r.relics : '');
      if (r.done) {
        r.layout.forEach((k, j) => { if (!Fl.marks[j].userData.done) Fl.markDone(j, k === 'empty' ? 'empty' : 'mid'); });
        Fl.closePick();
        setTimeout(() => UI().dialog({ title: L('Expedition beendet', 'Expedition complete'), text: L('Beute: 🪙 ', 'Loot: 🪙 ') + F(r.total) + (r.chest ? L('\nBeide großen Schätze gefunden – eine Holztruhe dazu!', '\nFound both big treasures – plus a wooden chest!') : ''), noClose: true, buttons: [{ label: L('Zurück zur Insel', 'Back to island'), cls: 'gold', fn: () => { Fl.cleanRaid(); a.go('machine'); if (a.tut) a.tut.after('raid'); } }] }), 900);
      } else Fl.raidBar(null);
    }, a.set.reducedMotion ? 150 : 650);
  };
  Fl.cleanRaid = function () { const a = A(); if (Fl.marks) Fl.marks.forEach(m => a.island.root.remove(m)); Fl.marks = null; };
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
      res.cards.forEach(x => {
        const c = x.card, el = h('div', { cls: 'card', style: 'border-color:' + SW.RARITY[c.r].col }, [h('img', { src: SW.Symbols.cardUrl(c, 160), alt: '' }), x.isNew ? h('span', { cls: 'n', style: 'background:var(--jade)' }, L('NEU', 'NEW')) : null, h('span', { cls: 'cap' }, tx(c.name))]);
        grid.appendChild(el);
      });
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
