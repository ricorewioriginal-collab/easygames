// Registrierung und Typen der Interaktionen (Objekte, Personen, Haustiere, eigene Figur).
import type { AgeStage, NeedId, OutfitKind, SkillId } from '../data/types';
import type { ObjInst } from '../world/world';
import type { Game } from './game';
import type { Action, AnimId, Pet, Sim } from './types';

export interface Ctx {
  g: Game;
  s: Sim;
  a: Action;
  o?: ObjInst;
  t?: Sim;
  p?: Pet;
}
export type QCtx = Omit<Ctx, 'a'> & { a?: Action };

export interface RouteTarget {
  x: number;
  z: number;
  l: number;
  yaw?: number;
  y?: number;
  /** genutzter Platz eines Objekts (Reservierung) */
  obj?: ObjInst;
  slot?: number;
  /** mehrere mögliche Zielzellen (nächste gewinnt) */
  any?: { x: number; z: number; l: number }[];
}

export interface IDef {
  id: string;
  label: string | ((c: QCtx) => string);
  icon: string;
  on: 'obj' | 'sim' | 'pet' | 'self' | 'ground';
  func?: string[];
  ages?: AgeStage[];
  /** true = verfügbar, string = ausgegraut mit Grund, false = ausgeblendet */
  avail?: (c: QCtx) => true | string | false;
  /** Autonomie: Attraktivität je Bedürfnis (≈ Punkte, die das Bedürfnis steigt) */
  adv?: Partial<Record<NeedId, number>>;
  advFn?: (c: QCtx) => number;
  /** autonom wählbar (Standard: ja, wenn adv/advFn gesetzt) */
  auto?: boolean;
  slot?: 'sit' | 'sleep' | 'use' | 'stand' | 'any' | 'near' | 'none';
  route?: (c: Ctx) => RouteTarget | string | null;
  dur: number | ((c: Ctx) => number);
  anim: AnimId | ((c: Ctx) => AnimId);
  rate?: Partial<Record<NeedId, number>>;
  skill?: SkillId;
  xp?: number;
  until?: NeedId;
  start?: (c: Ctx) => string | void | false;
  tick?: (c: Ctx, dt: number) => void;
  done?: (c: Ctx) => void;
  end?: (c: Ctx) => void;
  prop?: string;
  outfit?: OutfitKind;
  /** darf von sozialen Anfragen unterbrochen werden */
  busy?: boolean;
  /** braucht Strom (Rechnungen bezahlt) */
  power?: boolean;
  /** Interaktion zählt für Geschichten/Lebensziele unter dieser ID */
  goal?: string;
  /** sozial: wird über socials.ts aufgelöst */
  social?: boolean;
  /** Spieler darf nur bei eigenen Figuren auslösen */
  hidden?: boolean;
  /** im Menü gruppieren */
  group?: string;
}

export const REG = new Map<string, IDef>();
export function def(d: IDef): IDef {
  REG.set(d.id, d);
  return d;
}
export const idef = (id: string): IDef | undefined => REG.get(id);
