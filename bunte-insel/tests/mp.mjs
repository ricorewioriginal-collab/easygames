/* Mehrspieler-Test (ohne Internet): ein Fake-„Peer“ (Nachrichten über den Test-Prozess) ersetzt PeerJS, drei Spieler in getrennten Fenstern.
   Aufruf wie e2e.mjs: BASE=http://localhost:8080 THREE=/pfad/three.min.js node bunte-insel/tests/mp.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const INIT = () => {
  class Conn { constructor(p, to) { this.p = p; this.peer = to; this.open = false; this.h = {}; } on(e, f) { this.h[e] = f; return this; } emit(e, a) { this.h[e] && this.h[e](a); } send(d) { this.p.bc.postMessage({ k: 'data', from: this.p.id, to: this.peer, d: JSON.parse(JSON.stringify(d)) }); } close() { if (!this.open) return; this.open = false; this.p.bc.postMessage({ k: 'close', from: this.p.id, to: this.peer }); this.emit('close'); } }
  window.Peer = class {
    constructor(id) { this.id = id || 'g' + Math.random().toString(36).slice(2, 8); this.h = {}; this.c = {}; window.__peers = window.__peers || new Set(); window.__peers.add(this); this.bc = { postMessage: m => window.__tx(m), close() { } }; setTimeout(() => this.emit('open', this.id), 20); }
    on(e, f) { this.h[e] = f; return this; } emit(e, a) { this.h[e] && this.h[e](a); }
    connect(to) { const c = new Conn(this, to); this.c[to] = c; this.bc.postMessage({ k: 'conn', from: this.id, to }); setTimeout(() => { if (!c.open) this.emit('error', { type: 'peer-unavailable' }); }, 700); return c; }
    recv(m) {
      if (m.to !== this.id) return;
      if (m.k === 'conn') { const c = new Conn(this, m.from); this.c[m.from] = c; c.open = true; this.emit('connection', c); setTimeout(() => c.emit('open'), 5); this.bc.postMessage({ k: 'ack', from: this.id, to: m.from }); }
      else if (m.k === 'ack') { const c = this.c[m.from]; if (c) { c.open = true; c.emit('open'); } }
      else if (m.k === 'data') { const c = this.c[m.from]; if (c) c.emit('data', m.d); }
      else if (m.k === 'close') { const c = this.c[m.from]; if (c && c.open) { c.open = false; c.emit('close'); } }
    }
    destroy() { for (const k in this.c) this.c[k].close(); window.__peers.delete(this); }
  };
  window.__rx = m => { for (const p of window.__peers || []) p.recv(m); };
};
const errs = []; let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const pages = [];
const mk = async () => { const ctx = await browser.newContext({ viewport: { width: 800, height: 500 } }); await ctx.addInitScript(INIT); const p = await ctx.newPage(); pages.push(p); await p.exposeFunction('__tx', m => { for (const q of pages) if (q !== p) q.evaluate(x => window.__rx && window.__rx(x), m).catch(() => { }); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); }); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 30000 }); return p; };
const [A, B, C] = [await mk(), await mk(), await mk()];
// Titelbildschirm
const ti = await A.evaluate(() => ({ letters: document.querySelectorAll('#ttl span').length, home: !document.querySelector('[data-v=home]').hidden, hero: document.querySelector('[data-v=hero]').hidden }));
await A.click('#bHero'); const heroView = await A.evaluate(() => !document.querySelector('[data-v=hero]').hidden && document.querySelector('[data-v=home]').hidden); await A.click('#bHeroBack');
ok(ti.letters === 10 && ti.home && ti.hero && heroView, `Titelmenü: ${ti.letters} bunte Buchstaben, Start-Ansicht, „Mein Held“ wechselt die Ansicht`);
await A.screenshot({ path: process.env.SHOTS ? process.env.SHOTS + '/menu.png' : '/dev/null' }).catch(() => { });
// Host eröffnet
await A.click('#bMulti'); await A.click('#mpHost'); await A.waitForFunction(() => /^[A-Z2-9]{4}$/.test(document.getElementById('mpCode').textContent), null, { timeout: 8000 });
const code = await A.evaluate(() => document.getElementById('mpCode').textContent);
await A.click('#mpBack'); await A.click('#bStart'); await A.evaluate(() => { const b = window.__bi; b.P.x = 20; b.P.z = 30; });
await B.evaluate(() => { window.__bi.setPet('mieze'); document.querySelectorAll('#heroPick .hc')[3].click(); });
// Gast tippt den Code ein (Tastatur) und tritt bei
await B.click('#bMulti'); await B.click('#mpJoin'); for (const ch of code) await B.keyboard.press(ch.toLowerCase()); 
const rd = () => B.evaluate(() => document.getElementById('mpJoinCode').textContent.replace(/[\s·]/g, ''));
const typed = await rd();
await B.evaluate(c => { for (const ch of c) [...document.querySelectorAll('#mpPad button')].find(b => b.textContent === ch)?.click(); }, code.startsWith(typed) ? code.slice(typed.length) : '');
const typed2 = await rd();
await B.click('#mpPad .go'); await B.waitForFunction(() => window.__bi.net.connected(), null, { timeout: 8000 });
ok(typed2 === code, `Code ${code} eingetippt (Tastatur/Tasten) und beigetreten`);
await A.waitForFunction(() => window.__bi.net.connected(), null, { timeout: 5000 });
await B.click('#mpBack'); await B.click('#bStart'); await B.waitForTimeout(2500);
const near = await B.evaluate(() => { const b = window.__bi, a = [...b.remote.values()][0]; return a ? { d: Math.hypot(b.P.x - a.x, b.P.z - a.z), ax: a.x, name: a.name, vis: a.char && a.char.group.visible } : null; });
ok(near && near.d < 6 && Math.abs(near.ax - 20) < 2 && near.name.length > 2 && near.vis, `Gast landet beim Host und sieht ihn (Abstand ${near && near.d.toFixed(1)} m, ${near && near.name})`);
const pk = await A.evaluate(() => { const a = [...window.__bi.remote.values()][0]; return { k: a.pet && a.pet.k, n: a.name }; });
ok(pk.k === 'mieze' && /Fee Luna/.test(pk.n), `Freund erscheint mit eigener Figur und eigenem Haustier (${pk.n}, ${pk.k})`);
// Fahrzeug wird live gezeigt
await A.evaluate(() => { const b = window.__bi; const v = b.vehicles.find(v => v.type === 'car' && !v.ai); b.P.x = v.x + 2; b.P.z = v.z; b.enter(v); v.x += 0; b.inp.sy = 0; }); await B.waitForTimeout(1800);
const veh = await B.evaluate(() => { const a = [...window.__bi.remote.values()][0]; return { v: a.v, gv: !!a.gv, hid: !a.char.group.visible }; });
ok(veh.v === 'car' && veh.gv && veh.hid, 'Fahrzeug des Freundes wird gezeigt, Figur ausgeblendet');
await A.evaluate(() => window.__bi.leave()); 
// Dritter Spieler (über den Host weitergeleitet)
await C.click('#bMulti'); await C.click('#mpJoin'); await C.evaluate(c => { for (const ch of c) [...document.querySelectorAll('#mpPad button')].find(b => b.textContent === ch).click(); }, code); await C.click('#mpPad .go');
await C.waitForFunction(() => window.__bi.net.connected(), null, { timeout: 8000 }); await C.click('#mpBack'); await C.click('#bStart'); await C.waitForTimeout(2500);
const cnt = await Promise.all([A, B, C].map(p => p.evaluate(() => window.__bi.remote.size)));
ok(cnt.every(n => n === 2), `3 Spieler sehen sich alle gegenseitig (${cnt.join(',')})`);
const chip = await A.evaluate(() => ({ n: document.getElementById('friendsN').textContent, vis: !document.getElementById('friends').hidden }));
ok(chip.n === '3' && chip.vis, 'Mitspieler-Anzeige im Spiel zeigt 3');
// Ein Spieler geht
await B.evaluate(() => window.__bi.net.close()); await A.waitForTimeout(800);
const left = await Promise.all([A, C].map(p => p.evaluate(() => window.__bi.remote.size)));
ok(left.every(n => n === 1), `Nach dem Verlassen bleibt 1 Mitspieler (${left.join(',')})`);
// falscher Code
const bad = await B.evaluate(async () => { try { await window.__bi.net.join('ZZZZ'); return 'joined'; } catch (e) { return e.message; } });
ok(bad === 'nocode', `Falscher Code wird freundlich abgelehnt (${bad})`);
console.log('errs', errs); console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
await browser.close(); process.exit(fails || errs.length ? 1 : 0);
