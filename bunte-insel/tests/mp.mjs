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
const mk = async () => { const ctx = await browser.newContext({ viewport: { width: 800, height: 500 } }); await ctx.addInitScript(INIT); const p = await ctx.newPage(); pages.push(p); await p.exposeFunction('__tx', m => { for (const q of pages) if (q !== p) q.evaluate(x => window.__rx && window.__rx(x), m).catch(() => { }); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); }); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.goto(BASE + '/bunte-insel/index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); return p; };
const A = await mk(); console.log('A ok'); const B = await mk(); console.log('B ok'); const C = await mk(); console.log('C ok');
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
// Zurufe, Abklatschen, gemeinsames Bauen, Fangen, Sterne-Wettlauf
await A.evaluate(() => { const b = window.__bi; if (b.P.veh) b.leave(); b.P.x = 30; b.P.z = 40; }); await B.evaluate(() => { const b = window.__bi; if (b.P.veh) b.leave(); b.P.x = 32; b.P.z = 40; }); await C.evaluate(() => { const b = window.__bi; b.P.x = -40; b.P.z = 40; }); await A.waitForTimeout(1500);
await A.evaluate(() => window.__bi.sendEmoji('❤️')); await B.waitForTimeout(800);
const emo = await B.evaluate(() => window.__bi.emosN);
const st0 = await Promise.all([A, B].map(p => p.evaluate(() => window.__bi.save.stars)));
await A.evaluate(() => window.__bi.sendEmoji('🙌')); await A.waitForTimeout(300); await B.evaluate(() => window.__bi.sendEmoji('🙌')); await B.waitForTimeout(1200);
const st1 = await Promise.all([A, B].map(p => p.evaluate(() => window.__bi.save.stars)));
ok(emo >= 1 && st1[0] === st0[0] + 1 && st1[1] === st0[1] + 1, `Zurufe sichtbar, Abklatschen gibt beiden +1 ⭐ (${st0}→${st1})`);
const sb = await B.evaluate(async () => { const b = window.__bi, sleep = ms => new Promise(r => setTimeout(r, ms)); b.toggleBuild(); await sleep(200); let gx = 0, gz = 0, f = false; for (let a = 5; a < 30 && !f; a++) for (let c = 10; c < 40 && !f; c++) if (b.build.canPlace('floor', c, a, 0)) { gx = c; gz = a; f = true; } b.build.setType('floor'); b.build.setCursor(gx * 4, gz * 4); await sleep(300); const ok1 = b.build.place(); b.toggleBuild(); return { ok1, gx, gz }; });
await A.waitForTimeout(1000);
const sa = await A.evaluate(s => window.__bi.build.items.some(i => i.o && i.gx === s.gx && i.gz === s.gz && i.t === 'floor'), sb); const sc = await C.evaluate(s => window.__bi.build.items.some(i => i.o && i.gx === s.gx && i.gz === s.gz), sb);
const savedA = await A.evaluate(() => JSON.stringify(window.__bi.build.exportMine()));
ok(sb.ok1 && sa && sc && savedA === '[]', 'Gemeinsames Bauen: Teil des Freundes erscheint bei allen, wird beim Zuschauer nicht gespeichert');
await A.evaluate(() => window.__bi.startGame('tag')); await B.waitForTimeout(1000);
const g1 = await Promise.all([A, B, C].map(p => p.evaluate(() => { const g = window.__bi.gm; return g && g.it; })));
const itId = g1[0], same = g1.every(x => x === itId);
// Fänger läuft zu einem Freund -> wird weitergegeben
const ids = await Promise.all([A, B, C].map(p => p.evaluate(() => window.__bi.net.id)));
const itIdx = ids.indexOf(itId), other = [0, 1, 2].find(i => i !== itIdx), ps = [A, B, C];
const pos = await ps[other].evaluate(() => ({ x: window.__bi.P.x, z: window.__bi.P.z })); await ps[itIdx].evaluate(p => { const b = window.__bi; b.P.x = p.x + .8; b.P.z = p.z; }, pos); await A.waitForTimeout(2500);
const g2 = await Promise.all(ps.map(p => p.evaluate(() => { const g = window.__bi.gm; return g && { it: g.it, n: g.n }; })));
ok(same && g2.every(x => x && x.n >= 1 && x.it !== itId), `Fangen: alle sehen denselben Fänger, Berührung gibt ihn weiter (${g1.map(x => x && x.slice(-3))} → ${g2.map(x => x && x.it.slice(-3))})`);
const st2 = await A.evaluate(() => window.__bi.save.stars);
await Promise.all(ps.map(p => p.evaluate(() => { window.__bi.gm.dur = 600; }))); await A.waitForTimeout(2500);
const res = await Promise.all(ps.map(p => p.evaluate(() => ({ gm: window.__bi.gm, shown: !document.getElementById('gameRes').hidden, rows: document.querySelectorAll('#grList .grr').length, stars: window.__bi.save.stars }))));
ok(res.every(r => !r.gm && r.shown && r.rows === 3), `Fangen endet: Rangliste mit 3 Spielern bei allen (${res.map(r => r.rows)}), Sterne gutgeschrieben (${st2}→${res[0].stars})`);
for (const p of ps) await p.evaluate(() => document.getElementById('grOk').click());
await A.evaluate(() => window.__bi.startGame('stars')); await B.waitForTimeout(800);
await A.evaluate(() => { const b = window.__bi, s = b.stars.find(q => q.on); b.P.x = s.x; b.P.z = s.z; }); await B.waitForTimeout(1500);
const sg = await Promise.all([A, B].map(p => p.evaluate(() => { const g = window.__bi.gm; return g ? { mine: g.cnt[window.__bi.net.id] || 0, others: Object.values(g.cnt) } : null; })));
ok(sg[0] && sg[0].mine >= 1 && sg[1] && sg[1].others.some(n => n >= 1), `Sterne-Wettlauf: Zählung wird geteilt (${JSON.stringify(sg)})`);
await Promise.all(ps.map(p => p.evaluate(() => { window.__bi.gm && (window.__bi.gm.dur = 300); }))); await A.waitForTimeout(2000); for (const p of ps) await p.evaluate(() => document.getElementById('grOk').click());
// Mini-Spiel mit Freunden (Ballon-Pop, gleiche Ballons, Punkte werden verglichen)
await A.evaluate(() => window.__bi.startGame('pop', false)); await B.waitForTimeout(1200);
const mact = await Promise.all(ps.map(p => p.evaluate(() => window.__bi.mini.active && window.__bi.mini.kind)));
await Promise.all(ps.map((p, i) => p.evaluate(sc => { window.__bi.mini.dur = 2.5; window.__bi.mini.score = sc; }, [5, 9, 2][i]))); await A.waitForTimeout(9000);
const mres = await Promise.all(ps.map(p => p.evaluate(() => ({ shown: !document.getElementById('gameRes').hidden, title: document.getElementById('grTitle').textContent, rows: [...document.querySelectorAll('#grList .grr')].map(r => r.textContent), gm: !!window.__bi.gm, act: window.__bi.mini.active }))));
ok(mact.every(k => k === 'pop') && mres.every(r => r.shown && !r.gm && !r.act && r.rows.length === 3) && /Gewonnen/.test(mres[1].title) && !/Gewonnen/.test(mres[0].title), `Mini-Spiel mit 3 Freunden: alle spielen Ballon-Pop, Rangliste bei allen, Sieger bekommt Pokal (${mres[0].rows.map(r => r.slice(-9)).join(' | ')})`);
for (const p of ps) await p.evaluate(() => document.getElementById('grOk').click());
// Verstecken: Sucher zählt, Versteckte werden gefunden
await C.evaluate(() => { window.__bi.P.x = -40; }); await A.evaluate(() => window.__bi.startGame('hide', false)); await B.waitForTimeout(1200);
const h1 = await Promise.all(ps.map(p => p.evaluate(() => ({ it: window.__bi.gm && window.__bi.gm.it, ph: window.__bi.gm && window.__bi.gm.phase, id: window.__bi.net.id, lock: document.getElementById('fade').classList.contains('on') }))));
const seeker = h1[0].it, si = h1.findIndex(x => x.id === seeker), locked = h1[si].lock && h1.every(x => x.ph === 'count');
await Promise.all(ps.map((p, i) => p.evaluate(q => { const b = window.__bi; b.gm.ph0 -= 21000; if (q.i === q.si) { b.P.x = 70; b.P.z = 40; } else { b.P.x = 90 + (q.i % 2) * .6; b.P.z = 60; } }, { i, si })));
await A.waitForTimeout(1500);
await ps[si].evaluate(() => { window.__bi.P.x = 90; window.__bi.P.z = 60; }); await A.waitForTimeout(2500);
const h2 = await Promise.all(ps.map(p => p.evaluate(() => ({ gm: !!window.__bi.gm, shown: !document.getElementById('gameRes').hidden, rows: document.querySelectorAll('#grList .grr').length }))));
ok(locked && h2.every(x => !x.gm && x.shown && x.rows === 3), `Verstecken: Sucher zählt (Bild dunkel), nach dem Zählen werden alle gefunden, Ergebnis bei allen (${JSON.stringify(h2.map(x => x.rows))})`);
for (const p of ps) await p.evaluate(() => document.getElementById('grOk').click());
// Ein Spieler geht
await B.evaluate(() => window.__bi.net.close()); await A.waitForTimeout(800);
const left = await Promise.all([A, C].map(p => p.evaluate(() => window.__bi.remote.size)));
ok(left.every(n => n === 1), `Nach dem Verlassen bleibt 1 Mitspieler (${left.join(',')})`);
// Geburtstagsparty (A feiert, C ist in der Nähe) und Besuch in der Wohnung des Freundes
{ const sb = await C.evaluate(() => window.__bi.save.stars); await A.evaluate(() => window.__bi.sendParty()); await C.waitForTimeout(800);
  const r = await C.evaluate(() => ({ n: window.__bi.parties.length, stars: window.__bi.save.stars }));
  ok(r.n === 1 && r.stars >= sb + 2, `Party: Freund sieht den Kuchen und bekommt Sterne (${r.n}, +${r.stars - sb})`);
  const v = await C.evaluate(() => { const b = window.__bi, a = [...b.remote.values()][0]; b.visitFlat(a.id); const f = b.flats[0], g = b.flats[1]; return Math.min(Math.hypot(b.P.x - f.door.x, b.P.z - f.door.z), Math.hypot(b.P.x - g.door.x, b.P.z - g.door.z)); });
  ok(v < 3, `Besuchen: Gast steht vor einer Wohnungstür (${v.toFixed(1)} m)`); }
// Rucksack: Geschenk und Tausch zwischen zwei echten Fenstern
{ const peerId = await A.evaluate(() => [...window.__bi.remote.keys()][0]); const bId = await B.evaluate(() => window.__bi.net.id); const Bp = bId === peerId ? B : C; 
  await A.evaluate(() => { const iv = window.__bi.garden.inv(); iv.apple = 3; iv.cookie = 0; }); await Bp.evaluate(() => { const iv = window.__bi.garden.inv(); iv.apple = 0; iv.cookie = 2; });
  const click = (pg, sel, re, i = 0) => pg.evaluate(([sel, re, i]) => { const l = [...document.querySelectorAll(sel)].filter(x => new RegExp(re).test(x.textContent)); if (!l[i]) return false; l[i].click(); return true; }, [sel, re, i]);
  await A.evaluate(() => { window.__bi.pack.show(0); }); await A.waitForTimeout(150);
  await click(A, '#packBody .pslot', 'Apfel'); await A.waitForTimeout(100); await click(A, '#packDetail button', 'Verschenken'); await A.waitForTimeout(100); const fr = await click(A, '#packBody button', '.', 0); await Bp.waitForTimeout(900);
  const g = await Promise.all([A.evaluate(() => window.__bi.garden.inv().apple), Bp.evaluate(() => window.__bi.garden.inv().apple)]);
  ok(fr && g[0] === 2 && g[1] === 1, `Geschenk: Apfel wandert von A zu B (A ${g[0]}, B ${g[1]})`);
  await A.evaluate(() => { window.__bi.pack.show(0); }); await A.waitForTimeout(150); await click(A, '#packBody .pslot', 'Apfel'); await A.waitForTimeout(100); await click(A, '#packDetail button', 'Tauschen'); await A.waitForTimeout(100); await click(A, '#packBody button', '.', 0);
  await Bp.waitForFunction(() => !document.getElementById('tradePanel').hidden, null, { timeout: 8000 }); await click(Bp, '#tradePanel button', 'Ja'); await A.waitForTimeout(600);
  await Bp.evaluate(() => { const bs = [...document.querySelectorAll('#tradePanel .pbt button.alt')]; const c = bs.find(x => x.title === 'Keks'); (c || bs[0]).click(); }); await A.waitForTimeout(800);
  await click(A, '#tradePanel button', 'Tauschen!'); await Bp.waitForTimeout(600); await click(Bp, '#tradePanel button', 'Tauschen!'); await A.waitForTimeout(1200);
  const t = await Promise.all([A.evaluate(() => ({ a: window.__bi.garden.inv().apple, c: window.__bi.garden.inv().cookie || 0, open: !document.getElementById('tradePanel').hidden })), Bp.evaluate(() => ({ a: window.__bi.garden.inv().apple, c: window.__bi.garden.inv().cookie || 0, open: !document.getElementById('tradePanel').hidden }))]);
  ok(t[0].a === 1 && t[0].c === 1 && t[1].a === 2 && t[1].c === 1 && !t[0].open && !t[1].open, `Tausch: Apfel ↔ Keks (A ${JSON.stringify(t[0])}, B ${JSON.stringify(t[1])})`);
}
// falscher Code
const bad = await B.evaluate(async () => { try { await window.__bi.net.join('ZZZZ'); return 'joined'; } catch (e) { return e.message; } });
ok(bad === 'nocode', `Falscher Code wird freundlich abgelehnt (${bad})`);
console.log('errs', errs); console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
await browser.close(); process.exit(fails || errs.length ? 1 : 0);
