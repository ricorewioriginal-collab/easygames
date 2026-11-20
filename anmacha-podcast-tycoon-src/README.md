# AnMaCha – Der Podcast: Babylon.js + Vite

Quelle des 3D-Renderers für `../anmacha-podcast-tycoon/`. Vite baut daraus `../anmacha-podcast-tycoon/babylon/amc-babylon.js`
(eine Datei, eingecheckt, damit Homepage, App und Windows-Client ohne Build laufen).

```bash
cd anmacha-podcast-tycoon-src
npm install
npm run build        # danach im Hauptordner: node tools/build-sync.js
```

## Aufbau
- `src/babylon.js` – nur die benötigten Babylon-Teile (hält das Paket klein).
- `src/renderer.js` – Brücke: zeichnet die Szenen der Spielmodule mit Babylon.js (gleiche Schnittstelle wie der bisherige Renderer,
  `AMC.World.renderer`). Instanzen teilen Geometrie, Skelette laufen über Babylon-Knochen, Texturen/Lichter/Nebel werden übernommen.
- `src/look.js` – Optik je Grafikstufe: weiche Schatten (PCF), GlowLayer für Neon/ON AIR/Bildschirme, MSAA/FXAA, Schärfe, Farbkurven, Vignette.
- `src/fx.js` – Babylon-Partikel (Konfetti nach Medien-Aufträgen).

Das Spiel lädt das Paket in `src/main.js` per `import()`. Schlägt das fehl oder steht `?engine=three` in der Adresse,
zeichnet der frühere Three.js-Renderer. Nächste Stufen: Spielmodule nach und nach direkt auf Babylon umstellen.
