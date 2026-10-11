import type { EventId, ItemId } from './types';

export interface ItemDef {
  id: ItemId;
  name: string;
  icon: string;
  cost: number;
  /** Wird vor dem Würfeln aktiv eingesetzt (true) oder wirkt automatisch (false) */
  active: boolean;
  /** Braucht ein Ziel (anderer Spieler) */
  needsTarget: boolean;
  description: string;
  /** Gewichtung beim Zufallsfund */
  weight: number;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  zwillingswuerfel: { id: 'zwillingswuerfel', name: 'Zwillingswürfel', icon: '🎲', cost: 6, active: true, needsTarget: false, description: 'Du würfelst in diesem Zug mit zwei Würfeln (Summe).', weight: 4 },
  praezisionswuerfel: { id: 'praezisionswuerfel', name: 'Präzisionswürfel', icon: '🎯', cost: 5, active: true, needsTarget: false, description: 'Du würfelst zweimal und nimmst den höheren Wurf.', weight: 4 },
  schluesselfragment: { id: 'schluesselfragment', name: 'Schlüsselfragment', icon: '🗝️', cost: 5, active: false, needsTarget: false, description: 'Öffnet eine Mautbrücke kostenlos (wird dabei verbraucht).', weight: 3 },
  phasenmantel: { id: 'phasenmantel', name: 'Phasenmantel', icon: '🧥', cost: 7, active: true, needsTarget: false, description: 'Bis zum Zugende wirken negative Felder und Ereignisse nicht auf dich.', weight: 2 },
  tauschkristall: { id: 'tauschkristall', name: 'Tauschkristall', icon: '🔮', cost: 9, active: true, needsTarget: true, description: 'Tausche den Platz mit einem Mitspieler deiner Wahl.', weight: 1 },
  taschenspiegel: { id: 'taschenspiegel', name: 'Taschenspiegel', icon: '🪞', cost: 8, active: true, needsTarget: true, description: 'Spiegelt bis zu 6 Glimmer eines Mitspielers in deine Tasche.', weight: 2 },
  schutzschild: { id: 'schutzschild', name: 'Schutzschild', icon: '🛡️', cost: 6, active: true, needsTarget: false, description: 'Hält den nächsten Diebstahl, Platztausch oder Rempler von dir ab.', weight: 3 },
  frostuhr: { id: 'frostuhr', name: 'Frostuhr', icon: '⏳', cost: 7, active: true, needsTarget: true, description: 'Der nächste Wurf eines Mitspielers wird halbiert.', weight: 2 },
};

export const ITEM_IDS = Object.keys(ITEMS) as ItemId[];
export const isItemId = (v: unknown): v is ItemId => typeof v === 'string' && v in ITEMS;

export interface EventDef {
  id: EventId;
  name: string;
  icon: string;
  text: string;
  /** Positiv für den Betroffenen (für KI und Darstellung) */
  good: boolean;
}

export const EVENTS: Record<EventId, EventDef> = {
  glueck: { id: 'glueck', name: 'Glitzerregen', icon: '✨', text: 'Es regnet Glimmer! Du bekommst 6.', good: true },
  dornen: { id: 'dornen', name: 'Dornenwind', icon: '🌪️', text: 'Ein Dornenwind fegt vorbei: Du verlierst 4 Glimmer.', good: false },
  schatz: { id: 'schatz', name: 'Schatzkiste', icon: '🎁', text: 'Eine Schatzkiste! Du findest einen Gegenstand.', good: true },
  dieb: { id: 'dieb', name: 'Taschendieb', icon: '🦝', text: 'Ein Taschendieb schnappt dir 5 Glimmer und reicht sie einem Mitspieler.', good: false },
  spende: { id: 'spende', name: 'Großzügige Spende', icon: '💝', text: 'Alle bekommen 2 Glimmer, du 4.', good: true },
  umverteilung: { id: 'umverteilung', name: 'Umverteilung', icon: '⚖️', text: 'Der Reichste gibt dem Ärmsten 3 Glimmer.', good: true },
  faltung: { id: 'faltung', name: 'Raumfaltung', icon: '🌀', text: 'Der Raum faltet sich: Die Wege des Bretts verschieben sich sofort!', good: true },
  rueckenwind: { id: 'rueckenwind', name: 'Rückenwind', icon: '💨', text: 'Dein nächster Wurf zählt +3.', good: true },
  gegenwind: { id: 'gegenwind', name: 'Gegenwind', icon: '🍃', text: 'Dein nächster Wurf zählt −2.', good: false },
  ausgleich: { id: 'ausgleich', name: 'Sternschnuppe', icon: '🌠', text: 'Die Sternschnuppe belohnt den Letzten: +5 Glimmer für das Schlusslicht.', good: true },
  portalblitz: { id: 'portalblitz', name: 'Portalblitz', icon: '⚡', text: 'Ein Portalblitz schleudert dich zu einem Portal!', good: true },
  altarruf: { id: 'altarruf', name: 'Ruf des Altars', icon: '🔔', text: 'Der Chrono-Altar wandert an einen neuen Ort!', good: true },
};
export const EVENT_IDS = Object.keys(EVENTS) as EventId[];
