// Neue Spielelemente: Rammstoß, Nachtmotte/Wurzelwächter, Truhen-Upgrades, alter Spielstand ohne siebte Welt.
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
function fresh(opts) { const h = load(opts); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }
// Rammstoß trifft einen Gegner im Schub.
{
  const h = fresh(), {api} = h, e = h.snap().enemies.find(x => x.kind === 'kaefer');
  api.teleport(e.x, 0, e.z + 3.2, 0); h.tick(2); h.key('KeyW'); const id0 = api.rammId(); h.key('ShiftLeft'); h.tick(1); h.up('ShiftLeft'); api.dodge(); h.tick(14); h.up('KeyW');
  const after = h.snap().enemies.find(x => x.kind === 'kaefer' && Math.abs(x.x - e.x) < 6 && Math.abs(x.z - e.z) < 6);
  assert(api.rammId() > id0 && (after.hp < 2 || after.state === 'dead'), `Rammstoß trifft Gegner (hp ${after.hp})`);
}
// Nachtgarten: neue Gegner. Motte stirbt mit einem Treffer, Wurzelwächter setzt Warnkreise.
{
  const h = fresh(), {api} = h; api.level(6, false); h.tick(2);
  const m = h.snap().enemies.find(x => x.kind === 'motte'), w = h.snap().enemies.find(x => x.kind === 'wurzel');
  assert(m && w, 'beide neuen Gegnerarten vorhanden');
  api.teleport(w.x, 0, w.z + 6, 0); let marked = false; for (let i = 0; i < 200 && !marked; i++) { h.tick(1); marked = h.snap().markers > 0; } assert(marked, 'Wurzelwächter erzeugt Warnkreise');
  for (let i = 0; i < 20 && !h.snap().enemies.some(x => x.kind === 'motte' && x.state === 'dead'); i++) { const t = h.snap().enemies.find(x => x.kind === 'motte' && x.state !== 'dead'); api.teleport(t.x, 0, t.z + 3, 0); h.tick(28); const u = h.snap().enemies.find(x => x.kind === 'motte' && x.state !== 'dead'); if (u) { api.teleport(u.x, 0, u.z + 2.2, 0); api.strike(); h.tick(2); } }
  assert(h.snap().enemies.some(x => x.kind === 'motte' && x.state === 'dead'), 'Nachtmotte fällt mit einem Windstoß');
}
// Alter Spielstand (Version 3, sechs Welten, keine Truhen) lädt mit sieben Welten.
{
  const old = {version: 3, level: 2, checkpoint: null, collected: [[0, 1], [], [], [], [], []], lit: [[], [], [], [], [], []], rings: [[], [], [], [], [], []], cores: [true, true, false, false, false, false], quests: {}, flags: {}, seen: {}, boss: {vesper: 6, stille: 9}, elapsed: 5};
  const h = load({storage: {'aeru-save-v1': JSON.stringify(old)}}); h.els.continue.onclick(); h.finish(); const s = h.snap().save;
  assert.equal(s.cores.length, 7); assert.equal(s.chests.length, 7); assert.deepEqual(s.collected[0], [0, 1]); assert.equal(s.boss.bluete, 8);
}
console.log('PASS neu: Rammstoß, Nachtmotte, Wurzelwächter, alter Spielstand mit sieben Welten.');
