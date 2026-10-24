# easygames – Android-App

Native Kotlin-Hülle um eine WebView. Die Spiele-Oberfläche (`index.html` und alle Spiele) ist statisches HTML/JS und
wird **aus einem lokalen Inhaltsspeicher** ausgeliefert. Die mitgelieferten Spieldateien und Bibliotheken sind offline verfügbar; Online-Modi, Radio und Cloud brauchen Internet.
Spieländerungen kommen per **Sync von GitHub** auf das Gerät, ohne neues APK.

```
android/
  core/   reine JVM-Bibliothek: Manifest, Inhaltsspeicher, Sync-Engine, HTTP (mit JUnit-Tests)
  app/    Android-Anwendung: MainActivity (WebView), Sync-Koordinator, WorkManager, JS-Brücke
  build.sh   Build-Skript für den Server
```

## So fließen Updates

1. Du pushst Änderungen nach GitHub. Der Workflow `Android offline build` prüft und baut die App und aktualisiert anschließend auf `main` automatisch den Sync-Katalog. `node tools/build-sync.js` erzeugt `sync/manifest.json`
   (Dateiliste mit Größe + SHA-256, Vendor-Map für CDN-Bibliotheken) und wird mit eingecheckt.
2. Die App holt `${syncBase}sync/manifest.json` (mit ETag – ohne Änderung kostet das fast keine Daten).
3. Sie lädt **nur Dateien, die sie noch nicht hat** (Hash weder im Speicher noch im mitgelieferten Start-Inhalt),
   je Datei geprüft (Größe + SHA-256), 4 parallel, mit Wiederholungen und Wiederaufnahme.
4. Erst wenn **alles** vollständig und korrekt da ist, gilt der Stand als „bereit“ (`pending`). Ein Fehler oder
   Abbruch lässt den aktiven Stand unverändert.
5. Aktiviert wird der neue Stand **nie mitten im Spiel**: beim App-Start oder automatisch in der Spieleübersicht/nach dem Schließen des Spiels, oder wenn die
   Web-Oberfläche „Neu laden“ anbietet (`EasyGamesApp.reload()`).
6. Danach werden nicht mehr benötigte Dateien gelöscht.

Wann wird synchronisiert?

- beim App-Start (mit jeder Verbindung, auch Mobilfunk; nur im WLAN, wenn der Nutzer „Nur im WLAN aktualisieren“ einschaltet – Standard aus),
- sobald eine erlaubte Internetverbindung verfügbar wird, solange die App läuft,
- alle 6 Stunden im Hintergrund (WorkManager, jede Verbindung – mit „Nur im WLAN“ nur WLAN –, nicht bei schwachem Akku),
- ein Einmal-Job holt Verpasstes nach, sobald wieder eine (erlaubte) Verbindung da ist,
- manuell über „Jetzt aktualisieren“ (Einstellungsdialog, `EasyGamesApp.syncNow()`).

Es läuft nie mehr als ein Sync gleichzeitig.

## Voraussetzungen auf dem Server

- **JDK 17 oder neuer** (z. B. `sudo apt install openjdk-17-jdk`)
- **Node.js** (für `tools/build-sync.js`)
- **Gradle 8.9+** (nur einmalig, um den Wrapper zu erzeugen) oder ein vorhandener Gradle-Wrapper
- **Android-SDK** (nur Kommandozeilen-Tools nötig):

```bash
# Kommandozeilen-Tools von https://developer.android.com/studio#command-line-tools-only laden und entpacken nach:
export ANDROID_HOME=$HOME/android-sdk
mkdir -p "$ANDROID_HOME/cmdline-tools"
unzip commandlinetools-linux-*.zip -d "$ANDROID_HOME/cmdline-tools"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

`ANDROID_HOME` am besten dauerhaft setzen (z. B. in `~/.profile`).

## Einmalig: Gradle-Wrapper erzeugen

Das Repo enthält den vollständigen Gradle-Wrapper. Nur wenn er ersetzt werden muss:

```bash
cd android
gradle wrapper --gradle-version 8.9      # erzeugt gradlew, gradlew.bat und gradle-wrapper.jar
```

Ohne Wrapper nutzt `build.sh` das installierte `gradle` (8.9 oder neuer).

## Signierschlüssel (Keystore) erzeugen

```bash
keytool -genkeypair -v -keystore ~/easygames-release.jks -alias easygames \
        -keyalg RSA -keysize 4096 -validity 10000
```

Passwörter gut merken und den Schlüssel **sichern** – ohne ihn können Updates des installierten APKs nicht mehr
signiert werden. Der Schlüssel gehört **nie** ins Repository (`*.jks`/`keystore*` stehen in `android/.gitignore`).

Dem Build werden Schlüssel und Passwörter über Umgebungsvariablen übergeben:

```bash
export KEYSTORE_PATH=$HOME/easygames-release.jks
export KEYSTORE_PASSWORD='…'
export KEY_ALIAS=easygames
export KEY_PASSWORD='…'
```

Fehlen sie, wird mit dem Debug-Schlüssel signiert und eine Warnung ausgegeben (nur zum Testen geeignet).
Besser nicht in die Shell-History schreiben, sondern aus einer geschützten Datei laden
(`chmod 600 ~/.easygames-env && source ~/.easygames-env`).

## Bauen

Aus dem Repo-Wurzelverzeichnis (oder irgendwo – das Skript findet den Pfad selbst):

```bash
./android/build.sh                      # APK (Standard)
FORMAT=aab ./android/build.sh           # Android App Bundle (z. B. für den Play Store)
BUNDLE_CONTENT=0 ./android/build.sh     # ohne mitgelieferten Start-Inhalt (kleines APK, lädt beim ersten Start)
VERSION_NAME=1.2.0 VERSION_CODE=42 ./android/build.sh
```

Mit `PUBLISH_DIR=<Webroot>/downloads` legt `build.sh` das APK zusätzlich als `easygames-Developer.apk` (plus `easygames-latest.json`) auf der Downloads-Seite von ricorewi-radio.de ab; der Download-Knopf unter `/#apps` erscheint, sobald die Datei dort liegt.

Das Skript prüft Java 17+, Node und `ANDROID_HOME`, erzeugt den Start-Inhalt
(`node tools/build-sync.js --stage android/app/src/main/assets/easygames`), baut mit Gradle und gibt
**Pfad und SHA-256** des Ergebnisses aus. Ohne Angabe wird der Versionscode aus `git rev-list --count HEAD` abgeleitet.

Ergebnis: `android/app/build/outputs/apk/release/app-release.apk` bzw. `…/bundle/release/app-release.aab`.

Der Start-Inhalt unter `app/src/main/assets/easygames/` wird erzeugt und **nicht eingecheckt**. Ohne ihn baut und
startet die App trotzdem – dann zeigt sie beim allerersten Start einen Fortschrittsbildschirm und lädt alles per
Sync (dafür ist einmalig Internet nötig).

### Konfiguration (Gradle-Properties, per `-P` oder in `~/.gradle/gradle.properties`)

| Property        | Standard                                                                 | Bedeutung |
|-----------------|--------------------------------------------------------------------------|-----------|
| `syncBase`      | `https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/` | Basis-URL; muss auf `/` enden. Manifest: `${syncBase}sync/manifest.json` |
| `appId`         | `de.ricorewi.easygames`                                                  | applicationId (Paketname auf dem Gerät) |
| `versionName`   | `1.0.0`                                                                  | angezeigte Version |
| `versionCode`   | `1`                                                                      | muss bei jedem Release steigen |
| `bundleContent` | `true`                                                                   | `false` = kein Start-Inhalt im APK |

Beispiel für einen Fork: `./android/build.sh` mit `SYNC_BASE=https://raw.githubusercontent.com/dein-name/easygames/main/ APP_ID=de.dein.easygames`.

## Tests

Die Kernlogik (`:core`) läuft ohne Android-SDK:

```bash
cd android
gradle :core:test
```

Ohne `ANDROID_HOME` (oder mit `-PcoreOnly=true`) bindet Gradle nur `:core` ein und fasst das Google-Repository nicht an.

## Automatische Builds

Ein neues APK ist nur bei Änderungen an der **Hülle** nötig (Kotlin-Code, Icons, Berechtigungen) – Spiele laufen per Sync.
Pakettests: `node tools/test-sync-build.js`. Offline-App-Starttest (Playwright + Chromium): `node tools/android-runtime-audit.js`.

Der Workflow `.github/workflows/android.yml` baut bei Pull Requests und Pushes ein Test-APK (Actions → Android offline build → Artefakt). Für das Installationsupdate der vorhandenen Release-App muss weiterhin der bisherige Signierschlüssel über `build.sh` verwendet werden.

Auch direkte Android-Studio-/Gradle-Builds erzeugen jetzt den vollständigen Start-Inhalt mit Node.js. Dieser liegt unter `assets/easygames/content/<sha256>`; so bleiben auch Vite-Module mit Unterstrich im Dateinamen erhalten. Die PWA-Caches werden beim Start/Übernehmen eines Updates bereinigt, Speicherstände in localStorage/IndexedDB bleiben bestehen. Neue Spiele werden nach einem Eintrag in `games.js` automatisch mit synchronisiert.

Alternative Server-Auslöser:

- **Cron** (nachts): `0 4 * * *  cd /srv/easygames && git pull -q && ./android/build.sh >> /var/log/easygames-build.log 2>&1`
  (mit `git diff --quiet HEAD@{1} -- android` davor, um nur bei Änderungen zu bauen).
- **Webhook**: Ein kleiner Webhook-Empfänger (z. B. `adnanh/webhook`) ruft bei einem GitHub-Push `git pull && ./android/build.sh` auf.
  Webhook-Secret prüfen und den Dienst nur über HTTPS erreichbar machen.

## Sicherheitshinweise

- Keystore und Passwörter **nie** ins Repo, nie in Logs, Berechtigungen `600`. Backup an einem sicheren Ort.
- Inhalte werden nur über **https** geladen (`usesCleartextTraffic=false`, Netzwerk-Konfiguration ohne Nutzerzertifikate)
  und vor dem Speichern per **SHA-256** gegen das Manifest geprüft; Pfade mit `..` oder absolute Pfade werden abgelehnt.
  Wer das Manifest im GitHub-Repo ändern kann, kann damit die Inhalte der App ändern – Schreibrechte am Repo entsprechend schützen.
- Die JS-Brücke `EasyGamesApp` bietet bewusst nur harmlose Methoden (`getInfo`, `syncNow`, `reload`, `openSettings`).
  „Nur im WLAN aktualisieren“ lässt sich ausschließlich im nativen Dialog ändern, nicht aus JavaScript.
- Die WebView hat keinen Datei-/Content-Zugriff, keinen Mixed-Content und Safe Browsing ist an. Fremde Links öffnen im System-Browser.
- Mikrofon/Kamera werden nur für den eigenen Ursprung und erst nach Android-Berechtigungsabfrage freigegeben.

## Grenzen

- Online-Funktionen der Spiele brauchen weiterhin Internet, z. B. PeerJS-Kopplung zwischen Geräten, Radio-Streams
  und Cloud-Speicherstände. Nur die Programmdateien und die in der Vendor-Map eingetragenen Bibliotheken sind offline.
- Fremde Bibliotheken (CDN-URLs) müssen in der Vendor-Map des Manifests stehen; unbekannte externe URLs gehen ins Netz.
- Medien-Dateien werden ohne HTTP-Range-Unterstützung ausgeliefert (Abspielen geht, Springen in langen Audio-/Videodateien evtl. nicht).
- Der Hintergrund-Sync läuft laut Android-Vorgabe frühestens alle 15 Minuten und nur nach Systemlaune (Doze, Energiesparmodus).

## APK automatisch auf der RicoReWi-Radio-Seite bereitstellen

Die Seiten (Startseite, Apps-Seite, easygames-Seite) verlinken `/downloads/easygames-Developer.apk` und lesen die Version aus
`/downloads/easygames-latest.json`. Der Server-Job kann diese beiden Dateien nach jedem Build selbst dort ablegen:

```bash
sudo bash /opt/easygames/android/server/publish-setup.sh <Live-Webroot>/downloads     # einmalig
sudo systemctl start easygames-build.service                                           # sofort veröffentlichen
```

`publish-setup.sh` gibt dem Benutzer `easygames` Schreibrecht nur auf diesen Ordner (ACL) und trägt `PUBLISH_DIR` in
`/etc/easygames-build.env` ein. Danach legt jeder Lauf das neueste APK atomar als `easygames-Developer.apk` ab, dazu
`easygames-latest.json` (`version`, `version_code`, `sha256`, `size_bytes`, `built_at`); unverändert wird nichts neu geschrieben.
Der Deploy der Seite löscht fremde Dateien im Ordner nicht (kein globales `--delete`). Test: `bash android/server/test-publish.sh`.
