#!/usr/bin/env python3
"""ZEITSPRUNG – Hörproben verschiedener Edge-TTS-Moderatorstimmen (24 kHz, 64 kbit/s) nach tools/zeitsprung-voice/samples/.
Läuft per Workflow .github/workflows/zeitsprung-voice-samples.yml."""
import os, re, asyncio, subprocess, tempfile
import edge_tts

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples')
VOICES = ['de-DE-FlorianMultilingualNeural', 'de-DE-ConradNeural', 'de-DE-KillianNeural',
          'en-US-AndrewMultilingualNeural', 'en-US-BrianMultilingualNeural', 'de-DE-SeraphinaMultilingualNeural']
# Aufpolieren wie ein Radio-/TV-Moderator: Rumpeln weg, Wärme und Präsenz, Kompressor, leichter Studioraum, Lautheit -16 LUFS
POLISH = ('highpass=f=75,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,equalizer=f=9000:t=h:w=2000:g=2,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3,aecho=0.8:0.85:28|46:0.12|0.07,loudnorm=I=-16:TP=-1.5:LRA=7')
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
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', POLISH, '-ac', '1', '-ar', '24000', '-b:a', '64k',
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
