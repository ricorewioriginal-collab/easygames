# AnMaCha Podcast Tycoon 3D – Das totale Studio-Chaos!

Podcast-Wirtschaftssimulation in 3D mit Marco und Andrew. Fanprojekt, kein offizielles Produkt; der echte Podcast: [anmacha.de](https://www.anmacha.de).

## Spielen

- **Karriere:** 60 Hauptmissionen in 6 Kapiteln, 24 Nebenaufträge, 3 Enden, danach Endlosmodus. Drei Schwierigkeitsstufen.
- **Kreativmodus** (ohne Geldgrenze) und **Herausforderungen** mit eigenem Speicherplatz.
- **Stadt:** 8 Viertel mit begehbaren Innenräumen, 12+ Figuren, 10 Gast-Typen.
- **Baumodus:** Wände, Böden, Türen, Fenster, über 70 Objekte in 12 Kategorien, Rückgängig/Wiederholen, Wegprüfung.
- **Folge produzieren:** Thema (60 Themen, 6 Rubriken) → Recherche → Gast → Technik → Aufnahme → Mehrspur-Schnitt → Verpackung → Veröffentlichen → Bericht.
- **24 Minispiele**, Party für 1–4 an einem Gerät, 🌐 **Online-Quizshow** über `../cloud/fire-peer.js` (Beitritt per Code, Link oder QR; Links über `EasyGamesLink.share`).
- **Speichern:** 3 Plätze + Autosave, Schlüssel `anmachaPodcastTycoon.<platz>.v1` (saveSchema 1) mit `.lastGood`-Sicherung, Google-Sync über `../cloud/anmacha-cloud.js`.

## Aufbau

Klassische Skripte, alles am globalen `PT`. `src/main.js` lädt die Dateien der Reihe nach (mit Ladebalken und Wiederholung).

| Ordner | Inhalt |
|---|---|
| `src/core` | Hilfsfunktionen, deterministischer Zufall (`PT.rand`), Texte (`i18n.js`) |
| `src/data` | Rubriken, Objekte, Personen, Viertel, Wirtschaft, Missionen, Quiz, Klänge |
| `src/sim` | Reine Spiellogik ohne DOM: `sim.js` (Wirtschaft, Produktion, Missionen), `build.js` (Raster, Wände, Wege) |
| `src/storage` | Speicherplätze, Migration, Autosave |
| `src/audio` | WebAudio-Klänge und Musik ohne Dateien |
| `src/minigames` | 24 Minispiele + `harness.js`, siehe [README](src/minigames/README.md) |
| `src/world` | Three.js-Welt (r128 aus `../vendor/three-r128.min.js`), Modelle, Wegfindung |
| `src/ui` | Menüs, HUD, Fenster, Baumodus, Produktion, Schnitteditor |
| `src/party` | Online-Quizshow |

## Tests

```
node tools/test-podcast-tycoon.cjs            # Daten, Bauregeln, Karriere-Durchläufe, Speichern
node tools/test-podcast-tycoon-minigames.cjs  # alle 24 Minispiele: Gewinn- und Verlust-Bot
node tools/test-podcast-tycoon-editor.cjs     # Schnitteditor
node tools/test-podcast-tycoon-online.cjs     # Online-Quizshow mit Netz-Attrappe
node tools/test-podcast-tycoon-world.cjs      # 3D-Welt (ohne Grafikkarte)
```

Nach Änderungen: `node tools/build-sync.js`, `node tools/check-games.js`.
