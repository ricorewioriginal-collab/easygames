# RicoLife 3D – Dein Leben. Deine Regeln.

Eigenständige 3D-Lebenssimulation für Browser, Handy und PC: Haushalt erstellen, Häuser bauen und einrichten, Bedürfnisse und Emotionen, Berufe, Freundschaften, Familie, Haustiere und drei Geschichten in der Hafenstadt Lindenhafen. Offline spielbar (PWA), optionaler Google-Spielstand, Online-Besuche mit bis zu drei Freunden.

Spielbar unter `../ricolife/` (gebauter Ordner im Repository).

## Starten (Entwicklung)

```bash
npm ci
npm run dev            # http://localhost:5173
npm run typecheck
npm test               # Vitest
npm run build:easygames  # Build nach ../ricolife/
npm run test:e2e       # Playwright (baut vorher, Chromium mit SwiftShader)
node tools/bake-models.mjs  # nur nach Änderung der Modelle in assets-src/kenney/: backt public/models/kenney.bin
```

## Steuerung

Ein Bedienkonzept für Handy, PC, TV und Konsole: dieselben Knöpfe an derselben Stelle. Mit Controller zeigen sie ihr Tastensymbol
(PlayStation ✕○□△, Switch A B X Y, Xbox – automatisch erkannt, an Nintendo-Controllern bestätigt A rechts), dazu Zielkreuz und Hinweisleiste.
Am Fernseher und an Konsolen-Browsern wird die Oberfläche größer und hält Abstand zum Bildrand (Einstellungen → Barrierefreiheit → Oberfläche).

| | Handy/Tablet | Maus/Tastatur | Controller (PlayStation / Switch) |
|---|---|---|---|
| Kamera verschieben | ein Finger ziehen | linke Maustaste ziehen, WASD/Pfeile | linker Stick |
| Drehen / Zoomen | zwei Finger drehen / spreizen | rechte Maustaste ziehen, Q/E, Mausrad, +/- | rechter Stick |
| Aktion wählen | antippen (lang drücken = Menü) | Klick | ✕ / A (Zielkreuz in der Bildmitte) |
| Eigene Aktionen, Handy | Karte unten, Knöpfe rechts | P | △ / Y, □ / X |
| Figur wechseln | Porträt oben links | Tab / Porträt | L1/R1 · L/R |
| Tempo, Stockwerk | Knöpfe oben/rechts | Leertaste, 1–3, Bild ↑/↓ | Steuerkreuz ←/→, ↑/↓ |
| Kauf-/Baumodus | Knöpfe rechts | B / N | L2/R2 · ZL/ZR |
| Bauen (Wand, Raum, Boden) | ziehen | ziehen | ✕/A Anfang, Stick, ✕/A Ende · ○/B bricht ab |
| Drehen / Abriss im Baumodus | Knöpfe | R / Entf | □/X / △/Y |
| Wände, Kamera zur Figur | Knöpfe rechts / „Fokus“ | – | L3, R3 · ○/B |
| Karte, Menü | Knöpfe rechts | M, Esc | Create/− , Options/+ |

Alle Tasten lassen sich in den Einstellungen umbelegen, Controller-Knöpfe mit Select + Start. In Menüs wählt das Steuerkreuz oder der linke Stick
räumlich (gedrückt halten wiederholt), ✕/A bestätigt, ○/B schließt, L1/R1 wechselt Reiter, der rechte Stick blättert, Schieberegler mit ←/→.

## Inhalt

- 3 Bezirke, 25 Grundstücke (10 Wohnhäuser, 7 Treffpunkte, 8 Arbeitsorte), 4 Fertighäuser + leeres Grundstück
- 3 Familien mit Geschichte, eigene Familien bis 8 Personen, 47 Stadtbewohner mit Tagesablauf
- Echte 3D-Modelle (CC0, Kenney): Laub- und Nadelbäume, Birken, Büsche, Blumen, Felsen, Baumstümpfe, Stämme und 5 Automodelle
- Konsolen-Look: weiches Comic-Licht mit Lichtkante (abschaltbar), Kollisionen mit Bäumen, Laternen, Bänken und Felsen
- 174 Objekte (159 kaufbar), 138 Interaktionen, 44 soziale Handlungen, 12 Rezepte
- 24 Merkmale, Lebensziele, 12 Fähigkeiten, 9 Berufe (3 vor Ort spielbar), Schule
- 46 Zufallsereignisse, 3 Geschichten mit je 8 Aufgaben, Jahreszeiten und Wetter

## Dokumentation

[Architektur](docs/ARCHITECTURE.md) · [Regeln](docs/RULES.md) · [Tests](docs/TESTING.md) · [Stand](docs/STATUS.md) · [Assets](docs/ASSETS.md) · [Bereitstellung](docs/DEPLOYMENT.md) · [Einbindung](docs/INTEGRATION.md)
