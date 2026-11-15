"""Titanparcours: Kommentator-Ansagen mit der Trailer-Stimme erzeugen.
Edge TTS de-CH-JanNeural -> ffmpeg-Kette wie im Trailer (Rubberband -2,5 Halbtöne, Sub-Oktave, Hall), mono MP3.
Aufruf: python3 tools/titan-voice/make.py [--force]   (braucht edge-tts, ffmpeg mit rubberband; Host speech.platform.bing.com)
Schreibt anmacha-funkparcours/assets/vo/<id>_<n>.mp3 und vo.js (Liste der Varianten + Länge)."""
import asyncio, json, os, subprocess, sys
import edge_tts
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'anmacha-funkparcours', 'assets', 'vo'); TMP = os.path.join(HERE, '.raw')
VOICE, RATE = 'de-CH-JanNeural', '+6%'
CHAIN = ("[0:a]aresample=48000,rubberband=pitch=0.8655:pitchq=quality,asplit=2[m][s];"
         "[s]rubberband=pitch=0.5,lowpass=f=260,volume=0.32[sub];"
         "[m][sub]amix=inputs=2:normalize=0,equalizer=f=120:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2,"
         "aecho=0.85:0.55:38|77|120:0.20|0.12|0.07,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,"
         "loudnorm=I=-15:TP=-1.5:LRA=7,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
         "silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12[o]")
async def tts(text, path):
    for i in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE, proxy=os.environ.get('HTTPS_PROXY')).save(path); return
        except Exception as e:
            if i == 3: raise
            await asyncio.sleep(2 + i * 2)
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())
async def main():
    force = '--force' in sys.argv; os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    lines = {k: v for k, v in json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8')).items() if not k.startswith('_')}
    manifest = {}
    for key, variants in lines.items():
        manifest[key] = []
        for n, text in enumerate(variants):
            name = f'{key}_{n}.mp3'.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
            dst, raw = os.path.join(OUT, name), os.path.join(TMP, name)
            if force or not os.path.exists(dst):
                await tts(text, raw)
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-filter_complex', CHAIN, '-map', '[o]', '-ac', '1', '-ar', '44100', '-b:a', '64k', dst], check=True)
                print('✓', name, '·', text)
            manifest[key].append([name, round(dur(dst), 2)])
    with open(os.path.join(OUT, 'vo.js'), 'w', encoding='utf-8') as f:
        f.write('/* erzeugt von tools/titan-voice/make.py – nicht von Hand ändern. Schlüssel → [[Datei, Sekunden], …] */\n')
        f.write('export const VO = ' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(sum(len(v) for v in manifest.values()), 'Ansagen')
asyncio.run(main())
