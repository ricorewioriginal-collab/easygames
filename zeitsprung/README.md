# ZEITSPRUNG – Die große Zeitreise-Show

Alle Zeitsprung-Ausgaben (Wissen, Movie, Radio, Castingshow, Kinderserien, Eurovision) in einem Spiel, plus Gesamtmodus „Zeitsprung-Nacht“.

## Aufbau

- `index.html`, `app.js`, `style.css`: Shell mit Titel, Hauptmenü, Spieler-Menü, Einstellungen und Gesamtmodus.
- `studio.js`: 3D-TV-Studio (Three.js r170, gebündelt in `lib/three-studio.js`) mit Bühne, LED-Wand, Moving Heads, Publikum,
  Konfetti, Moderator Vito und vier Spielerpulten mit KayKit-Figuren (`figuren/`, gemeinsame Animationen in `figuren/anim.glb`).
- Die Ausgaben laufen **unverändert** im iframe `#show` (`../zeitsprung-<id>/?zs=1`). `embed.js` (in jeder Ausgabe geladen)
  schaltet das alte Studio ab, lädt `embed.css` und leitet die Sprachausgabe an Vito weiter. Die Shell liest den Spielstand nur aus
  dem DOM und bedient die Ausgabe über deren Knöpfe – Fragen, Regeln und Spielstände bleiben, wie sie sind.
- `input.js`: Touch, Maus, Tastatur, Gamepads (Xbox/PlayStation/Switch), Buzz!-Buzzer und PS Move per WebHID, mit Erkennung der
  Eingabeart und Zuordnung der Geräte zu Spielern.
- `voice.js`: Vitos Stimme. Vorproduzierte Edge-TTS-Clips (`vo/<schlüssel>.mp3`, Liste in `vo/index.json`); fehlende Sätze spricht
  speechSynthesis mit einer Edge-Neural-Stimme.

## Stimme neu erzeugen

1. `python3 -m http.server 8765` im Repo-Ordner, dann `node tools/zeitsprung-voice/collect.cjs` → `vo/lines.json`.
2. Push auf einen Branch: der Workflow `.github/workflows/zeitsprung-voice.yml` erzeugt die MP3s mit `gen-edge.py` und checkt sie ein.

## Credits

- Figuren: KayKit Adventurers und Skeletons von Kay Lousberg (CC0).
- Three.js (MIT, `lib/three-LICENSE.txt`).
- Schriften: Unbounded und Inter (SIL OFL, `fonts/`), Helvetiker (Three.js-Beispiele, Lizenz in `fonts/`).
- Stimme: Microsoft Edge TTS (en-US-BrianMultilingualNeural, spricht Deutsch), mit Moderator-Klangbearbeitung.
