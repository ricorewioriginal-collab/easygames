// Spiellogik mit echter Three.js-Geometrie (r128) und simuliertem DOM:
// Steuerung, Physik, Flug, Kamera, Kampf, Negativfälle der Geschichte, Spielstände, Erreichbarkeit, Bildratenunabhängigkeit.
const assert = require('node:assert/strict'), {load} = require('./harness.cjs'), {createDriver} = require('./story.cjs');
const passed = [];
const ok = name => passed.push(name);

function fresh(opts) { const h = load(opts); h.api.settings.camAssist = false; h.els.start.onclick(); h.finish(); return h; }
// Einfacher Autopilot mit echten Tasten: steuert zu (x,z), hält Sprung zum Steigen, bis die Höhe erreicht ist.
function flyTo(h, tx, ty, tz, {maxTicks = 900, land = false} = {}) {
  const {api} = h; let s;
  for (let i = 0; i < maxTicks; i++) {
    s = h.snap().state;
    const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
    for (const [k, on] of [['KeyD', dx > .4], ['KeyA', dx < -.4], ['KeyS', dz > .4], ['KeyW', dz < -.4]]) on ? h.key(k) : h.up(k);
    if (!s.flight && !s.onGround && s.y < ty) api.flight();
    if (s.onGround && (s.y < ty - .5 || d > 3)) { if (!land || d > 1.5) api.flight(); }
    api.hold('jump', s.y < ty + (land ? .5 : 0) && d > 1);
    h.tick(1);
    if (land && h.snap().state.onGround && d < 2.5 && Math.abs(h.snap().state.y - ty) < .3) break;
    if (!land && d < 1.5 && Math.abs(s.y + 1 - ty) < 2) break;
  }
  for (const k of ['KeyD', 'KeyA', 'KeyS', 'KeyW']) h.up(k); api.hold('jump', false);
  if (land) { if (h.snap().state.flight) api.flight(); h.tick(200); }
  return h.snap().state;
}

// ───────── Bewegung, Sprung, Flug ─────────
{
  const h = fresh(), {api} = h;
  const z = h.snap().state.z; h.key('KeyW'); h.tick(60); h.up('KeyW'); assert(h.snap().state.z < z - 6, 'Tastatur bewegt Aeru');
  h.tick(30); const stopZ = h.snap().state.z; h.tick(10); assert(Math.abs(h.snap().state.z - stopZ) < .05, 'Abbremsen ohne Nachrutschen');
  // Variable Sprunghöhe: antippen vs. halten.
  api.teleport(0, 0, 19); h.tick(5); h.key('Space'); h.tick(6); h.up('Space'); let top = 0; for (let i = 0; i < 60; i++) { h.tick(); top = Math.max(top, h.snap().state.y); }
  api.teleport(0, 0, 19); h.tick(5); h.key('Space'); let high = 0; for (let i = 0; i < 60; i++) { h.tick(); high = Math.max(high, h.snap().state.y); } h.up('Space'); h.tick(200);
  assert(top > 1 && top < high - .6, `Antippen springt niedriger (${top.toFixed(2)}) als Halten (${high.toFixed(2)})`);
  assert(top > .8, 'auch ein kurzer Sprung schafft eine Stufe');
  ok('Laufen, Abbremsen, variable Sprunghöhe');
  // Coyote Time: kurz nach dem Verlassen der Kante darf noch gesprungen werden.
  api.teleport(0, 3, -21.5, 0); h.tick(5); h.key('KeyW'); let left = false; for (let i = 0; i < 90 && !left; i++) { h.tick(); left = !h.snap().state.onGround; } h.up('KeyW');
  assert(left, 'Kante verlassen'); h.tick(3); api.jump(); h.tick(2); assert(h.snap().state.vy > 8, 'Coyote-Sprung kurz nach der Kante');
  h.tick(200);
  // Sprungpuffer: Druck knapp vor der Landung wird nach dem Aufsetzen ausgeführt.
  api.teleport(0, 1.2, 19); h.tick(1); for (let i = 0; i < 40 && h.snap().state.y > .45; i++) h.tick(); api.jump(); assert(!h.snap().state.flight, 'kein Flügelschlag knapp über dem Boden'); h.tick(15); assert(h.snap().state.y > .5 && h.snap().state.vy > 0, 'gepufferter Sprung nach der Landung');
  h.tick(200); ok('Coyote Time und Sprungpuffer');
  // Gleiten fällt langsamer als freier Fall.
  api.teleport(30, 14, 20); h.tick(1); h.key('Space'); h.tick(40); const glide = h.snap().state.vy; h.up('Space'); api.teleport(30, 14, 20); h.tick(41); const fall = h.snap().state.vy;
  assert(glide > -2.3 && fall < -8, `Gleiten ${glide.toFixed(1)} vs. Fall ${fall.toFixed(1)}`); h.tick(200);
  // Treppe mit echten Sprüngen.
  api.teleport(0, 0, -8); h.tick(); h.key('KeyW'); for (let j = 0; j < 6; j++) { h.key('Space'); h.tick(25); h.up('Space'); h.tick(8); } h.up('KeyW'); h.tick(30); assert(h.snap().state.y >= 2.9, 'Treppe ist begehbar');
  // Unter der oberen Plattform gibt es keine unsichtbare Wand.
  api.teleport(-4, 0, -12, 0); h.tick(2); h.key('KeyW'); h.tick(120); h.up('KeyW'); assert(h.snap().state.z < -23.5 && h.snap().state.y === 0, 'unter der Plattform hindurch laufbar');
  ok('Gleiten, Treppe, keine unsichtbaren Kanten');
  // Flug: Abheben, Steigen durch Halten, Sinken mit Umschalt, Ausdauer sinkt und lädt am Boden.
  api.teleport(0, 0, 19); h.tick(5); api.flight(); h.tick(20); const y0 = h.snap().state.y; api.hold('jump', true); h.tick(60); api.hold('jump', false); const s1 = h.snap().state;
  assert(s1.flight && s1.y > y0 + 1.5 && s1.stamina < 90, 'Steigen im Flug kostet Flügelkraft');
  h.key('ShiftLeft'); h.tick(30); h.up('ShiftLeft'); assert(h.snap().state.vy < -5, 'Sinken mit Umschalt'); h.tick(200);
  assert(h.snap().state.onGround && !h.snap().state.flight, 'Landung beendet den Flug'); h.tick(120); assert(h.snap().state.stamina > 95, 'Flügelkraft lädt am Boden');
  // Aufwind hebt und lädt.
  api.teleport(21, 0, 2); h.tick(60); assert(h.snap().state.y > 3 && h.snap().state.flight, 'Aufwind hebt an');
  ok('Flug, Steigen, Sinken, Ausdauer, Aufwind');
  // Echter Hin- und Rückflug zur Ostinsel und zurück.
  api.teleport(24, 0, 2, -Math.PI / 2); h.tick(); let s = flyTo(h, 37, 1, 2, {land: true}); assert(s.onGround && s.y === 1 && s.x > 31, 'Landung auf der Ostinsel');
  s = flyTo(h, 22, 0, 2, {land: true}); assert(s.onGround && s.y === 0 && s.x < 27, 'Rückflug zur Hauptinsel'); ok('echter Flug zur Außeninsel und zurück');
  // Kantenhilfe: knapp unter der Inselkante (Ostinsel, Oberkante y=1) gegen den Rand fliegen zieht Aeru hinauf statt ihn abprallen oder abstürzen zu lassen.
  api.teleport(29.2, .1, 2, -Math.PI / 2); h.key('KeyD'); h.tick(20); h.up('KeyD'); h.tick(20);
  s = h.snap().state; assert(s.onGround && s.y === 1 && s.x > 30, `Kantenhilfe zieht auf die Insel (${s.x.toFixed(1)}, ${s.y.toFixed(2)})`);
  // Kollision folgt dem sichtbaren Felskegel: dicht unter der Insel blockiert der Fels, tief unten (schmale Spitze) nicht.
  api.teleport(28, -2.5, 2, -Math.PI / 2); h.tick(1); api.flight(); h.key('KeyD'); h.tick(20); h.up('KeyD'); assert(h.snap().state.x < 30.5, 'Fels direkt unter der Insel ist fest');
  h.tick(400);
  // Kantenschutz: Laufen bis zur Kante hält kurz an, weiter drücken lässt Aeru bewusst hinunter.
  api.teleport(42, 1, 2, -Math.PI / 2); h.tick(30); h.key('KeyD'); h.tick(24); s = h.snap().state; assert(s.onGround && s.y === 1, 'Kantenschutz hält an der Kante');
  h.tick(40); h.up('KeyD'); assert(h.snap().state.y < 1, 'weiter drücken: bewusst hinunter'); h.tick(400);
  ok('Kantenhilfe, Kantenschutz, Fels unter Inseln fest');
  // Kamera bleibt über dem Boden.
  for (let i = 0; i < 30; i++) h.frame()(1000 + i * 16);
  assert(h.snap().camera.y > h.api.floorAt(h.snap().camera.x, h.snap().camera.z) + .5, 'Kamera nicht im Boden');
  // Ausweichen gibt kurze Unverwundbarkeit und Schub.
  api.teleport(0, 0, 19); h.tick(5); h.key('KeyW'); h.tick(5); h.key('ShiftLeft'); h.tick(2); h.up('ShiftLeft'); h.up('KeyW'); assert(h.snap().state.dodge > 0 || h.snap().state.z < 17, 'Ausweichen');
  // Vom Startpunkt in alle Richtungen loslaufen: Aeru kommt weg, steckt nie in Baum oder Boden, die Kamera nie im Laub.
  for (let dir = 0; dir < 8; dir++) {
    api.teleport(0, 0, 19, dir * Math.PI / 4); h.tick(5); const s0 = h.snap().state; let clock = 5000 + dir * 10000; for (let i = 0; i < 90; i++) api.frame(clock += 1000 / 60);
    const keys = [['KeyW'], ['KeyW', 'KeyD'], ['KeyD'], ['KeyS', 'KeyD'], ['KeyS'], ['KeyS', 'KeyA'], ['KeyA'], ['KeyW', 'KeyA']][dir];
    keys.forEach(k => h.key(k)); let far = 0;
    for (let i = 0; i < 150; i++) {
      api.frame(clock += 1000 / 60); const s = h.snap(), st = s.state, cam = s.camera; far = Math.max(far, Math.hypot(st.x - s0.x, st.z - s0.z));
      if (st.onGround) assert(st.y >= api.floorAt(st.x, st.z, st.y + .42) - .01, 'Aeru versinkt nicht im Boden');
      for (const t of s.layout.trees) {
        if (st.y + 1.6 > t.cy - t.ch && st.y < t.cy + t.ch) assert(Math.hypot(st.x - t.x, st.z - t.z) > t.crown, 'Aeru steckt in einer Baumkrone');
        assert(Math.hypot(cam.x - t.x, cam.y - t.cy, cam.z - t.z) > t.crown * .9, `Kamera steckt im Laub (Richtung ${dir}, Schritt ${i}, Kamera ${[cam.x, cam.y, cam.z].map(v => v.toFixed(1))}, Baum ${t.x.toFixed(1)},${t.cy.toFixed(1)},${t.z.toFixed(1)} r${t.crown.toFixed(1)}, Aeru ${st.x.toFixed(1)},${st.y.toFixed(1)},${st.z.toFixed(1)})`);
      }
    }
    keys.forEach(k => h.up(k)); const s1 = h.snap().state;
    assert(far > 6, `vom Start in Richtung ${dir} loslaufen (${far.toFixed(1)} m, ${s1.x.toFixed(1)},${s1.y.toFixed(1)},${s1.z.toFixed(1)})`);
    h.tick(400);
  }
  ok('Kamera und Ausweichen, Start in alle Richtungen ohne Versinken');
}
// ───────── Bildratenunabhängigkeit ─────────
{
  const h = fresh(), {api} = h; let clock = 1000; const distances = [];
  for (const fps of [30, 60, 120]) { api.teleport(0, 0, 19); h.tick(3); api.frame(clock); h.key('KeyW'); for (let i = 1; i <= fps; i++) api.frame(clock + i * 1000 / fps); h.up('KeyW'); distances.push(h.snap().state.z); clock += 2000; }
  assert(Math.max(...distances) - Math.min(...distances) < .2, '30/60/120 Hz gleich schnell: ' + distances.map(d => d.toFixed(2)));
  ok('30/60/120 Hz gleich schnell');
}
// ───────── Kampf ─────────
{
  const h = fresh(), {api} = h;
  const target = h.snap().enemies[0]; api.teleport(target.x, 0, target.z + 5, 0); let sawWindup = false, hurtDuring = null;
  for (let i = 0; i < 240; i++) { h.tick(); const e = h.snap().enemies[0]; if (e.state === 'windup') sawWindup = true; if (h.snap().state.hp < 5 && hurtDuring === null) hurtDuring = e.state; }
  assert(sawWindup, 'Angriff wird angekündigt'); assert(hurtDuring === null || hurtDuring === 'dash' || hurtDuring === 'recover', 'Schaden nur durch den Sprung');
  const hp = h.snap().state.hp; api.teleport(h.snap().enemies[0].x, 0, h.snap().enemies[0].z + 3, 0); h.tick(30); api.strike(); assert(h.snap().enemies[0].hp < 2, 'Windstoß trifft');
  // Tod: zurück zum Rastpunkt, volle Herzen.
  api.lose(); assert.equal(h.snap().state.hp, 5); assert.equal(h.snap().state.z, 19); void hp;
  ok('Angriffsankündigung, Treffer, Tod mit Rücksetzpunkt');
}
// ───────── Negativfälle und Story-Sicherheit ─────────
{
  const h = fresh(), {api, els} = h, d = createDriver(h);
  // Quest zu früh abschließen: Mira vor den Laternen erneut ansprechen.
  d.talkTo('mira'); assert.equal(h.snap().objective.text, 'Wecke die drei Windlaternen');
  d.talkTo('mira'); assert.equal(h.snap().objective.text, 'Wecke die drei Windlaternen', 'Gespräch überspringt keinen Schritt');
  d.talkTo('edda'); assert.equal(h.snap().quests.c1_trace, 'locked', 'Folgequest bleibt gesperrt');
  // Dialog doppelt auslösen.
  { const m = h.snap().npcs.find(n => n.id === 'mira'); api.teleport(m.x, m.y, m.z + 2.2); } h.tick(2); api.talk(); const id = h.snap().dialog.id; api.talk(); api.talk(); assert(!h.snap().dialog || h.snap().dialog.queued.length === 0, 'kein zweiter Dialog'); h.tick(2); assert.notEqual(h.snap().dialog?.id, id, 'Dialog startet nicht von selbst neu'); h.finish();
  // Gesperrtes Portal.
  d.at(0, 3, -19); api.talk(); assert.equal(h.snap().dialog.id, 'gate_closed'); h.finish(); assert.equal(h.snap().save.level, 0);
  assert.equal(api.travel(1), false, 'Inselwahl ohne Kern gesperrt');
  ok('Quest zu früh, Dialog doppelt, gesperrtes Portal und Inselwahl');
  // Pause während eines Dialogs.
  d.talkTo('pip'); api.teleport(-4, 0, 15.2); h.tick(2); api.talk(); assert.equal(h.snap().mode, 'dialog'); api.advance(); const line = h.snap().dialog.line;
  h.key('Escape'); assert.equal(h.snap().mode, 'pause'); h.tick(30); assert.equal(h.snap().mode, 'pause', 'Simulation steht in der Pause');
  api.resume(); assert.equal(h.snap().mode, 'dialog'); assert.equal(h.snap().dialog.line, line, 'Dialog setzt an derselben Stelle fort'); h.finish(); assert.equal(h.snap().mode, 'play');
  ok('Pause während eines Dialogs');
  // Speichern und Laden mitten in einer Quest (inkl. Zähler).
  for (let i = 0; i < 2; i++) d.step();
  const before = h.snap().objective; els.toTitle.onclick(); assert.equal(h.snap().mode, 'title'); els.continue.onclick(); h.finish();
  assert.deepEqual(h.snap().objective, before, 'Questschritt und Fortschritt nach dem Laden gleich');
  // Gesammelte Splitter erscheinen nach dem Laden nicht erneut.
  const g = h.snap().layout.gems[0]; d.at(g.x, g.y - .9, g.z); assert(h.snap().save.collected[0].includes(0));
  els.toTitle.onclick(); els.continue.onclick(); h.finish(); h.tick(2); assert.equal(h.snap().save.collected[0].filter(x => x === 0).length, 1, 'Splitter nicht doppelt');
  ok('Speichern/Laden während einer Quest, keine doppelten Sammelobjekte');
  // Weiter bis Kapitel 3 und Boss zu früh angreifen.
  for (let i = 0; i < 80 && h.snap().objective?.quest !== 'c3_gate'; i++) d.step();
  d.step(); d.step(); // Ankunft, Sela
  assert.equal(h.snap().objective.quest, 'c3_gate');
  d.at(0, 3, -18, 0); h.tick(60); assert.equal(h.snap().boss.active, false, 'Vesper kämpft nicht vor seinem Questschritt');
  api.strike(); assert.equal(h.snap().boss.hp, 6, 'Boss kann nicht zu früh besiegt werden');
  for (let i = 0; i < 40 && h.snap().objective.quest !== 'c3_storm'; i++) d.step();
  // Sterben im Bosskampf: Rücksetzpunkt am Arenaeingang, Bossleben auf Phasenbeginn, Quest bleibt.
  d.at(0, 3, -18, 0); h.tick(10); d.finish(); assert(h.snap().boss.active, 'Bosskampf startet in der Arena');
  for (let t = 0; t < 4000 && h.snap().boss.hp > 4; t++) { const s = h.snap(); if (s.mode === 'dialog') { h.finish(); continue; } if (s.state.y < 2.5) api.teleport(0, 3, -18, 0); if (s.boss.state === 'open') api.strike(); h.tick(); }
  assert(h.snap().boss.hp <= 4); const phaseStart = h.snap().boss.hp;
  h.finish(); api.lose(); h.finish(); const after = h.snap();
  assert.equal(after.state.z, -17.6, 'Rücksetzpunkt am Arenaeingang'); assert.equal(after.boss.hp, 4, 'Boss nur auf Phasenbeginn zurückgesetzt'); assert(phaseStart <= 4);
  assert.equal(after.objective.quest, 'c3_storm', 'Questschritt bleibt erhalten');
  ok('Boss zu früh, Sterben im Bosskampf');
}
// ───────── Spielstände: alt, unvollständig, widersprüchlich ─────────
{
  const legacy = {version: 1, level: 2, collected: [[0, 3, 21], [], [7]], lit: [[0, 1], [], [2]], cores: [true, true, true], met: [true, true, true], side: [true, false, false], bossHP: 0, won: true, elapsed: 123};
  let h = load({storage: {'aeru-save-v1': JSON.stringify(legacy)}}); h.els.continue.onclick();
  assert.equal(h.snap().mode, 'notice', 'Hinweis auf übernommenen Spielstand'); h.els.noticeOk.onclick(); h.finish();
  let s = h.snap(); assert.equal(s.save.version, 3); assert.deepEqual(s.save.collected[0], [0, 3, 21]); assert.equal(s.save.elapsed, 123);
  assert(s.save.cores[0] && s.save.cores[1] && s.save.cores[2]); assert.equal(s.quests.c3_storm, 'done'); assert.equal(s.quests.c1_pip, 'done'); assert(h.stored['aeru-save-backup'], 'Original gesichert');
  assert.equal(s.objective.quest, 'c4_reefs', 'Version 1 mit Vesper-Sieg geht in Kapitel 4 weiter');
  ok('Version-1-Spielstand mit altem Vesper-Finale');
  // Version 2 mit allen sechs alten Inseln: neues Finale wartet, Inselwahl frei.
  const all = {version: 2, level: 5, collected: Array.from({length: 6}, () => [1, 2]), lit: Array.from({length: 6}, () => [0, 1, 2]), rings: [[], [], [], [0, 1, 2], [0, 1, 2], [0, 1, 2]], cores: Array(6).fill(true), met: Array(6).fill(true), side: Array(6).fill(true), bossHP: 0, won: true, expandedWon: true, elapsed: 900};
  h = load({storage: {'aeru-save-v1': JSON.stringify(all)}}); h.els.continue.onclick(); h.els.noticeOk.onclick(); h.finish(); s = h.snap();
  assert.equal(s.quests.c6_harbor, 'done'); assert.notEqual(s.quests.c6_finale, 'done'); assert.equal(s.objective.quest, 'c6_finale'); assert.equal(s.save.cores[5], false, 'Horizontkern erst nach dem neuen Finale');
  assert(h.api.travel(2), 'Inselwahl bleibt offen'); h.finish(); assert(h.api.travel(5)); h.finish();
  const d = createDriver(h); d.fightBoss('stille'); h.tick(2); d.finish(); d.talkTo('neri'); assert.equal(h.snap().mode, 'ending', 'altes Ende führt ins neue Finale');
  ok('Version-2-Spielstand mit alter Erweiterung → neues Finale');
  // Lücken und halbe Rätsel.
  const gap = {version: 2, level: 4, collected: [[], [5], [], [], [9], []], lit: [[0], [0, 2], [], [], [], []], rings: [], cores: [true, false, true, false, true, false], side: [false, true]};
  h = load({storage: {'aeru-save-v1': JSON.stringify(gap)}}); h.els.continue.onclick(); h.els.noticeOk.onclick(); h.finish(); s = h.snap();
  assert.equal(s.save.level, 1, 'keine Kapitelsprünge über Lücken'); assert.deepEqual(s.save.collected[4], [9], 'Splitter späterer Inseln bleiben'); assert.deepEqual(s.save.lit[1], [], 'Rätsellaternen neu'); assert.notEqual(s.quests.c2_nim, 'done', 'Nebenquest eines unfertigen Kapitels wird neu gespielt');
  ok('widersprüchliche alte Kerne, halbes Laternenrätsel');
  // Unvollständige und kaputte Spielstände.
  h = load({storage: {'aeru-save-v1': JSON.stringify({version: 3})}}); h.els.continue.onclick(); h.finish(); assert.equal(h.snap().mode, 'play'); assert.equal(h.snap().objective.quest, 'c1_wake');
  h = load({storage: {'aeru-save-v1': JSON.stringify({version: 3, level: 5, quests: {c6_finale: {s: 'done'}, bogus: {s: 'done'}}, cores: [1, 2, 3]})}}); h.els.continue.onclick(); h.finish(); s = h.snap();
  assert.equal(s.save.level, 0); assert.equal(s.quests.c6_finale, 'locked', 'unmögliche Abschlüsse werden verworfen'); assert(!s.save.cores.some(Boolean));
  h = load({storage: {'aeru-save-v1': '{kaputt'}}); assert.equal(h.els.continue.hidden, true); assert.equal(h.els.saveNote.hidden, false);
  h.els.start.onclick(); assert.equal(h.stored['aeru-save-previous'], '{kaputt', 'unlesbarer Stand wird gesichert, nicht gelöscht');
  ok('unvollständige, widersprüchliche und unlesbare Spielstände');
}
// ───────── Splitter-Belohnungen ─────────
{
  const h = fresh(), {api} = h;
  for (const g of h.snap().layout.gems) { api.teleport(g.x, g.y - .9, g.z); h.tick(); }
  const s = h.snap(); assert.equal(s.save.collected[0].length, 24); assert.equal(s.state.stamina, 125, 'Upgrade nach 24 Splittern');
  // Alle 144 Splitter: Sternenglanz macht die Flügelkraft unbegrenzt; vorher sinkt sie beim Steigen.
  for (let level = 1; level < 6; level++) { api.level(level); h.tick(); for (const g of h.snap().layout.gems) { api.teleport(g.x, g.y - .9, g.z); h.tick(); } }
  const all = h.snap().save.collected.reduce((n, a) => n + a.length, 0); assert.equal(all, 144, 'alle Splitter einsammelbar');
  assert.equal(h.snap().state.hp, 7, 'zwei Splitterherzen'); assert(h.context.AERU_STORY.upgrades.every(u => u.gems <= all));
  api.level(0); h.tick(); api.teleport(0, 0, 19); h.tick(5); api.flight(); api.hold('jump', true); h.tick(240); api.hold('jump', false);
  const st = h.snap().state; assert(st.flight && st.y > 8 && st.stamina === 125, 'Sternenglanz: Steigen kostet keine Flügelkraft');
  ok('Splitter-Upgrades bis Sternenglanz');
}
// ───────── Erreichbarkeit ─────────
{
  const h = fresh(), {api} = h, story = h.context.AERU_STORY;
  for (let level = 0; level < 6; level++) {
    api.level(level); h.tick(1); const s = h.snap(), lay = s.layout;
    const onGround = (x, y, z) => { const f = api.floorAt(x, z, y + .5); return f > -50 && y - f >= -.01 && y - f < 2.6; };
    for (const g of lay.gems) assert(onGround(g.x, g.y - 1.1, g.z) || onGround(g.x, g.y - 1.1 - 1, g.z), `Splitter ${g.id} auf Insel ${level} steht auf festem Boden`);
    for (const t of lay.torches) assert(onGround(t.x, t.y, t.z), `Laterne ${t.id} auf Insel ${level} steht auf Boden`);
    for (const c of lay.checkpoints) assert(onGround(c.x, c.y, c.z), `Rastpunkt auf Insel ${level}`);
    // Kein Ziel steckt in einem Baum: Stamm oder Krone würden es sonst unerreichbar machen.
    const blocked = (x, y, z) => lay.trees.some(t => { const r = (y + 1.6 > t.cy - t.ch && y < t.cy + t.ch ? t.crown : y < t.trunkTop ? t.trunk : -1) + .35; return Math.hypot(x - t.x, z - t.z) < r - 1.1; });
    for (const g of lay.gems) assert(!blocked(g.x, g.y - 1.1, g.z), `Splitter ${g.id} auf Insel ${level} steckt in einem Baum`);
    for (const t of lay.torches) assert(!blocked(t.x, t.y, t.z), `Laterne ${t.id} auf Insel ${level} steckt in einem Baum`);
    for (const r of lay.rings) assert(!blocked(r.x, r.y - 1, r.z), `Ring auf Insel ${level} steckt in einem Baum`);
    for (const n of s.npcs) assert(!blocked(n.x, n.y, n.z), `Figur ${n.id} auf Insel ${level} steckt in einem Baum`);
    for (const it of story.items.filter(i => i.level === level)) assert(onGround(it.x, it.y, it.z), `Objekt ${it.id} erreichbar`);
    for (const r of lay.rings) assert(r.y < 14 && lay.solids.some(sd => Math.hypot(r.x - sd.x, r.z - sd.z) < (sd.r || 6) + 12), `Ring auf Insel ${level} in Flugreichweite`);
    for (const [id, def] of Object.entries(story.npcs)) for (const a of def.appear || []) if (a.level === level) assert(onGround(a.x, a.y, a.z), `Auftrittsort von ${id} auf Insel ${level}`);
  }
  // Echte Wege: verborgene Stufen (Kapitel 2) mit Sprüngen, Kristalltürme (Kapitel 5) per Aufwind, je ein Ring im Flug.
  api.level(1); h.tick(); api.teleport(21.5, 0, -13.5); h.tick(5);
  for (const [x, z, y] of [[24, -16, 1], [27, -19, 2], [30, -22, 3]]) { for (let i = 0; i < 80; i++) { const st = h.snap().state; const dx = x - st.x, dz = z - st.z; for (const [k, on] of [['KeyD', dx > .3], ['KeyA', dx < -.3], ['KeyS', dz > .3], ['KeyW', dz < -.3]]) on ? h.key(k) : h.up(k); if (st.onGround && st.y < y) { h.key('Space'); } h.tick(); if (!h.snap().state.onGround) h.tick(0); if (st.onGround && st.y === y && Math.hypot(dx, dz) < 1.2) break; if (i % 20 === 19) h.up('Space'); } }
  for (const k of ['KeyD', 'KeyA', 'KeyS', 'KeyW', 'Space']) h.up(k); h.tick(60);
  assert.equal(h.snap().state.y, 3, 'Bernsteinnest über die verborgenen Stufen erreichbar');
  api.level(4); h.tick(); api.teleport(-13, 0, 3); h.tick(2); const top = flyTo(h, -13, 5, -4, {land: true}); assert.equal(top.y, 5, 'Kristallturm per Aufwind erreichbar');
  for (const level of [3, 4, 5]) { api.level(level); h.tick(); const r = h.snap().layout.rings[0]; api.teleport(r.x + (r.x > 0 ? -6 : 6), 0, r.z + 6); h.tick(2); flyTo(h, r.x, r.y, r.z); h.tick(2); assert(h.snap().save.rings[level].length >= 1, `Ring auf Insel ${level} im echten Flug durchflogen`); }
  ok('Erreichbarkeit aller Objekte, verborgene Stufen, Kristallturm, Ringe im echten Flug');
}
console.log('PASS logic: ' + passed.join(' · '));
