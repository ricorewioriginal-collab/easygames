/* SHOW ME YOUR VOICE – Spiellogik ohne Oberfläche: Bewertung, Jury, Votes, Top-X, Battles, Staffel, Training, Speicherstand.
   Alles deterministisch (gesäter Zufall), damit Ergebnisse nachvollziehbar und testbar sind. */
(function (root) {
  'use strict';
  const D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : root.SMYV_DATA;
  const CK = ['timing', 'stimme', 'ausdruck', 'praesenz', 'mut', 'entwicklung'];
  const TRAINABLE = ['timing', 'stimme', 'ausdruck', 'praesenz'];
  const DIFF = { leicht: -7, normal: 0, schwer: 6 };
  const clamp = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 100 : b, v));
  const r1 = v => Math.round(v * 10) / 10;

  function rng(seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hash(str) {
    let h = 2166136261 >>> 0; str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  const pick = (arr, R) => arr[Math.floor(R() * arr.length) % arr.length];
  const cand = id => D.CANDIDATES.find(c => c.id === id);

  // ---------- Profil ----------
  function cleanName(n) {
    n = String(n == null ? '' : n).replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
    return n || 'Newcomer';
  }
  function newProfile(name, look) {
    return { name: cleanName(name), look: Object.assign({}, look || {}),
      attrs: { timing: 40, stimme: 40, ausdruck: 40, praesenz: 40 }, fans: 25, xp: 0,
      stats: { seasons: 0, wins: 0, finals: 0, castings: 0, performances: 0, bestPerf: 0 }, ach: [] };
  }
  const level = xp => Math.floor(Math.sqrt(Math.max(0, xp || 0) / 60)) + 1;
  function unlock(profile, id, list) {
    if (!profile.ach.includes(id)) { profile.ach.push(id); if (list) list.push(id); }
  }

  // ---------- Staffel ----------
  function newSeason(seed, difficulty, jury) {
    seed = (seed >>> 0) || 1;
    const R = rng(seed ^ 0x5bd1e995);
    const order = ['p'].concat(D.CANDIDATES.map(c => c.id));
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
    return { v: 1, seed, diff: DIFF[difficulty] != null ? difficulty : 'normal', round: 0, order, field: order.slice(),
      status: 'backstage', results: [], golden: false, trainLeft: 2, commLeft: 1, lastPerf: null, aiLast: {},
      lastRank: null, outAt: {}, motto: Math.floor(R() * D.MOTTOS.length), playing: null, place: 0, jury: jury === 'fest' ? 'fest' : 'wechsel' };
  }
  // Auftritt beginnen: einmalige Kennung, damit ein Ergebnis nur einmal verarbeitet wird.
  function startRound(season) {
    if (!season || season.status !== 'backstage') return null;
    season.playing = { round: season.round, id: hash(season.seed + ':' + season.round + ':' + Date.now()) };
    season.status = 'playing';
    return season.playing.id;
  }
  // Auftritt abgebrochen (z. B. Seite neu geladen): zurück in den Backstage, Runde unverändert.
  function cancelRound(season) {
    if (season && season.status === 'playing') { season.status = 'backstage'; season.playing = null; }
  }

  // ---------- Bewertung des eigenen Auftritts ----------
  // raw: { rhythm:{n,p,g,o,m,maxCombo}|null, pitch:{q}|null, show:{hit,total}|null, rhythmShare, approach, action, style }
  function analyze(raw, attrs, lastPerf, mods) {
    const a = D.APPROACH[raw.approach] || D.APPROACH.gefuehl, act = D.ACTION[raw.action] || D.ACTION.fokus;
    const rh = raw.rhythm && raw.rhythm.n > 0 ? raw.rhythm : null, n = rh ? rh.n : 0;
    const acc = rh ? (rh.p + 0.7 * rh.g + 0.4 * rh.o) / n : null;
    const hit = rh ? (rh.p + rh.g + rh.o) / n : null;
    const perfR = rh ? rh.p / n : null;
    const combo = rh ? Math.min(1, rh.maxCombo / n) : null;
    const q = raw.pitch ? clamp(raw.pitch.q, 0, 1) : null;
    const sh = raw.show && raw.show.total > 0 ? raw.show.hit / raw.show.total : null;
    const rs = acc != null ? 100 * (0.75 * acc + 0.25 * combo) : null, ps = q != null ? 100 * q : null;
    const share = raw.rhythmShare == null ? 0.6 : clamp(raw.rhythmShare, 0, 1);
    let perf = rs != null && ps != null ? rs * share + ps * (1 - share) : (rs != null ? rs : (ps != null ? ps : 0));
    if (sh != null) perf += (sh - 0.5) * 8;
    const main = acc != null ? acc : (q || 0);
    const mult = raw.approach === 'sicher' ? 0.95 : raw.approach === 'risiko' ? (main >= 0.7 ? 1.08 : 0.94) : 1;
    perf = clamp(perf * mult);
    const c = {};
    c.timing = (acc != null ? 100 * (0.55 * perfR + 0.45 * hit) : 90 * (q || 0)) + (act.timing || 0);
    c.stimme = q != null ? (acc != null ? 100 * (0.6 * q + 0.4 * acc) : 100 * q) : 95 * acc;
    c.ausdruck = 100 * (0.5 * main + 0.5 * (combo != null ? combo : (q || 0))) + a.ausdruck;
    c.praesenz = (sh != null ? 100 * (0.6 * sh + 0.4 * main) : 80 * main) + act.praesenz;
    c.mut = 0.8 * (a.mut + act.mut) + 20 * main;
    c.entwicklung = lastPerf == null ? 60 : 60 + (perf - lastPerf) * 1.5;
    TRAINABLE.forEach(k => { c[k] = 0.85 * c[k] + 0.15 * (attrs && attrs[k] != null ? attrs[k] : 40); });
    if (mods && mods.crit) for (const k in mods.crit) if (k in c) c[k] += +mods.crit[k] || 0;   // Backstage-Ereignisse
    CK.forEach(k => { c[k] = r1(clamp(c[k])); });
    return { perf: r1(perf), crit: c, acc, q, sh, mult };
  }

  // ---------- Jury ----------
  // symp: Sympathie aus Jury-Gespräch/Ereignissen je Juror (höchstens ±4, wird angezeigt)
  // Jury einer Runde: Casting immer Stammjury (Marc, Lena, David). Danach bei „Wechselnder Jury“ drei aus dem Pool,
  // mindestens eine Person der Stammjury; fest pro Staffel und Runde (Seed), also für alle Kandidaten gleich.
  function panelOf(season, round) {
    if (!season || season.jury !== 'wechsel' || !round) return D.MAIN_JURY.slice();
    const R = rng(hash(season.seed + ':panel:' + round));
    const main = D.MAIN_JURY[Math.floor(R() * D.MAIN_JURY.length)];
    const rest = D.JURY.map(j => j.id).filter(id => id !== main);
    for (let i = rest.length - 1; i > 0; i--) { const k = Math.floor(R() * (i + 1)); const t = rest[i]; rest[i] = rest[k]; rest[k] = t; }
    return [main].concat(rest.slice(0, 2));
  }
  function judge(crit, style, seed, round, who, symp, panel) {
    return (panel || D.MAIN_JURY).map(id => D.JURY.find(j => j.id === id)).filter(Boolean).map(j => {
      let s = 0; for (const k in j.w) s += j.w[k] * (crit[k] || 0);
      const R = rng(hash(seed + ':' + round + ':' + j.id + ':' + who));
      const mood = r1(R() * 6 - 3);                         // Tagesform: höchstens ±3 Punkte, wird angezeigt
      const fav = (D.STYLES[style] && D.STYLES[style].fav === j.id) || (j.favs || []).includes(style) ? 3 : 0;
      const sy = clamp(+(symp && symp[j.id]) || 0, -4, 4);
      const score = r1(clamp(s + mood + fav + sy));
      const yes = score >= j.need;
      const tier = score >= 86 ? 'top' : yes ? 'yes' : score >= j.need - 8 ? 'close' : 'no';
      return { id: j.id, score, yes, tier, mood, fav, sy };
    });
  }
  // Kommentar eines Jurors: stärkstes/schwächstes seiner Kriterien einsetzen.
  // Zugabe a cappella: Bei genau einem Ja darf der Kandidat noch einmal singen. Ab 70 % auf der Linie
  // wechselt der Juror mit der höchsten Nein-Wertung zu Ja.
  function encoreFlip(jury, q) {
    if (q == null || jury.filter(j => j.yes).length !== 1 || q < 0.7) return false;
    const k = jury.filter(j => !j.yes).sort((a, b) => b.score - a.score)[0];
    k.yes = true; k.encore = true; k.tier = 'yes';
    return true;
  }
  function comment(jurorId, verdict, crit, name, seed) {
    const j = D.JURY.find(x => x.id === jurorId); if (!j) return '';
    const keys = Object.keys(j.w).sort((a, b) => (crit[b] || 0) - (crit[a] || 0));
    const R = rng(hash(seed + ':c:' + jurorId + ':' + verdict.score));
    return pick(j.lines[verdict.tier], R).replace('{n}', name).replace('{s}', D.CRIT[keys[0]]).replace('{w}', D.CRIT[keys[keys.length - 1]]);
  }

  // ---------- KI-Kandidaten ----------
  function aiPerf(season, c, round) {
    const R = rng(hash(season.seed + ':ai:' + round + ':' + c.id));
    const v = c.skill + DIFF[season.diff] + round * 0.8 + (R() * 2 - 1) * c.cons;
    const perf = r1(clamp(v, 5, 99)), crit = {};
    CK.forEach(k => { crit[k] = r1(clamp(perf + (c.crit[k] || 0) + (R() * 6 - 3))); });
    const last = season.aiLast[c.id];
    crit.entwicklung = r1(clamp(last == null ? 60 : 60 + (perf - last) * 1.5));
    return { perf, crit, votesRaw: c.fans * 0.5 + perf * 0.5 + R() * 6 };
  }

  // ---------- Rangfolge (Gesamt, dann Performance, dann Jury, dann Startnummer) ----------
  function rank(entries) {
    return entries.slice().sort((a, b) => b.total - a.total || b.perf - a.perf || b.juryAvg - a.juryAvg || a.startNo - b.startNo);
  }

  // ---------- Runde auswerten ----------
  // outcome: Ergebnis von analyze() plus { style, approach, action }. Gibt null zurück, wenn kein Auftritt läuft
  // oder die Kennung nicht passt (verhindert doppelte Verarbeitung).
  function resolveRound(season, profile, outcome, playId) {
    if (!season || season.status !== 'playing' || !season.playing || season.playing.round !== season.round) return null;
    if (playId != null && season.playing.id !== playId) return null;
    const idx = season.round, def = D.ROUNDS[idx], w = def.w || { perf: 0.5, jury: 0.3, votes: 0.2 }, panel = panelOf(season, idx);
    const newAch = [];
    const entries = season.field.map(id => {
      let perf, crit, votesRaw, style, name;
      if (id === 'p') {
        perf = outcome.perf; crit = outcome.crit; style = outcome.style; name = profile.name;
        const act = D.ACTION[outcome.action] || {};
        votesRaw = profile.fans * 0.5 + perf * 0.5 + (outcome.sh != null ? outcome.sh * 6 : 0) + (act.votes || 0) + (outcome.votesBonus || 0);
      } else {
        const c = cand(id), a = aiPerf(season, c, idx);
        perf = a.perf; crit = a.crit; votesRaw = a.votesRaw; style = c.style; name = c.name;
      }
      const jury = judge(crit, style, season.seed, idx, id, id === 'p' ? outcome.symp : null, panel);
      if (id === 'p' && def.id === 'casting' && outcome.encore != null) { jury.encoreTried = true; jury.encoreOk = encoreFlip(jury, outcome.encore); }
      const juryAvg = r1(jury.reduce((s, j) => s + j.score, 0) / jury.length);
      return { id, name, perf, crit, jury, juryAvg, yes: jury.filter(j => j.yes).length, votesRaw, startNo: season.order.indexOf(id) + 1 };
    });
    const maxV = Math.max.apply(null, entries.map(e => e.votesRaw)), sumV = entries.reduce((s, e) => s + e.votesRaw, 0);
    entries.forEach(e => {
      e.votes = r1(100 * e.votesRaw / maxV);
      e.share = r1(100 * e.votesRaw / sumV);
      e.total = r1(w.perf * e.perf + w.jury * e.juryAvg + w.votes * e.votes);
    });
    const ranked = rank(entries); ranked.forEach((e, i) => { e.rank = i + 1; });
    const me = entries.find(e => e.id === 'p');
    const res = { round: idx, id: def.id, name: def.name, panel, entries: ranked, advanced: [], out: [], golden: false, battle: null, place: 0, ach: newAch,
      encore: me && me.jury.encoreTried ? !!me.jury.encoreOk : null };

    if (def.id === 'casting') {
      ranked.forEach(e => { if (e.yes >= 2) res.advanced.push(e.id); });
      if (me && me.yes === 1 && me.perf >= 55 && !season.golden) { res.golden = true; season.golden = true; res.advanced.push('p'); }
    } else if (def.battle) {
      // Paarungen nach der Rangfolge der Vorrunde: 1 gegen letzter, 2 gegen vorletzter …
      const prev = (season.lastRank || []).filter(id => season.field.includes(id));
      season.field.forEach(id => { if (!prev.includes(id)) prev.push(id); });
      const pairs = [], losers = [];
      for (let i = 0; i < Math.floor(prev.length / 2); i++) {
        const A = entries.find(e => e.id === prev[i]), B = entries.find(e => e.id === prev[prev.length - 1 - i]);
        const votes = panel.map((j, k) => {
          const sa = A.jury[k].score, sb = B.jury[k].score;
          return sa > sb || (sa === sb && A.perf >= B.perf) ? A.id : B.id;
        });
        const aWins = votes.filter(v => v === A.id).length >= 2;
        const win = aWins ? A : B, lose = aWins ? B : A;
        pairs.push({ a: A.id, b: B.id, votes, winner: win.id });
        res.advanced.push(win.id); losers.push(lose);
      }
      if (prev.length % 2) res.advanced.push(prev[Math.floor(prev.length / 2)]);
      losers.sort((x, y) => y.votes - x.votes || y.perf - x.perf || x.startNo - y.startNo);
      const saved = losers.length ? losers[0].id : null;
      if (saved) res.advanced.push(saved);
      res.battle = { pairs, saved };
    } else if (def.final) {
      res.advanced = ranked.map(e => e.id);
      res.place = me ? me.rank : 0;
    } else {
      res.advanced = ranked.slice(0, Math.min(def.topX, ranked.length)).map(e => e.id);
    }
    res.out = season.field.filter(id => !res.advanced.includes(id));
    if (!season.outAt) season.outAt = {};
    res.out.forEach(id => { season.outAt[id] = idx; });
    const inNext = res.advanced.includes('p');

    // Staffel fortschreiben
    season.field = ranked.map(e => e.id).filter(id => res.advanced.includes(id));
    season.lastRank = ranked.map(e => e.id);
    entries.forEach(e => { if (e.id !== 'p') season.aiLast[e.id] = e.perf; });
    season.lastPerf = me ? me.perf : season.lastPerf;
    season.results.push({ round: idx, perf: me ? me.perf : 0, total: me ? me.total : 0, rank: me ? me.rank : 0, of: entries.length, advanced: inNext, golden: res.golden });
    season.playing = null; season.mods = null;
    if (def.final) { season.status = 'done'; season.place = res.place; }
    else if (!inNext) season.status = 'out';
    else { season.status = 'backstage'; season.round = idx + 1; season.trainLeft = 2; season.commLeft = 1; }

    // Profil
    if (me) {
      profile.stats.performances++;
      profile.stats.bestPerf = Math.max(profile.stats.bestPerf, me.perf);
      profile.fans = Math.round(clamp(profile.fans + (me.perf - 50) / 8 + (outcome.sh != null ? outcome.sh * 2 : 0), 0, 100));
      profile.xp += Math.round(me.perf / 2) + (inNext ? 20 : 5);
      if (ranked.slice().sort((x, y) => y.votesRaw - x.votesRaw)[0].id === 'p') unlock(profile, 'herz', newAch);
      if (def.id === 'casting' && inNext) { profile.stats.castings++; unlock(profile, 'talent', newAch); }
      if (def.id === 'motto' && inNext) unlock(profile, 'krone', newAch);
      if (def.id === 'halbfinale' && inNext) { profile.stats.finals++; unlock(profile, 'durchhalter', newAch); }
      if (outcome.q != null && outcome.q >= 0.9) unlock(profile, 'stimme', newAch);
      if (def.final) { profile.stats.seasons++; if (res.place === 1) { profile.stats.wins++; unlock(profile, 'sieger', newAch); } }
      else if (!inNext) profile.stats.seasons++;
    }
    return res;
  }

  // ---------- Online-Show (mehrere Geräte): Runden und Wertung, gerechnet vom Gastgeber ----------
  // Casting (2 von 3 Ja, mindestens zwei kommen weiter), Live-Shows (die besten 60 %), Finale ab höchstens drei.
  const ONLINE = {
    casting: { id: 'casting', name: 'Casting', icon: '🎤', parts: ['rhythm'], len: 30, w: { perf: 0.5, jury: 0.5, votes: 0 } },
    recall: { id: 'recall', name: 'Recall', icon: '🔁', parts: ['rhythm', 'pitch'], len: 22, w: { perf: 0.5, jury: 0.4, votes: 0.1 } },
    live: { id: 'live', name: 'Live-Show', icon: '🎭', parts: ['rhythm', 'pitch'], len: 22, w: { perf: 0.5, jury: 0.3, votes: 0.2 } },
    finale: { id: 'finale', name: 'Finale', icon: '👑', parts: ['rhythm', 'pitch', 'rhythm'], len: 20, final: true, w: { perf: 0.4, jury: 0.3, votes: 0.3 } }
  };
  function onlineDef(round, fieldSize) {
    if (!round) return ONLINE.casting;
    if (round === 1) return ONLINE.recall;   // nach dem Casting immer erst der Recall
    return fieldSize <= 3 ? ONLINE.finale : Object.assign({}, ONLINE.live, { name: 'Live-Show ' + (round - 1) });
  }
  // entries: [{ id, name, perf, crit, style, votesN }] in Startreihenfolge. Fehlende Auftritte zählen 0.
  function onlineResolve(o) {
    const def = o.def, w = def.w, panel = o.panel || D.MAIN_JURY;
    const maxV = Math.max(0, ...o.entries.map(e => e.votesN || 0));
    const list = o.entries.map((e, i) => {
      const crit = {}; CK.forEach(k => { crit[k] = clamp(+(e.crit && e.crit[k]) || 0); });
      const perf = r1(clamp(+e.perf || 0));
      const jury = judge(crit, e.style || 'pop', o.seed, o.round, e.id, null, panel);
      const juryAvg = r1(jury.reduce((s, j) => s + j.score, 0) / jury.length);
      const votes = maxV ? r1(100 * (e.votesN || 0) / maxV) : 0;
      return { id: e.id, name: e.name, perf, jury, juryAvg, yes: jury.filter(j => j.yes).length, votesN: e.votesN || 0, votes,
        total: r1(w.perf * perf + w.jury * juryAvg + w.votes * votes), startNo: i + 1, missing: !!e.missing };
    });
    const ranked = rank(list); ranked.forEach((e, i) => { e.rank = i + 1; });
    let advanced = [], rescued = [];
    if (def.final) advanced = ranked.map(e => e.id);
    else if (def.id === 'casting') {
      advanced = ranked.filter(e => e.yes >= 2 && !e.missing).map(e => e.id);
      for (const e of ranked) { if (advanced.length >= Math.min(2, ranked.length)) break; if (!advanced.includes(e.id)) { advanced.push(e.id); rescued.push(e.id); } }
    } else advanced = ranked.slice(0, Math.max(2, Math.ceil(ranked.length * 0.6))).map(e => e.id);
    return { round: o.round, def, panel, entries: ranked, advanced, rescued, out: ranked.filter(e => !advanced.includes(e.id)).map(e => e.id), final: !!def.final };
  }

  // Freies Casting: nur Jury, keine Staffel.
  function freeCasting(profile, outcome, seed) {
    const jury = judge(outcome.crit, outcome.style, seed, 0, 'p', outcome.symp);
    const enc = outcome.encore != null ? encoreFlip(jury, outcome.encore) : null;
    const yes = jury.filter(j => j.yes).length;
    return { jury, yes, pass: yes >= 2, encore: enc, juryAvg: r1(jury.reduce((s, j) => s + j.score, 0) / 3) };
  }

  // ---------- Freies Vorsingen ----------
  // frames: [{ m: MIDI-Tonhöhe | null, l: Pegel (RMS) }] im Abstand dt Sekunden. Kein Song als Vorgabe:
  // Intonation zählt relativ zur eigenen Tonart (gemeinsame Verschiebung wird herausgerechnet).
  function singScore(frames, attrs, dt) {
    dt = dt > 0 ? dt : 0.05;
    const fr = Array.isArray(frames) ? frames.filter(f => f && typeof f === 'object') : [];
    const okM = m => Number.isFinite(m) && m > 24 && m < 108;
    const v = fr.filter(f => okM(f.m)), voiced = v.length * dt, total = fr.length * dt;
    // gehaltene Töne: Weicht die Tonhöhe mehr als 0,6 Halbtöne vom Anfang des Tons ab, beginnt ein neuer Ton.
    // So zählt Rutschen durch viele Töne nicht als ein sauber gehaltener Ton.
    const segs = []; let cur = null, anchor = 0;
    fr.forEach(f => {
      if (!okM(f.m)) { cur = null; return; }
      if (!cur || Math.abs(f.m - anchor) > 0.6) { cur = []; segs.push(cur); anchor = f.m; }
      cur.push(f.m);
    });
    const notes = segs.filter(s => s.length >= 3);
    const sorted = a => a.slice().sort((x, y) => x - y), q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
    const centers = notes.map(s => q(sorted(s), 0.5));
    let sx = 0, sy = 0; centers.forEach(c => { sx += Math.cos(2 * Math.PI * c); sy += Math.sin(2 * Math.PI * c); });
    const off = Math.atan2(sy, sx) / (2 * Math.PI);
    const dev = centers.length ? centers.reduce((s, c) => { const x = c - off; return s + Math.abs(x - Math.round(x)); }, 0) / centers.length * 100 : 50;
    let ds = 0, dd = 0, dn = 0;   // Wackeln von Bild zu Bild und Abweichung von der Mitte des Tons
    notes.forEach((s, k) => { for (let i = 1; i < s.length; i++) { ds += Math.abs(s[i] - s[i - 1]); dd += Math.abs(s[i] - centers[k]); dn++; } });
    const ms = sorted(v.map(f => f.m)), low = ms.length ? q(ms, 0.1) : 0, high = ms.length ? q(ms, 0.9) : 0;
    const db = v.map(f => 20 * Math.log10(Math.max(1e-4, +f.l || 0)));
    const dbAvg = db.length ? db.reduce((a, b) => a + b, 0) / db.length : 0;
    const dbSd = db.length ? Math.sqrt(db.reduce((a, b) => a + (b - dbAvg) * (b - dbAvg), 0) / db.length) : 0;
    const st = {
      inton: r1(clamp(110 - dev * 3)), stab: dn ? r1(clamp(100 * (1 - ds / dn / 0.8 - dd / dn / 0.5))) : 0,
      range: r1(clamp((high - low) / 14 * 100)), dyn: r1(clamp(dbSd / 6 * 100)), presence: total ? r1(clamp(voiced / total * 130)) : 0,
      cents: Math.round(dev), semis: r1(high - low), low: Math.round(low), high: Math.round(high), voiced: r1(voiced), total: r1(total), notes: notes.length };
    const c = {
      stimme: 0.6 * st.inton + 0.4 * st.stab, ausdruck: 0.6 * st.dyn + 0.4 * st.range, praesenz: st.presence,
      timing: 0.5 * st.stab + 0.5 * st.presence, mut: 0.4 * st.range + 0.3 * st.dyn + 30 * Math.min(1, voiced / 20), entwicklung: 60 };
    TRAINABLE.forEach(k => { c[k] = 0.85 * c[k] + 0.15 * (attrs && attrs[k] != null ? attrs[k] : 40); });
    CK.forEach(k => { c[k] = r1(clamp(c[k])); });
    let perf = 0.35 * st.inton + 0.2 * st.stab + 0.15 * st.range + 0.15 * st.dyn + 0.15 * st.presence;
    if (voiced < 5) perf *= voiced / 5;      // kaum gesungen: kaum Punkte
    return { perf: r1(clamp(perf)), crit: c, mult: 1, sing: st };
  }

  // Genre-Challenge: ★ = Jury sagt Ja (2 von 3), ★★ = dazu das Genre-Ziel, ★★★ = dazu mindestens 80 Punkte.
  function singStars(genreId, res, fc) {
    const g = D.KARAOKE.find(x => x.id === genreId);
    if (!fc || !fc.pass) return 0;
    if (!g || !res || !res.sing || !(res.sing[g.goal.k] >= g.goal.min)) return 1;
    return res.perf >= 80 ? 3 : 2;
  }

  // ---------- Training ----------
  function trainGain(cur, quality) { return Math.max(0, Math.round(7 * clamp(quality, 0, 1) * (1 - cur / 110))); }
  function applyTraining(profile, attr, quality) {
    if (!profile || !(attr in profile.attrs)) return 0;
    const g = trainGain(profile.attrs[attr], quality);
    profile.attrs[attr] = Math.min(100, profile.attrs[attr] + g);
    profile.xp += Math.round(10 * clamp(quality, 0, 1));
    return g;
  }
  function applyCommunity(season, profile, id) {
    const c = D.COMMUNITY.find(x => x.id === id);
    if (!c || !season || season.status !== 'backstage' || season.commLeft < 1) return false;
    if (c.train && season.trainLeft + c.train < 0) return false;
    season.commLeft--;
    if (c.train) season.trainLeft += c.train;
    profile.fans = Math.min(100, profile.fans + c.fans);
    if (c.attr) for (const k in c.attr) profile.attrs[k] = Math.min(100, profile.attrs[k] + c.attr[k]);
    return true;
  }

  // ---------- Backstage-Ereignisse ----------
  function rollEvent(season) {
    if (!season || season.status !== 'backstage' || season.round < 1 || season.eventRound === season.round) return null;
    return D.EVENTS[hash(season.seed + ':ev:' + season.round) % D.EVENTS.length];
  }
  function applyEvent(season, profile, choice) {
    const ev = rollEvent(season); if (!ev) return null;
    const a = ev.a[choice]; if (!a) return null;
    season.eventRound = season.round;
    if (a.train) season.trainLeft = Math.max(0, Math.min(3, season.trainLeft + a.train));
    if (a.fans) profile.fans = Math.min(100, profile.fans + a.fans);
    if (a.attr) for (const k in a.attr) profile.attrs[k] = Math.min(100, profile.attrs[k] + a.attr[k]);
    if (a.symp || a.crit) {
      season.mods = season.mods || { symp: {}, crit: {} };
      for (const k in a.symp || {}) season.mods.symp[k] = (season.mods.symp[k] || 0) + a.symp[k];
      for (const k in a.crit || {}) season.mods.crit[k] = (season.mods.crit[k] || 0) + a.crit[k];
    }
    return { ev, a };
  }
  // Sympathie zusammenführen (Gespräch + Ereignis)
  function mergeSymp() {
    const out = {};
    for (let i = 0; i < arguments.length; i++) { const m = arguments[i]; if (m) for (const k in m) out[k] = (out[k] || 0) + m[k]; }
    return out;
  }

  // ---------- Bonus-Challenge ----------
  function bonusScore(parts) {
    let s = 0;
    parts.forEach(p => {
      if (p.type === 'rhythm') s += p.p * 100 + p.g * 60 + p.o * 25 + p.maxCombo * 15;
      else if (p.type === 'pitch') s += Math.round(p.q * 4000);
      else if (p.type === 'cues') s += p.points || 0;
    });
    return Math.round(s * (1 + Math.min(10, parts.reduce((t, p) => t + (p.stars || 0), 0)) * 0.1));
  }

  // ---------- Speicherstand ----------
  const DEF_SETTINGS = { source: 'radio', jury: 'wechsel', music: 0.7, sfx: 0.8, mute: false, mic: false, range: 'mittel', speed: 'normal', offset: 0,
    difficulty: 'normal', reduced: false, big: false, cb: false, captions: true };
  function freshSave() { return { v: 1, profile: null, season: null, settings: Object.assign({}, DEF_SETTINGS), best: 0, wins: 0, tutorial: false, singCh: {} }; }
  function repair(s) {
    const f = freshSave();
    if (!s || typeof s !== 'object' || s.v !== 1) return f;
    const out = Object.assign(f, { best: +s.best || 0, wins: +s.wins || 0, tutorial: !!s.tutorial });
    if (s.singCh && typeof s.singCh === 'object') D.KARAOKE.forEach(g => { const c = s.singCh[g.id];
      if (c && typeof c === 'object') out.singCh[g.id] = { best: clamp(+c.best || 0), stars: Math.max(0, Math.min(3, Math.round(+c.stars) || 0)) }; });
    out.settings = Object.assign({}, DEF_SETTINGS, s.settings && typeof s.settings === 'object' ? s.settings : {});
    const p = s.profile;
    if (p && typeof p === 'object' && typeof p.name === 'string' && p.attrs && typeof p.attrs === 'object') {
      const np = newProfile(p.name, p.look);
      TRAINABLE.forEach(k => { if (isFinite(p.attrs[k])) np.attrs[k] = clamp(+p.attrs[k]); });
      np.fans = isFinite(p.fans) ? clamp(+p.fans) : 25; np.xp = isFinite(p.xp) ? Math.max(0, +p.xp) : 0;
      if (p.stats) for (const k in np.stats) if (isFinite(p.stats[k])) np.stats[k] = +p.stats[k];
      np.ach = Array.isArray(p.ach) ? p.ach.filter(a => D.ACHIEVEMENTS.some(x => x.id === a)) : [];
      out.profile = np;
    }
    const z = s.season;
    if (out.profile && z && typeof z === 'object' && Array.isArray(z.field) && Array.isArray(z.order) && z.round >= 0 && z.round < D.ROUNDS.length &&
        ['backstage', 'playing', 'out', 'done'].includes(z.status) && z.field.every(id => z.order.includes(id))) {
      out.season = z;
      if (z.status === 'playing') cancelRound(z);
    }
    return out;
  }

  const API = { D, CK, TRAINABLE, DIFF, rng, hash, clamp, cleanName, newProfile, level, newSeason, startRound, cancelRound,
    analyze, panelOf, judge, ONLINE, onlineDef, onlineResolve, encoreFlip, comment, rollEvent, applyEvent, mergeSymp, aiPerf, rank, resolveRound, freeCasting, singScore, singStars, trainGain, applyTraining, applyCommunity, bonusScore,
    DEF_SETTINGS, freshSave, repair };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SMYV = API;
})(typeof window !== 'undefined' ? window : globalThis);
