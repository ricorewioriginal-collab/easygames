/* AnMaCha UNDERCOVER 3D – Meeting: Diskussion → Abstimmung → Ergebnis. Stimmen sind anonym (nur Anzahl je Ziel),
   jede lebende Person stimmt genau einmal (zweite Stimme wird abgelehnt), Gleichstand = niemand fliegt.
   Schnellchat (strukturierte Aussagen, die auch Bots verstehen) und gefilterter Freitext mit Flutschutz.
   Ausgeschiedene schreiben nur in den Geisterkanal. Keine Rollenoffenbarung beim Rauswurf. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const QUICK = {
    sus: { de: 'Ich finde {p} verdächtig.', en: 'I think {p} is suspicious.', target: 1, claim: 'accuse' },
    safe: { de: '{p} war die ganze Zeit bei mir.', en: '{p} was with me the whole time.', target: 1, claim: 'vouch' },
    where: { de: 'Wo warst du, {p}?', en: 'Where were you, {p}?', target: 1, claim: 'ask' },
    trust: { de: 'Ich vertraue {p}.', en: 'I trust {p}.', target: 1, claim: 'vouch' },
    kill: { de: 'Ich habe gesehen, wie {p} jemanden ausgeknipst hat!', en: 'I saw {p} knock someone out!', target: 1, claim: 'saw_kill' },
    vent: { de: 'Ich habe {p} aus einem Geheimgang kommen sehen!', en: 'I saw {p} use a secret passage!', target: 1, claim: 'saw_vent' },
    room: { de: 'Ich war {ri}.', en: 'I was in {r}.', room: 1, claim: 'alibi' },
    task: { de: 'Ich war die ganze Zeit bei meinen Aufgaben.', en: 'I was doing my tasks.', claim: 'busy' },
    found: { de: 'Ich habe die Person gefunden – keine Ahnung, wer es war.', en: 'I found them – no idea who did it.', claim: 'found' },
    notme: { de: 'Ich war es nicht!', en: 'It wasn\'t me!', claim: 'deny' },
    skip: { de: 'Zu wenig Infos – lasst uns überspringen.', en: 'Not enough info – let\'s skip.', claim: 'skip' },
    hm: { de: 'Hmm … erzählt mal mehr.', en: 'Hmm… tell us more.', claim: 'none' }
  };
  const M = {
    QUICK,
    start(sim, by, body) {
      sim.phase = 'meeting';
      sim.placeAtTable();
      sim.meeting = { n: sim.stats.meetings, by: by ? by.id : null, body: body ? body.id : null, bodyRoom: body ? body.room : -1, phase: 'discuss', start: sim.t,
        until: sim.t + sim.settings.discuss * 1000, votes: {}, chat: [], result: null, last: {} };
      sim.emit('meeting', { by: sim.meeting.by, body: sim.meeting.body, room: sim.meeting.bodyRoom }, 'all');
      AMU.Modes.onMeeting && AMU.Modes.onMeeting(sim);
    },
    aliveVoters(sim) { return sim.players.filter(p => sim.alive(p)); },
    tick(sim) {
      const m = sim.meeting; if (!m) return;
      if (m.phase === 'discuss' && sim.t >= m.until) { m.phase = 'vote'; m.until = sim.t + sim.settings.vote * 1000; sim.emit('vote_open', {}, 'all'); }
      else if (m.phase === 'vote') {
        const voters = M.aliveVoters(sim);
        if (!m.allIn && voters.every(p => m.votes[p.id] != null)) { m.allIn = true; m.until = Math.min(m.until, sim.t + 1500); }
        if (sim.t >= m.until) M.resolve(sim);
      } else if (m.phase === 'result' && sim.t >= m.until) M.finish(sim);
    },
    tally(votes, voters) {
      const counts = {}; let skip = 0;
      voters.forEach(p => { const v = votes[p.id]; if (v == null) return; if (v === 'skip') skip++; else counts[v] = (counts[v] || 0) + 1; });
      let max = 0, top = [];
      Object.keys(counts).forEach(k => { if (counts[k] > max) { max = counts[k]; top = [k]; } else if (counts[k] === max) top.push(k); });
      const ejected = top.length === 1 && max > skip ? top[0] : null;
      return { counts, skip, ejected, tie: top.length > 1 || (top.length === 1 && max === skip && max > 0) };
    },
    resolve(sim) {
      const m = sim.meeting, voters = M.aliveVoters(sim);
      const r = M.tally(m.votes, voters);
      m.result = r; m.phase = 'result'; m.until = sim.t + 6000;
      const ej = r.ejected ? sim.byId(r.ejected) : null;
      if (ej) {
        ej.alive = false; ej.ghost = true; ej.ejected = true; ej.st.survived = false; sim.publicDead.add(ej.id); sim.stats.ejects++;
        voters.forEach(p => { const v = m.votes[p.id]; if (v === ej.id) { if (ej.team === 'traitor') { p.st.votesRight++; p.st.ejectedTraitors++; } else p.st.votesWrong++; } });
      }
      sim.emit('eject', { id: r.ejected, tie: r.tie, counts: r.counts, skip: r.skip }, 'all');
      AMU.Modes.onEject && AMU.Modes.onEject(sim, ej);
    },
    finish(sim) {
      sim.meeting = null; sim.bodies = []; sim.phase = 'play';
      if (AMU.Rules.check(sim)) return;
      sim.placeAtTable();
      sim.players.forEach(p => { if (p.team === 'traitor') p.cd.kill = sim.t + sim.killCdMs(); });
      sim.btnReady = sim.t + 15000;
      sim.sab.cd = Math.max(sim.sab.cd, sim.t + 12000);
      sim.emit('phase', { phase: 'play' }, 'all');
    },
    act(sim, p, a) {
      const m = sim.meeting; if (!m) return { ok: false, why: 'kein meeting' };
      if (a.a === 'vote') {
        if (m.phase !== 'vote') return { ok: false, why: 'noch nicht' };
        if (!sim.alive(p)) return { ok: false, why: 'ausgeschieden' };
        if (m.votes[p.id] != null) return { ok: false, why: 'schon abgestimmt' };
        if (a.target !== 'skip') { const t = sim.byId(a.target); if (!t || !sim.alive(t)) return { ok: false, why: 'ziel' }; }
        m.votes[p.id] = a.target;
        sim.emit('voted', { id: p.id }, 'all');
        return { ok: true };
      }
      if (a.a === 'quick' || a.a === 'chat' || a.a === 'present') {
        if (m.phase === 'result') return { ok: false, why: 'vorbei' };
        const last = m.last[p.id] || 0;
        if (sim.t - last < (p.bot ? 600 : 1500)) return { ok: false, why: 'zu schnell' };
        const ghost = !sim.alive(p);
        let entry = null;
        if (a.a === 'quick') {
          const q = QUICK[a.q]; if (!q) return { ok: false, why: 'unbekannt' };
          entry = { pid: p.id, q: a.q, ghost };
          if (q.target) { const t = sim.byId(a.p); if (!t) return { ok: false, why: 'ziel' }; entry.p = t.id; }
          if (q.room) { if (!AMU.U.isInt(a.r) || a.r < 0 || a.r >= sim.map.rooms.length) return { ok: false, why: 'raum' }; entry.r = a.r; }
          entry.claim = q.claim;
        } else if (a.a === 'chat') {
          let txt = AMU.U.cleanName(a.txt, 90);
          if (!txt) return { ok: false, why: 'leer' };
          if (sim.filter) { txt = sim.filter(txt); if (!txt) return { ok: false, why: 'filter' }; }
          entry = { pid: p.id, txt, ghost };
          if (a.claim && AMU.U.isObj(a.claim) && p.bot) { entry.claim = a.claim.kind; entry.c = a.claim; }   // Bots liefern ihre Aussage strukturiert mit
        } else {
          const r = AMU.Evidence && AMU.Evidence.present(sim, p, a.clue);
          if (!r) return { ok: false, why: 'keine Spur' };
          entry = { pid: p.id, clue: r, ghost: false, claim: 'present' };
        }
        m.last[p.id] = sim.t; entry.t = sim.t; m.chat.push(entry); if (m.chat.length > 120) m.chat.shift();
        sim.emit('chat', { e: entry }, ghost ? sim.players.filter(o => !sim.alive(o)).map(o => o.id) : 'all');
        return { ok: true };
      }
      return { ok: false, why: 'phase' };
    },
    publicState(sim, me) {
      const m = sim.meeting; if (!m) return null;
      const ghostView = !sim.alive(me);
      return {
        n: m.n, phase: m.phase, left: Math.max(0, m.until - sim.t), by: m.by, body: m.body, room: m.bodyRoom,
        voted: Object.keys(m.votes), mine: m.votes[me.id] != null ? m.votes[me.id] : null,
        chat: m.chat.filter(e => !e.ghost || ghostView).slice(-60),
        alive: sim.players.filter(p => sim.alive(p)).map(p => p.id),
        result: m.result ? { ejected: m.result.ejected, tie: m.result.tie, counts: m.result.counts, skip: m.result.skip } : null
      };
    },
    /** Text einer Schnellchat-Zeile (für Oberfläche und Bots). names: id → Name, rooms: Raumnamen */
    quickText(e, names, rooms, lang) {
      const q = QUICK[e.q]; if (!q) return '';
      return (q[lang] || q.de).replace('{p}', names[e.p] || '?').replace('{ri}', rooms && rooms[e.r] ? (AMU.roomIn ? AMU.roomIn(rooms[e.r]) : 'in ' + rooms[e.r]) : 'irgendwo').replace('{r}', (rooms && rooms[e.r]) || '?');
    }
  };
  AMU.Meeting = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
