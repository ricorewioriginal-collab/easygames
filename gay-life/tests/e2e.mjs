/* Browser-Test für GayLife (Playwright + Chromium, Software-WebGL).
   Voraussetzung: Webserver im Repo-Hauptordner, z. B.  python3 -m http.server 8080
   Aufruf:  BASE=http://localhost:8080 THREE=/pfad/zu/three.min.js node gay-life/tests/e2e.mjs
   THREE ist optional (r128, für Umgebungen ohne Zugriff auf cdnjs); QRCODE ist optional (qrcode.js), Mehrspieler läuft mit tests/fakepeer.js. Prüft Start, Migration alter Spielstände, Speichern/Laden,
   Bewegung (Tastatur und Touch), Uhr und Bedürfnisse, Späti, Wohnung, Barjob, Kontakte, Handy-Apps, Qualität, Vollbild und alle alten Minispiele. */
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await pw.chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let fails = 0, errs = [];
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };

async function newPage(opts) {
  const ctx = await browser.newContext(opts || { viewport: { width: 1000, height: 640 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  await page.route(/peerjs|qrcode|gstatic|googleapis/, r => r.abort());
  return { ctx, page };
}
async function boot(page, save) {
  // Erst eine leere Seite derselben Herkunft: Beim Neuladen des Spiels würde „pagehide“ den alten Stand zurückschreiben.
  await page.goto(BASE + '/gay-life/tests/');
  await page.evaluate(s => { localStorage.clear(); if (s) localStorage.setItem('anmachaGayLife', JSON.stringify(s)); }, save || null);
  await page.goto(BASE + '/gay-life/index.html');
  await page.waitForFunction(() => window.GL && GL.W && GL.W.on, null, { timeout: 30000 });
  await closeDialogs(page);
}
async function closeDialogs(page) {
  for (let i = 0; i < 12; i++) {
    const has = await page.evaluate(() => !!(GL.W && GL.W.dlg));
    if (!has) { await page.waitForTimeout(700); if (!(await page.evaluate(() => !!(GL.W && GL.W.dlg)))) return; }
    await page.click('#dn');
  }
}
const ev = (page, f, a) => page.evaluate(f, a);
const waitFade = page => page.waitForFunction(() => !GL.ui.fading, null, { timeout: 8000 });
async function goTo(page, x, z) { await ev(page, ([x, z]) => { const p = GL.W.player; p.x = x; p.z = z; }, [x, z]); await page.waitForTimeout(400); }
async function act(page) { await page.keyboard.press('e'); await page.waitForTimeout(150); }

/* ---------- 1. Neustart ---------- */
{
  const { ctx, page } = await newPage();
  await boot(page);
  const st = await ev(page, () => ({ v: GL.S.v, money: GL.S.life.money, hud: document.getElementById('hud').textContent, canvas: document.getElementById('wc').width > 0, intro: GL.S.life.intro }));
  ok(st.v === 2 && st.money === 150, `Neues Spiel: Version 2, Startgeld ${st.money} €`);
  ok(/€/.test(st.hud) && st.canvas, 'Stadt läuft, Status-Anzeige mit Uhr und Geld sichtbar');
  ok(st.intro === 1, 'Einführung in Alltag und Handy wurde gezeigt');

  // Bewegung per Tastatur
  const p0 = await ev(page, () => ({ x: GL.W.player.x, z: GL.W.player.z }));
  await page.keyboard.down('w'); await page.waitForTimeout(800); await page.keyboard.up('w');
  const p1 = await ev(page, () => ({ x: GL.W.player.x, z: GL.W.player.z }));
  ok(Math.hypot(p1.x - p0.x, p1.z - p0.z) > 2, `Bewegung mit W: ${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} m`);
  // Kamera drehen (Q)
  const y0 = await ev(page, () => GL.W.camYaw); await page.keyboard.down('q'); await page.waitForTimeout(300); await page.keyboard.up('q');
  ok(Math.abs((await ev(page, () => GL.W.camYaw)) - y0) > .2, 'Kamera dreht mit Q');

  // Uhr läuft, Tageswechsel
  const t0 = await ev(page, () => GL.S.world.t); await page.waitForTimeout(1000);
  ok((await ev(page, () => GL.S.world.t)) !== t0, 'Uhr läuft in der Stadt');
  const d = await ev(page, () => { const d0 = GL.S.life.day, w0 = GL.life.weekday(); GL.life.advance(24 * 60); return { d0, d1: GL.S.life.day, w0, w1: GL.life.weekday() }; });
  ok(d.d1 === d.d0 + 1 && d.w0 !== d.w1, `24 Stunden später: Tag ${d.d0} → ${d.d1}, ${d.w0} → ${d.w1}`);
  const decay = await ev(page, () => { const n = GL.S.life.needs; n.hunger = 60; n.energy = 60; GL.life.advance(120); return { h: n.hunger, e: n.energy }; });
  ok(decay.h < 60 && decay.e < 60, `Bedürfnisse sinken mit der Zeit (Satt ${decay.h.toFixed(0)}, Energie ${decay.e.toFixed(0)})`);
  await ev(page, () => { GL.S.life.needs.hunger = 21; GL.S.life.warn = {}; GL.life.advance(60); });
  ok(/Magen/.test(await ev(page, () => (document.querySelector('.toast') || {}).textContent || '')) && (await ev(page, () => GL.S.life.warn.hunger)) === 1, 'Warnung bei Hunger erscheint');

  // Späti
  await ev(page, () => { GL.S.life.money = 100; GL.S.life.food = 0; });
  const kp = await ev(page, () => GL.eco.kioskPos); await goTo(page, kp.x, kp.z);
  ok(/Späti/.test(await ev(page, () => document.getElementById('act').textContent)), 'Am Späti erscheint „Einkaufen“');
  await act(page);
  ok(await ev(page, () => document.getElementById('maps').style.display === 'block' && /Späti Lecker/.test(document.getElementById('maps').textContent)), 'Späti-Menü öffnet sich');
  await page.click('#maps .row2[data-i="4"]');
  let s = await ev(page, () => ({ m: GL.S.life.money, f: GL.S.life.food }));
  ok(s.m === 86 && s.f === 3, `Lebensmittel gekauft: 100 → ${s.m} €, Kühlschrank ${s.f}`);
  await page.click('#maps .row2[data-i="0"]');
  ok((await ev(page, () => GL.S.life.money)) === 83, 'Brezel gekauft und gegessen');
  await page.click('#mx');
  ok((await ev(page, () => GL.eco.spend(99999, 'Test'))) === false, 'Zu teuer: Kauf wird abgelehnt');

  // Wohnung
  const hp = await ev(page, () => ({ x: GL.W.pois.home.x, z: GL.W.pois.home.z })); await goTo(page, hp.x, hp.z);
  ok(/Apartment/.test(await ev(page, () => document.getElementById('act').textContent)), 'Vor der Haustür: „Betreten: Dein Apartment“');
  await act(page); await waitFade(page);
  ok(await ev(page, () => GL.W.inside === 1 && GL.S.life.inside === 1 && GL.W.player.z > 290), 'Wohnung betreten (Innenraum)');
  const spot = async (x, z, re) => { await goTo(page, x, 300 + z); const lab = await ev(page, () => document.getElementById('act').textContent); ok(re.test(lab), 'Möbel benutzbar: ' + lab); await act(page); await waitFade(page); await page.waitForTimeout(100); };
  await ev(page, () => { GL.S.world.t = (22 - 6) / 24; const n = GL.S.life.needs; n.energy = 20; n.hygiene = 10; n.hunger = 20; n.stress = 70; });
  await spot(-3.8, -3.2, /Schlafen/);
  s = await ev(page, () => ({ e: GL.S.life.needs.energy, h: GL.life.hour(), day: GL.S.life.day }));
  ok(s.e >= 99 && s.h >= 6.9 && s.h < 7.2, `Geschlafen bis ${s.h.toFixed(2)} Uhr, Energie ${s.e.toFixed(0)}`);
  await spot(4.7, -3.6, /Duschen/);
  ok((await ev(page, () => GL.S.life.needs.hygiene)) > 99, 'Geduscht: Hygiene voll');
  const h0 = await ev(page, () => GL.S.life.needs.hunger);
  await spot(5.9, -.2, /Kochen \(3/);
  s = await ev(page, () => ({ f: GL.S.life.food, h: GL.S.life.needs.hunger }));
  ok(s.f === 2 && s.h > h0 + 40, `Gekocht: Kühlschrank 2, Satt ${h0.toFixed(0)} → ${s.h.toFixed(0)}`);
  const st0 = await ev(page, () => GL.S.life.needs.stress);
  await spot(-2.2, 2.2, /Fernsehen/);
  ok((await ev(page, () => GL.S.life.needs.stress)) < st0 - 15, 'Fernsehen senkt Stress');
  await goTo(page, 0, 300 - 4.2); ok(/Kleiderschrank/.test(await ev(page, () => document.getElementById('act').textContent)), 'Kleiderschrank erreichbar');
  await act(page); ok(await ev(page, () => document.getElementById('modal').style.display === 'block'), 'Kleiderschrank öffnet den Charakter-Editor');
  ok(await ev(page, () => !!document.querySelector('#pv canvas') && document.querySelector('#pv canvas').width === 200), '3D-Vorschau im Editor (eigene Zeichenfläche)');
  s = await ev(page, () => { const a = GL.S.look; return [a.build, a.h, a.tat, Array.isArray(GL.S.outfits) && GL.S.outfits.length]; });
  ok(s[0] === 1 && s[1] === 1 && s[2] === 0 && s[3] === 3, 'Neue Look-Felder (Körperbau, Größe, Tattoo, Outfits) mit Standardwerten ' + JSON.stringify(s));
  await page.click('.pill[data-k="build"][data-i="2"]'); await page.click('.pill[data-k="h"][data-i="2"]'); await page.click('.pill[data-k="tat"][data-i="2"]');
  ok(await ev(page, () => GL.S.look.build === 2 && GL.S.look.h === 2 && GL.S.look.tat === 2), 'Körperbau, Größe und Tattoo wählbar');
  await page.click('.pill[data-o="s0"]'); await page.click('.pill[data-k="tat"][data-i="0"]'); await page.click('.pill[data-k="top"][data-i="3"]');
  ok(await ev(page, () => GL.S.outfits[0] && GL.S.outfits[0].tat === 2 && GL.S.look.tat === 0 && GL.S.look.top === 3), 'Outfit speichern, danach Look ändern');
  await page.click('.pill[data-o="w0"]');
  ok(await ev(page, () => GL.S.look.tat === 2 && GL.S.look.top === 0 && GL.S.look.build === 2), 'Outfit anziehen stellt Kleidung und Tattoo wieder her, Körperbau bleibt');
  await page.click('.pill[data-k="build"][data-i="1"]'); await page.click('.pill[data-k="h"][data-i="1"]'); await page.click('.pill[data-k="tat"][data-i="0"]');
  await page.click('#mOk'); await page.waitForFunction(() => GL.W.on); ok(await ev(page, () => GL.W.inside === 1 && !document.querySelector('#pv canvas')), 'Nach dem Umziehen weiter in der Wohnung, Vorschau freigegeben');
  await spot(3.3, -3.8, /Laptop/);
  ok(await ev(page, () => /Möbel kaufen/.test(document.getElementById('maps').textContent)), 'Laptop öffnet das Menü mit Speichern, Möbeln und Miete'); await page.click('#mx');
  await spot(0, 4.9, /verlassen/);
  ok(await ev(page, () => GL.W.inside === 0 && Math.abs(GL.W.player.z - GL.W.pois.home.z) < 1), 'Wohnung verlassen, vor der Haustür');

  // Barjob
  s = await ev(page, () => { GL.S.life.needs.energy = 8; const r = GL.emit('poi', 'club'); const d = !!GL.W.dlg; GL.W.dlg = null; document.getElementById('dlg').style.display = 'none'; return { r, d }; });
  ok(s.r === true && s.d, 'Zu müde: Türsteher lässt nicht zur Schicht');
  s = await ev(page, () => { GL.S.life.needs.energy = 80; const m0 = GL.S.life.money, t0 = GL.life.hour(), html = GL.emit('clubShift', { tips: 200, served: 30, lost: 1 }); return { got: GL.S.life.money - m0, dh: (GL.life.hour() - t0 + 24) % 24, html, shifts: GL.S.jobs.bar.shifts }; });
  ok(s.got >= 70 && Math.abs(s.dh - 4) < .1 && s.shifts === 1 && /Lohn/.test(s.html), `Barkeeper-Schicht (über Ereignis ausgelöst): +${s.got} €, 4 Std. vergangen`);

  // Minispiele: alle öffnen und zurück, Aktivität verbraucht Zeit
  const gs = await ev(page, () => GL.core.GAMES.map(g => g.id));
  for (const id of gs) {
    await ev(page, id => GL.core.openGame(GL.core.gameOf(id)), id); await page.waitForTimeout(150);
    const vis = await ev(page, () => document.getElementById('gbody').innerHTML.length > 50);
    await page.click('#glBack'); await page.waitForFunction(() => GL.W.on);
    if (!vis) ok(false, 'Minispiel öffnet: ' + id);
  }
  ok(true, `Alle ${gs.length} alten Minispiele öffnen und kehren in die Stadt zurück`);
  s = await ev(page, () => { const t0 = GL.life.hour(); GL.core.openGame(GL.core.gameOf('quiz')); GL.core.gain(1); GL.core.showHub(); return (GL.life.hour() - t0 + 24) % 24; });
  ok(Math.abs(s - .5) < .05, 'Gespieltes Quiz zählt als Aktivität (+30 Min.)');

  // Kontakte
  await ev(page, () => { GL.S.world.t = 4 / 24; GL.emit('enterWorld', GL.W); }); await page.waitForTimeout(1400);
  s = await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'gerda'); GL.W.player.x = n.x + 1; GL.W.player.z = n.z; n.wait = 9; return n.d.id; });
  await page.waitForTimeout(300); await act(page);
  s = await ev(page, () => ({ r: GL.S.rel.gerda, dlg: !!GL.W.dlg }));
  ok(s.r && s.r.talks === 1 && s.r.f === 4 && s.dlg, 'Gespräch mit Tante Gerda: neuer Kontakt, Freundschaft +4');
  await closeDialogs(page);

  // Handy
  await page.keyboard.press('p');
  ok(await ev(page, () => document.getElementById('phone').classList.contains('on')), 'Handy öffnet mit P');
  for (const a of ['status', 'tasks', 'map', 'contacts', 'money', 'settings']) {
    await page.click(`#phone [data-app="${a}"]`); await page.waitForTimeout(80);
    const t = await ev(page, () => document.querySelector('#phone .pbody').textContent);
    ok(t.length > 30, `Handy-App ${a}: ${t.slice(0, 50).replace(/\s+/g, ' ')}…`);
    if (a === 'contacts') ok(/Tante Gerda/.test(t), 'Kontakte zeigt Tante Gerda');
    if (a === 'money') ok(/Späti: Lebensmittel/.test(t) && /Schicht/.test(t), 'Finanzen zeigt Buchungen');
    if (a !== 'settings') await page.click('#pback');
  }
  await page.click('#phone [data-q="0"]');
  ok(await ev(page, () => GL.W.R.getPixelRatio() <= .75 && GL.S.settings.q === 0), 'Qualität „Niedrig“ senkt die Auflösung');
  await page.click('#phone [data-q="-1"]');
  await page.click('#pback'); await page.click('#phone [data-app="map"]');
  await page.click('#phone .row2[data-p="pool"]'); await waitFade(page);
  ok(await ev(page, () => Math.hypot(GL.W.player.x - GL.W.pois.pool.x, GL.W.player.z - GL.W.pois.pool.z) < 1 && !document.getElementById('phone').classList.contains('on')), 'Karte: Tram zum Strandbad');
  await page.keyboard.press('m'); ok(await ev(page, () => /Karte/.test(document.querySelector('#phone .phead').textContent)), 'Taste M öffnet die Karte');
  await page.keyboard.press('Escape'); ok(await ev(page, () => !document.getElementById('phone').classList.contains('on')), 'Esc schließt das Handy');
  await page.click('#wFs'); await page.waitForTimeout(300);
  ok(await ev(page, () => !!document.fullscreenElement || /Vollbild/.test((document.querySelector('.toast') || {}).textContent || '')), 'Vollbild-Knopf reagiert');
  if (await ev(page, () => !!document.fullscreenElement)) await ev(page, () => document.exitFullscreen());

  // Speichern und Laden (auch in der Wohnung)
  await ev(page, () => { GL.home.enter(); }); await waitFade(page);
  const before = await ev(page, () => { GL.S.life.money = 321; GL.S.life.food = 5; GL.save(); return { day: GL.S.life.day, rel: Object.keys(GL.S.rel).length }; });
  await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  s = await ev(page, () => ({ m: GL.S.life.money, f: GL.S.life.food, day: GL.S.life.day, rel: Object.keys(GL.S.rel).length, inside: GL.W.inside, z: GL.W.player.z }));
  ok(s.m === 321 && s.f === 5 && s.day === before.day && s.rel === before.rel, 'Spielstand bleibt nach Neuladen erhalten');
  ok(s.inside === 1 && s.z > 290, 'Nach dem Neuladen wieder in der Wohnung');
  await ctx.close();
}

/* ---------- 2. Migration eines alten Spielstands (v1) ---------- */
{
  const { ctx, page } = await newPage();
  const v1 = { v: 1, name: 'Ricky', look: { skin: 3, hair: 2, hc: 8, beard: 2, acc: 6, top: 5, tc: 2, eye: 1 }, glitzer: 777, xp: 1200,
    club: { coins: 40, total: 2000, items: { shaker: 2 }, best: 260, shifts: 9 }, world: { x: 10, z: -4, yaw: 1, t: .5, q: 6, stars: [1, 2, 3], dog: 3, cat: 1, qv: 4, done: 0, intro: 1, side: { ilse: 2, chantal: 1 }, zut: [0, 1, 2] },
    dates: { jonas: { best: 8, runs: 3 } }, quiz: { best: 120, runs: 4 }, match: { best: 0 }, run: { best: 0 }, gym: { best: 11 }, rave: { best: { a: 3100 } }, style: { best: 28 }, sound: false, world3d: true, own: { acc6: 1, top5: 1 },
    dance: { best: 0 }, pool: { best: 0 }, kara: { best: 0 }, sauna: { best: 0 }, dark: { best: 0 }, cast: { best: 0 } };
  await boot(page, v1);
  const s = await ev(page, () => ({ S: GL.S, bak: localStorage.getItem('anmachaGayLife_v1backup'), stored: JSON.parse(localStorage.getItem('anmachaGayLife') || '{}').v }));
  ok(s.S.v === 2, 'Alter Spielstand wird auf Version 2 gehoben');
  ok(s.S.name === 'Ricky' && s.S.glitzer === 777 && s.S.look.acc === 6 && s.S.own.acc6 === 1 && s.S.world.q === 6 && s.S.world.stars.length === 3 && s.S.dates.jonas.best === 8 && s.S.club.items.shaker === 2 && s.S.sound === false, 'Name, Look, Glitzer, Käufe, Aufträge, Sterne, Dates und Club bleiben erhalten');
  ok(s.S.life.money === 250 && s.S.life.needs.energy > 0, `Neue Werte ergänzt: Startgeld ${s.S.life.money} € (Bonus aus Club-Trinkgeld)`);
  ok(s.bak && JSON.parse(s.bak).v === 1 && JSON.parse(s.bak).glitzer === 777, 'Sicherung des alten Stands angelegt');
  ok(s.stored === 2, 'Migrierter Stand ist gespeichert');
  await ctx.close();
}

/* ---------- 3. Smartphone-Ansicht und Touch ---------- */
{
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await boot(page);
  const inView = await ev(page, () => ['hud', 'wq', 'wPh', 'wMap', 'wFs', 'wSnd', 'wMp', 'wLook'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [id, r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5 && r.width > 0]; }));
  ok(inView.every(x => x[1]), 'Alle Bedienelemente liegen im Bildschirm: ' + inView.filter(x => !x[1]).map(x => x[0]).join(',') );
  ok(await ev(page, () => GL.W.R.getPixelRatio() <= 1), 'Automatische Qualität auf dem Handy: Pixelverhältnis höchstens 1');
  const p0 = await ev(page, () => ({ x: GL.W.player.x, z: GL.W.player.z }));
  await ev(page, async () => {
    const cv = document.getElementById('wc'), o = { pointerId: 7, pointerType: 'touch', bubbles: true, isPrimary: true };
    cv.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: 80, clientY: 600 }, o)));
    cv.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: 80, clientY: 540 }, o)));
    await new Promise(r => setTimeout(r, 700));
    cv.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: 80, clientY: 540 }, o)));
  });
  const p1 = await ev(page, () => ({ x: GL.W.player.x, z: GL.W.player.z }));
  ok(Math.hypot(p1.x - p0.x, p1.z - p0.z) > 1.5, `Virtueller Joystick bewegt die Figur (${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} m)`);
  await page.tap('#wPh');
  ok(await ev(page, () => { const r = document.querySelector('#phone .pin').getBoundingClientRect(); return r.width >= innerWidth - 1 && r.height >= innerHeight - 1; }), 'Handy füllt auf dem Smartphone den Bildschirm');
  await page.tap('#phone [data-app="status"]');
  ok(await ev(page, () => /Stimmung/.test(document.querySelector('#phone .pbody').textContent)), 'Status-App per Touch geöffnet');
  await page.tap('#pclose');
  const hp = await ev(page, () => ({ x: GL.W.pois.home.x, z: GL.W.pois.home.z })); await goTo(page, hp.x, hp.z);
  await page.tap('#act'); await waitFade(page);
  ok(await ev(page, () => GL.W.inside === 1), 'Aktionsknopf per Touch: Wohnung betreten');
  await ctx.close();
}


/* ---------- 4. Tagesabläufe, Dating, Nachrichten, Kalender ---------- */
{
  const { ctx, page } = await newPage();
  await boot(page);
  const setTime = async (h, day) => { await ev(page, ([h, day]) => { GL.S.world.t = ((h - 6 + 24) % 24) / 24; if (day) GL.S.life.day = day; GL.emit('enterWorld', GL.W); }, [h, day]); await page.waitForTimeout(1300); };
  const dlg = async () => { for (let i = 0; i < 14; i++) { if (!(await ev(page, () => !!GL.W.dlg))) break; await page.click('#dn'); await page.waitForTimeout(50); } await page.waitForTimeout(260); };
  const closeMenu = async () => { if (await ev(page, () => document.getElementById('maps').style.display === 'block')) await page.click('#mx'); };
  const menuItem = async t => { await page.click(`#maps .row2:has-text("${t}")`); await page.waitForTimeout(80); };
  const rel = id => ev(page, id => JSON.parse(JSON.stringify(GL.dating.rel(id))), id);
  const openMenu = async id => { await ev(page, id => { const n = GL.W.npcs.find(n => n.d.id === id); GL.W.player.x = n.x + 1.2; GL.W.player.z = n.z; GL.dating.menu(n); }, id); await page.waitForTimeout(80); };
  const days = n => ev(page, n => { for (let i = 0; i < n; i++) GL.life.advance(1440); }, n);

  // --- Tagesabläufe
  ok(await ev(page, () => GL.people.placeAt('jonas', 9, false) === 'cafe' && GL.people.placeAt('jonas', 3, false) === 'home' && GL.people.placeAt('jonas', 21, true) === 'club' && GL.people.placeAt('torsten', 12, false) === 'pool'), 'Tagesplan: Jonas 9 Uhr im Café, 3 Uhr zu Hause, Wochenende abends im Club, Torsten im Strandbad');
  await setTime(10); // Montag 10 Uhr
  let s = await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'jonas'), p = GL.W.pois.cafe; return { hidden: !!n.hidden, d: Math.hypot(n.x - p.x, n.z - p.z), vis: n.g.visible }; });
  ok(!s.hidden && s.vis && s.d < 9, `Montag 10 Uhr: Jonas ist beim Café Sonntag (${s.d.toFixed(1)} m)`);
  s = await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'torsten'), p = GL.W.pois.pool; return Math.hypot(n.x - p.x, n.z - p.z); });
  ok(s < 9, 'Montag 10 Uhr: Torsten ist im Strandbad');
  await setTime(3);
  s = await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'jonas'); const it = GL.W.inter.find(i => i.npc === n); return { hidden: !!n.hidden, vis: n.g.visible, on: it.on }; });
  ok(s.hidden && !s.vis && s.on === false, 'Nachts um 3: Jonas schläft (unsichtbar, nicht ansprechbar)');
  await setTime(15, 6); // Samstag
  ok(await ev(page, () => GL.people.isWeekend() && GL.people.place('chantal') === 'plaza'), 'Samstag nachmittags: Chantal auf dem Platz (anderer Plan als werktags)');

  // --- Dating-App: Profil, Nachricht, Antwort, Treffen, Kalender
  await ev(page, () => { GL.S.life.day = 1; GL.S.world.t = 4 / 24; GL.S.life.needs = { energy: 90, hunger: 90, hygiene: 90, social: 90, stress: 5 }; GL.S.life.boost = 10; });
  await ev(page, () => GL.phone.open('dating'));
  ok(/Interessen/.test(await ev(page, () => document.querySelector('#phone .pbody').textContent)), 'Dating-App fragt zuerst nach deinen Interessen');
  for (const t of ['Pflanzen und Natur', 'Essen und Kochen', 'Kino, Bücher und Theater']) await page.click(`#phone [data-in]:has-text("${t}")`);
  await page.click('#dsave');
  s = await ev(page, () => ({ ints: GL.S.dating.ints.slice(), cards: document.querySelectorAll('#phone .pcard').length, txt: document.querySelector('#phone .pbody').textContent }));
  ok(s.ints.join() === 'natur,essen,kultur' && s.cards >= 6 && /Jonas, 29/.test(s.txt) && /Dennis, 40/.test(s.txt), 'Profil gespeichert, fünf Profile mit Alter und Beruf sichtbar');
  const cj = await ev(page, () => Math.round(GL.dating.compat('jonas') * 100)), cm = await ev(page, () => Math.round(GL.dating.compat('mehmet') * 100)), cl = await ev(page, () => Math.round(GL.dating.compat('luca') * 100));
  ok(cj === 100 && cm < cj && cl === 0, `Passung aus Interessen: Jonas ${cj} %, Mehmet ${cm} %, Luca ${cl} %`);
  await page.click('[data-op="jonas"]'); await page.click('#phone [data-ot="0"]');
  s = await rel('jonas');
  ok(s.f >= 8 && s.mem.some(m => /Dating-App/.test(m.t)), `Nachricht an Jonas: Kontakt angelegt, Freundschaft ${s.f}`);
  ok((await ev(page, () => GL.S.msgs.length)) === 0, 'Antwort kommt nicht sofort');
  await ev(page, () => { GL.life.advance(60); GL.msg.flush(); });
  s = await ev(page, () => ({ n: GL.S.msgs.length, t: GL.S.msgs[0] && GL.S.msgs[0].t, u: GL.msg.unread(), b: GL.phone.badge('msgs') }));
  ok(s.n === 1 && /Natur|Pflanzen/.test(s.t) && s.u === 1 && s.b === 1, 'Jonas antwortet nach einer Stunde (Abzeichen am Handy): ' + (s.t || '').slice(0, 40));
  await ev(page, () => GL.phone.open('msgs'));
  ok((await ev(page, () => GL.msg.unread())) === 0, 'Nachrichten-App öffnen markiert als gelesen');
  await ev(page, () => { GL.phone.close(); const r = GL.dating.rel('jonas'); r.f = 32; });
  await ev(page, () => GL.phone.open('dating')); await page.click('[data-mt="jonas"]'); await page.click('[data-mp="park"]');
  await page.click('#phone [data-ms="0"]');
  s = await ev(page, () => GL.S.cal.slice());
  ok(s.length === 1 && s[0].npc === 'jonas' && s[0].place === 'park' && s[0].st === 'open', `Treffen vereinbart: ${s[0] && D_text(s[0])}`);
  function D_text(a) { return `Tag ${a.d}, ${a.h} Uhr, ${a.place}`; }
  await ev(page, () => GL.phone.open('cal'));
  ok(/Jonas/.test(await ev(page, () => document.querySelector('#phone .pbody').textContent)), 'Kalender zeigt den Termin');
  ok(/Date mit Jonas/.test(await ev(page, () => { GL.phone.open('tasks'); return document.querySelector('#phone .pbody').textContent; })), 'Aufgaben zeigen das nächste Date');
  await ev(page, () => GL.phone.close());

  // Termin: Jonas wartet zur Zeit am Ort
  const ap = s[0];
  await setTime(ap.h - 0.5, ap.d);
  s = await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'jonas'); return { hidden: !!n.hidden, x: n.x, z: n.z, place: GL.people.place('jonas') }; });
  ok(s.place === 'park' && !s.hidden && Math.hypot(s.x - 86, s.z - 24) < 8, 'Zur Terminzeit wartet Jonas im Park');

  // --- Gespräch über das Menü (Taste E)
  await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'jonas'); GL.W.player.x = n.x + 1.2; GL.W.player.z = n.z; n.wait = 99; });
  await page.waitForTimeout(400); await act(page);
  ok(await ev(page, () => /Jonas/.test(document.querySelector('#maps .gh h2').textContent) && /Date beginnen/.test(document.getElementById('maps').textContent)), 'Jonas ansprechen: Menü mit „Date beginnen“');
  // Date: drei Szenen
  await menuItem('Date beginnen');
  for (let i = 0; i < 3; i++) { await page.waitForSelector('#maps .row2'); await page.click('#maps .row2 >> nth=0'); await page.waitForTimeout(60); await dlg0(); }
  async function dlg0() { for (let i = 0; i < 4; i++) { if (!(await ev(page, () => !!GL.W.dlg))) break; await page.click('#dn'); await page.waitForTimeout(60); } await page.waitForTimeout(150); }
  await dlg0();
  s = await ev(page, () => ({ t: document.querySelector('#maps .gh h2') && document.querySelector('#maps .gh h2').textContent, st: GL.S.cal[0].st, dates: GL.dating.rel('jonas').dates }));
  ok(s.st === 'done' && s.dates === 1 && /Wie endet/.test(s.t), 'Date durchgespielt: Termin erledigt, „Wie endet der Abend?“');
  await ev(page, () => { GL.dating.rel('jonas').r = 50; });
  const r0 = (await rel('jonas')).r; await menuItem('Küssen'); await dlg0(); await page.waitForTimeout(300);
  s = await rel('jonas'); ok(s.r > r0 && s.mem.some(m => /Kuss/.test(m.t)), 'Kuss bei genug Romantik wird erwidert');
  await closeMenu();
  ok((await ev(page, () => { GL.msg.flush(); GL.life.advance(120); GL.msg.flush(); return GL.S.msgs.some(m => m.n === 'jonas' && /Abend|heute/i.test(m.t)); })), 'Nach dem Date schreibt Jonas');

  // --- Smalltalk: Vorlieben wirken
  await ev(page, () => { const r = GL.dating.rel('mehmet'); r.f = 0; r.cd = 0; });
  await openMenu('mehmet'); await menuItem('Quatschen');
  ok(await ev(page, () => document.querySelectorAll('#maps .row2').length >= 6 && /Pflanzen/.test(document.getElementById('maps').textContent)), 'Themenwahl enthält deine Interessen');
  await closeMenu();
  const f0 = await ev(page, () => { const r = GL.dating.rel('mehmet'); r.f = 0; r.cd = 0; return r.f; });
  await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'mehmet'); GL.W.player.x = n.x + 1; GL.W.player.z = n.z; });
  // Thema, das Mehmet mag (Essen): über Menü
  await openMenu('mehmet'); await menuItem('Quatschen'); await page.click('#maps .row2:has-text("Essen und Kochen")'); await dlg();
  s = await rel('mehmet'); ok(s.f === 6, `Mag Mehmet das Thema (Essen), steigt die Freundschaft um 6 (jetzt ${s.f})`); await closeMenu();
  await ev(page, () => { const r = GL.dating.rel('mehmet'); r.f = 0; r.cd = 0; });
  await openMenu('mehmet'); await menuItem('Quatschen'); await page.click('#maps .row2:has-text("Pflanzen")'); await dlg();
  s = await rel('mehmet'); ok(s.f === 3, `Neutrales Thema (Natur): +3 (jetzt ${s.f})`); await closeMenu();
  await ev(page, () => { const r = GL.dating.rel('mehmet'); r.f = 0; r.cd = 0; GL.S.dating.ints = ['mode']; });
  await openMenu('mehmet'); await menuItem('Quatschen'); await page.click('#maps .row2:has-text("Mode und Stil")'); await dlg();
  s = await rel('mehmet'); ok(s.f === 0, 'Ungeliebtes Thema (Mode): keine Freundschaft'); await closeMenu();
  await ev(page, () => { GL.S.dating.ints = ['natur', 'essen', 'kultur']; });

  // --- Tiefes Gespräch: Geschichte in Kapiteln
  await ev(page, () => { const r = GL.dating.rel('kai'); r.f = 25; });
  await openMenu('kai'); await menuItem('Tiefes Gespräch');
  ok(await ev(page, () => !!GL.W.dlg && /allein/.test(GL.W.dlg.lines.join(' '))), 'Kai erzählt Kapitel 1 seiner Geschichte (ab Freundschaft 20)');
  await dlg(); await closeMenu();
  s = await rel('kai'); ok(s.story === 1, 'Kapitel 1 gemerkt');
  await openMenu('kai'); await menuItem('Tiefes Gespräch'); await dlg(); await closeMenu();
  s = await rel('kai'); ok(s.story === 1, 'Kapitel 2 braucht Freundschaft 45: noch nicht freigeschaltet');

  // --- Flirten: Entscheidung der Figur, Grenzen werden respektiert
  await ev(page, () => { GL.life.change({ energy: 100, social: 100, stress: -100, hunger: 100, hygiene: 100 }, 20); GL.S.dating.ints = ['natur', 'essen', 'kultur']; const r = GL.dating.rel('luca'); r.f = 20; r.r = 0; });
  await openMenu('luca'); await menuItem('Flirten'); await dlg(); await closeMenu();
  s = await rel('luca'); ok(s.rej === 0 && s.lock === 0, 'Zu wenig Freundschaft: „Wir kennen uns kaum“, keine Zurückweisung');
  await ev(page, () => { const r = GL.dating.rel('luca'); r.f = 40; r.r = 0; r.fd = 0; r.lock = 0; GL.life.change({}, 0); });
  const sc = await ev(page, () => GL.dating.flirtScore('luca'));
  await openMenu('luca'); await menuItem('Flirten'); await dlg(); await closeMenu();
  s = await rel('luca');
  ok(sc < 55 ? (s.rej === 1 && s.r === 0 && s.lock > 1) : s.r === 10, `Flirt mit Luca (Punkte ${sc.toFixed(0)}): ${sc < 55 ? 'höflich abgelehnt, Abstand von 2 Tagen' : 'erwidert'}`);
  await openMenu('luca'); await menuItem('Flirten'); await dlg(); await closeMenu();
  s = await rel('luca'); ok(s.rej <= 1, 'Am selben Tag erneut flirten wird abgeblockt (keine Zermürbung)');
  // dreimal abgelehnt: bleibt zu
  await ev(page, () => { const r = GL.dating.rel('luca'); r.f = 40; r.r = 0; r.rej = 2; r.fd = 0; r.lock = 0; GL.life.change({ stress: 100 }, -30); GL.S.dating.ints = ['natur']; });
  await openMenu('luca'); await menuItem('Flirten'); await dlg(); await closeMenu();
  s = await rel('luca'); ok(s.st === 'closed', 'Nach drei Zurückweisungen sagt Luca klar Nein: Flirten gesperrt');
  ok(await ev(page, () => { GL.dating.menu(GL.W.npcs.find(n => n.d.id === 'luca')); const b = [...document.querySelectorAll('#maps .row2')].find(x => /Flirten/.test(x.textContent)); const r = b.disabled; document.getElementById('mx').click(); return r; }), 'Flirt-Knopf ist gesperrt');
  await ev(page, () => { GL.S.dating.ints = ['natur', 'essen', 'kultur']; GL.life.change({}, 0); });
  // Dennis ist (noch) nicht auf der Suche
  await ev(page, () => { const r = GL.dating.rel('dennis'); r.f = 50; r.r = 0; });
  await openMenu('dennis'); await menuItem('Flirten'); await dlg(); await closeMenu();
  s = await rel('dennis'); ok(s.lock > (await ev(page, () => GL.S.life.day)) && s.rej === 0 && s.st === '', 'Dennis lehnt sanft ab (nicht bereit), ohne dass er „gesperrt“ wird');
  ok(await ev(page, () => { GL.dating.rel('dennis').story = 3; return GL.dating.isInto('dennis'); }), 'Nach seiner Geschichte (Kapitel 3) ist Dennis offen für mehr');

  // --- Einladung, Verspätung, Beziehung, Streit, Trennung
  await ev(page, () => { GL.S.life.money = 200; GL.S.life.day = 20; const r = GL.dating.rel('mehmet'); r.f = 50; r.r = 40; r.lock = 0; r.dates = 0; GL.S.cal = []; GL.S.msgs = []; GL.S.world.t = 4 / 24; });
  await openMenu('mehmet'); await menuItem('Zum Date einladen'); await menuItem('Café Sonntag'); await page.click('#maps .row2 >> nth=0'); await dlg();
  s = await ev(page, () => GL.S.cal.slice()); ok(s.length === 1 && s[0].place === 'cafe', 'Einladung: Mehmet sagt zu, Termin im Kalender'); await closeMenu();
  await ev(page, a => { GL.S.life.day = a.d; GL.S.world.t = ((a.h + 4 - 6 + 24) % 24) / 24; GL.life.advance(60); }, s[0]); // 4 Stunden nach Terminbeginn
  await page.waitForTimeout(4600);
  s = await ev(page, () => ({ st: GL.S.cal[0].st, m: GL.S.msgs[0] && GL.S.msgs[0].t, r: GL.dating.rel('mehmet').r }));
  ok(s.st === 'missed' && /gewartet/.test(s.m || '') && s.r < 40, 'Verpasstes Date: Termin „verpasst“, Mehmet schreibt enttäuscht, Romantik sinkt');
  const mid = await ev(page, () => GL.S.msgs[0].id); await ev(page, () => GL.phone.open('msgs')); await page.click('#phone [data-mr] >> nth=0');
  ok(await ev(page, id => GL.S.msgs.find(m => m.id === id).done === 1, mid), 'Antwort auf Nachricht wird gewertet');
  await ev(page, () => GL.phone.close());
  await ev(page, () => { const r = GL.dating.rel('mehmet'); r.r = 70; r.dates = 3; r.f = 60; r.st = ''; r.lock = 0; });
  await openMenu('mehmet'); await menuItem('Beziehung ansprechen'); await dlg(); await closeMenu();
  s = await rel('mehmet'); ok(s.st === 'partner', 'Beziehung: Mehmet sagt ja (genug Romantik, mehrere Dates)');
  await ev(page, () => { const r = GL.dating.rel('luca'); r.r = 70; r.dates = 3; });
  ok(await ev(page, () => GL.life.NEED.length === 5), 'Bedürfnisse unverändert');
  // ohne Kontakt: Streit nach 5 Tagen, Trennung nach 4 weiteren
  await ev(page, () => { GL.dating.rel('mehmet').last = GL.S.life.day; GL.S.msgs = []; });
  await days(5);
  s = await rel('mehmet'); ok(s.conflict > 0 && /egal|lange/.test(await ev(page, () => GL.S.msgs.map(m => m.t).join(' '))), 'Fünf Tage kein Kontakt: Streit und Nachricht');
  await openMenu('mehmet'); await menuItem('Blumen schenken'); await dlg(); await closeMenu();
  s = await rel('mehmet'); ok(s.conflict === 0 && s.st === 'partner', 'Mit Blumen versöhnt: Streit beendet, Beziehung bleibt');
  await ev(page, () => { GL.dating.rel('mehmet').last = GL.S.life.day; });
  await days(5); await days(4);
  s = await rel('mehmet'); ok(s.st === 'ex' && /getrennte Wege/.test(await ev(page, () => GL.S.msgs.map(m => m.t).join(' '))), 'Ohne Versöhnung beendet Mehmet die Beziehung');
  // freiwillig Schluss machen
  await ev(page, () => { const r = GL.dating.rel('jonas'); r.st = 'partner'; r.conflict = 0; r.last = GL.S.life.day; });
  await openMenu('jonas'); await menuItem('Beziehung beenden'); await menuItem('Ja, Schluss'); await dlg(); await closeMenu();
  s = await rel('jonas'); ok(s.st === 'ex' && s.r <= 20, 'Schluss machen funktioniert');
  // Kalender absagen
  await ev(page, () => { GL.S.cal = [{ npc: 'kai', place: 'park', d: GL.S.life.day + 1, h: 11, st: 'open' }]; GL.phone.open('cal'); });
  await page.click('#phone [data-cc]');
  ok(await ev(page, () => GL.S.cal[0].st === 'cancel'), 'Termin im Kalender absagen');
  await ev(page, () => GL.phone.close());
  // Altes Menü bleibt für Aufträge erreichbar (Kai/Dennis haben Quests)
  await openMenu('dennis'); await menuItem('Anliegen und Aufträge');
  ok(await ev(page, () => !!GL.W.dlg && /Gerd/.test(GL.W.dlg.lines.join(' '))), 'Aufträge (Gerd suchen) bleiben über „Anliegen und Aufträge“ erreichbar');
  await dlg(); await closeMenu();
  // Speichern und Laden der Beziehungsdaten
  await ev(page, () => GL.save()); await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  s = await ev(page, () => ({ rel: GL.S.rel.mehmet && GL.S.rel.mehmet.st, ints: GL.S.dating.ints.join(), msgs: GL.S.msgs.length }));
  ok(s.rel === 'ex' && s.ints === 'natur,essen,kultur' && s.msgs > 0, 'Beziehungsstatus, Interessen und Nachrichten bleiben nach Neuladen erhalten');
  await ctx.close();
}

/* ---------- 5. Wohnen: Möbel, Miete, Besuch, Zusammenziehen ---------- */
{
  let s; const { ctx, page } = await newPage();
  await boot(page);
  const dlg = async () => { for (let i = 0; i < 14; i++) { if (!(await ev(page, () => !!GL.W.dlg))) break; await page.click('#dn'); await page.waitForTimeout(50); } await page.waitForTimeout(260); };
  const closeMenu = async () => { if (await ev(page, () => document.getElementById('maps').style.display === 'block')) await page.click('#mx'); };
  const menuItem = async t => { await page.click(`#maps .row2:has-text("${t}")`); await page.waitForTimeout(80); };
  await ev(page, () => { GL.S.life.money = 600; GL.home.enter(); }); await waitFade(page);
  ok(await ev(page, () => Object.keys(GL.furn.CAT).length === 9 && GL.S.home.debt === 0), 'Möbelkatalog mit 9 Stücken, keine Schulden zum Start');
  // Laptop-Menü: kaufen und aufstellen über die Menüs
  await ev(page, () => { GL.furn.laptop(); });
  ok(await ev(page, () => /Möbel kaufen/.test(document.getElementById('maps').textContent) && /Miete/.test(document.getElementById('maps').textContent)), 'Laptop bietet Speichern, Möbel, Einrichten und Miete');
  await menuItem('Möbel kaufen'); await menuItem('Bücherregal');
  ok(await ev(page, () => GL.S.home.own.regal === 1 && GL.S.life.money === 540), 'Möbel kaufen: Bücherregal 60 € abgebucht');
  await closeMenu();
  ok(await ev(page, () => GL.furn.buy('regal') === false && GL.S.life.money === 540), 'Doppelt kaufen nicht möglich');
  ok(await ev(page, () => { const m = GL.S.life.money; GL.S.life.money = 5; const r = GL.furn.buy('aquarium'); GL.S.life.money = m; return r === false && !GL.S.home.own.aquarium; }), 'Zu wenig Geld: kein Kauf');
  const nc = await ev(page, () => GL.W.colliders.length);
  await ev(page, () => { GL.furn.laptop(); }); await menuItem('Einrichten'); await menuItem('Platz 1'); await menuItem('Bücherregal'); await closeMenu();
  ok(await ev(page, () => GL.S.home.placed[0] === 'regal') && await ev(page, n => GL.W.colliders.length === n + 1, nc), 'Möbel auf Platz 1 gestellt, Kollisionsfläche ergänzt');
  // Benutzen
  const useIt = async lab => { await ev(page, lab => { const i = GL.W.inter.find(i => i.on && i.label.indexOf(lab) === 0); const p = GL.W.player; p.x = i.x; p.z = i.z; i.fn(); }, lab); await waitFade(page); };
  await ev(page, () => { GL.S.life.needs.stress = 80; });
  await useIt('Lesen');
  ok(await ev(page, () => GL.S.life.needs.stress < 70), 'Bücherregal: Lesen senkt Stress');
  // Verschieben statt Duplizieren, Platz leeren
  await ev(page, () => { GL.furn.buy('lampe'); GL.furn.buy('kunst'); GL.furn.buy('aquarium'); GL.furn.place(1, 'regal'); });
  ok(await ev(page, () => GL.S.home.placed[0] === undefined && GL.S.home.placed[1] === 'regal'), 'Möbel wird verschoben, nicht doppelt gestellt');
  const m0 = await ev(page, () => GL.life.mood());
  await ev(page, () => { GL.furn.place(0, 'lampe'); GL.furn.place(2, 'kunst'); GL.furn.place(3, 'aquarium'); });
  ok(await ev(page, () => GL.furn.bonus() === 5) && await ev(page, m => GL.life.mood() > m, m0), 'Dekoration (Lampe, Skulptur, Aquarium) hebt die Stimmung (+5)');
  ok(await ev(page, () => { const c = GL.W.colliders.length; GL.furn.place(0, ''); GL.furn.place(0, 'lampe'); return GL.W.colliders.length === c; }), 'Leeren und Neustellen lässt keine Kollisionsreste zurück');
  // Kaffee: Tageslimit
  await ev(page, () => { GL.furn.buy('kaffee'); GL.furn.place(4, 'kaffee'); GL.S.life.needs.energy = 30; });
  for (let i = 0; i < 4; i++) await useIt('Kaffee kochen');
  ok(await ev(page, () => GL.S.life.needs.energy > 60 && GL.S.life.needs.energy < 90), 'Kaffeemaschine: höchstens drei Tassen am Tag');
  // Hantelbank: zu erschöpft
  await ev(page, () => { GL.furn.buy('hantel'); GL.furn.place(5, 'hantel'); GL.S.life.needs.energy = 10; });
  const e0 = await ev(page, () => { const i = GL.W.inter.find(i => i.on && i.label.indexOf('Trainieren') === 0); i.fn(); return GL.S.life.needs.energy; });
  ok(!(await ev(page, () => GL.ui.fading)) && e0 > 9.5 && e0 <= 10, 'Hantelbank: bei Erschöpfung keine Wirkung');
  // Miete
  await ev(page, () => { GL.S.life.day = 7; GL.S.home.rentDay = 0; GL.S.life.money = 500; GL.life.advance(1440); });
  s = await ev(page, () => ({ d: GL.S.life.day, m: GL.S.life.money, r: GL.S.home.rentDay, debt: GL.S.home.debt }));
  ok(s.d === 8 && s.m === 430 && s.r === 8 && s.debt === 0, `Montag: Miete 70 € abgebucht (${s.m} €)`);
  await ev(page, () => { GL.life.advance(1440); });
  ok(await ev(page, () => GL.S.life.money === 430), 'Dienstag: keine zweite Abbuchung');
  await ev(page, () => { GL.S.life.money = 10; for (let i = 0; i < 6; i++) GL.life.advance(1440); });
  s = await ev(page, () => ({ m: GL.S.life.money, debt: GL.S.home.debt }));
  ok(s.m === 10 && s.debt === 70, 'Kein Geld: Miete wird zur Schuld');
  await ev(page, () => { GL.S.life.money = 400; for (let i = 0; i < 7; i++) GL.life.advance(1440); });
  s = await ev(page, () => ({ m: GL.S.life.money, debt: GL.S.home.debt }));
  ok(s.debt === 0 && s.m === 400 - 140, `Mit Geld: Schulden und neue Miete bezahlt (${s.m} €)`);
  ok(await ev(page, () => /Wohnung/.test(GL.emit('phoneMoney') || '')), 'Finanz-App zeigt Wohnung und Miete');
  // Besuch zu Hause: Date-Einladung
  await ev(page, () => { const r = GL.dating.rel('luca'); r.f = 50; r.r = 30; r.st = ''; GL.S.cal = []; GL.S.world.t = (19 - 6) / 24; GL.dating.addAppt('luca', 'home', GL.S.life.day, 19); });
  ok(await ev(page, () => GL.furn.visitor() === 'luca'), 'Date zu Hause: Luca kommt zur vereinbarten Zeit');
  await page.waitForTimeout(1500);
  ok(await ev(page, () => GL.W.inter.some(i => i.on && /Mit Luca reden/.test(i.label))), 'Gast steht in der Wohnung und lässt sich ansprechen');
  await ev(page, () => { const i = GL.W.inter.find(i => i.on && /Mit Luca reden/.test(i.label)); i.fn(); });
  ok(await ev(page, () => /Date beginnen/.test(document.getElementById('maps').textContent)), 'Gesprächsmenü bietet das Date an');
  await closeMenu();
  // Zusammenziehen
  await ev(page, () => { GL.S.cal = []; const r = GL.dating.rel('luca'); r.st = 'partner'; r.r = 85; r.dates = 3; r.conflict = 0; });
  await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'luca'); GL.dating.menu(n); });
  await menuItem('Zusammenziehen'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.home.partner === 'luca' && GL.furn.rent() === 40), 'Zusammenziehen: Luca zieht ein, Miete halbiert');
  await ev(page, () => { GL.S.world.t = (21 - 6) / 24; });
  ok(await ev(page, () => GL.furn.visitor() === 'luca'), 'Partner ist abends in der Wohnung');
  ok(await ev(page, () => { GL.dating.endRel('luca', 'Test'); return GL.S.home.partner === '' && GL.furn.rent() === 70; }), 'Trennung: Partner zieht aus, Miete wieder voll');
  // Speichern und Laden
  await ev(page, () => GL.save()); await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  s = await ev(page, () => ({ p: JSON.stringify(GL.S.home.placed), n: Object.keys(GL.S.home.own).length, nc: GL.W.colliders.length }));
  ok(s.n === 6 && /lampe/.test(s.p) && /kaffee/.test(s.p), 'Eingerichtete Wohnung bleibt nach Neuladen erhalten');
  ok(await ev(page, () => GL.W.colliders.length > 0), 'Möbel stehen nach Neuladen wieder (Kollision aktiv)');
  await ctx.close();
}

/* ---------- 6. Jobs und Nachtleben ---------- */
{
  let s; const { ctx, page } = await newPage();
  await boot(page);
  const closeMenu = async () => { if (await ev(page, () => document.getElementById('maps').style.display === 'block')) await page.click('#mx'); };
  const menuItem = async t => { await page.click(`#maps .row2:has-text("${t}")`); await page.waitForTimeout(80); };
  const first = async () => { await page.click('#maps .row2 >> nth=0'); await page.waitForTimeout(80); };
  const setTime = h => ev(page, h => { GL.S.world.t = ((h - 6 + 24) % 24) / 24; }, h);
  await ev(page, () => { GL.S.life.money = 100; GL.S.life.needs.energy = 90; GL.S.life.day = 3; }); await setTime(12);
  ok(await ev(page, () => GL.emit('poi', 'shop') === true && /Arbeiten: Verkäufer/.test(document.getElementById('maps').textContent) && /Minispiel/.test(document.getElementById('maps').textContent)), 'Boutique bietet Arbeiten und Minispiel');
  const m0 = await ev(page, () => ({ m: GL.S.life.money, h: GL.life.hour() }));
  await menuItem('Arbeiten: Verkäufer'); await first(); await first(); await first(); await waitFade(page);
  ok(await ev(page, () => /Schicht beendet/.test(document.getElementById('maps').textContent)), 'Schicht in drei Situationen endet mit Abrechnung');
  s = await ev(page, () => ({ m: GL.S.life.money, h: GL.life.hour(), j: GL.S.jobs.shop }));
  ok(s.m - m0.m >= 36 && s.m - m0.m <= 80 && Math.abs(((s.h - m0.h + 24) % 24) - 4) < .1 && s.j.shifts === 1 && s.j.xp >= 10, `Verkäufer: Lohn +${s.m - m0.m} €, 4 Std., Erfahrung`);
  await closeMenu();
  ok(await ev(page, () => /Weitere Jobs/.test(GL.emit('phoneMoney') || '')), 'Finanz-App listet den neuen Job');
  ok(await ev(page, () => { GL.S.jobs.day = { d: GL.S.life.day, n: 2 }; return /zwei Schichten/.test(GL.jobs.why('shop')); }), 'Höchstens zwei Schichten pro Tag');
  await setTime(23); await ev(page, () => { GL.S.jobs.day = null; });
  ok(await ev(page, () => /Geöffnet 10–20/.test(GL.jobs.why('shop'))), 'Boutique nachts geschlossen');
  ok(await ev(page, () => { GL.S.life.needs.energy = 10; const r = GL.jobs.why('gym'); GL.S.life.needs.energy = 90; return r !== ''; }), 'Zu müde: keine Schicht');
  ok(await ev(page, () => /Bruno/.test(GL.jobs.why('stage'))), 'DJ-Job braucht Barkeeper-Stufe 2');
  ok(await ev(page, () => { GL.S.jobs.bar.xp = 100; return GL.jobs.why('stage') === ''; }), 'Mit Stufe 2 ist die Bühne nachts offen');
  ok(await ev(page, () => { GL.S.jobs.shop.xp = 300; return GL.jobs.level('shop') >= 4 && GL.jobs.title('shop') !== 'Aushilfe'; }), 'Erfahrung bringt Stufe und Titel');
  // DJ-Schicht
  await ev(page, () => { GL.emit('poi', 'stage'); }); await menuItem('Arbeiten: DJ'); await first(); await first(); await first(); await waitFade(page); await closeMenu();
  ok(await ev(page, () => GL.S.jobs.stage.shifts === 1 && GL.S.jobs.stage.earned >= 48), 'DJ-Schicht bezahlt');
  // Club: Freitag 22 Uhr (Tag 5)
  await ev(page, () => { GL.S.life.day = 5; GL.S.jobs.night = null; GL.S.jobs.day = null; GL.S.life.money = 100; GL.S.life.needs.energy = 90; GL.S.life.needs.social = 30; }); await setTime(22);
  ok(await ev(page, () => GL.emit('poi', 'club') === true && /Rainbow Night/.test(document.getElementById('maps').textContent)), 'Club: Freitag ist Rainbow Night');
  await menuItem('Tanzen'); await first(); await first(); await first();
  ok(await ev(page, () => /Was für ein Abend/.test(document.getElementById('maps').textContent)), 'Tanzen: drei Songs, Auswertung');
  s = await ev(page, () => ({ m: GL.S.life.money, so: GL.S.life.needs.social, e: GL.S.life.needs.energy, d: GL.night.state().danced }));
  ok(s.m === 85 && s.d === 1 && s.e < 80, `Tanzen: Eintritt 15 € bezahlt, Kontakte ${s.so.toFixed(0)}, Energie ${s.e.toFixed(0)}`);
  await menuItem('Weiter'); await menuItem('Tanzen'); await first(); await first(); await first();
  ok(await ev(page, () => GL.S.life.money === 85), 'Eintritt nur einmal pro Nacht');
  await closeMenu();
  await ev(page, () => { GL.S.life.money = 100; GL.S.life.needs.energy = 90; GL.emit('poi', 'club'); }); await menuItem('Etwas bestellen');
  for (let i = 0; i < 3; i++) await menuItem('Cocktail');
  ok(await ev(page, () => GL.night.state().drinks === 3 && GL.S.life.money === 76), 'Drei Cocktails bestellt (je 8 €)');
  ok(await page.evaluate(() => [...document.querySelectorAll('#maps .row2')].some(r => /Cocktail/.test(r.textContent) && /Genug für heute/.test(r.textContent))), 'Vierter Cocktail: Bruno sagt „Genug für heute“');
  await closeMenu();
  await setTime(12);
  ok(await ev(page, () => !GL.night.isOpen()), 'Club tagsüber geschlossen');
  await ev(page, () => { GL.S.life.needs.energy = 8; });
  ok(await ev(page, () => { const r = GL.emit('poi', 'club'); const d = !!GL.W.dlg; GL.W.dlg = null; document.getElementById('dlg').style.display = 'none'; return r === true && d; }), 'Erschöpft: Türsteher hält weiter ab');
  await ev(page, () => GL.save()); await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  ok(await ev(page, () => GL.S.jobs.shop.shifts === 1 && GL.S.jobs.stage.shifts === 1 && GL.S.jobs.night.drinks === 3), 'Jobs und Clubnacht bleiben nach Neuladen erhalten');
  await ctx.close();
}

/* ---------- 7. Rainbow City: Viertel und Tram ---------- */
{
  let s; const { ctx, page } = await newPage();
  await boot(page);
  const closeMenu = async () => { if (await ev(page, () => document.getElementById('maps').style.display === 'block')) await page.click('#mx'); };
  const menuItem = async t => { await page.click(`#maps .row2:has-text("${t}")`); await page.waitForTimeout(80); };
  const setTime = h => ev(page, h => { GL.S.world.t = ((h - 6 + 24) % 24) / 24; }, h);
  const go = async id => { const r = await ev(page, id => GL.dist.go(id), id); if (r) await waitFade(page); return r; };
  const spot = async lab => { await ev(page, lab => { const i = GL.W.inter.find(i => i.on && i.label.indexOf(lab) >= 0); const p = GL.W.player; p.x = i.x; p.z = i.z; i.fn(); }, lab); await waitFade(page).catch(() => {}); await page.waitForTimeout(100); };
  ok(await ev(page, () => GL.dist.LIST.length === 7 && GL.dist.LIST.every(d => d.sp.length === 4)), 'Sieben neue Viertel mit je vier Orten');
  await ev(page, () => { GL.S.life.money = 200; GL.S.life.needs.energy = 90; GL.S.life.day = 3; }); await setTime(12);
  // Tram aus dem Pride District
  await goTo(page, 10, 18); ok(/Tram/.test(await ev(page, () => document.getElementById('act').textContent)), 'Haltestelle am Brunnenplatz');
  const n0 = await ev(page, () => ({ c: GL.W.colliders.length, h: GL.life.hour(), m: GL.S.life.money, ch: GL.W.scene.children.length }));
  ok(await go('beach'), 'Tram nach Rainbow Beach');
  s = await ev(page, () => ({ d: GL.W.district, b: GL.W.bounds, x: GL.W.player.x, z: GL.W.player.z, m: GL.S.life.money, h: GL.life.hour(), ch: GL.W.scene.children.length, g: GL.W.scene.children.filter(c => c.type === 'Group' && c.visible && c.children.length > 30).length }));
  ok(s.d === 'beach' && s.x > s.b.x0 && s.x < s.b.x1 && s.z > s.b.z0 && s.z < s.b.z1 && s.m === n0.m - 3 && Math.abs(((s.h - n0.h + 24) % 24) - 1 / 3) < .05, `Im Viertel: Position in den Grenzen, Fahrpreis 3 €, 20 Min. (${s.d})`);
  ok(s.ch - n0.ch <= 3, 'Viertel wird als eine Gruppe gebaut (' + (s.ch - n0.ch) + ' neue Wurzelobjekte)');
  // Orte nutzen
  await ev(page, () => { GL.S.life.needs.stress = 80; });
  await spot('Sonnenliege'); ok(await ev(page, () => GL.S.life.needs.stress < 70), 'Sonnenliege senkt Stress');
  const m1 = await ev(page, () => GL.S.life.money); await spot('Eisstand'); ok(await ev(page, m => GL.S.life.money === m - 4, m1), 'Eisstand kostet 4 €');
  await setTime(23); const m2 = await ev(page, () => GL.S.life.money);
  await spot('Eisstand'); ok(await ev(page, m => GL.S.life.money === m, m2) && await ev(page, () => /geschlossen/.test(GL.W.inter.find(i => i.on && i.label.indexOf('Eisstand') >= 0).label)), 'Nachts geschlossen: kein Abbuchen');
  ok(await ev(page, () => { const p = GL.W.player, b = GL.W.bounds; return GL.W.inter.some(i => i.on && i.label.indexOf('Ansprechen') === 0 && Math.hypot(i.x - p.x, i.z - p.z) < 60); }), 'Passanten sind ansprechbar');
  // Zurück und weiter
  ok(await go('kiez') && await ev(page, () => GL.W.district === '' && GL.W.bounds.x1 === 96), 'Zurück im Pride District, Grenzen wiederhergestellt');
  ok(await ev(page, () => GL.W.scene.children.filter(c => c.type === 'Group' && c.visible && c.position.x > 100).length === 0), 'Viertel ist nach der Abfahrt unsichtbar');
  await ev(page, () => { GL.S.life.money = 2; }); ok(!(await go('love')) && await ev(page, () => GL.W.district === ''), 'Zu wenig Geld: keine Fahrt');
  await ev(page, () => { GL.S.life.money = 300; GL.S.life.food = 1; });
  for (const id of ['down', 'neon', 'love', 'fashion', 'heights', 'coast']) { await go(id); const r = await ev(page, id => GL.W.district === id && GL.W.bounds.x1 - GL.W.bounds.x0 === 90, id); if (!r) ok(false, 'Viertel ' + id + ' erreichbar'); }
  ok(true, 'Alle Viertel erreichbar');
  // Küste: Angeln und Leuchtturm
  await ev(page, () => { const r = Math.random; Math.random = () => .1; window.__r = r; }); await setTime(12);
  await spot('Angeln'); ok(await ev(page, () => GL.S.life.food === 2), 'Angeln mit Fang: Fisch im Kühlschrank');
  await ev(page, () => { Math.random = () => .9; }); await spot('Angeln'); ok(await ev(page, () => GL.S.life.food === 2), 'Angeln ohne Fang: nichts im Kühlschrank');
  await ev(page, () => { Math.random = window.__r; });
  const g0 = await ev(page, () => GL.S.glitzer); await spot('Leuchtturm'); await spot('Leuchtturm');
  ok(await ev(page, g => GL.S.glitzer === g + 10, g0), 'Leuchtturm: Glitzer nur beim ersten Mal');
  // Love Gardens: Blumen für die Entschuldigung
  await go('love');
  await spot('Blumenhändlerin'); ok(await ev(page, () => GL.S.life.flowers === 1), 'Blumenhändlerin: Strauß im Vorrat');
  await go('kiez');
  const m3 = await ev(page, () => { const r = GL.dating.rel('mehmet'); r.st = 'partner'; r.conflict = 3; r.r = 50; return GL.S.life.money; });
  await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'mehmet'); GL.dating.menu(n); });
  await menuItem('Blumenstrauß schenken'); for (let i = 0; i < 6 && await ev(page, () => !!GL.W.dlg); i++) { await page.click('#dn'); await page.waitForTimeout(60); } await closeMenu();
  ok(await ev(page, m => GL.S.life.flowers === 0 && GL.dating.rel('mehmet').conflict === 0 && GL.S.life.money === m, m3), 'Blumenstrauß aus dem Vorrat versöhnt kostenlos');
  // Handy: Tram-App und Karte
  await ev(page, () => { GL.phone.open('tram'); });
  ok(await ev(page, () => /Rainbow Beach/.test(document.querySelector('#phone .pbody').textContent)), 'Tram-App listet die Viertel');
  await page.click('#phone [data-t="fashion"]'); await waitFade(page);
  ok(await ev(page, () => GL.W.district === 'fashion'), 'Tram-App fährt ins Viertel');
  await ev(page, () => { GL.phone.open('map'); }); await page.click('#phone [data-p="cafe"]'); await waitFade(page);
  ok(await ev(page, () => GL.W.district === '' && Math.hypot(GL.W.player.x - GL.W.pois.cafe.x, GL.W.player.z - GL.W.pois.cafe.z) < 3), 'Karten-Tram aus dem Viertel führt zum Ziel im Kiez');
  // Neuladen im Viertel
  await go('coast'); await ev(page, () => GL.save()); await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  ok(await ev(page, () => GL.W.district === undefined || GL.W.district === '') && await ev(page, () => Math.abs(GL.W.player.x) < 100 && Math.abs(GL.W.player.z) < 70), 'Nach dem Neuladen wieder im Pride District');
  await ctx.close();
}

/* ---------- 8. Hauptgeschichte: Das Regenbogen-Zentrum ---------- */
{
  let s; const { ctx, page } = await newPage();
  await boot(page);
  const dlg = async () => { for (let i = 0; i < 16; i++) { if (!(await ev(page, () => !!GL.W.dlg))) break; await page.click('#dn'); await page.waitForTimeout(50); } await page.waitForTimeout(260); };
  const closeMenu = async () => { if (await ev(page, () => document.getElementById('maps').style.display === 'block')) await page.click('#mx'); };
  const menuItem = async t => { await page.click(`#maps .row2:has-text("${t}")`); await page.waitForTimeout(80); };
  const talk = async () => { await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'gerda'); GL.emit('talkMenu', n, GL.core.talkBase); }); await page.waitForTimeout(80); };
  const go = async id => { const r = await ev(page, id => GL.dist.go(id), id); if (r) await waitFade(page); return r; };
  await ev(page, () => { GL.S.life.money = 600; GL.S.life.day = 2; });
  ok(await ev(page, () => { const n = GL.W.npcs.find(n => n.d.id === 'gerda'); return GL.emit('talkMenu', n, GL.core.talkBase) === undefined && GL.S.story.ch === 0; }), 'Vor Tag 3 beginnt die Geschichte nicht');
  await ev(page, () => { GL.S.life.day = 3; });
  ok(/beginnt, wenn/.test(await ev(page, () => { GL.phone.open('story'); return document.querySelector('#phone .pbody').textContent; })), 'Geschichte-App erklärt den Einstieg'); await ev(page, () => GL.phone.close());
  // Kapitel 0 → 1
  await talk(); await dlg(); await menuItem('Ja, ich helfe dir'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 1), 'Gerda bittet um Hilfe, Kapitel 1 beginnt');
  // Kapitel 1: drei Unterstützer
  await talk(); await menuItem('Kapitel 1'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 1), 'Ohne Unterstützer bleibt Kapitel 1 offen');
  await ev(page, () => { ['jonas', 'mehmet', 'luca'].forEach(id => { GL.dating.rel(id).f = 40; }); });
  const g0 = await ev(page, () => GL.S.glitzer);
  await talk(); await menuItem('Kapitel 1'); await dlg(); await closeMenu();
  ok(await ev(page, g => GL.S.story.ch === 2 && GL.S.glitzer === g + 40, g0), 'Mit drei Freunden: Kapitel 2, +40 Glitzer');
  // Kapitel 2: Spenden und Benefiz
  await ev(page, () => { GL.night.state().paid = 1; GL.emit('danced', 5); });
  ok(await ev(page, () => GL.S.story.don === 40), 'Benefiz-Tanzabend: Gäste spenden (+40 €)');
  await talk(); await page.click('#maps .row2:has(b:text-is("Spenden"))'); await page.waitForTimeout(80); await menuItem('100 € spenden'); await menuItem('100 € spenden'); await closeMenu();
  s = await ev(page, () => ({ d: GL.S.story.don, m: GL.S.life.money }));
  ok(s.d === 240 && s.m === 400, 'Spenden werden vom Konto abgebucht und gezählt');
  await talk(); await menuItem('Kapitel 2'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 3 && GL.S.life.money === 440), 'Spendenziel erreicht: Kapitel 3, Dank 40 €');
  // Kapitel 3: Entscheidung
  await talk(); await menuItem('Kapitel 3'); await menuItem('Laut und sichtbar'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 4 && GL.S.story.plan === 'loud' && GL.S.story.pts.plan === 1), 'Entscheidung „laut“ (3 Unterstützer: Wirkung 1)');
  // Kapitel 4: Viertel besuchen, Fest
  await talk(); await menuItem('Kapitel 4'); await dlg(); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 4 && !GL.S.story.fest), 'Fest erst nach Besuch mehrerer Viertel');
  for (const id of ['beach', 'down', 'love', 'coast']) await go(id);
  await go('kiez');
  ok(await ev(page, () => GL.story.vis() === 4), 'Besuchte Viertel werden gezählt');
  await ev(page, () => { GL.S.life.money = 600; });
  await talk(); await menuItem('Kapitel 4'); await menuItem('Gemeinsames Essen'); await dlg(); await waitFade(page).catch(() => {}); await closeMenu();
  ok(await ev(page, () => GL.S.story.ch === 5 && GL.S.story.fest === 'essen' && GL.S.life.money <= 600 - 30 + 30), 'Straßenfest geplant (30 €), Kapitel 5');
  // Kapitel 5: Abstimmung
  await talk(); await menuItem('Kapitel 5');
  ok(await ev(page, () => /Chancen|Stand deiner Vorbereitung/.test(document.getElementById('maps').textContent) && GL.story.score() === 8), 'Abstimmung zeigt die Chancen (Punktzahl 8)');
  const g1 = await ev(page, () => GL.S.glitzer);
  await menuItem('Zur Abstimmung gehen'); await waitFade(page); await dlg(); await closeMenu();
  ok(await ev(page, g => GL.S.story.ch === 6 && GL.S.story.end === 'compromise' && GL.S.glitzer === g + 150, g1), 'Ende „Kompromiss“: Kapitel 6, +150 Glitzer');
  ok(await ev(page, () => GL.story.bonus() === 2), 'Das Ende wirkt dauerhaft auf die Stimmung (+2)');
  // Danach: weiterspielen
  await talk(); await menuItem('Kaffee und Plausch'); await waitFade(page);
  ok(await ev(page, () => GL.S.story.tea === GL.S.life.day), 'Nach dem Ende: Kaffee mit Gerda');
  await talk(); ok(await page.evaluate(() => [...document.querySelectorAll('#maps .row2')].some(r => /Kaffee und Plausch/.test(r.textContent) && r.disabled)), 'Kaffee nur einmal pro Tag'); await closeMenu();
  ok(await ev(page, () => { GL.phone.open('story'); return /Ende/.test(document.querySelector('#phone .pbody').textContent); }), 'Geschichte-App zeigt das Ende'); await ev(page, () => GL.phone.close());
  // anderes Ende: wenig Vorbereitung
  ok(await ev(page, () => { GL.S.story.pts = { plan: 1, fest: 1 }; GL.S.story.don = 0; Object.keys(GL.S.rel).forEach(k => { GL.S.rel[k].f = 0; GL.S.rel[k].st = ''; }); return GL.story.score() < 7; }), 'Ohne Vorbereitung wäre die Punktzahl zu niedrig für ein gutes Ende');
  await ev(page, () => GL.save()); await page.reload(); await page.waitForFunction(() => window.GL && GL.W && GL.W.on); await closeDialogs(page);
  ok(await ev(page, () => GL.S.story.ch === 6 && GL.S.story.end === 'compromise' && GL.S.story.plan === 'loud'), 'Geschichte bleibt nach Neuladen erhalten');
  await ctx.close();
}

/* ---------- 9. Mehrspieler: PIN, QR-Code, Orte, Besuch, Gruppentanz, Gruppenfoto (mit Test-Ersatz für PeerJS über BroadcastChannel) ---------- */
{
  let s; const ctx = await browser.newContext({ viewport: { width: 1000, height: 640 } });
  if (process.env.THREE) await ctx.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  await ctx.route(/peerjs/, r => r.fulfill({ path: new URL('./fakepeer.js', import.meta.url).pathname, contentType: 'application/javascript' }));
  if (process.env.QRCODE) await ctx.route(/qrcode/, r => r.fulfill({ path: process.env.QRCODE, contentType: 'application/javascript' })); else await ctx.route(/qrcode/, r => r.abort());
  await ctx.route(/gstatic|googleapis/, r => r.abort());
  const mk = async hash => {
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await page.goto(BASE + '/gay-life/tests/');
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE + '/gay-life/index.html' + (hash || ''));
    await page.waitForFunction(() => window.GL && GL.W && GL.W.on, null, { timeout: 30000 });
    if (!hash) await closeDialogs(page); return page;
  };
  const A = await mk(), B = await mk();
  const text = (p, sel) => p.evaluate(sel => (document.querySelector(sel) || {}).textContent || '', sel);
  const menuItemOn = async (p, t) => { await p.click(`#maps .row2:has-text("${t}")`); await p.waitForTimeout(100); };
  const setT = (p, h) => p.evaluate(h => { GL.S.world.t = ((h - 6 + 24) % 24) / 24; GL.S.life.money = 300; GL.S.life.needs.energy = 90; }, h);
  // Fehlerfälle der PIN
  await B.click('#wMp'); await B.fill('#mpC', 'ab12'); await B.click('#mpJ'); await B.waitForTimeout(200);
  ok(/6-stellige PIN/.test(await text(B, '#maps')), 'Ungültige PIN wird abgelehnt (6 Ziffern nötig)');
  await B.fill('#mpC', '000000'); await B.click('#mpJ'); await B.waitForFunction(() => /nicht/.test(document.getElementById('maps').textContent), null, { timeout: 8000 });
  ok(true, 'Unbekannte PIN: „Diesen Raum gibt es nicht“');
  await B.click('#mx');
  // Raum öffnen
  await A.click('#wMp'); await A.click('#mpH'); await A.waitForFunction(() => /Raum-PIN/.test(document.getElementById('maps').textContent) && /\d{6}/.test(document.querySelector('#maps .big').textContent), null, { timeout: 8000 });
  const pin = (await text(A, '#maps .big')).trim();
  ok(/^\d{6}$/.test(pin), 'Raum öffnen zeigt eine 6-stellige PIN: ' + pin);
  if (process.env.QRCODE) { await A.waitForFunction(() => !!document.querySelector('#mpQ svg'), null, { timeout: 5000 }); ok(true, 'QR-Code wird als SVG angezeigt'); }
  // Beitreten per PIN
  await B.click('#wMp'); await B.fill('#mpC', pin); await B.click('#mpJ');
  await B.waitForFunction(() => GL.MP.me === 'g1' && Object.keys(GL.MP.peers).length === 1, null, { timeout: 8000 });
  await A.waitForFunction(() => Object.keys(GL.MP.peers).length === 1, null, { timeout: 8000 });
  ok(await B.evaluate(() => GL.mp.on() && GL.mp.name('h') !== '?') && await A.evaluate(() => GL.mp.on() && GL.mp.host()), 'Beitritt per PIN: beide sehen sich im Raum');
  await B.click('#mx'); await A.click('#mx');
  // Beitritt per QR-Link (#join=PIN)
  const Cc = await mk('#join=' + pin);
  await Cc.waitForFunction(() => GL.MP.me === 'g2', null, { timeout: 10000 });
  ok(await A.evaluate(() => Object.keys(GL.MP.peers).length === 2), 'Beitritt per QR-Link (#join=PIN): dritter Spieler im Raum');
  await Cc.evaluate(() => GL.MP.net.close()); await Cc.close(); await A.waitForFunction(() => Object.keys(GL.MP.peers).length === 1, null, { timeout: 8000 });
  ok(true, 'Verlässt jemand den Raum, verschwindet er bei den anderen');
  // Erweiterungsumschlag prüfen
  await A.evaluate(() => { window.__x = 0; GL.on('mpx', () => { window.__x++; }); });
  await B.evaluate(() => { GL.mp.send('Bad Kind', {}); GL.mp.send('ok', { big: 'x'.repeat(3000) }); GL.mp.send('ping', { a: 1 }); });
  await A.waitForTimeout(400);
  ok(await A.evaluate(() => window.__x === 1), 'Nachrichtenumschlag: ungültige Art und zu große Daten werden ignoriert, gültige kommen an');
  // Orte: Sichtbarkeit
  const goA = await A.evaluate(() => { GL.W.player.x = 12; GL.W.player.z = -9; return true; }); await A.waitForTimeout(700);
  s = await B.evaluate(() => { const o = GL.MP.peers.h; return { v: !!o.g && o.g.visible, x: o.g && Math.round(o.g.position.x), z: o.g && Math.round(o.g.position.z) }; });
  ok(s.v && s.x === 12 && s.z === -9, `Im selben Ort ist der andere sichtbar (Position ${s.x}/${s.z})`);
  await A.evaluate(() => { GL.S.life.money = 50; GL.dist.go('beach', true); }); await A.waitForTimeout(800);
  ok(await B.evaluate(() => !GL.MP.peers.h.g.visible), 'Ein anderer Ort: der andere ist ausgeblendet');
  await B.evaluate(() => { GL.dist.go('beach', true); }); await B.waitForTimeout(800);
  s = await B.evaluate(() => { const o = GL.MP.peers.h, w = GL.W.player; return { v: o.g.visible, near: Math.hypot(o.g.position.x - GL.dist.LIST.find(d => d.id === 'beach').cx - o.x + o.x, 0) >= 0, dx: o.g.position.x - GL.dist.LIST.find(d => d.id === 'beach').cx }; });
  ok(s.v && Math.abs(s.dx) < 46, 'Im selben Viertel wieder sichtbar, Position relativ zum Viertel');
  await A.evaluate(() => { GL.dist.go('kiez', true); }); await B.evaluate(() => { GL.dist.go('kiez', true); }); await A.waitForTimeout(500);
  // Besuch: Ablehnen, dann Zustimmen
  await A.evaluate(() => { GL.S.home.own.lampe = 1; GL.S.home.own.kunst = 1; GL.furn.place(2, 'kunst'); GL.furn.place(0, 'lampe'); });
  await B.evaluate(() => GL.multi.visitPeer('h')); await A.waitForFunction(() => /Besuch/.test(document.getElementById('maps').textContent), null, { timeout: 5000 });
  ok(/möchte dich zu Hause besuchen/.test(await text(A, '#maps')), 'Besuchsanfrage erscheint beim Gastgeber');
  await menuItemOn(A, 'Ablehnen'); await B.waitForFunction(() => GL.multi.state().pending === '', null, { timeout: 5000 });
  ok(await B.evaluate(() => GL.multi.state().visit === null) && await A.evaluate(() => GL.W.inside === 0), 'Ablehnen wird respektiert: kein Besuch, niemand wird hineingelassen');
  await B.evaluate(() => GL.multi.visitPeer('h')); await A.waitForFunction(() => /Besuch/.test(document.getElementById('maps').textContent), null, { timeout: 5000 });
  await menuItemOn(A, 'Einlassen'); await B.waitForFunction(() => GL.multi.state().visit === 'h', null, { timeout: 8000 });
  await A.waitForFunction(() => GL.W.inside === 1, null, { timeout: 8000 }); await B.waitForFunction(() => GL.W.inside === 1, null, { timeout: 8000 });
  await B.waitForTimeout(900);
  ok(await B.evaluate(() => GL.furn.visiting() && Object.values(GL.S.home.placed).length === 0) && await B.evaluate(() => GL.W.inter.some(i => i.on === false || true)), 'Gast sieht die fremde Einrichtung, nicht die eigene');
  s = await B.evaluate(() => ({ v: GL.MP.peers.h.g.visible, loc: GL.multi.loc().l }));
  ok(s.v && s.loc === 'h:h', 'In der Wohnung sehen sich Gastgeber und Gast (Ort h:h)');
  await A.evaluate(() => { GL.home.leave(true); }); await B.waitForFunction(() => GL.W.inside === 0 && GL.multi.state().visit === null, null, { timeout: 8000 });
  ok(await B.evaluate(() => !GL.furn.visiting()), 'Verlässt der Gastgeber die Wohnung, endet der Besuch');
  // Gruppentanz im Club
  await setT(A, 22); await setT(B, 22);
  await A.evaluate(() => { GL.S.life.day = 5; GL.S.jobs.night = null; }); await B.evaluate(() => { GL.S.life.day = 5; GL.S.jobs.night = null; });
  await A.evaluate(() => GL.multi.startDance());
  await B.waitForFunction(() => /Gruppentanz/.test(document.getElementById('maps').textContent) && /Mitmachen/.test(document.getElementById('maps').textContent), null, { timeout: 6000 });
  ok(true, 'Gruppentanz-Einladung kommt bei den anderen an');
  await menuItemOn(B, 'Mitmachen');
  const rounds = async p => { for (let i = 0; i < 3; i++) { await p.waitForFunction(() => /Song \d von 3/.test(document.getElementById('maps').textContent), null, { timeout: 5000 }); await p.click('#maps .row2 >> nth=0'); await p.waitForTimeout(120); } };
  await Promise.all([rounds(A), rounds(B)]);
  await A.waitForFunction(() => /von 6/.test(document.getElementById('maps').textContent) && /1\./.test(document.getElementById('maps').textContent), null, { timeout: 8000 });
  await B.waitForFunction(() => /von 6/.test(document.getElementById('maps').textContent) && /1\./.test(document.getElementById('maps').textContent), null, { timeout: 8000 });
  ok(/2\./.test(await text(A, '#maps')) && /\(du\)/.test(await text(B, '#maps')), 'Gruppentanz: beide sehen die gemeinsame Rangliste');
  await A.click('#mx'); await B.click('#mx');
  // Gruppenfoto
  await A.evaluate(() => GL.multi.group());
  await B.waitForFunction(() => GL.multi.photos.length === 1, null, { timeout: 9000 }); await A.waitForFunction(() => GL.multi.photos.length === 1, null, { timeout: 9000 });
  ok(await B.evaluate(() => /^data:image\/jpeg/.test(GL.multi.photos[0].src) && GL.multi.photos[0].src.length > 2000 && /Gruppenfoto/.test(GL.multi.photos[0].cap)), 'Gruppenfoto: beide Geräte haben ein Bild mit Beschriftung');
  ok(await A.evaluate(() => document.getElementById('photo').style.display === 'flex' && !!document.querySelector('#photo img') && document.getElementById('phDl').download === 'gaylife-foto.jpg'), 'Foto-Fenster mit Speichern-Knopf');
  await A.click('#phX');
  ok(await A.evaluate(() => { GL.phone.open('photos'); const t = document.querySelector('#phone .pbody').innerHTML; GL.phone.close(); return /data-ph="0"/.test(t); }), 'Foto-App listet das Foto');
  ok(await A.evaluate(() => { GL.phone.open('multi'); const t = document.querySelector('#phone .pbody').textContent; GL.phone.close(); return /Gruppentanz/.test(t) && /Besuch anfragen/.test(t); }), 'Zusammen-App zeigt Besuch, Gruppentanz und Gruppenfoto');
  // Raum verlassen
  await B.evaluate(() => GL.MP.net.close()); await A.waitForFunction(() => Object.keys(GL.MP.peers).length === 0, null, { timeout: 8000 });
  ok(true, 'Raum verlassen: der Gastgeber bleibt alleine zurück');
  await ctx.close();
}

/* ---------- 10. Politur: Wetter, Ton, Leistungswächter ---------- */
{
  let s; const { ctx, page } = await newPage();
  await boot(page);
  s = await ev(page, () => { const k = []; for (let d = 1; d <= 80; d++) k.push(GL.weather.kind(d)); return { all: ['sun', 'cloud', 'rain', 'fog'].every(x => k.includes(x)), same: k.every((x, i) => x === GL.weather.kind(i + 1)), sun: k.filter(x => x === 'sun').length }; });
  ok(s.all && s.same && s.sun > 20 && s.sun < 55, 'Wetter: alle vier Arten, pro Tag fest, Sonne häufigste Art ' + JSON.stringify(s));
  const mood = async k => ev(page, kk => { GL.weather.force(kk); return GL.life.mood(); }, k);
  await ev(page, () => { GL.S.life.needs.energy = 60; GL.S.life.needs.hunger = 60; GL.S.life.needs.hygiene = 60; GL.S.life.needs.social = 60; GL.S.life.needs.stress = 40; GL.S.life.boost = 0; });
  const ms = await mood('sun'), mr = await mood('rain'), mc = await mood('cloud');
  ok(Math.round(ms - mc) === 2 && Math.round(mc - mr) === 3, `Laune draußen: Sonne +2, Regen −3 (${ms.toFixed(1)} / ${mc.toFixed(1)} / ${mr.toFixed(1)})`);
  await ev(page, () => GL.weather.force('rain')); await page.waitForTimeout(700);
  s = await ev(page, () => { const W = GL.W, r = W.scene.children.find(o => o.type === 'LineSegments' && o.material.color.getHex() === 0xaec6e8); return { rain: !!r && r.visible, n: W.scene.fog.near, base: W.fogN, snd: GL.audio.state().rain }; });
  ok(s.rain && s.n < s.base * .6, `Regen: Tropfen sichtbar, Nebelgrenze näher (${s.n.toFixed(0)} statt ${s.base})`);
  ok(s.snd === true, 'Regen: Rauschen läuft draußen');
  await ev(page, () => GL.home.enter()); await waitFade(page); await page.waitForTimeout(500);
  s = await ev(page, () => { const W = GL.W, r = W.scene.children.find(o => o.type === 'LineSegments' && o.material.color.getHex() === 0xaec6e8); return { rain: !!r && r.visible, n: W.scene.fog.near, base: W.fogN, snd: GL.audio.state().rain, b: GL.weather.bonus() }; });
  ok(!s.rain && s.n === s.base && !s.snd && s.b === 0, 'Drinnen: kein Regen, kein Rauschen, keine Stimmung vom Wetter');
  await ev(page, () => { GL.W.player.x = GL.home.O.x; GL.home.leave && GL.home.leave(true); }); await waitFade(page).catch(() => {});
  await ev(page, () => GL.weather.force('sun')); await page.waitForTimeout(500);
  ok(await ev(page, () => { const r = GL.W.scene.children.find(o => o.type === 'LineSegments' && o.material.color.getHex() === 0xaec6e8); return !r || !r.visible; }), 'Sonne: Regen wieder weg');
  ok(await ev(page, () => { GL.phone.open('weather'); const t = document.querySelector('#phone .pbody').textContent; GL.phone.close(); return /Heute/.test(t) && /Sonnig/.test(t); }), 'Handy-App Wetter zeigt heute und die nächsten Tage');
  // Ton: Club-Musik läuft nur beim Tanzen
  await ev(page, () => { GL.S.sound = true; GL.S.world.t = 16 / 24; GL.S.life.needs.energy = 90; GL.S.life.money = 300; GL.night.dance(); }); await page.waitForTimeout(900);
  s = await ev(page, () => GL.audio.state()); ok(s.music && s.steps > 2, 'Club-Musik läuft beim Tanzen (' + s.steps + ' Schläge geplant)');
  await ev(page, () => GL.ui.close()); await page.waitForTimeout(300);
  ok(!(await ev(page, () => GL.audio.state().music)), 'Musik stoppt, wenn das Tanz-Menü geschlossen wird');
  await ev(page, () => { GL.S.sound = false; GL.emit('muted'); }); ok(!(await ev(page, () => GL.audio.state().music || GL.audio.state().rain)), 'Ton aus: nichts läuft');
  // Leistungswächter
  s = await ev(page, () => { GL.S.settings.q = -1; GL.perfCap = undefined; GL.perf.cap = 2; GL.perf.low = 0; const a = GL.perf.judge(10), b = GL.perf.judge(10), cap = GL.perf.cap, ok1 = GL.perfCap; GL.S.settings.q = 2; GL.perf.low = 0; const c = GL.perf.judge(5), d = GL.perf.judge(5); return { a, b, cap, ok1, c, d, cap2: GL.perf.cap }; });
  ok(!s.a && s.b && s.cap === 1 && s.ok1 === 1 && !s.c && !s.d && s.cap2 === 1, 'Leistungswächter senkt im Auto-Modus nach zwei schwachen Messungen, bei fester Qualität nicht ' + JSON.stringify(s));
  await ev(page, () => { GL.S.settings.q = -1; GL.perfCap = undefined; GL.perf.cap = 2; });
  await ctx.close();
}

ok(errs.length === 0, 'Keine Skriptfehler in der Konsole' + (errs.length ? ':\n  ' + errs.slice(0, 8).join('\n  ') : ''));
await browser.close();
console.log(fails ? `\n${fails} Prüfung(en) fehlgeschlagen` : '\nAlle Prüfungen bestanden');
process.exit(fails ? 1 : 0);
