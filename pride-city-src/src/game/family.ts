/* Familie in Rainbow City: Mit einem Rainbow-Match, mit dem du „Zusammen“ bist, kannst du dich verloben (Ring aus der
   Boutique), im Regenbogenhaus heiraten und danach gemeinsam ein Kind adoptieren. Ehe für alle, Adoption für alle.
   Partner*in und Kind wohnen danach mit dir und warten zu Hause. Alles liegt im Spielstand unter flags. */
import type { SaveData } from '../engine/Save';
import { dateRec, profile } from './social';
import type { Look } from './Actor';

export const RING = 150, WEDDING = 400, ADOPT = 250, ADOPT_DAYS = 3, ADOPT_REP = 5;
export const KID_NAMES: Record<'m' | 'f', string[]> = { m: ['Noah', 'Emil', 'Ben', 'Milan', 'Jona'], f: ['Mila', 'Lia', 'Frieda', 'Ida', 'Nele'] };

export const spouse = (s: SaveData) => (s.flags.spouse ? profile(String(s.flags.spouse)) : undefined);
export const fiance = (s: SaveData) => (s.flags.engaged && !s.flags.spouse ? profile(String(s.flags.engaged)) : undefined);
export interface Kid { name: string; g: 'm' | 'f'; day: number }
export const kid = (s: SaveData): Kid | null => (s.flags.kid ? { name: String(s.flags.kid), g: s.flags.kidG === 'f' ? 'f' : 'm', day: Number(s.flags.kidDay) || 0 } : null);

/** Antrag möglich? Liefert einen Grund, falls nicht */
export function canPropose(s: SaveData, id: string): string | null {
  if (s.flags.spouse) return 'Du bist schon verheiratet.';
  if (s.flags.engaged) return 'Ihr seid schon verlobt.';
  if (dateRec(s, id).st < 3) return 'Erst, wenn ihr „Zusammen“ seid.';
  if ((s.inv.ring || 0) < 1) return `Du brauchst einen Ring (Boutique Fabelhaft, ${RING} €).`;
  return null;
}
export function propose(s: SaveData, id: string) { const why = canPropose(s, id); if (why) return why; s.inv.ring--; s.flags.engaged = id; return null; }

/** Hochzeit im Regenbogenhaus */
export function canWed(s: SaveData): string | null {
  if (s.flags.spouse) return 'Ihr seid schon verheiratet.';
  if (!s.flags.engaged) return 'Erst verloben: Ring kaufen und beim Date fragen.';
  if (s.money < WEDDING) return `Die Feier kostet ${WEDDING} € (dir fehlen ${WEDDING - s.money} €).`;
  return null;
}
export function wed(s: SaveData) { const why = canWed(s); if (why) return why; s.money -= WEDDING; s.flags.spouse = s.flags.engaged; s.flags.wedDay = s.day; s.rep += 5; return null; }

/** Adoption beantragen: verheiratet, genug Ruf, Gebühren; das Kind kommt nach ein paar Tagen */
export function canAdopt(s: SaveData): string | null {
  if (!s.flags.spouse) return 'Adoption geht hier nach der Hochzeit (Regenbogenhaus).';
  if (s.flags.kid) return 'Ihr habt schon ein Kind – genießt die Zeit!';
  if (s.flags.adopt) return `Euer Antrag läuft. Das Jugendamt meldet sich ab Tag ${Number(s.flags.adopt) + ADOPT_DAYS}.`;
  if (s.rep < ADOPT_REP) return `Das Jugendamt möchte ${ADOPT_REP} Ruf sehen (du hast ${s.rep}).`;
  if (s.money < ADOPT) return `Gebühren und Kurse kosten ${ADOPT} € (dir fehlen ${ADOPT - s.money} €).`;
  return null;
}
export function applyAdopt(s: SaveData, g: 'm' | 'f', name: string) { const why = canAdopt(s); if (why) return why; s.money -= ADOPT; s.flags.adopt = s.day; s.flags.kidG = g; s.flags.kidWant = name; return null; }

/** Einmal je Tag prüfen: Kind ist da? Liefert das neue Kind */
export function arrive(s: SaveData): Kid | null {
  if (!s.flags.adopt || s.flags.kid) return null;
  if (s.day < Number(s.flags.adopt) + ADOPT_DAYS) return null;
  s.flags.kid = String(s.flags.kidWant || KID_NAMES[s.flags.kidG === 'f' ? 'f' : 'm'][0]); s.flags.kidDay = s.day; delete s.flags.adopt; delete s.flags.kidWant;
  return kid(s);
}

/** Aussehen: Partner*in aus dem Profil, Kind als Rocketbox-Kind */
export function spouseLook(s: SaveData): Look | null { const p = spouse(s); return p ? { body: p.body, palette: p.palette, skin: p.skin, outfit: 'clothed', top: p.pron !== 'er' } : null; }
export function kidLook(s: SaveData): Look | null { const k = kid(s); if (!k) return null; const id = k.g === 'f' ? 'Female_Child_01' : 'Male_Child_01'; return { body: id, rb: id, palette: 'rainbow', skin: 0 }; }
