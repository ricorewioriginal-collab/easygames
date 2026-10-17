import { expect, type Page } from '@playwright/test';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Echte Fehler sammeln; Netzfehler des optionalen Google-/Firebase-Skripts zählen nicht (Testumgebung offline). */
export function watchErrors(page: Page): string[] {
  const list: string[] = [];
  page.on('pageerror', (e) => list.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|firebase|gstatic|googleapis|ERR_|net::|GPU stall|WebGL/i.test(t)) return;
    list.push(t);
  });
  return list;
}

/** Hauptmenü öffnen */
export async function boot(page: Page): Promise<void> {
  await page.goto('/ricolife/?e2e=1');
  await expect(page.locator('#boot')).toHaveCount(0, { timeout: 45_000 });
  await expect(page.locator('#mNew')).toBeVisible();
}

/** Schnellstart mit einer vorgefertigten Familie auf Platz 3 */
export async function quick(page: Page, hh = 'hh-sonnberg'): Promise<void> {
  await page.goto(`/ricolife/?e2e=1&new=${hh}`);
  await ready(page);
}
export async function ready(page: Page): Promise<void> {
  await expect(page.locator('#btnMenu')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#loading')).toHaveCount(0, { timeout: 60_000 });
}

export const G = (page: Page) => page.evaluate(() => {
  const g = (window as any).__rl.g;
  return { funds: g.hh.funds, lot: g.hh.lot, active: g.activeSim, min: g.clock.min, speed: g.clock.speed };
});

/** Spielzeit vorspulen (Minuten) */
export const advance = (page: Page, min: number) => page.evaluate((m) => (window as any).__rl.advance(m), min);

/** Bildschirmposition eines Objekts (Kamera wird davor ausgerichtet) */
export async function objScreen(page: Page, id: string): Promise<{ x: number; y: number }> {
  return page.evaluate((oid) => {
    const app = (window as any).__rl;
    const o = app.g.world.objs.get(oid);
    const [cx, cz] = app.g.world.centerOf(o);
    app.setLevel(o.l);
    app.look(cx, cz, 12);
    return app.screenOf(cx, cz, 0.6);
  }, id);
}

export async function click(page: Page, p: { x: number; y: number }, mobile = false): Promise<void> {
  if (mobile) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
}

export async function shot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `test-results/shots/${name}.png` });
}
