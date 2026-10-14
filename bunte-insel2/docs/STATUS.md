# Bunte Insel 2 – Statusübersicht

Stand: 14.10.2026 · Status in EasyGames: **DEMO TEST** (in der Spieleliste als Demo markiert)
Live: https://ricorewioriginal-collab.github.io/easygames/bunte-insel2/

Legende: ✅ umgesetzt und automatisch getestet · 🟢 umgesetzt, nur von Hand oder gar nicht getestet · 🟡 teilweise umgesetzt · ⏳ geplant

## Technik

| Bereich | Status | Anmerkung |
|---|---|---|
| Three.js (r128, lokal mitgeliefert), TypeScript, eigener Build mit esbuild | ✅ | Vite-Konfiguration liegt bei, ließ sich in der Entwicklungsumgebung aber nicht nutzen (npm war gesperrt). Gebaut wird mit `node scripts/build.mjs && node scripts/deploy.mjs`. |
| Ladebildschirm mit echtem Fortschritt (Bytes), Zeitlimit, „Erneut versuchen“ | ✅ | Keine erfundenen Ladeprozente |
| PWA (Manifest, Service Worker mit eigenem Cache-Namen, kontrolliertes Update) | 🟢 | Installation auf echten Geräten noch nicht geprüft |
| Welt-Streaming (Laden < 180 m, Entladen > 300 m, höchstens 4 Welten gleichzeitig) | ✅ | Texturen werden beim Entladen freigegeben |
| Grafik-Qualitätsstufen, automatische Auflösung | 🟢 | Leistung auf schwachen Handys noch nicht gemessen |
| Eingabe: Tastatur (frei belegbar), Maus, Gamepad, Touch | 🟢 | Tastatur automatisch getestet, Touch und Gamepad noch nicht auf echten Geräten |
| Spielstände: 3 Plätze + Sicherung, Version 2 mit Migration und Bereinigung | ✅ | Speichern/Laden im Browsertest geprüft |
| Übernahme aus Bunte Insel 1 (nur lesen, Original bleibt unverändert) | 🟢 | Nicht mit echten Alt-Spielständen getestet |
| Musik und Geräusche (CC0, Lizenzen in `public/audio/LICENSES.txt`) | 🟢 | |
| Einbindung in EasyGames (Spieleliste, Anleitung, Kartenbild) | ✅ | Siehe „Änderungen außerhalb des Ordners“ |

## Spielinhalte

| Bereich | Status | Anmerkung |
|---|---|---|
| 20 Welten aus Bunte Insel 1, neu aufgebaut, mit Brücken verbunden | ✅ | Alle 20 laden im Browsertest fehlerfrei, alle NPCs erscheinen |
| Story-Modus: Prolog + Kapitel 1–9, Hauptquests main_0 bis main_8, Finale mit Flick | 🟡 | Prolog und Kapitel 1 automatisch durchgespielt, spätere Kapitel noch nicht am Stück |
| Freie Welt mit eigenem Spielstand, alles offen | ✅ | |
| Weltgeschichten (Quest je Welt) mit 3-stufigen Hinweisen | 🟡 | Alle Quests angelegt, nicht jede einzeln durchgespielt |
| Nebenquests in Sonnenhafen (Hühner, Angeln, Strand, Feuer, Schatz, Training, Eis, Zuhause) | 🟢 | |
| Figuren-Editor mit 3D-Vorschau, freischaltbare Kleidung | 🟢 | |
| NPCs mit Tagesablauf (schlafen nachts), Freundschaft | 🟢 | |
| Fahrzeuge (25 Arten, u. a. Feuerwehr mit Wasser, Ringbahn, Hubschrauber, Boote) | 🟡 | Ein- und Aussteigen getestet, nicht jedes Fahrzeug einzeln |
| Begleiter (u. a. Blitz, Pappnase, Taschi, Pixel, Flick) | 🟢 | |
| Kampf nur im Verbotenen Wald (Gegner, Bosse, Schwerter, Schmiede) | 🟡 | Kampfzone getestet, Bosskämpfe nicht automatisch |
| Prisma-Archipel: Prisma-Stadt, Ki-Garten, Runen-Arena (Kartenduelle, Deck-Editor), Datenhain (Datenwesen Pixel) | 🟢 | |
| 20 Minispiele (Runner, Flug, Stapeln, Rhythmus, Memory, Elfmeter, Frequenz, Runen-Duell …) | 🟡 | Laufen alle an, Schwierigkeit noch nicht abgestimmt |
| Sammeln: Angeln, Käfer, Buddeln, Sterne, Erfolge | 🟢 | |
| Karte, Tagebuch, Rucksack, Läden, Gesten, Schlafen, Schnellreise über Weltensteine | 🟢 | Figur schaut nach der Schnellreise zum Ziel |
| Tag und Nacht | 🟢 | |

## Arbeitsstand 14.10.2026, 14 Uhr (Fokus: Inhalte & Spielbarkeit)

Erledigt in dieser Runde:
- Neuer Bot-Test `source/e2e/autoplay.mjs`: spielt den Story-Modus automatisch und meldet, wo eine Quest feststeckt.
- Neuer Test `source/e2e/targets.mjs`: prüft, ob jedes Quest-Ziel einen Ort hat (Lichtsäule/Minikarte).
- Zielmarkierung neu (`src/gameplay/targets.ts`): findet Ziele jetzt auch über Gegenstände, Minispiel-Automaten, Rätsel, Hebel, Truhen und Fotostellen. Wartet die Hauptgeschichte auf eine Weltgeschichte, zeigt die Lichtsäule auf deren Auftraggeber bzw. nächstes Ziel. Ist man auf der falschen Insel, zeigt sie erst zur richtigen Insel.
- Ergebnis: Ziele ohne Markierung von 66 auf etwa 30 reduziert.

Nächste Schritte (genau hier weitermachen):
1. Restliche ~30 Ziele ohne Ort mit `via:`/`at:` versehen – Liste mit `node e2e/targets.mjs` (z. B. w_stadt „Uhr stellen“ → via 'uhr', Drachenflug → 'himmelstor', Elfmeter-Turnier → 'pokal', Märchen → 'wunschbrunnen', Floß → 'flossbau', Atlantis-Herz → 'herz', Wand → 'rissige_wand', Ki-Turnier → 'gong', Runen → 'runen_pult', Datenhain → 'datennest', Zuhause → 'home_wardrobe'/'home_bed', Angeln → Ententeich, Training/Wald → FOREST).
2. Bot (`autoplay.mjs`) nach jeder Korrektur laufen lassen, bis die Story bis zum Finale durchläuft. Zuletzt hing er in der Stadt beim Uhr-Rätsel (fehlende Markierung, siehe 1).
3. Spielbarkeit: Intro-Text blockiert am Anfang; Startpunkt ist leer (Rosi 52 m entfernt) – Start näher an Rosi setzen. Auf dem Handy ist die Auflösung zu niedrig (pixelig).
4. Inhalte: Welten wirken leer – mehr Bewohner, Nebenaufgaben und Details je Welt.

## Geplant / offen

- ⏳ Unit-Tests (Spielstand-Migration, Quest-Engine, Physik) mit `node --test`
- ⏳ Test auf echten Handys (Touch-Steuerung, Leistung, Hochformat)
- ⏳ Gesamtdurchlauf des Story-Modus bis zum Finale
- ⏳ Balancing der Minispiele und Kämpfe
- ⏳ README für Entwickler im Ordner `bunte-insel2/`
- Keine Online-Funktionen geplant, solange sie nicht wirklich funktionieren (keine Schein-Features)

## Tests

Browsertests mit Playwright liegen in `source/e2e/`:
- `smoke.mjs` – Start, Editor, ein paar Schritte laufen
- `flow.mjs` – Prolog-Quest, Kapitel 1, Fahrzeug, Wald-Kampfzone, Fenster, Speichern und Neu laden
- `worlds.mjs` – Rundgang durch alle 20 Welten im freien Modus (Laden/Entladen, NPCs, Browserfehler)

Letzter Lauf: alle bestanden, keine Fehler in der Browserkonsole.

## Änderungen außerhalb von `bunte-insel2/`

Nur rückwärtskompatible Einträge:
- `games.js` – neuer Eintrag `bunte-insel2` (Titel mit „DEMO TEST“)
- `guides.js` – Anleitung und Steuerung für `bunte-insel2`
- `tools/build-sync.js` – Ordnername `source` wird beim Offline-Paket übersprungen (enthält nur Quellcode von Bunte Insel 2; kein anderes Spiel hat diesen Ordner)
- `sync/manifest.json`, `sync/catalog.json` – mit `node tools/build-sync.js` neu erzeugt

Bunte Insel 1 (`bunte-insel/`) wurde nicht verändert.
