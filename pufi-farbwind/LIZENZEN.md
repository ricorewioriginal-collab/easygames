# Pufi & der Farbwind – Lizenzen

Figuren (Pufi, Tamo, Muffel, Flattermotte, Igelkugel, Schnappblüte, Brummnebel), Welten, 3D-Modelle, Texturen und die Musik erzeugt das Spiel selbst im Code (`3d/grafik.js`, `3d/klang.js`, Klassik: `game.js`) – eigene Werke unter der Lizenz dieses Repos. Es werden keine Namen, Figuren, Grafiken oder Klänge anderer Spiele verwendet; Genre-Ideen (Flattersprung, Eierwurf, Sterne-Countdown) sind nur Inspiration.

## Fremde Assets

| Datei | Quelle | Lizenz |
|---|---|---|
| `assets/retro-bloecke.png` (Kacheln der Retro-Zonen, zugeschnitten und neu angeordnet) | „Retro Platformer Tilesets“ von **Jestan** (@jestanpixels) | Jestan's Public License (angelehnt an CC BY 4.0): Nutzung in Spielen erlaubt, auch kommerziell; Weitergabe nur als Teil eines Spiels; Nennung von Jestan in den Mitwirkenden (im Spiel unter „Steuerung“) |
| `assets/sfx/*.mp3` (Sprung, Super-Sprung, Geschenk, Leben, Treffer, Schmerz, Knopf, Blatt, Landen, Schuss, Kinderstimme; in MP3 umgewandelt und gekürzt) | „Momo Adventures – Asset Pack“ von **GreenRetroman** (greenretroman.itch.io), kostenlos als Spiele-Asset-Pack angeboten | ohne beiliegende Lizenzdatei; genutzt als freies Spiele-Asset mit Nennung von GreenRetroman. Auf Wunsch des Urhebers werden die Dateien entfernt – das Spiel fällt dann auf eingebaute Synthesizer-Töne zurück |
| `../bunte-insel/sounds/bump.mp3`, `bonk.mp3`, `thwack.mp3`, `kick.mp3`, `coins.mp3` | Kenney, „Impact Sounds“ bzw. „RPG Audio“ (kenney.nl), bereits im Repo für die Bunte Insel, siehe `bunte-insel/sounds/LICENSES.txt` | CC0 1.0 (gemeinfrei) |
| `../bunte-insel/vendor/three.min.js` | three.js r128 | MIT |

Die Klänge werden nur nachgeladen. Fehlen sie (offline, ohne Cache), spielt das Spiel eingebaute Synthesizer-Töne.
