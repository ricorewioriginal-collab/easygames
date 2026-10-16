import { expect, test } from '@playwright/test';
import { boot, newCity, watchErrors } from './helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Rangliste über das easygames-Skript (cloud/anmacha-board.js): Bestwerte der Hauptstadt, Ansicht über die zentrale Ranglisten-Seite.

test('Rangliste: Bestwerte werden gemerkt, Knopf im Menü öffnet die Ranglisten-Seite', async ({ page }) => {
  const errs = watchErrors(page);
  await newCity(page);
  await page.evaluate(() => (window as any).__rv.save());
  const best = await page.evaluate(() => JSON.parse(localStorage.getItem('ricoville.profile.best') ?? 'null'));
  expect(best).toEqual({ level: 1, pop: expect.any(Number) });
  // Bestwerte sinken nie (z. B. nach Abriss)
  await page.evaluate(() => localStorage.setItem('ricoville.profile.best', JSON.stringify({ level: 7, pop: 999 })));
  await page.evaluate(() => (window as any).__rv.save());
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ricoville.profile.best')!))).toEqual({ level: 7, pop: 999 });

  await boot(page);
  await expect(page.locator('#btn-menu-board')).toBeVisible();
  await page.click('#btn-menu-board');
  const frame = page.frameLocator('.panel iframe.board-frame');
  await expect(frame.locator('#game')).toHaveValue('ricoville');
  await expect(frame.getByText('Meiste Einwohner').first()).toBeAttached();
  expect(errs).toEqual([]);
});
