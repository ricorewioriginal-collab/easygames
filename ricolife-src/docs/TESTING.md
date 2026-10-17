# Tests – RicoLife 3D

## Befehle

```bash
cd ricolife-src
npm run typecheck        # TypeScript streng
npm test                 # Vitest (Unit-Tests)
npm run build:easygames  # Build nach ../ricolife/
PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e   # Playwright; PW_CHROMIUM nur, wenn Chromium nicht über Playwright installiert ist

# im Repository-Hauptordner
node tools/check-games.js
node tools/build-sync.js && node tools/build-sync.js --check && node tools/build-sync.js --strict
node tools/offline-audit.js ricolife
```

## Unit-Tests (Vitest)

| Datei | Inhalt |
|---|---|
| `tests/sim.test.ts` | Spielstart, Kochen → Essen → Abwasch, Warteschlange, Reservierungen, Geld ohne Doppelbuchung, Rechnungen, Beziehungen, Spielstand hin und zurück, Ablehnung kaputter Dateien, Grundstücksabgleich (Mehrspieler), Geschichten, 3 Spieltage ohne Fehler, Bereinigung von Gast-Steckbriefen, Korrekturen aus der Code-Prüfung (Buchungsschlüssel, Feier, Startzuhause, Snack, Schicht nach Laden, Schulzeit) |
| `tests/build.test.ts` | Wände, Räume und Böden, Kaufen/Verkaufen, Fertighäuser, Rückgängig |
| `tests/cas.test.ts` | Haushaltsprüfung, Zufallsfiguren |
| `tests/templates.test.ts` | Bau-Vorlagen gültig und begehbar |
| `tests/object-mesh.test.ts` | jedes Objekt/Grundstück ohne NaN und im Dreiecksbudget |
| `tests/human.test.ts` | Figuren- und Haustiermodelle |

## Browser-Tests (Playwright, `e2e/game.spec.ts`)

A Menü → eigene Familie → Editor → Live-Spiel · B Kochen/Essen + Warteschlange · C Kaufmodus → Platzieren → Geld → Speichern → Laden ·
D Bewohner ansprechen → Beziehung → Spielstand · E Zeitraffer → Arbeit → Lohn → Alterung · F Handy hoch/quer (HUD, Tippen, Bauen, kein Seitwärts-Scrollen) ·
G Controller · H Offline nach erstem Besuch · I Einbettung in der Übersicht · J Update-Hinweis · K Fehlerfälle (Import, Cloud offline, kein WebGL) ·
L Haus mit Treppe · M Mehrspieler über echtes Firebase (Gast tritt bei, Befehl und Chat kommen an)

Bildschirmfotos landen in `test-results/shots/` (Hauptmenü, Editor, Stadt Tag/Nacht, Interaktion, Kaufmodus, Handy-HUD hoch/quer).

## Ergebnisse (17.10.2026)

| Prüfung | Ergebnis |
|---|---|
| `npm run typecheck` | ohne Fehler |
| `npm test` | 6 Dateien, 83 Tests bestanden |
| `npm run test:e2e` | 14 bestanden, 25 übersprungen, 0 fehlgeschlagen (Desktop A–E, G–M; Handy hoch/quer F) |
| `node tools/check-games.js` | 50 Spiele, 0 Fehler (9 Warnungen betreffen andere Spiele) |
| `node tools/build-sync.js` (`--check`, `--strict`) | aktuell, ohne Fehler |
| `node tools/offline-audit.js ricolife` | ok, keine fehlenden Dateien |

Übersprungen heißt: Desktop-Abläufe laufen nicht zusätzlich auf den Handy-Profilen und der Handy-Test F nicht auf Desktop.

Beim Testen gefundene und behobene Fehler: Der Kaufkatalog verdeckte auf 1280×720 die Bildschirmmitte (jetzt höchstens 38 % der Höhe). Die Kopfzeile ragte auf schmalen Handys über den Rand. Eine Figur lief einer weggehenden Person endlos hinterher (jetzt Abbruch nach 10 Versuchen).

Nicht auf echter Hardware getestet (siehe [STATUS.md](STATUS.md)).
