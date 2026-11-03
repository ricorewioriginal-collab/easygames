# Leuchtfeuer – Das Spiel zum Roman (Quelltext)

Offizielles easygames-Spiel zum Roman „Leuchtfeuer“ von RicoReWi. Three.js + Vite, gebaut nach `../leuchtfeuer/`.

```bash
npm install
npm test                 # Spielregeln (Kapitel, Leuchtturm, Plakat, Bude, Deich-Lauf, Fall 14)
npm run build:easygames  # baut nach ../leuchtfeuer, danach PWA-Dateien und App-Dateiliste
```

Zum Ausprobieren das Repo-Hauptverzeichnis mit einem Webserver ausliefern (z. B. `python3 -m http.server`) und
`/leuchtfeuer/` öffnen – die gemeinsamen Dateien (`../figuren/`, `../gamepad.js`, `../device.js`, `../cloud/…`) werden zur Laufzeit geladen.

| Datei | Inhalt |
|---|---|
| `src/core.js` | Kapitel, Figuren, Spielstand und die Regeln aller fünf Spiele (ohne Grafik, in Node testbar) |
| `src/engine.js` | Renderer, Himmel/Wetter, Meer, Texturen, Figuren, Herumlaufen, Kamera |
| `src/clothes.js` | Stoffkleidung über den Figuren aus `../figuren/` (wie in „Ich bin das Licht“) |
| `src/sets.js` | Schauplätze: Schule, Kunstraum, Räucherei, Halle, Zimmer, Aula, Markt, Kap Rotenhorn, Strand, Küche, Garage, Kabine |
| `src/games/*.js` | Leuchtturm, Plakat, Zwei mit Zwiebeln, Gegenwind (Deich) |
| `src/main.js` | Menüs, Geschichte, Fall 14, Buch, Steuerung (Tastatur, Touch, Controller über `../gamepad.js`) |
| `public/book.json` | der Roman (aus dem Druck-PDF), `public/img/` Cover und Illustrationen |
