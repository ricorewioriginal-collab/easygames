'use strict';
/* Bunte Insel – Story-Modus 📖: dieselbe Welt, aber die anderen Inseln müssen nach und nach freigespielt werden (wie ein Rollenspiel).
   Freie Welt 🌍 bleibt: dort ist alles offen. Zwischen beiden kann man jederzeit wechseln (Pause-Menü, ⚙️, Aufgabenfenster); der Stand ist derselbe Spielstand –
   Sterne, Sticker, Aufgaben, Inselreise gelten in beiden Modi, schon Geschafftes schaltet im Story-Modus sofort Inseln frei.
   Gesperrte Inseln liegen hinter einer leuchtenden Absperrung (W.lock, die Welt schiebt Spieler/Fahrzeuge hinaus) mit Schild: was noch fehlt. */
BI.STORY_ISLES = [
  /* req = Sticker-Namen aus kids.js, die man dafür schaffen muss (genau diese Aufgaben stehen an der Absperrung, in „Wohin?“ und im Quest-Log) */
  { key: 'CITY', icon: '🏙️', name: 'Stadtinsel', req: ['ride', 'chat', 'shopper'] }, { key: 'PUPS', icon: '🐶', name: 'Fellretter-Bucht', req: ['sleep', 'room', 'garden'] },
  { key: 'RAINBOW', icon: '🌈', name: 'Regenbogeninsel', req: ['photo', 'animal', 'cook'] }, { key: 'DAMPF', icon: '🚢', name: 'Dampfer-Hafen', req: ['boat', 'train', 'heli'] },
  { key: 'DRACHEN', icon: '🐉', name: 'Drachenhöhen', req: ['tree', 'obby', 'fight'] }, { key: 'PARK', icon: '🎡', name: 'Freizeitpark', req: ['cinema', 'swim', 'shoot'] },
  { key: 'FUSSBALL', icon: '⚽', name: 'Fußball-Insel', req: ['play', 'emote', 'mini'] }, { key: 'BAULAND', icon: '🧱', name: 'Bauland', req: ['build', 'paint', 'music'] },
  { key: 'MAERCHEN', icon: '🎠', name: 'Märchenland', req: ['story', 'reader', 'dance'] }, { key: 'SCHLUESSEL', icon: '🗝️', name: 'Schlüsselreich', req: ['angler', 'graeber', 'treasure'] },
  { key: 'SCHWAMM', icon: '🧽', name: 'Schwammi-Bucht', req: ['seepferd', 'slide', 'kaefer'] }, { key: 'RAETSEL', icon: '🗿', name: 'Rätsel-Insel', req: ['forest', 'sammel', 'quiz'] },
  { key: 'ZOTIK', icon: '🦊', name: 'Zotik & Lunaris', req: ['karussell', 'schluesselreich', 'schwammi'] }, { key: 'RADIO', icon: '📻', name: 'Radio-Insel', req: ['raetsel', 'hoehle', 'kapsel'] },
  { key: 'ATLANTIS', icon: '🔱', name: 'Atlantis', req: ['turm_s', 'schmied', 'forscher20'] }
];
/* Neue Insel registrieren (Story-Modus sperrt sie automatisch): BI.addStoryIsland({ key:'NEUE', icon:'🏝️', name:'…', req:['sticker1','sticker2','sticker3'] }).
   Wer das vergisst: Jede Welt, die als BI.<NAME> mit x, z, R und Brücke existiert, wird trotzdem automatisch gesperrt und bekommt 3 noch unbenutzte Sticker als Aufgaben. */
BI.addStoryIsland = d => { if (!BI.STORY_ISLES.some(q => q.key === d.key)) BI.STORY_ISLES.push(d); };
BI.createStoryMode = function (G) {
  const { scene, W, A, fx, P, save, say, persist } = G, K = { list: [] };
  const S = () => { const s = save.storyMode || (save.storyMode = {}); s.unl = s.unl || {}; return s; };
  K.on = () => save.mode === 'story';
  const got = id => (save.stk || []).includes(id);
  const info = id => { const q = G.info && G.info(id); return q ? { icon: q[1], name: q[2], text: q[3] } : { icon: '🏅', name: id, text: id }; };
  K.reqLines = I => I.req.map(id => { const q = info(id); return { ok: got(id), icon: q.icon, text: q.name + ': ' + q.text, id }; });
  const ok = I => I.req.every(got);
  const prog = I => I.req.filter(got).length;
  /* Glaswand: durchsichtig, leuchtend, mit vielen kleinen Schlössern */
  const glass = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = 'rgba(70,160,255,.48)'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 6; c.strokeRect(2, 2, 124, 124);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 96); c.lineTo(96, 0); c.moveTo(40, 128); c.lineTo(128, 40); c.stroke(); c.font = '66px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = 1; c.fillText('🔒', 64, 66);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  function signOf(I) { const cv = document.createElement('canvas'); cv.width = 640; cv.height = 300; I.cv = cv; I.tex = new THREE.CanvasTexture(cv); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: I.tex, transparent: true, depthWrite: false })); sp.scale.set(13, 6.1, 1); sp.renderOrder = 8; return sp; }
  const fit = (c, t, w, f) => { c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; while (c.measureText(t).width > w && f > 14) { f -= 2; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } };
  function paint(I) {
    const c = I.cv.getContext('2d'); c.clearRect(0, 0, 640, 300); c.fillStyle = 'rgba(40,24,70,.9)'; c.beginPath(); c.roundRect ? c.roundRect(6, 6, 628, 288, 32) : c.rect(6, 6, 628, 288); c.fill(); c.lineWidth = 7; c.strokeStyle = '#ffd23f'; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff3b0'; fit(c, '🔒 ' + I.icon + ' ' + I.name, 580, 54); c.fillText('🔒 ' + I.icon + ' ' + I.name, 320, 46);
    c.fillStyle = '#c9cff5'; c.font = 'bold 26px Fredoka, system-ui, sans-serif'; c.fillText('Noch gesperrt – schaffe diese Aufgaben:', 320, 92);
    K.reqLines(I).forEach((r, k) => { const t = (r.ok ? '✅ ' : '⬜ ') + r.icon + ' ' + r.text; c.fillStyle = r.ok ? '#8dffb0' : '#ffffff'; fit(c, t, 590, 29); c.fillText(t, 320, 138 + k * 44); });
    I.tex.needsUpdate = true; I.paint = I.req.filter(got).join();
  }
  function discover() { /* neue, noch nicht eingetragene Welten erkennen und mit Aufgaben versehen */
    const used = new Set(BI.STORY_ISLES.flatMap(d => d.req)), pool = (G.stickerIds ? G.stickerIds() : []).filter(id => !used.has(id) && id !== 'hero');
    for (const k of Object.keys(BI)) { const O = BI[k]; if (!/^[A-Z][A-Z0-9_]*$/.test(k) || !O || typeof O !== 'object' || BI.STORY_ISLES.some(d => d.key === k)) continue; if (typeof O.x === 'number' && typeof O.z === 'number' && typeof O.R === 'number' && O.bridge && O.entry && Math.hypot(O.x, O.z) > 150) { const req = pool.splice(0, 3); if (req.length === 3) { BI.STORY_ISLES.push({ key: k, icon: '🏝️', name: O.name || k.charAt(0) + k.slice(1).toLowerCase(), req, auto: true }); } } }
  }
  function make() {
    if (K.list.length) return; discover();
    for (const d of BI.STORY_ISLES) {
      const O = BI[d.key]; if (!O || O.x == null) continue; const I = Object.assign({ O, r: O.R + 8, lock: { x: O.x, z: O.z, r: O.R + 8, on: false } }, d);
      glass.repeat.set(1, 1); const tex = glass.clone(); tex.needsUpdate = true; tex.repeat.set(Math.round(I.r * 6.28 / 9), 2);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(I.r, I.r, 18, 64, 1, true), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, color: 0xffffff })); m.position.set(O.x, 9, O.z); m.visible = false; m.renderOrder = 6; scene.add(m); I.mesh = m;
      const sp = signOf(I), l = Math.hypot(O.x, O.z) || 1, dx = -O.x / l, dz = -O.z / l; sp.position.set(O.x + dx * (I.r + 1), 4.8, O.z + dz * (I.r + 1)); sp.visible = false; scene.add(sp); I.sp = sp;
      K.list.push(I); (W.lock = W.lock || []).push(I.lock);
    }
  }
  K.open = I => !K.on() || !!S().unl[I.key] || ok(I) || !!(save.cheat && save.cheat.open);
  K.islands = () => { make(); return K.list; };
  /* Liegt ein Punkt in einer noch gesperrten Welt? (für „Wohin?“, Wegweiser, Hinzaubern) */
  K.lockedAt = (x, z) => { if (!K.on()) return null; make(); for (const I of K.list) if (!K.open(I) && Math.hypot(x - I.O.x, z - I.O.z) < I.r + 14) return I; return null; };
  K.reqText = I => '🔒 ' + I.icon + ' ' + I.name + ' ist noch gesperrt. Schaffe: ' + K.reqLines(I).filter(r => !r.ok).map(r => r.icon + ' ' + r.text.split(':')[0]).join(' · ');
  K.apply = function () {
    make(); const st = K.on(); for (const I of K.list) { const lk = st && !K.open(I); I.lock.on = lk; I.mesh.visible = lk; I.sp.visible = lk; if (lk) paint(I); }
  };
  K.setMode = function (m, quiet) {
    if (m !== 'story') m = 'free'; if (save.mode === m && !quiet) return; save.mode = m; persist(); K.apply();
    if (quiet) return; A.fanfare && A.fanfare();
    if (m === 'story') say('📖 Story-Modus an – dein Stand bleibt erhalten. Gesperrte Welten liegen hinter einer Glaswand mit Schloss. 🔒', 5200); else say('🌍 Freie Welt: Alles ist offen – dein Stand bleibt erhalten.', 4200);
    G.refresh && G.refresh();
  };
  /* Beim Start im Story-Modus zum ersten Mal: zuhause beginnen */
  K.intro = function () {
    const s = S(); if (s.started) return; s.started = 1; persist(); if (G.goHome) G.goHome();
    setTimeout(() => say('📖 Story-Modus: Du startest zuhause! Erfülle Aufgaben, so öffnen sich nach und nach neue Welten. Alles steht im Aufgaben-Buch 📋.', 7000), 800);
    if (G.speak) G.speak('Willkommen im Story Modus! Du startest zuhause. Erfülle Aufgaben, dann öffnen sich nach und nach neue Welten.');
  };
  K.toggle = () => K.setMode(K.on() ? 'free' : 'story');
  /* Freischalten erkennen (alle 0,7 s) */
  let tmr = 0;
  K.update = function (dt, t) {
    if (!K.list.length) return; tmr -= dt; const st = K.on();
    for (const I of K.list) if (I.mesh.visible) I.mesh.material.opacity = .78 + Math.sin(t * 2.2 + I.O.x) * .12;
    if (tmr > 0) return; tmr = .7; if (!st) return; const s = S();
    for (const I of K.list) {
      if (I.lock.on && ok(I)) { s.unl[I.key] = 1; persist(); I.lock.on = false; I.mesh.visible = false; I.sp.visible = false; A.fanfare && A.fanfare(); fx.burst(P.x, 2.6, P.z, 40, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 8, 1.4, 28, 6); say('🔓 Neue Welt freigeschaltet: ' + I.icon + ' ' + I.name + '!', 5200); if (A.speak) A.speak('Neue Welt freigeschaltet: ' + I.name);
      } else if (I.lock.on && I.paint !== I.req.filter(got).join()) paint(I);
    }
  };
  /* Quest-Log: Welten freischalten (nur Story-Modus) */
  K.worldLog = function () {
    if (!K.on()) return null; make(); const n = K.list.filter(I => K.open(I)).length;
    return { count: n + ' von ' + K.list.length, n, total: K.list.length, worlds: K.list.map(I => ({ icon: I.icon, name: I.name, open: K.open(I), p: K.open(I) ? I.req.length : prog(I), of: I.req.length, reqs: K.reqLines(I).map(r => ({ ok: r.ok, icon: r.icon, text: r.text })) })) };
  };
  K.dbg = { list: K.list, ok, S, info };
  return K;
};
