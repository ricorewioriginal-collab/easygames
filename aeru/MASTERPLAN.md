# AERU – Bestandsaufnahme und Umsetzungsplan

Stand: 13.11.2026. Grundlage ist der Code in diesem Ordner, keine Annahmen. Vorbilder sind klassische 3D-Platformer (Designprinzipien,
keine Inhalte). Figuren, Namen, Story und Level sind eigen.

## Phase 1 – Technische Bestandsaufnahme

**Technik**
- Three.js r128 (WebGL 1/2), reines JavaScript ohne Build-Schritt: `game.js` (Spiel, ~2100 Zeilen), `content.js` (7 Welten),
  `story.js` + `quests.js` (Kapitel, Quests, Spielstand v3), `style.css`, `index.html`.
- Modelle: `models/*.glb` über GLTFLoader (KayKit, Quaternius u. a., alle CC0, siehe `models/LIZENZ.md`).
- Feste Simulation mit 60 Hz (`TICK`), Rendering entkoppelt; Qualitätsstufen sparsam/ausgewogen/hoch mit automatischer Wahl.
- Läuft im Browser, als PWA, in der Android-App (WebView) und eingebettet; Controller über `../gamepad.js`.

**Spieler-Controller** (`movePlayer`)
- Zustände: Boden, Sprung (variable Höhe, Coyote Time, Sprungpuffer), Gleiten, Flug, Ausweichen/Rammen, Ansturm, Kopfstoß,
  Schwimmen, Klettern. Die Zustände sind Flags im `state`-Objekt, ein Zustand pro Situation; Übergänge sind in Tests abgedeckt
  (`tests/logic.cjs`, `tests/spyro.cjs`).
- Schwäche: Die Flags sind nicht als eigene State-Machine-Objekte gekapselt. Ein Umbau lohnt erst, wenn weitere Zustände dazukommen
  (siehe Phase 2).

**Kamera** (`updateCamera`): Verfolgerkamera mit Kamerahilfe, weichem Nachziehen (exponentiell), Ausweichen vor Baumkronen,
Boden-Untergrenze und seit Schritt 9 vor Tafelbergen. Maus, rechter Stick und Touch drehen sie, die Empfindlichkeit ist einstellbar.

**Kollision**: `solids` (Kreis-Inseln und Quader-Plattformen mit Oberkante, Kantenhilfe bis 1,3 m), `treeColliders`
(Stamm/Krone als Kreise). `floorAt()` liefert die höchste Fläche unter einem Punkt. Schrägen gibt es nicht; Höhen entstehen
über Stufen.

**Levelaufbau** (vor Schritt 9): Jede Welt bestand aus schwebenden Inseln über dem Nichts (Hauptland, vier Gebiete über
Brücken, drei Himmelsinseln, in Welt 1 der Heimathain). Wer fiel, wurde unter y = −16 zurückgesetzt.

**Grafik und Performance**: InstancedMesh je Modellteil, gemeinsame Geometrien und Materialien, Schattenkarte nur in der Nähe.
Messung im Browsertest (Software-Rendering, nicht repräsentativ für echte Geräte): rund 200–270 Draw Calls, rund 200 000 Dreiecke.

**Konkrete Schwachstellen**
1. Welt fühlte sich wie Einzelinseln an, viele Stellen zum Herausfallen. → in Schritt 9 behoben (Talboden).
2. Ebenen ohne Schrägen: Gelände wirkt kantig, Höhenebenen nur über Stufen und Inseln.
3. Alle 7 Welten nutzen denselben Grundriss (Hauptland + 4 Gebiete an gleichen Stellen), nur Farben und Gegner unterscheiden sich.
4. Wenig Vertikalität innerhalb der Gebiete (Stufenturm, Klippe, Himmelsinseln).
5. Keine Höhlen und Innenräume.
6. Draw Calls schwanken mit Anzahl Einzelmeshes (Plattformen, Felsen); hier lässt sich weiter bündeln.
7. Keine echten Gerätetests (Handy, TV, Konsole) möglich in dieser Umgebung.

## Umsetzungsplan (priorisiert nach Spielgefühl → Bewegung → Leveldesign → Performance → Optik)

| Phase | Inhalt | Status |
| --- | --- | --- |
| 1 | Bestandsaufnahme (dieses Dokument) | erledigt |
| 2 | Bewegung und Kamera: Zustände als kleine State-Machine kapseln, Landungsrolle, Kamera-Kollision mit allen Wänden, Kamera hebt sich beim Gleiten | offen |
| 3 | Weltenarchitektur: **Talboden mit Tafelbergen, Felstreppen, Weltgrenze** (Schritt 9). Danach eigener Grundriss je Welt über Daten in `content.js` | Talboden erledigt |
| 4 | Leveldesign je Welt: Hauptpfad mit Landmarke, Rundwege, 3 Höhenebenen, versteckter Bereich, Höhle, ein besonderer Moment | offen |
| 5 | Gameplay: Schlüssel und Schatzkammer je Welt, weitere Zeit- und Flug-Challenges, Fähigkeiten-Upgrades | teilweise (Flugprüfung, Kopfstoß, Schwimmen, Klettern) |
| 6 | Performance: Plattformen und Felsen bündeln, LOD für Modelle, Messung auf echten Geräten | offen |
| 7 | UI: Weltkarte und Levelauswahl im Pausemenü, Questübersicht | teilweise (Tagebuch, Minikarte) |
| 8 | Tests und Fehlerbehebung nach jeder Phase | laufend |

**Architekturentscheidung Gelände (vor Phase 4 klären)**

| Weg | Vorteile | Nachteile |
| --- | --- | --- |
| A. Bestehende Flächen + Stufen weiter nutzen | sicher, alle Tests bleiben gültig, schnell | Gelände bleibt kantig |
| B. Höhenfeld-Gelände (Heightmap) je Welt mit Schrägen | organische Hügel, Täler, Schluchten wie im Vorbild | `floorAt`, Kollision, Kamera und alle Platzierungen müssen umgestellt werden; größter Umbau |
| C. Mischform: Höhenfeld nur für den Talboden, Inseln bleiben Flächen | organischer Boden, Inseln unverändert | zwei Bodenarten in der Kollision |

Empfehlung: **C**, weil es den größten sichtbaren Gewinn bei begrenztem Risiko bringt. Dieser Umbau wird erst nach Freigabe gemacht.

## Regeln für jede Phase

Kleine PRs, nach jeder Phase alle Tests (`node tests/*.cjs`, Browsertest), Regressionen prüfen, `PROGRESS.md` ehrlich nachführen.
