import { expect, test } from '@playwright/test';
import { openGame, toMainMenu } from './helpers';

test('Titel, Hauptmenü und alle Untermenüs sind erreichbar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await openGame(page);
  await expect(page).toHaveTitle('PRISMRUSH');
  await toMainMenu(page);

  const screens: [string, string][] = [
    ['menu-campaign', 'levels'],
    ['menu-modes', 'modes'],
    ['menu-tutorial', 'tutorial'],
    ['menu-effects', 'effects'],
    ['menu-records', 'records'],
    ['menu-settings', 'settings'],
  ];
  for (const [btn, screen] of screens) {
    await page.getByTestId(btn).click();
    await expect(page.getByTestId(screen)).toBeVisible();
    await page.getByTestId('back').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  }

  // Weltenreiter und gesperrte Level.
  await page.getByTestId('menu-campaign').click();
  await expect(page.getByTestId('level-0')).toBeEnabled();
  await expect(page.getByTestId('level-1')).toBeDisabled();
  await page.getByTestId('world-3').click();
  await expect(page.getByTestId('level-31')).toBeVisible();
  await page.getByTestId('diff-hard').click();
  await expect(page.getByTestId('diff-hard')).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('back').click();

  // Effekt-Reiter wechseln.
  await page.getByTestId('menu-effects').click();
  for (const slot of ['trail', 'palette', 'burst', 'ship']) {
    await page.getByTestId(`slot-${slot}`).click();
    await expect(page.getByTestId(`slot-${slot}`)).toHaveClass(/active/);
  }
  await expect(page.getByTestId('effect-octa')).toBeDisabled();
  await page.getByTestId('back').click();

  // Reset-Dialog öffnen und abbrechen.
  await page.getByTestId('menu-settings').click();
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('confirm')).toBeVisible();
  await page.getByTestId('reset-cancel').click();
  await expect(page.getByTestId('settings')).toBeVisible();

  expect(errors).toEqual([]);
});

test('Einstellungen werden dauerhaft gespeichert', async ({ page }) => {
  await openGame(page);
  await toMainMenu(page);
  await page.getByTestId('menu-settings').click();
  await page.getByTestId('vol-master').fill('35');
  await page.getByTestId('quality').selectOption('medium');
  await page.getByTestId('toggle-shake').locator('..').click();
  await page.reload();
  await toMainMenu(page);
  await page.getByTestId('menu-settings').click();
  await expect(page.getByTestId('vol-master')).toHaveValue('35');
  await expect(page.getByTestId('quality')).toHaveValue('medium');
  await expect(page.getByTestId('toggle-shake')).not.toBeChecked();
});

test('PWA-Manifest und Service Worker sind vorhanden', async ({ page, request }) => {
  await openGame(page);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.name).toBe('PRISMRUSH');
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBe(true);
  for (const icon of manifest.icons) {
    const res = await request.get(`/${icon.src}`);
    expect(res.ok(), icon.src).toBe(true);
  }
});

test('Seite hat kein horizontales Überlaufen', async ({ page }) => {
  await openGame(page);
  await toMainMenu(page);
  for (const btn of ['menu-campaign', 'menu-records', 'menu-settings']) {
    await page.getByTestId(btn).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByTestId('back').click();
  }
});
