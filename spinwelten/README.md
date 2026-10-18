# Spinwelten 3D – Das Abenteuer der Wunderinseln

„Drehen. Entdecken. Bauen. Erobern.“ Insel-Abenteuer mit Runenmaschine, eigener Grafik und eigenen Figuren
(keine fremden Marken oder Vorlagen). Reines HTML/CSS/JS, 3D mit Three.js r128 aus `../vendor/`, Töne und Musik
werden im Browser erzeugt. Kein Echtgeld, keine Käufe, keine Werbung.

## Inhalt

- Runenmaschine mit großen Walzen (3 Reihen sichtbar), Einsatz ×1 bis ×50 (Freischaltung über Inseln), Auto-Drehen per Gedrückthalten,
  Gewinnanzeige mit Münzregen. Sturm- und Expeditionsziele werden direkt auf der Insel angetippt. Auf Handys startet echtes Vollbild.
- Animationen: Kivi sitzt auf der Maschine und reagiert auf jeden Spin; Sturm mit Gewitterwolke, Blitz, Trümmern und Rauch;
  Mira hüpft zur Grabstelle, gräbt, der Fund steigt aus dem Boden; Truhenkarten drehen sich nacheinander auf (Tippen = sofort).
  Jedes Ergebnis steht vor der Animation fest (`crypto.getRandomValues`), Erwartungswerte in `js/core/economy.js`.
- 30 schwebende Inseln in 6 Kapiteln, je 5 Bauwerke × 5 Stufen, Weltenatlas mit Luftschiff-Reise, Neues Spiel+.
- Freundliche Stürme und Schatzexpeditionen gegen 16 Computer-Inseln (laufen in Echtzeit weiter, Rache, Schutzorbs).
- 240 Sammelkarten in 30 Alben, 4 Truhenarten, Reliktladen, Tausch mit Computer-Spielern.
- 12 Begleiter (Kivi & Co.) mit Stufen, Training und Pflege; 60 Story-Aufgaben, Tages-/Wochenziele, 12 Events, 66 Erfolge.
- 8 Minispiele (`js/game/minigames.js`), Tutorial (überspringbar), Deutsch und Englisch.
- Online: private Räume für 2–8 Spieler per Code, Link oder QR (`cloud/fire-peer.js`), Gastgeber ist die Autorität,
  freie Plätze übernehmen Computer-Spieler. Modi: Inselrennen, Schatzduell, Weltenhilfe. Kein freier Chat.
- Speichern: automatisch im Browser, 2 Speicherplätze, Export/Import, Google-Spielstand über `cloud/anmacha-cloud.js`.
- Steuerung: Touch, Maus/Tastatur, Controller – alle Tasten umbelegbar. Grafikstufen Niedrig/Mittel/Hoch/Auto.

## Aufbau

```
index.html        Ladebildschirm, lädt js/boot.js (lädt alles mit echtem Fortschritt)
js/core/          Zufall, Wirtschaft, Speicher, Uhr        js/data/   Welten, Karten, Aufgaben, Begleiter, Bots, Events …
js/game/          Spielregeln (ohne DOM, in Node testbar)   js/render/ Three.js-Szenen (Insel, Maschine, Atlas, Figuren)
js/ui/            Oberfläche, Fenster, Abläufe, Tutorial    js/net/    Online-Räume, optionaler Server-Client
```

## Tests

```
node --test spinwelten/tests/*.test.cjs # Daten, Spielregeln (100 000 Spins, 40 Karrieren, Protokoll …), Minispiele
node spinwelten/tests/careers.cjs 1000   # 1000 simulierte Spielerkarrieren (einige Minuten)
```

## Optionaler Server

Für Online-Konto, Angriffe auf echte Spieler, Ranglisten und Teams gibt es `../spinwelten-backend/` (eigener Node-Server,
siehe dessen README). Ohne eingetragene Adresse (`window.SPINWELTEN_API_BASE` in `index.html` oder in den Einstellungen)
läuft das Spiel vollständig ohne Server.
