// Formblöcke: Quader je Block (Stufe, Treppe, Zaun, Mauer, Scheibe, Tür, Leiter) für Mesher, Kollision und Vorschau.
// get(x, y, z) liefert Block-Ids der Nachbarn (Zäune, Mauern und Scheiben verbinden sich, Leiter und Tür richten sich an Wänden aus).
// coll = true: Kollisionsform (Zäune ohne Lücken zwischen den Latten); Quader [x0, y0, z0, x1, y1, z1] im Block (0..1).
import { SHAPE, OPAQUE, BLOCKS, B, DECO, DECO_DEF } from './blocks.js';

const STAIR = [[0, 0.5, 0, 1, 1, 0.5], [0.5, 0.5, 0, 1, 1, 1], [0, 0.5, 0.5, 1, 1, 1], [0, 0.5, 0, 0.5, 1, 1]];
const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // −z, +x, +z, −x
const isDoor = t => SHAPE[t] === 6;

// verbindet sich mit gleicher Art, vollen Blöcken und (Zaun/Mauer) Türen
function joins(kind, nb) { return SHAPE[nb] === kind || OPAQUE[nb] === 1 || ((kind === 3 || kind === 4) && isDoor(nb)); }

// Arme von der Mitte (Breite w, Höhe y0..y1) zu verbundenen Seiten; ohne Verbindung bei Scheiben ein Kreuz
function arms(out, con, w, y0, y1, crossIfNone) {
  const a = 0.5 - w / 2, b = 0.5 + w / 2;
  if (crossIfNone && !con.some(Boolean)) con = [1, 1, 1, 1];
  if (con[0]) out.push([a, y0, 0, b, y1, a]);
  if (con[1]) out.push([b, y0, a, 1, y1, b]);
  if (con[2]) out.push([a, y0, b, b, y1, 1]);
  if (con[3]) out.push([0, y0, a, a, y1, b]);
}

export function shapeBoxes(t, get, x, y, z, coll = false) {
  const k = SHAPE[t];
  if (!k) return null;
  if (k === 1) return [[0, 0, 0, 1, 0.5, 1]];
  if (k === 2) return [[0, 0, 0, 1, 0.5, 1], STAIR[BLOCKS[t].dir & 3]];
  const con = () => SIDES.map(([dx, dz]) => joins(k, get(x + dx, y, z + dz)) ? 1 : 0);
  if (k === 3) { // Zaun: Pfosten, zwei Latten je Seite (Kollision: volle Höhe)
    const c = con(), out = [[0.375, 0, 0.375, 0.625, 1, 0.625]];
    if (coll) arms(out, c, 0.25, 0, 1);
    else { arms(out, c, 0.125, 0.375, 0.5625); arms(out, c, 0.125, 0.75, 0.9375); }
    return out;
  }
  if (k === 4) { // Mauer: dicker Pfosten, niedrigere Wand zu den Seiten
    const out = [[0.25, 0, 0.25, 0.75, 1, 0.75]]; arms(out, con(), 0.375, 0, coll ? 1 : 0.8125); return out;
  }
  if (k === 5) { // Glasscheibe: dünner Steg, Kreuz wenn frei stehend
    const out = [[0.4375, 0, 0.4375, 0.5625, 1, 0.5625]]; arms(out, con(), 0.125, 0, 1, true); return out;
  }
  if (k === 6) { // Tür: Ausrichtung vom untersten Türblock der Säule (Wände links/rechts), offen = an die Kante geklappt
    let by = y; while (by > 0 && isDoor(get(x, by - 1, z))) by--;
    const wx = OPAQUE[get(x - 1, by, z)] || OPAQUE[get(x + 1, by, z)], wz = OPAQUE[get(x, by, z - 1)] || OPAQUE[get(x, by, z + 1)];
    const alongZ = wz && !wx, open = t === B.DOOR_OPEN, d = 0.1875;
    if (!open) return [alongZ ? [0.5 - d / 2, 0, 0, 0.5 + d / 2, 1, 1] : [0, 0, 0.5 - d / 2, 1, 1, 0.5 + d / 2]];
    return [alongZ ? [0, 0, 0, 1, 1, d] : [0, 0, 0, d, 1, 1]];
  }
  if (k === 7) { // Leiter: an der ersten festen Nachbarwand
    const d = 0.0625;
    for (const [dx, dz] of SIDES) if (OPAQUE[get(x + dx, y, z + dz)]) {
      return [dx === 1 ? [1 - d, 0, 0, 1, 1, 1] : dx === -1 ? [0, 0, 0, d, 1, 1] : dz === 1 ? [0, 0, 1 - d, 1, 1, 1] : [0, 0, 0, 1, 1, d]];
    }
    return [[0, 0, 0, 1, 1, d]];
  }
  if (k === 8) { const d = DECO_DEF[DECO[t]]; return [[0, 0, 0, 1, d && d.solid ? d.solid : 1, 1]]; } // Deko: fest bis zur Oberkante des Modells
  return null;
}

// Deko-Stück ausrichten: Rückseite an eine Wand; frei stehend zu einem Tisch o. ä. daneben drehen, sonst nach Süden (+z).
// Rückgabe 0..3 = Vorderseite +z, +x, −z, −x (wie decoMatrix)
const FRONT_AWAY = { '0,-1': 0, '1,0': 3, '0,1': 2, '-1,0': 1 }, FRONT_TO = { '0,-1': 2, '1,0': 1, '0,1': 0, '-1,0': 3 };
export function decoRot(get, x, y, z) {
  for (const [dx, dz] of SIDES) if (OPAQUE[get(x + dx, y, z + dz)]) return FRONT_AWAY[dx + ',' + dz];
  for (const [dx, dz] of SIDES) { const n = get(x + dx, y, z + dz), d = DECO_DEF[DECO[n]]; if (d && d.top) return FRONT_TO[dx + ',' + dz]; }
  return 0;
}
// Auf einem Tisch/Schrank Gestelltes sitzt auf dessen Oberfläche statt eine Blockhöhe darüber
export function decoLift(get, x, y, z) { const d = DECO_DEF[DECO[get(x, y - 1, z)]]; return d && d.top ? d.top - 1 : 0; }

// Überschneidet eine Box (Welt-Koordinaten) die Form des Blocks bei (bx, by, bz)?
export function shapeHits(t, get, bx, by, bz, x0, y0, z0, x1, y1, z1) {
  const bs = shapeBoxes(t, get, bx, by, bz, true);
  if (!bs) return true;
  for (const b of bs) if (x1 > bx + b[0] && x0 < bx + b[3] && y1 > by + b[1] && y0 < by + b[4] && z1 > bz + b[2] && z0 < bz + b[5]) return true;
  return false;
}
