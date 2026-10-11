/* Foto eines Bretts im Welten-Labor: node tools/world-shot.mjs <layout-id> <ausgabe.png> [query z. B. &yaw=120&pitch=20&dist=1&phase=1&q=low] – Entwicklungsserver auf Port 5180 muss laufen. */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [id, out, extra = ""] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
await p.goto(`http://localhost:5180/?worldlab=${id}${extra}`);
await p.waitForFunction(() => window.__worldlab && window.__worldlab.frames > 5, null, { timeout: 40000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: out });
console.log(JSON.stringify({ errs: errs.filter((e) => !/GL Driver|GPU stall/.test(e)) }));
await b.close();
