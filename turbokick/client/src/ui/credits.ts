import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { btn, h } from './dom';

const LIBS: Array<[string, string, string, string]> = [
  ['three', '0.170.0', 'MIT', '3D-Grafik'],
  ['qrcode-generator', '1.4.4', 'MIT', 'QR-Codes zeichnen'],
  ['jsqr', '1.4.0', 'Apache-2.0', 'QR-Codes per Kamera lesen'],
  ['vite', '5.4.21', 'MIT', 'Entwicklung und Build'],
  ['typescript', '5.6.3', 'Apache-2.0', 'Programmiersprache'],
  ['vitest', '2.1.9', 'MIT', 'Tests'],
];

/** Credits und Lizenzen */
export function create(app: App, params?: RouteParams): ScreenView {
  const el = h(
    'div',
    { class: 'screen' },
    h(
      'div',
      { class: 'panel' },
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('menu.credits')),
        btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back'),
      ),
      h('p', null, t('credits.own')),
      h(
        'table',
        { class: 'table' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            h('th', null, t('credits.lib')),
            h('th', null, t('credits.version')),
            h('th', null, t('credits.license')),
            h('th', null, t('credits.use')),
          ),
        ),
        h('tbody', null, ...LIBS.map((l) => h('tr', null, ...l.map((c) => h('td', null, c))))),
      ),
      h('p', null, t('credits.note')),
    ),
  );
  return { el };
}
