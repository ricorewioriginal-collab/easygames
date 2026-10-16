#!/usr/bin/env bash
# easygames Server-Job (läuft per systemd-Timer, ressourcenschonend):
#   1. holt den neuesten Stand von GitHub
#   2. prüft die Spiele und berechnet sync/manifest.json + sync/catalog.json neu – bei Änderungen wird das Manifest
#      nach GitHub gepusht (die App lädt von dort; ersetzt GitHub Actions)
#   3. baut ein neues APK nur, wenn sich android/ geändert hat (oder FORCE=1, kein APK vorhanden, älter als REBUILD_DAYS)
#   4. legt das APK samt latest.json im Ausgabeordner ab
# Spiele-Updates brauchen kein neues APK: die App synchronisiert sie selbst per WLAN.
set -Eeuo pipefail

: "${REPO_DIR:=/opt/easygames}" "${STATE_DIR:=/var/lib/easygames-build}" "${OUT_DIR:=/var/www/easygames-app}"
: "${BRANCH:=main}" "${REMOTE:=origin}" "${MANIFEST_PUSH:=1}" "${REBUILD_DAYS:=30}" "${FORCE:=0}" "${KEEP_APKS:=5}" "${FORMAT:=apk}"
: "${BUILD_CMD:=$REPO_DIR/android/build.sh}"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
notify() { [ -z "${NOTIFY_URL:-}" ] || curl -fsS -m 15 -X POST --data-urlencode "text=$1" "$NOTIFY_URL" >/dev/null 2>&1 || true; }
trap 'rc=$?; log "FEHLER (Exit $rc, Zeile $LINENO)"; notify "easygames-build: FEHLER (Exit $rc) – siehe journalctl -u easygames-build"; exit $rc' ERR

# Optional (PUBLISH_DIR gesetzt): fertiges APK + Versionsangabe unter den festen Namen der Webseite bereitstellen.
# PUBLISH_DIR = Ordner "downloads" im Live-Webroot der RicoReWi-Radio-Seite; dort liegen dann easygames-Developer.apk und
# easygames-latest.json (Startseite, Apps-Seite und easygames-Seite verlinken genau diese Namen). Schreibt nur bei Änderung, atomar.
publish_download() {
  [ -n "${PUBLISH_DIR:-}" ] || return 0
  local src="$OUT_DIR/easygames-latest.$FORMAT" name="${PUBLISH_NAME:-easygames-Developer}" dst
  [ -e "$src" ] || return 0
  if [ ! -d "$PUBLISH_DIR" ] || [ ! -w "$PUBLISH_DIR" ]; then log "PUBLISH_DIR $PUBLISH_DIR fehlt oder ist nicht beschreibbar – Bereitstellung übersprungen"; return 1; fi
  dst="$PUBLISH_DIR/$name.$FORMAT"
  if [ -f "$dst" ] && [ -f "$PUBLISH_DIR/easygames-latest.json" ] && cmp -s "$src" "$dst"; then return 0; fi
  cp -f "$src" "$dst.tmp" && chmod 644 "$dst.tmp" && mv -f "$dst.tmp" "$dst"
  node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(JSON.stringify({version:j.versionName,version_code:j.versionCode,package:process.argv[3],filename:process.argv[2],size_bytes:j.bytes,sha256:j.sha256,built_at:j.built})+"\n")' \
    "$OUT_DIR/latest.json" "$name.$FORMAT" "${APP_ID:-de.ricorewi.easygames}" > "$PUBLISH_DIR/easygames-latest.json.tmp"
  chmod 644 "$PUBLISH_DIR/easygames-latest.json.tmp" && mv -f "$PUBLISH_DIR/easygames-latest.json.tmp" "$PUBLISH_DIR/easygames-latest.json"
  log "Bereitgestellt: $dst"
}

# Der gesamte Ablauf steckt in main(): Bash liest die Funktion vollständig ein, bevor sie läuft. So kann sich
# diese Datei während des Laufs (git reset auf einen neuen Stand) gefahrlos ändern.
main() {
  mkdir -p "$STATE_DIR" "$OUT_DIR"
  exec 9>"$STATE_DIR/lock"
  flock -n 9 || { log "Ein anderer Lauf ist aktiv – beendet"; exit 0; }

  cd "$REPO_DIR"
  export GIT_TERMINAL_PROMPT=0
  sync_repo() { git fetch -q --prune "$REMOTE" "$BRANCH"; git checkout -q -f -B "$BRANCH" "$REMOTE/$BRANCH"; git reset -q --hard "$REMOTE/$BRANCH"; git clean -fdq -e android/.gradle -e android/app/build -e android/core/build -e android/build; }

  sync_repo
  REMOTE_SHA=$(git rev-parse HEAD)
  LAST_SHA=$(cat "$STATE_DIR/last-commit" 2>/dev/null || true)
  LATEST_APK="$OUT_DIR/easygames-latest.apk"; [ "$FORMAT" = aab ] && LATEST_APK="$OUT_DIR/easygames-latest.aab"
  APK_OLD=0
  if [ -e "$LATEST_APK" ]; then [ -n "$(find "$LATEST_APK" -mtime +"$REBUILD_DAYS" -print 2>/dev/null)" ] && APK_OLD=1; else APK_OLD=1; fi
  if [ "$FORCE" != 1 ] && [ "$REMOTE_SHA" = "$LAST_SHA" ] && [ "$APK_OLD" = 0 ]; then log "Keine Änderungen (${REMOTE_SHA:0:8})"; publish_download || true; exit 0; fi
  log "Stand ${REMOTE_SHA:0:8} ($BRANCH)"

  # --- 1. Spiele prüfen + Manifest ---------------------------------------------------------------
  node tools/check-games.js | tail -1
  publish_manifest() {
    local try
    for try in 1 2 3; do
      node tools/build-sync.js
      if [ -z "$(git status --porcelain -- sync)" ]; then log "Manifest unverändert"; return 0; fi
      [ "$MANIFEST_PUSH" = 1 ] || { log "Manifest geändert (MANIFEST_PUSH=0, nicht gepusht)"; return 0; }
      git add sync
      git -c user.name="easygames-server" -c user.email="easygames-server@users.noreply.github.com" commit -q -m "Sync-Manifest aktualisiert (Server)"
      if git push -q "$REMOTE" "HEAD:$BRANCH"; then log "Manifest nach GitHub gepusht ($(git rev-parse --short HEAD))"; return 0; fi
      log "Push abgelehnt (Versuch $try) – hole neuen Stand"; sync_repo
    done
    log "Manifest konnte nicht gepusht werden"; return 1
  }
  publish_manifest

  # --- 2. APK nur bei Bedarf ---------------------------------------------------------------------
  APP_TREE=$(git rev-parse HEAD:android)
  LAST_TREE=$(cat "$STATE_DIR/last-app-tree" 2>/dev/null || true)
  if [ ! -x "$BUILD_CMD" ]; then
    log "Build-Skript $BUILD_CMD fehlt (App-Code noch nicht auf Branch $BRANCH) – nur Manifest aktualisiert"
  elif [ "$FORCE" = 1 ] || [ "$APP_TREE" != "$LAST_TREE" ] || [ "$APK_OLD" = 1 ]; then
    VERSION_CODE=${VERSION_CODE:-$(git rev-list --count HEAD)}; VERSION_NAME=${VERSION_NAME:-1.0.$VERSION_CODE}
    export VERSION_CODE VERSION_NAME FORMAT BUNDLE_CONTENT="${BUNDLE_CONTENT:-1}"
    log "Baue App $VERSION_NAME (Code $VERSION_CODE, $FORMAT) …"
    touch "$STATE_DIR/build-start"
    env -u PUBLISH_DIR "$BUILD_CMD"   # Bereitstellung übernimmt publish_download() unten (nicht abbrechend); build.sh würde bei fehlenden Rechten den ganzen Lauf abbrechen
    EXT=$FORMAT
    ART=$(find android -path '*/outputs/*' -name "*.$EXT" -newer "$STATE_DIR/build-start" 2>/dev/null | sort | grep -i release | head -1 || true)
    [ -n "$ART" ] || ART=$(find android -path '*/outputs/*' -name "*.$EXT" -newer "$STATE_DIR/build-start" 2>/dev/null | sort | head -1 || true)
    [ -n "$ART" ] || { log "Kein Build-Ergebnis (*.$EXT) gefunden"; exit 3; }
    TARGET="$OUT_DIR/easygames-$VERSION_NAME.$EXT"
    cp -f "$ART" "$TARGET.tmp" && mv -f "$TARGET.tmp" "$TARGET"
    ln -sfn "easygames-$VERSION_NAME.$EXT" "$OUT_DIR/easygames-latest.$EXT.tmp" && mv -Tf "$OUT_DIR/easygames-latest.$EXT.tmp" "$OUT_DIR/easygames-latest.$EXT"
    SHA=$(sha256sum "$TARGET" | cut -d' ' -f1); SIZE=$(stat -c %s "$TARGET")
    printf '{"versionName":"%s","versionCode":%s,"file":"easygames-%s.%s","sha256":"%s","bytes":%s,"built":"%s","commit":"%s"}\n' \
      "$VERSION_NAME" "$VERSION_CODE" "$VERSION_NAME" "$EXT" "$SHA" "$SIZE" "$(date -u +%FT%TZ)" "$(git rev-parse HEAD)" > "$OUT_DIR/latest.json.tmp"
    mv -f "$OUT_DIR/latest.json.tmp" "$OUT_DIR/latest.json"
    publish_download || log "Bereitstellung unter PUBLISH_DIR fehlgeschlagen (APK liegt weiter in $OUT_DIR)"
    ls -1t "$OUT_DIR"/easygames-[0-9]*."$EXT" 2>/dev/null | tail -n +"$((KEEP_APKS + 1))" | xargs -r rm -f
    echo "$APP_TREE" > "$STATE_DIR/last-app-tree"
    log "Fertig: $TARGET ($((SIZE / 1048576)) MB, sha256 ${SHA:0:12}…)"
    notify "easygames-build: App $VERSION_NAME gebaut ($((SIZE / 1048576)) MB)"
  else
    log "App unverändert – kein neues APK nötig (Spiele-Updates laufen per Sync)"
    publish_download || log "Bereitstellung unter PUBLISH_DIR fehlgeschlagen"
  fi
  git rev-parse HEAD > "$STATE_DIR/last-commit"
}
main "$@"
exit $?
