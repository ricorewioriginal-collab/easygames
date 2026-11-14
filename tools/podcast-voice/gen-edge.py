#!/usr/bin/env python3
"""Sprachclips für „AnMaCha – Der Podcast“ mit Edge-TTS: je Zeile eine MP3 (mono, 24 kHz, 32 kbit/s) + vo/index.json.
Aufruf: pip install edge-tts && python3 tools/podcast-voice/gen-edge.py
Läuft automatisch per GitHub-Workflow (.github/workflows/podcast-voice.yml), sobald sich vo/lines.json ändert.
Schlüssel = FNV-1a("wer|Text") base36, identisch zu voKey() in anmacha-podcast-tycoon/src/acts.js."""
import os, sys, json, re, asyncio, subprocess, tempfile
import edge_tts
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'anmacha-podcast-tycoon', 'vo')
PROXY = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or None
# Figur -> (Stimme, Tonhöhe Hz, Tempo %). Mehrsprachige Neural-Stimmen sprechen Deutsch akzentfrei.
CAST = {'andrew': ('de-DE-FlorianMultilingualNeural', 0, 4), 'marco': ('fr-FR-RemyMultilingualNeural', -4, -2), 'rico': ('de-CH-JanNeural', 0, 6),
        'n': ('de-DE-ConradNeural', -2, -6), 'jana': ('de-DE-SeraphinaMultilingualNeural', 0, 4), 'fans': ('de-DE-KillianNeural', 0, 10)}
def key(who, text):
    h = 0x811c9dc5
    for c in who + '|' + text:
        o = ord(c)
        for u in ([o] if o < 0x10000 else [0xd800 + ((o - 0x10000) >> 10), 0xdc00 + ((o - 0x10000) & 0x3ff)]):
            h ^= u; h = (h * 16777619) & 0xffffffff
    d, n = '0123456789abcdefghijklmnopqrstuvwxyz', ''
    while True:
        n = d[h % 36] + n; h //= 36
        if not h: return n
def clean(t):
    t = re.sub(r'AnMaCha', 'Anmacher', t, flags=re.I); t = re.sub(r'AN-MA-CHA', 'An-ma-cher', t)
    t = re.sub(r'[\U0001F000-\U0001FFFF☀-➿️]', '', t)
    return t.replace('…', '...').replace('–', ',').strip()
async def one(sem, who, text, index):
    k = key(who, text); f = os.path.join(ROOT, k + '.mp3')
    if os.path.exists(f): index.append(k); return
    v, p, r = CAST[who]; err = None
    async with sem:
        for _ in range(4):
            try:
                tmp = tempfile.mktemp(suffix='.mp3')
                await edge_tts.Communicate(clean(text), v, pitch='%+dHz' % p, rate='%+d%%' % r, proxy=PROXY).save(tmp)
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '32k', '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', f], check=True)
                os.remove(tmp); index.append(k); return
            except Exception as e: err = e; await asyncio.sleep(2)
    print('FEHLER', who, text[:50], err)
async def main():
    lines = json.load(open(os.path.join(ROOT, 'lines.json'), encoding='utf-8')); index = []
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*[one(sem, l['who'], l['text'], index) for l in lines])
    keep = set(index)
    for f in os.listdir(ROOT):
        if f.endswith('.mp3') and f[:-4] not in keep: os.remove(os.path.join(ROOT, f))   # alte Zeilen entfernen
    json.dump(sorted(keep), open(os.path.join(ROOT, 'index.json'), 'w'), separators=(',', ':'))
    print(len(keep), 'von', len(lines), 'Zeilen vertont')
    if len(keep) < len(lines): sys.exit(1)
asyncio.run(main())
