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
                self.assertEqual(f.read(8), b'\x89PNG\r\n\x1a\n')
        syst = ET.parse(os.path.join(esde, 'custom_systems', 'es_systems.xml')).getroot().findall('system')
        self.assertEqual([s.findtext('name') for s in syst], ['easygames'])
        self.assertTrue(os.path.isfile(os.path.join(esde, 'gamelists', 'easygames', 'gamelist.xml')))
        self.assertEqual(len(os.listdir(os.path.join(esde, 'downloaded_media', 'easygames', 'covers'))), len(self.games))

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
        self.assertIn('--app=http://127.0.0.1:', line)
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


class Cover(Base):
    def test_gradient(self):
        p = os.path.join(self.home, 'c.png')
        es.png_gradient(p, ['#112233', '#ffeeaa'], 32, 24)
        with open(p, 'rb') as f:
            self.assertEqual(f.read(8), b'\x89PNG\r\n\x1a\n')


if __name__ == '__main__':
    unittest.main(verbosity=1)
