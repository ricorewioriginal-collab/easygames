import { expect, test, type Page, type Route } from '@playwright/test';
import { city, newCity, tapTile, watchErrors } from './helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Nachbarn ohne echtes Firebase: das Cloud-Konto wird simuliert, Firestore-REST-Aufrufe beantwortet ein kleiner Speicher im Test.
// Die Sicherheitsregeln selbst prüft ricoville-src/firebase (Emulator); hier geht es um den Ablauf im Spiel.

type Doc = { fields: Record<string, any> };
const ROOT = 'projects/demo/databases/(default)/documents/';
const now = new Date();
const DAY = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
const val = (v: string | number | boolean) => (typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v } : { integerValue: String(v) });
const fields = (o: Record<string, string | number | boolean>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)]));
const plain = (d?: Doc) => Object.fromEntries(Object.entries(d?.fields ?? {}).map(([k, v]: [string, any]) => [k, v.stringValue ?? (v.integerValue !== undefined ? Number(v.integerValue) : v.booleanValue)]));

function fakeFirestore(page: Page) {
  const store = new Map<string, Doc>();
  const bobLayout = JSON.stringify({
    b: [['rathaus', 22, 22, 0, 1], ['haus_rot', 18, 26, 0, 1], ['haus_blau', 26, 26, 0, 1], ['acker', 17, 19, 0, 1], ['eiche', 25, 21, 0, 1]],
    r: [...Array.from({ length: 16 }, (_, i) => `${16 + i},25`), ...Array.from({ length: 9 }, (_, i) => `21,${16 + i}`)].join(';'),
    s: '2,2;3,2;2,3;3,3',
  });
  store.set('ricoville_cities/bob', { fields: fields({ v: 1, name: 'Bobhausen', crest: '🦊', slogan: 'Hallo!', level: 5, pop: 40, t: Date.now(), layout: bobLayout }) });
  store.set(`ricoville_cities/me/inbox/bob_${DAY}_gift`, { fields: fields({ from: 'bob', name: 'Bobhausen', type: 'gift', day: DAY, item: 'ziegel', done: false }) });
  store.set(`ricoville_cities/me/inbox/bob_${DAY}_visit`, { fields: fields({ from: 'bob', name: 'Bobhausen', type: 'visit', day: DAY, n: 3, done: false }) });
  const out = (path: string) => ({ name: ROOT + path, ...store.get(path)! });
  const handler = async (route: Route) => {
    const req = route.request();
    const u = new URL(req.url());
    const path = decodeURIComponent(u.pathname.split('/documents')[1] ?? '').replace(/^\//, '');
    const json = (status: number, body: unknown) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path.startsWith(':runQuery')) {
      const docs = [...store.keys()].filter((k) => /^ricoville_cities\/[^/]+$/.test(k)).sort((a, b) => plain(store.get(b)).t - plain(store.get(a)).t);
      return json(200, docs.map((k) => ({ document: out(k) })));
    }
    const depth = path.split('/').length;
    if (req.method() === 'GET') {
      if (depth % 2 === 0) return store.has(path) ? json(200, out(path)) : json(404, {});
      const docs = [...store.keys()].filter((k) => k.startsWith(path + '/') && k.split('/').length === depth + 1);
      return json(200, { documents: docs.map(out) });
    }
    if (req.method() === 'DELETE') {
      store.delete(path);
      return json(200, {});
    }
    if (req.method() === 'PATCH') {
      const body = req.postDataJSON() as Doc;
      if (u.searchParams.get('currentDocument.exists') === 'false' && store.has(path)) return json(409, {});
      const mask = u.searchParams.getAll('updateMask.fieldPaths');
      store.set(path, { fields: mask.length ? { ...store.get(path)?.fields, ...body.fields } : body.fields });
      return json(200, out(path));
    }
    return json(400, {});
  };
  return { store, plain, install: () => page.route('https://firestore.googleapis.com/**', handler) };
}

test('Nachbarn: finden, hinzufügen, besuchen, helfen, beschenken, Post annehmen', async ({ page, isMobile }) => {
  test.skip(test.info().project.name === 'mobile-landscape', 'Ablauf je einmal auf Desktop und Handy hochkant');
  const errs = watchErrors(page);
  await page.addInitScript(() => {
    const fake = { account: async () => ({ uid: 'me', name: 'Echter Google-Name', token: 'test', project: 'demo' }), signIn: async () => undefined, sync: () => Promise.resolve() };
    Object.defineProperty(window, 'AnMaChaCloud', { get: () => fake, set: () => undefined, configurable: false });
  });
  const fs = fakeFirestore(page);
  await fs.install();
  await newCity(page);

  // Die eigene Kurzansicht wird veröffentlicht: Stadtname, keine Münzen, nicht der Google-Name
  await expect.poll(() => fs.store.has('ricoville_cities/me')).toBe(true);
  const mine = fs.plain(fs.store.get('ricoville_cities/me'));
  expect(mine.name).toBe('Testhausen');
  expect(JSON.stringify(mine)).not.toMatch(/coins|Echter Google-Name/);

  // Post: 2 neue Nachrichten (Badge), Alles annehmen → Münzen und Ziegel
  await expect(page.locator('#tb-neighbors .badge')).toHaveText('2');
  const before = await city(page);
  await page.click('#tb-neighbors');
  await page.click('[data-tab="post"]');
  await page.click('#btn-claim-all');
  await expect.poll(async () => (await city(page)).inv.ziegel ?? 0).toBe(2);
  expect((await city(page)).coins).toBe(before.coins + 45);
  expect(fs.plain(fs.store.get(`ricoville_cities/me/inbox/bob_${DAY}_gift`)).done).toBe(true);
  expect(fs.plain(fs.store.get(`ricoville_cities/me/inbox/bob_${DAY}_visit`)).done).toBe(true);

  // Neue finden → Bobhausen hinzufügen (Bob bekommt ein „Hallo“)
  await page.click('[data-tab="find"]');
  await page.locator('[data-city="bob"] .btn.good').click();
  await expect.poll(() => fs.store.has('ricoville_cities/me/neighbors/bob')).toBe(true);
  await expect.poll(() => fs.store.has(`ricoville_cities/bob/inbox/me_${DAY}_hello`)).toBe(true);

  // Besuchen und an einem Haus helfen
  await page.click('[data-tab="mine"]');
  // Einladungslink zeigt immer auf die öffentliche Seite, egal von wo das Spiel geladen wurde (Apps: appassets.local)
  await expect(page.getByLabel('Einladungslink')).toHaveValue('https://ricorewioriginal-collab.github.io/easygames/ricoville/?nachbar=me');
  await page.locator('[data-neighbor="bob"] .btn', { hasText: 'Besuchen' }).click();
  await expect(page.locator('#visitbar')).toBeVisible();
  await expect(page.locator('#bar')).toBeHidden();
  const house = await page.evaluate(() => (window as any).__rv.app.visit.city.s.buildings.find((b: any) => b.def === 'haus_rot'));
  const coins = (await city(page)).coins;
  await tapTile(page, house.x, house.y, isMobile);
  await expect.poll(async () => (await city(page)).coins).toBe(coins + 10);
  await expect(page.locator('#visitbar')).toContainText('noch 4×');
  // Deko: kein Helfen
  const tree = await page.evaluate(() => (window as any).__rv.app.visit.city.s.buildings.find((b: any) => b.def === 'eiche'));
  await tapTile(page, tree.x, tree.y, isMobile);
  expect((await city(page)).coins).toBe(coins + 10);

  // Geschenk schicken
  await page.click('#btn-visit-gift');
  await page.click('[data-gift="bretter"]');
  await expect.poll(() => fs.store.has(`ricoville_cities/bob/inbox/me_${DAY}_gift`)).toBe(true);
  expect(fs.plain(fs.store.get(`ricoville_cities/bob/inbox/me_${DAY}_gift`)).item).toBe('bretter');
  await expect(page.locator('#btn-visit-gift')).toBeDisabled();

  // Heim: Bob erfährt vom Besuch (n = 1), die eigene Stadt ist wieder da und unverändert gespeichert
  await page.click('#btn-visit-home');
  await expect(page.locator('#bar')).toBeVisible();
  await expect.poll(() => fs.store.has(`ricoville_cities/bob/inbox/me_${DAY}_visit`)).toBe(true);
  expect(fs.plain(fs.store.get(`ricoville_cities/bob/inbox/me_${DAY}_visit`)).n).toBe(1);
  const home = await city(page);
  expect(home.name).toBe('Testhausen');
  expect(home.buildings.some((b: any) => b.def === 'rathaus')).toBe(true);
  const saved = await page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('ricoville.save.main') ?? '{}').city ?? '{}'));
  expect(saved.name).toBe('Testhausen');
  expect(errs).toEqual([]);
});

test('Nachbarn ohne Anmeldung: freundlicher Hinweis statt Fehler', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'einmal reicht');
  const errs = watchErrors(page);
  await newCity(page);
  await page.click('#tb-neighbors');
  await expect(page.locator('#btn-social-login')).toBeVisible();
  expect(errs).toEqual([]);
});
