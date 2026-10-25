# Bunte Insel – Vite-Build

Bündelt die Spieldateien von `bunte-insel/js` (Reihenfolge aus `window.BI_FILES` in `bunte-insel/index.html`) zu einer
verkleinerten Datei `bunte-insel/js/bunte-insel.min.js`. GitHub Pages und die App laden dann ein Skript statt 89.

```bash
cd bunte-insel-src
npm install
npm run build   # Bündel + Version in index.html
npm run dev     # Vite-Server, lädt bei Änderungen neu: http://localhost:5173/bunte-insel/index.html?dev=1
npm run check   # passt das Bündel zum Quellcode? (läuft auch in der CI, ohne npm-Pakete)
```

Die Spieldateien bleiben klassische Skripte mit globalem `BI`; der Build hängt sie aneinander und verkleinert sie mit esbuild
(in Vite enthalten), ohne globale Namen umzubenennen. `node_modules/` wird nicht eingecheckt.
