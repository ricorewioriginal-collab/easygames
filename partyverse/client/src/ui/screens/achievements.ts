import { h } from '../dom';
import type { App, RouteParams, ScreenView } from '../../app/app';
import { ACHIEVEMENTS } from '../../app/achievements';
import { WORLD_IDS } from '@shared/levels/types';
import { fmtInt, fmtTime, header, section } from './common';

const WORLD_NAMES: Record<string, string> = {
  prismara: 'Prismara',
  'nova-nexus': 'Nova Nexus',
  wurzelwild: 'Wurzelwild',
  'paradox-city': 'Paradox City',
  'infinity-carnival': 'Infinity Carnival',
};

export function create(app: App, params?: RouteParams): ScreenView {
  const d = app.store.data;
  const st = d.stats;
  const unlockedCount = ACHIEVEMENTS.filter((a) => typeof d.achievements[a.id] === 'number').length;

  const cards = ACHIEVEMENTS.map((a) => {
    const stamp = d.achievements[a.id];
    const done = typeof stamp === 'number';
    const prog = done ? a.goal : Math.min(a.goal, a.progress(st));
    const pct = a.goal > 0 ? Math.round((prog / a.goal) * 100) : 0;
    const rewards: string[] = [];
    if (a.unlocks?.hat) rewards.push('Hut');
    if (a.unlocks?.trail) rewards.push('Spur');
    if (a.unlocks?.dice) rewards.push('Würfel-Skin');
    const bar = h('div', { class: 'bar', role: 'progressbar', 'aria-label': a.name }, h('i', { style: `width:${pct}%` }));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(a.goal));
    bar.setAttribute('aria-valuenow', String(Math.floor(prog)));
    return h(
      'div',
      { class: 'card ' + (done ? 'done' : 'locked') },
      h('h4', null, (done ? '🏆 ' : '🔒 ') + a.name),
      h('p', null, a.description),
      bar,
      h(
        'p',
        { class: 'hint' },
        done ? `Freigeschaltet am ${new Date(stamp as number).toLocaleDateString('de-DE')}` : a.goal > 1 ? `${fmtInt(prog)} / ${fmtInt(a.goal)}` : 'Noch nicht geschafft',
        rewards.length ? ` · Belohnung: ${rewards.join(', ')}` : '',
      ),
    );
  });

  const stat = (label: string, value: string): HTMLElement => h('div', { class: 'stat' }, h('span', null, label), h('b', null, value));
  const worlds = [...WORLD_IDS.map((w) => w as string), ...Object.keys(st.perWorld).filter((k) => !(WORLD_IDS as readonly string[]).includes(k))];

  const el = h(
    'div',
    { class: 'screen sc' },
    h(
      'div',
      { class: 'panel wide' },
      header(app, params, 'Erfolge & Statistik'),
      section(
        'Statistik',
        stat('Gespielte Partien', fmtInt(st.games)),
        stat('Siege', fmtInt(st.wins)),
        stat('Minispiele gespielt', fmtInt(st.minigamesPlayed)),
        stat('Minispiele gewonnen', fmtInt(st.minigamesWon)),
        stat('Glimmer gesammelt', fmtInt(st.coinsEarned)),
        stat('Felder gelaufen', fmtInt(st.steps)),
        stat('Online-Partien', fmtInt(st.onlineGames)),
        stat('Spielzeit', fmtTime(st.playSeconds)),
        h('h3', null, 'Partien pro Welt'),
        ...worlds.map((w) => stat(WORLD_NAMES[w] ?? w, fmtInt(st.perWorld[w] ?? 0))),
      ),
      section(`Erfolge (${unlockedCount} von ${ACHIEVEMENTS.length})`, h('div', { class: 'cols' }, ...cards)),
    ),
  );
  return { el };
}
