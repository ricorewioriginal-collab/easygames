#!/usr/bin/env node
// Regression tests for Android staging and automatic game discovery; no SDK/network required.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'easygames-sync-test-'));
  const write = (p, text) => { const f = path.join(dir, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
  write('tools/build-sync.js', fs.readFileSync(path.join(__dirname, 'build-sync.js')));
  for (const p of ['index.html', 'einbinden.html', 'device.js', 'gamekit.js', 'easygames.js']) write(p, '<html></html>');
  write('modes.js', 'window.EASYGAMES_MODES = {};'); write('guides.js', 'window.EASYGAMES_GUIDES = {};');
  write('games.js', "const GAMES = [{id:'demo',title:'Demo',path:'demo/'}];");
  write('demo/index.html', '<html></html>');
  write('demo/assets/_helper.js', 'export const answer = 42;');
  write('demo/assets/duplicate.js', 'export const answer = 42;');
  write('vendor/map.json', '{}'); write('vendor/fonts/fredoka.css', 'body{}');
  const run = (...args) => spawnSync(process.execPath, ['tools/build-sync.js', ...args], { cwd: dir, encoding: 'utf8' });
  return { dir, write, run, read: p => fs.readFileSync(path.join(dir, p), 'utf8'), cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
test('staged hash assets retain underscore modules and deduplicate identical files', () => {
  const f = fixture(); try {
    const result = f.run('--strict', '--stage', 'stage'); assert.equal(result.status, 0, result.stderr);
    const m = JSON.parse(f.read('stage/sync/manifest.json'));
    assert(m.files.some(e => e.p === 'demo/assets/_helper.js'));
    for (const e of m.files) {
      const data = fs.readFileSync(path.join(f.dir, 'stage/content', e.h));
      assert.equal(data.length, e.s);
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'), e.h);
    }
    assert.equal(fs.readdirSync(path.join(f.dir, 'stage/content')).length, new Set(m.files.map(e => e.h)).size);
  } finally { f.cleanup(); }
});
test('--check detects a stale catalog without changing files', () => {
  const f = fixture(); try {
    assert.equal(f.run().status, 0);
    f.write('sync/catalog.json', '{}\n');
    const before = f.read('sync/catalog.json'), manifest = f.read('sync/manifest.json');
    assert.equal(f.run('--check').status, 1);
    assert.equal(f.read('sync/catalog.json'), before); assert.equal(f.read('sync/manifest.json'), manifest);
  } finally { f.cleanup(); }
});
test('new games and changed assets automatically change the update version', () => {
  const f = fixture(); try {
    assert.equal(f.run().status, 0); const before = JSON.parse(f.read('sync/manifest.json')).version;
    f.write('games.js', "const GAMES = [{id:'demo',title:'Demo',path:'demo/'},{id:'new',title:'Neu',path:'new/'}];");
    f.write('new/index.html', '<canvas></canvas>');
    assert.equal(f.run('--check').status, 1);
    assert.equal(f.run('--strict').status, 0);
    assert.notEqual(JSON.parse(f.read('sync/manifest.json')).version, before);
    assert(JSON.parse(f.read('sync/catalog.json')).games.some(g => g.id === 'new'));
    assert.equal(f.run('--check', '--strict').status, 0);
  } finally { f.cleanup(); }
});
