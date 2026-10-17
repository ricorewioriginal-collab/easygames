# Führerstände

Elf eigene, prozedural erzeugte Führerstände (`source/src/engine/models/cab.ts`). Bedienelemente sind antippbar/anklickbar; Anzeigen (Tacho, Bildschirme, Manometer, Lampen) zeigen den echten Simulationszustand. Keine Nachbauten realer Pulte.

| Layout | Fahrzeug | Bedienung |
|---|---|---|
| `hst` | RR Aero 300 (Hochgeschwindigkeit) | Kombihebel, zwei Monitore, Sifa-Pedal |
| `dosto` | Doppelstock-Steuerwagen „Stockwerk“ | Fahrschalter + Führerbremsventil |
| `sbahn` | S-Bahn „Takt 3“ | Kombihebel, Türsteuerung links/rechts |
| `dmu` | Triebwagen „Heideflitzer“ | Fahrhebel, Motor-Start, Bremshebel |
| `eloco` | Elektrolok „Sturmvogel E200“ | Fahrschalter, Führerbremsventil, Zusatzbremse, Stromabnehmer, Hauptschalter |
| `dloco` | Diesellok „Brummbär D66“ | Fahrstufen 0–8, Motor, Luftbremse |
| `steam` | Dampflok „Rheinpfeil 01“ | Regler, Steuerung (Handrad), Feuertür, Injektor, Wasserstand, Kesseldruck, Tender-Handbremse |
| `shunter` | Rangierlok „Igel R60“ | Seitliches Pult, Rangierfahrt |
| `neon` | NeonLiner N9 (Fantasie) | Touchpult |
| `rack` | Gipfelstürmer Z10 (Zahnrad) | Fahrhebel, eigene Zahnradbremse |
| `tram` | Stadtbahn „Glühwürmchen“ | Sollwertgeber, Pedale (Sifa, Sand, Klingel) |

Gemeinsame Bedien-IDs: `throttle`/`combined`, `brake`, `dyn`, `reverser`, `cutoff`, `emergency`, `horn`, `sand`, `panto`, `mainSwitch`, `engine`, `lights`, `cabLight`, `wipers`, `doorsL`, `doorsR`, `doorsClose`, `parking`, `sifa`, `pzbAck`, `injector`, `firing`, `battery`.

Hinweis: Führerstandslicht, Scheibenwischer und Monitore sind Darstellung; PZB und Sifa sind vereinfachte Spielmodelle und nicht sicherheitsrelevant.
