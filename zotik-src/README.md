# ZOTIK (Quelltext)

Three.js (0.128, fest eingebunden) + Vite. Das Build-Ergebnis liegt in `../zotik/` und wird eingecheckt (GitHub Pages ohne CI, Adresse bleibt `…/easygames/zotik/`).

```bash
cd zotik-src
npm install
npm run dev     # Entwicklungsserver
npm run build   # schreibt nach ../zotik/ – danach den Ordner mit committen, dann `node tools/build-sync.js`
```

- `index.html` – Seite, Oberfläche (CSS) und PWA-/Cloud-Skripte
- `src/main.js` – Spiel (Welt, Figuren, Kampf, Menüs, Koop)
- `src/gfx.js` – glatte Formen (Felsen, Laub, Tannen, Kristalle), Umgebungslicht, Oberflächenstruktur, Fell (Schalen-Technik)
- `src/fox.js` – Zotik nach dem Master-Sheet (Fell, Augen, Ausrüstung) und `coat()` für Fell auf fertigen Figuren
- `src/post.js` – Nachbearbeitung: Glühen, Kantenglättung, Farbabstimmung
- `public/` – Service Worker, Manifest, Minispiele, Vorschaubild (landen unverändert in `../zotik/`)

Qualität: die automatische Stufenregelung (`setQ`) schaltet bei niedriger Bildrate zuerst Fell-Schalen und Auflösung herunter, dann die Nachbearbeitung.
Debug: `?debug` an die Adresse hängen, dann steht `__zotik` in der Konsole bereit.
