#!/usr/bin/env bash
# Einmalig (als root): easygames-Build darf das APK in den Download-Ordner der RicoReWi-Radio-Seite legen.
#   sudo bash android/server/publish-setup.sh /pfad/zum/live-webroot/downloads
# Der Ordner ist der "downloads"-Ordner des LIVE-Webroots (dort liegen schon RicoReWi-Radio-Developer.apk usw.).
# Der Deploy der Seite löscht fremde Dateien nicht (kein globales --delete), die bereitgestellten Dateien bleiben also erhalten.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Bitte als root ausführen (sudo)."; exit 1; }
DIR=${1:-}; ENV_FILE=${ENV_FILE:-/etc/easygames-build.env}
[ -n "$DIR" ] && [ -d "$DIR" ] || { echo "Aufruf: sudo bash $0 /pfad/zum/live-webroot/downloads   (Ordner muss existieren)"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "$ENV_FILE fehlt – erst install.sh ausführen."; exit 1; }
DIR=$(cd "$DIR" && pwd)
# Schreibrecht nur für diesen Ordner und nur für den Benutzer easygames (ACL), Besitzer und Rechte der Seite bleiben unverändert
if command -v setfacl >/dev/null 2>&1; then
  setfacl -m u:easygames:rwx "$DIR"
else
  apt-get install -y -qq acl >/dev/null && setfacl -m u:easygames:rwx "$DIR"
fi
if grep -q '^#\?PUBLISH_DIR=' "$ENV_FILE"; then sed -i "s|^#\?PUBLISH_DIR=.*|PUBLISH_DIR=$DIR|" "$ENV_FILE"; else printf 'PUBLISH_DIR=%s\n' "$DIR" >> "$ENV_FILE"; fi
echo "PUBLISH_DIR=$DIR gesetzt. Test: sudo systemctl start easygames-build.service ; danach: ls -l $DIR/easygames-*"
