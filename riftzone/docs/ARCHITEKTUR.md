# Architektur

```
riftzone/
  shared/src/     Simulation – läuft unverändert im Browser-Worker, auf dem Server und für die Vorhersage
    constants, types, math     Grundlagen, deterministischer Zufall, Rauschen
    mapdef, terrain            Inselentwurf (Orte, Fluss, Straßen) und Höhenkarte (1 cm genau, als Datei vorberechnet)
    pieces, world, worldgen    Bauteile, Kollisionsraster, Raycasts, Gebäude-/Naturgenerator (feste IDs)
    movement, vehicle          Figuren- und Fahrzeugphysik
    items, building, zone      Waffen/Beute, Bauraster/Einsturz, Sturm
    match                      autoritatives Match: Eingaben, Kampf, Schaden, Teams, Beute, Ende
    bot                        KI
    protocol, room             Binärprotokoll, Interessenbereich, Raum mit Empfängern
    cosmetics, progression     Kosmetik und Fortschritt
  client/src/     Browser
    main, app                  Start, alle Menübildschirme
    game/session, game/game    Weltkopie, Vorhersage/Abgleich, Interpolation; Spielschleife, Effekte, Overlays
    net/                       Offline-Worker, Online-Verbindung (Lobby + Match)
    render/                    Gelände, Bauteile, Figuren, Waffen, Himmel, Effekte, Vegetation, Deko, Lobby-Bühne
    input/                     Tastatur/Maus, Touch, Gamepad
    audio/                     Klang-Engine und Musik (Web Audio)
    ui/                        HUD, Karte, Inventar, Emote-Rad, Stile
  server/src/     Node-Server: HTTP + WebSocket, Lobby/Matchmaking, Rangliste
  app/            gebautes Spiel (eingecheckt)
  tests/, e2e/    Tests
```

## Ein Match, zwei Wege

```
Offline:  Client ──Eingaben──▶ Web Worker (MatchRoom → Match + Bots) ──Zustand──▶ Client
Online:   Client ──Eingaben──▶ WebSocket ▶ Server (Lobby → MatchRoom → Match + Bots) ──Zustand──▶ Clients
```

Der Client unterscheidet nur die Transportschicht (`LocalTransport` bzw. `OnlineTransport`). Start-, Sync- und
Ergebnisdaten sind JSON, Eingaben und Zustandspakete binär.

## Takt und Netzcode

- Simulation mit festen 30 Ticks pro Sekunde. Der Client sammelt pro Tick eine Eingabe (Richtung, Blick, Tasten,
  Einmal-Aktionen mit Sequenznummer) und sendet sie.
- **Vorhersage:** Der Client wendet die Eingabe sofort mit derselben `stepBody`-Funktion auf eine Kopie der eigenen
  Figur an. Kommt ein Zustandspaket mit bestätigter Sequenz, wird vom Serverzustand aus neu vorhergesagt; der
  Unterschied wird über ~100 ms ausgeglichen. Fahrer sagen das Fahrzeug ebenso vorher.
- **Interpolation:** Andere Figuren werden 2–4 Ticks in der Vergangenheit zwischen zwei Paketen dargestellt.
- **Lag-Kompensation:** Jede Eingabe trägt den dargestellten Server-Tick. Beim Schuss spult der Server die
  Ziele bis zu 350 ms zurück (32-Tick-Verlauf) und prüft danach Verdeckung vom Auge zum Trefferpunkt.
- **Interessenbereich:** Figuren im Umkreis von 360 m und das eigene Team; Effekte nach Entfernung gefiltert.
  Welt- und Beuteänderungen gehen an alle (für korrekte Kollision bei der Vorhersage).

## Welt

Die Insel ist fest entworfen (Koordinaten in `mapdef.ts`) und deterministisch erzeugt: Server und Clients bauen
dieselben ~7 000 Bauteile mit identischen IDs. Übertragen werden nur Änderungen (zerstört, beschädigt, gebaut,
Türen/Kisten). Die Höhenkarte (769² Punkte) liegt vorberechnet in `app/heightmap.bin`, damit Handys sie nicht
selbst rechnen müssen; der Server rechnet sie beim Start (≈ 1,5 s) mit identischem Ergebnis.

## Darstellung

- Gelände: 12 × 12 Abschnitte à 128 m mit vier Detailstufen (2/4/8/16 m), Schürzen gegen Risse, Farben aus einer
  Biom-Karte (Wiese, Wald, Strand, Fels, Schnee, Wüste, Krater, Straße, Feld, Stadt).
- Bauteile: InstancedMesh je 256-m-Abschnitt und Art (Quader, Rampen, Glas, 5 Baumarten, Felsen, Autos, …);
  Zerstörung blendet Instanzen aus, gebaute Teile wandern in wachsende Puffer.
- Figuren: Gliederpuppe aus Grundkörpern mit prozeduralen Animationen; die nächsten N Figuren (je Profil) voll,
  der Rest als instanzierte Silhouette.
