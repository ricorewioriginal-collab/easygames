/* Hauptmenü, neues Spiel, Herausforderungen, Party (lokal reihum), Minispiel-Sammlung, Kapitel- und Endbildschirme. */
(function (root) {
  'use strict';
  const PT = root.PT, UI = PT.UI, S = PT.Sim, D = PT.DATA, esc = PT.esc;
  const G = () => PT.G;
  const LOGO = '<svg class="pt-logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#16171c" stroke="#ff8a1e" stroke-width="6"/><path d="M46 34 L90 60 L46 86Z" fill="#ff8a1e"/></svg>';
  UI.LOGO = LOGO;

  UI.mainMenu = function () {
    const g = G(), latest = g.repo.latest();
    const m = UI.el('<div class="pt-menu"><div class="pt-menu-in">' + LOGO + '<h1><span>AnMaCha</span> Podcast Tycoon 3D</h1><p class="pt-sub">Das totale Studio-Chaos!</p><p class="pt-slogan">„Seid Ihr bereit, angemacht zu werden?“</p>' +
      '<div class="pt-menu-btns">' + (latest ? '<button data-act="cont" data-primary class="pri">▶ Weiter <small>' + esc(g.repo.SLOT_NAMES[latest.slot]) + ' · Tag ' + latest.meta.day + '</small></button>' : '') +
      '<button data-act="new"' + (latest ? '' : ' data-primary class="pri"') + '>✨ Neue Karriere</button><button data-act="load">📂 Laden</button><button data-act="creative">🎨 Kreativmodus</button><button data-act="challenge">🏆 Herausforderungen</button>' +
      '<button data-act="party">🎉 Party (lokal, 1–4)</button><button data-act="online">🌐 Online-Quizshow</button><button data-act="mg">🕹️ Minispiele</button><button data-act="opts">⚙️ Optionen</button><button data-act="help">🎮 Steuerung</button></div>' +
      '<div class="pt-cloud" id="ptCloud"></div>' +
      '<p class="pt-links"><a href="https://www.anmacha.de" target="_blank" rel="noopener">🎧 Echten Podcast anhören</a> · <a href="../index.html">← easygames</a></p><p class="pt-fine">Fanspiel mit fiktiven Figuren, Firmen und Sponsoren. Version ' + esc(PT.VERSION || '1') + '</p></div></div>');
    UI.layer().appendChild(m);
    const close = () => m.remove();
    UI.bind(m, {
      cont: () => { close(); g.loadSlot(latest.slot); },
      new: () => UI.newGame().then(o => { if (o) { close(); g.start(o); } }),
      load: () => UI.slots('load').then(s => { if (s) { close(); g.loadSlot(s); } }),
      creative: () => { close(); g.start({ mode: 'creative', name: 'Kreativ-Studio' }); },
      challenge: () => UI.challenges().then(id => { if (id) { close(); g.start({ mode: 'challenge', challenge: id }); } }),
      party: () => UI.party(),
      online: () => UI.online(),
      mg: () => UI.minigames(),
      opts: () => UI.options(),
      help: () => UI.help()
    });
    UI.focusFirst(m);
    PT.Audio.music('menu');
    return m;
  };

  UI.newGame = function () {
    return new Promise(resolve => {
      const o = { name: 'Studioleitung', difficulty: 1, look: { shirt: '#ff8a1e', hair: '#3b2a1e', skin: '#f0c8a8' }, slot: 'slot1' };
      const SH = ['#ff8a1e', '#4be08a', '#6ea8ff', '#ff7ad9', '#ffd36b', '#c58bff', '#e8e8e8'], HA = ['#3b2a1e', '#1d1f26', '#c9844a', '#ffd36b', '#9a9a9a', '#c0392b'], SK = ['#f0c8a8', '#e3b08c', '#c98d64', '#8d5a3b', '#5a3b28'];
      const used = G().repo.list().map(x => x.slot);
      const pnl = UI.panel('Neue Karriere', '', { icon: '✨', onClose: v => resolve(v || null) });
      function render() {
        const sw = (k, arr) => '<div class="pt-swatch">' + arr.map(c => '<button data-act="col" data-k="' + k + '" data-c="' + c + '" style="background:' + c + '" class="' + (o.look[k] === c ? 'sel' : '') + '" aria-label="Farbe ' + c + '"></button>').join('') + '</div>';
        pnl.set('<div class="pt-cols"><div><label class="pt-field">Dein Name<input data-ch="name" maxlength="20" value="' + esc(o.name) + '"></label><h3>Aussehen</h3><p>Shirt</p>' + sw('shirt', SH) + '<p>Haare</p>' + sw('hair', HA) + '<p>Haut</p>' + sw('skin', SK) + '</div>' +
          '<div><h3>Schwierigkeit</h3><div class="pt-list">' + D.rules.difficulty.map((d, i) => '<button class="pt-opt ' + (o.difficulty === i ? 'sel' : '') + '" data-act="diff" data-i="' + i + '"><b>' + d.name + '</b><small>' + ['Mehr Geld, weniger Pannen – zum Entdecken', 'Ausgewogen – so ist es gedacht', 'Knappe Kasse, mehr Chaos, anspruchsvolle Minispiele'][i] + '</small></button>').join('') + '</div>' +
          '<h3>Spielstand</h3><div class="pt-seg">' + ['slot1', 'slot2', 'slot3'].map(s => '<button data-act="slot" data-s="' + s + '" class="' + (o.slot === s ? 'sel' : '') + '">' + G().repo.SLOT_NAMES[s] + (used.includes(s) ? ' (überschreiben)' : '') + '</button>').join('') + '</div></div></div>');
        pnl.footer('<button data-act="cancel">Abbrechen</button><button data-act="go" data-primary class="pri">🎙️ Los geht’s</button>');
        const inp = pnl.body.querySelector('[data-ch="name"]'); inp.oninput = () => { o.name = inp.value.trim().slice(0, 20) || 'Studioleitung'; };
      }
      UI.bind(pnl.root, { col: b => { o.look[b.dataset.k] = b.dataset.c; render(); }, diff: b => { o.difficulty = +b.dataset.i; render(); }, slot: b => { o.slot = b.dataset.s; render(); }, cancel: () => pnl.close(), go: () => pnl.close(Object.assign({ mode: 'career' }, o)) });
      render();
    });
  };

  UI.challenges = function () {
    const best = G().repo.best();
    return UI.choose('Herausforderungen', 'Feste Regeln, festes Ziel, begrenzte Tage. Gespeichert wird im eigenen Herausforderungs-Spielstand.', D.challenges.map(c => ({ label: c.icon + ' ' + c.name + ((best.ch || {})[c.id] ? ' ✓' : ''), desc: c.desc + ' (' + c.days + ' Tage)' })), { icon: '🏆' }).then(i => i >= 0 ? D.challenges[i].id : null);
  };

  // ── Minispiel-Sammlung ───────────────────────────────────
  UI.minigames = function () {
    const g = G(), best = g.repo.best();
    const pnl = UI.panel('Minispiele', '', { wide: true, icon: '🕹️' });
    function render() {
      pnl.set(Object.keys(PT.MG.GROUPS).map(gr => '<h3>' + PT.MG.GROUPS[gr].icon + ' ' + PT.MG.GROUPS[gr].name + '</h3><div class="pt-mgs">' + PT.MG.list().filter(d => d.group === gr).map(d => '<button class="pt-mgc" data-act="play" data-id="' + d.id + '"><span>' + d.icon + '</span><b>' + esc(d.name) + '</b><small>' + esc(d.short) + '</small><small class="best">' + ((best.mg || {})[d.id] != null ? 'Bestwert ' + best.mg[d.id] : 'noch nicht gespielt') + (d.multi && d.multi.local ? ' · 👥' : '') + '</small></button>').join('') + '</div>').join(''));
    }
    UI.bind(pnl.root, { play: b => { pnl.root.parentNode.style.display = 'none'; g.runMG(b.dataset.id, { free: true, onDone: () => { pnl.root.parentNode.style.display = ''; render(); } }); } });
    render();
  };

  // ── Party: lokal reihum ──────────────────────────────────
  UI.party = function () {
    const g = G(), pool = PT.MG.list().filter(d => d.multi && d.multi.local);
    const o = { names: ['Spieler 1', 'Spieler 2'], rounds: 3, diff: 1 };
    const pnl = UI.panel('Party-Runde', '', { icon: '🎉' });
    function render() {
      pnl.set('<p>1–4 Leute an einem Gerät: Alle spielen dasselbe Minispiel nacheinander mit gleichem Ablauf. Platz 1 bekommt 3 Punkte, Platz 2 zwei, Platz 3 einen.</p><h3>Mitspieler</h3>' + o.names.map((n, i) => '<div class="pt-row"><input data-name="' + i + '" maxlength="14" value="' + esc(n) + '">' + (o.names.length > 1 ? '<button data-act="rm" data-i="' + i + '" aria-label="Entfernen">✕</button>' : '') + '</div>').join('') + (o.names.length < 4 ? '<button data-act="add">＋ Mitspieler</button>' : '') +
        '<h3>Runden</h3><div class="pt-seg">' + [3, 5, 8].map(n => '<button data-act="rounds" data-n="' + n + '" class="' + (o.rounds === n ? 'sel' : '') + '">' + n + '</button>').join('') + '</div><h3>Stufe</h3><div class="pt-seg">' + PT.MG.DIFF.map((n, i) => '<button data-act="diff" data-i="' + i + '" class="' + (o.diff === i ? 'sel' : '') + '">' + n + '</button>').join('') + '</div><p class="pt-hint">Spiele im Topf: ' + pool.map(d => d.icon).join(' ') + '</p><p class="pt-hint">Für Handys an verschiedenen Orten: 🌐 Online-Quizshow im Hauptmenü.</p>');
      pnl.footer('<button data-act="go" data-primary class="pri">🎉 Party starten</button>');
      pnl.body.querySelectorAll('[data-name]').forEach(inp => { inp.oninput = () => { o.names[+inp.dataset.name] = inp.value.trim() || 'Spieler ' + (+inp.dataset.name + 1); }; });
    }
    UI.bind(pnl.root, {
      add: () => { o.names.push('Spieler ' + (o.names.length + 1)); render(); }, rm: b => { o.names.splice(+b.dataset.i, 1); render(); },
      rounds: b => { o.rounds = +b.dataset.n; render(); }, diff: b => { o.diff = +b.dataset.i; render(); },
      go: () => { pnl.close(); play(); }
    });
    function play() {
      const tmp = { seed: (Date.now() >>> 0) || 1 }, games = PT.shuffle(tmp, pool).slice(0, o.rounds), pts = o.names.map(() => 0);
      let r = 0;
      const next = () => {
        if (r >= games.length) { finish(); return; }
        const d = games[r];
        g.runMG(d.id, { party: o.names.map(name => ({ name })), difficulty: o.diff, allowDiff: false, title: 'Runde ' + (r + 1) + ' von ' + games.length, onDone: res => {
          if (!res) { finish(true); return; }
          res.results.map((x, i) => ({ i, s: x.score })).sort((a, b) => b.s - a.s).forEach((x, place) => { pts[x.i] += Math.max(0, 3 - place); });
          r++;
          const p = UI.panel('Zwischenstand nach Runde ' + r, '<ol class="pt-mg-rank">' + o.names.map((n, i) => ({ n, p: pts[i] })).sort((a, b) => b.p - a.p).map(x => '<li><b>' + esc(x.n) + '</b> ' + x.p + ' Punkte</li>').join('') + '</ol>', { icon: '📊', onClose: next });
          p.footer('<button data-act="x" data-primary class="pri">' + (r < games.length ? 'Nächste Runde ▶' : 'Siegerehrung 🏆') + '</button>'); UI.bind(p.root, { x: () => p.close() });
        } });
      };
      const finish = aborted => {
        const rank = o.names.map((n, i) => ({ n, p: pts[i] })).sort((a, b) => b.p - a.p);
        if (!aborted) PT.Audio.fx('win');
        UI.panel(aborted ? 'Party beendet' : '🏆 Siegerehrung', '<ol class="pt-podium">' + rank.map((x, i) => '<li class="p' + i + '">' + ['🥇', '🥈', '🥉', '🎈'][i] + ' <b>' + esc(x.n) + '</b> ' + x.p + ' Punkte</li>').join('') + '</ol>', { icon: '🎉' });
        if (g.st && !aborted) { S.minigameDone(g.st, { id: games[0].id, won: true, score: 60 }, { party: o.names.length }); g.afterAction(); }
      };
      next();
    }
    render();
  };

  // ── Online ───────────────────────────────────────────────
  UI.online = function (code) {
    if (!PT.Online) { UI.toast('Der Online-Modus konnte nicht geladen werden.', 'bad'); return; }
    const host = UI.el('<div class="pt-online-host"></div>'); document.body.appendChild(host);
    const g = G(), name = (g.st && g.st.name) || (UI.settings && UI.settings.lastName) || 'Gast';
    const opts = { name, onExit: () => { h && h.close && h.close(); host.remove(); }, onResult: res => { if (g.st && g.st.mode === 'career' && res) { S.minigameDone(g.st, { id: 'Q01', won: !!res.won, score: res.won ? 80 : 40 }, { party: res.players || 2 }); g.afterAction(); } } };
    const h = code ? PT.Online.join(host, code, opts) : PT.Online.open(host, opts);
  };

  // ── Kapitel und Ende ─────────────────────────────────────
  UI.chapter = function (n) {
    const c = D.chapters[n - 1]; if (!c) return Promise.resolve();
    return new Promise(res => { const p = UI.panel('Kapitel ' + n, '<div class="pt-chapter"><h1>' + esc(c.title) + '</h1><p>' + esc(c.intro) + '</p></div>', { icon: '📖', onClose: res }); p.footer('<button data-act="x" data-primary class="pri">Weiter</button>'); UI.bind(p.root, { x: () => p.close() }); PT.Audio.fx('mission'); });
  };
  UI.ending = function (st) {
    const e = D.endings[st.story.ending], avgQ = st.episodes.length ? Math.round(st.episodes.reduce((t, x) => t + x.q, 0) / st.episodes.length) : 0;
    PT.Audio.music('festival'); PT.Audio.fx('win');
    return new Promise(res => {
      const p = UI.panel('Das große Finale', '<div class="pt-ending"><div class="pt-big">' + e.icon + '</div><h1>' + esc(e.title) + '</h1><p>' + esc(e.text) + '</p><ul class="pt-mini"><li>📅 ' + st.time.day + ' Tage</li><li>🎙️ ' + st.episodes.length + ' Folgen, Ø ' + avgQ + ' % Qualität</li><li>💛 ' + PT.fmt(st.fans) + ' Fans · ⭐ Ruf ' + st.rep + '</li><li>💶 ' + PT.money(st.money) + '</li></ul><p>Marco: „Danke, Studioleitung. Ohne dich wäre das hier immer noch ein Flur mit Kaffeemaschine.“</p><p>Andrew: „Und jetzt? Weitermachen natürlich!“</p></div>', { icon: '🎪', onClose: res });
      p.footer('<button data-act="x" data-primary class="pri">♾️ Weiter im Endlosmodus</button>'); UI.bind(p.root, { x: () => p.close() });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
