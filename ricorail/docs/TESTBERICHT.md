# Testbericht – RicoRail Simulator 3D (17.10.2026)

## Automatisch
| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | ohne Fehler |
| Vitest: Strecken, Netzbaukasten, Betrieb, Fahrplanverkehr aller 8 Strecken (je 2 h ohne Unfall/Verklemmung), Stellwerk, Speicher (13), Editor (9), Ton, Fahrzeug-/Führerstandsmodelle (41), 3D-Welt (4), Bahngesellschaft (3), Szenarien | **159/159 bestanden** (11 Dateien) |
| Szenario-Machbarkeit (`sc-final`): alle 64 Szenarien vollständig simuliert – Personen-, Güter-, Wetter- und Fantasieszenarien mit KI-gefahrenem Spielerzug, Rangierszenarien mit Skript, Stellwerksszenarien mit Disponent | **64/64 bestanden** |
| Browser-E2E (Chromium, Software-Rendering): Desktop 1280×800, Handy 390×844 mit Touch, Offline-Neustart über Service Worker | **14/14 bestanden** (Menü, Fahrt laden, Anfahren, Kameras, Karte, Pause/Beenden, Touch-Hebel, kein waagerechtes Scrollen, keine Skriptfehler, offline startbar) |
| `node tools/check-games.js` | 0 Fehler (9 ältere Warnungen anderer Spiele) |

## Nicht getestet
- Echte Handys und Tablets (Android/iOS) und echte GPUs: nur Chromium mit Software-Rendering (1–3 FPS, nicht aussagekräftig für Leistung).
- Gamepad an echter Hardware, Sprachausgabe der Ansagen, Ton im Browser (nur Logik-Tests).
- Android-App von Easygames (lokale App-Dateien) – Aufbau ist darauf ausgelegt (klassisches Skript, keine Module, kein CDN), aber nicht auf einem Gerät geprüft.
- Szenarien wurden von der KI bzw. einem Skript gefahren, nicht von Menschen; die Schwierigkeit für Spieler ist nicht abgestimmt.

## Stand der Testsammlung
Letzter Gesamtlauf nach dem Merge (Stand `main`, 17.10.2026): Vitest 11 Dateien / 159 Tests bestanden, Browser-E2E 14/14 bestanden.

Hinweise zur Szenarioprüfung: In g03, g04, g06 und g08 haben Rangierweichen keine Signale; das Prüfskript stellt sie entlang des Fahrwegs um, wie es ein Spieler über den Gleisplan (M) tut. Stellwerksszenarien wurden mit dem automatischen Disponenten geprüft, nicht durch Antippen von Fahrstraßen. Knappste Ergebnisse: b07 +7:49 (Grenze 10 min), b08 +9:05 (Grenze 10 min), w04 +3:57.
