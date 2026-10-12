# 🧩 Checkliste: Neue Welten und Inhalte

Das Spiel wächst ständig. Damit **Story-Modus, Handbuch, Lösungsbuch, Codes und Tests** mitwachsen, gilt bei jeder neuen Insel / jedem neuen größeren Inhalt:

## 1. Story-Modus (automatisch + zum Nachschärfen)
- Der Story-Modus (`js/storymode.js`) **sperrt neue Welten automatisch**: jedes Objekt `BI.<NAME>` mit `x`, `z`, `R`, `bridge` und `entry` (weiter als 150 m von der Mitte) wird erkannt, bekommt Glaswand, Schild und **3 noch unbenutzte Sticker** als Aufgaben (`auto: true`).
- **Besser (bitte tun):** die Welt von Hand eintragen – mit Symbol, Namen und 3 passenden Aufgaben (Sticker-IDs aus `js/kids.js`):
  ```js
  BI.addStoryIsland({ key: 'NEUEINSEL', icon: '🏝️', name: 'Neue Insel', req: ['sticker_a', 'sticker_b', 'sticker_c'] });
  ```
  (oder direkt in der Liste `BI.STORY_ISLES` in `js/storymode.js`). Die Aufgaben sollen **vor** dieser Welt erreichbar sein (keine Henne-Ei-Schleife).
- Neue Sticker für die Welt in `js/kids.js` (Liste `ST`) anlegen – sie erscheinen automatisch in Lösungsbuch, Quest-Log und „Wohin?“.
- „Wohin?“-Ziele (`DEST` in `js/main.js`) der Welt werden im Story-Modus automatisch mit 🔒 markiert, solange die Welt gesperrt ist (Erkennung über die Position).
- Der Test `tests/story.mjs` (15 Welten) und `tests/buch.mjs` (Automatik für neue Welten) müssen grün bleiben; bei einer neuen Welt die Zahl in `tests/story.mjs` anpassen.

## 2. Handbuch & Lösungsbuch
- Text steht in `js/buch-data.js`: ein Satz zur neuen Welt in `welten` (Handbuch) und – wenn es Rätsel gibt – ein Abschnitt in `loesung`.
- Welten, Sticker, Aufgabenlisten (`log()` der Insel-Module) und Codes erscheinen **automatisch**. Neue Insel-Module deshalb in die Liste `worldLogs` in `js/main.js` aufnehmen.
- Danach Markdown neu erzeugen: `node bunte-insel/tools/gen-docs.mjs` (schreibt `docs/HANDBUCH.md`, `docs/LOESUNGSBUCH.md`, `docs/CHEATS.md`). `tests/buch.mjs` prüft, dass die Dateien aktuell sind.

## 3. Geheimcodes
- Neue Specials/Cheats in `BI.CHEATS` (`js/cheats.js`) eintragen und in `K.redeem` behandeln. Codes für **neue Inhalte** gehören dazu: `ALLESFREI` schaltet über `save.cheat.open` auch künftige Welten frei; neue Freischaltungen (Items, Fortschritte) bitte in `unlockAll()` ergänzen.

## 4. Tests & Doku
- Je Insel ein Test in `tests/` (Muster: `tests/raetsel.mjs`), Aufgaben in `log()` + `tests/laden.mjs` (Skripte nur einmal einbinden, Ladezähler `all=` in `index.html` erhöhen).
- Türen: massive Gebäude werden über `BI.registerDoors` (`js/innen.js`) mit Tür versehen – neue Gebäude dort ergänzen.
- README-Abschnitt zur neuen Welt anlegen.
