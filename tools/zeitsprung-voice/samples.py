#!/usr/bin/env python3
"""ZEITSPRUNG – Hörproben verschiedener Edge-TTS-Moderatorstimmen (24 kHz, 64 kbit/s) nach tools/zeitsprung-voice/samples/.
Läuft per Workflow .github/workflows/zeitsprung-voice-samples.yml."""
import os, re, asyncio, subprocess, tempfile
import edge_tts

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples')
VOICES = ['de-DE-FlorianMultilingualNeural', 'de-DE-ConradNeural', 'de-DE-KillianNeural',
          'en-US-AndrewMultilingualNeural', 'en-US-BrianMultilingualNeural', 'de-DE-SeraphinaMultilingualNeural']
LINES = ['Willkommen bei Zeitsprung Eurovision!', '8 Punkte bringen den Sieg!', 'Spieler 1, du bist dran!',
         'Wann war: ABBA gewinnt in Brighton?', 'Richtig!', 'ABBA gewinnt in Brighton: 1974.', 'Spieler 2, du bist dran!',
         'In welchem Jahr startete dieser Film im Kino?', 'Leider falsch!', '8 Punkte, du bist der Superstar des Abends!']


def prosody(t):
    if t.endswith('!'):
        return '+10%', '+5Hz'
    if t.endswith('?'):
        return '+4%', '+1Hz'
    return '+6%', '+2Hz'


async def voice(v):
    parts = []
    for i, t in enumerate(LINES):
        f = tempfile.mktemp(suffix='.mp3')
        rate, pitch = prosody(t)
        await edge_tts.Communicate(t.replace('–', ', '), v, rate=rate, pitch=pitch).save(f)
        parts.append(f)
    lst = tempfile.mktemp(suffix='.txt')
    gap = tempfile.mktemp(suffix='.mp3')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.35', gap], check=True)
    open(lst, 'w').write(''.join(f"file '{p}'\nfile '{gap}'\n" for p in parts))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-ar', '24000', '-b:a', '64k',
                    os.path.join(OUT, v + '.mp3')], check=True)
    print('ok', v)


async def main():
    os.makedirs(OUT, exist_ok=True)
    for v in VOICES:
        try:
            await voice(v)
        except Exception as e:
            print('FEHLER', v, e)


asyncio.run(main())
