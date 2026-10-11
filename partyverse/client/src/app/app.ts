import { Engine } from '../render/engine';
import { QUALITY_PRESETS, defaultQuality, type QualitySettings } from '../render/quality';
import { audio } from '../audio/audio';
import { store, type SaveStore } from './save';
import { applyTheme } from './theme';
import { setLocale } from '../i18n';
import { clear, h, toast } from '../ui/dom';
import type { GameSession } from '../net/session';
import type { OnlineClient } from '../net/online';

/** Ein Bildschirm der Oberfläche (DOM). `dispose` räumt Zeitgeber, Listener und 3D-Objekte auf. */
export interface ScreenView {
  el: HTMLElement;
  dispose?(): void;
}

export type RouteName = 'menu' | 'setup' | 'p2p' | 'online' | 'options' | 'credits' | 'rules' | 'cosmetics' | 'achievements';
export interface RouteParams {
  mode?: 'hotseat' | 'bots';
  back?: RouteName;
}
export type RouteModule = { create(app: App, params?: RouteParams): ScreenView | Promise<ScreenView> };

const ROUTES: Record<RouteName, () => Promise<RouteModule>> = {
  menu: () => import('../ui/mainMenu'),
  setup: () => import('../ui/setup'),
  p2p: () => import('../ui/p2p'),
  online: () => import('../ui/online'),
  options: () => import('../ui/screens/options'),
  credits: () => import('../ui/screens/credits'),
  rules: () => import('../ui/screens/rules'),
  cosmetics: () => import('../ui/screens/cosmetics'),
  achievements: () => import('../ui/screens/achievements'),
};

/** Wurzel der Anwendung: besitzt 3D-Engine, Audio, Speicher und die Navigation zwischen Bildschirmen. */
export class App {
  readonly store: SaveStore = store;
  readonly audio = audio;
  readonly engine: Engine;
  /** Ebene für DOM-Bildschirme über dem Canvas */
  readonly ui: HTMLElement;
  private current: ScreenView | null = null;
  private navToken = 0;
  /** Aktive Online-Verbindung (bleibt zwischen Lobby und Spiel bestehen) */
  online: OnlineClient | null = null;
  /** Aktives Spiel (wird beim Verlassen freigegeben) */
  private game: { dispose(): void } | null = null;

  constructor(readonly host: HTMLElement) {
    host.textContent = '';
    const stage = h('div', { class: 'stage' });
    this.ui = h('div', { class: 'ui', id: 'ui' });
    host.append(stage, this.ui);
    this.engine = new Engine(stage, this.qualitySettings());
    this.applySettings();
    store.onChange(() => this.applySettings());
    window.addEventListener('pointerdown', () => audio.unlock(), { once: false, passive: true });
    window.addEventListener('keydown', () => audio.unlock(), { once: false, passive: true });
    // Klick-Geräusch für alle Schaltflächen
    this.ui.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button.btn, .card.pick');
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

  /** Eingabe per Touch? (für Hinweise und Minispiel-Bedienelemente) */
  get touch(): boolean {
    const c = store.data.settings.touchControls;
    if (c !== 'auto') return c === 'on';
    return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  }

  /** Wechselt den Bildschirm. Fehler beim Laden werden angezeigt, das Menü bleibt erreichbar. */
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
    this.current?.dispose?.();
    clear(this.ui);
    this.current = view;
    this.ui.appendChild(view.el);
    const first = view.el.querySelector<HTMLElement>('button, input, select');
    first?.focus({ preventScroll: true });
  }

  /** Startet das Spiel-Fenster mit einer fertigen Sitzung */
  async startGame(session: GameSession): Promise<void> {
    const token = ++this.navToken;
    this.stopGame();
    const { GameScreen } = await import('../game/gameScreen');
    if (token !== this.navToken) {
      session.dispose();
      return;
    }
    const gs = new GameScreen(this, session);
    this.game = gs;
    this.current?.dispose?.();
    this.current = null;
    clear(this.ui);
    this.ui.appendChild(gs.el);
    gs.start();
  }

  stopGame(): void {
    this.game?.dispose();
    this.game = null;
  }

  /** Zurück ins Hauptmenü (beendet Spiel und Online-Verbindung) */
  async toMenu(): Promise<void> {
    this.stopGame();
    if (this.online) {
      this.online.leave();
      this.online = null;
    }
    await this.go('menu');
  }
}
