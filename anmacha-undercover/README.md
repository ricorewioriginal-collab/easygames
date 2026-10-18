# AnMaCha UNDERCOVER 3D – Wem kannst du trauen?

3D-Spiel für 4–12 Spieler, bei dem herausgefunden werden muss, wer lügt. Läuft im Browser, auf dem Handy und in der easygames-App, allein gegen Bots oder online mit Freunden.

## Modi

| Modus | Kurz |
|---|---|
| **Verräter-Jagd** (`jagd`) | Crew erledigt Aufgaben, Verräter knipsen aus und sabotieren, Besprechungen mit Abstimmung |
| **Das geheime Wort** (`wort`) | Alle kennen das Wort, nur der Imposter nicht – Hinweise, Diskussion, Abstimmung, Rateversuch |
| **Detektiv** (`detektiv`) | Spuren untersuchen, Fallakte führen, in der Besprechung vorlegen; Verräter manipulieren Spuren |
| **Chaos-Schicht** (`chaos`) | Viele Sabotagen, die Crew muss die Qualität halten |
| **Jagen** (`jagen`) | Läufer aktivieren Funkbaken und fliehen, Jäger fangen sie |
| **Rollen-Mix** (`rollen`) | Sonderrollen (Scanner, Schild, Kurier, Störsender, Wandler …) |

Dazu 6 Karten (Funkhaus, Radio City, Express, Festival, Insel, Orbital), 24 Minispiele in 3 Stufen, 553 Wörter in 11 Kategorien, ein Figuren-Editor, 34 Erfolge, Einstellungen (Tasten belegen, Grafikstufe, Lautstärke) und Hilfe zu jedem Modus.

## Steuerung

- **PC:** WASD/Pfeile laufen, E benutzen, F melden, Leertaste Spezialaktion, V Geheimgang, G Sabotage, T Fähigkeit, Shift Sprint, M Karte, Tab Aufgaben, Enter Chat. Alle Tasten sind änderbar.
- **Handy/Tablet:** Joystick links, Aktionsknöpfe rechts, die sich je nach Lage ändern.
- **Controller:** Standard-Gamepad über die Gamepad-API (A benutzen, X melden, B Spezial …). `../gamepad.js` wird bewusst nicht eingebunden.

## Online

- Läuft über `../cloud/fire-peer.js` (Firebase-Vermittlung, dann direkte WebRTC-Verbindung). Der Gastgeber rechnet das Spiel, Gäste bekommen nur ihre eigene Sicht (keine fremden Rollen, kein geheimes Wort).
- Einladung per Code, Link oder QR-Code. Links zeigen immer auf `https://ricorewioriginal-collab.github.io/easygames/anmacha-undercover/?join=CODE`.
- Geht der Gastgeber, endet die Runde für alle neutral (ohne Sieger).
- **Öffentliche Räume** brauchen den Block `match /undercover_pub/{code}` aus `cloud/firestore.rules`. Solange die Regeln nicht in Firebase veröffentlicht sind, zeigt das Spiel „Freischaltung erforderlich“ statt einer Liste.

## Aufbau

```
index.html, style.css, card.svg, manifest.webmanifest, sw.js
src/main.js            Lader (Fortschrittsbalken, 3 Versuche je Datei)
src/core/              Spiellogik (Simulation, Aufgaben, Sabotage, Besprechung, Wortspiel, Regeln)
src/ai/                Bots (Wegfindung, Gedächtnis, Diskussion, Wortspiel-KI)
src/data/              Karten, Rollen, Fälle, Wörter, Figurenteile
src/network/           Protokoll, Gastgeber/Gast, öffentliche Räume
src/world/             3D-Darstellung mit Three.js r128 (../vendor)
src/input/, src/ui/    Eingabe, Touch, Menüs, HUD, Minispiele, Editor, Erfolge, Einstellungen, Hilfe, Ton
tests/                 Node-Tests ohne Browser
```

Gespeichert wird unter dem Präfix `anmachaUndercover` (Cloud-Sync über `../cloud/anmacha-cloud.js`).

## Tests

```
node tests/tasks.test.js       # 24 Minispiele × 3 Stufen × 30 Seeds (2168 Prüfungen)
node tests/online.test.js      # Protokoll, Schwärzung der Sichten, Betrugsschutz (46717 Prüfungen)
node tests/bots.test.js 100    # 100 reine Bot-Partien je Modus (5959 Prüfungen)
```

Stand der letzten Läufe: alle bestanden. Siege in 100 Bot-Partien je Modus: Jagd 47 Verräter / 53 Crew, Detektiv 28/72, Chaos 24/76, Jagen 29 Jäger / 71 Läufer, Rollen 39/61, Wortspiel 61 Imposter / 39 Crew.

Zusätzlich im Browser (Chromium mit Software-Grafik) geprüft:
- Solo-Partien Verräter-Jagd und Wortspiel am PC und in Handygröße (390×844), ohne Fehler in der Konsole.
- Online mit zwei Browsern (PC-Gastgeber + Touch-Handy als Gast): Beitritt per `?join=`, Spielstart, keine Geheimnisse in der Gast-Sicht, Bewegung des Gasts kommt beim Gastgeber an, neutrales Ende, wenn der Gastgeber geht.

## Grenzen (ehrlich)

- Nicht auf echten Handys, echten Grafikkarten oder mit echtem Controller getestet, nur in Chromium mit Software-Grafik.
- Die Töne werden im Browser erzeugt; angehört hat sie bisher niemand.
- Gäste haben keine Bewegungsvorhersage: sie sehen den Stand des Gastgebers etwa alle 100 ms, bei schlechter Verbindung wirkt das ruckelig.
- Online braucht Firebase und WebRTC. In sehr strengen Netzen (manche Firmen-/Schul-WLANs) kann die direkte Verbindung scheitern.
- Grafikstufe „Mittel“ braucht bei 12 Figuren im Bild etwa 180 Zeichenaufrufe, mehr als geplant. Auf schwachen Geräten „Niedrig“ wählen (etwa 110).
- Die Bots spielen das Wortspiel noch etwas zugunsten des Imposters (rund 61 %).
- Die englische Sprache ist nur teilweise übersetzt; Wörter und Bot-Texte gibt es nur auf Deutsch.
- Keine Werbung, keine Bezahlinhalte. Alle Figuren, Karten und Texte sind eigene Entwürfe.
