# Welt

## Grundlagen
- Die Welt besteht aus **Chunks** von 16 × 16 Blöcken Grundfläche und 96 Blöcken Höhe; Meeresspiegel auf Höhe 24.
- Sie ist praktisch unbegrenzt: Chunks entstehen beim Erkunden und werden in größerer Entfernung wieder aus dem Speicher entfernt.
- Gleicher **Startwert (Seed)** = gleiche Landschaft. Gespeichert werden nur deine Änderungen; beim erneuten Laden entsteht die Landschaft neu und die Änderungen werden darübergelegt.
- Jede Welt merkt sich ihre **Generator-Version**:
  - **Generator 1** – die Originalwelt aus Version 1.0 (Hügel, Wiesen, Strände, Bäume). Alle alten Spielstände und die Story nutzen ihn, Bit für Bit unverändert.
  - **Generator 2** – neue Welten im Überlebens- und Kreativmodus: Biome, Gebirge, Höhlen und Erze.

## Generator 2: wie die Landschaft entsteht
Für jede Säule (x, z) werden mehrere weiche Zufallsfelder (Value-Noise) abgefragt:

| Feld | Maßstab | bestimmt |
|---|---|---|
| Kontinent | ~640 Blöcke | Meer oder Land, sanfte Küsten |
| Gebirge | ~300 Blöcke, Grate ~80 | Berge bis Höhe ~84 |
| Detail | ~52 Blöcke | kleine Hügel |
| Temperatur | ~520 Blöcke, kälter mit der Höhe | Schnee, Nadelwald, Wüste, Dschungel |
| Feuchtigkeit | ~480 Blöcke | Wald, Sumpf, Wüste |
| Besonderheit | ~360 Blöcke | seltene Biome: Vulkan, Pilzwald, Kristallgebiet |

An Biomgrenzen sorgt ein feines Rauschen für einen ausgefransten, natürlichen Übergang statt einer geraden Linie.

## Die 15 Biome
| Biom | Boden | Vegetation / Objekte | typische Rohstoffe |
|---|---|---|---|
| Meer | Sand, Kies, Ton; in kalten Gegenden Eis | – | Ton, Kies, Sand |
| Strand | Sand über Sandstein | – | Sand, Sandstein |
| Felsküste | Kies, Stein | – | Kies, Stein |
| Grüne Ebene | Gras | vereinzelte Laubbäume | Holz, Erde |
| Blumenwiese | Blütenwiese | sehr wenige Bäume | Erde |
| Laubwald | Gras | dichte Laubbäume | Holz, Blätter |
| Nadelwald | Gras | Fichten | Fichtenholz, Nadeln |
| Schneegebiet | Schnee | einzelne Fichten | Schnee, Eis (Wasser friert) |
| Berge | Stein, Kies, Schneegipfel; unten Gras | Fichten am Hang | Stein, Erze nahe der Oberfläche |
| Wüste | Sand über Sandstein | Kakteen | Sand, Sandstein |
| Sumpf | Gras und Schlamm, Tümpel | Laubbäume | Schlamm |
| Dschungel | Gras | hohe Bäume mit großen Kronen | Holz, Dschungelblätter |
| Vulkanregion | Basalt mit Magmabecken, erhöhte Kegel | – | Basalt, Magma |
| Pilzwald | Pilzboden | Riesenpilze | Pilzhut, Pilzstiel |
| Kristallgebiet | Stein und Kies | Funkkristall-Säulen | Funkkristall |

## Unter der Erde
- **Tunnel** auf zwei Ebenen (ca. Höhe 6–24 und 19–37); die obere Ebene öffnet sich an Land manchmal als Höhleneingang.
- **Kavernen** (große Hohlräume ab Höhe 5), teils mit **unterirdischem See**, sonst mit Kristallnestern am Boden.
- **Erzadern:** Kohle (bis Höhe 70), Kupfer (bis 44), Eisen (bis 30), Funkkristall (bis 14, selten). Erze ersetzen nur Stein.
- Unter Küsten und Meeren bleiben Höhlen tiefer als jeder Meeresboden – kein Wasser hängt in der Luft.
- Höhe 0 ist immer Stein: man kann nicht aus der Welt fallen.

## Laden und Entladen
- Um den Spieler werden Chunks bis zur Sichtweite gezeichnet und zwei Ringe weiter als Daten vorgehalten (für Licht und Bäume an Rändern).
- Je Bild steht ein festes Zeitbudget fürs Nachladen bereit (3–8 ms je Grafikstufe); nahe Chunks und die Blickrichtung kommen zuerst.
- Noch nicht geladene Bereiche zählen für die Physik als fest; steht der Spieler selbst in einem ungeladenen Bereich (z. B. nach einem Teleport), wartet er dort, bis er geladen ist.
- Wird ein Block verändert, werden nur sein Chunk und – am Rand – die direkt angrenzenden Chunks neu gebaut.
