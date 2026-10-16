#!/bin/sh
# easygames für EmulationStation – Startprogramm für Linux, Steam Deck, RetroPie und macOS.
# Prüft, ob Python 3.8+ vorhanden ist (bietet sonst mit Rückfrage die Installation an) und startet dann
# emulationstation.py install mit allen übergebenen Optionen, z. B.:  sh install-emulationstation.sh --mode offline
# Anleitung: https://ricorewioriginal-collab.github.io/easygames/einbinden.html#retro
# Umgebungsvariablen: EASYGAMES_YES=1 (Rückfragen mit „ja“ beantworten), EASYGAMES_BASE (andere Homepage-Adresse),
#                     EASYGAMES_SCRIPT=Pfad (lokales emulationstation.py statt Download)
set -eu

BASE="${EASYGAMES_BASE:-https://ricorewioriginal-collab.github.io/easygames}"

say() { printf '%s\n' "$*"; }
fail() { printf 'Fehler: %s\n' "$*" >&2; exit 1; }

ask() {
  [ "${EASYGAMES_YES:-}" = 1 ] && return 0
  [ -r /dev/tty ] || return 1
  printf '%s [j/N] ' "$1" >/dev/tty 2>/dev/null || return 1
  read -r answer </dev/tty 2>/dev/null || return 1
  case "$answer" in j | J | ja | Ja | y | Y | yes) return 0 ;; *) return 1 ;; esac
}

find_python() {
  for p in python3 python; do
    if command -v "$p" >/dev/null 2>&1 && "$p" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' >/dev/null 2>&1; then
      command -v "$p"
      return 0
    fi
  done
  return 1
}

install_python() {
  SUDO=""
  if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi
  if command -v apt-get >/dev/null 2>&1; then
    $SUDO apt-get update && $SUDO apt-get install -y python3
  elif command -v dnf >/dev/null 2>&1; then
    $SUDO dnf install -y python3
  elif command -v pacman >/dev/null 2>&1; then
    $SUDO pacman -S --noconfirm python
  elif command -v zypper >/dev/null 2>&1; then
    $SUDO zypper --non-interactive install python3
  elif command -v apk >/dev/null 2>&1; then
    $SUDO apk add python3
  elif command -v brew >/dev/null 2>&1; then
    brew install python
  else
    return 1
  fi
}

PY="$(find_python || true)"
if [ -z "$PY" ]; then
  say "Python 3.8 oder neuer wurde nicht gefunden (wird nur zum Einrichten und für den Offline-Modus gebraucht)."
  if ask "Python jetzt installieren?"; then
    install_python || fail "Python konnte nicht automatisch installiert werden. Bitte von Hand installieren: https://www.python.org/downloads/"
    PY="$(find_python || true)"
    [ -n "$PY" ] || fail "Python ist nach der Installation nicht auffindbar. Terminal neu öffnen und das Skript erneut starten."
  else
    fail "Ohne Python geht es nicht weiter. Installieren (z. B. 'sudo apt install python3') und das Skript erneut starten."
  fi
fi

SCRIPT="${EASYGAMES_SCRIPT:-}"
TMP=""
cleanup() { [ -n "$TMP" ] && rm -rf "$TMP"; return 0; }
trap cleanup EXIT INT TERM
if [ -z "$SCRIPT" ]; then
  TMP="$(mktemp -d)"
  SCRIPT="$TMP/emulationstation.py"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$BASE/tools/emulationstation.py" -o "$SCRIPT" || fail "Download fehlgeschlagen: $BASE/tools/emulationstation.py"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$SCRIPT" "$BASE/tools/emulationstation.py" || fail "Download fehlgeschlagen: $BASE/tools/emulationstation.py"
  else
    fail "Weder curl noch wget gefunden."
  fi
fi
[ -f "$SCRIPT" ] || fail "emulationstation.py nicht gefunden: $SCRIPT"

"$PY" "$SCRIPT" install "$@"
