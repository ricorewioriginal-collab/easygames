import type { ObjectDef } from './types';

// Objekte, die nur das Spiel selbst erzeugt (nicht im Kaufkatalog).
export const PROPS: ObjectDef[] = [
  {
    id: 'prop-meal', name: 'Mahlzeit', desc: 'Frisch gekochtes Essen. Reicht für mehrere Portionen.', cat: 'kitchen', price: 0, w: 1, d: 1, h: 0.12, mount: 'surface', hidden: true,
    parts: [
      { s: 'cyl', p: [0, 0.015, 0], d: [0.42, 0.03, 0.42], c: '#f4f1ea' },
      { s: 'sph', p: [0, 0.06, 0], d: [0.3, 0.1, 0.3], c: '#d7843f' },
      { s: 'sph', p: [0.07, 0.08, 0.04], d: [0.08, 0.06, 0.08], c: '#6aa84f' },
    ],
  },
  {
    id: 'prop-dirty', name: 'Schmutziges Geschirr', desc: 'Möchte gespült werden.', cat: 'kitchen', price: 0, w: 1, d: 1, h: 0.1, mount: 'surface', hidden: true,
    parts: [
      { s: 'cyl', p: [0, 0.015, 0], d: [0.38, 0.03, 0.38], c: '#e8e2d6' },
      { s: 'cyl', p: [0.02, 0.045, 0.01], d: [0.34, 0.03, 0.34], c: '#d9d1c2' },
      { s: 'sph', p: [-0.05, 0.07, 0], d: [0.1, 0.03, 0.08], c: '#8a6b4a' },
    ],
  },
  {
    id: 'prop-puddle', name: 'Pfütze', desc: 'Huch! Sollte jemand wegwischen.', cat: 'deco', price: 0, w: 1, d: 1, h: 0.01, hidden: true,
    parts: [{ s: 'cyl', p: [0, 0.005, 0], d: [0.8, 0.01, 0.6], c: '#9fc9df' }],
  },
  {
    id: 'prop-trash', name: 'Müllhaufen', desc: 'Unordnung, die weggeräumt werden möchte.', cat: 'deco', price: 0, w: 1, d: 1, h: 0.2, hidden: true,
    parts: [
      { s: 'sph', p: [0, 0.08, 0], d: [0.5, 0.18, 0.4], c: '#7b7466' },
      { s: 'box', p: [0.12, 0.12, 0.05], d: [0.15, 0.1, 0.12], r: [0, 30, 0], c: '#c9b38a' },
    ],
  },
];
