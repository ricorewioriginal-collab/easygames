# AnMaCha Quest RPG – Quelltext (Three.js + Vite)

Gleiches Spiel wie die frühere Godot-Fassung (Karten, Werte, Texte, Kampfregeln 1:1), neu als eigenständiges Web-Spiel in modernem 3D.

```
npm install
npm run dev      # Entwicklung (http://localhost:5173)
npm test         # Selbsttest: Karten, Balance, komplettes Durchspielen aller Reiche
npm run build    # schreibt nach ../anmacha-quest-rpg (wird eingecheckt)
```

Nach dem Bauen im Repo-Hauptordner `python3 tools/make-pwa.py anmacha-quest-rpg` und `node tools/build-sync.js` ausführen.

- `src/data.js` – Karten, Helden, Fertigkeiten, Items, Gegner, Themen
- `src/logic.js` – reine Spielregeln (ohne Grafik, in Node testbar)
- `src/game.js` – Spielablauf: Titel, Karte, Dialoge, Menü, Kampf, Speichern
- `src/view.js`, `src/battle.js`, `src/fx.js`, `src/shaders.js` – 3D-Darstellung
- `src/ui.js` – Oberfläche (HUD, Menüs, Kreuzmenü, Touch-Stick)
- `src/godotsave.js` – übernimmt einmalig alte Spielstände der Godot-Fassung
- Grafikstufe: automatisch nach Gerät und Bildrate, `?q=0|1|2` erzwingt eine Stufe; `?debug` aktiviert F8/F9

Die 3D-Modelle liegen nur einmal im Repo, in `../anmacha-quest-rpg/models/` (Lizenzen dort in `LIZENZEN.md`).
