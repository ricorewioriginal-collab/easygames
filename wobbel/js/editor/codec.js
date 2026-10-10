/* Wobbel – Level-Editor: Kodierung (Teilen per Code/Link) und Prüfung der Karten. Rein, ohne DOM (auch im Node-Test nutzbar). */
import { parseLevel, createState, isSolved, T } from '../game/engine.js';
import { WORLDS } from '../game/worlds.js';

export const MAX_W = 16, MAX_H = 14, MIN_W = 5, MIN_H = 5, PREFIX = 'WOBBEL1-';
export const VALID = new Set([...'# @$rgb.RGB~i123kD^>v<x']);

/* rows: Array von Strings gleicher Länge. Gibt {errors, warnings, info} zurück. errors verhindern Test/Prüfen. */
export function validate(rows) {
  const errors = [], warnings = [], info = {};
  const h = rows.length, w = h ? rows[0].length : 0; if (!h || !w) return { errors: ['Das Level ist leer.'], warnings, info };
  if (rows.some(r => r.length !== w)) errors.push('Alle Zeilen müssen gleich lang sein.');
  const all = rows.join(''), count = ch => all.split(ch).length - 1;
  if (![...all].every(c => VALID.has(c))) errors.push('Unbekannte Zeichen im Level.');
  const crates = count('$') + count('r') + count('g') + count('b'), targets = count('.') + count('R') + count('G') + count('B'), doors = count('D'), keys = count('k'), water = count('~');
  Object.assign(info, { w, h, crates, targets, doors, keys, water });
  if (count('@') === 0) errors.push('Wobbel fehlt – setze die Startposition.'); else if (count('@') > 1) errors.push('Es darf nur einen Wobbel geben.');
  if (!errors.length) {
    const L = parseLevel({ map: rows });
    if (L.terrain[L.start] === T.VOID) errors.push('Wobbel steht außerhalb der Wände – schließe die Insel mit Wänden (Knopf „Rand mauern").');
    for (const [i] of L.crates) if (L.terrain[i] === T.VOID) { errors.push('Eine Kiste liegt außerhalb der Wände.'); break; }
    for (let i = 0; i < L.n; i++) if (L.terrain[i] === T.VOID && (rows[(i / w) | 0][i % w] !== ' ' && rows[(i / w) | 0][i % w] !== '#')) { warnings.push('Einige Elemente liegen außerhalb der Wände und werden ignoriert.'); break; }
    if (!L.targets.length) errors.push('Es fehlt mindestens ein Zielfeld.');
    if (crates < L.targets.length) errors.push(`Zu wenige Kisten (${crates}) für ${L.targets.length} Zielfelder.`);
    if (crates > L.targets.length && !water && !warnings.length) warnings.push('Es gibt mehr Kisten als Zielfelder – das ist nur sinnvoll, wenn Wasser überbrückt werden soll.');
    if (L.targets.length && isSolved(L, createState(L))) errors.push('Das Level ist schon im Startzustand gelöst.');
    if (doors && !keys) warnings.push('Es gibt Türen, aber keinen Schlüssel.');
    if (keys > doors) warnings.push('Mehr Schlüssel als Türen.');
    // Farbige Ziele ohne passende Kiste/Klecks
    const col = { R: 'r', G: 'g', B: 'b' }, paint = { R: '1', G: '2', B: '3' };
    for (const t of 'RGB') if (count(t) && !count(col[t]) && !count(paint[t]) && !count('$')) { warnings.push('Ein farbiges Ziel hat keine passende Kiste.'); break; }
  }
  return { errors, warnings, info };
}

const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
/** Level -> kurzer Text-Code, z.B. WOBBEL1-eyJ2Ijo… */
export function encode(def) { return PREFIX + b64(JSON.stringify({ v: 1, n: String(def.name || '').slice(0, 24), w: def.world | 0, m: def.map.join('/').replace(/ /g, '_') })); }
/** Code oder Link -> {name, world, map} oder wirft Error mit deutscher Meldung */
export function decode(text) {
  let s = String(text || '').trim(); const m = s.match(/code=([A-Za-z0-9_\-]+)/); if (m) s = m[1]; const i = s.indexOf(PREFIX); if (i >= 0) s = s.slice(i + PREFIX.length); else if (!/^[A-Za-z0-9_\-]+$/.test(s)) throw new Error('Das ist kein Wobbel-Level-Code.');
  let o; try { o = JSON.parse(unb64(s)); } catch (e) { throw new Error('Der Code ist beschädigt oder unvollständig.'); }
  if (!o || o.v !== 1 || typeof o.m !== 'string') throw new Error('Der Code stammt aus einer unbekannten Version.');
  const rows = o.m.split('/').map(r => r.replace(/_/g, ' ')); if (rows.length > MAX_H || rows.length < 3 || rows.some(r => r.length > MAX_W || r.length !== rows[0].length)) throw new Error('Das Level hat ungültige Maße.');
  const v = validate(rows); if (v.errors.length) throw new Error('Das Level ist ungültig: ' + v.errors[0]);
  return { name: String(o.n || 'Geteiltes Level').slice(0, 24), world: Math.max(0, Math.min(WORLDS.length - 1, o.w | 0)), map: rows };
}
