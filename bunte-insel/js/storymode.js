'use strict';
/* Bunte Insel – Story-Modus 📖: dieselbe Welt, aber die anderen Inseln müssen nach und nach freigespielt werden (wie ein Rollenspiel).
   Freie Welt 🌍 bleibt: dort ist alles offen. Zwischen beiden kann man jederzeit wechseln (Pause-Menü, ⚙️, Aufgabenfenster); der Stand ist derselbe Spielstand –
   Sterne, Sticker, Aufgaben, Inselreise gelten in beiden Modi, schon Geschafftes schaltet im Story-Modus sofort Inseln frei.
   Gesperrte Inseln liegen hinter einer leuchtenden Absperrung (W.lock, die Welt schiebt Spieler/Fahrzeuge hinaus) mit Schild: was noch fehlt. */
BI.STORY_ISLES = [
  /* key = BI.<KEY>, c = abgeschlossene Inselreise-Kapitel, k = gesammelte Sticker */
  { key: 'CITY', icon: '🏙️', name: 'Stadtinsel', c: 2, k: 0 }, { key: 'PUPS', icon: '🐶', name: 'Fellretter-Bucht', c: 3, k: 0 }, { key: 'RAINBOW', icon: '🌈', name: 'Regenbogeninsel', c: 4, k: 0 },
  { key: 'DAMPF', icon: '🚢', name: 'Dampfer-Hafen', c: 5, k: 0 }, { key: 'DRACHEN', icon: '🐉', name: 'Drachenhöhen', c: 6, k: 0 }, { key: 'PARK', icon: '🎡', name: 'Freizeitpark', c: 7, k: 0 },
  { key: 'FUSSBALL', icon: '⚽', name: 'Fußball-Insel', c: 9, k: 15 }, { key: 'BAULAND', icon: '🧱', name: 'Bauland', c: 9, k: 20 }, { key: 'MAERCHEN', icon: '🎠', name: 'Märchenland', c: 9, k: 28 },
  { key: 'SCHLUESSEL', icon: '🗝️', name: 'Schlüsselreich', c: 9, k: 36 }, { key: 'SCHWAMM', icon: '🧽', name: 'Schwammi-Bucht', c: 9, k: 44 }, { key: 'RAETSEL', icon: '🗿', name: 'Rätsel-Insel', c: 9, k: 52 },
  { key: 'ZOTIK', icon: '🦊', name: 'Zotik & Lunaris', c: 9, k: 60 }, { key: 'RADIO', icon: '📻', name: 'Radio-Insel', c: 9, k: 68 }, { key: 'ATLANTIS', icon: '🔱', name: 'Atlantis', c: 9, k: 76 }
];
BI.createStoryMode = function (G) {
  const { scene, W, A, fx, P, save, say, persist } = G, K = { list: [] }, TAU = Math.PI * 2;
  const S = () => { const s = save.storyMode || (save.storyMode = {}); s.unl = s.unl || {}; return s; };
  K.on = () => save.mode === 'story';
  const have = () => ({ c: G.chapters ? G.chapters() : 0, k: (save.stk || []).length });
  const ok = I => { const h = have(); return h.c >= I.c && h.k >= I.k; };
  const stripes = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 8; const c = cv.getContext('2d'); c.fillStyle = 'rgba(255,200,60,.9)'; c.fillRect(0, 0, 32, 8); c.fillStyle = 'rgba(255,120,40,.55)'; c.fillRect(32, 0, 32, 8); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 1); return t; })();
  function sign(I) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const c = cv.getContext('2d'); I.cv = cv; I.tex = new THREE.CanvasTexture(cv);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: I.tex, transparent: true, depthWrite: false })); sp.scale.set(12, 3.75, 1); sp.renderOrder = 8; return sp;
  }
  function paint(I) {
    const c = I.cv.getContext('2d'), h = have(); c.clearRect(0, 0, 512, 160); c.fillStyle = 'rgba(40,24,70,.82)'; c.beginPath(); c.roundRect ? c.roundRect(6, 6, 500, 148, 28) : c.rect(6, 6, 500, 148); c.fill(); c.lineWidth = 6; c.strokeStyle = '#ffd23f'; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 50px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff3b0'; c.fillText('🔒 ' + I.icon + ' ' + I.name, 256, 52);
    const need = []; if (h.c < I.c) need.push('📖 Inselreise: Kapitel ' + I.c + ' (' + h.c + ')'); if (h.k < I.k) need.push('🏅 ' + I.k + ' Sticker (' + h.k + ')');
    c.font = 'bold 33px Fredoka, system-ui, sans-serif'; c.fillStyle = '#ffffff'; c.fillText(need[0] || '', 256, 106); if (need[1]) { c.font = 'bold 26px Fredoka, system-ui, sans-serif'; c.fillText(need[1], 256, 136); }
    I.tex.needsUpdate = true; I.paint = h.c + ',' + h.k;
  }
  function make() {
    if (K.list.length) return;
    for (const d of BI.STORY_ISLES) {
      const O = BI[d.key]; if (!O || O.x == null) continue; const I = Object.assign({ O, r: O.R + 8, lock: { x: O.x, z: O.z, r: O.R + 8, on: false } }, d);
      const rep = new THREE.CylinderGeometry(I.r, I.r, 26, 56, 1, true), m = new THREE.Mesh(rep, new THREE.MeshBasicMaterial({ map: stripes, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false })); m.position.set(O.x, 13, O.z); m.visible = false; scene.add(m); I.mesh = m;
      const sp = sign(I), l = Math.hypot(O.x, O.z) || 1, dx = -O.x / l, dz = -O.z / l; sp.position.set(O.x + dx * (I.r + 1), 5, O.z + dz * (I.r + 1)); sp.visible = false; scene.add(sp); I.sp = sp;
      K.list.push(I); (W.lock = W.lock || []).push(I.lock);
    }
  }
  K.open = I => !K.on() || !!S().unl[I.key] || ok(I);
  K.apply = function () {
    make(); const st = K.on(); for (const I of K.list) { const lk = st && !K.open(I); I.lock.on = lk; I.mesh.visible = lk; I.sp.visible = lk; if (lk) paint(I); }
  };
  K.setMode = function (m, quiet) {
    if (m !== 'story') m = 'free'; if (save.mode === m && !quiet) return; save.mode = m; persist(); K.apply();
    if (quiet) return; A.fanfare && A.fanfare();
    if (m === 'story') {
      const s = S(); if (!s.started) { s.started = 1; persist(); if (G.goHome) G.goHome(); setTimeout(() => say('📖 Story-Modus: Du startest zuhause! Löse die Inselreise und sammle Sticker – so öffnen sich nach und nach neue Welten. 🗺️', 7000), 800); if (A.speak) A.speak('Willkommen im Story Modus! Du startest zuhause. Löse die Inselreise und sammle Sticker, dann öffnen sich nach und nach neue Welten.'); }
      else say('📖 Story-Modus an – dein Stand bleibt erhalten. Gesperrte Welten leuchten gelb. 🔒', 4800);
    } else say('🌍 Freie Welt: Alles ist offen – dein Stand bleibt erhalten.', 4200);
    G.refresh && G.refresh();
  };
  K.toggle = () => K.setMode(K.on() ? 'free' : 'story');
  /* Freischalten erkennen (alle 0,7 s), Absperrung nur in der Nähe zeichnen */
  let tmr = 0;
  K.update = function (dt, t) {
    if (!K.list.length) return; tmr -= dt; const st = K.on();
    for (const I of K.list) if (I.mesh.visible) I.mesh.material.opacity = .22 + Math.sin(t * 2.4 + I.O.x) * .08;
    if (tmr > 0) return; tmr = .7; if (!st) return; const s = S();
    for (const I of K.list) {
      if (I.lock.on && ok(I)) { s.unl[I.key] = 1; persist(); I.lock.on = false; I.mesh.visible = false; I.sp.visible = false; A.fanfare && A.fanfare(); fx.burst(P.x, 2.6, P.z, 40, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 8, 1.4, 28, 6); say('🔓 Neue Welt freigeschaltet: ' + I.icon + ' ' + I.name + '!', 5200); if (A.speak) A.speak('Neue Welt freigeschaltet: ' + I.name);
      } else if (I.lock.on && I.paint !== have().c + ',' + have().k) paint(I);
    }
  };
  /* Aufgabenliste: Welten freischalten */
  K.log = function () {
    if (!K.on()) return null; make(); const n = K.list.filter(I => K.open(I)).length, h = have();
    return { title: '🗺️ Welten freischalten', count: n + ' von ' + K.list.length, rows: K.list.map(I => ({ ok: K.open(I), icon: I.icon, text: I.name + (K.open(I) ? '' : ' – ' + (h.c < I.c ? 'Inselreise Kapitel ' + I.c : '') + (h.c < I.c && h.k < I.k ? ' + ' : '') + (h.k < I.k ? I.k + ' Sticker (' + h.k + ')' : '')), dest: null })) };
  };
  K.dbg = { list: K.list, have, ok, S };
  return K;
};
