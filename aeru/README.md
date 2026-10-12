# AERU – Die Sterneninseln

Eigenständiges 3D-Drachenabenteuer für Desktop- und Handybrowser. Start: `index.html`; kein Build, kein Backend, keine externen Downloads. Im Hauptverzeichnis der Spielesammlung eingetragen.

Aeru, ein junger Drache, folgt einer durchgehenden Geschichte über sechs Inseln und einen siebten Epilog-Garten: Der Wind verstummt, eine Spur führt zur Sternenwarte, dort wartet Vesper – doch der Kampf gegen ihn ist erst die Mitte. Die Wahrheit liegt in der Kristallklamm, das Finale in den Morgenruinen. Nach dem Abspann kann frei weitergespielt werden.

## Weitere Dokumente

- [STORY.md](STORY.md) – Kapitel, Figuren, Quests und Dialogfolge
- [GAMEPLAY.md](GAMEPLAY.md) – Steuerung, Flug, Kampf, Bosse, Sammelobjekte, Einstellungen, Grafikstufen
- [TESTING.md](TESTING.md) – automatische Tests, Gerätetests und Messwerte
- [PROGRESS.md](PROGRESS.md) – ehrlicher Stand: was getestet ist, was offen ist, bekannte Grenzen

## Steuerung (Kurzfassung)

| | Tastatur | Touch |
|---|---|---|
| Bewegen | WASD / Pfeile | linker Stick |
| Kamera | Maus ziehen, Q/E, Mausrad, C = hinter Aeru | rechts wischen |
| Springen / Flügelschlag / Gleiten | Leertaste (halten = höher, in der Luft halten = gleiten) | SPRUNG |
| Flug ein/aus | G (im Flug Leertaste halten = steigen) | FLUG |
| Ausweichen / im Flug sinken | Umschalt | ROLLE |
| Windstoß | F | WIND |
| Sprechen, Tor | R / Enter | REDEN oder Hinweis antippen |
| Tagebuch / Pause | J / Esc oder P | ☰ / Ⅱ |

## Aufbau

| Datei | Inhalt |
|---|---|
| `content.js` | Inselgestalt: Plattformen, Aufwinde, Ringe, Laternen, Rastpunkte, Licht, Musik |
| `story.js` | Figuren, Kapitel, Quests, Dialoge, Reaktionen, Belohnungen (reine Daten) |
| `quests.js` | Quest-Engine (Zustände, Bedingungen, Fortschritt) und Spielstand-Migration, ohne DOM |
| `game.js` | Darstellung (Three.js r128), Physik, Kampf, Bosse, Oberfläche, Audio, Speichern |
| `tests/` | automatische Tests, siehe TESTING.md |

Spielstand: `aeru-save-v1` (Format Version 3, sieben Welten inkl. Himmelstruhen; ältere Stände ohne Nachtgarten laden unverändert). Alte Stände (Version 1/2) werden beim Laden übernommen; das Original bleibt unter `aeru-save-backup`. Vor einem neuen Abenteuer wird der alte Stand unter `aeru-save-previous` gesichert. Einstellungen liegen unter `aeru-settings`.

`?test` aktiviert ausschließlich lokale Testinstrumentierung (`window.aeruTest`).

## Urheber und Lizenzen

Figuren, Namen, Dialoge, Levelgestaltung, Polygonmodelle, SVG und Musik wurden für dieses Spiel erstellt. Keine übernommenen Assets, Namen, Geschichten oder Audiodateien anderer Spiele. Eine rechtliche Markenprüfung der Namen ist nicht erfolgt.

Three.js: Copyright 2010–2026 three.js authors, MIT-Lizenz, siehe `vendor/LICENSE.three.txt`. Übriger Code unter der Lizenz des übergeordneten Repositories.
