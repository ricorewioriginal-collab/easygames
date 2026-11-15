import { CONTROL_HELP, padHelpText } from '../input/controller';
import { GLYPH_COLORS, currentPadKind, type PadKind } from '../input/gamepad';
import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { btn, h } from './dom';

const KIND_NAME: Record<PadKind, string> = { xbox: 'Xbox', ps: 'PlayStation', switch: 'Nintendo Switch' };

/** Anleitung: Ziel, Regeln, Steuerung (Tabelle aus der Eingabeschicht) */
export function create(app: App, params?: RouteParams): ScreenView {
  const preset = app.store.data.settings.padPreset;
  let kind: PadKind = currentPadKind();
  const tbody = h('tbody');
  const padHead = h('th', null, 'Controller');
  const fill = (): void => {
    tbody.textContent = '';
    padHead.textContent = KIND_NAME[kind];
    for (const r of CONTROL_HELP)
      tbody.append(
        h(
          'tr',
          null,
          h('td', null, r.action),
          h('td', null, r.wasd),
          h('td', null, r.pfeile),
          h('td', { class: 'padcell k-' + kind }, padHelpText(r.pad, preset, kind)),
          h('td', null, r.touch),
        ),
      );
  };
  const chips = h('div', { class: 'chips' });
  const chipBtns = (Object.keys(KIND_NAME) as PadKind[]).map((k) => {
    const b = h(
      'button',
      {
        type: 'button',
        class: 'chip' + (k === kind ? ' on' : ''),
        onclick: () => {
          kind = k;
          chipBtns.forEach((x, i) =>
            x.classList.toggle('on', (Object.keys(KIND_NAME) as PadKind[])[i] === k),
          );
          fill();
        },
      },
      KIND_NAME[k],
    );
    b.style.borderColor = GLYPH_COLORS[k][0] ?? '';
    return b;
  });
  chips.append(...chipBtns);
  fill();
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
      h('p', { class: 'mut' }, t('help.padIntro')),
      chips,
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
            padHead,
            h('th', null, 'Touch'),
          ),
        ),
        tbody,
      ),
    ),
  );
  return { el };
}
