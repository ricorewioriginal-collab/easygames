# TASCHI v2 – Arbeitsstand und nächste Schritte

Stand: 16. Oktober 2026. Diese Datei ist der Übergabepunkt für die nächste Arbeitssitzung.

## Live

- `taschi/index.html` startet **TASCHI v2** (Einstieg `src/main.js`).
- Die bisherige Version bleibt unter `taschi/classic.html` spielbar (`game.js` unverändert).
- Alte Spielstände (lokal und AnMaCha-Cloud, Präfix `easygames.taschi.eight-lights.v1`) werden beim Laden automatisch migriert. Version-1-Daten werden nie gelöscht.

## Update 16. Oktober 2026 (Trainer-Figur)

- Charaktererstellung: Männlich, Weiblich oder Divers wählen, eigener Name, Trainer-Outfit (Trainerkappe, kurzärmelige Trainerjacke über Shirt, fingerlose Handschuhe, Ballgürtel, Rucksack). Vorlagen `PLAYER_PRESETS` (m/w/d) und Körperformen `teenM`/`teenF`/`teen` in `src/engine/characters.js`; Bildschirm `creatorScreen()` in `src/ui/screens.js` (Modi `new`, `upgrade`, `wardrobe`).
- Umkleiden: Menü › Trainer › Umkleiden oder Kleiderschrank im Wohnhaus (`game.openWardrobe()`). Das Geschlecht steht in `save.player.gender`.
- Alte Spielstände ohne Geschlecht bekommen beim ersten Laden einmal die Charaktererstellung angeboten (`game.offerLookUpdate()`, Merker `flags.lookOffered`).
- Kollision: Kreise im Laufgitter markieren jetzt jede berührte Zelle (vorher blieben Schilder, Laternen und dünne Bäume begehbar). Brunnen, Bänke, Laternen, Blumenbeete, Höhlenbogen, Schreine und Gildenlager sind fest (`L.props`, `addProps()` in `src/logic/layout.js`). Draußen prüft die Spielfigur einen Ring um die Füße. Bäume, die das Grafikprofil weglässt, blockieren nicht mehr.
- Brücken: Straßen werden metergenau auf Flüsse geprüft. Vorher fehlte in Region 4 die Brücke, die Flüsterhöhle war unerreichbar. `tests/walkgrid.test.mjs` prüft jetzt alle Regionen auf Erreichbarkeit.
- Titelmenü: Die Einstellungen öffnen sich über dem Titel und zeigen nur die Optionen. Dialoge liegen über Menüs.
- Browsertest `node tests/e2e/character.mjs [screenshot-ordner]`.

## Update 16. Oktober 2026

- Wiesen (`grassAt()` in `src/logic/layout.js`) steuern Grasdarstellung, Begegnungen und Minikarte gemeinsam. Regionen 260×260, Tore bei z = ±122.
- Bälle: Effekte in `ballRate()` (`src/logic/items.js`), Fangchance in `catchChance()` (`src/logic/battle.js`).
- Arten: 260, Erweiterung im Block `EXTENDED` in `src/data/species.js` (hinten angehängt, Dex-Nummern unverändert). Lernsets aus `TYPE_LEARN` (`src/data/moves.js`).
- Attacken-Verwaltung: `forgetMove`, `relearnableMoves`, `teachMove`, `levelUp` in `src/logic/monster.js`; UI `openMoveManager` in `src/ui/menus.js`; Abfrage beim Lernen `game.offerMove()`.
- Rivale: `RIVAL_STAGES`/`rivalTrainer` in `src/data/trainers.js`, Texte `RIVAL` in `src/data/story.js`, Auslöser `game.maybeRival()` nach jeder Regionsreise.
- Browsertest `node tests/e2e/expansion.mjs [screenshot-ordner]` (Playwright z. B. über `NODE_PATH=/opt/node-tools/node_modules`).
- Offener Fehler 1 behoben: Beim Reiterwechsel wurde die Einblend-Animation neu gestartet und blieb im Test bei Deckkraft 0 hängen. Neu gerenderte Menüs erscheinen jetzt ohne Animation (`.screen.noanim`).

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
