# Sicherheit

## Was gilt heute
- Reines Browser-Spiel ohne eigenen Server. Spielstände liegen im Browser; der optionale Google-Speicher nutzt das gemeinsame easygames-Skript `cloud/anmacha-cloud.js` (Firebase Auth + Firestore, Projekt `ricorewi-games-save`). Jeder Nutzer schreibt dort nur in seinen eigenen Bereich.
- Im Repo und im Client liegen **keine** Admin-Schlüssel, Service-Accounts oder privaten Tokens. Die Firebase-Web-Konfiguration im Cloud-Skript ist öffentlich vorgesehen.
- Kein `eval`, kein Laden fremder Skripte außer dem easygames-Cloud-Skript; Nutzertexte (Stadtname, Motto) werden als Text gesetzt, nie als HTML.
- Eingaben aus dem Spielstand werden beim Laden geprüft und migriert (unbekannte Gebäude fallen weg, negative Bestände werden entfernt).

## Grenzen (ehrlich)
- Ein Einzelspieler-Stand im Browser lässt sich mit Entwicklerwerkzeugen verändern. Die Prüfsumme erkennt Beschädigung, nicht Absicht. Für ein Einzelspiel ohne Bestenliste ist das vertretbar.
- **Nachbarn ohne Server-Funktionen** (Spark-Tarif): Was andere Spieler betrifft, begrenzen allein die Firestore-Regeln in `cloud/firestore.rules` (eine Nachricht je Absender, Art und Tag; nur kleine, feste Geschenke; öffentliche Kurzansicht ohne Münzen und Lager, Größe begrenzt). Das Spiel prüft alles Fremde noch einmal (`src/social/codec.ts`) und setzt fremde Texte nur als Text. Den Google-Namen veröffentlicht das Spiel nicht, nur den Stadtnamen. Eine Bestenliste wäre so nicht fälschungssicher und gibt es deshalb nicht.
- Cloud-Abgleich zwischen Geräten: das Cloud-Skript arbeitet pro Schlüssel nach „neuester gewinnt" und hebt eine ältere Fassung auf. Spielt man gleichzeitig auf zwei Geräten, kann der ältere Fortschritt verloren gehen. Innerhalb eines Geräts schützt `rev` vor zwei Tabs.
