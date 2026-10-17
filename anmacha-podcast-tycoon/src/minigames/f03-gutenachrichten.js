/* F03 Gute-Nachrichten-Recherche: Mehrere (fiktive) Meldungen kursieren, nur eine ist echt. Hinweise zu Ort, Zeit,
   Wochentag und Faktenchecks schließen die Gerüchte aus – erst die Kombination ergibt die eindeutige Lösung.
   Jeder Fall wird aus dem Seed erzeugt und hat garantiert genau eine Lösung. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { cases: 4, k: 3, need: 3, time: 130 },
    { cases: 5, k: 4, need: 4, time: 125 },
    { cases: 6, k: 5, need: 5, time: 120 }
  ];
  const NEWS = ['Hund rettet Entenküken aus dem Gully', 'Schulklasse pflanzt 100 Bäume', 'Rentnerchor singt für müde Pendler',
    'Verlorener Ehering im Sand wiedergefunden', 'Bäckerei verschenkt übrig gebliebenes Brot', 'Nachbarn reparieren gemeinsam den Spielplatz',
    'Zugbegleiterin bringt vergessenen Teddy zurück', 'Igelstation päppelt 30 Igel auf', 'Jugendliche bauen einen Bücherschrank',
    'Fremde helfen beim Umzug im Regen', 'Taucherin holt Müll aus dem Wasser', 'Kind gibt gefundene Geldbörse ab',
    'Straßenmusiker sammelt für das Tierheim', 'Feuerwehr baut Nistkästen für Schwalben', 'Oma strickt Mützen für die ganze Kita',
    'Wanderverein räumt umgestürzte Bäume weg'];
  const PLACES = [['Hafen Möwenkoog', 0], ['Seeufer Glitzersee', 0], ['Bahnhof Kleinweichen', 1], ['Hauptbahnhof Großkreuzung', 1],
    ['Marktplatz Lindenbrunn', 2], ['Altstadt Giebelfeld', 2], ['Campingplatz Tannengrund', 3], ['Stadtpark Sonnenau', 3]];
  const KIND_CLUE = [
    'Tonaufnahme: Möwen kreischen, Wellen plätschern – es war am Wasser.',
    'Tonaufnahme: Im Hintergrund läuft eine Bahnsteigdurchsage – es war an einem Bahnhof.',
    'Foto: Kopfsteinpflaster und Fachwerkhäuser – es war mitten in einer Innenstadt.',
    'Foto: Nur Bäume, Wiese und Vogelgezwitscher – es war im Grünen.'];
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const TH = [10, 12, 15, 18];
  const FB = 2.8, ROW0 = 78, ROWH = 76, OKB = { x: 20, y: 470, w: 450, h: 54 };

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  const hm = c => (c.h < 10 ? '0' : '') + c.h + ':' + (c.m < 10 ? '0' : '') + c.m;

  // Alle für die echte Meldung T wahren Hinweise mit der Menge der dadurch ausgeschlossenen Meldungen
  function clueOptions(cs, T) {
    const t = cs[T], out = [], add = (text, f, kind) => {
      const el = []; cs.forEach((c, i) => { if (i !== T && f(c)) el.push(i); });
      if (el.length && el.length < cs.length - 1) out.push({ text, el, kind });
    };
    const kd = PLACES[t.p][1];
    add('📷 ' + KIND_CLUE[kd], c => PLACES[c.p][1] !== kd, 'ort');
    TH.forEach(th => {
      if (t.h < th) add('⏱️ Zeitstempel: Das erste Foto wurde vor ' + th + ' Uhr hochgeladen.', c => c.h >= th, 'zeit');
      else add('🗣️ Zeugin: „Es war irgendwann ab ' + th + ' Uhr, ich kam gerade vom Einkaufen.“', c => c.h < th, 'zeit');
    });
    const we = t.d >= 5;
    add(we ? '🗣️ Zeuge: „Das war am Wochenende, ich hatte frei.“' : '📝 Notiz: Die Schulen hatten geöffnet – es war ein Werktag (Mo–Fr).', c => (c.d >= 5) !== we, 'tag');
    cs.forEach(c => { if (c.p !== t.p) add('📝 Notiz: ' + PLACES[c.p][0] + ' war an diesem Tag wegen Bauarbeiten komplett gesperrt.', x => x.p === c.p, 'ort'); });
    cs.forEach(c => { if (c.d !== t.d) add('🗓️ Kalender: Am ' + DAYS[c.d] + ' war das Reporterteam im Urlaub – an diesem Tag gab es keine Aufnahmen.', x => x.d === c.d, 'tag'); });
    cs.forEach((c, i) => { if (i !== T) add('🔎 Faktencheck: „' + c.w + '“ ist eine uralte Meldung von vor zwei Jahren.', x => x === c, 'fake'); });
    return out;
  }
  function makeCase(st, k, used) {
    for (let tries = 0; ; tries++) {
      const whats = PT.shuffle(st, NEWS.filter(w => used.indexOf(w) < 0).length >= k ? NEWS.filter(w => used.indexOf(w) < 0) : NEWS).slice(0, k);
      const cs = whats.map(w => ({ w, p: PT.randInt(st, 0, PLACES.length - 1), d: PT.randInt(st, 0, 6), h: PT.randInt(st, 7, 21), m: PT.pick(st, [0, 15, 30, 45]) }));
      const T = PT.randInt(st, 0, k - 1);
      let opts = clueOptions(cs, T);
      if (tries < 40) opts = opts.filter(o => o.kind !== 'fake' || PT.rand(st) < 0.3);
      const covered = {}, chosen = []; let n = 0;
      while (n < k - 1) {
        const useful = opts.filter(o => chosen.indexOf(o) < 0 && o.el.some(i => !covered[i]) && !(o.kind === 'fake' && chosen.some(c => c.kind === 'fake') && tries < 40));
        if (!useful.length) break;
        const o = PT.pick(st, useful); chosen.push(o);
        o.el.forEach(i => { if (!covered[i]) { covered[i] = 1; n++; } });
      }
      if (n === k - 1 && chosen.length >= 2 && chosen.length <= 4) {
        return { cands: cs, T, clues: PT.shuffle(st, chosen.map(o => o.text)), struck: cs.map(() => false) };
      }
    }
  }
  function confirm(st) {
    if (st.phase !== 'play') return;
    const cs = st.cases[st.idx], ok = st.sel === cs.T;
    st.phase = 'fb'; st.fbT = FB; st.lastOk = ok;
    if (ok) { st.solved++; MG.fx(st, 'coin'); } else { st.failed++; MG.fx(st, 'bad'); }
    if (st.failed > st.cfg.cases - st.cfg.need) st.doom = true;
  }
  function next(st) {
    if (st.doom) return MG.finish(st, false);
    st.idx++;
    if (st.idx >= st.cases.length) return MG.finish(st, st.solved >= st.cfg.need);
    st.phase = 'play'; st.sel = 0; MG.fx(st, 'whoosh');
  }

  MG.define({
    id: 'F03', group: 'feelgood', name: 'Gute-Nachrichten-Recherche', icon: '📰',
    short: 'Welche schöne Meldung ist wirklich passiert? Kombiniere die Hinweise!',
    rules: [
      'Zu jedem Fall kursieren mehrere gute Nachrichten – nur eine ist echt.',
      'Alle Hinweise rechts stimmen. Kombiniere Ort, Uhrzeit, Wochentag und Faktenchecks.',
      'Streiche ausgeschlossene Gerüchte (✗) und melde die echte Nachricht.',
      'Falsch gemeldet = Fall verloren. Gewonnen, wenn genug Fälle vor Ablauf der Zeit gelöst sind.'
    ],
    goal: d => 'Finde in mindestens ' + CFG[d].need + ' von ' + CFG[d].cases + ' Fällen die eine echte Nachricht – Zeit ' + CFG[d].time + ' s.',
    how: [
      'Links stehen mehrere schöne Meldungen mit Ort, Tag und Uhrzeit – nur eine ist wirklich passiert.',
      'Rechts stehen Hinweise. Alle Hinweise stimmen! Prüfe jede Meldung dagegen.',
      'Passt eine Meldung nicht zu einem Hinweis: mit ✗ durchstreichen (nur als Merkhilfe).',
      'Die übrige Meldung antippen (gelber Rahmen) und „📣 Als echt melden“. Falsch gemeldet = Fall verloren.'
    ],
    tip: { key: '↑/↓ wählen · E streicht durch · Leertaste meldet', touch: 'Vergleiche mit den Hinweisen rechts, streiche mit ✗, dann melden', y: 300 },
    controls: { key: '↑/↓ wählen, E/Q streichen, Leertaste melden', touch: 'Meldung antippen, ✗ zum Streichen, „📣 Als echt melden“ tippen', mouse: 'Meldung anklicken, ✗ zum Streichen, „📣 Als echt melden“ klicken', pad: 'Steuerkreuz, B streichen, A melden' },
    touch: ['up', 'down', 'a', 'b'],
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        idx: 0, sel: 0, phase: 'play', fbT: 0, solved: 0, failed: 0, doom: false, lastOk: false, cases: [] };
      const used = [];
      for (let i = 0; i < c.cases; i++) { const cs = makeCase(st, c.k, used); st.cases.push(cs); cs.cands.forEach(x => used.push(x.w)); }
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const press = a.type === 'key' && a.down, tap = a.type === 'pointer' && a.phase === 'down';
      if (st.phase === 'fb') { if (st.fbT < FB - 0.5 && ((press && a.key === 'a') || tap)) next(st); return; }
      const cs = st.cases[st.idx], k = cs.cands.length;
      if (press) {
        if (a.key === 'up') { st.sel = (st.sel + k - 1) % k; MG.fx(st, 'click'); }
        else if (a.key === 'down') { st.sel = (st.sel + 1) % k; MG.fx(st, 'click'); }
        else if (a.key === 'b') { cs.struck[st.sel] = !cs.struck[st.sel]; MG.fx(st, 'pop'); }
        else if (a.key === 'a') confirm(st);
        else if (a.key >= '1' && a.key <= '4' && +a.key <= k) { st.sel = +a.key - 1; MG.fx(st, 'click'); }
      } else if (tap) {
        if (a.x >= OKB.x && a.x <= OKB.x + OKB.w && a.y >= OKB.y && a.y <= OKB.y + OKB.h) return confirm(st);
        const i = Math.floor((a.y - ROW0) / ROWH);
        if (a.x >= 20 && a.x <= 470 && i >= 0 && i < k && a.y - ROW0 - i * ROWH <= ROWH - 6) {
          st.sel = i;
          if (a.x >= 418) { cs.struck[i] = !cs.struck[i]; MG.fx(st, 'pop'); } else MG.fx(st, 'click');
        }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.phase === 'fb' && (st.fbT -= dt) <= 0) next(st);
      if (st.status === 'playing' && st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const won = st.status === 'won', c = st.cfg;
      const score = won ? 50 + Math.round(40 * (st.solved - c.need + 1) / (c.cases - c.need + 1) + 10 * Math.max(0, 1 - st.t / c.time)) : Math.round(45 * st.solved / c.cases);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49),
        detail: won ? st.solved + ' von ' + c.cases + ' Fällen gelöst (nötig ' + c.need + ').' : 'Nur ' + st.solved + ' von ' + c.cases + ' Fällen gelöst – nötig waren ' + c.need + (st.t >= c.time ? ' (die Zeit war um).' : ' (zu viele falsche Meldungen).') };
    },
    bot(st, goal) {
      if (st.phase === 'fb') return st.fbT < 2 ? [{ type: 'key', key: 'a', down: true }] : [];
      const cs = st.cases[st.idx], k = cs.cands.length;
      const pick = goal === 'win' ? cs.T : (cs.T + 1) % k, y = ROW0 + pick * ROWH + 30;
      return [{ type: 'pointer', phase: 'down', x: 200, y }, { type: 'pointer', phase: 'down', x: OKB.x + 50, y: OKB.y + 20 }];
    },
    draw2d(g, st) {
      const c = st.cfg, cs = st.cases[Math.min(st.idx, st.cases.length - 1)];
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Fall ' + Math.min(st.idx + 1, c.cases) + ' von ' + c.cases + '   Gelöst: ' + st.solved + ' von nötig ' + c.need, 20, 30);
      g.textAlign = 'right'; g.fillText('Zeit: ' + Math.max(0, Math.ceil(c.time - st.t)) + ' s', 900, 30);
      g.fillStyle = '#1d2342'; g.fillRect(20, 42, 920, 10);
      g.fillStyle = '#ffb02e'; g.fillRect(20, 42, 920 * Math.max(0, 1 - st.t / c.time), 10);
      // Meldungen
      cs.cands.forEach((m, i) => {
        const y = ROW0 + i * ROWH, fb = st.phase === 'fb';
        let bg = i === st.sel ? '#2a3366' : '#1d2342';
        if (fb && i === cs.T) bg = '#1f6b45'; else if (fb && i === st.sel) bg = '#7a2236';
        g.fillStyle = bg; g.fillRect(20, y, 450, ROWH - 6);
        if (i === st.sel && !fb) { g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.strokeRect(21, y + 1, 448, ROWH - 8); }
        g.globalAlpha = cs.struck[i] ? 0.4 : 1;
        g.fillStyle = '#ffffff'; g.font = '700 18px system-ui'; g.textAlign = 'left';
        wrap(g, m.w, 380).slice(0, 2).forEach((l, j) => g.fillText(l, 32, y + 22 + j * 20));
        g.fillStyle = '#6ef0ff'; g.font = '500 18px system-ui';
        g.fillText(PLACES[m.p][0] + ' · ' + DAYS[m.d].slice(0, 2) + ', ' + hm(m) + ' Uhr', 32, y + 64);
        g.globalAlpha = 1;
        if (cs.struck[i]) { g.strokeStyle = '#ff4d6d'; g.lineWidth = 3; g.beginPath(); g.moveTo(28, y + 36); g.lineTo(412, y + 36); g.stroke(); }
        g.fillStyle = cs.struck[i] ? '#ff4d6d' : '#3a4270'; g.fillRect(420, y + 14, 40, 40);
        g.fillStyle = '#ffffff'; g.font = '800 22px system-ui'; g.textAlign = 'center'; g.fillText('✗', 440, y + 42);
      });
      // Melden-Knopf / Ergebnis
      if (st.phase === 'fb') {
        g.fillStyle = st.lastOk ? '#4be08a' : '#ff4d6d'; g.font = '800 22px system-ui'; g.textAlign = 'center';
        g.fillText(st.lastOk ? '✓ Richtig recherchiert! (tippen = weiter)' : '✗ Ente! Echt war: ' + cs.cands[cs.T].w, 245, 504);
      } else {
        g.fillStyle = '#ffb02e'; g.fillRect(OKB.x, OKB.y, OKB.w, OKB.h);
        g.fillStyle = '#10142a'; g.font = '800 22px system-ui'; g.textAlign = 'center';
        g.fillText('📣 Gewählte als echt melden', OKB.x + OKB.w / 2, OKB.y + 35);
      }
      // Hinweise
      g.textAlign = 'left'; g.fillStyle = '#cfd6ff'; g.font = '700 20px system-ui'; g.fillText('🔎 Hinweise – alle stimmen:', 490, 74);
      let y = 86; g.font = '500 18px system-ui';
      cs.clues.forEach(s => {
        const L = wrap(g, s, 420).slice(0, 4), h = L.length * 22 + 14;
        g.fillStyle = '#f5ecd7'; g.fillRect(490, y, 450, h);
        g.fillStyle = '#1b1b2a'; L.forEach((l, j) => g.fillText(l, 502, y + 24 + j * 22));
        y += h + 8;
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
