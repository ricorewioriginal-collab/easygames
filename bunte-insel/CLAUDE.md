# Bunte Insel – Regeln für Änderungen

Das Spiel ist dicht geschriebenes ES5-ähnliches JS (global `BI`, THREE r128). Kinder-Spiel: Bilder, Vorlesen, kein Lesen vorausgesetzt. Sparsam bauen, gezielte Tests (`bunte-insel/tests/*.mjs`, Playwright).

**Bei jeder neuen Welt / jedem größeren Inhalt zwingend** (Details: `docs/NEUE-INHALTE.md`):
1. **Story-Modus erweitern** – `BI.addStoryIsland(...)` bzw. `BI.STORY_ISLES` in `js/storymode.js` (3 Sticker-Aufgaben); neue Welten werden sonst automatisch gesperrt.
2. **Handbuch & Lösungsbuch** – `js/buch-data.js` ergänzen, Insel-`log()` in `worldLogs` (main.js) aufnehmen, `node bunte-insel/tools/gen-docs.mjs` ausführen (`docs/*.md` müssen aktuell sein, `tests/buch.mjs`).
2b. **Inselgeschichte** – `BI.INSELSTORY` (`js/inselstory.js`) + Abschluss-Sticker `geschichte_<key>` in `js/kids.js`; Freischaltbares (Tiere/Begleiter) in `BI.PETS`.
3. **Geheimcodes** – `js/cheats.js` (`unlockAll`, ggf. neue Specials).
4. **Türen/Gebäude** – `BI.registerDoors` (`js/innen.js`).
5. Test + README-Abschnitt; Cache-Versionen/Ladezähler in `index.html` anpassen.

Spielstand-Kompatibilität wahren (nur Felder ergänzen). Namen fremder Marken nur „inspiriert“, original/neutral benennen.
