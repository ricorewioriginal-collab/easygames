'use strict';
/* Bunte Insel – Inselgeschichten 📜: jede Welt erzählt eine kleine eigene Geschichte in Akten (inspiriert von ihrem Vorbild, aber mit eigenen Figuren und Namen).
   Ein Erzähler/eine Figur der Welt spricht beim Betreten den Auftrag, die Ziele sind echte Aufgaben der Welt (Sticker). Schon Geschafftes zählt rückwirkend (Freie Welt wie Story-Modus).
   Das Aufgaben-Buch (📋) zeigt „📜 Inselgeschichten“, oben im Aufgaben-Chip steht der nächste Akt, sobald man auf der Insel ist. Fertig = Sticker + Sterne.
   NEUE WELT? Hier einen Eintrag ergänzen (key = BI.<KEY>, goal = Sticker-IDs aus js/kids.js) und den Abschluss-Sticker 'geschichte_<key>' in kids.js anlegen (siehe docs/NEUE-INHALTE.md). */
BI.INSELSTORY = [
  { key: 'RAETSEL', icon: '🗿', npc: 'Kapselmeisterin Pim', title: 'Die Prüfung der Uralten', acts: [
    { text: 'Willkommen, Held! Die Uralten schliefen tief – jetzt erwacht die schwebende Festung am Himmel. Nur wer die Prüfung im Turm besteht, darf sie betreten. Geh zum Prüfungsturm!', hint: 'Schaffe alle Rätsel im Prüfungsturm (Block, Pfeil, Bombe, Enterhaken)', goal: ['turm_s'], done: 'Der Turm ist bezwungen – das Siegel der Uralten bricht!' },
    { text: 'Du brauchst Verbündete: Am Kapsel-Schrein wartet ein Ei, und der Schmied macht dein Schwert stark.', hint: 'Wähle am Kapsel-Schrein ein Ei und schmiede ein Silberschwert', goal: ['kapsel', 'schmied'], done: 'Ein Kapselmonster an deiner Seite und ein scharfes Schwert – gut gerüstet!' },
    { text: 'Tief unter dem Dorf liegt die Uralte Höhle. Dort erzählen die Steine von Titan Kron.', hint: 'Steige in die Uralte Höhle hinab', goal: ['hoehle'], done: 'Du hast die Höhle erforscht und weißt nun, wo Titan Kron haust.' },
    { text: 'Titan Kron wartet im Verbotenen Wald! Nimm dein Kapselmonster mit und besiege ihn.', hint: 'Besiege Titan Kron im Verbotenen Wald', goal: ['titan'], done: 'Titan Kron ist besiegt – die Insel ist gerettet!' }
  ], end: 'Die Uralten verneigen sich: Du bist der Held der Rätsel-Insel!' },
  { key: 'SCHLUESSEL', icon: '🗝️', npc: 'Lichtwanderer Lio', title: 'Das Licht der Schlüssel', acts: [
    { text: 'Das Schlüsselreich versinkt im Schatten! Dunkelwichtel löschen die Laternen. Nur der Lichtschlüssel kann sie wieder entzünden.', hint: 'Zünde 12 Laternen mit dem Lichtschlüssel an', goal: ['laternen'], done: 'Die Laternen leuchten – die Dunkelwichtel weichen zurück!' },
    { text: 'Die Ringstraße und der Himmel gehören dem Licht. Sammle die Sterne und flieg mit dem Schlüsselschwert-Mobil.', hint: 'Sammle alle Sterne der Ringstraße und flieg mit dem Schlüsselschwert-Mobil', goal: ['rundfahrt', 'mobil_s'], done: 'Die ganze Insel strahlt wieder!' },
    { text: 'Fünf Schlüssellöcher hüten das Tor der Herzen. Öffne sie alle!', hint: 'Öffne das Tor der Herzen im Schlüsselreich', goal: ['herzentor'], done: 'Das Tor der Herzen steht offen – Feuerwerk!' },
    { text: 'Doch im Verbotenen Wald lauert noch der Dunkelriese. Nur der Schlüsselträger kann ihn besiegen.', hint: 'Besiege den Dunkelriesen im Verbotenen Wald', goal: ['schluesseltraeger'], done: 'Der Dunkelriese ist besiegt!' }
  ], end: 'Lio lächelt: Du bist der wahre Schlüsselträger!' },
  { key: 'SCHWAMM', icon: '🧽', npc: 'Schwammi', title: 'Das Geheimrezept der Knusper-Krabbe', acts: [
    { text: 'Hihi, willkommen in der Bucht! Das Geheimrezept der Knusper-Krabbe ist verschwunden – und alle haben Hunger. Probier erst mal die Gerichte, dann ermitteln wir!', hint: 'Iss drei verschiedene Gerichte in der Knusper-Krabbe', goal: ['stammgast'], done: 'Lecker! Du hast jetzt eine Nase für das Rezept.' },
    { text: 'Im Quallenfeld und bei Sunny in der Luftkuppel gibt es Hinweise. Sei flink und stark!', hint: 'Fang 15 Quallen und übe zehnmal Karate bei Sunny', goal: ['qualler', 'karate_s'], done: 'Flink gefangen, fleißig geübt – die Spur ist heiß!' },
    { text: 'Der winzige Plankto steckt dahinter – mit einem Riesen-Roboter! Hol dir das Rezept zurück!', hint: 'Besiege Planktos Riesen-Roboter im Verbotenen Wald', goal: ['plankton'], done: 'Planktos Roboter ist Geschichte – das Rezept ist zurück!' }
  ], end: 'Die Krabbe feiert dich: Held der Bucht!' },
  { key: 'MAERCHEN', icon: '🎠', npc: 'Fee Glimmer', title: 'Das verlorene Märchenbuch', acts: [
    { text: 'Oh, wie gut, dass du da bist! Das große Märchenbuch hat seine Seiten verloren – und mit ihnen die Magie. Fahr erst mal Karussell und Schwanenboot, dann kehrt der Zauber zurück!', hint: 'Fahr mit dem Märchen-Karussell und dem Schwanenboot', goal: ['karussell', 'schwan'], done: 'Funken sprühen – die ersten Seiten leuchten!' },
    { text: 'Weiter geht’s: Rutsch vom Frostgipfel und lauf beim Umzug mit.', hint: 'Rutsch vom Frostgipfel und lauf beim Märchen-Umzug mit', goal: ['eisrutsche', 'umzug'], done: 'Mehr Seiten sind gefunden!' },
    { text: 'Die letzten Seiten stecken im Stempelheft und in der Schloss-Show.', hint: 'Fülle das Stempelheft und starte die Schloss-Show', goal: ['stempel', 'schlossshow'], done: 'Alle Seiten sind zurück!' }
  ], end: 'Das Märchenbuch strahlt – und du stehst jetzt darin!' },
  { key: 'PARK', icon: '🎡', npc: 'Parkchef Bruno', title: 'Der Traumpark', acts: [
    { text: 'Willkommen im Freizeitpark! Er ist noch ein bisschen leer. Probier eine Attraktion aus – dann bauen wir ihn gemeinsam aus!', hint: 'Fahr eine Attraktion im Freizeitpark', goal: ['park'], done: 'Hui! Der Park hat Gäste!' },
    { text: 'Geh ins Park-Büro am Eingang: Baue etwas und schließe eine Park-Mission ab.', hint: 'Baue etwas im Park und schließe eine Park-Mission ab', goal: ['tybuild', 'tymis'], done: 'Dein Park wächst!' },
    { text: 'Jetzt der große Schritt: 3 Sterne Parkbewertung und alle Missionen!', hint: 'Erreiche 3 Sterne Parkbewertung und schaffe alle Park-Missionen', goal: ['tystar', 'tydir'], done: 'Der Traumpark ist perfekt!' }
  ], end: 'Bruno jubelt: Du bist Parkdirektor!' },
  { key: 'BAULAND', icon: '🧱', npc: 'Baumeisterin Berta', title: 'Die Stadt aus Blöcken', acts: [
    { text: 'Hier gehört alles dir: Block für Block entsteht deine Welt! Bau dein erstes Teil.', hint: 'Bau ein Teil (Bauen-Knopf 🧱)', goal: ['build'], done: 'Der erste Block sitzt!' },
    { text: 'Jetzt ein richtiger Parcours – bau ihn und schaffe ihn selbst!', hint: 'Schaffe deinen selbst gebauten Parcours', goal: ['parcours'], done: 'Dein Parcours ist geschafft!' }
  ], end: 'Berta staunt: Meisterbaumeister!' }
];
BI.createInselStory = function (G) {
  const { save, say, persist, P } = G, K = { cur: null }, ST = BI.INSELSTORY, got = id => (save.stk || []).includes(id);
  const S = () => { const s = save.inselstory || (save.inselstory = {}); return s; };
  const of = key => ST.find(q => q.key === key);
  const stage = d => { const a = S()[d.key]; return a == null ? -1 : a; }; /* -1 nicht begonnen, 0..n-1 Akt, n fertig */
  const actDone = a => a.goal.every(got);
  /* Fortschritt prüfen: erledigte Akte weiterschalten (leise nachholen, wenn es schon Geschafftes gibt) */
  function advance(d, quiet) {
    const s = S(); let moved = false;
    while (s[d.key] != null && s[d.key] < d.acts.length && actDone(d.acts[s[d.key]])) {
      const a = d.acts[s[d.key]]; s[d.key]++; moved = true;
      if (!quiet) { G.addStars(3); say('📜 ✔ ' + a.done + ' +3 ⭐', 4200); G.fanfare && G.fanfare(); }
      if (s[d.key] >= d.acts.length) { finish(d, quiet); break; }
      else if (!quiet) setTimeout(() => announce(d), 2600);
    }
    if (moved) persist(); return moved;
  }
  function finish(d, quiet) { const id = 'geschichte_' + d.key.toLowerCase(); if (!quiet) { G.addStars(10); setTimeout(() => say('🏆 ' + d.icon + ' „' + d.title + '“ geschafft! ' + d.end + ' +10 ⭐', 6200), 1200); if (G.speak) G.speak(d.end); } if (G.earn) G.earn(id); }
  function announce(d) { const a = d.acts[S()[d.key]]; if (!a) return; say(d.icon + ' ' + d.npc + ': ' + a.text, 8200); if (G.speak) G.speak(a.text); }
  function start(d) { const s = S(); if (s[d.key] != null) return; s[d.key] = 0; persist(); if (!advance(d, true)) announce(d); else { const a = d.acts[s[d.key]]; if (a) announce(d); else say(d.icon + ' „' + d.title + '“ hast du schon geschafft! 🏆', 3600); } }
  let tmr = 0;
  K.update = function (dt) {
    tmr -= dt; if (tmr > 0) return; tmr = .8; K.cur = null; const x = P.veh ? P.veh.x : P.x, z = P.veh ? P.veh.z : P.z;
    for (const d of ST) {
      const O = BI[d.key]; if (!O) continue; const on = Math.hypot(x - O.x, z - O.z) < O.R + 12;
      if (S()[d.key] != null) advance(d, false);
      if (on && !K.locked(d)) { if (S()[d.key] == null) start(d); const a = d.acts[S()[d.key]]; if (a) K.cur = { d, a, i: S()[d.key] }; }
    }
  };
  K.locked = d => { const O = BI[d.key]; return !!(G.lockedAt && O && G.lockedAt(O.x, O.z)); };
  /* Anzeige im Aufgaben-Chip, wenn man auf der Insel ist */
  K.goal = function () { const c = K.cur; if (!c) return null; return { icon: c.d.icon, title: c.d.title + ' · Akt ' + (c.i + 1) + '/' + c.d.acts.length, text: c.a.hint }; };
  K.log = function () {
    const rows = []; let n = 0;
    for (const d of ST) { const a = S()[d.key], done = a != null && a >= d.acts.length; if (done) n++; rows.push({ ok: done, icon: d.icon, text: d.title + (a == null ? ' – noch nicht begonnen (geh auf die Insel)' : done ? ' – geschafft! 🏆' : ' – Akt ' + (a + 1) + '/' + d.acts.length + ': ' + d.acts[a].hint), dest: null });
      if (a != null && !done) for (let i = 0; i < d.acts.length; i++) rows.push({ ok: i < a, icon: '  ' + (i < a ? '✔' : '▫'), text: d.acts[i].hint, dest: null }); }
    return { title: '📜 Inselgeschichten', count: n + ' von ' + ST.length, rows };
  };
  K.dbg = { S, advance, start, stage, ST };
  return K;
};
