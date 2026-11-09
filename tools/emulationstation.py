#!/usr/bin/env python3
"""easygames für EmulationStation (ES-DE, RetroPie, Batocera/Ports und andere).

Legt für jedes easygames-Spiel ein Startskript an, trägt die Kategorie „easygames“ ein und schreibt die Spieleliste
(Name, Beschreibung, Titelbild). Beim Start öffnet das Skript das Spiel im Browser-Vollbild – online von der
easygames-Homepage oder offline aus einer lokalen Kopie des Repositories (kleiner lokaler Webserver, nur Python nötig).

Nur Python 3.8+ (Standardbibliothek), läuft unter Linux, Windows und macOS.

  python emulationstation.py install                 Spiele einrichten (Frontend wird erkannt)
  python emulationstation.py install --mode offline  Offline-Variante (braucht eine Kopie des Repositories)
  python emulationstation.py list                    Spiele anzeigen
  python emulationstation.py uninstall               alles Angelegte wieder entfernen

Mehr Optionen: python emulationstation.py install --help
Anleitung: https://ricorewioriginal-collab.github.io/easygames/einbinden.html#retro
"""
import argparse
import functools
import http.server
import json
import os
import platform
import re
import shutil
import socket
import struct
import subprocess
import sys
import threading
import urllib.request
import xml.etree.ElementTree as ET
import zlib

BASE_URL = 'https://ricorewioriginal-collab.github.io/easygames/'
DEFAULT_PORT = 18765  # fester Port im Offline-Modus: gleiche Adresse = gleiche Speicherstände im Browser-Profil
SYSTEM = 'easygames'
CFG_DIR = '.easygames'
HERE = os.path.dirname(os.path.abspath(__file__))
IS_WIN = platform.system() == 'Windows'


# ----------------------------------------------------------------------------------------------- JS-Literale lesen
class JsParser:
    """Liest einen JavaScript-Literal-Wert (Objekte, Listen, Texte, Zahlen) – genug für games.js und modes.js."""

    def __init__(self, text, pos=0):
        self.t, self.i = text, pos

    def ws(self):
        t = self.t
        while self.i < len(t):
            if t[self.i].isspace():
                self.i += 1
            elif t.startswith('//', self.i):
                j = t.find('\n', self.i)
                self.i = len(t) if j < 0 else j
            elif t.startswith('/*', self.i):
                j = t.find('*/', self.i)
                self.i = len(t) if j < 0 else j + 2
            else:
                break

    def string(self):
        q = self.t[self.i]
        self.i += 1
        out = []
        esc = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', '0': '\0'}
        while self.i < len(self.t):
            c = self.t[self.i]
            if c == q:
                self.i += 1
                return ''.join(out)
            if c == '\\':
                self.i += 1
                c = self.t[self.i]
                if c == 'u':
                    out.append(chr(int(self.t[self.i + 1:self.i + 5], 16)))
                    self.i += 4
                elif c == 'x':
                    out.append(chr(int(self.t[self.i + 1:self.i + 3], 16)))
                    self.i += 2
                elif c == '\n':
                    pass
                else:
                    out.append(esc.get(c, c))
            else:
                out.append(c)
            self.i += 1
        raise ValueError('Text nicht beendet')

    def key(self):
        self.ws()
        if self.t[self.i] in '\'"':
            return self.string()
        m = re.compile(r'[A-Za-z_$][\w$]*|\d+').match(self.t, self.i)
        if not m:
            raise ValueError('Schlüssel erwartet bei %d' % self.i)
        self.i = m.end()
        return m.group(0)

    def value(self):
        self.ws()
        c = self.t[self.i]
        if c in '\'"`':
            return self.string()
        if c == '[':
            self.i += 1
            arr = []
            while True:
                self.ws()
                if self.t[self.i] == ']':
                    self.i += 1
                    return arr
                arr.append(self.value())
                self.ws()
                if self.t[self.i] == ',':
                    self.i += 1
        if c == '{':
            self.i += 1
            obj = {}
            while True:
                self.ws()
                if self.t[self.i] == '}':
                    self.i += 1
                    return obj
                k = self.key()
                self.ws()
                if self.t[self.i] != ':':
                    raise ValueError('":" erwartet bei %d' % self.i)
                self.i += 1
                obj[k] = self.value()
                self.ws()
                if self.t[self.i] == ',':
                    self.i += 1
        m = re.compile(r'-?\d+(?:\.\d+)?|true|false|null').match(self.t, self.i)
        if not m:
            raise ValueError('Unbekannter Wert bei %d' % self.i)
        self.i = m.end()
        w = m.group(0)
        if w in ('true', 'false', 'null'):
            return {'true': True, 'false': False, 'null': None}[w]
        return float(w) if '.' in w else int(w)


def js_assignment(text, name):
    """Wert von `[const|var|let|window.]NAME = <Literal>` aus einem JS-Text."""
    m = re.search(r'(?:^|[\s;])(?:const\s+|let\s+|var\s+|window\.)?%s\s*=\s*(?=[\[{])' % re.escape(name), text)
    if not m:
        raise ValueError('%s nicht gefunden' % name)
    return JsParser(text, m.end()).value()


# ----------------------------------------------------------------------------------------------- Katalog laden
def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'easygames-emulationstation/1'})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def read_source(repo, base_url, name):
    p = os.path.join(repo, name) if repo else None
    if p and os.path.isfile(p):
        with open(p, encoding='utf-8') as f:
            return f.read()
    return fetch(base_url + name)


def load_catalog(repo, base_url):
    games = js_assignment(read_source(repo, base_url, 'games.js'), 'GAMES')
    try:
        modes = js_assignment(read_source(repo, base_url, 'modes.js'), 'EASYGAMES_MODES')
    except Exception:
        modes = {}
    out = []
    for g in games:
        if not g.get('id') or not g.get('path'):
            continue
        out.append({'id': g['id'], 'title': g.get('title') or g['id'], 'desc': g.get('desc', ''), 'path': g['path'],
                    'img': g.get('img', ''), 'bg': g.get('bg', ''), 'modes': sorted(k for k, v in (modes.get(g['id']) or {}).items() if v)})
    return out


# ----------------------------------------------------------------------------------------------- Titelbilder
def png_gradient(path, colors, w=320, h=240):
    """Einfaches Farbverlauf-Bild (reines Python), wenn ein Spiel kein PNG-Titelbild hat."""
    cols = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in colors] or [(24, 40, 80), (90, 60, 160)]
    if len(cols) == 1:
        cols.append(cols[0])
    rows = []
    for y in range(h):
        row = bytearray([0])
        for x in range(w):
            t = (x / w + y / h) / 2 * (len(cols) - 1)
            k = min(int(t), len(cols) - 2)
            f = t - k
            row.extend(int(cols[k][c] + (cols[k + 1][c] - cols[k][c]) * f) for c in range(3))
        rows.append(bytes(row))

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


def svg_to_png(src, dst):
    for cmd in (['rsvg-convert', '-w', '640', '-o', dst, src], ['inkscape', src, '--export-type=png', '-w', '640', '-o', dst], ['magick', src, dst], ['convert', src, dst]):
        if shutil.which(cmd[0]):
            try:
                if subprocess.call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0 and os.path.isfile(dst):
                    return True
            except OSError:
                pass
    return False


def make_cover(game, repo, base_url, dst, tmp):
    img = game['img']
    if img.lower().endswith(('.png', '.jpg', '.jpeg')):
        try:
            if repo and os.path.isfile(os.path.join(repo, img)):
                shutil.copyfile(os.path.join(repo, img), dst)
            else:
                with open(dst, 'wb') as f:
                    f.write(fetch(base_url + img, binary=True))
            return True
        except Exception:
            pass
    elif img.lower().endswith('.svg'):
        src = os.path.join(repo, img) if repo and os.path.isfile(os.path.join(repo, img)) else None
        try:
            if not src:
                src = os.path.join(tmp, game['id'] + '.svg')
                with open(src, 'wb') as f:
                    f.write(fetch(base_url + img, binary=True))
            if svg_to_png(src, dst):
                return True
        except Exception:
            pass
    png_gradient(dst, re.findall(r'#[0-9a-fA-F]{6}', game['bg']))
    return False


def copy_asset(repo, base_url, rel, dst):
    """Branding-Datei (z. B. branding/easygames-logo.png) aus dem Checkout oder von der Webseite holen; False, wenn nicht verfügbar."""
    try:
        if repo and os.path.isfile(os.path.join(repo, rel)):
            shutil.copyfile(os.path.join(repo, rel), dst)
        else:
            with open(dst, 'wb') as f:
                f.write(fetch(base_url + rel, binary=True))
        return True
    except Exception:
        if os.path.isfile(dst):
            os.remove(dst)
        return False


# ----------------------------------------------------------------------------------------------- Browser und Start
CHROMIUM_NAMES = ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome', 'microsoft-edge', 'microsoft-edge-stable', 'brave-browser', 'firefox']


def find_browser(pref=None):
    if pref:
        if pref.startswith('flatpak:'):
            return pref
        return shutil.which(pref) or (pref if os.path.isfile(pref) else None)
    for n in CHROMIUM_NAMES:
        p = shutil.which(n)
        if p:
            return p
    cands = []
    if IS_WIN:
        for env in ('ProgramFiles', 'ProgramFiles(x86)', 'LOCALAPPDATA'):
            b = os.environ.get(env)
            if b:
                cands += [os.path.join(b, 'Google', 'Chrome', 'Application', 'chrome.exe'), os.path.join(b, 'Microsoft', 'Edge', 'Application', 'msedge.exe')]
    elif platform.system() == 'Darwin':
        cands = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
                 '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
    return next((c for c in cands if os.path.isfile(c)), None) or flatpak_browser()   # Batocera: Chromium als Flatpak


def browser_command(browser, url, profile, kiosk=True):
    name = os.path.basename(browser).lower()
    if 'firefox' in name:
        return [browser, '--no-remote', '--profile', profile] + (['--kiosk'] if kiosk else []) + [url]
    if browser.startswith('flatpak:'):   # Flatpak darf das Profil (Speicherstände) und die Controller sehen
        prefix = ['flatpak', 'run', '--filesystem=' + profile, '--device=all', browser.split(':', 1)[1]]
    else:
        prefix = [browser]
    cmd = prefix + ['--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--noerrdialogs', '--disable-infobars',
           '--disable-session-crashed-bubble', '--autoplay-policy=no-user-gesture-required']
    if hasattr(os, 'geteuid') and os.geteuid() == 0:   # Batocera läuft als root: Chromium startet dort nur ohne Sandbox
        cmd += ['--no-sandbox', '--test-type']
    if not IS_WIN and platform.system() != 'Darwin':
        cmd.append('--ozone-platform-hint=auto')   # X11 und Wayland
    if kiosk:
        cmd.append('--kiosk')
    return cmd + ['--app=' + url]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{
        '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm',
        '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.css': 'text/css', '.html': 'text/html'})

    def log_message(self, *a):
        pass


def start_server(root, port=0):
    handler = functools.partial(QuietHandler, directory=root)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def start_update_in_background(base, cfg):
    """Sucht beim Spielstart nebenbei nach neuen Spielen (höchstens einmal pro Stunde, blockiert den Start nicht)."""
    st = _read_json(os.path.join(base, 'last-update.json'), {}) or {}
    import time
    if time.time() - float(st.get('t', 0)) < 3600:
        return
    try:
        kw = {'stdout': subprocess.DEVNULL, 'stderr': subprocess.DEVNULL, 'stdin': subprocess.DEVNULL}
        if IS_WIN:
            kw['creationflags'] = 0x00000008  # DETACHED_PROCESS
        else:
            kw['start_new_session'] = True
        subprocess.Popen([sys.executable, os.path.join(base, 'emulationstation.py'), 'update'], **kw)
    except OSError:
        pass


def cmd_launch(a):
    base = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base, 'config.json'), encoding='utf-8') as f:
        cfg = json.load(f)
    with open(os.path.join(base, 'catalog.json'), encoding='utf-8') as f:
        games = {g['id']: g for g in json.load(f)['games']}
    game = games.get(a.game)
    if not game:
        print('Unbekanntes Spiel: %s' % a.game, file=sys.stderr)
        return 2
    mode = a.mode or cfg.get('mode', 'online')
    browser = find_browser(a.browser or cfg.get('browser'))
    if not browser:
        print('Kein Browser gefunden. Chromium, Chrome, Edge oder Firefox installieren oder beim Einrichten --browser PFAD angeben.', file=sys.stderr)
        es_api('/notify', 'easygames: Kein Browser gefunden – bitte easygames neu einrichten.')
        return 3
    srv = None
    sync_thread = None
    try:
        if mode in ('offline', 'sync'):
            root = cfg.get('content') if mode == 'sync' else cfg.get('repo')
            port = int(cfg.get('port') or DEFAULT_PORT)
            status_file = os.path.join(base, STATUS_NAME)
            ready = bool(root) and os.path.isfile(os.path.join(root, game['path'], 'index.html'))
            if mode == 'offline' and not ready:
                print('Offline-Dateien nicht gefunden (%s). Repository-Ordner prüfen oder mit --mode online einrichten.' % root, file=sys.stderr)
                return 4
            vendor = (_read_json(os.path.join(os.path.dirname(root), 'sync-state.json'), {}) or {}).get('vendor') if mode == 'sync' else {}
            starter = (lambda r, p: start_sync_server(r, vendor, status_file, p)) if mode == 'sync' else start_server
            try:
                srv = starter(root, port)
            except OSError:
                srv = starter(root, 0)
                print('Port %d ist belegt – Speicherstände dieses Starts liegen unter einer anderen Adresse. Anderen Port mit --port wählen.' % port, file=sys.stderr)
            # „localhost“ (nicht 127.0.0.1): Firebase/Google-Anmeldung erlaubt localhost standardmäßig
            url = 'http://localhost:%d/%s' % (srv.server_address[1], game['path'])
            if mode == 'sync':
                if ready:
                    start_update_in_background(base, cfg)
                else:   # Spiel noch nicht auf dem Gerät: jetzt laden, die Ladeseite zeigt den Fortschritt
                    _write_json(status_file, {'phase': 'check', 'done': 0, 'total': 0})

                    def load():
                        try:
                            sync_content(root, cfg.get('base_url', BASE_URL), status_file)
                        except Exception as e:
                            _write_json(status_file, {'phase': 'error', 'error': str(e)})
                    sync_thread = threading.Thread(target=load, daemon=True)
                    sync_thread.start()
                    url = 'http://localhost:%d/__easygames/laden.html?ziel=/%s' % (srv.server_address[1], urllib.request.quote(game['path']))
        else:
            url = cfg.get('base_url', BASE_URL) + game['path']
        if (a.tv or cfg.get('tv')) and 'tvParam' in game.get('modes', []):
            url += ('&' if '?' in url else '?') + 'tv'
        profile = cfg.get('profile') or os.path.join(base, 'browser-profile')
        os.makedirs(profile, exist_ok=True)
        cmd = browser_command(browser, url, profile, kiosk=not (a.window or cfg.get('window')))
        if a.print:
            print(' '.join('"%s"' % c if ' ' in c else c for c in cmd))
            return 0
        proc = subprocess.Popen(cmd)
        stop = threading.Event()
        if platform.system() == 'Linux':
            def quit_game():
                if browser.startswith('flatpak:'):
                    subprocess.call(['flatpak', 'kill', browser.split(':', 1)[1]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                proc.terminate()
            threading.Thread(target=watch_exit_combo, args=(stop, quit_game), daemon=True).start()
        try:
            return proc.wait()
        finally:
            stop.set()
    finally:
        if srv:
            srv.shutdown()


# ----------------------------------------------------------------------------------------------- Selbst aktualisierende Offline-Kopie (Modus „sync“)
# Holt die Spiele wie die easygames-Apps über sync/manifest.json (Dateiliste mit SHA-256) und lädt nur Geändertes nach.
# Neue Spiele erscheinen dadurch automatisch, sobald das Gerät online ist; ohne Internet läuft alles aus der lokalen Kopie.
HASH_RE = re.compile(r'^[0-9a-f]{64}$')
STATUS_NAME = 'sync-status.json'


def safe_rel(p):
    """Relativer Pfad ohne '..', führendes '/' oder Sonderzeichen (wie Manifest.isSafePath der Apps)."""
    if not isinstance(p, str) or not p or len(p) > 1024 or p.startswith('/') or p.endswith('/'):
        return False
    if any(ord(c) < 0x20 or ord(c) == 0x7f or c in '\\?#' for c in p):
        return False
    return all(s not in ('', '.', '..') for s in p.split('/'))


def parse_manifest(text):
    m = json.loads(text)
    if m.get('schema') != 1 or not m.get('version') or not isinstance(m.get('files'), list):
        raise ValueError('Spieleliste vom Server ist ungültig')
    files = {}
    for f in m['files']:
        p, h, s = f.get('p'), str(f.get('h', '')).lower(), f.get('s')
        if not safe_rel(p) or not HASH_RE.match(h) or not isinstance(s, int) or s < 0 or p in files:
            raise ValueError('Ungültiger Eintrag in der Spieleliste: %r' % (p,))
        files[p] = {'h': h, 's': s}
    vendor = {k: v for k, v in (m.get('vendor') or {}).items() if isinstance(k, str) and v in files}
    return {'version': m['version'], 'files': files, 'vendor': vendor}


def online(base_url, timeout=5):
    try:
        req = urllib.request.Request(base_url + 'sync/version.json', headers={'User-Agent': 'easygames-emulationstation/1'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            r.read(1)
        return True
    except Exception:
        return False


def _write_json(path, data):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tmp, path)


def _read_json(path, default=None):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def _download(url, dst, want_hash, want_size):
    import hashlib
    tmp = dst + '.part'
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    h, n = hashlib.sha256(), 0
    req = urllib.request.Request(url, headers={'User-Agent': 'easygames-emulationstation/1'})
    with urllib.request.urlopen(req, timeout=60) as r, open(tmp, 'wb') as f:
        while True:
            b = r.read(65536)
            if not b:
                break
            h.update(b)
            n += len(b)
            f.write(b)
    if n != want_size or h.hexdigest() != want_hash:
        os.remove(tmp)
        raise IOError('Prüfsumme stimmt nicht: %s' % url)
    os.replace(tmp, dst)


def game_ids(catalog):
    return [g.get('id') for g in (catalog or {}).get('games', []) if g.get('id')]


def sync_content(content, base_url, status_file=None, log=None):
    """Bringt die Offline-Kopie in `content` auf den Stand des Servers. Rückgabe: {'online', 'changed', 'new', 'version'}.
    Abgebrochene oder fehlerhafte Downloads ändern nichts (Prüfsumme, erst danach ersetzen)."""
    state_dir = os.path.dirname(os.path.abspath(content))
    state_file = os.path.join(state_dir, 'sync-state.json')
    state = _read_json(state_file, {}) or {}
    have = state.get('files') or {}
    old_ids = game_ids(_read_json(os.path.join(content, 'sync', 'catalog.json')))

    def status(**kw):
        if status_file:
            try:
                _write_json(status_file, kw)
            except OSError:
                pass

    status(phase='check', done=0, total=0)
    try:
        req = urllib.request.Request(base_url + 'sync/manifest.json', headers={'User-Agent': 'easygames-emulationstation/1', 'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(req, timeout=30) as r:
            text = r.read().decode('utf-8')
    except Exception as e:
        status(phase='offline', done=0, total=0, error=str(e))
        return {'online': False, 'changed': 0, 'new': [], 'version': state.get('version')}
    man = parse_manifest(text)
    todo = [p for p, f in man['files'].items() if have.get(p) != f['h'] or not os.path.isfile(os.path.join(content, p))]
    total = sum(man['files'][p]['s'] for p in todo)
    done = [0]
    lock = threading.Lock()
    errors = []

    def one(p):
        f = man['files'][p]
        try:
            _download(base_url + p, os.path.join(content, *p.split('/')), f['h'], f['s'])
            with lock:
                have[p] = f['h']
                done[0] += f['s']
                status(phase='load', done=done[0], total=total)
        except Exception as e:
            with lock:
                errors.append('%s: %s' % (p, e))

    if todo:
        if log:
            log('Lade %d Dateien (%.1f MB) …' % (len(todo), total / 1e6))
        status(phase='load', done=0, total=total)
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(4) as ex:
            list(ex.map(one, todo))
    # Dateien, die es nicht mehr gibt, entfernen (nur was die Synchronisation selbst angelegt hat)
    for p in [p for p in have if p not in man['files']]:
        try:
            os.remove(os.path.join(content, *p.split('/')))
        except OSError:
            pass
        have.pop(p, None)
    state.update(files=have, version=man['version'] if not errors else state.get('version'), vendor=man['vendor'])
    _write_json(state_file, state)
    if errors:
        status(phase='error', done=done[0], total=total, error=errors[0])
        raise IOError('%d Dateien konnten nicht geladen werden, z. B. %s' % (len(errors), errors[0]))
    new_ids = game_ids(_read_json(os.path.join(content, 'sync', 'catalog.json')))
    status(phase='done', done=total, total=total)
    return {'online': True, 'changed': len(todo), 'new': [i for i in new_ids if old_ids and i not in old_ids], 'version': man['version']}


def load_sync_catalog(content):
    """Spiele aus der Offline-Kopie (sync/catalog.json) im Format von load_catalog()."""
    cat = _read_json(os.path.join(content, 'sync', 'catalog.json'))
    if not cat:
        raise ValueError('Keine Spieleliste in %s – bitte einmal mit dem Internet verbinden.' % content)
    out = []
    for g in cat.get('games', []):
        if not g.get('id') or not g.get('path'):
            continue
        modes = g.get('modes') or {}
        out.append({'id': g['id'], 'title': g.get('title') or g['id'], 'desc': g.get('desc', ''), 'path': g['path'],
                    'img': g.get('img', ''), 'bg': g.get('bg', ''), 'modes': sorted(k for k, v in modes.items() if v)})
    return out


HOME_ENTRY = {'id': 'easygames-start', 'title': 'easygames – Startseite & Online', 'path': '', 'img': 'branding/easygames-icon-512.png',
              'bg': '#1a1f4a #6b3fd6', 'modes': [],
              'desc': 'Die easygames-Startseite mit allen Spielen, Konto, Ranglisten und Online-Modus. Mitspieler treten per Link oder Code von überall bei.'}

# Seite, die beim Start eines noch nicht geladenen Spiels den Fortschritt zeigt und danach ins Spiel wechselt
LOADING_PAGE = '''<!doctype html><html lang="de"><meta charset="utf-8"><title>easygames</title>
<style>body{margin:0;height:100vh;display:grid;place-items:center;background:#0b0f2a;color:#fff;font:20px system-ui,sans-serif;text-align:center}
.bar{width:60vw;height:14px;border-radius:7px;background:#ffffff22;overflow:hidden;margin:24px auto}.bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6b3fd6,#ff3d7f);transition:width .3s}
small{color:#9aa0c8}</style>
<div><h1>easygames</h1><p id="t">Spiel wird geladen …</p><div class="bar"><i id="b"></i></div><small id="s"></small></div>
<script>
var ziel = new URLSearchParams(location.search).get('ziel') || '/';
function tick() {
  fetch('/__easygames/status', {cache: 'no-store'}).then(function (r) { return r.json(); }).then(function (s) {
    var t = document.getElementById('t'), b = document.getElementById('b'), x = document.getElementById('s');
    if (s.ready) { location.replace(ziel); return; }
    if (s.phase === 'offline') { t.textContent = 'Dieses Spiel ist noch nicht auf dem Gerät.'; x.textContent = 'Bitte einmal mit dem Internet verbinden – danach läuft es auch offline. Zurück: Select + Start.'; return; }
    if (s.phase === 'error') { t.textContent = 'Laden fehlgeschlagen.'; x.textContent = s.error || ''; return; }
    var p = s.total ? Math.round(s.done / s.total * 100) : 0;
    b.style.width = p + '%'; t.textContent = s.total ? 'Neue Spiele werden geladen … ' + p + ' %' : 'Suche nach neuen Spielen …';
    x.textContent = s.total ? (s.done / 1e6).toFixed(1) + ' von ' + (s.total / 1e6).toFixed(1) + ' MB' : '';
    setTimeout(tick, 500);
  }).catch(function () { setTimeout(tick, 1000); });
}
tick();
</script></html>'''

SW_GUARD = (b'<script>if(navigator.serviceWorker){navigator.serviceWorker.register=function(){return Promise.reject(new Error('
            b'"Offline-Dateien verwaltet easygames"))};navigator.serviceWorker.getRegistrations&&navigator.serviceWorker.getRegistrations()'
            b'.then(function(r){r.forEach(function(x){x.unregister()})})}</script>'
            # jeder Controller im Standard-Layout (auch Spiele mit eigener Controller-Steuerung), siehe gamepad.js
            b'<script>window.EASYGAMES_PAD_NORMAL_ONLY=1</script><script src="/gamepad.js"></script>')


def vendor_rules(vendor):
    """CDN-Adressen -> lokale Pfade (längste zuerst); ganze Ordner, wenn alle Dateien eines CDN-Ordners im selben lokalen Ordner liegen."""
    rules = {}
    dirs = {}
    for url, path in vendor.items():
        bare = url.split('?')[0].split('#')[0]
        rules[url] = '/' + path
        if bare != url:
            rules[bare] = '/' + path
        import posixpath
        d, ld = posixpath.dirname(bare) + '/', posixpath.dirname('/' + path).rstrip('/') + '/'
        dirs.setdefault(d, set()).add(ld if posixpath.basename(bare) == posixpath.basename(path) else None)
    for d, targets in dirs.items():
        if len(targets) == 1 and None not in targets:
            rules[d] = next(iter(targets))
    return sorted(((k.encode(), v.encode()) for k, v in rules.items()), key=lambda kv: -len(kv[0]))


class SyncHandler(QuietHandler):
    """Liefert die Offline-Kopie aus: CDN-Adressen zeigen auf die lokale Kopie, Service-Worker der Webversion bleiben aus."""
    rules = []
    status_file = None

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def _send(self, body, ctype, code=200):
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        if path == '/__easygames/laden.html':
            return self._send(LOADING_PAGE.encode(), 'text/html; charset=utf-8')
        if path == '/__easygames/status':
            s = _read_json(self.status_file, {}) if self.status_file else {}
            s['ready'] = s.get('phase') == 'done'
            return self._send(json.dumps(s).encode(), 'application/json')
        local = self.translate_path(self.path)
        if os.path.isdir(local):
            if not path.endswith('/'):
                return super().do_GET()
            local = os.path.join(local, 'index.html')
        if local.endswith(('.html', '.js', '.mjs')) and os.path.isfile(local):
            with open(local, 'rb') as f:
                body = f.read()
            for k, v in self.rules:
                if k in body:
                    body = body.replace(k, v)
            if local.endswith('.html'):
                i = body.lower().find(b'<head>')
                body = body[:i + 6] + SW_GUARD + body[i + 6:] if i >= 0 else SW_GUARD + body
            return self._send(body, 'text/html; charset=utf-8' if local.endswith('.html') else 'text/javascript; charset=utf-8')
        return super().do_GET()

    do_HEAD = do_GET


def start_sync_server(content, vendor, status_file, port):
    handler_cls = type('H', (SyncHandler,), {'rules': vendor_rules(vendor or {}), 'status_file': status_file})
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(handler_cls, directory=content))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


# ----------------------------------------------------------------------------------------------- Controller: Select + Start beendet das Spiel
BTN_SELECT, BTN_START, BTN_MODE = 314, 315, 316


def watch_exit_combo(stop, on_combo, devdir='/dev/input'):
    """Liest Gamepads direkt aus /dev/input (nur Linux, ohne Zusatzpakete). Select+Start oder Hotkey(Mode)+Start ruft on_combo()."""
    import select
    fmt = 'llHHi'
    size = struct.calcsize(fmt)
    fds = []
    try:
        names = sorted(n for n in os.listdir(devdir) if n.startswith('event'))
    except OSError:
        return
    for n in names:
        try:
            fds.append(os.open(os.path.join(devdir, n), os.O_RDONLY | os.O_NONBLOCK))
        except OSError:
            pass
    down = {fd: set() for fd in fds}
    try:
        while fds and not stop.is_set():
            r, _, _ = select.select(fds, [], [], 0.5)
            for fd in r:
                try:
                    data = os.read(fd, size * 32)
                except OSError:
                    fds.remove(fd)
                    continue
                for i in range(0, len(data) - size + 1, size):
                    _, _, typ, code, val = struct.unpack(fmt, data[i:i + size])
                    if typ != 1 or code not in (BTN_SELECT, BTN_START, BTN_MODE):
                        continue
                    (down[fd].add if val else down[fd].discard)(code)
                    if BTN_START in down[fd] and (BTN_SELECT in down[fd] or BTN_MODE in down[fd]):
                        down[fd].clear()
                        on_combo()
    finally:
        for fd in list(down):
            try:
                os.close(fd)
            except OSError:
                pass


# ----------------------------------------------------------------------------------------------- Batocera
def userdata():
    return os.environ.get('EASYGAMES_USERDATA', '/userdata')


def batocera_paths():
    u = userdata()
    return {'roms': os.path.join(u, 'roms'), 'system_cfg': os.path.join(u, 'system', 'configs', 'emulationstation', 'es_systems_easygames.cfg'),
            'content': os.path.join(u, 'system', 'easygames', 'content'), 'custom_sh': os.path.join(u, 'system', 'custom.sh')}


HOOK_BEGIN, HOOK_END = '# easygames-begin (nicht von Hand ändern)', '# easygames-end'


def set_boot_hook(custom_sh, script):
    """Trägt in Batoceras custom.sh ein: beim Start im Hintergrund nach neuen Spielen suchen (wartet aufs Netz)."""
    block = '%s\nif [ "$1" = start ]; then (python3 "%s" update --wait-net 600 >/dev/null 2>&1 &); fi\n%s\n' % (HOOK_BEGIN, script, HOOK_END)
    remove_boot_hook(custom_sh)
    old = ''
    if os.path.isfile(custom_sh):
        with open(custom_sh, encoding='utf-8') as f:
            old = f.read()
    if not old.startswith('#!'):
        old = '#!/bin/bash\n' + old
    with open(custom_sh, 'w', encoding='utf-8', newline='\n') as f:
        f.write(old.rstrip('\n') + '\n' + block)
    os.chmod(custom_sh, 0o755)


def remove_boot_hook(custom_sh):
    if not os.path.isfile(custom_sh):
        return
    with open(custom_sh, encoding='utf-8') as f:
        text = f.read()
    new = re.sub(r'\n?%s\n.*?%s\n?' % (re.escape(HOOK_BEGIN), re.escape(HOOK_END)), '\n', text, flags=re.S)
    if new != text:
        with open(custom_sh, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new.rstrip('\n') + '\n')


def es_api(path, body=None):
    """EmulationStation-Webschnittstelle von Batocera (Port 1234): Spieleliste neu laden, Hinweis anzeigen."""
    try:
        req = urllib.request.Request('http://127.0.0.1:1234' + path, data=body.encode() if body is not None else None)
        with urllib.request.urlopen(req, timeout=5) as r:
            r.read()
        return True
    except Exception:
        return False


FLATPAK_CHROMIUM = 'org.chromium.Chromium'


def flatpak_browser():
    if shutil.which('flatpak'):
        try:
            if subprocess.call(['flatpak', 'info', FLATPAK_CHROMIUM], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0:
                return 'flatpak:' + FLATPAK_CHROMIUM
        except OSError:
            pass
    return None


# ----------------------------------------------------------------------------------------------- Einrichten
def safe_name(title):
    n = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', title).strip().rstrip('.')
    return re.sub(r'\s+', ' ', n)[:80] or 'Spiel'


def indent(el, level=0):
    pad = '\n' + level * '  '
    if len(el):
        if not (el.text or '').strip():
            el.text = pad + '  '
        for c in el:
            indent(c, level + 1)
            if not (c.tail or '').strip():
                c.tail = pad + '  '
        if not (el[-1].tail or '').strip():
            el[-1].tail = pad
    elif level and not (el.tail or '').strip():
        el.tail = pad


def write_xml(root, path):
    indent(root)
    ET.ElementTree(root).write(path, encoding='utf-8', xml_declaration=True)


def detect_frontend():
    home = os.path.expanduser('~')
    if os.path.isdir(os.path.join(home, 'ES-DE')):
        return 'es-de', None
    if os.path.isdir(os.path.join(home, 'RetroPie', 'roms')):
        return 'retropie', os.path.join(home, 'RetroPie', 'roms')
    u = userdata()
    if os.path.isdir(os.path.join(u, 'roms')):   # Batocera: eigenes System „easygames“ (älteres Batocera ohne /userdata/system: Ports)
        return ('batocera' if os.path.isdir(os.path.join(u, 'system')) else 'ports'), os.path.join(u, 'roms')
    return None, None


def esde_dir(a):
    return a.esde_dir or os.path.join(os.path.expanduser('~'), 'ES-DE')


def esde_roms(a):
    f = os.path.join(esde_dir(a), 'settings', 'es_settings.xml')
    try:
        for e in ET.parse(f).getroot().iter('string'):
            if e.get('name') == 'ROMDirectory' and e.get('value'):
                return e.get('value').replace('%ESPATH%', esde_dir(a))
    except Exception:
        pass
    return os.path.join(esde_dir(a), 'ROMs')


def register_system(path, system):
    """Trägt/ersetzt das System in einer es_systems-Datei (andere Systeme bleiben erhalten)."""
    if os.path.isfile(path):
        root = ET.parse(path).getroot()
    else:
        root = ET.Element('systemList')
        os.makedirs(os.path.dirname(path), exist_ok=True)
    for s in list(root.findall('system')):
        if (s.findtext('name') or '') == SYSTEM:
            root.remove(s)
    root.append(system)
    write_xml(root, path)


def unregister_system(path):
    if not os.path.isfile(path):
        return
    root = ET.parse(path).getroot()
    for s in list(root.findall('system')):
        if (s.findtext('name') or '') == SYSTEM:
            root.remove(s)
    if len(root):
        write_xml(root, path)
    else:
        os.remove(path)


def system_element(rom_dir, batocera=False):
    s = ET.Element('system')
    ext = '.bat .BAT' if IS_WIN else '.sh .SH'
    tags = (('name', SYSTEM), ('fullname', 'RicoReWi easygames'), ('path', rom_dir), ('extension', ext),
            ('command', '%ROM%' if IS_WIN else 'bash %ROM%'), ('platform', 'pc'), ('theme', SYSTEM if batocera else 'pc'))
    if batocera:
        tags = tags[:2] + (('manufacturer', 'RicoReWi'), ('release', '2024'), ('hardware', 'game engine')) + tags[2:]
    for tag, val in tags:
        ET.SubElement(s, tag).text = val
    return s


OUR_TAGS = {'path', 'name', 'desc', 'image', 'marquee', 'developer', 'publisher', 'genre'}


def keep_es_fields(old_gamelist, gl):
    """Was EmulationStation selbst einträgt (Favorit, Spielzeit, zuletzt gespielt, Bewertung …), bleibt beim Neuschreiben erhalten."""
    try:
        old = {e.findtext('path'): e for e in ET.parse(old_gamelist).getroot().findall('game')}
    except Exception:
        return
    for e in gl.findall('game'):
        o = old.get(e.findtext('path'))
        if o is not None:
            for c in o:
                if c.tag not in OUR_TAGS:
                    e.append(c)


def cmd_install(a):
    fe, roms_guess = (a.frontend, None) if a.frontend else detect_frontend()
    if not fe:
        print('Frontend nicht erkannt. Mit --frontend es-de|retropie|ports und --roms ORDNER angeben.', file=sys.stderr)
        return 2
    roms = a.roms or roms_guess or (batocera_paths()['roms'] if fe == 'batocera' else esde_roms(a) if fe == 'es-de' else os.path.join(os.path.expanduser('~'), 'RetroPie', 'roms'))
    repo = os.path.abspath(a.repo) if a.repo else (os.path.dirname(HERE) if os.path.isfile(os.path.join(os.path.dirname(HERE), 'games.js')) else None)
    mode = a.mode or ('sync' if fe == 'batocera' else 'online')
    if mode == 'offline' and not (repo and os.path.isfile(os.path.join(repo, 'games.js'))):
        print('Offline-Modus braucht eine Kopie des Repositories:\n  git clone --depth 1 https://github.com/ricorewioriginal-collab/easygames\n'
              'dann mit --repo ORDNER (oder das Skript aus dessen tools-Ordner) starten.', file=sys.stderr)
        return 2
    base_url = a.base_url if a.base_url.endswith('/') else a.base_url + '/'
    browser = find_browser(a.browser)
    if a.browser and not browser:
        print('Browser nicht gefunden: %s' % a.browser, file=sys.stderr)
        return 2
    if not browser and fe == 'batocera' and not a.dry_run and not a.no_browser_install and shutil.which('flatpak'):
        print('Installiere den Browser Chromium (Flatpak, einmalig, braucht Internet) …')
        subprocess.call(['flatpak', 'install', '-y', '--noninteractive', 'flathub', FLATPAK_CHROMIUM])
        browser = flatpak_browser()
    if not browser:
        print('Hinweis: Es wurde noch kein Browser gefunden (Chromium, Chrome, Edge, Firefox). Bitte installieren oder --browser PFAD angeben.')
    sysname = 'ports' if fe == 'ports' else SYSTEM
    rom_dir = os.path.join(roms, sysname, SYSTEM) if fe == 'ports' else os.path.join(roms, SYSTEM)
    content = None
    if mode == 'sync':
        content = os.path.abspath(a.content) if a.content else (batocera_paths()['content'] if fe == 'batocera' else os.path.join(rom_dir, CFG_DIR, 'content'))
        if not a.dry_run and not a.skip_sync:
            print('Lade die Spiele für den Offline-Betrieb (nur Geändertes) …')
            os.makedirs(content, exist_ok=True)
            r = sync_content(content, base_url, log=print)
            if not r['online'] and not os.path.isfile(os.path.join(content, 'sync', 'catalog.json')):
                print('Keine Verbindung zu %s – für die erste Einrichtung wird Internet gebraucht.' % base_url, file=sys.stderr)
                return 2
        games = [dict(HOME_ENTRY)] + load_sync_catalog(content) if not a.dry_run or os.path.isfile(os.path.join(content, 'sync', 'catalog.json')) else load_catalog(repo, base_url)
        repo = content   # Titelbilder aus der Offline-Kopie
    else:
        games = load_catalog(repo, base_url)
    if a.only:
        wanted = set(a.only.split(','))
        games = [g for g in games if g['id'] in wanted]
    if a.exclude:
        skip = set(a.exclude.split(','))
        games = [g for g in games if g['id'] not in skip]
    if not games:
        print('Keine Spiele ausgewählt.', file=sys.stderr)
        return 2

    cfg_dir = os.path.join(rom_dir, CFG_DIR)
    img_dir = os.path.join(rom_dir, 'images')
    plan = '%d Spiele -> %s (%s, %s)' % (len(games), rom_dir, fe, mode)
    if a.dry_run:
        print('Testlauf: ' + plan)
        return 0
    for d in (rom_dir, cfg_dir, img_dir):
        os.makedirs(d, exist_ok=True)
    if os.path.abspath(__file__) != os.path.abspath(os.path.join(cfg_dir, 'emulationstation.py')):
        shutil.copyfile(os.path.abspath(__file__), os.path.join(cfg_dir, 'emulationstation.py'))
    old_created = (_read_json(os.path.join(cfg_dir, 'manifest.json'), {}) or {}).get('files', [])
    with open(os.path.join(cfg_dir, 'catalog.json'), 'w', encoding='utf-8') as f:
        json.dump({'games': games}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(cfg_dir, 'config.json'), 'w', encoding='utf-8') as f:
        args = ['--frontend', fe, '--roms', roms, '--mode', mode, '--base-url', base_url, '--port', str(a.port)]
        for flag, val in (('--only', a.only), ('--exclude', a.exclude), ('--content', content), ('--browser', a.browser), ('--esde-dir', a.esde_dir)):
            if val:
                args += [flag, val]
        args += [f for f, on in (('--tv', a.tv), ('--window', a.window), ('--no-images', a.no_images), ('--no-system', a.no_system)) if on]
        profile = os.path.join(userdata(), 'saves', SYSTEM, 'browser') if fe == 'batocera' else None
        json.dump({'mode': mode, 'repo': None if mode == 'sync' else repo, 'content': content, 'base_url': base_url,
                   'browser': browser if (a.browser or (browser or '').startswith('flatpak:')) else None, 'tv': a.tv, 'window': a.window,
                   'port': a.port, 'profile': profile, 'install_args': args}, f, indent=1)

    created = []
    gl = ET.Element('gameList')
    tmp = os.path.join(cfg_dir, 'tmp')
    os.makedirs(tmp, exist_ok=True)
    esde_cov = os.path.join(esde_dir(a), 'downloaded_media', SYSTEM, 'covers') if fe == 'es-de' else None
    esde_mar = os.path.join(esde_dir(a), 'downloaded_media', SYSTEM, 'marquees') if fe == 'es-de' else None
    if esde_cov:
        os.makedirs(esde_cov, exist_ok=True)
        os.makedirs(esde_mar, exist_ok=True)
    # Logo „easygames by RicoReWi × AnMaCha“ als Marquee jedes Spiels (ES-DE: downloaded_media/…/marquees, sonst <marquee> in der gamelist.xml)
    logo = os.path.join(img_dir, 'easygames-logo.png')
    has_logo = not a.no_images and copy_asset(repo, base_url, 'branding/easygames-logo.png', logo)
    if has_logo:
        created.append(logo)
    script = os.path.join(cfg_dir, 'emulationstation.py')
    for g in games:
        stem = safe_name(g['title'])
        launcher = os.path.join(rom_dir, stem + ('.bat' if IS_WIN else '.sh'))
        if IS_WIN:
            body = '@echo off\r\n"%s" "%s" launch %s\r\n' % (sys.executable, script, g['id'])
        else:
            body = '#!/bin/sh\nexec "%s" "%s" launch %s\n' % (sys.executable, script, g['id'])
        with open(launcher, 'w', encoding='utf-8', newline='') as f:
            f.write(body)
        if not IS_WIN:
            os.chmod(launcher, 0o755)
        created.append(launcher)
        cover = os.path.join(img_dir, g['id'] + '.png')
        if not a.no_images:
            make_cover(g, repo, base_url, cover, tmp)
            created.append(cover)
            if esde_cov:
                dst = os.path.join(esde_cov, stem + '.png')
                shutil.copyfile(cover, dst)
                created.append(dst)
        e = ET.SubElement(gl, 'game')
        ET.SubElement(e, 'path').text = './' + os.path.basename(launcher)
        ET.SubElement(e, 'name').text = g['title']
        desc = g['desc']
        if 'pad' in g['modes']:
            desc += '\n\nMehrspieler: Handys koppeln sich per QR-Code als Controller.'
        ET.SubElement(e, 'desc').text = desc
        if not a.no_images:
            ET.SubElement(e, 'image').text = './images/%s.png' % g['id']
        if has_logo:
            ET.SubElement(e, 'marquee').text = './images/easygames-logo.png'
            if esde_mar:
                dst = os.path.join(esde_mar, stem + '.png')
                shutil.copyfile(logo, dst)
                created.append(dst)
        ET.SubElement(e, 'developer').text = 'RicoReWi'
        ET.SubElement(e, 'publisher').text = 'easygames'
        ET.SubElement(e, 'genre').text = 'Browser-Spiel'
    shutil.rmtree(tmp, ignore_errors=True)
    glist = os.path.join(rom_dir, 'gamelist.xml')
    keep_es_fields(glist, gl)
    write_xml(gl, glist)
    created.append(glist)
    if fe == 'es-de':
        dst = os.path.join(esde_dir(a), 'gamelists', SYSTEM, 'gamelist.xml')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(glist, dst)
        created.append(dst)
        sysfile = os.path.join(esde_dir(a), 'custom_systems', 'es_systems.xml')
    elif fe == 'retropie':
        sysfile = os.path.join(os.path.expanduser('~'), '.emulationstation', 'es_systems.cfg')
    elif fe == 'batocera':
        sysfile = batocera_paths()['system_cfg']
    else:
        sysfile = None
    if sysfile and not a.no_system:
        register_system(sysfile, system_element(rom_dir, batocera=fe == 'batocera'))
    # Spiele, die es nicht mehr gibt: alte Startskripte und Bilder wegräumen
    keep = set(created)
    for p in old_created:
        if p not in keep and os.path.isfile(p) and os.path.abspath(p).startswith(os.path.abspath(rom_dir) + os.sep):
            os.remove(p)
    hook = None
    if fe == 'batocera' and mode == 'sync':
        hook = batocera_paths()['custom_sh']
        set_boot_hook(hook, os.path.join(cfg_dir, 'emulationstation.py'))
    manifest = {'files': created, 'system_file': sysfile if sysfile and not a.no_system else None, 'rom_dir': rom_dir, 'cfg_dir': cfg_dir,
                'boot_hook': hook, 'content': content}
    with open(os.path.join(cfg_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1)
    print('Fertig: ' + plan)
    if fe == 'batocera':
        es_api('/reloadgames')
        print('Das System „RicoReWi easygames“ erscheint in EmulationStation (sonst Spieleliste neu laden). Beenden im Spiel: Select + Start.')
        if mode == 'sync':
            print('Neue Spiele und Updates werden bei jeder Internetverbindung automatisch geladen.')
    elif fe == 'ports':
        print('Die Spiele erscheinen im System „Ports“ (Spieleliste neu laden).')
    else:
        print('EmulationStation neu starten – die Kategorie „RicoReWi easygames“ erscheint in der Systemliste.')
    return 0


def cmd_update(a):
    """Holt neue Spiele und Updates (Modus sync) und schreibt Startskripte und Spieleliste neu, wenn sich der Katalog geändert hat.
    Läuft beim Systemstart (Batocera custom.sh) und nebenbei beim Spielstart; ohne Internet passiert nichts."""
    import time
    base = os.path.dirname(os.path.abspath(__file__))
    cfg = _read_json(os.path.join(base, 'config.json'))
    if not cfg:
        print('Keine Einrichtung gefunden – zuerst „install“ ausführen.', file=sys.stderr)
        return 2
    base_url = cfg.get('base_url', BASE_URL)
    if cfg.get('mode') != 'sync':
        print('Automatische Updates gibt es im Modus „sync“. Für neue Spiele „install“ erneut ausführen.')
        return 0
    lock = os.path.join(base, 'update.lock')
    try:
        if os.path.isfile(lock) and time.time() - os.path.getmtime(lock) > 3600:
            os.remove(lock)   # liegengebliebene Sperre (Absturz, Stromausfall)
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(fd)
    except FileExistsError:
        print('Es läuft schon eine Aktualisierung.')
        return 0
    try:
        end = time.time() + max(0, a.wait_net)
        while not online(base_url) and time.time() < end:
            time.sleep(15)
        if not online(base_url):
            print('Offline – die vorhandenen Spiele bleiben spielbar.')
            return 0
        # Das Skript selbst aktuell halten (nur wenn die neue Fassung fehlerfrei übersetzt)
        me = os.path.join(base, 'emulationstation.py')
        try:
            fresh = fetch(base_url + 'tools/emulationstation.py', binary=True)
            compile(fresh, 'emulationstation.py', 'exec')
            with open(me, 'rb') as f:
                same = f.read() == fresh
            if not same:
                with open(me + '.tmp', 'wb') as f:
                    f.write(fresh)
                os.replace(me + '.tmp', me)
        except Exception:
            pass
        before = [g['id'] for g in (_read_json(os.path.join(base, 'catalog.json'), {}) or {}).get('games', [])]
        r = sync_content(cfg['content'], base_url, os.path.join(base, STATUS_NAME), log=print)
        _write_json(os.path.join(base, 'last-update.json'), {'t': time.time(), 'version': r.get('version')})
        after = ['easygames-start'] + [g['id'] for g in load_sync_catalog(cfg['content'])]
        if r['changed'] or before != after:
            subprocess.call([sys.executable, me, 'install', '--skip-sync', '--no-browser-install'] + list(cfg.get('install_args') or []),
                            stdout=subprocess.DEVNULL)
            es_api('/reloadgames')
        if r['new']:
            titles = {g['id']: g['title'] for g in load_sync_catalog(cfg['content'])}
            msg = 'Neu bei easygames: ' + ', '.join(titles.get(i, i) for i in r['new'][:3]) + (' und weitere' if len(r['new']) > 3 else '')
            es_api('/notify', msg)
            print(msg)
        print('Aktuell (%d Dateien geladen).' % r['changed'])
        return 0
    finally:
        try:
            os.remove(lock)
        except OSError:
            pass


def cmd_uninstall(a):
    fe, roms_guess = (a.frontend, None) if a.frontend else detect_frontend()
    roms = a.roms or roms_guess or (batocera_paths()['roms'] if fe == 'batocera' else esde_roms(a) if fe == 'es-de' else os.path.join(os.path.expanduser('~'), 'RetroPie', 'roms'))
    rom_dir = os.path.join(roms, 'ports', SYSTEM) if fe == 'ports' else os.path.join(roms, SYSTEM)
    mf = os.path.join(rom_dir, CFG_DIR, 'manifest.json')
    if not os.path.isfile(mf):
        print('Nichts zu entfernen (keine Einrichtung unter %s gefunden).' % rom_dir)
        return 0
    with open(mf, encoding='utf-8') as f:
        m = json.load(f)
    for p in m['files']:
        if os.path.isfile(p):
            os.remove(p)
    if m.get('system_file'):
        unregister_system(m['system_file'])
    if m.get('boot_hook'):
        remove_boot_hook(m['boot_hook'])
    if m.get('content') and os.path.isdir(m['content']) and os.path.isfile(os.path.join(os.path.dirname(m['content']), 'sync-state.json')):
        shutil.rmtree(os.path.dirname(m['content']) if os.path.basename(os.path.dirname(m['content'])) == SYSTEM else m['content'], ignore_errors=True)
    shutil.rmtree(os.path.join(rom_dir, CFG_DIR), ignore_errors=True)
    for d in (os.path.join(rom_dir, 'images'), rom_dir):
        try:
            os.rmdir(d)
        except OSError:
            pass
    print('Entfernt: %s' % rom_dir)
    return 0


def cmd_list(a):
    repo = os.path.abspath(a.repo) if a.repo else (os.path.dirname(HERE) if os.path.isfile(os.path.join(os.path.dirname(HERE), 'games.js')) else None)
    for g in load_catalog(repo, a.base_url if a.base_url.endswith('/') else a.base_url + '/'):
        print('%-26s %s%s' % (g['id'], g['title'], '  [Handy-Controller]' if 'pad' in g['modes'] else ''))
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(description='easygames in EmulationStation einrichten')
    sub = p.add_subparsers(dest='cmd', required=True)

    def common(sp):
        sp.add_argument('--frontend', choices=['es-de', 'retropie', 'ports', 'batocera'], help='es-de, retropie, batocera (eigenes System) oder ports (RetroPie-/Batocera-Ports); Standard: automatisch')
        sp.add_argument('--roms', help='ROM-Ordner des Frontends (Standard: automatisch)')
        sp.add_argument('--esde-dir', help='ES-DE-Datenordner (Standard: ~/ES-DE)')
        sp.add_argument('--repo', help='Ordner mit einer Kopie des easygames-Repositories (für den Offline-Modus)')
        sp.add_argument('--base-url', default=BASE_URL, help='Adresse der easygames-Homepage')

    i = sub.add_parser('install', help='Spiele einrichten')
    common(i)
    i.add_argument('--mode', choices=['online', 'offline', 'sync'], help='online = von der Homepage, offline = aus Kopie des Repositories, '
                   'sync = eigene Offline-Kopie, lädt neue Spiele und Updates bei Internet automatisch (Standard auf Batocera, sonst online)')
    i.add_argument('--content', help='Ordner der Offline-Kopie im Modus sync (Standard: Batocera /userdata/system/easygames/content)')
    i.add_argument('--skip-sync', action='store_true', help='(intern) Offline-Kopie nicht neu abgleichen')
    i.add_argument('--no-browser-install', action='store_true', help='Batocera: Chromium nicht automatisch installieren')
    i.add_argument('--browser', help='Browser (Name oder Pfad), Standard: automatisch')
    i.add_argument('--only', help='nur diese Spiele (IDs, mit Komma)')
    i.add_argument('--exclude', help='diese Spiele auslassen (IDs, mit Komma)')
    i.add_argument('--tv', action='store_true', help='Spiele mit TV-Modus öffnen direkt die Lobby mit QR-Code (?tv)')
    i.add_argument('--window', action='store_true', help='Fenster statt Vollbild')
    i.add_argument('--port', type=int, default=DEFAULT_PORT, help='Port des lokalen Webservers im Offline-Modus (Standard %d, fest, damit Speicherstände erhalten bleiben)' % DEFAULT_PORT)
    i.add_argument('--no-images', action='store_true', help='keine Titelbilder anlegen')
    i.add_argument('--no-system', action='store_true', help='Kategorie nicht in es_systems eintragen')
    i.add_argument('--dry-run', action='store_true', help='nur zeigen, was passieren würde')
    i.set_defaults(fn=cmd_install)
    u = sub.add_parser('uninstall', help='Angelegtes entfernen')
    common(u)
    u.set_defaults(fn=cmd_uninstall)
    l = sub.add_parser('list', help='Spiele anzeigen')
    common(l)
    l.set_defaults(fn=cmd_list)
    up = sub.add_parser('update', help='neue Spiele und Updates holen (Modus sync), Spieleliste aktualisieren')
    up.add_argument('--wait-net', type=int, default=0, help='so viele Sekunden auf eine Internetverbindung warten (z. B. beim Systemstart)')
    up.set_defaults(fn=cmd_update)
    r = sub.add_parser('launch', help='(intern) ein Spiel starten')
    r.add_argument('game')
    r.add_argument('--mode', choices=['online', 'offline', 'sync'])
    r.add_argument('--browser')
    r.add_argument('--tv', action='store_true')
    r.add_argument('--window', action='store_true')
    r.add_argument('--print', action='store_true', help='nur den Startbefehl ausgeben')
    r.set_defaults(fn=cmd_launch)
    a = p.parse_args(argv)
    try:
        return a.fn(a)
    except KeyboardInterrupt:
        return 130
    except Exception as e:  # verständliche Meldung statt Traceback
        print('Fehler: %s' % e, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
