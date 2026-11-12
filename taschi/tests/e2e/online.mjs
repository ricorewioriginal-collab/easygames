// Browsertest: Online-Tausch und Online-Kampf zwischen zwei echten Spielinstanzen.
// Die Verbindung (sonst fire-peer.js/WebRTC) ersetzt hier ein kleiner Peer-Nachbau,
// dessen Nachrichten der Test zwischen den beiden Seiten weiterreicht.
// Run: node tests/e2e/online.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { launch, seededStorage, waitState, waitIdle, G } from './helpers.mjs';

const dir = process.argv[2] || null;
const seed = (name, extra) => seededStorage((s, { makeMonster, rng }) => { s.player.name = name; s.badges = 2; s.team.push(makeMonster(extra, 14, rng)); s.dex[extra] = 2; });
const A = await launch({ width: 1280, height: 720, storage: await seed('Ana', 'glutzahn') });
const B = await launch({ width: 1280, height: 720, storage: await seed('Ben', 'samenling') });
const shot = async (t, name) => { if (dir) await t.page.screenshot({ path: dir + '/' + name + '.png', timeout: 90000 }); };

// Peer-Nachbau (PeerJS-Schnittstelle): Nachrichten gehen über window.__relay an die andere Seite
const FAKE = () => {
  const em = () => { const l = {}; return { on(e, f) { (l[e] ||= []).push(f); return this; }, emit(e, x) { for (const f of l[e] || []) f(x); } }; };
  const conns = {};
  class Conn { constructor(local, remote) { Object.assign(this, em()); this.local = local; this.peer = remote; this.open = false; conns[remote] = this; }
    send(d) { window.__relay(JSON.stringify({ k: 'data', from: this.local, to: this.peer, d })); } close() {} }
  class Peer { constructor(id) { Object.assign(this, em()); this.id = id || 'gast-' + Math.random().toString(36).slice(2, 7); window.__peer = this; setTimeout(() => this.emit('open', this.id), 50); }
    connect(id) { const c = new Conn(this.id, id); window.__relay(JSON.stringify({ k: 'connect', from: this.id, to: id })); return c; } destroy() {} reconnect() {} }
  window.__fromRelay = (s) => {
    const m = JSON.parse(s);
    if (m.k === 'connect') { const c = new Conn(m.to, m.from); window.__peer.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); window.__relay(JSON.stringify({ k: 'accept', from: m.to, to: m.from })); }, 30); }
    if (m.k === 'accept') { const c = conns[m.from]; c.open = true; c.emit('open'); }
    if (m.k === 'data') conns[m.from]?.emit('data', m.d);
  };
  window.TaschiPeer = Peer;
};
for (const [me, other] of [[A, B], [B, A]]) {
  await me.page.exposeFunction('__relay', (s) => other.page.evaluate((x) => window.__fromRelay(x), s).catch(() => {}));
  await me.page.addInitScript(FAKE);
}
const click = async (t, text, sel = 'button') => { const l = t.page.locator(sel, { hasText: text }).first(); await l.waitFor({ timeout: 30000 }); await l.dispatchEvent('click'); };
const choose = async (t, text) => { const l = t.page.locator('.choice', { hasText: text }).first(); await l.waitFor({ timeout: 30000 }); await t.page.waitForTimeout(300); await l.dispatchEvent('click'); };

try {
  for (const t of [A, B]) { await t.page.goto(t.base); await waitState(t.page, 'title'); }
  await shot(A, 'online-title');
  for (const t of [A, B]) { await t.page.getByText('Fortsetzen').click(); await waitState(t.page, 'world'); await waitIdle(t.page); }
  // A eröffnet über Menü › Team, B tritt mit dem Code bei
  await A.page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')));
  await click(A, '🌐 Online');
  await click(A, 'Raum eröffnen', '.row');
  await A.page.waitForSelector('.joincode');
  await A.page.waitForSelector('.qrbox svg', { timeout: 10000 });
  const code = (await A.page.textContent('.joincode')).trim();
  assert.match(code, /^[A-HJ-NP-Z2-9]{5}$/);
  assert.match(await A.page.textContent('.linktext'), /^https:\/\/ricorewioriginal-collab\.github\.io\/easygames\/taschi\/.*#join=/, 'Einladungslink zeigt auf die Homepage');
  await shot(A, 'online-room');
  B.page.evaluate((c) => window.__taschi.openOnline(c), code).catch(() => {});
  for (const t of [A, B]) await t.page.waitForSelector('text=Verbunden mit', { timeout: 20000 });
  console.log('verbunden', await B.page.evaluate(() => [window.__taschi.ui.stack.length, document.querySelector('.panel h2')?.textContent]));
  await shot(B, 'online-lobby');

  // ---- Tausch: A bietet Pelzlo, B bietet Samenling
  await click(A, 'Taschi tauschen', '.row');
  await choose(B, 'Annehmen');
  for (const t of [A, B]) await t.page.waitForSelector('.tradebox');
  await A.page.locator('.grid .card', { hasText: 'Pelzlo' }).first().dispatchEvent('click');
  await B.page.locator('.grid .card', { hasText: 'Samenling' }).first().dispatchEvent('click');
  await A.page.waitForFunction(() => document.querySelectorAll('.card.offer:not(.empty)').length === 2);
  await B.page.waitForFunction(() => document.querySelectorAll('.card.offer:not(.empty)').length === 2);
  await shot(A, 'online-trade');
  await click(A, 'Tausch bestätigen'); await click(B, 'Tausch bestätigen');
  for (const t of [A, B]) await t.page.waitForSelector('#tradeview', { timeout: 15000 });
  await A.page.waitForTimeout(900); await shot(A, 'online-trade-scene');
  for (const t of [A, B]) { await t.page.waitForSelector('.dlg', { hasText: 'Tausch geglückt', timeout: 15000 }); await t.page.keyboard.press('Enter'); }
  const ta = await G(A.page, () => window.__taschi.save.team.map(m => m.id + ':' + (m.ot || '')));
  const tb = await G(B.page, () => window.__taschi.save.team.map(m => m.id + ':' + (m.ot || '')));
  assert.ok(ta.includes('samenling:Ben') && !ta.some(x => x.startsWith('fellino')), 'A hat Samenling: ' + ta);
  assert.ok(tb.includes('fellino:Ana') && !tb.some(x => x.startsWith('samenling')), 'B hat Pelzlo: ' + tb);

  // ---- Kampf: B fordert heraus, A nimmt an
  for (const t of [A, B]) await t.page.waitForSelector('text=Verbunden mit', { timeout: 20000 });
  await click(B, 'Online-Kampf', '.row');
  await choose(A, 'Annehmen');
  for (const t of [A, B]) {
    await t.page.waitForSelector('text=Team für den Online-Kampf');
    for (let i = 0; i < 3; i++) { await t.page.locator('.grid .card').nth(i).dispatchEvent('click'); await t.page.waitForFunction((n) => document.body.textContent.includes('(' + n + '/3)'), i + 1); }
    await click(t, 'Bereit');
  }
  for (const t of [A, B]) await waitState(t.page, 'battle', 30000);
  // zwei Züge spielen: jeweils Kampf › erste Attacke
  const attack = async (t) => { const f = t.page.locator('.bact.fight', { hasText: 'Kampf' }).first(); await f.waitFor({ timeout: 90000 }); await f.dispatchEvent('click'); const m = t.page.locator('.bact.move').first(); await m.waitFor(); await m.dispatchEvent('click'); };
  for (let turn = 0; turn < 2; turn++) {
    await Promise.all([attack(A), attack(B)]);
    if (turn === 0) { await A.page.waitForSelector('.blog', { hasText: 'Warte auf' }).catch(() => {}); }
    await A.page.waitForTimeout(1500);
    if (turn === 0) { await shot(A, 'online-battle-host'); await shot(B, 'online-battle-guest'); }
  }
  // HP-Anzeigen beider Seiten stimmen überein (gespiegelt)
  await Promise.all([A, B].map(t => t.page.locator('.bact.fight', { hasText: 'Kampf' }).first().waitFor({ timeout: 90000 })));
  const hpA = await G(A.page, () => window.__taschi.battleScene.b.sides.map(s => s.team.map(m => m.hp)));
  const hpB = await G(B.page, () => window.__taschi.battleScene.b.sides.map(s => s.team.map(m => m.hp)));
  assert.deepEqual(hpA, [hpB[1], hpB[0]], 'beide sehen denselben Kampf');
  // B gibt auf
  await B.page.locator('.bact.run', { hasText: 'Aufgeben' }).dispatchEvent('click');
  await choose(B, 'Aufgeben');
  await B.page.waitForSelector('.blog', { hasText: 'Du gibst auf' }).catch(() => {});
  for (const t of [A, B]) await t.page.waitForSelector('text=Verbunden mit', { timeout: 60000 });
  assert.equal(await G(A.page, () => window.__taschi.save.stats.onlineWins), 1);
  assert.equal(await G(B.page, () => window.__taschi.save.stats.onlineBattles), 1);
  assert.equal(await G(A.page, () => window.__taschi.save.team[0].lv), 12, 'Kampf-Kopien ändern das Team nicht');
  // ---- Koop-Erkunden: A schlägt vor, B nimmt an; beide sehen sich in der Welt
  await click(A, 'Zusammen erkunden', '.row');
  await choose(B, 'Annehmen');
  for (const t of [A, B]) await t.page.waitForFunction(() => !!window.__taschi.coop && !window.__taschi.ui.blocking, null, { timeout: 20000 });
  await A.page.waitForFunction(() => window.__taschi.coop.ghost?.root.visible === true, null, { timeout: 20000 });
  await B.page.waitForFunction(() => window.__taschi.coop.ghost?.root.visible === true, null, { timeout: 20000 });
  await shot(A, 'online-coop');
  // Raid zu zweit: A lädt ein, B macht mit
  A.page.evaluate(() => { const g = window.__taschi; g.save.flags.firstQuest = true; import('./src/logic/raid.js').then(R => g.script(() => g.coop.inviteRaid(R.raidOf(g.save, 0)))); }).catch(() => {});
  await choose(B, 'Mitmachen');
  for (const t of [A, B]) await waitState(t.page, 'battle', 60000);
  const allies = await Promise.all([A, B].map(t => G(t.page, () => window.__taschi.battleScene.b.sides[0].team[1]?.ally || '')));
  assert.deepEqual(allies, ['Ben', 'Ana'], 'Freund kämpft als Helfer mit');
  await shot(A, 'online-raid');
  for (const t of [A, B]) {
    for (let i = 0; i < 12 && await G(t.page, () => window.__taschi.state === 'battle'); i++) { const run = t.page.locator('.bact.run'); if (await run.count()) await run.first().dispatchEvent('click'); await t.page.waitForTimeout(1500); await t.page.keyboard.press('Enter'); }
    await t.page.waitForFunction(() => window.__taschi.state === 'world', null, { timeout: 60000 });
  }
  await A.page.evaluate(() => window.__taschi.coop.end());
  await B.page.waitForFunction(() => !window.__taschi.coop, null, { timeout: 15000 });
  console.log('koop ok');
  // Trennen (Raum ist mit Koop-Ende schon zu)
  await B.page.waitForFunction(() => !window.__taschi.ui.blocking && window.__taschi.state === 'world', null, { timeout: 15000 });
  assert.deepEqual(A.errors, []); assert.deepEqual(B.errors, []);
  console.log('online ok');
} finally { await A.close(); await B.close(); }
