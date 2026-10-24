/* EASYCLASH – Kämpfer aus allen easygames. Jede Figur: id, n (Name), game/gameN (Herkunft), sp (Spezialangriff), stats, look (Aussehen), d (Kurzinfo).
 * Spezial: shot (Energiestoß), rush (Sturmangriff), spin (Wirbel), dive (Sturzflug), upper (Himmelsfaust), stomp (Bodenbeben).
 * stats: walk/back (Tempo), power (Schaden), speed (Angriffstempo), reach, weight (Rückstoß-Widerstand). */
(function (root) {
  'use strict';
  const R = [];
  const add = (game, gameN, list) => list.forEach(c => R.push(Object.assign({ game, gameN, stats: {} }, c)));
  // Rico – der Hausherr (2048 Deluxe, Hüpfstraße)
  add('deluxe-2048', '2048 Deluxe', [
    { id: 'rico', n: 'Rico', sp: 'shot', d: 'Moderator mit Mikro – seine Schallwelle trifft auf Distanz.', stats: { power: 1.05 },
      look: { skin: '#f2c6a4', top: '#8645e0', bottom: '#2c3554', hair: { style: 'spiky', color: '#4b2e1a' }, beard: '#5e3b22', septum: '#e8ebf6', earplug: true, mic: true, headphones: false, eyes: '#5a3216', fx: '#c77dff', print: '#ffffff' } }
  ]);
  // Sendemast-Sumo
  const sumo = (id, n, col, col2, skin, hair, hs, sp, st, extra) => ({ id: 'sumo-' + id, n, sp, d: 'Sumo-Star aus Sendemast-Sumo.', stats: st, look: Object.assign({ skin, top: skin, bottom: col, shoes: skin, sleeves: false, bulk: 1.3, belly: null, hair: { style: hs, color: hair }, fx: col2, gloves: null }, extra || {}) });
  add('sendemast-sumo', 'Sendemast-Sumo', [
    sumo('toni', 'Toni Tornado', '#ff5a4e', '#ffd166', '#f2c19b', '#2b1d14', 'bun', 'spin', { power: 1.05 }),
    sumo('bella', 'Bella Bass', '#8e5cff', '#3df0c4', '#c98a62', '#1a1020', 'bun', 'shot', { speed: 1.08, weight: .9 }),
    sumo('kalle', 'Kalle Koloss', '#3a86ff', '#ffbe0b', '#f5cfb0', '#7a4a24', 'bun', 'stomp', { power: 1.15, walk: 2.0, weight: 1.35, speed: .92 }, { hat: { type: 'band', color: '#ffbe0b' }, bulk: 1.45 }),
    sumo('mimi', 'Mimi Mikro', '#ff70a6', '#ffffff', '#ffd9c2', '#ff9f1c', 'pony', 'rush', { speed: 1.12, walk: 2.8, weight: .82 }, { bulk: 1.1 }),
    sumo('ole', 'Ole Orkan', '#06d6a0', '#073b4c', '#8d5a3b', '#111111', 'mohawk', 'rush', {}),
    sumo('frieda', 'Frieda Frost', '#9bf6ff', '#4361ee', '#f7d7c4', '#e8eef7', 'bun', 'shot', { speed: 1.04 }, { hat: { type: 'band', color: '#4361ee' } }),
    sumo('bruno', 'Bruno Brummer', '#ffb703', '#6a4c93', '#e0a47a', '#3b2a1a', 'bun', 'stomp', { power: 1.1, weight: 1.2 }, { beard: '#3b2a1a' }),
    sumo('nova', 'Nova Neon', '#c77dff', '#f72585', '#a86b4c', '#f72585', 'pony', 'upper', { speed: 1.08 }, { hat: { type: 'band', color: '#f72585' } })
  ]);
  // Wolkenhopser
  const hop = (id, n, body, belly, sp, extra) => ({ id: 'hopsi-' + id, n, sp, d: 'Springt aus dem Wolkenhopser in den Ring.', stats: { walk: 2.7, speed: 1.06, weight: .85 }, look: Object.assign({ kind: 'blob', skin: body, top: body, bottom: body, shoes: '#ffffff', belly, eyes: '#1b1b1b', fx: belly, size: .92 }, extra || {}) });
  add('wolkenhopser', 'Wolkenhopser', [
    hop('hopsi', 'Hopsi', '#7bdc5a', '#d9f7b0', 'dive'),
    hop('ninja', 'Ninja-Hopsi', '#2f2a45', '#4b4566', 'spin', { hat: { type: 'band', color: '#ff1744' } }),
    hop('astro', 'Astro-Hopsi', '#f2f4ff', '#cfd6ff', 'shot', { hat: { type: 'helmet', color: '#ffffff' } }),
    hop('drache', 'Mini-Drache', '#ff9f1c', '#ffe3a8', 'shot', { horn: '#ffffff', tail: '#ff9f1c', fx: '#ff5722' }),
    hop('gold', 'Gold-Hopsi', '#ffd23f', '#fff2b8', 'upper', { hat: { type: 'crown' } })
  ]);
  // Hüpfstraße
  add('huepfstrasse', 'Hüpfstraße', [
    { id: 'hs-star', n: 'Glamour-Star', sp: 'spin', d: 'Oranger Mantel, blonde Mähne – Auftritt mit Wirbel.', stats: { speed: 1.05 }, look: { skin: '#f0c8a8', top: '#f7f2e6', jacket: '#ff7a2e', bottom: '#8d9096', shoes: '#1b1b1b', hair: { style: 'fringe', color: '#f6e7a6' }, beard: '#a07a55', septum: '#e2b84a', fx: '#ff7a2e' } },
    { id: 'hs-flitzer', n: 'Kleiner Flitzer', sp: 'rush', d: 'Klein, flink und mit Fernsteuerung.', stats: { walk: 3.0, speed: 1.12, weight: .75, power: .9 }, look: { skin: '#f5d0b5', top: '#1f2a44', bottom: '#7a5230', shoes: '#1f2a44', hair: { style: 'bowl', color: '#f6dc8a' }, eyes: '#5d6d7e', print: '#b388ff', size: .8, head: 1.25, fx: '#4fc3f7', antenna: '#ff3d00' } },
    { id: 'hs-wanderin', n: 'Waldläuferin', sp: 'rush', d: 'Mit Brille und Wanderschritt – und Hund im Herzen.', stats: {}, look: { skin: '#f0c8a8', top: '#fafafa', bottom: '#9aa0a8', shoes: '#f4f4f8', hair: { style: 'bob', color: '#7b3b22' }, glasses: '#b0b4bc', eyes: '#4a2a14', fx: '#9be37a' } },
    { id: 'hs-fan', n: 'Hallen-Fan', sp: 'stomp', d: 'Rote Kapuze, Jeansjacke – die Halle bebt.', stats: { power: 1.05 }, look: { skin: '#f0c8a8', top: '#e53935', jacket: '#5b7fb0', bottom: '#8fb3d9', shoes: '#e53935', hair: { style: 'long', color: '#d9b36a' }, hat: { type: 'sunglasses' }, fx: '#ff5252' } },
    { id: 'hs-pingu', n: 'Pingu', sp: 'dive', d: 'Watschelt cool – und fällt von oben.', stats: { weight: .9 }, look: { kind: 'bird', skin: '#222831', top: '#222831', belly: '#ffffff', wing: '#222831', legs: '#ff9800', beak: '#ff9800', fx: '#80d8ff' } },
    { id: 'hs-robo', n: 'Robo', sp: 'shot', d: 'Piept bei jedem Treffer.', stats: { weight: 1.2, walk: 2.1 }, look: { kind: 'robot', skin: '#cfd8dc', top: '#b0bec5', bottom: '#78909c', shoes: '#455a64', eyes: '#00e5ff', antenna: '#ff1744', fx: '#00e5ff' } },
    { id: 'hs-einhorn', n: 'Einhorn', sp: 'upper', d: 'Glitzert sogar im Ring.', stats: {}, look: { kind: 'beast', skin: '#fafafa', top: '#fafafa', bottom: '#fafafa', shoes: '#b39ddb', horn: '#ffd54f', hair: { style: 'long', color: '#ff80ab' }, snout: '#f8bbd0', tail: '#b388ff', ears: 'cat', fx: '#ff80ab' } },
    { id: 'hs-fuchs', n: 'Flinker Fuchs', sp: 'rush', d: 'Schlau, schnell, orange.', stats: { walk: 2.9, speed: 1.1 }, look: { kind: 'beast', skin: '#ff7a1a', top: '#ff7a1a', bottom: '#3e2723', shoes: '#3e2723', belly: '#ffffff', snout: '#ffffff', ears: 'fox', tail: '#ff7a1a', fx: '#ffab40' } },
    { id: 'hs-panda', n: 'Panda', sp: 'stomp', d: 'Gemütlich – bis es knallt.', stats: { weight: 1.25, power: 1.08, walk: 2.0 }, look: { kind: 'beast', skin: '#fafafa', top: '#1b1b1b', bottom: '#1b1b1b', shoes: '#1b1b1b', ears: 'bear', earColor: '#1b1b1b', snout: '#ffffff', bulk: 1.2, fx: '#9be37a' } }
  ]);
  // KIKO – Das Geheimnis der Sterneninseln
  const kiko = (id, n, body, belly, feet, acc, sp, extra) => ({ id: 'kiko-' + id, n, sp, d: 'Sternen-Held aus KIKO.', stats: { walk: 2.7, speed: 1.05, weight: .9 }, look: Object.assign({ kind: 'blob', skin: body, top: body, bottom: feet, shoes: feet, belly, eyes: '#1b1b1b', fx: acc, size: .95 }, extra) });
  add('kiko-sterneninseln', 'KIKO', [
    kiko('kiko', 'Kiko', '#29c4c2', '#9cead8', '#287e9f', '#ffd16d', 'shot', { antenna: '#ffd16d' }),
    kiko('mira', 'Mira', '#a58be2', '#e5d8ff', '#7763b0', '#8de8e2', 'spin', { ears: 'cat', earColor: '#a58be2' }),
    kiko('boro', 'Boro', '#e0a34c', '#ffe1a2', '#946547', '#9edbd0', 'stomp', { horn: '#9edbd0', bulk: 1.15 }),
    kiko('lumi', 'Lumi', '#ea889e', '#ffd9d6', '#ad627f', '#ffe28d', 'dive', { wings: '#ffe28d' })
  ]);
  // Krawallvögel
  const vogel = (id, n, col, belly, sp, st, extra) => ({ id: 'kv-' + id, n, sp, d: 'Wütender Vogel aus Krawallvögel.', stats: st || {}, look: Object.assign({ kind: 'bird', skin: col, top: col, wing: col, belly, legs: '#ffa726', beak: '#ffb300', eyes: '#1b1b1b', brows: '#1b1b1b', fx: col }, extra || {}) });
  add('krawallvoegel', 'Krawallvögel', [
    vogel('rudi', 'Rudi', '#d92a2a', '#f4d6b0', 'rush', { power: 1.08 }, { hair: { style: 'mohawk', color: '#a01818' } }),
    vogel('zisch', 'Zisch', '#f5d020', '#fff3b0', 'rush', { walk: 3.0, speed: 1.12, weight: .85 }),
    vogel('bumm', 'Bumm', '#24262c', '#5a5e68', 'stomp', { power: 1.15, weight: 1.25, walk: 1.9 }, { size: 1.08, fx: '#ff7043' }),
    vogel('mathilde', 'Mathilde', '#f3f1ea', '#ffffff', 'dive', {})
  ]);
  // TASCHI – Die 16 Lichter
  add('taschi', 'TASCHI', [
    { id: 'ta-auraflamme', n: 'Auraflamme', sp: 'shot', d: 'Uraltes Taschi des Sonnenfeuers.', stats: { power: 1.08 }, look: { kind: 'beast', skin: '#ff9654', top: '#ff9654', bottom: '#d9642a', shoes: '#8a3a18', snout: '#ffd0a0', ears: 'fox', tail: '#ff5722', wings: '#ffcc80', fx: '#ff5722' } },
    { id: 'ta-tiefenlied', n: 'Tiefenlied', sp: 'shot', d: 'Wächter der tiefsten Korallenströme.', stats: { weight: 1.15 }, look: { kind: 'blob', skin: '#478fc7', top: '#478fc7', bottom: '#2c5f8a', shoes: '#2c5f8a', belly: '#bfe3ff', horn: '#bfe3ff', tail: '#478fc7', fx: '#4fc3f7' } },
    { id: 'ta-sturmkron', n: 'Sturmkron', sp: 'dive', d: 'Herrscher des Sturms.', stats: { speed: 1.1, walk: 2.8 }, look: { kind: 'bird', skin: '#f4d974', top: '#f4d974', wing: '#e0b83a', belly: '#fff6c8', legs: '#6d5a1a', beak: '#5a4a1a', hat: { type: 'crown' }, fx: '#ffee58' } },
    { id: 'ta-mondhueter', n: 'Mondhüter', sp: 'upper', d: 'Stiller Beschützer des Mondlichts.', stats: {}, look: { kind: 'blob', skin: '#9a8bd6', top: '#9a8bd6', bottom: '#6a5aa6', shoes: '#6a5aa6', belly: '#e0d8ff', ears: 'bunny', earColor: '#9a8bd6', fx: '#b39ddb' } }
  ]);
  // AnMaCha Kart Rush
  add('anmacha-kart', 'AnMaCha Kart Rush', [
    { id: 'kart-mia', n: 'Mia', sp: 'rush', d: 'Rennfahrerin mit Bleifuß.', stats: { walk: 2.7, speed: 1.06 }, look: { skin: '#f0c090', top: '#f4f6fb', bottom: '#ff2d95', shoes: '#ff2d95', hair: { style: 'pony', color: '#3b2314' }, hat: { type: 'helmet', color: '#ff2d95' }, fx: '#ff2d95' } },
    { id: 'kart-brumm', n: 'Brumm', sp: 'stomp', d: 'Der Bär am Steuer.', stats: { power: 1.12, weight: 1.3, walk: 2.0 }, look: { kind: 'beast', skin: '#8a5a2a', top: '#e8d8b8', bottom: '#8a5a2a', shoes: '#5a3a1a', ears: 'bear', snout: '#c49a6a', bulk: 1.25, fx: '#c4453a' } },
    { id: 'kart-luna', n: 'Luna', sp: 'spin', d: 'Die Katze mit den schnellen Krallen.', stats: { speed: 1.1, walk: 2.8 }, look: { kind: 'beast', skin: '#9aa3b8', top: '#e8ecf8', bottom: '#9aa3b8', shoes: '#6a7388', ears: 'cat', snout: '#e8ecf8', tail: '#9aa3b8', eyes: '#3f9a3a', fx: '#8b5cf6' } },
    { id: 'kart-quak', n: 'Quak', sp: 'dive', d: 'Springt höher als alle anderen.', stats: { weight: .9 }, look: { kind: 'blob', skin: '#4cc84a', top: '#4cc84a', bottom: '#2e8a2c', shoes: '#2e8a2c', belly: '#d8f8c8', head: 1.2, eyes: '#1b1b1b', fx: '#00c46a' } },
    { id: 'kart-funke', n: 'Funke', sp: 'shot', d: 'Kleiner Drache, großes Feuer.', stats: { power: 1.06 }, look: { kind: 'beast', skin: '#3da84a', top: '#ffd890', bottom: '#3da84a', shoes: '#2a7a34', snout: '#ffd890', horn: '#ffd890', tail: '#3da84a', wings: '#e8412a', fx: '#ff7043' } },
    { id: 'kart-zorp', n: 'Zorp', sp: 'shot', d: 'Kam vom Mars – nur zum Kämpfen.', stats: {}, look: { skin: '#9a5cff', top: '#5a3aa8', bottom: '#5a3aa8', shoes: '#7cff6a', eyes: '#000000', head: 1.2, antenna: '#7cff6a', fx: '#7cff6a' } },
    { id: 'kart-hoppel', n: 'Hoppel', sp: 'dive', d: 'Hoppelt, hüpft, haut.', stats: { walk: 2.8, weight: .85 }, look: { kind: 'beast', skin: '#fff0f6', top: '#ffd0e4', bottom: '#fff0f6', shoes: '#ffa0c8', ears: 'bunny', snout: '#ffffff', fx: '#ffa0c8' } }
  ]);
  // Winzflitzer 3D
  add('winzflitzer', 'Winzflitzer 3D', [
    { id: 'wf-rosa', n: 'Rosa', sp: 'rush', d: 'Amtierende Küchentisch-Meisterin.', stats: { speed: 1.08 }, look: { skin: '#f2c6a4', top: '#e74c3c', bottom: '#2c2c3a', shoes: '#ffffff', hair: { style: 'pony', color: '#7a2a1a' }, hat: { type: 'cap', color: '#e74c3c' }, fx: '#e74c3c' } },
    { id: 'wf-jaro', n: 'Jaro', sp: 'rush', d: 'Kennt keine Bremse. Wirklich keine.', stats: { walk: 2.9 }, look: { skin: '#d9a47a', top: '#2f8bff', bottom: '#1b2a4a', shoes: '#ffffff', hair: { style: 'curly', color: '#1b1b1b' }, fx: '#2f8bff' } },
    { id: 'wf-lotte', n: 'Lotte', sp: 'shot', d: 'Fährt immer die Ideallinie.', stats: {}, look: { skin: '#f5d0b5', top: '#ff3b6b', bottom: '#2c3554', shoes: '#ff3b6b', hair: { style: 'bob', color: '#e8c25a' }, glasses: '#333333', fx: '#ff3b6b' } }
  ]);
  // Urwaldlager
  add('anmacha-urwaldlager', 'Urwaldlager', [
    { id: 'ul-tina', n: 'Tina Tornado', sp: 'spin', d: 'Reality-Sternchen mit Wirbel.', stats: { speed: 1.06 }, look: { skin: '#f1c9a5', top: '#ff5fa2', bottom: '#2c2c3a', shoes: '#ff5fa2', hair: { style: 'long', color: '#e8c25a' }, fx: '#ff5fa2' } },
    { id: 'ul-bernd', n: 'Dr. Bernd Brummel', sp: 'shot', d: 'Zahnarzt – und Stratege.', stats: { walk: 2.1 }, look: { skin: '#e8b98f', top: '#2e7bd6', bottom: '#3a3a44', shoes: '#1b1b1b', hair: { style: 'short', color: '#8a8a8a' }, glasses: '#333333', fx: '#80d8ff' } },
    { id: 'ul-kalle', n: 'Kalle Kranich', sp: 'rush', d: 'Ex-Torwart, hält alles.', stats: { weight: 1.15 }, look: { skin: '#d9a47a', top: '#d62828', bottom: '#1b1b1b', shoes: '#ffffff', hair: { style: 'short', color: '#3b2a1c' }, beard: '#3b2a1c', gloves: '#ffd23f', fx: '#d62828' } },
    { id: 'ul-gisela', n: 'Gisela Glanz', sp: 'shot', d: 'Schlagersängerin mit Durchschlagskraft.', stats: { walk: 2.0 }, look: { skin: '#f2cfb3', top: '#f4a300', bottom: '#7a4a10', shoes: '#f4a300', hair: { style: 'bun', color: '#e9e9e9' }, mic: true, fx: '#ffd23f' } },
    { id: 'ul-rocco', n: 'Rocco Rüstig', sp: 'stomp', d: 'Ex-Bodybuilder. Mehr muss man nicht wissen.', stats: { power: 1.15, weight: 1.3, walk: 1.9, speed: .94 }, look: { skin: '#a86f4c', top: '#222831', bottom: '#222831', shoes: '#111111', hair: { style: 'bald', color: '#111111' }, beard: '#111111', bulk: 1.3, sleeves: false, fx: '#ff7043' } },
    { id: 'ul-egon', n: 'Prinz Egon', sp: 'upper', d: 'Adelsspross mit Krone.', stats: {}, look: { skin: '#f3d6bf', top: '#6a1b9a', bottom: '#2c2c3a', shoes: '#1b1b1b', hair: { style: 'short', color: '#cfcfcf' }, hat: { type: 'crown' }, cape: '#b71c1c', fx: '#ffd23f' } }
  ]);
  // Pestwacht – Die letzte Zuflucht
  add('pestwacht', 'Pestwacht', [
    { id: 'pw-mira', n: 'Mira Falkenaug', sp: 'shot', d: 'Bogenschützin – trifft aus jeder Entfernung.', stats: { speed: 1.06 }, look: { skin: '#e8c4a4', top: '#3e6b3a', bottom: '#5a4030', shoes: '#3a2a1a', hair: { style: 'pony', color: '#a0522d' }, cape: '#2e4d2a', fx: '#9be37a' } },
    { id: 'pw-brand', n: 'Meister Brand', sp: 'stomp', d: 'Schmied mit Hammerfaust.', stats: { power: 1.15, weight: 1.25, walk: 1.9 }, look: { skin: '#c88a62', top: '#5d4037', bottom: '#3e2723', shoes: '#1b1b1b', hair: { style: 'bald', color: '#5a2a10' }, beard: '#5a2a10', bulk: 1.25, sleeves: false, fx: '#ff7043' } },
    { id: 'pw-jorin', n: 'Jorin Nebelpfad', sp: 'spin', d: 'Kundschafter aus dem Nebel.', stats: { walk: 2.8, speed: 1.1 }, look: { skin: '#e3b08a', top: '#455a64', bottom: '#263238', shoes: '#1b1b1b', hair: { style: 'long', color: '#2b1b12' }, scarf: '#607d8b', fx: '#b0bec5' } },
    { id: 'pw-ottokar', n: 'Ottokar der Graue', sp: 'shot', d: 'Alter Gelehrter der Zuflucht.', stats: { walk: 2.0, power: 1.05 }, look: { skin: '#e8c4a4', top: '#757575', bottom: '#424242', shoes: '#212121', hair: { style: 'short', color: '#d0d0d0' }, beard: '#d0d0d0', cape: '#5a5a5a', fx: '#e0e0e0' } }
  ]);
  // Spinwelten 3D
  add('spinwelten', 'Spinwelten 3D', [
    { id: 'sw-zoe', n: 'Zoe Zahnrad', sp: 'spin', d: 'Tüftlerin mit Drehmoment.', stats: { speed: 1.05 }, look: { skin: '#e0a47a', top: '#ff8f00', bottom: '#37474f', shoes: '#212121', hair: { style: 'bun', color: '#3b2314' }, glasses: '#ffb300', fx: '#ffb300' } },
    { id: 'sw-suki', n: 'Suki Sternenstaub', sp: 'upper', d: 'Funkelt bei jedem Treffer.', stats: { walk: 2.7 }, look: { skin: '#f5d0b5', top: '#7c4dff', bottom: '#311b92', shoes: '#ffd23f', hair: { style: 'long', color: '#b388ff' }, fx: '#e040fb' } },
    { id: 'sw-rasmus', n: 'Rasmus Rätsel', sp: 'shot', d: 'Löst jeden Kampf wie ein Rätsel.', stats: {}, look: { skin: '#f2c6a4', top: '#00897b', bottom: '#263238', shoes: '#212121', hair: { style: 'curly', color: '#c0392b' }, hat: { type: 'tophat', color: '#212121' }, fx: '#4db6ac' } }
  ]);
  // FABELKICK 3D
  add('fabelkick', 'FABELKICK 3D', [
    { id: 'fk-bobo', n: 'Bobo', sp: 'rush', d: 'Urwald-Affe – flink und frech.', stats: { walk: 2.9, speed: 1.08 }, look: { kind: 'beast', skin: '#8d5a3b', top: '#f4c430', bottom: '#1f6b3a', shoes: '#f4c430', snout: '#e0b48a', ears: 'bear', earColor: '#e0b48a', tail: '#8d5a3b', fx: '#f4c430' } },
    { id: 'fk-brutus', n: 'Brutus', sp: 'stomp', d: 'Silberrücken – stark wie ein Baum.', stats: { power: 1.18, weight: 1.35, walk: 1.9, speed: .92 }, look: { kind: 'beast', skin: '#30333b', top: '#20232b', bottom: '#c9ced8', shoes: '#20232b', snout: '#5a5e68', ears: 'bear', bulk: 1.35, fx: '#c9ced8' } }
  ]);
  // AnMaCha Radio Maze 3D
  add('radio-maze', 'Radio Maze 3D', [
    { id: 'rm-rauschi', n: 'Rauschi', sp: 'shot', d: 'Das Störgeräusch aus dem Labyrinth.', stats: { walk: 2.6 }, look: { kind: 'blob', skin: '#ff2b2b', top: '#ff2b2b', bottom: '#c41a1a', shoes: '#c41a1a', eyes: '#1a3cff', fx: '#ff5252' } }
  ]);
  // Ulk-Kämpfer
  add('easyclash', 'EASYCLASH-Ulk', [
    { id: 'ulk-wurst', n: 'Kampf-Würstchen', sp: 'shot', d: 'Schießt mit Senf. Riecht nach Grillfest.', stats: { weight: 1.05 }, look: { kind: 'blob', shape: 'tall', skin: '#c9683a', top: '#c9683a', bottom: '#c9683a', shoes: '#8d3f1d', print: '#ffd23f', eyes: '#1b1b1b', fx: '#ffd23f' } },
    { id: 'ulk-gurke', n: 'Box-Gurke', sp: 'upper', d: 'Grün, knackig – und mit Boxhandschuhen.', stats: { power: 1.08, speed: 1.05 }, look: { kind: 'blob', shape: 'tall', skin: '#4caf50', top: '#4caf50', bottom: '#2e7d32', shoes: '#2e7d32', gloves: '#e53935', bumps: '#81c784', eyes: '#1b1b1b', fx: '#9be37a' } },
    { id: 'ulk-klopapier', n: 'Klopapier-Ninja', sp: 'spin', d: 'Weich, aber gefährlich – drei Lagen Kampfkunst.', stats: { walk: 2.8, speed: 1.12, weight: .8 }, look: { kind: 'blob', shape: 'roll', skin: '#fafafa', top: '#fafafa', bottom: '#eceff1', shoes: '#212121', hat: { type: 'band', color: '#1b1b1b' }, scarf: '#e53935', eyes: '#1b1b1b', fx: '#ffffff' } }
  ]);
  root.EC_ROSTER = R;
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
