# Architektur – RicoRail Simulator 3D

Eigenständiges Spiel im Ordner `ricorail/`. Quelltext in `ricorail/source/` (TypeScript, Three.js 0.180), gebaut mit esbuild zu **einer** klassischen Skriptdatei `ricorail/assets/ricorail-<prüfsumme>.js`. Zur Laufzeit gibt es kein Node, kein Vite, kein CDN und keinen localhost-Zugriff; das Spiel läuft von GitHub Pages (`/easygames/ricorail/`) und aus den lokalen App-Dateien.

## Schichten

| Schicht | Ordner | Aufgabe |
|---|---|---|
| Schema & Netz | `src/railway/` | `NetworkDef` (Knoten, Gleise, Weichen, Signale, Bahnhöfe, Industrien, Bahnübergänge, Langsamfahrstellen), `Network` (Gleisgeometrie, Positionen, Neigung), `builder.ts` (Streckenbaukasten), `validate.ts` (Prüfung vor dem Laden) |
| Stellwerk | `src/railway/interlocking.ts` | Fahrstraßen mit Flankenschutz, Weichenverschluss mit Teilauflösung, Gleisfreimeldung, eingleisige Abschnitte, Signalbegriffe, gestörte Signale |
| Fahrzeuge & Physik | `src/trains/`, `src/physics/` | Fahrzeugtypen und Garnituren, Zugkraft/Bremskraft, Haftwert (trocken, nass, Laub, Eis), Schleudern/Gleiten, Luftbremse mit Ansprechzeit, Dampfkessel, Sifa |
| Betrieb | `src/operations/` | `World`: fester Takt 50 Hz, KI-Fahrer mit Bremskurven, Disponent (Fahrstraßen nach Priorität), Fahrpläne, PZB-Spielmodell, Zs1, Wetter, Bahnübergänge |
| Inhalte | `src/data/` | 8 Strecken (`routes.ts`), Linien und Fahrpläne (`services.ts`), 64 Szenarien und Ränge (`scenarios.ts`) |
| Spielmodi | `src/modes/` | `Session` (Szenario, Ziele, Störungen, Wertung), `tycoon.ts` (Bahngesellschaft) |
| Darstellung | `src/engine/` | `world/` (Gelände in 500-m-Kacheln, Gleise, Oberleitung, Tunnel, Brücken, Bahnhöfe, Himmel, Wetter), `models/` (27 Fahrzeugkörper, 11 Führerstände, alles prozedural), `trains3d.ts`, `cameras.ts` |
| Bedienung | `src/input/`, `src/ui/`, `src/app/` | Tastatur/Gamepad/Touch, HUD, Gleisplan/Stellwerk (`map2d.ts`), Menüs (`app/main.ts`), Spielansicht (`app/game.ts`) |
| Ton | `src/audio/` | WebAudio-Synthese (keine Tondateien): Antrieb, Räder, Bremsen, Horn, Türen, Wetter, Ansagen per Sprachsynthese |
| Speicher | `src/save/` | 3 Profile, Autosave, Migration, Schreiben mit Prüfung, Editor-Netze in IndexedDB |
| Editor | `src/editor/` | Strecken-Editor auf demselben Schema, Undo, Prüfung, JSON-Export/-Import, Testfahrt |

## Datenfluss einer Fahrt
1. `main.ts` baut die `NetworkDef` (einmalig je Strecke, zwischengespeichert) und eine `Session`.
2. `Session.prerun()` lässt den Verkehr vorlaufen, damit Züge bei Spielbeginn schon unterwegs sind (Ladebalken).
3. `Game` erzeugt Renderer, `WorldView`, `TrainsView`, Kamera, HUD; `warmup()` lädt die Kacheln in Sichtweite (Ladebalken).
4. Jede Bildschirmrunde: Eingabe → Steuerwerte des Spielerzugs → `Session.update(dt)` (Simulation in festen 20-ms-Schritten) → Züge platzieren → Führerstand → Welt → Rendern → HUD → Ton.

## Präzision und Leistung
- Jede Kachel speichert Geometrie relativ zu ihrem Ursprung; große Koordinaten bleiben ohne Zittern.
- Eine statische Mesh-Gruppe je Kachel (wenige Draw-Calls), Signal-Lampen und Schwellen instanziert.
- Fahrzeug- und Führerstandsressourcen werden je Typ und Qualitätsstufe geteilt.
- Qualitätsstufen Niedrig/Mittel/Hoch/Automatisch (Sichtweite, Geländeraster, Schatten, Pixeldichte), Bildratenbegrenzung 30/60.
- HUD schreibt das DOM nur bei Änderungen (5 Hz), Minikarte 4 Hz.

## Speicher-Schlüssel
`ricorail.save`, `ricorail.save.prev`, `ricorail.backup.*` (Cloud-synchronisiert über `cloud/anmacha-cloud.js`, Präfix `ricorail.`). Editor-Netze liegen in IndexedDB, als Ersatz unter `ricorail_net.*` – bewusst außerhalb des Cloud-Präfixes, damit große Netze die Cloud-Größe nicht sprengen.

## Build
```
cd ricorail/source
npm ci
npm run typecheck && npm test
npm run build        # schreibt ricorail/index.html, assets/, sw.js, version.json
npm run test:e2e     # Chromium: Desktop, Handy, offline
```
Danach im Repo-Hauptordner: `node tools/build-sync.js` und `node tools/check-games.js`.
