# Tests

## Automatische Tests
```bash
cd anmacha-klotzfunk-src
npm test
```
Läuft mit dem in Node eingebauten Test-Runner (keine zusätzliche Bibliothek), braucht keinen Browser und unter einer Sekunde.
Stand dieser Etappe: **60 Tests, alle grün.**

| Datei | prüft |
|---|---|
| `tests/world.test.js` | Generator 1 erzeugt Bit für Bit die Originalwelt (Prüfsummen von Version 1.0); Generator 2: gleicher Seed = gleiche Welt, unabhängig von der Ladereihenfolge; lückenlose Säulen; alle 15 Biome kommen vor; Höhlen und Erze entstehen; Wasser auf Meereshöhe; sicherer Startpunkt; Blockänderungen bauen nur betroffene Chunks neu und überleben Entladen; ungeladene Bereiche gelten als fest |
| `tests/blocks.test.js` | alte Block-Ids und Eigenschaften unverändert; jeder Block hat Kacheln im Atlas, Kategorie und Symbol; Mesher deterministisch, 6 Flächen für freistehenden Block, Glas/Wasser im durchsichtigen Mesh, Logos im Logo-Mesh |
| `tests/physics.test.js` | stabiles Stehen; gleiche Laufstrecke und Sprunghöhe bei 30, 60 und 120 Hz; Wände stoppen; Raycast liefert Block und Fläche; Warten in ungeladenem Bereich |
| `tests/crafting.test.js` | Rezepte eindeutig und gültig; Stationen nötig; Werkzeugkette Holz bis Eisen vollständig; genauer Verbrauch; fehlende Zutaten ändern nichts; Vorratsgrenze ohne Verlust; „wie oft herstellbar“; keine Doppelbuchung; Suche |
| `tests/storage.test.js` | Format 1 (Version 1.0) wird gelesen; kompaktes Format verlustfrei und kleiner; Welt lädt mit Änderungen; Sicherung wird angelegt, nicht ständig überschrieben und lässt sich wiederherstellen; voller Speicher zerstört nichts und opfert zuerst Sicherungen; beschädigte Stände werden erkannt; Export/Import |
| `tests/survival.test.js` | Item-Register im eigenen Id-Bereich; Abbauzeit je Werkzeug und Stufe; Erze nur mit passender Spitzhacke; Fallschaden-Kurve; Physik meldet Aufprall (nicht auf Federblock); Hunger, Erholung, Hunger zehrt nur bis ½ Herz; Ertrinken und Luft; Essen; kaputte Spielstand-Werte |
| `tests/mobs.test.js` | feste Erstbesiedlung; Tiere stecken nie im Block und bewegen sich; erlegte Tiere bleiben nach Speichern/Laden weg; Aktivbereich legt entfernte Tiere ab und weckt sie wieder; Einfrieren in ungeladenem Bereich; Treffer-Strahl; Beute; ungültige Spielstand-Einträge; Gegner sehen nicht durch Wände, verfolgen und greifen etwa 1× je Sekunde an; Gegner nur nachts/tief unten, höchstens 4, nicht gespeichert, verschwinden bei Tagesanbruch |
| `tests/farm.test.js` | Wachstumsstufe aus Zeitstempel; Wachsen nach langer Pause mit einem Aufruf; ohne Ackerboden vergeht die Pflanze; nicht geladene Pflanzen bleiben; Speichern/Laden; Ernte und Brot; Pflanzen nicht fest und als Kreuz gezeichnet |
| `tests/settings.test.js` | Standardwerte, Speichern, ungültige oder kaputte Einträge werden ignoriert |

## Browser-Test (manuell ausgeführt in dieser Etappe)
Mit Playwright und Headless-Chromium (Software-Grafik, SwiftShader) gegen den Production-Build unter `http://localhost/anmacha-klotzfunk/`:

| Szenario | Ergebnis |
|---|---|
| Desktop 1280×800: neue Überlebenswelt (Seed 12345), Biom-Anzeige, Inventar-Suche „glas“, Bretter herstellen, Block setzen/abbauen, Grafik „Eco“, Speichern und zurück ins Menü | ✅ ohne JavaScript-Fehler |
| Alter Spielstand (Format 1, Story, Seed 777) mit Änderung laden, speichern | ✅ Generator 1, Änderung und Auftragsstand erhalten, als Format 2 mit Sicherung gespeichert |
| Pixel 7 hoch (412×839), Pixel 7 quer (863×360), Galaxy S8 (360×740) | ✅ alle Touch-Tasten, Hotbar und Menüknöpfe vollständig im Bild; Inventar und Einstellungen schließbar; Linkshändermodus spiegelt die Tasten |
| Etappe 2, Desktop 1280×800, Überleben (Seed 12345): Tiere vorhanden (Kuh, Schaf, Huhn), Kuh erlegt (Fleisch im Vorrat), Werkbank gesetzt und per Setzen-Taste geöffnet, Stöcke und Steinspitzhacke hergestellt, Ofen-Rezept als „nicht in der Nähe“ gesperrt, Kohle mit der Hand verweigert und mit Steinspitzhacke in 0,6 s Spielzeit abgebaut (berechnet 0,6 s), Braten gegessen, Sturz aus 30 Blöcken = 11 Schaden, Umkippen mit liegengebliebenem Vorrat, Aufstehen und Abholen, Speichern/Laden mit Herzen, Tieren und Haltbarkeit | ✅ ohne JavaScript-Fehler |
| Etappe 2, Story-Welt: keine Tiere, kein Hunger, keine Herzen-Anzeige | ✅ |
| Etappe 2, Pixel 7 hoch und quer: Herzen/Hunger, Hotbar mit Werkzeug, Touch-Tasten überlappen nicht | ✅ |
| Etappe 3, Überleben (Seed 12345, Spielschritte von Hand mit 60 Hz): Hacke macht Ackerboden, Samen gesetzt, nach 271 s Spielzeit reif, Ernte = Weizen + Samen; Nacht: Rauschling erscheint, trifft (2 Schaden), Eisenschwert erledigt ihn in 2 Schlägen; bei Tagesanbruch sind alle Rauschlinge weg; „friedlich“ = keine Gegner. Kreativ: Block setzen, Rückgängig, Wiederholen, Strg+Z | ✅ ohne JavaScript-Fehler |
| Teleport in 8 Biome und eine Höhle (Kreativ, Seed 12345), Screenshots | ✅ Biome wie beschrieben, kein Durchfallen |

**Einschränkungen:** Kein echtes Android-Gerät, kein Firefox/Edge/Safari, keine WebViews getestet. Die Bildraten aus Headless-Chromium
(Software-Grafik) sagen nichts über echte Geräte aus. Vor einer Veröffentlichung sollte jemand das Spiel auf einem durchschnittlichen
Android-Handy in Chrome öffnen und Grafik „Automatisch“ prüfen.
