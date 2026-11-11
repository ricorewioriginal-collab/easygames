# Zotik – automatische Tests

Prüfen das gebaute Spiel (`zotik/`) im Browser (Playwright). Vorher im Hauptordner einen Server starten:

```bash
python3 -m http.server 8799 &
export NODE_PATH=$(npm root -g)
node tools/test-zotik/bedienung.cjs      # Tastatur ohne Maus, TV-Fernbedienung, Controller: Start, Laufen, Kampf, Menü, Rätsel
node tools/test-zotik/handy.cjs          # Touch, Speichern/Laden (auch ältere Stände), K.O.
node tools/test-zotik/geschichte.cjs 1 2 # Hauptgeschichte Kapitel von–bis (je 2 Kapitel pro Lauf): Aufträge, Etappen, Rätsel, Bosse
node tools/test-zotik/erreichbar.cjs 2 4 # alle Auftrags- und Etappen-Punkte zu Fuß erreichbar (Welt von–bis)
node tools/test-zotik/stadt.cjs 1 10     # Städte: Kirche, Läden, Wirtshaus, Casino – erreichbar, kaufen, heilen, alle Casino-Spiele, Quoten
node tools/test-zotik/nebenquests.cjs 1 10 # alle Nebenquest-Ketten von der Annahme bis zur Belohnung
node tools/test-zotik/springen.cjs 1 10  # Springen: mit echten Tasten von Platte zu Platte bis zur Truhe, in jeder Welt
```

Die Tests nutzen `?debug` (`__zotik`) und schalten das Zeichnen ab (`__zotik.noRender`), damit sie auch ohne Grafikkarte schnell laufen.
