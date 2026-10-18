/* AnMaCha UNDERCOVER 3D – Aussehen der Figuren (reine Daten, auch in Node nutzbar).
   look = { body, skin (Index), color (Farb-id), hair (id), hairColor (hex), hat (id), face (id) } */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  const bodies = [
    { id: 'kurz', n: 'Kompakt' },
    { id: 'gross', n: 'Groß & schlank' },
    { id: 'rund', n: 'Rund' },
    { id: 'robo', n: 'Robo-Techniker' },
    { id: 'mikro', n: 'Mikro-Maskottchen' },
    { id: 'kid', n: 'Kopfhörer-Kid' },
    { id: 'lang', n: 'Langbeinig' }
  ];
  const skins = ['#f6d3b3', '#f1c27d', '#d9a066', '#b07444', '#7a4a2a', '#4f3020', '#9fb4c8', '#c9d3dc'];
  const colors = [
    { id: 'orange', hex: '#ff9a2e', n: 'Orange' },
    { id: 'cyan', hex: '#29d3ff', n: 'Cyan' },
    { id: 'rot', hex: '#e8413c', n: 'Rot' },
    { id: 'gelb', hex: '#ffd23f', n: 'Gelb' },
    { id: 'gruen', hex: '#3fbf5f', n: 'Grün' },
    { id: 'blau', hex: '#3460e0', n: 'Blau' },
    { id: 'lila', hex: '#8e4fd8', n: 'Lila' },
    { id: 'pink', hex: '#ff6fb5', n: 'Pink' },
    { id: 'weiss', hex: '#eef2f7', n: 'Weiß' },
    { id: 'schwarz', hex: '#2b2d36', n: 'Schwarz' },
    { id: 'braun', hex: '#8a5a34', n: 'Braun' },
    { id: 'mint', hex: '#7fe3c4', n: 'Mint' }
  ];
  const hair = [
    { id: 'none', n: 'Ohne' }, { id: 'kurz', n: 'Kurz' }, { id: 'locken', n: 'Locken' }, { id: 'zopf', n: 'Zopf' },
    { id: 'irokese', n: 'Irokese' }, { id: 'dutt', n: 'Dutt' }, { id: 'pony', n: 'Pony' }, { id: 'lang', n: 'Lang' }
  ];
  const hairColors = ['#2a1d14', '#5a3820', '#a8642c', '#e3c06a', '#d8d8d8', '#c0392b', '#29d3ff', '#ff6fb5'];
  const hats = [
    { id: 'none', n: 'Ohne', lvl: 0 },
    { id: 'kopfhoerer', n: 'Kopfhörer', lvl: 0 },
    { id: 'cap', n: 'Cap', lvl: 0 },
    { id: 'brille', n: 'Brille', lvl: 1 },
    { id: 'beanie', n: 'Mütze', lvl: 2 },
    { id: 'antenne', n: 'Antenne', lvl: 3 },
    { id: 'sonnenbrille', n: 'Sonnenbrille', lvl: 4 },
    { id: 'mikrofonhut', n: 'Mikrofon-Hut', lvl: 5 },
    { id: 'schal', n: 'Schal', lvl: 6 },
    { id: 'fliege', n: 'Fliege', lvl: 7 },
    { id: 'krone', n: 'Krone', lvl: 8 },
    { id: 'zylinder', n: 'Zylinder', lvl: 10 }
  ];
  const faces = [
    { id: 'froh', n: 'Fröhlich' }, { id: 'cool', n: 'Cool' }, { id: 'neugierig', n: 'Neugierig' },
    { id: 'muede', n: 'Müde' }, { id: 'frech', n: 'Frech' }
  ];
  const symbols = ['●', '▲', '■', '◆', '★', '✚', '⬟', '⬢', '▼', '✦', '◐', '♥'];
  const names = [
    'Pegel-Paula', 'DJ Knister', 'Frequenz-Fritz', 'Mikro-Mia', 'Rausch-Ralf', 'Welle-Wanda', 'Kanal-Kalle', 'Tonspur-Tina',
    'Antenne-Anton', 'Studio-Susi', 'Funk-Frieda', 'Bass-Bruno', 'Echo-Emma', 'Sender-Sepp', 'Hertz-Hanna', 'Regler-Rudi',
    'Jingle-Jule', 'Kabel-Klaus', 'Quoten-Quirin', 'Mono-Moni', 'Stereo-Stefan', 'Pausen-Pia', 'Takt-Theo', 'Sound-Sina',
    'Loop-Lotte', 'Fader-Ferdi', 'Rille-Rosi', 'UKW-Uwe', 'Spule-Svea', 'Piep-Pauli', 'Dezibel-Doris', 'Nachtfunk-Nils',
    'Morgen-Mona', 'Verstärker-Vic', 'Hall-Hilde', 'Knopf-Kuno', 'Taste-Tilda', 'Sendemast-Max', 'Kurzwelle-Kim', 'Lautsprecher-Leo'
  ];

  const ids = a => a.map(x => x.id);
  const BODY = ids(bodies), COL = ids(colors), HAIR = ids(hair), HAT = ids(hats), FACE = ids(faces);
  const isHex = s => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s);

  AMU.COSMETICS = {
    bodies, skins, colors, hair, hairColors, hats, faces, symbols, names,
    colorHex(id) { const c = colors.find(x => x.id === id); return c ? c.hex : colors[0].hex; },
    hatsForLevel(lvl) { return hats.filter(h => h.lvl <= (lvl | 0)); },
    defaultLook() { return { body: 'kurz', skin: 1, color: 'orange', hair: 'kurz', hairColor: hairColors[1], hat: 'none', face: 'froh' }; },
    /** Zufälliges gültiges Aussehen; maxLvl begrenzt freigeschaltete Accessoires (Standard: alle). */
    randomLook(rng, maxLvl) {
      const r = rng || { int: n => Math.floor(Math.random() * n), pick: a => a[Math.floor(Math.random() * a.length)] };
      const hs = maxLvl == null ? hats : this.hatsForLevel(maxLvl);
      const body = r.pick(BODY);
      return {
        body, skin: body === 'robo' ? 6 + r.int(2) : r.int(6), color: r.pick(COL),
        hair: r.pick(HAIR), hairColor: r.pick(hairColors), hat: r.pick(hs).id, face: r.pick(FACE)
      };
    },
    /** Bereinigt ein (z. B. aus dem Netz empfangenes) Aussehen: Unbekanntes → Standard. */
    validLook(look) {
      const d = this.defaultLook(), l = look && typeof look === 'object' ? look : {};
      const skin = Number.isInteger(l.skin) && l.skin >= 0 && l.skin < skins.length ? l.skin : d.skin;
      return {
        body: BODY.includes(l.body) ? l.body : d.body, skin,
        color: COL.includes(l.color) ? l.color : d.color,
        hair: HAIR.includes(l.hair) ? l.hair : d.hair,
        hairColor: isHex(l.hairColor) ? l.hairColor.toLowerCase() : d.hairColor,
        hat: HAT.includes(l.hat) ? l.hat : d.hat,
        face: FACE.includes(l.face) ? l.face : d.face
      };
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.COSMETICS;
})(typeof window !== 'undefined' ? window : globalThis);
