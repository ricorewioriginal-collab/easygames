import { expect, test } from '@playwright/test';
import { openGame, playNotes, startLevel, state, toMainMenu } from './helpers';

test.describe('Touch-Steuerung', () => {
  test.skip(({ isMobile }) => !isMobile, 'Nur auf Mobilgeräten');

  test('Spurtasten sind groß, sichtbar und treffen Noten', async ({ page }) => {
    await openGame(page);
    await page.getByTestId('start').tap();
    await expect(page.getByTestId('main-menu')).toBeVisible();
    await page.getByTestId('menu-campaign').tap();
    await page.getByTestId('level-0').tap();
    await expect(page.getByTestId('touch-pads')).toBeVisible();
    const vp = page.viewportSize()!;
    for (let l = 0; l < 3; l++) {
      const box = (await page.getByTestId(`pad-${l}`).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(60);
      expect(box.width).toBeGreaterThanOrEqual(60);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    }
    await page.getByTestId('pad-2').tap();
    await expect.poll(async () => (await state(page)).lane).toBe(2);
    await playNotes(page, 8, 'pad');
    await page.waitForTimeout(300);
    const s = await state(page);
    expect(s.counts!.perfect + s.counts!.great + s.counts!.good).toBeGreaterThanOrEqual(6);
  });

  test('Wischgesten wechseln die Spur, Pause per Touch', async ({ page }) => {
    await openGame(page);
    await toMainMenu(page);
    await startLevel(page, 0);
    const vp = page.viewportSize()!;
    const swipe = async (dx: number) => {
      await page.evaluate(
        ({ dx, x, y }) => {
          const el = document.getElementById('app')!;
          const opts = { pointerType: 'touch', pointerId: 7, bubbles: true, isPrimary: true };
          el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: x, clientY: y }));
          el.dispatchEvent(
            new PointerEvent('pointermove', { ...opts, clientX: x + dx / 2, clientY: y }),
          );
          el.dispatchEvent(
            new PointerEvent('pointermove', { ...opts, clientX: x + dx, clientY: y }),
          );
          el.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: x + dx, clientY: y }));
        },
        { dx, x: vp.width / 2, y: vp.height * 0.4 },
      );
    };
    expect((await state(page)).lane).toBe(1);
    await swipe(-120);
    expect((await state(page)).lane).toBe(0);
    await swipe(120);
    await swipe(120);
    expect((await state(page)).lane).toBe(2);
    await page.getByTestId('pause-button').tap();
    await expect(page.getByTestId('pause')).toBeVisible();
    await page.getByTestId('resume').tap();
    await expect.poll(async () => (await state(page)).app, { timeout: 5000 }).toBe('playing');
  });
});
