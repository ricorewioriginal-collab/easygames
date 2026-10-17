# Testbericht – RicoRail Simulator 3D (17.10.2026)

## Automatisch
| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | ohne Fehler |
| Vitest: Strecken, Netzbaukasten, Betrieb, Fahrplanverkehr aller 8 Strecken (je 2 h ohne Unfall/Verklemmung), Stellwerk, Speicher (13), Editor (9), Ton, Fahrzeug-/Führerstandsmodelle (41), 3D-Welt (4), Bahngesellschaft (3), Szenarien | siehe Abschnitt „Stand der Testsammlung“ |
| Szenario-Machbarkeit (`sc-final`): alle 64 Szenarien vollständig simuliert – Personen-, Güter-, Wetter- und Fantasieszenarien mit KI-gefahrenem Spielerzug, Rangierszenarien mit Skript, Stellwerksszenarien mit Disponent | **64/64 bestanden** |
| Browser-E2E (Chromium, Software-Rendering): Desktop 1280×800, Handy 390×844 mit Touch, Offline-Neustart über Service Worker | **14/14 bestanden** (Menü, Fahrt laden, Anfahren, Kameras, Karte, Pause/Beenden, Touch-Hebel, kein waagerechtes Scrollen, keine Skriptfehler, offline startbar) |
| `node tools/check-games.js` | 0 Fehler (9 ältere Warnungen anderer Spiele) |

## Nicht getestet
- Echte Handys und Tablets (Android/iOS) und echte GPUs: nur Chromium mit Software-Rendering (1–3 FPS, nicht aussagekräftig für Leistung).
- Gamepad an echter Hardware, Sprachausgabe der Ansagen, Ton im Browser (nur Logik-Tests).
- Android-App von Easygames (lokale App-Dateien) – Aufbau ist darauf ausgelegt (klassisches Skript, keine Module, kein CDN), aber nicht auf einem Gerät geprüft.
- Szenarien wurden von der KI bzw. einem Skript gefahren, nicht von Menschen; die Schwierigkeit für Spieler ist nicht abgestimmt.

## Stand der Testsammlung
Wird nach dem letzten Gesamtlauf ergänzt.
