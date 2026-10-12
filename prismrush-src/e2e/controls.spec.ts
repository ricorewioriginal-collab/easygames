import { expect, test } from '@playwright/test';
import { openGame, startLevel, state, toMainMenu } from './helpers';

async function waitPlaying(page: import('@playwright/test').Page): Promise<void> {
  await expect.poll(async () => (await state(page)).app, { timeout: 8000 }).toBe('playing');
}

test.describe('Steuerung', () => {
  test('Pfeiltasten wechseln die Spur relativ', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur nur auf Desktop');
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await waitPlaying(page);
    expect((await state(page)).lane).toBe(1);
    const steps: [string, number][] = [
      ['ArrowRight', 2],
      ['ArrowRight', 2],
      ['ArrowLeft', 1],
      ['ArrowLeft', 0],
      ['ArrowLeft', 0],
      ['ArrowRight', 1],
      ['KeyD', 2],
      ['KeyA', 0],
    ];
    for (const [key, lane] of steps) {
      await page.keyboard.press(key);
      await expect.poll(async () => (await state(page)).lane).toBe(lane);
    }
  });

  test('Leertaste pausiert nicht über den fokussierten Pause-Knopf', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur nur auf Desktop');
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await waitPlaying(page);
    await page.getByTestId('pause-button').focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await state(page)).lane).toBe(0);
    expect((await state(page)).app).toBe('playing');
  });

  test('Finger gleitet über die Spurtasten', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Spurtasten nur auf Touch-Geräten');
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    await waitPlaying(page);
    const send = (target: string, type: string) =>
      page.evaluate(
        ([target, type]) => {
          const el =
            target === 'window' ? window : document.querySelector(`[data-testid="${target}"]`);
          el?.dispatchEvent(
            new PointerEvent(type, {
              pointerId: 7,
              pointerType: 'touch',
              bubbles: true,
              isPrimary: true,
            }),
          );
        },
        [target, type],
      );
    await send('pad-0', 'pointerdown');
    await expect.poll(async () => (await state(page)).lane).toBe(0);
    await send('pad-1', 'pointerenter');
    await expect.poll(async () => (await state(page)).lane).toBe(1);
    await send('pad-2', 'pointerenter');
    await expect.poll(async () => (await state(page)).lane).toBe(2);
    await send('window', 'pointerup');
    await send('pad-0', 'pointerenter');
    await page.waitForTimeout(100);
    expect((await state(page)).lane).toBe(2);
  });
});

test('Jeder Spielmodus startet einen Lauf', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Einmal reicht');
  test.setTimeout(120_000);
  await openGame(page);
  await toMainMenu(page);
  await page.getByTestId('menu-modes').click();
  const ids = await page
    .locator('[data-testid^="mode-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(5)));
  expect(ids.length).toBeGreaterThanOrEqual(12);
  await page.getByTestId('back').click();
  for (const id of ids) {
    await page.getByTestId('menu-modes').click();
    await page.getByTestId(`mode-${id}`).click();
    const hud = page.getByTestId('hud');
    await expect(
      page.locator('[data-testid="levels"]:visible, [data-testid="hud"]:visible'),
    ).toHaveCount(1);
    if (await page.getByTestId('levels').isVisible()) await page.getByTestId('level-0').click();
    await expect(hud).toBeVisible();
    await expect.poll(async () => (await state(page)).mode).toBe(id);
    expect((await state(page)).events).toBeGreaterThan(0);
    await page.getByTestId('pause-button').click();
    await page.getByTestId('quit').click();
    await expect(page.getByTestId('main-menu')).toBeVisible();
  }
});
