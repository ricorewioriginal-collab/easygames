# AERU – Die Sterneninseln

Eigenständiges 3D-Drachenabenteuer für Desktop- und Handybrowser. Start: `index.html`; kein Build, kein Backend, keine externen Downloads. Im Hauptverzeichnis der Spielesammlung eingetragen.

Aeru, ein junger Drache, folgt einer durchgehenden Geschichte über sechs Inseln und einen siebten Epilog-Garten: Der Wind verstummt, eine Spur führt zur Sternenwarte, dort wartet Vesper – doch der Kampf gegen ihn ist erst die Mitte. Die Wahrheit liegt in der Kristallklamm, das Finale in den Morgenruinen. Nach dem Abspann kann frei weitergespielt werden.

## Weitere Dokumente

- [STORY.md](STORY.md) – Kapitel, Figuren, Quests und Dialogfolge
- [GAMEPLAY.md](GAMEPLAY.md) – Steuerung, Flug, Kampf, Bosse, Sammelobjekte, Einstellungen, Grafikstufen
- [TESTING.md](TESTING.md) – automatische Tests, Gerätetests und Messwerte
- [PROGRESS.md](PROGRESS.md) – ehrlicher Stand: was getestet ist, was offen ist, bekannte Grenzen

## Steuerung (Kurzfassung)

| | Tastatur | Touch | Controller (PS / Switch) |
|---|---|---|---|
| Bewegen | WASD / Pfeile | linker Stick | linker Stick (analog) |
| Kamera | Maus ziehen, Q/E, Mausrad, C = hinter Aeru | rechts wischen | rechter Stick, L1/R1, R3 |
| Springen / Flügelschlag / Gleiten | Leertaste (halten = höher, in der Luft halten = gleiten) | SPRUNG | ✕ / B |
| Flug ein/aus | G (im Flug Leertaste halten = steigen) | FLUG | R2 / ZR |
| Rammstoß / im Flug sinken | Umschalt | RAMM | □ / Y, L2 / ZL |
| Feueratem | F | FEUER | ○ / A |
| Sprechen, Tor, Portal | R / Enter | REDEN oder Hinweis antippen | △ / X |
| Tagebuch / Pause | J / Esc oder P | ☰ / Ⅱ | Share / − · Options / + |

## Aufbau

| Datei | Inhalt |
|---|---|
| `content.js` | Inselgestalt: Plattformen, Aufwinde, Ringe, Laternen, Rastpunkte, Licht, Musik |
| `story.js` | Figuren, Kapitel, Quests, Dialoge, Reaktionen, Belohnungen (reine Daten) |
| `quests.js` | Quest-Engine (Zustände, Bedingungen, Fortschritt) und Spielstand-Migration, ohne DOM |
| `game.js` | Darstellung (Three.js r128), Physik, Kampf, Bosse, Oberfläche, Audio, Speichern |
| `models/` | freie CC0-Modelle (Bäume, Felsen, Gras, Gegner), erzeugt mit `tools/make-aeru-models.mjs` |
| `rueckweg.js` | Rückweg-Knopf in Bunte Insel und Zotik bei `?from=aeru` |
| `tests/` | automatische Tests, siehe TESTING.md |

Spielstand: `aeru-save-v1` (Format Version 3, sieben Welten inkl. Himmelstruhen; ältere Stände ohne Nachtgarten laden unverändert). Alte Stände (Version 1/2) werden beim Laden übernommen; das Original bleibt unter `aeru-save-backup`. Vor einem neuen Abenteuer wird der alte Stand unter `aeru-save-previous` gesichert. Einstellungen liegen unter `aeru-settings`.

`?test` aktiviert ausschließlich lokale Testinstrumentierung (`window.aeruTest`).

## Urheber und Lizenzen

Figuren, Namen, Dialoge, Levelgestaltung, Aerus Modell, SVG und Musik wurden für dieses Spiel erstellt. Bäume, Felsen, Gras und die Gegner sind freie CC0-Modelle von Wizp und Quaternius (Herkunft: [models/LIZENZ.md](models/LIZENZ.md)). Keine Assets, Namen, Geschichten oder Audiodateien anderer Spiele. Eine rechtliche Markenprüfung der Namen ist nicht erfolgt.

Three.js: Copyright 2010–2026 three.js authors, MIT-Lizenz, siehe `vendor/LICENSE.three.txt`. Übriger Code unter der Lizenz des übergeordneten Repositories.
