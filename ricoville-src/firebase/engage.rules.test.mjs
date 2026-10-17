// Prüft Nutzungsstatistik, Tagesherausforderung, Profile, Freunde und Einladungen in cloud/firestore.rules gegen den lokalen Firestore-Emulator – per REST wie die Seiten (cloud/anmacha-engage.js).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const E = createRequire(import.meta.url)('../../cloud/anmacha-engage.js');
const FS = 'http://127.0.0.1:8080/v1/projects/demo-engage/databases/(default)/documents/';
const jwt = (uid, claims = {}) => Buffer.from('{"alg":"none"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ user_id: uid, sub: uid, iss: 'https://securetoken.google.com/demo-engage', aud: 'demo-engage', ...claims })).toString('base64url') + '.';
const rest = (uid, url, body, method = 'POST', claims) => fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(uid ? { Authorization: 'Bearer ' + jwt(uid, claims) } : {}) }, body: body ? JSON.stringify(body) : undefined });
const boss = { email: 'ricorewioriginal@gmail.com', email_verified: true };
let env;
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-engage', firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } }); });
after(async () => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); });
const ok = async (r, m) => assert.equal(r.status, 200, (m || '') + ' ' + await r.clone().text());
const no = (r, m) => assert.notEqual(r.status, 200, m);
const past = async (path, data) => env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), path), data); });

test('Statistik: nur eigener Zähler (uid in der Kennung), +1 je Sitzung, Zeit 5–3600 s, 20 s Abstand; Betreiber liest alles', async () => {
  const day = 20261017, put = (uid, game, sec, cur) => rest(uid, E.commitUrl(FS), E.statCommit(FS, uid, game, day, sec, cur));
  await ok(await put('u1', 'snake', 120), 'erste Sitzung');
  let g = await rest('u1', E.statUrl(FS, 'snake', day, 'u1'), null, 'GET'); await ok(g); const cur = E.simple((await g.json()).fields); assert.deepEqual([cur.s, cur.t, cur.a], [1, 120, 0]);
  no(await put('u1', 'snake', 60, cur), 'zweite Sitzung sofort');
  await past('stats/snake_20261017_u1', { g: 'snake', d: day, s: 1, t: 120, a: 0, l: new Date(Date.now() - 60000) });
  await ok(await put('u1', 'snake', 10, cur), 'nach 20 s (kurz = Abbruch)');
  await ok(await put('u2', 'wobbel', 30), 'anderer Spieler, anderes Spiel');
  no(await put(null, 'snake', 30), 'ohne Anmeldung');
  no(await rest('u3', E.commitUrl(FS), E.statCommit(FS, 'u4', 'snake', day, 30)), 'fremder Zähler');
  no(await put('u5', 'snake', 30, { s: 5, t: 0, a: 0 }), 'Start mit falschem Stand (s=6 bei neuem Dokument)');
  const huge = E.statCommit(FS, 'u6', 'snake', day, 30); huge.writes[0].update.fields.t = { integerValue: '99999' }; no(await rest('u6', E.commitUrl(FS), huge), 'unrealistische Spielzeit');
  const wrongDay = E.statCommit(FS, 'u7', 'snake', day, 30); wrongDay.writes[0].update.name = wrongDay.writes[0].update.name.replace('snake_20261017', 'snake_20261018'); no(await rest('u7', E.commitUrl(FS), wrongDay), 'Kennung passt nicht zu Spiel/Tag');
  no(await rest('u1', E.statUrl(FS, 'wobbel', day, 'u2'), null, 'GET'), 'fremden Zähler lesen');
  no(await rest('u1', E.rootQueryUrl(FS), E.statQuery(day)), 'Spieler listen nichts');
  const r = await rest('boss', E.rootQueryUrl(FS), E.statQuery(day), 'POST', boss); await ok(r);
  const agg = E.aggregate(E.parseDocs(await r.json())); const snake = agg.find((x) => x.g === 'snake');
  assert.deepEqual([snake.s, snake.t, snake.a, snake.players], [2, 130, 1, 1]); assert.equal(agg.find((x) => x.g === 'wobbel').s, 1);
});

test('Tagesherausforderung: eigener Eintrag, nur besser werden, lesen nur angemeldet', async () => {
  const day = 20261017, put = (uid, score, extra = {}) => rest(uid, E.commitUrl(FS), E.dailyBody(FS, uid, day, 'Rico', score, extra.o || 'desc', extra.g || 'snake'));
  await ok(await put('u1', 100), 'anlegen'); await ok(await put('u1', 150), 'besser'); no(await put('u1', 120), 'schlechter');
  await ok(await put('u2', 80)); no(await rest('u3', E.commitUrl(FS), E.dailyBody(FS, 'u1', day, 'X', 5, 'desc', 'snake')), 'fremder Eintrag');
  const bad = E.dailyBody(FS, 'u4', day, 'R', 5, 'desc', 'snake'); bad.writes[0].update.name = bad.writes[0].update.name.replace('/' + day + '/', '/morgen/'); no(await rest('u4', E.commitUrl(FS), bad), 'ungültiger Tag');
  no(await rest('u5', E.commitUrl(FS), E.dailyBody(FS, 'u5', day, 'R', 1e15, 'desc', 'snake')), 'unrealistischer Wert');
  let r = await rest('u9', E.dailyListUrl(FS, day), E.dailyQuery('desc')); await ok(r); assert.deepEqual(E.parseDocs(await r.json()).map((x) => x.f.s), [150, 80]);
  no(await rest(null, E.dailyListUrl(FS, day), E.dailyQuery('desc')), 'ohne Anmeldung');
});

test('Profile: nur eigenes schreiben (alle 5 s), einzeln lesbar, nicht auflistbar, Betreiber darf entfernen', async () => {
  await ok(await rest('u1', E.commitUrl(FS), E.profileBody(FS, 'u1', { n: 'Rico', e: '🦊', r: 'Profi', p: 120, a: 7, g: 'snake,wobbel' })), 'anlegen');
  no(await rest('u1', E.commitUrl(FS), E.profileBody(FS, 'u1', { n: 'Rico', e: '🦊' })), 'zweite Änderung sofort');
  no(await rest('u2', E.commitUrl(FS), E.profileBody(FS, 'u1', { n: 'Fake', e: '🦊' })), 'fremdes Profil');
  no(await rest('u3', E.commitUrl(FS), E.profileBody(FS, 'u3', { n: 'X', e: '🦊' })), 'Name zu kurz');
  no(await rest('u3', E.commitUrl(FS), E.profileBody(FS, 'u3', { n: 'Ok', e: '🦊'.repeat(5) })), 'Emoji zu lang');
  let r = await rest('u2', FS + 'profiles/u1', null, 'GET'); await ok(r); assert.equal(E.simple((await r.json()).fields).n, 'Rico');
  no(await rest(null, FS + 'profiles/u1', null, 'GET'), 'ohne Anmeldung');
  no(await rest('u2', FS + 'profiles', null, 'GET'), 'kein Auflisten');
  no(await rest('u2', FS + 'profiles/u1', null, 'DELETE'), 'fremdes löschen');
  await ok(await rest('boss', FS + 'profiles/u1', null, 'DELETE', boss), 'Betreiber entfernt');
});

test('Freunde: nur die eigene Liste, nicht sich selbst; Einladungen nur an Spieler mit Profil, 10 s Abstand, nur Empfänger liest', async () => {
  await ok(await rest('u1', E.commitUrl(FS), E.friendBody(FS, 'u1', 'u2', 'Anna')), 'Freund hinzufügen');
  no(await rest('u1', E.commitUrl(FS), E.friendBody(FS, 'u1', 'u1', 'Ich')), 'sich selbst');
  no(await rest('u3', E.commitUrl(FS), E.friendBody(FS, 'u1', 'u3', 'Fremd')), 'fremde Liste');
  let r = await rest('u1', E.friendsUrl(FS, 'u1'), E.friendsQuery()); await ok(r); assert.deepEqual(E.parseDocs(await r.json()).map((x) => x.id), ['u2']);
  no(await rest('u3', E.friendsUrl(FS, 'u1'), E.friendsQuery()), 'fremde Liste lesen');
  await ok(await rest('u1', FS + 'friends/u1/f/u2', null, 'DELETE'), 'entfernen');

  no(await rest('u1', E.commitUrl(FS), E.inviteBody(FS, 'u1', 'Rico', 'u2', 'snake')), 'Empfänger ohne Profil');
  await past('profiles/u2', { n: 'Anna', e: '🦊', t: new Date() });
  await ok(await rest('u1', E.commitUrl(FS), E.inviteBody(FS, 'u1', 'Rico', 'u2', 'snake')), 'Einladung');
  no(await rest('u1', E.commitUrl(FS), E.inviteBody(FS, 'u1', 'Rico', 'u2', 'snake')), 'zweite sofort');
  no(await rest('u3', E.commitUrl(FS), E.inviteBody(FS, 'u1', 'Rico', 'u2', 'snake')), 'im Namen eines anderen');
  no(await rest('u2', E.commitUrl(FS), E.inviteBody(FS, 'u2', 'Anna', 'u2', 'snake')), 'an sich selbst');
  r = await rest('u2', E.invitesUrl(FS, 'u2'), E.invitesQuery()); await ok(r); const inv = E.parseDocs(await r.json()); assert.deepEqual([inv[0].f.f, inv[0].f.n, inv[0].f.g], ['u1', 'Rico', 'snake']);
  no(await rest('u3', E.invitesUrl(FS, 'u2'), E.invitesQuery()), 'fremder Posteingang');
  await ok(await rest('u2', FS + 'invites/u2/i/' + inv[0].id, null, 'DELETE'), 'Empfänger löscht');
});
