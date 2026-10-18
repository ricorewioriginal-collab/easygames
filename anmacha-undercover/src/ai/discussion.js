/* AnMaCha UNDERCOVER 3D – Meeting-Aussagen der Bots. Aussagen entstehen aus überprüfbaren internen Fakten des
   Bot-Gedächtnisses (gesehene Vorfälle, Geheimgänge, gemeinsame Zeit, eigene Räume, Spuren, Funksprüche). Verräter lügen
   absichtlich und nachvollziehbar (falsches Alibi, Gegenbeschuldigung). Bausteine: Einstiege × Kernsätze × Abschlüsse
   (über 100 Satzbausteine), Wiederholungen werden je Partie vermieden. Jede Aussage trägt eine strukturierte Behauptung
   (claim), damit andere Bots sie bewerten können. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const OPEN = ['', '', '', 'Also, ', 'Ehrlich gesagt: ', 'Hört mal, ', 'Kurz von mir: ', 'Okay, ', 'Moment, ', 'Ich sag\'s, wie es ist: ', 'Leute, ', 'Na gut, ', 'Wartet, ', 'Fakt ist: '];
  const TAIL = ['', '', '', ' Da bin ich mir sicher.', ' Denkt mal drüber nach.', ' Mehr weiß ich nicht.', ' Das ist mir echt aufgefallen.', ' Nur so als Hinweis.', ' Glaubt mir.', ' Das passt nicht zusammen.', ' Prüft das bitte.'];
  const CORE = {
    report: ['Ich habe {v} {ri} gefunden.', '{v} lag {ri}, als ich reinkam.', '{Ri} lag {v} – ausgeknipst.', 'Ich bin {ri} über {v} gestolpert.', 'Gerade eben: {v}, {r}, keine Bewegung mehr.'],
    report_near: ['Kurz vorher war {p} in der Nähe.', 'Auf dem Weg dahin kam mir {p} entgegen.', '{p} war kurz davor genau dort.', 'Ich habe {p} in der Gegend gesehen.'],
    saw_kill: ['Ich habe gesehen, wie {p} {v} ausgeknipst hat!', '{p} war es – ich stand direkt daneben!', 'Ich habe es mit eigenen Augen gesehen: {p}!', '{p} hat {v} erwischt, ganz klar.', 'Kein Zweifel: {p} ist ein Verräter.'],
    saw_vent: ['{p} ist aus einem Geheimgang gekommen!', 'Ich habe {p} im Geheimgang verschwinden sehen.', '{p} hat einen Geheimgang benutzt – das kann nur ein Verräter.', '{Ri} ist {p} aus dem Lüftungsschacht geklettert.'],
    attack: ['{p} hat versucht, {v} auszuknipsen – das Schild hat es abgefangen!', 'Ich habe einen Angriff von {p} auf {v} gesehen.'],
    alibi: ['Ich war {ri}.', 'Ich war die ganze Zeit {ri}.', 'Ich komme gerade {ra}.', 'Ich habe {ri} an meinen Aufgaben gearbeitet.', 'Mein Weg: {r}, dann hierher.'],
    vouch: ['{p} war die ganze Zeit bei mir {ri}.', 'Für {p} lege ich die Hand ins Feuer – wir waren zusammen {ri}.', '{p} war mit mir {ri}, das kann ich bestätigen.', '{p} kann es nicht gewesen sein, wir waren zusammen.', 'Ich habe {p} die ganze Zeit {ri} gesehen.'],
    accuse: ['{p} benimmt sich komisch.', 'Ich finde {p} verdächtig.', '{p} war in der Nähe und sagt nichts.', 'Warum war {p} allein {ri}?', '{p} läuft mir ständig hinterher.', 'Ich traue {p} nicht.', 'Bei {p} habe ich ein schlechtes Gefühl.'],
    ask: ['Wo warst du, {p}?', '{p}, was hast du gerade gemacht?', '{p}, wer kann dein Alibi bestätigen?', 'Hat jemand {p} gesehen?', '{p}, du warst so still – warum?'],
    deny: ['Ich war es nicht!', 'Das stimmt nicht, ich war woanders.', 'Moment, ich bin unschuldig!', 'Falscher Verdacht – fragt die anderen.', 'Ich? Niemals.'],
    counter: ['{p} will nur von sich ablenken.', 'Komisch, dass ausgerechnet {p} mich beschuldigt.', '{p} lügt – ich war {ri}.', 'Wenn {p} so sicher ist, warum hat {p} dann nicht gemeldet?'],
    lie_caught: ['{p} sagt {r}, aber da habe ich {p} gar nicht gesehen.', 'Das kann nicht stimmen, {p} war doch woanders.', '{p}, du warst nicht {ri} – ich war dort.'],
    skip: ['Zu wenig Infos – ich würde überspringen.', 'Lasst uns lieber überspringen, bevor wir falsch rauswerfen.', 'Ich habe nichts gesehen. Überspringen?', 'Keine Beweise, keine Stimme.'],
    unsure: ['Ich bin mir unsicher.', 'Ich habe ehrlich gesagt nichts mitbekommen.', 'Hmm, schwierig.', 'Ich war zu weit weg.', 'Ich weiß es nicht.'],
    task: ['Ich habe {t} gemacht.', 'Ich war bei {t}.', 'Ich habe an {t} gearbeitet.', '{t} ist erledigt, falls jemand fragt.'],
    clue: ['Meine Spur sagt: {c}.', 'Ich habe etwas gefunden – {c}.', 'Laut meiner Untersuchung: {c}.', 'Beweisstück: {c}.'],
    clue_fit: ['Das passt auf {l}.', 'Damit kommen nur {l} in Frage.', 'Das schränkt es auf {l} ein.', 'Überlegt mal: {l}.'],
    clue_none: ['Das passt auf niemanden hier – vielleicht wurde die Spur manipuliert.', 'Seltsam, die Spur passt auf keinen von uns.'],
    funk: ['Der Funkspruch hat {p} entlastet.', '{p} ist laut Funkspruch sauber.'],
    chaos_help: ['Ich habe {n} Störungen behoben.', 'Wer hilft eigentlich bei den Reparaturen?', '{p} stand nur herum, als die Sendung abstürzte.', '{p} war bei keiner Reparatur dabei.'],
    agree: ['Sehe ich genauso.', 'Stimmt, das ist mir auch aufgefallen.', 'Da ist was dran.', 'Ja, genau das dachte ich auch.'],
    trick: ['Vielleicht war ich es ja … wer weiß?', 'Ich sage nichts ohne meinen Anwalt.', 'Ich war überall und nirgends.', 'Stimmt doch gleich für mich, dann seht ihr es.']
  };

  function Disc(brain) { this.b = brain; }
  Disc.prototype = {
    pick(list) {
      const s = this.b.sim, used = s.ext.usedLines = s.ext.usedLines || {}, r = this.b.rng;
      const fresh = list.filter(x => !used[x]);
      const x = r.pick(fresh.length ? fresh : list); used[x] = (used[x] || 0) + 1; return x;
    },
    fill(t, o) {
      const s = this.b.sim;
      return t.replace(/\{p\}/g, o.p ? this.b.name(o.p) : 'jemand').replace(/\{v\}/g, o.v ? this.b.name(o.v) : 'jemanden').replace(/\{r\}/g, o.r != null ? s.grid.roomName(o.r) : 'irgendwo').replace(/\{ri\}/g, o.r != null ? AMU.roomIn(s.grid.roomName(o.r)) : 'irgendwo').replace(/\{Ri\}/g, o.r != null ? cap(AMU.roomIn(s.grid.roomName(o.r))) : 'Irgendwo').replace(/\{ra\}/g, o.r != null ? AMU.roomFrom(s.grid.roomName(o.r)) : 'von irgendwo')
        .replace(/\{t\}/g, o.t || 'meinen Aufgaben').replace(/\{c\}/g, o.c || '').replace(/\{l\}/g, o.l || '').replace(/\{n\}/g, o.n != null ? o.n : '0');
    },
    line(kind, o, noFrame) {
      const core = this.fill(this.pick(CORE[kind]), o || {});
      if (noFrame) return core;
      const r = this.b.rng, op = r.chance(0.45) ? this.pick(OPEN) : '', tl = r.chance(0.35) ? this.pick(TAIL) : '';
      return (op ? op + core.charAt(0).toLowerCase() + core.slice(1) : core) + tl;
    },
    /** Nächste Aussage dieses Bots (oder null). Wird mehrfach pro Meeting gefragt. */
    next() {
      const b = this.b, s = b.sim, m = s.meeting, p = b.p, mem = b.mem, said = b.said;
      if (!m) return null;
      const out = (kind, o, claim, noFrame) => ({ txt: this.line(kind, o, noFrame), claim: Object.assign({ kind: claim || kind }, o || {}) });
      const traitor = p.team === 'traitor', trick = p.role === 'trickster';
      const bodyRoom = m.bodyRoom;
      // 1) Fund melden
      if (m.by === p.id && m.body && !said.report) { said.report = 1; return out('report', { v: m.body, r: bodyRoom }, 'found'); }
      if (m.by === p.id && m.body && !said.near) {
        said.near = 1;
        const near = traitor ? b.scapegoat() : b.nearBody();
        if (near) return out('report_near', { p: near, r: bodyRoom }, 'accuse');
      }
      // 2) Harte Beobachtungen (Crew sagt die Wahrheit)
      if (!traitor) {
        const k = mem.facts.find(f => (f.kind === 'kill' || f.kind === 'vent' || f.kind === 'attack') && !f.told && s.byId(f.who) && s.alive(s.byId(f.who)));
        if (k) { k.told = 1; return out(k.kind === 'kill' ? 'saw_kill' : k.kind === 'vent' ? 'saw_vent' : 'attack', { p: k.who, v: k.target, r: k.room }, k.kind === 'kill' ? 'saw_kill' : k.kind === 'vent' ? 'saw_vent' : 'saw_kill'); }
        const sc = mem.facts.find(f => f.kind === 'scan' && !f.told && f.res === 'verdächtig');
        if (sc) { sc.told = 1; return { txt: 'Ich habe ' + b.name(sc.who) + ' geprüft – Ergebnis: verdächtig!', claim: { kind: 'saw_vent', p: sc.who } }; }
        const fk = mem.facts.find(f => f.kind === 'cleared' && !f.told);
        if (fk) { fk.told = 1; return out('funk', { p: fk.who }, 'vouch'); }
      }
      // 3) Spuren vorlegen/deuten (Ermittler)
      if (p.role === 'detective' && b.pendingClueText && b.pendingClueText.length) return b.pendingClueText.shift();
      // 4) Auf Vorwürfe reagieren
      const acc = m.chat.filter(e => e.pid !== p.id && (e.p === p.id || (e.c && e.c.p === p.id)) && (e.claim === 'accuse' || e.claim === 'saw_kill' || e.claim === 'saw_vent') && !b.answered[e.t + ':' + e.pid]);
      if (acc.length) {
        const e = acc[acc.length - 1]; b.answered[e.t + ':' + e.pid] = 1;
        if (trick) return out('trick', {}, 'none');
        const room = traitor ? b.lieRoom() : mem.myRoomAt(s.t - 10000);
        if (b.rng.chance(0.5)) return out('counter', { p: e.pid, r: room }, 'accuse');
        return out('deny', {}, 'deny');
      }
      // 5) Lügen erkennen (Crew): jemand behauptet einen Raum, in dem ich war, ohne ihn zu sehen
      if (!traitor && p.diff >= 1) {
        const lie = m.chat.find(e => e.claim === 'alibi' && e.c && e.c.r != null && e.pid !== p.id && !b.answered['lie' + e.pid] && b.caughtLying(e.pid, e.c.r));
        if (lie) { b.answered['lie' + lie.pid] = 1; mem.addSus(lie.pid, 1.2); return out('lie_caught', { p: lie.pid, r: lie.c.r }, 'accuse'); }
      }
      // 6) Eigenes Alibi
      if (!said.alibi) {
        said.alibi = 1;
        if (trick && b.rng.chance(0.5)) return out('trick', {}, 'none');
        const r = traitor ? b.lieRoom() : mem.myRoomAt(s.t - 8000);
        if (r >= 0) return out('alibi', { r }, 'alibi');
      }
      // 7) Für jemanden bürgen (gemeinsame Zeit)
      if (!said.vouch) {
        said.vouch = 1;
        const best = Object.keys(mem.together).filter(id => id !== p.id && s.byId(id) && s.alive(s.byId(id))).sort((a, c) => mem.together[c] - mem.together[a])[0];
        if (best && mem.together[best] > 12000 && (!traitor || s.byId(best).team === 'traitor' ? p.diff < 2 : true)) {
          const room = mem.seen[best] ? mem.seen[best].room : s.roomOf(p);
          return out('vouch', { p: best, r: room }, 'vouch');
        }
      }
      // 8) Chaos-Modus: Reparaturen
      if (s.mode.flags.chaos && !said.chaos) {
        said.chaos = 1;
        const lazy = traitor ? b.scapegoat() : b.topSuspect(0.3);
        if (lazy && b.rng.chance(0.6)) return out('chaos_help', { p: lazy }, 'accuse');
        return out('chaos_help', { n: p.st.repairs }, 'none', true);
      }
      // 9) Verdacht äußern / nachfragen
      if (!said.accuse) {
        said.accuse = 1;
        const t = traitor ? b.scapegoat() : b.topSuspect(0.8);
        if (t) return b.rng.chance(0.6) ? out('accuse', { p: t, r: mem.seen[t] ? mem.seen[t].room : bodyRoom }, 'accuse') : out('ask', { p: t }, 'ask');
      }
      if (!said.react) {
        said.react = 1;
        const last = m.chat.filter(e => e.pid !== p.id && e.claim === 'accuse').pop();
        if (last && (last.p || (last.c && last.c.p))) {
          const tgt = last.p || last.c.p;
          if (tgt !== p.id && (traitor ? s.byId(tgt) && s.byId(tgt).team !== 'traitor' : (mem.sus[tgt] || 0) > 0.3)) { mem.addSus(tgt, 0.2); return out('agree', {}, 'accuse'); }
        }
      }
      if (!said.final) {
        said.final = 1;
        if (b.rng.chance(0.5)) {
          const t = b.topSuspect(1.2);
          if (!t) return out(b.rng.chance(0.5) ? 'skip' : 'unsure', {}, 'skip');
        }
        const tk = p.tasks.find(x => x.done) || p.tasks[0];
        if (tk) return out('task', { t: AMU.Tasks ? (AMU.Tasks.byId(tk.t) || {}).name : tk.t }, 'busy');
      }
      return null;
    }
  };
  Disc.CORE = CORE; Disc.OPEN = OPEN; Disc.TAIL = TAIL;
  Disc.blockCount = () => Object.values(CORE).reduce((n, l) => n + l.length, 0) + OPEN.filter(Boolean).length + TAIL.filter(Boolean).length;
  AMU.Discussion = Disc;
  if (typeof module !== 'undefined' && module.exports) module.exports = Disc;
})(typeof window !== 'undefined' ? window : globalThis);
