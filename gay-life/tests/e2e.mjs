/* Browser-Test für GayLife (Playwright + Chromium, Software-WebGL).
   Voraussetzung: Webserver im Repo-Hauptordner, z. B.  python3 -m http.server 8080
   Aufruf:  BASE=http://localhost:8080 THREE=/pfad/zu/three.min.js node gay-life/tests/e2e.mjs
   THREE ist optional (r128, für Umgebungen ohne Zugriff auf cdnjs). Prüft Start, Migration alter Spielstände, Speichern/Laden,
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
  await page.click('#mOk'); await page.waitForFunction(() => GL.W.on); ok(await ev(page, () => GL.W.inside === 1), 'Nach dem Umziehen weiter in der Wohnung');
  await spot(3.3, -3.8, /Laptop/);
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

ok(errs.length === 0, 'Keine Skriptfehler in der Konsole' + (errs.length ? ':\n  ' + errs.slice(0, 8).join('\n  ') : ''));
await browser.close();
console.log(fails ? `\n${fails} Prüfung(en) fehlgeschlagen` : '\nAlle Prüfungen bestanden');
process.exit(fails ? 1 : 0);
