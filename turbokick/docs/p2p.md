# Online ohne Server (QR-Code / Text-Code) – TURBOKICK

Der einzige Weg für Online-Partien: **Direktverbindung zwischen den Browsern (WebRTC)**. Es wird kein Spielserver gebraucht, das Spiel läuft direkt von GitHub Pages. Es gibt kein Konto und keine Cloud.

## Ablauf

1. **Gastgeber:** _Online mit Freunden → Raum erstellen → + Mitspieler einladen._ Es erscheint ein **QR-Code** (und derselbe Inhalt als Text, ca. 250 Zeichen).
2. **Mitspieler:** _Raum beitreten_, QR-Code scannen (oder Text einfügen) → es erscheint ein **Antwort-Code** (QR + Text).
3. **Gastgeber:** scannt den Antwort-Code (oder fügt den Text ein) und drückt _Verbinden_. Der Mitspieler erscheint in der Lobby.
4. Für jeden weiteren Mitspieler (bis zu 3) wiederholen. Bots können dazukommen. Alle drücken _Bereit_, der Gastgeber startet.

Die Codes lassen sich auch per Messenger schicken – wer nicht nebeneinander sitzt, kopiert sie einfach hin und her.

## Wie es funktioniert

- Ein Code enthält die Verbindungsdaten (Zugangsdaten, Fingerabdruck, Netzwerkadressen) in komprimierter Form (`client/src/net/signal.ts`, ca. 250 Zeichen). Beim Einlesen wird jedes Feld streng geprüft; es wird nur eine reine Datenkanal-Beschreibung akzeptiert.
- Es gibt zwei Datenkanäle je Mitspieler: einen zuverlässigen (Lobby, Ereignisse wie Tore) und einen schnellen, unzuverlässigen (Eingaben und Zustandsbilder, neueste Daten zählen).
- **Der Gastgeber rechnet die Physik** (`HostMatch`, deterministische 60-Hz-Simulation aus `shared/src/sim`) und schickt 30-mal pro Sekunde ein kompaktes Zustandsbild (ca. 570 Byte bei 6 Autos). Gäste (`GuestMatch`) senden jede Bildschirm-Eingabe sofort, rechnen ihr eigenes Auto **vorher** selbst (Vorhersage) und spielen nach jedem Zustandsbild ihre noch unbestätigten Eingaben erneut ab (Rollback), kleine Abweichungen werden sichtbar weich ausgeglichen. Dadurch reagiert das eigene Auto sofort, auch bei 100 ms Laufzeit (getestet mit simulierter Laufzeit).
- Nachrichten der Gäste werden formgeprüft und Eingaben geklemmt (`shared/src/net/p2p.ts`).
- Bricht die Verbindung eines Gastes ab, übernimmt ein Bot. **Verlässt der Gastgeber das Spiel, endet die Partie.**
- **Vertrauen:** Der Gastgeber ist die Instanz für alle Regeln. Ein manipulierter Gastgeber könnte schummeln – für Partien mit Freunden gewollt einfach.

## Verbindungshilfe (STUN)

Im selben WLAN reicht eine direkte Verbindung. Sind die Spieler in **verschiedenen Netzen** (z. B. WLAN und Mobilfunk), braucht WebRTC einen öffentlichen STUN-Dienst, um die eigene Adresse zu erfahren. Das Spiel nutzt dafür standardmäßig `stun.l.google.com` und `stun.cloudflare.com`. Es werden nur Verbindungsdaten (IP-Adresse/Port) an diese Dienste gesendet, keine Spielinhalte. Wer das nicht möchte, schaltet es auf der Startseite des Bereichs aus (dann gehen nur Verbindungen im selben Netz).

## Grenzen (ehrlich)

- Manche Netze (strenge Firmen-/Schulnetze, manche Mobilfunk-Anbieter mit „symmetrischem NAT“) lassen Direktverbindungen nicht zu. Dafür wäre ein **TURN-Relay** nötig; das gibt es hier nicht, weil es einen Server voraussetzt.
- Es gibt kein automatisches Wiedereintreten nach einem Abbruch (dafür fehlt ohne Server der Vermittler); der Platz wird von einem Bot weitergespielt.
- Ein kurzer 4-stelliger Raumcode ist ohne Vermittlungs-Server nicht möglich – der Code muss die Verbindungsdaten enthalten.
- QR-Scannen braucht Kamerazugriff (HTTPS; GitHub Pages ist HTTPS) und funktioniert in Chrome/Safari/Firefox; wo die Kamera nicht erlaubt ist, hilft das Einfügen des Textes.
- Die Verbindung wurde in einem Browser-Test (zwei Seiten, Text-Codes, Lobby, laufende Partie, Uhr und Spielstand stimmen überein) geprüft; Tests über zwei echte Geräte und verschiedene Netze fanden nicht statt.
