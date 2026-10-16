import { expect, type Page } from '@playwright/test';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Echte Fehler sammeln; Netzfehler des optionalen Google-/Firebase-Skripts zählen nicht (Testumgebung offline). */
export function watchErrors(page: Page): string[] {
  const list: string[] = [];
  page.on('pageerror', (e) => list.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|firebase|gstatic|googleapis|ERR_|net::/i.test(t)) return;
    list.push(t);
  });
  return list;
}

export async function boot(page: Page): Promise<void> {
  await page.goto('/ricoville/?e2e=1');
  await expect(page.locator('#boot')).toHaveCount(0, { timeout: 45_000 });
  await expect(page.locator('#btn-new')).toBeVisible();
}

export async function newCity(page: Page, name = 'Testhausen'): Promise<void> {
  await boot(page);
  await page.click('#btn-new');
  await page.fill('#cityname', name);
  await page.click('#btn-found');
  await expect(page.locator('#tb-build')).toBeVisible();
  // Begrüßungsfenster der Bürgermeisterin schließen
  await page.locator('.panel .x').first().click();
  await expect(page.locator('.panel')).toHaveCount(0);
}

export const city = (page: Page) => page.evaluate(() => (window as any).__rv.city.s);

export async function tapTile(page: Page, x: number, y: number, mobile: boolean): Promise<void> {
  await page.evaluate(([tx, ty]) => (window as any).__rv.look(tx! + 0.5, ty! + 0.5), [x, y]);
  const p = await page.evaluate(([tx, ty]) => (window as any).__rv.screen(tx, ty) as { x: number; y: number }, [x, y]);
  if (mobile) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(150);
}

export const advance = (page: Page, sec: number) => page.evaluate((s) => (window as any).__rv.advance(s), sec);

