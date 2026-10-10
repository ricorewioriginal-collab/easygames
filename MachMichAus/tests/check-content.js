// Prüfer für content.js  –  node tests/check-content.js
import * as C from '../content.js';

const errs = [];
const err = m => errs.push(m);
const len = s => [...s].length;
const isStr = s => typeof s === 'string';

function str(s, max, where, min = 1) {
  if (!isStr(s)) { err(`${where}: kein String`); return false; }
  if (len(s) < min) err(`${where}: zu kurz`);
  if (len(s) > max) err(`${where}: ${len(s)} > ${max} Zeichen: "${s}"`);
  if (/[\u0000-\u001f]/.test(s)) err(`${where}: Steuerzeichen`);
  if (s !== s.trim()) err(`${where}: Leerraum am Rand`);
  return true;
}
function count(n, arr, where) {
  if (!Array.isArray(arr) || arr.length !== n) { err(`${where}: erwartet ${n} Einträge, ist ${Array.isArray(arr) ? arr.length : typeof arr}`); return false; }
  return true;
}

// Feste Vorgaben
const { TAGS, STYLES, TAGINFO, STYLEINFO } = C;
if (JSON.stringify(TAGS) !== JSON.stringify(['humor','abenteuer','gemuetlich','sport','musik','essen','tiere','kreativ','ordnung','party','romantik','ehrgeiz'])) err('TAGS abweichend');
if (JSON.stringify(STYLES) !== JSON.stringify(['sportlich','elegant','laessig','schraeg'])) err('STYLES abweichend');
for (const t of TAGS) if (!Array.isArray(TAGINFO[t]) || TAGINFO[t].length !== 2) err(`TAGINFO ${t}`);
for (const s of STYLES) if (!Array.isArray(STYLEINFO[s]) || STYLEINFO[s].length !== 2) err(`STYLEINFO ${s}`);
if (Object.keys(TAGINFO).length !== TAGS.length) err('TAGINFO Anzahl');
if (Object.keys(STYLEINFO).length !== STYLES.length) err('STYLEINFO Anzahl');

const allText = []; // [text, where] für Duplikat- und Wortprüfung
const GEN = ['f', 'm', 'd'];

function tagSet(arr, n, where) {
  if (!count(n, arr, where)) return;
  if (new Set(arr).size !== n) err(`${where}: doppelte Tags`);
  for (const t of arr) if (!TAGS.includes(t)) err(`${where}: unbekannter Tag ${t}`);
}

// CANDIDATES
const names = new Map();
const addName = (n, where) => {
  const k = String(n).toLowerCase();
  if (names.has(k)) err(`${where}: Name "${n}" doppelt (auch ${names.get(k)})`);
  names.set(k, where);
};
const cl = {}, cn = {}, cs = {}, cg = {};
TAGS.forEach(t => { cl[t] = 0; cn[t] = 0; });
STYLES.forEach(s => cs[s] = 0);
GEN.forEach(g => cg[g] = 0);
if (count(18, C.CANDIDATES, 'CANDIDATES')) {
  C.CANDIDATES.forEach((c, i) => {
    const w = `CANDIDATES[${i}] ${c.n}`;
    str(c.n, 9, w + '.n'); addName(c.n, w);
    if (!Number.isInteger(c.age) || c.age < 20 || c.age > 48) err(`${w}: age`);
    str(c.job, 22, w + '.job');
    if (!GEN.includes(c.g)) err(`${w}: g`); else cg[c.g]++;
    if (!STYLES.includes(c.style)) err(`${w}: style`); else cs[c.style]++;
    tagSet(c.likes, 3, w + '.likes'); tagSet(c.nogos, 2, w + '.nogos');
    if (Array.isArray(c.likes) && Array.isArray(c.nogos) && c.likes.some(t => c.nogos.includes(t))) err(`${w}: likes/nogos nicht disjunkt`);
    (c.likes || []).forEach(t => cl[t]++); (c.nogos || []).forEach(t => cn[t]++);
    str(c.motto, 60, w + '.motto'); str(c.quirk, 60, w + '.quirk'); str(c.dream, 60, w + '.dream');
    if (!c.talent) err(`${w}: talent fehlt`);
    else { str(c.talent.t, 28, w + '.talent.t'); str(c.talent.d, 80, w + '.talent.d'); allText.push([c.talent.t, w], [c.talent.d, w]); }
    str(c.intro, 90, w + '.intro');
    allText.push([c.motto, w], [c.quirk, w], [c.dream, w], [c.intro, w]);
  });
  TAGS.forEach(t => { if (cl[t] < 4) err(`CANDIDATES: Tag ${t} nur ${cl[t]}x in likes`); if (cn[t] < 2) err(`CANDIDATES: Tag ${t} nur ${cn[t]}x in nogos`); });
  STYLES.forEach(s => { if (cs[s] < 4 || cs[s] > 5) err(`CANDIDATES: Style ${s} ${cs[s]}x (erwartet 4-5)`); });
  GEN.forEach(g => { if (cg[g] !== 6) err(`CANDIDATES: Geschlecht ${g} ${cg[g]}x (erwartet 6)`); });
}

// PULTE
const pl = {}; TAGS.forEach(t => pl[t] = 0);
const ps = {}; STYLES.forEach(s => ps[s] = 0);
const pg = {}; GEN.forEach(g => pg[g] = 0);
if (count(40, C.PULTE, 'PULTE')) {
  C.PULTE.forEach((p, i) => {
    const w = `PULTE[${i}] ${p.n}`;
    str(p.n, 9, w + '.n'); addName(p.n, w);
    if (!Number.isInteger(p.age) || p.age < 20 || p.age > 50) err(`${w}: age`);
    str(p.job, 18, w + '.job');
    if (!GEN.includes(p.g)) err(`${w}: g`); else pg[p.g]++;
    if (count(2, p.styles, w + '.styles')) {
      if (new Set(p.styles).size !== 2) err(`${w}: styles doppelt`);
      p.styles.forEach(s => { if (!STYLES.includes(s)) err(`${w}: Style ${s}`); else ps[s]++; });
    }
    tagSet(p.likes, 3, w + '.likes'); tagSet(p.nogos, 2, w + '.nogos');
    if (Array.isArray(p.likes) && Array.isArray(p.nogos) && p.likes.some(t => p.nogos.includes(t))) err(`${w}: likes/nogos nicht disjunkt`);
    (p.likes || []).forEach(t => pl[t]++);
    str(p.line, 60, w + '.line'); allText.push([p.line, w]);
  });
  TAGS.forEach(t => { if (pl[t] < 6) err(`PULTE: Tag ${t} nur ${pl[t]}x in likes`); });
  STYLES.forEach(s => { if (ps[s] < 10) err(`PULTE: Style ${s} nur ${ps[s]}x`); });
  GEN.forEach(g => { if (pg[g] < 4) err(`PULTE: Geschlecht ${g} nur ${pg[g]}x`); });
}

// QUIZ
if (count(14, C.QUIZ, 'QUIZ')) {
  C.QUIZ.forEach((q, i) => {
    const w = `QUIZ[${i}]`;
    str(q.q, 70, w + '.q'); allText.push([q.q, w]);
    if (count(3, q.a, w + '.a')) {
      const tags = q.a.map(a => a.tag);
      if (new Set(tags).size !== 3) err(`${w}: Antworten brauchen 3 verschiedene Tags`);
      q.a.forEach((a, j) => {
        str(a.t, 44, `${w}.a[${j}].t`); allText.push([a.t, w]);
        if (!TAGS.includes(a.tag)) err(`${w}.a[${j}]: Tag ${a.tag}`);
      });
    }
  });
}

// VOICE
const VC = { intro: [5, ['a']], look: [4, ['n']], steck: [4, ['n']], talent: [4, ['n']], quiz: [4, ['n']], lightsOff: [5, ['n']], blackout: [4, ['a']], lastLight: [3, ['a']], choose: [4, ['a']], dateIntro: [4, ['a', 'b']], final: [3, []] };
const PH = /\{([^}]*)\}/g;
function checkPh(s, req, allowed, w) {
  const found = [...s.matchAll(PH)].map(m => m[1]);
  for (const f of found) if (!allowed.includes(f)) err(`${w}: Platzhalter {${f}} nicht erlaubt: "${s}"`);
  for (const r of req) if (!found.includes(r)) err(`${w}: Platzhalter {${r}} fehlt: "${s}"`);
  if (/[{}]/.test(s.replace(PH, ''))) err(`${w}: lose Klammer: "${s}"`);
}
if (!C.VOICE || typeof C.VOICE !== 'object') err('VOICE fehlt');
else {
  for (const k of Object.keys(C.VOICE)) if (!VC[k]) err(`VOICE: unbekannter Schlüssel ${k}`);
  for (const [k, [n, req]] of Object.entries(VC)) {
    const arr = C.VOICE[k];
    if (!count(n, arr, `VOICE.${k}`)) continue;
    arr.forEach((s, i) => {
      const w = `VOICE.${k}[${i}]`;
      if (str(s, 110, w)) { checkPh(s, req, k === 'final' ? [] : ['a', 'b', 'n'], w); allText.push([s, w]); }
    });
  }
}

// DATE
if (!C.DATE || typeof C.DATE !== 'object') err('DATE fehlt');
else {
  const keys = ['k0', 'k1', 'k2', 'k3', 'k4'];
  for (const k of Object.keys(C.DATE)) if (!keys.includes(k)) err(`DATE: unbekannter Schlüssel ${k}`);
  for (const k of keys) {
    if (!count(4, C.DATE[k], `DATE.${k}`)) continue;
    C.DATE[k].forEach((s, i) => {
      const w = `DATE.${k}[${i}]`;
      if (str(s, 100, w)) { checkPh(s, ['a', 'b'], ['a', 'b'], w); allText.push([s, w]); }
    });
  }
}

// OFFLINES, STAYS, TIPS
function simple(name, n, max) {
  const arr = C[name];
  if (!count(n, arr, name)) return;
  arr.forEach((s, i) => {
    const w = `${name}[${i}]`;
    if (str(s, max, w)) { if (/[{}]/.test(s)) err(`${w}: Platzhalter unerlaubt`); allText.push([s, w]); }
  });
}
simple('OFFLINES', 18, 60); simple('STAYS', 10, 40); simple('TIPS', 8, 100);

// Duplikate und verbotene Wörter
const seen = new Map();
for (const [s, w] of allText) {
  if (!isStr(s)) continue;
  const k = s.toLowerCase();
  if (seen.has(k)) err(`Doppelte Zeile: "${s}" (${seen.get(k)} und ${w})`); else seen.set(k, w);
}
const FORBIDDEN = [/take\s*me\s*out/i, /herzblatt/i, /bachelor/i];
const dump = JSON.stringify(C);
for (const re of FORBIDDEN) if (re.test(dump)) err(`Verbotenes Wort: ${re}`);
// Steuerzeichen global (auch in Schlüsseln/Emojis-Feldern)
const walk = (v, p) => {
  if (typeof v === 'string') { if (/[\u0000-\u001f]/.test(v)) err(`Steuerzeichen in ${p}`); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`);
};
for (const [k, v] of Object.entries(C)) walk(v, k);

if (errs.length) {
  console.log(errs.join('\n'));
  console.log(`\n${errs.length} Verstöße`);
  process.exit(1);
}
console.log('Inhalte ok');
