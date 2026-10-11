import { CONTROL_HELP } from '../input/controller';
import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { btn, h } from './dom';

/** Anleitung: Ziel, Regeln, Steuerung (Tabelle aus der Eingabeschicht) */
export function create(app: App, params?: RouteParams): ScreenView {
  const rows = CONTROL_HELP.map((r) =>
    h(
      'tr',
      null,
      h('td', null, r.action),
      h('td', null, r.wasd),
      h('td', null, r.pfeile),
      h('td', null, r.gamepad),
      h('td', null, r.touch),
    ),
  );
  const el = h(
    'div',
    { class: 'screen' },
    h(
      'div',
      { class: 'panel wide' },
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('menu.help')),
        btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back'),
      ),
      h('h3', null, t('help.goal')),
      h('p', null, t('help.goalText')),
      h('h3', null, t('help.nitro')),
      h('p', null, t('help.nitroText')),
      h('h3', null, t('help.moves')),
      h('p', null, t('help.movesText')),
      h('h3', null, t('help.rules')),
      h('p', null, t('help.rulesText')),
      h('h3', null, t('help.controls')),
      h(
        'table',
        { class: 'table' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            h('th', null, t('help.action')),
            h('th', null, 'WASD'),
            h('th', null, t('help.arrows')),
            h('th', null, 'Gamepad'),
            h('th', null, 'Touch'),
          ),
        ),
        h('tbody', null, ...rows),
      ),
    ),
  );
  return { el };
}
