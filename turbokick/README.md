# TURBOKICK

3D-Auto-Fußball im Browser: Spiele mit deinem Boliden und Nitro eine große Plasmakugel ins gegnerische Tor. **Eigene Fahrzeuge, Arenen, Namen, Musik und Klänge** (nichts davon stammt aus einem bestehenden Spiel; alles wird im Browser erzeugt, es gibt keine Bild- oder Audiodateien).

- **Modi:** schnelles Spiel gegen Bots (1v1, 2v2, 3v3, 4 Stufen), **Splitscreen zu zweit** (gegeneinander oder zusammen gegen Bots), Training (freies Spiel), **Online mit Freunden ohne Server per QR-Code oder Text-Code** (WebRTC, läuft von GitHub Pages, bis zu 6 Spieler mit Bots)
- **Spielgefühl:** Gas/Lenken/Handbremse, Nitro am Boden und in der Luft, Sprung, Doppelsprung, Ausweichmanöver (Flip), Luftsteuerung und Air-Roll, Wand- und Rundungsfahren, Supersonic-Rammen (Zerstörung), Anstoß, Verlängerung (Golden Goal)
- **3 Arenen:** Neon-Metropole, Eis-Dom, Sonnen-Canyon (gleiche Spielgeometrie, andere Gestaltung); 5 Karosserien, 4 Aufkleber, Akzentfarben in der Garage
- Ball-Kamera und Auto-Kamera, Sichtfeld und Abstand einstellbar
- Eingabe: Tastatur (WASD und Pfeile für zwei Spieler), Gamepad, Touch (Handy/Tablet, Quer- und Hochformat)
- Deutsche Oberfläche (vorbereitet für weitere Sprachen), Barrierefreiheit (Farbmodi für Teamfarben, weniger Bewegung, Kontrast, große Schrift), adaptive Grafikqualität, lokaler versionierter Speicher

## Spielen

Gebaut liegt das Spiel unter `turbokick/app/` (GitHub Pages: `…/easygames/turbokick/`). Es braucht **keinen Server** – auch Online mit Freunden nicht, siehe [docs/p2p.md](docs/p2p.md).

## Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
cd turbokick
npm install
npm run dev          # Entwicklungsserver http://localhost:5173
npm run check        # Typen + Lint + alle Tests
npm run build        # Spiel bauen nach turbokick/app (Basis-URL ./, überall lauffähig)
```

Konfiguration (optional): `VITE_BASE` (Basis-URL beim Bauen). Entwickler-Labore: `?lab=arena&theme=neon|eis|canyon`, `?lab=actors&body=all&anim=boost`. Werkzeuge in `tools/`: `shot.mjs` (Bildschirmfoto), `app-play.mjs` (Spiel im Browser), `app-match.mjs` (ganzes Spiel), `p2p-e2e.mjs` (Online-Test mit zwei Seiten), `sim-demo.mjs`, `ai-demo.mjs`.

## Steuerung

| Aktion                               | WASD (Spieler 1) | Pfeile (Spieler 2) | Gamepad      | Touch               |
| ------------------------------------ | ---------------- | ------------------ | ------------ | ------------------- |
| Gas / Rückwärts                      | W / S            | ↑ / ↓              | RT / LT      | Stick hoch / runter |
| Lenken, Gieren                       | A / D            | ← / →              | linker Stick | Stick               |
| Sprung (zweimal = Doppelsprung/Flip) | Leertaste        | Enter              | A            | SPRUNG              |
| Nitro (halten)                       | Shift            | rechte Shift       | X            | BOOST               |
| Handbremse / Drift                   | Q                | Num 3              | B            | DRIFT               |
| Air-Roll                             | Strg / E         | rechte Strg        | RB           | –                   |
| Ball-Kamera                          | C                | Num 5              | Y            | BALL                |
| Pause                                | Esc / P          | –                  | Start        | II                  |

Die vollständige Tabelle steht im Spiel unter **Anleitung**.

## Architektur

```
turbokick/
  shared/src/        # Reiner Code ohne DOM – läuft im Browser und in Node-Tests
    sim/             #   deterministische Physik und Regeln (Sim), Schnappschüsse
    ai/              #   Bot-KI (4 Stufen), nur aus dem öffentlichen Zustand
    net/p2p.ts       #   Nachrichten Gastgeber↔Gast mit Prüfung
  client/src/
    app/             #   App-Wurzel, Speicher (versioniert), Theme
    game/            #   Sitzungen (Lokal, Gastgeber, Gast mit Vorhersage), Spielschirm, Kamera, HUD
    net/             #   WebRTC-Verbindung (zwei Kanäle), Verbindungs-Codes, Lobby
    render/          #   Engine (adaptive Qualität), Arena-Darstellung (3 Themen), Autos/Ball/Effekte
    input/           #   Tastatur, Gamepad, Touch
    audio/           #   prozedurale Musik, Motor- und Effektklänge
    ui/              #   Menü, Spiel einrichten, Garage, Online, Optionen, Anleitung, Statistik
```

Details: [docs/physics.md](docs/physics.md), [docs/p2p.md](docs/p2p.md), [docs/i18n.md](docs/i18n.md).

## Veröffentlichen (GitHub Pages)

`npm run build` schreibt das Spiel nach `turbokick/app/` mit relativer Basis-URL; `turbokick/index.html` leitet dorthin. Pages liefert nur statische Dateien aus – für Online mit Freunden wird nichts weiter gebraucht. Es gibt keine Geheimnisse im Client.

## Bekannte Grenzen (ehrlich)

- **Fahrgefühl nur numerisch abgestimmt:** Die Physik wurde per Headless-Tests und Fotos geprüft, aber nie von Hand gespielt. Die Werte (`CAR_TUNING`, `BALL_TUNING`) sind der Hebel zum Feinschliff; Luftbälle der Bots gelingen nur teilweise.
- **Klang** wurde nur strukturell getestet (keine Hörprobe).
- **Leistung** nur mit Software-Rendering gemessen; die Grafikqualität senkt sich bei niedriger Bildrate selbst ab.
- **Online:** zwei Browser-Seiten im selben Rechner bis zur laufenden Partie getestet (Codes, Lobby, Vorhersage, Uhr/Stand stimmen überein); nicht mit zwei echten Geräten oder über verschiedene Netze. Der Gastgeber entscheidet alle Regeln; verlässt er das Spiel, endet die Partie. Strenge Netze können Direktverbindungen verhindern (kein TURN).
- Die Auto-Auto-Kollision ist vereinfacht (Kugelnäherung): Autos stapeln sich nicht sauber.
