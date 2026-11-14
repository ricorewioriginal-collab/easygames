/* AnMaCha – Der Podcast · Story-Akte mit Zwischensequenzen und Finale (freie Stadt).
   Fünf Akte führen von der ersten Folge über die Welten, Ricos Universum und die Studiogäste bis zum großen Radio-Festival.
   Zwischensequenzen: Kamerafahrt, Breitbild-Balken, Untertitel mit Gesicht und Stimme (Sprachausgabe, eingebettet über anmacha-cloud.js).
   Ⓐ / Leertaste / Tippen = weiter, Ⓑ / Esc = überspringen. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save, I = AMC.Input;
  const CUT = AMC.Cut = {}, AC = AMC.Acts = {};

  // ------------------------------------------------------------------ Sprecher: Name, Gesicht, Stimme
  const WHO = {
    andrew: ['Andrew', null, 1.0, 1.05], marco: ['Marco', null, 0.82, 1.0], rico: ['RicoReWi', '✳️', 1.0, 1.08],
    n: ['Erzähler', '🎙️', 0.95, 0.98], jana: ['Jana Kanal', '📺', 1.3, 1.08], gisela: ['Gisela', '🚐', 1, 1], fans: ['Publikum', '🙌', 1.2, 1.15]
  };
  let C = null;   // aktive Zwischensequenz
  const voiceOn = () => (Save.data.settings || {}).voice !== false && root.speechSynthesis && root.SpeechSynthesisUtterance;
  function speak(who, txt, end) {
    if (!voiceOn() || who === 'gisela') { if (who === 'gisela') AMC.Audio.sfx('horn'); return false; }
    try {
      const w = WHO[who] || WHO.n, u = new SpeechSynthesisUtterance(txt.replace(/AnMaCha/gi, 'Anmacher').replace(/[^\p{L}\p{N}\s.,!?'„“…–-]/gu, ''));
      u.lang = 'de-DE'; u.pitch = w[2]; u.rate = w[3]; u.onend = end; u.onerror = end; speechSynthesis.cancel(); speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  }
  const hush = () => { try { root.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* egal */ } };

  /** Zwischensequenz abspielen. shots = [{ cam: [x,y,z], to: [x,y,z], look: [x,y,z], lines: [[wer, text], …], pose: fn(S) }] */
  CUT.play = function (shots, done) {
    const S = AMC.Play.state(); if (!S || C || (AMC.Worlds && AMC.Worlds.busy && AMC.Worlds.busy())) return false;
    const el = U.el('div', 'cut', '<i class="cut-bar t"></i><i class="cut-bar b"></i><div class="cut-sub glass"><span class="cut-face" id="cutF"></span><div><b id="cutN"></b><p id="cutT"></p></div></div><button type="button" class="cut-skip" id="cutS">' + AMC.glyph('b') + ' Überspringen</button>');
    document.body.appendChild(el); document.body.classList.add('cutting'); requestAnimationFrame(() => el.classList.add('on'));
    C = { S, el, shots, done, si: 0, li: -1, t: 0, lt: 0, need: 0, spoke: false, ended: false };
    el.querySelector('#cutS').onclick = e => { e.stopPropagation(); finish(); };
    el.addEventListener('pointerdown', e => { if (e.target.id !== 'cutS') next(); });
    AMC.UI.showTouch && AMC.UI.showTouch(false); I.dpadEmotes = false;
    shot(0); return true;
  };
  CUT.active = () => !!C;
  function shot(i) {
    const s = C.shots[i]; C.si = i; C.t = 0; C.li = -1; if (s.pose) try { s.pose(C.S); } catch (e) { /* Pose ist nur Schmuck */ }
    next();
  }
  function line(i) {
    const s = C.shots[C.si], l = s.lines[i]; C.li = i; C.lt = 0; C.spoke = false;
    const w = WHO[l[0]] || [l[0], '💬'], face = C.el.querySelector('#cutF');
    face.innerHTML = w[1] ? '<em>' + w[1] + '</em>' : '<img alt="" src="' + AMC.UI.face(l[0]) + '">';
    C.el.querySelector('#cutN').textContent = w[0]; C.el.querySelector('#cutT').textContent = l[1];
    const sub = C.el.querySelector('.cut-sub'); sub.classList.remove('pop'); void sub.offsetWidth; sub.classList.add('pop');
    C.need = Math.max(2.6, l[1].length * 0.065);
    C.talking = speak(l[0], l[1], () => { if (C && C.li === i) C.spoke = true; });
    const f = W.hosts[l[0]]; if (f && f.talk) { f.talk(true); setTimeout(() => f.talk(false), C.need * 900); }
    if (l[0] !== 'n' && l[0] !== 'gisela') AMC.Audio.sfx('talk');
  }
  function next() {
    if (!C || C.ended) return; const s = C.shots[C.si];
    if (C.li + 1 < s.lines.length) return line(C.li + 1);
    if (C.si + 1 < C.shots.length) return shot(C.si + 1);
    finish();
  }
  function finish() {
    if (!C || C.ended) return; C.ended = true; hush(); const c = C;
    c.el.classList.remove('on'); document.body.classList.remove('cutting'); setTimeout(() => c.el.remove(), 400);
    AMC.UI.showTouch && AMC.UI.showTouch(true); if (AMC.CityVibe && AMC.CityVibe.state()) I.dpadEmotes = true;
    W.cam.cur = null; C = null; if (c.done) c.done();
  }
  CUT.skip = finish;
  // Läuft statt Play.update: Kamera fahren, Welt lebt weiter
  CUT.tick = function (dt) {
    if (!C) return false; const s = C.shots[C.si];
    C.t += dt; C.lt += dt;
    const k = U.clamp(C.t / (s.dur || 7), 0, 1), e = k * k * (3 - 2 * k), a = s.cam, b = s.to || s.cam, L = s.look;
    W.camera.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e); W.camera.lookAt(L[0], L[1], L[2]);
    if (W.particles) W.particles.update(dt); if (AMC.WorldFX) AMC.WorldFX.update(dt); if (AMC.Worlds) AMC.Worlds.update(dt);
    ['andrew', 'marco', 'rico'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent) f.update(dt); });
    if (s.fx) s.fx(dt, C.t);
    if (I.hit('back') || I.hit('pause')) { finish(); return true; }
    if (I.hit('ok') && C.lt > 0.25) next();
    else if (C.lt > C.need && (C.spoke || !C.talking || C.lt > C.need + 6)) next();
    return true;
  };

  // ------------------------------------------------------------------ Akte
  const st = () => { const a = Save.data.acts = Save.data.acts || { cur: 0, seen: {}, w: {} }; a.seen = a.seen || {}; a.w = a.w || {}; return a; };
  const career = () => AMC.Career ? AMC.Career.state() : { eps: 0, abos: 0 };
  const guestsMet = () => Object.keys(((Save.data.guests || {}).n) || {}).length;
  const HOSTS_AT = (S, x, y, z, ry, anim) => ['andrew', 'marco'].forEach((id, i) => { const f = W.hosts[id]; if (!f) return; if (!f.root.parent) S.group.add(f.root); f.root.position.set(x + (i ? 1.4 : -1.4), y, z); f.root.rotation.y = ry; f.play(anim || 'idle', { fade: 0.2 }); });
  const around = (S, dx, dy, dz) => [S.pl.x + dx, (S.pl.y || 0) + dy, S.pl.z + dz];
  const ACTS = [
    { t: 'Akt 1 · Garage mit Mikro', goal: 'Nehmt eure erste Folge auf (abends im Funkhaus).', prog: () => [Math.min(1, career().eps), 1], ok: () => career().eps >= 1, reward: 100,
      intro: S => [{ cam: around(S, 6, 3, 7), to: around(S, 3.5, 2, 4.5), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, 0.7, 'idle'), lines: [
        ['n', 'Medienstadt. Zwei Freunde, ein Mikrofon – und ein Camper namens Gisela.'],
        ['andrew', 'Marco, wir machen das jetzt richtig. Ein Podcast, den die ganze Stadt hört.'],
        ['marco', 'Die ganze Stadt? Andrew, uns hören gerade drei Leute. Und eine davon ist deine Mutter.'],
        ['andrew', 'Dann fangen wir eben mit vier an. Erste Folge – heute Abend!']]}],
      outro: S => [{ cam: around(S, -5, 3, 6), to: around(S, -3, 2, 4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, -0.6, 'yes'), lines: [
        ['marco', 'Folge eins ist draußen!'], ['andrew', 'Und die Kommentare sind … überraschend nett!'], ['n', 'Doch jenseits des Wassers warten noch vier Welten.']]}] },
    { t: 'Akt 2 · Über die Brücken', goal: 'Besucht alle vier Welten: Hafen, Insel, Berg und RicoReWi-Universum.', prog: () => [Object.keys(st().w).length, 4], ok: () => Object.keys(st().w).length >= 4, reward: 200,
      intro: () => [{ cam: [72, 16, 26], to: [80, 12, 14], look: [112, 4, 0], dur: 8, lines: [
        ['andrew', 'Siehst du die Brücke? Dahinter liegt der Medienhafen mit Kanal 9.'],
        ['marco', 'Im Norden der Funkturm, im Süden die Festival-Insel …'],
        ['andrew', '… und im Westen leuchtet alles in Neon. Lass uns überall hin!'], ['gisela', 'Tröööt!']]}],
      outro: () => [{ cam: [0, 60, 60], to: [0, 70, 20], look: [0, 0, -20], dur: 7, lines: [['n', 'Hafen, Berg, Insel und Neon-Universum – überall kennt man jetzt AnMaCha.']]}] },
    { t: 'Akt 3 · Ricos Einladung', goal: 'Entdeckt alle sechs Orte im RicoReWi-Universum.', prog: () => [AMC.Worlds ? AMC.Worlds.ricoQuest().n : 0, 6], ok: () => !!(Save.data.ricoU || {}).done, reward: 150,
      intro: () => [{ cam: [-80, 9, 16], to: [-100, 8, 12], look: [-140, 6, 0], dur: 7, lines: [
        ['rico', 'Hey, ihr zwei! Ich bin Rico. Kommt rüber über die Neonbrücke – ich zeig euch mein Universum.'],
        ['marco', 'Musik, Bücher, Apps … der Typ macht alles gleichzeitig?']]},
        { cam: [-150, 14, 26], to: [-165, 10, 18], look: [-185, 7, -20], dur: 6, lines: [['rico', 'Ich habe nicht zu viele Ideen. Die Welt hat nur zu wenig Tabs offen.']]}],
      outro: () => [{ cam: [-160, 8, 20], to: [-172, 6, 10], look: [-185, 6, -20], dur: 6, lines: [['rico', 'Ab heute seid ihr Teil meines Universums. Und ich komme gern mal in eure Show!'], ['andrew', 'Deal! Studiogast RicoReWi – das wird groß.']]}] },
    { t: 'Akt 4 · Die Stimme der Stadt', goal: 'Holt 3 verschiedene Studiogäste und erreicht 1.000 Follower in der AnMaCha-App.', prog: () => [Math.min(3, guestsMet()) + (AMC.Feed && AMC.Feed.followers() >= 1000 ? 1 : 0), 4], ok: () => guestsMet() >= 3 && AMC.Feed && AMC.Feed.followers() >= 1000, reward: 250,
      intro: () => [{ cam: [150, 6, -4], to: [156, 9, -8], look: [158, 14, -16], dur: 7, lines: [
        ['jana', 'Ihr zwei seid das Stadtgespräch! Wer bei euch zu Gast ist, landet morgen in den Nachrichten.'],
        ['andrew', 'Dann holen wir die besten Gäste ins Studio.'], ['marco', 'Und posten alles in der App. Gisela braucht auch Follower.'], ['gisela', 'Tröööt!']]}],
      outro: S => [{ cam: around(S, 5, 3, -5), to: around(S, 3, 2, -3), look: around(S, 0, 1.4, 0), lines: [['n', 'Tausend Follower, drei Studiogäste. Die Medienstadt hat eine neue Stimme.']]}] },
    { t: 'Finale · Das große Radio-Festival', goal: 'Werdet Stadtgespräch (8.000 Abos) und tretet dann auf der Festival-Insel auf.', prog: () => [Math.min(8000, Math.round(career().abos)), 8000], ok: () => !!st().final, reward: 1000, finale: true,
      intro: () => [{ cam: [0, 26, 140], to: [0, 16, 160], look: [0, 6, 196], dur: 8, lines: [
        ['n', 'Eine Nachricht von der Festival-Insel …'],
        ['jana', 'Das Radio-Festival braucht einen Abschluss-Act. Und alle wollen nur euch!'],
        ['marco', 'Live? Vor tausend Leuten?'], ['andrew', 'Vor tausend Leuten. Und Gisela fährt uns hin.']]}] }
  ];
  AC.ACTS = ACTS;
  AC.state = () => { const a = st(), d = ACTS[Math.min(a.cur, ACTS.length - 1)], p = d.prog(); return { i: a.cur, done: a.cur >= ACTS.length, title: d.t, goal: d.goal, have: p[0], need: p[1] }; };
  const finaleReady = () => st().cur === ACTS.length - 1 && career().abos >= 8000 && !st().final;
  AC.finaleReady = finaleReady;
  let V = null;
  AC.start = function (S) { V = null; if (!S || S.mode !== 'free' || S.net) return; V = { S, t: 2.5 }; };
  AC.stop = () => { if (C) finish(); V = null; };
  AC.update = function (dt) {
    if (!V || C) return; const S = V.S, a = st();
    if (AMC.Worlds) { const n = AMC.Worlds.name(S.pl.x, S.pl.z); if (n && !/Unterwegs/.test(n) && !a.w[n]) { a.w[n] = 1; Save.save(); } }
    if ((V.t -= dt) > 0 || AMC.UI.isOpen() || (AMC.Worlds && AMC.Worlds.busy && AMC.Worlds.busy()) || S.drive) return; V.t = 1;
    if (a.cur >= ACTS.length) return; const d = ACTS[a.cur];
    if (!a.seen[a.cur] && !d.finale && d.ok()) { a.seen[a.cur] = 1; a.cur++; Save.save(); const f = Save.earn(d.reward); AMC.UI.toast('📖 ' + d.t + ' schon geschafft! +' + f + ' 🎟️', 3200); return; }   // Spielstand ist schon weiter
    if (!a.seen[a.cur]) { a.seen[a.cur] = 1; Save.save(); CUT.play(d.intro(S), () => AMC.UI.toast('📖 ' + d.t + ': ' + d.goal, 5000)); return; }
    if (d.finale) { if (finaleReady() && Math.hypot(S.pl.x, S.pl.z - 186) < 7) finale(S); return; }
    if (d.ok()) { const r = d.outro ? d.outro(S) : null; a.cur++; Save.save(); const f = Save.earn(d.reward); AMC.Audio.sfx('win'); const after = () => AMC.UI.toast('📖 ' + d.t + ' geschafft! +' + f + ' 🎟️', 4200); if (r) CUT.play(r, after); else after(); }
  };
  // Finale: Auftritt auf der Hauptbühne mit Feuerwerk, danach Abspann
  function finale(S) {
    const fw = (dt, t) => { if (Math.random() < dt * 2.5) W.particles.burst(U.rand(-30, 30), U.rand(30, 44), U.rand(200, 214), [0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a][Math.floor(Math.random() * 4)], 40, { speed: 9, grav: 3, life: 1.6, size: 0.9, up: 0 }); };
    const onStage = S => { HOSTS_AT(S, 0, 1.42, 194, Math.PI, 'yes'); if (AMC.WorldFX) AMC.WorldFX.cheer(); AMC.Audio.sfx('cheer'); };
    CUT.play([{ cam: [0, 5, 172], to: [0, 4, 182], look: [0, 3, 194], dur: 8, pose: onStage, fx: fw, lines: [
      ['fans', 'AN-MA-CHA! AN-MA-CHA!'], ['andrew', 'Medienstadt! Seid ihr bereit, angemacht zu werden?'], ['marco', 'Das hier ist für alle, die von Anfang an zugehört haben!']]}], () => {
      AMC.Audio.song && AMC.Audio.song((U.pick(D.WISHES) || {}).id).then(song => {
        if (!AMC.Worlds || !AMC.Worlds.play) return outro(S, 0.8);
        AMC.Worlds.play('rhythm', { song: song || null, color: '#ff3da8', speed: 1.1, n: 24, hard: true, title: '🎆 Finale: Das große Radio-Festival' }, q => outro(S, q));
      });
    });
  }
  function outro(S, q) {
    const a = st(); a.final = true; a.cur = ACTS.length; Save.save();
    const f = Save.earn(1000 + Math.round(q * 500)); if (AMC.Career) AMC.Career.state().abos += Math.round(2000 + q * 3000);
    if (AMC.Feed) AMC.Feed.post('🎆', 'Abschluss-Act beim Radio-Festival – danke, Medienstadt! Ihr seid die Besten. 🧡', 'folge');
    const fw = dt => { if (Math.random() < dt * 4) W.particles.burst(U.rand(-30, 30), U.rand(30, 46), U.rand(196, 214), [0xff3da8, 0x3dd6ff, 0xffd23f, 0xffffff][Math.floor(Math.random() * 4)], 46, { speed: 10, grav: 3, life: 1.8, size: 1, up: 0 }); };
    CUT.play([{ cam: [0, 4, 184], to: [-6, 9, 170], look: [0, 3, 194], dur: 9, pose: S => HOSTS_AT(S, 0, 1.42, 194, Math.PI, 'dance'), fx: fw, lines: [
      ['n', 'Die Insel bebt. Die ganze Medienstadt singt mit.'], ['rico', 'Was für ein Auftritt! AnMaCha forever!'],
      ['andrew', 'Marco … wir haben’s geschafft.'], ['marco', 'Ja. Und morgen Abend? Neue Folge.'], ['gisela', 'Tröööt!']]}], () => {
      AMC.Audio.sfx('applause');
      AMC.UI.bubble('🏆 Festival-Legenden', 'Ihr habt die Story der Medienstadt abgeschlossen! Die Stadt, die Welten und eure Show laufen weiter – jeder Tag bringt neue Gäste, Trends und Folgen.', '+' + f + ' 🎟️ · Abos-Schub nach dem Festival');
    });
  }
  // Übersicht (Gesamtmenü): Akte, Fortschritt, Szenen nochmal ansehen
  AC.panel = function () {
    const a = st(), inCity = AMC.Play.state() && AMC.Play.state().mode === 'free' && !AMC.Play.state().net;
    const rows = ACTS.map((d, i) => { const done = i < a.cur, cur = i === a.cur, p = d.prog(); return '<button type="button" class="st-item' + (cur ? ' on' : '') + '" data-nav data-a="' + i + '"' + (!(done || cur) || !inCity ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + (done ? '✅' : cur ? '▶' : '🔒') + '</span><span><b>' + d.t + '</b><small>' + (done ? 'Geschafft · Szene nochmal ansehen' : cur ? d.goal + ' · ' + U.fmt(p[0]) + '/' + U.fmt(p[1]) : 'Noch gesperrt') + '</small></span></button>'; }).join('');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>📖 Story-Akte</h2><button class="btn small" data-nav id="acB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + (a.cur >= ACTS.length ? '🏆 Alle Akte geschafft – ihr seid Festival-Legenden!' : 'Die Geschichte der Medienstadt, Akt für Akt. Szenen mit Stimmen, überspringen mit ' + AMC.glyph('b') + '.') + '</p><div class="st-list" id="acL">' + rows + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#acB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#acL').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.getAttribute('aria-disabled')) return; const d = ACTS[+b.dataset.a], S = AMC.Play.state(); AMC.UI.close(s); if (AMC.Game && AMC.Game.menu) { AMC.UI.close(AMC.Game.menu); AMC.Game.menu = null; } setTimeout(() => CUT.play(d.intro(S)), 200); });
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
