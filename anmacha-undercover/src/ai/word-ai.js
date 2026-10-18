/* AnMaCha UNDERCOVER 3D – Bot-Logik für das Wortspiel. Bots kennen nur ihre eigene Karte (cardFor) und die öffentlichen Hinweise.
   Wissende: Hinweise aus dem Begriffsnetz des Worts (leicht = deutlich, schwer = subtil, damit Imposter nicht mitlesen).
   Imposter: schließen aus den Hinweisen auf Kandidatenwörter derselben Kategorie, bluffen passend oder allgemein und raten am Ende
   (auch falsch). Verdacht: wie gut passt jeder Hinweis zum eigenen Wort? Schwierigkeit ändert Deutung, Rauschen und Mut. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const N = s => AMU.U.norm(s).replace(/ /g, '');
  const REACT = [[2600, 5200], [1600, 3800], [1100, 2900]];
  const NOISE = [0.55, 0.3, 0.12];

  const LINES = {
    sus: ['Der Hinweis „{c}“ von {p} passt für mich überhaupt nicht.', '{p}, wie kommst du auf „{c}“?', '„{c}“ ist mir zu weit weg – {p} ist mir verdächtig.',
      'Ich tippe auf {p}. „{c}“ klingt geraten.', 'Ehrlich gesagt: {p} wirkt, als wüsste {p} das Wort nicht.', '{p} hat sehr allgemein geantwortet. Hmm.'],
    vague: ['{p}, „{c}“ ist ziemlich allgemein. Absicht?', '„{c}“ passt auf fast alles in der Kategorie, {p}.', 'Zu vorsichtig, {p}?'],
    safe: ['„{c}“ von {p} passt perfekt.', '{p} kennt das Wort – „{c}“ ist zu treffend.', 'Für {p} lege ich die Hand ins Feuer.'],
    def: ['Mein Hinweis passt genau, ich schwöre!', 'Ich wollte nur nicht zu viel verraten.', 'Ihr werdet sehen, ich bin sauber.', 'Ich bin es nicht – schaut lieber auf die anderen.'],
    unsure: ['Ich bin noch unsicher.', 'Schwierig diesmal … alle Hinweise passen irgendwie.', 'Mir fehlt noch ein Hinweis zum Entscheiden.', 'Lasst uns nicht vorschnell sein.'],
    agree: ['Sehe ich genauso.', 'Stimmt, das ist mir auch aufgefallen.', 'Ja, da ist was dran.'],
    none: ['{p} hat gar nichts gesagt – verdächtig!', 'Kein Hinweis von {p}? Das ist komisch.']
  };

  function Brain(g, p) {
    this.g = g; this.p = p; this.diff = p.diff; this.rng = g.rng.fork('wai' + p.seat);
    this.wait = 0; this.lastTurn = null; this.sus = {}; this.spoken = 0; this.voted = false; this.guessed = 0; this.lastUsed = null;
    this.D = AMU.WORDS_DE;
    this.selfSus = 0; this.recog = {};   // Alternativ-Variante: Ahnung, selbst der Imposter zu sein
  }
  Brain.prototype = {
    card() { return this.g.cardFor(this.p); },
    entryOf(w) { return w && this.D ? this.D.W.find(e => e.w === w) : null; },
    /** Kandidatenwörter (Kategorie) nach Übereinstimmung mit den bisherigen Hinweisen anderer bewerten */
    candidates() {
      const g = this.g, cat = g.secret.cat, D = this.D; if (!D) return [];
      const clues = g.clues.filter(c => c.id !== this.p.id && c.text).map(c => N(c.text));
      const list = D.W.filter(e => e.c === cat);
      return list.map(e => {
        const hs = e.h.map(N), ws = N(e.w), fs = (e.f || []).map(N);
        let sc = 0;
        clues.forEach(c => {
          // Nicht jede Verbindung fällt einem auf (Wissenslücke je Schwierigkeit, pro Bot fest)
          const key = c + '>' + e.w;
          if (this.recog[key] == null) this.recog[key] = this.rng.chance([0.45, 0.6, 0.75][this.diff]) ? 1 : 0;
          if (!this.recog[key]) return;
          if (hs.includes(c)) sc += 2;
          else if (hs.some(h => h.length >= 4 && c.length >= 4 && (h.startsWith(c.slice(0, 4)) || c.startsWith(h.slice(0, 4))))) sc += 1;
          if (c.length >= 4 && (ws.includes(c) || fs.some(f => f.includes(c)))) sc += 1;
        });
        return { e, sc: sc + this.rng.range(0, NOISE[this.diff] * 2) };
      }).sort((a, b) => b.sc - a.sc);
    },
    /** Vorsprung des Worts w vor dem nächstbesten Kategoriewort, gemessen an den öffentlichen Hinweisen (Sicht eines aufmerksamen Mitlesers) */
    leadOf(w) {
      const g = this.g, D = this.D; if (!D || !w) return 0;
      const clues = g.clues.filter(c => c.text).map(c => N(c.text));
      const sc = e => clues.reduce((a, c) => a + (e.h.map(N).includes(c) ? 2 : 0), 0);
      let mine = 0, other = 0;
      D.W.forEach(e => { if (e.c !== g.secret.cat) return; const v = sc(e); if (e.w === w) mine = v; else other = Math.max(other, v); });
      return mine - other;
    },
    /** Passt Hinweis c zum Wort w? 0 = sehr gut, 1 = gar nicht */
    fit(text, w) {
      if (!text) return 0.85;
      const c = N(text), e = this.entryOf(w), cat = this.D && this.D.CATS[this.g.secret.cat];
      if (e) {
        const hs = e.h.map(N);
        if (hs.includes(c)) return 0;
        if (hs.some(h => h.length >= 4 && c.length >= 4 && (h.startsWith(c.slice(0, 4)) || c.startsWith(h.slice(0, 4))))) return 0.15;
      }
      if (cat && cat.g.map(N).includes(c)) return 0.5;          // allgemeiner Kategoriebegriff
      // Andere Wörter derselben Kategorie: Begriff gehört zu einem anderen Wort → eher Bluff
      if (this.D && this.D.W.some(o => o.c === this.g.secret.cat && o.w !== w && o.h.map(N).includes(c))) return 0.75;
      return 0.62;   // unbekannt: kann ein kreativer Hinweis sein
    },
    myWord() { const c = this.card(); return c.word || null; },
    amImpostor() { const c = this.card(); return !!c.impostor || this.selfSus > 1.6; },
    // ---------------- Hinweise ----------------
    chooseClue() {
      const g = this.g, p = this.p, used = new Set(g.clues.map(c => N(c.text)));
      // Ein Imposter-Bot nennt nie zufällig das echte Wort (würde das Spiel sinnlos machen)
      const real = p.role === 'impostor' ? AMU.WordGame.stems(g.secret.entry, g.secret.word) : [];
      const forbid = s => used.has(N(s)) || !!AMU.WordGame.clueOk(s, this.forbidden().concat(real));
      const cat = this.D && this.D.CATS[g.secret.cat];
      if (!this.amImpostor()) {
        const e = this.entryOf(this.myWord()) || (this.myWord() === g.secret.word ? g.secret.entry : null);
        let hs = e ? e.h.slice() : [];
        // leicht: vorne (deutliche Hinweise), schwer: eher hintere/subtilere – manchmal bewusst vage gegen Mitleser
        if (this.diff === 2) hs = hs.slice(2).concat(hs.slice(0, 2));
        else if (this.diff === 1) hs = this.rng.shuffle(hs);
        const free = hs.filter(h => !forbid(h));
        // Ist das Wort aus den bisherigen Hinweisen schon klar erkennbar? Dann nichts mehr verschenken (Imposter liest mit).
        const lead = this.leadOf(this.myWord());
        if (cat && lead >= 3 && this.rng.chance([0.15, 0.3, 0.45][this.diff])) {
          const shared = free.filter(h => this.D.W.some(o => o.c === g.secret.cat && o.w !== this.myWord() && o.h.map(N).includes(N(h))));
          const gen = cat.g.filter(x => !forbid(x));
          const pick = shared.length && this.rng.chance(0.5) ? shared : gen;
          if (pick.length) return this.rng.pick(pick);
        }
        if (this.diff === 2 && cat && this.rng.chance(0.15)) { const gen = cat.g.filter(x => !forbid(x)); if (gen.length) return this.rng.pick(gen); }
        if (free.length) return this.diff === 0 ? free[0] : free[this.rng.int(Math.min(3, free.length))];
        const gen = cat ? cat.g.filter(x => !forbid(x)) : []; if (gen.length) return this.rng.pick(gen);
        return null;
      }
      // Imposter: aus den Hinweisen schließen
      const cand = this.candidates();
      const top = cand[0], second = cand[1];
      const confident = top && top.sc >= 2 && (!second || top.sc - second.sc >= [2.5, 1.5, 1][this.diff]);
      if (confident && this.rng.chance([0.3, 0.5, 0.65][this.diff])) {
        const opts = top.e.h.filter(h => !forbid(h) && !used.has(N(h)));
        if (opts.length) return this.rng.pick(opts);
      }
      // Halb-sicher: Begriff, der auf mehrere Top-Kandidaten passt; sonst allgemein
      if (top && top.sc >= 1 && this.diff >= 1) {
        const pool = cand.slice(0, 3).reduce((a, c) => a.concat(c.e.h), []).filter(h => !forbid(h));
        if (pool.length && this.rng.chance(0.6)) return this.rng.pick(pool);
      }
      const gen = cat ? cat.g.filter(x => !forbid(x)) : [];
      if (gen.length) return this.rng.pick(gen);
      return null;
    },
    forbidden() {
      const w = this.myWord(), out = [];
      if (w) AMU.WordGame.stems(this.entryOf(w) || (w === this.g.secret.word ? this.g.secret.entry : null), w).forEach(x => out.push(x));
      out.push(N(this.g.secret.catName));
      return out.filter(x => x.length >= 3);
    },
    // ---------------- Verdacht ----------------
    updateSus() {
      const g = this.g, w = this.myWord();
      g.players.forEach(o => {
        if (o === this.p) return;
        const cs = g.clues.filter(c => c.id === o.id);
        if (!cs.length) return;
        let s = 0; cs.forEach(c => { s += this.fit(c.text, w); });
        s = s / cs.length + this.rng.range(-NOISE[this.diff], NOISE[this.diff]) * 0.5;
        this.sus[o.id] = s;
      });
      // Alternativ-Variante: passen die Hinweise der anderen deutlich besser zu einem anderen Wort?
      if (g.variant === 'alternativ' && this.card().word && !this.card().impostor && this.diff >= 1) {
        const cand = this.candidates(), mine = cand.find(c => c.e.w === w), top = cand[0];
        if (top && mine && top.e.w !== w && top.sc - mine.sc >= 2) this.selfSus = Math.min(3, this.selfSus + 0.6);
      }
    },
    topSus(excl) {
      const g = this.g, mates = this.mates();
      const cands = g.players.filter(o => o !== this.p && g.alive(o) && !mates.includes(o.id) && !(excl || []).includes(o.id));
      cands.sort((a, b) => (this.sus[b.id] || 0.5) - (this.sus[a.id] || 0.5));
      return cands;
    },
    mates() { const v = this.g.viewFor(this.p.id); return (v.me && v.me.mates) || []; },
    // ---------------- Takt ----------------
    tick(dt) {
      const g = this.g, p = this.p;
      if (!g.alive(p) && g.phase !== 'guess') return;
      this.wait -= dt;
      if (g.phase === 'clue' && g.turnId === p.id) {
        if (this.lastTurn !== g.turnEnd) { this.lastTurn = g.turnEnd; const r = REACT[this.diff]; this.wait = this.rng.range(r[0], r[1]); }
        if (this.wait <= 0) {
          this.updateSus();
          let c = this.chooseClue();
          let r = c ? g.act(p.id, { a: 'clue', text: c }) : { ok: false };
          if (!r.ok) { const opts = g.optionsFor(p); if (opts.length) r = g.act(p.id, { a: 'clue', card: 0 }); }
          if (!r.ok) this.wait = 99999;   // nichts Passendes: Zeit läuft ab (kein Hinweis)
        }
        return;
      }
      if (g.phase === 'discuss') {
        if (this.wait > 0) return;
        this.wait = this.rng.range(2500, 6000) + (2 - this.diff) * 800;
        this.updateSus();
        if (this.spoken >= 2 + this.diff) { g.act(p.id, { a: 'ready' }); return; }
        this.say();
        return;
      }
      if (g.phase === 'vote') {
        if (this.voted === g.voteN) return;
        if (this.wait > 0 && this.wait < 99999) return;
        if (!this.voteWait) { this.voteWait = true; this.wait = this.rng.range(1500, 5500); return; }
        this.voteWait = false;
        this.updateSus();
        const r = g.act(p.id, { a: 'vote', target: this.chooseVote() });
        this.voted = g.voteN; this.spoken = 0;
        if (!r.ok) g.act(p.id, { a: 'vote', target: 'skip' });
        return;
      }
      if (g.phase === 'guess' && g.guess && g.guess.id === p.id) {
        if (this.wait > 0 && this.wait < 99999) return;
        if (!this.guessWait) { this.guessWait = true; this.wait = this.rng.range(2500, 6000); return; }
        this.guessWait = false;
        const opts = g.guess.opts.filter(w => !g.guess.wrong.includes(w));
        // Raten aus den eigenen Schlüssen; leichte Bots greifen öfter daneben
        const sc = this.candidates().filter(c => opts.includes(c.e.w));
        // Sicherheit wächst mit dem Vorsprung des Favoriten, bleibt aber begrenzt (Bots können falsch raten)
        const margin = sc.length > 1 ? sc[0].sc - sc[1].sc : sc.length ? sc[0].sc : 0;
        const conf = Math.min([0.22, 0.32, 0.45][this.diff], 0.1 + 0.04 * margin);
        let pick = sc.length && this.rng.chance(conf) ? sc[0].e.w : this.rng.pick(sc.length > 1 ? sc.slice(1, 4).map(c => c.e.w) : opts);
        g.act(p.id, { a: 'guess', opt: g.guess.opts.indexOf(pick) });
      }
    },
    say() {
      const g = this.g, p = this.p, imp = this.amImpostor();
      const name = id => { const o = g.byId(id); return o ? o.name : '?'; };
      const clueOf = id => { const c = g.clues.filter(x => x.id === id).slice(-1)[0]; return c ? c.text : ''; };
      const fill = (t, id) => t.replace(/\{p\}/g, name(id)).replace(/\{c\}/g, clueOf(id));
      // jemand hat mich beschuldigt → verteidigen
      const accused = g.chat.slice(-6).some(e => e.target === p.id && (e.claim === 'accuse' || e.q === 'sus'));
      let text, target = null, claim = 'none';
      if (accused && this.rng.chance(0.7)) { text = this.rng.pick(LINES.def); claim = 'deny'; }
      else {
        const order = this.topSus();
        let t = order[0];
        if (imp) {
          // Imposter lenken: Mitläufer (dem Chat folgen) oder den schwächsten Wissenden beschuldigen
          const chatT = g.chat.slice(-8).filter(e => e.claim === 'accuse' && e.target && e.target !== p.id && !this.mates().includes(e.target)).map(e => e.target);
          if (chatT.length && this.rng.chance(0.6)) t = g.byId(chatT[chatT.length - 1]);
        }
        const sv = t ? (this.sus[t.id] || 0.5) : 0;
        const noClue = t && !clueOf(t.id) && g.clues.some(c => c.id === t.id && c.none);
        if (t && noClue) { text = fill(this.rng.pick(LINES.none), t.id); target = t.id; claim = 'accuse'; }
        else if (t && sv > 0.55 + (2 - this.diff) * 0.05) { text = fill(this.rng.pick(sv > 0.7 ? LINES.sus : LINES.vague), t.id); target = t.id; claim = 'accuse'; }
        else {
          const safe = order.slice().reverse()[0];
          if (safe && (this.sus[safe.id] || 0.5) < 0.2 && this.rng.chance(0.5)) { text = fill(this.rng.pick(LINES.safe), safe.id); target = safe.id; claim = 'vouch'; }
          else {
            const last = g.chat.slice(-1)[0];
            if (last && last.id !== p.id && last.claim === 'accuse' && last.target && last.target !== p.id && (this.sus[last.target] || 0.5) > 0.5) { text = this.rng.pick(LINES.agree); target = last.target; claim = 'accuse'; }
            else text = this.rng.pick(LINES.unsure);
          }
        }
      }
      if (text === this.lastUsed) text = this.rng.pick(LINES.unsure);
      this.lastUsed = text;
      const r = g.act(p.id, { a: 'chat', text, target, claim });
      if (r.ok) this.spoken++;
    },
    chooseVote() {
      const g = this.g, p = this.p, imp = this.amImpostor(), order = this.topSus();
      if (!order.length) return 'skip';
      // Chat-Beschuldigungen anderer fließen ein (Mitte/schwer gewichten nach eigener Einschätzung)
      const talk = {};
      g.chat.forEach(e => { if (e.target && e.id !== p.id) talk[e.target] = (talk[e.target] || 0) + (e.claim === 'accuse' ? 1 : e.claim === 'vouch' ? -0.6 : 0); });
      const score = o => (this.sus[o.id] || 0.5) * 2 + Math.max(-1.2, Math.min(2, talk[o.id] || 0)) * [0.3, 0.18, 0.1][this.diff] + this.rng.range(0, NOISE[this.diff]);
      const ranked = order.slice().sort((a, b) => score(b) - score(a));
      if (imp) {
        // nicht immer dieselbe Person: Mitläufer zur Mehrheit, sonst zufällig unter den Top 2
        return (this.rng.chance(0.6) ? ranked[0] : this.rng.pick(ranked.slice(0, 2))).id;
      }
      const best = ranked[0];
      if (score(best) < 1.05 && this.diff >= 1 && !g.extraUsed && this.rng.chance(0.5)) return 'skip';
      return best.id;
    }
  };
  AMU.WordAI = { create: (g, p) => new Brain(g, p), LINES };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.WordAI;
})(typeof window !== 'undefined' ? window : globalThis);
