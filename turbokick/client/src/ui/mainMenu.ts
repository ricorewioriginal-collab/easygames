import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { h } from './dom';
import { hintBar } from './hints';
import { Showroom } from './showroom';
import type { CarBody, CarDecal } from '../render/actors';

let room: Showroom | null = null;

export function showroomFor(app: App): Showroom {
  const g = app.store.data.garage;
  const look = {
    body: g.body as CarBody,
    decal: g.decal as CarDecal,
    ...(g.accent ? { accent: parseInt(g.accent.slice(1), 16) } : {}),
  };
  if (!room) room = new Showroom(look, 0, app.store.data.settings.reducedMotion);
  else room.setLook(look, 0);
  return room;
}

/** Kleine Linien-Symbole für die Kacheln (feste Zeichenketten, kein Fremdinhalt) */
const ICONS: Record<string, string> = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  online:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/></svg>',
  garage:
    '<svg viewBox="0 0 24 24"><path d="M3 15.5l2-5.2c.4-1 1.3-1.6 2.3-1.6h9.4c1 0 1.9.6 2.3 1.6l2 5.2v3H3z"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M5 20V11M12 20V5M19 20v-6"/></svg>',
  help: '<svg viewBox="0 0 24 24"><path d="M5 4.5h9a5 5 0 015 5v10H10a5 5 0 01-5-5z"/><path d="M9 9.5h6M9 13h4"/></svg>',
  options:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  credits: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>',
};
const icon = (k: string): HTMLElement => {
  const s = h('span', { class: 'ico', 'aria-hidden': 'true' });
  // Online-Kachel trägt das 🌐 (easygames-Regel: Online im Hauptmenü mit 🌐 kennzeichnen)
  if (k === 'online') s.textContent = '🌐';
  else s.innerHTML = ICONS[k] ?? '';
  return s;
};

/** Hauptmenü im Konsolen-Stil: Statusleiste, Wortmarke, große Kacheln, Schnellzugriffe, Knopf-Hinweise */
export function create(app: App, _params?: RouteParams): ScreenView {
  const r = showroomFor(app);
  r.setShift(window.innerWidth > 900 ? 2.9 : 0);
  app.engine.setScreen(r);
  app.engine.start();
  app.audio.music('menu');
  const data = app.store.data;
  const name = data.profile.name || 'Fahrer';
  const clock = h('span', { class: 'clock' });
  const tick = (): void => {
    const d = new Date();
    clock.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  tick();
  const timer = setInterval(tick, 15000);
  const hints = hintBar([
    [0, 'Enter', t('hint.select')],
    [1, 'Esc', t('hint.back')],
    [9, 'P', t('hint.pause')],
  ]);

  const tile = (
    key: string,
    title: string,
    sub: string,
    go: () => void,
    cls: string,
    first = false,
  ): HTMLButtonElement =>
    h(
      'button',
      {
        type: 'button',
        class: 'tile ' + cls + (first ? ' primary' : ''),
        onclick: () => go(),
        ...(first ? { 'data-pad-first': '1' } : {}),
      },
      icon(key),
      h('span', { class: 'tt' }, title),
      h('span', { class: 'ts' }, sub),
    );
  const quick = (key: string, label: string, go: () => void): HTMLButtonElement =>
    h('button', { type: 'button', class: 'qbtn', onclick: () => go(), 'aria-label': label }, icon(key), h('span', null, label));

  const el = h(
    'div',
    { class: 'screen hub' },
    h(
      'div',
      { class: 'topbar' },
      h(
        'div',
        { class: 'who' },
        h('span', { class: 'avatar' }, name.slice(0, 1).toUpperCase()),
        h('span', { class: 'nm' }, name, h('small', null, t('hub.record', { wins: data.stats.wins, matches: data.stats.matches }))),
      ),
      h('span', { class: 'news' }, h('b', null, t('hub.new')), t('hub.newText')),
      clock,
    ),
    h(
      'div',
      { class: 'hub-main' },
      h(
        'div',
        { class: 'logo' },
        h('div', { class: 'wordmark', 'aria-label': 'NEXORB' }, 'NEX', h('span', { class: 'orb' }), h('em', null, 'RB')),
        h('div', { class: 'sub' }, t('menu.tagline')),
      ),
      h(
        'div',
        { class: 'menu tiles' },
        tile('play', t('menu.play'), t('hub.playSub'), () => void app.go('play'), 'gold', true),
        tile('online', t('menu.online'), t('hub.onlineSub'), () => void app.go('p2p'), 'violet'),
        tile('garage', t('menu.garage'), t('hub.garageSub'), () => void app.go('garage'), 'lime'),
      ),
      h(
        'div',
        { class: 'quick' },
        quick('stats', t('menu.stats'), () => void app.go('stats')),
        quick('help', t('menu.help'), () => void app.go('help')),
        quick('options', t('menu.options'), () => void app.go('options')),
        quick('credits', t('menu.credits'), () => void app.go('credits')),
      ),
    ),
    hints.el,
  );
  return {
    el,
    dispose: () => {
      clearInterval(timer);
      hints.dispose();
    },
  };
}
