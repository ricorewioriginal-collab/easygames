# BLOCKVERSE 3D

Voxel-Sandbox im Browser (Three.js + Vite). Prozedurale Welt mit Gras, Erde, Stein, Sand, Holz, Blättern, Wasser und Bäumen,
Tag-Nacht-Wechsel, Chunk-System, Abbauen/Setzen, Hotbar, Inventar mit Herstellen, 3 Speicherplätze (localStorage).
Dazu 16 Blöcke mit den AnMaCha-Senderlogos (Inventar → Funk-Logos; Quelle `public/logos/`, 128 px). Für PC (Maus + Tastatur) und Smartphone (Touch-Steuerung). Alle Texturen und Geräusche werden im Browser erzeugt – keine Assets.

## Spielen
- **Online:** `anmacha-blockverse/` (fertig gebautes Ergebnis, wird mit GitHub Pages ausgeliefert, in der Spieleliste verlinkt).
- **Lokal aus dem Build:** `anmacha-blockverse/` über einen beliebigen Webserver öffnen (z. B. `python3 -m http.server`).

## Entwickeln (Vite)
```bash
cd anmacha-blockverse-src
npm install
npm run dev        # Entwicklungsserver mit Hot Reload
npm run build      # schreibt das Ergebnis nach ../anmacha-blockverse/ (wird eingecheckt)
```
Nach Änderungen am Quelltext immer `npm run build` ausführen und den Ordner `anmacha-blockverse/` mit committen.

## Steuerung
| | PC | Smartphone |
|---|---|---|
| Laufen | WASD | linke Bildschirmhälfte wischen (weit ziehen = rennen) |
| Umschauen | Maus (Klick ins Bild aktiviert Pointer Lock) | rechte Bildschirmhälfte wischen |
| Springen | Leertaste | Taste „Sprung“ |
| Abbauen / Setzen | Linksklick / Rechtsklick (gedrückt halten wiederholt) | Tasten „Abbauen“ / „Setzen“ |
| Block wählen | 1–9, Mausrad | Hotbar antippen |
| Inventar | E | 🎒 |
| Fliegen (Kreativ) | F oder Leertaste doppelt | Taste „Fliegen“ |
| Pause / Speichern | Esc | ⏸ |

Modi: **Überleben** (abgebaute Blöcke landen im Inventar, Herstellen: Holz → Bretter, Sand → Glas, Glas + Holz → Leuchtblock) und **Kreativ** (unbegrenzte Blöcke, Fliegen).
Die Welt wird alle 30 Sekunden, beim Pausieren und beim Verlassen der Seite automatisch gespeichert. Nur geänderte Blöcke werden abgelegt.

## Aufbau
- `src/world.js` – Block-Typen, Terrain (Value-Noise), Bäume, Chunk-Speicher, Änderungen
- `src/mesher.js` – Flächen-Culling, weiche Beleuchtung (Ambient Occlusion + Himmelslicht), je Chunk bis zu drei Meshes
- `src/textures.js` – prozedurale Texturen (64 px, nahtlos), Logo-Atlas, Wolken
- `src/physics.js` – Spieler-Kollision, Wasser, Raycast
- `src/game.js` – Rendering, Streaming, Tag/Nacht, Bauen/Abbauen, Speicherstand
- `src/main.js` – Menüs, HUD, Tastatur/Maus/Touch
