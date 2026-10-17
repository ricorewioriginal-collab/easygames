// Prüft die Betreiber-Teile der Spiele-Verwaltung in cloud/firestore.rules (config/games, Ranglisten-Einträge entfernen, Sperrliste lesen) gegen den lokalen Firestore-Emulator.
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc } from 'firebase/firestore';

let env;
const boss = { email: 'ricorewioriginal@gmail.com', email_verified: true };
const as = (uid, claims) => (uid ? env.authenticatedContext(uid, claims) : env.unauthenticatedContext()).firestore();
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-admin', firestore: { rules: readFileSync(new URL('../../cloud/firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } }); });
after(async () => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); });

test('config/games: öffentlich lesbar (auch ohne Anmeldung), schreiben nur der Betreiber mit festem Format, nicht auflistbar', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'config/games'), { d: '{"hide":["x"]}', t: 1 }); });
  await assertSucceeds(getDoc(doc(as(null), 'config/games')));
  await assertFails(getDocs(query(collection(as('u1'), 'config'), limit(5))));
  await assertFails(setDoc(doc(as('u1'), 'config/games'), { d: '{}', t: 2 }));
  await assertFails(setDoc(doc(as('x', { email: 'ricorewioriginal@gmail.com', email_verified: false }), 'config/games'), { d: '{}', t: 2 }));
  await assertSucceeds(setDoc(doc(as('adm', boss), 'config/games'), { d: '{"hide":["y"]}', t: 3 }));
  await assertFails(setDoc(doc(as('adm', boss), 'config/games'), { d: '{}', t: 3, extra: 1 }));
  await assertFails(setDoc(doc(as('adm', boss), 'config/games'), { d: 'x'.repeat(20000), t: 3 }));
  await assertFails(setDoc(doc(as('adm', boss), 'config/Gro%C3%9F'), { d: '{}', t: 3 }));
});

test('Ranglisten-Einträge: Betreiber darf fremde löschen, andere nicht', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'boards/snake/e/u1'), { n: 'Rico', s: 5, o: 'desc', t: 1 }); });
  await assertFails(deleteDoc(doc(as('u2'), 'boards/snake/e/u1')));
  await assertSucceeds(deleteDoc(doc(as('adm', boss), 'boards/snake/e/u1')));
});

test('Sperrliste: nur der Betreiber darf sie auflisten', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'chat_ban/u9'), { t: 1 }); });
  await assertFails(getDocs(query(collection(as('u1'), 'chat_ban'), limit(50))));
  await assertSucceeds(getDocs(query(collection(as('adm', boss), 'chat_ban'), limit(50))));
});
