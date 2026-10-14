/* Alle Abenteuer. */
import type { QuestDef } from '../../gameplay/quests.ts';
import { MAIN_QUESTS } from './main.ts';
import { HUB_QUESTS } from './hub.ts';
import { WORLD_QUESTS } from './worlds.ts';
export const ALL_QUESTS: QuestDef[] = [...MAIN_QUESTS, ...HUB_QUESTS, ...WORLD_QUESTS];
