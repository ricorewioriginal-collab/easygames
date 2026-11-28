# Anime-Figuren in Zotik

`f1.glb`, `f2.glb`, `m1.glb`, `m2.glb` stammen aus den VRoid-Beispielmodellen des VRoid-Projekts (pixiv):
Base_Female, HairSample_Female, Base_Male, HairSample_Male. Lizenz laut Modelldaten: **CC0** (gemeinfrei).

Aufbereitet mit `tools/make-zotik-figs.mjs`: ohne Gesichtsausdrücke, verkleinerte Texturen, Haare/Kleidung/Iris hell-grau
(Zotik färbt sie je Figur nach den Master-Sheets ein), Teilstücke zusammengelegt, Geometrie quantisiert.

## KayKit (Ordner `kk/`)

Figuren, Bewegungen und Requisiten aus den KayKit-Paketen von **Kay Lousberg** (www.kaylousberg.com):
Skeletons 1.1, Adventurers 2.0, Fantasy Weapons Bits 1.0 und Dungeon Pack 1.1 (jeweils FREE). Lizenz: **CC0** (gemeinfrei).
Aufbereitet mit `tools/make-zotik-kaykit.mjs` (Auswahl, quantisierte Geometrie, Bewegungen ohne Netze und ausgedünnt).

## Quaternius Bestiary (Ordner `qb/`)

Imp und Puglin aus „Bestiary – Dungeon Monsters Kit“ (Standard) von **Quaternius** (quaternius.com),
Lizenz: Quaternius Asset License v1.0 – Verwendung in Spielen erlaubt; die Modelle dürfen nicht als eigenständiges
Asset-Paket weitergegeben oder verkauft werden. Aufbereitet mit `tools/make-zotik-bestiary.mjs` (verkleinerte Texturen,
ohne Normal-/ORM-Karten, quantisiert). Bewegt werden sie in Zotik prozedural über die Knochen.

## Wizp Fantasy Environment Pack (Ordner `wz/`)

Bäume, Felsen und Friedhofsteile aus „Lowpoly Stylized Fantasy Environment Pack“ von **Wizp** (wizp.itch.io), Lizenz laut Seite **CC0**
(„can be used for any purpose, commercial or not, just can't be resold“). Auswahl und Verkleinerung mit `tools/make-zotik-wizp.mjs`.

## KayKit – Medieval Builder Pack (Kay Lousberg, CC0)
`kb/kb.glb` (zusammen mit Wänden, Böden und Säulen aus dem KayKit Dungeon Pack, ebenfalls CC0): Burg, Wachturm, Mühlen, Markt, Brunnen und weitere Gebäude.
Quelle: https://kaylousberg.itch.io/kaykit-medieval-builder-pack · Lizenz: Creative Commons Zero (CC0 1.0). Aufbereitung: `tools/make-zotik-kaybuild.mjs`.
- Quaternius (CC0, quaternius.com): qr/qr.glb – animiertes Basismodell für alle Menschen-Figuren außer Zotik (Rollen-Looks in src/quat.js und kaykit.js).

## Sketchfab-Figuren (Ordner `sf/`)

Alle CC-BY 4.0, mit verkleinerten Texturen und vereinfachten Netzen (gltf-transform):
- `anime.glb` – „Stylized Anime Female Character“ von DevPoly3D
- `rogue.glb` – „Animated Stylized Character – Rogue Warrior“ von Karthik Naidu
- `ritter.glb` – „Fantasy Warrior | Free Low-Poly 3D Model“ von Stan
- `magier.glb` – „Stylized Battle Wizard“ von Aartee

Monster (`sf/m_*.glb`, alle CC-BY 4.0, verkleinert):
- `m_wolf` – „Stylized Wolf“ von ESO · `m_pilz` – „Mushroom Warrior“ von Muru · `m_tiger` – „Running Tiger“ von Amil (francescolima74)
- `m_troll` – „Troll“ von SJunior3d · `m_ratte` – „Rat Animated“ von Shintokin · `m_spinne` – „Spider animated character“ von TheGameAssets
- `m_skorpion` – „Scorpion“ von anthonyvanoo · `m_hai` – „Great White Shark“ von Mateus Schwaab · `m_qualle` – „jellyfish“ von yanix
- `m_fledermaus` – „Emerald Bat“ von CataRackta · `m_geist` – „Cute ghost“ von Urielgc · `m_geist2` – „Rigged Animated Ghost“ von Dani
- `m_eisgolem` – „Drugdör The Golem Animated“ von Phons · `m_steingolem` – „Golem Rigged“ von FourthGreen · `m_affe` – „Monkey“ von tomkranis
- `m_schleim` – „Ice Cream Slime“ von Empsy

## Sketchfab – stilisierte Natur (Ordner `sf/`, CC BY 4.0)
`sf/sf.glb`: Bäume, Busch, Baumstumpf, Felsen und Blumen. Lizenz jeweils **Creative Commons Attribution 4.0** (https://creativecommons.org/licenses/by/4.0/).
Geändert: zu einer Datei zusammengefasst, Texturen verkleinert, Normal-/ORM-Karten entfernt, Geometrie quantisiert, Eiche vereinfacht (`tools/make-zotik-sketchfab.mjs`).
- „Stylized Low Poly Fantasy Oak Tree“ von **Specter** – https://sketchfab.com/3d-models/stylized-low-poly-fantasy-oak-tree-7487e9ceb2e14fbf9c5e31b01a93d545
- „Pine Tree [Game-ready]“ von **Wenedi** – https://sketchfab.com/3d-models/pine-tree-game-ready-dc3fbd9205cf4027a4455d1f415e0478
- „Coconut Tree“ von **sujirour** – https://sketchfab.com/3d-models/coconut-tree-d141941578044b0f861ca83b36d4c411
- „Stylized Bush“ von **Daniel (danielpetrov)** – https://sketchfab.com/3d-models/stylized-bush-9d9ce79d3ae040619e96d5b22c7de1a6
- „Free Pack - Rocks Stylized“ von **PolyOne Studio** – https://sketchfab.com/3d-models/free-pack-rocks-stylized-7c60b4d1b8ab4187965f30c5e0212fc0
- „Stylized tree stump“ von **Aartee** – https://sketchfab.com/3d-models/stylized-tree-stump-04d51f5c2fb643aab3b93b451d1b77c9
- „Stylized Flowers and Dandelions“ von **Botanical_Blacksmith** – https://sketchfab.com/3d-models/stylized-flowers-and-dandelions-bffdeb9b066c43ac9456d9899e37d509

## Poly Haven – echte Bäume, Büsche, Felsen und Pflanzen (Ordner `ph/`)

`ph/ph.glb` (Handy) und `ph/ph-hi.glb` (PC/TV, größere Texturen) stammen aus 3D-Scans und Modellen von **Poly Haven** (https://polyhaven.com), Lizenz **CC0** (gemeinfrei):
island_tree_01/02/03, jacaranda_tree, tree_small_02, fir_sapling_medium, pine_sapling_small, quiver_tree_01/02, searsia_lucida, dead_tree_trunk, dead_tree_trunk_02, dead_quiver_trunk,
shrub_01–04, wild_rooibos_bush, fern_02, nettle_plant, grass_medium_01, flower_gazania, periwinkle_plant, dandelion_01, pachira_aquatica_01, calathea_orbifolia_01, tree_stump_01/02,
boulder_01, rock_07, rock_09, stone_01, rock_moss_set_01/02, namaqualand_boulder_02, namaqualand_boulders_01, moon_rock_01/03, rock_face_01.
Aufbereitung: `tools/make-zotik-polyhaven.mjs` (Stamm stark vereinfacht, Krone als Astkarten aus dem Original gezeichnet, Fernansicht), Einbindung: `zotik-src/src/nat.js`.

Requisiten (Poly Haven, CC0): wine_barrel_01 (Holzfass), wooden_crate_02 (Holzkiste) – in models/ph/ph.glb als `fass` und `kiste`, ersetzen die Spielzeug-Fässer und -Kisten.
