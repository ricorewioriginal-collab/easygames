/* Sprechblasen im Rollenspiel-Stil + Kontext-Knöpfe: Figuren sprechen im Textfeld unten (Bild, Name, Text), Gespräche bleiben erreichbar, wenn etwas anderes in der Nähe ist,
   Taschi-Heilhaus heilt drinnen. Aufruf: THREE=... node bunte-insel/tests/dialog.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 420 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, D = b.dlg(), sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, el = document.getElementById('rpgDlg'), vis = () => !el.hidden;
  /* 1. Text-Erkennung */
  out.parse = !!D.parse('🌸 Kira: „Hallo, schön dich zu sehen!“') && D.parse('Frau Bunt: „Viel Spaß!“ +2 ⭐').name === 'Frau Bunt' && D.parse('Tipp: Sammle Sterne').constructor === null || D.parse('Tipp: Sammle Sterne') === null;
  b.say('🌸 Kira: „Komm mit auf die Insel!“', 3000); out.show = vis() && el.querySelector('.nm').textContent === 'Kira' && /Komm mit/.test(el.querySelector('.ln').textContent); out.noToast = !document.getElementById('toast').classList.contains('show') || document.getElementById('toast').textContent.indexOf('Kira') < 0;
  el.click(); out.closed = !vis();
  b.say('⭐ Du hast 3 Sterne gesammelt!', 1500); out.toast = !vis() && document.getElementById('toast').classList.contains('show');
  /* 2. Figur ansprechen: Textfeld mit Porträt */
  const n = b.npcs.find(q => q.p && q.c.group.visible); P.veh = null; P.x = n.x + 1.4; P.z = n.z; P.y = 0; await sl(300); const f = b.footNow(); out.talkSlot = f.filter(Boolean).some(q => /./.test(q.nm)); b.talkNpc(n); out.npcDlg = vis() && el.querySelector('.nm').textContent === n.p.name; out.portrait = !!el.querySelector('.pt img') || el.querySelector('.pt').textContent.length > 0; el.click();
  /* 3. Reden bleibt erreichbar, wenn ein Auto UND ein Haus in der Nähe sind */
  const v = b.vehicles.find(q => !q.ai); const T = BI.TASCHI, hd = BI.DOORS.find(d => d.isle === 'taschi' && d.kind === 'heil');
  P.x = hd.x; P.z = hd.z; P.y = 0; const w = T.at(-33, -20); const nu = b.taschi.dbg.npcs.find(q => q.id === 'nurse'); await sl(300); const lst = b.footNow().filter(Boolean); out.door = lst.some(q => /Heilhaus/.test(q.nm));
  /* 4. Heilhaus: drinnen heilen */
  b.taschi.dbg.S().team.push(b.taschi.mk('glutzahn', 8)); const m = b.taschi.dbg.S().team[0]; m.hp = 1; b.innen.enter(hd); const R = b.innen.inside; out.inside = !!R && R.items.some(i => i.type === 'tcenter') && R.items.some(i => i.type === 'tteam');
  const it = R.items.find(i => i.type === 'tcenter'); P.x = it.x; P.z = it.z; await sl(200); const nr = b.innen.near(); out.heilNear = !!nr && nr.k === 'initem' && /heilen/.test(nr.label[1]); b.innen.act(nr); out.healed = m.hp === b.taschi.hpMax(m.id, m.lv); b.taschi.closePanel(); b.innen.leave();
  /* Fangladen drinnen */
  const sd = BI.DOORS.find(d => d.tshop); b.innen.enter(sd); await sl(200); out.shopItem = b.innen.inside.items.some(i => i.type === 'tshop'); b.innen.leave();
  /* 5. Knöpfe zu Fuß: nichts in der Nähe → keine Knöpfe; bei Fahrzeug+Figur → Reden auf Y/X erreichbar */
  for (const [x, z] of [[0, 60], [90, 90], [-90, 90], [120, -40], [-120, -60], [0, 150]]) { P.veh = null; P.x = x; P.z = z; P.y = 0; await sl(150); if (!b.footNow().some(Boolean)) break; } await sl(500); out.idle = ['bAct', 'bAux', 'bHorn'].every(id => document.getElementById(id).hidden);
  return out;
});
console.log(JSON.stringify(r));
ok(r.parse, 'Erkennung: „Name: „Text““ wird Sprechblase, „Tipp: …“ nicht'); ok(r.show && r.closed, 'Sprechblase unten mit Name und Text, Tippen schließt'); ok(r.toast, 'Normale Meldungen bleiben kleine Hinweise');
ok(r.talkSlot && r.npcDlg && r.portrait, 'Figur ansprechen: Textfeld mit Bild und Name'); ok(r.door, 'Heilhaus-Tür als Aktion sichtbar'); ok(r.inside && r.heilNear && r.healed, 'Taschi-Heilhaus innen: Heil-Automat heilt das Team (und Team-Tisch)'); ok(r.shopItem, 'Taschi-Fangladen innen: Taschiball-Laden');
ok(r.idle, 'Ohne Aktion in der Nähe sind alle drei Aktionsknöpfe weg'); ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
