# Leistung

## Messmethode
`npm run bench [seed] [radius] [generator]` erzeugt mit festem Seed alle Chunks im Radius (Standard 6 → 225 gezeichnete Chunks),
baut ihre Meshes und mittelt über zwei Durchläufe (der erste dient zum Aufwärmen).

**Testumgebung dieser Messung:** Node 22, Intel Xeon 2,1 GHz (4 Kerne, Cloud-VM), ohne Browser. Werte auf Handys sind erfahrungsgemäß 3–8× langsamer.
Echte Android-Geräte standen nicht zur Verfügung.

| Generator | Seed | Erzeugung je Chunk | Meshing je Chunk | Flächen je Chunk |
|---|---|---:|---:|---:|
| 1 (Original, Version 1.0) | 12345 | 0,12 ms | 2,05 ms | 876 |
| 2 (Biome, Höhlen) | 12345 | 0,52 ms | 2,03 ms | 844 |
| 1 (Original, Version 1.0) | 777 | 0,11 ms | 2,03 ms | 873 |
| 2 (Biome, Höhlen) | 777 | 0,53 ms | 2,82 ms | 1 098 |

Einordnung: Generator 2 kostet beim Erzeugen ~0,4 ms mehr je Chunk (mehr Noise-Felder, Höhlen, Bäume über Chunkgrenzen),
das Meshing bleibt der größere Posten und hängt vor allem davon ab, wie viele Flächen sichtbar sind (Höhlen und Bäume erhöhen das).

## Was im Spiel Leistung spart
| Technik | Stand |
|---|---|
| Flächen-Culling (nur sichtbare Seiten) | ✅ seit 1.0 |
| Frustum Culling je Chunk (passende Bounding-Sphere für 96 Höhe) | ✅ |
| Zeitbudget je Bild fürs Nachladen (Eco 3 ms, Mobil 4, Standard 6, Hoch 8) | ✅ neu |
| Nahe Chunks und Blickrichtung zuerst | ✅ neu |
| Neuaufbau nur betroffener Chunks bei Blockänderungen | ✅ (Test) |
| Entladen entfernter Chunks inkl. GPU-Geometrie | ✅ seit 1.0 |
| Grafikstufen inkl. Pixeldichte, Sichtweite, Wolken (Kantenglättung: Eco schaltet sie beim nächsten Start ab) | ✅ neu |
| Automatische Anpassung an die gemessene Bildrate | ✅ neu |
| Menü-Kulisse mit ~30 Bildern/s, Inventar/Pause stoppen das Rendern | ✅ seit 1.0 |
| Physik in festen Teilschritten (gleiches Verhalten bei 30/60/120 Hz) | ✅ neu (Test) |
| Meshing im Web Worker (Nachladen beim Erkunden; Bauen/Abbauen bleibt sofort und synchron; ohne Worker-Unterstützung automatisch synchron) | ✅ Etappe 5 |
| Greedy Meshing | geprüft, vorerst nicht sinnvoll (siehe PROGRESS.md, Abschnitt 4) |

## Grafikstufen
| Stufe | max. Pixeldichte | Sichtweite (Chunks) | Wolken | Budget je Bild |
|---|---:|---:|:-:|---:|
| Eco | 0,75 | 3 | – | 3 ms |
| Mobil | 1,25 | 4 | ✓ | 4 ms |
| Standard | 1,5 | 6 | ✓ | 6 ms |
| Hoch | 2 | 9 | ✓ | 8 ms |

**Automatisch** startet mit „Mobil“ (Touch-Geräte) bzw. „Standard“ (PC). Alle 2 Sekunden wird die mittlere Bildzeit gemessen:
über 26 ms (unter ~38 Bildern/s) sinkt zuerst die Auflösung (bis 60 %), dann die Sichtweite (bis 3). Erst nach dreimal hintereinander unter 18 ms
(über ~55 Bildern/s) geht es schrittweise wieder hoch. Pausen über 250 ms (Tab-Wechsel) zählen nicht mit.
Die Sichtweite im Pausemenü lässt sich jederzeit von Hand setzen; sie wird dann zur Obergrenze.

## Meshing im Web Worker (Etappe 5)
Neue Chunks beim Erkunden werden im Worker gebaut. Der Hauptthread kopiert nur die 3×3 Chunk-Daten (je 24 KB) und Höhenkarten hinüber
und bekommt die fertigen Puffer zurück (übertragen, nicht kopiert); höchstens 4 Aufträge sind gleichzeitig unterwegs. Veraltete Ergebnisse
(Chunk inzwischen entladen oder nach einer Blockänderung synchron neu gebaut) werden verworfen.

Messung: Headless-Chromium, Kreativwelt, Sichtweite 6, Flug mit 30 Blöcken/s über 300 Spielschritte, gemessen wird die Zeit eines Spielschritts
ohne Zeichnen (also nur, was den Hauptthread blockiert). Zwei Durchläufe je Variante, jeweils 184 fertige Chunks am Ende.

| Variante | Mittel je Schritt | 95 % der Schritte unter | längster Schritt |
|---|---:|---:|---:|
| mit Worker | 1,4 / 2,0 ms | 7,5 / 8,2 ms | 11 / 25 ms |
| ohne Worker | 3,4 / 4,3 ms | 13,4 / 11,7 ms | 21 / 27 ms |

Der Hauptthread hat beim Erkunden also gut die Hälfte weniger zu tun. Übrig bleiben das Erzeugen der Chunks (~0,5 ms je Chunk) und das Hochladen
der Geometrie auf die Grafikkarte. Auf echten Handys wurde auch das nicht gemessen.
