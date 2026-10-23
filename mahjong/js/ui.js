/* Mahjong 3D – Menüs, Dialoge, Hinweise und Fokus-Navigation (Tastatur/Controller). */
(function (root) {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = root.MJLayouts;
  const WORLD_BG = {
    jade: 'linear-gradient(135deg,#2b8a6a,#0e3b2e)', bambus: 'linear-gradient(135deg,#8fbf5a,#2c4a14)', lotus: 'linear-gradient(135deg,#46b3bf,#0f3a44)',
    kirsche: 'linear-gradient(135deg,#f39cc4,#5a1a48)', drache: 'linear-gradient(135deg,#d9483a,#3f0d0d)', mond: 'linear-gradient(135deg,#5a6fb8,#121b36)',
    tempel: 'linear-gradient(135deg,#1fae86,#06302a)', kaiser: 'linear-gradient(135deg,#c9304f,#360818)'
  };
  const WORLD_DESC = ['Sanfter Einstieg mit kleinen Brettern', 'Erste Türme und Ringe', 'Formen mit Tiefgang', 'Bunte Figuren, höhere Stapel',
    'Hohe Stapel, knifflige Ecken', 'Elegante Paläste', 'Für Kenner', 'Die großen Klassiker'];

  function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function starsHtml(n, of) { let s = ''; for (let i = 0; i < (of || 3); i++) s += i < n ? '★' : '<span class="off">★</span>'; return '<span class="stars" aria-label="' + n + ' von ' + (of || 3) + ' Sternen">' + s + '</span>'; }

  // Draufsicht eines Layouts (2D, sparsam)
  const previewCache = {};
  function preview(layout, w, h) {
    const key = layout.id + ':' + w;
    if (previewCache[key]) { const c = previewCache[key]; const cp = document.createElement('canvas'); cp.width = c.width; cp.height = c.height; cp.getContext('2d').drawImage(c, 0, 0); return cp; }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    const off = 2.2, tw = (w - 12 - layout.layers * off) / (layout.w / 2), th = tw * 1.3125;
    const scale = Math.min(1, (h - 12 - layout.layers * off) / (layout.h / 2 * th));
    const sw = tw * scale, sh = th * scale;
    const ox = (w - layout.w / 2 * sw - layout.layers * off) / 2 + layout.layers * off, oy = (h - layout.h / 2 * sh + layout.layers * off) / 2 - layout.layers * off * 0.2;
    layout.tiles.forEach(t => {
      const px = ox + t.x / 2 * sw - t.z * off, py = oy + t.y / 2 * sh - t.z * off;
      x.fillStyle = '#2f8f6a'; x.fillRect(px + 1.4, py + 1.6, sw - 1, sh - 1);
      const l = 238 - (layout.layers - 1 - t.z) * 10;
      x.fillStyle = 'rgb(' + l + ',' + (l - 8) + ',' + (l - 26) + ')'; x.fillRect(px, py, sw - 1, sh - 1);
      x.strokeStyle = 'rgba(80,60,30,.35)'; x.lineWidth = 0.6; x.strokeRect(px + 0.3, py + 0.3, sw - 1.6, sh - 1.6);
    });
    previewCache[key] = c;
    return preview(layout, w, h);
  }

  function UI(app) { this.app = app; this.cur = 'scrLoad'; this.stack = []; this.modalOpen = false; this.modalCancel = null; this.sort = 'size'; this.mapWorld = 1; }
  UI.prototype = {
    // ---------- Bildschirme ----------
    show(id, opts) {
      document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
      this.cur = id;
      const r = this['r_' + id]; if (r) r.call(this, opts || {});
      if (id) this.focusFirst();
    },
    hideScreens() { document.querySelectorAll('.screen').forEach(s => { s.hidden = true; }); this.cur = null; },
    back() {
      if (this.modalOpen) { if (this.modalCancel) this.modalCancel(); return true; }
      if (!this.cur) return false;
      const s = $(this.cur), to = s && s.dataset.back;
      if (to) { this.app.sfx('click'); this.show(to); return true; }
      return false;
    },
    focusFirst() {
      const layer = this.layer(); if (!layer) return;
      if (!this.app.lastInputKeys()) return;
      const el = layer.querySelector('.btn.primary:not([hidden]):not([disabled]), .lvl:not(.locked), .world:not(.locked), .tile-card, .btn:not([hidden]):not([disabled]), button:not([disabled])');
      if (el) try { el.focus({ preventScroll: false }); } catch (e) {}
    },
    layer() { if (this.modalOpen) return $('modal'); if (this.cur) return $(this.cur); return null; },
    // Fokus in eine Richtung verschieben (räumlich)
    nav(dir) {
      const layer = this.layer(); if (!layer) return;
      const items = [...layer.querySelectorAll('button, [tabindex="0"], input, select')].filter(el => !el.disabled && el.offsetParent !== null && !el.closest('[hidden]'));
      if (!items.length) return;
      const a = document.activeElement;
      if (!a || !layer.contains(a) || items.indexOf(a) < 0) { items[0].focus(); return; }
      const ra = a.getBoundingClientRect(), ax = ra.left + ra.width / 2, ay = ra.top + ra.height / 2;
      let best = null, bs = Infinity;
      for (const el of items) {
        if (el === a) continue;
        const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - ax, dy = y - ay;
        let along, perp;
        if (dir === 'left') { along = -dx; perp = Math.abs(dy); } else if (dir === 'right') { along = dx; perp = Math.abs(dy); }
        else if (dir === 'up') { along = -dy; perp = Math.abs(dx); } else { along = dy; perp = Math.abs(dx); }
        if (along <= 4) continue;
        const sc = along + perp * 2.2;
        if (sc < bs) { bs = sc; best = el; }
      }
      if (best) { best.focus(); try { best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} this.app.sfx('click'); }
    },
    confirm() {
      const a = document.activeElement, layer = this.layer();
      if (a && layer && layer.contains(a) && a.click) { a.click(); return; }
      this.nav('down');
    },

    // ---------- Dialog ----------
    modal(title, html, actions, opts) {
      opts = opts || {};
      $('modalTitle').textContent = title; $('modalBody').innerHTML = html;
      const box = $('modalActions'); box.innerHTML = ''; box.className = 'modal-actions' + (opts.row ? ' row' : '');
      actions.forEach(a => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (a.primary ? ' primary' : '') + (a.small ? ' small' : '');
        b.textContent = a.label; b.onclick = () => { this.app.sfx('click'); if (!a.keep) this.closeModal(); a.fn && a.fn(); };
        box.appendChild(b);
      });
      this.modalCancel = opts.cancel === undefined ? null : () => { this.closeModal(); opts.cancel && opts.cancel(); };
      $('modal').hidden = false; this.modalOpen = true;
      const f = box.querySelector('.primary') || box.querySelector('button');
      if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) {} }, 30);
    },
    closeModal() { $('modal').hidden = true; this.modalOpen = false; this.modalCancel = null; },
    toast(text, ms) {
      const t = $('toast'); t.textContent = text; t.classList.add('on');
      clearTimeout(this._toast); this._toast = setTimeout(() => t.classList.remove('on'), ms || 2600);
    },

    // ---------- Hauptmenü ----------
    r_scrMenu() {
      const a = this.app, d = a.save.d;
      $('btnContinue').hidden = !d.cur;
      if (d.cur) $('btnContinue').textContent = '▶ Weiterspielen – ' + a.describeCur(d.cur);
      const st = a.save.stars();
      $('menuStats').innerHTML = '<span class="chip">⭐ ' + st + ' / ' + L.LEVELS.length * 3 + '</span>' +
        '<span class="chip">🏆 ' + Object.keys(d.ach).length + ' / ' + root.MJSave.ACH.length + '</span>' +
        (d.daily.streak ? '<span class="chip">📅 ' + d.daily.streak + ' Tage</span>' : '');
      $('btnHome').hidden = !a.embedded;
    },
    // ---------- Reise ----------
    r_scrWorlds() {
      const a = this.app, list = $('worldList'); list.innerHTML = '';
      $('worldsStars').textContent = '⭐ ' + a.save.stars() + ' / ' + L.LEVELS.length * 3;
      L.WORLDS.forEach((w, wi) => {
        const lv = L.LEVELS.filter(l => l.world === w.id), done = lv.filter(l => a.save.levelDone(l.id)).length;
        const st = lv.reduce((s, l) => s + ((a.save.d.lv[l.id] || {}).s || 0), 0);
        const open = a.worldOpen(w.id);
        const b = document.createElement('button'); b.type = 'button'; b.className = 'world' + (open ? '' : ' locked');
        b.style.background = WORLD_BG[w.theme];
        b.innerHTML = '<span class="wn">Welt ' + w.id + '</span><b>' + esc(w.name) + '</b><small>' + WORLD_DESC[wi] + '</small>' +
          '<span class="stars">★ ' + st + ' / 18</span> <small>· ' + done + ' / 6 Level</small>' +
          '<span class="prog"><i style="width:' + Math.round(done / 6 * 100) + '%"></i></span>' + (open ? '' : '<span class="lock">🔒</span>');
        b.onclick = () => {
          if (!open) { a.sfx('blocked'); this.toast('Schließe zuerst Welt ' + (w.id - 1) + ' ab (alle 6 Level).'); return; }
          a.sfx('click'); this.mapWorld = w.id; this.show('scrLevels');
        };
        list.appendChild(b);
      });
    },
    r_scrLevels() {
      const a = this.app, w = L.WORLDS[this.mapWorld - 1], grid = $('levelGrid'); grid.innerHTML = '';
      $('levelsTitle').textContent = 'Welt ' + w.id + ': ' + w.name;
      const lv = L.LEVELS.filter(l => l.world === w.id);
      $('levelsStars').textContent = '⭐ ' + lv.reduce((s, l) => s + ((a.save.d.lv[l.id] || {}).s || 0), 0) + ' / 18';
      lv.forEach((l, i) => {
        const lay = L.BY_ID[l.layout], rec = a.save.d.lv[l.id], open = a.levelOpen(l);
        const b = document.createElement('button'); b.type = 'button'; b.className = 'lvl' + (open ? '' : ' locked');
        b.appendChild(preview(lay, 160, 120));
        const info = document.createElement('div');
        info.innerHTML = '<b>' + w.id + '-' + (i + 1) + ' · ' + esc(lay.name) + '</b><br>' + starsHtml(rec ? rec.s : 0) +
          '<br><small>' + lay.count + ' Steine · ⏱ ' + fmtTime(l.par) + (rec && rec.t ? ' · Best ' + fmtTime(rec.t) : '') + '</small>' + (open ? '' : '<br><small>🔒 gesperrt</small>');
        b.appendChild(info);
        b.onclick = () => { if (!open) { a.sfx('blocked'); this.toast('Schaffe zuerst das Level davor.'); return; } a.sfx('click'); a.startLevel(l); };
        grid.appendChild(b);
      });
    },
    // ---------- Freies Spiel ----------
    r_scrFree() {
      const a = this.app, grid = $('layoutGrid'); grid.innerHTML = '';
      document.querySelectorAll('[data-sort]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.sort === this.sort)); });
      const list = L.LAYOUTS.slice().sort((p, q) => this.sort === 'name' ? p.name.localeCompare(q.name, 'de') : p.count - q.count);
      list.forEach(lay => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tile-card';
        b.appendChild(preview(lay, 160, 120));
        const best = a.save.d.best[lay.id];
        const info = document.createElement('div');
        info.innerHTML = '<b>' + esc(lay.name) + '</b><br><small>' + lay.count + ' Steine · ' + lay.layers + ' Ebenen' + (a.save.d.seen[lay.id] ? ' · ✔' : '') + '</small>' + (best ? '<br><small>Bestwert ' + best + '</small>' : '');
        b.appendChild(info);
        b.onclick = () => { a.sfx('click'); a.startFree(lay.id); };
        grid.appendChild(b);
      });
    },
    // ---------- Tagesrätsel ----------
    r_scrDaily() {
      const a = this.app, d = a.save.d.daily, key = a.today(), def = L.dailyFor(key), lay = L.BY_ID[def.layout], done = !!d.done[key];
      const box = $('dailyBox'); box.innerHTML = '';
      const days = []; for (let i = 13; i >= 0; i--) { const k = a.dayKey(-i); days.push('<span class="' + (d.done[k] ? 'ok ' : '') + (i === 0 ? 'today' : '') + '" title="' + k.slice(6) + '.' + k.slice(4, 6) + '.">' + (+k.slice(6)) + '</span>'); }
      box.innerHTML = '<h3 style="margin:0 0 6px">Heute: ' + esc(lay.name) + '</h3><p class="muted">Ein Brett für alle – jeden Tag neu gemischt, immer lösbar. ' + lay.count + ' Steine, Zielzeit ' + fmtTime(def.par) + '.</p>' +
        '<div class="daily-cal">' + days.join('') + '</div>' +
        '<p>Serie: <b>' + d.streak + '</b> Tage · Beste Serie: <b>' + d.bestStreak + '</b>' + (done ? ' · Heute: <b>' + d.done[key] + ' Punkte</b> ✔' : '') + '</p>';
      const cv = preview(lay, 420, 315); cv.className = 'preview'; box.appendChild(cv);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn primary big'; b.style.width = '100%';
      b.textContent = done ? '🔁 Nochmal spielen (zählt nicht zur Serie)' : '▶ Tagesrätsel starten';
      b.onclick = () => { a.sfx('click'); a.startDaily(); };
      box.appendChild(b);
    },
    // ---------- Zeitjagd ----------
    r_scrBlitz() {
      const a = this.app, bz = a.save.d.blitz, box = $('blitzBox');
      box.innerHTML = '<h3 style="margin:0 0 6px">Gegen die Uhr</h3><p>Du startest mit <b>2:30</b>. Jedes Paar bringt <b>+3 s</b>, jedes abgeräumte Brett <b>+30 s</b> – dann kommt sofort das nächste. Hängst du fest, wird kostenlos gemischt (kostet 10 s). Wie viele Punkte schaffst du, bevor die Zeit abläuft?</p>' +
        '<p>Rekord: <b>' + bz.best + '</b> Punkte · Meiste Bretter: <b>' + bz.boards + '</b></p>';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn primary big'; b.style.width = '100%'; b.textContent = '▶ Zeitjagd starten';
      b.onclick = () => { a.sfx('click'); a.startBlitz(); };
      box.appendChild(b);
    },
    // ---------- Erfolge & Statistik ----------
    r_scrStats() {
      const a = this.app, s = a.save.d.stats, d = a.save.d;
      const rate = s.games ? Math.round(s.wins / s.games * 100) : 0;
      const items = [['Partien', s.games], ['Gewonnen', s.wins + ' (' + rate + ' %)'], ['Paare', s.pairs], ['Spielzeit', Math.round(s.time / 60) + ' min'],
        ['Beste Kombo', s.bestCombo + '×'], ['Ohne Hilfe gewonnen', s.perfect], ['Schnellstes 144er', s.fast144 ? fmtTime(s.fast144) : '–'],
        ['Sterne', a.save.stars() + ' / ' + L.LEVELS.length * 3], ['Tagesserie', d.daily.streak + ' (Best ' + d.daily.bestStreak + ')'],
        ['Zeitjagd-Rekord', d.blitz.best], ['Layouts geschafft', Object.keys(d.seen).length + ' / ' + L.LAYOUTS.length], ['Tipps / Mischen', s.hints + ' / ' + s.shuffles]];
      $('statGrid').innerHTML = items.map(i => '<div class="stat"><small>' + i[0] + '</small><b>' + i[1] + '</b></div>').join('');
      const A = root.MJSave.ACH;
      $('achCount').textContent = '🏆 ' + Object.keys(d.ach).length + ' / ' + A.length;
      $('achList').innerHTML = A.map(x => '<div class="ach' + (d.ach[x.id] ? '' : ' off') + '"><span class="ic">' + x.icon + '</span><span><b>' + esc(x.title) + '</b><small>' + esc(x.desc) + '</small></span></div>').join('') +
        '<div class="ach"><span class="ic">🧹</span><span><b>Spielstand zurücksetzen</b><small>Löscht Sterne, Bestwerte, Erfolge und Statistik (Einstellungen bleiben).</small><br><button class="btn small" type="button" id="btnReset">Zurücksetzen …</button></span></div>';
      $('btnReset').onclick = () => this.modal('Wirklich zurücksetzen?', '<p>Alle Sterne, Bestwerte, Erfolge und die Statistik werden gelöscht. Das lässt sich nicht rückgängig machen.</p>', [
        { label: 'Ja, alles löschen', fn: () => { a.save.reset(); this.toast('Spielstand zurückgesetzt'); this.show('scrStats'); } },
        { label: 'Abbrechen', primary: true }], { cancel: null });
    },
    // ---------- Einstellungen ----------
    r_scrSettings() {
      const a = this.app, o = a.save.opt, box = $('settingsBox');
      const themes = [['auto', 'Je Welt'], ['jade', 'Jade'], ['bambus', 'Bambus'], ['lotus', 'Lotus'], ['kirsche', 'Kirsche'], ['drache', 'Drache'], ['mond', 'Mond'], ['tempel', 'Tempel'], ['kaiser', 'Kaiser']];
      const backs = [['jade', 'Jade'], ['rubin', 'Rubin'], ['saphir', 'Saphir'], ['gold', 'Gold'], ['ebenholz', 'Ebenholz']];
      const ch = (key, list) => '<div class="choices">' + list.map(c => '<button type="button" data-opt="' + key + '" data-val="' + c[0] + '" aria-pressed="' + (String(o[key]) === String(c[0])) + '">' + c[1] + '</button>').join('') + '</div>';
      const onoff = key => ch(key, [[true, 'An'], [false, 'Aus']]);
      box.innerHTML =
        '<div class="opt"><span>Soundeffekte</span><input type="range" min="0" max="1" step="0.05" value="' + o.sfx + '" data-range="sfx" aria-label="Lautstärke Soundeffekte"></div>' +
        '<div class="opt"><span>Musik</span><input type="range" min="0" max="1" step="0.05" value="' + o.music + '" data-range="music" aria-label="Lautstärke Musik"></div>' +
        '<div class="opt"><span>Steinbilder<small>„Klar“ zeigt große Zahlen – gut auf kleinen Bildschirmen</small></span>' + ch('style', [['classic', 'Klassisch'], ['clear', 'Klar']]) + '</div>' +
        '<div class="opt"><span>Hilfszeichen<small>kleine Zahl/Buchstabe in der Ecke jedes Steins</small></span>' + onoff('index') + '</div>' +
        '<div class="opt"><span>Blockierte Steine abdunkeln<small>freie Steine sind sofort erkennbar</small></span>' + onoff('dim') + '</div>' +
        '<div class="opt"><span>Passende Steine zeigen<small>nach dem Antippen leuchten freie Partner auf (zählt nicht als Tipp)</small></span>' + onoff('showMatch') + '</div>' +
        '<div class="opt"><span>Immer lösbar mischen<small>Freies Spiel und Zen: aus = echter Zufall, kann unlösbar sein</small></span>' + onoff('solvable') + '</div>' +
        '<div class="opt"><span>Hinweis bei „keine Züge“<small>meldet sofort, wenn kein Paar mehr frei ist</small></span>' + onoff('autoHint') + '</div>' +
        '<div class="opt"><span>Tisch</span>' + ch('theme', themes) + '</div>' +
        '<div class="opt"><span>Steinrücken</span>' + ch('back', backs) + '</div>' +
        '<div class="opt"><span>Blickwinkel<small>flacher = mehr 3D, steiler = bessere Übersicht</small></span>' + ch('pitch', [[10, 'Von oben'], [24, 'Normal'], [38, 'Flach']]) + '</div>' +
        '<div class="opt"><span>Grafik<small>„Sparsam“ schont Akku und ältere Geräte</small></span>' + ch('quality', [['auto', 'Automatisch'], ['hoch', 'Hoch'], ['mittel', 'Mittel'], ['sparsam', 'Sparsam']]) + '</div>' +
        '<div class="opt"><span>Linkshänder<small>Knöpfe unten gespiegelt</small></span>' + onoff('left') + '</div>';
      box.querySelectorAll('[data-opt]').forEach(b => {
        b.onclick = () => {
          const k = b.dataset.opt, raw = b.dataset.val, v = raw === 'true' ? true : raw === 'false' ? false : (k === 'pitch' ? +raw : raw);
          a.setOpt(k, v); a.sfx('click');
          b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        };
      });
      box.querySelectorAll('[data-range]').forEach(r => {
        r.oninput = () => a.setOpt(r.dataset.range, +r.value);
        r.onchange = () => a.sfx('match', 1);
      });
    },
    // ---------- Anleitung ----------
    r_scrGuide() {
      const a = this.app, th = f => '<canvas data-face="' + f + '"></canvas>';
      $('guideBody').innerHTML =
        '<div class="card"><h3>Ziel</h3><p>Räume alle Steine vom Brett, indem du jeweils <b>zwei gleiche, freie Steine</b> antippst. Sind alle Paare weg, hast du gewonnen.</p>' +
        '<h3>Wann ist ein Stein frei?</h3><ul><li>Es liegt <b>kein Stein darauf</b> (auch nicht halb).</li><li>Und er hat <b>links oder rechts</b> keinen direkten Nachbarn – mindestens eine lange Seite muss frei sein.</li></ul>' +
        '<p class="muted">Blockierte Steine sind abgedunkelt (abschaltbar). Tippst du einen blockierten Stein an, wackelt er.</p>' +
        '<h3>Welche Steine passen?</h3><p>Gleiche Bilder passen zusammen. Ausnahme: <b>alle vier Blumen</b> passen untereinander, ebenso <b>alle vier Jahreszeiten</b>.</p>' +
        '<div class="tiles">' + th(0) + th(4) + th(8) + '<span>Kreise 1–9</span>' + th(9) + th(13) + th(17) + '<span>Bambus 1–9</span>' + th(18) + th(22) + th(26) + '<span>Zeichen 1–9</span></div>' +
        '<div class="tiles">' + th(27) + th(28) + th(29) + th(30) + '<span>Winde</span>' + th(31) + th(32) + th(33) + '<span>Drachen</span></div>' +
        '<div class="tiles">' + th(34) + th(35) + th(36) + th(37) + '<span>Blumen – passen alle zusammen</span>' + th(38) + th(39) + th(40) + th(41) + '<span>Jahreszeiten – passen alle zusammen</span></div>' +
        '<h3>Hilfen</h3><ul><li><b>💡 Tipp</b> zeigt ein freies Paar (−20 Punkte).</li><li><b>↶ Zurück</b> nimmt Züge zurück, so oft du willst.</li><li><b>🔀 Mischen</b> verteilt die restlichen Steine neu, und zwar immer lösbar (−50 Punkte).</li></ul>' +
        '<h3>Punkte, Kombos und Sterne</h3><p>Jedes Paar bringt 10 Punkte. Folgt das nächste Paar innerhalb von 4,5 Sekunden, steigt die <b>Kombo</b> (bis 50 Punkte pro Paar). Am Ende gibt es Zeitbonus und +250 für einen Sieg ohne Tipp, Mischen und Zurück.</p>' +
        '<p>Auf der Reise: ★ geschafft · ★★ unter der Zielzeit · ★★★ unter der Zielzeit ohne Tipp und Mischen.</p>' +
        '<h3>Spielarten</h3><ul><li><b>Reise:</b> 48 Level in 8 Welten, jede Welt mit eigenem Tisch.</li><li><b>Freies Spiel:</b> alle 29 Layouts frei wählbar.</li><li><b>Tagesrätsel:</b> jeden Tag ein neues Brett, Serie sammeln.</li><li><b>Zeitjagd:</b> Bretter gegen die Uhr.</li><li><b>Zen:</b> ohne Uhr und Punkte, Bretter folgen endlos, Mischen ist gratis.</li></ul>' +
        '<h3>Steuerung</h3><ul><li><b>Touch:</b> Stein antippen. Mit zwei Fingern zoomen und drehen, gezoomt mit einem Finger verschieben, Doppeltippen auf den Tisch zoomt.</li>' +
        '<li><b>Maus:</b> Klick wählt, Mausrad zoomt, rechte Maustaste gedrückt halten dreht die Ansicht.</li>' +
        '<li><b>Tastatur:</b> <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> springen zwischen freien Steinen, <kbd>Enter</kbd>/<kbd>Leertaste</kbd> wählt, <kbd>H</kbd> Tipp, <kbd>U</kbd> Zurück, <kbd>R</kbd> Mischen, <kbd>+</kbd>/<kbd>−</kbd> Zoom, <kbd>Q</kbd>/<kbd>E</kbd> drehen, <kbd>V</kbd> Ansicht, <kbd>M</kbd> Ton, <kbd>F</kbd> Vollbild, <kbd>P</kbd>/<kbd>Esc</kbd> Pause.</li>' +
        '<li><b>Gamecontroller:</b> Steuerkreuz/linker Stick springen, <b>A</b> wählt, <b>B</b> abwählen/Pause, <b>X</b> Tipp, <b>Y</b> Zurück, <b>Select</b> Mischen, <b>LB/RB</b> drehen, <b>LT/RT</b> Zoom, rechter Stick verschieben, <b>Start</b> Pause.</li></ul></div>';
      const atlas = a.atlasCanvas;
      $('guideBody').querySelectorAll('canvas[data-face]').forEach(c => { const t = root.MJFaces.thumb(atlas, +c.dataset.face, 76); c.width = t.width; c.height = t.height; c.getContext('2d').drawImage(t, 0, 0); c.title = root.MJFaces.name(+c.dataset.face); });
    },
    r_scrCloud() {
      $('cloudNote').textContent = root.AnMaChaCloud ? '' : 'Der Google-Speicher ist gerade nicht verfügbar (z. B. offline). Dein Fortschritt bleibt auf diesem Gerät gespeichert.';
    }
  };

  root.MJUI = { UI, fmtTime, starsHtml, preview, esc };
})(window);
