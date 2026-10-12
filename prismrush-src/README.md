# PRISMRUSH

Ein hypnotisches 3D-Rhythmusspiel für Browser und Smartphones. Die Musik wird in Echtzeit synthetisiert und
verwandelt sich in Neonstrecken, pulsierende Tunnel, Kristalle, Orbs und Prismenwände. Alle Grafiken und Klänge
entstehen prozedural, es gibt keine externen Bild- oder Audiodateien.

**Technik:** TypeScript, Three.js, Vite, Web Audio API, eigene DOM-Helfer (kein UI-Framework), PWA.

## Spielen

| Aktion                      | Tastatur                     | Maus               | Touch                                  |
| --------------------------- | ---------------------------- | ------------------ | -------------------------------------- |
| Spur wechseln (trifft dort) | `←` / `→`                    |                    | Wischen links/rechts                   |
| Spur wählen und treffen     | `A` `S` `D` oder `J` `K` `L` | Klick auf die Spur | Spurtasten unten, auch darüber gleiten |
| In aktueller Spur treffen   | `Leertaste`, `↑`, `↓`, `W`   |                    | Tippen auf den Bildschirm              |
| Overdrive (doppelte Punkte) | `E` oder `Umschalt`          |                    | ⚡ oder nach oben wischen              |
| Pause                       | `Esc` oder `P`               |                    | II-Knopf                               |

- **Kristalle** im Takt treffen, wenn sie den Ring unter dem Gleiter erreichen: Perfekt, Super, Gut oder Verfehlt.
- **Rhythmus-Orbs** werden eingesammelt, wenn du in ihrer Spur bist.
- **Prismenwänden** weichst du aus. Sie kosten Energie und brechen die Combo.
- **Combo** erhöht den Multiplikator bis ×4, **Overdrive** verdoppelt ihn für 16 Schläge.

### Inhalte

- **Kampagne:** 32 Level in 4 Welten (Synthwave, Trance, Techno, Drum & Bass) mit 4 Schwierigkeitsgraden, Sternen und Highscores.
- **Endlos:** unendlich generierte Musik mit steigender Dichte und Geschwindigkeit, Bestzeiten je Schwierigkeit.
- **Tagesrhythmus:** jeden Tag ein neues, für alle gleiches Stück.
- **Zen:** ohne Scheitern und Wandschäden.
- **Präzision:** ein Fehler beendet den Lauf, dafür 1,5-fache Punkte.
- **Sprint 90:** 90 Sekunden Punktejagd auf generierter Musik, die immer schneller wird.
- **Remix:** jedes Mal ein neues Zufallsstück mit eigener Strecke und Farbwelt.
- **Spiegelwelt:** alle Level mit vertauschten Seiten.
- **Turbo:** Musik und Strecke 30 % schneller, 1,4-fache Punkte.
- **Blindflug:** Kristalle verblassen kurz vor dem Gleiter, 1,3-fache Punkte.
- **Gleitflug:** nur lenken, Kristalle in der eigenen Spur werden automatisch eingesammelt.
- **Wandlauf:** doppelt so viele Wände, jede ausgewichene Wand bringt Punkte.
- **Tutorial:** interaktiv mit Hinweisen zu Treffern, Spuren, Orbs, Wänden und Overdrive.
- **19 freischaltbare Effekte:** Gleiter, Lichtspuren, Farbwelten und Trefferexplosionen.
- **Einstellungen:** Lautstärken, Audio-Latenz mit Kalibrierung, Grafikqualität (automatisch mit FPS-Anpassung), Touch-Tasten, Kamerawackeln, Vibration, reduzierte Bewegung.
- Spielstände, Rekorde, Bestzeiten und Einstellungen werden lokal im Browser gespeichert.

## Entwicklung

Voraussetzung: Node.js 20.19 oder neuer.

```bash
npm install
npm run dev          # Entwicklungsserver auf http://localhost:5173
```

| Befehl                            | Zweck                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run build`                   | Typprüfung und Produktionsbuild nach `dist/`                   |
| `npm run preview`                 | Produktionsbuild lokal ansehen (Port 4173)                     |
| `npm test`                        | Unit-Tests mit Vitest                                          |
| `npm run test:e2e`                | End-to-End-Tests mit Playwright (Desktop, Handy hoch und quer) |
| `npm run lint`                    | ESLint                                                         |
| `npm run format` / `format:check` | Prettier                                                       |
| `npm run check`                   | alles nacheinander                                             |
| `npm run icons`                   | PWA-Icons neu erzeugen                                         |

Für die Playwright-Tests einmalig den Browser installieren: `npx playwright install chromium`.

## Deployment im Repository easygames

Dieser Ordner (`prismrush-src/`) enthält den Quelltext, das gebaute Spiel liegt eingecheckt in `../prismrush/`
und wird über GitHub Pages unter `https://ricorewioriginal-collab.github.io/easygames/prismrush/` ausgeliefert.

Nach Änderungen neu bauen und das Ergebnis übernehmen:

```bash
npm run build:easygames   # baut nach dist/ und kopiert nach ../prismrush/
```

Gebaut wird mit relativen Pfaden (`./`), daher funktioniert das Spiel in jedem Unterordner. Für einen anderen
festen Pfad: `BASE_PATH=/<pfad>/ npm run build`.

## Architektur

```
src/
  audio/    engine.ts (Web Audio, Synthesizer, Lookahead-Scheduler), music.ts (prozeduraler Komponist), theory.ts
  core/     dom.ts (DOM-Helfer), storage.ts (Spielstände), fsm.ts (Spielzustände), rng.ts, math.ts
  game/     levels.ts, chart.ts (Noten aus der Musik), track.ts, session.ts (reine Spiellogik),
            scoring.ts, modes.ts, difficulty.ts, unlocks.ts, tutorial.ts
  input/    actions.ts (Eingabeabstraktion), gestures.ts, input.ts
  render/   world.ts (Three.js-Szene, Bloom), particles.ts, palette.ts
  ui/       menus.ts, hud.ts
  app.ts    verbindet alles, main.ts startet die App
tests/      Vitest-Unit-Tests
e2e/        Playwright-Tests
```

**Synchronität:** Musik und Spielereignisse teilen dieselbe Zeitbasis (16tel-Schritte). Die Audiouhr
(`AudioContext.currentTime`) ist die einzige Zeitquelle für Gameplay und Darstellung. Eingaben werden über ihren
Zeitstempel auf Songzeit umgerechnet, Ausgabelatenz und Benutzerkalibrierung werden berücksichtigt.
