/* Start, Lader, Spielschleife, Eingabe (Tastatur, Touch-Joystick, Controller über ../gamepad.js), HUD, Interaktionen,
   Hinweis-Warteschlange (Dialoge, Missionen, Kapitel, Ende), Autosave. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const BASE = './';
  // Ladereihenfolge mit Gewichten (Fortschrittsbalken); optional = darf fehlen
  const FILES = [
    ['../vendor/three-r128.min.js', 30], ['../vendor/qrcode-generator-1.4.4.js', 2, true],
    ['src/core/util.js', 1], ['src/core/i18n.js', 1],
    ['src/data/rubrics.js', 2], ['src/data/objects.js', 2], ['src/data/people.js', 2], ['src/data/districts.js', 2], ['src/data/economy.js', 2], ['src/data/missions.js', 3], ['src/data/quiz.js', 3], ['src/data/sounds.js', 1],
    ['src/sim/build.js', 2], ['src/sim/sim.js', 3], ['src/storage/save.js', 1], ['src/audio/audio.js', 1],
    ['src/minigames/registry.js', 1]
  ].concat(['p01-pegel', 'p02-mixer', 'p03-schnitt', 'p04-stoerung', 't01-kabel', 't02-router', 't03-kamera', 't04-akustik', 'q01-blitzquiz', 'q02-wahrquatsch', 'q03-schaetzduell', 'q04-geraeusche', 'r01-parken', 'r02-bahnhof', 'r03-navigation', 'r04-kurier', 'y01-mikrofangen', 'y02-beat', 'y03-spotlight', 'y04-konfetti', 'f01-hoererpost', 'f02-interview', 'f03-gutenachrichten', 'f04-geschenke'].map(f => ['src/minigames/' + f + '.js', 1]))
    .concat([['src/minigames/harness.js', 1], ['src/world/nav.js', 2, true], ['src/world/models.js', 4], ['src/world/world.js', 6],
      ['src/ui/ui-core.js', 1], ['src/ui/ui-panels.js', 2], ['src/ui/ui-prod.js', 2], ['src/ui/ui-build.js', 2], ['src/ui/ui-menu.js', 1], ['src/ui/editor.js', 3, true], ['src/party/online.js', 3, true]]);

  function loadScript(src, timeout) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = BASE + src + '?v=' + encodeURIComponent(root.PT_BUILD || '1'); s.async = false;
      const t = setTimeout(() => { s.onload = s.onerror = null; rej(new Error('Zeitüberschreitung: ' + src)); }, timeout || 25000);
      s.onload = () => { clearTimeout(t); res(); }; s.onerror = () => { clearTimeout(t); rej(new Error('Nicht geladen: ' + src)); };
      document.head.appendChild(s);
    });
  }
  async function boot() {
    const bar = document.getElementById('loadBar'), txt = document.getElementById('loadTxt');
    const total = FILES.reduce((t, f) => t + f[1], 0); let done = 0;
    for (const [src, w, optional] of FILES) {
      txt.textContent = 'Lade ' + src.replace(/^.*\//, '') + ' …';
      let ok = false, err = null;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        try { await loadScript(src, attempt ? 40000 : 25000); ok = true; } catch (e) { err = e; }
      }
      if (!ok && !optional) { showFatal('Eine Spieldatei fehlt oder konnte nicht geladen werden (' + src + '). Bitte Verbindung prüfen und neu laden.', err); return; }
      done += w; bar.style.width = Math.round(done / total * 100) + '%';
    }
    txt.textContent = 'Starte …';
    try { start(); } catch (e) { showFatal('Beim Start ist ein Fehler aufgetreten.', e); }
  }
  function showFatal(msg, e) {
    const l = document.getElementById('loading');
    l.innerHTML = '<div class="pt-fatal"><h2>😵 Ups</h2><p>' + msg + '</p>' + (e ? '<pre>' + String(e && e.message || e).replace(/</g, '&lt;') + '</pre>' : '') + '<button onclick="location.reload()">Neu laden</button> <a href="../index.html">← easygames</a></div>';
    if (e) console.error(e);
  }

  // ── Spielkontext ─────────────────────────────────────────
  let G, keys = {}, joy = { x: 0, y: 0, on: false }, lastT = 0, hudT = 0, fpsN = 0, fpsT = 0, fps = 0, nearCache = null, lastDist = null, busy = false, queue = Promise.resolve(), saver = null;
  function start() {
    const UI = PT.UI, S = PT.Sim, D = PT.DATA;
    const repo = PT.Save.create();
    const settings = repo.settings(UI.DEFAULT_SETTINGS); settings.keys = Object.assign({}, UI.DEFAULT_KEYS, settings.keys || {});
    G = PT.G = {
      st: null, world: null, repo, slot: null, mode: 'menu', hist: { undo: [], redo: [] },
      qualityFor(q) { if (q && q !== 'auto') return q; const small = Math.min(screen.width, screen.height) < 700, cores = navigator.hardwareConcurrency || 4; return small || cores <= 4 ? 'low' : 'mid'; },
      hud, afterAction, travel, loadSlot, startGame, toMenu, runMG, autosave: () => saver && saver.poke()
    };
    G.start = startGame;
    UI.applySettings(settings);
    // 3D-Welt
    const cv = document.getElementById('view');
    try { G.world = PT.World.create(cv, { quality: G.qualityFor(settings.quality) }); G.world.resize(innerWidth, innerHeight); }
    catch (e) { console.warn('3D nicht verfügbar', e); G.world = null; }
    if (G.world) {
      G.world.onContextLost && G.world.onContextLost(() => { UI.toast('Grafik wurde kurz unterbrochen …', 'bad', 5000); });
      G.world.onContextRestored && G.world.onContextRestored(() => { if (G.st) G.world.load(G.st); UI.toast('Grafik wieder da.', 'good'); });
    }
    addEventListener('resize', () => { G.world && G.world.resize(innerWidth, innerHeight); });
    saver = repo.autosaver(() => G.st, st => st.mode === 'creative' ? 'creative' : st.mode === 'challenge' ? 'challenge' : 'auto', 8000);
    addEventListener('pagehide', () => { if (G.st) saver.now(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G.st) saver.now(); });
    bindInput(); buildHud();
    document.getElementById('loading').remove();
    const q = new URLSearchParams(location.search), join = q.get('join');
    UI.mainMenu();
    if (join) UI.online(join.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
    if (!G.world) UI.toast('Dein Browser kann kein 3D (WebGL). Party, Online-Quizshow und 2D-Minispiele funktionieren trotzdem.', 'bad', 9000);
    requestAnimationFrame(loop);
  }

  // ── Spiel starten / laden ────────────────────────────────
  function startGame(o) {
    const UI = PT.UI, S = PT.Sim;
    if (!G.world) { UI.toast('Ohne 3D-Grafik kann die Karriere nicht starten.', 'bad'); UI.mainMenu(); return; }
    const st = S.create({ mode: o.mode, difficulty: o.difficulty, seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0, name: o.name, look: o.look, challenge: o.challenge, ngPlus: o.ngPlus });
    G.slot = o.mode === 'career' ? (o.slot || 'slot1') : null;
    enter(st);
    if (st.mode === 'career') {
      G.repo.save(G.slot, st);
      queue = queue.then(() => UI.chapter(1)).then(() => UI.dialogue([['marco', 'Hey ' + st.name + '! Komm rein, ich zeig dir das Studio.'], ['andrew', 'Lauf einfach zu Marco und drück ' + UI.keyName(UI.settings.keys.interact) + ' – oder tipp auf den Knopf unten rechts.']]));
    } else if (st.mode === 'challenge') {
      const c = S.challengeStatus(st); queue = queue.then(() => UI.dialogue([['marco', 'Herausforderung „' + c.c.name + '“: ' + c.c.desc], ['andrew', 'Wir haben ' + c.c.days + ' Tage. Los geht’s!']]));
    } else queue = queue.then(() => UI.dialogue([['andrew', 'Kreativmodus! Unbegrenztes Budget, alles freigeschaltet. Bau das Studio deiner Träume.']]));
  }
  function loadSlot(s) {
    const UI = PT.UI, r = G.repo.load(s);
    if (!r.ok) { UI.toast(r.empty ? 'Der Spielstand ist leer.' : 'Spielstand beschädigt – konnte nicht geladen werden.', 'bad'); UI.mainMenu(); return; }
    if (!G.world) { UI.toast('Ohne 3D-Grafik kann die Karriere nicht laden.', 'bad'); UI.mainMenu(); return; }
    if (r.restored) UI.toast('Spielstand war beschädigt – die letzte Sicherung wurde geladen.', 'info', 6000);
    G.slot = ['slot1', 'slot2', 'slot3'].includes(s) ? s : null;
    enter(r.state); UI.toast('Willkommen zurück! ' + PT.Sim.dateText(r.state), 'good');
  }
  function enter(st) {
    const UI = PT.UI;
    UI.closeAll(); document.querySelectorAll('.pt-menu').forEach(m => m.remove());
    G.st = st; G.hist = { undo: [], redo: [] }; G.mode = 'walk'; lastDist = null;
    G.world.load(st); G.world.setCamMode('follow'); G.world.setTime(st.time.min);
    document.getElementById('hud').hidden = false;
    PT.Audio.music('studio'); hud(); afterAction();
  }
  function toMenu() {
    const UI = PT.UI;
    if (G.st) saver.now();
    if (UI.Build.active()) UI.Build.close();
    UI.closeAll(); G.st = null; G.mode = 'menu'; document.getElementById('hud').hidden = true; UI.mainMenu();
  }

  // ── Minispiele ───────────────────────────────────────────
  function runMG(id, o) {
    o = o || {}; const st = G.st, UI = PT.UI, S = PT.Sim;
    const prev = G.mode; G.mode = 'mg';
    const def = PT.MG.get(id); if (!def) { UI.toast('Minispiel fehlt: ' + id, 'bad'); o.onDone && o.onDone(null); return; }
    const plays = st && st.mg[id] ? st.mg[id].plays : 0;
    PT.Harness.run({
      id, world: G.world, title: o.title,
      difficulty: o.difficulty != null ? o.difficulty : st ? st.diff : 1, allowDiff: o.free || !!o.allowDiff,
      seed: st ? PT.hash(st.seed + ':' + id + ':' + st.time.day + ':' + plays) : undefined,
      players: o.party || [{ name: st ? st.name : 'Du' }],
      reward(res) {
        const best = G.repo.best(); best.mg = best.mg || {}; if (!o.party) { best.mg[id] = Math.max(best.mg[id] || 0, res.score); G.repo.saveBest(best); }
        if (!st || o.party) return [];
        const out = S.minigameDone(st, res, o.ctx || {});
        return out.text;
      },
      onDone(res) { G.mode = prev === 'mg' ? 'walk' : prev; if (G.st) afterAction(); if (o.onDone) o.onDone(res); }
    });
  }

  // ── Nach jeder Aktion: Hinweise, HUD, Autosave ───────────
  function afterAction(force) {
    const st = G.st; if (!st) return; const UI = PT.UI, S = PT.Sim, D = PT.DATA;
    hud(); saver.poke();
    const ns = st.notices.splice(0, st.notices.length);
    ns.forEach(n => {
      if (n.t === 'good' || n.t === 'bad' || n.t === 'info') UI.toast(n.text, n.t, 4200);
      else if (n.t === 'ach') { UI.toast(n.text, 'ach', 5000); PT.Audio.fx('mission'); }
      else queue = queue.then(() => showNotice(n));
    });
    queue = queue.then(() => {
      if (st.pendingChoice) { const m = D.missions.concat(D.sideMissions).find(x => x.id === st.pendingChoice); return UI.choose('Entscheidung', m.choice.q, m.choice.options.map(o => ({ label: o.label })), { noClose: true, icon: '🤔' }).then(i => { S.storyChoice(st, m.id, Math.max(0, i)); hud(); }); }
    });
  }
  function showNotice(n) {
    const UI = PT.UI, st = G.st, D = PT.DATA;
    if (!st) return;
    if (n.t === 'dialogue') {
      if (n.cut && G.world && !UI.settings.reducedMotion) G.world.cine(n.cut, 2.5);
      return UI.dialogue(n.lines, { title: n.title });
    }
    if (n.t === 'mission') {
      PT.Audio.fx('mission');
      const r = n.rew || {};
      return UI.dialogue(n.lines || [], {}).then(() => new Promise(res => {
        const p = UI.panel(n.title, '<p class="pt-rew">' + [r.money ? '💶 +' + PT.money(r.money * PT.Sim.diffRules(st).money) : '', r.fans ? '💛 +' + r.fans + ' Fans' : '', r.rep ? '⭐ Ruf +' + r.rep : ''].filter(Boolean).join(' · ') + '</p>' + ((r.unlock || []).length ? '<p>🔓 ' + r.unlock.map(u => { const [k, v] = u.split(':'); return k === 'district' ? 'Neuer Bezirk: ' + D.districts.find(d => d.id === v).name : k === 'lot' ? 'Campus-Grundstück kann gepachtet werden' : v === 'guests' ? 'Gäste einladen' : v === 'sponsors' ? 'Sponsoren' : v; }).join(' · ') + '</p>' : '') + nextHint(), { icon: '🎯', onClose: res });
        p.footer('<button data-act="x" data-primary class="pri">Weiter</button>'); UI.bind(p.root, { x: () => p.close() });
        if ((r.unlock || []).some(u => u.startsWith('district'))) { G.world.refreshUnlocks(); }
      }));
    }
    if (n.t === 'chapter') { PT.Audio.music(n.ch >= 6 ? 'festival' : 'city'); return UI.chapter(n.ch); }
    if (n.t === 'ending') return UI.ending(st);
    if (n.t === 'challenge') {
      const best = G.repo.best(); if (n.success) { best.ch = best.ch || {}; best.ch[st.challenge.id] = true; G.repo.saveBest(best); }
      return new Promise(res => { const p = UI.panel(n.success ? '🏆 Geschafft!' : 'Leider vorbei', '<p>Herausforderung „' + PT.esc(n.name) + '“ ' + (n.success ? 'gemeistert!' : 'nicht geschafft.') + '</p>', { onClose: res }); p.footer('<button data-act="m">Hauptmenü</button><button data-act="x" data-primary class="pri">Weiterspielen</button>'); UI.bind(p.root, { x: () => p.close(), m: () => { p.close(); toMenu(); } }); PT.Audio.fx(n.success ? 'win' : 'lose'); });
    }
  }
  function nextHint() {
    const st = G.st, m = PT.Sim.currentMission(st); if (!m) return '';
    const n = PT.DATA.npcs.find(x => x.id === m.actor) || PT.DATA.hosts.find(x => x.id === m.actor);
    return '<p class="pt-hint">Nächste Mission: <b>' + PT.esc(m.title) + '</b> – sprich mit ' + PT.esc(n ? n.name : m.actor) + ' (' + PT.esc(PT.DATA.districts.find(d => d.id === m.loc).name) + ').</p>';
  }

  // ── HUD ──────────────────────────────────────────────────
  function buildHud() {
    const UI = PT.UI, h = document.getElementById('hud');
    h.innerHTML = '<div class="pt-hud-stats"><span id="hTime"></span><span id="hMoney"></span><span id="hFans"></span><span id="hRep"></span></div>' +
      '<div class="pt-hud-mission" id="hMission"></div><canvas id="hMap" width="150" height="150" aria-label="Minikarte"></canvas><span id="hFps" hidden></span>' +
      '<div class="pt-hud-btns"><button data-act="build" title="Bauen">🔨<small>Bauen</small></button><button data-act="prod" title="Produktion">🎙️<small>Folge</small></button><button data-act="team" title="Team">👥<small>Team</small></button><button data-act="finance" title="Finanzen">💶<small>Geld</small></button><button data-act="journal" title="Journal">📓<small>Journal</small></button><button data-act="archive" title="Archiv">🗄️<small>Archiv</small></button><button data-act="map" title="Karte">🗺️<small>Karte</small></button><button data-act="sleep" title="Feierabend">🌙<small>Schlafen</small></button><button data-act="pause" title="Pause">⏸<small>Menü</small></button></div>' +
      '<div class="pt-joy" id="joy"><i></i></div><div class="pt-act" id="actBox" hidden><span id="actLabel"></span><button id="actBtn" aria-label="Benutzen">E</button></div>';
    UI.bind(h, {
      build: () => openOr(() => UI.Build.open()), prod: () => openOr(openProd), team: () => openOr(UI.team), finance: () => openOr(UI.finance), journal: () => openOr(UI.journal), archive: () => openOr(UI.archive), map: () => openOr(UI.map), pause: () => openOr(UI.pause), sleep: () => openOr(sleep)
    });
    document.getElementById('hMap').onclick = () => openOr(UI.map);
    document.getElementById('actBtn').onclick = () => interact();
    // Touch-Joystick
    const j = document.getElementById('joy'), knob = j.querySelector('i'); let id = null, c = null;
    j.addEventListener('pointerdown', e => { id = e.pointerId; j.setPointerCapture(id); const r = j.getBoundingClientRect(); c = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; joy.on = true; move(e); e.preventDefault(); });
    const move = e => { if (e.pointerId !== id) return; let dx = (e.clientX - c.x) / c.r, dy = (e.clientY - c.y) / c.r; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = 'translate(' + dx * 34 + 'px,' + dy * 34 + 'px)'; };
    j.addEventListener('pointermove', move);
    const up = e => { if (e.pointerId !== id) return; id = null; joy.on = false; joy.x = joy.y = 0; knob.style.transform = ''; };
    j.addEventListener('pointerup', up); j.addEventListener('pointercancel', up);
  }
  function openOr(f) { const UI = PT.UI; if (!G.st || G.mode === 'mg' || document.querySelector('.pt-dlg')) return; if (UI.Build.active() && f !== UI.pause) return; if (UI.top()) return; f(); }
  function hud() {
    const st = G.st; if (!st) return; const S = PT.Sim, UI = PT.UI, D = PT.DATA;
    const $ = id => document.getElementById(id);
    $('hTime').textContent = '📅 ' + S.dateText(st); $('hMoney').textContent = '💶 ' + PT.money(st.money); $('hMoney').classList.toggle('neg', st.money < 0);
    $('hFans').textContent = '💛 ' + PT.fmt(st.fans); $('hRep').textContent = '⭐ ' + Math.round(st.rep);
    let mt = '';
    const m = S.currentMission(st);
    if (m) {
      if (st.missions.curState === 'offer') { const n = UI.person(m.actor); mt = '<b>🎯 ' + PT.esc(m.title) + '</b><span>Sprich mit ' + PT.esc(n.name) + ' (' + PT.esc(D.districts.find(d => d.id === m.loc).name) + ')</span>'; }
      else { const pr = S.missionProgress(st, m, st.missions.prog), open = pr.find(p => !p.done) || pr[0]; mt = '<b>🎯 ' + PT.esc(m.title) + '</b><span>' + PT.esc(open.label) + (open.need > 1 ? ' (' + PT.fmt(Math.min(open.have, open.need)) + '/' + PT.fmt(open.need) + ')' : '') + '</span>'; }
    } else if (st.challenge) { const c = S.challengeStatus(st); mt = '<b>' + c.c.icon + ' ' + PT.esc(c.c.name) + ' · noch ' + c.daysLeft + ' Tage</b><span>' + c.items.map(i => PT.esc(i.label) + ' ' + PT.fmt(i.have) + '/' + PT.fmt(i.need)).join(' · ') + '</span>'; }
    else if (st.endless) { const gl = st.endless.goals.find(x => !x.done); mt = '<b>♾️ Endlosmodus · Woche ' + st.endless.week + '</b><span>' + (gl ? PT.esc(gl.label) : 'Alle Wochenziele erreicht!') + '</span>'; }
    else if (st.mode === 'creative') mt = '<b>🎨 Kreativmodus</b><span>Unbegrenztes Budget</span>';
    $('hMission').innerHTML = mt;
    $('hFps').hidden = !UI.settings.fps; if (UI.settings.fps) $('hFps').textContent = fps + ' FPS' + (G.world && G.world.stats ? ' · ' + G.world.stats().calls + ' DC' : '');
  }
  function drawMap() {
    if (!G.world || !G.st) return; const cv = document.getElementById('hMap'); const S = PT.Sim, st = G.st, m = S.currentMission(st);
    G.world.minimap(cv.getContext('2d'), cv.width, cv.height, { target: m ? (st.missions.curState === 'offer' ? m.actor : m.loc) : null });
  }

  // ── Interaktionen ────────────────────────────────────────
  function travel(dist) {
    const st = G.st, S = PT.Sim, UI = PT.UI; if (!st.unlocks.districts[dist]) { UI.toast('Dieser Bezirk ist noch gesperrt.', 'bad'); return; }
    S.advance(st, 20); G.world.teleport(dist); PT.Audio.fx('whoosh'); afterAction();
  }
  function sleep() {
    const st = G.st, S = PT.Sim, UI = PT.UI;
    if (st.prod) { UI.toast('Erst die laufende Folge fertig machen (oder abbrechen).', 'info'); return; }
    UI.confirm('Feierabend?', 'Die Zeit springt auf morgen 8:00 Uhr. Heute Nacht werden Miete, Gehälter und Unterhalt fällig.', '🌙 Schlafen', 'Noch nicht').then(y => {
      if (!y) return; const rep = S.advance(st, (1440 - st.time.min) + 8 * 60); dayReports(rep); afterAction();
    });
  }
  function dayReports(reps) {
    const UI = PT.UI, st = G.st;
    (reps || []).forEach(r => {
      const L = r.ledger, inc = Object.values(L.inc).reduce((a, b) => a + b, 0), exp = Object.values(L.exp).reduce((a, b) => a + b, 0);
      UI.toast('🌅 Tag ' + (r.day + 1) + ': gestern ' + (inc - exp >= 0 ? '+' : '') + PT.money(inc - exp) + ' · Konto ' + PT.money(st.money), inc - exp >= 0 ? 'good' : 'bad', 5000);
      if (G.slot) G.repo.save(G.slot, st);
    });
    if (reps && reps.length) saver.now();
  }
  function openProd() {
    const st = G.st, UI = PT.UI;
    if (st.mode === 'career' && st.missions.done.length === 0) { UI.toast('Sprich zuerst mit Marco im Studio.', 'info'); return; }
    UI.Prod.open();
  }
  function interact() {
    const UI = PT.UI, S = PT.Sim, D = PT.DATA, st = G.st, n = nearCache;
    if (!st || !n || UI.isOpen() || G.mode !== 'walk') return;
    PT.Audio.fx('click');
    if (n.kind === 'npc') return talkTo(n.id);
    if (n.kind === 'job') return offerJob(D.jobs.find(j => j.id === n.id));
    if (n.kind === 'travel') return UI.map();
    if (n.kind === 'build') return UI.Build.open(n.id === 'campus' ? 'campus' : 'studio');
    if (n.kind === 'lot') return UI.finance();
    if (n.kind === 'studio') return deskMenu();
  }
  function deskMenu() {
    const UI = PT.UI, S = PT.Sim, st = G.st;
    const live = S.liveshowAvailable(st);
    const opts = [{ label: st.prod ? '🎙️ Folge weiter produzieren' : '🎙️ Neue Folge produzieren', desc: S.canProduce(st).ok || st.prod ? '' : S.canProduce(st).err }, { label: '📺 Live-Show auf der TV-Bühne', desc: live.ok ? 'Tickets und viele neue Fans (Minispiel Spotlight)' : live.err, disabled: !live.ok }, { label: '🔨 Baumodus' }, { label: '🌙 Feierabend' }];
    UI.choose('Produktionspult', 'Was steht an?', opts, { icon: '🎚️' }).then(i => {
      if (i === 0) openProd(); else if (i === 1) runMG('Y03', { ctx: { liveshow: true }, title: 'Live-Show im eigenen Studio' }); else if (i === 2) UI.Build.open('studio'); else if (i === 3) sleep();
    });
  }
  function missionGame(npcId) {
    // Minispiel-Ziele der aktuellen Mission (oder einer Nebenmission) bei der passenden Figur
    const S = PT.Sim, D = PT.DATA, st = G.st, out = [];
    const check = (m, prog, active) => { if (!active) return; m.obj.forEach((o, i) => { if (o.type !== 'minigame') return; const s = S.objectiveState(st, o, prog, i); if (s.have >= s.need) return; const id = o.id || PT.MG.list().filter(d => d.group === o.group)[(prog[i] || 0) % 4].id; out.push({ id, label: o.label || PT.MG.get(id).name, title: m.title }); }); };
    const m = S.currentMission(st); if (m && m.actor === npcId) check(m, st.missions.prog, st.missions.curState === 'active');
    Object.keys(st.missions.side).forEach(id => { const sm = D.sideMissions.find(x => x.id === id); if (sm.actor === npcId) check(sm, st.missions.side[id].prog, st.missions.side[id].state === 'active'); });
    return out;
  }
  function talkTo(id) {
    const UI = PT.UI, S = PT.Sim, D = PT.DATA, st = G.st;
    const res = S.talk(st, id); afterAction();
    if (res.mission) return; // Missionsdialog läuft über die Hinweise
    const person = UI.person(id), lines = person.talk || person.lines || ['Hallo!'];
    queue = queue.then(() => UI.dialogue([[id, lines[(st.time.day + (st.rel[id] || 0)) % lines.length]]])).then(() => {
      const opts = [], acts = [];
      missionGame(id).forEach(g => { opts.push({ label: '🎯 ' + g.label, desc: 'Mission: ' + g.title }); acts.push(() => runMG(g.id, { title: g.title, ctx: {} })); });
      if (res.offerSide) { const sm = res.offerSide; opts.push({ label: '📌 Nebenmission: ' + sm.title, desc: sm.obj.map(o => o.label || o.type).join(', ') }); acts.push(() => { S.acceptSide(st, sm.id); afterAction(); }); }
      D.jobs.filter(j => j.npc === id).forEach(j => { opts.push({ label: '💼 ' + j.name, desc: 'Nebenjob (' + PT.MG.get(j.mg).name + '), bis ' + PT.money(Math.round(j.pay * S.diffRules(st).money)) + (st.stats.jobsToday >= D.rules.sideJobCap ? ' – heute schon viele Jobs, weniger Lohn' : '') }); acts.push(() => offerJob(j, true)); });
      const app = st.applicants.find(a => a.id === id); if (app) { opts.push({ label: '🤝 Ins Team holen', desc: D.roles[app.role].name + ', ' + PT.money(app.salary) + '/Tag' }); acts.push(() => UI.team()); }
      if (!opts.length) return;
      opts.push({ label: 'Tschüss!' }); acts.push(() => {});
      return UI.choose(person.name, '', opts, { icon: '💬' }).then(i => { if (i >= 0 && acts[i]) acts[i](); });
    });
  }
  function offerJob(j, direct) {
    const UI = PT.UI; if (!j) return;
    const go = () => runMG(j.mg, { ctx: { job: j.id }, title: 'Nebenjob: ' + j.name });
    if (direct) { go(); return; }
    UI.confirm('💼 ' + j.name, 'Minispiel ' + PT.MG.get(j.mg).name + '. Lohn bis ' + PT.money(j.pay) + ' (dauert 45 Spielminuten).', 'Annehmen', 'Später').then(y => { if (y) go(); });
  }

  // ── Eingabe ──────────────────────────────────────────────
  function bindInput() {
    addEventListener('keydown', e => {
      const UI = PT.UI; keys[e.code] = true;
      if (!G || !G.st || G.mode === 'mg' || G.mode === 'build') return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      const k = UI.settings.keys;
      if (e.code === k.pause || e.code === 'Escape') { if (UI.top()) UI.top().close(); else if (!document.querySelector('.pt-dlg')) UI.pause(); e.preventDefault(); return; }
      if (UI.isOpen()) return;
      const map = { [k.interact]: interact, [k.build]: () => openOr(() => UI.Build.open()), [k.prod]: () => openOr(openProd), [k.team]: () => openOr(UI.team), [k.finance]: () => openOr(UI.finance), [k.journal]: () => openOr(UI.journal), [k.archive]: () => openOr(UI.archive), [k.map]: () => openOr(UI.map) };
      if (map[e.code]) { e.preventDefault(); map[e.code](); }
      else if (e.code === 'Enter' && nearCache) { e.preventDefault(); interact(); }
    });
    addEventListener('keyup', e => { keys[e.code] = false; });
    addEventListener('blur', () => { keys = {}; });
  }
  function moveInput() {
    let x = 0, z = 0;
    if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1; if (keys.KeyW || keys.ArrowUp) z -= 1; if (keys.KeyS || keys.ArrowDown) z += 1;
    if (joy.on) { x = joy.x; z = joy.y; }
    const l = Math.hypot(x, z); if (l > 1) { x /= l; z /= l; }
    return { mx: x, mz: z, run: !!keys[PT.UI.settings.keys.run] || (joy.on && Math.hypot(joy.x, joy.y) > 0.92) };
  }

  // ── Schleife ─────────────────────────────────────────────
  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0, (t - lastT) / 1000)); lastT = t;
    fpsN++; if (t - fpsT > 1000) { fps = fpsN; fpsN = 0; fpsT = t; }
    const UI = PT.UI; if (!UI || !G) return;
    if (!G.world) return;
    if (G.mode === 'mg') return; // der Minispiel-Rahmen rendert selbst
    const st = G.st;
    if (st && G.mode === 'walk') {
      const paused = UI.isOpen() || document.hidden;
      let near = null, dist = null;
      if (!paused) {
        const reps = PT.Sim.advance(st, dt * 1.5 * (UI.settings.timeSpeed || 1)); if (reps.length) { dayReports(reps); afterAction(); }
        G.world.setTime(st.time.min);
        const r = G.world.update(dt, moveInput()) || {}; near = r.near; dist = r.district;
        if (dist && dist !== lastDist) { lastDist = dist; PT.Sim.visit(st, dist); afterAction(); PT.Audio.music(dist === 'festival' ? 'festival' : st.time.min > 20 * 60 || st.time.min < 6 * 60 ? 'night' : dist === 'altstudio' ? 'studio' : 'city'); }
        if (st.pending.length && !busy) { busy = true; dayEvent().then(() => { busy = false; }); }
      } else G.world.update(0, { mx: 0, mz: 0 });
      nearCache = paused ? null : near;
      const box = document.getElementById('actBox');
      box.hidden = !nearCache; if (nearCache) { document.getElementById('actLabel').textContent = nearCache.label; document.getElementById('actBtn').textContent = /Touch|Mobi|Android|iPhone/.test(navigator.userAgent) ? '👆' : UI.keyName(UI.settings.keys.interact); }
    } else if (st && G.mode === 'build') { G.world.update(dt, { mx: 0, mz: 0 }); } // dt nötig, sonst folgt die Baukamera Wischen/Zoom nicht
    else G.world.update(dt, { mx: 0, mz: 0, idle: true });
    G.world.render();
    hudT += dt; if (hudT > 0.25 && st) { hudT = 0; hud(); drawMap(); }
  }
  function dayEvent() {
    const UI = PT.UI, S = PT.Sim, D = PT.DATA, st = G.st;
    const ev = D.events.find(e => e.id === st.pending[0]); if (!ev) { st.pending.shift(); return Promise.resolve(); }
    return UI.choose('⚡ ' + ev.title, ev.text, ev.choices.map(c => ({ label: c.label, desc: c.mg ? 'Minispiel: ' + PT.MG.get(c.mg).name : UI.Prod.fxText(c.effect) })), { noClose: true }).then(i => new Promise(res => {
      i = Math.max(0, i); const c = ev.choices[i];
      if (c.mg) runMG(c.mg, { title: ev.title, ctx: { event: true }, onDone: r => { const out = S.eventChoose(st, ev.id, i, r || { won: false }); UI.toast(UI.Prod.fxText(out.fx), r && r.won ? 'good' : 'bad'); afterAction(); res(); } });
      else { const out = S.eventChoose(st, ev.id, i); UI.toast(UI.Prod.fxText(out.fx), 'info'); afterAction(); res(); }
    }));
  }

  root.addEventListener('error', e => { try { if (PT.UI && PT.UI.toast) PT.UI.toast('Kleiner Fehler: ' + (e.message || 'unbekannt'), 'bad', 4000); } catch (x) { /* egal */ } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
