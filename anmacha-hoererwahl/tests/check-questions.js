/* Prüft alle Fragen: Format, Punkte, Aliasse (node tests/check-questions.js) */
import QUESTIONS from '../questions.js';
import { makeMatcher, norm } from '../matcher.js';
const errs = []; const seenQ = new Set(); const cats = {};
QUESTIONS.forEach((e, i) => {
  const id = `#${i + 1} „${e.q.slice(0, 40)}"`; cats[e.cat] = (cats[e.cat] || 0) + 1;
  if (!/[:?]$/.test(e.q.trim())) errs.push(`${id}: Frage endet nicht mit : oder ?`); if (seenQ.has(norm(e.q))) errs.push(`${id}: doppelt`); seenQ.add(norm(e.q));
  if (e.a.length < 5 || e.a.length > 8) errs.push(`${id}: ${e.a.length} Antworten`);
  let prev = 1e9, sum = 0; e.a.forEach(a => { if (a.p > prev) errs.push(`${id}: Punkte nicht absteigend`); prev = a.p; sum += a.p; }); if (sum < 60 || sum > 100) errs.push(`${id}: Summe ${sum}`); if (e.a[0].p < 20) errs.push(`${id}: Top-Antwort < 20`);
  const m = makeMatcher(e.a); e.a.forEach((a, k) => [a.t, ...(a.alt || [])].forEach(s => { const r = m(s); if (!r || r.idx !== k) errs.push(`${id}: „${s}" wird nicht als Antwort ${k + 1} („${a.t}") erkannt${r ? ' (stattdessen ' + (r.idx + 1) + ')' : ''}`); }));
});
console.log(`${QUESTIONS.length} Fragen in ${Object.keys(cats).length} Kategorien:`, Object.entries(cats).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(errs.length ? errs.slice(0, 40).join('\n') + `\n${errs.length} Probleme` : 'Alle Fragen und Antwort-Aliasse sind in Ordnung'); process.exit(errs.length ? 1 : 0);
