#!/usr/bin/env python3
"""Sprechzeilen der Zwischensequenzen aus „AnMaCha – Der Podcast“ sammeln (Andrew, Marco, Rico, Erzähler, Jana, Publikum).
Aufruf: python3 tools/podcast-voice/extract.py  →  anmacha-podcast-tycoon/vo/lines.json
Zeilen mit eigener Aufnahme ({ src: … }) werden übersprungen. NPCs bekommen keine Aufnahme (Brabbel-Stimme im Spiel)."""
import re, json, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'anmacha-podcast-tycoon')
FILES = ['src/acts.js', 'src/rico-live.js', 'src/missions.js', 'src/worlds.js']
RX = re.compile(r"\[ ?'(andrew|marco|rico|n|jana|fans)', '((?:[^'\\]|\\.)*)'(\s*,\s*(?:clip\(|\{ ?src))?")
out, seen = [], set()
for f in FILES:
    for m in RX.finditer(open(os.path.join(ROOT, f), encoding='utf-8').read()):
        if m.group(3): continue
        who, text = m.group(1), m.group(2).replace("\\'", "'")
        if (who, text) in seen: continue
        seen.add((who, text)); out.append({'who': who, 'text': text})
os.makedirs(os.path.join(ROOT, 'vo'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'vo', 'lines.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(out), 'Zeilen')
