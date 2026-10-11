import { CHARACTER_IDS, type CharacterId } from '@shared/characters';
import { cleanName } from '@shared/net/protocol';
import { getLayout } from '@shared/levels';
import type { Difficulty, GameConfig, PlayerSetup } from '@shared/core/types';
import type { App, RouteParams, ScreenView } from '../app/app';
import { LocalSession } from '../net/session';
import { PLAYER_SYMBOLS } from '../app/theme';
import { t } from '../i18n';
import { btn, h, toast } from './dom';
import { characterPicker, layoutPicker } from './pickers';

type Kind = 'human' | Difficulty;
interface Row {
  kind: Kind;
  name: string;
  character: CharacterId;
}

const BOT_NAMES = ['Funki', 'Glimmo', 'Zeitfuchs', 'Raumkater'];

/** Spiel einrichten: Spieler (Menschen/Bots), Brett, Runden – für „Gegen Bots" und Hot-Seat auf einem Gerät */
export function create(app: App, params?: RouteParams): ScreenView {
  const save = app.store.data;
  const mode = params?.mode ?? 'bots';
  const prof = save.profile;
  const rows: Row[] = [{ kind: 'human', name: prof.name, character: prof.character }];
  const free = (): CharacterId => CHARACTER_IDS.find((c) => !rows.some((r) => r.character === c)) ?? 'pip';
  if (mode === 'hotseat') {
    rows.push({ kind: 'human', name: 'Spieler 2', character: free() });
    rows.push({
      kind: save.lastSetup.bots > 0 ? save.lastSetup.difficulty : 'human',
      name: '',
      character: free(),
    });
  } else {
    for (let i = 0; i < Math.max(1, save.lastSetup.bots); i++)
      rows.push({ kind: save.lastSetup.difficulty, name: '', character: free() });
  }
  let layoutId = save.lastSetup.layoutId;
  let rounds = save.lastSetup.rounds;
  const list = h('div', { class: 'plist' });
  const roundsOut = h('b', null, String(rounds));
  const err = h('div', { class: 'err', 'aria-live': 'polite' });
  const picker = layoutPicker(layoutId, (id) => {
    layoutId = id;
    rounds = getLayout(id).recommendedRounds;
    roundsOut.textContent = String(rounds);
  });

  const botName = (i: number): string => BOT_NAMES[i % BOT_NAMES.length] ?? 'Bot';
  const renderRows = (): void => {
    list.textContent = '';
    rows.forEach((r, i) => {
      const kindSel = h(
        'select',
        {
          'aria-label': t('setup.kind'),
          onchange: () => {
            r.kind = kindSel.value as Kind;
            renderRows();
          },
        },
        ...(['human', 'easy', 'normal', 'hard'] as Kind[]).map((k) => {
          const o = h(
            'option',
            { value: k },
            k === 'human' ? t('setup.human') : t('setup.bot', { level: t('diff.' + k) }),
          );
          if (k === r.kind) o.selected = true;
          return o;
        }),
      );
      const name = h('input', {
        class: 'field',
        value: r.kind === 'human' ? r.name : botName(i),
        maxlength: 14,
        'aria-label': t('setup.name'),
        disabled: r.kind !== 'human',
        oninput: () => (r.name = name.value),
      });
      const chars = characterPicker(
        r.character,
        () => rows.filter((_, j) => j !== i).map((x) => x.character),
        (c) => {
          r.character = c;
          renderRows();
        },
      );
      list.appendChild(
        h(
          'div',
          { class: `prow pc${(i % 4) + 1}` },
          h('div', { class: 'sym' }, PLAYER_SYMBOLS[i % 4]),
          h('div', { class: 'cfg' }, h('div', { class: 'top' }, name, kindSel), chars),
          rows.length > 2
            ? btn(
                '✕',
                () => {
                  rows.splice(i, 1);
                  renderRows();
                },
                'ghost',
                { 'aria-label': t('setup.remove') },
              )
            : h('span'),
        ),
      );
    });
    if (rows.length < 4)
      list.appendChild(
        btn(
          t('setup.add'),
          () => {
            rows.push({ kind: save.lastSetup.difficulty, name: '', character: free() });
            renderRows();
          },
          'ghost',
        ),
      );
  };
  renderRows();

  const start = (): void => {
    err.textContent = '';
    const players: PlayerSetup[] = rows.map((r, i) => {
      const human = r.kind === 'human';
      const nm = human ? cleanName(r.name) || `Spieler ${i + 1}` : botName(i);
      return {
        id: 'p' + (i + 1),
        name: nm,
        character: r.character,
        kind: human ? 'human' : 'bot',
        ...(human ? {} : { difficulty: r.kind as Difficulty }),
      };
    });
    if (!players.some((p) => p.kind === 'human')) {
      err.textContent = t('setup.needHuman');
      return;
    }
    const names = players.map((p) => p.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      err.textContent = t('setup.uniqueNames');
      return;
    }
    const config: GameConfig = { layoutId, rounds, players };
    try {
      const session = new LocalSession(config);
      const bots = rows.filter((r) => r.kind !== 'human');
      app.store.update((d) => {
        d.lastSetup = {
          layoutId,
          rounds,
          bots: bots.length,
          difficulty: (bots[0]?.kind as Difficulty) ?? d.lastSetup.difficulty,
        };
        if (mode === 'bots') {
          d.profile.name = players[0]!.name;
          d.profile.character = players[0]!.character;
        }
      });
      void app.startGame(session);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
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
        h('h2', null, mode === 'bots' ? t('menu.bots') : t('menu.hotseat')),
        btn('← ' + t('back'), () => void app.go('menu'), 'ghost back'),
      ),
      h(
        'div',
        { class: 'two' },
        h('div', null, h('h3', null, t('setup.players')), list),
        h(
          'div',
          null,
          h('h3', null, t('setup.board')),
          picker.el,
          h('h3', null, t('setup.rounds')),
          h(
            'div',
            { class: 'stepper' },
            btn(
              '−',
              () => {
                rounds = Math.max(3, rounds - 1);
                roundsOut.textContent = String(rounds);
              },
              'ghost',
              { 'aria-label': '−' },
            ),
            roundsOut,
            btn(
              '+',
              () => {
                rounds = Math.min(30, rounds + 1);
                roundsOut.textContent = String(rounds);
              },
              'ghost',
              { 'aria-label': '+' },
            ),
          ),
        ),
      ),
      err,
      h('div', { class: 'foot' }, btn(t('setup.start'), start, 'hot big')),
    ),
  );
  return { el };
}
