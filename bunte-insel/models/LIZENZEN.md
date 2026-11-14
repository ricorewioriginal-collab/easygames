# 3D-Modelle der Bunten Insel – Herkunft und Lizenz

`deko.bin` enthält 21 gebackene Modelle (nur Dreiecke, Normalen und Farben je Vertex; erzeugt mit `bunte-insel-src/bake-models.mjs`
aus den unveränderten Quelldateien in `bunte-insel-src/models-src/`).

| Modelle | Herkunft | Lizenz |
|---|---|---|
| `tree_oak`, `tree_fat`, `tree_autumn`, `tree_pine`, `tree_pine_tall`, `bush`, `bush_large`, `flower_red`, `rock_large`, `rock_small`, `stump`, `log` | [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) von Kenney (www.kenney.nl), dieselben Dateien wie in `ricolife-src/assets-src/kenney/` | **CC0 1.0** (`models-src/LICENSE-Kenney-CC0.txt`) |
| `pillar`, `pillar_decorated`, `torch_mounted`, `banner_patternA_red`, `banner_patternB_blue`, `barrel_large`, `crates_stacked`, `candle_triple`, `chest_gold` (+ `dungeon_texture.png`, beim Backen in Vertex-Farben umgerechnet) | [KayKit Dungeon Pack 1.1](https://kaylousberg.com) von Kay Lousberg, dieselben Dateien wie in `anmacha-quest-rpg/models/kkd/` | **CC0 1.0** (`models-src/LICENSE-KayKit-Dungeon.txt`) |

`welt.bin` enthält ausgewählte Modelle aus zwei Sammelpaketen, dieselben Dateien, die auch das Zotik-Spiel nutzt (`../zotik/models/`, Auswahl in
`bunte-insel-src/models-src/picks.json`). Es wird erst geladen, wenn man sich einer Welt nähert, die es braucht (zuerst Lunaris).

| Modelle | Herkunft | Lizenz |
|---|---|---|
| `kb_house`, `kb_market`, `kb_well`, `kb_watchtower`, `kb_castle` | [KayKit Medieval Builder Pack](https://kaylousberg.itch.io/kaykit-medieval-builder-pack) von Kay Lousberg (`zotik/models/kb/kb.glb`) | **CC0 1.0** |
| `wz_tree_pink`, `wz_garden_pink`, `wz_grass_purple`, `wz_grass_green`, `wz_rock_big`, `wz_rock_med`, `wz_lamp`, `wz_arch`, `wz_plant` | „Lowpoly Stylized Fantasy Environment Pack“ von [Wizp](https://wizp.itch.io) (`zotik/models/wz/wz.glb`) | **CC0** laut Seite (frei nutzbar, nur nicht als Paket weiterverkaufen) |

CC0 = gemeinfrei, Namensnennung nicht nötig – wir nennen die Urheber trotzdem gern. Alle übrigen 3D-Formen der Insel entstehen im Code.
