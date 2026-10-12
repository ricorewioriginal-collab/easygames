/* Alle Inselgeschichten spielbar: jede Geschichte wird Akt für Akt durchgespielt (Spielstand wie ein Spieler setzt: Aufgaben der Welt erledigen) bis zum Abschluss-Sticker. Aufruf: node bunte-insel/tests/inselstory2.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 600 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const keys = await p.evaluate(() => BI.INSELSTORY.map(d => d.key));
const res = await p.evaluate(async keys => {
  const b = __bi, I = b.istory, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, until = async (f, ms) => { for (let i = 0; i < (ms || 12000) / 150 && !f(); i++) await sl(150); return f(); };
  const mods = { dampf: b.dampf, drachen: b.drachen, fussball: b.fussball, zotik: b.zotik, radio: b.radio, atlantis: b.atlantis };
  const sat = (g, key) => {
    const s = b.save; if (typeof g === 'string') { (s.stk = s.stk || []).includes(g) || s.stk.push(g); return; }
    if (g.log) { mods[g.log].log(); const m = s[g.log], r = g.row;
      if (g.log === 'dampf') { if (r === 0) m.col = [1, 1, 1, 1, 1, 1]; if (r === 1) m.inst = [1, 1, 1, 1, 1, 1]; if (r === 2) m.notes = [0, 1, 2, 3, 4, 5, 6, 7]; if (r === 3) m.film = 1; }
      if (g.log === 'drachen') { if (r === 0) m.fackeln = [1, 1, 1, 1, 1, 1]; if (r === 1) m.freunde = [1, 1, 1, 1, 1, 1]; if (r === 2) m.ringe = 8; if (r === 4) m.tor = 1; }
      if (g.log === 'fussball') { if (r === 0) m.played = 1; if (r === 1) m.goals = Math.max(m.goals, 5); if (r === 2) m.goals = 25; }
      if (g.log === 'zotik') { if (r === 0) m.visit = 1; if (r >= 1 && r <= 4) m.q = Math.max(m.q, r); }
      if (g.log === 'radio') { if (r === 1) m.done = m.done.length ? m.done : ['a']; if (r === 2) { m.all = 1; m.done = Array.from({ length: 13 }, (_, i) => 'x' + i); } if (r === 3) m.visual = 1; }
      if (g.log === 'atlantis') { if (r === 1) m.holo = [1, 1, 1, 1, 1]; if (r === 2) m.herz = 1; if (r === 3) m.harp = 1; if (r === 4) m.lowg = 1; if (r === 5) m.glider = 1; }
      return; }
    if (g.talk) { const names = [...I.dbg.residents(g.talk)]; s.talked = s.talked || []; for (const n of names.slice(0, g.n)) if (!s.talked.includes(n)) s.talked.push(n); return; }
    if (g.flag) { (s.flags = s.flags || {})[g.flag] = 1; return; }
    if (g.einsatz != null) { s.einsatz = s.einsatz || { done: [], cur: null }; s.einsatz.done = Array.from({ length: g.einsatz }, (_, i) => 'm' + i); return; }
    if (g.medal) { s.einsatz = s.einsatz || { done: [], cur: null }; s.einsatz.medal = 1; }
  };
  for (const key of keys) {
    const d = BI.INSELSTORY.find(q => q.key === key), O = BI[key], r = { acts: d.acts.length, stages: [], fresh: true };
    b.save.stk = []; b.save.talked = []; b.save.flags = {}; b.save.einsatz = { done: [], cur: null }; for (const k of ['dampf', 'drachen', 'fussball', 'zotik', 'radio', 'atlantis']) delete b.save[k]; delete b.save.inselstory;
    P.veh = null; if (key === 'ATLANTIS') { I.dbg.start(d); /* Atlantis liegt unter Wasser (Zugang über die Treppe, G.inside): Start im Test direkt auslösen */ } else { P.x = O.x + O.R * .4; P.z = O.z; P.y = 0; } r.started = await until(() => I.dbg.stage(d) === 0);
    await sl(900); r.noSkip = I.dbg.stage(d) === 0 && d.acts.every(a => !I.dbg.ST || true); r.fresh = d.acts.every((a, i) => i > 0 || !a.goal.every(I.goalDone));
    for (let i = 0; i < d.acts.length; i++) { for (const g of d.acts[i].goal) sat(g, key); r.stages.push(await until(() => I.dbg.stage(d) === i + 1)); }
    r.sticker = b.save.stk.includes('geschichte_' + key.toLowerCase()); r.goalChip = true; out[key] = r;
  }
  return out;
}, keys);
for (const key of keys) { const r = res[key]; ok(r.started && r.fresh && r.noSkip && r.stages.every(Boolean) && r.stages.length === r.acts && r.sticker, key + ': Geschichte startet, springt nicht von allein, ' + r.acts + ' Akte spielbar, Abschluss-Sticker'); }
ok(keys.length === 15, 'Alle 15 Welten haben eine Inselgeschichte (' + keys.length + ')');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
