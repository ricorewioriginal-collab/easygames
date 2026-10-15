# ZEITSPRUNG RADIO

Eigenständige Musikshow für easygames: 3D-Live-Studio, responsive App-Oberfläche, Vito als Browser-Sprachmoderator, Solo- und Mehrspielermodus für TV, PC und Smartphone.

## Spielablauf

- Musikrunden: Einen Song direkt im eingebetteten Player hören und auf der eigenen Zeitleiste einordnen. Bei gleichem Jahr zählen alle chronologisch passenden Lücken.
- Quizrunden: Vier Antwortmöglichkeiten zu Charts, Jahrescharts, Künstlern/Bands, Songtiteln, Biografien, gemeinfreien Songtexten, ESC, DSDS, Popstars, The Voice of Germany und Musikwissen.
- Acht richtige Antworten gewinnen. Ein bis vier Spieler können lokal oder per Handy-Controller mitspielen.
- 300 Songs/Jahresfragen in `tracks.js`, 300 daraus abgeleitete Interpretenfragen, 300 Songtitelfragen und 190 redaktionelle Zusatzfragen, darunter 40 Biografiefragen und 20 Lückentexte aus gemeinfreien Liedern in `knowledge.js`. Für Musikrunden sind 28 kuratierte Songs mit konkreten YouTube-IDs verfügbar.

## Musikquellen

Der Player bleibt auf der Spielseite. Für Musikrunden wird zuerst über die öffentliche Deezer-Suche eine passende Track-ID gesucht und der offizielle Deezer-Widget-Player geladen. Falls die Suche scheitert, nutzt das Spiel bei bekannten IDs einen offiziellen Spotify-Embed oder einen YouTube-Embed im Privacy-Enhanced-Modus. **Quelle wechseln** probiert die nächste Quelle; **Anderer Song** ersetzt einen gesperrten Titel. Deezer und Spotify geben Gästen je nach Region und Konto nur Vorschauen frei. Das Spiel kopiert oder speichert keine Musikdateien. Ein Internetzugang und ein Klick auf Play im eingebetteten Player sind erforderlich. Verfügbarkeit und regionale Sperren liegen beim jeweiligen Anbieter.

Quellen: [Deezer Widget](https://newsroom-deezer.com/2021/04/deezers-new-embeddable-widget-player-adds-instant-audio-to-any-website/), [Spotify Embeds](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed), [Spotify Playback-Hinweise](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting).

## TV und Handys

Am TV **TV-Modus** oder **Handys koppeln** wählen. Der Gastgeber zeigt einen zufälligen sechsstelligen WR-Code, eine separate vierstellige PIN und einen QR-Code. Am Handy QR-Code scannen oder auf der Spielseite **Dieses Gerät als Handy-Controller verwenden** wählen. Jedes von bis zu vier Handys übernimmt einen Spielerplatz. Der aktive Spieler startet am TV den Player, wechselt bei Bedarf die Quelle, beantwortet die Musik- oder Quizrunde und schaltet weiter. Die TV-Oberfläche bleibt auch direkt bedienbar.

Die Verbindung nutzt PeerJS über WebRTC und die vorhandenen Bibliotheken in `../vendor/`. PeerJS benötigt den Signalisierungsdienst; je nach Firewall oder NAT kann eine direkte WebRTC-Verbindung scheitern. Die PIN wird am Gastgeber geprüft und steht nicht im QR-Link.

## App und Speicher

`manifest.webmanifest`, `sw.js`, `icon.svg`, `card.svg`, `card.png` sowie die PNG-App-Icons in `../pwa-icons/` folgen der easygames-Struktur. Der Service Worker speichert die App-Oberfläche für Offline-Starts; Musikplayer und Multiplayer benötigen Internet. Der laufende Spielstand liegt lokal unter `zr-save-v2` und wird über `../cloud/anmacha-cloud.js` mit dem bestehenden Google/Firebase-Cloud-Speicher synchronisiert, sobald ein Nutzer sich anmeldet. Die Cloud-Anmeldung und Berechtigungen werden durch das vorhandene Cloud-Skript verwaltet. Nach einem Neustart kann eine laufende Show im Hauptmenü fortgesetzt werden.

## Datenpflege

Jahre in `tracks.js` beziehen sich auf die erste Single oder sonst auf die erste Albumveröffentlichung. `knowledge.js` enthält redaktionelle Quizfragen mit vier eindeutigen Optionen. Track-IDs in `music.js` und `tracks.js` müssen konkret geprüft werden; aus Suchbegriffen werden keine erfundenen Embed-URLs erzeugt. Einige ESC- und Casting-Fakten sind aus den offiziellen Archiven von [Eurovision](https://eurovision.tv/history), [RTL/DSDS](https://www.rtl.de/sendungen/dsds/dsds-gewinner-alle-sieger-von-2003-bis-heute-im-ueberblick-id30677866.html) und [The Voice of Germany](https://www.the-voice-of-germany.de/) abgeleitet.
