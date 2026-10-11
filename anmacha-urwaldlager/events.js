/* Urwaldlager – Überraschungs-Ereignisse im Camp (frecher Affe, Unwetter, Streit, Gummischlange, Heimweh),
   Geheimauftrag „Lianenpost“ und nächtliche Vorfälle. Alle Tiere sind virtuell bzw. Requisiten – niemand leidet. */
(function (root) {
  'use strict';
  const E = root.UE, W = root.UWorld, C = root.UCamp, S = root.USeason, THREE = E.THREE, clamp = E.clamp;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const EV = { cur: null };
  let UI = null, Snd = null, monkey = null, snake = null, envs = [];
  const G = () => S.G, pl = W.player, nm = c => C.nm(c);
  EV.init = ui => { UI = ui; Snd = root.USnd; };

  // ---------- Requisiten (einfach, wiederverwendet) ----------
  function makeMonkey() {
    const g = new THREE.Group(), fur = E.mat(0x6b4a2a), face = E.mat(0xd9b48a);
    const body = new THREE.Mesh(E.geo.sph, fur); body.scale.set(.32, .38, .3); body.position.y = .45; g.add(body);
    const head = new THREE.Mesh(E.geo.sph, fur); head.scale.setScalar(.22); head.position.set(0, .88, .05); g.add(head);
    const mug = new THREE.Mesh(E.geo.sph, face); mug.scale.set(.15, .12, .1); mug.position.set(0, .85, .2); g.add(mug);
    const tail = new THREE.Mesh(E.geo.cyl, fur); tail.scale.set(.05, .7, .05); tail.position.set(0, .55, -.35); tail.rotation.x = -.9; g.add(tail);
    const loot = new THREE.Mesh(E.geo.box, E.mat(0xffcf4a)); loot.scale.set(.22, .16, .16); loot.position.set(.22, .6, .18); g.add(loot);
    g.userData.body = body; W.scene.add(g); return g;
  }
  function makeSnake() {
    const g = new THREE.Group(), m = E.mat(0x3fae3a);
    for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(E.geo.sphLo || E.geo.sph, m); const k = 1 - i / 12; s.scale.set(.11 * k, .08 * k, .11 * k); s.position.set(Math.sin(i * .9) * .25, .06, i * .17 - .7); g.add(s); }
    const eye = E.mat(0xffffff); [-.05, .05].forEach(x => { const e = new THREE.Mesh(E.geo.sphLo || E.geo.sph, eye); e.scale.setScalar(.025); e.position.set(x + Math.sin(0) * .25, .12, -.75); g.add(e); });
    W.scene.add(g); return g;
  }
  function makeEnvelope() { const g = new THREE.Mesh(E.geo.box, E.mat(0xfff2b0, { emissive: 0x554400 })); g.scale.set(.42, .06, .3); W.scene.add(g); return g; }

  // ---------- Interaktionen (einmal registriert, Label = null wenn inaktiv) ----------
  C.extraInteract = function () {
    W.addInteract({ pos: () => EV.cur && EV.cur.id === 'regen' && EV.cur.spots ? EV.cur.spots.find(s => !s.fixed) || null : null, r: 2.4, prio: 3, label: () => '🧰 Plane flicken', act: fixTarp });
    W.addInteract({ pos: () => EV.cur && EV.cur.id === 'streit' && EV.cur.phase === 'on' ? EV.cur.mid : null, r: 2.8, prio: 3, label: () => '⚖️ Streit schlichten', act: mediate });
    W.addInteract({ pos: () => EV.cur && EV.cur.id === 'schlange' && !EV.cur.found ? EV.cur.pos : null, r: 2.2, prio: 3, label: () => '🐍 Was liegt da im Bett?', act: snakeFound });
    W.addInteract({ pos: () => EV.cur && EV.cur.id === 'heimweh' && EV.cur.n && !EV.cur.n.away ? EV.cur.n : null, r: 2.3, prio: 3, label: () => `🫂 ${nm(EV.cur.n.c)} trösten`, act: comfort });
    W.addInteract({ pos: () => EV.cur && EV.cur.id === 'affe' && monkey && monkey.visible ? { x: monkey.position.x, z: monkey.position.z } : null, r: 1.7, prio: 4, label: () => '🐒 Affen schnappen!', act: catchMonkey });
    for (let i = 0; i < 3; i++) W.addInteract({ pos: () => { const m = G() && G().today.mission; return m && m.kind === 'post' && !m.done && m.spots[i] && !m.spots[i].got ? m.spots[i] : null; }, r: 2, prio: 2, label: () => '📜 Umschlag aufheben', act: () => grabEnvelope(i) });
  };

  // ---------- Ablauf ----------
  EV.tick = function (dt, gm) {
    const g = G(), t = g.today, h = S.hour();
    // Lianenpost
    const m = t.mission; if (m && m.kind === 'post' && !m.done && !m.failed && g.clock > m.until) { m.failed = true; envs.forEach(e => { e.visible = false; }); UI.toast('📜 Zu spät – die Lianenpost wurde wieder eingesammelt.', 'bad'); }
    envs.forEach((e, i) => { if (e.visible) { e.rotation.y += dt * 1.5; e.position.y = W.heightAt(e.position.x, e.position.z) + .5 + Math.sin(W.t * 3 + i) * .08; } });
    // neues Ereignis starten
    if (!EV.cur && pl.state === 'free' && !UI.modalOpen() && !t.ceremonyCalled && h < 20) {
      const ev = t.events.find(e => !e.done && g.clock >= e.at); if (ev) { ev.done = true; if (!g.usedEvents.includes(ev.id)) g.usedEvents.push(ev.id); if (g.usedEvents.length >= 5) g.usedEvents = []; start(ev.id); }
    }
    const c = EV.cur; if (!c) return;
    c.age += gm;
    if (c.id === 'affe') monkeyStep(dt, c);
    if (c.id === 'regen') { if (c.age > 100) endRain(false); }
    if (c.id === 'streit') { if (c.phase === 'on' && c.age > 75) endFight(null); }
    if (c.id === 'schlange') { if (snake) snake.children.forEach((s, i) => { s.position.x = Math.sin(i * .9 + W.t * 4) * .25; }); if (c.age > 150) { snake.visible = false; EV.cur = null; } }
    if (c.id === 'heimweh') { if (c.age > 150 || !c.n || c.n.away) endHome(false); }
  };
  function start(id) {
    const g = G(), others = C.npcs.filter(n => !n.away);
    if (others.length < 2 && (id === 'streit' || id === 'heimweh')) id = 'affe';
    EV.cur = { id, age: 0 }; Snd.drum();
    if (id === 'affe') {
      if (!monkey) monkey = makeMonkey(); monkey.visible = true; monkey.position.set(1.5, 0, 1.5); EV.cur.vx = 0; EV.cur.vz = 0; EV.cur.limit = 110;
      UI.announce({ title: '🐒 Ein frecher Affe!', html: '<p>Ein Kapuzineraffe hat den <b>Gewürzbeutel</b> vom Kochplatz stibitzt und rennt damit durchs Camp! Schnapp ihn dir, bevor er im Dschungel verschwindet – sonst gibt’s heute nur fades Essen.</p><p class="h">Keine Sorge: Der Affe ist ein virtuelles Tier, ihm passiert nichts. Er lässt den Beutel einfach fallen.</p>', short: true });
      others.forEach(n => C.say(n.id, 'scared'));
    } else if (id === 'regen') {
      g.today.forceRain = true; const b = W.beds; const s1 = b[0], s2 = b[Math.max(0, b.length - 1)];
      EV.cur.spots = [{ x: s1.x * .6, z: s1.z + .8 }, { x: s2.x * .6, z: s2.z + .8 }].map(p => ({ x: p.x, z: p.z, fixed: false }));
      UI.announce({ title: '⛈️ Unwetter!', html: '<p>Ein Wolkenbruch zieht auf – und die Plane über den Schlafplätzen ist an <b>zwei Stellen eingerissen</b>! Flick sie, bevor alles nass wird. Nasse Betten bedeuten heute Nacht schlechten Schlaf für alle.</p>', short: true });
    } else if (id === 'streit') {
      const pairs = []; others.forEach(a => others.forEach(b => { if (a.id < b.id) pairs.push([a, b, C.rel(a.id, b.id)]); })); pairs.sort((x, y) => x[2] - y[2]);
      const [a, b] = pairs[0], mx = SP().wood.x - 2.5, mz = SP().wood.z - 2.2; EV.cur.a = a; EV.cur.b = b; EV.cur.phase = 'on'; EV.cur.mid = { x: mx, z: mz };
      [[a, b, -.8], [b, a, .8]].forEach(([n, o, dx]) => { n.act = { type: 'argue', phase: 'go', tx: mx + dx, tz: mz, t: 0, dur: 9999, pose: 'argue', other: o.id, passive: true, ev: true }; n.say = { txt: pick(root.JD.SAY.argue), t: 3, cls: 'argue' }; });
      UI.announce({ title: '💥 Zoff im Camp!', html: `<p><b>${nm(a.c)}</b> und <b>${nm(b.c)}</b> sind sich am Holzstapel in die Haare geraten – es geht um die Arbeitsverteilung und wer zuletzt die Stirnlampe hatte. Gehst du dazwischen?</p>`, short: true });
    } else if (id === 'schlange') {
      const b = C.bedOf('you'), prank = others.find(n => n.c.trait === 'clown') || pick(others); EV.cur.prank = prank; EV.cur.pos = { x: b.x, z: b.z }; EV.cur.found = false;
      if (!snake) snake = makeSnake(); snake.visible = true; snake.position.set(b.x, W.heightAt(b.x, b.z) + .45, b.z); snake.rotation.y = b.yaw;
      UI.toast('🤫 Irgendwer kichert in der Nähe deines Bettes …');
    } else if (id === 'heimweh') {
      const n = others.slice().sort((x, y) => x.c.needs.mood - y.c.needs.mood)[0]; EV.cur.n = n; n.c.needs.mood = Math.min(n.c.needs.mood, 30);
      n.act = { type: 'sad', phase: 'go', tx: SP().hut.x + 1.8, tz: SP().hut.z + 1.5, t: 0, dur: 9999, pose: 'sad', ev: true }; n.say = { txt: 'Ich vermiss meine Familie so …', t: 4, cls: '' };
      UI.toast(`😢 ${nm(n.c)} sitzt allein bei der Plauderhöhle und wirkt traurig.`);
    }
    S.log({ affe: 'Ein Affe klaut den Gewürzbeutel!', regen: 'Unwetter: Die Plane reißt.', streit: 'Streit im Camp.', schlange: 'Eine Gummischlange taucht auf.', heimweh: 'Jemand hat Heimweh.' }[id]);
  }
  const SP = () => W.SP;
  // Affe: flieht vor dir, bleibt in der Nähe des Camps
  function monkeyStep(dt, c) {
    const m = monkey.position, dx = m.x - pl.x, dz = m.z - pl.z, d = Math.hypot(dx, dz) || 1;
    c.limit -= dt; let ax = 0, az = 0;
    if (d < 9) { ax += dx / d * 3; az += dz / d * 3; } else { ax += Math.sin(W.t * .7 + c.age) * 1.2; az += Math.cos(W.t * .5) * 1.2; }
    const r = Math.hypot(m.x, m.z - 2); if (r > 18) { ax -= m.x / r * 4; az -= (m.z - 2) / r * 4; }
    c.vx = E.lerp(c.vx, ax, Math.min(1, dt * 3)); c.vz = E.lerp(c.vz, az, Math.min(1, dt * 3));
    const sp = Math.hypot(c.vx, c.vz), max = d < 9 ? 4.6 : 2; if (sp > max) { c.vx *= max / sp; c.vz *= max / sp; }
    let nx = m.x + c.vx * dt, nz = m.z + c.vz * dt;[nx, nz] = W.collide(nx, nz, .3);
    if (Math.hypot(nx - m.x, nz - m.z) < Math.hypot(c.vx, c.vz) * dt * .3 && d < 4) { nx = m.x - c.vz * dt * 1.5; nz = m.z + c.vx * dt * 1.5;[nx, nz] = W.collide(nx, nz, .3); }
    m.set(nx, W.heightAt(nx, nz) + Math.abs(Math.sin(W.t * 12)) * .18, nz); monkey.rotation.y = Math.atan2(c.vx, c.vz);
    if (d < 1.15) return catchMonkey();
    if (c.limit <= 0) { monkey.visible = false; EV.cur = null; G().today.noSpice = true; UI.toast('🐒 Weg ist er – samt Gewürzbeutel. Das Abendessen wird fade.', 'bad'); S.aud('you', { E: 1 }, 'jagt einen Affen durchs Camp'); }
  }
  function catchMonkey() {
    if (!EV.cur || EV.cur.id !== 'affe') return; monkey.visible = false; EV.cur = null; Snd.fan();
    S.aud('you', { E: 4, S: 2 }, 'fängt den frechen Affen'); C.npcs.forEach(n => { if (!n.away && Math.hypot(n.x - pl.x, n.z - pl.z) < 20) { C.addRel(n.id, 'you', 2, true); C.say(n.id, 'cheer'); } });
    UI.toast('🐒 Geschnappt! Der Affe lässt den Gewürzbeutel fallen und turnt davon.', 'good'); S.log('Du hast den Affen geschnappt.');
  }
  function fixTarp() {
    const c = EV.cur; if (!c || c.id !== 'regen') return; const s = c.spots.find(x => !x.fixed); if (!s) return;
    C.busy ? C.busy(2.5, 'work', done) : done();
    function done() { s.fixed = true; Snd.thud(); if (c.spots.every(x => x.fixed)) endRain(true); else UI.toast('🧰 Eine Stelle geflickt – noch eine!'); }
  }
  function endRain(fixed) {
    const g = G(); g.today.forceRain = false; EV.cur = null;
    if (fixed) { S.aud('you', { S: 3 }, 'flickt im Regen die Plane'); C.npcs.forEach(n => { if (!n.away) C.addRel(n.id, 'you', 2, true); }); UI.toast('⛺ Plane dicht! Heute Nacht bleibt alles trocken.', 'good'); S.log('Du hast die Plane geflickt.'); }
    else { g.camp.wet = true; UI.toast('💦 Die Betten sind nass geworden – schlechter Schlaf heute Nacht.', 'bad'); S.log('Die Betten sind nass.'); }
  }
  function mediate() {
    const c = EV.cur; if (!c || c.id !== 'streit') return; const a = c.a, b = c.b; pl.state = 'talk';
    UI.choice({ title: '⚖️ Streit schlichten', text: `${nm(a.c)}: „Ich mach hier alles allein!“ – ${nm(b.c)}: „Gar nicht wahr, du kommandierst nur rum!“ Was sagst du?`, options: [
      { id: 'fair', label: '🤝 Beide anhören und einen Arbeitsplan vorschlagen' },
      { id: 'a', label: `👉 ${nm(a.c)} hat recht` }, { id: 'b', label: `👉 ${nm(b.c)} hat recht` },
      { id: 'popcorn', label: '🍿 Nicht einmischen und zuschauen' }], onPick: id => {
        const chips = []; const rel = (n, d) => { C.addRel(n.id, 'you', d, true); chips.push(['Beziehung ' + nm(n.c), d]); };
        if (id === 'fair') { const ok = Math.random() < .7; if (ok) { rel(a, 6); rel(b, 6); C.addRel(a.id, b.id, 12, true); S.aud('you', { S: 4 }, 'schlichtet einen Streit'); chips.push(['Sympathie', 4]); } else { rel(a, 2); rel(b, 2); S.aud('you', { S: 2 }, 'versucht zu schlichten'); chips.push(['Sympathie', 2]); } endFight(ok ? 'Die beiden geben sich die Hand. Plan steht: abwechselnd Holz und Wasser.' : 'Etwas ruhiger ist es jetzt – ganz vorbei ist der Zoff aber nicht.', chips); }
        else if (id === 'a' || id === 'b') { const w = id === 'a' ? a : b, l = id === 'a' ? b : a; rel(w, 9); rel(l, -10); S.aud('you', { E: 3, S: -1 }, 'ergreift Partei im Streit'); chips.push(['Unterhaltung', 3]); endFight(`${nm(w.c)} grinst triumphierend, ${nm(l.c)} stapft beleidigt davon.`, chips); }
        else { S.aud('you', { E: 1 }, 'schaut beim Streit zu'); chips.push(['Unterhaltung', 1]); C.addRel(a.id, b.id, -8, true); endFight('Der Streit geht noch eine Weile weiter. Die Kamera hat alles drauf.', chips); }
      } });
  }
  function endFight(text, chips) {
    const c = EV.cur; if (!c) return; [c.a, c.b].forEach(n => { if (n.act && n.act.ev) { n.act = null; n.think = .5; } }); c.phase = 'done'; EV.cur = null;
    if (text) UI.choiceResult(text, chips || [], () => { pl.state = 'free'; });
    else { C.addRel(c.a.id, c.b.id, -10, true); UI.toast(`💢 ${nm(c.a.c)} und ${nm(c.b.c)} haben sich nicht vertragen.`); }
  }
  function snakeFound() {
    const c = EV.cur; if (!c || c.id !== 'schlange') return; c.found = true; const p = c.prank; pl.state = 'talk'; Snd.bad();
    UI.choice({ title: '🐍 Eine Schlange im Bett!', text: `Moment … die ist aus Gummi! Hinter dem Baum lacht sich ${nm(p.c)} kaputt. Wie reagierst du?`, options: [
      { id: 'lachen', label: '😂 Mitlachen' }, { id: 'kreischen', label: '😱 Theatralisch kreischen' }, { id: 'rache', label: '😈 Sie heimlich zurücklegen' }, { id: 'sauer', label: '😠 Beschweren' }], onPick: id => {
        snake.visible = false; EV.cur = null; const chips = []; const r = d => { C.addRel(p.id, 'you', d, true); chips.push(['Beziehung ' + nm(p.c), d]); }; const a = (d, why) => { S.aud('you', d, why); if (d.S) chips.push(['Sympathie', d.S]); if (d.E) chips.push(['Unterhaltung', d.E]); };
        let t = '';
        if (id === 'lachen') { r(6); a({ S: 2, E: 1 }, 'nimmt einen Streich mit Humor'); t = `${nm(p.c)} klopft dir auf die Schulter: „Du bist cool!“`; }
        else if (id === 'kreischen') { r(3); a({ E: 4 }, 'kreischt wegen einer Gummischlange'); t = 'Das halbe Camp kommt angerannt – das wird ein Zuschauer-Hit (simuliert).'; }
        else if (id === 'rache') { r(-2); a({ E: 3 }, 'rächt sich mit der Gummischlange'); C.say(p.id, null, 'AAAH! … Okay, Punkt für dich.'); t = 'Eine Stunde später hört man einen Schrei aus dem Schlafsack von ' + nm(p.c) + '. Ausgleich!'; }
        else { r(-6); a({ S: -1, E: 1 }, 'beschwert sich über einen Streich'); t = `${nm(p.c)} verdreht die Augen: „War doch nur Spaß …“`; }
        UI.choiceResult(t, chips, () => { pl.state = 'free'; });
      } });
  }
  function comfort() {
    const c = EV.cur; if (!c || c.id !== 'heimweh') return; const n = c.n, tr = root.JD.TRAITS[n.c.trait]; pl.state = 'talk';
    UI.choice({ title: `🫂 ${nm(n.c)} hat Heimweh`, text: `„Ich vermiss meine Leute so. Was mach ich eigentlich hier?“`, options: [
      { id: 'hoeren', label: '👂 Zuhören und erzählen lassen' }, { id: 'witz', label: '🤪 Mit einem Witz aufheitern' }, { id: 'plan', label: '🌅 „Morgen zeigst du es allen!“' }, { id: 'hart', label: '🙄 „Reiß dich zusammen.“' }], onPick: id => {
        const chips = []; let d = 0, mood = 0, aud = {}, t = '';
        if (id === 'hoeren') { d = 12; mood = 28; aud = { S: 3 }; t = 'Ihr redet lange. Am Ende lächelt ' + nm(n.c) + ' wieder.'; }
        else if (id === 'witz') { const ok = tr.humor > .45; d = ok ? 8 : -2; mood = ok ? 22 : 0; aud = ok ? { E: 2, S: 1 } : { E: 1 }; t = ok ? 'Prusten unter Tränen – Witz gelungen!' : '„Gerade ist mir echt nicht nach Witzen.“'; }
        else if (id === 'plan') { d = 6; mood = 15; aud = { S: 2 }; t = '„Du hast recht. Ich bin nicht umsonst hier!“'; }
        else { d = -8; mood = -5; aud = { E: 2, S: -2 }; t = nm(n.c) + ' dreht sich wortlos weg.'; }
        C.addRel(n.id, 'you', d, true); chips.push(['Beziehung ' + nm(n.c), d]); n.c.needs.mood = clamp(n.c.needs.mood + mood, 0, 100); S.aud('you', aud, 'tröstet bei Heimweh'); if (aud.S) chips.push(['Sympathie', aud.S]); if (aud.E) chips.push(['Unterhaltung', aud.E]);
        endHome(true); UI.choiceResult(t, chips, () => { pl.state = 'free'; });
      } });
  }
  function endHome(helped) { const c = EV.cur; if (!c) return; if (c.n && c.n.act && c.n.act.ev) { c.n.act = null; c.n.think = .5; } if (!helped && c.n) S.log(`${nm(c.n.c)} hat sich allein wieder gefangen.`); EV.cur = null; }

  // ---------- Geheimauftrag Lianenpost ----------
  EV.missionSetup = function () {
    const m = G().today.mission; envs.forEach(e => { e.visible = false; }); if (!m || m.kind !== 'post') return;
    m.spots.forEach((s, i) => { [s.x, s.z] = W.collide(s.x, s.z, .4); let e = envs[i]; if (!e) e = envs[i] = makeEnvelope(); e.visible = !s.got; e.position.set(s.x, W.heightAt(s.x, s.z) + .5, s.z); });
  };
  function grabEnvelope(i) {
    const m = G().today.mission; if (!m || m.done || m.spots[i].got) return; m.spots[i].got = true; if (envs[i]) envs[i].visible = false; Snd.star();
    const n = m.spots.filter(s => s.got).length; if (n >= m.spots.length) S.missionDone(); else UI.toast(`📜 Umschlag ${n}/${m.spots.length}`);
  }
  // ---------- Nacht ----------
  EV.nightThief = function () {
    const others = C.npcs.filter(n => !n.away); if (!others.length) return S.nextDay();
    const thief = others.slice().sort((a, b) => root.JD.TRAITS[a.c.trait].fleiss - root.JD.TRAITS[b.c.trait].fleiss + (Math.random() - .5) * .4)[0];
    UI.choice({ title: '🌙 Geraschel in der Nacht', text: 'Mitten in der Nacht hörst du es an der Vorratskiste rascheln. Jemand nascht vom Notfall-Reis …', options: [{ id: 'look', label: '🔦 Aufstehen und nachsehen (−8 Energie)' }, { id: 'sleep', label: '😴 Weiterschlafen' }], onPick: id => {
      if (id === 'sleep') { G().camp.water = Math.max(0, G().camp.water - 1); return UI.choiceResult('Am Morgen fehlt etwas Reis – und das Wasserfass ist leerer als gedacht.', [['Wasser', -1]], () => S.nextDay()); }
      G().you.needs.energy = Math.max(0, G().you.needs.energy - 8);
      UI.choice({ title: '🔦 Erwischt!', text: `Im Lichtkegel: ${nm(thief.c)}, Backen voller Reis. „Bitte sag’s keinem!“`, options: [{ id: 'secret', label: '🤐 Geheimnis bewahren' }, { id: 'share', label: '🍚 Mitnaschen' }, { id: 'tell', label: '📢 Morgen allen erzählen' }], onPick: k => {
        const chips = [['Energie', -8]];
        if (k === 'secret') { C.addRel(thief.id, 'you', 10, true); chips.push(['Beziehung ' + nm(thief.c), 10]); S.aud('you', { S: 1 }, 'bewahrt ein Geheimnis'); }
        else if (k === 'share') { C.addRel(thief.id, 'you', 6, true); G().you.needs.hunger = Math.min(100, G().you.needs.hunger + 8); chips.push(['Beziehung ' + nm(thief.c), 6], ['Sattheit', 8]); S.aud('you', { E: 2 }, 'nascht nachts mit'); }
        else { C.addRel(thief.id, 'you', -14, true); others.forEach(n => { if (n !== thief) C.addRel(n.id, thief.id, -5, true); }); S.aud(thief.id, { S: -4 }, 'beim Naschen erwischt', true); S.aud('you', { E: 3, S: 1 }, 'deckt den Reis-Dieb auf'); chips.push(['Beziehung ' + nm(thief.c), -14]); }
        S.log(`Nachts: ${nm(thief.c)} beim Naschen erwischt.`);
        UI.choiceResult(k === 'tell' ? 'Beim Frühstück erzählst du alles. Peinliches Schweigen – das Publikum (simuliert) liebt es.' : 'Ihr schleicht zurück in die Schlafsäcke.', chips, () => S.nextDay());
      } });
    } });
  };
  EV.goal = function () {
    const c = EV.cur, g = G();
    if (c && c.id === 'affe' && monkey) return { x: monkey.position.x, z: monkey.position.z, txt: `🐒 Schnapp den Affen! (${Math.max(0, Math.ceil(c.limit))} s)` };
    if (c && c.id === 'regen') { const s = c.spots.find(x => !x.fixed); if (s) return { x: s.x, z: s.z, txt: '🧰 Flick die Plane über den Betten!' }; }
    if (c && c.id === 'streit' && c.phase === 'on') return { x: c.mid.x, z: c.mid.z, txt: `💥 Streit am Holzstapel: ${nm(c.a.c)} gegen ${nm(c.b.c)}` };
    if (c && c.id === 'heimweh' && c.n) return { x: c.n.x, z: c.n.z, txt: `😢 ${nm(c.n.c)} braucht jemanden zum Reden` };
    const m = g.today.mission;
    if (m && m.kind === 'post' && !m.done && !m.failed) { const s = m.spots.filter(x => !x.got).sort((a, b) => Math.hypot(a.x - pl.x, a.z - pl.z) - Math.hypot(b.x - pl.x, b.z - pl.z))[0]; if (s) return { x: s.x, z: s.z, txt: `📜 Lianenpost: ${m.spots.filter(x => x.got).length}/3 Umschläge (bis 17 Uhr)` }; }
    return null;
  };
  // Beim Laden/Tageswechsel: laufende Ereignisse sauber beenden
  EV.reset = function () { if (monkey) monkey.visible = false; if (snake) snake.visible = false; envs.forEach(e => { e.visible = false; }); if (EV.cur && (EV.cur.a || EV.cur.n)) [EV.cur.a, EV.cur.b, EV.cur.n].forEach(n => { if (n && n.act && n.act.ev) n.act = null; }); EV.cur = null; if (G() && G().today) G().today.forceRain = false; };
  root.UEvents = EV;
})(window);
