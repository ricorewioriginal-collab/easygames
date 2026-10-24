/* Funkparcours – die wählbaren Läufer (reine Daten, ohne DOM/Three.js). Erfundene Figuren, keine echten Personen.
   Eigene Läufer: Steckbrief für die easygames-Figuren (../figuren/figuren.js); dazu kommen alle Figuren aus anderen easygames
   (easyclash/js/roster.js, window.EC_ROSTER): Menschen als realistische Figur, Tiere/Wesen im Look ihres Spiels.
   Schlüssel einer Figur: Zahl = eigener Läufer (Index in CHARS), Text = id aus dem Roster. */
export const CHARS = [
  { n: 'Kira', body: 'w', skin: '#f1c7a1', hair: { style: 'pony', color: '#2a1a12' }, topStyle: 'tank', build: 0.97 },
  { n: 'Tobi', body: 'm', skin: '#e8b88a', hair: { style: 'short', color: '#6b3e1e' }, topStyle: 'tee', build: 1.0 },
  { n: 'Mo', body: 'm', skin: '#8d5a3b', hair: { style: 'buzz', color: '#141010' }, topStyle: 'tank', build: 1.04, beard: '#141010' },
  { n: 'Lena', body: 'w', skin: '#ffd9b0', hair: { style: 'bun', color: '#d9a441' }, topStyle: 'tank', build: 0.96 },
  { n: 'Jonas', body: 'm', skin: '#ffdcc0', hair: { style: 'short', color: '#3a2a1a' }, topStyle: 'tee', build: 1.0, hat: 'cap' },
  { n: 'Aylin', body: 'w', skin: '#c68a5e', hair: { style: 'long', color: '#1a0f0a' }, topStyle: 'tee', build: 0.96 },
  { n: 'Ole', body: 'm', skin: '#f3c9a0', hair: { style: 'mohawk', color: '#ff2d95' }, topStyle: 'tank', build: 1.0 },
  { n: 'Bruno', body: 'm', skin: '#b07850', hair: { style: 'bald' }, topStyle: 'tank', build: 1.1, beard: '#2a1a12' }
];
const roster = () => (typeof window !== 'undefined' && window.EC_ROSTER) || [];
const own = k => typeof k === 'number' || /^\d+$/.test(String(k));
/** gibt es die Figur (noch)? */
export const validChar = k => own(k) ? +k >= 0 && +k < CHARS.length : roster().some(c => c.id === k);
export const charName = k => own(k) ? (CHARS[+k] || CHARS[0]).n : ((roster().find(c => c.id === k) || {}).n || CHARS[0].n);
/** Herkunft einer Roster-Figur (Spielname) oder '' */
export const charGame = k => own(k) ? '' : ((roster().find(c => c.id === k) || {}).gameN || '');
/** Aussehen für die Arena: { look } für die realistische Figur oder { toon } (Roster-Eintrag) für Tiere/Wesen. color = Trikotfarbe des Läufers */
export function charLook(k, color, fromRoster) {
  const hex = c => '#' + ('00000' + (c >>> 0).toString(16)).slice(-6), col = typeof color === 'number' ? hex(color) : color;
  if (own(k)) {
    const c = CHARS[+k] || CHARS[0];
    return { look: { body: c.body, skin: c.skin, hair: c.hair, top: col, topStyle: c.topStyle, bottom: '#161d3a', bottomStyle: 'shorts', shoes: '#f5f5ff', beard: c.beard, bulk: c.build, hat: c.hat ? { type: c.hat, color: col } : null } };
  }
  const e = roster().find(c => c.id === k); if (!e) return charLook(0, color, fromRoster);
  const look = fromRoster && fromRoster(e.look); return look ? { look, name: e.n } : { toon: e, name: e.n };
}
/** Auswahl-Liste: eigene Läufer, dann die Figuren der anderen Spiele, nach Spiel gruppiert */
export function charGroups() {
  const g = [{ n: 'Funkparcours', list: CHARS.map((c, i) => ({ k: i, n: c.n, c: c.skin })) }], by = new Map();
  for (const c of roster()) { if (!by.has(c.gameN)) by.set(c.gameN, []); by.get(c.gameN).push({ k: c.id, n: c.n, c: (c.look && (c.look.top || c.look.skin)) || '#888' }); }
  for (const [n, list] of by) g.push({ n, list });
  return g;
}
