# Einbindung in easygames

- **Katalog:** Eintrag `id: 'ricolife'` in `games.js` (Kachelbild `ricolife/card.svg`, Pfad `ricolife/`), `EASYGAMES_BUILD` erhöht.
- **Anleitung:** Eintrag `ricolife` in `guides.js` (Anleitung, Steuerung, Tipps).
- **Modi:** `modes.js` → `'ricolife': { online: true }`. Online-Mehrspieler über Raumcode (Firebase-Vermittlung via `cloud/fire-peer.js`); kein Handy-Pad, kein Splitscreen.
- **Cloud:** `index.html` bindet `../cloud/anmacha-cloud.js` mit `data-game="ricolife"`, `data-prefix="ricolife.save.,ricolife.profile"`, `data-mount="#cloudMount"`, `data-board="off"` ein. Der Google-Knopf erscheint im Hauptmenü. Gespeichert werden die drei Spielstände und das Profil (Einstellungen, Mehrspieler-Figur); Sicherungskopien `ricolife.bak.*` bleiben lokal.
- **Einbettung:** Das Spiel läuft direkt (`/easygames/ricolife/`), im Viewer der Übersicht und per `easygames.js`/iframe (siehe `einbinden.html`). „Zurück zur Spielebibliothek“ im Hauptmenü verlinkt `../`.
- **Android:** über `tools/build-sync.js` automatisch in `sync/catalog.json` und `sync/manifest.json`.
