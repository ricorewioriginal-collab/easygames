# Mimori – Dein 3D-Haustier

Eigenständiges, kostenloses 3D-Haustierspiel in der EasyGames-Sammlung, optimiert für Smartphone, PWA und PC.

## Was ist enthalten?

- 3D-Wesen mit vier Fellfarben, drehbarer Kamera und vier Entwicklungsstufen
- Füttern, Spielen, Baden, Schlafen, Kuscheln, Sternfang-Minispiel
- Synthesizer-Töne und niedliche kleine Soundmelodien für jede Pflegeaktion – ohne externe Audiodateien
- Animationen, Partikel, Sterne, Herzchen und Blasen bei den Aktionen sowie Wachstumseffekt
- Ein/Aus-Schalter für Sounds (auf dem jeweiligen Gerät gespeichert)
- Bedürfnisse, Gesundheit und Entwicklung auf Basis der tatsächlich vergangenen Zeit
- Offline-PWA mit lokalem Spielstand
- **Google-Synchronisierung** über den bereits vorhandenen `../cloud/anmacha-cloud.js` und das Firebase/Firestore-Projekt `ricorewi-games-save`, analog zu Lumo und Taschi
- **Freiwillige Erinnerungen**, solange Mimori im Browser oder als PWA läuft – ohne externen Push-Dienst

## Google-Speicherung

Unter **„☁ Google-Speicher & Spielstand“** kannst du dich mit dem gleichen Google-System anmelden wie
in anderen EasyGames-Spielen. Der lokale Schlüssel `easygames.mimori.v1` wird über
`data-game="mimori"` und `data-prefix="easygames.mimori.v1"` synchronisiert.
Dein Spielstand bleibt auch ohne Login lokal erhalten. Google-Sync benötigt Internet und eine erfolgreiche
Google-/Firebase-Anmeldung; in Android-WebViews kann die bereits vorhandene Geräte-Kopplung nötig sein.
Die Einrichtung und Firestore-Regeln sind in `../cloud/README.md` beschrieben.

Beim ersten Cloud-Abgleich entscheidet das bestehende EasyGames-Sync-Skript anhand des Zeitstempels.
Bei einem aktualisierten Cloud-Spielstand lädt es das Spiel zum Übernehmen neu. Eine ältere Kopie
kann über den vorhandenen Menüpunkt wiederhergestellt werden. Dies ist eine bereits vorhandene
Funktion des EasyGames-Cloudsystems und keine zweite, eigenständige Firebase-Konfiguration.

## Erinnerungen im Browser / in der PWA

Unter **„🔔 Erinnerungen“** freiwillig einschalten; erst dann wird die Browser-Berechtigung angefragt.
Bei mindestens einem besonders niedrigen Bedürfnis kann Mimori eine Benachrichtigung anzeigen.
Standardmäßig gelten Ruhezeit **22:00–08:00**, maximal **drei Meldungen pro Tag**
und mindestens **vier Stunden Abstand pro Bedürfnis**. Die Einstellung wird nur lokal gespeichert.

Dies sind **lokal ausgelöste Browser-/PWA-Benachrichtigungen**, kein Remote Web Push:
Der JavaScript-Code muss laufen. Ist die Browserseite vollständig geschlossen oder pausiert
das Betriebssystem die PWA, kann **keine** verlässliche Benachrichtigung erfolgen.
In einer eingebetteten Spielansicht (iframe) kann der Browser die Berechtigungsanfrage blockieren;
nutze dann die direkt geöffnete Spielseite. Auf manchen Smartphones erfordert das Anzeigen
einer Notification eine installierte PWA. Ohne Berechtigung läuft das Spiel uneingeschränkt weiter.

Es werden **keine** Push-Endpunkte, Gerätekennungen, privaten Schlüssel oder Spielwerte
an einen externen Mimori-Pushserver übertragen. Nur bei freiwilligem Google-Login werden
die eigenen Spielstände über die bereits vorhandene Firebase/Firestore-Integration synchronisiert.

## Testen

```bash
node tools/test-mimori.cjs
node tools/build-sync.js --check
```

Für einen echten Funktionstest zusätzlich am Android-Smartphone/Desktop im Browser:
Sounds nach erster Nutzerinteraktion, Pflegeeffekte, 3D-Animation, PWA-Offline,
Google-Anmeldung/Cloud-Speichern/Wiederherstellen und Benachrichtigungs-Berechtigung prüfen.

Die Testdatei simuliert das DOM und den 3D-Renderer. Sie beweist **keine** erfolgreiche
externe Google-Anmeldung oder Browser-/Betriebssystembenachrichtigung.
