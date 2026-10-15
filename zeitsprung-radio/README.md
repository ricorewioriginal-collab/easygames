# ZEITSPRUNG RADIO

Eigenständiges, moderiertes 3D-Musikzeitspiel für easygames.

## Spielen

`index.html` über die easygames-Webseite öffnen. Ein bis vier Personen spielen am selben Gerät. Vito stellt die Runde per Browser-Sprachausgabe vor. Der aktive Spieler startet den Song und setzt ihn in die passende Lücke seiner Zeitleiste. Bei richtiger Einordnung gibt es einen Punkt; acht Punkte gewinnen. Bei gleichem Jahr sind alle chronologisch passenden Positionen richtig.

Die Sammlung enthält 300 verschiedene Songs und Jahresfragen in zehn Kategorien. Jede Session mischt die gewählte Sammlung neu. Der gemeinsame Startsong wird vor der ersten Runde aufgedeckt.

28 kuratierte Musikvideos nutzen den Privacy-Enhanced-Embed unter `youtube-nocookie.com`. Für andere Titel sowie gesperrte Embeds gibt es einen direkten Link zur YouTube-Suche. Das Spiel lädt YouTube erst nach einem Klick. Videoverfügbarkeit kann sich durch Rechte und Region ändern. Die Musik selbst wird nicht im Repository gespeichert.

Three.js wird aus `../vendor/three-r128.min.js` geladen. Fällt WebGL aus, bleiben Regeln und Oberfläche spielbar. Die Moderation nutzt `speechSynthesis` und kurze Signaltöne aus Web Audio; ohne verfügbare deutsche Stimme erscheint Vitos Text weiterhin sichtbar.

## Datenpflege

`tracks.js` enthält die 300 Songs. Jahre beziehen sich auf die erste Single oder sonst die erste Albumveröffentlichung. `VIDEOS` ordnet konkret bekannte YouTube-Video-IDs zu. Ein neuer Eintrag benötigt `Titel|Interpret|Jahr` in einer der Kategorien. Titel in `VIDEOS` müssen einem Songtitel exakt entsprechen.
