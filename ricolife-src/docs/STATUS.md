# Stand – RicoLife 3D

Stand: 12.11.2026 · Spielstand-Version 1 · Service-Worker-Cache `eg-ricolife-v2`

## Fertig

- **Stadt Lindenhafen:** 3 Bezirke, 25 Grundstücke, Tag/Nacht, Jahreszeiten, Wetter, 47 Stadtbewohner mit Tagesablauf
- **Figuren:** Haushalt-Editor mit 3D-Vorschau (Aussehen, Kleidung, Merkmale, Lebensziel), Altersstufen, Haustiere
- **Leben:** 8 Bedürfnisse, Emotionen, Autonomie, Warteschlange mit Abbrechen, Reservierungen von Plätzen, Wünsche mit Wunschpunkten, Gedankenblasen, Rennen bei langen Wegen
- **Soziales:** 44 Handlungen, Freundschaft/Romantik, Familie, Nachwuchs, Einziehen
- **Beruf und Geld:** 9 Berufe (3 vor Ort spielbar), Schule, Lohn, wöchentliche Rechnungen, Haushaltsbuch
- **Bau-/Kaufmodus:** Wände, Böden, Räume, Treppen, 159 kaufbare Objekte, Fertighäuser, Rückgängig/Wiederholen, 3D-Vorschaubilder im Katalog, Hinweis am Zeiger mit Länge/Fläche und Kosten, Draufsicht beim Wechsel in den Baumodus
- **Geschichten:** 3 Geschichten mit je 8 Aufgaben, 46 Zufallsereignisse
- **Speichern:** 3 Plätze, Sicherungskopie, Export/Import, Autosave, Google-Spielstand über `anmacha-cloud`
- **Mehrspieler:** Besuch über Code mit bis zu 3 Gästen über `cloud/fire-peer.js` (Firebase-Vermittlung, WebRTC); Gastgeber rechnet, Gäste steuern ihre eigene Figur und chatten
- **Kamera:** nah und flach im Live-Modus, Mausrad zoomt zum Zeiger hin
- **Steuerung:** Touch, Maus/Tastatur (umbelegbar), Controller mit PlayStation-/Switch-/Xbox-Symbolen (automatisch erkannt), Zielkreuz, Hinweisleiste, Symbole an den Bildschirm-Knöpfen, Bauen und Kaufen komplett per Controller (L2/R2, Anfang/Ende setzen), räumliche Menü-Navigation mit Wiederholung, Reiter mit L1/R1, Vibration
- **TV/Konsole:** größere Oberfläche mit Rand gegen Overscan, automatisch an TV-/Konsolen-Browsern (PlayStation, Xbox, Switch, Smart-TV) und im Controller-Modus am großen Bildschirm, einstellbar
- **Grafik:** echte 3D-Modelle (Kenney Nature Kit/Car Kit, CC0) für Bäume, Büsche, Blumen, Felsen, Baumstümpfe, Stämme und Autos; Konsolen-Look (weiches Licht, Lichtkante, kräftigere Farben), abschaltbar
- **Kollisionen:** Bäume, Laternen, Bänke, Felsen und Stümpfe blockieren Wege; Zugänge zu allen Grundstücken bleiben frei, „Hierhin gehen“ auf ein blockiertes Feld führt daneben
- **PWA:** offline spielbar, installierbar, Update-Hinweis „Neue Version verfügbar – Jetzt aktualisieren“

## Grenzen

- **Nicht auf echter Hardware getestet.** Alle Browser-Tests liefen in Chromium mit Software-Grafik (SwiftShader), Handys nur als Emulation (Pixel 7 hoch/quer). Leistung auf echten Handys und echten Controllern ist ungeprüft.
- Auf den Handy-Profilen läuft nur der Handy-Test F; die übrigen Abläufe (A–E, G–M) laufen auf dem Desktop-Profil.
- Gäste im Mehrspieler dürfen nicht bauen, kaufen, arbeiten gehen oder Familienentscheidungen treffen (Schutz des Gastgeber-Spielstands). Fällt der Gastgeber weg, endet der Besuch; der Gast kann seine Figur behalten.
- Mehrspieler braucht Internet; offline geht nur Einzelspieler.
- 6 der 9 Berufe laufen „im Hintergrund“ (Figur fährt weg und kommt mit Lohn zurück).
- Möbel, Häuser und Figuren sind weiterhin prozedural (eigener Stil); echte Modelle gibt es für Natur und Autos, siehe [ASSETS.md](ASSETS.md).
- „Konsole“ heißt: im Browser der Konsole oder am Fernseher mit Controller spielbar – es gibt keine nativen Konsolen-Fassungen (Store-Veröffentlichung braucht Lizenzen der Hersteller).
- Figuren weichen einander nicht aus (sie können sich kurz überlappen); Wände, Möbel und Stadt-Deko sind feste Hindernisse.

## Firestore-Regeln

Keine Änderung nötig: Der Mehrspieler nutzt nur die bestehende Vermittlung von `cloud/fire-peer.js`.
