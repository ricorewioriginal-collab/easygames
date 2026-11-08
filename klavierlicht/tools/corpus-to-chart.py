#!/usr/bin/env python3
"""Klavierlicht – macht aus gemeinfreien Notenvorlagen (music21-Korpus: MusicXML, Humdrum, ABC) Charts fürs Online-Archiv.

Melodie = oberste Stimme (Sopran, Gesang oder bei Klaviersätzen die höchste Note), Begleitung = alle übrigen Stimmen
als echte Noten (Feld „acc“). Einstimmige Volksweisen bekommen Akkorde je halbem Takt aus der Tonart (Feld „chords“).
Jedes Lied trägt eine Rechte-Angabe (Feld „lic“ und „src“).

Einrichtung: python3 -m venv ~/.bp && ~/.bp/bin/pip install music21
Aufruf:      ~/.bp/bin/python corpus-to-chart.py tools/korpus-liste.json archiv/
"""
import json, math, os, sys

def chart_from(entry):
    from music21 import corpus, converter, chord as m21chord, note as m21note, key as m21key
    p = corpus.parse(entry['path'], number=entry.get('number')) if entry.get('number') else corpus.parse(entry['path'])
    if hasattr(p, 'scores'):   # ABC-Sammlung ohne Nummer: erstes Stück
        p = p.scores[0]
    parts = list(p.parts)
    bpm = entry.get('bpm', 100); maxs = entry.get('max', 95)
    step_q = 0.25                                   # Raster: Sechzehntel (in Viertelnoten)
    def notes_of(part):
        out = []
        for el in part.flatten().notes:
            off = float(el.getOffsetInHierarchy(p)) if False else float(el.offset)
            d = float(el.quarterLength)
            if d <= 0: continue
            ps = [n.pitch.midi for n in (el.notes if isinstance(el, m21chord.Chord) else [el])]
            for q in ps: out.append((off, q, d))
        return out
    flat = []
    for i, part in enumerate(parts):
        fl = part.flatten()
        for el in fl.notes:
            d = float(el.quarterLength)
            if d <= 0 or getattr(el.duration, 'isGrace', False): continue
            ps = [n.pitch.midi for n in (el.notes if isinstance(el, m21chord.Chord) else [el])]
            for q in ps: flat.append((float(el.offset), q, d, i))
    if not flat: raise SystemExit(entry['id'] + ': keine Noten')
    lim = maxs * bpm / 60.0                          # Länge begrenzen (Viertel)
    flat = [n for n in flat if n[0] < lim]
    mpart = entry.get('melody', 0)
    if mpart == 'top':   # Klaviersatz: höchste Note je Einsatz aus der rechten Hand (Teil 0)
        by = {}
        for o, q, d, i in flat:
            if i == 0 and (o not in by or q > by[o][1]): by[o] = (o, q, d)
        mel = sorted(by.values())
        mel_set = set((o, q) for o, q, d in mel)
        acc = [(o, q, d) for o, q, d, i in flat if (o, q) not in mel_set or i != 0]
    else:
        mel = sorted((o, q, d) for o, q, d, i in flat if i == mpart)
        acc = [(o, q, d) for o, q, d, i in flat if i != mpart]
        # Akkorde in der Melodiestimme: nur oberste Note
        by = {}
        for o, q, d in mel:
            if o not in by or q > by[o][1]: by[o] = (o, q, d)
        mel = sorted(by.values())
    # Melodie in gut spielbare Lage (Mitte um G4–C5) verschieben, Begleitung gleich mit
    med = sorted(q for _, q, _ in mel)[len(mel) // 2]
    sh = 0
    while med + sh < 62: sh += 12
    while med + sh > 79: sh -= 12
    q = lambda x: int(round(x / step_q))
    m_out = []
    for o, pch, d in mel:
        s = q(o)
        if m_out and m_out[-1][0] == s: continue
        m_out.append([s, pch + sh, max(1, q(d))])
    a_out = sorted(set((q(o), pch + sh, max(1, q(d))) for o, pch, d in acc))
    # Begleitung ausdünnen: höchstens 3 Töne je Einsatz (tiefster + zwei höchste), nicht über die Melodie
    by = {}
    for s, pch, d in a_out: by.setdefault(s, []).append((pch, d))
    acc2 = []
    for s, lst in sorted(by.items()):
        lst.sort(); keep = lst[:1] + lst[1:][-2:] if len(lst) > 3 else lst
        for pch, d in keep:
            while pch > 76: pch -= 12
            while pch < 33: pch += 12
            acc2.append([s, pch, d])
    chart = {'v': 1, 'id': entry['id'], 'title': entry['title'], 'artist': entry['artist'], 'cat': entry['cat'], 'bpm': bpm,
             'step': round(60000 / bpm * step_q, 3), 'off': 0, 'mel': m_out, 'acc': acc2, 'chords': [], 'bass': [],
             'lic': entry['lic'], 'src': entry['src']}
    if entry.get('gems'): chart['gems'] = entry['gems']
    # kurze Stücke (eine Strophe) wiederholen, damit eine Runde mindestens ~35 Sekunden dauert (wie js/core.js fromNotation)
    L = max(x[0] + x[2] for x in m_out); sec = L * chart['step'] / 1000; reps = max(1, min(3, math.ceil(35 / sec))) if sec > 0 else 1
    for key in ('mel', 'acc', 'chords', 'bass'):
        base = list(chart[key]); chart[key] = [[x[0] + r * L] + list(x[1:]) for r in range(reps) for x in base]   # neues Lied, im Shop mit Diamanten freizuschalten
    if not acc2:   # einstimmig: Akkorde aus der Tonart
        k = p.analyze('key'); tonic = k.tonic.pitchClass if k.mode == 'major' else (k.tonic.pitchClass + 3) % 12
        chart['chords'] = harmonize(m_out, tonic, int(round(p.recurse().getElementsByClass('TimeSignature')[0].barDuration.quarterLength / step_q)) if p.recurse().getElementsByClass('TimeSignature') else 16)
        chart['bass'] = [[c[0], 36 + c[1] if c[1] < 8 else 24 + c[1], c[3]] for c in chart['chords']]
    return chart

def harmonize(mel, key, bar):
    """Akkord je halbem Takt: der Tonart-Dreiklang, der die Melodietöne (Dauer, betonte Zeit zählt doppelt) am besten abdeckt."""
    TRI = []
    for deg, qq in ((0, ''), (2, 'm'), (4, 'm'), (5, ''), (7, ''), (9, 'm')):
        r = (key + deg) % 12; TRI.append((r, qq, {(r + i) % 12 for i in ((0, 3, 7) if qq == 'm' else (0, 4, 7))}))
    half = max(4, bar // 2) if bar % 2 == 0 else bar
    end = max(s + d for s, _, d in mel); out = []
    for c0 in range(0, end, half):
        w = [0.0] * 12
        for s, p, d in mel:
            ov = min(s + d, c0 + half) - max(s, c0)
            if ov > 0: w[p % 12] += ov * (2 if s == c0 else 1)
        if sum(w) == 0: continue
        r, qq, _ = max(TRI, key=lambda t: sum(w[k] for k in t[2]) + (0.3 if t[0] == key else 0))
        if out and out[-1][1] == r and out[-1][2] == qq and out[-1][0] + out[-1][3] == c0: out[-1][3] += half
        else: out.append([c0, r, qq, half])
    return out

def main():
    lst = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; os.makedirs(out, exist_ok=True); ok = 0
    for e in lst:
        try:
            c = chart_from(e)
            with open(os.path.join(out, e['id'] + '.json'), 'w', encoding='utf-8') as f: json.dump(c, f, ensure_ascii=False, separators=(',', ':'))
            ok += 1; print(f"{e['id']:<24} {len(c['mel']):4} Melodie, {len(c['acc']):4} Begleitung, {len(c['chords']):3} Akkorde")
        except Exception as ex: print('FEHLER', e['id'], ex)
    print(ok, 'von', len(lst), 'umgewandelt')

if __name__ == '__main__': main()
