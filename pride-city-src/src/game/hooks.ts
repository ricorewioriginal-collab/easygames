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
  /** Rainbow Match: Date gelaufen (stage = neue Stufe 0–3, up = Stufe gestiegen, pts 0–6) */
  dateGelaufen: { id: string; name: string; stage: number; up: boolean; pts: number };
  /** Liebesnacht (nur 18+, angedeutet) mit einem Match */
  liebesnacht: { id: string; name: string };
  /** Wahlfamilie: jemand zieht ein oder aus */
  mitbewohner: { id: string; name: string; in: boolean };
  /** Gemeinsamer Abend zu Hause (Spiele-, Koch-, Film-, Geschichtsabend …) */
  wgAbend: { id: string; with: string[] };
  /** Haustier adoptiert */
  haustier: { kind: string; name: string };
  /** Auftrag an einem Treffpunkt (Sauna, Strandbar) erledigt */
  treffAuftrag: { place: string; id: string };
}
export const pcEvents = new Emitter<PcEvents>();
