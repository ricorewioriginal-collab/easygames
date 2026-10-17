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
```

## Steuerung

| | Handy/Tablet | Maus/Tastatur | Controller |
|---|---|---|---|
| Kamera verschieben | ein Finger ziehen | linke Maustaste ziehen, WASD/Pfeile | linker Stick |
| Drehen / Zoomen | zwei Finger drehen / spreizen | rechte Maustaste ziehen, Q/E, Mausrad, +/- | rechter Stick |
| Aktion wählen | antippen (lang drücken = Menü) | Klick | A (Mitte des Bildes) |
| Figur wechseln | Porträt oben links | Tab / Porträt | LB / RB |
| Tempo | Knöpfe oben | Leertaste, 1–3 | Steuerkreuz links/rechts |
| Bau-/Kaufmodus | Knöpfe rechts | N / B | – (Bauen per Touch/Maus) |
| Handy, Karte | Knöpfe rechts | P, M | X, Back |
| Menü / Zurück | ☰ | Esc | Start / B |

Alle Tasten lassen sich in den Einstellungen umbelegen. In Dialogen bewegt das Steuerkreuz den Fokus, A bestätigt, B schließt.

## Inhalt

- 3 Bezirke, 25 Grundstücke (10 Wohnhäuser, 7 Treffpunkte, 8 Arbeitsorte), 4 Fertighäuser + leeres Grundstück
- 3 Familien mit Geschichte, eigene Familien bis 8 Personen, 47 Stadtbewohner mit Tagesablauf
- 174 Objekte (159 kaufbar), 138 Interaktionen, 44 soziale Handlungen, 12 Rezepte
- 24 Merkmale, Lebensziele, 12 Fähigkeiten, 9 Berufe (3 vor Ort spielbar), Schule
- 46 Zufallsereignisse, 3 Geschichten mit je 8 Aufgaben, Jahreszeiten und Wetter

## Dokumentation

[Architektur](docs/ARCHITECTURE.md) · [Regeln](docs/RULES.md) · [Tests](docs/TESTING.md) · [Stand](docs/STATUS.md) · [Assets](docs/ASSETS.md) · [Bereitstellung](docs/DEPLOYMENT.md) · [Einbindung](docs/INTEGRATION.md)
