// Element types. Version 2 adds Eis and Erde (see docs/MIGRATION.md).
export const TYPES = {
  normal:  { name: 'Normal',  icon: '⭐', color: '#c7b98f' },
  feuer:   { name: 'Feuer',   icon: '🔥', color: '#f07a3e' },
  wasser:  { name: 'Wasser',  icon: '💧', color: '#4d9ef0' },
  pflanze: { name: 'Pflanze', icon: '🌱', color: '#4fb86a' },
  elektro: { name: 'Elektro', icon: '⚡', color: '#f2c935' },
  gestein: { name: 'Gestein', icon: '🪨', color: '#a39c86' },
  flug:    { name: 'Flug',    icon: '🪽', color: '#8fb7e8' },
  geist:   { name: 'Geist',   icon: '👻', color: '#8c72c9' },
  eis:     { name: 'Eis',     icon: '❄️', color: '#7fd6e8' },
  erde:    { name: 'Erde',    icon: '⛰️', color: '#b9874c' }
};

export const TYPE_IDS = Object.keys(TYPES);

// Attacking type -> defending type -> multiplier (missing = 1).
export const CHART = {
  normal:  { gestein: 0.5, geist: 0 },
  feuer:   { pflanze: 2, eis: 2, wasser: 0.5, gestein: 0.5, feuer: 0.5 },
  wasser:  { feuer: 2, gestein: 2, erde: 2, pflanze: 0.5, wasser: 0.5 },
  pflanze: { wasser: 2, gestein: 2, erde: 2, feuer: 0.5, flug: 0.5, pflanze: 0.5 },
  elektro: { wasser: 2, flug: 2, pflanze: 0.5, elektro: 0.5, erde: 0 },
  gestein: { feuer: 2, flug: 2, eis: 2, erde: 0.5 },
  flug:    { pflanze: 2, gestein: 0.5, elektro: 0.5 },
  geist:   { geist: 2, normal: 0 },
  eis:     { pflanze: 2, flug: 2, erde: 2, feuer: 0.5, wasser: 0.5, eis: 0.5 },
  erde:    { feuer: 2, elektro: 2, gestein: 2, pflanze: 0.5, flug: 0 }
};

export function effectiveness(attackType, defender) {
  const row = CHART[attackType] || {};
  let mul = row[defender.type] ?? 1;
  if (defender.type2) mul *= row[defender.type2] ?? 1;
  return mul;
}

export function typeLabel(t) {
  const d = TYPES[t];
  return d ? d.icon + ' ' + d.name : t;
}
