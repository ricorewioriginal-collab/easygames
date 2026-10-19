#!/usr/bin/env node
// Öffentliche Profile (radio-profil.html): ohne Anmeldung Liste/Profil sichtbar, „Mein Profil“ nur mit Hinweis; angemeldet: Zahlen aus dem Konto werden beim Speichern mitgeschickt,
// Social-Links/Bereiche/Öffentlich-Schalter gehen an den Server; Liste mit Suche, Profilansicht mit klickbaren Links.
//   NODE_PATH=$(npm root -g) node tools/test-radio-profil.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
const portal = {
  rrw_mein_radio_dev_a: { v: JSON.stringify({ s: 40000, st: { ricorewi: 30000, rockradio24: 10000 }, d: ['2026-10-18', '2026-10-19'] }), t: 1 },
  rrw_favorites_v1: { v: '["rockradio24","ricorewi","kultradio24","x4"]', t: 1 },
  rrw_mein_radio_song_favs_v1: { v: JSON.stringify([{ artist: 'Band', title: 'Lied' }]), t: 1 }
};
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'), 'utf8')).games;
const home = { 'eg-fav': { v: JSON.stringify([catalog[1].id, 'gibt-es-nicht', catalog[0].id]), t: 1 }, 'eg-ach': { v: JSON.stringify({ d: 7, t: 50 }), t: 1 } };
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  let saved = null; const queries = [];
  await c.route(/^https?:\/\/(?!127)/, r => {
    const u = new URL(r.request().url()), a = u.searchParams.get('action'), h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, j = o => r.fulfill({ contentType: 'application/json', headers: h, body: JSON.stringify(o) });
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: h });
    if (u.host === 'api.laut.fm') return j({ display_name: 'Name ' + u.pathname.split('/').pop() });
    if (u.host !== 'www.ricorewi-radio.de') return r.fulfill({ status: 404, headers: h, body: '{}' });
    if (a === 'saves_get') return j({ d: JSON.stringify(u.searchParams.get('game') === 'home' ? home : portal), ver: 'v' });
    if (a === 'account_articles') return j({ articles: [] });
    if (a === 'pubprofile_get') return j(saved ? { status: 'ok', profile: Object.assign({ slug: 'rico' }, saved) } : { status: 'none', profile: null });
    if (a === 'pubprofile_save') { saved = JSON.parse(r.request().postData()); return j({ status: 'ok', profile: Object.assign({ slug: 'rico' }, saved) }); }
    if (a === 'pubprofiles_list') { queries.push(u.searchParams.get('q')); return j({ status: 'ok', total: 1, page: 1, pages: 1, items: [{ nick: 'Rico', slug: 'rico', avatar: '🦊', bio: 'Hi', sec: 7200, top: { id: 'ricorewi', n: 'RicoReWi' }, rach: { rank: 'Jungfuchs' } }] }); }
    if (a === 'pubprofile_view') return u.searchParams.get('n') === 'rico' ? j({ status: 'ok', profile: { nick: 'Rico', slug: 'rico', avatar: '🦊', bio: 'Hi', social: { instagram: 'https://www.instagram.com/rico', tiktok: 'javascript:alert(1)' }, games: [{ id: catalog[0].id, t: 'Spiel A' }], gach: { d: 7, t: 50 }, stations: [{ id: 'ricorewi', n: 'RicoReWi' }], songs: [{ a: 'Band', t: 'Lied' }], top: { id: 'ricorewi', n: 'RicoReWi' }, sec: 7200, rach: { rank: 'Jungfuchs', points: 90, done: 5, total: 40, level: 2 } } }) : j({ status: 'none', message: 'Dieses Profil gibt es nicht.' });
    return r.fulfill({ status: 404, headers: h, body: '{}' });
  });
  const errors = [], p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  // ohne Anmeldung: Nutzerliste und Profil
  await p.goto(base + 'radio-profil.html?embed=1&liste=1'); await p.waitForSelector('.rrp-item');
  assert.ok(/Rico/.test(await p.textContent('.rrp-item')) && /Jungfuchs/.test(await p.textContent('.rrp-item')), 'Liste zeigt Spitzname und Rang');
  await p.fill('#rrp-q', 'ric'); await p.waitForTimeout(700); assert.ok(queries.includes('ric'), 'Suche geht an den Server');
  await p.click('.rrp-item'); await p.waitForSelector('.rrp-hero');
  const t = await p.textContent('#app'); assert.ok(/Top-3-Spiele/.test(t) && /Lieblingssongs/.test(t) && /Lied/.test(t) && /2 Std/.test(t) && /7 von 50/.test(t), 'Profil zeigt alle Bereiche');
  assert.strictEqual(await p.locator('.rrp-soc a').count(), 1, 'nur der gültige Link ist klickbar');
  assert.strictEqual(await p.getAttribute('.rrp-soc a', 'href'), 'https://www.instagram.com/rico');
  console.log('PASS Ohne Anmeldung: Liste, Suche, Profil mit klickbarem Social-Link (unsichere Links fehlen)');
  // angemeldet: eigenes Profil
  await p.evaluate(() => { localStorage.setItem('anmacha-rating-token', 'abc.def'); localStorage.setItem('anmacha-rating-user', JSON.stringify({ name: 'Test Person' })); });
  await p.goto(base + 'radio-profil.html?embed=1'); await p.waitForSelector('#rrp-f');
  assert.ok(/3 Spiele|2 Spiele/.test(await p.textContent('#app')) && /Hörzeit/.test(await p.textContent('#app')));
  await p.fill('#rrp-nick', 'Rico'); await p.check('#rrp-pub'); await p.uncheck('#rrp-s-songs'); await p.fill('#rrp-so-instagram', '@rico'); await p.fill('#rrp-bio', 'Hi');
  await p.click('#rrp-f button[type=submit]'); await p.waitForSelector('#rrp-del', { timeout: 8000 });
  assert.ok(saved && saved.nick === 'Rico' && saved.public === true && saved.sections.songs === false && saved.sections.games === true && saved.social.instagram === '@rico', 'Formular geht an den Server');
  assert.strictEqual(saved.games.length, 2, 'Top-Spiele aus den Favoriten (unbekannte fehlen)'); assert.strictEqual(saved.games[0].id, catalog[1].id);
  assert.deepStrictEqual(saved.stations.map(s => s.id), ['rockradio24', 'ricorewi', 'kultradio24']); assert.strictEqual(saved.stations[0].n, 'Name rockradio24');
  assert.strictEqual(saved.top.id, 'ricorewi'); assert.strictEqual(saved.sec, 40000); assert.deepStrictEqual(saved.gach, { d: 7, t: 50 }); assert.strictEqual(saved.songs[0].t, 'Lied'); assert.ok(saved.rach.rank);
  console.log('PASS Angemeldet: Zahlen aus dem Konto (Spiele, Sender, Songs, Meistgehört, Hörzeit, Erfolge) und Formular werden gespeichert');
  assert.deepStrictEqual(errors, []);
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
