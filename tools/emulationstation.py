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
    return next((c for c in cands if os.path.isfile(c)), None)


def browser_command(browser, url, profile, kiosk=True):
    name = os.path.basename(browser).lower()
    if 'firefox' in name:
        return [browser, '--no-remote', '--profile', profile] + (['--kiosk'] if kiosk else []) + [url]
    cmd = [browser, '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--noerrdialogs', '--disable-infobars',
           '--disable-session-crashed-bubble', '--autoplay-policy=no-user-gesture-required']
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
        return 3
    srv = None
    try:
        if mode == 'offline':
            repo = cfg.get('repo')
            if not repo or not os.path.isfile(os.path.join(repo, game['path'], 'index.html')):
                print('Offline-Dateien nicht gefunden (%s). Repository-Ordner prüfen oder mit --mode online einrichten.' % repo, file=sys.stderr)
                return 4
            port = int(cfg.get('port') or DEFAULT_PORT)
            try:
                srv = start_server(repo, port)
            except OSError:
                srv = start_server(repo, 0)
                print('Port %d ist belegt – Speicherstände dieses Starts liegen unter einer anderen Adresse. Anderen Port mit --port wählen.' % port, file=sys.stderr)
            # „localhost“ (nicht 127.0.0.1): Firebase/Google-Anmeldung erlaubt localhost standardmäßig
            url = 'http://localhost:%d/%s' % (srv.server_address[1], game['path'])
        else:
            url = cfg.get('base_url', BASE_URL) + game['path']
        if (a.tv or cfg.get('tv')) and 'tvParam' in game.get('modes', []):
            url += ('&' if '?' in url else '?') + 'tv'
        profile = os.path.join(base, 'browser-profile')
        os.makedirs(profile, exist_ok=True)
        cmd = browser_command(browser, url, profile, kiosk=not (a.window or cfg.get('window')))
        if a.print:
            print(' '.join('"%s"' % c if ' ' in c else c for c in cmd))
            return 0
        return subprocess.call(cmd)
    finally:
        if srv:
            srv.shutdown()


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
    if os.path.isdir('/userdata/roms'):
        return 'ports', '/userdata/roms'
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


def system_element(rom_dir):
    s = ET.Element('system')
    ext = '.bat .BAT' if IS_WIN else '.sh .SH'
    for tag, val in (('name', SYSTEM), ('fullname', 'RicoReWi easygames'), ('path', rom_dir), ('extension', ext),
                     ('command', '%ROM%' if IS_WIN else 'bash %ROM%'), ('platform', 'pc'), ('theme', 'pc')):
        ET.SubElement(s, tag).text = val
    return s


def cmd_install(a):
    fe, roms_guess = (a.frontend, None) if a.frontend else detect_frontend()
    if not fe:
        print('Frontend nicht erkannt. Mit --frontend es-de|retropie|ports und --roms ORDNER angeben.', file=sys.stderr)
        return 2
    roms = a.roms or roms_guess or (esde_roms(a) if fe == 'es-de' else os.path.join(os.path.expanduser('~'), 'RetroPie', 'roms'))
    repo = os.path.abspath(a.repo) if a.repo else (os.path.dirname(HERE) if os.path.isfile(os.path.join(os.path.dirname(HERE), 'games.js')) else None)
    if a.mode == 'offline' and not (repo and os.path.isfile(os.path.join(repo, 'games.js'))):
        print('Offline-Modus braucht eine Kopie des Repositories:\n  git clone --depth 1 https://github.com/ricorewioriginal-collab/easygames\n'
              'dann mit --repo ORDNER (oder das Skript aus dessen tools-Ordner) starten.', file=sys.stderr)
        return 2
    base_url = a.base_url if a.base_url.endswith('/') else a.base_url + '/'
    browser = find_browser(a.browser)
    if a.browser and not browser:
        print('Browser nicht gefunden: %s' % a.browser, file=sys.stderr)
        return 2
    if not browser:
        print('Hinweis: Es wurde noch kein Browser gefunden (Chromium, Chrome, Edge, Firefox). Bitte installieren oder --browser PFAD angeben.')
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

    sysname = 'ports' if fe == 'ports' else SYSTEM
    rom_dir = os.path.join(roms, sysname, SYSTEM) if fe == 'ports' else os.path.join(roms, SYSTEM)
    cfg_dir = os.path.join(rom_dir, CFG_DIR)
    img_dir = os.path.join(rom_dir, 'images')
    plan = '%d Spiele -> %s (%s, %s)' % (len(games), rom_dir, fe, a.mode)
    if a.dry_run:
        print('Testlauf: ' + plan)
        return 0
    for d in (rom_dir, cfg_dir, img_dir):
        os.makedirs(d, exist_ok=True)
    shutil.copyfile(os.path.abspath(__file__), os.path.join(cfg_dir, 'emulationstation.py'))
    with open(os.path.join(cfg_dir, 'catalog.json'), 'w', encoding='utf-8') as f:
        json.dump({'games': games}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(cfg_dir, 'config.json'), 'w', encoding='utf-8') as f:
        json.dump({'mode': a.mode, 'repo': repo, 'base_url': base_url, 'browser': browser if a.browser else None, 'tv': a.tv, 'window': a.window, 'port': a.port}, f, indent=1)

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
    else:
        sysfile = None
    if sysfile and not a.no_system:
        register_system(sysfile, system_element(rom_dir))
    manifest = {'files': created, 'system_file': sysfile if sysfile and not a.no_system else None, 'rom_dir': rom_dir, 'cfg_dir': cfg_dir}
    with open(os.path.join(cfg_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1)
    print('Fertig: ' + plan)
    if fe == 'ports':
        print('Die Spiele erscheinen im System „Ports“ (Spieleliste neu laden).')
    else:
        print('EmulationStation neu starten – die Kategorie „RicoReWi easygames“ erscheint in der Systemliste.')
    return 0


def cmd_uninstall(a):
    fe, roms_guess = (a.frontend, None) if a.frontend else detect_frontend()
    roms = a.roms or roms_guess or (esde_roms(a) if fe == 'es-de' else os.path.join(os.path.expanduser('~'), 'RetroPie', 'roms'))
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
        sp.add_argument('--frontend', choices=['es-de', 'retropie', 'ports'], help='es-de, retropie oder ports (Batocera/RetroPie-Ports); Standard: automatisch')
        sp.add_argument('--roms', help='ROM-Ordner des Frontends (Standard: automatisch)')
        sp.add_argument('--esde-dir', help='ES-DE-Datenordner (Standard: ~/ES-DE)')
        sp.add_argument('--repo', help='Ordner mit einer Kopie des easygames-Repositories (für den Offline-Modus)')
        sp.add_argument('--base-url', default=BASE_URL, help='Adresse der easygames-Homepage')

    i = sub.add_parser('install', help='Spiele einrichten')
    common(i)
    i.add_argument('--mode', choices=['online', 'offline'], default='online', help='online = von der Homepage (Standard), offline = aus lokaler Kopie')
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
    r = sub.add_parser('launch', help='(intern) ein Spiel starten')
    r.add_argument('game')
    r.add_argument('--mode', choices=['online', 'offline'])
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
