import { expect, type Page } from '@playwright/test';

export interface GameState {
  app: string;
  mode: string | null;
  level: string | null;
  songTime: number;
  contextTime: number;
  audio: boolean;
  score: number;
  combo: number;
  counts: Record<'perfect' | 'great' | 'good' | 'miss', number> | null;
  lane: number;
  health: number;
  energy: number;
  duration: number;
  events: number;
  nextNote: { id: number; time: number; lane: number } | null;
  quality: string;
}

declare global {
  interface Window {
    __PRISMRUSH__: {
      state(): GameState;
      setAutoplay(on: boolean): void;
      seekNearEnd(secondsLeft?: number): boolean;
    };
  }
}

/** Startet das Spiel frisch; standardmäßig mit niedriger Grafikstufe für schnelle Tests. */
export async function openGame(page: Page, opts: { quality?: string } = {}): Promise<void> {
  const quality = opts.quality ?? 'low';
  await page.addInitScript((q) => {
    if (!sessionStorage.getItem('__init')) {
      sessionStorage.setItem('__init', '1');
      localStorage.setItem(
        'prismrush.save.v1',
        JSON.stringify({ version: 1, settings: { quality: q } }),
      );
    }
  }, quality);
  await page.goto('/?e2e');
  await expect(page.getByTestId('title')).toBeVisible();
}

export async function toMainMenu(page: Page): Promise<void> {
  await page.getByTestId('start').click();
  await expect(page.getByTestId('main-menu')).toBeVisible();
}

export function state(page: Page): Promise<GameState> {
  return page.evaluate(() => window.__PRISMRUSH__.state());
}

export async function startLevel(page: Page, index = 0): Promise<void> {
  await page.getByTestId('menu-campaign').click();
  await expect(page.getByTestId('levels')).toBeVisible();
  await page.getByTestId(`level-${index}`).click();
  await expect(page.getByTestId('hud')).toBeVisible();
  await expect.poll(async () => (await state(page)).app).toMatch(/countdown|playing/);
}

/**
 * Löst für die nächsten `count` Noten exakt zum Notenzeitpunkt eine Eingabe aus
 * (Tastatur oder Touch-Spurtaste) und liefert die Anzahl ausgelöster Eingaben.
 */
export function playNotes(page: Page, count: number, kind: 'key' | 'pad'): Promise<number> {
  return page.evaluate(
    ({ count, kind }) =>
      new Promise<number>((resolve) => {
        const api = window.__PRISMRUSH__;
        let fired = 0;
        let lastId = -1;
        const fire = (lane: number) => {
          if (kind === 'key') {
            window.dispatchEvent(
              new KeyboardEvent('keydown', { code: ['KeyA', 'KeyS', 'KeyD'][lane], bubbles: true }),
            );
          } else {
            const pad = document.querySelector(`[data-testid="pad-${lane}"]`);
            pad?.dispatchEvent(
              new PointerEvent('pointerdown', {
                pointerType: 'touch',
                bubbles: true,
                isPrimary: true,
              }),
            );
          }
        };
        const loop = () => {
          const st = api.state();
          const n = st.nextNote;
          if (n && n.id !== lastId) {
            const wait = (n.time - st.songTime) * 1000;
            if (wait < 40) {
              lastId = n.id;
              setTimeout(
                () => {
                  fire(n.lane);
                  fired++;
                  if (fired >= count) resolve(fired);
                },
                Math.max(0, wait),
              );
            }
          }
          if (fired < count) setTimeout(loop, 4);
        };
        loop();
      }),
    { count, kind },
  );
}
