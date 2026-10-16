# Tests

## Automatisch (Node, ohne Browser)

```bash
node --test ricopoly/tests/*.test.js
```

48 Tests, Stand 2026-10-16 alle grün:

- `rules.test.js` (37): Würfel-Verteilung, Bewegung und Startgeld, Pasch und Gefängnis, Kauf, Versteigerung, Miete (Straße, Gruppe, Häuser, Bahnhof, Werk, Hypothek), Bauen und Verkaufen mit Gebäudevorrat, Hypotheken, Handel mit Gegenangebot und Verfall, alle Karten, Mischen, Steuern und Topf, Schulden, Bankrott an Spieler und an Bank, Aufgeben, Zeit- und Rundenlimit, Schnellmodus, doppelte und veraltete Aktionen, Speichern/Laden mit Wiedergabe, Validierung beschädigter und unvollständiger Stände, gleichmäßiger Hotel-Abbau bei leerem Häuservorrat, Rangliste nach Ausscheide-Reihenfolge, kein Ausräumen von Schuldnern per Handel, KI-Gedächtnis je Partie, **komplette Bot-Partien bis zum Sieger** mit Prüfung der Invarianten (Geldsumme, Gebäudevorrat, Besitz) nach jeder Aktion.
- `net.test.js` (8): Lobby und Bereit-Status, Zustand ohne Zufallsgenerator beim Client, kein Handeln für fremde Plätze, doppelte Netzwerkaktionen, gleichzeitige Angebote, Abbruch mit Vertretung und Wiederbeitritt per Schlüssel, Nachrichtenflut, **komplette Online-Partie über den Gastgeber** (simulierte Verbindungen) mit identischem Endstand bei allen.
- `i18n.test.js` (3): Jeder Textschlüssel aus `game.js` und `index.html` existiert auf Deutsch und Englisch, beide Sprachen haben dieselben Schlüssel, Platzhalter und Rückfall.

## Browser

`tests/browser-smoke.js` (Playwright, Chromium mit Software-WebGL): Menü, Einrichtung mit eigenem Rundenlimit, Spielzüge, Karten, Besitz-, Handels-, Pause- und Protokolldialog, Speichern in Platz 1, Siegerbildschirm, Fortsetzen-Liste.

Wirklich ausgeführt (2026-10-16):

| Umgebung | Ergebnis |
|---|---|
| Chromium (Playwright, headless), 1280 × 800 | Profil anlegen, Figur, Welt, Menü, Partie gegen 3 Computer über 3 Runden bis zum Siegerbildschirm, alle Dialoge; keine Fehler in der Konsole |
| Chromium, Handy-Ansicht 390 × 844 mit Touch | Gleicher Ablauf über 2 Runden bis zum Siegerbildschirm; keine Fehler |

Nicht getestet: Firefox, Safari/iOS, echte Android-Geräte, echte GPUs (die Testumgebung rendert per Software mit ca. 15–17 FPS), Gamecontroller-Hardware.

## Nicht getestet

- **Online zwischen echten Geräten:** Der Vermittlungsserver `0.peerjs.com` ist aus der Testumgebung nicht erreichbar. Geprüft ist die gesamte Gastgeber-Logik mit simulierten Verbindungen, nicht die WebRTC-Strecke selbst.
- **Google-Anmeldung und Cloud-Abgleich:** kein Google-Konto in der Testumgebung.
- **Endlose klassische Partien:** Ohne Runden- oder Zeitlimit können zwei sehr reiche Computergegner theoretisch ewig weiterspielen (in einem von 40 zufälligen Bot-Testspielen nach über 40.000 Runden ohne Bankrott). Für reine Bot-Runden daher ein Rundenlimit wählen.
- **Lange Partien im Browser:** Eine vollständige klassische Partie wurde nur in Node (Bots) bis zum Ende gespielt, im Browser nur Partien mit Rundenlimit.
