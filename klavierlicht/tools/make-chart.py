#!/usr/bin/env python3
"""Klavierlicht – macht aus einem Song eine Klavier-Notenfolge (Chart) fürs Spiel.

Ablauf:
  1. Demucs (htdemucs, MIT) trennt den Song in Gesang, Bass, Schlagzeug und Rest.
  2. Melodie = Gesangslinie: Tonhöhe per pYIN aus der Gesangsspur, an Silbenanfängen (Onsets) in Noten geteilt.
  3. Bass = Grundton je Schlag per pYIN aus der Bassspur.
  4. Akkorde je halbem Takt aus den übrigen Instrumenten (Chroma) – nur Akkorde der erkannten Tonart.
  Vorher wird die Stimmung des Songs gemessen und ausgeglichen (KI-Songs liegen oft zwischen zwei Klaviertasten).
Ergebnis ist eine kleine JSON-Datei nur mit Noten; das Spiel spielt sie selbst auf dem Klavier. Audio und Spuren
werden nirgends gespeichert oder mitgeliefert (Arbeitsordner wird gelöscht).

Einrichtung (einmal):
  python3 -m venv ~/.bp && ~/.bp/bin/pip install librosa scipy numpy soundfile demucs
  ~/.bp/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
Aufruf:
  ~/.bp/bin/python make-chart.py song.mp3 out.json --title "Titel" --artist "Künstler" [--id <hub-id>] [--cat ricorewi]
"""
import argparse, json, math, os, shutil, subprocess, sys, tempfile
import numpy as np

SR = 22050; HOP = 256
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

def separate(audio, work):
    d = os.path.join(work, 'htdemucs', os.path.splitext(os.path.basename(audio))[0])
    st = {k: os.path.join(d, k + '.wav') for k in ('vocals', 'bass', 'other', 'drums')}
    if not all(os.path.exists(f) for f in st.values()):   # mit --keep bereits getrennte Spuren wiederverwenden
        subprocess.run([sys.executable, '-m', 'demucs', '-n', 'htdemucs', '-j', '2', '-o', work, audio], check=True, capture_output=True)
    return st

def beats(mix):
    import librosa
    y, _ = librosa.load(mix, sr=SR, mono=True)
    tempo, bt = librosa.beat.beat_track(y=y, sr=SR, units='time', tightness=120)
    tempo = float(np.atleast_1d(tempo)[0])
    while tempo < 75: tempo *= 2
    while tempo > 165: tempo /= 2
    beat = 60.0 / tempo
    off = float(np.median(np.mod(bt, beat))) if len(bt) else 0.0
    tuning = float(librosa.estimate_tuning(y=y, sr=SR))   # Abweichung von A=440 in Halbtönen (KI-Songs liegen oft dazwischen)
    return tempo, beat, off, len(y) / SR, tuning

def f0_track(path, fmin, fmax, tuning=0.0):
    import librosa
    y, _ = librosa.load(path, sr=SR, mono=True)
    f0, vflag, vprob = librosa.pyin(y, fmin=fmin, fmax=fmax, sr=SR, hop_length=HOP, frame_length=2048)
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0][:len(f0)]
    m = np.where(vflag & (vprob > 0.08) & (rms > max(1e-4, np.percentile(rms, 60) * 0.15)), 69 + 12 * np.log2(np.nan_to_num(f0, nan=1.0) / 440.0) - tuning, np.nan)
    on = librosa.onset.onset_detect(y=y, sr=SR, hop_length=HOP, backtrack=True, units='frames', delta=0.06)
    return m, set(int(x) for x in on), y

def segment(m, onsets, min_len=0.08):
    """Frames mit Tonhöhe → Noten [start_s, end_s, midi]: neue Note bei Pause, stabilem Tonwechsel (> 0.8 HT für 4 Frames) oder Silbenanfang."""
    from scipy.ndimage import median_filter
    v = ~np.isnan(m); mm = np.where(v, m, 0); mm = median_filter(mm, 7); mm[~v] = np.nan
    # kurze Aussetzer (≤ 3 Frames) im Gesang überbrücken
    i = 0
    while i < len(mm):
        if np.isnan(mm[i]):
            j = i
            while j < len(mm) and np.isnan(mm[j]): j += 1
            if 0 < i and j < len(mm) and j - i <= 3 and abs(mm[i - 1] - mm[j]) < 1: mm[i:j] = mm[i - 1]
            i = j
        else: i += 1
    fr = HOP / SR; notes = []; cur = []
    def flush(c):
        if len(c) * fr >= min_len:
            notes.append([c[0] * fr, (c[-1] + 1) * fr, float(np.median([mm[k] for k in c]))])
    i = 0
    while i < len(mm):
        if np.isnan(mm[i]): flush(cur); cur = []; i += 1; continue
        if cur:
            ref = float(np.median([mm[k] for k in cur]))
            w = mm[i:i + 4]
            if len(w) == 4 and not np.isnan(w).any() and np.all(np.abs(w - ref) > 0.8): flush(cur); cur = []
            elif i in onsets and len(cur) * fr > 0.15: flush(cur); cur = []
        cur.append(i); i += 1
    flush(cur)
    return notes

def snap(notes, scale, onsets):
    """Gesungene Tonhöhen (gleitend, mit Vibrato) auf Tasten setzen: bevorzugt Töne der Tonart, gleiche Töne mit kleiner Lücke zusammenfassen."""
    fr = HOP / SR; out = []
    for s, e, fp in notes:
        r = int(round(fp)); best = r
        if r % 12 not in scale:
            cand = [q for q in (int(math.floor(fp)), int(math.ceil(fp)), r - 1, r + 1) if q % 12 in scale]
            if cand: best = min(cand, key=lambda q: abs(q - fp))
            if abs(best - fp) > 0.9: best = r
        if out and out[-1][2] == best and s - out[-1][1] < 0.06 and not any(int(s / fr) - 1 <= o <= int(s / fr) + 1 for o in onsets): out[-1][1] = e
        else: out.append([s, e, best])
    return out

def chroma(path, tuning):
    """Chroma (12 Tonklassen je Frame) der übrigen Instrumente – mit ausgeglichener Stimmung."""
    import librosa
    y, _ = librosa.load(path, sr=SR, mono=True)
    return librosa.feature.chroma_cqt(y=y, sr=SR, hop_length=HOP, tuning=tuning, n_chroma=12)

def build(stems, tempo, beat, off, length, tuning):
    step = beat / 4; q = lambda t: max(0, int(round((t - off) / step)))
    # --- Melodie aus dem Gesang
    vm, von, _ = f0_track(stems['vocals'], 75, 1100, tuning)
    vraw = segment(vm, von)
    if not vraw: raise SystemExit('kein Gesang erkannt')
    CH = chroma(stems['other'], tuning); fr = HOP / SR
    allc = CH.sum(axis=1) / max(1, CH.shape[1]) * 40
    for s, e, p in vraw: allc[int(round(p)) % 12] += 0.5 * (e - s)
    SC = (0, 2, 4, 5, 7, 9, 11)
    key = max(range(12), key=lambda r: sum(allc[(r + i) % 12] for i in SC))
    vn = snap(vraw, {(key + i) % 12 for i in SC}, von)
    med = float(np.median([n[2] for n in vn]))
    shift = 12 if med < 60 else 0          # tiefe Stimmen eine Oktave höher, damit die Melodie über der Begleitung liegt
    mel = []
    for s, e, p in vn:
        a, b = q(s), max(q(s) + 1, q(e))
        if mel and mel[-1][0] == a:        # zwei Noten im selben Sechzehntel: die längere behalten
            if b - a > mel[-1][2]: mel[-1] = [a, p + shift, b - a]
            continue
        if mel and a < mel[-1][0] + mel[-1][2]: mel[-1][2] = max(1, a - mel[-1][0])
        mel.append([a, p + shift, b - a])
    # --- Bass je Schlag aus der Bassspur
    bm, _, _ = f0_track(stems['bass'], 30, 300, tuning)
    nslots = q(length) + 1; bass = []
    for b0 in range(0, nslots, 4):
        i0, i1 = int((off + b0 * step) / fr), int((off + (b0 + 4) * step) / fr)
        seg = bm[i0:i1]; seg = seg[~np.isnan(seg)]
        if len(seg) >= 4:
            p = int(round(float(np.median(seg))))
            if bass and bass[-1][1] == p and bass[-1][0] + bass[-1][2] == b0: bass[-1][2] += 4
            else: bass.append([b0, p, 4])
    # --- Akkorde je halbem Takt (Tonart-Akkorde, Bass zählt doppelt)
    tri = []
    for deg, qq in ((0, ''), (2, 'm'), (4, 'm'), (5, ''), (7, ''), (9, 'm')):
        r = (key + deg) % 12; iv = (0, 3, 7) if qq == 'm' else (0, 4, 7)
        v = np.zeros(12); v[[(r + i) % 12 for i in iv]] = [1.0, 0.8, 0.9]; tri.append((r, qq, v, set((r + i) % 12 for i in iv)))
    span = 8; chords = []
    for c0 in range(0, nslots, span):
        t0, t1 = off + c0 * step, off + (c0 + span) * step
        ch = CH[:, int(t0 / fr):int(t1 / fr)].sum(axis=1) * fr
        for b in bass:
            ov = min(off + (b[0] + b[2]) * step, t1) - max(off + b[0] * step, t0)
            if ov > 0: ch[b[1] % 12] += 1.5 * ov
        if ch.sum() < 0.05: continue
        r, qq, _, _ = max(tri, key=lambda x: float(x[2] @ ch) - 0.2 * sum(ch[k] for k in range(12) if k not in x[3]))
        if chords and chords[-1][1] == r and chords[-1][2] == qq and chords[-1][0] + chords[-1][3] == c0: chords[-1][3] += span
        else: chords.append([c0, r, qq, span])
    return mel, chords, bass, step, key, shift

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('audio'); ap.add_argument('out'); ap.add_argument('--title', required=True); ap.add_argument('--artist', default='')
    ap.add_argument('--id', default=''); ap.add_argument('--cat', default='ricorewi'); ap.add_argument('--keep', help='Spuren-Ordner behalten (Fehlersuche)')
    a = ap.parse_args()
    work = a.keep or tempfile.mkdtemp(prefix='klchart-')
    try:
        stems = separate(a.audio, work); tempo, beat, off, length, tuning = beats(a.audio)
        mel, chords, bass, step, key, shift = build(stems, tempo, beat, off, length, tuning)
    finally:
        if not a.keep: shutil.rmtree(work, ignore_errors=True)
    pitches = [n[1] for n in mel]
    chart = {'v': 1, 'id': a.id, 'title': a.title, 'artist': a.artist, 'cat': a.cat, 'bpm': round(tempo, 2), 'step': round(step * 1000, 3), 'off': round(off * 1000),
             'key': key, 'tuning': round(tuning, 2), 'range': [min(pitches), max(pitches)], 'mel': mel, 'chords': chords, 'bass': bass,
             'src': 'Klavierfassung, automatisch aus dem Song erstellt (Gesangslinie, Bass, Akkorde)'}
    with open(a.out, 'w', encoding='utf-8') as f: json.dump(chart, f, ensure_ascii=False, separators=(',', ':'))
    print(f"{a.title}: {round(tempo)} BPM, {NAMES[key]}-Dur/parallel Moll, {len(mel)} Melodienoten{' (+1 Okt.)' if shift else ''}, {len(chords)} Akkorde, {len(bass)} Bass, {os.path.getsize(a.out)//1024} KB")

if __name__ == '__main__': main()
