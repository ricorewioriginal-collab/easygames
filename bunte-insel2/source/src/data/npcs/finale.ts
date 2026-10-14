/* Figuren der Hauptgeschichte, die erst später auftauchen. */
import type { NpcDef } from '../../gameplay/npc.ts';
export const FINALE_NPCS: NpcDef[] = [
  { id: 'flick', name: 'Flick', world: 'hub', x: -182, z: -146, icon: '☁️', role: 'Das Himmelswölkchen', wander: 2, night: 'stay',
    creature: { kind: 'frostgeist', scale: 0.8 }, when: { quest: 'main_8', stageMin: 1 },
    greet: ['… Hallo.', 'Du bist noch da?'], chat: ['Von hier oben sieht man alle Inseln. Und alle, die hochschauen.', 'Ich mag Regenbogen. Und Freunde. Vor allem Freunde.'] }
];
