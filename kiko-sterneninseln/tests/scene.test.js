import {cameraRelative} from '../src/controls.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {levels,worlds} from '../src/data.js';

const context={};vm.runInNewContext(readFileSync(new URL('../vendor/three.min.js',import.meta.url),'utf8'),context);
globalThis.window={THREE:context.THREE,__worlds:worlds};
const {Kiko,LevelView,Renderer}=await import('../src/scene.js');
const {Player}=await import('../src/physics.js');

test('all eight 3D worlds build with active objects and dispose cleanly',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 for(const l of levels){const view=new LevelView(renderer,l);view.root.traverse(o=>assert.ok([o.position.x,o.position.y,o.position.z].every(Number.isFinite),`${l.name}: invalid object coordinates`));assert.equal(view.platforms.length,5);assert.equal(view.crystals.length,5);assert.equal(view.stars.length,3);assert.ok(view.portal);view.update(1/60,true);view.portalActive(true);view.dispose();assert.equal(renderer.scene.children.length,0)}
});
test('Kiko lands, cannot double jump, and can cross the first gap',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};const view=new LevelView(renderer,levels[0]);const player=new Player(new Kiko);player.spawn([0,0,-1]);for(let i=0;i<30;i++)player.step(1/60,{x:0,z:0,jump:false},view.platforms,0);assert.equal(player.ground,true);player.step(1/60,{x:0,z:1,jump:true},view.platforms,0);const first=player.velocity.y;player.step(1/60,{x:0,z:1,jump:true},view.platforms,0);assert.ok(player.velocity.y<first);for(let i=0;i<75;i++)player.step(1/60,{x:0,z:1,jump:false},view.platforms,0);assert.ok(player.pos.z>3.5);assert.ok(player.pos.y>-4);view.dispose()
});
test('higher ledges block walking, allow a jump, and keep Kiko grounded after landing',()=>{
 const player=new Player(new Kiko),floors=[{x:0,z:0,w:6,d:6,y:0,active:true},{x:0,z:6,w:6,d:6,y:.7,active:true}];
 player.spawn([0,0,0]);for(let i=0;i<20;i++)player.step(1/60,{x:0,z:0,jump:false},floors,0);
 for(let i=0;i<70;i++)player.step(1/60,{x:0,z:1,jump:false},floors,0);
 assert.ok(player.pos.z<=2.69,`walked through raised ledge at ${player.pos.z}`);
 player.step(1/60,{x:0,z:1,jump:true},floors,0);
 for(let i=0;i<70;i++)player.step(1/60,{x:0,z:1,jump:false},floors,0);
 assert.ok(player.pos.z>4,`jump did not clear ledge at ${player.pos.z}`);
 assert.equal(player.pos.y,.7);assert.equal(player.ground,true);
 for(let i=0;i<90;i++)player.step(1/60,{x:0,z:0,jump:false},floors,0);
 assert.equal(player.pos.y,.7);assert.equal(player.ground,true);
});
test('all required crystals and portals sit over reachable floor surfaces',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 for(const l of levels){const view=new LevelView(renderer,l);for(const c of view.crystals){const p=c.mesh.position;assert.ok(view.platforms.some(f=>Math.abs(p.x-f.x)<f.w/2-.2&&Math.abs(p.z-f.z)<f.d/2-.2),`${l.name}: crystal outside island`)}const portal=view.portal.position;assert.ok(view.platforms.some(f=>Math.abs(portal.x-f.x)<f.w/2-1&&Math.abs(portal.z-f.z)<f.d/2-1),`${l.name}: portal outside island`);view.dispose()}
});
test('physics route reaches every level portal across all platform gaps',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 for(const l of levels){const view=new LevelView(renderer,l),player=new Player(new Kiko);player.spawn([l.path[0][0],l.path[0][4],l.path[0][1]-1]);for(let j=1;j<5;j++){let reached=false;for(let n=0;n<450;n++){const a=l.path[j-1],b=l.path[j],dx=b[0]-player.pos.x,dz=b[1]-player.pos.z,m=Math.max(1,Math.hypot(dx,dz));const jump=player.ground&&player.pos.z>a[1]+1.2&&player.pos.z<b[1]-1.2;view.update(1/60,true);player.step(1/60,{x:dx/m,z:dz/m,jump},view.platforms.filter(p=>p.active),l.world);if(Math.hypot(dx,dz)<.9&&player.ground){reached=true;break}if(player.pos.y<-9)break}assert.ok(reached,`${l.name}: platform ${j}`)}assert.ok(Math.abs(player.pos.z-l.portal[1])<4);view.dispose()}
});
test('sun meadow decoration and switch bridge have real 3D meshes and collision',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 const meadow=new LevelView(renderer,levels[0]);
 assert.ok(meadow.root.children.some(o=>o.isInstancedMesh&&o.count===12));
 meadow.dispose();
 const bridge=new LevelView(renderer,levels[1]);
 assert.equal(bridge.bridge.visible,false);
 assert.equal(bridge.bridgeFloor.active,false);
 bridge.setPuzzle(true);
 assert.equal(bridge.bridge.visible,true);
 assert.equal(bridge.bridgeFloor.active,true);
 bridge.dispose();
});
test('camera reset and view direction agree with camera relative movement',()=>{
 const camera=new context.THREE.PerspectiveCamera(60,1,0.1,100);
 for(const yaw of [0,Math.PI/2,Math.PI]){
  Renderer.prototype.snapFollow.call({camera},new context.THREE.Vector3(0,0,0),yaw);
  const forward=new context.THREE.Vector3();camera.getWorldDirection(forward);
  const flat=new context.THREE.Vector2(forward.x,forward.z).normalize();
  assert.ok(Math.abs(flat.x-Math.sin(yaw))<.001);
  assert.ok(Math.abs(flat.y-Math.cos(yaw))<.001);
  camera.updateMatrixWorld();const screenRight=new context.THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize(),move=cameraRelative(1,0,yaw);
  assert.ok(screenRight.x*move.x+screenRight.z*move.z>.999,'D / stick right must move towards the actual right side of the image');
 }
});
test('small meadow rocks block walking and can be jumped',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 const view=new LevelView(renderer,levels[0]),player=new Player(new Kiko);
 const rock=view.blockers[0];
 player.spawn([rock.x,rock.y,rock.z-1.4]);
 for(let i=0;i<25;i++)player.step(1/60,{x:0,z:0,jump:false},view.platforms,0,view.blockers);
 for(let i=0;i<35;i++)player.step(1/60,{x:0,z:1,jump:false},view.platforms,0,view.blockers);
 assert.ok(player.pos.z<rock.z-.6);
 player.step(1/60,{x:0,z:1,jump:true},view.platforms,0,view.blockers);
 for(let i=0;i<50;i++)player.step(1/60,{x:0,z:1,jump:false},view.platforms,0,view.blockers);
 assert.ok(player.pos.z>rock.z+.6);
 view.dispose();
});
test('seventh level has a reachable side route with a bonus star',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 const view=new LevelView(renderer,levels[6]);
 assert.equal(view.bonusFloors.length,2);
 assert.ok(view.stars.some(star=>Math.abs(star.mesh.position.x-5)<.01&&Math.abs(star.mesh.position.z-14)<.01));
 const main=view.platforms[2],side=view.bonusFloors[0];
 const gap=Math.max(0,Math.abs(main.x-side.x)-(main.w+side.w)/2);
 assert.ok(gap<2);
 view.dispose();
});
test('final level assembles an animated sky crystal',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 const view=new LevelView(renderer,levels[7]);
 view.startEnding();view.update(1/30,true);
 assert.equal(view.endingGroup.children.length,9);
 assert.ok(view.endingGroup.rotation.y>0);
 view.dispose();
});

test('standing is stable at low frame rates, jump buffer works and underside is solid',()=>{
 const floor={x:0,z:0,w:6,d:6,y:0,active:true};
 for(const dt of [1/15,1/30,1/60,1/120]){const player=new Player(new Kiko);player.spawn([0,0,0]);for(let i=0;i<120;i++)player.step(dt,{x:0,z:0},[floor],0);assert.equal(player.pos.y,0);assert.ok(player.ground)}
 const p=new Player(new Kiko);p.spawn([0,0,0]);p.pos.y=.06;p.velocity.y=-1;p.step(1/60,{x:0,z:0,jump:true},[floor],0);for(let i=0;i<10;i++)p.step(1/60,{x:0,z:0,jump:false},[floor],0);assert.ok(p.pos.y>.3,'buffered jump before landing was lost');
 p.spawn([0,0,0]);const ceiling={x:0,z:0,w:6,d:6,y:3.6,active:true};for(let i=0;i<10;i++)p.step(1/60,{x:0,z:0},[floor,ceiling],0);p.step(1/60,{x:0,z:0,jump:true},[floor,ceiling],0);let highest=0;for(let i=0;i<60;i++){p.step(1/60,{x:0,z:0},[floor,ceiling],0);highest=Math.max(highest,p.pos.y)}assert.ok(highest<=1.051,'jump passed through slab underside');
});
test('timed platform hides every solid mesh and moving pickups follow their floor',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};const view=new LevelView(renderer,levels[5]),moving=view.platforms[1],gem=view.crystals.find(c=>c.pathIndex===1),offset=gem.mesh.position.x-moving.x;view.update(7,true);const timed=view.platforms[3];assert.equal(timed.active,false);assert.equal(timed.under.visible,false);assert.equal(timed.tile.visible,false);assert.ok(Math.abs(gem.mesh.position.x-moving.x-offset)<1e-6);view.dispose();
});
