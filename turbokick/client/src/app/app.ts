import { Engine } from '../render/engine';
import { QUALITY_PRESETS, defaultQuality, type QualitySettings } from '../render/quality';
import { audio } from '../audio/audio';
import { store, type SaveStore } from './save';
import { applyTheme } from './theme';
import { setLocale } from '../i18n';
import { clear, h, toast } from '../ui/dom';

/** Ein Bildschirm der Oberfläche (DOM). `dispose` räumt Zeitgeber, Listener und 3D-Objekte auf. */
export interface ScreenView {
  el: HTMLElement;
  dispose?(): void;
}

export type RouteName = 'menu' | 'play' | 'p2p' | 'garage' | 'options' | 'help' | 'credits' | 'stats';
export interface RouteParams {
  back?: RouteName;
}
export type RouteModule = { create(app: App, params?: RouteParams): ScreenView | Promise<ScreenView> };

const ROUTES: Record<RouteName, () => Promise<RouteModule>> = {
  menu: () => import('../ui/mainMenu'),
  play: () => import('../ui/play'),
  p2p: () => import('../ui/p2p'),
  garage: () => import('../ui/garage'),
  options: () => import('../ui/options'),
  help: () => import('../ui/help'),
  credits: () => import('../ui/credits'),
  stats: () => import('../ui/stats'),
};

/** Wurzel der Anwendung: besitzt 3D-Engine, Audio, Speicher und die Navigation zwischen Bildschirmen. */
export class App {
  readonly store: SaveStore = store;
  readonly audio = audio;
  readonly engine: Engine;
  readonly ui: HTMLElement;
  private current: ScreenView | null = null;
  private navToken = 0;
  private match: { dispose(): void } | null = null;

  constructor(readonly host: HTMLElement) {
    host.textContent = '';
    const stage = h('div', { class: 'stage' });
    this.ui = h('div', { class: 'ui', id: 'ui' });
    host.append(stage, this.ui);
    this.engine = new Engine(stage, this.qualitySettings());
    this.applySettings();
    store.onChange(() => this.applySettings());
    const unlock = (): void => audio.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    this.ui.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button.btn, .card.pick, button.chip');
      if (b && !(b as HTMLButtonElement).disabled) audio.sfx(b.classList.contains('back') ? 'back' : 'click');
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? this.engine.stop() : this.engine.start()));
    window.addEventListener('beforeunload', () => store.save());
    if (!store.persistent) setTimeout(() => toast('Speichern im Browser ist nicht möglich – Einstellungen gehen beim Schließen verloren.', 'error', 6000), 800);
    if (store.recovered) setTimeout(() => toast('Gespeicherte Daten waren beschädigt und wurden zurückgesetzt.', 'error', 6000), 800);
  }

  qualitySettings(): QualitySettings {
    const q = store.data.settings.quality;
    return QUALITY_PRESETS[q === 'auto' ? defaultQuality() : q];
  }

  applySettings(): void {
    const s = store.data.settings;
    applyTheme(s);
    setLocale(s.language);
    audio.setSettings({ master: s.master, music: s.music, sfx: s.sfx, muted: s.muted });
    this.engine.setQuality(this.qualitySettings());
  }

  /** Eingabe per Touch? */
  get touch(): boolean {
    const c = store.data.settings.touchControls;
    if (c !== 'auto') return c === 'on';
    return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  }

  async go(name: RouteName, params?: RouteParams): Promise<void> {
    const token = ++this.navToken;
    try {
      const mod = await ROUTES[name]();
      const view = await mod.create(this, params);
      if (token !== this.navToken) {
        view.dispose?.();
        return;
      }
      this.show(view);
    } catch (e) {
      console.error(e);
      toast('Dieser Bildschirm konnte nicht geladen werden. Bitte Seite neu laden.', 'error', 5000);
      if (name !== 'menu') void this.go('menu');
    }
  }

  show(view: ScreenView): void {
    this.stopMatch();
    this.current?.dispose?.();
    clear(this.ui);
    this.current = view;
    this.ui.appendChild(view.el);
    view.el.querySelector<HTMLElement>('button, input, select')?.focus({ preventScroll: true });
  }

  /** Startet das Spiel-Fenster mit einer fertigen Sitzung (Typ siehe game/matchScreen.ts) */
  async startMatch(session: import('../game/session').MatchSession): Promise<void> {
    const token = ++this.navToken;
    this.stopMatch();
    const { MatchScreen } = await import('../game/matchScreen');
    if (token !== this.navToken) {
      session.dispose();
      return;
    }
    const ms = new MatchScreen(this, session);
    this.match = ms;
    this.current?.dispose?.();
    this.current = null;
    clear(this.ui);
    this.ui.appendChild(ms.el);
    ms.start();
  }

  stopMatch(): void {
    this.match?.dispose();
    this.match = null;
  }

  async toMenu(): Promise<void> {
    this.stopMatch();
    await this.go('menu');
  }
}
