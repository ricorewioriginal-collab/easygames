# Auslieferung

easygames ist eine statische GitHub-Pages-Seite. RicoVille wird wie PRISMRUSH gebaut und das Ergebnis eingecheckt:

```bash
cd ricoville-src
npm ci
npm test && npm run test:e2e
npm run build:easygames     # → ../ricoville/ (index.html, assets/, sw.js, manifest, Icons, card.svg)
```

- Eintrag in `games.js` (`id: 'ricoville'`), Anleitung in `guides.js`, Zeile in `README.md`. `EASYGAMES_BUILD` hochzählen, damit Einbettungen neu laden.
- `ricoville` steht in `tools/make-pwa.py` unter `EIGENE` (eigenes Manifest und eigener Service Worker, wird nicht überschrieben).
- Die Dateien unter `sync/` erzeugt die CI auf `main` selbst.
- Service Worker `sw.js`: Cache `eg-ricoville-vN`. Bei Änderungen an der Shell (Icons, Manifest) die Nummer erhöhen. Neue Fassungen warten, bis der Spieler „Jetzt aktualisieren" tippt; der Spielstand wird vorher gespeichert. Der Worker greift nur innerhalb von `/ricoville/` ein und lässt andere Spiele unberührt.
