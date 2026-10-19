/* ColorPop Universe – rein kosmetische Designs (20 Steinoberflächen, 12 Knall-Effekte, 6 Hintergründe). Formen und Symbole der Farben
 * bleiben in jedem Design gleich, damit die Steine immer erkennbar sind. Freischalten nur durch Spielen (Sterne, Welten, Erfolge). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  // need: {stars:n} | {world:n} (Welt komplett) | {ach:n} (Anzahl Erfolge) | null (frei)
  CPU.SKINS = {
    stone: [
      { id: 'jelly', name: 'Gelee', need: null, s: { r: 0.3, gloss: 0.9, bevel: 0.5, sat: 1, mat: 'jelly' } },
      { id: 'crystal', name: 'Kristall', need: null, s: { r: 0.18, gloss: 1, bevel: 0.8, sat: 1, mat: 'crystal' } },
      { id: 'ceramic', name: 'Keramik', need: { stars: 15 }, s: { r: 0.26, gloss: 0.5, bevel: 0.6, sat: 0.9, mat: 'ceramic' } },
      { id: 'candy', name: 'Bonbon', need: { world: 1 }, s: { r: 0.45, gloss: 1, bevel: 0.4, sat: 1.1, mat: 'candy' } },
      { id: 'gem', name: 'Edelstein', need: { world: 2 }, s: { r: 0.12, gloss: 1, bevel: 1, sat: 1.05, mat: 'facet' } },
      { id: 'cloud', name: 'Wolkenweich', need: { world: 3 }, s: { r: 0.5, gloss: 0.6, bevel: 0.3, sat: 0.85, mat: 'soft' } },
      { id: 'pearl', name: 'Perlmutt', need: { world: 4 }, s: { r: 0.42, gloss: 0.95, bevel: 0.5, sat: 0.8, mat: 'pearl' } },
      { id: 'amber', name: 'Bernstein', need: { world: 5 }, s: { r: 0.3, gloss: 0.85, bevel: 0.7, sat: 0.95, mat: 'glass' } },
      { id: 'magma', name: 'Magma', need: { world: 6 }, s: { r: 0.2, gloss: 0.4, bevel: 0.9, sat: 1.15, mat: 'rough' } },
      { id: 'neon', name: 'Neonröhre', need: { world: 7 }, s: { r: 0.28, gloss: 0.3, bevel: 0.2, sat: 1.2, mat: 'neon' } },
      { id: 'frost', name: 'Raureif', need: { world: 8 }, s: { r: 0.22, gloss: 0.8, bevel: 0.6, sat: 0.75, mat: 'frost' } },
      { id: 'brass', name: 'Messing', need: { world: 9 }, s: { r: 0.2, gloss: 0.7, bevel: 1, sat: 0.9, mat: 'metal' } },
      { id: 'nebula', name: 'Nebula', need: { world: 10 }, s: { r: 0.35, gloss: 0.7, bevel: 0.5, sat: 1.05, mat: 'nebula' } },
      { id: 'dream', name: 'Traumschaum', need: { world: 11 }, s: { r: 0.48, gloss: 0.9, bevel: 0.35, sat: 0.95, mat: 'jelly' } },
      { id: 'prism', name: 'Prisma', need: { world: 12 }, s: { r: 0.15, gloss: 1, bevel: 1, sat: 1.1, mat: 'facet' } },
      { id: 'marble', name: 'Marmor', need: { stars: 60 }, s: { r: 0.24, gloss: 0.6, bevel: 0.6, sat: 0.85, mat: 'marble' } },
      { id: 'glass', name: 'Glas', need: { stars: 120 }, s: { r: 0.3, gloss: 1, bevel: 0.4, sat: 1, mat: 'glass' } },
      { id: 'pixel', name: 'Pixel', need: { ach: 10 }, s: { r: 0.02, gloss: 0.2, bevel: 0.6, sat: 1.1, mat: 'pixel' } },
      { id: 'flat', name: 'Flach & klar', need: null, s: { r: 0.22, gloss: 0, bevel: 0, sat: 1, mat: 'flat' } },
      { id: 'gold', name: 'Goldrand', need: { stars: 300 }, s: { r: 0.25, gloss: 0.9, bevel: 0.9, sat: 1, mat: 'gold' } }
    ],
    pop: [
      { id: 'spark', name: 'Funken', need: null, p: { shape: 'spark', n: 6 } },
      { id: 'confetti', name: 'Konfetti', need: null, p: { shape: 'confetti', n: 7 } },
      { id: 'bubble', name: 'Blasen', need: { world: 4 }, p: { shape: 'bubble', n: 5 } },
      { id: 'star', name: 'Sternchen', need: { stars: 30 }, p: { shape: 'star', n: 5 } },
      { id: 'shard', name: 'Splitter', need: { world: 2 }, p: { shape: 'shard', n: 6 } },
      { id: 'leaf', name: 'Blätter', need: { world: 5 }, p: { shape: 'leaf', n: 5 } },
      { id: 'snow', name: 'Schneeflocken', need: { world: 8 }, p: { shape: 'snow', n: 5 } },
      { id: 'pixel', name: 'Pixelregen', need: { ach: 5 }, p: { shape: 'pixel', n: 8 } },
      { id: 'heart', name: 'Herzen', need: { stars: 90 }, p: { shape: 'heart', n: 4 } },
      { id: 'ring', name: 'Ringwellen', need: { world: 7 }, p: { shape: 'ring', n: 2 } },
      { id: 'flame', name: 'Flammen', need: { world: 6 }, p: { shape: 'flame', n: 6 } },
      { id: 'prism', name: 'Prismenlicht', need: { world: 12 }, p: { shape: 'prism', n: 7 } }
    ],
    bg: [
      { id: 'world', name: 'Welt-Thema', need: null },
      { id: 'night', name: 'Nachthimmel', need: null },
      { id: 'sunset', name: 'Abendrot', need: { stars: 45 } },
      { id: 'aurora', name: 'Polarlicht', need: { world: 8 } },
      { id: 'deep', name: 'Tiefblau', need: { world: 4 } },
      { id: 'mono', name: 'Ruhig (wenig Bewegung)', need: null }
    ]
  };
  CPU.skinUnlocked = function (item, p) {
    var n = item.need; if (!n) return true;
    if (n.stars) return CPU.profileStars(p) >= n.stars;
    if (n.world) { for (var i = (n.world - 1) * 25 + 1; i <= n.world * 25; i++) if (!p.levels[i] || !p.levels[i].stars) return false; return true; }
    if (n.ach) return Object.keys(p.ach || {}).length >= n.ach;
    return false;
  };
  CPU.skinNeedText = function (item) {
    var n = item.need; if (!n) return 'Frei';
    if (n.stars) return n.stars + ' Sterne';
    if (n.world) return 'Welt ' + n.world + ' schaffen';
    if (n.ach) return n.ach + ' Erfolge';
    return '';
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
