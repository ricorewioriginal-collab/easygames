/* FUNKBLASEN – Menüs, Dialoge, Anzeige. Bekommt ein "app"-Objekt (main.js) mit Spielstand und Aktionen. */
(function (root) {
  'use strict';
  const L = root.FBLevels, E = root.FBEngine;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('de-DE');
  const starsTxt = (n, max) => '★'.repeat(n) + '☆'.repeat((max || 3) - n);
  const COLOR_SW = L.COLOR_HEX;
  const SPECIALS = [
    { k: 'bomb', name: 'Bombenblase', sw: '#3b3f52', ic: '💣', txt: 'Als Schuss: sprengt alles im Umkreis von 2 Feldern. Im Feld: explodiert (Umkreis 1), sobald direkt daneben etwas platzt.' },
    { k: 'rainbow', name: 'Regenbogenblase', sw: '#ffffff', ic: '🌈', txt: 'Nimmt beim Andocken die Farbe der größten angrenzenden Gruppe an. Bei Gleichstand gewinnt die Farbe, die öfter auf dem Feld liegt.' },
    { k: 'bolt', name: 'Blitzblase', sw: '#ffe14a', ic: '⚡', txt: 'Als Schuss: räumt die ganze Reihe ab, in der sie landet. Im Feld (farbig mit Blitz): räumt ihre Reihe ab, wenn sie platzt.' },
    { k: 'ice', name: 'Eisblase', sw: '#bfefff', ic: '🧊', txt: 'Zählt erst nach dem Auftauen: Triff sie direkt oder lass daneben etwas platzen. Explosionen und Blitze zerstören sie sofort.' },
    { k: 'chain', name: 'Kettenblase', sw: '#ff8a3d', ic: '⛓️', txt: 'Farbig mit Ring. Zusammenhängende Kettenblasen bilden eine Kette: Platzt eine, platzen alle (jede genau einmal).' },
    { k: 'shift', name: 'Farbwandler', sw: '#b45cff', ic: '🔄', txt: 'Wechselt nach jedem Schuss zur nächsten Farbe des Levels. Landet deine Kugel direkt daneben, bleibt er stehen.' },
    { k: 'stone', name: 'Steinblase', sw: '#8b8f9c', ic: '🪨', txt: 'Platzt nicht durch Farben. Fällt mit herunter, wenn ihre Halterung weg ist. Zweimal Platzen direkt daneben (in zwei Schüssen) zerbricht sie.' },
    { k: 'crystal', name: 'Kristall', sw: '#bfefff', ic: '💎', txt: 'Ziel in Kristall-Leveln: gerettet, wenn er fällt, gesprengt wird oder direkt daneben etwas platzt.' },
    { k: 'star', name: 'Sternenblase', sw: '#ffcf33', ic: '⭐', txt: 'Bringt 250 Bonuspunkte, wenn sie fällt oder daneben etwas platzt.' },
    { k: 'switch', name: 'Schalter', sw: '#e8ecf5', ic: '🔘', txt: 'Triff ihn (Kugel landet daneben) oder lass daneben etwas platzen: Dann taut alles Eis im Level auf.' }
  ];

  function create(app) {
    const ui = { stack: [], modalOpen: false, current: null };
    // ---------- Bildschirme ----------
    ui.show = function (id, opts) {
      document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
      ui.current = id;
      const r = RENDER[id]; if (r) r(opts || {});
      app.onScreen(id);
      ui.focusFirst($(id));
    };
    ui.hideScreens = function () { document.querySelectorAll('.screen').forEach(s => { s.hidden = true; }); ui.current = null; };
    ui.back = function () {
      if (ui.modalOpen) { if (ui.modalBack) ui.modalBack(); return; }
      const scr = ui.current && $(ui.current);
      if (scr && scr.dataset.back) { if (ui.current === 'scrSettings' && app.inGameSettings) { app.closeGameSettings(); return; } ui.show(scr.dataset.back === 'scrWorlds' && ui.current === 'scrMap' ? 'scrWorlds' : scr.dataset.back); app.sfx('click'); }
      else if (ui.current === 'scrMenu') app.homeBack();
    };
    document.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      app.unlockAudio();
      if (b.hasAttribute('data-back')) { ui.back(); return; }
      if (b.dataset.go) { app.sfx('click'); ui.show(b.dataset.go); }
    });
    // ---------- Fokus (Tastatur/Controller) ----------
    ui.layer = () => ui.modalOpen ? $('modal') : (ui.current ? $(ui.current) : null);
    ui.focusables = el => el ? Array.from(el.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')).filter(x => x.offsetParent !== null) : [];
    ui.focusFirst = function (el) {
      if (!el) return;
      const list = ui.focusables(el), pref = el.querySelector('[data-focus]') || list.find(x => !x.hasAttribute('data-back')) || list[0];
      if (pref) try { pref.focus({ preventScroll: false }); } catch (e) {}
    };
    ui.nav = function (dir) {
      const layer = ui.layer(); if (!layer) return;
      const list = ui.focusables(layer); if (!list.length) return;
      const cur = document.activeElement && list.indexOf(document.activeElement) >= 0 ? document.activeElement : null;
      if (!cur) { list[0].focus(); return; }
      const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
      let best = null, bd = Infinity;
      for (const el of list) {
        if (el === cur) continue;
        const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - cx, dy = y - cy;
        const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
        if (!ok) continue;
        const main = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx), side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
        const d = main + side * 2.2; if (d < bd) { bd = d; best = el; }
      }
      if (best) { best.focus(); try { best.scrollIntoView({ block: 'nearest' }); } catch (e) {} app.sfx('click'); }
      else if (cur.type === 'range' && (dir === 'left' || dir === 'right')) { cur.stepUp && (dir === 'right' ? cur.stepUp() : cur.stepDown()); cur.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    ui.activate = function () { const a = document.activeElement; if (a && a.tagName === 'BUTTON' && ui.layer() && ui.layer().contains(a)) a.click(); else ui.focusFirst(ui.layer()); };

    // ---------- Dialog ----------
    ui.modal = function (o) {   // { title, html, actions:[{label, primary, fn, focus}], back, funki }
      $('modalTitle').textContent = o.title || '';
      $('modalBody').innerHTML = o.html || '';
      const act = $('modalActions'); act.textContent = '';
      (o.actions || []).forEach(a => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (a.primary ? ' primary' : '') + (a.small ? ' small' : '');
        b.textContent = a.label; if (a.focus) b.setAttribute('data-focus', '');
        b.onclick = () => { app.sfx('click'); if (!a.keep) ui.closeModal(); a.fn && a.fn(); };
        act.appendChild(b);
      });
      document.querySelector('.modal-funki').style.display = o.funki === false ? 'none' : '';
      ui.modalBack = o.back || null;
      $('modal').hidden = false; ui.modalOpen = true;
      ui.focusFirst($('modal'));
    };
    ui.closeModal = function () { $('modal').hidden = true; ui.modalOpen = false; ui.modalBack = null; };
    ui.toast = function (txt, ms) {
      const t = document.createElement('div'); t.className = 'toast'; t.textContent = txt; $('toast').appendChild(t);
      while ($('toast').children.length > 3) $('toast').firstChild.remove();
      setTimeout(() => t.remove(), ms || 2600);
    };
    ui.floater = function (x, y, txt, color) {
      const box = $('floaters'); if (box.children.length > 14) box.firstChild.remove();
      const d = document.createElement('div'); d.className = 'floater'; d.textContent = txt; d.style.left = x + 'px'; d.style.top = y + 'px'; if (color) d.style.color = color;
      box.appendChild(d); setTimeout(() => d.remove(), 1000);
    };
    ui.combo = function (txt) { const c = $('combo'); c.textContent = txt; c.classList.remove('show'); void c.offsetWidth; c.classList.add('show'); };

    // ---------- Anzeige im Spiel ----------
    ui.hud = function (S, def) {
      const st = S.st, w = L.WORLDS[(def.world || 1) - 1];
      $('hudLevel').textContent = def.mode === 'level' ? w.id + '-' + def.index : def.mode === 'daily' ? 'Tagesaufgabe' : def.mode === 'endless' ? 'Endlos' : 'Freies Spiel';
      $('hudWorld').textContent = def.mode === 'daily' ? def.date + ' (UTC)' : def.mode === 'endless' ? 'Welle ' + (st.wave + 1) : w.name;
      $('hudScore').textContent = fmt(st.score);
      const g = E.goalProgress(st), gEl = $('hudGoal');
      if (def.mode === 'endless') gEl.textContent = '🏆 ' + fmt(app.save.data.endless.best);
      else if (st.goal.type === 'rescue') gEl.textContent = '💎 ' + g.cur + '/' + g.max;
      else if (st.goal.type === 'score') gEl.textContent = '⭐ ' + fmt(g.cur) + '/' + fmt(g.max);
      else gEl.textContent = '🫧 ' + g.cur;
      gEl.title = def.mode === 'endless' ? 'Rekord' : st.goal.type === 'rescue' ? 'Kristalle gerettet' : st.goal.type === 'score' ? 'Punkteziel (oder Feld leer räumen)' : 'Farbblasen übrig';
      gEl.classList.toggle('done', E.goalDone(st) && def.mode !== 'endless');
      const shots = $('hudShots');
      shots.textContent = st.shotsTotal > 0 ? '🎯 ' + st.shotsLeft : '🎯 ∞';
      shots.classList.toggle('warn', st.shotsTotal > 0 && st.shotsLeft <= 3);
      const hs = $('hudStars');
      if (st.shotsTotal > 0) { const s = E.stars(st), ss = E.starShots(st); hs.hidden = false; hs.textContent = starsTxt(s) + (s === 3 ? ' ab ' + ss[1] : s === 2 ? ' ab ' + ss[0] : ''); hs.title = '3 Sterne: mindestens ' + ss[1] + ' Schüsse übrig, 2 Sterne: mindestens ' + ss[0]; }
      else hs.hidden = true;
      const ex = $('hudExtra'); let et = '';
      if (def.mode === 'endless') et = '⬇ neue Reihe in ' + Math.max(0, st.pushEvery - st.pushCount);
      else if (st.ceilEvery) et = '⬇ Decke sinkt in ' + (st.ceilEvery - st.ceilCount);
      else if (st.wind) et = '🌬 Wind ' + (st.wind > 0 ? '→' : '←');
      ex.hidden = !et; ex.textContent = et; ex.classList.toggle('warn', /in 1$/.test(et));
      const j = $('btnJoker'); j.disabled = !S.canAct() || st.jokerUsed || !!(st.cur && st.cur.s) || app.save.data.coins < 60;
      j.title = st.jokerUsed ? 'Joker in diesem Versuch schon benutzt' : app.save.data.coins < 60 ? 'Zu wenig Münzen (60 nötig)' : 'Aktuelle Kugel wird zur Regenbogenblase (60 Münzen, einmal je Versuch)';
      $('btnSwap').disabled = !S.canAct();
    };
    ui.hint = function (dev) {
      $('hudHint').textContent = dev === 'touch' ? 'Ziehen = zielen · Loslassen = schießen' : dev === 'pad' ? 'Stick = zielen · Ⓐ schießen · Ⓧ tauschen' : dev === 'keys' ? '←/→ zielen · Leertaste schießen · T tauschen' : 'Maus = zielen · Klick = schießen';
    };

    // ---------- Inhalte der Bildschirme ----------
    const RENDER = {};
    RENDER.scrMenu = function () {
      const d = app.save.data;
      $('btnPlay').textContent = app.save.hasProgress() ? '▶ Weiterspielen · Level ' + d.last.level : '▶ Spielen';
      $('menuStats').innerHTML = app.save.hasProgress() ? '<span class="chip">⭐ ' + app.save.totalStars() + ' / 450</span><span class="chip">🪙 ' + fmt(d.coins) + '</span><span class="chip">🏅 ' + Object.keys(d.ach).length + ' / ' + app.save.ACH.length + '</span>' : '';
      const lines = app.save.hasProgress() ? ['Schön, dass du wieder da bist! Weiter geht\'s mit Level ' + d.last.level + '.', 'Tipp: Bandenschüsse an der Wand erreichen versteckte Stellen.', 'Hast du heute schon die Tagesaufgabe gespielt?', 'Was nicht mehr an der Decke hängt, fällt – und bringt doppelte Punkte!']
        : ['Hallo, ich bin Funki! Hilf mir, die bunten Funkblasen zum Platzen zu bringen.'];
      $('menuSpeech').textContent = lines[Math.floor(Math.random() * lines.length)];
      $('btnHome').hidden = !app.embedded;
      $('btnCloud').textContent = (root.AnMaChaCloud && root.AnMaChaCloud.user && root.AnMaChaCloud.user()) ? '☁️ Google-Speicher ✓' : '☁️ Mit Google speichern';
      if (!app.save.available) $('menuSpeech').textContent = 'Hinweis: Dieser Browser erlaubt kein Speichern. Du kannst trotzdem spielen, der Fortschritt bleibt aber nur bis zum Schließen.';
    };
    RENDER.scrWorlds = function () {
      const box = $('worldList'); box.textContent = '';
      $('worldsChips').innerHTML = '<span class="chip">⭐ ' + app.save.totalStars() + '/450</span>';
      L.WORLDS.forEach(w => {
        const open = app.save.worldUnlocked(w.id), b = document.createElement('button');
        b.type = 'button'; b.className = 'world' + (open ? '' : ' locked');
        b.style.background = 'linear-gradient(135deg,' + w.sky[0] + ',' + w.sky[1] + ')';
        b.innerHTML = '<span class="w-num">' + w.id + '</span><b>' + esc(w.name) + '</b><small>' + (open ? '⭐ ' + app.save.worldStars(w.id) + ' / 45' : '🔒 Schließe Welt ' + (w.id - 1) + ' ab') + '</small><small>' + esc(w.mech.join(' · ')) + '</small>';
        b.setAttribute('aria-label', w.name + (open ? ', ' + app.save.worldStars(w.id) + ' von 45 Sternen' : ', gesperrt'));
        b.onclick = () => { app.sfx('click'); if (open) { app.mapWorld = w.id; ui.show('scrMap'); } else ui.toast('🔒 Diese Welt öffnet sich nach Welt ' + (w.id - 1) + '.'); };
        box.appendChild(b);
      });
    };
    RENDER.scrMap = function () {
      const w = L.WORLDS[(app.mapWorld || 1) - 1], d = app.save.data, box = $('map');
      app.setBackdrop(w.id);
      $('mapTitle').textContent = 'Welt ' + w.id + ': ' + w.name;
      $('mapChips').innerHTML = '<span class="chip">⭐ ' + app.save.worldStars(w.id) + '/45</span>';
      const P = []; for (let i = 0; i < 15; i++) { const row = Math.floor(i / 5), col = row % 2 ? 4 - (i % 5) : i % 5; P.push([10 + col * 20, 16 + row * 34]); }
      box.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="' + P.map(p => p.join(',')).join(' ') + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/></svg>';
      for (let i = 0; i < 15; i++) {
        const n = (w.id - 1) * 15 + i + 1, open = app.save.isUnlocked(n), s = d.stars[n] || 0, b = document.createElement('button');
        b.type = 'button'; b.className = 'node' + (i === 14 ? ' boss' : '') + (open ? '' : ' locked') + (n === d.unlocked && !s ? ' current' : '');
        b.style.left = P[i][0] + '%'; b.style.top = P[i][1] + '%'; b.style.setProperty('--nc', w.accent);
        b.innerHTML = (open ? (i + 1) : '🔒') + (open ? '<span class="st">' + starsTxt(s) + '</span>' : '');
        b.setAttribute('aria-label', 'Level ' + w.id + '-' + (i + 1) + (open ? ', ' + s + ' Sterne' : ', gesperrt'));
        if (n === d.unlocked) b.setAttribute('data-focus', '');
        b.onclick = () => { app.sfx('click'); if (open) app.levelIntro(n); else ui.toast('🔒 Schaffe zuerst das Level davor.'); };
        box.appendChild(b);
      }
      const reward = L.CANNONS.find(c => c.world === w.id);
      $('mapInfo').innerHTML = esc(w.funki) + '<br>Belohnung für die Welt: <b>' + esc(reward.name) + '</b>' + (app.save.owns(reward.id) ? ' ✓' : '');
    };
    RENDER.scrDaily = function () {
      const date = L.utcDate(), def = app.dailyDef(date), e = app.save.data.daily[date], w = L.WORLDS[def.world - 1];
      const goal = def.goal.type === 'rescue' ? 'Rette ' + def.goal.n + ' Kristalle' : def.goal.type === 'score' ? 'Erreiche ' + fmt(def.goal.n) + ' Punkte (oder räume das Feld)' : 'Räume alle Farbblasen ab';
      const de = date.split('-').reverse().join('.');
      const days = Object.keys(app.save.data.daily).sort().reverse().slice(0, 7).map(k => '<span class="chip">' + k.slice(8) + '.' + k.slice(5, 7) + '. ' + (app.save.data.daily[k].won ? '✓' : '·') + ' ' + fmt(app.save.data.daily[k].best) + '</span>').join(' ');
      $('dailyBox').innerHTML = '<h3>📅 ' + de + ' <small class="muted">(UTC-Tag)</small></h3><p>Heute für alle gleich: ein Level im Stil <b>' + esc(w.name) + '</b>.</p><p>🎯 ' + esc(goal) + ' · ' + def.shots + ' Schüsse</p>' +
        '<p>Deine Bestleistung heute: <b>' + (e ? fmt(e.best) + (e.won ? ' ✓ geschafft' : '') : '–') + '</b></p><p class="muted">Erster Sieg des Tages: 40 🪙. Morgen gibt es eine neue Aufgabe.</p><div class="row"><button class="btn primary big" type="button" id="btnDailyGo" data-focus>▶ Tagesaufgabe spielen</button></div>' + (days ? '<h3>Letzte Tage</h3><div class="row">' + days + '</div>' : '');
      $('btnDailyGo').onclick = () => { app.sfx('click'); app.start(def); };
    };
    RENDER.scrEndless = function () {
      const d = app.save.data, run = d.endless.run;
      $('endlessBox').innerHTML = '<h3>♾️ Endlosmodus</h3><p>Alle paar Schüsse schiebt sich oben eine neue Reihe ins Feld. Mit jeder Welle kommen mehr Farben und die Reihen kommen schneller. Erreichen die Blasen die rote Linie, ist die Runde vorbei.</p>' +
        '<div class="facts"><div><small>Rekord</small><b>' + fmt(d.endless.best) + '</b></div><div><small>Meiste Reihen</small><b>' + d.endless.rows + '</b></div></div>' +
        '<div class="modal-actions">' + (run ? '<button class="btn primary big" type="button" id="btnEndRes" data-focus>▶ Fortsetzen (' + fmt(run.st.score) + ' Punkte)</button>' : '') + '<button class="btn ' + (run ? '' : 'primary big') + '" type="button" id="btnEndNew"' + (run ? '' : ' data-focus') + '>Neue Runde</button></div>';
      if (run) $('btnEndRes').onclick = () => { app.sfx('click'); app.resumeEndless(); };
      $('btnEndNew').onclick = () => { app.sfx('click'); app.startEndless(); };
    };
    let colTab = 'designs';
    RENDER.scrCollection = function (o) {
      if (o.tab) colTab = o.tab;
      const d = app.save.data;
      $('colChips').innerHTML = '<span class="chip">🪙 ' + fmt(d.coins) + '</span>';
      document.querySelectorAll('#scrCollection .tab').forEach(t => { t.setAttribute('aria-selected', String(t.dataset.tab === colTab)); t.onclick = () => { app.sfx('click'); colTab = t.dataset.tab; RENDER.scrCollection({}); }; });
      const body = $('colBody');
      if (colTab === 'designs') {
        const sec = (title, list, slot, info) => '<h3>' + title + '</h3><div class="grid2">' + list.map(x => {
          const own = app.save.owns(x.id), on = d.cos[slot] === x.id, locked = !own && x.world, cost = x.cost || 0;
          const btn = on ? '<button class="btn small" type="button" disabled>✓ Aktiv</button>' : own ? '<button class="btn small" type="button" data-eq="' + slot + ':' + x.id + '">Benutzen</button>'
            : locked ? '<button class="btn small" type="button" disabled>🔒 Welt ' + x.world + '</button>' : '<button class="btn small" type="button" data-buy="' + slot + ':' + x.id + ':' + cost + '"' + (d.coins < cost ? ' disabled' : '') + '>Kaufen ' + cost + ' 🪙</button>';
          return '<div class="item' + (on ? ' on' : '') + '"><span class="swatch" style="--sw:' + info(x) + '"></span><b>' + esc(x.name) + '</b>' + btn + '</div>';
        }).join('') + '</div>';
        body.innerHTML = '<p class="muted">Designs sind nur Optik – sie machen das Spiel nicht leichter. Münzen gibt es für neue Sterne, Tagesaufgaben, Endlos-Runden und Erfolge.</p>' +
          sec('Kanonen (Belohnung je Welt)', L.CANNONS, 'cannon', x => x.color) + sec('Kugel-Glanz', L.FINISHES, 'finish', x => ({ glas: '#7fd3ff', perle: '#f0e6ff', bonbon: '#ff8ac0', metall: '#c8d0e0', matt: '#6a6f9a', galaxie: '#5a3cff' }[x.id])) + sec('Funkis Kopfhörer', L.HEADPHONES, 'phones', x => x.color);
        body.querySelectorAll('[data-eq]').forEach(b => { b.onclick = () => { const [slot, id] = b.dataset.eq.split(':'); app.equip(slot, id); RENDER.scrCollection({}); ui.focusFirst(body); }; });
        body.querySelectorAll('[data-buy]').forEach(b => { b.onclick = () => { const [slot, id, cost] = b.dataset.buy.split(':'); app.buy(slot, id, +cost); RENDER.scrCollection({}); }; });
      } else if (colTab === 'ach') {
        body.innerHTML = '<p class="muted">' + Object.keys(d.ach).length + ' von ' + app.save.ACH.length + ' Erfolgen · je 25 🪙</p>' + app.save.ACH.map(a => {
          const done = !!d.ach[a.id], p = a.prog(d);
          return '<div class="ach' + (done ? ' done' : '') + '"><span class="ic">' + (done ? a.icon : '🔒') + '</span><div style="flex:1"><b>' + esc(a.name) + '</b><div class="muted">' + esc(a.desc) + '</div>' + (done ? '' : '<div class="pr"><i style="width:' + Math.round(p[0] / p[1] * 100) + '%"></i></div><small class="muted">' + fmt(p[0]) + ' / ' + fmt(p[1]) + '</small>') + '</div></div>';
        }).join('');
      } else {
        const s = d.stats, rows = [['Schüsse', s.shots], ['Geplatzte Blasen', s.pops], ['Heruntergefallen', s.drops], ['Bandentreffer', s.banks], ['Beste Combo', s.bestCombo], ['Größter Fall', s.bestDrop], ['Bomben', s.bombs], ['Blitze', s.bolts], ['Eis aufgetaut', s.ice], ['Kristalle gerettet', s.crystals], ['Sternenblasen', s.stars], ['Siege', s.wins], ['Niederlagen', s.losses], ['Tagesaufgaben', s.dailyWins], ['Endlos-Rekord', d.endless.best], ['Sterne', app.save.totalStars()]];
        body.innerHTML = '<div class="facts">' + rows.map(r => '<div><small>' + r[0] + '</small><b>' + fmt(r[1]) + '</b></div>').join('') + '</div>';
      }
    };
    RENDER.scrSettings = function () {
      const o = app.save.data.opts, box = $('settingsBody');
      const seg = (key, vals, labels) => '<span class="seg">' + vals.map((v, i) => '<button type="button" data-opt="' + key + '" data-val="' + v + '" aria-pressed="' + (String(o[key]) === String(v)) + '">' + labels[i] + '</button>').join('') + '</span>';
      box.innerHTML =
        '<div class="set"><label for="optMusic">🎵 Musik</label><input id="optMusic" type="range" min="0" max="1" step="0.05" value="' + o.music + '"></div>' +
        '<div class="set"><label for="optSfx">🔊 Effekte</label><input id="optSfx" type="range" min="0" max="1" step="0.05" value="' + o.sfx + '"></div>' +
        '<div class="set"><label>🔇 Ton insgesamt <small>Taste M</small></label>' + seg('muted', [false, true], ['An', 'Aus']) + '</div>' +
        '<div class="set"><label>🔷 Farbsymbole <small>Formen auf den Kugeln (hilft bei Farbschwäche)</small></label>' + seg('patterns', [true, false], ['An', 'Aus']) + '</div>' +
        '<div class="set"><label>🎯 Ziellinie <small>kurz = nur bis kurz nach dem ersten Abprall</small></label>' + seg('line', ['lang', 'kurz'], ['Lang', 'Kurz']) + '</div>' +
        '<div class="set"><label>⭕ Landepunkt zeigen</label>' + seg('preview', [true, false], ['An', 'Aus']) + '</div>' +
        '<div class="set"><label>🌀 Bewegung reduzieren</label>' + seg('motion', ['auto', 'an', 'aus'], ['Auto', 'An', 'Aus']) + '</div>' +
        '<div class="set"><label>🖥️ Grafik</label>' + seg('quality', ['auto', 'hoch', 'niedrig'], ['Auto', 'Hoch', 'Spar']) + '</div>' +
        '<div class="set"><label>💬 Funkis Tipps vor neuen Leveln</label>' + seg('tutorials', [true, false], ['An', 'Aus']) + '</div>' +
        '<div class="set"><label>⛶ Vollbild</label><button class="btn small" type="button" id="optFull">Umschalten</button></div>' +
        '<div class="set"><label>💬 Gesehene Tipps zurücksetzen</label><button class="btn small" type="button" id="optTut">Zurücksetzen</button></div>' +
        '<div class="set"><label>🗑️ Spielstand löschen <small>Alle Level, Sterne, Münzen und Erfolge auf diesem Gerät</small></label><button class="btn small" type="button" id="optReset">Löschen …</button></div>' +
        '<p class="muted">FUNKBLASEN ' + L.VERSION + ' · Musik und Töne sind selbst erzeugt · by RicoReWi × AnMaCha</p>';
      $('optMusic').oninput = e => app.setOpt('music', +e.target.value);
      $('optSfx').oninput = e => { app.setOpt('sfx', +e.target.value); };
      $('optSfx').onchange = () => app.sfx('pop', 3, 0);
      box.querySelectorAll('[data-opt]').forEach(b => { b.onclick = () => { const v = b.dataset.val, val = v === 'true' ? true : v === 'false' ? false : v; app.setOpt(b.dataset.opt, val); app.sfx('click'); b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }; });
      $('optFull').onclick = () => app.fullscreen();
      $('optTut').onclick = () => { app.save.data.tut = {}; app.persist(); ui.toast('Funki zeigt die Tipps wieder.'); };
      $('optReset').onclick = () => ui.modal({ title: 'Spielstand löschen?', html: '<p>Alle Level, Sterne, Münzen, Designs und Erfolge auf diesem Gerät gehen verloren. Das lässt sich nicht rückgängig machen.</p>', actions: [{ label: 'Abbrechen', primary: true, focus: true, fn: () => ui.focusFirst($('scrSettings')) }, { label: 'Ja, alles löschen', fn: () => { app.resetAll(); } }], back: () => ui.closeModal() });
    };
    RENDER.scrGuide = function () {
      $('guideBody').innerHTML =
        '<section><h3>So geht\'s</h3><p>Schieße von unten farbige Kugeln in das Blasenfeld an der Decke. Hängen nach dem Schuss <b>mindestens drei gleiche Farben</b> zusammen (deine Kugel zählt mit), platzen sie. Alles, was danach nicht mehr mit der Decke verbunden ist, <b>fällt herunter</b> und bringt doppelte Punkte.</p>' +
        '<p>Die gestrichelte Ziellinie zeigt den genauen Weg – auch über die <b>Seitenwände</b> (Bandenschuss). Der Ring zeigt, wo die Kugel landet. Unten links siehst du die nächste Kugel; <b>Tauschen</b> ist jederzeit kostenlos.</p>' +
        '<p><b>Ziele:</b> alle Farbblasen abräumen 🫧, Kristalle retten 💎 oder eine Punktzahl erreichen ⭐ (ein leeres Feld zählt auch). <b>Verloren</b> hast du, wenn keine Schüsse mehr übrig sind 🎯 oder Blasen die <b>rote Gefahrenlinie</b> erreichen. In Gewitter-Leveln sinkt die Decke nach der angezeigten Zahl von Schüssen, im Endlosmodus kommen neue Reihen von oben.</p>' +
        '<p><b>Sterne:</b> 1 Stern fürs Schaffen, 2 und 3 Sterne, wenn genug Schüsse übrig bleiben (die Anzeige oben zeigt, ab wie vielen). Übrige Schüsse bringen je 50 Bonuspunkte. Mehrere Treffer in Folge ergeben eine Combo (bis ×3), Bandenschüsse geben Extrapunkte.</p>' +
        '<p><b>Joker:</b> Für 60 Münzen wird die aktuelle Kugel einmal pro Versuch zur Regenbogenblase. Münzen gibt es nur fürs Spielen (neue Sterne, Tagesaufgabe, Endlos, Erfolge) – kein Echtgeld, keine Werbung.</p></section>' +
        '<section><h3>Sonderblasen</h3><div class="sp-list">' + SPECIALS.map(s => '<div class="sp"><span class="ball" style="--sw:' + s.sw + '">' + s.ic + '</span><div><b>' + s.name + '</b><br><small>' + s.txt + '</small></div></div>').join('') + '</div></section>' +
        '<section><h3>Farben</h3><div class="row">' + L.COLOR_NAMES.map((n, i) => '<span class="chip"><span class="swatch" style="--sw:' + COLOR_SW[i] + ';width:22px;height:22px"></span>' + n + ' ' + ['●', '▲', '■', '◆', '★', '✚'][i] + '</span>').join('') + '</div><p class="muted">Die Formen auf den Kugeln lassen sich in den Einstellungen abschalten.</p></section>' +
        '<section><h3>Steuerung</h3><ul><li><b>Handy/Tablet:</b> Finger aufs Spielfeld, ziehen zum Zielen, loslassen zum Schießen. Zum Abbrechen unter die Kanone ziehen. Die kleine Kugel links antippen = tauschen.</li>' +
        '<li><b>PC:</b> Maus zielt, Klick schießt. Oder ←/→ bzw. A/D zielen (mit Umschalt fein), Leertaste/Enter schießen, T tauschen, J Joker, P/Esc Pause, M Ton, F Vollbild.</li>' +
        '<li><b>Controller:</b> linker Stick oder Steuerkreuz zielen, Ⓐ schießen, Ⓧ tauschen, Ⓨ Joker, Start Pause. In Menüs: Steuerkreuz wählen, Ⓐ bestätigen, Ⓑ zurück.</li></ul></section>' +
        '<section><h3>Modi</h3><p><b>Kampagne:</b> 10 Welten × 15 Level, jedes Level kannst du jederzeit wiederholen. <b>Endlos:</b> so lange wie möglich durchhalten, Rekord jagen. <b>Tagesaufgabe:</b> jeden Tag (UTC) ein neues, für alle gleiches Level. <b>Freies Spiel:</b> entspannt ohne Schusslimit.</p></section>' +
        '<section><h3>Funkis Tipps</h3><div class="row"><button class="btn small" type="button" id="guideTut">Alle Level-Tipps ansehen</button></div></section>';
      $('guideTut').onclick = () => app.showAllTips();
    };
    RENDER.scrCloud = function () {
      $('cloudNote').textContent = root.AnMaChaCloud ? '' : 'Der Google-Speicher ist gerade nicht verfügbar (z. B. offline). Dein Fortschritt bleibt auf diesem Gerät gespeichert.';
    };
    ui.render = id => RENDER[id] && RENDER[id]({});
    ui.SPECIALS = SPECIALS; ui.fmt = fmt; ui.esc = esc; ui.starsTxt = starsTxt;
    return ui;
  }
  root.FBUI = { create };
})(typeof self !== 'undefined' ? self : this);
