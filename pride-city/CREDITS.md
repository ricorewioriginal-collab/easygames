# Pride City – Herkunft und Lizenzen der Assets

Alle eingebundenen Modelle sind kostenlos und frei nutzbar (CC0 / Public Domain). Es werden keine Schlüssel oder fremden Dienste gebraucht.

| Was | Datei(en) | Herkunft | Lizenz |
|---|---|---|---|
| Figuren (Spielfigur, Story-Figuren, Dating-Profile, Menge) mit Animationen | `assets/people/Man.glb`, `Man2.glb`, `Woman.glb`, `Woman2.glb`, `Human.glb`, `Hero.glb` | Quaternius, über Poly Pizza: „Man“ (https://poly.pizza/m/HMnuH5geEG), „Man“ (https://poly.pizza/m/fjHyMd5Wxw), „Woman“ (https://poly.pizza/m/AQsd9ngvKU), „Animated Woman“ (https://poly.pizza/m/9kF7eTDbhO), „Animated Human“ (https://poly.pizza/m/c3Ibh9I3udk), „Character Animated“ (https://poly.pizza/m/DgOCW9ZCRJ) | CC0 1.0 |
| Stadt: Häuser, Straßen, Autos, Laternen, Bänke, Büsche | `assets/city/*.gltf`, `*.bin`, `citybits_texture.png` | Kay Lousberg, „KayKit City Builder Bits 1.0“ – https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0 | CC0 1.0 |
| Wohnung: Bett, Sofa, Sessel, Regale, Lampen, Teppiche, Pflanzen | `assets/home/*.gltf` | Kay Lousberg, „KayKit Furniture Bits 1.0“ – https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0 | CC0 1.0 |
| Küche: Herd, Spüle, Kühlschrank, Topf, Teller | `assets/kitchen/*.gltf` | Kay Lousberg, „KayKit Restaurant Bits 1.0“ – https://github.com/KayKit-Game-Assets/KayKit-Restaurant-Bits-1.0 | CC0 1.0 |
| Oberflächen der Welt: Asphalt, Backstein (Detailkarte), Strandsand | `assets/world/asphalt_*.jpg`, `brick_detail.webp`, `sand_*.jpg` | Poly Haven – „asphalt_02“, „brick_4“, „coast_sand_01“ (polyhaven.com, Spiegel github.com/zuujis-cc0) | CC0 1.0 |
| Oberflächen der Welt: Gehwegplatten, Rasen | `assets/world/paving_*.jpg`, `grass_*.jpg` | ambientCG – „PavingStones038“, „Grass001“ (ambientcg.com, Spiegel github.com/zuujis-cc0) | CC0 1.0 |
| Wasserwellen (Normalenkarte) | `assets/world/water_nor.jpg` | selbst erzeugt (Summe von Sinuswellen) | CC0 1.0 |
| 3D-Grafik | im Build gebündelt | three.js – https://threejs.org | MIT |

Lizenztext: `assets/LICENSE-KayKit.txt`. Die Modelle sind unverändert; Kleidung, Haut und Haare werden zur Laufzeit per Shader in Pride-Farben und Outfits umgefärbt (`src/game/Actor.ts`).
Alles Übrige (Pride-Deko, Flaggen, Neon-Schilder, Bäume, Himmel, Club, Oberfläche, Musik- und Klang-Generator, Texte) ist für Pride City selbst gebaut.

## Menschen (seit 27.11.2026)

Die Figuren der Stadt, die Hauptfigur Rico und Tarek stammen von Sketchfab und stehen unter
**Creative Commons Attribution 4.0 (CC BY 4.0)** – https://creativecommons.org/licenses/by/4.0/ (kommerzielle Nutzung erlaubt, Namensnennung Pflicht).

| Modell | Urheber*in | Lizenz | Verwendet als |
|---|---|---|---|
| „Citizen NPC Pack 1 Character Lowpoly Mobile“ | 00amza (Sketchfab) | CC BY 4.0 | `assets/rb/pc_c01.glb` … `pc_c14.glb` (14 Menschen der Stadt), `pc_rico.glb` (Rico) |
| „Gangster Rigged“ | PropShop (Sketchfab) | CC BY 4.0 | `assets/rb/pc_gangster.glb` |
| „Street Gangster \| Realistic 3D Character Model“ | PropShop (Sketchfab) | CC BY 4.0 | `assets/rb/pc_streetg.glb` |
| „Yakuza“ | Abrazafarolas (Sketchfab) | CC BY 4.0 | `assets/rb/pc_yakuza.glb` (Tarek) |

Änderungen: Die Modelle wurden für Pride City mit dem Rocketbox-Skelett und Hautgewichten versehen, in Körper und Kopf geteilt,
in Geometrie und Texturen verkleinert (`pride-city-src/scripts/people.mjs`). Rico (`pc_rico`) ist umgefärbt (schwarze Trainingsjacke
mit weißen Streifen, schwarze Hose) und hat Kette, Ohrring und Septum-Ring bekommen. Ein zweites Modell „Yakuza“ von SpatialNeglect ist nicht enthalten.

Animationen, Uniform-Figuren (Polizei, Feuerwehr, Sanitäterin, Köchin, Kurier), Kinder und die Sport-Körper unter Oberkörperfrei/Badesachen:
Microsoft Rocketbox Avatar Library, MIT-Lizenz, siehe `assets/rb/LICENSE.md`.
