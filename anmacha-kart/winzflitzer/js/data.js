// Winzflitzer 3D – Fahrzeuge, Fahrer, Welten und Strecken
'use strict';
var WF = window.WF = window.WF || {};

// top = Höchstgeschwindigkeit, acc = Beschleunigung, grip = Seitenhaftung (klein = rutschig), turn = Lenkrate,
// mass = Gewicht beim Rempeln, step = überfahrbare Kante, fly = schwebt (Hubschrauber), gun = kann schießen
WF.VEHICLES = {
  sport:   { name: 'Sportflitzer', icon: '🏎️', top: 17, acc: 21, grip: 7.5, turn: 3.3, mass: 1.0, step: 0.36 },
  formula: { name: 'Formel-Winzling', icon: '🏁', top: 20.5, acc: 25, grip: 9, turn: 3.05, mass: 0.9, step: 0.32 },
  boat:    { name: 'Speedboot', icon: '🚤', top: 15.5, acc: 15, grip: 2.4, turn: 2.7, mass: 1.0, step: 0.4, water: true },
  heli:    { name: 'Hubschrauber', icon: '🚁', top: 15.5, acc: 13, grip: 2.8, turn: 3.3, mass: 0.8, step: 1.2, fly: true },
  offroad: { name: 'Geländewagen', icon: '🚙', top: 15.5, acc: 20, grip: 6, turn: 3.0, mass: 1.3, step: 0.5 },
  mini:    { name: 'Kugelflitzer', icon: '🛞', top: 16, acc: 24, grip: 6.5, turn: 3.7, mass: 0.8, step: 0.36 },
  tank:    { name: 'Panzer', icon: '🛡️', top: 12.5, acc: 14, grip: 12, turn: 2.4, mass: 2.0, step: 0.5, gun: true },
  monster: { name: 'Monstertruck', icon: '🛻', top: 15.5, acc: 18, grip: 5.5, turn: 2.8, mass: 1.6, step: 0.7 }
};

// Fahrer (alle frei erfunden). skill: 0.85 … 1.0, style: Fahrweise der KI
WF.DRIVERS = [
  { id: 'lotte', name: 'Lotte', col: '#ff3b6b', skill: 0.86, style: 'sauber', bio: 'Fährt immer die Ideallinie – und ärgert sich über jede Krume.' },
  { id: 'jaro', name: 'Jaro', col: '#2f8bff', skill: 0.88, style: 'wild', bio: 'Kennt keine Bremse. Wirklich keine.' },
  { id: 'mika', name: 'Mika', col: '#ffc21a', skill: 0.89, style: 'sauber', bio: 'Hat die Tischkante mal von unten gesehen. Nie wieder!' },
  { id: 'ben', name: 'Ben', col: '#2ecc71', skill: 0.9, style: 'rempler', bio: 'Rempelt gern – entschuldigt sich aber immer.' },
  { id: 'yara', name: 'Yara', col: '#a55eea', skill: 0.92, style: 'sauber', bio: 'Zieht die engsten Kurven der ganzen Wohnung.' },
  { id: 'emil', name: 'Emil', col: '#ff7f27', skill: 0.92, style: 'wild', bio: 'Springt über alles, was nicht festgeklebt ist.' },
  { id: 'nele', name: 'Nele', col: '#00d2d3', skill: 0.94, style: 'sauber', bio: 'Rechnet jede Kurve vorher aus.' },
  { id: 'kofi', name: 'Kofi', col: '#8d6e63', skill: 0.94, style: 'rempler', bio: 'Schiebt dich freundlich, aber bestimmt vom Tisch.' },
  { id: 'pia', name: 'Pia', col: '#ff9ff3', skill: 0.96, style: 'wild', bio: 'Driftet sogar auf Müsli.' },
  { id: 'ole', name: 'Ole', col: '#c8d6e5', skill: 0.97, style: 'sauber', bio: 'Der Ruhigste – bis zur letzten Runde.' },
  { id: 'sami', name: 'Sami', col: '#1e3799', skill: 0.98, style: 'rempler', bio: 'Hat noch kein Duell verloren. Sagt er.' },
  { id: 'rosa', name: 'Rosa', col: '#e74c3c', skill: 1.0, style: 'sauber', bio: 'Die amtierende Küchentisch-Meisterin.' }
];

// Welten: Fahrzeug, Farben, Boden. ground: Plattform (Tischplatte usw.), walls: Ränder, floor: Höhe des Bodens tief unten
WF.THEMES = {
  breakfast: { name: 'Frühstückstisch', icon: '🥣', veh: 'sport', sky: '#f7e1c4', floorCol: '#8a5a3c', floorY: -26,
    ground: { t: 'rect', x: 0, z: 0, w: 92, d: 66, h: 0 }, groundCol: '#f4f1ea', track: 'cloth', music: 0 },
  desk: { name: 'Schreibtisch', icon: '✏️', veh: 'formula', sky: '#dfe8f1', floorCol: '#6d6d78', floorY: -26,
    ground: { t: 'rect', x: 0, z: 0, w: 102, d: 72, h: 0 }, groundCol: '#b98a5a', track: 'paper', music: 1 },
  bath: { name: 'Badewanne', icon: '🛁', veh: 'boat', sky: '#d6f0f7', floorCol: '#e7eef2', floorY: -10,
    ground: { t: 'rrect', x: 0, z: 0, w: 82, d: 50, r: 14, h: 0 }, groundCol: '#4fb6e0', track: 'none', music: 2, water: true, rim: 3.2 },
  garden: { name: 'Garten', icon: '🌼', veh: 'heli', sky: '#bfe6ff', floorCol: '#3f8f3a', floorY: -4,
    ground: { t: 'rect', x: 0, z: 0, w: 134, d: 100, h: 0 }, groundCol: '#5cb85c', track: 'dirt', music: 3, rim: 4 },
  sandbox: { name: 'Sandkasten', icon: '🏖️', veh: 'offroad', sky: '#cfe9ff', floorCol: '#5aa04e', floorY: -2,
    ground: { t: 'rect', x: 0, z: 0, w: 84, d: 84, h: 0 }, groundCol: '#e8cf8f', track: 'tread', music: 4, rim: 2.6 },
  pool: { name: 'Billardtisch', icon: '🎱', veh: 'mini', sky: '#2b2233', floorCol: '#3b2a22', floorY: -26,
    ground: { t: 'rect', x: 0, z: 0, w: 96, d: 52, h: 0 }, groundCol: '#1f8a4c', track: 'felt', music: 5, rim: 1.6 },
  workbench: { name: 'Werkbank', icon: '🔧', veh: 'tank', sky: '#e9e2d6', floorCol: '#555', floorY: -26,
    ground: { t: 'rect', x: 0, z: 0, w: 104, d: 64, h: 0 }, groundCol: '#c9a46b', track: 'tape', music: 6 },
  kids: { name: 'Kinderzimmer', icon: '🧸', veh: 'monster', sky: '#f3e9ff', floorCol: '#7e6bd6', floorY: -2,
    ground: { t: 'rect', x: 0, z: 0, w: 124, d: 86, h: 0 }, groundCol: '#7f8fe0', track: 'road', music: 7, rim: 5 }
};

// Strecken: pts = Kontrollpunkte [x, z, Höhe], Eigenschaften im Abschnitt u (Index des Kontrollpunkts + Anteil):
//   ramp: Rampe (Sprung), gap: Lücke (ohne Boden), bridge: Brücke (unten frei), pad: Turbo-Streifen
// zones: Flächen mit Wirkung (slip = rutschig, slow = klebrig, pull = Strudel, hill = Hügel)
// props: Deko/Hindernisse (Typ, x, z, Drehung, Größe)
WF.TRACKS = [
  // ---------------- Frühstückstisch (Sportflitzer)
  { id: 'b1', theme: 'breakfast', name: 'Müsli-Runde', laps: 3,
    pts: [[-30, -21], [-6, -24], [18, -22], [34, -18], [39, -4], [34, 12], [18, 20], [2, 14], [-12, 22], [-30, 22], [-38, 8], [-38, -10]],
    feat: [{ t: 'pad', u: [1.3, 1.5] }, { t: 'pad', u: [8.4, 8.6] }],
    zones: [{ t: 'slip', x: 37, z: 4, r: 4.5 }, { t: 'slow', x: -21, z: 22, r: 3.2 }],
    props: [['bowl', -16, 1, 0, 1], ['plate', 16, 1, 0, 1], ['cup', 25, 27, 0.6, 1], ['cup', -4, 3, 2, 1], ['cereal', -40, -27, 0.2, 1],
      ['toast', 44, 25, 0.4, 1], ['spoon', 0, -30, 0.1, 1], ['sugar', 8, -22.5, 0.3, 1], ['sugar', -27, 8, 0.7, 1], ['jam', -30, 2, 0, 1], ['egg', 26, -3, 0, 1]] },
  { id: 'b2', theme: 'breakfast', name: 'Toast-Tour', laps: 3,
    pts: [[-36, -22], [-10, -26], [10, -14], [30, -24], [40, -8], [28, 4], [38, 18], [20, 26], [0, 16], [-18, 26], [-38, 18], [-30, 0], [-40, -10]],
    feat: [{ t: 'ramp', u: [0.25, 0.55], h: 1.0 }, { t: 'pad', u: [7.3, 7.5] }, { t: 'pad', u: [3.2, 3.4] }],
    zones: [{ t: 'slip', x: 33, z: 11, r: 4 }, { t: 'slow', x: 3, z: -19, r: 3 }, { t: 'slip', x: -36, z: 6, r: 3.6 }],
    props: [['toast', 14, 2, 0.3, 1.2], ['toast', -16, 8, -0.4, 1], ['plate', -14, 9, 0, 1.1], ['bowl', 18, -1, 0, 0.9], ['cup', 44, -24, 0, 1], ['cereal', -44, 28, 0.4, 1],
      ['milk', 44, 28, 0.2, 1], ['jam', 6, 30, 0, 1], ['knife', -22, -16, 0.15, 1], ['sugar', 23, -18, 0, 1], ['sugar', -2, 22, 0.6, 1], ['egg', -2, 1, 0, 1]] },
  { id: 'b3', theme: 'breakfast', name: 'Marmeladen-Acht', laps: 3,
    pts: [[-32, 14, 0], [-14, 10, 0.9], [0, 0, 1.7], [14, -10, 0.9], [30, -22, 0], [42, -6, 0], [34, 14, 0], [14, 10, 0], [0, 0, 0], [-14, -10, 0], [-30, -22, 0], [-42, -6, 0]],
    feat: [{ t: 'bridge', u: [1.62, 2.38] }, { t: 'pad', u: [5.3, 5.5] }, { t: 'pad', u: [11.3, 11.5] }],
    zones: [{ t: 'slow', x: 38, z: 4, r: 3 }, { t: 'slip', x: -39, z: -15, r: 4 }],
    props: [['plate', 26, -4, 0, 1], ['plate', -26, -4, 0, 1], ['jam', 26, -4, 0, 1.3], ['jam', -26, -4, 0, 1.3], ['cup', 0, -20, 0, 1.1], ['cup', 0, 22, 0, 1.1],
      ['cereal', 44, 26, -0.3, 1], ['toast', -44, 25, 0.2, 1], ['milk', 44, -27, 0, 1], ['spoon', -18, 27, 0.3, 1]] },

  // ---------------- Schreibtisch (Formel)
  { id: 'd1', theme: 'desk', name: 'Bleistift-Ring', laps: 3,
    pts: [[-40, -24], [-10, -28], [20, -26], [42, -20], [45, 0], [40, 22], [16, 26], [4, 12], [-8, 26], [-36, 26], [-45, 6], [-45, -12]],
    feat: [{ t: 'ramp', u: [0.2, 0.5], h: 0.9 }, { t: 'pad', u: [4.2, 4.4] }, { t: 'pad', u: [9.3, 9.5] }],
    zones: [{ t: 'slip', x: 27, z: 25, r: 3.6 }],
    props: [['book', -18, 0, 0.1, 1], ['book', 22, 2, -0.2, 1.1], ['mug', 0, -6, 0, 1], ['lamp', 46, -31, 0, 1], ['eraser', 32, -33, 0.4, 1], ['clip', -27, 25, 1, 1],
      ['pencil', -6, -16, 0.1, 1], ['pencil', 20, 14, 1.3, 1], ['note', -34, -2, 0.2, 1], ['calc', 4, 32, 0, 1]] },
  { id: 'd2', theme: 'desk', name: 'Bücherberg', laps: 3,
    pts: [[-40, -26, 0], [-16, -26, 0], [2, -26, 1.4], [20, -26, 1.4], [36, -20, 1.4], [42, -2, 1.4], [34, 14, 0], [14, 22, 0], [-4, 10, 0], [-22, 24, 0], [-42, 18, 0], [-45, -6, 0]],
    feat: [{ t: 'ramp', u: [2.55, 2.8], h: 0.55 }, { t: 'gap', u: [2.8, 3.02] }, { t: 'pad', u: [7.3, 7.5] }, { t: 'pad', u: [0.3, 0.5] }],
    zones: [{ t: 'slip', x: -32, z: 23, r: 3.6 }],
    props: [['mug', 18, 4, 0, 1.1], ['lamp', -46, -32, 0, 1], ['pencil', -8, -8, -0.4, 1], ['pencil', 4, 30, 0.1, 1], ['eraser', 28, 30, 0.2, 1], ['clip', -30, 4, 0.6, 1],
      ['note', 0, -6, 0.1, 1], ['calc', 46, 28, 0.3, 1], ['book', -22, 8, 0.2, 0.9]] },
  { id: 'd3', theme: 'desk', name: 'Lineal-Brücke', laps: 3,
    pts: [[-34, 16, 0], [-18, 10, 0.9], [0, 0, 1.8], [18, -10, 0.9], [34, -24, 0], [46, -8, 0], [42, 14, 0], [26, 22, 0], [14, 10, 0], [0, 0, 0], [-14, -10, 0], [-28, -24, 0], [-46, -10, 0], [-44, 10, 0]],
    feat: [{ t: 'bridge', u: [1.62, 2.38] }, { t: 'pad', u: [4.3, 4.5] }, { t: 'pad', u: [11.3, 11.5] }],
    zones: [{ t: 'slip', x: 44, z: 3, r: 3.5 }],
    props: [['mug', 30, -6, 0, 1], ['book', -30, -4, 0.2, 1], ['lamp', 47, 30, 0, 1], ['pencil', 0, -24, 0.05, 1.2], ['pencil', 0, 22, -0.05, 1.2], ['eraser', -40, 26, 0.3, 1],
      ['clip', 12, -30, 0.5, 1], ['note', 26, 6, -0.3, 1], ['calc', -46, -28, 0, 1]] },

  // ---------------- Badewanne (Speedboot)
  { id: 'w1', theme: 'bath', name: 'Schaumbad-Sprint', laps: 3,
    pts: [[-28, -15], [0, -17], [28, -15], [34, 0], [28, 15], [0, 10], [-28, 16], [-34, 1]],
    feat: [{ t: 'pad', u: [0.4, 0.6] }, { t: 'pad', u: [5.4, 5.6] }],
    zones: [{ t: 'slow', x: 14, z: 13, r: 3.4 }, { t: 'slow', x: -14, z: -16, r: 3 }],
    props: [['soap', 0, 0, 0.3, 1], ['duck', -16, 1, 0, 1], ['duck', 16, -1, 0, 1], ['sponge', 0, 21, 0.1, 1], ['bottle', -36, -20, 0, 1], ['bottle', 37, 19, 0, 1]] },
  { id: 'w2', theme: 'bath', name: 'Ententeich', laps: 3,
    pts: [[-32, -16], [-12, -7], [4, -18], [28, -16], [22, 0], [32, 15], [10, 16], [-6, 6], [-22, 16], [-35, 5]],
    feat: [{ t: 'pad', u: [2.4, 2.6] }, { t: 'pad', u: [7.4, 7.6] }],
    zones: [{ t: 'slow', x: 30, z: -6, r: 3 }],
    props: [['duck', 10, 2, 0, 1.3], ['soap', -20, -18, 0.6, 1], ['duck', -22, 2, 0, 1], ['sponge', 36, 2, 0.4, 1], ['duck', 2, -9, 0, 0.8], ['bottle', 37, -20, 0, 1]] },
  { id: 'w3', theme: 'bath', name: 'Strudel am Abfluss', laps: 3,
    pts: [[-32, -14], [-6, -18], [18, -10], [32, -16], [34, 4], [20, 16], [0, 8], [-20, 18], [-35, 7]],
    feat: [{ t: 'pad', u: [0.4, 0.6] }, { t: 'pad', u: [6.4, 6.6] }],
    zones: [{ t: 'pull', x: 14, z: 2, r: 9 }, { t: 'slow', x: -26, z: 12, r: 3 }],
    props: [['drain', 14, 2, 0, 1], ['soap', -16, 0, 0.2, 1], ['duck', -6, -4, 0, 1], ['sponge', 24, -22, 0.2, 0.9], ['bottle', -37, -20, 0, 1]] },

  // ---------------- Garten (Hubschrauber)
  { id: 'g1', theme: 'garden', name: 'Blumenbeet-Flug', laps: 3,
    pts: [[-50, -30], [-10, -38], [30, -32], [52, -14], [48, 14], [24, 32], [0, 20], [-24, 34], [-50, 24], [-56, 0]],
    feat: [{ t: 'pad', u: [1.3, 1.5] }, { t: 'pad', u: [6.4, 6.6] }],
    zones: [{ t: 'slow', x: 52, z: 0, r: 4 }],
    props: [['tree', -8, -8, 0, 1.2], ['tree', 26, 6, 0, 1], ['flowers', -30, 4, 0, 1], ['flowers', 10, -20, 0, 1], ['pot', 34, -16, 0, 1], ['can', -38, 44, 0.4, 1],
      ['gnome', 0, 8, 0, 1], ['stone', 40, -2, 0, 1], ['flower', -20, 22, 0, 1], ['flower', 10, 42, 0, 1], ['flower', -44, -18, 0, 1], ['hose', 0, -46, 0, 1]] },
  { id: 'g2', theme: 'garden', name: 'Schlauch-Schleife', laps: 2,
    pts: [[-50, -34], [-20, -30], [0, -38], [24, -24], [50, -34], [57, -6], [34, 4], [50, 22], [28, 36], [4, 22], [-14, 38], [-44, 30], [-38, 10], [-56, -8]],
    feat: [{ t: 'pad', u: [0.4, 0.6] }, { t: 'pad', u: [9.4, 9.6] }],
    zones: [{ t: 'slow', x: 42, z: 13, r: 3.4 }],
    props: [['tree', 4, 0, 0, 1.3], ['tree', -24, -6, 0, 1], ['flowers', 22, -6, 0, 1], ['pot', -30, 22, 0, 1], ['can', 44, -12, 0, 1], ['gnome', 30, 22, 0.5, 1],
      ['stone', -46, -16, 0, 1], ['flower', 14, 42, 0, 1], ['flower', -10, -40, 0, 1], ['flower', 56, 10, 0, 1], ['hose', 0, 46, 0, 1]] },
  { id: 'g3', theme: 'garden', name: 'Gartenzwerg-Tal', laps: 2,
    pts: [[-54, -20], [-34, -38], [-6, -30], [10, -8], [32, -30], [54, -20], [52, 10], [30, 30], [10, 14], [-10, 34], [-40, 30], [-30, 4]],
    feat: [{ t: 'pad', u: [2.5, 2.7] }, { t: 'pad', u: [8.5, 8.7] }],
    zones: [{ t: 'slow', x: -44, z: 32, r: 3.4 }],
    props: [['tree', 14, -26, 0, 1], ['tree', 34, 8, 0, 1.2], ['tree', -14, 10, 0, 1.3], ['gnome', 12, 2, -0.6, 1.2], ['gnome', -34, -20, 0.6, 1], ['pot', 50, -36, 0, 1],
      ['flowers', -48, 8, 0, 1], ['can', 2, 44, 0, 1], ['stone', 26, -14, 0, 1], ['flower', -20, -22, 0, 1], ['flower', 44, 30, 0, 1]] },

  // ---------------- Sandkasten (Geländewagen)
  { id: 's1', theme: 'sandbox', name: 'Burggraben', laps: 3,
    pts: [[-30, -30], [0, -26], [30, -32], [32, 0], [24, 28], [0, 20], [-26, 30], [-32, 4]],
    feat: [{ t: 'pad', u: [0.4, 0.6] }, { t: 'pad', u: [4.4, 4.6] }],
    zones: [{ t: 'hill', x: 31, z: -14, r: 5, h: 1.1 }, { t: 'hill', x: -13, z: 26, r: 5, h: 1.0 }, { t: 'slow', x: 30, z: 14, r: 3.4 }],
    props: [['castle', 0, 0, 0, 1], ['bucket', -36, -36, 0, 1], ['spade', 14, 10, 0.6, 1], ['mold', -16, -10, 0, 1], ['mold', 18, -14, 0, 1], ['rake', -10, 36, 1.4, 1]] },
  { id: 's2', theme: 'sandbox', name: 'Dünen-Rallye', laps: 3,
    pts: [[-32, -32], [-6, -24], [18, -32], [32, -18], [20, -4], [32, 12], [28, 32], [4, 24], [-10, 32], [-32, 24], [-22, 4], [-34, -10]],
    feat: [{ t: 'pad', u: [7.4, 7.6] }],
    zones: [{ t: 'hill', x: -19, z: -28, r: 5.5, h: 1.3 }, { t: 'hill', x: 30, z: 22, r: 5, h: 1.2 }, { t: 'hill', x: -28, z: 14, r: 4.5, h: 1.0 }, { t: 'slow', x: 26, z: 4, r: 3 }],
    props: [['castle', 2, 4, 0.3, 0.8], ['bucket', 6, -14, 0, 1.2], ['spade', -16, -4, -0.7, 1], ['mold', 16, 22, 0, 1], ['rake', 36, -36, 0.7, 1], ['bucket', -36, 36, 0, 1]] },
  { id: 's3', theme: 'sandbox', name: 'Eimer-Express', laps: 3,
    pts: [[-32, -30], [-8, -32], [4, -14], [18, -32], [32, -24], [30, 0], [14, 6], [30, 20], [22, 32], [0, 24], [-18, 32], [-32, 18], [-20, 0], [-34, -10]],
    feat: [{ t: 'pad', u: [10.4, 10.6] }, { t: 'pad', u: [4.4, 4.6] }],
    zones: [{ t: 'hill', x: -3, z: -24, r: 4.5, h: 1.2 }, { t: 'hill', x: 30, z: -11, r: 5, h: 1.2 }, { t: 'hill', x: -26, z: 9, r: 4.5, h: 1.0 }, { t: 'slow', x: 10, z: 28, r: 3 }],
    props: [['bucket', 4, 2, 0, 1.4], ['castle', -8, 14, 0, 0.7], ['spade', 16, -16, 0.3, 1], ['mold', -18, -18, 0, 1], ['rake', 36, 36, 0.8, 1], ['mold', 36, 8, 0, 1]] },

  // ---------------- Billardtisch (Kugelflitzer)
  { id: 'p1', theme: 'pool', name: 'Acht-Kugel-Kurve', laps: 3,
    pts: [[-36, -15], [-10, -17], [0, -8], [10, -17], [36, -15], [39, 0], [36, 15], [0, 17], [-36, 15], [-39, 0]],
    feat: [{ t: 'pad', u: [6.4, 6.6] }, { t: 'pad', u: [0.4, 0.6] }],
    zones: [{ t: 'slip', x: 18, z: 16, r: 3.2 }],
    props: [['ball8', 0, 4, 0, 1], ['ball', -18, 2, 0, 1], ['ball', 20, 0, 0, 1], ['ball', -24, -6, 0, 1], ['chalk', 30, 4, 0.3, 1], ['cue', 0, 32, 0.05, 1]] },
  { id: 'p2', theme: 'pool', name: 'Bande an Bande', laps: 3,
    pts: [[-38, -16], [-14, -16], [0, -4], [14, -16], [38, -16], [38, 2], [20, 6], [24, 17], [0, 15], [-24, 17], [-20, 6], [-38, 2]],
    feat: [{ t: 'pad', u: [8.4, 8.6] }],
    zones: [{ t: 'slip', x: 0, z: 15, r: 3 }],
    props: [['ball8', 0, 6, 0, 1], ['ball', -28, -4, 0, 1], ['ball', 28, -4, 0, 1], ['ball', -8, 6, 0, 1], ['ball', 8, 6, 0, 1], ['chalk', 0, -18, 0, 1], ['cue', 0, -33, 0.02, 1]] },
  { id: 'p3', theme: 'pool', name: 'Tascheneck', laps: 3,
    pts: [[-40, -18], [-20, -12], [0, -19], [20, -12], [40, -18], [41, -1], [41, 16], [16, 16], [0, 6], [-16, 16], [-41, 16], [-41, -1]],
    feat: [{ t: 'pad', u: [1.4, 1.6] }, { t: 'pad', u: [8.4, 8.6] }],
    zones: [],
    props: [['ball8', 0, -4, 0, 1], ['ball', -14, 2, 0, 1], ['ball', 14, 2, 0, 1], ['ball', -24, -2, 0, 1], ['ball', 24, -2, 0, 1], ['chalk', -4, 18, 0.2, 1], ['cue', 0, 33, -0.03, 1]] },

  // ---------------- Werkbank (Panzer)
  { id: 'k1', theme: 'workbench', name: 'Schrauben-Slalom', laps: 2,
    pts: [[-40, -20], [-14, -22], [10, -16], [36, -22], [42, -4], [30, 8], [38, 20], [12, 22], [-2, 10], [-20, 22], [-42, 16], [-44, -2]],
    feat: [{ t: 'pad', u: [0.4, 0.6] }, { t: 'pad', u: [7.3, 7.5] }],
    zones: [{ t: 'slip', x: 35, z: 1, r: 3.6 }, { t: 'slow', x: -31, z: 21, r: 3.4 }],
    props: [['screw', -2, -20, 0, 1], ['screw', 22, -20, 0, 1], ['nut', 34, 14, 0, 1], ['hammer', 0, -4, 0.4, 1], ['box', -24, 0, 0, 1], ['vice', 46, -26, 0, 1],
      ['driver', 20, 4, -0.5, 1], ['nut', -10, 16, 0, 1], ['screw', -42, 8, 0, 1]] },
  { id: 'k2', theme: 'workbench', name: 'Hobelbank-Gefecht', laps: 2,
    pts: [[-40, -22], [-18, -22], [0, -14], [22, -22], [42, -20], [44, 2], [30, 12], [16, 24], [2, 12], [-12, 24], [-40, 22], [-46, 0]],
    feat: [{ t: 'pad', u: [3.4, 3.6] }, { t: 'pad', u: [10.3, 10.5] }],
    zones: [{ t: 'slip', x: 41, z: -6, r: 3.4 }, { t: 'slow', x: 23, z: 18, r: 3.4 }],
    props: [['hammer', 0, -4, 1.2, 1], ['box', 14, -2, 0.1, 0.9], ['screw', -20, -3, 0, 1], ['nut', -11, -18, 0, 1], ['nut', 11, -18, 0, 1], ['driver', -24, 12, 0.3, 1],
      ['vice', -46, -27, 0, 1], ['screw', 30, 0, 0, 1]] },
  { id: 'k3', theme: 'workbench', name: 'Werkzeugkasten-Arena', laps: 3,
    pts: [[-40, -22, 0], [-16, -24, 0], [2, -22, 1.6], [22, -22, 1.6], [40, -16, 0], [42, 4, 0], [28, 18, 0], [8, 14, 0], [-6, 24, 0], [-30, 22, 0], [-44, 4, 0]],
    feat: [{ t: 'pad', u: [7.4, 7.6] }, { t: 'pad', u: [0.2, 0.4] }],
    zones: [{ t: 'slip', x: 42, z: -6, r: 3.4 }, { t: 'slow', x: -18, z: 23, r: 3.2 }],
    props: [['hammer', 6, 0, 0.3, 1], ['screw', 24, 2, 0, 1], ['nut', -20, 4, 0, 1], ['driver', -30, -4, 1.1, 1], ['vice', 46, 27, 0, 1], ['screw', -10, -8, 0, 1], ['nut', 34, -2, 0, 1]] },

  // ---------------- Kinderzimmer (Monstertruck)
  { id: 'm1', theme: 'kids', name: 'Bauklotz-Boulevard', laps: 3,
    pts: [[-46, -28], [-10, -30], [24, -26], [48, -24], [50, 0], [44, 24], [16, 30], [0, 14], [-18, 30], [-46, 26], [-52, 0]],
    feat: [{ t: 'ramp', u: [0.3, 0.6], h: 1.5 }, { t: 'pad', u: [5.3, 5.5] }],
    zones: [{ t: 'slow', x: 50, z: -10, r: 3.6 }],
    props: [['blocks', -14, 2, 0.2, 1], ['blocks', 22, 0, -0.3, 1], ['ballbig', 0, -12, 0, 1], ['teddy', 28, 40, 0, 1], ['crayon', -30, 10, 0.4, 1], ['crayon', 24, 12, 0.3, 1],
      ['train', -48, 34, 0, 1], ['blocks', 56, 34, 0, 0.7]] },
  { id: 'm2', theme: 'kids', name: 'Teppich-Schanze', laps: 3,
    pts: [[-48, -26], [-16, -30], [8, -20], [32, -30], [52, -14], [40, 4], [52, 22], [26, 30], [6, 18], [-14, 30], [-40, 28], [-34, 8], [-52, -6]],
    feat: [{ t: 'ramp', u: [0.3, 0.6], h: 1.6 }, { t: 'ramp', u: [7.25, 7.55], h: 1.5 }, { t: 'pad', u: [3.3, 3.5] }],
    zones: [{ t: 'slow', x: 46, z: 13, r: 3.4 }],
    props: [['blocks', 8, -2, 0.3, 1.1], ['teddy', -16, 8, 0.5, 1], ['ballbig', 30, -8, 0, 1], ['crayon', -28, -14, 0.3, 1], ['train', 0, 38, 0, 1], ['blocks', -56, 34, 0, 0.8]] },
  { id: 'm3', theme: 'kids', name: 'Spielzeugkisten-Chaos', laps: 3,
    pts: [[-48, -28, 0], [-24, -30, 0], [-4, -27, 1.8], [16, -27, 1.8], [36, -30, 0], [52, -12, 0], [44, 10, 0], [24, 4, 0], [10, 22, 0], [-14, 30, 0], [-40, 26, 0], [-30, 6, 0], [-52, -8, 0]],
    feat: [{ t: 'ramp', u: [2.35, 2.55], h: 0.6 }, { t: 'gap', u: [2.55, 2.72] }, { t: 'pad', u: [9.4, 9.6] }],
    zones: [{ t: 'slow', x: 50, z: -2, r: 3.4 }],
    props: [['teddy', 4, -6, 0.2, 1.1], ['ballbig', -14, 12, 0, 1], ['blocks', 36, 18, 0.4, 1], ['crayon', 22, -14, 0.8, 1], ['train', -50, 36, 0, 1], ['blocks', 56, -34, 0, 0.8]] }
];
WF.trackById = function (id) { for (var i = 0; i < WF.TRACKS.length; i++) if (WF.TRACKS[i].id === id) return WF.TRACKS[i]; return WF.TRACKS[0]; };

// Meisterschaft: Reihenfolge der Rennen, nach jedem dritten Rennen eine Bonusrunde (Zeitfahren um ein Extraleben)
WF.CHAMP = ['b1', 'd1', 's1', 'w1', 'p1', 'g1', 'k1', 'm1', 'b2', 'd2', 'w2', 's2', 'p2', 'g2', 'k2', 'm2', 'b3', 'd3', 'w3', 's3', 'p3', 'g3', 'k3', 'm3'];
