'use strict';
/* AnMaCha Kartenrausch 3D – Anzeige (Three.js), Bedienung, Menüs, Anleitung und Online-Modus (PeerJS, erst bei Bedarf geladen) für alle drei Spiele.
   Gerendert wird nur, wenn sich etwas bewegt (kein Dauer-Loop), Texturen werden einmal erzeugt und wiederverwendet. */
const $ = id => document.getElementById(id);
const KRG = KR.games, FIGS = KR.FIGS, PHX = KRG.phase;
const COLS = ['#ff3b6b', '#ffd426', '#2fe0a0', '#38bdf8'], COLD = ['#be123c', '#e08a00', '#059669', '#2563eb'], CNAME = ['Rot', 'Gelb', 'Grün', 'Blau'];
const LS = 'kartenrausch-';
const store = { get: k => { try { return localStorage.getItem(LS + k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(LS + k, v); } catch (e) { } } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reqTxt = r => r[0] === 'set' ? r[1] + ' gleiche Zahlen' : r[0] === 'run' ? 'Folge aus ' + r[1] : r[1] + ' Karten einer Farbe';
const phTxt = ph => PHX.PH[Math.min(ph, 9)].map(reqTxt).join(' + ');

const INFO = {
  stapel: {
    name: 'Stapelrausch', icon: '🔢', desc: 'Baue Zahlentürme von 1 bis 12 und werde als Erste:r deinen Zielstapel los.',
    opts: [{ k: 'stock', label: 'Zielstapel', v: [[15, 'Kurz 15'], [30, 'Normal 30']] }],
    rules: `<p><b>Ziel:</b> Werde als Erste:r deinen <b>Zielstapel</b> los (goldener Platz links). Nur seine oberste Karte ist offen.</p>
<p><b>Türme:</b> In der Mitte stehen 4 Türme. Jeder beginnt mit <b>1</b> und wird lückenlos bis <b>12</b> gebaut. Unter jedem Turm steht, welche Zahl als Nächstes passt. Ein fertiger Turm wird abgeräumt.</p>
<p><b>Dein Zug:</b></p><ol><li>Du bekommst automatisch 5 Handkarten.</li><li>Spiele so viele Karten wie möglich auf die Türme – von der <b>Hand</b>, vom <b>Zielstapel</b> oder von deinen <b>Ablagen</b> (jeweils die oberste). Karten, die gerade passen, leuchten.</li><li>Zum Schluss legst du <b>eine Handkarte auf eine deiner 4 Ablagen</b>. Damit endet dein Zug.</li></ol>
<p><b>★ Joker</b> passen auf jede Zahl. Hast du alle 5 Handkarten gespielt, ziehst du sofort 5 neue.</p>
<p><b>Tipp:</b> Lege auf eine Ablage absteigend (z. B. 9, 8, 7), dann kannst du sie später nacheinander spielen.</p>
<p><b>Bedienung:</b> Karte antippen, dann den leuchtenden Turm oder eine Ablage antippen.</p>`
  },
  farb: {
    name: 'Farbflash', icon: '🌈', desc: 'Farbe oder Zeichen bedienen, Aktionskarten ausspielen – wer zuerst keine Karte mehr hat, gewinnt.',
    opts: [],
    rules: `<p><b>Ziel:</b> Werde als Erste:r alle Karten los. Jede:r startet mit 7 Karten.</p>
<p><b>Dein Zug:</b> Lege eine Karte auf die Ablage, die in <b>Farbe</b> oder <b>Zahl/Zeichen</b> zur obersten Karte passt. Passende Karten leuchten – einfach antippen.</p>
<p><b>Keine passt?</b> Tippe auf den Ziehstapel. Passt die gezogene Karte, darfst du sie gleich spielen oder <b>behalten</b>.</p>
<p><b>Aktionskarten:</b> <span class="k" style="background:#be123c">⊘</span> Aussetzen – die nächste Person ist übersprungen. <span class="k" style="background:#2563eb">⇄</span> Richtungswechsel (zu zweit wie Aussetzen). <span class="k" style="background:#059669">+2</span> – die nächste Person zieht 2 und setzt aus.</p>
<p><b>Schwarze Karten</b> passen immer: <span class="k" style="background:#333">★</span> Farbwahl – du bestimmst die neue Farbe. <span class="k" style="background:#333">+4</span> – Farbe wählen, die nächste Person zieht 4 und setzt aus.</p>
<p>Bei der letzten Karte ruft deine Figur automatisch <b>„Flash!“</b>.</p>`
  },
  phase: {
    name: 'Phasenjagd', icon: '🎯', desc: 'Sammle Folgen, gleiche Zahlen und Farben – wer zuerst alle Phasen schafft, gewinnt.',
    opts: [{ k: 'len', label: 'Länge', v: [[5, 'Kurz 5'], [10, 'Alle 10']] }],
    rules: `<p><b>Ziel:</b> Erfülle die Phasen der Reihe nach. Wer zuerst die letzte Phase schafft, gewinnt. Schaffen es mehrere in derselben Runde, gewinnen die wenigsten Minuspunkte.</p>
<p><b>Die Phasen:</b></p><ol>${PHX.PH.map((_, i) => '<li>' + phTxt(i) + '</li>').join('')}</ol>
<p><b>Dein Zug:</b></p><ol><li><b>Ziehen:</b> Ziehstapel oder oberste Karte der Ablage antippen.</li><li><b>Auslegen:</b> Hast du deine Phase, tippe die Karten an und dann <b>Phase auslegen</b>. Danach darfst du einzelne Karten an jede Auslage anlegen (Karte antippen, dann Auslage antippen).</li><li><b>Abwerfen:</b> Eine Karte antippen und auf die Ablage legen.</li></ol>
<p><b>Begriffe:</b> Gleiche Zahlen = Farbe egal. Folge = lückenlos aufsteigend, z. B. 4-5-6-7. Farbe = alle Karten in einer Farbe.</p>
<p><b>★ Joker</b> ersetzt jede Karte. <b>⊘ Aussetzen</b>: abwerfen, dann setzt die nächste Person einmal aus.</p>
<p><b>Rundenende:</b> Hat jemand keine Karte mehr, endet die Runde. Wer seine Phase ausgelegt hat, kommt zur nächsten Phase. Restkarten zählen als Minuspunkte: 1–9 = 5, 10–12 = 10, Aussetzen = 15, Joker = 25.</p>`
  }
};
const S = {
  game: 'stapel', mode: '', G: null, V: null, sel: null, multi: [], hide: false, pend: false, lastSeq: 0, lastTurn: -1, snd: true, timer: 0,
  pl: [], opt: { mode: 'solo', opp: 2, loc: 2, stock: 30, len: 10 }, myFig: 0, locFig: [0, 1, 2, 3], locName: ['', '', '', ''],
  peerIdx: new Map(), lobby: [], scr: 'sMain', rulesBack: null, figFor: 'me', figBack: 'sSetup', roundSeen: 0, colPick: -1
};

/* ---------- Ton (im Browser erzeugt) ---------- */
let AC = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); }
function beep(f, d, t, v, delay) {
  if (!S.snd || !AC) return; const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + (delay || 0);
  o.type = t || 'sine'; o.frequency.setValueAtTime(f, t0); g.gain.setValueAtTime(v || .08, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + d + .02);
}
const sfx = {
  play: () => { beep(520, .1, 'triangle'); beep(780, .12, 'triangle', .07, .06); },
  disc: () => beep(240, .12, 'square', .05),
  draw: () => beep(380, .08, 'sine', .06),
  clr: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, .2, 'triangle', .08, i * .08)),
  my: () => { beep(660, .1, 'sine', .07); beep(880, .14, 'sine', .07, .09); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, .28, 'triangle', .09, i * .11)),
  bad: () => beep(150, .15, 'sawtooth', .05)
};

/* ---------- Kartenbilder ---------- */
let T, renderer, scene, camera, ray, running = false, lastT = 0, thumbs = [], layoutGame = '', SH = null;
let slots = {};
const texCache = {};
function cv2(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function cardBase(x, c1, c2) {
  const g = x.createLinearGradient(0, 0, 256, 358); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 256, 358);
  x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 7; x.strokeRect(12, 12, 232, 334);
  x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.ellipse(128, 179, 92, 120, 0, 0, 7); x.fill();
}
function cardText(x, big, small, size, col) {
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col || '#fff'; x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 14; x.shadowOffsetY = 5;
  x.font = '900 ' + size + 'px "Trebuchet MS",system-ui,sans-serif'; x.fillText(big, 128, 192);
  x.shadowBlur = 0; x.shadowOffsetY = 0; x.font = '900 34px system-ui,sans-serif'; x.fillStyle = 'rgba(255,255,255,.95)';
  x.fillText(small, 42, 44); x.save(); x.translate(214, 314); x.rotate(Math.PI); x.fillText(small, 0, 0); x.restore();
}
function faceStapel(v, w) {
  const c = cv2(256, 358), x = c.getContext('2d'), star = v === 0, gold = star || w;
  cardBase(x, ...(gold ? ['#ffe27a', '#ff9d2e'] : v <= 4 ? ['#18d9ff', '#2563eb'] : v <= 8 ? ['#a78bfa', '#6d28d9'] : ['#ff5fb0', '#be185d']));
  cardText(x, star ? '★' : String(v), star ? '★' : String(v), star ? 190 : v >= 10 ? 150 : 190);
  if (w && !star) { x.font = '900 30px system-ui,sans-serif'; x.fillText('★', 128, 40); }
  return c;
}
const farbSym = v => v <= 9 ? String(v) : v === 10 ? '⊘' : v === 11 ? '⇄' : '+2';
function wildBase(x) {
  x.fillStyle = '#15151f'; x.fillRect(0, 0, 256, 358); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 7; x.strokeRect(12, 12, 232, 334);
  COLS.forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.moveTo(128, 179); x.ellipse(128, 179, 92, 120, 0, i * Math.PI / 2 - Math.PI / 2, (i + 1) * Math.PI / 2 - Math.PI / 2); x.closePath(); x.fill(); });
}
function faceFarb(card) {
  const c = cv2(256, 358), x = c.getContext('2d'), col = card >> 4, v = card & 15;
  if (col === 4) { wildBase(x); const t = v === 13 ? '★' : '+4'; cardText(x, t, t, v === 13 ? 150 : 120); return c; }
  cardBase(x, COLS[col], COLD[col]); const t = farbSym(v);
  cardText(x, t, t, v === 12 ? 130 : v >= 10 ? 160 : 190);
  if (v === 6 || v === 9) { x.fillStyle = '#fff'; x.fillRect(98, 268, 60, 9); }
  return c;
}
function facePhase(card) {
  const c = cv2(256, 358), x = c.getContext('2d');
  if (card === 77) { cardBase(x, '#ffe27a', '#ff9d2e'); cardText(x, '★', '★', 180); x.font = '900 30px system-ui,sans-serif'; x.fillText('JOKER', 128, 300); return c; }
  if (card === 78) { cardBase(x, '#64748b', '#1e293b'); cardText(x, '⊘', '⊘', 170); x.font = '900 26px system-ui,sans-serif'; x.fillText('AUSSETZEN', 128, 300); return c; }
  const col = card >> 4, v = card & 15; cardBase(x, COLS[col], COLD[col]); cardText(x, String(v), String(v), v >= 10 ? 150 : 190);
  if (v === 6 || v === 9) { x.fillStyle = '#fff'; x.fillRect(98, 268, 60, 9); }
  return c;
}
function drawBack() {
  const c = cv2(256, 358), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 256, 358); g.addColorStop(0, '#101a33'); g.addColorStop(1, '#2a1250'); x.fillStyle = g; x.fillRect(0, 0, 256, 358);
  x.strokeStyle = 'rgba(0,229,255,.18)'; x.lineWidth = 2;
  for (let i = -360; i < 360; i += 28) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 358, 358); x.stroke(); x.beginPath(); x.moveTo(i + 358, 0); x.lineTo(i, 358); x.stroke(); }
  x.strokeStyle = 'rgba(255,45,149,.9)'; x.lineWidth = 6; x.strokeRect(12, 12, 232, 334);
  x.lineWidth = 8; const rg = x.createLinearGradient(60, 100, 200, 260); rg.addColorStop(0, '#00E5FF'); rg.addColorStop(.5, '#8B5CF6'); rg.addColorStop(1, '#FF2D95');
  x.strokeStyle = rg; x.beginPath(); x.arc(128, 179, 66, 0, 7); x.stroke();
  x.fillStyle = rg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 italic 74px "Trebuchet MS",sans-serif'; x.fillText('A', 128, 184);
  x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '800 22px system-ui,sans-serif'; x.fillText('ANMACHA', 128, 300);
  return c;
}
// Schlüssel: 'B' Rückseite, 'S5' / 'S5w' Stapelrausch, 'F35' Farbflash, 'P20' Phasenjagd
function tex(k) {
  if (!texCache[k]) {
    const t = k[0], n = parseInt(k.slice(1), 10);
    const t2 = new T.CanvasTexture(t === 'B' ? drawBack() : t === 'S' ? faceStapel(n, k.endsWith('w')) : t === 'F' ? faceFarb(n) : facePhase(n));
    t2.anisotropy = 4; texCache[k] = t2;
  }
  return texCache[k];
}
function txtTex(s, w, h, col, size) {
  const k = 'T' + s + '|' + w + col + size; if (texCache[k]) return texCache[k];
  const c = cv2(w, h), x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col || '#fff'; x.font = '800 ' + (size || h * .6) + 'px system-ui,sans-serif';
  x.fillText(s, w / 2, h / 2 + 2); const t = new T.CanvasTexture(c); texCache[k] = t; return t;
}
// Kleine Karte für Auslagen und Vorschauen (2D)
function mini(x, X, Y, w, h, card) {
  const col = card >> 4, v = card & 15, J = card === 77, SK = card === 78;
  x.fillStyle = J ? '#ffb02e' : SK ? '#475569' : COLS[col]; x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, 6); else x.rect(X, Y, w, h); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 ' + (h * .5 | 0) + 'px system-ui,sans-serif';
  x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 4; x.fillText(J ? '★' : SK ? '⊘' : String(v), X + w / 2, Y + h / 2 + 2); x.shadowBlur = 0;
}

/* ---------- 3D-Tisch ---------- */
function tableTex(labels) {
  const c = cv2(1024, 1024), x = c.getContext('2d'), U = 1024 / 24;
  const g = x.createRadialGradient(512, 512, 40, 512, 512, 560); g.addColorStop(0, '#13264a'); g.addColorStop(.55, '#0a1126'); g.addColorStop(1, '#060912'); x.fillStyle = g; x.fillRect(0, 0, 1024, 1024);
  const X = v => 512 + v * U;
  const lg = x.createLinearGradient(X(-4), 0, X(4), 0); lg.addColorStop(0, '#00E5FF'); lg.addColorStop(.5, '#8B5CF6'); lg.addColorStop(1, '#FF2D95');
  x.strokeStyle = lg; x.lineWidth = 5; x.shadowColor = '#8B5CF6'; x.shadowBlur = 18; x.beginPath();
  if (x.roundRect) x.roundRect(X(-3.95), X(-4.45), 7.9 * U, 9.15 * U, 30); else x.rect(X(-3.95), X(-4.45), 7.9 * U, 9.15 * U); x.stroke(); x.shadowBlur = 0;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  labels.forEach(([s, lx, lz, sz, col]) => { x.fillStyle = col || 'rgba(159,180,200,.75)'; x.font = '800 ' + ((sz || .24) * U | 0) + 'px system-ui,sans-serif'; x.fillText(s, X(lx), X(lz)); });
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function bedTex() {
  const c = cv2(128, 176), x = c.getContext('2d');
  x.strokeStyle = 'rgba(0,229,255,.55)'; x.lineWidth = 4; x.setLineDash([10, 8]); x.strokeRect(6, 6, 116, 164);
  x.fillStyle = 'rgba(0,229,255,.06)'; x.fillRect(6, 6, 116, 164);
  return new T.CanvasTexture(c);
}
function addMesh(geo, mat, x, y, z, flat) { const m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (flat) m.rotation.x = -Math.PI / 2; return m; }
function mkSlot(key, x, z, o) {
  o = o || {};
  const g = new T.Group(); g.position.set(x, 0, z); scene.add(g);
  const bed = addMesh(SH.bedG, new T.MeshBasicMaterial({ map: SH.bed, transparent: true, depthWrite: false, color: o.tint || 0xffffff }), 0, .003, 0, true);
  bed.visible = !o.nobed; g.add(bed);
  const thick = new T.Mesh(SH.box, SH.side); thick.visible = false; g.add(thick);
  const topMat = new T.MeshBasicMaterial({ map: tex('B') });
  const card = new T.Mesh(SH.card, [SH.side, SH.side, topMat, SH.back, SH.side, SH.side]); card.visible = false; g.add(card);
  const glow = addMesh(SH.glowG, new T.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }), 0, .006, 0, true); g.add(glow);
  const hit = addMesh(SH.hit, SH.hitMat, 0, .05, 0, true); hit.userData.key = key; g.add(hit);
  const s = { key, g, bed, thick, card, topMat, glow, hit, h: 0, lift: 0, liftT: 0, yo: 0, hl: 0, flash: 0, tx: x, shake: 0, hasCard: false };
  slots[key] = s; return s;
}
function setSlot(s, face, n) {
  s.hasCard = !!face; s.card.visible = s.hasCard;
  if (s.hasCard) s.topMat.map = tex(face);
  s.h = s.hasCard ? Math.min(n || 1, 40) * .011 : 0; s.thick.visible = s.h > .012; s.thick.scale.set(1, s.h, 1); s.thick.position.y = s.h / 2;
  s.card.position.y = s.h + .022 + s.yo; need();
}
// Flache Beschriftung (z. B. "nächste: 5") oder Auslage (Phasenjagd) mit eigener Leinwand
function mkPlate(key, x, z, w, h, px) {
  const g = new T.Group(); g.position.set(x, 0, z); scene.add(g);
  const c = cv2(px, Math.round(px * h / w)), t = new T.CanvasTexture(c); t.anisotropy = 4;
  const m = addMesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), 0, .004, 0, true); g.add(m);
  const glow = addMesh(new T.PlaneGeometry(w + .1, h + .1), new T.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }), 0, .006, 0, true); g.add(glow);
  const hit = addMesh(new T.PlaneGeometry(w, h), SH.hitMat, 0, .05, 0, true); hit.userData.key = key; g.add(hit);
  const s = { key, g, glow, hit, c, t, plane: m, hl: 0, flash: 0, tx: x, sig: '', own: true };
  slots[key] = s; return s;
}
function drawPlate(s, sig, fn) { if (s.sig === sig) return; s.sig = sig; const x = s.c.getContext('2d'); x.clearRect(0, 0, s.c.width, s.c.height); fn(x, s.c.width, s.c.height); s.t.needsUpdate = true; need(); }
function clearLayout() {
  for (const k in slots) {
    const s = slots[k]; scene.remove(s.g);
    s.g.traverse(o => { if (o.material && o.material !== SH.hitMat && o.material !== SH.side && o.material !== SH.back && !Array.isArray(o.material)) o.material.dispose(); });
    if (s.topMat) s.topMat.dispose(); if (s.t) { s.t.dispose(); s.plane.geometry.dispose(); s.glow.geometry.dispose(); s.hit.geometry.dispose(); }
  }
  slots = {};
}
const HAND = { stapel: { one: 3.2, per: 5, sp: 1.4 }, farb: { one: 2.25, z: [1.35, 3.05], per: 7, sp: 1.2 }, phase: { one: 2.25, z: [1.4, 3.05], per: 6, sp: 1.2 } };
function buildLayout(game) {
  if (!scene) return; clearLayout(); layoutGame = game; figKey = '';
  let labels;
  if (game === 'stapel') {
    labels = [['TÜRME: JE VON 1 BIS 12 BAUEN', 0, -2.55, .26, 'rgba(0,229,255,.8)'], ['ZIEHSTAPEL', 1.6, -3.3], ['ZIELSTAPEL', -2.8, 1.95, .2, 'rgba(255,212,38,.9)'], ['DEINE ABLAGEN · BEENDEN DEN ZUG', .7, 1.95, .2, 'rgba(255,45,149,.85)']];
    [-2.4, -.8, .8, 2.4].forEach((x, p) => { mkSlot('b' + p, x, -1.55); mkPlate('n' + p, x, -.6, 1.3, .3, 256); });
    mkSlot('deck', 0, -3.3, { tint: 0xff2d95 });
    mkSlot('st', -2.8, 1.0, { tint: 0xffd426 });
    [0, 1, 2, 3].forEach(d => mkSlot('d' + d, -1.4 + d * 1.4, 1.0, { tint: 0xff2d95 }));
  } else if (game === 'farb') {
    labels = [['ZIEHEN', -1.15, -.35], ['ABLAGE', 1.15, -.35]];
    mkSlot('deck', -1.15, -1.45, { tint: 0xff2d95 });
    const ring = addMesh(new T.PlaneGeometry(1.5, 1.9), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false, blending: T.AdditiveBlending }), 0, .002, 0, true);
    mkSlot('pile', 1.15, -1.45).g.add(ring); slots.pile.ring = ring;
    const dir = mkPlate('dir', 0, -1.45, .9, .9, 128); drawPlate(dir, 'd', (x, w, h) => { x.fillStyle = 'rgba(255,255,255,.75)'; x.font = '900 100px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('↻', w / 2, h / 2 + 6); });
    dir.hit.visible = false;
  } else {
    labels = [['ZIEHEN', -2.05, -3.3], ['ABLAGE', 2.05, -3.3]];
    mkSlot('deck', -.75, -3.3, { tint: 0xff2d95 });
    mkSlot('pile', .75, -3.3);
  }
  if (!SH.tables[game]) SH.tables[game] = tableTex(labels);
  SH.table.material.map = SH.tables[game]; SH.table.material.needsUpdate = true;
  for (let i = 0; i < 30; i++) { const s = mkSlot('h' + i, 0, 3.2, { nobed: true }); s.yo = i * .004; }
  resize();
}
function layHand(n, cfg) {
  const out = [], rows = n <= cfg.per || !cfg.z ? 1 : 2, per = Math.ceil(n / rows);
  for (let i = 0; i < n; i++) {
    const r = rows === 1 || i < per ? 0 : 1, k = r ? i - per : i, cnt = rows === 1 ? n : r ? n - per : per;
    const sp = Math.min(cfg.sp, cnt > 1 ? 6.4 / (cnt - 1) : cfg.sp);
    out.push({ x: (k - (cnt - 1) / 2) * sp, z: rows === 1 ? cfg.one : cfg.z[r], sp, last: k === cnt - 1 });
  }
  return out;
}
function showHand(cards, hidden) {
  const pos = layHand(cards.length, HAND[layoutGame]), pre = layoutGame === 'stapel' ? 'S' : layoutGame === 'farb' ? 'F' : 'P';
  for (let i = 0; i < 30; i++) {
    const s = slots['h' + i], p = pos[i];
    if (!p) { setSlot(s, null); continue; }
    s.tx = p.x; s.g.position.z = p.z;
    const ov = p.sp < 1.02 && !p.last; s.hit.scale.x = ov ? p.sp / 1.3 : 1; s.hit.position.x = ov ? -.5 + p.sp / 2 : 0;
    setSlot(s, hidden ? 'B' : pre + cards[i], 1);
  }
}
function initScene() {
  T = THREE;
  renderer = new T.WebGLRenderer({ canvas: $('cv'), antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x060912);
  scene = new T.Scene(); camera = new T.PerspectiveCamera(36, 1, .1, 100); ray = new T.Raycaster();
  scene.add(new T.HemisphereLight(0xffffff, 0x334155, 1.0)); const dl = new T.DirectionalLight(0xffffff, .6); dl.position.set(2, 5, 4); scene.add(dl);
  SH = {
    bed: bedTex(), bedG: new T.PlaneGeometry(1.16, 1.56), glowG: new T.PlaneGeometry(1.22, 1.62), card: new T.BoxGeometry(1, .04, 1.4), box: new T.BoxGeometry(1, 1, 1.4), hit: new T.PlaneGeometry(1.3, 1.5),
    side: new T.MeshBasicMaterial({ color: 0xaab6d6 }), back: new T.MeshBasicMaterial({ map: tex('B') }), hitMat: new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    ring: new T.RingGeometry(.34, .46, 28), tag: new T.PlaneGeometry(1.5, .3), tables: {}
  };
  SH.table = addMesh(new T.PlaneGeometry(24, 24), new T.MeshBasicMaterial({ color: 0xffffff }), 0, -.01, 0, true); scene.add(SH.table);
  const gc = new T.Mesh(SH.card, [SH.side, SH.side, new T.MeshBasicMaterial({ map: tex('B') }), SH.back, SH.side, SH.side]);
  gc.visible = false; scene.add(gc); SH.ghost = { m: gc, t: 1, a: null, b: null, q: [] };
  new ResizeObserver(resize).observe($('stage'));
  buildLayout(S.game);
  const cv = $('cv'); cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect(); const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    const hits = ray.intersectObjects(Object.values(slots).filter(s => s.hit.visible && (s.hasCard !== false || s.key[0] !== 'h')).map(s => s.hit), false);
    if (hits.length) tap(hits[0].object.userData.key);
  });
  try { thumbs = KR.figThumbs(renderer, T); } catch (e) { thumbs = []; }
  refreshFigButtons(); renderGameList();
}
function resize() {
  if (!renderer) return; const st = $('stage'), w = Math.max(st.clientWidth, 50), h = Math.max(st.clientHeight, 50);
  renderer.setSize(w, h, false); camera.aspect = w / h;
  const el = 60 * Math.PI / 180, cz = .15, pts = [];
  for (const x of [-3.6, 3.6]) for (const z of [-3.95, 4.15]) for (const y of [0, .5]) pts.push(new T.Vector3(x, y, z));
  for (const x of [-2.9, 2.9]) pts.push(new T.Vector3(x, 1.3, -4.85));
  let d = 5;
  for (let i = 0; i < 90; i++) {
    camera.position.set(0, Math.sin(el) * d, cz + Math.cos(el) * d); camera.lookAt(0, 0, cz); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    if (pts.every(p => { const q = p.clone().project(camera); return Math.abs(q.x) < .98 && Math.abs(q.y) < .98; })) break; d *= 1.04;
  }
  need();
}

/* ---------- 3D-Figuren am Tisch ---------- */
let figKey = '', seats = [];
function placeFigs(v) {
  const others = v.players.map((_, i) => i).filter(i => i !== v.me);
  const key = v.game + v.me + ':' + others.map(i => v.players[i].fig + v.players[i].name).join(',');
  if (key !== figKey) {
    figKey = key; seats.forEach(s => { scene.remove(s.g); s.tag.material.dispose(); s.ring.material.dispose(); }); seats = [];
    const k = others.length, span = k === 1 ? 0 : k === 2 ? 3.2 : 5.2;
    others.forEach((idx, j) => {
      const x = k === 1 ? 0 : -span / 2 + span * j / (k - 1), p = v.players[idx], g = new T.Group(); g.position.set(x, 0, -4.85);
      const fig = KR.buildFig(T, p.fig); g.add(fig);
      const ring = addMesh(SH.ring, new T.MeshBasicMaterial({ color: 0xff2d95, transparent: true, opacity: .15, depthWrite: false }), 0, .01, 0, true); g.add(ring);
      const tag = addMesh(SH.tag, new T.MeshBasicMaterial({ map: txtTex(p.name, 300, 60, '#e6f1ff', 34), transparent: true, depthWrite: false }), 0, .01, .55, true); g.add(tag);
      scene.add(g); seats.push({ idx, g, fig, ring, tag, x, jump: 0, rep: 0 });
    });
  }
  seats.forEach(s => {
    const on = v.turn === s.idx && v.winner < 0 && !v.wait;
    s.ring.material.opacity = on ? .95 : .15; s.ring.material.color.setHex(on ? 0xff2d95 : 0x8b5cf6);
    if (on && !s.on) s.jump = 1; s.on = on;
    if (v.winner === s.idx && !s.won) { s.won = true; s.jump = 1; s.rep = 4; }
  });
  need();
}
const seatOf = i => seats.find(s => s.idx === i);
function figPos(i) { const s = seatOf(i); return s ? { x: s.x, z: -4.6 } : { x: 0, z: -6.5 }; }

function need() { if (!running && renderer) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } }
function frame(t) {
  const dt = Math.min((t - lastT) / 1000, .05); lastT = t; let more = false;
  for (const k in slots) {
    const s = slots[k];
    const dx = s.tx - s.g.position.x; if (Math.abs(dx) > .002) { s.g.position.x += dx * Math.min(1, dt * 14); more = true; } else s.g.position.x = s.tx;
    if (s.card) {
      const dl = s.liftT - s.lift; if (Math.abs(dl) > .002) { s.lift += dl * Math.min(1, dt * 14); more = true; } else s.lift = s.liftT;
      s.card.position.y = s.h + .022 + s.lift + s.yo; s.card.rotation.x = -s.lift * .5;
      if (s.shake > 0) { s.shake = Math.max(0, s.shake - dt * 3); s.card.position.x = Math.sin(s.shake * 40) * .08 * s.shake; more = true; } else s.card.position.x = 0;
    }
    let o = s.hl === 1 ? .55 : s.hl === 2 ? .5 : s.hl === 3 ? .28 : 0;
    if (s.flash > 0) { s.flash = Math.max(0, s.flash - dt * 1.4); o = Math.max(o, s.flash); more = true; }
    s.glow.material.opacity = o; s.glow.material.color.setHex(s.flash > 0 ? 0xffd426 : s.hl === 2 ? 0xff2d95 : 0x00e5ff);
  }
  for (const s of seats) {
    if (s.jump > 0) { s.jump = Math.max(0, s.jump - dt * 2.2); s.fig.position.y = Math.sin(s.jump * Math.PI) * .3; s.fig.rotation.y = Math.sin(s.jump * Math.PI * 2) * .3; more = true; if (!s.jump && s.rep > 0) { s.rep--; s.jump = 1; } }
  }
  const gh = SH.ghost;
  if (gh.t >= 1 && gh.q.length) { const f = gh.q.shift(); gh.m.material[2].map = tex(f.face); gh.a = f.a; gh.b = f.b; gh.t = 0; gh.m.visible = true; }
  if (gh.t < 1) {
    gh.t = Math.min(1, gh.t + dt / .38); const e = gh.t * gh.t * (3 - 2 * gh.t);
    gh.m.position.set(gh.a.x + (gh.b.x - gh.a.x) * e, .25 + Math.sin(e * Math.PI) * .9, gh.a.z + (gh.b.z - gh.a.z) * e);
    gh.m.rotation.x = -Math.sin(e * Math.PI) * .4; if (gh.t >= 1) gh.m.visible = gh.q.length > 0; more = true;
  }
  renderer.render(scene, camera);
  if (more) requestAnimationFrame(frame); else running = false;
}
const slotPos = key => { const s = slots[key]; return s ? { x: s.tx, z: s.g.position.z } : { x: 0, z: 0 }; };
function fly(a, b, face) { if (!SH) return; SH.ghost.q.push({ a, b, face: face || 'B' }); if (SH.ghost.q.length > 3) SH.ghost.q.shift(); need(); }
function shakeSlot(k) { if (slots[k]) { slots[k].shake = 1; need(); } }

/* ---------- Anzeige ---------- */
const grp = v => v === 0 ? 0 : v <= 4 ? 1 : v <= 8 ? 2 : 3;
const tileH = (v, big) => '<span class="tile ' + (big ? 'big ' : '') + (v < 0 ? 'e' : 'c' + grp(v)) + '">' + (v < 0 ? '·' : v === 0 ? '★' : v) + '</span>';
const figImg = f => thumbs[f] ? '<img alt="" src="' + thumbs[f] + '">' : '<i>' + (FIGS[f] || FIGS[0]).emo + '</i>';
function showScr(id) { S.scr = id; document.querySelectorAll('.scr').forEach(e => e.classList.toggle('on', e.id === id)); $('ov').classList.remove('hidden'); $('ov').scrollTop = 0; }
function hideOv() { S.scr = null; $('ov').classList.add('hidden'); }
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
const mineNow = v => v.turn === v.me && v.winner < 0 && !S.hide && !v.wait;
function chip(p, i, v, inner) {
  return '<div class="chip' + (v.turn === i && v.winner < 0 && !v.wait ? ' turn' : '') + '"><div class="nm">' + figImg(p.fig) + esc(p.name) + '</div>' + inner + '</div>';
}
function acts(list) {
  $('acts').innerHTML = list.map((b, i) => '<button data-act="' + i + '" class="' + (b.go ? 'go' : '') + '"' + (b.off ? ' disabled' : '') + '>' + b.t + '</button>').join('');
  S.actFns = list.map(b => b.fn);
}

/* ===== Stapelrausch ===== */
const RStapel = {
  card(v, s) {
    const me = v.players[v.me]; if (!s) return undefined;
    if (s.k === 'hand') return me.hand[s.i]; if (s.k === 'stock') return me.stockTop >= 0 ? me.stockTop : undefined;
    const d = me.disc[s.i]; return d && d.length ? d[d.length - 1] : undefined;
  },
  render(v) {
    const me = v.players[v.me];
    v.build.forEach((b, p) => {
      setSlot(slots['b' + p], b.length ? 'S' + b.length + (b[b.length - 1] === 0 ? 'w' : '') : null, b.length);
      const nx = b.length + 1; drawPlate(slots['n' + p], 'n' + nx, (x, w, h) => { x.fillStyle = 'rgba(0,229,255,.9)'; x.font = '800 ' + (h * .62 | 0) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.length ? 'nächste: ' + nx : 'Start: 1', w / 2, h / 2 + 2); });
    });
    setSlot(slots.deck, v.deckN ? 'B' : null, Math.ceil(v.deckN / 3));
    setSlot(slots.st, me.stockN ? 'S' + me.stockTop : null, me.stockN);
    for (let d = 0; d < 4; d++) { const a = me.disc[d]; setSlot(slots['d' + d], a.length ? 'S' + a[a.length - 1] : null, a.length); }
    showHand(me.hand, S.hide);
    let h = '';
    v.players.forEach((p, i) => {
      if (i === v.me) return;
      h += chip(p, i, v, '<div class="r">' + tileH(p.stockTop, true) + '<small>Ziel<br><b style="color:#fff;font-size:14px">' + p.stockN + '</b></small><small>🃏 ' + p.handN + '</small></div><div class="r">' + p.disc.map(d => tileH(d.length ? d[d.length - 1] : -1)).join('') + '</div>');
    });
    $('opp').innerHTML = h;
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me], fits = c => c !== undefined && [0, 1, 2, 3].some(p => KRG.stapel.playable(v.build, c, p));
    if (S.sel && (!mine || RStapel.card(v, S.sel) === undefined)) S.sel = null;
    const sel = S.sel, c = RStapel.card(v, sel);
    if (sel) {
      const key = sel.k === 'hand' ? 'h' + sel.i : sel.k === 'stock' ? 'st' : 'd' + sel.i; slots[key].liftT = sel.k === 'hand' ? .55 : .4;
      for (let p = 0; p < 4; p++) if (KRG.stapel.playable(v.build, c, p)) slots['b' + p].hl = 1;
      if (sel.k === 'hand') for (let d = 0; d < 4; d++) slots['d' + d].hl = 2;
    } else if (mine) {
      me.hand.forEach((x, i) => { if (fits(x)) slots['h' + i].hl = 3; });
      if (fits(me.stockTop >= 0 ? me.stockTop : undefined)) slots.st.hl = 3;
      me.disc.forEach((d, i) => { if (fits(d[d.length - 1])) slots['d' + i].hl = 3; });
    }
    let t;
    if (!mine) t = '';
    else if (!sel) t = '<b>1.</b> Leuchtende Karten passen auf einen Turm – antippen. <b>2.</b> Zum Schluss eine Handkarte auf eine <b>Ablage</b> legen.';
    else if (sel.k === 'hand') t = 'Leuchtenden <b>Turm</b> antippen – oder auf eine <b>Ablage</b> legen (beendet deinen Zug).';
    else t = 'Leuchtenden <b>Turm</b> in der Mitte antippen.';
    acts([]);
    return [t, 'Dein Zielstapel: <b>' + me.stockN + '</b> · Ziehstapel: <b>' + v.deckN + '</b>'];
  },
  tap(key, v) {
    const me = v.players[v.me], t = key[0];
    const tog = o => { S.sel = S.sel && S.sel.k === o.k && (S.sel.i || 0) === (o.i || 0) ? null : o; };
    if (key === 'deck') return;
    if (t === 'h') { const i = +key.slice(1); if (i >= me.hand.length) return; tog({ k: 'hand', i }); }
    else if (key === 'st') { if (!me.stockN) return; tog({ k: 'stock', i: 0 }); }
    else if (t === 'd') {
      const d = +key.slice(1);
      if (S.sel && S.sel.k === 'hand') { const a = { t: 'discard', i: S.sel.i, d }; S.sel = null; return act(a); }
      if (me.disc[d].length) tog({ k: 'disc', i: d }); else { toast('Erst eine Handkarte wählen'); }
    } else if (t === 'b') {
      if (!S.sel) { toast('Erst eine Karte antippen'); return; }
      const p = +key.slice(1), c = RStapel.card(v, S.sel); if (c === undefined) return;
      if (!KRG.stapel.playable(v.build, c, p)) { sfx.bad(); shakeSlot(key); toast('Hier muss eine ' + (v.build[p].length + 1) + ' hin'); return; }
      const a = { t: 'play', k: S.sel.k, i: S.sel.i || 0, p }; S.sel = null; return act(a);
    }
    refreshSel();
  },
  fx(fx, v) {
    const mine = fx.pl === v.me, from = mine ? slotPos(fx.k === 'hand' ? 'h' + fx.i : fx.k === 'stock' ? 'st' : 'd' + fx.i) : figPos(fx.pl);
    if (fx.t === 'play') { fly(from, slotPos('b' + fx.p), 'S' + fx.c); if (fx.clr) { slots['b' + fx.p].flash = 1; toast('Turm fertig! 🎉'); sfx.clr(); } else sfx.play(); }
    else { fly(from, mine ? slotPos('d' + fx.d) : figPos(fx.pl), 'S' + fx.c); sfx.disc(); }
  },
  end(v) { return v.winner === v.me && S.mode !== 'local' ? 'Zielstapel leer – stark gespielt.' : 'Zielstapel zuerst geleert.'; }
};

/* ===== Farbflash ===== */
const RFarb = {
  render(v) {
    const me = v.players[v.me];
    setSlot(slots.deck, v.deckN ? 'B' : null, Math.ceil(v.deckN / 3));
    setSlot(slots.pile, 'F' + v.top, 6);
    slots.pile.ring.material.color.set(COLS[v.col]);
    slots.dir.plane.scale.x = v.dir; slots.dir.plane.material.color.set(COLS[v.col]);
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>🃏 <b style="color:#fff;font-size:14px">' + p.handN + '</b> Karten</small>' + (p.handN === 1 ? '<span class="tag">Flash!</span>' : '') + '</div>')).join('');
  },
  ok(v, i) { const me = v.players[v.me]; return (v.drawn < 0 || v.drawn === i) && KRG.farb.fits(v, me.hand[i]); },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '', any = false;
    if (mine) {
      me.hand.forEach((x, i) => { if (RFarb.ok(v, i)) { slots['h' + i].hl = 1; any = true; } });
      if (v.drawn >= 0) { slots['h' + v.drawn].liftT = .45; t = 'Die gezogene Karte passt: <b>antippen</b> zum Ausspielen oder <b>Behalten</b>.'; }
      else if (any) t = 'Leuchtende Karte antippen: gleiche <b>Farbe</b> oder gleiches <b>Zeichen</b>.';
      else { slots.deck.hl = 1; t = 'Keine Karte passt – tippe auf den <b>Ziehstapel</b>.'; }
      acts(v.drawn >= 0 ? [{ t: '✋ Behalten', fn: () => act({ t: 'pass' }) }] : [{ t: '🂠 Karte ziehen', go: !any, fn: () => act({ t: 'draw' }) }]);
    } else acts([]);
    return [t, 'Farbe: <b style="color:' + COLS[v.col] + '">' + CNAME[v.col] + '</b> · Richtung: <b>' + (v.dir > 0 ? '↻' : '↺') + '</b> · Ziehstapel: <b>' + v.deckN + '</b>'];
  },
  tap(key, v) {
    const me = v.players[v.me];
    if (key === 'deck') { if (v.drawn < 0) act({ t: 'draw' }); return; }
    if (key[0] !== 'h') return;
    const i = +key.slice(1), x = me.hand[i]; if (x === undefined) return;
    if (!RFarb.ok(v, i)) { sfx.bad(); shakeSlot(key); toast(v.drawn >= 0 ? 'Nur die gezogene Karte' : 'Passt nicht'); return; }
    if (x >> 4 === 4) { S.colPick = i; showScr('sColor'); return; }
    act({ t: 'play', i });
  },
  fx(fx, v) {
    const mine = fx.pl === v.me, P = v.players;
    if (fx.t === 'play') {
      fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), slotPos('pile'), 'F' + fx.c); sfx.play();
      const val = fx.c & 15, vic = fx.vic >= 0 ? P[fx.vic].name : '';
      if (fx.c === 78) toast(vic + ' zieht 4 · ' + CNAME[fx.col]);
      else if (fx.c === 77) toast('Farbe: ' + CNAME[fx.col]);
      else if (val === 12) toast(vic + ' zieht 2');
      else if (val === 10 || (val === 11 && fx.vic >= 0)) toast(vic + ' setzt aus');
      else if (val === 11) toast('Richtungswechsel ⇄');
      if (fx.vic >= 0 && fx.n) for (let k = 0; k < Math.min(fx.n, 3); k++) fly(slotPos('deck'), fx.vic === v.me ? { x: 0, z: 2.6 } : figPos(fx.vic), 'B');
      if (fx.one && P[fx.pl].handN === 1) { setTimeout(() => toast(P[fx.pl].name + ': Flash! ⚡'), 700); beep(990, .2, 'square', .05, .6); }
    } else if (fx.t === 'draw') { fly(slotPos('deck'), mine ? { x: 0, z: 2.6 } : figPos(fx.pl), 'B'); sfx.draw(); }
  },
  end(v) { return 'Alle Karten los – Flash!'; }
};

/* ===== Phasenjagd ===== */
const RPhase = {
  rows(v) { // Auslagen je Spieler: 1 oder 2 Felder pro Reihe
    const n = v.n, sig = v.players.map(p => PHX.PH[Math.min(p.ph, 9)].length).join('') + n;
    if (RPhase.sig !== sig || !slots.m0_0) {
      RPhase.sig = sig; Object.keys(slots).filter(k => k[0] === 'm').forEach(k => { const s = slots[k]; scene.remove(s.g); s.t.dispose(); s.plane.material.dispose(); s.glow.material.dispose(); s.plane.geometry.dispose(); s.glow.geometry.dispose(); s.hit.geometry.dispose(); delete slots[k]; });
      const gap = n <= 2 ? .95 : .74;
      v.players.forEach((p, r) => {
        const cnt = PHX.PH[Math.min(p.ph, 9)].length, z = -2.15 + r * gap;
        if (cnt === 1) mkPlate('m' + r + '_0', 0, z, 7.1, .64, 1024);
        else { mkPlate('m' + r + '_0', -1.8, z, 3.5, .64, 512); mkPlate('m' + r + '_1', 1.8, z, 3.5, .64, 512); }
      });
    }
  },
  render(v) {
    const me = v.players[v.me];
    setSlot(slots.deck, v.deckN ? 'B' : null, Math.ceil(v.deckN / 3));
    setSlot(slots.pile, v.top >= 0 ? 'P' + v.top : null, 4);
    RPhase.rows(v); S.plateG = {};
    v.players.forEach((p, r) => {
      const reqs = PHX.PH[Math.min(p.ph, 9)];
      reqs.forEach((q, k) => {
        const key = 'm' + r + '_' + k, s = slots[key]; if (!s) return;
        const gi = v.groups.findIndex(g => g.o === r && g.k === k), g = v.groups[gi]; if (g) S.plateG[key] = gi;
        const on = v.turn === r && v.winner < 0;
        drawPlate(s, JSON.stringify([p.name, p.ph, q, g ? g.cards : 0, on, r === v.me]), (x, w, h) => {
          x.fillStyle = g ? 'rgba(139,92,246,.22)' : 'rgba(255,255,255,.05)'; x.strokeStyle = on ? 'rgba(255,45,149,.9)' : r === v.me ? 'rgba(255,212,38,.7)' : 'rgba(0,229,255,.35)';
          x.lineWidth = 4; x.setLineDash(g ? [] : [12, 8]); x.beginPath(); if (x.roundRect) x.roundRect(3, 3, w - 6, h - 6, 14); else x.rect(3, 3, w - 6, h - 6); x.fill(); x.stroke(); x.setLineDash([]);
          const nm = k === 0 ? (r === v.me ? 'Du' : p.name) : '';
          x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = 'rgba(230,241,255,.9)'; x.font = '800 ' + (h * .26 | 0) + 'px system-ui,sans-serif';
          const lx = 14; if (nm) x.fillText(nm.slice(0, 9), lx, h * .3);
          x.fillStyle = 'rgba(159,180,200,.9)'; x.font = '700 ' + (h * .22 | 0) + 'px system-ui,sans-serif'; if (!g) x.fillText((k === 0 ? 'Phase ' + Math.min(p.ph + 1, v.len) + ': ' : '') + reqTxt(q), lx, nm ? h * .72 : h * .5);
          else if (nm) x.fillText('✔ Phase ' + Math.min(p.ph + 1, v.len), lx, h * .72);
          if (g) {
            const cw0 = h * .62, n = g.cards.length, x0 = nm ? w * (reqs.length === 1 ? .16 : .3) : 16, cw = Math.min(cw0, (w - x0 - 10) / n);
            g.cards.forEach((c, j) => mini(x, x0 + j * cw, h * .14, Math.min(cw0 * .78, cw - 2), h * .72, c));
          }
        });
      });
    });
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>Phase <b style="color:#fff;font-size:14px">' + Math.min(p.ph + 1, v.len) + '</b>/' + v.len + '</small><small>🃏 ' + p.handN + '</small>' + (p.done ? '<span class="tag">✔ ausgelegt</span>' : '') + (p.skip ? '<span class="tag">setzt aus</span>' : '') + '</div><div class="r"><small>Minuspunkte: ' + p.pts + '</small></div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me], need = PHX.need(Math.min(me.ph, 9));
    S.multi = S.multi.filter(i => i < me.hand.length); if (!mine || v.step !== 'play') S.multi = [];
    let t = '';
    if (mine) {
      S.multi.forEach(i => { slots['h' + i].liftT = .45; slots['h' + i].hl = 1; });
      if (v.step === 'draw') {
        slots.deck.hl = 1; const okPile = v.top >= 0 && v.top !== 78; if (okPile) slots.pile.hl = 1;
        t = '<b>1. Ziehen:</b> Ziehstapel oder die oberste Karte der Ablage antippen.';
        acts([{ t: '🂠 Ziehstapel', go: true, fn: () => act({ t: 'draw', src: 'deck' }) }, { t: '♻️ Ablage nehmen', off: !okPile, fn: () => act({ t: 'draw', src: 'pile' }) }]);
      } else {
        const one = S.multi.length === 1 ? me.hand[S.multi[0]] : undefined;
        if (one !== undefined) { slots.pile.hl = 2; if (me.done) v.groups.forEach((g, gi) => { if (PHX.fitsGroup(g, one)) for (const k in S.plateG) if (S.plateG[k] === gi) slots[k].hl = 1; }); }
        t = me.done ? '<b>2.</b> Karte wählen und an eine leuchtende <b>Auslage</b> legen. <b>3.</b> Eine Karte auf die <b>Ablage</b> werfen.'
          : '<b>2.</b> Karten für deine Phase antippen (<b>' + S.multi.length + '/' + need + '</b>) und <b>auslegen</b>. <b>3.</b> Eine Karte auf die <b>Ablage</b> werfen.';
        const L = [];
        if (!me.done) L.push({ t: '✅ Phase auslegen', go: S.multi.length === need, off: S.multi.length !== need, fn: layNow });
        L.push({ t: '⤵️ Abwerfen', off: S.multi.length !== 1, go: me.done && S.multi.length === 1, fn: () => { const i = S.multi[0]; S.multi = []; act({ t: 'disc', i }); } });
        acts(L);
      }
    } else acts([]);
    return [t, 'Deine Phase <b>' + Math.min(me.ph + 1, v.len) + '/' + v.len + '</b>: ' + phTxt(me.ph) + (me.done ? ' ✔' : '') + ' · Runde ' + v.round];
  },
  tap(key, v) {
    const me = v.players[v.me];
    if (v.step === 'draw') {
      if (key === 'deck') act({ t: 'draw', src: 'deck' });
      else if (key === 'pile') { if (v.top === 78) toast('Aussetzen-Karten bleiben liegen'); else act({ t: 'draw', src: 'pile' }); }
      else toast('Erst eine Karte ziehen');
      return;
    }
    if (key[0] === 'h') { const i = +key.slice(1); if (i >= me.hand.length) return; const k = S.multi.indexOf(i); if (k >= 0) S.multi.splice(k, 1); else S.multi.push(i); refreshSel(); return; }
    if (key === 'pile') { if (S.multi.length !== 1) { toast('Genau eine Karte wählen'); return; } const i = S.multi[0]; S.multi = []; act({ t: 'disc', i }); return; }
    if (key[0] === 'm') {
      if (!me.done) { toast('Erst die eigene Phase auslegen'); return; }
      const gi = S.plateG[key]; if (gi === undefined) { toast('Hier liegt noch nichts'); return; }
      if (S.multi.length !== 1) { toast('Genau eine Karte wählen'); return; }
      if (!PHX.fitsGroup(v.groups[gi], me.hand[S.multi[0]])) { sfx.bad(); toast('Passt hier nicht'); return; }
      const i = S.multi[0]; S.multi = []; act({ t: 'hit', i, g: gi });
    }
  },
  fx(fx, v) {
    const mine = fx.pl === v.me, P = v.players, row = k => 'm' + fx.pl + '_' + k;
    if (fx.t === 'draw') { fly(fx.src === 'pile' ? slotPos('pile') : slotPos('deck'), mine ? { x: 0, z: 2.4 } : figPos(fx.pl), fx.c >= 0 ? 'P' + fx.c : 'B'); sfx.draw(); }
    else if (fx.t === 'lay') { [0, 1].forEach(k => { if (slots[row(k)]) slots[row(k)].flash = 1; }); sfx.clr(); toast((mine ? 'Du' : P[fx.pl].name) + ': Phase geschafft!'); }
    else if (fx.t === 'hit') { const k = Object.keys(S.plateG || {}).find(q => S.plateG[q] === fx.g); fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), k ? slotPos(k) : { x: 0, z: -1 }, 'P' + fx.c); sfx.play(); }
    else if (fx.t === 'disc') { fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), slotPos('pile'), 'P' + fx.c); sfx.disc(); if (fx.vic >= 0) toast(P[fx.vic].name + ' setzt aus'); }
  },
  end(v) { return 'Alle ' + v.len + ' Phasen geschafft.'; }
};
const RG = { stapel: RStapel, farb: RFarb, phase: RPhase };
function layNow() {
  const v = S.V, me = v.players[v.me], ph = Math.min(me.ph, 9);
  if (S.multi.length !== PHX.need(ph)) { toast('Wähle ' + PHX.need(ph) + ' Karten'); return; }
  if (!PHX.partition(PHX.PH[ph], S.multi.map(i => me.hand[i]))) { sfx.bad(); toast('Das passt nicht zur Phase'); return; }
  const cards = S.multi.slice(); S.multi = []; act({ t: 'lay', cards });
}
function resTable(v, round) {
  const rows = v.players.map((p, i) => {
    const r = round && v.last ? v.last.rows[i] : null;
    return '<tr><td>' + figImg(p.fig) + esc(i === v.me && S.mode !== 'local' ? 'Du' : p.name) + '</td><td>' + (r ? (r.made ? '✔' : '✗') + ' → Phase ' + Math.min(r.ph + 1, v.len) : 'Phase ' + Math.min(p.ph, v.len)) + '</td>' + (r ? '<td>+' + r.pts + '</td>' : '') + '<td>' + p.pts + '</td></tr>';
  }).join('');
  return '<tr><th>Spieler</th><th>Phase</th>' + (round ? '<th>Runde</th>' : '') + '<th>Minus</th></tr>' + rows;
}

function refreshSel() {
  const v = S.V; if (!v || !slots.deck) return;
  for (const k in slots) { const s = slots[k]; s.hl = 0; s.liftT = 0; }
  const [l1, l2] = RG[v.game].hint(v);
  const me = v.players[v.me];
  let h;
  if (v.winner >= 0 || v.wait) h = '';
  else if (S.hide) h = 'Gerät an <b>' + esc(me.name) + '</b> übergeben …';
  else if (!mineNow(v)) h = esc(v.players[v.turn].name) + ' ist dran …';
  else h = l1;
  $('foot').innerHTML = h + '<span class="l2">' + l2 + '</span>';
  need();
}
function render(v, animate) {
  if (!scene) return;
  if (layoutGame !== v.game) { buildLayout(v.game); S.lastSeq = 0; RPhase.sig = ''; }
  const prev = S.V; S.V = v;
  if (animate && v.fx && v.fx.seq !== S.lastSeq && prev) { S.lastSeq = v.fx.seq; RG[v.game].fx(v.fx, v); }
  else if (v.fx) S.lastSeq = v.fx.seq;
  placeFigs(v);
  RG[v.game].render(v);
  const st = $('status'), mine = mineNow(v);
  st.className = mine ? 'me' : '';
  st.innerHTML = '<small>' + INFO[v.game].icon + ' ' + INFO[v.game].name + '</small><b>' + esc(v.winner >= 0 ? '🏆 ' + v.players[v.winner].name : v.wait ? 'Runde vorbei' : mine ? 'Du bist dran' : S.hide ? '' : v.players[v.turn].name + ' ist dran') + '</b>';
  if (mine && S.lastTurn !== v.turn && S.mode !== 'local') sfx.my();
  S.lastTurn = v.turn; S.pend = false; refreshSel();
  if (v.winner >= 0) endScreen(v);
  else if (v.wait) roundScreen(v);
  else if (S.scr === 'sEnd' || S.scr === 'sRound') hideOv();
}
function roundScreen(v) {
  if (S.roundSeen === v.round) return; S.roundSeen = v.round;
  const out = v.last ? v.players[v.last.out].name : '';
  $('rdTitle').textContent = 'Runde ' + (v.round - 1) + ' vorbei';
  $('rdSub').textContent = out + ' hat keine Karten mehr.';
  $('rdTab').innerHTML = resTable(v, true);
  const guest = S.mode === 'guest'; $('rdGo').style.display = guest ? 'none' : ''; if (guest) $('rdSub').textContent += ' Warte auf den Gastgeber …';
  setTimeout(() => { if (S.V && S.V.wait && S.V.round === v.round) showScr('sRound'); }, 900);
}
function endScreen(v) {
  const iw = v.winner === v.me && S.mode !== 'local'; sfx.win();
  $('endTitle').textContent = S.mode === 'local' || v.winner !== v.me ? v.players[v.winner].name + ' gewinnt!' : 'Gewonnen! 🏆';
  $('endSub').textContent = iw ? RG[v.game].end(v) : RG[v.game].end(v).replace(/ – stark gespielt\./, '');
  const tb = v.game === 'phase'; $('endTabBox').style.display = tb ? '' : 'none'; if (tb) $('endTab').innerHTML = resTable(v, false);
  const again = $('endAgain'); again.style.display = S.mode === 'guest' ? 'none' : ''; if (S.mode === 'guest') $('endSub').textContent += ' Warte auf einen neuen Start vom Gastgeber …';
  setTimeout(() => { if (S.V && S.V.winner >= 0) showScr('sEnd'); }, 1000);
}

/* ---------- Eingabe ---------- */
function tap(key) {
  const v = S.V; if (!v || !mineNow(v) || S.pend || S.scr) return; audio();
  RG[v.game].tap(key, v);
}
function act(a) {
  S.pend = true; S.sel = null;
  if (S.mode === 'guest') { S.net.send({ t: 'act', a }); setTimeout(() => { S.pend = false; }, 2500); return; }
  doApply(a);
}
function doApply(a) {
  const G = S.G; if (!G) return;
  if (a.t !== 'next' && G.players[G.turn].bot) { S.pend = false; return; }
  if (!KRG[S.game].apply(G, a)) { S.pend = false; refreshSel(); return; }
  publish();
}

/* ---------- Spielablauf ---------- */
function publish() {
  const G = S.G, E = KRG[S.game]; clearTimeout(S.timer);
  if (S.mode === 'host') for (const [id, idx] of S.peerIdx) S.net.sendTo(id, { t: 'view', v: E.mkView(G, idx) });
  if (S.mode === 'local') {
    const turnChanged = S.lastTurn !== G.turn && G.winner < 0 && !G.wait;
    if (turnChanged) { S.hide = true; $('passName').textContent = G.players[G.turn].name + ' ist dran'; render(E.mkView(G, G.turn), true); if (!S.scr || S.scr === 'sRound') showScr('sPass'); else S.rulesBack = 'sPass'; return; }
    render(E.mkView(G, G.turn), true); return;
  }
  render(E.mkView(G, 0), true);
  if (G.winner < 0 && !G.wait && G.players[G.turn].bot) {
    const quick = S.game === 'phase' && G.step === 'draw';
    S.timer = setTimeout(() => { if (S.G !== G || G.winner >= 0 || G.wait) return; if (!E.apply(G, E.botAct(G))) E.apply(G, { t: 'draw', src: 'deck' }); publish(); }, (quick ? 450 : 650) + KR.RND() * 400);
  }
}
const seen = g => store.get('seen-' + g) === '1';
function showRules(g, first) {
  S.rulesGame = g; renderRules();
  if (first) store.set('seen-' + g, '1');
  S.rulesBack = S.scr; showScr('sRules');
  $('rulesBack').textContent = first ? "Los geht's" : S.rulesBack ? 'Zurück' : 'Weiterspielen';
}
function renderRules() {
  const g = S.rulesGame; $('ruTitle').textContent = 'Anleitung: ' + INFO[g].name; $('ruBody').innerHTML = INFO[g].rules;
  $('ruTabs').innerHTML = Object.keys(INFO).map(k => '<button data-rt="' + k + '" class="' + (k === g ? 'on' : '') + '">' + INFO[k].icon + ' ' + INFO[k].name + '</button>').join('');
}
function begin(mode, pl) {
  clearTimeout(S.timer); S.mode = mode; S.pl = pl; S.sel = null; S.multi = []; S.hide = false; S.lastTurn = -1; S.lastSeq = 0; S.pend = false; S.roundSeen = 0; S.V = null;
  seats.forEach(s => { s.won = false; });
  S.G = KRG[S.game].newGame(pl, S.opt); hideOv(); publish();
  if (!seen(S.game)) showRules(S.game, true);
}
function pickCpuFigs(used, n) { const free = FIGS.map((_, i) => i).filter(i => !used.includes(i)); KR.shuffle(free); return free.slice(0, n); }
function startSolo() {
  const n = S.opt.opp, me = $('soloName').value.trim().slice(0, 12) || 'Du'; saveName(me === 'Du' ? '' : me);
  const cf = pickCpuFigs([S.myFig], n);
  begin('solo', [{ name: me, fig: S.myFig }].concat(cf.map(f => ({ name: FIGS[f].name, fig: f, bot: true }))));
}
function startLocal() {
  const n = S.opt.loc, pl = [];
  for (let i = 0; i < n; i++) { const inp = $('ln' + i); const nm = (inp && inp.value.trim().slice(0, 12)) || 'Spieler ' + (i + 1); S.locName[i] = inp ? inp.value.trim() : ''; pl.push({ name: nm, fig: S.locFig[i] }); }
  begin('local', pl);
}
function restart() {
  if (S.mode === 'solo' || S.mode === 'local') begin(S.mode, S.pl);
  else if (S.mode === 'host') startHostGame();
}
function toMenu() {
  clearTimeout(S.timer); if (S.net) { S.net.close(true); S.net = null; } S.mode = ''; S.G = null; S.V = null; S.sel = null; S.multi = []; S.hide = false; S.peerIdx.clear();
  $('opp').innerHTML = ''; $('status').textContent = ''; $('foot').textContent = ''; acts([]);
  for (const k in slots) { const s = slots[k]; if (s.card) setSlot(s, null); s.liftT = 0; s.hl = 0; }
  seats.forEach(s => scene.remove(s.g)); seats = []; figKey = '';
  showScr('sMain');
}

/* ---------- Online (PeerJS, WebRTC direkt zwischen den Geräten; Vermittlung über cloud/fire-peer.js) ---------- */
function mkNet(cb) {
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'kartenrausch-', MAX = 3;
  const N = { role: '', code: '', peer: null, conns: new Map(), busy: false }; const libs = {};
  const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
  N.loadPeer = () => load('https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', () => !!window.Peer);
  N.loadQR = () => load('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', () => !!window.qrcode);
  N.norm = s => Array.from(String(s || '').toUpperCase()).filter(ch => ALPHA.includes(ch)).join('').slice(0, 4);
  N.link = () => (u => window.EasyGamesLink ? EasyGamesLink.share(u) : u)(location.href.split('#')[0] + '#join=' + N.code);
  const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
  function reg(conn, onOpen) {
    conn.on('open', () => {
      if (N.role === 'host') {
        if (N.conns.size >= MAX) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
        if (cb.locked && cb.locked()) { try { conn.send({ t: 'busy' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
      }
      N.conns.set(conn.peer, conn); cb.onJoin && cb.onJoin(conn.peer); if (onOpen) onOpen();
    });
    conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
    const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
    conn.on('close', gone); conn.on('error', gone);
  }
  N.host = async function () {
    if (N.busy) return; N.busy = true; N.close(true);
    try {
      await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => {
          const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } else cb.onStatus && cb.onStatus('Verbindung wackelt …'); });
        });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', reg); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      N.busy = false; return N.code;
    } catch (e) { N.busy = false; N.close(true); throw e; }
  };
  N.join = async function (code) {
    if (N.busy) return; code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.busy = true; N.close(true);
    try {
      await N.loadPeer();
      await new Promise((res, rej) => {
        const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); else cb.onStatus && cb.onStatus('Verbindung wackelt …'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); });
      });
      N.busy = false;
    } catch (e) { N.busy = false; N.close(true); throw e; }
  };
  N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
  N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
  N.close = function () {
    for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear();
    if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = '';
  };
  return N;
}
function saveName(n) { store.set('name', n); ['soloName', 'name', 'jName'].forEach(id => { if ($(id).value !== n) $(id).value = n; }); }
const getName = id => { let n = $(id).value.trim().slice(0, 12); saveName(n); return n || 'Spieler'; };
const errText = { code: 'Bitte den 4-stelligen Code eingeben.', nocode: 'Diesen Raum gibt es nicht (mehr).', timeout: 'Keine Verbindung – nochmal versuchen.', broker: 'Verbindungsdienst nicht erreichbar.', lib: 'Online-Bibliothek konnte nicht geladen werden (Internet?).' };
function lobbyList(list, me) { $('lobList').innerHTML = list.map((x, i) => '<div>' + figImg(x.fig) + (i === 0 ? '👑 ' : '') + esc(x.name) + (i === me ? ' (du)' : '') + '</div>').join(''); }
function hostLobbyUpdate() {
  const list = [{ name: S.hostName, fig: S.myFig }].concat(S.lobby.map(x => ({ name: x.name, fig: x.fig })));
  lobbyList(list, 0); $('lobStart').disabled = list.length < 2;
  $('lobMsg').textContent = list.length < 2 ? 'Warte auf Mitspieler … (' + list.length + '/4)' : list.length + ' Spieler bereit.';
  S.lobby.forEach((x, i) => S.net.sendTo(x.id, { t: 'lobby', list, you: i + 1, game: S.game }));
}
function cleanAct(a) {
  if (!a || typeof a !== 'object') return null;
  const o = {}; ['t', 'k', 'src'].forEach(k => { if (typeof a[k] === 'string') o[k] = a[k].slice(0, 8); });
  ['i', 'p', 'd', 'g', 'col'].forEach(k => { if (Number.isInteger(a[k])) o[k] = a[k]; });
  if (Array.isArray(a.cards)) o.cards = a.cards.slice(0, 12).filter(Number.isInteger);
  return o.t === 'next' ? null : o;
}
function netMsgHost(id, d) {
  if (d.t === 'hello') {
    let x = S.lobby.find(l => l.id === id);
    if (!x) { x = { id, name: '' }; S.lobby.push(x); } x.name = String(d.name || 'Gast').slice(0, 12); x.fig = Number.isInteger(d.fig) && FIGS[d.fig] ? d.fig : 0; hostLobbyUpdate();
  } else if (d.t === 'act') {
    const idx = S.peerIdx.get(id), G = S.G; if (!G || idx === undefined || G.turn !== idx || G.players[idx].bot) return;
    const a = cleanAct(d.a); if (!a || !KRG[S.game].apply(G, a)) { S.net.sendTo(id, { t: 'view', v: KRG[S.game].mkView(G, idx) }); return; }
    publish();
  }
}
function netLeaveHost(id) {
  if (S.G && S.mode === 'host') {
    const idx = S.peerIdx.get(id); S.peerIdx.delete(id); if (idx === undefined) return;
    const P = S.G.players[idx]; P.bot = true; P.name += ' 🤖'; publish(); return;
  }
  S.lobby = S.lobby.filter(l => l.id !== id); hostLobbyUpdate();
}
async function goHost() {
  audio(); $('suErr').textContent = ''; S.hostName = getName('name'); S.lobby = [];
  S.net = mkNet({ onMsg: netMsgHost, onLeave: netLeaveHost, locked: () => !!S.G && S.mode === 'host' });
  $('goHost').disabled = true;
  try {
    const code = await S.net.host(); S.mode = 'host-lobby';
    $('lobTitle').textContent = 'Dein Raum'; $('lobGame').innerHTML = 'Spiel: <b>' + INFO[S.game].icon + ' ' + INFO[S.game].name + '</b>';
    $('lobHost').style.display = ''; $('lobCode').textContent = code; $('lobQr').innerHTML = '';
    $('lobStart').style.display = ''; hostLobbyUpdate(); showScr('sLobby');
    S.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(S.net.link()); q.make(); $('lobQr').innerHTML = '<img alt="QR-Code" src="' + q.createDataURL(5, 0) + '">'; }).catch(() => { });
  } catch (e) { if (S.net) S.net.close(true); S.net = null; $('suErr').textContent = errText[e.message] || errText.broker; }
  $('goHost').disabled = false;
}
function startHostGame() {
  const lob = S.lobby.filter(l => S.net.conns.has(l.id)); if (!lob.length) return;
  S.peerIdx = new Map(lob.map((l, i) => [l.id, i + 1]));
  begin('host', [{ name: S.hostName, fig: S.myFig }].concat(lob.map(l => ({ name: l.name, fig: l.fig }))));
}
async function goJoin(codeIn) {
  audio(); const err = $('onErr'); err.textContent = ''; const name = getName('jName');
  S.net = mkNet({ onMsg: netMsgGuest, onLeave: () => { if (S.mode !== '') { alert('Verbindung zum Gastgeber beendet.'); toMenu(); } }, onStatus: m => { $('lobMsg').textContent = m; } });
  $('goJoin').disabled = true;
  try {
    S.mode = 'guest'; S.V = null; await S.net.join(codeIn || $('joinCode').value); S.net.send({ t: 'hello', name, fig: S.myFig });
    $('lobTitle').textContent = 'Raum ' + S.net.code; $('lobGame').textContent = ''; $('lobHost').style.display = 'none'; $('lobStart').style.display = 'none'; lobbyList([], -1); $('lobMsg').textContent = 'Verbunden – warte auf den Start durch den Gastgeber …'; showScr('sLobby');
  } catch (e) { S.mode = ''; if (S.net) S.net.close(true); S.net = null; err.textContent = errText[e.message] || errText.broker; showScr('sJoin'); }
  $('goJoin').disabled = false;
}
function netMsgGuest(id, d) {
  if (d.t === 'lobby') { lobbyList(Array.isArray(d.list) ? d.list : [], d.you); if (INFO[d.game]) $('lobGame').innerHTML = 'Spiel: <b>' + INFO[d.game].icon + ' ' + INFO[d.game].name + '</b>'; }
  else if (d.t === 'view' && d.v && INFO[d.v.game]) {
    if (S.mode !== 'guest') return;
    const fresh = !S.V || S.V.game !== d.v.game || (d.v.fx && S.V.fx && d.v.fx.seq < S.V.fx.seq);
    if (fresh) { S.roundSeen = 0; S.multi = []; seats.forEach(s => { s.won = false; }); }
    S.game = d.v.game; S.hide = false;
    if (S.scr === 'sLobby' || S.scr === 'sEnd') hideOv();
    render(d.v, !fresh);
    if (fresh && !seen(d.v.game) && !S.scr) showRules(d.v.game, true);
  } else if (d.t === 'full' || d.t === 'busy') { const m = d.t === 'full' ? 'Der Raum ist voll.' : 'Das Spiel läuft schon.'; S.mode = ''; if (S.net) S.net.close(true); S.net = null; showScr('sJoin'); $('onErr').textContent = m; }
}

/* ---------- Menüs ---------- */
function renderGameList() {
  $('gameList').innerHTML = Object.keys(INFO).map(k => '<button class="gtile" data-game="' + k + '"><div class="ic">' + INFO[k].icon + '</div><div><b>' + INFO[k].name + '</b><span>' + INFO[k].desc + '</span></div></button>').join('');
}
function refreshFigButtons() {
  document.querySelectorAll('.figb[data-fig="me"]').forEach(b => { b.innerHTML = figImg(S.myFig) + FIGS[S.myFig].name; });
  const n = S.opt.loc; let h = '';
  for (let i = 0; i < n; i++) h += '<div class="who"><input id="ln' + i + '" maxlength="12" placeholder="Spieler ' + (i + 1) + '" autocomplete="off" value="' + esc(S.locName[i] || '') + '"><button class="figb" data-fig="' + i + '">' + figImg(S.locFig[i]) + FIGS[S.locFig[i]].name + '</button></div>';
  $('locList').innerHTML = h;
}
function openFig(target) {
  if (S.scr === 'sSetup') for (let i = 0; i < 4; i++) { const inp = $('ln' + i); if (inp) S.locName[i] = inp.value.trim(); }
  S.figFor = target; S.figBack = S.scr;
  const cur = target === 'me' ? S.myFig : S.locFig[target], used = target === 'me' ? [] : S.locFig.slice(0, S.opt.loc).filter((_, i) => i !== +target);
  $('figGrid').innerHTML = FIGS.map((f, i) => '<button data-pick="' + i + '" class="' + (i === cur ? 'on' : '') + '"' + (used.includes(i) ? ' disabled' : '') + '>' + figImg(i) + f.name + '</button>').join('');
  showScr('sFig');
}
function openSetup(g) {
  S.game = g; const I = INFO[g];
  $('suTitle').textContent = I.icon + ' ' + I.name; $('suDesc').textContent = I.desc; $('suErr').textContent = '';
  $('suOpts').innerHTML = I.opts.map(o => '<div class="seg" data-opt="' + o.k + '"><span>' + o.label + '</span>' + o.v.map(([v, t]) => '<button data-v="' + v + '">' + t + '</button>').join('') + '</div>').join('');
  syncSetup(); showScr('sSetup');
}
function syncSetup() {
  document.querySelectorAll('.seg[data-opt]').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S.opt[s.dataset.opt]) === b.dataset.v)));
  const m = S.opt.mode; $('suSolo').classList.toggle('hid', m !== 'solo'); $('suLocal').classList.toggle('hid', m !== 'local'); $('suOnline').classList.toggle('hid', m !== 'online');
  $('suGo').style.display = m === 'online' ? 'none' : '';
  refreshFigButtons();
}
function initUI() {
  renderGameList();
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; audio();
    if (b.dataset.go) { $('onErr').textContent = ''; showScr(b.dataset.go); return; }
    if (b.dataset.game) { openSetup(b.dataset.game); return; }
    if (b.dataset.fig !== undefined) { openFig(b.dataset.fig === 'me' ? 'me' : +b.dataset.fig); return; }
    if (b.dataset.pick !== undefined) {
      const f = +b.dataset.pick; if (S.figFor === 'me') { S.myFig = f; store.set('fig', String(f)); } else S.locFig[S.figFor] = f;
      refreshFigButtons(); showScr(S.figBack || 'sSetup'); return;
    }
    if (b.dataset.rt) { S.rulesGame = b.dataset.rt; renderRules(); return; }
    if (b.dataset.act !== undefined) { const fn = S.actFns && S.actFns[+b.dataset.act]; if (fn && S.V && mineNow(S.V) && !S.pend) fn(); return; }
    const seg = b.closest('.seg[data-opt]');
    if (seg && b.dataset.v !== undefined) {
      for (let i = 0; i < 4; i++) { const inp = $('ln' + i); if (inp) S.locName[i] = inp.value.trim(); }
      const v = b.dataset.v; S.opt[seg.dataset.opt] = isNaN(+v) ? v : +v;
      if (seg.dataset.opt === 'loc') { const n = S.opt.loc; for (let i = 0; i < n; i++) if (S.locFig.slice(0, i).includes(S.locFig[i])) S.locFig[i] = FIGS.findIndex((_, f) => !S.locFig.slice(0, i).includes(f)); }
      store.set('opt', JSON.stringify(S.opt)); syncSetup();
    }
  });
  $('colBtns').innerHTML = COLS.map((c, i) => '<button data-col="' + i + '" style="background:linear-gradient(' + c + ',' + COLD[i] + ')">' + CNAME[i] + '</button>').join('');
  $('colBtns').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || S.colPick < 0) return; const i = S.colPick; S.colPick = -1; hideOv(); act({ t: 'play', i, col: +b.dataset.col }); });
  $('colCancel').onclick = () => { S.colPick = -1; hideOv(); };
  $('suGo').onclick = () => { if (S.opt.mode === 'solo') startSolo(); else startLocal(); };
  $('suRules').onclick = () => showRules(S.game, false);
  $('goHost').onclick = goHost; $('goJoin').onclick = () => goJoin(); $('goJoinScr').onclick = () => { $('onErr').textContent = ''; showScr('sJoin'); };
  $('joinCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
  $('figBack').onclick = () => showScr(S.figBack || 'sSetup');
  $('rulesBack').onclick = () => { const b = S.rulesBack; S.rulesBack = null; if (b && b !== 'sRules') showScr(b); else if (S.hide) showScr('sPass'); else hideOv(); };
  $('bHelp').onclick = () => { if (S.scr === 'sRules') return; showRules(S.V ? S.V.game : S.game, false); };
  $('bMenu').onclick = () => { if (S.mode === 'host-lobby') return; showScr(S.V && S.V.winner < 0 ? 'sPause' : S.V ? 'sEnd' : 'sMain'); };
  $('pResume').onclick = () => { if (S.hide) showScr('sPass'); else if (S.V && S.V.wait) { S.roundSeen = 0; roundScreen(S.V); hideOv(); } else hideOv(); };
  $('pRules').onclick = () => showRules(S.V ? S.V.game : S.game, false);
  $('pQuit').onclick = toMenu; $('endMenu').onclick = toMenu; $('endAgain').onclick = restart;
  $('rdGo').onclick = () => { hideOv(); if (S.mode !== 'guest') { S.pend = false; doApply({ t: 'next' }); } };
  $('passGo').onclick = () => { S.hide = false; hideOv(); render(KRG[S.game].mkView(S.G, S.G.turn), false); sfx.my(); };
  $('bSnd').onclick = () => { S.snd = !S.snd; $('bSnd').textContent = S.snd ? '🔊' : '🔇'; audio(); };
  $('lobStart').onclick = () => { hideOv(); startHostGame(); };
  $('lobLeave').onclick = toMenu;
  try { const o = JSON.parse(store.get('opt') || 'null'); if (o) ['opp', 'loc', 'stock', 'len', 'mode'].forEach(k => { if (o[k] !== undefined) S.opt[k] = o[k]; }); } catch (e) { }
  const f = +store.get('fig'); if (FIGS[f]) S.myFig = f;
  let n = store.get('name'); if (n === null) { try { n = localStorage.getItem('stapelrausch-name') || ''; } catch (e) { n = ''; } } saveName(n || '');
  refreshFigButtons();
  const m = /[#&]join=([A-Za-z0-9]{4})/.exec(location.hash);
  if (m) { try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { } showScr('sJoin'); $('joinCode').value = m[1].toUpperCase(); }
}
window.addEventListener('load', () => {
  initUI();
  if (typeof THREE === 'undefined') { $('foot').textContent = '3D-Bibliothek konnte nicht geladen werden – bitte Internet prüfen und neu laden.'; return; }
  try { initScene(); } catch (e) { $('foot').textContent = 'WebGL wird auf diesem Gerät nicht unterstützt.'; }
});
