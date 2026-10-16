# Firebase (Spark-Tarif)

RicoPoly nutzt das **bestehende** easygames-Firebase-Projekt `ricorewi-games-save` für drei Dinge. Es wird kein neues Projekt, kein neuer Schlüssel und kein kostenpflichtiger Tarif gebraucht.

| Zweck | Wie | Anmeldung |
|---|---|---|
| Profil und Spielstände geräteübergreifend | gemeinsamer Cloud-Speicher `../cloud/anmacha-cloud.js` (`data-prefix="ricopoly.v1."`), Daten unter `users/<uid>/saves/ricopoly` | Google (freiwillig) |
| Weltweite Rangliste | `js/fire.js`, Sammlung `ricopoly_board/<uid>` | anonym, automatisch |
| Online-Räume | `js/fire.js` + `js/net.js`: Firebase vermittelt nur den Verbindungsaufbau (WebRTC-Angebot und -Antwort), gespielt wird direkt Browser zu Browser. Sammlungen `ricopoly_rooms/<code>`, `ricopoly_rooms/<code>/join/<uid>`, `ricopoly_pub/<code>` | anonym, automatisch |

`js/fire.js` kommt ohne Firebase-SDK aus (nur REST-Aufrufe, wenige KB). Die anonyme Kennung liegt im Browser unter `ricopolyFire` und wird bewusst nicht in den Cloud-Abgleich übernommen.

## Einmalig einrichten (nur der Projektinhaber)

1. https://console.firebase.google.com → Projekt `ricorewi-games-save`.
2. **Build → Authentication → Anmeldemethode → Anonym → Aktivieren → Speichern.**
3. **Build → Firestore Database → Regeln:** den kompletten Inhalt von `../cloud/firestore.rules` einfügen → **Veröffentlichen**. (Die bisherigen Regeln für Spielstände und App-Kopplung sind darin unverändert enthalten.)

Indizes sind nicht nötig: alle Abfragen nutzen ein einzelnes Feld.

Solange Schritt 2 fehlt, meldet Firebase „ADMIN_ONLY_OPERATION“. Das Spiel merkt das und fällt still zurück: Online läuft wie bisher über PeerJS, die Rangliste zeigt „gerade nicht erreichbar“.

## Verbrauch im Spark-Tarif (gratis: 50.000 Lese-, 20.000 Schreibzugriffe pro Tag)

- Rangliste: je beendeter Partie 1 Lese- und 1 Schreibzugriff; Anzeigen kostet bis zu 25 Lesezugriffe und wird 2 Minuten zwischengespeichert.
- Online-Raum: Anlegen 1 Schreibzugriff; in der Lobby fragt der Gastgeber alle 3 s nach Beitrittswünschen (je 1 Lesezugriff, ca. 20 pro Minute); öffentliche Räume schreiben alle 45 s ein Lebenszeichen. Während der Partie fragt der Gastgeber nur, solange ein Mitspieler offline ist. Beitritt: je Gast etwa 2 Schreib- und bis zu 20 Lesezugriffe.
- Die Spielzüge selbst laufen nicht über Firebase.

Grob gerechnet reicht das für mehrere hundert Online-Partien pro Tag.

## Schutz durch die Regeln

- Rangliste: nur der eigene Eintrag; je Schreibvorgang genau +1 Partie und höchstens +1 Sieg, höchstens einmal pro Minute, Name höchstens 24 Zeichen. **Grenze:** Ohne Server-Funktionen (gibt es nur im Blaze-Tarif) kann ein technisch versierter Spieler trotzdem Partien „melden“, die er nicht gespielt hat – nur eben höchstens eine pro Minute. Für eine Hobby-Rangliste reicht das.
- Räume: Nur der Gastgeber ändert oder löscht seinen Raum. Private Räume lassen sich nicht auflisten (der Code ist der Schlüssel). Ein Gast kann nur sein eigenes Angebot ablegen, nur der Gastgeber trägt die Antwort ein und kann das Angebot nicht verändern.
- Verwaiste Einträge (Tab geschlossen) bleiben klein liegen; die öffentliche Liste blendet Räume ohne Lebenszeichen seit 5 Minuten aus.

## Getestet

- Regeln: `tests/fire-rules.js` mit dem Firebase-Emulator (32 Prüfungen, darunter alle Missbrauchsfälle oben).
- Online: `tests/browser-online.js` mit zwei Chromium-Browsern über den Emulator: öffentlicher Raum, Beitritt aus der Liste, Partie mit 50 Zügen, Gast lädt neu und kehrt über den Link zurück, beide Browser haben denselben Spielstand.
- Rückfall: im echten Projekt (anonyme Anmeldung noch aus) zeigt die Rangliste den Hinweis und Online nutzt PeerJS.
- **Nicht** getestet: das echte Firebase-Projekt mit eingeschalteter anonymer Anmeldung und veröffentlichten Regeln, Verbindungen zwischen verschiedenen Netzen (Handy-Netz, Firmen-WLAN) und die Google-Anmeldung.
