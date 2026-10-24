// SHOW ME YOUR VOICE – Browser-Test (Playwright). Start: Server im Repo-Ordner, dann
//   node show-me-your-voice/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
// Spielt eine komplette Staffel mit einem Test-Bot (Runden auf wenige Sekunden gekürzt), dazu Ausscheiden, Neuladen,
// Training, Bonus-Challenge, Archiv, Einstellungen sowie Handy-Ansicht mit Touch. Der Radio-Stream wird durch eine
// lokale Test-Datei mit Beats ersetzt (WAV, mit CORS-Freigabe), damit die Live-Noten aus dem Radio geprüft werden.
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/smyv-' + n + '.jpg', type: 'jpeg', quality: 80 }); };

// 60 s Test-Beat (120 BPM, Bass + Hi-Hat) als WAV
const WAV = (() => {
  const sr = 11025, n = sr * 60, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  let seed = 1; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (let i = 0; i < n; i++) {
    const t = i / sr, b = t % 0.5, h = (t + 0.25) % 0.5;
    const v = (b < 0.12 ? Math.sin(2 * Math.PI * 70 * b) * Math.exp(-b * 30) : 0) + (h < 0.04 ? rnd() * Math.exp(-h * 90) * 0.6 : 0);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 26000))), 44 + i * 2);
  }
  return buf;
})();
async function page(vp, touch) {
  const c = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' });
  await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  await c.route(/stream\.laut\.fm/, r => r.fulfill({ status: 200, body: WAV, contentType: 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*' } }));
  // Titel wechselt nach einigen Abfragen (Songwechsel), Startzeit liegt in der Vergangenheit (Song läuft schon)
  let calls = 0;
  await c.route(/api\.laut\.fm/, r => { calls++; r.fulfill({ status: 200, body: JSON.stringify({ type: 'song', title: 'Testbeat ' + Math.floor(calls / 4), artist: { name: 'Test-Interpret' }, started_at: new Date(Date.now() - 60000).toISOString(), ends_at: new Date(Date.now() + 8000).toISOString() }), contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } }); });
  const p = await c.newPage();
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base); await p.waitForSelector('#sTitle.on');
  return p;
}
// Test-Bot: trifft Noten perfekt (q = Trefferquote), folgt der Linie, reagiert auf Signale. Kürzt alle Runden.
async function bot(p, q, len) {
  await p.evaluate(([q, len]) => {
    window.SMYV.D.ROUNDS.forEach(r => { r.len = len; });
    clearInterval(window.__bot);
    window.__bot = setInterval(() => {
      const s = window.SMYVApp.stageObj(); if (!s || !s.part || s.paused) return; const t = s.clock();
      if (s.part.type === 'rhythm') {
        for (const n of s.notes) if (!n.st && !n.skip && Math.abs(n.t - t) < 0.025) { if (Math.random() < q) s.press(n.lane); else n.skip = 1; }
        const sh = s.shows.find(x => x.st === 0 && t >= x.t + 0.2 && t <= x.t + x.win); if (sh) s.press(Math.random() < q ? sh.lane : (sh.lane + 1) % 4);
      }
      if (s.part.type === 'pitch') { const g = s.segs.find(x => t >= x.t - 0.3 && t < x.t + x.d); if (g) s.touchLv = Math.random() < q ? g.lv : (g.lv + 3) % 7; }
      if (s.part.type === 'cues') { const c = s.cues.find(x => x.st === 0 && t >= x.t + 0.1 && t <= x.t + x.win); if (c && Math.random() < q * 0.3) s.press(c.lane); }
    }, 8);
  }, [q, len]);
}
const st = p => p.evaluate(() => { const s = window.SMYVApp.state(); return { cur: s.cur, status: s.save.season && s.save.season.status, round: s.save.season && s.save.season.round, place: s.save.season && s.save.season.place }; });
// Backstage-Ereignis (ab Runde 2) beantworten
async function backEvent(p) {
  await p.waitForTimeout(800);
  if (await p.isVisible('#ovBox [data-act="c0"]')) { const b = p.locator('#ovBox [data-act^="c"]:not([disabled])').first(); await b.click(); await p.waitForTimeout(150); return true; }
  return false;
}
// Wartebereich/Interview: immer die erste Antwort, dann auf die Bühne
async function talkThrough(p) {
  await p.waitForSelector('#sTalk.on');
  for (let i = 0; i < 6; i++) { if (await p.isVisible('#bStageGo')) break; await p.click('#talkQ [data-a="0"]'); }
  await p.click('#bStageGo');
  // Radio: Auftritt startet erst beim Songwechsel – sonst nach kurzer Zeit „Sofort starten“
  for (let k = 0; k < 60 && !(await p.isVisible('#sStage.on')); k++) {
    if (k > 25 && await p.isVisible('#ovBox [data-act="now"]')) { await p.click('#ovBox [data-act="now"]'); break; }
    await p.waitForTimeout(250);
  }
}
// bis zum Ergebnis warten, eine angebotene Zugabe annehmen
async function waitResult(p) {
  for (let k = 0; k < 600; k++) {
    if (await p.isVisible('#sResult.on')) return;
    if (await p.isVisible('#ovBox [data-act="go"]') && /Zugabe/.test(await p.textContent('#ovBox'))) { encores++; await p.click('#ovBox [data-act="go"]'); }
    await p.waitForTimeout(200);
  }
  throw new Error('kein Ergebnis');
}
let encores = 0, events = 0;
async function playRound(p) {
  if (await backEvent(p)) events++;
  await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on');
  await p.click('#bGo'); await talkThrough(p); await waitResult(p);
  while (await p.isVisible('#bNext')) { const lbl = await p.textContent('#bNext'); await p.click('#bNext'); if (!/Weiter ▶/.test(lbl)) break; await p.waitForTimeout(120); }
  await p.waitForTimeout(200);
}

// ---------- PC: komplette Staffel gewinnen ----------
const p = await page({ width: 1280, height: 800 });
await shot(p, '01-titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await shot(p, '02-menue');
await p.keyboard.press('ArrowDown'); ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.m === 'online'), 'Pfeiltasten bewegen den Fokus im Menü');
await p.click('[data-m="new"]'); await p.waitForSelector('#sAvatar.on');
await p.fill('#avaName', 'Testy <Star>'); await p.click('[data-k="hair"][data-d="1"]'); await p.click('[data-k="skin"][data-v="3"]'); await shot(p, '03-avatar');
await p.click('#avaOk'); await p.waitForSelector('#sBack.on');
ok((await p.evaluate(() => window.SMYVApp.state().save.profile.name)) === 'Testy Star', 'Profil angelegt, Name bereinigt');
await shot(p, '04-backstage');
// Community + Training in der Karriere
await p.click('[data-b="comm"]'); await p.click('[data-act="video"]'); await p.waitForTimeout(150);
ok((await p.evaluate(() => window.SMYVApp.state().save.profile.fans)) === 30, 'Community-Aktion bringt Fans');
await bot(p, 1, 7);
const before = await p.evaluate(() => window.SMYVApp.state().save.profile.attrs.timing);
await p.click('[data-b="train"]'); await p.waitForSelector('#sTrain.on');
await p.evaluate(() => { const s = window.SMYV.D; void s; });
await p.click('[data-t="rhythm"]'); await p.waitForSelector('#ov:not([hidden])', { timeout: 40000 }); await shot(p, '05-training');
const after = await p.evaluate(() => window.SMYVApp.state().save.profile.attrs.timing);
ok(after > before, `Training steigert Timing (${before} → ${after})`);
await p.click('[data-act="ok"]'); await p.click('#sTrain [data-back]'); await p.waitForSelector('#sBack.on');
ok(/1 übrig/.test(await p.textContent('[data-b="train"]')), 'Trainingseinheit verbraucht');
// Erste Runde mit Screenshots
await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on'); await p.click('[data-g="approach"][data-v="risiko"]'); await shot(p, '06-vorbereitung');
await p.click('#bGo'); await p.waitForSelector('#sTalk.on'); await p.waitForTimeout(150); await shot(p, '07a-wartebereich');
await p.click('#talkQ [data-a="0"]'); await p.click('#talkQ [data-a="1"]'); await p.click('#talkQ [data-a="0"]'); await shot(p, '07b-jury-gespraech');
ok(/Läuft gerade auf RicoReWi Radio/.test(await p.textContent('#airBox')), 'Sender läuft schon im Wartebereich: ' + (await p.textContent('#airBox')));
await p.click('#bStageGo'); await p.waitForSelector('#ovBox [data-act="now"]'); await shot(p, '07c-warte-auf-song');
await p.waitForSelector('#sStage.on', { timeout: 20000 }); ok(true, 'Auftritt startet automatisch beim Songwechsel'); await p.waitForTimeout(3200); await shot(p, '07-buehne');
ok(/laut\.fm/.test(await p.textContent('#stTitle')), 'Radio-Quelle wird im Auftritt genannt: ' + (await p.textContent('#stTitle')));
ok(await p.evaluate(() => { const s = window.SMYVApp.stageObj(); return s && s.part && s.part.live && s.notes.length > 0; }), 'Noten entstehen live aus dem Radio-Stream');
await p.keyboard.press('Escape'); await p.waitForSelector('#ov:not([hidden])'); ok(await p.evaluate(() => window.SMYVApp.stageObj().paused), 'Pause mit Esc'); await shot(p, '08-pause');
await p.keyboard.press('Escape'); await p.waitForTimeout(100); ok(!(await p.evaluate(() => window.SMYVApp.stageObj().paused)), 'Weiter mit Esc');
await waitResult(p); await shot(p, '09-performance');
ok(/Quelle: .*laut\.fm/.test(await p.textContent('#resBox')), 'Quelle steht auch im Ergebnis');
await p.click('#bNext'); await p.waitForTimeout(4800); await shot(p, '10-jury');
await p.click('#bNext'); await p.waitForTimeout(300); await shot(p, '11-entscheidung');
await p.click('#bNext'); await p.waitForSelector('#sBack.on');
ok(!(await p.evaluate(() => window.SMYVAudio.micActive())), 'Mikrofon nach dem Auftritt aus');
await p.waitForTimeout(800); ok(await p.isVisible('#ovBox [data-act="c0"]'), 'Backstage-Ereignis erscheint im Recall'); await shot(p, '11b-ereignis');
let s = await st(p); ok(s.round === 1 && s.status === 'backstage', 'Casting bestanden → Recall freigeschaltet');
// Neuladen: Stand bleibt
await p.reload(); await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
ok(/fortsetzen/.test(await p.textContent('#menuList')), 'Nach Neuladen: Karriere fortsetzen');
await p.click('[data-m="cont"]'); await p.waitForSelector('#sBack.on'); await bot(p, 1, 7);
for (let i = 0; i < 6 && (await st(p)).status === 'backstage'; i++) {
  const r = (await st(p)).round;
  if (r === 2) {   // Mottoshow: Voting und Zitterbank fotografieren
    if (await backEvent(p)) events++;
    await p.click('[data-b="stage"]'); await p.click('#bGo'); await talkThrough(p); await waitResult(p);
    for (let k = 0; k < 6 && !(await p.isVisible('.vbar')); k++) { await p.click('#bNext'); await p.waitForTimeout(150); }
    ok(await p.isVisible('.vbar'), 'Voting-Balken nach der Jury'); await p.waitForTimeout(2600); await shot(p, '12a-voting');
    ok(await p.isVisible('#zit'), 'Zitterbank wird aufgelöst');
    while (await p.isVisible('#bNext')) { const lbl = await p.textContent('#bNext'); await p.click('#bNext'); if (!/Weiter ▶/.test(lbl)) break; await p.waitForTimeout(120); }
    continue;
  }
  await playRound(p);
  if (r === 3) await shot(p, '12-nach-battle');
}
ok(events >= 3, 'Backstage-Ereignisse in jeder Runde ab dem Recall (' + events + ')');
s = await st(p);
ok(s.status === 'done' && s.place === 1, `Staffel gewonnen (Status ${s.status}, Platz ${s.place})`);
await p.waitForSelector('#sWin.on'); await p.waitForTimeout(400); await shot(p, '13-sieg');
ok((await p.evaluate(() => window.SMYVApp.state().save.profile.ach)).includes('sieger'), 'Erfolg „Sieger“');
await p.click('[data-w="prof"]'); await p.waitForSelector('#sProfile.on'); await shot(p, '14-profil');
await p.click('#sProfile [data-back]');

// ---------- Ausscheiden ----------
await p.click('[data-w="new"]'); await p.waitForSelector('#sBack.on'); await bot(p, 0.15, 7);
await playRound(p); await p.waitForSelector('#sOut.on'); await shot(p, '15-ausgeschieden');
ok((await st(p)).status === 'out', 'Schwacher Auftritt → ausgeschieden');
await p.click('[data-o="menu"]'); await p.waitForSelector('#sMenu.on');
ok(!/fortsetzen/.test(await p.textContent('#menuList')), 'Nach dem Ausscheiden kein „Fortsetzen“');

// ---------- Freies Casting, Bonus, Archiv, Einstellungen ----------
await bot(p, 0.95, 7);
await p.click('[data-m="free"]'); await p.waitForSelector('#sPrep.on'); await p.click('#bGo'); await talkThrough(p);
await p.waitForSelector('#sStage.on'); await p.waitForTimeout(2500);
const lost = await p.evaluate(() => { const s = window.SMYVApp.stageObj(); const n0 = s.notes.length; s.radioLost(); return { live: s.part.live, sg: !!s.sg, more: s.notes.length > n0 }; });
ok(!lost.live && lost.sg, 'Radio bricht ab → eigene Beats und Noten übernehmen');
await waitResult(p);
for (let k = 0; k < 8 && !(await p.isVisible('#sPrep.on')); k++) { await p.click('#bNext'); await p.waitForTimeout(150); }
await p.waitForSelector('#sPrep.on'); ok(true, 'Freies Casting durchgespielt');
await p.click('#sPrep [data-back]'); await p.waitForSelector('#sMenu.on');
await p.click('[data-m="bonus"]'); await p.waitForSelector('#sBonus.on');
await p.evaluate(() => { const o = window.SMYVApp; void o; });
await p.click('#bGala'); await p.waitForTimeout(2500); await shot(p, '16-gala');
await p.waitForSelector('#sBonus.on .big', { timeout: 90000 }); await shot(p, '17-gala-ergebnis');
ok((await p.evaluate(() => window.SMYVApp.state().save.best)) > 0, 'Gala-Rekord gespeichert');
await p.click('#sBonus [data-back]'); await p.click('[data-m="arch"]'); await p.waitForSelector('#sArchive.on');
await p.click('details[data-s="staffel-2"] summary'); await p.waitForTimeout(200);
ok((await p.locator('details[data-s="staffel-2"] .ep').count()) === 6, 'Archiv: Staffel 2 mit 6 Folgen (mit Finale)');
await p.click('details[data-s="staffel-2"] [data-v]'); ok(/youtube-nocookie\.com\/embed\/lLvk-xvvDbw/.test(await p.innerHTML('#ovBox')), 'Archiv: Video wird eingebettet');
await shot(p, '18-archiv'); await p.keyboard.press('Escape');
await p.click('#sArchive [data-back]'); await p.click('[data-m="set"]'); await p.waitForSelector('#sSettings.on');
await p.click('[data-s="big"][data-v="true"]'); ok(await p.evaluate(() => document.body.classList.contains('big')), 'Große Schrift');
await p.click('[data-s="big"][data-v="false"]'); await shot(p, '19-einstellungen');
await p.click('[data-s="source"][data-v="beats"]'); ok((await p.evaluate(() => window.SMYVApp.state().save.settings.source)) === 'beats', 'Musikquelle umschaltbar');
await p.click('[data-s="mic"][data-v="true"]'); ok(/Mikrofon/.test(await p.textContent('#ovBox')), 'Mikrofon nur nach Zustimmung'); await p.click('[data-act="no"]');
ok(!(await p.evaluate(() => window.SMYVApp.state().save.settings.mic)), 'Ohne Zustimmung bleibt das Mikrofon aus');
await p.close();

// ---------- Handy: Touch-Bedienung ----------
const m = await page({ width: 390, height: 844 }, true);
await m.tap('#bStart'); await m.waitForSelector('#sMenu.on'); await shot(m, '20-handy-menue');
await m.tap('[data-m="new"]'); await m.tap('#avaOk'); await m.waitForSelector('#sBack.on'); await shot(m, '21-handy-backstage');
await m.evaluate(() => { window.SMYV.D.ROUNDS.forEach(r => { r.len = 16; }); });
await m.evaluate(() => { const s = window.SMYVApp.state().save; s.settings.source = 'beats'; });
await m.tap('[data-b="stage"]'); await m.tap('#bGo'); await m.waitForSelector('#sTalk.on'); await shot(m, '21b-handy-gespraech');
for (let i = 0; i < 6 && !(await m.isVisible('#bStageGo')); i++) await m.tap('#talkQ [data-a="0"]');
await m.tap('#bStageGo'); await m.waitForSelector('#sStage.on');
ok(await m.isVisible('#pads .pad'), 'Touch-Tasten sichtbar');
// echte Touch-Eingaben auf die Spurtasten im Takt der Noten
const hits = await m.evaluate(async () => {
  const s = window.SMYVApp.stageObj(); let n = 0;
  for (let k = 0; k < 1800 && !s.done; k++) {
    await new Promise(r => setTimeout(r, 10)); if (!s.part || s.part.type !== 'rhythm') continue;
    const t = s.clock(), note = s.notes.find(x => !x.st && Math.abs(x.t - t) < 0.03);
    if (note) { const el = document.querySelector('.pad[data-lane="' + note.lane + '"]'); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' })); n++; }
    if (k === 250) { /* Screenshot-Pause */ }
  }
  return n;
});
await shot(m, '22-handy-ergebnis');
ok(hits > 3, 'Touch-Tasten treffen Noten (' + hits + ')');
await waitResult(m);
const r1 = await m.evaluate(() => window.SMYVApp.state().save.season.results[0]);
ok(r1 && r1.perf > 40, 'Touch-Auftritt gewertet (Performance ' + (r1 && r1.perf) + ')');
const sw = await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
ok(sw, 'Kein seitliches Scrollen auf dem Handy');
await m.close();

// ---------- Radio ohne CORS-Freigabe: Sender läuft trotzdem (nur abspielen) ----------
{
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  await c.route(/i\.ytimg\.com|youtube|anmacha-cloud\.js|gamepad\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  await c.route(/stream\.laut\.fm/, r => r.fulfill({ status: 200, body: WAV, contentType: 'audio/wav' }));   // ohne Access-Control-Allow-Origin
  await c.route(/api\.laut\.fm/, r => r.fulfill({ status: 200, body: JSON.stringify({ title: 'Testbeat', artist: { name: 'Test-Interpret' } }), contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } }));
  const q = await c.newPage(); q.on('pageerror', e => errs.push(e.message));
  await q.goto(base); await q.keyboard.press('Enter'); await q.waitForSelector('#sMenu.on');
  await q.evaluate(() => { window.SMYV.D.ROUNDS.forEach(r => { r.len = 16; }); });
  await q.click('[data-m="new"]'); await q.click('#avaOk'); await q.waitForSelector('#sBack.on');
  await q.evaluate(() => { const A = window.SMYVAudio, orig = A.radioStart; A.radioStart = (s, d, u, plain) => (plain ? orig(s, d, u, true) : Promise.reject(new Error('cors'))); });   // Analyse verweigert wie bei fehlender CORS-Freigabe
  await q.click('[data-b="stage"]'); await q.waitForSelector('#sPrep.on'); await q.click('#bGo'); await talkThrough(q);
  await q.waitForSelector('#sStage.on', { timeout: 20000 }); await q.waitForTimeout(2500);
  const pl = await q.evaluate(() => ({ plain: window.SMYVAudio.radioPlain(), notes: window.SMYVApp.stageObj().notes.length, title: document.getElementById('stTitle').textContent }));
  ok(pl.plain && pl.notes > 0 && /laut\.fm/.test(pl.title), 'Ohne CORS: Sender läuft hörbar, Noten im Takt des Stils (' + pl.notes + ')');
  await c.close();
}
ok(!errs.length, 'Keine Laufzeitfehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
