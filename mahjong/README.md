# Mahjong 3D – Jadepalast

Mahjong Solitaire in echtem 3D. by RicoReWi × AnMaCha. Live: https://ricorewioriginal-collab.github.io/easygames/mahjong/

## Dateien

| Datei | Inhalt |
|---|---|
| `js/engine.js` | Regeln (rein, ohne DOM): freie Steine, Paare, lösbares Mischen (Rückwärts-Abbau), Tipp, Rückgängig, Punkte/Kombos, Speichern einer Partie |
| `js/layouts.js` | 29 Layouts als Höhenkarten, Reise (8 Welten × 6 Level, Zielzeiten), Tagesrätsel aus dem Datum |
| `js/faces.js` | Alle 42 Steinbilder per Canvas in eine Textur (zwei Stile; ohne chinesische Schrift gezeichnete Ersatzzeichen) |
| `js/render.js` | Three.js: alle Steine als 2 InstancedMeshes, Zeichnen nur bei Änderungen/Animationen, Kamera passt sich dem freien Bereich an |
| `js/input.js` | Touch (Zoom/Drehen/Verschieben), Maus, Tastatur, eigener Gamecontroller-Code (deshalb kein `../gamepad.js`) |
| `js/audio.js` | Klänge und ruhige Musik per WebAudio |
| `js/save.js` | Spielstand `easygames.mahjong.v1` mit Prüfung/Reparatur, 26 Erfolge (`anmacha-gameach.mahjong`) |
| `js/ui.js`, `js/main.js`, `index.html`, `style.css` | Menüs, HUD, Ablauf der Spielarten |

## Regeln in Kurzform

- Frei: nichts liegt (auch nicht halb) darauf, und links oder rechts ist kein direkter Nachbar.
- Gleiche Bilder passen; alle Blumen untereinander, alle Jahreszeiten untereinander.
- Jedes Brett wird lösbar gemischt (außer „Immer lösbar mischen“ ist aus); „Mischen“ verteilt die Reststeine wieder lösbar.
- Sterne: ★ geschafft, ★★ unter der Zielzeit, ★★★ zusätzlich ohne Tipp und Mischen.

## Tests

```
node --test mahjong/tests/*.test.js   # Layouts, Regeln, alle 48 Level + 40 Tagesrätsel lösbar, Mischen, Speichern
python3 -m http.server 8765 &         # im Repo-Hauptordner
node mahjong/tests/smoke.js [ordner]  # Browser: ganze Partie per Maus und Touch, Tastatur, Fortsetzen, Handy hoch/quer, Iframe
```

## Grenzen

- Ohne WebGL startet das Spiel nicht (Fehlermeldung mit „Erneut versuchen“).
- Der Gamecontroller wurde nur über die Standard-Belegung (Gamepad-API) programmiert, nicht an echter Hardware getestet.
- Google-Speicher ist eingebunden, die Live-Anmeldung wurde nicht geprüft.
