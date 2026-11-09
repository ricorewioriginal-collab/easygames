# easygames – Android-App

Native App (Kotlin, Jetpack Compose) wie ein kleiner Spiele-Client: **Entdecken** (Weiterspielen, Neu, Updates, Tages-Challenge,
Kategorien), **Bibliothek** (Suche, Filter, alle Spiele), **Community** (Konto, Profil & Freunde, Erfolge, Ranglisten, Chat,
Fehler melden) und **Mehr** (Einstellungen, App-Update, Unterstützen, Impressum und Datenschutz auf ricorewi.de).
Jedes Spiel wird **einzeln** installiert, geprüft (SHA-256) und aktualisiert; installierte Spiele laufen **offline**.
Das APK bringt keine Spiele mit (rund 2 MB), die App lädt beim ersten Start einmal die Basis (ca. 12 MB).

```
android/
  core/   reine JVM-Bibliothek: Manifest, Katalog, Bibliothek (Library.kt), HTTP (mit JUnit-Tests)
  app/    Android-App: Compose-Oberfläche (ui/), Spielfenster (GameActivity, WebView), Hintergrund-Abgleich (SyncWorker)
  build.sh   Build-Skript für den Server
```

## So kommen Spiele und Updates auf das Gerät

1. Du pushst nach GitHub. Der Workflow `Android offline build` prüft alles und aktualisiert auf `main` den Sync-Stand
   (`sync/manifest.json` = Dateiliste mit Größe + SHA-256, `sync/catalog.json` = Spiele mit Kurzanleitung; `node tools/build-sync.js`).
2. Die App holt beide Dateien (mit ETag) beim Start, beim Zurückkehren in die App (höchstens alle 10 Minuten), über ⟳ und
   alle 6 Stunden im Hintergrund (WorkManager; mit „Updates nur im WLAN“ nur im WLAN, nicht bei schwachem Akku).
3. **Neue Spiele** erscheinen sofort in der Bibliothek, 14 Tage mit „NEU“, und als Benachrichtigung.
4. **Updates**: Weicht eine Datei eines installierten Spiels ab, zeigt die App „UPDATE“ (Karte, Reiter-Zähler, Benachrichtigung).
   Mit „Updates automatisch laden“ (Standard) lädt sie es gleich – nie während das Spiel läuft, dann nach dem Beenden.
5. **App-Updates**: `easygames-latest.json` auf ricorewi-radio.de; eine neuere Version zeigt die App als Hinweis und Benachrichtigung.
6. Geladen wird je Spiel in einen Zwischenordner (4 parallel, Wiederholungen, Prüfung auf Größe + SHA-256); erst wenn alles stimmt,
   wird übernommen. Ein Fehler oder Abbruch lässt den bisherigen Stand unverändert.

Aufteilung (`core/…/Library.kt`): **Basis** = alles außerhalb der Spielordner (Konto-/Profil-/Ranglisten-Seiten, `cloud/fire-peer.js`,
Bibliotheken, Anleitungen, Vorschaubilder) plus das Kartenbild jedes Spiels; **Spielordner** einzeln; große Bibliotheken
(`vendor/<name>` ab 2 MB, z. B. MediaPipe für Groove Arena) nur für Spiele, die sie nutzen. Lädt ein Spiel Dateien eines anderen
(`../easyclash/js/…`), wird das andere automatisch mitinstalliert und bleibt, solange es gebraucht wird.

Online und Mehrspieler laufen wie überall über easygames: Die Spiele nutzen `cloud/fire-peer.js`, Einladungs-, TV- und Teilen-Links
zeigen auf `https://ricorewioriginal-collab.github.io/easygames/…`. Solche Links öffnen sich – wenn gewünscht – direkt in der App
(noch nicht installierte Spiele werden geladen und dann gestartet). Alle Spiele laufen unter derselben lokalen Adresse wie in der
ersten App-Version (`https://appassets.androidplatform.net/easygames/`), Spielstände und Anmeldung bleiben beim Update erhalten.

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
VERSION_NAME=2.1.0 VERSION_CODE=42 ./android/build.sh
```

Mit `PUBLISH_DIR=<Webroot>/downloads` legt `build.sh` das APK zusätzlich als `easygames-Developer.apk` (plus `easygames-latest.json`) auf der Downloads-Seite von ricorewi-radio.de ab; der Download-Knopf unter `/#apps` erscheint, sobald die Datei dort liegt.

Das Skript prüft Java 17+ und `ANDROID_HOME`, baut mit Gradle und gibt **Pfad und SHA-256** des Ergebnisses aus. Ohne Angabe wird der Versionscode aus `git rev-list --count HEAD` abgeleitet.

Ergebnis: `android/app/build/outputs/apk/release/app-release.apk` bzw. `…/bundle/release/app-release.aab`.

Spiele kommen nicht ins APK; zum ersten Start braucht die App einmal Internet.

### Konfiguration (Gradle-Properties, per `-P` oder in `~/.gradle/gradle.properties`)

| Property        | Standard                                                                 | Bedeutung |
|-----------------|--------------------------------------------------------------------------|-----------|
| `syncBase`      | `https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/` | Basis-URL; muss auf `/` enden. Manifest: `${syncBase}sync/manifest.json` |
| `appId`         | `de.ricorewi.easygames`                                                  | applicationId (Paketname auf dem Gerät) |
| `versionName`   | `2.0.0`                                                                  | angezeigte Version (`build.sh`: `2.0.<Versionscode>`) |
| `versionCode`   | `1`                                                                      | muss bei jedem Release steigen |

Beispiel für einen Fork: `./android/build.sh` mit `SYNC_BASE=https://raw.githubusercontent.com/dein-name/easygames/main/ APP_ID=de.dein.easygames`.

## Tests

Die Kernlogik (`:core`) läuft ohne Android-SDK:

```bash
cd android
./gradlew :core:test                                   # Bibliothek, Manifest, Downloads (ohne Android-SDK)
EASYGAMES_LIVE=1 ./gradlew :core:test --tests '*LiveLibraryTest*'   # gegen den echten Stand auf GitHub
./gradlew :app:testDebugUnitTest                       # Bildschirmfotos der Oberfläche (Robolectric) → app/build/screenshots
```

Ohne `ANDROID_HOME` (oder mit `-PcoreOnly=true`) bindet Gradle nur `:core` ein und fasst das Google-Repository nicht an.

## Automatische Builds

Ein neues APK ist nur bei Änderungen an der **App** nötig (Kotlin-Code, Icons, Berechtigungen) – Spiele kommen per Sync.
Pakettests: `node tools/test-sync-build.js`. Offline-App-Starttest (Playwright + Chromium): `node tools/android-runtime-audit.js`.

Der Workflow `.github/workflows/android.yml` baut bei Pull Requests und Pushes ein Test-APK (Actions → Android offline build → Artefakt). Für das Installationsupdate der vorhandenen Release-App muss weiterhin der bisherige Signierschlüssel über `build.sh` verwendet werden.

Neue Spiele werden nach einem Eintrag in `games.js` automatisch mit synchronisiert und erscheinen ohne neues APK in der App.

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
- Die JS-Brücke `EasyGamesApp` bietet bewusst nur harmlose Methoden (`getInfo`, `syncNow`, `reload`, `openSettings`, Sprachausgabe,
  Benachrichtigungen). Einstellungen lassen sich nur in der App ändern, nicht aus JavaScript.
- Die WebView hat keinen Datei-/Content-Zugriff, keinen Mixed-Content und Safe Browsing ist an. Fremde Links öffnen im System-Browser.
- Mikrofon/Kamera werden nur für den eigenen Ursprung und erst nach Android-Berechtigungsabfrage freigegeben.

## Grenzen

- Online-Funktionen der Spiele brauchen weiterhin Internet, z. B. PeerJS-Kopplung zwischen Geräten, Radio-Streams
  und Cloud-Speicherstände. Nur die Programmdateien und die in der Vendor-Map eingetragenen Bibliotheken sind offline.
- Fremde Bibliotheken (CDN-URLs) müssen in der Vendor-Map des Manifests stehen; unbekannte externe URLs gehen ins Netz.
- Medien-Dateien werden ohne HTTP-Range-Unterstützung ausgeliefert (Abspielen geht, Springen in langen Audio-/Videodateien evtl. nicht).
- Der Hintergrund-Abgleich läuft laut Android-Vorgabe nach Systemlaune (Doze, Energiesparmodus); in der App wird sofort abgeglichen.

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
