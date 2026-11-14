#!/usr/bin/env python3
"""ZEITSPRUNG – Vitos Stimme mit Microsoft Edge TTS (neuronale Stimme), je Satz eine MP3 (mono, 16 kHz, 16 kbit/s).
Eingabe: zeitsprung/vo/lines.json (node tools/zeitsprung-voice/collect.cjs), Ausgabe: zeitsprung/vo/<schlüssel>.mp3 + index.json.
Aufruf: pip install edge-tts && python3 tools/zeitsprung-voice/gen-edge.py   (läuft per Workflow .github/workflows/zeitsprung-voice.yml)
Schlüssel = FNV-1a über UTF-16-Einheiten, Basis 36 – identisch zu voKey() in zeitsprung/voice.js.
Prosodie wie ein Moderator: Ausrufe etwas schneller und heller, Fragen ruhiger, Antwortbuchstaben kurz und betont."""
import os, sys, json, re, asyncio, subprocess, tempfile
import edge_tts

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'zeitsprung', 'vo')
PROXY = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or None
LIMIT = int(os.environ.get('ZS_VOICE_LIMIT', '0') or 0)  # 0 = alle


def key(text):
    h = 0x811c9dc5
    data = text.encode('utf-16-le')
    for i in range(0, len(data), 2):
        h ^= data[i] | (data[i + 1] << 8)
        h = (h * 16777619) & 0xffffffff
    d, n = '0123456789abcdefghijklmnopqrstuvwxyz', ''
    while True:
        n = d[h % 36] + n
        h //= 36
        if not h:
            return n


def speakable(t):
    # Aussprache: Gedankenstriche als Pause, Abkürzungen lesbar, A–D als „A bis D“
    t = t.replace('–', ', ').replace('…', '...').replace('&', 'und')
    t = re.sub(r'\bA bis D\b', 'A bis D', t)
    t = re.sub(r'\bESC\b', 'E S C', t)
    t = re.sub(r'\bDSDS\b', 'D S D S', t)
    t = re.sub(r'\bGNTM\b', 'G N T M', t)
    return t


def prosody(t):
    if re.match(r'^[A-D]:$', t):
        return '+0%', '+2Hz'
    if t.endswith('!'):
        return '+8%', '+3Hz'
    if t.endswith('?'):
        return '+0%', '-1Hz'
    return '+4%', '+0Hz'


async def one(sem, voice, text, done):
    k = key(text)
    f = os.path.join(ROOT, k + '.mp3')
    if os.path.exists(f):
        done.add(k)
        return
    rate, pitch = prosody(text)
    async with sem:
        for attempt in range(5):
            try:
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                    raw = tmp.name
                await edge_tts.Communicate(speakable(text), voice, rate=rate, pitch=pitch, proxy=PROXY).save(raw)
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                                '-ac', '1', '-ar', '16000', '-b:a', '16k', f], check=True)
                os.unlink(raw)
                done.add(k)
                return
            except Exception as err:  # Netz/Drosselung: kurz warten und erneut
                await asyncio.sleep(2 + attempt * 3)
                last = err
        print('FEHLER', text[:60], last, file=sys.stderr)


async def main():
    src = json.load(open(os.path.join(ROOT, 'lines.json'), encoding='utf-8'))
    voice, lines = src.get('voice', 'de-DE-FlorianMultilingualNeural'), src['lines']
    if LIMIT:
        lines = lines[:LIMIT]
    sem, done = asyncio.Semaphore(12), set()
    for i in range(0, len(lines), 400):
        await asyncio.gather(*(one(sem, voice, t, done) for t in lines[i:i + 400]))
        print(f'{min(i + 400, len(lines))}/{len(lines)}', flush=True)
    wanted = {key(t) for t in lines}
    for f in os.listdir(ROOT):  # Sätze, die es nicht mehr gibt, entfernen
        if f.endswith('.mp3') and f[:-4] not in wanted:
            os.unlink(os.path.join(ROOT, f))
    keys = sorted(k for k in done if k in wanted)
    json.dump({'voice': voice, 'keys': keys}, open(os.path.join(ROOT, 'index.json'), 'w'), separators=(',', ':'))
    print('fertig', len(keys), 'von', len(lines))


asyncio.run(main())
