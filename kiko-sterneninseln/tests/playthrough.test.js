import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {levels,worlds} from '../src/data.js';
import {SaveManager} from '../src/save.js';
import {nextObjective} from '../src/objectives.js';
const context={};vm.runInNewContext(readFileSync(new URL('../vendor/three.min.js',import.meta.url),'utf8'),context);
globalThis.window={THREE:context.THREE,__worlds:worlds};
globalThis.document={querySelector:()=>({})};
const {Game}=await import('../src/game.js');
const {Kiko}=await import('../src/scene.js?v=8');
const {Player}=await import('../src/physics.js?v=8');
function setup(){const storage=new Map;globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};const g=Object.create(Game.prototype);g.save=new SaveManager;g.renderer={scene:new context.THREE.Scene,world(){},snapFollow(){}};g.kiko=new Kiko;g.player=new Player(g.kiko);g.ui={playing(){},updateHud(){},updateObjective(){},message(){},pause(){},complete(){},gameOver(){},error(e){throw e}};g.audio={tone(){}};g.introShown=true;g.raw={x:0,z:0,jump:false,interact:false,look:0};g.input={reset(){g.raw={x:0,z:0,jump:false,interact:false,look:0}},sample(){return g.raw}};g.start(0);return g}
test('real Game start, pause, resume, death, checkpoint and locked levels',()=>{const g=setup();assert.equal(g.state,'PLAYING');g.pause();assert.equal(g.state,'PAUSED');g.resume();assert.equal(g.state,'PLAYING');g.start(7);assert.equal(g.index,0);g.player.hearts=0;g.state='GAME_OVER';g.retryCheckpoint();assert.equal(g.player.hearts,3);assert.equal(g.state,'PLAYING');g.view.dispose()});
for(const hz of [30,60])test(`all eight levels finish through actual movement, pickup, switches and portals at ${hz} FPS`,()=>{
 const g=setup();let frames=0,retries=0;
 for(let level=0;level<8;level++){
  if(level)g.start(level);
  for(let frame=0;frame<10000&&g.state!=='LEVEL_COMPLETE';frame++){
   if(g.state==='GAME_OVER'){retries++;g.retryCheckpoint();assert.ok(retries<8,`too many deaths at level ${level+1}`)}
   const o=nextObjective(g),p=g.player.pos,target=o.target;
   const dx=target.x-p.x,dz=target.z-p.z,distance=Math.hypot(dx,dz),m=Math.max(.9,distance);
   const floor=g.view.platforms.find(f=>f.active&&Math.abs(p.x-f.x)<f.w/2-.1&&Math.abs(p.z-f.z)<f.d/2-.1&&Math.abs(p.y-f.y)<.1);
   const next=floor&&g.view.platforms[floor.index+1];
   const waiting=next&&!next.active&&target.z>next.z-1&&p.z>floor.z+floor.d/2-1.5;
   const rockAhead=g.view.blockers.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<1.5&&b.z>p.z);
   const jump=!!floor&&!waiting&&((p.z>floor.z+floor.d/2-.75&&target.z>floor.z+floor.d/2)||rockAhead);
   g.raw={x:waiting?0:-dx/m,z:waiting?0:-dz/m,jump,interact:distance<1.85&&!g.lastInteract,look:0};
   g.update(1/hz);frames++;
  }
  assert.equal(g.state,'LEVEL_COMPLETE',`level ${level+1}, position ${JSON.stringify(g.player.pos)}, collected ${g.count}, puzzle ${g.puzzle}, boss ${g.bossHits}, target ${nextObjective(g).title}`);
  assert.equal(g.count,5);assert.ok(g.puzzleDone());assert.equal(g.save.data.unlocked,Math.min(8,level+2));
 }
 const restored=new SaveManager;assert.equal(restored.data.unlocked,8);assert.ok(restored.data.best.every(s=>s>=500));
 console.log(`Simulated full round at ${hz} FPS: ${frames} frames, ${retries} checkpoint retries`);g.view.dispose()
});
test('guidance requests a required switch before a crystal behind its gate',()=>{const g=setup();g.save.data.unlocked=8;for(const i of [1,3,5,6]){g.start(i);const sw=g.view.switches[0];for(const c of g.view.crystals)if(c.pathIndex<=sw.pathIndex){c.got=true;g.count++}const o=nextObjective(g);assert.equal(o.target,sw.mesh.position,levels[i].name)}g.view.dispose()});

test('objective arrows point to the actual screen side',()=>{const g=setup();g.player.pos.set(0,0,0);const crystal=g.view.crystals[0];crystal.mesh.position.set(-4,1,0);assert.equal(nextObjective(g).arrow,'→');crystal.mesh.position.set(4,1,0);assert.equal(nextObjective(g).arrow,'←');g.view.dispose()});
