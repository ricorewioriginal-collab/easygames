// Sammelt alle Dialogzeilen ['Name', Text] aus zotik-src/src per Syntaxbaum (auch Ausdrücke mit ?:, + und Vorlagen).
// Aufruf: node extract-ast.cjs ../../zotik-src ausgabe.json   (nutzt rollup aus zotik-src/node_modules)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2]);
const { parseAst } = require(path.join(root, 'node_modules/rollup/dist/parseAst.js'));
const dir = path.join(root, 'src'), out = {};
const NAME = /^[A-ZÄÖÜ?][\wäöüÄÖÜß ?.\-]{0,24}$/;
function ex(n) {
  if (!n) return null;
  if (n.type === 'Literal') return typeof n.value === 'string' ? [n.value] : null;
  if (n.type === 'TemplateLiteral') { let r = ['']; for (let i = 0; i < n.quasis.length; i++) { r = r.map(s => s + n.quasis[i].value.cooked); if (i < n.expressions.length) { const e = ex(n.expressions[i]); if (!e) return null; r = r.flatMap(s => e.map(t => s + t)); } if (r.length > 24) return null; } return r; }
  if (n.type === 'ConditionalExpression') { const a = ex(n.consequent), b = ex(n.alternate); if (a && b) return [...a, ...b]; return a || b; }
  if (n.type === 'BinaryExpression' && n.operator === '+') { const a = ex(n.left), b = ex(n.right); if (!a || !b || a.length * b.length > 24) return null; return a.flatMap(x => b.map(y => x + y)); }
  return null;
}
function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'ArrayExpression' && n.elements.length >= 2 && n.elements[0] && n.elements[0].type === 'Literal' && typeof n.elements[0].value === 'string' && NAME.test(n.elements[0].value)) {
    const t = ex(n.elements[1]);
    if (t) for (const s of t) { const x = s.replace(/\s+/g, ' ').trim(); if (x.length >= 8 && x.includes(' ')) (out[n.elements[0].value] = out[n.elements[0].value] || new Set()).add(x); }
  }
  for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) { try { walk(parseAst(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) { console.error(f, e.message); } }
const vs = fs.readFileSync(path.join(dir, 'main.js'), 'utf8').match(/^const VOX=(\{.*\});$/m);
const r = {}; let n = 0; for (const k in out) { r[k] = [...out[k]]; n += r[k].length; }
fs.writeFileSync(process.argv[3], JSON.stringify({ lines: r, vox: vs ? new Function('return ' + vs[1])() : {} }));
console.log(n, 'Zeilen,', Object.keys(r).length, 'Sprecher');
