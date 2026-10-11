/* End-to-End-Test „Online ohne Server": Gastgeber- und Gast-Seite verbinden sich über Text-Codes, starten eine Partie (1 Minute),
   steuern kurz und vergleichen Uhr/Spielstand. Aufruf: node tools/p2p-e2e.mjs [port=5181] */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [port = '5181'] = process.argv.slice(2);
const b = await chromium.launch({
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const errs = [];
async function open(label) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 560 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => {
    errs.push(label + ' PAGE ' + e.message);
    console.log(label, 'PAGEERROR', e.message);
  });
  p.on('console', (m) => {
    if (m.type() === 'error' && !/GL Driver|GPU stall|swiftshader/i.test(m.text())) {
      errs.push(label + ' ' + m.text().slice(0, 200));
      console.log(label, 'console.error', m.text().slice(0, 200));
    }
  });
  await p.goto(`http://localhost:${port}/`);
  await p.waitForSelector('.menu', { timeout: 60000 });
  await p.evaluate(() =>
    window.__app.store.update((d) => {
      d.lastSetup = { teamSize: 1, difficulty: 'normal', minutes: 1, arena: 'canyon', nitro: true };
      d.settings.useStun = false;
      d.settings.quality = 'low';
    }),
  );
  return p;
}
const host = await open('HOST');
const guest = await open('GAST');
const click = async (p, text) => {
  await p
    .locator(`button:has-text("${text}")`)
    .first()
    .evaluate((e) => e.click());
};
await host.evaluate(() => window.__app.go('p2p'));
await guest.evaluate(() => window.__app.go('p2p'));
await click(host, 'Raum erstellen');
await click(host, 'Mitspieler einladen');
await host.waitForSelector('textarea[readonly]', { timeout: 30000 });
const invite = await host.locator('textarea[readonly]').first().inputValue();
console.log('Einladungs-Code:', invite.length, 'Zeichen');
await click(guest, 'Raum beitreten');
await guest.locator('textarea').first().fill(invite);
await click(guest, 'Weiter');
await guest.waitForSelector('textarea[readonly]', { timeout: 30000 });
const answer = await guest.locator('textarea[readonly]').first().inputValue();
console.log('Antwort-Code:', answer.length, 'Zeichen');
await host.locator('.invite textarea:not([readonly])').first().fill(answer);
await click(host, 'Verbinden');
await guest.waitForSelector('button:has-text("Ich bin bereit")', { timeout: 40000 });
console.log('Gast ist in der Lobby');
await click(guest, 'Ich bin bereit');
await host.waitForFunction(
  () => {
    const x = [...document.querySelectorAll('button')].find((e) => e.textContent.includes('Spiel starten'));
    return x && !x.disabled;
  },
  null,
  { timeout: 20000 },
);
await click(host, 'Spiel starten');
await host.waitForSelector('.hud', { timeout: 40000 });
await guest.waitForSelector('.hud', { timeout: 40000 });
console.log('Beide Seiten zeigen das Spiel');
await host.waitForTimeout(6000);
await host.keyboard.down('w');
await guest.keyboard.down('w');
await guest.keyboard.down('Shift');
await host.waitForTimeout(6000);
await guest.keyboard.down('a');
await host.waitForTimeout(4000);
const read = (p) =>
  p.evaluate(() => ({
    clock: document.querySelector('.clock')?.textContent,
    score: [...document.querySelectorAll('.scorebar .team')].map((e) => e.textContent).join(':'),
    speed: document.querySelector('.speed b')?.textContent,
  }));
const cars = (pg) => pg.evaluate(() => window.__tk.session.state.cars.map((c) => ({ team: c.team, pos: c.pos.map((v) => +v.toFixed(1)), speed: +Math.hypot(...c.vel).toFixed(1) })));
console.log('Autos laut Gastgeber:', JSON.stringify(await cars(host)));
console.log('Autos laut Gast     :', JSON.stringify(await cars(guest)));
const a = await read(host);
const c = await read(guest);
console.log('Gastgeber', JSON.stringify(a), '| Gast', JSON.stringify(c));
await host.screenshot({ path: '/tmp/tk-p2p-host.png' });
await guest.screenshot({ path: '/tmp/tk-p2p-guest.png' });
const ok =
  !!a.clock &&
  !!c.clock &&
  a.score === c.score &&
  Math.abs(Number(a.clock.split(':')[1]) - Number(c.clock.split(':')[1])) <= 3;
console.log(ok ? 'ERFOLG: Uhr und Spielstand stimmen überein' : 'FEHLER: Abweichung');
console.log(JSON.stringify({ errs }));
await b.close();
process.exit(ok && !errs.length ? 0 : 1);
