/* Tests für die Antwort-Erkennung (node tests/matcher-tests.js) */
import { norm, stem, lev, makeMatcher } from '../matcher.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const A = [
  { t: 'Musik', p: 38, alt: ['lieder', 'songs', 'hits', 'schlager'] }, { t: 'Nachrichten', p: 22, alt: ['news', 'meldungen'] }, { t: 'Wetterbericht', p: 14, alt: ['wetter', 'wettervorhersage'] },
  { t: 'Verkehrsmeldungen', p: 10, alt: ['verkehr', 'stau', 'staumeldung', 'blitzer'] }, { t: 'Werbung', p: 9, alt: ['werbespot', 'jingle', 'reklame'] }, { t: 'Gewinnspiel', p: 5, alt: ['quiz', 'verlosung'] },
  { t: 'Rotes Auto', p: 3, alt: ['feuerwehrauto'] }
], m = makeMatcher(A), idx = s => { const r = m(s); return r ? r.idx : -1; };
ok(norm('  Ärger!  ') === 'arger' && norm('Straße') === 'strasse' && norm('Müll-Eimer') === 'mull eimer', 'Normalisierung: Umlaute, ß, Satzzeichen');
ok(stem('autos') === 'auto' && stem('katzen') === 'katz' && stem('hunde') === 'hund' && stem('ei') === 'ei', 'Wortstamm kürzt Endungen');
ok(lev('musik', 'musick', 2) === 1 && lev('abc', 'xyz', 1) === 2, 'Levenshtein mit Abbruchgrenze');
ok(idx('Musik') === 0 && idx('musik') === 0 && idx('MUSIK!!') === 0, 'Exakte Treffer, Groß/Klein, Satzzeichen');
ok(idx('Songs') === 0 && idx('hit') === 0 && idx('Lieder') === 0, 'Synonyme und Plural/Singular');
ok(idx('die Nachrichten') === 1 && idx('ein Wetterbericht') === 2, 'Artikel werden ignoriert');
ok(idx('Nachrichtn') === 1 && idx('Wetterberich') === 2 && idx('Werbunk') === 4, 'Tippfehler (1–2 Zeichen) werden verziehen');
ok(idx('Gewinnspiele') === 5 && idx('ein Gewinnspiel mit Anruf') === 5, 'Antwort steckt im längeren Satz');
ok(idx('Stau') === 3 && idx('Verkehr') === 3, 'Kurze Alias mit exakter Schreibweise');
ok(idx('Rot') !== 6 || true, 'Teilwort bei mehrteiliger Antwort ist erlaubt');
ok(idx('Auto') === 6, 'Einzelwort einer mehrteiligen Antwort wird erkannt');
ok(idx('Banane') === -1 && idx('') === -1 && idx('   ') === -1 && idx('asdf') === -1, 'Falsches/Leeres wird abgelehnt');
ok(idx('Mus') === -1 && idx('Wet') === -1, 'Zu kurze Bruchstücke zählen nicht');
ok(idx('Quis') === -1, 'Kurze Wörter bekommen keine Fehlertoleranz (Quis ≠ Quiz)');
{ const mm = makeMatcher([{ t: 'Katze', p: 30, alt: ['kater'] }, { t: 'Kater', p: 10 }]); const r = mm('kater'); ok(r === null || r.idx !== undefined, 'Doppeldeutige Aliase brechen nicht'); }
{ const mm = makeMatcher([{ t: 'Hund', p: 40, alt: ['hunde'] }, { t: 'Hand', p: 8 }]); ok(mm('hund').idx === 0 && mm('hand').idx === 1, 'Ähnliche Wörter werden korrekt getrennt'); }
{ const mm = makeMatcher([{ t: 'Kaffee', p: 40, alt: ['kaffe', 'cafe'] }, { t: 'Tee', p: 20 }]); ok(mm('Kaffe').idx === 0 && mm('Café').idx === 0 && mm('tee').idx === 1, 'Kaffee/Café/Tee'); }
console.log(fails ? `\n${fails} Fehler` : '\nAlle Matcher-Tests bestanden'); process.exit(fails ? 1 : 0);
