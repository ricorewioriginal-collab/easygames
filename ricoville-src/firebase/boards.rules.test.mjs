// Prüft den Ranglisten-Teil von cloud/firestore.rules (boards/<spiel>/e/<uid>) gegen den lokalen Firestore-Emulator.
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';

let env;
const entry = (o = {}) => ({ n: 'Rico', s: 100, o: 'desc', t: Date.now(), ...o });
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const ref = (d, board, uid) => doc(d, `boards/${board}/e/${uid}`);

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-boards',
    firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); });

test('Rangliste ist öffentlich lesbar (Einzeleintrag und sortierte Liste, ohne Anmeldung)', async () => {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(ref(c.firestore(), 'snake', 'u1'), entry({ s: 500 }));
    await setDoc(ref(c.firestore(), 'snake', 'u2'), entry({ s: 900, n: 'Anna' }));
  });
  await assertSucceeds(getDoc(ref(db(null), 'snake', 'u1')));
  await assertSucceeds(getDocs(query(collection(db(null), 'boards/snake/e'), orderBy('s', 'desc'), limit(25))));
});

test('Boards selbst lassen sich nicht auflisten', async () => {
  await assertFails(getDocs(collection(db(null), 'boards')));
});

test('nur der eigene Eintrag darf geschrieben werden (uid = Dokument-ID)', async () => {
  await assertSucceeds(setDoc(ref(db('u1'), 'snake', 'u1'), entry()));
  await assertFails(setDoc(ref(db('u1'), 'snake', 'u2'), entry()));
  await assertFails(setDoc(ref(db(null), 'snake', 'u1'), entry()));
});

test('Eintrag: nur n/s/o/t, Spitzname 2–20 Zeichen, Zahl im Bereich, o desc/asc', async () => {
  const r = ref(db('u1'), 'snake', 'u1');
  await assertFails(setDoc(r, entry({ email: 'a@b.de' })));
  await assertFails(setDoc(r, entry({ n: 'x' })));
  await assertFails(setDoc(r, entry({ n: 'x'.repeat(21) })));
  await assertFails(setDoc(r, entry({ n: 5 })));
  await assertFails(setDoc(r, entry({ s: '100' })));
  await assertFails(setDoc(r, entry({ s: -1 })));
  await assertFails(setDoc(r, entry({ s: 2e12 })));
  await assertFails(setDoc(r, entry({ o: 'up' })));
  await assertFails(setDoc(r, entry({ t: 'jetzt' })));
  await assertFails(setDoc(ref(db('u1'), 'bad board!', 'u1'), entry()));
  await assertSucceeds(setDoc(r, entry({ s: 0 })));
});

test('bestehender Eintrag wird nur besser (desc: höher, asc: niedriger), Richtung bleibt fest', async () => {
  const hi = ref(db('u1'), 'snake', 'u1');
  await assertSucceeds(setDoc(hi, entry({ s: 100 })));
  await assertSucceeds(setDoc(hi, entry({ s: 150 })));
  await assertSucceeds(setDoc(hi, entry({ s: 150, n: 'Neuer Name' })));
  await assertFails(setDoc(hi, entry({ s: 120 })));
  await assertFails(setDoc(hi, entry({ s: 200, o: 'asc' })));
  const lo = ref(db('u1'), 'kart__wiese', 'u1');
  await assertSucceeds(setDoc(lo, entry({ s: 60.5, o: 'asc' })));
  await assertSucceeds(setDoc(lo, entry({ s: 58.2, o: 'asc' })));
  await assertFails(setDoc(lo, entry({ s: 70, o: 'asc' })));
});

test('Eintrag löschen: nur der Besitzer', async () => {
  await assertSucceeds(setDoc(ref(db('u1'), 'snake', 'u1'), entry()));
  await assertFails(deleteDoc(ref(db('u2'), 'snake', 'u1')));
  await assertFails(deleteDoc(ref(db(null), 'snake', 'u1')));
  await assertSucceeds(deleteDoc(ref(db('u1'), 'snake', 'u1')));
});
