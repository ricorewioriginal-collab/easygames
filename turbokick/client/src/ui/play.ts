import type { Difficulty } from '@shared/net/p2p';
import { Rng } from '@shared/rng';
import type { App, RouteParams, ScreenView } from '../app/app';
import type { ArenaChoice } from '../app/save';
import { LocalMatch } from '../game/session';
import { buildLocalPlan, pickArena, type PlayMode } from '../game/plan';
import { t } from '../i18n';
import { btn, h } from './dom';

/** Spiel einrichten: Modus, Teamgröße, Bot-Stufe, Dauer, Arena */
export function create(app: App, params?: RouteParams): ScreenView {
  const save = app.store.data;
  let mode: PlayMode = 'quick';
  let teamSize = save.lastSetup.teamSize;
  let difficulty: Difficulty = save.lastSetup.difficulty;
  let minutes = save.lastSetup.minutes;
  let arena: ArenaChoice = save.lastSetup.arena;
  let nitro = save.lastSetup.nitro;
  let splitVersus = true;
  const body = h('div');

  const chips = <T>(items: Array<[T, string]>, cur: T, on: (v: T) => void, cls = ''): HTMLElement =>
    h(
      'div',
      { class: 'chips' },
      ...items.map(([v, label]) =>
        h(
          'button',
          {
            type: 'button',
            class: `chip ${cls}${v === cur ? ' on' : ''}`,
            'aria-pressed': String(v === cur),
            onclick: () => {
              on(v);
              render();
            },
          },
          label,
        ),
      ),
    );

  const render = (): void => {
    body.textContent = '';
    body.append(
      h('h3', null, t('play.mode')),
      chips<PlayMode>(
        [
          ['quick', t('play.quick')],
          ['split', t('play.split')],
          ['training', t('play.training')],
        ],
        mode,
        (v) => (mode = v),
      ),
      h('p', null, t('play.modeHelp.' + mode)),
      ...(mode !== 'training'
        ? [
            h('h3', null, t('play.teamSize')),
            chips<1 | 2 | 3>(
              [
                [1, '1 vs 1'],
                [2, '2 vs 2'],
                [3, '3 vs 3'],
              ],
              teamSize,
              (v) => (teamSize = v),
            ),
            h('h3', null, t('play.duration')),
            chips<number>(
              [
                [1, '1 min'],
                [3, '3 min'],
                [5, '5 min'],
                [10, '10 min'],
              ],
              minutes,
              (v) => (minutes = v),
            ),
          ]
        : []),
      ...(mode === 'split'
        ? [
            h('h3', null, t('play.splitMode')),
            chips<boolean>(
              [
                [true, t('play.versus')],
                [false, t('play.together')],
              ],
              splitVersus,
              (v) => (splitVersus = v),
            ),
          ]
        : []),
      ...(mode !== 'training' && !(mode === 'split' && splitVersus && teamSize === 1)
        ? [
            h('h3', null, t('play.bots')),
            chips<Difficulty>(
              [
                ['easy', t('diff.easy')],
                ['normal', t('diff.normal')],
                ['hard', t('diff.hard')],
                ['pro', t('diff.pro')],
              ],
              difficulty,
              (v) => (difficulty = v),
            ),
          ]
        : []),
      h('h3', null, t('play.arena')),
      chips<ArenaChoice>(
        [
          ['zufall', t('arena.random')],
          ['neon', t('arena.neon')],
          ['eis', t('arena.eis')],
          ['canyon', t('arena.canyon')],
        ],
        arena,
        (v) => (arena = v),
      ),
      h('h3', null, t('play.options')),
      chips<boolean>(
        [
          [true, t('play.nitroOn')],
          [false, t('play.nitroOff')],
        ],
        nitro,
        (v) => (nitro = v),
      ),
    );
  };
  render();

  const start = (): void => {
    const rng = new Rng((Math.random() * 2 ** 32) >>> 0);
    app.store.update((d) => {
      d.lastSetup = { teamSize, difficulty, minutes, arena, nitro };
    });
    const plan = buildLocalPlan({
      mode,
      teamSize,
      difficulty,
      minutes,
      arena: pickArena(arena, rng),
      nitro,
      splitVersus,
      name: save.profile.name,
      garage: save.garage,
      seed: rng.int(2 ** 31),
    });
    void app.startMatch(new LocalMatch(plan));
  };

  const el = h(
    'div',
    { class: 'screen' },
    h(
      'div',
      { class: 'panel wide' },
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('menu.play')),
        btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back'),
      ),
      body,
      h('div', { class: 'foot' }, btn(t('play.start'), start, 'big')),
    ),
  );
  return { el };
}
