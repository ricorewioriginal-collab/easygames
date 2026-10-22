# ZEITSPRUNG KINDERSERIEN

Eigenständiges Spiel der easygames-Zeitsprung-Reihe mit derselben 3D-Oberfläche, Moderation durch Vito, Solo- und Mehrspielermodus, Zeitstrahl, A–D-Antworten, TV-Modus und Handy-Controllern.

## Inhalt

- 66 Zeitstrahl-Momente von 1990 bis 2026. Bei Serienstarts ist das Jahr der Originalpremiere gemeint; spätere Rückkehrer und Intro-Neufassungen tragen das Ereignisjahr.
- 97 redaktionelle Fragen zu Figuren, Schauplätzen, Geschichten und Serienwissen.
- 33 Intro-Hörfragen, darunter Disneys Große Pause, SpongeBob Schwammkopf, Kim Possible, Phineas und Ferb, Bluey, Die Pfefferkörner, Schloss Einstein und H2O.
- 30 Symbolrätsel und „Was war zuerst?“-Runden.
- Themenwelten: Disney, Nickelodeon, KiKA und deutsche Serien, Anime und Action, Klassiker der 90er sowie neue Favoriten.
- Eine richtige Antwort gibt einen Punkt. Wer acht Punkte erreicht, gewinnt.

Die Intros werden über eingebettete YouTube-Videos oder die vorhandene Deezer-Suche abgespielt. Die Auswahl kann gewechselt werden, wenn ein externer Player nicht verfügbar ist. Es liegen keine kopierten Audio- oder Videodateien im Repository. Zeitstrahl, Quiz und Bildrätsel funktionieren offline.

## Technik

Die Struktur übernimmt die bestehende `zeitsprung-castingshow`-Spielmechanik. `events.js`, `knowledge.js`, `media.js` und `visual.js` enthalten die eigenen Inhalte. `game.js` übernimmt Runden, Wertung und Wiederaufnahme; `pair.js` verbindet im TV-Modus bis zu vier Handys über die bestehende PeerJS/WebRTC-Infrastruktur. Der Spielstand liegt unter `zk-save-v1` und nutzt die vorhandene Cloud-Synchronisierung, wenn der Spieler angemeldet ist.

## Quellenbeispiele

- [Disney D23: TaleSpin startet 1990](https://d23.com/a-to-z/tale-spin-television/)
- [Disney: Kim Possible und Titelsong](https://video.disney.com/watch/call-me-beep-me-4c0966376ccbc61be90062ab)
- [Nickelodeon: SpongeBob-Intro](https://www.youtube.com/watch?v=r9L4AseD-aA)
- [KiKA: Schloss Einstein seit 1998](https://kommunikation.kika.de/presse-informationen/pressemitteilungen/2021/schloss-einstein-folge-eintausend100.html)
- [KiKA: Mia and me seit 2012](https://kommunikation.kika.de/presse-informationen/pressemitteilungen/2024/mia-and-me-130.html)
- [ARD: Nina Chuba singt das neue Pfefferkörner-Intro 2026](https://www.ard.de/die-ard/ard-programmdirektion/programmpresse/pressemeldungen/20260313-pfefferkoerner-22-staffel-100.html)

Externe Player können regional gesperrt sein. Das Spiel bietet dafür einen Wechselknopf.

