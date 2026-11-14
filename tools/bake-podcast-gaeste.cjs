// Backt die Originalfiguren aus Zotik, Bunte Insel, AERU und TASCHI als GLB für „AnMaCha – Der Podcast“ (Gastfiguren, Requisiten).
// Die Figuren werden NICHT nachgebaut: jede Seite lädt den Figurencode des Originalspiels (zotik-src/src/fox.js, bunte-insel/js,
// aeru/game.js › dragon(), taschi/src/engine/creatures.js) und exportiert das Ergebnis mit dem GLTFExporter von three r128.
// Fell-Schalen, Umrisslinien und Namensschilder fallen weg (Shader-Effekte), Farben werden für die sRGB-Ausgabe des Podcasts umgerechnet.
// Aufruf (einmal, Ergebnis wird eingecheckt):
//   npm i --prefix /tmp/three128 three@0.128.0 && THREE_DIR=/tmp/three128/node_modules/three NODE_PATH=$(npm root -g) node tools/bake-podcast-gaeste.cjs
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'anmacha-podcast-tycoon', 'models', 'gaeste');
const THREE_DIR = process.env.THREE_DIR; if (!THREE_DIR || !fs.existsSync(path.join(THREE_DIR, 'build', 'three.module.js'))) { console.error('THREE_DIR (three@0.128.0) fehlt'); process.exit(1); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.json': 'application/json', '.svg': 'image/svg+xml' };

// Gemeinsamer Teil jeder Seite: Materialien vereinheitlichen und als GLB zurückgeben
const PREP = `
window.__prep = function (T, obj, srgbIn) {
  const conv = c => { if (srgbIn) c.convertSRGBToLinear(); };
  const drop = [];
  obj.traverse(o => {
    if (o.isInstancedMesh || o.isSprite || o.isPoints || o.isLine) { drop.push(o); return; }
    if (!o.isMesh) return;
    const m = o.material; if (Array.isArray(m) || !m) { drop.push(o); return; }
    if (m.side === T.BackSide || m.isShaderMaterial) { drop.push(o); return; }   // Umrisslinien
    const n = new T.MeshStandardMaterial({ color: m.color ? m.color.clone() : new T.Color(0xffffff), roughness: m.roughness != null ? m.roughness : 0.75, metalness: m.metalness || 0,
      vertexColors: !!m.vertexColors, map: m.map || null, transparent: !!m.transparent, opacity: m.opacity != null ? m.opacity : 1, side: m.side, flatShading: !!m.flatShading });
    conv(n.color);
    if (m.emissive && m.emissive.getHex()) { n.emissive = m.emissive.clone(); conv(n.emissive); n.emissiveIntensity = Math.min(2, m.emissiveIntensity || 1); }
    if (srgbIn && o.geometry.attributes.color) { const g = o.geometry.clone(), a = g.attributes.color, c = new T.Color(); for (let i = 0; i < a.count; i++) { c.setRGB(a.getX(i), a.getY(i), a.getZ(i)).convertSRGBToLinear(); a.setXYZ(i, c.r, c.g, c.b); } o.geometry = g; }
    if (o.geometry.attributes.aShell) { const g = o.geometry.clone(); g.deleteAttribute('aShell'); o.geometry = g; }
    o.material = n;
  });
  drop.forEach(o => o.parent && o.parent.remove(o));
  obj.updateMatrixWorld(true);
};
window.__glb = function (exporter, obj) {
  return new Promise((res, rej) => exporter.parse(obj, r => { const u = new Uint8Array(r); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); res(btoa(s)); }, { binary: true, onlyVisible: true }));
};`;

const aeruSrc = () => { // dragon() aus AERU, unverändert ausgeschnitten (Materialien, Geometrien, Drachen-Baukasten)
  const s = fs.readFileSync(path.join(ROOT, 'aeru', 'game.js'), 'utf8'), a = s.indexOf('const linearColor'), b = s.indexOf('const player = dragon()');
  if (a < 0 || b < 0) throw new Error('AERU: dragon() nicht gefunden'); return 'let world = new T.Group();\n' + s.slice(a, b);
};
const zotikSword = () => { // makeSword aus Zotik
  const s = fs.readFileSync(path.join(ROOT, 'zotik-src', 'src', 'main.js'), 'utf8'), a = s.indexOf('function makeSword('), b = s.indexOf('const WPNS=');
  if (a < 0 || b < 0) throw new Error('Zotik: makeSword nicht gefunden'); return s.slice(a, b);
};

const PAGES = {
  // Zotik (Fuchs) + AERU (Drache): ES-Module mit three r128
  'mod.html': () => `<!doctype html><meta charset="utf-8"><script type="importmap">{"imports":{"three":"/__three/build/three.module.js"}}</script>
<script type="module">
import * as T from 'three'; import { GLTFExporter } from '/__three/examples/jsm/exporters/GLTFExporter.js';
import { buildFox } from '/zotik-src/src/fox.js'; import { geoSet } from '/zotik-src/src/gfx.js';
${PREP}
const MC = new Map(); const G = geoSet(false);
function M(color,o){o=o||{};const k=color+'|'+(o.r??.8)+'|'+(o.m??0)+'|'+(o.e??0)+'|'+(o.ei??1)+'|'+(o.t?1:0)+'|'+(o.f?1:0);let m=MC.get(k);
  if(!m){m=new T.MeshStandardMaterial({color,roughness:o.r??.8,metalness:o.m??0,flatShading:!!o.f});if(o.e!==undefined){m.emissive=new T.Color(o.e);m.emissiveIntensity=o.ei??1}if(o.t){m.transparent=true;m.opacity=o.t}MC.set(k,m)}return m}
function mk(g,mat,x,y,z,sx,sy,sz,cast){const m=new T.Mesh(g,mat);m.position.set(x||0,y||0,z||0);m.scale.set(sx??1,sy??sx??1,sz??sx??1);if(cast!==false)m.castShadow=true;return m}
${zotikSword()}
const glow = () => new T.Group(), noop = () => {};
${aeruSrc()}
const ex = new GLTFExporter(), out = {};
{ const P = buildFox({ T, M, glow, makeSword, mergeChar: noop, mergeStatic: noop, TOUCH: true }); __prep(T, P.root, true); out.zotik = await __glb(ex, P.root); }
{ const d = dragon(); __prep(T, d, false); out.aeru = await __glb(ex, d); }
window.__out = out;
</script>`,
  // TASCHI: Module mit globalem three r128 (wie im Spiel)
  'taschi.html': () => `<!doctype html><meta charset="utf-8"><script src="/bunte-insel/vendor/three.min.js"></script><script src="/__three/examples/js/exporters/GLTFExporter.js"></script>
<script type="module">
import { createCreature } from '/taschi/src/engine/creatures.js';
${PREP}
const T = THREE, ex = new T.GLTFExporter(), out = {};
for (const id of ['glutzahn', 'blitzi']) { const c = createCreature(id, { outline: false }), r = c.root || c.group || c; __prep(T, r, true); out['taschi-' + id] = await __glb(ex, r); }
window.__out = out;
</script>`
};

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.startsWith('/__bake/')) { const k = p.slice(8); if (!PAGES[k]) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGES[k]()); }
  const f = p.startsWith('/__three/') ? path.join(THREE_DIR, p.slice(9)) : path.join(ROOT, p.replace(/\/$/, '/index.html'));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
server.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const all = {};
  try {
    for (const k of Object.keys(PAGES)) {
      const p = await browser.newPage(); p.on('pageerror', e => console.error(k, e.message)); p.on('console', m => m.type() === 'error' && console.error(k, m.text()));
      await p.goto(base + '/__bake/' + k); await p.waitForFunction(() => window.__out, null, { timeout: 60000 }); Object.assign(all, await p.evaluate(() => window.__out)); await p.close();
    }
    // Bunte Insel: Figurencode des Spiels (BI.makeChar / makeDog / makePappnase) direkt in der Spielseite
    { const p = await browser.newPage(); await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
      await p.goto(base + '/bunte-insel/index.html'); await p.waitForFunction(() => window.BI && BI.makeChar && BI.makeDog && BI.makePappnase && window.THREE, null, { timeout: 120000 });
      await p.addScriptTag({ url: '/__three/examples/js/exporters/GLTFExporter.js' }); await p.addScriptTag({ content: PREP });
      Object.assign(all, await p.evaluate(async () => {
        const T = THREE, ex = new T.GLTFExporter(), o = {}, g = r => r.group || r.root || r;
        const j = g(BI.makeChar({ preset: 'jannis' })); __prep(T, j, true); o.jannis = await __glb(ex, j);
        const d = g(BI.makeDog({ noName: true })); __prep(T, d, true); o.blitz = await __glb(ex, d);
        const b = g(BI.makePappnase()); __prep(T, b, true); o.pappnase = await __glb(ex, b);
        return o;
      })); await p.close(); }
    fs.mkdirSync(OUT, { recursive: true });
    for (const [k, b64] of Object.entries(all)) { const buf = Buffer.from(b64, 'base64'); fs.writeFileSync(path.join(OUT, k + '.glb'), buf); console.log(k + '.glb', Math.round(buf.length / 1024) + ' KB'); }
  } finally { await browser.close(); server.close(); }
});
