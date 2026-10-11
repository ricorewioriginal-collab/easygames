import { MapSchema, Schema, defineTypes } from '@colyseus/schema';

/** Ein Platz in der Lobby (Mensch oder Bot). Wird von Colyseus automatisch an alle Clients synchronisiert. */
export class SlotState extends Schema {
  id = '';
  name = '';
  character = 'pip';
  kind = 'human';
  difficulty = 'normal';
  ready = false;
  connected = true;
  host = false;
}
defineTypes(SlotState, {
  id: 'string',
  name: 'string',
  character: 'string',
  kind: 'string',
  difficulty: 'string',
  ready: 'boolean',
  connected: 'boolean',
  host: 'boolean',
});

export class LobbyState extends Schema {
  /** 'lobby' | 'playing' | 'ended' */
  phase = 'lobby';
  code = '';
  layoutId = 'prismara-01';
  rounds = 12;
  slots = new MapSchema<SlotState>();
}
defineTypes(LobbyState, {
  phase: 'string',
  code: 'string',
  layoutId: 'string',
  rounds: 'number',
  slots: { map: SlotState },
});
