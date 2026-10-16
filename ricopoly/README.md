# RicoPoly 3D – Baue dein Imperium!

**Würfeln. Kaufen. Handeln. Herrschen!**

RicoPoly 3D ist ein Grundstücks-Brettspiel im Browser: 40 Felder, 28 Grundstücke, Häuser und Hotels, Versteigerungen, Handel, Hypotheken, Gefängnis und Bankrott. Alle Namen, Karten, Figuren und Grafiken sind eigene Inhalte.

Starten: `ricopoly/index.html` über einen Webserver öffnen (z. B. GitHub Pages oder `python3 -m http.server` im Repo-Stamm). Es gibt keinen Build-Schritt.

## Funktionen

| Bereich | Umfang |
|---|---|
| Spielmodi | Klassisch (bis einer übrig ist), Schnell (20 Runden, 2 Startgrundstücke, 300 RC über Start), Eigene Regeln (Startgeld, Runden-/Zeitlimit, Zugzeit, Gebäudevorrat, Kaution, Versteigerung, Topf auf Frei Parken, doppeltes Startgeld) |
| Mitspieler | 1–5 Computergegner (leicht, mittel, schwer), 2–6 Personen an einem Gerät (mit Übergabe-Bildschirm), Online 2–6 per Raumcode oder Link, öffentliche Räume, Bots im Online-Raum |
| Welten | Metropolis, Fantasy Kingdom, Future City – je eigene 40 Feldnamen (DE/EN), 20 Ereignis- und 20 Gemeinschaftskarten, Farben, Kulisse, Musik und Umgebungsgeräusche |
| Figuren | 16 animierte 3D-Figuren mit 15 Animationen und 5 Emotes; Editor für Farben, Outfit, Accessoire, Siegerpose, Lieblings-Emote; 4 Figuren werden über Erfolge freigeschaltet |
| 3D | Brett mit Gebäuden, Besitzmarkierungen, Würfelphysik, Kamera (drehen, zoomen, folgen, Übersicht), Partikel, Qualitätsstufen mit automatischer Absenkung, Energiesparmodus |
| Bedienung | Touch (Wischen, Pinch), Maus, Tastatur, Gamecontroller über `../gamepad.js` |
| Profil | Name, Avatar (Emoji oder eigenes Bild), Statistiken, Verlauf, 14 Erfolge, Freunde, lokale Rangliste, Export und Löschen aller Daten |
| Speichern | Automatisch nach jeder Aktion, 3 manuelle Plätze, Online-Gastgeber-Stand; optional per Google in der Cloud (gemeinsamer easygames-Cloud-Speicher) |
| Sprache | Deutsch und Englisch, komplettes Regelhandbuch und interaktives Tutorial |
| Ton | Eigene, im Browser erzeugte Musik und Klänge (keine fremden Aufnahmen) |

## Dateien

```
ricopoly/
  index.html, style.css      Seite und Oberfläche
  js/rules.js                Regel-Engine (rein, deterministisch, ohne DOM)
  js/ai.js                   Computergegner
  js/net.js                  Online: Gastgeber-Logik und PeerJS-Anbindung
  js/worlds.js               Welten, Feldnamen, Kartentexte
  js/characters.js           3D-Figuren und Animationen
  js/board3d.js              3D-Szene, Brett, Würfel, Kamera
  js/audio.js                Musik und Klänge (Web Audio)
  js/profile.js              Profil, Erfolge, Spielstände
  js/i18n.js                 Texte DE/EN, Regelhandbuch
  js/game.js                 Menüs, Dialoge, Spielablauf
  tests/                     Regel-, Online-, Text- und Browsertests
```

Weitere Dokumente: [ARCHITECTURE.md](ARCHITECTURE.md), [GAME_RULES.md](GAME_RULES.md), [FIREBASE_SETUP.md](FIREBASE_SETUP.md), [DEPLOYMENT.md](DEPLOYMENT.md), [TESTING.md](TESTING.md), [CHANGELOG.md](CHANGELOG.md).

## Bekannte Grenzen

- Online läuft Browser zu Browser über PeerJS (öffentlicher Vermittlungsserver `0.peerjs.com`). Der Browser des Gastgebers ist die prüfende Instanz, nicht ein eigener Server. Schließt der Gastgeber den Tab, pausiert die Partie, bis er den Raum über „Fortsetzen“ wieder öffnet.
- In sehr restriktiven Netzen (symmetrisches NAT ohne TURN-Server) kann eine direkte Verbindung scheitern.
- Die Rangliste ist lokal (eigenes Profil und gespeicherte Freunde). Eine weltweite Rangliste ist nicht umgesetzt.
- Freunde sind eine lokale Liste; Einladungen laufen über den Raumlink.
- Der Name „RicoPoly“ sollte vor einer kommerziellen Veröffentlichung markenrechtlich geprüft werden.
