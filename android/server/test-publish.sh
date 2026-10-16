#!/usr/bin/env bash
# Prüft publish_download() aus run-build.sh in einem Wegwerf-Ordner (ohne Build): bash android/server/test-publish.sh
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
log() { echo "$*"; }
eval "$(sed -n '/^publish_download() {/,/^}/p' "$HERE/run-build.sh")"
OUT_DIR=$T/out; PUBLISH_DIR=$T/pub; FORMAT=apk; mkdir -p "$OUT_DIR" "$PUBLISH_DIR"
head -c 1000 /dev/urandom > "$OUT_DIR/easygames-1.0.7.apk"; ln -s easygames-1.0.7.apk "$OUT_DIR/easygames-latest.apk"
echo '{"versionName":"1.0.7","versionCode":7,"file":"easygames-1.0.7.apk","sha256":"abc","bytes":1000,"built":"2026-01-01T00:00:00Z","commit":"x"}' > "$OUT_DIR/latest.json"
fail() { echo "FEHLER: $*"; exit 1; }
publish_download >/dev/null
cmp -s "$OUT_DIR/easygames-1.0.7.apk" "$PUBLISH_DIR/easygames-Developer.apk" || fail "APK nicht kopiert"
[ -L "$PUBLISH_DIR/easygames-Developer.apk" ] && fail "Kopie darf kein Link sein"
node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1]));if(j.version!=="1.0.7"||j.version_code!==7||j.filename!=="easygames-Developer.apk"||j.package!=="de.ricorewi.easygames"||j.size_bytes!==1000)process.exit(1)' "$PUBLISH_DIR/easygames-latest.json" || fail "JSON falsch"
ls "$PUBLISH_DIR" | grep -q tmp && fail "Temp-Dateien übrig"
M=$(stat -c %Y "$PUBLISH_DIR/easygames-Developer.apk"); sleep 1; publish_download >/dev/null
[ "$M" = "$(stat -c %Y "$PUBLISH_DIR/easygames-Developer.apk")" ] || fail "unverändert, darf nicht neu schreiben"
head -c 500 /dev/urandom > "$OUT_DIR/easygames-1.0.8.apk"; ln -sfn easygames-1.0.8.apk "$OUT_DIR/easygames-latest.apk"
publish_download >/dev/null; cmp -s "$OUT_DIR/easygames-1.0.8.apk" "$PUBLISH_DIR/easygames-Developer.apk" || fail "neues APK nicht übernommen"
PUBLISH_DIR=$T/gibtsnicht; publish_download >/dev/null && fail "fehlender Ordner muss Fehlercode liefern" || true
PUBLISH_DIR=; publish_download || fail "ohne PUBLISH_DIR muss stumm erfolgreich sein"
# find_artifact: findet das Ergebnis auch ohne neuere Datei (Gradle up-to-date) und bevorzugt Release
eval "$(sed -n '/^find_artifact() {/,/^}/p' "$HERE/run-build.sh")"
( cd "$T" && mkdir -p android/app/build/outputs/apk/debug android/app/build/outputs/apk/release \
  && echo d > android/app/build/outputs/apk/debug/app-debug.apk && sleep 1 && echo r > android/app/build/outputs/apk/release/app-release.apk \
  && [ "$(find_artifact apk)" = "android/app/build/outputs/apk/release/app-release.apk" ] ) || fail "find_artifact: Release nicht gefunden"
( cd "$T" && rm -rf android/app/build/outputs/apk/release && [ "$(find_artifact apk)" = "android/app/build/outputs/apk/debug/app-debug.apk" ] ) || fail "find_artifact: Fallback fehlt"
( cd "$T" && rm -rf android && [ -z "$(find_artifact apk)" ] ) || fail "find_artifact: ohne Ergebnis muss leer sein"
echo "OK: publish_download"
