/* F01 Hörerpost: Nachrichten treffen laufend im Postfach ein und müssen richtig einsortiert werden
   (Lob, Frage, Themenwunsch, Kritik, Spam). Fehler kosten, ein überlaufendes Postfach oder Zeitablauf auch. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CATS = [
    { name: 'Lob', icon: '💛', col: '#ffb02e', key: '1' },
    { name: 'Frage', icon: '❔', col: '#6ef0ff', key: '2' },
    { name: 'Themenwunsch', icon: '💡', col: '#4be08a', key: '3' },
    { name: 'Kritik', icon: '🛠️', col: '#ff8a4d', key: '4' },
    { name: 'Spam', icon: '🗑️', col: '#ff4d6d', key: 'E' }
  ];
  const CFG = [
    { n: 14, every: 3.6, cap: 6, errs: 5, time: 75 },
    { n: 18, every: 2.8, cap: 5, errs: 4, time: 72 },
    { n: 22, every: 2.2, cap: 4, errs: 3, time: 68 }
  ];
  // [Kategorie-Index, Text]
  const MSGS = [
    [0, 'Eure Folge über Nachtzüge hat mir die ganze Heimfahrt versüßt. Danke!'],
    [0, 'Ich höre euch jeden Morgen beim Joggen – ihr seid meine beste Motivation!'],
    [0, 'Die Feelgood-Rubrik rettet mir jedes Mal den Montag. Weiter so!'],
    [0, 'Euer Lachen beim Campingchaos-Bericht war ansteckend. Großartige Folge!'],
    [0, 'Endlich ein Podcast, der Technik verständlich erklärt. Herzlichen Dank!'],
    [0, 'Die neue Tonqualität ist der Hammer – klingt, als säßet ihr neben mir.'],
    [0, 'Meine Oma und ich hören euch zusammen. Ihr bringt Generationen an einen Tisch!'],
    [0, 'Die Serious-15-Folge war ruhig, sachlich und sehr gut recherchiert. Respekt!'],
    [1, 'Welches Mikrofon benutzt ihr eigentlich für eure Außenaufnahmen?'],
    [1, 'Wann erscheint die nächste Folge – gibt es einen festen Wochentag?'],
    [1, 'Kann man euch irgendwann mal live im Studio besuchen?'],
    [1, 'Wie lange braucht ihr, um eine einzige Folge zu schneiden?'],
    [1, 'Wer von euch hat eigentlich die Titelmusik komponiert?'],
    [1, 'Gibt es die ganz alten Folgen noch irgendwo zum Nachhören?'],
    [1, 'Was war das für ein Geräusch in Minute zwölf? Ein Wasserkocher?'],
    [1, 'Wie seid ihr damals überhaupt auf euren Podcast-Namen gekommen?'],
    [2, 'Macht doch mal eine Folge über alte Spielkonsolen aus den Neunzigern!'],
    [2, 'Ich wünsche mir eine Sendung über Leuchttürme und ihre Wärter.'],
    [2, 'Wie wäre eine Folge über die schönsten Bahnstrecken durch die Berge?'],
    [2, 'Bitte unbedingt mal ein Special über Campingküche mit nur einem Topf!'],
    [2, 'Könntet ihr mal über die Geschichte der Kassette sprechen?'],
    [2, 'Mein Vorschlag: eine Folge nur mit guten Nachrichten aus der Forschung.'],
    [2, 'Redet doch mal über Hörspiele von früher – das wär was!'],
    [2, 'Ich hätte gern eine Folge darüber, wie Wettervorhersagen entstehen.'],
    [3, 'Die Hintergrundmusik war diesmal so laut, dass ich euch kaum verstanden habe.'],
    [3, 'Die letzte Folge war mir mit über zwei Stunden ehrlich gesagt zu lang.'],
    [3, 'Ihr habt euch ständig gegenseitig unterbrochen – das war anstrengend.'],
    [3, 'Das Mikrofon hat die ganze Folge über gerauscht. Bitte mal prüfen!'],
    [3, 'Schade, die Folge kam drei Tage später als angekündigt.'],
    [3, 'Die Werbepause mitten im spannendsten Teil hat mich echt geärgert.'],
    [3, 'Beim Bahnthema wart ihr diesmal ziemlich schlecht vorbereitet, finde ich.'],
    [3, 'Der neue Jingle ist leider viel zu schrill für meine Ohren.'],
    [4, 'GEWINNSPIEL!!! Klicke JETZT hier und sichere dir 1000 Gratis-Taler!!!'],
    [4, 'Sehr geehrter Gewinner, für Ihre Erbschaft brauchen wir nur Ihre Bankdaten.'],
    [4, 'Follower kaufen! 10.000 Hörer über Nacht! Garantiert echt!!!'],
    [4, 'Ihr Paket konnte nicht zugestellt werden. Bitte hier Passwort eingeben.'],
    [4, 'Wunderpille: In 3 Tagen 20 Kilo leichter – dieser Trick verblüfft alle!'],
    [4, 'Hallo Freund, ich bin Prinz eines fernen Landes und brauche dringend 500 Taler.'],
    [4, 'Sie haben ein Telefon gewonnen!!! Nur noch schnell die Versandgebühr zahlen.'],
    [4, 'Geheimtipp: Verdoppeln Sie Ihr Geld in nur einer Stunde!!! Sofort klicken!']
  ];
  const NAMES = ['Jana', 'Mehmet', 'Ute', 'Kofi', 'Lena', 'Piotr', 'Greta', 'Sami', 'Ines', 'Bernd', 'Aylin', 'Theo', 'Mira', 'Jonas'];
  const PLACES = ['Kleinweichen', 'Möwenkoog', 'Tannengrund', 'Lindenbrunn', 'Giebelfeld', 'Sonnenau'];
  const BIN_Y = 405, BIN_W = 176, BIN_H = 110, binX = i => 20 + i * 188;

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  function sort(st, cat) {
    if (!st.inbox.length) { MG.fx(st, 'beep'); return; }
    const m = st.inbox.shift(), ok = m.cat === cat;
    st.sorted++; st.flash = { bin: cat, ok, right: m.cat, t: 0.7 };
    if (ok) { st.right++; const quick = st.t - m.at < 4 ? 5 : 0; st.points += 10 + quick; MG.fx(st, 'pop'); }
    else { st.errs++; MG.fx(st, 'bad'); }
    st.cardT = 0;
    if (st.errs > st.cfg.errs) MG.finish(st, false);
    else if (st.sorted >= st.cfg.n) MG.finish(st, true);
  }
  function arrive(st) {
    const m = st.queue[st.sent++];
    st.inbox.push({ cat: m.cat, text: m.text, from: m.from, at: st.t });
    if (st.inbox.length === 1) st.cardT = 0;
    MG.fx(st, 'tick');
    if (st.inbox.length > st.cfg.cap) { st.overflow = true; MG.finish(st, false); }
  }

  MG.define({
    id: 'F01', group: 'feelgood', name: 'Hörerpost', icon: '✉️',
    short: 'Das Postfach quillt über – sortiere Lob, Fragen, Wünsche, Kritik und Spam.',
    rules: [
      'Hörernachrichten kommen laufend an. Sortiere die oberste Nachricht ins passende Fach.',
      'Fächer: Lob, Frage, Themenwunsch, Kritik und Spam.',
      'Falsch sortiert = Fehler. Zu viele Fehler, ein überlaufendes Postfach oder Zeitablauf = verloren.',
      'Gewonnen, wenn alle Nachrichten einsortiert sind.'
    ],
    goal: d => 'Sortiere alle ' + CFG[d].n + ' Hörer-Nachrichten ins richtige Fach – höchstens ' + CFG[d].errs + ' Fehler, das Postfach (max. ' + CFG[d].cap + ') darf nicht überlaufen, Zeit ' + CFG[d].time + ' s.',
    how: [
      'Lies die Nachricht auf dem großen Zettel.',
      'Tippe unten auf das passende Fach: 💛 Lob, ❔ Frage, 💡 Themenwunsch, 🛠️ Kritik oder 🗑️ Spam (Werbung, Abzocke).',
      'Dann kommt die nächste Nachricht. Links siehst du, wie voll das Postfach ist – nicht trödeln!',
      'Falsches Fach = Fehler (das richtige Fach leuchtet kurz grün).'
    ],
    tip: { key: 'Taste 1–4 oder E (Spam): In welches Fach gehört die Nachricht?', touch: 'Tippe unten das passende Fach an', y: 395 },
    controls: { key: '1–4 = Lob/Frage/Wunsch/Kritik, E oder Q = Spam, oder ←/→ + Leertaste', touch: 'Fach unten antippen', mouse: 'Fach unten anklicken', pad: 'Steuerkreuz + A, B = Spam' },
    touch: ['1', '2', '3', '4', 'b'],
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        inbox: [], sent: 0, sorted: 0, right: 0, errs: 0, points: 0, sel: 0, flash: null, cardT: 0, nextAt: c.every, overflow: false };
      st.queue = PT.shuffle(st, MSGS).slice(0, c.n).map(m => ({ cat: m[0], text: m[1], from: PT.pick(st, NAMES) + ' aus ' + PT.pick(st, PLACES) }));
      arrive(st); arrive(st);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (a.type === 'key' && a.down) {
        const k = a.key;
        if (k >= '1' && k <= '4') sort(st, +k - 1);
        else if (k === 'b') sort(st, 4);
        else if (k === 'left') { st.sel = (st.sel + 4) % 5; MG.fx(st, 'click'); }
        else if (k === 'right') { st.sel = (st.sel + 1) % 5; MG.fx(st, 'click'); }
        else if (k === 'a') sort(st, st.sel);
      } else if (a.type === 'pointer' && a.phase === 'down' && a.y >= BIN_Y && a.y <= BIN_Y + BIN_H) {
        for (let i = 0; i < 5; i++) if (a.x >= binX(i) && a.x <= binX(i) + BIN_W) { st.sel = i; sort(st, i); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.cardT += dt;
      if (st.flash && (st.flash.t -= dt) <= 0) st.flash = null;
      if (st.sent < st.queue.length && st.t >= st.nextAt) { st.nextAt += st.cfg.every; arrive(st); }
      if (st.status === 'playing' && st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const won = st.status === 'won', n = st.cfg.n, acc = st.right / n;
      const score = won ? 50 + Math.round(50 * (st.right / Math.max(1, st.sorted)) - st.errs * 4 + Math.max(0, (st.cfg.time - st.t) / 10)) : Math.round(45 * acc);
      const why = won ? '' : st.overflow ? ' – das Postfach ist übergelaufen' : st.errs > st.cfg.errs ? ' – zu viele Fehler' : ' – die Zeit war um';
      const why2 = won ? '' : st.overflow ? ' – das Postfach ist übergelaufen (zu langsam)' : st.errs > st.cfg.errs ? ' – zu viele Fehler (erlaubt ' + st.cfg.errs + ')' : ' – die Zeit war um';
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49), detail: st.right + ' von ' + n + ' Nachrichten richtig sortiert, ' + st.errs + ' Fehler' + (why2 || why) + '.' };
    },
    bot(st, goal) {
      if (!st.inbox.length || st.cardT < 0.4) return [];
      const c = st.inbox[0].cat, want = goal === 'win' ? c : (c + 1) % 5;
      return [{ type: 'key', key: want === 4 ? 'b' : String(want + 1), down: true }];
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Sortiert: ' + st.sorted + ' von ' + c.n + '   Fehler: ' + st.errs + ' von max. ' + c.errs, 20, 32);
      g.textAlign = 'right'; g.fillText('Zeit: ' + Math.max(0, Math.ceil(c.time - st.t)) + ' s   Punkte: ' + st.points, 900, 32);
      g.fillStyle = '#1d2342'; g.fillRect(20, 44, 920, 10);
      g.fillStyle = '#ffb02e'; g.fillRect(20, 44, 920 * Math.max(0, 1 - st.t / c.time), 10);
      // Postfach-Stapel links
      g.fillStyle = '#1a2040'; g.fillRect(20, 70, 150, 315);
      g.fillStyle = '#cfd6ff'; g.font = '600 18px system-ui'; g.textAlign = 'center';
      g.fillText('Postfach', 95, 95);
      for (let i = 0; i < c.cap; i++) {
        const y = 355 - i * 40, full = i < st.inbox.length;
        g.fillStyle = full ? (st.inbox.length >= c.cap ? '#ff4d6d' : '#ffb02e') : '#272e55'; g.fillRect(40, y, 110, 30);
        if (full) { g.strokeStyle = '#10142a'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, y); g.lineTo(95, y + 16); g.lineTo(150, y); g.stroke(); }
      }
      g.fillStyle = st.inbox.length >= c.cap ? '#ff4d6d' : '#cfd6ff'; g.fillText(st.inbox.length + ' / ' + c.cap, 95, 122);
      // aktuelle Nachricht
      const m = st.inbox[0], slide = Math.max(0, 1 - st.cardT * 6) * 60;
      g.fillStyle = '#f5ecd7'; g.fillRect(195 + slide, 72, 745, 300);
      g.fillStyle = '#ff4d6d'; g.fillRect(195 + slide, 72, 745, 8);
      if (m) {
        g.fillStyle = '#5a4a3a'; g.font = '600 20px system-ui'; g.textAlign = 'left';
        g.fillText('Von: ' + m.from, 225 + slide, 118);
        g.fillStyle = '#1b1b2a'; g.font = '600 28px system-ui';
        wrap(g, m.text, 680).slice(0, 5).forEach((l, i) => g.fillText(l, 225 + slide, 175 + i * 38));
        g.fillStyle = '#7a6a55'; g.font = '600 18px system-ui'; g.fillText('↓ In welches Fach gehört diese Nachricht?', 225 + slide, 360);
      } else {
        g.fillStyle = '#5a4a3a'; g.font = '600 26px system-ui'; g.textAlign = 'center';
        g.fillText('Gerade keine Post – kurz durchatmen …', 567, 230);
      }
      // Fächer
      CATS.forEach((cat, i) => {
        const x = binX(i), fl = st.flash;
        let bg = '#1d2342';
        if (fl && fl.bin === i) bg = fl.ok ? '#1f6b45' : '#7a2236';
        else if (fl && !fl.ok && fl.right === i) bg = '#2c5a44';
        g.fillStyle = bg; g.fillRect(x, BIN_Y, BIN_W, BIN_H);
        g.fillStyle = cat.col; g.fillRect(x, BIN_Y, BIN_W, 8);
        if (i === st.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(x + 2, BIN_Y + 2, BIN_W - 4, BIN_H - 4); }
        g.textAlign = 'center'; g.font = '26px system-ui'; g.fillStyle = '#ffffff'; g.fillText(cat.icon, x + BIN_W / 2, BIN_Y + 44);
        g.font = '700 20px system-ui'; g.fillStyle = cat.col; g.fillText(cat.name, x + BIN_W / 2, BIN_Y + 76);
        g.font = '500 18px system-ui'; g.fillStyle = '#8890b8'; g.fillText('[' + cat.key + ']', x + BIN_W / 2, BIN_Y + 100);
      });
      if (st.flash && !st.flash.ok) {
        g.fillStyle = '#ff4d6d'; g.font = '800 22px system-ui'; g.textAlign = 'center';
        g.fillText('Falsch – das war ' + CATS[st.flash.right].name + '!', 567, 400 - 12);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
