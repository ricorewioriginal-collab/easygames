import type { DistrictId } from './types';

// Grundstücke von Lindenhafen. Koordinaten in Kacheln (1 m), x nach Osten, z nach Süden.
// Straßen (4 Kacheln breit): horizontal z 0..4, 46..50, 69..73, 96..100 (x 0..148); vertikal x 46..50 und 96..100. Wasser ab x 148.
export type LotKind = 'home' | 'community' | 'work';
export type LotVenue =
  | 'park' | 'school' | 'playground' | 'townhall' | 'library' | 'clinic' | 'gallery' | 'restaurant' | 'gym'
  | 'shop' | 'cafe' | 'bar' | 'market' | 'radio' | 'pier' | 'residential';

export interface LotDef {
  id: string;
  name: string;
  district: DistrictId;
  kind: LotKind;
  venue: LotVenue;
  x: number; z: number; w: number; d: number;
  /** Seite mit Straßenzugang: 0 = Norden (-z), 1 = Osten (+x), 2 = Süden (+z), 3 = Westen (-x) */
  front: 0 | 1 | 2 | 3;
  /** Bau-Vorlage (world/templates) */
  template: string;
  /** Grundstückspreis ohne Gebäude */
  land: number;
  /** Öffnungszeiten für Gemeinschaftsorte [von, bis] in Stunden; fehlt = immer offen */
  open?: [number, number];
  desc: string;
}

export const DISTRICTS: Record<DistrictId, { name: string; desc: string; color: string }> = {
  sonnenhain: { name: 'Sonnenhain', desc: 'Ruhige Vorstadt mit Gärten, Park, Schule und Spielplatz.', color: '#7fbf6a' },
  altstadt: { name: 'Altstadt', desc: 'Rathausplatz, Bibliothek, Klinik, Galerie, Restaurant und Geschäfte.', color: '#d9a35f' },
  hafen: { name: 'Hafenviertel', desc: 'Lebendige Promenade mit Café, Bar, Markt, Radiosender und Pier.', color: '#5fa8d9' },
};

export const LOTS: LotDef[] = [
  // ---------- Sonnenhain (Westen) ----------
  { id: 'sh-1', name: 'Ahornweg 1', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 4, z: 30, w: 18, d: 14, front: 2, template: 'home-cottage', land: 6000, desc: 'Gemütliches Familienhaus mit Garten.' },
  { id: 'sh-2', name: 'Ahornweg 3', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 25, z: 30, w: 19, d: 14, front: 2, template: 'home-sonnberg', land: 6500, desc: 'Älteres Doppelhaus mit großem Garten – hier wohnt Familie Sonnberg.' },
  { id: 'sh-3', name: 'Lindenallee 2', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 4, z: 52, w: 20, d: 16, front: 0, template: 'home-modern', land: 9000, desc: 'Musterhaus „Lichtblick“: modernes Familienhaus mit zwei Etagen.' },
  { id: 'sh-4', name: 'Lindenallee 4', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 26, z: 52, w: 18, d: 14, front: 0, template: 'home-bungalow', land: 7000, desc: 'Musterhaus „Sonnendeck“: heller Bungalow mit Terrasse.' },
  { id: 'sh-5', name: 'Birkenstraße 7', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 4, z: 74, w: 18, d: 14, front: 0, template: 'home-family2', land: 6500, desc: 'Familienhaus der Familie Okafor-Brandt.' },
  { id: 'sh-6', name: 'Birkenstraße 9', district: 'sonnenhain', kind: 'home', venue: 'residential', x: 26, z: 74, w: 18, d: 14, front: 0, template: 'empty', land: 4500, desc: 'Leeres Startergrundstück – bau dir dein Traumhaus.' },
  { id: 'sh-park', name: 'Sonnenhain-Park', district: 'sonnenhain', kind: 'community', venue: 'park', x: 4, z: 6, w: 22, d: 20, front: 0, template: 'park', land: 0, desc: 'Großer Park mit Teich, Bänken, Grillplatz und Schachtischen.' },
  { id: 'sh-schule', name: 'Schule am Lindenhain', district: 'sonnenhain', kind: 'work', venue: 'school', x: 29, z: 6, w: 15, d: 20, front: 0, template: 'school', land: 0, open: [7, 17], desc: 'Grundschule und Gymnasium mit Klassenzimmern und Lehrerzimmer.' },
  { id: 'sh-spielplatz', name: 'Spielplatz & Gemeinschaftsgarten', district: 'sonnenhain', kind: 'community', venue: 'playground', x: 4, z: 89, w: 20, d: 6, front: 2, template: 'playground', land: 0, desc: 'Schaukeln, Rutsche und Gemüsebeete für alle.' },
  // ---------- Altstadt (Mitte) ----------
  { id: 'as-rathaus', name: 'Rathausplatz', district: 'altstadt', kind: 'work', venue: 'townhall', x: 54, z: 6, w: 22, d: 18, front: 0, template: 'townhall', land: 0, open: [8, 18], desc: 'Historisches Rathaus mit Bürgerbüro, Technikbüro und Brunnenplatz.' },
  { id: 'as-bibliothek', name: 'Stadtbibliothek', district: 'altstadt', kind: 'community', venue: 'library', x: 79, z: 6, w: 15, d: 18, front: 0, template: 'library', land: 0, open: [9, 21], desc: 'Ruhige Bibliothek mit Lesesaal, Computern und Schachecke.' },
  { id: 'as-klinik', name: 'Klinik Lindenhafen', district: 'altstadt', kind: 'work', venue: 'clinic', x: 54, z: 27, w: 18, d: 17, front: 2, template: 'clinic', land: 0, desc: 'Klinik mit Empfang, Behandlungsräumen und Apotheke.' },
  { id: 'as-galerie', name: 'Galerie Farbenspiel', district: 'altstadt', kind: 'work', venue: 'gallery', x: 75, z: 27, w: 19, d: 17, front: 2, template: 'gallery', land: 0, open: [10, 20], desc: 'Galerie mit Ausstellungen und offenem Atelier.' },
  { id: 'as-restaurant', name: 'Trattoria Zur Linde', district: 'altstadt', kind: 'community', venue: 'restaurant', x: 54, z: 52, w: 16, d: 15, front: 0, template: 'restaurant', land: 0, open: [11, 23], desc: 'Gemütliches Restaurant mit Küche und Terrasse.' },
  { id: 'as-fitness', name: 'Fitnessstudio Kraftwerk', district: 'altstadt', kind: 'community', venue: 'gym', x: 73, z: 52, w: 21, d: 15, front: 0, template: 'gym', land: 0, open: [6, 23], desc: 'Laufbänder, Hanteln, Yogaraum und Boxsack.' },
  { id: 'as-laden', name: 'Kaufhaus Kranich', district: 'altstadt', kind: 'work', venue: 'shop', x: 54, z: 74, w: 16, d: 14, front: 0, template: 'shop', land: 0, open: [9, 20], desc: 'Kleidung, Geschenke, Bücher und Möbel – mit Werkstatt im Hinterhof.' },
  { id: 'as-1', name: 'Marktgasse 5', district: 'altstadt', kind: 'home', venue: 'residential', x: 73, z: 74, w: 10, d: 14, front: 0, template: 'home-townhouse', land: 7500, desc: 'Schmales Stadthaus mit zwei Etagen – hier wohnen Oma Hedwig und Enkel Jonas.' },
  { id: 'as-2', name: 'Marktgasse 7', district: 'altstadt', kind: 'home', venue: 'residential', x: 84, z: 74, w: 10, d: 14, front: 0, template: 'home-townhouse2', land: 7500, desc: 'Musterhaus „Altstadtperle“: renoviertes Stadthaus.' },
  // ---------- Hafenviertel (Osten) ----------
  { id: 'hv-cafe', name: 'Café Möwe', district: 'hafen', kind: 'work', venue: 'cafe', x: 104, z: 30, w: 14, d: 14, front: 2, template: 'cafe', land: 0, open: [7, 20], desc: 'Kaffee, Kuchen und Blick auf die Promenade.' },
  { id: 'hv-bar', name: 'Bar Leuchtfeuer', district: 'hafen', kind: 'community', venue: 'bar', x: 121, z: 30, w: 14, d: 14, front: 2, template: 'bar', land: 0, open: [17, 26], desc: 'Bar mit Tanzfläche, Jukebox und Billardecke (alkoholfreie Cocktails).' },
  { id: 'hv-markt', name: 'Supermarkt Frischekorb', district: 'hafen', kind: 'work', venue: 'market', x: 104, z: 6, w: 18, d: 20, front: 0, template: 'market', land: 0, open: [7, 22], desc: 'Lebensmittel, Tierbedarf und Blumen.' },
  { id: 'hv-radio', name: 'Radio Lindenwelle', district: 'hafen', kind: 'work', venue: 'radio', x: 125, z: 6, w: 18, d: 20, front: 0, template: 'radio', land: 0, desc: 'Der Lokalsender: Studio, Redaktion und Technikraum.' },
  { id: 'hv-pier', name: 'Hafenpromenade & Pier', district: 'hafen', kind: 'community', venue: 'pier', x: 104, z: 74, w: 44, d: 14, front: 0, template: 'pier', land: 0, desc: 'Promenade mit Steg zum Angeln, Bänken und Hafenwerkstatt.' },
  { id: 'hv-1', name: 'Kaiweg 12 (Loft-WG)', district: 'hafen', kind: 'home', venue: 'residential', x: 104, z: 52, w: 18, d: 16, front: 0, template: 'home-wg', land: 7000, desc: 'Umgebauter Speicher als Wohngemeinschaft.' },
  { id: 'hv-2', name: 'Kaiweg 14', district: 'hafen', kind: 'home', venue: 'residential', x: 125, z: 52, w: 18, d: 16, front: 0, template: 'home-loft', land: 8000, desc: 'Musterhaus „Hafenblick“: helles Loft mit Dachterrasse.' },
];

/** Abstrakte Wohnungen für Stadtbewohner (werden nicht als Gebäude dargestellt, NPCs dort sind „zu Hause“) */
/** Fassade: x, z, w, d (Kacheln); Tür an der Südseite */
export const APARTMENTS: Record<string, { name: string; district: DistrictId; door: [number, number]; box: [number, number, number, number] }> = {
  'apt-sonnenhain': { name: 'Wohnanlage Sonnenhain', district: 'sonnenhain', door: [35, 95], box: [26, 89, 18, 6] },
  'apt-altstadt': { name: 'Altstadtwohnungen', district: 'altstadt', door: [74, 95], box: [54, 89, 40, 6] },
  'apt-hafen': { name: 'Hafenlofts', district: 'hafen', door: [123, 95], box: [104, 89, 40, 6] },
};

export const lotById = (id: string): LotDef | undefined => LOTS.find((l) => l.id === id);
