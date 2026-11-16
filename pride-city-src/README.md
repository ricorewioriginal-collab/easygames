# Pride City – Quellcode

Relaunch von **Gay Life!** als „Pride City – Ein Leben in allen Farben“. Queere 3D-Lebenssimulation in Rainbow City.
Technik: Vite, TypeScript, three.js (aktuell), eigene kleine Engine. Ausgabe nach `../pride-city/` (wird mit eingecheckt, die Apps laden diesen Ordner).

```
npm install              # KayKit-Modelle lädt `npm run build` selbst (scripts/fetch-assets.mjs)
npm run dev               # Entwicklung (http://localhost:5173, Pfade zu ../gamepad.js usw. fehlen dort)
npm test                  # Unit-Tests (Spielstand, Migration, Story)
npm run build:easygames   # Typprüfung, Build, Kopie nach ../pride-city (Manifest/Service Worker/card.jpg bleiben)
```
Danach im Repo: `python3 tools/make-pwa.py pride-city`, `node tools/build-sync.js`, `node tools/check-games.js`.
E2E-Test (Browser, SwiftShader): Server im Repo starten (`python3 -m http.server 8080`), dann `node pride-city-src/tests/e2e.mjs`.

## Aufbau

| Ordner/Datei | Aufgabe |
|---|---|
| `src/engine/Engine.ts` | Renderer (ACES, sRGB, Schatten), Spielschleife, Szenenwechsel, automatische Grafikstufe (Auflösung, Schatten, Bloom nur auf „hoch“) |
| `src/engine/Input.ts` | Ein Eingabe-System für Tastatur, Maus, Touch und Gamecontroller → Aktionen (`confirm`, `back`, `menu`, Richtungen, `sprint` …) mit Wiederholung für Menüs |
| `src/engine/Assets.ts` | glTF laden (einmal, mit Fortschritt), Kopien mit eigenem Skelett |
| `src/engine/Audio.ts` | Musik und Effekte live per WebAudio erzeugt (keine Audiodateien) |
| `src/engine/Save.ts` | Spielstand `prideCity.save` (Cloud-Präfix `prideCity.`), Migration, Übernahme aus Gay Life! (`anmachaGayLife`) |
| `src/ui/` | Konsolen-Menü (`Menu`), Ladebildschirm, Dialog mit Antworten, HUD mit Zielmarkern, Touch-Stick und -Tasten, Kapitelkarten |
| `src/game/Actor.ts` | KayKit-Figur: Waffen weg, Pride-Umfärbung je Palette und Hautton, weiche Animationswechsel |
| `src/game/World.ts` | Rainbow City aus City-Builder-Bits plus Pride-Deko, Tag/Nacht, Verkehr, Kollision |
| `src/game/CityScene.ts` | Laufen, Kamera, Figuren, Interaktion, Sticker, Titel-Kamerafahrt |
| `src/game/story.ts` | Figuren, Kapitel, Ziele, Gespräche, Entscheidungen (`save.flags`) |
| `src/game/life.ts` | Bedürfnisse, Stimmung, Uhrzeit und Tageswechsel, Tagesziele (aus Gay Life! übernommen) |
| `src/game/jobs.ts` | Fünf Jobs mit Situationen, Lohn, Stufen und Beförderung |
| `src/game/social.ts` | Dating-Profile, Dates, Gesundheit (Checkpoint, PrEP, Tests), Feed, Gerüchte, Glossar, 18+-Regeln |
| `src/game/HomeScene.ts` | Begehbare Wohnung (KayKit Furniture und Restaurant Bits): Bett, Dusche, Herd, TV, Kleiderschrank |
| `src/game/CreatorScene.ts` | Charakter-Editor |
| `src/game/minigames/DanceScene.ts` | Tanz-Battle in 3D |
| `src/game/Game.ts` | Ablauf, alle Menüs (Titel, Pause, Optionen, Story, Minispiele, Orte, Handy mit Apps, Schichten, Wohnungsaktionen) |

Regeln: Ein Bedienkonzept für alle Geräte (Richtungen wählen, A bestätigt, B zurück, Y/Start Menü). Neue Daten in `defaults()` (Save.ts) eintragen.
Assets nur mit freier Lizenz, jede Quelle in `public/CREDITS.md`.

## Stand und Fahrplan

Siehe [`FAHRPLAN.md`](FAHRPLAN.md).
