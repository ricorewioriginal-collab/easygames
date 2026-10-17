# Release-Checkliste

- [ ] `cd ricorail/source && npm ci`
- [ ] `npm run typecheck` ohne Fehler
- [ ] `npm test` (Vitest) grün
- [ ] `npm run build` – erzeugt `ricorail/index.html`, `assets/ricorail-<hash>.js`, `sw.js`, `version.json`
- [ ] `npm run test:e2e` grün (Desktop, Handy, offline)
- [ ] Im Repo-Hauptordner: `node tools/build-sync.js`, `python3 tools/make-pwa.py ricorail` (RicoRail steht in `EIGENE`, hat eigenes Manifest und eigenen Service Worker), `node tools/check-games.js` ohne Fehler
- [ ] Auf einem echten Handy (Android/iOS) und am PC kurz spielen: Menü, eine Fahrt, Pause, Speichern
- [ ] Hinweis „Simulation, kein offizielles Produkt der DB“ in Menü, Pause, Hilfe und Lizenzen vorhanden
- [ ] Online-Eintrag zeigt „in Entwicklung“, `modes.js` hat keinen Online-Eintrag für `ricorail`
- [ ] Keine neuen GitHub Actions, Deployments oder Serverdienste
- [ ] Änderungen nur per Pull Request nach `main`
