#!/usr/bin/env bash
# Baut die easygames-App (APK oder AAB) auf dem Build-Server.
#
# Umgebungsvariablen (alle optional, außer ANDROID_HOME):
#   ANDROID_HOME / ANDROID_SDK_ROOT   Pfad zum Android-SDK (Pflicht)
#   FORMAT=apk|aab                    Ausgabeformat (Standard: apk)
#   BUNDLE_CONTENT=0                  Start-Inhalt NICHT ins APK packen (App lädt dann beim ersten Start)
#   VERSION_NAME, VERSION_CODE        Version; Standard: aus "git rev-list --count HEAD"
#   APP_ID                            applicationId (Standard: de.ricorewi.easygames)
#   SYNC_BASE                         Basis-URL des Inhalts (muss auf "/" enden)
#   KEYSTORE_PATH, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD   Release-Signierung
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FORMAT="${FORMAT:-apk}"
BUNDLE_CONTENT="${BUNDLE_CONTENT:-1}"

die() { echo "FEHLER: $*" >&2; exit 1; }

# ---- Voraussetzungen prüfen ----
command -v java >/dev/null 2>&1 || die "Java nicht gefunden (JDK 17 oder neuer nötig)."
JAVA_OUT="$(java -version 2>&1 || true)"
JAVA_MAJOR="$(printf '%s\n' "$JAVA_OUT" | grep -m1 ' version "' | sed -E 's/.*"([0-9]+)(\.([0-9]+))?.*/\1 \3/' | awk '{ if ($1 == 1) print $2; else print $1 }')"
case "$JAVA_MAJOR" in ''|*[!0-9]*) die "Java-Version nicht erkennbar." ;; esac
[ "$JAVA_MAJOR" -ge 17 ] || die "Java $JAVA_MAJOR gefunden, JDK 17 oder neuer nötig."

if [ -z "${ANDROID_HOME:-}" ] && [ -n "${ANDROID_SDK_ROOT:-}" ]; then export ANDROID_HOME="$ANDROID_SDK_ROOT"; fi
[ -n "${ANDROID_HOME:-}" ] || die "ANDROID_HOME ist nicht gesetzt (Pfad zum Android-SDK)."
[ -d "$ANDROID_HOME" ] || die "ANDROID_HOME zeigt auf kein Verzeichnis: $ANDROID_HOME"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

case "$FORMAT" in apk|aab) ;; *) die "FORMAT muss apk oder aab sein (ist: $FORMAT)." ;; esac

if [ "$BUNDLE_CONTENT" != "0" ]; then
  command -v node >/dev/null 2>&1 || die "Node.js nicht gefunden (für tools/build-sync.js). Alternativ BUNDLE_CONTENT=0."
fi

if [ -x "$SCRIPT_DIR/gradlew" ]; then
  GRADLE=("$SCRIPT_DIR/gradlew")
elif command -v gradle >/dev/null 2>&1; then
  GRADLE=(gradle)
else
  die "Weder android/gradlew noch gradle gefunden (siehe README: 'gradle wrapper')."
fi

if [ -z "${KEYSTORE_PATH:-}" ] || [ -z "${KEYSTORE_PASSWORD:-}" ] || [ -z "${KEY_ALIAS:-}" ] || [ -z "${KEY_PASSWORD:-}" ]; then
  echo "WARNUNG: Keystore-Variablen nicht vollständig gesetzt – es wird mit dem Debug-Schlüssel signiert." >&2
fi

# ---- Version ----
if [ -z "${VERSION_CODE:-}" ] && command -v git >/dev/null 2>&1 && git -C "$REPO_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  VERSION_CODE="$(git -C "$REPO_ROOT" rev-list --count HEAD 2>/dev/null || echo 1)"
fi
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0.$VERSION_CODE}"

# ---- Start-Inhalt (Baseline) erzeugen ----
GRADLE_ARGS=("-PversionName=$VERSION_NAME" "-PversionCode=$VERSION_CODE")
[ -n "${APP_ID:-}" ] && GRADLE_ARGS+=("-PappId=$APP_ID")
[ -n "${SYNC_BASE:-}" ] && GRADLE_ARGS+=("-PsyncBase=$SYNC_BASE")

if [ "$BUNDLE_CONTENT" != "0" ]; then
  echo "==> Start-Inhalt erzeugen (tools/build-sync.js)"
  (cd "$REPO_ROOT" && node tools/build-sync.js --stage android/app/src/main/assets/easygames)
else
  echo "==> Start-Inhalt übersprungen (BUNDLE_CONTENT=0): die App lädt beim ersten Start"
  GRADLE_ARGS+=("-PbundleContent=false")
fi

# ---- Bauen ----
if [ "$FORMAT" = "aab" ]; then TASK=":app:bundleRelease"; else TASK=":app:assembleRelease"; fi
echo "==> Gradle $TASK (Version $VERSION_NAME / Code $VERSION_CODE)"
"${GRADLE[@]}" -p "$SCRIPT_DIR" "${GRADLE_ARGS[@]}" "$TASK"

# ---- Ergebnis ----
if [ "$FORMAT" = "aab" ]; then
  OUT_DIR="$SCRIPT_DIR/app/build/outputs/bundle/release"; EXT="aab"
else
  OUT_DIR="$SCRIPT_DIR/app/build/outputs/apk/release"; EXT="apk"
fi
ARTIFACT="$(find "$OUT_DIR" -maxdepth 1 -name "*.$EXT" 2>/dev/null | sort | head -n 1)"
[ -n "$ARTIFACT" ] || die "Kein .$EXT in $OUT_DIR gefunden."

if command -v sha256sum >/dev/null 2>&1; then SHA="$(sha256sum "$ARTIFACT" | awk '{print $1}')"
else SHA="$(shasum -a 256 "$ARTIFACT" | awk '{print $1}')"; fi

echo
echo "Fertig:"
echo "  Datei:   $ARTIFACT"
echo "  Version: $VERSION_NAME ($VERSION_CODE)"
echo "  SHA-256: $SHA"
