/* Spinwelten 3D – 16 Computer-Rivalen (klar als Computer markiert, keine echten Personen).
 * Gewichte (0–1) steuern, was ein Bot in seinen Zügen bevorzugt: build, attack, raid, collect, protect, save.
 * mistakes = Wahrscheinlichkeit für eine bewusst ungünstige Entscheidung (kein Hellsehen).
 * look: Farbe, Form und Hut für das selbst gezeichnete Avatar-Bild. */
(function (SW) {
  'use strict';
  SW.BOTS = [
    { id: 'tara',  name: 'Tara Tüftlerin',   fav: 7,  w: { build: 0.9, attack: 0.2, raid: 0.3, collect: 0.4, protect: 0.5, save: 0.8 }, mistakes: 0.08,
      look: { col: '#ffb86b', hat: 'goggles', face: 'round' }, bio: { de: 'Baut sparsam und rechnet jede Münze nach.', en: 'Builds frugally and counts every coin.' } },
    { id: 'bruno', name: 'Bruno Blitz',      fav: 22, w: { build: 0.5, attack: 0.95, raid: 0.6, collect: 0.2, protect: 0.2, save: 0.2 }, mistakes: 0.15,
      look: { col: '#c58bff', hat: 'bolt', face: 'square' }, bio: { de: 'Greift gern an – und vergisst oft den eigenen Schutz.', en: 'Loves to attack – and often forgets his own shield.' } },
    { id: 'nila',  name: 'Nila Nachtfalter', fav: 13, w: { build: 0.5, attack: 0.3, raid: 0.4, collect: 0.95, protect: 0.4, save: 0.4 }, mistakes: 0.1,
      look: { col: '#6b7bd8', hat: 'antenna', face: 'oval' }, bio: { de: 'Sammelt Karten bei Mondlicht.', en: 'Collects cards by moonlight.' } },
    { id: 'pip',   name: 'Pip Pionier',      fav: 21, w: { build: 0.7, attack: 0.3, raid: 0.8, collect: 0.5, protect: 0.3, save: 0.3 }, mistakes: 0.12,
      look: { col: '#2ec4a6', hat: 'explorer', face: 'round' }, bio: { de: 'Erkundet jede Insel zuerst.', en: 'Explores every island first.' } },
    { id: 'momo',  name: 'Momo Mechanikus',  fav: 18, w: { build: 0.7, attack: 0.25, raid: 0.3, collect: 0.3, protect: 0.95, save: 0.5 }, mistakes: 0.06,
      look: { col: '#8fa6b8', hat: 'gear', face: 'square' }, bio: { de: 'Hat immer einen Schutzorb in Reserve.', en: 'Always keeps a shield orb in reserve.' } },
    { id: 'lio',   name: 'Lio Lichtschmied', fav: 12, w: { build: 0.6, attack: 0.4, raid: 0.4, collect: 0.4, protect: 0.4, save: 0.95 }, mistakes: 0.07,
      look: { col: '#ffd98a', hat: 'crown', face: 'oval' }, bio: { de: 'Spart Ressourcen für den großen Moment.', en: 'Saves resources for the big moment.' } },
    { id: 'yara',  name: 'Yara Windsegel',   fav: 6,  w: { build: 0.8, attack: 0.4, raid: 0.5, collect: 0.3, protect: 0.4, save: 0.3 }, mistakes: 0.1,
      look: { col: '#9fd0ff', hat: 'pilot', face: 'round' }, bio: { de: 'Fliegt schneller, als sie baut.', en: 'Flies faster than she builds.' } },
    { id: 'ole',   name: 'Ole Ofenherz',     fav: 9,  w: { build: 0.6, attack: 0.7, raid: 0.4, collect: 0.2, protect: 0.3, save: 0.4 }, mistakes: 0.14,
      look: { col: '#ff7a6b', hat: 'chef', face: 'square' }, bio: { de: 'Hitzkopf mit warmem Herzen.', en: 'Hothead with a warm heart.' } },
    { id: 'ilvi',  name: 'Ilvi Frostfeder',  fav: 10, w: { build: 0.7, attack: 0.3, raid: 0.3, collect: 0.6, protect: 0.7, save: 0.5 }, mistakes: 0.08,
      look: { col: '#b6f0ff', hat: 'beanie', face: 'oval' }, bio: { de: 'Ruhig, geduldig und gut geschützt.', en: 'Calm, patient and well protected.' } },
    { id: 'kalu',  name: 'Kalu Korallenkind', fav: 11, w: { build: 0.6, attack: 0.3, raid: 0.7, collect: 0.6, protect: 0.3, save: 0.4 }, mistakes: 0.12,
      look: { col: '#ff9e8a', hat: 'shell', face: 'round' }, bio: { de: 'Taucht nach Schätzen in fremden Gärten.', en: 'Dives for treasure in other gardens.' } },
    { id: 'fenja', name: 'Fenja Funkenflug', fav: 19, w: { build: 0.5, attack: 0.6, raid: 0.6, collect: 0.5, protect: 0.2, save: 0.2 }, mistakes: 0.18,
      look: { col: '#ff8ae0', hat: 'jester', face: 'oval' }, bio: { de: 'Spontan, laut und unberechenbar.', en: 'Spontaneous, loud and unpredictable.' } },
    { id: 'tamo',  name: 'Tamo Teeblatt',    fav: 4,  w: { build: 0.85, attack: 0.1, raid: 0.2, collect: 0.5, protect: 0.6, save: 0.6 }, mistakes: 0.05,
      look: { col: '#7bd88f', hat: 'leaf', face: 'round' }, bio: { de: 'Der Friedlichste im Archipel.', en: 'The most peaceful one in the archipelago.' } },
    { id: 'rasmus', name: 'Rasmus Rätsel',   fav: 17, w: { build: 0.6, attack: 0.35, raid: 0.45, collect: 0.8, protect: 0.4, save: 0.5 }, mistakes: 0.09,
      look: { col: '#d8b46b', hat: 'book', face: 'square' }, bio: { de: 'Liest Truhen wie Bücher.', en: 'Reads chests like books.' } },
    { id: 'zoe',   name: 'Zoe Zahnrad',      fav: 7,  w: { build: 0.9, attack: 0.5, raid: 0.3, collect: 0.3, protect: 0.5, save: 0.3 }, mistakes: 0.1,
      look: { col: '#e3b46a', hat: 'gear', face: 'round' }, bio: { de: 'Baut am liebsten nachts weiter.', en: 'Prefers building at night.' } },
    { id: 'jori',  name: 'Jori Jadewächter', fav: 20, w: { build: 0.6, attack: 0.5, raid: 0.5, collect: 0.4, protect: 0.8, save: 0.5 }, mistakes: 0.07,
      look: { col: '#2ec4a6', hat: 'helmet', face: 'oval' }, bio: { de: 'Schlägt nur zurück, greift selten zuerst an.', en: 'Strikes back, rarely strikes first.' } },
    { id: 'suki',  name: 'Suki Sternenstaub', fav: 30, w: { build: 0.75, attack: 0.45, raid: 0.55, collect: 0.7, protect: 0.45, save: 0.45 }, mistakes: 0.04,
      look: { col: '#f2d08a', hat: 'star', face: 'round' }, bio: { de: 'Die erfahrenste Hüterin – fair, aber stark.', en: 'The most experienced keeper – fair but strong.' } }
  ];
  // Stärke (Einstellung): wie schnell Bots vorankommen und wie oft sie aktiv werden
  SW.BOT_LEVELS = {
    easy:   { speed: 0.6, actPerHour: 2, attackShare: 0.5 },
    normal: { speed: 1.0, actPerHour: 3, attackShare: 0.8 },
    hard:   { speed: 1.4, actPerHour: 4, attackShare: 1.0 }
  };
})(globalThis.SW = globalThis.SW || {});
