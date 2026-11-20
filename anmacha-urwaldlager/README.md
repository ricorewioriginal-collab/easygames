# Urwaldlager – Die Promi-Show (3D)

Eine Promi-Show im Dschungel – oder im TV-Studio – als 3D-Spiel für Browser, Handy, PC und TV. Du ziehst als Promi ins Lager, die (simulierten) Zuschauer schicken dich in Urwaldprüfungen, du sammelst Sterne fürs Abendessen, überstehst die Auszüge und kämpfst im Finale um die Krone.
Show, Moderatoren (Lotte Brandt, Mats Feldmann), Sanitäter Doc Rudi, Ranger Kalle, Camper, Sprüche und Logo sind frei erfunden und nur an das bekannte Format angelehnt – keine echten Personen, Logos oder Musik einer TV-Sendung.

## Spielen
`index.html` über einen Webserver öffnen (z. B. `python3 -m http.server` in der Repo-Wurzel). three.js r128 liegt unter `vendor/`, es wird kein CDN gebraucht.

## Ablauf einer Staffel
1. **Einzug** mit Moderation und Vorstellung der Camper, dann per Helikopter oder zu Fuß ins Lager – unterwegs die Gruppenprüfung „Dschungel-Marsch“ (alle Camper sammeln gemeinsam Sterne, Bonus fürs erste Abendessen), gleich danach die erste Prüfung.
2. **Morgens** wählen die Zuschauer, wer in die Prüfung muss – oft du, manchmal jemand anderes (dann gibt es eine Zusammenfassung).
3. **Urwaldprüfung** in 3D (9 Stück, siehe unten). Jeder Stern ist eine Portion fürs Camp. Abbruch jederzeit mit dem Satz „Ich bin raus aus dem Urwald!“.
4. **Camp:** frei herumlaufen, Check-up bei Sanitäter Doc Rudi im Sani-Zelt, Ranger Kalle auf seiner Runde ansprechen (Tipps, manchmal ein Hinweis auf die Schatzkiste), Holz holen und das Feuer schüren, Wasser abkochen, Klo putzen, mit Campern reden (plaudern, Komplimente, Witze, trösten, lästern, Bündnisse), Buschtelefon, Schatzkiste mit Rätsel, zufällige Ereignisse. Vier Aktionen pro Tag. Hunger 🍗 und Schlaf 😴 zählen mit: hungrig oder müde gibt es eine Aktion weniger. Zwei **Luxusartikel** pro Camper (Kissen, Kaffee, Schokolade, Foto, Karten, Mundharmonika, Tagebuch) mit eigenen Vorteilen, bei Abbruch einer Prüfung zwei Tage Entzug. Sichtbares **Zuschauer-Voting**: morgens für die Prüfung, in der zweiten Hälfte die Anrufe beim Rauswählen. Jede dritte Nacht spielst du die **Nachtwache** (Feuer am Leben halten, Tiere von den Vorräten verscheuchen).
5. **Abendessen** am Feuer – so viel, wie Sterne geholt wurden. Teilen, zugreifen oder verzichten.
6. **Auszug** in den letzten Tagen: Die Zuschauer entscheiden, wer gehen muss.
7. **Finale** mit drei Gängen (Vorspeise, Hauptgang, Nachtisch) und **Krönung** zum Urwaldkönig / zur Urwaldkönigin.

Die Zuschauerstimmung ist eine offene Simulation: 45 % Sympathie, 30 % Unterhaltung, 25 % Prüfungsleistung (sichtbar in der Buschtrommel).

## Camp-Leben
Holz und Wasser holen, Feuer schüren, Kochspiel am Topf (Hitze-Leiste, drei Zutaten), Lagerfeuer-Gespräche mit Entscheidungen nach dem Essen, Freundschaften (💚) und Zoff (⚡) am Namensschild und in der Buschtrommel.

## Wetter
Jeden Morgen Sonne, Tropenregen oder Gewitter (`js/weather.js`): Regenstreifen, dunklere Lichter, Blitze, Donner und Regenrauschen im Dschungel; Prüfungen mit weniger Zeit, schlechterer Schlaf, außer jemand spannt die Plane. Test: `&wx=regen|gewitter`, `WX=gewitter node tests/trial-runner.cjs <id>`.

## Prüfungen
Ekel-Kisten · Dschungel-Dinner · Schlammbecken (tauchen) · Wackelsteg · Krabbel-Tunnel · Ekel-Dusche · Wissens-Tank · Schlamm-Parcours · Lianen-Rutsche · Schlangengrube · Höhlenlabyrinth (Taschenlampe) · Floßrennen · Kletterwand, dazu das IBES-Fan-Quiz (deutsche und britische Show) und der Gruppenmarsch ins Lager – jede im Dschungel und im Studio spielbar, auch einzeln über „Prüfungen spielen“.

## Steuerung (ein Bedienkonzept für alle Geräte)
| Aktion | Tastatur | PlayStation | Switch | Handy |
|---|---|---|---|---|
| Laufen | WASD / Pfeile (Shift rennt) | linker Stick (L3 rennt) | linker Stick | Stick links |
| Kamera | Maus | rechter Stick | rechter Stick | rechts wischen |
| Bestätigen / Kommando | E, Leertaste, Enter | ✕ | A | grüne Taste |
| Zweite Aktion (Ducken, Springen …) | F | □ | Y | zweite Taste |
| Zurück | Backspace | ○ | B | ↩ |
| Buschtrommel | Tab / M | △ | X | 🥁 |
| Kommandomenü | 1–9 oder Pfeile | Steuerkreuz | Steuerkreuz | antippen |
| Pause | Esc / P | Options | + | ❚❚ |
| Prüfung abbrechen | H halten | Create halten | − halten | ❚❚ → Abbruch |

## Technik
- Klassische Skripte ohne Build: `js/core.js`, `data.js`, `input.js`, `audio.js`, `assets.js`, `render.js`, `ui.js`, `stage.js`, `trials/*.js`, `camp.js`, `show.js`, `menus.js`, `main.js`.
- Menschen: echte Figuren aus der Microsoft Rocketbox Avatar Library (MIT) für Camper, Moderatoren, Doc Rudi, Ranger Kalle und die eigene Figur (im Editor unter „Person“, Comic-Figur weiter wählbar), Camper, Spielerfiguren und Ranger in Camp-Kleidung (Khaki, Oliv, Camp-Rot, Cargohosen, Stiefel); Umwandlung und Umfärben mit `tools/urwaldlager-rocketbox/`.
- Modelle: KayKit, Kenney, Quaternius, Wizp (alle CC0) – Herkunft in [models/LIZENZ.md](models/LIZENZ.md), Aufbereitung mit `tools/make-urwaldlager-assets.mjs`.
- Musik und Geräusche entstehen per Web Audio im Browser, Moderationen optional per Sprachausgabe.
- Testpilot: `index.html?trial=<id>&theme=studio&bot=1` spielt eine Prüfung automatisch (`tests/trial-runner.cjs`).
