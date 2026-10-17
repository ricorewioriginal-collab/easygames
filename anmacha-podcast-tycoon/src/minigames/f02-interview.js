/* F02 Interview-Rapport: Gespräch mit einem fiktiven Gast. Jeder Gast hat Lieblingsthemen, ein Reizthema, einen
   bevorzugten Gesprächsstil und je eine verborgene Vorliebe/Abneigung. Die Wirkung jeder Frage folgt festen Regeln
   (Thema, Stil, Wiederholung, Gesprächsverlauf, Vertrauen) – kein Zufall. Ziel: am Ende genug Rapport. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [
    { rounds: 6, opts: 3, start: 40, need: 65, think: 25 },
    { rounds: 7, opts: 4, start: 38, need: 70, think: 18 },
    { rounds: 8, opts: 4, start: 35, need: 78, think: 13 }
  ];
  const REACT = 2.8;
  const TOPICS = {
    technik: ['Technik', 'Welches Gerät hast du zuletzt aus Neugier aufgeschraubt?', 'Wie hat neue Technik deinen Arbeitsalltag verändert?'],
    bahn: ['Bahn & Reisen', 'Was war deine chaotischste Zugfahrt?', 'Wie sollte die Bahn der Zukunft aussehen?'],
    camping: ['Camping', 'Zelt oder Wohnmobil – und warum?', 'Was braucht man wirklich für eine Woche in der Natur?'],
    film: ['Film & Serien', 'Welche Serie hast du zuletzt in einer Nacht durchgeschaut?', 'Was macht für dich eine richtig gute Geschichte aus?'],
    musik: ['Musik', 'Welches Lied singst du heimlich unter der Dusche?', 'Welche Rolle spielt Musik in deiner Arbeit?'],
    radio: ['Radio & Podcast', 'Hast du früher Kassetten aus dem Radio aufgenommen?', 'Was unterscheidet einen guten Podcast von einem mittelmäßigen?'],
    essen: ['Essen', 'Was ist dein heimliches Lieblingsessen?', 'Kochst du lieber nach Rezept oder nach Gefühl?'],
    kindheit: ['Nostalgie', 'Was war dein Lieblingsspielzeug als Kind?', 'Welcher Moment aus deiner Jugend hat dich geprägt?'],
    wetter: ['Smalltalk', 'Und, wie findest du das Wetter heute so?', 'Wie bist du heute ins Studio gekommen?'],
    feelgood: ['Gute Nachrichten', 'Was hat dich diese Woche richtig glücklich gemacht?', 'Welche positive Entwicklung beobachtest du gerade?']
  };
  const TK = Object.keys(TOPICS);
  const GUESTS = [
    { name: 'Kalle Kabel', role: 'Technikfan', bio: 'Lötet in jeder freien Minute an alten Radios, erklärt gern genau und hasst belangloses Gerede übers Wetter.', likes: ['technik', 'radio'], dis: ['wetter'], style: 'sachlich' },
    { name: 'Mia Pointe', role: 'Comedian', bio: 'Steht jeden Abend auf der Bühne, lacht über alles, liebt Anekdoten aus der Kindheit und gutes Essen. Fachchinesisch langweilt sie.', likes: ['kindheit', 'essen'], dis: ['technik'], style: 'locker' },
    { name: 'Dr. Gleisa Weiche', role: 'Bahnexpertin', bio: 'Plant Fahrpläne für ganze Regionen und erklärt präzise, wie Stellwerke ticken. Zelten findet sie unbequem.', likes: ['bahn', 'technik'], dis: ['camping'], style: 'sachlich' },
    { name: 'Toni Hering', role: 'Camper', bio: 'Lebt halb im Wohnmobil, kocht auf einer Flamme, scherzt gern am Lagerfeuer und hat das Telefon meist aus.', likes: ['camping', 'essen'], dis: ['technik'], style: 'locker' },
    { name: 'Frieda Folge', role: 'Serienkritikerin', bio: 'Analysiert beruflich Serien, schwärmt von alten Kinderprogrammen und kann Smalltalk nicht ausstehen.', likes: ['film', 'kindheit'], dis: ['wetter'], style: 'sachlich' },
    { name: 'Bodo Bass', role: 'Synchronsprecher', bio: 'Leiht Filmhelden seine Stimme, albert gern herum, liebt Hörspiele und das Radio. Beim Essen ist er sehr eigen.', likes: ['film', 'radio'], dis: ['essen'], style: 'locker' },
    { name: 'DJ Welle', role: 'Radio-DJ', bio: 'Legt seit Jahren nachts locker-flockig im Radio auf. Zugfahrten hat er nach einem Ausfall-Marathon abgeschworen.', likes: ['musik', 'radio'], dis: ['bahn'], style: 'locker' },
    { name: 'Eva Event', role: 'Veranstalterin', bio: 'Organisiert Konzerte und Stadtfeste mit Plan und Zahlen, sammelt Erfolgsgeschichten und blickt ungern zurück.', likes: ['musik', 'feelgood'], dis: ['kindheit'], style: 'sachlich' },
    { name: 'Hanne Hörer', role: 'Hörervertretung', bio: 'Spricht herzlich für die Hörerschaft, liebt gute Nachrichten und das Radio. Technikdetails überfordern sie.', likes: ['feelgood', 'radio'], dis: ['technik'], style: 'locker' },
    { name: 'Gast X', role: 'Überraschungsgast', bio: 'Niemand wusste vorher, wer kommt. Vorlieben und Stil: unbekannt. Hör genau auf die Reaktionen!', likes: null, dis: null, style: null }
  ];
  const SPECIAL = {
    follow: 'Nachhaken: „Erzähl mal mehr darüber!“',
    personal: 'Persönlich: „Was treibt dich ganz privat eigentlich an?“',
    compliment: 'Kompliment: „Deine Arbeit begeistert unsere Hörer total!“',
    joke: 'Witz: „Warum ist das Mikro so beliebt? Es ist immer gut aufgelegt!“'
  };

  function wrap(g, s, w) {
    const out = []; let cur = '';
    String(s).split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (cur && g.measureText(t).width > w) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out;
  }
  const label = o => o.kind === 'topic' ? TOPICS[o.topic][0] + (o.style === 'locker' ? ' (locker): „' : ' (sachlich): „') + TOPICS[o.topic][o.style === 'locker' ? 1 : 2] + '“' : SPECIAL[o.kind];

  // Wirkung einer Option nach festen Beziehungsregeln: { d: Änderung, why: Reaktionsschlüssel }
  function effect(st, o) {
    const gu = st.guest;
    if (o.kind === 'topic') {
      let d = gu.likes.indexOf(o.topic) >= 0 ? 12 : gu.dis.indexOf(o.topic) >= 0 ? -14 : 2;
      let why = d > 0 ? (d > 5 ? 'love' : 'meh') : 'hate';
      d += o.style === gu.style ? 4 : -4;
      if (o.topic === st.lastTopic) { d -= 14; why = 'repeat'; }
      else if ((st.used[o.topic] || 0) >= 2) { d -= 6; why = 'repeat'; }
      return { d, why, style: o.style !== gu.style };
    }
    if (o.kind === 'follow') return st.lastGood && st.lastKind !== 'follow' ? { d: 10, why: 'followGood' } : { d: -6, why: 'followBad' };
    if (o.kind === 'personal') return st.rapport >= 60 ? { d: 10, why: 'personalGood' } : { d: -10, why: 'personalBad' };
    if (o.kind === 'compliment') return st.complimented ? { d: -5, why: 'complimentBad' } : { d: 6, why: 'complimentGood' };
    const good = gu.style === 'locker';
    return { d: good ? (st.joked ? 3 : 8) : (st.joked ? -9 : -7), why: good ? 'jokeGood' : 'jokeBad' };
  }
  const LINES = {
    love: ['„Oh, darüber könnte ich stundenlang reden!“', '„Endlich fragt mal jemand danach!“', '„Herrlich, mein Lieblingsthema!“'],
    meh: ['„Hm, ja … kann man so sagen.“', '„Na ja, ganz nett.“', '„Darüber habe ich ehrlich gesagt nie nachgedacht.“'],
    hate: ['„Ehrlich gesagt ist das so gar nicht mein Thema.“', '„Müssen wir darüber reden?“', '„Oh nein, bitte nicht das …“'],
    repeat: ['„Darüber haben wir doch gerade schon gesprochen …“'],
    followGood: ['„Gern! Also, das war nämlich so …“'], followBad: ['„Da gibt’s eigentlich nichts mehr zu erzählen.“'],
    personalGood: ['„Weißt du was? Dir erzähle ich das gern.“'], personalBad: ['„Puh, so gut kennen wir uns noch nicht.“'],
    complimentGood: ['„Oh, danke, das freut mich wirklich!“'], complimentBad: ['„Jetzt wird’s aber ein bisschen schleimig …“'],
    jokeGood: ['„Hahaha! Der war gut!“'], jokeBad: ['„… Aha. Sehr witzig.“'], silence: ['… peinliche Stille …']
  };

  function makeOptions(st) {
    const c = st.cfg, cands = [];
    PT.shuffle(st, TK).forEach(t => cands.push({ kind: 'topic', topic: t, style: PT.rand(st) < 0.5 ? 'locker' : 'sachlich' }));
    if (st.lastTopic) cands.push({ kind: 'follow' });
    cands.push({ kind: 'personal' }, { kind: 'compliment' }, { kind: 'joke' });
    const opts = PT.shuffle(st, cands).slice(0, c.opts);
    if (!opts.some(o => effect(st, o).d >= 8)) {
      const goods = st.guest.likes.map(t => ({ kind: 'topic', topic: t, style: st.guest.style })).concat([{ kind: 'follow' }])
        .filter(o => effect(st, o).d >= 8);
      const fresh = goods.filter(o => !opts.some(x => x.topic && x.topic === o.topic));
      const good = PT.pick(st, fresh.length ? fresh : goods);
      opts[PT.randInt(st, 0, opts.length - 1)] = good;
    }
    st.opts = opts; st.sel = 0; st.qt = c.think; st.phase = 'ask';
  }
  function choose(st, i) {
    if (st.phase !== 'ask') return;
    const o = i >= 0 ? st.opts[i] : null, e = o ? effect(st, o) : { d: -8, why: 'silence' };
    st.rapport = PT.clamp(st.rapport + e.d, 0, 100);
    if (o && o.kind === 'topic') { st.used[o.topic] = (st.used[o.topic] || 0) + 1; st.lastTopic = o.topic; }
    if (o && o.kind === 'compliment') st.complimented = true;
    if (o && o.kind === 'joke') st.joked = true;
    st.lastGood = e.d >= 8 && !!o && (o.kind === 'topic' || o.kind === 'follow');
    st.lastKind = o ? o.kind : 'silence';
    const pool = LINES[e.why];
    st.say = { q: o ? label(o) : '(Du sagst nichts.)', a: pool[st.round % pool.length] + (e.style ? (st.guest.style === 'locker' ? ' (Etwas steif gefragt.)' : ' (Ein bisschen flapsig.)') : ''), d: e.d };
    st.history.push(e.d);
    st.phase = 'react'; st.rt = REACT; st.round++;
    MG.fx(st, e.d >= 8 ? 'good' : e.d >= 0 ? 'pop' : 'bad');
    if (st.rapport <= 0) { st.left = true; MG.finish(st, false); }
  }

  MG.define({
    id: 'F02', group: 'feelgood', name: 'Interview-Rapport', icon: '🎤',
    short: 'Führe ein Gespräch, bei dem dein Gast richtig auftaut.',
    rules: [
      'Wähle in jeder Runde eine Frage. Lieblingsthemen und der passende Stil (locker/sachlich) steigern den Rapport.',
      'Reizthemen, Wiederholungen und zu frühe persönliche Fragen (unter 60 Rapport) kosten Vertrauen.',
      'Nachhaken lohnt sich nur nach einer guten Antwort; Komplimente wirken nur einmal.',
      'Jeder Gast hat eine verborgene Vorliebe und Abneigung – achte auf die Reaktionen!',
      'Gewonnen mit genug Rapport am Ende. Bei 0 Rapport geht der Gast.'
    ],
    controls: { key: '↑/↓ + Leertaste oder 1–4', touch: 'Frage antippen', pad: 'Steuerkreuz + A' },
    touch: ['up', 'down', 'a', '1', '2', '3', '4'],
    init(o) {
      const c = CFG[o.difficulty | 0] || CFG[1];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, diff: o.difficulty | 0, cfg: c, fx: [], t: 0,
        round: 0, rapport: c.start, used: {}, lastTopic: null, lastGood: false, complimented: false, joked: false,
        lastKind: '', say: null, history: [], opts: [], sel: 0, qt: c.think, phase: 'ask', rt: 0, left: false };
      const base = PT.pick(st, GUESTS), rest = PT.shuffle(st, TK);
      const gu = { name: base.name, role: base.role, bio: base.bio, likes: (base.likes || rest.slice(0, 2)).slice(), dis: (base.dis || rest.slice(2, 3)).slice(), style: base.style || (PT.rand(st) < 0.5 ? 'locker' : 'sachlich') };
      const free = PT.shuffle(st, TK.filter(t => gu.likes.indexOf(t) < 0 && gu.dis.indexOf(t) < 0));
      gu.likes.push(free[0]); gu.dis.push(free[1]); // verborgen: werden nirgends angezeigt
      st.guest = gu;
      makeOptions(st);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const press = a.type === 'key' && a.down, tap = a.type === 'pointer' && a.phase === 'down';
      if (st.phase === 'react') { if (st.rt < REACT - 0.5 && ((press && a.key === 'a') || tap)) st.rt = 0; return; }
      if (press) {
        if (a.key === 'up') { st.sel = (st.sel + st.opts.length - 1) % st.opts.length; MG.fx(st, 'click'); }
        else if (a.key === 'down') { st.sel = (st.sel + 1) % st.opts.length; MG.fx(st, 'click'); }
        else if (a.key === 'a') choose(st, st.sel);
        else if (a.key >= '1' && a.key <= '4' && +a.key <= st.opts.length) choose(st, +a.key - 1);
      } else if (tap && a.y >= 300) {
        const i = Math.floor((a.y - 300) / 58);
        if (i >= 0 && i < st.opts.length && a.y - 300 - i * 58 <= 52) { st.sel = i; choose(st, i); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.phase === 'ask') {
        const before = st.qt; st.qt -= dt;
        if (before > 4 && st.qt <= 4) MG.fx(st, 'tick');
        if (st.qt <= 0) choose(st, -1);
      } else if ((st.rt -= dt) <= 0) {
        if (st.round >= st.cfg.rounds) MG.finish(st, st.rapport >= st.cfg.need);
        else makeOptions(st);
      }
    },
    result(st) {
      const won = st.status === 'won', c = st.cfg;
      const score = won ? 50 + Math.round(50 * (st.rapport - c.need) / Math.max(1, 100 - c.need)) : Math.round(49 * st.rapport / c.need);
      return { won, score: won ? PT.clamp(score, 50, 100) : PT.clamp(score, 0, 49),
        detail: st.left ? st.guest.name + ' ist vorzeitig gegangen – das Gespräch ist gekippt.' : 'Rapport mit ' + st.guest.name + ': ' + st.rapport + ' (Ziel ' + c.need + ')' };
    },
    bot(st, goal) {
      if (st.phase === 'react') return st.rt < 1.5 ? [{ type: 'key', key: 'a', down: true }] : [];
      if (st.cfg.think - st.qt < 0.7) return [];
      const ds = st.opts.map(o => effect(st, o).d);
      if (goal === 'win') return [{ type: 'key', key: String(ds.indexOf(Math.max.apply(null, ds)) + 1), down: true }];
      const lo = Math.min.apply(null, ds);
      return lo <= -4 ? [{ type: 'key', key: String(ds.indexOf(lo) + 1), down: true }] : []; // sonst schweigen
    },
    draw2d(g, st) {
      const c = st.cfg, gu = st.guest;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.textAlign = 'left';
      g.fillText('Runde ' + Math.min(st.round + (st.phase === 'ask' ? 1 : 0), c.rounds) + ' / ' + c.rounds, 20, 30);
      g.textAlign = 'right';
      g.fillText((st.phase === 'ask' ? 'Bedenkzeit ' + Math.ceil(st.qt) + ' s   ' : '') + 'Rapport ' + st.rapport + ' / Ziel ' + c.need, 940, 30);
      // Gast
      g.fillStyle = '#1a2040'; g.fillRect(20, 44, 320, 246);
      const mood = st.rapport >= c.need ? 2 : st.rapport >= 35 ? 1 : 0, bob = Math.sin(st.t * 2) * 3;
      g.fillStyle = ['#ff8a4d', '#ffc84a', '#4be08a'][mood];
      g.beginPath(); g.arc(80, 100 + bob, 36, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#10142a'; g.fillRect(66, 90 + bob, 6, 8); g.fillRect(88, 90 + bob, 6, 8);
      g.strokeStyle = '#10142a'; g.lineWidth = 4; g.beginPath();
      if (mood === 2) g.arc(80, 106 + bob, 14, 0.15 * Math.PI, 0.85 * Math.PI);
      else if (mood === 1) { g.moveTo(68, 116 + bob); g.lineTo(92, 116 + bob); }
      else g.arc(80, 128 + bob, 14, 1.15 * Math.PI, 1.85 * Math.PI);
      g.stroke();
      g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = '700 22px system-ui'; g.fillText(gu.name, 130, 92);
      g.fillStyle = '#ffb02e'; g.font = '600 18px system-ui'; g.fillText(gu.role, 130, 118);
      g.fillStyle = '#cfd6ff'; g.font = '500 18px system-ui';
      wrap(g, gu.bio, 290).slice(0, 6).forEach((l, i) => g.fillText(l, 34, 168 + i * 22));
      // Gesprächsblase
      g.fillStyle = '#f5ecd7'; g.fillRect(356, 44, 510, 246);
      g.fillStyle = '#1b1b2a'; g.font = '500 18px system-ui';
      if (st.say) {
        let y = 74;
        wrap(g, 'Du: ' + st.say.q, 480).slice(0, 4).forEach(l => { g.fillText(l, 372, y); y += 22; });
        y += 10; g.font = '700 21px system-ui'; g.fillStyle = st.say.d >= 8 ? '#1f6b45' : st.say.d >= 0 ? '#5a4a3a' : '#9a2236';
        wrap(g, gu.name.split(' ')[0] + ': ' + st.say.a, 480).slice(0, 4).forEach(l => { g.fillText(l, 372, y); y += 26; });
        g.font = '800 22px system-ui'; g.textAlign = 'right'; g.fillText((st.say.d > 0 ? '+' : '') + st.say.d + ' Rapport', 852, 278);
      } else {
        g.font = '600 21px system-ui'; wrap(g, 'Herzlich willkommen im Studio! Wähle deine erste Frage – lies vorher die Gastinfo links.', 480).forEach((l, i) => g.fillText(l, 372, 80 + i * 28));
      }
      // Rapport-Meter
      g.fillStyle = '#1d2342'; g.fillRect(884, 44, 56, 246);
      const h = 246 * st.rapport / 100;
      g.fillStyle = ['#ff4d6d', '#ffb02e', '#4be08a'][mood]; g.fillRect(884, 290 - h, 56, h);
      const ny = 290 - 246 * c.need / 100;
      g.fillStyle = '#ffffff'; g.fillRect(878, ny - 2, 68, 4);
      // Optionen bzw. Weiter-Hinweis
      g.textAlign = 'left';
      if (st.phase === 'ask') {
        st.opts.forEach((o, i) => {
          const y = 300 + i * 58;
          g.fillStyle = i === st.sel ? '#2a3366' : '#1d2342'; g.fillRect(20, y, 920, 52);
          if (i === st.sel) { g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.strokeRect(21, y + 1, 918, 50); }
          g.fillStyle = '#ffb02e'; g.font = '800 22px system-ui'; g.fillText(String(i + 1), 36, y + 34);
          g.fillStyle = '#ffffff'; g.font = '500 18px system-ui';
          const L = wrap(g, label(o), 860).slice(0, 2);
          L.forEach((l, j) => g.fillText(l, 66, y + (L.length > 1 ? 22 + j * 21 : 33)));
        });
      } else {
        g.fillStyle = '#cfd6ff'; g.font = '600 20px system-ui'; g.textAlign = 'center';
        g.fillText(st.round >= c.rounds ? 'Das Interview ist gleich vorbei …' : 'Leertaste / Tippen = nächste Frage', 480, 400);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
