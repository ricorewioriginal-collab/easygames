# Wortfunk – Wörterbuch neu erzeugen

Ergebnis: `wortfunk/data/woerter.dawg` (Wortgraph, Uint32-Kanten, ca. 470 KB für rund 398.000 Wortformen).
Quelle: [german-pos-dict](https://github.com/languagetool-org/german-pos-dict) (CC BY-SA 4.0), siehe `wortfunk/data/LIZENZ.txt`.

```bash
# 1. Wörterbuch holen und alle Wortformen ausgeben (Java + Maven)
git clone --depth 1 https://github.com/languagetool-org/german-pos-dict gpd
for a in morfologik-fsa morfologik-stemming; do mvn -q dependency:copy -Dartifact=org.carrot2:$a:2.1.9 -DoutputDirectory=lib; done
mvn -q dependency:copy -Dartifact=com.carrotsearch:hppc:0.8.1 -DoutputDirectory=lib
CP=$(ls lib/*.jar | tr '\n' ':'); javac -cp "$CP" -d . tools/wortfunk/Dump.java
java -cp "$CP:." Dump gpd/src/main/resources/org/languagetool/resource/de/german.dict forms.tsv

# 2. filtern (keine Namen/Abkürzungen, 2–15 Buchstaben, ß → SS) und packen
python3 tools/wortfunk/mkwords.py forms.tsv gpd/src/main/resources/org/languagetool/resource/de/sonstige.txt words.txt
python3 tools/wortfunk/mkdawg.py words.txt wortfunk/data/woerter.dawg

# 3. bekannte Wörter (Computer leicht/mittel, Tipps) aus FrequencyWords (CC BY-SA 4.0)
#    https://github.com/hermitdave/FrequencyWords → content/2018/de/de_50k.txt
python3 tools/wortfunk/mkcommon.py de_50k.txt words.txt common.txt 40000
python3 tools/wortfunk/mkdawg.py common.txt wortfunk/data/bekannt.dawg

# 4. prüfen
node --test wortfunk/tests/*.test.js
python3 -m http.server 8765 & BASE=http://localhost:8765/wortfunk/ node wortfunk/tests/e2e.mjs
```

Format einer Kante: Bits 0–4 Buchstabe (1–29 = A–Z, Ä, Ö, Ü), Bit 5 Wortende, Bit 6 letzte Kante des Knotens,
Bits 7–31 Index der ersten Kante des Zielknotens (0 = keine). Eintrag 0 zeigt auf die Kanten der Wurzel.
