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
  // Ulk-Kämpfer
  add('easyclash', 'EASYCLASH-Ulk', [
    { id: 'ulk-wurst', n: 'Kampf-Würstchen', sp: 'shot', d: 'Schießt mit Senf. Riecht nach Grillfest.', stats: { weight: 1.05 }, look: { kind: 'blob', shape: 'tall', skin: '#c9683a', top: '#c9683a', bottom: '#c9683a', shoes: '#8d3f1d', print: '#ffd23f', eyes: '#1b1b1b', fx: '#ffd23f' } },
    { id: 'ulk-gurke', n: 'Box-Gurke', sp: 'upper', d: 'Grün, knackig – und mit Boxhandschuhen.', stats: { power: 1.08, speed: 1.05 }, look: { kind: 'blob', shape: 'tall', skin: '#4caf50', top: '#4caf50', bottom: '#2e7d32', shoes: '#2e7d32', gloves: '#e53935', bumps: '#81c784', eyes: '#1b1b1b', fx: '#9be37a' } },
    { id: 'ulk-klopapier', n: 'Klopapier-Ninja', sp: 'spin', d: 'Weich, aber gefährlich – drei Lagen Kampfkunst.', stats: { walk: 2.8, speed: 1.12, weight: .8 }, look: { kind: 'blob', shape: 'roll', skin: '#fafafa', top: '#fafafa', bottom: '#eceff1', shoes: '#212121', hat: { type: 'band', color: '#1b1b1b' }, scarf: '#e53935', eyes: '#1b1b1b', fx: '#ffffff' } }
  ]);
  root.EC_ROSTER = R;
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
