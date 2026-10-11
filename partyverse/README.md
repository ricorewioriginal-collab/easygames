# PARTYVERSE

Ein 3D-Browser-Partyspiel im Stil klassischer Brett-Party-Spiele – **vollständig eigene Figuren, Welten, Regeln, Musik und Klänge** (kein Nintendo-Material, keine fremden Assets).

- **5 Welten × 10 Bretter = 50 Layouts** (PRISMARA, NOVA NEXUS, WURZELWILD, PARADOX CITY, INFINITY CARNIVAL), alle aus Daten von einer gemeinsamen Brett-Engine geladen und beim Test auf Struktur und Erreichbarkeit geprüft
- **22 Minispiele** mit gemeinsamem Rahmen (Anleitung, Countdown, Ergebnis, faire Belohnung)
- **8 Figuren** mit Animationen und Kosmetik (Hüte, Spuren, Würfel-Skins)
- **Modi:** gegen Bots (3 Stufen), lokal auf einem Gerät (Hot-Seat, 2–4 Spieler), **online ohne Server per QR-Code oder Text-Code** (WebRTC-Direktverbindung, läuft von GitHub Pages) und optional online über einen Colyseus-Spielserver (Raumcode, öffentliche Räume, Wiederverbindung)
- Desktop (Maus/Tastatur) und Handy/Tablet (Touch, Hoch- und Querformat)
- Deutsche Oberfläche (vorbereitet für weitere Sprachen), Barrierefreiheits-Optionen, adaptive Grafikqualität
- Musik und Soundeffekte werden zur Laufzeit selbst erzeugt (Web Audio), Spielstand lokal im Browser

## Spielen

Gebaut liegt das Spiel unter `partyverse/app/` (GitHub Pages: `…/easygames/partyverse/`). Lokale Partien und **Online mit Freunden per QR-Code/Text-Code** brauchen **keinen Server** – siehe [docs/p2p.md](docs/p2p.md). Nur der optionale Raumcode-Modus braucht einen eigenen Spielserver ([docs/server.md](docs/server.md)); GitHub Pages kann keinen Spielserver hosten.

## Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
cd partyverse
npm install
npm run dev          # Client auf http://localhost:5173
npm run server       # Spielserver auf Port 2567 (optional, nur für Online)
npm run check        # Typen + Lint + alle Tests
npm run build        # Client bauen nach partyverse/app (Basis-URL ./, überall lauffähig)
```

| Befehl                            | Zweck                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm test`                        | Vitest: Spielkern, 50 Layouts, 22 Minispiele, Netzwerk-Nachrichten, Server-Integration, Audio, Speicher |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                       |
| `npm run typecheck`               | `tsc` für Client und Server                                                                             |
| `npm run server:build`            | Server als einzelne Datei nach `server/dist/server.mjs`                                                 |

Konfiguration (alles optional, siehe `.env.example`): `VITE_BASE` (Basis-URL beim Bauen), `VITE_SERVER_URL` (Standard-Serveradresse), `PORT`, `ALLOWED_ORIGINS` (Server).

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

1. Jede Runde würfelt jeder Spieler in der Reihenfolge, zieht Feld für Feld und wählt an Weggabelungen seinen Weg.
2. **Glimmer** (✦) sind die Währung. Felder geben oder nehmen Glimmer, bringen Gegenstände, Zufallsereignisse, Läden, Portale, Mautbrücken (3 Glimmer oder Schlüsselfragment) und Chaosfelder (Platztausch).
3. Am **Chrono-Altar** kostet ein **Siegpunkt-Splitter** (◈) 20 Glimmer. Der Altar zieht manchmal um.
4. **4D-Faltung:** Auf manchen Brettern erscheinen und verschwinden Wege je Runde (gestrichelte Wege) – plane voraus.
5. Nach jeder Runde spielen alle ein **Minispiel**; die Besten bekommen Glimmer.
6. Nach der letzten Runde gibt es Bonus-Splitter (meiste Minispiel-Siege, meiste Glimmer, meiste Ereignisse). Wer die meisten Splitter hat, gewinnt (Gleichstand: Glimmer, Minispiel-Siege, Reihenfolge).

Die vollständigen Regeln stehen im Spiel unter **Anleitung**.

## Architektur

```
partyverse/
  shared/src/           # Reiner Code ohne DOM – läuft im Browser und im Server
    core/               #   GameCore: Regeln als Zustandsautomat (server-autoritativ), KI (ai.ts), Gegenstände/Ereignisse
    levels/             #   50 Layouts (Daten + 17 Baupläne), Graph-Funktionen, Validierung
    minigames/          #   Minispiel-Framework (deterministische 60-Hz-Simulation) + 22 Spiele
    net/protocol.ts     #   Nachrichtenformate Client↔Server mit Prüfung
    characters.ts, rng.ts
  server/src/           # Colyseus-Raum (PartyRoom), Lobby-Schema, Zeitgeber
  client/src/
    app/                #   App-Wurzel, Speicher (versioniert), Erfolge, Theme
    net/                #   Session-Schnittstelle: LocalSession (Bots/Hot-Seat), HostSession/GuestSession (WebRTC, ohne Server), OnlineSession (Colyseus), Verbindungs-Codes (signal.ts)
    game/               #   Spielablauf: Brett-Bühne, Kamera, Würfel, HUD, Minispiel-Ablauf, Siegerehrung
    render/             #   Engine (adaptive Qualität), Materialien, Figuren, Welten + Brett-Darstellung
    minigames/          #   Minispiel-Bühne und 22 Ansichten (Three.js)
    audio/              #   prozedurale Musik und Effekte
    ui/                 #   Menüs, Einrichtung, Online-Lobby, Optionen, Anleitung, Kosmetik, Erfolge
    i18n/               #   Wörterbuch (de)
```

**Server-Autorität:** Der Spielkern (`GameCore`) ist eine reine Zustandsmaschine mit privatem Zufallsgenerator. Aktionen werden geprüft (Wer ist am Zug? Ist die Aktion erlaubt?), der Client zeigt nur den bestätigten Zustand plus Ereignisse zum Animieren. Lokal läuft derselbe Kern im Browser. **Minispiele** sind deterministisch: Clients senden ihr Eingabeprotokoll, der Server rechnet das Ergebnis nach und akzeptiert keine selbst gemeldeten Punkte. Bots nutzen dieselben Regeln und Informationen wie Menschen (keine versteckten Boni).

## Übersichten

- [Alle 50 Bretter](docs/levels.md)
- [Alle 22 Minispiele](docs/minigames.md)
- [Online ohne Server (QR/Code)](docs/p2p.md)
- [Spielserver betreiben (optional)](docs/server.md)
- [Mehrsprachigkeit](docs/i18n.md)
- [Drittanbieter-Lizenzen](THIRD_PARTY.md)

## Veröffentlichen (GitHub Pages)

`npm run build` schreibt das Spiel nach `partyverse/app/` mit relativer Basis-URL (`./`); die Datei `partyverse/index.html` leitet dorthin. Pages liefert nur diese statischen Dateien aus. Online mit Freunden (QR/Text-Code) funktioniert direkt von Pages. Nur für den Raumcode-Modus muss ein Spielserver separat laufen und per `wss://` erreichbar sein (Serveradresse in den Optionen oder beim Bauen als `VITE_SERVER_URL`). Es gibt keine Geheimnisse im Client.

## Bekannte Grenzen

- Musik und Klänge wurden nur strukturell getestet (keine Hörprobe in der Entwicklungsumgebung); Pegel können Feinschliff brauchen.
- Bildschirmfotos und Abläufe wurden mit Software-Rendering geprüft; die Leistung auf echten Geräten ist nicht gemessen. Die Grafikqualität senkt sich bei niedriger Bildrate selbst ab.
- Online ohne Server wurde mit zwei Browser-Seiten bis zum Finale getestet (lokales Netz, ohne STUN); Tests mit zwei echten Geräten und über verschiedene Netze (STUN/NAT) fanden nicht statt. Strenge Netze können Direktverbindungen verhindern (kein TURN). Der Server-Modus ist über echte WebSocket-Verbindungen getestet, aber nicht zwischen echten Geräten.
- Einige Texte (Optionen, Anleitung, Spieldaten) stehen direkt auf Deutsch im Code und sind noch nicht übersetzbar.
