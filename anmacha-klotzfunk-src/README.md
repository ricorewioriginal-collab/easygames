# KLOTZFUNK 3D

Voxel-Sandbox im Browser (Three.js + Vite) für PC und Smartphone. Bauen, abbauen, erkunden – in 15 Biomen mit Höhlen, Erzen,
Dörfern, verlassenen Minen und leuchtenden Funkkristallen, mit Radio-Blöcken, einem Funknetz mit Schaltern, Sendern, Relais und Maschinen, 16 AnMaCha-Senderlogo-Blöcken, Seilhaken, Gleiter, Boot und Lore auf Schienen, Weltkarte, frei belegbaren Tasten und Gamepad. Alle Texturen und Geräusche
werden im Browser erzeugt; es gibt keine Downloads außer den 16 Logos. Kein Konto, keine Kosten, keine externen Dienste nötig.

## Spielen
- **Online:** `anmacha-klotzfunk/` (fertig gebautes Ergebnis, wird mit GitHub Pages ausgeliefert, in der Spieleliste verlinkt).
- **Lokal aus dem Build:** den Ordner `anmacha-klotzfunk/` über einen beliebigen Webserver öffnen (z. B. `python3 -m http.server` im Repo-Hauptordner).

## Spielmodi
- **Überleben:** Abbauzeit nach Härte, Werkzeuge aus Holz, Stein, Kupfer und Eisen, Werkbank und Schmelzofen, Herzen, Hunger, Fallschaden, Ertrinken, Tiere, Weizenfelder, Dörfer mit Bewohnern und Handel, Rauschlinge, Höhlenwesen und Drohnen, Schwerter und Rüstung, Bauformen (Rezepte siehe [CRAFTING.md](CRAFTING.md) und [GAMEPLAY.md](GAMEPLAY.md)).
- **Kreativ:** alle Blöcke unbegrenzt, Fliegen, Formen, Kopieren/Einfügen, Rückgängig.
- **Story:** „Das große Rauschen“: 6 Kapitel, 25 Aufträge, Dorf, Höhlen und ein eigenes Funknetz aus Sendern, Relais, Empfängern und Maschinen (siehe [STORY.md](STORY.md)).

**Mehrspieler:** bis zu 4 Gäste direkt von Browser zu Browser, ohne Server (siehe [MULTIPLAYER.md](MULTIPLAYER.md)).

Mehr zu Steuerung und Spielablauf: [GAMEPLAY.md](GAMEPLAY.md). Welt und Biome: [WORLD.md](WORLD.md). Alle Blöcke: [BLOCKS.md](BLOCKS.md).

## Speichern
Drei Weltplätze im Browser (`localStorage`). Gespeichert wird automatisch alle 30 Sekunden, beim Pausieren und beim Verlassen der Seite;
abgelegt werden nur Startwert, Generator-Version und die tatsächlichen Änderungen. Zusätzlich:
- **Sicherung:** höchstens alle 10 Minuten wird der vorige Stand als Sicherung behalten (↺ auf der Welt-Kachel im Hauptmenü stellt ihn wieder her).
  Ist ein Spielstand beschädigt, bietet das Spiel beim Laden die Sicherung an.
- **Export/Import:** ⤓ auf der Welt-Kachel lädt die Welt als `.json`-Datei herunter, „⤒ Welt importieren“ im Hauptmenü liest sie in einen freien Platz.
- **Optional:** Spielstände mit Google sichern (Hauptmenü, aufklappbar). Ohne Anmeldung bleibt alles auf dem Gerät.
- Welten aus Version 1.0 laden unverändert mit ihrer Originallandschaft.

## Entwickeln
```bash
cd anmacha-klotzfunk-src
npm install
npm run dev        # Entwicklungsserver mit Hot Reload
npm test           # automatische Tests (Node, ohne Browser)
npm run bench      # Leistungsmessung: Chunk-Erzeugung und Meshing
npm run docs       # BLOCKS.md und CRAFTING.md aus dem Code neu erzeugen
npm run build      # schreibt das Ergebnis nach ../anmacha-klotzfunk/ (wird eingecheckt)
```
Nach Änderungen am Quelltext immer `npm test` und `npm run build` ausführen und den Ordner `anmacha-klotzfunk/` mit committen.
Stand und Plan der Weiterentwicklung: [PROGRESS.md](PROGRESS.md). Tests: [TESTING.md](TESTING.md). Leistung: [PERFORMANCE.md](PERFORMANCE.md).

## Aufbau
| Datei | Aufgabe |
|---|---|
| `src/blocks.js` | Blockregister: alle Blöcke mit Id, Name, Kategorie, Eigenschaften |
| `src/consts.js`, `src/noise.js` | Weltmaße, deterministisches Value-Noise |
| `src/world.js` | Chunk-Speicher, Änderungen, Generator 1 (Originalwelt), Startpunkt |
| `src/worldgen.js` | Generator 2: Biome, Höhlen, Erze, Bäume |
| `src/structures.js` | Generator 3: Dörfer und verlassene Minen |
| `src/mobs.js`, `src/mobview.js` | Tiere, Gegner, Dorfbewohner (Verhalten und Modelle) |
| `src/build.js` | Bauformen, Kopieren/Einfügen |
| `src/trades.js` | Handelsangebote der Dorfbewohner |
| `src/items.js`, `src/survival.js`, `src/farm.js` | Gegenstände, Gesundheit/Hunger, Felder |
| `src/mesher.js` | Flächen-Culling, Ambient Occlusion, Himmelslicht, je Chunk bis zu drei Meshes |
| `src/textures.js` | prozedurale Texturen (64 px, nahtlos), Logo-Atlas, Wolken |
| `src/physics.js` | Spieler-Kollision (feste Teilschritte), Wasser, Raycast |
| `src/game.js` | Rendering, Streaming mit Zeitbudget, Grafikstufen, Tag/Nacht, Bauen, Story-Logik |
| `src/crafting.js` | Rezepte, Prüfen und Herstellen |
| `src/storage.js` | Speichern, Format-Versionen, Sicherung, Export/Import |
| `src/settings.js` | Einstellungen und Grafikstufen |
| `src/worldmap.js`, `src/mapui.js` | Weltkarte: entdeckte Gebiete, Markierungen, Funkstationen; Kartenfenster |
| `src/controls.js` | Tastenbelegung und Gamepad |
| `src/audio.js` | ein AudioContext: Effekte, Schritte, Tiere, Technik, Radio-Musik (alles erzeugt) |
| `src/quests.js` | Story-Aufträge |
| `src/audio.js` | Geräusche und Radio-Beat (ein AudioContext, Lautstärke je Kategorie) |
| `src/main.js` | Menüs, HUD, Inventar, Einstellungen, Tastatur/Maus/Touch |

Multiplayer gibt es noch nicht; Planung in [PROGRESS.md](PROGRESS.md).
