import { TRAITS, CAST, ROOMS, TEXT, EVENTS, VOICE, TIPS } from '../content.js';

const errs = [];
const err = (m) => errs.push(m);
const FORBID = /big\s*brother|container|zlatko|sylvia/i;

function checkStr(s, max, allowed, required, where) {
  if (typeof s !== 'string' || !s) return err(`${where}: kein Text`);
  if (s.length > max) err(`${where}: ${s.length} > ${max} Zeichen: ${s}`);
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) < 0x20) { err(`${where}: Steuerzeichen`); break; }
  if (FORBID.test(s)) err(`${where}: verbotenes Wort: ${s}`);
  const found = [...s.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
  for (const f of found) if (!allowed.includes(f)) err(`${where}: Platzhalter {${f}} nicht erlaubt: ${s}`);
  for (const r of required) if (!found.includes(r)) err(`${where}: Pflicht-Platzhalter {${r}} fehlt: ${s}`);
  if (/[{}]/.test(s.replace(/\{[abcrw]\}/g, ''))) err(`${where}: kaputte Klammern: ${s}`);
}
function checkList(arr, count, max, allowed, required, where) {
  if (!Array.isArray(arr) || arr.length !== count) return err(`${where}: Anzahl ${arr && arr.length} != ${count}`);
  const seen = new Set();
  arr.forEach((s, i) => {
    checkStr(s, max, allowed, required, `${where}[${i}]`);
    if (seen.has(s)) err(`${where}: doppelte Zeile: ${s}`);
    seen.add(s);
  });
}

// TRAITS
if (TRAITS.length !== 8 || new Set(TRAITS).size !== 8) err('TRAITS: 8 eindeutige erwartet');

// CAST
if (CAST.length !== 24) err(`CAST: ${CAST.length} != 24`);
const names = new Set(); const tc = Object.fromEntries(TRAITS.map((t) => [t, 0]));
CAST.forEach((c, i) => {
  const w = `CAST[${i}]`;
  if (!c.n || c.n.length > 9) err(`${w}: Name ungültig`);
  if (names.has(c.n)) err(`${w}: doppelter Name ${c.n}`);
  names.add(c.n);
  if (!(c.age >= 18 && c.age <= 55)) err(`${w}: Alter`);
  checkStr(c.job, 24, [], [], `${w}.job`);
  checkStr(c.bio, 70, [], [], `${w}.bio`);
  checkStr(c.n, 9, [], [], `${w}.n`);
  if (!['f', 'm', 'd'].includes(c.g)) err(`${w}: g`);
  if (!Array.isArray(c.traits) || c.traits.length !== 2 || c.traits[0] === c.traits[1] || !c.traits.every((t) => TRAITS.includes(t))) err(`${w}: traits`);
  else c.traits.forEach((t) => tc[t]++);
});
for (const t of TRAITS) if (tc[t] < 4) err(`Eigenschaft ${t} nur ${tc[t]}x`);

// ROOMS
const roomKeys = ['schlaf', 'kueche', 'wohn', 'studio', 'garten', 'beicht'];
if (JSON.stringify(Object.keys(ROOMS)) !== JSON.stringify(roomKeys)) err('ROOMS: Schlüssel');

// TEXT
const pair = ['talk', 'cook', 'alliance', 'tease', 'secret', 'rumor'];
const solo = ['show', 'relax'];
for (const k of [...pair, ...solo]) {
  if (!TEXT[k]) { err(`TEXT.${k} fehlt`); continue; }
  const isPair = pair.includes(k);
  const allowed = isPair ? ['a', 'b', 'r'] : ['a', 'r'];
  const req = isPair ? ['a', 'b'] : ['a', 'r'];
  checkList(TEXT[k].ok, 6, 90, allowed, req, `TEXT.${k}.ok`);
  checkList(TEXT[k].bad, 5, 90, allowed, req, `TEXT.${k}.bad`);
}
if (Object.keys(TEXT).length !== 8) err('TEXT: genau 8 Aktionen erwartet');

// EVENTS
const evReq = { fight: ['a', 'b'], birthday: ['a'], gossip: ['a', 'b'], insomnia: ['a'] };
const evIds = ['party', 'fight', 'birthday', 'blackout', 'rain', 'gift', 'gossip', 'burnt', 'karaoke', 'insomnia'];
for (const id of evIds) checkList(EVENTS[id], 4, 100, ['a', 'b', 'r'], evReq[id] || [], `EVENTS.${id}`);
if (Object.keys(EVENTS).length !== evIds.length) err('EVENTS: unerwartete Anzahl');

// VOICE
const V = [
  ['weekStart', 5, ['w'], ['w']], ['task', 5, [], []], ['taskWin', 4, ['a'], ['a']],
  ['nomIntro', 4, [], []], ['nomResult', 4, ['a', 'b'], ['a', 'b']], ['nomResult3', 4, ['a', 'b', 'c'], ['a', 'b', 'c']],
  ['voteIntro', 4, [], []], ['leave', 6, ['a'], ['a']], ['safe', 3, ['a'], ['a']],
  ['finalIntro', 3, ['a', 'b', 'c'], ['a', 'b', 'c']], ['winner', 5, ['a'], ['a']],
  ['night', 4, [], []], ['morning', 4, [], []], ['welcome', 3, [], []],
];
for (const [k, n, al, rq] of V) checkList(VOICE[k], n, 110, al, rq, `VOICE.${k}`);
if (Object.keys(VOICE).length !== V.length) err('VOICE: unerwartete Anzahl');

// TIPS
checkList(TIPS, 8, 100, [], [], 'TIPS');

if (errs.length) { console.error(errs.join('\n')); console.error(`${errs.length} Fehler`); process.exit(1); }
console.log('Inhalte ok');
