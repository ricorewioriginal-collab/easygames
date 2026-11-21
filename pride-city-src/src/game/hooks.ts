/* Schnittstelle für Story, Minispiele und andere Systeme: Ereignisse rund um Clubs, Geschäfte und das eigene Zuhause.
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
}
export const pcEvents = new Emitter<PcEvents>();
