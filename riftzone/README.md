# RIFTZONE

Ein eigenständiges 3D-Third-Person-Battle-Royale für Browser, Handy und Tablet. Bis zu 100 Teilnehmer springen aus
der **Riftfähre** über der Insel **Aurelia** ab, gleiten zu einem von 14 Orten, plündern Waffen und Ausrüstung, bauen
Deckung und überleben den schrumpfenden **Riftsturm**. Offline gegen Bots (Web Worker), online **ohne Server** (ein Gerät eröffnet einen Raum und ist selbst der Server,
Freunde treten mit dem 5-stelligen Code oder dem Link `?room=CODE` bei; Vermittlung über Firebase, gespielt wird direkt
per WebRTC) oder über einen eigenen Server – mit identischem Simulationscode überall.

Alle Modelle, Texturen, Klänge und die Musik werden im Code erzeugt; es gibt keine fremden Assets.

- **Spielen:** `riftzone/` in der easygames-Übersicht (GitHub Pages) – oder lokal `npm run preview`
- **Server einrichten:** [docs/SERVER.md](docs/SERVER.md)
- **Was genau umgesetzt ist (und was nicht):** [docs/FUNKTIONEN.md](docs/FUNKTIONEN.md)
- **Aufbau des Codes:** [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)

## Steuerung

| Aktion                        | Tastatur & Maus                    | Touch                                      | Gamepad                 |
| ----------------------------- | ---------------------------------- | ------------------------------------------ | ----------------------- |
| Laufen / Umsehen              | WASD / Maus                        | linker Stick (schwebend) / rechts wischen  | linker / rechter Stick  |
| Sprinten                      | Umschalt                           | Stick an den Rand ziehen oder »            | linken Stick drücken    |
| Springen, Gleiter, Abspringen | Leertaste                          | ⤒                                          | A                       |
| Ducken / Rutschen / Sturzflug | Strg                               | ⤓ (umschalten)                             | B                       |
| Feuern / Zielen               | Linke / rechte Maustaste           | Feuertaste (halten + wischen = zielen) / ◎ | RT / LT                 |
| Nachladen                     | R                                  | ↻                                          | Y                       |
| Interagieren                  | E (halten = wiederbeleben)         | eingeblendete Taste „Aufheben/Öffnen …“    | X                       |
| Waffen 1–5 / Spitzhacke       | 1–5 / F, Mausrad                   | Schnellzugriff antippen                    | LB / RB, Steuerkreuz ←  |
| Baumodus / Wand Boden Rampe   | Q / Z X C, Material V              | ▦ / Wand Boden Rampe Mat                   | rechten Stick drücken   |
| Karte / Inventar / Emotes     | M / Tab / B                        | ◫ / ☰ / ☺                                  | Select / ↓ / ↑          |
| Markierung                    | T                                  | auf der Karte tippen                       | Steuerkreuz →           |
| Pause                         | Esc                                | II                                         | Start                   |

Alle Tastaturbelegungen lassen sich unter *Einstellungen → Steuerung* ändern.

## Entwicklung

Voraussetzung: Node.js 20.19 oder neuer.

```bash
cd riftzone
npm install
npm run dev            # Vite-Entwicklungsserver (Client) auf http://localhost:5173
npm run server         # Spielserver im Entwicklungsmodus (Port 2610)
```

| Befehl                  | Zweck                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `npm run build`         | Typprüfung + Vite-Produktionsbuild nach `app/`                                     |
| `npm run build:esbuild` | Typprüfung + Produktionsbuild mit esbuild nach `app/` (gleiche Struktur, ohne Vite) |
| `npm run preview`       | gebauten Ordner `app/` lokal ausliefern (Port 4173)                                |
| `npm test`              | Unit- und Integrationstests (Node-Testrunner via tsx)                              |
| `npm run test:e2e`      | Browser-Test mit Playwright: Start → Lobby → Match → Karte/Inventar                |
| `node e2e/online.mjs`   | Online-Test: echter Server + zwei Browser in einer Gruppe im selben Match          |
| `node e2e/p2p.mjs`      | Online ohne Server: Raum eröffnen, zweiter Browser tritt per Code bei, Match (Firebase-Emulator nötig) |
| `npm run server:build`  | Server nach `server/dist/server.mjs` bündeln                                       |
| `npm run check`         | Typprüfung, Tests, Build, Browser-Test                                             |

Der gebaute Stand liegt eingecheckt in `app/` (wie bei PARTYVERSE), damit GitHub Pages und die easygames-App ihn ohne
Build-Schritt ausliefern. Nach Änderungen: `npm run build` (oder `build:esbuild`), danach im Repo-Hauptordner
`python3 tools/make-pwa.py riftzone` und `node tools/build-sync.js`.

> **Hinweis zum eingecheckten Build:** In der Entwicklungsumgebung, in der RIFTZONE entstand, war das npm-Registry nicht
> erreichbar. Three.js r180 und die Typdefinitionen kamen deshalb direkt aus den GitHub-Repositorys, und der Build in
> `app/` wurde mit `npm run build:esbuild` erzeugt (esbuild ist der Compiler, den Vite intern verwendet). Die
> Vite-Konfiguration (`vite.config.ts`) ist vollständig vorhanden, wurde aber dort nicht ausgeführt. Ebenso fehlt
> deshalb eine `package-lock.json`; sie entsteht beim ersten `npm install`.

## Technik

TypeScript · Three.js 0.180 (WebGL 2) · Vite bzw. esbuild · Web Audio API · Web Worker · WebSocket (`ws`) ·
eigene Kollisions-/Bewegungsphysik · eigenes Binärprotokoll. Lizenzen der Bibliotheken: [THIRD_PARTY.md](THIRD_PARTY.md).
