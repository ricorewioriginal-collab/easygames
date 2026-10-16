# Übergabe

Lies das zuerst, wenn du an RicoVille weiterarbeitest (Mensch oder neue Sitzung).

## Wo was liegt
- Quelltext: `ricoville-src/` (TypeScript, Three.js, Vite). Gebautes Spiel: `ricoville/` (eingecheckt, nicht von Hand ändern).
- Einbindung in easygames: `games.js` (Eintrag `ricoville`), `guides.js`, `README.md`, `tools/make-pwa.py` (`EIGENE`), `tools/test-cloud-games.cjs` (Cloud-Browsertest).
- Stand je Bereich: [STATUS.md](STATUS.md). Regeln: [GAMEPLAY_RULES.md](GAMEPLAY_RULES.md). Code-Aufbau: [ARCHITECTURE.md](ARCHITECTURE.md).

## Arbeitsweise
1. `cd ricoville-src && npm ci`
2. Ändern, dann `npm test`, `npm run test:e2e`, `npm run docs:catalog` (wenn Kataloge geändert).
3. `npm run build:easygames`, im Repo-Hauptordner `node tools/check-games.js`.
4. Bei Änderungen an Shell-Dateien die Cache-Version in `public/sw.js` erhöhen; in `games.js` `EASYGAMES_BUILD` hochzählen.
5. Spielstand-Format ändern → `SCHEMA_VERSION` in `core/city.ts` erhöhen und `migrate()` in `core/save.ts` erweitern, plus Test.

## Regeln, die bleiben müssen
- Keine Namen, Texte, Grafiken, Klänge oder Logos von CityVille/Zynga; keine Behauptung einer Verbindung.
- Keine Geheimnisse im Repo oder Client. Alles, was andere Spieler betrifft, nur über Server-Funktionen.
- Nichts als getestet bezeichnen, was nicht getestet wurde.
- Andere Spiele, deren Caches und Spielstände nicht anfassen.

## Nächste sinnvolle Schritte
1. Auf echten Geräten spielen (iPhone/Safari, Android), Balancing der ersten Stunde nachschärfen.
2. Eigene Symbole je Gebäude im Baumenü (aus den 3D-Modellen gerendert).
3. Nachbarn: Firebase-Zugang klären, Cloud Functions nach FIREBASE_SETUP.md, Emulator-Tests.
4. Mehr Abwechslung: Ereignisse (Feste, Jahreszeiten), weitere Aufgabenketten.
