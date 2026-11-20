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
  // Feste Stimmen für Andrew und Marco: Microsoft-Natural-Stimmen (Edge), sonst die beste männliche deutsche Gerätestimme
  const VOICE = { andrew: ['conrad', 'florian', 'jonas', 'stefan', 'jan'], marco: ['killian', 'jonas', 'florian', 'jan', 'stefan'], rico: ['florian', 'jan', 'jonas'], n: ['florian', 'conrad', 'stefan'] };
  const hq = v => /natural|neural|online|premium|enhanced/i.test(v.name);
  let vCache = null;
  function pickVoice(who) {
    const all = (speechSynthesis.getVoices() || []).filter(v => /^de([-_]|$)/i.test(v.lang || ''));
    if (!all.length) return null;
    if (!vCache || vCache.n !== all.length) vCache = { n: all.length, by: {} };
    if (who in vCache.by) return vCache.by[who];
    const find = names => { for (const n of names) { const r = new RegExp('\\b' + n + '\\b', 'i'), hit = all.filter(v => r.test(v.name)).sort((a, b) => hq(b) - hq(a))[0]; if (hit) return hit; } return null; };
    let v = VOICE[who] ? find(VOICE[who]) : null;
    if (who === 'marco') { const a = pickVoice('andrew'); if (v && a && v.name === a.name) v = find(VOICE.marco.filter(n => !new RegExp('\\b' + n + '\\b', 'i').test(a.name))); }
    return (vCache.by[who] = v);
  }
  try { root.speechSynthesis && speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => { vCache = null; }); } catch (e) { /* egal */ }
  AC.voiceFor = who => { try { const v = pickVoice(who); return v ? v.name : ''; } catch (e) { return ''; } };
  function speak(who, txt, end) {
    if (!voiceOn() || who === 'gisela') { if (who === 'gisela') AMC.Audio.sfx('horn'); return false; }
    if (!WHO[who] && AMC.Babble) return AMC.Babble.say(who, txt, end);   // NPCs brabbeln
    try {
      const w = WHO[who] || WHO.n, u = new SpeechSynthesisUtterance(txt.replace(/AnMaCha/gi, 'Anmacher').replace(/[^\p{L}\p{N}\s.,!?'„“…–-]/gu, ''));
      u.lang = 'de-DE'; u.pitch = w[2]; u.rate = w[3];
      const v = pickVoice(who); if (v) { u.voice = v; u.lang = v.lang; if (hq(v)) { u.pitch = 1; u.rate = Math.min(w[3], 1.05); } }   // Natural-Stimmen klingen unverstellt am besten
      u.onend = end; u.onerror = end; speechSynthesis.cancel(); speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  }
  // Aufgenommene Sprachclips (Edge-Stimmen, tools/podcast-voice): laufen auf jedem Gerät gleich, sonst Sprachausgabe
  let VO = null;
  try { fetch('vo/index.json').then(r => r.ok ? r.json() : []).then(a => { VO = new Set(a || []); }).catch(() => { VO = new Set(); }); } catch (e) { VO = new Set(); }
  const voKey = (who, txt) => { let h = 0x811c9dc5; const s = who + '|' + txt; for (let i = 0; i < s.length; i++) h = Math.imul((h ^ s.charCodeAt(i)) >>> 0, 16777619) >>> 0; return h.toString(36); };
  AC.voKey = voKey; AC.voClip = (who, txt) => { const k = voKey(who, txt); return VO && VO.has(k) ? 'vo/' + k + '.mp3' : null; };
  // Echte Sprachaufnahme (z. B. RicoReWis Originalstimme); fällt bei Fehlern auf die Sprachausgabe zurück
  let clip = null;
  function playClip(src, who, txt, end) {
    if ((Save.data.settings || {}).voice === false) return false;
    try {
      const a = clip = new Audio(src), st = Save.data.settings || {}; a.volume = U.clamp(st.sfx == null ? 1 : st.sfx * 1.1, 0, 1);
      let fell = false; const fall = () => { if (fell || clip !== a) return; fell = true; if (!speak(who, txt, end)) end(); };
      a.onended = end; a.onerror = fall; const pr = a.play(); if (pr && pr.catch) pr.catch(fall); return true;
    } catch (e) { return speak(who, txt, end); }
  }
  let vTok = 0, vBusy = false;   // läuft gerade eine Sprachzeile (Clip, Sprachausgabe oder Brabbeln)?
  const hush = () => { vTok++; vBusy = false; try { if (AMC.Babble) AMC.Babble.stop(); if (clip) { clip.pause(); clip = null; } root.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* egal */ } };

  /** Zwischensequenz abspielen. shots = [{ cam: [x,y,z], to: [x,y,z], look: [x,y,z], lines: [[wer, text], …], pose: fn(S) }] */
  // Stimmen außerhalb der Zwischensequenzen: Story-Dialoge (UI.dialog) und Live-Aufnahme (show.js say)
  const SHORT = { a: 'andrew', m: 'marco', r: 'rico', n: 'n' };
  AMC.Voice = {
    say(w, t, end) {
      if (C || !t) { if (end) end(); return false; } const who = SHORT[w] || w; hush();
      const tok = vTok, fin = () => { if (tok !== vTok) return; vBusy = false; if (end) end(); };
      const src = AC.voClip(who, t);
      const on = src ? playClip(src, who, t, fin) : WHO[who] ? speak(who, t.replace(/\{\w+\}/g, ''), fin) : (AMC.Babble ? AMC.Babble.say(who, t, fin) : false);
      vBusy = !!on; if (!on && end) setTimeout(fin, 0);
      return on;
    },
    stop: () => { if (!C) hush(); },
    busy: () => vBusy || !!C,
    /** fn erst ausführen, wenn mindestens ms vergangen sind UND die laufende Sprachzeile zu Ende ist (höchstens 12 s extra warten) */
    after(ms, fn) {
      const t0 = Date.now(), tick = () => { const dt = Date.now() - t0; if (dt < ms || (vBusy && dt < ms + 12000)) return setTimeout(tick, 120); setTimeout(fn, vBusy ? 0 : 280); };
      setTimeout(tick, Math.min(ms, 120));
    }
  };
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
    // Kamerafahrt so lang wie das Gesprochene: die Fahrt endet mit der letzten Zeile, nicht mittendrin
    C.dur = Math.max(s.dur || 7, s.lines.reduce((a, l) => a + need(l[1]) + 0.5 + ((l[2] || {}).wait || 0), 0.6));
    C.wait = i === 0 ? 0 : (s.wait || 0.35);   // kurzer Atemzug nach dem Schnitt, bevor die erste Zeile startet
    C.pend = 0;
    next();
  }
  const need = t => Math.max(2.4, String(t).length * 0.062);   // Lesezeit, falls keine Stimme läuft
  const GEST = { '!': 'arms', '?': 'yes' };
  let mouth = null;
  const shut = () => { if (mouth) { const f = mouth; mouth = null; f.talk(false); if (f.gest && f.curName === f.gest) f.play(f.back || 'idle', { fade: 0.35 }); f.gest = null; } };
  function line(i) {
    const s = C.shots[C.si], l = s.lines[i]; C.li = i; C.lt = 0; C.spoke = false; C.gap = 0;
    const w = WHO[l[0]] || [l[0], '💬'], face = C.el.querySelector('#cutF'), o = l[2] || {};
    face.innerHTML = w[1] && !o.src ? '<em>' + w[1] + '</em>' : '<img alt="" src="' + AMC.UI.face(l[0]) + '">';
    C.el.classList.toggle('orig', !!o.src);
    C.el.querySelector('#cutN').textContent = w[0]; C.el.querySelector('#cutT').textContent = l[1];
    const sub = C.el.querySelector('.cut-sub'); sub.classList.remove('pop'); void sub.offsetWidth; sub.classList.add('pop');
    C.need = need(l[1]);
    hush(); shut();
    // Regie zur Zeile: Aktion (o.do), Geste des Sprechers, Mund bewegt sich, bis die Stimme fertig ist
    if (o.do) try { o.do(C.S); } catch (e) { /* Regie ist nur Schmuck */ }
    const tok = vTok, said = () => { if (C && C.li === i && tok === vTok) { C.spoke = true; shut(); } };
    const src = o.src || AC.voClip(l[0], l[1]);
    C.talking = src ? playClip(src, l[0], l[1], said) : speak(l[0], l[1], said);
    const f = W.hosts[l[0]];
    if (f && f.talk && f.root.parent && f.root.visible !== false) {
      f.talk(true); mouth = f;
      const g = o.gest !== undefined ? o.gest : (f.curName === 'idle' ? GEST[(l[1].trim().slice(-1))] : null);
      if (g) { f.back = f.curName || 'idle'; f.gest = g; f.play(g, { fade: 0.25 }); }
      if (!C.talking) setTimeout(() => { if (mouth === f) shut(); }, C.need * 850);
    }
    if (l[0] !== 'n' && l[0] !== 'gisela') AMC.Audio.sfx('talk');
  }
  // Nächster Schritt: erst Pause (o.wait / Atemzug), dann Zeile; am Ende der Einstellung die nächste Kamera
  function next() {
    if (!C || C.ended) return; const s = C.shots[C.si];
    if (C.li + 1 < s.lines.length) { const w = C.li < 0 ? C.wait : ((s.lines[C.li + 1][2] || {}).wait || 0); if (w > 0 && !C.pend) { C.pend = w; return; } C.pend = 0; return line(C.li + 1); }
    if (C.si + 1 < C.shots.length) return shot(C.si + 1);
    finish();
  }
  function finish() {
    if (!C || C.ended) return; C.ended = true; hush(); shut(); const c = C; AC.lastCut = Date.now();
    c.el.classList.remove('on'); document.body.classList.remove('cutting'); setTimeout(() => c.el.remove(), 400);
    AMC.UI.showTouch && AMC.UI.showTouch(true); if (AMC.CityVibe && AMC.CityVibe.state()) I.dpadEmotes = true;
    W.cam.cur = null; C = null; if (c.done) c.done();
  }
  CUT.skip = finish;
  // Läuft statt Play.update: Kamera fahren, Welt lebt weiter
  CUT.tick = function (dt) {
    if (!C) return false; const s = C.shots[C.si];
    // Regie-Zeit in echter Zeit (ruckelnde Geräte bremsen dt, die Stimme läuft aber in Echtzeit weiter)
    const nw = performance.now(), rdt = Math.min(0.25, Math.max(dt, (nw - (C.rt || nw)) / 1000)); C.rt = nw;
    C.t += dt; C.lt += rdt;
    const k = U.clamp(C.t / (C.dur || s.dur || 7), 0, 1), e = k * k * (3 - 2 * k), a = s.cam, b = s.to || s.cam, L = s.look;
    W.camera.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e); W.camera.lookAt(L[0], L[1], L[2]);
    if (W.particles) W.particles.update(dt); if (AMC.WorldFX) AMC.WorldFX.update(dt); if (AMC.Worlds) AMC.Worlds.update(dt);
    ['andrew', 'marco', 'rico'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent) f.update(dt); });
    if (s.fx) s.fx(dt, C.t);
    if (I.hit('back') || I.hit('pause')) { finish(); return true; }
    if (C.pend > 0) { if ((C.pend -= rdt) <= 0) { C.pend = -1; next(); } return true; }   // Pause in der Regie
    if (I.hit('ok') && C.lt > 0.25) next();
    else if (C.li >= 0 && (C.spoke || !C.talking) && C.lt > (C.talking ? 0.6 : C.need)) { if ((C.gap += rdt) > 0.4) next(); }   // nach der Stimme kurz durchatmen
    else if (C.li >= 0 && C.talking && !C.spoke && C.lt > C.need + 14) next();   // Notbremse, falls ein Clip hängt
    return true;
  };

  // ------------------------------------------------------------------ Akte
  const st = () => {
    const a = Save.data.acts = Save.data.acts || { cur: 0, seen: {}, w: {}, v: 2 }; a.seen = a.seen || {}; a.w = a.w || {};
    if (a.v !== 2) {   // alter Spielstand (Akte über Welten/RicoReWi): auf den neuen Hauptweg umrechnen, ohne Belohnungen doppelt zu zahlen
      a.v = 2; const had = Object.keys(a.seen).length > 0;
      if (a.final) a.cur = ACTS.length; else { let i = 0; while (i < ACTS.length - 1 && ACTS[i].ok()) i++; a.cur = i; }
      a.seen = {}; for (let i = 0; i < a.cur; i++) a.seen[i] = 1; if (had && a.cur < ACTS.length) a.seen[a.cur] = 1;
      Save.save();
    }
    return a;
  };
  const career = () => AMC.Career ? AMC.Career.state() : { eps: 0, abos: 0 };
  const guestsMet = () => Object.keys(((Save.data.guests || {}).n) || {}).length;
  const HOSTS_AT = (S, x, y, z, ry, anim) => ['andrew', 'marco'].forEach((id, i) => { const f = W.hosts[id]; if (!f) return; if (!f.root.parent) S.group.add(f.root); f.root.position.set(x + (i ? 1.4 : -1.4), y, z); f.root.rotation.y = ry; f.play(anim || 'idle', { fade: 0.2 }); });
  const around = (S, dx, dy, dz) => [S.pl.x + dx, (S.pl.y || 0) + dy, S.pl.z + dz];
  // Hauptweg: EINE Geschichte. Jeder Akt = Story-Kapitel (echte Folgen) + Ziel in der freien Stadt; Finale mit Abspann.
  const chDone = () => ((Save.data.story || {}).done) || 0;
  const chRange = (from, to) => [Math.max(0, Math.min(to, chDone()) - from + 1), to - from + 1];   // Kapitel from..to (1-basiert)
  const chOk = to => chDone() >= to;
  const abos = () => Math.round(career().abos || 0);
  /** nächstes offenes Story-Kapitel (0-basiert) oder -1 */
  const nextCh = () => (D.CHAPTERS && chDone() < D.CHAPTERS.length ? chDone() : -1);
  const ACTS = [
    { t: 'Akt 1 · Garage mit Mikro', short: 'Spielt Kapitel 1 und nehmt eure erste Folge auf', to: 1,
      goal: 'Spielt Kapitel 1 „Da muss man erstmal reinwachsen“: Themen in der Stadt sammeln, dann die erste Folge aufnehmen.',
      prog: () => chRange(1, 1), ok: () => chOk(1), reward: 100,
      intro: S => [{ cam: around(S, 6, 3, 7), to: around(S, 3.5, 2, 4.5), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, 0.7, 'idle'), lines: [
        ['n', 'Medienstadt. Zwei Freunde, ein Mikrofon – und ein Camper namens Gisela.'],
        ['andrew', 'Marco, wir machen das jetzt richtig. Ein Podcast, den die ganze Stadt hört.'],
        ['marco', 'Die ganze Stadt? Andrew, uns hören gerade drei Leute. Und eine davon ist deine Mutter.'],
        ['andrew', 'Dann fangen wir eben mit vier an. Erste Folge – heute Abend!']]}],
      outro: S => [{ cam: around(S, -5, 3, 6), to: around(S, -3, 2, 4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, -0.6, 'yes'), lines: [
        ['marco', 'Folge eins ist draußen!'], ['andrew', 'Und die Kommentare sind … überraschend nett!'], ['n', 'Die ersten Hörer sind da. Jetzt wollen sie mehr.']]}] },
    { t: 'Akt 2 · Die ersten Fans', short: 'Kapitel 2–4 spielen und 400 Abos holen', to: 4,
      goal: 'Spielt die Kapitel 2 bis 4 (Folgen #02, #03 und #08) und holt 400 Abos – jede Folge am Abend im Funkhaus bringt neue.',
      prog: () => { const c = chRange(2, 4); return [c[0] + (abos() >= 400 ? 1 : 0), c[1] + 1]; }, ok: () => chOk(4) && abos() >= 400, reward: 200,
      intro: S => [{ cam: around(S, 5, 3, -6), to: around(S, 3, 2, -4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, 2.4, 'idle'), lines: [
        ['marco', 'Andrew, wir haben Post! Jemand will wissen, ob wir eher Typ Sommer oder Typ Weihnachten sind.'],
        ['andrew', 'Dann machen wir daraus die nächste Folge. Und danach eine über Klapphandys.'],
        ['n', 'Jede Folge bringt neue Abos. Tagsüber Themen sammeln, abends aufnehmen.']]}] },
    { t: 'Akt 3 · Auf die große Bühne', short: 'Kapitel 5–8 spielen bis zum Podfluencer Festival', to: 8,
      goal: 'Spielt die Kapitel 5 bis 8 (Folgen #13, #22, #23 und #24) – am Ende wartet die Side-Stage des Podfluencer Festivals in München.',
      prog: () => chRange(5, 8), ok: () => chOk(8), reward: 300,
      intro: S => [{ cam: around(S, 6, 3, 6), to: around(S, 4, 2, 4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, 0.8, 'yes'), lines: [
        ['andrew', 'Marco, die vom Podfluencer Festival haben geschrieben. Die wollen uns LIVE.'],
        ['marco', 'Live? Ohne Schnitt? Dann hört ja jeder, wie oft ich „äh“ sage.'],
        ['n', 'Bis zum Festival sind es noch vier Folgen. Und irgendwer stört plötzlich den Funk.']]}],
      outro: S => [{ cam: around(S, 5, 3, 6), to: around(S, 3, 2, 4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, 0.5, 'yes'), lines: [
        ['andrew', 'LIVE vom Podfluencer Festival. Das war unser Ding, Marco.'], ['marco', 'Und Rauschmann hat zugeschaut. Der kommt wieder, wetten?']]}] },
    { t: 'Akt 4 · Das Funkloch kehrt zurück', short: 'Kapitel 9–12 spielen und 3 Studiogäste holen', to: 12,
      goal: 'Spielt die Rückblenden in Kapitel 9 bis 12 (Folgen #04, #11, #12 und #20) und holt 3 verschiedene Studiogäste in eure Show.',
      prog: () => { const c = chRange(9, 12); return [c[0] + Math.min(3, guestsMet()), c[1] + 3]; }, ok: () => chOk(12) && guestsMet() >= 3, reward: 250,
      intro: () => [{ cam: [150, 6, -4], to: [156, 9, -8], look: [158, 14, -16], dur: 7, lines: [
        ['jana', 'Ihr zwei seid das Stadtgespräch! Wer bei euch zu Gast ist, landet morgen in den Nachrichten.'],
        ['andrew', 'Dann holen wir die besten Gäste ins Studio.'], ['marco', 'Und Rauschmann streut schon wieder Störsender in alte Folgen.'], ['gisela', 'Tröööt!']]}],
      outro: S => [{ cam: around(S, 5, 3, -5), to: around(S, 3, 2, -3), look: around(S, 0, 1.4, 0), lines: [['n', 'Zwanzig Folgen, drei Studiogäste und ein besiegtes Funkloch. Die Medienstadt hört zu.']]}] },
    { t: 'Akt 5 · Auf Sendung', short: 'Kapitel 13–17 auf den AnMaCha-Radios spielen', to: 17,
      goal: 'Bringt die AnMaCha-Radioproduktion auf Sendung: Spielt die Kapitel 13 bis 17 auf AnMaCha24, Clubradio24, Christmasradio24, YourTime-FM und Rockradio24.',
      prog: () => chRange(13, 17), ok: () => chOk(17), reward: 400,
      intro: S => [{ cam: around(S, -6, 3, 6), to: around(S, -4, 2, 4), look: around(S, 0, 1.4, 0), pose: S => HOSTS_AT(S, S.pl.x, S.pl.y || 0.12, S.pl.z, -0.7, 'idle'), lines: [
        ['marco', 'Andrew, ein Podcast reicht mir nicht mehr. Ich will Radio. Rund um die Uhr.'],
        ['andrew', 'Zwölf Sender hat die AnMaCha-Radioproduktion. Fangen wir mit AnMaCha24 an.'],
        ['n', 'Die Sender stehen in der ganzen Stadt. Und Rauschmann plant schon seinen größten Störsender.']]}] },
    { t: 'Finale · Das große Radio-Festival', short: '8.000 Abos holen und auf der Festival-Insel auftreten', goal: 'Werdet Stadtgespräch (8.000 Abos) und tretet dann auf der Festival-Insel auf.', prog: () => [Math.min(8000, abos()), 8000], ok: () => !!st().final, reward: 1000, finale: true,
      intro: () => [{ cam: [0, 26, 140], to: [0, 16, 160], look: [0, 6, 196], dur: 8, lines: [
        ['n', 'Eine Nachricht von der Festival-Insel …'],
        ['jana', 'Das Radio-Festival braucht einen Abschluss-Act. Und alle wollen nur euch!'],
        ['marco', 'Live? Vor tausend Leuten?'], ['andrew', 'Vor tausend Leuten. Und Gisela fährt uns hin.']]}] }
  ];
  AC.ACTS = ACTS;
  AC.nextChapter = nextCh;
  /** Zeile oben links in der Stadt: immer das nächste Ziel des Hauptwegs */
  AC.hud = function () {
    const a = st(); if (a.cur >= ACTS.length) return null;
    const d = ACTS[a.cur], p = d.prog(), frac = p[1] ? p[0] / p[1] : 0, tap = I.device === 'touch' ? ' · hier tippen' : I.device === 'pad' ? '' : ' · hier klicken';
    if (!a.seen[a.cur]) return ['📖 ' + d.t + ' beginnt gleich …', frac];
    if (d.finale) return abos() < 8000 ? ['🏆 Finale: Holt 8.000 Abos (' + U.fmt(abos()) + ') – nehmt abends im Funkhaus Folgen auf', abos() / 8000] : ['🏆 Finale: Fahrt zur Festival-Insel und tretet auf der Hauptbühne auf!', 1];
    const n = nextCh();
    if (n >= 0 && n < d.to) return ['📖 ' + d.t.replace(/^Akt (\d+) · /, 'Akt $1: ') + ' – Kapitel ' + (n + 1) + ' „' + D.CHAPTERS[n].title + '“ spielen' + tap, frac];
    if (a.cur === 1 && abos() < 400) return ['📖 Akt 2: Holt 400 Abos (' + U.fmt(abos()) + ') – abends im Funkhaus eine Folge aufnehmen', frac];
    if (a.cur === 3 && guestsMet() < 3) return ['📖 Akt 4: Holt Studiogäste (' + guestsMet() + '/3) – Leute mit ⭐ in der Stadt ansprechen', frac];
    return ['📖 ' + d.t + ' – ' + d.short, frac];
  };
  /** Hauptweg fortsetzen: nächstes Kapitel starten, sonst die Übersicht zeigen */
  AC.go = function () {
    const a = st(), n = nextCh(), d = ACTS[Math.min(a.cur, ACTS.length - 1)];
    if (n >= 0 && a.cur < ACTS.length && !d.finale && n < d.to && AMC.Game && AMC.Game.storyChapter) { AMC.UI.closeAll(); AMC.Game.storyChapter(n); return true; }
    AC.panel(); return false;
  };
  AC.state = () => { const a = st(), d = ACTS[Math.min(a.cur, ACTS.length - 1)], p = d.prog(); return { i: a.cur, done: a.cur >= ACTS.length, title: d.t, goal: d.goal, have: p[0], need: p[1] }; };
  const finaleReady = () => st().cur === ACTS.length - 1 && career().abos >= 8000 && !st().final;
  AC.finaleReady = finaleReady;
  let V = null;
  AC.start = function (S) { V = null; if (!S || S.mode !== 'free' || S.net) return; V = { S, t: st().seen[0] ? 2.5 : 0.6 }; };
  AC.stop = () => { if (C) finish(); V = null; };
  AC.update = function (dt) {
    if (!V || C) return; const S = V.S, a = st();
    if (AMC.Worlds) { const n = AMC.Worlds.name(S.pl.x, S.pl.z); if (n && !/Unterwegs/.test(n) && !a.w[n]) { a.w[n] = 1; Save.save(); } }
    if ((V.t -= dt) > 0 || AMC.UI.isOpen() || (AMC.Worlds && AMC.Worlds.busy && AMC.Worlds.busy()) || S.drive) return; V.t = 1;
    if (a.cur >= ACTS.length) return; const d = ACTS[a.cur];
    if (!a.seen[a.cur] && !d.finale && d.ok()) { a.seen[a.cur] = 1; a.cur++; Save.save(); const f = Save.earn(d.reward); AMC.UI.toast('📖 ' + d.t + ' schon geschafft! +' + f + ' 🎟️', 3200); return; }   // Spielstand ist schon weiter
    if (!a.seen[a.cur] && AC.lastCut && Date.now() - AC.lastCut < 40000) return;   // neuer Akt erst nach etwas freiem Spiel, nicht direkt hinter der letzten Szene
    if (!a.seen[a.cur]) { a.seen[a.cur] = 1; Save.save(); CUT.play(d.intro(S), () => a.cur === 0 ? AC.welcome() : AMC.UI.toast('📖 ' + d.t + ': ' + d.goal, 5000)); return; }
    if (d.finale) { if (finaleReady() && Math.hypot(S.pl.x, S.pl.z - 186) < 7) finale(S); return; }
    if (d.ok()) { const r = d.outro ? d.outro(S) : null; a.cur++; Save.save(); const f = Save.earn(d.reward); AMC.Audio.sfx('win'); const after = () => AMC.UI.toast('📖 ' + d.t + ' geschafft! +' + f + ' 🎟️', 4200); if (r) CUT.play(r, after); else after(); }
  };
  // Finale: Auftritt auf der Hauptbühne mit Feuerwerk, danach Abspann
  function finale(S) {
    const fw = (dt, t) => { if (Math.random() < dt * 2.5) W.particles.burst(U.rand(-30, 30), U.rand(30, 44), U.rand(200, 214), [0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a][Math.floor(Math.random() * 4)], 40, { speed: 9, grav: 3, life: 1.6, size: 0.9, up: 0 }); };
    const onStage = S => { HOSTS_AT(S, 0, 1.42, 194, Math.PI, 'yes'); if (AMC.WorldFX) AMC.WorldFX.cheer(); AMC.Audio.sfx('cheer'); };
    CUT.play([{ cam: [0, 5, 172], to: [0, 4, 182], look: [0, 3, 194], dur: 8, pose: onStage, fx: fw, lines: [
      ['rico', 'Und jetzt: Bühne frei für AnMaCha – der Podcast!', { src: 'sounds/rico/live-5.mp3' }], ['fans', 'AN-MA-CHA! AN-MA-CHA!'], ['andrew', 'Medienstadt! Seid ihr bereit, angemacht zu werden?'], ['marco', 'Das hier ist für alle, die von Anfang an zugehört haben!']]}], () => {
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
      AC.credits(() => AMC.UI.bubble('🏆 Festival-Legenden', 'Ihr habt die Story der Medienstadt abgeschlossen! Die Stadt, die Welten und eure Show laufen weiter – jeder Tag bringt neue Gäste, Trends und Folgen. Alle Kapitel könnt ihr im Menü nochmal spielen.', '+' + f + ' 🎟️ · Abos-Schub nach dem Festival'));
    });
  }
  // Abspann nach dem Finale: echte Menschen und echte Wege zu Podcast und Radio, danach geht das Spiel weiter
  AC.credits = function (done) {
    const P = D.PODCAST || {}, c = career(), stars = Object.values((Save.data.story || {}).stars || {}).reduce((a, b) => a + b, 0);
    const sec = (h, rows) => '<section><h3>' + h + '</h3>' + rows.map(r => '<p>' + r + '</p>').join('') + '</section>';
    const s = AMC.UI.open('<div class="ac-roll"><div class="ac-roll-in">' +
      '<img class="ac-logo" src="' + AMC.UI.podLogo + '" alt=""><h2>AnMaCha – Der Podcast</h2><p class="ac-sub">Das offizielle Spiel</p>' +
      sec('Mit', ['Marco und Andrew', 'und RicoReWi']) +
      sec('Eure Show', [U.fmt(c.eps || 0) + ' Folgen aufgenommen', U.fmt(Math.round(c.abos || 0)) + ' Abos', '⭐ ' + stars + ' von ' + D.CHAPTERS.length * 3 + ' Sternen in ' + D.CHAPTERS.length + ' Kapiteln']) +
      sec('Nach echten Folgen', [D.EPISODES.length + ' Folgen „AnMaCha – Der Podcast“ seit 2020', 'Serious 15 · TV-Anmacher · Musik-Anmacher · TEC News · Feelgood']) +
      sec('Die AnMaCha-Radioproduktion', [D.STATIONS.filter(x => x.slug !== 'ricorewi').map(x => x.name).join(' · '), 'Alle 12 Sender auf MeinRadio.com']) +
      sec('Hört rein', ['Spotify · Apple Podcasts · Amazon Music · Podimo · radio.de · Castbox', 'anmacha.de · Instagram @dieanmacha']) +
      sec('Ein Spiel aus der easygames-Sammlung', ['Wir ♥ Medien']) +
      '<p class="ac-end">Danke fürs Zuhören – und fürs Spielen!</p></div>' +
      '<div class="row ac-roll-btn"><button class="btn primary" data-nav data-first id="acR1">🏙️ Weiterspielen</button>' + (P.spotify ? '<a class="btn" data-nav href="' + P.spotify + '" target="_blank" rel="noopener">🎧 Podcast hören</a>' : '') + '</div></div>',
      { cls: 'ac-credits', back: () => end() });
    let ended = false; const end = () => { if (ended) return; ended = true; AMC.UI.close(s); if (done) done(); };
    s.el.querySelector('#acR1').onclick = end;
    return s;
  };
  // Erste Schritte: nach der Einleitung einmal kurz zeigen, wie das Spiel funktioniert – und direkt ins erste Kapitel
  AC.welcome = function () {
    const pause = I.device === 'touch' ? '⏸ oben rechts' : I.device === 'pad' ? AMC.glyph('start') : 'Esc';
    const s = AMC.UI.open('<div class="panel glass ac-welcome"><header><h2>🎙️ So geht AnMaCha</h2></header><ol class="ac-steps">' +
      '<li><b>📖 Ziel oben links</b><span>Dort steht immer, was als Nächstes dran ist. Antippen startet es.</span></li>' +
      '<li><b>☀️ Tagsüber: Stadt</b><span>Themen-Funken sammeln, Fans und Gäste treffen, Störsender abschalten.</span></li>' +
      '<li><b>🌙 Abends: Folge aufnehmen</b><span>Im Funkhaus wird aus allem eine echte AnMaCha-Folge. Gute Folgen bringen Abos.</span></li>' +
      '<li><b>🏆 Ziel des Spiels</b><span>5 Akte mit 17 Kapiteln nach echten Folgen – bis zum großen Radio-Festival.</span></li>' +
      '<li><b>⏸ Menü</b><span>' + pause + ' öffnet das Menü mit allen Extras: Minispiele, Studio, Radio, Online.</span></li></ol>' +
      '<div class="row"><button class="btn primary" data-nav data-first id="acW1">▶ Kapitel 1 starten</button><button class="btn" data-nav id="acW2">Erst umsehen</button></div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#acW1').onclick = () => { AMC.UI.close(s); AC.go(); };
    s.el.querySelector('#acW2').onclick = () => AMC.UI.close(s);
    return s;
  };
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
