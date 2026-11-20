# ZOTIK (Quelltext)

Three.js (0.128, fest eingebunden) + Vite. Das Build-Ergebnis liegt in `../zotik/` und wird eingecheckt (GitHub Pages ohne CI, Adresse bleibt `…/easygames/zotik/`).

```bash
cd zotik-src
npm install
npm run dev     # Entwicklungsserver
npm run build   # schreibt nach ../zotik/ – danach den Ordner mit committen, dann `node tools/build-sync.js`
```

- `index.html` – Seite, Oberfläche (CSS) und PWA-/Cloud-Skripte
- `src/main.js` – Spiel (Welt, Figuren, Kampf, Menüs, Koop)
- `src/gfx.js` – glatte Formen (Felsen, Laub, Tannen, Kristalle), Umgebungslicht, Oberflächenstruktur, Fell (Schalen-Technik)
- `src/fox.js` – Zotik nach dem Master-Sheet (Fell, Augen, Ausrüstung) und `coat()` für Fell auf fertigen Figuren
- `src/post.js` – Nachbearbeitung: Glühen, Kantenglättung, Farbabstimmung
- `public/` – Service Worker, Manifest, Minispiele, Vorschaubild (landen unverändert in `../zotik/`)

Qualität: die automatische Stufenregelung (`setQ`) schaltet bei niedriger Bildrate zuerst Fell-Schalen und Auflösung herunter, dann die Nachbearbeitung.
- `src/bworld.js` – **Babylon.js-Umstellung, Phase 1**: Kollisionswelt (NullEngine, Proxys nur im Umkreis des Spielers), per `await __zotik.bw()` (Debug) ladbar; Test `tools/test-zotik/babylon-kollision.cjs`. Phase 2: Bewegung/Kamera-Raycasts darauf umstellen, danach Rendering Welt für Welt.
- `src/bphys.js` – **echte Physik (Havok über Babylon)**: Trümmer zerschlagener Kisten/Fässer als starre Körper (Boden aus `hgt`, Hindernisse aus COL/HOUSES im 8-m-Umkreis), Three-Meshes folgen den Körpern; lädt erst beim ersten Zerschlagen, ruht ohne Trümmer. Test `tools/test-zotik/physik.cjs`.
- Hochschleudern/Luftkombo (`launchE`, `airE` in `main.js`): Schlusshieb wirft kleine und mittlere Gegner hoch, Treffer halten sie oben (höchstens 4). Test `tools/test-zotik/luftkombo.cjs`.
- Beute-Kugeln und Schwebe-Kombo (`drop`, `airTgt`, `startAttack` in `main.js`): besiegte Gegner lassen Lebens- (grün, 3 % LP) und Magiekugeln (violett, 2 MP) fallen, Beute fliegt aus bis zu 10 m (`DROP_R`) auf Zotik zu; Hiebe in der Luft halten Zotik kurz in der Schwebe (höchstens 4 je Sprung), der Sturzhieb kommt erst, wenn kein Gegner mehr in der Luft ist. Test `tools/test-zotik/beute.cjs`.

Debug: `?debug` an die Adresse hängen, dann steht `__zotik` in der Konsole bereit.
