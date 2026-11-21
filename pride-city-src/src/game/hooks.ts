/* Schnittstelle für Story, Minispiele und andere Systeme: Ereignisse rund um Clubs, Geschäfte, das eigene Zuhause und die Drag-Karriere.
   Zuhören:  import { pcEvents } from './hooks';  pcEvents.on('clubGekauft', (e) => …)
   Im Browser auch über window.__pc.events (z. B. für Tests).
   Story-Angebot: s.flags['deal_<business-id>'] = Rabatt in Prozent (0–90) macht den Kauf günstiger, bis gekauft wurde. */
import { Emitter } from '../engine/events';

export interface PcEvents extends Record<string, unknown> {
  /** Ein Geschäft wurde gekauft (alle Geschäfte, auch Läden) */
  geschaeftGekauft: { id: string; name: string; price: number };
  /** Ein Club wurde gekauft (Prisma, One Love Bar, Bar Komet, Skybar Wolke 7) */
  clubGekauft: { id: string; name: string; price: number };
  /** DJ, Preise, Tür, Deko oder Awareness-Team eines Clubs geändert */
  clubGeaendert: { id: string; what: string; state: unknown };
  /** Eine Clubnacht wurde gespielt und abgerechnet */
  clubNacht: { id: string; name: string; guests: number; revenue: number; cost: number; rep: number; event: string };
  /** Tageseinnahmen aller Geschäfte ausgezahlt (morgens) */
  clubEinnahmen: { pay: number; notes: string[] };
  /** Zuhause ausgebaut: Möbel/Deko (kind 'item'), Boden/Licht ('style') oder Anbau-Raum ('room', level 1–3) */
  hausAusbau: { kind: 'item' | 'style' | 'room'; id: string; level: number };
  /** Drag-Look am Schminkspiegel gespeichert (drag.ts, dragLook.ts) */
  dragLook: { look: Record<string, string>; style: string };
  /** Lip-Sync-Battle vorbei (stage 1–5 = Karriere-Stufe, 0 = Kronen-Verteidigung) */
  dragBattle: { rival: string; name: string; won: boolean; score: number; stage: number; defend: boolean };
  /** Alle fünf Queens geschlagen: Krone von Rainbow City (Flag dragKrone) */
  dragKrone: { name: string };
  /** Eine Wissenskarte mit echter queerer Geschichte wurde freigeschaltet (Drag, CSD, Radio …) */
  wissen: { key: string; title: string; topic: string };
  /** Eigener CSD-Festwagen gebaut oder umgebaut (festwagen.ts) */
  wagenGestaltet: { flag: string; motto: string; deko: string; sound: string; score: number; first: boolean };
  /** Jury-Preis für den eigenen Wagen bei der CSD-Parade (Platz 1–3) */
  paradeWagen: { place: number; score: number; money: number; rep: number; motto: string };
  /** Eigene Radiosendung „Rainbow Talk“ auf Pride FM gesendet (pridefm.ts) */
  radioSendung: { points: number; listeners: number; money: number };
}
export const pcEvents = new Emitter<PcEvents>();
