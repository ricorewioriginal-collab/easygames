// Prüft den Fehlermeldungs-Teil von cloud/firestore.rules (bugs, bug_last) gegen den lokalen Firestore-Emulator – per REST wie bug.html (cloud/anmacha-bug.js).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const Bug = createRequire(import.meta.url)('../../cloud/anmacha-bug.js');
const FS = 'http://127.0.0.1:8080/v1/projects/demo-bug/databases/(default)/documents/';
const jwt = (uid) => Buffer.from('{"alg":"none"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ user_id: uid, sub: uid, iss: 'https://securetoken.google.com/demo-bug', aud: 'demo-bug' })).toString('base64url') + '.';
const rest = (uid, url, body, method = 'POST') => fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(uid ? { Authorization: 'Bearer ' + jwt(uid) } : {}) }, body: body ? JSON.stringify(body) : undefined });
const rep = (o = {}) => ({ game: 'snake', kind: 'absturz', text: 'Das Spiel hängt nach Level 3 ständig.', info: '{"ua":"x"}', page: 'https://example.test/spiele', ...o });
let env;
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-bug', firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } }); });
after(async () => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); });

test('Melden: nur angemeldet, mit eigener uid, gültigen Feldern; höchstens eine Meldung alle 30 Sekunden', async () => {
  let r = await rest('u1', Bug.commitUrl(FS), Bug.sendBody(FS, 'u1', rep())); assert.equal(r.status, 200, await r.clone().text());
  r = await rest('u1', Bug.commitUrl(FS), Bug.sendBody(FS, 'u1', rep())); assert.notEqual(r.status, 200, 'zweite Meldung sofort');
  r = await rest(null, Bug.commitUrl(FS), Bug.sendBody(FS, 'u2', rep())); assert.notEqual(r.status, 200, 'ohne Anmeldung');
  r = await rest('u2', Bug.commitUrl(FS), Bug.sendBody(FS, 'u3', rep())); assert.notEqual(r.status, 200, 'fremde uid');
  r = await rest('u2', Bug.commitUrl(FS), Bug.sendBody(FS, 'u2', rep({ kind: 'hack' }))); assert.notEqual(r.status, 200, 'unbekannte Art');
  r = await rest('u2', Bug.commitUrl(FS), Bug.sendBody(FS, 'u2', rep({ text: 'kurz' }))); assert.notEqual(r.status, 200, 'zu kurz');
  const b = Bug.sendBody(FS, 'u2', rep()); b.writes.pop(); r = await rest('u2', Bug.commitUrl(FS), b); assert.notEqual(r.status, 200, 'ohne Flutschutz-Dokument');
  r = await rest('u2', Bug.commitUrl(FS), Bug.sendBody(FS, 'u2', rep({ info: '', page: '' }))); assert.equal(r.status, 200, 'ohne optionale Felder ok: ' + await r.clone().text());
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'bug_last/u1'), { t: new Date(Date.now() - 60000) }); });
  r = await rest('u1', Bug.commitUrl(FS), Bug.sendBody(FS, 'u1', rep())); assert.equal(r.status, 200, 'nach 30 s wieder möglich');
});

test('Gesperrte Spieler können nicht melden; lesen, abhaken und löschen nur der Betreiber', async () => {
  await env.withSecurityRulesDisabled(async (c) => { const d = c.firestore(); await setDoc(doc(d, 'chat_ban/u1'), { t: 1 }); await setDoc(doc(d, 'chat_admin/boss'), { a: 1 }); await setDoc(doc(d, 'bugs/b1'), { u: 'u2', g: 'snake', c: 'ton', x: 'Kein Ton im Menü zu hören', t: new Date() }); });
  let r = await rest('u1', Bug.commitUrl(FS), Bug.sendBody(FS, 'u1', rep())); assert.notEqual(r.status, 200, 'gesperrt');
  r = await rest('u2', Bug.rootQueryUrl(FS), Bug.listQuery('bugs')); assert.notEqual(r.status, 200, 'Spieler lesen nichts');
  r = await rest('u2', FS + 'bugs/b1', null, 'GET'); assert.notEqual(r.status, 200);
  r = await rest('boss', Bug.rootQueryUrl(FS), Bug.listQuery('bugs')); assert.equal(r.status, 200); assert.deepEqual(Bug.parse(await r.json()).map((x) => x.id), ['b1']);
  r = await rest('u2', FS + 'bugs/b1', null, 'DELETE'); assert.notEqual(r.status, 200, 'Spieler löschen nichts');
  r = await rest('boss', FS + 'bugs/b1', null, 'DELETE'); assert.equal(r.status, 200, 'Betreiber löscht');
});
