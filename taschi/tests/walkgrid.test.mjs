// Collision grid: solid things block, every place the story needs stays
// reachable on foot.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLayout } from '../src/logic/layout.js';
import { buildWalkGrid, reachability, FREE } from '../src/logic/walkgrid.js';

const targets = (L) => {
  const t = [];
  for (const b of L.buildings) if (b.enter) t.push(['door ' + b.id, b.door.x, b.door.z]);
  for (const g of L.gates) t.push(['gate ' + g.id, g.x, g.z + (g.id === 'south' ? -2 : 2)]);
  for (const n of L.npcs) t.push(['npc ' + n.name, n.x, n.z]);
  for (const n of L.trainers) t.push(['trainer ' + n.id, n.x, n.z]);
  for (const it of L.items) t.push(['item ' + it.id, it.x, it.z]);
  for (const s of L.signs) t.push(['sign', s.x, s.z]);
  if (L.chest) t.push(['chest', L.chest.x, L.chest.z]);
  if (L.cave) { const yaw = Math.atan2(-L.cave.x, -L.cave.z); t.push(['cave', L.cave.x + Math.sin(yaw) * 2.5, L.cave.z + Math.cos(yaw) * 2.5]); }
  if (L.legend) t.push(['legend', L.legend.x, L.legend.z + 1]);
  if (L.guild) t.push(['guild', L.guild.x, L.guild.z + 2]);
  if (L.healStation) t.push(['healStation', L.healStation.x, L.healStation.z]);
  if (L.plaza) t.push(['fountain', L.plaza.x, L.plaza.z]);
  return t;
};

test('signposts, lamps, benches, the fountain and trees are solid', () => {
  const L = buildLayout(0), g = buildWalkGrid(L);
  for (const s of L.signs) assert.notEqual(g.at(s.x, s.z), FREE, 'sign ' + s.text);
  for (const p of L.props) assert.notEqual(g.at(p.x, p.z), FREE, p.kind);
  assert.ok(L.props.some(p => p.kind === 'fountain') && L.props.filter(p => p.kind === 'lamp').length === 6);
  for (const t of L.trees) assert.notEqual(g.at(t.x, t.z), FREE, 'tree');
  for (const r of L.rocks) assert.notEqual(g.at(r.x, r.z), FREE, 'rock');
});

test('trees left out by a low quality preset do not block', () => {
  const L = buildLayout(0);
  const t = L.trees.find(t => t.type !== 'giant');
  t.hidden = true;
  const g = buildWalkGrid(L);
  t.hidden = false;
  const others = L.trees.filter(o => o !== t && Math.hypot(o.x - t.x, o.z - t.z) < 3.5).length + L.rocks.filter(o => Math.hypot(o.x - t.x, o.z - t.z) < 3).length;
  if (!others) assert.equal(g.at(t.x, t.z), FREE);
});

test('every interaction point is reachable on foot in all regions', () => {
  for (let r = 0; r <= 16; r++) {
    const L = buildLayout(r), g = buildWalkGrid(L);
    const s = L.spawn.start;
    assert.equal(g.at(s.x, s.z), FREE, 'start blocked in region ' + r);
    const reach = reachability(g, s.x, s.z);
    for (const [name, x, z] of targets(L)) assert.ok(reach(x, z, 4.5), 'region ' + r + ': ' + name + ' unreachable');
  }
});
