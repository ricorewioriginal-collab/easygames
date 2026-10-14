/* Alle Bewohner. */
import type { NpcDef } from '../../gameplay/npc.ts';
import { HUB_NPCS } from './hub.ts';
import { WORLD_NPCS } from './worlds.ts';
export const ALL_NPCS: NpcDef[] = [...HUB_NPCS, ...WORLD_NPCS];
