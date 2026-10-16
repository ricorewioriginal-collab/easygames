#!/usr/bin/env bash
# easygames Server-Einrichtung (Debian/Ubuntu, als root). Idempotent: kann beliebig oft erneut laufen.
#   sudo BRANCH=main bash install.sh
# Legt an: Benutzer "easygames", Repo in /opt/easygames, Android-SDK in /opt/android-sdk, Release-Keystore,
# /etc/easygames-build.env und den systemd-Timer "easygames-build.timer" (alle 10 Minuten, schonend).
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Bitte als root ausführen (sudo)."; exit 1; }

REPO_HTTPS=${REPO_HTTPS:-https://github.com/ricorewioriginal-collab/easygames.git}
REPO_SSH=${REPO_SSH:-git@github.com:ricorewioriginal-collab/easygames.git}
BRANCH=${BRANCH:-main}
REPO_DIR=${REPO_DIR:-/opt/easygames}
SDK_DIR=${SDK_DIR:-/opt/android-sdk}
STATE_DIR=${STATE_DIR:-/var/lib/easygames-build}
OUT_DIR=${OUT_DIR:-/var/www/easygames-app}
ENV_FILE=/etc/easygames-build.env
CMDLINE_TOOLS_URL=${CMDLINE_TOOLS_URL:-https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip}
as_u() { runuser -u easygames -- env HOME="$STATE_DIR" "$@"; }   # als Dienstbenutzer mit eigenem HOME
say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

say "1/7 Pakete"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl unzip ca-certificates openssl util-linux openjdk-17-jdk-headless >/dev/null
node_ok() { command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ]; }
if ! node_ok; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
node_ok || { echo "Node.js >= 18 fehlt"; exit 1; }
java -version 2>&1 | head -1; node -v

say "2/7 Benutzer und Ordner"
id easygames >/dev/null 2>&1 || useradd --system --create-home --home-dir "$STATE_DIR" --shell /usr/sbin/nologin easygames
mkdir -p "$STATE_DIR" "$OUT_DIR" "$SDK_DIR" "$STATE_DIR/.ssh"
chown -R easygames:easygames "$STATE_DIR" "$SDK_DIR"; chmod 700 "$STATE_DIR/.ssh"
chown easygames:easygames "$OUT_DIR"; chmod 755 "$OUT_DIR"   # nur dieser Ordner (nicht rekursiv): OUT_DIR sollte ein eigener Unterordner des Webordners sein

say "3/7 Repository ($BRANCH)"
if [ ! -d "$REPO_DIR/.git" ]; then
  mkdir -p "$REPO_DIR"; chown easygames:easygames "$REPO_DIR"
  as_u git clone -q -b "$BRANCH" "$REPO_HTTPS" "$REPO_DIR"
fi
as_u git -C "$REPO_DIR" remote set-url --push origin "$REPO_SSH"   # lesen per https (öffentlich), schreiben per Deploy-Key
as_u git -C "$REPO_DIR" fetch -q origin "$BRANCH"
as_u git -C "$REPO_DIR" checkout -q -f -B "$BRANCH" "origin/$BRANCH"
[ -f "$REPO_DIR/android/server/run-build.sh" ] || { echo "android/server/run-build.sh fehlt auf Branch $BRANCH (BRANCH=… setzen)"; exit 1; }

say "4/7 Android-SDK"
if [ ! -x "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
  tmp=$(mktemp -d); curl -fsSL "$CMDLINE_TOOLS_URL" -o "$tmp/ct.zip"; unzip -q "$tmp/ct.zip" -d "$tmp"
  mkdir -p "$SDK_DIR/cmdline-tools"; rm -rf "$SDK_DIR/cmdline-tools/latest"; mv "$tmp/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"; rm -rf "$tmp"
  chown -R easygames:easygames "$SDK_DIR"
fi
export ANDROID_HOME="$SDK_DIR"
yes | as_u env ANDROID_HOME="$SDK_DIR" "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null || true
as_u env ANDROID_HOME="$SDK_DIR" "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/dev/null

say "5/7 Schlüssel (GitHub-Deploy-Key + App-Signatur)"
KEY="$STATE_DIR/.ssh/id_ed25519"
[ -f "$KEY" ] || as_u ssh-keygen -q -t ed25519 -N "" -C "easygames-server" -f "$KEY"
if [ ! -f "$ENV_FILE" ]; then
  cp "$REPO_DIR/android/server/easygames-build.env.example" "$ENV_FILE"
  sed -i "s|^BRANCH=.*|BRANCH=$BRANCH|; s|^REPO_DIR=.*|REPO_DIR=$REPO_DIR|; s|^STATE_DIR=.*|STATE_DIR=$STATE_DIR|; s|^OUT_DIR=.*|OUT_DIR=$OUT_DIR|; s|^ANDROID_HOME=.*|ANDROID_HOME=$SDK_DIR|" "$ENV_FILE"
fi
if ! grep -q '^KEYSTORE_PASSWORD=.\+' "$ENV_FILE"; then
  KS="$STATE_DIR/release.jks"; PW=$(openssl rand -hex 16)
  if [ ! -f "$KS" ]; then
    as_u keytool -genkeypair -v -keystore "$KS" -storetype PKCS12 -storepass "$PW" -keypass "$PW" -alias easygames \
      -keyalg RSA -keysize 4096 -validity 10000 -dname "CN=easygames, O=RicoReWi" >/dev/null 2>&1
    NEWKS=1
  fi
  sed -i "s|^KEYSTORE_PASSWORD=.*|KEYSTORE_PASSWORD=$PW|; s|^KEY_PASSWORD=.*|KEY_PASSWORD=$PW|" "$ENV_FILE"
fi
chown root:easygames "$ENV_FILE"; chmod 640 "$ENV_FILE"

say "6/7 Timer"
for f in easygames-build.service easygames-build.timer; do
  sed "s|/opt/easygames|$REPO_DIR|g" "$REPO_DIR/android/server/$f" > "/etc/systemd/system/$f"
done
systemctl daemon-reload
systemctl enable --now easygames-build.timer

say "7/7 Fertig"
cat <<MSG
Timer aktiv: $(systemctl list-timers easygames-build.timer --no-legend | head -1)

WICHTIG – noch zu tun:
 1) Deploy-Key bei GitHub eintragen (Repo → Settings → Deploy keys → Add, "Allow write access" anhaken),
    damit der Server das Manifest nach GitHub pushen darf:

$(cat "$KEY.pub")

 2) Den Release-Keystore SICHERN (ohne ihn sind keine App-Updates möglich): $STATE_DIR/release.jks
    Passwörter stehen in $ENV_FILE
 3) $OUT_DIR per Webserver bereitstellen (z. B. nginx/Caddy), dort liegen easygames-latest.apk und latest.json.
 4) Optional, APK automatisch auf der RicoReWi-Radio-Seite bereitstellen: sudo bash $REPO_DIR/android/server/publish-setup.sh <Live-Webroot>/downloads

Erster Lauf sofort:    sudo systemctl start easygames-build.service
Fortschritt ansehen:   journalctl -fu easygames-build.service
Neubau erzwingen:      sudo systemctl set-environment FORCE=1 && sudo systemctl start easygames-build.service; sudo systemctl unset-environment FORCE
Timer anhalten/starten: sudo systemctl stop|start easygames-build.timer
MSG
