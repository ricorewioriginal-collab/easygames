import { CHARACTERS, type CharacterId } from '@shared/characters';
import type { Difficulty } from '@shared/core/types';
import type { LobbyView } from '../net/online';
import { PLAYER_SYMBOLS } from '../app/theme';
import { t } from '../i18n';
import { btn, clear, h, toast } from './dom';
import { characterPicker, layoutPicker } from './pickers';

export interface LobbyApi {
  setCharacter(c: CharacterId): void;
  ready(r: boolean): void;
  config(c: { layoutId?: string; rounds?: number }): void;
  addBot(d: Difficulty): void;
  remove(id: string): void;
  start(): void;
  leave(): void;
}

/** Die Lobby-Ansicht (Spielerliste, Figurenwahl, Brett, Start) – gleich für Server-Räume und für Räume ohne Server */
export class LobbyPanel {
  readonly el = h('div', { class: 'panel wide' });
  private picker: ReturnType<typeof layoutPicker> | null = null;

  constructor(
    private readonly api: LobbyApi,
    /** Zusätzliche Elemente unter der Kopfzeile (Raumcode, Einladungen …) */
    private readonly extra: () => Node[] = () => [],
    private readonly canAddMore: () => boolean = () => true,
  ) {}

  update(v: LobbyView): void {
    const api = this.api;
    const me = v.slots.find((s) => s.id === v.meId) ?? v.slots.find((s) => s.host && v.meId === '');
    const isHost = !!me?.host;
    clear(this.el);
    const slots = h('div', { class: 'plist' });
    v.slots.forEach((s, i) => {
      const cdef = CHARACTERS.find((c) => c.id === s.character);
      slots.appendChild(
        h(
          'div',
          { class: `prow pc${(i % 4) + 1}` },
          h('div', { class: 'sym' }, PLAYER_SYMBOLS[i % 4]),
          h(
            'div',
            { class: 'cfg' },
            h(
              'b',
              null,
              s.name,
              s.host ? ' 👑' : '',
              s.kind === 'bot' ? ` 🤖 (${t('diff.' + s.difficulty)})` : '',
              !s.connected ? ' ⚠' : '',
              s.id === me?.id ? ' ' + t('lobby.you') : '',
            ),
            h('small', null, cdef ? `${cdef.name} – ${cdef.species}` : s.character),
          ),
          isHost && !s.host
            ? btn('✕', () => api.remove(s.id), 'ghost', { 'aria-label': t('setup.remove') })
            : h(
                'span',
                { class: 'badge' },
                s.ready || s.host || s.kind === 'bot' ? t('lobby.ready') : t('lobby.waiting'),
              ),
        ),
      );
    });
    const taken = v.slots.filter((s) => s.id !== me?.id).map((s) => s.character);
    const chars = characterPicker(
      (me?.character ?? 'pip') as CharacterId,
      () => taken,
      (c) => api.setCharacter(c),
    );
    const everyoneReady = v.slots.every((s) => s.ready || s.host || s.kind === 'bot');
    const cfg = h('div');
    if (isHost) {
      this.picker ??= layoutPicker(v.layoutId, (id) => api.config({ layoutId: id }));
      this.picker.set(v.layoutId);
      cfg.append(
        this.picker.el,
        h('h3', null, t('setup.rounds')),
        h(
          'div',
          { class: 'stepper' },
          btn('−', () => api.config({ rounds: Math.max(3, v.rounds - 1) }), 'ghost', { 'aria-label': '−' }),
          h('b', null, String(v.rounds)),
          btn('+', () => api.config({ rounds: Math.min(30, v.rounds + 1) }), 'ghost', { 'aria-label': '+' }),
        ),
        h(
          'div',
          { class: 'chips', style: 'margin-top:8px' },
          ...(['easy', 'normal', 'hard'] as Difficulty[]).map((d) =>
            btn(`+ 🤖 ${t('diff.' + d)}`, () => api.addBot(d), 'ghost', {
              disabled: v.slots.length >= 4 || !this.canAddMore(),
            }),
          ),
        ),
      );
    } else cfg.append(h('p', null, t('lobby.hostConfig', { layout: v.layoutId, rounds: v.rounds })));
    this.el.append(
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('lobby.title')),
        btn('← ' + t('lobby.leave'), () => api.leave(), 'ghost back'),
      ),
      ...this.extra(),
      h(
        'div',
        { class: 'two' },
        h('div', null, h('h3', null, t('setup.players')), slots, h('h3', null, t('lobby.yourFigure')), chars),
        h('div', null, h('h3', null, t('setup.board')), cfg),
      ),
      h(
        'div',
        { class: 'foot' },
        isHost
          ? btn(t('lobby.start'), () => api.start(), 'hot big', {
              disabled: v.slots.length < 2 || !everyoneReady,
            })
          : btn(
              me?.ready ? t('lobby.notReady') : t('lobby.imReady'),
              () => api.ready(!me?.ready),
              me?.ready ? 'ghost' : 'good big',
            ),
      ),
      ...(isHost && !everyoneReady ? [h('p', null, t('lobby.waitAll'))] : []),
    );
  }
}

export function copyText(text: string): void {
  const done = (): void => toast(t('lobby.copied'), 'good');
  if (navigator.clipboard?.writeText)
    void navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => toast(t('lobby.copyFailed'), 'error'));
  else toast(t('lobby.copyFailed'), 'error');
}
