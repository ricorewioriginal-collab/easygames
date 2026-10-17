# Architektur von RicoLife 3D

RicoLife 3D ist eine eigenständige Browser-Anwendung (TypeScript, Three.js 0.180, Vite 7). Simulation und Darstellung sind getrennt: Die Simulation läuft ohne DOM und ohne WebGL und wird in Vitest direkt getestet.

## Ordner (`ricolife-src/src`)

| Ordner | Inhalt |
|---|---|
| `core/` | Zufall (`Rng`, deterministisch, speicherbar), Ereignisbus (`Bus`), Spieluhr (`Clock`, Tempo 0/1/3/10), Hilfsfunktionen |
| `data/` | Kataloge: Bezirke und Grundstücke (`lots.ts`), Figuren und Haushalte (`people.ts`), 174 Objekte (`objects.ts`), Requisiten, Merkmale/Lebensziele/Fähigkeiten (`traits.ts`), Stimmungen und Rezepte (`moodlets.ts`), Berufe (`careers.ts`), Ereignisse (`events.ts`), Geschichten (`stories.ts`) |
| `world/` | Raster-Welt 160×100 Kacheln, 2 Etagen (`world.ts`: Wände an Kanten, Böden, Objekte, Belegung, Platzprüfung), Gelände/Straßen (`map.ts`), Wegfindung A* (`nav.ts`), Bauvorlagen der 25 Grundstücke und Fertighäuser (`templates.ts`) |
| `sim/` | `Game` (Zustand, Geld, Beziehungen, Reservierungen), Aktionen und Warteschlange (`actions.ts`), 138 Interaktionen (`interactions.ts`, `socials.ts`, `life.ts`, `pets.ts`, `career.ts`, `phone.ts`), Autonomie (`autonomy.ts`), Bedürfnisse/Emotionen (`mind.ts`), Stadtleben und Besuche (`npcs.ts`), Geschichten/Ereignisse/Lebensziele (`stories.ts`), Wetter/Jahreszeiten/Rechnungen (`world-sys.ts`), Spielstart (`setup.ts`), Spielstände (`save.ts`), Interaktionsmenü (`menu.ts`) |
| `render/` | Stadt- und Grundstücks-Renderer (`world-view.ts`, `lot-builder.ts`, `static-world.ts`, `environment.ts`, `object-mesh.ts`), Figuren und Haustiere (`human.ts`, `pet.ts`, `anim.ts`), Figurenansicht mit Sprechblasen (`sims-view.ts`) |
| `build/` | Bau- und Kaufmodus mit Vorschau, Prüfung, Rückgängig/Wiederholen |
| `input/` | Kamera (`camera.ts`), Maus/Touch/Tastatur/Controller (`controls.ts`, eigene Gamepad-Abfrage, nicht `gamepad.js`) |
| `net/` | Mehrspieler über `../cloud/fire-peer.js` (Firebase-Vermittlung, WebRTC) |
| `ui/` | Oberfläche: Hauptmenü und Ladebildschirm, HUD, Interaktionsmenü, Handy, Stadtkarte, Figureninfo, Dialoge, Einstellungen/Hilfe, Figurenerstellung |
| `audio/` | Synthese-Klänge und generative Musik (WebAudio, erst nach Nutzergeste) |
| `app.ts`, `main.ts` | App-Kern (Schleife, Picking, Modi, Speichern, Mehrspieler-Dialog), Start und Service Worker |

## Ablauf eines Frames

1. `Controls.update` (gehaltene Tasten, Controller), `CameraRig.update` (weiche Kamera)
2. `Game.tick(dt)` → Systeme in fester Reihenfolge: `mind` (Bedürfnisse, Emotion), `sims` (Aktionen + Autonomie, Budget 4 Entscheidungen je Teilschritt), `career`, `life`, `pets`, `npcs`, `stories`, `world`. Minütliche, stündliche und tägliche Haken laufen über die Spieluhr.
3. Mehrspieler-Gastgeber sendet Zustand (~6 Hz)
4. `WorldView` gleicht geänderte Grundstücke ab (`lotVersion`), höchstens 3 Neuaufbauten je Frame; `SimsView` animiert nur Figuren in der Nähe der Kamera und gibt Modelle wieder frei
5. Render, HUD alle 250 ms, Dialoge, Autospeichern alle 5 Minuten

## Simulation

- **Aktionen:** `queued → route → perform → done`. Route sucht einen freien Platz (Slot) am Objekt, reserviert ihn und läuft per A* dorthin; ist er belegt oder unerreichbar, gibt es nach wenigen Versuchen eine Meldung statt Endlosschleife. Ziele, die unterwegs verschwinden (aufgegessen, verkauft, Gast weg), beenden die Aktion.
- **Autonomie:** Nutzenbewertung `Σ Vorteil × Dringlichkeit(Bedürfnis)` mit Merkmal-Vorlieben und Entfernungsabzug; gewählt wird gewichtet aus den besten vier. Einstellung 0 = aus, 1 = nur kritische Bedürfnisse, 2 = normal.
- **Stadt:** Ferne Stadtbewohner laufen abstrakt (Aufenthaltsort, stündlicher Plan); erst in Kameranähe werden sie zu vollen Figuren mit Wegen und Animation. So bleiben 47 Bewohner + Haushalte auch auf Handys bezahlbar (`maxNpcs`).
- **Geld:** `Game.money(hh, betrag, text, schlüssel)`; Buchungen mit Schlüssel (z. B. `pay:<figur>:<tag>`) werden nie doppelt ausgeführt.

## Mehrspieler

Gastgeber-autoritativ: Der Gastgeber simuliert, Gäste schicken nur Befehle (`cmd`, `cancel`, `chat`). Der Gastgeber prüft jeden Befehl mit denselben Verfügbarkeitsregeln wie im Einzelspiel und sperrt Haushaltsaktionen (Beruf, Umzug, Familie, Verkaufen). Der Zustand geht als kompakte Zeilen (Position, Animation, Emotion, Sprechblase) ~6× pro Sekunde raus, geänderte Grundstücke einzeln, die eigene Figur des Gastes einmal pro Sekunde. Gäste bauen nicht und speichern nicht; ihr Fortschritt (Fähigkeiten) bleibt im Profil. Verbindungsaufbau über `cloud/fire-peer.js` (Firebase REST, gleiches Projekt wie das Google-Speichern); keine neuen Firestore-Regeln nötig, da die vorhandene Online-Kopplung genutzt wird.
