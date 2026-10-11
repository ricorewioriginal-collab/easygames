/* End-to-End-Test für „Online ohne Server": Zwei Browser-Seiten (Gastgeber + Gast) verbinden sich über Text-Codes,
   starten eine Partie und spielen sie mit einem Klick-Roboter bis zum Finale. Aufruf: node tools/p2p-e2e.mjs [port=5180] [layout=prismara-04] */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [port = '5180', layout = 'prismara-04'] = process.argv.slice(2);
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
  await p.evaluate(
    (l) =>
      window.__app.store.update((d) => {
        d.lastSetup.layoutId = l;
        d.lastSetup.rounds = 1;
        d.settings.useStun = false;
      }),
    layout,
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
await host.waitForFunction(() => document.querySelectorAll('.prow').length >= 2, null, { timeout: 40000 });
console.log('Gast ist in der Lobby (Host sieht 2 Spieler)');
await guest.waitForSelector('button:has-text("Ich bin bereit")', { timeout: 20000 });
await click(guest, 'Ich bin bereit');
await host.waitForFunction(
  () => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Spiel starten'));
    return b && !b.disabled;
  },
  null,
  { timeout: 20000 },
);
await click(host, 'Spiel starten');
await host.waitForSelector('.hud', { timeout: 30000 });
await guest.waitForSelector('.hud', { timeout: 30000 });
console.log('Beide Seiten zeigen das Spiel');
const robot = (p) =>
  p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    if (q('.finale')) return 'finale';
    if (q('.mg-hud')) return 'playing';
    if (q('.mgflow .count')) return 'count';
    const hot = q('.cover .btn.hot');
    if (hot) {
      hot.click();
      return 'cover';
    }
    const dlg = [...document.querySelectorAll('.dialog .btn:not(:disabled)')];
    if (dlg.length) {
      dlg[0].click();
      return 'dialog';
    }
    const roll = q('.actions .roll');
    if (roll) {
      roll.click();
      return 'roll';
    }
    const g = q('.actions .btn.good');
    if (g) {
      g.click();
      return 'branch';
    }
    return 'wait';
  });
const t0 = Date.now();
let last = '';
let done = 0;
while (Date.now() - t0 < 420000 && done < 2) {
  let sh = 'x',
    sg = 'x';
  try {
    sh = await robot(host);
    sg = await robot(guest);
  } catch {
    /* Seite lädt neu */
  }
  const key = sh + '/' + sg;
  if (key !== last) {
    last = key;
    console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', key);
  }
  done = (sh === 'finale' ? 1 : 0) + (sg === 'finale' ? 1 : 0);
  await host.waitForTimeout(400);
}
await host.screenshot({ path: '/tmp/p2p-host.png' });
await guest.screenshot({ path: '/tmp/p2p-guest.png' });
console.log(done === 2 ? 'ERFOLG: beide Seiten haben das Finale erreicht' : 'FEHLER: Finale nicht erreicht');
console.log(JSON.stringify({ errs }));
await b.close();
process.exit(done === 2 ? 0 : 1);
