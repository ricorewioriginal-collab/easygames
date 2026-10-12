'use strict';
/* Bunte Insel – „Die Inselreise“: ein roter Faden durchs Spiel. 8 Kapitel mit je 3 kleinen Zielen, danach das Insel-Fest.
   Nichts wird gesperrt – die Welt bleibt frei. Die Ziele hängen an Stickern (kids.earn) bzw. an Ereignissen (z. B. „mit jemandem reden“),
   bereits Geschafftes wird automatisch abgehakt. Sehr sparsam: nur eine kleine Anzeige + ein Fenster, keine 3D-Objekte. */
BI.STORY = [
  { icon: '🏝️', name: 'Ankommen', intro: 'Willkommen auf der Bunten Insel! Ich bin Bürgermeisterin Rosi. Schau dich um: Sag Hallo, pack deinen Rucksack aus und lass dir den Weg zeigen.',
    tasks: [['ev', 'talk', '💬', 'Sprich mit jemandem (tippe auf eine Person)'], ['stk', 'pack', '🎒', 'Öffne deinen Rucksack (🎒 oben links)'], ['stk', 'guide', '🧭', 'Lass dir den Weg zeigen (🧭 oben links)']] },
  { icon: '🚗', name: 'Unterwegs', intro: 'Auf der Insel gibt es viele Fahrzeuge. Steig ein, hilf den Leuten mit einem Auftrag – und fahr einmal mit dem Zug!',
    tasks: [['stk', 'ride', '🚗', 'Steig in ein Fahrzeug'], ['ev', 'mission', '📦', 'Erledige einen Auftrag (im Fahrzeug „Ja“ sagen)'], ['stk', 'train', '🚂', 'Fahr mit dem Zug', 'station']] },
  { icon: '🏠', name: 'Zuhause', intro: 'Du hast eine eigene Wohnung und einen Garten! Mach es dir gemütlich, ernte etwas und ruh dich aus.',
    tasks: [['stk', 'room', '🛋️', 'Richte dein Zimmer ein', 'home'], ['stk', 'garden', '🌻', 'Ernte etwas im Garten', 'garden'], ['stk', 'sleep', '😴', 'Schlaf in deinem Bett', 'home']] },
  { icon: '🚜', name: 'Auf dem Bauernhof', intro: 'Bauer Heinz braucht Hilfe! Streichle die Tiere, mäh ein Feld und koch etwas Leckeres in der Hofküche.',
    tasks: [['stk', 'animal', '🐄', 'Streichle ein Tier auf dem Hof', 'zoo'], ['stk', 'farm', '🌾', 'Mäh ein Feld mit dem Traktor', 'fields'], ['stk', 'cook', '🍳', 'Koche etwas in der Hofküche', 'hof']] },
  { icon: '🛍️', name: 'Im Ort', intro: 'Im Ort ist immer was los. Geh einkaufen, probier die Schießbude und mach ein schönes Foto.',
    tasks: [['stk', 'shopper', '🛒', 'Kaufe etwas in einem Laden', 'shops'], ['stk', 'shoot', '🎯', 'Spiel in der Schießbude', 'range'], ['stk', 'photo', '📸', 'Mach ein Foto (📷 oben links)']] },
  { icon: '🗺️', name: 'Abenteuer', intro: 'Jetzt wird es spannend! Hau einen Baum, such einen Schatz und schaff den Himmels-Parcours hoch über der Insel.',
    tasks: [['stk', 'tree', '🌳', 'Hau einen Baum (geh nah ran und tippe 🪓)'], ['stk', 'treasure', '🗺️', 'Finde einen Schatz (🎉 → Spiele → Schatzsuche)'], ['stk', 'obby', '🏁', 'Schaffe den Himmels-Parcours', 'obby']] },
  { icon: '🛡️', name: 'Mutprobe', intro: 'Zeig, wie mutig du bist: Gewinne einen Kampf in der Arena, segle aufs Meer und flieg mit dem Hubschrauber.',
    tasks: [['stk', 'fight', '🥊', 'Gewinne einen Kampf in der Arena', 'arena'], ['stk', 'boat', '⛵', 'Segle mit dem Boot', 'pier'], ['stk', 'heli', '🚁', 'Flieg mit dem Hubschrauber', 'heli']] },
  { icon: '🎉', name: 'Spaß-Tag', intro: 'Du hast so viel geschafft – jetzt wird gefeiert! Fahr Karussell im Freizeitpark, schau einen Film und spring ins Freibad.',
    tasks: [['stk', 'park', '🎡', 'Fahr eine Attraktion im Freizeitpark', 'park'], ['stk', 'cinema', '🎬', 'Schau einen Film im Kino', 'cinema'], ['stk', 'swim', '🏊', 'Spring ins Freibad', 'pool']] }
];
BI.createStory = function (G) {
  const { A, fx, P, save, say } = G, $ = id => document.getElementById(id), K = { open: false }, ST = BI.STORY;
  const S = () => save.story || (save.story = { c: 0, ev: {}, seen: false });
  const done = t => t[0] === 'stk' ? (save.stk || []).includes(t[1]) : !!(S().ev[t[1]]) || (t[1] === 'talk' && (save.talked || []).length > 0); // alte Gespräche zählen mit
  const rw = () => S().rw || (S().rw = {}); // Ziele, für die es schon den Stern gab
  K.chapter = () => ST[S().c] || null;
  K.finished = () => S().c >= ST.length;
  const chip = $('questChip'); BI.injectLogCss();
  function next() { const c = K.chapter(); return c ? c.tasks.find(t => !done(t)) : null; }
  function renderChip() {
    const fq = G.farmGoal ? G.farmGoal() : ''; if (fq) { $('qcIcon').textContent = '🚜'; $('qcTitle').textContent = 'Hof-Aufgabe'; $('qcText').textContent = fq; return; } /* eine Anzeige oben: Hof-Aufgabe, sonst nächstes Inselreise-Ziel */
    const c = K.chapter(); if (!c) { chip.hidden = true; return; } const n = next(), k = c.tasks.filter(done).length;
    $('qcIcon').textContent = n ? n[2] : c.icon; $('qcTitle').textContent = 'Kapitel ' + (S().c + 1) + '/' + ST.length + ' · ' + c.name + ' (' + k + '/3)'; $('qcText').textContent = n ? n[3] : '';
  }
  /* Fortschritt prüfen: abgehakte Ziele melden, Kapitel abschließen (beim Laden still nachholen) */
  function check(quiet) {
    const s = S(); let moved = 0;
    while (s.c < ST.length) {
      const c = ST[s.c]; if (!c.tasks.every(done)) break;
      let extra = 0; for (const t of c.tasks) if (!rw()[t[1]]) { rw()[t[1]] = 1; if (!quiet) extra++; } /* vorher (z. B. in einem früheren Kapitel) erledigte Ziele bekommen ihren Stern jetzt */
      s.c++; moved++; s.last = 5 + extra; if (!quiet) { G.addStars(5 + extra); A.fanfare && A.fanfare(); fx.burst(P.x, 2.6, P.z, 50, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green], 9, 1.6, 28, 7); }
      if (s.c >= ST.length) { finale(quiet); break; }
    }
    if (moved) { G.persist(); const c = K.chapter(); if (!quiet && c) { const n = s.last; setTimeout(() => announce(c, '✅ Kapitel geschafft! +' + n + ' ⭐ · '), 900); } else if (quiet && c) say('📖 Du warst schon fleißig! Weiter geht’s mit Kapitel ' + (s.c + 1) + ': ' + c.icon + ' ' + c.name, 4200); }
    renderChip(); if (K.open) render(); return moved;
  }
  function announce(c, pre) { say((pre || '') + '📖 Kapitel ' + (S().c + 1) + ': ' + c.icon + ' ' + c.name, 4200); if (A.speak) A.speak(c.intro); }
  function finale(quiet) {
    if (!quiet) { G.addStars(20); A.fanfare && A.fanfare(); for (let i = 0; i < 4; i++) setTimeout(() => fx.burst(P.x + (Math.random() - .5) * 8, 6 + Math.random() * 4, P.z + (Math.random() - .5) * 8, 60, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green, BI.C.orange], 12, 1.8, 26, 6), i * 450); }
    if (G.earn) G.earn('hero');
    say('🏆 Die Inselreise ist geschafft! Großes Insel-Fest – du bist jetzt Inselheld! ' + (quiet ? '' : '+20 ⭐ ') + '· Weiter geht’s mit den Tagesaufgaben im 🎉-Menü', 6000);
    if (!quiet && A.speak) A.speak('Hurra! Du hast die ganze Inselreise geschafft. Die Insel feiert ein großes Fest für dich, Inselheld!');
  }
  /* Ereignisse von außen */
  K.note = function (k) { const s = S(); if (s.ev[k]) return; const c = K.chapter(); if (!c || !c.tasks.some(t => t[0] === 'ev' && t[1] === k)) { s.ev[k] = 1; return; } s.ev[k] = 1; tick(c, k); };
  K.onEarn = function (id) { const c = K.chapter(); if (c && c.tasks.some(t => t[0] === 'stk' && t[1] === id)) tick(c, id); };
  function tick(c, k) { const t = c.tasks.find(q => q[1] === k); if (!rw()[k]) { rw()[k] = 1; G.addStars(1); } A.ding && A.ding(); G.persist(); if (!check(false)) { setTimeout(() => say('📖 ✔ ' + t[2] + ' ' + t[3].replace(/ \(.*\)$/, '') + ' +1 ⭐', 2600), 1200); renderChip(); if (K.open) render(); } } // schließt das Ziel das Kapitel ab, spricht nur die Kapitel-Ansage (sonst würde sie abgeschnitten)
  /* ---------- Fenster ---------- */
  function render() {
    const s = S(), box = $('questNow'), list = $('questList'); box.innerHTML = ''; list.innerHTML = '';
    const L = G.log ? G.log() : {};
    BI.renderTaskLog(box, { story: { finished: K.finished(), chapters: ST.map((c, i) => ({ icon: c.icon, name: c.name, intro: c.intro, cur: i === s.c, done: i < s.c, tasks: c.tasks.map(t => ({ icon: t[2], text: t[3], ok: done(t), dest: t[4] })) })) },
      farm: L.farm, einsatz: L.einsatz, mission: L.mission, daily: L.daily, extras: L.extras, guide: id => { K.close(); G.guideTo(id); } });
  }
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); S().seen = true; G.persist(); render(); $('questPanel').hidden = false; };
  K.close = function () { if (!K.open) return; K.open = false; $('questPanel').hidden = true; G.updateButtons(true); };
  $('questClose').addEventListener('click', K.close); chip.addEventListener('click', () => K.show());
  $('questRead').addEventListener('click', () => { const c = K.chapter(); if (c && A.speak) A.speak(c.intro); });
  /* Start: bereits Geschafftes nachholen; beim allerersten Mal das erste Kapitel ansagen (kein Fenster, damit nichts im Weg ist) */
  let introT = S().seen ? -1 : 2.5, fgT = 0;
  K.start = function () { check(true); renderChip(); };
  K.update = function (dt, playing, free) {
    fgT -= dt; if (fgT <= 0) { fgT = .5; renderChip(); } chip.hidden = !playing || (K.finished() && !(G.farmGoal && G.farmGoal())) || !free.hud;
    if (introT > 0 && playing && free.idle) { introT -= dt; if (introT <= 0) { introT = -1; S().seen = true; const c = K.chapter(); if (c) announce(c, '👩‍💼 Bürgermeisterin Rosi: '); } }
  };
  return K;
};
