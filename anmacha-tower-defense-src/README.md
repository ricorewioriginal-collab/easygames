# AnMaCha Tower Defense (Quelltext)

Three.js + Vite. Das Build-Ergebnis liegt in `../anmacha-tower-defense/` und wird eingecheckt (GitHub Pages ohne CI).

```bash
cd anmacha-tower-defense-src
npm install
npm run dev     # Entwicklungsserver
npm run build   # schreibt nach ../anmacha-tower-defense/ – danach den Ordner mit committen
```

- `src/config.js` – Spielwerte (Karten, Türme, Gegner, Schwierigkeit)
- `src/main.js` – Spiellogik, Menü/HUD, Eingabe
- `src/view.js` – Szene, Licht, Bloom, Türme/Gegner/Effekte, Kamera
- `src/audio.js` – Effekte und Musik per WebAudio
- `public/logos/` – Sender-Logos (01–13)

Qualität wird automatisch gesenkt, wenn die Bildrate dauerhaft niedrig ist. Mit `?q=1|2|3` lässt sie sich fest wählen.
