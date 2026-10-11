import type { App, RouteParams, ScreenView } from '../app/app';
import { t } from '../i18n';
import { MenuScene } from './menuScene';
import { btn, h } from './dom';

let scene: MenuScene | null = null;

/** Hauptmenü mit animiertem Wortmarken-Logo und 3D-Bühne */
export function create(app: App, _params?: RouteParams): ScreenView {
  if (!scene) scene = new MenuScene(app.store.data.settings.reducedMotion);
  app.engine.setScreen(scene);
  app.engine.start();
  app.audio.music('menu');
  const word = h(
    'div',
    { class: 'wordmark', 'aria-label': 'PARTYVERSE' },
    ...'PARTYVERSE'
      .split('')
      .map((c, i) => h('span', { style: `animation-delay:${i * 0.12}s`, 'aria-label': '' }, c)),
  );
  const online = app.store.data.settings.serverUrl !== '';
  const el = h(
    'div',
    { class: 'screen side' },
    h('div', { class: 'logo' }, word, h('div', { class: 'sub' }, t('menu.tagline'))),
    h(
      'div',
      { class: 'menu' },
      btn(t('menu.bots'), () => void app.go('setup', { mode: 'bots' }), 'hot big'),
      btn(t('menu.hotseat'), () => void app.go('setup', { mode: 'hotseat' })),
      btn(online ? t('menu.online') : t('menu.onlineOff'), () => void app.go('online')),
      h(
        'div',
        { class: 'menu-foot' },
        btn(t('menu.cosmetics'), () => void app.go('cosmetics'), 'ghost'),
        btn(t('menu.achievements'), () => void app.go('achievements'), 'ghost'),
        btn(t('menu.rules'), () => void app.go('rules'), 'ghost'),
        btn(t('menu.options'), () => void app.go('options'), 'ghost'),
        btn(t('menu.credits'), () => void app.go('credits'), 'ghost'),
      ),
    ),
  );
  return { el };
}
