#!/usr/bin/env node
// Prüft die Spieldaten von ZEITSPRUNG WISSEN: Ereignisse, Fragen, Clips, Songs und Bildrätsel.
//   node tools/test-zeitsprung-wissen.mjs   (Exit-Code 1 bei Fehlern)
import { EVENTS, WORLDS, formatYear } from '../zeitsprung-wissen/events.js';
import { KNOWLEDGE } from '../zeitsprung-wissen/knowledge.js';
import { CLIPS, SONGS, clipSource, songChoices } from '../zeitsprung-wissen/media.js';
import { VISUALS, visualChoices } from '../zeitsprung-wissen/visual.js';
import { yearChoices } from '../zeitsprung-wissen/year.js';

const errors = [];
const fail = message => errors.push(message);
const titles = new Set();
const categories = new Set(Object.values(WORLDS).flat());

for (const event of EVENTS) {
  if (titles.has(event.title)) fail(`Ereignis doppelt: ${event.title}`);
  titles.add(event.title);
  if (!Number.isInteger(event.year) || event.year === 0 || event.year > 2026) fail(`Ungültiges Jahr: ${event.title} (${event.year})`);
  if (!event.info) fail(`Einordnung fehlt: ${event.title}`);
  if (!categories.has(event.category)) fail(`Kategorie ohne Themenwelt: ${event.category}`);
  for (let i = 0; i < 40; i++) {
    const choices = yearChoices(event.year);
    if (choices.length !== 4 || new Set(choices).size !== 4 || !choices.includes(event.year) || choices.includes(0)) { fail(`Jahreswahl fehlerhaft: ${event.title} → ${choices}`); break; }
  }
}
for (const title of Object.keys(CLIPS)) {
  if (!titles.has(title)) fail(`Clip ohne Ereignis: ${title}`);
  const source = clipSource(EVENTS.find(event => event.title === title));
  if (!source?.src.startsWith('https://commons.wikimedia.org/wiki/File:') || !source.src.endsWith('?embedplayer=yes')) fail(`Clip-URL fehlerhaft: ${title}`);
}
for (const item of [...SONGS, ...VISUALS]) {
  if (!item.event) fail(`${item.id} verweist auf unbekanntes Ereignis: ${item.work}`);
  const choices = item.id.startsWith('song') ? songChoices(item) : visualChoices(item);
  if (choices.length !== 4 || new Set(choices).size !== 4 || !choices.includes(item.work)) fail(`Auswahl fehlerhaft: ${item.id}`);
}
if (new Set(SONGS.map(song => song.work)).size !== SONGS.length) fail('Ein Ereignis hat mehrere Songs');
const quizIds = new Set();
for (const q of KNOWLEDGE) {
  if (quizIds.has(q.id)) fail(`Frage-ID doppelt: ${q.id}`);
  quizIds.add(q.id);
  if (!q.world || !(q.world in WORLDS)) fail(`Frage ohne Themenwelt: ${q.id}`);
  if (q.options.length !== 4 || new Set(q.options).size !== 4 || !q.options.includes(q.answer) || q.options.some(option => !String(option).trim())) fail(`Antworten fehlerhaft: ${q.id} ${q.prompt} → ${q.options}`);
}
const prompts = KNOWLEDGE.map(q => q.prompt);
if (new Set(prompts).size !== prompts.length) fail('Frage doppelt: ' + prompts.filter((p, i) => prompts.indexOf(p) !== i).join(', '));
if (formatYear(-776) !== '776 v. Chr.' || formatYear(1989) !== '1989') fail('formatYear fehlerhaft');

for (const world of Object.keys(WORLDS)) {
  const events = EVENTS.filter(event => event.world === world).length, quiz = KNOWLEDGE.filter(q => q.world === world).length;
  if (events < 10 || quiz < 20) fail(`Themenwelt zu klein: ${world} (${events} Ereignisse, ${quiz} Fragen)`);
  console.log(`${world}: ${events} Ereignisse, ${quiz} Fragen`);
}
console.log(`Gesamt: ${EVENTS.length} Ereignisse, ${KNOWLEDGE.length} Fragen, ${Object.keys(CLIPS).length} Clips, ${SONGS.length} Songs, ${VISUALS.length} Bildrätsel`);
errors.forEach(message => console.error('FEHLER: ' + message));
process.exit(errors.length ? 1 : 0);
