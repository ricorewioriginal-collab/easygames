// SHOW ME YOUR VOICE – Browser-Test der Online-Show (Playwright). Zwei Seiten (Gastgeber + Gast) verbinden sich über ein
// nachgebautes Peer (BroadcastChannel statt Internet), spielen Casting und Finale, stimmen ab und sehen dieselbe Wertung.
//   node show-me-your-voice/tests/e2e-online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/smyv-online-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, serviceWorkers: 'block' });
await ctx.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js|fire-peer\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
// Peer-Ersatz: gleiche Schnittstelle wie PeerJS, Nachrichten über BroadcastChannel
const FAKE = () => {
  const bc = new BroadcastChannel('fakepeer'), peers = new Map(), conns = new Map();
  const ev = () => { const h = {}; return { on(k, f) { (h[k] = h[k] || []).push(f); }, emit(k, ...a) { (h[k] || []).forEach(f => f(...a)); } }; };
  function Conn(cid, me, other) { const e = ev(); const c = { peer: other, open: false, on: e.on, emit: e.emit, cid, me,
    send(d) { bc.postMessage({ k: 'msg', cid, to: other, d }); }, close() { if (!c.open) return; c.open = false; bc.postMessage({ k: 'close', cid, to: other }); c.emit('close'); } }; conns.set(cid + me, c); return c; }
  bc.onmessage = ({ data: m }) => {
    const p = peers.get(m.to); if (!p) return;
    if (m.k === 'conn') { const c = Conn(m.cid, m.to, m.from); c.open = true; p.emit('connection', c); bc.postMessage({ k: 'ack', cid: m.cid, to: m.from }); setTimeout(() => c.emit('open'), 0); }
    else if (m.k === 'ack') { const c = conns.get(m.cid + m.to); if (c) { c.open = true; c.emit('open'); } }
    else if (m.k === 'msg') { const c = conns.get(m.cid + m.to); if (c) c.emit('data', JSON.parse(JSON.stringify(m.d))); }
    else if (m.k === 'close') { const c = conns.get(m.cid + m.to); if (c && c.open) { c.open = false; c.emit('close'); } }
  };
  window.Peer = function (id) { const e = ev(); const p = { id: id || 'g' + Math.random().toString(36).slice(2, 8), on: e.on, emit: e.emit,
    connect(to) { const cid = Math.random().toString(36).slice(2); const c = Conn(cid, p.id, to); bc.postMessage({ k: 'conn', cid, from: p.id, to }); setTimeout(() => { if (!c.open) p.emit('error', { type: 'peer-unavailable' }); }, 3000); return c; },
    destroy() { peers.delete(p.id); conns.forEach(c => { if (c.me === p.id) c.close(); }); }, reconnect() {} };
    peers.set(p.id, p); setTimeout(() => p.emit('open', p.id), 10); return p; };
};
async function page(name) {
  const p = await ctx.newPage();
  // eigener Spielstand je Seite (beide Seiten teilen sich sonst den localStorage des Browsers)
  await p.addInitScript(n => { const P = Storage.prototype, k = x => (x === 'smyv-save' ? x + '-' + n : x), g = P.getItem, s = P.setItem, r = P.removeItem;
    P.getItem = function (x) { return g.call(this, k(x)); }; P.setItem = function (x, v) { return s.call(this, k(x), v); }; P.removeItem = function (x) { return r.call(this, k(x)); }; }, name); p.on('pageerror', e => errs.push(name + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/i.test(m.text())) errs.push(name + ': ' + m.text()); });
  return p;
}
async function setup(p, name) {
  await p.waitForSelector('#sTitle.on'); await p.evaluate(FAKE);
  await p.evaluate(() => { const O = window.SMYV.ONLINE; Object.values(O).forEach(d => { d.len = 6; }); });
  await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
  await p.click('[data-m="online"]'); await p.waitForSelector('#sAvatar.on'); await p.fill('#avaName', name); await p.click('#avaOk');
  await p.waitForSelector('#sOnline.on');
}
// Test-Bot wie im großen Test: trifft fast alles
const bot = (p, q) => p.evaluate(q => { clearInterval(window.__bot); window.__bot = setInterval(() => {
  const s = window.SMYVApp.stageObj(); if (!s || !s.part || s.paused) return; const t = s.clock();
  if (s.part.type === 'rhythm') for (const n of s.notes) if (!n.st && !n.skip && Math.abs(n.t - t) < 0.025) { if (Math.random() < q) s.press(n.lane); else n.skip = 1; }
  if (s.part.type === 'pitch') { const g = s.segs.find(x => t >= x.t - 0.3 && t < x.t + x.d); if (g) s.touchLv = Math.random() < q ? g.lv : (g.lv + 3) % 7; }
}, 8); }, q);
const phase = p => p.evaluate(() => { const b = document.getElementById('onBox'); return b ? b.textContent : ''; });

const A = await page('Gastgeber'); await A.goto(base); await setup(A, 'Hosti');
await A.click('[data-o="host"]'); await A.waitForSelector('.bigCode');
const code = (await A.textContent('.bigCode')).trim(); ok(/^[A-Z0-9]{4}$/.test(code), 'Show eröffnet, Code ' + code);
const B = await page('Gast'); await B.goto(base + '?join=' + code); await setup(B, 'Gasti');
await A.waitForFunction(() => document.querySelectorAll('#onBox .onPlayers .onP').length === 2, null, { timeout: 10000 });
ok(true, 'Gast tritt per Einladungslink bei'); await A.click('[data-o="m:beat"]'); await shot(A, '1-lobby');
await B.waitForFunction(() => /Hosti/.test((document.getElementById('onBox') || {}).textContent || ''), null, { timeout: 8000 }).catch(() => {});
ok(/Gasti/.test(await phase(A)) && /Hosti/.test(await phase(B)), 'Beide sehen beide Namen');
await bot(A, 1); await bot(B, 0.4);
await A.click('[data-o="start"]');
await Promise.all([A.waitForSelector('#sStage.on', { timeout: 10000 }), B.waitForSelector('#sStage.on', { timeout: 10000 })]); ok(true, 'Beide singen gleichzeitig');
await shot(B, '2-auftritt');
// Voting
await Promise.all([A.waitForSelector('[data-vote]', { timeout: 60000 }), B.waitForSelector('[data-vote]', { timeout: 60000 })]);
await shot(A, '3-voting');
ok((await A.locator('[data-vote]').count()) === 1, 'Niemand kann für sich selbst stimmen');
await B.click('[data-vote]'); await A.click('[data-vote]');
await Promise.all([A.waitForSelector('table.rank', { timeout: 15000 }), B.waitForSelector('table.rank', { timeout: 15000 })]);
await shot(B, '4-ergebnis');
const ta = await A.textContent('table.rank'), tb = await B.textContent('table.rank');
ok(ta === tb, 'Gastgeber und Gast sehen dieselbe Wertung');
ok(await B.isVisible('.jcard'), 'Eigene Jury-Urteile mit Kommentar sichtbar');
// Recall nach dem Casting
await A.click('[data-o="next"]');
await Promise.all([A.waitForSelector('#sStage.on', { timeout: 10000 }), B.waitForSelector('#sStage.on', { timeout: 10000 })]);
ok(/Recall/.test(await A.textContent('#stTitle')), 'Nach dem Casting kommt der Recall');
await Promise.all([A.waitForSelector('[data-vote]', { timeout: 90000 }), B.waitForSelector('[data-vote]', { timeout: 90000 })]);
await A.click('[data-vote]'); await B.click('[data-vote]');
await A.waitForSelector('[data-o="next"]', { timeout: 15000 });
// Finale (2 Personen)
await A.click('[data-o="next"]');
await Promise.all([A.waitForSelector('#sStage.on', { timeout: 10000 }), B.waitForSelector('#sStage.on', { timeout: 10000 })]);
ok(/Finale/.test(await A.textContent('#stTitle')), 'Mit zwei Personen folgt nach dem Recall das Finale');
await Promise.all([A.waitForSelector('[data-vote]', { timeout: 90000 }), B.waitForSelector('[data-vote]', { timeout: 90000 })]);
await A.click('[data-vote]'); await B.click('[data-vote]');
await Promise.all([A.waitForSelector('.banner.gold', { timeout: 15000 }), B.waitForSelector('.banner.gold', { timeout: 15000 })]);
await A.waitForTimeout(400); await shot(A, '5-finale');
const win = await B.textContent('.banner.gold'); ok(/Hosti gewinnt/.test(win), 'Bessere Leistung gewinnt: ' + win.trim());
// Neue Show mit allen: beide singen wieder (auch wer vorher schon gespielt hat)
await A.click('[data-o="again"]'); await A.waitForSelector('[data-o="start"]', { timeout: 8000 }); await A.click('[data-o="start"]');
await Promise.all([A.waitForSelector('#sStage.on', { timeout: 10000 }), B.waitForSelector('#sStage.on', { timeout: 10000 })]); ok(true, 'Neue Show: alle singen wieder');
await Promise.all([A.waitForSelector('[data-vote]', { timeout: 90000 }), B.waitForSelector('[data-vote]', { timeout: 90000 })]); ok(true, 'Neue Show: beide können wieder abstimmen');
// Fremde Avatar-Farben werden nicht als Code eingebaut
ok(await B.evaluate(() => !/onclick/.test(window.SMYVAvatar.svg({ skin: '#" onclick="alert(1)', hairColor: NaN }, 'happy'))), 'Fremde Avatar-Daten sind entschärft');
// Gastgeber geht → Gast bekommt Hinweis
await A.click('[data-o="leave"]'); await A.click('#ovBox [data-act="y"]');
await B.waitForFunction(() => !document.querySelector('.bigCode') && /Show eröffnen/.test(document.getElementById('onBox').textContent), null, { timeout: 8000 });
ok(true, 'Gastgeber verlässt die Show → Gast ist zurück am Anfang');
ok(!errs.length, 'Keine Laufzeitfehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
