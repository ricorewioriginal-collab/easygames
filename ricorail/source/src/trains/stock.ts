// Fahrzeugpark: eigenständige, selbst entworfene Fahrzeugklassen mit plausiblen technischen Werten.
// Alle Werte sind Spielwerte, angelehnt an typische Größenordnungen realer Fahrzeuggattungen (siehe docs/FUEHRERSTAENDE.md).
import type { CargoType } from '../railway/schema';

export type Traction = 'electric' | 'diesel' | 'steam' | 'none';
export type CabLayout = 'hst' | 'dosto' | 'sbahn' | 'dmu' | 'eloco' | 'dloco' | 'steam' | 'shunter' | 'neon' | 'rack' | 'tram';
export type Body =
  | 'hst_end' | 'hst_mid' | 'dosto_cab' | 'dosto' | 'sb_end' | 'sb_mid' | 'dmu' | 'eloco' | 'dloco' | 'steam' | 'tender' | 'shunter'
  | 'neon_end' | 'neon_mid' | 'rack' | 'tram' | 'coach' | 'coach_hist' | 'dining' | 'sleeper'
  | 'w_cont' | 'w_bulk' | 'w_tank' | 'w_cars' | 'w_wood' | 'w_box' | 'w_flat';

export interface VehicleType {
  id: string; name: string;
  /** Fahrzeugklasse 1–12 laut Auftrag (Gruppierung im Menü) */
  cls: number;
  body: Body;
  len: number;          // Länge über Puffer, m
  mass: number;         // Leermasse t
  payload?: number;     // max. Zuladung t (Güterwagen)
  cargo?: CargoType[];  // zulässige Ladung
  seats?: number;
  power?: number;       // Dauerleistung kW (am Rad)
  tractive?: number;    // Anfahrzugkraft kN
  vmax: number;         // km/h
  /** Bremsgewicht in % der Leermasse (Bremshundertstel) */
  brakePct: number;
  /** elektropneumatische/direkte Bremse (kurze Ansprechzeit) */
  ep?: boolean;
  /** elektrische/hydrodynamische Bremse kW */
  dynBrake?: number;
  /** Magnetschienenbremse (nur Schnellbremsung) kN */
  mgBrake?: number;
  traction: Traction;
  cab?: CabLayout;
  /** Zahnradantrieb (Fantasie-Bergbahn) */
  rack?: boolean;
  /** Stirnfläche × cw für Luftwiderstand (nur für führende Fahrzeuge relevant) */
  cdA: number;
  /** Drehgestell-/Achsabstände von Fahrzeugmitte, m */
  bogies: number[];
  color: number; accent: number;
  price: number; // fiktive RicoTaler
  desc: string;
  /** Tankinhalt Diesel l / Wasser l (Dampf) */
  fuel?: number; water?: number; coal?: number;
}

const V = (v: VehicleType) => v;

export const VEHICLES: VehicleType[] = [
  // 1 Hochgeschwindigkeitstriebzug (eigenes Design „Aero“)
  V({ id: 'aero_end', name: 'RR Aero 300 – Endwagen', cls: 1, body: 'hst_end', len: 26.5, mass: 56, seats: 44, power: 2000, tractive: 75, vmax: 300, brakePct: 160, ep: true, dynBrake: 2000, mgBrake: 60, traction: 'electric', cab: 'hst', cdA: 1.9, bogies: [-9.5, 9.5], color: 0xf2f4f6, accent: 0xd61f2c, price: 9000, desc: 'Verteilt angetriebener Hochgeschwindigkeitszug (eigenes Design, Aero-Bug).' }),
  V({ id: 'aero_mid', name: 'RR Aero 300 – Mittelwagen', cls: 1, body: 'hst_mid', len: 24.8, mass: 52, seats: 72, power: 1000, tractive: 38, vmax: 300, brakePct: 160, ep: true, dynBrake: 1000, mgBrake: 60, traction: 'electric', cdA: 0.5, bogies: [-8.75, 8.75], color: 0xf2f4f6, accent: 0xd61f2c, price: 3500, desc: 'Mittelwagen mit eigenem Antrieb.' }),
  // 2 Doppelstock-Regionalzug
  V({ id: 'dosto_cab', name: 'Doppelstock-Steuerwagen „Stockwerk“', cls: 2, body: 'dosto_cab', len: 27.3, mass: 50, seats: 110, vmax: 160, brakePct: 150, ep: true, traction: 'none', cab: 'dosto', cdA: 2.6, bogies: [-10, 10], color: 0xe8e8e2, accent: 0xc8102e, price: 2600, desc: 'Steuerwagen für Wendezüge – der Zug wird von der Lok am anderen Ende geschoben.' }),
  V({ id: 'dosto', name: 'Doppelstockwagen 2. Klasse', cls: 2, body: 'dosto', len: 26.8, mass: 48, seats: 130, vmax: 160, brakePct: 150, ep: true, traction: 'none', cdA: 0.6, bogies: [-10, 10], color: 0xe8e8e2, accent: 0xc8102e, price: 1900, desc: 'Doppelstockwagen mit großem Platzangebot.' }),
  // 3 S-Bahn
  V({ id: 'sb_end', name: 'S-Bahn „Takt 3“ – Endwagen', cls: 3, body: 'sb_end', len: 23.4, mass: 42, seats: 60, power: 700, tractive: 70, vmax: 140, brakePct: 170, ep: true, dynBrake: 800, mgBrake: 40, traction: 'electric', cab: 'sbahn', cdA: 3.0, bogies: [-8, 8], color: 0xd9d9d6, accent: 0xe3001b, price: 3200, desc: 'Leichter S-Bahn-Triebzug mit hoher Anfahrbeschleunigung (≈1,0 m/s²).' }),
  V({ id: 'sb_mid', name: 'S-Bahn „Takt 3“ – Mittelwagen', cls: 3, body: 'sb_mid', len: 22.0, mass: 38, seats: 64, power: 700, tractive: 70, vmax: 140, brakePct: 170, ep: true, dynBrake: 800, traction: 'electric', cdA: 0.4, bogies: [-7.5, 7.5], color: 0xd9d9d6, accent: 0xe3001b, price: 2600, desc: 'Angetriebener Mittelwagen.' }),
  // 4 Dieseltriebwagen
  V({ id: 'dmu', name: 'Nebenbahn-Triebwagen „Heideflitzer“', cls: 4, body: 'dmu', len: 25.5, mass: 41, seats: 70, power: 520, tractive: 60, vmax: 120, brakePct: 140, ep: true, dynBrake: 300, mgBrake: 30, traction: 'diesel', cab: 'dmu', cdA: 3.2, bogies: [-9, 9], color: 0xe6e3d8, accent: 0x2b8a3e, price: 2400, fuel: 1500, desc: 'Dieseltriebwagen für Nebenstrecken, zwei Motoren.' }),
  // 5 Elektrolok
  V({ id: 'eloco', name: 'Elektrolok „Sturmvogel E200“', cls: 5, body: 'eloco', len: 19.5, mass: 86, power: 6000, tractive: 300, vmax: 200, brakePct: 140, dynBrake: 5000, traction: 'electric', cab: 'eloco', cdA: 4.6, bogies: [-5, 5], color: 0xc8102e, accent: 0xf0f0f0, price: 6000, desc: 'Universal-Elektrolok für IC-, RE- und Güterzüge.' }),
  // 6 Diesellok
  V({ id: 'dloco', name: 'Schwere Diesellok „Brummbär D66“', cls: 6, body: 'dloco', len: 21.4, mass: 126, power: 2300, tractive: 400, vmax: 120, brakePct: 110, dynBrake: 1800, traction: 'diesel', cab: 'dloco', cdA: 5.2, bogies: [-6.5, 6.5], color: 0x2f3b48, accent: 0xf2b705, price: 5200, fuel: 6000, desc: 'Sechsachsige Güterzug-Diesellok mit hoher Zugkraft.' }),
  // 7 Dampflok mit Tender
  V({ id: 'steam', name: 'Dampflok „Rheinpfeil 01“', cls: 7, body: 'steam', len: 14.0, mass: 110, power: 1600, tractive: 180, vmax: 120, brakePct: 80, traction: 'steam', cab: 'steam', cdA: 5.5, bogies: [-4.5, 4.5], color: 0x161616, accent: 0xa3191b, price: 4800, water: 34000, coal: 10000, desc: 'Historische Schnellzug-Dampflok. Kessel, Wasser und Kohle müssen beachtet werden.' }),
  V({ id: 'tender', name: 'Schlepptender', cls: 7, body: 'tender', len: 10.0, mass: 60, vmax: 120, brakePct: 80, traction: 'none', cdA: 0.8, bogies: [-3, 3], color: 0x161616, accent: 0xa3191b, price: 600, desc: 'Wasser- und Kohlevorrat der Dampflok.' }),
  V({ id: 'coach_hist', name: 'Historischer Abteilwagen', cls: 7, body: 'coach_hist', len: 21.0, mass: 38, seats: 64, vmax: 120, brakePct: 90, traction: 'none', cdA: 0.8, bogies: [-7, 7], color: 0x0f3b2c, accent: 0xd9c27a, price: 900, desc: 'Grüner Abteilwagen mit Holzinterieur.' }),
  // 8 Rangierlok
  V({ id: 'shunter', name: 'Rangierlok „Igel R60“', cls: 8, body: 'shunter', len: 10.5, mass: 50, power: 480, tractive: 150, vmax: 60, brakePct: 100, traction: 'diesel', cab: 'shunter', cdA: 4.0, bogies: [-2.2, 2.2], color: 0xe06b00, accent: 0x222222, price: 1800, fuel: 2000, desc: 'Stangenlose Rangierlok mit fein dosierbarer Leistung (20 Fahrstufen).' }),
  // 9 Fantasie: NeonCity
  V({ id: 'neon_end', name: 'NeonLiner N9 – Kopfwagen', cls: 9, body: 'neon_end', len: 22.0, mass: 34, seats: 50, power: 900, tractive: 80, vmax: 160, brakePct: 190, ep: true, dynBrake: 900, mgBrake: 40, traction: 'electric', cab: 'neon', cdA: 2.2, bogies: [-7.5, 7.5], color: 0x1a1d2e, accent: 0x19f0ff, price: 3600, desc: 'Futuristischer Leichtbau-Triebzug für den NeonCity-Ring.' }),
  V({ id: 'neon_mid', name: 'NeonLiner N9 – Mittelwagen', cls: 9, body: 'neon_mid', len: 20.0, mass: 30, seats: 56, power: 900, tractive: 80, vmax: 160, brakePct: 190, ep: true, dynBrake: 900, traction: 'electric', cdA: 0.4, bogies: [-7, 7], color: 0x1a1d2e, accent: 0xff2d95, price: 2800, desc: 'Angetriebener Mittelwagen.' }),
  // 10 Fantasie: Zahnrad-Bergbahn
  V({ id: 'rack', name: 'Gipfelstürmer Z10 (Zahnrad)', cls: 10, body: 'rack', len: 18.0, mass: 46, seats: 80, power: 1000, tractive: 220, vmax: 80, brakePct: 200, dynBrake: 1000, traction: 'electric', cab: 'rack', rack: true, cdA: 3.0, bogies: [-6, 6], color: 0xf2c200, accent: 0x1d3557, price: 3800, desc: 'Bergbahn-Triebwagen mit Zahnradantrieb für Steigungen bis 120 ‰ auf Zahnstangen-Abschnitten.' }),
  // 11 Stadtbahn
  V({ id: 'tram', name: 'Stadtbahn „Glühwürmchen“', cls: 11, body: 'tram', len: 30.0, mass: 40, seats: 70, power: 560, tractive: 75, vmax: 80, brakePct: 220, ep: true, dynBrake: 700, mgBrake: 60, traction: 'electric', cab: 'tram', cdA: 2.8, bogies: [-10, 0, 10], color: 0xffd23f, accent: 0x2a2a2a, price: 2900, desc: 'Niederflur-Stadtbahnwagen mit Schienenbremse.' }),
  // Reisezugwagen
  V({ id: 'coach1', name: 'Reisezugwagen 1. Klasse', cls: 5, body: 'coach', len: 26.4, mass: 48, seats: 54, vmax: 200, brakePct: 150, traction: 'none', cdA: 0.6, bogies: [-9.5, 9.5], color: 0xf0f0f0, accent: 0xe8a33d, price: 1700, desc: 'Großraumwagen 1. Klasse.' }),
  V({ id: 'coach2', name: 'Reisezugwagen 2. Klasse', cls: 5, body: 'coach', len: 26.4, mass: 46, seats: 80, vmax: 200, brakePct: 150, traction: 'none', cdA: 0.6, bogies: [-9.5, 9.5], color: 0xf0f0f0, accent: 0xc8102e, price: 1500, desc: 'Großraumwagen 2. Klasse.' }),
  V({ id: 'dining', name: 'Speisewagen', cls: 5, body: 'dining', len: 26.4, mass: 50, seats: 24, vmax: 200, brakePct: 150, traction: 'none', cdA: 0.6, bogies: [-9.5, 9.5], color: 0xf0f0f0, accent: 0x7a1f2b, price: 1900, desc: 'Bordrestaurant – erhöht die Fahrgastzufriedenheit.' }),
  V({ id: 'sleeper', name: 'Schlafwagen', cls: 5, body: 'sleeper', len: 26.4, mass: 54, seats: 30, vmax: 200, brakePct: 150, traction: 'none', cdA: 0.6, bogies: [-9.5, 9.5], color: 0x1d2a5b, accent: 0xd9c27a, price: 2200, desc: 'Nachtzug-Schlafwagen.' }),
  // 12 Güterwagen
  V({ id: 'w_cont', name: 'Containertragwagen', cls: 12, body: 'w_cont', len: 19.7, mass: 20, payload: 60, cargo: ['container'], vmax: 120, brakePct: 85, traction: 'none', cdA: 1.4, bogies: [-7, 7], color: 0x5b6770, accent: 0x1e6fb8, price: 700, desc: 'Flachwagen für zwei 40-Fuß-Container.' }),
  V({ id: 'w_bulk', name: 'Offener Schüttgutwagen', cls: 12, body: 'w_bulk', len: 14.0, mass: 24, payload: 56, cargo: ['bulk', 'stone'], vmax: 100, brakePct: 85, traction: 'none', cdA: 1.6, bogies: [-4.8, 4.8], color: 0x6b3d24, accent: 0x3a3a3a, price: 650, desc: 'Hochbordwagen für Schotter, Erz und Kohle.' }),
  V({ id: 'w_tank', name: 'Kesselwagen', cls: 12, body: 'w_tank', len: 16.5, mass: 24, payload: 66, cargo: ['oil'], vmax: 100, brakePct: 85, traction: 'none', cdA: 1.3, bogies: [-5.6, 5.6], color: 0x2a2d30, accent: 0xf2b705, price: 800, desc: 'Kesselwagen für Mineralöl.' }),
  V({ id: 'w_cars', name: 'Doppelstock-Autotransportwagen', cls: 12, body: 'w_cars', len: 27.0, mass: 28, payload: 20, cargo: ['cars'], vmax: 120, brakePct: 85, traction: 'none', cdA: 1.8, bogies: [-10, 10], color: 0x8c8f93, accent: 0x2b6cb0, price: 900, desc: 'Zweistöckiger Wagen für Neufahrzeuge.' }),
  V({ id: 'w_wood', name: 'Rungenwagen (Holz)', cls: 12, body: 'w_wood', len: 19.9, mass: 23, payload: 57, cargo: ['wood'], vmax: 100, brakePct: 85, traction: 'none', cdA: 1.5, bogies: [-7, 7], color: 0x4a4a4a, accent: 0x9c6b3c, price: 600, desc: 'Rungenwagen für Rundholz.' }),
  V({ id: 'w_box', name: 'Schiebewandwagen', cls: 12, body: 'w_box', len: 23.0, mass: 27, payload: 50, cargo: ['goods'], vmax: 120, brakePct: 85, traction: 'none', cdA: 1.2, bogies: [-8.5, 8.5], color: 0x3d6b8c, accent: 0xcccccc, price: 750, desc: 'Gedeckter Wagen für palettierte Ware.' }),
  V({ id: 'w_flat', name: 'Flachwagen', cls: 12, body: 'w_flat', len: 19.9, mass: 22, payload: 60, cargo: ['goods', 'stone', 'wood'], vmax: 120, brakePct: 85, traction: 'none', cdA: 1.3, bogies: [-7, 7], color: 0x6b5a45, accent: 0x333333, price: 550, desc: 'Universeller Flachwagen.' }),
];

export const VEH = new Map(VEHICLES.map((v) => [v.id, v]));
export function vehicle(id: string): VehicleType { const v = VEH.get(id); if (!v) throw new Error(`Fahrzeug ${id} unbekannt`); return v; }

export interface FormationDef { id: string; name: string; cls: number; vehicles: string[]; /** Wagen, deren Fahrzeug-Spitze gedreht ist (Index) */ flipped?: number[]; loads?: number[]; desc: string; tags: ('pax' | 'freight' | 'shunt' | 'fantasy' | 'hist')[] }

export const FORMATIONS: FormationDef[] = [
  { id: 'aero8', name: 'RR Aero 300 (8 Wagen)', cls: 1, vehicles: ['aero_end', 'aero_mid', 'aero_mid', 'aero_mid', 'aero_mid', 'aero_mid', 'aero_mid', 'aero_end'], flipped: [7], desc: 'Hochgeschwindigkeitszug, 400 t, 10 MW.', tags: ['pax'] },
  { id: 'dosto_re', name: 'Regionalexpress Doppelstock (Lok + 4)', cls: 2, vehicles: ['dosto_cab', 'dosto', 'dosto', 'dosto', 'eloco'], flipped: [4], desc: 'Wendezug, Steuerwagen vorn, E-Lok schiebt.', tags: ['pax'] },
  { id: 'sbahn3', name: 'S-Bahn Takt 3 (3 Wagen)', cls: 3, vehicles: ['sb_end', 'sb_mid', 'sb_end'], flipped: [2], desc: 'Hohe Beschleunigung, viele Türen.', tags: ['pax'] },
  { id: 'sbahn6', name: 'S-Bahn Takt 3 Doppeltraktion', cls: 3, vehicles: ['sb_end', 'sb_mid', 'sb_end', 'sb_end', 'sb_mid', 'sb_end'], flipped: [2, 5], desc: 'Zwei gekuppelte Einheiten.', tags: ['pax'] },
  { id: 'dmu1', name: 'Heideflitzer (Solo)', cls: 4, vehicles: ['dmu'], desc: 'Dieseltriebwagen für Nebenbahnen.', tags: ['pax'] },
  { id: 'dmu2', name: 'Heideflitzer (Doppel)', cls: 4, vehicles: ['dmu', 'dmu'], flipped: [1], desc: 'Zwei gekuppelte Triebwagen.', tags: ['pax'] },
  { id: 'ic', name: 'Intercity (E-Lok + 6 Wagen)', cls: 5, vehicles: ['eloco', 'coach1', 'coach2', 'dining', 'coach2', 'coach2', 'coach2'], desc: 'Lokbespannter Fernzug, 200 km/h.', tags: ['pax'] },
  { id: 'nachtzug', name: 'Nachtzug (E-Lok + 5)', cls: 5, vehicles: ['eloco', 'sleeper', 'sleeper', 'coach2', 'dining', 'coach2'], desc: 'Mit Schlaf- und Speisewagen.', tags: ['pax'] },
  { id: 'cont_e', name: 'Containerzug (E-Lok + 12)', cls: 12, vehicles: ['eloco', ...Array(12).fill('w_cont')], loads: [0, ...Array(12).fill(48)], desc: 'Beladen ≈ 950 t.', tags: ['freight'] },
  { id: 'bulk_d', name: 'Schotterzug (Diesel + 10)', cls: 6, vehicles: ['dloco', ...Array(10).fill('w_bulk')], loads: [0, ...Array(10).fill(54)], desc: 'Schwer: ≈ 920 t.', tags: ['freight'] },
  { id: 'mixed_d', name: 'Gemischter Güterzug (Diesel)', cls: 12, vehicles: ['dloco', 'w_tank', 'w_tank', 'w_cars', 'w_wood', 'w_box', 'w_box', 'w_cont', 'w_flat'], loads: [0, 60, 60, 16, 50, 35, 35, 40, 0], desc: 'Kessel-, Auto-, Holz-, Schiebewand- und Containerwagen.', tags: ['freight'] },
  { id: 'tank_e', name: 'Kesselwagenzug (E-Lok + 14)', cls: 12, vehicles: ['eloco', ...Array(14).fill('w_tank')], loads: [0, ...Array(14).fill(62)], desc: '≈ 1300 t – Vorsicht im Gefälle.', tags: ['freight'] },
  { id: 'steam_hist', name: 'Museumszug (Dampf + 4)', cls: 7, vehicles: ['steam', 'tender', 'coach_hist', 'coach_hist', 'coach_hist', 'coach_hist'], desc: 'Historischer Sonderzug.', tags: ['pax', 'hist'] },
  { id: 'shunter', name: 'Rangierlok solo', cls: 8, vehicles: ['shunter'], desc: 'Für Rangier- und Werkdienst.', tags: ['shunt'] },
  { id: 'neon4', name: 'NeonLiner N9 (4 Wagen)', cls: 9, vehicles: ['neon_end', 'neon_mid', 'neon_mid', 'neon_end'], flipped: [3], desc: 'Futuristischer Ringzug.', tags: ['pax', 'fantasy'] },
  { id: 'rack1', name: 'Gipfelstürmer Z10', cls: 10, vehicles: ['rack'], desc: 'Zahnrad-Bergbahn.', tags: ['pax', 'fantasy'] },
  { id: 'tram1', name: 'Stadtbahn Glühwürmchen', cls: 11, vehicles: ['tram'], desc: 'Für Straßenbahnstrecken.', tags: ['pax', 'fantasy'] },
  { id: 'eloco_solo', name: 'E-Lok solo (Lz)', cls: 5, vehicles: ['eloco'], desc: 'Lokleerfahrt.', tags: ['shunt'] },
  { id: 'dloco_solo', name: 'Diesellok solo (Lz)', cls: 6, vehicles: ['dloco'], desc: 'Lokleerfahrt.', tags: ['shunt'] },
];
export const FORM = new Map(FORMATIONS.map((f) => [f.id, f]));

/** Fahrzeuge mit Führerstand (für Auswahl) */
export const CAB_LAYOUTS: Record<CabLayout, string> = {
  hst: 'Hochgeschwindigkeitszug (Seitenstick, Monitore)', dosto: 'Doppelstock-Steuerwagen', sbahn: 'S-Bahn (Kombihebel)', dmu: 'Dieseltriebwagen',
  eloco: 'Elektrolok (Fahrschalter + Führerbremsventil)', dloco: 'Diesellok (Fahrstufen)', steam: 'Dampflok (Regler, Steuerung, Kessel)', shunter: 'Rangierlok',
  neon: 'NeonLiner (Touchpult)', rack: 'Zahnrad-Bergbahn', tram: 'Stadtbahn (Sollwertgeber)',
};
