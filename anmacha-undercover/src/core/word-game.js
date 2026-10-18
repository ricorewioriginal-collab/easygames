/* AnMaCha UNDERCOVER 3D – Modus „Imposter: Das geheime Wort“ (autoritativer Kern, ohne DOM, deterministisch per Seed).
   Ablauf: reveal → clue (Hinweisrunden reihum) → discuss → vote → (guess) → end.
   Varianten: 'kategorie' – Imposter kennt nur die Kategorie und weiß, dass er Imposter ist;
              'alternativ' – Imposter bekommt ein ähnliches Wort und erfährt seine Rolle erst am Ende/bei Enttarnung.
   Geheimhaltung: viewFor(pid) zeigt nur die eigene Karte; das Wort und die Imposter stehen erst im Ergebnis. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const STEP = 50, REVEAL = 7000, GUESS_MS = 30000;
  const QUICK = {
    sus: { de: 'Der Hinweis von {p} passt für mich nicht.', en: '{p}\'s clue doesn\'t fit for me.', target: 1, claim: 'accuse' },
    safe: { de: '{p} weiß das Wort, ganz sicher.', en: '{p} knows the word, for sure.', target: 1, claim: 'vouch' },
    vague: { de: '{p}, das war mir zu allgemein.', en: '{p}, that was too vague.', target: 1, claim: 'ask' },
    notme: { de: 'Ich bin es nicht – mein Hinweis passt genau!', en: 'It\'s not me – my clue fits perfectly!', claim: 'deny' },
    skip: { de: 'Ich bin mir noch unsicher.', en: 'I\'m not sure yet.', claim: 'skip' },
    hm: { de: 'Hmm … lasst uns die Hinweise nochmal durchgehen.', en: 'Hmm… let\'s go through the clues again.', claim: 'none' }
  };
  const fail = why => ({ ok: false, why });

  function pool(settings, recent) {
    const D = AMU.WORDS_DE; if (!D) return [];
    const cats = settings.wordCats === 'alle' ? Object.keys(D.CATS) : settings.wordCats.filter(c => D.CATS[c]);
    const wd = settings.wordDiff | 0;
    let list = D.W.filter(e => cats.includes(e.c) && (wd === 0 || (wd === 1 && e.d === 1) || (wd === 2 && e.d <= 2) || (wd === 3 && e.d >= 2)));
    if (!list.length) list = D.W.slice();
    const rec = new Set((recent || []).map(w => AMU.U.norm(w)));
    const fresh = list.filter(e => !rec.has(AMU.U.norm(e.w)));
    return fresh.length >= 5 ? fresh : list;
  }
  /** Stämme, die in einem Hinweis nicht vorkommen dürfen (Wort selbst + redaktionelle Wortteile). */
  function stems(entry, word) {
    const out = new Set(); const n = AMU.U.norm(word || entry.w).replace(/ /g, '');
    if (n.length >= 3) out.add(n);
    (entry && word === entry.w ? entry.f || [] : []).forEach(f => { const x = AMU.U.norm(f).replace(/ /g, ''); if (x.length >= 3) out.add(x); });
    return Array.from(out);
  }
  function clueOk(text, forb) {
    const n = AMU.U.norm(text); if (!n) return 'leer';
    if (n.split(' ').length > 3) return 'höchstens drei Wörter';
    const flat = n.replace(/ /g, '');
    for (const f of forb) if (flat.includes(f) || (f.length >= 5 && f.includes(flat) && flat.length >= 4)) return 'zu nah am geheimen Wort';
    return null;
  }

  function create(opt) {
    const settings = AMU.cleanSettings(Object.assign({}, opt.settings || {}, { mode: 'wort' }), null);
    const rng = AMU.RNG(opt.seed == null ? 1 : opt.seed);
    const D = AMU.WORDS_DE;
    const g = {
      STEP, QUICK, settings, mode: AMU.modeById('wort'), rng, seed: rng.seed, t: 0, acc: 0, tick: 0, kind: 'word',
      phase: 'reveal', phaseEnd: REVEAL, players: [], clues: [], round: 1, roundsTotal: settings.wordRounds, order: [], turn: -1, turnEnd: 0, chat: [], votes: {},
      ejected: [], extraUsed: false, guess: null, result: null, eventSeq: 0, log: [], brains: {}, filter: opt.filter || null, stats: { rounds: 0 },
      act, step, viewFor, drain, setConnected, takeover, release, emit, byId, alive, quickText, cardFor, optionsFor, guessOptions
    };
    const C = AMU.COSMETICS;
    (opt.players || []).forEach((q, i) => {
      const look = C ? C.validLook(q.look || C.randomLook(rng.fork('look' + i))) : (q.look || {});
      g.players.push({ id: q.id, seat: i, name: q.name || ('Spieler ' + (i + 1)), bot: !!q.bot, diff: q.diff == null ? settings.diff : q.diff, look,
        sym: C ? C.symbols[i % C.symbols.length] : String(i + 1), role: 'knower', out: [], connected: true, ejected: false, voted: false, lastChat: 0,
        st: { clues: 0, votesRight: 0, votesWrong: 0, guessed: 0 } });
    });
    // Wort + Imposter
    const P = g.players, n = P.length;
    const list = pool(settings, opt.recent);
    const entry = list.length ? rng.pick(list) : { w: 'Radio', c: 'radio', h: ['Sender'], f: ['radio'], a: 'Fernseher', en: 'radio', d: 1 };
    g.secret = { entry, word: entry.w, cat: entry.c, catName: D && D.CATS[entry.c] ? D.CATS[entry.c].n : entry.c, alt: entry.a || null };
    const imps = Math.max(1, Math.min(settings.impostors, n >= 9 ? 2 : 1));
    const pickR = rng.fork('imp');
    const order = pickR.shuffle(P.map((p, i) => i));
    for (let i = 0; i < imps; i++) P[order[i]].role = 'impostor';
    // Wunschrolle (Solo: „Als Imposter spielen“)
    if (opt.wish && opt.wish.pid && (opt.wish.role === 'impostor' || opt.wish.role === 'knower')) {
      const me = P.find(p => p.id === opt.wish.pid);
      if (me && me.role !== opt.wish.role) { const other = P.find(p => p !== me && p.role === opt.wish.role); if (other) { other.role = me.role; me.role = opt.wish.role; } }
    }
    if (settings.wordVariant === 'alternativ' && !g.secret.alt) settings.wordVariant = 'kategorie';
    g.variant = settings.wordVariant;
    // Reihenfolge der Hinweise: zufälliger Start, dann Sitzordnung
    const st = rng.int(n); g.order = P.map((p, i) => P[(st + i) % n].id);
    if (AMU.WordAI) P.forEach(p => { if (p.bot) g.brains[p.id] = AMU.WordAI.create(g, p); });
    P.forEach(p => emit('card', { card: cardFor(p) }, p.id));
    emit('phase', { phase: 'reveal' }, 'all');
    return g;

    // ---------- Hilfen ----------
    function byId(id) { return P.find(p => p.id === id) || null; }
    function alive(p) { return !!p && !p.ejected; }
    function emit(type, data, to) {
      const ev = Object.assign({ type, t: g.t, n: ++g.eventSeq }, data || {});
      if (to === 'all') P.forEach(p => p.out.push(ev));
      else if (Array.isArray(to)) to.forEach(id => { const p = byId(id); if (p) p.out.push(ev); });
      else if (to != null) { const p = byId(to); if (p) p.out.push(ev); }
      if (to === 'all') { g.log.push(ev); if (g.log.length > 300) g.log.splice(0, 100); }
      P.forEach(p => { if (p.out.length > 200) p.out.splice(0, p.out.length - 200); });
    }
    function drain(pid) { const p = byId(pid); if (!p) return []; const o = p.out; p.out = []; return o; }
    /** Eigene Karte: Wissende sehen Wort + Kategorie, Imposter je nach Variante nur Kategorie oder das ähnliche Wort. */
    function cardFor(p) {
      const s = g.secret;
      if (p.role === 'impostor') {
        if (g.variant === 'alternativ' && !(g.result || p.ejected)) return { word: s.alt, cat: s.catName, catId: s.cat };
        return { impostor: 1, cat: s.catName, catId: s.cat };
      }
      return { word: s.word, cat: s.catName, catId: s.cat };
    }
    function myWord(p) { return p.role === 'impostor' ? (g.variant === 'alternativ' ? g.secret.alt : null) : g.secret.word; }
    function forbiddenFor(p) {
      const w = myWord(p), e = g.secret.entry;
      const out = w ? stems(e, w) : [];
      out.push(AMU.U.norm(g.secret.catName).replace(/ /g, ''));
      return out.filter(x => x && x.length >= 3);
    }
    /** Hinweiskarten (für Controller/Touch): 8 Vorschläge passend zur eigenen Karte – Imposter bekommen Bluff-Karten. */
    function optionsFor(p) {
      const r = rng.fork('opt' + p.seat + ':' + g.round), D2 = AMU.WORDS_DE, cat = D2 && D2.CATS[g.secret.cat];
      const used = new Set(g.clues.map(c => AMU.U.norm(c.text)));
      let src = [];
      const w = myWord(p);
      const ent = w && D2 ? D2.W.find(e => e.w === w) : null;
      if (ent) src = src.concat(r.shuffle(ent.h).slice(0, 5));
      else if (w === g.secret.word) src = src.concat(r.shuffle(g.secret.entry.h).slice(0, 5));
      if (cat) src = src.concat(r.shuffle(cat.g).slice(0, 3));
      if (p.role === 'impostor' && g.variant !== 'alternativ' && D2) {
        // Bluff: Begriffe aus anderen Wörtern derselben Kategorie (das echte Wort ist nicht bevorzugt)
        const others = r.shuffle(D2.W.filter(e => e.c === g.secret.cat && e.w !== g.secret.word)).slice(0, 4);
        src = src.concat(others.map(e => r.pick(e.h)));
        src = r.shuffle(src);
      }
      // Karten verraten nie das echte Wort – auch nicht die Bluff-Karten des Imposters (still gefiltert, keine Fehlermeldung)
      const forb = forbiddenFor(p).concat(p.role === 'impostor' ? stems(g.secret.entry, g.secret.word) : []), out = [];
      src.forEach(x => { if (out.length < 8 && !used.has(AMU.U.norm(x)) && !out.includes(x) && !clueOk(x, forb)) out.push(x); });
      return out;
    }
    function guessOptions() {
      const r = rng.fork('gopt'), D2 = AMU.WORDS_DE;
      const same = D2 ? r.shuffle(D2.W.filter(e => e.c === g.secret.cat && e.w !== g.secret.word)).slice(0, 7).map(e => e.w) : [];
      return r.shuffle(same.concat([g.secret.word]));
    }
    function quickText(e) {
      const q = QUICK[e.q]; if (!q) return e.text || '';
      const tp = e.target && byId(e.target);
      return q.de.replace('{p}', tp ? tp.name : '?');
    }
    function setConnected(pid, on) { const p = byId(pid); if (p) p.connected = !!on; }
    /** Bot übernimmt (Verbindung verloren, botTakeover) */
    function takeover(pid) {
      const p = byId(pid); if (!p || p.bot) return;
      p.botTook = true;
      if (AMU.WordAI) g.brains[p.id] = AMU.WordAI.create(g, p);
    }
    function release(pid) { const p = byId(pid); if (p && p.botTook) { p.botTook = false; delete g.brains[p.id]; } }
    function controlledByBot(p) { return p.bot || (p.botTook && !p.connected); }

    // ---------- Ablauf ----------
    function setPhase(ph, ms) {
      g.phase = ph; g.phaseEnd = ms ? g.t + ms : 0;
      if (ph === 'vote') { g.votes = {}; g.voteN = (g.voteN || 0) + 1; P.forEach(p => { p.voted = false; }); }
      emit('phase', { phase: ph, round: g.round, until: ms || 0 }, 'all');
    }
    function aliveOrder() { return g.order.filter(id => alive(byId(id))); }
    function giveTurn(id) {
      g.turnId = id; g.turnEnd = g.t + g.settings.clueTime * 1000;
      emit('turn', { id, round: g.round, until: g.settings.clueTime * 1000 }, 'all');
      emit('options', { opts: g.settings.clueMode === 'frei' ? [] : optionsFor(byId(id)) }, id);
    }
    /** Neue Hinweisrunde beginnen (extra = Zusatzrunde nach Gleichstand oder falsch geratenem Wort) */
    function startRound(extra) {
      if (extra) { g.roundsTotal = g.round + 1; g.round++; emit('extra_round', {}, 'all'); }
      g.turn = 0; setPhase('clue'); giveTurn(aliveOrder()[0]);
    }
    function nextTurn() {
      const ids = aliveOrder();
      g.turn++;
      if (g.turn >= ids.length) {
        g.stats.rounds++;
        if (g.round < g.roundsTotal) { g.round++; g.turn = 0; }
        else { g.turn = -1; g.turnId = null; setPhase('discuss', g.settings.discuss * 1000); return; }
      }
      giveTurn(ids[g.turn]);
    }
    function tally() {
      const counts = {}; let skip = 0;
      Object.values(g.votes).forEach(v => { if (v === 'skip') skip++; else counts[v] = (counts[v] || 0) + 1; });
      let top = null, best = 0, tie = false;
      Object.keys(counts).forEach(id => { if (counts[id] > best) { best = counts[id]; top = id; tie = false; } else if (counts[id] === best) tie = true; });
      if (skip >= best) { top = null; tie = tie || skip === best && best > 0; }
      return { counts, skip, top: tie ? null : top, tie };
    }
    function resolveVote() {
      const r = tally();
      P.forEach(p => { const v = g.votes[p.id]; if (!v || v === 'skip') return; const t = byId(v); if (t && t.role === 'impostor') p.st.votesRight++; else p.st.votesWrong++; });
      emit('vote_result', { counts: r.counts, skip: r.skip, id: r.top, tie: r.tie }, 'all');
      if (!r.top) {
        if (!g.extraUsed) {   // einmalig: noch eine Hinweisrunde
          g.extraUsed = true; startRound(true); return;
        }
        return end('impostor', 'Niemand wurde rausgewählt – die Imposter bleiben unentdeckt');
      }
      const v = byId(r.top); v.ejected = true; g.ejected.push(v.id);
      emit('ejected', { id: v.id }, 'all');
      if (v.role !== 'impostor') return end('impostor', v.name + ' kannte das Wort – die Imposter gewinnen');
      // Enttarnter Imposter darf raten
      g.guess = { id: v.id, tries: g.settings.guessTries, opts: guessOptions(), wrong: [] };
      emit('card', { card: cardFor(v) }, v.id);
      setPhase('guess', GUESS_MS);
      emit('guess_start', { id: v.id, tries: g.guess.tries }, 'all');
      emit('guess_opts', { opts: g.guess.opts }, v.id);
    }
    function doGuess(p, text) {
      const gs = g.guess;
      const ok = AMU.U.norm(text).replace(/ /g, '') === AMU.U.norm(g.secret.word).replace(/ /g, '');
      emit('guess', { id: p.id, text, ok: ok ? 1 : 0 }, 'all');
      if (ok) { p.st.guessed = 1; return end('impostor', p.name + ' hat das Wort erraten'); }
      gs.tries--; gs.wrong.push(text);
      if (gs.tries > 0) return;
      afterGuessFail();
    }
    function afterGuessFail() {
      g.guess = null;
      const left = P.filter(q => q.role === 'impostor' && !q.ejected);
      if (!left.length) return end('crew', 'Alle Imposter wurden enttarnt');
      // zweiter Imposter noch im Spiel: weitere Runde
      startRound(true);
    }
    function end(winner, reason) {
      if (g.phase === 'end') return;
      const winners = P.filter(p => winner === 'crew' ? p.role === 'knower' : p.role === 'impostor').map(p => p.id);
      g.result = { winner, reason, word: g.secret.word, cat: g.secret.catName, alt: g.variant === 'alternativ' ? g.secret.alt : null,
        impostors: P.filter(p => p.role === 'impostor').map(p => p.id), winners, clues: g.clues.slice(), dur: g.t,
        players: P.map(p => ({ id: p.id, n: p.name, role: p.role, bot: p.bot, look: p.look, st: p.st, ejected: p.ejected })) };
      setPhase('end');
      emit('end', { result: g.result }, 'all');
      P.forEach(p => emit('card', { card: cardFor(p) }, p.id));
    }

    // ---------- Takt ----------
    function step(dtMs) {
      g.acc += dtMs;
      while (g.acc >= STEP) { g.acc -= STEP; tickOnce(); }
    }
    function tickOnce() {
      g.t += STEP; g.tick++;
      if (g.phase === 'end') return;
      Object.keys(g.brains).forEach(id => { const p = byId(id); if (p && controlledByBot(p)) g.brains[id].tick(STEP); });
      if (g.phase === 'reveal' && g.t >= g.phaseEnd) { startRound(false); return; }
      if (g.phase === 'clue' && g.turnId && g.t >= g.turnEnd) {
        const p = byId(g.turnId);
        // Zeit abgelaufen: kein Hinweis (zählt als leerer Hinweis)
        if (p) { g.clues.push({ id: p.id, text: '', round: g.round, none: 1, t: g.t }); emit('clue', { id: p.id, text: '', round: g.round, none: 1 }, 'all'); }
        nextTurn();
        return;
      }
      if (g.phase === 'discuss') {
        const ready = P.filter(p => alive(p)).every(p => p.ready);
        if (g.t >= g.phaseEnd || ready) { P.forEach(p => { p.ready = false; }); setPhase('vote', g.settings.vote * 1000); }
        return;
      }
      if (g.phase === 'vote') {
        const voters = P.filter(p => alive(p));
        const all = voters.every(p => g.votes[p.id]);
        if (all && !g.voteCut) { g.voteCut = true; g.phaseEnd = Math.min(g.phaseEnd, g.t + 1500); }
        if (g.t >= g.phaseEnd) { g.voteCut = false; resolveVote(); }
        return;
      }
      if (g.phase === 'guess' && g.t >= g.phaseEnd && g.guess) { emit('guess', { id: g.guess.id, text: '', ok: 0, timeout: 1 }, 'all'); afterGuessFail(); }
    }
    // ---------- Aktionen (Menschen und Bots gleich) ----------
    function act(pid, a) {
      const p = byId(pid);
      if (!p || !AMU.U.isObj(a) || typeof a.a !== 'string') return fail('ungültig');
      if (g.phase === 'end') return fail('vorbei');
      switch (a.a) {
        case 'clue': {
          if (g.phase !== 'clue' || g.turnId !== p.id) return fail('nicht dran');
          let text;
          if (a.card != null) {
            if (g.settings.clueMode === 'frei') return fail('nur Freitext');
            const opts = optionsFor(p); if (!AMU.U.isInt(a.card) || !opts[a.card]) return fail('karte');
            text = opts[a.card];
          } else {
            if (g.settings.clueMode === 'karten' && !p.bot && !p.botTook) return fail('nur Karten');
            if (!AMU.U.isStr(a.text, 40)) return fail('text');
            text = AMU.U.cleanName(a.text, 24);
            const bad = clueOk(text, forbiddenFor(p)); if (bad) return fail(bad);
            if (g.clues.some(c => c.text && AMU.U.norm(c.text) === AMU.U.norm(text))) return fail('schon genannt');
            if (g.filter) { const f = g.filter(text); if (!f) return fail('filter'); text = f; }
          }
          addCluePublic(p, text, a.card != null);
          return { ok: true };
        }
        case 'chat': case 'quick': {
          if (g.phase !== 'discuss' && g.phase !== 'vote' && g.phase !== 'clue') return fail('phase');
          if (!alive(p)) return fail('raus');
          const gap = p.bot ? 600 : 1500; if (g.t - p.lastChat < gap) return fail('langsam');
          let entry;
          if (a.a === 'quick') {
            if (!QUICK[a.q]) return fail('quick');
            if (QUICK[a.q].target && !(byId(a.target) && alive(byId(a.target)))) return fail('ziel');
            entry = { id: p.id, q: a.q, target: a.target || null, claim: QUICK[a.q].claim, t: g.t };
            entry.text = quickText(entry);
          } else {
            if (!AMU.U.isStr(a.text, 200)) return fail('text');
            let txt = AMU.U.cleanName(a.text, 140); if (!txt) return fail('leer');
            if (g.filter) { txt = g.filter(txt); if (!txt) return fail('filter'); }
            entry = { id: p.id, text: txt, t: g.t, bot: p.bot ? 1 : 0 };
            if (a.target && byId(a.target)) entry.target = a.target;
            if (a.claim && typeof a.claim === 'string') entry.claim = a.claim.slice(0, 12);
          }
          p.lastChat = g.t; g.chat.push(entry); if (g.chat.length > 80) g.chat.shift();
          emit('chat', { e: entry }, 'all');
          return { ok: true };
        }
        case 'ready': if (g.phase !== 'discuss' || !alive(p)) return fail('phase'); p.ready = true; return { ok: true };
        case 'vote': {
          if (g.phase !== 'vote' || !alive(p)) return fail('phase');
          if (g.votes[p.id]) return fail('schon abgestimmt');
          const v = a.target === 'skip' ? 'skip' : a.target;
          if (v !== 'skip') { const t = byId(v); if (!t || !alive(t) || t === p) return fail('ziel'); }
          g.votes[p.id] = v; p.voted = true;
          emit('voted', { id: p.id }, 'all');
          return { ok: true };
        }
        case 'guess': {
          if (g.phase !== 'guess' || !g.guess || g.guess.id !== p.id) return fail('nicht dran');
          let text;
          if (a.opt != null) { if (!AMU.U.isInt(a.opt) || !g.guess.opts[a.opt]) return fail('option'); text = g.guess.opts[a.opt]; }
          else { if (!AMU.U.isStr(a.text, 40)) return fail('text'); text = AMU.U.cleanName(a.text, 30); if (!text) return fail('leer'); }
          if (g.guess.wrong.some(w => AMU.U.norm(w) === AMU.U.norm(text))) return fail('schon versucht');
          doGuess(p, text);
          return { ok: true };
        }
      }
      return fail('unbekannt');
    }
    function addCluePublic(p, text, card) {
      g.clues.push({ id: p.id, text, round: g.round, card: card ? 1 : 0, t: g.t });
      p.st.clues++;
      emit('clue', { id: p.id, text, round: g.round }, 'all');
      nextTurn();
    }

    // ---------- Sicht ----------
    function viewFor(pid) {
      const me = byId(pid);
      const v = {
        kind: 'word', t: g.t, phase: g.phase, round: g.round, rounds: g.roundsTotal, variant: g.variant,
        left: g.phaseEnd ? Math.max(0, g.phaseEnd - g.t) : 0,
        roster: P.map(p => ({ id: p.id, n: p.name, look: p.look, sym: p.sym, bot: p.bot ? 1 : 0, out: p.ejected ? 1 : 0, conn: p.connected ? 1 : 0, voted: g.phase === 'vote' && g.votes[p.id] ? 1 : 0 })),
        order: g.order.slice(), turn: g.phase === 'clue' ? g.turnId || null : null, turnLeft: g.phase === 'clue' ? Math.max(0, g.turnEnd - g.t) : 0,
        clues: g.clues.map(c => ({ id: c.id, text: c.text, round: c.round, none: c.none ? 1 : 0 })),
        chat: g.chat.slice(-60).map(e => ({ id: e.id, text: e.text, q: e.q || null, target: e.target || null })),
        clueMode: g.settings.clueMode, catName: g.secret.catName, impostorCount: P.filter(p => p.role === 'impostor').length,
        guess: g.guess ? { id: g.guess.id, tries: g.guess.tries, wrong: g.guess.wrong.slice() } : null,
        result: g.result
      };
      if (me) {
        v.me = { id: me.id, card: cardFor(me), out: me.ejected ? 1 : 0, voted: g.votes[me.id] || null, ready: me.ready ? 1 : 0 };
        if (g.phase === 'clue' && g.turnId === me.id && g.settings.clueMode !== 'frei') v.me.opts = optionsFor(me);
        if (g.guess && g.guess.id === me.id) v.me.guessOpts = g.guess.opts.slice();
        // Zwei Imposter in der Kategorie-Variante kennen sich
        if (me.role === 'impostor' && g.variant === 'kategorie') v.me.mates = P.filter(p => p !== me && p.role === 'impostor').map(p => p.id);
      }
      return v;
    }
  }

  AMU.WordGame = { create, QUICK, clueOk, stems, pool };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.WordGame;
})(typeof window !== 'undefined' ? window : globalThis);
