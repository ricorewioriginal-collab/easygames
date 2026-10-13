import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const js=readFileSync(resolve(root,'game.js'),'utf8');
const html=readFileSync(resolve(root,'classic.html'),'utf8');
const prelude=js.slice(js.indexOf('const TYPES='),js.indexOf('const MOVES='));
class MockColor {
 constructor(value){this.value=value;}
 offsetHSL(){return this;}
 getHex(){return this.value;}
}
const data=vm.runInNewContext(prelude+'\n({SPEC,TYPES})',{THREE:{Color:MockColor}});
const gymSource=js.match(/const GYMS=(\[[\s\S]*?\]);/);
const gyms=vm.runInNewContext(gymSource?.[1]||'[]');

test('game script syntax parses',()=>assert.doesNotThrow(()=>new Function(js)));
test('209 named species with unique identifiers and names',()=>{
 assert.equal(Object.keys(data.SPEC).length,209);
 assert.equal(new Set(Object.values(data.SPEC).map(s=>s.name)).size,209);
});
test('16 distinct arena masters are implemented',()=>{
 assert.equal(gyms.length,16);
 assert.equal(new Set(gyms.map(g=>g[0])).size,16);
});
test('species have valid values, moves and evolution targets',()=>{
 const ids=new Set(Object.keys(data.SPEC));
 const moves=new Set(['stoss','hieb','funken','glut','ranke','spritzer','fluegel','stein','spuk']);
 for(const [id,s] of Object.entries(data.SPEC)){
  assert.ok(s.name,'missing species name: '+id);
  assert.ok(s.type in data.TYPES,'invalid species type: '+id);
  assert.ok(s.hp>0&&s.atk>0&&s.def>0&&s.speed>0);
  assert.ok(s.catch>0&&s.catch<=1);
  assert.ok(s.moves.every(move=>moves.has(move)));
  if(s.evo){assert.ok(ids.has(s.evo[0]),'broken evolution: '+id);assert.ok(s.evo[1]>0);}
 }
});
test('local engine and mobile controls are present',()=>{
 assert.match(html,/\.\.\/bunte-insel\/vendor\/three\.min\.js/);
 for(const id of ['menu','map','team','dex','interact','joy','panel'])assert.ok(html.includes('id="'+id+'"'));
});
test('saving, dungeons and battlegrounds are included',()=>{
 for(const marker of ['function exportSave','function importSave','function caveEnter','function caveLeave','function updateBattleScene','function chooseSaveSlot'])assert.ok(js.includes(marker),marker);
});

test('explicit game modes and guarded world input',()=>{
 for(const state of ['BOOT','TITLE','WORLD','DIALOG','BATTLE','RESULT'])assert.match(js,new RegExp(state+":'"));
 assert.match(js,/function transition\(next\)/);
 assert.match(js,/gameState===GAME_STATES\.WORLD/);
 assert.match(js,/function returnToWorld\(\)/);
});

test('three physical starter balls require professor interaction',()=>{
 assert.match(js,/const starterStation=\[\]/);
 assert.match(js,/function professorIntroduction\(\)/);
 assert.match(js,/function inspectStarterBall\(i\)/);
 assert.match(js,/if\(!save\.metProfessor\)/);
 assert.match(js,/if\(save\.team\.length\)return/);
});
test('sixteen regional professors and original cat guild are present',()=>{
 assert.match(js,/const PROF_NAMES=/);
 assert.match(js,/for\(let j=0;j<7;j\+\+\)/);
 assert.match(js,/SPEC\.schnurrik=/);
 assert.match(js,/const SHADOW_SITES=/);
 assert.match(js,/function shadowGuildEvent\(site\)/);
});
