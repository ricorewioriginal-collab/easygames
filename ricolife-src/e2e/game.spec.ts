// Spielabläufe A–L im echten Chromium (WebGL über SwiftShader).
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { advance, boot, click, G, objScreen, quick, ready, shot, watchErrors } from './helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'nur Desktop');

async function noHorizontalScroll(page: Page): Promise<void> {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
  expect(r.sw).toBeLessThanOrEqual(r.w + 1);
}

test('A: Menü → eigene Familie → Editor → Zuhause → Live-Spiel ohne Fehler', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1365, height: 768 });
  await boot(page);
  await shot(page, 'menu');
  await page.click('#mNew');
  await page.click('#mCustom');
  await expect(page.locator('#cas')).toBeVisible();
  await page.fill('#cas [data-k="first"]', 'Testa');
  await page.fill('#cas [data-k="last"]', 'Probe');
  // 3D-Vorschau zeichnet etwas (nicht leer)
  const canvas = page.locator('#cas canvas');
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(600);
  await shot(page, 'cas');
  await page.click('#cas >> text=✔ Fertig');
  await page.click('[data-lot="sh-6"]');
  await ready(page);
  const st = await page.evaluate(() => {
    const g = (window as any).__rl.g;
    return { lot: g.hh.lot, first: g.active.first, last: g.active.last };
  });
  expect(st).toEqual({ lot: 'sh-6', first: 'Testa', last: 'Probe' });
  await advance(page, 30);
  await page.waitForTimeout(1500);
  await shot(page, 'live-day');
  expect(errors).toEqual([]);
});

test('B: Kühlschrank → Kochen → Essen, danach zwei Befehle in der Warteschlange', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await quick(page);
  const fridge = await page.evaluate(() => {
    const g = (window as any).__rl.g;
    g.settings.autonomy = 0;
    const s = g.members().find((m: any) => g.isAdult(m));
    g.activeSim = s.id;
    s.needs.hunger = 15;
    for (const a of s.queue) a.phase = 'done';
    return g.objsWith(g.hh.lot, 'fridge')[0].id as string;
  });
  await click(page, await objScreen(page, fridge));
  await expect(page.locator('.pie')).toBeVisible();
  await shot(page, 'interaction');
  await page.locator('.pie .it', { hasText: 'Kochen: Käsetoast' }).click();
  await advance(page, 150);
  const r = await page.evaluate(() => {
    const g = (window as any).__rl.g;
    return { hunger: g.active.needs.hunger, cooked: g.stats['int:cook'] ?? 0 };
  });
  expect(r.hunger).toBeGreaterThan(30); // Käsetoast: +35 abzüglich Verbrauch während Kochen/Essen
  // zwei Befehle hintereinander
  await click(page, await objScreen(page, fridge));
  await page.locator('.pie .it', { hasText: 'Snack nehmen' }).click();
  await click(page, await objScreen(page, fridge));
  await page.locator('.pie .it', { hasText: 'Snack nehmen' }).click();
  const q = await page.evaluate(() => (window as any).__rl.g.active.queue.length);
  expect(q).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#hud .qitem[aria-label*="Snack"]').first()).toBeAttached();
  expect(errors).toEqual([]);
});

test('C: Kaufmodus → Möbel platzieren → Geld sinkt → speichern → neu laden → Möbel da', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await quick(page);
  const before = await G(page);
  await page.click('#btnBuy');
  await expect(page.locator('.bm-panel, .buildbar').first()).toBeVisible();
  await shot(page, 'buy-mode');
  const lot = before.lot as string;
  const n0 = await page.evaluate((id) => (window as any).__rl.g.world.objsOnLot(id).length, lot);
  // Katalog: erstes kaufbares Objekt wählen, dann eine freie Stelle auf dem Grundstück antippen
  await page.locator('.bm-item').first().click();
  const spot = await page.evaluate((id) => {
    const app = (window as any).__rl;
    const g = app.g;
    const def = app.build.def as string;
    const L = g.world.lotAt(...((): [number, number] => { const o = g.world.objsOnLot(id)[0]; return [o.x, o.z]; })());
    for (let z = L.z + 1; z < L.z + L.d - 1; z++)
      for (let x = L.x + 1; x < L.x + L.w - 1; x++)
        if (g.world.canPlace(def, x, z, 0, 0, L).ok) {
          app.setLevel(0);
          app.look(x + 0.5, z + 0.5, 12);
          return { x, z, s: app.screenOf(x + 0.5, z + 0.5, 0) };
        }
    return null;
  }, lot);
  expect(spot).not.toBeNull();
  const placed = { lot, n0 };
  await page.mouse.move(spot!.s.x, spot!.s.y);
  await page.waitForTimeout(200);
  await page.mouse.click(spot!.s.x, spot!.s.y);
  await page.waitForTimeout(300);
  const after = await page.evaluate((lot) => ({ funds: (window as any).__rl.g.hh.funds, n: (window as any).__rl.g.world.objsOnLot(lot).length }), placed.lot);
  expect(after.n).toBe(placed.n0 + 1);
  expect(after.funds).toBeLessThan(before.funds);
  // ungültig: dieselbe Stelle noch einmal → blockiert
  await page.mouse.click(spot!.s.x, spot!.s.y);
  await page.waitForTimeout(300);
  const again = await page.evaluate((lot) => (window as any).__rl.g.world.objsOnLot(lot).length, placed.lot);
  expect(again).toBe(after.n);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.evaluate(() => (window as any).__rl.saveNow(true));
  await page.goto('/ricolife/?e2e=1&load=3');
  await ready(page);
  const reloaded = await page.evaluate((lot) => ({ funds: (window as any).__rl.g.hh.funds, n: (window as any).__rl.g.world.objsOnLot(lot).length }), placed.lot);
  expect(reloaded).toEqual(after);
  expect(errors).toEqual([]);
});

test('D: Bewohner ansprechen → Beziehung steigt → bleibt im Spielstand; Stadtbewohner haben Tagesablauf', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await quick(page);
  const r = await page.evaluate(() => {
    const app = (window as any).__rl;
    const g = app.g;
    g.settings.autonomy = 0;
    const s = g.active;
    for (const a of s.queue) a.phase = 'done';
    const other = [...g.sims.values()].find((x: any) => x.npc && g.isAdult(x) && !x.away && !g.peekRel(s.id, x.id)?.met);
    delete other.trip;
    other.queue = [];
    other.x = s.x + 1.2;
    other.z = s.z;
    other.l = s.l;
    other.loc = g.hh.lot;
    other.visit = { lot: g.hh.lot, until: g.clock.min + 600 };
    other.rt.spawned = true;
    return { id: other.id };
  });
  await advance(page, 1);
  const p = await page.evaluate((id) => {
    const app = (window as any).__rl;
    const o = app.g.sims.get(id);
    app.look(o.x, o.z, 10);
    return app.screenOf(o.x, o.z, 1);
  }, r.id);
  // Figur erst antippen, wenn sie gezeichnet ist (Software-Grafik braucht ein paar Bilder)
  await page.waitForFunction((id) => (window as any).__rl.sv.humans.has(id), r.id);
  await click(page, p);
  await expect(page.locator('.pie')).toBeVisible();
  await page.locator('.pie .it', { hasText: 'Vorstellen' }).click();
  // der Gast läuft evtl. noch herum: bis zu 90 Spielminuten warten
  for (let i = 0; i < 6; i++) {
    await advance(page, 15);
    if (await page.evaluate((id) => !!(window as any).__rl.g.peekRel((window as any).__rl.g.activeSim, id)?.met, r.id)) break;
  }
  const rel = await page.evaluate((id) => (window as any).__rl.g.peekRel((window as any).__rl.g.activeSim, id), r.id);
  expect(rel.met).toBe(true);
  expect(rel.f).toBeGreaterThan(0);
  await page.evaluate(() => (window as any).__rl.saveNow(true));
  await page.goto('/ricolife/?e2e=1&load=3');
  await ready(page);
  const rel2 = await page.evaluate((id) => (window as any).__rl.g.peekRel((window as any).__rl.g.activeSim, id), r.id);
  expect(rel2.f).toBe(rel.f);
  expect(rel2.h.length).toBeGreaterThan(0);
  // Tagesablauf: Stadtbewohner wechseln über einen Tag ihren Aufenthaltsort
  const moved = await page.evaluate(() => {
    const app = (window as any).__rl;
    const g = app.g;
    const town = [...g.sims.values()].filter((s: any) => s.npc && !s.hh);
    const before = new Map(town.map((s: any) => [s.id, `${s.loc}|${s.away?.kind ?? ''}`]));
    app.look(110, 60, 30); // anderer Stadtteil (Hafen)
    app.advance(60 * 12);
    return town.filter((s: any) => before.get(s.id) !== `${s.loc}|${s.away?.kind ?? ''}`).length;
  });
  expect(moved).toBeGreaterThan(5);
  expect(errors).toEqual([]);
});

test('E: Zeitraffer → Arbeitsbeginn → Lohn auf dem Konto → Alterung', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await quick(page);
  const s0 = await page.evaluate(() => {
    const g = (window as any).__rl.g;
    const s = g.members().find((m: any) => g.isAdult(m) && m.career);
    return { id: s?.id, career: s?.career?.id, funds: g.hh.funds, ageDays: s?.ageDays, day: g.clock.day };
  });
  expect(s0.id).toBeTruthy();
  await page.click('#hud .spd button:nth-child(4)');
  expect((await G(page)).speed).toBe(3);
  await advance(page, 60 * 24 * 2);
  const s1 = await page.evaluate((id) => {
    const g = (window as any).__rl.g;
    const s = g.sims.get(id);
    return { funds: g.hh.funds, shifts: s.career.shifts, ageDays: s.ageDays, day: g.clock.day, paid: g.hh.ledger.filter((t: any) => t.a > 0).length };
  }, s0.id);
  expect(s1.day).toBe(s0.day + 2);
  expect(s1.shifts).toBeGreaterThan(0);
  expect(s1.paid).toBeGreaterThan(0);
  expect(s1.ageDays).toBeGreaterThan(s0.ageDays);
  expect(errors).toEqual([]);
});

test('F: Handy hoch/quer – Start, Auswahl, 3D-Tippen, Bauen, keine Scrollfalle', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'nur Handy-Projekte');
  const errors = watchErrors(page);
  await quick(page);
  await noHorizontalScroll(page);
  // alle HUD-Knöpfe sichtbar und im Bild
  for (const id of ['#btnMenu', '#btnBuy', '#btnBuild', '#btnPhone', '#btnMap', '#hud .money']) {
    const b = await page.locator(id).boundingBox();
    expect(b, id).not.toBeNull();
    const vp = page.viewportSize()!;
    expect(b!.x + b!.width).toBeLessThanOrEqual(vp.width + 1);
    expect(b!.y + b!.height).toBeLessThanOrEqual(vp.height + 1);
  }
  await shot(page, `mobile-hud-${info.project.name}`);
  const fridge = await page.evaluate(() => (window as any).__rl.g.objsWith((window as any).__rl.g.hh.lot, 'fridge')[0].id);
  await click(page, await objScreen(page, fridge), true);
  await expect(page.locator('.pie')).toBeVisible();
  await page.locator('.pie h3 button').tap();
  await page.click('#btnBuild');
  await expect(page.locator('.bm-panel, .buildbar').first()).toBeVisible();
  await noHorizontalScroll(page);
  await shot(page, `mobile-build-${info.project.name}`);
  await page.click('#btnBuild');
  expect(errors).toEqual([]);
});

test('G: Controller – Pause, Fokus, Zurück', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.addInitScript(() => {
    const pad = { connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })), id: 'Test-Pad', index: 0 };
    (window as any).__pad = pad;
    Object.defineProperty(navigator, 'getGamepads', { value: () => [pad] });
  });
  const errors = watchErrors(page);
  await quick(page);
  const press = async (i: number): Promise<void> => {
    await page.evaluate((b) => ((window as any).__pad.buttons[b].pressed = true), i);
    await page.waitForTimeout(500);
    await page.evaluate((b) => ((window as any).__pad.buttons[b].pressed = false), i);
    await page.waitForTimeout(500);
  };
  await press(9); // Start → Pausemenü
  await expect(page.locator('#pResume')).toBeVisible();
  await press(13); // Fokus weiter
  const focused = await page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent);
  expect(focused).toBeTruthy();
  await press(1); // B schließt
  await expect(page.locator('#pResume')).toHaveCount(0);
  await press(5); // RB nächste Figur
  await press(15); // Tempo hoch
  expect(errors).toEqual([]);
});

test('H: Offline nach dem ersten Besuch, Speichern ohne Netz', async ({ page, context }, info) => {
  desktopOnly(info.project.name);
  await page.goto('/ricolife/');
  await expect(page.locator('#mNew')).toBeVisible({ timeout: 45_000 });
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    return !!r.active;
  });
  await page.reload();
  await expect(page.locator('#mNew')).toBeVisible({ timeout: 45_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#mNew')).toBeVisible({ timeout: 45_000 });
  await page.goto('/ricolife/?new=hh-sonnberg');
  await ready(page);
  const ok = await page.evaluate(() => {
    const k = Object.keys(localStorage).filter((x) => x.startsWith('ricolife.save.'));
    return k.length;
  });
  expect(ok).toBeGreaterThan(0);
  await context.setOffline(false);
});

test('I: Einbettung in der easygames-Übersicht', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.goto('/index.html');
  const tile = page.locator('img[src*="ricolife/card.svg"]').first();
  await expect(tile).toBeVisible({ timeout: 20_000 });
  await tile.click();
  const frame = page.frameLocator('iframe').first();
  await expect(frame.locator('#mNew')).toBeVisible({ timeout: 60_000 });
  await expect(frame.locator('.tagline')).toContainText('Dein Leben');
});

test('J: neue Service-Worker-Fassung → Hinweis, Spielstand bleibt', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.goto('/ricolife/?new=hh-sonnberg');
  await ready(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });
  // neue Fassung direkt im ausgelieferten Ordner simulieren (Service-Worker-Abrufe laufen am Seiten-Routing vorbei)
  const swFile = new URL('../../ricolife/sw.js', import.meta.url);
  const orig = readFileSync(swFile, 'utf8');
  writeFileSync(swFile, orig.replace(/eg-ricolife-v\d+/, 'eg-ricolife-v999'));
  try {
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    await expect(page.locator('#egUpdate')).toBeVisible({ timeout: 30_000 });
  } finally {
    writeFileSync(swFile, orig);
  }
  await expect(page.locator('#egUpdate')).toContainText('Neue Version verfügbar – Jetzt aktualisieren');
  const before = await page.evaluate(() => localStorage.getItem('ricolife.save.3')?.length ?? 0);
  expect(before).toBeGreaterThan(0);
});

test('K: Fehlerfälle – ungültige Importdatei, Cloud offline, kein WebGL', async ({ page, browser }, info) => {
  desktopOnly(info.project.name);
  // Cloud-Skript blockiert → Spiel startet trotzdem
  await page.route('**/cloud/anmacha-cloud.js', (r) => r.abort());
  await boot(page);
  await page.click('#mLoad');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('[data-slot="2"] >> text=Importieren').click();
  const fc = await chooser;
  await fc.setFiles({ name: 'kaputt.json', mimeType: 'application/json', buffer: Buffer.from('{"game":"anderes"}') });
  await expect(page.locator('.toast').last()).toContainText('Import fehlgeschlagen');
  await expect(page.locator('#mNew')).toBeVisible();
  // ohne WebGL: klare Meldung statt endlosem Laden
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, t: string, ...a: unknown[]) {
      if (/webgl/.test(t)) return null;
      return (orig as any).call(this, t, ...a);
    } as any;
  });
  await p2.goto('/ricolife/?e2e=1');
  await expect(p2.locator('#err')).toContainText('WebGL', { timeout: 30_000 });
  await ctx.close();
});

test('L: Haus mit Treppe – Wege zu Küche und Obergeschoss vor und nach dem Speichern', async ({ page }, info) => {
  desktopOnly(info.project.name);
  const errors = watchErrors(page);
  await quick(page);
  const go = async (): Promise<{ kitchen: boolean; upstairs: boolean }> =>
    page.evaluate(() => {
      const app = (window as any).__rl;
      const g = app.g;
      g.settings.autonomy = 0;
      const s = g.members().find((m: any) => g.isAdult(m));
      for (const a of s.queue) a.phase = 'done';
      app.advance(1);
      const fridge = g.objsWith(g.hh.lot, 'fridge')[0];
      g.queueAction(s, 'snack', { user: true, obj: fridge.id });
      let kitchen = false;
      for (let i = 0; i < 90 && !kitchen; i++) {
        app.advance(1);
        kitchen = s.rt.anim === 'eatStand' || (g.stats['int:eat'] ?? 0) > 0 && s.queue.length === 0;
      }
      // Obergeschoss: freie Zelle auf Etage 1 des eigenen Grundstücks
      const L = g.world.lotAt(fridge.x, fridge.z);
      let target: any = null;
      for (let z = L.z; z < L.z + L.d && !target; z++) for (let x = L.x; x < L.x + L.w && !target; x++) if (g.world.cellWalkable(1, x, z)) target = { x: x + 0.5, z: z + 0.5 };
      if (!target) return { kitchen, upstairs: false };
      for (const a of s.queue) a.phase = 'done';
      app.advance(1);
      g.queueAction(s, 'walkHere', { user: true, data: { x: target.x, z: target.z, l: 1 } });
      let up = false;
      for (let i = 0; i < 120 && !up; i++) {
        app.advance(1);
        up = s.l === 1;
      }
      return { kitchen, upstairs: up };
    });
  const a = await go();
  expect(a.kitchen).toBe(true);
  expect(a.upstairs).toBe(true);
  await page.evaluate(() => (window as any).__rl.saveNow(true));
  await page.goto('/ricolife/?e2e=1&load=3');
  await ready(page);
  const b = await go();
  expect(b).toEqual(a);
  // Nachtbild
  await page.evaluate(() => {
    const g = (window as any).__rl.g;
    g.clock.min = Math.floor(g.clock.min / 1440) * 1440 + 22 * 60 + 30;
  });
  await page.waitForTimeout(1200);
  await shot(page, 'live-night');
  expect(errors).toEqual([]);
});

test('M: Mehrspieler – Gast tritt per Code bei, Befehl und Chat kommen an', async ({ browser }, info) => {
  desktopOnly(info.project.name);
  test.skip(!!process.env.RL_OFFLINE, 'ohne Internet');
  const host = await (await browser.newContext()).newPage();
  await host.goto('/ricolife/?e2e=1&new=hh-sonnberg');
  await ready(host);
  await host.evaluate(() => (window as any).__rl.startHost(() => undefined));
  await host.waitForFunction(() => (window as any).__rl.host?.code, null, { timeout: 30_000 });
  const code = await host.evaluate(() => (window as any).__rl.host.code as string);
  const guest = await (await browser.newContext()).newPage();
  await boot(guest);
  await guest.click('#mMulti');
  await guest.fill('#mpJoinCode', code);
  await guest.click('#mpJoin');
  await ready(guest);
  await expect(guest.locator('#chat')).toBeVisible();
  const you = await guest.evaluate(() => (window as any).__rl.guest.you as string);
  await guest.fill('#chat input', 'Hallo!');
  await guest.keyboard.press('Enter');
  await guest.evaluate(() => {
    const g = (window as any).__rl.g;
    (window as any).__rl.guest.command('snack', g.objsWith(g.hh.lot, 'fridge')[0].id);
  });
  await expect(host.locator('#chat')).toContainText('Hallo!');
  await host.waitForFunction((id) => {
    const s = (window as any).__rl.g.sims.get(id);
    return s && s.queue.some((a: any) => a.def === 'snack');
  }, you, { timeout: 15_000 });
  await shot(guest, 'multiplayer-guest');
});
