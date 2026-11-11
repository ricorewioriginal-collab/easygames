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
node tools/test-zotik/dungeon.cjs 2 10   # Vorhallen: alle Ebenen je Welt – Schlüssel, Runentor, Treppe, Zwischengegner, Tor nach draußen
node tools/test-zotik/raetsel.cjs       # neue Rätselarten in drei Schwierigkeiten und in den Ruinen der Welten 6–10 mit echten Schritten lösen
node tools/test-zotik/ausbau.cjs        # Fähigkeitenbaum, Doppelsprung, Bestiarium-Belohnung, veränderte Gegner in Neues Spiel+, Auftragsfeld
node tools/test-zotik/kuenste.cjs       # Riss-Künste: Sperre, Wirkung jedes Zaubers und jeder passiven Kunst, Ankündigung
node tools/test-zotik/bosse.cjs 2 10     # eigene Angriffe jedes Bosses und Zwischengegners, Schildträger, Springer, Dreifachschuss
```

Die Tests nutzen `?debug` (`__zotik`) und schalten das Zeichnen ab (`__zotik.noRender`), damit sie auch ohne Grafikkarte schnell laufen.
