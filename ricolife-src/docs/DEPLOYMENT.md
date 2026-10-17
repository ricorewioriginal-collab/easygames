# Bereitstellung

## Bauen

```bash
cd ricolife-src
npm ci
npm run build:easygames   # Typprüfung, Vite-Build, Kopie nach ../ricolife/
```

Der Build nutzt `base: './'`, alle Pfade sind relativ. Ergebnis: `ricolife/index.html`, `ricolife/assets/*` (gehasht), `manifest.webmanifest`, `sw.js`, `favicon.svg`, `card.svg`, `icons/*`. Der Ordner `ricolife/` wird eingecheckt und von GitHub Pages unter `…/easygames/ricolife/` ausgeliefert.

## PWA / Offline

- Eigener Service Worker `sw.js` mit Scope `./` und Cache `eg-ricolife-vN` (bei Änderungen an `sw.js` Versionsnummer erhöhen). Er legt beim Installieren die Startseite und alle in `index.html` verlinkten Bundles ab, damit schon der erste Neustart offline klappt.
- Navigation: Netz zuerst, offline aus dem Cache. Gehashte Dateien: Cache zuerst.
- Eine neue Fassung wartet, bis der Hinweis „✨ Ein Update ist bereit – Jetzt aktualisieren“ angetippt wird. Vorher wird der Spielstand gespeichert (`app.saveNow()`), dann `EG_SKIP_WAITING`, danach Neuladen. Alte Caches `eg-ricolife-*` werden beim Aktivieren gelöscht.
- In der Android-App (WebView, `appassets.local`), in iframes und im E2E-Modus wird kein Service Worker registriert.
- Das Google-Speichern (`../cloud/anmacha-cloud.js`, `data-board="off"`) ist optional; ohne Netz startet das Spiel normal. Mehrspieler lädt `../cloud/fire-peer.js` erst bei Bedarf.

## Android-App

Die easygames-App synchronisiert über `sync/manifest.json` und `sync/catalog.json` (Prüfsummen je Datei). Nach dem Build im Repo-Hauptordner:

```bash
node tools/build-sync.js          # schreibt die Sync-Dateien
node tools/build-sync.js --check  # CI-Prüfung
```

Neue oder geänderte Dateien lädt die App vollständig herunter und übernimmt sie beim nächsten Start; es ist kein neues APK nötig.
