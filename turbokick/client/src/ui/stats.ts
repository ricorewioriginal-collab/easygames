import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { btn, h } from './dom';
import { fmtDuration } from './common';

/** Statistik (lokal gespeichert) */
export function create(app: App, params?: RouteParams): ScreenView {
  const st = app.store.data.stats;
  const rows: Array<[string, string]> = [
    [t('stats.matches'), String(st.matches)],
    [t('stats.wins'), String(st.wins)],
    [t('stats.winrate'), st.matches ? `${Math.round((st.wins / st.matches) * 100)} %` : '–'],
    [t('stats.goals'), String(st.goals)],
    [t('stats.assists'), String(st.assists)],

    [t('stats.demos'), String(st.demos)],
    [t('stats.streak'), `${st.streak} (${t('stats.best')} ${st.bestStreak})`],
    [t('stats.online'), String(st.onlineMatches)],
    [t('stats.time'), fmtDuration(st.playSeconds)],
  ];
  const el = h(
    'div',
    { class: 'screen' },
    h('div', { class: 'panel' }, h('div', { class: 'head' }, h('h2', null, t('menu.stats')), btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back')), h('table', { class: 'table' }, h('tbody', null, ...rows.map(([a, b]) => h('tr', null, h('td', null, a), h('td', null, b))))), h('p', null, t('stats.note'))),
  );
  return { el };
}
