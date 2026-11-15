/* Erzeugt card.png (288×288) und logo.png (800×480) aus einem Spielfoto mit der NEXORB-Wortmarke.
   Aufruf: node tools/make-card.mjs <spielfoto.png> */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [shot] = process.argv.slice(2);
const bg = 'data:image/png;base64,' + readFileSync(shot).toString('base64');
const html = (w, h, fs) => `<!doctype html><style>
body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#07060f url(${bg}) center/cover;font-family:Bahnschrift,'Arial Narrow','Roboto Condensed',sans-serif}
.v{position:absolute;inset:0;background:linear-gradient(0deg,rgba(7,6,15,.92) 0%,rgba(7,6,15,.25) 55%,rgba(7,6,15,.5) 100%)}
.w{position:absolute;left:0;right:0;bottom:${Math.round(h * 0.1)}px;text-align:center;font-weight:900;font-size:${fs}px;letter-spacing:.14em;color:#fff;filter:drop-shadow(0 0 ${fs / 4}px rgba(162,77,255,.8))}
.w em{font-style:normal;background:linear-gradient(180deg,#fff3c4,#ffc23d 50%,#ff7d2e);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.o{display:inline-block;width:.78em;height:.78em;margin:0 .06em;vertical-align:-.04em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 8%,#ffd36b 22%,#ff8a2e 48%,#5b1aa8 80%,#12052a);box-shadow:0 0 ${fs / 3}px rgba(255,176,46,.8)}
</style><div class="v"></div><div class="w">NEX<span class="o"></span><em>RB</em></div>`;
const b = await chromium.launch();
for (const [w, h, fs, out] of [
  [288, 288, 50, 'card.png'],
  [800, 480, 120, 'logo.png'],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html(w, h, fs));
  await p.screenshot({ path: out });
  await p.close();
}
await b.close();
