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

## 2c. Etappe 3 (Teil 1) – Felder, Gegner, Rückgängig ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Landwirtschaft | Hacke (Holz, Stein) macht Gras/Erde zu Ackerboden; Weizensamen (12 % beim Abbauen von Gras) darauf setzen; 4 Wachstumsstufen à 90 s Spielzeit; reif = Weizen + 1–2 Samen; 3 Weizen = Brot (+6 Hunger) | `src/farm.js`, `src/items.js`, `src/blocks.js` |
| Wachstum über Zeitstempel | jede Pflanze speichert ihre Setz-Zeit (`farm`, gespielte Sekunden `age` im Spielstand); die Stufe wird alle 2 s nur für geladene Pflanzen berechnet, nach langer Abwesenheit genügt ein Aufruf; ohne Ackerboden vergeht die Pflanze; höchstens 4096 Pflanzen | `src/farm.js` |
| Pflanzen-Modelle | neue Blockform „Kreuz“ (zwei diagonale, beidseitige Flächen, nicht fest) im Mesher | `src/mesher.js`, `src/textures.js` |
| Gegner | Rauschling: erscheint nachts unter freiem Himmel und jederzeit in tiefen Höhlen (unter Meereshöhe − 4), 14–26 Blöcke entfernt, höchstens 4; sieht den Spieler nur mit freier Sichtlinie (≤ 18 Blöcke), verfolgt, springt über Stufen, trifft 1× je Sekunde (1 Herz, Rückstoß); verschwindet bei Tageslicht oder > 40 Blöcken; Beute 0–1 Funkkristall; wird nicht gespeichert. Einstellung „Gegner“ (aus = friedlich). | `src/mobs.js`, `src/mobview.js`, `src/game.js` |
| Kampf | Schwerter in 4 Stufen (3–6 Schaden, nutzen sich ab); Treffer durch Wände sind unmöglich (Tier-Strahl wird mit dem Block-Strahl verglichen) | `src/items.js`, `src/game.js` |
| Rückgängig | Kreativ: letzte 100 Bau-Schritte, Strg+Z / ↶-Knopf, Strg+Y bzw. Strg+Umschalt+Z wiederholt (im Überleben bewusst nicht, sonst ließen sich Blöcke vermehren) | `src/game.js`, `src/main.js` |
| Fehler behoben | negativer Zeitschritt, wenn der Bild-Zeitstempel knapp vor dem Fortsetzen lag | `src/game.js` |
| Tests | 60 Tests (neu: `farm.test.js`, Gegner in `mobs.test.js`) | `tests/` |

---

## 2d. Etappe 3b – Dörfer und Bauen ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Generator 3 | neue Welten: Generator 2 plus Strukturen; Generator 2 bleibt Bit für Bit gleich (Test). Regionen von 160×160 Blöcken mit höchstens einem Dorf und einer Mine, beide ganz in ihrer Region, also prüft jeder Chunk nur seine eigene Region. Startpunkt am Dorfplatz des nächsten Dorfes. | `src/structures.js`, `src/world.js` |
| Dörfer | nur in Ebene, Wald, Wiese, Nadelwald, Schnee, Wüste und nur bei höchstens 9 Blöcken Höhenunterschied; Platz mit Radius 20 eben, 4 Blöcke weicher Übergang, Bäume darüber entfernt, Höhleneingänge zugeschüttet. Brunnen, Laternen, Wege, 3–4 Häuser (Tür zum Platz, Fenster, Pyramidendach, Lampe), Weizenfeld mit Wasserrinne, Funkmast mit spielendem Radio. Baustoffe je Biom (Bretter/Ziegel, Fichte, Sandstein). | `src/structures.js` |
| Minen | zwei kreuzende Stollen (3 breit, 3 hoch, Länge 37–59) auf Höhe 10–17, Stützbalken alle 5 Blöcke, vereinzelt Lampen, Brücken über Höhlen, Erze an den Wänden, Kammer mit altem Ofen und Werkbank; nie unter Meer oder flachem Gelände | `src/structures.js` |
| Dorfbewohner | Bäuerin, Schmied, Funkerin, Hirte (ein Bewohner je Haus); Tagesablauf zu Hause → Arbeit → Dorfplatz → Arbeit → abends nach Hause, Häuser nur durch die Tür (Wegpunkte); hängt einer 5 s fest, wird er zum Wegpunkt versetzt. Sie entstehen aus den Dorfdaten, wenn der Dorfplatz geladen ist, und werden nicht gespeichert (kein neues Spielstandfeld). Nicht angreifbar; im Dorf erscheinen keine Gegner. | `src/mobs.js`, `src/mobview.js` |
| Handel | Setzen-Taste auf einen Bewohner öffnet den Tausch; je Beruf 3–4 Angebote (Weizen, Kohle, Barren, Kristalle gegen Äpfel, Werkzeug, Rüstung, Radio, Lampen, Schalter); gleiche Prüfung wie Rezepte | `src/trades.js`, `src/main.js` |
| Bau-Werkzeuge | Bauform mit G bzw. ▦: Einzeln, Linie, Fläche, Wand, Säule (zwei Ecken setzen), Kreativ zusätzlich Kopieren (bis 32 768 Blöcke) und Einfügen. Vorschau als weißer Rahmen (abschaltbar). Formen füllen nur freie Zellen; Überleben: höchstens 512 Blöcke und nur aus dem Vorrat. Eine Form = ein Rückgängig-Schritt. | `src/build.js`, `src/game.js` |
| Gegner | Höhlenwesen (nur tief in Höhlen, 12 Leben, 1½ Herzen Schaden, Kohle/Eisen) und Störsender-Drohne (nachts, fliegt, hält Abstand, Störimpuls auf 7 Blöcke alle 2 s, Kupferbarren/Kristall) | `src/mobs.js`, `src/mobview.js` |
| Rüstung | Kupfer- und Eisenhelm, Kupfer- und Eisenharnisch (Werkbank); Setzen-Taste legt an; je Schutzpunkt 5 % weniger Schaden durch Gegner (höchstens 40 %); nutzt sich je Treffer ab; Schilde über den Herzen; `arm` im Spielstand | `src/items.js`, `src/game.js`, `src/main.js` |
| Technik | Block-Atlas auf 8×16 Kacheln erweitert (vorher 8×8 voll); neue Blöcke 66–78 (Dorfweg, Bruchstein und die Funktechnik für Etappe 4); `drop` im Blockregister | `src/consts.js`, `src/textures.js`, `src/mesher.js`, `src/blocks.js` |
| Fehler behoben | Erstbesiedlung konnte seit Etappe 3 Rauschlinge als Tierherde erzeugen (Typ-Auswahl über alle Arten statt nur Tiere) | `src/mobs.js` |
| Tests | 71 Tests (neu: `structures.test.js`, `build.test.js`, Dorfbewohner/Drohne in `mobs.test.js`) | `tests/` |

---

## 2e. Etappe 4 – Story „Das große Rauschen“ und Funknetz ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Story | neue Kampagne `rauschen`: 6 Kapitel, 25 Aufträge (Grundversorgung → Dorf, Gespräch, Handel → Höhle, Kupfer, Kristalle → Sender, Relais, Verbindung über 40 Blöcke → Rüstung, Drohne, Höhlenwesen, Maschinen → Turm, 3 Empfänger, Finale). Neue Auftragsarten: Ort besuchen, sprechen, tauschen, Tiefe, Gegner besiegen, Netz (Empfänger/Maschinen), Reichweite. Kapitelbanner, Liste nach Kapiteln. | `src/quests.js`, `src/game.js`, `src/main.js` |
| Story-Regeln | neue Story-Welten: Generator 3, Seed 777, Überlebensregeln, Tiere und Gegner, Start abseits des Dorfes; Kampagne im Spielstand (`story.c`), Kampagne im Weltmenü (`meta.qc`) | `src/game.js`, `src/storage.js` |
| Alte Story | Spielstände ohne `story.c` behalten Generator 1, die 15 Aufträge und die alten Regeln (Entscheidung statt Umrechnung, siehe STORY.md) | `src/quests.js`, `src/game.js` |
| Funknetz | Schalter, Signalleitung, Funksender, Relais, Empfänger, Signallampe, Funktor (Blöcke 68–78, Rezepte an der Werkbank). Breitensuche über die Netz-Blöcke, Funk 24 Blöcke, Rechenlimit 4 096 Schritte; gerechnet nur nach Änderungen. Netz-Blöcke werden beim Laden der Chunks erfasst, nicht extra gespeichert. Tor schließt nicht, solange der Spieler darin steht. | `src/signal.js`, `src/world.js`, `src/game.js` |
| Tests | 76 Tests (neu: `signal.test.js`) | `tests/` |

**Bewusst verschoben auf Etappe 5:** Fahrzeuge (Boot, Lore) und Meshing im Web Worker. Beides ist eigenständig groß, die Story braucht es nicht,
und ohne Messung auf echten Handys lässt sich der Nutzen des Workers nicht belegen.

---

## 2f. Etappe 5 – Fahrzeuge und Meshing im Worker ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Boot | schwimmt auf der Wasseroberfläche (Feder zur Oberfläche), Schub und Lenkung mit eigener Trägheit, Wasser- und Bodenreibung, Kollision achsenweise mit festen Blöcken; schaukelt, Paddel schlagen beim Fahren | `src/vehicles.js`, `src/vehview.js` |
| Schienen und Lore | Schiene (Block 79) als flache Platte, Ausrichtung im Mesher aus den Nachbarschienen; Lore fährt von Zellmitte zu Zellmitte, geradeaus vor Kurve, Stufen ±1, Hangabtrieb, Bremsen, Umkehren in Blickrichtung, hält am Ende, entgleist ohne Schiene; Räder drehen, Neigung auf Stufen | `src/vehicles.js`, `src/mesher.js`, `src/blocks.js` |
| Bedienung | Setzen = einsteigen/Fahrzeug setzen, Springen = aussteigen (freie Stelle wird gesucht), Abbauen = einpacken; Rezepte an der Werkbank; im Spielstand `veh` (optional, ungültige Einträge werden verworfen) | `src/game.js`, `src/crafting.js`, `src/items.js` |
| Worker-Meshing | Nachladen im Web Worker, Bauen bleibt synchron; halbiert die Hauptthread-Zeit beim Erkunden (Messung in PERFORMANCE.md) | `src/meshworker.js`, `src/game.js` |
| Tests | 82 Tests (neu: `vehicles.test.js`) | `tests/` |

Nicht umgesetzt: Reittiere und angetriebene Schienen. Reittiere bräuchten Tier-Animationen, die es noch nicht gibt (siehe Abschnitt 6).

---

## 2g. Etappe 6 – Mehrspieler ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Verbindung | WebRTC-DataChannel direkt zwischen Browsern; Verbindungsaufbau über zwei Text-Codes (gepackt, ~600 Zeichen), kein Signalisierungs-Server; STUN optional (abschaltbar) | `src/rtc.js` |
| Protokoll | Gastgeber = Autorität: Token je Sitzung, Versionsprüfung, höchstens 4 Gäste, Weltdaten in Teilen, Blockwünsche mit Zustand vorher (keine Doppel-Ernte), Reichweite, Rate, gültige Ids, Positionsprüfung; Ablehnung setzt Block und Vorrat beim Gast zurück | `src/net.js` |
| Im Spiel | andere Spieler als Figur mit Namen; Tiere/Gegner vom Gastgeber beim Gast, Treffer und Beute über den Gastgeber; Gegner verfolgen den nächsten Spieler und treffen auch Gäste; Wachstum, Signale, Uhrzeit vom Gastgeber; Welt läuft im Pausemenü des Gastgebers weiter | `src/mp.js`, `src/avatars.js`, `src/game.js`, `src/mobs.js` |
| Oberfläche | Pause → 👥 Mehrspieler (Einladung, Antwort einfügen, Gästeliste mit Entfernen), Hauptmenü → „Bei Freunden mitspielen“ | `index.html`, `src/main.js` |
| Tests | 90 Tests (neu: `net.test.js`, Mehrspieler-Ziel in `mobs.test.js`) | `tests/` |

Grenzen stehen in MULTIPLAYER.md (Vorrat der Gäste nur für den Besuch, Tiere nur um den Gastgeber, Fahrzeuge nicht geteilt, Story nur allein).

---

## 2h. Etappe 7 – Karte, Steuerung, Inventar, Klänge ✅

| Bereich | Umsetzung | Dateien |
|---|---|---|
| Weltkarte | entdeckte Chunks als Bitfeld je 32×32-Region (Base64, ~170 Zeichen je Region) im Spielstand `map`; Farben aus echten Blöcken oder aus dem Generator (Biomfarben), zwischengespeichert; Spieler mit Blickrichtung, Wegpunkt/Storyziel, bis 20 eigene Markierungen (umbenennen, Wegpunkt, löschen), Dörfer, Funkstationen, Unglücksort, Mitspieler; Ziehen, Zoom, Ort wählen. Zeichnet nur bei Bedarf, keine eigene Schleife | `src/worldmap.js`, `src/mapui.js`, `src/game.js` |
| Tastatur | alle 14 Aktionen frei belegbar (Tausch bei Doppelbelegung, Esc/Tab/1–9 fest), gespeichert in den Einstellungen | `src/controls.js`, `src/main.js` |
| Gamepad | Gamepad-API, Standard-Layout: Sticks, Springen, Abbauen/Setzen, Hotbar, Haken, Inventar, Karte, Pause; Abfrage läuft nur, solange ein Gamepad verbunden ist; ohne Mausfang kein Zwangs-Pausieren | `src/controls.js`, `src/main.js` |
| Touch | Tasten frei verschiebbar (Verschiebemodus aus den Einstellungen, Position als Bildschirmanteil gespeichert, Zurücksetzen) | `src/main.js`, `src/style.css` |
| Inventar | Ziehen & Ablegen auf/zwischen Hotbar-Plätzen, Platz ins Raster ziehen = leeren, Umschalt-Klick = freier Platz, Sortierung (Art/Name/Menge), Haltbarkeitsbalken | `src/main.js` |
| Klänge | ein AudioContext, drei Lautstärken (Effekte, Radio-Musik, Umgebung); Schritte je Untergrund, Platschen, Tierstimmen und Gegnergeräusche nach Abstand, Schalter-Klick, Maschinen/Funktor, Empfänger-Piepen, Auftrags-Melodie, Treffer | `src/audio.js`, `src/game.js` |
| Tests | 95 Tests (neu: `worldmap.test.js`, `controls.test.js`) | `tests/` |

„Stapel teilen“ aus Abschnitt 22 gibt es bewusst nicht: der Vorrat zählt je Blockart, die Hotbar verweist nur darauf. Ein Teilen hätte keine Wirkung (keine Fake-Funktion).

---

## 3. Gesamtplan (Abschnitte des Masterprompts → Etappen)

Reihenfolge nach den Prioritäten aus Abschnitt 33: Spielstände → Spielfähigkeit → Fehler → Handy → Desktop → Kernmechaniken → Story → Erweiterungen → Grafik.

| # | Abschnitt | Stand | Etappe | Nächster konkreter Schritt |
|---|---|---|---|---|
| 4 | Voxel-Engine | ✅ | 1 / 5 | Meshing im Web Worker ✅; Formblöcke (Treppen, Halbblöcke) wären der nächste Schritt |
| 4/5 | Weltgenerierung, Biome, Höhlen | ✅ | 1 | Biom-Tiere (Etappe 2), verlassene Minen/geheime Räume als Strukturen (Etappe 3) |
| 6 | Blocksystem | 🟡 | 1 ✅ / 3 | Formblöcke (Treppen, Halbblöcke, Zäune, Türen, Fenster) brauchen Nicht-Würfel-Meshing; Schilder, Möbel |
| 7 | Bauen | ✅ | 3b | Vorschau, Formen, Kopieren/Einfügen ✅; später Drehen beim Einfügen, Bauvorlagen |
| 8 | Crafting, Werkzeuge, Stationen | ✅ | 2 | später: Kochstelle, Schmelzen mit Zeitablauf, Werkzeug-Haltbarkeit je Stück statt je Stapel |
| 9 | Survival | ✅ | 2 | Betten/eigener Startpunkt, Rüstung (mit Gegnern, Etappe 3) |
| 10 | Tiere | ✅ | 2 | Biom-Tiere (z. B. Ziege, Pinguin), Züchten mit Futter, Beine animieren |
| 11 | Gegner, Kampf | ✅ | 3b | später Bogen, Bosse in Story-Kapitel 5 |
| 12 | Dörfer, NPCs | ✅ | 3b | später mehr Berufe, Gespräche mit Story-Bezug |
| 13 | Landwirtschaft | 🟡 | 3 ✅ | weitere Pflanzen (Karotte, Kartoffel), Bewässerung, Tierzucht |
| 14 | Fahrzeuge | ✅ | 5 | Boot, Lore, Schienen ✅; später Reittier, angetriebene Schiene |
| 15 | Story „Das große Rauschen“ | ✅ | 4 | später Bosskampf im „Herz des Rauschens“, Sprachzeilen der Bewohner je Kapitel |
| 16 | Funktechnik | ✅ | 4 | später Frequenzen (getrennte Netze), Antennen mit größerer Reichweite |
| 17 | Automatisierung | 🟡 | 4 | Signale mit Rechenlimit ✅; später Taktgeber, Verzögerung, Logik-Gatter, Förderband |
| 18 | Spielmodi | ✅ | 4 | Story nutzt die Überlebensregeln ✅ |
| 19 | Multiplayer | ✅ | 6 | WebRTC ohne Server ✅; später Vorrat der Gäste beim Gastgeber speichern, Fahrzeuge teilen |
| 20 | Smartphone | ✅ | 1 / 7 | Tasten verschiebbar ✅, Vorschau ✅; fehlt: Test auf echten Geräten |
| 21 | Desktop | ✅ | 7 | Tastenbelegung ✅, Gamepad ✅; später Gamepad-Belegung ändern, Bedienung der Menüs mit dem Gamepad |
| 22 | Inventar/HUD | ✅ | 1 / 2 / 7 | Ziehen, Schnellverschieben, Sortieren, Haltbarkeit ✅; Stapel teilen entfällt (Vorrat je Blockart) |
| 23 | Karten | ✅ | 7 | Weltkarte, Markierungen, Dörfer, Funkstationen ✅; später verlassene Minen eintragen |
| 24 | Speicher | ✅ | 1 | IndexedDB erst nötig, wenn Welten > ~1 MB werden (siehe unten) |
| 25/26 | Performance | 🟡 | 1 / 5 ✅ | Worker-Meshing ✅; echte Handymessungen fehlen |
| 27 | Entities | ✅ | 2–3b | Gegner und Dorfbewohner laufen auf dem Tier-Grundgerüst |
| 28 | Audio | 🟡 | 1 / 7 | Schritte, Wasser, Tiere, Gegner, Maschinen, Story ✅; Wetter und Türen fehlen, weil es kein Wetter und keine Türen gibt |
| 29 | Tests | ✅ | laufend | 95 Node-Tests + Browser-Durchläufe je Etappe (TESTING.md) |
| 31 | Doku | ✅ | laufend | README, GAMEPLAY, STORY, BLOCKS, CRAFTING, WORLD, PERFORMANCE, MULTIPLAYER, TESTING, PROGRESS |

---

## 4. Entscheidungen (mit Begründung)

- **Generator-Version im Spielstand (`gen`).** Alte Welten speichern nur Änderungen gegenüber der erzeugten Welt. Ein neuer Generator würde ihre Bauwerke in fremdes Gelände setzen. Darum: `gen` fehlt ⇒ Generator 1 (unverändert), neue Welten ⇒ Generator 2.
- **Weltgröße 96 statt 64.** Die Chunk-Indizes (`x + z·16 + y·256`) bleiben gleich, alte Änderungen passen weiter. Speicher je Chunk: 24 KB statt 16 KB.
- **Neue Story auf Generator 3, alte Story bleibt auf Generator 1.** Die neue Kampagne braucht Dörfer, Erze und Kristalle. Alte Story-Spielstände werden nicht umgerechnet, weil ihre Welt diese Dinge nicht hat (Begründung in STORY.md).
- **Funknetz ohne eigenes Spielstandfeld.** Netz-Blöcke sind normale Blockänderungen; ihr Zustand (an/aus) ergibt sich aus den Schaltern und wird beim Laden neu berechnet.
- **Kein Greedy Meshing (geprüft).** Der Mesher nutzt Ecken-Ambient-Occlusion und Atlas-Kacheln. Greedy Meshing bräuchte wiederholende Kacheln im Shader und würde AO-Verläufe zusammenlegen. Gemessen: ~850–1 100 Flächen je Chunk, Meshing ~2–3 ms (Node, Desktop-CPU). Der Gewinn rechtfertigt den Umbau derzeit nicht; der größere Hebel ist Meshing im Worker.
- **localStorage statt IndexedDB (vorerst).** Durch das kompakte Format belegen 100 000 Änderungen ~400 KB. Drei Welten plus Sicherungen passen in die üblichen 5 MB. Bei Speicher voll werden zuerst Sicherungen geopfert, der Hauptstand hat Vorrang, ein misslungenes Speichern verändert nichts. Wechsel auf IndexedDB, wenn Tiere/NPC/Maschinen viel Zustand bringen (Etappe 2/3).
- **Sicherungen außerhalb des Cloud-Präfixes** (`klotzfunk-bak.*`), damit das optionale Google-Sync nicht doppelt so viel hochlädt.
- **Keine neuen Bibliotheken.** Tests nutzen den in Node eingebauten Test-Runner.

---

## 5. Wie man weiterarbeitet

```bash
cd anmacha-klotzfunk-src
npm install
npm test          # alle Tests, ~2 s
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

### Abschlussprüfung gegen Abschnitt 34 (Stand 1.8.0)

| Kriterium | Stand | Beleg |
|---|---|---|
| Welt stabil generiert, große Bereiche erkundbar, Chunks laden/entladen | ✅ | `world.test.js` (Reihenfolge-Unabhängigkeit, Entladen), Streaming mit Zeitbudget, Worker-Meshing |
| Bauen/Abbauen, Crafting, Inventar | ✅ | `crafting.test.js`, `build.test.js`, Browser-Durchläufe Etappe 1–7 |
| drei Spielmodi spielbar, Story abschließbar, Welt danach frei | ✅ | `signal.test.js` (Story lösbar), STORY.md |
| Biome, Höhlen, Rohstoffe | ✅ | 15 Biome, Höhlen, Erze (`world.test.js`) |
| Tiere, NPCs, faire Gegner | ✅ | `mobs.test.js` (Sichtlinie, Angriffstakt, Höchstzahl, abschaltbar) |
| Survival nachvollziehbar | ✅ | `survival.test.js` |
| Funktechnik mit echter Funktion | ✅ | `signal.test.js`, Story-Kapitel 4–6 |
| Spielstände zuverlässig | ✅ | `storage.test.js` (alte Formate, Sicherung, voller Speicher) |
| Smartphones vernünftig bedienbar | 🟡 | in Headless-Chromium mit Handy-Größen geprüft; **kein Test auf echten Android-Geräten** |
| Desktop und Web stabil | ✅ | Browser-Durchläufe ohne JavaScript-Fehler |
| keine kritischen Blockaden bekannt | ✅ | – |
| Build entspricht dem Quelltext | ✅ | `npm run build` vor jedem Commit, Ergebnis eingecheckt |
| Doku beschreibt den echten Stand | ✅ | dieses Dokument, GAMEPLAY, TESTING, MULTIPLAYER, PERFORMANCE |

Damit sind alle geplanten Etappen umgesetzt. Offen bleibt vor allem, was sich hier nicht prüfen lässt (echte Handys).

### Wenn es weitergeht (Vorschläge, nach Nutzen sortiert)
1. Auf echten Android-Handys und iPhones spielen und messen (Bildrate, Akku, Bedienung), danach Grafikstufen nachschärfen.
2. Formblöcke (Treppen, Halbblöcke, Türen, Zäune) mit Nicht-Würfel-Meshing; dann auch Türgeräusche.
3. Wetter (Regen, Gewitter) mit Klängen und Einfluss auf Felder.
4. Ofen mit Brennzeit, Taktgeber und Logik-Gatter fürs Funknetz.
5. Mehrspieler: Vorrat der Gäste beim Gastgeber speichern, Fahrzeuge teilen.

---

## 6. Bekannte Einschränkungen (ehrlich)

- Gemessen wurde in Node (Desktop-CPU) und im Headless-Chromium mit Software-Grafik. **Echte Android-Geräte wurden nicht getestet.** Siehe PERFORMANCE.md und TESTING.md.
- Alte Story-Welten (vor 1.5) spielen weiter die 15 Aufträge; die neue Story gibt es nur in neuen Story-Welten.
- Das Funknetz kennt nur an/aus, keine getrennten Frequenzen; Funk geht durch Wände.
- Schmelzen und Kochen gehen sofort; der Ofen hat noch keinen Brennvorgang mit Zeit.
- Gegner gibt es nur im Überlebensmodus und in der neuen Story.
- Weizen wächst auch ohne Wasser in der Nähe und nur, solange gespielt wird (gespielte Zeit, nicht Echtzeit).
- Tiere haben keine Bein-Animation (nur Wippen beim Laufen) und vermehren sich nicht; ein Chunk wird nur einmal besiedelt.
- In alten Generator-1-Welten gibt es keine Erze, dort reichen die Werkzeuge bis Stein.
- Ein Gegenstand in der Hand ist im schmalen Hochformat am Handy kaum zu sehen (liegt am Bildrand); die Hotbar zeigt ihn.
- Es gibt kein Wetter und keine Türen, darum auch keine Wetter- oder Türgeräusche. Die Klänge wurden nur auf fehlerfreien Ablauf geprüft, nicht angehört.
- Das Gamepad wurde nur simuliert (Gamepad-API im Browser-Test), nicht mit einem echten Controller. Menüs bedient man weiter mit Maus oder Finger; das Gamepad steuert das Spiel, schließt Fenster und pausiert.
- Ziehen & Ablegen im Inventar geht mit der Maus; am Handy legt Antippen in den gewählten Platz.
- Die Weltkarte zeigt ein Farbfeld je 4×4 Blöcke; Bauwerke sind darauf nicht einzeln zu erkennen.
