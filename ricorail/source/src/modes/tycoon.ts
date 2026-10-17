// Bahngesellschaft (Tycoon): Fahrzeuge kaufen, Linien bedienen, Tagesbilanz. Reine Spiellogik, fiktive Währung „RicoTaler“ (RT).
// Keine Echtgeld-Käufe. Ergebnisse sind deterministisch (Zufall aus Tag + Firmenname).
import type { Network } from '../railway/network';
import { LINES, type LineDef } from '../data/services';
import { FORM, vehicle, type FormationDef } from '../trains/stock';

export interface CoTrain { id: string; form: string; age: number; line: string | null; km: number }
export interface DayLog { day: number; revenue: number; cost: number; pax: number; tons: number; note?: string }
export interface Company {
  v: 1; name: string; money: number; day: number; rep: number; // Ruf 0..100
  routes: string[]; trains: CoTrain[]; log: DayLog[]; nextId: number;
}
export interface LineInfo { km: number; stops: number }

export const START_MONEY = 600_000;
export const ROUTE_PRICE: Record<string, number> = { f1: 0, f4: 150_000, f2: 200_000, f3: 220_000, d4: 300_000, d3: 350_000, d2: 380_000, d1: 450_000 };
const ELECTRIC_ROUTES = new Set(['d1', 'd2', 'd3', 'd4', 'f2', 'f3']);
// f1: Hauptbahn elektrifiziert, Museumsbahn nicht → Diesel/Dampf überall, E-Fahrzeuge nur auf Linien der Hauptbahn
const F1_NONELEC = new Set(['f1-mb']);

export function newCompany(name = 'RicoRail AG'): Company {
  return { v: 1, name, money: START_MONEY, day: 1, rep: 50, routes: ['f1'], trains: [], log: [], nextId: 1 };
}

/** Lädt/prüft einen gespeicherten Firmenstand (unbekannt → null) */
export function loadCompany(raw: unknown): Company | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Partial<Company>;
  if (c.v !== 1 || typeof c.money !== 'number' || !Array.isArray(c.trains) || !Array.isArray(c.routes)) return null;
  return { v: 1, name: String(c.name ?? 'RicoRail AG'), money: c.money, day: Math.max(1, Number(c.day) || 1), rep: clamp(Number(c.rep) || 50, 0, 100),
    routes: c.routes.filter((r) => r in ROUTE_PRICE), trains: c.trains.filter((t) => t && FORM.has(t.form)).map((t) => ({ id: String(t.id), form: t.form, age: Number(t.age) || 0, line: t.line ?? null, km: Number(t.km) || 0 })),
    log: Array.isArray(c.log) ? c.log.slice(-60) : [], nextId: Number(c.nextId) || 1 };
}

/** Kaufpreis: Fahrzeugpreise aus stock.ts × 10 */
export function formPrice(f: FormationDef): number { return f.vehicles.reduce((a, id) => a + vehicle(id).price, 0) * 10; }
export function formSeats(f: FormationDef): number { return f.vehicles.reduce((a, id) => a + (vehicle(id).seats ?? 0), 0); }
export function formPayload(f: FormationDef): number { return f.vehicles.reduce((a, id) => a + (vehicle(id).payload ?? 0), 0); }
function formElectric(f: FormationDef) { return f.vehicles.some((id) => vehicle(id).traction === 'electric'); }
function formPowered(f: FormationDef) { return f.vehicles.some((id) => vehicle(id).traction !== 'none'); }

/** Kann die Garnitur diese Linie bedienen? '' = ja, sonst Grund */
export function canServe(f: FormationDef, route: string, line: LineDef): string {
  if (!formPowered(f)) return 'Kein Triebfahrzeug';
  const freight = line.kind === 'GZ';
  if (freight && !formPayload(f)) return 'Güterlinie braucht Güterwagen';
  if (!freight && !formSeats(f)) return 'Personenlinie braucht Sitzplätze';
  const elec = ELECTRIC_ROUTES.has(route) || (route === 'f1' && !F1_NONELEC.has(line.id));
  if (formElectric(f) && !elec) return 'Strecke nicht elektrifiziert';
  if (f.vehicles.some((id) => vehicle(id).rack) !== (line.id === 'f2-z')) return line.id === 'f2-z' ? 'Zahnradbahn braucht Zahnradfahrzeug' : 'Zahnradfahrzeug nur auf der Zahnradbahn';
  if (f.vehicles.includes('tram') !== (line.kind === 'STR')) return line.kind === 'STR' ? 'Stadtbahnlinie braucht Stadtbahnwagen' : 'Stadtbahnwagen nur auf der Stadtbahnlinie';
  return '';
}

/** Linienlänge (Luftlinie der Halte × 1,15) */
export function lineInfo(net: Network, line: LineDef): LineInfo {
  const pts = line.stops.map((id) => {
    const st = net.def.stations.find((s) => s.id === id);
    const p = st?.platforms[0];
    return p ? net.track(p.track).point(p.s0) : null;
  }).filter((p): p is NonNullable<typeof p> => !!p);
  let m = 0;
  for (let i = 1; i < pts.length; i++) m += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
  return { km: Math.max(2, (m * 1.15) / 1000), stops: line.stops.length };
}

export function buyTrain(c: Company, formId: string): string {
  const f = FORM.get(formId); if (!f) return 'Unbekannte Garnitur';
  const p = formPrice(f);
  if (c.money < p) return `Nicht genug Geld (${money(p)} nötig)`;
  c.money -= p; c.trains.push({ id: `Z${c.nextId++}`, form: formId, age: 0, line: null, km: 0 });
  return '';
}
export function sellTrain(c: Company, id: string): number {
  const i = c.trains.findIndex((t) => t.id === id); if (i < 0) return 0;
  const t = c.trains[i]; const f = FORM.get(t.form)!;
  const v = Math.round(formPrice(f) * Math.max(0.25, 0.7 - t.age * 0.002));
  c.money += v; c.trains.splice(i, 1);
  return v;
}
export function buyRoute(c: Company, route: string): string {
  if (c.routes.includes(route)) return 'Bereits erworben';
  const p = ROUTE_PRICE[route]; if (p === undefined) return 'Unbekannte Strecke';
  if (c.money < p) return `Nicht genug Geld (${money(p)} nötig)`;
  c.money -= p; c.routes.push(route); return '';
}
export function assign(c: Company, trainId: string, lineKey: string | null): string {
  const t = c.trains.find((x) => x.id === trainId); if (!t) return 'Zug fehlt';
  if (lineKey) {
    const [route] = lineKey.split(':');
    const line = findLine(lineKey); if (!line) return 'Linie fehlt';
    if (!c.routes.includes(route)) return 'Strecke nicht erworben';
    const why = canServe(FORM.get(t.form)!, route, line); if (why) return why;
  }
  t.line = lineKey; return '';
}
export function findLine(key: string): LineDef | undefined { const [r, id] = key.split(':'); return (LINES[r] ?? []).find((l) => l.id === id); }

const PAX_BASE: Record<string, number> = { HGZ: 1.6, ICE: 1.6, IC: 1.3, RE: 1.0, RB: 0.8, S: 1.1, NC: 1.2, BB: 0.7, STR: 0.9, DPF: 1.4 };
const FARE: Record<string, number> = { HGZ: 0.22, ICE: 0.22, IC: 0.18, RE: 0.12, RB: 0.11, S: 0.14, NC: 0.15, BB: 0.2, STR: 0.25, DPF: 0.3 };

/** Simuliert einen Betriebstag; info liefert Länge/Halte je Linie */
export function simulateDay(c: Company, info: (lineKey: string) => LineInfo): DayLog {
  const rnd = rng(hash(c.name) ^ (c.day * 2654435761));
  let revenue = 0, cost = 0, pax = 0, tons = 0;
  const byLine = new Map<string, CoTrain[]>();
  for (const t of c.trains) {
    cost += 120 + t.age * 0.4; // Abstellung/Unterhalt je Tag
    if (t.line) { const a = byLine.get(t.line) ?? []; a.push(t); byLine.set(t.line, a); }
  }
  let note: string | undefined;
  for (const [key, trains] of byLine) {
    const line = findLine(key); if (!line) continue;
    const li = info(key);
    const tripH = li.km / 70 + li.stops * 0.02;
    const tripsPerTrain = Math.max(1, Math.floor(16 / (tripH + 0.25)));
    const trips = tripsPerTrain * trains.length;
    const repF = 0.6 + c.rep / 125;
    if (line.kind === 'GZ') {
      const cap = trains.reduce((a, t) => a + formPayload(FORM.get(t.form)!), 0) * tripsPerTrain;
      const demand = 900 * li.km ** 0.5 * repF * (0.85 + rnd() * 0.3);
      const moved = Math.min(cap * 0.85, demand);
      tons += moved; revenue += moved * li.km * 0.06;
    } else {
      const cap = trains.reduce((a, t) => a + formSeats(FORM.get(t.form)!), 0) * tripsPerTrain;
      const demand = 260 * li.stops * (PAX_BASE[line.kind] ?? 1) * repF * (0.85 + rnd() * 0.3) * Math.min(1.6, 0.5 + trips / 20);
      const carried = Math.min(cap * 0.8, demand);
      pax += carried; revenue += carried * li.km * 0.45 * (FARE[line.kind] ?? 0.12);
    }
    for (const t of trains) {
      const f = FORM.get(t.form)!;
      const km = li.km * tripsPerTrain;
      t.km += km;
      const mass = f.vehicles.reduce((a, id) => a + vehicle(id).mass, 0);
      const energy = formElectric(f) ? 0.018 : f.vehicles.some((id) => vehicle(id).traction === 'steam') ? 0.05 : 0.03;
      cost += km * (mass * energy * 0.5 + 0.8 + f.vehicles.length * 0.25); // Energie, Trassen, Wartung
    }
  }
  // Ereignisse
  const r = rnd();
  if (c.trains.length && r < 0.06) { const t = c.trains[Math.floor(rnd() * c.trains.length)]; const fix = 8000 + Math.round(rnd() * 12000); cost += fix; note = `Störung an ${t.id}: Reparatur ${money(fix)}`; c.rep = clamp(c.rep - 3, 0, 100); }
  else if (r > 0.95 && byLine.size) { const bonus = Math.round(revenue * 0.15); revenue += bonus; note = `Sonderverkehr (Volksfest): +${money(bonus)}`; }
  // Ruf: ausgelastete Linien → besser, keine Linien → leicht schlechter
  c.rep = clamp(c.rep + (byLine.size ? 0.6 : -0.3), 0, 100);
  for (const t of c.trains) t.age++;
  revenue = Math.round(revenue); cost = Math.round(cost);
  c.money += revenue - cost;
  const log: DayLog = { day: c.day, revenue, cost, pax: Math.round(pax), tons: Math.round(tons), note };
  c.log.push(log); if (c.log.length > 60) c.log.shift();
  c.day++;
  return log;
}

export function money(v: number) { return `${Math.round(v).toLocaleString('de-DE')} RT`; }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
