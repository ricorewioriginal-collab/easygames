# PARTYVERSE

Ein 3D-Browser-Partyspiel im Stil klassischer Brett-Party-Spiele – **vollständig eigene Figuren, Welten, Regeln, Musik und Klänge** (kein Nintendo-Material, keine fremden Assets).

- **5 Welten × 10 Bretter = 50 Layouts** (PRISMARA, NOVA NEXUS, WURZELWILD, PARADOX CITY, INFINITY CARNIVAL), alle aus Daten von einer gemeinsamen Brett-Engine geladen und beim Test auf Struktur und Erreichbarkeit geprüft
- **22 Minispiele** mit gemeinsamem Rahmen (Anleitung, Countdown, Ergebnis, faire Belohnung)
- **8 Figuren** mit Animationen und Kosmetik (Hüte, Spuren, Würfel-Skins)
- **Modi:** gegen Bots (3 Stufen), lokal auf einem Gerät (Hot-Seat, 2–4 Spieler) und **🌐 online mit Freunden per Raumcode, Link oder QR-Code** (Vermittlung über Firebase wie bei allen easygames-Spielen, gespielt wird direkt Gerät zu Gerät)
- Desktop (Maus/Tastatur) und Handy/Tablet (Touch, Hoch- und Querformat)
- Deutsche Oberfläche (vorbereitet für weitere Sprachen), Barrierefreiheits-Optionen, adaptive Grafikqualität
- Musik und Soundeffekte werden zur Laufzeit selbst erzeugt (Web Audio), Spielstand lokal im Browser

## Spielen

Gebaut liegt das Spiel unter `partyverse/app/` (GitHub Pages: `…/easygames/partyverse/`). Lokale Partien brauchen kein Netz, **Online mit Freunden** läuft über Firebase ohne eigenen Server – siehe [docs/p2p.md](docs/p2p.md).

## Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
cd partyverse
npm install
npm run dev          # Client auf http://localhost:5173
npm run check        # Typen + Lint + alle Tests
npm run build        # Client bauen nach partyverse/app (Basis-URL ./, überall lauffähig)
```

| Befehl                            | Zweck                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `npm test`                        | Vitest: Spielkern, 50 Layouts, 22 Minispiele, Netzwerk-Nachrichten, Audio, Speicher |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                   |
| `npm run typecheck`               | `tsc` für das Spiel                                                                 |

Konfiguration (optional, siehe `.env.example`): `VITE_BASE` (Basis-URL beim Bauen).

Entwickler-Labore: `?lab=<minispiel-id>` (Minispiel einzeln, `&bot=0.8` lässt die KI spielen), `?charlab=1` (Figuren), `?worldlab=<layout-id>` (Brett und Welt). Hilfswerkzeuge in `tools/` (Bildschirmfotos per Playwright, Layout-Vorschau, Dokumentationsgeneratoren).

## Steuerung

|            | Desktop                                                  | Handy/Tablet                                  |
| ---------- | -------------------------------------------------------- | --------------------------------------------- |
| Würfeln    | Knopf „Würfeln“, Leertaste oder Enter                    | Knopf antippen                                |
| Weg wählen | Knopf oder Feld anklicken                                | Knopf oder Feld antippen                      |
| Kamera     | Ziehen = drehen, Mausrad = Zoom                          | Wischen = drehen, Zwei-Finger = Zoom          |
| Pause/Menü | Esc oder ☰                                              | ☰                                            |
| Minispiele | je Spiel in der Anleitung (WASD/Pfeile, Leertaste, Maus) | virtueller Stick und Knöpfe A/B bzw. Antippen |

## Spielregeln (Kurzfassung)

1. Jede Runde würfelt jeder Spieler in der Reihenfolge (der Würfel dreht sich, bis man „Stopp!“ tippt), zieht Feld für Feld und wählt an Weggabelungen seinen Weg.
2. **Glimmer** (✦) sind die Währung. Felder geben oder nehmen Glimmer, bringen Gegenstände, Zufallsereignisse, Läden, Portale, Mautbrücken (3 Glimmer oder Schlüsselfragment) und Chaosfelder (Platztausch).
3. Am **Chrono-Altar** kostet ein **Siegpunkt-Splitter** (◈) 20 Glimmer. Der Altar zieht manchmal um.
4. **4D-Faltung:** Auf manchen Brettern erscheinen und verschwinden Wege je Runde (gestrichelte Wege) – plane voraus.
5. Nach jeder Runde spielen alle ein **Minispiel**; die Besten bekommen Glimmer. Oben rechts läuft der Punktestand der Mitspieler live mit.
   **Endspurt:** In Partien ab 6 Runden zählen in den letzten 3 Runden Glimmer- und Dornenfelder doppelt, und der Letzte bekommt 10 Glimmer Aufholhilfe.
6. Nach der letzten Runde gibt es Bonus-Splitter (meiste Minispiel-Siege, meiste Glimmer, meiste Ereignisse). Wer die meisten Splitter hat, gewinnt (Gleichstand: Glimmer, Minispiel-Siege, Reihenfolge).

Die vollständigen Regeln stehen im Spiel unter **Anleitung**.

## Architektur

```
partyverse/
  shared/src/           # Reiner Code ohne DOM
    core/               #   GameCore: Regeln als Zustandsautomat (beim Gastgeber autoritativ), KI (ai.ts), Gegenstände/Ereignisse
    levels/             #   50 Layouts (Daten + 17 Baupläne), Graph-Funktionen, Validierung
    minigames/          #   Minispiel-Framework (deterministische 60-Hz-Simulation) + 22 Spiele
    net/                #   Nachrichtenformate Gast↔Gastgeber mit Prüfung (p2p.ts, protocol.ts)
    characters.ts, rng.ts
  client/src/
    app/                #   App-Wurzel, Speicher (versioniert), Erfolge, Theme
    net/                #   Session-Schnittstelle: LocalSession (Bots/Hot-Seat), HostSession/GuestSession (online), Raumcode-Verbindung über Firebase (p2pLink.ts)
    game/               #   Spielablauf: Brett-Bühne, Kamera, Würfel, HUD, Minispiel-Ablauf, Siegerehrung
    render/             #   Engine (adaptive Qualität), Materialien, Figuren, Welten + Brett-Darstellung
    minigames/          #   Minispiel-Bühne und 22 Ansichten (Three.js)
    audio/              #   prozedurale Musik und Effekte
    ui/                 #   Menüs, Einrichtung, Online-Lobby, Optionen, Anleitung, Kosmetik, Erfolge
    i18n/               #   Wörterbuch (de)
```

**Gastgeber-Autorität:** Der Spielkern (`GameCore`) ist eine reine Zustandsmaschine mit privatem Zufallsgenerator. Aktionen werden geprüft (Wer ist am Zug? Ist die Aktion erlaubt?), der Client zeigt nur den bestätigten Zustand plus Ereignisse zum Animieren. Lokal läuft derselbe Kern im Browser. **Minispiele** sind deterministisch: Clients senden ihr Eingabeprotokoll, der Gastgeber rechnet das Ergebnis nach und akzeptiert keine selbst gemeldeten Punkte. Bots nutzen dieselben Regeln und Informationen wie Menschen (keine versteckten Boni).

## Übersichten

- [Alle 50 Bretter](docs/levels.md)
- [Alle 22 Minispiele](docs/minigames.md)
- [Online mit Freunden (Raumcode über Firebase)](docs/p2p.md)
- [Mehrsprachigkeit](docs/i18n.md)
- [Drittanbieter-Lizenzen](THIRD_PARTY.md)

## Veröffentlichen (GitHub Pages)

`npm run build` schreibt das Spiel nach `partyverse/app/` mit relativer Basis-URL (`./`); die Datei `partyverse/index.html` leitet dorthin. Pages liefert nur diese statischen Dateien aus; Online mit Freunden läuft darüber und über Firebase (`../cloud/fire-peer.js`). Es gibt keine Geheimnisse im Client.

## Bekannte Grenzen

- Musik und Klänge wurden nur strukturell getestet (keine Hörprobe in der Entwicklungsumgebung); Pegel können Feinschliff brauchen.
- Bildschirmfotos und Abläufe wurden mit Software-Rendering geprüft; die Leistung auf echten Geräten ist nicht gemessen. Die Grafikqualität senkt sich bei niedriger Bildrate selbst ab.
- Online mit Freunden wurde mit zwei Browser-Seiten über Firebase getestet (Raum eröffnen, per Link beitreten, Spielstart); Tests mit zwei echten Geräten über verschiedene Netze stehen aus.
- Einige Texte (Optionen, Anleitung, Spieldaten) stehen direkt auf Deutsch im Code und sind noch nicht übersetzbar.
