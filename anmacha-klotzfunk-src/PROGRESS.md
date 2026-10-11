# KLOTZFUNK 3D – Fortschritt und Entwicklungsplan

Dieses Dokument ist die Übergabe zwischen Arbeitssitzungen. Es beschreibt den **tatsächlichen** Stand (geprüft, nicht geplant),
den Plan für die nächsten Etappen und alles, was eine neue Sitzung wissen muss, um sofort weiterzuarbeiten.

Legende: ✅ fertig und getestet · 🟡 teilweise · ⬜ offen

---

## 1. Ausgangslage (Analyse vor Etappe 1, Version 1.0)

- Three.js 0.170 + Vite 5, reines JavaScript (ES-Module), ca. 3 000 Zeilen in 9 Dateien.
- Welt: Value-Noise-Höhenkarte, 16×16×64-Chunks, Bäume nur im Chunk-Inneren, 11 Grundblöcke, 16 Senderlogo-Blöcke, 11 Spezialblöcke.
- Mesher: Flächen-Culling, Ambient Occlusion, Himmelslicht, drei Meshes je Chunk (opak, durchsichtig, Logos).
- Spiel: Überleben/Kreativ/Story (15 feste Aufträge), Seilhaken, Gleiten, Fliegen, Minikarte, Wegpunkt, Radio-Blöcke mit erzeugtem Beat.
- Speicher: 3 Plätze in `localStorage`, nur Änderungen werden gespeichert.
- **Keine** Tests, keine Gesundheit/Hunger, keine Tiere/NPCs/Gegner, kein Multiplayer.

### Gefundene Fehler und Architekturprobleme

| Problem | Folge | Stand |
|---|---|---|
| Physik integriert mit der Bildrate | Sprung bei 30 Hz 8 % höher als bei 120 Hz | ✅ behoben (feste Teilschritte ≤ 1/120 s, Test) |
| Teleport in ungeladenen Bereich schiebt den Spieler bis zur Weltobergrenze | „aus Blöcken befreien“ hielt ungeladene Chunks für Fels | ✅ behoben (Spieler wartet, bis der Bereich geladen ist, Test) |
| Herstellen über die Vorratsgrenze (999) | Zutaten verbraucht, Ergebnis abgeschnitten = Verlust | ✅ behoben (Rezept wird abgelehnt, Test) |
| Blockeigenschaften an 5 Stellen verteilt (Mesher, Spiel, Menü, Karte) | neue Blöcke fehleranfällig | ✅ zentrales Blockregister |
| Fester Arbeitsumfang beim Nachladen (2–3 Chunks je Bild) | Ruckler auf langsamen Geräten, Leerlauf auf schnellen | ✅ Zeitbudget je Bild, Blickrichtung zuerst |
| Speichern ohne Sicherung, Format wächst schnell | ein volles `localStorage` = Speichern schlägt fehl | ✅ Sicherungskopie, gut doppelt so kompakt, Speicher-voll-Strategie |
| Google-Cloud-Knopf lag am Handy über dem ersten Hotbar-Platz | Fehlklicks | ✅ Cloud-Bereich ins Hauptmenü verlegt |
| Story-Aufträge hängen an einer festen Welt (Seed 777) | neue Weltgeneratoren könnten Aufträge unlösbar machen | ✅ Story bleibt bis zur neuen Story auf Generator 1 |

---

## 2. Etappe 1 (diese Sitzung) – Fundament, Welt, Bedienung ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Blockregister | 57 Blöcke mit Id, Name, Kategorie, Kacheln, fest/verdeckt/durchsichtig, Leuchten, Härte, Werkzeug, Farben. Alte Ids unverändert (Test). | `src/blocks.js` |
| Welt-Generator 2 | Kontinente, Gebirge, Temperatur, Feuchtigkeit, „Besonderheit“; **15 Biome** (Meer, Strand, Felsküste, Ebene, Blumenwiese, Laubwald, Nadelwald, Berge, Schnee, Wüste, Sumpf, Dschungel, Vulkan, Pilzwald, Kristallgebiet); Bäume/Objekte über Chunkgrenzen; Weltgröße 16×16×96 | `src/worldgen.js`, `src/consts.js`, `src/noise.js` |
| Untergrund | zwei Tunnel-Ebenen mit Eingängen, Kavernen, unterirdische Seen, Kristallnester, Kohle/Kupfer/Eisen/Funkkristall-Adern | `src/worldgen.js` |
| Alte Welten | Spielstände ohne Generatorangabe nutzen exakt die Originalwelt (Prüfsummen-Test). | `src/world.js` |
| Neue Blöcke | Schnee, Eis, Kies, Ton, Fichtenholz/-nadeln, Kaktus, Kohle-/Kupfer-/Eisenerz, Funkkristall, Schlamm, Blütenwiese, Basalt, Magma, Pilzhut/-stiel, Pilzboden, Sandstein, Dschungelblätter – mit eigenen Texturen | `src/blocks.js`, `src/textures.js` |
| Rezepte | zentrale Rezeptliste (37), Prüfen/Herstellen als reine Funktionen, Vorratsgrenze, klare Fehlermeldungen, Zähler „wie oft herstellbar“ | `src/crafting.js` |
| Inventar | Kategorien, Suche (Blöcke und Rezepte), „nur Vorrat“, rote Markierung fehlender Zutaten, Umschalt-Klick = 5× | `src/main.js`, `index.html` |
| Speicher v2 | Version, kompakte Änderungen (Base64, 3 Byte je Änderung), Sicherung alle ≥10 min (nur lokal), Wiederherstellen, automatischer Rückgriff bei beschädigtem Stand, Export/Import als Datei, Speicher-voll-Strategie | `src/storage.js` |
| Grafikstufen | Eco / Mobil / Standard / Hoch / Automatisch (misst die Bildrate alle 2 s, senkt zuerst Auflösung, dann Sichtweite; hebt langsam wieder an) | `src/settings.js`, `src/game.js` |
| Einstellungen | Maus-, Kamera- und Joystick-Empfindlichkeit, Tastengröße, Linkshändermodus, Blick umkehren, Setz-Verzögerung gegen Doppelsetzen, Lautstärke Effekte/Musik, Bildrate anzeigen, Zurücksetzen – lokal gespeichert | `src/settings.js`, `src/main.js` |
| Streaming | Zeitbudget je Bild (3–8 ms je Stufe), nahe Chunks und Blickrichtung zuerst, Spieler wartet bei ungeladenem Bereich | `src/game.js`, `src/physics.js` |
| HUD | Biomname in der Infozeile, optional Bildrate | `src/main.js` |
| Tests | 33 automatische Tests (Welt, Blöcke, Mesher, Physik, Herstellen, Speicher, Einstellungen) | `tests/` |
| Werkzeuge | `npm test`, `npm run bench`, `npm run docs` | `tools/` |

---

## 2b. Etappe 2 – Überleben ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Item-Register | Gegenstände ohne Block ab Id 1000 (Block-Ids bleiben < 256): Stock, Kupfer-/Eisenbarren, Apfel, rohes Fleisch, Braten, je 4 Stufen Spitzhacke/Axt/Schaufel (Holz, Stein, Kupfer, Eisen). Pixel-Symbole werden zur Laufzeit gezeichnet, in der Hand als flaches Bild. | `src/items.js`, `src/textures.js` |
| Abbauen | nur Überleben: Abbauzeit = Härte × 0,9 s ÷ Werkzeugtempo, Fortschrittsbalken unter dem Fadenkreuz; Erze brauchen eine Spitzhacke (Eisen/Funkkristall mindestens Stein), sonst Hinweis statt Abbau; Werkzeuge nutzen sich ab (Haltbarkeit gilt für das oberste Werkzeug des Stapels, `dur` im Spielstand) | `src/items.js`, `src/game.js` |
| Stationen | Werkbank (aus 4 Brettern) und Schmelzofen (8 Stein, an der Werkbank) als Blöcke; Rezepte mit `st` gehen nur mit Station ≤ 4 Blöcke entfernt; Setzen-Taste auf der Station öffnet das Herstellen. Schmelzen ist sofort (kein Zeitablauf). | `src/crafting.js`, `src/blocks.js` |
| Gesundheit/Hunger | 10 Herzen, 10 Keulen, Luftblasen unter Wasser; Fallschaden aus der Aufprallgeschwindigkeit (ab ~4 Blöcken, Feder/Wasser/Haken schützen); Ertrinken, Magma, Hunger zehrt bis ½ Herz; Erholung bei vollem Magen; Essen mit der Setzen-Taste | `src/survival.js`, `src/physics.js` |
| Umkippen | Bildschirm mit Ursache, Aufstehen am Startpunkt, Wegpunkt am Unglücksort; Einstellung „Vorrat behalten“ (Standard) oder „Vorrat bleibt liegen“ (Abholen durch Hingehen, `grave` im Spielstand) | `src/game.js`, `src/main.js`, `src/settings.js` |
| Tiere | Huhn, Schaf, Kuh; feste Erstbesiedlung je Chunk aus dem Startwert (~20 % der Chunks, nur auf Wiese/Schnee/Pilzboden); Laufen, Stehen, Springen über 1 Block, keine Klippen/Tiefwasser, Flucht nach Treffer; Beute direkt in den Vorrat (Fleisch, Wolle) | `src/mobs.js`, `src/mobview.js` |
| Aktivitätsstufen | < 24 Blöcke jedes Bild, bis Aktivradius (3 Chunks) 4× je Sekunde, außerhalb im Chunk-Speicher ohne Rechenzeit, ungeladen = eingefroren; höchstens 40 aktive Tiere; Speicherung je Chunk (`mobs` im Spielstand, erlegte Tiere kommen nicht wieder) | `src/mobs.js` |
| Modi | Überleben: alle Regeln. Kreativ: Tiere ja, sonst sofortiges Abbauen. Story: unverändert (keine Tiere, kein Hunger), damit die 15 Aufträge gleich bleiben. | `src/game.js` |
| Tests | 51 Tests (neu: `survival.test.js`, `mobs.test.js`, Stationen/Werkzeugkette in `crafting.test.js`) | `tests/` |

---

## 3. Gesamtplan (Abschnitte des Masterprompts → Etappen)

Reihenfolge nach den Prioritäten aus Abschnitt 33: Spielstände → Spielfähigkeit → Fehler → Handy → Desktop → Kernmechaniken → Story → Erweiterungen → Grafik.

| # | Abschnitt | Stand | Etappe | Nächster konkreter Schritt |
|---|---|---|---|---|
| 4 | Voxel-Engine | 🟡 | 1 ✅ / 4 | Meshing im Web Worker (siehe PERFORMANCE.md), Speicherfreigabe für Geometrie-Puffer prüfen |
| 4/5 | Weltgenerierung, Biome, Höhlen | ✅ | 1 | Biom-Tiere (Etappe 2), verlassene Minen/geheime Räume als Strukturen (Etappe 3) |
| 6 | Blocksystem | 🟡 | 1 ✅ / 3 | Formblöcke (Treppen, Halbblöcke, Zäune, Türen, Fenster) brauchen Nicht-Würfel-Meshing; Schilder, Möbel |
| 7 | Bauen | 🟡 | 3 | Platzierungsvorschau, Linie/Fläche/Wand/Säule, Rückgängig/Wiederholen, Kopieren/Einfügen, Bauvorlagen (lokal + Export) |
| 8 | Crafting, Werkzeuge, Stationen | ✅ | 2 | später: Kochstelle, Schmelzen mit Zeitablauf, Werkzeug-Haltbarkeit je Stück statt je Stapel |
| 9 | Survival | ✅ | 2 | Betten/eigener Startpunkt, Rüstung (mit Gegnern, Etappe 3) |
| 10 | Tiere | ✅ | 2 | Biom-Tiere (z. B. Ziege, Pinguin), Züchten mit Futter, Beine animieren |
| 11 | Gegner, Kampf | ⬜ | 3 | eigene Gegner (Rauschlinge, Höhlenwesen, Störsender-Drohnen), Sichtlinien-Prüfung gegen Treffer durch Wände |
| 12 | Dörfer, NPCs | ⬜ | 3 | Strukturgenerator mit Flächenausgleich, NPC-Tagesablauf mit festem Aufenthaltsort, Handel |
| 13 | Landwirtschaft | ⬜ | 3 | Wachstum über Zeitstempel (kein Dauer-Simulieren), Zustand im Block-Edit gespeichert |
| 14 | Fahrzeuge | 🟡 | 4 | Seilhaken/Gleiter/Aufwind vorhanden; Boot, Lore auf Schienen, Reittier |
| 15 | Story „Das große Rauschen“ | 🟡 | 4 | 6 Kapitel, alte 15 Aufträge werden Kapitel 1–2; Migration: alter Fortschritt `story.i` → neues Kapitel/Schritt |
| 16 | Funktechnik | 🟡 | 4 | Radio-Blöcke vorhanden; Funknetz (Sender, Relais, Reichweite), Signale steuern Maschinen |
| 17 | Automatisierung | ⬜ | 4 | Signal-Leitungen mit Warteschlange und Rechenlimit je Tick |
| 18 | Spielmodi | 🟡 | laufend | Survival-Regeln ✅; Story zieht mit Etappe 4 auf die neuen Regeln um |
| 19 | Multiplayer | ⬜ | 5 | WebRTC (Peer-to-Peer, Host = Autorität) zuerst prüfen; GitHub Pages bleibt Einzelspieler ohne Server |
| 20 | Smartphone | 🟡 | 1 ✅ / 3 | Tastenpositionen frei verschiebbar, optionaler Platzierungsmodus mit Vorschau |
| 21 | Desktop | 🟡 | 3 | Tastenbelegung ändern, Gamepad |
| 22 | Inventar/HUD | 🟡 | 1 ✅ / 2 ✅ | Drag & Drop, Haltbarkeitsbalken im Platz |
| 23 | Karten | 🟡 | 3 | Weltkarte mit aufgedeckten Gebieten (Biomfarben stehen schon in `BIOME_COLORS`), mehrere Wegpunkte |
| 24 | Speicher | ✅ | 1 | IndexedDB erst nötig, wenn Welten > ~1 MB werden (siehe unten) |
| 25/26 | Performance | 🟡 | 1 ✅ / 4 | echte Handymessungen, Worker-Meshing |
| 27 | Entities | 🟡 | 2 ✅ / 3 | Gegner und NPCs auf dem Tier-Grundgerüst (`src/mobs.js`) |
| 28 | Audio | 🟡 | 1 ✅ / 3 | Lautstärke-Kategorien vorhanden; Schritte je Material, Wasser, Wetter |
| 29 | Tests | 🟡 | laufend | jede Etappe bringt Tests für ihre Systeme mit |
| 31 | Doku | ✅ | laufend | README, GAMEPLAY, STORY, BLOCKS, CRAFTING, WORLD, PERFORMANCE, TESTING, PROGRESS |

---

## 4. Entscheidungen (mit Begründung)

- **Generator-Version im Spielstand (`gen`).** Alte Welten speichern nur Änderungen gegenüber der erzeugten Welt. Ein neuer Generator würde ihre Bauwerke in fremdes Gelände setzen. Darum: `gen` fehlt ⇒ Generator 1 (unverändert), neue Welten ⇒ Generator 2.
- **Weltgröße 96 statt 64.** Die Chunk-Indizes (`x + z·16 + y·256`) bleiben gleich, alte Änderungen passen weiter. Speicher je Chunk: 24 KB statt 16 KB.
- **Story vorerst auf Generator 1.** Die 15 Aufträge sind dort erprobt (Sand am Wasser in Startnähe). Mit der neuen Story (Etappe 4) zieht sie auf Generator 2 um.
- **Kein Greedy Meshing (geprüft).** Der Mesher nutzt Ecken-Ambient-Occlusion und Atlas-Kacheln. Greedy Meshing bräuchte wiederholende Kacheln im Shader und würde AO-Verläufe zusammenlegen. Gemessen: ~850–1 100 Flächen je Chunk, Meshing ~2–3 ms (Node, Desktop-CPU). Der Gewinn rechtfertigt den Umbau derzeit nicht; der größere Hebel ist Meshing im Worker.
- **localStorage statt IndexedDB (vorerst).** Durch das kompakte Format belegen 100 000 Änderungen ~400 KB. Drei Welten plus Sicherungen passen in die üblichen 5 MB. Bei Speicher voll werden zuerst Sicherungen geopfert, der Hauptstand hat Vorrang, ein misslungenes Speichern verändert nichts. Wechsel auf IndexedDB, wenn Tiere/NPC/Maschinen viel Zustand bringen (Etappe 2/3).
- **Sicherungen außerhalb des Cloud-Präfixes** (`klotzfunk-bak.*`), damit das optionale Google-Sync nicht doppelt so viel hochlädt.
- **Keine neuen Bibliotheken.** Tests nutzen den in Node eingebauten Test-Runner.

---

## 5. Wie man weiterarbeitet

```bash
cd anmacha-klotzfunk-src
npm install
npm test          # 51 Tests, ~1 s
npm run bench     # Chunk-Erzeugung/Meshing messen (Seed 12345, Radius 6, Generator 2)
npm run docs      # BLOCKS.md und CRAFTING.md aus dem Code erzeugen
npm run build     # schreibt ../anmacha-klotzfunk/ (mit committen!)
```

Regeln, die nicht gebrochen werden dürfen:
1. Block-Ids nie ändern, neue Blöcke hinten in `src/blocks.js` anhängen, Kachel in `src/textures.js` ergänzen.
2. `generate1` in `src/world.js` nie ändern (Test „Generator 1 erzeugt exakt die Originalwelt“).
3. Änderungen an `worldgen.js` verändern neue Welten, die schon gespielt werden. Wenn das Gelände sich sichtbar ändert: neue Generator-Version (`gen: 3`) statt Generator 2 umzubauen.
4. Speicherformat: `decodeEdits` muss Format 1 und 2 lesen können; neue Felder im Spielstand immer optional.
5. Vor jedem Commit: `npm test` und `npm run build`, Ergebnisordner mit committen.

### Nächste Sitzung: Etappe 3 „Bauen, Gegner, Dörfer“
1. Gegner auf dem Tier-Grundgerüst: Rauschlinge (nachts), Höhlenwesen, Störsender-Drohnen; Sichtlinie gegen Treffer durch Wände; Schwerter und Rüstung.
2. Strukturgenerator (Dörfer mit Flächenausgleich, verlassene Minen) als Generator-Feature mit eigener Version, falls sich Gelände sichtbar ändert.
3. NPCs mit festem Tagesablauf und Handel.
4. Landwirtschaft über Zeitstempel (Wachstum beim Laden nachrechnen, kein Dauer-Simulieren).
5. Bau-Werkzeuge: Vorschau, Linie/Fläche/Wand, Rückgängig.
6. Tests für alle neuen Systeme.

---

## 6. Bekannte Einschränkungen (ehrlich)

- Gemessen wurde in Node (Desktop-CPU) und im Headless-Chromium mit Software-Grafik. **Echte Android-Geräte wurden nicht getestet.** Siehe PERFORMANCE.md und TESTING.md.
- Die Story nutzt weiter die 15 Aufträge von Version 1.0.
- Schmelzen und Kochen gehen sofort; der Ofen hat noch keinen Brennvorgang mit Zeit.
- Tiere haben keine Bein-Animation (nur Wippen beim Laufen) und vermehren sich nicht; ein Chunk wird nur einmal besiedelt.
- In alten Generator-1-Welten gibt es keine Erze, dort reichen die Werkzeuge bis Stein.
- Ein Gegenstand in der Hand ist im schmalen Hochformat am Handy kaum zu sehen (liegt am Bildrand); die Hotbar zeigt ihn.
