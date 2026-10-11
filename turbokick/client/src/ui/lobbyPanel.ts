import type { Difficulty } from '@shared/net/p2p';
import type { TeamId } from '@shared/sim/types';
import type { LobbyView } from '../net/p2pRoom';
import { TEAM_NAMES, TEAM_SYMBOL } from '../app/theme';
import { t } from '../i18n';
import { btn, clear, h, toast } from './dom';

export interface LobbyApi {
  setTeam(id: string, team: TeamId): void;
  ready(r: boolean): void;
  config(c: { teamSize?: 1 | 2 | 3; minutes?: number; arena?: string }): void;
  addBot(team: TeamId, d: Difficulty): void;
  remove(id: string): void;
  start(): void;
  leave(): void;
}

/** Lobby: zwei Teamspalten, Mitspieler/Bots, Einstellungen (Gastgeber), Bereit/Start */
export class LobbyPanel {
  readonly el = h('div', { class: 'panel wide' });
  constructor(
    private readonly api: LobbyApi,
    private readonly extra: () => Node[] = () => [],
    private readonly canAddMore: () => boolean = () => true,
  ) {}

  update(v: LobbyView): void {
    const api = this.api;
    const me = v.slots.find((s) => s.id === v.meId);
    const isHost = !!me?.host;
    clear(this.el);
    const col = (team: TeamId): HTMLElement => {
      const members = v.slots.filter((s) => s.team === team);
      return h(
        'div',
        { class: `card team t${team}` },
        h('h3', { class: 'head-font', style: `color:var(--${team === 0 ? 'fire' : 'ice'})` }, `${TEAM_SYMBOL[team]} ${TEAM_NAMES[team]} (${members.length})`),
        ...members.map((s) =>
          h(
            'div',
            { class: 'row' },
            h('span', { class: 'lbl' }, s.name, s.host ? ' 👑' : '', s.kind === 'bot' ? ` 🤖 ${t('diff.' + s.difficulty)}` : '', s.id === me?.id ? ' ' + t('lobby.you') : '', h('small', null, s.look.body)),
            h('span', { class: 'badge' }, s.ready || s.kind === 'bot' ? t('lobby.ready') : t('lobby.waiting')),
            (isHost || s.id === me?.id) && v.slots.filter((x) => x.team !== team).length < 6 ? btn('⇄', () => api.setTeam(s.id, team === 0 ? 1 : 0), 'ghost', { 'aria-label': t('lobby.switch') }) : null,
            isHost && !s.host ? btn('✕', () => api.remove(s.id), 'ghost', { 'aria-label': t('lobby.remove') }) : null,
          ),
        ),
        isHost ? h('div', { class: 'chips', style: 'margin-top:8px' }, ...(['easy', 'normal', 'hard', 'pro'] as Difficulty[]).map((d) => btn(`+🤖 ${t('diff.' + d)}`, () => api.addBot(team, d), 'ghost', { disabled: members.length >= 3 || v.slots.length >= 6 || !this.canAddMore() }))) : null,
      );
    };
    const cfg = isHost
      ? h(
          'div',
          null,
          h('h3', null, t('play.teamSize')),
          h('div', { class: 'chips' }, ...([1, 2, 3] as const).map((n) => h('button', { type: 'button', class: 'chip' + (v.teamSize === n ? ' on' : ''), onclick: () => api.config({ teamSize: n }) }, `${n} vs ${n}`))),
          h('h3', null, t('play.duration')),
          h('div', { class: 'chips' }, ...[1, 3, 5, 10].map((m) => h('button', { type: 'button', class: 'chip' + (v.minutes === m ? ' on' : ''), onclick: () => api.config({ minutes: m }) }, `${m} min`))),
          h('h3', null, t('play.arena')),
          h('div', { class: 'chips' }, ...(['neon', 'eis', 'canyon'] as const).map((a) => h('button', { type: 'button', class: 'chip' + (v.arena === a ? ' on' : ''), onclick: () => api.config({ arena: a }) }, t('arena.' + a)))),
          h('p', null, t('lobby.fillBots')),
        )
      : h('p', null, t('lobby.hostConfig', { size: v.teamSize, minutes: v.minutes, arena: t('arena.' + v.arena) }));
    const everyoneReady = v.slots.every((s) => s.ready || s.host || s.kind === 'bot');
    this.el.append(
      h('div', { class: 'head' }, h('h2', null, t('lobby.title')), btn('← ' + t('lobby.leave'), () => api.leave(), 'ghost back')),
      ...this.extra(),
      h('div', { class: 'two' }, col(0), col(1)),
      cfg,
      h('div', { class: 'foot' }, isHost ? btn(t('lobby.start'), () => api.start(), 'big', { disabled: !everyoneReady }) : btn(me?.ready ? t('lobby.notReady') : t('lobby.imReady'), () => api.ready(!me?.ready), me?.ready ? 'ghost' : 'big')),
      ...(isHost && !everyoneReady ? [h('p', null, t('lobby.waitAll'))] : []),
    );
  }
}

export function copyText(text: string): void {
  const done = (): void => toast(t('lobby.copied'), 'good');
  if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(text).then(done).catch(() => toast(t('lobby.copyFailed'), 'error'));
  else toast(t('lobby.copyFailed'), 'error');
}
