/* Fuhrpark, Garage und Rennen: Jedes Auto fährt sich anders (Tempo, Turbo, Antritt, Lenkung). In der Garage
   Schraubenschlüssel in der Hochstadt kaufst du eigene Wagen, lackierst sie um und baust Turbo-Stufen ein.
   Straßenrennen gegen die Uhr mit Gold, Silber und Bronze; der Paketdienst ist die zweite Schicht neben dem Taxi.
   Modelle: KayKit City Builder Bits und Kenney Car Kit (beide CC0). */
import type { SaveData } from '../engine/Save';
import type { Gig } from './gigs';

export interface CarDef {
  id: string; /** KayKit-Datei oder „k:<name>“ für Kenney */ file: string; name: string; icon: string;
  /** m/s normal und mit Turbo */ max: number; turbo: number; acc: number; steer: number;
  /** Preis in der Garage (0 = nicht käuflich) */ price: number; /** Ladefläche: mehr Lohn beim Paketdienst */ cargo?: boolean; /** fliegt (lenkt wie ein Auto, dazu Steigen/Sinken) */ fly?: boolean; /** Einrad-Mobil aus toys.ts (18+ Penisring, sonst Donut), du sitzt sichtbar mittendrin */ toy?: boolean;
  /** Fahrzeug aus rides.ts: Einhorn-Roller, Pride-Bus, Glitzer-Boot (nur auf dem Wasser) */ ride?: 'scooter' | 'bus' | 'boat';
}

export const CAR_DEFS: CarDef[] = [
  { id: 'hatch', file: 'car_hatchback', name: 'Kleinwagen', icon: '🚗', max: 15, turbo: 24, acc: 9, steer: 2.1, price: 0 },
  { id: 'sedan', file: 'car_sedan', name: 'Limousine', icon: '🚘', max: 16, turbo: 25, acc: 9, steer: 2, price: 0 },
  { id: 'taxi', file: 'car_taxi', name: 'Taxi', icon: '🚕', max: 15, turbo: 24, acc: 9, steer: 2, price: 0 },
  { id: 'kombi', file: 'car_stationwagon', name: 'Kombi', icon: '🚙', max: 14, turbo: 23, acc: 8, steer: 1.9, price: 0, cargo: true },
  { id: 'bulli', file: 'k:van', name: 'Bulli „Flower Power“', icon: '🚐', max: 13, turbo: 21, acc: 7, steer: 1.7, price: 600, cargo: true },
  { id: 'liefer', file: 'k:delivery_van', name: 'Lieferwagen', icon: '🚚', max: 12, turbo: 20, acc: 6.5, steer: 1.6, price: 700, cargo: true },
  { id: 'pickup', file: 'k:truck', name: 'Pick-up „Bärenstark“', icon: '🛻', max: 14, turbo: 23, acc: 8, steer: 1.8, price: 800, cargo: true },
  { id: 'suv', file: 'k:suv', name: 'Geländewagen', icon: '🚙', max: 15, turbo: 24, acc: 8, steer: 1.8, price: 900 },
  { id: 'rakete', file: 'fly', name: 'Flitzer zum Fliegen', icon: '🚀', max: 16, turbo: 26, acc: 12, steer: 2.3, price: 0, fly: true },
  { id: 'ringmobil', file: 'ring', name: 'Penisring-Mobil', icon: '⭕', max: 14, turbo: 23, acc: 11, steer: 2.7, price: 0, toy: true },
  { id: 'roller', file: 'ride', name: 'Einhorn-Roller', icon: '🦄', max: 11, turbo: 18, acc: 10, steer: 3, price: 0, ride: 'scooter' },
  { id: 'pridebus', file: 'ride', name: 'Pride-Bus „CSD-Shuttle“', icon: '🚌', max: 11, turbo: 17, acc: 5.5, steer: 1.4, price: 0, ride: 'bus', cargo: true },
  { id: 'boot', file: 'ride', name: 'Glitzer-Boot', icon: '🚤', max: 13, turbo: 21, acc: 7, steer: 1.8, price: 0, ride: 'boat' },
  { id: 'flitzer', file: 'k:hatchback_sports', name: 'Flitzer GTI', icon: '🏎️', max: 18, turbo: 29, acc: 12, steer: 2.4, price: 1200 },
  { id: 'sport', file: 'k:sedan_sports', name: 'Sportcoupé „Blitz“', icon: '🏎️', max: 19, turbo: 31, acc: 13, steer: 2.2, price: 1800 },
  { id: 'lux', file: 'k:suv_luxury', name: 'Luxus-SUV „Baroness“', icon: '💎', max: 17, turbo: 27, acc: 10, steer: 1.9, price: 2600 },
  { id: 'renn', file: 'k:race_car', name: 'Rennwagen „Regenbogenpfeil“', icon: '🏁', max: 22, turbo: 36, acc: 16, steer: 2.5, price: 5000 },
];
export const carDef = (id: string) => CAR_DEFS.find((c) => c.id === id) || CAR_DEFS[0];
export const SHOP = CAR_DEFS.filter((c) => c.price > 0);

/** Wo die Garage steht und wo dein Wagen davor wartet */
export const GARAGE = { x: 170.5, z: -47.4, spawn: [163.5, -43.5, 0] as [number, number, number] };

/* ---------- Garage: kaufen, auswählen, lackieren, tunen ---------- */
export const PAINTS: Array<[string, string, number]> = [['Original', '⚪', -1], ['Rot', '🔴', 0], ['Orange', '🟠', 28], ['Gelb', '🟡', 52], ['Grün', '🟢', 125], ['Türkis', '🩵', 178], ['Blau', '🔵', 222], ['Lila', '🟣', 275], ['Pink', '🩷', 322]];
export const PAINT_COST = 40;
export const TUNE_COST = [300, 600, 1200];
export const ownsCar = (s: SaveData, id: string) => !!s.flags['car_' + id];
export const myCar = (s: SaveData): CarDef | null => { const id = String(s.flags.myCar || ''); return id && ownsCar(s, id) ? carDef(id) : null; };
export const tuneLevel = (s: SaveData) => Math.min(TUNE_COST.length, Number(s.flags.carTune) || 0);

export function buyCar(s: SaveData, c: CarDef): string | null {
  if (ownsCar(s, c.id)) return 'Der steht schon in deiner Garage.';
  if (!c.price) return 'Diesen Wagen gibt es nicht zu kaufen.';
  if (s.money < c.price) return `Dafür fehlen dir ${c.price - s.money} €.`;
  s.money -= c.price; s.flags['car_' + c.id] = s.day; s.flags.myCar = c.id;
  return null;
}
export function buyTune(s: SaveData): string | null {
  const l = tuneLevel(s);
  if (!myCar(s)) return 'Erst einen eigenen Wagen kaufen.';
  if (l >= TUNE_COST.length) return 'Mehr Turbo passt nicht unter die Haube.';
  if (s.money < TUNE_COST[l]) return `Dafür fehlen dir ${TUNE_COST[l] - s.money} €.`;
  s.money -= TUNE_COST[l]; s.flags.carTune = l + 1;
  return null;
}
export function buyPaint(s: SaveData, hue: number): string | null {
  if (!myCar(s)) return 'Erst einen eigenen Wagen kaufen.';
  if (s.money < PAINT_COST) return `Dafür fehlen dir ${PAINT_COST - s.money} €.`;
  s.money -= PAINT_COST; s.flags.carHue = hue;
  return null;
}
/** Fahrwerte: eigene Wagen werden mit jeder Turbo-Stufe 7 % schneller */
export function stats(c: CarDef, tune = 0) {
  const k = 1 + tune * .07;
  return { max: c.max * k, turbo: c.turbo * k, acc: c.acc * (1 + tune * .1), steer: c.steer };
}

/* ---------- Straßenrennen gegen die Uhr ---------- */
export interface Race { id: string; name: string; text: string; start: [number, number]; cps: Array<[number, number]>; /** Sekunden für Gold, Silber, Bronze */ medal: [number, number, number]; prize: [number, number, number] }
const lap = (pts: Array<[number, number]>, n: number) => Array.from({ length: n }, () => pts).flat();
export const RACES: Race[] = [
  { id: 'ring', name: 'Altstadtring', text: 'Zwei Runden um den Block am Pride Plaza.', start: [0, 30], medal: [44, 54, 70], prize: [150, 90, 40],
    cps: [...lap([[30, 30], [30, -30], [-30, -30], [-30, 30]], 2), [0, 30]] },
  { id: 'bruecke', name: 'Brückensprint', text: 'Über die Regenbogenbrücke in die Hochstadt und zurück.', start: [30, 0], medal: [40, 50, 66], prize: [200, 120, 50],
    cps: [[77, 0], [120, 0], [180, 0], [180, 30], [120, 30], [120, 0], [77, 0], [30, 0]] },
  { id: 'gp', name: 'Hochstadt-Grand-Prix', text: 'Drei Runden um die Türme, unter der Hochbahn hindurch.', start: [150, -30], medal: [62, 76, 98], prize: [350, 200, 80],
    cps: [...lap([[180, -30], [180, 30], [120, 30], [120, -30], [150, -30]], 3)] },
  { id: 'marathon', name: 'Stadtmarathon', text: 'Einmal durch die ganze Stadt: Altstadt, Brücke, Hochstadt und zurück.', start: [-30, 0], medal: [78, 95, 125], prize: [500, 300, 120],
    cps: [[-30, -30], [30, -30], [30, 0], [77, 0], [120, 0], [120, -30], [180, -30], [180, 30], [120, 30], [120, 0], [77, 0], [0, 0], [-30, 0]] },
];
export const MEDALS = ['🥇 Gold', '🥈 Silber', '🥉 Bronze'];
/** Platz (0 Gold … 2 Bronze, -1 nichts) für eine Zeit */
export const medalFor = (r: Race, sec: number) => r.medal.findIndex((m) => sec <= m);
export const bestTime = (s: SaveData, id: string) => Number(s.flags['race_' + id]) || 0;
/** Ergebnis eintragen: Preisgeld nur für eine bessere Medaille als bisher (sonst ein kleines Startgeld) */
export function finishRace(s: SaveData, r: Race, sec: number) {
  const m = medalFor(r, sec), old = bestTime(s, r.id), oldM = old ? medalFor(r, old) : -1;
  const better = m >= 0 && (oldM < 0 || m < oldM);
  const pay = m < 0 ? 0 : better ? r.prize[m] : 15;
  if (!old || sec < old) s.flags['race_' + r.id] = Math.round(sec * 10) / 10;
  s.money += pay; if (better) s.rep += 3 - m;
  return { medal: m, pay, record: !old || sec < old };
}
/** Rennen als Auftrag: Tore abfahren, Zeit läuft bis Bronze */
export function raceGig(r: Race, done: (sec: number) => void, failed: () => void): Gig {
  return { id: 'race_' + r.id, who: 'Rennleitung', color: '#ffd23b', title: `🏁 ${r.name}`, call: '', quiet: true, car: true,
    steps: r.cps.map(([x, z], i) => ({ x, z, label: i === r.cps.length - 1 ? 'Ziel' : `Tor ${i + 1}/${r.cps.length}`, icon: i === r.cps.length - 1 ? '🏁' : '🚩' })),
    time: r.medal[2], pay: 0, rep: 0, done: '', after: (left) => done(r.medal[2] - (left || 0)), failed };
}

/* ---------- Paketdienst „Eilbote“ ---------- */
const DROPS: Array<[number, number, string]> = [
  [4, 10, 'Café Kaffeeklatsch'], [34, 10, 'Boutique Fabelhaft'], [-34, 20, 'Studio Klappe Auf'], [-4, -10, 'Regenbogenhaus'], [34, -20, 'Muckibude'], [-71, -12, 'Club Leuchtturm'],
  [-80, 30, 'Strandbar Sandbank'], [135, 30, 'Kaleidoskop am Neonplatz'], [180, -10, 'Glasturm'], [105, -30, 'Brownstones'], [157, 26, 'Hochbahn-Station'], [195, 30, 'Mietshäuser Ost'], [96, -4, 'Samenbank Zukunft'],
];
const PARCELS = ['Perücken für die Abendshow', 'Zwölf Kisten Glitzer', 'Ersatz-Discokugel', 'Regenbogen-Torten', 'Plakate für die Demo', 'Ein sehr großer Teddy', 'Bühnennebel in Dosen', 'Frische Brezeln', 'Federboas, Größe XL', 'Schallplatten für DJ Pixel'];
/** Nächste Lieferung ab Depot an der Garage; mit Ladefläche gibt es ein Viertel mehr */
export function nextParcel(streak: number, r: number, cargo: boolean): Gig {
  const to = DROPS[Math.floor(r * DROPS.length) % DROPS.length], what = PARCELS[Math.floor(r * 977) % PARCELS.length];
  const dist = Math.hypot(GARAGE.spawn[0] - to[0], GARAGE.spawn[1] - to[1]);
  return { id: 'parcel', who: 'Eilbote', color: '#ff7a3d', title: `📦 Paketdienst${streak ? ` · Serie ${streak + 1}` : ''}`, call: `${what} für: ${to[2]}.`, car: true,
    steps: [{ x: GARAGE.spawn[0], z: GARAGE.spawn[1] + 5, label: 'Paket am Depot laden (Garage)', icon: '📦' }, { x: to[0], z: to[1], label: `Abliefern: ${to[2]}`, icon: '📬' }],
    time: Math.round(40 + dist * 1.15), pay: Math.round((18 + dist * .45 + streak * 7) * (cargo ? 1.25 : 1)), rep: streak >= 2 ? 1 : 0, done: `${to[2]}: „Pünktlich wie die Hochbahn. Danke!“` };
}
