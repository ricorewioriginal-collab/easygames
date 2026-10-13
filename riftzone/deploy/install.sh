#!/usr/bin/env bash
# Installiert den RIFTZONE-Server auf Ubuntu 22.04/24.04 nach /opt/riftzone und startet ihn als systemd-Dienst.
#   sudo bash deploy/install.sh            (aus dem Ordner riftzone/ heraus)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST=/opt/riftzone
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  echo "→ Node.js 22 installieren"
  apt-get update -y && apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
id riftzone >/dev/null 2>&1 || useradd --system --home "$DEST" --shell /usr/sbin/nologin riftzone
mkdir -p "$DEST" "$DEST/data"
cp -r "$SRC/package.json" "$SRC/package-lock.json" "$SRC/tsconfig.json" "$SRC/tsconfig.server.json" "$SRC/shared" "$SRC/server" "$SRC/scripts" "$DEST/" 2>/dev/null || true
[ -d "$SRC/app" ] && cp -r "$SRC/app" "$DEST/"
cd "$DEST"
echo "→ Abhängigkeiten installieren und Server bauen"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm run server:build
chown -R riftzone:riftzone "$DEST"
[ -f /etc/riftzone.env ] || cp "$SRC/deploy/riftzone.env.example" /etc/riftzone.env
cp "$SRC/deploy/riftzone.service" /etc/systemd/system/riftzone.service
systemctl daemon-reload
systemctl enable --now riftzone
sleep 3
curl -fsS "http://127.0.0.1:$(grep -E '^PORT=' /etc/riftzone.env | cut -d= -f2 || echo 2610)/health" && echo
echo "✓ RIFTZONE-Server läuft. Einstellungen: /etc/riftzone.env · Logs: journalctl -u riftzone -f"
echo "  Für Browser auf https-Seiten wird wss:// gebraucht → Caddy/nginx-Beispiel in deploy/."
