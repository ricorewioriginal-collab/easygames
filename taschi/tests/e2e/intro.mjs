// Browser test: complete new-game start (title → slot → creator → intro →
// Sonnenhain → Professor Ulme → starter ceremony → first battle → first quest),
// then heal centre, shop, wild battle with capture, save + reload.
import { launch, waitState, advance, teleport, interactWith, G } from './helpers.mjs';
import { strict as assert } from 'node:assert';

export async function run({ shots = null, width = 1280, height = 720, touch = false } = {}) {
  const t = await launch({ width, height, touch });
  const { page, errors } = t;
  const shot = async (name) => { if (shots) await page.screenshot({ path: shots + '/' + name + '.png' }); };
  const steps = [];
  const step = (s) => { steps.push(s); console.log('  ✓ ' + s); };
  try {
    await page.goto(t.base);
    await waitState(page, 'title');
    await shot('01-title');
    step('Lade- und Titelbildschirm');
    await page.getByText('Neues Abenteuer').click();
    await page.waitForSelector('#creatorview canvas', { timeout: 30000 });
    await page.getByText('Weiblich', { exact: true }).click();
    await page.locator('input.name').fill('Testi');
    await page.waitForTimeout(500);
    await shot('02-creator');
    await page.getByText('So starte ich').click();
    step('Charaktererstellung');
    for (let i = 0; i < 40 && !(await G(page, () => window.__taschi.state === 'loading' || window.__taschi.state === 'world')); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(700); }
    await waitState(page, 'world');
    await page.waitForTimeout(1500);
    await shot('03-sonnenhain');
    step('Start in Sonnenhain');
    assert.equal(await G(page, () => window.__taschi.save.player.name), 'Testi');
    // walk towards Ulme using real movement input for a moment
    const ulme = await G(page, () => { const n = window.__taschi.world.npcs.find(n => n.id === 'ulme'); return { x: n.ch.root.position.x, z: n.ch.root.position.z }; });
    await teleport(page, ulme.x + 5, ulme.z, -Math.PI / 2);
    await page.keyboard.down('w'); await page.waitForTimeout(1300); await page.keyboard.up('w');
    await page.waitForTimeout(400);
    const metAuto = await G(page, () => window.__taschi.ui.blocking);
    if (!metAuto) await interactWith(page, (e) => e.kind === 'npc' && e.npc.id === 'ulme');
    await shot('04-ulme');
    await advance(page);
    assert.ok(await G(page, () => window.__taschi.save.flags.metUlme), 'Ulme gesprochen');
    step('Spieler läuft selbst zu Professor Ulme, Dialog');
    // inspect a ball, decline, then choose Plätscherchen
    await interactWith(page, (e) => e.kind === 'starter' && e.idx === 0);
    await page.waitForSelector('#starterview canvas');
    await page.waitForTimeout(700);
    await shot('05-starter-preview');
    await page.getByText('Anderen Ball ansehen').click();
    await page.waitForTimeout(300);
    await interactWith(page, (e) => e.kind === 'starter' && e.idx === 1);
    await page.waitForSelector('#starterview canvas');
    await page.getByText('Ich wähle').click();
    step('Taschibälle einzeln untersucht, Starter bestätigt');
    // dialogs → first battle
    await advance(page, { until: () => window.__taschi.state === 'battle' });
    await page.waitForTimeout(2500);
    await shot('06-battle-intro');
    await advance(page, { until: () => !!document.querySelector('.bact.fight') });
    await shot('07-battle-menu');
    let turns = 0;
    while (await G(page, () => window.__taschi.state === 'battle') && turns++ < 30) {
      if (await page.locator('.bact.fight').count()) { await page.locator('.bact.fight').first().click(); await page.waitForTimeout(200); const mv = page.locator('.bact.move:not(.disabled)'); if (await mv.count()) { await mv.first().click(); } }
      await advance(page, { max: 60, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') });
    }
    step('Einführungskampf');
    await advance(page);
    const s1 = await G(page, () => { const s = window.__taschi.save; return { team: s.team.map(m => m.id), flags: s.flags, balls: s.bag.taschiball }; });
    assert.deepEqual(s1.team, ['plaetscher']);
    assert.ok(s1.flags.firstQuest && s1.flags.firstBattle);
    assert.ok(s1.balls >= 10);
    step('Erster Auftrag, Reisebeginn');
    await page.waitForTimeout(2000);
    // heal centre
    await interactWith(page, (e) => e.kind === 'door' && e.target === 'heal');
    await page.waitForFunction(() => window.__taschi.world.current?.kind === 'heal' && !window.__taschi.busy);
    await page.waitForTimeout(800);
    await shot('08-heal-interior');
    await interactWith(page, (e) => e.kind === 'heal');
    await advance(page, { choose: ['Ja, bitte'] });
    step('Heilzentrum betreten und geheilt');
    await interactWith(page, (e) => e.kind === 'exit');
    await page.waitForFunction(() => window.__taschi.world.current?.type === 'region' && !window.__taschi.busy);
    // shop
    await interactWith(page, (e) => e.kind === 'door' && e.target === 'shop');
    await page.waitForFunction(() => window.__taschi.world.current?.kind === 'shop' && !window.__taschi.busy);
    await interactWith(page, (e) => e.kind === 'shop');
    await page.waitForSelector('.panel');
    const coins0 = await G(page, () => window.__taschi.save.coins);
    await page.locator('.row', { hasText: 'Trank' }).first().getByRole('button', { name: '×1', exact: true }).click();
    await page.waitForTimeout(200);
    await shot('09-shop');
    const coins1 = await G(page, () => window.__taschi.save.coins);
    assert.equal(coins0 - coins1, 30);
    await page.keyboard.press('Backspace');
    step('Laden: Kauf');
    await interactWith(page, (e) => e.kind === 'exit');
    await page.waitForFunction(() => window.__taschi.world.current?.type === 'region' && !window.__taschi.busy);
    // wild battle with capture (forced encounter); throws can fail, so a lost fight gets a fresh encounter
    let caught = false;
    for (let fightNo = 0; fightNo < 3 && !caught; fightNo++) {
    await G(page, () => { const g = window.__taschi; g.script(() => g.randomEncounter('grass')); });
    await waitState(page, 'battle');
    await advance(page, { until: () => !!document.querySelector('.bact.fight') });
    for (let k = 0; k < 25 && !caught; k++) {
      if (!(await G(page, () => window.__taschi.state === 'battle'))) break;
      // click in-page: a slow frame can swap the menu between locate and click
      const opened = await G(page, () => { document.querySelector('.bact.backbtn')?.click(); const b = document.querySelector('.bact.bag'); b?.click(); return !!b; });
      if (opened) { await page.waitForTimeout(200); await G(page, () => [...document.querySelectorAll('.bact.bag')].find(x => x.textContent.includes('Taschiball'))?.click()); }
      await advance(page, { max: 80, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') });
      caught = await G(page, () => window.__taschi.save.team.length + window.__taschi.save.box.length > 1);
    }
    await advance(page);
    }
    assert.ok(caught, 'wildes Taschi gefangen');
    step('Wilde Begegnung und Fangen');
    // pause menu tabs
    await page.keyboard.press('Escape');
    await page.waitForSelector('.tabs');
    for (const tab of ['Taschidex', 'Tasche', 'Quests', 'Karte', 'Trainer', 'Optionen', 'System']) { await page.locator('.tab', { hasText: tab }).click(); await page.waitForTimeout(250); if (tab === 'Karte') await shot('10-menu-map'); }
    await page.locator('.tab', { hasText: 'Team' }).click();
    await page.waitForTimeout(300);
    await shot('11-menu-team');
    await page.keyboard.press('Escape');
    step('Pausemenü mit allen Reitern');
    // save and reload (browser restart simulation)
    await G(page, () => window.__taschi.saveNow(true));
    const before = await G(page, () => JSON.stringify({ team: window.__taschi.save.team.map(m => m.id), coins: window.__taschi.save.coins }));
    await page.reload();
    await waitState(page, 'title');
    await page.getByText('Fortsetzen').click();
    await waitState(page, 'world');
    const after = await G(page, () => JSON.stringify({ team: window.__taschi.save.team.map(m => m.id), coins: window.__taschi.save.coins }));
    assert.equal(after, before);
    step('Speichern, Neuladen, Fortsetzen');
    assert.deepEqual(errors, []);
    step('Keine Browserfehler');
    return steps;
  } catch (e) {
    await shot('zz-failure').catch(() => {});
    console.error('Fehler-Logs:', errors.slice(0, 10));
    throw e;
  } finally { await t.close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) run({ shots: process.argv[2] || null }).then(() => console.log('OK')).catch(e => { console.error(e); process.exit(1); });
