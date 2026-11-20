# 3D-Modelle im Urwaldlager – Herkunft und Lizenzen

Alle Modelle außer den echten Menschen sind **CC0 1.0** (gemeinfrei). Eine Namensnennung ist nicht nötig, wir nennen die Urheber trotzdem gern. Die Menschen-Figuren in `menschen/` stehen unter der **MIT-Lizenz** (siehe unten).
Die Dateien wurden mit `tools/make-urwaldlager-assets.mjs` (gltf-transform) zusammengestellt, verkleinert und umbenannt.

| Datei | Inhalt | Quelle | Lizenz |
|---|---|---|---|
| `figuren/knight.glb`, `mage.glb`, `rogue.glb`, `rogue_hooded.glb`, `barbarian.glb`, `anim.glb` | Figuren und 16 Animationen (Waffen entfernt, im Spiel umgefärbt) | KayKit Adventurers 1.0 – Kay Lousberg, kaylousberg.com | CC0 |
| `set.glb` – Teile ohne Präfix | Palmen, Büsche, Felsen, Feuerstelle, Zelt, Kisten, Essen, Säulen | Kenney Nature Kit, Food Kit, Survival Kit – kenney.nl | CC0 |
| `set.glb` – `palm2`, `coconut*`, `ancient_tree_1`, `garden_*`, `grass_green_group`, `root_2`, `waterlily_pink_group`, `rock_big_*`, `rock_medium_*`, `birch1` | Dschungelpflanzen und Felsen | Wizp – Lowpoly Stylized Fantasy Environment | CC0 |
| `set.glb` – `kd_*` | Fässer, Kisten, Truhen, Fackeln, Tisch, Hocker, Bett | KayKit Dungeon Remastered – Kay Lousberg | CC0 |
| `set.glb` – `kf_*`, `kk_*` | Sofa, Sessel, Lampe, Tische, Bank, Laterne | KayKit Furniture Bits, City Builder Bits – Kay Lousberg | CC0 |
| `ph.glb` – `ph_fern`, `ph_anthurium`, `ph_calathea`, `ph_sorrel`, `ph_weed`, `ph_shrub`, `ph_rock`, `ph_bucket`, `ph_crate` | Tropenpflanzen, Fels, Eimer, Kiste (verkleinert, nur Grundfarbe, WebP) | Poly Haven (polyhaven.com): Fern 02, Anthurium Botany 01, Calathea Orbifolia 01, Shrub Sorrel 01, Weed Plant 02, Shrub 03, Rock 09, Wooden Bucket 01, Wooden Crate 02 – Rob Tuytel, Rico Cilliers, Jenelle van Heerden, James Ray Cock, Jurita Burger; erzeugt mit `tools/make-urwaldlager-polyhaven.mjs` | CC0 |
| `tiere/crab.glb`, `frog.glb`, `bat.glb`, `bee.glb` | Tiere für Prüfungen | Quaternius (quaternius.com), über das npm-Paket `@netforge/asset-library-files` 0.2.0 | CC0 |

| `menschen/*.glb` (22 Figuren) und `menschen/anim.glb` | Echte Menschen für Camper, Moderatoren, Doc Rudi und Ranger Kalle; Texturen auf 512 px verkleinert, Kleidung auf Camp-Outfits umgefärbt, Bewegungen von KayKit auf das Rocketbox-Skelett übertragen | Microsoft Rocketbox Avatar Library (github.com/microsoft/Microsoft-Rocketbox), © Microsoft Corporation | MIT, Lizenztext in [`menschen/LICENSE-Rocketbox.txt`](menschen/LICENSE-Rocketbox.txt) |
| `menschen/mocap.glb` | Motion-Capture-Bewegungen (Gehen, Rennen, Stehen, Umschauen, Jubeln, Sitzen, Winken, Hocken, Klatschen), auf der Stelle, gekürzt | Microsoft Rocketbox Avatar Library, `Assets/Animations`, © Microsoft Corporation | MIT, Lizenztext in [`menschen/LICENSE-Rocketbox.txt`](menschen/LICENSE-Rocketbox.txt) |

Texturen (Himmel, Böden, Holz): Poly Haven, CC0 – siehe [`../textures/LIZENZ.md`](../textures/LIZENZ.md).

Alles andere (Studio, Prüfungsaufbauten, Wasser, Feuer, Schilder, Logo) ist im Code erzeugt bzw. eigens für dieses Spiel gezeichnet.
three.js r128 (`vendor/`) steht unter MIT-Lizenz.
