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
