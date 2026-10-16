// Prüft cloud/firestore.rules (RicoVille-Nachbarn und die bestehenden easygames-Regeln) gegen den lokalen Firestore-Emulator.
// Start: npm test (startet den Emulator selbst). Braucht Java.
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, updateDoc } from 'firebase/firestore';

let env;
const now = new Date();
const TODAY = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
const city = (o = {}) => ({ v: 1, name: 'Sonnental', crest: '🏰', slogan: 'Hier lebt man gern', level: 3, pop: 40, t: Date.now(), layout: '{"b":[]}', ...o });
const msg = (from, type, o = {}) => ({ from, name: 'Anna', type, day: TODAY, done: false, ...(type === 'gift' ? { item: 'ziegel' } : {}), ...(type === 'visit' ? { n: 3 } : {}), ...o });
const mid = (from, type, day = TODAY) => `${from}_${day}_${type}`;
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ricoville',
    firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  // Bob hat schon eine Stadt (Ziel für Besuche und Geschenke)
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'ricoville_cities/bob'), city({ name: 'Bobhausen' })));
});

test('eigene Stadtansicht schreiben, fremde nicht', async () => {
  await assertSucceeds(setDoc(doc(db('anna'), 'ricoville_cities/anna'), city()));
  await assertFails(setDoc(doc(db('anna'), 'ricoville_cities/bob'), city()));
  await assertFails(setDoc(doc(db(null), 'ricoville_cities/anna'), city()));
});

test('Stadtansicht: nur erlaubte Felder und Größen', async () => {
  const a = doc(db('anna'), 'ricoville_cities/anna');
  await assertFails(setDoc(a, city({ coins: 999999 })));
  await assertFails(setDoc(a, city({ name: 'x'.repeat(25) })));
  await assertFails(setDoc(a, city({ name: '' })));
  await assertFails(setDoc(a, city({ level: 0 })));
  await assertFails(setDoc(a, city({ level: 'hoch' })));
  await assertFails(setDoc(a, city({ layout: 'x'.repeat(60001) })));
  await assertFails(setDoc(a, city({ v: 2 })));
});

test('Städte ansehen und auflisten nur angemeldet und höchstens 30', async () => {
  await assertSucceeds(getDoc(doc(db('anna'), 'ricoville_cities/bob')));
  await assertFails(getDoc(doc(db(null), 'ricoville_cities/bob')));
  await assertSucceeds(getDocs(query(collection(db('anna'), 'ricoville_cities'), limit(30))));
  await assertFails(getDocs(query(collection(db('anna'), 'ricoville_cities'), limit(31))));
  await assertFails(getDocs(collection(db('anna'), 'ricoville_cities')));
});

test('Nachbarliste gehört nur dem Besitzer', async () => {
  await assertSucceeds(setDoc(doc(db('anna'), 'ricoville_cities/anna/neighbors/bob'), { name: 'Bobhausen', t: 1 }));
  await assertFails(setDoc(doc(db('anna'), 'ricoville_cities/anna/neighbors/anna'), { name: 'Ich', t: 1 }));
  await assertFails(setDoc(doc(db('anna'), 'ricoville_cities/bob/neighbors/anna'), { name: 'Anna', t: 1 }));
  await assertFails(getDocs(collection(db('anna'), 'ricoville_cities/bob/neighbors')));
  await assertFails(setDoc(doc(db('anna'), 'ricoville_cities/anna/neighbors/bob'), { name: 'B', t: 1, extra: true }));
});

test('Geschenk, Besuch und Hallo in fremden Posteingang', async () => {
  for (const type of ['gift', 'visit', 'hello']) await assertSucceeds(setDoc(doc(db('anna'), `ricoville_cities/bob/inbox/${mid('anna', type)}`), msg('anna', type)));
});

test('höchstens eine Nachricht je Absender, Art und Tag', async () => {
  const ref = doc(db('anna'), `ricoville_cities/bob/inbox/${mid('anna', 'gift')}`);
  await assertSucceeds(setDoc(ref, msg('anna', 'gift')));
  await assertFails(setDoc(ref, msg('anna', 'gift', { item: 'stahl' })));
  await assertFails(deleteDoc(ref));
  // eine andere ID am selben Tag ist nicht möglich
  await assertFails(setDoc(doc(db('anna'), `ricoville_cities/bob/inbox/anna_${TODAY}_gift2`), msg('anna', 'gift')));
});

test('keine gefälschten oder übergroßen Nachrichten', async () => {
  const at = (id) => doc(db('anna'), `ricoville_cities/bob/inbox/${id}`);
  await assertFails(setDoc(at(mid('carl', 'gift')), msg('carl', 'gift'))); // fremder Absender
  await assertFails(setDoc(at(mid('anna', 'gift', TODAY - 1)), msg('anna', 'gift', { day: TODAY - 1 }))); // anderer Tag
  await assertFails(setDoc(at(mid('anna', 'gift')), msg('anna', 'gift', { item: 'gold' }))); // unbekanntes Geschenk
  await assertFails(setDoc(at(mid('anna', 'gift')), msg('anna', 'gift', { n: 5 }))); // Geschenk mit Menge
  await assertFails(setDoc(at(mid('anna', 'visit')), msg('anna', 'visit', { n: 6 }))); // zu viel Hilfe
  await assertFails(setDoc(at(mid('anna', 'visit')), msg('anna', 'visit', { n: 0 })));
  await assertFails(setDoc(at(mid('anna', 'hello')), msg('anna', 'hello', { coins: 1000 }))); // Zusatzfeld
  await assertFails(setDoc(at(mid('anna', 'hello')), msg('anna', 'hello', { done: true })));
  await assertFails(setDoc(at(mid('anna', 'coins')), msg('anna', 'coins'))); // unbekannte Art
  await assertFails(setDoc(doc(db(null), `ricoville_cities/bob/inbox/${mid('anna', 'gift')}`), msg('anna', 'gift')));
});

test('nicht in den eigenen und nicht in nicht vorhandene Posteingänge', async () => {
  await assertFails(setDoc(doc(db('bob'), `ricoville_cities/bob/inbox/${mid('bob', 'gift')}`), msg('bob', 'gift')));
  await assertFails(setDoc(doc(db('anna'), `ricoville_cities/niemand/inbox/${mid('anna', 'gift')}`), msg('anna', 'gift')));
});

test('Empfänger liest, markiert erledigt, löscht erst ab dem Folgetag', async () => {
  const id = mid('anna', 'gift');
  await assertSucceeds(setDoc(doc(db('anna'), `ricoville_cities/bob/inbox/${id}`), msg('anna', 'gift')));
  const bob = db('bob');
  await assertSucceeds(getDocs(collection(bob, 'ricoville_cities/bob/inbox')));
  await assertFails(getDocs(collection(db('anna'), 'ricoville_cities/bob/inbox')));
  await assertFails(updateDoc(doc(bob, `ricoville_cities/bob/inbox/${id}`), { item: 'stahl' }));
  await assertFails(updateDoc(doc(bob, `ricoville_cities/bob/inbox/${id}`), { done: false }));
  await assertSucceeds(updateDoc(doc(bob, `ricoville_cities/bob/inbox/${id}`), { done: true }));
  await assertFails(updateDoc(doc(db('anna'), `ricoville_cities/bob/inbox/${id}`), { done: true }));
  await assertFails(deleteDoc(doc(bob, `ricoville_cities/bob/inbox/${id}`)));
  const old = `anna_${TODAY - 1}_gift`;
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), `ricoville_cities/bob/inbox/${old}`), msg('anna', 'gift', { day: TODAY - 1, done: true })));
  await assertSucceeds(deleteDoc(doc(bob, `ricoville_cities/bob/inbox/${old}`)));
});

test('bestehende easygames-Regeln gelten weiter', async () => {
  await assertSucceeds(setDoc(doc(db('anna'), 'users/anna/saves/ricoville'), { d: 'x', t: 1 }));
  await assertFails(getDoc(doc(db('anna'), 'users/bob/saves/ricoville')));
  await assertFails(setDoc(doc(db('anna'), 'users/anna/saves/ricoville'), { d: 'x', t: 1, extra: 1 }));
});
