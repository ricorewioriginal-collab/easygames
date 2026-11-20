# Rocketbox-Figuren fürs Urwaldlager

Wandelt Avatare der Microsoft Rocketbox Avatar Library (MIT) in kleine GLB-Dateien um und überträgt die 16 KayKit-Bewegungen auf das Rocketbox-Skelett (Biped).

1. Im Arbeitsordner `npm i three@0.160.0 @gltf-transform/cli@4.1.1`, `kk` als Link auf `anmacha-urwaldlager/models`, dort `python3 -m http.server 8091` starten.
2. `./batch.sh Adults/Male_Adult_01 …` lädt FBX und Texturen (raw.githubusercontent.com), verkleinert die Texturen (512 px JPG, Haare 256 px PNG) und exportiert `glb/<Name>.glb`.
3. Bewegungen: `node prev.cjs "fbx=…&tex=…&anim=1" thumbs/anim '[]' glb/anim.glb`, dann `gltf-transform resample` und `quantize`.
4. Figuren: `gltf-transform quantize glb/X.glb … --pattern "{POSITION,NORMAL,JOINTS_0,WEIGHTS_0}"` (ohne Texturkoordinaten, three r128 kennt KHR_texture_transform nicht).

Die Umrechnung richtet zuerst die Arme und Beine der Zielfigur auf die Ruhehaltung der Quelle aus und überträgt dann die Drehungen im Weltraum. Comic-Bewegungen werden entschärft: Arme näher am Körper, Knie beim Gehen weniger hoch.

## Camp-Kleidung umfärben

`outfit.html` färbt die Körpertextur einer fertigen GLB um: Die Kleidungsbereiche (Oberteil, Hose, Stiefel) ergeben sich aus den Knochen-Gewichten der Dreiecke (UV-Maske), Kopf und Hände bleiben unverändert, nackte Unterarme/Waden behalten ihre Haut (Hautton aus der Kopftextur).
Farben je Figur stehen in `outfits.json`; `node outfit.cjs` (Server im Ordner mit `glb/` und `node_modules/three`, Port 8091) schreibt die umgefärbten GLBs zurück.

## Echte Bewegungen (Motion Capture)

Gehen, Rennen, Stehen, Umschauen, Jubeln, Sitzen (je Mann und Frau) und Winken, Hocken, Klatschen stammen aus `Assets/Animations` der Rocketbox-Bibliothek (MIT, gleiches Skelett, keine Umrechnung).
Gehen/Rennen aus `all_animations_max_motextr_xy`, der Rest aus `…_static` nach `mocap/` laden, dann `node mocap.cjs` (Server Port 8091, `src/Adults/Male_Adult_01/Export/Male_Adult_01.fbx` als Skelett):
waagerechte Wurzelbewegung wird entfernt, lange Clips werden an der passendsten Stelle für eine nahtlose Schleife gekürzt, Finger-/Zehenspuren entfallen.
Danach `gltf-transform resample mocap_raw.glb mocap_r.glb --tolerance 0.0015` und `quantize` → `models/menschen/mocap.glb`.
