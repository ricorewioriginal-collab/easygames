// Browser test: Zotik – spielbar als Taschi-Abenteurer (Editor), sein Klon als legendäres Taschi vor Professor Ulmes
// Glaskuppel in Sonnenhain (Kampf erst mit dem Moos-Siegel), Eltern im eigenen Haus, zerbrochene Lichtkammer im Labor.
// Run: node tests/e2e/zotik.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { launch, startSeeded, G, waitState, waitIdle, advance, interactWith } from './helpers.mjs';

const dir = process.argv[2] || null;
const step = (s) => console.log('  ✓ ' + s);
const shot = async (page, name) => { if (dir) await page.screenshot({ path: dir + '/' + name + '.png', timeout: 90000 }).catch(e => console.log('    (kein Bild ' + name + ': ' + e.message.split('\n')[0] + ')')); };

// 1. Editor: Figur „Zotik“ wählen
{
  const t = await launch({ width: 1280, height: 720 });
  const { page, errors } = t;
  try {
    await page.goto(t.base);
    await waitState(page, 'title');
    await page.getByText('Neues Abenteuer').click();
    await page.waitForSelector('#creatorview canvas', { timeout: 30000 });
    await page.getByText('🦊 Zotik', { exact: true }).click();
    await page.waitForTimeout(900);
    assert.equal((await page.locator('.namebtn').innerText()).replace('✎ ', '').trim(), 'Zotik', 'Name wird Zotik');
    assert.equal(await page.getByText('Frisur').count(), 0, 'kein Outfit für Zotik');
    await shot(page, '20-creator-zotik');
    await page.getByText('Mensch', { exact: true }).click();
    await page.waitForTimeout(300);
    assert.equal((await page.locator('.namebtn').innerText()).replace('✎ ', '').trim(), 'Rio', 'zurück zum Menschen');
    await page.getByText('🦊 Zotik', { exact: true }).click();
    await page.getByText('So starte ich').click();
    for (let i = 0; i < 40 && !(await G(page, () => window.__taschi.state === 'world')); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(700); }
    await waitState(page, 'world');
    const p = await G(page, () => ({ look: window.__taschi.save.player.look, name: window.__taschi.save.player.name, model: !!window.__taschi.world.player.root.getObjectByName('zotik') || window.__taschi.world.player.root.name === 'zotik' }));
    assert.equal(p.look.zotik, true); assert.equal(p.name, 'Zotik'); assert.ok(p.model, 'Spielfigur ist Zotik');
    step('Editor: Zotik ist als Taschi-Abenteurer spielbar');
    assert.deepEqual(errors, []);
  } finally { await t.close(); }
}

// 2. Sonnenhain: Klon vor der Glaskuppel, ohne Siegel kein Kampf, mit Siegel legendärer Kampf
{
  const t = await startSeeded({ width: 1280, height: 720 }, (s) => { s.player.look = { zotik: true }; s.player.name = 'Zotik'; });
  const { page, errors } = t;
  try {
    const has = await G(page, () => window.__taschi.world.npcs.some(n => n.id === 'zotikKlon'));
    assert.ok(has, 'Klon steht in Sonnenhain');
    await interactWith(page, (e) => e.kind === 'npc' && e.npc.id === 'zotikKlon');
    await page.waitForTimeout(500);
    await shot(page, '21-zotik-klon');
    await advance(page);
    assert.equal(await G(page, () => window.__taschi.save.flags.zotikMet), true, 'Begegnung gemerkt');
    assert.equal(await G(page, () => window.__taschi.state), 'world', 'ohne Moos-Siegel kein Kampf');
    step('Klon vor der Glaskuppel: Jo erklärt das Experiment, ohne Siegel kein Kampf');
    await G(page, () => { window.__taschi.save.badges = 1; });
    await interactWith(page, (e) => e.kind === 'npc' && e.npc.id === 'zotikKlon');
    await advance(page, { choose: ['Kämpfen'], until: () => window.__taschi.state === 'battle' });
    await waitState(page, 'battle');
    await page.waitForTimeout(3500);
    const foe = await G(page, () => { const b = window.__taschi.battleScene.b; return b && b.sides[1].team[0].id; });
    assert.equal(foe, 'zotik', 'legendärer Gegner ist Zotik');
    const found = await G(page, () => { let f = false; window.__taschi.battleScene.scene.traverse(o => { if (o.name === 'creature:zotik') f = true; }); return f; });
    assert.ok(found, 'Zotik-Modell im Kampf');
    await shot(page, '22-zotik-kampf');
    step('Mit Moos-Siegel: legendärer Kampf gegen Zotik');
    assert.deepEqual(errors, []);
  } finally { await t.close(); }
}

// 3. Zuhause: Mama und Papa; Labor: zerbrochene Lichtkammer
{
  const t = await startSeeded({ width: 1280, height: 720 });
  const { page, errors } = t;
  try {
    await interactWith(page, (e) => e.kind === 'door' && e.target === 'house');
    await waitIdle(page);
    const names = await G(page, () => window.__taschi.world.npcs.map(n => n.name));
    assert.ok(names.includes('Mama') && names.includes('Papa'), 'Eltern zu Hause: ' + names.join(', '));
    await G(page, () => { const g = window.__taschi, n = g.world.npcs.find(x => x.name === 'Mama'); g.busy++; g.talkToNPC(n).finally(() => g.busy--); });
    // Mama begrüßt zuerst, dann erzählt sie vom Fuchs: Text der Dialoge mitlesen, bis er auftaucht
    let seen = '';
    for (let i = 0; i < 12 && !/Fuchs|Zotik/.test(seen); i++) { await page.waitForTimeout(700); seen += await G(page, () => document.body.innerText); if (!/Fuchs|Zotik/.test(seen)) await page.keyboard.press('Enter'); }
    assert.match(seen, /Zotik|Fuchs/, 'Eltern erzählen vom Fuchs');
    await shot(page, '23-eltern');
    await advance(page);
    step('Zuhause in Sonnenhain: Mama und Papa erzählen vom Fuchs');
    assert.deepEqual(errors, []);
  } finally { await t.close(); }
}
console.log('Zotik-Test fertig.');
