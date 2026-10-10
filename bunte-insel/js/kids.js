'use strict';
/* Bunte Insel – Extras für Kinder: Sammelalbum (Sticker), Fotoapparat + Fotoalbum, Musik machen (auch mit Freunden),
   Mal-Block (das Bild hängt in der eigenen Wohnung), Haustier füttern/streicheln und eine freundliche Pausen-Erinnerung.
   Alles kommt ohne Download aus dem Browser; Fotos/Bilder werden klein gespeichert (localStorage). */
BI.createKids = function (G) {
  const { scene, camera, renderer, A, fx, P, save, persist, say, addStars } = G, $ = id => document.getElementById(id), K = { open: '' };
  const clamp = BI.clamp, TAU = BI.TAU;

  /* ---------- Sammelalbum ---------- */
  const ST = [
    ['ride', '🚗', 'Erste Fahrt', 'Steig in ein Fahrzeug'], ['heli', '🚁', 'Hubschrauber-Pilot', 'Flieg mit dem Hubschrauber'], ['train', '🚂', 'Lokführer', 'Fahr den Zug'], ['boat', '⛵', 'Kapitän', 'Segle mit dem Boot'],
    ['shoot', '🎯', 'Zielschütze', 'Spiel in der Schießbude'], ['tree', '🌳', 'Baumhauer', 'Hau einen Baum'], ['build', '🏠', 'Baumeister', 'Bau ein Teil'], ['sleep', '😴', 'Gut geschlafen', 'Schlaf in deinem Bett'],
    ['photo', '📸', 'Fotograf', 'Mach ein Foto'], ['music', '🎹', 'Musikant', 'Spiel auf dem Klavier'], ['paint', '🎨', 'Maler', 'Mal ein Bild'], ['quiz', '🧠', 'Schlaukopf', 'Spiel ein Lernspiel'],
    ['pet', '🐾', 'Haustierfreund', 'Füttere dein Haustier'], ['treasure', '🗺️', 'Schatzsucher', 'Finde einen Schatz'], ['friend', '👥', 'Freunde', 'Spiel mit einem Freund'], ['mini', '🎮', 'Spielprofi', 'Spiel ein Mini-Spiel'],
    ['bubble', '🫧', 'Seifenblasen', 'Puste Seifenblasen'], ['dance', '🕺', 'Tänzer', 'Tanz mit dem Dorf'],
    ['garden', '🌻', 'Gärtner', 'Ernte etwas im Garten'], ['farm', '🚜', 'Landwirt', 'Mäh ein Feld'], ['farmer', '👨‍🌾', 'Hofmeister', 'Schaff alle Aufgaben vom Bauern'], ['animal', '🐄', 'Tierfreund', 'Streichle ein Tier auf dem Hof'], ['guide', '🧭', 'Entdecker', 'Lass dir den Weg zeigen'], ['cook', '🍳', 'Hobbykoch', 'Koche etwas in der Hofküche'], ['ptask', '🎯', 'Fotoreporter', 'Löse 5 Foto-Aufgaben'], ['streak', '📅', 'Stammgast', 'Komm 3 Tage hintereinander'],
    ['zoo', '📖', 'Tierforscher', 'Entdecke alle Tiere'], ['swim', '🏊', 'Schwimmer', 'Spring ins Freibad'], ['slide', '🛝', 'Rutschmeister', 'Rutsch die Wasserrutsche']
  ];
  K.stickers = ST;
  /* Freischaltungen: mit mehr Stickern gibt es neue Sachen für den Schrank */
  const UNL = [[4, 'hat_party', '🥳 Partyhut'], [8, 'hat_wizard', '🧙 Zauberhut'], [12, 'hat_crown', '👑 Krone'], [16, 'cape', '🦸 Umhang'], [20, 'wings', '🧚 Feenflügel']];
  function unlocks() { const n = (save.stk || []).length; for (const [c, id, nm] of UNL) if (n >= c && !save.owned.includes(id)) { save.owned.push(id); persist(); setTimeout(() => say('🎁 Neu im Schrank: ' + nm + '! (Sticker-Belohnung)', 4200), 1800); } }
  /* Tagesgeschenk mit Serie */
  K.daily = function () {
    const dk = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), now = new Date(), key = dk(now), D = save.daily || { d: '', s: 0 }; if (D.d === key) return false;
    D.s = D.d === dk(new Date(now - 864e5)) ? D.s + 1 : 1; D.d = key; save.daily = D; const r = 2 + Math.min(5, D.s - 1); addStars(r); persist(); A.fanfare(); fx.burst(P.x, 2.4, P.z, 24, [BI.C.gold, BI.C.pink, BI.C.white], 5, 1.2, 30, 6);
    say('🎁 Tagesgeschenk! +' + r + ' ⭐' + (D.s > 1 ? ' · ' + D.s + ' Tage in Folge 🔥' : ''), 4600); if (D.s >= 3) K.earn('streak'); return true;
  };
  /* Foto-Aufgaben */
  const PT = [['horse', '🐴', 'ein Pferd'], ['cow', '🐮', 'eine Kuh'], ['fountain', '⛲', 'den Brunnen'], ['sheep', '🐑', 'ein Schaf'], ['heli', '🚁', 'einen Hubschrauber'], ['pig', '🐷', 'ein Schwein'], ['train', '🚂', 'den Zug'], ['chicken', '🐔', 'ein Huhn'], ['police', '🚓', 'ein Polizeiauto'], ['donkey', '🫏', 'einen Esel']];
  let taskHit = false;
  K.task = () => PT[(save.pt | 0) % PT.length];
  const frustum = new THREE.Frustum(), pm = new THREE.Matrix4(), pv = new THREE.Vector3();
  function checkTask() {
    const t = K.task(); camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(pm);
    for (const o of G.targets(t[0])) { pv.set(o.x, o.y == null ? 1.2 : o.y, o.z); if (camera.position.distanceTo(pv) < 45 && frustum.containsPoint(pv)) { save.pt = (save.pt | 0) + 1; addStars(2); A.fanfare(); persist(); say('🎯 Foto-Aufgabe geschafft: ' + t[1] + ' ' + t[2] + '! +2 ⭐', 3600); if (save.pt >= 5) K.earn('ptask'); return true; } }
    return false;
  }
  K.earn = function (id) {
    if (!save.stk) save.stk = []; if (save.stk.includes(id)) return false; const s = ST.find(q => q[0] === id); if (!s) return false;
    save.stk.push(id); persist(); addStars(2); A.fanfare(); say('🏅 Neuer Sticker: ' + s[1] + ' ' + s[2] + '! +2 ⭐', 3400); fx.burst(P.x, 2.4, P.z, 22, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 28, 6);
    unlocks(); if (save.stk.length === ST.length) { addStars(10); say('🏆 Alle Sticker gesammelt! +10 ⭐', 4200); } if (K.open === 'album') renderAlbum(); return true;
  };
  function renderAlbum() {
    const g = $('albumGrid'); g.innerHTML = ''; const have = save.stk || []; $('albumCount').textContent = have.length + ' von ' + ST.length;
    for (const s of ST) { const d = document.createElement('div'), ok = have.includes(s[0]); d.className = 'stk' + (ok ? ' got' : ''); d.innerHTML = '<b>' + (ok ? s[1] : '❔') + '</b><span>' + (ok ? s[2] : s[3]) + '</span>'; g.appendChild(d); }
  }

  /* ---------- Fotoapparat ---------- */
  let photos = BI.store.get('photos', []); if (!Array.isArray(photos)) photos = []; let selfieT = 0, selfieN = 0, camYaw = 0;
  K.photoCount = () => photos.length;
  function shoot() {
    A.shutter(); const fl = $('flash'); fl.classList.add('on'); setTimeout(() => fl.classList.remove('on'), 120);
    renderer.render(scene, camera); const src = renderer.domElement, w = 360, h = Math.round(w * src.height / src.width), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(src, 0, 0, w, h);
    let url = ''; try { url = c.toDataURL('image/jpeg', .78); } catch (e) { say('📸 Das Foto hat nicht geklappt', 1800); return; }
    photos.unshift(url); if (photos.length > 12) photos.length = 12; try { BI.store.set('photos', photos); } catch (e) { photos.length = Math.max(1, photos.length >> 1); }
    const po = $('polaroid'); po.querySelector('img').src = url; po.classList.remove('show'); void po.offsetWidth; po.classList.add('show'); K.earn('photo'); if (!taskHit) say('📸 Foto gemacht! Im Fotoalbum ansehen', 2400); taskHit = false;
  }
  K.photo = function () {
    if (selfieT > 0 || K.open) return; taskHit = checkTask(); if (!taskHit) { const t = K.task(); say('🎯 Foto-Aufgabe: fotografiere ' + t[2] + ' ' + t[1], 2400); } if (P.veh) { shoot(); return; }
    camYaw = G.cam.yaw; G.cam.yaw = P.h; selfieT = 3.2; selfieN = 4; G.setStick(0, 0);
  };
  function renderPhotos() {
    const g = $('photoGrid'); g.innerHTML = ''; if (!photos.length) { g.textContent = 'Noch keine Fotos – mach eins mit 📸!'; return; }
    photos.forEach((u, i) => { const im = document.createElement('img'); im.src = u; im.alt = 'Foto ' + (i + 1); im.onclick = () => bigPhoto(i); g.appendChild(im); });
  }
  let bigI = -1;
  function bigPhoto(i) { bigI = i; $('photoBig').hidden = false; $('photoBigImg').src = photos[i]; }
  $('photoBack').addEventListener('click', () => { $('photoBig').hidden = true; bigI = -1; });
  $('photoDel').addEventListener('click', () => { if (bigI >= 0) { photos.splice(bigI, 1); try { BI.store.set('photos', photos); } catch (e) { } } $('photoBig').hidden = true; bigI = -1; renderPhotos(); });
  $('photoSave').addEventListener('click', () => { if (bigI < 0) return; const a = document.createElement('a'); a.href = photos[bigI]; a.download = 'bunte-insel-foto.jpg'; document.body.appendChild(a); a.click(); a.remove(); });

  /* ---------- Musik machen ---------- */
  const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], NCOL = ['#ff5a5a', '#ff8a1f', '#ffd23f', '#4cd07d', '#2dc4c4', '#4da3ff', '#b36bff', '#ff8fc8'];
  const INST = [['🎹', 'Klavier'], ['🎶', 'Xylophon'], ['🎺', 'Trompete'], ['🥁', 'Trommeln']], KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK']; let inst = 0, noteN = 0;
  function buildMusic() {
    const tabs = $('musicTabs'), keys = $('musicKeys'); tabs.innerHTML = ''; keys.innerHTML = '';
    INST.forEach((it, i) => { const b = document.createElement('button'); b.className = 'bt' + (i === inst ? ' sel' : ''); b.textContent = it[0] + ' ' + it[1]; b.onclick = () => { inst = i; buildMusic(); }; tabs.appendChild(b); });
    const n = inst === 3 ? 4 : 8; keys.className = 'mkeys' + (inst === 3 ? ' drums' : '');
    for (let i = 0; i < n; i++) { const b = document.createElement('button'); b.style.background = NCOL[inst === 3 ? i * 2 : i]; b.textContent = inst === 3 ? ['🥁', '🪘', '✨', '🔔'][i] : ''; b.setAttribute('aria-label', 'Ton ' + (i + 1)); const go = e => { e.preventDefault(); A.resume(); K.play(inst, i); b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 120); }; b.addEventListener('pointerdown', go); keys.appendChild(b); }
  }
  K.play = function (ins, i, remoteAv) {
    if (ins === 3) A.drum(i, remoteAv ? .5 : 1); else A.note(NOTES[i % 8], ins, remoteAv ? .5 : 1);
    if (remoteAv) { if ((++noteN) % 3 === 0) G.showEmoji('🎵', remoteAv); return; }
    P.wave = Math.max(P.wave || 0, .5); if ((++noteN) % 5 === 0) G.showEmoji('🎵', null); K.earn('music'); G.send({ t: 'n', i: ins, k: i });
  };
  K.keydown = function (code) { if (K.open !== 'music') return false; const i = KEYS.indexOf(code); if (i >= 0) { K.play(inst, inst === 3 ? i % 4 : i); return true; } const d = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code]; if (d != null) { inst = d; buildMusic(); return true; } return false; };

  /* ---------- Mal-Block ---------- */
  const cvP = $('paintCv'), cx = cvP.getContext('2d'); let pcol = '#ff5a5a', psize = 10, ptool = 'pen', pdown = false, plast = null; const COLS = ['#ff5a5a', '#ff8a1f', '#ffd23f', '#4cd07d', '#4da3ff', '#b36bff', '#ff8fc8', '#8a5a33', '#16335e', '#ffffff'], STAMPS = ['⭐', '❤️', '🌈', '🐾', '🌸', '🚗'];
  K.art = BI.store.get('art', null); if (typeof K.art !== 'string') K.art = null; K.onArt = null;
  function paintClear() { cx.fillStyle = '#fffdf5'; cx.fillRect(0, 0, cvP.width, cvP.height); }
  function buildPaint() {
    const cb = $('paintCols'); cb.innerHTML = ''; COLS.forEach(c => { const b = document.createElement('button'); b.className = 'sw'; b.style.background = c; b.setAttribute('aria-label', 'Farbe'); b.onclick = () => { pcol = c; ptool = 'pen'; mark(); }; cb.appendChild(b); });
    const tb = $('paintTools'); tb.innerHTML = '';
    [['✏️', 'pen', 'Stift'], ['🧽', 'erase', 'Radierer']].forEach(([i, t, n]) => { const b = document.createElement('button'); b.className = 'hat'; b.textContent = i; b.setAttribute('aria-label', n); b.onclick = () => { ptool = t; mark(); }; tb.appendChild(b); });
    [6, 14, 28].forEach(s => { const b = document.createElement('button'); b.className = 'hat'; b.innerHTML = '<i style="display:block;margin:auto;border-radius:50%;background:#16335e;width:' + (s / 1.6 + 6) + 'px;height:' + (s / 1.6 + 6) + 'px"></i>'; b.setAttribute('aria-label', 'Dicke'); b.onclick = () => { psize = s; mark(); }; tb.appendChild(b); });
    STAMPS.forEach(s => { const b = document.createElement('button'); b.className = 'hat'; b.textContent = s; b.onclick = () => { ptool = 'stamp:' + s; mark(); }; tb.appendChild(b); });
    mark();
  }
  function mark() { [...$('paintCols').children].forEach((b, i) => b.classList.toggle('sel', ptool === 'pen' && COLS[i] === pcol)); const t = $('paintTools').children; [...t].forEach((b, i) => { const on = i === 0 ? ptool === 'pen' : i === 1 ? ptool === 'erase' : i < 5 ? psize === [6, 14, 28][i - 2] : ptool === 'stamp:' + STAMPS[i - 5]; b.classList.toggle('sel', on); }); }
  const pp = e => { const r = cvP.getBoundingClientRect(); return [(e.clientX - r.left) * cvP.width / r.width, (e.clientY - r.top) * cvP.height / r.height]; };
  cvP.addEventListener('pointerdown', e => { e.preventDefault(); const [x, y] = pp(e); if (ptool.startsWith('stamp:')) { cx.font = '72px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(ptool.slice(6), x, y + 4); A.pop(); return; } pdown = true; plast = [x, y]; stroke(x, y, x, y); try { cvP.setPointerCapture(e.pointerId); } catch (z) { } });
  cvP.addEventListener('pointermove', e => { if (!pdown) return; const [x, y] = pp(e); stroke(plast[0], plast[1], x, y); plast = [x, y]; });
  const pup = () => { pdown = false; }; cvP.addEventListener('pointerup', pup); cvP.addEventListener('pointercancel', pup);
  function stroke(x0, y0, x1, y1) { cx.strokeStyle = ptool === 'erase' ? '#fffdf5' : pcol; cx.lineWidth = ptool === 'erase' ? psize * 2 : psize; cx.lineCap = cx.lineJoin = 'round'; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke(); }
  $('paintClear').addEventListener('click', () => { paintClear(); A.pop(); });
  $('paintDone').addEventListener('click', () => { try { K.art = cvP.toDataURL('image/jpeg', .8); BI.store.set('art', K.art); } catch (e) { } K.earn('paint'); say('🖼️ Dein Bild hängt jetzt in deinem Zimmer!', 3000); addStars(1); A.fanfare(); K.close(); if (K.onArt) K.onArt(K.art); });
  $('paintSave').addEventListener('click', () => { const a = document.createElement('a'); a.href = cvP.toDataURL('image/jpeg', .85); a.download = 'mein-bild.jpg'; document.body.appendChild(a); a.click(); a.remove(); });
  K.loadArt = cb => { if (!K.art) { setTimeout(() => cb(null), 0); return; } const im = new Image(); im.onload = () => cb(im); im.src = K.art; };

  /* ---------- Haustier füttern & streicheln ---------- */
  const FOOD = { blitz: '🦴', bello: '🦴', mieze: '🐟', hoppel: '🥕', schnuffel: '🍎', rexi: '🍖' }; let careCd = 0;
  K.care = function (kind) {
    const pu = G.pup(); if (P.veh) { say('Steig erst aus 🚪', 1600); return; } if (careCd > 0) { say(pu.name + ' kaut noch … 😋', 1200); return; }
    if (Math.hypot(P.x - pu.x, P.z - pu.z) > 9) { pu.x = P.x + Math.sin(P.h) * 2.2; pu.z = P.z + Math.cos(P.h) * 2.2; fx.burst(pu.x, .8, pu.z, 10, [BI.C.white, BI.C.dust], 3, .6, 30, 2); }
    careCd = 3.5; pu.mode = 'follow'; pu.trick = { name: kind === 'feed' ? 'beg' : 'sit', t: 0, dur: 2 }; pu.h = Math.atan2(P.x - pu.x, P.z - pu.z); pu.cd = Math.max(pu.cd || 0, 0);
    const id = save.pet || 'blitz', snd = { blitz: 'bark', bello: 'bark', mieze: 'meow', hoppel: 'giggle', schnuffel: 'oink', rexi: 'moo' }[id]; if (A[snd]) A[snd]();
    G.showEmoji(kind === 'feed' ? FOOD[id] || '🦴' : '🤗', pu); fx.burst(pu.x, 1.6, pu.z, 12, [BI.C.pink, BI.C.red, BI.C.white], 3, 1.2, 28, -1);
    save.bond = (save.bond || 0) + (kind === 'feed' ? 8 : 5); const lv = Math.floor(save.bond / 25), was = save.bondLv || 0; save.use = save.use || {}; persist();
    if (lv > was) { save.bondLv = lv; addStars(3); A.fanfare(); say('💞 ' + pu.name + ' und du seid beste Freunde! Stufe ' + lv + '  +3 ⭐', 3600); } else say(kind === 'feed' ? '😋 ' + pu.name + ' schmeckt das! 💕' : '🤗 ' + pu.name + ' kuschelt gern mit dir! 💕', 2200);
    K.earn('pet');
  };

  /* ---------- Pausen-Erinnerung (Eltern) ---------- */
  let playS = 0, holdT = 0, holding = false;
  K.breakOpts = [0, 15, 30, 45];
  function buildBreak() {
    const b = $('breakOpts'); b.innerHTML = ''; K.breakOpts.forEach(m => { const x = document.createElement('button'); x.className = 'pill' + ((save.breakMin || 0) === m ? ' sel' : ''); x.textContent = m ? m + ' Min' : 'Aus'; x.onclick = () => { save.breakMin = m; persist(); playS = 0; buildBreak(); }; b.appendChild(x); });
  }
  K.showBreak = function () { K.open = 'break'; $('breakPanel').hidden = false; G.setStick(0, 0); A.speak && A.speak('Zeit für eine Pause! Trink etwas und beweg dich ein bisschen.'); };
  $('breakStop').addEventListener('click', () => { $('breakPanel').hidden = true; K.open = ''; playS = 0; G.pause(true); });
  const bm = $('breakMore'); bm.addEventListener('pointerdown', e => { e.preventDefault(); holding = true; holdT = 0; }); const bu = () => { holding = false; holdT = 0; bm.style.setProperty('--p', '0%'); }; bm.addEventListener('pointerup', bu); bm.addEventListener('pointerleave', bu); bm.addEventListener('pointercancel', bu);

  /* ---------- Fenster ---------- */
  const PANELS = { album: 'albumPanel', photos: 'photoPanel', music: 'musicPanel', paint: 'paintPanel' };
  K.show = function (name) {
    if (K.open || G.state() !== 'play') return; K.open = name; $(PANELS[name]).hidden = false; G.setStick(0, 0);
    if (name === 'album') renderAlbum(); else if (name === 'photos') renderPhotos(); else if (name === 'music') buildMusic(); else if (name === 'paint') { buildPaint(); if (K.art) { const im = new Image(); im.onload = () => { paintClear(); cx.drawImage(im, 0, 0, cvP.width, cvP.height); }; im.src = K.art; } else paintClear(); }
  };
  K.close = function () { if (!PANELS[K.open]) return; $(PANELS[K.open]).hidden = true; $('photoBig').hidden = true; K.open = ''; G.updateButtons(true); };
  for (const [n, id] of [['albumClose', 'album'], ['photoClose', 'photos'], ['musicClose', 'music'], ['paintCancel', 'paint']]) $(n).addEventListener('click', () => K.close());
  buildBreak(); K.refreshBreak = buildBreak;
  K.busy = () => !!K.open || selfieT > 0;

  K.update = function (dt) {
    careCd -= dt;
    if (selfieT > 0) { selfieT -= dt; const n = Math.ceil(selfieT - .2); if (n < selfieN && n >= 1 && n <= 3) { selfieN = n; say(n + ' …', 700); A.pop(); } if (selfieT <= 0) { shoot(); G.cam.yaw = camYaw; } }
    if (G.state() === 'play') { const lim = (save.breakMin || 0) * 60; if (lim && !K.open) { playS += dt; if (playS >= lim) { playS = 0; K.showBreak(); } } }
    if (holding && K.open === 'break') { holdT += dt; bm.style.setProperty('--p', Math.min(100, holdT / 1.5 * 100) + '%'); if (holdT >= 1.5) { holding = false; holdT = 0; $('breakPanel').hidden = true; K.open = ''; save.breakMin = save.breakMin || 15; playS = Math.max(0, (save.breakMin * 60) - 300); say('Noch 5 Minuten – Mama passt auf 😊', 2400); G.updateButtons(true); } }
  };
  return K;
};
