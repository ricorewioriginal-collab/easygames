import { expect, test } from '@playwright/test';
import { openGame, playNotes, startLevel, state, toMainMenu } from './helpers';

test.describe('Spielablauf', () => {
  test('Audiouhr und Spielzeit laufen synchron', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    const a = await state(page);
    expect(a.audio).toBe(true);
    const wallA = Date.now();
    await page.waitForTimeout(1500);
    const b = await state(page);
    const wall = (Date.now() - wallA) / 1000;
    const song = b.songTime - a.songTime;
    const ctx = b.contextTime - a.contextTime;
    expect(Math.abs(song - ctx)).toBeLessThan(0.02);
    expect(Math.abs(song - wall)).toBeLessThan(0.25);
    expect(b.events).toBeGreaterThan(20);
  });

  test('Tastatursteuerung trifft Noten im Takt', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur nur auf Desktop');
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await playNotes(page, 8, 'key');
    await page.waitForTimeout(300);
    const s = await state(page);
    const hits = s.counts!.perfect + s.counts!.great + s.counts!.good;
    expect(hits).toBeGreaterThanOrEqual(6);
    expect(s.score).toBeGreaterThan(0);
    expect(s.combo).toBeGreaterThan(0);
  });

  test('Mausklick wählt die Spur', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Maus nur auf Desktop');
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    const box = page.viewportSize()!;
    await page.mouse.click(box.width * 0.1, box.height * 0.6);
    await expect.poll(async () => (await state(page)).lane).toBe(0);
    await page.mouse.click(box.width * 0.9, box.height * 0.6);
    await expect.poll(async () => (await state(page)).lane).toBe(2);
  });

  test('Pause friert die Zeit ein, Fortsetzen und Neustart funktionieren', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await page.waitForTimeout(2500);
    await page.getByTestId('pause-button').click();
    await expect(page.getByTestId('pause')).toBeVisible();
    const p1 = await state(page);
    await page.waitForTimeout(600);
    const p2 = await state(page);
    expect(p2.app).toBe('paused');
    expect(Math.abs(p2.songTime - p1.songTime)).toBeLessThan(0.05);

    // Einstellungen aus der Pause und zurück.
    await page.getByTestId('pause-settings').click();
    await expect(page.getByTestId('settings')).toBeVisible();
    await page.getByTestId('back').click();
    await expect(page.getByTestId('pause')).toBeVisible();

    await page.getByTestId('resume').click();
    await expect.poll(async () => (await state(page)).app, { timeout: 5000 }).toBe('playing');
    const r1 = await state(page);
    await page.waitForTimeout(500);
    const r2 = await state(page);
    expect(r2.songTime - r1.songTime).toBeGreaterThan(0.3);

    await page.getByTestId('pause-button').click();
    await page.getByTestId('restart').click();
    await expect(page.getByTestId('hud')).toBeVisible();
    const fresh = await state(page);
    expect(fresh.songTime).toBeLessThan(1);
    expect(fresh.score).toBe(0);

    await page.getByTestId('pause-button').click();
    await page.getByTestId('quit').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
    expect((await state(page)).app).toBe('menu');
  });

  test('Level abschließen, Ergebnis, Freischaltung und Neustart', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await page.evaluate(() => {
      window.__PRISMRUSH__.setAutoplay(true);
      window.__PRISMRUSH__.seekNearEnd(5);
    });
    await expect(page.getByTestId('results')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('result-title')).toHaveText('Level geschafft!');
    await expect(page.getByTestId('next-level')).toBeVisible();

    await page.getByTestId('retry').click();
    await expect(page.getByTestId('hud')).toBeVisible();
    await expect.poll(async () => (await state(page)).level).toBe('L01');
    await page.getByTestId('pause-button').click();
    await page.getByTestId('quit').click();

    await page.getByTestId('menu-campaign').click();
    await expect(page.getByTestId('level-1')).toBeEnabled();
    await expect(page.getByTestId('level-0')).toContainText('★');
  });

  test('Scheitern zeigt den Ergebnisbildschirm', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await page.getByTestId('menu-modes').click();
    await page.getByTestId('diff-extreme').click();
    await page.getByTestId('mode-endless').click();
    await expect(page.getByTestId('hud')).toBeVisible();
    // Ohne Eingaben verliert der Gleiter Energie, bis der Lauf endet.
    await expect(page.getByTestId('results')).toBeVisible({ timeout: 55_000 });
    await expect(page.getByTestId('result-title')).toHaveText('Lauf beendet');
  });

  test('Tutorial durchspielen schaltet die Farbwelt Mondlicht frei', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await page.getByTestId('menu-tutorial').click();
    await page.getByTestId('tutorial-start').click();
    await expect(page.getByTestId('hud-hint')).toHaveClass(/show/);
    await page.evaluate(() => {
      window.__PRISMRUSH__.setAutoplay(true);
      window.__PRISMRUSH__.seekNearEnd(4);
    });
    await expect(page.getByTestId('result-title')).toHaveText('Tutorial geschafft!', {
      timeout: 20_000,
    });
    await page.getByTestId('to-menu').click();
    await page.getByTestId('menu-effects').click();
    await page.getByTestId('slot-palette').click();
    await expect(page.getByTestId('effect-mono')).toBeEnabled();
    await page.getByTestId('effect-mono').click();
    await expect(page.getByTestId('effect-mono')).toHaveClass(/active/);
  });

  test('Hohe Grafikqualität mit Bloom rendert ohne Fehler', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await openGame(page, { quality: 'high' });
    await toMainMenu(page);
    await startLevel(page, 0);
    await page.waitForTimeout(1500);
    expect((await state(page)).quality).toBe('high');
    expect(errors).toEqual([]);
  });
});
