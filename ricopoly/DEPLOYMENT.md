# Veröffentlichung

RicoPoly ist Teil von easygames und wird mit dem Repo über GitHub Pages ausgeliefert: `https://ricorewioriginal-collab.github.io/easygames/ricopoly/`.

## Nach Änderungen

Aus dem Repo-Stamm:

```bash
node --test ricopoly/tests/*.test.js     # Regel-, Online- und Texttests
python3 tools/make-pwa.py ricopoly       # PWA-Block, manifest.webmanifest, sw.js, Symbole (braucht Pillow)
node tools/build-sync.js                 # sync/manifest.json und sync/catalog.json für die Apps
node tools/check-games.js                # Katalog prüfen
```

Bei Änderungen an JS/CSS die `?v=`-Nummern in `index.html` erhöhen und in `games.js` `EASYGAMES_BUILD` hochzählen.

## Kosten

- GitHub Pages: kostenlos.
- PeerJS: öffentlicher Vermittlungsserver, kostenlos, ohne Zusage zur Verfügbarkeit. Für mehr Verlässlichkeit kann ein eigener PeerServer betrieben werden; dafür müssten in `js/net.js` beim Erzeugen von `Peer` die Optionen `host`, `port` und `path` ergänzt werden.
- Firebase (Cloud-Speicher): Spark-Tarif reicht; RicoPoly schreibt gebündelt (wenige Schreibzugriffe pro Partie).

## Offline

Der Service Worker (`sw.js`, von `make-pwa.py`) lädt zuerst aus dem Netz und fällt bei Ausfall auf den Cache zurück. Nach einem ersten Besuch funktionieren Einzelspieler und Spiel an einem Gerät dann offline; Online-Räume und Google-Anmeldung brauchen Internet.
