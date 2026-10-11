// Gerätetest im echten Chromium (Playwright). Prüft Start, Spielbarkeit, Überlappungen der Bedienelemente,
// Layoutüberläufe, Dialog- und Menüsichtbarkeit in Desktop- und Smartphone-Viewports und misst Bildzeiten.
// WICHTIG: Chromium läuft hier headless mit SwiftShader (Software-Rendering). Die Messwerte sind KEINE
// Messungen auf echten Smartphone-GPUs, sondern nur Vergleichswerte zwischen Qualitätsstufen auf dieser Maschine.
// Start: node aeru/tests/browser.cjs   (Playwright muss installiert sein; CHROMIUM_PATH optional)
const path = require('node:path'), fs = require('node:fs'), url = require('node:url');
let chromium; try { ({chromium} = require('playwright')); } catch { console.log('SKIP: Playwright ist nicht installiert.'); process.exit(0); }
const out = path.join(__dirname, 'screenshots'); fs.mkdirSync(out, {recursive: true});
const page_url = url.pathToFileURL(path.resolve(__dirname, '../index.html')).href + '?test';
const VIEWPORTS = [
  {name: 'desktop-1920x1080', width: 1920, height: 1080},
  {name: 'desktop-1366x768', width: 1366, height: 768},
  {name: 'desktop-1280x720', width: 1280, height: 720},
  {name: 'phone-360x800', width: 360, height: 800, mobile: true},
  {name: 'phone-390x844', width: 390, height: 844, mobile: true},
  {name: 'phone-412x915', width: 412, height: 915, mobile: true},
  {name: 'phone-landscape-800x360', width: 800, height: 360, mobile: true},
  {name: 'phone-landscape-915x412', width: 915, height: 412, mobile: true}
];
// Sichtbare, feste Bedienelemente, die sich nicht überdecken dürfen.
const UI = ['#hud .brand', '#hud .stats', '#pause', '#quest', '#map', '#flightHud', '#stick', '#jump', '#attack', '#fly', '#dodge', '#talk', '#bossHud'];
async function layoutProblems(page, selectors) {
  return page.evaluate(sel => {
    const rects = [], problems = [], W = innerWidth, H = innerHeight;
    for (const s of sel) { const el = document.querySelector(s); if (!el) continue; const st = getComputedStyle(el); if (st.display === 'none' || st.visibility === 'hidden' || el.closest('[hidden]')) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; rects.push([s, r]); if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) problems.push(`${s} ragt aus dem Bild (${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)})`); }
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const [a, ra] = rects[i], [b, rb] = rects[j]; if (a.startsWith('#hud') && b.startsWith('#hud')) continue; const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (ox > 2 && oy > 2) problems.push(`${a} überlappt ${b}`); }
    if (document.documentElement.scrollWidth > W + 1) problems.push('horizontaler Überlauf');
    return problems;
  }, selectors);
}
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});
  const results = [], failures = [];
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({viewport: {width: vp.width, height: vp.height}, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(page_url); await page.waitForTimeout(800);
    const webgl = await page.evaluate(() => !document.querySelector('#graphicsNotice') || document.querySelector('#graphicsNotice').hidden);
    await page.screenshot({path: path.join(out, vp.name + '-title.png')});
    await page.click('#start'); await page.waitForTimeout(300); await page.evaluate(() => Promise.all(document.querySelector('#dialog').getAnimations().map(a => a.finished)));
    const dialogOk = await page.evaluate(() => { const r = document.querySelector('#dialog').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1; });
    await page.screenshot({path: path.join(out, vp.name + '-dialog.png')});
    await page.evaluate(() => { for (let i = 0; i < 20 && aeruTest.snapshot().mode === 'dialog'; i++) aeruTest.finishDialog(); }); await page.waitForTimeout(200);
    // Kurz laufen: echte Tasteneingabe bzw. Touch-Stick.
    const z0 = await page.evaluate(() => aeruTest.snapshot().state.z);
    if (vp.mobile) { const b = await page.locator('#stick').boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.dispatchEvent('#stick', 'pointerdown', {pointerId: 3, clientX: b.x + b.width / 2, clientY: b.y + 5, isPrimary: true}); await page.waitForTimeout(1200); await page.dispatchEvent('#stick', 'pointerup', {pointerId: 3}); }
    else { await page.keyboard.down('KeyW'); await page.waitForTimeout(1200); await page.keyboard.up('KeyW'); }
    const moved = z0 - await page.evaluate(() => aeruTest.snapshot().state.z);
    // Bildzeiten über drei Sekunden auf "Automatisch" und mit fester Stufe "Sparsam".
    await page.waitForTimeout(5000); const auto = await page.evaluate(() => aeruTest.perf());
    await page.evaluate(() => aeruTest.setQuality('sparsam')); await page.waitForTimeout(2500); const low = await page.evaluate(() => aeruTest.perf());
    await page.evaluate(() => aeruTest.setQuality('hoch')); await page.waitForTimeout(2500); const high = await page.evaluate(() => aeruTest.perf());
    await page.evaluate(() => aeruTest.setQuality('auto'));
    const playProblems = await layoutProblems(page, UI);
    await page.screenshot({path: path.join(out, vp.name + '-play.png')});
    await page.evaluate(() => aeruTest.pause()); await page.waitForTimeout(200);
    const pauseProblems = await page.evaluate(() => { const p = document.querySelector('#pauseMenu .panel').getBoundingClientRect(), r = []; if (p.width > innerWidth + 1) r.push('Pausenmenü breiter als Bild'); for (const b of document.querySelectorAll('#pauseMenu button:not([disabled])')) { const q = b.getBoundingClientRect(); if (q.width && q.height < 32) r.push('Knopf zu klein: ' + b.textContent.trim()); } return r; });
    await page.screenshot({path: path.join(out, vp.name + '-pause.png')});
    await page.click('#journalTabButton'); await page.waitForTimeout(100); await page.screenshot({path: path.join(out, vp.name + '-journal.png')});
    await page.click('#settingsTabButton'); await page.waitForTimeout(100); await page.screenshot({path: path.join(out, vp.name + '-settings.png')});
    const res = {viewport: vp.name, webgl, moved: +moved.toFixed(2), dialogOk, errors, problems: [...playProblems, ...pauseProblems],
      perf: {auto: pick(auto), sparsam: pick(low), hoch: pick(high)}};
    results.push(res);
    if (errors.length || res.problems.length || !dialogOk || moved < 1) failures.push(res);
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1));
  for (const r of results) console.log(`${r.viewport}: WebGL=${r.webgl} Bewegung=${r.moved} m Dialog=${r.dialogOk ? 'ok' : 'FEHLT'} | auto ${fmt(r.perf.auto)} | sparsam ${fmt(r.perf.sparsam)} | hoch ${fmt(r.perf.hoch)}${r.problems.length ? '\n   ' + r.problems.join('\n   ') : ''}${r.errors.length ? '\n   FEHLER ' + r.errors.join(' | ') : ''}`);
  if (failures.length) { console.log('FAIL: ' + failures.map(f => f.viewport).join(', ')); process.exit(1); }
  console.log('PASS browser: ' + results.length + ' Viewports ohne Überlappungen, Überläufe oder Fehler.');
})().catch(e => { console.error(e); process.exit(1); });
function pick(p) { return p && {fps: Math.round(p.fps), ms: +(p.ms || 0).toFixed(1), calls: p.calls, tris: p.triangles, pr: +(p.pixelRatio || 0).toFixed(2), quality: p.quality, objects: p.objects}; }
function fmt(p) { return p ? `${p.fps} FPS ${p.ms} ms ${p.calls} DC ${Math.round(p.tris / 1000)}k△ ×${p.pr} (${p.quality})` : '–'; }
