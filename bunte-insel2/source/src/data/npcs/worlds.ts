/* Bewohner aller Welten außer der Hauptinsel. */
import type { NpcDef } from '../../gameplay/npc.ts';
import { STADT_NPCS, FELLRETTER_NPCS, DRACHEN_NPCS, DAMPFER_NPCS } from '../../world/worlds/group1.ts';
import { REGENBOGEN_NPCS, PARK_NPCS, FUSSBALL_NPCS, MAERCHEN_NPCS, SCHLUESSEL_NPCS, WUNSCH_NPCS } from '../../world/worlds/group2.ts';
import { SCHWAMM_NPCS, ATLANTIS_NPCS, FUNKWELLE_NPCS, LUNARIS_NPCS, TASCHI_NPCS, HUEPF_NPCS, BAULAND_NPCS, RAETSEL_NPCS } from '../../world/worlds/group3.ts';
import { PRISMA_NPCS } from '../../world/worlds/prisma.ts';
import { FINALE_NPCS } from './finale.ts';
export const WORLD_NPCS: NpcDef[] = [...STADT_NPCS, ...FELLRETTER_NPCS, ...DRACHEN_NPCS, ...DAMPFER_NPCS, ...REGENBOGEN_NPCS, ...PARK_NPCS, ...FUSSBALL_NPCS, ...MAERCHEN_NPCS, ...SCHLUESSEL_NPCS, ...WUNSCH_NPCS, ...SCHWAMM_NPCS, ...ATLANTIS_NPCS, ...FUNKWELLE_NPCS, ...LUNARIS_NPCS, ...TASCHI_NPCS, ...HUEPF_NPCS, ...BAULAND_NPCS, ...RAETSEL_NPCS, ...PRISMA_NPCS, ...FINALE_NPCS];
