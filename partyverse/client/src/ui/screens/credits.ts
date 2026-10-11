import { h } from '../dom';
import type { App, RouteParams, ScreenView } from '../../app/app';
import { header, section } from './common';

// Verifiziert aus package.json und den package.json-Dateien in node_modules (siehe auch THIRD_PARTY.md)
export const LIBRARIES: ReadonlyArray<{ name: string; version: string; license: string; use: string }> = [
  { name: 'three', version: '0.170.0', license: 'MIT', use: '3D-Darstellung' },
  { name: 'colyseus', version: '0.15.57', license: 'MIT', use: 'Spielserver (Online-Modus)' },
  { name: 'colyseus.js', version: '0.15.28', license: 'MIT', use: 'Client für den Online-Modus' },
  { name: '@colyseus/schema', version: '2.0.37', license: 'MIT', use: 'Zustandssynchronisierung' },
  { name: '@colyseus/ws-transport', version: '0.15.3', license: 'MIT', use: 'WebSocket-Transport des Servers' },
  { name: 'express', version: '4.21.2', license: 'MIT', use: 'HTTP-Server' },
  { name: 'vite', version: '5.4.21', license: 'MIT', use: 'Entwicklung und Build' },
  { name: 'typescript', version: '5.6.3', license: 'Apache-2.0', use: 'Programmiersprache und Typprüfung' },
  { name: 'vitest', version: '2.1.9', license: 'MIT', use: 'Tests' },
];

export function create(app: App, params?: RouteParams): ScreenView {
  const rows = LIBRARIES.map((l) => h('tr', null, h('td', null, l.name), h('td', null, l.version), h('td', null, l.license), h('td', null, l.use)));
  const el = h(
    'div',
    { class: 'screen sc' },
    h(
      'div',
      { class: 'panel' },
      header(app, params, 'Credits & Lizenzen'),
      h('h1', null, 'PARTYVERSE'),
      h('p', null, 'Ein 3D-Partyspiel für zwei bis vier Spieler: am selben Gerät, gegen Bots oder online.'),
      section(
        'Alles selbst gemacht',
        h('p', null, 'Eigene Figuren, eigene Welten, eigene Musik und eigene Klänge (prozedural im Browser erzeugt). Es werden keine fremden Assets verwendet.'),
      ),
      section(
        'Verwendete Bibliotheken',
        h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', null, 'Paket'), h('th', null, 'Version'), h('th', null, 'Lizenz'), h('th', null, 'Zweck'))), h('tbody', null, ...rows)),
        h('p', { class: 'hint' }, 'Alle Bibliotheken sind freie Software. Die vollständige Liste steht auch in THIRD_PARTY.md.'),
      ),
      section('Hinweis', h('p', null, 'Kein Nintendo-Material. PARTYVERSE ist ein unabhängiges Spiel und nicht mit Nintendo verbunden.')),
    ),
  );
  return { el };
}
