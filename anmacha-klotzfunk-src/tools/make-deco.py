#!/usr/bin/env python3
"""KayKit-Deko für KlotzFunk aufbereiten (Kay Lousberg, CC0, www.kaylousberg.com).

Liest ausgewählte Modelle aus den KayKit-Paketen im Repo (Furniture Bits, City Builder Bits, Dungeon),
skaliert sie auf Blockmaß, quantisiert sie (Position/UV 16 Bit, Normale 8 Bit) und schreibt:
  public/kaykit/deco.bin   alle Modelle hintereinander
  public/kaykit/deco.json  Liste: Name, Anzahl Ecken/Dreiecke, Versatz, Größe
  public/kaykit/deco.png   ein Textur-Atlas (drei 256er-Paletten untereinander)
Aufruf im Ordner anmacha-klotzfunk-src: python3 tools/make-deco.py
Die Reihenfolge der Modelle muss zu DECO in src/blocks.js passen (Test prüft das)."""
import json, struct, os, shutil
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
PT = os.path.join(ROOT, 'anmacha-podcast-tycoon', 'models', 'kaykit')
QD = os.path.join(ROOT, 'anmacha-quest-rpg', 'models', 'kkd')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'kaykit')
TEX = [('furniture', os.path.join(PT, 'furniture.png')), ('citybits', os.path.join(PT, 'city.png')), ('dungeon', os.path.join(QD, 'dungeon_texture.png'))]
S = 256  # Kantenlänge je Palette im Atlas

# Name, Datei, Größe: ('h', Höhe in Blöcken) oder ('w', größte Breite in Blöcken)
MODELS = [
  ('chair', PT + '/kf_chair_a_wood.glb', ('h', 0.95)), ('armchair', PT + '/kf_armchair.glb', ('w', 0.98)), ('stool', PT + '/kf_chair_stool.glb', ('w', 0.6)),
  ('couch', PT + '/kf_couch_pillows.glb', ('w', 1.9)), ('table', PT + '/kf_table_small.glb', ('h', 0.8)), ('tablelong', PT + '/kf_table_medium_long.glb', ('w', 1.9)),
  ('bed', PT + '/kf_bed_single_a.glb', ('w', 1.95)), ('cabinet', PT + '/kf_cabinet_small.glb', ('h', 0.9)), ('shelf', PT + '/kf_shelf_b_large_decorated.glb', ('w', 1.9)),
  ('lamp', PT + '/kf_lamp_standing.glb', ('h', 1.7)), ('tablelamp', PT + '/kf_lamp_table.glb', ('h', 0.5)), ('books', PT + '/kf_book_set.glb', ('w', 0.6)),
  ('picture', PT + '/kf_pictureframe_medium.glb', ('w', 0.8)), ('rug', PT + '/kf_rug_rectangle_stripes_a.glb', ('w', 1.9)),
  ('bench', PT + '/kk_bench.glb', ('w', 1.9)), ('streetlight', PT + '/kk_streetlight.glb', ('h', 3.2)), ('trafficlight', PT + '/kk_trafficlight_a.glb', ('h', 3.0)),
  ('hydrant', PT + '/kk_firehydrant.glb', ('h', 0.8)), ('trash', PT + '/kk_dumpster.glb', ('w', 1.0)), ('bush', PT + '/kk_bush.glb', ('h', 1.2)),
  ('barrel', QD + '/barrel_large.gltf', ('h', 1.0)), ('chest', QD + '/chest.gltf', ('w', 0.95)), ('keg', QD + '/keg.gltf', ('w', 0.95)),
  ('candles', QD + '/candle_triple.gltf', ('h', 0.45)), ('torch', QD + '/torch_mounted.gltf', ('h', 0.8)), ('banner', QD + '/banner_patternA_red.gltf', ('h', 1.9)),
  ('crates', QD + '/crates_stacked.gltf', ('w', 1.0)),
]
TYPES = {5126: ('f', 4), 5123: ('H', 2), 5125: ('I', 4), 5121: ('B', 1)}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}

def load(path):
    if path.endswith('.glb'):
        b = open(path, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]
        j = json.loads(b[20:20 + n]); bin_ = b[20 + n + 8:]
    else:
        j = json.load(open(path)); bin_ = open(os.path.join(os.path.dirname(path), j['buffers'][0]['uri']), 'rb').read()
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; f, sz = TYPES[a['componentType']]; nc = NCOMP[a['type']]
        off = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride', sz * nc)
        return [struct.unpack_from('<' + f * nc, bin_, off + k * stride) for k in range(a['count'])]
    P, N, U, I = [], [], [], []
    for node in j['nodes']:
        if 'mesh' not in node: continue
        assert not node.get('rotation') or node['rotation'] == [0, 0, 0, 1], path
        t = node.get('translation', [0, 0, 0]); sc = node.get('scale', [1, 1, 1])
        for pr in j['meshes'][node['mesh']]['primitives']:
            base = len(P); at = pr['attributes']
            P += [tuple(p[i] * sc[i] + t[i] for i in range(3)) for p in acc(at['POSITION'])]
            N += acc(at['NORMAL']); U += acc(at['TEXCOORD_0'])
            I += [base + i[0] for i in acc(pr['indices'])]
    mat = j['materials'][0]['name'].lower()
    tex = next(k for k, (name, _) in enumerate(TEX) if name in mat) if any(name in mat for name, _ in TEX) else 2
    return P, N, U, I, tex

os.makedirs(OUT, exist_ok=True)
atlas = Image.new('RGBA', (S, S * len(TEX)))
for k, (_, p) in enumerate(TEX): atlas.paste(Image.open(p).convert('RGBA').resize((S, S), Image.NEAREST), (0, k * S))
atlas.save(os.path.join(OUT, 'deco.png'), optimize=True)

blob, man = bytearray(), []
for name, path, (mode, size) in MODELS:
    P, N, U, I, tex = load(path)
    lo = [min(p[i] for p in P) for i in range(3)]; hi = [max(p[i] for p in P) for i in range(3)]
    dim = [hi[i] - lo[i] for i in range(3)]
    k = size / dim[1] if mode == 'h' else size / max(dim[0], dim[2])
    # in Blockmaß: Boden auf y = 0, Mitte über der Blockmitte (0.5, 0.5); Bereich für die Quantisierung
    Q = [(((p[0] - (lo[0] + hi[0]) / 2) * k + 0.5), (p[1] - lo[1]) * k, ((p[2] - (lo[2] + hi[2]) / 2) * k + 0.5)) for p in P]
    qlo = [min(q[i] for q in Q) for i in range(3)]; qhi = [max(q[i] for q in Q) for i in range(3)]
    ent = {'name': name, 'tex': tex, 'nv': len(Q), 'ni': len(I), 'off': len(blob), 'lo': [round(v, 5) for v in qlo], 'hi': [round(v, 5) for v in qhi]}
    for q in Q: blob += struct.pack('<3H', *[round((q[i] - qlo[i]) / max(1e-6, qhi[i] - qlo[i]) * 65535) for i in range(3)])
    for n in N: blob += struct.pack('<3b', *[max(-127, min(127, round(v * 127))) for v in n])
    if len(blob) % 2: blob += b'\0'
    for u in U: blob += struct.pack('<2H', *[max(0, min(65535, round((u[0] % 1.0001) * 65535))), max(0, min(65535, round(((tex + min(1, max(0, u[1]))) / len(TEX)) * 65535)))])
    for i in I: blob += struct.pack('<H', i)
    if len(blob) % 4: blob += b'\0' * (4 - len(blob) % 4)
    man.append(ent)
open(os.path.join(OUT, 'deco.bin'), 'wb').write(blob)
json.dump(man, open(os.path.join(OUT, 'deco.json'), 'w'), separators=(',', ':'))
for lic in [os.path.join(PT, 'LICENSE-KayKit-Furniture-Bits.txt'), os.path.join(PT, 'LICENSE-KayKit-City-Builder-Bits.txt'), os.path.join(QD, 'LICENSE-KayKit-Dungeon.txt')]:
    shutil.copy(lic, OUT)
print(f'{len(man)} Modelle, deco.bin {len(blob) // 1024} KB, deco.png {os.path.getsize(os.path.join(OUT, "deco.png")) // 1024} KB')
for m in man: print(f"  {m['name']:12} {m['nv']:5} Ecken  {[round(m['hi'][i] - m['lo'][i], 2) for i in range(3)]}")
