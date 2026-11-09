#!/usr/bin/env python3
"""Tests für tools/emulationstation.py (ohne Netzwerk, ohne Browser).   python3 tools/test-emulationstation.py"""
import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
import urllib.request
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emulationstation as es  # noqa: E402

REPO = os.path.dirname(HERE)


def run(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = es.main(list(argv))
    return code, out.getvalue(), err.getvalue()


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.home = self.tmp.name
        self._home = os.environ.get('HOME')
        os.environ['HOME'] = self.home
        self.games = es.load_catalog(REPO, es.BASE_URL)

    def tearDown(self):
        if self._home is None:
            os.environ.pop('HOME', None)
        else:
            os.environ['HOME'] = self._home
        self.tmp.cleanup()


class Parser(Base):
    def test_catalog(self):
        ids = [g['id'] for g in self.games]
        self.assertGreaterEqual(len(ids), 40)
        self.assertEqual(len(ids), len(set(ids)))
        for g in self.games:
            self.assertTrue(g['title'] and g['path'] and g['desc'], g['id'])
            self.assertTrue(os.path.isfile(os.path.join(REPO, g['path'], 'index.html')), g['id'])
        self.assertTrue(any('pad' in g['modes'] for g in self.games))

    def test_js_literals(self):
        v = es.js_assignment("// x\nconst A = [ {id:'a\\'b', n:1.5, t:true, l:[1,2,], \"k\":null}, /* c */ ];", 'A')
        self.assertEqual(v, [{'id': "a'b", 'n': 1.5, 't': True, 'l': [1, 2], 'k': None}])


class Install(Base):
    def install(self, *extra):
        esde = os.path.join(self.home, 'ES-DE')
        os.makedirs(esde, exist_ok=True)
        code, out, err = run('install', '--frontend', 'es-de', '--esde-dir', esde, '--roms', os.path.join(esde, 'ROMs'), '--repo', REPO, '--mode', 'offline', '--browser', sys.executable, *extra)
        self.assertEqual(code, 0, err)
        return esde

    def test_es_de(self):
        esde = self.install()
        rom = os.path.join(esde, 'ROMs', 'easygames')
        ext = '.bat' if es.IS_WIN else '.sh'
        launchers = [f for f in os.listdir(rom) if f.endswith(ext)]
        self.assertEqual(len(launchers), len(self.games))
        if not es.IS_WIN:
            self.assertTrue(all(os.access(os.path.join(rom, f), os.X_OK) for f in launchers))
        games = ET.parse(os.path.join(rom, 'gamelist.xml')).getroot().findall('game')
        self.assertEqual(len(games), len(self.games))
        for g in games:
            self.assertTrue(os.path.isfile(os.path.join(rom, g.findtext('path'))))
            with open(os.path.join(rom, g.findtext('image')), 'rb') as f:
                self.assertIn(f.read(4), (b'\x89PNG', b'\xff\xd8\xff\xe0', b'\xff\xd8\xff\xe1', b'\xff\xd8\xff\xdb'))   # PNG oder JPEG (Original-Titelbild)
        syst = ET.parse(os.path.join(esde, 'custom_systems', 'es_systems.xml')).getroot().findall('system')
        self.assertEqual([s.findtext('name') for s in syst], ['easygames'])
        self.assertTrue(os.path.isfile(os.path.join(esde, 'gamelists', 'easygames', 'gamelist.xml')))
        self.assertEqual(len(os.listdir(os.path.join(esde, 'downloaded_media', 'easygames', 'covers'))), len(self.games))
        # Branding: Logo als Marquee je Spiel (gamelist.xml und ES-DE-Medienordner)
        for g in games:
            with open(os.path.join(rom, g.findtext('marquee')), 'rb') as f:
                self.assertEqual(f.read(8), b'\x89PNG\r\n\x1a\n')
        self.assertEqual(len(os.listdir(os.path.join(esde, 'downloaded_media', 'easygames', 'marquees'))), len(self.games))

    def test_idempotent_and_keeps_other_systems(self):
        esde = os.path.join(self.home, 'ES-DE')
        cs = os.path.join(esde, 'custom_systems')
        os.makedirs(cs)
        with open(os.path.join(cs, 'es_systems.xml'), 'w') as f:
            f.write('<systemList><system><name>mein</name><path>/x</path></system></systemList>')
        self.install()
        self.install()
        names = [s.findtext('name') for s in ET.parse(os.path.join(cs, 'es_systems.xml')).getroot().findall('system')]
        self.assertEqual(sorted(names), ['easygames', 'mein'])

    def test_only_exclude_dry_run(self):
        esde = self.install('--only', self.games[0]['id'] + ',' + self.games[1]['id'], '--exclude', self.games[1]['id'])
        rom = os.path.join(esde, 'ROMs', 'easygames')
        self.assertEqual(len([f for f in os.listdir(rom) if f.endswith(('.sh', '.bat'))]), 1)
        code, out, _ = run('install', '--frontend', 'ports', '--roms', os.path.join(self.home, 'r'), '--repo', REPO, '--dry-run')
        self.assertEqual(code, 0)
        self.assertFalse(os.path.exists(os.path.join(self.home, 'r')))

    def test_retropie_and_ports(self):
        roms = os.path.join(self.home, 'RetroPie', 'roms')
        os.makedirs(roms)
        code, _, err = run('install', '--repo', REPO, '--browser', sys.executable, '--no-images')
        self.assertEqual(code, 0, err)
        cfg = os.path.join(self.home, '.emulationstation', 'es_systems.cfg')
        self.assertEqual(ET.parse(cfg).getroot().find('system').findtext('name'), 'easygames')
        self.assertFalse(os.path.exists(os.path.join(roms, 'easygames', 'images', self.games[0]['id'] + '.png')))
        p = os.path.join(self.home, 'pr')
        code, _, err = run('install', '--frontend', 'ports', '--roms', p, '--repo', REPO, '--browser', sys.executable)
        self.assertEqual(code, 0, err)
        self.assertTrue(os.path.isdir(os.path.join(p, 'ports', 'easygames')))

    def test_uninstall(self):
        esde = self.install()
        code, _, _ = run('uninstall', '--frontend', 'es-de', '--esde-dir', esde, '--roms', os.path.join(esde, 'ROMs'))
        self.assertEqual(code, 0)
        self.assertFalse(os.path.exists(os.path.join(esde, 'ROMs', 'easygames')))
        self.assertFalse(os.path.exists(os.path.join(esde, 'custom_systems', 'es_systems.xml')))
        self.assertEqual(os.listdir(os.path.join(esde, 'downloaded_media', 'easygames', 'covers')), [])

    def test_offline_needs_repo(self):
        code, _, err = run('install', '--frontend', 'ports', '--roms', self.home, '--mode', 'offline', '--repo', os.path.join(self.home, 'leer'))
        self.assertNotEqual(code, 0)
        self.assertIn('Repositories', err)


class Launch(Base):
    def setUp(self):
        super().setUp()
        esde = os.path.join(self.home, 'ES-DE')
        os.makedirs(esde)
        for mode in ('offline',):
            run('install', '--frontend', 'es-de', '--esde-dir', esde, '--roms', os.path.join(esde, 'ROMs'), '--repo', REPO, '--mode', mode, '--browser', sys.executable)
        self.script = os.path.join(esde, 'ROMs', 'easygames', '.easygames', 'emulationstation.py')

    def launch(self, *extra):
        buf = io.StringIO()
        out = io.StringIO()
        saved = sys.argv
        with contextlib.redirect_stdout(out):
            code = es.main(['launch', *extra, '--print'])
        return code, out.getvalue()

    def test_commands(self):
        # direkt über die Kopie im Ordner (liest deren config.json)
        import importlib.util
        spec = importlib.util.spec_from_file_location('es_copy', self.script)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            self.assertEqual(mod.main(['launch', 'anmacha-kart', '--print', '--tv']), 0)
        line = out.getvalue()
        self.assertIn('--kiosk', line)
        self.assertIn('--app=http://localhost:%d/' % es.DEFAULT_PORT, line)
        self.assertIn('/anmacha-kart/?tv', line)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            self.assertEqual(mod.main(['launch', 'anmacha-kart', '--print', '--mode', 'online', '--window']), 0)
        self.assertIn('--app=' + es.BASE_URL + 'anmacha-kart/', out.getvalue())
        self.assertNotIn('--kiosk', out.getvalue())

    def test_server(self):
        srv = es.start_server(REPO)
        try:
            base = 'http://127.0.0.1:%d/' % srv.server_address[1]
            g = self.games[0]
            r = urllib.request.urlopen(base + g['path'] + 'index.html')
            self.assertEqual(r.status, 200)
            r = urllib.request.urlopen(base + 'games.js')
            self.assertIn('javascript', r.headers['Content-Type'])
        finally:
            srv.shutdown()


class Port(Base):
    def test_fixed_port(self):
        import socket
        s = socket.socket()
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
        s.close()
        srv = es.start_server(REPO, port)
        try:
            self.assertEqual(srv.server_address[1], port)
            with self.assertRaises(OSError):
                es.start_server(REPO, port)
        finally:
            srv.shutdown()


class Bootstrap(Base):
    sh = os.path.join(HERE, 'install-emulationstation.sh')
    ps1 = os.path.join(HERE, 'install-emulationstation.ps1')

    def sh_run(self, env_extra, *args, path=None):
        import subprocess
        env = dict(os.environ, HOME=self.home, **env_extra)
        if path is not None:
            env['PATH'] = path
        return subprocess.run(['/bin/sh', self.sh, *args], env=env, stdin=subprocess.DEVNULL, capture_output=True, text=True,
                              start_new_session=True, timeout=60)

    def test_sh_syntax(self):
        import subprocess
        self.assertEqual(subprocess.run(['/bin/sh', '-n', self.sh]).returncode, 0)

    def test_sh_runs_install_with_python_present(self):
        r = self.sh_run({'EASYGAMES_SCRIPT': os.path.join(HERE, 'emulationstation.py')}, '--frontend', 'ports', '--roms', self.home, '--repo', REPO, '--dry-run')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('Testlauf', r.stdout)

    def test_sh_without_python_asks_and_stops(self):
        r = self.sh_run({'EASYGAMES_SCRIPT': os.path.join(HERE, 'emulationstation.py')}, '--dry-run', path='/nonexistent')
        self.assertEqual(r.returncode, 1)
        self.assertIn('Python 3.8', r.stdout)
        self.assertIn('Ohne Python', r.stderr)

    def test_sh_download(self):
        import shutil
        if not (shutil.which('curl') or shutil.which('wget')):
            self.skipTest('weder curl noch wget')
        srv = es.start_server(REPO)
        try:
            r = self.sh_run({'EASYGAMES_BASE': 'http://127.0.0.1:%d' % srv.server_address[1]}, '--frontend', 'ports', '--roms', self.home, '--repo', REPO, '--dry-run')
        finally:
            srv.shutdown()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('Testlauf', r.stdout)

    def test_ps1_static(self):
        with open(self.ps1, encoding='utf-8') as f:
            t = f.read()
        for a, b in (('{', '}'), ('(', ')')):
            self.assertEqual(t.count(a), t.count(b))
        self.assertIn('winget install -e --id Python.Python.3.12', t)
        self.assertIn('install @Rest', t)


class SyncBatocera(Base):
    """Modus sync auf Batocera: eigene Offline-Kopie über sync/manifest.json, eigenes System, Updates und neue Spiele."""
    PICK = ['deluxe-2048', 'mahjong', 'wortgitter']

    def publish(self, ids):
        """Kleiner „Server“ mit Manifest und Katalog für die gewählten Spiele (echte Dateien aus dem Repository)."""
        import hashlib
        import shutil
        site = self.site
        shutil.rmtree(site, ignore_errors=True)
        with open(os.path.join(REPO, 'sync', 'catalog.json'), encoding='utf-8') as f:
            cat = json.load(f)
        cat['games'] = [g for g in cat['games'] if g['id'] in ids]
        files = ['index.html', 'branding/easygames-icon-512.png']
        for g in cat['games']:
            d = os.path.join(REPO, g['path'])
            for r, _, fs in os.walk(d):
                files += [os.path.relpath(os.path.join(r, x), REPO).replace(os.sep, '/') for x in fs]
        man = {'schema': 1, 'version': 'v%d' % len(ids), 'entry': 'index.html', 'catalog': 'sync/catalog.json', 'files': [],
               'vendor': {'https://cdn.example.org/lib@1/x.js': 'index.html'}}
        for rel in files:
            os.makedirs(os.path.dirname(os.path.join(site, rel)) or site, exist_ok=True)
            shutil.copyfile(os.path.join(REPO, rel), os.path.join(site, rel))
        os.makedirs(os.path.join(site, 'sync'), exist_ok=True)
        with open(os.path.join(site, 'sync', 'catalog.json'), 'w', encoding='utf-8') as f:
            json.dump(cat, f)
        files.append('sync/catalog.json')
        for rel in files:
            with open(os.path.join(site, rel), 'rb') as f:
                b = f.read()
            man['files'].append({'p': rel, 's': len(b), 'h': hashlib.sha256(b).hexdigest()})
        with open(os.path.join(site, 'sync', 'manifest.json'), 'w') as f:
            json.dump(man, f)
        with open(os.path.join(site, 'sync', 'version.json'), 'w') as f:
            f.write('{}')
        os.makedirs(os.path.join(site, 'tools'), exist_ok=True)
        shutil.copyfile(os.path.join(HERE, 'emulationstation.py'), os.path.join(site, 'tools', 'emulationstation.py'))

    def setUp(self):
        super().setUp()
        self.site = os.path.join(self.home, 'site')
        self.ud = os.path.join(self.home, 'userdata')
        os.makedirs(os.path.join(self.ud, 'roms'))
        os.makedirs(os.path.join(self.ud, 'system'))
        with open(os.path.join(self.ud, 'system', 'custom.sh'), 'w') as f:
            f.write('#!/bin/bash\necho eigenes\n')
        os.environ['EASYGAMES_USERDATA'] = self.ud
        self.publish(self.PICK[:2])
        self.srv = es.start_server(self.site)
        self.url = 'http://127.0.0.1:%d/' % self.srv.server_address[1]

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        os.environ.pop('EASYGAMES_USERDATA', None)
        super().tearDown()

    def install(self):
        code, out, err = run('install', '--base-url', self.url, '--browser', sys.executable)
        self.assertEqual(code, 0, err)
        return out

    def test_install_update_new_game(self):
        out = self.install()
        self.assertIn('batocera', out)
        rom = os.path.join(self.ud, 'roms', 'easygames')
        content = os.path.join(self.ud, 'system', 'easygames', 'content')
        self.assertTrue(os.path.isfile(os.path.join(content, 'mahjong', 'index.html')))
        sysf = ET.parse(os.path.join(self.ud, 'system', 'configs', 'emulationstation', 'es_systems_easygames.cfg')).getroot()
        self.assertEqual(sysf.find('system').findtext('path'), rom)
        self.assertEqual(sysf.find('system').findtext('theme'), 'easygames')
        gl = ET.parse(os.path.join(rom, 'gamelist.xml')).getroot().findall('game')
        self.assertEqual([g.findtext('name') for g in gl][0], es.HOME_ENTRY['title'])
        self.assertEqual(len(gl), 3)
        with open(os.path.join(self.ud, 'system', 'custom.sh')) as f:
            hook = f.read()
        self.assertIn('echo eigenes', hook)
        self.assertIn('update --wait-net', hook)
        cfg_dir = os.path.join(rom, es.CFG_DIR)
        # Favorit, den EmulationStation eingetragen hat, muss ein Update überstehen
        tree = ET.parse(os.path.join(rom, 'gamelist.xml'))
        ET.SubElement(tree.getroot().findall('game')[1], 'favorite').text = 'true'
        tree.write(os.path.join(rom, 'gamelist.xml'))
        # Neues Spiel und geänderte Datei auf dem Server -> update lädt nur das Neue und schreibt die Liste neu
        self.publish(self.PICK)
        code, out, err = subprocess_run([sys.executable, os.path.join(cfg_dir, 'emulationstation.py'), 'update'], self.ud)
        self.assertEqual(code, 0, err)
        self.assertIn('Neu bei easygames', out)
        self.assertTrue(os.path.isfile(os.path.join(content, 'wortgitter', 'index.html')))
        gl = ET.parse(os.path.join(rom, 'gamelist.xml')).getroot().findall('game')
        self.assertEqual(len(gl), 4)
        self.assertEqual(sum(1 for g in gl if g.findtext('favorite') == 'true'), 1)
        # Spiel entfernt -> Dateien, Startskript und Bild verschwinden
        self.publish(self.PICK[1:])
        code, out, err = subprocess_run([sys.executable, os.path.join(cfg_dir, 'emulationstation.py'), 'update'], self.ud)
        self.assertEqual(code, 0, err)
        self.assertFalse(os.path.exists(os.path.join(content, 'deluxe-2048', 'index.html')))
        self.assertEqual(len(ET.parse(os.path.join(rom, 'gamelist.xml')).getroot().findall('game')), 3)
        self.assertFalse(any('2048' in f for f in os.listdir(rom)))
        # Deinstallieren: System, Hook und Offline-Kopie weg, eigene custom.sh-Zeilen bleiben
        code, _, err = run('uninstall')
        self.assertEqual(code, 0, err)
        with open(os.path.join(self.ud, 'system', 'custom.sh')) as f:
            hook = f.read()
        self.assertIn('echo eigenes', hook)
        self.assertNotIn('easygames', hook)
        self.assertFalse(os.path.exists(os.path.join(self.ud, 'system', 'easygames')))
        self.assertFalse(os.path.exists(os.path.join(self.ud, 'system', 'configs', 'emulationstation', 'es_systems_easygames.cfg')))

    def test_broken_download_changes_nothing(self):
        content = os.path.join(self.home, 'c', 'content')
        es.sync_content(content, self.url)
        with open(os.path.join(self.site, 'mahjong', 'index.html'), 'ab') as f:
            f.write(b'manipuliert')
        man = json.load(open(os.path.join(self.site, 'sync', 'manifest.json')))
        for x in man['files']:
            if x['p'] == 'mahjong/index.html':
                x['h'] = '0' * 64
        json.dump(man, open(os.path.join(self.site, 'sync', 'manifest.json'), 'w'))
        with self.assertRaises(IOError):
            es.sync_content(content, self.url)
        with open(os.path.join(content, 'mahjong', 'index.html'), 'rb') as f:
            self.assertNotIn(b'manipuliert', f.read())

    def test_offline_and_server_rewrite(self):
        content = os.path.join(self.home, 'c', 'content')
        r = es.sync_content(content, 'http://127.0.0.1:9/')
        self.assertFalse(r['online'])
        r = es.sync_content(content, self.url)
        self.assertTrue(r['online'])
        self.assertEqual(es.sync_content(content, self.url)['changed'], 0)
        with open(os.path.join(content, 'mahjong', 'probe.html'), 'w') as f:
            f.write('<html><head></head><script src="https://cdn.example.org/lib@1/x.js?v=2"></script></html>')
        state = json.load(open(os.path.join(self.home, 'c', 'sync-state.json')))
        srv = es.start_sync_server(content, state['vendor'], os.path.join(self.home, 'st.json'), 0)
        try:
            base = 'http://127.0.0.1:%d/' % srv.server_address[1]
            body = urllib.request.urlopen(base + 'mahjong/probe.html').read().decode()
            self.assertIn('src="/index.html?v=2"', body)
            self.assertIn('serviceWorker.register', body)
            self.assertIn('easygames', urllib.request.urlopen(base + '__easygames/laden.html').read().decode())
            self.assertFalse(json.loads(urllib.request.urlopen(base + '__easygames/status').read())['ready'])
        finally:
            srv.shutdown()
            srv.server_close()

    def test_exit_combo(self):
        import struct
        import threading
        if not hasattr(os, 'mkfifo'):
            self.skipTest('ohne FIFO')
        d = os.path.join(self.home, 'input')
        os.makedirs(d)
        fifo = os.path.join(d, 'event0')
        os.mkfifo(fifo)
        hit, stop = threading.Event(), threading.Event()
        t = threading.Thread(target=es.watch_exit_combo, args=(stop, hit.set, d), daemon=True)
        t.start()
        import time
        time.sleep(0.3)
        w = os.open(fifo, os.O_WRONLY)
        for code in (es.BTN_SELECT, es.BTN_START):
            os.write(w, struct.pack('llHHi', 0, 0, 1, code, 1))
        self.assertTrue(hit.wait(3))
        stop.set()
        os.close(w)
        t.join(3)


def subprocess_run(cmd, ud):
    import subprocess
    env = dict(os.environ, EASYGAMES_USERDATA=ud)
    r = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=120)
    return r.returncode, r.stdout, r.stderr


class Cover(Base):
    def test_gradient(self):
        p = os.path.join(self.home, 'c.png')
        es.png_gradient(p, ['#112233', '#ffeeaa'], 32, 24)
        with open(p, 'rb') as f:
            self.assertEqual(f.read(8), b'\x89PNG\r\n\x1a\n')


if __name__ == '__main__':
    unittest.main(verbosity=1)
