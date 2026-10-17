# FUNKBLASEN – Das große Bubble-Shooter-Abenteuer

Bubble-Shooter mit Funki, dem Funkgeist. by RicoReWi × AnMaCha. Live: https://ricorewioriginal-collab.github.io/easygames/funkblasen/

## Dateien

| Datei | Inhalt |
|---|---|
| `engine.js` | Regeln (rein, deterministisch, ohne DOM): Sechseckgitter, Flugbahn, Treffer, Spezialblasen, Punkte, Zustandsmaschine `Session` |
| `levels.js` | 150 Level (10 Welten × 15), Tagesaufgabe, Endlos, Freies Spiel, Designs |
| `save.js` | Spielstand `easygames.funkblasen.v1` mit Prüfung/Reparatur, 30 Erfolge, Münzen |
| `renderer.js` | Three.js-Darstellung (echte 3D-Kugeln, Welten-Kulissen, Partikel) – zeichnet nur, entscheidet nichts |
| `input.js` | Touch, Maus, Tastatur, eigener Gamecontroller-Code (deshalb kein `../gamepad.js`) |
| `audio.js` | Klänge und Musik per WebAudio erzeugt (keine Audiodateien) |
| `ui.js`, `main.js`, `index.html`, `style.css` | Menüs, HUD, Ablauf |

## Regeln in Kurzform

- Gitter „odd-r“: Reihe hat 11 oder 10 Zellen (versetzt). Mindestens 3 gleiche Farben platzen, lose Gruppen fallen (doppelte Punkte).
- Bombe, Schalter, Kristall und Stern lösen aus, wenn direkt daneben etwas platzt. Steine: erster solcher Treffer = Riss, zweiter = Bruch.
- Eis taut neben der gelandeten oder einer geplatzten Kugel auf (Schalter: alles). Farbwandler wechseln nach jedem Schuss die Farbe, außer man landet direkt daneben.
- Die Warteschlange gibt nur Farben aus, die noch auf dem Feld liegen.

## Tests

```
node --test funkblasen/tests/*.test.js     # Regeln, Speicher, alle 150 Level + Tagesaufgaben per Test-Spieler (ca. 15 s)
python3 -m http.server 8765 &              # im Repo-Hauptordner
node funkblasen/tests/smoke.js             # Browser-Rauchtest mit Playwright (Desktop, Handy hoch/quer, Iframe)
```

## Grenzen

- Ohne WebGL startet das Spiel nicht (es erscheint eine Fehlermeldung mit „Erneut versuchen“); es gibt keine 2D-Ersatzdarstellung.
- Die Lösbarkeit der Level ist durch einen gierigen Test-Spieler belegt, nicht durch Menschen getestet; die Schwierigkeit kann sich anders anfühlen.
- Google-Speicher ist eingebunden, die Live-Anmeldung wurde nicht geprüft.
