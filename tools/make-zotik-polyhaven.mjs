/* Bereitet Bäume, Büsche, Felsen und Pflanzen von Poly Haven (polyhaven.com, CC0) für Zotik auf → zotik-src/public/models/ph/ph.glb (+ ph-hi.glb mit größeren Texturen).
   Die Originale haben Millionen Dreiecke (jedes Blatt einzeln). Daraus entsteht je Baum:
     - Stamm als echtes Netz, stark vereinfacht (meshoptimizer), mit Originalrinde
     - Krone als „Astkarten“: die Blätter und Zweige werden in Gruppen geteilt (k-means), jede Gruppe wird im Browser (three.js, tools/zotik-polyhaven-bake.html)
       aus zwei Richtungen in einen Texturatlas gezeichnet und als Fläche an ihre Stelle gesetzt – so sieht der Baum aus wie das Original, braucht aber nur wenige hundert Dreiecke
     - Fernansicht: der ganze Baum aus zwei Richtungen im gemeinsamen Atlas `far_atlas` (Ausschnitt und Maße in den extras des Knotens), im Spiel zwei gekreuzte Flächen
   Aufruf: GT=/pfad/node_modules (gltf-transform core/extensions/functions, meshoptimizer, sharp)  SRC=/pfad/mit/polyhaven-downloads (je Asset ein Ordner mit <asset>.gltf, .bin, textures/)
           NODE_PATH=$(npm root -g) node tools/make-zotik-polyhaven.mjs [name …]      (Playwright mit Chromium nötig; ohne Namen: alles) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import http from 'http';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js')), greq = createRequire(path.join(process.env.NODE_PATH || '/usr/lib/node_modules', 'x.js'));
const { NodeIO, Document } = req('@gltf-transform/core');
const { ALL_EXTENSIONS, EXTTextureWebP } = req('@gltf-transform/extensions');
const { weldPrimitive, simplifyPrimitive, prune, dedup, quantize } = req('@gltf-transform/functions');
const { MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
const { chromium } = greq('playwright');
const HERE = path.dirname(new URL(import.meta.url).pathname), SRC = process.env.SRC, OUT = path.resolve(HERE, '../zotik-src/public/models/ph'), CACHE = process.env.CACHE || path.join(SRC, '.cache');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });
/* n: Name im Spiel · a: Poly-Haven-Asset · t: tree (Stamm + Astkarten) | mesh (vereinfachtes Netz) · node: Teilmodell (RegExp auf den Knotennamen)
   leaf/trunk: RegExp auf Materialnamen · K: Zahl der Blattgruppen · tt: Dreiecke Stamm/Netz · at: Atlasgröße (hi) · tx: Texturgröße Netz */
const ASSETS = [
  { n: 'laub1', a: 'island_tree_02', t: 'tree', leaf: 'leaves|branches', trunk: 'island_tree_02$', K: 40, tt: 600 },
  { n: 'laub2', a: 'island_tree_01', t: 'tree', leaf: 'leaves|branches', trunk: 'island_tree_01$', K: 40, tt: 600 },
  { n: 'laub3', a: 'island_tree_03', t: 'tree', leaf: 'leaves|branches', trunk: 'island_tree_03$', K: 40, tt: 600, at: 1024 },
  { n: 'laub4', a: 'jacaranda_tree', t: 'tree', leaf: 'leaves|branches', trunk: 'trunk', K: 44, tt: 700 },
  { n: 'laub5', a: 'tree_small_02', t: 'tree', leaf: 'leaves|branches', trunk: 'trunk', K: 32, tt: 450, at: 1024 },
  { n: 'tanne1', a: 'fir_sapling_medium', node: 'medium_a_', t: 'tree', leaf: 'twigs', trunk: 'branches', K: 36, tt: 400 },
  { n: 'tanne2', a: 'fir_sapling_medium', node: 'medium_b_', t: 'tree', leaf: 'twigs', trunk: 'branches', K: 30, tt: 320, at: 1024 },
  { n: 'kiefer1', a: 'pine_sapling_small', node: 'small_a', t: 'tree', leaf: 'twig', trunk: 'bark', K: 26, tt: 220, at: 1024 },
  { n: 'koecher1', a: 'quiver_tree_01', t: 'tree', leaf: 'leaf', trunk: 'trunk', K: 16, tt: 900, at: 1024 },
  { n: 'koecher2', a: 'quiver_tree_02', t: 'mesh', tt: 1200, tx: 1024 },
  { n: 'strauchbaum', a: 'searsia_lucida', node: 'lucida_a_', t: 'tree', leaf: 'leaves|twigs', trunk: 'searsia_lucida$', K: 28, tt: 700, at: 1024 },
  { n: 'totbaum1', a: 'dead_tree_trunk', t: 'mesh', tt: 600, tx: 1024 },
  { n: 'totbaum2', a: 'dead_tree_trunk_02', t: 'mesh', tt: 600, tx: 1024 },
  { n: 'kahl1', a: 'jacaranda_tree', t: 'mesh', mat: 'trunk', tt: 1000, tx: 512, sink: .01 },
  { n: 'kahl2', a: 'island_tree_01', t: 'mesh', mat: 'island_tree_01$', tt: 900, tx: 512, sink: .01 },
  { n: 'totbaum3', a: 'dead_quiver_trunk', t: 'mesh', tt: 600, tx: 512 },
  { n: 'busch1', a: 'shrub_01', t: 'tree', leaf: '.', K: 12, at: 1024 },
  { n: 'busch2', a: 'shrub_04', t: 'tree', leaf: '.', K: 10, at: 1024 },
  { n: 'busch3', a: 'wild_rooibos_bush', node: 'bush_a', t: 'tree', leaf: '.', K: 10, at: 1024 },
  { n: 'busch4', a: 'shrub_02', node: 'shrub_02_c', t: 'tree', leaf: '.', K: 8, at: 1024 },
  { n: 'kraut1', a: 'shrub_03', node: 'shrub_03_a', t: 'tree', leaf: '.', K: 5, at: 1024 },
  { n: 'farn1', a: 'fern_02', node: 'fern_02_b', t: 'tree', leaf: '.', K: 6, at: 1024 },
  { n: 'nessel', a: 'nettle_plant', node: 'tall_b', t: 'tree', leaf: '.', K: 5, at: 1024 },
  { n: 'gras1', a: 'grass_medium_01', node: 'large_a', t: 'tree', leaf: '.', K: 5, at: 1024 },
  { n: 'gras2', a: 'grass_medium_01', node: 'mid_a', t: 'tree', leaf: '.', K: 4, at: 512 },
  { n: 'blume1', a: 'flower_gazania', node: 'gazania_h', t: 'tree', leaf: '.', K: 4, at: 512 },
  { n: 'blume2', a: 'periwinkle_plant', node: 'plant_01', t: 'tree', leaf: '.', K: 5, at: 512 },
  { n: 'blume3', a: 'dandelion_01', node: '01_a_', t: 'tree', leaf: '.', K: 4, at: 512 },
  { n: 'tropen1', a: 'pachira_aquatica_01', node: '_d$', t: 'tree', leaf: 'leaves', trunk: 'bark', K: 10, tt: 260, at: 1024 },
  { n: 'tropen2', a: 'calathea_orbifolia_01', node: '_a$', t: 'tree', leaf: '.', K: 6, at: 1024 },
  { n: 'stumpf1', a: 'tree_stump_01', t: 'mesh', tt: 300, tx: 512 },
  { n: 'stumpf2', a: 'tree_stump_02', t: 'mesh', tt: 300, tx: 512 },
  { n: 'fels1', a: 'boulder_01', t: 'mesh', tt: 420, tx: 1024 },
  { n: 'fels2', a: 'rock_07', t: 'mesh', tt: 260, tx: 512 },
  { n: 'fels3', a: 'rock_09', t: 'mesh', tt: 260, tx: 512 },
  { n: 'fels4', a: 'stone_01', t: 'mesh', tt: 300, tx: 512 },
  { n: 'moosfels1', a: 'rock_moss_set_01', node: 'rock05', t: 'mesh', tt: 340, tx: 1024 },
  { n: 'moosfels2', a: 'rock_moss_set_01', node: 'rock01', t: 'mesh', tt: 300, tx: 1024 },
  { n: 'moosfels3', a: 'rock_moss_set_02', node: 'rock07', t: 'mesh', tt: 300, tx: 1024 },
  { n: 'moosfels4', a: 'rock_moss_set_02', node: 'rock10', t: 'mesh', tt: 260, tx: 1024 },
  { n: 'wuestenfels1', a: 'namaqualand_boulder_02', t: 'mesh', tt: 400, tx: 1024 },
  { n: 'wuestenfels2', a: 'namaqualand_boulders_01', node: 'rocks_01_b', t: 'mesh', tt: 480, tx: 1024 },
  { n: 'mondfels1', a: 'moon_rock_01', t: 'mesh', tt: 300, tx: 512 },
  { n: 'mondfels2', a: 'moon_rock_03', t: 'mesh', tt: 300, tx: 512 },
  { n: 'felswand', a: 'rock_face_01', t: 'mesh', tt: 700, tx: 1024 },
  /* Requisiten: ersetzen im Spiel die Spielzeug-Fässer und -Kisten (nat.js swapProps) */
  { n: 'fass', a: 'wine_barrel_01', t: 'mesh', tt: 1300, tx: 512 },
  { n: 'kiste', a: 'wooden_crate_02', t: 'mesh', tt: 900, tx: 512 }
];
const only = process.argv.slice(2), LIST = ASSETS.filter(q => !only.length || only.includes(n => n === q.n) || only.includes(q.n));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;
/* kleiner Webserver für die Zeichenseite: /bake.html, /three/…, /dl/… */
const MIME = { html: 'text/html', js: 'text/javascript', gltf: 'model/gltf+json', bin: 'application/octet-stream', jpg: 'image/jpeg', png: 'image/png' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = u === '/bake.html' ? path.join(HERE, 'zotik-polyhaven-bake.html') : u.startsWith('/three/') ? path.join(HERE, '../zotik-src/node_modules/three', u.slice(7)) : u.startsWith('/dl/') ? path.join(SRC, u.slice(4)) : null;
  if (!f || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const PORT = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=12000'] });
async function bake(q) { const cf = path.join(CACHE, q.n + '.json'); if (fs.existsSync(cf) && !process.env.REBAKE) return JSON.parse(fs.readFileSync(cf));
  const p = await browser.newPage(); p.on('pageerror', e => console.log('  Seite:', e.message)); await p.goto(`http://localhost:${PORT}/bake.html`); await p.waitForFunction(() => window.ready);
  const r = await p.evaluate(c => bake(c), { url: `/dl/${q.a}/${q.a}.gltf`, leaf: q.leaf, trunk: q.trunk, lod: q.node, K: q.K, atlas: q.at || 2048, ss: 2, one: q.one }); await p.close();
  fs.writeFileSync(path.join(CACHE, q.n + '-atlas.png'), Buffer.from(r.atlas.split(',')[1], 'base64')); fs.writeFileSync(path.join(CACHE, q.n + '-far.png'), Buffer.from(r.impAtlas.split(',')[1], 'base64')); delete r.atlas; delete r.impAtlas; fs.writeFileSync(cf, JSON.stringify(r)); return r; }
/* Farbe in durchsichtige Ränder ziehen (sonst dunkle Säume) und als WebP speichern */
async function alphaTex(file, size, h, ql = 76, raw = false) { const { data, info } = await sharp(file).resize(size, h || size, { kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true }), W = info.width, H = info.height;
  let fill = new Uint8Array(W * H), lum = 0, ln = 0; for (let i = 0; i < W * H; i++) { if (data[i * 4 + 3] > 24) fill[i] = 1; if (data[i * 4 + 3] > 128) { lum += .3 * data[i * 4] + .59 * data[i * 4 + 1] + .11 * data[i * 4 + 2]; ln++; } }
  /* sehr dunkles Laub (Nadeln, Jacaranda) aufhellen, damit alle Arten im Spiel ähnlich hell wirken */
  { const f = Math.min(2.4, Math.max(1, 92 / (lum / Math.max(1, ln)))); if (f > 1.05) for (let i = 0; i < W * H * 4; i++) if ((i & 3) !== 3) data[i] = Math.min(255, data[i] * f); }
  for (let pass = 0; pass < 8; pass++) { const nf = fill.slice(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (fill[i]) continue; let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (fill[j]) { r += data[j * 4]; g += data[j * 4 + 1]; b += data[j * 4 + 2]; n++; } }
      if (n) { data[i * 4] = r / n; data[i * 4 + 1] = g / n; data[i * 4 + 2] = b / n; data[i * 4 + 3] = Math.max(1, data[i * 4 + 3]); nf[i] = 1; } } fill = nf; }
  if (raw) return { data: Buffer.from(data.buffer, data.byteOffset, data.length), W, H };
  return new Uint8Array(await sharp(Buffer.from(data.buffer, data.byteOffset, data.length), { raw: { width: W, height: H, channels: 4 } }).webp({ quality: ql, alphaQuality: 85, effort: 6 }).toBuffer()); }
const webp = async (buf, size, ql = 76) => new Uint8Array(await sharp(Buffer.from(buf)).resize(size, size).webp({ quality: ql, effort: 6 }).toBuffer());
const mul = (m, v, w) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * w, m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * w, m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * w];
/* Netzteile aus der Quelle holen, zusammenlegen (Weltkoordinaten) und vereinfachen */
async function meshParts(q, matRe, target) { const d = await io.read(path.join(SRC, q.a, q.a + '.gltf')), nre = q.node ? new RegExp(q.node, 'i') : null, out = []; let total = 0; const parts = [];
  const nodes = d.getRoot().listNodes().filter(n => n.getMesh()); let hasLod = nodes.some(n => /LOD0/.test(n.getName() + (n.getParentNode() ? n.getParentNode().getName() : '')));
  for (const n of nodes) { let nm = n.getName(), pp = n.getParentNode(); while (pp) { nm = pp.getName() + '/' + nm; pp = pp.getParentNode(); } nm = 'Scene/' + nm; if (nre && !nre.test(nm)) continue; if (hasLod && !/LOD0/.test(nm)) continue;
    for (const pr of n.getMesh().listPrimitives()) { const mat = pr.getMaterial(); if (matRe && !matRe.test(mat.getName())) continue; parts.push({ n, pr, mat }); total += (pr.getIndices() ? pr.getIndices().getCount() : pr.getAttribute('POSITION').getCount()) / 3; } if (q.first && parts.length) break; }
  for (const { n, pr, mat } of parts) { const nt = (pr.getIndices() ? pr.getIndices().getCount() : pr.getAttribute('POSITION').getCount()) / 3, want = Math.max(40, target * nt / total);
    for (const s of pr.listSemantics()) if (!['POSITION', 'NORMAL', 'TEXCOORD_0'].includes(s)) pr.setAttribute(s, null);
    weldPrimitive(pr, {}); let ratio = Math.min(1, want / nt); if (ratio < 1) simplifyPrimitive(pr, { simplifier: MeshoptSimplifier, ratio, error: q.err || .6, lockBorder: false });
    const M = n.getWorldMatrix(), P = pr.getAttribute('POSITION'), N = pr.getAttribute('NORMAL'), U = pr.getAttribute('TEXCOORD_0'), I = pr.getIndices(), c = P.getCount(), pos = new Float32Array(c * 3), nor = new Float32Array(c * 3), uv = new Float32Array(c * 2), a = [];
    for (let i = 0; i < c; i++) { pos.set(mul(M, P.getElement(i, a), 1), i * 3); const nn = mul(M, N.getElement(i, a), 0), l = Math.hypot(...nn) || 1; nor.set(nn.map(v => v / l), i * 3); if (U) uv.set(U.getElement(i, []), i * 2); }
    const bt = mat.getBaseColorTexture(), nt2 = mat.getNormalTexture();
    /* Netze aus vielen losen Teilen oder mit vielen Nähten bleiben beim ersten Durchgang hängen: dann ohne Rücksicht auf den Zusammenhang weiter vereinfachen */
    let idx = new Uint32Array(I.getArray()); const tgt = Math.ceil(want) * 3;
    if (idx.length > tgt * 1.4) { const r = MeshoptSimplifier.simplifySloppy(idx, pos, 3, null, tgt, 1); if (r[0].length) idx = r[0]; }
    out.push({ pos, nor, uv, idx, name: mat.getName(), diff: bt && bt.getImage(), norm: nt2 && nt2.getImage(), alpha: mat.getAlphaMode() !== 'OPAQUE', rough: mat.getRoughnessFactor() }); }
  for (const g of out) { const map = new Int32Array(g.pos.length / 3).fill(-1); let n = 0; for (const i of g.idx) if (map[i] < 0) map[i] = n++; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    map.forEach((j, i) => { if (j < 0) return; P.set(g.pos.subarray(i * 3, i * 3 + 3), j * 3); N.set(g.nor.subarray(i * 3, i * 3 + 3), j * 3); U.set(g.uv.subarray(i * 2, i * 2 + 2), j * 2); }); g.pos = P; g.nor = N; g.uv = U; g.idx = g.idx.map(i => map[i]); }
  return out; }
for (const hi of [0, 1]) {
  const doc = new Document(); doc.createBuffer(); doc.createExtension(EXTTextureWebP).setRequired(true); const scene = doc.createScene('ph'), report = [], fars = [];
  const acc = (arr, type) => doc.createAccessor().setArray(arr).setType(type);
  for (const q of LIST) { const t0 = Date.now(), root = doc.createNode('p_' + q.n); scene.addChild(root); let tris = 0, off = [0, 0, 0];
    const addMesh = (parent, name, g, mat) => { const pr = doc.createPrimitive().setAttribute('POSITION', acc(g.pos, 'VEC3')).setAttribute('NORMAL', acc(g.nor, 'VEC3')).setAttribute('TEXCOORD_0', acc(g.uv, 'VEC2')).setIndices(acc(g.idx, 'SCALAR')).setMaterial(mat); if (g.col) pr.setAttribute('COLOR_0', acc(g.col, 'VEC3'));
      parent.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(pr))); tris += g.idx.length / 3; };
    const solid = async (parts, tx) => { for (const [i, g] of parts.entries()) { const m = doc.createMaterial(q.n + '_' + i).setRoughnessFactor(.9).setMetallicFactor(0); const sz = hi ? tx : Math.max(256, tx / 2);
        if (g.diff) m.setBaseColorTexture(doc.createTexture(q.n + '_d' + i).setMimeType('image/webp').setImage(g.alpha ? new Uint8Array(await sharp(Buffer.from(g.diff)).resize(sz, sz).webp({ quality: 82 }).toBuffer()) : await webp(g.diff, sz)));
        if (g.norm && !g.alpha) m.setNormalTexture(doc.createTexture(q.n + '_n' + i).setMimeType('image/webp').setImage(await webp(g.norm, Math.max(256, sz / 2), 78)));
        if (g.alpha) m.setAlphaMode('MASK').setAlphaCutoff(.4).setDoubleSided(true);
        for (let k = 0; k < g.pos.length; k += 3) { g.pos[k] -= off[0]; g.pos[k + 1] -= off[1]; g.pos[k + 2] -= off[2]; } addMesh(root, q.n + '_m' + i, g, m); } };
    /* Fußpunkt: Mitte der untersten Schicht */
    const foot = parts => { let y0 = 1e9, y1 = -1e9; for (const g of parts) for (let k = 1; k < g.pos.length; k += 3) { y0 = Math.min(y0, g.pos[k]); y1 = Math.max(y1, g.pos[k]); } let sx = 0, sz = 0, n = 0; const lim = y0 + (y1 - y0) * .06;
      for (const g of parts) for (let k = 0; k < g.pos.length; k += 3) if (g.pos[k + 1] <= lim) { sx += g.pos[k]; sz += g.pos[k + 2]; n++; } return [sx / n, y0, sz / n]; };
    if (q.t === 'mesh') { const parts = await meshParts(q, q.mat ? new RegExp(q.mat, 'i') : null, q.tt); off = foot(parts); { let y1 = -1e9; for (const g of parts) for (let k = 1; k < g.pos.length; k += 3) y1 = Math.max(y1, g.pos[k]); off[1] += (y1 - off[1]) * (q.sink ?? .04); } await solid(parts, q.tx || 512); }
    else { const B = await bake(q); let parts = [];
      if (q.trunk) { parts = await meshParts(q, new RegExp(q.trunk, 'i'), q.tt); off = foot(parts); off[1] += (B.box[1][1] - B.box[0][1]) * (q.sink ?? .035); } else off = [(B.box[0][0] + B.box[1][0]) / 2, B.box[0][1], (B.box[0][2] + B.box[1][2]) / 2];
      await solid(parts, 512);
      const asz = hi ? (q.at || 2048) : q.K >= 26 ? 1024 : (q.at || 2048) / 2, tex = doc.createTexture(q.n + '_a').setMimeType('image/webp').setImage(await alphaTex(path.join(CACHE, q.n + '-atlas.png'), asz, 0, asz >= 2048 ? 62 : 76));
      const lm = doc.createMaterial(q.n + '_laub').setBaseColorTexture(tex).setAlphaMode('MASK').setAlphaCutoff(.35).setDoubleSided(true).setRoughnessFactor(.85).setMetallicFactor(0);
      /* Kronenmitte für weiche Normalen */
      let cc = [0, 0, 0], wn = 0; for (const c of B.cards) { for (let k = 0; k < 3; k++) cc[k] += c.c[k] * c.n; wn += c.n; } cc = cc.map(v => v / wn); let rad = 0; for (const c of B.cards) rad = Math.max(rad, Math.hypot(c.c[0] - cc[0], c.c[1] - cc[1], c.c[2] - cc[2]) + Math.max(c.W, c.H));
      const n = B.cards.length, g = { pos: new Float32Array(n * 12), nor: new Float32Array(n * 12), uv: new Float32Array(n * 8), col: new Float32Array(n * 12), idx: new Uint32Array(n * 6) };
      B.cards.forEach((c, i) => { [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], j) => { const p = [0, 1, 2].map(k => c.c[k] + c.u[k] * c.W * a + c.v[k] * c.H * b), d = [p[0] - cc[0], p[1] - cc[1] + rad * .35, p[2] - cc[2]], l = Math.hypot(...d) || 1, o = (i * 4 + j) * 3;
          g.pos.set([p[0] - off[0], p[1] - off[1], p[2] - off[2]], o); g.nor.set(d.map(v => v / l), o); const dc = Math.hypot(c.c[0] - cc[0], c.c[1] - cc[1], c.c[2] - cc[2]) / rad, sh = Math.min(1, .62 + .5 * dc + .12 * Math.max(-1, Math.min(1, (p[1] - cc[1]) / rad))); g.col.set([sh, sh, sh], o);
          g.uv.set([a < 0 ? c.uv[0] : c.uv[2], b < 0 ? c.uv[1] : c.uv[3]], (i * 4 + j) * 2); }); g.idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6); });
      addMesh(root, q.n + '_krone', g, lm);
      /* Fernansicht: Bild kommt in einen gemeinsamen Atlas aller Bäume (ein Zeichenaufruf für den ganzen Wald), Maße stehen am Knoten */
      if (!q.nofar && q.K >= 14) { const I = B.imp; fars.push({ n: q.n, root, file: path.join(CACHE, q.n + '-far.png'), ax: [I.ax[0] - off[0], I.ax[1] - off[2]], cy: I.cy - off[1], hs: I.hs }); } }
    report.push(`${q.n} (${q.a}): ${tris} Dreiecke`); if (!hi) console.log(' ', report[report.length - 1], ((Date.now() - t0) / 1000).toFixed(0) + ' s'); }
  { const TS = 256, cols = 4, rows = Math.ceil(fars.length / cols), AW = cols * TS * 2, AH = 2 ** Math.ceil(Math.log2(rows * TS)), comp = [];
    for (const [i, f] of fars.entries()) { const r = await alphaTex(f.file, TS * 2, TS, 76, true), x = (i % cols) * TS * 2, y = Math.floor(i / cols) * TS; comp.push({ input: r.data, raw: { width: r.W, height: r.H, channels: 4 }, left: x, top: y });
      f.root.setExtras({ far: { uv: [x / AW, y / AH, TS * 2 / AW, TS / AH], ax: f.ax, cy: f.cy, hs: f.hs } }); }
    const img = new Uint8Array(await sharp({ create: { width: AW, height: AH, channels: 4, background: { r: 60, g: 80, b: 40, alpha: 0 } } }).composite(comp).webp({ quality: 78, alphaQuality: 85, effort: 6 }).toBuffer());
    const fm = doc.createMaterial('fern').setBaseColorTexture(doc.createTexture('fern').setMimeType('image/webp').setImage(img)).setAlphaMode('MASK').setAlphaCutoff(.4).setDoubleSided(true).setRoughnessFactor(.9).setMetallicFactor(0);
    const pr = doc.createPrimitive().setAttribute('POSITION', acc(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 'VEC3')).setAttribute('NORMAL', acc(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]), 'VEC3')).setAttribute('TEXCOORD_0', acc(new Float32Array([0, 0, 1, 0, 0, 1]), 'VEC2')).setIndices(acc(new Uint32Array([0, 1, 2]), 'SCALAR')).setMaterial(fm);
    scene.addChild(doc.createNode('far_atlas').setMesh(doc.createMesh('far_atlas').addPrimitive(pr))); }
  await doc.transform(dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeTexcoord: 12, quantizeColor: 8 }));
  const f = path.join(OUT, hi ? 'ph-hi.glb' : 'ph.glb'); await io.write(f, doc); console.log(path.basename(f), (fs.statSync(f).size / 1048576).toFixed(2) + ' MB');
}
await browser.close(); srv.close();
