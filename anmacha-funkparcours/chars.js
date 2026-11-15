/* Titanparcours – die wählbaren Läufer (reine Daten, ohne DOM/Three.js). Erfundene Figuren, keine echten Personen.
   Eigene Läufer: Steckbrief für die easygames-Figuren (../figuren/figuren.js); dazu kommen alle Figuren aus anderen easygames
   (easyclash/js/roster.js, window.EC_ROSTER): Menschen als realistische Figur, Tiere/Wesen im Look ihres Spiels.
   Schlüssel einer Figur: Zahl = eigener Läufer (Index in CHARS), Text = id aus dem Roster. */
export const CHARS = [
  { n: 'Kira', body: 'w', skin: '#f1c7a1', hair: { style: 'pony', color: '#2a1a12' }, topStyle: 'tank', build: 0.97, band: 1, bottom: '#14161f', bottomStyle: 'pants', shoes: '#ff5a1f', role: 'Sprinterin', from: 'Hamburg', motto: 'Erst rennen, dann denken.', st: [5, 4, 3, 3] },
  { n: 'Tobi', body: 'm', skin: '#e8b88a', hair: { style: 'spiky', color: '#6b3e1e' }, topStyle: 'tee', build: 1.0, bottom: '#1b2a4a', shoes: '#2ee58a', role: 'Allrounder', from: 'Köln', motto: 'Jedes Hindernis ist nur ein Spielplatz.', st: [4, 4, 4, 3] },
  { n: 'Mo', body: 'm', skin: '#8d5a3b', hair: { style: 'buzz', color: '#141010' }, topStyle: 'tank', build: 1.08, beard: '#141010', band: 1, bottom: '#0f1014', shoes: '#ffc93c', role: 'Kraftpaket', from: 'Berlin', motto: 'Die Wand gehört mir.', st: [3, 4, 5, 3] },
  { n: 'Lena', body: 'w', skin: '#ffd9b0', hair: { style: 'bun', color: '#d9a441' }, topStyle: 'tank', build: 0.95, bottom: '#2a1f3d', bottomStyle: 'pants', shoes: '#ff6fb0', role: 'Kletterin', from: 'München', motto: 'Griffkraft schlägt Muskelkraft.', st: [3, 4, 5, 4] },
  { n: 'Jonas', body: 'm', skin: '#ffdcc0', hair: { style: 'short', color: '#3a2a1a' }, topStyle: 'tee', build: 1.0, hat: 'cap', bottom: '#20242e', shoes: '#2e8bff', role: 'Techniker', from: 'Leipzig', motto: 'Saubere Technik, saubere Zeit.', st: [3, 3, 4, 5] },
  { n: 'Aylin', body: 'w', skin: '#c68a5e', hair: { style: 'long', color: '#1a0f0a' }, topStyle: 'long', build: 0.96, band: 1, bottom: '#101828', bottomStyle: 'pants', shoes: '#f5f5ff', role: 'Turnerin', from: 'Frankfurt', motto: 'Leicht wie eine Feder.', st: [4, 5, 3, 4] },
  { n: 'Ole', body: 'm', skin: '#f3c9a0', hair: { style: 'mohawk', color: '#ff2d95' }, topStyle: 'tank', build: 1.0, hat: 'sunglasses', bottom: '#111111', shoes: '#ff2d95', role: 'Showtalent', from: 'Rostock', motto: 'Hauptsache, das Publikum tobt.', st: [4, 5, 3, 2] },
  { n: 'Bruno', body: 'm', skin: '#b07850', hair: { style: 'bald' }, topStyle: 'tank', build: 1.14, beard: '#2a1a12', band: 1, bottom: '#232323', shoes: '#ff7a1f', role: 'Kraftpaket', from: 'Dortmund', motto: 'Was hält, wird gehalten.', st: [2, 3, 5, 3] },
  { n: 'Zoe', body: 'w', skin: '#f6d2b8', hair: { style: 'bob', color: '#5b6cff' }, topStyle: 'tank', build: 0.94, hat: 'sunglasses', bottom: '#0e0f16', bottomStyle: 'pants', shoes: '#2ee58a', role: 'Parkour-Läuferin', from: 'Stuttgart', motto: 'Der kürzeste Weg führt drüber.', st: [5, 5, 3, 3] },
  { n: 'Kenji', body: 'm', skin: '#e9c49c', hair: { style: 'spiky', color: '#101010' }, topStyle: 'long', build: 0.98, bottom: '#14161f', bottomStyle: 'pants', shoes: '#ffc93c', role: 'Ninja-Techniker', from: 'Düsseldorf', motto: 'Ruhig atmen, schnell sein.', st: [4, 4, 4, 5] },
  { n: 'Amara', body: 'w', skin: '#6f4430', hair: { style: 'curly', color: '#140c08' }, topStyle: 'tank', build: 1.0, band: 1, bottom: '#1a1424', shoes: '#ff7a1f', role: 'Sprinterin', from: 'Bremen', motto: 'Tempo ist meine Sprache.', st: [5, 4, 4, 3] },
  { n: 'Finn', body: 'm', skin: '#f0c8a8', hair: { style: 'curly', color: '#b5652a' }, topStyle: 'tee', build: 0.98, hat: 'beanie', bottom: '#1d2433', shoes: '#5b6cff', role: 'Newcomer', from: 'Kiel', motto: 'Heute ist mein erster Buzzer.', st: [4, 4, 3, 3] }
];
/** Stars & Originale aus den easygames: originalgetreue Figuren (Gesicht, Frisur, Kleidung wie im Ursprungsspiel).
   Mehrere Versionen von RicoReWi/Rico. look = Steckbrief für AMC.People (anmacha-podcast-tycoon/src/people.js), run = Trikot in Läuferfarbe.
   Zotik (Fuchs) kommt als Original-Figur aus dem Roster (Schlüssel 'zo-zotik'). */
const RICO = { body: 'm', skin: '#efc3a4', hair: { style: 'spike', color: '#5a4030', vol: 1.1, quiff: 0.012 }, beard: '#6b4a30', brow: '#4e3524', eyes: '#3c3026', top: '#5b2d8c', topStyle: 'tee', bottom: '#2a2f3a', bottomStyle: 'pants', shoes: '#1d1d22', build: 1.12, belly: 0.55, piercing: true, earring: 'l' };
export const STARS = [
  { id: 'st-ricorewi', n: 'RicoReWi', game: 'RicoReWi Radioportal', role: 'Moderator', from: 'Original', motto: 'Social-Media-Junkie, Dauerplaner und Tool-Bastler – und heute selbst auf der Strecke.', st: [4, 4, 4, 5], look: Object.assign({}, RICO, { name: 'RicoReWi' }) },
  { id: 'st-ricorewi-run', n: 'RicoReWi Sport', game: 'RicoReWi Radioportal', role: 'Läufer-Version', from: 'Original', motto: 'Lila Shirt aus, Trikot an – jetzt wird gelaufen.', st: [4, 5, 4, 4], run: 1, look: Object.assign({}, RICO, { topStyle: 'tank', bottomStyle: 'shorts', bottom: '#14161f', shoes: '#ff7a1f', belly: 0.4 }) },
  { id: 'st-rico-2048', n: 'Rico', game: '2048 Deluxe', role: 'Hausherr', from: '2048 Deluxe', motto: 'Moderator mit Mikro – seine Schallwelle trifft auf Distanz.', st: [3, 4, 4, 5], look: Object.assign({}, RICO, { skin: '#f2c6a4', hair: { style: 'spike', color: '#4b2e1a', vol: 1.05 }, beard: '#5e3b22', eyes: '#5a3216', top: '#8645e0', bottom: '#2c3554', earring: false, build: 1.08 }) },
  { id: 'st-andrew', n: 'Andrew', game: 'AnMaCha – Der Podcast', role: 'Podcast-Host', from: 'AnMaCha', motto: 'Musikgefühl, gute Laune und ein Lachen bis in die Kaffeeküche.', st: [5, 5, 3, 3], look: { body: 'm', skin: '#ebb796', hair: { style: 'short', color: '#c4874e', quiff: 0.012 }, brow: '#b07a48', eyes: '#5b84a6', top: '#16171b', topStyle: 'tee', bottom: '#3d5a85', bottomStyle: 'pants', shoes: '#1d1d22', build: 0.95, name: 'Andrew', logo: true, badge: true } },
  { id: 'st-marco', n: 'Marco', game: 'AnMaCha – Der Podcast', role: 'Podcast-Host', from: 'AnMaCha', motto: 'Technik-Herz, Serienkenner und Hüter von Marcos Tagebuch.', st: [3, 3, 5, 5], look: { body: 'm', skin: '#e8b390', hair: { style: 'short', color: '#5c3b23', vol: 1.35, part: true }, beard: '#6e4527', brow: '#4a2e1a', eyes: '#5d7f8e', top: '#16171b', topStyle: 'tee', bottom: '#2b3242', bottomStyle: 'pants', shoes: '#1d1d22', build: 1.05, belly: 0.7, name: 'Marco', logo: true, badge: true } },
  { id: 'st-yukoo', n: 'Yukoo', game: 'Titanparcours', role: 'Co-Kommentator', from: 'Kommentatorenpult', motto: 'Ich sag nur: Buzzer!', st: [4, 3, 4, 4], look: { body: 'm', skin: '#e9c3a0', hair: { style: 'short', color: '#1a1410', quiff: 0.02, vol: 1.2 }, beard: '#1a1410', brow: '#1a1410', eyes: '#3a2a1e', top: '#f2f2f4', topStyle: 'tee', bottom: '#20242e', bottomStyle: 'pants', shoes: '#1d1d22', build: 1.0 } }
];
const star = k => STARS.find(c => c.id === k);
/** Stil-Profil (nur Show, alle Figuren haben dieselbe Physik): Tempo, Sprung, Griff, Technik je 1–5 */
export const STATS = ['Tempo', 'Sprung', 'Griff', 'Technik'];
const roster = () => (typeof window !== 'undefined' && window.EC_ROSTER) || [];
const own = k => typeof k === 'number' || /^\d+$/.test(String(k));
/** Frisur-Namen der easygames-Figuren → Gesichts-Figuren (AMC.People) */
const HAIR = { spiky: 'spike', mohawk: 'spike' };
/** gibt es die Figur (noch)? */
export const validChar = k => own(k) ? +k >= 0 && +k < CHARS.length : !!star(k) || roster().some(c => c.id === k);
export const charName = k => own(k) ? (CHARS[+k] || CHARS[0]).n : star(k) ? star(k).n : ((roster().find(c => c.id === k) || {}).n || CHARS[0].n);
/** Herkunft einer Roster-Figur (Spielname) oder '' */
export const charGame = k => own(k) ? '' : star(k) ? star(k).game : ((roster().find(c => c.id === k) || {}).gameN || '');
/** Aussehen für die Arena: { look } für die realistische Figur oder { toon } (Roster-Eintrag) für Tiere/Wesen. color = Trikotfarbe des Läufers */
export function charLook(k, color, fromRoster) {
  const hex = c => '#' + ('00000' + (c >>> 0).toString(16)).slice(-6), col = typeof color === 'number' ? hex(color) : color;
  if (own(k)) {
    const c = CHARS[+k] || CHARS[0];
    return { look: { body: c.body, skin: c.skin, hair: Object.assign({}, c.hair, { style: HAIR[c.hair.style] || c.hair.style, vol: c.hair.style === 'mohawk' ? 1.5 : 1 }), top: col, topStyle: c.topStyle, bottom: c.bottom || '#161d3a', bottomStyle: c.bottomStyle || 'shorts', shoes: c.shoes || '#f5f5ff', beard: c.beard, bulk: c.build, hat: c.hat ? { type: c.hat, color: c.hat === 'sunglasses' ? '#111' : col } : c.band ? { type: 'band', color: col } : null } };
  }
  const sc = star(k); if (sc) return { look: Object.assign({}, sc.look, sc.run ? { top: col } : {}), name: sc.n };
  const e = roster().find(c => c.id === k); if (!e) return charLook(0, color, fromRoster);
  const look = fromRoster && fromRoster(e.look); if (look && look.hair) look.hair = Object.assign({}, look.hair, { style: HAIR[look.hair.style] || look.hair.style });
  return look ? { look, name: e.n } : { toon: e, name: e.n };
}
/** Auswahl-Liste: eigene Läufer, dann die Figuren der anderen Spiele, nach Spiel gruppiert */
export function charGroups() {
  const z = roster().find(c => c.id === 'zo-zotik');
  const g = [{ n: 'Stars & Originale', list: STARS.map(c => ({ k: c.id, n: c.n, c: c.look.top })).concat(z ? [{ k: z.id, n: z.n, c: z.look.top }] : []) }, { n: 'Titanparcours', list: CHARS.map((c, i) => ({ k: i, n: c.n, c: c.skin })) }], by = new Map();
  for (const c of roster()) { if (!by.has(c.gameN)) by.set(c.gameN, []); by.get(c.gameN).push({ k: c.id, n: c.n, c: (c.look && (c.look.top || c.look.skin)) || '#888' }); }
  for (const [n, list] of by) g.push({ n, list });
  return g;
}

/** Steckbrief für die Figurenwahl: Name, Herkunft, Rolle, Motto, Stil-Profil, Farbe */
export function charInfo(k) {
  if (own(k)) { const c = CHARS[+k] || CHARS[0]; return { k: +k, n: c.n, game: 'Titanparcours', role: c.role, from: c.from, motto: c.motto, st: c.st, c: c.shoes || c.skin }; }
  const sc = star(k); if (sc) return { k, n: sc.n, game: sc.game, role: sc.role, from: sc.from, motto: sc.motto, st: sc.st, c: sc.look.top };
  const e = roster().find(c => c.id === k); if (!e) return charInfo(0);
  let h = 0; for (const ch of String(k)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;   // feste Werte je Figur
  const st = STATS.map((_, i) => 2 + ((h >>> (i * 3)) % 4)), human = !(e.look && e.look.kind && e.look.kind !== 'human');
  return { k, n: e.n, game: e.gameN || '', role: human ? 'Gaststar' : 'Maskottchen', from: e.gameN || '', motto: e.d || 'Zu Gast im Titanparcours.', st, c: (e.look && (e.look.top || e.look.skin)) || '#888' };
}
