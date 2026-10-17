// Prüft den Chat-Teil von cloud/firestore.rules (chat/<raum>/m/<id>, chat_last, chat_online, chat_admin, chat_ban, chat_reports) gegen den lokalen Firestore-Emulator.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';

let env;
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const msg = (uid, o = {}) => ({ u: uid, n: 'Rico', x: 'Hallo zusammen', t: serverTimestamp(), ...o });
// Nachricht + Flutschutz-Dokument in einem Schreibvorgang (so schreibt chat.html)
const send = (d, uid, room = 'lobby', id = 'm' + Math.random().toString(36).slice(2), o = {}, last = true) => {
  const b = writeBatch(d);
  b.set(doc(d, `chat/${room}/m/${id}`), msg(uid, o));
  if (last) b.set(doc(d, `chat_last/${uid}`), { t: serverTimestamp() });
  return b.commit();
};

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-chat', firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } });
});
after(async () => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); });

test('Nachrichten: nur angemeldet lesen und schreiben', async () => {
  await assertSucceeds(send(db('u1'), 'u1'));
  await assertFails(send(db(null), 'u1'));
  await assertSucceeds(getDocs(query(collection(db('u2'), 'chat/lobby/m'), orderBy('t', 'desc'), limit(50))));
  await assertFails(getDocs(query(collection(db(null), 'chat/lobby/m'), orderBy('t', 'desc'), limit(50))));
  await assertFails(getDocs(query(collection(db('u2'), 'chat/lobby/m'), orderBy('t', 'desc'), limit(500))));
});

test('Nachrichten: nur mit eigener uid, gültigem Namen, Text bis 200 Zeichen, Serverzeit, ohne Zusatzfelder', async () => {
  await assertFails(send(db('u1'), 'u1', 'lobby', 'a', { u: 'u2' }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'b', { n: 'R' }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'c', { n: 'x'.repeat(21) }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'd', { x: '' }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'e', { x: 'a'.repeat(201) }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'f', { t: new Date() }));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'g', { admin: true }));
  await assertFails(send(db('u1'), 'u1', 'Lobby!', 'h'));
  await assertSucceeds(send(db('u1'), 'u1', 'lobby', 'i', { x: 'a'.repeat(200) }));
  await assertSucceeds(send(db('u2'), 'u2', 'g-snake', 'j'));
});

test('Flutschutz: ohne chat_last im selben Schreibvorgang und öfter als alle 2 Sekunden geht nichts', async () => {
  await assertFails(send(db('u1'), 'u1', 'lobby', 'a', {}, false));
  await assertSucceeds(send(db('u1'), 'u1', 'lobby', 'b'));
  await assertFails(send(db('u1'), 'u1', 'lobby', 'c'));
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_last/u1'), { t: new Date(Date.now() - 5000) }); });
  await assertSucceeds(send(db('u1'), 'u1', 'lobby', 'd'));
  await assertSucceeds(send(db('u2'), 'u2', 'lobby', 'e'));
  await assertFails(setDoc(doc(db('u3'), 'chat_last/u1'), { t: serverTimestamp() }));
  await assertFails(getDoc(doc(db('u1'), 'chat_last/u1')));
});

test('Sperre: gesperrte Spieler können nicht schreiben', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_ban/u1'), { t: 1 }); });
  await assertFails(send(db('u1'), 'u1'));
  await assertSucceeds(send(db('u2'), 'u2'));
  await assertSucceeds(getDoc(doc(db('u1'), 'chat_ban/u1')));
  await assertFails(getDoc(doc(db('u2'), 'chat_ban/u1')));
});

test('Löschen: Autor die eigene, Betreiber jede, andere nicht', async () => {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), 'chat/lobby/m/a'), { u: 'u1', n: 'Rico', x: 'hi', t: new Date() });
    await setDoc(doc(c.firestore(), 'chat/lobby/m/b'), { u: 'u1', n: 'Rico', x: 'hi', t: new Date() });
    await setDoc(doc(c.firestore(), 'chat_admin/boss'), { a: 1 });
  });
  await assertFails(deleteDoc(doc(db('u2'), 'chat/lobby/m/a')));
  await assertSucceeds(deleteDoc(doc(db('u1'), 'chat/lobby/m/a')));
  await assertSucceeds(deleteDoc(doc(db('boss'), 'chat/lobby/m/b')));
  await assertFails(setDoc(doc(db('u1'), 'chat/lobby/m/b'), msg('u1')));   // Ändern gibt es nicht
});

test('Betreiber: chat_admin nur selbst lesbar und nicht schreibbar; Sperren nur durch Betreiber', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_admin/boss'), { a: 1 }); });
  await assertSucceeds(getDoc(doc(db('boss'), 'chat_admin/boss')));
  await assertFails(getDoc(doc(db('u1'), 'chat_admin/boss')));
  await assertFails(setDoc(doc(db('u1'), 'chat_admin/u1'), { a: 1 }));
  await assertFails(setDoc(doc(db('u1'), 'chat_ban/u2'), { t: 1 }));
  await assertSucceeds(setDoc(doc(db('boss'), 'chat_ban/u2'), { t: 1 }));
  await assertSucceeds(deleteDoc(doc(db('boss'), 'chat_ban/u2')));
});

test('Online-Liste: nur eigenes Lebenszeichen, höchstens alle 20 Sekunden, Liste nur angemeldet', async () => {
  await assertSucceeds(setDoc(doc(db('u1'), 'chat_online/u1'), { n: 'Rico', t: serverTimestamp() }));
  await assertFails(setDoc(doc(db('u1'), 'chat_online/u1'), { n: 'Rico', t: serverTimestamp() }));
  await assertFails(setDoc(doc(db('u2'), 'chat_online/u1'), { n: 'Rico', t: serverTimestamp() }));
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_online/u1'), { n: 'Rico', t: new Date(Date.now() - 60000) }); });
  await assertSucceeds(setDoc(doc(db('u1'), 'chat_online/u1'), { n: 'Rico', t: serverTimestamp() }));
  await assertSucceeds(getDocs(query(collection(db('u2'), 'chat_online'), orderBy('t', 'desc'), limit(50))));
  await assertFails(getDocs(query(collection(db(null), 'chat_online'), orderBy('t', 'desc'), limit(50))));
  await assertSucceeds(deleteDoc(doc(db('u1'), 'chat_online/u1')));
});

test('Meldungen: jeder Angemeldete darf melden, nur der Betreiber liest', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_admin/boss'), { a: 1 }); });
  const r = (o = {}) => ({ room: 'lobby', m: 'abc', u: 'u2', x: 'böse', r: 'u1', t: serverTimestamp(), ...o });
  await assertSucceeds(setDoc(doc(db('u1'), 'chat_reports/r1'), r()));
  await assertFails(setDoc(doc(db('u1'), 'chat_reports/r2'), r({ r: 'u3' })));
  await assertFails(setDoc(doc(db(null), 'chat_reports/r3'), r()));
  await assertFails(getDoc(doc(db('u1'), 'chat_reports/r1')));
  await assertSucceeds(getDoc(doc(db('boss'), 'chat_reports/r1')));
});

// ---- Dieselben Schreib- und Leseaufrufe wie chat.html (REST über cloud/anmacha-chat.js) gegen die echten Regeln ----
import { createRequire } from 'node:module';
const C = createRequire(import.meta.url)('../../cloud/anmacha-chat.js');
const FS = 'http://127.0.0.1:8080/v1/projects/demo-chat/databases/(default)/documents/';
const jwt = (uid) => ['none', 'x'].length && Buffer.from('{"alg":"none"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ user_id: uid, sub: uid, iss: 'https://securetoken.google.com/demo-chat', aud: 'demo-chat' })).toString('base64url') + '.';
const rest = (uid, url, body, method = 'POST') => fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(uid ? { Authorization: 'Bearer ' + jwt(uid) } : {}) }, body: body ? JSON.stringify(body) : undefined });

test('REST wie in chat.html: senden, Liste abfragen, Flutschutz, Online-Liste, Melden, Löschen', async () => {
  const s1 = C.sendBody(FS, 'lobby', 'u1', 'Rico', 'Hallo zusammen');
  let r = await rest('u1', C.commitUrl(FS), s1.body); assert.equal(r.status, 200, await r.clone().text());
  r = await rest('u1', C.commitUrl(FS), C.sendBody(FS, 'lobby', 'u1', 'Rico', 'zu schnell').body); assert.notEqual(r.status, 200, 'zweite Nachricht sofort danach wird abgelehnt');
  r = await rest('u2', C.commitUrl(FS), C.sendBody(FS, 'lobby', 'u2', 'Anna', 'Hi Rico!').body); assert.equal(r.status, 200, await r.clone().text());
  r = await rest(null, C.commitUrl(FS), C.sendBody(FS, 'lobby', 'u3', 'Gast', 'ohne Login').body); assert.notEqual(r.status, 200);
  r = await rest('u2', C.roomQueryUrl(FS, 'lobby'), C.listQuery('')); assert.equal(r.status, 200, await r.clone().text());
  const msgs = C.parse(await r.json()); assert.deepEqual(msgs.map((m) => m.x), ['Hallo zusammen', 'Hi Rico!']); assert(msgs[0].t > 0 && msgs[0].u === 'u1');
  r = await rest('u2', C.roomQueryUrl(FS, 'lobby'), C.listQuery(msgs[0].ts)); assert.deepEqual(C.parse(await r.json()).map((m) => m.x), ['Hi Rico!'], 'nur neuere Nachrichten');
  r = await rest('u2', C.roomQueryUrl(FS, 'lobby'), C.listQuery(msgs[1].ts)); assert.deepEqual(C.parse(await r.json()), [], 'nichts Neues');
  r = await rest(null, C.roomQueryUrl(FS, 'lobby'), C.listQuery('')); assert.notEqual(r.status, 200, 'ohne Anmeldung nichts lesbar');
  r = await rest('u1', C.commitUrl(FS), C.presenceBody(FS, 'u1', 'Rico')); assert.equal(r.status, 200, await r.clone().text());
  r = await rest('u2', C.rootQueryUrl(FS), C.onlineQuery(Date.now() - 150000)); assert.deepEqual(C.parseOnline(await r.json()).map((o) => o.n), ['Rico']);
  r = await rest('u2', C.commitUrl(FS), C.reportBody(FS, 'lobby', msgs[0], 'u2')); assert.equal(r.status, 200, await r.clone().text());
  r = await rest('u2', C.commitUrl(FS), C.reportBody(FS, 'lobby', msgs[0], 'u1')); assert.notEqual(r.status, 200, 'Melden nur als man selbst');
  r = await rest('u2', FS + 'chat/lobby/m/' + msgs[0].id, null, 'DELETE'); assert.notEqual(r.status, 200, 'fremde Nachricht löschen geht nicht');
  r = await rest('u1', FS + 'chat/lobby/m/' + msgs[0].id, null, 'DELETE'); assert.equal(r.status, 200, 'eigene Nachricht löschen');
});
