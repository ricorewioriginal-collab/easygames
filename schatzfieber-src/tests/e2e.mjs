// Schatzfieber – Browser-Test (Playwright): Altersabfrage, Titel, Figurenerstellung, Ankunft, Gespräch mit Jonas (Schlüssel),
// Strandhaus (Tagebuch), Lea (Karte), Laden (Laterne), Höhle der Gezeiten komplett (Kiste, Schloss, Truhen, Ausgang),
// Sofia (Taucherbrille), Handy-Reiter, Szenen (Kuss, Nacht), Nacht-Beleuchtung, Pause/Zurücksetzen, Handy-Ansicht.
// Start: Server im easygames-Ordner (Port 8766), dann: node schatzfieber-src/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
await ctx.route(/anmacha-cloud\.js/, (r) => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
const p = await ctx.newPage();
await p.addInitScript(() => localStorage.setItem('schatzfieber-settings', JSON.stringify({ quality: 0, music: 0, sfx: 0, sens: 1, invert: false, textSpeed: 3 })));
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|WebGL|GPU stall/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
const ev = (f, a) => p.evaluate(f, a);
const shot = async (n) => { if (OUT) await p.screenshot({ path: `${OUT}/sf-${n}.jpg`, quality: 82, timeout: 120000 }); };
const until = (f, a, ms = 90000) => p.waitForFunction(f, a, { timeout: ms, polling: 300 });
const frames = (n) => ev((n) => new Promise((r) => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const choices = () => ev(() => [...document.querySelectorAll('#dlgChoices button')].map((b) => b.textContent));
/** Gesprächstext weiterklicken, bis Auswahl erscheint oder das Gespräch endet */
async function skip(max = 12) {
  for (let i = 0; i < max; i++) {
    const st = await ev(() => ({ open: SFApp.ui.dialogOpen, ch: !document.getElementById('dlgChoices').hidden }));
    if (!st.open || st.ch) return st;
    await ev(() => SFApp.ui.advance());
    await p.waitForTimeout(250);
  }
}
async function goTo(x, z, yaw = 0) {
  await ev(([x, z, yaw]) => { const a = SFApp; a.player.place(x, z, a.ground, yaw); a.cam.yaw = yaw; a.cam.snap(a.player.pos); }, [x, z, yaw]);
  await frames(3);
}
const pressE = async () => { await p.keyboard.press('KeyE'); await frames(3); };
const prompt = () => ev(() => (document.getElementById('prompt').hidden ? '' : document.getElementById('prompt').textContent));

// ---------- Altersabfrage, Titel, Figur ----------
await p.goto(BASE + 'schatzfieber/');
await p.waitForSelector('#sAge.on', { timeout: 240000 });
ok((await p.textContent('#sAge')).includes('18'), 'Altersabfrage 18+ erscheint');
await shot('alter');
await p.click('#ageYes');
await p.waitForSelector('#sTitle.on');
ok(await ev(() => localStorage.getItem('schatzfieber-age') === '1'), 'Altersbestätigung gespeichert');
await shot('titel');
await p.click('[data-a="new"]');
await p.waitForSelector('#sCreate.on');
await p.fill('#crName', 'Rico');
await p.click('.opt:nth-child(2) [data-d="1"]'); // Ich bin: Frau
ok(await ev(() => SFApp.crCfg?.gender === 'w' || document.querySelector('.opt:nth-child(2) .val').textContent === 'Frau'), 'Geschlecht wählbar');
await p.click('.opt:nth-child(2) [data-d="-1"]'); // zurück zu Mann
await p.click('.opt:nth-child(3) [data-d="1"]'); // Ich date: Männer
ok((await p.textContent('.opt:nth-child(3) .val')) === 'Männer', 'Dating-Vorliebe wählbar (Männer)');
await p.click('.opt:nth-child(9) [data-d="1"]'); // Frisur
await shot('figur');
await p.click('#crGo');
for (let i = 0; i < 80 && (await ev(() => SFApp.mode)) !== 'play'; i++) { await ev(() => SFApp.ui.advance()); await p.waitForTimeout(400); }
ok(await ev(() => SFApp.mode === 'play' && SFApp.save.player.name === 'Rico' && SFApp.save.player.pref === 'm'), 'Spiel gestartet, Figur übernommen');
ok(await ev(() => document.getElementById('hudQuest').textContent.includes('Jonas')), 'Erster Auftrag im HUD');

// ---------- Jonas: Hausschlüssel ----------
await ev(() => { SFApp.save.time = 9 * 60; SFApp.world.resetNpcs(); });
await goTo(34, 200, Math.PI);
await frames(3);
ok((await prompt()).includes('Jonas'), 'Hinweis „Mit Jonas sprechen“');
await pressE();
await until(() => !document.getElementById('dlgChoices').hidden);
await frames(4);
await shot('gespraech');
ok((await choices()).some((c) => c.includes('Jonas am Hafen begrüßen')), 'Herzenswunsch als Auswahl');
await p.click('#dlgChoices button:has-text("Jonas am Hafen")');
await skip();
ok(await ev(() => SFApp.save.inv.house_key === 1 && SFApp.save.rel.jonas.lvl === 1), 'Hausschlüssel erhalten, Herz +1');
await p.click('#dlgChoices button:has-text("Tschüss")');
await until(() => SFApp.mode === 'play');

// ---------- Strandhaus ----------
await goTo(-128, 170, Math.PI);
ok((await prompt()).includes('Strandhaus betreten'), 'Strandhaus betretbar');
await pressE();
for (let i = 0; i < 20 && !(await ev(() => SFApp.ui.overlayOpen)); i++) { await ev(() => SFApp.ui.advance()); await p.waitForTimeout(300); }
ok(await ev(() => SFApp.save.flags.journal === 1), 'Heddas Tagebuch gefunden');
ok(await p.locator('#ovBox [data-a="sleep"]').count() === 1 && (await p.locator('#ovBox [data-a="renov"]').count()) === 1, 'Hausmenü: Schlafen und Ausbau');
await shot('haus');
await p.click('#ovBox [data-a="x"]');

// ---------- Lea: Karte ----------
await goTo(3, 120.4, Math.PI);
ok((await prompt()).includes('Lea'), 'Lea am Museum');
await pressE();
await until(() => !document.getElementById('dlgChoices').hidden);
await p.click('#dlgChoices button:has-text("Tagebuch")');
await skip();
ok(await ev(() => SFApp.save.flags.leaMap === 1 && SFApp.save.money === 200), 'Lea deutet die Karte (+50 €)');
await p.click('#dlgChoices button:has-text("Tschüss")');
await until(() => SFApp.mode === 'play');

// ---------- Laden ----------
await goTo(35, 136, Math.PI / 2);
await pressE();
await until(() => SFApp.ui.overlayOpen);
await p.click('[data-a="buy"][data-id="lamp"]');
ok(await ev(() => SFApp.save.inv.lamp === 1 && SFApp.save.money === 140 && SFApp.save.flags.bought === 1), 'Laterne gekauft');
await p.click('[data-a="t1"]');
ok(await p.locator('#ovBox .tabs .on:has-text("Verkaufen")').count() === 1, 'Verkaufen-Reiter');
await shot('laden');
await p.keyboard.press('Escape');
await until(() => !SFApp.ui.overlayOpen);
await frames(3);
ok(await ev(() => !SFApp.ui.overlayOpen), 'Esc schließt Fenster ohne Pause zu öffnen');

// ---------- Höhle der Gezeiten ----------
await goTo(191, 28, -Math.PI / 2);
ok((await prompt()).includes('Höhle'), 'Höhleneingang');
await pressE();
await until(() => !!SFApp.dungeon && SFApp.mode === 'play' && !document.getElementById('fade').classList.contains('on'));
await frames(4);
await shot('hoehle');
const cell = (x, y, yaw) => goTo(x * 3, y * 3, yaw);
const E = Math.PI / 2, N = Math.PI;
for (const x of [5, 6, 7]) {
  await cell(x, 7, E);
  await pressE();
}
ok(await ev(() => SFApp.puzzle.crates.has('9,7') && SFApp.puzzle.isOpen(5, 6)), 'Kiste auf der Platte, Tor offen');
await cell(5, 4, N);
await pressE();
await until(() => SFApp.ui.overlayOpen);
for (let i = 0; i < 4; i++) await p.click('[data-a="u"][data-i="1"]');
for (let i = 0; i < 3; i++) await p.click('[data-a="u"][data-i="2"]');
await shot('schloss');
await p.click('[data-a="try"]');
ok(await ev(() => SFApp.puzzle.isOpen(5, 3)), 'Symbolschloss geöffnet');
await cell(6, 4, E);
await pressE();
ok(await ev(() => SFApp.save.inv.dagger === 1), 'Kleine Truhe: Piratendolch');
await cell(5, 2, N);
await pressE();
await until(() => SFApp.ui.dialogOpen);
await skip();
ok(await ev(() => SFApp.save.flags.amulet_sun === 1), 'Sonnen-Amulett gefunden');
await cell(6, 9, N);
ok((await prompt()).includes('Hinausgehen'), 'Ausgang');
await pressE();
await until(() => !SFApp.dungeon && SFApp.mode === 'play');
ok(await ev(() => !!SFApp.save.dungeons.cave && SFApp.save.dungeons.cave.chests.length === 2), 'Rätselort gespeichert');

// ---------- Sofia: Taucherbrille, Flirt-Auswahl ----------
await ev(() => { SFApp.save.time = 13 * 60; SFApp.world.resetNpcs(); });
await goTo(42, 200, Math.PI);
await frames(3);
await pressE();
await until(() => !document.getElementById('dlgChoices').hidden);
await p.click('#dlgChoices button:has-text("Sofia übers Tauchen")');
await skip();
ok(await ev(() => SFApp.save.inv.goggles === 1), 'Taucherbrille von Sofia');
await p.click('#dlgChoices button:has-text("Tschüss")');
await until(() => SFApp.mode === 'play');
ok(await ev(() => !SFApp.save.rel.sofia.romance), 'Sofia (lesbisch) ist für eine männliche Figur nur Freundschaft');

// ---------- Handy ----------
await p.keyboard.press('Tab');
await until(() => SFApp.ui.overlayOpen);
ok((await p.textContent('#ovBox')).includes('Hauptgeschichte'), 'Handy: Tagebuch');
await p.click('[data-a="tab"][data-t="map"]');
ok(await p.locator('#mapBox canvas').count() === 1, 'Handy: Karte');
await shot('karte');
await p.click('[data-a="tab"][data-t="contacts"]');
ok((await p.textContent('#ovBox')).includes('Jonas'), 'Handy: Kontakte');
await p.click('[data-a="tab"][data-t="inv"]');
ok((await p.textContent('#ovBox')).includes('Piratendolch'), 'Handy: Inventar');
await p.click('[data-a="x"]');

// ---------- Szenen ----------
await ev(() => { const s = SFApp.save; s.rel.elias.romance = true; s.rel.elias.lvl = 4; s.gallery.push('elias_kiss'); SFApp.save.time = 19 * 60; });
await goTo(0, 160, 0);
const scene = ev(() => SFApp.playScene('elias_kiss', true));
await until(() => SFApp.ui.dialogOpen);
await frames(6);
await shot('szene');
for (let i = 0; i < 12 && (await ev(() => SFApp.mode)) !== 'play'; i++) { await ev(() => SFApp.ui.advance()); await p.waitForTimeout(500); }
await scene;
ok(await ev(() => SFApp.mode === 'play' && !document.body.classList.contains('cine')), 'Kuss-Szene (Galerie) abgespielt');
await ev(() => { const s = SFApp.save; s.rel.elias.lvl = 4; s.museum = ['pottery', 'cannonball', 'coin_silver', 'coin_gold', 'bottle', 'dagger', 'compass', 'spyglass']; s.rel.elias.pts = 99; SFApp.world.resetNpcs(); s.time = 13 * 60; });
await goTo(7, 122.4, Math.PI);
await frames(3);
await pressE();
await until(() => !document.getElementById('dlgChoices').hidden);
await p.click('#dlgChoices button:has-text("Museum")');
await until(() => !document.getElementById('dlgChoices').hidden);
ok((await choices()).some((c) => c.includes('Nur wir zwei')), 'Frage nach Exklusivität vor der gemeinsamen Nacht');
await p.click('#dlgChoices button:has-text("Offen")');
for (let i = 0; i < 30 && (await ev(() => SFApp.mode)) !== 'play'; i++) { await ev(() => SFApp.ui.advance()); await p.waitForTimeout(600); }
ok(await ev(() => SFApp.save.rel.elias.lvl === 5 && SFApp.save.rel.elias.open && SFApp.save.gallery.includes('elias_night') && SFApp.save.day === 2), 'Gemeinsame Nacht: Überblendung, nächster Morgen');

// ---------- Nacht, Pause ----------
await ev(() => { SFApp.save.time = 22 * 60; });
await goTo(0, 172, Math.PI);
await frames(8);
await shot('nacht');
await p.keyboard.press('Escape');
await until(() => SFApp.ui.overlayOpen);
ok((await p.textContent('#ovBox')).includes('Pause'), 'Pausenmenü');
await p.click('[data-a="save"]');
ok(await ev(() => JSON.parse(localStorage.getItem('schatzfieber-save')).rel.elias.lvl === 5), 'Gespeichert');

// ---------- Handy-Ansicht ----------
await p.close();
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 780 });
m.on('pageerror', (e) => errs.push('PAGE(mobil) ' + e.message));
await m.goto(BASE + 'schatzfieber/?age=1');
await m.waitForSelector('#sTitle.on', { timeout: 240000 });
ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Handy: kein seitliches Scrollen');
if (OUT) await m.screenshot({ path: `${OUT}/sf-mobil.jpg`, quality: 82, timeout: 120000 });

console.log(errs.length ? '\n' + errs.join('\n') : '\nalles ok');
await b.close();
process.exit(errs.length ? 1 : 0);
