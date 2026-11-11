// Gemeinsame Helfer für die Zotik-Tests
const { chromium } = require('playwright');
const ARGS = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const PAD = () => { const mk = () => ({ pressed: false, touched: false, value: 0 }); const g = { id: 'Test Pad (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, buttons: Array.from({ length: 17 }, mk), axes: [0, 0, 0, 0] };
  window.__pad = g; window.__padOn = false; navigator.getGamepads = () => window.__padOn ? [g, null, null, null] : [null, null, null, null];
  window.__press = (i, on) => { g.buttons[i].pressed = on; g.buttons[i].value = on ? 1 : 0; g.timestamp = performance.now(); }; };
async function open(b, o = {}) { const ctx = await b.newContext(Object.assign({ viewport: { width: 640, height: 360 } }, o.ctx || {})); await ctx.addInitScript(PAD); if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|net::ERR/.test(m.text())) p.errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto('http://localhost:8799/zotik/?debug' + (o.q || ''), { waitUntil: 'commit', timeout: 120000 }); await p.waitForFunction(() => window.__zotik, null, { timeout: 180000 });
  if (!o.render) await p.evaluate(() => { __zotik.noRender = true; }); return p; }
const state = p => p.evaluate(() => { const v = id => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }; const a = document.activeElement;
  return { mode: window.__zotik && __zotik.mode, tmenu: v('tmenu'), slots: v('slots'), creator: v('creator'), hud: v('hud'), dlg: v('dlg'), menu: v('menu'), puz: v('puz'), focus: a && a !== document.body ? (a.id || a.className || a.tagName) + ':' + (a.textContent || '').trim().slice(0, 18) : '-', tab: ((document.querySelector('#tabs button.on') || {}).textContent || '') }; });
const shot = async (p, name) => { await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(2500); const cdp = await p.context().newCDPSession(p); const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }); require('fs').mkdirSync(require('os').tmpdir() + '/zotik-test', { recursive: true }); require('fs').writeFileSync(require('os').tmpdir() + '/zotik-test/' + name + '.jpg', Buffer.from(r.data, 'base64')); await cdp.detach(); await p.evaluate(() => { __zotik.noRender = true; }); };
module.exports = { chromium, ARGS, open, state, shot };
