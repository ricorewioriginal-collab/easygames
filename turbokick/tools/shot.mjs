/* Bildschirmfoto einer Seite des Entwicklungsservers (Playwright, Software-GL).
   Aufruf: node tools/shot.mjs "<abfrage z. B. ?lab=arena&theme=neon>" <ausgabe.png> [breite=1000] [hoehe=600] [warten-ms=2500] [port=5181]
   Die Seite meldet Fehler/Bildzähler über window.__lab = { errors: string[], frames: number }. */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [query = '', out = '/tmp/shot.png', w = '1000', h = '600', wait = '2500', port = '5181'] =
  process.argv.slice(2);
const b = await chromium.launch({
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: Number(w), height: Number(h) } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => {
  if (m.type() === 'error' && !/GL Driver|GPU stall|swiftshader/i.test(m.text()))
    errs.push(m.text().slice(0, 300));
});
await p.goto(`http://localhost:${port}/${query}`);
await p
  .waitForFunction(() => window.__lab && window.__lab.frames > 5, null, { timeout: 60000 })
  .catch(() => errs.push('Kein window.__lab.frames > 5'));
await p.waitForTimeout(Number(wait));
await p.screenshot({ path: out });
const lab = await p.evaluate(() =>
  window.__lab ? { errors: window.__lab.errors, frames: window.__lab.frames } : null,
);
console.log(JSON.stringify({ lab, pageErrors: errs }));
await b.close();
