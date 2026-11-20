# Rocketbox-Figuren fürs Urwaldlager

Wandelt Avatare der Microsoft Rocketbox Avatar Library (MIT) in kleine GLB-Dateien um und überträgt die 16 KayKit-Bewegungen auf das Rocketbox-Skelett (Biped).

1. Im Arbeitsordner `npm i three@0.160.0 @gltf-transform/cli@4.1.1`, `kk` als Link auf `anmacha-urwaldlager/models`, dort `python3 -m http.server 8091` starten.
2. `./batch.sh Adults/Male_Adult_01 …` lädt FBX und Texturen (raw.githubusercontent.com), verkleinert die Texturen (512 px JPG, Haare 256 px PNG) und exportiert `glb/<Name>.glb`.
3. Bewegungen: `node prev.cjs "fbx=…&tex=…&anim=1" thumbs/anim '[]' glb/anim.glb`, dann `gltf-transform resample` und `quantize`.
4. Figuren: `gltf-transform quantize glb/X.glb … --pattern "{POSITION,NORMAL,JOINTS_0,WEIGHTS_0}"` (ohne Texturkoordinaten, three r128 kennt KHR_texture_transform nicht).

Die Umrechnung richtet zuerst die Arme und Beine der Zielfigur auf die Ruhehaltung der Quelle aus und überträgt dann die Drehungen im Weltraum. Comic-Bewegungen werden entschärft: Arme näher am Körper, Knie beim Gehen weniger hoch.
