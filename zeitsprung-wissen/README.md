# ZEITSPRUNG WISSEN

Eigenständige 3D-Wissensshow für easygames nach dem Zeitstrahl-Prinzip (wie Hitster), Schwesterspiel von ZEITSPRUNG RADIO und ZEITSPRUNG MOVIE. Läuft auf Smartphone, PC und TV; Vito moderiert per Browser-Sprachausgabe. Solo oder mit bis zu vier Menschen.

## Spiel

- **Zeitstrahlrunden:** 236 Ereignisse aus elf Epochen und Themen, von den ersten Olympischen Spielen 776 v. Chr. bis heute. Das Jahr wird standardmäßig aus A–D gewählt (bei antiken Ereignissen liegen die Optionen weiter auseinander); im Profi-Modus wird das Ereignis direkt in die passende Lücke des eigenen Zeitstrahls gelegt.
- **Clips:** 16 Ereignisse haben einen historischen Clip von Wikimedia Commons (z. B. Mondlandung, Hindenburg, Mauerbau, Grenzöffnung 1989, Kennedy in Berlin, „I Have a Dream“). Eingebettet wird der offizielle Commons-Player erst auf Knopfdruck.
- **Songs:** 25 Songs, die ein Ereignis besingen (z. B. „Wind of Change“, „Sunday Bloody Sunday“, „Zombie“, „Biko“, „Waterloo“, „Smoke on the Water“). Sie laufen im Deezer-Player, wahlweise in der Zeitstrahlrunde zum Ereignis oder in eigenen Songrunden („Welches Ereignis besingt dieser Song?“).
- **Wissensrunden:** 377 Fragen: 182 redaktionelle Fragen zu Geschichte, Politik, Erdkunde, Wissenschaft & Natur und Allgemeinwissen sowie 195 Fragen zu Hauptstädten, Kontinenten und Landeshauptstädten. Dazu unbegrenzt viele „Was war zuerst?“-Runden aus dem Ereigniskatalog.
- **Bildrunden:** 38 Symbolrätsel zu Ereignissen.
- **Themenwelten:** Große Mischung oder Geschichte, Politik, Erdkunde & Geographie, Wissenschaft & Entdeckungen sowie Kultur & Allgemeinwissen.
- **Wertung:** Jede richtige Antwort gibt einen Punkt, acht Punkte gewinnen.

## TV und Handys

Wie bei den anderen Zeitsprung-Spielen: Im TV-Modus erscheinen WR-Code, PIN und QR-Code; bis zu vier Handys steuern ihre Spielerplätze per PeerJS/WebRTC, sehen die Antworten bzw. Zeitstrahl-Lücken und können Clip oder Song am TV starten.

## Daten und Technik

- `events.js` Ereignisse (Ereignis | Jahr | Einordnung; negative Jahre = v. Chr.) und Themenwelten
- `knowledge.js` redaktionelle Fragen sowie Hauptstadt-, Kontinent- und Bundesländer-Tabellen
- `media.js` Commons-Clips und Songs je Ereignis, `music.js` Deezer-Suche, `visual.js` Bildrätsel
- `game.js` Spielablauf und 3D-Studio (Three.js, halbe Bildrate), `pair.js` Handy-Kopplung
- Spielstand lokal unter `zw-save-v1`, Synchronisierung über `../cloud/anmacha-cloud.js`
- Prüfung der Daten: `node tools/test-zeitsprung-wissen.mjs`

Clips, Musik und Multiplayer brauchen Internet; Quiz-, Bild- und Zeitstrahlrunden funktionieren auch offline. Es werden keine Video- oder Musikdateien im Repo gespeichert.
