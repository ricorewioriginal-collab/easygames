import { expect, test } from '@playwright/test';
import { boot, newCity, watchErrors } from './helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Rangliste über das easygames-Skript (cloud/anmacha-board.js): Bestwerte der Hauptstadt, eigener Knopf statt schwebendem 🏆.

test('Rangliste: Bestwerte werden gemerkt, Knopf im Menü öffnet sie, kein schwebender Knopf', async ({ page }) => {
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
  await expect(page.locator('button[aria-label="Rangliste"]')).toHaveCount(0);
  await page.click('#btn-menu-board');
  await expect(page.getByText('🏆 Rangliste', { exact: true })).toBeVisible();
  await expect(page.locator('option', { hasText: 'Meiste Einwohner' })).toHaveCount(1);
  expect(errs).toEqual([]);
});
