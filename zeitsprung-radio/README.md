# ZEITSPRUNG RADIO

Eigenständiges, moderiertes 3D-Musikzeitspiel für easygames.

## Spielen

`index.html` über die easygames-Webseite öffnen. Ein bis vier Personen spielen am selben Gerät. Vito stellt die Runde per Browser-Sprachausgabe vor. Der aktive Spieler startet den Song und setzt ihn in die passende Lücke seiner Zeitleiste. Bei richtiger Einordnung gibt es einen Punkt; acht Punkte gewinnen. Bei gleichem Jahr sind alle chronologisch passenden Positionen richtig.

Die Sammlung enthält 300 verschiedene Songs und Jahresfragen in zehn Kategorien. Jede Session mischt die gewählte Sammlung neu. Der gemeinsame Startsong wird vor der ersten Runde aufgedeckt.

## TV und Handys

Am Fernseher **TV-Modus** oder **Handys koppeln** wählen. Der Gastgeber zeigt einen zufälligen sechsstelligen WR-Code, eine separate vierstellige PIN und einen QR-Code. Am Handy den QR-Code scannen oder auf der Spielseite **Dieses Gerät als Handy-Controller verwenden** wählen und WR-Code sowie PIN eingeben. Ein bis vier Handys übernehmen je einen Spielerplatz. Der aktive Spieler startet die Musik, setzt den Song in die Zeitleiste und löst die nächste Runde über sein Handy aus. Die TV-Oberfläche bleibt zusätzlich bedienbar.

Die Verbindung nutzt PeerJS über WebRTC und die im Repository liegenden Bibliotheken in `../vendor/`. Für Geräte in verschiedenen Netzwerken muss PeerJS den Signalisierungsdienst erreichen können; je nach Firewall/NAT kann eine direkte WebRTC-Verbindung scheitern. Bei Verbindungsabbruch kann der freie Platz erneut belegt werden. Die PIN wird am Gastgeber geprüft und nicht in den QR-Link geschrieben.

28 kuratierte Musikvideos nutzen den Privacy-Enhanced-Embed unter `youtube-nocookie.com`. Für andere Titel sowie gesperrte Embeds gibt es einen direkten Link zur YouTube-Suche. Das Spiel lädt YouTube erst nach einem Klick. Videoverfügbarkeit kann sich durch Rechte und Region ändern. Die Musik selbst wird nicht im Repository gespeichert.

Three.js wird aus `../vendor/three-r128.min.js` geladen. Fällt WebGL aus, bleiben Regeln und Oberfläche spielbar. Die Moderation nutzt `speechSynthesis` und kurze Signaltöne aus Web Audio; ohne verfügbare deutsche Stimme erscheint Vitos Text weiterhin sichtbar.

## Datenpflege

`tracks.js` enthält die 300 Songs. Jahre beziehen sich auf die erste Single oder sonst die erste Albumveröffentlichung. `VIDEOS` ordnet konkret bekannte YouTube-Video-IDs zu. Ein neuer Eintrag benötigt `Titel|Interpret|Jahr` in einer der Kategorien. Titel in `VIDEOS` müssen einem Songtitel exakt entsprechen.
