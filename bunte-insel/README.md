# Bunte Insel

Kinderspiel mit kleiner offener Insel-Welt (Three.js r128 per CDN, sonst keine Bibliothek, nichts zum Nachladen – Sounds und Musik werden im Browser erzeugt). Läuft am Handy (fester virtueller Joystick) und am PC (Tastatur/Maus).

## Held und Freunde
- **Jannis** (blonder Pilzkopf, Marvel-Shirt, braune Hose) ist die Spielfigur, auf Wunsch auch ein „Eigener Held“ (6 Farben × 6 Mützen). In seiner Hand hält er die **Fernsteuerung** für sein **rotes RC-Auto mit der 38**: Knopf „Fernsteuern“, dann lenkt er das kleine Auto per Joystick und bleibt selbst stehen.
- **Pappnase**, der orangefarbene Luftballon mit dem aufgemalten Gesicht, hängt an Jannis' Hand, schwebt im Spielzeugladen und taucht bei „Ballons“ frei auf (fangen = ⭐).
- **Blitz**, der Polizeihund (eigener Entwurf, Schäferhund-Look mit blauer Mütze): folgt Jannis, bellt („Wuff!“) und spürt mit „Blitz such!“ Sterne auf.

## Spielwelt
- **Laufen**, springen, „Hallo!“ rufen und **9 Fahrzeuge**: Auto, Motorrad, Polizei, Krankenwagen, Feuerwehr (Wasserstrahl), Bus, Traktor, Eiswagen (Lied), **Hubschrauber** (steigen/sinken, Ringe, Landeplatz) – dazu der **Zug**.
- **Zug-Simulation**: 4 Bahnhöfe auf dem Schienenring, Tempolimit vor den Bahnhöfen, genau am Schild halten, Türen öffnen, Fahrgäste steigen ein, Tacho/Fahrgast-Anzeige, Bonussterne für genaues Halten ohne Rasen. Ohne Fahrer hält der Zug selbstständig an allen Bahnhöfen. **Ego-Kamera** (📷) in jedem Fahrzeug.
- **Einsätze** je Fahrzeug (Streife, Notruf mit Krankenhaus, Feuer löschen, Bus, Eis, Taxi, Kurier, Heu, Rundflug, Zugfahrt) und **Sterne** (werden gespeichert).
- **Spielzeugladen** (begehbar, Regale voller Spielzeug, Verkäuferin Frau Bunt): Mützen, Sonnenbrille, Rucksack und Teddy gegen Sterne kaufen und anziehen.
- Stadt, Krankenhaus mit Landeplatz, Polizei, Feuerwehr, Park mit Spielplatz, Farm mit Tieren, See mit Enten, Strand, Leuchtturm, **Tag/Nacht**, Minimap.

## Spaß (Schnellmenü 🎉)
Das Schnellmenü zeigt nur die 6 passendsten Aktionen (Baum in der Nähe → Hauen, RC-Auto weit weg → Holen, nachts → Feuerwerk, oft benutzte zuerst), „Mehr“ zeigt alle:
Tanzen (das ganze Dorf tanzt mit), Kaugummi werfen (Kleckse bleiben, Treffer = ⭐), Ball, Luftballons, Feuerwerk, Seifenblasen und **XXL-Seifenblase** (Jannis schwebt in der Riesenblase), **Baum hauen** (wackelt, Blätter und Äpfel fallen, nach 8 Treffern gibt der Baum auf), Blitz bellen/suchen.

## Bauen wie bei den Sims (kostenlos)
🏗️: auf den Boden tippen/klicken, Teil wählen, ✔. Boden, Disko-Boden, Wand, Tür, Fenster, Dach, Turm, Möbel (Sofa, Bett, Tisch, Fernseher, Pflanze, Lampe), Garten & Spaß (Baum, Beet, Zaun, Brunnen, Pool, Trampolin, Rutsche, Zelt, Hundehütte), 8 Farben, drehen, löschen, alles wird gespeichert.

## Steuerung
- **Handy**: fester Joystick links (läuft/lenkt), rechts wischen = Kamera, große Knöpfe rechts (Einsteigen, Hupe, Sirene/Türen/Sinken, Turbo/Springen/Steigen). Tastatur-Hinweise sind am Handy ausgeblendet.
- **PC**: WASD/Pfeile, E einsteigen, Leertaste Hupe/Sprung (Hubschrauber: steigen), X sinken, Shift Turbo, F Sirene/Türen/Baum hauen, 1–0 Spaß, B Bauen (G bauen, O drehen, K Farbe, Entf), V Ego-Kamera, N Nacht, M Ton, C Kameraabstand, Q/R Kamera, P/Esc Pause, Maus ziehen = Kamera.

## Leichtgewichtig
Die statische Welt ist ein einziges gebündeltes Mesh mit Vertexfarben, Bäume sind Instanzen (damit sie einzeln wackeln können), Partikel in einem Draw-Call, keine Schatten-Maps, die Auflösung passt sich bei niedriger Bildrate automatisch an.

## Starten / Testen
```bash
python3 -m http.server 8080            # im Repo-Hauptordner
# http://localhost:8080/bunte-insel/
npm i -D playwright                    # einmalig, nur für den Test
BASE=http://localhost:8080 node bunte-insel/tests/e2e.mjs   # optional THREE=/pfad/three.min.js für Offline
```
Dateien: `js/util.js` (Geometrie-Bündelung, Figuren, Pappnase, Blitz, Partikel), `js/audio.js`, `js/world.js` (Insel, Straßen, Schienen, Spielzeugladen, Kollision), `js/vehicles.js` (Fahrzeuge, Hubschrauber, Zug), `js/fun.js` (Kaugummi, Tanz, Ball, Ballons, Feuerwerk, Blasen, Baum hauen), `js/build.js` (Bauen), `js/main.js` (Steuerung, Kamera, Missionen, Laden, Hund, Schnellmenü).
