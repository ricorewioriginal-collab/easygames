// SHOW ME YOUR VOICE – Browser-Test „echte Songs“ (Playwright, ohne Internet: iTunes, Hörprobe, Piped, lrclib und YouTube-Player sind Attrappen).
// Spiel-Modus: Song suchen → Video + Tempo aus der Hörprobe (120 BPM) + Taktlage aus dem Liedtext → Noten liegen auf den Schlägen; ◀ ▶ verschiebt.
// Vorsingen: Karaoke-Video direkt im Spiel suchen.   node show-me-your-voice/tests/e2e-songs.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'show-me-your-voice/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/smyv-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
// Hörprobe: 30 s mit 120 BPM (Bass auf jedem Schlag), als WAV
const WAV = (() => { const sr = 22050, n = sr * 30, buf = Buffer.alloc(44 + n * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (let i = 0; i < n; i++) { const t = i / sr, a = t % 0.5, h = (t + 0.25) % 0.5, v = (a < 0.12 ? Math.sin(2 * Math.PI * 70 * a) * Math.exp(-a * 30) : 0) + (h < 0.04 ? rnd() * Math.exp(-h * 90) * 0.5 : 0); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 26000), 44 + i * 2); }
  return buf; })();
// YouTube-IFrame-API-Attrappe: Zeit läuft nach playVideo, Kanal über getVideoData
const YT = `(function(){function P(el,o){var s=this,d=typeof el==='string'?document.getElementById(el):el,f=document.createElement('div');f.style.cssText='width:100%;height:100%;background:linear-gradient(135deg,#202040,#a02a6a);color:#fff;display:flex;align-items:center;justify-content:center;font:700 18px sans-serif';f.textContent='▶ YouTube: '+o.videoId;d.replaceWith(f);
 s.t=0;s.state=-1;s.at=0;setTimeout(function(){o.events.onReady&&o.events.onReady({})},50);
 s.playVideo=function(){s.at=performance.now();s.state=1;o.events.onStateChange&&o.events.onStateChange({data:1})};s.pauseVideo=function(){s.t=s.getCurrentTime();s.state=2;o.events.onStateChange&&o.events.onStateChange({data:2})};
 s.seekTo=function(x){s.t=x;s.at=performance.now()};s.getCurrentTime=function(){return s.state===1?s.t+(performance.now()-s.at)/1000:s.t};s.getDuration=function(){return 214};s.setVolume=function(){};s.destroy=function(){};s.getVideoData=function(){return{author:'Test Band',title:'x'}};}
 window.YT={Player:P};setTimeout(function(){window.onYouTubeIframeAPIReady&&window.onYouTubeIframeAPIReady()},10);})();`;
// Liedtext: Zeilen beginnen auf den Schlägen (Taktlage 0,25 s, 120 BPM), erste Zeile bei 12,25 s
const LRC = Array.from({ length: 30 }, (_, i) => { const t = 12.25 + i * 4; return `[${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}] Zeile ${i + 1}`; }).join('\n');
const cors = { 'Access-Control-Allow-Origin': '*' };
const c = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
await c.route(/youtube\.com\/iframe_api/, r => r.fulfill({ body: YT, contentType: 'text/javascript' }));
await c.route(/i\.ytimg\.com|anmacha-cloud\.js|gamepad\.js|youtube-nocookie/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
await c.route(/itunes\.apple\.com\/search/, r => { const cb = new URL(r.request().url()).searchParams.get('callback'); if (cb) return r.fulfill({ body: cb + '({"results":[]})', contentType: 'text/javascript' }); r.fulfill({ body: JSON.stringify({ results: [{ trackName: 'Sommerhit', artistName: 'Test Band', trackTimeMillis: 204000, primaryGenreName: 'Pop', artworkUrl100: '', previewUrl: 'https://audio-ssl.itunes.apple.com/test/preview.m4a' }] }), contentType: 'application/json', headers: cors }); });
await c.route(/audio-ssl\.itunes\.apple\.com/, r => r.fulfill({ body: WAV, contentType: 'audio/wav', headers: cors }));
await c.route(/\/search\?filter=videos/, r => { const q = decodeURIComponent(r.request().url().split('q=')[1] || ''); r.fulfill({ body: JSON.stringify({ items: /karaoke/i.test(q)
  ? [{ url: '/watch?v=KKKKKKKKKKK', title: 'Test Band - Sommerhit (Karaoke Version)', duration: 205, uploaderName: 'Sing King' }]
  : [{ url: '/watch?v=AAAAAAAAAAA', title: 'Test Band - Sommerhit (Official Video)', duration: 214, uploaderName: 'Test Band' }, { url: '/watch?v=BBBBBBBBBBB', title: 'Sommerhit live', duration: 260, uploaderName: 'Fan' }] }), contentType: 'application/json', headers: cors }); });
await c.route(/\/api\/v1\/search|instances\.json|piped-instances/, r => r.fulfill({ status: 503, body: '' }));
await c.route(/lrclib\.net/, r => r.fulfill({ body: JSON.stringify({ syncedLyrics: LRC }), contentType: 'application/json', headers: cors }));
await c.route(/laut\.fm/, r => r.fulfill({ status: 503, body: '' }));
const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/i.test(m.text())) errs.push(m.text()); });
await p.goto(base); await p.waitForSelector('#sTitle.on'); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
await p.evaluate(() => { window.SMYV.D.ROUNDS.forEach(r => { r.len = 14; }); });
await p.click('[data-m="new"]'); await p.click('#avaOk'); await p.waitForSelector('#sBack.on'); await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on');
ok(!(await p.locator('#prepBox [data-v^="own:"]').count()), 'keine eigenen Web-Audio-Songs mehr');
await p.click('#prepBox [data-g="music"][data-v="yt"]'); await p.waitForSelector('#ovQ'); await p.fill('#ovQ', 'Sommerhit'); await p.press('#ovQ', 'Enter');
await p.waitForSelector('#ovRes [data-i="0"]'); await shot(p, 'song-suche'); await p.click('#ovRes [data-i="0"]');
ok(/Sommerhit/.test(await p.textContent('#prepBox [data-v="yt"]')) && (await p.getAttribute('#prepBox [data-v="yt"]', 'aria-pressed')) === 'true', 'Song gewählt: ' + await p.textContent('#prepBox [data-v="yt"] b'));
await shot(p, 'song-prep');
await p.click('#bGo'); await p.waitForSelector('#sTalk.on'); for (let i = 0; i < 6; i++) { if (await p.isVisible('#bStageGo')) break; await p.click('#talkQ [data-a="0"]'); } await p.click('#bStageGo');
await p.waitForSelector('#sStage.on', { timeout: 30000 }); await p.waitForFunction(() => { const s = window.SMYVApp.stageObj(); return s && s.o.ext && s.now > 3; }, null, { timeout: 15000 });
const r = await p.evaluate(() => { const s = window.SMYVApp.stageObj(), e = s.o.ext, B = 60 / e.bpm; const off = s.notes.map(n => { const x = ((s.v0 + n.t - e.beat0) % (B / 2) + B / 2) % (B / 2); return Math.min(x, B / 2 - x); });
  return { bpm: e.bpm, beat0: e.beat0, notes: s.notes.length, maxOff: Math.max(...off), vid: e.vid, vis: !document.getElementById('stVid').hidden, title: document.getElementById('stTitle').textContent, sync: !document.getElementById('stSync').hidden }; });
ok(Math.abs(r.bpm - 120) < 1.5, 'Tempo aus der Hörprobe: ' + r.bpm + ' BPM (echt: 120)');
ok(Math.abs(((r.beat0 % 0.5) + 0.5) % 0.5 - 0.25) < 0.03, 'Taktlage aus dem Liedtext: ' + r.beat0.toFixed(3) + ' s');
ok(r.notes >= 4 && r.maxOff < 0.01, `Noten liegen auf den Schlägen des Songs (${r.notes} Noten, max. Abweichung ${(r.maxOff * 1000).toFixed(1)} ms)`);
ok(r.vid === 'AAAAAAAAAAA' && r.vis, 'offizielles Video läuft sichtbar auf der Bühne');
ok(/YouTube · Test Band/.test(r.title) && /iTunes/.test(r.title) && /LRCLIB/.test(r.title), 'Quelle im Auftritt: ' + r.title);
await shot(p, 'song-buehne');
const t0 = await p.evaluate(() => window.SMYVApp.stageObj().notes.find(n => !n.st && n.t > window.SMYVApp.stageObj().now + 1).t);
await p.click('#stSync [data-d="0.03"]'); const t1 = await p.evaluate(t => window.SMYVApp.stageObj().notes.find(n => Math.abs(n.t - t - 0.03) < 1e-6) ? 1 : 0, t0);
ok(r.sync && t1 === 1 && (await p.evaluate(() => window.SMYVApp.state().save.ytSync.AAAAAAAAAAA)) === 0.03, 'Song-Sync von Hand: ▶ schiebt Noten um 30 ms und merkt es sich');
// Vorsingen: Karaoke-Video direkt im Spiel suchen
await p.evaluate(() => { const s = window.SMYVApp.stageObj(); if (s) s.abort(); });
await p.waitForTimeout(1500); await p.evaluate(() => window.SMYVApp.go('sSing'));
await p.waitForSelector('#sSing.on'); await p.click('#singBox .songFind [data-yt]'); await p.waitForSelector('#ovQ'); await p.fill('#ovQ', 'Sommerhit'); await p.press('#ovQ', 'Enter');
await p.waitForSelector('#ovRes [data-i="0"]'); await shot(p, 'karaoke-suche'); await p.click('#ovRes [data-i="0"]');
const k = await p.evaluate(() => ({ link: (document.getElementById('singLink') || {}).value, title: (document.getElementById('singTitle') || {}).value }));
ok(/youtu\.be\/KKKKKKKKKKK/.test(k.link) && /Sommerhit/.test(k.title) && !/Karaoke Version/.test(k.title), 'Karaoke-Video im Spiel gefunden: ' + k.title + ' · ' + k.link);
// Jury verteilt Songs: in Recall/Mottoshow manchmal (nicht immer)
const as = await p.evaluate(() => { const A = window.SMYVApp, sv = A.state().save, s = sv.season; s.status = 'backstage'; let hit = 0, n = 0;
  for (let k = 0; k < 40; k++) { s.seed = 1000 + k; s.round = 2; if (A.assignOf(s)) hit++; n++; }
  s.round = 0; const cast = A.assignOf(s); s.round = 2; for (let k = 0; k < 40 && !A.assignOf(s); k++) s.seed = 2000 + k; return { hit, n, cast: !!cast, a: A.assignOf(s) }; });
ok(as.hit > 5 && as.hit < 35 && !as.cast, `Jury verteilt manchmal Songs (${as.hit} von ${as.n} Mottoshows, nie im Casting)`);
await p.evaluate(() => { window.SMYVApp.go('sMenu'); window.SMYVApp.go('sBack'); }); await p.waitForSelector('#sBack.on'); await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on');
ok(/hat dir einen Song zugeteilt/.test(await p.textContent('#prepBox')) && (await p.locator('#prepBox [data-g="music"]').count()) === 1, 'Zugeteilter Song: ' + as.a.name + ' → ' + as.a.t); await shot(p, 'jury-song');
// Reiter „Song“ ohne Auswahl → Zufalls-Song (nicht Radio)
await p.evaluate(() => { const st = window.SMYVApp.state(); st.prep.song = null; st.prep.music = 'radio:ricorewi'; st.prep.tab = 'song'; st.save.season.round = 0; window.SMYVApp.go('sMenu'); window.SMYVApp.go('sBack'); });
await p.click('[data-b="stage"]'); await p.waitForSelector('#sPrep.on'); await p.click('#bGo'); await p.waitForSelector('#sTalk.on');
const rs = await p.evaluate(() => { const pr = window.SMYVApp.state().prep; return { music: pr.music, song: pr.song && pr.song.title }; });
ok(rs.music === 'yt' && rs.song, 'Song-Reiter ohne Auswahl spielt einen Zufalls-Song: ' + rs.song);
ok(!errs.length, 'Keine Laufzeitfehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
