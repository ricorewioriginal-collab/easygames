// Prüfung mit Testpilot spielen: node tests/trial-runner.cjs <id> [dschungel|studio] [Breite] [Höhe] [shot-Sekunden]
// Server muss in der Repo-Wurzel auf Port 8080 laufen (z. B. python3 -m http.server 8080)
const { chromium } = require('playwright');
(async () => {
  const [id = 'kisten', theme = 'dschungel', w = 1100, h = 620, shotAt = 6, out = ''] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const t0 = Date.now();
  await p.goto(`http://localhost:8080/anmacha-urwaldlager/index.html?trial=${id}&theme=${theme}&bot=1`);
  await p.waitForTimeout(+shotAt * 1000);
  if (out) await p.screenshot({ path: out });
  const r = await p.waitForFunction('window.TRIAL_RESULT', null, { timeout: 900000 }).then(x => x.jsonValue()).catch(() => null);
  console.log(JSON.stringify({ id, theme, result: r, sec: Math.round((Date.now() - t0) / 1000), errors: errs.filter(e => !/GL Driver|favicon|404/.test(e)).slice(0, 8) }));
  await b.close();
})();
