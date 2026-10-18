/* AnMaCha UNDERCOVER 3D – Spieloberfläche während der Missionsmodi (DOM über der 3D-Welt).
   AMU.HUD.create(el, { onAction(name), touch }) → hud
     hud.update(view, ctx)   view = viewFor(ich), ctx = AMU.HUD.context(view, grid) (wird höchstens ~8× pro Sekunde neu gezeichnet)
     hud.toggleTasks(), hud.openMap(view), hud.sabMenu(view, send), hud.cams(list), hud.destroy()
   AMU.HUD.context(view, grid) ermittelt, was gerade in Reichweite ist (Aufgabe, Melden, Ziel …). Der Gastgeber prüft
   trotzdem jede Aktion – die Anzeige ist nur eine Hilfe. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const esc = s => AMU.U.esc(s);
  const R = { use: 1.5, kill: 1.6, report: 2.6, button: 1.9, vent: 1.1, ability: 3.0, shield: 2.6, tag: 1.25, rescue: 1.7, hide: 1.2, clue: 1.4 };
  const SAB_N = { lights: '💡 Licht aus', comms: '📻 Funkstille', crit: '🚨 Sendeausfall', mixer: '🎛️ Mischpult', tower: '🗼 Sendeturm', doors: '🚪 Türen' };
  const fmt = ms => AMU.U.fmtTime(ms);
  const d2 = (a, x, y) => Math.hypot(a.x - x, a.y - y);

  /** Was kann ich gerade tun? (nur Anzeige; entscheidet nichts) */
  function context(v, grid) {
    const me = v.me, map = AMU.mapById(v.map), mode = AMU.modeById(v.mode), f = mode.flags;
    const role = AMU.ROLES[me.role] || {}, c = { use: null, report: null, special: null, vent: false, sab: false, ability: null, sprint: false };
    const los = (x, y) => !grid || grid.los(me.x, me.y, x, y);
    const alive = me.alive && !me.ghost && !me.out;
    if (v.phase !== 'play' || me.busy || me.caught || me.escaped) return c;
    const mates = new Set(v.mates || []);
    const others = (v.players || []).filter(p => p.alive && !p.ghost);
    const nearest = (list, r) => { let b = null, bd = r; list.forEach(p => { const d = d2(me, p.x, p.y); if (d <= bd && los(p.x, p.y)) { bd = d; b = p; } }); return b; };
    // Aufgaben (auch Geister erledigen ihre Aufgaben)
    const tk = (me.tasks || []).find(t => !t.done && map.stations[t.sid] && d2(me, map.stations[t.sid].at[0], map.stations[t.sid].at[1]) <= R.use && los(map.stations[t.sid].at[0], map.stations[t.sid].at[1]));
    if (f.hunt) {
      const ext = v.ext || {};
      if (me.team === 'runner') {
        if (me.hidden) c.use = { label: 'Versteck verlassen', icon: '🚪' };
        else if ((ext.beacons || []).some(b => !b.on && d2(me, b.x, b.y) <= R.use)) c.use = { label: 'Funkbake aktivieren', icon: '📶' };
        else if (ext.cage && d2(me, ext.cage[0], ext.cage[1]) <= R.rescue + 1 && (ext.caught || []).length) c.use = { label: 'Befreien', icon: '🔓' };
        else if ((ext.hides || []).some(h => d2(me, h[0], h[1]) <= R.hide)) c.use = { label: 'Verstecken', icon: '📦' };
        c.special = me.hidden ? { label: 'Rauskommen', icon: '🚪', act: { a: 'unhide' } } : ((ext.hides || []).some(h => d2(me, h[0], h[1]) <= R.hide) ? { label: 'Verstecken', icon: '📦', act: { a: 'hide' } } : null);
        c.sprint = { label: 'Sprinten', cd: me.cd.sprint || 0 };
      } else if (me.team === 'hunter') {
        const t = nearest(others.filter(p => !p.caught && (v.roster.find(r => r.id === p.id) || {}).team !== 'hunter'), R.tag);
        c.special = { label: 'Fangen', icon: '✋', act: t ? { a: 'tag', target: t.id } : null, cd: me.cd.tag || 0, target: t && t.id };
        if ((ext.hides || []).some(h => d2(me, h[0], h[1]) <= R.hide + 0.4)) c.use = { label: 'Versteck durchsuchen', icon: '🔎' };
        c.ability = { label: 'Ortungsimpuls', icon: '📡', act: { a: 'pulse' }, cd: me.cd.pulse || 0 };
        c.sprint = { label: 'Sprinten', cd: me.cd.sprint || 0 };
      }
      return c;
    }
    // Reparatur
    const sabs = (v.sab && v.sab.list) || [];
    const rep = sabs.some(s => (s.pts || []).some(p => !p.done && d2(me, p.x, p.y) <= R.use));
    if (rep && me.team !== 'traitor') c.use = { label: 'Reparieren', icon: '🔧' };
    else if (rep && alive && !f.chaos) c.use = { label: 'Reparatur vortäuschen', icon: '🔧' };
    else if (tk) c.use = { label: me.team === 'crew' ? 'Aufgabe: ' + ((AMU.Tasks && AMU.Tasks.byId(tk.t)) || { name: tk.t }).name : 'Aufgabe vortäuschen', icon: '🛠️' };
    // Detektiv: Spuren
    const ext = v.ext || {};
    if (f.evidence && alive) {
      const sp = (ext.spots || []).find(s => !s.found && d2(me, s.x, s.y) <= R.clue);
      if (sp && me.role === 'detective') c.use = { label: 'Spur untersuchen', icon: '🔍' };
      if (me.team === 'traitor' && ext.tamper > 0 && (ext.spots || []).some(s => !s.t && d2(me, s.x, s.y) <= R.clue)) c.use = { label: 'Spur manipulieren (' + ext.tamper + ')', icon: '🧤', what: 'tamper' };
    }
    // Besonderheiten der Karte
    if (!c.use && alive) (map.features || []).forEach(ft => {
      if (ft.type === 'lift' && (d2(me, ft.a[0], ft.a[1]) <= R.use || d2(me, ft.b[0], ft.b[1]) <= R.use)) c.use = { label: 'Aufzug', icon: '🛗', what: 'lift' };
      if (ft.type === 'cams' && d2(me, ft.at[0], ft.at[1]) <= R.use) c.use = { label: 'Kameras ansehen', icon: '📹', what: 'cams' };
    });
    // Melden / Notruf
    if (alive && f.meetings) {
      const b = (v.bodies || []).find(x => d2(me, x.x, x.y) <= R.report && los(x.x, x.y));
      if (b) c.report = { label: 'Melden', icon: '📣', act: { a: 'report', body: b.id } };
      else if (d2(me, map.button[0], map.button[1]) <= R.button) c.report = { label: 'Notruf (' + me.uses + ')', icon: '🚨', act: { a: 'button' }, off: me.uses <= 0 || sabs.some(s => s.type === 'crit') };
    }
    // Verräter
    if (alive && me.team === 'traitor') {
      if (f.kills) {
        const t = nearest(others.filter(p => !mates.has(p.id)), R.kill);
        c.special = { label: 'Ausknipsen', icon: '🎭', act: t ? { a: 'kill', target: t.id } : null, cd: me.cd.kill || 0, target: t && t.id };
      }
      if (f.vents) c.vent = (map.vents || []).some(q => d2(me, q[0], q[1]) <= R.vent || d2(me, q[2], q[3]) <= R.vent);
      if (f.sab) c.sab = { cd: (v.sab && v.sab.cd) || 0 };
    }
    // Sonderfähigkeiten
    if (alive && role.abil) {
      const cd = me.cd.abil || 0;
      if (role.abil === 'scan' && !f.evidence) { const t = nearest(others, R.ability); c.ability = { label: 'Prüfen', icon: '🔍', act: t ? { a: 'ability', target: t.id } : null, cd, target: t && t.id }; }
      if (role.abil === 'shield') { const t = nearest(others, R.shield); c.ability = { label: 'Schützen', icon: '🛡️', act: t ? { a: 'ability', target: t.id } : null, cd, target: t && t.id }; }
      if (role.abil === 'courier') c.ability = { label: me.pkg ? 'Paket abgeben' : 'Paket holen', icon: '📦', act: { a: 'ability' }, cd: me.pkg ? 0 : cd };
      if (role.abil === 'jam') c.ability = { label: 'Stören', icon: '📡', act: { a: 'ability' }, cd };
      if (role.abil === 'shift') {
        const pool = v.roster.filter(r => r.id !== me.id && !r.dead && !mates.has(r.id));
        const t = nearest(others.filter(p => !mates.has(p.id)), 8) || pool[0];
        c.ability = { label: 'Verwandeln', icon: '🦎', act: t ? { a: 'ability', target: t.id } : null, cd, target: t && t.id };
      }
    }
    return c;
  }

  function roleText(v) {
    const R0 = AMU.ROLES[v.me.role] || AMU.ROLES.crew;
    return R0.icon + ' ' + R0.n;
  }
  function names(v) { const n = {}; (v.roster || []).forEach(r => { n[r.id] = r.n; }); return n; }

  function create(el, opt) {
    opt = opt || {};
    el.innerHTML =
      '<div class="hud-tl"><button class="hud-role" data-h="role"></button><div class="hud-tasks" hidden></div></div>' +
      '<div class="hud-tc"><div class="hud-bar" hidden><i></i><span></span></div><div class="hud-info"></div><div class="hud-sab"></div></div>' +
      '<div class="hud-tr"><canvas class="hud-mini" width="150" height="104" data-h="map" aria-label="Karte öffnen"></canvas><div class="hud-btns"><button class="hud-b" data-h="tasks" aria-label="Aufgaben">📋</button><button class="hud-b" data-h="map" aria-label="Karte">🗺</button><button class="hud-b" data-h="menu" aria-label="Pause">☰</button></div></div>' +
      '<div class="hud-busy" hidden><b></b><div class="hud-bbar"><i></i></div><button class="ui-btn ui-sm" data-h="cancel">Abbrechen</button></div>' +
      '<div class="hud-ctx"></div>';
    el.hidden = false;
    const $ = s => el.querySelector(s);
    const els = { role: $('.hud-role'), tasks: $('.hud-tasks'), bar: $('.hud-bar'), barI: $('.hud-bar i'), barT: $('.hud-bar span'), info: $('.hud-info'), sab: $('.hud-sab'),
      mini: $('.hud-mini'), busy: $('.hud-busy'), busyT: $('.hud-busy b'), busyI: $('.hud-bbar i'), ctx: $('.hud-ctx') };
    const onClick = e => { const b = e.target.closest('[data-h]'); if (!b) return; if (AMU.Audio) AMU.Audio.sfx('click'); opt.onAction && opt.onAction(b.dataset.h); };
    el.addEventListener('click', onClick);
    let last = 0, cache = {}, showTasks = !(AMU.Touch && AMU.Touch.isTouch()), busyMax = {};
    els.tasks.hidden = !showTasks;
    const set = (k, node, html) => { if (cache[k] !== html) { cache[k] = html; node.innerHTML = html; } };

    function update(v, ctx, force) {
      const now = performance.now(); if (!force && now - last < 120) return; last = now;
      const me = v.me, mode = AMU.modeById(v.mode), map = AMU.mapById(v.map), ext = v.ext || {}, nm = names(v);
      // Rolle
      let rt = roleText(v);
      if (!me.alive || me.ghost) rt += ' · 👻 Geist';
      if (me.out) rt += ' · ausgeschieden';
      if (me.escaped) rt += ' · entkommen';
      if (me.caught) rt += ' · gefangen';
      if ((v.mates || []).length) rt += ' · Team: ' + v.mates.map(id => esc(nm[id] || '?')).join(', ');
      set('role', els.role, rt);
      // Aufgaben
      let th = '';
      if (mode.flags.hunt) {
        th = '<b>Ziele</b><ul>' + (me.team === 'runner'
          ? '<li>📶 Funkbaken: ' + (ext.beacons || []).filter(b => b.on).length + '/' + ext.need + '</li><li>' + (ext.exits ? '🚪 Ausgänge offen – fliehen!' : ext.exitsIn ? '🚪 Ausgänge öffnen in ' + fmt(ext.exitsIn) : '🚪 Ausgänge noch zu') + '</li><li>🏃 Entkommen: ' + (ext.escaped || []).length + '/' + ext.needed + '</li>' + ((ext.caught || []).length ? '<li>🔒 Gefangen: ' + ext.caught.map(id => esc(nm[id])).join(', ') + '</li>' : '')
          : '<li>✋ Fange die Flüchtenden</li><li>🔒 Gefangen: ' + (ext.caught || []).length + '</li><li>🏃 Entkommen: ' + (ext.escaped || []).length + ' (Ziel der Flüchtenden: ' + ext.needed + ')</li>') + '</ul>';
      } else if (me.tasks && me.tasks.length) {
        th = '<b>' + (me.team === 'crew' ? 'Aufgaben' : 'Tarnaufgaben (bringen nichts)') + '</b><ul>' + me.tasks.map(t => {
          const D = (AMU.Tasks && AMU.Tasks.byId(t.t)) || { name: t.t, icon: '•' }, st = map.stations[t.sid];
          const room = st && map.rooms.find(r => st.at[0] >= r.r[0] && st.at[0] < r.r[0] + r.r[2] && st.at[1] >= r.r[1] && st.at[1] < r.r[1] + r.r[3]);
          return '<li class="' + (t.done ? 'done' : '') + '">' + (t.done ? '✔' : D.icon) + ' ' + esc(D.name) + ' <small>' + esc(room ? room.n : '') + '</small></li>';
        }).join('') + '</ul>';
        if (ext.casefile && ext.casefile.length) th += '<b>Fallakte</b><ul>' + ext.casefile.slice(-6).map(c => '<li><small>' + esc(AMU.Evidence.text(c, nm, map.rooms.map(r => r.n))) + '</small></li>').join('') + '</ul>';
        if (ext.case && me.role === 'detective') th += '<p class="hud-small">🔍 ' + esc(ext.case.n) + ': untersuche Spuren in der Nähe von Fundorten.</p>';
      }
      set('tasks', els.tasks, th);
      // Balken
      let bar = null;
      if (v.bar) bar = [v.bar.total ? v.bar.done / v.bar.total : 0, 'Aufgaben ' + Math.round((v.bar.total ? v.bar.done / v.bar.total : 0) * 100) + ' %'];
      if (v.mode === 'chaos') bar = [(ext.quality || 0) / 100, 'Sendequalität ' + (ext.quality || 0) + ' %'];
      if (mode.flags.hunt) bar = [ext.need ? (ext.beacons || []).filter(b => b.on).length / ext.need : 0, 'Funkbaken ' + (ext.beacons || []).filter(b => b.on).length + '/' + ext.need];
      els.bar.hidden = !bar;
      if (bar) { const w = Math.round(bar[0] * 100) + '%'; if (cache.barW !== w) { cache.barW = w; els.barI.style.width = w; } set('barT', els.barT, esc(bar[1])); }
      // Info: Timer, Phase, Modus
      let info = '';
      if (v.phase === 'intro') info = 'Start in ' + Math.ceil(v.left / 1000) + ' s';
      if (v.timer != null) info += (info ? ' · ' : '') + '⏱ ' + fmt(v.timer);
      if (mode.flags.hunt && ext.freeze) info += ' · Jäger starten in ' + Math.ceil(ext.freeze / 1000) + ' s';
      if (ext.danger) info += ' · <b class="hud-warn">⚠ Jäger in der Nähe!</b>';
      if (ext.pulse) info += ' · 📡 Ortung aktiv';
      if (v.mode === 'chaos' && ext.orders) info += ' · ' + ext.orders.filter(o => !o.done).map(o => esc(o.n) + ' ' + o.prog + '/' + o.goal).join(' · ');
      if (me.jam) info += ' · 📡 gestört';
      if (me.shield) info += ' · 🛡️ geschützt';
      if (me.disguise) info += ' · 🦎 verwandelt als ' + esc(nm[me.disguise] || '?');
      if (v.feat && v.feat.dark) info += ' · 🌑 Dunkelphase';
      set('info', els.info, info);
      // Sabotage
      const sabs = (v.sab && v.sab.list) || [];
      set('sab', els.sab, sabs.map(s => '<div class="hud-alert' + (s.type === 'crit' ? ' crit' : '') + '">' + (SAB_N[s.type] || s.type) + (s.room != null && s.type === 'doors' ? ' ' + esc((map.rooms[s.room] || {}).n || '') : '') +
        (s.left ? ' · ' + fmt(s.left) : '') + (s.pts && s.pts.length > 1 ? ' · ' + s.pts.filter(p => p.done).length + '/' + s.pts.length + ' gleichzeitig' : '') + '</div>').join(''));
      // Beschäftigt
      const b = me.busy;
      if (b && b.kind !== 'task' && b.kind !== 'repair') {
        els.busy.hidden = false;
        const key = b.kind + (b.sid || '');
        busyMax[key] = Math.max(busyMax[key] || 0, b.left);
        const lbl = { fake: 'Tust beschäftigt …', beacon: 'Funkbake wird aktiviert …', investigate: 'Untersuche Spur …', pickup: 'Paket wird geholt …', tamper: 'Manipuliere Spur …' }[b.kind] || 'Beschäftigt …';
        set('busyT', els.busyT, lbl);
        els.busyI.style.width = Math.round((1 - b.left / (busyMax[key] || 1)) * 100) + '%';
      } else { els.busy.hidden = true; busyMax = {}; }
      // Kontext-Hinweise (Tastatur / Controller)
      const dev = opt.device ? opt.device() : 'keyboard';
      if (dev !== 'touch') {
        const K = dev === 'pad' ? { use: 'A', report: 'X', special: 'B', vent: 'RB', sab: 'LT', ability: 'LB', sprint: 'RT' } : { use: 'E', report: 'F', special: 'Leer', vent: 'V', sab: 'G', ability: 'T', sprint: '⇧' };
        if (dev === 'pad') K.ability = 'Y↑';
        const parts = [];
        if (ctx.use) parts.push([K.use, ctx.use.icon + ' ' + ctx.use.label]);
        if (ctx.report) parts.push([K.report, ctx.report.icon + ' ' + ctx.report.label]);
        if (ctx.special) parts.push([K.special, ctx.special.icon + ' ' + ctx.special.label + (ctx.special.cd ? ' (' + Math.ceil(ctx.special.cd / 1000) + ' s)' : !ctx.special.act ? ' – kein Ziel' : '')]);
        if (ctx.vent) parts.push([K.vent, '🕳 Geheimgang']);
        if (ctx.sab) parts.push([K.sab, '⚡ Sabotage' + (ctx.sab.cd ? ' (' + Math.ceil(ctx.sab.cd / 1000) + ' s)' : '')]);
        if (ctx.ability) parts.push([dev === 'pad' ? 'Y' : K.ability, ctx.ability.icon + ' ' + ctx.ability.label + (ctx.ability.cd ? ' (' + Math.ceil(ctx.ability.cd / 1000) + ' s)' : '')]);
        if (ctx.sprint) parts.push([K.sprint, '💨 Sprint' + (ctx.sprint.cd ? ' (' + Math.ceil(ctx.sprint.cd / 1000) + ' s)' : '')]);
        set('ctx', els.ctx, parts.map(p => '<span><kbd>' + esc(p[0]) + '</kbd>' + esc(p[1]) + '</span>').join(''));
      } else set('ctx', els.ctx, '');
      // Touch-Knöpfe
      if (opt.touch) {
        const btn = [];
        btn.push({ id: 'use', label: ctx.use ? ctx.use.label : 'Benutzen', icon: ctx.use ? ctx.use.icon : '✋', enabled: !!ctx.use, primary: true });
        if (mode.flags.meetings) btn.push({ id: 'report', label: ctx.report ? ctx.report.label : 'Melden', icon: ctx.report ? ctx.report.icon : '📣', enabled: !!(ctx.report && !ctx.report.off) });
        if (ctx.special) btn.push({ id: 'special', label: ctx.special.label, icon: ctx.special.icon, enabled: !!ctx.special.act && !ctx.special.cd, cd: cdFrac(ctx.special.cd, 30000) });
        if (ctx.sprint) btn.push({ id: 'sprint', label: 'Sprint', icon: '💨', enabled: !ctx.sprint.cd, cd: cdFrac(ctx.sprint.cd, 12000) });
        if (ctx.ability) btn.push({ id: 'ability', label: ctx.ability.label, icon: ctx.ability.icon, enabled: !!ctx.ability.act && !ctx.ability.cd, cd: cdFrac(ctx.ability.cd, 45000) });
        if (me.team === 'traitor' && mode.flags.vents && me.alive) btn.push({ id: 'vent', label: 'Geheimgang', icon: '🕳', enabled: !!ctx.vent });
        if (ctx.sab) btn.push({ id: 'sab', label: 'Sabotage', icon: '⚡', enabled: !ctx.sab.cd, cd: cdFrac(ctx.sab.cd, 30000) });
        opt.touch.setButtons(btn.slice(0, 6));
      }
      drawMini(v);
    }
    function cdFrac(ms, max) { return ms > 0 ? Math.min(1, ms / max) : 0; }
    function drawMini(v) {
      const cv = els.mini, g = cv.getContext('2d'); if (!g) return;
      const me = v.me, map = AMU.mapById(v.map), W = cv.width, H = cv.height, s = Math.min(W / map.size[0], H / map.size[1]);
      const jam = me.jam || ((v.sab && v.sab.list) || []).some(x => x.type === 'comms') && me.team !== 'traitor';
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#0b1630cc'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#29d3ff33';
      map.rooms.forEach(r => g.fillRect(r.r[0] * s, r.r[1] * s, r.r[2] * s, r.r[3] * s));
      g.fillStyle = '#29d3ff22'; (map.halls || []).forEach(r => g.fillRect(r[0] * s, r[1] * s, r[2] * s, r[3] * s));
      if (jam) { g.fillStyle = '#a9bce0'; g.font = '11px system-ui'; g.fillText('Karte gestört', 6, H - 8); }
      else {
        g.fillStyle = '#ffd23f';
        (me.tasks || []).forEach(t => { if (t.done) return; const st = map.stations[t.sid]; if (st) g.fillRect(st.at[0] * s - 2, st.at[1] * s - 2, 4, 4); });
        g.fillStyle = '#ff5a5a';
        ((v.sab && v.sab.list) || []).forEach(x => (x.pts || []).forEach(p => { if (!p.done) { g.beginPath(); g.arc(p.x * s, p.y * s, 3.5, 0, 7); g.fill(); } }));
        const ext = v.ext || {};
        if (ext.beacons) { ext.beacons.forEach(b => { g.fillStyle = b.on ? '#3fd06b' : '#ff9a2e'; g.fillRect(b.x * s - 2, b.y * s - 2, 4, 4); }); }
        if (ext.exits && ext.exitPts) { g.fillStyle = '#3fd06b'; ext.exitPts.forEach(p => { g.beginPath(); g.arc(p[0] * s, p[1] * s, 4, 0, 7); g.fill(); }); }
      }
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(me.x * s, me.y * s, 3.5, 0, 7); g.fill();
    }
    function toggleTasks(on) { showTasks = on == null ? !showTasks : on; els.tasks.hidden = !showTasks; }
    function destroy() { el.removeEventListener('click', onClick); el.innerHTML = ''; el.hidden = true; }
    return { update, toggleTasks, destroy, el };
  }

  /** Große Karte (Fenster) */
  function openMap(v) {
    const map = AMU.mapById(v.map), me = v.me, W = 600, s = W / map.size[0], H = Math.round(map.size[1] * s);
    const jam = me.jam || ((v.sab && v.sab.list) || []).some(x => x.type === 'comms') && me.team !== 'traitor';
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="hud-bigmap" role="img" aria-label="Karte ' + esc(map.n) + '">';
    (map.halls || []).forEach(r => { svg += '<rect x="' + r[0] * s + '" y="' + r[1] * s + '" width="' + r[2] * s + '" height="' + r[3] * s + '" fill="#29d3ff22"/>'; });
    map.rooms.forEach(r => { svg += '<rect x="' + r.r[0] * s + '" y="' + r.r[1] * s + '" width="' + r.r[2] * s + '" height="' + r.r[3] * s + '" rx="6" fill="#29d3ff30" stroke="#29d3ff88"/><text x="' + (r.r[0] + r.r[2] / 2) * s + '" y="' + (r.r[1] + r.r[3] / 2) * s + '" fill="#e8f1ff" font-size="13" text-anchor="middle">' + esc(r.n) + '</text>'; });
    if (!jam) {
      (me.tasks || []).forEach(t => { if (t.done) return; const st = map.stations[t.sid]; if (st) svg += '<circle cx="' + st.at[0] * s + '" cy="' + st.at[1] * s + '" r="6" fill="#ffd23f"/>'; });
      ((v.sab && v.sab.list) || []).forEach(x => (x.pts || []).forEach(p => { if (!p.done) svg += '<circle cx="' + p.x * s + '" cy="' + p.y * s + '" r="8" fill="#ff5a5a"/>'; }));
      if (me.team === 'traitor') (map.vents || []).forEach(q => { svg += '<line x1="' + q[0] * s + '" y1="' + q[1] * s + '" x2="' + q[2] * s + '" y2="' + q[3] * s + '" stroke="#ff9a2e66" stroke-dasharray="4 4"/>'; });
      const ext = v.ext || {};
      (ext.beacons || []).forEach(b => { svg += '<rect x="' + (b.x * s - 6) + '" y="' + (b.y * s - 6) + '" width="12" height="12" fill="' + (b.on ? '#3fd06b' : '#ff9a2e') + '"/>'; });
      if (ext.exitPts) ext.exitPts.forEach(p => { svg += '<circle cx="' + p[0] * s + '" cy="' + p[1] * s + '" r="8" fill="' + (ext.exits ? '#3fd06b' : '#a9bce0') + '"/>'; });
      if (ext.cage) svg += '<rect x="' + (ext.cage[0] * s - 8) + '" y="' + (ext.cage[1] * s - 8) + '" width="16" height="16" fill="none" stroke="#ff5a5a" stroke-width="2"/>';
      svg += '<circle cx="' + map.button[0] * s + '" cy="' + map.button[1] * s + '" r="7" fill="none" stroke="#ff5a5a" stroke-width="2"/>';
    }
    svg += '<circle cx="' + me.x * s + '" cy="' + me.y * s + '" r="7" fill="#fff" stroke="#000"/></svg>';
    const legend = jam ? '<p class="ui-tag bad">📡 Karte gestört – keine Markierungen.</p>' : '<p class="ui-small ui-muted">⚪ du · 🟡 deine Aufgaben · 🔴 Reparatur · ⭕ Notrufpult' + (me.team === 'traitor' ? ' · gestrichelt: Geheimgänge' : '') + '</p>';
    return AMU.UI.modal('<h3 class="ui-h2">🗺 ' + esc(map.n) + '</h3>' + svg + legend, { cls: 'wide' });
  }
  /** Sabotage-Auswahl (nur Verräter) */
  function sabMenu(v, send) {
    const map = AMU.mapById(v.map), mode = AMU.modeById(v.mode), sabs = (v.sab && v.sab.list) || [];
    const types = ['lights', 'comms', 'doors'].concat(mode.flags.chaos ? ['mixer', 'tower', 'crit'] : ['crit']);
    const cd = (v.sab && v.sab.cd) || 0;
    const m = AMU.UI.modal('<h3 class="ui-h2">⚡ Sabotage</h3>' + (cd ? '<p class="ui-tag">Abklingzeit ' + Math.ceil(cd / 1000) + ' s</p>' : '') +
      '<div class="ui-grid">' + types.filter(t => t !== 'doors').map(t => '<button class="ui-btn" data-a="sab" data-v="' + t + '"' + (cd || sabs.some(s => s.type === t) ? ' disabled' : '') + '>' + SAB_N[t] + '</button>').join('') + '</div>' +
      '<h4>🚪 Türen verriegeln</h4><div class="ui-grid">' + map.rooms.map((r, i) => '<button class="ui-btn ui-sm" data-a="door" data-v="' + i + '"' + (cd ? ' disabled' : '') + '>' + esc(r.n) + '</button>').join('') + '</div>',
    { on: (a, val) => { if (a === 'sab') send({ a: 'sab', type: val }); else if (a === 'door') send({ a: 'sab', type: 'doors', room: +val }); m.close(); } });
    return m;
  }
  function cams(list, rosterNames) {
    return AMU.UI.modal('<h3 class="ui-h2">📹 Kamerapult</h3><ul class="ui-list">' + list.map(c => '<li><b>' + esc(c.n) + '</b><span>' + (c.ids.length ? c.ids.map(id => esc(rosterNames[id] || '?')).join(', ') : '<span class="ui-muted">leer</span>') + '</span></li>').join('') + '</ul><p class="ui-small ui-muted">Momentaufnahme – zeigt nur, wer gerade in welchem Raum ist.</p>');
  }

  AMU.HUD = { create, context, openMap, sabMenu, cams, names, R };
})(typeof window !== 'undefined' ? window : globalThis);
