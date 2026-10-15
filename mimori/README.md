# Mimori – Dein 3D-Haustier

Eigenständiges, kostenloses 3D-Haustierspiel für die EasyGames-Sammlung (Web, Android-Browser und Desktop).
Das Spiel lädt Three.js aus dem bestehenden lokalen `vendor/three-r128.min.js` des EasyGames-Repositories und speichert seinen Fortschritt lokal im Browser.

## Funktionen

- 3D-Wesen mit drehbarer Ansicht, vier Fellfarben und vier Entwicklungsstufen.
- Füttern, Spielen, Baden, Schlafen, Kuscheln und Sternfang-Minispiel (Vorräte gewinnen).
- Hunger, Freude, Energie, Sauberkeit und Gesundheit verändern sich anhand echter vergangener Zeit.
- Kein Pay-to-win, kein Nutzerkonto notwendig. Keine permanente Bestrafung durch Tod.
- Als Web-App installierbar, offline spielbar, responsive für Smartphone/Tablet/PC.
- **Web Push nur nach expliziter Zustimmung**; Push-Server wird getrennt betrieben.

## Benachrichtigungen richtig aktivieren

GitHub Pages kann allein **keine** zeitgesteuerten Pushnachrichten senden. Die GitHub-Version enthält daher bewusst
keine vorgetäuschten Push-Alerts bei geschlossenem Browser. Die Benachrichtigungsschaltfläche funktioniert erst,
wenn ein echter Push-Dienst konfiguriert ist.

1. Einen HTTPS-Push-Server nach `push-server/README.md` einrichten (zum Beispiel auf einem eigenen VPS).
2. In **`mimori/push-config.json`** den tatsächlich erreichbaren Push-Endpunkt eintragen:
   `{"apiBase":"https://push.example.de"}`.
3. Die Spielversion aktualisieren/veröffentlichen. Im Spiel auf **Benachrichtigungen einschalten** tippen.
   Der Browser fragt erst dann um Erlaubnis; mit **Test** kann eine Testnachricht ausgelöst werden.
4. Ausschalten ist jederzeit im Spiel möglich; dabei werden der Servereintrag und das Browser-Push-Abo gelöscht.

Der Service Worker wird für Offline und für Nachrichten verwendet. Er stellt eingehende Push-Nachrichten über
`showNotification` sichtbar dar und öffnet das Spiel beim Antippen. Im Browser wird der Zeitpunkt anhand
der letzten Pflegewerte auf dem Server berechnet, daher kann auch bei geschlossenem Spiel gesendet werden.

**Unterstützung:** Android/Chrome und Desktop-Browser mit Web Push und HTTPS; Apple verlangt für iOS/iPadOS
eine zum Home-Bildschirm hinzugefügte Web-App (mindestens iOS 16.4). Das Spiel funktioniert auch ohne Push.
Im eingebetteten iframe eines fremden Ursprungs ist das Anfordern der Berechtigung möglicherweise blockiert;
in diesem Fall Spiel direkt als eigene Webseite öffnen.

## Spielen / Testen

Öffne `mimori/index.html` über HTTPS und idealerweise `easygames` als öffentliche Webseite.
`node tools/test-mimori.cjs` prüft Pflegewerte, Persistenz, Zeitfortschritt, Benachrichtigungsbedingungen
und den Spielstart mit einer simulierten DOM/WebGL-Umgebung.

WebGL-Grafik, echte Benachrichtigungszustellung und Berechtigungsdialoge müssen zusätzlich in realen Browsern
getestet werden. Bis ein Push-Server installiert wurde, ist das Versenden echter Hintergrund-Pushs nicht aktiv.

**Datenschutz:** Ohne Push bleiben Spieldaten ausschließlich im jeweiligen Browser. Nach Zustimmung erhält der
Push-Server die Push-Endpunktinformationen und die minimalen Statuswerte. Es werden keine E-Mails,
Kontakte oder Standortinformationen abgefragt. Das Abo ist pro Gerät und kann gelöscht werden.
