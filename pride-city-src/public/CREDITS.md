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
| Hausfassaden der Innenstadt (Farbe, Normalen, Nachtfenster aus den beleuchteten Varianten B/C abgeleitet) | `assets/world/fac018_*.jpg`, `fac019_*`, `fac020_*` | ambientCG – „Facade018A–C“, „Facade019A–C“, „Facade020A–C“ (ambientcg.com, Spiegel github.com/zuujis-cc0) | CC0 1.0 |
| Bäume und Palmen: Rinde, Laubkronen und Palmwedel (aus einzelnen Foto-Blättern zu Alpha-Karten zusammengesetzt) | `assets/world/palm_bark_*`, `tree_bark_*`, `leaves.png`, `palm_frond.png` | ambientCG – „Bark003“, „Bark014“, „LeafSet024“, „Foliage005“ (ambientcg.com, Spiegel github.com/zuujis-cc0) | CC0 1.0 |
| Straßenmöbel: Laterne, Parkbank, Hydrant, Mülleimer (Polygone reduziert, Texturen 256–512 px) | `assets/props/street_lamp_01.glb`, `modular_street_seating.glb`, `fire_hydrant.glb`, `metal_trash_can.glb`, `planter_box_02.glb` | Poly Haven – „street_lamp_01“, „modular_street_seating“, „fire_hydrant“, „metal_trash_can“, „planter_box_02“ (polyhaven.com, Spiegel github.com/zuujis-cc0) | CC0 1.0 |
| Müllsäcke und Kartons (Müllecken, Kisten; Polygone reduziert, Texturen 256 px) | `assets/props/trashbag.glb`, `cardboard_box_01.glb` | Poly Haven – „Trash Bag“, „Cardboard Box 01“ – https://polyhaven.com/models | CC0 1.0 |
| Holzdauben des Wasserturms | `assets/world/tank_wood_*.jpg` | Poly Haven – „Dark Wooden Planks“ – https://polyhaven.com/a/dark_wooden_planks | CC0 1.0 |
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

## Fahrzeuge (seit 27.11.2026)

Alle Autos (eigene Wagen, Verkehr, Taxi, Streifenwagen, Show- und Rennautos) stammen von Sketchfab und stehen unter
**Creative Commons Attribution 4.0 (CC BY 4.0)** – https://creativecommons.org/licenses/by/4.0/. Erfundene Modelle ohne echte Marken.

| Modell | Urheber*in | Lizenz | Verwendet als |
|---|---|---|---|
| „Generic passenger car pack“ – https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5 | Comrade1280 (Sketchfab) | CC BY 4.0 | `assets/cars/sedan`, `taxi`, `hatchback`, `stationwagon`, `compact`, `coupe`, `minivan`, `delivery`, `pickup`, `sport`, `suv`, `offroad` (je `.glb` und `_lo.glb`) |
| „Fairheaven LT '80 Cop Cruiser – Low poly model“ – https://sketchfab.com/3d-models/fairheaven-lt-80-cop-cruiser-low-poly-model-61766c1e6e1e4b2b803c174f33433a74 | Daniel Zhabotinsky (Sketchfab) | CC BY 4.0 | `assets/cars/police.glb` (Streifenwagen) |
| „Saba V12 '95 Interceptor – Low poly model“ – https://sketchfab.com/3d-models/saba-v12-95-interceptor-low-poly-model-63aa215521334cef9c4d8c4c391252ad | Daniel Zhabotinsky (Sketchfab) | CC BY 4.0 | `assets/cars/interceptor.glb` (Verfolgungswagen) |

Änderungen: Die Pakete wurden in einzelne Autos geteilt, ausgerichtet, auf Straßenmaß gebracht, Innenraum und Kleinteile entfernt,
Geometrie vereinfacht (`_lo` für den Verkehr am Handy) und Texturen auf 512 px verkleinert (`pride-city-src/scripts/cars.mjs`).
Taxi (gelb) und Lieferwagen (hell) sind umgefärbte Fassungen der Limousine bzw. des Vans.
