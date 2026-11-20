/* Microsoft-Rocketbox-Figuren (MIT, https://github.com/microsoft/Microsoft-Rocketbox) für Pride City aufbereiten.
   Lädt FBX und Texturen, wandelt mit FBX2glTF in glTF, verkleinert die Texturen (Farbe 1024 px JPEG, Normalen 512 px,
   Haare/Wimpern als PNG mit Alpha) und schreibt public/assets/rb/<Figur>.glb sowie Animationen nach public/assets/rb/anim/.
   Nur bei Bedarf ausführen (Ergebnis liegt im Repo): node scripts/rocketbox.mjs  (braucht devDependencies fbx2gltf, @gltf-transform/core, jpeg-js, pngjs) */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { NodeIO } from '@gltf-transform/core';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const require = createRequire(import.meta.url);
const RAW = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/';
const OUT = new URL('../public/assets/rb/', import.meta.url);
const TMP = new URL('../.rb-tmp/', import.meta.url);
const FBX2GLTF = require.resolve('fbx2gltf/bin/' + (process.platform === 'win32' ? 'Windows_NT/FBX2glTF.exe' : process.platform === 'darwin' ? 'Darwin/FBX2glTF' : 'Linux/FBX2glTF'));

/** Figuren: Ordner im Rocketbox-Repo */
export const AVATARS = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => 'Adults/Male_Adult_' + String(n).padStart(2, '0')),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => 'Adults/Female_Adult_' + String(n).padStart(2, '0')),
  'Adults/Female_Party_01', 'Adults/Female_Party_02',
  'Professions/Police_Female_01', 'Professions/Police_Male_01', 'Professions/Fire_Female_01', 'Professions/Fire_Male_01',
  'Professions/Medical_Female_01', 'Professions/Security_Male_01', 'Professions/Chef_Female_01', 'Professions/Sports_Male_01',
  'Professions/Sports_Female_01', 'Professions/Business_Male_01', 'Professions/Delivery_Male_01',
];
/** Animationen: Name im Spiel → Datei (m_/f_ wird vorangestellt), xy = Bewegung herausgerechnet (läuft auf der Stelle) */
export const ANIMS = {
  idle: 'static/idle_neutral_01', walk: 'xy/walk_neutral_01', run: 'xy/run_neutral_01', dance1: 'static/dancing_cool', dance2: 'static/dancing_silly',
  dance3: 'static/dancing_neutral', cheer: 'static/cheer_01', wave: 'static/wave_01', sit: 'static/sit_chair_idle_neutral_01', talk: 'static/gestic_talk_neutral_01',
  clap: 'static/claphands_01', phone: 'static/cell_phone_textmessage', drink: 'static/drink_drinking', laugh: 'static/gestic_laugh_loud',
};

async function get(url, file) {
  if (existsSync(file)) return readFileSync(file);
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ' → ' + r.status);
  const b = Buffer.from(await r.arrayBuffer()); writeFileSync(file, b); return b;
}

/* ---------- TGA lesen (unkomprimiert und RLE, 24/32 Bit) und verkleinern ---------- */
function readTga(b) {
  const idLen = b[0], type = b[2], w = b.readUInt16LE(12), h = b.readUInt16LE(14), bpp = b[16] / 8, top = (b[17] & 0x20) !== 0;
  const px = Buffer.alloc(w * h * 4); let p = 18 + idLen, i = 0;
  const put = (o) => { px[i * 4] = b[o + 2]; px[i * 4 + 1] = b[o + 1]; px[i * 4 + 2] = b[o]; px[i * 4 + 3] = bpp === 4 ? b[o + 3] : 255; i++; };
  if (type === 2) { for (; i < w * h; p += bpp) put(p); }
  else if (type === 10) {
    while (i < w * h) {
      const c = b[p++], n = (c & 127) + 1;
      if (c & 128) { for (let k = 0; k < n; k++) put(p); p += bpp; } else { for (let k = 0; k < n; k++) { put(p); p += bpp; } }
    }
  } else throw new Error('TGA-Typ ' + type);
  if (!top) { const row = w * 4, t = Buffer.alloc(row); for (let y = 0; y < h / 2; y++) { const a = y * row, z = (h - 1 - y) * row; px.copy(t, 0, a, a + row); px.copy(px, a, z, z + row); t.copy(px, z); } }
  return { w, h, px };
}
function shrink(img, size) {
  let { w, h, px } = img;
  while (w > size) {
    const nw = w >> 1, nh = h >> 1, o = Buffer.alloc(nw * nh * 4);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) for (let c = 0; c < 4; c++) {
      const a = ((y * 2) * w + x * 2) * 4 + c, b2 = a + w * 4;
      o[(y * nw + x) * 4 + c] = (px[a] + px[a + 4] + px[b2] + px[b2 + 4] + 2) >> 2;
    }
    w = nw; h = nh; px = o;
  }
  return { w, h, px };
}
const toJpg = (img, q = 82) => jpeg.encode({ width: img.w, height: img.h, data: img.px }, q).data;
const toPng = (img) => { const p = new PNG({ width: img.w, height: img.h }); img.px.copy(p.data); return PNG.sync.write(p); };

async function avatar(path) {
  const name = path.split('/')[1], dir = new URL(name + '/', TMP);
  mkdirSync(dir, { recursive: true });
  const fbx = await get(RAW + 'Avatars/' + path + '/Export/' + name + '.fbx', new URL(name + '.fbx', dir));
  // Texturnamen stehen in der FBX (z. B. m002_body_color.tga)
  const tex = [...new Set(fbx.toString('latin1').match(/[a-z]\d{3}_[a-z]+_(color|normal)\.tga/g) || [])];
  execFileSync(FBX2GLTF, ['--binary', '--input', new URL(name + '.fbx', dir).pathname, '--output', new URL('out', dir).pathname], { stdio: 'pipe' });
  const io = new NodeIO(), doc = await io.read(new URL('out.glb', dir).pathname), root = doc.getRoot();
  const imgs = {};
  for (const t of tex) {
    const raw = readTga(await get(RAW + 'Avatars/' + path + '/Textures/' + t, new URL(t, dir)));
    const key = t.replace('.tga', '');
    imgs[key] = key.includes('opacity') ? { mime: 'image/png', data: toPng(shrink(raw, 512)) }
      : key.endsWith('_normal') ? { mime: 'image/jpeg', data: toJpg(shrink(raw, 512), 88) }
      : { mime: 'image/jpeg', data: toJpg(shrink(raw, 1024)) };
  }
  for (const m of root.listMaterials()) {
    const base = m.getName(); // z. B. m002_body, m002_opacity
    const col = imgs[base + '_color'], nor = imgs[base + '_normal'];
    const setTex = (t, img) => { t.setImage(new Uint8Array(img.data)).setMimeType(img.mime).setURI(''); };
    if (col && m.getBaseColorTexture()) setTex(m.getBaseColorTexture(), col);
    if (nor && m.getNormalTexture()) setTex(m.getNormalTexture(), nor);
    else if (m.getNormalTexture()) m.setNormalTexture(null);
    m.setMetallicFactor(0).setRoughnessFactor(base.includes('head') ? .55 : .8);
    m.setEmissiveTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null);
    if (base.includes('opacity')) { m.setAlphaMode('MASK').setAlphaCutoff(.45).setDoubleSided(true); }
  }
  for (const t of root.listTextures()) if (!t.getImage() || t.getImage().byteLength < 200) t.dispose();
  for (const a of root.listAnimations()) a.dispose();
  writeFileSync(new URL(name + '.glb', OUT), await io.writeBinary(doc));
  if (!process.env.KEEP) rmSync(dir, { recursive: true, force: true }); // Rohdaten (TGA, je Figur ~60 MB) gleich wieder löschen
}

async function anim(g, key, file) {
  const [kind, base] = file.split('/'), name = g + '_' + base;
  const dir = new URL('anim/', TMP); mkdirSync(dir, { recursive: true });
  await get(RAW + 'Animations/all_animations_max_motextr_' + kind + '/' + name + '.max.fbx', new URL(name + '.fbx', dir));
  execFileSync(FBX2GLTF, ['--binary', '--input', new URL(name + '.fbx', dir).pathname, '--output', new URL(name, dir).pathname], { stdio: 'pipe' });
  const io = new NodeIO(), doc = await io.read(new URL(name + '.glb', dir).pathname), root = doc.getRoot();
  for (const m of root.listMeshes()) m.dispose();
  for (const s of root.listSkins()) s.dispose();
  const thin = new Map();
  for (const a of root.listAnimations()) {
    a.setName(key);
    for (const c of a.listChannels()) {
      const n = c.getTargetNode()?.getName() || '', path = c.getTargetPath(), smp = c.getSampler();
      // Fußspuren-Helfer und Skalierung brauchen wir nicht, Verschiebung nur am Becken (Bip01)
      if (/Footsteps/.test(n) || path === 'scale' || (path === 'translation' && n !== 'Bip01')) { smp?.dispose(); c.dispose(); continue; }
      if (!smp) continue;
      const out = smp.getOutput(), inp = smp.getInput(), w = path === 'rotation' ? 4 : 3, cnt = inp.getCount();
      const ov = out.getArray(), iv = inp.getArray();
      // Bewegung auf der Stelle: Becken bleibt über dem Ursprung (nur Federn in der Höhe)
      if (path === 'translation') for (let i = 0; i < cnt; i++) { ov[i * 3] = ov[0]; ov[i * 3 + 2] = ov[2]; }
      // auf 15 Bilder pro Sekunde ausdünnen (spart Ladezeit, Babylon interpoliert dazwischen)
      const keep = []; let last = -1;
      for (let i = 0; i < cnt; i++) if (i === 0 || i === cnt - 1 || iv[i] - last >= 1 / 15 - 1e-4) { keep.push(i); last = iv[i]; }
      if (keep.length < cnt) {
        // Zeitachse teilen sich alle Kanäle: einmal ausgedünnt anlegen und wiederverwenden
        let ni = thin.get(inp);
        if (!ni) { const a = new Float32Array(keep.length); keep.forEach((k, j) => (a[j] = iv[k])); ni = doc.createAccessor().setType('SCALAR').setArray(a).setBuffer(root.listBuffers()[0]); thin.set(inp, ni); }
        const no = new Float32Array(keep.length * w);
        keep.forEach((k, j) => { for (let e = 0; e < w; e++) no[j * w + e] = ov[k * w + e]; });
        smp.setInput(ni); out.setArray(no);
      } else out.setArray(ov);
    }
  }
  for (const n of root.listNodes()) if (n.getMesh()) n.setMesh(null);
  for (const t of root.listTextures()) t.dispose();
  for (const m of root.listMaterials()) m.dispose();
  for (const x of root.listAccessors()) if (!x.listParents().some((q) => q.propertyType !== 'Root')) x.dispose();
  writeFileSync(new URL('anim/' + g + '_' + key + '.glb', OUT), await io.writeBinary(doc));
}

mkdirSync(new URL('anim/', OUT), { recursive: true }); mkdirSync(TMP, { recursive: true });
const only = process.argv[2];
for (const p of AVATARS) if (only !== 'anim' && (!only || p.includes(only)) && (only || !existsSync(new URL(p.split('/')[1] + '.glb', OUT)))) { process.stdout.write(p + ' … '); await avatar(p); console.log('ok'); }
if (!only || only === 'anim') for (const g of ['m', 'f']) for (const [k, f] of Object.entries(ANIMS)) { process.stdout.write(g + '_' + k + ' … '); await anim(g, k, f); console.log('ok'); }
if (!process.env.KEEP) rmSync(TMP, { recursive: true, force: true });
