import {updateMechanics,windAt} from '../src/mechanics.js';
import {bossFrame,bossTouchesPlayer,bossJumpSoon} from '../src/boss.js';
import {characters} from '../src/characters.js';
import {makeApproach,floorHeight} from '../src/terrain.js';
import {guidePages} from '../src/guide.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {levels,worlds,LEVEL_COUNT,LEGACY_LEVEL_MAP} from '../src/data.js';
import {SaveManager} from '../src/save.js';
import {nextObjective} from '../src/objectives.js';
const context={};vm.runInNewContext(readFileSync(new URL('../vendor/three.min.js',import.meta.url),'utf8'),context);
globalThis.window={THREE:context.THREE,__worlds:worlds};
globalThis.document={querySelector:()=>({})};
const {Game}=await import('../src/game.js');
const {Kiko}=await import('../src/scene.js?v=11');
const {Player}=await import('../src/physics.js?v=11');
function setup(character='kiko'){const storage=new Map;globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};const g=Object.create(Game.prototype);g.save=new SaveManager;g.save.data.character=character;g.renderer={scene:new context.THREE.Scene,world(){},snapFollow(){}};g.kiko=new Kiko(character);g.player=new Player(g.kiko);g.ui={playing(){},updateHud(){},updateObjective(){},message(){},pause(){},complete(){},gameOver(){},error(e){throw e}};g.audio={tone(){}};g.introShown=true;g.raw={x:0,z:0,jump:false,interact:false,look:0};g.input={reset(){g.raw={x:0,z:0,jump:false,interact:false,look:0}},sample(){return g.raw}};g.start(0);return g}
test('boss beam cannot hit a guardian jumping above it',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(LEVEL_COUNT-1);g.count=5;g.bossHits=1;g.bossStartedAt=0;g.time=1.95;
 const sw=g.view.switches[0].mesh.position;g.player.pos.set(sw.x,sw.y+1,sw.z-1.6);g.player.invincible=0;
 g.updateBoss();assert.equal(g.player.hearts,3,'beam damage must respect the feet height');assert.equal(g.view.bossBeam.visible,true);
 g.player.pos.y=sw.y;g.updateBoss();assert.equal(g.player.hearts,2,'the same beam must still hit a grounded guardian');g.view.dispose()
});
test('blue boss windows are safe, reach 2.5 units, and restart each phase with a warning',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(LEVEL_COUNT-1);g.count=5;for(const c of g.view.crystals)c.got=true;g.bossStartedAt=0;const sw=g.view.switches[0].mesh.position;
 for(let phase=0;phase<3;phase++){
  const start=g.bossStartedAt;g.player.pos.set(sw.x,sw.y,sw.z-2.4);g.time=start+.6;g.interact();assert.equal(g.bossHits,phase,'purple cannot accept a hit');
  for(let t=2.71;t<5.49;t+=.1){g.time=start+t;g.updateBoss();assert.equal(g.view.bossBeam.visible,false);assert.equal(g.view.bossWarning.visible,false);assert.match(nextObjective(g).detail,/BLAU/);assert.equal(g.hits,0)}
  g.interact();assert.equal(g.bossHits,phase+1);assert.equal(g.hits,0);assert.notEqual(bossFrame(g).mode,'attack','no instant attack after changing phases');g.interact();assert.equal(g.bossHits,phase+1,'one blue window cannot skip phases');
 }
 assert.ok(g.puzzleDone());g.updateBoss();assert.equal(g.view.bossBeam.visible,false);assert.equal(g.view.bossWarning.visible,false);g.view.dispose()
});
for(const character of characters)for(const hz of [30,60])test(`${character.name}: jump all three boss attacks and finish without damage at ${hz} FPS`,()=>{
 const g=setup(character.id);g.save.data.unlocked=LEVEL_COUNT;g.start(LEVEL_COUNT-1);g.count=5;for(const c of [...g.view.crystals,...g.view.stars]){c.got=true;c.mesh.visible=false}
 const sw=g.view.switches[0].mesh.position;g.player.pos.set(sw.x,sw.y,sw.z-1.6);let jumps=0,groundThreats=0;
 for(let step=0;step<hz*30&&!g.puzzleDone();step++){
  const f=bossFrame(g),jump=bossJumpSoon(g)&&!g.lastJump;if(jump){jumps++;assert.match(nextObjective(g).detail,/JETZT SPRINGEN/)}
  if(bossTouchesPlayer(f,{pos:{x:g.player.pos.x,y:sw.y,z:g.player.pos.z}},sw))groundThreats++;
  g.raw={x:0,z:0,look:0,jump,interact:f.weak&&!g.lastInteract};g.update(1/hz);
  assert.equal(g.hits,0,`phase ${g.bossHits+1}, time ${g.time}, height ${g.player.pos.y-sw.y}`);assert.equal(g.state,'PLAYING');
 }
 assert.equal(g.bossHits,3);assert.equal(jumps,3);assert.ok(groundThreats>3,'the jumps really cross damaging attacks');assert.equal(g.player.hearts,3);assert.equal(g.player.shield,character.shield);
 // Finish by walking from the heart to the portal through the normal Game update.
 for(let step=0;step<hz*10&&g.state==='PLAYING';step++){const p=g.player.pos,t=g.view.portal.position,d=Math.max(.7,Math.hypot(t.x-p.x,t.z-p.z));g.raw={x:-(t.x-p.x)/d,z:-(t.z-p.z)/d,look:0,jump:false,interact:false};g.update(1/hz)}
 assert.equal(g.state,'LEVEL_COMPLETE');assert.equal(g.hits,0);g.view.dispose()
});
test('boss beam collision follows its rendered rotation and finite length',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(LEVEL_COUNT-1);g.count=5;g.bossHits=1;g.bossStartedAt=0;
 const center=g.view.switches[0].mesh.position;
 for(const time of [1.3,1.7,2.2,2.6]){
  g.time=time;const f=bossFrame(g);g.view.setBossState(f);assert.equal(g.view.bossBeam.rotation.y,f.angle);assert.equal(g.view.bossBeam.position.y,center.y+f.height);
  for(const [along,across,hit] of [[2,0,true],[2,.8,false],[4.8,0,false]]){
   g.player.pos.set(center.x+along*Math.sin(f.angle)+across*Math.cos(f.angle),center.y,center.z+along*Math.cos(f.angle)-across*Math.sin(f.angle));
   assert.equal(bossTouchesPlayer(f,g.player,center),hit,`angle ${f.angle}, local ${along}/${across}`);
  }
 }
 g.bossHits=0;g.time=2;const ring=bossFrame(g);g.player.pos.copy(center);assert.equal(bossTouchesPlayer(ring,g.player,center),false,'the empty center of a ring is safe');g.player.pos.x+=ring.radius;assert.equal(bossTouchesPlayer(ring,g.player,center),true);g.view.dispose()
});
test('real Game start, pause, resume, death, checkpoint and locked levels',()=>{const g=setup();assert.equal(g.state,'PLAYING');g.pause();assert.equal(g.state,'PAUSED');g.resume();assert.equal(g.state,'PLAYING');g.start(7);assert.equal(g.index,0);g.player.hearts=0;g.state='GAME_OVER';g.retryCheckpoint();assert.equal(g.player.hearts,3);assert.equal(g.state,'PLAYING');g.view.dispose()});
for(const character of characters)for(const hz of [30,60])test(`${character.name}: all 20 levels finish through actual movement, pickup, switches and portals at ${hz} FPS`,()=>{
 const g=setup(character.id);let frames=0,retries=0;
 for(let level=0;level<LEVEL_COUNT;level++){
  if(level)g.start(level);
  for(let frame=0;frame<10000&&g.state!=='LEVEL_COMPLETE';frame++){
   if(g.state==='GAME_OVER'){retries++;g.retryCheckpoint();assert.ok(retries<25,`too many deaths at level ${level+1}`)}
   const o=nextObjective(g),p=g.player.pos,target=o.target;
   const dx=target.x-p.x,dz=target.z-p.z,distance=Math.hypot(dx,dz),m=Math.max(.9,distance);
   const floor=g.view.platforms.find(f=>f.active&&Math.abs(p.x-f.x)<f.w/2-.1&&Math.abs(p.z-f.z)<f.d/2-.1&&Math.abs(p.y-f.y)<.1);
   const next=floor&&g.view.platforms[floor.index+1];
   const waiting=next&&!next.active&&target.z>next.z-1&&p.z>floor.z+floor.d/2-1.5;
   const rockAhead=g.view.blockers.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<1.5&&b.z>p.z);
   const beamNear=g.view.hazards.some(b=>Math.abs(p.x-b.mesh.position.x)<1&&Math.abs(p.z-b.mesh.position.z)<b.depth/2+1);
   const jump=!!floor&&!waiting&&((p.z>floor.z+floor.d/2-.75&&target.z>floor.z+floor.d/2)||rockAhead||beamNear);
   g.raw={x:waiting?0:-dx/m,z:waiting?0:-dz/m,jump,interact:distance<1.85&&!g.lastInteract,look:0};
   g.update(1/hz);frames++;
  }
  assert.equal(g.state,'LEVEL_COMPLETE',`level ${level+1}, position ${JSON.stringify(g.player.pos)}, collected ${g.count}, puzzle ${g.puzzle}, boss ${g.bossHits}, target ${nextObjective(g).title}`);
  assert.equal(g.count,5);assert.ok(g.puzzleDone());assert.equal(g.save.data.unlocked,Math.min(LEVEL_COUNT,level+2));
 }
 const restored=new SaveManager;assert.equal(restored.data.unlocked,LEVEL_COUNT);assert.ok(restored.data.best.every(s=>s>=500));
 console.log(`${character.name}: simulated full round at ${hz} FPS: ${frames} frames, ${retries} checkpoint retries`);g.view.dispose()
});
test('guidance requests a required switch before a crystal behind its gate',()=>{const g=setup();g.save.data.unlocked=LEVEL_COUNT;for(const i of [1,6,11,15]){g.start(i);const sw=g.view.switches[0];for(const c of g.view.crystals)if(c.pathIndex<=sw.pathIndex){c.got=true;g.count++}const o=nextObjective(g);assert.equal(o.goalTarget,sw.mesh.position,levels[i].name)}g.view.dispose()});

test('objective arrows point to the actual screen side',()=>{const g=setup();g.player.pos.set(0,0,0);const crystal=g.view.crystals[0];crystal.mesh.position.set(-4,1,0);assert.equal(nextObjective(g).arrow,'→');crystal.mesh.position.set(4,1,0);assert.equal(nextObjective(g).arrow,'←');g.view.dispose()});

test('star pulse stuns enemies, respects cooldown, and never blocks a nearby switch',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(1);const e=g.view.enemies[0];g.player.pos.set(e.mesh.position.x+1,e.mesh.position.y,e.mesh.position.z);assert.equal(g.pulse(),true);assert.ok(e.stunned>3);const score=g.score;assert.equal(g.pulse(),false);assert.equal(g.score,score);const x=e.mesh.position.x;g.view.update(1,true);assert.equal(e.mesh.position.x,x);const sw=g.view.switches[0];g.player.pos.copy(sw.mesh.position);g.pulseReadyAt=99;assert.equal(g.interact(),true);assert.equal(sw.active,true);assert.equal(g.puzzle,1);g.view.dispose()
});
test('jump attack stuns hoppers and bonus stars heal only once',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(1);const e=g.view.enemies[0];g.player.pos.set(e.mesh.position.x,e.mesh.position.y+.5,e.mesh.position.z);g.player.velocity.y=-2;g.updateEnemies();assert.ok(e.stunned>0);assert.ok(g.player.velocity.y>0);assert.equal(g.stomps,1);assert.equal(g.player.hearts,3);g.start(0);const star=g.view.stars[0];g.player.pos.set(star.mesh.position.x,0,star.mesh.position.z);g.player.hearts=2;g.collect();assert.equal(g.player.hearts,3);assert.equal(g.bonus,1);g.player.hearts=2;g.collect();assert.equal(g.player.hearts,2);assert.equal(g.bonus,1);g.view.dispose()
});
test('Boro shield is granted once per level and cannot be farmed by switching figures',()=>{
 const g=setup('boro'),root=g.kiko.root;assert.equal(g.player.shield,1);g.damage();assert.equal(g.player.hearts,3);assert.equal(g.player.shield,0);g.selectCharacter('mira');g.selectCharacter('boro');assert.equal(g.player.shield,0);assert.equal(g.kiko.root,root);assert.equal(g.player.pos,root.position);g.player.invincible=0;g.damage();assert.equal(g.player.hearts,2);g.start(0);assert.equal(g.player.shield,1);g.view.dispose()
});
test('a sloped approach is traversable without jumping and without leaving its surface',()=>{
 const a=[0,0,6,6,0],b=[0,6.5,6,6,.6],ramp=makeApproach(a,b),floors=[{x:0,z:0,w:6,d:6,y:0,active:true},ramp,{x:0,z:6.5,w:6,d:6,y:.6,active:true}],p=new Player(new Kiko);p.spawn([0,0,0]);let reached=false;for(let i=0;i<160;i++){p.step(1/60,{x:0,z:1,jump:false},floors,0);if(p.pos.z>ramp.z0&&p.pos.z<ramp.z1)assert.ok(Math.abs(p.pos.y-floorHeight(ramp,p.pos.x,p.pos.z))<.025);if(p.pos.z>5.5){reached=true;break}}assert.ok(reached);assert.equal(p.pos.y,.6);assert.ok(p.ground)
});
test('checkpoints heal once, medals keep their best result and chosen figures persist',()=>{
 const g=setup('mira'),mid=levels[0].path[2];g.player.pos.set(mid[0]+2,mid[4],mid[1]);g.player.hearts=1;g.update(1/60);assert.ok(g.checkpointReached);assert.equal(g.player.hearts,3);g.player.hearts=2;g.update(1/60);assert.equal(g.player.hearts,2);g.save.finish(0,3,750,{time:42,hits:0,deaths:0});g.save.finish(0,2,700,{time:60,hits:1,deaths:0});const restored=new SaveManager;assert.equal(restored.data.character,'mira');assert.equal(restored.data.records[0].medal,3);assert.equal(restored.data.records[0].time,42);assert.equal(restored.data.records[0].runs,2);assert.ok(restored.data.tutorialDone);g.view.dispose()
});
test('guide explains all 20 puzzles, active key bindings and character abilities',()=>{const g=setup('mira');g.save.data.keys.jump='KeyJ';const pages=guidePages(g);assert.equal(pages.length,4);assert.equal(pages[3].cards.length,LEVEL_COUNT);assert.match(pages[1].cards[0][1],/J springt/);assert.match(pages[2].intro,/Mira/);g.view.dispose()});

test('star plates require continuous standing and permanently open their gate',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(2);const first=g.view.switches[0];g.player.pos.copy(first.mesh.position);g.player.ground=true;updateMechanics(g,.3);assert.equal(g.puzzle,0);g.player.pos.x+=3;updateMechanics(g,.1);assert.equal(first.hold,0);
 for(const s of g.view.switches){g.player.pos.copy(s.mesh.position);g.player.ground=true;for(let i=0;i<40;i++)updateMechanics(g,1/60)}assert.equal(g.puzzle,3);assert.ok(g.puzzleDone());assert.equal(g.view.gate.visible,false);g.view.dispose()
});
test('beacons require the actual star pulse and cannot be counted twice',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(4);for(const s of g.view.switches){g.player.pos.copy(s.mesh.position);g.time+=4;g.interact()}assert.equal(g.puzzle,3);assert.ok(g.puzzleDone());g.time+=4;g.interact();assert.equal(g.puzzle,3);g.view.dispose()
});
test('clock gates expire and can be restarted after expiry',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(9);g.player.pos.copy(g.view.switches[0].mesh.position);g.interact();assert.ok(g.puzzleDone());assert.equal(g.view.gate.visible,false);g.time=g.timerUntil+.1;updateMechanics(g,0);assert.equal(g.puzzleDone(),false);assert.equal(g.view.gate.visible,true);g.interact();assert.ok(g.puzzleDone());assert.equal(g.timerUntil,g.time+18);g.view.dispose()
});
test('crumbling floors disappear with their meshes and return for another attempt',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(7);const f=g.view.platforms.find(f=>f.crumble);g.player.pos.set(f.x,f.y,f.z);g.player.ground=true;g.view.touchFloor(g.player);assert.ok(f.collapseAt>0);g.view.update(1.6,true);assert.equal(f.active,false);assert.equal(f.under.visible,false);assert.equal(f.topSurface.visible,false);g.view.update(3.1,true);assert.equal(f.active,true);assert.equal(f.tile.visible,true);g.view.dispose()
});
test('spring mushrooms launch automatically, gusts are local, and airborne players clear beams',()=>{
 const g=setup();g.save.data.unlocked=LEVEL_COUNT;g.start(3);const spring=g.view.springs[0];g.player.pos.copy(spring.mesh.position);g.player.ground=true;updateMechanics(g,0);assert.equal(g.player.velocity.y,10.5);assert.equal(g.player.ground,false);g.start(2);const w=g.view.level.features.wind[0],f=g.view.platforms[w.index];g.player.pos.set(f.x,f.y,f.z);assert.ok(windAt(g)>0);g.player.pos.x=100;assert.equal(windAt(g),0);g.start(4);const b=g.view.hazards[0];g.player.pos.set(b.mesh.position.x,b.y,b.mesh.position.z);g.player.invincible=0;updateMechanics(g,0);assert.equal(g.player.hearts,2);g.player.invincible=0;g.player.pos.y=b.y+.8;updateMechanics(g,0);assert.equal(g.player.hearts,2);g.view.dispose()
});
