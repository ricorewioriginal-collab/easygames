'use strict';
/* AnMaCha Kartensammlung 3D – Anzeige (Three.js, KayKit-Kartenstube mit animierten Figuren), Bedienung per Touch, Maus, Tastatur und Controller
   (Konsolen-Menüs mit Fokusrahmen, Knopf-Symbole für PlayStation/Switch/Xbox), Menüs, Anleitung, Turnier und Online-Modus (PeerJS, erst bei Bedarf geladen).
   Gerendert wird nur, wenn sich etwas bewegt; die Figuren atmen mit höchstens 30 Bildern/s (Grafik „Sparsam“: nur bei Aktionen). */
const $ = id => document.getElementById(id);
const KRG = KR.games, FIGS = KR.FIGS, PHX = KRG.phase;
const COLS = ['#ff3b6b', '#ffd426', '#2fe0a0', '#38bdf8'], COLD = ['#be123c', '#e08a00', '#059669', '#2563eb'], CNAME = ['Rot', 'Gelb', 'Grün', 'Blau'];
const SUIT = ['♣', '♠', '♥', '♦'], SNAME = ['Kreuz', 'Pik', 'Herz', 'Karo'], SCOL = ['#1e293b', '#1e293b', '#e11d48', '#e11d48'];
const RNK = r => r <= 10 ? String(r) : ['B', 'D', 'K', 'A'][r - 11];
const fName = x => SUIT[x >> 4] + RNK(x & 15);
const LS = 'kartenrausch-';
const store = { get: k => { try { return localStorage.getItem(LS + k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(LS + k, v); } catch (e) { } } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reqTxt = r => r[0] === 'set' ? r[1] + ' gleiche Zahlen' : r[0] === 'run' ? 'Folge aus ' + r[1] : r[1] + ' Karten einer Farbe';
const phTxt = ph => PHX.PH[Math.min(ph, 9)].map(reqTxt).join(' + ');

const INFO = {
  stapel: {
    name: 'Stapelrausch', icon: '🔢', a: '#22d3ee', b: '#1d4ed8', desc: 'Baue Zahlentürme von 1 bis 12 und werde als Erste:r deinen Zielstapel los.',
    opts: [{ k: 'stock', label: 'Zielstapel', v: [[15, 'Kurz 15'], [30, 'Normal 30']] }],
    rules: `<p><b>Ziel:</b> Werde als Erste:r deinen <b>Zielstapel</b> los (goldener Platz links). Nur seine oberste Karte ist offen.</p>
<p><b>Türme:</b> In der Mitte stehen 4 Türme. Jeder beginnt mit <b>1</b> und wird lückenlos bis <b>12</b> gebaut. Unter jedem Turm steht, welche Zahl als Nächstes passt. Ein fertiger Turm wird abgeräumt.</p>
<p><b>Dein Zug:</b></p><ol><li>Du bekommst automatisch 5 Handkarten.</li><li>Spiele so viele Karten wie möglich auf die Türme – von der <b>Hand</b>, vom <b>Zielstapel</b> oder von deinen <b>Ablagen</b> (jeweils die oberste). Karten, die gerade passen, leuchten.</li><li>Zum Schluss legst du <b>eine Handkarte auf eine deiner 4 Ablagen</b>. Damit endet dein Zug.</li></ol>
<p><b>★ Joker</b> passen auf jede Zahl. Hast du alle 5 Handkarten gespielt, ziehst du sofort 5 neue.</p>
<p><b>Tipp:</b> Lege auf eine Ablage absteigend (z. B. 9, 8, 7), dann kannst du sie später nacheinander spielen.</p>
<p><b>Bedienung:</b> Karte antippen, dann den leuchtenden Turm oder eine Ablage antippen.</p>`
  },
  farb: {
    name: 'Farbflash', icon: '🌈', a: '#ff3b6b', b: '#f59e0b', desc: 'Farbe oder Zeichen bedienen, Aktionskarten ausspielen – wer zuerst keine Karte mehr hat, gewinnt.',
    opts: [],
    rules: `<p><b>Ziel:</b> Werde als Erste:r alle Karten los. Jede:r startet mit 7 Karten.</p>
<p><b>Dein Zug:</b> Lege eine Karte auf die Ablage, die in <b>Farbe</b> oder <b>Zahl/Zeichen</b> zur obersten Karte passt. Passende Karten leuchten – einfach antippen.</p>
<p><b>Keine passt?</b> Tippe auf den Ziehstapel. Passt die gezogene Karte, darfst du sie gleich spielen oder <b>behalten</b>.</p>
<p><b>Aktionskarten:</b> <span class="k" style="background:#be123c">⊘</span> Aussetzen – die nächste Person ist übersprungen. <span class="k" style="background:#2563eb">⇄</span> Richtungswechsel (zu zweit wie Aussetzen). <span class="k" style="background:#059669">+2</span> – die nächste Person zieht 2 und setzt aus.</p>
<p><b>Schwarze Karten</b> passen immer: <span class="k" style="background:#333">★</span> Farbwahl – du bestimmst die neue Farbe. <span class="k" style="background:#333">+4</span> – Farbe wählen, die nächste Person zieht 4 und setzt aus.</p>
<p>Bei der letzten Karte ruft deine Figur automatisch <b>„Flash!“</b>.</p>`
  },
  phase: {
    name: 'Phasenjagd', icon: '🎯', a: '#8b5cf6', b: '#db2777', desc: 'Sammle Folgen, gleiche Zahlen und Farben – wer zuerst alle Phasen schafft, gewinnt.',
    opts: [{ k: 'len', label: 'Länge', v: [[5, 'Kurz 5'], [10, 'Alle 10']] }],
    rules: `<p><b>Ziel:</b> Erfülle die Phasen der Reihe nach. Wer zuerst die letzte Phase schafft, gewinnt. Schaffen es mehrere in derselben Runde, gewinnen die wenigsten Minuspunkte.</p>
<p><b>Die Phasen:</b></p><ol>${PHX.PH.map((_, i) => '<li>' + phTxt(i) + '</li>').join('')}</ol>
<p><b>Dein Zug:</b></p><ol><li><b>Ziehen:</b> Ziehstapel oder oberste Karte der Ablage antippen.</li><li><b>Auslegen:</b> Hast du deine Phase, tippe die Karten an und dann <b>Phase auslegen</b>. Danach darfst du einzelne Karten an jede Auslage anlegen (Karte antippen, dann Auslage antippen).</li><li><b>Abwerfen:</b> Eine Karte antippen und auf die Ablage legen.</li></ol>
<p><b>Begriffe:</b> Gleiche Zahlen = Farbe egal. Folge = lückenlos aufsteigend, z. B. 4-5-6-7. Farbe = alle Karten in einer Farbe.</p>
<p><b>★ Joker</b> ersetzt jede Karte. <b>⊘ Aussetzen</b>: abwerfen, dann setzt die nächste Person einmal aus.</p>
<p><b>Rundenende:</b> Hat jemand keine Karte mehr, endet die Runde. Wer seine Phase ausgelegt hat, kommt zur nächsten Phase. Restkarten zählen als Minuspunkte: 1–9 = 5, 10–12 = 10, Aussetzen = 15, Joker = 25.</p>`
  }
};
Object.assign(INFO, {
  mau: {
    name: 'Mau-Mau', icon: '🂡', a: '#16a34a', b: '#064e3b', desc: 'Der Klassiker mit 32 Karten: Farbe oder Wert bedienen, die 7 lässt ziehen, der Bube wünscht.',
    opts: [],
    rules: `<p><b>Ziel:</b> Werde als Erste:r alle Karten los. Jede:r startet mit 5 Karten (32er-Blatt: 7 bis Ass).</p>
<p><b>Dein Zug:</b> Lege eine Karte gleicher <b>Farbe</b> (♣ ♠ ♥ ♦) oder gleichen <b>Werts</b> auf die Ablage. Passende Karten leuchten. Kannst du nicht, ziehst du eine Karte – passt sie, darfst du sie gleich legen oder behalten.</p>
<p><b>Sonderkarten:</b></p><ol><li><b>7</b> – die nächste Person zieht 2 Karten. Sie kann mit einer eigenen 7 kontern, dann zieht die übernächste 4 usw.</li><li><b>8</b> – die nächste Person setzt aus.</li><li><b>Bube</b> passt auf alles (außer auf einen Buben) – du wünschst dir eine Farbe.</li></ol>
<p>Bei der letzten Karte ruft deine Figur <b>„Mau!“</b>, mit der letzten Karte <b>„Mau-Mau!“</b>.</p>`
  },
  swim: {
    name: 'Schwimmen', icon: '🏊', a: '#0ea5e9', b: '#0c4a6e', desc: 'Sammle 31 Punkte in einer Farbe: tauschen mit der Mitte, schieben oder klopfen – wer am wenigsten hat, verliert ein Leben.',
    opts: [],
    rules: `<p><b>Ziel:</b> Bleib als Letzte:r im Spiel. Jede:r hat <b>3 Leben</b> ❤️ – ist das letzte weg, „schwimmt“ man noch eine Runde, dann ist man raus.</p>
<p><b>Karten:</b> Du hast 3 Karten, in der Mitte liegen 3 offen. Gezählt wird nur <b>eine Farbe</b>: Ass = 11, Bube/Dame/König = 10, sonst der Wert. Drei gleiche Werte (z. B. drei Damen) = 30,5. Bestwert: <b>31</b>.</p>
<p><b>Dein Zug</b> – eins davon:</p><ol><li><b>Tauschen:</b> eine eigene Karte antippen, dann eine Karte in der Mitte.</li><li><b>Alle tauschen:</b> deine 3 gegen die 3 der Mitte.</li><li><b>Schieben:</b> nichts tun. Schieben alle nacheinander, kommen 3 neue Karten in die Mitte.</li><li><b>Klopfen:</b> Du bist zufrieden – alle anderen haben noch genau einen Zug.</li></ol>
<p><b>Rundenende:</b> Nach dem Klopfen wird gezählt. Der niedrigste Wert verliert ein Leben. Hat jemand sofort <b>31</b>, endet die Runde und alle anderen verlieren ein Leben.</p>`
  },
  domino: {
    name: 'Kartendomino', icon: '🁫', a: '#f59e0b', b: '#9a3412', desc: 'Lege von den Siebenen aus lückenlose Reihen in jeder Farbe – wer zuerst alle Karten los ist, gewinnt.',
    opts: [],
    rules: `<p><b>Ziel:</b> Werde als Erste:r alle Karten los. Alle 52 Karten werden verteilt.</p>
<p><b>Start:</b> Wer die <b>♥ 7</b> hat, beginnt und legt sie.</p>
<p><b>Dein Zug:</b> Lege eine Karte an: eine neue <b>7</b> eröffnet die Reihe ihrer Farbe. An jede Reihe passt nur die Karte direkt darunter (6, 5 … 2) oder direkt darüber (8, 9 … Ass) in derselben Farbe. Passende Karten leuchten – einfach antippen.</p>
<p><b>Kannst du nicht</b>, tippe auf <b>Passen</b>. Wer kann, muss legen.</p>
<p><b>Tipp:</b> Halte Karten zurück, die anderen weiterhelfen würden, und spiele zuerst dort, wo du selbst noch Karten nachlegen kannst.</p>`
  },
  bj: {
    name: 'Siebzehn und Vier', icon: '🎰', a: '#991b1b', b: '#111827', nw: 1, desc: 'Gegen die Bank: so nah wie möglich an 21, ohne drüber zu kommen. Wer nach allen Runden die meisten Punkte hat, gewinnt.',
    opts: [{ k: 'rounds', label: 'Runden', v: [[3, '3'], [5, '5'], [8, '8']] }],
    rules: `<p><b>Ziel:</b> Schlage die <b>Bank</b>. Alle spielen gleichzeitig gegen sie, nicht gegeneinander. Nach allen Runden gewinnen die meisten Punkte.</p>
<p><b>Werte:</b> 2–10 zählen ihren Wert, Bube, Dame, König = 10, das Ass = 11 oder 1 (je nachdem, was besser ist).</p>
<p><b>Dein Zug:</b> Du hast 2 offene Karten. <b>Karte</b> zieht eine weitere, <b>Halten</b> beendet deinen Zug. Über 21 = verloren.</p>
<p><b>Die Bank</b> deckt ihre zweite Karte erst am Ende auf und zieht, bis sie mindestens 17 hat.</p>
<p><b>Punkte je Runde:</b> besser als die Bank (oder die Bank über 21) = +1, mit 21 aus den ersten zwei Karten = +2, gleich = 0, schlechter oder über 21 = −1.</p>`
  },
  peter: {
    name: 'Schwarzer Peter', icon: '🖤', a: '#334155', b: '#020617', nw: 1, desc: 'Paare ablegen und reihum eine verdeckte Karte ziehen – wer am Ende den Schwarzen Peter hält, verliert.',
    opts: [],
    rules: `<p><b>Ziel:</b> Werde alle Karten los und bleib nicht auf dem <b>Schwarzen Peter</b> (♠ Bube) sitzen.</p>
<p><b>Paare:</b> Zwei Karten mit gleichem Wert und gleicher Farbe (♣/♠ schwarz, ♥/♦ rot) werden automatisch abgelegt. Der ♣ Bube fehlt im Spiel – darum hat der ♠ Bube keinen Partner.</p>
<p><b>Dein Zug:</b> Tippe eine der verdeckten Karten deines Nachbarn an. Ergibt sie ein Paar, wird es sofort abgelegt.</p>
<p><b>Ende:</b> Wer keine Karten mehr hat, ist fertig. Wer zuerst fertig ist, gewinnt – wer zum Schluss den Peter hält, hat verloren.</p>`
  },
  memo: {
    name: 'Paare', icon: '🧠', a: '#a855f7', b: '#3730a3', nw: 1, desc: 'Memory mit 32 Karten: decke zwei auf und finde Paare – gleicher Wert und gleiche Farbe. Wer die meisten Paare hat, gewinnt.',
    opts: [],
    rules: `<p><b>Ziel:</b> Finde die meisten <b>Paare</b>. 32 Karten liegen verdeckt auf dem Tisch.</p>
<p><b>Paar:</b> gleicher Wert und gleiche Farbe, also ♣ mit ♠ (schwarz) oder ♥ mit ♦ (rot) – z. B. ♥ 9 und ♦ 9.</p>
<p><b>Dein Zug:</b> Decke zwei Karten auf. Ist es ein Paar, nimmst du es und bist <b>nochmal dran</b>. Sonst bleiben beide kurz offen liegen und die nächste Person ist dran.</p>
<p><b>Tipp:</b> Merke dir jede aufgedeckte Karte – auch die der anderen.</p>`
  }
});
// Solitär (eigener Bereich im Ordner solitaer/, mit eigener Tastatur- und Controller-Steuerung)
const SOLI = [
  { g: 'klondike', name: 'Patience', icon: '♠', a: '#059669', b: '#064e3b', desc: 'Der Solitär-Klassiker: 1 oder 3 Karten ziehen, auf Wunsch nur lösbare Partien, Tipps und unbegrenzt Rückgängig.' },
  { g: 'spider', name: 'Spider', icon: '🕷️', a: '#7c3aed', b: '#1e1b4b', desc: 'Zwei Kartenspiele, zehn Spalten: komplette Reihen von König bis Ass in einer Farbe ablegen – mit 1, 2 oder 4 Farben.' },
  { g: 'freecell', name: 'FreeCell', icon: '♦', a: '#0284c7', b: '#082f49', desc: 'Alle Karten liegen offen, vier freie Zellen helfen beim Umschichten – fast jede Partie ist lösbar.' }
];
const TABLE_GAMES = ['stapel', 'farb', 'phase', 'mau', 'swim', 'domino', 'bj', 'peter', 'memo'];
const S = {
  game: 'stapel', mode: '', G: null, V: null, sel: null, multi: [], hide: false, pend: false, lastSeq: 0, lastTurn: -1, snd: true, timer: 0,
  pl: [], opt: { mode: 'solo', opp: 2, loc: 2, stock: 30, len: 10, rounds: 5, fx: 2 }, myFig: 0, locFig: [0, 1, 2, 3], locName: ['', '', '', ''],
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
let T, renderer, scene, camera, ray, running = false, lastT = 0, layoutGame = '', layoutTv = false, SH = null;
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
function faceFrench(card) {
  const c = cv2(256, 358), x = c.getContext('2d'), su = card >> 4, r = card & 15, col = SCOL[su];
  const g = x.createLinearGradient(0, 0, 256, 358); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dfe6f5'); x.fillStyle = g; x.fillRect(0, 0, 256, 358);
  x.strokeStyle = su >= 2 ? 'rgba(225,29,72,.55)' : 'rgba(30,41,59,.45)'; x.lineWidth = 6; x.strokeRect(10, 10, 236, 338);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col;
  const corner = (X, Y, rot) => { x.save(); x.translate(X, Y); if (rot) x.rotate(Math.PI); x.font = '900 46px system-ui,sans-serif'; x.fillText(RNK(r), 0, 0); x.font = '900 40px system-ui,sans-serif'; x.fillText(SUIT[su], 0, 44); x.restore(); };
  corner(42, 44); corner(214, 314, true);
  if (r >= 11) { x.fillStyle = su >= 2 ? 'rgba(225,29,72,.12)' : 'rgba(30,41,59,.1)'; x.beginPath(); x.ellipse(128, 182, 70, 96, 0, 0, 7); x.fill(); x.fillStyle = col; x.font = '900 150px "Trebuchet MS",system-ui,sans-serif'; x.fillText(RNK(r), 128, 176); x.font = '900 54px system-ui,sans-serif'; x.fillText(SUIT[su], 128, 262); }
  else { x.font = '900 150px system-ui,sans-serif'; x.fillText(SUIT[su], 128, 184); x.font = '900 60px system-ui,sans-serif'; x.fillStyle = '#fff'; x.fillText(RNK(r), 128, 190); }
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
    const t2 = new T.CanvasTexture(t === 'B' ? drawBack() : t === 'S' ? faceStapel(n, k.endsWith('w')) : t === 'F' ? faceFarb(n) : t === 'K' ? faceFrench(n) : facePhase(n));
    t2.anisotropy = 4; texCache[k] = t2;
  }
  return texCache[k];
}
function txtTex(s, w, h, col, size) {
  const k = 'T' + s + '|' + w + col + size; if (texCache[k]) return texCache[k];
  const c = cv2(w, h), x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col || '#fff'; x.font = '800 ' + (size || h * .6) + 'px system-ui,sans-serif';
  x.fillText(s, w / 2, h / 2 + 2); const t = new T.CanvasTexture(c); texCache[k] = t; return t;
}
function miniF(x, X, Y, w, h, card) {
  x.fillStyle = '#f8fafc'; x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, 5); else x.rect(X, Y, w, h); x.fill();
  x.strokeStyle = 'rgba(30,41,59,.5)'; x.lineWidth = 1.5; x.stroke();
  x.fillStyle = SCOL[card >> 4]; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '900 ' + (h * .36 | 0) + 'px system-ui,sans-serif'; x.fillText(RNK(card & 15), X + w / 2, Y + h * .32);
  x.font = '900 ' + (h * .34 | 0) + 'px system-ui,sans-serif'; x.fillText(SUIT[card >> 4], X + w / 2, Y + h * .72);
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
// Spieltisch: Filz mit Goldkante (Weltmaße: x −4,2…4,2, z −4,45…4,75), Beschriftungen in Weltkoordinaten
const TW = 8.4, TD = 9.2, TZ = .15;
function tableTex(labels) {
  const c = cv2(1024, Math.round(1024 * TD / TW)), x = c.getContext('2d'), U = 1024 / TW, W = c.width, Hh = c.height;
  const g = x.createRadialGradient(W / 2, Hh / 2, 60, W / 2, Hh / 2, W * .75); g.addColorStop(0, '#1f6b55'); g.addColorStop(.6, '#11473a'); g.addColorStop(1, '#0a2b24'); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 9000; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)'; x.fillRect(Math.random() * W, Math.random() * Hh, 2, 2); }   // Filzstruktur
  const X = v => (v + TW / 2) * U, Z = v => (v - TZ + TD / 2) * U;
  x.strokeStyle = 'rgba(255,205,120,.55)'; x.lineWidth = 4; x.beginPath(); if (x.roundRect) x.roundRect(X(-3.95), Z(-4.3), 7.9 * U, 8.9 * U, 34); else x.rect(X(-3.95), Z(-4.3), 7.9 * U, 8.9 * U); x.stroke();
  x.strokeStyle = 'rgba(255,205,120,.18)'; x.lineWidth = 2; x.beginPath(); if (x.roundRect) x.roundRect(X(-3.8), Z(-4.15), 7.6 * U, 8.6 * U, 28); else x.rect(X(-3.8), Z(-4.15), 7.6 * U, 8.6 * U); x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle';
  labels.forEach(([s, lx, lz, sz, col]) => { x.fillStyle = col || 'rgba(255,236,200,.72)'; x.font = '800 ' + ((sz || .24) * U | 0) + 'px system-ui,sans-serif'; x.fillText(s, X(lx), Z(lz)); });
  const t = new T.CanvasTexture(c); t.anisotropy = 8; return t;
}
function woodTex(w, h, base, n) {
  const c = cv2(w, h), x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const y = Math.random() * h; x.strokeStyle = Math.random() < .5 ? 'rgba(0,0,0,.16)' : 'rgba(255,220,170,.07)'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + Math.random() * 6 - 3, w * .7, y + Math.random() * 6 - 3, w, y); x.stroke(); }
  return c;
}
function floorTex() {
  const c = woodTex(512, 512, '#3b2516', 160), x = c.getContext('2d');
  for (let r = 0; r < 8; r++) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, r * 64, 512, 3); for (let k = 0; k < 3; k++) x.fillRect(((r * 97 + k * 173) % 512), r * 64, 3, 64); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(8, 8); t.anisotropy = 4; return t;
}
function bedTex() {
  const c = cv2(128, 176), x = c.getContext('2d');
  x.strokeStyle = 'rgba(255,236,200,.5)'; x.lineWidth = 4; x.setLineDash([10, 8]); x.strokeRect(6, 6, 116, 164);
  x.fillStyle = 'rgba(255,236,200,.06)'; x.fillRect(6, 6, 116, 164);
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
const HAND = {
  stapel: { one: 3.2, per: 5, sp: 1.4 }, farb: { one: 2.25, z: [1.35, 3.05], z3: [.95, 2.1, 3.25], per: 7, sp: 1.2 }, phase: { one: 2.25, z: [1.4, 3.05], per: 6, sp: 1.2 },
  mau: { one: 2.25, z: [1.35, 3.05], z3: [.95, 2.1, 3.25], per: 7, sp: 1.2 }, swim: { one: 2.6, per: 3, sp: 1.5 }, domino: { one: 2.25, z: [1.35, 3.05], z3: [.9, 2.05, 3.2], per: 8, sp: 1.2 },
  bj: { one: 2.5, per: 8, sp: 1.25 }, peter: { one: 2.6, z: [1.75, 3.25], per: 8, sp: 1.1 }, memo: { one: 3.2, per: 8, sp: 1.2 }, menu: { one: 3.2, per: 8, sp: 1.2 }
};
const FACE = { stapel: 'S', farb: 'F', phase: 'P', mau: 'K', swim: 'K', domino: 'K', bj: 'K', peter: 'K', memo: 'K', menu: 'K' };
function buildLayout(game) {
  if (!scene) return; clearLayout(); layoutGame = game; layoutTv = S.mode === 'tv'; figKey = '';
  let labels;
  if (game === 'stapel') {
    labels = [['TÜRME: JE VON 1 BIS 12 BAUEN', 0, -2.55, .26, 'rgba(255,236,200,.88)'], ['ZIEHSTAPEL', 1.6, -3.3], ['ZIELSTAPEL', -2.8, 1.95, .2, 'rgba(255,212,38,.9)'], ['DEINE ABLAGEN · BEENDEN DEN ZUG', .7, 1.95, .2, 'rgba(255,170,120,.92)']];
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
  } else if (game === 'phase') {
    labels = [['ZIEHEN', -2.05, -3.3], ['ABLAGE', 2.05, -3.3]];
    mkSlot('deck', -.75, -3.3, { tint: 0xff2d95 });
    mkSlot('pile', .75, -3.3);
  } else if (game === 'mau') {
    labels = [['ZIEHEN', -1.15, -.35], ['ABLAGE', 1.15, -.35]];
    mkSlot('deck', -1.15, -1.45, { tint: 0xff2d95 });
    mkSlot('pile', 1.15, -1.45);
    mkPlate('wish', 0, -1.45, .9, .9, 128).hit.visible = false;
  } else if (game === 'swim') {
    labels = [['MITTE · ZUM TAUSCHEN', 0, -.45, .24, 'rgba(255,236,200,.88)'], ['DEINE KARTEN', 0, 3.65, .2, 'rgba(255,212,38,.9)']];
    [-1.4, 0, 1.4].forEach((x, j) => mkSlot('c' + j, x, -1.6, { tint: 0x00e5ff }));
    mkPlate('knock', 0, -3.25, 4, .5, 512).hit.visible = false;
  } else if (game === 'domino') {
    labels = [];
    SUIT.forEach((_, su) => mkPlate('r' + su, 0, -3.25 + su * .78, 7.1, .66, 1024));
  } else if (game === 'bj') {
    labels = [['BANK · ZIEHT BIS 17', 0, -.45, .26, 'rgba(255,236,200,.88)'], ['ZIEHEN', -3.05, -2.0, .2]];
    for (let j = 0; j < 8; j++) { const k = mkSlot('k' + j, 0, -1.75, { nobed: j > 1 }); k.hit.visible = false; k.yo = j * .004; }
    mkSlot('deck', -3.05, -3.1, { tint: 0xff9d5c });
    mkPlate('bt', 0, -3.25, 4.4, .55, 512).hit.visible = false;
  } else if (game === 'peter') {
    labels = [['DEINE KARTEN · PAARE GEHEN VON SELBST WEG', 0, 4.25, .2, 'rgba(255,212,38,.9)']];
    mkPlate('from', 0, -3.45, 6, .5, 768).hit.visible = false;
    for (let j = 0; j < 16; j++) { const k = mkSlot('c' + j, 0, j < 8 ? -2.35 : -.75, { nobed: true }); k.g.scale.setScalar(.82); k.yo = j * .002; }
  } else if (game === 'memo') {
    labels = [];
    for (let j = 0; j < 32; j++) { const k = mkSlot('g' + j, -3.22 + (j % 8) * .92, -3.15 + (j >> 3) * 1.42, { nobed: false }); k.g.scale.setScalar(.8); }
  } else labels = [];
  const lab = S.mode === 'tv' ? labels.map(l => [l[0].replace('DEINE KARTEN', 'KARTEN AM ZUG').replace('DEINE ABLAGEN', 'ABLAGEN AM ZUG')].concat(l.slice(1))) : labels; // TV-Tisch: Beschriftung für den Spieler am Zug
  if (SH.table.material.map) SH.table.material.map.dispose();
  SH.table.material.map = tableTex(lab); SH.table.material.needsUpdate = true;
  for (let i = 0; i < 30; i++) { const s = mkSlot('h' + i, 0, 3.2, { nobed: true }); s.yo = i * .004; }
  resize();
}
function layHand(n, cfg) {
  const out = [], rows = n <= cfg.per || !cfg.z ? 1 : n <= cfg.per * 2 || !cfg.z3 ? 2 : 3, per = Math.ceil(n / rows), sc = rows === 3 ? .82 : 1;
  const zs = rows === 1 ? [cfg.one] : rows === 2 ? cfg.z : cfg.z3;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / per), k = i - r * per, cnt = Math.min(per, n - r * per);
    const sp = Math.min(cfg.sp * sc, cnt > 1 ? (7.4 - sc) / (cnt - 1) : cfg.sp);
    out.push({ x: (k - (cnt - 1) / 2) * sp, z: zs[r], sp, sc, last: k === cnt - 1 });
  }
  return out;
}
function showHand(cards, hidden) {
  const pos = layHand(cards.length, HAND[layoutGame]), pre = FACE[layoutGame];
  for (let i = 0; i < 30; i++) {
    const s = slots['h' + i], p = pos[i];
    if (!p) { setSlot(s, null); continue; }
    s.tx = p.x; s.g.position.z = p.z; s.g.scale.setScalar(p.sc);
    const ov = p.sp < p.sc * 1.02 && !p.last; s.hit.scale.x = ov ? p.sp / (1.3 * p.sc) : 1; s.hit.position.x = ov ? -.5 + p.sp / (2 * p.sc) : 0;
    setSlot(s, hidden ? 'B' : pre + cards[i], 1);
  }
}
function initScene() {
  T = THREE;
  renderer = new T.WebGLRenderer({ canvas: $('cv'), antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.opt.fx === 2 ? 2 : 1.25)); renderer.setClearColor(0x0a0c14);
  scene = new T.Scene(); scene.fog = new T.Fog(0x0a0c14, 16, 34); camera = new T.PerspectiveCamera(36, 1, .1, 100); ray = new T.Raycaster();
  scene.add(new T.HemisphereLight(0xffe6c4, 0x1b1410, .75)); const dl = new T.DirectionalLight(0xfff1dc, .75); dl.position.set(2, 7, 5); scene.add(dl);
  const pl = new T.PointLight(0xffa64d, 1.1, 18, 2); pl.position.set(0, 4.5, -6.5); scene.add(pl); SH = { flicker: pl };
  Object.assign(SH, {
    bed: bedTex(), bedG: new T.PlaneGeometry(1.16, 1.56), glowG: new T.PlaneGeometry(1.22, 1.62), card: new T.BoxGeometry(1, .04, 1.4), box: new T.BoxGeometry(1, 1, 1.4), hit: new T.PlaneGeometry(1.3, 1.5),
    side: new T.MeshBasicMaterial({ color: 0xd9cbb0 }), back: new T.MeshBasicMaterial({ map: tex('B') }), hitMat: new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    ring: new T.RingGeometry(.34, .46, 28), tag: new T.PlaneGeometry(1.5, .3)
  });
  // Tisch: Filzplatte, Holzrand, Tischkörper; darunter Dielenboden der Kartenstube
  SH.table = addMesh(new T.PlaneGeometry(TW, TD), new T.MeshBasicMaterial({ color: 0xffffff }), 0, -.01, TZ, true); scene.add(SH.table);
  const wood = new T.CanvasTexture(woodTex(256, 64, '#5a3420', 30)); wood.wrapS = wood.wrapT = T.RepeatWrapping;
  const wm = new T.MeshLambertMaterial({ map: wood, color: 0xffffff }), dark = new T.MeshLambertMaterial({ color: 0x2a1a10 });
  const rim = (w, d, x, z) => { const m = new T.Mesh(new T.BoxGeometry(w, .2, d), wm); m.position.set(x, .06, z); scene.add(m); };
  rim(TW + .7, .35, 0, TZ - TD / 2 - .17); rim(TW + .7, .35, 0, TZ + TD / 2 + .17); rim(.35, TD, -TW / 2 - .17, TZ); rim(.35, TD, TW / 2 + .17, TZ);
  const body = new T.Mesh(new T.BoxGeometry(TW + .6, 1.0, TD + .6), dark); body.position.set(0, -.55, TZ); scene.add(body);
  const floor = addMesh(new T.PlaneGeometry(60, 60), new T.MeshLambertMaterial({ map: floorTex() }), 0, -1.1, 0, true); scene.add(floor);
  const wallC = cv2(256, 256), wx = wallC.getContext('2d'); wx.fillStyle = '#2b2622'; wx.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) { wx.fillStyle = 'hsl(25,' + (8 + Math.random() * 8) + '%,' + (16 + Math.random() * 8) + '%)'; wx.fillRect(k * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); }
  const wt = new T.CanvasTexture(wallC); wt.wrapS = wt.wrapT = T.RepeatWrapping; wt.repeat.set(10, 3);
  const wall = new T.Mesh(new T.PlaneGeometry(44, 12), new T.MeshLambertMaterial({ map: wt })); wall.position.set(0, 4.9, -10.5); scene.add(wall);
  SH.room = new T.Group(); scene.add(SH.room); loadRoom();
  const gc = new T.Mesh(SH.card, [SH.side, SH.side, new T.MeshBasicMaterial({ map: tex('B') }), SH.back, SH.side, SH.side]);
  gc.visible = false; scene.add(gc); SH.ghost = { m: gc, t: 1, a: null, b: null, q: [] };
  // Auswahlrahmen für Tastatur/Controller und Zug-Anzeige über der Figur
  const fc = cv2(160, 208), fx2 = fc.getContext('2d'); fx2.strokeStyle = '#fff'; fx2.lineWidth = 10; fx2.shadowColor = '#ffb45e'; fx2.shadowBlur = 14; fx2.beginPath(); if (fx2.roundRect) fx2.roundRect(10, 10, 140, 188, 16); else fx2.rect(10, 10, 140, 188); fx2.stroke();
  SH.cur = addMesh(new T.PlaneGeometry(1.36, 1.78), new T.MeshBasicMaterial({ map: new T.CanvasTexture(fc), transparent: true, depthWrite: false, color: 0xffd9a0 }), 0, .2, 0, true); SH.cur.visible = false; SH.cur.renderOrder = 5; scene.add(SH.cur);
  SH.curA = new T.Mesh(new T.ConeGeometry(.16, .34, 4), new T.MeshBasicMaterial({ color: 0xffd27a })); SH.curA.rotation.x = Math.PI; SH.curA.visible = false; scene.add(SH.curA);
  SH.turnA = new T.Mesh(new T.OctahedronGeometry(.16), new T.MeshBasicMaterial({ color: 0xffb45e })); SH.turnA.visible = false; scene.add(SH.turnA);
  const ro = new ResizeObserver(() => resize()); ['stage', 'hudsp', 'acts'].forEach(id => ro.observe($(id)));
  buildLayout(S.game);
  const cv = $('cv'); cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect(); const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    const hits = ray.intersectObjects(Object.values(slots).filter(s => s.hit.visible && (s.hasCard !== false || !'hgc'.includes(s.key[0]))).map(s => s.hit), false);
    if (hits.length) { S.cur = hits[0].object.userData.key; tap(S.cur); }
  });
  KR.figPreload(T);
  attract();
}
// Kartenstube aus KayKit-Teilen (models/room.glb); ohne Modelle bleibt der schlichte Raum
function loadRoom() {
  if (!T.GLTFLoader) return;
  new T.GLTFLoader().load('models/room.glb', g => {
    const P = {}; g.scene.children.slice().forEach(n => { P[n.name.replace(/^p:/, '')] = n; });
    g.scene.traverse(o => { if (o.isMesh) { const m = o.material; if (m && m.map) { m.map.encoding = T.LinearEncoding; m.needsUpdate = true; } if (m) { m.metalness = 0; m.roughness = .9; } } });
    const put = (nm, x, y, z, ry, sc) => { const n = P[nm]; if (!n) return; const c = n.clone(); c.position.set(x, y, z); c.rotation.set(0, ry || 0, 0); c.scale.setScalar(sc || 1); SH.room.add(c); return c; };
    const F = -1.1;
    put('pillar_decorated', -7.2, F, -9.6, 0, 1.4); put('pillar_decorated', 7.2, F, -9.6, 0, 1.4);
    put('banner_patternA_red', -3.6, F + 1.2, -10.9, 0, 1.15); put('banner_patternB_blue', 3.6, F + 1.2, -10.9, 0, 1.15); put('banner_thin_yellow', 0, F + 1.6, -10.9, 0, 1.15);
    put('torch_mounted', -5.4, 2.6, -10.5, 0, 1.3); put('torch_mounted', 5.4, 2.6, -10.5, 0, 1.3);
    put('shelves', -1.8, F - .9, -10.6, 0, 1.25); put('shelves', 1.8, F - .9, -10.6, 0, 1.25);
    put('barrel_large', -7.4, F, -5.5, .4, 1.1); put('barrel_small_stack', -7.6, F, -3.0, 1.2, 1.1); put('crates_stacked', 7.6, F, -5.8, -.3, 1.1);
    put('chest_gold', 7.3, F, -2.8, -1.2, 1.0); put('coin_stack_small', 6.4, F, -2.2, 0, 1.0); put('table_small_decorated_A', -7.0, F, .8, .6, 1.2);
    put('stool', 6.8, F, .6, 0, 1.2); put('chair', -6.0, F, -7.6, .3, 1.3); put('chair', 6.0, F, -7.6, -.3, 1.3);
    put('candle_triple', -TW / 2 - .1, .16, TZ - TD / 2 - .1, 0, .55); put('candle_triple', TW / 2 + .1, .16, TZ - TD / 2 - .1, 0, .55);
    put('candle_lit', -TW / 2 - .1, .16, TZ + TD / 2 + .1, 0, .5); put('candle_lit', TW / 2 + .1, .16, TZ + TD / 2 + .1, 0, .5);
    const cl = new T.PointLight(0xffb060, .7, 9, 2); cl.position.set(0, 2.2, -4.6); SH.room.add(cl);
    need();
  }, undefined, () => { });
}
function resize() {
  if (!renderer) return; const st = $('stage'), w = Math.max(st.clientWidth, 50), h = Math.max(st.clientHeight, 50);
  renderer.setSize(w, h, false);
  // Der Tisch füllt den freien Bereich zwischen den Glas-Leisten (#hudsp); im Menü den ganzen Bildschirm
  let L = 0, Tp = 0, bw = w, bh = h;
  if (!document.body.classList.contains('nog')) { const sr = st.getBoundingClientRect(), r = $('hudsp').getBoundingClientRect(), ar = $('acts').getBoundingClientRect(); if (r.width > 50 && r.height > 50) { L = r.left - sr.left; Tp = r.top - sr.top; bw = r.width; bh = Math.max(50, (ar.height ? ar.top : r.bottom) - r.top); } }
  camera.clearViewOffset(); camera.aspect = bw / bh;
  const el = 60 * Math.PI / 180, cz = .15, pts = [];
  for (const x of [-3.6, 3.6]) for (const z of [-3.95, 4.15]) for (const y of [0, .5]) pts.push(new T.Vector3(x, y, z));
  for (const x of [-2.9, 2.9]) pts.push(new T.Vector3(x, 1.45, -4.95));
  let d = 5;
  for (let i = 0; i < 90; i++) {
    camera.position.set(0, Math.sin(el) * d, cz + Math.cos(el) * d); camera.lookAt(0, 0, cz); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    if (pts.every(p => { const q = p.clone().project(camera); return Math.abs(q.x) < .98 && Math.abs(q.y) < .98; })) break; d *= 1.04;
  }
  if (L || Tp || bw !== w || bh !== h) camera.setViewOffset(bw, bh, -L, -Tp, w, h);
  S.camD = d; S.camEl = el; S.camZ = cz;
  need();
}

/* ---------- 3D-Figuren am Tisch (KayKit, animiert) ---------- */
let figKey = '', seats = [], animUntil = 0, lastR = 0;
const FIG_Z = -4.95, FIG_Y = -1.1;
function dropSeat(s) { scene.remove(s.g); s.tag.material.dispose(); if (s.model && s.model.userData.dispose) s.model.userData.dispose(); s.dead = true; }
function placeFigs(v) {
  const others = v.players.map((_, i) => i).filter(i => i !== v.me);
  const key = v.game + v.me + ':' + others.map(i => v.players[i].fig + v.players[i].name).join(',');
  if (key !== figKey) {
    figKey = key; seats.forEach(dropSeat); seats = [];
    const k = others.length, span = k === 1 ? 0 : k === 2 ? 3.4 : 5.4;
    others.forEach((idx, j) => {
      const x = k === 1 ? 0 : -span / 2 + span * j / (k - 1), p = v.players[idx], g = new T.Group(); g.position.set(x, 0, FIG_Z);
      const fig = new T.Group(); fig.position.y = FIG_Y; fig.scale.setScalar(1.6); g.add(fig);
      const tag = addMesh(SH.tag, new T.MeshBasicMaterial({ map: txtTex(p.name, 300, 60, '#fff3e0', 34), transparent: true, depthWrite: false }), 0, .012, .66, true); g.add(tag);
      const st = { idx, g, fig, tag, x, jump: 0, rep: 0, model: null };
      KR.figModel(T, p.fig).then(m => { if (st.dead) { if (m.userData.dispose) m.userData.dispose(); return; } st.model = m; m.rotation.y = x * -.09; fig.add(m); animUntil = performance.now() + 1500; need(); })
        .catch(() => { if (st.dead) return; const f = KR.buildFig(T, p.fig); f.scale.setScalar(1.5); f.position.y = 1.05; fig.add(f); need(); });
      scene.add(g); seats.push(st);
    });
  }
  let any = false;
  seats.forEach(s => {
    const on = v.turn === s.idx && v.winner < 0 && !v.wait;
    s.tag.material.color.setHex(on ? 0xffc98a : 0xffffff); s.tag.material.opacity = on ? 1 : .7;
    if (on) { any = true; SH.turnA.position.set(s.x, 1.75, FIG_Z); }
    if (on && !s.on) s.jump = 1; s.on = on;
    if (v.winner === s.idx && !s.won) { s.won = true; s.jump = 1; s.rep = 4; figAnim(s.idx, 'Interact'); }
  });
  SH.turnA.visible = any;
  need();
}
const seatOf = i => seats.find(s => s.idx === i);
function figPos(i) { const s = seatOf(i); return s ? { x: s.x, z: -4.5 } : { x: 0, z: -6.5 }; }
function figAnim(i, name) { const s = seatOf(i); if (s && s.model && s.model.userData.play) { s.model.userData.play(name); animUntil = performance.now() + 2600; need(); } }
// Menü: drei Figuren stehen schon am Tisch, die Kamera kreist langsam (nur Grafik „Hoch“)
function attract() {
  if (!scene || S.G || S.mode === 'guest') return;
  const pool = FIGS.map((_, i) => i).filter(i => i !== S.myFig); KR.shuffle(pool);
  const pl = [S.myFig, pool[0], pool[1]].map(f => ({ name: FIGS[f].name, fig: f }));
  if (layoutGame !== 'menu') { buildLayout('menu'); }
  placeFigs({ game: 'menu', me: -1, turn: -1, winner: -1, players: pl });
  S.attract = true; need();
}

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
    s.glow.material.opacity = o; s.glow.material.color.setHex(s.flash > 0 ? 0xffd426 : s.hl === 2 ? 0xff7a59 : 0x7df9ff);
  }
  for (const s of seats) {
    if (s.jump > 0) { s.jump = Math.max(0, s.jump - dt * 2.2); s.fig.position.y = FIG_Y + Math.sin(s.jump * Math.PI) * .3; s.fig.rotation.y = Math.sin(s.jump * Math.PI * 2) * .3; more = true; if (!s.jump && s.rep > 0) { s.rep--; s.jump = 1; } }
  }
  const gh = SH.ghost;
  if (gh.t >= 1 && gh.q.length) { const f = gh.q.shift(); gh.m.material[2].map = tex(f.face); gh.a = f.a; gh.b = f.b; gh.t = 0; gh.m.visible = true; }
  if (gh.t < 1) {
    gh.t = Math.min(1, gh.t + dt / .38); const e = gh.t * gh.t * (3 - 2 * gh.t);
    gh.m.position.set(gh.a.x + (gh.b.x - gh.a.x) * e, .25 + Math.sin(e * Math.PI) * .9, gh.a.z + (gh.b.z - gh.a.z) * e);
    gh.m.rotation.x = -Math.sin(e * Math.PI) * .4; if (gh.t >= 1) gh.m.visible = gh.q.length > 0; more = true;
  }
  // Auswahlrahmen (Tastatur/Controller) – erscheint sofort, ohne ersten Tastendruck
  if (S.V && !S.scr && !S.cur && document.documentElement.classList.contains('kb')) curFix();
  const cs = curShown() ? slots[S.cur] : null;
  SH.cur.visible = SH.curA.visible = !!cs;
  if (cs) {
    const sc = cs.g.scale.x, px = cs.g.position.x, pz = cs.g.position.z, cy = (cs.card ? cs.card.position.y : 0) * sc + .03;
    SH.cur.position.set(px, cy + .01, pz); SH.cur.scale.set(sc * (cs.plane ? cs.plane.geometry.parameters.width / 1.2 : 1), sc * (cs.plane ? cs.plane.geometry.parameters.height / 1.6 : 1), 1);
    SH.curA.position.set(px, cy + .55 + Math.sin(t / 180) * .08, pz - (cs.plane ? 0 : .5 * sc)); SH.curA.rotation.y = t / 500;
  }
  const busy = !document.hidden && (S.opt.fx === 2 || t < animUntil);
  const living = KR.figTick(dt) && busy;
  if (SH.turnA.visible) { SH.turnA.position.y = 1.75 + Math.sin(t / 260) * .07; SH.turnA.rotation.y = t / 400; }
  if (SH.flicker && busy) SH.flicker.intensity = 1.05 + Math.sin(t / 97) * .06 + Math.sin(t / 41) * .04;
  if (S.attract && S.camD && S.opt.fx === 2 && !document.hidden) {
    const a = Math.sin(t / 9000) * .35, d = S.camD * 1.06;
    camera.position.set(Math.sin(a) * d * Math.cos(S.camEl), Math.sin(S.camEl) * d, S.camZ + Math.cos(a) * d * Math.cos(S.camEl)); camera.lookAt(0, 0, S.camZ - .6);
  }
  const anim = living || cs || SH.turnA.visible && busy || (S.attract && S.opt.fx === 2 && !document.hidden);
  if (more || !anim || t - lastR > 32) { renderer.render(scene, camera); lastR = t; }
  if (more || anim) requestAnimationFrame(frame); else running = false;
}
const slotPos = key => { const s = slots[key]; return s ? { x: s.tx, z: s.g.position.z } : { x: 0, z: 0 }; };
function fly(a, b, face) { if (!SH) return; SH.ghost.q.push({ a, b, face: face || 'B' }); if (SH.ghost.q.length > 3) SH.ghost.q.shift(); need(); }
function shakeSlot(k) { if (slots[k]) { slots[k].shake = 1; need(); } }

/* ---------- Anzeige ---------- */
const grp = v => v === 0 ? 0 : v <= 4 ? 1 : v <= 8 ? 2 : 3;
const tileH = (v, big) => '<span class="tile ' + (big ? 'big ' : '') + (v < 0 ? 'e' : 'c' + grp(v)) + '">' + (v < 0 ? '·' : v === 0 ? '★' : v) + '</span>';
function nog() { const b = document.body, was = b.classList.contains('nog'); b.classList.toggle('nog', !S.V); if (was !== !S.V) resize(); }
const figImg = f => '<img alt="" src="img/fig' + (FIGS[f] ? f : 0) + '.webp">';
function showScr(id) { nog(); S.scr = id; document.querySelectorAll('.scr').forEach(e => e.classList.toggle('on', e.id === id)); $('ov').classList.remove('hidden'); $('ov').scrollTop = 0; menuFocus(); prompts(); need(); }
function hideOv() { nog(); S.scr = null; $('ov').classList.add('hidden'); setPf(null); prompts(); need(); }
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
const shared = () => S.mode === 'local' || S.mode === 'tv';
const mineNow = v => v.turn === v.me && v.winner < 0 && !S.hide && !v.wait;
function chip(p, i, v, inner) {
  return '<div class="chip' + (v.turn === i && v.winner < 0 && !v.wait ? ' turn' : '') + '"><div class="nm">' + figImg(p.fig) + esc(p.name) + '</div>' + inner + '</div>';
}
function acts(list) {
  $('acts').innerHTML = list.map((b, i) => '<button data-act="' + i + '" class="' + (b.go ? 'go' : '') + '"' + (b.off ? ' disabled' : '') + '>' + glH(ACT_KEYS[i]) + b.t + '</button>').join('');
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
  end(v) { return v.winner === v.me && !shared() ? 'Zielstapel leer – stark gespielt.' : 'Zielstapel zuerst geleert.'; }
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
    if (x >> 4 === 4) { pickColor('col', i); return; }
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
  round(v) { return resTable(v, true); },
  roundSub(v) { return (v.last ? v.players[v.last.out].name : '') + ' hat keine Karten mehr.'; },
  end(v) { return 'Alle ' + v.len + ' Phasen geschafft.'; }
};
/* ===== Mau-Mau ===== */
const RMau = {
  render(v) {
    const me = v.players[v.me];
    setSlot(slots.deck, v.deckN ? 'B' : null, Math.ceil(v.deckN / 3));
    setSlot(slots.pile, 'K' + v.top, 6);
    drawPlate(slots.wish, 'w' + v.wish + ':' + v.pen, (x, w, h) => {
      x.textAlign = 'center'; x.textBaseline = 'middle';
      if (v.pen) { x.fillStyle = '#ff2d95'; x.font = '900 60px system-ui,sans-serif'; x.fillText('+' + v.pen, w / 2, h / 2 + 4); }
      else if (v.wish >= 0) { x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, h / 2, 54, 0, 7); x.fill(); x.fillStyle = SCOL[v.wish]; x.font = '900 80px system-ui,sans-serif'; x.fillText(SUIT[v.wish], w / 2, h / 2 + 6); }
    });
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>🃏 <b style="color:#fff;font-size:14px">' + p.handN + '</b> Karten</small>' + (p.handN === 1 ? '<span class="tag">Mau!</span>' : '') + '</div>')).join('');
  },
  ok(v, i) { const me = v.players[v.me]; return (v.drawn < 0 || v.drawn === i) && KRG.mau.fits(v, me.hand[i]); },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '', any = false;
    if (mine) {
      me.hand.forEach((x, i) => { if (RMau.ok(v, i)) { slots['h' + i].hl = 1; any = true; } });
      if (v.drawn >= 0) { slots['h' + v.drawn].liftT = .45; t = 'Die gezogene Karte passt: <b>antippen</b> zum Legen oder <b>Behalten</b>.'; }
      else if (v.pen) t = any ? 'Kontere mit einer <b>7</b> – oder ziehe <b>' + v.pen + ' Karten</b>.' : 'Du musst <b>' + v.pen + ' Karten</b> ziehen – tippe auf den Ziehstapel.';
      else if (any) t = 'Leuchtende Karte antippen: gleiche <b>Farbe</b> oder gleicher <b>Wert</b>' + (v.wish >= 0 ? ' (Wunsch: <b>' + SNAME[v.wish] + '</b>)' : '') + '.';
      else t = 'Keine Karte passt – tippe auf den <b>Ziehstapel</b>.';
      if (!any || v.pen) slots.deck.hl = 1;
      acts(v.drawn >= 0 ? [{ t: '✋ Behalten', fn: () => act({ t: 'pass' }) }] : [{ t: v.pen ? '🂠 ' + v.pen + ' Karten ziehen' : '🂠 Karte ziehen', go: !any, fn: () => act({ t: 'draw' }) }]);
    } else acts([]);
    return [t, (v.wish >= 0 ? 'Wunschfarbe: <b>' + SUIT[v.wish] + ' ' + SNAME[v.wish] + '</b> · ' : '') + 'Ziehstapel: <b>' + v.deckN + '</b>'];
  },
  tap(key, v) {
    const me = v.players[v.me];
    if (key === 'deck') { if (v.drawn < 0) act({ t: 'draw' }); return; }
    if (key[0] !== 'h') return;
    const i = +key.slice(1), x = me.hand[i]; if (x === undefined) return;
    if (!RMau.ok(v, i)) { sfx.bad(); shakeSlot(key); toast(v.pen ? 'Nur eine 7 – oder ziehen' : v.drawn >= 0 ? 'Nur die gezogene Karte' : 'Passt nicht'); return; }
    if ((x & 15) === 11) { pickColor('suit', i); return; }
    act({ t: 'play', i });
  },
  fx(fx, v) {
    const mine = fx.pl === v.me, P = v.players;
    if (fx.t === 'play') {
      fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), slotPos('pile'), 'K' + fx.c); sfx.play();
      const r = fx.c & 15, nx = P[(fx.pl + 1) % v.n].name;
      if (r === 11) toast('Wunsch: ' + SUIT[fx.col] + ' ' + SNAME[fx.col]);
      else if (r === 7) toast(nx + ' muss ' + fx.pen + ' ziehen');
      else if (r === 8) toast(P[fx.vic].name + ' setzt aus');
      if (fx.one && P[fx.pl].handN === 1) { setTimeout(() => toast(P[fx.pl].name + ': Mau! 🃏'), 700); beep(990, .2, 'square', .05, .6); }
    } else if (fx.t === 'draw') { for (let k = 0; k < Math.min(fx.n || 1, 3); k++) fly(slotPos('deck'), mine ? { x: 0, z: 2.6 } : figPos(fx.pl), 'B'); sfx.draw(); if (fx.n > 1) toast((mine ? 'Du ziehst ' : P[fx.pl].name + ' zieht ') + fx.n); }
  },
  end() { return 'Mau-Mau! Alle Karten los.'; }
};

/* ===== Schwimmen ===== */
const hearts = p => p.out ? 'raus' : p.lives ? '❤️'.repeat(p.lives) : '🏊 schwimmt';
const RSwim = {
  render(v) {
    const me = v.players[v.me];
    v.mid.forEach((c, j) => setSlot(slots['c' + j], 'K' + c, 1));
    drawPlate(slots.knock, 'k' + v.knock + v.round, (x, w, h) => { if (v.knock < 0) return; x.fillStyle = 'rgba(255,45,149,.9)'; const t = '✊ ' + (v.knock === v.me && !shared() ? 'Du hast' : v.players[v.knock].name + ' hat') + ' geklopft · letzte Runde'; let fs = h * .55 | 0; x.font = '800 ' + fs + 'px system-ui,sans-serif'; const m = x.measureText(t).width; if (m > w * .94) { fs = fs * w * .94 / m | 0; x.font = '800 ' + fs + 'px system-ui,sans-serif'; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, w / 2, h / 2 + 2); });
    showHand(me.out ? [] : me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>' + hearts(p) + '</small>' + (v.knock === i ? '<span class="tag">✊ klopft</span>' : '') + '</div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '';
    if (mine) {
      const sel = S.sel;
      if (sel) slots[(sel.k === 'hand' ? 'h' : 'c') + sel.i].liftT = .45;
      if (sel) for (let j = 0; j < 3; j++) slots[(sel.k === 'hand' ? 'c' : 'h') + j].hl = 1;
      t = sel ? 'Jetzt die Karte ' + (sel.k === 'hand' ? 'in der <b>Mitte</b>' : 'auf deiner <b>Hand</b>') + ' antippen, die du tauschen willst.' : 'Eine Karte von dir und eine aus der <b>Mitte</b> antippen = tauschen. Oder unten wählen.';
      acts([{ t: '🔄 Alle tauschen', fn: () => act({ t: 'all' }) }, { t: '⏭️ Schieben', fn: () => act({ t: 'pass' }) }, { t: '✊ Klopfen', go: me.score >= 25, off: v.knock >= 0, fn: () => act({ t: 'knock' }) }]);
    } else acts([]);
    return [t, me.out ? 'Du bist raus – schau zu.' : 'Dein Wert: <b>' + String(me.score).replace('.', ',') + '</b> · Leben: ' + hearts(me) + ' · Runde ' + v.round];
  },
  tap(key, v) {
    const k = key[0] === 'h' ? 'hand' : key[0] === 'c' ? 'mid' : ''; if (!k) return;
    const i = +key.slice(1); if (k === 'hand' && i > 2) return;
    if (!S.sel || S.sel.k === k) { S.sel = S.sel && S.sel.i === i && S.sel.k === k ? null : { k, i }; refreshSel(); return; }
    const a = k === 'hand' ? { t: 'swap', i, j: S.sel.i } : { t: 'swap', i: S.sel.i, j: i }; S.sel = null; act(a);
  },
  fx(fx, v) {
    const mine = fx.pl === v.me, P = v.players, who = mine && !shared() ? 'Du' : P[fx.pl].name;
    if (fx.t === 'swap') { fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), slotPos('c' + fx.j), 'K' + fx.c); fly(slotPos('c' + fx.j), mine ? slotPos('h' + fx.i) : figPos(fx.pl), 'B'); sfx.play(); }
    else if (fx.t === 'all') { for (let j = 0; j < 3; j++) fly(slotPos('c' + j), mine ? slotPos('h' + j) : figPos(fx.pl), 'B'); sfx.clr(); toast(who + ': alle getauscht'); }
    else if (fx.t === 'pass') { sfx.disc(); if (fx.fresh) toast('Alle haben geschoben – neue Mitte'); }
    else if (fx.t === 'knock') { beep(200, .08, 'square', .1); beep(200, .08, 'square', .1, .15); toast(who + ' klopft! ✊'); }
    if (fx.s31) { toast(who + ': 31! 🎉'); sfx.win(); }
  },
  round(v) {
    const L = v.last; if (!L) return '';
    return '<tr><th>Spieler</th><th>Karten</th><th>Wert</th><th>Leben</th></tr>' + v.players.map((p, i) => '<tr><td>' + figImg(p.fig) + esc(i === v.me && !shared() ? 'Du' : p.name) + '</td><td>' + (L.hands[i] || []).map(fName).join(' ') + '</td><td>' + (L.sc[i] < 0 ? '–' : String(L.sc[i]).replace('.', ',')) + (L.lose.includes(i) ? ' 💔' : '') + '</td><td>' + hearts(p) + '</td></tr>').join('');
  },
  roundSub(v) { const L = v.last; return L.why === '31' ? 'Jemand hat 31! Alle anderen verlieren ein Leben.' : 'Nach dem Klopfen verliert der niedrigste Wert ein Leben.'; },
  end() { return 'Als Letzte:r über Wasser geblieben.'; }
};

/* ===== Kartendomino ===== */
const RDomino = {
  render(v) {
    const me = v.players[v.me];
    v.rows.forEach((r, su) => drawPlate(slots['r' + su], JSON.stringify(r), (x, w, h) => {
      x.fillStyle = 'rgba(255,255,255,.05)'; x.strokeStyle = 'rgba(0,229,255,.35)'; x.lineWidth = 3; x.setLineDash(r ? [] : [12, 8]); x.beginPath(); if (x.roundRect) x.roundRect(3, 3, w - 6, h - 6, 14); else x.rect(3, 3, w - 6, h - 6); x.fill(); x.stroke(); x.setLineDash([]);
      x.fillStyle = su >= 2 ? '#ff5577' : '#e6f1ff'; x.font = '900 ' + (h * .6 | 0) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(SUIT[su], 44, h / 2 + 3);
      const cw = (w - 100) / 13;
      for (let k = 2; k <= 14; k++) {
        const X = 86 + (k - 2) * cw;
        if (r && k >= r.lo && k <= r.hi) miniF(x, X, 8, cw - 4, h - 16, su * 16 + k);
        else { x.fillStyle = 'rgba(159,180,200,.35)'; x.font = '700 ' + (h * .3 | 0) + 'px system-ui,sans-serif'; x.fillText(RNK(k), X + cw / 2, h / 2 + 2); }
      }
    }));
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>🃏 <b style="color:#fff;font-size:14px">' + p.handN + '</b> Karten</small></div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '', any = false;
    if (mine) {
      me.hand.forEach((x, i) => { if (KRG.domino.can(v, x)) { slots['h' + i].hl = 1; any = true; } });
      t = !v.started ? 'Du hast die <b>♥ 7</b> – leg sie zum Start.' : any ? 'Leuchtende Karte antippen – sie wird an ihre Reihe gelegt.' : 'Keine Karte passt – tippe auf <b>Passen</b>.';
      acts(any ? [] : [{ t: '✋ Passen', go: true, fn: () => act({ t: 'pass' }) }]);
    } else acts([]);
    return [t, 'Deine Karten: <b>' + me.hand.length + '</b>'];
  },
  tap(key, v) {
    if (key[0] !== 'h') return; const i = +key.slice(1), x = v.players[v.me].hand[i]; if (x === undefined) return;
    if (!KRG.domino.can(v, x)) { sfx.bad(); shakeSlot(key); toast(v.started ? 'Passt an keine Reihe' : 'Zuerst die ♥ 7'); return; }
    act({ t: 'play', i });
  },
  fx(fx, v) {
    const mine = fx.pl === v.me;
    if (fx.t === 'play') { const su = fx.c >> 4, k = fx.c & 15; fly(mine ? slotPos('h' + fx.i) : figPos(fx.pl), { x: -3.55 + .38 + (86 + (k - 2) * 71.8) / 1024 * 7.1 - .2, z: -3.25 + su * .78 }, 'K' + fx.c); slots['r' + su].flash = .6; sfx.play(); }
    else { toast(v.players[fx.pl].name + ' passt'); sfx.disc(); }
  },
  end() { return 'Alle Karten angelegt.'; }
};
/* ===== Siebzehn und Vier ===== */
const cardsTxt = h => h.map(fName).join(' ');
const RBj = {
  render(v) {
    const me = v.players[v.me], n = v.bank.length;
    for (let j = 0; j < 8; j++) { const k = slots['k' + j]; if (j < n) { k.tx = (j - (n - 1) / 2) * 1.15; setSlot(k, v.bank[j] < 0 ? 'B' : 'K' + v.bank[j], 1); } else setSlot(k, null); }
    setSlot(slots.deck, 'B', Math.ceil(v.deckN / 4));
    drawPlate(slots.bt, 'b' + v.bankT + ':' + v.bank.length + ':' + v.round, (x, w, h) => { x.fillStyle = 'rgba(255,236,200,.92)'; x.font = '800 ' + (h * .56 | 0) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Bank: ' + (v.bank.includes(-1) ? v.bankT + ' + ?' : v.bankT) + ' · Runde ' + v.round + '/' + v.rounds, w / 2, h / 2 + 2); });
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>' + cardsTxt(p.cards) + ' = <b style="color:#fff;font-size:14px">' + p.t + '</b></small>' + (p.bust ? '<span class="tag">über 21</span>' : p.done ? '<span class="tag">hält</span>' : '') + '</div><div class="r"><small>Punkte: ' + p.pts + '</small></div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '';
    if (mine) {
      slots.deck.hl = 1;
      t = 'Dein Wert: <b>' + me.t + '</b>. Noch eine <b>Karte</b> oder <b>halten</b>? Über 21 ist verloren.';
      acts([{ t: '🂠 Karte', go: me.t < 17, fn: () => act({ t: 'hit' }) }, { t: '✋ Halten', go: me.t >= 17, fn: () => act({ t: 'stand' }) }]);
    } else acts([]);
    return [t, 'Dein Wert: <b>' + me.t + '</b> · Punkte: <b>' + me.pts + '</b> · Runde ' + v.round + '/' + v.rounds];
  },
  tap(key) { if (key === 'deck') act({ t: 'hit' }); },
  fx(fx, v) {
    const mine = fx.pl === v.me, P = v.players, f = fx.t === 'round' && fx.last ? fx.last : fx, who = f.pl === v.me && !shared() ? 'Du' : P[f.pl].name;
    if (f.t === 'hit') { fly(slotPos('deck'), f.pl === v.me ? { x: 0, z: 2.5 } : figPos(f.pl), 'K' + f.c); sfx.draw(); if (f.bust) { toast(who + ': über 21!'); figAnim(f.pl, 'Hit_A'); } else figAnim(f.pl, 'Use_Item'); }
    else if (f.t === 'stand') { sfx.disc(); toast(who + (f.pl === v.me && !shared() ? ' hältst' : ' hält') + ' bei ' + P[f.pl].t); }
    if (fx.t === 'round') { for (let j = 0; j < v.bank.length; j++) slots['k' + j].flash = .8; sfx.clr(); }
    if (fx.t === 'deal') { sfx.draw(); }
    void mine;
  },
  round(v) {
    const L = v.last; if (!L) return '';
    const res = d => d === 2 ? '+2 (21!)' : d === 1 ? '+1' : d === 0 ? '±0' : '−1';
    return '<tr><th>Spieler</th><th>Karten</th><th>Wert</th><th>Runde</th><th>Punkte</th></tr><tr><td>🏦 Bank</td><td>' + cardsTxt(L.bank) + '</td><td>' + (L.bt > 21 ? L.bt + ' 💥' : L.bt) + '</td><td></td><td></td></tr>' +
      v.players.map((p, i) => '<tr><td>' + figImg(p.fig) + esc(i === v.me && !shared() ? 'Du' : p.name) + '</td><td>' + cardsTxt(L.hands[i]) + '</td><td>' + L.res[i].t + (L.res[i].t > 21 ? ' 💥' : '') + '</td><td>' + res(L.res[i].d) + '</td><td>' + p.pts + '</td></tr>').join('');
  },
  roundSub(v) { const L = v.last; return L.bt > 21 ? 'Die Bank hat sich überkauft (' + L.bt + ').' : 'Die Bank hat ' + L.bt + '.'; },
  endTab(v) { return RBj.round(v); },
  end(v) { return 'Die meisten Punkte nach ' + v.rounds + ' Runden.'; }
};

/* ===== Schwarzer Peter ===== */
const RPeter = {
  render(v) {
    const me = v.players[v.me], n = v.fromN, r1 = Math.min(n, 8), r2 = Math.max(0, n - 8);
    for (let j = 0; j < 16; j++) { const k = slots['c' + j]; if (j < n) { const row = j < 8 ? r1 : r2, q = j < 8 ? j : j - 8; k.tx = (q - (row - 1) / 2) * .98; setSlot(k, 'B', 1); } else setSlot(k, null); }
    drawPlate(slots.from, 'f' + v.from + ':' + v.turn + ':' + v.winner, (x, w, h) => { if (v.from < 0) return; x.fillStyle = 'rgba(255,236,200,.92)'; x.font = '800 ' + (h * .5 | 0) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; const a = v.turn === v.me && !shared() ? 'Du ziehst' : v.players[v.turn].name + ' zieht'; x.fillText(a + ' bei ' + (v.from === v.me && !shared() ? 'dir' : v.players[v.from].name), w / 2, h / 2 + 2); });
    showHand(me.hand, S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>🃏 <b style="color:#fff;font-size:14px">' + p.handN + '</b> · Paare: ' + p.pairs + '</small>' + (!p.handN ? '<span class="tag">✔ fertig</span>' : v.from === i && v.turn === v.me ? '<span class="tag">hier ziehen</span>' : '') + '</div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '';
    if (mine) { for (let j = 0; j < v.fromN; j++) slots['c' + j].hl = 1; t = 'Tippe eine verdeckte Karte von <b>' + esc(v.players[v.from].name) + '</b> an. Paare werden automatisch abgelegt.'; }
    acts([]);
    const hasP = me.hand && me.hand.includes(KRG.peter.PETER);
    return [t, 'Deine Karten: <b>' + me.handN + '</b> · Paare: <b>' + me.pairs + '</b>' + (hasP ? ' · 🖤 Du hast den Peter!' : '')];
  },
  tap(key, v) { if (key[0] !== 'c') return; const i = +key.slice(1); if (i >= v.fromN) return; act({ t: 'pick', i }); },
  fx(fx, v) {
    const me = v.me, from = fx.from === me ? { x: 0, z: 2.6 } : figPos(fx.from), to = fx.pl === me ? { x: 0, z: 2.6 } : figPos(fx.pl);
    fly(fx.from === me ? from : slotPos('c' + Math.min(fx.i, 15)), to, fx.pair ? 'K' + fx.c : 'B'); sfx.draw();
    if (fx.pair) { setTimeout(() => { toast((fx.pl === me && !shared() ? 'Du' : v.players[fx.pl].name) + ': Paar! ' + fName(fx.c)); sfx.play(); }, 380); figAnim(fx.pl, 'Interact'); }
    if (fx.pl === me && !shared() && v.players[me].hand && v.players[me].hand.includes(KRG.peter.PETER) && S.prevPeter === false) setTimeout(() => toast('Oh nein – der Schwarze Peter! 🖤'), 450);
    if (fx.from === me && !shared() && S.prevPeter && v.players[me].hand && !v.players[me].hand.includes(KRG.peter.PETER)) setTimeout(() => toast('Peter weg! 😅'), 450);
  },
  endTab(v) { return '<tr><th>Platz</th><th>Spieler</th><th>Paare</th></tr>' + v.order.concat(v.loser >= 0 ? [v.loser] : []).map((i, k) => '<tr><td>' + (i === v.loser ? '🖤' : k + 1) + '</td><td>' + figImg(v.players[i].fig) + esc(i === v.me && !shared() ? 'Du' : v.players[i].name) + '</td><td>' + v.players[i].pairs + '</td></tr>').join(''); },
  end(v) { return v.loser >= 0 ? (v.loser === v.me && !shared() ? 'Du hast' : v.players[v.loser].name + ' hat') + ' den Schwarzen Peter.' : 'Alle Karten abgelegt.'; }
};

/* ===== Paare (Memory) ===== */
const RMemo = {
  render(v) {
    v.board.forEach((c, j) => setSlot(slots['g' + j], c === -1 ? null : c === -2 ? 'B' : 'K' + c, 1));
    showHand([], S.hide);
    $('opp').innerHTML = v.players.map((p, i) => i === v.me ? '' : chip(p, i, v, '<div class="r"><small>Paare: <b style="color:#fff;font-size:14px">' + p.pts + '</b></small></div>')).join('');
  },
  hint(v) {
    const mine = mineNow(v), me = v.players[v.me];
    let t = '';
    v.open.concat(v.peek).forEach(j => { slots['g' + j].liftT = .25; });
    if (mine) {
      v.board.forEach((c, j) => { if (c === -2 || v.peek.includes(j)) slots['g' + j].hl = 1; });
      t = v.open.length ? 'Jetzt die <b>zweite Karte</b> aufdecken – gleicher Wert und gleiche Farbe (schwarz/rot) ist ein Paar.' : 'Decke <b>zwei Karten</b> auf. Ein Paar gefunden? Dann bist du nochmal dran.';
    }
    acts([]);
    return [t, 'Deine Paare: <b>' + me.pts + '</b> · noch ' + v.left + ' Paare auf dem Tisch'];
  },
  tap(key, v) { if (key[0] !== 'g') return; const i = +key.slice(1); if (v.board[i] === -1 || v.open.includes(i)) return; act({ t: 'flip', i }); },
  fx(fx, v) {
    if (fx.t === 'flip') { slots['g' + fx.i].flash = .5; sfx.draw(); }
    else if (fx.t === 'pair') { fly(slotPos('g' + fx.i), fx.pl === v.me ? { x: 0, z: 4 } : figPos(fx.pl), 'K' + fx.c); sfx.clr(); toast((fx.pl === v.me && !shared() ? 'Du' : v.players[fx.pl].name) + ': Paar! ' + fName(fx.c)); figAnim(fx.pl, 'Interact'); }
    else if (fx.t === 'miss') { slots['g' + fx.i].flash = .5; sfx.bad(); }
  },
  endTab(v) { return '<tr><th>Spieler</th><th>Paare</th></tr>' + v.players.map((p, i) => '<tr><td>' + figImg(p.fig) + esc(i === v.me && !shared() ? 'Du' : p.name) + '</td><td>' + p.pts + '</td></tr>').join(''); },
  end() { return 'Die meisten Paare gefunden.'; }
};
const RG = { stapel: RStapel, farb: RFarb, phase: RPhase, mau: RMau, swim: RSwim, domino: RDomino, bj: RBj, peter: RPeter, memo: RMemo };
function pickColor(kind, i) {
  S.colPick = i; $('colTitle').textContent = kind === 'suit' ? 'Welche Farbe wünschst du dir?' : 'Welche Farbe?';
  $('colBtns').innerHTML = kind === 'suit' ? SUIT.map((c, k) => '<button data-col="' + k + '" style="background:#f8fafc;color:' + SCOL[k] + ';text-shadow:none;font-size:22px">' + c + ' ' + SNAME[k] + '</button>').join('')
    : COLS.map((c, k) => '<button data-col="' + k + '" style="background:linear-gradient(' + c + ',' + COLD[k] + ')">' + CNAME[k] + '</button>').join('');
  showScr('sColor');
}
function layNow() {
  const v = S.V, me = v.players[v.me], ph = Math.min(me.ph, 9);
  if (S.multi.length !== PHX.need(ph)) { toast('Wähle ' + PHX.need(ph) + ' Karten'); return; }
  if (!PHX.partition(PHX.PH[ph], S.multi.map(i => me.hand[i]))) { sfx.bad(); toast('Das passt nicht zur Phase'); return; }
  const cards = S.multi.slice(); S.multi = []; act({ t: 'lay', cards });
}
function resTable(v, round) {
  const rows = v.players.map((p, i) => {
    const r = round && v.last ? v.last.rows[i] : null;
    return '<tr><td>' + figImg(p.fig) + esc(i === v.me && !shared() ? 'Du' : p.name) + '</td><td>' + (r ? (r.made ? '✔' : '✗') + ' → Phase ' + Math.min(r.ph + 1, v.len) : 'Phase ' + Math.min(p.ph, v.len)) + '</td>' + (r ? '<td>+' + r.pts + '</td>' : '') + '<td>' + p.pts + '</td></tr>';
  }).join('');
  return '<tr><th>Spieler</th><th>Phase</th>' + (round ? '<th>Runde</th>' : '') + '<th>Minus</th></tr>' + rows;
}

function refreshSel() {
  const v = S.V; if (!v || !slots.h0) return;
  for (const k in slots) { const s = slots[k]; s.hl = 0; s.liftT = 0; }
  const [l1, l2] = RG[v.game].hint(v);
  const me = v.players[v.me];
  let h;
  if (v.winner >= 0 || v.wait) h = '';
  else if (S.mode === 'tv') h = '📱 <b>' + esc(v.players[v.turn].name) + '</b> ist dran und spielt am Handy …';
  else if (S.hide) h = 'Gerät an <b>' + esc(me.name) + '</b> übergeben …';
  else if (!mineNow(v)) h = esc(v.players[v.turn].name) + ' ist dran …';
  else h = l1;
  $('foot').innerHTML = h + '<span class="l2">' + (S.mode === 'tv' ? '' : l2) + '</span>';
  need();
}
function render(v, animate) {
  if (!scene) return;
  if (layoutGame !== v.game || layoutTv !== (S.mode === 'tv')) { buildLayout(v.game); S.lastSeq = 0; RPhase.sig = ''; }
  const prev = S.V; S.V = v;
  if (v.game === 'peter') S.prevPeter = !!(prev && prev.game === 'peter' && prev.players[prev.me].hand && prev.players[prev.me].hand.includes(KRG.peter.PETER));
  if (animate && v.fx && v.fx.seq !== S.lastSeq && prev) {
    S.lastSeq = v.fx.seq; RG[v.game].fx(v.fx, v); const f = v.fx;
    if (['stapel', 'farb', 'phase', 'mau', 'swim', 'domino'].includes(v.game) && f.pl !== v.me && !['pass', 'round', 'deal'].includes(f.t)) figAnim(f.pl, f.t === 'draw' ? 'Use_Item' : f.t === 'knock' ? 'Throw' : 'Interact');
    if (f.vic >= 0 && f.vic !== v.me) setTimeout(() => figAnim(f.vic, 'Hit_A'), 350);
  } else if (v.fx) S.lastSeq = v.fx.seq;
  placeFigs(v); nog();
  RG[v.game].render(v);
  const st = $('status'), mine = mineNow(v);
  st.className = mine ? 'me' : '';
  st.innerHTML = '<small>' + INFO[v.game].icon + ' ' + INFO[v.game].name + '</small><b>' + esc(v.winner >= 0 ? '🏆 ' + v.players[v.winner].name : v.wait ? 'Runde vorbei' : mine ? 'Du bist dran' : S.hide && S.mode !== 'tv' ? '' : v.players[v.turn].name + ' ist dran') + '</b>';
  if (mine && S.lastTurn !== v.turn && !shared()) sfx.my();
  S.lastTurn = v.turn; S.pend = false; refreshSel();
  if (v.winner >= 0) endScreen(v);
  else if (v.wait) roundScreen(v);
  else if (S.scr === 'sEnd' || S.scr === 'sRound') hideOv();
}
function roundScreen(v) {
  if (S.roundSeen === v.round) return; S.roundSeen = v.round;
  $('rdTitle').textContent = 'Runde ' + (v.round - 1) + ' vorbei';
  $('rdSub').textContent = RG[v.game].roundSub(v);
  $('rdTab').innerHTML = RG[v.game].round(v);
  const guest = S.mode === 'guest' && !S.tvGuest; $('rdGo').style.display = guest ? 'none' : ''; if (guest) $('rdSub').textContent += ' Warte auf den Gastgeber …';
  setTimeout(() => { if (S.V && S.V.wait && S.V.round === v.round) showScr('sRound'); }, 900);
}
function endScreen(v) {
  const iw = v.winner === v.me && !shared(); sfx.win();
  $('endTitle').textContent = shared() || v.winner !== v.me ? v.players[v.winner].name + ' gewinnt!' : 'Gewonnen! 🏆';
  $('endSub').textContent = iw ? RG[v.game].end(v) : RG[v.game].end(v).replace(/ – stark gespielt\./, '');
  const tb = v.game === 'phase' ? resTable(v, false) : RG[v.game].endTab ? RG[v.game].endTab(v) : ''; $('endTabBox').style.display = tb ? '' : 'none'; if (tb) $('endTab').innerHTML = tb;
  if (v.game === 'peter' && v.loser >= 0) figAnim(v.loser, 'Death_A');
  const again = $('endAgain'); again.style.display = S.mode === 'guest' ? 'none' : ''; if (S.mode === 'guest') $('endSub').textContent += ' Warte auf einen neuen Start vom Gastgeber …';
  again.textContent = S.tour ? '🏆 Turnier-Stand' : 'Nochmal';
  if (S.tour && !S.tour.counted) { S.tour.counted = true; S.tour.pts[v.winner] += 3; S.tour.res.push(v.winner); }
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
  if (S.mode === 'host' || S.mode === 'tv') for (const [id, idx] of S.peerIdx) S.net.sendTo(id, { t: 'view', v: E.mkView(G, idx) });
  if (S.mode === 'local') {
    const turnChanged = S.lastTurn !== G.turn && G.winner < 0 && !G.wait;
    if (turnChanged) { S.hide = true; $('passName').textContent = G.players[G.turn].name + ' ist dran'; render(E.mkView(G, G.turn), true); if (!S.scr || S.scr === 'sRound') showScr('sPass'); else S.rulesBack = 'sPass'; return; }
    render(E.mkView(G, G.turn), true); return;
  }
  if (S.mode === 'tv') { S.hide = true; render(E.mkView(G, G.turn), true); } // TV-Tisch: Blick vom Platz des aktiven Spielers, Karten verdeckt
  else render(E.mkView(G, 0), true);
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
  S.attract = false; resize();
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
  if (S.tour) { tourTable(); return; }
  if (S.mode === 'solo' || S.mode === 'local') begin(S.mode, S.pl);
  else if (S.mode === 'host' || S.mode === 'tv') startHostGame();
}
function toMenu() {
  clearTimeout(S.timer); if (S.net) { S.net.close(true); S.net = null; } S.mode = ''; S.tvHost = false; S.tvGuest = false; S.G = null; S.V = null; S.sel = null; S.multi = []; S.hide = false; S.peerIdx.clear();
  $('opp').innerHTML = ''; $('status').textContent = ''; $('foot').textContent = ''; acts([]);
  for (const k in slots) { const s = slots[k]; if (s.card) setSlot(s, null); s.liftT = 0; s.hl = 0; }
  seats.forEach(dropSeat); seats = []; figKey = ''; S.tour = null;
  showScr('sMain'); attract();
}

/* ---------- Online (PeerJS, WebRTC direkt zwischen den Geräten; Vermittlung über cloud/fire-peer.js) ---------- */
function mkNet(cb) {
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'kartenrausch-', MAX = cb.max || 3;
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
function lobbyList(list, me, tv) { $('lobList').innerHTML = list.map((x, i) => '<div>' + figImg(x.fig) + (i === 0 && !tv ? '👑 ' : '') + esc(x.name) + (i === me ? ' (du)' : '') + '</div>').join(''); }
function hostLobbyUpdate() {
  const tv = S.tvHost, list = (tv ? [] : [{ name: S.hostName, fig: S.myFig }]).concat(S.lobby.map(x => ({ name: x.name, fig: x.fig })));
  lobbyList(list, tv ? -1 : 0, tv); $('lobStart').disabled = list.length < 2;
  $('lobMsg').textContent = list.length < 2 ? 'Warte auf ' + (tv ? 'Handys' : 'Mitspieler') + ' … (' + list.length + '/4)' : list.length + ' Spieler bereit.';
  S.lobby.forEach((x, i) => S.net.sendTo(x.id, { t: 'lobby', list, you: tv ? i : i + 1, game: S.game, tv }));
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
  } else if (d.t === 'next') {
    if (S.mode === 'tv' && S.G && S.G.wait) { hideOv(); doApply({ t: 'next' }); }
  } else if (d.t === 'act') {
    const idx = S.peerIdx.get(id), G = S.G; if (!G || idx === undefined || G.turn !== idx || G.players[idx].bot) return;
    const a = cleanAct(d.a); if (!a || !KRG[S.game].apply(G, a)) { S.net.sendTo(id, { t: 'view', v: KRG[S.game].mkView(G, idx) }); return; }
    publish();
  }
}
function netLeaveHost(id) {
  if (S.G && (S.mode === 'host' || S.mode === 'tv')) {
    const idx = S.peerIdx.get(id); S.peerIdx.delete(id); if (idx === undefined) return;
    const P = S.G.players[idx]; P.bot = true; P.name += ' 🤖'; publish(); return;
  }
  S.lobby = S.lobby.filter(l => l.id !== id); hostLobbyUpdate();
}
async function goHost(tv) {
  audio(); $('suErr').textContent = ''; S.tvHost = !!tv; S.hostName = tv ? '' : getName('name'); S.lobby = [];
  S.net = mkNet({ onMsg: netMsgHost, onLeave: netLeaveHost, locked: () => !!S.G && (S.mode === 'host' || S.mode === 'tv'), max: tv ? 4 : 3 });
  $('goHost').disabled = $('goTv').disabled = true;
  try {
    const code = await S.net.host(); S.mode = 'host-lobby';
    $('lobTitle').textContent = tv ? '📺 TV-Tisch' : 'Dein Raum'; $('lobGame').innerHTML = 'Spiel: <b>' + INFO[S.game].icon + ' ' + INFO[S.game].name + '</b>';
    $('lobHost').style.display = ''; $('lobCode').textContent = code; $('lobQr').innerHTML = '';
    $('lobStart').style.display = ''; hostLobbyUpdate(); showScr('sLobby');
    S.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(S.net.link()); q.make(); $('lobQr').innerHTML = '<img alt="QR-Code" src="' + q.createDataURL(5, 0) + '">'; }).catch(() => { });
  } catch (e) { if (S.net) S.net.close(true); S.net = null; $('suErr').textContent = errText[e.message] || errText.broker; }
  $('goHost').disabled = $('goTv').disabled = false;
}
function startHostGame() {
  const lob = S.lobby.filter(l => S.net.conns.has(l.id)); if (!lob.length) return;
  const tv = S.tvHost; if (tv && lob.length < 2) return;
  S.peerIdx = new Map(lob.map((l, i) => [l.id, tv ? i : i + 1]));
  begin(tv ? 'tv' : 'host', (tv ? [] : [{ name: S.hostName, fig: S.myFig }]).concat(lob.map(l => ({ name: l.name, fig: l.fig }))));
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
  if (d.t === 'lobby') { S.tvGuest = !!d.tv; lobbyList(Array.isArray(d.list) ? d.list : [], d.you, S.tvGuest); if (INFO[d.game]) $('lobGame').innerHTML = 'Spiel: <b>' + INFO[d.game].icon + ' ' + INFO[d.game].name + '</b>'; }
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

/* ---------- Menüs (Konsolen-Stil) ---------- */
const tileArt = (o, extra) => '<div class="art" style="--a:' + o.a + ';--b:' + o.b + '"><i></i><i></i><i></i><em>' + o.icon + '</em></div>' + (o.nw ? '<span class="nw">NEU</span>' : '') + (extra || '');
function renderGameList() {
  const h = TABLE_GAMES.map(k => '<button class="gtile" data-game="' + k + '" role="listitem">' + tileArt(INFO[k], '<div class="tx"><b>' + INFO[k].name + '</b><small>2–4 Spieler · 🌐</small></div>') + '</button>').join('') +
    SOLI.map(o => '<button class="gtile" data-soli="' + o.g + '" role="listitem">' + tileArt(o, '<div class="tx"><b>' + o.name + '</b><small>Solitär · 1 Spieler</small></div>') + '</button>').join('');
  $('gameList').innerHTML = h;
  const sel = $('gameList').querySelector('[data-game="' + S.game + '"]') || $('gameList').firstElementChild; heroFor(sel);
}
function heroFor(b) {
  if (!b) return; $('gameList').querySelectorAll('.gtile.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
  const g = b.dataset.game, o = g ? INFO[g] : SOLI.find(x => x.g === b.dataset.soli);
  const tags = g ? ['🤖 Computer', '👥 Ein Gerät', '🌐 Online', '📺 TV + Handys'] : ['🧩 Solitär', '↶ Rückgängig', '💡 Tipps'];
  $('hero').innerHTML = '<div class="tags">' + tags.map(t => '<span>' + t + '</span>').join('') + '</div><h1>' + o.icon + ' ' + o.name + '</h1><p>' + o.desc + '</p>';
}
function refreshFigButtons() {
  document.querySelectorAll('.figb[data-fig="me"]').forEach(b => { b.innerHTML = figImg(S.myFig) + FIGS[S.myFig].name; });
  $('prof').innerHTML = figImg(S.myFig) + '<span>' + esc(store.get('name') || FIGS[S.myFig].name) + '</span>';
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
  $('suArt').innerHTML = '<div class="gtile sel">' + tileArt(I, '<div class="tx"><b>' + I.name + '</b><small>2–4 Spieler</small></div>') + '</div>';
  $('suOpts').innerHTML = I.opts.map(o => '<div class="seg" data-opt="' + o.k + '"><span>' + o.label + '</span>' + o.v.map(([v, t]) => '<button data-v="' + v + '">' + t + '</button>').join('') + '</div>').join('');
  syncSetup(); showScr('sSetup');
}
function syncSetup() {
  document.querySelectorAll('.seg[data-opt]').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S.opt[s.dataset.opt]) === b.dataset.v)));
  const m = S.opt.mode; $('suSolo').classList.toggle('hid', m !== 'solo'); $('suLocal').classList.toggle('hid', m !== 'local'); $('suOnline').classList.toggle('hid', m !== 'online'); $('suTv').classList.toggle('hid', m !== 'tv');
  $('suGo').style.display = m === 'online' || m === 'tv' ? 'none' : '';
  refreshFigButtons(); syncSet();
}

/* ---------- Schnellstart und Turnier ---------- */
const pick = a => a[(Math.random() * a.length) | 0];
function quickStart() { S.tour = null; S.game = pick(TABLE_GAMES); S.opt.mode = 'solo'; startSolo(); }
function startTour() {
  const me = $('tourName').value.trim().slice(0, 12) || 'Du'; saveName(me === 'Du' ? '' : me);
  const games = TABLE_GAMES.slice(); KR.shuffle(games);
  const cf = pickCpuFigs([S.myFig], S.opt.opp), pl = [{ name: me, fig: S.myFig }].concat(cf.map(f => ({ name: FIGS[f].name, fig: f, bot: true })));
  S.tour = { games: games.slice(0, 3), idx: 0, pts: pl.map(() => 0), res: [], pl, counted: false };
  S.game = S.tour.games[0]; begin('solo', pl);
}
function tourTable() {
  const T2 = S.tour, done = T2.res.length >= T2.games.length, best = Math.max(...T2.pts), champ = T2.pts.indexOf(best);
  $('ttTitle').textContent = done ? (champ === 0 ? '🏆 Turniersieg!' : '🏆 ' + T2.pl[champ].name + ' gewinnt das Turnier') : '🏆 Turnier · Spiel ' + T2.res.length + '/' + T2.games.length;
  $('ttSub').innerHTML = T2.games.map((g, i) => (i < T2.res.length ? '✔ ' : i === T2.res.length ? '▶ ' : '· ') + INFO[g].icon + ' ' + INFO[g].name).join(' &nbsp; ');
  $('ttTab').innerHTML = '<tr><th>Spieler</th><th>Siege</th><th>Punkte</th></tr>' + T2.pl.map((p, i) => ({ p, i })).sort((a, b) => T2.pts[b.i] - T2.pts[a.i]).map(({ p, i }) => '<tr><td>' + figImg(p.fig) + esc(p.name) + '</td><td>' + T2.res.filter(w => w === i).length + '</td><td><b>' + T2.pts[i] + '</b></td></tr>').join('');
  $('ttGo').textContent = done ? '🏆 Neues Turnier' : '▶ Weiter: ' + INFO[T2.games[T2.res.length]].name;
  if (done && champ === 0) sfx.win();
  showScr('sTourTab');
}
function tourNext() {
  const T2 = S.tour; if (!T2) return;
  if (T2.res.length >= T2.games.length) { S.tour = null; showScr('sTour'); return; }
  T2.idx = T2.res.length; T2.counted = false; S.game = T2.games[T2.idx]; begin('solo', T2.pl);
}

/* ---------- Einstellungen, Knopf-Symbole ---------- */
const NORM = () => window.EasyGamesPadNormal, PADX = () => window.EasyGamesPad;
const KEYN = { a: 'Enter', b: 'Esc', x: 'X', y: 'Y', rt: 'R', lb: 'Q', rb: 'E', start: 'P', select: 'H', dpad: '←↑↓→' };
const ACT_KEYS = ['x', 'y', 'rt'];
const isPad = () => document.documentElement.classList.contains('eg-pad');
function glyph(k) { if (isPad() && PADX() && PADX().glyph) { try { return PADX().glyph(k); } catch (e) { } } return KEYN[k] || k; }
// Symbol-Farbe nach Lage des Knopfs (wie gamepad.js): bestätigen unten, zurück rechts, Aktion 1 links, Aktion 2 oben
const glC = k => ({ a: 'ga', b: 'gb', x: 'gx', y: 'gy' }[k] || 'gs');
const glH = k => k ? '<i class="gl ' + glC(k) + '" data-gl="' + k + '">' + esc(glyph(k)) + '</i>' : '';
function refreshGlyphs() {
  const h = document.documentElement, pad = isPad(), kind = pad && NORM() && NORM().kind ? NORM().kind() : '';
  h.classList.toggle('keys', !pad); ['ps', 'switch', 'xbox'].forEach(k => h.classList.toggle('pad-' + k, kind === k));
  document.querySelectorAll('[data-gl]').forEach(e => { e.textContent = glyph(e.dataset.gl); });
  $('padi').classList.toggle('on', pad);
  prompts();
}
function setKb(on) { const h = document.documentElement; if (h.classList.contains('kb') === on) return; h.classList.toggle('kb', on); if (!on) setPf(null); else menuFocus(); refreshGlyphs(); need(); }
function keyTable() {
  const rows = [['Karte / Feld wählen', 'dpad', '←↑↓→'], ['Bestätigen, Karte legen', 'a', 'Enter'], ['Zurück, Auswahl aufheben', 'b', 'Esc'], ['Aktion 1 (z. B. Ziehen)', 'x', 'X oder 1'], ['Aktion 2 (z. B. Behalten)', 'y', 'Y oder 2'], ['Aktion 3', 'rt', 'R oder 3'], ['Vorige / nächste Handkarte', 'lb', 'Q / E'], ['Pause', 'start', 'P'], ['Anleitung', 'select', 'H']];
  const st = { ps: { a: '✕', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', rt: 'R2', start: 'Options', select: 'Create' }, sw: { a: 'A', b: 'B', x: 'Y', y: 'X', lb: 'L', rb: 'R', rt: 'ZR', start: '+', select: '−' } };
  const cell = (m, k) => k === 'dpad' ? '✚' : k === 'lb' ? m.lb + ' / ' + m.rb : m[k];
  $('keyTab').innerHTML = '<tr><th>Aktion</th><th>PlayStation</th><th>Switch</th><th>Tastatur</th></tr>' + rows.map(([t, k, kb]) => '<tr><td>' + t + '</td><td>' + cell(st.ps, k) + '</td><td>' + cell(st.sw, k) + '</td><td>' + kb + '</td></tr>').join('');
}
function syncSet() {
  const val = { snd: S.snd ? '1' : '0', fx: String(S.opt.fx), pad: NORM() && NORM().style ? NORM().style() : 'auto', conf: NORM() && NORM().confirm ? NORM().confirm() : 'auto' };
  document.querySelectorAll('.seg[data-set]').forEach(sg => sg.querySelectorAll('button').forEach(b => b.classList.toggle('on', val[sg.dataset.set] === b.dataset.v)));
}
function setOpt(k, v) {
  if (k === 'snd') { S.snd = v === '1'; store.set('snd', v); $('bSnd').textContent = S.snd ? '🔊' : '🔇'; }
  else if (k === 'fx') { S.opt.fx = +v; store.set('opt', JSON.stringify(S.opt)); if (renderer) { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.opt.fx === 2 ? 2 : 1.25)); resize(); } }
  else if (k === 'pad' && NORM() && NORM().style) NORM().style(v);
  else if (k === 'conf' && NORM() && NORM().confirm) NORM().confirm(v);
  syncSet(); refreshGlyphs();
}
function openSet() { S.setBack = S.scr; keyTable(); syncSet(); showScr('sSet'); }

/* ---------- Fokus-Navigation (Tastatur, Controller) wie an der Konsole ---------- */
let pfEl = null;
function setPf(el) {
  if (pfEl === el) return; if (pfEl) pfEl.classList.remove('pf'); pfEl = el;
  if (!el) return; el.classList.add('pf');
  try { el.focus({ preventScroll: true }); } catch (e) { }
  try { el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); }
  if (el.classList.contains('gtile') && el.closest('#gameList')) heroFor(el);
}
const visible = e => !!(e.offsetParent || e.getClientRects().length) && !e.disabled && getComputedStyle(e).visibility !== 'hidden';
function focusables() { const sc = S.scr && $(S.scr); if (!sc) return []; return Array.from(sc.querySelectorAll('button, input')).filter(visible); }
function menuFocus() {
  if (!document.documentElement.classList.contains('kb') || !S.scr) return;
  const L = focusables(); if (!L.length) return;
  if (pfEl && L.includes(pfEl)) return;
  const sc = $(S.scr);
  const first = (S.scr === 'sMain' && $('gameList').querySelector('.gtile.sel')) || sc.querySelector('.figgrid button.on') || L.find(b => b.classList.contains('btn') && !b.classList.contains('alt') && b.tagName === 'BUTTON') || L[0];
  setPf(first);
}
function spatial(list, from, dx, dy, pos) {
  let best = null, bs = 1e9;
  for (const e of list) {
    if (e === from.el) continue;
    const p = pos(e), vx = p.x - from.x, vy = p.y - from.y, along = vx * dx + vy * dy;
    if (along <= 4) continue;
    const across = Math.abs(vx * dy - vy * dx), sc = along + across * 2.2;
    if (sc < bs) { bs = sc; best = e; }
  }
  return best;
}
const rc = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
function menuMove(dx, dy) {
  const L = focusables(); if (!L.length) return;
  if (!pfEl || !L.includes(pfEl)) { menuFocus(); if (!pfEl) setPf(L[0]); return; }
  const c = rc(pfEl), n = spatial(L, { el: pfEl, x: c.x, y: c.y }, dx, dy, rc);
  if (n) { setPf(n); audio(); beep(700, .03, 'sine', .03); }
}
function clickEl(el) { if (!el) return; if (el.tagName === 'INPUT') { const L = focusables(), i = L.indexOf(el); if (L[i + 1]) setPf(L[i + 1]); return; } el.click(); setTimeout(() => { if (S.scr) menuFocus(); }, 0); }
function goBack() {
  if (!S.scr) return false; const sc = $(S.scr), b = Array.from(sc.querySelectorAll('[data-back]')).find(visible);
  if (b) { b.click(); return true; }
  return false;
}
function prompts() {
  const P = $('prompts'); if (!P) return;
  let L = [];
  if (S.scr === 'sMain') L = [['a', 'Auswählen'], ['lb', 'Spiele blättern'], ['select', 'Anleitung'], ['start', 'Einstellungen']];
  else if (S.scr) L = [['a', 'Bestätigen'], ['b', 'Zurück']];
  P.innerHTML = L.map(([k, t]) => '<span>' + glH(k) + (k === 'lb' ? glH('rb') : '') + t + '</span>').join('');
}

/* ---------- Spiel: Auswahlrahmen über Karten und Feldern ---------- */
const curShown = () => document.documentElement.classList.contains('kb') && !S.scr && S.V && S.cur && slots[S.cur] && curOk(S.cur);
function curOk(k) { const s = slots[k]; if (!s || !s.hit.visible) return false; if ('hgc'.includes(k[0]) && s.card) return s.hasCard; return true; }
function curKeys() { return Object.keys(slots).filter(curOk); }
function scrPos(k) { const s = slots[k], v = new T.Vector3(s.tx, (s.card ? s.card.position.y : 0) * s.g.scale.x, s.g.position.z).project(camera); return { x: v.x * 1000, y: -v.y * 1000 }; }
function curDefault() {
  const ks = curKeys(); if (!ks.length) return null;
  return ks.find(k => slots[k].hl === 1 && k[0] !== 'h') || ks.find(k => slots[k].hl && k[0] === 'h') || ks.find(k => slots[k].hl) || ks.find(k => k[0] === 'h') || ks[0];
}
function curFix() {
  if (!S.V) return;
  const sig = JSON.stringify(S.sel) + S.multi.length;
  if (S.selSig !== sig) { S.selSig = sig; if (S.sel || S.multi.length) { const t = curKeys().find(k => slots[k].hl === 1 && k[0] !== 'h' && !(S.multi.length > 1)); if (t && (S.sel || S.V.game !== 'phase')) S.cur = t; } }
  if (!S.cur || !curOk(S.cur)) S.cur = curDefault();
}
function curMove(dx, dy) {
  curFix(); if (!S.cur) return;
  const ks = curKeys(), p = scrPos(S.cur), n = spatial(ks, { el: S.cur, x: p.x, y: p.y }, dx, dy, scrPos);
  if (n) { S.cur = n; beep(620, .025, 'sine', .03); need(); }
}
function curHand(d) {
  const hs = curKeys().filter(k => k[0] === 'h').sort((a, b) => scrPos(a).y - scrPos(b).y || scrPos(a).x - scrPos(b).x); if (!hs.length) return;
  const i = hs.indexOf(S.cur); S.cur = hs[i < 0 ? 0 : (i + d + hs.length) % hs.length]; need();
}

/* ---------- Tastatur und Controller (gamepad.js macht aus dem Controller Tasten) ---------- */
function onKey(e) {
  const k = e.key, tg = e.target, typing = tg && tg.tagName === 'INPUT';
  const nav = /^(Arrow|Enter|Escape|Backspace|Tab)/.test(k) || (!typing && /^[xyqerphXYQERPH123 ]$/.test(k));
  if (nav) setKb(true);
  const ARR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
  if (S.scr) {
    if (ARR) { if (typing && ARR[1] === 0 && tg.value) return; e.preventDefault(); menuMove(ARR[0], ARR[1]); return; }
    if (k === 'Enter') { e.preventDefault(); clickEl(pfEl && visible(pfEl) ? pfEl : focusables()[0]); return; }
    if (k === 'Escape' || (k === 'Backspace' && !typing)) { e.preventDefault(); if (typing) { tg.blur(); return; } goBack(); return; }
    if (typing) return;
    const kl = k.toLowerCase();
    if (S.scr === 'sMain') {
      if (kl === 'q' || kl === 'e') { e.preventDefault(); const L = Array.from($('gameList').children), i = L.indexOf(pfEl && pfEl.closest('.gtile') ? pfEl : $('gameList').querySelector('.sel')); setPf(L[Math.max(0, Math.min(L.length - 1, (i < 0 ? 0 : i) + (kl === 'q' ? -1 : 1)))]); return; }
      if (kl === 'h') { e.preventDefault(); $('qHelp').click(); return; }
      if (kl === 'p') { e.preventDefault(); openSet(); return; }
    }
    return;
  }
  if (typing || !S.V) return;
  const kl = k.toLowerCase();
  if (ARR) { e.preventDefault(); curMove(ARR[0], ARR[1]); return; }
  if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!document.documentElement.classList.contains('kb')) return; curFix(); if (S.cur) tap(S.cur); return; }
  if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); if (S.sel || S.multi.length) { S.sel = null; S.multi = []; refreshSel(); } else $('bMenu').click(); return; }
  const ai = { x: 0, '1': 0, y: 1, '2': 1, r: 2, '3': 2 }[kl];
  if (ai !== undefined) { e.preventDefault(); const b = $('acts').querySelector('[data-act="' + ai + '"]'); if (b && !b.disabled) b.click(); return; }
  if (kl === 'q' || kl === 'e') { e.preventDefault(); curHand(kl === 'q' ? -1 : 1); return; }
  if (kl === 'p') { e.preventDefault(); $('bMenu').click(); return; }
  if (kl === 'h') { e.preventDefault(); $('bHelp').click(); return; }
}

function initUI() {
  renderGameList();
  document.addEventListener('keydown', onKey);
  addEventListener('pointerdown', e => { if (e.isTrusted && e.pointerType !== '') setKb(false); }, true);
  addEventListener('easygames:pad', () => { refreshGlyphs(); if (isPad()) setKb(true); });
  addEventListener('gamepadconnected', () => setTimeout(refreshGlyphs, 50));
  $('gameList').addEventListener('pointerover', e => { const b = e.target.closest('.gtile'); if (b && e.pointerType === 'mouse') heroFor(b); });
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; audio();
    if (b.dataset.go) { $('onErr').textContent = ''; showScr(b.dataset.go); return; }
    if (b.dataset.game) { if (b.closest('#gameList') && !b.classList.contains('sel') && e.isTrusted && e.pointerType === 'touch') heroFor(b); openSetup(b.dataset.game); return; }
    if (b.dataset.soli) { location.href = 'solitaer/?g=' + b.dataset.soli; return; }
    if (b.dataset.fig !== undefined) { openFig(b.dataset.fig === 'me' ? 'me' : +b.dataset.fig); return; }
    if (b.dataset.pick !== undefined) {
      const f = +b.dataset.pick; if (S.figFor === 'me') { S.myFig = f; store.set('fig', String(f)); if (S.attract) { figKey = ''; attract(); } } else S.locFig[S.figFor] = f;
      refreshFigButtons(); showScr(S.figBack || 'sSetup'); return;
    }
    if (b.dataset.rt) { S.rulesGame = b.dataset.rt; renderRules(); return; }
    if (b.dataset.act !== undefined) { const fn = S.actFns && S.actFns[+b.dataset.act]; if (fn && S.V && mineNow(S.V) && !S.pend) fn(); return; }
    const sset = b.closest('.seg[data-set]'); if (sset && b.dataset.v !== undefined) { setOpt(sset.dataset.set, b.dataset.v); return; }
    const seg = b.closest('.seg[data-opt]');
    if (seg && b.dataset.v !== undefined) {
      for (let i = 0; i < 4; i++) { const inp = $('ln' + i); if (inp) S.locName[i] = inp.value.trim(); }
      const v = b.dataset.v; S.opt[seg.dataset.opt] = isNaN(+v) ? v : +v;
      if (seg.dataset.opt === 'loc') { const n = S.opt.loc; for (let i = 0; i < n; i++) if (S.locFig.slice(0, i).includes(S.locFig[i])) S.locFig[i] = FIGS.findIndex((_, f) => !S.locFig.slice(0, i).includes(f)); }
      store.set('opt', JSON.stringify(S.opt)); syncSetup();
    }
  });
  $('colBtns').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || S.colPick < 0) return; const i = S.colPick; S.colPick = -1; hideOv(); act({ t: 'play', i, col: +b.dataset.col }); });
  $('colCancel').onclick = () => { S.colPick = -1; hideOv(); };
  $('suGo').onclick = () => { S.tour = null; if (S.opt.mode === 'solo') startSolo(); else startLocal(); };
  $('suRules').onclick = () => showRules(S.game, false);
  $('qQuick').onclick = quickStart; $('qTour').onclick = () => { $('tourName').value = store.get('name') || ''; syncSetup(); showScr('sTour'); };
  $('tourGo').onclick = startTour; $('ttGo').onclick = tourNext; $('ttMenu').onclick = toMenu;
  $('qSet').onclick = openSet; $('pSet').onclick = openSet; $('setBack').onclick = () => { const b = S.setBack; S.setBack = null; if (b && b !== 'sSet') showScr(b); else hideOv(); };
  $('qHelp').onclick = () => showRules(S.game, false);
  $('goHost').onclick = () => goHost(false); $('goTv').onclick = () => goHost(true); $('goJoin').onclick = () => goJoin(); $('goJoinScr').onclick = () => { $('onErr').textContent = ''; showScr('sJoin'); };
  $('joinCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
  $('figBack').onclick = () => showScr(S.figBack || 'sSetup');
  $('rulesBack').onclick = () => { const b = S.rulesBack; S.rulesBack = null; if (b && b !== 'sRules') showScr(b); else if (S.hide && S.mode === 'local') showScr('sPass'); else hideOv(); };
  $('bHelp').onclick = () => { if (S.scr === 'sRules') return; showRules(S.V ? S.V.game : S.game, false); };
  $('bMenu').onclick = () => { if (S.mode === 'host-lobby') return; showScr(S.V && S.V.winner < 0 ? 'sPause' : S.V ? 'sEnd' : 'sMain'); };
  $('pResume').onclick = () => { if (S.hide && S.mode === 'local') showScr('sPass'); else if (S.V && S.V.wait) { S.roundSeen = 0; roundScreen(S.V); hideOv(); } else hideOv(); };
  $('pRules').onclick = () => showRules(S.V ? S.V.game : S.game, false);
  $('pQuit').onclick = toMenu; $('endMenu').onclick = toMenu; $('endAgain').onclick = restart;
  $('rdGo').onclick = () => { hideOv(); if (S.mode === 'guest') { if (S.tvGuest) S.net.send({ t: 'next' }); } else { S.pend = false; doApply({ t: 'next' }); } };
  $('passGo').onclick = () => { S.hide = false; hideOv(); render(KRG[S.game].mkView(S.G, S.G.turn), false); sfx.my(); };
  $('bSnd').onclick = () => { setOpt('snd', S.snd ? '0' : '1'); audio(); };
  $('lobStart').onclick = () => { hideOv(); startHostGame(); };
  $('lobLeave').onclick = toMenu;
  try { const o = JSON.parse(store.get('opt') || 'null'); if (o) ['opp', 'loc', 'stock', 'len', 'mode', 'rounds', 'fx'].forEach(k => { if (o[k] !== undefined) S.opt[k] = o[k]; }); } catch (e) { }
  if (store.get('snd') === '0') { S.snd = false; $('bSnd').textContent = '🔇'; }
  const f = +store.get('fig'); if (FIGS[f]) S.myFig = f;
  if (!INFO[S.game]) S.game = 'stapel';
  let n = store.get('name'); if (n === null) { try { n = localStorage.getItem('stapelrausch-name') || ''; } catch (e) { n = ''; } } saveName(n || '');
  refreshFigButtons(); renderGameList(); refreshGlyphs();
  const clk = () => { const d = new Date(); $('clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }; clk(); setInterval(clk, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) need(); });
  const m = /[#&]join=([A-Za-z0-9]{4})/.exec(location.hash);
  if (m) { try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { } showScr('sJoin'); $('joinCode').value = m[1].toUpperCase(); }
}
window.addEventListener('load', () => {
  initUI();
  if (typeof THREE === 'undefined') { $('foot').textContent = '3D-Bibliothek konnte nicht geladen werden – bitte Internet prüfen und neu laden.'; return; }
  try { initScene(); } catch (e) { console.error(e); $('foot').textContent = 'WebGL wird auf diesem Gerät nicht unterstützt.'; }
});
