#!/usr/bin/env python3
"""Zotik-Sprachclips mit Edge-TTS (de) erzeugen: je Zeile eine MP3 (mono, 24 kHz, 28 kbit/s) + index.json (Schlüssel -> Datei).
Aufruf: python3 gen-edge.py lines.json ../../zotik-src/public/voice [--only Name,...] [--skip Name,...]
Schlüssel = FNV-1a("Wer|Text") base36, identisch zu zvKey() in zotik-src/src/voice.js. Bei Zertifikatsproblemen SSL über /root/.ccr/ca-bundle.crt."""
import sys, os, json, re, ssl, asyncio, subprocess, tempfile
import edge_tts, edge_tts.communicate as C
ca = '/root/.ccr/ca-bundle.crt'
if os.path.exists(ca): C._SSL_CTX = ssl.create_default_context(cafile=ca)
def key(who, text):
    h = 0x811c9dc5
    for ch in (who + '|' + text).encode('utf-16-le')[::2] if False else [ord(c) for c in who + '|' + text]:
        for u in ([ch] if ch < 0x10000 else [0xd800 + ((ch - 0x10000) >> 10), 0xdc00 + ((ch - 0x10000) & 0x3ff)]):
            h ^= u; h = (h * 16777619) & 0xffffffff
    n = ''; 
    if h == 0: return '0'
    d = '0123456789abcdefghijklmnopqrstuvwxyz'
    while h: n = d[h % 36] + n; h //= 36
    return n
M = dict(C='de-DE-ConradNeural', K='de-DE-KatjaNeural', KI='de-DE-KillianNeural', A='de-DE-AmalaNeural', F='de-DE-FlorianMultilingualNeural',
         S='de-DE-SeraphinaMultilingualNeural', CH='de-DE-ChristophNeural', T='de-DE-TanjaNeural', J='de-AT-JonasNeural', I='de-AT-IngridNeural', JA='de-CH-JanNeural', L='de-CH-LeniNeural')
# Figur -> (Stimme, Tonhöhe Hz, Tempo %)
CAST = {'Zotik':('KI',6,6),'RiCARDO':('F',0,2),'Lyra':('K',0,0),'Mira':('A',4,2),'Professorium':('CH',-10,-12),'Felli':('L',22,12),'Nia':('S',6,6),
 'Rovan':('C',-2,-3),'Erzähler':('C',-6,-8),'Eryn':('T',0,0),'Veyra':('I',-4,-5),'Aera':('A',10,0),'Vexa':('K',-12,-6),'Nerea':('L',0,-3),'Kael':('J',0,3),
 'Falk':('JA',-8,-6),'Nuri':('S',16,10),'Harlan':('CH',-14,-10),'Brenna':('I',2,3),'Toren':('JA',-4,-4),'Mirrel':('S',-2,0),'Mara':('T',-3,0),'Korrod':('C',-16,-14),
 'Boro':('J',-14,-6),'Ashen':('JA',-14,-12),'Sela':('A',6,2),'Hanno':('F',-6,0),'Mirael':('K',6,-4),'Bruno':('CH',-8,2),'Orun':('C',-14,-12),'Merle':('L',-4,0)}
pools = {'m': ['C','KI','F','CH','J','JA'], 'w': ['K','A','S','T','I','L']}
def voice(who, vox):
    if who in CAST:
        v, p, r = CAST[who]; return M[v], p, r
    g = (vox.get(who) or [None])[0]
    if not g:
        h = 0
        for c in who: h = (h * 31 + ord(c)) & 0xffffffff
        g = 'w' if h & 1 else 'm'
    h = 0
    for c in who: h = (h * 31 + ord(c)) & 0xffffffff
    return M[pools[g][h % 6]], ((h >> 3) % 9 - 4) * 3 + (-8 if g == 'm' and who in vox and vox[who][1] < .7 else 0), ((h >> 5) % 7 - 3) * 2
def clean(t):
    t = re.sub(r'<[^>]*>', ' ', t); t = re.sub(r'[\U0001F000-\U0001FFFF☀-➿️]', '', t)
    return t.replace('…', '...').strip()
async def one(sem, outd, who, text, vox, index):
    k = key(who, text); f = os.path.join(outd, k + '.mp3')
    if os.path.exists(f): index[who + '|' + text if False else k] = k + '.mp3'; return
    v, p, r = voice(who, vox)
    async with sem:
        for _ in range(3):
            try:
                tmp = tempfile.mktemp(suffix='.mp3')
                await edge_tts.Communicate(clean(text), v, pitch='%+dHz' % p, rate='%+d%%' % r).save(tmp)
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '28k', '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', f], check=True)
                os.remove(tmp); index[k] = k + '.mp3'; return
            except Exception as e: err = e; await asyncio.sleep(1)
        print('FEHLER', who, text[:40], err)
async def main():
    src, outd = sys.argv[1], sys.argv[2]
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    skip = set(sys.argv[sys.argv.index('--skip') + 1].split(',')) if '--skip' in sys.argv else set()
    d = json.load(open(src)); os.makedirs(outd, exist_ok=True)
    ip = os.path.join(outd, 'index.json'); index = json.load(open(ip)) if os.path.exists(ip) else {}
    sem = asyncio.Semaphore(6); jobs = []
    for who, ls in d['lines'].items():
        if (only and who not in only) or who in skip: continue
        for t in ls: jobs.append(one(sem, outd, who, t, d['vox'], index))
    await asyncio.gather(*jobs)
    json.dump(index, open(ip, 'w'), separators=(',', ':'), sort_keys=True)
    print(len(index), 'Clips')
asyncio.run(main())
