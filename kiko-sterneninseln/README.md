# KIKO – Das Geheimnis der Sterneninseln

Ein eigenständiges Three.js-Abenteuer mit acht Leveln in vier Welten. Sämtliche Modelle, Effekte und Klänge entstehen im Browser. Das Spiel speichert Fortschritt und Einstellungen lokal.

## Starten

Im Repository funktioniert `kiko-sterneninseln/index.html` direkt über einen statischen HTTP-Server. Zum Beispiel im Repository-Stamm: `python3 -m http.server 8000`, danach `http://localhost:8000/kiko-sterneninseln/` öffnen. Die gebündelte Three.js-Datei liegt im Spielordner.

Mit Node.js 18 oder neuer: `npm ci`, `npm run dev`, `npm test`, `npm run build`. Das Ergebnis liegt unter `dist/` und kann auf einem statischen Webserver veröffentlicht werden. Für die GitHub-Pages-Struktur von easygames reicht der Quellordner ohne Build.

## Steuerung

WASD oder Pfeiltasten bewegen Kiko. Leertaste springt, E interagiert, Maus ziehen dreht die Kamera, Esc pausiert. Auf dem Smartphone: linker Joystick, rechts Sprung- und Interaktionstasten, rechts wischen für die Kamera. Am Gamepad: linker und rechter Stick, A, X und Start. Das Spiel ist für Querformat ausgelegt.

Sammle pro Level fünf Kristalle. Drei versteckte Sterne sind optional. Bei Rätseln aktivierst du Schalter mit E oder der Interaktionstaste. Im letzten Level leuchtet das Sternenherz abwechselnd blau; nur dann kannst du es treffen. Das aktive Portal beendet das Level.

## Technik

Three.js r128 liegt lokal unter `vendor/three.min.js` (MIT-Lizenz, siehe `vendor/LICENSE.three.txt`). Vite 5.4.21 ist nur für Entwicklung und Build nötig. Es gibt keine Cloud-Abhängigkeit und keinen Server für Spielstände.

Die Level werden in `src/data.js` definiert. `src/scene.js` baut die 3D-Welt, `src/physics.js` bewegt Kiko, `src/input.js` liest Tastatur, Touch und Gamepad, `src/ui.js` verwaltet Menüs, `src/save.js` speichert lokal, `src/audio.js` erzeugt Töne, `src/main.js` verbindet die Systeme.
