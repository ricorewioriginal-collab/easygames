import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { btn, h } from './dom';
import { Showroom } from './showroom';
import type { CarBody, CarDecal } from '../render/actors';

let room: Showroom | null = null;

export function showroomFor(app: App): Showroom {
  const g = app.store.data.garage;
  const look = { body: g.body as CarBody, decal: g.decal as CarDecal, ...(g.accent ? { accent: parseInt(g.accent.slice(1), 16) } : {}) };
  if (!room) room = new Showroom(look, 0, app.store.data.settings.reducedMotion);
  else room.setLook(look, 0);
  return room;
}

/** Hauptmenü: Wortmarke, Schaukasten mit dem eigenen Auto */
export function create(app: App, _params?: RouteParams): ScreenView {
  const r = showroomFor(app);
  r.setShift(window.innerWidth > 900 ? 4.4 : 0);
  app.engine.setScreen(r);
  app.engine.start();
  app.audio.music('menu');
  const el = h(
    'div',
    { class: 'screen side' },
    h('div', { class: 'logo' }, h('div', { class: 'wordmark' }, 'TURBO', h('em', null, 'KICK')), h('div', { class: 'sub' }, t('menu.tagline'))),
    h(
      'div',
      { class: 'menu' },
      btn(t('menu.play'), () => void app.go('play'), 'big'),
      btn(t('menu.online'), () => void app.go('p2p'), 'ice'),
      btn(t('menu.garage'), () => void app.go('garage'), 'fire'),
      h('div', { class: 'menu-foot' }, btn(t('menu.stats'), () => void app.go('stats'), 'ghost'), btn(t('menu.help'), () => void app.go('help'), 'ghost'), btn(t('menu.options'), () => void app.go('options'), 'ghost'), btn(t('menu.credits'), () => void app.go('credits'), 'ghost')),
    ),
  );
  return { el };
}
