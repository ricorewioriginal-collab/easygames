# TASCHI v2 – Arbeitsstand und nächste Schritte

Stand: 14. Oktober 2026. Diese Datei ist der Übergabepunkt für die nächste Arbeitssitzung.

## Live

- `taschi/index.html` startet **TASCHI v2** (Einstieg `src/main.js`).
- Die bisherige Version bleibt unter `taschi/classic.html` spielbar (`game.js` unverändert).
- Alte Spielstände (lokal und AnMaCha-Cloud, Präfix `easygames.taschi.eight-lights.v1`) werden beim Laden automatisch migriert. Version-1-Daten werden nie gelöscht.

## Erledigt und geprüft

- Logikschicht: Kampf (Einzel/Doppel), KI (4 Stufen), Items, Fangen, Entwicklung, Speicherformat v2 mit Prüfsumme, Backup und v1-Migration, 7 Rätseltypen mit Lösern, Quests, Fortschritt, Trainer, Gilde, Liga.
- `npm test`: 24 Tests grün, inklusive simuliertem Komplett-Durchlauf (alle drei Starter bis Sternenmeister).
- Browsertest `node tests/e2e/intro.mjs [screenshot-ordner]` läuft komplett ohne Browserfehler: Titel, Charaktererstellung, Intro, Sonnenhain, Professor Ulme, Starterwahl, Einführungskampf, erster Auftrag, Heilzentrum, Laden, Fangen, Pausemenü, Speichern und Neuladen.

## Seit dem letzten Browsertest behoben (noch nicht erneut im Browser geprüft)

- Gegner-HUD im Kampf zeigte „nullnull“.
- Kampfkamera saß zu nah am eigenen Taschi.
- Kamera blickte nach dem Betreten von Innenräumen zur Tür. Sie bleibt jetzt im Raum.
- Kamera rutschte in Gebäude. Sie wird jetzt vor Gebäuden herangezogen.
- Erster Fokus im Menü lag auf dem Schließen-Knopf.

## Offene Fehler

1. **Pausemenü-Reiter „Taschidex“ und „Karte“:** Der Bildschirm ist laut DOM vorhanden (`.screen`), aber auf Screenshots nicht sichtbar. Die anderen Reiter werden korrekt angezeigt. Vermutung: Fehler beim Rendern dieser Reiter (Taschidex: Porträt-Thumbnails über `preview.thumbnail`; Karte: SVG/`html`-Attribut in `h()`). Prüfskript: alle Reiter anklicken und Screenshots vergleichen.
2. Im Browser noch ungetestet: Regionsrätsel, Arena-Herausforderung und Arenaleitung, Champion, Regionswechsel über die Tore, Schattengilde (inklusive Forschungsstation Glutland), Höhlen, Legenden-Schreine, Sternengipfel, Sternenliga, Abspann und Postgame.
3. Nicht hier testbar, muss auf echter Hardware geprüft werden: Android im Hoch- und Querformat, Tablets, Bluetooth- und USB-Controller, Leistung auf Mobilgeräten.

## Nächste Schritte

1. Fehler 1 beheben, `tests/e2e/intro.mjs` erneut laufen lassen.
2. Browsertest „Region 0 komplett“ (Rätsel, Arena, Champion, Tor nach Korallküste) mit vorbereiteten Spielständen (`startSeeded()` in `tests/e2e/helpers.mjs`).
3. Pro Region einen Screenshot-Durchlauf (`tools/viewer.html?mode=map&region=N`) und Smoke-Test (Laden, Tor, Heilzentrum, Arena-Tür).
4. Gilde, Sternengipfel und Liga mit vorbereiteten Spielständen testen.
5. Hoch- und Querformat-Screenshots (zum Beispiel 412×860 und 860×412) für Kampf, Menü und Dialoge.
6. Dokumentation ergänzen: README, Steuerung, Architektur, Migration, Lizenzen, Changelog.

## Werkzeuge

- Entwicklungsserver ohne Abhängigkeiten: `node tools/serve.mjs 8080`, dann `http://localhost:8080/taschi/` öffnen.
- Asset-Viewer: `tools/viewer.html?mode=map&region=0..16`, `?mode=creatures&start=0&count=24`, `?mode=chars`.
- Screenshots: `node tools/shot.mjs "<pfad>" out.png 1280 720`.
- Playwright wird aus einer globalen Installation geladen. Lokal: `npm i -D playwright-core`, Chromium über `npx playwright install chromium`.
