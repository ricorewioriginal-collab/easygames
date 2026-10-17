import { expect, test } from '@playwright/test';
import { newCity, watchErrors } from './helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */

test('Baumenü zeigt 3D-Vorschaubilder; Jahreszeiten, Wetter und Nacht laufen fehlerfrei', async ({ page }) => {
  const errs = watchErrors(page);
  await newCity(page);
  // Jedes Gebäude ergibt ein nicht leeres Vorschaubild (ein leeres PNG wäre nur wenige hundert Zeichen lang).
  const sizes = (await page.evaluate(() => (window as any).__rv.thumbSizes())) as [string, number][];
  expect(sizes.length).toBeGreaterThan(140);
  expect(sizes.filter(([, n]) => n < 1000)).toEqual([]);
  await page.click('#tb-build');
  await expect(page.locator('.card .pic img').first()).toBeVisible();
  await page.locator('.panel .x').first().click();
  // Alle Jahreszeiten mit Niederschlag und Nacht durchspielen
  for (const [season, weather] of [['winter', 'snow'], ['spring', 'rain'], ['summer', 'clear'], ['autumn', 'rain']] as const) {
    await page.evaluate(([s, w]) => {
      const world = (window as any).__rv.world;
      world.setSeason(s);
      world.weatherCheck = 1e9;
      world.wantWeather = w;
      world.time = 480 * 0.75;
    }, [season, weather]);
    await page.waitForTimeout(400);
  }
  expect(await page.evaluate(() => (window as any).__rv.world.season)).toBe('autumn');
  expect(errs).toEqual([]);
});
