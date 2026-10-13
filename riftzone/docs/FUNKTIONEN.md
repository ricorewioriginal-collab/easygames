# Umgesetzte Funktionen – ehrliche Übersicht

Stand: Oktober 2026. „Umgesetzt“ heißt: im Spiel vorhanden, mit dem Spielsystem verbunden und durch Tests oder
Browserläufe geprüft. Einschränkungen stehen ausdrücklich dabei.

## Spielablauf

| Funktion | Stand |
| --- | --- |
| Vollständige Schleife Hauptmenü → Lobby → Match → Sieg/Ausscheiden → Ergebnis → Lobby | ✅ |
| Solo, Duo, Squad | ✅ Teams, Teamwertung, Niederschlagen statt Ausscheiden, Wiederbeleben (5 s halten) |
| Konfigurierbare Teilnehmerzahl bis 100 | ✅ offline 10–100, online per Server-Einstellung bzw. private Lobby |
| Einzelspieler mit Bots | ✅ läuft im Web Worker (gleicher Code wie der Server) |
| Riftfähre, Absprung, freier Fall, Sturzflug, steuerbarer Gleiter | ✅ Gleiter öffnet automatisch in 70 m Höhe |
| Schrumpfender Riftsturm | ✅ 7 Phasen, steigender Schaden, Zielkreis auf Karte/Minikarte, Tempo wählbar |
| Zufällige Beute | ✅ Bodenbeute an ~500 Punkten, Riftkisten, Munitionskisten (je Match neu ausgewürfelt) |
| Ergebnis, EP, Herausforderungen | ✅ |

## Bewegung & Kampf

| Funktion | Stand |
| --- | --- |
| Sprinten, Springen, Ducken, Rutschen, Klettern (Kanten bis 2,4 m), Schwimmen | ✅ |
| Fallschaden, Sprungpads | ✅ |
| 7 Waffen + Granate (Pistole, MP, Sturmgewehr, Salvengewehr, Schrotflinte, Präzisionsgewehr, Raketenwerfer) | ✅ |
| Seltenheitsstufen (5), Munitionsarten (5), Magazine, Nachladen, Streuung, Rückstoß, Schadensabfall, Kopftreffer | ✅ |
| Treffererkennung | ✅ serverseitig per Strahl gegen Kapseln, mit Lag-Kompensation; Raketen/Granaten als Geschosse |
| Leben, Schild, 5 Heil-/Schildgegenstände | ✅ |
| Schnellzugriff (5 Plätze + Spitzhacke), Inventar mit Tauschen und Fallenlassen | ✅ |
| Ressourcenabbau (Holz/Stein/Metall) | ✅ |
| Bausystem (Wand, Boden, Rampe; 4-m-Raster, 2-m-Höhenstufen; Bauteile wachsen auf volle Stärke; Einsturz ohne Halt) | ✅ |
| Modus ohne Bauen | ✅ |
| Zerstörbare Objekte (Wände, Häuser, Bäume, Felsen, Autos, Zäune, Kisten …) | ✅ Fundamente und Brücken sind absichtlich unzerstörbar |
| Fahrzeug „Rift-Buggy“ (4 Sitze, Boost, Handbremse, Rammen, Schaden, Explosion) | ✅ Beifahrer können schießen |
| Interaktive Objekte: Türen, Riftkisten, Munitionskisten, Sprungpads | ✅ |
| Bearbeiten (Editieren) gebauter Teile, Dachstücke | ❌ nicht umgesetzt |

## Gegner-KI

| Funktion | Stand |
| --- | --- |
| Absprungziel (Team gemeinsam), Gleiten zum Ziel | ✅ |
| Navigation | ✅ Steuerung mit Hindernis-Tastern, Ausweichen, Springen/Klettern, Türen öffnen, Umwege bei Feststecken. **Kein Navigationsnetz** – in verwinkelten Gebäuden bleiben Bots gelegentlich hängen |
| Beute, Kisten, Waffenauswahl nach Entfernung | ✅ |
| Kampf mit Reaktionszeit, Zielfehler je Stufe, Seitwärtsbewegung, Abstand halten | ✅ |
| Rückzug/Deckung, Heilen, Wände/Rampen bauen unter Beschuss, Wiederbeleben, Zone verlassen | ✅ |
| Fahrzeuge fahren | ❌ Bots steigen nicht in Fahrzeuge |

## Welt & Grafik

| Funktion | Stand |
| --- | --- |
| Handgestaltete Insel (1,5 × 1,5 km) mit 14 Orten, Fluss, Seen, Straßen, Brücken, Berg mit Schnee, Wüstenschlucht, Krater | ✅ |
| ~80 Gebäude mit Stockwerken, Treppen, Fenstern, Türen, Dächern; Einzelgehöfte | ✅ |
| Terrain in 128-m-Abschnitten mit 4 Detailstufen, Ränder gegen Lücken, bedarfsgerechtes Laden/Freigeben | ✅ |
| InstancedMesh für alle Bauteile, Bäume, Felsen, Gras; Abschnitts-Sichtbarkeit; Figuren-LOD (volle Figur nah, Silhouette fern) | ✅ |
| Wasser, Himmel, Sonne/Mond, Sterne, Tageszeit läuft im Match weiter, Regen und Nebel | ✅ |
| Adaptive Grafikprofile (Niedrig–Ultra, Automatik nach Bildrate), Auflösung, Sichtweite, Schatten, Bildratenbegrenzung | ✅ |
| GLTF/GLB-Modelle | ➖ nicht verwendet: alle Modelle entstehen im Code (keine fremden Assets nötig). Ein GLTF-Lader ist nicht eingebunden |
| Physik-Bibliothek (z. B. Rapier) | ➖ bewusst nicht verwendet: eine eigene, deterministische Kollision (Quader/Rampen/Höhenkarte) läuft identisch auf Server und Client und ist Voraussetzung für Vorhersage und Abgleich |

## Mehrspieler

| Funktion | Stand |
| --- | --- |
| Eigener Server (Node.js, Ubuntu, systemd, Docker) | ✅ siehe [SERVER.md](SERVER.md) |
| Öffentliche Warteschlangen, private Lobbys mit Code, Gruppen, Einladungen, Freundesliste mit Anwesenheit | ✅ |
| Autoritative Simulation, Vorhersage, Interpolation, Lag-Kompensation, Wiederverbindung | ✅ |
| Server-Rangliste | ✅ einfache JSON-Datei, Identität ohne Passwort (siehe Grenzen) |
| Markierungen für das Team teilen, Sprachchat, Textchat | ❌ Markierungen sind nur lokal sichtbar |

## Bedienung & Plattformen

| Funktion | Stand |
| --- | --- |
| Tastatur/Maus mit Pointer-Lock und frei belegbaren Tasten | ✅ |
| Touch: schwebender Stick, Wischen zum Umsehen, Feuern mit Mitdrehen, kontextabhängige Tasten, Größe/Deckkraft einstellbar, Auto-Feuer optional | ✅ |
| Gamepad (Standard-Belegung) | ✅ |
| Einstellungen: Grafik, Audio, Steuerung, Barrierefreiheit (Farbsehschwäche, Geräusch-Anzeige, Textgröße, reduzierte Bewegung, Kontrast), Online | ✅ |
| PWA (installierbar, offline nach erstem Laden) | ✅ über `tools/make-pwa.py` |
| Android | ✅ über die vorhandene easygames-App (WebView mit Offline-Sync) – keine eigene Paketierung nötig |
| Desktop-App | ➖ läuft im Browser bzw. als installierte PWA; eine native Hülle (z. B. Electron/Tauri) ist nicht enthalten |

## Kosmetik & Fortschritt

| Funktion | Stand |
| --- | --- |
| 12 Outfits, 8 Kopfbedeckungen, 6 Rückenteile, 6 Gleiter, 4 Spitzhacken, 6 Hauttöne, 10 Emotes, 4 Siegerposen | ✅ eigene Entwürfe |
| Stufen 1–50, EP aus Platzierung/Ausschaltungen/Kisten/…, Freischaltung nach Stufe | ✅ lokal im Browser gespeichert |
| Tägliche (3) und wöchentliche (2) Herausforderungen | ✅ |
| Statistik, Matchhistorie (50), lokale Bestenliste, Server-Rangliste | ✅ |
| Fortschritt geräteübergreifend | ❌ nur lokal (kein Konto) |

## Tests

- `npm test`: 24 Tests – Höhenkarte, Weltgenerierung, Raycasts, Bewegung (Gehen, Sprung, Stufen, Klettern, Rutschen,
  Gleiten, Determinismus), komplette Bot-Matches (Solo/Duo), Protokoll, Raum/Netz, Kampf (Aufheben, Treffer,
  Ernten, Bauen, Wiederbeleben), Einsturz, Zone, Fortschritt, Server-Lobby (Anmeldung, Gruppe, Matchmaking,
  Wiederverbindung, private Lobby, Ratenbegrenzung).
- `npm run test:e2e`: Browserlauf (Desktop und `--mobile`) mit Software-WebGL.
- `node e2e/online.mjs`: echter Server und zwei Browser im selben Duo-Team.

Leistungsmessung: Ein Match mit 100 Bots braucht im Node-Server im Mittel ~0,7 ms pro Simulationsschritt
(Spitzen ~17 ms). Die Bildrate im Browser hängt stark vom Gerät ab und konnte in der Entwicklungsumgebung nur mit
Software-Rendering geprüft werden – auf echten Handys bitte mit „Automatisch“ beginnen.
