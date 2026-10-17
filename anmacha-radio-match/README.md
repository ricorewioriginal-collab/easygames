# Royal Radio Match 3D

*Triff den Beat. Räume die Frequenzen frei!* – 3D-Match-3 (Three.js r128 aus `../vendor`, ohne Build-Schritt, komplett offline spielbar).
Live: https://ricorewioriginal-collab.github.io/easygames/anmacha-radio-match/

## Inhalt
- **200 Kampagnenlevel** in 10 Radio-Welten (je 20 Level), jedes 10. ein Spezial-Level, jedes 20. ein Welt-Finale (Boss). **10 Bonuslevel** (teils mit Zeitlimit).
- Jedes Level hat einen **gespeicherten Siegpfad** (`tests/solutions.json`), der in den Tests nachgespielt wird.
- Spezialteile: Wellenrakete (4er), Bassbombe (L/T), Funkdrohne (2×2), Frequenzkugel (5er), Remix-Orb (6er / großes Kreuz) und alle Kombinationen.
- 19 Hindernis-/Feldarten, 19 Missionsarten, 8 Booster im Level + 4 Start-Booster, Münzen nur durch Spielen, +5 Züge, Tagesbonus, kein Energiesystem.
- Funkhaus mit 10 ausbaubaren Etagen (sichtbare 3D-Requisiten), Figuren RAY und Mira Mix, überspringbare Zwischenszenen und Tutorials.
- Duell auf einem Gerät (2 Spieler) oder gegen die KI. Kein Online-Modus.
- Qualitätsstufen (Auto/Niedrig/Mittel/Hoch, Auto senkt bei Ruckeln), weniger Bewegung, Farbenblind-Modus, Tastatur und Controller, Zurück-Taste über die History.

## Aufbau
| Datei | Zweck |
|---|---|
| `src/core/engine.js` | Deterministische Spiellogik (Seed), liefert Ereignisse für die Animation |
| `src/core/defs.js`, `rng.js` | Bauteile, Hindernisse, Booster, Welten, Funkhaus; Zufall |
| `data/levels.js` | Erzeugte Level – **nicht von Hand ändern**: `node anmacha-radio-match/tools/author-levels.js` |
| `src/render/*` | Bühne (ein WebGL-Kontext), Spielbrett, Modelle, Funkhaus-Turm |
| `src/ui/*` | Menüs, HUD, Texte |
| `src/save/storage.js` | Spielstand `royal-radio-match-v2`, Migration aus `anmacha-radio-match-v1` (bleibt als Sicherung) |

## Tests
```
node anmacha-radio-match/tests/engine.test.mjs   # Spiellogik
node anmacha-radio-match/tests/levels.test.mjs   # alle Level + Siegpfade
node anmacha-radio-match/tests/save.test.mjs     # Spielstand + Migration
node anmacha-radio-match/tests/e2e.cjs           # Browser (Playwright): 360×800, 412×915, Desktop
```
