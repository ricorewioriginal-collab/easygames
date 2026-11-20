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
