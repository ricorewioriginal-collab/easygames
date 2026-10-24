#!/usr/bin/env python3
"""Vorschaubilder für die Spieleliste (index.html): thumbs/<id>.webp aus dem Kartenbild (img in games.js).

Breite Bilder höchstens 960 px, sonst 512 px, WebP Qualität 80 – meist 70 % kleiner als PNG/JPG.
thumbs/thumbs.js listet die Bilder samt Prüfsumme des Originals (Cache-Bust; tools/check-games.js warnt bei
fehlenden oder veralteten Vorschaubildern). Ohne Eintrag zeigt die Seite das Original.
Aufruf: python3 tools/make-thumbs.py   (ändert nur, was neu oder geändert ist)
"""
import hashlib, io, json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'thumbs')


def main():
    games = open(os.path.join(ROOT, 'games.js'), encoding='utf-8').read()
    pairs = re.findall(r"id:\s*'([^']+)'[^\n]*?img:\s*'([^']+)'", games)
    os.makedirs(OUT, exist_ok=True)
    idx, made, prev = {}, 0, {}
    old = os.path.join(OUT, 'thumbs.js')
    if os.path.isfile(old):
        m = re.search(r'=\s*(\{.*\})', open(old, encoding='utf-8').read(), re.S)
        prev = json.loads(m.group(1)) if m else {}
    for gid, rel in pairs:
        src = os.path.join(ROOT, rel)
        if rel.startswith('http') or not re.search(r'\.(png|jpe?g|webp)$', rel, re.I) or not os.path.isfile(src):
            continue
        data = open(src, 'rb').read()
        h = hashlib.md5(data).hexdigest()[:10]
        dst = os.path.join(OUT, gid + '.webp')
        if prev.get(gid) == h and os.path.isfile(dst):
            idx[gid] = h
            continue
        im = Image.open(io.BytesIO(data))
        im.load()
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA')
        w, hh = im.size
        lim = 960 if w > hh * 1.3 else 512
        if max(w, hh) > lim:
            im.thumbnail((lim, lim), Image.LANCZOS)
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=80, method=6)
        if len(b.getvalue()) >= len(data):   # bringt nichts: Original behalten
            if os.path.isfile(dst):
                os.remove(dst)
            continue
        open(dst, 'wb').write(b.getvalue())
        idx[gid] = h
        made += 1
    for f in os.listdir(OUT):   # Bilder entfernter Spiele aufräumen
        if f.endswith('.webp') and f[:-5] not in idx:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, 'thumbs.js'), 'w', encoding='utf-8') as fh:
        fh.write('/* Erzeugt von tools/make-thumbs.py – nicht von Hand ändern. Spiel-ID → Prüfsumme des Kartenbilds. */\n')
        fh.write('window.EASYGAMES_THUMBS = ' + json.dumps(idx, sort_keys=True, separators=(',', ':')) + ';\n')
    print(f'{len(idx)} Vorschaubilder ({made} neu erzeugt)')


if __name__ == '__main__':
    sys.exit(main())
