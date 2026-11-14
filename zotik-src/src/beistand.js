/* Beistand im Kampf – gilt für Echtzeit und Rundenkampf, freigeschaltet über die Kernsplitter der Hauptgeschichte (S.fl.rb2 … rb8):
   Zielfeuer (Splitter 2), Nebelfenn rufen (Splitter 4), Sternenbund-Attraktion (Splitter 6). Teamangriffe laufen über die Teamleiste. */
export const BEI = {
  focus: { n: 'Zielfeuer', em: '🎯', mp: 10, rb: 2, d: 'bis zu drei Ziele anvisieren, dann Salve' },
  summon: { n: 'Nebelfenn rufen', em: '🌫️', mp: 25, rb: 4, d: 'der Nebelfenn greift kurz mit an und heilt' },
  tact: { n: 'Taktik', em: '🎭', rb: 3, d: 'Rolle der Gefährten wählen' },
  attr: { n: 'Sternenbund', em: '💥', rb: 6, d: 'große Gruppen-Attraktion, braucht Kunstleisten der Gruppe' }
};
export const bOn = (S, k) => { const n = BEI[k].rb; return !!(S && ((S.fl && S.fl['rb' + n]) || (S.cd && S.cd[n] && S.cd[n].fin))) };
export const bLock = k => '🔒 Kernsplitter ' + BEI[k].rb;
