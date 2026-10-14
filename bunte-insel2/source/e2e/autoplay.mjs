// Spielt den Story-Modus automatisch (Bot), um Sackgassen in Quests zu finden.
// Teleportiert zum Ziel und löst die passende Aktion aus. Meldet, wo es nicht weitergeht.
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
let pw; for (const p of ['playwright', '/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) { try { pw = req(p); break; } catch {} }
const BASE = process.env.BASE || 'http://localhost:8090/bunte-insel2/';
const MODE = process.env.MODE || 'story';
const MAX = +(process.env.STEPS || 1500);
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(BASE + '?test=1');
await page.waitForFunction(() => window.__bi2, null, { timeout: 60000 });
await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('bunteInsel2.slot3')) localStorage.removeItem(k); });
await page.click('#btn-slots'); await page.waitForTimeout(300);
await page.click('#slot-3 .btn.green'); await page.waitForTimeout(300);
await page.click(MODE === 'story' ? '#mode-story .btn' : '#mode-free .btn'); await page.waitForTimeout(1000);
await page.fill('input[aria-label="Name"]', 'Bot');
await page.click('text=✔ Fertig'); await page.waitForTimeout(1500);

const step = () => page.evaluate(() => {
  const B = window.__bi2, g = B.g, S = B.sys, Q = S.quests;
  const st = window.__bot ??= { tries: {}, clicked: new Set(), log: [], last: '' };
  const say = m => { if (st.last !== m) { st.log.push(m); st.last = m; } };
  // 1) Gespräch
  const dlg = document.querySelector('.dialog');
  if (dlg) {
    const btns = [...dlg.querySelectorAll('.choices button')];
    if (btns.length) {
      const score = b => { const t = b.textContent; if (/✅|Klar|helfe|Ja|Los|mach|Ich schau|gerne|Okay|ok/i.test(t)) return 5; if (/📜/.test(t)) return 4; if (/❓/.test(t)) return 1; if (/👋|später|Plaudern|schenken|verkaufst|Nein/i.test(t)) return -5; return 2; };
      const tk = 'dlgc:' + dlg.textContent.slice(0, 80);
      st.tries[tk] = (st.tries[tk] ?? 0) + 1;
      btns.sort((a, b) => score(b) - score(a));
      (st.tries[tk] > 3 ? btns[Math.min(btns.length - 1, st.tries[tk] - 3)] ?? btns[btns.length - 1] : btns[0]).click();
    } else dlg.click();
    return 'dlg';
  }
  // 2) Minispiel
  if (document.querySelector('.mg')) {
    const m = window.__mg;
    const los = [...document.querySelectorAll('.mg button')].find(b => /Los geht/.test(b.textContent)); if (los) los.click();
    if (m && !m.done) { try { m.init?.(); } catch {} m.finish(true); return 'mg'; }
    const f = [...document.querySelectorAll('.mg button')].find(b => /Fertig/.test(b.textContent)); if (f) f.click();
    return 'mg-end';
  }
  // 3) Fenster
  const md = document.querySelector('.modal, .overlay .panel');
  if (md) {
    const title = (md.querySelector('h2')?.textContent ?? '').trim();
    const greens = [...md.querySelectorAll('button.green, .btn.green, button.grape, button.pink')].filter(b => !st.clicked.has(title + b.textContent));
    if (greens.length) { const b = greens[0]; st.clicked.add(title + b.textContent); say('Fenster „' + title + '“ → ' + b.textContent.trim()); b.click(); return 'modal-act'; }
    const x = md.querySelector('.x, button[aria-label="Schließen"]'); if (x) x.click(); else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }));
    return 'modal-close';
  }
  if (g.busy > 0) return 'busy';
  // 4) Ziel
  const tr = Q.trackedObjective();
  let qid = tr?.q.id, o = tr?.o;
  // Flag done_<welt> → Weltgeschichte suchen
  if (o && o.type === 'flag' && /^done_/.test(o.target)) {
    const wq = [...Q.defs.values()].find(q => q.kind === 'world' && q.rewards.flag === o.target);
    if (wq) {
      if (!Q.state(wq.id)) {
        const giver = wq.giver && S.npcs.defs.get(wq.giver);
        if (!giver) { say('❌ ' + wq.id + ': Kein Auftraggeber'); return 'stuck'; }
        if (S.story.locked && S.story.locked(giver.world)) { say('❌ ' + wq.id + ': Welt ' + giver.world + ' gesperrt'); }
        const live = S.npcs.live.get(giver.id);
        const p = live ? live.pos : giver;
        if (Math.hypot(g.player.pos.x - p.x, g.player.pos.z - p.z) > 3) { g.teleport(p.x + 1.5, p.z + 1.5); return 'goto-giver ' + wq.id; }
        if (!Q.available(wq)) { say('❌ ' + wq.id + ': nicht verfügbar (requires?)'); }
        S.dialogue.talk(giver.id); return 'talk-giver ' + wq.id;
      }
      S.quests.save.tracked = wq.id; return 'track ' + wq.id;
    }
  }
  if (!tr) {
    // Nichts verfolgt: nächste verfügbare Quest eines Auftraggebers starten
    const av = [...Q.defs.values()].filter(q => Q.available(q) && q.giver && (q.kind !== 'side'));
    const act = Q.list('active');
    if (act.length) { Q.save.tracked = act[0].id; return 'track-active'; }
    if (!av.length) return 'idle';
    const q = av[0], d = S.npcs.defs.get(q.giver);
    const live = S.npcs.live.get(q.giver); const p = live ? live.pos : d;
    if (Math.hypot(g.player.pos.x - p.x, g.player.pos.z - p.z) > 3) { g.teleport(p.x + 1.5, p.z + 1.5); return 'goto-offer ' + q.id; }
    S.dialogue.talk(q.giver); return 'offer ' + q.id;
  }
  const key = qid + '#' + Q.state(qid).stage + '#' + (o?.id ?? '-');
  st.tries[key] = (st.tries[key] ?? 0) + 1;
  if (st.tries[key] > 25) { say('❌ STECKT: ' + key + ' (' + (o ? o.type + ' ' + o.target + ' „' + o.label + '“' : tr.st.text) + ')'); return 'stuck ' + key; }
  if (!o) { // Phase ohne offene Pflichtziele: Dialog-NPC
    const n = tr.st.dialog && Object.keys(tr.st.dialog)[0]; if (n) { S.dialogue.talk(n); return 'talk-stage'; } return 'no-obj';
  }
  const near = (x, z, r = 2.5) => { if (Math.hypot(g.player.pos.x - x, g.player.pos.z - z) > r) { g.teleport(x + 1, z + 1); return false; } return true; };
  const tryInteract = id => { const i = g.interact.get(id); if (!i) return false; if (!near(i.x, i.z, 2)) return true; if (i.when && !i.when()) { say('⚠️ ' + key + ': Interaktion ' + id + ' gerade nicht möglich'); return false; } if (i.onWater && /feuer/.test(id)) { i.onWater(); return true; } i.act(); return true; };
  switch (o.type) {
    case 'talk': { const d = S.npcs.defs.get(o.target); if (!d) { say('❌ ' + key + ': NPC ' + o.target + ' fehlt'); return 'stuck'; } const live = S.npcs.live.get(o.target); const p = live ? live.pos : d; if (!live) { g.teleport(d.x + 1, d.z + 1); if (st.tries[key] > 4) say('⚠️ ' + key + ': NPC ' + o.target + ' nicht sichtbar (when?)'); return 'goto-npc'; } if (!near(p.x, p.z, 3)) return 'goto-npc'; S.dialogue.talk(o.target); return 'talk ' + o.target; }
    case 'reach': if (o.at) { g.teleport(o.at.x, o.at.z); return 'reach'; } break;
    case 'enter': { const w = g.worlds.byId(o.target); if (w) { g.teleport(w.spawn.x, w.spawn.z); return 'enter'; } break; }
    case 'interact': if (tryInteract(o.target)) return 'interact ' + o.target; { const cand = g.interact.all.filter(i => i.id.startsWith(o.target)); if (cand.length) { const i = cand.find(c => !c.when || c.when()) ?? cand[0]; if (near(i.x, i.z, 2)) i.act(); return 'interact* ' + i.id; } if (o.at) { g.teleport(o.at.x, o.at.z); return 'goto-at'; } } break;
    case 'minigame': { const i = g.interact.all.find(x => x.id.includes(o.target) || (x.id.startsWith('mg:') && x.id.endsWith(o.target))); if (i) { if (near(i.x, i.z, 2)) i.act(); return 'mg-int ' + i.id; } if (o.at) { if (near(o.at.x, o.at.z, 3)) g.startMinigame(o.target); return 'mg-at'; } g.startMinigame(o.target); return 'mg-direct ' + o.target; }
    case 'collect': case 'have': {
      const item = o.target.replace(/^item:/, '');
      const cand = g.interact.all.filter(i => (i.id.includes(item) || i.id.startsWith('pick')) && (!i.when || i.when()));
      const p = g.player.pos; cand.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
      const c = cand.find(i => i.id.includes(item)) ?? null;
      if (c) { if (near(c.x, c.z, 2)) c.act(); return 'collect ' + c.id; }
      if (o.at) { g.teleport(o.at.x, o.at.z); }
      if (st.tries[key] > 6) say('⚠️ ' + key + ': keine Fundstelle für ' + item + ' gefunden');
      break;
    }
    case 'flag': {
      // Hinweis: Flags werden durch Interaktionen/Minispiele gesetzt
      if (o.at) { if (near(o.at.x, o.at.z, 3)) { const cand = g.interact.all.filter(i => Math.hypot(i.x - o.at.x, i.z - o.at.z) < (o.at.r ?? 8) + 6 && (!i.when || i.when())); const i = cand[st.tries[key] % Math.max(1, cand.length)]; if (i) { if (near(i.x, i.z, 2)) i.act(); return 'flag-int ' + i.id; } } return 'flag-at'; }
      break;
    }
    case 'vehicle': { const v = S.vehicles; const list = v.list ?? v.vehicles ?? []; const t = [...list].find(x => (x.type?.id ?? x.type) === o.target || o.target === '*'); if (t) { const p = t.pos ?? t.mesh?.position ?? t.root?.position; if (p && near(p.x, p.z, 2.5)) v.enterById?.(t.id); return 'vehicle'; } break; }
    case 'emote': g.events.emit('emote', { id: o.target }); return 'emote';
    case 'discover': { const [w, k] = o.target.split(':'); const wd = g.worlds.byId(w); const poi = wd?.pois?.[k]; if (poi) { g.teleport(poi.x, poi.z); return 'discover'; } break; }
  }
  if (st.tries[key] === 8) say('⚠️ ' + key + ': Bot weiß nicht wie (' + o.type + ' ' + o.target + ' „' + o.label + '“) at=' + JSON.stringify(o.at ?? null));
  return 'unknown ' + o.type;
});

let lastProg = '', same = 0;
for (let i = 0; i < MAX; i++) {
  let r; try { r = await step(); } catch (e) { console.log('Fehler im Schritt:', e.message.slice(0, 200)); r = 'err'; }
  await page.waitForTimeout(/goto|enter|reach|discover/.test(r) ? 700 : 160);
  const prog = await page.evaluate(() => { const s = window.__bi2.g.save; return Object.entries(s.quests).map(([k, v]) => k + ':' + (v.done ? 'D' : v.stage)).join(',') + '|' + s.story.chapter; });
  if (prog === lastProg) same++; else { same = 0; lastProg = prog; }
  if (same > 120) { console.log('Kein Fortschritt mehr seit 120 Schritten. Letzte Aktion:', r); break; }
}
const res = await page.evaluate(() => { const s = window.__bi2.g.save; return { chapter: s.story.chapter, done: Object.entries(s.quests).filter(([, v]) => v.done).map(([k]) => k), open: Object.entries(s.quests).filter(([, v]) => !v.done).map(([k, v]) => k + '@' + v.stage), log: window.__bot?.log ?? [] }; });
console.log('Kapitel:', res.chapter);
console.log('Fertig (' + res.done.length + '):', res.done.join(', '));
console.log('Offen:', res.open.join(', '));
console.log('--- Protokoll ---\n' + res.log.join('\n'));
console.log('--- Browserfehler ---\n' + errs.slice(0, 15).join('\n'));
await page.screenshot({ path: (process.env.OUT || '/tmp') + '/autoplay-end.png' });
await browser.close();
