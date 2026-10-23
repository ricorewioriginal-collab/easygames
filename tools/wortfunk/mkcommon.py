# Bekannte Wörter für die Computerstufen Leicht/Mittel: häufigste Wörter (FrequencyWords, OpenSubtitles 2018, CC BY-SA 4.0),
# nur solche, die auch im Spielwörterbuch stehen.  Aufruf: mkcommon.py de_50k.txt words.txt common.txt [Anzahl]
import sys
freq, words, out = sys.argv[1], sys.argv[2], sys.argv[3]
top = int(sys.argv[4]) if len(sys.argv) > 4 else 40000
W = set(l.strip() for l in open(words, encoding='utf8'))
C = []
for k, line in enumerate(open(freq, encoding='utf8')):
    if k >= top: break
    w = line.split(' ')[0].replace('ß', 'ss').upper()
    if w in W and w not in C: C.append(w)
open(out, 'w', encoding='utf8').write('\n'.join(sorted(set(C))) + '\n')
print(len(set(C)), 'bekannte Wörter')
