// Sprechzeilen für „AnMaCha – Der Podcast“ sammeln → anmacha-podcast-tycoon/vo/lines.json (danach vertont der Workflow podcast-voice.yml).
// Quellen: Zwischensequenzen (acts, rico-live, missions, worlds), Story-Dialoge (D.CHAPTERS), Live-Aufnahme (show.js: say(…), D.LINES, D.IDEAS, D.RICO_LINES).
// Aufruf: node tools/podcast-voice/extract.cjs. Zeilen mit eigener Aufnahme ({ src }) fehlen absichtlich; NPCs brabbeln (babble.js).
const fs = require('fs'), path = require('path'), vm = require('vm');
const G = path.join(__dirname, '..', '..', 'anmacha-podcast-tycoon'), src = f => fs.readFileSync(path.join(G, f), 'utf8');
const out = [], seen = new Set(), WHO = { a: 'andrew', m: 'marco', r: 'rico', n: 'n', andrew: 'andrew', marco: 'marco', rico: 'rico', jana: 'jana', fans: 'fans' };
const add = (who, text) => { who = WHO[who]; if (!who || typeof text !== 'string' || !/\p{L}/u.test(text)) return; const k = who + '|' + text; if (!seen.has(k)) { seen.add(k); out.push({ who, text }); } };
const unq = s => s.replace(/\\'/g, "'").replace(/\\"/g, '"');
// 1) Zwischensequenzen
for (const f of ['src/acts.js', 'src/rico-live.js', 'src/missions.js', 'src/worlds.js'])
  for (const m of src(f).matchAll(/\[ ?'(andrew|marco|rico|n|jana|fans)', '((?:[^'\\]|\\.)*)'(\s*,\s*(?:clip\(|\{ ?src))?/g)) if (!m[3]) add(m[1], unq(m[2]));
// 2) Daten (Story-Dialoge, Live-Sprüche)
const ctx = { console, Math, JSON, setTimeout, navigator: { userAgent: '' }, localStorage: { getItem: () => null, setItem() {} }, location: { search: '', href: '' }, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), document: { addEventListener() {}, createElement: () => ({ getContext: () => null, style: {} }), documentElement: {}, querySelector: () => null, getElementById: () => null } };
ctx.window = ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['src/core.js', 'src/data.js']) { try { vm.runInContext(src(f), ctx); } catch (e) { /* core.js braucht den Browser nur teilweise */ } }
const D = ctx.AMC.Data;
(D.CHAPTERS || []).forEach(c => ['intro', 'outro'].forEach(k => (c[k] || []).forEach(l => add(l[0], l[1]))));
(D.IDEAS || []).forEach(([w1, l1, w2, l2]) => { add(w1, l1); add(w2, l2); });
(D.RICO_LINES || []).forEach(t => add('r', t));
Object.values(D.LINES || {}).forEach(a => a.forEach(t => { add('a', t); add('m', t); }));
// 3) Live-Aufnahme: feste Sprüche in say(…) (Sprecher wechselt → beide Stimmen)
for (const m of src('src/show.js').matchAll(/say\(([^;]*?)\)(?:;|\s*$)/gm)) {
  const who = /^'(n|rico)'/.exec(m[1]); for (const s of m[1].matchAll(/'((?:[^'\\]|\\.){6,})'/g)) { const t = unq(s[1]); if (/^(andrew|marco)$/.test(t)) continue; if (who) add(who[1], t); else { add('a', t); add('m', t); } }
}
fs.mkdirSync(path.join(G, 'vo'), { recursive: true });
fs.writeFileSync(path.join(G, 'vo', 'lines.json'), JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'));
const n = {}; out.forEach(l => n[l.who] = (n[l.who] || 0) + 1); console.log(out.length, 'Zeilen', JSON.stringify(n), out.reduce((a, l) => a + l.text.length, 0), 'Zeichen');
