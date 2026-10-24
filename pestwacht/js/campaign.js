/* Pestwacht · Storykampagne „Die letzte Zuflucht“: 5 Kapitel, 19 Missionen mit prüfbaren Zielen aus dem echten Spielzustand. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const K = PW.Campaign = {};
  const C = () => PW.City, Wd = () => PW.World;

  K.SEED = 'pestwacht-kampagne-1';
  K.FACTIONS = ['morvain', 'salz', 'lichtwall', 'ilse', 'raben'];
  K.CAST = {
    hildrun: { name: 'Äbtissin Hildrun', col: '#e8d9a8' }, veit: { name: 'Hauptmann Veit', col: '#9aa7b8' }, mira: { name: 'Mira Falkenaug', col: '#7fb36a' },
    anselm: { name: 'Bruder Anselm', col: '#c9a35a' }, jorin: { name: 'Jorin Nebelpfad', col: '#8ab3c9' }, ysolde: { name: 'Gräfin Ysolde', col: '#b36ab3' },
    brand: { name: 'Meister Brand', col: '#c96a3a' }, ottokar: { name: 'Ottokar der Graue', col: '#8a8a8a' }, erz: { name: 'Erzählerin', col: '#d8c7a0' },
    talea: { name: 'Meisterin Talea Grau', col: '#d6a637' }, hauptmann: { name: 'Der Eiserne Hauptmann', col: '#555a66' }, fuerst: { name: 'Der Schwarmfürst', col: '#6a4a3a' }
  };
  const st = (S, k) => S.stats[k] || 0;
  const since = (S, base, k) => st(S, k) - (base[k] || 0);
  const has = (S, t, lv) => S.city.b.some(b => b.t === t && b.lv >= (lv || 1));
  const own = S => Wd().tilesOf(S, 'P').length;
  const flag = (S, f) => !!S.storyFlags[f];
  const sickShare = S => { const p = S.pop, t = PW.Econ.popTotal(p); return t ? (p.i + p.q + p.t) / t : 0; };

  // Ziele: g(S, base) → [aktuell, nötig]
  K.CHAPTERS = [
    { id: 1, name: 'Asche und Glocken', env: 'Karge Ebene', missions: [
      { id: '1a', name: 'Die ersten Mauern', type: 'Versorgung stabilisieren', noWaves: 1,
        intro: [['erz', 'Das Jahr der Graupest. Die Glocken von Aschental schweigen. Hinter einer Palisade sammeln sich die letzten Überlebenden.'], ['hildrun', 'Wir brauchen Kräuter gegen das Fieber und sauberes Wasser. Ohne beides stirbt diese Zuflucht, bevor sie lebt.'], ['veit', 'Tippe auf „Bauen“, wähle ein Gebäude und setze es auf einen freien Platz. Meine Leute fangen sofort an.']],
        goals: [{ t: 'Baue einen Kräutergarten', g: S => [has(S, 'kraeuter') ? 1 : 0, 1], hint: 'build:kraeuter' }, { t: 'Baue einen zweiten Brunnen', g: S => [Math.min(2, S.city.b.filter(b => b.t === 'brunnen' && b.lv > 0).length), 2], hint: 'build:brunnen' }],
        reward: { wood: 150, stone: 100 } },
      { id: '1b', name: 'Fieber in der Zuflucht', type: 'Patienten retten', noWaves: 1,
        intro: [['hildrun', 'Die ersten Kranken liegen auf dem Stroh. Eine Heilstube mit Betten und Arznei – dann haben sie eine Chance.'], ['hildrun', 'Im Gesundheitsbericht siehst du freie Betten, Arzneivorrat und wie schnell wir heilen.']],
        goals: [{ t: 'Baue eine Heilstube', g: S => [has(S, 'heilstube') ? 1 : 0, 1], hint: 'build:heilstube' }, { t: 'Heile 5 Patienten', g: (S, b) => [Math.min(5, since(S, b, 'cured')), 5], hint: 'panel:gesundheit' }],
        reward: { med: 30, herb: 40 }, onEnd: S => { S.pop.i += 3; } },
      { id: '1c', name: 'Rattenflut', type: 'Wellenangriff überstehen',
        intro: [['veit', 'Kundschafter melden einen Schwarm aus dem Westen! Pestratten, Hunderte. Unsere Wachtürme müssen halten.'], ['veit', 'Baue einen weiteren Wachturm nahe dem Tor. Feinde kommen nur über die markierten Pfade – das Tor ist ihr Ziel.']],
        onStart: S => { S.waves.next = S.time + 120; S.waves.warned = false; },
        goals: [{ t: 'Baue einen weiteren Wachturm', g: S => [Math.min(3, S.city.b.filter(b => b.t === 'turm_pfeil').length), 3], hint: 'build:turm_pfeil' }, { t: 'Wehre die erste Welle ab', g: (S, b) => [Math.min(1, since(S, b, 'waves')), 1] }],
        reward: { coin: 150, iron: 60 }, unlockHero: 'mira' },
      { id: '1d', name: 'Die Ruine im Osten', type: 'Außenposten sichern',
        intro: [['mira', 'Ich bin Mira. Euer Turm hat mir das Leben gerettet – also helfe ich euch. Östlich liegt eine Ruine. Plünderer horten dort Vorräte.'], ['veit', 'Öffne die Weltkarte, wähle die markierte Ruine und schicke eine Expedition mit Truppen und Helden.']],
        onStart: S => K.markNearest(S, 'ruin', 'ch1_ruine'),
        goals: [{ t: 'Bilde 10 Spießträger aus', g: (S, b) => [Math.min(10, since(S, b, 'recruited')), 10], hint: 'panel:militaer' }, { t: 'Erobere die markierte Ruine', g: S => [flag(S, 'ch1_ruine') ? 1 : 0, 1], hint: 'tab:welt' }],
        reward: { coin: 200, know: 80 } }
    ] },
    { id: 2, name: 'Das Moor der Flüsterer', env: 'Verseuchter Sumpf', missions: [
      { id: '2a', name: 'Wissen gegen Fieber', type: 'Heilmittel erforschen',
        intro: [['anselm', 'Bruder Anselm, zu Diensten. Ich habe Bücher gerettet – und eine Theorie: Die Graupest wandert mit dem Moorwasser.'], ['anselm', 'Erforsche „Kräuterkunde“ und „Seife & Hygiene“. Sauberkeit ist die erste Medizin.']],
        onStart: S => PW.Heroes.unlock(S, 'anselm', 'Kampagne'),
        goals: [{ t: 'Erforsche Kräuterkunde', g: S => [S.research.done.h1 ? 1 : 0, 1], hint: 'tab:forschung' }, { t: 'Erforsche Seife & Hygiene', g: S => [S.research.done.h2 ? 1 : 0, 1], hint: 'tab:forschung' }],
        reward: { know: 100, herb: 60 } },
      { id: '2b', name: 'Stimmen im Nebel', type: 'Patienten retten',
        intro: [['jorin', 'Ich kenne die Moorpfade. In einer verlassenen Siedlung warten Kranke. Niemand holt sie – außer uns.'], ['jorin', 'Schicke eine Rettungsexpedition zur markierten Siedlung. Die Geretteten brauchen danach Betten.']],
        onStart: S => { PW.Heroes.unlock(S, 'jorin', 'Kampagne'); K.markNearest(S, 'village', 'ch2_dorf'); },
        goals: [{ t: 'Rette 6 Überlebende aus Siedlungen', g: (S, b) => [Math.min(6, since(S, b, 'rescued')), 6], hint: 'tab:welt' }],
        reward: { med: 40, cloth: 40 } },
      { id: '2c', name: 'Volle Speicher', type: 'Versorgung stabilisieren',
        intro: [['hildrun', 'Mit den Neuen reichen Brot und Wasser nicht. Sorge dafür, dass Nahrung und Wasser drei Minuten lang mehr werden als verbraucht.']],
        goals: [{ t: 'Nahrung und Wasser 3 Minuten im Plus', g: S => [Math.min(180, Math.floor(S.campaign.stable || 0)), 180], hint: 'panel:wirtschaft' }, { t: 'Erreiche 30 Bewohner', g: S => [Math.min(30, PW.Econ.popTotal(S.pop)), 30] }],
        reward: { food: 200, water: 200, coin: 100 } },
      { id: '2d', name: 'Die Fäulnismutter', type: 'Bosskampf',
        intro: [['jorin', 'Etwas Großes kriecht aus dem Moor. Die Ratten fliehen vor ihm – zu uns.'], ['anselm', 'Die Fäulnismutter! Ihr Atem heilt andere Seuchenwesen. Tötet sie zuerst – Ballisten und Heldenfähigkeiten!']],
        onStart: S => { S.waves.next = S.time + 150; S.waves.warned = false; S.campaign.forceBoss = 'faeulnismutter'; },
        goals: [{ t: 'Besiege die Fäulnismutter', g: S => [st(S, 'boss_faeulnismutter') ? 1 : 0, 1] }],
        reward: { coin: 300, med: 50, know: 120 } }
    ] },
    { id: 3, name: 'Zwischen Bannern', env: 'Wälder', missions: [
      { id: '3a', name: 'Salz und Silber', type: 'Handelsvertrag',
        intro: [['talea', 'Talea Grau, Bund der Salzhändler. Wir handeln mit jedem, der bezahlt – und mit jedem, der überlebt.'], ['ysolde', 'Ysolde Rabenstein. Ihr braucht Freunde, Äbtissin. Öffne die Diplomatie und biete einer Computerfraktion einen Handelsvertrag an.']],
        onStart: S => PW.Heroes.unlock(S, 'ysolde', 'Kampagne'),
        goals: [{ t: 'Schließe einen Handelsvertrag', g: S => [PW.Diplo.parties(S).some(o => o !== 'P' && PW.Diplo.rel(S, 'P', o).trade) ? 1 : 0, 1], hint: 'tab:diplomatie' }],
        reward: { coin: 200 } },
      { id: '3b', name: 'Der Konvoi', type: 'Konvoi eskortieren',
        intro: [['ysolde', 'Baue eine Handelsstation und schicke eine Karawane. Unterwegs lauern Plünderer – plane den Weg klug.']],
        goals: [{ t: 'Baue eine Handelsstation', g: S => [has(S, 'handel') ? 1 : 0, 1], hint: 'build:handel' }, { t: 'Liefere eine Karawane aus', g: (S, b) => [Math.min(1, since(S, b, 'trades')), 1], hint: 'tab:welt' }],
        reward: { coin: 250, cloth: 50 } },
      { id: '3c', name: 'Der Lindenhof', type: 'Verbündete Stadt befreien',
        intro: [['ysolde', 'Plünderer halten den Lindenhof besetzt, ein Gehöft, das unsere Nachbarn versorgt hat. Befreie es und halte es.']],
        onStart: S => K.markNearest(S, 'res_food', 'ch3_hof', true),
        goals: [{ t: 'Befreie und besetze den Lindenhof', g: S => [flag(S, 'ch3_hof') && S.campaign.markTile != null && S.world.tiles[S.campaign.markTile].own === 'P' ? 1 : 0, 1], hint: 'tab:welt' }],
        reward: { food: 300, coin: 150 } },
      { id: '3d', name: 'Ein Bund gegen die Nacht', type: 'Bündnis',
        intro: [['ysolde', 'Allein fallen wir. Gründe ein Bündnis. Du brauchst eine Diplomatiehalle der Stufe 2 und das Vertrauen deines Partners.']],
        goals: [{ t: 'Schließe ein Bündnis', g: S => [PW.Diplo.alliesOf(S, 'P').length ? 1 : 0, 1], hint: 'tab:diplomatie' }],
        reward: { coin: 300, know: 150 } }
    ] },
    { id: 4, name: 'Die Eisenfeste', env: 'Gebirge', missions: [
      { id: '4a', name: 'Pässe sichern', type: 'Außenposten sichern',
        intro: [['brand', 'Meister Brand. Ich baue Rammen, keine Ausreden. Bevor wir die Eisenfeste knacken, brauchen wir Nachschub aus den Bergen.'], ['veit', 'Besetze drei Regionen außerhalb unseres Kerngebiets.']],
        onStart: S => { PW.Heroes.unlock(S, 'brand', 'Kampagne'); S.campaign.ownBase = own(S); },
        goals: [{ t: 'Besetze 3 weitere Regionen', g: S => [Math.min(3, own(S) - (S.campaign.ownBase || 0)), 3], hint: 'tab:welt' }],
        reward: { iron: 150, stone: 200 } },
      { id: '4b', name: 'Stein auf Stein', type: 'Wellenangriff überstehen',
        intro: [['ottokar', 'Ottokar. Ich war schon alt, als die erste Pest kam. Höhere Mauern, Junge – und dann haltet zwei Angriffe aus.']],
        onStart: S => PW.Heroes.unlock(S, 'ottokar', 'Kampagne'),
        goals: [{ t: 'Stadtmauer auf Stufe 3', g: S => [Math.min(3, C().lv(S, 'mauer')), 3], hint: 'build:mauer' }, { t: 'Wehre 2 Wellen ab', g: (S, b) => [Math.min(2, since(S, b, 'waves')), 2] }],
        reward: { coin: 300, iron: 100 } },
      { id: '4c', name: 'Die Eisenfeste', type: 'Feindliche Festung einnehmen',
        intro: [['hauptmann', 'Ihr wollt meine Festung? Meine Mauern haben drei Grafen überlebt.'], ['brand', 'Rammböcke durchbrechen Tore, Schützen halten die Mauer frei. Belagerungskunst erforschen, dann angreifen!']],
        onStart: S => K.fortress(S),
        goals: [{ t: 'Nimm die Eisenfeste ein', g: S => [flag(S, 'ch4_feste') ? 1 : 0, 1], hint: 'tab:welt' }],
        reward: { coin: 500, iron: 200, know: 200 } }
    ] },
    { id: 5, name: 'Der Schwarmfürst', env: 'Verfallene Stadt', missions: [
      { id: '5a', name: 'Das Heilmittel', type: 'Heilmittel erforschen',
        intro: [['anselm', 'Die Graupest hat eine Quelle: ein Nest unter der verfallenen Stadt. Aber zuerst brauchen wir das Heilmittel – sonst sterben wir an seinem Atem.']],
        goals: [{ t: 'Erforsche „Das Heilmittel“', g: S => [S.research.done.h8 ? 1 : 0, 1], hint: 'tab:forschung' }],
        reward: { med: 100, know: 100 } },
      { id: '5b', name: 'Saubere Gassen', type: 'Seuche eindämmen',
        intro: [['hildrun', 'Senke den Anteil der Kranken unter 10 % und halte mindestens 40 Bewohner. Dann sind wir bereit.']],
        goals: [{ t: 'Kranke unter 10 %', g: S => [sickShare(S) < 0.1 ? 1 : 0, 1], hint: 'panel:gesundheit' }, { t: 'Mindestens 40 Bewohner', g: S => [Math.min(40, PW.Econ.popTotal(S.pop)), 40] }],
        reward: { coin: 200 } },
      { id: '5c', name: 'Nester ausräuchern', type: 'Seuchennester zerstören',
        intro: [['jorin', 'Drei Nester speisen den Schwarm. Räuchert sie aus – die Region wird es euch danken.']],
        goals: [{ t: 'Zerstöre 3 Seuchennester (auch frühere zählen)', g: S => [Math.min(3, st(S, 'lairs')), 3], hint: 'tab:welt' }],
        reward: { med: 80, coin: 300 } },
      { id: '5d', name: 'Die Seuchenquelle', type: 'Finale',
        intro: [['fuerst', 'Ihr kleinen Feuer in der Nacht … Ich bin der Schwarm. Ich bin jedes Fieber.'], ['hildrun', 'Dann löschen wir dich aus. Für Aschental. Für alle, die wir nicht retten konnten.']],
        onStart: S => K.source(S),
        goals: [{ t: 'Besiege den Schwarmfürsten an der Seuchenquelle', g: S => [flag(S, 'ch5_quelle') ? 1 : 0, 1], hint: 'tab:welt' }],
        reward: { coin: 1000, know: 500 } }
    ] }
  ];
  K.all = () => K.CHAPTERS.reduce((a, c) => a.concat(c.missions.map(m => Object.assign({ ch: c.id, chName: c.name }, m))), []);
  K.mission = S => S.campaign ? K.all()[S.campaign.idx] || null : null;

  // Markiert den nächstgelegenen Ort eines Typs als Missionsziel
  K.markNearest = function (S, type, flagName, guard) {
    const pc = S.world.caps[0];
    const ss = S.world.sites.filter(s => s.type === type && !s.owner && !s.story).sort((a, b) => Wd().dist(S.world, a.tile, pc) - Wd().dist(S.world, b.tile, pc));
    const s = ss[0]; if (!s) { S.storyFlags[flagName] = 1; return; }
    s.story = flagName; s.name = { ch1_ruine: 'Ruine von Ostwacht', ch2_dorf: 'Flüstermoor-Siedlung', ch3_hof: 'Lindenhof' }[flagName] || null;
    if (guard && !s.gar) s.gar = { units: { spear: 14, bow: 10 }, bandit: 1 };
    if (type === 'village') s.patients = Math.max(s.patients || 0, 8);
    S.campaign.markTile = s.tile; Wd().reveal(S, s.tile, 1);
  };
  K.fortress = function (S) {
    const pc = S.world.caps[0];
    const ss = S.world.sites.filter(s => (s.type === 'ruin' || s.type.indexOf('res_') === 0) && !s.owner && !s.story && Wd().dist(S.world, s.tile, pc) >= 4).sort((a, b) => Wd().dist(S.world, a.tile, pc) - Wd().dist(S.world, b.tile, pc));
    const s = ss[0]; if (!s) { S.storyFlags.ch4_feste = 1; return; }
    s.type = 'key'; s.name = 'Eisenfeste'; s.story = 'ch4_feste'; s.cleared = false; S.world.tiles[s.tile].b = 'gebirge';
    s.gar = { units: { spear: 50, bow: 35 }, boss: 'hauptmann', bandit: 1 };
    S.campaign.markTile = s.tile; Wd().reveal(S, s.tile, 1);
  };
  K.source = function (S) {
    let s = S.world.sites.find(x => x.type === 'boss' && !x.cleared) || S.world.sites.find(x => x.type === 'lair' && !x.cleared);
    if (!s) { const pc = S.world.caps[0]; s = S.world.sites.filter(x => !x.owner && x.type !== 'capital').sort((a, b) => Wd().dist(S.world, b.tile, pc) - Wd().dist(S.world, a.tile, pc))[0]; }
    s.type = 'key'; s.name = 'Seuchenquelle'; s.story = 'ch5_quelle'; s.cleared = false; S.world.tiles[s.tile].b = 'ruinen';
    s.gar = { mon: { ratte: 60, gaenger: 25, bestie: 4 }, boss: 'schwarmfuerst' };
    S.campaign.markTile = s.tile; Wd().reveal(S, s.tile, 1);
  };

  K.start = function (S) {
    S.campaign = { idx: 0, base: {}, done: [], stable: 0, pendingDialog: null, markTile: null, finished: false };
    K.begin(S);
  };
  K.begin = function (S) {
    const m = K.mission(S); if (!m) return;
    S.campaign.base = Object.assign({}, S.stats);
    S.campaign.noWaves = !!m.noWaves;
    S.campaign.stable = 0;
    if (m.onStart) m.onStart(S);
    S.campaign.dialog = { lines: m.intro, i: 0, mission: m.id };
    PW.log(S, '📖 Kapitel ' + m.ch + ' · ' + m.name + ' – ' + m.type, 'story');
  };
  K.progress = function (S) {
    const m = K.mission(S); if (!m) return [];
    return m.goals.map(g => { const [c, n] = g.g(S, S.campaign.base); return { t: g.t, c, n, done: c >= n, hint: g.hint }; });
  };
  K.tick = function (S, dt) {
    const c = S.campaign; if (!c || c.finished) return;
    if ((S._rate && S._rate.food > 0 && S._rate.water > 0)) c.stable += dt; else c.stable = 0;
    if (c.forceBoss && S.waves.active && !S.waves.active.boss) { S.waves.active.q.push({ t: S.waves.active.t + 6, type: c.forceBoss, lane: S.waves.active.lanes[0], boss: 1 }); S.waves.active.boss = c.forceBoss; c.forceBoss = null; }
    if (c.dialog) return;
    const prog = K.progress(S);
    if (prog.length && prog.every(p => p.done)) {
      const m = K.mission(S);
      PW.addRes(S.res, m.reward, S._caps);
      if (m.onEnd) m.onEnd(S);
      if (m.unlockHero) PW.Heroes.unlock(S, m.unlockHero, 'Kampagne');
      c.done.push(m.id); c.idx++;
      PW.log(S, '✅ Mission erfüllt: ' + m.name + ' · Belohnung ' + PW.costText(m.reward), 'gut');
      c.markTile = null;
      if (!K.mission(S)) { c.finished = true; PW.stat(S, 'campaign'); c.dialog = { lines: [['erz', 'Der Schwarm zerfällt zu Asche. Über der Zuflucht läuten wieder Glocken.'], ['hildrun', 'Wir haben überlebt. Jetzt bauen wir eine Welt, in der man wieder leben kann. Die Kampagne ist geschafft – das Spiel geht frei weiter.']], i: 0, end: 1 }; S.victory = { kind: 'kampagne', t: S.time }; }
      else K.begin(S);
    }
  };
  K.nextLine = function (S) {
    const d = S.campaign && S.campaign.dialog; if (!d) return null;
    d.i++; if (d.i >= d.lines.length) { S.campaign.dialog = null; return null; }
    return d.lines[d.i];
  };
  K.skipDialog = S => { if (S.campaign) S.campaign.dialog = null; };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
