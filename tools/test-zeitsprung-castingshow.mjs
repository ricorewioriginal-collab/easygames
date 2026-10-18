#!/usr/bin/env node
// Prüft die Spieldaten von ZEITSPRUNG CASTINGSHOW: Staffeln, Momente, Fragen, Videos, Songs und Bildrätsel.
//   node tools/test-zeitsprung-castingshow.mjs   (Exit-Code 1 bei Fehlern)
import { SEASONS, SHOW_INFO } from '../zeitsprung-castingshow/shows.js';
import { EVENTS, WORLDS, formatYear } from '../zeitsprung-castingshow/events.js';
import { KNOWLEDGE } from '../zeitsprung-castingshow/knowledge.js';
import { CLIPS, SONGS, clipSource, songChoices } from '../zeitsprung-castingshow/media.js';
import { VISUALS, visualChoices } from '../zeitsprung-castingshow/visual.js';
import { yearChoices } from '../zeitsprung-castingshow/year.js';

const errors = [];
const fail = message => errors.push(message);
const THIS_YEAR = new Date().getFullYear();

// Staffeln: lückenlos nummeriert, Jahre aufsteigend, Pflichtfelder gefüllt.
for (const show of Object.keys(SHOW_INFO)) {
  const seasons = SEASONS.filter(season => season.show === show);
  if (!seasons.length) fail(`Show ohne Staffeln: ${show}`);
  seasons.forEach((season, index) => {
    if (season.n !== index + 1) fail(`Staffelnummer falsch: ${season.id}`);
    if (!season.winner) fail(`Sieger fehlt: ${season.id}`);
    if (!Number.isInteger(season.year) || season.year < 1999 || season.year > THIS_YEAR) fail(`Ungültiges Jahr: ${season.id} (${season.year})`);
    if (index && season.year < seasons[index - 1].year) fail(`Jahre nicht aufsteigend: ${season.id}`);
    if (season.runnerUp && season.runnerUp === season.winner) fail(`Sieger = Platz 2: ${season.id}`);
    if (SHOW_INFO[show].list === 'top10' || SHOW_INFO[show].list === 'finale') {
      if (season.list[0] !== season.winner) fail(`Top-Liste beginnt nicht mit dem Sieger: ${season.id}`);
      if (season.runnerUp && !season.runnerUp.startsWith(season.list[1])) fail(`Platz 2 nicht an zweiter Stelle: ${season.id}`);
      if (new Set(season.list).size !== season.list.length) fail(`Name doppelt in der Liste: ${season.id}`);
    }
  });
}
if (SEASONS.filter(season => season.show === 'dsds').some(season => !season.list.length || season.list.length > 10)) fail('DSDS-Top-10 fehlt oder ist zu lang');

const titles = new Set();
for (const event of EVENTS) {
  if (titles.has(event.title)) fail(`Moment doppelt: ${event.title}`);
  titles.add(event.title);
  if (!Number.isInteger(event.year) || event.year < 1999 || event.year > THIS_YEAR) fail(`Ungültiges Jahr: ${event.title} (${event.year})`);
  if (!event.info) fail(`Einordnung fehlt: ${event.title}`);
  if (event.info.includes(String(event.year))) fail(`Einordnung verrät das Jahr: ${event.title}`);
  if (!(event.world in WORLDS)) fail(`Moment ohne Themenwelt: ${event.title} (${event.world})`);
  for (let i = 0; i < 40; i++) {
    const choices = yearChoices(event.year);
    if (choices.length !== 4 || new Set(choices).size !== 4 || !choices.includes(event.year) || choices.some(year => year > Math.max(THIS_YEAR, event.year))) { fail(`Jahreswahl fehlerhaft: ${event.title} → ${choices}`); break; }
  }
}
for (const [title, clip] of Object.entries(CLIPS)) {
  if (!titles.has(title)) fail(`Video ohne Moment: ${title}`);
  if (!/^[\w-]{11}$/.test(clip.id) || !clip.what) fail(`Video-ID oder Beschreibung fehlerhaft: ${title}`);
  const source = clipSource(EVENTS.find(event => event.title === title));
  if (!source?.src.startsWith('https://www.youtube-nocookie.com/embed/')) fail(`Video-URL fehlerhaft: ${title}`);
}
if (new Set(Object.values(CLIPS).map(clip => clip.id)).size !== Object.keys(CLIPS).length) fail('Ein Video ist mehrfach eingetragen');
for (const item of [...SONGS, ...VISUALS]) {
  if (!item.event) fail(`${item.id} verweist auf unbekannten Moment: ${item.work}`);
  const choices = item.id.startsWith('song') ? songChoices(item) : visualChoices(item);
  if (choices.length !== 4 || new Set(choices).size !== 4 || !choices.includes(item.work)) fail(`Auswahl fehlerhaft: ${item.id}`);
}
const quizIds = new Set();
for (const q of KNOWLEDGE) {
  if (quizIds.has(q.id)) fail(`Frage-ID doppelt: ${q.id}`);
  quizIds.add(q.id);
  if (!q.world || !(q.world in WORLDS)) fail(`Frage ohne Themenwelt: ${q.id}`);
  if (q.options.length !== 4 || new Set(q.options).size !== 4 || !q.options.includes(q.answer) || q.options.some(option => !String(option).trim())) fail(`Antworten fehlerhaft: ${q.id} ${q.prompt} → ${q.options}`);
  if (!q.id.startsWith('k:') && q.options.some(option => option !== q.answer && (option.includes(q.answer) || q.answer.includes(option)))) fail(`Ablenker überschneidet sich mit der Antwort: ${q.id} → ${q.options}`);
}
const prompts = KNOWLEDGE.map(q => q.prompt);
if (new Set(prompts).size !== prompts.length) fail('Frage doppelt: ' + prompts.filter((p, i) => prompts.indexOf(p) !== i).join(', '));
if (formatYear(2003) !== '2003') fail('formatYear fehlerhaft');

for (const world of Object.keys(WORLDS)) {
  const events = EVENTS.filter(event => event.world === world).length, quiz = KNOWLEDGE.filter(q => q.world === world).length;
  if (events < 10 || quiz < 20) fail(`Themenwelt zu klein: ${world} (${events} Momente, ${quiz} Fragen)`);
  console.log(`${world}: ${events} Momente, ${quiz} Fragen`);
}
console.log(`Gesamt: ${SEASONS.length} Staffeln, ${EVENTS.length} Momente, ${KNOWLEDGE.length} Fragen, ${Object.keys(CLIPS).length} Videos, ${SONGS.length} Songs, ${VISUALS.length} Bildrätsel`);
errors.forEach(message => console.error('FEHLER: ' + message));
process.exit(errors.length ? 1 : 0);
