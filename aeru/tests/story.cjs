// Vollständige Story-Validierung: spielt die Hauptgeschichte vom Neustart bis zum Abspann durch.
// Der Test setzt keine Questflags. Er liest nur das aktuelle Ziel und den Zielpfeil des Spiels und führt dann echte
// Spielaktionen aus (gehen/teleportieren in die Nähe, Windstoß, Sprechen, Ringe durchfliegen, Bosskämpfe mit Ausweichen).
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');

function createDriver(h) {
  const {api} = h, story = h.context.AERU_STORY, log = [];
  const snap = () => h.snap();
  const finish = () => { let guard = 0; while (snap().mode === 'dialog' && guard++ < 200) { log.push(snap().dialog.id); api.finishDialog(); } if (snap().mode === 'notice') { h.els.noticeOk.onclick(); } };
  const settle = (n = 2) => { h.tick(n); finish(); };
  const at = (x, y, z, yaw = 0) => { api.teleport(x, y, z, yaw); settle(2); };
  function talkTo(id) {
    const n = snap().npcs.find(n => n.id === id); assert(n, 'Figur nicht anwesend: ' + id);
    at(n.x, n.y, n.z + 2.2); assert.equal(snap().near, id, 'Figur nicht in Reichweite: ' + id); api.talk(); finish(); settle(2);
  }
  // Sucht einen festen Standplatz neben dem Ziel (nicht in einem Aufwind) und schlägt in Blickrichtung zu.
  function strikeFrom(x, y, z) {
    const lay = snap().layout;
    const spots = [[0, 3], [3, 0], [-3, 0], [0, -3], [2, 2], [-2, 2], [2, 0], [-2, 0], [0, 1.6], [1.6, 1.2]].map(([ox, oz]) => [x + ox, z + oz])
      .filter(([px, pz]) => Math.abs(api.floorAt(px, pz, y + .42) - y) < .3 && lay.updrafts.every(u => Math.hypot(px - u.x, pz - u.z) > 2.6));
    assert(spots.length, `kein Standplatz bei ${x},${y},${z}`);
    const [px, pz] = spots[0];
    at(px, y, pz, Math.atan2(-(x - px), -(z - pz))); h.tick(30); api.strike(); settle(2);
  }
  function killEnemy(kind) {
    for (let guard = 0; guard < 400; guard++) {
      const e = snap().enemies.find(e => e.state !== 'dead' && (!kind || e.kind === kind));
      assert(e, 'kein Gegner ' + kind);
      if (e.kind === 'schatten' && e.state !== 'recover') { at(e.x, 0, e.z + 5, 0); h.tick(5); continue; }
      api.teleport(e.x, 0, e.z + 3, 0); h.tick(28); api.strike(); settle(1);
      const now = snap().enemies.filter(x => x.kind === e.kind && x.state === 'dead').length;
      if (now > 0 && snap().enemies.find(x => x.x === e.x && x.z === e.z)?.state === 'dead') return;
      if (snap().enemies.some(x => x.state === 'dead' && x.kind === e.kind)) return;
    }
    throw new Error('Gegner nicht besiegbar: ' + kind);
  }
  // Bosskampf: Wellen überspringen, Warnkreisen ausweichen, bei offenem Schild zuschlagen, Anker im Flug zerstören.
  function fightBoss(id) {
    at(0, 3, -18, 0); h.tick(10); finish();
    for (let t = 0; t < 60 * 240; t++) {
      const s = snap();
      if (s.mode === 'dialog' || s.mode === 'notice') { finish(); continue; }
      if (!s.boss || !s.boss.active) { if (s.save.flags['boss:' + id]) return; at(0, 3, -18, 0); h.tick(5); continue; }
      const anchor = s.anchors.find(a => !a.broken);
      if (anchor) { api.teleport(anchor.x, anchor.y - 1, anchor.z + 2.5, 0); h.tick(1); api.strike(); h.tick(28); continue; }
      if (s.state.y < 2.5 || Math.abs(s.state.x) > 4.5 || s.state.z > -17 || s.state.z < -20) { api.teleport(0, 3, -18, 0); }
      const d = Math.hypot(s.state.x, s.state.z + 22);
      if (s.waves.some(r => r < d && d - r < 1.4) && s.state.onGround) { api.hold('jump', true); api.jump(); }
      else if (s.state.vy < 0) api.hold('jump', false);
      if (s.markers && s.state.onGround) api.teleport(s.state.x > 0 ? -2.5 : 2.5, 3, -18, 0);
      if (s.boss.state === 'open' || s.orbs > 0) { api.strike(); }
      h.tick(1);
    }
    throw new Error('Boss nicht besiegt: ' + id);
  }
  function step() {
    const s = snap(), o = s.objective;
    if (!o) return false;
    const q = story.quests.find(q => q.id === o.quest), goal = q.steps[o.step].goal;
    switch (goal.type) {
      case 'arrive': {
        assert(s.save.cores[s.save.level], 'Portal sollte offen sein, wenn die nächste Ankunft das Ziel ist');
        assert(s.target && s.target.label === 'Sternentor', 'Zielpfeil zeigt auf das Sternentor');
        at(0, 3, -19); assert.equal(snap().near, 'portal'); api.talk(); settle(2); break;
      }
      case 'talk': talkTo(goal.npc); break;
      case 'lantern': { const t = s.target; assert(t, 'Zielpfeil zur Laterne fehlt'); strikeFrom(t.x, t.y - 2, t.z); break; }
      case 'enemy': killEnemy(goal.kind); break;
      case 'item': { const t = s.target; assert(t, 'Zielpfeil zum Objekt fehlt'); at(t.x, t.y - 1.2, t.z); break; }
      case 'ring': { const t = s.target; assert(t, 'Zielpfeil zum Ring fehlt'); at(t.x, t.y - 1, t.z); break; }
      case 'boss': fightBoss(goal.id); break;
      default: throw new Error('Unbekannter Zieltyp ' + goal.type);
    }
    return true;
  }
  function playToEnd(maxSteps = 200) {
    let last = '', same = 0;
    for (let i = 0; i < maxSteps; i++) {
      if (snap().mode === 'ending') return;
      const o = snap().objective; const key = o ? o.quest + ':' + o.step + ':' + o.have : 'none';
      if (key === last) { if (++same > 6) throw new Error('Kein Fortschritt bei ' + key); } else { same = 0; last = key; }
      if (!step()) { finish(); if (snap().mode === 'ending') return; throw new Error('Kein Ziel, aber kein Abspann'); }
    }
    throw new Error('Zu viele Schritte');
  }
  return {snap, finish, settle, at, talkTo, strikeFrom, killEnemy, fightBoss, step, playToEnd, log, story};
}

if (require.main === module) {
  const h = load(), d = createDriver(h), {api, els} = h, story = h.context.AERU_STORY;
  assert.equal(h.context.AERU_QUESTS.validate(story).join(' | '), '', 'Storydaten sind vollständig und verweisen nur auf vorhandene Quests, Figuren, Dialoge und Objekte');
  els.start.onclick(); d.finish();
  // Erwartete Dialogreihenfolge der Hauptgeschichte aus den Storydaten.
  const expected = [], epilog = [];
  for (const q of story.quests.filter(q => q.kind === 'main')) for (const s of q.steps) for (const id of [s.dialog, s.after]) if (id) (q.chapter <= 5 ? expected : epilog).push(id);
  const chaptersSeen = new Set();
  let guard = 0;
  while (d.snap().mode !== 'ending' && guard++ < 400) { const o = d.snap().objective; if (o) chaptersSeen.add(story.quests.find(q => q.id === o.quest).chapter); if (process.env.TRACE) console.log(guard, o && o.quest + ":" + o.step, o && o.text, d.snap().mode); d.step(); }
  assert.equal(d.snap().mode, 'ending', 'Abspann erreicht');
  assert.deepEqual([...chaptersSeen].sort(), [0, 1, 2, 3, 4, 5], 'alle sechs Kapitel der Hauptgeschichte durchlaufen');
  const mainLog = d.log.filter(id => expected.includes(id));
  assert.deepEqual(mainLog, expected, 'Storydialoge in der richtigen Reihenfolge, keiner doppelt, keiner fehlt');
  const s = d.snap();
  assert(s.save.cores.slice(0, 6).every(Boolean) && !s.save.cores[6], 'sechs Leuchtkerne, der siebte wartet im Nachtgarten');
  assert(story.quests.filter(q => q.kind === 'main' && q.chapter <= 5).every(q => s.quests[q.id] === 'done'), 'alle Hauptquests der sechs Kapitel abgeschlossen');
  assert(s.save.flags['boss:vesper'] && s.save.flags['boss:stille'], 'beide Bosse besiegt');
  // Freies Weiterspielen nach dem Abspann.
  els.explore.onclick(); assert.equal(d.snap().mode, 'play');
  assert(api.travel(0), 'Inselwahl nach dem Ende'); d.finish(); assert.equal(d.snap().save.level, 0);
  d.talkTo('mira'); assert(d.log.at(-1) === 'react:mira', 'Mira reagiert auf das Ende');
  assert(api.travel(5)); d.finish(); assert(d.snap().npcs.some(n => n.id === 'vesper'), 'Vesper wohnt nach dem Ende im Hafen');
  const stored = JSON.parse(h.stored['aeru-save-v1']); assert(stored.quests.c6_finale.s === 'done');
  // Epilog: Nachtgarten (siebte Welt) mit neuen Gegnern, Himmelsinsel-Samen und der Nachtblüte.
  api.travel(5); d.finish(); guard = 0;
  while (d.snap().objective && guard++ < 200) { const o = d.snap().objective; chaptersSeen.add(story.quests.find(q => q.id === o.quest).chapter); d.step(); }
  assert(!d.snap().objective, 'Epilog vollständig durchgespielt'); const e = d.snap();
  assert.deepEqual([...chaptersSeen].sort(), [0, 1, 2, 3, 4, 5, 6], 'alle sieben Kapitel');
  assert.deepEqual(d.log.filter(id => epilog.includes(id)), epilog, 'Epilogdialoge in der richtigen Reihenfolge');
  assert(e.save.cores.every(Boolean) && e.save.flags['boss:bluete'], 'sieben Kerne, Nachtblüte besiegt');
  assert(story.quests.filter(q => q.kind === 'main').every(q => e.quests[q.id] === 'done'), 'alle Hauptquests abgeschlossen');
  assert(e.save.level === 6 && e.enemies.some(x => x.kind === 'motte') && e.enemies.some(x => x.kind === 'wurzel'), 'neue Gegnertypen im Nachtgarten');
  d.talkTo('sorel'); assert(d.log.at(-1) === 'react:sorel', 'Sorel reagiert auf das Ende');
  console.log(`PASS story: 7 Kapitel (6 + Nachtgarten), ${story.quests.filter(q => q.kind === 'main').length} Hauptquests, ${expected.length + epilog.length} Storydialoge in Reihenfolge, beide Bosse, Abspann, freies Weiterspielen, Reaktionen nach dem Ende.`);
}
module.exports = {createDriver};
