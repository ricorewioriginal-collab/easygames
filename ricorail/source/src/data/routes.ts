// Streckenpakete: vier nachgebildete deutsche Relationen und vier Fantasiewelten.
// Realstrecken: Trasse aus öffentlich bekannten Bahnhofslagen (WGS84, gerundet) interpoliert – „nachgebildetes Streckenpaket“,
// keine exakte Gleisgeometrie, keine offiziellen Signalstandorte oder Fahrpläne. Herkunft: docs/LIZENZEN.md, data/licences/.
import { NetBuilder, geo, spline, type StationSpec, type V3 } from '../railway/builder';
import type { NetworkDef, SceneryDef } from '../railway/schema';

export interface RouteInfo {
  id: string; name: string; world: 'real' | 'fantasy';
  region: string; desc: string;
  km: number; stations: string[];
  elec: string; vmax: number;
  trains: string[];      // geeignete Garnituren
  source: string;
  build: () => NetworkDef;
  color: string;
}

interface P { n?: string; lat: number; lon: number; h: number; st?: Partial<StationSpec> }

function realLine(b: NetBuilder, id: string, name: string, pts: P[], lat0: number, lon0: number, opts: { double: boolean; vmax: [number, number, number][] | number; elec: boolean; bridgesAt?: [number, number, number][]; tunnelsAt?: [number, number, number][]; from?: { g1: string; g2?: string }; openEnd?: boolean; maxGrade?: number; crossingsAt?: [number, number][]; km0?: number }) {
  const ctrl: V3[] = pts.map((p) => { const [x, z] = geo(p.lat, p.lon, lat0, lon0); return [x, z, p.h]; });
  const sp = spline(ctrl, 20, 6);
  const sAt = sp.sAt;
  const range = (r: [number, number, number][] | undefined) => r?.map(([i, f0, f1]) => [sAt[i] + (sAt[i + 1] - sAt[i]) * f0, sAt[i] + (sAt[i + 1] - sAt[i]) * f1] as [number, number]);
  const stations: StationSpec[] = [];
  pts.forEach((p, i) => { if (p.n) stations.push({ name: p.n, at: i, ...p.st }); });
  const vmax = typeof opts.vmax === 'number' ? opts.vmax : opts.vmax.map(([i0, i1, v]) => [sAt[i0], sAt[i1], v] as [number, number, number]);
  return b.line({
    id, name, ctrl, stations, double: opts.double, vmax, elec: opts.elec, bridges: range(opts.bridgesAt), tunnels: range(opts.tunnelsAt), from: opts.from, openEnd: opts.openEnd,
    maxGrade: opts.maxGrade, crossings: opts.crossingsAt?.map(([i, f]) => sAt[i] + (sAt[i + 1] - sAt[i]) * f), km0: opts.km0,
  });
}

const SRC_REAL = 'Nachgebildetes Streckenpaket: Bahnhofslagen nach öffentlich zugänglichen Ortsangaben (gerundet), Trasse interpoliert, Höhen und Geschwindigkeiten konservativ geschätzt. Keine offiziellen DB-Daten.';

// ------------------------------------------------------------------ D1 Hannover – Hamburg
function buildD1(): NetworkDef {
  const b = new NetBuilder('d1', 'Hannover – Hamburg', 'real', { terrain: 'plain', buildings: 'town', season: 'summer' }, SRC_REAL);
  const lat0 = 52.3767, lon0 = 9.741;
  realLine(b, 'D1', 'Hannover–Hamburg', [
    { n: 'Hannover Hbf', lat: 52.3767, lon: 9.7410, h: 55, st: { pt: 4, pax: 2400, len: 300 } },
    { lat: 52.4300, lon: 9.8000, h: 52 },
    { lat: 52.5300, lon: 9.9300, h: 45 },
    { n: 'Celle', lat: 52.6211, lon: 10.0626, h: 40, st: { pt: 4, pax: 900, len: 300 } },
    { n: 'Eschede', lat: 52.7356, lon: 10.2366, h: 62, st: { pax: 120 } },
    { n: 'Unterlüß', lat: 52.8556, lon: 10.2856, h: 105, st: { pax: 90 } },
    { n: 'Uelzen', lat: 52.9653, lon: 10.5594, h: 35, st: { pt: 4, pax: 600, len: 300 } },
    { n: 'Bad Bevensen', lat: 53.0817, lon: 10.5739, h: 40, st: { pax: 150 } },
    { lat: 53.1700, lon: 10.4900, h: 30 },
    { n: 'Lüneburg', lat: 53.2497, lon: 10.4194, h: 17, st: { pt: 4, pax: 800, len: 300, yard: { n: 4, len: 380, side: 'L', name: 'Güterbahnhof', industries: [{ name: 'Containerterminal Lüneburg', cargo: ['container'], action: 'both', track: 0 }, { name: 'Holzumschlag', cargo: ['wood'], action: 'load', track: 1 }, { name: 'Tanklager Ost', cargo: ['oil'], action: 'unload', track: 2 }] } } },
    { n: 'Winsen (Luhe)', lat: 53.3533, lon: 10.2119, h: 8, st: { pax: 300 } },
    { n: 'Hamburg-Harburg', lat: 53.4564, lon: 9.9917, h: 8, st: { pt: 4, pax: 1200, len: 300 } },
    { lat: 53.5060, lon: 10.0080, h: 6 },
    { n: 'Hamburg Hbf', lat: 53.5530, lon: 10.0069, h: 10, st: { pt: 4, pax: 3000, len: 320 } },
  ], lat0, lon0, { double: true, elec: true, vmax: [[0, 3, 160], [3, 9, 200], [9, 11, 160], [11, 13, 120]], bridgesAt: [[11, 0.55, 0.62], [12, 0.15, 0.22]], crossingsAt: [[4, 0.4], [7, 0.6]] });
  return b.done();
}

// ------------------------------------------------------------------ D2 Hannover – Bremen
function buildD2(): NetworkDef {
  const b = new NetBuilder('d2', 'Hannover – Bremen', 'real', { terrain: 'plain', buildings: 'town', season: 'autumn' }, SRC_REAL);
  const lat0 = 52.3767, lon0 = 9.741;
  realLine(b, 'D2', 'Hannover–Bremen', [
    { n: 'Hannover Hbf', lat: 52.3767, lon: 9.7410, h: 55, st: { pt: 4, pax: 2400, len: 300 } },
    { lat: 52.3900, lon: 9.6700, h: 53 },
    { n: 'Seelze', lat: 52.3960, lon: 9.5980, h: 52, st: { pt: 4, pax: 200, yard: { n: 5, len: 420, side: 'L', name: 'Rangierbahnhof', industries: [{ name: 'Logistikzentrum Seelze', cargo: ['goods', 'container'], action: 'both', track: 0 }, { name: 'Autoverladung', cargo: ['cars'], action: 'load', track: 2 }] } } },
    { n: 'Wunstorf', lat: 52.4256, lon: 9.4339, h: 46, st: { pt: 4, pax: 600 } },
    { n: 'Neustadt am Rübenberge', lat: 52.5039, lon: 9.4628, h: 40, st: { pax: 250 } },
    { lat: 52.5800, lon: 9.3300, h: 32 },
    { n: 'Nienburg (Weser)', lat: 52.6386, lon: 9.2133, h: 28, st: { pt: 4, pax: 450 } },
    { n: 'Eystrup', lat: 52.7808, lon: 9.2109, h: 20, st: { pax: 90 } },
    { n: 'Verden (Aller)', lat: 52.9206, lon: 9.2283, h: 15, st: { pt: 4, pax: 500 } },
    { n: 'Achim', lat: 53.0136, lon: 9.0306, h: 10, st: { pax: 300 } },
    { n: 'Bremen Hbf', lat: 53.0832, lon: 8.8136, h: 6, st: { pt: 4, pax: 2200, len: 320 } },
  ], lat0, lon0, { double: true, elec: true, vmax: [[0, 2, 120], [2, 9, 160], [9, 10, 120]], bridgesAt: [[5, 0.85, 0.9], [7, 0.85, 0.9]], crossingsAt: [[6, 0.5], [8, 0.4]] });
  return b.done();
}

// ------------------------------------------------------------------ D3 Köln – Koblenz (linke Rheinstrecke)
function buildD3(): NetworkDef {
  const b = new NetBuilder('d3', 'Köln – Bonn – Koblenz', 'real', { terrain: 'river', buildings: 'town', season: 'spring', sea: { side: 'E', level: 48 } }, SRC_REAL);
  const lat0 = 50.943, lon0 = 6.9589;
  realLine(b, 'D3', 'Linke Rheinstrecke', [
    { n: 'Köln Hbf', lat: 50.9430, lon: 6.9589, h: 53, st: { pt: 4, pax: 3000, len: 320 } },
    { n: 'Köln Süd', lat: 50.9254, lon: 6.9370, h: 55, st: { pax: 300 } },
    { n: 'Hürth-Kalscheuren', lat: 50.8752, lon: 6.9172, h: 58, st: { pt: 4, pax: 150, yard: { n: 3, len: 350, side: 'L', name: 'Güterbahnhof', industries: [{ name: 'Chemiepark Hürth', cargo: ['oil'], action: 'both', track: 0 }, { name: 'Baustoffhandel', cargo: ['stone', 'bulk'], action: 'unload', track: 1 }] } } },
    { n: 'Brühl', lat: 50.8297, lon: 6.9034, h: 63, st: { pax: 350 } },
    { lat: 50.7700, lon: 7.0150, h: 60 },
    { n: 'Bonn Hbf', lat: 50.7320, lon: 7.0970, h: 60, st: { pt: 4, pax: 1500, len: 300 } },
    { n: 'Bonn-Bad Godesberg', lat: 50.6847, lon: 7.1586, h: 60, st: { pax: 400 } },
    { n: 'Rolandseck', lat: 50.6380, lon: 7.2069, h: 60, st: { pax: 60, halt: true } },
    { n: 'Remagen', lat: 50.5781, lon: 7.2311, h: 62, st: { pt: 4, pax: 300 } },
    { n: 'Sinzig', lat: 50.5464, lon: 7.2508, h: 62, st: { pax: 150 } },
    { n: 'Bad Breisig', lat: 50.5094, lon: 7.2944, h: 60, st: { pax: 120 } },
    { n: 'Brohl', lat: 50.4856, lon: 7.3270, h: 61, st: { pax: 60, halt: true } },
    { n: 'Andernach', lat: 50.4386, lon: 7.4056, h: 65, st: { pt: 4, pax: 400 } },
    { n: 'Weißenthurm', lat: 50.4148, lon: 7.4611, h: 64, st: { pax: 80 } },
    { lat: 50.3700, lon: 7.5700, h: 64 },
    { n: 'Koblenz Hbf', lat: 50.3510, lon: 7.5886, h: 65, st: { pt: 4, pax: 1300, len: 300 } },
  ], lat0, lon0, { double: true, elec: true, vmax: [[0, 2, 120], [2, 5, 160], [5, 8, 140], [8, 12, 120], [12, 15, 140]], bridgesAt: [[14, 0.3, 0.5]], crossingsAt: [[9, 0.5], [10, 0.5]] });
  b.def.scenery!.push(...rhineScenery(lat0, lon0));
  return b.done();
}
function rhineScenery(lat0: number, lon0: number): SceneryDef[] {
  const p = (lat: number, lon: number) => geo(lat, lon, lat0, lon0);
  const [cx, cz] = p(50.9413, 6.9583), [rx, rz] = p(50.6560, 7.2100), [ax, az] = p(50.4400, 7.4020);
  return [{ kind: 'church', x: cx + 60, z: cz - 40, h: 157 }, { kind: 'castle', x: rx + 700, z: rz - 200, h: 40 }, { kind: 'tower', x: ax - 200, z: az + 150, h: 30 }];
}

// ------------------------------------------------------------------ D4 München – Garmisch-Partenkirchen
function buildD4(): NetworkDef {
  const b = new NetBuilder('d4', 'München – Garmisch-Partenkirchen', 'real', { terrain: 'mountain', buildings: 'alpine', season: 'winter' }, SRC_REAL + ' Abschnitt südlich Tutzing vereinfacht eingleisig mit Kreuzungsbahnhöfen.');
  const lat0 = 48.1402, lon0 = 11.56;
  const north = realLine(b, 'D4N', 'München–Tutzing', [
    { n: 'München Hbf', lat: 48.1402, lon: 11.5600, h: 519, st: { pt: 4, pax: 3000, len: 320 } },
    { n: 'München-Pasing', lat: 48.1497, lon: 11.4617, h: 528, st: { pt: 4, pax: 1200 } },
    { n: 'Gauting', lat: 48.0687, lon: 11.3786, h: 584, st: { pax: 300 } },
    { n: 'Starnberg', lat: 47.9985, lon: 11.3446, h: 587, st: { pt: 4, pax: 500 } },
    { n: 'Possenhofen', lat: 47.9627, lon: 11.3060, h: 600, st: { pax: 80, halt: true } },
    { n: 'Tutzing', lat: 47.9095, lon: 11.2795, h: 611, st: { pt: 4, pax: 300 } },
    { lat: 47.8960, lon: 11.2600, h: 605 },
  ], lat0, lon0, { double: true, elec: true, openEnd: true, vmax: [[0, 2, 120], [2, 6, 140]] });
  const end = north.end;
  const [ex, ez] = [b.nodePos(end.g1)[0], b.nodePos(end.g1)[2]];
  const g = (lat: number, lon: number) => geo(lat, lon, lat0, lon0);
  const pts: P[] = [
    { lat: 0, lon: 0, h: 605 },
    { n: 'Weilheim (Oberbay)', lat: 47.8406, lon: 11.1453, h: 562, st: { pt: 2, pax: 400, yard: { n: 3, len: 300, side: 'R', name: 'Ladegleise', industries: [{ name: 'Sägewerk Weilheim', cargo: ['wood'], action: 'unload', track: 0 }, { name: 'Kieswerk', cargo: ['stone', 'bulk'], action: 'load', track: 1 }] } } },
    { n: 'Huglfing', lat: 47.7697, lon: 11.1679, h: 600, st: { pax: 50, halt: true } },
    { n: 'Uffing am Staffelsee', lat: 47.7136, lon: 11.1567, h: 650, st: { pax: 60 } },
    { n: 'Murnau', lat: 47.6799, lon: 11.1937, h: 688, st: { pax: 250 } },
    { n: 'Ohlstadt', lat: 47.6331, lon: 11.2353, h: 650, st: { pax: 40, halt: true } },
    { n: 'Oberau', lat: 47.5603, lon: 11.1324, h: 655, st: { pax: 60 } },
    { n: 'Farchant', lat: 47.5328, lon: 11.1123, h: 672, st: { pax: 60, halt: true } },
    { n: 'Garmisch-Partenkirchen', lat: 47.4914, lon: 11.0965, h: 705, st: { pax: 600, len: 260 } },
  ];
  // Startpunkt der eingleisigen Fortsetzung: 100 m hinter dem Ende der zweigleisigen Strecke
  const d = north.center; const n = d.length / 3; const dx = d[(n - 1) * 3] - d[(n - 2) * 3], dz = d[(n - 1) * 3 + 2] - d[(n - 2) * 3 + 2]; const l = Math.hypot(dx, dz);
  const ctrl: V3[] = pts.map((p, i) => { if (i === 0) return [ex - 2.25 * (-dz / l) + dx / l * 100, ez - 2.25 * (dx / l) + dz / l * 100, p.h]; const [x, z] = g(p.lat, p.lon); return [x, z, p.h]; });
  const stations: StationSpec[] = []; pts.forEach((p, i) => { if (p.n) stations.push({ name: p.n, at: i, ...p.st }); });
  const sp = spline(ctrl, 20, 6);
  b.line({ id: 'D4S', name: 'Tutzing–Garmisch', ctrl, stations, double: false, elec: true, vmax: [[0, sp.sAt[4], 120], [sp.sAt[4], sp.sAt[8] + 1, 90]], from: { g1: end.g1, g2: end.g2 }, maxGrade: 25, crossings: [sp.sAt[2] + 1500, sp.sAt[6] + 900], km0: 40 });
  return b.done();
}

// ------------------------------------------------------------------ F1 Sonnenland-Express
function buildF1(): NetworkDef {
  const b = new NetBuilder('f1', 'Sonnenland-Express', 'fantasy', { terrain: 'hills', buildings: 'village', season: 'summer' }, 'Eigene Fantasiewelt (RicoRail).');
  const main = b.line({
    id: 'F1', name: 'Sonnenland-Hauptbahn', double: true, elec: true, vmax: 160, crossings: [9000, 31000],
    ctrl: [[0, 0, 80], [5200, -1500, 85], [11000, -800, 92], [16500, 1800, 110], [21000, 600, 130], [27000, -2600, 120], [33000, -1800, 105], [39000, 900, 95], [44500, 2600, 90]],
    stations: [
      { name: 'Sonnenstadt Hbf', at: 0, pt: 4, pax: 2000, len: 300 },
      { name: 'Lindenau', at: 1, pax: 300 },
      { name: 'Kornfeld', at: 2, pt: 4, pax: 500, yard: { n: 6, len: 420, side: 'R', name: 'Güterzentrum', industries: [
        { name: 'Containerterminal Kornfeld', cargo: ['container'], action: 'both', track: 0 }, { name: 'Sägewerk Kornfeld', cargo: ['wood'], action: 'unload', track: 1 },
        { name: 'Steinbruch-Verladung', cargo: ['stone', 'bulk'], action: 'load', track: 2 }, { name: 'Tanklager Kornfeld', cargo: ['oil'], action: 'unload', track: 3 },
        { name: 'Autowerk Sonnenland', cargo: ['cars'], action: 'load', track: 4 }, { name: 'Warenlager', cargo: ['goods'], action: 'both', track: 5 }] } },
      { name: 'Mühlbach', at: 3, pax: 250 },
      { name: 'Talheim', at: 4, pt: 4, pax: 400, junction: { side: 'R', at: 'exit', name: 'Museumsbahn' } },
      { name: 'Bergen', at: 5, pax: 200 },
      { name: 'Apfelhain', at: 6, pax: 150, halt: true },
      { name: 'Weidenbrück', at: 7, pax: 220 },
      { name: 'Seeblick Hbf', at: 8, pt: 4, pax: 1200, len: 300 },
    ],
  });
  const j = main.stations[4].junction!;
  const o: V3 = [j.pos[0], j.pos[2], j.pos[1]];
  const dir = j.dir, nx = -dir[1], nz = dir[0];
  b.line({ id: 'F1M', name: 'Museumsbahn', double: false, elec: false, vmax: 80, from: { g1: j.g1 }, entrySignal: 'Abzw', crossings: [3500],
    ctrl: [o, [o[0] + dir[0] * 3000 + nx * 600, o[1] + dir[1] * 3000 + nz * 600, 140], [o[0] + dir[0] * 7000 + nx * 1800, o[1] + dir[1] * 7000 + nz * 1800, 165], [o[0] + dir[0] * 11000 + nx * 1500, o[1] + dir[1] * 11000 + nz * 1500, 150]],
    stations: [{ name: 'Talheim Abzw', at: 0, halt: true, pax: 0 }, { name: 'Heidedorf', at: 1, pax: 120 }, { name: 'Burg Sonnenstein', at: 2, pax: 160 }, { name: 'Alte Mühle', at: 3, pax: 90 }] });
  b.def.scenery!.push({ kind: 'castle', x: o[0] + dir[0] * 7000 + nx * 2100, z: o[1] + dir[1] * 7000 + nz * 2100, h: 45 }, { kind: 'lake', x: 44500 + 600, z: 2600 - 900, r: 700 }, { kind: 'farm', x: 5200, z: -1500 + 300 }, { kind: 'farm', x: 16500, z: 1800 - 400 });
  return b.done();
}

// ------------------------------------------------------------------ F2 Nebelgebirge
function buildF2(): NetworkDef {
  const b = new NetBuilder('f2', 'Nebelgebirge', 'fantasy', { terrain: 'mountain', buildings: 'alpine', season: 'winter' }, 'Eigene Fantasiewelt (RicoRail).');
  const valley = b.line({
    id: 'F2', name: 'Nebelgebirgsbahn', double: false, elec: true, vmax: [[0, 9000, 100], [9000, 40000, 70]], maxGrade: 40, block: 2000,
    ctrl: [[0, 0, 600], [4000, -2200, 700], [7000, -600, 820], [10000, -3200, 960], [13500, -1600, 1080], [16500, -4200, 1150]],
    stations: [{ name: 'Nebeltal', at: 0, pax: 500, pt: 2 }, { name: 'Klammbrück', at: 1, pax: 120 }, { name: 'Felsenau', at: 2, pax: 150 }, { name: 'Wolkenstein', at: 3, pax: 100 }, { name: 'Gletscherblick', at: 4, pax: 140 }, { name: 'Passhöhe', at: 5, pax: 200 }],
    tunnels: [[5200, 6400], [8200, 9100], [11000, 12300]], bridges: [[2600, 3100], [9300, 9700], [14600, 15000]],
  });
  // Zahnradstrecke zum Gipfel (Fantasie)
  const e = valley.end;
  const p = b.nodePos(e.g1);
  b.line({ id: 'F2Z', name: 'Gipfel-Zahnradbahn', double: false, elec: true, vmax: 40, maxGrade: 120, from: { g1: e.g1 }, rack: [[0, 20000]], openStart: true,
    ctrl: [[p[0], p[2], p[1]], [p[0] + 900, p[2] - 1200, p[1] + 90], [p[0] + 2300, p[2] - 1700, p[1] + 260], [p[0] + 3400, p[2] - 2600, p[1] + 380]],
    stations: [{ name: 'Passhöhe Zahnradbf', at: 0, halt: true, pax: 0 }, { name: 'Murmeltierwiese', at: 1, halt: true, pax: 30 }, { name: 'Eisgrotte', at: 2, halt: true, pax: 40 }, { name: 'Nebelhorn Gipfel', at: 3, pax: 120 }] });
  return b.done();
}

// ------------------------------------------------------------------ F3 NeonCity Rail
function buildF3(): NetworkDef {
  const b = new NetBuilder('f3', 'NeonCity Rail', 'fantasy', { terrain: 'city', buildings: 'neon', season: 'autumn' }, 'Eigene Fantasiewelt (RicoRail).');
  const R = 2600, n = 10;
  const ctrl: V3[] = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; ctrl.push([Math.cos(a) * R * (1 + 0.18 * Math.sin(3 * a)), Math.sin(a) * R * 0.8, 20 + 10 * Math.sin(2 * a)]); }
  const names = ['Neon Zentrum', 'Plasmaplatz', 'Datenhafen', 'Chromtürme', 'Sternwarte', 'Pixelpark', 'Synthwave Allee', 'Laserdom', 'Quantenmarkt', 'Hologrammhof'];
  const ring = b.line({ id: 'F3', name: 'S-Bahn-Ring', double: true, elec: true, vmax: 120, ring: true, block: 900,
    ctrl, stations: names.map((nm, i) => ({ name: nm, at: i, pax: 900, len: 180, pt: i === 0 || i === 5 ? 4 : 2, junction: i === 2 ? { side: 'R' as const, at: 'exit' as const, name: 'Stadtbahn Hafenviertel' } : undefined })),
    bridges: [[1200, 4200], [9000, 11500]], tunnels: [[5600, 7600], [13000, 14200]] });
  const j = ring.stations[2].junction!;
  const o: V3 = [j.pos[0], j.pos[2], j.pos[1]], d = j.dir;
  b.line({ id: 'F3T', name: 'Stadtbahn Hafenviertel', double: false, elec: true, vmax: 60, from: { g1: j.g1 }, entrySignal: 'Abzw', block: 700,
    ctrl: [o, [o[0] + d[0] * 1500 - d[1] * 400, o[1] + d[1] * 1500 + d[0] * 400, 14], [o[0] + d[0] * 3000 - d[1] * 300, o[1] + d[1] * 3000 + d[0] * 300, 8], [o[0] + d[0] * 4400 + d[1] * 300, o[1] + d[1] * 4400 - d[0] * 300, 4]],
    stations: [{ name: 'Abzw Datenhafen', at: 0, halt: true, pax: 0 }, { name: 'Lichterkai', at: 1, pax: 300 }, { name: 'Glühwürmchenmarkt', at: 2, pax: 300 }, { name: 'Hafenviertel', at: 3, pax: 400 }] });
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; b.def.scenery!.push({ kind: 'skyscraper', x: Math.cos(a) * 1400, z: Math.sin(a) * 1100, h: 90 + (i * 37) % 140 }); }
  return b.done();
}

// ------------------------------------------------------------------ F4 Inselbahn & Küstenlinie
function buildF4(): NetworkDef {
  const b = new NetBuilder('f4', 'Inselbahn & Küstenlinie', 'fantasy', { terrain: 'coast', buildings: 'harbour', season: 'summer', sea: { side: 'N', level: 0 } }, 'Eigene Fantasiewelt (RicoRail).');
  b.line({ id: 'F4', name: 'Küstenlinie', double: false, elec: false, vmax: [[0, 20000, 100], [20000, 40000, 80]], block: 2500, crossings: [5200, 14800],
    ctrl: [[0, 0, 8], [4000, -900, 12], [8500, -300, 10], [13000, -1400, 14], [17500, -800, 9], [21000, -2600, 6], [25500, -3200, 7]],
    stations: [
      { name: 'Hafenstadt', at: 0, pax: 900, pt: 2 },
      { name: 'Möwenkap', at: 1, pax: 200, yard: { n: 6, len: 400, side: 'L', name: 'Hafen- und Rangierbahnhof', industries: [
        { name: 'Containerkai', cargo: ['container'], action: 'both', track: 0 }, { name: 'Fischereihafen', cargo: ['goods'], action: 'load', track: 1 },
        { name: 'Tanklager Möwenkap', cargo: ['oil'], action: 'unload', track: 2 }, { name: 'Holzkai', cargo: ['wood'], action: 'load', track: 3 }, { name: 'Steinmole (Baustelle)', cargo: ['stone', 'bulk'], action: 'unload', track: 4 }] } },
      { name: 'Dünenhof', at: 2, pax: 120 },
      { name: 'Leuchtturm', at: 3, pax: 150 },
      { name: 'Strandbad', at: 4, pax: 300 },
      { name: 'Inselbrücke', at: 5, pax: 60, halt: true },
      { name: 'Nordstrand (Insel)', at: 6, pax: 400 },
    ],
    bridges: [[21600, 24200]] });
  b.def.scenery!.push({ kind: 'tower', x: 13000, z: -1400 - 500, h: 28 }, { kind: 'harbour', x: 4000, z: -900 - 600 }, { kind: 'harbour', x: 0, z: -400 });
  return b.done();
}

export const ROUTES: RouteInfo[] = [
  { id: 'd1', name: 'Hannover – Celle – Uelzen – Lüneburg – Hamburg', world: 'real', region: 'Niedersachsen / Hamburg', desc: 'Lange zweigleisige Hauptbahn durch die Lüneburger Heide: Fern-, Regional- und Güterverkehr, Güterbahnhof Lüneburg.', km: 0, stations: [], elec: '15 kV elektrifiziert', vmax: 200, trains: ['aero8', 'ic', 'dosto_re', 'cont_e', 'tank_e', 'nachtzug'], source: SRC_REAL, build: buildD1, color: '#d61f2c' },
  { id: 'd2', name: 'Hannover – Wunstorf – Nienburg – Verden – Bremen', world: 'real', region: 'Niedersachsen / Bremen', desc: 'Hauptbahn über die Weser- und Allerniederung, Rangierbahnhof Seelze, Überholungen in Nienburg und Verden.', km: 0, stations: [], elec: '15 kV elektrifiziert', vmax: 160, trains: ['ic', 'dosto_re', 'sbahn3', 'cont_e', 'mixed_d'], source: SRC_REAL, build: buildD2, color: '#1e6fb8' },
  { id: 'd3', name: 'Köln – Bonn – Remagen – Koblenz', world: 'real', region: 'Nordrhein-Westfalen / Rheinland-Pfalz', desc: 'Linke Rheinstrecke am Fluss entlang: dichter Regionalverkehr, Burgen, Mosel-Brücke vor Koblenz.', km: 0, stations: [], elec: '15 kV elektrifiziert', vmax: 160, trains: ['dosto_re', 'ic', 'sbahn3', 'tank_e', 'steam_hist'], source: SRC_REAL, build: buildD3, color: '#2b8a3e' },
  { id: 'd4', name: 'München – Tutzing – Weilheim – Murnau – Garmisch-Partenkirchen', world: 'real', region: 'Oberbayern', desc: 'Von der Großstadt ins Gebirge: Steigungen bis 25 ‰, eingleisige Kreuzungsbahnhöfe, Winterwetter.', km: 0, stations: [], elec: '15 kV elektrifiziert', vmax: 140, trains: ['dosto_re', 'sbahn3', 'ic', 'bulk_d', 'eloco_solo'], source: SRC_REAL, build: buildD4, color: '#7a5cff' },
  { id: 'f1', name: 'Sonnenland-Express', world: 'fantasy', region: 'Fantasiewelt', desc: 'Großes zusammenhängendes Netz: grüne Täler, Durchgangsbahnhöfe, Güterzentrum Kornfeld mit sechs Ladestellen und Museumsbahn zur Burg.', km: 0, stations: [], elec: 'Hauptbahn elektrifiziert, Museumsbahn Diesel/Dampf', vmax: 160, trains: ['ic', 'dosto_re', 'steam_hist', 'dmu1', 'mixed_d', 'cont_e', 'shunter'], source: 'Eigene Fantasiewelt', build: buildF1, color: '#ffb300' },
  { id: 'f2', name: 'Nebelgebirge', world: 'fantasy', region: 'Fantasiewelt', desc: 'Lange Tunnel, Viadukte, Rampen bis 40 ‰ und eine Zahnradbahn zum Gipfel – Schnee und Nebel.', km: 0, stations: [], elec: 'elektrifiziert', vmax: 100, trains: ['rack1', 'dmu1', 'dosto_re', 'bulk_d'], source: 'Eigene Fantasiewelt', build: buildF2, color: '#8fa3b8' },
  { id: 'f3', name: 'NeonCity Rail', world: 'fantasy', region: 'Fantasiewelt', desc: 'Futuristischer S-Bahn-Ring mit Hochbahn und Tunneln, dichter Takt bei Nacht und Stadtbahn ins Hafenviertel.', km: 0, stations: [], elec: 'elektrifiziert', vmax: 120, trains: ['neon4', 'sbahn3', 'tram1'], source: 'Eigene Fantasiewelt', build: buildF3, color: '#19f0ff' },
  { id: 'f4', name: 'Inselbahn & Küstenlinie', world: 'fantasy', region: 'Fantasiewelt', desc: 'Küstenlinie mit Hafen- und Rangierbahnhof, Leuchtturm und langer Brücke zur Insel.', km: 0, stations: [], elec: 'nicht elektrifiziert', vmax: 100, trains: ['dmu2', 'dloco_solo', 'mixed_d', 'steam_hist', 'shunter'], source: 'Eigene Fantasiewelt', build: buildF4, color: '#2ec4b6' },
];
export const ROUTE = new Map(ROUTES.map((r) => [r.id, r]));

const cache = new Map<string, NetworkDef>();
/** Baut (einmalig) das Netz einer Strecke */
export function routeNet(id: string): NetworkDef {
  let n = cache.get(id);
  if (!n) {
    const r = ROUTE.get(id); if (!r) throw new Error(`Strecke ${id} unbekannt`);
    n = r.build(); cache.set(id, n);
    const len = n.tracks.filter((t) => t.pref !== -1 && !t.yard).reduce((a, t) => { let l = 0; for (let i = 3; i < t.pts.length; i += 3) l += Math.hypot(t.pts[i] - t.pts[i - 3], t.pts[i + 2] - t.pts[i - 1]); return a + l; }, 0);
    r.km = Math.round(len / 100) / 10;
    r.stations = n.stations.filter((s) => s.kind !== 'yard' && s.platforms.length && s.pax !== 0).map((s) => s.name);
  }
  return n;
}
