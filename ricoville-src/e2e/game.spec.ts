import { expect, test } from '@playwright/test';
import { advance, boot, city, newCity, tapTile, watchErrors } from './helpers';

test('Startmenü lädt ohne Fehler und ohne fremde Markennamen', async ({ page }) => {
  const errs = watchErrors(page);
  await boot(page);
  await expect(page).toHaveTitle(/RicoVille/);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/cityville|zynga/i);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  expect(errs).toEqual([]);
});

test('Neue Stadt: Haus bauen, fertigstellen, Miete kassieren, Spielstand bleibt nach Neuladen', async ({ page, isMobile }) => {
  const errs = watchErrors(page);
  await newCity(page);
  const before = await city(page);
  expect(before.name).toBe('Testhausen');

  await page.click('#tb-build');
  await page.click('[data-def="gartenhaus"]');
  const spot = await page.evaluate(() => {
    const c = (window as any).__rv.city;
    for (let y = 16; y < 32; y++) for (let x = 16; x < 32; x++) if (c.canPlace('gartenhaus', x, y, 0).ok) return { x, y };
    return null;
  });
  expect(spot).not.toBeNull();
  await tapTile(page, spot!.x, spot!.y, isMobile);
  // Auf Touch-Geräten setzt das Tippen den Platz, ✓ baut (war der Platz schon gewählt, baut bereits das Tippen)
  if (isMobile && (await city(page)).buildings.length === before.buildings.length) await page.click('#place-ok');
  await expect.poll(async () => (await city(page)).buildings.length).toBe(before.buildings.length + 1);
  let s = await city(page);
  expect(s.coins).toBe(before.coins - 120);
  const house = s.buildings.find((b: any) => b.def === 'gartenhaus');
  expect(house.state).toBe('building');

  // Bauzeit (30 s) und Mietzeit (3 Min) vorspulen, dann Haus antippen → Miete
  await page.keyboard.press('Escape');
  await advance(page, 40);
  s = await city(page);
  expect(s.buildings.find((b: any) => b.uid === house.uid).state).toBe('done');
  await advance(page, 200);
  const coins = (await city(page)).coins;
  await tapTile(page, house.x, house.y, isMobile);
  await expect.poll(async () => (await city(page)).coins).toBeGreaterThan(coins);

  // Speichern, neu laden, weiterspielen
  await page.evaluate(() => (window as any).__rv.save());
  await page.reload();
  await expect(page.locator('#btn-continue')).toBeVisible({ timeout: 45_000 });
  await page.click('#btn-continue');
  await expect(page.locator('#tb-build')).toBeVisible();
  const after = await city(page);
  expect(after.buildings.length).toBe(s.buildings.length);
  expect(after.name).toBe('Testhausen');
  expect(errs).toEqual([]);
});

test('Straße malen und Feld bestellen bis zur Ernte', async ({ page, isMobile }) => {
  const errs = watchErrors(page);
  await newCity(page);
  const roads = (await city(page)).roads.length;

  // Straßenmodus: auf ein freies Feld neben der Hauptstraße tippen
  await page.click('#tb-road');
  const free = await page.evaluate(() => {
    const c = (window as any).__rv.city;
    for (let x = 16; x < 32; x++) if (c.canRoad(x, 26).ok) return { x, y: 26 };
    return null;
  });
  expect(free).not.toBeNull();
  await tapTile(page, free!.x, free!.y, isMobile);
  await expect.poll(async () => (await city(page)).roads.length).toBe(roads + 1);
  await page.keyboard.press('Escape');
  if (isMobile) await page.click('#tool-normal');

  // Acker antippen → Saatfenster → Weizen säen
  const field = (await city(page)).buildings.find((b: any) => b.def === 'acker');
  await tapTile(page, field.x, field.y, isMobile);
  await expect(page.locator('[data-crop="weizen"]')).toBeVisible();
  await page.click('[data-crop="weizen"]');
  await expect.poll(async () => (await city(page)).buildings.find((b: any) => b.uid === field.uid).t).toBeTruthy();
  const wheat = (await city(page)).inv.weizen ?? 0;
  await advance(page, 5 * 60 + 5);
  await tapTile(page, field.x, field.y, isMobile);
  await expect.poll(async () => (await city(page)).inv.weizen ?? 0).toBeGreaterThan(wheat);
  expect(errs).toEqual([]);
});

test('Langer Ablauf: bauen, ernten, kassieren, Aufgaben abschließen, aufsteigen, Kreativmodus getrennt', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Langer Ablauf nur einmal auf dem Desktop');
  const errs = watchErrors(page);
  await newCity(page);
  // Über die Spielregeln (wie ein Spieler mit viel Zeit) mehrere Runden spielen
  const res = await page.evaluate(() => {
    const rv = (window as any).__rv;
    const c = rv.city;
    const log: string[] = [];
    const build = (id: string): void => {
      for (let y = 16; y < 32; y++) for (let x = 16; x < 32; x++) if (c.canPlace(id, x, y, 0).ok) return void log.push(`bau ${id}: ${c.place(id, x, y, 0).ok}`);
    };
    for (let round = 0; round < 30; round++) {
      if (round % 3 === 0) build(round < 6 ? 'gartenhaus' : 'haus_rot');
      for (const b of c.s.buildings) {
        const st = c.status(b).kind;
        if (['rent', 'cash', 'harvest', 'ready'].includes(st)) c.collect(b.uid);
        else if (st === 'plant') c.plant(b.uid, 'weizen');
        else if (st === 'supply') c.supply(b.uid);
      }
      for (const q of c.activeQuests()) if (c.questDone(q)) log.push(`quest ${q.id}: ${c.claimQuest(q.id).ok}`);
      rv.advance(6 * 60);
    }
    return { level: c.s.level, coins: c.s.coins, xp: c.s.xp, log };
  });
  expect(res.level).toBeGreaterThanOrEqual(2);
  expect(res.log.filter((l) => l.startsWith('quest') && l.endsWith('true')).length).toBeGreaterThan(0);
  // Aufgabenfenster zeigt die Stadtgeschichte
  await page.click('#tb-quests');
  await expect(page.locator('.panel')).toBeVisible();
  await page.keyboard.press('Escape');
  // Kreativmodus hat einen eigenen Speicherplatz
  await page.evaluate(() => (window as any).__rv.save());
  await page.click('#tb-menu');
  await page.click('#btn-creative');
  await expect(page.locator('#tb-build')).toBeVisible();
  const creative = await city(page);
  expect(creative.mode).toBe('creative');
  const main = await page.evaluate(() => JSON.parse(localStorage.getItem('ricoville.save.main') ?? '{}'));
  expect(JSON.parse(main.city ?? '{}').name).toBe('Testhausen');
  expect(errs).toEqual([]);
});
