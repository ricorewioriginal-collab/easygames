# ZEITSPRUNG MOVIE

Eigenständige 3D-Filmshow für easygames. Läuft auf Smartphone, PC und TV; Vito moderiert per Browser-Sprachausgabe. Das Hauptmenü bietet Solo- und Mehrspielerpartien für ein bis vier Menschen.

## Spiel

- **Quizrunden:** 318 Vier-Antworten-Fragen. Der Katalog enthält 109 Filme mit Studioangaben (218 daraus erzeugte Fragen) und 100 redaktionelle Fragen zu Disney, Pixar, Marvel, Kinderfilmen, Kinderserien, Serien, Streamingdiensten, Fantasy, Filmwissen und deutschem Kino.
- **Hörrunden:** 38 kuratierte Songs aus Film und Fernsehen, darunter Filmmusik und Serienintros. Deezer-Tracks werden über die öffentliche Suche aufgelöst und im Deezer-Widget abgespielt. Für ausgewählte Songs stehen geprüfte Spotify-Embeds bereit. Die Antwort ist der passende Film oder die passende Serie aus A–D.
- **Bildrunden:** 42 eigene Symbolrätsel zu Filmen und Serien mit vier Antwortmöglichkeiten. Die Symbole erscheinen auch auf dem gekoppelten Handy.
- **Trailerrunden:** 12 konkret kuratierte Filmtrailer laufen als YouTube-Privacy-Enhanced-Embed direkt im Spiel. Das Kinostartjahr wird standardmäßig aus vier Optionen A–D gewählt. Alternativ lassen sich Filme auf einer Zeitleiste einordnen.
- **Wertung:** Acht Punkte gewinnen. Eine richtige Antwort gibt einen Punkt; Vito löst jede Frage auf. Wenn ein Trailer oder Song nicht abgespielt werden kann, lässt sich direkt im Spiel ein anderer Film beziehungsweise Song wählen. Quizfragen und Bildrätsel bleiben unabhängig davon spielbar.

## TV und Handys

Im TV-Modus erscheinen ein zufälliger WR-Code, eine separate vierstellige PIN und ein QR-Code. Bis zu vier Handys steuern ihre eigenen Spielerplätze per PeerJS/WebRTC. Die Handyansicht zeigt dieselben A–D-Antworten oder Zeitleistenplätze wie der TV, zeigt Bildsymbole und kann Musik oder Trailer starten sowie zur nächsten Runde schalten. PeerJS nutzt einen Signalisierungsdienst; eine direkte Verbindung kann durch Netzwerkregeln eingeschränkt sein.

## App und Speicher

Die App nutzt eine eigenständige SVG- und PNG-Iconfamilie, ein Web-Manifest, einen Service Worker, einen Konsolen-Startbildschirm und ein responsives 3D-Filmstudio mit Three.js. Der aktuelle Spielstand wird lokal unter `zm-save-v1` gespeichert und über das vorhandene `../cloud/anmacha-cloud.js` mit der bestehenden Google/Firebase-Anbindung synchronisiert, wenn ein Nutzer sich anmeldet. Trailer, Musik und Multiplayer benötigen Internet. Das Spiel speichert keine Film- oder Musikdateien. Externe Player erfordern einen Klick im Player und können je nach Land oder Dienst eingeschränkt sein.

## Trailer und Daten

`tracks.js` enthält Original-Kinostartjahre und Studios. `knowledge.js` enthält vier eindeutige Antworten je Frage. Die Trailerliste nutzt nur konkrete Video-IDs; URLs werden nicht aus Suchbegriffen erfunden. Eingebettete Trailer können vom Anbieter oder regional gesperrt werden. Die meisten Fragen sind auch ohne Trailer spielbar.

Beispiele für geprüfte Primärquellen: [Walt Disney Animation Studios – Frozen 2](https://www.youtube.com/watch?v=Zi4LMpSDccc), [Marvel – Avengers: Endgame](https://www.marvel.com/avengers_movie/), [Pixar – Inside Out 2](https://www.pixar.com/inside-out-2/), [Disney – Encanto](https://movies.disney.com/encanto).
