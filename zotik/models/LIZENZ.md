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
