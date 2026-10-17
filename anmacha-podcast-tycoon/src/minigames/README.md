# Minispiele – Schnittstelle (AnMaCha Podcast Tycoon 3D)

Jedes der 24 Minispiele ist **eine eigene Datei** `src/minigames/<id-klein>-<name>.js` (z. B. `p01-pegel.js`, `t02-router.js`) und
registriert sich mit `PT.MG.define({...})`. Vorbild: `p01-pegel.js`. Die Dateien werden als klassische Skripte geladen (kein `import`),
im Browser über `window.PT`, in Node über `globalThis.PT`. Muster:

```js
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  MG.define({ id: 'T02', group: 'tec', ... });
})(typeof window !== 'undefined' ? window : globalThis);
```

## Pflichtfelder

| Feld | Bedeutung |
|---|---|
| `id` | `P01`…`F04` (siehe Liste unten) |
| `group` | `produktion`, `tec`, `quiz`, `roadtrip`, `party`, `feelgood` |
| `name`, `icon`, `short` | Anzeigename (deutsch), Emoji, ein Satz |
| `rules` | Array mit 2–6 kurzen deutschen Sätzen (Regeln, Sieg/Niederlage) |
| `controls` | `{ key, touch, pad }` – je ein kurzer Text |
| `touch` | Bildschirmtasten, Teilmenge von `left right up down a b 1 2 3 4` (Zeiger/Tippen geht immer) |
| `multi` | optional `{ local: true, max: 4, mode: 'turns' }` = lokal reihum mit gleichem Seed spielbar |
| `render` | `'2d'` (Standard) oder `'3d'` |
| `init(o)` | `o = { difficulty: 0|1|2, seed: uint32, players: [{name}], turn: 0 }` → **Zustand** (reines JSON-Objekt) |
| `input(st, a)` | verarbeitet eine Eingabe (siehe unten) |
| `update(st, dt)` | rechnet `dt` Sekunden weiter (feste 1/60 s) |
| `result(st)` | `{ won: boolean, score: 0..100 (Ganzzahl), detail: 'kurzer deutscher Satz' }` |
| `bot(st, goal)` | `goal = 'win' | 'lose'` → Array von Eingaben für diesen Schritt (für automatische Tests) |
| `draw2d(g, st)` | zeichnet in einen Canvas-2D-Kontext mit logischer Fläche **960 × 540** (der Rahmen skaliert) |
| `setup3d(three, st)` / `draw3d(h, st, dt)` / `dispose3d(h)` | nur bei `render: '3d'`, siehe unten |

## Zustand und Regeln

- Der Zustand enthält mindestens `status` (`'playing'`, dann `'won'` oder `'lost'`), `seed` (für `PT.rand(st)`), `fx: []`.
- **Zufall nur über `PT.rand(st)`, `PT.randInt(st,a,b)`, `PT.pick(st,arr)`, `PT.shuffle(st,arr)`** – nie `Math.random()` in der Logik.
  Gleicher Seed + gleiche Eingaben = gleiches Ergebnis (wird getestet).
- Spiel beenden mit `MG.finish(st, won)` (setzt Status genau einmal und spielt Sieg/Niederlage-Klang).
- Soundeffekte: `MG.fx(st, name)` mit `good bad tick win lose pop coin whoosh click beep buzz`, oder ein eigener Klang:
  `st.fx.push({ recipe: { parts: [ { wave: 'sine'|'square'|'sawtooth'|'triangle'|'noise', f: 440, f2: 880, t: 0, d: 0.3, v: 0.5,
  filter: { type: 'lowpass'|'highpass'|'bandpass', f: 1200, q: 1 }, lfo: { f: 6, depth: 30 } } ] } })` (`f2` = Endfrequenz, `t` = Start in s,
  `d` = Dauer in s, `v` = Lautstärke 0..1; `filter`, `lfo`, `f2` optional). Die Oberfläche spielt die Einträge ab und leert `st.fx`.
- Drei Schwierigkeitsstufen (0 Locker, 1 Standard, 2 Profi) verändern spürbar Zeit, Tempo, Fehlertoleranz oder Umfang.
- Spieldauer etwa 30–90 Sekunden (Standard). Es muss eine **echte Niederlage** geben (Zeit abgelaufen, zu viele Fehler, …).
- `result.score`: gewonnen → 50..100, verloren → 0..49 (wird getestet). `detail` erklärt das Ergebnis in einem Satz.
- Sowohl `bot(st,'win')` als auch `bot(st,'lose')` müssen auf **allen drei Stufen** und für beliebige Seeds zuverlässig zum Ziel führen
  (der Test spielt Seeds 7, 99991 und 4242). Der Gewinn-Bot darf den Zustand lesen (er „sieht“ die Lösung), Eingaben aber nur über
  `input` machen. Der Verlier-Bot macht absichtlich Fehler oder nichts. Innerhalb von 900 Spielsekunden muss das Spiel enden.
- Keine DOM-Zugriffe, kein `window`, kein `document` in `init/input/update/result/bot`.

## Eingaben

- Tasten: `{ type: 'key', key: 'left'|'right'|'up'|'down'|'a'|'b'|'1'|'2'|'3'|'4', down: true|false, p: 0 }`
  (Tastatur: Pfeile/WASD, Leertaste/Enter = `a`, E/Q/Backspace = `b`, Ziffern 1–4; Gamepad wird darauf abgebildet; Esc = Pause, macht die Oberfläche).
- Zeiger (Maus/Touch): `{ type: 'pointer', phase: 'down'|'move'|'up', x, y, p: 0 }` in logischen Koordinaten 0..960 × 0..540.
- Spiele müssen **sowohl mit Tasten als auch mit Zeiger** bedienbar sein (Touch-Geräte haben die `touch`-Tasten plus Tippen).
  Auswahl-Spiele: Pfeile bewegen eine sichtbare Markierung, `a` bestätigt; Tippen auf eine Option wählt direkt.

## Darstellung 2D

`draw2d(g, st)` zeichnet die komplette Szene im 960 × 540-Raum (Hintergrund selbst füllen). Schrift mindestens 18 px, hoher Kontrast,
Farben warm/neon im AnMaCha-Studio-Stil (dunkelblau `#10142a`, Akzente `#ffb02e`, `#6ef0ff`, `#ff4d6d`, `#4be08a`). Restzeit, Punkte
und Ziel immer sichtbar. Nur zeichnen, nichts am Zustand ändern. Sparsam: keine großen Objekte pro Bild anlegen.

## Darstellung 3D (`render: '3d'`)

Die Oberfläche teilt den einen WebGL-Renderer des Spiels: `setup3d(three, st)` bekommt `{ THREE, scene, camera }` (Three.js **r128**,
leere Szene, PerspectiveCamera) und gibt ein beliebiges Objekt `h` zurück. `draw3d(h, st, dt)` aktualisiert Objekte/Kamera je Bild.
`dispose3d(h)` gibt Geometrien/Materialien frei. Zusätzlich darf `draw2d` ein **transparentes** HUD darüber zeichnen (dann keinen
Hintergrund füllen). Einfache Lambert-Materialien, wenige Lichter, keine Schatten, wenige Draw-Calls.
Zeigereingaben kommen weiterhin in 960 × 540 an; bei fester Kamera einfach linear auf die Bodenfläche umrechnen.

## Liste und Einbindung in die Karriere (zur Orientierung, Belohnungen rechnet die Simulation)

| ID | Name | Inhalt |
|---|---|---|
| P01 | Mikrofon-Pegel | Pegel halten (Vorbild) |
| P02 | Soundmixer | mehrere Spuren mit Balance in ein Wertungsfenster bringen |
| P03 | Schnitt-Challenge | Abschnitte auf einer Timeline vor Ablauf der Zeit in die richtige Reihenfolge bringen, Fehler vermeiden |
| P04 | Studio-Störungssuche | logisch verknüpfter Signalweg (Mikro → Kabel → Interface → Mixer → Rechner → Kopfhörer), defektes Glied mit Messungen eingrenzen |
| T01 | Kabelnetz | Ports/Farben/Signalregeln zu durchgehender Verbindung verdrahten |
| T02 | Routerpakete | Paketwege nach Ziel/Netzsegment umleiten (Weichen schalten) |
| T03 | Kamerakalibrierung | Helligkeit, Schärfe, Weißabgleich auf Zielwerte einstellen |
| T04 | Akustikpuzzle | Schall-Reflexionen durch Absorberpositionen reduzieren (Raster, Strahlen) |
| Q01 | A–D-Blitzquiz | Fragen aus `PT.DATA.quiz.mc`, echte Antwortprüfung, Zeitdruck |
| Q02 | Wahr oder Quatsch | Aussagen aus `PT.DATA.quiz.tf` mit Erklärung |
| Q03 | Schätzduell | Schätzfragen aus `PT.DATA.quiz.est`, Abweichung → Punkte |
| Q04 | Geräuscheraten | 20+ algorithmisch erzeugte Klänge aus `PT.DATA.sounds`, 4 Antworten |
| R01 | Camper-Parken | lenkbares Fahrzeug (Fahrradmodell), Kollision, Zielfeld, Zeit/Fehler |
| R02 | Bahnhofsplanung | Abfahrt, Gleis, Anschlüsse, Zeitintervalle logisch kombinieren |
| R03 | Roadtrip-Navigation | Karte mit Wegpunkten, Hindernissen (Baustelle, Stau) und Zeitbudget |
| R04 | Mikrofon-Kurier | **3D**-Parcours, Gegenstände abholen und abgeben |
| Y01 | Mikrofonfangen | **3D**-Arena, fallende/rollende Mikros fangen, Gewinnerermittlung |
| Y02 | Beat-Session | Timing zu eigener Musik (`fx`-Klänge), einstellbare Latenztoleranz |
| Y03 | Spotlight | Scheinwerfer auf wechselnde Zielbereiche ausrichten |
| Y04 | Konfetti-Chaos | **3D**: Konfettikanonen mit Ziel-/Farb-/Zeitregeln |
| F01 | Hörerpost | Nachrichten sinnvoll kategorisieren (Lob, Frage, Themenwunsch, Kritik, Spam) |
| F02 | Interview-Rapport | Gesprächsfolgen/Beziehungslogik mit Gast (Dialogoptionen) |
| F03 | Gute-Nachrichten-Recherche | Quellhinweise kombinieren, echte Lösung finden |
| F04 | Geschenkepacken | Bestellungen/Größen/Ressourcen unter Zeitdruck erfüllen |

Inhalte: Deutsch mit echten Umlauten, freundlich-humorvoll, keine echten Marken, Sender, Serien, Songs oder Personen.

## Test

`node tools/test-podcast-tycoon-minigames.cjs [ID …]` – prüft Pflichtfelder, Sieg- und Niederlage-Bot je Stufe und Seed, Ergebnisformat,
Determinismus und dass `draw2d` ohne Fehler zeichnet.
