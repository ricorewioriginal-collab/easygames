import { cleanName } from '@shared/net/p2p';
import type { App, RouteParams, ScreenView } from '../app/app';
import { CAR_BODIES, CAR_DECALS, type CarBody, type CarDecal } from '../render/actors';
import { t } from '../i18n';
import { btn, h } from './dom';
import { showroomFor } from './mainMenu';

const ACCENTS: Array<[string, string]> = [
  ['', 'Team'],
  ['#b6ff3b', 'Lime'],
  ['#ff2d95', 'Magenta'],
  ['#ffd23f', 'Gold'],
  ['#9b5cff', 'Violett'],
  ['#ffffff', 'Weiß'],
  ['#00ffc6', 'Türkis'],
  ['#ff4d5e', 'Rot'],
];

/** Garage: Karosserie, Aufkleber, Akzentfarbe und Namen wählen – das Auto dreht sich live im Hintergrund */
export function create(app: App, params?: RouteParams): ScreenView {
  const room = showroomFor(app);
  room.setShift(window.innerWidth > 900 ? 4.4 : 0);
  app.engine.setScreen(room);
  app.engine.start();
  const body = h('div');
  const set = (patch: Partial<{ body: string; decal: string; accent: string }>): void => {
    app.store.update((d) => {
      Object.assign(d.garage, patch);
    });
    const g = app.store.data.garage;
    room.setLook(
      {
        body: g.body as CarBody,
        decal: g.decal as CarDecal,
        ...(g.accent ? { accent: parseInt(g.accent.slice(1), 16) } : {}),
      },
      0,
    );
    render();
  };
  const chips = (items: Array<[string, string]>, cur: string, on: (v: string) => void): HTMLElement =>
    h(
      'div',
      { class: 'chips' },
      ...items.map(([v, label]) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip' + (v === cur ? ' on' : ''),
            'aria-pressed': String(v === cur),
            onclick: () => on(v),
          },
          label,
        ),
      ),
    );
  const render = (): void => {
    const g = app.store.data.garage;
    body.textContent = '';
    const nameIn = h('input', {
      class: 'field',
      value: app.store.data.profile.name,
      maxlength: 14,
      'aria-label': t('garage.name'),
      onchange: () =>
        app.store.update((d) => {
          d.profile.name = cleanName(nameIn.value) || d.profile.name;
        }),
    });
    body.append(
      h('h3', null, t('garage.name')),
      nameIn,
      h('h3', null, t('garage.body')),
      chips(
        CAR_BODIES.map((b) => [b.id, b.name]),
        g.body,
        (v) => set({ body: v }),
      ),
      h('p', null, CAR_BODIES.find((b) => b.id === g.body)?.blurb ?? ''),
      h('h3', null, t('garage.decal')),
      chips(
        CAR_DECALS.map((d) => [d.id, d.name]),
        g.decal,
        (v) => set({ decal: v }),
      ),
      h('h3', null, t('garage.accent')),
      chips(ACCENTS, g.accent, (v) => set({ accent: v })),
    );
  };
  render();
  const el = h(
    'div',
    { class: 'screen side' },
    h(
      'div',
      { class: 'panel', style: 'width:min(100%,460px)' },
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('menu.garage')),
        btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back'),
      ),
      body,
    ),
  );
  return { el };
}
